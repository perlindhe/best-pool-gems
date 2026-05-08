ALTER TABLE public.pool_scores
  ADD COLUMN IF NOT EXISTS facts jsonb;