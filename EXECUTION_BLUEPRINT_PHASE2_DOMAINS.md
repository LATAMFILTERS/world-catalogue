# Execution Blueprint — Phase 2: Domain Assignment Mapping

**Status**: Complete — Internal Mapping Structure
**Date**: 2026-05-23
**Pages Assigned**: 26 (Bridge pages already completed in Phase 1)
**Total Knowledge System**: 30 pages with semantic domain assignments

---

## Domain Assignment Matrix

### 5 SEMANTIC DOMAINS (Fixed Architecture)

1. **Contamination Control Systems** (Core Domain)
2. **Hydraulic Efficiency Systems** (Specialized)
3. **Diesel Fuel Integrity Systems** (Specialized)
4. **Air Intake Filtration Systems** (Specialized)
5. **Asset Protection Systems** (Meta-Domain)

---

## STANDARDS DOMAIN PAGES (6 pages)

### Page 12: Lube Oil Systems
**URL**: `/knowledge-system/standards/lube-oil-systems`
**Lines**: 469
**PRIMARY DOMAIN**: Contamination Control Systems
**SECONDARY DOMAIN**: Asset Protection Systems
**Link Types**: Failure Mechanism (1-2), Standards (1), Technology (1-2)
**Key Concepts**: ISO 4406 cleanliness codes (16/14/11), bearing wear, oil condition measurement
**Related Pages to Link**:
- Definition Link: → industrial-filtration (general contamination control)
- Failure Link: → particle-wear (abrasive wear in engine oil)
- Standards Links: → iso-4406 (cleanliness code definition)
- Technology Links: → MACROCORE, NANOFORCE (particle capture)
- Impact Link: → reducing-downtime (bearing failure prevention)

### Page 13: Air Intake Systems
**URL**: `/knowledge-system/standards/air-intake-systems`
**Lines**: 230
**PRIMARY DOMAIN**: Air Intake Filtration Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Failure Mechanism (1-2), Standards (1), Technology (1)
**Key Concepts**: SAE J1539 bypass prevention, volumetric efficiency, particulate capture
**Related Pages to Link**:
- Definition Link: → industrial-filtration (system-level air filtration)
- Failure Link: → particle-wear (abrasive wear from air intake particles)
- Standards Links: → iso-5011 (air filter efficiency testing)
- Technology Links: → MACROCORE (air particle capture)
- Impact Link: → reducing-downtime (bypass prevention)

### Page 14: Fuel Systems
**URL**: `/knowledge-system/standards/fuel-systems`
**Lines**: 234
**PRIMARY DOMAIN**: Diesel Fuel Integrity Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Failure Mechanism (1-2), Standards (1), Technology (1)
**Key Concepts**: ISO 12937 water detection, injector stiction, fuel system corrosion
**Related Pages to Link**:
- Definition Link: → industrial-filtration (system-level fuel protection)
- Failure Link: → diesel-water (water contamination root cause)
- Standards Links: → iso-4406 (fuel contamination measurement)
- Technology Links: → DURATECH (water removal + corrosion prevention)
- Impact Link: → fuel-efficiency (fuel system protection enables efficiency)

### Page 15: Hydraulic Systems
**URL**: `/knowledge-system/standards/hydraulic-systems`
**Lines**: 222
**PRIMARY DOMAIN**: Hydraulic Efficiency Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Failure Mechanism (1-2), Standards (1), Technology (1)
**Key Concepts**: NFPA T2.14 proportional valve protection, ISO 16889 Beta ratio, varnish formation
**Related Pages to Link**:
- Definition Link: → industrial-filtration (hydraulic contamination control)
- Failure Link: → hydraulic-system (varnish formation + valve degradation)
- Standards Links: → iso-16889 (Beta ratio proportional valve protection)
- Technology Links: → NANOFORCE (sub-micron hydraulic contamination control)
- Impact Link: → total-cost-ownership (hydraulic failure costs)

### Page 16: Cabin Safety Systems
**URL**: `/knowledge-system/standards/cabin-safety-systems`
**Lines**: 274
**PRIMARY DOMAIN**: Contamination Control Systems
**SECONDARY DOMAIN**: Asset Protection Systems
**Link Types**: Failure Mechanism (1-2), Standards (1), Technology (1)
**Key Concepts**: ISO 11155 operator health, PM10/PM2.5 exposure, cabin air purity
**Related Pages to Link**:
- Definition Link: → industrial-filtration (human health contamination control)
- Failure Link: → particle-wear (operator exposure to particulate contamination)
- Standards Links: → iso-4406 (PM measurement framework)
- Technology Links: → MACROCORE (operator health protection)
- Impact Link: → reducing-downtime (operator wellness impacts availability)

### Page 17: Compressed Air Systems
**URL**: `/knowledge-system/standards/compressed-air-systems`
**Lines**: 270
**PRIMARY DOMAIN**: Contamination Control Systems
**SECONDARY DOMAIN**: Asset Protection Systems
**Link Types**: Failure Mechanism (1-2), Standards (1), Technology (1)
**Key Concepts**: ISO 8573-1 purity classes, dew point control, compressed air cleanliness
**Related Pages to Link**:
- Definition Link: → industrial-filtration (compressed air contamination framework)
- Failure Link: → particle-wear (tool damage from contaminated air)
- Standards Links: → iso-4406 (contamination measurement framework)
- Technology Links: → MACROCORE (particle removal for air systems)
- Impact Link: → reducing-downtime (tool reliability through clean air)

---

## STANDARDS DEFINITION PAGES (3 pages)

### Page 18: ISO 4406
**URL**: `/knowledge-system/standards/iso-4406`
**Lines**: 201
**PRIMARY DOMAIN**: Contamination Control Systems
**SECONDARY DOMAIN**: (None)
**Link Types**: Standards (1-2), Definition (1), Technology (1)
**Key Concepts**: Particle cleanliness codes (16/14/11), measurement methodology, contamination targets
**Related Pages to Link**:
- Definition Link: → industrial-filtration (system-level application of ISO 4406)
- Standards Links: → lube-oil-systems, air-intake-systems, fuel-systems, cabin-safety-systems (all use ISO 4406)
- Technology Links: → MACROCORE, NANOFORCE (achieving ISO cleanliness targets)
- Impact Link: → reducing-downtime (cleanliness codes prevent downtime)

### Page 19: ISO 16889
**URL**: `/knowledge-system/standards/iso-16889`
**Lines**: 201
**PRIMARY DOMAIN**: Contamination Control Systems
**SECONDARY DOMAIN**: Hydraulic Efficiency Systems
**Link Types**: Standards (1-2), Definition (1), Technology (1)
**Key Concepts**: Beta ratio filter testing, capture efficiency, filter classification
**Related Pages to Link**:
- Definition Link: → industrial-filtration (Beta ratio in filter selection)
- Standards Links: → lube-oil-systems, hydraulic-systems, fuel-systems (all use ISO 16889)
- Technology Links: → MACROCORE (Beta ratio certification), NANOFORCE (high Beta ratio achievement)
- Impact Link: → total-cost-ownership (Beta ratio determines interval extension)

### Page 20: ISO 5011
**URL**: `/knowledge-system/standards/iso-5011`
**Lines**: 201
**PRIMARY DOMAIN**: Air Intake Filtration Systems
**SECONDARY DOMAIN**: (None)
**Link Types**: Standards (1-2), Definition (1), Technology (1)
**Key Concepts**: Air filter efficiency testing, bypass prevention, volumetric efficiency preservation
**Related Pages to Link**:
- Definition Link: → industrial-filtration (air intake efficiency standards)
- Standards Links: → air-intake-systems (primary application)
- Technology Links: → MACROCORE (air intake efficiency achievement)
- Impact Link: → particle-wear (bypass prevention prevents engine wear)

---

## CONTAMINATION CASE STUDY PAGES (3 pages)

### Page 21: Particle Wear in Engines
**URL**: `/knowledge-system/contamination/particle-wear`
**Lines**: 290
**PRIMARY DOMAIN**: Contamination Control Systems
**SECONDARY DOMAIN**: Air Intake Filtration Systems
**Link Types**: Failure Mechanism (1-2), Standards (1), Technology (1), Operational Impact (1)
**Key Concepts**: Abrasive wear progression, particle size damage, bearing clearance reduction, seizure
**Related Pages to Link**:
- Failure Link: → air-intake-systems (bypass prevention), lube-oil-systems (bearing protection)
- Standards Links: → iso-4406 (cleanliness code targets), iso-5011 (air intake efficiency)
- Technology Links: → MACROCORE (particulate capture), NANOFORCE (sub-micron protection)
- Impact Link: → reducing-downtime (wear prevention prevents emergency repairs)

### Page 22: Diesel Water Contamination
**URL**: `/knowledge-system/contamination/diesel-water`
**Lines**: 290
**PRIMARY DOMAIN**: Diesel Fuel Integrity Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Failure Mechanism (1-2), Standards (1), Technology (1), Operational Impact (1)
**Key Concepts**: Water in fuel sources, injector stiction, fuel system corrosion, microbial growth
**Related Pages to Link**:
- Failure Link: → fuel-systems (water contamination prevention)
- Standards Links: → iso-4406 (water measurement framework), iso-12937 (fuel water content)
- Technology Links: → DURATECH (water removal + corrosion prevention)
- Impact Link: → fuel-efficiency (water-free fuel enables efficiency)

### Page 23: Hydraulic System Contamination
**URL**: `/knowledge-system/contamination/hydraulic-system`
**Lines**: 290
**PRIMARY DOMAIN**: Hydraulic Efficiency Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Failure Mechanism (1-2), Standards (1), Technology (1), Operational Impact (1)
**Key Concepts**: Varnish formation, proportional valve stiction, efficiency loss, system responsiveness
**Related Pages to Link**:
- Failure Link: → hydraulic-systems (proportional valve protection)
- Standards Links: → iso-16889 (Beta ratio proportional valve targets), iso-4406 (cleanliness codes)
- Technology Links: → NANOFORCE (sub-micron hydraulic contamination control)
- Impact Link: → total-cost-ownership (hydraulic system reliability prevents major overhauls)

---

## FLEET OPTIMIZATION PAGES (3 pages)

### Page 24: Reducing Fleet Downtime
**URL**: `/knowledge-system/fleet/reducing-downtime`
**Lines**: 461
**PRIMARY DOMAIN**: Asset Protection Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Operational Impact (1-2), Failure Mechanism (1), Technology (1)
**Key Concepts**: Condition-based replacement, contamination monitoring, preventive maintenance, unplanned repair reduction
**Related Pages to Link**:
- Impact Link: → industrial-filtration (system-level approach reduces downtime)
- Failure Links: → particle-wear, diesel-water, hydraulic-system (prevention prevents downtime)
- Standards Links: → iso-4406 (contamination monitoring framework)
- Technology Links: → MACROCORE, NANOFORCE (contamination prevention)

### Page 25: Filtration and Fuel Efficiency
**URL**: `/knowledge-system/fleet/fuel-efficiency`
**Lines**: 451
**PRIMARY DOMAIN**: Diesel Fuel Integrity Systems
**SECONDARY DOMAIN**: Asset Protection Systems
**Link Types**: Operational Impact (1-2), Technology (1), Failure Mechanism (1)
**Key Concepts**: Water-free fuel + engine efficiency, fuel system optimization, consumption reduction
**Related Pages to Link**:
- Failure Link: → diesel-water (water removal enables efficiency)
- Standards Links: → fuel-systems (fuel contamination control)
- Technology Links: → DURATECH (fuel system protection + efficiency)
- Impact Link: → total-cost-ownership (fuel efficiency impacts lifecycle costs)

### Page 26: Total Cost of Ownership
**URL**: `/knowledge-system/fleet/total-cost-ownership`
**Lines**: 504
**PRIMARY DOMAIN**: Asset Protection Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Operational Impact (1-2), Technology (1), Failure Mechanism (1)
**Key Concepts**: Lifecycle cost calculation, downtime costs, component replacement, maintenance intervals
**Related Pages to Link**:
- Impact Links: → industrial-filtration (system approach improves TCO)
- Failure Links: → particle-wear, diesel-water, hydraulic-system (failure costs)
- Technology Links: → MACROCORE, NANOFORCE, SYNTRAX (interval extension)
- Standards Links: → iso-4406 (contamination targets reduce costs)

---

## COMPARE FRAMEWORK PAGES (4 pages)

### Page 27: System vs Commodity
**URL**: `/knowledge-system/compare/system-vs-commodity`
**Lines**: 436
**PRIMARY DOMAIN**: Asset Protection Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Operational Impact (1-2), Failure Mechanism (1), Technology (1)
**Key Concepts**: Product thinking vs system thinking, commodity limitations, system-level advantage
**Related Pages to Link**:
- Impact Links: → industrial-filtration (system advantage explanation)
- Failure Links: → particle-wear, diesel-water, hydraulic-system (system failures from commodity approach)
- Technology Links: → MACROCORE (system solution)
- Standards Links: → iso-4406 (measurement prevents commodity thinking)

### Page 28: Evaluation Framework
**URL**: `/knowledge-system/compare/evaluation-framework`
**Lines**: 518
**PRIMARY DOMAIN**: Asset Protection Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Standards (1-2), Technology (1), Operational Impact (1)
**Key Concepts**: Decision criteria, contamination metrics, Beta ratio evaluation, lifecycle cost assessment
**Related Pages to Link**:
- Standards Links: → iso-16889 (Beta ratio framework), iso-4406 (cleanliness targets)
- Technology Links: → MACROCORE (Beta ratio achievement)
- Impact Link: → total-cost-ownership (evaluation includes lifecycle costs)
- Definition Link: → industrial-filtration (system evaluation approach)

### Page 29: OEM Comparison
**URL**: `/knowledge-system/compare/oem-comparison`
**Lines**: 436
**PRIMARY DOMAIN**: Asset Protection Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Operational Impact (1-2), Standards (1), Technology (1)
**Key Concepts**: OEM specification analysis, aftermarket equivalents, warranty considerations, cost comparison
**Related Pages to Link**:
- Impact Links: → oem-replacement (warranty period strategy)
- Standards Links: → iso-4406, iso-16889 (specification basis)
- Technology Links: → MACROCORE, NANOFORCE (equivalent performance)
- Definition Link: → industrial-filtration (equivalent filter evaluation)

### Page 30: Total Cost of Ownership (Compare version)
**URL**: `/knowledge-system/compare/total-cost-ownership`
**Lines**: 575
**PRIMARY DOMAIN**: Asset Protection Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Operational Impact (1-2), Technology (1), Failure Mechanism (1)
**Key Concepts**: Cost model, downtime calculation, component lifecycle, maintenance intervals
**Related Pages to Link**:
- Impact Links: → fleet/total-cost-ownership (fleet-level TCO implementation)
- Technology Links: → SYNTRAX, DURATECH (extended lifecycle = TCO improvement)
- Failure Links: → particle-wear, diesel-water, hydraulic-system (failure costs)
- Standards Links: → iso-4406 (cleanliness targets determine intervals)

---

## HUB/NAVIGATION PAGES (7 pages)

### Page 1: Main Knowledge System Hub
**URL**: `/knowledge-system`
**Lines**: 226
**PRIMARY DOMAIN**: Asset Protection Systems
**SECONDARY DOMAIN**: Contamination Control Systems
**Link Types**: Definition (0), Navigation (1-2 internal section links only)
**Purpose**: Navigation to subcategories, no semantic linking needed
**Structure**: Links to Bridges, Standards, Contamination, Fleet, Compare hubs

### Page 2: Bridges Hub
**URL**: `/knowledge-system/bridges`
**Lines**: 222
**PRIMARY DOMAIN**: Asset Protection Systems
**Link Types**: Navigation links only
**Purpose**: Links to 4 bridge pages (industrial-filtration, oem-replacement, aftermarket-selection, fleet-solutions)

### Page 3: Standards Hub
**URL**: `/knowledge-system/standards`
**Lines**: 212
**PRIMARY DOMAIN**: Contamination Control Systems
**Link Types**: Navigation links only
**Purpose**: Links to 6 system domain pages + 3 standard definition pages

### Page 4: Contamination Hub
**URL**: `/knowledge-system/contamination`
**Lines**: 191
**PRIMARY DOMAIN**: Contamination Control Systems
**Link Types**: Navigation links only
**Purpose**: Links to 3 contamination case study pages

### Page 5: Fleet Hub
**URL**: `/knowledge-system/fleet`
**Lines**: 186
**PRIMARY DOMAIN**: Asset Protection Systems
**Link Types**: Navigation links only
**Purpose**: Links to 3 fleet optimization strategy pages

### Page 6: Compare Hub
**URL**: `/knowledge-system/compare`
**Lines**: 222
**PRIMARY DOMAIN**: Asset Protection Systems
**Link Types**: Navigation links only
**Purpose**: Links to 4 comparison framework pages

### Page 7: Science/Technology Hub
**URL**: `/knowledge-system/science`
**Lines**: 24
**PRIMARY DOMAIN**: Asset Protection Systems
**Link Types**: Navigation links only
**Purpose**: Technology overview, minimal content

---

## Domain Assignment Summary

### By Domain

**Contamination Control Systems** (Core - 12 pages)
- Standards: lube-oil, cabin-safety, compressed-air, iso-4406, iso-5011*, iso-16889*
- Contamination: particle-wear, diesel-water, hydraulic-system
- Bridge: industrial-filtration*
- Fleet: reducing-downtime*, total-cost-ownership*
- Compare: system-vs-commodity*, evaluation-framework*, oem-comparison*, total-cost-ownership*
- Hub: standards, contamination

**Asset Protection Systems** (Meta - 16 pages)
- Bridge: oem-replacement, aftermarket-selection, fleet-solutions, industrial-filtration*
- Standards: lube-oil*
- Fleet: reducing-downtime*, fuel-efficiency, total-cost-ownership*
- Compare: system-vs-commodity*, evaluation-framework*, oem-comparison*, total-cost-ownership*
- Hub: main, bridges, fleet, compare, science

**Hydraulic Efficiency Systems** (Specialized - 4 pages)
- Standards: hydraulic-systems, iso-16889*
- Contamination: hydraulic-system

**Diesel Fuel Integrity Systems** (Specialized - 4 pages)
- Standards: fuel-systems
- Contamination: diesel-water
- Fleet: fuel-efficiency

**Air Intake Filtration Systems** (Specialized - 3 pages)
- Standards: air-intake-systems, iso-5011
- Contamination: particle-wear*

---

## Link Distribution Plan

### Total Semantic Links to Add (26 pages)

| Category | Pages | Links/Page | Total Links |
|----------|-------|-----------|-------------|
| Standards Domains | 6 | 2-3 | 12-18 |
| Standards Definitions | 3 | 2-3 | 6-9 |
| Contamination Cases | 3 | 3-4 | 9-12 |
| Fleet Optimization | 3 | 2-3 | 6-9 |
| Compare Frameworks | 4 | 2-3 | 8-12 |
| Hubs | 7 | 0-1 | 0-7 |
| **TOTAL** | **26** | **2-3** | **41-67 links** |

---

## Phase 2 Complete ✅

**Domain Assignment**: All 26 remaining pages have:
- PRIMARY domain assigned
- OPTIONAL secondary domain assigned
- Recommended link types defined
- Related pages identified for linking
- No files modified

**Ready for PHASE 3 — Internal Linking**

---

*Phase 2 Complete — Domain mapping structure established*
*No UI changes, no file modifications*
*Ready to proceed to Phase 3: Semantic Link Implementation*
