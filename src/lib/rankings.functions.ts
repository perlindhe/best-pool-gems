import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";


export type PoolCitation = { source: "website" | "google" | "reviews"; quote: string };

export type PoolDescriptor = {
  name: string | null;
  type: "outdoor" | "indoor" | "rooftop" | "infinity" | "plunge" | "lap" | "kids" | "spa_pool" | "jacuzzi";
  indoor: boolean | null;
  heated: boolean | null;
  length_m: number | null;
  adults_only: boolean | null;
  season: string | null;
  source: "website" | "google" | "reviews";
  quote: string;
};

export type PoolFacts = {
  pool_count?: number | null;
  is_rooftop?: boolean | null;
  is_infinity?: boolean | null;
  is_heated?: boolean | null;
  has_indoor?: boolean | null;
  has_outdoor?: boolean | null;
  is_saltwater?: boolean | null;
  has_kids_pool?: boolean | null;
  has_jacuzzi?: boolean | null;
  has_swim_up_bar?: boolean | null;
  has_cabanas?: boolean | null;
  has_poolside_food?: boolean | null;
  adults_only?: boolean | null;
  year_round?: boolean | null;
  size_estimate?: "small" | "medium" | "large" | "very_large" | null;
  length_m?: number | null;
  view?: string | null;
  season?: string | null;
  // Extended (added by source-cited pipeline):
  pools?: PoolDescriptor[];
  sources?: Record<string, PoolCitation[]>;
};

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
  official_url?: string | null;
  affiliate_url?: string | null;
  cover_image_url: string | null;
  hero_photo_url: string | null;
  rank_position: number | null;
  pool_score_0_10: number | null;
  pool_components: Record<string, number> | null;
  best_time: string | null;
  pool_type: string | null;
  pool_facts: PoolFacts | null;
  meta_rating_0_100: number | null;
  confidence_0_100: number | null;
  sources_used: Array<{ source: string; normalized: number; rating_count: number }> | null;
  pool_score_updated_at: string | null;
  meta_computed_at: string | null;
  verification_status?: "verified" | "partially_verified" | "research_pending";
  last_verified_date?: string | null;
  rooftop?: boolean | null;
  infinity?: boolean | null;
  heated_pool?: boolean | null;
  indoor?: boolean | null;
  outdoor?: boolean | null;
  adults_only?: boolean | null;
  family_friendly?: boolean | null;
  beachfront?: boolean | null;
  saltwater?: boolean | null;
  year_round?: boolean | null;
  pool_size?: string | null;
  pool_view?: string | null;
};

export const rankingFiltersSchema = z.object({
  city: z.string().max(120).optional(),
  minScore: z.number().min(0).max(10).optional(),
  rooftop: z.boolean().optional(),
  infinity: z.boolean().optional(),
  heated: z.boolean().optional(),
  yearRound: z.boolean().optional(),
  indoor: z.boolean().optional(),
  outdoor: z.boolean().optional(),
  adultsOnly: z.boolean().optional(),
  familyFriendly: z.boolean().optional(),
  beachfront: z.boolean().optional(),
  saltwater: z.boolean().optional(),
  verifiedOnly: z.boolean().optional(),
  poolSize: z.string().max(40).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

export const listRankedHotels = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => rankingFiltersSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { listCanonicalHotels } = await import("@/server/canonical-hotels.server");
    const { hotels, total } = await listCanonicalHotels(data);
    return { hotels: hotels as unknown as RankedHotel[], total };
  });
