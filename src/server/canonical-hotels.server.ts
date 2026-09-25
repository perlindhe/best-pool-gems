import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getApprovedEvidenceSlugs, passesEvidenceGate } from "@/server/evidence-gate.server";
import { validateHotelForPublication, type StatusHotel } from "@/lib/hotel-status";

/**
 * The single place that reads canonical hotel + score data.
 * Every loader / server function should go through here so that
 * one hotel = one canonical record = one Pool Score everywhere.
 */

export const CANONICAL_SELECT =
  "id, slug, name, city, city_slug, country, neighborhood, website_url, booking_url, official_url, affiliate_url, cover_image_url, rank_position, pool_score_0_10, pool_components, best_time, pool_type, pool_facts, editorial_notes, pool_score_updated_at, meta_rating_0_100, confidence_0_100, sources_used, meta_computed_at, has_pool, pool_verified_at, hotel_status, previous_names, canonical_hotel_id, verification_status, verification_method, verification_sources, fact_verification, last_verified_date, pool_count, shared_pool_count, spa_pool_count, kids_pool_count, private_pool_count, jacuzzi_count, documented_pool_areas, pool_status, ranking_eligible, score_version, score_updated_at, indoor, outdoor, infinity, saltwater, adults_only, children_allowed, pool_view, rooftop, heated_state, season_state, season, beachfront, family_friendly, distance_to_beach_m, pool_size, view_type, pool_setting, tags, why_included, why_not_higher, price_from_eur, editorial_status, verified_by, verification_notes, primary_source_url, secondary_source_url, pool_opening_hours, day_pass_available, guest_only, best_time_to_visit, qa_blocked";

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
  verification_method: string | null;
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
  shared_pool_count: number | null;
  spa_pool_count: number | null;
  kids_pool_count: number | null;
  private_pool_count: number | null;
  jacuzzi_count: number | null;
  documented_pool_areas: number | null;
  pool_status: "active_pool" | "no_pool" | "pool_closed" | "pool_construction" | "unknown";
  ranking_eligible: boolean;
  score_version: string | null;
  score_updated_at: string | null;
  indoor: boolean | null;
  outdoor: boolean | null;
  infinity: boolean | null;
  saltwater: boolean | null;
  adults_only: boolean | null;
  children_allowed: boolean | null;
  pool_view: string | null;
  rooftop: boolean | null;
  /** Derived from the pool records only. */
  heated_state: string | null;
  season_state: string | null;
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
  editorial_status: "draft" | "review" | "published" | string;
  verified_by: string | null;
  verification_notes: string | null;
  primary_source_url: string | null;
  secondary_source_url: string | null;
  pool_opening_hours: string | null;
  day_pass_available: boolean | null;
  guest_only: boolean | null;
  best_time_to_visit: string | null;
  qa_blocked: boolean | null;
};

/**
 * One rule for "this profile is finished": verified, published, not blocked by
 * QA and with a complete five-criteria Pool Score. Used for indexing, sitemap,
 * ranking lists and the verified counter — so every page agrees.
 */
export function isIndexableHotel(h: StatusHotel & { editorial_status?: string | null }) {
  if ((h.editorial_status ?? "published") !== "published") return false;
  return validateHotelForPublication(h).can_index;
}

/**
 * Plain-English pool summary built from the individual pool records, so a
 * hotel never shows one blended number that mixes shared and private pools.
 */
export function describePoolMix(h: {
  shared_pool_count?: number | null;
  spa_pool_count?: number | null;
  kids_pool_count?: number | null;
  private_pool_count?: number | null;
  jacuzzi_count?: number | null;
}): string | null {
  const parts: string[] = [];
  const shared = h.shared_pool_count ?? 0;
  const spa = h.spa_pool_count ?? 0;
  const kids = h.kids_pool_count ?? 0;
  const priv = h.private_pool_count ?? 0;
  const jac = h.jacuzzi_count ?? 0;
  if (shared > 0) parts.push(`${shared} shared pool${shared === 1 ? "" : "s"}`);
  if (kids > 0) parts.push(`${kids} children's pool${kids === 1 ? "" : "s"}`);
  if (spa > 0) parts.push(`${spa} spa pool${spa === 1 ? "" : "s"}`);
  if (jac > 0) parts.push(`${jac} jacuzzi${jac === 1 ? "" : "s"}`);
  if (parts.length === 0 && priv === 0) return null;
  let text = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0] ?? "";
  if (priv > 0) {
    text = text
      ? `${text}, plus private pools in selected room categories`
      : "Private pools in selected room categories";
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

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
      // Only imagery with documented publishing rights may appear publicly.
      .eq("permission_status", "official_source")
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

  // A pool ranking only contains hotels the central validator allows to rank:
  // confirmed active pool, fully verified, and an editorially approved score.
  q = q
    .eq("ranking_eligible", true)
    .eq("verification_status", "verified")
    .eq("qa_blocked", false)
    .not("pool_score_0_10", "is", null);

  if (filters.city) q = q.eq("city_slug", filters.city);
  if (typeof filters.minScore === "number") q = q.gte("pool_score_0_10", filters.minScore);
  if (filters.rooftop) q = q.eq("rooftop", true);
  if (filters.infinity) q = q.eq("infinity", true);
  if (filters.heated) q = q.eq("heated_state", "heated");
  if (filters.yearRound) q = q.eq("season_state", "year_round");
  if (filters.indoor) q = q.eq("indoor", true);
  if (filters.outdoor) q = q.eq("outdoor", true);
  if (filters.adultsOnly) q = q.eq("adults_only", true);
  if (filters.familyFriendly) q = q.eq("family_friendly", true);
  if (filters.beachfront) q = q.eq("beachfront", true);
  if (filters.saltwater) q = q.eq("saltwater", true);
  if (filters.poolSize) q = q.eq("pool_size", filters.poolSize);
  if (filters.verifiedOnly) {
    // "Verified" means finished: verified + published + not QA-blocked.
    q = q
      .eq("verification_status", "verified")
      .eq("editorial_status", "published")
      .eq("qa_blocked", false);
  }

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

  const all = (data ?? []) as unknown as CanonicalHotel[];
  // Evidence-based Pool Score test group: no approved score, no ranking place.
  const approved = await getApprovedEvidenceSlugs();
  const rows = all.filter((r) => passesEvidenceGate(r.slug, approved));
  const withPhotos = await attachHeroPhotos(rows);
  return { hotels: sortHotels(withPhotos as CanonicalHotel[]), total: rows.length };
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

const FEATURE_DEFS: Array<{ key: string; label: string; column: keyof CanonicalHotel; value?: unknown }> = [
  { key: "rooftop", label: "Rooftop pools", column: "rooftop" },
  { key: "infinity", label: "Infinity pools", column: "infinity" },
  { key: "heated", label: "Heated pools", column: "heated_state", value: "heated" },
  { key: "yearRound", label: "Open year-round", column: "season_state", value: "year_round" },
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
      "id, pool_score_0_10, verification_status, editorial_status, qa_blocked, last_verified_date, rooftop, infinity, heated_state, season_state, indoor, outdoor, beachfront, adults_only, family_friendly, saltwater",
    )
    .eq("city_slug", citySlug);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as (CanonicalHotel & { id: string })[];
  const finished = rows.filter(
    (r) => r.verification_status === "verified" && !r.qa_blocked,
  );
  // Scores come from the approved evidence-based Pool Score (same as profiles).
  const ids = rows.map((r) => r.id).filter(Boolean);
  const { data: ev } = ids.length
    ? await supabaseAdmin
        .from("pool_scores_evidence")
        .select("score_out_of_ten, confidence_level, approved_at")
        .in("hotel_id", ids)
        .not("approved_at", "is", null)
        .not("score_out_of_ten", "is", null)
    : { data: [] as { score_out_of_ten: number | null; confidence_level: string }[] };
  const scores = (ev ?? [])
    .filter((e) => e.confidence_level !== "low")
    .map((e) => Number(e.score_out_of_ten))
    .filter((s) => Number.isFinite(s));
  const dates = rows
    .map((r) => r.last_verified_date)
    .filter((d): d is string => Boolean(d))
    .sort();

  return {
    citySlug,
    total: rows.length,
    verified: finished.length,
    researchPending: rows.filter((r) => r.verification_status === "research_pending").length,
    avgScore: scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : null,
    topScore: scores.length ? Math.max(...scores) : null,
    lastVerified: dates.length ? dates[dates.length - 1] : null,
    features: FEATURE_DEFS.map((f) => ({
      key: f.key,
      label: f.label,
      count: rows.filter((r) => r[f.column] === (f.value ?? true)).length,
    })).filter((f) => f.count > 0),
  };
}

/**
 * Every canonical hotel for one destination, ordered the same way the
 * rankings are. Destination hubs read this instead of any hardcoded list.
 */
export async function listCityHotels(citySlug: string) {
  const { data, error, count } = await supabaseAdmin
    .from("public_hotels_view")
    .select(CANONICAL_SELECT, { count: "exact" })
    .eq("city_slug", citySlug)
    .eq("ranking_eligible", true)
    .order("pool_score_0_10", { ascending: false, nullsFirst: false })
    .order("meta_rating_0_100", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  const all = (data ?? []) as unknown as CanonicalHotel[];
  const approved = await getApprovedEvidenceSlugs();
  const rows = all.filter((r) => passesEvidenceGate(r.slug, approved));
  const withPhotos = await attachHeroPhotos(rows);
  return { hotels: sortHotels(withPhotos as CanonicalHotel[]), total: rows.length };
}
