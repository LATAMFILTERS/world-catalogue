# ROADMAP — ELIMFILTERS Business Platform (EBP)

**Status:** Phase 0 — Foundation (revised, correction round, 2026-07-13)
**Rule:** No phase begins implementation without explicit approval on its
spec doc (`phases/phase-NN-*.md`) and its predecessors being approved. See
`CLAUDE_WORKFLOW.md`.

**Correction notice:** Phase 3's domain scope is corrected from "Supplier
Portal" (raw-material vendor management) to **Manufacturer Intake Portal /
Factory Portal** (Manufacturer Request Batch → Manufacturer Product Offer).
Phase 4 is corrected from a generic "Validation Engine" over
`Passport × Manufacturer × Supplier` to **Engineering Compliance
Validation** over `Passport Version × Manufacturer × Manufacturer Offer`.
See ADR-0005 in `DECISIONS.md`. File names under `phases/` are unchanged to
avoid unnecessary churn; each file's title and content are the authority on
its actual scope.

## Phase Sequence and Dependency Chain

| # | Phase | Depends on | Delivers |
|---|---|---|---|
| 00 | Foundation | — | This documentation set. No code. |
| 01 | Product Engineering Passport | 00 | ELIMFILTERS-owned canonical technical spec per SKU/product family: locked identification, required engineering, required packaging. |
| 02 | Manufacturer Registry | 01 | Registry of qualified manufacturing partners by product family, keyed by permanent confidential `EFM-XXXX` codes. |
| 03 | Manufacturer Intake Portal (Factory Portal) | 01, 02 | Manufacturer Request Batch mechanism + Manufacturer Product Offer collection (`offered_*`/`actual_*`, FOB, MOQ, lead time, capacity, packaging, evidence). |
| 04 | Engineering Compliance Validation | 01, 02, 03 | Gate that validates Passport Version × Manufacturer × Manufacturer Offer combinations against required engineering. |
| 05 | Manufacturer Selection | 02, 04 | Decision logic recommending primary/secondary/backup manufacturer per demand signal; ELIMFILTERS gives final approval. |
| 06 | Cost Engine | 02, 05 | Landed cost calculation (FOB + freight + duties + overhead) per validated, selected Offer. |
| 07 | Pricing Engine | 06 | Channel/region sell price derived from cost + margin rules; strips manufacturer/cost-basis fields before downstream exposure. |
| 08 | Distributor Portal | 01, 07 | Authenticated portal exposing priced, validated catalog — product and final price only, never manufacturer/FOB/margin. |
| 09 | Order Management | 08 | Order lifecycle: placement → allocation → production → shipment → invoicing. |

This is a strict dependency graph, not a strict calendar — phases may be
scoped/estimated once Phase 0 is approved, but no phase's build order may be
reshuffled without updating this table and logging the change in
`DECISIONS.md`.

**Phase 04 prerequisite (added 2026-07-13, ADR-0038):** before Phase 04's
implementation can be authorized, its rule-engine *behavior* — comparison
types, states, severity, exceptions, the Rule Catalog shape — must already
be fully defined in `ENGINEERING_RULE_ENGINE.md`, independent of any
API/schema design. Phase 4's own spec (`phases/phase-04-validation-
engine.md`) may not contradict that document; any deviation requires a
new ADR that explicitly supersedes the relevant section. See
`ENGINEERING_RULE_ENGINE.md`'s own "Open Questions" — all twelve must be
answered before Phase 4 code is written. **Phase 4 is now `APPROVED /
FROZEN v1.0`** (see `IMPLEMENTATION_MASTER_INDEX.md`).

**Phase 05 prerequisite (added 2026-07-13, ADR-0061):** before Phase 05's
implementation can be authorized, the Selection Engine's *philosophy and
business rules* — the ten philosophy terms, the seven Principles, the
Evaluation Factor dimensions, Eligibility/Exclusion, the Ranking
philosophy, Primary/Secondary/Backup rules, Manual Override, Versioning,
and Re-selection triggers — must already be fully defined in
`MANUFACTURER_SELECTION_ENGINE.md`, independent of any API/schema
design, mirroring the exact discipline `ENGINEERING_RULE_ENGINE.md`
established for Phase 4. Phase 5's own spec
(`phases/phase-05-manufacturer-selection.md`) may not contradict that
document; any deviation requires a new ADR that explicitly supersedes
the relevant section. See `MANUFACTURER_SELECTION_ENGINE.md`'s own "Open
Questions" — all twelve must be answered before Phase 5 code is written,
the highest-priority being the ranking weighting/scoring formula, left
entirely undefined by design.

## Phase Gate Definition

A phase is considered **ready to build** only when:

1. Its `phases/phase-NN-*.md` spec exists and covers: objective, scope
   (in/out), dependencies, data model sketch, business rules it enforces,
   integration points, deliverables, exit criteria, risks, open
   questions, and (added 2026-07-13, ADR-0037, for any phase authorized
   after Phase 3) a completed Dashboard Readiness section.
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

- **Milestone A — Engineering & Manufacturer Foundation** (Phases 01-03):
  establishes what a product must be, who exists to build it, and collects
  each qualified Manufacturer's actual offered response. No compliance
  verdict, cost, or pricing exists yet.
- **Milestone B — Qualification & Economics** (Phases 04-07): establishes
  that an Offer is compliant, which Manufacturer should be selected, what
  it costs, and what it sells for. Nothing is customer-facing yet.
- **Milestone C — Commercial Operation** (Phases 08-09): exposes the
  qualified, priced catalog to distributors and transacts orders against
  it, with manufacturer identity and cost basis never leaving the internal
  boundary.

## Explicitly Out of Scope for This Roadmap

- Raw-material/component Supplier management (filter media, adhesives,
  gaskets, cans) as an independently modeled, validated EBP entity. This is
  a Manufacturer-internal concern in the MVP and, if ever pursued, would be
  a distinct future phase with its own ADR — not a dependency of Phases
  01-09. See ADR-0005.
- Any change to `frontend/` public pages, Knowledge System content, or SEO/
  GEO structure.
- Any change to existing catalog import pipelines (`scripts/`) or the
  existing `database/schema/001`-`007` tables.
- Payment processing / financial settlement mechanics beyond invoicing
  status tracking (Phase 9 records invoicing status; it does not implement
  a payment gateway — that would be a future phase if pursued).
- Manufacturer/Distributor identity provider selection (Phases 3 and 8
  depend on this being decided, but Phase 0 does not decide it — see
  `PLATFORM_ARCHITECTURE.md` §7 open questions, ADR-0002).

## Cross-Cutting Capabilities (not phases, added 2026-07-13, ADR-0037)

Some capabilities apply to every phase rather than occupying a slot in
the Phase Sequence table above. They do not have a phase number, do not
block or get blocked by phase dependencies, and are not "built" on their
own calendar the way a phase is — they are a standing requirement every
phase must satisfy.

- **EBP Observability & Intelligence Layer** — every phase (current and
  future) must produce Activity Events, expose KPIs, generate structured
  alerts, and support Timeline reconstruction, so that a future Executive
  Dashboard/BI/AI layer can be built entirely from that shared
  infrastructure without ever reading a transactional table directly. See
  `PLATFORM_ARCHITECTURE.md` §8 and ADR-0037 in `DECISIONS.md` for the
  full architecture. **Not implemented yet** — architecture and contracts
  only, per ADR-0037.
- Starting with whichever phase is authorized after Phase 3, a phase's
  `phases/phase-NN-*.md` doc is not considered complete for the Phase
  Gate Definition above until it also has a completed "Dashboard
  Readiness" section (`CLAUDE_WORKFLOW.md` §3.1). This is now part of
  "Its `phases/phase-NN-*.md` spec exists and covers..." in the Phase
  Gate Definition, item 1.
