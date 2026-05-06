// Pure scoring math — safe to import anywhere.
export type SourceKey = "google" | "tripadvisor" | "booking" | "hotels_com";

export type SnapshotInput = {
  source: SourceKey;
  rating_value: number | null;
  rating_scale: number | null;
  rating_count: number | null;
};

export type Weights = Record<SourceKey, number>;

export const DEFAULT_WEIGHTS: Weights = {
  google: 0.35,
  tripadvisor: 0.25,
  booking: 0.25,
  hotels_com: 0.15,
};

export type ComputedMeta = {
  meta_rating_0_100: number | null;
  confidence_0_100: number;
  sources_used: Array<{
    source: SourceKey;
    normalized: number;
    weight: number;
    volume: number;
    rating_count: number;
  }>;
};

export function computeMeta(
  snapshots: SnapshotInput[],
  weights: Weights = DEFAULT_WEIGHTS,
  volumeCap = 5000,
): ComputedMeta {
  const usable = snapshots.filter(
    (s) => s.rating_value != null && s.rating_scale && s.rating_scale > 0,
  );
  if (usable.length === 0) {
    return { meta_rating_0_100: null, confidence_0_100: 0, sources_used: [] };
  }

  const lnCap = Math.log(1 + volumeCap);
  let weightedSum = 0;
  let weightTotal = 0;
  let totalVolume = 0;
  const sourcesUsed: ComputedMeta["sources_used"] = [];

  for (const s of usable) {
    const normalized = (Number(s.rating_value) / Number(s.rating_scale)) * 100;
    const count = Math.max(0, Number(s.rating_count ?? 0));
    const volume = lnCap > 0 ? Math.min(1, Math.log(1 + count) / lnCap) : 0;
    const w = weights[s.source] ?? 0;
    const effective = w * volume;
    weightedSum += normalized * effective;
    weightTotal += effective;
    totalVolume += volume;
    sourcesUsed.push({
      source: s.source,
      normalized: round(normalized, 2),
      weight: w,
      volume: round(volume, 3),
      rating_count: count,
    });
  }

  const meta = weightTotal > 0 ? weightedSum / weightTotal : null;
  const sourceBonus = Math.min(60, usable.length * 15);
  const volumeBonus = Math.min(40, (totalVolume / Math.max(1, usable.length)) * 40);
  const confidence = Math.min(100, sourceBonus + volumeBonus);

  return {
    meta_rating_0_100: meta != null ? round(meta, 2) : null,
    confidence_0_100: round(confidence, 1),
    sources_used: sourcesUsed,
  };
}

export type PoolComponents = {
  vibe: number;
  lounging_space: number;
  service: number;
  uniqueness: number;
  pool_first_feel: number;
};

// Each component is 0–2; sum = 0–10.
export function computePoolScore(c: PoolComponents): number {
  const vals = [c.vibe, c.lounging_space, c.service, c.uniqueness, c.pool_first_feel];
  const total = vals.reduce((a, b) => a + clamp(Number(b) || 0, 0, 2), 0);
  return round(total, 1);
}

function round(n: number, p: number) {
  const f = 10 ** p;
  return Math.round(n * f) / f;
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
