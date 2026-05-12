import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Classify a batch of image URLs as "pool photo" or not, using
 * Lovable AI Gateway (Gemini Flash Lite vision). Returns a parallel
 * array of { is_pool, pool_score } in the same order as the input.
 *
 * The model gets a small batch (max ~6 images) and is asked to return
 * strict JSON. We retry once on parse failure, otherwise mark unknown.
 */
export type PoolJudgment = {
  is_pool: boolean | null;
  pool_score: number | null;
};

const BATCH_SIZE = 6;

async function classifyBatch(urls: string[]): Promise<PoolJudgment[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.warn("[pool-detect] LOVABLE_API_KEY missing — skipping classification");
    return urls.map(() => ({ is_pool: null, pool_score: null }));
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
        `Return ONLY strict JSON in this exact shape (no prose, no markdown fences): ` +
        `{"items":[{"i":1,"is_pool":true,"score":0.95}, ...]}. ` +
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
      return urls.map(() => ({ is_pool: null, pool_score: null }));
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned) as {
      items?: Array<{ i: number; is_pool: boolean; score?: number }>;
    };
    const out: PoolJudgment[] = urls.map(() => ({ is_pool: null, pool_score: null }));
    for (const item of parsed.items ?? []) {
      const idx = item.i - 1;
      if (idx < 0 || idx >= urls.length) continue;
      out[idx] = {
        is_pool: !!item.is_pool,
        pool_score: typeof item.score === "number" ? Math.max(0, Math.min(1, item.score)) : null,
      };
    }
    return out;
  } catch (e) {
    console.warn("[pool-detect] failed:", e instanceof Error ? e.message : e);
    return urls.map(() => ({ is_pool: null, pool_score: null }));
  }
}

/**
 * Classify all stored photos for a hotel and persist is_pool / pool_score,
 * then re-rank `position` so pool photos come first (highest score first).
 */
export async function classifyAndReorderHotelPhotos(hotelId: string) {
  const { data: photos, error } = await supabaseAdmin
    .from("hotel_photos")
    .select("id, url, source")
    .eq("hotel_id", hotelId)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  if (!photos || photos.length === 0) {
    return { classified: 0, pool_count: 0 };
  }

  const judgments: PoolJudgment[] = [];
  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE);
    const result = await classifyBatch(batch.map((p) => p.url));
    judgments.push(...result);
    // be polite to the gateway
    if (i + BATCH_SIZE < photos.length) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  // Persist judgments
  for (let i = 0; i < photos.length; i++) {
    const j = judgments[i];
    await supabaseAdmin
      .from("hotel_photos")
      .update({ is_pool: j.is_pool, pool_score: j.pool_score })
      .eq("id", photos[i].id);
  }

  // Re-rank: pool photos first (sorted by pool_score desc), then the rest
  // in their original order.
  const indexed = photos.map((p, i) => ({
    id: p.id,
    is_pool: judgments[i].is_pool === true,
    score: judgments[i].pool_score ?? 0,
    originalIdx: i,
  }));
  indexed.sort((a, b) => {
    if (a.is_pool !== b.is_pool) return a.is_pool ? -1 : 1;
    if (a.is_pool && b.is_pool) return b.score - a.score;
    return a.originalIdx - b.originalIdx;
  });

  for (let pos = 0; pos < indexed.length; pos++) {
    await supabaseAdmin
      .from("hotel_photos")
      .update({ position: pos })
      .eq("id", indexed[pos].id);
  }

  const pool_count = indexed.filter((x) => x.is_pool).length;
  return { classified: photos.length, pool_count };
}
