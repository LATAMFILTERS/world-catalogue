# IMPLEMENTATION MASTER INDEX — ELIMFILTERS Business Platform (EBP)

**Purpose:** single-glance status of every phase. Update this file whenever a
phase's status changes — it is the authoritative status tracker referenced by
`CLAUDE_START_PROMPT.md` at the start of every EBP session.

**Status values:** `Not Started` → `Spec Drafted` → `Spec Approved` → `In
Build` → `Built` → `Blocked` (with reason).

**Correction round (2026-07-13):** Phase 0 was reviewed and **not
approved** — the project owner identified a domain-model error (a
`Supplier` entity had been introduced as a mandatory part of the validation
chain; the agreed MVP has no such entity). Phase 0 status remains `In
Build` pending re-review of this correction. See ADR-0005/ADR-0006 in
`DECISIONS.md` and the `CHANGELOG.md` entry for this date.

| # | Phase | Doc | Status | Approved by | Approved on |
|---|---|---|---|---|---|
| 00 | Foundation | [phase-00-foundation.md](phases/phase-00-foundation.md) | In Build (correction round) | — | — |
| 01 | Product Engineering Passport | [phase-01-product-engineering-passport.md](phases/phase-01-product-engineering-passport.md) | Spec Drafted (revised) | — | — |
| 02 | Manufacturer Registry | [phase-02-manufacturer-registry.md](phases/phase-02-manufacturer-registry.md) | Spec Drafted (revised) | — | — |
| 03 | Manufacturer Intake Portal (Factory Portal) | [phase-03-supplier-portal.md](phases/phase-03-supplier-portal.md) | Spec Drafted (revised) | — | — |
| 04 | Engineering Compliance Validation | [phase-04-validation-engine.md](phases/phase-04-validation-engine.md) | Spec Drafted (revised) | — | — |
| 05 | Manufacturer Selection | [phase-05-manufacturer-selection.md](phases/phase-05-manufacturer-selection.md) | Spec Drafted (revised) | — | — |
| 06 | Cost Engine | [phase-06-cost-engine.md](phases/phase-06-cost-engine.md) | Spec Drafted (revised) | — | — |
| 07 | Pricing Engine | [phase-07-pricing-engine.md](phases/phase-07-pricing-engine.md) | Spec Drafted | — | — |
| 08 | Distributor Portal | [phase-08-distributor-portal.md](phases/phase-08-distributor-portal.md) | Spec Drafted (revised) | — | — |
| 09 | Order Management | [phase-09-order-management.md](phases/phase-09-order-management.md) | Spec Drafted | — | — |

**Note on Phase 03's file name:** the file is still named
`phase-03-supplier-portal.md` to avoid unnecessary churn in cross-references.
Its title and content are corrected to **Manufacturer Intake Portal (Factory
Portal)** — a raw-material Supplier concept no longer appears in its scope.
See ADR-0005.

## Notes on Current Status

- **Phase 00** is "In Build (correction round)" because this documentation
  set itself is the Phase 0 deliverable, and it was returned for correction
  rather than approved on first review. It moves to `Built` once the
  corrected Phase 0 audit report is delivered and the project owner
  approves proceeding to Phase 1.
- **Phases 01-09** are marked `Spec Drafted` because their spec files exist
  as first-pass drafts written during Phase 0 to prove the roadmap's
  dependency chain is coherent (see each file's own "Status" line). Phases
  marked "(revised)" were corrected in this round to remove the erroneous
  Supplier dependency and align with the Manufacturer Offer model. None of
  them are `Spec Approved` — per `CLAUDE_WORKFLOW.md`, approval is a
  separate, explicit step that has not yet occurred for any phase beyond 00.
  **No implementation work may start on Phases 01-09 based on their current
  draft status alone.**

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
