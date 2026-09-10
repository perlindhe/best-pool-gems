UPDATE public.hotels
SET pool_count = 1,
    pool_type = 'Outdoor pool',
    rooftop = false,
    indoor = false,
    outdoor = true,
    heated_pool = NULL,
    pool_view = 'Terraced gardens and Mediterranean beachfront',
    verification_status = 'partially_verified',
    verification_notes = 'Official Ritz-Carlton page confirms one outdoor pool set in terraced gardens with an outdoor hot tub. Heating, exact pool size and any Club-level second pool are not confirmed by the official site; left unset rather than estimated.',
    primary_source_url = 'https://www.ritzcarlton.com/en/hotels/bcnrz-hotel-arts-barcelona/experiences/',
    last_verified_date = CURRENT_DATE
WHERE slug = 'barcelona-hotel-arts';

UPDATE public.pool_scores ps
SET facts = COALESCE(ps.facts, '{}'::jsonb) || jsonb_build_object('pool_count', 1, 'is_rooftop', false, 'has_outdoor', true, 'has_indoor', false),
    updated_at = now()
FROM public.hotels h
WHERE h.id = ps.hotel_id AND h.slug = 'barcelona-hotel-arts';