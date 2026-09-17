-- 1. Guest pool comments
CREATE TABLE public.pool_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  source text NOT NULL,
  source_url text,
  author text,
  published_at date,
  raw_text text NOT NULL,
  normalized_text text NOT NULL,
  text_hash text NOT NULL,
  stay_group_key text,
  is_owner_content boolean NOT NULL DEFAULT false,
  relevance text NOT NULL DEFAULT 'unclassified',
  sentiment text NOT NULL DEFAULT 'unclear',
  editor_sentiment text,
  editor_relevance text,
  is_duplicate_of uuid REFERENCES public.pool_comments(id) ON DELETE SET NULL,
  excluded_reason text,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pool_comments_hash_unique UNIQUE (hotel_id, text_hash),
  CONSTRAINT pool_comments_relevance_chk CHECK (relevance IN ('pool','not_pool','unclear','unclassified')),
  CONSTRAINT pool_comments_sentiment_chk CHECK (sentiment IN ('positive','neutral','negative','unclear','irrelevant')),
  CONSTRAINT pool_comments_editor_sentiment_chk CHECK (editor_sentiment IS NULL OR editor_sentiment IN ('positive','neutral','negative','unclear','irrelevant'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pool_comments TO authenticated;
GRANT ALL ON public.pool_comments TO service_role;
ALTER TABLE public.pool_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY pool_comments_admin_all ON public.pool_comments FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_pool_comments_updated BEFORE UPDATE ON public.pool_comments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX pool_comments_hotel_idx ON public.pool_comments(hotel_id);

-- 2. External editorial mentions
CREATE TABLE public.external_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  url text NOT NULL,
  canonical_url text,
  publication text,
  author text,
  published_at date,
  tier text,
  is_about_pool boolean,
  is_positive boolean,
  excluded_reason text,
  notes text,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT external_mentions_url_unique UNIQUE (hotel_id, url),
  CONSTRAINT external_mentions_tier_chk CHECK (tier IS NULL OR tier IN ('A','B','C'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.external_mentions TO authenticated;
GRANT SELECT ON public.external_mentions TO anon;
GRANT ALL ON public.external_mentions TO service_role;
ALTER TABLE public.external_mentions ENABLE ROW LEVEL SECURITY;
CREATE POLICY external_mentions_admin_all ON public.external_mentions FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY external_mentions_public_read ON public.external_mentions FOR SELECT
  USING (approved_at IS NOT NULL);
CREATE TRIGGER trg_external_mentions_updated BEFORE UPDATE ON public.external_mentions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX external_mentions_hotel_idx ON public.external_mentions(hotel_id);

-- 3. Verified pool size on the pool records
ALTER TABLE public.hotel_pools
  ADD COLUMN IF NOT EXISTS area_sqm numeric,
  ADD COLUMN IF NOT EXISTS size_source_url text,
  ADD COLUMN IF NOT EXISTS size_verified boolean NOT NULL DEFAULT false;

-- 4. Evidence-based score record
CREATE TABLE public.pool_scores_evidence (
  hotel_id uuid PRIMARY KEY REFERENCES public.hotels(id) ON DELETE CASCADE,
  guest_sentiment_points numeric,
  heating_points numeric,
  pool_count_points numeric,
  pool_size_points numeric,
  external_recognition_points numeric,
  total_points numeric,
  score_out_of_ten numeric,
  verification_status text NOT NULL DEFAULT 'research_pending',
  confidence_level text NOT NULL DEFAULT 'low',
  blocking_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  score_version text NOT NULL DEFAULT 'evidence-v1',
  calculated_at timestamptz NOT NULL DEFAULT now(),
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pse_status_chk CHECK (verification_status IN ('research_pending','partially_verified','fully_verified','conflicting_data','no_active_pool')),
  CONSTRAINT pse_confidence_chk CHECK (confidence_level IN ('low','medium','high')),
  CONSTRAINT pse_total_chk CHECK (total_points IS NULL OR (total_points >= 0 AND total_points <= 100))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pool_scores_evidence TO authenticated;
GRANT SELECT ON public.pool_scores_evidence TO anon;
GRANT ALL ON public.pool_scores_evidence TO service_role;
ALTER TABLE public.pool_scores_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY pse_admin_all ON public.pool_scores_evidence FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY pse_public_read ON public.pool_scores_evidence FOR SELECT
  USING (approved_at IS NOT NULL);