/**
 * THE Pool Score — the one and only scoring model on the site.
 * Criteria, weights, max points and version live here and nowhere else.
 * The per-hotel value and its recalculation date come from the database
 * (public_hotels_view.pool_score_0_10 / pool_score_updated_at).
 */
export type PoolScoreFactorKey =
  | "guestSentimentPoints"
  | "heatingPoints"
  | "poolCountPoints"
  | "poolSizePoints"
  | "externalRecognitionPoints";

export const POOL_SCORE_NAME = "Pool Score";
export const POOL_SCORE_VERSION = "evidence-v2";
export const POOL_SCORE_MAX_POINTS = 100;
export const POOL_SCORE_SCALE = 10;

export const POOL_SCORE_CRITERIA: Array<{
  key: PoolScoreFactorKey;
  label: string;
  max: number;
  hint: string;
  required: boolean;
}> = [
  { key: "guestSentimentPoints", label: "Guest pool sentiment", max: 40, required: true, hint: "How guests describe the pool itself, across deduplicated reviews." },
  { key: "heatingPoints", label: "Heating", max: 15, required: false, hint: "Whether the shared swimming pool is heated, and for how much of the year." },
  { key: "poolCountPoints", label: "Number of pools", max: 15, required: true, hint: "Shared swimming pools count first; spa, children's and private pools add little." },
  { key: "poolSizePoints", label: "Pool size", max: 20, required: false, hint: "The largest shared pool guests can use, measured in area or length." },
  { key: "externalRecognitionPoints", label: "Independent recognition", max: 10, required: false, hint: "Positive, independently published articles about the pool." },
];

/** Weight of each criterion as a share of the maximum (e.g. 0.4). */
export const POOL_SCORE_WEIGHTS = Object.fromEntries(
  POOL_SCORE_CRITERIA.map((c) => [c.key, c.max / POOL_SCORE_MAX_POINTS]),
) as Record<PoolScoreFactorKey, number>;

/** Human date for "score last recalculated", from the database timestamp. */
export function formatScoreDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
