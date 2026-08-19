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

// =============================================================================
// CANONICAL POOL SCORE — 5 weighted criteria, each rated 0–10.
// Weights MUST match About page, guide tables and profile breakdowns.
// =============================================================================

export type PoolComponents = {
  pool_design_setting: number;   // 25%
  view_atmosphere: number;       // 25%
  size_lounging_space: number;   // 20%
  access_seasonality: number;    // 15%
  service_maintenance: number;   // 15%
};

export const POOL_WEIGHTS: Record<keyof PoolComponents, number> = {
  pool_design_setting: 0.25,
  view_atmosphere: 0.25,
  size_lounging_space: 0.20,
  access_seasonality: 0.15,
  service_maintenance: 0.15,
};

export const POOL_CRITERIA: Array<{
  key: keyof PoolComponents;
  label: string;
  hint: string;
}> = [
  { key: "pool_design_setting", label: "Pool design & setting", hint: "Architecture, materials, how the pool sits in the hotel" },
  { key: "view_atmosphere",     label: "View & atmosphere",     hint: "Skyline, sea, gardens, light, music, vibe" },
  { key: "size_lounging_space", label: "Size & lounging space", hint: "Pool dimensions, sunbeds, cabanas, deck space" },
  { key: "access_seasonality",  label: "Access & seasonality",  hint: "Opening hours, season length, guest-only vs day-pass" },
  { key: "service_maintenance", label: "Service & maintenance", hint: "Attendants, towels, food and drink, cleanliness" },
];

type AnyComponents = Partial<PoolComponents> & Partial<{
  // Legacy 0–2 keys
  pool_first_feel: number;
  vibe: number;
  lounging_space: number;
  uniqueness: number;
  service: number;
}>;

/** Normalize either the new (0–10) shape OR the legacy (0–2) shape into canonical. */
export function toCanonicalComponents(c: AnyComponents | null | undefined): PoolComponents {
  const safe = c ?? {};
  // New shape already present?
  if (safe.pool_design_setting != null || safe.view_atmosphere != null) {
    return {
      pool_design_setting:  clamp(Number(safe.pool_design_setting  ?? 0), 0, 10),
      view_atmosphere:      clamp(Number(safe.view_atmosphere      ?? 0), 0, 10),
      size_lounging_space:  clamp(Number(safe.size_lounging_space  ?? 0), 0, 10),
      access_seasonality:   clamp(Number(safe.access_seasonality   ?? 0), 0, 10),
      service_maintenance:  clamp(Number(safe.service_maintenance  ?? 0), 0, 10),
    };
  }
  // Legacy 0–2 shape — multiply by 5 to map into 0–10.
  return {
    pool_design_setting:  clamp(Number(safe.pool_first_feel ?? 0) * 5, 0, 10),
    view_atmosphere:      clamp(Number(safe.vibe            ?? 0) * 5, 0, 10),
    size_lounging_space:  clamp(Number(safe.lounging_space  ?? 0) * 5, 0, 10),
    access_seasonality:   clamp(Number(safe.uniqueness      ?? 0) * 5, 0, 10),
    service_maintenance:  clamp(Number(safe.service         ?? 0) * 5, 0, 10),
  };
}

/** Canonical weighted pool score (0–10). Accepts old or new shape. */
export function computePoolScore(c: AnyComponents): number {
  const n = toCanonicalComponents(c);
  const total =
    n.pool_design_setting * POOL_WEIGHTS.pool_design_setting +
    n.view_atmosphere     * POOL_WEIGHTS.view_atmosphere +
    n.size_lounging_space * POOL_WEIGHTS.size_lounging_space +
    n.access_seasonality  * POOL_WEIGHTS.access_seasonality +
    n.service_maintenance * POOL_WEIGHTS.service_maintenance;
  return round(total, 1);
}

function round(n: number, p: number) {
  const f = 10 ** p;
  return Math.round(n * f) / f;
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
