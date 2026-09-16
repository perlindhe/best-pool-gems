# One status, one score — data-model correction for the 20 test hotels

Scope: only the 20 named hotels change. No design, colour, typography or URL changes. Automatic import, auto-verification, auto-scoring and bulk profile updates are paused for the duration.

## What the data actually shows right now (checked)

- Hyatt Regency Sydney, Ace Hotel Sydney, QT Sydney: no pool records, no active pool, pool count 0, status "partially verified". Nothing in the database says they have a pool — so any "Pools: 1" or verified badge on the page comes from the display layer, not the data.
- Capella Sydney: marked "no pool" and has no score row; the earlier 5.0 placeholders are already gone.
- Park Hyatt Sydney: marked fully verified with a score of 6.3 built on sub-scores 7.5/7.5/7.5/5/2.5.
- Hotel Arts Barcelona: score 5.4 built on four identical 5.0 sub-scores — a placeholder, not an editorial judgement. Two outdoor pools recorded, one flagged rooftop, heating and season unknown on both.
- Hotel 1898: seasonal rooftop pool plus a heated indoor spa pool — the records are right, the hotel-level wording is what must follow them.
- Hotel June West LA: its single pool is confirmed heated and year-round, so any "Heated: No" on the page is a display bug.
- Can Bordoy: two pools, both confirmed heated.
- The Maybourne: rooftop pool plus a mineral pool already classified as a spa pool.
- Jumeirah Port Sóller: infinity pool + children's pool (the old "Outdoor Pool 1/2" placeholders are gone). Peninsula Bangkok: a single outdoor pool (the duplicate is gone).

So the remaining problem is not mainly the stored rows — it is that several pages still compute status, pool counts, heating and scores their own way. That is what this phase removes.

## What will be built

### 1. One status function
A single function returns exactly one of: research pending, partially verified, fully verified, conflicting data, no active pool — derived from the hotel row, its pool records, its sources and its editorial score. Every surface reads it: profile badge, status box, rankings, destination pages, home page, guides, heating module, facts box, filters, sitemap, robots rules and structured data. Old parallel status fields and per-page helpers stop being used.

Rules as specified: no confirmed swimming pool → no active pool; pool confirmed but a mandatory core fact missing (category, shared/private, indoor/outdoor, heating, season, guest access, official source, additional source) → partially verified; fully verified only with every core fact, both sources, five manually judged sub-scores, editor sign-off and no blocking errors; two published values contradicting each other → conflicting data.

### 2. One score function
A single function returns a number only when the hotel is fully verified, ranking-eligible, error-free and has five approved editorial sub-scores — otherwise null. Weighting stays 25/25/20/15/15. Automatic, identical, missing-data-driven, Meta-Rating-driven and zero scores are removed. Null renders as "Pool Score pending editorial review" everywhere.

Immediate effects: Park Hyatt Sydney and Hotel Arts lose their current numbers until sub-scores are individually judged and signed off.

### 3. One publication gate
A single validation function returns errors, warnings and the three flags can_publish / can_index / can_rank. Everything on your blocking list becomes a hard error, and publishing, indexing, ranking and sitemap inclusion all follow this one result.

### 4. Pool records and counts
Each pool keeps its own category, shared/private, indoor/outdoor, rooftop, infinity, heating, season, access and source fields. Counts are produced per category and shown as a sentence ("2 shared swimming pools, 1 spa pool and private pools in selected room categories"). The mixed "Pools" number is removed. Jacuzzis and hot tubs are never swimming pools; generic plural names never add a pool that already exists.

### 5. Heating and season from the records
Hotel-level heating becomes available / none / not confirmed / conflicting, computed from the pool records only — never a manual hotel field, never "No" for missing information. Hotel 1898 reads as heated indoor pool year-round plus seasonal rooftop pool; June West LA and Can Bordoy follow their heated records.

### 6. Hyatt Regency Sydney
No active pool, no score, no pool count, no heating module, no pool photo, out of every ranking and pool filter, noindex/follow, out of the sitemap, and the page reads: "This hotel does not currently have a confirmed swimming pool and is not included in Best Pool Hotels rankings." The same treatment applies to Ace Hotel Sydney, QT Sydney and Capella Sydney while no pool is documented. "Why it's on the list" is removed from these profiles.

### 7. Hotel Arts, one master record
Profile, Barcelona destination page, Barcelona Top 10, global and filtered rankings, comparison pages and home-page cards all read the same record. Until its pools, rooftop question, indoor spa-versus-swimming question, heating and season are consistent, it is marked conflicting data: score hidden, out of rankings, not shown as fully verified.

### 8. Clean public text
Unknown, N/A, "best N/A", null, undefined, NaN, raw statuses and long decimals never reach a page. Empty fields are hidden, metres round to one decimal (5.0990195… → approximately 5.1 m), "best" is only used when a best time has been judged. Duplicate pool-fact blocks, repeated Meta Rating explanations, repeated quotes and sources are removed, and the comment counter can no longer contradict the quotes shown.

### 9. Status box
One visitor-facing box per profile with exactly your four wordings, and no database terminology.

### 10. Internal QA page
The existing admin QA page is extended to the full column set you listed (active pool, status, counts per category, heating, year-round, score status, ranking, index, sitemap, both sources, blocking errors, warnings) with filters for every status and error type. Not indexed.

### 11. The 18 automated tests
Written as a script run against the live data and pages, including the ranking test that fails if a hotel without an active pool appears in any pool ranking.

### 12. Home-page statistics
The single "207 verified" figure is replaced by separate counters — hotels tracked, fully verified, partially verified, research pending, ranking eligible — all counted through the central status function, with destination pages using the same definitions.

### 13. Delivery report
Before/after per test hotel (status, counts per category, heating, year-round, score or why hidden, ranking, index, sitemap, blocking errors, open manual questions), plus tests passed/failed, blocking errors before and after, the central functions created, the old status fields retired, and the profiles removed from rankings, set to noindex or dropped from the sitemap. Work then stops and waits for your approval before the remaining hotels are touched.

## Technical notes

- New `src/lib/hotel-status.ts`: `calculateVerificationStatus`, `calculatePoolScore`, `validateHotelForPublication`, plus per-category count and heating/season derivation — pure functions, shared by server functions and components.
- `hotel_pools` gains the missing per-pool source columns (`official_source_url`, `additional_source_url`, `source_status`, `access_status`); `hotels` gains editor sign-off for scores. `hotel_pool_summary` and `public_hotels_view` expose the per-category counts the function needs.
- `src/lib/scoring.ts` keeps the maths; gating moves behind the central score function so no component can bypass it.
- Call sites updated to the central functions: `hotels.$slug.tsx`, `rankings.tsx`, `$citySlug.index.tsx`, `index.tsx`, guide and collection pages, `HotelCard`, `HeatedPoolPanel`, `PoolFactsTable`, `PoolRecordsPanel`, `VerificationBadge`, `sitemap[.]xml.tsx`, `compare.$pair.tsx`.
- `src/server/integrity.server.ts` delegates to `validateHotelForPublication` so QA and publishing cannot disagree.
- Auto-score, auto-verify and import hooks are gated off behind an explicit flag for this phase.
- `scripts/qa-testgroup.mjs` extended from 12 to the 18 required tests; data changes stay filtered to the 20 slugs.
