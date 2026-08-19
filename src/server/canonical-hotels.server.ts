import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * The single place that reads canonical hotel + score data.
 * Every loader / server function should go through here so that
 * one hotel = one canonical record = one Pool Score everywhere.
 */

export const CANONICAL_SELECT =
  "id, slug, name, city, city_slug, country, neighborhood, website_url, booking_url, official_url, affiliate_url, cover_image_url, rank_position, pool_score_0_10, pool_components, best_time, pool_type, pool_facts, editorial_notes, pool_score_updated_at, meta_rating_0_100, confidence_0_100, sources_used, meta_computed_at, has_pool, pool_verified_at, hotel_status, previous_names, canonical_hotel_id, verification_status, verification_sources, fact_verification, last_verified_date, pool_count, indoor, outdoor, infinity, saltwater, adults_only, children_allowed, pool_view, rooftop, heated_pool, year_round, season, beachfront, family_friendly, distance_to_beach_m, pool_size, view_type, pool_setting, tags, why_included, why_not_higher, price_from_eur";

export type VerificationState = "verified" | "partially_verified" | "research_pending";

export type CanonicalHotel = {
  id: string;
  slug: string;
  name: string;
  city: string;
  city_slug: string;
  country: string;
  neighborhood: string | null;
  website_url: string | null;
  booking_url: string | null;
  official_url: string | null;
  affiliate_url: string | null;
  cover_image_url: string | null;
  hero_photo_url?: string | null;
  rank_position: number | null;
  pool_score_0_10: number | null;
  pool_components: Record<string, number> | null;
  best_time: string | null;
  pool_type: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pool_facts: Record<string, any> | null;
  editorial_notes: string | null;
  pool_score_updated_at: string | null;
  meta_rating_0_100: number | null;
  confidence_0_100: number | null;
  sources_used: Array<{ source: string; normalized: number; rating_count: number }> | null;
  meta_computed_at: string | null;
  has_pool: boolean | null;
  pool_verified_at: string | null;
  hotel_status: string;
  previous_names: string[] | null;
  canonical_hotel_id: string | null;
  verification_status: VerificationState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verification_sources: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fact_verification: Record<string, any> | null;
  last_verified_date: string | null;
  pool_count: number | null;
  indoor: boolean | null;
  outdoor: boolean | null;
  infinity: boolean | null;
  saltwater: boolean | null;
  adults_only: boolean | null;
  children_allowed: boolean | null;
  pool_view: string | null;
  rooftop: boolean | null;
  heated_pool: boolean | null;
  year_round: boolean | null;
  season: string | null;
  beachfront: boolean | null;
  family_friendly: boolean | null;
  distance_to_beach_m: number | null;
  pool_size: string | null;
  view_type: string | null;
  pool_setting: string | null;
  tags: string[] | null;
  why_included: string | null;
  why_not_higher: string | null;
  price_from_eur: number | null;
};

export type HotelFilters = {
  city?: string;
  minScore?: number;
  rooftop?: boolean;
  infinity?: boolean;
  heated?: boolean;
  yearRound?: boolean;
  indoor?: boolean;
  outdoor?: boolean;
  adultsOnly?: boolean;
  familyFriendly?: boolean;
  beachfront?: boolean;
  saltwater?: boolean;
  verifiedOnly?: boolean;
  poolSize?: string;
  limit?: number;
  offset?: number;
};

function sortHotels(rows: CanonicalHotel[]) {
  return rows.sort((a, b) => {
    const ap = a.pool_score_0_10 ?? -1;
    const bp = b.pool_score_0_10 ?? -1;
    if (bp !== ap) return bp - ap;
    const am = a.meta_rating_0_100 ?? -1;
    const bm = b.meta_rating_0_100 ?? -1;
    if (bm !== am) return bm - am;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

export async function attachHeroPhotos<T extends { id: string; cover_image_url: string | null }>(
  rows: T[],
): Promise<Array<T & { hero_photo_url: string | null }>> {
  const ids = rows.map((r) => r.id);
  const heroByHotel = new Map<string, string>();
  if (ids.length > 0) {
    const { data: photos } = await supabaseAdmin
      .from("hotel_photos")
      .select("hotel_id, url, position")
      .in("hotel_id", ids)
      .order("position", { ascending: true });
    for (const p of photos ?? []) {
      const hid = p.hotel_id as string;
      if (!heroByHotel.has(hid)) heroByHotel.set(hid, p.url as string);
    }
  }
  return rows.map((r) => ({
    ...r,
    hero_photo_url: heroByHotel.get(r.id) ?? r.cover_image_url ?? null,
  }));
}

/** List canonical hotels with SQL-side filtering + pagination. */
export async function listCanonicalHotels(filters: HotelFilters = {}) {
  let q = supabaseAdmin.from("public_hotels_view").select(CANONICAL_SELECT, { count: "exact" });

  if (filters.city) q = q.eq("city_slug", filters.city);
  if (typeof filters.minScore === "number") q = q.gte("pool_score_0_10", filters.minScore);
  if (filters.rooftop) q = q.eq("rooftop", true);
  if (filters.infinity) q = q.eq("infinity", true);
  if (filters.heated) q = q.eq("heated_pool", true);
  if (filters.yearRound) q = q.eq("year_round", true);
  if (filters.indoor) q = q.eq("indoor", true);
  if (filters.outdoor) q = q.eq("outdoor", true);
  if (filters.adultsOnly) q = q.eq("adults_only", true);
  if (filters.familyFriendly) q = q.eq("family_friendly", true);
  if (filters.beachfront) q = q.eq("beachfront", true);
  if (filters.saltwater) q = q.eq("saltwater", true);
  if (filters.poolSize) q = q.eq("pool_size", filters.poolSize);
  if (filters.verifiedOnly) q = q.in("verification_status", ["verified", "partially_verified"]);

  q = q
    .order("pool_score_0_10", { ascending: false, nullsFirst: false })
    .order("meta_rating_0_100", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  if (typeof filters.limit === "number") {
    const from = filters.offset ?? 0;
    q = q.range(from, from + filters.limit - 1);
  }

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as CanonicalHotel[];
  const withPhotos = await attachHeroPhotos(rows);
  return { hotels: sortHotels(withPhotos as CanonicalHotel[]), total: count ?? withPhotos.length };
}

/** Single canonical hotel by slug. Follows renames to the canonical record. */
export async function getCanonicalHotelBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("hotels")
    .select("id, slug, hotel_status, canonical_hotel_id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);

  let targetSlug = slug;
  let redirectFrom: string | null = null;
  if (data && data.hotel_status === "renamed" && data.canonical_hotel_id) {
    const { data: canonical } = await supabaseAdmin
      .from("hotels")
      .select("slug")
      .eq("id", data.canonical_hotel_id as string)
      .maybeSingle();
    if (canonical?.slug) {
      redirectFrom = slug;
      targetSlug = canonical.slug as string;
    }
  }

  const { data: row, error: viewError } = await supabaseAdmin
    .from("public_hotels_view")
    .select(CANONICAL_SELECT)
    .eq("slug", targetSlug)
    .maybeSingle();
  if (viewError) throw new Error(viewError.message);
  if (!row) return null;

  const [withPhoto] = await attachHeroPhotos([row as unknown as CanonicalHotel]);
  return { hotel: withPhoto as CanonicalHotel, canonicalSlug: targetSlug, redirectFrom };
}

/** Destination list with hotel counts, derived from canonical records only. */
export async function listCanonicalCities() {
  const { data, error } = await supabaseAdmin
    .from("public_hotels_view")
    .select("city, city_slug, country, pool_score_0_10");
  if (error) throw new Error(error.message);
  const map = new Map<
    string,
    { city: string; city_slug: string; country: string; count: number; topScore: number | null }
  >();
  for (const r of data ?? []) {
    const key = r.city_slug as string;
    const score = (r.pool_score_0_10 as number | null) ?? null;
    const cur = map.get(key);
    if (cur) {
      cur.count += 1;
      if (score !== null && (cur.topScore === null || score > cur.topScore)) cur.topScore = score;
    } else {
      map.set(key, {
        city: r.city as string,
        city_slug: key,
        country: r.country as string,
        count: 1,
        topScore: score,
      });
    }
  }
  return { cities: Array.from(map.values()).sort((a, b) => b.count - a.count) };
}

export type CityFeatureCount = { key: string; label: string; count: number };

export type CityHubSummary = {
  citySlug: string;
  total: number;
  verified: number;
  researchPending: number;
  avgScore: number | null;
  topScore: number | null;
  lastVerified: string | null;
  features: CityFeatureCount[];
};

const FEATURE_DEFS: Array<{ key: string; label: string; column: keyof CanonicalHotel }> = [
  { key: "rooftop", label: "Rooftop pools", column: "rooftop" },
  { key: "infinity", label: "Infinity pools", column: "infinity" },
  { key: "heated", label: "Heated pools", column: "heated_pool" },
  { key: "yearRound", label: "Open year-round", column: "year_round" },
  { key: "indoor", label: "Indoor pools", column: "indoor" },
  { key: "outdoor", label: "Outdoor pools", column: "outdoor" },
  { key: "beachfront", label: "Beachfront", column: "beachfront" },
  { key: "adultsOnly", label: "Adults only", column: "adults_only" },
  { key: "familyFriendly", label: "Family friendly", column: "family_friendly" },
  { key: "saltwater", label: "Saltwater", column: "saltwater" },
];

/** Aggregated, database-derived summary for one destination hub. */
export async function getCityHubSummary(citySlug: string): Promise<CityHubSummary> {
  const { data, error } = await supabaseAdmin
    .from("public_hotels_view")
    .select(
      "pool_score_0_10, verification_status, last_verified_date, rooftop, infinity, heated_pool, year_round, indoor, outdoor, beachfront, adults_only, family_friendly, saltwater",
    )
    .eq("city_slug", citySlug);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as CanonicalHotel[];
  const scores = rows
    .map((r) => r.pool_score_0_10)
    .filter((s): s is number => typeof s === "number");
  const dates = rows
    .map((r) => r.last_verified_date)
    .filter((d): d is string => Boolean(d))
    .sort();

  return {
    citySlug,
    total: rows.length,
    verified: rows.filter(
      (r) => r.verification_status === "verified" || r.verification_status === "partially_verified",
    ).length,
    researchPending: rows.filter((r) => r.verification_status === "research_pending").length,
    avgScore: scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : null,
    topScore: scores.length ? Math.max(...scores) : null,
    lastVerified: dates.length ? dates[dates.length - 1] : null,
    features: FEATURE_DEFS.map((f) => ({
      key: f.key,
      label: f.label,
      count: rows.filter((r) => r[f.column] === true).length,
    })).filter((f) => f.count > 0),
  };
}
