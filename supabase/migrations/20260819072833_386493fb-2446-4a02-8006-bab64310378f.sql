
DO $$ BEGIN
  CREATE TYPE public.hotel_status AS ENUM ('active','renamed','temporarily_closed','permanently_closed','opening_soon','unverified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('verified','partially_verified','research_pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS previous_names text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS hotel_status public.hotel_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS canonical_hotel_id uuid REFERENCES public.hotels(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verification_status public.verification_status NOT NULL DEFAULT 'research_pending',
  ADD COLUMN IF NOT EXISTS verification_sources jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS fact_verification jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pool_count int,
  ADD COLUMN IF NOT EXISTS indoor boolean,
  ADD COLUMN IF NOT EXISTS outdoor boolean,
  ADD COLUMN IF NOT EXISTS infinity boolean,
  ADD COLUMN IF NOT EXISTS saltwater boolean,
  ADD COLUMN IF NOT EXISTS adults_only boolean,
  ADD COLUMN IF NOT EXISTS children_allowed boolean,
  ADD COLUMN IF NOT EXISTS pool_view text;

-- Backfill pool flags from pool_scores.facts
UPDATE public.hotels h SET
  pool_count = COALESCE(h.pool_count, NULLIF(ps.facts->>'pool_count','')::int),
  indoor = COALESCE(h.indoor, (ps.facts->>'has_indoor')::boolean),
  outdoor = COALESCE(h.outdoor, (ps.facts->>'has_outdoor')::boolean),
  infinity = COALESCE(h.infinity, (ps.facts->>'is_infinity')::boolean),
  saltwater = COALESCE(h.saltwater, (ps.facts->>'is_saltwater')::boolean),
  adults_only = COALESCE(h.adults_only, (ps.facts->>'adults_only')::boolean),
  pool_view = COALESCE(h.pool_view, h.view_type, NULLIF(ps.facts->>'view','')),
  heated_pool = COALESCE(h.heated_pool, (ps.facts->>'is_heated')::boolean),
  rooftop = COALESCE(h.rooftop, (ps.facts->>'is_rooftop')::boolean),
  year_round = COALESCE(h.year_round, (ps.facts->>'year_round')::boolean)
FROM public.pool_scores ps
WHERE ps.hotel_id = h.id AND ps.facts IS NOT NULL;

-- Backfill from tags
UPDATE public.hotels SET rooftop = true WHERE rooftop IS NULL AND 'rooftop' = ANY(tags);
UPDATE public.hotels SET children_allowed = NOT adults_only WHERE children_allowed IS NULL AND adults_only IS NOT NULL;
UPDATE public.hotels SET adults_only = false WHERE adults_only IS NULL AND family_friendly IS TRUE;

-- Verification state derived from existing verification signals
UPDATE public.hotels SET verification_status = 'verified'
  WHERE pool_verified_at IS NOT NULL AND official_url IS NOT NULL;
UPDATE public.hotels SET verification_status = 'partially_verified'
  WHERE verification_status = 'research_pending' AND (pool_verified_at IS NOT NULL OR last_verified_date IS NOT NULL);

CREATE INDEX IF NOT EXISTS hotels_city_slug_idx ON public.hotels (city_slug);
CREATE INDEX IF NOT EXISTS hotels_status_idx ON public.hotels (hotel_status);

DROP VIEW IF EXISTS public.public_hotels_view;
CREATE VIEW public.public_hotels_view
WITH (security_invoker = true)
AS
 SELECT h.id,
    h.slug,
    h.name,
    h.city,
    h.city_slug,
    h.country,
    h.neighborhood,
    h.website_url,
    h.booking_url,
    h.official_url,
    h.affiliate_url,
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
    h.pool_verified_at,
    h.hotel_status,
    h.previous_names,
    h.canonical_hotel_id,
    h.verification_status,
    h.verification_sources,
    h.fact_verification,
    h.last_verified_date,
    h.pool_count,
    h.indoor,
    h.outdoor,
    h.infinity,
    h.saltwater,
    h.adults_only,
    h.children_allowed,
    h.pool_view,
    h.rooftop,
    h.heated_pool,
    h.year_round,
    h.season,
    h.beachfront,
    h.family_friendly,
    h.distance_to_beach_m,
    h.pool_size,
    h.view_type,
    h.pool_setting,
    h.tags,
    h.why_included,
    h.why_not_higher,
    h.price_from_eur
   FROM public.hotels h
     LEFT JOIN public.pool_scores ps ON ps.hotel_id = h.id
     LEFT JOIN public.meta_scores ms ON ms.hotel_id = h.id
  WHERE h.is_published = true
    AND h.has_pool IS DISTINCT FROM false
    AND h.hotel_status NOT IN ('permanently_closed','renamed');

GRANT SELECT ON public.public_hotels_view TO anon, authenticated;
GRANT ALL ON public.public_hotels_view TO service_role;
