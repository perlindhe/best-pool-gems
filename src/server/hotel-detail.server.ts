import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type HotelPhoto = {
  url: string;
  width: number;
  height: number;
  attribution?: string;
  source?: string;
};

export type HotelSource = {
  label: string;
  url?: string;
  note?: string;
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

  const { data: editorial } = await supabaseAdmin
    .from("hotels")
    .select("last_verified_date, sources, why_included, why_not_higher")
    .eq("id", hotel.id as string)
    .maybeSingle();

  const rawSources = (editorial?.sources ?? null) as unknown;
  let editorial_sources: HotelSource[] = [];
  if (Array.isArray(rawSources)) {
    editorial_sources = rawSources
      .map((s) => {
        if (typeof s === "string") return { label: s };
        if (s && typeof s === "object") {
          const o = s as Record<string, unknown>;
          return {
            label: String(o.label ?? o.name ?? o.title ?? o.url ?? "Source"),
            url: typeof o.url === "string" ? o.url : undefined,
            note: typeof o.note === "string" ? o.note : undefined,
          };
        }
        return null;
      })
      .filter((x): x is HotelSource => !!x);
  }

  const hotelWithEditorial = {
    ...hotel,
    last_verified_date: (editorial?.last_verified_date as string | null) ?? null,
    editorial_sources,
    why_included: (editorial?.why_included as string | null) ?? null,
    why_not_higher: (editorial?.why_not_higher as string | null) ?? null,
  };

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

  const { data: quoteRows } = await supabaseAdmin
    .from("pool_quotes")
    .select("quote, author, source, source_url, position")
    .eq("hotel_id", hotel.id as string)
    .order("position", { ascending: true });

  const quotes: PoolQuote[] = (quoteRows ?? []).map((q) => ({
    quote: q.quote as string,
    author: (q.author as string | null) ?? null,
    source: (q.source as string) ?? "tripadvisor",
    source_url: (q.source_url as string | null) ?? null,
  }));

  return { hotel: hotelWithEditorial, photos, quotes };
}


export type PoolQuote = {
  quote: string;
  author: string | null;
  source: string;
  source_url: string | null;
};

