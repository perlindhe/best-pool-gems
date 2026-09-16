DELETE FROM public.pool_scores s
USING public.hotels h
WHERE h.id = s.hotel_id
  AND h.slug IN ('new-york-the-standard-high-line', 'paris-sofitel-paris-le-faubourg');

UPDATE public.pool_scores
SET best_time = NULL
WHERE best_time ~* '^(n/?a|unknown|undetermined|no information( available)?)\.?$';

UPDATE public.pool_scores
SET pool_type = NULL
WHERE pool_type ~* '(n/?a|unknown|undetermined|no information|no pool confirmed)';

UPDATE public.pool_scores
SET editorial_notes = NULL
WHERE editorial_notes ~* '(N/A|Undetermined|No information available|no information about|no evidence to suggest)';