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
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

/**
 * The model provider fetches remote media URLs itself, and hosts like
 * media-cdn.tripadvisor.com / lh3.googleusercontent.com block those fetchers
 * (robots.txt / bot protection) even though the image opens fine in a browser.
 * So we download the bytes here and inline them as a data URL instead.
 * Returns null when the image can't be fetched — the caller skips it.
 */
async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "image/avif,image/webp,image/jpeg,image/png,*/*",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`[pool-detect] image fetch ${res.status}: ${url.slice(0, 120)}`);
      return null;
    }
    const type = (res.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
    if (!type.startsWith("image/")) {
      console.warn(`[pool-detect] not an image (${type || "unknown"}): ${url.slice(0, 120)}`);
      return null;
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > MAX_IMAGE_BYTES) {
      console.warn(`[pool-detect] image size ${buf.byteLength} rejected: ${url.slice(0, 120)}`);
      return null;
    }
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return `data:${type};base64,${btoa(binary)}`;
  } catch (e) {
    console.warn(
      `[pool-detect] image fetch failed (${e instanceof Error ? e.message : e}): ${url.slice(0, 120)}`,
    );
    return null;
  }
}

/** `images` are inlined data URLs, already downloaded by the caller. */
async function classifyBatch(images: string[]): Promise<PoolJudgment[]> {
  const urls = images;
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
        model: "google/gemini-2.5-flash",
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

  const isLikelyImageUrl = (u: string) => {
    if (!u || /\s|"|'|&quot;|&amp;quot;/.test(u)) return false;
    try {
      const parsed = new URL(u);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const judgments: PoolJudgment[] = new Array(photos.length).fill(null).map(() => ({ ...EMPTY }));
  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batchIdx = photos.slice(i, i + BATCH_SIZE).map((_, k) => i + k);
    const candidateIdx = batchIdx.filter((k) => isLikelyImageUrl(photos[k].url));
    if (candidateIdx.length === 0) continue;

    // Download the bytes ourselves; images we can't fetch are skipped for good
    // rather than sent to the model, which cannot fetch them either.
    const fetched = await Promise.all(candidateIdx.map((k) => toDataUrl(photos[k].url)));
    const validIdx: number[] = [];
    const images: string[] = [];
    candidateIdx.forEach((k, n) => {
      const dataUrl = fetched[n];
      if (dataUrl) {
        validIdx.push(k);
        images.push(dataUrl);
      }
    });
    if (validIdx.length === 0) continue;

    let result = await classifyBatch(images);
    if (result.every((r) => r.is_pool === null)) {
      // Retry the batch once — the images are already inlined, so a repeat only
      // helps for transient gateway errors.
      await new Promise((r) => setTimeout(r, 800));
      result = await classifyBatch(images);
    }
    if (result.every((r) => r.is_pool === null) && images.length > 1) {
      // Per-image fallback so one bad image doesn't kill the batch
      result = [];
      for (const img of images) {
        const single = await classifyBatch([img]);
        result.push(single[0] ?? { ...EMPTY });
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    validIdx.forEach((k, idx) => {
      judgments[k] = result[idx] ?? { ...EMPTY };
    });

    if (i + BATCH_SIZE < photos.length) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  for (let i = 0; i < photos.length; i++) {
    const j = judgments[i];
    // Don't overwrite a previously good classification with null when the
    // gateway failed for this run — only persist when we got a real verdict.
    if (j.is_pool === null && j.is_outdoor === null && j.pool_score === null) continue;
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
