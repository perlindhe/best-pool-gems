# Data correction phase — 20-hotel test group

Scope: only the 20 named hotels are changed. No design, colour, typography or URL changes. The remaining hotels are left untouched until you approve the final report.

## What the data shows today (checked now)

- Hyatt Regency Sydney and Ace Hotel Sydney: no pool records, pool status unknown, yet the hotel row still states "heated: no", "outdoor: no", "year-round: no" — absence of information presented as facts.
- Capella Sydney: pool status unknown, partially verified, but a numeric score of 3.8 exists.
- Hotel Arts Barcelona: verified with a score of 2.1 — a missing-data score, not an editorial judgement.
- Hotel 1898: two pool records (rooftop + indoor) but the summary says one pool.
- Hotel Can Bordoy: two pool records, both heated, summary says heated status unclear.
- InterContinental Sydney: score 5.6 with an indoor pool marked rooftop — needs checking.
- Several hotels have a Google Maps contributor page as their "additional source", which is not a usable second source.

## Corrections to make

### 1. Fact-level confidence, not yes/no
Give each pool fact its own status: confirmed_official, confirmed_multiple_sources, provisional, unknown, conflicting. Missing information is stored as unknown, never as "no". Pages then read "Heating not confirmed" instead of "Not heated".

### 2. Pool categories and counts
Normalise each pool record to one category (shared swimming pool, private room pool, swim-up, spa pool, children's pool, plunge pool, jacuzzi, no pool). Generic marketing names that duplicate an existing pool are merged. Counts are stored per category and never presented as one mixed total; the summary sentence lists them separately.

### 3. Hotel-level facts derived from the pool records
Heating, season, indoor/outdoor, rooftop and infinity are all computed from the pool records, with the four wordings you specified for each (available / none / not confirmed / conflicting). Rooftop and infinity only appear when a documented pool has them.

### 4. Hotels without a confirmed pool
Hyatt Regency Sydney and Ace Hotel Sydney: marked as no active pool, removed from all rankings, filters and the sitemap, score and pool counts hidden, noindex/follow, and the profile shows the sentence "This hotel does not currently have a confirmed swimming pool and is therefore not included in Best Pool Hotels rankings."

### 5. Pool Score visibility
A number is shown only for a fully verified profile with five individually judged sub-scores, no default values, an editor sign-off and no blocking errors. Everything else reads "Pool Score pending editorial review". Placeholder scores on Capella Sydney, QT Sydney, Hotel Arts Barcelona and any other test hotel with a missing-data score are removed. Meta Rating stays visually and textually separate from Pool Score.

### 6. Known contradictions
Each of Hotel June West LA, Hotel 1898, Can Bordoy, The Maybourne Beverly Hills, Jumeirah Port Sóller, The Peninsula Bangkok, Park Hyatt Sydney and Hotel Arts Barcelona is researched against official material and corrected. Where a fact cannot be established from sources, it becomes "not confirmed" rather than a guess. Hotel Arts is then compared across its profile, the Barcelona page, the guide, the global ranking and the comparison pages to confirm identical figures.

### 7. Placeholder and duplicate clean-up
No "Unknown", "N/A", "null", "NaN", "Not discernible" or empty headings reach the page; natural fallbacks are used instead, or the field is hidden. Measurements round to one decimal (5.0990195… m becomes approximately 5.1 m). The Meta Rating explanation appears once per page, duplicate quotes and repeated sources are removed, and the comment counter uses correct singular/plural and never contradicts the quotes shown.

### 8. Status box
A single visitor-facing status box near the top of each profile with your three wordings, and no database terminology anywhere on the page.

### 9. Publication-blocking QA
The existing integrity system gains the blocking rules you listed (contradictions, unexplained counts, hidden-score violations, missing official source, future or missing verification date, placeholders, pool imagery on poolless hotels). Each finding reports hotel, name, error type, fields, URL, severity and suggested action.

### 10. Internal QA page
A new admin-only, non-indexed page listing the 20 test hotels with all the columns you specified and filters for blocking errors, partially verified, research pending, no pool, hidden score, missing official source and conflicting data.

### 11. Automated tests
The 12 acceptance tests are written as a script run against the live pages and data, and the results are included in the final report.

### 12. Final report
Per hotel: previous status, new status, changed pool records, corrected counts, heating, season, score shown or hidden, ranking eligibility, index status and remaining manual questions. Plus blocking errors before and after, tests passed and failed, the database and code changes made, pages set to noindex and pages removed from the sitemap. Work stops there and waits for your approval.

## Technical notes

- New per-fact status columns on `hotel_pools` (and the hotel summary), a `has_active_pool` flag, and editor sign-off fields for scores.
- `hotel_pool_summary` and `public_hotels_view` recalculated with per-category counts and the four-state heating/season logic; all pages read from that view, so a fact can only have one value site-wide.
- Score gating extended in `src/lib/scoring.ts` (default/identical sub-scores and unsigned scores are treated as not publishable).
- New blocking checks in `src/server/integrity.server.ts`; new QA route under the existing admin area, noindex.
- New test script under `scripts/` for the 12 acceptance tests.
- Changes are limited to the 20 test hotels by an explicit hotel filter in every data update.
