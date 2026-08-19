# HERMES — Obsidian Governance Architecture

Status: APPROVED ARCHITECTURE
Version: 1.0
Owner: Victor Abreu
Scope: ELIMFILTERS Knowledge Vault, HERMES intake, human approval and controlled publication

## Purpose

This document formalizes how HERMES may collect, stage, review and publish external intelligence into the ELIMFILTERS knowledge ecosystem.

HERMES is an intelligence and knowledge-ingestion agent. It may discover and prepare updates, but it may not modify canonical knowledge or operational database records without explicit human approval.

## System boundaries

- Obsidian is the human-readable editorial and review layer.
- PostgreSQL and pgvector are the operational intelligence layer.
- The AI Engine is the reasoning and retrieval layer.
- HERMES is the discovery, classification and proposal layer.
- Victor Abreu is the final approval authority.

## Approved information domains

HERMES may monitor and prepare candidates related to:

1. New OEM vehicles, engines, machines and equipment.
2. New competitor products and technical developments.
3. New filtration technologies and test methods.
4. New filter media, fibers, membranes, resins, adhesives and other relevant materials.
5. Filter-paper manufacturers and other strategic suppliers.
6. Standards, patents, technical bulletins and regulatory changes.
7. Application changes, supersessions, new OEM references and documented product coverage gaps.

## Canonical vault extension

The existing canonical folders remain unchanged:

- `01-technologies/`
- `02-industries/`
- `03-systems/`
- `04-standards/`
- `05-contamination/`
- `06-components/`
- `07-problems/`
- `08-product-families/`
- `09-products/`
- `10-case-studies/`
- `11-articles/`

The following governed domains are added:

- `12-oems/` — manufacturers and brands.
- `13-equipment/` — vehicles, machines, engines and equipment models.
- `14-intelligence/` — approved market and competitor intelligence records.
- `15-filter-media/` — filter media, fibers, membranes and material technologies.
- `16-suppliers/` — media mills, material suppliers and strategic technology partners.
- `17-technology-watch/` — approved emerging-technology records not yet promoted into canonical technology entities.

The following workflow folders are added and are not canonical knowledge:

- `90-hermes-inbox/` — raw normalized candidates created by HERMES.
- `91-pending-review/` — candidates included in a review cycle and awaiting decision.
- `92-approved-updates/` — approved changes waiting for controlled publication.
- `93-rejected/` — rejected candidates retained with decision evidence.
- `94-sync-log/` — immutable publication and synchronization records.

## Required workflow

```text
External official and technical sources
                ↓
              HERMES
                ↓
         90-hermes-inbox
                ↓
      deduplication and validation
                ↓
        91-pending-review
                ↓
        weekly review email
                ↓
          Victor Abreu
       ↓        ↓         ↓
   APPROVE   REJECT   NEEDS_RESEARCH
       ↓        ↓         ↓
92-approved 93-rejected 91-pending-review
       ↓
controlled publication
       ↓
canonical Obsidian entity or approved intelligence record
       ↓
PostgreSQL / pgvector / Knowledge Graph
       ↓
94-sync-log
```

## Mandatory rule

No file created by HERMES in `90-hermes-inbox/` or `91-pending-review/` is authoritative.

No candidate may be synchronized into PostgreSQL, pgvector, the Knowledge Graph, `unified-data.ts`, Part Search or any production assistant unless all approval and evidence requirements are satisfied.

## Workflow statuses

Allowed workflow values:

- `CAPTURED`
- `NORMALIZED`
- `PENDING_REVIEW`
- `NEEDS_RESEARCH`
- `APPROVED`
- `REJECTED`
- `READY_TO_SYNC`
- `SYNCED`
- `SYNC_FAILED`
- `SUPERSEDED`

`workflow_status` is separate from the canonical entity `status` field.

## Candidate metadata contract

Every HERMES candidate must contain YAML frontmatter with these fields:

```yaml
---
entity_type: intelligence_candidate
entity_code: HERMES_<UNIQUE_KEY>
workflow_status: CAPTURED
candidate_type: equipment_update
source_type: official_manufacturer
source_url: ""
source_publisher: ""
source_title: ""
published_at: ""
captured_at: ""
last_verified_at: ""
confidence: 0.00
evidence_level: PRIMARY
claim_scope: SOURCE_REPORTED
affected_entities: []
proposed_action: ""
proposed_target_folder: ""
proposed_target_entity: ""
deduplication_key: ""
approval_required: true
approved_by: null
approved_at: null
rejection_reason: null
sync_status: NOT_READY
sync_target: []
source_hash: ""
---
```

## Candidate types

Allowed initial values for `candidate_type`:

- `equipment_update`
- `oem_update`
- `competitor_product_update`
- `competitor_technology_update`
- `filter_media_development`
- `supplier_development`
- `standard_update`
- `patent_update`
- `technical_bulletin`
- `application_update`
- `oem_reference_update`
- `coverage_gap`

## Evidence levels

- `PRIMARY` — official OEM, manufacturer, standards body, patent office or supplier documentation.
- `SECONDARY_VERIFIED` — reputable technical or industry source corroborated by primary evidence.
- `SECONDARY_UNVERIFIED` — useful lead that requires research and cannot be approved for publication.

## Claim handling

Every factual statement must be classified as one of:

- `CONFIRMED_FACT`
- `SOURCE_REPORTED`
- `HERMES_INFERENCE`
- `INTERNAL_RECOMMENDATION`

Competitor claims must never be converted into ELIMFILTERS claims without independent evidence and explicit approval.

## Approval contract

Approval requires:

- explicit decision by Victor Abreu;
- timestamp;
- source evidence retained;
- proposed target identified;
- old and new values recorded when updating an existing entity;
- no unresolved contradiction with canonical data;
- no unsupported performance, warranty, ROI, logistics or technical claim.

## Publication rules

After approval, a publisher process may:

1. Create or update the appropriate canonical Obsidian note.
2. Preserve the source and approval trail.
3. Validate YAML and wikilinks.
4. Generate a change set for PostgreSQL or other approved targets.
5. Execute only approved field-level changes.
6. Record success or failure in `94-sync-log/`.

The publisher must be idempotent and must not silently overwrite conflicting canonical values.

## Weekly review email

The HERMES weekly report must group candidates by:

- new equipment and OEM applications;
- competitor developments;
- filter-media and material developments;
- suppliers;
- standards and patents;
- database coverage gaps.

Each item must include:

- source and publication date;
- concise summary;
- evidence level and confidence;
- affected ELIMFILTERS entities;
- proposed database or knowledge change;
- recommended decision;
- direct actions: approve, reject or request additional research.

## Audit requirements

Every state transition must retain:

- candidate entity code;
- previous state;
- new state;
- actor;
- timestamp;
- reason;
- source hash;
- target entity or database record;
- publication result.

## Command Center representation

HERMES may be added to the Command Center only after this governance contract is represented in the implementation plan.

Its initial state must be `development`.

Its conceptual connections are:

```text
Industry / OEM / Competitor / Supplier / Standards Sources
                         ↓
                       HERMES
                         ↓
                  Obsidian Review Queue
                         ↓
                    Victor Approval
                         ↓
                  Knowledge Engine
                         ↓
              PostgreSQL / pgvector
```

HERMES must not be represented as operational until collection, weekly review, approval and controlled publication have been tested end to end.
