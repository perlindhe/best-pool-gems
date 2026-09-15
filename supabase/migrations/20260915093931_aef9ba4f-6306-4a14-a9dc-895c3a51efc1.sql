
CREATE TYPE public.pool_category AS ENUM (
  'shared_hotel_pool','private_room_pool','shared_swim_up','spa_pool','childrens_pool','plunge_pool','jacuzzi'
);

CREATE TYPE public.pool_fact_status AS ENUM ('research_pending','partially_verified','verified');

CREATE TYPE public.hotel_pool_status AS ENUM ('active_pool','no_pool','pool_closed','pool_construction','unknown');

CREATE TABLE public.hotel_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  pool_name text,
  pool_category public.pool_category NOT NULL DEFAULT 'shared_hotel_pool',
  shared_or_private text NOT NULL DEFAULT 'shared',
  indoor boolean,
  outdoor boolean,
  rooftop boolean,
  infinity_edge boolean,
  heated boolean,
  heating_status text,
  heated_months text,
  year_round boolean,
  seasonal_dates text,
  length_metres numeric,
  approximate_size text,
  saltwater boolean,
  adults_only boolean,
  children_allowed boolean,
  day_pass boolean,
  guest_access text,
  opening_hours text,
  view text,
  source_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  fact_status public.pool_fact_status NOT NULL DEFAULT 'research_pending',
  last_verified date,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hotel_pools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_pools TO authenticated;
GRANT ALL ON public.hotel_pools TO service_role;

ALTER TABLE public.hotel_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY hotel_pools_public_read ON public.hotel_pools FOR SELECT USING (true);
CREATE POLICY hotel_pools_admin_all ON public.hotel_pools FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX hotel_pools_hotel_id_idx ON public.hotel_pools(hotel_id);
CREATE INDEX hotel_pools_category_idx ON public.hotel_pools(pool_category);

CREATE TRIGGER trg_hotel_pools_updated BEFORE UPDATE ON public.hotel_pools
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS pool_status public.hotel_pool_status NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS ranking_eligible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS score_version text,
  ADD COLUMN IF NOT EXISTS score_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS hotels_ranking_eligible_idx ON public.hotels(ranking_eligible);

ALTER TABLE public.hotel_photos
  ADD COLUMN IF NOT EXISTS image_source text,
  ADD COLUMN IF NOT EXISTS image_owner text,
  ADD COLUMN IF NOT EXISTS image_license text,
  ADD COLUMN IF NOT EXISTS permission_status text,
  ADD COLUMN IF NOT EXISTS source_url text;
