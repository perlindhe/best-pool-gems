import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { writeHotelEditorial } from "@/server/editorial.server";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export const Route = createFileRoute("/api/public/hooks/write-editorial")({
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
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 10) || 10, 40);
        const force = url.searchParams.get("force") === "1";

        let q = supabaseAdmin
          .from("hotels")
          .select("id, slug, why_included")
          .eq("is_published", true)
          .eq("hotel_status", "active")
          .is("canonical_hotel_id", null);
        if (slug) q = q.eq("slug", slug);
        if (city) q = q.eq("city_slug", city);
        const { data: rows, error } = await q.limit(400);
        if (error) return json({ error: error.message }, 500);

        const targets = (rows ?? [])
          .filter((r) => force || ((r.why_included as string | null) ?? "").trim().length < 120)
          .slice(0, limit);

        const results: unknown[] = [];
        for (const t of targets) {
          try {
            results.push(await writeHotelEditorial(t.id as string));
          } catch (e) {
            results.push({
              slug: t.slug,
              status: "error",
              reason: e instanceof Error ? e.message : String(e),
            });
          }
        }

        return json({
          candidates: (rows ?? []).length,
          processed: results.length,
          results,
        });
      },
    },
  },
});
