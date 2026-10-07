GRANT SELECT ON public.pool_scores_evidence TO anon, authenticated;
CREATE OR REPLACE VIEW public.public_hotels_view WITH (security_invoker = true) AS
 SELECT h.id, h.slug, h.name, h.city, h.city_slug, h.country, h.neighborhood, h.website_url, h.booking_url, h.official_url, h.affiliate_url, h.cover_image_url, h.rank_position,
    CASE WHEN e.approved_by IS NOT NULL AND e.approved_at IS NOT NULL AND e.total_points IS NOT NULL AND e.confidence_level <> 'low' THEN e.score_out_of_ten ELSE NULL::numeric END AS pool_score_0_10,
    ps.components AS pool_components, ps.best_time, ps.pool_type, ps.editorial_notes,
    e.approved_at AS pool_score_updated_at,
    ps.facts AS pool_facts, ms.meta_rating_0_100, ms.confidence_0_100, ms.sources_used, ms.computed_at AS meta_computed_at,
    h.has_pool, h.pool_verified_at, h.hotel_status, h.previous_names, h.canonical_hotel_id, h.verification_status, h.verification_sources, h.fact_verification, h.last_verified_date,
    COALESCE((s.shared_pool_count)::integer, 0) AS pool_count,
    COALESCE((s.shared_pool_count)::integer, 0) AS shared_pool_count,
    COALESCE((s.spa_pool_count)::integer, 0) AS spa_pool_count,
    COALESCE((s.kids_pool_count)::integer, 0) AS kids_pool_count,
    COALESCE((s.plunge_pool_count)::integer, 0) AS plunge_pool_count,
    COALESCE((s.swim_up_count)::integer, 0) AS swim_up_count,
    COALESCE((s.private_pool_count)::integer, 0) AS private_pool_count,
    COALESCE((s.jacuzzi_count)::integer, 0) AS jacuzzi_count,
    COALESCE((s.documented_pool_areas)::integer, 0) AS documented_pool_areas,
    s.any_indoor AS indoor, s.any_outdoor AS outdoor, s.any_infinity AS infinity, s.any_saltwater AS saltwater, s.all_adults_only AS adults_only, s.any_children_allowed AS children_allowed,
    h.pool_view, s.any_rooftop AS rooftop,
    CASE WHEN COALESCE(s.heated_state, 'unknown') = 'heated' THEN true WHEN COALESCE(s.heated_state, 'unknown') = 'not_heated' THEN false ELSE NULL::boolean END AS heated_pool,
    COALESCE(s.heated_state, 'unknown') AS heated_state,
    COALESCE(s.season_state, 'unknown') AS season_state,
    CASE WHEN COALESCE(s.season_state, 'unknown') = 'year_round' THEN true ELSE NULL::boolean END AS year_round,
    h.season, h.beachfront, COALESCE(s.any_children_allowed, h.family_friendly) AS family_friendly, h.distance_to_beach_m, h.pool_size, h.view_type, h.pool_setting, h.tags, h.why_included, h.why_not_higher, h.price_from_eur, h.verification_method, h.editorial_status, h.verified_by, h.verification_notes, h.primary_source_url, h.secondary_source_url, h.pool_opening_hours,
    COALESCE(s.any_day_pass, h.day_pass_available) AS day_pass_available,
    h.guest_only, h.best_time_to_visit, h.lounging_space, h.vibe, h.view_description, h.qa_blocked, h.qa_blocked_reasons, h.qa_checked_at, h.pool_status, h.ranking_eligible, h.score_version, h.score_updated_at, h.has_active_pool, h.score_approved_by, h.score_approved_at
   FROM hotels h
     LEFT JOIN pool_scores ps ON ps.hotel_id = h.id
     LEFT JOIN pool_scores_evidence e ON e.hotel_id = h.id
     LEFT JOIN meta_scores ms ON ms.hotel_id = h.id
     LEFT JOIN hotel_pool_summary s ON s.hotel_id = h.id
  WHERE h.is_published = true AND h.has_pool IS DISTINCT FROM false AND h.hotel_status <> ALL (ARRAY['permanently_closed'::hotel_status, 'renamed'::hotel_status]);