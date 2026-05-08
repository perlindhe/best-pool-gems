import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PhotoSource = "google" | "tripadvisor" | "website";
export type FetchedPhoto = {
  source: PhotoSource;
  url: string;
  width?: number | null;
  height?: number | null;
  attribution?: string | null;
};

async function fetchGooglePhotos(place_id: string, max = 10): Promise<FetchedPhoto[]> {
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
          source: "google" as const,
          url: data.photoUri,
          width: p.widthPx ?? null,
          height: p.heightPx ?? null,
          attribution: p.authorAttributions?.[0]?.displayName ?? null,
        };
      } catch {
        return null;
      }
    }),
  );
  return resolved.filter((p): p is FetchedPhoto => p !== null);
}

async function fetchTripadvisorPhotos(location_id: string): Promise<FetchedPhoto[]> {
  const key = process.env.TRIPADVISOR_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      `https://api.content.tripadvisor.com/api/v1/location/${encodeURIComponent(location_id)}/photos?key=${encodeURIComponent(key)}&language=en`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: Array<{
        images?: { large?: { url?: string; width?: number; height?: number } };
        user?: { username?: string };
      }>;
    };
    return (json.data ?? [])
      .map((p) => {
        const large = p.images?.large;
        if (!large?.url) return null;
        return {
          source: "tripadvisor" as const,
          url: large.url,
          width: large.width ?? null,
          height: large.height ?? null,
          attribution: p.user?.username ?? "TripAdvisor",
        };
      })
      .filter((p): p is FetchedPhoto => p !== null);
  } catch {
    return [];
  }
}

async function fetchWebsitePhotos(url: string): Promise<FetchedPhoto[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["html", "links"],
        onlyMainContent: false,
      }),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: { html?: string; metadata?: { ogImage?: string; "og:image"?: string } };
    };
    const data = json.data ?? {};
    const photos: FetchedPhoto[] = [];
    const seen = new Set<string>();
    const push = (raw: string) => {
      const abs = absolutize(raw, url);
      if (!abs || seen.has(abs)) return;
      if (!/\.(jpe?g|png|webp|avif)(\?|$)/i.test(abs)) return;
      if (/(logo|icon|favicon|sprite|placeholder|spinner|loading)/i.test(abs)) return;
      seen.add(abs);
      photos.push({ source: "website", url: abs, attribution: "Hotel website" });
    };

    const og = data.metadata?.ogImage || data.metadata?.["og:image"];
    if (og) push(og);

    const html = data.html ?? "";
    // Look for pool-related images first
    const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const candidates: Array<{ url: string; poolish: boolean }> = [];
    let m: RegExpExecArray | null;
    while ((m = imgRe.exec(html)) !== null) {
      const src = m[1];
      const ctx = m[0].toLowerCase();
      const poolish = /pool|piscina|piscine|swim|rooftop|terrace/.test(ctx);
      candidates.push({ url: src, poolish });
    }
    candidates
      .sort((a, b) => Number(b.poolish) - Number(a.poolish))
      .slice(0, 10)
      .forEach((c) => push(c.url));

    return photos.slice(0, 8);
  } catch {
    return [];
  }
}

function absolutize(src: string, base: string): string | null {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

export async function refreshHotelPhotos(hotelId: string) {
  const { data: hotel } = await supabaseAdmin
    .from("hotels")
    .select("id, website_url")
    .eq("id", hotelId)
    .maybeSingle();
  if (!hotel) throw new Error("Hotel not found");

  const { data: mappings } = await supabaseAdmin
    .from("source_mappings")
    .select("source, source_place_id, source_url")
    .eq("hotel_id", hotelId)
    .eq("is_active", true);
  const google = (mappings ?? []).find((m) => m.source === "google");
  const tripadvisor = (mappings ?? []).find((m) => m.source === "tripadvisor");

  const [g, t, w] = await Promise.all([
    google?.source_place_id ? fetchGooglePhotos(google.source_place_id) : Promise.resolve([]),
    tripadvisor?.source_place_id
      ? fetchTripadvisorPhotos(tripadvisor.source_place_id)
      : Promise.resolve([]),
    hotel.website_url ? fetchWebsitePhotos(hotel.website_url) : Promise.resolve([]),
  ]);

  // Priority order: google > tripadvisor > website. Dedupe by url.
  const seen = new Set<string>();
  const merged: FetchedPhoto[] = [];
  for (const list of [g, t, w]) {
    for (const p of list) {
      if (seen.has(p.url)) continue;
      seen.add(p.url);
      merged.push(p);
    }
  }

  // Replace existing photos for this hotel
  await supabaseAdmin.from("hotel_photos").delete().eq("hotel_id", hotelId);

  if (merged.length > 0) {
    const rows = merged.map((p, i) => ({
      hotel_id: hotelId,
      source: p.source,
      url: p.url,
      width: p.width ?? null,
      height: p.height ?? null,
      attribution: p.attribution ?? null,
      position: i,
    }));
    const { error } = await supabaseAdmin.from("hotel_photos").insert(rows);
    if (error) throw new Error(error.message);
  }

  return {
    counts: { google: g.length, tripadvisor: t.length, website: w.length, total: merged.length },
  };
}
