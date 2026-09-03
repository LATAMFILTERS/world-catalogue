# Google Search Console Page Indexing intake

Place detailed example exports from Google Search Console in this directory using English or Spanish filenames.

Preferred filenames:

- `crawled-not-indexed.csv` — Crawled / Rastreada: actualmente sin indexar
- `discovered-not-indexed.csv` — Discovered / Descubierta: actualmente sin indexar
- `not-found-404.csv` — Not found (404) / No encontrada (404)
- `duplicate-without-canonical.csv` — Duplicate without user-selected canonical
- `blocked-by-robots.csv` — Blocked by robots.txt
- `redirect-error.csv` — Redirect error
- `server-error-5xx.csv` — Server error (5xx)

The dedicated `gsc-indexing-intake.yml` workflow audits current production before classifying these examples. It keeps technical defects separate from semantic HERMES review and never treats an exclusion count as proof that content should be expanded.

Historical 404 recovery is governed separately by `historical-404-recovery-registry.csv` and `scripts/seo-geo-audit/recover_historical_404s.py`. The recovery registry accepts only exact evidence-backed semantic successors. Generic redirects to the homepage or broad hubs are prohibited. Current seeded mappings are limited to legacy DURATECH and MARINECLEAN technology URLs whose canonical commercial destinations were confirmed in PR #578.

No step approves or publishes canonical Knowledge Center content automatically. Victor review remains mandatory.
