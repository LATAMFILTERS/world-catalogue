---
id: source:catalogue-json
type: SourceDocument
name: Repository Catalogue JSON
status: approved
authority: canonical
owner: ELIMFILTERS Data Engineering
source:
  - frontend/catalogue.json
last_reviewed: 2026-07-14
evidence_status: validated
---

# Repository Catalogue JSON

Repository snapshot used by CI to generate reproducible Product Intelligence entities without connecting GitHub Actions to the production database.

## Authority boundary

The JSON snapshot is a transport and build source. PostgreSQL remains authoritative for live operational catalogue data. Differences between the snapshot and PostgreSQL must be reported and reconciled; they must not be silently treated as equivalent.

## Used by

- `scripts/export-product-intelligence.mjs`
- `.github/workflows/product-intelligence-graph.yml`
- generated SKU coverage reports
