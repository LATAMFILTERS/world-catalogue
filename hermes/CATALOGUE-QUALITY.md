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

## Manufacturer code identity and priority

`MANUFACTURER_IDENTITY` is an independent HERMES evidence axis. It records that a manufacturer publishes an exact code, using a matching official product record. It does not assert that the ELIMFILTERS SKU is equivalent to that manufacturer's product, set `canonical_source_*`, or approve applications or publication.

For heavy-duty rows awaiting explicit Donaldson absence authority, manufacturer priority remains `PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY` in the existing sanitation queue even when a Fleetguard code identity is verified. An OEM or Fleetguard reference in an alternate list alone remains `REVIEW_REQUIRED`; it is not product identity evidence. Neither state changes `donaldson_absence_verified`.

The HERMES quality report displays manufacturer identity and manufacturer priority separately. `technical_ready` and `fully_verified` continue to use the existing source, application, reference, dimension, image, and packaging gates; manufacturer code identity alone does not satisfy those gates.

### Runtime assessment — 2026-10-04

The explicit-Donaldson-authority lane contains 1,886 pending heavy-duty rows. Of these, 1,762 have exact current-code evidence from the Fleetguard official product sitemap and are recorded as verified Fleetguard code identities; 124 have no exact official product evidence and remain `REVIEW_REQUIRED`. All 1,886 remain pending Donaldson explicit absence authority. Independent PostgreSQL verification found zero `donaldson_absence_verified=true`, equivalence approvals, application approvals, or publication approvals from this identity assessment.

## Complete source dossier closure

A SOURCE backlog item is not closed by manufacturer identity alone.

HERMES must complete one defensible product dossier covering identity, technical specifications, dimensions, OEM codes, cross references, applications and provenance. Identity must be VERIFIED. Every other required axis must be VERIFIED or NOT_PUBLISHED_BY_SOURCE with the official sources checked recorded. Consistency must be VERIFIED with zero unresolved conflicts.

Only a complete dossier may create a review candidate for codigo_base, source_identity and the validated catalogue payload. Partial dossiers remain research work and cannot promote canonical catalogue truth.

## LD vs HD canonical source rule

MANN-FILTER and FRAM have different roles by duty.

For LIGHT_DUTY, a fully verified MANN-FILTER or FRAM dossier may provide the canonical `codigo_base`.

For HEAVY_DUTY, MANN-FILTER and FRAM part numbers are competitor references only. They must never become the canonical `codigo_base` or canonical source identity. HERMES records a complete MANN/FRAM HD dossier as CROSS_REFERENCES evidence and keeps SOURCE open while it searches for the actual HD canonical source.

The dossier must also classify `market_segment`. If official evidence shows that a proposed LD MANN/FRAM candidate is actually HEAVY_DUTY, that candidate is rejected as the LD base, preserved as competitor evidence, and the SKU is flagged for duty/source review.

### Runtime relationship review — 2026-10-04

The existing PostgreSQL evidence was re-read without rerunning the 212/213 migrations or reclassifying the lane. All 1,886 rows remain pending explicit Donaldson authority. The existing HERMES ledger still contains 1,762 verified exact Fleetguard code identities and 124 `REVIEW_REQUIRED` identities.

For the 1,762 verified identities, the current ledger has 0 verified application-evidence rows, 0 verified HERMES technical-specification rows, and 0 rows with dimensions marked verified. Although 189 SKUs have an `exact_part_reference` row and catalogue records contain OEM or competitor reference arrays, those facts do not establish ELIMFILTERS equivalence or a supported application. No relation met the evidence bar for a catalogue correction in this review; corrected rows: 0.

The remaining 124 identities still have no matching exact official Fleetguard product evidence. Current records contain competitor entries for 46 SKUs, OEM entries for 37, and exact-part-reference rows for 9; none has verified application, technical-specification, or dimension evidence in the HERMES ledger. These reference hints remain research leads, not verified identity or fitment.

This run completed 0 new source investigations and left all 124 identity cases pending. The existing HERMES selector cannot run against the current runtime because `hermes_catalogue_readiness`, `hermes_catalogue_backlog`, and `hermes_catalogue_dossier` are absent. Its existing live dossier researcher also requires `GROQ_API_KEY`, which is unavailable in this process. The only HERMES table present is the evidence ledger. I did not apply the global readiness sync: its current implementation upserts readiness/backlog for all active SKUs and resolves stale backlog rows globally, which could overwrite concurrent HERMES work. No candidate passed the evidence gates, so no gateway simulation or catalogue write was performed.
