/**
 * Routing QA: every guide and collection URL must render its own SSR <h1>
 * and its own <title> — never the city-hub fallback.
 *
 * Usage: bun scripts/qa-routes.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? "http://localhost:8080";

const { guides } = await import("../src/data/hotels.ts");
const { collections } = await import("../src/data/collections.ts");

const urls = [
  ...guides.map((g) => `/${g.slug}`),
  ...collections.map((c) => `/${c.citySlug}/${c.articleSlug}`),
];

const pick = (html, re) => (html.match(re)?.[1] ?? "").replace(/<[^>]+>/g, "").trim();

let failures = 0;
const seen = new Map();

for (const url of urls) {
  const res = await fetch(BASE + url);
  const html = await res.text();
  const title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const problems = [];
  if (res.status !== 200) problems.push(`status ${res.status}`);
  if (!h1) problems.push("no <h1>");
  if (!title) problems.push("no <title>");
  if (seen.has(h1) && h1) problems.push(`duplicate <h1> with ${seen.get(h1)}`);
  if (h1) seen.set(h1, url);
  if (problems.length) failures++;
  console.log(`${problems.length ? "FAIL" : "ok  "} ${url} | ${title} | ${h1}${problems.length ? " | " + problems.join(", ") : ""}`);
}

console.log(`\n${urls.length - failures}/${urls.length} routes passed`);
process.exit(failures ? 1 : 0);
