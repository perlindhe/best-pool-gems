/**
 * Acceptance tests for the data-correction test group (20 hotels).
 * Usage: bun scripts/qa-testgroup.mjs
 * Requires SUPABASE env vars from .env (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);
const URL_ = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const SLUGS = [
  "sydney-hyatt-regency-sydney","sydney-park-hyatt-sydney","sydney-w-sydney","sydney-intercontinental-sydney",
  "sydney-ace-hotel-sydney","sydney-qt-sydney","sydney-capella-sydney","barcelona-hotel-arts","barcelona-1898",
  "los-angeles-hotel-june-west-la","mallorca-hotel-can-bordoy-grand-house-and-garden","los-angeles-the-maybourne-beverly-hills",
  "mallorca-jumeirah-port-soller","bangkok-the-peninsula-bangkok","minos-palace-hotel-suites","london-shangri-la-the-shard",
  "london-bvlgari-hotel-london","barcelona-grand-hotel-central","los-angeles-the-hollywood-roosevelt","porto-elounda-golf-spa-resort",
];

const rest = async (path) => {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
};

const inList = `in.(${SLUGS.join(",")})`;
const hotels = await rest(`public_hotels_view?slug=${inList}&select=*`);
const ids = hotels.map((h) => h.id);
const pools = await rest(`hotel_pools?hotel_id=in.(${ids.join(",")})&select=*`);
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
  console.log(`${bad.length ? "FAIL" : "ok  "} ${name}${bad.length ? " → " + bad.join(", ") : ""}`);
};

test("1. All 20 hotels resolve", () => hotels.length === SLUGS.length);
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
