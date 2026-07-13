# Phase 00 — Foundation

**Status:** `APPROVED / FROZEN v1.0`
**Approved:** 2026-07-13, by the project owner, after two correction
rounds (ADR-0005/ADR-0006; ADR-0007/ADR-0008/ADR-0009) and a final
governance-decisions round (ADR-0010/ADR-0011/ADR-0012). See ADR-0013 in
`DECISIONS.md`.
**Branch:** `claude/phase-0-audit-review-wanxa3`
**Closing commit:** `cd1a9a78` ("docs: ebp: Final governance decisions
and approve/freeze Phase 0 v1.0").
**Depends on:** Nothing
**Blocks:** All other phases

**Frozen scope:** the domain model, entity list, and governance rules
established through ADR-0001–ADR-0013 (the three-entity model, Offer
versioning, packaging ownership split, note-field split, and Selection/
Approval governance) may not be changed without a new ADR that explicitly
supersedes the relevant prior entry. Phase specs may still be elaborated
with implementation detail as each phase moves through its own approval
gate — that is expected, not an architecture change.

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

- [x] Every file in the required structure exists and is internally
  consistent (no contradictions between `BUSINESS_RULES.md`,
  `PLATFORM_ARCHITECTURE.md`, and the phase specs) — verified across three
  review rounds, most recently by the consistency audit accompanying
  ADR-0013.
- [x] The audit report has been delivered (three times: initial, and after
  each of two correction rounds).
- [x] The project owner has reviewed the audit report and **formally
  approved Phase 0** on 2026-07-13 (ADR-0013). Phase 1 is authorized to
  begin; no phase beyond Phase 1 is authorized by this approval.

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
