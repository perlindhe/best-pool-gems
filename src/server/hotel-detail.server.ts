import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type HotelPhoto = {
  url: string;
  width: number;
  height: number;
  attribution?: string;
};

async function fetchGooglePhotos(place_id: string, max = 8): Promise<HotelPhoto[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];
  const detailsRes = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(place_id)}`,
    {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "photos",
      },
    },
  );
  if (!detailsRes.ok) return [];
  const json = (await detailsRes.json()) as {
    photos?: Array<{
      name: string;
      widthPx?: number;
      heightPx?: number;
      authorAttributions?: Array<{ displayName?: string }>;
    }>;
  };
  const photos = (json.photos ?? []).slice(0, max);

  const resolved = await Promise.all(
    photos.map(async (p) => {
      try {
        const res = await fetch(
          `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=1600&skipHttpRedirect=true&key=${encodeURIComponent(key)}`,
        );
        if (!res.ok) return null;
        const data = (await res.json()) as { photoUri?: string };
        if (!data.photoUri) return null;
        return {
          url: data.photoUri,
          width: p.widthPx ?? 1600,
          height: p.heightPx ?? 1067,
          attribution: p.authorAttributions?.[0]?.displayName,
        } as HotelPhoto;
      } catch {
        return null;
      }
    }),
  );

  return resolved.filter((p): p is HotelPhoto => p !== null);
}

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

  const { data: mappings } = await supabaseAdmin
    .from("source_mappings")
    .select("source, source_place_id")
    .eq("hotel_id", hotel.id)
    .eq("is_active", true);
  const googleMap = (mappings ?? []).find((m) => m.source === "google");

  let photos: HotelPhoto[] = [];
  if (googleMap?.source_place_id) {
    photos = await fetchGooglePhotos(googleMap.source_place_id);
  }

  return { hotel, photos };
}
