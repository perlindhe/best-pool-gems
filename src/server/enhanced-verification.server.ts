import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Enhanced verification pass for hotels that were skipped by the basic
 * editorial writer because the official website contained too little pool
 * evidence.
 *
 * It gathers more signals — Google Places amenities, Tripadvisor details,
 * general web search — and asks the AI to:
 *   1. Extract structured pool facts (only when a source clearly supports them)
 *   2. Write specific, source-grounded editorial prose
 *   3. Recommend a verification status
 *
 * Facts are only written when evidence is explicit. Unknown values stay null.
 */

type EvidencePage = { url: string; title: string; source: string; excerpts: string[] };

const POOL_SENTENCE_RE =
  /\b(pool|piscina|piscine|swimming|infinity[- ]edge|rooftop|indoor pool|outdoor pool|heated|jacuzzi|hot tub|plunge|lap pool|swim[- ]up|sun ?lounger|deck ?chair|cabana|adults?[- ]only|day pass|seasonal|year[- ]round|pool bar|wellness|spa)\b/i;

function extractSentences(markdown: string, limit = 20): string[] {
  if (!markdown) return [];
  const parts = markdown
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+|\n+/g)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 12 && s.length <= 360);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of parts) {
    if (!POOL_SENTENCE_RE.test(s)) continue;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

async function firecrawlSearch(query: string, limit = 5): Promise<EvidencePage[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        limit,
        scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      }),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?:
        | { web?: Array<{ url?: string; title?: string; markdown?: string; description?: string }> }
        | Array<{ url?: string; title?: string; markdown?: string; description?: string }>;
    };
    const list = Array.isArray(json.data) ? json.data : (json.data?.web ?? []);
    const out: EvidencePage[] = [];
    for (const p of list) {
      const md = (p.markdown ?? "") + "\n" + (p.description ?? "");
      const excerpts = extractSentences(md);
      if (excerpts.length === 0) continue;
      out.push({
        url: p.url ?? "",
        title: (p.title ?? "Page").slice(0, 200),
        source: "web",
        excerpts,
      });
    }
    return out.slice(0, limit);
  } catch (e) {
    console.error("Firecrawl search failed:", e);
    return [];
  }
}

async function fetchOfficialSiteEvidence(websiteUrl: string): Promise<EvidencePage[]> {
  if (!websiteUrl) return [];
  let host: string | null = null;
  try {
    host = new URL(websiteUrl).hostname.replace(/^www\./, "");
  } catch {
    return [];
  }
  const pages = await firecrawlSearch(
    `site:${host} (pool OR piscina OR piscine OR rooftop OR wellness OR spa OR "swimming pool")`,
    4,
  );
  return pages.map((p) => ({ ...p, source: "official_site" }));
}

async function fetchGeneralWebEvidence(name: string, city: string): Promise<EvidencePage[]> {
  return firecrawlSearch(
    `${name} ${city} swimming pool rooftop indoor outdoor heated review`,
    5,
  );
}

async function fetchGooglePlacesEvidence(hotelId: string): Promise<EvidencePage[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];
  const { data: mappings } = await supabaseAdmin
    .from("source_mappings")
    .select("source_place_id")
    .eq("hotel_id", hotelId)
    .eq("source", "google")
    .eq("is_active", true)
    .limit(1);
  const placeId = mappings?.[0]?.source_place_id;
  if (!placeId) return [];
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "id,displayName,types,primaryType,editorialSummary,regularOpeningHours,websiteUri,googleMapsUri",
      },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      displayName?: { text?: string };
      types?: string[];
      primaryType?: string;
      editorialSummary?: { text?: string };
      regularOpeningHours?: { weekdayDescriptions?: string[] };
      websiteUri?: string;
      googleMapsUri?: string;
    };
    const snippets: string[] = [];
    if (json.types?.length) snippets.push(`Google types: ${json.types.join(", ")}.`);
    if (json.primaryType) snippets.push(`Primary type: ${json.primaryType}.`);
    if (json.editorialSummary?.text) snippets.push(json.editorialSummary.text);
    if (json.regularOpeningHours?.weekdayDescriptions?.length) {
      snippets.push(`Opening hours: ${json.regularOpeningHours.weekdayDescriptions.join("; ")}.`);
    }
    if (snippets.length === 0) return [];
    return [{
      url: json.websiteUri ?? json.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      title: json.displayName?.text ?? "Google Places",
      source: "google_places",
      excerpts: extractSentences(snippets.join("\n")),
    }];
  } catch (e) {
    console.error("Google Places fetch failed:", e);
    return [];
  }
}

async function fetchTripadvisorEvidence(hotelId: string): Promise<EvidencePage[]> {
  const key = process.env.TRIPADVISOR_API_KEY;
  if (!key) return [];
  const { data: mappings } = await supabaseAdmin
    .from("source_mappings")
    .select("source_url")
    .eq("hotel_id", hotelId)
    .eq("source", "tripadvisor")
    .eq("is_active", true)
    .limit(1);
  const sourceUrl = mappings?.[0]?.source_url as string | null;
  if (!sourceUrl) return [];
  const locationId = (sourceUrl.match(/-(d\d+)\.html/) ?? sourceUrl.match(/Location_Review-g\d+-d(\d+)/))?.[1];
  if (!locationId) return [];
  try {
    const res = await fetch(
      `https://api.content.tripadvisor.com/api/v1/location/${encodeURIComponent(locationId)}/details?key=${encodeURIComponent(key)}&language=en&currency=USD`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      description?: string;
      amenities?: string[];
      web_url?: string;
      name?: string;
    };
    const snippets: string[] = [];
    if (json.description) snippets.push(json.description);
    const poolAmenities = (json.amenities ?? []).filter((a) => /pool/i.test(a));
    if (poolAmenities.length) snippets.push(`Amenities: ${poolAmenities.join(", ")}.`);
    if (snippets.length === 0) return [];
    return [{
      url: json.web_url ?? `https://www.tripadvisor.com/${locationId}`,
      title: json.name ?? "Tripadvisor",
      source: "tripadvisor",
      excerpts: extractSentences(snippets.join("\n")),
    }];
  } catch (e) {
    console.error("Tripadvisor fetch failed:", e);
    return [];
  }
}

const SYSTEM_PROMPT = `You are the senior pool editor of "Best Pool Hotels".

You receive VERIFIED DATABASE FACTS about one hotel plus evidence excerpts from
its official website, Google Places, Tripadvisor, and general web search.

Your job:
1. Extract structured pool facts ONLY when a source explicitly states them.
   If no source mentions a fact, return null for that field. Never guess.
2. Write short, specific editorial copy for this ONE hotel.

Rules:
  • Use ONLY the facts and excerpts you are given. Never invent sizes, hours,
    prices, heating months, lounger counts, pool counts, or day-pass rules.
  • Null is always better than a vague guess. Do not write "probably" or "likely".
  • No generic filler that could describe any hotel ("a relaxing oasis",
    "perfect for unwinding"). Every sentence must contain a concrete detail
    that came from the input.
  • British-neutral English, no marketing exclamation, no emojis.
  • For boolean fields, return true/false/null. A value is true only if a
    source explicitly confirms it. Absence of evidence = null, not false.

Return via the update_hotel function with these fields:
  pool_count          — integer number of pools, or null if unknown
  indoor              — true if there is an indoor pool
  outdoor             — true if there is an outdoor pool
  rooftop             — true if any pool is on a rooftop
  infinity            — true if any pool has an infinity edge
  heated_pool         — true if any pool is heated
  year_round          — true if a pool is open year-round
  season              — short season phrase, e.g. "May to October", or null
  children_allowed    — true if children are explicitly allowed
  adults_only         — true if the pool is explicitly adults-only
  guest_only          — true if pool is for hotel guests only
  day_pass_available  — true if day passes are explicitly sold
  pool_opening_hours  — short hours phrase, e.g. "09:00–20:00", or null
  pool_view           — short view phrase, e.g. "sea", "city", "garden", or null
  why_included        — 3–5 sentences: what makes THIS pool distinctive, size if known,
                        swimming vs lounging, view, sun situation.
  why_not_higher      — 1–3 sentences naming concrete drawbacks.
  view_description    — one short phrase about the view.
  pool_size           — short factual phrase about size, e.g. "About 20 m lap pool".
  lounging_space      — short phrase about loungers/deck/cabanas.
  best_time_to_visit  — e.g. "Late May to September, mornings before 11:00".
  vibe                — 2–4 words, e.g. "Quiet, design-led".
  best_for            — one sentence: traveller type this pool suits best.
  source_summary      — 1–2 sentences describing which sources confirmed what key facts.`;

const ToolSchema = {
  type: "function" as const,
  function: {
    name: "update_hotel",
    description: "Extracted pool facts and editorial copy for one hotel, grounded strictly in supplied evidence.",
    parameters: {
      type: "object",
      properties: {
        pool_count: { type: ["integer", "null"] },
        indoor: { type: ["boolean", "null"] },
        outdoor: { type: ["boolean", "null"] },
        rooftop: { type: ["boolean", "null"] },
        infinity: { type: ["boolean", "null"] },
        heated_pool: { type: ["boolean", "null"] },
        year_round: { type: ["boolean", "null"] },
        season: { type: ["string", "null"] },
        children_allowed: { type: ["boolean", "null"] },
        adults_only: { type: ["boolean", "null"] },
        guest_only: { type: ["boolean", "null"] },
        day_pass_available: { type: ["boolean", "null"] },
        pool_opening_hours: { type: ["string", "null"] },
        pool_view: { type: ["string", "null"] },
        why_included: { type: ["string", "null"] },
        why_not_higher: { type: ["string", "null"] },
        view_description: { type: ["string", "null"] },
        pool_size: { type: ["string", "null"] },
        lounging_space: { type: ["string", "null"] },
        best_time_to_visit: { type: ["string", "null"] },
        vibe: { type: ["string", "null"] },
        best_for: { type: ["string", "null"] },
        source_summary: { type: ["string", "null"] },
      },
      required: [
        "pool_count", "indoor", "outdoor", "rooftop", "infinity", "heated_pool",
        "year_round", "season", "children_allowed", "adults_only", "guest_only",
        "day_pass_available", "pool_opening_hours", "pool_view", "why_included",
        "why_not_higher", "view_description", "pool_size", "lounging_space",
        "best_time_to_visit", "vibe", "best_for", "source_summary",
      ],
      additionalProperties: false,
    },
  },
};

export type EnhancedResult = {
  slug: string;
  status: "verified" | "partially_verified" | "skipped" | "error";
  reason?: string;
  sources_used: string[];
};

function factLines(h: Record<string, unknown>): string[] {
  const yn = (v: unknown) => (v === true ? "yes" : v === false ? "no" : "not confirmed");
  return [
    `Pools on property: ${h.pool_count ?? "not confirmed"}`,
    `Pool type: ${h.pool_type ?? "not confirmed"}`,
    `Indoor pool: ${yn(h.indoor)}`,
    `Outdoor pool: ${yn(h.outdoor)}`,
    `Rooftop: ${yn(h.rooftop)}`,
    `Infinity edge: ${yn(h.infinity)}`,
    `Heated: ${yn(h.heated_pool)}`,
    `Open year-round: ${yn(h.year_round)}`,
    `Season: ${h.season ?? "not confirmed"}`,
    `Children allowed: ${yn(h.children_allowed)}`,
    `Adults only: ${yn(h.adults_only)}`,
    `Guests only: ${yn(h.guest_only)}`,
    `Day pass for outside visitors: ${yn(h.day_pass_available)}`,
    `Opening hours: ${h.pool_opening_hours ?? "not confirmed"}`,
    `Pool view: ${h.pool_view ?? "not confirmed"}`,
  ];
}

function clean<T>(v: T | null | undefined): T | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "string") {
    const s = v.trim();
    return (s.length ? s : null) as T;
  }
  return v;
}

export async function runEnhancedVerification(hotelId: string): Promise<EnhancedResult> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

  const { data: hotel, error } = await supabaseAdmin
    .from("hotels")
    .select(
      "id, slug, name, city, country, neighborhood, website_url, official_url, primary_source_url, secondary_source_url, pool_count, pool_type, indoor, outdoor, rooftop, infinity, heated_pool, year_round, season, children_allowed, adults_only, guest_only, day_pass_available, pool_opening_hours, pool_view, why_included, why_not_higher, view_description, pool_size, lounging_space, best_time_to_visit, vibe, verification_status, verification_notes",
    )
    .eq("id", hotelId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!hotel) return { slug: hotelId, status: "error", reason: "not found", sources_used: [] };

  const site = (hotel.official_url as string | null) ?? (hotel.website_url as string | null);

  // Gather evidence in parallel.
  const [official, google, tripadvisor, web] = await Promise.all([
    fetchOfficialSiteEvidence(site ?? ""),
    fetchGooglePlacesEvidence(hotelId),
    fetchTripadvisorEvidence(hotelId),
    fetchGeneralWebEvidence(hotel.name as string, hotel.city as string),
  ]);

  const evidence = [...official, ...google, ...tripadvisor, ...web];
  const sourcesUsed = Array.from(new Set(evidence.map((e) => e.source)));

  if (evidence.length === 0) {
    return {
      slug: hotel.slug as string,
      status: "skipped",
      reason: "no pool evidence found in any source",
      sources_used: sourcesUsed,
    };
  }

  const { data: quotes } = await supabaseAdmin
    .from("pool_quotes")
    .select("quote, source, source_url")
    .eq("hotel_id", hotelId)
    .limit(12);

  const lines: string[] = [
    `HOTEL: ${hotel.name}`,
    `LOCATION: ${[hotel.neighborhood, hotel.city, hotel.country].filter(Boolean).join(", ")}`,
    "",
    "---[EXISTING DATABASE FACTS]---",
    ...factLines(hotel as Record<string, unknown>),
    "",
    "---[EVIDENCE EXCERPTS]---",
  ];
  for (const e of evidence) {
    lines.push(`# ${e.title} [${e.source}] — ${e.url}`);
    for (const s of e.excerpts) lines.push(`• ${s}`);
  }
  lines.push("", "---[GUEST REVIEW SENTENCES]---");
  if (!quotes?.length) lines.push("(none)");
  else for (const q of quotes) lines.push(`(${q.source}) ${q.quote}`);

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: lines.join("\n") },
      ],
      tools: [ToolSchema],
      tool_choice: { type: "function", function: { name: "update_hotel" } },
    }),
  });
  if (!aiRes.ok) {
    const txt = await aiRes.text();
    if (aiRes.status === 429) throw new Error("AI rate limit reached. Try again in a minute.");
    if (aiRes.status === 402) throw new Error("Lovable AI credits exhausted.");
    throw new Error(`AI gateway [${aiRes.status}]: ${txt.slice(0, 200)}`);
  }
  const aiJson = await aiRes.json();
  const args = aiJson.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) {
    return {
      slug: hotel.slug as string,
      status: "skipped",
      reason: "no AI output",
      sources_used: sourcesUsed,
    };
  }
  const parsed = JSON.parse(args) as Record<string, unknown>;

  const whyIncluded = clean(parsed.why_included as string | null);
  if (!whyIncluded || whyIncluded.length < 120) {
    return {
      slug: hotel.slug as string,
      status: "skipped",
      reason: "not enough evidence for editorial text",
      sources_used: sourcesUsed,
    };
  }

  // Merge AI-extracted facts with existing facts, preserving existing values
  // when the AI returned null (i.e. no new evidence).
  const mergeBool = (existing: unknown, extracted: unknown) =>
    extracted === true || extracted === false ? extracted : clean(existing as boolean | null);
  const mergeInt = (existing: unknown, extracted: unknown) =>
    typeof extracted === "number" && Number.isInteger(extracted) && extracted >= 0
      ? extracted
      : clean(existing as number | null);
  const mergeStr = (existing: unknown, extracted: unknown) =>
    clean((extracted as string | null) ?? (existing as string | null));

  const update: Record<string, unknown> = {
    pool_count: mergeInt(hotel.pool_count, parsed.pool_count),
    indoor: mergeBool(hotel.indoor, parsed.indoor),
    outdoor: mergeBool(hotel.outdoor, parsed.outdoor),
    rooftop: mergeBool(hotel.rooftop, parsed.rooftop),
    infinity: mergeBool(hotel.infinity, parsed.infinity),
    heated_pool: mergeBool(hotel.heated_pool, parsed.heated_pool),
    year_round: mergeBool(hotel.year_round, parsed.year_round),
    season: mergeStr(hotel.season, parsed.season),
    children_allowed: mergeBool(hotel.children_allowed, parsed.children_allowed),
    adults_only: mergeBool(hotel.adults_only, parsed.adults_only),
    guest_only: mergeBool(hotel.guest_only, parsed.guest_only),
    day_pass_available: mergeBool(hotel.day_pass_available, parsed.day_pass_available),
    pool_opening_hours: mergeStr(hotel.pool_opening_hours, parsed.pool_opening_hours),
    pool_view: mergeStr(hotel.pool_view, parsed.pool_view),
    why_included: whyIncluded,
    why_not_higher: mergeStr(hotel.why_not_higher, parsed.why_not_higher),
    view_description: mergeStr(hotel.view_description, parsed.view_description),
    pool_size: mergeStr(hotel.pool_size, parsed.pool_size),
    lounging_space: mergeStr(hotel.lounging_space, parsed.lounging_space),
    best_time_to_visit: mergeStr(hotel.best_time_to_visit, parsed.best_time_to_visit),
    vibe: mergeStr(hotel.vibe, parsed.vibe),
    verification_notes: mergeStr(hotel.verification_notes, parsed.source_summary ?? parsed.best_for),
  };

  // Determine sources for URLs.
  const officialUrl = official[0]?.url ?? site ?? null;
  const secondaryUrl =
    hotel.secondary_source_url ??
    google[0]?.url ??
    tripadvisor[0]?.url ??
    web.find((w) => w.url)?.url ??
    (quotes ?? []).find((q) => q.source_url)?.source_url ??
    null;

  const primary = (hotel.primary_source_url as string | null) ?? officialUrl;
  const secondary = secondaryUrl as string | null;

  // Verification decision.
  const coreFactsKnown =
    update.pool_count != null &&
    update.heated_pool != null &&
    (update.indoor === true || update.outdoor === true);

  const hasOfficialEvidence = official.length > 0 || !!hotel.primary_source_url;
  const hasIndependentEvidence = google.length > 0 || tripadvisor.length > 0 || web.length > 0;

  const verification_status: "verified" | "partially_verified" =
    coreFactsKnown && hasOfficialEvidence && hasIndependentEvidence && !!primary && !!secondary
      ? "verified"
      : "partially_verified";

  update.primary_source_url = primary;
  update.secondary_source_url = secondary;
  update.verification_status = verification_status;
  update.verification_method = verification_status === "verified" ? "multiple_sources" : "research_pending";
  update.verified_by = "Best Pool Hotels enhanced verification";
  update.last_verified_date = new Date().toISOString().slice(0, 10);
  update.editorial_status = "published";

  const { error: upErr } = await supabaseAdmin.from("hotels").update(update as never).eq("id", hotelId);
  if (upErr) throw new Error(upErr.message);

  return {
    slug: hotel.slug as string,
    status: verification_status,
    sources_used: sourcesUsed,
  };
}
