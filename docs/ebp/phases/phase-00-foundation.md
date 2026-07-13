# Phase 00 — Foundation

**Status:** In Build (this document is part of its own deliverable)
**Depends on:** Nothing
**Blocks:** All other phases

## Objective

Establish the documentation base for the ELIMFILTERS Business Platform
before any production code is written: what it is, how it relates to the
existing catalog/World Catalogue system, what rules govern it, what the
proposed architecture is, and what order the remaining nine phases build in.

## Scope

**In scope:**
- `PROJECT_MANIFESTO.md`, `IMPLEMENTATION_MASTER_INDEX.md`,
  `CLAUDE_WORKFLOW.md`, `CLAUDE_START_PROMPT.md`, `BUSINESS_RULES.md`,
  `PLATFORM_ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md`,
  `CHANGELOG.md`.
- First-pass spec docs for Phases 01-09, sufficient to prove the roadmap's
  dependency chain is internally coherent.
- An audit of the existing codebase (backend stack, database schema
  conventions, SKU rules) so later architecture decisions are grounded in
  what actually exists, not assumptions.
- A Phase 0 audit report (architecture, risks, dependencies,
  recommendations, document list) delivered to the project owner.

**Out of scope:**
- Any application code, database migration, or API route.
- Any change to `frontend/`, `server.js`, `database/schema/`,
  `migrations/kg-phase*`, or `scripts/`.
- Selecting a distributor/staff auth provider (deferred, ADR-0002).
- Finalizing Phase 1-9 specs to `Spec Approved` status — Phase 0 drafts
  them; approval is a separate, later step per phase.

## Dependencies

None. Phase 0 is the root of the dependency graph.

## Key Entities / Data Model

None — Phase 0 produces no schema. (Phase 1 introduces the first EBP data
model.)

## Business Rules Enforced

None yet in code; Phase 0 is where `BUSINESS_RULES.md` itself is authored.

## Integration Points

- Reads (does not write): root `CLAUDE.md`, `docs/kg-phase0`-`kg-phase8`,
  `database/schema/*.sql`, `migrations/kg-phase*/*.sql`, `server.js`,
  `package.json`, `.env.example`.

## Deliverables

1. All files listed in "Scope: In scope" above, committed to
   `docs/ebp/`.
2. A Phase 0 audit report (delivered in-session, not necessarily a
   committed file) covering architecture, risks, dependencies,
   recommendations, and the document list.

## Exit Criteria

- Every file in the required structure exists and is internally consistent
  (no contradictions between `BUSINESS_RULES.md`, `PLATFORM_ARCHITECTURE.md`,
  and the phase specs).
- The audit report has been delivered.
- The project owner has reviewed the audit report. (Approval to proceed to
  Phase 1 is a separate, explicit step — Phase 0 "done" means the
  deliverable is complete and reviewable, not that Phase 1 is
  automatically authorized.)

## Risks

- **Risk: architecture assumptions age quickly.** The existing codebase
  (`server.js`, `database/schema/`) was audited once, at a point in time.
  If it changes materially before Phase 1 starts, `PLATFORM_ARCHITECTURE.md`
  §1 needs re-validation before Phase 1 implementation begins.
- **Risk: draft Phase 1-9 specs create false momentum.** Because first-pass
  specs exist for all nine downstream phases, there's a risk a future
  session reads "spec exists" as "spec approved" and starts building. This
  is why `IMPLEMENTATION_MASTER_INDEX.md` and `CLAUDE_WORKFLOW.md` both
  state the approval gate explicitly and redundantly.
- **Risk: undecided auth blocks Milestone C late.** ADR-0002 defers the
  distributor/staff auth decision. If left until Phase 8 actually starts,
  it could stall Milestone C. Recommendation: resolve during Milestone B.

## Open Questions

- See `PLATFORM_ARCHITECTURE.md` §7 (Redis's role in EBP, per-environment
  `DATABASE_URL` handling) — carried forward, not blocking Phase 1.
