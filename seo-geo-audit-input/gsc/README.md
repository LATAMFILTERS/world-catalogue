# Google Search Console Page Indexing intake

Place detailed Page Indexing example exports in this directory. English or Spanish filenames are accepted.

Preferred filenames:

- `crawled-not-indexed.csv` — Crawled / Rastreada: currently not indexed
- `discovered-not-indexed.csv` — Discovered / Descubierta: currently not indexed
- `404-not-found.csv` — Not found (404)
- `duplicate-without-canonical.csv` — Duplicate without user-selected canonical
- `blocked-by-robots.csv` — Blocked by robots.txt
- `redirect-error.csv` — Redirect error
- `server-error-5xx.csv` — Server error (5xx)

`gsc-indexing-intake.yml` runs automatically whenever a CSV here changes. It first audits current production, then compares every historical GSC example with current live state.

Crawled-not-indexed editorial/entity pages are eligible for governed HERMES semantic review only when technically clean. Discovered-not-indexed pages are treated as crawl/discovery work first. Technical exports are classified as current defect, intentional exclusion/retirement, or resolved historical signal.

No workflow step approves or publishes canonical content. Victor review remains mandatory.
