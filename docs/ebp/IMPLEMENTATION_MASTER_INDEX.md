# IMPLEMENTATION MASTER INDEX — ELIMFILTERS Business Platform (EBP)

**Purpose:** single-glance status of every phase. Update this file whenever a
phase's status changes — it is the authoritative status tracker referenced by
`CLAUDE_START_PROMPT.md` at the start of every EBP session.

**Status values:** `Not Started` → `Spec Drafted` → `Spec Approved` → `In
Build` → `Built` → `Blocked` (with reason). A phase's foundation/spec can
additionally be marked `APPROVED / FROZEN vX.Y` once formally approved and
locked against unreviewed architecture changes (see Phase 00 below).

**Phase 0 formally APPROVED / FROZEN v1.0 — 2026-07-13.** Branch
`claude/phase-0-audit-review-wanxa3`. See ADR-0013 in `DECISIONS.md` and
the "Phase 0 approved and frozen — v1.0" entry in `CHANGELOG.md` for the
closing commit hash. Phase 1 — Product Engineering Passport is authorized
to begin immediately; no phase beyond Phase 1 is authorized.

**Correction round 1 (2026-07-13):** Phase 0 was reviewed and **not
approved** — the project owner identified a domain-model error (a
`Supplier` entity had been introduced as a mandatory part of the validation
chain; the agreed MVP has no such entity). See ADR-0005/ADR-0006 in
`DECISIONS.md` and the `CHANGELOG.md` entry for this date.

**Correction round 2 (2026-07-13):** Phase 0 was reviewed again and **still
not approved** — three further gaps were identified: Manufacturer Product
Offer needed to be versioned (many revisions, one active at a time), the
Passport incorrectly held Manufacturer-proposed and ELIMFILTERS-approved
packaging quantities that belong elsewhere, and a single undifferentiated
note field conflated Manufacturer-visible instructions with
ELIMFILTERS-internal information while also conflating technical
Validation with a separate commercial/operational Offer Approval decision.
Phase 0 status remains `In Build` pending re-review of this second
correction. See ADR-0007/ADR-0008/ADR-0009 in `DECISIONS.md` and the
`CHANGELOG.md` entry for this date.

| # | Phase | Doc | Status | Approved by | Approved on |
|---|---|---|---|---|---|
| 00 | Foundation | [phase-00-foundation.md](phases/phase-00-foundation.md) | **APPROVED / FROZEN v1.0** | Project Owner | 2026-07-13 |
| 01 | Product Engineering Passport | [phase-01-product-engineering-passport.md](phases/phase-01-product-engineering-passport.md) | In Build | Project Owner | 2026-07-13 |
| 02 | Manufacturer Registry | [phase-02-manufacturer-registry.md](phases/phase-02-manufacturer-registry.md) | Spec Drafted (revised) | — | — |
| 03 | Manufacturer Intake Portal (Factory Portal) | [phase-03-supplier-portal.md](phases/phase-03-supplier-portal.md) | Spec Drafted (revised) | — | — |
| 04 | Engineering Compliance Validation | [phase-04-validation-engine.md](phases/phase-04-validation-engine.md) | Spec Drafted (revised) | — | — |
| 05 | Manufacturer Selection | [phase-05-manufacturer-selection.md](phases/phase-05-manufacturer-selection.md) | Spec Drafted (revised) | — | — |
| 06 | Cost Engine | [phase-06-cost-engine.md](phases/phase-06-cost-engine.md) | Spec Drafted (revised) | — | — |
| 07 | Pricing Engine | [phase-07-pricing-engine.md](phases/phase-07-pricing-engine.md) | Spec Drafted (revised) | — | — |
| 08 | Distributor Portal | [phase-08-distributor-portal.md](phases/phase-08-distributor-portal.md) | Spec Drafted (revised) | — | — |
| 09 | Order Management | [phase-09-order-management.md](phases/phase-09-order-management.md) | Spec Drafted (revised) | — | — |

**Note on Phase 03's file name:** the file is still named
`phase-03-supplier-portal.md` to avoid unnecessary churn in cross-references.
Its title and content are corrected to **Manufacturer Intake Portal (Factory
Portal)** — a raw-material Supplier concept no longer appears in its scope.
See ADR-0005.

## Notes on Current Status

- **Phase 00** is `APPROVED / FROZEN v1.0` as of 2026-07-13, after two
  correction rounds and a final governance-decisions round (ADR-0005
  through ADR-0013). The documentation baseline under `docs/ebp/` may not
  be altered without a new ADR that explicitly supersedes the relevant
  prior entry — see ADR-0013.
- **Phase 01 — Product Engineering Passport** is `In Build`, authorized by
  the project owner immediately following Phase 0's approval (ADR-0013).
  It is the only phase currently authorized for implementation.
- **Phases 02-09** remain `Spec Drafted` — first-pass drafts written during
  Phase 0 to prove the roadmap's dependency chain is coherent (see each
  file's own "Status" line). None are `Spec Approved`. **No implementation
  work may start on Phases 02-09 until each is explicitly approved in its
  own turn, per `CLAUDE_WORKFLOW.md`.**

## How to Use This File

1. At the start of any EBP work session, read this file first (see
   `CLAUDE_START_PROMPT.md`) to determine the current phase and its status.
2. Never begin implementation on a phase whose status is not
   `Spec Approved` or later.
3. When a phase's status changes, update its row here **and** add an entry
   to `CHANGELOG.md` in the same commit.
4. If a phase becomes blocked, set status to `Blocked` and add a one-line
   reason in this table (extend the table with a Reason column if needed)
   plus detail in the phase's own doc under "Risks."
