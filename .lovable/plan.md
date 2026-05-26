# BestPoolHotels — Site Audit & Rebuild Plan

The site already has a real backend (Supabase `hotels` + `pool_scores` + `meta_scores` + `pool_quotes`) but it competes with a parallel hardcoded list in `src/data/hotels.ts`. That split is the root cause of the inconsistencies you flagged (Grand Hotel Central at 6.0 in one place, 9.2 in another). Several Barcelona guide pages also read from the hardcoded file instead of Supabase. The plan below fixes all 15 priorities in a sequence that minimizes rework.

## Phase 1 — Single source of truth (Priorities 1, 2, 3, 4, 9)

**Make Supabase the only hotel data source. Retire `src/data/hotels.ts` for Barcelona.**

1. Extend the `hotels` table with the fields from your spec that aren't there yet: `pool_setting`, `view_type`, `year_round`, `season`, `amenities` (jsonb), `vibe` (text — already exists), `official_url`, `affiliate_url`, `score_last_updated`, `image_credit`, `license_source`. Keep existing field names that already match (`pool_type`, `neighborhood`, `slug`, `heated_pool`, `guest_only`, `day_pass_available`, `price_from_eur`, `last_verified_date`, `sources`, `why_included`, `why_not_higher`, `tags`).

2. Update `src/server/scoring.ts` to the canonical 5-weight method:

   ```text
   pool_design_setting:       25%   (renamed from pool_first_feel)
   view_atmosphere:           25%   (merged from view + vibe)
   size_lounging_space:       20%   (renamed from lounging_space)
   access_seasonality:        15%   (new — replaces uniqueness)
   service_maintenance:       15%   (renamed from service)
   ```
   Each component is rated 0–10 (not 0–2), weighted, summed to 0–10. Update `PoolComponents` type, `computePoolScore()`, `ScoreBreakdown.tsx` labels + hints + weight column, and re-score every published hotel in `pool_scores` so DB and UI agree.

3. Lock Grand Hotel Central to 9.2 by writing real component values that sum to 9.2 — not by hardcoding. The hotel profile, the luxury guide ranking, the Also-Considered card, and `/about` will then all read the same number from `pool_scores` automatically.

4. Fix the duplicate problem: add a guard in `getBarcelonaGuideData()` that filters Also-Considered to exclude anything already in the Top 10. Remove Cotton House Hotel from the hardcoded also-considered list.

## Phase 2 — Rebuild Barcelona pages from the database (Priorities 5, 6, 7, 8)

5. **`/barcelona` becomes a true city hub** (replaces current pagination):
   - 6 themed mini-rankings (top 3 each): Best Overall, Best Rooftop, Best Beach + Pool, Best Heated / Year-Round, Best Quiet, Best Family
   - Neighborhood guide block (Eixample, Born, Gothic, Barceloneta, Diagonal Mar)
   - Comparison table: top 10 with Pool Score, Type, Setting, Best Time, Price From
   - Internal links to every Barcelona guide
   - Schema: `CollectionPage` + `BreadcrumbList`

6. **`/barcelona/rooftop-pool-hotels`** — query `tags @> ['rooftop']` only. New per-hotel block: floor/height, view, sunset quality, access, opening season, pool size, vibe, best time, quiet/party level. The cards already render most of this — we just wire it to the new DB fields.

7. **`/barcelona/pool-hotels-near-beach`** — query `tags @> ['beach']` or distance threshold. New fields: walking distance to beach, beach area, pool quality vs beach quality, family suitability, wind/sun exposure.

8. **`/barcelona/pool-season`** — rebuild as a practical seasonal guide, not a ranking. Month-by-month advice (Jan–Dec), heated-pool table, year-round table, April / May / October recommendations, pool-season-by-hotel table (sourced from DB `season` + `heated_pool` + `year_round`).

## Phase 3 — Trust, legal, schema (Priorities 10, 11, 12, 13, 14)

10. Search and remove every "Edit with lovable.dev" footer link. Call `publish_settings--set_badge_visibility(hide_badge: true)` to hide the published badge.

11. Replace `hej@poollist.se` with `hello@bestpoolhotels.com` everywhere (disclosure, about, footer, contact).

12. The existing `GuideMeta` component already handles trust blocks — extend it with: hotels checked count, hotels included count, verification method paragraph, affiliate disclosure line, "no paid placements" line. Wire into all guide pages.

13. **Structured data** (JSON-LD via `head().scripts`):
    - `/` — `WebSite` + `Organization`
    - `/barcelona` — `CollectionPage` + `BreadcrumbList`
    - guide pages — `Article` + `ItemList` (hotels) + `BreadcrumbList`; `FAQPage` only when the page renders a visible FAQ
    - `/hotels/$slug` — `Article` + `Hotel`/`LodgingBusiness` + `BreadcrumbList` + `ImageObject`

14. Image SEO: rename `cover_image_url` semantics to require descriptive alt text. Add `image_credit` + `license_source` columns to `hotel_photos`. Render credit under photos. Skip any photo without a license source.

## Phase 4 — Internal linking (Priority 15)

15. On every hotel profile, render a "Featured in" block listing every guide the hotel appears in. On every guide, every hotel name links to its profile (already true). Add a "Compared with" block on profiles linking to:
    - Grand Hotel Central vs The Barcelona EDITION
    - Grand Hotel Central vs Kimpton Vividora
    - Hotel Arts vs W Barcelona
    These are 3 new comparison routes — only build them with unique side-by-side data tables (pool, location, vibe, best for, price). No thin pages.

## Suggested order of execution

We can ship Phase 1 in one batch (migration + scoring rewrite + Grand Hotel Central fix), then iterate Phase 2 page by page so you can review each Barcelona guide as it lands. Phase 3 is one batch (legal + badge + schema). Phase 4 last because it depends on the new comparison content.

## Out of scope until you say otherwise

- New cities (only Barcelona is being rebuilt here).
- The 3 vs-comparison routes get built only after Phase 1–3 ship and we agree on the template.
- Automated photo licensing — for now, photos without a `license_source` simply don't render.

## Ready to start?

If this matches your intent, I'll begin with **Phase 1** (DB migration + scoring + Grand Hotel Central). It's the highest-leverage fix — everything else reads from it. Confirm and I'll write the migration first.
