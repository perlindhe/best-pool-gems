UPDATE public.pool_scores ps
SET facts = jsonb_strip_nulls(
      COALESCE(ps.facts, '{}'::jsonb)
      || jsonb_build_object('pool_count', to_jsonb(h.pool_count))
      || jsonb_build_object('is_heated', to_jsonb(h.heated_pool))
    )
FROM public.hotels h
WHERE h.id = ps.hotel_id
  AND ps.facts IS NOT NULL;