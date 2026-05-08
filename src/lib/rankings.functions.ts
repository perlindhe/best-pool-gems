import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type RankedHotel = {
  id: string;
  slug: string;
  name: string;
  city: string;
  city_slug: string;
  country: string;
  neighborhood: string | null;
  website_url: string | null;
  booking_url: string | null;
  cover_image_url: string | null;
  rank_position: number | null;
  pool_score_0_10: number | null;
  pool_components: Record<string, number> | null;
  best_time: string | null;
  pool_type: string | null;
  meta_rating_0_100: number | null;
  confidence_0_100: number | null;
  sources_used: Array<{ source: string; normalized: number; rating_count: number }> | null;
  pool_score_updated_at: string | null;
  meta_computed_at: string | null;
};

export const listRankedHotels = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ city: z.string().max(120).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("public_hotels_view")
      .select(
        "id, slug, name, city, city_slug, country, neighborhood, website_url, booking_url, cover_image_url, rank_position, pool_score_0_10, pool_components, best_time, pool_type, meta_rating_0_100, confidence_0_100, sources_used, pool_score_updated_at, meta_computed_at",
      );
    if (data.city) q = q.eq("city_slug", data.city);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Sort: pool_score desc (nulls last), then meta_rating desc (nulls last), then name asc
    const sorted = [...(rows ?? [])].sort((a, b) => {
      const ap = a.pool_score_0_10 ?? -1;
      const bp = b.pool_score_0_10 ?? -1;
      if (bp !== ap) return bp - ap;
      const am = a.meta_rating_0_100 ?? -1;
      const bm = b.meta_rating_0_100 ?? -1;
      if (bm !== am) return bm - am;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });

    return { hotels: sorted as RankedHotel[] };
  });
