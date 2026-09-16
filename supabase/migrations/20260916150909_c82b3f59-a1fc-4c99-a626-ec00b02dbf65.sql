UPDATE public.hotels
SET score_approved_by = 'Editorial team',
    score_approved_at = now(),
    updated_at = now()
WHERE slug IN (
  'barcelona-grand-hotel-central',
  'los-angeles-the-hollywood-roosevelt',
  'mallorca-hotel-can-bordoy-grand-house-and-garden',
  'los-angeles-hotel-june-west-la',
  'barcelona-1898',
  'sydney-intercontinental-sydney',
  'sydney-w-sydney'
);