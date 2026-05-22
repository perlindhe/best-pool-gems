import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { computePoolScore } from "./scoring";

// ============================================================================
// EVIDENCE COLLECTION
// ----------------------------------------------------------------------------
// We assemble a packet of evidence for one hotel from three independent
// sources, in priority order:
//   1. Hotel's OWN website (Firecrawl search + scrape of pool/wellness pages)
//   2. Google Places amenities (structured signals)
//   3. Filtered review SENTENCES that actually mention a pool
//
// The AI then receives all three labelled and is required to attach a source
// tag + verbatim quote to every fact. Facts without a citation are dropped.
// ============================================================================

type ReviewItem = { source: string; rating: number | null; text: string };

async function fetchGoogleReviews(place_id: string) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY not configured");
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(place_id)}`,
    {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "id,displayName,rating,userRatingCount,reviews,editorialSummary,types,primaryType",
      },
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`Google [${res.status}]: ${JSON.stringify(json).slice(0, 300)}`);
  const reviews = (json.reviews ?? []) as Array<{
    rating?: number;
    text?: { text?: string };
    originalText?: { text?: string };
  }>;
  return {
    summary: (json.editorialSummary?.text as string | undefined) ?? "",
    types: (json.types ?? []) as string[],
    reviews: reviews
      .map((r) => ({
        rating: r.rating ?? null,
        text: (r.text?.text ?? r.originalText?.text ?? "").slice(0, 2000),
      }))
      .filter((r) => r.text),
  };
}

async function fetchTripadvisorReviews(location_id: string) {
  const key = process.env.TRIPADVISOR_API_KEY;
  if (!key) return { reviews: [] as Array<{ rating: number | null; text: string }> };
  const res = await fetch(
    `https://api.content.tripadvisor.com/api/v1/location/${encodeURIComponent(location_id)}/reviews?key=${encodeURIComponent(key)}&language=en`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return { reviews: [] };
  const json = await res.json();
  const data = (json.data ?? []) as Array<{ rating?: number; text?: string; title?: string }>;
  return {
    reviews: data.map((r) => ({
      rating: r.rating ?? null,
      text: `${r.title ? r.title + ". " : ""}${r.text ?? ""}`.slice(0, 2000),
    })),
  };
}

// ---------------- Google amenities snapshot ----------------
type GoogleAmenityFacts = {
  has_outdoor: boolean | null;
  has_indoor: boolean | null;
  is_heated: boolean | null;
  raw_types: string[];
};

function googleAmenityFacts(types: string[], summary: string): GoogleAmenityFacts {
  const t = types.map((x) => x.toLowerCase());
  const s = summary.toLowerCase();
  // Google Places exposes some pool signals via types and editorialSummary.
  // We only set TRUE when we have a clear signal. Never set FALSE here —
  // absence of signal is not evidence of absence.
  const outdoor =
    t.some((x) => /outdoor[_-]?pool/.test(x)) ||
    /\boutdoor pool\b|\brooftop pool\b|\binfinity pool\b/.test(s) ||
    null;
  const indoor =
    t.some((x) => /indoor[_-]?pool/.test(x)) ||
    /\bindoor pool\b/.test(s) ||
    null;
  const heated =
    /\bheated pool\b/.test(s) ||
    null;
  return { has_outdoor: outdoor || null, has_indoor: indoor || null, is_heated: heated || null, raw_types: types };
}

// ---------------- Hotel website (Firecrawl) ----------------
type WebsiteEvidence = {
  url: string;
  title: string;
  excerpts: string[]; // pool-relevant sentences only, capped
};

const POOL_SENTENCE_RE =
  /\b(pool|piscina|piscine|swimming|infinity[- ]edge|rooftop\b.*\bpool|indoor pool|outdoor pool|heated pool|jacuzzi|hot tub|plunge|lap pool|swim[- ]up|adults?[- ]only)\b/i;

function extractPoolSentences(markdown: string, limit = 12): string[] {
  if (!markdown) return [];
  // Split on sentence boundaries, also break on newlines so list items count.
  const parts = markdown
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+|\n+/g)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 12 && s.length <= 320);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const sentence of parts) {
    if (!POOL_SENTENCE_RE.test(sentence)) continue;
    const key = sentence.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(sentence);
    if (out.length >= limit) break;
  }
  return out;
}

async function fetchWebsiteEvidence(websiteUrl: string): Promise<WebsiteEvidence[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key || !websiteUrl) return [];
  const host = (() => {
    try {
      return new URL(websiteUrl).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();
  if (!host) return [];

  // 1) Search the hotel's own site for pool/wellness pages and scrape them.
  let pages: Array<{ url?: string; title?: string; markdown?: string; description?: string }> = [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `site:${host} (pool OR piscina OR piscine OR rooftop OR wellness OR spa)`,
        limit: 4,
        scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as {
        data?:
          | { web?: Array<{ url?: string; title?: string; markdown?: string; description?: string }> }
          | Array<{ url?: string; title?: string; markdown?: string; description?: string }>;
      };
      pages = Array.isArray(json.data) ? json.data : (json.data?.web ?? []);
    }
  } catch (e) {
    console.error("Firecrawl search failed:", e);
  }

  // 2) Always also scrape the homepage as a fallback signal.
  if (pages.length === 0) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          url: websiteUrl,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });
      if (res.ok) {
        const j = (await res.json()) as { data?: { markdown?: string; metadata?: { title?: string; sourceURL?: string } } };
        const md = j.data?.markdown;
        if (md) {
          pages = [{
            url: j.data?.metadata?.sourceURL ?? websiteUrl,
            title: j.data?.metadata?.title ?? "Hotel website",
            markdown: md,
          }];
        }
      }
    } catch (e) {
      console.error("Firecrawl homepage scrape failed:", e);
    }
  }

  const out: WebsiteEvidence[] = [];
  for (const p of pages) {
    const md = (p.markdown ?? "") + "\n" + (p.description ?? "");
    const excerpts = extractPoolSentences(md);
    if (excerpts.length === 0) continue;
    out.push({
      url: p.url ?? websiteUrl,
      title: (p.title ?? "").slice(0, 200) || "Hotel page",
      excerpts,
    });
  }
  return out.slice(0, 4);
}

// ---------------- Review sentence filter ----------------
// Strict per-sentence filter so a "the spa was lovely" comment does not
// become evidence about the pool's heating.
const STRICT_POOL_SENTENCE_RE =
  /\b(pool|piscina|piscine|swimming|infinity[- ]edge|rooftop\b.*\bpool|plunge|lap pool|swim[- ]up)\b/i;

function reviewPoolSentences(reviews: ReviewItem[], perReview = 3, totalCap = 40): Array<ReviewItem & { sentence: string }> {
  const out: Array<ReviewItem & { sentence: string }> = [];
  for (const r of reviews) {
    const parts = r.text
      .replace(/\r/g, "")
      .split(/(?<=[.!?])\s+|\n+/g)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s.length >= 12 && s.length <= 320);
    let kept = 0;
    for (const sentence of parts) {
      if (!STRICT_POOL_SENTENCE_RE.test(sentence)) continue;
      out.push({ ...r, sentence });
      kept++;
      if (kept >= perReview) break;
      if (out.length >= totalCap) break;
    }
    if (out.length >= totalCap) break;
  }
  return out;
}

// ============================================================================
// AI SCHEMA — per-pool array + per-fact source citation
// ============================================================================

const POOL_TYPES = ["outdoor", "indoor", "rooftop", "infinity", "plunge", "lap", "kids", "spa_pool", "jacuzzi"] as const;
const SOURCE_TAGS = ["website", "google", "reviews"] as const;

const PoolDescriptorSchema = {
  type: "object",
  properties: {
    name: { type: ["string", "null"], description: "Short label (e.g. 'Rooftop infinity pool', 'Spa indoor pool')" },
    type: { type: "string", enum: [...POOL_TYPES], description: "Primary category of this pool" },
    indoor: { type: ["boolean", "null"] },
    heated: { type: ["boolean", "null"], description: "Set true ONLY with explicit evidence; otherwise null" },
    length_m: { type: ["number", "null"], minimum: 3, maximum: 200 },
    adults_only: { type: ["boolean", "null"] },
    season: { type: ["string", "null"], description: "e.g. 'May–October' or null for year-round" },
    source: { type: "string", enum: [...SOURCE_TAGS], description: "Where this pool was confirmed" },
    quote: { type: "string", description: "Short verbatim phrase from the source supporting this pool's existence" },
  },
  required: ["name", "type", "indoor", "heated", "length_m", "adults_only", "season", "source", "quote"],
  additionalProperties: false,
};

const FactCitationSchema = {
  type: "object",
  properties: {
    source: { type: "string", enum: [...SOURCE_TAGS] },
    quote: { type: "string", description: "Short verbatim phrase (≤ 240 chars) from that source" },
  },
  required: ["source", "quote"],
  additionalProperties: false,
};

// Each cited fact has a value + a list of citations. Empty array means
// "no evidence" and the value MUST be null.
const CITED_BOOL_KEYS = [
  "is_rooftop", "is_infinity", "is_heated", "has_indoor", "has_outdoor",
  "is_saltwater", "has_kids_pool", "has_jacuzzi", "has_swim_up_bar",
  "has_cabanas", "has_poolside_food", "adults_only", "year_round",
] as const;

const CitedBoolSchema = {
  type: "object",
  properties: {
    value: { type: ["boolean", "null"] },
    citations: { type: "array", items: FactCitationSchema, maxItems: 5 },
  },
  required: ["value", "citations"],
  additionalProperties: false,
};

const CitedFactsProperties: Record<string, unknown> = {};
for (const k of CITED_BOOL_KEYS) CitedFactsProperties[k] = CitedBoolSchema;
CitedFactsProperties.pool_count = {
  type: "object",
  properties: {
    value: { type: ["integer", "null"], minimum: 1, maximum: 30 },
    citations: { type: "array", items: FactCitationSchema, maxItems: 5 },
  },
  required: ["value", "citations"],
  additionalProperties: false,
};
CitedFactsProperties.size_estimate = {
  type: "object",
  properties: {
    value: { type: ["string", "null"], enum: ["small", "medium", "large", "very_large", null] },
    citations: { type: "array", items: FactCitationSchema, maxItems: 3 },
  },
  required: ["value", "citations"],
  additionalProperties: false,
};
CitedFactsProperties.length_m = {
  type: "object",
  properties: {
    value: { type: ["number", "null"], minimum: 3, maximum: 200 },
    citations: { type: "array", items: FactCitationSchema, maxItems: 3 },
  },
  required: ["value", "citations"],
  additionalProperties: false,
};
CitedFactsProperties.view = {
  type: "object",
  properties: {
    value: { type: ["string", "null"] },
    citations: { type: "array", items: FactCitationSchema, maxItems: 3 },
  },
  required: ["value", "citations"],
  additionalProperties: false,
};
CitedFactsProperties.season = {
  type: "object",
  properties: {
    value: { type: ["string", "null"] },
    citations: { type: "array", items: FactCitationSchema, maxItems: 3 },
  },
  required: ["value", "citations"],
  additionalProperties: false,
};

const CitedFactsRequired = [
  ...CITED_BOOL_KEYS,
  "pool_count", "size_estimate", "length_m", "view", "season",
];

const AI_SYSTEM_PROMPT = `You are an expert hotel-pool reviewer for "Best Pool Hotels", a pool-first travel guide.

You will receive structured EVIDENCE about ONE hotel from up to three sources:
  [WEBSITE]  — quotes from the hotel's own website (highest trust)
  [GOOGLE]   — Google Places amenities and editorial summary
  [REVIEWS]  — guest-review SENTENCES that mention a pool

Your job has TWO parts.

PART A — SCORE the hotel pool on 5 dimensions, each 0–2 (one decimal allowed):
  1. vibe — views, greenery, atmosphere, light, music. Does the pool have a soul?
  2. lounging_space — loungers, cabanas, shade, deck size.
  3. service — pool bar, food service, towels, attendants.
  4. uniqueness — wow factor.
  5. pool_first_feel — is the pool a real highlight of the stay?
Scale: 0=absent, 0.5=poor, 1=ordinary, 1.5=good, 2=exceptional. Be conservative.

PART B — EXTRACT structured pool FACTS, with strict rules:
  • Hotels often have MULTIPLE pools (main + spa + kids + jacuzzi). Return one
    entry per distinct pool in the "pools" array, each with its own source quote.
  • For each top-level fact (heated, indoor, jacuzzi, etc.) return an object
    { value, citations: [{ source, quote }, ...] }.
  • If you have no direct quote supporting a fact, set value = null and
    citations = []. Do NOT guess. Better null than wrong.
  • Citations must be VERBATIM short phrases from the labelled evidence above.
    Do not paraphrase. Do not invent text. Do not cite a source that did not
    appear in the input.
  • Prefer WEBSITE over GOOGLE over REVIEWS when sources disagree.
  • "is_heated" is TRUE only if some source explicitly says "heated" /
    "uppvärmd" / "chauffée" / "climatizada". A review saying "the water was
    warm" is NOT evidence for heated.

Also infer:
  • pool_type (short editorial label, e.g. "Rooftop infinity")
  • best_time (e.g. "May–September, late afternoon")
  • editorial_notes: 2–4 sentences of confident editorial review prose.

Return everything via the rate_pool function.`;

const AiToolSchema = {
  type: "function" as const,
  function: {
    name: "rate_pool",
    description: "Return component scores, per-pool array, and cited pool facts.",
    parameters: {
      type: "object",
      properties: {
        vibe: { type: "number", minimum: 0, maximum: 2 },
        lounging_space: { type: "number", minimum: 0, maximum: 2 },
        service: { type: "number", minimum: 0, maximum: 2 },
        uniqueness: { type: "number", minimum: 0, maximum: 2 },
        pool_first_feel: { type: "number", minimum: 0, maximum: 2 },
        pool_type: { type: "string" },
        best_time: { type: "string" },
        editorial_notes: { type: "string" },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        reasoning: { type: "string" },
        pools: {
          type: "array",
          items: PoolDescriptorSchema,
          minItems: 0,
          maxItems: 8,
          description: "One entry per distinct pool you can confirm with a source quote.",
        },
        cited_facts: {
          type: "object",
          properties: CitedFactsProperties,
          required: CitedFactsRequired,
          additionalProperties: false,
        },
      },
      required: [
        "vibe", "lounging_space", "service", "uniqueness", "pool_first_feel",
        "pool_type", "best_time", "editorial_notes", "confidence", "reasoning",
        "pools", "cited_facts",
      ],
      additionalProperties: false,
    },
  },
};

// ============================================================================
// Aggregation: turn cited_facts + google amenities into a flat PoolFacts
// object with the same shape consumers expect, plus `pools` + `sources`.
// Confidence-gate happens here at the data layer.
// ============================================================================

type Citation = { source: typeof SOURCE_TAGS[number]; quote: string };
type CitedBool = { value: boolean | null; citations: Citation[] };
type CitedNum = { value: number | null; citations: Citation[] };
type CitedStr = { value: string | null; citations: Citation[] };

export type PoolDescriptor = {
  name: string | null;
  type: typeof POOL_TYPES[number];
  indoor: boolean | null;
  heated: boolean | null;
  length_m: number | null;
  adults_only: boolean | null;
  season: string | null;
  source: typeof SOURCE_TAGS[number];
  quote: string;
};

export type PoolFacts = {
  pool_count: number | null;
  is_rooftop: boolean | null;
  is_infinity: boolean | null;
  is_heated: boolean | null;
  has_indoor: boolean | null;
  has_outdoor: boolean | null;
  is_saltwater: boolean | null;
  has_kids_pool: boolean | null;
  has_jacuzzi: boolean | null;
  has_swim_up_bar: boolean | null;
  has_cabanas: boolean | null;
  has_poolside_food: boolean | null;
  adults_only: boolean | null;
  year_round: boolean | null;
  size_estimate: "small" | "medium" | "large" | "very_large" | null;
  length_m: number | null;
  view: string | null;
  season: string | null;
  // Extended:
  pools?: PoolDescriptor[];
  sources?: Record<string, Citation[]>;
};

/**
 * A fact is published only when at least one of:
 *   • a WEBSITE citation exists (primary source), OR
 *   • ≥ 2 independent source tags (e.g. google + reviews) agree.
 * Otherwise we set the value to null so the frontend hides it.
 */
function gateBool(
  fact: CitedBool | undefined,
  google: boolean | null = null,
): { value: boolean | null; citations: Citation[] } {
  const cites = fact?.citations ?? [];
  const merged: Citation[] = [...cites];
  if (google === true) {
    // Synthesise a citation for the google signal so we count it.
    if (!merged.some((c) => c.source === "google")) {
      merged.push({ source: "google", quote: "Google Places amenity signal" });
    }
  }
  const sources = new Set(merged.map((c) => c.source));
  const hasWebsite = sources.has("website");
  const enough = hasWebsite || sources.size >= 2;
  if (!enough) return { value: null, citations: merged };
  // Resolve value: prefer fact.value, fall back to google signal.
  const val = fact?.value ?? google;
  return { value: val ?? null, citations: merged };
}

function gateScalar<T>(fact: { value: T | null; citations: Citation[] } | undefined): { value: T | null; citations: Citation[] } {
  const cites = fact?.citations ?? [];
  const sources = new Set(cites.map((c) => c.source));
  const enough = sources.has("website") || sources.size >= 2;
  if (!enough) return { value: null, citations: cites };
  return { value: fact?.value ?? null, citations: cites };
}

// ============================================================================
// MAIN ENTRY
// ============================================================================
export async function autoScoreHotelById(hotel_id: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

  const [hotelRes, mapsRes] = await Promise.all([
    supabaseAdmin.from("hotels").select("name, city, country, neighborhood, website_url").eq("id", hotel_id).single(),
    supabaseAdmin
      .from("source_mappings")
      .select("source, source_place_id")
      .eq("hotel_id", hotel_id)
      .eq("is_active", true),
  ]);
  if (hotelRes.error) throw new Error(hotelRes.error.message);
  const hotel = hotelRes.data;

  const googleMap = (mapsRes.data ?? []).find((m) => m.source === "google");
  const taMap = (mapsRes.data ?? []).find((m) => m.source === "tripadvisor");

  // ---- 1. Hotel website (highest trust) ----
  const websiteEvidence = hotel.website_url
    ? await fetchWebsiteEvidence(hotel.website_url as string)
    : [];

  // ---- 2. Google amenities ----
  let googleSummary = "";
  let googleAmenities: GoogleAmenityFacts = { has_outdoor: null, has_indoor: null, is_heated: null, raw_types: [] };
  const allReviews: ReviewItem[] = [];

  if (googleMap?.source_place_id) {
    try {
      const g = await fetchGoogleReviews(googleMap.source_place_id);
      googleSummary = g.summary;
      googleAmenities = googleAmenityFacts(g.types, g.summary);
      allReviews.push(...g.reviews.map((r) => ({ source: "google", ...r })));
    } catch (e) {
      console.error("Google reviews fetch failed:", e);
    }
  }
  if (taMap?.source_place_id) {
    try {
      const t = await fetchTripadvisorReviews(taMap.source_place_id);
      allReviews.push(...t.reviews.map((r) => ({ source: "tripadvisor", ...r })));
    } catch (e) {
      console.error("TripAdvisor reviews fetch failed:", e);
    }
  }

  // ---- 3. Strict per-sentence review filter ----
  const reviewSentences = reviewPoolSentences(allReviews);

  // ---- Build labelled evidence packet ----
  const evidenceLines: string[] = [
    `HOTEL: ${hotel.name}`,
    `LOCATION: ${[hotel.neighborhood, hotel.city, hotel.country].filter(Boolean).join(", ")}`,
    hotel.website_url ? `WEBSITE URL: ${hotel.website_url}` : "",
    "",
  ];

  evidenceLines.push("---[WEBSITE]---");
  if (websiteEvidence.length === 0) {
    evidenceLines.push("(no pool-related sentences found on the hotel website)");
  } else {
    for (const page of websiteEvidence) {
      evidenceLines.push(`# ${page.title} — ${page.url}`);
      for (const s of page.excerpts) evidenceLines.push(`• ${s}`);
    }
  }
  evidenceLines.push("");

  evidenceLines.push("---[GOOGLE]---");
  if (googleSummary) evidenceLines.push(`Editorial summary: ${googleSummary}`);
  if (googleAmenities.raw_types.length) {
    evidenceLines.push(`Place types: ${googleAmenities.raw_types.join(", ")}`);
  }
  evidenceLines.push(
    `Amenity signals: outdoor=${googleAmenities.has_outdoor ?? "unknown"}, indoor=${googleAmenities.has_indoor ?? "unknown"}, heated=${googleAmenities.is_heated ?? "unknown"}`,
  );
  evidenceLines.push("");

  evidenceLines.push("---[REVIEWS]---");
  if (reviewSentences.length === 0) {
    evidenceLines.push("(no review sentences mentioning a pool)");
  } else {
    for (const r of reviewSentences) {
      evidenceLines.push(`(${r.source}, ${r.rating ?? "?"}★) ${r.sentence}`);
    }
  }

  const userPrompt = evidenceLines.filter(Boolean).join("\n");

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      tools: [AiToolSchema],
      tool_choice: { type: "function", function: { name: "rate_pool" } },
    }),
  });

  if (!aiRes.ok) {
    const txt = await aiRes.text();
    if (aiRes.status === 429) throw new Error("AI rate limit reached. Try again in a minute.");
    if (aiRes.status === 402) throw new Error("Lovable AI credits exhausted. Add credits in Settings → Workspace → Usage.");
    throw new Error(`AI gateway [${aiRes.status}]: ${txt.slice(0, 300)}`);
  }
  const aiJson = await aiRes.json();
  const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    throw new Error("AI did not return tool call");
  }
  const parsed = JSON.parse(toolCall.function.arguments) as {
    vibe: number;
    lounging_space: number;
    service: number;
    uniqueness: number;
    pool_first_feel: number;
    pool_type: string;
    best_time: string;
    editorial_notes: string;
    confidence: string;
    reasoning: string;
    pools: PoolDescriptor[];
    cited_facts: Record<string, CitedBool | CitedNum | CitedStr>;
  };

  const components = {
    vibe: parsed.vibe,
    lounging_space: parsed.lounging_space,
    service: parsed.service,
    uniqueness: parsed.uniqueness,
    pool_first_feel: parsed.pool_first_feel,
  };

  // ---- Apply confidence gate at the data layer ----
  const cf = parsed.cited_facts ?? {};
  const sources: Record<string, Citation[]> = {};
  const collect = <T,>(key: string, gated: { value: T | null; citations: Citation[] }) => {
    if (gated.citations.length) sources[key] = gated.citations;
    return gated.value;
  };

  const facts: PoolFacts = {
    pool_count: collect("pool_count", gateScalar(cf.pool_count as CitedNum)),
    is_rooftop: collect("is_rooftop", gateBool(cf.is_rooftop as CitedBool)),
    is_infinity: collect("is_infinity", gateBool(cf.is_infinity as CitedBool)),
    is_heated: collect("is_heated", gateBool(cf.is_heated as CitedBool, googleAmenities.is_heated)),
    has_indoor: collect("has_indoor", gateBool(cf.has_indoor as CitedBool, googleAmenities.has_indoor)),
    has_outdoor: collect("has_outdoor", gateBool(cf.has_outdoor as CitedBool, googleAmenities.has_outdoor)),
    is_saltwater: collect("is_saltwater", gateBool(cf.is_saltwater as CitedBool)),
    has_kids_pool: collect("has_kids_pool", gateBool(cf.has_kids_pool as CitedBool)),
    has_jacuzzi: collect("has_jacuzzi", gateBool(cf.has_jacuzzi as CitedBool)),
    has_swim_up_bar: collect("has_swim_up_bar", gateBool(cf.has_swim_up_bar as CitedBool)),
    has_cabanas: collect("has_cabanas", gateBool(cf.has_cabanas as CitedBool)),
    has_poolside_food: collect("has_poolside_food", gateBool(cf.has_poolside_food as CitedBool)),
    adults_only: collect("adults_only", gateBool(cf.adults_only as CitedBool)),
    year_round: collect("year_round", gateBool(cf.year_round as CitedBool)),
    size_estimate: collect("size_estimate", gateScalar(cf.size_estimate as CitedStr)) as PoolFacts["size_estimate"],
    length_m: collect("length_m", gateScalar(cf.length_m as CitedNum)),
    view: collect("view", gateScalar(cf.view as CitedStr)),
    season: collect("season", gateScalar(cf.season as CitedStr)),
    pools: parsed.pools ?? [],
    sources,
  };

  return {
    components,
    pool_type: parsed.pool_type,
    best_time: parsed.best_time,
    editorial_notes: parsed.editorial_notes,
    confidence: parsed.confidence,
    reasoning: parsed.reasoning,
    facts,
    reviews_analyzed: reviewSentences.length,
    website_pages_used: websiteEvidence.length,
    pool_score_0_10: computePoolScore(components),
  };
}
