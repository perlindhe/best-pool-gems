import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

function getKey() {
  const k = process.env.GOOGLE_PLACES_API_KEY;
  if (!k) throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  return k;
}

// ---------- SEARCH (Places API New: searchText) ----------
export const googleSearchPlace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ query: z.string().min(2).max(300) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const key = getKey();
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri",
      },
      body: JSON.stringify({ textQuery: data.query, maxResultCount: 5 }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`Google Places error [${res.status}]: ${JSON.stringify(json)}`);
    return { results: json.places ?? [] };
  });

// ---------- FETCH RATING for a known Place ID & save snapshot ----------
export const googleFetchRating = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ hotel_id: z.string().uuid(), place_id: z.string().min(5) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const key = getKey();
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(data.place_id)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri",
      },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`Google Places error [${res.status}]: ${JSON.stringify(json)}`);

    const rating = Number(json.rating);
    const count = Number(json.userRatingCount ?? 0);
    if (!rating) throw new Error("No rating available for this Place ID");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const { error: insErr } = await supabaseAdmin.from("ratings_snapshots").upsert(
      {
        hotel_id: data.hotel_id,
        source: "google",
        rating_value: rating,
        rating_scale: 5,
        rating_count: count,
        captured_at: today.toISOString(),
        status: "ok",
        raw_payload: { source: "google_places_api", payload: json },
      },
      { onConflict: "hotel_id,source,captured_date" },
    );
    if (insErr) throw new Error(insErr.message);
    return { rating, count, mapsUri: json.googleMapsUri };
  });
