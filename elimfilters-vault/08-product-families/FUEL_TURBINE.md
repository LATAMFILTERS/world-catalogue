---
type: product-family
status: active
key: FUEL_TURBINE
label: "Turbine Fuel Separation"
slug: fuel-turbine
description: "TURBOCORE™ turbine-style fuel/water-separation housings and dedicated replacement elements for approved FH and FG series applications, including the 2010/2020/2040-series elements built specifically for those turbine housings."
uses_technology: "[[TURBOCORE]]"
uses_tech_display: "TURBOCORE™"
belongs_to_domain: "[[FUEL]]"
belongs_to_product_system: "[[FUEL]]"
meets_standards:
  - "[[ASTM_D6304]]"
  - "[[ISO_12937]]"
performance_rating: "Application-specific staged separation and filtration per approved FH/FG configuration"
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

The Turbine Fuel Separation family contains ELIMFILTERS® FH and FG turbine-style fuel-separation housings (900FH, 902FH, 1000FH, 1002FH) and their dedicated 2010/2020/2040-series replacement elements (PM/SM/TM variants). This family is governed exclusively by TURBOCORE™, the canonical ELIMFILTERS turbine-style fuel/water separation architecture. HYDROCORE™ is reserved for approved standard non-turbine separator filters with drain or transparent-bowl configurations. FUEL_TURBINE remains distinct from FUEL_WATER_SEPARATOR because the housing, flow path, element geometry, sealing and service architecture are different.

---

## Relationships

### Primary Technology
- [[TURBOCORE|TURBOCORE™ — Turbine-Style Fuel/Water Separation Architecture for FH/FG systems]]

### System Context
- [[FUEL|Fuel Filtration System — Product Line]] (belongs to this system)

### Standards Context
- [[ASTM_D6304|ASTM D6304 — Water Content in Petroleum Products]]
- [[ISO_12937|ISO 12937 — Petroleum Products Water Content Determination]]

These standards describe water-content measurement context; they are not universal performance certifications for every TURBOCORE configuration.

### Related Product Families
- [[FUEL_WATER_SEPARATOR|Fuel Water Separation — HYDROCORE™, standard non-turbine separators]]
- [[FUEL_PRIMARY|Primary Fuel Protection — SYNTAPORE™, plain fuel particulate filtration]]

---

## Part Search Traversal

```
DIESEL_WATER (ContaminationMode)
    ↓ resolve architecture
    ├─ standard non-turbine separator → HYDROCORE
    └─ approved FH/FG turbine signal → TURBOCORE
         ↓ ProductFamily lookup
FUEL_TURBINE ← [you are here]
    ↓ Part Search DB query
GET /api/part-search?family=FUEL_TURBINE
→ approved FH/FG housings and dedicated 2010/2020/2040-series elements
```

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Turbine Fuel Separation Family

DEFINITION
Turbine Fuel Separation is the TURBOCORE™ product family for approved FH and FG
fuel-separation housings and their dedicated replacement elements.

SYSTEMS
Fuel Cleanliness Protection; turbine-specific FH/FG architecture.

SCOPE GUARDRAIL
TURBOCORE exclusively governs approved FH/FG turbine-style systems.
HYDROCORE governs standard non-turbine fuel/water separators.
SYNTAPORE governs plain diesel-fuel particulate filtration.
The three technology scopes must not be merged.

FAILURE_IMPACT
Using an element or housing configuration outside its approved architecture can compromise
fit, sealing, flow routing and staged separation performance. Selection must be validated
against the specific approved application.

RELATED_STANDARDS
ASTM D6304 and ISO 12937 provide water-content measurement context. Product performance
remains application-specific unless separately validated.

INDUSTRIAL_ROLE
This product family provides the turbine-specific implementation for approved FH/FG
fuel/water separation systems and their dedicated replacement elements.

CITATION_REFERENCE
source: elimfilters.com/families/fuel-turbine/
concept: Turbine Fuel Separation Product Family
version: 3.0
last_updated: 2026-09-01
```
