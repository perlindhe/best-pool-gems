import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { EvidenceScoreView } from "@/components/EvidenceScorePanel";
import { getHotelDetail, resolveCanonicalSlug, type HotelPhoto, type PoolQuote, type HotelSource, type PoolRecord } from "@/server/hotel-detail.server";
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
  verification_method: "personally_visited" | "verified_with_hotel" | "multiple_sources" | "research_pending" | null;
  affiliate_url: string | null;
  official_url: string | null;
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
  editorial_status: "draft" | "review" | "published" | string;
  verified_by: string | null;
  verification_notes: string | null;
  primary_source_url: string | null;
  secondary_source_url: string | null;
  pool_opening_hours: string | null;
  day_pass_available: boolean | null;
  guest_only: boolean | null;
  children_allowed: boolean | null;
  season: string | null;
  shared_pool_count: number | null;
  spa_pool_count: number | null;
  kids_pool_count: number | null;
  private_pool_count: number | null;
  jacuzzi_count: number | null;
  plunge_pool_count: number | null;
  swim_up_count: number | null;
  documented_pool_areas: number | null;
  heated_state: "heated" | "not_heated" | "unknown" | null;
  season_state: "year_round" | "seasonal" | "unknown" | null;
  has_active_pool: boolean | null;
  score_approved_by: string | null;
  score_approved_at: string | null;
  pool_status: "active_pool" | "no_pool" | "pool_closed" | "pool_construction" | "unknown";
  ranking_eligible: boolean;
  score_version: string | null;
  score_updated_at: string | null;
};


export type HotelDetailResult = {
  hotel: HotelDetail;
  photos: HotelPhoto[];
  quotes: PoolQuote[];
  pools: PoolRecord[];
  evidence: EvidenceScoreView | null;
} | null;

export const getHotelBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await getHotelDetail(data.slug);
    return result as HotelDetailResult;
  });

export const getCanonicalHotelSlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    return await resolveCanonicalSlug(data.slug);
  });
