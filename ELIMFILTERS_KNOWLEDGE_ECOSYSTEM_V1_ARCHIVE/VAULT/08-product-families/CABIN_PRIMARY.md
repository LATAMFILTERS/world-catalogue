---
type: product-family
status: active
key: CABIN_PRIMARY
label: "Primary Cabin Air Protection"
slug: cabin-primary
description: "MICROKAPPA™ cabin air filter elements for operator cab protection in agricultural, construction, mining, and commercial transport equipment. ISO 11155 certified for PM10/PM2.5 capture with activated carbon variants for chemical vapor environments."
uses_technology: "[[MICROKAPPA]]"
uses_tech_display: "MICROKAPPA™"
belongs_to_domain: "[[CABIN]]"
belongs_to_product_system: "[[CABIN]]"
meets_standards:
  - "[[ISO_11155]]"
  - "[[DIN_71220]]"
performance_rating: ">95% PM10; >85% PM2.5 at rated airflow; ISO 11155-1 certified"
target_industries:
  - "[[AGRICULTURE]]"
  - "[[BUS_COACH]]"
  - "[[CONSTRUCTION]]"
  - "[[MINING]]"
  - "[[RAILWAY]]"
  - "[[TRUCKS_FLEETS]]"
  - "[[WASTE_MUNICIPAL]]"
sku_count_approx: 65
in_unified_data: false
tags:
  - product-family
  - active
  - cabin
  - not-in-ud
  - part-search-node
---

The Primary Cabin Air Protection family contains all MICROKAPPA™-technology cabin air filter elements designed for operator cab HVAC systems in mobile and stationary heavy-duty equipment. The family addresses particulate and chemical contamination entering cab environments — the primary cause of operator PM10 and PM2.5 exposure in high-dust industrial operations including mining, quarrying, agricultural harvesting, and urban waste collection.

This family covers approximately 65 ELIMFILTERS® SKUs spanning:
- Panel filter configurations for agricultural tractor and combine harvester cabs
- Rectangular cartridge elements for construction and mining equipment cabs
- Activated carbon combination elements for chemical vapor environments (pesticide, exhaust, hydrogen sulfide)
- High-flow panel elements for bus and coach HVAC recirculation systems
- Compact panel elements for railway rolling stock cab ventilation

All elements in this family use MICROKAPPA™ electrostatically-charged synthetic media construction and are ISO 11155-1 certified for PM10 filtration efficiency greater than 95% and PM2.5 efficiency greater than 85% at rated airflow. Activated carbon variants additionally comply with DIN 71220 for gas-phase contaminant (chemical vapor) removal. OEM cross-references cover John Deere, Case IH, AGCO, Caterpillar, Komatsu, Volvo CE, and major bus/coach OEMs.

The family is the **terminal product node** in the cabin air Part Search traversal path: a user who presents contamination in the cabin/operator health domain, specifies industry `MINING` or `AGRICULTURE`, and selects technology `MICROKAPPA` will be directed to SKUs from this family.

---

## Relationships

### Primary Technology
- [[MICROKAPPA|MICROKAPPA™ — Electrostatically-Charged Cabin Air Filtration]]

### System Context
- [[CABIN|Cabin Air Filtration System — Product Line]] (belongs to this system)

### Standards Compliance
- [[ISO_11155|ISO 11155 — Road Vehicles Air Filters for Cabin (PM10/PM2.5 efficiency)]]
- [[DIN_71220|DIN 71220 — Activated Carbon Cabin Filters for Gas-Phase Contaminant Removal]]

### Target Industries
- [[AGRICULTURE|Agriculture — Pesticide Spray Drift and Harvest Dust in Operator Cabs]]
- [[BUS_COACH|Bus & Coach — Urban Particulate and Exhaust Gas Recirculation]]
- [[CONSTRUCTION|Construction — Silica Dust, Exhaust, and Chemical Vapor Exposure]]
- [[MINING|Mining — Silica Dust, Blasting Fumes, and Diesel Exhaust in Cabs]]
- [[RAILWAY|Railway — Tunnel Particulate and Exhaust in Rolling Stock Cabs]]
- [[TRUCKS_FLEETS|Trucks & Fleets — Urban Diesel Exhaust and Particulate Exposure]]
- [[WASTE_MUNICIPAL|Waste & Municipal — Biological Contaminants and Chemical Vapors]]

### Upstream Entry Points (Part Search)
- [[PARTICLE_WEAR|Particle Wear in Engines]] (secondary path via MICROKAPPA for airborne particulate)
- [[DIESEL_WATER|Diesel Water Contamination]] (indirect: cabin filters protect operators in environments with exhaust contamination)

---

## Part Search Traversal

This family is the **terminal product node** in the cabin air protection Part Search path:

```
PARTICLE_WEAR (ContaminationMode — airborne particulate context)
    ↓ resolved_by → MICROKAPPA
    ↓ ProductFamily lookup
CABIN_PRIMARY ← [you are here]
    ↓ Part Search DB query
GET /api/part-search?family=CABIN_PRIMARY&industry=MINING
→ ~65 SKUs, filtered by cab make/model and HVAC flow rate
```

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Primary Cabin Air Protection Family

DEFINITION
Primary Cabin Air Protection — the MICROKAPPA™-technology cabin air filter element
family for operator health protection in heavy-duty equipment cabs, covering approximately
65 SKUs across agricultural, construction, mining, bus/coach, railway, and waste
management applications, ISO 11155-1 certified to >95% PM10 and >85% PM2.5 efficiency.

SYSTEMS
Cabin air filtration domain; belongs to CABIN product-line system; implements MICROKAPPA™
electrostatically-charged synthetic media technology; activated carbon variants implement
gas-phase contaminant removal per DIN 71220

FAILURE_IMPACT
Incorrect element selection (wrong dimensions, wrong efficiency class, omitting
activated carbon variant in chemical vapor environments) or exceeding service interval
→ particulate bypass increases PM10 operator exposure above 4 mg/m³ threshold →
chronic silicosis and occupational dust disease risk in mining and agricultural operators;
in chemical vapor environments, omitting activated carbon → pesticide or H₂S exposure

RELATED_STANDARDS
ISO 11155: Cabin air filter PM10/PM2.5 efficiency classification and certification
standard | DIN 71220: Gas-phase (activated carbon) cabin filter performance standard for
chemical vapor removal

RELATED_TECHNOLOGIES
MICROKAPPA: Primary element technology (electrostatically-charged synthetic media,
PM10 and PM2.5 capture) | MACROCORE: External pre-cleaner for extreme-dust environments
upstream of cab HVAC inlet (not in this family)

INDUSTRIAL_ROLE
This product family is the principal contamination control implementation for operator
health protection in heavy-duty equipment — preventing occupational PM10/PM2.5
and chemical vapor exposure that causes long-term respiratory disease in mining,
agricultural, and construction equipment operators.

CITATION_REFERENCE
source: elimfilters.com/systems/cabin-primary
concept: Primary Cabin Air Protection Product Family
version: 1.0
last_updated: 2026-06-03
```
