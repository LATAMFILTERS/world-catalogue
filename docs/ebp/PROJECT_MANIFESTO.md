# PROJECT MANIFESTO — ELIMFILTERS Business Platform (EBP)

**Status:** Phase 0 — Foundation
**Owner:** ELIMFILTERS
**Created:** 2026-07-13

## 1. What EBP Is

The ELIMFILTERS Business Platform (EBP) is the operational system that turns a
filtration product from an **engineering specification** into a **sold,
manufactured, and delivered part**. It governs the business logic that sits
behind the public-facing World Catalogue: how a product is engineered, who is
allowed to manufacture it, what components it is built from, whether a given
build is valid, what it costs, what it sells for, and how a distributor orders
it.

EBP is not a marketing surface and not a content system. It is the system of
record for **product engineering, sourcing, cost, price, and order
fulfillment**.

## 2. What EBP Is Not

- It is **not** a replacement for the existing World Catalogue frontend
  (`/frontend`) or the Knowledge System. Those remain the public-facing
  catalog, documentation, and SEO/GEO surface.
- It is **not** a rewrite of the existing product catalog, cross-reference
  matching, or Knowledge Graph work already completed and documented under
  `docs/kg-phase0` through `docs/kg-phase8`. EBP **consumes** that catalog
  data (SKUs, OEM codes, technologies, industries) as an input; it does not
  reproduce it.
- It is **not** a second database. EBP extends the existing Postgres instance
  used by `server.js` with a new, clearly namespaced set of tables. See
  `PLATFORM_ARCHITECTURE.md`.
- It is **not** built until documentation, business rules, and phase
  contracts exist and are approved. No production code is written before a
  phase's spec has been reviewed.

## 3. Why EBP Exists

The existing platform answers: *"What is this part, and what does it cross
to?"* It does not yet answer:

- Who is engineering-approved to manufacture this SKU, at what quality tier?
- What raw materials and components does that manufacturing route require,
  and who supplies them?
- Is a given product + manufacturer + supplier combination valid against
  ELIMFILTERS engineering and compliance rules before it is produced?
- Given multiple qualified manufacturers, which one should fulfill a given
  order (cost, lead time, quality, region)?
- What does this SKU actually cost to land, and what should it sell for, by
  channel and region?
- How does a distributor browse a priced catalog, place an order, and track
  it to delivery?

EBP exists to answer these questions with an auditable system instead of
spreadsheets and ad hoc scripts.

## 4. Core Principles

1. **Documentation before code.** Every phase begins with a written spec
   (`phases/phase-NN-*.md`) that is reviewed and approved before
   implementation starts. Phase 0 produces no application code.
2. **Single source of truth per concern.** The Product Engineering Passport
   (Phase 1) is the canonical technical definition of a product. The Cost
   Engine (Phase 6) is the only place landed cost is computed. The Pricing
   Engine (Phase 7) is the only place sell price is computed. No module
   re-derives another module's authoritative output.
3. **Extend, don't fork, the existing catalog.** EBP tables reference existing
   catalog entities (SKUs, `technologies`, `oems`, `industries`) by their
   existing identifiers. EBP does not duplicate product master data.
4. **Validation is a gate, not a suggestion.** No product/manufacturer/
   supplier combination reaches Cost Engine, Pricing Engine, or Distributor
   Portal without passing the Validation Engine (Phase 4).
5. **Sequential, gated phases.** Phases are built in dependency order (see
   `ROADMAP.md`). A phase does not start implementation until its
   predecessors are approved and, where applicable, deployed.
6. **Neutral, technical tone.** EBP documentation and any resulting product
   surfaces follow the same language rules as the Knowledge System
   (`CLAUDE.md` — AI Citation Layer, Category Reframing Layer): no marketing
   superlatives, quantified claims only, standards cited by code.
7. **Traceability.** Every priced SKU must be traceable back to: the
   Engineering Passport version, the manufacturer and supplier that produced
   it, the cost calculation that priced it, and the validation result that
   approved it.

## 5. Relationship to the Existing Codebase

| Existing system | Role relative to EBP |
|---|---|
| `frontend/` (Next.js, World Catalogue + Knowledge System) | Public content and SEO/GEO surface. EBP's Distributor Portal is a **separate, authenticated** application; it does not live inside the public Knowledge System pages. |
| `server.js` + `database/schema/*.sql` (Postgres) | Existing system of record for catalog, OEM cross-references, technologies, knowledge graph, customer intelligence. EBP adds new tables to the **same** database under an `ebp_` namespace and foreign-keys into existing tables where possible. |
| `docs/kg-phase0` – `kg-phase8` | Prior work on catalog readiness, semantic modeling, and knowledge graph structure. Treated as a **read-only input**, not modified by EBP. |
| `scripts/` (MANN/Donaldson/Fleetguard import & matching) | Upstream data pipelines that populate the catalog EBP consumes. Out of scope for EBP to modify. |
| `part-search/` | Existing customer-facing part search tool. Out of scope; may later consume Pricing Engine output as a future integration, not part of Phase 0-9. |

## 6. Success Criteria for EBP (Program-Level)

- A product can be traced end-to-end: Engineering Passport → approved
  manufacturer → validated build → landed cost → sell price → distributor
  order — with every step attributable and auditable.
- No SKU is priced or offered to a distributor without a passing validation
  record.
- Manufacturer and supplier data is structured enough to support a real
  sourcing decision (Phase 5) without spreadsheets.
- The system extends the existing catalog without duplicating or
  contradicting it.

## 7. Governance

- All EBP documentation lives under `docs/ebp/`.
- Changes to approved phase specs are logged in `DECISIONS.md` and
  `CHANGELOG.md`, not silently edited.
- No phase after Phase 0 begins implementation without explicit approval
  from the project owner, per `CLAUDE_WORKFLOW.md`.
