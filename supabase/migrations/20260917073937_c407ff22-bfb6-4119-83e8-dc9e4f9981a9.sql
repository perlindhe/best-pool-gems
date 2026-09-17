REVOKE ALL ON FUNCTION public.derive_hotel_heating(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_sync_hotel_heating() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.derive_hotel_heating(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.trg_sync_hotel_heating() TO service_role;