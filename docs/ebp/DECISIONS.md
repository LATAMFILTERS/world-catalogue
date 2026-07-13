# DECISIONS — ELIMFILTERS Business Platform (EBP)

Architecture Decision Record (ADR) log. Each entry is append-only — a
reversed decision gets a new entry that supersedes the old one; the old
entry is not deleted or edited (auditability, per `BUSINESS_RULES.md` §11).

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
recompute them. Codified in `BUSINESS_RULES.md` §7-8.

**Consequences:** Phase 6 and 7 become hard dependencies for any module that
displays a number to a distributor. This is intentional — it trades
implementation sequencing flexibility for guaranteed consistency.
