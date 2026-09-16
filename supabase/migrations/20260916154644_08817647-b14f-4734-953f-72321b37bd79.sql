
REVOKE ALL ON FUNCTION public.sync_hotel_pool_count(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_sync_hotel_pool_count() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_hotel_pool_count(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.trg_sync_hotel_pool_count() TO service_role;
