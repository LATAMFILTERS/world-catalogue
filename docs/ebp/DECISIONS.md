# DECISIONS — ELIMFILTERS Business Platform (EBP)

Architecture Decision Record (ADR) log. Each entry is append-only — a
reversed decision gets a new entry that supersedes the old one; the old
entry is not deleted or edited (auditability, per `BUSINESS_RULES.md` §12).

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
recompute them. Codified in `BUSINESS_RULES.md` §8-9.

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
`BUSINESS_RULES.md` §10 (Distributor Portal Rules).
