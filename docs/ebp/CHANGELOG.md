# CHANGELOG — ELIMFILTERS Business Platform (EBP)

All notable changes to the EBP documentation and, later, implementation are
logged here in reverse chronological order. Every entry that changes a
phase's status must correspond to a row update in
`IMPLEMENTATION_MASTER_INDEX.md` in the same commit.

## 2026-07-13 — Phase 0: Foundation documentation created

- Created `docs/ebp/` project structure.
- Added `PROJECT_MANIFESTO.md` — vision, scope boundaries against the
  existing World Catalogue / catalog backend, core principles.
- Added `IMPLEMENTATION_MASTER_INDEX.md` — phase status tracker (Phases
  00-09).
- Added `CLAUDE_WORKFLOW.md` — operating rules for EBP development sessions
  (branch, commits, phase discipline, approval gate).
- Added `CLAUDE_START_PROMPT.md` — session bootstrap entry point.
- Added `BUSINESS_RULES.md` — domain rules for Passport, Manufacturer,
  Supplier, Validation, Selection, Cost, Pricing, Distributor, and Order
  modules; vocabulary disambiguation against existing catalog concepts
  (OEM vs. Manufacturer).
- Added `PLATFORM_ARCHITECTURE.md` — proposed architecture, grounded in an
  audit of the existing stack (Express/`server.js`, Postgres, `pg`,
  `ioredis`, static `ADMIN_KEY` auth); module map; data flow; open
  architectural questions.
- Added `ROADMAP.md` — phase dependency chain and gate definitions.
- Added `DECISIONS.md` — seeded with ADR-0001 through ADR-0004 covering
  database strategy, auth deferral, SKU identity reuse, and single-source-
  of-truth rules for cost/price.
- Added `phases/phase-00-foundation.md` through
  `phases/phase-09-order-management.md` — first-pass specs for all ten
  phases, establishing the dependency chain is coherent end-to-end. Phases
  01-09 remain `Spec Drafted`, not `Spec Approved` — no implementation
  authorized by this change.
- **No production code was written in this change.** Phase 0 scope only.

## 2026-07-13 — Phase 0 correction round: domain model fixed (Supplier removed, Manufacturer Offer chain adopted)

**Phase 0 was reviewed and not approved.** The project owner identified that
the original draft modeled a `Supplier` (raw-material/component vendor)
entity as a mandatory part of the validation chain
(`Passport × Manufacturer × Supplier`). This is not the agreed MVP
architecture. This entry corrects that error. No prior history was deleted;
the correction is recorded via ADR-0005 and ADR-0006 in `DECISIONS.md`, and
every file below documents its own correction notice inline.

- **`DECISIONS.md`** — added ADR-0005 (mandatory chain corrected to
  `Passport Version × Manufacturer × Manufacturer Offer`; raw-material
  Suppliers removed as an MVP dependency and deferred to a possible future
  phase) and ADR-0006 (`manufacturer_code` in the format `EFM-XXXX` is the
  permanent, confidential functional key for a Manufacturer; Distributor
  Portal and any data reaching it must never carry manufacturer identity,
  FOB, margin, or confidential engineering).
- **`PROJECT_MANIFESTO.md`** — added §1.1 defining the three MVP entities
  (ELIMFILTERS, Manufacturer, Distributor); removed Supplier from
  principles/success criteria; added the manufacturer-confidentiality
  principle.
- **`BUSINESS_RULES.md`** — full rewrite: vocabulary corrected
  (Manufacturer Request Batch, Manufacturer Product Offer, Engineering
  Compliance Validation, and an explicit "Supplier is not an MVP entity"
  entry replace the old Supplier-scoped rules); added Product Engineering
  Passport rules (§3, including packaging rules, §3.1); added Manufacturer
  Intake rules (§5, the `required_*`/`offered_*`/`compliance_status`/
  `manufacturer_note`/`evidence_attachment` pattern); Manufacturer
  Selection rules extended with FOB/packaging/MOQ/lead time/capacity/
  certifications/evidence/quality-history criteria and the
  primary/secondary/backup recommendation requirement; Cost Engine rules
  changed to FOB-based costing; Distributor Portal and Order Management
  rules extended with explicit confidentiality requirements.
- **`PLATFORM_ARCHITECTURE.md`** — module map and data-flow diagram
  redrawn around the corrected chain; API surface updated
  (`/api/ebp/intake/batches`, `/api/ebp/intake/offers`,
  `/api/ebp/compliance` replace the old Supplier/Validation-Engine
  surface); confidentiality-by-construction added as a non-functional
  requirement.
- **`ROADMAP.md`** — Phase 3 redefined as "Manufacturer Intake Portal
  (Factory Portal)," Phase 4 redefined as "Engineering Compliance
  Validation"; dependency table and milestone descriptions updated; raw-
  material Supplier management added to "Explicitly Out of Scope."
- **`IMPLEMENTATION_MASTER_INDEX.md`** — Phase 0 status set to "In Build
  (correction round)"; Phases 01-09 marked "(revised)" where corrected;
  added a note explaining Phase 03's file name is kept but its scope is
  corrected.
- **`CLAUDE_WORKFLOW.md`** — added §1.1, a binding rule against
  reintroducing a Supplier entity or a manufacturer-identity leak toward
  Distributor Portal.
- **`phases/phase-01-product-engineering-passport.md`** — full rewrite:
  Passport now explicitly models locked identification, the complete
  required-engineering field list (dimensions/tolerances, thread, media,
  composition, efficiency, particle size basis, Beta Ratio/micron rating,
  adhesive, temperature, collapse/burst pressure, gasket material, center
  tube, end caps, bypass valve fields, anti-drainback valve fields, test
  standards, confidential manufacturing notes), and required packaging
  (automotive vs. industrial, three separate quantity fields). The old
  BOM-category/Supplier-mapping concept is removed.
- **`phases/phase-02-manufacturer-registry.md`** — added `manufacturer_code`
  (`EFM-XXXX`) as the permanent confidential functional key, added
  `CONDITIONAL` status, clarified Manufacturer = finished-filter factory,
  not a raw-material vendor.
- **`phases/phase-03-supplier-portal.md`** — full rewrite as "Manufacturer
  Intake Portal (Factory Portal)": Manufacturer Request Batch and
  Manufacturer Product Offer entities replace the old Supplier Portal
  scope. File name kept unchanged per the correction notice inside the
  file.
- **`phases/phase-04-validation-engine.md`** — full rewrite as
  "Engineering Compliance Validation": operates on Passport Version ×
  Manufacturer × Manufacturer Offer; writes `compliance_status` back onto
  Offer engineering responses; no Supplier evaluation.
- **`phases/phase-05-manufacturer-selection.md`** — selection criteria
  extended to FOB/packaging/MOQ/lead time/capacity/certifications/
  evidence/quality history; added the mandatory primary/secondary/backup
  recommendation and ELIMFILTERS final-approval step.
- **`phases/phase-06-cost-engine.md`** — landed cost now computed from the
  approved Offer's FOB price plus freight/duties/overhead, replacing the
  old materials-cost-from-Supplier-data breakdown.
- **`phases/phase-07-pricing-engine.md`** — section-number cross-references
  corrected; added the `ebp_price_calculations_distributor_view`
  confidentiality projection and a corresponding risk note.
- **`phases/phase-08-distributor-portal.md`** — full rewrite: explicit,
  first-class confidentiality requirement (no manufacturer identity,
  `EFM-XXXX`, FOB, margin, or confidential engineering under any
  navigation path, export, or API response); exit criteria now include a
  data-shape confidentiality audit.
- **`phases/phase-09-order-management.md`** — section-number cross-
  references corrected; `manufacturer_id` replaced with
  `manufacturer_code`; added `ebp_orders_distributor_view` confidentiality
  projection and a corresponding risk note.
- **Consistency audit performed:** every cross-reference to
  `BUSINESS_RULES.md` section numbers was re-checked and corrected across
  all files (inserting the new PEP-rules section shifted every subsequent
  section number by one). Confirmed no remaining mandatory
  `Passport × Manufacturer × Supplier` chain anywhere in `docs/ebp/` —
  all surviving mentions of "Supplier" are explanatory/historical
  (describing the correction itself or the explicit MVP exclusion).
- **No production code was written in this change.** Phase 0 remains
  unapproved; Phases 01-09 remain `Spec Drafted`, not `Spec Approved`.
