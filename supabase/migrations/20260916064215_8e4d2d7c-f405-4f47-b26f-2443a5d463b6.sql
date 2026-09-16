-- 1. Generic pool names -> fall back to category label
UPDATE public.hotel_pools
SET pool_name = NULL
WHERE pool_name ~* '^(outdoor|indoor|swimming)? ?pool ?[0-9]+$';

-- 2. Indoor pools cannot be open-air rooftop pools
UPDATE public.hotel_pools
SET rooftop = false
WHERE indoor = true AND rooftop = true;

-- 3. Remove placeholder / "no information" editorial score rows
DELETE FROM public.pool_scores
WHERE editorial_notes ~* '(N/A|Undetermined|No information available|no information about|no evidence to suggest)';

-- 4. Remove scores where five subscores are identical (placeholder pattern)
DELETE FROM public.pool_scores s
WHERE (SELECT count(DISTINCT v) FROM jsonb_each_text(s.components) x(k, v)) = 1;

-- 5. Hotels without any documented shared swimming pool:
--    no score, no ranking, flagged as having no active pool
WITH shared AS (
  SELECT h.id,
         COALESCE((SELECT count(*) FROM public.hotel_pools p
                   WHERE p.hotel_id = h.id
                     AND p.pool_category IN ('shared_hotel_pool','shared_swim_up')), 0) AS n,
         COALESCE((SELECT count(*) FROM public.hotel_pools p WHERE p.hotel_id = h.id), 0) AS any_rows
  FROM public.hotels h
)
, nopool AS (SELECT id, any_rows FROM shared WHERE n = 0)
, del AS (DELETE FROM public.pool_scores WHERE hotel_id IN (SELECT id FROM nopool))
UPDATE public.hotels h
SET ranking_eligible = false,
    has_active_pool = false,
    pool_status = CASE WHEN n.any_rows = 0 THEN 'unknown'::hotel_pool_status ELSE 'no_pool'::hotel_pool_status END,
    pool_count = 0,
    updated_at = now()
FROM nopool n
WHERE h.id = n.id;

-- 6. Re-sync hotel-level pool facts from normalized pool records
UPDATE public.hotels h
SET pool_count = s.shared_pool_count,
    indoor = s.any_indoor,
    outdoor = s.any_outdoor,
    rooftop = s.any_rooftop,
    infinity = s.any_infinity,
    has_active_pool = (s.shared_pool_count > 0),
    updated_at = now()
FROM public.hotel_pool_summary s
WHERE s.hotel_id = h.id AND s.shared_pool_count > 0;