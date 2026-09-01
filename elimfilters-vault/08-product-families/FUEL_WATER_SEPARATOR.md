---
type: product-family
status: active
key: FUEL_WATER_SEPARATOR
label: "Fuel Water Separation"
slug: fuel-water-separators
description: "Approved standard non-turbine spin-on and cartridge HYDROCORE™ fuel/water separator configurations for diesel fuel systems, including drain and transparent-bowl applications."
uses_technology: "[[HYDROCORE]]"
uses_tech_display: "HYDROCORE™"
belongs_to_domain: "[[FUEL]]"
belongs_to_product_system: "[[FUEL]]"
performance_rating: "Application-specific; use only validated product and application data"
target_industries:
  - "[[AGRICULTURE]]"
  - "[[AUTOMOTIVE]]"
  - "[[MARINE]]"
  - "[[MINING]]"
  - "[[OIL_GAS]]"
  - "[[POWER_GENERATION]]"
  - "[[TRUCKS_FLEETS]]"
in_unified_data: false
tags:
  - product-family
  - active
  - fuel
  - not-in-ud
  - part-search-node
---

The Fuel Water Separation family contains HYDROCORE™ configurations for approved standard non-turbine diesel fuel/water separator applications. Typical architecture may include spin-on or cartridge elements, a drain, or a transparent collection bowl where specified by the application.

HYDROCORE™ does not govern FH or FG turbine-style systems. Approved FH/FG turbine housings and their dedicated replacement elements belong to the separate FUEL_TURBINE family governed by TURBOCORE™. Plain diesel-fuel particulate filtration belongs to SYNTAPORE™.

No universal separation percentage, micron rating, flow rate, water capacity or service interval is asserted at family level. Those values must come from validated product/application evidence.

---

## Relationships

### Primary Technology
- [[HYDROCORE|HYDROCORE™ — Standard Non-Turbine Fuel/Water Separation Architecture]]

### System Context
- [[FUEL|Fuel Filtration System — Product Line]]

### Related Product Families
- [[FUEL_TURBINE|Turbine Fuel Separation — TURBOCORE™, approved FH/FG architecture]]
- [[FUEL_PRIMARY|Primary Fuel Protection — SYNTAPORE™, diesel-fuel particulate filtration]]

### Upstream Entry Points
- [[DIESEL_WATER|Diesel Water Contamination]] when the approved application uses a standard non-turbine separator architecture.

---

## Part Search Traversal

```
DIESEL_WATER (ContaminationMode)
    ↓ resolve architecture
    ├─ approved standard non-turbine separator → HYDROCORE
    │    ↓ ProductFamily lookup
    │  FUEL_WATER_SEPARATOR ← [you are here]
    └─ approved FH/FG turbine architecture → TURBOCORE → FUEL_TURBINE
```

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Fuel Water Separation Family

DEFINITION
Fuel Water Separation is the HYDROCORE™ product family for approved standard
non-turbine fuel/water separator configurations, including drain and transparent-bowl
applications where specified.

SYSTEMS
Fuel Cleanliness Protection.

SCOPE GUARDRAIL
HYDROCORE governs standard non-turbine separators only.
TURBOCORE governs approved FH/FG turbine systems.
SYNTAPORE governs diesel-fuel particulate filtration.
Do not merge these scopes.

PERFORMANCE GOVERNANCE
Family-level efficiency, micron, flow, water capacity and service-interval values are
not universal. Use validated product/application evidence only.

INDUSTRIAL_ROLE
This family supports water management in approved standard diesel fuel/water separator
applications within the Fuel Cleanliness Protection system.

CITATION_REFERENCE
source: elimfilters.com/families/fuel-water-separators/
concept: Fuel Water Separation Product Family
version: 2.0
last_updated: 2026-09-01
```
