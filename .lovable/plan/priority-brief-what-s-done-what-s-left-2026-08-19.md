# Priority brief: what's done, what's left

Audit of the 14-point brief against the current site.

## Already shipped (points 1-5, 9, 10, 12, 14)

- **Canonical data model** — every hotel lives in one record with status, verification status/date, Pool Score + 5 components, pool flags (indoor/outdoor/rooftop/infinity/heated/year-round/adults-only), official + affiliate URLs, previous names. All pages read from one canonical accessor; no hard-coded scores in articles.
- **Dynamic /rankings** — server-side pagination (24/page), destination + min score + 11 pool feature filters, filter state kept in the URL, filtered views set `noindex, follow`.
- **Database hygiene** — hotel states (active/renamed/closed/opening soon/unverified), duplicate detection by name/domain in the admin Integrity tab, renamed hotels excluded from rankings and 301-redirected to the canonical page.
- **Guide routing** — the bug where every guide rendered the Barcelona-style hub is fixed; all 11 guide/collection URLs render their own H1, intro, ranking and metadata (verified by an automated QA script).
- **City hubs** — destination-specific "At a glance" stats and feature shortlists generated from real hotel counts, hidden when too few hotels qualify.
- **Verification system** — three states (Verified / Partially verified / Research pending) with a visible verification date and a Sources section on hotel pages.
- **Programmatic SEO** — 7 collection pages (Barcelona heated, Gran Canaria heated-winter + adults-only, London/Paris indoor, Bangkok infinity, LA rooftop) with unique intros, FAQs and structured data; they auto-unpublish below a 5-hotel threshold.
- **Structured data** — Organization, BreadcrumbList, Article, ItemList, Hotel, Review, AggregateRating, FAQPage across the relevant page types.
- **QA** — admin Integrity tab flags score mismatches, duplicates, closed-but-published, missing official URL / verification date, contradictory pool facts, and optionally broken booking links; plus a route QA script.

## Remaining gaps

### 1. Booking conversion (point 8)
- Add a "Check availability" primary CTA to hotel cards, ranking rows, collection pages and comparison tables (currently only the hotel page has one).
- Add a sticky mobile booking bar on hotel pages: `Grand Hotel Central · Pool Score 9.2 — Check prices`.
- Keep the CTA visually separated from the Pool Score block, with the affiliate disclosure inline.

### 2. Homepage discovery completeness (point 6)
- Extend the quick-filter chips to the full eight pool types (add Indoor, Year-round, Large pools) and pair them with a destination selector so users can combine "Heated + Gran Canaria" straight from the homepage.

### 3. Performance and images (point 11)
- Explicit width/height (or aspect-ratio) on every hotel image to stop layout shift.
- Responsive `srcset`/`sizes` with WebP/AVIF via the image CDN, lazy loading everywhere except the LCP hero.

### 4. Editorial credibility (point 13)
- Add a fourth, explicit verification method label per hotel: Personally visited / Verified with hotel / Verified from multiple sources / Research pending — and never render "visited" unless the record says so.
- Add `/editors` and per-editor profile pages, linked from guide bylines.

### 5. Per-fact verification (point 9, remainder)
- Let individual pool facts carry their own verification state so a hotel can be "Partially verified" with the specific unconfirmed facts marked in the pool facts table.

### 6. More high-value collections (point 10, remainder)
- Add Mallorca adults-only and Paris lap-pool collections once each clears the 5-hotel threshold; skip any that don't.

## Technical notes

- New CTA and sticky bar are presentation components reading `booking_url` / `affiliate_url` from the canonical record; ranking order stays untouched.
- Verification method and per-fact verification need two small schema additions (`verification_method` on hotels, a `verified` flag per fact in the pool facts JSON) plus admin fields.
- Image work is a shared `<HotelImage>` component so sizing rules stay in one place.
