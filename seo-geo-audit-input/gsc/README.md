# Google Search Console Page Indexing intake

Place the detailed example exports from Google Search Console in this directory using either English or Spanish filenames.

Preferred filenames:

- `crawled-not-indexed.csv` — **Crawled - currently not indexed / Rastreada: actualmente sin indexar**
- `discovered-not-indexed.csv` — **Discovered - currently not indexed / Descubierta: actualmente sin indexar**

The dedicated `gsc-indexing-intake.yml` workflow runs automatically when CSV files in this directory change. It:

1. audits current production URLs;
2. classifies each GSC example by technical vs semantic cause;
3. keeps utilities/calculators/navigation out of content padding;
4. builds governed HERMES knowledge-gap requests only from `REVIEW_FOR_EXPANSION` rows;
5. converts those requests into `HERMES_REAL_*` candidates;
6. runs HERMES research using the existing Groq configuration;
7. validates candidates and uploads all evidence as workflow artifacts.

No step in this workflow approves, publishes, or modifies canonical Knowledge Center content. Victor review remains mandatory.

The workflow auto-detects `.csv` files containing `crawled`/`rastreada` and `discovered`/`descubierta` in their names. If only one export is present, it processes that export and leaves the other state untouched.
