# PLATFORM ARCHITECTURE — ELIMFILTERS Business Platform (EBP)

**Status:** Phase 0 — Proposed, not yet built (revised, second correction
round, 2026-07-13)
**Depends on:** `PROJECT_MANIFESTO.md`, `BUSINESS_RULES.md`

**Correction notice (first round):** This revision replaces the original
module map's `Supplier Portal` / `Passport × Manufacturer × Supplier`
model with the agreed MVP chain: `Manufacturer Request Batch` →
`Manufacturer Product Offer` → `Engineering Compliance Validation` on
`Passport Version × Manufacturer × Manufacturer Offer`. See ADR-0005 and
ADR-0006 in `DECISIONS.md`.

**Correction notice (second round, this revision):** A Manufacturer
Product Offer is now versioned — many revisions per (Passport Version ×
Manufacturer), exactly one active at a time (ADR-0007). A new **Offer
Approval** step, distinct from technical validation, sits between
Engineering Compliance Validation and Manufacturer Selection (ADR-0008).
Passport notes are split into a manufacturer-visible field and an
internal-only field, each served by its own role-specific projection
(ADR-0009).

This document describes the proposed technical architecture for EBP. Nothing
in this document is implemented yet. It exists so that Phase 1 onward has an
agreed target to build against.

## 1. Existing System (as-found, Phase 0 audit)

| Layer | Technology | Notes |
|---|---|---|
| Public frontend | Next.js 14, static export (`frontend/out/`) | World Catalogue + Knowledge System. Deployed as a static site. |
| API backend | Node.js + Express, single `server.js` (~2,486 lines) | Search, catalog, admin-key-gated import/admin endpoints, rate-limited via `express-rate-limit`. |
| Database | PostgreSQL (Railway by default; Neon/Supabase supported via `DATABASE_URL`) | Accessed via `pg` (`Client`/`Pool`). Schema organized under `database/schema/001`–`007` (core taxonomy, catalog relationships, knowledge graph, customer intelligence, digital twins, predictive protection, autonomous protection) plus `migrations/kg-phase1`–`kg-phase8`. |
| Caching | `ioredis` (Redis) | Used by the existing backend; availability/role not yet fully mapped for Phase 0 (see Risks). |
| Auth (existing) | Static `ADMIN_KEY` bearer token via `requireAdmin` middleware | Applies to admin/import endpoints only. No end-user, Manufacturer, or Distributor auth exists today. |
| Mail | `nodemailer` via GoDaddy SMTP | Used by the contact form. |
| Product identity | SKU architecture (HD `EA1/EH6/EL8/...`, LD `EL3/EA3/EC3/EF3`) | Defined in root `CLAUDE.md`. This is the join key EBP uses to reference catalog products — EBP does not mint its own product identifiers. |

**Key existing tables EBP will reference (not modify):** `technologies`,
`oems` (vehicle-OEM manufacturers, e.g. FIAT/VW — **not** the same concept as
an EBP "Manufacturer," see `BUSINESS_RULES.md` §1), `industries`, `assets`,
and the product/catalog tables that hold SKUs and cross-reference data.

## 2. Design Decision: Extend, Not Fork

EBP will **not** stand up a separate database or a separate backend service
in Phase 0/1. It extends the existing Postgres database with new tables under
an `ebp_` table-name prefix, and adds new route modules to the existing
Express app rather than a new server process. Rationale and alternatives
considered are recorded in `DECISIONS.md` (ADR-0001).

## 3. Module Map (corrected)

Each module corresponds to one phase (see `ROADMAP.md`). Modules are
additive — later modules depend on earlier ones but earlier modules do not
depend on later ones. **There is no Supplier module in the mandatory
chain** — see ADR-0005.

```
                        ┌────────────────────────────┐
                        │   Existing Catalog (SKUs,   │
                        │  OEM codes, technologies)   │
                        └──────────────┬─────────────┘
                                       │ referenced by SKU
                                       ▼
                 ┌───────────────────────────────────────┐
                 │  01 · Product Engineering Passport     │  ELIMFILTERS-owned
                 │       (required_* fields, locked)      │  requirement
                 └───────────────────┬─────────────────────┘
                                     ▼
                 ┌───────────────────────────────────────┐
                 │  02 · Manufacturer Registry             │  who exists,
                 │  (EFM-XXXX code, families, status)      │  qualified for what
                 └───────────────────┬─────────────────────┘
                                     ▼
                 ┌───────────────────────────────────────┐
                 │  03 · Manufacturer Intake Portal        │  Request Batch →
                 │  (Factory Portal)                       │  Manufacturer
                 │  → Manufacturer Product Offer (versioned│  Product Offer,
                 │    offer_id/offer_revision, 8-state      │  many revisions,
                 │    status, one active at a time — §5)    │  one active
                 │  → Offer Approval (packaging final       │  (distinct from
                 │    decision, elimfilters_approved_       │  Validation — §7)
                 │    quantity — ebp_manufacturer_offer_    │
                 │    approvals)                            │
                 └───────────────────┬─────────────────────┘
                                     ▼
                 ┌───────────────────────────────────────┐
                 │  04 · Engineering Compliance Validation │  Passport Version ×
                 │  required_* vs offered_* per property,  │  Manufacturer Code ×
                 │  bound to a specific Offer ID + Revision │  Offer ID × Revision
                 └───────────────────┬─────────────────────┘
                                     ▼
                 ┌───────────────────────────────────────┐
                 │  05 · Manufacturer Selection            │  primary / secondary
                 │  (FOB, packaging, MOQ, lead time,       │  / backup recommend.,
                 │   capacity, certs, evidence, quality;    │  exact offer_id +
                 │   only current-active + VALID offers)    │  offer_revision saved
                 └───────────────────┬─────────────────────┘  ELIMFILTERS approves
                                     ▼
                 ┌───────────────────────────────────────┐
                 │  06 · Cost Engine                       │  FOB (from selected
                 │  (FOB + freight + duties + overhead)    │  Offer) + landed cost
                 └───────────────────┬─────────────────────┘
                                     ▼
                 ┌───────────────────────────────────────┐
                 │  07 · Pricing Engine                    │  strips manufacturer/
                 │  (cost + margin, confidentiality strip) │  FOB/margin before
                 └───────────────────┬─────────────────────┘  downstream exposure
                                     ▼
                 ┌───────────────────────────────────────┐
                 │  08 · Distributor Portal                │  sees product +
                 │  (never sees Manufacturer/FOB/margin)   │  final price only
                 └───────────────────┬─────────────────────┘
                                     ▼
                 ┌───────────────────────────────────────┐
                 │  09 · Order Management                  │
                 └───────────────────────────────────────┘
```

## 4. Data Flow Summary (corrected)

1. **Engineering Passport (01)** defines *what* a product must be:
   locked identification, `required_*` engineering fields, and required
   packaging — entirely ELIMFILTERS-owned and never editable by a
   Manufacturer.
2. **Manufacturer Registry (02)** records *who exists* and what product
   families each Manufacturer is qualified to produce, keyed by permanent
   confidential `EFM-XXXX` codes, not by name.
3. **Manufacturer Intake Portal (03)** sends a Request Batch of Passports to
   one or more qualified Manufacturers and collects each Manufacturer's
   Product Offer: its `offered_*`/`actual_*` answer to every applicable
   `required_*` Passport property, plus FOB, MOQ, lead time, capacity,
   its packaging proposal (`manufacturer_recommended_quantity`, proposed
   dimensions, weights, protection, palletization), and evidence. A
   Manufacturer may submit many versioned Offers for the same Passport
   Version over time; only one is active at a time (ADR-0007). There is no
   supplier tier modeled here — sourcing internal to the Manufacturer is
   its own concern (ADR-0005). ELIMFILTERS separately records its own
   **Offer Approval** decision per Offer — final approved packaging and
   `elimfilters_approved_quantity` — in `ebp_manufacturer_offer_approvals`,
   distinct from technical validation (ADR-0008).
4. **Engineering Compliance Validation (04)** checks a specific (Passport
   Version × Manufacturer Code × Offer ID × Offer Revision) combination's
   `offered_*` values against the Passport's `required_*` values and sets
   `compliance_status` and an overall `VALID`/`INVALID` result, bound
   permanently to that exact Offer revision. Nothing after this point may
   reference an unvalidated combination or a superseded/expired revision.
5. **Manufacturer Selection (05)** ranks, among Offers that are both the
   current active revision for their (Passport Version × Manufacturer) and
   hold a current `VALID` result within its effectiveness window, by FOB,
   packaging, MOQ, lead time, capacity, certifications, evidence, and
   quality history — and recommends a primary, secondary, and backup
   Manufacturer, recording the exact `offer_id`/`offer_revision` selected
   for each tier. ELIMFILTERS gives final approval.
6. **Cost Engine (06)** computes landed cost from the approved Offer's FOB
   price plus freight, duties, and overhead — it does not decompose the
   Manufacturer's internal cost structure.
7. **Pricing Engine (07)** computes channel/region sell price from cost
   plus margin and positioning rules, and **strips all manufacturer-
   identifying and cost-basis fields** before its output is available to
   Distributor Portal (ADR-0006).
8. **Distributor Portal (08)** exposes the priced, validated catalog to
   authenticated distributor accounts — product and final price only.
9. **Order Management (09)** turns a distributor selection into a tracked
   order: allocation to a Manufacturer (internal-only reference), production/
   shipment status, invoicing — with the same confidentiality boundary
   applied to any distributor-visible order record.

## 5. Proposed API Surface (high level, not final)

New route modules under the existing Express app, namespaced `/api/ebp/*`,
gated by a distinct auth mechanism from the current `ADMIN_KEY` (see
`DECISIONS.md` ADR-0002 — Manufacturer/Distributor auth is undesigned as of
Phase 0 and is explicitly a Phase 3/8 dependency, not a Phase 0
deliverable):

- `/api/ebp/passports` — Product Engineering Passport CRUD/read (Phase 1)
- `/api/ebp/manufacturers` — Manufacturer Registry (Phase 2)
- `/api/ebp/intake/batches` — Manufacturer Request Batch (Phase 3)
- `/api/ebp/intake/offers` — Manufacturer Product Offer, versioned (Phase 3)
  — reads/writes must always address a specific `offer_id`/`offer_revision`,
  never "the Offer" for a Manufacturer/Passport pair.
- `/api/ebp/intake/offer-approvals` — Offer Approval decisions against a
  specific Offer revision (Phase 3, `ebp_manufacturer_offer_approvals`),
  distinct from `/api/ebp/compliance` below.
- `/api/ebp/compliance` — Engineering Compliance Validation (Phase 4)
- `/api/ebp/selection` — Manufacturer Selection (Phase 5)
- `/api/ebp/cost` — Cost Engine (Phase 6)
- `/api/ebp/pricing` — Pricing Engine (Phase 7)
- `/api/ebp/distributor` — Distributor Portal (Phase 8) — response payloads
  must be constructed from a confidentiality-safe projection, never from
  the internal Offer/Manufacturer/Cost records directly.
- `/api/ebp/orders` — Order Management (Phase 9)

This is directional only; each phase's own spec (`phases/phase-NN-*.md`) is
the authority on its actual endpoints once written and approved.

## 6. Non-Functional Requirements (carried into every phase)

- **Auditability:** every write to an EBP table that affects cost, price, or
  validation status must be attributable (who/what/when) and retained, not
  overwritten in place.
- **Confidentiality by construction:** any data path that can reach
  Distributor Portal must be checked against `BUSINESS_RULES.md` §11-§12 at
  design time — manufacturer identity, `EFM-XXXX`, FOB, margin, and
  Passport note fields are excluded at the data-shape level, not filtered
  late in the UI layer. The same allow-list-projection discipline applies
  to every role-specific Passport view (Manufacturer vs. internal
  ELIMFILTERS vs. Distributor), per ADR-0009 — a generic "serialize the
  Passport" response is never an acceptable implementation for any role.
- **Backward compatibility:** no phase may alter existing catalog tables'
  schema or semantics. EBP reads from and adds foreign keys to the existing
  catalog; it does not migrate it.
- **Environment separation:** EBP introduces no new required environment
  variables beyond what is documented in each phase's spec and reflected in
  `.env.example`.
- **No production code before spec approval:** consistent with
  `PROJECT_MANIFESTO.md` §4.1.

## 7. Open Architectural Questions (carried to Phase 1+)

See the Phase 0 audit report for the full list; summarized here for
traceability:

- Where does Manufacturer and Distributor authentication live? (Blocks
  Phase 3 and Phase 8 design — see ADR-0002, still unresolved after this
  correction round.)
- Does Redis (`ioredis`) play any role in EBP (e.g., caching Cost/Pricing
  Engine outputs), or is it out of scope until a phase specifically needs it?
- Should `ebp_*` tables live in the same logical database as the catalog
  tables in all environments (dev/staging/prod), or only in prod, given the
  existing `DATABASE_URL` is environment-specific and not yet documented
  per-environment in this repo?
- How is `EFM-XXXX` code collision-avoidance and generation handled
  (random with uniqueness check, sequential with obfuscation, etc.)? Not
  decided in Phase 0 — a concrete detail for Phase 2's spec approval.
- Does Manufacturer Selection (Phase 5) require an Offer Approval record
  (§7 / ADR-0008) in addition to a current `VALID` validation before an
  Offer is even *recommended*, or is Offer Approval only required before
  an order is actually fulfilled against it? Not decided in this
  correction round — flagged in `phases/phase-05-manufacturer-selection.md`.
