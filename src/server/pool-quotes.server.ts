import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TA_BASE = "https://api.content.tripadvisor.com/api/v1";

type TaReview = {
  id?: number;
  url?: string;
  text?: string;
  title?: string;
  rating?: number;
  user?: { username?: string };
};

type ExtractedQuote = {
  quote: string;
  author: string | null;
  source_url: string | null;
};

async function fetchTripadvisorReviews(locationId: string): Promise<TaReview[]> {
  const key = process.env.TRIPADVISOR_API_KEY;
  if (!key) throw new Error("TRIPADVISOR_API_KEY is not configured");
  const url = `${TA_BASE}/location/${encodeURIComponent(locationId)}/reviews?key=${encodeURIComponent(key)}&language=en`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`TripAdvisor reviews error [${res.status}]: ${JSON.stringify(json)}`);
  }
  return (json?.data ?? []) as TaReview[];
}

async function aiPickPoolQuotes(
  hotelName: string,
  reviews: TaReview[],
): Promise<ExtractedQuote[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const items = reviews
    .filter((r) => (r.text ?? "").trim().length > 20)
    .slice(0, 12)
    .map((r, i) => ({
      idx: i,
      author: r.user?.username ?? null,
      url: r.url ?? null,
      text: (r.text ?? "").slice(0, 1500),
    }));
  if (items.length === 0) return [];

  const sys =
    "You extract short guest-review quotes that talk specifically about a hotel's swimming pool, rooftop pool, pool deck, pool bar, or pool view. Pick at most 3 quotes. Each quote must be a verbatim sentence (or short joined sentences) from the source text — do not paraphrase. Skip reviews that don't mention the pool.";
  const user = `Hotel: ${hotelName}\n\nReviews (JSON array):\n${JSON.stringify(items)}\n\nReturn the best up-to-3 pool-related quotes.`;

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
            description: "Save up to 3 pool-related guest quotes",
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
      const src = items[p.idx];
      if (!src) return null;
      return {
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
    .select("id, name")
    .eq("id", hotelId)
    .maybeSingle();
  if (hErr) throw new Error(hErr.message);
  if (!hotel) throw new Error("Hotel not found");

  const { data: mapping } = await supabaseAdmin
    .from("source_mappings")
    .select("source_place_id")
    .eq("hotel_id", hotelId)
    .eq("source", "tripadvisor")
    .eq("is_active", true)
    .maybeSingle();
  if (!mapping?.source_place_id) {
    return { quotes: 0, status: "no_mapping" as const };
  }

  const reviews = await fetchTripadvisorReviews(mapping.source_place_id);
  const quotes = await aiPickPoolQuotes(hotel.name as string, reviews);

  await supabaseAdmin.from("pool_quotes").delete().eq("hotel_id", hotelId);
  if (quotes.length > 0) {
    const rows = quotes.map((q, i) => ({
      hotel_id: hotelId,
      source: "tripadvisor",
      quote: q.quote,
      author: q.author,
      source_url: q.source_url,
      position: i,
    }));
    const { error: insErr } = await supabaseAdmin.from("pool_quotes").insert(rows);
    if (insErr) throw new Error(insErr.message);
  }
  return { quotes: quotes.length, status: "ok" as const };
}
