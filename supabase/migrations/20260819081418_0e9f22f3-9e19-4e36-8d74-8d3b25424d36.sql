DROP POLICY IF EXISTS hotels_public_read ON public.hotels;
CREATE POLICY hotels_public_read ON public.hotels
FOR SELECT
USING (
  is_published = true
  AND coalesce(hotel_status, 'active') = 'active'
  AND canonical_hotel_id IS NULL
);