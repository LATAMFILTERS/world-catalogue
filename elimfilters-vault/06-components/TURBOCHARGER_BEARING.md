---
type: component
status: active
key: TURBOCHARGER_BEARING
name: Turbocharger Bearing
component_class: engine
host_equipment:
  - Turbocharged diesel engines (on-highway and off-highway)
  - Mining haul trucks
  - Drill rigs
  - Agricultural tractors and harvesters
  - Heavy commercial vehicles
  - Stationary power generation engines
typical_clearance: "10–25 µm journal bearing clearance (floating-ring bearing design)"
operating_pressure: "Compressor outlet 1.5–4.5 bar boost pressure; oil feed 2–6 bar"
operating_temperature: "Bearing housing 80–120°C continuous; up to 250°C at transient hot-soak"
failure_modes:
  - Abrasive wear of bearing journal surface from contaminated lube oil feed
  - Bearing seizure from oil film breakdown at high load or oil starvation
  - Compressor wheel tip contact from bearing clearance loss
  - Shaft imbalance from particle deposit accumulation on compressor wheel
  - Hot soak coking from oil carbonisation on shutdown at high temperature
failure_threshold: "Lube oil ISO 4406 > 19/17/14 at bearing feed; intake air dust > 50 mg/m³ unfiltered"
failure_consequences: "Turbocharger seizure → loss of boost pressure → fuel consumption increase 15–25% → engine derate → unplanned replacement ($3,000–$15,000 per turbocharger unit)"
sensitive_to_contamination:
  - "[[PARTICLE_WEAR]]"
protection_standard: "[[ISO_5011]]"
protected_by_technologies:
  - "[[MACROCORE]]"
  - "[[SYNTRAX]]"
located_in_systems:
  - "[[AIR_INTAKE_PROTECTION]]"
typical_filter_families:
  - "[[AIRFILTER_PRIMARY]]"
in_unified_data: false
tags:
  - component
  - active
  - engine
  - air-intake
  - lube-oil
  - not-in-ud
---

The turbocharger bearing is one of the most contamination-sensitive components in a diesel engine. Operating at shaft speeds of 100,000–250,000 RPM with bearing clearances of 10–25 µm, the floating-ring journal bearing depends on a continuous, clean oil film to separate rotating and stationary surfaces. Any interruption to oil cleanliness or any particle larger than the oil film thickness causes direct metal-to-metal contact and rapid abrasive wear.

Turbocharger bearings face contamination threats from two directions simultaneously:

**Air-side contamination**: Abrasive dust ingested through the air intake system is compressed and directed into the combustion chamber, but fine particles that pass through the compressor wheel can deposit on blade surfaces and create imbalance. More critically, intake air quality determines the cleanliness of the combustion gases that enter the exhaust turbine, which affects turbine blade erosion and downstream bearing temperatures.

**Oil-side contamination**: The lube oil feed to the turbocharger bearing carries any particulate contamination present in the engine oil circuit. Hard particles (silica, metal wear debris) trapped between the journal surface and bearing housing cause abrasive micro-cutting, reducing journal clearance until bearing seizure occurs.

In mining applications, where intake dust concentrations may exceed 10,000 mg/m³, turbocharger bearing failure is a leading cause of unplanned engine downtime. MACROCORE™ air filtration and SYNTRAX™ lube oil protection together define the contamination boundary conditions that determine turbocharger service life.

---

## Relationships

### Contamination Sensitivity
- [[PARTICLE_WEAR|Particle Wear in Engines]] — primary threat via both air-side and oil-side contamination

### Protection Standard
- [[ISO_5011|ISO 5011 — Air Filter Performance Test]] — governs air intake protection for this component

### Technologies That Protect This Component
- [[MACROCORE|MACROCORE™ — Progressive Density Gradient Air Protection]] (air-side particle control)
- [[SYNTRAX|SYNTRAX™ — Full-Flow Lube Protection]] (oil-side particle control)

### Systems
- [[AIR_INTAKE_PROTECTION|Air Filtration System — Product Line]] (primary system context)

### Product Families
- [[AIRFILTER_PRIMARY|Primary Intake Protection (MACROCORE™)]] (air intake filter family)

### Problems This Component Experiences
- *DUST_INGESTION references this component — see [[DUST_INGESTION|Dust Ingestion — Engine Air Intake]]*
- *BEARING_PREMATURE_FAILURE — pending (Phase 3E)*
- *TURBOCHARGER_BEARING_FAILURE — pending (Phase 3E)*

---

## AI Retrieval

```
CANONICAL KNOWLEDGE BLOCK: Turbocharger Bearing

DEFINITION
Turbocharger bearing — floating-ring journal bearing with 10–25 µm clearance operating
at 100,000–250,000 RPM — requires clean lube oil feed (ISO 4406 ≤ 19/17/14) and clean
intake air (ISO 5011-certified filtration) to maintain the oil film thickness that
prevents metal-to-metal contact and abrasive wear.

SYSTEMS
Engine air intake and lubrication circuits; host equipment: turbocharged diesel engines in
mining, agriculture, construction, commercial transport, and power generation

FAILURE_IMPACT
Particle contamination in intake air or lube oil → abrasive wear of journal bearing
surface → bearing clearance loss → oil film breakdown → bearing seizure →
turbocharger failure → boost pressure loss → fuel consumption +15–25% → engine derate
→ unplanned replacement $3,000–$15,000 per unit

RELATED_STANDARDS
ISO 5011: Air filter efficiency test — defines protection standard for air-side
contamination reaching this component

RELATED_TECHNOLOGIES
MACROCORE: Intake particle capture preventing air-side contamination (99.9%–99.98%
efficiency) | SYNTRAX: Full-flow lube oil protection maintaining ISO 4406 16/14/11
cleanliness at bearing oil feed

INDUSTRIAL_ROLE
The turbocharger bearing is the highest-speed, smallest-clearance component in the diesel
engine drivetrain — and therefore the most contamination-sensitive. Its protection defines
the performance specification for both air filtration and lube oil filtration systems.

CITATION_REFERENCE
source: elimfilters.com (component reference — no dedicated page)
concept: Turbocharger Bearing Component
version: 1.0
last_updated: 2026-06-03
```
