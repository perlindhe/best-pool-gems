import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type CityHotelInfo = { url: string | null; slug: string; bookingUrl: string | null };
export type CityHotelInfoMap = Record<string, CityHotelInfo>;

export const getCityHotelPhotos = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ citySlug: z.string().max(120) }).parse(input),
  )
  .handler(async ({ data }): Promise<CityHotelInfoMap> => {
    const { data: hotels, error } = await supabaseAdmin
      .from("hotels")
      .select("id, name, slug, cover_image_url, affiliate_url, booking_url")
      .eq("city_slug", data.citySlug)
      .eq("is_published", true);
    if (error || !hotels) return {};

    const ids = hotels.map((h) => h.id);
    const { data: photos } = await supabaseAdmin
      .from("hotel_photos")
      .select("hotel_id, url, position, is_pool, pool_score")
      .in("hotel_id", ids)
      // Pool photos first (highest pool_score), then fall back to position.
      .order("is_pool", { ascending: false, nullsFirst: false })
      .order("pool_score", { ascending: false, nullsFirst: false })
      .order("position", { ascending: true });

    const firstByHotel = new Map<string, string>();
    for (const p of photos ?? []) {
      if (!firstByHotel.has(p.hotel_id)) firstByHotel.set(p.hotel_id, p.url);
    }

    const map: CityHotelInfoMap = {};
    for (const h of hotels) {
      map[h.name.toLowerCase()] = {
        url: firstByHotel.get(h.id) ?? h.cover_image_url ?? null,
        slug: h.slug,
        bookingUrl: h.affiliate_url ?? h.booking_url ?? null,
      };
    }
    return map;
  });
