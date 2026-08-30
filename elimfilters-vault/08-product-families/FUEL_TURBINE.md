---
type: product-family
status: active
key: FUEL_TURBINE
label: "Turbine Fuel Separation"
slug: fuel-turbine
description: "HYDROCORE™ fuel/water-separation housings and replacement elements for approved Turbine Series FH and FG applications, including the 2010/2020/2040-series elements built specifically for those turbine housings."
uses_technology: "[[TURBOCORE]]"
uses_tech_display: "HYDROCORE™"
belongs_to_domain: "[[FUEL]]"
belongs_to_product_system: "[[FUEL]]"
meets_standards:
  - "[[ASTM_D6304]]"
  - "[[ISO_12937]]"
performance_rating: "Staged separation and filtration per approved Turbine Series FH/FG configuration"
target_industries:
  - "[[AGRICULTURE]]"
  - "[[MARINE]]"
  - "[[MINING]]"
  - "[[OIL_GAS]]"
  - "[[POWER_GENERATION]]"
  - "[[TRUCKS_FLEETS]]"
sku_count_approx: 13
in_unified_data: false
tags:
  - product-family
  - active
  - fuel
  - not-in-ud
  - part-search-node
---

The Turbine Fuel Separation family contains the ELIMFILTERS® Turbine Series FH and FG fuel-separation housings (900FH, 902FH, 1000FH, 1002FH) and their dedicated 2010/2020/2040-series replacement elements (PM/SM/TM variants) -- 13 SKUs verified directly against the production catalog. These products are governed by HYDROCORE™, ELIMFILTERS' canonical fuel/water-separation technology, in its approved Turbine Series FH/FG architecture; FUEL_WATER_SEPARATOR covers HYDROCORE™'s standard (non-turbine) spin-on and cartridge architecture. FUEL_TURBINE remains a distinct product family from FUEL_WATER_SEPARATOR because the housing/element architecture differs, even though both are governed by HYDROCORE™.

---

## Relationships

### Primary Technology
- [[HYDROCORE|HYDROCORE™ — Fuel/Water Separation Technology, Turbine Series FH/FG architecture]]

### System Context
- [[FUEL|Fuel Filtration System — Product Line]] (belongs to this system)

### Standards Compliance
- [[ASTM_D6304|ASTM D6304 — Water Content in Diesel Fuel (Karl Fischer method)]]
- [[ISO_12937|ISO 12937 — Petroleum Products Water Content Determination]]

### Related Product Families
- [[FUEL_WATER_SEPARATOR|Fuel Water Separation — HYDROCORE™, standard non-turbine separators]] (same governing technology, distinct architecture)
- [[FUEL_PRIMARY|Primary Fuel Protection — SYNTAPORE™, plain fuel filtration]]

---

## Part Search Traversal

```
DIESEL_WATER (ContaminationMode)
    ↓ resolved_by → HYDROCORE (when a turbine/Racor signal is present)
    ↓ ProductFamily lookup
FUEL_TURBINE ← [you are here]
    ↓ Part Search DB query
GET /api/part-search?family=FUEL_TURBINE
→ 13 SKUs: 900FH, 902FH, 1000FH, 1002FH housings + 2010/2020/2040 PM/SM/TM elements
```

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Turbine Fuel Separation Family

DEFINITION
Turbine Fuel Separation — the HYDROCORE™-technology filter element family for approved
Turbine Series FH and FG fuel-separation housings and their dedicated 2010/2020/2040-series
replacement elements, covering 13 SKUs verified directly against production.

SYSTEMS
Fuel filtration domain; belongs to FUEL product-line system; implements HYDROCORE™
fuel/water-separation technology in its Turbine Series FH/FG architecture

FAILURE_IMPACT
Using a standard (non-turbine) separator element in a Turbine Series FH/FG housing, or
vice versa, can compromise the staged separation and filtration performance the housing
was engineered around.

RELATED_STANDARDS
ASTM D6304: Karl Fischer water content measurement standard for diesel fuel |
ISO 12937: Petroleum products water determination

RELATED_TECHNOLOGIES
TURBOCORE: Turbine-style fuel-separation architecture governing this family (Turbine Series
FH/FG) and the standard (non-turbine) FUEL_WATER_SEPARATOR family -- distinct product
families under the same technology because housing/element architecture differs |
SYNTAPORE: Plain primary/secondary fuel filtration, no separation function (FUEL_PRIMARY
family)

INDUSTRIAL_ROLE
This product family is the exclusive implementation for approved Turbine Series FH/FG
fuel-separation architecture and its dedicated replacement elements, governed by
HYDROCORE™.

CITATION_REFERENCE
source: elimfilters.com/systems/fuel-turbine
concept: Turbine Fuel Separation Product Family
version: 2.0
last_updated: 2026-08-18
```
