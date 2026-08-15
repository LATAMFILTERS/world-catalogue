---
type: product-family
status: active
key: FUEL_WATER_SEPARATOR
label: "Fuel Water Separation"
slug: fuel-water-separator
description: "Standard (non-turbine) spin-on and cartridge HYDROCORE™ fuel/water separators for diesel fuel systems across agricultural, marine, mining, and commercial transport equipment. Addresses free water, emulsified water, and particulate contamination in EN 590 and ASTM D975 diesel."
uses_technology: "[[HYDROCORE]]"
uses_tech_display: "HYDROCORE™"
belongs_to_domain: "[[FUEL]]"
belongs_to_product_system: "[[FUEL]]"
meets_standards:
  - "[[ASTM_D6304]]"
  - "[[ISO_12937]]"
performance_rating: ">99% free water separation; >95% emulsified water removal; EN 590 compliant"
target_industries:
  - "[[AGRICULTURE]]"
  - "[[MARINE]]"
  - "[[MINING]]"
  - "[[OIL_GAS]]"
  - "[[POWER_GENERATION]]"
  - "[[TRUCKS_FLEETS]]"
sku_count_approx: 102
in_unified_data: false
tags:
  - product-family
  - active
  - fuel
  - not-in-ud
  - part-search-node
---

The Fuel Water Separation family contains all HYDROCORE™-technology filter elements designed for diesel fuel systems — covering standard (non-turbine) spin-on and cartridge water/fuel separators. The family addresses the water-contamination side of diesel fuel: free water that causes microbial growth and injector corrosion, and emulsified water that bypasses simple filtration.

This family covers 102 ELIMFILTERS® SKUs (verified directly against the production catalog), spanning:
- Bowl-type spin-on water/fuel separators for agricultural and marine applications
- Cartridge fuel/water separators for HPCR diesel engines (injector protection)
- Heavy-duty separators for mining and power generation applications

All elements in this family use HYDROCORE™ coalescing media construction and are compliant with ASTM D6304 (water-in-fuel measurement) and ISO 12937 (water content by Karl Fischer method). A separator built for the approved Turbine Series FH/FG architecture is TURBOCORE™, not HYDROCORE™ -- see the FUEL_TURBINE family.

The family is the **terminal product node** in the fuel Part Search traversal path for standard (non-turbine) separator applications: a user who presents contamination `DIESEL_WATER`, specifies industry `MARINE` or `AGRICULTURE`, and has no turbine/Racor signal will be directed to SKUs from this family.

---

## Relationships

### Primary Technology
- [[HYDROCORE|HYDROCORE™ — Fuel Water Separation Technology]]

### System Context
- [[FUEL|Fuel Filtration System — Product Line]] (belongs to this system)

### Standards Compliance
- [[ASTM_D6304|ASTM D6304 — Water Content in Diesel Fuel (Karl Fischer method)]]
- [[ISO_12937|ISO 12937 — Petroleum Products Water Content Determination]]

### Target Industries
- [[AGRICULTURE|Agriculture — Seasonal Fuel Storage and Tank Contamination Risk]]
- [[MARINE|Marine — High Humidity Water Ingress in Fuel Systems]]
- [[MINING|Mining — Bulk Fuel Storage Contamination in Remote Sites]]
- [[OIL_GAS|Oil & Gas — Diesel-powered field equipment and generators]]
- [[POWER_GENERATION|Power Generation — Stationary Diesel Gensets]]
- [[TRUCKS_FLEETS|Trucks & Fleets — Commercial diesel engine protection]]

### Upstream Entry Points (Part Search)
- [[DIESEL_WATER|Diesel Water Contamination]] (contamination mode entry → this family, when no turbine signal is present)

---

## Part Search Traversal

This family is the **terminal product node** in the diesel water contamination Part Search path for standard (non-turbine) separators:

```
DIESEL_WATER (ContaminationMode)
    ↓ resolved_by → HYDROCORE (standard separator) or TURBOCORE (turbine FH/FG)
    ↓ ProductFamily lookup
FUEL_WATER_SEPARATOR ← [you are here, when no turbine/Racor signal]
    ↓ Part Search DB query
GET /api/part-search?family=FUEL_WATER_SEPARATOR&industry=MARINE
→ ~102 SKUs, filtered by equipment type and flow rate
```

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Fuel Water Separation Family

DEFINITION
Fuel Water Separation — the HYDROCORE™-technology filter element family for standard
(non-turbine) diesel fuel water separation, covering 102 SKUs across agricultural,
marine, mining, power generation, and commercial transport applications, meeting
ASTM D6304 and ISO 12937 water content standards.

SYSTEMS
Fuel filtration domain; belongs to FUEL product-line system; implements HYDROCORE™
coalescing water-separation technology

FAILURE_IMPACT
Selecting incorrect element from this family (wrong coalescing efficiency class or wrong
flow rate) or exceeding service interval → residual free water passes to injectors →
injector tip corrosion and nozzle deposit formation → HPCR fuel system failure requiring
injector replacement well before its rated service life

RELATED_STANDARDS
ASTM D6304: Karl Fischer water content measurement standard for diesel fuel |
ISO 12937: Petroleum products water determination — validates element performance claims

RELATED_TECHNOLOGIES
HYDROCORE: Primary element technology (coalescing water separation) for standard
(non-turbine) applications | TURBOCORE: The equivalent separation technology reserved
for approved Turbine Series FH/FG applications (a distinct product family, FUEL_TURBINE)
| SYNTAPORE: Plain primary/secondary fuel filtration -- does not perform a
water-separation function (not in this family)

INDUSTRIAL_ROLE
This product family is the standard (non-turbine) implementation for diesel fuel water
contamination — a leading cause of HPCR injector failure in agricultural, marine, and
mining equipment operating in high-humidity or bulk-storage environments.

CITATION_REFERENCE
source: elimfilters.com/systems/fuel-water-separator
concept: Fuel Water Separation Product Family
version: 1.0
last_updated: 2026-08-15
```
