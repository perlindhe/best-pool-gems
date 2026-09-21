import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Automatic pool-fact verification from the hotel's OWN pages.
 *
 * Size and heating may only be treated as confirmed when the hotel itself
 * states them. This module reads the official website (and pages on the same
 * domain), asks the model to extract a literal quote per pool, and writes a
 * fact only when the quote comes from that official domain. Anything else is
 * left untouched, so "not confirmed" stays "not confirmed".
 */

type OfficialPage = { url: string; markdown: string };

type ExtractedFact = {
  pool_id: string;
  length_metres: number | null;
  area_sqm: number | null;
  heated: boolean | null;
  quote: string;
  source_url: string;
};

type PoolRow = {
  id: string;
  pool_name: string | null;
  pool_category: string;
  indoor: boolean | null;
  heating_state: string;
  length_metres: number | null;
  area_sqm: number | null;
  size_verified: boolean | null;
  source_urls: unknown;
};

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

async function firecrawlScrape(url: string): Promise<OfficialPage | null> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { markdown?: string } };
    const markdown = (json.data?.markdown ?? "").trim();
    if (markdown.length < 80) return null;
    return { url, markdown: markdown.slice(0, 8000) };
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The search service allows a limited number of calls per minute. A silent
 * empty result would look exactly like "the hotel states nothing", so a
 * throttled request is retried instead of being treated as an answer.
 */
async function firecrawlSearch(query: string, limit: number): Promise<OfficialPage[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
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
      if (res.status === 429) {
        await sleep(16000);
        continue;
      }
      if (!res.ok) return [];
      const json = (await res.json()) as {
        data?: { web?: Array<{ url?: string; markdown?: string }> } | Array<{
          url?: string;
          markdown?: string;
        }>;
      };
      const rows = Array.isArray(json.data) ? json.data : (json.data?.web ?? []);
      const out: OfficialPage[] = [];
      for (const r of rows) {
        const url = r.url ?? "";
        const markdown = (r.markdown ?? "").trim();
        if (!url || markdown.length < 80) continue;
        out.push({ url, markdown: markdown.slice(0, 8000) });
      }
      return out;
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Search the hotel's own domain with several phrasings, because the pool's
 * measurements are just as often on a fact sheet, a press page or a spa page
 * as on the pool page itself.
 */
async function firecrawlOfficialPoolPages(domain: string): Promise<OfficialPage[]> {
  const queries = [
    `site:${domain} pool`,
    `site:${domain} swimming pool metre length`,
    `site:${domain} pool "m" heated temperature`,
    `site:${domain} fact sheet pool`,
  ];
  const results: OfficialPage[] = [];
  for (const q of queries) {
    results.push(...(await firecrawlSearch(q, 3)));
    await sleep(1500);
  }
  const seen = new Set<string>();
  const out: OfficialPage[] = [];
  for (const page of results) {
    if (hostOf(page.url) !== domain) continue;
    if (seen.has(page.url)) continue;
    seen.add(page.url);
    out.push(page);
  }
  return out;
}

async function extractFacts(
  hotelName: string,
  pools: PoolRow[],
  pages: OfficialPage[],
): Promise<ExtractedFact[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey || !pages.length || !pools.length) return [];

  const instructions =
    "You extract pool facts for a hotel from the hotel's OWN web pages. " +
    "For each listed pool, only report a value that the source text states explicitly. " +
    "length_metres = the stated pool length in metres (convert feet to metres). " +
    "area_sqm = the stated pool surface area in square metres. " +
    "heated = true only when the text says the pool is heated or temperature controlled, " +
    "false only when it says the pool is unheated, otherwise null. " +
    "quote = the literal sentence from the source that states the fact. " +
    "source_url = the url of the page the quote came from. " +
    "Never estimate, never infer from photographs, never use general knowledge. " +
    "Omit a pool entirely when the pages say nothing measurable about it.";

  const input =
    `Hotel: ${hotelName}\n\nPools (json):\n` +
    JSON.stringify(
      pools.map((p) => ({
        pool_id: p.id,
        name: p.pool_name,
        category: p.pool_category,
        indoor: p.indoor,
      })),
    ) +
    `\n\nOfficial pages (json):\n` +
    JSON.stringify(pages.map((p) => ({ url: p.url, text: p.markdown })));

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
      input,
      reasoning: { effort: "low" },
      text: {
        format: {
          type: "json_schema",
          name: "pool_facts",
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
                  required: [
                    "pool_id",
                    "length_metres",
                    "area_sqm",
                    "heated",
                    "quote",
                    "source_url",
                  ],
                  properties: {
                    pool_id: { type: "string" },
                    length_metres: { type: ["number", "null"] },
                    area_sqm: { type: ["number", "null"] },
                    heated: { type: ["boolean", "null"] },
                    quote: { type: "string" },
                    source_url: { type: "string" },
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
    if (res.status === 429) throw new Error("AI rate limit reached");
    if (res.status === 402) throw new Error("AI credits exhausted");
    return [];
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let output = "";
  for (;;) {
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
          text?: string;
        };
        if (evt.type === "response.output_text.delta" && evt.delta) output += evt.delta;
        if (evt.type === "response.output_text.done" && evt.text) output = evt.text;
      } catch {
        // partial frame
      }
    }
  }

  try {
    const parsed = JSON.parse(output) as { items?: ExtractedFact[] };
    return parsed.items ?? [];
  } catch {
    return [];
  }
}

/**
 * Verify pool size and heating for one hotel from its official pages.
 * Returns what was confirmed; writes nothing it cannot quote from the
 * hotel's own domain.
 */
export async function ingestPoolFacts(hotelId: string) {
  const { data: hotel, error } = await supabaseAdmin
    .from("hotels")
    .select("id, name, official_url, website_url, primary_source_url")
    .eq("id", hotelId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!hotel) throw new Error("Hotel not found");

  const seeds = [hotel.official_url, hotel.website_url, hotel.primary_source_url].filter(
    (u): u is string => typeof u === "string" && u.length > 0,
  );
  const domain = hostOf(seeds[0]);
  if (!domain) return { updatedPools: 0, confirmedSize: 0, confirmedHeating: 0, pages: 0 };

  const { data: poolRows } = await supabaseAdmin
    .from("hotel_pools")
    .select(
      "id, pool_name, pool_category, indoor, heating_state, length_metres, area_sqm, size_verified, source_urls",
    )
    .eq("hotel_id", hotelId);
  const pools = (poolRows ?? []) as unknown as PoolRow[];
  if (!pools.length) return { updatedPools: 0, confirmedSize: 0, confirmedHeating: 0, pages: 0 };

  const scraped = await Promise.all(
    [...new Set(seeds.filter((u) => hostOf(u) === domain))].slice(0, 2).map(firecrawlScrape),
  );
  const searched = await firecrawlOfficialPoolPages(domain);
  const pages = [...scraped.filter((p): p is OfficialPage => !!p), ...searched].slice(0, 10);
  if (!pages.length) return { updatedPools: 0, confirmedSize: 0, confirmedHeating: 0, pages: 0 };

  const officialUrls = new Set(pages.map((p) => p.url));
  const facts = await extractFacts(hotel.name, pools, pages);

  let updatedPools = 0;
  let confirmedSize = 0;
  let confirmedHeating = 0;

  for (const f of facts) {
    const pool = pools.find((p) => p.id === f.pool_id);
    if (!pool) continue;
    if (!f.quote || f.quote.trim().length < 8) continue;
    if (!officialUrls.has(f.source_url) || hostOf(f.source_url) !== domain) continue;
    const page = pages.find((p) => p.url === f.source_url);
    if (!page) continue;
    // The quote must really appear on that page — no paraphrase, no invention.
    const needle = f.quote.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 60);
    if (!page.markdown.toLowerCase().replace(/\s+/g, " ").includes(needle)) continue;

    const update: Record<string, unknown> = {};
    const length = typeof f.length_metres === "number" && f.length_metres > 2 && f.length_metres < 120
      ? Math.round(f.length_metres * 10) / 10
      : null;
    const area =
      typeof f.area_sqm === "number" && f.area_sqm > 4 && f.area_sqm < 10000
        ? Math.round(f.area_sqm)
        : null;
    if (length != null || area != null) {
      if (length != null) update.length_metres = length;
      if (area != null) update.area_sqm = area;
      update.size_verified = true;
      update.size_source_url = f.source_url;
      confirmedSize += 1;
    }
    if (f.heated === true && pool.heating_state !== "confirmed_heated") {
      update.heating_state = "confirmed_heated";
      confirmedHeating += 1;
    } else if (f.heated === false && pool.heating_state !== "confirmed_not_heated") {
      update.heating_state = "confirmed_not_heated";
      confirmedHeating += 1;
    }
    if (Object.keys(update).length === 0) continue;

    const existingUrls = Array.isArray(pool.source_urls) ? (pool.source_urls as string[]) : [];
    update.source_urls = [...new Set([...existingUrls, f.source_url])];
    update.last_verified = new Date().toISOString().slice(0, 10);

    const { error: upErr } = await supabaseAdmin
      .from("hotel_pools")
      .update(update as never)
      .eq("id", pool.id);
    if (upErr) continue;
    updatedPools += 1;
  }

  return { updatedPools, confirmedSize, confirmedHeating, pages: pages.length };
}
