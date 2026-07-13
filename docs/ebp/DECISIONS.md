# DECISIONS — ELIMFILTERS Business Platform (EBP)

Architecture Decision Record (ADR) log. Each entry is append-only — a
reversed decision gets a new entry that supersedes the old one; the old
entry is not deleted or edited (auditability, per `BUSINESS_RULES.md` §13).

Format: `ADR-NNNN` · Date · Status (`Proposed` / `Accepted` / `Superseded by
ADR-XXXX`) · Context · Decision · Consequences.

---

## ADR-0001 — Extend the existing Postgres database instead of a new database

**Date:** 2026-07-13
**Status:** Accepted

**Context:** EBP needs to store new entities (Product Engineering Passports,
Manufacturers, Suppliers, Validation results, Cost/Pricing records,
Distributor accounts, Orders) that reference existing catalog data (SKUs,
`technologies`, `oems`, `industries`). A new, separate database would avoid
any risk of collision with existing schema work but would require
cross-database joins or data duplication to reference catalog entities.

**Decision:** EBP tables live in the same Postgres database used by
`server.js`, under an `ebp_` table-name prefix, added via additive
migrations. No new database is provisioned for Phase 1-9 by default.

**Consequences:** Referential integrity to SKUs/technologies/OEMs/industries
is enforced by real foreign keys, not application-level joins across
systems. Risk: EBP migrations must be disciplined to never modify existing
tables (see `CLAUDE_WORKFLOW.md` §6). If EBP's write volume or availability
needs ever diverge significantly from the catalog's, this decision should be
revisited with a new ADR.

---

## ADR-0002 — Distributor/staff authentication is explicitly undecided in Phase 0

**Date:** 2026-07-13
**Status:** Accepted (as an open item, not a deferral of the risk)

**Context:** The existing backend has exactly one auth mechanism: a static
`ADMIN_KEY` bearer token for admin/import endpoints. There is no end-user or
distributor identity system anywhere in the current codebase. Phase 8
(Distributor Portal) requires real authenticated accounts with
tiering/region, which the `ADMIN_KEY` model cannot support.

**Decision:** Phase 0 does **not** select an auth provider or design. This
is explicitly logged as an open architectural question
(`PLATFORM_ARCHITECTURE.md` §7) and a named dependency for Phase 8
(`phases/phase-08-distributor-portal.md`). Phases 1-7 do not require
end-user auth and are not blocked by this.

**Consequences:** Phase 8 cannot start implementation until this decision is
made. This should be revisited no later than the start of Milestone C
(`ROADMAP.md`) planning, not deferred until Phase 8 begins — the earlier
this is decided, the less rework risk for Phase 8's data model (e.g.,
whether distributor accounts need a `user_id` shape compatible with a
specific provider).

---

## ADR-0003 — SKU identity is not duplicated or re-derived by EBP

**Date:** 2026-07-13
**Status:** Accepted

**Context:** EBP's Product Engineering Passport (Phase 1) needs a stable key
to reference a product. The existing catalog already has a rigorously
governed SKU architecture (root `CLAUDE.md`).

**Decision:** Every Passport references an existing SKU (or an explicitly
flagged pre-SKU draft record) by the SKU string itself as a foreign key.
EBP does not mint, alter, or maintain a parallel product identifier scheme.

**Consequences:** Passport records for products that don't have a SKU yet
(new product development, pre-launch) need a defined "draft" state — this is
carried as an open item into `phases/phase-01-product-engineering-passport.md`
for that phase's spec to resolve in detail.

---

## ADR-0004 — Cost and Price are each computed by exactly one module

**Date:** 2026-07-13
**Status:** Accepted

**Context:** Without a single source of truth, cost and price figures tend
to drift across modules that each do their own estimate (a common failure
mode in ad hoc spreadsheet-based costing).

**Decision:** Cost Engine (Phase 6) is the only module permitted to compute
landed cost. Pricing Engine (Phase 7) is the only module permitted to
compute sell price. All other modules (Distributor Portal, Order
Management, Manufacturer Selection) consume these outputs and do not
recompute them. Codified in `BUSINESS_RULES.md` §9-10.

**Consequences:** Phase 6 and 7 become hard dependencies for any module that
displays a number to a distributor. This is intentional — it trades
implementation sequencing flexibility for guaranteed consistency.

---

## ADR-0005 — Correction: the MVP validation chain is Passport × Manufacturer × Manufacturer Offer, not Passport × Manufacturer × Supplier

**Date:** 2026-07-13
**Status:** Accepted — **supersedes the domain model implied by the original
Phase 0 draft** (`PROJECT_MANIFESTO.md`, `BUSINESS_RULES.md`,
`PLATFORM_ARCHITECTURE.md`, and phases 01/03/04/06 as originally drafted).
This entry does not delete the prior drafts' history — see `CHANGELOG.md`
2026-07-13 (correction round) for the full list of files revised.

**Context:** The original Phase 0 draft modeled a `Supplier` entity as a
component/raw-material vendor (filter media, cores, gaskets, cans,
adhesives) scoped to a Manufacturer, and made `Passport × Manufacturer ×
Supplier` the object the Validation Engine evaluated. This is not the
agreed MVP architecture. In the agreed model, a **Manufacturer** is the
factory that produces the *finished* filter and responds to ELIMFILTERS
with its own offered specification (dimensions, materials, packaging,
commercial terms) against ELIMFILTERS' required specification — there is no
independent, separately-validated raw-material-supplier tier in the MVP.
What sub-tier components a Manufacturer sources internally to build its
offer is the Manufacturer's own concern, not an EBP-modeled entity.

**Decision:**
1. The mandatory MVP chain is:
   `Product Engineering Passport` → `Manufacturer Request Batch` →
   `Manufacturer Product Offer` → `Engineering Compliance Validation` →
   `Manufacturer Selection` → `Cost Engine` → `Pricing Engine` →
   `Distributor Portal`.
2. Engineering Compliance Validation (formerly "Validation Engine")
   operates on **Passport Version × Manufacturer × Manufacturer Offer**.
   It never operates on, references, or requires a `Supplier` record.
3. `Supplier` (component/raw-material vendor) is removed as a mandatory
   MVP entity. It is explicitly deferred to a possible future phase,
   outside the current 00-09 roadmap, and must not appear as a dependency
   of any Phase 01-09 spec.
4. Phase 03 is renamed, in domain terms, from "Supplier Portal" to
   **"Manufacturer Intake Portal"** (also referred to as "Factory Portal").
   Its file name (`phases/phase-03-supplier-portal.md`) is kept unchanged
   to avoid unnecessary churn in cross-references and the Master Index;
   the file's title and content are corrected to reflect the real domain.
   The physical filename must not be read as an indication of the file's
   actual scope — its content is authoritative.
5. A Manufacturer's bill-of-materials-category concept
   (`ebp_passport_bom_categories` in the original Phase 1 draft) is
   replaced by the Passport's own **required engineering fields**
   (media, adhesive, gasket material, etc., see
   `phases/phase-01-product-engineering-passport.md`), which the
   Manufacturer answers directly in its Offer — there is no intermediate
   Supplier-mapping step.

**Consequences:**
- Every prior reference to a `Supplier` entity as part of the mandatory
  validation chain, across `PROJECT_MANIFESTO.md`, `BUSINESS_RULES.md`,
  `PLATFORM_ARCHITECTURE.md`, `ROADMAP.md`, and phases 01/03/04/05/06/08,
  is corrected in this same change.
- Raw-material/component suppliers, if ever modeled, would be a
  **Manufacturer-internal concern** surfaced (if at all) as evidence
  attached to a Manufacturer Product Offer (e.g., a certificate naming a
  media supplier), not as an independently validated EBP entity, unless a
  future phase explicitly revisits this decision with its own ADR.
- This is a **correction to Phase 0's own output**, not a scope change to
  the program — Phase 0 remains undelivered/unapproved until this
  correction is complete and re-reviewed.

---

## ADR-0006 — Manufacturer identity is confidential; the EFM code is the functional key

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The original Phase 0 draft used `legal_name` as the primary
descriptive attribute for a Manufacturer and did not define a distinct,
permanent, confidential identifier, nor did it define what a Distributor
is permitted to see about a Manufacturer. In the agreed MVP, manufacturer
identity, FOB pricing, margins, and confidential engineering are
commercially sensitive and must never reach a Distributor.

**Decision:**
1. Every Manufacturer is assigned a permanent, confidential
   `manufacturer_code` in the format `EFM-XXXX` (e.g., `EFM-A7K2`) at the
   time it is registered. This code, not `legal_name`, is the functional
   key used by every other EBP module (Manufacturer Registry,
   Manufacturer Intake Portal, Engineering Compliance Validation,
   Manufacturer Selection, Cost Engine) to reference a Manufacturer.
   `legal_name` is descriptive metadata only.
2. The Distributor Portal (Phase 08) and any data that reaches it must
   never expose: manufacturer identity (name or `EFM-XXXX` code), FOB
   price, margin, or confidential engineering/manufacturing notes. A
   Distributor sees only the ELIMFILTERS-approved product and its final
   approved price and packaging.
3. This confidentiality boundary is enforced at the Pricing Engine /
   Distributor Portal boundary (Phase 07 → Phase 08): Pricing Engine's
   output to Phase 08 must not carry manufacturer-identifying or
   cost-basis fields at all, not merely hide them in the UI.

**Consequences:** Every EBP data model and API surface designed from this
point forward must treat `manufacturer_code` (not `legal_name`) as the
join key, and must treat "is this field distributor-visible" as an
explicit, reviewed decision per field, not a default. This is codified in
`BUSINESS_RULES.md` §11 (Distributor Portal Rules).

---

## ADR-0007 — A Manufacturer may submit many versioned Offers per Passport Version; exactly one stays active

**Date:** 2026-07-13
**Status:** Accepted — **supersedes** the "exactly one Offer per (Manufacturer,
Passport version)" rule stated in the first correction round
(`BUSINESS_RULES.md` §5 as revised 2026-07-13, and
`phases/phase-03-supplier-portal.md`).

**Context:** The first correction round (ADR-0005) fixed the domain model
but still assumed a plant submits exactly one Offer per (Manufacturer,
Passport Version) — as if a quote, once given, were final. In practice a
plant re-quotes: it revises pricing, corrects an engineering answer,
responds to ELIMFILTERS feedback after a rejected review, or requotes
capacity/lead time months later for the same Passport Version. Treating
this as a single mutable record would either silently overwrite prior
commercial terms (destroying the audit trail Engineering Compliance
Validation and Manufacturer Selection rely on) or force an artificial new
Passport Version for what is really a commercial re-quote, not an
engineering change.

**Decision:**
1. There may be **many** `Manufacturer Product Offer` records for the same
   (`passport_version`, `manufacturer_code`) pair. A new Offer is a new
   **revision**, never an overwrite of a prior one.
2. Every Offer record carries: `offer_id` (unique per revision row),
   `offer_revision` (sequence number within the lineage for that
   Manufacturer/Passport Version), `status`, `submitted_at`,
   `effective_from`, `expires_at` (nullable), `supersedes_offer_id`
   (nullable — the prior `offer_id` this revision replaces, null for the
   first revision in a lineage), and `created_by`.
3. The Offer status lifecycle has exactly eight states: `DRAFT`,
   `SUBMITTED`, `UNDER_REVIEW`, `VALIDATED`, `REJECTED`, `SUPERSEDED`,
   `EXPIRED`, `WITHDRAWN`. `DRAFT` is manufacturer-side work-in-progress,
   not yet visible to ELIMFILTERS as a submission.
4. At any moment, **at most one** Offer among all revisions for a given
   (`passport_version`, `manufacturer_code`) pair may hold an "active"
   status (`SUBMITTED`, `UNDER_REVIEW`, or `VALIDATED`). Submitting a new
   revision moves the prior active Offer to `SUPERSEDED` in the same
   transaction — it is never left active alongside the new one, and it is
   never deleted or edited in place.
5. Engineering Compliance Validation (Phase 4) and Manufacturer Selection
   (Phase 5) must reference a **specific** `offer_id` and `offer_revision`,
   never just a Manufacturer and a Passport. A validation result or a
   selection decision is permanently bound to the exact revision it
   evaluated.

**Consequences:**
- `BUSINESS_RULES.md` §5, §6, and §8 (renumbered — see the `CHANGELOG.md`
  entry for this correction round), and `phases/phase-03`, `phase-04`,
  `phase-05`, `phase-06` are updated to reflect versioned Offers.
- `ebp_compliance_validations` and `ebp_selection_recommendations` /
  `ebp_selection_approvals` must store `offer_id` **and** `offer_revision`
  explicitly, even though `offer_id` alone already pins an exact revision
  under this model — the redundant `offer_revision` column exists for
  human-readable audit traceability, not because it is strictly required
  for uniqueness.
- A Passport revision, a Manufacturer status change, or an Offer's own
  `expires_at` passing all independently invalidate whatever validation
  result depended on the now-stale combination, per the rule already
  codified in `BUSINESS_RULES.md` §6 — this ADR does not change that
  invalidation rule, it only makes explicit which exact Offer revision
  each result was ever bound to.

---

## ADR-0008 — Packaging data ownership is split across PEP, Offer, and a new Offer Approval entity

**Date:** 2026-07-13
**Status:** Accepted — **corrects** `BUSINESS_RULES.md` §3.1 and
`phases/phase-01-product-engineering-passport.md` as revised in the first
correction round, which incorrectly described `manufacturer_recommended_
quantity` and `elimfilters_approved_quantity` as Passport-owned fields.

**Context:** The Product Engineering Passport (PEP) is defined,
project-wide, as ELIMFILTERS' locked requirement — never editable by a
Manufacturer (`BUSINESS_RULES.md` §3). The first correction round's
packaging rule nonetheless described three quantity fields
(`elimfilters_target_quantity`, `manufacturer_recommended_quantity`,
`elimfilters_approved_quantity`) as if all three lived on the Passport.
That is inconsistent with the Passport's own definition: a Manufacturer's
recommended quantity is that Manufacturer's own proposal and varies by
Manufacturer, so it cannot be a single locked field on a record ELIMFILTERS
alone owns. Likewise, ELIMFILTERS' final approved quantity is a decision
made *about* a specific Offer, after review — it is not a requirement set
in advance.

**Decision:**
1. The PEP (`ebp_passport_packaging`, Phase 1) holds **only**
   ELIMFILTERS' requirements: `individual_box_required`,
   `protective_bag_required`, `separator_required`,
   `master_carton_required`, `elimfilters_target_quantity`, target
   dimensions/restrictions where they exist, and any ELIMFILTERS-required
   packaging instructions. Nothing here is Manufacturer- or
   decision-specific.
2. The Manufacturer Product Offer (`ebp_manufacturer_offers` / its
   packaging sub-record, Phase 3) holds that Manufacturer's own
   **proposal**: `manufacturer_recommended_quantity`, proposed box
   dimensions, net and gross weight, proposed units per box, proposed
   protection method, proposed palletization, and observations/deviations.
   This proposal belongs to the specific Offer revision (ADR-0007) that
   submitted it.
3. A new entity, **`ebp_manufacturer_offer_approvals`**, holds
   ELIMFILTERS' decision about a specific Offer's packaging and commercial/
   technical acceptability: `offer_id` (+ `offer_revision`), approval
   status, final approved packaging, `elimfilters_approved_quantity`,
   whether a proposed deviation was accepted or rejected, the responsible
   approver, the reason, the date, and its own append-only history. This
   entity is distinct from Engineering Compliance Validation (Phase 4):
   Validation determines technical compliance with `required_*` fields;
   Approval determines whether ELIMFILTERS commercially and operationally
   accepts that Offer's proposal. A technically `VALID` Offer is **not**
   automatically an approved Offer, and is not automatically a selected
   Manufacturer (Phase 5's own approval step, `ebp_selection_approvals`,
   remains a separate, later decision about *which* Offer is sourced
   from).
4. `manufacturer_recommended_quantity` and `elimfilters_approved_quantity`
   are removed from the Passport data model everywhere they appear.

**Consequences:**
- `phases/phase-01-product-engineering-passport.md` §3 (Required Packaging)
  is corrected to list only ELIMFILTERS-owned requirement fields.
- `phases/phase-03-supplier-portal.md` gains the Offer's packaging-proposal
  fields and the new `ebp_manufacturer_offer_approvals` entity.
- `BUSINESS_RULES.md` §3.1 is rewritten to reflect the three-way split
  (PEP / Offer / Approval) instead of describing all three quantities as
  Passport fields.
- A new `BUSINESS_RULES.md` section, "Manufacturer Offer Approval Rules"
  (§7), documents this entity as its own gate, separate from both
  Validation (§6) and Selection (§8).
- Whether Manufacturer Selection (§8) requires an Offer Approval record in
  addition to a current `VALID` validation before it can even be
  *recommended* (vs. only before an order is fulfilled against it) is not
  decided by this ADR — flagged as an open question in
  `phases/phase-05-manufacturer-selection.md`.

---

## ADR-0009 — Passport notes are split into manufacturer-visible instructions and ELIMFILTERS-internal engineering notes

**Date:** 2026-07-13
**Status:** Accepted — **replaces** the single "confidential manufacturing
notes" field described in `phases/phase-01-product-engineering-passport.md`
and `BUSINESS_RULES.md` §3 as revised in the first correction round.

**Context:** The original field, "confidential manufacturing notes," was
treated as a single opaque blob without a defined audience. In practice two
different audiences need two different things: a Manufacturer that has been
assigned a Passport in a Request Batch needs certain technical instructions
to quote and build correctly; ELIMFILTERS engineering staff separately keep
notes that must never leave ELIMFILTERS, including notes about the
Manufacturer relationship itself. Collapsing both into one field makes it
structurally easy to leak the second category to a Manufacturer, or the
first category to a Distributor, through a naive "serialize the whole
Passport" API implementation.

**Decision:**
1. The single field is replaced by two fields:
   - `manufacturer_instruction_notes` — ELIMFILTERS' technical instructions
     a plant needs to quote or produce correctly. Visible only to the
     Manufacturer(s) a Request Batch containing this Passport was actually
     sent to, and to authorized ELIMFILTERS staff. Never visible to
     Distributors or the public.
   - `internal_engineering_notes` — ELIMFILTERS-internal information.
     Never visible to any Manufacturer or Distributor. Only authorized
     internal roles.
2. No API endpoint may return a generic serialization of "the Passport"
   that includes either field by default. Each consumer (Manufacturer
   Intake Portal, internal engineering tooling, Distributor/Pricing-facing
   surfaces) must be served by its own explicit, reviewed
   projection/DTO — an allow-list per role, not a single shared shape with
   fields hidden after the fact. This follows the same allow-list
   discipline already required of Pricing Engine's Distributor-facing
   projection (ADR-0006).

**Consequences:**
- `phases/phase-01-product-engineering-passport.md` §2 (Required
  Engineering) lists both fields explicitly in place of the old single
  field.
- `phases/phase-03-supplier-portal.md`'s open question "does a Manufacturer
  see confidential manufacturing notes" is resolved: it sees
  `manufacturer_instruction_notes` only, scoped to Passports it was
  actually sent, and never sees `internal_engineering_notes`.
- `PLATFORM_ARCHITECTURE.md` §6 (Confidentiality by construction) is
  extended to name role-specific Passport projections as a required
  pattern, not just a Distributor-facing one.

---

## ADR-0010 — Manufacturer Selection requires VALID and APPROVED; preliminary analysis is explicitly non-official

**Date:** 2026-07-13
**Status:** Accepted — **resolves** the open question left by ADR-0008 and
carried in `phases/phase-05-manufacturer-selection.md` and
`phases/phase-09-order-management.md` (whether Selection requires Offer
Approval in addition to `VALID` before recommending).

**Context:** ADR-0008 introduced Offer Approval as a gate distinct from
Engineering Compliance Validation but deliberately left open whether
Manufacturer Selection's official recommendation could be built from
`VALID`-but-not-yet-`APPROVED` Offers. Leaving this open risked a
recommendation being built on packaging/commercial terms ELIMFILTERS had
not yet accepted, forcing rework if Approval later rejected those terms.
The project owner has now decided this explicitly.

**Decision:**
1. An **official** Manufacturer Selection recommendation (and, downstream,
   any Manufacturer Selection used to source Cost Engine, Pricing Engine,
   or an Order) may only evaluate Offers that satisfy **all** of:
   - the Offer is the current active revision for its (Passport Version ×
     Manufacturer) pair;
   - Engineering Compliance Validation = `VALID` (current, within its
     effectiveness window);
   - Manufacturer Offer Approval = `APPROVED` (per ADR-0011);
   - the Manufacturer's qualification status is `QUALIFIED`, or
     `CONDITIONAL` with its condition satisfied, for the Passport's family;
   - the Offer is not expired, withdrawn, rejected, or superseded.
2. A **preliminary** internal comparison of `VALID`-but-not-yet-`APPROVED`
   Offers is permitted, but must be explicitly and permanently marked
   `PRELIMINARY_COMPARISON` wherever it is stored or displayed. A
   `PRELIMINARY_COMPARISON` record can never become, convert into, or be
   silently promoted to an official Selection recommendation, a
   Manufacturer Selection, or an Order allocation. Producing an official
   recommendation always requires a fresh evaluation against the full gate
   in point 1 at the time the recommendation is made.

**Consequences:**
- `BUSINESS_RULES.md` §8 (Manufacturer Selection Rules) is rewritten to
  state this five-part gate and to define `PRELIMINARY_COMPARISON` as a
  non-official, clearly labeled analysis artifact.
- `phases/phase-05-manufacturer-selection.md`'s open question on Selection/
  Approval ordering is resolved by this ADR; `phases/phase-09-order-
  management.md`'s equivalent open question on the `allocated` → `in
  production` transition is resolved the same way — an order may not
  allocate to an Offer that is not both `VALID` and `APPROVED`.
- Any Selection implementation must be able to distinguish, at the data
  level, an official recommendation record from a `PRELIMINARY_COMPARISON`
  record — these must never share a table/status space that could let one
  be mistaken for the other.

---

## ADR-0011 — Offer Approval requires two independent roles; ADMIN_OWNER cannot override technical invalidity

**Date:** 2026-07-13
**Status:** Accepted — **extends** ADR-0008's Offer Approval entity
(`ebp_manufacturer_offer_approvals`) with a concrete authorization model,
resolving the open question in `phases/phase-03-supplier-portal.md` on who
is authorized to record an approval decision.

**Context:** ADR-0008 created the Offer Approval entity but did not define
who is authorized to approve what. Leaving "approval" as a single
undifferentiated action risks one person declaring both technical
compliance and commercial acceptability, which defeats the separation of
concerns Validation vs. Approval was meant to establish (ADR-0008), and
risks a single actor overriding a technical `INVALID` result by fiat.

**Decision:**
1. Three functional roles govern Offer Approval and sourcing decisions:
   - **`ENGINEERING_APPROVER`** — approves technical compliance. Does not
     approve FOB, margin, or any other commercial term.
   - **`COMMERCIAL_APPROVER`** — approves FOB, MOQ, lead time, capacity,
     final packaging, and other commercial/operational terms. Cannot
     declare an Offer technically valid.
   - **`ADMIN_OWNER`** — approves the final sourcing decision (primary,
     secondary, backup) produced by Manufacturer Selection (Phase 5); may
     reject an Offer or a selection outright. **Can never convert a
     technically `INVALID` Offer (per Engineering Compliance Validation,
     Phase 4) into `VALID` or `APPROVED`** — `ADMIN_OWNER` authority is
     scoped to the sourcing decision, not to technical compliance.
2. For the MVP, a Manufacturer Product Offer's `status` reaches `APPROVED`
   (per its lifecycle in `BUSINESS_RULES.md` §5 / ADR-0007) only after all
   three of the following are true for that exact `offer_id`/
   `offer_revision`:
   1. Engineering Compliance Validation result = `VALID`.
   2. An `ENGINEERING_APPROVER` engineering-approval decision is recorded.
   3. A `COMMERCIAL_APPROVER` commercial-approval decision is recorded.
3. Every approval decision (`ENGINEERING_APPROVER`, `COMMERCIAL_APPROVER`,
   or `ADMIN_OWNER`) must record: the user, their role at decision time,
   the date, the decision, the reason, comments, and the exact `offer_id`/
   `offer_revision` (and, for `ADMIN_OWNER`, the selection recommendation
   id) evaluated. This is stored in `ebp_manufacturer_offer_approvals`
   (engineering/commercial decisions) and `ebp_selection_approvals`
   (`ADMIN_OWNER` decisions), both append-only per ADR-0008/ADR-0005-era
   auditability rules.

**Consequences:**
- `BUSINESS_RULES.md` §7 (Manufacturer Offer Approval Rules) is rewritten
  to require both an `ENGINEERING_APPROVER` and a `COMMERCIAL_APPROVER`
  decision, each independently recorded, before `APPROVED` is reached.
- `phases/phase-03-supplier-portal.md`'s `ebp_manufacturer_offer_approvals`
  entity gains explicit `engineering_approval` and `commercial_approval`
  sub-records (or rows), each with the full audit field set from point 3.
- Role assignment/authentication mechanics (who holds which role, and how
  that is enforced in code) remain undecided pending the Manufacturer/
  Distributor/staff auth decision (ADR-0002) — this ADR defines the
  functional roles and their authority boundaries, not the identity
  system that will enforce them.

---

## ADR-0012 — Manufacturer Request Batch deadlines are set per batch, not globally

**Date:** 2026-07-13
**Status:** Accepted — **resolves** the open question in
`phases/phase-03-supplier-portal.md` on whether a Request Batch has a
deadline.

**Context:** Different Request Batches (a single urgent SKU vs. a large
multi-SKU sourcing round) reasonably need different response windows. A
single global deadline policy would either be too short for complex
batches or too permissive for urgent ones.

**Decision:**
1. There is no fixed global response deadline. ELIMFILTERS sets
   `response_due_at` explicitly on every Request Batch at creation (or
   before sending).
2. Every Request Batch record carries: `batch_id`, `manufacturer_code`,
   `created_at`, `sent_at`, `response_due_at`, `timezone`, `status`,
   `created_by`.
3. A Request Batch's status lifecycle has exactly seven states: `DRAFT`,
   `SENT`, `PARTIALLY_RESPONDED`, `RESPONDED`, `OVERDUE`, `CLOSED`,
   `CANCELLED`.
4. A Manufacturer Offer submitted after its batch's `response_due_at` may
   still be received, but must be flagged `LATE_SUBMISSION = true` on the
   Offer, and the Offer's actual `submitted_at` timestamp (the real receipt
   time) is preserved unmodified — a late submission is never silently
   treated as on-time, and is never rejected purely for being late (that
   remains a Commercial/Admin decision, not a system-enforced block).

**Consequences:**
- `BUSINESS_RULES.md` §5 (Manufacturer Intake Rules) is extended with the
  Request Batch field list, its seven-state lifecycle, and the
  `LATE_SUBMISSION` rule.
- `phases/phase-03-supplier-portal.md`'s `ebp_manufacturer_request_batches`
  entity gains the full field list above; `ebp_manufacturer_offers` gains
  a `late_submission` boolean.
- A batch transitioning to `OVERDUE` (when `response_due_at` passes with
  outstanding Manufacturers) is a status change like any other and must be
  logged, not just computed ad hoc at read time — the mechanism for this
  (scheduled job vs. computed-on-read) is left to Phase 3's implementation,
  consistent with the same open item already carried for Engineering
  Compliance Validation's triggering mechanism (`phases/phase-04-
  validation-engine.md` Open Questions).

---

## ADR-0013 — Phase 0 approved and frozen as v1.0

**Date:** 2026-07-13
**Status:** Accepted
**Branch:** `claude/phase-0-audit-review-wanxa3`
**Closing commit:** `cd1a9a78` ("docs: ebp: Final governance decisions
and approve/freeze Phase 0 v1.0") — see `CHANGELOG.md`'s "Phase 0
approved and frozen — v1.0" entry for this date.

**Context:** Phase 0 was reviewed three times by the project owner: an
initial review that rejected the original Supplier-based domain model
(ADR-0005/ADR-0006), a second review that rejected the unversioned-Offer
and Passport-owned-packaging model (ADR-0007/ADR-0008/ADR-0009), and a
final review that added binding governance decisions on Selection gating,
approval roles, and Request Batch deadlines (ADR-0010/ADR-0011/ADR-0012).
The project owner has now stated the final review is satisfactory and
formally approves Phase 0.

**Decision:**
1. **Phase 0 — Foundation is APPROVED.**
2. The documentation set under `docs/ebp/` as of this ADR (`PROJECT_
   MANIFESTO.md`, `BUSINESS_RULES.md`, `PLATFORM_ARCHITECTURE.md`,
   `ROADMAP.md`, `DECISIONS.md` through ADR-0013, `CHANGELOG.md`,
   `IMPLEMENTATION_MASTER_INDEX.md`, `CLAUDE_WORKFLOW.md`,
   `CLAUDE_START_PROMPT.md`, and `phases/phase-00-foundation.md` through
   `phases/phase-09-order-management.md`) is marked **`APPROVED /
   FROZEN v1.0`**.
3. **Frozen** means: the domain model, entity list, and governance rules
   established through ADR-0001–ADR-0013 may not be altered without a new
   ADR that explicitly supersedes the relevant prior entry — the same
   append-only discipline already in force, now extended to cover the
   whole v1.0 baseline, not just individual ADRs. Phase specs may still be
   elaborated with implementation detail (SQL types, exact API payloads,
   etc.) as each phase moves through its own approval gate — that is
   expected and is not an architecture change.
4. Phase 1 — Product Engineering Passport is authorized to begin,
   immediately following this ADR, per the project owner's explicit
   instruction. No phase beyond Phase 1 is authorized by this ADR.

**Consequences:**
- `IMPLEMENTATION_MASTER_INDEX.md`, `phases/phase-00-foundation.md`, and
  `CHANGELOG.md` are updated in the same change to reflect `APPROVED /
  FROZEN v1.0` status, the approval date, the branch, and the closing
  commit.
- Any future session proposing to change the three-entity model, the
  Offer versioning model, the packaging ownership split, the note-field
  split, or the Selection/Approval governance model must stop and treat
  that as a request to supersede a frozen ADR, not a routine edit — per
  the existing rule in `CLAUDE_WORKFLOW.md` §1.1, now applying to the full
  v1.0 baseline.
- Phase 1 moves from `Spec Drafted` to active implementation under its own
  spec, which this same change converts to a complete, implementable
  specification before any code is written, per
  `CLAUDE_WORKFLOW.md` §3 (Documentation-First Requirement).

---

## ADR-0014 — A Passport cannot activate while it depends on a PROVISIONAL, unapproved applicability-matrix rule

**Date:** 2026-07-13
**Status:** Accepted
**Scope:** Phase 1 implementation detail. Does not alter the frozen v1.0
baseline (ADR-0001–ADR-0013) — this is an additive rule specific to how
Phase 1's field-applicability matrix (introduced during Phase 1
implementation, not part of the original Phase 0 baseline) governs
Passport activation.

**Context:** Phase 1's field-applicability matrix
(`ebp_field_applicability_matrix`) was seeded with 40 rows as a starting
point grounded in general filtration engineering practice, explicitly
flagged as not yet reviewed by ELIMFILTERS engineering (see the phase-01
doc's "Risks"). Left unaddressed, nothing would stop a Passport built on
an unreviewed, possibly-wrong applicability rule from reaching `ACTIVE`
status and being treated as a production-ready specification — silently
converting a provisional starting guess into a de facto engineering
authority.

**Decision:**
1. Every `ebp_field_applicability_matrix` row carries `approval_status`,
   either `PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL` (the
   default/seed state) or `ENGINEERING_APPROVED`.
2. Every field resolved onto a Passport's `ebp_passport_engineering` row
   is tagged with its provenance in `field_applicability_source`:
   `MATRIX` (resolved from the applicability matrix) or `OVERRIDE`
   (an explicit value supplied on the Passport itself, an engineering
   decision already made at Passport-authoring time).
3. **Creating a `DRAFT` Passport is never blocked by matrix review
   state** — a Passport may be drafted, and its engineering data
   authored, entirely against `PROVISIONAL` rules. This supports normal
   iterative drafting and test/sample Passports.
4. **Activating a Passport (`DRAFT` → `ACTIVE`) is blocked** if any field
   on that revision is `MATRIX`-sourced and the corresponding matrix
   row's *current* `approval_status` is not `ENGINEERING_APPROVED`.
   `OVERRIDE`-sourced fields are exempt from this check — an explicit
   override is already an engineering decision and does not need the
   shared matrix's approval. The check re-reads the matrix's current
   state at the moment of activation (not whatever it was when the
   `DRAFT` was created), so approving a matrix row unblocks activation
   for any Passport depending on it without requiring a new revision.
5. There is exactly one policy, applied consistently at the SQL level
   (`approval_status` CHECK constraint), the service layer
   (`assertApplicabilityApprovedForActivation` in
   `ebp/phase1/service.js`), and test coverage (unit + integration +
   regression) — not two competing mechanisms and not left to
   documentation alone.

**Consequences:**
- Until ELIMFILTERS engineering explicitly approves specific matrix rows
  (`UPDATE ebp_field_applicability_matrix SET approval_status =
  'ENGINEERING_APPROVED' WHERE ...`), no Passport that relies on the
  matrix for any field can reach `ACTIVE`. This is intentional friction —
  the alternative (allowing activation with an `ENGINEERING_REVIEW_
  REQUIRED` marker) was considered and rejected in favor of a hard gate,
  since Phase 1's architecture had enough room to implement the real
  gate rather than a softer flag-only compromise.
- A Passport that supplies explicit `field_applicability` overrides for
  every field the matrix would otherwise resolve can activate
  immediately regardless of matrix review state — this is by design, not
  a loophole: an explicit override is ELIMFILTERS engineering directly
  answering the question the matrix would otherwise answer on its
  behalf.
- `BUSINESS_RULES.md` §3 gains a short pointer to this ADR (the frozen
  v1.0 baseline text itself is not altered — see that section's note).

---

## ADR-0015 — Manufacturer code generation: cryptographically random, retry-on-collision, permanent, never reused

**Date:** 2026-07-13
**Status:** Accepted
**Scope:** Phase 2 implementation detail. Does not alter the frozen Phase 0
or Phase 1 v1.0 baselines — this resolves the open question `PLATFORM_
ARCHITECTURE.md` §7 already carried forward ("exact `EFM-XXXX` code
generation scheme").

**Context:** ADR-0006 mandated `manufacturer_code` in the format
`EFM-XXXX` as the permanent, confidential functional key for a
Manufacturer, but did not specify the generation algorithm. A sequential
or name-derived code would leak information (approximate registration
order, or the plant's identity) through the code itself, defeating the
confidentiality purpose ADR-0006 established.

**Decision:**
1. The four-character suffix is drawn from a 32-character alphabet that
   excludes visually ambiguous characters: `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`
   (digits `0`/`1` and letters `I`/`O` removed). This gives 32⁴ =
   1,048,576 possible codes — far beyond any realistic manufacturer count.
2. Each candidate is generated using `node:crypto`'s `randomInt` (a
   cryptographically strong RNG), never `Math.random()` or a counter — so
   a code is not trivially predictable from registration order or time.
3. Generation happens **only** on the server, at manufacturer creation.
   The create endpoint ignores any client-supplied `manufacturer_code`
   entirely — there is no code path by which a caller can set it.
4. On a `UNIQUE` constraint violation for `manufacturer_code`
   specifically (vanishingly unlikely given the keyspace, but handled
   correctly regardless), the service retries with a new random
   candidate, up to 5 attempts, before raising an internal error.
5. `manufacturer_code` is immutable after creation, enforced by a
   database trigger (`prevent_manufacturer_code_change`) that raises an
   error on any `UPDATE` that would change it — not merely an
   application-layer convention.
6. A `RETIRED` manufacturer's row, and therefore its `manufacturer_code`,
   is **never deleted**. Because the `UNIQUE` constraint applies to the
   full table regardless of `status`, a retired code can never be
   reissued to a different manufacturer — no separate "used codes" table
   is needed to enforce non-reuse.
7. The stored format is enforced by `CHECK (manufacturer_code ~
   '^EFM-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$')`. Because the character
   class only contains uppercase letters and digits, this `CHECK` alone
   guarantees canonical-case storage — a plain `UNIQUE` constraint on the
   column is therefore sufficient for case-insensitive uniqueness; no
   separate `UPPER()`-expression index is needed.

**Consequences:**
- `ebp/phase2/efm-code.js` implements generation and the format constant;
  `ebp/phase2/repository.js`/`service.js` implement the retry loop and
  rely on the DB `CHECK`/`UNIQUE`/trigger as the ultimate guarantee, not
  just application discipline.
- Tests must prove the trigger fires (an `UPDATE` attempting to change
  `manufacturer_code` is rejected) and that the retry path is exercised
  (a forced collision is retried and eventually succeeds).

---

## ADR-0016 — Manufacturer qualifications reuse Phase 1's product_category/product_subtype vocabulary; no parallel taxonomy

**Date:** 2026-07-13
**Status:** Accepted

**Context:** `BUSINESS_RULES.md` §4 already requires a Manufacturer's
qualified families to be "a subset of families defined in the Product
Engineering Passport taxonomy (Phase 1)." Phase 1 itself does not
maintain a separate taxonomy *table* — `product_category`/
`product_subtype` are validated free-text fields whose real vocabulary is
whatever values appear in Passports and the `ebp_field_applicability_
matrix` (see `phases/phase-01-product-engineering-passport.md`). Phase 2
needs a family reference for qualifications and capabilities and must not
invent a second, competing taxonomy.

**Decision:**
1. `ebp_manufacturer_qualifications.product_category` /
   `product_subtype` are the same free-text-but-validated fields, using
   the identical vocabulary convention as `ebp_engineering_passports`
   (Phase 1) — not a foreign key to a new taxonomy table (none exists to
   reference) and not a Phase-2-local enum.
2. No `ebp_manufacturer_families` or similar lookup table is created.
   Consistency between Phase 1's and Phase 2's vocabularies is a
   documentation/process discipline (both reference the same category/
   subtype strings), the same discipline Phase 1 already relies on for
   its own applicability matrix.
3. A qualification may exist for a `(product_category, product_subtype)`
   pair before any Passport for that pair exists (a Manufacturer can be
   pre-qualified for a family ELIMFILTERS plans to launch) — qualification
   is therefore not FK-constrained against `ebp_engineering_passports`.

**Consequences:**
- If Phase 1 or a later phase ever introduces a real taxonomy table, this
  ADR is superseded and both Phase 1's and Phase 2's category/subtype
  columns would migrate to reference it together, not independently.
- The "family taxonomy mismatch" risk already flagged in the original
  Phase 2 draft is addressed structurally by `ebp_manufacturer_
  qualification_conditions` (ADR-0017), which lets a qualification narrow
  a broad family with a precise, structured dimensional/technical scope
  instead of needing ever-finer-grained category/subtype strings.

---

## ADR-0017 — Qualification conditions are structured rows, not free text

**Date:** 2026-07-13
**Status:** Accepted

**Context:** `CONDITIONAL` qualification status (Phase 2) and Manufacturer
status (also `CONDITIONAL`) require a specific, checkable condition — e.g.
"qualified for OIL/SPIN_ON only up to 120mm outer diameter." A free-text
condition field cannot be programmatically checked by a later phase (e.g.
Phase 4's Engineering Compliance Validation checking "is this Manufacturer
CONDITIONAL-satisfied for this SKU"), which the project's own frozen
`BUSINESS_RULES.md` §4 already anticipates as a requirement.

**Decision:**
1. `ebp_manufacturer_qualification_conditions` stores one row per
   condition, with a `condition_type` drawn from a fixed enum
   (`MAX_OUTER_DIAMETER_MM`, `MAX_HEIGHT_MM`, `CONSTRUCTION_TYPE`,
   `ALLOWED_MATERIAL`, `APPROVED_TECHNOLOGY`, `LOCATION_RESTRICTED`,
   `INITIAL_SAMPLE_REQUIRED`, `MIN_MONTHLY_CAPACITY`) and a `parameters`
   `JSONB` payload whose shape is documented per `condition_type` in
   `phases/phase-02-manufacturer-registry.md`.
2. Each condition row carries its own `is_satisfied` boolean and
   `satisfied_at` timestamp, so "is this qualification's condition
   currently met" is a direct, indexable query — not a text-parsing
   exercise for a future phase.
3. Free-text `notes` remains available per condition for human context,
   but is never the sole record of what the condition actually requires.

**Consequences:**
- A future phase (4 or 5) checking "is this Manufacturer `CONDITIONAL`-
  satisfied for this Passport" can query structured condition rows
  directly instead of parsing prose — this ADR is what makes that
  frozen-`BUSINESS_RULES.md`-§4 requirement actually implementable.
- Adding a new `condition_type` in the future is an additive `CHECK`-
  constraint change, not a schema redesign.

---

## ADR-0018 — Locations model the manufacturer's physical facilities and addresses; qualifications bind to a specific location

**Date:** 2026-07-13
**Status:** Accepted

**Context:** A corporate Manufacturer entity is not itself a production
site — its factories are. Storing a single flat "address" on
`ebp_manufacturers` would either force an arbitrary choice of "the"
address for a multi-plant manufacturer, or duplicate address data once a
proper Locations entity also exists. The Phase 2 request explicitly
requires that "production qualification must be associable with a
concrete physical location, not only the corporate manufacturer."

**Decision:**
1. `ebp_manufacturers` carries no flat address field. A manufacturer's
   address(es) are represented entirely by its `ebp_manufacturer_
   locations` rows (one of which is typically `HEADQUARTERS`).
2. `ebp_manufacturer_qualifications.location_id` is `NOT NULL` — a
   qualification always names the specific facility qualified, never
   only the corporate manufacturer. `ebp_manufacturer_certifications.
   location_id` is nullable (a certification may cover the whole
   corporate entity or one specific site).
3. Referential integrity between a qualification/certification's
   `location_id` and `manufacturer_id` is enforced at the database level
   via a composite foreign key: `ebp_manufacturer_locations` carries a
   `UNIQUE (id, manufacturer_id)` constraint, and
   `ebp_manufacturer_qualifications`/`ebp_manufacturer_certifications`
   reference `(location_id, manufacturer_id)` together — a location
   belonging to a *different* manufacturer can never be attached, and
   this is a real constraint violation, not an application-layer check
   that could be bypassed by a direct write.

**Consequences:**
- `phases/phase-02-manufacturer-registry.md`'s "Locations" section
  documents this as the sole address model; "Manufacturer Master Record"
  documents the deliberate absence of a flat address field, referencing
  this ADR so the omission is not mistaken for an oversight.
- Regression tests must prove the composite FK rejects a
  location/manufacturer mismatch.

---

## ADR-0019 — Certification validity is computed at read time, never trusted from a possibly-stale stored status alone

**Date:** 2026-07-13
**Status:** Accepted

**Context:** A certification's `status` column records the last human
action (`VERIFIED`, `REJECTED`, etc.), set at a point in time. Without a
scheduled job, a certification verified as `VERIFIED` on issuance would
continue reading as `VERIFIED` in the raw table indefinitely after its
`expires_on` date passes — exactly the "an expired certification must not
keep appearing as currently verified" failure the Phase 2 request
prohibits. Phase 0/1's stack has no background job infrastructure today
(`PLATFORM_ARCHITECTURE.md` §7, still an open item).

**Decision:**
1. `ebp_manufacturer_certifications.status` remains the human-set audit
   value (what was decided, and when) — it is never silently rewritten by
   a read.
2. A SQL view, `ebp_manufacturer_certifications_effective`, computes
   `effective_status`: `EXPIRED` whenever `status = 'VERIFIED'` and
   `expires_on < CURRENT_DATE`, otherwise equal to `status`.
3. Every code path that needs to know "is this certification currently
   valid" (Phase 2's own DTOs, and any future phase checking
   certification validity as part of a qualification decision) reads
   `effective_status` from this view — never the raw `status` column for
   that purpose.
4. A future phase may add a scheduled job that physically transitions
   `status` to `EXPIRED` with a proper status-history-style record; that
   would be an optimization for reporting/query-plan reasons, not a
   correctness requirement, since the view already guarantees correctness
   at read time without one.

**Consequences:**
- `ebp/phase2/repository.js` exposes a `fetchCertificationsEffective`
  function backed by the view; no other repository function is used to
  answer "is this certification valid right now."
- Tests must prove a `VERIFIED` certification with a past `expires_on`
  reads `effective_status = 'EXPIRED'` through the view while its raw
  `status` column is unchanged.

---

## ADR-0020 — Manufacturer status is a strict state machine; suspension always requires re-review to reactivate, retirement is terminal

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The Phase 2 request requires that "no arbitrary status
changes" be permitted and that every transition be logged. Left
undefined, an implementation could allow any status to move to any other
status (e.g., `SUSPENDED` silently back to `QUALIFIED` with no re-review),
undermining the reason a suspension happened in the first place.

**Decision:** The only valid transitions for `ebp_manufacturers.status`
are:

```
CANDIDATE     → UNDER_REVIEW, RETIRED
UNDER_REVIEW  → CANDIDATE, CONDITIONAL, QUALIFIED, RETIRED
CONDITIONAL   → UNDER_REVIEW, QUALIFIED, SUSPENDED, RETIRED
QUALIFIED     → SUSPENDED, RETIRED
SUSPENDED     → UNDER_REVIEW, RETIRED
RETIRED       → (terminal — no outbound transition)
```

Notably: `SUSPENDED` can **never** transition directly back to
`QUALIFIED` or `CONDITIONAL` — reactivation always passes through
`UNDER_REVIEW` first, so a suspension's underlying issue is re-assessed,
not silently waived. `RETIRED` is terminal: a retired Manufacturer is
never reactivated under the same `manufacturer_code`; a real-world plant
that returns after retirement is registered as a new Manufacturer with a
new code (consistent with ADR-0015's non-reuse guarantee) — this is a
deliberate choice, not a limitation of the model, since a `RETIRED` row's
history should not silently resume as if nothing happened.

Every transition, valid or attempted, records: `from_status`,
`to_status`, `reason`, `declared_actor`, `identity_mechanism`,
`changed_at`, and an optional `evidence_reference` — an invalid-transition
attempt is rejected before any row is written, not logged as a failed
mutation.

**Consequences:**
- `ebp/phase2/validation.js` encodes this transition table as the single
  source of truth; `service.js`'s status-change function consults it
  before writing, never allows the caller to bypass it via a generic
  field-update endpoint.
- Manufacturer Qualification status (`ebp_manufacturer_qualifications.
  status`: `CANDIDATE`/`CONDITIONAL`/`QUALIFIED`/`SUSPENDED`/`REVOKED`)
  follows an analogous, separately-encoded transition table, with
  `REVOKED` (not `RETIRED`) as its terminal state, since revoking one
  family qualification does not retire the whole Manufacturer.

---

## ADR-0021 — Manufacturer Registry confidentiality: every new entity gets an explicit internal-only DTO; no distributor-facing projection exists in Phase 2

**Date:** 2026-07-13
**Status:** Accepted — **extends** ADR-0006's confidentiality principle to
the new entities Phase 2 introduces.

**Context:** ADR-0006 established that manufacturer identity, `EFM-XXXX`,
FOB, margin, and confidential engineering must never reach a Distributor,
enforced at the data-shape level. Phase 2 introduces several new
sub-entities (contacts, locations, certifications, capabilities,
qualifications, internal notes) that did not exist when ADR-0006 was
written and that are at least as sensitive as the fields ADR-0006 already
named.

**Decision:**
1. Every Phase 2 read path is served by an explicit
   `toInternalManufacturerDTO`-style projection — never a generic
   `SELECT *`/`row_to_json` serialization exposed directly to an API
   response. This mirrors the discipline already established for Phase 1
   (ADR-0009).
2. Phase 2 implements **no** Manufacturer/Distributor-facing projection
   at all — there is no live endpoint, and no DTO function, that a future
   Phase 3 (Factory Portal) or Phase 8 (Distributor Portal) could
   accidentally wire up today. When those phases are built, they define
   their own explicit, reviewed projection against this schema; Phase 2
   does not pre-build one, so there is nothing half-finished to misuse.
3. `ebp_manufacturers.internal_notes` is explicitly documented as
   ELIMFILTERS-internal only, following the same pattern as Phase 1's
   `internal_engineering_notes` (ADR-0009) — never returned to any
   non-internal consumer, and excluded from any future Manufacturer- or
   Distributor-facing projection by default (an allow-list, not a
   deny-list, per the discipline `PLATFORM_ARCHITECTURE.md` §6 already
   requires).

**Consequences:**
- `ebp/phase2/dto.js` contains exactly one exported projection function
  (`toInternalManufacturerDTO`, plus small child-entity equivalents for
  contacts/locations/certifications/capabilities/qualifications), all
  internal-only, all used by every Phase 2 route.
- Tests must prove that no Phase 2 API response ever includes a field not
  present in its DTO's explicit allow-list (i.e., the route layer never
  falls back to serializing a raw database row).

## ADR-0022 — Phase 2 closure decisions: `registered_on` semantics, certification-validity approval, reference-data validation debt, enum-extension governance

**Date:** 2026-07-13
**Status:** Accepted — recorded at Phase 2's formal approval and freeze
(`APPROVED / FROZEN v1.0`).

**Context:** Phase 2's implementation spec (see `phases/phase-02-
manufacturer-registry.md`, "Risks") flagged `registered_on`'s meaning as an
interpretation, not a confirmed requirement, and left the certification-
validity design, the `country_code`/`timezone` validation depth, and the
governance for extending fixed enums as things a reviewer should either
confirm or challenge before freezing. The project owner reviewed all four
at approval time and closed them explicitly, rather than leaving them as
carried-forward risks into Phase 3.

**Decision:**

1. **`registered_on` semantics (formalized, unambiguous).**
   `ebp_manufacturers.registered_on` means exactly: *the date ELIMFILTERS
   formally incorporated the manufacturer into the Manufacturer Registry.*
   It does **not** mean the manufacturer's founding date, the start of a
   commercial relationship, a qualification date, an approval date, or a
   first-production date. `created_at` remains the technical row-insert
   timestamp; `registered_on` remains the separate business-incorporation
   date and may be backdated at creation for historical records — the two
   fields are never conflated or merged.
2. **Certification validity design — approved as-is.** The computed,
   read-time `ebp_manufacturer_certifications_effective` view (ADR-0019)
   is the final design for Phase 2's certification-validity model. No
   scheduled job/cron is required to flip a stale `status` column. Every
   later phase that reads certification validity **must** read
   `effective_status` from this view (or an equivalent DTO field sourced
   from it) — reading the raw `status` column directly and treating it as
   current validity is a defect, not an acceptable shortcut, in any phase
   from Phase 3 onward.
3. **`country_code`/`timezone` validation — accepted as syntactic-only,
   tracked as controlled debt.** For the MVP, `country_code` is validated
   only against the ISO 3166-1 alpha-2 *format* (`^[A-Z]{2}$`) and
   `timezone` only against a non-empty string expected to be an IANA
   identifier — neither is checked against a real lookup table of actual
   countries or actual IANA zones, so a syntactically valid but
   non-existent value (e.g. `country_code = 'ZZ'`) is currently accepted.
   This gap is registered as controlled technical debt under the tag
   `FUTURE_REFERENCE_DATA_VALIDATION`, to be resolved in a future phase by
   validating against complete ISO 3166 / IANA reference tables. It does
   not block Phase 2's freeze. No document or code comment may describe
   the current check as verifying real-world existence — it verifies
   format only.
4. **Enum extension governance.** The fixed `CHECK`-constrained enums
   introduced in Phase 2 (`ebp_manufacturers.status`,
   `ebp_manufacturer_qualifications.status`,
   `ebp_manufacturer_qualification_conditions.condition_type`,
   `ebp_manufacturer_capabilities.capability_type`,
   `ebp_manufacturer_capabilities.review_status`,
   `ebp_manufacturer_certifications.status`, and any future Phase 2+
   enum-shaped `CHECK` constraint) may only ever be extended by all four
   of: (1) a documentation update to the relevant phase spec and/or
   `BUSINESS_RULES.md`, (2) a new ADR explaining why the new value is
   needed and what it means, (3) a real migration adding the value to the
   `CHECK` constraint, and (4) new/updated tests covering the added value.
   Free-form/arbitrary enum values are never accepted at the application
   layer as a workaround — this is the same discipline already applied to
   Phase 1's `duty`/`packaging_class` enums, extended explicitly to every
   Phase 2 enum.

**Consequences:**
- `phases/phase-02-manufacturer-registry.md`'s data-model section
  documents `registered_on`'s meaning as authoritative and unambiguous,
  replacing the prior "implementation note: interpreted as..." hedge.
- The "Risks" section of that same document is updated: the
  `registered_on` risk is closed (resolved by this ADR); the
  `country_code`/`timezone` risk is reclassified from an open risk to
  tracked debt under `FUTURE_REFERENCE_DATA_VALIDATION`; the
  `condition_type` enum-growth risk is closed by this ADR's governance
  rule (it was already the de facto practice, now formally required for
  every Phase 2 enum, not just `condition_type`).
- No code change was required by this ADR — Phase 2's implementation
  already matched all four decisions; this ADR formalizes and closes them
  as part of the freeze rather than leaving them as carried-forward risk
  language.

## ADR-0023 — Factory user authentication resolves ADR-0002 for Manufacturers only; Distributor auth remains separately undecided

**Date:** 2026-07-13
**Status:** Accepted

**Context:** ADR-0002 left Manufacturer and Distributor authentication
both undesigned. Phase 3 is the first module with real external users
(factory staff), and the project owner explicitly prohibited exposing it
behind the shared `ADMIN_KEY`. A real identity system is required now;
Phase 8's Distributor auth remains a separate, later decision — the two
audiences have different tiers, different data exposure, and no reason to
share a design just because both are "external."

**Decision:**
1. **New tables**, additive, no change to any Phase 1/2 table:
   `ebp_factory_users` (one row per factory staff member, scoped to a
   `manufacturer_id`), `ebp_factory_user_invitations` (invite/reset
   tokens, hashed), `ebp_factory_sessions` (opaque bearer session tokens,
   hashed), `ebp_factory_user_audit_log` (append-only auth event log).
2. **Password hashing:** Node's built-in `crypto.scrypt` (N=16384, r=8,
   p=1, 64-byte derived key, random 16-byte salt per user), not a new
   dependency — no `bcrypt`/`argon2` package is added. The stored format
   is `scrypt$<salt-hex>$<hash-hex>` so the algorithm is self-describing
   and could be swapped later without a full-table migration.
3. **Sessions, not JWTs.** On successful login the server generates a
   32-byte random token via `crypto.randomBytes`, returns the raw token
   to the client exactly once, and stores only its SHA-256 hash in
   `ebp_factory_sessions.token_hash`. A stolen database backup alone can
   never yield a usable session token. Sessions carry `expires_at` (fixed
   TTL, no silent infinite renewal), `revoked_at` (explicit revocation
   sets this, the row is never deleted — audit trail preserved), and
   `last_used_at`. No JWT library is added; there is nothing here a JWT
   would do better (no cross-service verification need, no stateless
   requirement) and a JWT would remove the ability to revoke a single
   session server-side without a blocklist, which opaque tokens give for
   free.
4. **Roles** are a fixed `CHECK`-constrained enum on `ebp_factory_users
   .role`: `MANUFACTURER_ADMIN`, `MANUFACTURER_ENGINEERING`,
   `MANUFACTURER_COMMERCIAL`, `MANUFACTURER_READ_ONLY`. Authorization is
   enforced **server-side only**, on every factory-facing route, never by
   hiding a frontend option — the same discipline `PLATFORM_ARCHITECTURE
   .md` §6 already requires for internal roles (ADR-0011).
5. **Tenant isolation is structural, not a filter the caller must
   remember.** Every factory-facing repository/service function takes the
   authenticated session's `manufacturer_id` as a mandatory parameter and
   scopes every query to it — there is no factory-facing function that
   can be called without a manufacturer scope, mirroring the composite-FK
   discipline ADR-0018 already established for Phase 2 (a batch item,
   offer, or document belonging to Manufacturer A can never be returned
   to a session authenticated as Manufacturer B, checked in the query
   itself, not only in the response filter).
6. **Account lifecycle:** `INVITED` (created by ELIMFILTERS admin, no
   password set yet) → `ACTIVE` (password set via a one-time, hashed,
   expiring invite token) → `LOCKED` (automatic, after 5 consecutive
   failed logins, `locked_until` set) → back to `ACTIVE` on a successful
   password reset, or → `DISABLED` (permanent, admin-set, blocks login
   regardless of password). Password reset reuses the same hashed-token
   mechanism as invitation, distinguished by `purpose`.
7. **Zero new npm dependencies for auth.** `crypto` (password hashing,
   token generation, hashing) is Node's standard library.

**Consequences:**
- The internal ELIMFILTERS surface (`/api/ebp/internal/manufacturer-
  batches/*`) continues to use `requireAdmin` (`ADMIN_KEY`), unchanged.
  The factory-facing surface (`/api/ebp/factory/*`) uses a new
  `requireFactorySession` middleware that resolves the bearer token to a
  live, unexpired, unrevoked `ebp_factory_sessions` row and attaches
  `{ factory_user_id, manufacturer_id, role }` to the request — the two
  surfaces never share a middleware or a trust boundary.
- Distributor authentication (Phase 8) is **not** resolved by this ADR
  and remains its own open decision — ADR-0002 stays partially open for
  that audience.
- Tests must prove cross-tenant isolation explicitly: a session
  authenticated as Manufacturer A requesting Manufacturer B's batch,
  offer, or document by ID returns `404` (never `403` with a body that
  confirms the resource exists — existence itself is not disclosed across
  tenants), and every factory-facing endpoint returns `401` with no
  session and `403` for a role lacking the required permission.

## ADR-0024 — Manufacturer Request Batch purpose classifies eligibility; only PRODUCTION_CANDIDATE requires QUALIFIED/CONDITIONAL status

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The project owner requires that a batch never be sent to a
`SUSPENDED`/`RETIRED` Manufacturer, and never to one unqualified for the
included families — "salvo que el lote esté explícitamente marcado como
evaluación de capacidad y no como solicitud productiva." This means
eligibility is not a single global rule; it depends on what the batch is
*for*.

**Decision:** Every `ebp_manufacturer_request_batches` row carries a
mandatory `purpose`, one of three values, each with its own eligibility
gate enforced in `ebp/phase3/service.js` before a batch may transition
`DRAFT` → `SENT`:
- **`CAPABILITY_ASSESSMENT`** — ELIMFILTERS is probing whether a
  Manufacturer *could* produce a family it is not yet qualified for
  (typically while the Manufacturer is still `CANDIDATE` or
  `UNDER_REVIEW` in Phase 2). Eligibility gate: the Manufacturer must not
  be `SUSPENDED` or `RETIRED`. No family-qualification check is applied —
  that is precisely what this batch type exists to establish.
- **`COMMERCIAL_QUOTATION`** — ELIMFILTERS wants pricing/terms without
  yet committing to a production relationship. Eligibility gate: the
  Manufacturer must not be `SUSPENDED` or `RETIRED`. No family-
  qualification check is applied (a quotation is not a production
  commitment).
- **`PRODUCTION_CANDIDATE`** — ELIMFILTERS intends this as a real sourcing
  candidate. Eligibility gate (the strict one, matching the project
  owner's rule verbatim): the Manufacturer must be `QUALIFIED` or
  `CONDITIONAL` (Phase 2, ADR-0020) for **every** product family among the
  batch's assigned Passports, at a location that itself holds that
  qualification (Phase 2's `ebp_manufacturer_qualifications`, scoped by
  `location_id` per ADR-0018) — and must not be `SUSPENDED`/`RETIRED`.
  Any Passport whose family the Manufacturer is not qualified for at any
  location blocks the entire batch from being sent (never silently
  drops that one item).

**Consequences:**
- `ebp_manufacturer_request_batches.purpose` is a `CHECK`-constrained
  enum (`CAPABILITY_ASSESSMENT`, `COMMERCIAL_QUOTATION`,
  `PRODUCTION_CANDIDATE`); no free-form purpose.
- The eligibility gate reads Phase 2's `ebp_manufacturers.status` and
  `ebp_manufacturer_qualifications` tables — read-only, no FK (same
  read-only-reference discipline as ADR-0016's family-vocabulary reuse),
  never written to by Phase 3.
- Tests must cover all three purposes explicitly: a `SUSPENDED`
  Manufacturer is rejected for any purpose; an unqualified `CANDIDATE`
  Manufacturer is accepted for `CAPABILITY_ASSESSMENT`/
  `COMMERCIAL_QUOTATION` but rejected for `PRODUCTION_CANDIDATE`; a
  `QUALIFIED` Manufacturer is accepted for all three.

## ADR-0025 — Batch Items pin an immutable snapshot of the exact Passport revision and its Manufacturer-visible content

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The project owner requires that "una revisión posterior del
PEP no debe cambiar silenciosamente un lote ya enviado." Phase 1's
Passport is versioned (`engineering_revision`, ADR from Phase 1) and a
new `ACTIVE` revision supersedes the prior one — if a Batch Item merely
stored a live reference to "the current Passport for this SKU," a later
Phase 1 revision would silently change what an already-sent batch shows
a Manufacturer, and — worse — change what an already-*submitted* Offer
is implicitly being evaluated against.

**Decision:** `ebp_manufacturer_request_batch_items` stores three
things, all fixed at the moment the item is added to a `DRAFT` batch and
never recomputed afterward:
1. `passport_id` + `engineering_revision` — a real foreign key to the
   specific `ebp_engineering_passports` row (not "the SKU," the exact
   revision), `ON DELETE RESTRICT` (Phase 1 never hard-deletes Passports,
   so this can never actually block a Phase 1 write, but the constraint
   exists in case that ever changes).
2. `manufacturer_visible_snapshot JSONB` — the **exact** output of Phase
   1's `toManufacturerPassportDTO(row)` (ADR-0009) at snapshot time,
   stored verbatim. This is what the Factory Portal actually renders to
   the Manufacturer — never a live re-fetch of the current Passport —
   so a later Phase 1 revision provably cannot alter what an already-sent
   batch shows.
3. `elimfilters_code` — denormalized for display/search convenience only;
   the authoritative binding is `passport_id` + `engineering_revision`,
   never the code alone (same functional-key discipline as ADR-0006's
   `manufacturer_code` rule, applied here to the Passport reference).

**Consequences:**
- If ELIMFILTERS needs a Manufacturer to respond against a *newer*
  Passport revision, the correct action is a **new Batch** (or a new Batch
  Item) referencing the new revision — never an in-place edit of an
  existing Batch Item's `engineering_revision`. `ebp_manufacturer_
  request_batch_items` has no `UPDATE` path for `passport_id`/
  `engineering_revision`/`manufacturer_visible_snapshot` in the service
  layer (only `status`/`responded_at` are mutable).
- `ebp_manufacturer_offers.engineering_revision` is copied from its
  parent Batch Item at Offer-creation time and is what Phase 4's
  validation binds to (`BUSINESS_RULES.md` §6's "Passport Version ×
  Manufacturer Code × Offer ID × Offer Revision" tuple) — never
  re-derived from a live Passport lookup.
- Tests must prove: creating a new `ACTIVE` Passport revision after a
  batch was sent does not change that batch item's stored snapshot or
  `engineering_revision` on read.

## ADR-0026 — Offer identity: versioning keyed on (Passport revision, Manufacturer), exact decimal pricing, immutable once SUBMITTED

**Date:** 2026-07-13
**Status:** Accepted — implements ADR-0007's versioning rule and the
project owner's explicit "no `float`" pricing requirement.

**Context:** ADR-0007 (Phase 0) already decided Offers are versioned with
one active revision per (Manufacturer, Passport version). Phase 3 must
turn that into real schema and enforce two things the project owner
added explicitly this round: FOB and all money fields must use an exact
decimal type, never IEEE-754 float, and an Offer must become immutable
the instant it is `SUBMITTED` — any further change is a new revision,
never an in-place edit.

**Decision:**
1. **Versioning key:** the partial unique index enforcing "at most one
   active Offer" is on `(passport_id, engineering_revision,
   manufacturer_id)` **filtered to** `status IN ('SUBMITTED',
   'UNDER_REVIEW', 'VALIDATED')` — not on `batch_item_id`. This matters:
   if the same Manufacturer receives the same Passport revision again in
   a second batch (e.g. a `COMMERCIAL_QUOTATION` re-ask), the lineage
   constraint still applies across both batches, exactly matching
   ADR-0007's "(Manufacturer, Passport version)" wording, not a
   per-batch wording the project owner never stated.
2. **Money fields use `NUMERIC`, never `FLOAT`/`REAL`/`DOUBLE
   PRECISION`.** `fob_price NUMERIC(12,4)`, `tooling_cost NUMERIC(12,2)`,
   `sample_cost NUMERIC(12,2)` — Postgres `NUMERIC` is exact, arbitrary-
   precision decimal, immune to the rounding errors IEEE-754 float
   introduces for currency math. The `pg` driver returns `NUMERIC` values
   as JavaScript strings by default (not `Number`), which the service
   layer preserves end-to-end rather than coercing to a JS float at any
   point before Phase 6 (Cost Engine) does its own, separately-specified,
   decimal-safe arithmetic.
3. **Immutability after `SUBMITTED`:** the service layer's only mutation
   paths for an existing `ebp_manufacturer_offers` row are status
   transitions (`transitionOfferStatus`) and the compliance-status write
   Phase 4 will make on `ebp_manufacturer_offer_technical_fields` — no
   function exists to edit `fob_price`, `moq`, a technical field's
   `offered_value`, or packaging once the parent Offer has left `DRAFT`.
   A correction is always `createOfferRevision`, which supersedes the
   prior active Offer in the same transaction (mirroring Phase 1's
   `activatePassport` atomic-supersession pattern, ADR-precedent from
   Phase 1's row-locked `FOR UPDATE` transaction).
4. **Offer status machine** (nine states, per `BUSINESS_RULES.md` §5):
   `DRAFT → SUBMITTED → UNDER_REVIEW → (VALIDATED | REJECTED)`, `VALIDATED
   → APPROVED` (Phase 4/Offer-Approval territory, not written by Phase 3),
   any active state `→ SUPERSEDED` (only via a new revision's atomic
   supersession write), any state with `expires_at` passed `→ EXPIRED`
   (computed at read time via a view, same ADR-0019 pattern — no
   scheduled job), `DRAFT → WITHDRAWN` or any pre-`APPROVED` active state
   `→ WITHDRAWN` (Manufacturer-initiated). Phase 3 **never** writes
   `VALIDATED` or `APPROVED` itself — those values exist in the `CHECK`
   constraint because they are valid states of the column, but only Phase
   4/Offer-Approval's future service code is permitted to set them; Phase
   3's `transitionOfferStatus` function explicitly rejects any caller
   attempting to set either from Phase 3's own surface.

**Consequences:**
- `ebp_manufacturer_offer_technical_fields` distinguishes `ANSWERED` /
  `CANNOT_MEET` / `NOT_APPLICABLE` completeness explicitly (closing the
  phase-03 draft's own previously-flagged "incomplete Offers" risk) —
  `compliance_status` stays `NULL` until Phase 4 writes it, and Phase 3's
  DTOs never fabricate a default value for it.
- Tests must prove: submitting a second revision correctly flips the
  prior one to `SUPERSEDED` atomically (row-locked transaction, no window
  with zero or two active revisions — same test pattern as Phase 1's
  `activatePassport`); `fob_price` round-trips through Postgres and the
  API as a decimal string, never silently becomes a lossy JS float;
  attempting to edit a `SUBMITTED` Offer's technical fields via the
  service layer throws, and the only path forward is a new revision;
  Phase 3's own routes cannot set `status = 'VALIDATED'` or `'APPROVED'`.

## ADR-0027 — Documents/evidence: metadata in Postgres, binaries on a local-filesystem storage adapter behind an interface, never in the database

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The project owner explicitly prohibits storing binary files
directly in Postgres and explicitly says not to assume a definitive
storage provider if none exists — but to design an adapter and use a
clearly-configured local backend for the MVP, with no publicly reachable
paths.

**Decision:**
1. `ebp_manufacturer_documents` stores metadata only: `id`,
   `manufacturer_id`, optional `batch_id`/`offer_id`/`technical_field_id`
   (nullable FKs, all `ON DELETE RESTRICT` — a document is never silently
   destroyed by deleting its parent), `category` (fixed enum:
   `CERTIFICATION_EVIDENCE`, `TECHNICAL_EVIDENCE`, `COMMERCIAL_DOCUMENT`,
   `EXCEL_IMPORT`, `EXCEL_EXPORT`, `OTHER`), `original_filename` (never
   used as the storage path), `mime_type` (allow-listed at the
   application layer before insert: PDF, PNG, JPEG, and the two Excel
   MIME types only), `size_bytes` (`CHECK 0 < size_bytes <= 26214400`, a
   25 MB ceiling), `sha256_hash` (computed server-side from the actual
   bytes, used for tamper/duplicate detection — never trusted from the
   client), `storage_key` (a server-generated, collision-resistant,
   non-guessable key — `crypto.randomUUID()` plus a manufacturer-scoped
   path prefix — never the original filename or anything derived from
   client input), `review_status` (`UNREVIEWED`/`ACCEPTED`/`REJECTED`).
2. **Storage adapter interface** (`ebp/phase3/storage.js`): `put(key,
   buffer) → void`, `get(key) → Buffer`, `exists(key) → boolean`,
   `remove(key) → void`. The MVP implementation
   (`LocalFilesystemStorageAdapter`) writes under a configurable root
   directory (`EBP_DOCUMENT_STORAGE_ROOT`, defaulting to a path outside
   any `express.static` root and outside `frontend/`, so nothing under it
   is ever served publicly by accident) with the `storage_key` as the
   relative path, one manufacturer-scoped subdirectory per
   `manufacturer_id` for an extra filesystem-level isolation layer beyond
   the DB-level tenant check. Swapping to an object-storage backend later
   (S3-compatible or otherwise) means implementing the same four-method
   interface — no calling code changes.
3. **Upload handling** uses `multer` (Express's own maintained upload
   middleware, from the `expressjs` GitHub org — the one new runtime
   dependency this ADR adds, beyond `exceljs` in ADR-0028) configured
   with `memoryStorage()` (never disk-buffers an unvalidated upload) and
   a `fileSize` limit matching the 25 MB `CHECK`. The service layer
   validates MIME type and size **before** calling `storage.put`, and
   computes the SHA-256 hash from the in-memory buffer before it ever
   touches disk.
4. **No public route ever serves a document by `storage_key` or
   filesystem path.** Every document download goes through an
   authenticated, tenant-scoped route (`GET /api/ebp/internal/.../
   documents/:id/download` or the factory-facing equivalent) that
   resolves `:id` → `storage_key` via the DB (checking the caller's
   tenant scope first) and streams the adapter's `get()` result — the
   `storage_key` itself is never returned in any API response body.

**Consequences:**
- New dependencies added this phase: `multer` (upload parsing) and
  `exceljs` (ADR-0028) — both documented here and in `CHANGELOG.md`,
  per the project owner's explicit "documenta cualquier dependencia
  nueva" instruction. No other new dependency is added.
- Tests must prove: an upload exceeding 25 MB or an unlisted MIME type is
  rejected before `storage.put` is ever called; a document's
  `storage_key` never appears in a JSON response; a factory session for
  Manufacturer A requesting Manufacturer B's document (by guessed/
  enumerated ID) gets `404`; the local storage root is not inside any
  directory Express serves statically.

## ADR-0028 — Excel export/import: `exceljs`, staged validation before persistence, tamper-evident template hash, no partial writes

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The project owner requires a full Portal-or-Excel dual flow
with locked vs. editable columns, protected identifiers, a template
version, a hash/signature to detect the wrong or a manipulated file, a
staging → preview → validate → confirm import sequence, per-row/per-field
error reporting, and an explicit prohibition on silent partial updates.

**Decision:**
1. **Library: `exceljs` (MIT license, actively maintained), not `xlsx`
   (SheetJS)**, chosen specifically because `xlsx`'s community/free build
   has had known prototype-pollution advisories in its parsing path and
   `exceljs` has a materially cleaner security history for parsing
   externally-supplied `.xlsx` files (the highest-risk operation here is
   parsing a file a Manufacturer uploads, not generating one ELIMFILTERS
   controls) — this is a security-motivated choice, not a convenience
   one, and is recorded here as required by the project owner.
2. **Export (`ebp/phase3/excel.js`, `buildBatchWorkbook`):** one workbook
   per Batch. Locked columns (Passport identification, `required_*`
   values, instructions) are written to cells with `sheet.protect()`
   applied and those specific cells left unlocked=false (Excel's native
   cell-protection, which is a UX guard, not a security boundary — see
   point 4). Editable columns (`offered_*`, commercial fields, packaging)
   are left unlocked. A hidden, protected sheet (or hidden columns)
   carries: `batch_id`, `manufacturer_id`, each row's `batch_item_id`,
   `template_version`, and a SHA-256 hash of the locked-column content
   computed at export time. The visible template version and a short
   human-readable batch code are also shown in a visible header cell.
   The exported file itself is recorded as an `ebp_manufacturer_documents`
   row with `category = 'EXCEL_EXPORT'`.
3. **Import (`importBatchWorkbook`) is a four-stage pipeline, matching
   the project owner's explicit sequence, and never persists partially:**
   - **Stage 1 — Parse to staging (in-memory only, nothing written to
     Postgres yet):** read the hidden metadata sheet, recompute the
     locked-column hash from the file's own visible locked cells, and
     compare it to the stored hash. A mismatch means either wrong
     template version or a manipulated locked cell — the entire import
     is rejected before any row is evaluated, with a single top-level
     error, not per-row noise.
   - **Stage 2 — Row-level validation:** every data row is checked
     against the same `validation.js` rules the Portal path uses (so
     Portal and Excel can never diverge in what counts as a valid
     Offer) — type checks, required-field completeness (`ANSWERED`/
     `CANNOT_MEET`/`NOT_APPLICABLE` per ADR-0026), decimal parsing for
     price fields (parsed via a strict decimal-string parser, never
     `parseFloat`, to preserve ADR-0026's no-float rule end to end).
     Every failing row/field is collected into a structured error list —
     the pipeline does not stop at the first error.
   - **Stage 3 — Preview:** if Stage 2 produced zero errors, the fully
     parsed, would-be Offer payload (one per row/`batch_item_id`) is
     returned to the caller as a preview — still nothing written.
   - **Stage 4 — Confirm:** only an explicit, separate `POST .../
     confirm` call (carrying the same staging token from Stage 3)
     actually calls `service.createOfferRevision` for each row, inside
     one transaction per Offer (each Offer's own atomic-supersession
     transaction, per ADR-0026) — if any single row's confirm-time write
     fails, only that row's transaction rolls back; rows that already
     committed are not retroactively undone (each row is an independent
     Offer, so this is correct, not a partial-write violation — the
     violation the project owner is guarding against is a *single row*
     ending up half-written, which the per-row transaction already
     prevents).
   - A confirmed import's resulting Offers always land in `DRAFT` or
     `SUBMITTED` — never any validated/approved state — matching
     "nunca como validado" exactly, and mirroring ADR-0026's rule that
     Phase 3 never writes `VALIDATED`/`APPROVED` regardless of channel.
4. **Excel's native sheet-protection is UX, not security.** The staging
   pipeline's hash check (point 3, Stage 1) is the real tamper boundary —
   it does not trust that a locked cell was actually uneditable
   client-side (any user can unprotect an `.xlsx` sheet trivially); it
   independently verifies the locked content against the stored hash
   server-side.
5. **No update path exists for re-importing over an already-`SUBMITTED`
   Offer.** A re-import for a `batch_item_id` that already has an active
   Offer creates a new revision (ADR-0026), exactly as the Portal path
   would — Excel is one more channel producing the same Offer lifecycle,
   never a shortcut around it.

**Consequences:**
- `exceljs` is added to `package.json` (documented here, in ADR-0027, and
  in `CHANGELOG.md`).
- Tests must cover: a valid import round-trip (export → edit → import →
  confirm), an import with a `batch_id` that does not match the file
  (wrong template — rejected at Stage 1), an import where a locked
  column's content was altered (hash mismatch — rejected at Stage 1), an
  import with an invalid row (e.g. non-numeric FOB — surfaced as a Stage
  2 per-row error, nothing persisted), and confirmation that a rejected
  import writes zero rows to any `ebp_manufacturer_*` table.

## ADR-0029 — API surface split (internal vs. factory) and the Factory Portal ships as authenticated server-rendered pages under `/portal`, not a new SPA

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The project owner requires the internal and factory-facing
APIs to never mix, and requires the first private frontend surface —
excluded from public navigation/sitemap/indexing, with no anonymous
shared state, SSR-safe (no data leakage via errors or bundles), covering
login/dashboard/product view/offer form/Excel upload. The existing
`frontend/` directory is a separate, already-large Next.js 14 static-
export marketing site (`ELIMFILTERS World Catalogue`) with its own
CLAUDE.md governance, its own build pipeline, and no server-side
rendering or session-auth capability at all (`output: 'export'` static
site) — it is not a viable host for an authenticated, dynamic, per-tenant
portal without a second, unrelated deployment pipeline.

**Decision:**
1. **API surface split (hard boundary, per the project owner's explicit
   instruction):** `/api/ebp/internal/manufacturer-batches/*` (mounted
   behind the existing `adminLimiter` + `requireAdmin`, same as every
   other internal EBP surface) and `/api/ebp/factory/*` (mounted behind a
   new `factoryLimiter` + `requireFactorySession`, ADR-0023). No route
   file is shared between the two mounts; `ebp/phase3/internal.routes.js`
   and `ebp/phase3/factory.routes.js` are separate modules, each importing
   from the same `service.js`/`repository.js` but calling different,
   narrower service functions (the factory routes never call a service
   function that accepts an arbitrary `manufacturer_id` parameter from
   the request — it is always taken from the authenticated session).
2. **Factory Portal frontend ships as server-rendered pages mounted
   directly in `server.js`** (`ebp/phase3/portal.routes.js`, plain HTML
   returned via Express with inline vanilla JS calling the `/api/ebp/
   factory/*` JSON API — no new frontend framework, no new build step, no
   new npm dependency for the UI layer), under the path prefix `/portal`.
   This is the pragmatic MVP choice given the existing stack has no
   dynamic-rendering surface; every page:
   - Requires a valid session cookie (checked server-side before any HTML
     is returned — an unauthenticated request to any `/portal/*` page
     other than `/portal/login` redirects to login, it never renders a
     shell that then discovers it has no data client-side).
   - Sets `<meta name="robots" content="noindex, nofollow">` and is never
     linked from the public Next.js site's navigation, sitemap, or
     `robots.txt` allow rules.
   - Sets the session cookie `HttpOnly`, `Secure` (in production),
     `SameSite=Strict` — never exposes the raw session token to page
     JavaScript.
   - Renders per-request from the authenticated session's own data only
     — no cached/shared HTML fragment between requests, so there is no
     anonymous or cross-tenant shared state.
   - `portal.elimfilters.com` as a distinct subdomain (the project
     owner's stated preference) is a DNS/deployment/reverse-proxy
     decision outside this repository's scope; this ADR only fixes where
     the pages live in code (`/portal/*` on the same `server.js`) — a
     later reverse-proxy or subdomain routing change does not require
     moving this code.
   - Minimum page set: `/portal/login`, `/portal/dashboard` (batch list),
     `/portal/batches/:batch_code` (batch detail + item list),
     `/portal/batches/:batch_code/items/:item_id/offer` (offer form),
     `/portal/batches/:batch_code/excel` (Excel upload/download), plus
     error/empty states for expired session, no batches, and a validation-
     failed Excel import.

**Consequences:**
- No new frontend dependency (React, Vue, a bundler) is introduced for
  the portal; `frontend/`'s Next.js app and its `npm run build` pipeline
  are completely untouched by Phase 3.
- The public Next.js site's `sitemap.xml`/`robots.txt` (already governed
  by root `CLAUDE.md`) are not modified by this phase — `/portal` never
  appears there because it is not served by that app at all.
- Tests must prove: an unauthenticated `GET /portal/dashboard` redirects
  to `/portal/login` rather than rendering; every `/portal/*` response
  includes the `noindex, nofollow` meta tag; the session cookie is
  `HttpOnly`.

## ADR-0030 — Excel staging is persisted in Postgres, never process-local memory

**Date:** 2026-07-13
**Status:** Accepted

**Context:** ADR-0028 shipped the Excel stage/confirm pipeline with a
process-local in-memory `Map` (`ebp/phase3/staging.js`), flagged in the
original phase doc as an accepted MVP trade-off. During the mandatory
pre-freeze correction round, the project owner required this to no longer
be the frozen policy: a process restart, redeploy, or multi-instance
deployment must not silently lose a Manufacturer's staged (but not yet
confirmed) Excel upload.

**Decision:**
1. `migrations/ebp-phase3/002_excel_staging.sql` adds
   `ebp_manufacturer_excel_staging`: `id` (the staging token itself),
   `manufacturer_id`, `factory_user_id`, `batch_id`, `workbook_hash`,
   `preview_json`, `errors_json`, `status`
   (`STAGED`/`CONSUMED`/`EXPIRED`), `created_at`, `expires_at`,
   `consumed_at`.
2. `staging.take(pool, stagingId, batchId, manufacturerId)` consumes in a
   single atomic statement: `UPDATE ... SET status = 'CONSUMED', consumed_at
   = NOW() WHERE id = $1 AND batch_id = $2 AND manufacturer_id = $3 AND
   status = 'STAGED' AND expires_at > NOW() RETURNING preview_json`. There
   is no separate SELECT-then-UPDATE step, so two concurrent confirm
   requests for the same staging id can never both succeed. Tenant
   isolation (`batch_id`/`manufacturer_id`) is enforced in the same
   statement, not as a follow-up check.
3. `staging.peek(pool, ...)` is a read-only variant (used by the Portal's
   review screen, which must render the staged result without consuming
   it — confirmation is a separate, explicit user action).
4. A 15-minute TTL (`STAGING_TTL_MS`) is enforced at read time
   (`expires_at > NOW()`); expired rows are never confirmable. A future
   scheduled job may `DELETE`/mark `EXPIRED` rows past their TTL for
   table hygiene, but correctness never depends on that job running.
5. Malformed (non-UUID) staging ids are rejected by a regex guard before
   ever reaching Postgres, so a client-supplied garbage value returns the
   same "not found" result a well-formed-but-unknown id would, rather than
   letting Postgres's own `22P02` invalid-input error surface as a raw
   500 (ADR-0033-adjacent discipline, see the error-sanitization work in
   this same correction round).

**Consequences:**
- Restarting the Node process no longer loses any Manufacturer's
  in-progress Excel staging — verified by a regression test that opens a
  brand-new `Pool` (simulating a fresh process with zero shared in-memory
  state) and successfully reads a row written via the original pool.
- A staged upload can still only ever be confirmed exactly once, and only
  by the same manufacturer/batch it was staged against — verified by
  test (mismatched batch/manufacturer, expired row, already-consumed row
  all rejected).
- `ebp/phase3/staging.js`'s public function signatures
  (`put`/`take`/`peek`) are unchanged from the original in-memory version
  except for now taking `pool` as their first argument — `factory.routes
  .js` and `portal.routes.js` required no structural changes beyond that.

## ADR-0031 — Batch `OVERDUE` is a centralized, read-time computed status; no cron job is required or assumed

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The original Phase 3 phase doc honestly flagged, as an
acknowledged risk, that `OVERDUE` was never automatically computed: a
Batch whose `response_due_at` had passed stayed in whatever status it was
last explicitly set to, until an admin (or a future scheduled job this
stack does not have) called the status-transition endpoint directly. The
project owner required this fixed, explicitly ruling out a cron job as
mandatory and instead requiring a centralized effective-status semantics,
mirroring the pattern Offers already use
(`ebp_manufacturer_offers_effective`, ADR-0019).

**Decision:**
1. `migrations/ebp-phase3/003_batch_effective_status.sql` adds
   `ebp_manufacturer_request_batches_effective`, a `CREATE OR REPLACE
   VIEW` over the base table: `effective_status = 'OVERDUE'` whenever
   `status NOT IN ('RESPONDED','CLOSED','CANCELLED')` and
   `response_due_at IS NOT NULL AND response_due_at < NOW()`; otherwise
   `effective_status = status`.
2. Every read path is rewired through this view, not the base table:
   `repository.fetchBatchByCode`, `fetchBatchByCodeForManufacturer`,
   `lockBatchByCode`, and `listBatches` (including its `status` filter,
   which now matches against `effective_status`); `dto.toInternalBatchDTO`
   exposes `effective_status` explicitly; `portal.routes.js`'s dashboard
   and batch-detail pages display `effective_status` in preference to the
   raw stored `status`. No other code path computes `OVERDUE`
   independently — this is enforced by convention (the base table's
   `status` column is never read directly outside `repository.js` and the
   view definition itself) and verified by test.
3. The stored `status` column remains the actual state-machine value and
   is still the target of every explicit transition
   (`transitionBatchStatus`); `effective_status` is a projection, never a
   second source of truth requiring its own writes or its own state
   machine.
4. `LATE_SUBMISSION` on an Offer (already existing since ADR-0026)
   continues to be calculated and persisted at the moment a response is
   actually received after `response_due_at` — this ADR only changes how
   `OVERDUE` is *read*, not how lateness is recorded on the Offer itself.

**Consequences:**
- No scheduled job is required for `OVERDUE` to be correct at any read;
  it is impossible for two different screens/endpoints to disagree about
  whether a Batch is overdue, since there is exactly one place that
  computes it.
- Verified by a regression test suite covering: `SENT` past-due →
  `OVERDUE`; `PARTIALLY_RESPONDED` past-due → `OVERDUE`; `RESPONDED`
  past-due → stays `RESPONDED` (never `OVERDUE` once actually answered);
  `CLOSED`/`CANCELLED` past-due → stay as-is (terminal states are never
  reclassified); `NULL response_due_at` → never `OVERDUE`.
- `SELECT ... FOR UPDATE` continues to work through this view (verified
  empirically), so `lockBatchByCode`'s existing row-locking behavior for
  offer supersession required no change.

## ADR-0032 — Offer technical fields are driven by the frozen PEP snapshot, never freely typed; Portal and Excel produce the identical `technical_fields` model

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The original Offer form/API accepted a single freely-typed
`field_name` and `offered_value` pair — a Manufacturer could type any
string as `field_name`, with no guarantee it corresponded to a real,
applicable Passport Engineering Passport (PEP) field, and no mechanism
requiring every applicable field to actually be answered before an Offer
could be submitted. The Excel export mirrored this limitation (one
technical field per Batch Item row). The project owner required a form
generated from the Batch Item's locked PEP snapshot, covering every
applicable field, with the Manufacturer never able to write or alter
`field_name` — and required Portal and Excel to produce exactly the same
`technical_fields` model.

**Decision:**
1. `ebp/phase3/pep-fields.js` — a new, read-only presentation registry
   mapping Phase 1's frozen engineering schema (`ebp_passport_
   engineering` columns) to per-field UI/UX metadata: `field_name` (the
   real Phase 1 column/concept name, never invented), `label`, `unit`,
   `required_value` (read from the snapshot), `required_tolerance`
   (read from the snapshot where applicable), and `applicability`
   (gated by `field_applicability` for fields like `bypass_valve_
   applicability`/`antidrainback_valve_applicability` that do not apply
   to every product). This module never writes to or modifies any Phase
   1 table or type — it is purely a derived, presentation-layer mapping,
   preserving Phase 1's freeze. `getApplicableFields(passportSnapshot)`
   is the single function both the Portal form and `excel.js` call.
2. `validation.validateOfferFieldsAgainstSnapshot(passportSnapshot,
   submittedFields, isSubmit)`, wired into `service.createOfferRevision`:
   rejects any submitted `field_name` that is not in the snapshot's
   applicable-field set (the Manufacturer can supply a value for a real
   field, never invent a new one); when `isSubmit` is true (moving to
   `SUBMITTED`, not saving a `DRAFT`), requires every applicable field to
   have an explicit `completeness_status` of `ANSWERED`, `CANNOT_MEET`,
   or `NOT_APPLICABLE` — an incomplete `DRAFT` remains explicitly allowed,
   matching the project owner's requirement that an offer may be saved
   incomplete but never submitted incomplete.
3. `excel.js` was rewritten so the export expands one row per (Batch Item
   × applicable PEP field) — using the identical `pepFields.
   getApplicableFields()` call the Portal form uses — rather than one row
   per Batch Item. `field_name` is in `LOCKED_COLUMNS` (always
   pre-populated from the snapshot, the Manufacturer never types or
   alters it); `offered_value`/`offered_unit`/`offered_tolerance`/
   `completeness_status`/`manufacturer_note` remain editable per row.
   `parseAndValidateWorkbook` groups rows back by `batch_item_id` into
   the same `{ batch_item_id, fob_price, currency, moq, lead_time_days,
   technical_fields: [...] }` shape `createOfferRevision` expects from
   the Portal path — Excel confirm and Portal submit call the identical
   service function with an identical payload shape; there is no second,
   Excel-only code path that could drift from the Portal's rules.

**Consequences:**
- A Manufacturer can no longer submit an Offer with a fabricated
  `field_name`, nor silently skip an applicable field and still reach
  `SUBMITTED` — verified by test (submission rejected when the four
  applicable fields on the test Passport — media, efficiency, bypass
  valve, anti-drainback valve — are not all answered).
- Portal and Excel are provably the same model: the same fixture Passport
  produces the same four `field_name`s through both paths, and the same
  `service.createOfferRevision` call is exercised either way.
- This is presentation/validation logic layered on top of Phase 1 and
  Phase 3's own existing schemas — no ALTER was made to any Phase 1
  table, and no new Phase 3 column was required to store per-field
  metadata (label/unit/tolerance) since `pep-fields.js` derives it from
  data already present in the snapshot plus a static registry.

## ADR-0033 — CSRF protection for the Factory Portal: session-bound synchronizer token, plus a double-submit cookie for the pre-session login form

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The Factory Portal (`ebp/phase3/portal.routes.js`) authenticates
via an `HttpOnly`/`SameSite=Strict` cookie (ADR-0029), but had no explicit
CSRF protection on any of its state-changing POST actions (offer submit,
Excel stage/confirm, document upload, login, logout). `SameSite=Strict`
alone was not accepted as sufficient by the project owner — it is defense
in depth, not a substitute for an explicit token, given older browsers,
non-navigational cross-scheme requests, and the possibility of a future
cookie-policy change silently removing the only protection. Logout was
also a `GET` route, which is itself a CSRF-adjacent defect (a
state-changing action must never be reachable via a plain link/prefetch).

**Decision:**
1. **Synchronizer token for every authenticated action.** A
   cryptographically random token (`crypto.randomBytes(32).toString
   ('hex')`, `ebp/phase3/csrf.js`) is generated once at login and stored
   on the session row (`ebp_factory_sessions.csrf_token`, migration
   `004_session_csrf_token.sql`) — bound to the session, not to a single
   request. Every server-rendered form (offer submit, Excel upload,
   Excel confirm, logout) embeds it as a hidden `_csrf` field. Every
   state-changing route runs a `verifyCsrf` middleware that compares the
   submitted field against the session's stored token using
   `crypto.timingSafeEqual` (`csrf.csrfTokensMatch`), including a
   constant-time path for a length mismatch so a wrong-length guess does
   not complete faster than a correctly-sized wrong guess. On failure:
   HTTP 403, a generic "could not be verified" message, and the failure
   is never logged with either the submitted or expected token value.
2. **`logout` changed from `GET` to `POST`,** rendered as its own tiny
   form (styled inline to look like a link) rather than an anchor tag —
   it is a state-changing action and must require the same CSRF token as
   any other.
3. **Login's pre-session double-submit cookie.** `POST /portal/login`
   happens before any session exists, so the synchronizer-token pattern
   above does not apply. `GET /portal/login` instead sets a short-lived
   (`Max-Age=600`), `HttpOnly`, `SameSite=Strict` cookie
   (`ebp_login_csrf`) and embeds the identical value as a hidden `_csrf`
   field on the login form. `POST /portal/login` compares the two (still
   via the same timing-safe comparison) before ever touching credentials
   or calling `service.login`; on mismatch it redirects to
   `/portal/login?error=csrf` without revealing whether the submitted
   email/password would otherwise have been valid. This is a standard
   double-submit defense: a cross-site forged form cannot read the
   victim's browser's cookie value (same-origin policy), so it can never
   supply a matching `_csrf` field, even without any client-side
   JavaScript.
4. **Never a second source of truth for the token.** The token is never
   returned by the factory-facing JSON API (`factory.routes.js`) — that
   surface authenticates via a `Bearer` header, which a browser never
   auto-attaches cross-site, so it is not subject to classic CSRF in the
   same way and is out of scope for this ADR by design (the project
   owner's requirement was specifically about "the Factory Portal," the
   cookie-based surface).

**Consequences:**
- Every previously-existing Portal form (offer submit, Excel upload,
  Excel confirm) and the new logout form all carry the token; a request
  missing it, or carrying a mismatched one, is rejected before any
  business logic (offer creation, staging, session revocation) executes.
- Verified by test: valid, missing, and incorrect token cases for both
  the session-bound token (Excel upload/confirm, logout) and the
  pre-session double-submit cookie (login) — twelve dedicated CSRF tests
  in `tests/ebp-phase3/integration.test.js`, plus three pure-function unit
  tests for `csrf.js` itself (`tests/ebp-phase3/unit.test.js`).
- `migrations/ebp-phase3/004_session_csrf_token.sql` backfills any
  pre-existing session row (there should be none in a fresh environment,
  but the migration is safe against a populated one) before making the
  column `NOT NULL`.
- This ADR does not by itself address cookie/session attribute hardening
  (`Secure` outside production, `Path` scoping, session revocation on
  password change) — that is tracked as a separate, subsequent item in
  this same correction round.

## ADR-0034 — Error responses are sanitized end-to-end: known service errors keep their curated message, everything else becomes a generic message plus a correlation id

**Date:** 2026-07-13
**Status:** Accepted

**Context:** Auditing the Factory Portal and factory-facing API for the
pre-freeze correction round found two real leak vectors: (1)
`portal.routes.js`'s offer-submit handler put a caught error's raw
`.message` directly into a redirect query string, later rendered into the
HTML error banner; and (2) both `portal.routes.js`'s and
`factory.routes.js`'s Excel-confirm per-item loops did the same into a
per-item error field (HTML table cell / JSON `item_errors[]`). Since
`service.createOfferRevision` re-throws an unrecognized Postgres error
verbatim in its `catch` block (only a specific `23505`/lineage-conflict
case is translated to a curated `ConflictError`), any other unexpected
database error — a constraint name, a column name, a raw SQL fragment —
could have reached the browser through either path. Separately, no
request/correlation id existed anywhere, so a genuinely generic "internal
error" response gave an admin no way to find the corresponding server log
line for a specific user's report.

**Decision:**
1. **`ebp/phase3/errors.js`** is the single place this logic lives:
   `isKnownServiceError(err)` recognizes `service.js`'s four thrown error
   classes (`ValidationError`/`NotFoundError`/`ConflictError`/
   `UnauthorizedError`) — these already carry curated, pre-written
   business messages (batch/offer/manufacturer codes the caller already
   knows, never SQL/constraints/paths/tokens/hashes/stack traces) and are
   always safe to return as-is. `safeMessage(err, requestId, context)`
   returns that curated message for a known error; for anything else, it
   logs the **full, unmodified** error (with `context` and `requestId`)
   to the server console only, and returns a fixed generic string
   embedding `requestId` — the raw error itself never leaves the process.
2. **Every response surface routes through it.** `factory.routes.js`'s
   `errorToResponse` (used by every JSON endpoint) and
   `portal.routes.js`'s two per-item/redirect error sites (offer submit,
   Excel confirm) all call `safeMessage`/log through `errors.js` — there
   is exactly one place that decides "is this safe to show," not one
   decision repeated (and potentially forgotten) at each call site.
3. **`request_id`** (`crypto.randomUUID()`, assigned once per request by
   a leading middleware in both `factory.routes.js` and
   `portal.routes.js`) is included in every error JSON body
   (`factory.routes.js`) and available to every portal error path for
   inclusion in the generic message shown to the Manufacturer — so a
   support conversation can say "reference ABC123" and an operator can
   grep server logs for that exact id to find the full, unsanitized
   error.
4. **Never a partial fix.** The Excel-confirm per-item loops
   specifically were a second, easy-to-miss leak vector distinct from
   the single-offer path — both were audited and fixed together, not
   just the more obviously "browser-facing" one.

**Consequences:**
- A raw Postgres error (constraint violation, syntax error, connection
  failure) reaching any Phase 3 Portal or factory-API response now always
  becomes a fixed generic sentence plus a request id — verified by test
  (a malformed-UUID batch-item id, which previously would have let
  Postgres's own `22P02: invalid input syntax for type uuid` message
  reach the response, now returns a bare `{error: 'internal_error',
  request_id}` with no `message` field at all).
- Known/expected errors (offer not found, a batch in the wrong state,
  invalid credentials) are unaffected in user-facing behavior — they
  still return their existing curated message — but now also carry a
  `request_id` for consistency.
- Nothing under `ebp/phase3/` calls `err.message`/`error.message`/
  `.stack` directly in a response body or HTML string any more — verified
  by a repo-wide grep as part of this audit; the only remaining
  `err.message` reads are the three curated, safe cases in
  `factory.routes.js`'s `errorToResponse` and the one string match inside
  `service.js`'s own `catch` block used purely to detect the specific
  `23505` lineage-conflict case (never returned to a caller).

## ADR-0035 — Session cookie attributes aligned with the 12-hour session lifetime; sessions revoked on password reset

**Date:** 2026-07-13
**Status:** Accepted

**Context:** The Factory Portal's session cookie (`ebp_factory_session`)
was `HttpOnly`/`SameSite=Strict`/`Path=/portal` (and `Secure` in
production) but had no `Max-Age` at all — making it a browser-session
cookie, deleted the instant the tab/browser closes, which is *shorter*-
lived than the actual 12-hour server-side session in the common case and
inconsistent with it in general. `clearSessionCookie` (logout) and the
login-CSRF cookie's own clear function also omitted `Secure` in
production, an attribute mismatch versus the cookie they were clearing.
Separately, resetting a factory user's password did not revoke that
user's other live sessions — a session token issued before a reset
(e.g., one that had leaked) would keep working for up to its own
remaining 12 hours after the account holder reset their password
specifically because they suspected compromise.

**Decision:**
1. **`factory-auth.js` exports `SESSION_TTL_SECONDS`** (derived from the
   existing `SESSION_TTL_MS`, never a second hardcoded number that could
   drift from it). `portal.routes.js`'s `setSessionCookie` sets
   `Max-Age=${SESSION_TTL_SECONDS}` (43200) — the cookie's own lifetime
   is always exactly the server-side session TTL. The server session row
   remains the sole authority regardless: `resolveSession` rejects an
   expired or revoked session even if a client's stale cookie/clock would
   otherwise suggest it's still valid.
2. **Clearing a cookie always uses the identical attribute set as setting
   it** (only `Max-Age` changes, to `0`) — `clearSessionCookie` and
   `clearLoginCsrfCookie` both now include `Secure` in production, same
   as their corresponding "set" functions, since some browsers only
   reliably overwrite/delete a cookie when every other attribute matches
   the one that set it.
3. **`repository.revokeAllSessionsForUser(pool, factoryUserId)`** — a
   single `UPDATE ... SET revoked_at = NOW() WHERE factory_user_id = $1
   AND revoked_at IS NULL` — is called from both `service.resetPassword`
   and `service.acceptInvite` (the only two places a factory user's
   password is ever set) immediately after the new password hash is
   stored. Every previously-live session for that user stops resolving
   the instant the reset completes, not merely once each session's own
   TTL naturally expires.
4. **Session token rotation on login was already structural, not new.**
   `service.login` always generates a brand-new `crypto.randomBytes`
   session token per call (a fresh row, never a reused/mutated one) —
   this already satisfies "rotate the token after login." Combined with
   (3), a password reset revokes every old session and forces a fresh
   login to obtain a new one, which is itself a rotation of both the
   session token and its bound CSRF token (ADR-0033) together, since the
   CSRF token lives on the session row.
5. **Email-existence non-disclosure was already correct, verified by
   test.** `service.login` throws the identical `UnauthorizedError`
   message regardless of whether the account doesn't exist, is
   `DISABLED`, is still `INVITED` with no password set, or the password
   is simply wrong. `service.requestPasswordReset` already returned
   `null` silently for a nonexistent/disabled account with the route
   always responding `200 {status: 'ok'}` either way — this ADR adds a
   dedicated test proving the response for a real account and a
   nonexistent one are byte-identical, rather than relying on code
   inspection alone.

**Consequences:**
- A Manufacturer's session persists across browser restarts for up to
  the real 12-hour window, matching user expectation, without ever
  outliving the server's own authority over it.
- A password reset now has an immediate, verifiable security effect
  beyond "the old password stops working" — verified by test: a live
  session token obtained before a reset is rejected (401) immediately
  after the reset completes, using a fresh, isolated factory user/session
  fixture (never touching the shared fixtures the rest of the suite
  depends on).
- No behavior change for `acceptInvite`'s revoke call in practice (a
  freshly-invited account has no live sessions yet) — included purely to
  keep the invariant absolute: every password-setting event revokes
  whatever sessions exist, with no special-cased exception.

## ADR-0036 — Phase 3 approved and frozen as v1.0

**Date:** 2026-07-13
**Status:** Accepted
**Branch:** `claude/phase-0-audit-review-wanxa3`
**Closing commit:** `5f39ad9c` ("docs: ebp: Final Phase 3 correction-round
audit; approve/freeze Phase 3 v1.0") — see `CHANGELOG.md`'s "Phase 3
final correction-round audit; approved and frozen as v1.0" entry for
this date.

**Context:** Phase 3 was originally delivered (`Built`, not frozen) with
a real schema, backend, dual Portal/Excel intake, and an 87-test suite.
The project owner reviewed it and found it "well underway, but not yet
approved or frozen," requiring a mandatory 9-point correction round
before any freeze:
1. Audit the real test count (the delivered doc had incorrectly stated
   34 unit tests, summing to 92 against an 87 total).
2. Complete the Excel flow inside the Factory Portal itself — no
   Postman/curl/API token.
3. Replace the single free-typed field offer form with one driven by the
   Batch Item's full applicable-field set from its locked PEP snapshot.
4. Add CSRF protection to every state-changing Portal action.
5. Never show internal errors (SQL, constraints, paths, tokens, hashes,
   stack traces) to the Manufacturer.
6. Align session cookie attributes with the 12-hour session and its
   lifecycle (revocation on password reset, no email-existence
   disclosure).
7. Correctly resolve `OVERDUE` without requiring a cron job.
8. Persist Excel staging in Postgres, not process memory.
9. Run a final audit (real test counts for Phases 1/2/3, tenant
   isolation, CSRF, the multi-field form, the complete Excel UI flow,
   staging surviving a process restart, migrations from scratch,
   `validate.sql`, rollback verified isolated from Phase 1/2, and
   confirmation Phase 4 was not started) before any freeze decision.

**Decision:**
1. Items 1–8 were implemented and documented across ADR-0030 (Postgres-
   persisted Excel staging), ADR-0031 (centralized effective `OVERDUE`,
   no cron required), ADR-0032 (PEP-driven multi-field Offer form,
   Portal/Excel parity — including a fix to the Portal's own HTML form,
   which the first pass of this correction round had not yet upgraded to
   match), ADR-0033 (CSRF protection: session-bound synchronizer token,
   a double-submit cookie for the pre-session login form, `logout`
   changed from `GET` to `POST`), ADR-0034 (error-response sanitization:
   known service errors keep their curated message, anything unexpected
   becomes a generic message plus a `request_id`), and ADR-0035
   (cookie/session lifecycle: `Max-Age` aligned with the 12-hour session,
   matching attributes on clear, session revocation on password
   reset/accept-invite, verified email-existence non-disclosure).
2. Item 9's final audit was performed against a **freshly rolled-back-
   and-reapplied schema**, not the accumulating development database: all
   13 Phase 3 tables and 2 computed views were dropped via `rollback.sql`,
   Phase 1's 8 tables / 1015 Manufacturer rows / 78 catalog rows were
   confirmed byte-identical before and after, then `001_schema.sql`
   through `004_session_csrf_token.sql` were reapplied from scratch with
   zero errors, `validate.sql`'s 15 checks all passed, and the full
   Phase 1 (59), Phase 2 (100), and Phase 3 (126) suites all passed,
   stable across 3 consecutive runs. Full detail: `phases/phase-03-
   supplier-portal.md`, "Final Correction-Round Audit."
3. **Phase 3 — Manufacturer Intake Portal (Factory Portal) is APPROVED
   and marked `APPROVED / FROZEN v1.0`.**
4. **Frozen** means: the schema (13 tables + 2 views), the Batch/Offer
   state machines, the API surface split, the Factory-auth/CSRF/cookie
   model, and the Portal/Excel dual-intake design established through
   ADR-0023–ADR-0036 may not be altered without a new ADR that explicitly
   supersedes the relevant prior entry — the same append-only discipline
   already in force for Phase 0/Phase 1/Phase 2.
5. **Phase 4 — Engineering Compliance Validation is not authorized by
   this ADR.** Confirmed not started (no `ebp/phase4/`, no
   `migrations/ebp-phase4/`) as of this freeze. A future ADR must
   explicitly authorize it, per `CLAUDE_WORKFLOW.md`'s phase-gate
   discipline.

**Consequences:**
- Phase 3's documentation baseline (`phases/phase-03-supplier-portal.md`,
  this ADR range) is now version-locked the same way Phase 0/1/2's are.
- Any future change to Phase 3's schema, API surface, or auth/session
  model requires a new ADR, never a silent edit to an already-frozen one.
- Phase 4 work may begin only on the project owner's own explicit,
  separate authorization — not as a continuation of this session or this
  ADR.

## ADR-0037 — EBP Observability & Intelligence Layer: a permanent cross-cutting capability across all phases

**Date:** 2026-07-13
**Status:** Accepted — architecture and contracts only; no implementation
in this ADR (see "Decision," item 8).
**Amends:** `PROJECT_MANIFESTO.md`, `PLATFORM_ARCHITECTURE.md`,
`ROADMAP.md`, `CLAUDE_WORKFLOW.md` (all part of the Phase 0
`APPROVED / FROZEN v1.0` documentation baseline, ADR-0013) — this ADR is
the explicit superseding authority required by ADR-0013 §3 to add to that
baseline. It also authorizes an additive-only "Dashboard Readiness"
section on Phase 1/2/3's own frozen docs (ADR-0014/ADR-0022/ADR-0036),
under the same "new ADR that explicitly supersedes" mechanism each of
those freezes requires. **No existing sentence in any of those six
documents is altered, reworded, or removed by this ADR — every change is
a pure addition.**

**Context:** The project owner introduced this decision explicitly
**before** Phase 4 begins, stating it is not itself a phase but a
permanent capability that must be present across every current and
future phase: "Esta NO es una fase del proyecto. Es una capa permanente
presente en todas las fases actuales y futuras." Its purpose is to
guarantee that everything a future Executive Dashboard, Business
Intelligence layer, and AI-assisted querying will need — events,
metrics, KPIs, traceability, alerts — is captured from day one, without
retrofitting each phase later or letting each phase invent its own
siloed event/metrics system. The project owner was explicit on scope:
build the infrastructure that will feed the Dashboard, not the Dashboard
itself — no dashboards, charts, executive reports, widgets, or analytics
screens are in scope; only the architecture and, per item 8 below, the
documentation of that architecture.

**Decision:**

1. **Activity Events — one canonical model, never per-module event
   systems.** A single reserved table design, `ebp_activity_events`
   (not yet migrated — see item 8), is the sole event ledger for the
   entire platform:
   ```
   event_id            UUID PK
   event_type          TEXT      -- e.g. 'BATCH_OVERDUE', 'OFFER_SUBMITTED', 'MANUFACTURER_SUSPENDED'
   entity_type         TEXT      -- 'PASSPORT' | 'MANUFACTURER' | 'BATCH' | 'OFFER' | 'CERTIFICATION' | 'PRODUCT' | ...
   entity_id           UUID
   entity_version      TEXT      -- nullable; e.g. engineering_revision, offer_revision — whatever versioning concept the entity already has
   passport_id         UUID      -- nullable; populated whenever the event traces to a Passport
   manufacturer_id     UUID      -- nullable; populated whenever the event traces to a Manufacturer
   batch_id            UUID      -- nullable
   offer_id            UUID      -- nullable
   user_id             UUID      -- nullable; a factory_user_id when applicable, never a distributor/admin credential
   declared_actor       TEXT      -- reuses the Phase 1 actor.js / Phase 3 actorFromSession convention (ADR-0002-adjacent)
   identity_mechanism  TEXT      -- 'ADMIN_KEY_SHARED' | 'FACTORY_SESSION' | future mechanisms, same enum discipline as existing phases
   correlation_id      UUID      -- the same concept as Phase 3's request_id (ADR-0034), extended platform-wide
   event_timestamp     TIMESTAMPTZ
   event_data          JSONB     -- event-type-specific payload; never contains password_hash/token_hash/storage_key or any field a phase's own DTO already excludes
   ```
   No phase — current or future — may create its own independent event
   table or event-emission mechanism. Any phase that needs to record
   "something happened" writes to this one table (once implemented) with
   an `entity_type`/`event_type` scoped to that phase's own vocabulary.
   Existing phase-specific audit trails (Phase 1's implicit revision
   chain, Phase 2's `ebp_manufacturer_*` history, Phase 3's
   `ebp_manufacturer_request_batch_status_history`,
   `ebp_manufacturer_offer_status_history`,
   `ebp_factory_user_audit_log`) are **not replaced or migrated by this
   ADR** — they remain each phase's own frozen system of record. A
   future, separately-authorized implementation ADR decides whether/how
   they are dual-written or backfilled into `ebp_activity_events`,
   without altering their existing frozen behavior.

2. **Timeline — reconstructed, never duplicated.** Any entity's full
   history (minimum: Passport, Manufacturer, Batch, Offer, Certification,
   Product) is a read-time query over `ebp_activity_events` filtered by
   `entity_type`/`entity_id`, ordered by `event_timestamp`. There is no
   separate "timeline" table. This mirrors the discipline already
   established for computed status (`ebp_manufacturer_offers_effective`,
   ADR-0019; `ebp_manufacturer_request_batches_effective`, ADR-0031): a
   projection is always computed at read time from one source of truth,
   never stored redundantly.

3. **Analytics Views — the only surface a future Dashboard may query.**
   Reserved naming convention: `ebp_analytics_<domain>_summary` /
   `_overview` (examples: `ebp_analytics_manufacturer_summary`,
   `ebp_analytics_batch_summary`, `ebp_analytics_offer_summary`,
   `ebp_analytics_product_summary`, `ebp_analytics_dashboard_overview`).
   These are always Postgres `VIEW`s (never materialized tables, never a
   parallel denormalized copy) over `ebp_activity_events` and each
   phase's own transactional tables. **A future Dashboard, BI tool, or
   AI query layer never reads a transactional `ebp_*` table directly** —
   the same allow-list-projection discipline already required for every
   role-specific DTO in Phase 1/2/3 (internal-only DTOs, Distributor
   confidentiality strip, ADR-0006/ADR-0009/ADR-0021) extends to
   Analytics Views: they are the confidentiality boundary for reporting,
   exactly as DTOs are the confidentiality boundary for the API.

4. **KPI Layer — named, versioned, computed server-side only.** Each
   phase exposes a small set of named metrics (examples given by the
   project owner: total manufacturers, qualified manufacturers, batches
   created, overdue batches, average response time, offers submitted,
   offers approved, documents uploaded, certifications expiring) backed
   by a query over Activity Events, transactional tables, or Analytics
   Views. **KPIs are never computed in a frontend** — the same
   "single source of truth per concern" principle already binding for
   Cost Engine/Pricing Engine (`PROJECT_MANIFESTO.md` §4.2) extends to
   metrics: a KPI has exactly one authoritative definition and query,
   reused everywhere it's shown, never recalculated ad hoc per screen.

5. **Alert Layer — structured rows, not a delivery mechanism.** Each
   phase can produce structured alerts (examples given: Manufacturer
   suspended, Batch overdue, Offer expiring, Certification expiring,
   Engineering review required, Product without manufacturer, Only one
   qualified manufacturer) as rows generated by rule evaluation against
   transactional state and/or Activity Events. **The Notification Center
   (delivery — email, in-app, Slack, etc.) is explicitly out of scope**
   and is not designed by this ADR; only the alert *record* — what
   happened, its severity, and what it references — is in scope.

6. **Internal Analytics API — reserved, not implemented.** The path
   prefix `/api/ebp/internal/analytics/*` is reserved for this layer,
   mirroring the existing `requireAdmin`-gated internal-surface
   convention already used by every phase (`/api/ebp/internal/
   manufacturer-batches`, etc.). No route file, no `server.js` mount, and
   no handler is created by this ADR — only the path and its intended
   audience (internal/admin-gated, never Distributor- or Manufacturer-
   facing) are reserved so no future phase accidentally claims that
   prefix for something else.

7. **Dashboard Readiness — a new mandatory section on every phase doc.**
   From this ADR forward, `phases/phase-NN-*.md` must end with a
   "Dashboard Readiness" section (format specified in
   `CLAUDE_WORKFLOW.md`, amended by this ADR) covering: new events, new
   KPIs, new alerts, new Analytics Views, new APIs, Timeline impact, and
   future-AI impact. **No phase may be approved without this section
   being complete** — this extends `CLAUDE_WORKFLOW.md`'s existing
   Approval Gate (§4) and Documentation-First Requirement (§3). Phase
   1/2/3, already frozen, are retrofitted with this section **as a pure
   addition** describing what each phase *would* emit once this layer's
   own implementation is authorized — this is a documentation exercise
   describing readiness, not new behavior, and does not reopen or
   modify any frozen decision in those phases.

8. **Nothing described above is implemented by this ADR.** No migration
   file is created under `migrations/`, no `ebp_activity_events` (or any
   other) table exists yet, no `ebp/observability/` module exists, no
   route is mounted, and no existing phase's code, schema, migration, or
   API is touched. This ADR is the architecture-and-contract layer only,
   exactly as the project owner specified ("No vamos a construir el
   Dashboard ahora... Vamos a construir la infraestructura que lo
   alimentará" — read together with "No construir todavía," repeated for
   every functional component). Implementation is a future, separately-
   authorized round — likely its own `migrations/ebp-observability/`
   directory and `ebp/observability/` module, following the exact same
   real-migration/real-tests/real-Postgres discipline already applied to
   Phase 1/2/3 — never silently bundled into an unrelated phase's work.

**Consequences:**
- Every future phase (starting with Phase 4, whenever separately
  authorized) must design its own event/KPI/alert emissions against this
  shared model from day one, and its phase doc must include a completed
  Dashboard Readiness section before it can be approved.
- Phases 1, 2, and 3 remain exactly as frozen (ADR-0014/ADR-0022/
  ADR-0036) — their schemas, APIs, tests, and behavior are unchanged.
  Only a new, clearly-labeled "Dashboard Readiness" section is appended
  to each phase doc, describing future readiness, not current behavior.
- No new dependency, migration, table, route, or test was added in this
  ADR — verified by `git diff --stat` showing only `docs/ebp/*.md`
  changes (see the corresponding `CHANGELOG.md` entry).
- A future Dashboard/BI/AI project is explicitly scoped to consume only:
  Activity Events, Analytics Views, the KPI Layer, the Alert Layer, and
  Timeline reconstructions — never a transactional `ebp_*` table
  directly. This is now a standing architectural constraint, not a
  suggestion, for whoever eventually builds that project.

## ADR-0038 — `ENGINEERING_RULE_ENGINE.md` is the normative authority for the Engineering Compliance Validation engine's behavior

**Date:** 2026-07-13
**Status:** Accepted — architecture and rule-behavior definition only; no
implementation authorized. Phase 4 remains not started.
**Amends:** Nothing existing is altered. This ADR introduces a new
document and references it from `IMPLEMENTATION_MASTER_INDEX.md` and
`ROADMAP.md`; no frozen phase (0/1/2/3) documentation is changed.

**Context:** Before authorizing Phase 4 — Engineering Compliance
Validation, the project owner required that the rule engine's *behavior*
be fully defined first, independent of any API or schema design: "El
motor no debe improvisar reglas. Debe ejecutar reglas previamente
definidas." This is the same documentation-before-code discipline already
governing every phase in this platform (`PROJECT_MANIFESTO.md` §4.1),
applied specifically to the hardest, most structurally load-bearing part
of Phase 4 — the comparison logic itself — before any data model or
endpoint is drafted around it.

**Decision:**
1. **`docs/ebp/ENGINEERING_RULE_ENGINE.md` is created** and is the
   authoritative reference for: the philosophy (Engineering Compliance,
   Engineering Approval, Commercial Approval, Deviation, Exception,
   Conditional Approval), the ten Comparison Types (Exact Match, Numeric
   Tolerance, Range, Maximum, Minimum, Enumeration, Pattern, Boolean,
   Required Evidence, Composite Rule, Conditional Rule), the six-state
   model (`PASS`/`FAIL`/`WARNING`/`NOT_APPLICABLE`/`REQUIRES_REVIEW`/
   `REQUIRES_EXCEPTION`), the five-level Severity scale (`CRITICAL`/
   `HIGH`/`MEDIUM`/`LOW`/`INFO`), the Exception model, the Scoring
   philosophy (not implemented), the Observation Catalog principle (no
   hardcoded explanation strings, ever), the Rule Catalog shape (Rule
   ID/Name/Description/Comparison Type/Severity/Category/Applies To/
   Default Behavior) with fourteen fixed Categories, the complete
   Passport → Offer → Rule Evaluation → Rule Results → Compliance
   Summary → Engineering Decision → Offer Approval flow, the Dashboard
   Readiness this engine will need (per ADR-0037), and the AI-readiness
   rationale (per §12 of that document).
2. **Every future decision about Phase 4's data model, API, or code must
   derive from `ENGINEERING_RULE_ENGINE.md`, not the reverse.** If
   Phase 4's eventual implementation needs to deviate from something
   stated there, that deviation itself requires a new ADR that explicitly
   supersedes the relevant section of that document — the same freeze
   discipline already governing Phase 0/1/2/3.
3. **`phases/phase-04-validation-engine.md`'s own future spec-approval
   pass may not contradict `ENGINEERING_RULE_ENGINE.md`.** That phase
   doc remains `Spec Drafted (revised)`, unapproved, and unauthorized for
   implementation, unchanged by this ADR — this ADR does not itself
   advance Phase 4's status.
4. **Twelve open questions are recorded** in
   `ENGINEERING_RULE_ENGINE.md`'s own "Open Questions" section (engineer-
   approval authority model, `FAIL`→`REQUIRES_EXCEPTION` promotion,
   severity-to-gating mapping, Composite/Conditional severity
   aggregation, the scoring formula's existence and shape, the
   Observation Catalog's exact structure, Exception scope beyond one
   (Offer Revision × Rule) pair, Conditional Approval's data shape,
   automatic vs. human Engineering Decisions, Rule Catalog storage/
   versioning, the relationship to Phase 1's `field_applicability`
   matrix, and the precise scope of re-validation triggers) — **all
   twelve must be answered before any Phase 4 code is written**, per the
   project owner's explicit instruction.
5. **Nothing is implemented by this ADR.** No table, migration, API
   route, or line of Phase 4 code exists as a result of this decision.

**Consequences:**
- Phase 4's eventual spec approval has a concrete, pre-agreed rule-
  engine behavior to build against, rather than inventing comparison
  semantics ad hoc during implementation — the same benefit
  `PLATFORM_ARCHITECTURE.md` gave Phase 1 onward at Phase 0.
- The twelve open questions are a concrete, trackable pre-implementation
  checklist — Phase 4 cannot reasonably be approved for implementation
  while they remain unanswered, since several (severity-to-gating
  mapping, Rule Catalog storage) directly determine the eventual schema.
- No existing frozen phase's documentation, schema, API, or test suite
  was touched — verified by `git diff --stat` showing only new/updated
  `docs/ebp/*.md` files (see the corresponding `CHANGELOG.md` entry).
- Phase 4 remains not started and not authorized by this ADR.

## ADR-0039 — Engineering Approval authority model: three functional roles atop the existing `requireAdmin` mechanism

**Date:** 2026-07-13
**Status:** Accepted — closes `ENGINEERING_RULE_ENGINE.md` Open Question 1.

**Context:** Phase 4 needs a specific answer to "who may record an
Engineering Decision or grant an Exception" before any schema for those
entities can be designed. Building a new, separate identity/auth system
for a single-operator MVP would be disproportionate; leaving it entirely
unspecified would let a manufacturer or an unauthorized actor influence a
technical compliance outcome.

**Decision:** The MVP reuses the existing internal `requireAdmin`
mechanism, complemented by explicit functional authorization via three
roles: `ENGINEERING_REVIEWER` (review, request clarification; cannot
grant Exceptions), `ENGINEERING_APPROVER` (records Engineering Decisions,
technically rejects Offers, approves Exceptions the rule's
`exception_policy` permits), and `ADMIN_OWNER` (administers role
assignments; cannot directly flip an invalid technical result to valid;
cannot approve rules outside the authorized flow via an administrative
override). While `identity_mechanism = ADMIN_KEY_SHARED` remains in use,
the actor stays a `declared_actor` label, never presented as
cryptographically authenticated identity — the same discipline already
governing Phase 1/Phase 3's actor model. The architecture must allow
substituting real individual internal authentication later without
altering any historical engineering decision.

**Consequences:** Phase 4's schema for Engineering Decisions and
Exceptions must carry a role-check derived from these three roles, not a
bare `requireAdmin` boolean. `ADMIN_OWNER` is structurally prevented from
being a backdoor around the Engineering Approval flow — this must be
enforced in code, not just documented. See `ENGINEERING_RULE_ENGINE.md`,
"Resolved Decisions," Decision 01.

## ADR-0040 — `FAIL` → `REQUIRES_EXCEPTION` promotion governed by a per-rule-version `exception_policy`; `CRITICAL` is `NON_WAIVABLE` by default

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 2.

**Context:** Without a fixed rule, an engineer could informally treat any
failed rule as "needs an exception" regardless of how serious the
underlying Deviation is, eroding the entire point of Severity (ADR-0041).

**Decision:** Every rule version declares exactly one `exception_policy`:
`NON_WAIVABLE`, `WAIVABLE_WITH_ENGINEERING_APPROVAL`, or
`WAIVABLE_WITH_CONDITIONS`. An Exception may only be requested if the
rule version's policy allows it — never a free, ad hoc promotion by an
engineer. `NON_WAIVABLE` rules never receive an Exception, ever. Every
`CRITICAL`-severity rule is `NON_WAIVABLE` by default; a rule version may
declare itself `CRITICAL` and waivable only via explicit, visible
configuration on that version. No administrative override outside this
formal flow is permitted, at any severity.

**Consequences:** The Rule Catalog schema (ADR-0048) must carry
`exception_policy` as a first-class, versioned column. Exception-request
endpoints must reject a request against a `NON_WAIVABLE` rule at the
service layer, not merely hide the option in a UI. See
`ENGINEERING_RULE_ENGINE.md`, Decision 02.

## ADR-0041 — Fixed platform-wide Severity → gating mapping; the Rule Catalog may only harden it, never weaken it

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 3.

**Context:** `ENGINEERING_RULE_ENGINE.md` §4 originally offered this
mapping as an illustrative default only. Leaving it fully configurable
per rule with no floor would let a misconfigured rule silently downgrade
a genuinely critical engineering requirement to a non-blocking warning.

**Decision:** `CRITICAL` and `HIGH` always block `VALID` (`FAIL`, or
`REQUIRES_EXCEPTION` for `HIGH` per its `exception_policy`); `MEDIUM` and
`LOW` never block automatically (produce `WARNING`); `INFO` never blocks.
This is a fixed floor. A rule version may harden it (e.g., configure a
`MEDIUM` rule to block) but may never weaken it (a `HIGH` rule can never
be configured to stop blocking without going through the formal
Exception flow, ADR-0040). Every hardening is itself versioned and
audited as part of that rule version's own record.

**Consequences:** The Compliance/Mechanical-Result computation has one
authoritative floor table that every rule version is checked against at
publish time — a rule version that attempts to weaken the floor must be
rejected by validation, not merely discouraged by convention. See
Decision 03.

## ADR-0042 — Composite/Conditional Rule severity aggregation: highest-severity-wins for Composite; severity moot under `NOT_APPLICABLE` for Conditional

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 4.

**Context:** Without a defined aggregation rule, a Composite Rule
combining a `LOW` and a `CRITICAL` operand could ambiguously resolve to
either severity, and a Conditional Rule's severity could be
inconsistently applied when its precondition is false.

**Decision:** A Composite Rule's effective severity is the highest among
its own declared severity and the severities of whichever operand(s)
caused the negative result. `AND` fails if any blocking operand fails;
`OR` fails only when every valid alternative fails; `XOR` fails if none,
or more than one, alternative is satisfied. For Conditional Rules,
severity is evaluated only when the precondition is true; when false, the
result is `NOT_APPLICABLE`, severity never participates in gating, it
never affects future Scoring, and the `NOT_APPLICABLE` result (with which
precondition evaluated false) is always recorded for traceability.

**Consequences:** The evaluator must compute Composite/Conditional
results as a distinct aggregation step over already-computed operand
Rule Results, never as an independent re-comparison. See Decision 04.

## ADR-0043 — No numeric technical Score in Phase 4 v1.0; all data preserved for a future version

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 5.

**Context:** A numeric Score risks presenting a false sense of precision
("97.3% compliant") that could be misread as overriding a hard,
unresolved `CRITICAL` failure, and its exact formula was never agreed.

**Decision:** Phase 4 v1.0 produces per-rule results, a per-state
summary, per-severity counts, an overall Mechanical Compliance Result,
and a separate human Engineering Decision — no numeric score. No
compliance percentage derived merely from a pass-count ratio is ever
shown. Every Rule Result's state, severity, category, and rule version is
preserved so a real, Severity-weighted Score can be added later,
including retroactively over historical runs, without recalculating or
losing history.

**Consequences:** The schema stores enough granularity (per-rule state/
severity/category) even without a Score column — no future migration is
needed to *add* the underlying data, only to add a derived Score
computation. See Decision 05.

## ADR-0044 — Hybrid Observation Catalog: default template per (Comparison Type × State), optional override per (Rule ID × Rule Version × State); codes and structured parameters are authoritative, never rendered text

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 6.

**Context:** Hardcoded, inline explanation strings would fragment
wording across the codebase and make consistent AI/BI querying
impossible (per ADR-0037's AI-readiness principle); a single rigid
template-per-type would not allow a specific rule to phrase its own
explanation more precisely when needed.

**Decision:** A hybrid catalog: a default template keyed by
(`comparison_type`, `result_state`), with an optional override keyed by
(`rule_id`, `rule_version`, `result_state`) taking precedence when
present. Every Observation carries a stable `observation_code` (e.g.
`OBS_NUMERIC_BELOW_MINIMUM`, `OBS_TOLERANCE_EXCEEDED`,
`OBS_REQUIRED_EVIDENCE_MISSING`), its structured rendering parameters,
and the template version used — the rendered sentence is a presentation
artifact only, never the stored source of truth. Phase 4 v1.0 renders
English only, but the catalog's i18n-ready key structure (code +
parameters, not baked-in strings) allows adding languages later without
touching evaluation code.

**Consequences:** Every Rule Result must store `observation_code` +
parameters, not a pre-rendered string, as its authoritative record. See
Decision 06.

## ADR-0045 — Exception scope fixed at Offer ID × Offer Revision × Rule ID × Rule Version; class Exceptions deferred to a future, independently-ADR'd version

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 7.

**Context:** A broader Exception scope (e.g., Manufacturer-wide or
family-wide) is operationally tempting but risks becoming an
un-audited, implicit rule change if built without its own careful
design.

**Decision:** Phase 4 v1.0 permits Exceptions only at the tuple **Offer
ID × Offer Revision × Rule ID × Rule Version**. No general Exceptions by
Manufacturer, family, or future Offers exist. An Exception is not
inherited, is not applied automatically to later revisions, does not
modify the Rule Catalog, does not change the PEP, does not convert a
Deviation into genuine technical compliance, and only authorizes
accepting that one specific, identified Deviation. Class Exceptions are
explicitly deferred and require their own future ADR.

**Consequences:** The Exception table's natural key is the four-part
tuple above — no nullable "applies more broadly" column is added
speculatively. See Decision 07.

## ADR-0046 — Conditional Approval is an ordinary Engineering Decision with linked structured condition records, not a separate technical state

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 8.

**Context:** Modeling Conditional Approval as a wholly separate parallel
state risked duplicating the Engineering Decision workflow; modeling it
as an untracked, informal note risked losing the follow-up entirely.

**Decision:** `CONDITIONALLY_APPROVED` is one value of the ordinary
Engineering Decision enum (`APPROVED`/`CONDITIONALLY_APPROVED`/
`REJECTED`/`PENDING_REVIEW`), carrying one or more structured condition
records: `condition_id`, `condition_type`, description, verifiable
requirement, responsible party, due date, required evidence, status,
satisfaction date, consequence of non-compliance. Condition status:
`OPEN`, `SATISFIED`, `OVERDUE`, `WAIVED`, `FAILED`, `CANCELLED`. A
`CONDITIONALLY_APPROVED` Offer does not count as final approval for
Manufacturer Selection while any mandatory condition is `OPEN`/
`OVERDUE`/`FAILED`; it may be used only in preliminary comparisons; it
becomes eligible once every mandatory condition is `SATISFIED` or
formally `WAIVED`. The Alert Layer must produce alerts for conditions
approaching deadline, overdue, or failed.

**Consequences:** Manufacturer Selection (Phase 5, when authorized) must
check condition eligibility, not just the bare Engineering Decision
enum value, before treating an Offer as usable. See Decision 08.

## ADR-0047 — Every Offer requires a human Engineering Decision; the engine never self-grants Engineering Approval

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 9.

**Context:** Allowing the engine to auto-approve a 100%-`PASS` Offer
would be operationally convenient but removes the human accountability
step this platform's own principles already require before any Offer
reaches Manufacturer Selection (`PROJECT_MANIFESTO.md` §4.4).

**Decision:** Every Offer requires a human decision. The automatic
engine evaluates rules, generates Rule Results, produces the Mechanical
Compliance Result, and may flag `MECHANICALLY_ELIGIBLE_FOR_APPROVAL` —
but never writes `APPROVED` itself, even when every rule is `PASS`/
`NOT_APPLICABLE`. An `ENGINEERING_APPROVER` (ADR-0039) must always
confirm the decision. This policy may only be revisited in the future via
a new ADR, once sufficient operational history exists to evaluate it.

**Consequences:** The Engineering Decision table's `APPROVED` value can
only ever be written by a request carrying an `ENGINEERING_APPROVER`
actor — this must be enforced at the service layer as an invariant, not
left to UI convention. See Decision 09 and the "Global Result Model" in
`ENGINEERING_RULE_ENGINE.md`.

## ADR-0048 — Rule Catalog stored as versioned Postgres data, never as code; immutable published versions

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 10.

**Context:** Storing the Rule Catalog as code (as Phase 3's presentational
`pep-fields.js` does) would require a full deploy cycle to add or adjust
a single engineering rule, and would make "which exact rule version
produced this historical result" harder to answer with certainty than a
proper versioned data model would.

**Decision:** The Rule Catalog is data in Postgres. Minimum entities:
rule identity, rule version, comparison type, category, severity, gating
behavior, exception policy, applicability, operands/dependencies,
observation templates, status, effective dates, authoring/audit
metadata. `rule_id` is stable and permanent; every functional change
creates a new `rule_version`; a published version is never edited; prior
versions remain available; every validation references an exact
`rule_id` + `rule_version`; a rule starts `DRAFT`, is reviewed, is
published `ACTIVE`, may become `SUPERSEDED` or `RETIRED`; a rule version
that was ever used is never deleted. No advanced visual rule-editing
interface is built in v1.0 — administration is via controlled internal
endpoints and/or versioned migrations/seed data.

**Consequences:** This is the single most schema-defining decision in
this set — Phase 4's migrations must include a proper rule-catalog
table set with version history from day one, not a simple flat table
retrofitted later. See Decision 10.

## ADR-0049 — Phase 4 introduces its own Rule Applicability concept, distinct from and layered on top of Phase 1's Field Applicability

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 11.

**Context:** Phase 1's `field_applicability`/`ebp_field_applicability_
matrix` only ever gates two fields (the bypass and anti-drainback
valves) plus beta ratio/micron rating in seed data — it cannot express
"this rule only applies to HD products" or "this rule only applies when
Manufacturer holds a specific qualification attribute" without Phase 4
inventing its own concept.

**Decision:** Phase 4 uses two applicability levels. Field applicability
comes from Phase 1 (`ebp_field_applicability_matrix`, the PEP snapshot,
frozen engineering overrides) and is never modified by Phase 4. Rule
applicability is Phase 4's own, additional concept, evaluated against:
product category; product subtype; duty; technology; presence/absence of
a field; value of another required field; Manufacturer qualification
attributes; other explicitly declared inputs. A rule may depend on a
Phase 1 field, but not every rule is limited to one. All rule
applicability must be declared, versioned, auditable, and must record why
a rule was evaluated or marked `NOT_APPLICABLE`.

**Consequences:** Phase 4's Rule Catalog schema needs its own
applicability-declaration structure (referencing, but distinct from,
Phase 1's matrix) — Phase 1's frozen table is read-only input, never
altered or extended by Phase 4. See Decision 11.

## ADR-0050 — Re-validation uses full coarse invalidation in Phase 4 v1.0; fine-grained optimization deferred until evidence of a real performance problem

**Date:** 2026-07-13
**Status:** Accepted — closes Open Question 12.

**Context:** Fine-grained invalidation (only re-running rules that
reference the specific changed input) is more efficient but requires the
Rule Catalog to declare exact data dependencies up front — a level of
rigor not yet justified without real operational volume.

**Decision:** Any of the following triggers a full re-validation:
Passport revision change; Manufacturer Offer revision; relevant
Manufacturer qualification status change; Offer expiration; a change to
the Rule Catalog's applicable `ACTIVE` version; required linked evidence
changing; an Exception; an approval condition; or any other input the
rule set uses. No partial results from a prior validation are reused.
Every revalidation creates a new validation run, preserves the previous
execution, re-evaluates every applicable rule, and records the trigger
and the exact versions of every input. The previous validation becomes
`STALE` without being deleted or modified historically. Fine-grained
optimization is deferred until there is real evidence of a performance
problem.

**Consequences:** Validation runs are append-only and cheap to reason
about at the cost of some redundant re-computation — an acceptable
trade-off at this platform's current scale. See Decision 12.

## ADR-0051 — Global Result Model: Mechanical Compliance Result, Engineering Decision, and Offer Approval are three permanently distinct concepts, never merged into one column

**Date:** 2026-07-13
**Status:** Accepted.

**Context:** Decisions 02, 03, 08, and 09 above collectively imply a
three-layer result model, but without a single, explicit ADR stating
this as its own principle, a future implementation could still be
tempted to collapse the mechanical result and the human decision into
one status column for convenience — exactly the ambiguity this whole
correction round exists to eliminate.

**Decision:** The engine keeps three concepts structurally distinct,
never merged into a single column or state:
1. **Mechanical Compliance Result** (automatic, no human step):
   `MECHANICALLY_PASS` / `MECHANICALLY_FAIL` /
   `REQUIRES_ENGINEERING_REVIEW`, optionally flagged
   `MECHANICALLY_ELIGIBLE_FOR_APPROVAL` (informational only).
2. **Engineering Decision** (always human, `ENGINEERING_APPROVER`):
   `PENDING_REVIEW` / `APPROVED` / `CONDITIONALLY_APPROVED` / `REJECTED`.
3. **Offer Approval** (Phase 3's existing Commercial Approval gate,
   ADR-0008): requires an eligible Engineering Decision on file, requires
   its own Commercial Approval, is never part of the mechanical
   evaluation.

**Consequences:** Phase 4's schema must have at least three distinct
status representations (a Mechanical Compliance Result on the validation
run, an Engineering Decision on its own record, and Offer Approval
remaining entirely in Phase 3's existing table) — a single "status"
column spanning all three is a schema defect by definition of this ADR,
not a valid simplification. See `ENGINEERING_RULE_ENGINE.md`, "Global
Result Model."
