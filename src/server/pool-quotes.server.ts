import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TA_BASE = "https://api.content.tripadvisor.com/api/v1";

type QuoteSource =
  | "tripadvisor"
  | "google"
  | "web"
  | "reddit"
  | "youtube"
  | "instagram";

type RawReview = {
  source: QuoteSource;
  text: string;
  author: string | null;
  url: string | null;
};

type ExtractedQuote = {
  source: QuoteSource;
  quote: string;
  author: string | null;
  source_url: string | null;
};

function classifySource(url: string | null, fallback: QuoteSource): QuoteSource {
  if (!url) return fallback;
  if (/reddit\.com/i.test(url)) return "reddit";
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/instagram\.com/i.test(url)) return "instagram";
  return fallback;
}

// ---------- TripAdvisor ----------
async function fetchTripadvisorReviews(locationId: string): Promise<RawReview[]> {
  const key = process.env.TRIPADVISOR_API_KEY;
  if (!key) return [];
  const url = `${TA_BASE}/location/${encodeURIComponent(locationId)}/reviews?key=${encodeURIComponent(key)}&language=en`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const json = await res.json();
  if (!res.ok) return [];
  return ((json?.data ?? []) as Array<{ text?: string; url?: string; user?: { username?: string } }>)
    .map((r) => ({
      source: "tripadvisor" as const,
      text: (r.text ?? "").trim(),
      author: r.user?.username ?? null,
      url: r.url ?? null,
    }))
    .filter((r) => r.text.length > 20);
}

// ---------- Google Places reviews ----------
async function fetchGoogleReviews(placeId: string): Promise<RawReview[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "reviews,googleMapsUri",
      },
    },
  );
  const json = await res.json();
  if (!res.ok) return [];
  const placeUri = (json?.googleMapsUri as string | undefined) ?? null;
  const reviews = (json?.reviews ?? []) as Array<{
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: { displayName?: string; uri?: string };
  }>;
  return reviews
    .map((r) => ({
      source: "google" as const,
      text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
      author: r.authorAttribution?.displayName ?? null,
      url: r.authorAttribution?.uri ?? placeUri,
    }))
    .filter((r) => r.text.length > 20);
}

// ---------- YouTube comments on hotel vlogs ----------
const POOL_RE = /pool|rooftop|infinity|jacuzzi|hot tub|sundeck|plunge|piscina|piscine|swim/i;

async function fetchYouTubeComments(
  hotelName: string,
  city: string,
): Promise<RawReview[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  try {
    // 1) Search for hotel vlogs / room tours.
    const q = encodeURIComponent(`${hotelName} ${city} pool`);
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&relevanceLanguage=en&q=${q}&key=${encodeURIComponent(key)}`,
    );
    const searchJson = await searchRes.json();
    if (!searchRes.ok) return [];
    const items = (searchJson?.items ?? []) as Array<{
      id?: { videoId?: string };
      snippet?: { title?: string; channelTitle?: string };
    }>;
    const videoIds = items
      .map((v) => v.id?.videoId)
      .filter((id): id is string => !!id)
      .slice(0, 3);
    if (videoIds.length === 0) return [];

    // 2) Pull top comment threads for each video in parallel.
    const commentLists = await Promise.all(
      videoIds.map(async (videoId) => {
        const cRes = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=30&order=relevance&textFormat=plainText&key=${encodeURIComponent(key)}`,
        );
        const cJson = await cRes.json();
        if (!cRes.ok) return [] as RawReview[];
        const threads = (cJson?.items ?? []) as Array<{
          snippet?: {
            topLevelComment?: {
              snippet?: {
                textDisplay?: string;
                authorDisplayName?: string;
                authorChannelUrl?: string;
              };
            };
          };
        }>;
        return threads
          .map<RawReview | null>((t) => {
            const c = t.snippet?.topLevelComment?.snippet;
            const text = (c?.textDisplay ?? "").trim();
            if (!text || !POOL_RE.test(text)) return null;
            return {
              source: "youtube" as const,
              text,
              author: c?.authorDisplayName ?? null,
              url: `https://www.youtube.com/watch?v=${videoId}`,
            };
          })
          .filter((r): r is RawReview => r !== null);
      }),
    );
    return commentLists.flat().slice(0, 20);
  } catch {
    return [];
  }
}

// ---------- Firecrawl web search (editorial / Reddit / hotel guides) ----------

async function firecrawlSearchOne(
  query: string,
  limit = 4,
): Promise<RawReview[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit,
        scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      }),
    });
    const json = await res.json();
    if (!res.ok) return [];
    const results = (json?.data?.web ?? json?.data ?? []) as Array<{
      url?: string;
      title?: string;
      markdown?: string;
      description?: string;
    }>;
    return results
      .map((r) => ({
        source: "web" as const,
        text: (r.markdown ?? r.description ?? "").slice(0, 4000).trim(),
        author: r.title ?? null,
        url: r.url ?? null,
      }))
      .filter((r) => r.text.length > 80 && POOL_RE.test(r.text));
  } catch {
    return [];
  }
}

async function fetchWebReviews(hotelName: string, city: string): Promise<RawReview[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  const base = `"${hotelName}" ${city} pool`;
  const citySlug = city.toLowerCase().replace(/\s+/g, "");
  // Run targeted searches in parallel — each scoped to a different
  // category of source so the AI gets diverse, pool-specific candidates.
  const queries: string[] = [
    // Generic web (editorial blogs, Booking snippets, etc.)
    `${base} review`,
    // Reddit — general travel subs
    `${base} (site:reddit.com/r/travel OR site:reddit.com/r/hotels OR site:reddit.com/r/luxurytravel OR site:reddit.com/r/solotravel OR site:reddit.com/r/digitalnomad)`,
    // Reddit — destination-specific subs (city + country)
    `${base} (site:reddit.com/r/${citySlug} OR site:reddit.com/r/spain OR site:reddit.com/r/europe OR site:reddit.com/r/AskEurope)`,
    // Top-tier travel editorial
    `${base} (site:cntraveler.com OR site:travelandleisure.com OR site:telegraph.co.uk OR site:mrandmrssmith.com OR site:fivestaralliance.com OR site:forbestravelguide.com)`,
    // Pool-focused hotel guides
    `${base} (site:thehotelguru.com OR site:oyster.com)`,
  ];
  const lists = await Promise.all(queries.map((q) => firecrawlSearchOne(q, 4)));
  const seen = new Set<string>();
  const out: RawReview[] = [];
  for (const list of lists) {
    for (const r of list) {
      const dedupeKey = r.url ?? r.text.slice(0, 120);
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      // Re-tag based on URL so Reddit/YouTube/Instagram show as themselves,
      // not as generic "web", in the UI and quote diversity logic.
      out.push({ ...r, source: classifySource(r.url, r.source) });
    }
  }
  return out;
}

// ---------- AI quote extraction ----------
async function aiPickPoolQuotes(
  hotelName: string,
  reviews: RawReview[],
): Promise<ExtractedQuote[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const items = reviews.slice(0, 32).map((r, i) => ({
    idx: i,
    source: r.source,
    author: r.author,
    text: r.text.slice(0, 1800),
  }));
  if (items.length === 0) return [];

  const sys =
    "You extract short verbatim quotes that talk SPECIFICALLY about a hotel's swimming pool, rooftop pool, infinity pool, pool deck, pool bar, jacuzzi, or pool view. " +
    "Pick at most 5 quotes total. STRONGLY prefer source diversity — mix TripAdvisor, Google, Reddit, editorial outlets (Condé Nast Traveler, Travel + Leisure, Telegraph, Mr & Mrs Smith, Five Star Alliance, Forbes Travel Guide), and pool-focused guides (The Hotel Guru, Oyster). " +
    "Each quote must be a verbatim sentence (or two adjacent sentences) copied from the source — never paraphrase, never invent. " +
    "Skip any item that does not explicitly mention the pool / rooftop / deck / jacuzzi. " +
    "Prefer concrete pool details (size, view, temperature, atmosphere, hours) over generic praise.";
  const user = `Hotel: ${hotelName}\n\nSources (JSON array, mixed origins):\n${JSON.stringify(items)}\n\nReturn the best up-to-5 pool-specific verbatim quotes, maximizing source diversity.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "save_pool_quotes",
            description: "Save up to 5 pool-related guest/editorial quotes",
            parameters: {
              type: "object",
              properties: {
                quotes: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "object",
                    properties: {
                      idx: { type: "number" },
                      quote: { type: "string", minLength: 20, maxLength: 320 },
                    },
                    required: ["idx", "quote"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["quotes"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "save_pool_quotes" } },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Lovable AI error [${res.status}]: ${JSON.stringify(json)}`);
  }
  const call = json?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) return [];
  const args = JSON.parse(call.function?.arguments ?? "{}");
  const picks = (args.quotes ?? []) as Array<{ idx: number; quote: string }>;

  return picks
    .map((p) => {
      const src = reviews[p.idx];
      if (!src) return null;
      return {
        source: src.source,
        quote: p.quote.trim(),
        author: src.author,
        source_url: src.url,
      } satisfies ExtractedQuote;
    })
    .filter((x): x is ExtractedQuote => x !== null);
}

export async function refreshPoolQuotesForHotel(hotelId: string) {
  const { data: hotel, error: hErr } = await supabaseAdmin
    .from("hotels")
    .select("id, name, city")
    .eq("id", hotelId)
    .maybeSingle();
  if (hErr) throw new Error(hErr.message);
  if (!hotel) throw new Error("Hotel not found");

  const { data: mappings } = await supabaseAdmin
    .from("source_mappings")
    .select("source, source_place_id")
    .eq("hotel_id", hotelId)
    .eq("is_active", true);

  const taId = mappings?.find((m) => m.source === "tripadvisor")?.source_place_id ?? null;
  const gId = mappings?.find((m) => m.source === "google")?.source_place_id ?? null;

  const [taReviews, gReviews, webReviews] = await Promise.all([
    taId ? fetchTripadvisorReviews(taId) : Promise.resolve([] as RawReview[]),
    gId ? fetchGoogleReviews(gId) : Promise.resolve([] as RawReview[]),
    fetchWebReviews(hotel.name as string, (hotel.city as string) ?? ""),
  ]);

  const all = [...taReviews, ...gReviews, ...webReviews];
  if (all.length === 0) {
    return { quotes: 0, status: "no_sources" as const };
  }

  const quotes = await aiPickPoolQuotes(hotel.name as string, all);

  await supabaseAdmin.from("pool_quotes").delete().eq("hotel_id", hotelId);
  if (quotes.length > 0) {
    const rows = quotes.map((q, i) => ({
      hotel_id: hotelId,
      source: q.source,
      quote: q.quote,
      author: q.author,
      source_url: q.source_url,
      position: i,
    }));
    const { error: insErr } = await supabaseAdmin.from("pool_quotes").insert(rows);
    if (insErr) throw new Error(insErr.message);
  }
  return {
    quotes: quotes.length,
    status: "ok" as const,
    sources: {
      tripadvisor: taReviews.length,
      google: gReviews.length,
      web: webReviews.length,
    },
  };
}
