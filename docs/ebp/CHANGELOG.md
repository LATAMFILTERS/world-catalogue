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

## 2026-07-13 — Phase 0 second correction round: Offer versioning, packaging ownership, note-field split, Offer Approval entity

**Phase 0 was reviewed again and still not approved.** The project owner
identified three further modeling gaps left by the first correction round:
(1) Manufacturer Product Offer was modeled as exactly one record per
(Manufacturer, Passport Version), with no way to represent a re-quote or
correction; (2) Manufacturer-proposed and ELIMFILTERS-approved packaging
quantities were incorrectly described as Passport fields, when the
Passport must hold only ELIMFILTERS' own requirements; (3) a single
undifferentiated "confidential manufacturing notes" field conflated
Manufacturer-visible instructions with ELIMFILTERS-internal-only
information, and Engineering Compliance Validation was conflated with a
distinct commercial/operational approval decision. This entry corrects all
three. No prior history was deleted; the correction is recorded via
ADR-0007, ADR-0008, and ADR-0009 in `DECISIONS.md`.

- **`DECISIONS.md`** — added ADR-0007 (Manufacturer Product Offer
  versioning: many Offers per Passport Version × Manufacturer, an
  eight-state status lifecycle, exactly one active at a time, Validation
  and Selection bound to a specific `offer_id`/`offer_revision`);
  ADR-0008 (packaging data ownership split across the PEP,
  the Offer, and a new `ebp_manufacturer_offer_approvals` entity; Offer
  Approval is distinct from Engineering Compliance Validation); ADR-0009
  (the single "confidential manufacturing notes" field is replaced by
  `manufacturer_instruction_notes` and `internal_engineering_notes`, each
  behind its own role-specific projection). Also fixed a stale `§8-9` cross-
  reference in ADR-0004 and a stale `§12` reference in the file header,
  both shifted by the new §7 insertion below.
- **`BUSINESS_RULES.md`** — full rewrite to a 13-section structure: new
  §7 "Manufacturer Offer Approval Rules"; §3.1 rewritten to the
  PEP/Offer/Approval three-way packaging split; §3's note-field rule
  replaced with the two-field split and a role-specific-projection
  requirement; §5 (Manufacturer Intake) rewritten with the full Offer
  status lifecycle and the single-active-revision rule; §6 (Validation)
  rewritten to bind results to a specific `offer_id`/`offer_revision`;
  §8 (Selection, was §7) rewritten to gate on current-active + `VALID`-
  within-window Offers and to record exact `offer_id`/`offer_revision`
  per tier; §9-§12 (Cost/Pricing/Distributor/Order, renumbered) updated
  for the same traceability and note-field exclusions; §13 (Cross-Cutting)
  gained an explicit "no single-offer-per-manufacturer restriction" rule.
- **`PLATFORM_ARCHITECTURE.md`** — module map redrawn: Phase 03's box now
  shows versioned Offers and the new Offer Approval step; Phase 04's box
  is explicit about the Offer ID + Offer Revision binding; Phase 05's box
  notes the current-active + `VALID` filter and exact offer id/revision
  recording. Data Flow Summary points 3-5 rewritten to match. API surface
  gained `/api/ebp/intake/offer-approvals`. Non-functional requirements
  section extended to require role-specific Passport projections for
  every audience, not just Distributor Portal. Open questions gained the
  Offer-Approval-vs-Selection-ordering question.
- **`phases/phase-01-product-engineering-passport.md`** — Required
  Packaging (§3) rewritten to list only ELIMFILTERS-owned requirement
  fields (`manufacturer_recommended_quantity` and
  `elimfilters_approved_quantity` removed); the single note field
  replaced with `manufacturer_instruction_notes` and
  `internal_engineering_notes`; the prior open question on Manufacturer
  visibility of manufacturing notes marked resolved.
- **`phases/phase-03-supplier-portal.md`** — full rewrite: Manufacturer
  Product Offer is now versioned with the full status lifecycle,
  `offer_id`/`offer_revision`/`supersedes_offer_id`; Offer's packaging
  fields are explicitly its own proposal (`manufacturer_recommended_
  quantity` and related fields); new `ebp_manufacturer_offer_approvals`
  entity and its full field set documented; prior open question on
  Manufacturer visibility of confidential notes marked resolved; new open
  questions added on Request Batch deadlines, Offer-Approval-vs-Selection
  ordering, and Approval authorization.
- **`phases/phase-04-validation-engine.md`** — Validation's operating tuple
  made explicit as Passport Version × Manufacturer Code × Offer ID × Offer
  Revision; re-validation triggers extended to include a new Offer
  revision and Offer expiry, not just Passport/Manufacturer-status
  changes; `ebp_compliance_validations` gains an explicit `offer_revision`
  column; scope note added distinguishing Validation from the new Offer
  Approval entity; section references updated to §6/§13.
- **`phases/phase-05-manufacturer-selection.md`** — candidate filter
  rewritten to require the current active revision **and** a current
  `VALID` result within its effectiveness window; recommendation records
  gained explicit `offer_revision` fields alongside each tier's
  `offer_id`; new risk and open question added on whether Selection
  should also require Offer Approval before recommending, not just before
  fulfillment; section references updated to §8.
- **`phases/phase-06-cost-engine.md`** — `ebp_cost_calculations` gains an
  explicit `offer_revision` column alongside `offer_id`; section
  references updated to §9/§12.
- **`phases/phase-07-pricing-engine.md`** — section references updated
  again (Pricing Engine Rules §10, Distributor Portal Rules §11, Order
  Management Rules §12).
- **`phases/phase-08-distributor-portal.md`** — confidentiality list
  extended to explicitly name Offer/offer-revision identifiers and both
  Passport note fields; section references updated to §11/§12.
- **`phases/phase-09-order-management.md`** — order allocation now
  references the specific `offer_id`/`offer_revision` selected;
  distributor-visible projection explicitly excludes both Passport note
  fields; section references updated to §12; new open question added on
  whether fulfillment requires a recorded Offer Approval.
- **`PROJECT_MANIFESTO.md`** — Distributor confidentiality language and
  the traceability principle updated to name the two note fields and
  `offer_id`/`offer_revision` explicitly; section reference updated to
  §11.
- **`CLAUDE_WORKFLOW.md`** — §1.1 extended with two new binding
  prohibitions: no single-offer-per-manufacturer storage constraint, and
  no conflation of Validation with Offer Approval; stale §12 reference
  fixed to §13.
- **Consistency audit performed:** every cross-reference to
  `BUSINESS_RULES.md` section numbers was re-checked and corrected across
  all files (inserting the new §7 Offer Approval section shifted every
  subsequent section number by one again, on top of the first round's
  shift). Confirmed no remaining "exactly one Offer per Manufacturer and
  Passport" constraint, no `manufacturer_recommended_quantity` or
  `elimfilters_approved_quantity` on the Passport, and no live
  "confidential manufacturing notes" field — all surviving mentions of
  these are explanatory/historical (describing the correction itself).
- **No production code was written in this change.** Phase 0 remains
  unapproved; Phases 01-09 remain `Spec Drafted`, not `Spec Approved`.

## 2026-07-13 — Phase 0 final governance decisions (pre-approval)

The project owner confirmed the second correction round was satisfactory
and issued three final governance decisions before approving Phase 0,
recorded as ADR-0010, ADR-0011, and ADR-0012 in `DECISIONS.md`.

- **`DECISIONS.md`** — added ADR-0010 (an official Manufacturer Selection
  recommendation requires a five-part gate: current active revision,
  `VALID` within window, `APPROVED`, `QUALIFIED`/`CONDITIONAL`-satisfied,
  not expired/withdrawn/rejected/superseded; introduces
  `PRELIMINARY_COMPARISON` as a non-official, non-promotable analysis
  artifact); ADR-0011 (`ENGINEERING_APPROVER`, `COMMERCIAL_APPROVER`, and
  `ADMIN_OWNER` functional roles; an Offer reaches `APPROVED` only after
  `VALID` plus both an engineering and a commercial approval decision;
  `ADMIN_OWNER` can never override a technical `INVALID`); ADR-0012
  (Manufacturer Request Batch deadlines are set per batch via
  `response_due_at`, no global deadline; seven-state batch lifecycle;
  late Offers flagged `LATE_SUBMISSION`, never rejected or backdated).
- **`BUSINESS_RULES.md`** — §5 (Manufacturer Intake) gained the full
  Request Batch field list, seven-state lifecycle, and `late_submission`
  rule; the Offer status lifecycle is extended from eight to nine states
  with `APPROVED` added; §7 (Offer Approval) rewritten around the
  `ENGINEERING_APPROVER`/`COMMERCIAL_APPROVER` two-role model and the
  `APPROVED` derivation rule; §8 (Selection) rewritten around the
  five-part official-candidate gate and the `PRELIMINARY_COMPARISON`
  carve-out.
- **`phases/phase-03-supplier-portal.md`** — Request Batch entity gained
  the full field/status list; Offer entity gained `batch_id`,
  `late_submission`, and the `APPROVED` status value; Offer Approval
  entity rewritten to one row per role decision
  (`ENGINEERING_APPROVER`/`COMMERCIAL_APPROVER`) rather than one row per
  Offer; all three of this phase's open questions on deadlines,
  Approval-vs-Selection ordering, and approval authorization are marked
  resolved.
- **`phases/phase-05-manufacturer-selection.md`** — candidate gate
  extended to require `APPROVED` in addition to `VALID`; new
  `ebp_selection_preliminary_comparisons` entity added, structurally
  separate from `ebp_selection_recommendations`; `ebp_selection_approvals`
  attributed to the `ADMIN_OWNER` role explicitly; the open question on
  Selection/Approval ordering is marked resolved.
- **`phases/phase-09-order-management.md`** — the open question on
  whether fulfillment requires a recorded Offer Approval is marked
  resolved: allocation transitively requires `APPROVED` because it
  references an official Phase 5 Selection decision.
- **No production code was written in this change.** Phase 0 remains
  unapproved as of this entry; Phases 01-09 remain `Spec Drafted`.

## 2026-07-13 — Phase 0 approved and frozen — v1.0

The project owner formally approved Phase 0. Recorded as ADR-0013 in
`DECISIONS.md`.

- **`DECISIONS.md`** — added ADR-0013: Phase 0 — Foundation is
  `APPROVED`; the full `docs/ebp/` baseline (ADR-0001 through ADR-0013) is
  marked `APPROVED / FROZEN v1.0`; frozen means the domain model and
  governance rules cannot change without a new ADR that explicitly
  supersedes the relevant prior entry; Phase 1 — Product Engineering
  Passport is authorized to begin; no phase beyond Phase 1 is authorized.
- **`IMPLEMENTATION_MASTER_INDEX.md`** — Phase 00 row set to `APPROVED /
  FROZEN v1.0`, approved by Project Owner on 2026-07-13; Phase 01 row set
  to `In Build`; notes section rewritten to reflect the frozen baseline and
  that Phase 01 alone is authorized for implementation.
- **`phases/phase-00-foundation.md`** — status header rewritten to
  `APPROVED / FROZEN v1.0` with approval date, branch, and a pointer to
  this entry for the closing commit hash; Exit Criteria checked off.
- **Branch:** `claude/phase-0-audit-review-wanxa3`.
- **Closing commit:** `cd1a9a78` ("docs: ebp: Final governance decisions
  and approve/freeze Phase 0 v1.0").
- **No production code was written in this change.** Phase 1
  implementation begins in the next change, per the project owner's
  explicit authorization in this same approval.
