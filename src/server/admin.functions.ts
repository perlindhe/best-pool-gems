import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  computeMeta,
  computePoolScore,
  DEFAULT_WEIGHTS,
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
  raw: unknown,
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
      raw_payload: raw,
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

// ---------- POOL SCORE ----------
const PoolScoreSchema = z.object({
  hotel_id: z.string().uuid(),
  components: z.object({
    vibe: z.number().min(0).max(2),
    lounging_space: z.number().min(0).max(2),
    service: z.number().min(0).max(2),
    uniqueness: z.number().min(0).max(2),
    pool_first_feel: z.number().min(0).max(2),
  }),
  best_time: z.string().max(200).nullish().or(z.literal("")),
  pool_type: z.string().max(200).nullish().or(z.literal("")),
  editorial_notes: z.string().max(2000).nullish().or(z.literal("")),
});

export const adminUpsertPoolScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PoolScoreSchema.parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const score = computePoolScore(data.components);
    const { data: row, error } = await supabaseAdmin
      .from("pool_scores")
      .upsert(
        {
          hotel_id: data.hotel_id,
          pool_score_0_10: score,
          components: data.components,
          best_time: data.best_time || null,
          pool_type: data.pool_type || null,
          editorial_notes: data.editorial_notes || null,
        },
        { onConflict: "hotel_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { pool: row };
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
