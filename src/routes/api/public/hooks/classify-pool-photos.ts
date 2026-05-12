import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { classifyAndReorderHotelPhotos } from "@/server/pool-photo-detect.server";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

/**
 * Backfill pool-detection for every published hotel that has photos but
 * hasn't been classified yet (no row with `is_pool` set). Reorders position
 * so detected pool photos surface first.
 */
export const Route = createFileRoute("/api/public/hooks/classify-pool-photos")({
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

        const { data: hotels, error } = await supabaseAdmin
          .from("hotels")
          .select("id, name")
          .eq("is_published", true);
        if (error) return json({ error: error.message }, 500);

        const results: Array<{
          id: string;
          name: string;
          status: "classified" | "skipped" | "no_photos" | "error";
          classified?: number;
          pool_count?: number;
          error?: string;
        }> = [];

        for (const h of hotels ?? []) {
          try {
            // Skip if already classified, unless force=1
            if (!force) {
              const { count } = await supabaseAdmin
                .from("hotel_photos")
                .select("id", { count: "exact", head: true })
                .eq("hotel_id", h.id)
                .not("is_pool", "is", null);
              const { count: total } = await supabaseAdmin
                .from("hotel_photos")
                .select("id", { count: "exact", head: true })
                .eq("hotel_id", h.id);
              if (!total || total === 0) {
                results.push({ id: h.id, name: h.name, status: "no_photos" });
                continue;
              }
              if ((count ?? 0) >= total) {
                results.push({ id: h.id, name: h.name, status: "skipped" });
                continue;
              }
            }
            const r = await classifyAndReorderHotelPhotos(h.id);
            results.push({
              id: h.id,
              name: h.name,
              status: r.classified === 0 ? "no_photos" : "classified",
              classified: r.classified,
              pool_count: r.pool_count,
            });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            results.push({ id: h.id, name: h.name, status: "error", error: msg });
            if (/rate limit|429|quota/i.test(msg)) break;
          }
        }

        return json({
          total_hotels: hotels?.length ?? 0,
          results,
          ran_at: new Date().toISOString(),
        });
      },
    },
  },
});
