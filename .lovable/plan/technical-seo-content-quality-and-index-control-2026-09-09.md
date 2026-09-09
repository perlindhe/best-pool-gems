# Technical SEO, content quality and index control

## Step 1 — Inventory (already checked, no changes made)

| Question | What the project actually does today |
| --- | --- |
| Framework / routing | TanStack Start v1 (React 19, Vite), file routes in `src/routes/` |
| Title / description / canonical | Per-route `head()`; canonicals are absolute and self-referencing on `/`, `/rankings`, `/privacy`, `/editors`, hotel pages, guides and collections |
| Rendering | Server-rendered, plus prerendering for the home page, legal pages and the four Barcelona/city pages listed in `vite.config.ts`. Hotel names and links are in the HTML source |
| robots.txt | Static `public/robots.txt`, allows all, blocks `/admin` and `/api/`, points at the sitemap |
| sitemap.xml | Dynamic route `src/routes/sitemap[.]xml.tsx`, lists every hotel slug from the database (up to 2000) with no quality filter |
| http / www / trailing slash | Not handled in the app; only the canonical tag points at the apex domain |
| Filter / pagination URLs | `/rankings` already gets `noindex, follow` when filtered. City pages (`?page=`) and collection filters have no such rule |
| Old template content | Clean — no Voyager, NoMads or fake editor names anywhere in code or public files |
| 404 status | Hotel and city routes throw a real not-found; needs a status check |
| Structured data | Already broad: Organization, WebSite, Hotel, Article, ItemList, BreadcrumbList, FAQPage, Person |
| Verification data | `hotels` has `verification_status`, `verification_method`, `verification_sources`, `last_verified_date`, `fact_verification`, `hotel_status`, `is_published` |

Two findings decide the priorities:

1. **No hotel is verified.** 34 are `partially_verified`, 227 are `research_pending`. Yet all of them are in the sitemap and 250 of 261 show a Pool Score. This is the single biggest indexing-quality problem.
2. **Missing fields** for the editorial workflow: `editorial_status`, `verified_by`, `verification_notes`, `primary_source_url`, `secondary_source_url`.

Nothing gets deleted anywhere in this plan.

## Step 2 — Domain and URL consolidation

- Add redirect rules so http, www and http+www all land permanently on `https://bestpoolhotels.com`. In this hosting setup that is a domain-level setting, not app code; I will configure what is configurable and list what has to be done in the domain settings.
- Keep every canonical absolute, apex-domain, no trailing slash, and matching the sitemap.
- Audit internal links so none point at the www form.

## Step 3 — robots.txt and sitemap

- robots.txt: keep allowing content, keep blocking `/admin` and `/api/`, add `/compare/` internal-comparison paths and any search/preview paths, never block CSS/JS/images.
- Rewrite the sitemap to include only: home, editorial pages, published destination pages, published guides and collections, and **only hotels that are verified and published**. Drop unverified hotels, filter URLs and paginated pages. `lastmod` only where a real content timestamp exists.

Consequence to be explicit about: with zero verified hotels today, the sitemap will contain the site's editorial pages and guides but no hotel profiles until hotels are promoted. That is the intended, honest state.

## Step 4 — Publishing and index rules for hotels

Database migration on `hotels` (additive only):

- `editorial_status` — draft / review / published, default draft
- `verified_by`, `verification_notes`, `primary_source_url`, `secondary_source_url`
- backfill `editorial_status` from the existing `is_published` flag so nothing disappears

Robots rules applied in the hotel route's `head()`:

| State | Robots |
| --- | --- |
| verified + published | index, follow |
| partially_verified | noindex, follow |
| research_pending / unverified | noindex, follow |
| draft or review | noindex, nofollow, absent from sitemap |

Only verified + published hotels may enter ranking lists, carry a final Pool Score, use the word "verified" and appear in the sitemap. Partially verified pages stay visible to visitors, clearly labelled as preliminary.

## Step 5 — Pool Score discipline

- Remove fallback and default scores. A score renders only when all five criteria (design and setting, view and atmosphere, size and lounging, access and seasonality, service and maintenance) are individually judged with documented backing.
- Otherwise show "Not yet scored" and exclude the hotel from destination top lists.
- Show a short unique justification per criterion; no auto-generated text.
- Warn in the editor interface when several criteria carry identical values, overridable by the editor.

## Step 6 — Editorial QA checks

Extend the existing integrity checker (`src/server/integrity.server.ts`, admin panel) with the full flag list from the brief: identical sub-scores, score without verification, missing "best time", unsourced pool size/heating/season, facts contradicting body copy, year-round vs summer-only conflict, empty/duplicated editor's note, missing primary or secondary source, unsourced guest quotes, broken or unattributed images, empty alt text, undated ratings, high confidence on thin evidence. Critical flags block promotion to verified.

## Step 7 — Hotel page content template

Keep today's visual design. Ensure each indexable profile carries the full field list from the brief, with "Not confirmed" wherever a fact is missing — never a guess. Guest reviews summarised editorially; short quotes only, always with source and link.

## Step 8 — Trust and transparency pages

Improve About, Our editors, Pool Score methodology, Verification standards, Affiliate disclosure, Corrections policy and Contact. Every article and profile shows author, author link, publication date, real update date, last verification date, and what is first-hand versus desk research. "Personally visited", "tested" and "verified" only where documentation exists.

## Step 9 — Barcelona as the first complete cluster

Build out the Barcelona hub and its guides: luxury, rooftop, heated, indoor, beach, family, day passes, pool season opening dates. Consolidate rather than duplicate where two topics would produce the same list. Each guide: direct answer up top, qualifying hotels, comparison table, selection criteria, drawbacks, verification date, internal links both ways with the hub and the profiles.

## Step 10 — Metadata

Apply the title patterns from the brief across home, destination, hotel and guide pages, each unique, no repeated "best", no automatic year unless the page is genuinely refreshed yearly.

## Step 11 — Structured data

Keep the existing graph, and tighten it: `AggregateRating` on hotel pages is currently built from third-party rating data — I will only emit it where it matches visible, rule-compliant content, and never present third-party ratings as our own reviews.

## Step 12 — Performance and images

Check and improve LCP, CLS and INP: modern image formats, responsive sizes, lazy loading below the fold, explicit width/height, preload for the hero only, descriptive alt text, trimmed JavaScript, and server-rendered main content.

## Step 13 — Final report

Changes made, newly indexable URLs, noindexed URLs, redirects, verified/partially/unverified counts, sitemap URL and entry count, remaining QA warnings, structured-data test results, Lighthouse before/after, and the steps left for Search Console.

## Technical notes

- Files touched: `src/routes/sitemap[.]xml.tsx`, `public/robots.txt`, `src/routes/hotels.$slug.tsx`, `src/routes/$citySlug.index.tsx`, `src/routes/$citySlug.$articleSlug.tsx`, `src/routes/rankings.tsx`, `src/routes/about.tsx`, `src/routes/editors.*`, `src/routes/disclosure.tsx`, Barcelona guide routes and `src/data/collections.ts`, `src/components/ScoreBreakdown.tsx`, `PoolFactsTable.tsx`, `src/server/integrity.server.ts`, `src/server/canonical-hotels.server.ts`, `src/routes/admin.index.tsx`.
- Database: additive migration on `hotels` only. No rows removed.
- New pages needed: verification standards, corrections policy, contact (or sections on existing pages).

## Order of work

1. Steps 3 + 4 (index control) — biggest immediate win
2. Step 5 + 6 (score discipline and QA)
3. Step 2 (domain redirects)
4. Steps 7, 8, 10, 11 (page quality and metadata)
5. Step 9 (Barcelona cluster)
6. Step 12 + 13 (performance and report)
