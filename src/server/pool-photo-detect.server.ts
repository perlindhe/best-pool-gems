import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Classify a batch of image URLs as "pool photo" (and outdoor vs indoor),
 * using Lovable AI Gateway (Gemini Flash Lite vision). Returns a parallel
 * array of judgments in the same order as the input.
 */
export type PoolJudgment = {
  is_pool: boolean | null;
  pool_score: number | null;
  is_outdoor: boolean | null;
};

const EMPTY: PoolJudgment = { is_pool: null, pool_score: null, is_outdoor: null };
const BATCH_SIZE = 6;

async function classifyBatch(urls: string[]): Promise<PoolJudgment[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.warn("[pool-detect] LOVABLE_API_KEY missing — skipping classification");
    return urls.map(() => ({ ...EMPTY }));
  }

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [
    {
      type: "text",
      text:
        `For each image (in order, 1..${urls.length}), decide if it primarily shows a SWIMMING POOL ` +
        `(infinity pool, rooftop pool, indoor pool, plunge pool, lap pool, jacuzzi/hot tub also counts). ` +
        `A bathroom shower or bathtub does NOT count. A spa treatment room without water does NOT count. ` +
        `Empty deck shots without visible water do NOT count. ` +
        `Also decide if the pool is OUTDOOR (open sky, terrace, rooftop, garden — set is_outdoor=true) ` +
        `or INDOOR (enclosed room, ceiling visible, spa basement — is_outdoor=false). ` +
        `If not a pool, set is_outdoor=null. ` +
        `Return ONLY strict JSON in this exact shape (no prose, no markdown fences): ` +
        `{"items":[{"i":1,"is_pool":true,"score":0.95,"is_outdoor":true}, ...]}. ` +
        `score is 0..1 confidence that it is a clear, hero-quality pool photo.`,
    },
    ...urls.map((u) => ({
      type: "image_url" as const,
      image_url: { url: u },
    })),
  ];

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content }],
      }),
    });
    if (!res.ok) {
      console.warn(`[pool-detect] gateway ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return urls.map(() => ({ ...EMPTY }));
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned) as {
      items?: Array<{ i: number; is_pool: boolean; score?: number; is_outdoor?: boolean | null }>;
    };
    const out: PoolJudgment[] = urls.map(() => ({ ...EMPTY }));
    for (const item of parsed.items ?? []) {
      const idx = item.i - 1;
      if (idx < 0 || idx >= urls.length) continue;
      out[idx] = {
        is_pool: !!item.is_pool,
        pool_score: typeof item.score === "number" ? Math.max(0, Math.min(1, item.score)) : null,
        is_outdoor: item.is_pool
          ? typeof item.is_outdoor === "boolean"
            ? item.is_outdoor
            : null
          : null,
      };
    }
    return out;
  } catch (e) {
    console.warn("[pool-detect] failed:", e instanceof Error ? e.message : e);
    return urls.map(() => ({ ...EMPTY }));
  }
}

/**
 * Classify all stored photos for a hotel and persist is_pool / pool_score / is_outdoor,
 * then re-rank `position` so outdoor pool photos come first, then indoor pool photos,
 * then everything else.
 */
export async function classifyAndReorderHotelPhotos(hotelId: string) {
  const { data: photos, error } = await supabaseAdmin
    .from("hotel_photos")
    .select("id, url, source")
    .eq("hotel_id", hotelId)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  if (!photos || photos.length === 0) {
    return { classified: 0, pool_count: 0, outdoor_count: 0 };
  }

  const judgments: PoolJudgment[] = [];
  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE);
    const result = await classifyBatch(batch.map((p) => p.url));
    judgments.push(...result);
    if (i + BATCH_SIZE < photos.length) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  for (let i = 0; i < photos.length; i++) {
    const j = judgments[i];
    await supabaseAdmin
      .from("hotel_photos")
      .update({ is_pool: j.is_pool, pool_score: j.pool_score, is_outdoor: j.is_outdoor })
      .eq("id", photos[i].id);
  }

  // Re-rank: outdoor pools first, then indoor pools, then everything else.
  // Within pool groups, prefer the hotel's own website, then TripAdvisor, then Google,
  // and within each source group sort by AI confidence (pool_score desc).
  const sourceRank = (s: string | null) =>
    s === "website" ? 0 : s === "tripadvisor" ? 1 : s === "google" ? 2 : 3;
  const poolTier = (j: PoolJudgment) => {
    if (j.is_pool !== true) return 2;
    return j.is_outdoor === true ? 0 : 1; // unknown indoor/outdoor falls in indoor tier
  };
  const indexed = photos.map((p, i) => ({
    id: p.id,
    tier: poolTier(judgments[i]),
    score: judgments[i].pool_score ?? 0,
    sourceRank: sourceRank((p as { source?: string | null }).source ?? null),
    originalIdx: i,
  }));
  indexed.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.tier < 2) {
      if (a.sourceRank !== b.sourceRank) return a.sourceRank - b.sourceRank;
      return b.score - a.score;
    }
    return a.originalIdx - b.originalIdx;
  });

  for (let pos = 0; pos < indexed.length; pos++) {
    await supabaseAdmin
      .from("hotel_photos")
      .update({ position: pos })
      .eq("id", indexed[pos].id);
  }

  const pool_count = indexed.filter((x) => x.tier < 2).length;
  const outdoor_count = indexed.filter((x) => x.tier === 0).length;
  return { classified: photos.length, pool_count, outdoor_count };
}
