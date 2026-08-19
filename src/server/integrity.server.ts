import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Data-integrity checks for the canonical hotel model.
 * Read-only: reports issues, never mutates.
 */

export type IntegritySeverity = "critical" | "warning" | "info";

export type IntegrityIssue = {
  check: string;
  severity: IntegritySeverity;
  hotelId: string | null;
  hotel: string;
  slug: string | null;
  detail: string;
};

type Row = {
  id: string;
  slug: string;
  name: string;
  city: string;
  city_slug: string;
  is_published: boolean;
  hotel_status: string;
  canonical_hotel_id: string | null;
  verification_status: string;
  official_url: string | null;
  website_url: string | null;
  affiliate_url: string | null;
  booking_url: string | null;
  address: string | null;
  previous_names: string[] | null;
  has_pool: boolean | null;
  indoor: boolean | null;
  outdoor: boolean | null;
  year_round: boolean | null;
  season: string | null;
  adults_only: boolean | null;
  children_allowed: boolean | null;
  family_friendly: boolean | null;
  last_verified_date: string | null;
};

const normalizeName = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(hotel|hôtel|the|resort|spa|barcelona|by|and|&)\b/g, "")
    .replace(/[^a-z0-9]/g, "");

const host = (url: string | null) => {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
};

export async function runIntegrityChecks(options: { checkLinks?: boolean } = {}) {
  const issues: IntegrityIssue[] = [];

  const { data, error } = await supabaseAdmin
    .from("hotels")
    .select(
      "id, slug, name, city, city_slug, is_published, hotel_status, canonical_hotel_id, verification_status, official_url, website_url, affiliate_url, booking_url, address, previous_names, has_pool, indoor, outdoor, year_round, season, adults_only, children_allowed, family_friendly, last_verified_date",
    );
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Row[];
  const byId = new Map(rows.map((r) => [r.id, r]));

  const { data: scoreData, error: scoreError } = await supabaseAdmin
    .from("pool_scores")
    .select("hotel_id, pool_score_0_10, components, updated_at");
  if (scoreError) throw new Error(scoreError.message);

  const push = (
    check: string,
    severity: IntegritySeverity,
    r: Row | null,
    detail: string,
  ) =>
    issues.push({
      check,
      severity,
      hotelId: r?.id ?? null,
      hotel: r?.name ?? "—",
      slug: r?.slug ?? null,
      detail,
    });

  // 1. Score consistency: stored total vs sum of components.
  for (const s of scoreData ?? []) {
    const r = byId.get(s.hotel_id as string);
    if (!r) continue;
    const comps = (s.components ?? {}) as Record<string, number | null>;
    const values = Object.values(comps).filter((v): v is number => typeof v === "number");
    if (!values.length || s.pool_score_0_10 == null) continue;
    const sum = values.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - Number(s.pool_score_0_10)) > 0.35) {
      push(
        "Score mismatch",
        "critical",
        r,
        `Stored Pool Score ${Number(s.pool_score_0_10).toFixed(1)} but components sum to ${sum.toFixed(1)}.`,
      );
    }
  }

  // Published hotels without any Pool Score.
  const scoredIds = new Set(
    (scoreData ?? []).filter((s) => s.pool_score_0_10 != null).map((s) => s.hotel_id as string),
  );
  for (const r of rows) {
    if (r.is_published && r.hotel_status === "active" && !scoredIds.has(r.id)) {
      push("Missing Pool Score", "warning", r, "Published and active but has no Pool Score.");
    }
  }

  // 2. Duplicate detection: fuzzy name within city, shared official host, shared previous name.
  const nameBuckets = new Map<string, Row[]>();
  const hostBuckets = new Map<string, Row[]>();
  for (const r of rows) {
    const nk = `${r.city_slug}:${normalizeName(r.name)}`;
    nameBuckets.set(nk, [...(nameBuckets.get(nk) ?? []), r]);
    const h = host(r.official_url ?? r.website_url);
    if (h) hostBuckets.set(h, [...(hostBuckets.get(h) ?? []), r]);
  }
  for (const [, group] of nameBuckets) {
    if (group.length > 1) {
      push(
        "Possible duplicate",
        "critical",
        group[0]!,
        `Same normalized name in ${group[0]!.city}: ${group.map((g) => g.slug).join(", ")}.`,
      );
    }
  }
  for (const [h, group] of hostBuckets) {
    const canonicalGroup = group.filter((g) => g.hotel_status !== "renamed");
    if (canonicalGroup.length > 1) {
      push(
        "Possible duplicate",
        "warning",
        canonicalGroup[0]!,
        `Shared official domain ${h}: ${canonicalGroup.map((g) => g.slug).join(", ")}.`,
      );
    }
  }
  for (const r of rows) {
    for (const prev of r.previous_names ?? []) {
      const match = rows.find((o) => o.id !== r.id && normalizeName(o.name) === normalizeName(prev));
      if (match) {
        push(
          "Rename not linked",
          "critical",
          match,
          `"${match.name}" looks like a previous name of ${r.name} but is a separate record.`,
        );
      }
    }
  }

  // 3. Closed / renamed hotels still visible.
  for (const r of rows) {
    if (!r.is_published) continue;
    if (r.hotel_status === "permanently_closed" || r.hotel_status === "temporarily_closed") {
      push("Closed but published", "critical", r, `Status is ${r.hotel_status} yet still published.`);
    }
    if (r.hotel_status === "renamed" && !r.canonical_hotel_id) {
      push("Rename without target", "critical", r, "Marked renamed but no canonical_hotel_id set.");
    }
    if (r.canonical_hotel_id && !byId.has(r.canonical_hotel_id)) {
      push("Broken canonical link", "critical", r, "canonical_hotel_id points at a missing record.");
    }
  }

  // 4. Missing trust data.
  for (const r of rows) {
    if (!r.is_published || r.hotel_status !== "active") continue;
    if (!r.official_url && !r.website_url) {
      push("Missing official URL", "warning", r, "No official or website URL on the record.");
    }
    if (r.verification_status === "research_pending") {
      push("Research pending", "info", r, "Published while pool facts are still unverified.");
    }
    if (!r.last_verified_date && r.verification_status !== "research_pending") {
      push("Missing verified date", "warning", r, "Marked verified but no last_verified_date.");
    }
    if (r.has_pool === false) {
      push("No pool", "critical", r, "Published on a pool site but has_pool is false.");
    }
  }

  // 5. Contradictory facts.
  for (const r of rows) {
    if (r.adults_only && r.children_allowed) {
      push("Contradiction", "critical", r, "Adults-only and children-allowed are both true.");
    }
    if (r.adults_only && r.family_friendly) {
      push("Contradiction", "critical", r, "Adults-only and family-friendly are both true.");
    }
    if (r.indoor === false && r.outdoor === false && r.has_pool) {
      push("Contradiction", "warning", r, "Has a pool but it is neither indoor nor outdoor.");
    }
    if (r.year_round && r.season && /(may|jun|apr|summer|season)/i.test(r.season) && !/year/i.test(r.season)) {
      push("Contradiction", "warning", r, `Year-round is true but season reads "${r.season}".`);
    }
  }

  // 6. Affiliate / booking link health (opt-in, HEAD requests).
  if (options.checkLinks) {
    const targets = rows
      .filter((r) => r.is_published && (r.affiliate_url || r.booking_url))
      .slice(0, 60);
    await Promise.all(
      targets.map(async (r) => {
        const url = (r.affiliate_url ?? r.booking_url)!;
        try {
          const res = await fetch(url, { method: "HEAD", redirect: "follow" });
          if (res.status >= 400) {
            push("Broken booking link", "critical", r, `${url} returned ${res.status}.`);
          }
        } catch {
          push("Broken booking link", "critical", r, `${url} could not be reached.`);
        }
      }),
    );
  }

  const order: Record<IntegritySeverity, number> = { critical: 0, warning: 1, info: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity] || a.check.localeCompare(b.check));

  return {
    checkedHotels: rows.length,
    counts: {
      critical: issues.filter((i) => i.severity === "critical").length,
      warning: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
    },
    issues,
  };
}
