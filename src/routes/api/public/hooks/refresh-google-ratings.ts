import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  computeMeta,
  DEFAULT_WEIGHTS,
  type SourceKey,
  type Weights,
} from "@/server/scoring";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

async function fetchGoogleRating(placeId: string, key: string) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "id,rating,userRatingCount",
      },
    },
  );
  const j = await res.json();
  if (!res.ok) throw new Error(`Google [${res.status}]: ${JSON.stringify(j)}`);
  return { rating: Number(j.rating), count: Number(j.userRatingCount ?? 0) };
}

async function recomputeForHotel(
  hotelId: string,
  weights: Weights,
  volumeCap: number,
) {
  const { data: rows, error } = await supabaseAdmin
    .from("ratings_snapshots")
    .select("source, rating_value, rating_scale, rating_count, captured_at")
    .eq("hotel_id", hotelId)
    .eq("status", "ok")
    .order("captured_at", { ascending: false });
  if (error) throw new Error(error.message);
  const latest = new Map<SourceKey, (typeof rows)[number]>();
  for (const r of rows ?? []) {
    const k = r.source as SourceKey;
    if (!latest.has(k)) latest.set(k, r);
  }
  const meta = computeMeta(
    Array.from(latest.values()).map((r) => ({
      source: r.source as SourceKey,
      rating_value: r.rating_value,
      rating_scale: r.rating_scale ?? 5,
      rating_count: r.rating_count,
    })),
    weights,
    volumeCap,
  );
  await supabaseAdmin.from("meta_scores").upsert(
    {
      hotel_id: hotelId,
      meta_rating_0_100: meta.meta_rating_0_100,
      confidence_0_100: meta.confidence_0_100,
      sources_used: meta.sources_used,
      computed_at: new Date().toISOString(),
    },
    { onConflict: "hotel_id" },
  );
}

export const Route = createFileRoute("/api/public/hooks/refresh-google-ratings")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        // Only accept the anon publishable key as a basic gate.
        const apikey =
          request.headers.get("apikey") ||
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (
          !apikey ||
          apikey !==
            (process.env.SUPABASE_PUBLISHABLE_KEY ||
              process.env.SUPABASE_ANON_KEY)
        ) {
          return json({ error: "Unauthorized" }, 401);
        }

        const key = process.env.GOOGLE_PLACES_API_KEY;
        if (!key) return json({ error: "GOOGLE_PLACES_API_KEY missing" }, 500);

        const { data: mappings, error } = await supabaseAdmin
          .from("source_mappings")
          .select("hotel_id, source_place_id")
          .eq("source", "google")
          .eq("is_active", true)
          .not("source_place_id", "is", null);
        if (error) return json({ error: error.message }, 500);

        // load weights
        const { data: settings } = await supabaseAdmin
          .from("scoring_settings")
          .select("weights, volume_cap")
          .eq("id", 1)
          .maybeSingle();
        const weights = {
          ...DEFAULT_WEIGHTS,
          ...((settings?.weights as Partial<Weights>) ?? {}),
        } as Weights;
        const volumeCap = settings?.volume_cap ?? 5000;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const captured_at = today.toISOString();

        let ok = 0;
        let failed = 0;
        const errors: Array<{ hotel_id: string; error: string }> = [];

        for (const m of mappings ?? []) {
          if (!m.source_place_id) continue;
          try {
            const { rating, count } = await fetchGoogleRating(
              m.source_place_id,
              key,
            );
            if (!rating) throw new Error("No rating returned");
            await supabaseAdmin.from("ratings_snapshots").upsert(
              {
                hotel_id: m.hotel_id,
                source: "google",
                rating_value: rating,
                rating_scale: 5,
                rating_count: count,
                captured_at,
                status: "ok",
                raw_payload: { source: "google_places_api_cron" },
              },
              { onConflict: "hotel_id,source,captured_date" },
            );
            await recomputeForHotel(m.hotel_id as string, weights, volumeCap);
            ok++;
          } catch (e: any) {
            failed++;
            errors.push({ hotel_id: m.hotel_id as string, error: String(e?.message ?? e) });
          }
        }

        return json({ ok, failed, total: (mappings ?? []).length, errors });
      },
    },
  },
});
