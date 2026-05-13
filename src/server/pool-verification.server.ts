import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Verifies whether a hotel actually has a swimming pool by combining 3 signals:
 *   1. AI-classified pool photos in our DB (hotel_photos.is_pool = true)
 *   2. Google Places amenities (pool / outdoorPool / etc.)
 *   3. Firecrawl search of the hotel's own website for pool mentions
 *
 * Sets hotels.has_pool to true / false and stores a short note explaining
 * the decision in pool_verification_notes.
 */

type Verdict = {
  has_pool: boolean;
  notes: string;
  signals: {
    pool_photos: number;
    google_amenity: boolean | null;
    website_mentions: number;
  };
};

// ---------------- Google Places amenities ----------------
async function googleHasPoolAmenity(placeId: string): Promise<boolean | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "types,primaryType,editorialSummary,displayName",
        },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      types?: string[];
      editorialSummary?: { text?: string };
    };
    const types = (json.types ?? []).join(",").toLowerCase();
    if (/pool|swimming/.test(types)) return true;
    const summary = (json.editorialSummary?.text ?? "").toLowerCase();
    if (/swimming pool|outdoor pool|indoor pool|rooftop pool|infinity pool/.test(summary)) {
      return true;
    }
    return null; // signal unavailable, not "no"
  } catch {
    return null;
  }
}

// ---------------- Firecrawl website check ----------------
const POOL_PHRASE_RE =
  /\b(swimming pool|rooftop pool|indoor pool|outdoor pool|infinity pool|plunge pool|lap pool|heated pool|hotel pool|pool deck|pool bar|piscina|piscine)\b/gi;

async function websitePoolMentions(websiteUrl: string): Promise<number> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key || !websiteUrl) return 0;

  const host = (() => {
    try {
      return new URL(websiteUrl).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();
  if (!host) return 0;

  // Search the site itself for pool pages — site: filter forces Firecrawl
  // to only return pages from the hotel's own domain.
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `site:${host} (pool OR piscina OR piscine OR rooftop OR wellness OR spa)`,
        limit: 5,
        scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      }),
    });
    if (!res.ok) return 0;
    const json = (await res.json()) as {
      data?: { web?: Array<{ markdown?: string; description?: string }> } | Array<{
        markdown?: string;
        description?: string;
      }>;
    };
    const list = Array.isArray(json.data)
      ? json.data
      : (json.data?.web ?? []);
    let total = 0;
    for (const r of list) {
      const text = ((r.markdown ?? "") + " " + (r.description ?? "")).toLowerCase();
      const matches = text.match(POOL_PHRASE_RE);
      if (matches) total += matches.length;
    }
    return total;
  } catch {
    return 0;
  }
}

// ---------------- Orchestration ----------------
export async function verifyHotelHasPool(hotelId: string): Promise<Verdict> {
  const { data: hotel, error: hErr } = await supabaseAdmin
    .from("hotels")
    .select("id, name, website_url")
    .eq("id", hotelId)
    .maybeSingle();
  if (hErr) throw new Error(hErr.message);
  if (!hotel) throw new Error("Hotel not found");

  // Signal 1 — AI-classified pool photos
  const { count: poolPhotoCount } = await supabaseAdmin
    .from("hotel_photos")
    .select("id", { count: "exact", head: true })
    .eq("hotel_id", hotelId)
    .eq("is_pool", true);
  const pool_photos = poolPhotoCount ?? 0;

  // Signal 2 — Google amenity
  const { data: mappings } = await supabaseAdmin
    .from("source_mappings")
    .select("source, source_place_id")
    .eq("hotel_id", hotelId)
    .eq("is_active", true);
  const googlePlaceId =
    mappings?.find((m) => m.source === "google")?.source_place_id ?? null;
  const google_amenity = googlePlaceId
    ? await googleHasPoolAmenity(googlePlaceId)
    : null;

  // Signal 3 — Hotel website (only run if first 2 signals are inconclusive,
  // to save Firecrawl credits; always run if google said NO/unknown AND no photos)
  let website_mentions = 0;
  const needWebsite = pool_photos === 0 && google_amenity !== true;
  if (needWebsite && hotel.website_url) {
    website_mentions = await websitePoolMentions(hotel.website_url as string);
  }

  // Decision rule:
  //   YES if at least 2 confirmed pool photos, OR Google amenity = true,
  //        OR ≥ 2 distinct pool mentions on the official website.
  //   NO  only if we have evidence: 0 pool photos AND google_amenity != true
  //        AND website_mentions < 2 AND we actually checked the website.
  //   Otherwise leave NULL (unverified) — keep showing on the site for now.
  const positive = pool_photos >= 2 || google_amenity === true || website_mentions >= 2;
  let has_pool: boolean;
  let notes: string;

  if (positive) {
    has_pool = true;
    const reasons: string[] = [];
    if (pool_photos >= 2) reasons.push(`${pool_photos} pool photos`);
    if (google_amenity === true) reasons.push("Google amenity");
    if (website_mentions >= 2) reasons.push(`${website_mentions} website mentions`);
    notes = `Verified: ${reasons.join(", ")}`;
  } else if (
    pool_photos === 0 &&
    hotel.website_url &&
    website_mentions < 2
  ) {
    has_pool = false;
    notes = `No pool photos, no Google pool amenity, only ${website_mentions} pool mention(s) on official site`;
  } else {
    // Inconclusive — don't flip the bit. Leave existing value untouched.
    return {
      has_pool: false,
      notes: "inconclusive",
      signals: { pool_photos, google_amenity, website_mentions },
    };
  }

  await supabaseAdmin
    .from("hotels")
    .update({
      has_pool,
      pool_verified_at: new Date().toISOString(),
      pool_verification_notes: notes,
    })
    .eq("id", hotelId);

  return {
    has_pool,
    notes,
    signals: { pool_photos, google_amenity, website_mentions },
  };
}
