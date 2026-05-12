CREATE TABLE public.pool_quotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid NOT NULL,
  source text NOT NULL,
  quote text NOT NULL,
  author text,
  source_url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_pool_quotes_hotel ON public.pool_quotes(hotel_id, position);

ALTER TABLE public.pool_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pool_quotes_public_read" ON public.pool_quotes
  FOR SELECT USING (true);

CREATE POLICY "pool_quotes_admin_all" ON public.pool_quotes
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));