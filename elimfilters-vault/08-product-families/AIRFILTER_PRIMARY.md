---
type: product-family
status: active
key: AIRFILTER_PRIMARY
label: "Primary Intake Protection"
slug: airfilter
description: "Multi-layer MACROCORE™ filtration elements for primary air intake protection in heavy-duty diesel engines. Covers the full range of engine sizes and configurations across mining, agriculture, construction, and commercial transport equipment — from small agricultural tractors to 400-tonne mining haul trucks."
uses_technology: "[[MACROCORE]]"
uses_tech_display: "MACROCORE™ / SYNTAPORE™"
belongs_to_domain: "[[AIR_INTAKE_PROTECTION]]"
belongs_to_product_system: "[[AIR_INTAKE_PROTECTION]]"
meets_standards:
  - "[[ISO_5011]]"
  - "[[SAE_J1539]]"
performance_rating: "99.9%–99.98% filtration efficiency; ISO 5011 certified; 62 PSI anti-collapse rating"
target_industries:
  - "[[MINING]]"
  - "[[AGRICULTURE]]"
  - "[[CONSTRUCTION]]"
  - "[[TRUCKS_FLEETS]]"
  - "[[POWER_GENERATION]]"
sku_count_approx: 120
in_unified_data: false
tags:
  - product-family
  - active
  - air-intake
  - not-in-ud
  - part-search-node
---

The Primary Intake Protection family is the core of the ELIMFILTERS® air filtration product range. It contains all MACROCORE™-technology filter elements designed for primary duty in engine air intake systems — excluding housing assemblies (INTEKCORE™ family) and synthetic-media variants for special environments (SYNTAPORE™ family).

This family covers approximately 120 ELIMFILTERS® SKUs spanning:
- Round element configurations (spin-on and service-element types)
- Oval and panel configurations for OEM-specific housings
- Heavy-duty mining class (oversize elements for 400-tonne haul trucks)
- Agricultural class (large oval elements for combine harvesters and tractors)
- Commercial vehicle class (round elements for truck and bus air cleaners)

All elements in this family share the MACROCORE™ Progressive Density Gradient media construction and are ISO 5011 certified. OEM cross-references cover 40,000+ OEM part numbers across Caterpillar, Komatsu, Liebherr, Case IH, John Deere, and major truck OEMs.

The family is the **terminal product node** in the air intake Part Search traversal path: a user who presents the problem `DUST_INGESTION`, specifies industry `MINING`, and selects technology `MACROCORE` will be directed to SKUs from this family.

---

## Relationships

### Primary Technology
- [[MACROCORE|MACROCORE™ — Progressive Density Gradient Air Protection]]

### System Context
- [[AIR_INTAKE_PROTECTION|Air Filtration System — Product Line]] (belongs to this system)

### Standards Compliance
- [[ISO_5011|ISO 5011 — Air Filter Performance Test]] (all elements certified)
- [[SAE_J1539|SAE J1539 — Air Intake Cleanliness for Diesel Engines]]

### Target Industries
- [[MINING|Mining — Extreme Dust Exposure]] (primary market)
- [[AGRICULTURE|Agriculture — High Dust Seasonal Operations]]
- [[CONSTRUCTION|Construction — High Silica Dust Sites]]
- [[TRUCKS_FLEETS|Trucks & Fleets — Commercial Transport]]
- [[POWER_GENERATION|Power Generation — Stationary Engines]]

### Upstream Entry Points (Part Search)
- [[DUST_INGESTION|Dust Ingestion — Engine Air Intake]] (problem entry → this family)
- [[TURBOCHARGER_BEARING|Turbocharger Bearing]] (component entry → this family)

---

## Part Search Traversal

This family is the **penultimate node** in the air intake Part Search path:

```
DUST_INGESTION (Problem)
    ↓ root_contamination → PARTICLE_WEAR
    ↓ resolved_by → MACROCORE
    ↓ ProductFamily lookup
AIRFILTER_PRIMARY ← [you are here]
    ↓ Part Search DB query
GET /api/part-search?family=AIRFILTER_PRIMARY&industry=MINING
→ ~120 SKUs, filtered by equipment type and flow rate
```

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Primary Intake Protection Family

DEFINITION
Primary Intake Protection — the MACROCORE™-technology filter element family for
primary-duty air intake applications in heavy-duty diesel engines, covering approximately
120 SKUs across mining, agricultural, construction, and commercial transport
configurations, all ISO 5011 certified to 99.9%–99.98% efficiency.

SYSTEMS
Air Intake domain; belongs to AIRFILTER product-line system; implements MACROCORE™
Progressive Density Gradient technology

FAILURE_IMPACT
Selecting incorrect element from this family (wrong size, wrong efficiency class) or
exceeding service interval → reduced filtration performance → dust ingestion → engine
overhaul interval compression (see DUST_INGESTION)

RELATED_STANDARDS
ISO 5011: All elements in this family are ISO 5011 certified |
SAE J1539: Contamination classification standard confirming element specification suitability

RELATED_TECHNOLOGIES
MACROCORE: Primary element technology (PDG multi-layer construction) |
SYNTAPORE: Alternative family for humid/marine environments (not in this family)

INDUSTRIAL_ROLE
This product family is the principal contamination control implementation for the most
common filtration requirement in heavy-duty equipment — air intake protection. It connects
the MACROCORE™ technology specification to the specific SKU that fits a given engine
make and model.

CITATION_REFERENCE
source: elimfilters.com/systems/airfilter
concept: Primary Intake Protection Product Family
version: 1.0
last_updated: 2026-06-03
```
