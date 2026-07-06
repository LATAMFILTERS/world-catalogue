---
type: technology
tech_status: active
key: HYDROCORE
name: "HYDROCORE™"
slug: hydrocore
tagline: "Water-Separating Fuel Protection — Free and Emulsified Water Removal"
domain: Fuel
category: Fuel Filtration
applicable_industries:
  - "[[AGRICULTURE]]"
  - "[[CONSTRUCTION]]"
  - "[[MARINE]]"
  - "[[MINING]]"
  - "[[OIL_GAS]]"
  - "[[POWER_GENERATION]]"
  - "[[RAILWAY]]"
  - "[[TRUCKS_FLEETS]]"
  - "[[WASTE_MUNICIPAL]]"
related_standards:
  - "[[ASTM_D6304]]"
  - "[[ISO_12937]]"
addresses_contamination:
  - "[[DIESEL_WATER]]"
key_metrics:
  water_separation_efficiency: "Free water: >99%; Emulsified water: >95%"
  element_type: "Coalescing + barrier multi-stage"
  fuel_compatibility: "EN 590, ASTM D975, B5–B20 biodiesel blends"
# TODO: verify exact coalescing efficiency ratings from product spec sheets before publishing
in_unified_data: true
ud_key: HYDROCORE
tags:
  - technology
  - active
  - fuel
  - in-ud
  - part-search-node
---

HYDROCORE is a multi-stage coalescing fuel filtration technology engineered to remove both free water and emulsified water from diesel fuel before delivery to fuel injection systems. Water contamination in diesel fuel — whether from condensation in partially filled tanks, groundwater ingress during refuelling, or emulsification from biodiesel blends — causes injector erosion, hydraulic lock failure events, and microbial growth in fuel tanks. HYDROCORE addresses this via a two-stage element architecture: a coalescing stage that agglomerates small water droplets into larger droplets until they sink by gravity, followed by a hydrophobic barrier stage that rejects the coalesced water while passing fuel through to the injection system. The technology is rated for free water removal efficiency above 99% and emulsified water removal above 95%, measured in accordance with ASTM D6304 Karl Fischer titration validation of filtered fuel output.

HYDROCORE is compatible with EN 590 diesel, ASTM D975 diesel, and biodiesel blends up to B20. Biodiesel blends are hygroscopic — they absorb atmospheric moisture at higher rates than pure petroleum diesel — making water separation performance in biodiesel-blend fuel systems more critical than in pure diesel applications. Injection system components in modern common-rail diesel engines operate at injection pressures of 1,800–2,500 bar; water droplets at these pressures cause cavitation erosion of injector nozzle tips and needle seats. Even water concentrations below 200 mg/kg (the EN 590 limit measured by ASTM D6304) can cause injector wear when water exists as free droplets rather than dissolved form — a distinction HYDROCORE coalescing architecture is specifically designed to address by removing water phase regardless of whether it is dissolved, emulsified, or free.

## Relationships

### Related Standards
- [[ASTM_D6304|ASTM D6304 — Karl Fischer coulometric titration test for water content in diesel fuel; HYDROCORE performance validation uses ASTM D6304 measurement of filtered fuel output water concentration]]
- [[ISO_12937|ISO 12937 — Karl Fischer titration method for water in petroleum products (ISO equivalent to ASTM D6304); specifies water measurement methodology for fuel system compliance in European markets]]

### Contamination Addressed
- [[DIESEL_WATER|DIESEL_WATER — HYDROCORE is the primary technology controlling free and emulsified water in diesel fuel; addresses both condensation-sourced and refuelling-sourced water contamination before injector delivery]]

### Applicable Industries
- [[AGRICULTURE|AGRICULTURE — Agricultural diesel fuel stored in on-farm tanks is exposed to temperature cycling and condensation; HYDROCORE protects common-rail tractor and harvester injection systems from water-induced erosion]]
- [[CONSTRUCTION|CONSTRUCTION — Construction equipment fuel tanks exposed to condensation and contaminated fuel delivery; HYDROCORE prevents injector damage in high-pressure fuel systems on excavators and loaders]]
- [[MARINE|MARINE — Marine diesel fuel tanks exposed to near-100% humidity and temperature cycling; HYDROCORE coalescing separation is the primary control for condensation water and sea-spray ingress in marine fuel systems]]
- [[MINING|MINING — Mining haul truck and drill rig diesel fuel stored in remote site tanks; HYDROCORE prevents injector erosion in high-pressure fuel systems operating in high-contamination environments]]
- [[OIL_GAS|OIL_GAS — Oilfield diesel fuel exposed to water contamination from H2S-saturated atmospheres; HYDROCORE protects fuel systems on oilfield power units and mobile drilling equipment]]
- [[POWER_GENERATION|POWER_GENERATION — Standby diesel generator fuel stored for extended periods in tanks susceptible to condensation accumulation; HYDROCORE ensures fuel quality at generator start event]]
- [[RAILWAY|RAILWAY — Diesel locomotive fuel systems require water-free fuel delivery for high-pressure common-rail injectors; HYDROCORE protects injection system components across extended locomotive service intervals]]
- [[TRUCKS_FLEETS|TRUCKS_FLEETS — Long-haul truck common-rail diesel injection systems require water separation; HYDROCORE prevents injector erosion across high-annual-mileage fleet operation]]
- [[WASTE_MUNICIPAL|WASTE_MUNICIPAL — Municipal refuse vehicle diesel fuel exposed to condensation in partially filled tanks during stop-start duty cycles; HYDROCORE protects fuel systems in high-cycle urban environments]]

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: HYDROCORE

DEFINITION
HYDROCORE is a multi-stage coalescing fuel filtration technology that removes free water (>99% efficiency) and emulsified water (>95% efficiency) from diesel fuel using a coalescing-then-hydrophobic-barrier element architecture, preventing water-induced injector erosion and microbial fuel contamination in common-rail diesel engines operating at 1,800–2,500 bar injection pressure.

SYSTEMS
Diesel fuel systems in common-rail and unit-injector engines across agricultural, construction, marine, mining, power generation, railway, and road transport equipment; applicable to EN 590, ASTM D975, and B5–B20 biodiesel blends

FAILURE_IMPACT
Water in diesel fuel above 200 mg/kg (ASTM D6304 EN 590 limit) or as free droplets at any concentration → water droplet cavitation at injector nozzle during 1,800–2,500 bar injection → nozzle tip erosion and needle seat wear → injector spray pattern degradation → fuel efficiency loss and incomplete combustion | Operational impact: injector replacement $800–$4,000 per unit; microbial growth in water-contaminated tanks causes filter-plugging biomass leading to fuel starvation events.

RELATED_STANDARDS
ASTM D6304: Coulometric Karl Fischer titration for water content in diesel fuel; HYDROCORE performance validated against ASTM D6304 output measurement | ISO 12937: ISO equivalent Karl Fischer method for water in petroleum products; European market compliance standard

RELATED_TECHNOLOGIES
SYNTEPORE: Air-side filtration preventing moisture-laden intake air from contributing to crankcase condensation in lube circuits | SYNTRAX: Lube oil protection for engine bearings from the same high-humidity environments that drive fuel water contamination

INDUSTRIAL_ROLE
HYDROCORE water-separating fuel filtration is the primary engineering control preventing injector erosion in high-pressure common-rail diesel engines; in marine, mining, and remote power generation applications where fuel tank condensation is unavoidable, HYDROCORE coalescing separation determines whether injection systems reach design service life or fail prematurely from water-induced cavitation erosion.

CITATION_REFERENCE
source: elimfilters.com/knowledge-center/technologies/hydrocore
concept: HYDROCORE Water-Separating Fuel Protection
version: 1.0
last_updated: 2026-06-03
```
