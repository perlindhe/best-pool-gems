/**
 * Server side of the Evidence-based Pool Score (evidence-v1).
 *
 * Collects guest pool comments, classifies them, reads the pool records and
 * approved external mentions, and computes the five factors through the pure
 * functions in src/lib/evidence-score.ts. Nothing here invents a number: every
 * factor that lacks evidence is stored as null.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  SCORE_VERSION,
  MIN_RELEVANT_COMMENTS,
  summarizeComments,
  scoreGuestSentiment,
  scoreHeating,
  countPools,
  scorePoolCount,
  scorePoolSize,
  scoreExternalRecognition,
  calculateConfidence,
  calculateTotal,
  evidenceQaErrors,
  commentHash,
  autoApprovalBlockers,
  isAutoApprover,
  AUTO_APPROVER,
  normalizeCommentText,
  toEvidenceCategory,
  type HeatingCategory,
  type PoolComment,
  type PoolCommentSentiment,
  type EvidencePool,
  type ExternalMention,
  type EvidenceVerificationStatus,
} from "@/lib/evidence-score";

export { EVIDENCE_TEST_GROUP, isEvidenceTestHotel } from "@/lib/evidence-score";
import { EVIDENCE_TEST_GROUP } from "@/lib/evidence-score";

const POOL_RE =
  /\bpool|rooftop|infinity|plunge|sun ?deck|poolside|swim|piscina|piscine|jacuzzi|hot tub\b/i;

/* ------------------------------------------------------------------ */
/* Collection                                                          */
/* ------------------------------------------------------------------ */

type RawReview = {
  source: string;
  text: string;
  author: string | null;
  url: string | null;
  publishedAt: string | null;
};

async function fetchTripadvisorReviews(locationId: string): Promise<RawReview[]> {
  const key = process.env.TRIPADVISOR_API_KEY;
  if (!key) return [];
  const url = `https://api.content.tripadvisor.com/api/v1/location/${encodeURIComponent(locationId)}/reviews?key=${encodeURIComponent(key)}&language=en`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const json = (await res.json()) as {
    data?: Array<{
      text?: string;
      url?: string;
      published_date?: string;
      user?: { username?: string };
    }>;
  };
  if (!res.ok) return [];
  return (json.data ?? [])
    .map((r) => ({
      source: "tripadvisor",
      text: (r.text ?? "").trim(),
      author: r.user?.username ?? null,
      url: r.url ?? null,
      publishedAt: r.published_date ? r.published_date.slice(0, 10) : null,
    }))
    .filter((r) => r.text.length > 20);
}

async function fetchGoogleReviews(placeId: string): Promise<RawReview[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    { headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "reviews,googleMapsUri" } },
  );
  const json = (await res.json()) as {
    googleMapsUri?: string;
    reviews?: Array<{
      text?: { text?: string };
      originalText?: { text?: string };
      publishTime?: string;
      authorAttribution?: { displayName?: string; uri?: string };
    }>;
  };
  if (!res.ok) return [];
  return (json.reviews ?? [])
    .map((r) => ({
      source: "google",
      text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
      author: r.authorAttribution?.displayName ?? null,
      url: r.authorAttribution?.uri ?? json.googleMapsUri ?? null,
      publishedAt: r.publishTime ? r.publishTime.slice(0, 10) : null,
    }))
    .filter((r) => r.text.length > 20);
}

async function firecrawlReviewPages(hotelName: string, city: string): Promise<RawReview[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  const queries = [
    `"${hotelName}" ${city} pool review`,
    `"${hotelName}" ${city} pool (site:reddit.com OR site:oyster.com OR site:thehotelguru.com)`,
  ];
  const out: RawReview[] = [];
  for (const query of queries) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          limit: 4,
          scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
        }),
      });
      const json = (await res.json()) as {
        data?: { web?: Array<{ url?: string; title?: string; markdown?: string }> };
      };
      if (!res.ok) continue;
      for (const r of json.data?.web ?? []) {
        const text = (r.markdown ?? "").trim();
        if (text.length < 80 || !POOL_RE.test(text)) continue;
        out.push({
          source: "web",
          text: text.slice(0, 4000),
          author: r.title ?? null,
          url: r.url ?? null,
          publishedAt: null,
        });
      }
    } catch {
      // A failed search is not evidence of anything — just skip it.
    }
  }
  return out;
}

type Classification = {
  idx: number;
  relevance: "pool" | "not_pool" | "unclear";
  sentiment: PoolCommentSentiment;
  is_owner_content: boolean;
};

/** Classifies each candidate comment: is it about the pool, and how does it read? */
async function classifyComments(
  hotelName: string,
  reviews: RawReview[],
): Promise<Classification[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!reviews.length) return [];

  const items = reviews.map((r, idx) => ({
    idx,
    source: r.source,
    text: r.text.slice(0, 1200),
  }));

  const instructions =
    "You classify guest comments about a hotel. For EACH item decide: " +
    "relevance = 'pool' only when the text says something about the swimming pool, pool area, pool deck, pool bar, pool view or the swimming experience; " +
    "'not_pool' when it is about the hotel in general; 'unclear' when you cannot tell. " +
    "sentiment = positive | neutral | negative about the POOL specifically, or 'unclear'/'irrelevant' when relevance is not 'pool'. " +
    "is_owner_content = true when the text reads as hotel marketing copy or an official description rather than a guest's own words. " +
    "Never guess: prefer 'unclear' over a made-up judgement. Return one object per input idx.";

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      instructions,
      input: `Hotel: ${hotelName}\n\nItems (json):\n${JSON.stringify(items)}`,
      reasoning: { effort: "low" },
      text: {
        format: {
          type: "json_schema",
          name: "classifications",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["items"],
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["idx", "relevance", "sentiment", "is_owner_content"],
                  properties: {
                    idx: { type: "number" },
                    relevance: { type: "string", enum: ["pool", "not_pool", "unclear"] },
                    sentiment: {
                      type: "string",
                      enum: ["positive", "neutral", "negative", "unclear", "irrelevant"],
                    },
                    is_owner_content: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text();
    throw new Error(`Lovable AI error [${res.status}]: ${body}`);
  }

  // Accumulate the streamed output text — a reasoning call must stream.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let output = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (evt.type === "response.output_text.delta" && evt.delta) output += evt.delta;
        else if (evt.type === "response.completed" && evt.response?.output_text)
          output = evt.response.output_text;
      } catch {
        // partial event; ignore
      }
    }
  }

  try {
    const parsed = JSON.parse(output) as { items?: Classification[] };
    return parsed.items ?? [];
  } catch {
    return [];
  }
}

/** Fetch, classify and store pool comments for one hotel. Manual runs only. */
export async function ingestPoolComments(hotelId: string) {
  const { data: hotel, error } = await supabaseAdmin
    .from("hotels")
    .select("id, name, city, slug")
    .eq("id", hotelId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!hotel) throw new Error("Hotel not found");

  const { data: mappings } = await supabaseAdmin
    .from("source_mappings")
    .select("source, source_place_id")
    .eq("hotel_id", hotelId)
    .eq("is_active", true);

  const google = mappings?.find((m) => m.source === "google")?.source_place_id ?? null;
  const ta = mappings?.find((m) => m.source === "tripadvisor")?.source_place_id ?? null;

  const [gReviews, tReviews, wReviews] = await Promise.all([
    google ? fetchGoogleReviews(google) : Promise.resolve([]),
    ta ? fetchTripadvisorReviews(ta) : Promise.resolve([]),
    firecrawlReviewPages(hotel.name, hotel.city),
  ]);

  const candidates = [...gReviews, ...tReviews, ...wReviews].filter((r) =>
    POOL_RE.test(r.text),
  );
  if (!candidates.length) {
    return { hotel: hotel.name, fetched: 0, stored: 0, duplicates: 0 };
  }

  const classifications = await classifyComments(hotel.name, candidates.slice(0, 40));
  const byIdx = new Map(classifications.map((c) => [c.idx, c]));

  let stored = 0;
  let duplicates = 0;
  for (let i = 0; i < Math.min(candidates.length, 40); i++) {
    const r = candidates[i]!;
    const c = byIdx.get(i);
    if (!c) continue;
    const row = {
      hotel_id: hotelId,
      source: r.source,
      source_url: r.url,
      author: r.author,
      published_at: r.publishedAt,
      raw_text: r.text.slice(0, 4000),
      normalized_text: normalizeCommentText(r.text).slice(0, 4000),
      text_hash: commentHash(r.text),
      stay_group_key: r.author ? `${r.source}:${r.author}` : null,
      is_owner_content: c.is_owner_content,
      relevance: c.relevance,
      sentiment: c.relevance === "pool" ? c.sentiment : "irrelevant",
    };
    const { error: insErr } = await supabaseAdmin
      .from("pool_comments")
      .insert(row as never);
    if (insErr) {
      if (insErr.code === "23505") duplicates += 1;
      continue;
    }
    stored += 1;
  }

  return { hotel: hotel.name, fetched: candidates.length, stored, duplicates };
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

type PoolRow = {
  id: string;
  pool_name: string | null;
  pool_category: string;
  shared_or_private: string | null;
  indoor: boolean | null;
  heating_state: string;
  season_state: string;
  heated_months: string | null;
  length_metres: number | null;
  area_sqm: number | null;
  size_verified: boolean | null;
};

function isSharedSwim(p: PoolRow): boolean {
  const cat = toEvidenceCategory(p.pool_category);
  return (
    (cat === "shared_swimming_pool" || cat === "shared_swim_up_pool") &&
    p.shared_or_private !== "private"
  );
}

/** Heating category from the pool records only — never from a manual field. */
export function deriveHeatingCategory(pools: PoolRow[]): HeatingCategory {
  if (!pools.length) return "not_confirmed";
  if (pools.some((p) => p.heating_state === "conflicting")) return "conflicting";

  const heated = pools.filter((p) => p.heating_state === "confirmed_heated");
  const shared = heated.filter(isSharedSwim);
  if (shared.length) {
    if (shared.some((p) => p.season_state === "year_round")) return "shared_year_round";
    if (shared.some((p) => p.season_state === "seasonal" && !p.heated_months))
      return "shared_full_season";
    if (shared.some((p) => p.heated_months)) return "shared_some_months";
    return "shared_full_season";
  }
  if (heated.some((p) => toEvidenceCategory(p.pool_category) === "spa_pool" || p.indoor === true))
    return "indoor_or_spa_only";
  if (heated.some((p) => toEvidenceCategory(p.pool_category) === "private_room_pool"))
    return "private_only";
  if (heated.length) return "indoor_or_spa_only";

  const relevant = pools.filter(isSharedSwim);
  if (relevant.length && relevant.every((p) => p.heating_state === "confirmed_not_heated"))
    return "none_heated";
  return "not_confirmed";
}

export type EvidenceReport = {
  hotelId: string;
  slug: string;
  name: string;
  comments: {
    total: number;
    relevant: number;
    positive: number;
    neutral: number;
    negative: number;
    duplicatesRemoved: number;
    stayCapped: number;
    ownerContentRemoved: number;
    recentShare: number;
    adjustedPositiveRatio: number | null;
  };
  heatingCategory: HeatingCategory;
  counts: ReturnType<typeof countPools>;
  largestAreaSqm: number | null;
  largestLengthMetres: number | null;
  mentions: Array<{ url: string; publication: string | null; tier: string | null; points: number }>;
  factors: {
    guestSentimentPoints: number | null;
    heatingPoints: number | null;
    poolCountPoints: number | null;
    poolSizePoints: number | null;
    externalRecognitionPoints: number | null;
  };
  totalPoints: number | null;
  scoreOutOfTen: number | null;
  confidenceLevel: "low" | "medium" | "high";
  verificationStatus: EvidenceVerificationStatus;
  qaErrors: string[];
  blockingReasons: string[];
  approvedBy: string | null;
  approvedAt: string | null;
  autoApproved: boolean;
  autoBlockers: string[];
  autoEligible: boolean;
  hasOfficialSource: boolean;
  independentSourceCount: number;
  scoreVersion: string;
};

const TIER_POINTS: Record<string, number> = { A: 5, B: 2, C: 1 };

/** Compute (but do not approve) the evidence score for one hotel. */
export async function buildEvidenceReport(hotelId: string): Promise<EvidenceReport> {
  const { data: hotel, error } = await supabaseAdmin
    .from("hotels")
    .select(
      "id, slug, name, official_url, website_url, primary_source_url, secondary_source_url, has_active_pool, pool_status, qa_blocked, last_verified_date",
    )
    .eq("id", hotelId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!hotel) throw new Error("Hotel not found");

  const [{ data: poolRows }, { data: commentRows }, { data: mentionRows }, { data: existing }] =
    await Promise.all([
      supabaseAdmin
        .from("hotel_pools")
        .select(
          "id, pool_name, pool_category, shared_or_private, indoor, heating_state, season_state, heated_months, length_metres, area_sqm, size_verified",
        )
        .eq("hotel_id", hotelId),
      supabaseAdmin.from("pool_comments").select("*").eq("hotel_id", hotelId),
      supabaseAdmin.from("external_mentions").select("*").eq("hotel_id", hotelId),
      supabaseAdmin
        .from("pool_scores_evidence")
        .select("approved_by, approved_at")
        .eq("hotel_id", hotelId)
        .maybeSingle(),
    ]);

  const pools = (poolRows ?? []) as unknown as PoolRow[];

  const comments: PoolComment[] = ((commentRows ?? []) as unknown as Array<Record<string, unknown>>)
    .filter((c) => (c.editor_relevance ?? c.relevance) === "pool")
    .filter((c) => !c.excluded_reason)
    .map((c) => ({
      id: String(c.id),
      source: c.source as string,
      sourceUrl: (c.source_url as string) ?? null,
      author: (c.author as string) ?? null,
      publishedAt: (c.published_at as string) ?? null,
      text: c.raw_text as string,
      sentiment: ((c.editor_sentiment ?? c.sentiment) as PoolCommentSentiment) ?? "unclear",
      isOwnerContent: Boolean(c.is_owner_content),
      stayGroupKey: (c.stay_group_key as string) ?? null,
    }));

  const breakdown = summarizeComments(comments);
  const guestSentimentPoints = scoreGuestSentiment(breakdown);
  const adjustedPositiveRatio =
    breakdown.relevant >= MIN_RELEVANT_COMMENTS
      ? Math.round(((breakdown.positive + 3.5) / (breakdown.relevant + 5)) * 1000) / 1000
      : null;

  const heatingCategory = deriveHeatingCategory(pools);
  const heatingPoints = scoreHeating(heatingCategory);

  const evidencePools: EvidencePool[] = pools.map((p) => ({
    id: p.id,
    name: p.pool_name,
    category: toEvidenceCategory(p.pool_category),
    areaSqm: p.area_sqm,
    lengthMetres: p.length_metres,
    sizeVerified: p.size_verified ?? false,
  }));
  const counts = countPools(evidencePools);
  const poolCountPoints = scorePoolCount(counts, pools.length > 0);
  const poolSizePoints = scorePoolSize(
    evidencePools.map((p) => ({ ...p, sizeVerified: p.sizeVerified === true })),
  );

  const mentions: ExternalMention[] = ((mentionRows ?? []) as unknown as Array<
    Record<string, unknown>
  >).map((m) => ({
    id: String(m.id),
    url: m.url as string,
    canonicalUrl: (m.canonical_url as string) ?? null,
    publication: (m.publication as string) ?? null,
    author: (m.author as string) ?? null,
    tier: (m.tier as "A" | "B" | "C") ?? null,
    isAboutPool: (m.is_about_pool as boolean) ?? null,
    isPositive: (m.is_positive as boolean) ?? null,
    excludedReason: (m.excluded_reason as string) ?? null,
    approved: m.approved_at != null,
  }));
  const externalRecognitionPoints = scoreExternalRecognition(mentions);

  const factors = {
    guestSentimentPoints,
    heatingPoints,
    poolCountPoints,
    poolSizePoints,
    externalRecognitionPoints,
  };
  const total = calculateTotal(factors);

  const hasOfficialSource = Boolean(hotel.official_url || hotel.primary_source_url);
  const independentSourceCount = [hotel.secondary_source_url].filter(Boolean).length +
    mentions.filter((m) => m.approved && !m.excludedReason).length;

  const sizeConfirmed = poolSizePoints != null;
  const heatingConfirmed = heatingPoints != null;
  const poolCountConfirmed = poolCountPoints != null;
  const hasConflicts = heatingCategory === "conflicting" || hotel.qa_blocked === true;

  const confidenceLevel = calculateConfidence({
    hasOfficialSource,
    independentSourceCount,
    relevantComments: breakdown.relevant,
    recentShare: breakdown.recentShare,
    heatingConfirmed,
    poolCountConfirmed,
    sizeConfirmed,
    hasConflicts,
    allFactorsNumeric: total.totalPoints != null,
  });

  const approvedBy = existing?.approved_by ?? null;
  const approvedAt = existing?.approved_at ?? null;

  let verificationStatus: EvidenceVerificationStatus;
  if (hotel.has_active_pool === false || hotel.pool_status === "no_pool")
    verificationStatus = "no_active_pool";
  else if (hasConflicts) verificationStatus = "conflicting_data";
  else if (counts.sharedSwimmingPoolCount === 0) verificationStatus = "research_pending";
  else if (
    total.totalPoints != null &&
    hasOfficialSource &&
    independentSourceCount >= 1 &&
    breakdown.relevant >= MIN_RELEVANT_COMMENTS &&
    approvedBy != null
  )
    verificationStatus = "fully_verified";
  else verificationStatus = "partially_verified";

  const qaErrors = evidenceQaErrors({
    ...factors,
    breakdown,
    counts,
    heatingCategory,
    totalPoints: total.totalPoints,
    scoreOutOfTen: total.scoreOutOfTen,
    hasOfficialSource,
    approvedBy,
  });

  const autoBlockers = autoApprovalBlockers({
    qaErrors,
    blockingReasons: total.blockingReasons,
    confidenceLevel,
    totalPoints: total.totalPoints,
    scoreOutOfTen: total.scoreOutOfTen,
    relevantComments: breakdown.relevant,
    independentSourceCount,
    hasOfficialSource,
    hasConflicts,
    qaBlocked: hotel.qa_blocked === true,
  });

  const areas = pools.filter(isSharedSwim).map((p) => Number(p.area_sqm)).filter((n) => n > 0);
  const lengths = pools
    .filter(isSharedSwim)
    .map((p) => Number(p.length_metres))
    .filter((n) => n > 0);

  return {
    hotelId,
    slug: hotel.slug,
    name: hotel.name,
    comments: {
      total: comments.length,
      relevant: breakdown.relevant,
      positive: breakdown.positive,
      neutral: breakdown.neutral,
      negative: breakdown.negative,
      duplicatesRemoved: breakdown.duplicatesRemoved,
      stayCapped: breakdown.stayCapped,
      ownerContentRemoved: breakdown.ownerContentRemoved,
      recentShare: Math.round(breakdown.recentShare * 100) / 100,
      adjustedPositiveRatio,
    },
    heatingCategory,
    counts,
    largestAreaSqm: areas.length ? Math.max(...areas) : null,
    largestLengthMetres: lengths.length ? Math.round(Math.max(...lengths) * 10) / 10 : null,
    mentions: mentions
      .filter((m) => !m.excludedReason && m.tier && m.isAboutPool && m.isPositive)
      .map((m) => ({
        url: m.url,
        publication: m.publication ?? null,
        tier: m.tier ?? null,
        points: m.tier ? (TIER_POINTS[m.tier] ?? 0) : 0,
      })),
    factors,
    totalPoints: total.totalPoints,
    scoreOutOfTen: total.scoreOutOfTen,
    confidenceLevel,
    verificationStatus,
    qaErrors,
    blockingReasons: total.blockingReasons,
    approvedBy,
    approvedAt,
    autoApproved: isAutoApprover(approvedBy),
    autoBlockers,
    autoEligible: autoBlockers.length === 0,
    hasOfficialSource,
    independentSourceCount,
    scoreVersion: SCORE_VERSION,
  };
}

/** Compute and persist. Publishing still requires an editor's approval. */
export async function saveEvidenceReport(hotelId: string) {
  const report = await buildEvidenceReport(hotelId);
  const { error } = await supabaseAdmin.from("pool_scores_evidence").upsert(
    {
      hotel_id: hotelId,
      guest_sentiment_points: report.factors.guestSentimentPoints,
      heating_points: report.factors.heatingPoints,
      pool_count_points: report.factors.poolCountPoints,
      pool_size_points: report.factors.poolSizePoints,
      external_recognition_points: report.factors.externalRecognitionPoints,
      total_points: report.totalPoints,
      score_out_of_ten: report.scoreOutOfTen,
      verification_status: report.verificationStatus,
      confidence_level: report.confidenceLevel,
      blocking_reasons: [...report.qaErrors, ...report.blockingReasons] as never,
      inputs: {
        comments: report.comments,
        counts: report.counts,
        heating_category: report.heatingCategory,
        largest_area_sqm: report.largestAreaSqm,
        largest_length_metres: report.largestLengthMetres,
        mentions: report.mentions,
      } as never,
      score_version: SCORE_VERSION,
      calculated_at: new Date().toISOString(),
    } as never,
    { onConflict: "hotel_id" },
  );
  if (error) throw new Error(error.message);
  return report;
}

/** Editor sign-off. Only an approved record may ever be shown or ranked. */
export async function setEvidenceApproval(
  hotelId: string,
  editor: string | null,
) {
  const { error } = await supabaseAdmin
    .from("pool_scores_evidence")
    .update({
      approved_by: editor,
      approved_at: editor ? new Date().toISOString() : null,
    } as never)
    .eq("hotel_id", hotelId);
  if (error) throw new Error(error.message);
  // Recompute so the stored status reflects the new approval.
  return saveEvidenceReport(hotelId);
}
