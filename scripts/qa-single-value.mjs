/**
 * Proves that a hotel page renders exactly one heating verdict and exactly one
 * verification status, and that no legacy field can leak a second opinion.
 *
 *   bun scripts/qa-single-value.mjs [slug ...]
 */
const BASE = process.env.QA_BASE_URL ?? "http://localhost:8080";

const SLUGS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "los-angeles-hotel-june-west-la",
      "bangkok-the-siam",
      "barcelona-1898",
      "mallorca-hotel-can-bordoy-grand-house-and-garden",
      "sydney-park-hyatt-sydney",
    ];

/** Values the page marked as coming from the central calculation. */
function derived(html, attr) {
  const re = new RegExp(`data-${attr}="([a-z_]+)"`, "g");
  return [...html.matchAll(re)].map((m) => m[1]);
}

let failures = 0;
let checks = 0;

function check(name, ok, detail = "") {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

for (const slug of SLUGS) {
  const res = await fetch(`${BASE}/hotels/${slug}`);
  const html = (await res.text()).replace(/\0/g, "");
  // Ignore the dev tooling script, it is not part of the page.
  const page = html.replace(/<script[\s\S]*?<\/script>/g, "");

  check(`${slug}: page loads`, res.status === 200, `status ${res.status}`);

  const heat = derived(page, "heating");
  check(`${slug}: heating verdict is rendered`, heat.length > 0);
  check(
    `${slug}: only one heating verdict`,
    new Set(heat).size === 1,
    [...new Set(heat)].join(" vs "),
  );

  const status = derived(page, "status");
  check(`${slug}: verification status is rendered`, status.length > 0);
  check(
    `${slug}: only one verification status`,
    new Set(status).size === 1,
    [...new Set(status)].join(" vs "),
  );

  // The legacy free-text facts must never print a heating or season verdict.
  check(
    `${slug}: no legacy "Heated: Yes/No" row`,
    !/>Heated<\/[a-z]+>\s*<[^>]*>\s*(Yes|No)\b/i.test(page),
  );
  check(
    `${slug}: no legacy "Year-round: Yes/No" row`,
    !/>Year-round<\/[a-z]+>\s*<[^>]*>\s*(Yes|No)\b/i.test(page),
  );
  check(`${slug}: no placeholder text`, !/\b(N\/A|TBD|lorem)\b/i.test(page));
}

console.log(`\n${checks - failures}/${checks} checks passed`);
process.exit(failures ? 1 : 0);
