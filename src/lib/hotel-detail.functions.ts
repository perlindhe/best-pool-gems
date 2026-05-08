import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getHotelDetail, type HotelPhoto } from "@/server/hotel-detail.server";
import type { PoolFacts } from "@/lib/rankings.functions";

export type HotelDetail = {
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
  pool_score_0_10: number | null;
  pool_components: Record<string, number> | null;
  best_time: string | null;
  pool_type: string | null;
  pool_facts: PoolFacts | null;
  editorial_notes: string | null;
  meta_rating_0_100: number | null;
  confidence_0_100: number | null;
  sources_used: Array<{ source: string; normalized: number; rating_count: number }> | null;
  pool_score_updated_at: string | null;
  meta_computed_at: string | null;
};

export type HotelDetailResult = {
  hotel: HotelDetail;
  photos: HotelPhoto[];
} | null;

export const getHotelBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await getHotelDetail(data.slug);
    return result as HotelDetailResult;
  });
