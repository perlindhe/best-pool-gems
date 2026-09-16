
CREATE OR REPLACE FUNCTION public.sync_hotel_pool_count(_hotel_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.hotels h
  SET pool_count = (
    SELECT count(*) FROM public.hotel_pools p
    WHERE p.hotel_id = _hotel_id
      AND p.shared_or_private = 'shared'
      AND p.pool_category IN ('shared_hotel_pool','shared_swim_up')
  )
  WHERE h.id = _hotel_id;
$$;

CREATE OR REPLACE FUNCTION public.trg_sync_hotel_pool_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.sync_hotel_pool_count(OLD.hotel_id);
    RETURN OLD;
  END IF;
  PERFORM public.sync_hotel_pool_count(NEW.hotel_id);
  IF TG_OP = 'UPDATE' AND NEW.hotel_id IS DISTINCT FROM OLD.hotel_id THEN
    PERFORM public.sync_hotel_pool_count(OLD.hotel_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hotel_pools_sync_count ON public.hotel_pools;
CREATE TRIGGER hotel_pools_sync_count
AFTER INSERT OR UPDATE OR DELETE ON public.hotel_pools
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_hotel_pool_count();

UPDATE public.hotels h
SET pool_count = sub.cnt
FROM (
  SELECT hh.id, (
    SELECT count(*) FROM public.hotel_pools p
    WHERE p.hotel_id = hh.id
      AND p.shared_or_private = 'shared'
      AND p.pool_category IN ('shared_hotel_pool','shared_swim_up')
  ) AS cnt
  FROM public.hotels hh
) sub
WHERE sub.id = h.id AND h.pool_count IS DISTINCT FROM sub.cnt;
