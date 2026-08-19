import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  computeMeta,
  DEFAULT_WEIGHTS,
  type SourceKey,
  type Weights,
} from "@/lib/scoring";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const TA_BASE = "https://api.content.tripadvisor.com/api/v1";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type TaSearchResult = {
  location_id: string;
  name: string;
  address_obj?: {
    city?: string;
    country?: string;
    address_string?: string;
  };
};

async function taSearch(query: string, key: string): Promise<TaSearchResult[]> {
  const url = `${TA_BASE}/location/search?key=${encodeURIComponent(key)}&searchQuery=${encodeURIComponent(query)}&category=hotels&language=en`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const j = await res.json();
  if (!res.ok) throw new Error(`TA search [${res.status}]: ${JSON.stringify(j).slice(0, 300)}`);
  return (j.data ?? []) as TaSearchResult[];
}

async function taDetails(location_id: string, key: string) {
  const url = `${TA_BASE}/location/${encodeURIComponent(location_id)}/details?key=${encodeURIComponent(key)}&language=en&currency=USD`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const j = await res.json();
  if (!res.ok) throw new Error(`TA details [${res.status}]: ${JSON.stringify(j).slice(0, 300)}`);
  return j as { rating?: number | string; num_reviews?: number | string; web_url?: string };
}

function pickBestMatch(
  results: TaSearchResult[],
  hotelName: string,
  city: string,
): TaSearchResult | null {
  if (results.length === 0) return null;
  const hn = normalize(hotelName);
  const hc = normalize(city);
  let best: { r: TaSearchResult; score: number } | null = null;
  for (const r of results) {
    const rn = normalize(r.name ?? "");
    const rc = normalize(r.address_obj?.city ?? "");
    let score = 0;
    if (rn === hn) score += 100;
    else if (rn.includes(hn) || hn.includes(rn)) score += 60;
    else {
      // token overlap
      const a = new Set(hn.split(" ").filter((t) => t.length > 2));
      const b = new Set(rn.split(" ").filter((t) => t.length > 2));
      const overlap = [...a].filter((t) => b.has(t)).length;
      score += overlap * 10;
    }
    if (hc && rc && (rc === hc || rc.includes(hc) || hc.includes(rc))) score += 30;
    if (!best || score > best.score) best = { r, score };
  }
  // Require strong confidence: full or substring name match (60+) plus city bonus,
  // OR overwhelming token overlap. Pure city-token matches are rejected.
  if (!best || best.score < 70) return null;
  return best.r;
}

async function recomputeForHotel(
  hotelId: string,
  weights: Weights,
  volumeCap: number,
) {
  const { data: rows, error } = await supabaseAdmin
    .from("ratings_snapshots")
    .select("source, rating_value, rating_scale, rating_count, captured_at")
    .eq("hotel_id", hotelId)
    .eq("status", "ok")
    .order("captured_at", { ascending: false });
  if (error) throw new Error(error.message);
  const latest = new Map<SourceKey, (typeof rows)[number]>();
  for (const r of rows ?? []) {
    const k = r.source as SourceKey;
    if (!latest.has(k)) latest.set(k, r);
  }
  const meta = computeMeta(
    Array.from(latest.values()).map((r) => ({
      source: r.source as SourceKey,
      rating_value: r.rating_value,
      rating_scale: r.rating_scale ?? 5,
      rating_count: r.rating_count,
    })),
    weights,
    volumeCap,
  );
  await supabaseAdmin.from("meta_scores").upsert(
    {
      hotel_id: hotelId,
      meta_rating_0_100: meta.meta_rating_0_100,
      confidence_0_100: meta.confidence_0_100,
      sources_used: meta.sources_used,
      computed_at: new Date().toISOString(),
    },
    { onConflict: "hotel_id" },
  );
}

/**
 * Backfill TripAdvisor mappings for any published hotel that does not have
 * an active tripadvisor source_mapping. Runs in the background daily.
 *
 * For each unmapped hotel:
 *   1. Search TripAdvisor by "<name>, <city>"
 *   2. Pick the best fuzzy match (name + city)
 *   3. Save source_mapping
 *   4. Fetch details, store ratings_snapshot
 *   5. Recompute meta_score
 */
export const Route = createFileRoute("/api/public/hooks/backfill-tripadvisor")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apikey !== expected) {
          return json({ error: "Unauthorized" }, 401);
        }

        const key = process.env.TRIPADVISOR_API_KEY;
        if (!key) return json({ error: "TRIPADVISOR_API_KEY missing" }, 500);

        // Find hotels without an active tripadvisor mapping
        const { data: hotels, error: hErr } = await supabaseAdmin
          .from("hotels")
          .select("id, name, city, country")
          .eq("is_published", true);
        if (hErr) return json({ error: hErr.message }, 500);

        const { data: existing, error: mErr } = await supabaseAdmin
          .from("source_mappings")
          .select("hotel_id")
          .eq("source", "tripadvisor")
          .eq("is_active", true);
        if (mErr) return json({ error: mErr.message }, 500);
        const mappedIds = new Set((existing ?? []).map((m) => m.hotel_id));

        const todo = (hotels ?? []).filter((h) => !mappedIds.has(h.id));

        // Load scoring weights
        const { data: settings } = await supabaseAdmin
          .from("scoring_settings")
          .select("weights, volume_cap")
          .eq("id", 1)
          .maybeSingle();
        const weights = {
          ...DEFAULT_WEIGHTS,
          ...((settings?.weights as Partial<Weights>) ?? {}),
        } as Weights;
        const volumeCap = settings?.volume_cap ?? 5000;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const captured_at = today.toISOString();

        const results: Array<{
          id: string;
          name: string;
          status: "matched" | "no_match" | "error";
          location_id?: string;
          rating?: number;
          rating_count?: number;
          error?: string;
        }> = [];

        for (const h of todo) {
          try {
            const query = [h.name, h.city, h.country].filter(Boolean).join(", ");
            const found = await taSearch(query, key);
            const match = pickBestMatch(found, h.name, h.city ?? "");
            if (!match) {
              results.push({ id: h.id, name: h.name, status: "no_match" });
              await new Promise((r) => setTimeout(r, 400));
              continue;
            }

            // Save mapping
            await supabaseAdmin.from("source_mappings").upsert(
              {
                hotel_id: h.id,
                source: "tripadvisor",
                source_place_id: match.location_id,
                source_url: undefined,
                is_active: true,
              },
              { onConflict: "hotel_id,source" },
            );

            // Fetch details + snapshot
            const det = await taDetails(match.location_id, key);
            const rating = Number(det.rating);
            const count = Number(det.num_reviews ?? 0);

            if (rating) {
              await supabaseAdmin.from("ratings_snapshots").upsert(
                {
                  hotel_id: h.id,
                  source: "tripadvisor",
                  rating_value: rating,
                  rating_scale: 5,
                  rating_count: count,
                  captured_at,
                  status: "ok",
                  raw_payload: {
                    source: "tripadvisor_backfill_cron",
                    matched_name: match.name,
                    matched_city: match.address_obj?.city,
                  },
                },
                { onConflict: "hotel_id,source,captured_date" },
              );
              await recomputeForHotel(h.id, weights, volumeCap);
            }

            results.push({
              id: h.id,
              name: h.name,
              status: "matched",
              location_id: match.location_id,
              rating: rating || undefined,
              rating_count: count,
            });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            results.push({ id: h.id, name: h.name, status: "error", error: msg });
            if (/rate limit|429|quota/i.test(msg)) break;
          }
          // Be polite to the TA API
          await new Promise((r) => setTimeout(r, 600));
        }

        const matched = results.filter((r) => r.status === "matched").length;
        const noMatch = results.filter((r) => r.status === "no_match").length;
        const errored = results.filter((r) => r.status === "error").length;

        return json({
          total_published: hotels?.length ?? 0,
          already_mapped: mappedIds.size,
          attempted: todo.length,
          matched,
          no_match: noMatch,
          errored,
          results,
          ran_at: new Date().toISOString(),
        });
      },
    },
  },
});
