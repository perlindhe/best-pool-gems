This is a large request touching schema, content, four guide pages, structured data, footer and more. Confirming the approach before I start so I don't spend hours building the wrong shape.

## 1. Hotel database extension (Barcelona)

Add the missing editorial fields to the `hotels` table (some already exist):

Already present: `name`, `city`, `neighborhood`, `website_url` (= officialHotelUrl), `booking_url` (= affiliateUrl).

New columns on `hotels`:
`pool_type`, `rooftop` (bool), `beachfront` (bool), `heated_pool` (bool), `guest_only` (bool), `day_pass_available` (bool), `pool_opening_hours`, `best_time_to_visit`, `view_description`, `pool_size`, `lounging_space`, `vibe`, `family_friendly` (bool), `party_level` (smallint 1–5), `price_from_eur` (int), `last_verified_date` (date), `sources` (jsonb — array of `{label, url}`), `why_included` (text), `why_not_higher` (text), `tags` (text[]).

`poolScore` and `metaRating` already live in `pool_scores.pool_score_0_10` and `meta_scores.meta_rating_0_100` — I'll keep those.

Public read RLS already exists on `hotels`; I'll only ALTER the table (no policy changes).

I will only **populate** these new fields for hotels that appear in the four Barcelona guides. The rest stay NULL and the UI hides empty fields.

## 2. Add Grand Hotel Central

Insert a new `hotels` row + `pool_scores` row using the data you provided. Slug `barcelona-grand-hotel-central`, pool_score 9.2, tags `["Rooftop","Quiet","Iconic","Guest-only"]`, rank_position chosen so it slots into the top 10.

## 3. Make each Barcelona guide unique

Today only `/barcelona/luxury-pool-hotels` exists as a hand-written route. I'll convert the existing dynamic `/$citySlug/$articleSlug` content into four distinct guide modules driven by data, with different filtering + framing:

- `/barcelona/luxury-pool-hotels` — overall top 10 (current page, rewritten in English, deduped from the others).
- `/barcelona/rooftop-pool-hotels` — filters `rooftop = true`; shows view, access, opening hours columns.
- `/barcelona/pool-hotels-near-beach` — filters `beachfront = true OR neighborhood IN (Barceloneta, Poblenou, Vila Olímpica)`; adds walking distance to beach.
- `/barcelona/pool-season` — editorial seasonal guide (month-by-month, heated-pool list from `heated_pool = true`). Not a ranking.

Each guide gets its own intro, criteria explanation, table columns, FAQ, and unique title/meta.

## 4. "Also considered" section

Per-guide list of 3–5 hotels that nearly made it, with a one-sentence reason. Stored in a small `guide_also_considered` config in `src/data/guideContent.ts` keyed by guide slug.

## 5. Pool Score method page

Rewrite the methodology section on `/about` (or a dedicated `/method` route — I'll add `/method` since `/about` is general). Five criteria with explicit weightings:

| Criterion | Weight |
|---|---|
| Pool design & setting | 30% |
| View & atmosphere | 20% |
| Size & lounging space | 15% |
| Water quality & maintenance | 15% |
| Access & opening hours | 20% |

Includes a worked example table and a section explaining Pool Score (editorial, ours) vs Meta Rating (aggregated Google + Tripadvisor + Booking, external). Hotel pages already hide Meta Rating when `meta_rating_0_100` is null — I'll verify and tighten.

## 6. Author box + last updated + sources + verification notes

New `GuideMeta` component rendered at the top of every guide:
- Author: "BestPoolHotels Editorial" with short bio
- Last updated date (from a per-guide constant)
- Sources list (links)
- Verification notes ("each hotel re-verified via official site on <date>")

Hotel detail pages already show `pool_verified_at`; I'll surface `last_verified_date` + sources from the new column on hotel pages too.

## 7. Remove "Edit with Lovable" badge

Call `publish_settings--set_badge_visibility` with `hide_badge: true` (requires Pro plan; if it fails I'll tell you).

## 8. English-only

Audit visible strings across routes/components. `/integritetspolicy` is Swedish — I'll redirect it to `/privacy` (new English page) and keep the Swedish route as a redirect to avoid broken links. Other Swedish copy gets translated.

## 9. Unique SEO title + meta description per page

Audit every route's `head()`. Each gets a unique title and description (≤60 / ≤160 chars).

## 10. JSON-LD

- `WebSite` — already in `__root.tsx`, keep.
- `BreadcrumbList` — add on guides + hotel pages.
- `ItemList` — add on each ranking guide (top 10).
- `Review` — add on hotel pages where we have an editorial pool score (treat our pool score as the review rating).
- `Hotel`/`LodgingBusiness` — already on hotel pages; verify and extend with `amenityFeature` for pool.

## 11. Affiliate link `rel`

Add a tiny `<AffiliateLink>` component that always renders `rel="sponsored nofollow noopener"` + `target="_blank"`. Replace `booking_url` link sites with it.

---

## Out of scope confirmation

- I will **not** fetch live data to populate the 20+ Barcelona hotels' new editorial fields automatically. I'll seed reasonable defaults for the ~15 hotels that appear in the four guides based on public knowledge (neighborhoods, rooftop yes/no, beachfront yes/no) and mark `last_verified_date = today`. You can refine in the admin afterwards. If you'd rather I leave most fields NULL and only fill what's strictly needed per guide, say so.
- Pool Score and Meta Rating numbers stay as currently stored. I won't re-score hotels.
- The "remove Lovable badge" requires a paid plan — if you're on free I'll surface the error.

Reply "go" to proceed, or tell me what to change (especially around how much seed data to write for Barcelona hotels).