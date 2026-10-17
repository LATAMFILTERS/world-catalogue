# KUBOTA USA — catalogue research kickoff
Date: 2026-10-17
Status: RESEARCH_OPEN (not a published catalogue)
Market: United States
Owner: Technical HERMES / world-catalogue

## Objective
Build US Kubota equipment-to-engine-to-genuine-filter-OEN-to-verified-aftermarket-to-existing-ELIMFILTERS-product coverage. Include current and historical variants where primary evidence permits. First commercial segment: utility vehicles and institutional/facility grounds maintenance. Expand to mowers, tractors, construction machinery, industrial engines, and filterable farm equipment.

## Reused governance (no parallel system)
- `CLAUDE.md`: repository boundary, SKU governance, local Lenovo primary execution, technical HERMES.
- `config/vehicle-platform-closure/isuzu-us-phase2-oem.json`: phase sequence and evidence gate; do NOT reuse Isuzu-specific diesel-only/positions as universal Kubota facts.
- `docs/hermes/ISUZU_US_DIESEL_CLOSURE_2000_2026.md`: historical phase review pattern.
- `CROSS_REFERENCE_CLASSIFICATION_STANDARD.md`: OEM vs CROSS_REFERENCE vs ALTERNATIVE vs REVIEW_REQUIRED; HD canonical-source precedence.
- `docs/kg-phase0/EQUIPMENT_NORMALIZATION_REPORT.md`: existing kubota make normalization, estimated historical mentions only, NOT a live count.
- `lib/product-page-data.js`: Kubota already represented among recognized OEM makes.
- Adjacent repository `LATAMFILTERS/elimfilters-crm` checked via accessible GitHub code search (no Kubota result); CRM owns operations, not canonical product knowledge.

## Primary sources / provenance
1. Kubota USA official Parts & Service: https://www.kubotausa.com/parts-service (Quick Parts Lookup, Illustrated Parts List, Operator's Manuals).
2. Kubota USA Parts Lookup: https://www.kubotausa.com/parts-service/kubota-parts-lookup
3. Official RTV-X family spec PDF: https://www.kubotausa.com/docs/default-source/spec-sheets/rtvx1100_specs.pdf
4. Kubota USA Keyless Start manuals page, independently lists RTV-X900, RTV-X1100C, RTV-X1120, RTV-X1140: https://www.kubotausa.com/parts-service/kubota-parts-products/keyless-start-system

Sources 1-4 verify entry points and model-family existence, NOT filter OEM numbers or interchangeability.

## Binding canonical source rule — user confirmed 2026-10-17
**Mandatory per Kubota equipment engine fuel type and product domain:**
1. Identify the actual Kubota equipment, exact engine, year/serial applicability and genuine Kubota OEN from manufacturer primary parts data. No dealer kit, aftermarket cross, or engine-family inference is allowed to become OEM evidence.
2. For **diesel filtration**, check **Donaldson** first for a documented, manufactured, genuinely interchangeable filter with the same position/technical specification. If Donaldson does not manufacture a verified applicable cross, check **Fleetguard**. If neither supplies a verified applicable cross, use the **Kubota genuine OEN** as the proposed canonical base, subject to existing SKU rules and collision checks. Lack of search results is not proof of non-manufacture; unresolved cases remain blocked for review.
3. For **gasoline engine equipment**, use the existing light-duty regional authority: **FRAM for US/non-European applications**; **MANN-FILTER for European LD**. Apply actual product/duty classification before selecting a canonical base. No diesel Donaldson rule inherited into gasoline or cross-category products.
4. Baldwin, WIX, HIFI, Hengst, etc. may be research corroboration only where existing governance permits; they must **not** select Kubota diesel canonical base. Do not use their product codes to propose ELIMFILTERS SKUs.
5. Never mint or publish SKU based only on dealer/aftermarket fitment claims or on an unverified OEN. Match existing ELIMFILTERS products first; enforce natural-prefix SKU and STOP_REVIEW rules from CLAUDE.md.
6. Never equate distinct OENs or hydraulic/transmission filtration positions without Kubota-specific documentary evidence.

## Phase 1: initial model queue (CANDIDATE, model-year applicability NOT yet validated)
| Family | Model | Phase-1 status | Motor association |
|---|---|---|---|
| RTV-X | RTV-X900 | CANDIDATE | D902-E4-UV in cited family spec; serial/year verify |
| RTV-X | RTV-X1120 | CANDIDATE | D1105-E4-UV in cited family spec; serial/year verify |
| RTV-X | RTV-X1100C | CANDIDATE | D1105-E4-UV in cited family spec; serial/year verify |
| RTV-X | RTV-X1140 | CANDIDATE | D1105-E4-UV in cited family spec; serial/year verify |

Additional discovery queue: RTV/Sidekick (different fuel/engine where applicable); diesel commercial mowers; BX/B/LX/L/M tractors; KX/U/SVL/SSV construction; standalone industrial engines. Enumerate exact US models and model years from Kubota primary evidence before attaching fitment.

## Phase 2: required filter-position investigation
For each validated model/year/engine/serial range, discover applicable primary/secondary air, lube, fuel, fuel-water separation, hydraulic, hydrostatic/VHT, suction, cabin, and cooling-system filtration IF ACTUALLY PRESENT. Do not infer a position simply because another Kubota model has it.
Required evidence fields: market, family, model, variant, year_from/year_to, serial_bounds_if_relevant, engine_exact, filter_position, genuine_OEN, supersession_basis, source_url, document_revision, observed_at, evidence_excerpt/location, status.

## Phase 3: aftermarket and catalogue binding
After exact Kubota genuine OEN and application are evidenced, resolve Donaldson according to canonical HD governance; Fleetguard next when applicable; other manufacturers for corroboration. Never promote aftermarket similarity to an OEM fitment. Reconcile existing canonical products, existing base and SKU, and physical specs before proposed additions. All tentative crosses remain REVIEW_REQUIRED, outside public outputs.

## Seed reference review queue — NOT VERIFIED
Prior conversational candidate Kubota numbers, requiring independent primary lookup BEFORE using in catalog:
HH150-32430; 6A320-59930; 1G319-11210; K7591-82360; HHK32-16770; HHK70-14073.
Prior conversation surfaced conflicting oil OEN for RTV-X900. None of those six is presently certified as fitting a specific RTV-X model. Do NOT bulk-ingest purported aftermarket crosses from conversation.

## Validation gates
PHASE_1: official US model/year + engine identification and scope.
PHASE_2: genuine OEN per exact filter position and serial/model scope.
PHASE_3: published manufacturer cross plus physical compatibility and governance.
CATALOGUE_BIND: existing ELIMFILTERS product before any new product proposal.
PUBLISH: reviewed, tested, approved only. Not part of this kickoff.

## Execution / immediate next actions on ELIMSERVER
1. Read existing Isuzu Phase 1/2/3 artifact schema and current Technical HERMES procedures; check adjacent CRM for shared capability, not only keyword presence.
2. Read-only query actual Kubota matches in PostgreSQL, including equipment applications and OEM codes. Record counts and candidate duplicates; historical '~150+' is not evidence of today's database state.
3. Enumerate Kubota US RTV-X variants/years and serial qualifications from official material.
4. Capture exact parts-list OEN for four seed models, then cross references. Retain URLs and citations.
5. Validate through existing code/tests and produce a reviewable diff; no CRM writes or deployment.

## What was created and why
Created only this kickoff research document, isolated in a non-default Git branch. No new code, script, table, service, scheduler, dependency, product or SKU. It provides a reviewable research scope and prevents earlier tentative cross references from accidentally becoming catalogue truth.
