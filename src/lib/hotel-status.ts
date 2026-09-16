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
  "sydney-hyatt-regency-sydney",
  "sydney-park-hyatt-sydney",
  "sydney-w-sydney",
  "sydney-intercontinental-sydney",
  "sydney-ace-hotel-sydney",
  "sydney-qt-sydney",
  "sydney-capella-sydney",
  "barcelona-hotel-arts",
  "barcelona-1898",
  "los-angeles-hotel-june-west-la",
  "mallorca-hotel-can-bordoy-grand-house-and-garden",
  "los-angeles-the-maybourne-beverly-hills",
  "mallorca-jumeirah-port-soller",
  "bangkok-the-peninsula-bangkok",
  "minos-palace-hotel-suites",
  "london-shangri-la-the-shard",
  "london-bvlgari-hotel-london",
  "barcelona-grand-hotel-central",
  "los-angeles-the-hollywood-roosevelt",
  "porto-elounda-golf-spa-resort",
] as const;

export function isCorrectionPhase(slug?: string | null): boolean {
  return !!slug && (CORRECTION_PHASE_SLUGS as readonly string[]).includes(slug);
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
export function detectConflicts(h: StatusHotel): string[] {
  const conflicts: string[] = [];
  const shared = n(h.shared_pool_count) + n(h.swim_up_count);
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
  return conflicts;
}

function conflicting(list: string[], message: string) {
  if (!list.includes(message)) list.push(message);
}

/**
 * ONE status per hotel. Nothing else may derive or override it.
 */
export function calculateVerificationStatus(h: StatusHotel): HotelStatus {
  if (!hasConfirmedSwimmingPool(h)) {
    // No pool at all vs. "we have not looked properly yet".
    if (h.has_active_pool === false || h.pool_status === "no_pool") return "no_active_pool";
    return "research_pending";
  }
  if (detectConflicts(h).length > 0) return "conflicting_data";
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
export function validateHotelForPublication(h: StatusHotel): PublicationResult {
  const status = calculateVerificationStatus(h);
  const score = calculatePoolScore(h, status);
  const missing = missingCoreFacts(h);
  const errors: string[] = [...detectConflicts(h)];
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

/** Heating, derived from the pool records only — never guessed. */
export function heatingLabel(state?: string | null): string | null {
  if (state === "heated") return "Heated pool available";
  if (state === "not_heated") return "No heated pool";
  if (state === "conflicting") return "Heating information conflicting";
  return "Heating not confirmed";
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
  add(n(h.shared_pool_count), "shared swimming pool", "shared swimming pools");
  add(n(h.swim_up_count), "swim-up pool", "swim-up pools");
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
