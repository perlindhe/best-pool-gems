WITH agg AS (
  SELECT hotel_id,
         COUNT(*) FILTER (WHERE shared_or_private = 'shared' AND pool_category IN ('shared_hotel_pool','shared_swim_up','plunge_pool')) AS shared_count,
         BOOL_OR(heated IS TRUE) AS any_heated
  FROM public.hotel_pools
  GROUP BY hotel_id
)
UPDATE public.hotels h
SET pool_count = CASE WHEN a.shared_count > 0 THEN a.shared_count::int ELSE NULL END,
    heated_pool = CASE WHEN a.any_heated THEN true ELSE NULL END
FROM agg a
WHERE a.hotel_id = h.id;