
-- Phase 1: canonical hotel data fields + image credit fields
ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS pool_setting text,
  ADD COLUMN IF NOT EXISTS view_type text,
  ADD COLUMN IF NOT EXISTS year_round boolean,
  ADD COLUMN IF NOT EXISTS season text,
  ADD COLUMN IF NOT EXISTS amenities jsonb,
  ADD COLUMN IF NOT EXISTS official_url text,
  ADD COLUMN IF NOT EXISTS affiliate_url text,
  ADD COLUMN IF NOT EXISTS score_last_updated timestamptz,
  ADD COLUMN IF NOT EXISTS editorial_notes text,
  ADD COLUMN IF NOT EXISTS distance_to_beach_m integer,
  ADD COLUMN IF NOT EXISTS pool_floor integer,
  ADD COLUMN IF NOT EXISTS quiet_party_level smallint;

ALTER TABLE public.hotel_photos
  ADD COLUMN IF NOT EXISTS image_credit text,
  ADD COLUMN IF NOT EXISTS license_source text,
  ADD COLUMN IF NOT EXISTS alt_text text;

-- Index for filtering Barcelona guide queries
CREATE INDEX IF NOT EXISTS idx_hotels_city_published ON public.hotels (city_slug, is_published);
CREATE INDEX IF NOT EXISTS idx_hotels_tags ON public.hotels USING gin (tags);
