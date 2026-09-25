/**
 * The Evidence-based Pool Score is rolled out to every hotel.
 * The ten hotels below were the original pilot group and are kept only so the
 * automation can still be run for them first.
 */
export const EVIDENCE_ROLLOUT_ALL = true;

export const EVIDENCE_TEST_GROUP: string[] = [
  "bangkok-the-siam",
  "los-angeles-hotel-june-west-la",
  "barcelona-1898",
  "mallorca-hotel-can-bordoy-grand-house-and-garden",
  "sydney-park-hyatt-sydney",
  "barcelona-hotel-arts",
  "sydney-w-sydney",
  "porto-elounda-golf-spa-resort",
  "barcelona-grand-hotel-central",
  "london-bvlgari-hotel-london",
];

/** Every hotel now uses the evidence model. */
export function isEvidenceTestHotel(slug?: string | null): boolean {
  return EVIDENCE_ROLLOUT_ALL ? !!slug : !!slug && EVIDENCE_TEST_GROUP.includes(slug);
}

/**
 * EVIDENCE-BASED POOL SCORE (score_version = "evidence-v1")
 *
 * Five measurable factors, 0–100 internally, shown as 0–10.
 * Pure functions only — no database, no framework. Every factor returns null
 * when the evidence is missing; a missing factor is NEVER treated as zero and
 * its points are never redistributed over the other factors.
 */

export const SCORE_VERSION = "evidence-v2";

export type ConfidenceLevel = "low" | "medium" | "high";

export type EvidenceVerificationStatus =
  | "research_pending"
  | "partially_verified"
  | "fully_verified"
  | "conflicting_data"
  | "no_active_pool";

export type PoolScoreRecord = {
  hotelId: string;
  guestSentimentPoints: number | null;
  heatingPoints: number | null;
  poolCountPoints: number | null;
  poolSizePoints: number | null;
  externalRecognitionPoints: number | null;
  totalPoints: number | null;
  scoreOutOfTen: number | null;
  verificationStatus: EvidenceVerificationStatus;
  confidenceLevel: ConfidenceLevel;
  scoreVersion: string;
  calculatedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/* ------------------------------------------------------------------ */
/* Factor 1 — positive pool comments (max 40)                          */
/* ------------------------------------------------------------------ */

export type PoolCommentSentiment =
  | "positive"
  | "neutral"
  | "negative"
  | "unclear"
  | "irrelevant";

export type PoolComment = {
  id?: string;
  source?: string | null;
  sourceUrl?: string | null;
  author?: string | null;
  publishedAt?: string | null; // ISO date
  text: string;
  sentiment: PoolCommentSentiment;
  /** True for hotel marketing copy — never counted as a guest comment. */
  isOwnerContent?: boolean | null;
  /** Identifies one documented stay; max three comments per stay count. */
  stayGroupKey?: string | null;
  excluded?: boolean | null;
};

export const MIN_RELEVANT_COMMENTS = 3;
const MAX_PER_STAY = 3;

export function normalizeCommentText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Small, dependency-free stable hash used for duplicate detection. */
export function commentHash(text: string): string {
  const s = normalizeCommentText(text);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c + i, 2246822519) >>> 0;
  }
  return `${h1.toString(16)}${h2.toString(16)}`;
}

export type SentimentBreakdown = {
  positive: number;
  neutral: number;
  negative: number;
  relevant: number;
  duplicatesRemoved: number;
  stayCapped: number;
  ownerContentRemoved: number;
  recentShare: number; // 0–1 share published within 24 months
  usable: PoolComment[];
};

const MONTHS_24_MS = 1000 * 60 * 60 * 24 * 365.25 * 2;

/** Deduplicate, drop owner copy, cap per stay, and count the sentiment mix. */
export function summarizeComments(
  comments: PoolComment[],
  now: Date = new Date(),
): SentimentBreakdown {
  let duplicatesRemoved = 0;
  let stayCapped = 0;
  let ownerContentRemoved = 0;

  const seen = new Set<string>();
  const perStay = new Map<string, number>();
  const usable: PoolComment[] = [];

  for (const c of comments) {
    if (c.excluded) continue;
    if (c.isOwnerContent) {
      ownerContentRemoved += 1;
      continue;
    }
    const key = [c.sourceUrl, c.author, c.publishedAt, commentHash(c.text)]
      .map((x) => (x ?? "").toString().trim().toLowerCase())
      .join("|");
    const textKey = commentHash(c.text);
    if (seen.has(key) || seen.has(textKey)) {
      duplicatesRemoved += 1;
      continue;
    }
    seen.add(key);
    seen.add(textKey);

    const stay = (c.stayGroupKey ?? c.author ?? "").trim().toLowerCase();
    if (stay) {
      const used = perStay.get(stay) ?? 0;
      if (used >= MAX_PER_STAY) {
        stayCapped += 1;
        continue;
      }
      perStay.set(stay, used + 1);
    }
    usable.push(c);
  }

  const counted = usable.filter(
    (c) => c.sentiment === "positive" || c.sentiment === "neutral" || c.sentiment === "negative",
  );
  const positive = counted.filter((c) => c.sentiment === "positive").length;
  const neutral = counted.filter((c) => c.sentiment === "neutral").length;
  const negative = counted.filter((c) => c.sentiment === "negative").length;
  const relevant = positive + neutral + negative;

  const recent = counted.filter((c) => {
    if (!c.publishedAt) return false;
    const t = new Date(c.publishedAt).getTime();
    return Number.isFinite(t) && now.getTime() - t <= MONTHS_24_MS;
  }).length;

  return {
    positive,
    neutral,
    negative,
    relevant,
    duplicatesRemoved,
    stayCapped,
    ownerContentRemoved,
    recentShare: relevant > 0 ? recent / relevant : 0,
    usable: counted,
  };
}

/** Bayesian-smoothed positive share, scaled to 40 points. Null under 3 comments. */
export function scoreGuestSentiment(
  breakdown: Pick<SentimentBreakdown, "positive" | "relevant">,
): number | null {
  if (breakdown.relevant < MIN_RELEVANT_COMMENTS) return null;
  const adjusted = (breakdown.positive + 3.5) / (breakdown.relevant + 5);
  return round1(clamp(adjusted * 40, 0, 40));
}

/* ------------------------------------------------------------------ */
/* Factor 2 — heated pools (max 15)                                    */
/* ------------------------------------------------------------------ */

export type HeatingCategory =
  | "shared_year_round"
  | "shared_full_season"
  | "shared_some_months"
  | "indoor_or_spa_only"
  | "private_only"
  | "none_heated"
  | "not_confirmed"
  | "conflicting";

export const HEATING_POINTS: Record<HeatingCategory, number | null> = {
  shared_year_round: 15,
  shared_full_season: 13,
  shared_some_months: 9,
  indoor_or_spa_only: 6,
  private_only: 4,
  none_heated: 0,
  not_confirmed: null,
  conflicting: null,
};

export const HEATING_COPY: Record<HeatingCategory, string> = {
  shared_year_round: "Shared swimming pool heated year-round",
  shared_full_season: "Shared swimming pool heated throughout the opening season",
  shared_some_months: "Shared swimming pool heated during some months",
  indoor_or_spa_only: "Only the indoor or spa pool is heated",
  private_only: "Only private room pools can be heated",
  none_heated: "No heated pool",
  not_confirmed: "Heating not confirmed",
  conflicting: "Heating information conflicting",
};

export function scoreHeating(category: HeatingCategory): number | null {
  return HEATING_POINTS[category];
}

/* ------------------------------------------------------------------ */
/* Factor 3 — number of pools (max 15)                                 */
/* ------------------------------------------------------------------ */

export type EvidencePoolCategory =
  | "shared_swimming_pool"
  | "private_room_pool"
  | "shared_swim_up_pool"
  | "spa_pool"
  | "children_pool"
  | "plunge_pool"
  | "jacuzzi_hot_tub";

/** Maps the stored pool_category values onto the evidence model's names. */
export function toEvidenceCategory(stored: string): EvidencePoolCategory {
  switch (stored) {
    case "shared_hotel_pool":
      return "shared_swimming_pool";
    case "shared_swim_up":
      return "shared_swim_up_pool";
    case "childrens_pool":
      return "children_pool";
    case "jacuzzi":
      return "jacuzzi_hot_tub";
    case "private_room_pool":
    case "spa_pool":
    case "plunge_pool":
      return stored as EvidencePoolCategory;
    default:
      return stored as EvidencePoolCategory;
  }
}

export type PoolCategoryCounts = {
  sharedSwimmingPoolCount: number;
  spaPoolCount: number;
  childrenPoolCount: number;
  privatePoolCategoryCount: number;
  plungePoolCount: number;
  jacuzziCount: number;
};

export type EvidencePool = {
  id?: string;
  name?: string | null;
  category: EvidencePoolCategory;
  areaSqm?: number | null;
  lengthMetres?: number | null;
  sizeCategory?: "plunge" | "small" | "medium" | "large" | null;
  sizeVerified?: boolean | null;
  verified?: boolean | null;
};

/** Counts per category. A jacuzzi is never a swimming pool; private pools are one category. */
export function countPools(pools: EvidencePool[]): PoolCategoryCounts {
  const counts: PoolCategoryCounts = {
    sharedSwimmingPoolCount: 0,
    spaPoolCount: 0,
    childrenPoolCount: 0,
    privatePoolCategoryCount: 0,
    plungePoolCount: 0,
    jacuzziCount: 0,
  };
  const seenNames = new Set<string>();
  for (const p of pools) {
    const name = (p.name ?? "").trim().toLowerCase();
    if (name && seenNames.has(name)) continue; // merged duplicate
    if (name) seenNames.add(name);
    switch (p.category) {
      case "shared_swimming_pool":
      case "shared_swim_up_pool":
        counts.sharedSwimmingPoolCount += 1;
        break;
      case "private_room_pool":
        counts.privatePoolCategoryCount += 1;
        break;
      case "spa_pool":
        counts.spaPoolCount += 1;
        break;
      case "children_pool":
        counts.childrenPoolCount += 1;
        break;
      case "plunge_pool":
        counts.plungePoolCount += 1;
        break;
      case "jacuzzi_hot_tub":
        counts.jacuzziCount += 1;
        break;
    }
  }
  // Private room pools are one category however many rooms have one.
  if (counts.privatePoolCategoryCount > 1) counts.privatePoolCategoryCount = 1;
  return counts;
}

/** Base points from shared swimming pools, plus capped extras. Null when unverifiable. */
export function scorePoolCount(
  counts: PoolCategoryCounts,
  verified = true,
): number | null {
  if (!verified) return null;
  const shared = counts.sharedSwimmingPoolCount;
  if (shared <= 0) return null; // not ranking eligible — no swimming pool
  let base: number;
  if (shared === 1) base = 6;
  else if (shared === 2) base = 10;
  else if (shared === 3) base = 13;
  else base = 15;

  let extra = 0;
  if (counts.childrenPoolCount > 0) extra += 1;
  if (counts.spaPoolCount > 0) extra += 1;
  if (counts.privatePoolCategoryCount > 0) extra += 1;

  return clamp(base + extra, 0, 15);
}

/* ------------------------------------------------------------------ */
/* Factor 4 — pool size (max 20)                                       */
/* ------------------------------------------------------------------ */

export function pointsFromArea(sqm: number): number {
  if (sqm >= 400) return 20;
  if (sqm >= 150) return 16;
  if (sqm >= 50) return 11;
  if (sqm >= 25) return 6;
  return 3;
}

export function pointsFromLength(metres: number): number {
  if (metres >= 25) return 20;
  if (metres >= 20) return 16;
  if (metres >= 15) return 12;
  if (metres >= 10) return 8;
  return 4;
}

const SIZE_CATEGORY_POINTS: Record<NonNullable<EvidencePool["sizeCategory"]>, number> = {
  plunge: 3,
  small: 6,
  medium: 11,
  large: 16,
};

/**
 * The largest shared swimming pool ordinary guests can use.
 * Area first, then length, then a verified size category. Never estimated.
 */
export function scorePoolSize(pools: EvidencePool[]): number | null {
  const shared = pools.filter(
    (p) =>
      (p.category === "shared_swimming_pool" || p.category === "shared_swim_up_pool") &&
      p.sizeVerified !== false,
  );
  if (!shared.length) return null;

  const areas = shared
    .map((p) => Number(p.areaSqm))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (areas.length) return pointsFromArea(Math.max(...areas));

  const lengths = shared
    .map((p) => Number(p.lengthMetres))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (lengths.length) return pointsFromLength(round1(Math.max(...lengths)));

  const cats = shared
    .map((p) => p.sizeCategory)
    .filter((c): c is NonNullable<EvidencePool["sizeCategory"]> => !!c);
  if (cats.length) return Math.max(...cats.map((c) => SIZE_CATEGORY_POINTS[c]));

  return null;
}

/* ------------------------------------------------------------------ */
/* Factor 5 — independent positive recognition (max 10)                */
/* ------------------------------------------------------------------ */

export type MentionTier = "A" | "B" | "C";

export type ExternalMention = {
  id?: string;
  url: string;
  canonicalUrl?: string | null;
  publication?: string | null;
  author?: string | null;
  tier?: MentionTier | null;
  isAboutPool?: boolean | null;
  isPositive?: boolean | null;
  excludedReason?: string | null;
  approved?: boolean | null;
};

const TIER_POINTS: Record<MentionTier, number> = { A: 5, B: 2, C: 1 };

function mentionKey(m: ExternalMention): string {
  const raw = (m.canonicalUrl ?? m.url ?? "").toLowerCase();
  return raw
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "");
}

/** Zero is a valid verified result and never blocks the score. */
export function scoreExternalRecognition(mentions: ExternalMention[]): number {
  const seen = new Set<string>();
  let total = 0;
  for (const m of mentions) {
    if (m.excludedReason) continue;
    if (m.approved === false) continue;
    if (!m.tier) continue;
    if (m.isAboutPool !== true || m.isPositive !== true) continue;
    const key = mentionKey(m);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    total += TIER_POINTS[m.tier];
  }
  return clamp(total, 0, 10);
}

/* ------------------------------------------------------------------ */
/* Confidence — computed separately, never folded into the score       */
/* ------------------------------------------------------------------ */

export type ConfidenceInput = {
  hasOfficialSource: boolean;
  independentSourceCount: number;
  relevantComments: number;
  recentShare: number; // 0–1
  heatingConfirmed: boolean;
  poolCountConfirmed: boolean;
  sizeConfirmed: boolean;
  hasConflicts: boolean;
  /** True when every one of the five factors is evidence-backed. */
  allFactorsNumeric: boolean;
  /** True when the factors the score requires are evidence-backed. */
  requiredFactorsNumeric?: boolean;
};

export function calculateConfidence(input: ConfidenceInput): ConfidenceLevel {
  if (
    input.hasOfficialSource &&
    input.independentSourceCount >= 1 &&
    input.relevantComments >= 20 &&
    input.heatingConfirmed &&
    input.poolCountConfirmed &&
    input.sizeConfirmed &&
    !input.hasConflicts &&
    input.recentShare >= 0.75
  ) {
    return "high";
  }
  if (
    input.hasOfficialSource &&
    input.relevantComments >= MIN_RELEVANT_COMMENTS &&
    (input.requiredFactorsNumeric ?? input.allFactorsNumeric) &&
    !input.hasConflicts
  ) {
    return "medium";
  }
  return "low";
}

/* ------------------------------------------------------------------ */
/* Total                                                               */
/* ------------------------------------------------------------------ */

export type EvidenceFactors = {
  guestSentimentPoints: number | null;
  heatingPoints: number | null;
  poolCountPoints: number | null;
  poolSizePoints: number | null;
  externalRecognitionPoints: number | null;
};

export type EvidenceTotal = {
  totalPoints: number | null;
  scoreOutOfTen: number | null;
  blockingReasons: string[];
  /** How many of the five factors carry documented evidence. */
  factorsUsed: number;
  factorsTotal: number;
  /** The maximum points the confirmed factors could have scored. */
  maxAvailable: number;
  /** Human-readable names of the factors that are still unconfirmed. */
  missingFactors: string[];
};

export const FACTOR_LABELS: Array<{ key: keyof EvidenceFactors; label: string; max: number; hint: string }> = [
  {
    key: "guestSentimentPoints",
    label: "Guest pool sentiment",
    max: 40,
    hint: "How guests describe the pool itself, across deduplicated reviews.",
  },
  {
    key: "heatingPoints",
    label: "Heating",
    max: 15,
    hint: "Whether the shared swimming pool is heated, and for how much of the year.",
  },
  {
    key: "poolCountPoints",
    label: "Number of pools",
    max: 15,
    hint: "Shared swimming pools count first; spa, children's and private pools add little.",
  },
  {
    key: "poolSizePoints",
    label: "Pool size",
    max: 20,
    hint: "The largest shared pool guests can use, measured in area or length.",
  },
  {
    key: "externalRecognitionPoints",
    label: "Independent recognition",
    max: 10,
    hint: "Positive, independently published articles about the pool.",
  },
];

const MISSING_COPY: Record<keyof EvidenceFactors, string> = {
  guestSentimentPoints: "Insufficient guest feedback",
  heatingPoints: "Heating not confirmed",
  poolCountPoints: "Pool count not confirmed",
  poolSizePoints: "Pool size not confirmed",
  externalRecognitionPoints: "Independent recognition not reviewed",
};

/**
 * Factors that must always be evidence-backed. Without them there is no score.
 * The other three factors are optional: when one is unconfirmed it is left out
 * of the score entirely — its points are never guessed and never handed to the
 * remaining factors. The score is expressed against the factors that ARE
 * documented, and the page always says how many that is.
 */
export const REQUIRED_FACTORS: Array<keyof EvidenceFactors> = [
  "guestSentimentPoints",
  "poolCountPoints",
];

export function calculateTotal(f: EvidenceFactors): EvidenceTotal {
  const factorsTotal = FACTOR_LABELS.length;
  const missingFactors = FACTOR_LABELS.filter(({ key }) => f[key] == null).map(
    ({ label }) => label,
  );
  const blockingReasons = REQUIRED_FACTORS.filter((key) => f[key] == null).map(
    (key) => MISSING_COPY[key],
  );
  const confirmed = FACTOR_LABELS.filter(({ key }) => f[key] != null);

  if (blockingReasons.length || confirmed.length === 0) {
    return {
      totalPoints: null,
      scoreOutOfTen: null,
      blockingReasons: blockingReasons.length ? blockingReasons : [MISSING_COPY.guestSentimentPoints],
      factorsUsed: confirmed.length,
      factorsTotal,
      maxAvailable: 0,
      missingFactors,
    };
  }

  const earned = confirmed.reduce((sum, { key }) => sum + (f[key] as number), 0);
  const maxAvailable = confirmed.reduce((sum, { max }) => sum + max, 0);
  const total = clamp((earned / maxAvailable) * 100, 0, 100);

  return {
    totalPoints: round1(total),
    scoreOutOfTen: Math.round(total) / 10,
    blockingReasons: [],
    factorsUsed: confirmed.length,
    factorsTotal,
    maxAvailable,
    missingFactors,
  };
}

export const SCORE_PENDING_DATA = "Pool Score pending — more verified data required";
export const SCORE_PENDING_CONFIDENCE = "Pool Score pending — confidence too low";

/** Public-facing number formatting: never raw floats, never more than one decimal. */
export function formatPoints(value: number | null): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  return round1(value).toFixed(1);
}

/* ------------------------------------------------------------------ */
/* Ranking and indexing                                                */
/* ------------------------------------------------------------------ */

export type EvidenceGateInput = {
  verificationStatus: EvidenceVerificationStatus;
  confidenceLevel: ConfidenceLevel;
  totalPoints: number | null;
  approvedBy: string | null;
  approvedAt: string | null;
  blockingQaErrors: string[];
};

export function canRank(g: EvidenceGateInput): boolean {
  return (
    g.verificationStatus === "fully_verified" &&
    g.confidenceLevel !== "low" &&
    g.totalPoints !== null &&
    g.approvedBy !== null &&
    g.approvedAt !== null &&
    g.blockingQaErrors.length === 0
  );
}

export const canIndex = canRank;
export const inSitemap = canRank;

export function robotsDirective(g: EvidenceGateInput): "index, follow" | "noindex, follow" {
  return canIndex(g) ? "index, follow" : "noindex, follow";
}

/* ------------------------------------------------------------------ */
/* QA                                                                  */
/* ------------------------------------------------------------------ */

export type QaInput = EvidenceFactors & {
  breakdown: Pick<SentimentBreakdown, "relevant">;
  counts: PoolCategoryCounts;
  heatingCategory: HeatingCategory;
  totalPoints: number | null;
  scoreOutOfTen: number | null;
  hasOfficialSource: boolean;
  approvedBy: string | null;
  sizeEstimatedFromPhoto?: boolean;
};

/** Blocking QA errors. An empty array means the score may be published. */
export function evidenceQaErrors(q: QaInput): string[] {
  const errors: string[] = [];
  if (q.breakdown.relevant < MIN_RELEVANT_COMMENTS)
    errors.push("Fewer than three relevant pool comments");
  for (const { key, label } of FACTOR_LABELS)
    if (REQUIRED_FACTORS.includes(key) && q[key] == null)
      errors.push(`${label} has no verified value`);
  if (q.counts.sharedSwimmingPoolCount <= 0)
    errors.push("The number of shared swimming pools cannot be derived");
  if (q.heatingCategory === "conflicting") errors.push("Heating information conflicts");
  if (q.sizeEstimatedFromPhoto) errors.push("Pool size was estimated from a photograph");
  if (!q.hasOfficialSource) errors.push("No official source");
  if (!q.approvedBy) errors.push("No editorial approval");
  if (q.totalPoints != null && (q.totalPoints < 0 || q.totalPoints > 100))
    errors.push("Total points outside 0–100");
  if (
    q.totalPoints != null &&
    q.scoreOutOfTen != null &&
    Math.abs(q.scoreOutOfTen - Math.round(q.totalPoints) / 10) > 1e-9
  )
    errors.push("The 0–10 score does not match the total points");
  return errors;
}

/* ------------------------------------------------------------------ */
/* Automatic approval (evidence-v1)                                    */
/* ------------------------------------------------------------------ */

/** The signature stored as approved_by when the system approves a score itself. */
export const AUTO_APPROVER = "auto:evidence-v1";

export function isAutoApprover(approvedBy: string | null | undefined): boolean {
  return approvedBy === AUTO_APPROVER;
}

export type AutoApprovalInput = {
  /** QA errors with the "No editorial approval" item removed. */
  qaErrors: string[];
  blockingReasons: string[];
  confidenceLevel: ConfidenceLevel;
  totalPoints: number | null;
  scoreOutOfTen: number | null;
  relevantComments: number;
  independentSourceCount: number;
  hasOfficialSource: boolean;
  hasConflicts: boolean;
  qaBlocked: boolean;
};

/**
 * Reasons the system may NOT approve this score yet.
 * An empty array means the score is published automatically. Anything else
 * stays "pending" until the scheduled job finds more evidence — there is no
 * human review step.
 */
export function autoApprovalBlockers(input: AutoApprovalInput): string[] {
  const reasons: string[] = [];
  for (const e of input.qaErrors) if (e !== "No editorial approval") reasons.push(e);
  reasons.push(...input.blockingReasons);
  if (input.confidenceLevel === "low") reasons.push("Confidence too low for automatic approval");
  if (input.totalPoints == null || input.scoreOutOfTen == null)
    reasons.push("No complete score");
  if (input.relevantComments < MIN_RELEVANT_COMMENTS)
    reasons.push("Fewer than three relevant pool comments");
  if (!input.hasOfficialSource) reasons.push("No official source");
  // An independent source raises confidence but is not required for a score:
  // the official page plus deduplicated guest comments already carry evidence.
  if (input.hasConflicts) reasons.push("Conflicting data");
  if (input.qaBlocked) reasons.push("Hotel is QA blocked");
  return [...new Set(reasons)];
}

export function canAutoApprove(input: AutoApprovalInput): boolean {
  return autoApprovalBlockers(input).length === 0;
}
