import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { computePoolScore } from "./scoring";

async function fetchGoogleReviews(place_id: string) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY not configured");
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(place_id)}`,
    {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "id,displayName,rating,userRatingCount,reviews,editorialSummary,types",
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
    summary: json.editorialSummary?.text ?? "",
    reviews: reviews
      .map((r) => ({
        rating: r.rating ?? null,
        text: (r.text?.text ?? r.originalText?.text ?? "").slice(0, 1500),
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
      text: `${r.title ? r.title + ". " : ""}${r.text ?? ""}`.slice(0, 1500),
    })),
  };
}

const AI_SYSTEM_PROMPT = `You are an expert hotel-pool reviewer for "Best Pool Hotels", a pool-first travel guide.

You will receive review excerpts from Google and TripAdvisor for one hotel, plus the hotel's own description.
Your job: rate the HOTEL POOL (not the hotel overall) on 5 dimensions, each 0–2 (one decimal allowed):

1. vibe — views, greenery, atmosphere, light, music. Does the pool have a soul?
2. lounging_space — loungers, cabanas, shade, deck size. Roomy even at peak hours?
3. service — pool bar, food service, towels, sunbeds, attendants.
4. uniqueness — wow factor. Skyline edge, mosaic floor, cliffside drop, jungle canopy.
5. pool_first_feel — is the pool a real highlight of the stay, or just a basement amenity?

Scoring scale (apply per dimension):
  0.0 = absent / very poor / not mentioned / negative
  0.5 = below average
  1.0 = decent, ordinary
  1.5 = good, above average
  2.0 = exceptional, world-class

Be conservative. Use 2.0 only when reviews clearly enthuse about that dimension.
If reviews barely mention the pool at all, pool_first_feel must be ≤ 1.0.
If there are very few pool-related mentions, lower confidence accordingly.

Also infer:
- pool_type (e.g. "Rooftop infinity", "Indoor heated", "Beachfront", "Garden", "Lap pool")
- best_time (e.g. "May–September, late afternoon")
- editorial_notes: 2–4 sentences in editorial English describing what makes the pool special, citing concrete details from reviews. Do NOT use phrases like "guests said". Write as a confident editorial review.
- facts: a structured object of pool facts. Use null for any field you cannot infer with reasonable confidence. Estimate cautiously — never invent numbers. If reviews mention "huge", "small", etc., make a rough estimate but mark estimated=true.

Return your scores via the rate_pool function.`;

const FactsSchema = {
  type: "object",
  properties: {
    pool_count: { type: ["integer", "null"], minimum: 1, maximum: 30, description: "Total number of swimming pools at the hotel" },
    is_rooftop: { type: ["boolean", "null"], description: "At least one pool is on the roof" },
    is_infinity: { type: ["boolean", "null"], description: "At least one infinity-edge pool" },
    is_heated: { type: ["boolean", "null"] },
    has_indoor: { type: ["boolean", "null"] },
    has_outdoor: { type: ["boolean", "null"] },
    is_saltwater: { type: ["boolean", "null"] },
    has_kids_pool: { type: ["boolean", "null"] },
    has_jacuzzi: { type: ["boolean", "null"], description: "Hot tub / whirlpool / jacuzzi available" },
    has_swim_up_bar: { type: ["boolean", "null"] },
    has_cabanas: { type: ["boolean", "null"] },
    has_poolside_food: { type: ["boolean", "null"] },
    adults_only: { type: ["boolean", "null"], description: "Pool is adults-only (kids not allowed)" },
    year_round: { type: ["boolean", "null"], description: "Pool is open all year" },
    size_estimate: {
      type: ["string", "null"],
      enum: ["small", "medium", "large", "very_large", null],
      description: "Rough size: small (<50m²), medium (50–150m²), large (150–400m²), very_large (>400m²)",
    },
    length_m: { type: ["number", "null"], minimum: 3, maximum: 200, description: "Approximate pool length in meters if known" },
    view: {
      type: ["string", "null"],
      description: "Primary view from the main pool (e.g. 'Skyline', 'Sea', 'Garden', 'Mountain', 'Courtyard')",
    },
    season: {
      type: ["string", "null"],
      description: "Open season if not year-round (e.g. 'May–October')",
    },
  },
  required: [
    "pool_count", "is_rooftop", "is_infinity", "is_heated", "has_indoor", "has_outdoor",
    "is_saltwater", "has_kids_pool", "has_jacuzzi", "has_swim_up_bar", "has_cabanas",
    "has_poolside_food", "adults_only", "year_round", "size_estimate", "length_m", "view", "season",
  ],
  additionalProperties: false,
};

const AiToolSchema = {
  type: "function" as const,
  function: {
    name: "rate_pool",
    description: "Return the 5 pool component scores, editorial metadata, and structured pool facts.",
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
        facts: FactsSchema,
      },
      required: [
        "vibe", "lounging_space", "service", "uniqueness", "pool_first_feel",
        "pool_type", "best_time", "editorial_notes", "confidence", "reasoning", "facts",
      ],
      additionalProperties: false,
    },
  },
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
};

export async function autoScoreHotelById(hotel_id: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

  const [hotelRes, mapsRes] = await Promise.all([
    supabaseAdmin.from("hotels").select("name, city, country, neighborhood").eq("id", hotel_id).single(),
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

  let googleSummary = "";
  const allReviews: Array<{ source: string; rating: number | null; text: string }> = [];

  if (googleMap?.source_place_id) {
    try {
      const g = await fetchGoogleReviews(googleMap.source_place_id);
      googleSummary = g.summary;
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

  if (allReviews.length === 0) {
    throw new Error(
      "No reviews available. Map a Google or TripAdvisor source for this hotel first.",
    );
  }

  const poolWords = /\b(pool|swim|swimming|rooftop|infinity|cabana|sunbed|lounger|jacuzzi|spa|terrace|deck)\b/i;
  const poolReviews = allReviews.filter((r) => poolWords.test(r.text));
  const useReviews = (poolReviews.length >= 5 ? poolReviews : allReviews).slice(0, 30);

  const userPrompt = [
    `Hotel: ${hotel.name}`,
    `Location: ${[hotel.neighborhood, hotel.city, hotel.country].filter(Boolean).join(", ")}`,
    googleSummary ? `\nGoogle editorial summary: ${googleSummary}` : "",
    `\n${useReviews.length} review excerpts (filtered to pool mentions when possible):\n`,
    ...useReviews.map(
      (r, i) => `[${i + 1}] (${r.source}, ${r.rating ?? "?"}★) ${r.text}`,
    ),
  ].join("\n");

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
  };

  const components = {
    vibe: parsed.vibe,
    lounging_space: parsed.lounging_space,
    service: parsed.service,
    uniqueness: parsed.uniqueness,
    pool_first_feel: parsed.pool_first_feel,
  };

  return {
    components,
    pool_type: parsed.pool_type,
    best_time: parsed.best_time,
    editorial_notes: parsed.editorial_notes,
    confidence: parsed.confidence,
    reasoning: parsed.reasoning,
    reviews_analyzed: useReviews.length,
    pool_score_0_10: computePoolScore(components),
  };
}
