---
type: product-family
status: active
key: FUEL_PRIMARY
label: "Primary Fuel Protection"
slug: fuel-primary
description: "Primary, secondary and cartridge SYNTAPORE™ spin-on/cartridge fuel filtration elements for diesel fuel systems across agricultural, marine, mining, and commercial transport equipment. Addresses particulate contamination in EN 590 and ASTM D975 diesel -- no water-separation function; see FUEL_WATER_SEPARATOR for separators."
uses_technology: "[[SYNTAPORE]]"
uses_tech_display: "SYNTAPORE™"
belongs_to_domain: "[[FUEL]]"
belongs_to_product_system: "[[FUEL]]"
performance_rating: "EN 590 compliant; staged particulate efficiency per approved fuel-filtration stage"
target_industries:
  - "[[AGRICULTURE]]"
  - "[[MARINE]]"
  - "[[MINING]]"
  - "[[OIL_GAS]]"
  - "[[POWER_GENERATION]]"
  - "[[TRUCKS_FLEETS]]"
sku_count_approx: 1903
in_unified_data: false
tags:
  - product-family
  - active
  - fuel
  - not-in-ud
  - part-search-node
---

The Primary Fuel Protection family contains all SYNTAPORE™-technology filter elements designed for diesel fuel systems — covering primary spin-on fuel filters, cartridge secondary filters, and other staged particulate-filtration elements. This family does not include water separators: a fuel/water separator (spin-on or cartridge, non-turbine) belongs to the FUEL_WATER_SEPARATOR family (HYDROCORE™), and a Turbine Series FH/FG separator belongs to the FUEL_TURBINE family (TURBOCORE™).

This family covers 1,903 ELIMFILTERS® SKUs (verified directly against the production catalog), spanning:
- Spin-on primary fuel filters for agricultural, mining, and commercial transport applications
- Cartridge secondary filters for HPCR diesel engines (injector protection, fine-stage filtration)
- Staged particulate-filtration elements across engine sizes and configurations

All elements in this family use SYNTAPORE™ media construction for staged diesel-fuel particulate filtration. OEM cross-references cover major diesel equipment from Case IH, John Deere, Perkins, Cummins, Caterpillar, Volvo, and Yanmar.

The family is the **terminal product node** in the fuel Part Search traversal path for plain (non-separator) fuel-filtration applications.

---

## Relationships

### Primary Technology
- [[SYNTAPORE|SYNTAPORE™ — Diesel Fuel Filtration Technology]]

### System Context
- [[FUEL|Fuel Filtration System — Product Line]] (belongs to this system)

### Target Industries
- [[AGRICULTURE|Agriculture — Seasonal Fuel Storage and Tank Contamination Risk]]
- [[MARINE|Marine — High Humidity Water Ingress in Fuel Systems]]
- [[MINING|Mining — Bulk Fuel Storage Contamination in Remote Sites]]
- [[OIL_GAS|Oil & Gas — Diesel-powered field equipment and generators]]
- [[POWER_GENERATION|Power Generation — Stationary Diesel Gensets]]
- [[TRUCKS_FLEETS|Trucks & Fleets — Commercial diesel engine protection]]

### Related Product Families
- [[FUEL_WATER_SEPARATOR|Fuel Water Separation — HYDROCORE™, standard non-turbine separators]]

---

## Part Search Traversal

This family is the **terminal product node** for plain (non-separator) fuel-filtration applications:

```
Technology: SYNTAPORE
    ↓ ProductFamily lookup
FUEL_PRIMARY ← [you are here]
    ↓ Part Search DB query
GET /api/part-search?family=FUEL_PRIMARY&industry=MARINE
→ ~1,903 SKUs, filtered by equipment type and flow rate
```

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Primary Fuel Protection Family

DEFINITION
Primary Fuel Protection — the SYNTAPORE™-technology filter element family for diesel
fuel particulate filtration (primary, secondary and cartridge, no water-separation
function), covering 1,903 SKUs across agricultural, marine, mining, power generation,
and commercial transport applications.

SYSTEMS
Fuel filtration domain; belongs to FUEL product-line system; implements SYNTAPORE™
particulate-filtration technology

FAILURE_IMPACT
Selecting incorrect element from this family (wrong efficiency class or wrong flow
rate) or exceeding service interval → residual particulate reaches injectors and
high-pressure pumps → injector stiction and premature wear → HPCR fuel system failure

RELATED_STANDARDS
SYNTAPORE governs plain diesel-fuel particulate filtration; no water-content or
water-separation standard applies to this family -- see FUEL_WATER_SEPARATOR for
water-content standards.

RELATED_TECHNOLOGIES
HYDROCORE: Fuel/water separation architecture for standard (non-turbine) separators --
a distinct product family (FUEL_WATER_SEPARATOR), not covered here | TURBOCORE:
Fuel-separation architecture reserved for approved Turbine Series FH/FG applications
(FUEL_TURBINE family) | MACROCORE: Upstream pre-cleaner for high-contamination bulk air
environments (not in this family)

INDUSTRIAL_ROLE
This product family is the principal particulate-contamination control implementation
for diesel fuel systems that do not require a separate water-separation stage.

CITATION_REFERENCE
source: elimfilters.com/systems/fuel-primary
concept: Primary Fuel Protection Product Family
version: 2.0
last_updated: 2026-08-15
```
