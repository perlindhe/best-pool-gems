DO $$ BEGIN
  CREATE TYPE public.editorial_status AS ENUM ('draft','review','published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS editorial_status public.editorial_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS verified_by text,
  ADD COLUMN IF NOT EXISTS verification_notes text,
  ADD COLUMN IF NOT EXISTS primary_source_url text,
  ADD COLUMN IF NOT EXISTS secondary_source_url text;

UPDATE public.hotels SET editorial_status = 'published' WHERE is_published = true;

CREATE INDEX IF NOT EXISTS hotels_editorial_status_idx ON public.hotels (editorial_status);
CREATE INDEX IF NOT EXISTS hotels_verification_status_idx ON public.hotels (verification_status);