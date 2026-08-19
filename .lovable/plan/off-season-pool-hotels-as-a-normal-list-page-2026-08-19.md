# Off season pool hotels as a normal list page

Right now the off-season hotels are rendered as a big custom block directly on the region page, and the extra hotels are text-only (no hotel pages), because Crete has no records in the hotel database at all — every Crete hotel today comes from a hard-coded editorial file.

Target: the off-season hotels behave exactly like every other hotel on the site — each has its own hotel page, they are listed on a standard list page, and the region page only links to that list.

## What changes

1. **Crete gets real database records.** All 15 ranked Crete hotels plus the ~30 heated-outdoor-pool hotels are inserted into the hotel database with city, neighbourhood, pool type, heated/outdoor flags, season (heated months), Pool Score and a short "why included" note. Each one then automatically gets a normal hotel page at `/hotels/<hotel-slug>`, identical in design to all other hotel pages.

2. **A standard list page: `/crete/off-season-pool-hotels`.** Built with the existing collection template used by e.g. the Barcelona heated-pool list — hero, intro text, FAQ, and the usual ranked hotel list where every entry links to its hotel page. It is filtered on heated + outdoor, so it stays correct as data is verified.

3. **The region page only links to it.** The custom off-season block is removed from `/crete`. The list appears as one card in the existing "Guides" grid on the region hub (same look as the other guide/collection cards), plus a link from the Crete intro area.

4. **Works for other regions automatically.** Because the list is filter-driven, the same page can be switched on for Gran Canaria, Barcelona, Mallorca etc. later by adding an entry — no new code.

## Verification and honesty

New Crete records are marked "research pending" until the scoring pipeline confirms them, so hotel pages show unverified facts as unverified rather than as fact. Heated months are shown as hotel-stated. The existing scoring/verification batch can then be run over Crete to upgrade them — that step uses external APIs and is left as a separate, opt-in run so it does not add cost silently.

## Technical notes

- Migration inserting ~45 Crete rows into `public.hotels` (`city_slug = 'crete'`, `outdoor`, `heated_pool`, `season`, `pool_type`, `neighborhood`, `pool_score_0_10`, `why_included`, `verification_status = 'research_pending'`); slugs generated from the hotel name.
- New entry in `src/data/collections.ts`: `crete / off-season-pool-hotels`, `filter: { heated: true, outdoor: true }`, `minHotels: 5`, with intro copy and FAQs. Rendered by the existing `$citySlug.$articleSlug` route via `CollectionPage`.
- `listCollectionHotels` limit raised from 24 to 50 so the full list shows.
- Remove `src/components/OffSeasonPoolHotels.tsx`, `src/lib/off-season.functions.ts`, `src/data/off-season.ts` and the block plus loader call in `src/routes/$citySlug.index.tsx`.
- Sitemap already emits collection URLs, so the new page is picked up; page gets its own title/description/JSON-LD from `collectionMeta`.
- Hotel photos for the new records come from the existing photo job; not triggered as part of this change.
