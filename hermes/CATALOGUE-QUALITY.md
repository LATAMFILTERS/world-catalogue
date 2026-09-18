# HERMES Catalogue Quality Loop

## Purpose

This loop turns catalogue incompleteness into an evidence backlog without allowing HERMES to invent or silently overwrite catalogue truth.

`ACTIVE CATALOGUE → READINESS ASSESSMENT → EVIDENCE LEDGER → PRIORITIZED BACKLOG → HERMES OFFICIAL RESEARCH → CANDIDATE → HUMAN REVIEW → CONTROLLED PUBLICATION PLAN → BACKUP / APPLY / VERIFY / ROLLBACK`

## Evidence axes

- SOURCE_IDENTITY
- APPLICATIONS
- CROSS_REFERENCES
- DIMENSIONS / TECHNICAL_SPECS
- IMAGE
- PACKAGING

Presence and verification are separate. A populated field is not considered verified unless a governed evidence path exists.

## Readiness

`technical_ready` requires verified source identity, applications, governed exact references and dimensions.

`fully_verified` additionally requires verified image provenance and verified packaging.

No numeric quality score is used. Missing evidence remains explicit.

## Authority

`hermes:catalogue:quality` is read-only and writes reports/backlog artifacts.

`hermes:catalogue:quality:sync` may write only HERMES metadata tables when `HERMES_CATALOGUE_QUALITY_SYNC=true`.

It does not modify `elimfilters_catalog` product truth.

Any product-field change must continue through HERMES catalogue candidates, explicit approval, publication plan, controlled publisher, backup and rollback.

## Automatic dispatcher

`hermes:catalogue:work-orders` groups the next eligible action for every active SKU by gap, duty, technology, product family and authoritative organization when one is actually supported. It never promotes a manufacturer from a cross-reference alone.

`hermes:catalogue:research` consumes a bounded number of work-order items, uses HERMES live research, and records `VERIFIED`, `REVIEW_REQUIRED` or `UNRESOLVED` evidence. Research updates only HERMES evidence/backlog metadata. It never writes canonical catalogue truth.

The Lenovo weekly HERMES run and six-hour research retry refresh readiness, regenerate work orders and run the bounded catalogue research worker before the existing general HERMES research cycle.

## Source identity publication

`source_identity` is a controlled publication field covering `canonical_source_brand`, `canonical_source_code`, `canonical_source_url`, `canonical_source_status`, `canonical_verified_at` and `canonical_evidence`. Promotion requires the existing HERMES approval, snapshot, plan hash, transaction, backup, post-write verification and rollback controls.

## Complete source dossier closure

A SOURCE backlog item is not closed by manufacturer identity alone.

HERMES must complete one defensible product dossier covering identity, technical specifications, dimensions, OEM codes, cross references, applications and provenance. Identity must be VERIFIED. Every other required axis must be VERIFIED or NOT_PUBLISHED_BY_SOURCE with the official sources checked recorded. Consistency must be VERIFIED with zero unresolved conflicts.

Only a complete dossier may create a review candidate for codigo_base, source_identity and the validated catalogue payload. Partial dossiers remain research work and cannot promote canonical catalogue truth.
