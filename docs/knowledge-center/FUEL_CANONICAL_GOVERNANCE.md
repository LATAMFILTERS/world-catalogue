# Fuel Cleanliness Canonical Knowledge Governance

Status: Active governance rule
Owner: ELIMFILTERS Knowledge Center / Hermes
Scope: Fuel Cleanliness Protection knowledge ingestion and mixed-domain research routing

## Purpose

External technical sources are evidence inputs, not ELIMFILTERS product specifications.
Hermes may extract generic engineering knowledge from external sources, but it must never convert a competitor's proprietary construction, media chemistry, performance value, patented configuration, or product claim into an ELIMFILTERS claim.

## Ingestion pipeline

1. External source enters the research layer.
2. Technical statements are extracted with provenance.
3. Each statement is classified as generic industry knowledge, manufacturer-specific evidence, quantitative claim, or mixed-domain content.
4. Manufacturer-specific evidence remains internal and cannot populate public ELIMFILTERS copy.
5. Mixed-domain content is split before canonicalization and routed to Fuel, Air Intake, Lubrication, Hydraulic, Cooling or other applicable domains.
6. Generic statements are normalized into canonical knowledge blocks.
7. Quantitative claims, standards claims, thresholds, percentages, pressure values, time-to-failure values and performance values require independent secondary validation.
8. Only validated blocks explicitly approved for publication may feed Knowledge Center pages.
9. A relationship between a canonical block and an ELIMFILTERS technology indicates engineering relevance only; it is not proof of product construction or performance.

## Fuel canonical block set

### Core normalized blocks

- FUEL-CKB-001 — Modern Diesel Fuel Chemistry
- FUEL-CKB-002 — Water Contamination in Diesel Fuel
- FUEL-CKB-003 — Surfactants and Fuel-Water Separation
- FUEL-CKB-004 — Water Coalescence Fundamentals
- FUEL-CKB-005 — Particle Contamination in Diesel Fuel
- FUEL-CKB-006 — High-Pressure Fuel-System Sensitivity
- FUEL-CKB-007 — Filtration Efficiency, Capacity and Pressure Drop
- FUEL-CKB-008 — Evolution of Fuel-Filter Media Architectures

Implementation:
`frontend/src/lib/knowledge-center-data/fuel-canonical-blocks.ts`

### Consolidated research extension

The current NotebookLM research package added six non-duplicative concepts. They remain internal until independently validated:

- FUEL-CKB-009 — Regulatory Drivers of Modern Diesel Fuel Chemistry
- FUEL-CKB-010 — Hydrotreating, Lubricity and Additive Effects
- FUEL-CKB-011 — Biodiesel, Additives and Water-Separation Behavior
- FUEL-CKB-012 — Specific Surface Area as a Filtration Engineering Parameter
- FUEL-CKB-013 — Media–Housing Integration in Fuel Separation Systems
- FUEL-CKB-014 — Test-Method Relevance to Modern Fuel Chemistry

Implementation:
`frontend/src/lib/knowledge-center-data/fuel-canonical-research-extension.ts`

These extension blocks must not be treated as independent confirmation merely because the NotebookLM package contains several summaries. Multiple summaries generated from the same underlying source count as one evidence family.

## Cross-domain routing from mixed research

The current research package also contained valid subject matter outside Fuel Cleanliness. Hermes must quarantine and route those concepts instead of attaching them to HYDROCORE™ or TURBOCORE™.

Air Intake candidates:

- AIR-CKB-001 — Air Filtration Efficiency and Restriction
- AIR-CKB-002 — Inertial Pre-Separation and Housing Geometry

Lubrication candidates:

- LUBE-CKB-001 — Soot Loading in Diesel Lubrication Systems
- LUBE-CKB-002 — Bypass Filtration and Depth-Media Principles

Implementation:
`frontend/src/lib/knowledge-center-data/cross-domain-research-candidates.ts`

All cross-domain candidates are `pending-secondary-validation` and `internal-only`.

## Technology boundaries

### SYNTAPORE™

Plain diesel-fuel particulate filtration architecture for approved primary, secondary and cartridge applications.

### HYDROCORE™

Standard non-turbine fuel/water separation architecture, including approved separator configurations with drain and transparent plastic bowl.

HYDROCORE™ must not be assigned to FH or FG turbine-style systems.

### TURBOCORE™

Turbine-style fuel/water separation architecture reserved for approved FH and FG series systems.

TURBOCORE™ must not be assigned to standard non-turbine separator filters.

## Claims blocked by default

The following may not be attributed to HYDROCORE™, TURBOCORE™, SYNTAPORE™, MACROCORE™, INTEKCORE™, SYNTRAX™ or an ELIMFILTERS SKU unless ELIMFILTERS-controlled evidence supports the exact claim:

- nanofiber construction;
- melt-blown construction;
- four-layer or other fixed layer count;
- proprietary chemical surface treatment;
- numerical media surface area;
- universal water-separation efficiency;
- universal micron rating or Beta ratio;
- universal contaminant capacity;
- universal pressure-drop claim;
- universal service interval;
- competitor-derived geometry or patented mechanism;
- wound-media composition;
- wood/synthetic fiber blend;
- lacquer or asphaltene-removal claim;
- extended lubricant-drain interval;
- competitor-derived performance comparison.

## Quantitative claim rule

Any public numerical statement must have an authoritative secondary source or ELIMFILTERS-controlled test evidence and must be stored with its source, revision/date, scope and applicable product/application.

A single external manufacturer source is never sufficient to promote a quantitative statement to public ELIMFILTERS canonical knowledge.

The current research package therefore blocks, until validated, values and stories such as:

- approximately 30,000 psi HPCR pressure;
- 90–92% NOx/particulate reduction;
- 500 ppm to 10 ppm sulfur transition;
- 97% sulfur reduction;
- two-hour mining failure examples;
- numerical surface-area claims;
- fixed layer counts;
- claims about standards being obsolete or a manufacturer leading standards development.

## Surface-area rule

Surface area is an engineering parameter, not a universal proxy for filtration quality.
Hermes must consider it together with fiber diameter, porosity, pore-size distribution, thickness, wettability, chemistry, fluid velocity, viscosity, element geometry, capacity and pressure drop.

Statements such as “more surface area always means better filtration” or “surface area is the only separation mechanism” must be rejected.

## Publication gate

A canonical block is public only when both conditions are true:

- `validationStatus === 'validated'`
- `publicationStatus === 'approved-for-publication'`

All newly ingested blocks default to:

- `validationStatus: 'pending-secondary-validation'`
- `publicationStatus: 'internal-only'`

This prevents research material from becoming public copy automatically.

## Source evidence from current research

The current NotebookLM package is based on repeated derivations of the same underlying technical source family. It contains useful generic subject areas: modern diesel chemistry, water behavior, surfactants, coalescence, particulate contamination, high-pressure injection-system sensitivity, filtration trade-offs, media evolution, surface interaction, housing integration and test-method relevance.

It also contains manufacturer-specific statements about nanofibers, multilayer media, melt-blown construction, surface chemistry, numerical surface area, wound media and proprietary geometries. Those statements remain evidence-only and are explicitly excluded from ELIMFILTERS claims until independently supported by ELIMFILTERS-controlled documentation.

## Hermes enforcement

Hermes must reject or quarantine a generated statement when any of these conditions are true:

- it names an external manufacturer in public ELIMFILTERS copy;
- it maps a manufacturer-specific feature directly to an ELIMFILTERS technology;
- it introduces a quantitative value without validated provenance;
- it converts a technology relationship into a construction claim;
- it assigns HYDROCORE™ to FH/FG turbine systems;
- it assigns TURBOCORE™ to standard non-turbine separators;
- it maps air-intake geometry to Fuel Cleanliness without product evidence;
- it maps lubrication bypass/wound-media claims to a fuel technology;
- it claims a technology-wide efficiency, capacity, service interval or certification without product-level evidence;
- it treats multiple summaries of one source as independent validation;
- it uses absolute language such as “only solution”, “always”, “completely eliminates” or “obsolete” without authoritative evidence.

## Intended Knowledge Center flow

External evidence → Research classification → Domain routing → Canonical block → Secondary validation → ELIMFILTERS relationship mapping → Publication approval → Knowledge Center article/system/technology page.

Public pages must consume only the approved canonical subset, never the raw research layer.
