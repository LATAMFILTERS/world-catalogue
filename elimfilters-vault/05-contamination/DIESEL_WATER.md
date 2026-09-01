---
type: contamination-mode
status: active
key: DIESEL_WATER
name: "Diesel Water Contamination"
slug: diesel-water
description: "Water ingress or accumulation in diesel fuel storage, transfer and delivery systems can promote corrosion, microbial growth, filter restriction and downstream fuel-system wear."
root_causes:
  - CONDENSATION
  - RAIN_INGRESS
  - CROSS_CONTAMINATION
  - EMULSIFICATION
failure_modes:
  - INJECTOR_EROSION
  - MICROBIAL_GROWTH
  - FILTER_PLUGGING
  - TANK_CORROSION
  - FUEL_PUMP_CAVITATION
resolved_by:
  - "[[HYDROCORE]]"
  - "[[TURBOCORE]]"
related_standards:
  - "[[ASTM_D6304]]"
  - "[[ISO_12937]]"
in_unified_data: true
ud_key: DIESEL_WATER
tags:
  - contamination-mode
  - active
  - fuel
  - in-ud
---

Diesel water contamination occurs when water enters or accumulates in fuel storage, transfer or delivery systems. Condensation, rain ingress, contaminated transfer equipment and changes in fuel condition can all contribute. Water may be dissolved, dispersed, emulsified or present as a separate free-water phase; the relevant control strategy depends on the fuel condition, equipment architecture and validated separator configuration.

Water can contribute to corrosion, reduced lubricity, microbial growth, restriction and accelerated wear at pumps, injectors and other precision fuel-system interfaces. Microbial contamination is particularly associated with the presence of water in stored fuel and can produce biomass and deposits that shorten filter service life. Repeated water findings or premature plugging should therefore trigger review of storage, transfer, drainage, separation and maintenance practices rather than an isolated element change.

ASTM D6304 and ISO 12937 provide recognized methods for determining water content in petroleum products. They provide measurement context; they are not universal performance certifications for an ELIMFILTERS separator or technology.

## Relationships

### Resolved By Technologies
- [[HYDROCORE|HYDROCORE™ — approved standard non-turbine fuel/water separation, including validated drain and transparent-bowl configurations]]
- [[TURBOCORE|TURBOCORE™ — approved FH/FG turbine-style fuel/water separation systems and dedicated replacement-element architecture]]

### Related Fuel Technology
- [[SYNTAPORE|SYNTAPORE™ — primary, secondary and cartridge diesel-fuel particulate filtration; not a fuel/water-separator architecture]]

### Governing Standards
- [[ASTM_D6304|ASTM D6304 — water-content determination in petroleum products]]
- [[ISO_12937|ISO 12937 — water-content determination in petroleum products]]

### Root Cause Sources
- CONDENSATION — Temperature cycling can create water accumulation in partially filled storage tanks.
- RAIN_INGRESS — Damaged or improperly sealed caps, vents and storage openings can allow direct water entry.
- CROSS_CONTAMINATION — Transfer equipment or upstream storage can introduce contaminated fuel.
- EMULSIFICATION — Agitation and fuel condition can keep fine water droplets dispersed instead of allowing rapid settling.

### Failure Modes Driven
- INJECTOR_EROSION — Water exposure can increase erosion and corrosion risk at precision injection interfaces.
- MICROBIAL_GROWTH — Water availability can support microbial activity in stored fuel.
- FILTER_PLUGGING — Biomass, sediment, degraded fuel and associated contamination can shorten filter life.
- TANK_CORROSION — Water accumulation can increase corrosion risk in storage and delivery systems.
- FUEL_PUMP_CAVITATION — Poor fuel condition and water contamination can contribute to abnormal pump operating conditions.

### Applicable Industries
- [[AGRICULTURE|AGRICULTURE]]
- [[MARINE|MARINE]]
- [[MINING|MINING]]
- [[CONSTRUCTION|CONSTRUCTION]]
- [[TRUCKS_FLEETS|TRUCKS_FLEETS]]
- [[POWER_GENERATION|POWER_GENERATION]]
- [[OIL_GAS|OIL_GAS]]

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Diesel Water Contamination

DEFINITION
Diesel water contamination is the presence of dissolved, dispersed, emulsified or free water
in fuel storage, transfer or delivery systems. It can contribute to corrosion, microbial growth,
filter restriction and downstream fuel-system wear.

SYSTEMS
Fuel Cleanliness Protection; bulk storage; transfer equipment; diesel fuel delivery systems.

FAILURE_IMPACT
Water exposure can accelerate corrosion and wear, support microbial growth and contribute to
premature filter restriction. Severity is application- and condition-dependent.

RELATED_STANDARDS
ASTM D6304 and ISO 12937 provide water-content measurement context. They do not establish a
universal ELIMFILTERS separator performance claim.

RELATED_TECHNOLOGIES
HYDROCORE: approved standard non-turbine fuel/water separation only.
TURBOCORE: approved FH/FG turbine-style fuel/water separation only.
SYNTAPORE: plain diesel-fuel particulate filtration only.
Do not merge these scopes.

INDUSTRIAL_ROLE
Water management is part of the complete fuel-cleanliness chain: storage, transfer, separation,
filtration, drainage and maintenance must be evaluated together when contamination recurs.

CITATION_REFERENCE
source: elimfilters.com/knowledge-center/
concept: Diesel Water Contamination
version: 2.0
last_updated: 2026-09-01
```
