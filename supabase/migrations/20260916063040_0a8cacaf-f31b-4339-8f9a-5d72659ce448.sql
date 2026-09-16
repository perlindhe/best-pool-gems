
WITH tg AS (
  SELECT id, slug FROM public.hotels WHERE slug IN (
    'sydney-hyatt-regency-sydney','sydney-park-hyatt-sydney','sydney-w-sydney','sydney-intercontinental-sydney',
    'sydney-ace-hotel-sydney','sydney-qt-sydney','sydney-capella-sydney','barcelona-hotel-arts','barcelona-1898',
    'los-angeles-hotel-june-west-la','mallorca-hotel-can-bordoy-grand-house-and-garden','los-angeles-the-maybourne-beverly-hills',
    'mallorca-jumeirah-port-soller','bangkok-the-peninsula-bangkok','minos-palace-hotel-suites','london-shangri-la-the-shard',
    'london-bvlgari-hotel-london','barcelona-grand-hotel-central','los-angeles-the-hollywood-roosevelt','porto-elounda-golf-spa-resort')
)
DELETE FROM public.hotel_pools p USING tg
WHERE p.hotel_id = tg.id
  AND (
    (tg.slug = 'sydney-w-sydney' AND p.pool_name ILIKE '%Westin Las Vegas%')
    OR (tg.slug = 'bangkok-the-peninsula-bangkok' AND p.pool_name = 'Large Swimming Pools')
    OR (tg.slug = 'mallorca-jumeirah-port-soller' AND p.pool_name IN ('Outdoor Pool 1','Outdoor Pool 2'))
  );

UPDATE public.hotel_pools p
SET pool_category = 'shared_hotel_pool', indoor = true, outdoor = false
FROM public.hotels h
WHERE p.hotel_id = h.id AND h.slug = 'barcelona-1898' AND p.pool_name = 'Spa indoor pool';

UPDATE public.hotel_pools p
SET rooftop = false
FROM public.hotels h
WHERE p.hotel_id = h.id AND h.slug = 'sydney-intercontinental-sydney' AND p.indoor IS TRUE;

UPDATE public.hotel_pools SET length_metres = round(length_metres, 1) WHERE length_metres IS NOT NULL;

-- Remove placeholder / unsupported Pool Scores in the test group.
DELETE FROM public.pool_scores s USING public.hotels h
WHERE s.hotel_id = h.id
  AND h.slug IN ('barcelona-hotel-arts','sydney-capella-sydney','sydney-ace-hotel-sydney','sydney-hyatt-regency-sydney','sydney-qt-sydney');

UPDATE public.pool_scores s
SET pool_type = NULLIF(NULLIF(NULLIF(NULLIF(s.pool_type,'N/A'),'Undetermined'),'No information available'),'No Pool'),
    best_time = NULLIF(NULLIF(NULLIF(s.best_time,'N/A'),'Undetermined'),'Unknown')
FROM public.hotels h
WHERE s.hotel_id = h.id AND h.slug IN (
  'sydney-hyatt-regency-sydney','sydney-park-hyatt-sydney','sydney-w-sydney','sydney-intercontinental-sydney',
  'sydney-ace-hotel-sydney','sydney-qt-sydney','sydney-capella-sydney','barcelona-hotel-arts','barcelona-1898',
  'los-angeles-hotel-june-west-la','mallorca-hotel-can-bordoy-grand-house-and-garden','los-angeles-the-maybourne-beverly-hills',
  'mallorca-jumeirah-port-soller','bangkok-the-peninsula-bangkok','minos-palace-hotel-suites','london-shangri-la-the-shard',
  'london-bvlgari-hotel-london','barcelona-grand-hotel-central','los-angeles-the-hollywood-roosevelt','porto-elounda-golf-spa-resort');

UPDATE public.hotels
SET pool_type = NULLIF(NULLIF(NULLIF(NULLIF(pool_type,'N/A'),'Undetermined'),'No information available'),'No Pool')
WHERE slug IN (
  'sydney-hyatt-regency-sydney','sydney-park-hyatt-sydney','sydney-w-sydney','sydney-intercontinental-sydney',
  'sydney-ace-hotel-sydney','sydney-qt-sydney','sydney-capella-sydney','barcelona-hotel-arts','barcelona-1898',
  'los-angeles-hotel-june-west-la','mallorca-hotel-can-bordoy-grand-house-and-garden','los-angeles-the-maybourne-beverly-hills',
  'mallorca-jumeirah-port-soller','bangkok-the-peninsula-bangkok','minos-palace-hotel-suites','london-shangri-la-the-shard',
  'london-bvlgari-hotel-london','barcelona-grand-hotel-central','los-angeles-the-hollywood-roosevelt','porto-elounda-golf-spa-resort');

-- Sync canonical hotel-level facts with the normalised pool records (test group only).
UPDATE public.hotels h
SET pool_count = COALESCE(s.shared_pool_count::int, 0),
    indoor = s.any_indoor,
    outdoor = s.any_outdoor,
    rooftop = s.any_rooftop,
    infinity = s.any_infinity,
    saltwater = s.any_saltwater,
    adults_only = s.all_adults_only,
    children_allowed = s.any_children_allowed,
    heated_pool = CASE WHEN s.heated_state = 'heated' THEN true WHEN s.heated_state = 'not_heated' THEN false ELSE NULL END,
    year_round = CASE WHEN s.season_state = 'year_round' THEN true ELSE NULL END,
    has_active_pool = COALESCE(s.shared_pool_count,0) > 0,
    pool_status = CASE WHEN COALESCE(s.shared_pool_count,0) > 0 THEN 'active_pool'::hotel_pool_status ELSE 'unknown'::hotel_pool_status END,
    ranking_eligible = COALESCE(s.shared_pool_count,0) > 0,
    updated_at = now()
FROM public.hotel_pool_summary s
WHERE s.hotel_id = h.id AND h.slug IN (
  'sydney-hyatt-regency-sydney','sydney-park-hyatt-sydney','sydney-w-sydney','sydney-intercontinental-sydney',
  'sydney-ace-hotel-sydney','sydney-qt-sydney','sydney-capella-sydney','barcelona-hotel-arts','barcelona-1898',
  'los-angeles-hotel-june-west-la','mallorca-hotel-can-bordoy-grand-house-and-garden','los-angeles-the-maybourne-beverly-hills',
  'mallorca-jumeirah-port-soller','bangkok-the-peninsula-bangkok','minos-palace-hotel-suites','london-shangri-la-the-shard',
  'london-bvlgari-hotel-london','barcelona-grand-hotel-central','los-angeles-the-hollywood-roosevelt','porto-elounda-golf-spa-resort');

-- Hotels in the test group with no documented pool at all.
UPDATE public.hotels
SET pool_count = 0, has_active_pool = false, ranking_eligible = false,
    indoor = NULL, outdoor = NULL, rooftop = NULL, heated_pool = NULL, year_round = NULL,
    pool_status = CASE WHEN slug IN ('sydney-hyatt-regency-sydney','sydney-qt-sydney') THEN 'no_pool'::hotel_pool_status ELSE 'unknown'::hotel_pool_status END,
    updated_at = now()
WHERE slug IN ('sydney-hyatt-regency-sydney','sydney-qt-sydney','sydney-ace-hotel-sydney');
