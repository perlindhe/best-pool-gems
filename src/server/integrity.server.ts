import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { computePoolScore } from "@/lib/scoring";

/**
 * Data-integrity checks for the canonical hotel model.
 * Reports issues and records which hotels are blocked from being published as verified.
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
  editorial_status: string | null;
  primary_source_url: string | null;
  secondary_source_url: string | null;
  editorial_notes: string | null;
  pool_count: number | null;
  heated_pool: boolean | null;
  rooftop: boolean | null;
  qa_blocked: boolean | null;
  pool_type: string | null;

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
      "id, slug, name, city, city_slug, is_published, hotel_status, canonical_hotel_id, verification_status, official_url, website_url, affiliate_url, booking_url, address, previous_names, has_pool, indoor, outdoor, year_round, season, adults_only, children_allowed, family_friendly, last_verified_date, editorial_status, primary_source_url, secondary_source_url, editorial_notes, pool_count, pool_type, heated_pool, rooftop, qa_blocked",
    );
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Row[];
  const byId = new Map(rows.map((r) => [r.id, r]));

  const { data: scoreData, error: scoreError } = await supabaseAdmin
    .from("pool_scores")
    .select("hotel_id, pool_score_0_10, components, facts, best_time, editorial_notes, updated_at");
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
    // The Pool Score is the weighted score of the five 0–10 criteria.
    const expected = computePoolScore(comps as Record<string, number>);
    if (Math.abs(expected - Number(s.pool_score_0_10)) > 0.15) {
      push(
        "Score mismatch",
        "critical",
        r,
        `Stored Pool Score ${Number(s.pool_score_0_10).toFixed(1)} but the weighted criteria give ${expected.toFixed(1)}.`,
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
    // A record already merged into another (renamed) is not a duplicate any more.
    if (r.hotel_status === "renamed" && r.canonical_hotel_id) continue;
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

  // 7. Editorial QA: scores, sources, notes, quotes and images.
  const scoreByHotel = new Map(
    (scoreData ?? []).map((s) => [s.hotel_id as string, s as Record<string, unknown>]),
  );
  for (const r of rows) {
    const s = scoreByHotel.get(r.id);
    const comps = (s?.["components"] ?? {}) as Record<string, number | null>;
    const values = Object.values(comps).filter((v): v is number => typeof v === "number");
    const total = (s?.["pool_score_0_10"] as number | null) ?? null;

    if (values.length >= 5 && new Set(values).size === 1) {
      push("Identical sub-scores", "warning", r, `All criteria scored ${values[0]} — confirm this is a real judgement.`);
    }
    if (total != null && r.verification_status !== "verified") {
      push("Score without verification", "critical", r, "A final Pool Score exists but the profile is not verified.");
    }
    if (total != null && values.length < 5) {
      push("Incomplete score", "critical", r, `Only ${values.length} of 5 criteria assessed.`);
    }
    const bestTime = (s?.["best_time"] as string | null) ?? null;
    if (r.is_published && (!bestTime || /not specified/i.test(bestTime))) {
      push("Missing best time", "warning", r, "No usable \"best time to visit\" recorded.");
    }
    if (r.verification_status === "verified" && !(r.primary_source_url && r.secondary_source_url)) {
      push("Missing sources", "critical", r, "A verified profile needs both a primary and a secondary source URL.");
    }
    const note = (((s?.["editorial_notes"] as string | null) ?? r.editorial_notes) ?? "").trim();
    if (r.is_published && note.length > 0 && note.length < 120) {
      push("Thin editor's note", "warning", r, `Editor's note is only ${note.length} characters.`);
    }
    if (r.editorial_status === "published" && note.length === 0) {
      push("Missing editor's note", "warning", r, "Published without an editorial note.");
    }

    // (Score-vs-criteria consistency is checked once, in check 1 above.)


    // Free-text pool type must not contradict the structured pool count.
    const typeText = (r.pool_type ?? "").toLowerCase();
    const spelled: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
    const spelledHit = Object.keys(spelled).find((w) => new RegExp(`\\b${w}\\b[^.]{0,20}pool`).test(typeText));
    const statedCount = spelledHit ? spelled[spelledHit]! : null;
    if (statedCount != null && r.pool_count != null && statedCount !== r.pool_count) {
      push(
        "Contradiction",
        "critical",
        r,
        `Pool type text says ${statedCount} pool(s) but pool_count is ${r.pool_count}.`,
      );
    }
  }


  // Duplicate editor's notes across hotels.
  const noteBuckets = new Map<string, Row[]>();
  for (const r of rows) {
    const note = (r.editorial_notes ?? "").trim().toLowerCase();
    if (note.length < 40) continue;
    noteBuckets.set(note, [...(noteBuckets.get(note) ?? []), r]);
  }
  for (const [, group] of noteBuckets) {
    if (group.length > 1) {
      push(
        "Duplicate editor's note",
        "critical",
        group[0]!,
        `Identical editorial note on: ${group.map((g) => g.slug).join(", ")}.`,
      );
    }
  }

  // Quotes without a source link, and images without alt text or attribution.
  const [{ data: quoteRows }, { data: photoRows }] = await Promise.all([
    supabaseAdmin.from("pool_quotes").select("hotel_id, source, source_url"),
    supabaseAdmin.from("hotel_photos").select("hotel_id, source, alt_text, attribution, image_credit"),
  ]);
  for (const q of quoteRows ?? []) {
    if (q.source_url) continue;
    const r = byId.get(q.hotel_id as string);
    if (r) push("Quote without source link", "warning", r, `A ${q.source} quote has no clickable source.`);
  }
  const photoIssues = new Map<string, number>();
  for (const p of photoRows ?? []) {
    const missingAlt = !((p.alt_text as string | null) ?? "").trim();
    const missingCredit =
      !((p.attribution as string | null) ?? "").trim() && !((p.image_credit as string | null) ?? "").trim();
    if (!missingAlt && !missingCredit) continue;
    const key = p.hotel_id as string;
    photoIssues.set(key, (photoIssues.get(key) ?? 0) + 1);
  }
  for (const [hotelId, count] of photoIssues) {
    const r = byId.get(hotelId);
    if (r) push("Image metadata missing", "warning", r, `${count} photo(s) missing alt text or attribution.`);
  }

  // 8. Cross-page consistency: one hotel = one set of facts.
  const today = new Date().toISOString().slice(0, 10);
  const factRows = new Map(
    (scoreData ?? []).map((s) => [s.hotel_id as string, s as Record<string, unknown>]),
  );
  for (const r of rows) {
    if (r.last_verified_date && r.last_verified_date > today) {
      push("Verification date in the future", "critical", r, `last_verified_date is ${r.last_verified_date}.`);
    }
    if (typeof r.pool_count === "number" && r.pool_count < 1 && r.has_pool) {
      push("Contradiction", "critical", r, `Pool count is ${r.pool_count} but the hotel is listed as having a pool.`);
    }
    const facts = (factRows.get(r.id)?.["facts"] ?? null) as Record<string, unknown> | null;
    if (facts) {
      const compare: Array<[string, unknown, unknown]> = [
        ["heated", facts["is_heated"], r.heated_pool],
        ["rooftop", facts["is_rooftop"], r.rooftop],
        ["indoor", facts["has_indoor"], r.indoor],
        ["outdoor", facts["has_outdoor"], r.outdoor],
        ["pool count", facts["pool_count"], r.pool_count],
      ];
      for (const [label, a, b] of compare) {
        if (a == null || b == null) continue;
        if (a !== b) {
          push(
            "Fact conflict",
            "critical",
            r,
            `${label}: pool data says ${String(a)} but the hotel record says ${String(b)} — pages would disagree.`,
          );
        }
      }
    }
    if (r.verification_status === "verified") {
      const unsourced = [
        r.indoor == null && r.outdoor == null ? "indoor/outdoor" : null,
        r.heated_pool == null ? "heating" : null,
        !r.season && !r.year_round ? "season" : null,
      ].filter(Boolean);
      if (unsourced.length) {
        push("Missing pool facts", "warning", r, `Verified but ${unsourced.join(", ")} not recorded.`);
      }
    }
  }

  const order: Record<IntegritySeverity, number> = { critical: 0, warning: 1, info: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity] || a.check.localeCompare(b.check));

  // Persist the blocking state so publishing rules can rely on it.
  const blocked = new Set(issues.filter((i) => i.severity === "critical" && i.hotelId).map((i) => i.hotelId as string));
  const reasonsById = new Map<string, string[]>();
  for (const i of issues) {
    if (i.severity !== "critical" || !i.hotelId) continue;
    reasonsById.set(i.hotelId, [...(reasonsById.get(i.hotelId) ?? []), `${i.check}: ${i.detail}`]);
  }
  const stamp = new Date().toISOString();
  await Promise.all(
    rows.map(async (r) => {
      const shouldBlock = blocked.has(r.id);
      if (shouldBlock === Boolean(r.qa_blocked)) {
        await supabaseAdmin.from("hotels").update({ qa_checked_at: stamp }).eq("id", r.id);
        return;
      }
      await supabaseAdmin
        .from("hotels")
        .update({
          qa_blocked: shouldBlock,
          qa_blocked_reasons: shouldBlock ? (reasonsById.get(r.id) ?? []) : [],
          qa_checked_at: stamp,
        })
        .eq("id", r.id);
    }),
  );

  return {
    checkedHotels: rows.length,
    blockedHotels: blocked.size,
    counts: {
      critical: issues.filter((i) => i.severity === "critical").length,
      warning: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
    },
    issues,
  };
}
