ALTER TABLE public.hotel_photos
  ADD COLUMN IF NOT EXISTS is_pool boolean,
  ADD COLUMN IF NOT EXISTS pool_score numeric;

CREATE INDEX IF NOT EXISTS hotel_photos_pool_idx
  ON public.hotel_photos (hotel_id, is_pool DESC NULLS LAST, pool_score DESC NULLS LAST, position ASC);