# Fuel Cleanliness Canonical Knowledge Governance

Status: Active governance rule
Owner: ELIMFILTERS Knowledge Center / Hermes
Scope: Fuel Cleanliness Protection knowledge ingestion

## Purpose

External technical sources are evidence inputs, not ELIMFILTERS product specifications.
Hermes may extract generic engineering knowledge from external sources, but it must never convert a competitor's proprietary construction, media chemistry, performance value, patented configuration, or product claim into an ELIMFILTERS claim.

## Ingestion pipeline

1. External source enters the research layer.
2. Technical statements are extracted with provenance.
3. Each statement is classified as either generic industry knowledge or manufacturer-specific evidence.
4. Manufacturer-specific evidence remains internal and cannot populate public ELIMFILTERS copy.
5. Generic statements are normalized into canonical knowledge blocks.
6. Quantitative claims, standards claims, thresholds, percentages, pressure values, time-to-failure values and performance values require independent secondary validation.
7. Only validated blocks explicitly approved for publication may feed Knowledge Center pages.
8. A relationship between a canonical block and an ELIMFILTERS technology indicates engineering relevance only; it is not proof of product construction or performance.

## Fuel canonical block set

The initial governed set is:

- FUEL-CKB-001 — Modern Diesel Fuel Chemistry
- FUEL-CKB-002 — Water Contamination in Diesel Fuel
- FUEL-CKB-003 — Surfactants and Fuel-Water Separation
- FUEL-CKB-004 — Water Coalescence Fundamentals
- FUEL-CKB-005 — Particle Contamination in Diesel Fuel
- FUEL-CKB-006 — High-Pressure Fuel-System Sensitivity
- FUEL-CKB-007 — Filtration Efficiency, Capacity and Pressure Drop
- FUEL-CKB-008 — Evolution of Fuel-Filter Media Architectures

Canonical data implementation:
`frontend/src/lib/knowledge-center-data/fuel-canonical-blocks.ts`

## Technology boundaries

### SYNTAPORE™

Plain diesel-fuel particulate filtration architecture for approved primary, secondary and cartridge applications.

### HYDROCORE™

Standard non-turbine fuel/water separation architecture, including approved separator configurations with drain and transparent plastic bowl.

HYDROCORE™ must not be assigned to FH or FG turbine-style systems.

### TURBOCORE™

Turbine-style fuel/water separation architecture reserved for approved FH and FG series systems.

TURBOCORE™ must not be assigned to standard non-turbine separator filters.

## Claims that are blocked by default

The following may not be attributed to HYDROCORE™, TURBOCORE™, SYNTAPORE™ or an ELIMFILTERS SKU unless ELIMFILTERS-controlled evidence supports the exact claim:

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
- competitor-derived performance comparison.

## Quantitative claim rule

Any public numerical statement must have an authoritative secondary source or ELIMFILTERS-controlled test evidence and must be stored with its source, revision/date, scope and applicable product/application.

A single external manufacturer source is never sufficient to promote a quantitative statement to public ELIMFILTERS canonical knowledge.

## Publication gate

A canonical block is public only when both conditions are true:

- `validationStatus === 'validated'`
- `publicationStatus === 'approved-for-publication'`

All newly ingested blocks default to:

- `validationStatus: 'pending-secondary-validation'`
- `publicationStatus: 'internal-only'`

This prevents research material from becoming public copy automatically.

## Source evidence from current research

The current research package contains useful generic subject areas: modern diesel chemistry, water behavior, surfactants, coalescence, particulate contamination, high-pressure injection-system sensitivity, filtration trade-offs and media evolution.

It also contains manufacturer-specific statements about nanofibers, multilayer media, surface chemistry and numerical surface area. Those statements remain evidence-only and are explicitly excluded from ELIMFILTERS claims until independently supported by ELIMFILTERS-controlled documentation.

## Hermes enforcement

Hermes must reject or quarantine a generated statement when any of these conditions are true:

- it names an external manufacturer in public ELIMFILTERS copy;
- it maps a manufacturer-specific feature directly to an ELIMFILTERS technology;
- it introduces a quantitative value without validated provenance;
- it converts a technology relationship into a construction claim;
- it assigns HYDROCORE™ to FH/FG turbine systems;
- it assigns TURBOCORE™ to standard non-turbine separators;
- it claims a technology-wide efficiency, capacity, service interval or certification without product-level evidence.

## Intended Knowledge Center flow

External evidence → Research classification → Canonical block → Secondary validation → ELIMFILTERS relationship mapping → Publication approval → Knowledge Center article/system/technology page.

Public pages must consume only the approved canonical subset, never the raw research layer.
