-- The Siam: villa pools are private room pools, never shared swimming pools
UPDATE public.hotel_pools p
SET pool_category = 'private_room_pool',
    shared_or_private = 'private',
    existence_state = 'confirmed_official',
    fact_status = 'partially_verified'
FROM public.hotels h
WHERE p.hotel_id = h.id
  AND h.slug = 'bangkok-the-siam'
  AND p.pool_name ILIKE '%Pool Villa Pool%';

UPDATE public.hotel_pools p
SET existence_state = 'confirmed_official',
    heating_state = 'unknown',
    heated = NULL
FROM public.hotels h
WHERE p.hotel_id = h.id
  AND h.slug = 'bangkok-the-siam'
  AND p.pool_name = 'Riverside Infinity Pool';

-- Hotel 1898: indoor pool is the spa pool (heated, year-round); rooftop is seasonal
UPDATE public.hotel_pools p
SET pool_category = 'spa_pool',
    indoor = true,
    outdoor = false,
    heating_state = 'confirmed_heated',
    heated = true,
    season_state = 'year_round',
    year_round = true,
    existence_state = 'confirmed_official',
    fact_status = 'partially_verified'
FROM public.hotels h
WHERE p.hotel_id = h.id AND h.slug = 'barcelona-1898' AND p.pool_name = 'Spa indoor pool';

UPDATE public.hotel_pools p
SET season_state = 'seasonal',
    seasonal_dates = COALESCE(p.seasonal_dates, 'April–October'),
    year_round = false,
    existence_state = 'confirmed_official',
    fact_status = 'partially_verified'
FROM public.hotels h
WHERE p.hotel_id = h.id AND h.slug = 'barcelona-1898' AND p.pool_name = 'Rooftop outdoor pool';

-- Can Bordoy, June West, Park Hyatt: existing records confirmed as separate pools
UPDATE public.hotel_pools p
SET existence_state = 'confirmed_official',
    fact_status = 'partially_verified'
FROM public.hotels h
WHERE p.hotel_id = h.id
  AND h.slug IN (
    'mallorca-hotel-can-bordoy-grand-house-and-garden',
    'los-angeles-hotel-june-west-la',
    'sydney-park-hyatt-sydney'
  );

-- Hotel-level summary values recalculated from the pool records
WITH t AS (SELECT id, slug FROM public.hotels WHERE slug IN (
  'bangkok-the-siam','barcelona-1898','mallorca-hotel-can-bordoy-grand-house-and-garden',
  'los-angeles-hotel-june-west-la','sydney-park-hyatt-sydney')),
agg AS (
  SELECT t.id,
    bool_or(p.heating_state = 'confirmed_heated') AS any_heated,
    bool_and(p.heating_state = 'confirmed_not_heated') AS all_not_heated,
    bool_or(p.season_state = 'year_round') AS any_year_round,
    bool_or(p.season_state = 'seasonal') AS any_seasonal,
    bool_or(p.indoor) AS any_indoor,
    bool_or(p.outdoor) AS any_outdoor,
    bool_or(p.rooftop) AS any_rooftop,
    count(*) FILTER (
      WHERE p.shared_or_private = 'shared'
        AND p.pool_category IN ('shared_hotel_pool','shared_swim_up')
    ) AS shared_pools
  FROM t LEFT JOIN public.hotel_pools p ON p.hotel_id = t.id
  GROUP BY t.id
)
UPDATE public.hotels h
SET heated_pool = CASE WHEN agg.any_heated THEN true
                       WHEN agg.all_not_heated THEN false ELSE NULL END,
    year_round = CASE WHEN agg.any_year_round THEN true ELSE NULL END,
    indoor = agg.any_indoor,
    outdoor = agg.any_outdoor,
    rooftop = agg.any_rooftop,
    has_active_pool = (agg.shared_pools > 0),
    pool_status = CASE WHEN agg.shared_pools > 0 THEN 'active_pool'::hotel_pool_status ELSE 'unknown'::hotel_pool_status END
FROM agg
WHERE h.id = agg.id;

-- Status, ranking and score gating for the five test hotels
UPDATE public.hotels
SET verification_status = 'partially_verified',
    ranking_eligible = false,
    score_approved_by = NULL,
    score_approved_at = NULL,
    qa_blocked = false,
    qa_blocked_reasons = '[]'::jsonb
WHERE slug IN (
  'bangkok-the-siam','barcelona-1898','mallorca-hotel-can-bordoy-grand-house-and-garden',
  'los-angeles-hotel-june-west-la','sydney-park-hyatt-sydney');

-- No numeric Pool Score on a profile that is not fully verified
UPDATE public.pool_scores s
SET pool_score_0_10 = NULL, components = NULL
FROM public.hotels h
WHERE s.hotel_id = h.id AND h.slug IN (
  'bangkok-the-siam','barcelona-1898','mallorca-hotel-can-bordoy-grand-house-and-garden',
  'los-angeles-hotel-june-west-la','sydney-park-hyatt-sydney');