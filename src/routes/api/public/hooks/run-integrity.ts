import { createFileRoute } from "@tanstack/react-router";
import { runIntegrityChecks } from "@/server/integrity.server";

const headers = { "Content-Type": "application/json" };

/**
 * Run the full data-integrity QA sweep and persist qa_blocked state.
 * Protected by the publishable key so it can be triggered by a scheduler.
 */
export const Route = createFileRoute("/api/public/hooks/run-integrity")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!expected || apikey !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }
        const url = new URL(request.url);
        const summaryOnly = url.searchParams.get("summary") === "1";
        const result = await runIntegrityChecks({
          checkLinks: url.searchParams.get("check_links") === "1",
        });
        const body = summaryOnly
          ? {
              checkedHotels: result.checkedHotels,
              blockedHotels: result.blockedHotels,
              counts: result.counts,
              topChecks: Object.entries(
                result.issues.reduce<Record<string, number>>((acc, i) => {
                  acc[`${i.severity}: ${i.check}`] = (acc[`${i.severity}: ${i.check}`] ?? 0) + 1;
                  return acc;
                }, {}),
              ).sort((a, b) => b[1] - a[1]),
            }
          : result;
        return new Response(JSON.stringify(body), { headers });
      },
    },
  },
});
