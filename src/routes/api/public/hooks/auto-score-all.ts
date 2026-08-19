import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { autoScoreHotelById } from "@/server/auto-score.server";
import { computePoolScore } from "@/lib/scoring";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export const Route = createFileRoute("/api/public/hooks/auto-score-all")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        // Verify caller via Supabase anon apikey header
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apikey !== expected) {
          return json({ error: "Unauthorized" }, 401);
        }

        const url = new URL(request.url);
        const limit = Math.min(
          Math.max(parseInt(url.searchParams.get("limit") ?? "10", 10) || 10, 1),
          50,
        );
        const offset = Math.max(
          parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
          0,
        );

        const citySlug = url.searchParams.get("city_slug");

        let countQuery = supabaseAdmin
          .from("hotels")
          .select("id", { count: "exact", head: true });
        if (citySlug) countQuery = countQuery.eq("city_slug", citySlug);
        const { count: total } = await countQuery;

        let listQuery = supabaseAdmin
          .from("hotels")
          .select("id, name")
          .order("name", { ascending: true });
        if (citySlug) listQuery = listQuery.eq("city_slug", citySlug);
        const { data: hotels, error } = await listQuery.range(offset, offset + limit - 1);
        if (error) return json({ error: error.message }, 500);

        const results: Array<{
          id: string;
          name: string;
          ok: boolean;
          score?: number;
          error?: string;
        }> = [];

        for (const h of hotels ?? []) {
          try {
            const r = await autoScoreHotelById(h.id);
            const score = computePoolScore(r.components);
            const { error: upErr } = await supabaseAdmin
              .from("pool_scores")
              .upsert(
                {
                  hotel_id: h.id,
                  pool_score_0_10: score,
                  components: r.components,
                  best_time: r.best_time || null,
                  pool_type: r.pool_type || null,
                  editorial_notes: r.editorial_notes || null,
                  facts: (r.facts ?? null) as never,
                },
                { onConflict: "hotel_id" },
              );
            if (upErr) throw new Error(upErr.message);
            results.push({ id: h.id, name: h.name, ok: true, score });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            results.push({ id: h.id, name: h.name, ok: false, error: msg });
            // Stop on rate limit / credits
            if (/rate limit|credits exhausted|402|429/i.test(msg)) break;
          }
          // light throttle
          await new Promise((res) => setTimeout(res, 400));
        }

        const ok = results.filter((r) => r.ok).length;
        const nextOffset = offset + (hotels?.length ?? 0);
        const hasMore = total != null ? nextOffset < total : (hotels?.length ?? 0) === limit;
        return json({
          processed: results.length,
          succeeded: ok,
          failed: results.length - ok,
          offset,
          limit,
          next_offset: hasMore ? nextOffset : null,
          total,
          has_more: hasMore,
          results,
          ran_at: new Date().toISOString(),
        });
      },
    },
  },
});
