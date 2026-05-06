import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/hotels")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const city = url.searchParams.get("city");
        let q = supabaseAdmin
          .from("public_hotels_view")
          .select(
            "id, slug, name, city, city_slug, country, neighborhood, website_url, booking_url, cover_image_url, rank_position, pool_score_0_10, pool_components, best_time, pool_type, meta_rating_0_100, confidence_0_100, sources_used, pool_score_updated_at, meta_computed_at",
          )
          .order("rank_position", { ascending: true, nullsFirst: false });
        if (city) q = q.eq("city_slug", city);
        const { data, error } = await q;
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ hotels: data ?? [] }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "public, max-age=300",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
