UPDATE public.hotel_pools p
SET length_metres = 22,
    season_state = 'year_round',
    year_round = true,
    seasonal_dates = NULL,
    opening_hours = 'Daily 07:00-19:00',
    view = COALESCE(p.view, 'Chao Phraya river'),
    infinity_edge = true,
    source_urls = '["https://www.thesiamhotel.com/riverside-infinity-pool/"]'::jsonb,
    last_verified = CURRENT_DATE,
    updated_at = now()
FROM public.hotels h
WHERE h.id = p.hotel_id
  AND h.slug = 'bangkok-the-siam'
  AND p.pool_category = 'shared_hotel_pool';