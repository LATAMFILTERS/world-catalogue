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
