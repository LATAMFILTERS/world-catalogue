# Phase 7 — Commercial Intelligence Graph Index

## Governing document

- `docs/knowledge-graph/PHASE_7_COMMERCIAL_INTELLIGENCE_GRAPH.md`

## Canonical templates

- `knowledge/templates/commercial-account.md`
- `knowledge/templates/supplier.md`
- `knowledge/templates/commercial-opportunity.md`
- `knowledge/templates/commercial-offer.md`
- `knowledge/templates/selection-decision.md`
- `knowledge/templates/inventory-position.md`
- `knowledge/templates/commercial-risk.md`
- `knowledge/templates/approval-record.md`

## Canonical entity folders

```text
knowledge/entities/
├── commercial-accounts/
├── suppliers/
├── commercial-opportunities/
├── commercial-offers/
├── selection-decisions/
├── inventory-positions/
├── commercial-risks/
└── approval-records/
```

Only reviewed, redacted, evidence-backed governance records belong in the canonical layer.

## Pipeline

- Builder: `scripts/build-commercial-intelligence.mjs`
- Generated validator: `scripts/validate-commercial-intelligence.mjs`
- Canonical validator: `scripts/validate-knowledge-v2.mjs`
- Workflow: `.github/workflows/commercial-intelligence-graph.yml`

## Generated artifact

```text
knowledge/generated/commercial-intelligence/
├── accounts/
├── suppliers/
├── opportunities/
├── offers/
├── inventory/
├── risks/
├── summary.json
└── unresolved.json
```

## Security rules

1. Exact prices, margin, payment terms and banking data stay in operational systems.
2. Personal contact data is excluded.
3. Generated candidates remain `under_review` and `authority: generated`.
4. A selected offer is not automatically an approved decision.
5. A won opportunity requires operational confirmation and approval.
6. Inventory and lead time are dated signals, not permanent product facts.
7. Canonical approvals require evidence and explicit authorization relationships.

## Phase status

Structural implementation complete. Population begins only from a sanitized commercial export or a controlled operational connector.
