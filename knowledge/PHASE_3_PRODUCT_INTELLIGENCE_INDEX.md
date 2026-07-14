# Phase 3 — Product Intelligence Graph

## Status

Implemented.

## Scale model

The catalogue may contain thousands of ELIMFILTERS SKU records. They are not maintained manually and are not committed individually to `main`.

The exporter generates one review-stage knowledge entity per SKU from the repository catalogue snapshot:

```text
frontend/catalogue.json
        ↓
scripts/export-product-intelligence.mjs
        ↓
knowledge/generated/product-intelligence/skus/*.md
        ↓
scripts/validate-product-intelligence.mjs
        ↓
GitHub Actions artifact + coverage report
```

Generated records remain `under_review`. They are reproducible, excluded from Git, and retained as workflow artifacts for review.

## Controlled promotion

Only a reviewed SKU with resolved core mappings and an existing evidence entity may be promoted:

```text
node scripts/promote-product-intelligence-sku.mjs EL89009 --evidence=evidence:<id>
```

Promotion creates:

```text
knowledge/entities/skus/el89009.md
```

The canonical validator then checks:

- unique SKU identity;
- product-family relation;
- technology relation;
- protection-system relation;
- synchronization fields;
- lifecycle status;
- evidence relationship;
- existence of all canonical relation targets.

## Implemented components

- `docs/knowledge-graph/PHASE_3_PRODUCT_INTELLIGENCE_GRAPH.md`
- `knowledge/templates/sku.md`
- `knowledge/schemas/sku.schema.json`
- `knowledge/mappings/product-intelligence-field-map.yaml`
- `knowledge/entities/sources/catalogue-json.md`
- `scripts/export-product-intelligence.mjs`
- `scripts/validate-product-intelligence.mjs`
- `scripts/promote-product-intelligence-sku.mjs`
- `.github/workflows/product-intelligence-graph.yml`
- SKU-specific canonical validation in `scripts/validate-knowledge-v2.mjs`

## Output and coverage

Each run generates:

- one Markdown entity per source SKU;
- `coverage.json` with total rows, generated entities, skipped rows and unresolved mappings;
- a human-readable README;
- a GitHub Actions artifact retained for 14 days.

## Governance rules

- PostgreSQL remains the live operational source of truth.
- The repository JSON is a reproducible CI snapshot, not a replacement for PostgreSQL.
- OEM and competitor references are preserved as references, not automatically asserted as exact engineering equivalence.
- Equipment and vehicle applications remain under review unless a traceable source supports them.
- Pricing, customer data and confidential commercial records are excluded.
- Unknown mappings are reported; they are never guessed.

## Phase completion criteria

- [x] SKU identity model
- [x] SKU schema
- [x] Obsidian-compatible template
- [x] bulk exporter
- [x] generated-record validator
- [x] canonical-record validator
- [x] unresolved mapping report
- [x] controlled promotion process
- [x] GitHub Actions workflow
- [x] generated-output Git exclusion

Phase 3 is structurally complete. The next phase is Equipment Graph, which will normalize equipment, engine and vehicle identities and connect them to generated and canonical SKU records.
