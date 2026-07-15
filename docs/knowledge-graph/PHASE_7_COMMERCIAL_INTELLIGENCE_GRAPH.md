# Phase 7 — Commercial Intelligence Graph

## Objective

Connect product intelligence with commercial execution without exposing confidential pricing, customer data, margin, credentials, or contractual terms.

## Canonical entity types

- `CommercialAccount` — governed customer or prospect identity.
- `Supplier` — approved or evaluated manufacturing/supply source.
- `CommercialOffer` — versioned offer snapshot tied to products and supplier terms.
- `SelectionDecision` — documented product/supplier selection outcome.
- `InventoryPosition` — dated inventory signal, never a permanent product fact.
- `CommercialRisk` — identified supply, quality, financial, compliance, concentration, or delivery risk.
- `CommercialOpportunity` — governed opportunity linked to account, industry, products, and stage.
- `ApprovalRecord` — explicit authorization for selection, pricing, publication, or release.

## Authority model

1. PostgreSQL and approved operational systems are authoritative for current transactional state.
2. Canonical Markdown records define governed identities, policies, relationships, and reviewed decisions.
3. Generated artifacts summarize current state but are not authoritative.
4. Historical reports and emails may support evidence but do not override current operational records.

## Privacy and security boundary

Never commit or publish:

- customer contact details;
- confidential pricing or margin;
- payment terms;
- banking data;
- credentials or API keys;
- personal data;
- supplier confidential quotations;
- unredacted contracts.

Generated artifacts must use stable canonical IDs, status classes, ranges, risk levels, counts, and hashes rather than confidential values.

## Core relationships

```text
CommercialAccount -> operates_in -> Industry
CommercialOpportunity -> belongs_to_account -> CommercialAccount
CommercialOpportunity -> requests -> SKU/ProductFamily
CommercialOffer -> responds_to -> CommercialOpportunity
CommercialOffer -> supplied_by -> Supplier
SelectionDecision -> selects -> CommercialOffer/SKU/Supplier
SelectionDecision -> supported_by -> EvidenceRecord
InventoryPosition -> describes -> SKU
CommercialRisk -> affects -> Supplier/SKU/Offer/Opportunity
ApprovalRecord -> authorizes -> SelectionDecision/Offer/Opportunity
```

## Lifecycle controls

- Generated candidates begin as `under_review`.
- An offer is not selected merely because it is lowest cost.
- A selection requires a recorded decision basis.
- A customer opportunity cannot be marked won without an approval or operational confirmation.
- Inventory and lead time are dated observations, not timeless properties.
- Commercial recommendations must expose uncertainty and risk.

## Decision dimensions

Selection may consider:

- technical fit;
- evidence quality;
- landed cost band;
- lead-time band;
- MOQ;
- tooling or development requirement;
- supplier quality status;
- inventory availability;
- concentration risk;
- customer-specific constraints;
- regulatory or market restrictions.

## Generated output

```text
knowledge/generated/commercial-intelligence/
├── accounts/
├── suppliers/
├── opportunities/
├── offers/
├── decisions/
├── risks/
├── summary.json
└── unresolved.json
```

Generated output is ignored by Git and uploaded as a private workflow artifact when source data is available.

## Completion criteria

Phase 7 is structurally complete when:

1. canonical templates exist;
2. the validator recognizes all commercial entity types;
3. a redaction-safe builder produces governed candidates;
4. a validator detects missing links and unsafe fields;
5. GitHub Actions can generate and archive private artifacts;
6. canonical promotion requires evidence and explicit approval.
