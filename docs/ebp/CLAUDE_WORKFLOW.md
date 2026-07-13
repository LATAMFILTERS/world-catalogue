# CLAUDE WORKFLOW — ELIMFILTERS Business Platform (EBP)

This document governs how Claude sessions do EBP work. It is scoped to
`docs/ebp/` and any future `frontend`/`server.js` code that implements EBP
phases. It does not override root `CLAUDE.md`'s rules for the existing World
Catalogue/Knowledge System work — the two projects share a repository but are
governed independently. Where the two could conflict (e.g., git branch,
commit format), this document wins for anything under the EBP scope.

## 1. Branch

All EBP work happens on the branch the session was assigned for EBP work.
Do not mix EBP commits with unrelated World Catalogue/Knowledge System
commits in the same commit — keep history attributable per project even when
sharing a branch.

## 1.1 Domain Model Terms (binding, corrected 2026-07-13)

The MVP has exactly three principal entities: **ELIMFILTERS**,
**Manufacturer**, and **Distributor**. A raw-material/component **Supplier**
is not a mandatory MVP entity — see `BUSINESS_RULES.md` §1 and ADR-0005 in
`DECISIONS.md`. Do not:

- Introduce a `Supplier`-named table, route, or field as a dependency of any
  Phase 01-09 deliverable.
- Reference a Manufacturer by `legal_name` as a functional/join key — use
  `manufacturer_code` (`EFM-XXXX`) per ADR-0006.
- Build or expose any data path that lets Distributor-facing code (Phase 8
  or later) receive manufacturer identity, `EFM-XXXX`, FOB price, margin,
  or confidential engineering notes — this must be excluded at the data
  shape produced by Pricing Engine (Phase 7), not filtered after the fact.

If a future request seems to reintroduce a Supplier concept or a
manufacturer-identity leak toward Distributor Portal, stop and confirm with
the project owner before proceeding — these are both points that have
already been explicitly corrected once.

## 2. Phase Discipline (the core rule)

- **Read `IMPLEMENTATION_MASTER_INDEX.md` first**, every session, before
  doing anything else. It tells you the current phase and status.
- **Never write production code for a phase whose status is not
  `Spec Approved` or later.** Drafting/refining a spec doc is always
  allowed; implementing against it is not, until approved.
- **Stop at the end of a phase and wait for approval** before starting the
  next phase's implementation, even if the next phase's spec already exists
  in draft form. Draft specs for future phases exist to validate the
  roadmap's coherence, not to authorize building them early.
- If a session is asked to "continue" without a specific instruction, the
  correct default is: pick up the current phase per the Master Index, do
  not jump ahead.

## 3. Documentation-First Requirement

For any phase, before any implementation:

1. The phase's `phases/phase-NN-*.md` must be complete per the template
   (see any existing phase file for structure).
2. `BUSINESS_RULES.md` must be checked for rules that apply to the phase; if
   the phase surfaces a new rule, add it to `BUSINESS_RULES.md` in the same
   change, don't leave it only in the phase doc.
3. If the phase changes the architecture described in
   `PLATFORM_ARCHITECTURE.md`, update that document and log the change as a
   new entry in `DECISIONS.md`.

## 4. Approval Gate

A phase moves from `Spec Drafted` to `Spec Approved` in
`IMPLEMENTATION_MASTER_INDEX.md` only when the project owner explicitly
approves it in conversation. Claude does not self-approve a phase. If asked
to "just start Phase N," and Phase N is not yet `Spec Approved`, surface that
fact and ask for explicit approval rather than proceeding — this is a
decision for the user, not an assumption to make silently.

## 5. Commit Message Format

Use the same type-tag convention as root `CLAUDE.md`, scoped with an `ebp:`
prefix in the summary so EBP commits are greppable in shared history:

```
[type]: ebp: Brief description (50 chars max)

Longer explanation if needed (wrap at 72 chars).
- Bullet points for multiple changes
- Reference specific docs/phases changed

https://claude.ai/code/session_[ID]
```

Type tags: `feat`, `fix`, `content`, `design`, `build`, `docs`, `refactor`,
`chore` — same meanings as root `CLAUDE.md`.

Every commit that changes phase status must also update
`IMPLEMENTATION_MASTER_INDEX.md` and add a `CHANGELOG.md` entry in the same
commit.

## 6. Working with Existing Systems

- Treat `database/schema/*.sql`, `migrations/kg-phase*/*.sql`, and
  `scripts/*` as **read-only reference material** unless a specific,
  approved EBP phase explicitly calls for a change to them. Default
  assumption: don't touch them.
- New EBP tables are additive migrations only (`CREATE TABLE IF NOT EXISTS
  ebp_...`), following the existing migration file-numbering convention
  used under `migrations/kg-phaseN/`.
- Reuse existing product identifiers (SKUs) and existing reference tables
  (`technologies`, `oems`, `industries`) by foreign key. Never duplicate
  their data into new EBP tables.

## 7. When Something Is Ambiguous

If a phase spec, business rule, or architecture point is ambiguous and the
ambiguity would materially change what gets built, stop and ask rather than
guessing — consistent with the general engagement rules for this account.
Log the resolution in `DECISIONS.md` once answered so it isn't re-litigated
in a future session.

## 8. Testing and Local Verification (once code exists)

Once a phase reaches implementation (post-approval):

- Follow the existing repo's build/test conventions
  (`npm run build`, `npm run type-check` for frontend work; existing
  patterns in `server.js`/`scripts/` for backend work) rather than
  introducing new tooling.
- New EBP backend logic should include a way to verify it against seed/test
  data before it touches real catalog or pricing data, per the "no invented
  data in shared environments" rule in `BUSINESS_RULES.md` §12.

## 9. Session Startup

Every EBP session should begin by following `CLAUDE_START_PROMPT.md`
verbatim. That file is the canonical entry point; this document is the
detailed policy it points to.
