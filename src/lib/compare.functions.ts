import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type CompareHotel = {
  id: string;
  slug: string;
  name: string;
  city: string;
  city_slug: string;
  neighborhood: string | null;
  cover_image_url: string | null;
  pool_score_0_10: number | null;
  meta_rating_0_100: number | null;
  pool_type: string | null;
  pool_setting: string | null;
  view_type: string | null;
  pool_size: string | null;
  best_time_to_visit: string | null;
  /** Derived from the pool records in hotel_pool_summary — no manual heating field. */
  heated_state: string | null;
  season_state: string | null;
  guest_only: boolean | null;
  day_pass_available: boolean | null;
  price_from_eur: number | null;
  vibe: string | null;
  tags: string[] | null;
  editorial_notes: string | null;
  website_url: string | null;
  booking_url: string | null;
};

export const getHotelsForCompare = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slugs: z.array(z.string().min(1).max(200)).min(2).max(2) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("public_hotels_view")
      .select("*")
      .in("slug", data.slugs)
      ;
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r) => r.id as string);
    const { data: meta } = await supabaseAdmin.from("meta_scores").select("hotel_id, meta_rating_0_100").in("hotel_id", ids);
    const { calculatePoolScore } = await import("@/lib/hotel-status");
    const metaMap = new Map((meta ?? []).map((m) => [m.hotel_id as string, m.meta_rating_0_100 as number | null]));

    const merged = (rows ?? []).map((r) => ({
      ...r,
      pool_score_0_10: calculatePoolScore(r as never),
      meta_rating_0_100: metaMap.get(r.id as string) ?? null,
    })) as CompareHotel[];

    // Preserve requested order
    return data.slugs.map((s) => merged.find((m) => m.slug === s) ?? null);
  });
