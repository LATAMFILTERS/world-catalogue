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

It does not modify canonical product truth fields. A single lifecycle exception is allowed: after the governed research-attempt limit is exhausted without a defensible canonical identity, HERMES may set `catalog_active=false` through the catalog write gateway and close the backlog as resolved. The historical row is preserved for audit rather than deleted.

Any correction to identity, codes, specifications, applications or other product truth must continue through HERMES catalogue candidates, explicit approval, publication plan, controlled publisher, backup and rollback.

## Automatic dispatcher

`hermes:catalogue:work-orders` groups the next eligible action for every active SKU by gap, duty, technology, product family and authoritative organization when one is actually supported. It never promotes a manufacturer from a cross-reference alone. `BLOCKED` is not a terminal dispatcher state; unresolved active items remain eligible for research.

`hermes:catalogue:research` consumes a bounded number of work-order items, uses HERMES live web research, and records evidence. If a defensible canonical identity is found, normal review/publication governance continues. If repeated completed research cannot establish a defensible canonical identity, the SKU is discarded from the active catalogue by setting `catalog_active=false`. Transient network/provider failures do not count as evidence of absence and do not trigger discard.

The Lenovo weekly HERMES run and six-hour research retry refresh readiness, regenerate work orders and run the bounded catalogue research worker before the existing general HERMES research cycle.

## Source identity publication

`source_identity` is a controlled publication field covering `canonical_source_brand`, `canonical_source_code`, `canonical_source_url`, `canonical_source_status`, `canonical_verified_at` and `canonical_evidence`. Promotion requires the existing HERMES approval, snapshot, plan hash, transaction, backup, post-write verification and rollback controls.

## Complete source dossier closure

A SOURCE backlog item is not closed by manufacturer identity alone.

HERMES must complete one defensible product dossier covering identity, technical specifications, dimensions, OEM codes, cross references, applications and provenance. Identity must be VERIFIED. Every other required axis must be VERIFIED or NOT_PUBLISHED_BY_SOURCE with the official sources checked recorded. Consistency must be VERIFIED with zero unresolved conflicts.

Only a complete dossier may create a review candidate for codigo_base, source_identity and the validated catalogue payload. Partial dossiers remain research work and cannot promote canonical catalogue truth.

## LD vs HD canonical source rule

MANN-FILTER and FRAM have different roles by duty.

For LIGHT_DUTY, a fully verified MANN-FILTER or FRAM dossier may provide the canonical `codigo_base`.

For HEAVY_DUTY, MANN-FILTER and FRAM part numbers are competitor references only. They must never become the canonical `codigo_base` or canonical source identity. HERMES records a complete MANN/FRAM HD dossier as CROSS_REFERENCES evidence and keeps SOURCE open while it searches for the actual HD canonical source.

The dossier must also classify `market_segment`. If official evidence shows that a proposed LD MANN/FRAM candidate is actually HEAVY_DUTY, that candidate is rejected as the LD base, preserved as competitor evidence, and the SKU is flagged for duty/source review.
