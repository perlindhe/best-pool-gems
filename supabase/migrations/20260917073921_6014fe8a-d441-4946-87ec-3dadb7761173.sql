-- Heating, season and year-round on hotels can no longer be set by hand.
-- They are forced to the value derived from the hotel's pool records.
CREATE OR REPLACE FUNCTION public.derive_hotel_heating(_hotel_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE hs text; ss text;
BEGIN
  SELECT heated_state, season_state INTO hs, ss
  FROM public.hotel_pool_summary WHERE hotel_id = _hotel_id;

  UPDATE public.hotels h SET
    heated_pool = CASE WHEN hs = 'heated' THEN true WHEN hs = 'not_heated' THEN false ELSE NULL END,
    year_round  = CASE WHEN ss = 'year_round' THEN true WHEN ss = 'seasonal' THEN false ELSE NULL END,
    season      = CASE WHEN ss = 'year_round' THEN 'year-round' WHEN ss = 'seasonal' THEN h.season ELSE NULL END
  WHERE h.id = _hotel_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_sync_hotel_heating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.derive_hotel_heating(OLD.hotel_id);
    RETURN OLD;
  END IF;
  PERFORM public.derive_hotel_heating(NEW.hotel_id);
  IF TG_OP = 'UPDATE' AND NEW.hotel_id <> OLD.hotel_id THEN
    PERFORM public.derive_hotel_heating(OLD.hotel_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hotel_pools_sync_heating ON public.hotel_pools;
CREATE TRIGGER hotel_pools_sync_heating
AFTER INSERT OR UPDATE OR DELETE ON public.hotel_pools
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_hotel_heating();

-- Scope of this step: the technical test hotel only.
SELECT public.derive_hotel_heating(id) FROM public.hotels
WHERE slug = 'los-angeles-hotel-june-west-la';