import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyHotelHasPool } from "@/server/pool-verification.server";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export const Route = createFileRoute("/api/public/hooks/verify-pool-existence")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apikey !== expected) {
          return json({ error: "Unauthorized" }, 401);
        }

        const url = new URL(request.url);
        const force = url.searchParams.get("force") === "1";
        const onlyHotelId = url.searchParams.get("hotel_id");

        let q = supabaseAdmin
          .from("hotels")
          .select("id, name")
          .eq("is_published", true);
        if (onlyHotelId) q = q.eq("id", onlyHotelId);
        if (!force) q = q.is("has_pool", null);
        const { data: hotels, error } = await q;
        if (error) return json({ error: error.message }, 500);

        const results: Array<{
          id: string;
          name: string;
          has_pool?: boolean;
          notes?: string;
          status: string;
        }> = [];

        for (const h of hotels ?? []) {
          try {
            const r = await verifyHotelHasPool(h.id as string);
            results.push({
              id: h.id as string,
              name: h.name as string,
              has_pool: r.has_pool,
              notes: r.notes,
              status: r.notes === "inconclusive" ? "skipped" : "ok",
            });
          } catch (e) {
            results.push({
              id: h.id as string,
              name: h.name as string,
              status: "error",
              notes: e instanceof Error ? e.message : String(e),
            });
          }
          // Light throttle to be nice to Firecrawl + Google
          await new Promise((res) => setTimeout(res, 300));
        }

        const summary = {
          total: results.length,
          confirmed: results.filter((r) => r.has_pool === true).length,
          rejected: results.filter((r) => r.has_pool === false).length,
          inconclusive: results.filter((r) => r.status === "skipped").length,
          errors: results.filter((r) => r.status === "error").length,
        };

        return json({ summary, results, ran_at: new Date().toISOString() });
      },
    },
  },
});
