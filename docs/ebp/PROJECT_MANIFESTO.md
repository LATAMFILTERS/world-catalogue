# PROJECT MANIFESTO — ELIMFILTERS Business Platform (EBP)

**Status:** Phase 0 — Foundation (revised, correction round)
**Owner:** ELIMFILTERS
**Created:** 2026-07-13
**Revised:** 2026-07-13 — domain model correction, see ADR-0005 and ADR-0006
in `DECISIONS.md`. This revision replaces the raw-material "Supplier"
concept in the original draft with the agreed three-entity MVP model below.
It does not change §1-§2's framing, only the entity model and the phase
chain.

## 1. What EBP Is

The ELIMFILTERS Business Platform (EBP) is the operational system that turns a
filtration product from an **engineering specification** into a **sold,
manufactured, and delivered part**. It governs the business logic that sits
behind the public-facing World Catalogue: how a product is engineered, who is
allowed to manufacture it, whether a given manufacturer's offer is valid,
what it costs, what it sells for, and how a distributor orders it.

EBP is not a marketing surface and not a content system. It is the system of
record for **product engineering, manufacturer qualification, cost, price,
and order fulfillment**.

## 1.1 The Three MVP Entities

The MVP models exactly three principal actors. Every phase in the roadmap
exists to govern the relationship between them.

1. **ELIMFILTERS** — owns and defines the Product Engineering Passport: the
   mandatory specification, technology assignment, packaging requirements,
   and final approval authority for every SKU. ELIMFILTERS never
   manufactures directly; it defines what "correct" means and approves who
   is allowed to build it.
2. **Manufacturer** — the factory that produces the finished filter. A
   Manufacturer receives assigned products (a Request Batch), responds
   whether it can produce them, submits its own offered specification and
   commercial terms (a Manufacturer Product Offer — FOB, MOQ, lead time,
   capacity, packaging, evidence), and is identified internally by a
   permanent, confidential code (`EFM-XXXX`), never by name as a functional
   key. See `phases/phase-02-manufacturer-registry.md`.
3. **Distributor** — sees only ELIMFILTERS-approved products at their final
   approved price. A Distributor never sees which Manufacturer produced a
   SKU, its `EFM-XXXX` code, FOB price, margin, or any confidential
   engineering detail. See `BUSINESS_RULES.md` §10 and ADR-0006.

Raw-material and component suppliers (filter media, adhesives, gaskets,
cans) are **explicitly out of the MVP**. They are a Manufacturer-internal
concern, not a modeled EBP entity, and must not appear as a dependency of
any Phase 01-09 spec. See ADR-0005.

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
- Does a given Manufacturer's offered specification actually comply with
  ELIMFILTERS' required engineering before it is produced?
- Given multiple qualified manufacturers with compliant offers, which one
  should fulfill a given order (FOB cost, lead time, quality, capacity,
  region)?
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
4. **Validation is a gate, not a suggestion.** No Passport × Manufacturer ×
   Manufacturer Offer combination reaches Manufacturer Selection, Cost
   Engine, Pricing Engine, or Distributor Portal without passing Engineering
   Compliance Validation (Phase 4).
5. **Sequential, gated phases.** Phases are built in dependency order (see
   `ROADMAP.md`). A phase does not start implementation until its
   predecessors are approved and, where applicable, deployed.
6. **Neutral, technical tone.** EBP documentation and any resulting product
   surfaces follow the same language rules as the Knowledge System
   (`CLAUDE.md` — AI Citation Layer, Category Reframing Layer): no marketing
   superlatives, quantified claims only, standards cited by code.
7. **Traceability.** Every priced SKU must be traceable back to: the
   Engineering Passport version, the manufacturer and offer that produced
   it, the cost calculation that priced it, and the compliance validation
   result that approved it.
8. **Manufacturer confidentiality by default.** Manufacturer identity,
   `EFM-XXXX` code, FOB price, margin, and confidential engineering are
   never exposed to a Distributor. This is enforced at the data boundary
   between Pricing Engine and Distributor Portal, not just in the UI. See
   ADR-0006.

## 5. Relationship to the Existing Codebase

| Existing system | Role relative to EBP |
|---|---|
| `frontend/` (Next.js, World Catalogue + Knowledge System) | Public content and SEO/GEO surface. EBP's Distributor Portal is a **separate, authenticated** application; it does not live inside the public Knowledge System pages. |
| `server.js` + `database/schema/*.sql` (Postgres) | Existing system of record for catalog, OEM cross-references, technologies, knowledge graph, customer intelligence. EBP adds new tables to the **same** database under an `ebp_` namespace and foreign-keys into existing tables where possible. |
| `docs/kg-phase0` – `kg-phase8` | Prior work on catalog readiness, semantic modeling, and knowledge graph structure. Treated as a **read-only input**, not modified by EBP. |
| `scripts/` (MANN/Donaldson/Fleetguard import & matching) | Upstream data pipelines that populate the catalog EBP consumes. Out of scope for EBP to modify. |
| `part-search/` | Existing customer-facing part search tool. Out of scope; may later consume Pricing Engine output as a future integration, not part of Phase 0-9. |

## 6. Success Criteria for EBP (Program-Level)

- A product can be traced end-to-end: Engineering Passport → Manufacturer
  Request Batch → Manufacturer Product Offer → compliance-validated build →
  selected manufacturer → landed cost → sell price → distributor order —
  with every step attributable and auditable.
- No SKU is priced or offered to a distributor without a passing Engineering
  Compliance Validation record.
- No Distributor-visible data ever carries manufacturer identity, FOB, or
  margin.
- Manufacturer and offer data is structured enough to support a real
  sourcing decision (Phase 5) without spreadsheets.
- The system extends the existing catalog without duplicating or
  contradicting it.

## 7. Governance

- All EBP documentation lives under `docs/ebp/`.
- Changes to approved phase specs are logged in `DECISIONS.md` and
  `CHANGELOG.md`, not silently edited.
- No phase after Phase 0 begins implementation without explicit approval
  from the project owner, per `CLAUDE_WORKFLOW.md`.
