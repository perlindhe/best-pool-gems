CREATE TABLE public.evidence_automation_state (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  cron_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  locked_until timestamptz,
  paused_reason text,
  paused_at timestamptz,
  last_run_at timestamptz,
  last_result jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.evidence_automation_state TO service_role;
GRANT SELECT ON public.evidence_automation_state TO authenticated;
ALTER TABLE public.evidence_automation_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY evidence_automation_state_admin_read ON public.evidence_automation_state
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
INSERT INTO public.evidence_automation_state (id) VALUES (1) ON CONFLICT DO NOTHING;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;