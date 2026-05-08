import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.is_admin) throw new Error("Forbidden: admin only");
}

function getKey() {
  const k = process.env.TRIPADVISOR_API_KEY;
  if (!k) throw new Error("TRIPADVISOR_API_KEY is not configured");
  return k;
}

const BASE = "https://api.content.tripadvisor.com/api/v1";

// ---------- SEARCH (location/search) ----------
export const tripadvisorSearchLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ query: z.string().min(2).max(300) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const key = getKey();
    const url = `${BASE}/location/search?key=${encodeURIComponent(key)}&searchQuery=${encodeURIComponent(data.query)}&category=hotels&language=en`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const json = await res.json();
    if (!res.ok)
      throw new Error(`TripAdvisor error [${res.status}]: ${JSON.stringify(json)}`);
    return { results: json.data ?? [] };
  });

// ---------- FETCH RATING for a known location_id & save snapshot ----------
export const tripadvisorFetchRating = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ hotel_id: z.string().uuid(), location_id: z.string().min(1) })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const key = getKey();
    const url = `${BASE}/location/${encodeURIComponent(data.location_id)}/details?key=${encodeURIComponent(key)}&language=en&currency=USD`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const json = await res.json();
    if (!res.ok)
      throw new Error(`TripAdvisor error [${res.status}]: ${JSON.stringify(json)}`);

    const rating = Number(json.rating);
    const count = Number(json.num_reviews ?? 0);
    if (!rating) throw new Error("No rating available for this location");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const { error: insErr } = await supabaseAdmin.from("ratings_snapshots").upsert(
      {
        hotel_id: data.hotel_id,
        source: "tripadvisor",
        rating_value: rating,
        rating_scale: 5,
        rating_count: count,
        captured_at: today.toISOString(),
        status: "ok",
        raw_payload: { source: "tripadvisor_content_api", payload: json },
      },
      { onConflict: "hotel_id,source,captured_date" },
    );
    if (insErr) throw new Error(insErr.message);
    return { rating, count, webUrl: json.web_url };
  });
