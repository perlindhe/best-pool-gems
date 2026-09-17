/**
 * THE single source of truth for "how well do we know this hotel's pool?".
 *
 * Every surface — profile badge, status box, rankings, destination pages,
 * home page, guides, heating module, facts table, filters, sitemap, robots
 * rules, structured data and the admin QA page — must read status, score and
 * publication permission from this file. No component may invent its own.
 */

import {
  POOL_CRITERIA,
  computePoolScore,
  toCanonicalComponents,
  hasIdenticalSubscores,
} from "@/lib/scoring";

export type HotelStatus =
  | "research_pending"
  | "partially_verified"
  | "fully_verified"
  | "conflicting_data"
  | "no_active_pool";

/**
 * Hotels in the current data-correction phase are judged by the full rule
 * set (every core fact, two sources, editor sign-off). The remaining
 * profiles keep the previous rules until the phase is approved and rolled
 * out, so nothing outside the test group changes silently.
 */
export const CORRECTION_PHASE_SLUGS = [
  "bangkok-the-siam",
  "los-angeles-hotel-june-west-la",
  "barcelona-1898",
  "mallorca-hotel-can-bordoy-grand-house-and-garden",
  "sydney-park-hyatt-sydney",
] as const;

export function isCorrectionPhase(slug?: string | null): boolean {
  return !!slug && (CORRECTION_PHASE_SLUGS as readonly string[]).includes(slug);
}

/* ------------------------------------------------------------------ */
/* Pool records: the only source of counts, heating and season         */
/* ------------------------------------------------------------------ */

export type PoolCategory =
  | "shared_hotel_pool"
  | "shared_swim_up"
  | "private_room_pool"
  | "spa_pool"
  | "childrens_pool"
  | "plunge_pool"
  | "jacuzzi";

export type StatusPool = {
  id?: string;
  pool_name?: string | null;
  pool_category: PoolCategory | string;
  shared_or_private?: string | null;
  indoor?: boolean | null;
  outdoor?: boolean | null;
  rooftop?: boolean | null;
  heated?: boolean | null;
  heating_state?: string | null;
  season_state?: string | null;
  seasonal_dates?: string | null;
  year_round?: boolean | null;
};

export type PoolCounts = {
  sharedSwimmingPools: number;
  spaPools: number;
  childrenPools: number;
  privatePoolCategories: number;
  plungePools: number;
  jacuzzis: number;
};

const SHARED_SWIM = new Set(["shared_hotel_pool", "shared_swim_up"]);

function isPrivatePool(p: StatusPool): boolean {
  return p.pool_category === "private_room_pool" || p.shared_or_private === "private";
}

/** Counts per category. A jacuzzi is never a swimming pool. */
export function calculatePoolCounts(pools: StatusPool[]): PoolCounts {
  const counts: PoolCounts = {
    sharedSwimmingPools: 0,
    spaPools: 0,
    childrenPools: 0,
    privatePoolCategories: 0,
    plungePools: 0,
    jacuzzis: 0,
  };
  for (const p of pools) {
    if (isPrivatePool(p)) {
      counts.privatePoolCategories += 1;
      continue;
    }
    if (SHARED_SWIM.has(String(p.pool_category))) counts.sharedSwimmingPools += 1;
    else if (p.pool_category === "spa_pool") counts.spaPools += 1;
    else if (p.pool_category === "childrens_pool") counts.childrenPools += 1;
    else if (p.pool_category === "plunge_pool") counts.plungePools += 1;
    else if (p.pool_category === "jacuzzi") counts.jacuzzis += 1;
  }
  return counts;
}

export type HeatingStatus =
  | "heated_pool_available"
  | "no_heated_pool"
  | "heating_not_confirmed"
  | "conflicting_heating_information";

/** Heating comes from the pool records only — never from a manual hotel field. */
export function calculateHeatingStatus(pools: StatusPool[]): HeatingStatus {
  if (!pools.length) return "heating_not_confirmed";
  let heated = 0;
  let notHeated = 0;
  for (const p of pools) {
    if (p.heating_state === "conflicting") return "conflicting_heating_information";
    if (p.heating_state === "confirmed_heated") {
      if (p.heated === false) return "conflicting_heating_information";
      heated += 1;
    } else if (p.heating_state === "confirmed_not_heated") {
      if (p.heated === true) return "conflicting_heating_information";
      notHeated += 1;
    }
  }
  if (heated > 0) return "heated_pool_available";
  if (notHeated > 0 && notHeated === pools.length) return "no_heated_pool";
  return "heating_not_confirmed";
}

export const HEATING_COPY: Record<HeatingStatus, string> = {
  heated_pool_available: "Heated pool available",
  no_heated_pool: "No heated pool",
  heating_not_confirmed: "Heating not confirmed",
  conflicting_heating_information: "Heating information conflicting",
};

export type SeasonStatus =
  | "year_round_swimming_pool"
  | "year_round_spa_pool"
  | "seasonal"
  | "mixed"
  | "not_confirmed"
  | "conflicting";

function poolLabel(p: StatusPool): string {
  if (p.pool_category === "spa_pool") return "spa pool";
  if (p.rooftop === true) return "rooftop pool";
  if (p.indoor === true) return "indoor pool";
  return "outdoor pool";
}

/** Season, per pool, written so one seasonal pool never hides a year-round one. */
export function calculateSeasonStatus(pools: StatusPool[]): {
  status: SeasonStatus;
  sentence: string;
} {
  const relevant = pools.filter((p) => !isPrivatePool(p) && p.pool_category !== "jacuzzi");
  if (!relevant.length) return { status: "not_confirmed", sentence: "Pool season not confirmed" };
  if (relevant.some((p) => p.season_state === "conflicting"))
    return { status: "conflicting", sentence: "Season information conflicting" };
  const yearRound = relevant.filter((p) => p.season_state === "year_round");
  const seasonal = relevant.filter((p) => p.season_state === "seasonal");
  if (!yearRound.length && !seasonal.length)
    return { status: "not_confirmed", sentence: "Pool season not confirmed" };

  if (yearRound.length && seasonal.length) {
    const yr = yearRound[0]!;
    const se = seasonal[0]!;
    const dates = se.seasonal_dates ? ` (${se.seasonal_dates})` : "";
    return {
      status: "mixed",
      sentence: `Year-round ${poolLabel(yr)}; ${poolLabel(se)} is seasonal${dates}`,
    };
  }
  if (yearRound.length) {
    const spaOnly = yearRound.every((p) => p.pool_category === "spa_pool");
    return {
      status: spaOnly ? "year_round_spa_pool" : "year_round_swimming_pool",
      sentence: spaOnly ? "Year-round spa pool available" : "Year-round swimming pool available",
    };
  }
  const dates = seasonal.find((p) => p.seasonal_dates)?.seasonal_dates;
  return {
    status: "seasonal",
    sentence: dates ? `Seasonal pool opening (${dates})` : "Seasonal outdoor pools",
  };
}

/** One readable sentence per category, built only from the pool records. */
export function describePoolMix(counts: PoolCounts): string | null {
  const parts: string[] = [];
  const add = (n: number, one: string, many: string) => {
    if (n > 0) parts.push(`${n} ${n === 1 ? one : many}`);
  };
  add(counts.sharedSwimmingPools, "shared swimming pool", "shared swimming pools");
  add(counts.childrenPools, "children's pool", "children's pools");
  add(counts.plungePools, "plunge pool", "plunge pools");
  add(counts.spaPools, "spa pool", "spa pools");
  add(counts.jacuzzis, "jacuzzi", "jacuzzis");
  let text =
    parts.length > 1
      ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
      : (parts[0] ?? "");
  if (counts.privatePoolCategories > 0) {
    const p = `${counts.privatePoolCategories} private pool ${counts.privatePoolCategories === 1 ? "category" : "categories"}`;
    text = text ? `${text}, plus ${p} in selected rooms` : `${p} in selected rooms`;
  }
  if (!text) return null;
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}


/** The canonical record fields the central functions need. */
export type StatusHotel = {
  slug?: string | null;
  verification_status?: string | null;
  editorial_status?: string | null;
  qa_blocked?: boolean | null;
  hotel_status?: string | null;
  has_active_pool?: boolean | null;
  pool_status?: string | null;
  ranking_eligible?: boolean | null;
  pool_count?: number | null;
  shared_pool_count?: number | null;
  spa_pool_count?: number | null;
  kids_pool_count?: number | null;
  private_pool_count?: number | null;
  plunge_pool_count?: number | null;
  swim_up_count?: number | null;
  jacuzzi_count?: number | null;
  heated_state?: string | null;
  season_state?: string | null;
  heated_pool?: boolean | null;
  year_round?: boolean | null;
  indoor?: boolean | null;
  outdoor?: boolean | null;
  adults_only?: boolean | null;
  family_friendly?: boolean | null;
  guest_only?: boolean | null;
  day_pass_available?: boolean | null;
  official_url?: string | null;
  website_url?: string | null;
  primary_source_url?: string | null;
  secondary_source_url?: string | null;
  last_verified_date?: string | null;
  pool_components?: Record<string, number> | null;
  pool_score_0_10?: number | null;
  score_approved_by?: string | null;
  pool_type?: string | null;
  pool_size?: string | null;
  best_time?: string | null;
};

const n = (v: number | null | undefined) => (typeof v === "number" ? v : 0);

/** A shared swimming pool is the only thing that makes a hotel a pool hotel. */
export function hasConfirmedSwimmingPool(h: StatusHotel): boolean {
  if (h.has_active_pool === false) return false;
  if (h.pool_status === "no_pool") return false;
  // shared_pool_count already includes swim-up pools; swim_up_count is a subset.
  return n(h.shared_pool_count) > 0;
}

/** Mandatory core facts, in the order they are reported to editors. */
export function missingCoreFacts(h: StatusHotel): string[] {
  const missing: string[] = [];
  const strict = isCorrectionPhase(h.slug);
  if (!hasConfirmedSwimmingPool(h)) missing.push("pool category");
  if (h.indoor == null && h.outdoor == null) missing.push("indoor/outdoor");
  if (!h.official_url && !h.primary_source_url) missing.push("official source");
  if (!h.secondary_source_url) missing.push("additional source");
  if (!h.last_verified_date) missing.push("verification date");
  if (strict) {
    if (!h.heated_state || h.heated_state === "unknown") missing.push("heating status");
    if (!h.season_state || h.season_state === "unknown") missing.push("season");
    if (h.guest_only == null && h.day_pass_available == null) missing.push("guest access");
    if (!hasApprovedSubscores(h)) missing.push("editorial sub-scores");
  }
  return missing;
}

function hasApprovedSubscores(h: StatusHotel): boolean {
  const c = h.pool_components;
  if (!c) return false;
  const canonical = toCanonicalComponents(c);
  const allJudged = POOL_CRITERIA.every(({ key }) => {
    const v = Number(canonical[key]);
    return Number.isFinite(v) && v > 0;
  });
  if (!allJudged || hasIdenticalSubscores(c)) return false;
  if (isCorrectionPhase(h.slug)) return Boolean(h.score_approved_by);
  return true;
}

/** Two published values that cannot both be true. */
export function detectConflicts(h: StatusHotel, pools?: StatusPool[]): string[] {
  const conflicts: string[] = [];
  const shared = n(h.shared_pool_count);
  if (!hasConfirmedSwimmingPool(h) && (n(h.pool_count) > 0 || shared > 0))
    conflicts.push("No confirmed swimming pool but a pool count above zero");
  if (h.heated_state === "not_heated" && h.heated_pool === true)
    conflicting(conflicts, "Heating is recorded as both heated and not heated");
  if (h.heated_state === "conflicting") conflicting(conflicts, "Sources disagree about heating");
  if (h.season_state === "unknown" && h.year_round === true)
    conflicting(conflicts, "Year-round is claimed without a documented season");
  if (h.adults_only === true && h.family_friendly === true)
    conflicting(conflicts, "Marked both adults only and family friendly");
  if (h.indoor === false && h.outdoor === false && shared > 0)
    conflicting(conflicts, "A pool is recorded as neither indoor nor outdoor");
  // pool_count is the number of shared swimming pools only — spa, children's,
  // plunge, private pools and jacuzzis are always counted separately.
  if (h.pool_count != null && h.pool_count !== shared)
    conflicting(conflicts, "The pool count cannot be explained by the pool records");

  if (pools && pools.length) {
    const counts = calculatePoolCounts(pools);
    if (counts.sharedSwimmingPools !== shared)
      conflicting(conflicts, "The summary shows a different number of shared pools than the pool records");
    if (pools.some((p) => p.pool_category === "jacuzzi" && p.shared_or_private === "shared" && shared === 0 && n(h.pool_count) > 0))
      conflicting(conflicts, "A jacuzzi is counted as a swimming pool");
    if (pools.some((p) => isPrivatePool(p) && SHARED_SWIM.has(String(p.pool_category))))
      conflicting(conflicts, "A private room pool is recorded as a shared hotel pool");
    const heating = calculateHeatingStatus(pools);
    if (heating === "conflicting_heating_information")
      conflicting(conflicts, "The pool records disagree about heating");
    if (heating === "heated_pool_available" && (h.heated_state === "not_heated" || h.heated_pool === false))
      conflicting(conflicts, "Heating is recorded as both heated and not heated");
    const season = calculateSeasonStatus(pools);
    if (season.status === "conflicting")
      conflicting(conflicts, "The pool records disagree about the season");
    if (
      (season.status === "year_round_swimming_pool" ||
        season.status === "year_round_spa_pool" ||
        season.status === "mixed") &&
      h.year_round === false
    )
      conflicting(conflicts, "Year-round is recorded as both yes and no");
    // A generic plural name must not double-count a pool described elsewhere.
    const names = pools
      .map((p) => (p.pool_name ?? "").trim().toLowerCase())
      .filter((x) => x.length > 0);
    if (new Set(names).size !== names.length)
      conflicting(conflicts, "The same pool appears to be registered twice");
  }
  return conflicts;
}


function conflicting(list: string[], message: string) {
  if (!list.includes(message)) list.push(message);
}

/**
 * ONE status per hotel. Nothing else may derive or override it.
 */
export function calculateVerificationStatus(h: StatusHotel, pools?: StatusPool[]): HotelStatus {
  if (!hasConfirmedSwimmingPool(h)) {
    // No pool at all vs. "we have not looked properly yet".
    if (h.has_active_pool === false || h.pool_status === "no_pool") return "no_active_pool";
    return "research_pending";
  }
  if (detectConflicts(h, pools).length > 0) return "conflicting_data";
  if (h.qa_blocked === true) return "conflicting_data";
  if (h.verification_status === "research_pending") return "research_pending";
  const missing = missingCoreFacts(h);
  if (missing.length > 0) return "partially_verified";
  if (h.verification_status !== "verified") return "partially_verified";
  return "fully_verified";
}

/**
 * ONE Pool Score per hotel. Returns null whenever a number would be a guess.
 */
export function calculatePoolScore(h: StatusHotel, status?: HotelStatus): number | null {
  const state = status ?? calculateVerificationStatus(h);
  if (state !== "fully_verified") return null;
  if (h.ranking_eligible === false) return null;
  if (!hasApprovedSubscores(h)) return null;
  const computed = computePoolScore(h.pool_components ?? {});
  if (!Number.isFinite(computed) || computed <= 0) return null;
  return computed;
}

export type PublicationResult = {
  status: HotelStatus;
  score: number | null;
  errors: string[];
  warnings: string[];
  can_publish: boolean;
  can_index: boolean;
  can_rank: boolean;
  in_sitemap: boolean;
  missing: string[];
};

/** ONE gate for publishing, indexing, ranking and sitemap inclusion. */
export function validateHotelForPublication(
  h: StatusHotel,
  pools?: StatusPool[],
): PublicationResult {
  const status = calculateVerificationStatus(h, pools);
  const score = calculatePoolScore(h, status);
  const missing = missingCoreFacts(h);
  const errors: string[] = [...detectConflicts(h, pools)];
  const warnings: string[] = [];


  if (!hasConfirmedSwimmingPool(h) && h.ranking_eligible === true)
    errors.push("Hotel without a confirmed pool is still ranking eligible");
  if (status === "fully_verified" && missing.length > 0)
    errors.push(`Fully verified but missing: ${missing.join(", ")}`);
  if (status !== "fully_verified" && h.pool_score_0_10 != null && h.pool_score_0_10 > 0)
    errors.push("A numeric Pool Score is stored on a profile that is not fully verified");
  if (h.pool_components && hasIdenticalSubscores(h.pool_components))
    errors.push("All five sub-scores are identical default values");
  if (!h.official_url && !h.primary_source_url) errors.push("No official source");
  if (!h.last_verified_date) errors.push("No verification date");
  else if (h.last_verified_date > new Date().toISOString().slice(0, 10))
    errors.push("Verification date is in the future");
  // Nothing raw ever reaches a page: a stored placeholder is a blocking error.
  for (const [label, raw] of [
    ["Pool type", h.pool_type],
    ["Pool size", h.pool_size],
    ["Best time", h.best_time],
  ] as const) {
    if (raw != null && String(raw).trim() !== "" && publicValue(raw) === null)
      errors.push(`${label} contains a placeholder value`);
  }


  for (const m of missing) if (!errors.some((e) => e.includes(m))) warnings.push(`Missing ${m}`);

  const can_publish = errors.length === 0 || status === "no_active_pool";
  const can_index = status === "fully_verified" && errors.length === 0;
  const can_rank = can_index && hasConfirmedSwimmingPool(h) && h.ranking_eligible !== false;

  return {
    status,
    score,
    errors,
    warnings,
    can_publish,
    can_index,
    can_rank,
    in_sitemap: can_index,
    missing,
  };
}

/** The only visitor-facing status wording allowed on the site. */
export const STATUS_COPY: Record<HotelStatus, { label: string; sentence: string }> = {
  fully_verified: {
    label: "Fully verified",
    sentence:
      "Core pool details confirmed through the hotel's official material and at least one additional reliable source.",
  },
  partially_verified: {
    label: "Partially verified",
    sentence:
      "The swimming pool is confirmed, but some practical details are still being checked. No Pool Score is published yet.",
  },
  research_pending: {
    label: "Research pending",
    sentence: "We are still researching this property. No Pool Score is published yet.",
  },
  conflicting_data: {
    label: "Conflicting information",
    sentence:
      "Some available sources provide conflicting pool information. This profile is temporarily excluded from rankings.",
  },
  no_active_pool: {
    label: "No confirmed swimming pool",
    sentence:
      "This hotel does not currently have a confirmed swimming pool and is not included in Best Pool Hotels rankings.",
  },
};

export const SCORE_PENDING_LABEL = "Pool Score pending editorial review";

/** The summary heating state (from the pool records) mapped to the one status. */
export function heatingStatusFromState(state?: string | null): HeatingStatus {
  if (state === "heated") return "heated_pool_available";
  if (state === "not_heated") return "no_heated_pool";
  if (state === "conflicting") return "conflicting_heating_information";
  return "heating_not_confirmed";
}

/** Heating, derived from the pool records only — never guessed. */
export function heatingLabel(state?: string | null): string {
  return HEATING_COPY[heatingStatusFromState(state)];
}

export function seasonLabel(state?: string | null): string | null {
  if (state === "year_round") return "Open year-round";
  if (state === "seasonal") return "Seasonal opening";
  if (state === "conflicting") return "Season information conflicting";
  return "Season not confirmed";
}

/** Per-category counts written as one readable sentence. */
export function describePoolCounts(h: StatusHotel): string | null {
  const parts: string[] = [];
  const add = (count: number, one: string, many: string) => {
    if (count > 0) parts.push(`${count} ${count === 1 ? one : many}`);
  };
  const sharedTotal = n(h.shared_pool_count);
  const swimUp = Math.min(n(h.swim_up_count), sharedTotal);
  if (sharedTotal > 0) {
    // swim-up pools are part of the shared total, never an extra pool
    const suffix =
      swimUp > 0
        ? ` (${swimUp === sharedTotal ? (swimUp === 1 ? "a swim-up pool" : "all swim-up pools") : `${swimUp} of them swim-up`})`
        : "";
    parts.push(
      `${sharedTotal} ${sharedTotal === 1 ? "shared swimming pool" : "shared swimming pools"}${suffix}`,
    );
  }
  add(n(h.kids_pool_count), "children's pool", "children's pools");
  add(n(h.plunge_pool_count), "plunge pool", "plunge pools");
  add(n(h.spa_pool_count), "spa pool", "spa pools");
  add(n(h.jacuzzi_count), "jacuzzi", "jacuzzis");
  let text =
    parts.length > 1
      ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
      : (parts[0] ?? "");
  if (n(h.private_pool_count) > 0) {
    text = text
      ? `${text}, plus private pools in selected room categories`
      : "Private pools in selected room categories";
  }
  if (!text) return null;
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

const PLACEHOLDERS = new Set([
  "unknown",
  "n/a",
  "na",
  "none",
  "null",
  "undefined",
  "nan",
  "not discernible",
  "cannot be determined",
  "no information available",
  "best n/a",
  "best unknown",
  "-",
  "—",
]);

/** Nothing raw or empty reaches a page: returns null instead. */
export function publicValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return String(Math.round(value * 10) / 10);
  }
  const text = String(value).trim();
  if (!text) return null;
  if (PLACEHOLDERS.has(text.toLowerCase())) return null;
  if (/^best\s+(n\/a|unknown|null)$/i.test(text)) return null;
  return text;
}

/** 5.0990195… m → "approximately 5.1 m" */
export function formatMetres(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  return `approximately ${Math.round(value * 10) / 10} m`;
}
