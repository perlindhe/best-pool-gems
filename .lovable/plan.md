# Data logic correction — five test hotels

Scope: The Siam, Hotel June West LA, Hotel 1898, Hotel Can Bordoy Grand House & Garden, Park Hyatt Sydney. No other hotel is changed. No design changes. Automatic import, verification, scoring and bulk updates stay paused.

## 1. Technical mapping (what I found in the current build)

**Central logic already exists** in `src/lib/hotel-status.ts`: `calculateVerificationStatus`, `calculatePoolScore`, `validateHotelForPublication`, status wording, heating/season labels, pool-count sentence. Profile page, cards, rankings, city pages, guides, comparisons, sitemap and the QA page already read from it.

**Why the profiles still break the rules — four real causes:**

1. **The strict rules only apply to 20 named hotels.** `isCorrectionPhase(slug)` gates the requirement for heating, season, guest access and editorial sign-off. The Siam is not in that list, so it is graded by the old lenient rules: heating unknown, season unknown, no sign-off, yet it is "Fully verified" with a visible Pool Score of 8.8.
2. **A second, older fact source still renders.** `pool_scores.facts` (`pool_facts`) feeds `PoolFactsTable` ("Pools: 1", "Heated: No", "Year-round: No") and `HeatedPoolPanel`, which also maps its own verification wording from the raw `verification_status` column. These can contradict the pool records.
3. **Free-standing status text.** The profile prints "Not yet verified — we are still checking this property" in the sources block whenever a date is missing, independent of the status box. That is the second, contradicting message on Park Hyatt Sydney.
4. **Pool categories are wrong in the data.** The Siam's two villa pools are stored as `plunge_pool` + `shared`, so they are neither counted as private pools nor excluded cleanly; Hotel 1898's spa pool is stored as an ordinary shared pool; several pool rows carry no source URL and `existence_state = provisional`.

Counts, heating, season, indoor/outdoor, `pool_count`, ranking eligibility, index/noindex and sitemap are all derived from `hotel_pools` → `hotel_pool_summary` → `public_hotels_view` (trigger-synced), so the derivation chain is sound; the inputs and the leftover display paths are not.

## 2. What will change

**Central logic**
- Replace the 20-slug gate with one rule set for every hotel, and switch the scope list to the five test hotels so only they are re-evaluated and rewritten now.
- Add `calculatePoolCounts(pools)`, `calculateHeatingStatus(pools)` and `calculateSeasonStatus(pools)` in `src/lib/hotel-status.ts` as the only producers of counts, heating and season — including the mixed cases ("Year-round spa pool; rooftop pool is seasonal") and the conflicting states.
- `calculateVerificationStatus` requires, for `fully_verified`: confirmed shared swimming pool, all seven core facts, official source, one extra source, verification date, named reviewer, five manually approved sub-scores, no blocking errors. Otherwise `partially_verified` / `research_pending` / `conflicting_data` / `no_active_pool`.
- `calculatePoolScore` returns null unless fully verified with approved distinct sub-scores; weighting stays 25/25/20/15/15.
- `validateHotelForPublication` gains the missing blocking checks (jacuzzi counted as pool, private pool counted as shared, summary contradicts pool records, placeholder values, heated yes+no, year-round yes+no).

**Display**
- Stop rendering `pool_facts` on the profile: remove `PoolFactsTable` and rewire `HeatedPoolPanel` to take heating, season, counts and status from the central functions instead of raw columns.
- Replace the "Not yet verified" line in the sources block with the single status sentence, so one message per page.
- Hide sub-scores, score breakdown and heating module whenever the score is null or there is no confirmed pool.

**Data corrections (five hotels only)**
- *The Siam*: Riverside Infinity Pool → shared swimming pool; both villa pools → private room pools. Result: 1 shared pool + 2 private pool categories, heating not confirmed, `partially_verified`, score hidden, out of ranking, noindex/follow, out of sitemap.
- *Hotel June West LA*: check the official page; heating confirmed → "Heated pool available", otherwise "Heating not confirmed". Never both. Unresolvable → `conflicting_data`, score hidden.
- *Hotel 1898*: rooftop → shared swimming pool (seasonal); indoor spa pool classified as spa or shared based on the official page, marked heated and year-round. Hotel level shows heated + year-round indoor/spa pool and a separate seasonal rooftop note.
- *Hotel Can Bordoy*: confirm Garden Pool and Rooftop Pool are two physical pools, classify each, derive heating from them, drop any manual "Heated: No".
- *Park Hyatt Sydney*: set to `partially_verified` until every core fact is verified; score null, sub-scores hidden, out of ranking, noindex/follow, out of sitemap.

**Gating**
- `canRank`, `canIndex` and sitemap inclusion are applied in the database queries that fetch hotels (ranking, sitemap, collections), not by hiding cards.

**QA**
- Admin page limited to a non-indexed view of the five hotels, showing raw pool rows next to the calculated results, both sources, blocking errors and warnings.
- Test script rewritten for the five hotels with the required checks (per-hotel and the shared ones: never verified+pending, no N/A/null/Unknown, no score without full verification, one status per page, every ranked hotel `canRank`, every sitemap page `canIndex`).

## 3. Delivery report

After implementation I report per hotel: previous and new status, old vs. new pool records, derived counts, heating, season, score or the reason it is hidden, canPublish/canIndex/canRank, noindex and sitemap state, open manual questions — plus removed status functions, unused fields, where the central functions are used, each test result, and blocking errors before/after. Nothing is rolled out to the remaining hotels until you approve.

## Technical notes

- Files: `src/lib/hotel-status.ts` (core), `src/routes/hotels.$slug.tsx`, `src/components/HeatedPoolPanel.tsx`, `PoolFactsTable.tsx` (removed from the profile), `PoolRecordsPanel.tsx`, `VerificationBadge.tsx`, `src/lib/rankings.functions.ts`, `collections.functions.ts`, `compare.functions.ts`, `city-hub.functions.ts`, `src/routes/sitemap[.]xml.tsx`, `src/lib/qa.functions.ts`, `src/routes/admin.qa.tsx`, `scripts/qa-testgroup.mjs`, `src/lib/automation-pause.ts`.
- Migration: constrain `hotel_pools.pool_category` usage so private/villa pools use `private_room_pool`, jacuzzis never enter swimming-pool counts, and add source/reviewer columns where missing; re-derive `hotel_pool_summary` for the five hotels only.
- Legacy `pool_scores.facts` stays in the database as history but is no longer read by any public page.
