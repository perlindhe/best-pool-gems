UPDATE public.pool_scores s
SET pool_score_0_10 = NULL, components = NULL
FROM public.hotels h
WHERE s.hotel_id = h.id
  AND h.slug = 'new-york-le-parker-meridien'
  AND h.verification_status <> 'verified';