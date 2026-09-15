
CREATE OR REPLACE VIEW public.hotel_pool_summary AS
SELECT
  p.hotel_id,
  count(*) FILTER (WHERE p.pool_category IN ('shared_hotel_pool','shared_swim_up','plunge_pool') AND p.shared_or_private = 'shared') AS shared_pool_count,
  count(*) FILTER (WHERE p.pool_category = 'spa_pool') AS spa_pool_count,
  count(*) FILTER (WHERE p.pool_category = 'childrens_pool') AS kids_pool_count,
  count(*) FILTER (WHERE p.shared_or_private = 'private') AS private_pool_count,
  count(*) FILTER (WHERE p.pool_category = 'jacuzzi') AS jacuzzi_count,
  count(*) AS documented_pool_areas,
  bool_or(p.indoor IS TRUE) AS any_indoor,
  bool_or(p.outdoor IS TRUE) AS any_outdoor,
  bool_or(p.rooftop IS TRUE) AS any_rooftop,
  bool_or(p.infinity_edge IS TRUE) AS any_infinity,
  bool_or(p.heated IS TRUE) AS any_heated,
  bool_or(p.year_round IS TRUE) AS any_year_round,
  bool_or(p.saltwater IS TRUE) AS any_saltwater,
  bool_or(p.adults_only IS TRUE) AS any_adults_only,
  bool_or(p.children_allowed IS TRUE) AS any_children_allowed,
  bool_or(p.day_pass IS TRUE) AS any_day_pass,
  max(p.last_verified) AS pools_last_verified
FROM public.hotel_pools p
GROUP BY p.hotel_id;

GRANT SELECT ON public.hotel_pool_summary TO anon, authenticated;
GRANT ALL ON public.hotel_pool_summary TO service_role;

DROP VIEW IF EXISTS public.public_hotels_view;

CREATE VIEW public.public_hotels_view AS
SELECT
  h.id, h.slug, h.name, h.city, h.city_slug, h.country, h.neighborhood,
  h.website_url, h.booking_url, h.official_url, h.affiliate_url, h.cover_image_url, h.rank_position,
  ps.pool_score_0_10, ps.components AS pool_components, ps.best_time, ps.pool_type,
  ps.editorial_notes, ps.updated_at AS pool_score_updated_at, ps.facts AS pool_facts,
  ms.meta_rating_0_100, ms.confidence_0_100, ms.sources_used, ms.computed_at AS meta_computed_at,
  h.has_pool, h.pool_verified_at, h.hotel_status, h.previous_names, h.canonical_hotel_id,
  h.verification_status, h.verification_sources, h.fact_verification, h.last_verified_date,
  COALESCE(s.shared_pool_count::int, h.pool_count) AS pool_count,
  COALESCE(s.shared_pool_count::int, 0) AS shared_pool_count,
  COALESCE(s.spa_pool_count::int, 0) AS spa_pool_count,
  COALESCE(s.kids_pool_count::int, 0) AS kids_pool_count,
  COALESCE(s.private_pool_count::int, 0) AS private_pool_count,
  COALESCE(s.jacuzzi_count::int, 0) AS jacuzzi_count,
  COALESCE(s.documented_pool_areas::int, 0) AS documented_pool_areas,
  COALESCE(s.any_indoor, h.indoor) AS indoor,
  COALESCE(s.any_outdoor, h.outdoor) AS outdoor,
  COALESCE(s.any_infinity, h.infinity) AS infinity,
  COALESCE(s.any_saltwater, h.saltwater) AS saltwater,
  COALESCE(s.any_adults_only, h.adults_only) AS adults_only,
  COALESCE(s.any_children_allowed, h.children_allowed) AS children_allowed,
  h.pool_view,
  COALESCE(s.any_rooftop, h.rooftop) AS rooftop,
  CASE WHEN s.any_heated IS TRUE THEN true
       WHEN s.hotel_id IS NOT NULL THEN NULL
       ELSE h.heated_pool END AS heated_pool,
  COALESCE(s.any_year_round, h.year_round) AS year_round,
  h.season, h.beachfront,
  COALESCE(s.any_children_allowed, h.family_friendly) AS family_friendly,
  h.distance_to_beach_m, h.pool_size, h.view_type, h.pool_setting, h.tags,
  h.why_included, h.why_not_higher, h.price_from_eur, h.verification_method,
  h.editorial_status, h.verified_by, h.verification_notes,
  h.primary_source_url, h.secondary_source_url, h.pool_opening_hours,
  COALESCE(s.any_day_pass, h.day_pass_available) AS day_pass_available,
  h.guest_only, h.best_time_to_visit, h.lounging_space, h.vibe, h.view_description,
  h.qa_blocked, h.qa_blocked_reasons, h.qa_checked_at,
  h.pool_status, h.ranking_eligible, h.score_version, h.score_updated_at
FROM public.hotels h
LEFT JOIN public.pool_scores ps ON ps.hotel_id = h.id
LEFT JOIN public.meta_scores ms ON ms.hotel_id = h.id
LEFT JOIN public.hotel_pool_summary s ON s.hotel_id = h.id
WHERE h.is_published = true
  AND h.has_pool IS DISTINCT FROM false
  AND h.hotel_status <> ALL (ARRAY['permanently_closed'::hotel_status, 'renamed'::hotel_status]);

GRANT SELECT ON public.public_hotels_view TO anon, authenticated;
GRANT ALL ON public.public_hotels_view TO service_role;
