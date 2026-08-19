import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { refreshPoolQuotesForHotel } from "@/server/pool-quotes.server";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export const Route = createFileRoute("/api/public/hooks/backfill-pool-quotes")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apikey !== expected) {
          return json({ error: "Unauthorized" }, 401);
        }

        const url = new URL(request.url);
        const force = url.searchParams.get("force") === "1";
        const onlyHotelId = url.searchParams.get("hotel_id");

        let query = supabaseAdmin
          .from("hotels")
          .select("id, name")
          .eq("is_published", true);
        if (onlyHotelId) query = query.eq("id", onlyHotelId);
        const citySlug = url.searchParams.get("city_slug");
        if (citySlug) query = query.eq("city_slug", citySlug);

        const { data: hotels, error } = await query;
        if (error) return json({ error: error.message }, 500);

        const results: Array<{
          id: string;
          name: string;
          status: string;
          quotes?: number;
          error?: string;
        }> = [];

        for (const h of hotels ?? []) {
          try {
            if (!force) {
              const { count } = await supabaseAdmin
                .from("pool_quotes")
                .select("id", { count: "exact", head: true })
                .eq("hotel_id", h.id as string);
              if ((count ?? 0) > 0) {
                results.push({ id: h.id as string, name: h.name as string, status: "skipped" });
                continue;
              }
            }
            const r = await refreshPoolQuotesForHotel(h.id as string);
            results.push({
              id: h.id as string,
              name: h.name as string,
              status: r.status,
              quotes: r.quotes,
            });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            results.push({
              id: h.id as string,
              name: h.name as string,
              status: "error",
              error: msg,
            });
            if (/rate limit|429|quota/i.test(msg)) break;
          }
        }

        return json({
          total: hotels?.length ?? 0,
          results,
          ran_at: new Date().toISOString(),
        });
      },
    },
  },
});
