CREATE OR REPLACE FUNCTION public.normalize_hotel_data()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.country := CASE lower(trim(NEW.country))
    WHEN 'spanien' THEN 'Spain' WHEN 'españa' THEN 'Spain' WHEN 'espana' THEN 'Spain'
    WHEN 'usa' THEN 'United States' WHEN 'us' THEN 'United States' WHEN 'united states of america' THEN 'United States'
    WHEN 'uk' THEN 'United Kingdom' WHEN 'storbritannien' THEN 'United Kingdom'
    WHEN 'grekland' THEN 'Greece' WHEN 'frankrike' THEN 'France' WHEN 'australien' THEN 'Australia'
    ELSE trim(NEW.country) END;
  NEW.city := trim(NEW.city);
  -- Empty, zero and placeholder text never reaches the public as a fact.
  IF NEW.pool_size IS NOT NULL AND (trim(NEW.pool_size) = '' OR NEW.pool_size ~* '^\s*0+([.,]0+)?\s*(m|m2|m²|sqm|metres|meters)?\s*$' OR lower(trim(NEW.pool_size)) IN ('unknown','n/a','na','none','null','tbd','-','—')) THEN NEW.pool_size := NULL; END IF;
  IF NEW.pool_opening_hours IS NOT NULL AND trim(NEW.pool_opening_hours) = '' THEN NEW.pool_opening_hours := NULL; END IF;
  IF NEW.season IS NOT NULL AND trim(NEW.season) = '' THEN NEW.season := NULL; END IF;
  IF NEW.neighborhood IS NOT NULL AND trim(NEW.neighborhood) = '' THEN NEW.neighborhood := NULL; END IF;
  IF NEW.pool_view IS NOT NULL AND trim(NEW.pool_view) = '' THEN NEW.pool_view := NULL; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_hotels_normalize BEFORE INSERT OR UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION public.normalize_hotel_data();

CREATE OR REPLACE FUNCTION public.normalize_pool_data()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.length_metres IS NOT NULL AND NEW.length_metres <= 0 THEN NEW.length_metres := NULL; END IF;
  IF NEW.area_sqm IS NOT NULL AND NEW.area_sqm <= 0 THEN NEW.area_sqm := NULL; END IF;
  IF NEW.approximate_size IS NOT NULL AND (trim(NEW.approximate_size) = '' OR NEW.approximate_size ~* '^\s*0+([.,]0+)?\s*(m|m2|m²|sqm|metres|meters)?\s*$') THEN NEW.approximate_size := NULL; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_hotel_pools_normalize BEFORE INSERT OR UPDATE ON public.hotel_pools FOR EACH ROW EXECUTE FUNCTION public.normalize_pool_data();