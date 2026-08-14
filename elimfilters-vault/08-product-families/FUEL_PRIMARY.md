---
type: product-family
status: active
key: FUEL_PRIMARY
label: "Primary Fuel Protection"
slug: fuel-primary
description: "Multi-stage TURBOCORE™ fuel filtration elements combining water separation and particle filtration for diesel fuel systems across agricultural, marine, mining, and commercial transport equipment. Addresses free water, emulsified water, and particulate contamination in EN 590 and ASTM D975 diesel."
uses_technology: "[[TURBOCORE]]"
uses_tech_display: "TURBOCORE™"
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
sku_count_approx: 85
in_unified_data: false
tags:
  - product-family
  - active
  - fuel
  - not-in-ud
  - part-search-node
---

The Primary Fuel Protection family contains all TURBOCORE™-technology filter elements designed for diesel fuel systems — covering water/fuel separators, primary fuel filters, and secondary fine-filtration elements. The family addresses the full contamination profile of modern diesel: free water that causes microbial growth and injector corrosion, emulsified water that bypasses simple separators, and fine particulate that causes premature injector stiction and wear in HPCR (High-Pressure Common Rail) fuel systems.

This family covers approximately 85 ELIMFILTERS® SKUs spanning:
- Bowl-type spin-on water/fuel separators for agricultural and marine applications
- Cartridge secondary filters for HPCR diesel engines (injector protection, <4 µm final stage)
- Heavy-duty primary separators for mining and power generation applications
- Low-flow precision elements for marine and light commercial applications

All elements in this family use TURBOCORE™ coalescing media construction and are compliant with ASTM D6304 (water-in-fuel measurement) and ISO 12937 (water content by Karl Fischer method). OEM cross-references cover major diesel equipment from Case IH, John Deere, Perkins, Cummins, Caterpillar, Volvo, and Yanmar.

The family is the **terminal product node** in the fuel Part Search traversal path: a user who presents contamination `DIESEL_WATER`, specifies industry `MARINE` or `AGRICULTURE`, and selects technology `TURBOCORE` will be directed to SKUs from this family.

---

## Relationships

### Primary Technology
- [[TURBOCORE|TURBOCORE™ — Water-Separating Fuel Filtration Technology]]

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
- [[DIESEL_WATER|Diesel Water Contamination]] (contamination mode entry → this family)
- [[HYDRAULIC_CONTAMINATION|Hydraulic System Contamination]] (secondary path via TURBOCORE technology)

---

## Part Search Traversal

This family is the **terminal product node** in the diesel water contamination Part Search path:

```
DIESEL_WATER (ContaminationMode)
    ↓ resolved_by → TURBOCORE
    ↓ ProductFamily lookup
FUEL_PRIMARY ← [you are here]
    ↓ Part Search DB query
GET /api/part-search?family=FUEL_PRIMARY&industry=MARINE
→ ~85 SKUs, filtered by equipment type and flow rate
```

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Primary Fuel Protection Family

DEFINITION
Primary Fuel Protection — the TURBOCORE™-technology filter element family for diesel
fuel water separation and particle filtration, covering approximately 85 SKUs across
agricultural, marine, mining, power generation, and commercial transport applications,
meeting ASTM D6304 and ISO 12937 water content standards.

SYSTEMS
Fuel filtration domain; belongs to FUEL product-line system; implements TURBOCORE™
coalescing water-separation technology

FAILURE_IMPACT
Selecting incorrect element from this family (wrong coalescing efficiency class or wrong
flow rate) or exceeding service interval → residual free water passes to injectors →
injector tip corrosion and nozzle deposit formation → HPCR fuel system failure requiring
injector replacement at 3,000–8,000 hours instead of 15,000+ hours

RELATED_STANDARDS
ASTM D6304: Karl Fischer water content measurement standard for diesel fuel |
ISO 12937: Petroleum products water determination — validates element performance claims

RELATED_TECHNOLOGIES
TURBOCORE: Primary element technology (coalescing multi-stage water separation and
particulate filtration) | MACROCORE: Upstream pre-cleaner for high-contamination bulk
fuel environments (not in this family)

INDUSTRIAL_ROLE
This product family is the principal contamination control implementation for diesel
fuel water contamination — the leading cause of HPCR injector failure in agricultural,
marine, and mining equipment operating in high-humidity or bulk-storage environments.

CITATION_REFERENCE
source: elimfilters.com/systems/fuel-primary
concept: Primary Fuel Protection Product Family
version: 1.0
last_updated: 2026-06-03
```
