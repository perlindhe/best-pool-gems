# Quality and SEO clean-up for BestPoolHotels.com

No new hotels or destinations during this work. No design, typography, colour or URL changes.

## What I found today (verified against the live data)

- 260 published hotels: 233 fully verified, 10 partially verified, 17 research pending, 0 QA-blocked.
- **34 hotels carry a Pool Score of 0.0** — including Hyatt Regency Sydney, which has no pool records at all and is still marked fully verified.
- **72 hotels have a pool count that disagrees with their own pool records** (Jumeirah Port Sóller: summary says 2, records list 4; The Peninsula Bangkok and Can Bordoy: summary 1, records 2).
- **48 hotels have no individual pool records at all**, including Hotel Arts Barcelona, whose profile still shows a 2.1 score while only partially verified.
- Individual pools are not a real part of the database today — they live inside a free-form blob attached to the score. That is the root cause of almost every contradiction above.
- Sitemap already limits itself to fully verified, published, non-blocked profiles; hotel pages already switch to noindex when unfinished. Both still let 0.0-score and pool-less hotels through.
- No leftover Voyager, NoMads or placeholder-name text anywhere in the project files.

## The work, in order

### 1. Give every pool its own record
Create a proper pool table: one row per physical pool or clearly defined pool category, with category (shared hotel pool, private room pool, swim-up, spa pool, children's pool, plunge pool, jacuzzi), indoor/outdoor, rooftop, infinity, heating status and heated months, season, size, saltwater, adults-only, children allowed, day pass, opening hours, view, sources and its own verification date. A jacuzzi never counts as a swimming pool. Migrate today's blob data into it without losing anything.

### 2. Calculate every summary from those records
Hotel-level pool counts and the Indoor / Outdoor / Rooftop / Infinity / Heated / Year-round / Adults-only / Family / Saltwater flags stop being typed in and get derived. Summaries read like "4 shared pools, 1 spa pool and private pools in selected room categories", never a single blended number. Heating shows "Heated pools available" when at least one pool is heated, and "Heating not confirmed" when unproven — never "Heated: Yes" beside "Verification pending".

### 3. Tighten verification
Three states only. Fully verified requires pool existence, count and category, indoor/outdoor, heating, season, access, one official source, one independent source and all five scoring criteria. Anything short of that drops to partially verified or research pending automatically, and the "verified" wording disappears from those pages.

### 4. Pool Score rules
Score shows only for fully verified hotels with all five editorial sub-scores (design 25%, view 25%, size 20%, access 15%, service 15%), and the total is re-checked against the weighting. Everything else reads "Pool Score pending editorial review" — no 0.0, no estimate, no "Unknown". Score version and change date are stored. One score per hotel, shared by profile, destination page, rankings, guides and comparisons.

### 5. Remove pool-less hotels from the ranking
Hotels with no pool, a closed pool, a construction closure or unknown pool status get marked not eligible: no score, no ranking position, removed from the sitemap, noindex/follow unless the page has its own editorial value, and the score slot reads "Not eligible — no active swimming pool confirmed". Hyatt Regency Sydney and Pier One Sydney Harbour are checked first.

### 6. Fix the named contradictions
Hotel Arts Barcelona, Hotel June West LA, Can Bordoy, The Maybourne Beverly Hills, Jumeirah Port Sóller, The Peninsula Bangkok, Hotel 1898 — each resolved against sources so every page agrees, then the same sweep applied to the other 72 mismatching hotels.

### 7. Publication-blocking QA
Extend the existing quality checks to block publishing on: count mismatch, heated/unheated conflict, indoor/outdoor conflict, season conflict, "verified" with pending fields, missing or mis-weighted sub-scores, differing scores across pages, pool-less hotels in the ranking, missing or future verification dates, missing official source, placeholder words in editorial text, and duplicate editorial text. All warnings listed in the admin panel.

### 8. Indexing, sitemap and domain
Only fully verified, published, uniquely written, source-backed profiles stay indexable. Research pending and thin partially verified profiles go noindex/follow and leave the sitemap, along with pool-less, unknown-status and 0.0 profiles, filter parameters, redirects, www addresses and unfinished comparison pages. Confirm the permanent redirect from all http and www addresses to the apex domain, and sweep project, database and metadata for Voyager-era leftovers.

### 9. Editorial and image clean-up
Strip "Unknown", "N/A", "Cannot be determined" and similar from published text, replacing them with a single neutral line: "This detail has not yet been confirmed and is not included in the hotel's score." Hide generic pool quotes. Show the Meta Rating explanation once per page. Add image source, owner, licence, permission status and source URL fields; images without documented rights are kept off indexable profiles.

### 10. Execution sequence
Data model → pool records and summaries → verification rules → score rules → QA checks → top 25 hotels → Barcelona → Crete → remaining destinations → sitemap, noindex and domain clean-up. A stage only starts when the previous one is free of blocking errors.

## Final report
Hotels reviewed; counts by verification state; noindexed profiles; hotels removed from the ranking; every contradiction corrected; hotels still needing manual checking; www redirect result; Voyager findings; sitemap URL count before and after; QA results. Delivered before anything new is published.

## Technical notes

- New `hotel_pools` table (hotel_id FK, public read, admin write, GRANTs), migrating `pool_scores.facts->'pools'` into rows; hotel-level boolean columns become derived values rather than independent inputs.
- Aggregation lives in `src/server/canonical-hotels.server.ts` so rankings, city hubs, guides, comparisons and profiles share one shape.
- `isIndexableHotel` gains ranking-eligibility and a complete-score requirement; `sitemap[.]xml.tsx` and the hotel route's robots logic follow it.
- New QA rules extend `src/server/integrity.server.ts` and write `qa_blocked` / `qa_blocked_reasons`.
- Image rights columns added to `hotel_photos`; photo selection filters on them for indexable pages.
