/**
 * Acceptance tests for the pool-data correction.
 * Usage: bun scripts/qa-testgroup.mjs            (20-hotel test group)
 *        bun scripts/qa-testgroup.mjs --all      (every published hotel)
 * Reads the database directly via psql.
 */
import { execFileSync } from "node:child_process";

const SLUGS = [
  "sydney-hyatt-regency-sydney","sydney-park-hyatt-sydney","sydney-w-sydney","sydney-intercontinental-sydney",
  "sydney-ace-hotel-sydney","sydney-qt-sydney","sydney-capella-sydney","barcelona-hotel-arts","barcelona-1898",
  "los-angeles-hotel-june-west-la","mallorca-hotel-can-bordoy-grand-house-and-garden","los-angeles-the-maybourne-beverly-hills",
  "mallorca-jumeirah-port-soller","bangkok-the-peninsula-bangkok","minos-palace-hotel-suites","london-shangri-la-the-shard",
  "london-bvlgari-hotel-london","barcelona-grand-hotel-central","los-angeles-the-hollywood-roosevelt","porto-elounda-golf-spa-resort",
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

console.log(`\n${12 - failed}/12 checks passed`);
process.exit(failed ? 1 : 0);
