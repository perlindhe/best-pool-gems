# Roadmap

## Design
- [x] Preserve the previous dark design
- [x] Apply the Luminous Editorial design system site-wide
- [x] Restyle the shared header, footer, and homepage
- [x] Keep hotel data, verification, ranking, and publishing logic unchanged
- [x] Check homepage and hotel profile on desktop and mobile
- [x] Complete final automated QA

## Five test hotels — one status, one score
- [x] Map every place that shows heating and verification
- [x] Read heating and status from one shared calculated value
- [x] Deactivate the older conflicting fields on the pages
- [x] Automated tests proving one value is rendered (40/40)
- [x] Hotel June published as the technical test
- [x] The Siam checked and corrected from the hotel's own pool page
- [x] Hotel 1898, Can Bordoy, Park Hyatt Sydney checked; Can Bordoy rooftop
      heating corrected to "not confirmed" (only the garden pool is confirmed heated)

## Evidence-based Pool Score (ten test hotels)
- [x] Scoring engine, admin review page and public score panel
- [x] Three pool comments are enough instead of five
- [x] One gate: test hotels are kept out of rankings, destination lists,
      sitemap and search results until an editor approves their score

- [x] Automatic collection of guest comments for all ten test hotels
- [x] Automatic confirmation of pool size and heating from each hotel's own
      pages, with a literal quote and the source link (never estimated)
- [x] Automatic approval only when every factor is evidence-backed

- [x] The official-page search was silently blocked by a rate limit; it now
      waits and retries, and searches four phrasings (pool page, length, spa,
      fact sheet) instead of one

## Same score model for all hotels
- [x] The model now covers all 261 hotels, not only the ten test hotels
- [x] A hotel is scored on the facts that are confirmed ("based on 4 of 5
      factors"); guest comments and number of pools are the minimum
- [x] Approval happens automatically as soon as the evidence is in place
- [x] Hotels without a new score keep their current visibility
- [ ] Run the collection for all hotels — blocked: the workspace AI credit
      limit is reached, so guest comments cannot be classified right now

### Open (waiting on facts or a person)
- [ ] Pool length or area is still not stated anywhere official for eight of
      the ten hotels, so the size factor stays unconfirmed and no score is
      published. Needs a new official source or a manual measurement.
- [ ] Heating still unconfirmed for The Siam, Hotel Arts and Bvlgari London
- [ ] Hotel June and Can Bordoy have fewer than three pool comments
- [ ] Approval before the same model is rolled out to the remaining hotels
