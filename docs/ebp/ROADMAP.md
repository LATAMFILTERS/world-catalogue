# ROADMAP — ELIMFILTERS Business Platform (EBP)

**Status:** Phase 0 — Foundation
**Rule:** No phase begins implementation without explicit approval on its
spec doc (`phases/phase-NN-*.md`) and its predecessors being approved. See
`CLAUDE_WORKFLOW.md`.

## Phase Sequence and Dependency Chain

| # | Phase | Depends on | Delivers |
|---|---|---|---|
| 00 | Foundation | — | This documentation set. No code. |
| 01 | Product Engineering Passport | 00 | Canonical technical spec per SKU/product family. |
| 02 | Manufacturer Registry | 01 | Registry of qualified manufacturing partners by product family. |
| 03 | Supplier Portal | 01 | Registry of component/material suppliers, scoped per manufacturer. |
| 04 | Validation Engine | 01, 02, 03 | Gate that validates (Passport × Manufacturer × Supplier) combinations. |
| 05 | Manufacturer Selection | 02, 04 | Decision logic choosing a manufacturer per demand signal. |
| 06 | Cost Engine | 02, 03, 05 | Landed cost calculation per validated, selected combination. |
| 07 | Pricing Engine | 06 | Channel/region sell price derived from cost + margin rules. |
| 08 | Distributor Portal | 01, 07 | Authenticated portal exposing priced, validated catalog. |
| 09 | Order Management | 08 | Order lifecycle: placement → allocation → production → shipment → invoicing. |

This is a strict dependency graph, not a strict calendar — phases may be
scoped/estimated once Phase 0 is approved, but no phase's build order may be
reshuffled without updating this table and logging the change in
`DECISIONS.md`.

## Phase Gate Definition

A phase is considered **ready to build** only when:

1. Its `phases/phase-NN-*.md` spec exists and covers: objective, scope
   (in/out), dependencies, data model sketch, business rules it enforces,
   integration points, deliverables, exit criteria, risks, and open
   questions.
2. All phases it depends on are marked `Approved` or `Built` in
   `IMPLEMENTATION_MASTER_INDEX.md`.
3. The project owner has explicitly approved the spec (see
   `CLAUDE_WORKFLOW.md` — approval gate).

A phase is considered **done** only when:

1. Its exit criteria (defined in its own spec) are met.
2. `CHANGELOG.md` has an entry.
3. `IMPLEMENTATION_MASTER_INDEX.md` status is updated.

## Milestone Grouping

For planning visibility, phases group into three milestones. Grouping is
informational; the phase gate rule above still governs actual sequencing.

- **Milestone A — Engineering Foundation** (Phases 01-03): establishes what
  a product is, who can build it, and what it's built from. No cost or
  pricing exists yet.
- **Milestone B — Qualification & Economics** (Phases 04-07): establishes
  that a build is valid, who should build it, what it costs, and what it
  sells for. Nothing is customer-facing yet.
- **Milestone C — Commercial Operation** (Phases 08-09): exposes the
  qualified, priced catalog to distributors and transacts orders against it.

## Explicitly Out of Scope for This Roadmap

- Any change to `frontend/` public pages, Knowledge System content, or SEO/
  GEO structure.
- Any change to existing catalog import pipelines (`scripts/`) or the
  existing `database/schema/001`-`007` tables.
- Payment processing / financial settlement mechanics beyond invoicing
  status tracking (Phase 9 records invoicing status; it does not implement
  a payment gateway — that would be a future phase if pursued).
- Distributor/staff identity provider selection (Phase 8 depends on this
  being decided, but Phase 0 does not decide it — see
  `PLATFORM_ARCHITECTURE.md` §7 open questions).
