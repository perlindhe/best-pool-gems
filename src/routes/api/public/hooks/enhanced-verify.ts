import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runEnhancedVerification } from "@/server/enhanced-verification.server";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export const Route = createFileRoute("/api/public/hooks/enhanced-verify")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apikey !== expected) return json({ error: "Unauthorized" }, 401);

        const url = new URL(request.url);
        const slug = url.searchParams.get("hotel_slug");
        const city = url.searchParams.get("city_slug");
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 20) || 20, 40);
        const onlyPending = url.searchParams.get("pending_only") === "1";

        let q = supabaseAdmin
          .from("hotels")
          .select("id, slug")
          .eq("is_published", true)
          .eq("hotel_status", "active")
          .is("canonical_hotel_id", null);

        if (slug) q = q.eq("slug", slug);
        if (city) q = q.eq("city_slug", city);
        if (onlyPending) {
          q = q.in("verification_status", ["partially_verified", "research_pending"]);
        }

        const { data: rows, error } = await q.limit(400);
        if (error) return json({ error: error.message }, 500);

        const targets = (rows ?? []).slice(0, limit);
        const results: unknown[] = [];

        for (const t of targets) {
          try {
            results.push(await runEnhancedVerification(t.id as string));
          } catch (e) {
            results.push({
              slug: t.slug,
              status: "error",
              reason: e instanceof Error ? e.message : String(e),
            });
          }
          // Light throttle to be nice to external APIs and AI gateway.
          await new Promise((res) => setTimeout(res, 400));
        }

        const summary = {
          candidates: (rows ?? []).length,
          processed: results.length,
          verified: results.filter((r: any) => r.status === "verified").length,
          partially: results.filter((r: any) => r.status === "partially_verified").length,
          skipped: results.filter((r: any) => r.status === "skipped").length,
          errors: results.filter((r: any) => r.status === "error").length,
        };

        return json({ summary, results, ran_at: new Date().toISOString() });
      },
    },
  },
});
