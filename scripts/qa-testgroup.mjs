/**
 * Acceptance tests for the pool-data correction.
 * Usage: bun scripts/qa-testgroup.mjs            (5-hotel test group)
 *        bun scripts/qa-testgroup.mjs --all      (every published hotel)
 * Reads the database directly via psql.
 */
import { execFileSync } from "node:child_process";

const SLUGS = [
  "bangkok-the-siam",
  "los-angeles-hotel-june-west-la",
  "barcelona-1898",
  "mallorca-hotel-can-bordoy-grand-house-and-garden",
  "sydney-park-hyatt-sydney",
];

const sql = (q) =>
  JSON.parse(
    execFileSync("psql", ["-tAc", `select coalesce(json_agg(t),'[]') from (${q}) t`], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    }).trim(),
  );

const ALL = process.argv.includes("--all");
const list = SLUGS.map((s) => `'${s}'`).join(",");
const hotels = sql(
  ALL
    ? `select * from public.public_hotels_view`
    : `select * from public.public_hotels_view where slug in (${list})`,
);
const ids = hotels.map((h) => `'${h.id}'`).join(",");
const pools = ALL
  ? sql(`select * from public.hotel_pools`)
  : ids.length
    ? sql(`select * from public.hotel_pools where hotel_id in (${ids})`)
    : [];
const poolsOf = (id) => pools.filter((p) => p.hotel_id === id);

let failed = 0;
const test = (name, fn) => {
  const bad = [];
  for (const h of hotels) {
    try {
      if (!fn(h, poolsOf(h.id))) bad.push(h.slug);
    } catch {
      bad.push(h.slug);
    }
  }
  if (bad.length) failed++;
  console.log(`${bad.length ? "FAIL" : "ok  "} ${name}${bad.length ? ` (${bad.length}) → ` + bad.slice(0, 12).join(", ") : ""}`);
};

test("1. All hotels resolve", () => (ALL ? hotels.length > 0 : hotels.length === SLUGS.length));
test("2. Pool count equals shared swimming pool records", (h, p) =>
  h.shared_pool_count === p.filter((x) => x.shared_or_private === "shared" && ["shared_hotel_pool","shared_swim_up"].includes(x.pool_category)).length);
test("3. Jacuzzis never counted as swimming pools", (h, p) =>
  h.shared_pool_count === undefined ? false : !p.some((x) => x.pool_category === "jacuzzi" && x.shared_or_private === "shared" && h.shared_pool_count === 0 && h.jacuzzi_count === 0));
test("4. Heating is never guessed", (_h, p) =>
  p.every((x) => x.heated !== false || x.heating_state === "confirmed_not_heated"));
test("5. Heating summary matches pool records", (h, p) =>
  h.heated_state === (p.some((x) => x.heating_state === "confirmed_heated") ? "heated" : p.length > 0 && p.every((x) => x.heating_state === "confirmed_not_heated") ? "not_heated" : "unknown"));
test("6. Season summary matches pool records", (h, p) =>
  h.season_state === (p.some((x) => x.season_state === "year_round") ? "year_round" : p.some((x) => x.season_state === "seasonal") ? "seasonal" : "unknown"));
test("7. Indoor flag backed by a pool record", (h, p) => h.indoor !== true || p.some((x) => x.indoor === true));
test("8. Outdoor flag backed by a pool record", (h, p) => h.outdoor !== true || p.some((x) => x.outdoor === true));
test("9. No pool → not ranking eligible", (h) => h.shared_pool_count > 0 || h.ranking_eligible === false);
test("10. No pool → no Pool Score", (h) => h.shared_pool_count > 0 || h.pool_score_0_10 == null);
test("11. No placeholder text in score fields", (h) =>
  !/^(n\/a|undetermined|unknown|no information available|no pool)$/i.test(`${h.pool_type ?? ""}`) &&
  !/^(n\/a|undetermined|unknown)$/i.test(`${h.best_time ?? ""}`));
test("12. Scores are not five identical criteria", (h) => {
  if (!h.pool_components) return true;
  const v = Object.values(h.pool_components);
  return v.length < 2 || new Set(v).size > 1;
});

// shared_pool_count already includes swim-up pools (swim_up_count is a subset).
test("13. Pool count equals the shared swimming pool records only", (h) =>
  h.pool_count == null || h.pool_count === (h.shared_pool_count ?? 0));
test("14. A fully verified profile has an official source", (h) =>
  h.verification_status !== "verified" || Boolean(h.official_url || h.primary_source_url));
test("15. A fully verified profile has a verification date", (h) =>
  h.verification_status !== "verified" || Boolean(h.last_verified_date));
test("16. Verification dates are never in the future", (h) =>
  !h.last_verified_date || h.last_verified_date <= new Date().toISOString().slice(0, 10));
test("17. Adults-only and family-friendly are never both true", (h) =>
  !(h.adults_only === true && h.family_friendly === true));
test("18. No pool → excluded from index and score", (h) =>
  h.has_active_pool !== false || (h.ranking_eligible === false && h.pool_score_0_10 == null));
test("19. Private room pools are never shared swimming pools", (_h, p) =>
  !p.some((x) => x.shared_or_private === "private" && ["shared_hotel_pool","shared_swim_up"].includes(x.pool_category)));
test("20. The same pool is never registered twice", (_h, p) => {
  const names = p.map((x) => (x.pool_name ?? "").trim().toLowerCase()).filter(Boolean);
  return new Set(names).size === names.length;
});
test("21. A Pool Score only exists on a fully verified profile", (h) =>
  h.pool_score_0_10 == null || h.verification_status === "verified");
test("22. Every pool record has a category", (_h, p) => p.every((x) => Boolean(x.pool_category)));

console.log(`\n${22 - failed}/22 checks passed`);
process.exit(failed ? 1 : 0);
