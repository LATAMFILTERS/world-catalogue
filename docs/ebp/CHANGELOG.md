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

## 2026-07-13 — Phase 1 (Product Engineering Passport) built

First EBP implementation change. Converts
`phases/phase-01-product-engineering-passport.md` from `Spec Drafted` to
an implementable spec and then implements it in full — real migrations,
real backend module, real tests, all verified against a real local
Postgres instance (not mocked). Phase 1 status moves to `Built`.

- **`docs/ebp/phases/phase-01-product-engineering-passport.md`** — full
  rewrite: real SQL schema (5 tables), the `is_pre_sku_draft`/
  `field_applicability` mechanisms, the create/revise/activate/retire
  lifecycle, the internal API surface, `requireAdmin` permissions,
  validation rules, three role-scoped DTOs, and a seeded (engineering-
  review-flagged) field applicability matrix. Both prior open questions
  (data-entry actor; applicability matrix mechanism) are resolved.
- **`migrations/ebp-phase1/001_schema.sql`** — `ebp_engineering_passports`
  (versioned per-revision, partial unique index enforcing one `ACTIVE`
  revision per SKU), `ebp_passport_engineering`, `ebp_passport_packaging`
  (ELIMFILTERS-requirement fields only, per ADR-0008),
  `ebp_field_applicability_matrix`, `ebp_passport_status_history`.
  Idempotent (`CREATE TABLE IF NOT EXISTS`), follows the
  `migrations/kg-phase1/` file convention.
- **`migrations/ebp-phase1/002_seed_applicability_matrix.sql`** — 40 seed
  rows (10 product_category/subtype pairs × 4 fields), explicitly flagged
  as needing ELIMFILTERS engineering review before production use.
- **`migrations/ebp-phase1/validate.sql`**, **`rollback.sql`** — both
  executed for real against a local Postgres 16 instance: `validate.sql`
  confirmed all 5 tables, 40 seed rows, the partial unique index, zero
  orphaned rows, and zero SKUs with more than one `ACTIVE` revision;
  `rollback.sql` confirmed all 5 EBP tables drop cleanly with
  `elimfilters_catalog` and `technologies` left untouched.
- **`ebp/phase1/validation.js`** — pure validation functions (locked
  identification, applicability resolution/merge, engineering
  completeness, packaging, automotive/industrial defaults).
- **`ebp/phase1/dto.js`** — `toInternalPassportDTO`,
  `toManufacturerPassportDTO` (excludes `internal_engineering_notes`),
  `toDistributorPassportDTO` (identification only) — ADR-0009's
  role-projection requirement, implemented and unit-tested.
- **`ebp/phase1/repository.js`** — database access layer.
- **`ebp/phase1/service.js`** — orchestration: `createPassport`,
  `createRevision`, `activatePassport` (atomic supersession via row
  locks), `retirePassport`.
- **`ebp/phase1/passports.routes.js`** — the eight-endpoint internal API
  surface (`create`, `get current`, `list revisions`, `get revision`,
  `create revision`, `activate`, `retire`, `applicability-matrix`).
- **`server.js`** — mounts `/api/ebp/passports` behind the existing
  `adminLimiter` + `requireAdmin` middleware, right after `pool` is
  constructed. No existing route, table, or behavior modified.
- **`tests/ebp-phase1/unit.test.js`**, **`integration.test.js`**,
  **`regression.test.js`** — 43 tests total using Node's built-in test
  runner (`node --test`, zero new npm dependencies): 19 unit tests
  (validation + DTO pure functions), 18 integration subtests (full HTTP
  lifecycle against a live server + live Postgres — HD and LD SKU
  creation, duplicate-revision conflict, unresolved-applicability
  rejection, explicit-override acceptance, non-existent-SKU rejection,
  atomic activation/supersession, retirement, revision history, the
  applicability-matrix endpoint), 6 regression subtests (DB-level
  guards independent of application code: the partial unique index, the
  `(elimfilters_code, engineering_revision)` uniqueness constraint, the
  applicability `CHECK` constraint, the target-quantity `CHECK`
  constraint, and cascade-delete with no orphaned rows). **All 43 passed**
  against a real local Postgres 16 instance. `package.json` gained a
  `test:ebp-phase1` script; no new dependency was added.
- **Manual live-server verification:** `server.js` was booted against the
  local test database with a real `ADMIN_KEY`; a real `POST
  /api/ebp/passports` request for SKU `EL80047` (OIL/SPIN_ON/HEAVY_DUTY)
  returned a `201` with the applicability matrix correctly resolving
  `bypass_valve_applicability`/`antidrainback_valve_applicability` to
  `REQUIRED`; an unauthenticated request to the same surface returned
  `403`.
- **Phase 2 was not started.** No Manufacturer Registry table, route, or
  spec change was made in this session.

## 2026-07-13 — Phase 1 post-implementation audit correction

The project owner reviewed the "Built" Phase 1 delivery and found three
issues before approving it: a miscounted API surface, actor terminology
that overstated identity strength, and an applicability matrix that was
seeded but not actually gated. All three are fixed in this change.

- **Endpoint count corrected (10 → 8).** `ebp/phase1/passports.routes.js`,
  `docs/ebp/phases/phase-01-product-engineering-passport.md`, and
  `CHANGELOG.md`'s prior entry all previously said "ten endpoints" while
  only eight routes are implemented. No routes were added or invented to
  reach ten — the documentation was corrected to match the real,
  8-route surface (`POST /`, `GET /applicability-matrix`, `GET /:sku`,
  `GET /:sku/revisions`, `GET /:sku/revisions/:revision`, `POST
  /:sku/revisions`, `POST /:id/activate`, `POST /:id/retire`).
- **`ebp/phase1/actor.js`** (new) — `resolveDeclaredActor(headerValue)`
  returns `{ declared_actor, identity_mechanism }`. `declared_actor` is
  explicitly documented as a self-reported label, never named or treated
  as an authenticated identity; its no-header fallback is the explicit
  `'admin-key-session'`, not `'unknown-engineering-actor'`.
  `identity_mechanism` is always `'ADMIN_KEY_SHARED'` in Phase 1.
- **`migrations/ebp-phase1/003_actor_identity_and_applicability_approval.sql`**
  (new) — additive migration: `identity_mechanism` on
  `ebp_engineering_passports` and `ebp_passport_status_history`
  (`DEFAULT 'ADMIN_KEY_SHARED'`); `approval_status` on
  `ebp_field_applicability_matrix` (`DEFAULT
  'PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL'`, `CHECK`
  against exactly that value or `'ENGINEERING_APPROVED'`);
  `field_applicability_source` on `ebp_passport_engineering` (`JSONB`,
  tags each resolved field `"MATRIX"` or `"OVERRIDE"`). `COMMENT ON
  COLUMN` added throughout clarifying declared-actor semantics.
- **`DECISIONS.md`** — added ADR-0014: a Passport revision cannot
  activate (`DRAFT` → `ACTIVE`) while it depends on a `MATRIX`-sourced
  field whose applicability-matrix row is not currently
  `ENGINEERING_APPROVED`; `OVERRIDE`-sourced fields are exempt; drafting
  is never blocked, only activation; the check re-reads the matrix's
  current state at activation time. `BUSINESS_RULES.md` §3 gained a short
  pointer to this ADR (frozen v1.0 baseline text itself unchanged).
- **`ebp/phase1/validation.js`** — `resolveFieldApplicability` now
  returns `{ resolved, source }` instead of a bare map, tagging each
  field's provenance; added `APPLICABILITY_APPROVAL_STATUS` constants.
- **`ebp/phase1/service.js`** — all actor parameters are now `{
  declared_actor, identity_mechanism }` objects, not bare strings;
  `insertEngineeringAndPackaging` persists `field_applicability_source`;
  new `assertApplicabilityApprovedForActivation` enforces ADR-0014 inside
  `activatePassport`'s existing transaction, before the supersession
  logic runs.
- **`ebp/phase1/repository.js`** — `fetchApplicabilityMatrix` now selects
  `approval_status`; added `fetchApplicabilityApprovalFor` and
  `fetchEngineeringSource`; `insertStatusHistory` gained an
  `identityMechanism` parameter.
- **`ebp/phase1/passports.routes.js`** — route-count comment corrected to
  eight with an explicit numbered inventory; `actorFrom` now delegates to
  `resolveDeclaredActor`.
- **`ebp/phase1/dto.js`** — `toInternalPassportDTO` now exposes
  `identity_mechanism` alongside `created_by`, with an inline comment
  stating `created_by` is a declared label, not a verified identity.
- **`migrations/ebp-phase1/validate.sql`** — three new checks: all seeded
  applicability rows are `PROVISIONAL` by default; both
  `identity_mechanism` columns exist with the `ADMIN_KEY_SHARED` default;
  `field_applicability_source` exists on `ebp_passport_engineering`.
- **`migrations/ebp-phase1/rollback.sql`** — added Option D (approve a
  matrix row via `UPDATE`, the normal non-destructive path out of
  `PROVISIONAL`); clarified that dropping a table also drops migration
  `003`'s additive columns, no separate step needed.
- **`tests/ebp-phase1/`** — grew from 43 to 59 tests: unit tests updated
  for the new `resolveFieldApplicability` return shape and added for
  `actor.js`; integration tests added for the ADR-0014 gate (blocked
  while `PROVISIONAL`, unblocked after a direct SQL approval with no new
  revision required, unblocked immediately for a fully `OVERRIDE`-sourced
  Passport) and for declared-actor recording (default and
  caller-supplied); regression tests added for the two new `CHECK`
  constraints and the two new column defaults. One newly added regression
  test was fixed for re-run idempotency (it used a fixed literal
  category/subtype name that collided on a second run against the same
  database; corrected to use the same per-run unique suffix already used
  elsewhere in that file).
- **Full re-verification from scratch:** test database dropped and
  recreated; `001_schema.sql`, `002_seed_applicability_matrix.sql`, and
  `003_actor_identity_and_applicability_approval.sql` applied in order;
  `validate.sql` run (all 9 checks passed); the full 59-test suite run
  three times consecutively against the same database with 59/59 passing
  every time (confirming idempotency, not just a single lucky pass);
  `rollback.sql` run and confirmed to drop all 5 EBP tables while leaving
  `elimfilters_catalog` and `technologies` row counts unchanged in
  structure; migrations reapplied to leave the database in a working
  final state.
- **Phase 2 was not started.** No Manufacturer Registry table, route, or
  spec file was touched in this correction.

## 2026-07-13 — Phase 1 approved and frozen — v1.0

The project owner confirmed the post-implementation audit correction was
satisfactory and formally approved Phase 1.

- **`IMPLEMENTATION_MASTER_INDEX.md`** — Phase 01 row set to `APPROVED /
  FROZEN v1.0`, approved by Project Owner on 2026-07-13.
- **Branch:** `claude/phase-0-audit-review-wanxa3`.
- **Closing commit:** `76ba9c32` ("fix: ebp: Phase 1 post-implementation
  audit correction, approve v1.0").
- **No further changes to Phase 1's implementation are made in this
  entry** — this is a status/approval-only change. Phase 2 remains not
  started.

## 2026-07-13 — Phase 2 (Manufacturer Registry) built

With Phase 1 frozen, the project owner authorized starting Phase 2 only
(explicitly not Phase 3 or later). Converts
`phases/phase-02-manufacturer-registry.md` from `Spec Drafted` to an
implementable spec and then implements it in full — real migrations, real
backend module, real tests, all verified against a real local Postgres
instance. Phase 1's tables, rows, and 59-test suite were re-verified
unmodified throughout. Phase 2 status moves to `Built` (not `APPROVED /
FROZEN` — freezing is a separate, later step per the project owner's
explicit instruction).

- **`docs/ebp/DECISIONS.md`** — added ADR-0015 through ADR-0021, closing
  all nine decisions the project owner required before implementation:
  `EFM-XXXX` generation algorithm (cryptographically random via
  `node:crypto`, 32-char ambiguity-free alphabet, retry-on-collision,
  DB-enforced format/immutability), reuse of Phase 1's `product_category`/
  `product_subtype` vocabulary (no parallel taxonomy), structured
  (typed-enum + JSONB) qualification conditions, Locations as the sole
  address model with a composite FK binding qualifications/certifications/
  capabilities to a specific `(manufacturer_id, location_id)` pair,
  computed certification validity via a SQL view rather than a possibly-
  stale stored column, the six-state Manufacturer and five-state
  Qualification status machines (explicit transition tables, `RETIRED`/
  `REVOKED` terminal), and confidentiality-by-construction (internal-only
  DTOs, no Manufacturer/Distributor projection built in this phase).
- **`docs/ebp/phases/phase-02-manufacturer-registry.md`** — full rewrite
  into an implementable spec: real SQL schema (8 tables + 1 view), the
  `EFM-XXXX` algorithm, both state machines, structured qualification
  conditions, the 16-endpoint internal API surface, confidentiality/DTO
  rules, and closed risks/open-questions sections.
- **`migrations/ebp-phase2/001_schema.sql`** — `ebp_manufacturers` (soft
  retirement, `manufacturer_code` immutability trigger),
  `ebp_manufacturers_status_history` (append-only),
  `ebp_manufacturer_contacts` (partial unique index enforcing one active
  primary contact), `ebp_manufacturer_locations` (`UNIQUE(id,
  manufacturer_id)` enabling composite FKs), `ebp_manufacturer_
  certifications` (+ `ebp_manufacturer_certifications_effective` view),
  `ebp_manufacturer_qualifications`, `ebp_manufacturer_qualification_
  conditions`, `ebp_manufacturer_capabilities`. Idempotent (`CREATE TABLE
  IF NOT EXISTS`), no FK or DDL dependency on Phase 1.
- **`migrations/ebp-phase2/validate.sql`**, **`rollback.sql`** — both
  executed for real: `validate.sql` confirmed all 8 tables, the view, the
  immutability trigger, the partial unique index, the composite FK
  constraint, and zero data-integrity violations; `rollback.sql` confirmed
  (with 130 real manufacturer rows and their children present, not just an
  empty schema) that all Phase 2 structures drop cleanly while
  `ebp_engineering_passports` and its children (5 Phase 1 tables),
  `elimfilters_catalog` (20 rows), and `technologies` (1 row) are left with
  byte-for-byte unchanged row counts; the schema was then reapplied to
  leave the database in a working state and idempotency was confirmed by
  re-running `001_schema.sql` a second time with no errors.
- **`ebp/phase2/efm-code.js`** — `generateUniqueManufacturerCode`
  (retry-on-collision), `generateCandidate`, `isValidFormat` (ADR-0015).
- **`ebp/phase2/validation.js`** — the Manufacturer and Qualification
  status transition tables, all payload validators, and the fixed
  `condition_type`/`capability_type` enums.
- **`ebp/phase2/dto.js`** — `toInternalManufacturerDTO` and six sibling
  internal-only projections (contacts, locations, certifications via the
  effective-status view, capabilities, qualifications with nested
  conditions) — no generic row serialization anywhere (ADR-0021).
- **`ebp/phase2/repository.js`** — database access layer for all 8 tables.
- **`ebp/phase2/service.js`** — orchestration: `createManufacturer`
  (auto-generates and assigns the EFM code inside the creating
  transaction), `transitionManufacturerStatus`/
  `transitionQualificationStatus` (row-locked, state-machine-validated,
  history-recording), and the contact/location/certification/capability/
  qualification lifecycle functions.
- **`ebp/phase2/manufacturers.routes.js`** — the 16-endpoint internal API
  surface under `/api/ebp/manufacturers`, reusing
  `ebp/phase1/actor.js`'s `resolveDeclaredActor` directly (not duplicated,
  per the project owner's explicit instruction).
- **`server.js`** — mounts `/api/ebp/manufacturers` behind the existing
  `adminLimiter` + `requireAdmin` middleware, immediately after the Phase 1
  mount. No existing route, table, or behavior modified.
- **`tests/ebp-phase2/unit.test.js`**, **`integration.test.js`**,
  **`regression.test.js`** — 100 tests total using Node's built-in test
  runner (zero new npm dependencies): 34 unit tests (EFM code
  format/collision-retry, both state machines, all payload validators, DTO
  allow-list behavior), 41 integration subtests (full HTTP lifecycle
  against a live server + live Postgres behind a real `requireAdmin`-style
  gate, including the mandatory `403` without `ADMIN_KEY` check,
  auto-generated-code creation, single-active-primary-contact enforcement,
  certification effective-status after expiry, qualification-by-location-
  and-family with structured conditions, and full
  suspend/reactivate/retire lifecycle), 25 regression subtests (DB-level
  guards independent of application code: case-insensitive
  `manufacturer_code` uniqueness, format `CHECK`, immutability trigger,
  composite-FK cross-manufacturer rejection, cascade-delete with no
  orphans, all status/condition/capability `CHECK` constraints, and the
  effective-certification view's expiry computation). **All 100 passed**
  against a real local Postgres 16 instance, confirmed stable across 3
  consecutive re-runs. Phase 1's own 59-test suite was re-run after this
  work and still passes 59/59 unmodified.
- **Two bugs found and fixed during test-writing** (both in this same
  change, before any freeze): the certification-verify route was
  hardcoding `effective_status` to the raw `status` column instead of
  reading the computed effective-status view, defeating ADR-0019's
  guarantee for the verify response specifically (fixed in
  `ebp/phase2/service.js`'s `addCertification`/`verifyCertification`,
  which now always re-fetch through
  `ebp_manufacturer_certifications_effective`); and an early regression
  test asserted a global zero count of `ebp_engineering_passports` rows
  with `created_by = 'regression-test'`, which is false once Phase 1's own
  regression suite has ever run in the same database — corrected to a
  before/after row-count diff scoped to the Phase 2 test run itself.
- **Phase 3 was not started.** No Manufacturer Intake Portal / Factory
  Portal table, route, or spec change was made in this session.

## 2026-07-13 — Phase 2 approved and frozen — v1.0

The project owner reviewed the `Built` Phase 2 delivery, ran a closing
audit, and formally approved Phase 2.

- **Closing audit executed before freeze:** the 100-test Phase 2 suite
  re-run (100/100); the 59-test Phase 1 suite re-run (59/59); `migrations/
  ebp-phase2/validate.sql` re-run (8 tables, the effective-certification
  view, the immutability trigger, the partial unique index, zero
  data-integrity violations); `rollback.sql` re-run with 154 real
  manufacturer rows (and their children) present, confirming clean removal
  of all 8 Phase 2 structures while Phase 1 (5 tables), `elimfilters_
  catalog` (26 rows), and `technologies` (1 row) remained byte-for-byte
  unchanged; the schema was reapplied and both suites re-confirmed passing
  when run independently (a combined single-process run surfaced a
  test-isolation artifact — Phase 1's integration test inserting a catalog
  row mid-snapshot of an unrelated Phase 2 regression assertion — which is
  not a defect in either suite and does not affect either phase's
  standalone correctness); the 16-endpoint `ebp/phase2/manufacturers.
  routes.js` surface was confirmed against the router source; confirmed no
  `ebp/phase3` module, no `migrations/ebp-phase3/` directory, and no Phase
  3 mount in `server.js` exist.
- **`docs/ebp/DECISIONS.md`** — added ADR-0022, closing the four decisions
  the project owner made at approval time: `registered_on`'s meaning is
  now formalized as unambiguous (the date ELIMFILTERS incorporated the
  manufacturer into the registry — never founding date, relationship
  start, qualification date, approval date, or first-production date); the
  computed-view certification-validity design (ADR-0019) is approved as
  final, with every later phase required to read `effective_status`, never
  the raw `status` column; `country_code`/`timezone` syntactic-only
  validation is accepted and tracked as controlled debt under the tag
  `FUTURE_REFERENCE_DATA_VALIDATION`; and every fixed Phase 2 enum
  (`condition_type`, `capability_type`, both status machines, etc.) may
  only be extended via documentation + a new ADR + a migration + tests,
  never a free-form value. No implementation change was required — Phase
  2's code already matched all four decisions.
- **`docs/ebp/phases/phase-02-manufacturer-registry.md`** — status header
  updated to `APPROVED / FROZEN v1.0`; a "Freeze notice" section added; the
  `registered_on` field description in "Key Entities" rewritten to the
  formalized, unambiguous meaning; the "Risks" section rewritten to show
  each prior risk as closed/accepted/governed per ADR-0022 rather than
  left open; the stale "left in status `Built`" Exit Criteria note
  corrected to reflect the freeze; the frozen-baseline notice extended to
  state that Phase 2's own files/tables/rules now carry the same
  protection Phase 0 and Phase 1 already have.
- **`docs/ebp/IMPLEMENTATION_MASTER_INDEX.md`** — Phase 02 row set to
  `APPROVED / FROZEN v1.0`, approved by Project Owner on 2026-07-13; the
  phase-status notes section rewritten accordingly; Phases 03-09 note
  corrected to Phases 04-09 (Phase 3 is now authorized).
- **Branch:** `claude/phase-0-audit-review-wanxa3`.
- **Closing commit:** `f12e981d` ("docs: ebp: Phase 2 post-closing-audit
  correction, approve v1.0").
- **No further changes to Phase 2's implementation are made in this
  entry** — this is a status/approval-only change, consistent with
  ADR-0022 requiring no code changes. **Phase 3 — Manufacturer Intake
  Portal / Factory Portal is authorized to begin immediately; no phase
  beyond Phase 3 is authorized.**


