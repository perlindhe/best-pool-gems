CREATE TABLE public.hotel_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  source text NOT NULL,
  url text NOT NULL,
  width integer,
  height integer,
  attribution text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(hotel_id, url)
);

CREATE INDEX idx_hotel_photos_hotel ON public.hotel_photos(hotel_id, position);

ALTER TABLE public.hotel_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hotel_photos_public_read" ON public.hotel_photos
  FOR SELECT USING (true);

CREATE POLICY "hotel_photos_admin_all" ON public.hotel_photos
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));