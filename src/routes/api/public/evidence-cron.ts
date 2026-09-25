import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled evidence scoring. Called by pg_cron. Each run:
 * - verifies the cron token stored in evidence_automation_state
 * - takes a single-flight lease
 * - processes a small batch of the hotels with the oldest (or no) evidence report
 * - lets the system approve / withdraw scores automatically (no human step)
 * - pauses itself on AI credit / policy errors (402/403) and probes one hotel per run until it works again
 */
const BATCH = 4;
const STALE_DAYS = 7;
const LEASE_MIN = 15;

function isCreditError(msg: string) {
  return /\b40[23]\b|credit|payment required|limit_reached/i.test(msg);
}

export const Route = createFileRoute("/api/public/evidence-cron")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const token = request.headers.get("x-cron-token") ?? "";
        const { data: state } = await supabaseAdmin
          .from("evidence_automation_state" as never)
          .select("*")
          .eq("id", 1)
          .maybeSingle();
        const s = state as unknown as {
          cron_token: string;
          locked_until: string | null;
          paused_reason: string | null;
        } | null;
        if (!s || !token || token !== s.cron_token) return new Response("Unauthorized", { status: 401 });

        const now = new Date();
        if (s.locked_until && new Date(s.locked_until) > now)
          return Response.json({ skipped: "locked" });
        const lease = new Date(now.getTime() + LEASE_MIN * 60_000).toISOString();
        await supabaseAdmin
          .from("evidence_automation_state" as never)
          .update({ locked_until: lease, updated_at: now.toISOString() } as never)
          .eq("id", 1);

        try {
          const limit = s.paused_reason ? 1 : BATCH; // paused → one probe
          const cutoff = new Date(now.getTime() - STALE_DAYS * 86_400_000).toISOString();
          const [{ data: hotels }, { data: reports }] = await Promise.all([
            supabaseAdmin.from("hotels").select("id, slug"),
            supabaseAdmin.from("pool_scores_evidence").select("hotel_id, calculated_at"),
          ]);
          const done = new Map(
            ((reports ?? []) as Array<{ hotel_id: string; calculated_at: string }>).map((r) => [
              r.hotel_id,
              r.calculated_at,
            ]),
          );
          const due = ((hotels ?? []) as Array<{ id: string; slug: string }>)
            .filter((h) => !done.has(h.id) || done.get(h.id)! < cutoff)
            .sort((a, b) => (done.get(a.id) ?? "").localeCompare(done.get(b.id) ?? ""))
            .slice(0, limit)
            .map((h) => h.slug);

          if (due.length === 0) {
            await supabaseAdmin
              .from("evidence_automation_state" as never)
              .update({ last_run_at: now.toISOString(), last_result: { idle: true }, paused_reason: null, paused_at: null } as never)
              .eq("id", 1);
            return Response.json({ idle: true });
          }

          const { runEvidenceAutomation } = await import("@/server/evidence-score.server");
          const res = await runEvidenceAutomation({ slugs: due, limit: due.length });
          const creditErr = res.results.find((r) => r.error && isCreditError(r.error));
          const anyOk = res.results.some((r) => !r.error && r.collected !== undefined);
          const patch: Record<string, unknown> = {
            last_run_at: now.toISOString(),
            last_result: res.results as never,
          };
          if (creditErr) {
            patch.paused_reason = creditErr.error;
            patch.paused_at = now.toISOString();
          } else if (anyOk) {
            patch.paused_reason = null;
            patch.paused_at = null;
          }
          await supabaseAdmin.from("evidence_automation_state" as never).update(patch as never).eq("id", 1);
          return Response.json({ processed: due, paused: Boolean(creditErr) });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          await supabaseAdmin
            .from("evidence_automation_state" as never)
            .update({
              last_run_at: now.toISOString(),
              last_result: { error: msg },
              ...(isCreditError(msg) ? { paused_reason: msg, paused_at: now.toISOString() } : {}),
            } as never)
            .eq("id", 1);
          return Response.json({ error: msg }, { status: 500 });
        } finally {
          await supabaseAdmin
            .from("evidence_automation_state" as never)
            .update({ locked_until: null } as never)
            .eq("id", 1);
        }
      },
    },
  },
});
