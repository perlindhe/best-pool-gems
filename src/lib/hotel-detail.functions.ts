import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getHotelDetail, type HotelPhoto, type PoolQuote, type HotelSource } from "@/server/hotel-detail.server";
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
  last_verified_date: string | null;
  editorial_sources: HotelSource[];
  why_included: string | null;
  why_not_higher: string | null;
  verification_status: "verified" | "partially_verified" | "research_pending" | null;
  pool_count: number | null;
  rooftop: boolean | null;
  infinity: boolean | null;
  heated_pool: boolean | null;
  indoor: boolean | null;
  outdoor: boolean | null;
  adults_only: boolean | null;
  family_friendly: boolean | null;
  beachfront: boolean | null;
  saltwater: boolean | null;
  year_round: boolean | null;
  pool_size: string | null;
  pool_view: string | null;
};


export type HotelDetailResult = {
  hotel: HotelDetail;
  photos: HotelPhoto[];
  quotes: PoolQuote[];
} | null;

export const getHotelBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await getHotelDetail(data.slug);
    return result as HotelDetailResult;
  });
