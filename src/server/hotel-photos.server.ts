import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { classifyAndReorderHotelPhotos } from "./pool-photo-detect.server";

export type PhotoSource = "google" | "tripadvisor" | "website";
export type FetchedPhoto = {
  source: PhotoSource;
  url: string;
  width?: number | null;
  height?: number | null;
  attribution?: string | null;
};

// ---------------- Google Places ----------------

/**
 * Resolve a Google place_id from name + city using Places Text Search (v1).
 * Also returns websiteUri so we can populate the hotel website automatically.
 */
async function resolveGooglePlace(
  name: string,
  city: string,
): Promise<{ placeId: string; websiteUri?: string } | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  const queries = [
    `${name} hotel ${city}`,
    `${name} ${city}`,
    name,
  ];
  for (const textQuery of queries) {
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "places.id,places.websiteUri,places.displayName",
        },
        body: JSON.stringify({ textQuery, maxResultCount: 1 }),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        places?: Array<{ id: string; websiteUri?: string }>;
      };
      const p = json.places?.[0];
      if (p?.id) return { placeId: p.id, websiteUri: p.websiteUri };
    } catch {
      // try next variant
    }
  }
  return null;
}

async function fetchGooglePhotos(place_id: string, max = 20): Promise<FetchedPhoto[]> {
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
    photos.map(async (p): Promise<FetchedPhoto | null> => {
      try {
        const res = await fetch(
          `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=1600&skipHttpRedirect=true&key=${encodeURIComponent(key)}`,
        );
        if (!res.ok) return null;
        const data = (await res.json()) as { photoUri?: string };
        if (!data.photoUri) return null;
        return {
          source: "google",
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

// ---------------- TripAdvisor ----------------

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
      .map((p): FetchedPhoto | null => {
        const large = p.images?.large;
        if (!large?.url) return null;
        return {
          source: "tripadvisor",
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

// ---------------- Firecrawl (multi-page) ----------------

const POOLISH_PATHS = [
  "pool",
  "piscina",
  "piscine",
  "rooftop",
  "roof-top",
  "infinity",
  "jacuzzi",
  "sundeck",
  "sun-deck",
  "spa",
  "wellness",
  "gallery",
  "galleri",
  "photos",
  "facilities",
  "rooms",
  "suites",
  "amenities",
  "experiences",
];

function absolutize(src: string, base: string): string | null {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

function extractImageUrls(html: string, baseUrl: string): Array<{ url: string; poolish: boolean }> {
  const out: Array<{ url: string; poolish: boolean }> = [];
  const seen = new Set<string>();
  // <img src="..."> and srcset
  const imgRe = /<img\b[^>]*?(?:src|data-src|data-lazy-src)=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(html)) !== null) {
    const raw = m[1];
    const ctx = m[0].toLowerCase();
    const abs = absolutize(raw, baseUrl);
    if (!abs || seen.has(abs)) continue;
    if (!/\.(jpe?g|png|webp|avif)(\?|$|#)/i.test(abs)) continue;
    if (/(logo|favicon|sprite|placeholder|spinner|loading|icon[-_])/i.test(abs)) continue;
    seen.add(abs);
    const poolish = /pool|piscina|piscine|swim|rooftop|terrace|spa|infinity|jacuzzi|sundeck/.test(ctx + abs.toLowerCase());
    out.push({ url: abs, poolish });
  }
  // background-image: url(...)
  const bgRe = /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((m = bgRe.exec(html)) !== null) {
    const abs = absolutize(m[1], baseUrl);
    if (!abs || seen.has(abs)) continue;
    if (!/\.(jpe?g|png|webp|avif)(\?|$|#)/i.test(abs)) continue;
    if (/(logo|favicon|sprite|placeholder|icon[-_])/i.test(abs)) continue;
    seen.add(abs);
    out.push({ url: abs, poolish: /pool|rooftop|terrace|spa|infinity|jacuzzi|sundeck/.test(abs.toLowerCase()) });
  }
  return out;
}

async function firecrawlScrape(url: string): Promise<{ html: string; ogImage?: string } | null> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["html"], onlyMainContent: false }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { html?: string; metadata?: { ogImage?: string; "og:image"?: string } };
    };
    const data = json.data ?? {};
    return {
      html: data.html ?? "",
      ogImage: data.metadata?.ogImage || data.metadata?.["og:image"],
    };
  } catch {
    return null;
  }
}

async function firecrawlMap(url: string): Promise<string[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/map", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, limit: 200, includeSubdomains: false }),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { links?: Array<string | { url: string }> };
    return (json.links ?? [])
      .map((l) => (typeof l === "string" ? l : l?.url))
      .filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

// ---------------- robots.txt (be a polite citizen) ----------------

type RobotsRules = { disallow: string[]; allow: string[] };
const robotsCache = new Map<string, RobotsRules | null>();

async function getRobotsRules(siteUrl: string): Promise<RobotsRules | null> {
  let origin: string;
  try {
    origin = new URL(siteUrl).origin;
  } catch {
    return null;
  }
  if (robotsCache.has(origin)) return robotsCache.get(origin) ?? null;
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": "BestPoolHotelsBot/1.0 (+https://bestpoolhotels.com)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      robotsCache.set(origin, null);
      return null;
    }
    const text = await res.text();
    // Parse only blocks for * (most common). Stop when another UA group starts.
    const lines = text.split(/\r?\n/);
    const rules: RobotsRules = { disallow: [], allow: [] };
    let active = false;
    for (const raw of lines) {
      const line = raw.replace(/#.*$/, "").trim();
      if (!line) continue;
      const [k, ...rest] = line.split(":");
      const key = k.trim().toLowerCase();
      const value = rest.join(":").trim();
      if (key === "user-agent") {
        active = value === "*";
        continue;
      }
      if (!active) continue;
      if (key === "disallow" && value) rules.disallow.push(value);
      else if (key === "allow" && value) rules.allow.push(value);
    }
    robotsCache.set(origin, rules);
    return rules;
  } catch {
    robotsCache.set(origin, null);
    return null;
  }
}

function isAllowedByRobots(targetUrl: string, rules: RobotsRules | null): boolean {
  if (!rules) return true; // no robots.txt = allowed
  let path: string;
  try {
    const u = new URL(targetUrl);
    path = u.pathname + u.search;
  } catch {
    return true;
  }
  // Longest matching rule wins (allow vs disallow)
  const match = (patterns: string[]) =>
    patterns
      .filter((p) => path.startsWith(p.replace(/\*$/, "")))
      .reduce((max, p) => Math.max(max, p.length), 0);
  const dis = match(rules.disallow);
  const allow = match(rules.allow);
  if (dis === 0) return true;
  return allow >= dis;
}

async function fetchWebsitePhotos(siteUrl: string): Promise<FetchedPhoto[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];

  // 0) respect robots.txt — skip site entirely if root is disallowed
  const robots = await getRobotsRules(siteUrl);
  if (!isAllowedByRobots(siteUrl, robots)) {
    console.log(`[hotel-photos] robots.txt disallows ${siteUrl} — skipping`);
    return [];
  }

  // 1) discover relevant subpages
  const allLinks = await firecrawlMap(siteUrl);
  const ranked = allLinks
    .filter((u) => {
      try {
        const x = new URL(u);
        return x.hostname.endsWith(new URL(siteUrl).hostname);
      } catch {
        return false;
      }
    })
    .map((u) => {
      const lower = u.toLowerCase();
      const score = POOLISH_PATHS.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
      return { url: u, score };
    })
    .sort((a, b) => b.score - a.score);

  const targets = new Set<string>([siteUrl]);
  for (const r of ranked) {
    if (r.score === 0) continue;
    if (!isAllowedByRobots(r.url, robots)) continue;
    targets.add(r.url);
    if (targets.size >= 6) break;
  }

  // 2) scrape each in parallel
  const scraped = await Promise.all(
    Array.from(targets).map(async (u) => ({ url: u, page: await firecrawlScrape(u) })),
  );

  const seen = new Set<string>();
  const photos: FetchedPhoto[] = [];
  const collected: Array<{ url: string; poolish: boolean }> = [];

  for (const { url, page } of scraped) {
    if (!page) continue;
    if (page.ogImage) {
      const abs = absolutize(page.ogImage, url);
      if (abs && !seen.has(abs) && /\.(jpe?g|png|webp|avif)(\?|$|#)/i.test(abs)) {
        seen.add(abs);
        collected.push({ url: abs, poolish: true });
      }
    }
    for (const img of extractImageUrls(page.html, url)) {
      if (seen.has(img.url)) continue;
      seen.add(img.url);
      collected.push(img);
    }
  }

  collected
    .sort((a, b) => Number(b.poolish) - Number(a.poolish))
    .slice(0, 25)
    .forEach((c) =>
      photos.push({ source: "website", url: c.url, attribution: "Hotel website" }),
    );

  return photos;
}

// ---------------- Orchestration ----------------

export async function refreshHotelPhotos(hotelId: string) {
  const { data: hotel } = await supabaseAdmin
    .from("hotels")
    .select("id, name, city, website_url, scrape_website")
    .eq("id", hotelId)
    .maybeSingle();
  if (!hotel) throw new Error("Hotel not found");

  const { data: mappings } = await supabaseAdmin
    .from("source_mappings")
    .select("source, source_place_id, source_url")
    .eq("hotel_id", hotelId)
    .eq("is_active", true);

  let google = (mappings ?? []).find((m) => m.source === "google");
  const tripadvisor = (mappings ?? []).find((m) => m.source === "tripadvisor");
  let websiteUrl = hotel.website_url as string | null;

  // Auto-discover Google place + website if missing
  if (!google?.source_place_id) {
    const resolved = await resolveGooglePlace(hotel.name as string, hotel.city as string);
    if (resolved?.placeId) {
      await supabaseAdmin.from("source_mappings").insert({
        hotel_id: hotelId,
        source: "google",
        source_place_id: resolved.placeId,
        is_active: true,
      });
      google = { source: "google", source_place_id: resolved.placeId, source_url: null };
      if (!websiteUrl && resolved.websiteUri) {
        websiteUrl = resolved.websiteUri;
        await supabaseAdmin
          .from("hotels")
          .update({ website_url: resolved.websiteUri })
          .eq("id", hotelId);
      }
    }
  }

  const [g, t, w] = await Promise.all([
    google?.source_place_id ? fetchGooglePhotos(google.source_place_id) : Promise.resolve([]),
    tripadvisor?.source_place_id
      ? fetchTripadvisorPhotos(tripadvisor.source_place_id)
      : Promise.resolve([]),
    websiteUrl && hotel.scrape_website !== false
      ? fetchWebsitePhotos(websiteUrl)
      : Promise.resolve([]),
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

  // AI pass: detect which photos actually show a pool, then reorder so
  // pool photos come first in galleries and listings.
  let poolDetect = { classified: 0, pool_count: 0 };
  try {
    poolDetect = await classifyAndReorderHotelPhotos(hotelId);
  } catch (e) {
    console.warn("[refreshHotelPhotos] pool detection failed:", e);
  }

  return {
    counts: { google: g.length, tripadvisor: t.length, website: w.length, total: merged.length },
    pool_detect: poolDetect,
    autoResolvedGoogle: !!google?.source_place_id && !(mappings ?? []).some((m) => m.source === "google"),
    websiteUrl,
  };
}
