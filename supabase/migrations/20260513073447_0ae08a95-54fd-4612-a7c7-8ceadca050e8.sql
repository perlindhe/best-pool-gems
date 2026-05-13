
ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS has_pool boolean,
  ADD COLUMN IF NOT EXISTS pool_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS pool_verification_notes text;

DROP VIEW IF EXISTS public.public_hotels_view;

CREATE VIEW public.public_hotels_view AS
SELECT h.id,
   h.slug,
   h.name,
   h.city,
   h.city_slug,
   h.country,
   h.neighborhood,
   h.website_url,
   h.booking_url,
   h.cover_image_url,
   h.rank_position,
   ps.pool_score_0_10,
   ps.components AS pool_components,
   ps.best_time,
   ps.pool_type,
   ps.editorial_notes,
   ps.updated_at AS pool_score_updated_at,
   ps.facts AS pool_facts,
   ms.meta_rating_0_100,
   ms.confidence_0_100,
   ms.sources_used,
   ms.computed_at AS meta_computed_at,
   h.has_pool,
   h.pool_verified_at
  FROM public.hotels h
    LEFT JOIN public.pool_scores ps ON ps.hotel_id = h.id
    LEFT JOIN public.meta_scores ms ON ms.hotel_id = h.id
 WHERE h.is_published = true
   AND (h.has_pool IS DISTINCT FROM false);
