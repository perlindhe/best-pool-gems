
ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS has_active_pool boolean,
  ADD COLUMN IF NOT EXISTS score_approved_by text,
  ADD COLUMN IF NOT EXISTS score_approved_at timestamptz;

ALTER TABLE public.hotel_pools
  ADD COLUMN IF NOT EXISTS heating_state text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS season_state text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS existence_state text NOT NULL DEFAULT 'provisional';

ALTER TABLE public.hotel_pools DROP CONSTRAINT IF EXISTS hotel_pools_heating_state_chk;
ALTER TABLE public.hotel_pools ADD CONSTRAINT hotel_pools_heating_state_chk
  CHECK (heating_state IN ('confirmed_heated','confirmed_not_heated','unknown'));
ALTER TABLE public.hotel_pools DROP CONSTRAINT IF EXISTS hotel_pools_season_state_chk;
ALTER TABLE public.hotel_pools ADD CONSTRAINT hotel_pools_season_state_chk
  CHECK (season_state IN ('year_round','seasonal','unknown'));
ALTER TABLE public.hotel_pools DROP CONSTRAINT IF EXISTS hotel_pools_existence_state_chk;
ALTER TABLE public.hotel_pools ADD CONSTRAINT hotel_pools_existence_state_chk
  CHECK (existence_state IN ('confirmed_official','confirmed_two_sources','provisional','unknown'));

UPDATE public.hotel_pools SET heating_state =
  CASE WHEN heated IS TRUE OR heating_status = 'confirmed_heated' THEN 'confirmed_heated'
       WHEN heated IS FALSE AND heating_status = 'confirmed_not_heated' THEN 'confirmed_not_heated'
       ELSE 'unknown' END;

UPDATE public.hotel_pools SET season_state =
  CASE WHEN year_round IS TRUE OR lower(coalesce(seasonal_dates,'')) IN ('year-round','year round','open all year') THEN 'year_round'
       WHEN coalesce(seasonal_dates,'') <> '' THEN 'seasonal'
       ELSE 'unknown' END;

UPDATE public.hotel_pools SET existence_state =
  CASE WHEN fact_status = 'verified' THEN 'confirmed_official'
       WHEN fact_status = 'partially_verified' THEN 'provisional'
       ELSE 'unknown' END;

UPDATE public.hotel_pools SET heated = NULL
  WHERE heated IS FALSE AND heating_state = 'unknown';

DROP VIEW IF EXISTS public.public_hotels_view;
DROP VIEW IF EXISTS public.hotel_pool_summary;

CREATE VIEW public.hotel_pool_summary AS
SELECT
  p.hotel_id,
  count(*) FILTER (WHERE p.pool_category IN ('shared_hotel_pool','shared_swim_up') AND p.shared_or_private = 'shared') AS shared_pool_count,
  count(*) FILTER (WHERE p.pool_category = 'spa_pool') AS spa_pool_count,
  count(*) FILTER (WHERE p.pool_category = 'childrens_pool') AS kids_pool_count,
  count(*) FILTER (WHERE p.pool_category = 'plunge_pool') AS plunge_pool_count,
  count(*) FILTER (WHERE p.pool_category = 'shared_swim_up') AS swim_up_count,
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
  bool_and(p.adults_only IS TRUE) FILTER (WHERE p.shared_or_private = 'shared') AS all_adults_only,
  bool_or(p.children_allowed IS TRUE) AS any_children_allowed,
  bool_or(p.day_pass IS TRUE) AS any_day_pass,
  CASE
    WHEN bool_or(p.heating_state = 'confirmed_heated') THEN 'heated'
    WHEN bool_and(p.heating_state = 'confirmed_not_heated') THEN 'not_heated'
    ELSE 'unknown'
  END AS heated_state,
  CASE
    WHEN bool_or(p.season_state = 'year_round') THEN 'year_round'
    WHEN bool_or(p.season_state = 'seasonal') THEN 'seasonal'
    ELSE 'unknown'
  END AS season_state,
  max(p.last_verified) AS pools_last_verified
FROM public.hotel_pools p
GROUP BY p.hotel_id;

GRANT SELECT ON public.hotel_pool_summary TO anon, authenticated;
GRANT ALL ON public.hotel_pool_summary TO service_role;
ALTER VIEW public.hotel_pool_summary SET (security_invoker = true);

CREATE VIEW public.public_hotels_view AS
SELECT
  h.id, h.slug, h.name, h.city, h.city_slug, h.country, h.neighborhood,
  h.website_url, h.booking_url, h.official_url, h.affiliate_url, h.cover_image_url, h.rank_position,
  ps.pool_score_0_10, ps.components AS pool_components, ps.best_time, ps.pool_type,
  ps.editorial_notes, ps.updated_at AS pool_score_updated_at, ps.facts AS pool_facts,
  ms.meta_rating_0_100, ms.confidence_0_100, ms.sources_used, ms.computed_at AS meta_computed_at,
  h.has_pool, h.pool_verified_at, h.hotel_status, h.previous_names, h.canonical_hotel_id,
  h.verification_status, h.verification_sources, h.fact_verification, h.last_verified_date,
  COALESCE(s.shared_pool_count::int, 0) AS pool_count,
  COALESCE(s.shared_pool_count::int, 0) AS shared_pool_count,
  COALESCE(s.spa_pool_count::int, 0) AS spa_pool_count,
  COALESCE(s.kids_pool_count::int, 0) AS kids_pool_count,
  COALESCE(s.plunge_pool_count::int, 0) AS plunge_pool_count,
  COALESCE(s.swim_up_count::int, 0) AS swim_up_count,
  COALESCE(s.private_pool_count::int, 0) AS private_pool_count,
  COALESCE(s.jacuzzi_count::int, 0) AS jacuzzi_count,
  COALESCE(s.documented_pool_areas::int, 0) AS documented_pool_areas,
  s.any_indoor AS indoor,
  s.any_outdoor AS outdoor,
  s.any_infinity AS infinity,
  s.any_saltwater AS saltwater,
  s.all_adults_only AS adults_only,
  s.any_children_allowed AS children_allowed,
  h.pool_view,
  s.any_rooftop AS rooftop,
  CASE WHEN COALESCE(s.heated_state,'unknown') = 'heated' THEN true
       WHEN COALESCE(s.heated_state,'unknown') = 'not_heated' THEN false
       ELSE NULL END AS heated_pool,
  COALESCE(s.heated_state, 'unknown') AS heated_state,
  COALESCE(s.season_state, 'unknown') AS season_state,
  CASE WHEN COALESCE(s.season_state,'unknown') = 'year_round' THEN true ELSE NULL END AS year_round,
  h.season, h.beachfront,
  COALESCE(s.any_children_allowed, h.family_friendly) AS family_friendly,
  h.distance_to_beach_m, h.pool_size, h.view_type, h.pool_setting, h.tags,
  h.why_included, h.why_not_higher, h.price_from_eur, h.verification_method,
  h.editorial_status, h.verified_by, h.verification_notes,
  h.primary_source_url, h.secondary_source_url, h.pool_opening_hours,
  COALESCE(s.any_day_pass, h.day_pass_available) AS day_pass_available,
  h.guest_only, h.best_time_to_visit, h.lounging_space, h.vibe, h.view_description,
  h.qa_blocked, h.qa_blocked_reasons, h.qa_checked_at,
  h.pool_status, h.ranking_eligible, h.score_version, h.score_updated_at,
  h.has_active_pool, h.score_approved_by, h.score_approved_at
FROM public.hotels h
LEFT JOIN public.pool_scores ps ON ps.hotel_id = h.id
LEFT JOIN public.meta_scores ms ON ms.hotel_id = h.id
LEFT JOIN public.hotel_pool_summary s ON s.hotel_id = h.id
WHERE h.is_published = true
  AND h.has_pool IS DISTINCT FROM false
  AND h.hotel_status <> ALL (ARRAY['permanently_closed'::hotel_status, 'renamed'::hotel_status]);

GRANT SELECT ON public.public_hotels_view TO anon, authenticated;
GRANT ALL ON public.public_hotels_view TO service_role;
ALTER VIEW public.public_hotels_view SET (security_invoker = true);
