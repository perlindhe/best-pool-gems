ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS verification_method text
  CHECK (verification_method IN ('personally_visited','verified_with_hotel','multiple_sources','research_pending'));

UPDATE public.hotels
SET verification_method = CASE
  WHEN verification_status IN ('verified','partially_verified') THEN 'multiple_sources'
  ELSE 'research_pending'
END
WHERE verification_method IS NULL;

CREATE OR REPLACE VIEW public.public_hotels_view AS
 SELECT h.id, h.slug, h.name, h.city, h.city_slug, h.country, h.neighborhood,
    h.website_url, h.booking_url, h.official_url, h.affiliate_url, h.cover_image_url,
    h.rank_position, ps.pool_score_0_10, ps.components AS pool_components, ps.best_time,
    ps.pool_type, ps.editorial_notes, ps.updated_at AS pool_score_updated_at, ps.facts AS pool_facts,
    ms.meta_rating_0_100, ms.confidence_0_100, ms.sources_used, ms.computed_at AS meta_computed_at,
    h.has_pool, h.pool_verified_at, h.hotel_status, h.previous_names, h.canonical_hotel_id,
    h.verification_status, h.verification_sources, h.fact_verification,
    h.last_verified_date, h.pool_count, h.indoor, h.outdoor, h.infinity, h.saltwater,
    h.adults_only, h.children_allowed, h.pool_view, h.rooftop, h.heated_pool, h.year_round,
    h.season, h.beachfront, h.family_friendly, h.distance_to_beach_m, h.pool_size,
    h.view_type, h.pool_setting, h.tags, h.why_included, h.why_not_higher, h.price_from_eur,
    h.verification_method
   FROM hotels h
     LEFT JOIN pool_scores ps ON ps.hotel_id = h.id
     LEFT JOIN meta_scores ms ON ms.hotel_id = h.id
  WHERE h.is_published = true AND h.has_pool IS DISTINCT FROM false
    AND (h.hotel_status <> ALL (ARRAY['permanently_closed'::hotel_status, 'renamed'::hotel_status]));