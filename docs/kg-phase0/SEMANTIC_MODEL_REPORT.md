# SEMANTIC_MODEL_REPORT.md
# ELIMFILTERS — Semantic Architecture Inventory (knowledge-architecture.ts)
# KG Phase 0 Readiness Audit

**File:** `/home/user/world-catalogue/frontend/src/lib/knowledge-architecture.ts`

---

## 1. TECHNOLOGIES DEFINED IN TYPESCRIPT

6 technologies defined. **DB has 13+. Critical gap.**

| ID | Name | Category (TS) | Slug | Contamination | Industries |
|----|------|--------------|------|--------------|------------|
| MACROCORE | MACROCORE™ | Air Filtration | macrocore | PARTICLE_WEAR | AGRICULTURE, MINING, CONSTRUCTION, POWER_GEN, MARINE |
| NANOFORCE | NANOFORCE™ | Fuel & Hydraulic Filtration | nanoforce | DIESEL_WATER, PARTICLE_WEAR, HYDRAULIC_CONTAMINATION | AGRICULTURE, CONSTRUCTION, MARINE, POWER_GEN, AUTOMOTIVE |
| MICROKAPPA | MICROKAPPA™ | Coolant & Specialty Filtration | microkappa | PARTICLE_WEAR, HYDRAULIC_CONTAMINATION | MANUFACTURING, AUTOMOTIVE, MARINE |
| SYNTRAX | SYNTRAX™ | Synthetic Fluid Technology | syntrax | DIESEL_WATER, HYDRAULIC_CONTAMINATION | MINING, CONSTRUCTION, MARINE, POWER_GEN |
| AQUAGUARD | AQUAGUARD™ | Water Removal Technology | aquaguard | DIESEL_WATER, HYDRAULIC_CONTAMINATION | MARINE, AGRICULTURE, OUTDOOR_EQUIPMENT, POWER_GEN |
| DURATECH | DURATECH™ | Engine Oil Filtration | duratech | PARTICLE_WEAR | AGRICULTURE, CONSTRUCTION, AUTOMOTIVE, MARINE |

### ⚠️ CRITICAL DISCREPANCIES VS. DB

**MICROKAPPA in TypeScript** = "Coolant & Specialty Filtration"
**MICROKAPPA in DB** (`update-lube-descriptions`) = Cabin Air Filter technology
> TS description: "Micro-filtration for machine tool coolants and specialty fluids"
> DB usage: `MICROKAPPA™ technology combines electrostatic attraction, HEPA-class mechanical filtration and activated carbon adsorption` for cabin air
**→ These are DIFFERENT things. TS has the wrong category for MICROKAPPA.**

**SYNTRAX in TypeScript** = "Advanced Hydraulic & Industrial Fluids"
**SYNTRAX in DB** = Used for Lube Filters (engine oil), NOT hydraulics
> TS description: "High-performance synthetic fluids with superior contamination resistance"
> DB usage: SYNTRAX is the engine oil/lube filter technology
> NANOFORCE is the hydraulic filter technology
**→ TS has SYNTRAX and NANOFORCE categories partially swapped.**

**Missing in TypeScript (present in DB):**
```
INTEKCORE  — Air Housing / Precleaner technology
DRYCORE    — Air Dryer technology
GASULTRA   — Compressed Air technology
COOLTECH   — Coolant Filter technology
SYNTEPORE  — Fuel Filter technology
MARINECLEAN — Marine Filter technology
BLUECLEAN  — Specialty technology
```

**KG RULE:** The KG must use the DB as the source of truth for technology-product relationships, NOT knowledge-architecture.ts. The TS file will be UPDATED after KG is in place.

---

## 2. STANDARDS DEFINED IN TYPESCRIPT

6 standards defined.

| Code | Name | Slug | Criticality | Technologies | Contamination |
|------|------|------|------------|-------------|--------------|
| ISO 16889 | Cleanliness Coding System | iso-16889 | PRIMARY | MACROCORE, NANOFORCE, MICROKAPPA, AQUAGUARD, DURATECH | PARTICLE_WEAR, HYDRAULIC_CONTAMINATION |
| ISO 4406 | Legacy Cleanliness Code | iso-4406 | SECONDARY | DURATECH, NANOFORCE | PARTICLE_WEAR |
| ISO 5011 | Filter Integrity Testing | iso-5011 | PRIMARY | MACROCORE, NANOFORCE, MICROKAPPA, AQUAGUARD, DURATECH | PARTICLE_WEAR, HYDRAULIC_CONTAMINATION |
| ASTM D6304 | Karl Fischer Titration | astm-d6304 | PRIMARY | NANOFORCE, AQUAGUARD, SYNTRAX | DIESEL_WATER |
| SAE J1539 | Air Intake Cleanliness | sae-j1539 | PRIMARY | MACROCORE | PARTICLE_WEAR |
| NFPA T2.14 | Machine Tool Hydraulic Fluids | nfpa-t214 | PRIMARY | NANOFORCE, SYNTRAX | HYDRAULIC_CONTAMINATION |

**Missing standards (referenced in CLAUDE.md and descriptions but not in TS):**
- ISO 11155 (Cabin Air Filtration — road vehicles)
- DIN 71220 (Cabin Air Filtration)
- DIN 51524 (Hydraulic Fluids)
- ISO 12937 (Water in Petroleum Products)
- ISO 14540 (Marine standards)
- SAE J726 (Air Cleaner testing)
- ASTM D7085

---

## 3. CONTAMINATION MODES DEFINED IN TYPESCRIPT

3 contamination modes.

| ID | Name | Slug | Root Causes | Failure Modes | Resolved By |
|----|------|------|------------|--------------|-------------|
| DIESEL_WATER | Diesel Water Contamination | diesel-water | ATMOSPHERIC_BREATHING, CONDENSATION, STORAGE_CORROSION, TRANSFER_CONTAMINATION | INJECTOR_STICTION, MICROBIAL_GROWTH, FUEL_GUM_FORMATION | NANOFORCE, AQUAGUARD, SYNTRAX |
| PARTICLE_WEAR | Particle Wear in Engines | particle-wear | AIR_INTAKE_INGESTION, FUEL_CONTAMINATION, INTERNAL_GENERATION, OIL_CIRCULATION | TWO_BODY_WEAR, THREE_BODY_WEAR, ADHESIVE_WEAR, BEARING_SPALLING | MACROCORE, NANOFORCE, DURATECH |
| HYDRAULIC_CONTAMINATION | Hydraulic System Contamination | hydraulic-system | MANUFACTURING_RESIDUE, SEAL_DEGRADATION, EXTERNAL_INGESTION, PUMP_WEAR | VALVE_SPOOL_STICTION, ORIFICE_BLOCKAGE, PUMP_SWASHPLATE_STICTION | NANOFORCE, AQUAGUARD, SYNTRAX, MICROKAPPA |

**Quantified impacts (key data for AI Citation Layer):**
```
DIESEL_WATER:
  hardStarting: +5-15 seconds
  fuelConsumption: +3-8%
  injectorCleaningFrequency: 2000-3000 hours
  equipmentAvailability: -12-18%

PARTICLE_WEAR:
  oilConsumption: +15-40%
  engineBlowBy: +5-10%
  fuelEconomy: -5-12%
  compressionDrop: -10-25%
  equipmentAvailability: -15-25%

HYDRAULIC_CONTAMINATION:
  systemPressureIncrease: +10-30%
  heatGeneration: +5-15 kW
  fluidTemperature: +20-30C
  equipmentAvailability: -15-30%
  unplannedMaintenance: 1-2 per 500 hours
```

**Missing contamination modes (referenced in content):**
- Varnish formation
- Microbial growth (referenced in DIESEL_WATER but not its own mode)
- Cabin contamination / PM2.5 exposure
- Compressed air moisture
- Coolant degradation

---

## 4. INDUSTRIES DEFINED IN TYPESCRIPT

7 industries defined.

| ID | Name | Slug | Contamination Exposure | Primary Equipment | Technologies |
|----|------|------|----------------------|------------------|-------------|
| AGRICULTURE | Agriculture | agriculture | HIGH | COMBINES, TRACTORS, HARVESTERS | MACROCORE, NANOFORCE, DURATECH, SYNTRAX |
| CONSTRUCTION | Construction | construction | HIGH | EXCAVATORS, BULLDOZERS, LOADERS | MACROCORE, NANOFORCE, DURATECH |
| MINING | Mining | mining | EXTREME | HAUL_TRUCKS, DRILL_RIGS, LOADERS | MACROCORE, NANOFORCE, DURATECH, SYNTRAX |
| MARINE | Marine | marine | MEDIUM-HIGH | FISHING_VESSELS, CARGO_SHIPS | NANOFORCE, AQUAGUARD, DURATECH, SYNTRAX |
| AUTOMOTIVE | Automotive | automotive | MEDIUM | HEAVY_TRUCKS, BUSES | MACROCORE, NANOFORCE, DURATECH |
| MANUFACTURING | Manufacturing | manufacturing | LOW-MEDIUM | MACHINE_TOOLS, PRESSES | NANOFORCE, MICROKAPPA, SYNTRAX |
| POWER_GENERATION | Power Generation | power-generation | MEDIUM | DIESEL_GENERATORS, TURBINES | MACROCORE, NANOFORCE, AQUAGUARD, SYNTRAX |

**Missing industries (referenced elsewhere):**
- Food & Beverage (mentioned in CLAUDE.md)
- Forestry
- Oil & Gas

---

## 5. COMPARISON TOPICS

1 topic defined:
- `OEM_VS_AFTERMARKET` → slug: oem-vs-aftermarket

Covers: Performance equivalence, Specification compliance, Warranty implications, Cost-benefit analysis, Longevity comparison.

---

## 6. FLEET OPTIMIZATION

3 strategies defined:
- `MAINTENANCE_STRATEGIES` → Preventive Maintenance
- `PERFORMANCE_TRACKING` → Equipment Monitoring  
- `OPERATIONAL_EFFICIENCY` → Operational Efficiency

---

## 7. EDUCATIONAL PATHWAYS

3 pathways defined:
- `TECHNICIAN_ONBOARDING` (4 modules)
- `EQUIPMENT_OPERATOR` (3 modules)
- `FLEET_MANAGER` (3 modules)

---

## 8. HELPER FUNCTIONS

All return data from the TypeScript static objects:
- `getTechnologyByIndustry(industryId)` → tech[] for industry
- `getContaminationByTechnology(techId)` → contamination[] for tech
- `getStandardsByTechnology(techId)` → standards[] for tech
- `getRelatedTechnologies(techId)` → related techs with shared contamination
- `getIndustriesBySeverity()` → industries sorted by contamination_exposure
- `getAllTechnologiesByFeature(feature)` → techs with metric containing feature
- `mapKnowledgeNetwork(nodeId, type)` → connections from any node

---

## 9. GAPS SUMMARY

| Category | TS Count | DB/Real Count | Missing |
|---------|---------|--------------|---------|
| Technologies | 6 | 13+ | INTEKCORE, DRYCORE, GASULTRA, COOLTECH, SYNTEPORE, MARINECLEAN, BLUECLEAN |
| Standards | 6 | 12+ | ISO 11155, DIN 71220, ISO 12937, DIN 51524, SAE J726, etc. |
| Contamination modes | 3 | 5+ | Varnish formation, Cabin PM2.5, Compressed air moisture |
| Industries | 7 | 9+ | Food & Beverage, Forestry/Logging, Oil & Gas |

---

## 10. KG MIGRATION RULE

**The KG must NOT simply copy knowledge-architecture.ts.**

It must:
1. Fix the MICROKAPPA category error (Cabin Air, not Coolant)
2. Fix the SYNTRAX/NANOFORCE category confusion
3. Add all 7 missing technologies
4. Add all missing standards
5. Add all missing contamination modes
6. Add 2+ missing industries

**The KG becomes the new authoritative source. knowledge-architecture.ts becomes a read-only client of the KG API.**
