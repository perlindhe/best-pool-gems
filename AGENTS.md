
- Pool Score criteria, weights, max points and version live only in src/lib/pool-score-config.ts; the per-hotel value comes only from public_hotels_view.pool_score_0_10 (approved evidence score) — why: one model, one value on every page.
- Per-fact source labels use src/lib/fact-citation.ts and require field-specific evidence; generic hotel sources never imply a fact was verified — why: attribution must not invent verification.
