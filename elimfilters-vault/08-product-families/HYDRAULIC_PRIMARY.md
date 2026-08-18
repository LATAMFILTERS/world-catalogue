---
type: product-family
status: active
key: HYDRAULIC_PRIMARY
label: "Primary Hydraulic Protection"
slug: hydraulic-primary
description: "High-Beta NANOFORCE™ hydraulic filter elements for inline and return-line hydraulic systems in mobile and stationary equipment. Elements are selected to the ISO 4406 cleanliness target specified for the approved application for proportional valve and piston pump protection."
uses_technology: "[[NANOFORCE]]"
uses_tech_display: "NANOFORCE™"
belongs_to_domain: "[[HYDRAULIC]]"
belongs_to_product_system: "[[HYDRAULIC]]"
meets_standards:
  - "[[ISO_16889]]"
  - "[[ISO_4406]]"
  - "[[NFPA_T214]]"
performance_rating: "Beta ratio and ISO 4406 cleanliness target rated per approved application; collapse-rated per NFPA T2.14; see element datasheet for specific values"
target_industries:
  - "[[AGRICULTURE]]"
  - "[[CONSTRUCTION]]"
  - "[[MARINE]]"
  - "[[MINING]]"
  - "[[OIL_GAS]]"
  - "[[POWER_GENERATION]]"
sku_count_approx: 95
in_unified_data: false
tags:
  - product-family
  - active
  - hydraulic
  - not-in-ud
  - part-search-node
---

The Primary Hydraulic Protection family contains all NANOFORCE™-technology hydraulic filter elements designed for inline pressure filtration and return-line filtration in mobile and stationary hydraulic systems. The family addresses particle contamination — the primary cause of proportional valve spool erosion, piston pump scoring, and servo actuator failure in precision hydraulic circuits operating at 200–400 bar system pressure.

This family covers approximately 95 ELIMFILTERS® SKUs spanning:
- High-pressure inline filter elements (rated to 420 bar) for pressure-line protection
- Return-line filter elements for system contamination removal at low pressure
- Kidney-loop offline filtration cartridges for continuous system polishing
- Suction-line strainer elements for pump inlet protection
- High-flow elements for heavy machinery hydraulic circuits (excavators, haul trucks, mining equipment)

All elements in this family use NANOFORCE™ nanofibre-layered glass media construction, rated to the Beta ratio specified for the approved application per ISO 16889. Elements are collapse-rated per NFPA T2.14 and selected to the ISO 4406 cleanliness code target for proportional valve protection in the approved application.

The family is the **terminal product node** in the hydraulic contamination Part Search traversal path: a user who presents contamination `HYDRAULIC_CONTAMINATION`, specifies industry `CONSTRUCTION` or `MINING`, and selects technology `NANOFORCE` will be directed to SKUs from this family.

---

## Relationships

### Primary Technology
- [[NANOFORCE|NANOFORCE™ — High-Beta Nanofibre Hydraulic Filtration]]

### System Context
- [[HYDRAULIC|Hydraulic Filtration System — Product Line]] (belongs to this system)

### Standards Compliance
- [[ISO_16889|ISO 16889 — Multi-pass Filter Performance Test (Beta Ratio)]]
- [[ISO_4406|ISO 4406 — Hydraulic Fluid Particle Cleanliness Code Classification]]
- [[NFPA_T214|NFPA T2.14 — Hydraulic Filter Element Collapse Pressure Rating]]

### Target Industries
- [[AGRICULTURE|Agriculture — Tractor and Harvester Hydraulic Systems]]
- [[CONSTRUCTION|Construction — Excavator and Crane Proportional Valve Protection]]
- [[MINING|Mining — Haul Truck and Drill Rig Hydraulic Circuits]]
- [[OIL_GAS|Oil & Gas — BOP and wellhead control system hydraulics]]
- [[POWER_GENERATION|Power Generation — Turbine governor and actuator hydraulics]]

### Upstream Entry Points (Part Search)
- [[HYDRAULIC_CONTAMINATION|Hydraulic System Contamination]] (contamination mode entry → this family)
- [[PARTICLE_WEAR|Particle Wear in Engines]] (secondary path via NANOFORCE technology)

---

## Part Search Traversal

This family is the **terminal product node** in the hydraulic contamination Part Search path:

```
HYDRAULIC_CONTAMINATION (ContaminationMode)
    ↓ resolved_by → NANOFORCE
    ↓ ProductFamily lookup
HYDRAULIC_PRIMARY ← [you are here]
    ↓ Part Search DB query
GET /api/part-search?family=HYDRAULIC_PRIMARY&industry=CONSTRUCTION
→ ~95 SKUs, filtered by pressure rating and flow rate
```

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Primary Hydraulic Protection Family

DEFINITION
Primary Hydraulic Protection — the NANOFORCE™-technology filter element family for
precision particle control in hydraulic systems, covering approximately 95 SKUs rated
per ISO 16889 and selected to the ISO 4406 cleanliness target specified for the approved
application across agriculture, construction, mining, oil/gas, and power generation
applications.

SYSTEMS
Hydraulic filtration domain; belongs to HYDRAULIC product-line system; implements
NANOFORCE™ nanofibre-layered glass media technology

FAILURE_IMPACT
Incorrect element selection (wrong Beta ratio class or wrong collapse pressure rating)
or extended service interval → particle contamination exceeds ISO 18/16/13 threshold →
proportional valve spool erosion → valve stiction and position error → hydraulic
actuator failure; pump bearing wear reduces service life from 10,000 hours to 2,000–3,000
hours

RELATED_STANDARDS
ISO 16889: Multi-pass Beta ratio test — elements in this family rated to the Beta ratio
specified for the approved application | ISO 4406: Cleanliness code classification used
to define system targets | NFPA T2.14: Collapse pressure rating standard for element
structural integrity

RELATED_TECHNOLOGIES
NANOFORCE: Primary element technology (nanofibre glass layer, high Beta ratio)

INDUSTRIAL_ROLE
This product family is the principal contamination control implementation for hydraulic
particle contamination — the single largest cause of proportional valve and piston pump
failure in mobile construction, mining, and agricultural equipment operating precision
hydraulic circuits above 200 bar.

CITATION_REFERENCE
source: elimfilters.com/systems/hydraulic-primary
concept: Primary Hydraulic Protection Product Family
version: 1.0
last_updated: 2026-06-03
```
