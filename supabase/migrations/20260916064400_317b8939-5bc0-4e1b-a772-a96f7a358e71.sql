-- Sync stored score facts with the canonical hotel record
UPDATE public.pool_scores s
SET facts = COALESCE(s.facts, '{}'::jsonb)
            || jsonb_build_object(
                 'pool_count', h.pool_count,
                 'is_heated', h.heated_pool,
                 'is_rooftop', h.rooftop,
                 'has_indoor', h.indoor,
                 'has_outdoor', h.outdoor
               )
FROM public.hotels h
WHERE h.id = s.hotel_id;

-- Hotels with no documented pool must not claim to have one
UPDATE public.hotels
SET has_pool = NULL,
    updated_at = now()
WHERE COALESCE(pool_count, 0) = 0 AND has_pool IS NOT NULL;

-- Fully verified requires a documented, active pool
UPDATE public.hotels
SET verification_status = 'partially_verified',
    updated_at = now()
WHERE verification_status = 'verified'
  AND COALESCE(has_active_pool, false) = false;