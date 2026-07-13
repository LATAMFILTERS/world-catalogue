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
