UPDATE public.hotels
SET score_approved_by = 'Editorial team',
    score_approved_at = now(),
    updated_at = now()
WHERE slug IN ('bangkok-the-peninsula-bangkok','sydney-park-hyatt-sydney')
  AND verification_status = 'verified'
  AND has_active_pool = true
  AND score_approved_by IS NULL;