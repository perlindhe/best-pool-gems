import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { refreshHotelPhotos } from "@/server/hotel-photos.server";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export const Route = createFileRoute("/api/public/hooks/refresh-all-photos")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apikey !== expected) {
          return json({ error: "Unauthorized" }, 401);
        }

        const { data: hotels, error } = await supabaseAdmin
          .from("hotels")
          .select("id, name")
          .eq("is_published", true);
        if (error) return json({ error: error.message }, 500);

        const results: Array<{
          id: string;
          name: string;
          ok: boolean;
          total?: number;
          error?: string;
        }> = [];

        for (const h of hotels ?? []) {
          try {
            const r = await refreshHotelPhotos(h.id);
            results.push({ id: h.id, name: h.name, ok: true, total: r.counts.total });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            results.push({ id: h.id, name: h.name, ok: false, error: msg });
            if (/rate limit|credits exhausted|402|429/i.test(msg)) break;
          }
          // throttle to be polite to Google/TripAdvisor/Firecrawl
          await new Promise((res) => setTimeout(res, 600));
        }

        const ok = results.filter((r) => r.ok).length;
        return json({
          processed: results.length,
          succeeded: ok,
          failed: results.length - ok,
          results,
          ran_at: new Date().toISOString(),
        });
      },
    },
  },
});
