# BestPoolHotels — Canonical Data, Discovery & Trust

Goal: one hotel → one canonical record → one Pool Score → used everywhere. No visual redesign; the current premium editorial look stays.

The backend already holds most of the model (`hotels`, `pool_scores`, `meta_scores`, `hotel_photos`, `pool_quotes`) and `public_hotels_view` is the read surface. The gaps are: missing canonical fields (status, previous names, verification state, adults-only, infinity/saltwater/indoor flags), `/rankings` having no filters and rendering every hotel at once, no duplicate/QA checks, and a homepage with no discovery layer.

## Phase 1 — Canonical record (priorities 1, 3, 9)

Migration on `public.hotels`:
- `previous_names text[]`, `hotel_status` enum (`active`, `renamed`, `temporarily_closed`, `permanently_closed`, `opening_soon`, `unverified`), `canonical_hotel_id uuid` (self-reference for renames)
- `verification_status` enum (`verified`, `partially_verified`, `research_pending`), `verification_sources jsonb`, `fact_verification jsonb` (per-fact state)
- Pool flags promoted out of the jsonb blob to real columns so they can be filtered in SQL: `pool_count int`, `indoor bool`, `outdoor bool`, `infinity bool`, `saltwater bool`, `adults_only bool`, `children_allowed bool`, `pool_view text`
- Backfill new columns from existing `pool_scores.facts` and `tags` so nothing is lost
- Rebuild `public_hotels_view` to expose all of the above and to exclude `permanently_closed` / non-canonical (renamed) rows

A single accessor module (`src/server/canonical-hotels.server.ts`) becomes the only place that reads hotel + score data. `rankings.functions.ts`, `hotel-detail.server.ts`, `compare.functions.ts`, city hub and guide loaders all call it. Any remaining hard-coded Pool Score in `src/data/hotels.ts` / `guideContent.ts` is deleted and replaced with a DB lookup by slug.

Renames: old slug rows keep `hotel_status = 'renamed'` + `canonical_hotel_id`, and `/hotels/$slug` issues a 301 redirect to the canonical slug.

## Phase 2 — Rankings with filters (priorities 2, 11)

Rewrite `/rankings`:
- Server-side query with filters read from and written to the URL search params (shareable): destination, min pool score, rooftop, infinity, heated, year-round, indoor, outdoor, adults-only, family-friendly, pool size, beachfront, view
- Server-side pagination (24 per page) instead of rendering 200+ cards
- Filters compose (`?city=gran-canaria&heated=1&outdoor=1`)
- Non-trivial filter combinations get `robots: noindex, follow`; the unfiltered page stays indexable
- Cards get reserved image dimensions, `loading="lazy"`, and a "Check availability" CTA

## Phase 3 — Discovery + hotel page (priorities 6, 7, 8)

Homepage: a discovery block directly under the hero — "Find the hotel with the pool you actually want" — with eight pool-type entry points (heated, rooftop, infinity, year-round, adults-only, beachfront, indoor, large) plus a destination + requirement selector that deep-links into the filtered `/rankings` URL.

Hotel page (`/hotels/$slug`) reordered:
- Above the fold: name, destination, Pool Score, Meta Rating, verification badge with date, hero pool image, 3–5 key facts, "Check availability" (primary) and "Official hotel website" (secondary)
- Below: why we like this pool, score breakdown, pool facts, best for, best time, pool season, guest quotes, gallery, verification sources, similar pools, comparisons
- Sticky booking bar on mobile: "Grand Hotel Central · Pool Score 9.2 — Check prices"
- Affiliate links stay visually separated from scores, always `rel="sponsored nofollow"`

Verification UI: a shared badge component rendering `✓ Pool details verified 12 Aug 2026` / `Partially verified` / `Research pending`, used on hotel pages, cards and guides. Nothing unverified is described as confirmed.

## Phase 4 — Routing, city hubs, programmatic SEO (priorities 4, 5, 10, 12)

- Audit every guide route so each renders its own SSR HTML, H1, intro, ranking, FAQ, canonical and OG tags — never the city hub fallback. Add a routing test that asserts each guide URL returns its own `<h1>` and title.
- City hubs become destination-specific: category blocks are generated from actual hotel counts per destination (a category renders only when enough hotels qualify), so Barcelona shows rooftop/beachfront/heated/quiet/family while Paris shows indoor/spa/lap/rooftop.
- A small set of high-value programmatic pages driven by one template with per-page editorial intro + FAQs: `/barcelona/heated-pool-hotels`, `/gran-canaria/heated-pools-winter`, `/mallorca/adults-only-pool-hotels`, `/london/indoor-pool-hotels`, `/paris/lap-pool-hotels`. Only pages with real editorial text and enough verified hotels ship; the rest stay unpublished.
- Structured data audit: Organization, BreadcrumbList, Article, Hotel, Review, AggregateRating — emitted only from visible, verified data.

## Phase 5 — QA integrity checks (priorities 13, 14)

An admin "Data integrity" panel plus a server function that flags:
- same hotel with different Pool Scores across sources
- duplicate hotels (fuzzy match on name, official URL, address, previous names)
- closed hotels still shown as active
- missing official URL or verification status
- contradictory facts (year-round = yes but seasonal-only season)
- guide ranking order inconsistent with canonical scores
- broken affiliate URLs (HEAD check)
- guide URLs rendering a hub instead of the guide

Editorial credibility: claims of personal visits are removed unless a visit record exists; the verification vocabulary is limited to the four states above. Editor profile pages are deferred until real contributors exist.

## Technical notes

- Filters live in TanStack Router `validateSearch` so state is in the URL and SSR-rendered.
- Pagination and filtering happen in Postgres, not client-side.
- New columns get GRANTs and the view keeps its existing anon read policy.
- No visual identity changes; new UI reuses existing tokens and components.

## Sequence

Phases run in order — 1 unblocks everything else, and 5 verifies the result. I'll report after each phase.
