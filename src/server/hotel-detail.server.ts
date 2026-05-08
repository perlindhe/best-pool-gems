import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type HotelPhoto = {
  url: string;
  width: number;
  height: number;
  attribution?: string;
  source?: string;
};

export async function getHotelDetail(slug: string) {
  const { data: hotel, error } = await supabaseAdmin
    .from("public_hotels_view")
    .select(
      "id, slug, name, city, city_slug, country, neighborhood, website_url, booking_url, cover_image_url, pool_score_0_10, pool_components, best_time, pool_type, pool_facts, editorial_notes, meta_rating_0_100, confidence_0_100, sources_used, pool_score_updated_at, meta_computed_at",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!hotel) return null;

  const { data: photoRows } = await supabaseAdmin
    .from("hotel_photos")
    .select("url, width, height, attribution, source")
    .eq("hotel_id", hotel.id as string)
    .order("position", { ascending: true });

  const photos: HotelPhoto[] = (photoRows ?? []).map((p) => ({
    url: p.url as string,
    width: (p.width as number) ?? 1600,
    height: (p.height as number) ?? 1067,
    attribution: (p.attribution as string) ?? undefined,
    source: (p.source as string) ?? undefined,
  }));

  return { hotel, photos };
}

