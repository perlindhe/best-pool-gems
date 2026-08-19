import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  computeMeta,
  computePoolScore,
  DEFAULT_WEIGHTS,
  toCanonicalComponents,
  type SourceKey,
  type Weights,
} from "./scoring";


const SOURCES = ["google", "tripadvisor", "booking", "hotels_com"] as const;

async function ensureAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.is_admin) throw new Error("Forbidden: admin only");
}

// ---------- HOTELS ----------
export const adminListHotels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("hotels")
      .select("*")
      .order("city_slug")
      .order("rank_position", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return { hotels: data ?? [] };
  });

export const adminGetHotel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const [hotel, mappings, snaps, meta, pool] = await Promise.all([
      supabaseAdmin.from("hotels").select("*").eq("id", data.id).single(),
      supabaseAdmin.from("source_mappings").select("*").eq("hotel_id", data.id),
      supabaseAdmin
        .from("ratings_snapshots")
        .select("*")
        .eq("hotel_id", data.id)
        .order("captured_at", { ascending: false })
        .limit(50),
      supabaseAdmin.from("meta_scores").select("*").eq("hotel_id", data.id).maybeSingle(),
      supabaseAdmin.from("pool_scores").select("*").eq("hotel_id", data.id).maybeSingle(),
    ]);
    if (hotel.error) throw new Error(hotel.error.message);
    return {
      hotel: hotel.data,
      mappings: mappings.data ?? [],
      snapshots: snaps.data ?? [],
      meta: meta.data,
      pool: pool.data,
    };
  });

const HotelUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  city_slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  country: z.string().min(1).max(120),
  neighborhood: z.string().max(120).nullish(),
  address: z.string().max(500).nullish(),
  website_url: z.string().url().max(500).nullish().or(z.literal("")),
  booking_url: z.string().url().max(500).nullish().or(z.literal("")),
  latitude: z.number().min(-90).max(90).nullish(),
  longitude: z.number().min(-180).max(180).nullish(),
  cover_image_url: z.string().max(1000).nullish().or(z.literal("")),
  rank_position: z.number().int().min(1).max(999).nullish(),
  is_published: z.boolean().optional(),
  scrape_website: z.boolean().optional(),
});

export const adminUpsertHotel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => HotelUpsertSchema.parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const payload = {
      ...data,
      website_url: data.website_url || null,
      booking_url: data.booking_url || null,
      cover_image_url: data.cover_image_url || null,
    };
    const { data: row, error } = await supabaseAdmin
      .from("hotels")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { hotel: row };
  });

export const adminDeleteHotel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin.from("hotels").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- SOURCE MAPPINGS ----------
const MappingSchema = z.object({
  id: z.string().uuid().optional(),
  hotel_id: z.string().uuid(),
  source: z.enum(SOURCES),
  source_place_id: z.string().max(500).nullish().or(z.literal("")),
  source_url: z.string().max(1000).nullish().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export const adminUpsertMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MappingSchema.parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const payload = {
      ...data,
      source_place_id: data.source_place_id || null,
      source_url: data.source_url || null,
    };
    const { data: row, error } = await supabaseAdmin
      .from("source_mappings")
      .upsert(payload, { onConflict: "hotel_id,source" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { mapping: row };
  });

export const adminDeleteMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin.from("source_mappings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- MANUAL SNAPSHOT ----------
const SnapshotSchema = z.object({
  hotel_id: z.string().uuid(),
  source: z.enum(SOURCES),
  rating_value: z.number().min(0).max(10),
  rating_scale: z.number().min(1).max(10),
  rating_count: z.number().int().min(0).max(10_000_000),
});

export const adminAddSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SnapshotSchema.parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    // upsert by (hotel, source, day)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const captured_at = today.toISOString();
    const { error: insErr } = await supabaseAdmin.from("ratings_snapshots").upsert(
      {
        hotel_id: data.hotel_id,
        source: data.source,
        rating_value: data.rating_value,
        rating_scale: data.rating_scale,
        rating_count: data.rating_count,
        captured_at,
        status: "ok",
        raw_payload: { source: "manual" },
      },
      { onConflict: "hotel_id,source,captured_date" },
    );
    if (insErr) throw new Error(insErr.message);
    return await recomputeForHotel(data.hotel_id);
  });

// ---------- SCORING ----------
async function getWeights(): Promise<{ weights: Weights; volume_cap: number }> {
  const { data, error } = await supabaseAdmin
    .from("scoring_settings")
    .select("weights, volume_cap")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const w = (data?.weights as Partial<Weights>) ?? {};
  return {
    weights: { ...DEFAULT_WEIGHTS, ...w } as Weights,
    volume_cap: data?.volume_cap ?? 5000,
  };
}

async function recomputeForHotel(hotelId: string) {
  const { weights, volume_cap } = await getWeights();
  // get latest snapshot per source
  const { data: rows, error } = await supabaseAdmin
    .from("ratings_snapshots")
    .select("source, rating_value, rating_scale, rating_count, captured_at")
    .eq("hotel_id", hotelId)
    .eq("status", "ok")
    .order("captured_at", { ascending: false });
  if (error) throw new Error(error.message);
  const latestBySource = new Map<SourceKey, (typeof rows)[number]>();
  for (const r of rows ?? []) {
    const k = r.source as SourceKey;
    if (!latestBySource.has(k)) latestBySource.set(k, r);
  }
  const meta = computeMeta(
    Array.from(latestBySource.values()).map((r) => ({
      source: r.source as SourceKey,
      rating_value: r.rating_value,
      rating_scale: r.rating_scale ?? 5,
      rating_count: r.rating_count,
    })),
    weights,
    volume_cap,
  );
  const { error: upErr } = await supabaseAdmin.from("meta_scores").upsert(
    {
      hotel_id: hotelId,
      meta_rating_0_100: meta.meta_rating_0_100,
      confidence_0_100: meta.confidence_0_100,
      sources_used: meta.sources_used,
      computed_at: new Date().toISOString(),
    },
    { onConflict: "hotel_id" },
  );
  if (upErr) throw new Error(upErr.message);
  return { meta };
}

export const adminRecomputeAll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data: hotels, error } = await supabaseAdmin.from("hotels").select("id");
    if (error) throw new Error(error.message);
    let processed = 0;
    for (const h of hotels ?? []) {
      await recomputeForHotel(h.id as string);
      processed++;
    }
    return { processed };
  });

// ---------- BATCH FETCH RATINGS (Google + TripAdvisor) ----------
async function saveSnapshot(
  hotel_id: string,
  source: SourceKey,
  rating: number,
  count: number,
  raw: Record<string, unknown>,
) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const { error } = await supabaseAdmin.from("ratings_snapshots").upsert(
    {
      hotel_id,
      source,
      rating_value: rating,
      rating_scale: 5,
      rating_count: count,
      captured_at: today.toISOString(),
      status: "ok",
      raw_payload: raw as never,
    },
    { onConflict: "hotel_id,source,captured_date" },
  );
  if (error) throw new Error(error.message);
}

async function fetchGoogle(place_id: string) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY not configured");
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(place_id)}`,
    {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri",
      },
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`Google [${res.status}]: ${JSON.stringify(json).slice(0, 200)}`);
  return { rating: Number(json.rating), count: Number(json.userRatingCount ?? 0), raw: json };
}

async function fetchTripadvisor(location_id: string) {
  const key = process.env.TRIPADVISOR_API_KEY;
  if (!key) throw new Error("TRIPADVISOR_API_KEY not configured");
  const res = await fetch(
    `https://api.content.tripadvisor.com/api/v1/location/${encodeURIComponent(location_id)}/details?key=${encodeURIComponent(key)}&language=en&currency=USD`,
    { headers: { Accept: "application/json" } },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`TripAdvisor [${res.status}]: ${JSON.stringify(json).slice(0, 200)}`);
  return { rating: Number(json.rating), count: Number(json.num_reviews ?? 0), raw: json };
}

export const adminFetchAllRatings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data: maps, error } = await supabaseAdmin
      .from("source_mappings")
      .select("hotel_id, source, source_place_id, is_active")
      .eq("is_active", true)
      .in("source", ["google", "tripadvisor"])
      .not("source_place_id", "is", null);
    if (error) throw new Error(error.message);

    const results: Array<{ hotel_id: string; source: string; ok: boolean; msg: string }> = [];
    const touchedHotels = new Set<string>();

    for (const m of maps ?? []) {
      const placeId = (m.source_place_id ?? "").trim();
      if (!placeId) continue;
      try {
        const { rating, count, raw } =
          m.source === "google"
            ? await fetchGoogle(placeId)
            : await fetchTripadvisor(placeId);
        if (!rating) throw new Error("no rating returned");
        await saveSnapshot(m.hotel_id as string, m.source as SourceKey, rating, count, {
          source: m.source === "google" ? "google_places_api" : "tripadvisor_content_api",
          payload: raw,
        });
        touchedHotels.add(m.hotel_id as string);
        results.push({
          hotel_id: m.hotel_id as string,
          source: m.source as string,
          ok: true,
          msg: `${rating}★ (${count})`,
        });
      } catch (e) {
        results.push({
          hotel_id: m.hotel_id as string,
          source: m.source as string,
          ok: false,
          msg: (e as Error).message,
        });
      }
    }

    for (const id of touchedHotels) {
      try {
        await recomputeForHotel(id);
      } catch (e) {
        results.push({ hotel_id: id, source: "recompute", ok: false, msg: (e as Error).message });
      }
    }

    const okCount = results.filter((r) => r.ok).length;
    const errCount = results.filter((r) => !r.ok).length;
    return { processed: results.length, ok: okCount, errors: errCount, results };
  });

// ---------- AI AUTO-SCORE ----------
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

Return your scores via the rate_pool function.`;

const AiToolSchema = {
  type: "function" as const,
  function: {
    name: "rate_pool",
    description: "Return the 5 pool component scores and editorial metadata.",
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
        confidence: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Based on review volume and pool-specificity",
        },
        reasoning: {
          type: "string",
          description: "Brief 1-2 sentence justification of the scores",
        },
      },
      required: [
        "vibe",
        "lounging_space",
        "service",
        "uniqueness",
        "pool_first_feel",
        "pool_type",
        "best_time",
        "editorial_notes",
        "confidence",
        "reasoning",
      ],
      additionalProperties: false,
    },
  },
};

export const adminAutoScoreHotel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ hotel_id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { autoScoreHotelById } = await import("@/server/auto-score.server");
    return autoScoreHotelById(data.hotel_id);
  });

// ---------- POOL SCORE ----------
// Accept either the new canonical 0–10 shape OR the legacy 0–2 admin shape
// (the admin UI hasn't been migrated yet). We normalize at write time.
const LegacyPoolComponentsSchema = z.object({
  vibe: z.number().min(0).max(2),
  lounging_space: z.number().min(0).max(2),
  service: z.number().min(0).max(2),
  uniqueness: z.number().min(0).max(2),
  pool_first_feel: z.number().min(0).max(2),
});
const CanonicalPoolComponentsSchema = z.object({
  pool_design_setting: z.number().min(0).max(10),
  view_atmosphere: z.number().min(0).max(10),
  size_lounging_space: z.number().min(0).max(10),
  access_seasonality: z.number().min(0).max(10),
  service_maintenance: z.number().min(0).max(10),
});
const PoolScoreSchema = z.object({
  hotel_id: z.string().uuid(),
  components: z.union([CanonicalPoolComponentsSchema, LegacyPoolComponentsSchema]),
  best_time: z.string().max(200).nullish().or(z.literal("")),
  pool_type: z.string().max(200).nullish().or(z.literal("")),
  editorial_notes: z.string().max(2000).nullish().or(z.literal("")),
  facts: z.record(z.string(), z.unknown()).nullish(),
});

export const adminUpsertPoolScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PoolScoreSchema.parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const canonical = toCanonicalComponents(data.components);
    const score = computePoolScore(canonical);
    const { data: row, error } = await supabaseAdmin
      .from("pool_scores")
      .upsert(
        {
          hotel_id: data.hotel_id,
          pool_score_0_10: score,
          components: canonical,
          best_time: data.best_time || null,
          pool_type: data.pool_type || null,
          editorial_notes: data.editorial_notes || null,
          facts: (data.facts ?? null) as never,
        },
        { onConflict: "hotel_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { pool: row };
  });


export const adminListPoolScores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data: hotels, error } = await supabaseAdmin
      .from("hotels")
      .select("id, name, city, slug, rank_position")
      .order("city")
      .order("name");
    if (error) throw new Error(error.message);
    const { data: scores, error: e2 } = await supabaseAdmin
      .from("pool_scores")
      .select("hotel_id, pool_score_0_10, components, updated_at");
    if (e2) throw new Error(e2.message);
    const byId = new Map((scores ?? []).map((s) => [s.hotel_id as string, s]));
    return {
      rows: (hotels ?? []).map((h) => {
        const s = byId.get(h.id as string);
        const comps = (s?.components as Record<string, number> | null) ?? null;
        // Map canonical (0–10) DB shape back to legacy (0–2) so the existing
        // admin UI sliders keep working until the admin form is migrated.
        const legacy = comps
          ? {
              vibe: (comps.view_atmosphere ?? 0) / 5,
              lounging_space: (comps.size_lounging_space ?? 0) / 5,
              service: (comps.service_maintenance ?? 0) / 5,
              uniqueness: (comps.access_seasonality ?? 0) / 5,
              pool_first_feel: (comps.pool_design_setting ?? 0) / 5,
            }
          : { vibe: null, lounging_space: null, service: null, uniqueness: null, pool_first_feel: null };
        return {
          hotel_id: h.id as string,
          name: h.name as string,
          city: h.city as string,
          slug: h.slug as string,
          rank_position: h.rank_position as number | null,
          pool_score_0_10: (s?.pool_score_0_10 as number | null) ?? null,
          components: legacy,

          updated_at: (s?.updated_at as string | null) ?? null,
        };
      }),
    };
  });

// ---------- SETTINGS ----------
const SettingsSchema = z.object({
  weights: z.object({
    google: z.number().min(0).max(1),
    tripadvisor: z.number().min(0).max(1),
    booking: z.number().min(0).max(1),
    hotels_com: z.number().min(0).max(1),
  }),
  volume_cap: z.number().int().min(100).max(1_000_000),
});

export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("scoring_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) throw new Error(error.message);
    return { settings: data };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SettingsSchema.parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("scoring_settings")
      .update({ weights: data.weights, volume_cap: data.volume_cap })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- HOTEL PHOTOS ----------
export const adminRefreshHotelPhotos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ hotel_id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { refreshHotelPhotos } = await import("@/server/hotel-photos.server");
    return refreshHotelPhotos(data.hotel_id);
  });
