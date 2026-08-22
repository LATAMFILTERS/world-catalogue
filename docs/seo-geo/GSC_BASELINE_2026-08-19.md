# ELIMFILTERS Phase 5 — GSC Demand Baseline

Settled window: 2026-07-23 through 2026-08-19
Comparison window: 2026-06-25 through 2026-07-22
Property: `sc-domain:elimfilters.com`

## Property performance

| Metric | Current | Previous | Delta |
|---|---:|---:|---:|
| Clicks | 20 | 33 | -13 (-39.4%) |
| Impressions | 2,871 | 1,760 | +1,111 (+63.1%) |
| CTR | 0.697% | 1.875% | -1.178 percentage points |
| Average position | 66.29 | 68.65 | improved by 2.36 positions |

Interpretation: visibility expanded materially while click capture declined. Phase 5 therefore prioritizes query/page ownership, ranking opportunity, snippet/direct-answer fit and recrawl/consolidation evidence rather than adding generic content.

## Demand by major path

Selected GSC path groups for the current settled window:

| Path group | Clicks | Impressions | CTR | Avg. position |
|---|---:|---:|---:|---:|
| `/knowledge-center/glossary/*` | 0 | 1,572 | 0% | 73.17 |
| `/knowledge-center/*` root variants | 0 | 136 | 0% | 45.51 |
| `/knowledge-center/standards/*` | 0 | 134 | 0% | 48.57 |
| `/knowledge-center/engineering-reference/*` | 0 | 132 | 0% | 77.31 |
| `/knowledge-center/engineering/*` | 1 | 113 | 0.885% | 22.24 |
| `/knowledge-center/diagrams/*` | 0 | 91 | 0% | 62.76 |
| `/knowledge-center/comparisons/*` | 0 | 51 | 0% | 22.29 |

## First demand-driven authority batch

These canonical glossary topics combine meaningful GSC demand with measurable Authority Score deficits that were intentionally outside the strategic 143-page Phase 1–4 baseline.

| Canonical topic | GSC impressions* | Avg. position* | Authority Score before Phase 5 | Primary gap |
|---|---:|---:|---:|---|
| ISO Cleanliness Code | 399+ | ~73.7 | 83 | weak direct answer, no H2 structure, weak utility |
| Differential Pressure | 229 combined URL variants | ~87–89 | 83 | weak direct answer, shallow structure, weak utility |
| Depth Filtration | 173 combined URL variants | ~76–83 | 87 | title/H1 alignment, no H2 structure, weak utility |
| Kidney Loop | 127 | 59.17 | 93 | no H2 structure, weak utility |
| Soot | 102 | 75.39 | 92 | short title, shallow structure, partial utility |
| Bearing Clearance | 80 combined URL variants | ~73.9 | 93 | structured-depth and utility gap |
| Oil Condition Monitoring | 55 | 70.36 | 84 | weak direct answer, no H2 structure, partial utility |
| Bypass Filtration | 50 | 73.68 | 93 | no H2 structure, weak utility |

`*` GSC can retain historical slash/no-slash URL variants until recrawl/consolidation. Combined values are used for prioritization when the variants represent the same intended canonical topic.

## Consolidation / recrawl watchlist

The following historical or legacy-looking URLs still receive impressions in GSC and must be monitored after deployment rather than treated as new autonomous authority pages:

- `/systems/marine/` — 165 impressions, avg. position 64
- `/systems/coolant/` — 32 impressions, avg. position 84.56
- `/systems/oil/` — 22 impressions, avg. position 77.09
- `/products/fuel/` — 21 impressions, avg. position 93.38
- `/systems/fuel/` — 18 impressions, avg. position 88.83
- `/fleet-optimization/` — 12 impressions, avg. position 3.25
- `www` and HTTP homepage variants remain visible in GSC history

These are observation targets. GSC presence alone does not prove the URL is currently canonical, indexable or live; current canonical/index-hygiene validators remain the controlling technical evidence until deployment and recrawl are verified.

## Phase 5 decision rule

1. Preserve the frozen 100/100 strategic authority baseline.
2. Rank non-strategic opportunities by real demand and measurable authority deficit.
3. Correct the highest-demand canonical topic first.
4. Keep legacy/canonical consolidation as a separate recrawl-watch lane.
5. Rebuild and re-audit after each controlled batch.
6. Measure post-deploy GSC deltas only after Google has had time to recrawl the changed URLs.
