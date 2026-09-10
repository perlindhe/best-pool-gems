import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Editorial + verification pass.
 *
 * For one hotel it:
 *   1. Re-reads the hotel's OWN website (Firecrawl) for pool evidence.
 *   2. Sends the canonical DB facts + website evidence to the AI and asks for
 *      unique, fact-grounded editorial prose (never generic filler, never
 *      invented facts — unknown answers must come back as null).
 *   3. Writes the prose to hotels.* and updates the verification state:
 *        verified            = official website evidence + a second independent
 *                              source + the core pool facts are all known
 *        partially_verified  = otherwise
 *      last_verified_date is stamped with the date of THIS check.
 */

type WebsitePage = { url: string; title: string; excerpts: string[] };

const POOL_SENTENCE_RE =
  /\b(pool|piscina|piscine|swimming|infinity[- ]edge|rooftop|indoor pool|outdoor pool|heated|jacuzzi|hot tub|plunge|lap pool|swim[- ]up|sun ?lounger|deck ?chair|cabana|adults?[- ]only|day pass)\b/i;

function extractSentences(markdown: string, limit = 16): string[] {
  if (!markdown) return [];
  const parts = markdown
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+|\n+/g)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 12 && s.length <= 320);
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

async function fetchWebsiteEvidence(websiteUrl: string): Promise<WebsitePage[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key || !websiteUrl) return [];
  let host: string | null = null;
  try {
    host = new URL(websiteUrl).hostname.replace(/^www\./, "");
  } catch {
    return [];
  }

  let pages: Array<{ url?: string; title?: string; markdown?: string; description?: string }> = [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
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

  const out: WebsitePage[] = [];
  for (const p of pages) {
    const md = (p.markdown ?? "") + "\n" + (p.description ?? "");
    const excerpts = extractSentences(md);
    if (excerpts.length === 0) continue;
    out.push({
      url: p.url ?? websiteUrl,
      title: (p.title ?? "Hotel page").slice(0, 200),
      excerpts,
    });
  }
  return out.slice(0, 4);
}

const SYSTEM_PROMPT = `You are the senior editor of "Best Pool Hotels", a pool-first hotel guide.

You receive VERIFIED DATABASE FACTS about one hotel plus verbatim excerpts from
the hotel's own website and, when available, pool-specific guest-review
sentences.

Write short, specific editorial copy for this ONE hotel. Rules:
  • Use ONLY the facts you are given. Never invent sizes, hours, prices,
    heating months, lounger counts or day-pass rules.
  • If something is not in the input, return null for that field. Null is
    always better than a vague guess. Do not write "probably" or "likely".
  • No generic filler that could describe any hotel ("a relaxing oasis",
    "perfect for unwinding"). Every sentence must contain a concrete detail
    that came from the input.
  • Never repeat review wording verbatim; summarise instead.
  • British-neutral English, no marketing exclamation, no emojis.

Fields:
  why_included       — 3–5 sentences: what makes THIS pool distinctive, roughly
                       how big it is if known, whether it suits real swimming or
                       mainly lounging, the view, and the sun situation if known.
  why_not_higher     — 1–3 sentences naming the pool's concrete drawbacks
                       (size, crowding, shade, noise, seasonality, access).
  view_description   — one short phrase, e.g. "Rooftop view over the Gothic Quarter".
  pool_size          — short factual phrase, e.g. "About 20 m lap pool".
  lounging_space     — short phrase about loungers/deck/cabanas.
  best_time_to_visit — e.g. "Late May to September, mornings before 11:00".
  vibe               — 2–4 words, e.g. "Quiet, design-led".
  best_for           — the traveller type this pool suits best, one sentence.

Return via the write_editorial function.`;

const ToolSchema = {
  type: "function" as const,
  function: {
    name: "write_editorial",
    description: "Editorial copy for one hotel pool, grounded strictly in the supplied evidence.",
    parameters: {
      type: "object",
      properties: {
        why_included: { type: ["string", "null"] },
        why_not_higher: { type: ["string", "null"] },
        view_description: { type: ["string", "null"] },
        pool_size: { type: ["string", "null"] },
        lounging_space: { type: ["string", "null"] },
        best_time_to_visit: { type: ["string", "null"] },
        vibe: { type: ["string", "null"] },
        best_for: { type: ["string", "null"] },
      },
      required: [
        "why_included",
        "why_not_higher",
        "view_description",
        "pool_size",
        "lounging_space",
        "best_time_to_visit",
        "vibe",
        "best_for",
      ],
      additionalProperties: false,
    },
  },
};

export type EditorialResult = {
  slug: string;
  status: "written" | "skipped" | "error";
  verification_status?: string;
  reason?: string;
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

export async function writeHotelEditorial(hotelId: string): Promise<EditorialResult> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

  const { data: hotel, error } = await supabaseAdmin
    .from("hotels")
    .select(
      "id, slug, name, city, country, neighborhood, website_url, official_url, primary_source_url, secondary_source_url, pool_count, pool_type, indoor, outdoor, rooftop, infinity, heated_pool, year_round, season, children_allowed, adults_only, guest_only, day_pass_available, pool_opening_hours, pool_view",
    )
    .eq("id", hotelId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!hotel) return { slug: hotelId, status: "error", reason: "not found" };

  const site = (hotel.official_url as string | null) ?? (hotel.website_url as string | null);
  const websiteEvidence = site ? await fetchWebsiteEvidence(site) : [];

  const { data: quotes } = await supabaseAdmin
    .from("pool_quotes")
    .select("quote, source, source_url")
    .eq("hotel_id", hotelId)
    .limit(12);

  const lines: string[] = [
    `HOTEL: ${hotel.name}`,
    `LOCATION: ${[hotel.neighborhood, hotel.city, hotel.country].filter(Boolean).join(", ")}`,
    "",
    "---[VERIFIED DATABASE FACTS]---",
    ...factLines(hotel as Record<string, unknown>),
    "",
    "---[HOTEL WEBSITE EXCERPTS]---",
  ];
  if (websiteEvidence.length === 0) {
    lines.push("(no pool text found on the hotel website)");
  } else {
    for (const p of websiteEvidence) {
      lines.push(`# ${p.title} — ${p.url}`);
      for (const s of p.excerpts) lines.push(`• ${s}`);
    }
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
      tool_choice: { type: "function", function: { name: "write_editorial" } },
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
  if (!args) return { slug: hotel.slug as string, status: "error", reason: "no AI output" };
  const parsed = JSON.parse(args) as Record<string, string | null>;

  const clean = (v: string | null | undefined) => {
    const s = (v ?? "").trim();
    return s.length ? s : null;
  };
  const whyIncluded = clean(parsed.why_included);
  if (!whyIncluded || whyIncluded.length < 120) {
    return { slug: hotel.slug as string, status: "skipped", reason: "not enough evidence for editorial text" };
  }

  // ---- Sources & verification state ----
  const primary =
    (hotel.primary_source_url as string | null) ??
    websiteEvidence[0]?.url ??
    site ??
    null;
  const secondary =
    (hotel.secondary_source_url as string | null) ??
    (quotes ?? []).find((q) => q.source_url)?.source_url ??
    null;

  const coreFactsKnown =
    hotel.pool_count != null &&
    hotel.heated_pool != null &&
    hotel.indoor != null &&
    hotel.outdoor != null;

  const hasOfficialEvidence = websiteEvidence.length > 0 || !!hotel.primary_source_url;
  const verification_status: "verified" | "partially_verified" =
    coreFactsKnown && hasOfficialEvidence && !!primary && !!secondary
      ? "verified"
      : "partially_verified";

  const today = new Date().toISOString().slice(0, 10);

  const update = {
    why_included: whyIncluded,
    why_not_higher: clean(parsed.why_not_higher),
    view_description: clean(parsed.view_description),
    pool_size: clean(parsed.pool_size),
    lounging_space: clean(parsed.lounging_space),
    best_time_to_visit: clean(parsed.best_time_to_visit),
    vibe: clean(parsed.vibe),
    primary_source_url: primary,
    secondary_source_url: secondary,
    verification_status,
    verification_method:
      verification_status === "verified" ? "multiple_sources" : "research_pending",
    verified_by: "Best Pool Hotels editorial system",
    verification_notes: clean(parsed.best_for),
    last_verified_date: today,
  };

  const { error: upErr } = await supabaseAdmin.from("hotels").update(update).eq("id", hotelId);
  if (upErr) throw new Error(upErr.message);

  return { slug: hotel.slug as string, status: "written", verification_status };
}
