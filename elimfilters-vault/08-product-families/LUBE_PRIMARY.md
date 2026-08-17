---
type: product-family
status: active
key: LUBE_PRIMARY
label: "Primary Lube Oil Protection"
slug: lube-primary
description: "SYNTRAX™ full-flow lube oil filter elements for engine and transmission oil circuits. Elements are selected to the ISO 4406 cleanliness target and service life specified for the approved application in diesel engines across mining, agriculture, construction, and commercial transport."
uses_technology: "[[SYNTRAX]]"
uses_tech_display: "SYNTRAX™"
belongs_to_domain: "[[OIL]]"
belongs_to_product_system: "[[OIL]]"
meets_standards:
  - "[[ISO_16889]]"
  - "[[ISO_4406]]"
performance_rating: "ISO 4406 cleanliness target and soot capture rated per approved application; see element datasheet for specific values"
target_industries:
  - "[[AGRICULTURE]]"
  - "[[AUTOMOTIVE]]"
  - "[[BUS_COACH]]"
  - "[[CONSTRUCTION]]"
  - "[[MARINE]]"
  - "[[MINING]]"
  - "[[OIL_GAS]]"
  - "[[POWER_GENERATION]]"
  - "[[RAILWAY]]"
  - "[[TRUCKS_FLEETS]]"
  - "[[WASTE_MUNICIPAL]]"
sku_count_approx: 110
in_unified_data: false
tags:
  - product-family
  - active
  - lube-oil
  - not-in-ud
  - part-search-node
---

The Primary Lube Oil Protection family contains all SYNTRAX™-technology lube oil filter elements designed for full-flow engine oil filtration in diesel and petrol engines, as well as transmission and final drive oil circuits. The family addresses particle contamination and soot accumulation — the primary causes of abrasive bearing wear, journal scoring, and oil viscosity breakdown in engines operating under high-load and extended service conditions.

This family covers approximately 110 ELIMFILTERS® SKUs spanning:
- Spin-on full-flow oil filter elements for passenger and light commercial vehicles
- Heavy-duty cartridge elements for large diesel engines (mining haul trucks, generators, marine)
- Combination anti-drain valve / bypass valve elements for engines with single-filter housings
- Extended service interval elements rated to 600+ hours for mining and power generation
- Transmission oil filter elements for automatic and powershift transmissions

All elements in this family use SYNTRAX™ active synthetic media construction — a high-dirt-capacity synthetic blend engineered for extended service intervals in full-flow lube circuits, maintaining the ISO 4406 cleanliness code specified for the approved application. Media construction is engineered for soot capture without premature bypass valve opening, preventing bypass events that would route contaminated oil directly to bearings. OEM cross-references cover all major diesel engine manufacturers: Caterpillar, Cummins, Detroit Diesel, Perkins, MTU, Volvo, MAN, Mercedes-Benz, John Deere, and Case IH.

The family is the **terminal product node** in the lube oil contamination Part Search traversal path: a user who presents contamination `PARTICLE_WEAR`, specifies industry `MINING` or `AGRICULTURE`, and selects technology `SYNTRAX` will be directed to SKUs from this family.

---

## Relationships

### Primary Technology
- [[SYNTRAX|SYNTRAX™ — Active Synthetic Media Lube Oil Filtration]]

### System Context
- [[OIL|Lube Oil Filtration System — Product Line]] (belongs to this system)

### Standards Compliance
- [[ISO_16889|ISO 16889 — Multi-pass Filter Performance Test (Beta Ratio)]]
- [[ISO_4406|ISO 4406 — Hydraulic and Lube Oil Particle Cleanliness Code Classification]]

### Target Industries
- [[AGRICULTURE|Agriculture — High-Load Seasonal Diesel Engine Operation]]
- [[AUTOMOTIVE|Automotive — Passenger and Light Commercial Engine Oil Circuits]]
- [[BUS_COACH|Bus & Coach — High-Cycle Urban Engine Oil Filtration]]
- [[CONSTRUCTION|Construction — Extreme-Load Engine Bearing Protection]]
- [[MARINE|Marine — Diesel Engine Oil Circuits in Corrosive Environments]]
- [[MINING|Mining — Extended Interval Engine Oil Filtration at 600+ Hours]]
- [[OIL_GAS|Oil & Gas — Diesel-powered field equipment and generator engines]]
- [[POWER_GENERATION|Power Generation — Stationary Diesel Engine Oil Circuits]]
- [[RAILWAY|Railway — Locomotive and Diesel Multiple Unit Engine Oil Protection]]
- [[TRUCKS_FLEETS|Trucks & Fleets — Long-Haul Diesel Engine Bearing Life Extension]]
- [[WASTE_MUNICIPAL|Waste & Municipal — Stop-Start Urban Engine Oil Contamination Control]]

### Upstream Entry Points (Part Search)
- [[PARTICLE_WEAR|Particle Wear in Engines]] (contamination mode entry → this family)
- [[DIESEL_WATER|Diesel Water Contamination]] (secondary: water in lube oil via blowby contamination)

---

## Part Search Traversal

This family is the **terminal product node** in the engine particle wear Part Search path:

```
PARTICLE_WEAR (ContaminationMode)
    ↓ resolved_by → SYNTRAX
    ↓ ProductFamily lookup
LUBE_PRIMARY ← [you are here]
    ↓ Part Search DB query
GET /api/part-search?family=LUBE_PRIMARY&industry=MINING
→ ~110 SKUs, filtered by engine make, model, and service interval rating
```

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Primary Lube Oil Protection Family

DEFINITION
Primary Lube Oil Protection — the SYNTRAX™-technology lube oil filter element family
for full-flow engine and transmission oil filtration, covering approximately 110 SKUs
selected to the ISO 4406 cleanliness target specified for the approved application across
mining, agriculture, construction, transport, marine, and power generation applications.

SYSTEMS
Lube oil filtration domain; belongs to OIL product-line system; implements SYNTRAX™
active synthetic media technology; full-flow primary filtration for engine, transmission,
and final drive oil circuits

FAILURE_IMPACT
Incorrect element selection (wrong bypass valve setting, wrong dirt capacity for
service interval) or exceeding service interval → media loading causes premature bypass
valve opening → contaminated oil bypasses filter → particle concentration rises above
ISO 4406 19/17/14 → abrasive bearing wear accelerates → bearing clearance reduction →
increased friction → localized temperature spikes → bearing seizure; bearing life
compression from 15,000+ hours to 2,000–3,000 hours

RELATED_STANDARDS
ISO 16889: Multi-pass Beta ratio test — elements rated to the Beta ratio specified for
the approved application in full-flow lube circuits | ISO 4406: Particle cleanliness code
classification — target selected per the approved application for engine bearing protection

RELATED_TECHNOLOGIES
SYNTRAX: Primary element technology (active synthetic media, high dirt capacity,
extended service intervals)

INDUSTRIAL_ROLE
This product family is the principal contamination control implementation for the most
common failure mode in diesel engine maintenance — particle accumulation in lube oil
causing abrasive bearing wear. Correct element selection from this family, matched to
the ISO 4406 cleanliness target and service interval specified for the approved
application, is a primary factor in engine bearing service life.

CITATION_REFERENCE
source: elimfilters.com/systems/lube-primary
concept: Primary Lube Oil Protection Product Family
version: 1.0
last_updated: 2026-06-03
```
