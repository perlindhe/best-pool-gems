import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TA_BASE = "https://api.content.tripadvisor.com/api/v1";

type RawReview = {
  source: "tripadvisor" | "google" | "web";
  text: string;
  author: string | null;
  url: string | null;
};

type ExtractedQuote = {
  source: "tripadvisor" | "google" | "web";
  quote: string;
  author: string | null;
  source_url: string | null;
};

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

// ---------- Firecrawl web search (editorial / blogs / Booking snippets) ----------
async function fetchWebReviews(hotelName: string, city: string): Promise<RawReview[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  const query = `"${hotelName}" ${city} pool review`;
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 5,
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
      .filter((r) => r.text.length > 80 && /pool|rooftop|deck/i.test(r.text));
  } catch {
    return [];
  }
}

// ---------- AI quote extraction ----------
async function aiPickPoolQuotes(
  hotelName: string,
  reviews: RawReview[],
): Promise<ExtractedQuote[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const items = reviews.slice(0, 24).map((r, i) => ({
    idx: i,
    source: r.source,
    author: r.author,
    text: r.text.slice(0, 1800),
  }));
  if (items.length === 0) return [];

  const sys =
    "You extract short verbatim quotes that talk specifically about a hotel's swimming pool, rooftop pool, pool deck, pool bar, or pool view. Pick at most 3 quotes total. Try to pick from DIFFERENT sources if possible (one TripAdvisor, one Google, one web/editorial). Each quote must be a verbatim sentence (or two adjacent sentences) copied from the source — never paraphrase. Skip items that don't mention the pool/rooftop/deck.";
  const user = `Hotel: ${hotelName}\n\nSources (JSON array):\n${JSON.stringify(items)}\n\nReturn the best up-to-3 pool-related verbatim quotes, prefer source diversity.`;

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
            description: "Save up to 3 pool-related guest/editorial quotes",
            parameters: {
              type: "object",
              properties: {
                quotes: {
                  type: "array",
                  maxItems: 3,
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
