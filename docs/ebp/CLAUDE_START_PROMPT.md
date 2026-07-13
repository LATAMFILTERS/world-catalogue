# CLAUDE START PROMPT — ELIMFILTERS Business Platform (EBP)

Read this file first, in full, at the start of every EBP session — before
touching code, before proposing changes, before answering questions about
EBP scope. This is the entry point; every other `docs/ebp/` file is reached
from here.

## Step 1 — Load Context, In Order

1. `PROJECT_MANIFESTO.md` — what EBP is, what it isn't, core principles.
2. `IMPLEMENTATION_MASTER_INDEX.md` — current status of every phase. This
   tells you where the project actually is right now.
3. `BUSINESS_RULES.md` — domain rules that govern every phase's design.
4. `PLATFORM_ARCHITECTURE.md` — the technical architecture EBP builds
   toward, and how it relates to the existing World Catalogue / Postgres /
   Express stack.
5. `ROADMAP.md` — phase sequence, dependency chain, gate definitions.
6. `DECISIONS.md` — architecture decisions already made; don't re-litigate
   these without a stated reason.
7. `CHANGELOG.md` — recent history, so you know what changed most recently
   and why.
8. The specific `phases/phase-NN-*.md` file for whatever phase
   `IMPLEMENTATION_MASTER_INDEX.md` says is current.
9. `CLAUDE_WORKFLOW.md` — the operating rules for how you do the work
   (branch, commits, approval gate, phase discipline).

## Step 2 — Determine What You're Allowed To Do

From `IMPLEMENTATION_MASTER_INDEX.md`, determine the status of the current
phase:

- **`Not Started` or `Spec Drafted`** → You may write or refine
  documentation (the phase's spec, related `BUSINESS_RULES.md` or
  `PLATFORM_ARCHITECTURE.md` updates). You may **not** write production
  code for that phase.
- **`Spec Approved`** → You may begin implementation, following
  `CLAUDE_WORKFLOW.md`.
- **`In Build`** → Continue implementation against the approved spec. If the
  work reveals the spec needs to change, stop and flag it — don't silently
  diverge from an approved spec.
- **`Built`** → That phase is done. Confirm before touching it again; changes
  to a built phase are maintenance, not new development, and should be
  scoped explicitly.
- **`Blocked`** → Do not proceed on that phase. Surface the blocker.

If asked to "continue" or "keep going" with no further specifics, the
correct action is to resume the **current** phase at its current status —
never to jump ahead to a later phase because its draft spec already exists.

## Step 3 — Phase 0 Specifically

Phase 0 (Foundation) has one deliverable: the documentation set in this
directory. Phase 0 explicitly excludes writing any production code,
anywhere in the repository, for EBP. If you are asked to build EBP
functionality and Phase 0 has not been marked `Built` in
`IMPLEMENTATION_MASTER_INDEX.md`, stop and confirm the project owner wants
to skip ahead before doing anything else — this is a deliberate gate, not an
oversight.

At the end of Phase 0 work, produce an audit report covering:

- Proposed architecture (summary of `PLATFORM_ARCHITECTURE.md`)
- Risks found (technical, dependency, or scope risks discovered while
  writing the foundation docs)
- Dependencies (on the existing catalog system, on undecided items like
  auth)
- Recommendations for Phase 1
- List of documents created

Then stop. Do not begin Phase 1 without explicit approval.

## Step 4 — Boundaries With the Rest of the Repository

- EBP is documented and built independently of the World Catalogue /
  Knowledge System governed by root `CLAUDE.md`. Don't apply EBP rules to
  that project or vice versa; they are related but separately governed.
- EBP reads the existing catalog (SKUs, `technologies`, `oems`,
  `industries`) as reference data. It does not modify
  `database/schema/001`-`007`, `migrations/kg-phase*`, or `scripts/`
  without an explicit, approved phase spec calling for it.
- If a request seems to blur these boundaries (e.g., "update the homepage
  to mention EBP pricing"), treat it as out of scope for EBP phases and
  confirm with the user which project's rules should govern before acting.

## Step 5 — When In Doubt

Ask. This program is explicitly gated (documentation before code, phase by
phase, approval before build) because it replaces ad hoc spreadsheets and
scripts with an auditable system — silently guessing at scope defeats the
purpose. `CLAUDE_WORKFLOW.md` §7 covers this in more detail.
