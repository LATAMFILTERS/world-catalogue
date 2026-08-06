# PHASE2_FINAL_RECONCILIATION.md
## Phase 2 — Final Technology Platform Reconciliation

**Date**: 2026-06-02
**Branch**: `claude/dazzling-franklin-ALGY1`
**Status**: Planning only — no code written, no files modified
**Prerequisites**: PHASE2_CONFLICT_RECONCILIATION.md, UNIFIED_DATA_IMPLEMENTATION_PLAN.md

---

## Platform Change

The authoritative technology platform is confirmed as **9 technologies**. Three technologies previously present in the codebase are deprecated and must be removed from all data structures, page content, and canonical blocks.

### Final Platform — 9 Technologies

| Key | Display Name | System Domain |
|-----|-------------|--------------|
| `MACROCORE` | MACROCORE™ | Air Intake |
| `SYNTEPORE` | SYNTEPORE™ | Air Intake (marine / humid) |
| `INTEKCORE` | INTEKCORE™ | Air Intake (housing) |
| `DRYCORE` | DRYCORE™ | Compressed Air |
| `NANOFORCE` | NANOFORCE™ | Hydraulic |
| `SYNTRAX` | SYNTRAX™ | Lubrication |
| `MICROKAPPA` | MICROKAPPA™ | Cabin Protection |

### Deprecated Technologies — Remove From All Sources

| Key | Display Name | Reason | Replacement Logic |
|-----|-------------|--------|-------------------|
| `DURATECH` | DURATECH™ | Removed from platform | Oil filtration domain transfers fully to SYNTRAX |

### Impact of DURATECH Removal on Knowledge Graph

DURATECH was the only technology in the relational graph assigned exclusively to oil/engine wear protection as a kit product. Its removal has cascading effects:

- `CONTAMINATION_MODES.PARTICLE_WEAR.resolvedBy`: remove `DURATECH` → add `SYNTRAX` if not already present
- `getAllTechnologiesByFeature('wearProtection')`: was `['DURATECH', 'SYNTRAX']` → becomes `['SYNTRAX']`
- `getAllTechnologiesByFeature('particleCapture')`: was `['MACROCORE', 'NANOFORCE', 'DURATECH', 'MICROKAPPA']` → becomes `['MACROCORE', 'NANOFORCE', 'MICROKAPPA']`
- `getAllTechnologiesByFeature('costEffective')`: was `['MACROCORE', 'DURATECH']` → becomes `['MACROCORE']`
- All `STANDARDS.applicableTo` arrays that referenced `DURATECH`: remove the reference
- `COMPARISON_TOPICS.OEM_VS_AFTERMARKET.relevantTechnologies`: remove `DURATECH`

---

## 1. Technologies — Final Authoritative Mappings

Nine technology entries. Each entry defines the final authoritative `applicableIndustries`, `addressesContamination`, `relatedStandards`, and `systemDomain` for use in `unified-data.ts`.

---

### MACROCORE™

| Field | Value |
|-------|-------|
| Key | `MACROCORE` |
| Slug | `macrocore` |
| Logo | `logo-macrocore.png` |
| System Domain | `Air Intake` |
| Category | Air Filtration |
| Tagline | Progressive Density Gradient Air Protection |

**Applicable Industries**:
```
AGRICULTURE, CONSTRUCTION, MINING, MARINE, AUTOMOTIVE, BUS_COACH,
RAILWAY, TRUCKS_FLEETS, OIL_GAS, POWER_GENERATION, WASTE_MUNICIPAL
```
*Rationale*: MACROCORE is universal for all diesel engine air intake applications. Absent from MARINE in knowledge-architecture.ts (SYNTEPORE is the primary marine intake) but retained for marine as a secondary where standard engine intake protection is needed. Excluded from MANUFACTURING (indoor climate-controlled — no outdoor dust exposure).

**Addresses Contamination**: `PARTICLE_WEAR`

**Related Standards**: `ISO_5011`, `SAE_J1539`, `ISO_16889`

---

### SYNTEPORE™

| Field | Value |
|-------|-------|
| Key | `SYNTEPORE` |
| Slug | `syntepore` |
| Logo | `logo-syntepore.png` |
| System Domain | `Air Intake` |
| Category | Synthetic Air Intake Filtration |
| Tagline | All-Synthetic Intake for Humid and Marine Environments |

**Applicable Industries**:
```
MARINE, OIL_GAS, RAILWAY, TRUCKS_FLEETS, WASTE_MUNICIPAL, POWER_GENERATION
```
*Rationale*: SYNTEPORE is the moisture-resistant synthetic intake technology. Applicable where cellulose media degrades: marine/salt-air, offshore Oil & Gas, locomotive operations (temperature and humidity cycling), long-haul trucks in tropical routes. Not applicable to standard indoor manufacturing.

**Addresses Contamination**: `PARTICLE_WEAR`

**Related Standards**: `ISO_5011`, `SAE_J1539`

---

### INTEKCORE™

| Field | Value |
|-------|-------|
| Key | `INTEKCORE` |
| Slug | `intekcore` |
| Logo | `logo-intekcore.png` |
| System Domain | `Air Intake` |
| Category | Filter Housing Architecture |
| Tagline | Zero-Bypass Radial Seal Housing |

**Applicable Industries**:
```
MINING, AGRICULTURE, CONSTRUCTION, RAILWAY, TRUCKS_FLEETS
```
*Rationale*: INTEKCORE is a housing/structural technology — it enables the zero-bypass sealing that makes other intake technologies effective. Most critical in high-vibration environments (mining, construction, railway) where housing integrity failures are the primary bypass path.

**Addresses Contamination**: `PARTICLE_WEAR`
*(Housing architecture prevents bypass — indirect contamination control)*

**Related Standards**: `ISO_5011`

---

### DRYCORE™

| Field | Value |
|-------|-------|
| Key | `DRYCORE` |
| Slug | `drycore` |
| Logo | `logo-drycore.png` |
| System Domain | `Compressed Air` |
| Category | Desiccant Air Drying |
| Tagline | Molecular Sieve Desiccant — Zero Dew Point |

**Applicable Industries**:
```
RAILWAY, BUS_COACH, MANUFACTURING, OIL_GAS, POWER_GENERATION
```
*Rationale*: DRYCORE applies wherever compressed air systems drive safety-critical or precision components: pneumatic braking (railway, bus coach), production pneumatics (manufacturing), instrument air (oil & gas), control valve air (power generation).

**Addresses Contamination**: `COMPRESSED_AIR_MOISTURE`

**Related Standards**: `ISO_8573_1`

---


| Field | Value |
|-------|-------|
| System Domain | `Fuel Cleanliness` |
| Category | Fuel Water Separation |
| Tagline | Turbine-Stage Water Extraction — 99.8% Efficiency |


**Applicable Industries**:
```
AGRICULTURE, MARINE, POWER_GENERATION, OIL_GAS, CONSTRUCTION,
MINING, TRUCKS_FLEETS
```

**Addresses Contamination**: `DIESEL_WATER`, `PARTICLE_WEAR`
*(Stage 3 precision barrier also captures fuel-borne particles)*

**Related Standards**: `ASTM_D6304`, `ISO_12937`, `ISO_16889`

---

### NANOFORCE™

| Field | Value |
|-------|-------|
| Key | `NANOFORCE` |
| Slug | `nanoforce` |
| Logo | `logo-nanoforce.png` |
| System Domain | `Hydraulic` |
| Category | Hydraulic Filtration |
| Tagline | Sub-Micron Beta-Rated Hydraulic Contamination Control |

**Applicable Industries**:
```
CONSTRUCTION, MINING, MANUFACTURING, MARINE, AGRICULTURE,
POWER_GENERATION, OIL_GAS
```
*Rationale*: NANOFORCE applies wherever high-pressure hydraulic circuits drive critical functions: excavator/loader/compactor hydraulics (construction), drilling and haulage hydraulics (mining), CNC and press hydraulics (manufacturing), vessel steering and crane circuits (marine), harvester and tractor hydraulics (agriculture), turbine and compressor control systems (power generation, oil & gas).

**Addresses Contamination**: `HYDRAULIC_CONTAMINATION`, `PARTICLE_WEAR`, `DIESEL_WATER`
*(HYDROGUARD vapor-phase water separation technology)*

**Related Standards**: `ISO_16889`, `ISO_4406`, `NFPA_T214`, `DIN_51524`

---

### SYNTRAX™

| Field | Value |
|-------|-------|
| Key | `SYNTRAX` |
| Slug | `syntrax` |
| Logo | `logo-sintrax.png` *(intentional: asset filename has typo — must remain explicit)* |
| System Domain | `Lubrication` |
| Category | Engine Oil Filtration |
| Tagline | Full-Flow Lube Protection — ISO 4406 16/14/11 |

**Note on deprecated DURATECH**: DURATECH was previously described in `knowledge-architecture.ts` as "Coarse + precision stage architecture for engine oil wear protection." With DURATECH removed, SYNTRAX is the sole oil filtration technology in the platform. All oil wear protection queries now resolve to SYNTRAX.

**Applicable Industries**:
```
AGRICULTURE, AUTOMOTIVE, BUS_COACH, CONSTRUCTION, MARINE, MINING,
POWER_GENERATION, RAILWAY, TRUCKS_FLEETS, WASTE_MUNICIPAL, OIL_GAS
```
*Rationale*: SYNTRAX applies to all diesel engine lube oil systems. Only MANUFACTURING (where diesel engines are secondary to hydraulic/coolant systems) is excluded from the primary list.

**Addresses Contamination**: `PARTICLE_WEAR`
*(Soot above 2% by weight, metal wear particles, fuel dilution byproducts)*

**Related Standards**: `ISO_4406`, `ISO_16889`, `DIN_51524`

---


| Field | Value |
|-------|-------|
| System Domain | `Cooling System` |
| Category | Coolant Filtration |
| Tagline | SCA Additive Release — Liner Cavitation Prevention |

**Applicable Industries**:
```
AUTOMOTIVE, BUS_COACH, TRUCKS_FLEETS, POWER_GENERATION, MANUFACTURING
```

**Addresses Contamination**: `COOLANT_CONTAMINATION`

**Related Standards**: `ISO_16889`
*(No dedicated coolant standard currently in the 11-standard set — note as TODO for owner review)*

---

### MICROKAPPA™

| Field | Value |
|-------|-------|
| Key | `MICROKAPPA` |
| Slug | `microkappa` |
| Logo | `logo-microkappa.png` |
| System Domain | `Cabin Protection` |
| Category | Cabin Air Filtration |
| Tagline | PM2.5 Capture + Activated Carbon Adsorption |

**Applicable Industries**:
```
AUTOMOTIVE, BUS_COACH, CONSTRUCTION, MINING, TRUCKS_FLEETS,
WASTE_MUNICIPAL, MANUFACTURING
```
*Rationale*: MICROKAPPA applies wherever operators spend prolonged duty cycles in enclosed cabs exposed to diesel particulate, silica dust, or urban PM2.5: commercial vehicle cabs (automotive, trucks), transit cabs (bus & coach), heavy equipment cabs (construction, mining), municipal service cabs (waste), and industrial operators (manufacturing near dust-generating processes).

**Addresses Contamination**: `CABIN_AIR_CONTAMINATION`

**Related Standards**: `ISO_11155`

---

## 2. Industries — Final Authoritative Technology Mappings


Changes from the previous reconciled lists are shown in the `Δ` column.

---

### AGRICULTURE

| | |
|---|---|
| Key | `AGRICULTURE` |
| Slug | `agriculture` |
| Contamination Exposure | `HIGH` |
| Primary Equipment | Combines, tractors, harvesters, irrigation systems |

**Final applicableTechnologies**:
```
```

| Technology | Source Confidence | Δ from conflict reconciliation |
|------------|:-----------------:|-------------------------------|
| MACROCORE | 4/4 confirmed | No change |
| NANOFORCE | 2/4 confirmed | No change |
| SYNTRAX | 2/4 confirmed | No change |
|  | 3/4 confirmed | No change |
| ~~DURATECH~~ | Was recommended INCLUDE | **Removed — deprecated** |
| SYNTEPORE | Owner decision pending | Excluded pending YES |

**Relevant Contamination**: `DIESEL_WATER`, `PARTICLE_WEAR`
**Applicable Standards**: `ISO_5011`, `SAE_J1539`, `ISO_16889`, `ASTM_D6304`

---

### AUTOMOTIVE

| | |
|---|---|
| Key | `AUTOMOTIVE` |
| Slug | `automotive` |
| Contamination Exposure | `MEDIUM` |
| Primary Equipment | Heavy trucks, buses, commercial vehicles |

**Final applicableTechnologies**:
```
```

| Technology | Source Confidence | Δ from conflict reconciliation |
|------------|:-----------------:|-------------------------------|
| MACROCORE | 3/4 confirmed | No change |
| SYNTRAX | 3/4 confirmed | No change |
| MICROKAPPA | 2/4 confirmed | No change |
|  | 1/4 (TECH_COMPARISON) | No change — default INCLUDE applied |
| ~~DURATECH~~ | Was recommended INCLUDE | **Removed — deprecated** |
| NANOFORCE | Owner decision pending | Excluded pending YES |
| SYNTEPORE | Owner decision pending | Excluded pending YES |

**Relevant Contamination**: `DIESEL_WATER`, `PARTICLE_WEAR`, `CABIN_AIR_CONTAMINATION`, `COOLANT_CONTAMINATION`
**Applicable Standards**: `SAE_J1539`, `ISO_4406`, `ISO_16889`, `ISO_11155`

---

### BUS_COACH

| | |
|---|---|
| Key | `BUS_COACH` |
| Slug | `bus-coach` |
| Contamination Exposure | `MEDIUM` *(authored — not in knowledge-architecture.ts)* |
| Primary Equipment | Urban transit buses, intercity coaches |

**Final applicableTechnologies**:
```
['MACROCORE', 'SYNTRAX', 'DRYCORE', 'MICROKAPPA']
```

*Source*: `catalogue.json` techTags (all four technologies are in the final platform — no conflict, no deprecations affect this entry)

| Technology | Basis |
|------------|-------|
| MACROCORE | Air intake for diesel engines in stop-and-go duty |
| SYNTRAX | Lube oil protection — 200–400 daily stop-start cycles generate high soot |
| DRYCORE | Pneumatic braking system air cleanliness — ISO 8573-1 Class 2 |
| MICROKAPPA | Cabin air protection — urban PM2.5 and diesel exhaust exposure for drivers |

**Relevant Contamination**: `PARTICLE_WEAR`, `COMPRESSED_AIR_MOISTURE`, `CABIN_AIR_CONTAMINATION`
**Applicable Standards**: `ISO_5011`, `ISO_4406`, `ISO_8573_1`, `ISO_11155`

---

### CONSTRUCTION

| | |
|---|---|
| Key | `CONSTRUCTION` |
| Slug | `construction` |
| Contamination Exposure | `HIGH` |
| Primary Equipment | Excavators, bulldozers, loaders, compactors |

**Final applicableTechnologies**:
```
```

| Technology | Source Confidence | Δ from conflict reconciliation |
|------------|:-----------------:|-------------------------------|
| MACROCORE | 4/4 confirmed | No change |
| NANOFORCE | 4/4 confirmed | No change |
| SYNTRAX | 1/4 (strong technical case) | No change |
|  | Default INCLUDE | No change |
| MICROKAPPA | Default INCLUDE | No change |
| ~~DURATECH~~ | Was recommended INCLUDE | **Removed — deprecated** |

**Relevant Contamination**: `PARTICLE_WEAR`, `HYDRAULIC_CONTAMINATION`, `DIESEL_WATER`, `CABIN_AIR_CONTAMINATION`
**Applicable Standards**: `SAE_J1539`, `ISO_16889`, `ISO_5011`, `NFPA_T214`, `ISO_11155`

---

### MANUFACTURING

| | |
|---|---|
| Key | `MANUFACTURING` |
| Slug | `manufacturing` |
| Contamination Exposure | `LOW-MEDIUM` |
| Primary Equipment | Machine tools, presses, injection moulding, hydraulic systems |

**Final applicableTechnologies**:
```
```

| Technology | Source Confidence | Δ from conflict reconciliation |
|------------|:-----------------:|-------------------------------|
| NANOFORCE | 4/4 confirmed | No change |
| SYNTRAX | 2/4 confirmed | No change |
| MICROKAPPA | 2/4 confirmed | No change |
|  | Added | Not in previous conflict analysis — industrial diesel equipment needs coolant protection |
| DRYCORE | Added | Not in previous conflict analysis — pneumatic production systems require ISO 8573-1 air purity |
| MACROCORE | Owner decision pending | Excluded pending YES |
|  | Owner decision pending | Excluded pending YES |

**Relevant Contamination**: `HYDRAULIC_CONTAMINATION`, `PARTICLE_WEAR`, `CABIN_AIR_CONTAMINATION`, `COOLANT_CONTAMINATION`, `COMPRESSED_AIR_MOISTURE`
**Applicable Standards**: `NFPA_T214`, `ISO_16889`, `DIN_51524`, `ISO_8573_1`, `ISO_11155`

---

### MARINE

| | |
|---|---|
| Key | `MARINE` |
| Slug | `marine` |
| Contamination Exposure | `MEDIUM-HIGH` |
| Primary Equipment | Fishing vessels, cargo ships, naval equipment |

**Final applicableTechnologies**:
```
```

| Technology | Source Confidence | Δ from conflict reconciliation |
|------------|:-----------------:|-------------------------------|
| NANOFORCE | 4/4 confirmed | No change |
|  | 4/4 confirmed | No change |
| SYNTRAX | 2/4 confirmed | No change |
| SYNTEPORE | 2/4 confirmed | No change |
| ~~MARINECLEAN~~ | Was recommended INCLUDE | **Removed — deprecated** |
| MACROCORE | Owner decision pending | Excluded pending YES |
| ~~DURATECH~~ | Was recommended EXCLUDE | Removed — deprecated |


**Relevant Contamination**: `DIESEL_WATER`, `HYDRAULIC_CONTAMINATION`, `PARTICLE_WEAR`
**Applicable Standards**: `ASTM_D6304`, `ISO_16889`, `ISO_5011`, `ISO_12937`, `ISO_14540`

---

### MINING

| | |
|---|---|
| Key | `MINING` |
| Slug | `mining` |
| Contamination Exposure | `EXTREME` |
| Primary Equipment | Haul trucks, drill rigs, loaders, crushers |

**Final applicableTechnologies**:
```
```

| Technology | Source Confidence | Δ from conflict reconciliation |
|------------|:-----------------:|-------------------------------|
| MACROCORE | 4/4 confirmed | No change |
| NANOFORCE | 3/4 confirmed | No change |
| SYNTRAX | 2/4 confirmed | No change |
|  | 2/4 confirmed | No change |
| ~~DURATECH~~ | Was recommended INCLUDE | **Removed — deprecated** |
| SYNTEPORE | Owner decision pending | Excluded pending YES |

**Relevant Contamination**: `PARTICLE_WEAR`, `HYDRAULIC_CONTAMINATION`, `DIESEL_WATER`
**Applicable Standards**: `ISO_16889`, `ISO_5011`, `SAE_J1539`

---

### OIL_GAS

| | |
|---|---|
| Key | `OIL_GAS` |
| Slug | `oil-gas` |
| Contamination Exposure | `HIGH` *(authored — not in knowledge-architecture.ts)* |
| Primary Equipment | Offshore platforms, compressors, turbines, pumps |

**Final applicableTechnologies**:
```
```

*Source*: `catalogue.json` techTags (all four technologies are in the final platform — no conflicts, no deprecations affect this entry)

| Technology | Basis |
|------------|-------|
| MACROCORE | Air intake for gas turbines and engine-driven compressors on offshore/onshore platforms |
|  | Fuel water separation — offshore fuel storage subject to humidity, brine, condensation cycles |
| SYNTRAX | Lube oil protection for rotating equipment (turbines, compressors, pumps) at continuous load |
| DRYCORE | Instrument air purity — offshore control valve systems require ISO 8573-1 air quality |

**Relevant Contamination**: `DIESEL_WATER`, `PARTICLE_WEAR`, `COMPRESSED_AIR_MOISTURE`
**Applicable Standards**: `ISO_5011`, `ASTM_D6304`, `ISO_16889`, `ISO_8573_1`

---

### POWER_GENERATION

| | |
|---|---|
| Key | `POWER_GENERATION` |
| Slug | `power-generation` |
| Contamination Exposure | `MEDIUM` |
| Primary Equipment | Diesel generators, turbines, compressors |

**Final applicableTechnologies**:
```
```

| Technology | Source Confidence | Δ from conflict reconciliation |
|------------|:-----------------:|-------------------------------|
|  | 4/4 confirmed | No change |
| MACROCORE | 3/4 confirmed (SRC-A gap was authoring error) | No change |
| SYNTRAX | 2/4 confirmed | No change |
| DRYCORE | 2/4 confirmed | No change |
|  | Default INCLUDE | No change |
| SYNTEPORE | Excluded | No change |
| NANOFORCE | Owner decision pending | Excluded pending YES |

**Relevant Contamination**: `DIESEL_WATER`, `PARTICLE_WEAR`, `COMPRESSED_AIR_MOISTURE`, `COOLANT_CONTAMINATION`
**Applicable Standards**: `ISO_16889`, `ASTM_D6304`, `ISO_5011`, `ISO_8573_1`

---

### RAILWAY

| | |
|---|---|
| Key | `RAILWAY` |
| Slug | `railway` |
| Contamination Exposure | `MEDIUM` *(authored — not in knowledge-architecture.ts)* |
| Primary Equipment | Diesel-electric locomotives, rolling stock, traction systems |

**Final applicableTechnologies**:
```
['SYNTEPORE', 'SYNTRAX', 'MACROCORE', 'DRYCORE']
```

*Source*: `catalogue.json` techTags (all four technologies are in the final platform — no conflicts, no deprecations affect this entry)

| Technology | Basis |
|------------|-------|
| SYNTEPORE | All-synthetic intake for locomotives subject to humidity, rain, and temperature cycling across routes |
| SYNTRAX | Lube oil protection for diesel-electric engine continuous duty cycles |
| MACROCORE | Air intake for standard locomotive applications (SYNTEPORE is primary for long-haul routes) |
| DRYCORE | Pneumatic braking system air — moisture contamination in brake circuits is a safety-critical failure mode for railway |

**Relevant Contamination**: `PARTICLE_WEAR`, `COMPRESSED_AIR_MOISTURE`
**Applicable Standards**: `ISO_5011`, `ISO_4406`, `ISO_8573_1`

---

### TRUCKS_FLEETS

| | |
|---|---|
| Key | `TRUCKS_FLEETS` |
| Slug | `trucks-fleets` |
| Contamination Exposure | `MEDIUM` *(authored — not in knowledge-architecture.ts)* |
| Primary Equipment | Heavy-duty trucks, commercial fleet vehicles |

**Final applicableTechnologies**:
```
['MACROCORE', 'SYNTRAX', 'SYNTEPORE']
```

*Source*: `catalogue.json` techTags with DURATECH removed

| Technology | Basis | Δ |
|------------|-------|---|
| MACROCORE | Air intake for turbocharged diesel long-haul engines | No change |
| SYNTRAX | Lube oil protection for extended drain intervals (60,000–100,000 km programs) | No change |
| SYNTEPORE | All-synthetic intake for humid/tropical route operations and coastal distribution | No change |
| ~~DURATECH~~ | Was in techTags | **Removed — deprecated** |

**Relevant Contamination**: `DIESEL_WATER`, `PARTICLE_WEAR`
**Applicable Standards**: `SAE_J1539`, `ISO_4406`, `ISO_16889`

---

### WASTE_MUNICIPAL

| | |
|---|---|
| Key | `WASTE_MUNICIPAL` |
| Slug | `waste-municipal` |
| Contamination Exposure | `MEDIUM` *(authored — not in knowledge-architecture.ts)* |
| Primary Equipment | Waste collection vehicles, fire apparatus, ambulances, municipal fleets |

**Final applicableTechnologies**:
```
['MACROCORE', 'SYNTRAX', 'SYNTEPORE', 'MICROKAPPA']
```

*Source*: `catalogue.json` techTags (all four technologies are in the final platform — no conflicts, no deprecations affect this entry)

| Technology | Basis |
|------------|-------|
| MACROCORE | Air intake for diesel engines in high-cycle urban stop-and-go operation |
| SYNTRAX | Lube oil protection — stop-and-go generates soot 3–5x faster than highway operation |
| SYNTEPORE | Synthetic intake for routes with coastal exposure or high-humidity urban corridors |
| MICROKAPPA | Cabin air protection for drivers completing full-day urban service routes |

**Relevant Contamination**: `PARTICLE_WEAR`, `CABIN_AIR_CONTAMINATION`
**Applicable Standards**: `ISO_5011`, `ISO_4406`, `ISO_11155`

---

## 3. Systems — Final Authoritative Technology Mappings

Twelve system entries. Three systems reference deprecated technologies and require resolution before `unified-data.ts` is written.

---

### Systems With Clean Mappings (9 of 12)

These systems require no decision — their primary technologies are all in the final platform.

| System | Slug | Primary Tech | Supporting Techs | System Domain |
|--------|------|:------------:|-----------------|:-------------:|
| Airfilter | `airfilter` | MACROCORE | — | Air Intake |
| Cabin | `cabin` | MICROKAPPA | — | Cabin Protection |
| Coolant | `coolant` |  | — | Cooling System |
| Dryer | `dryer` | DRYCORE | — | Compressed Air |
| Fuel | `fuel` | SYNTEPORE |  | Fuel Cleanliness |
| Housing | `housing` | INTEKCORE | MACROCORE | Air Intake |
| Hydraulic | `hydraulic` | NANOFORCE | — | Hydraulic |
| Oil | `oil` | SYNTRAX | — | Lubrication |
| Water | `water` |  | — | Fuel Cleanliness |

**Supporting technology notes**:
- **Housing** system: INTEKCORE is the housing architecture; MACROCORE is the filter element that mounts within it. Frequently sold together.

---

### Systems Requiring Resolution (3 of 12)

---


| | |
|---|---|



**Final mapping**:
```
Supporting tech:       —
System domain:         Fuel Cleanliness
```

---

#### Kits System

| | |
|---|---|
| Slug | `kits` |
| Current primary tech | `DURATECH` (deprecated) |
| New primary tech | **Owner decision required** |

**The problem**: The Kits system in `catalogue.json` is described entirely through DURATECH: "The ELIMFILTERS® Filter Kit System provides model-specific synchronized bundles... DURATECH™ kit assembly is ISO certified and eliminates inventory confusion..." The system's identity, description, and purpose are inseparable from DURATECH as authored.

With DURATECH deprecated, two paths are available:

**Option A — Reassign to SYNTRAX as oil-kit anchor**:
```
Primary technology: SYNTRAX
Rationale: Oil filter is the highest-frequency replacement in a maintenance kit.
           SYNTRAX-anchored kits for Mack, Freightliner, International, Isuzu, Mitsubishi.
Supporting techs: MACROCORE (air), NANOFORCE (hydraulic/fuel)
```

**Option B — Deprecate the Kits system**:
```
Remove the Kits product category from the platform entirely.
Impact: /systems/kits route would be removed.
        All references to DURATECH in Kits context must be removed from content.
```

**Recommendation**: Option A. The OEM interchangeability references (Mack, Freightliner, International, Isuzu, Mitsubishi) in the Kits description are product catalogue data that have value independent of DURATECH branding. A SYNTRAX-anchored kit offering is technically coherent.

**Owner decision required**: Which option? If Option A, is SYNTRAX the correct primary technology for the kit product line?

---

#### Marine System

| | |
|---|---|
| Slug | `marine` |
| Current primary tech | `MARINECLEAN` (deprecated) |
| New primary tech | **Owner decision required** |

**The problem**: The Marine system is described entirely through MARINECLEAN: "The ELIMFILTERS® MARINECLEAN™ Filter System is naval-grade alloy construction engineered for salt-resistant performance in permanent brine and H2S-contaminated atmospheres... IMO-certified..." The system's core technical differentiators (naval-grade alloy, brine rejection coating, H2S resistance, IMO certification) are all MARINECLEAN attributes with no equivalent in the remaining 9 technologies.

With MARINECLEAN deprecated, two paths are available:

```
Supporting tech: SYNTEPORE, NANOFORCE
           SYNTEPORE provides salt-resistant air intake.
           Together they cover the key marine contamination domains.
Impact: The IMO certification, naval-grade alloy construction, and H2S resistance claims
        in the current Marine system description cannot be carried forward —
        no remaining technology has these attributes.
```

**Option B — Deprecate the Marine system**:
```
Remove the Marine product system from the platform.
Impact: /systems/marine route would be removed.
```

**Recommendation**: Owner decision required before proceeding. This is the most significant consequence of MARINECLEAN's deprecation. The Marine system was the only system built entirely around a deprecated technology with no direct functional equivalent in the 9-technology platform.

**Key question for owner**: Is the marine product system (with its IMO certification and salt-resistant housing claims) being replaced by existing technologies, or is the marine product category being discontinued?

---

## 4. Deprecated Technology Reference Inventory

Every file that must be updated when `unified-data.ts` is implemented. These are catalogued here for the implementation phase — not actioned in this document.

### 4.1 Data Files

| File | References to Remove | Action |
|------|---------------------|--------|
| `catalogue.json` | Products: `Kits` (DURATECH reference in description), `Marine` (MARINECLEAN reference) | Pending owner decision |
| `catalogue.json` | Industries `techTags`: DURATECH in TRUCKS_FLEETS | Remove DURATECH from TRUCKS_FLEETS techTags |
| `knowledge-architecture.ts` | `TECHNOLOGIES.DURATECH` record | Remove entire record — replaced by SYNTRAX |
| `knowledge-architecture.ts` | `STANDARDS.applicableTo` arrays (4 standards reference DURATECH) | Remove DURATECH from each |
| `knowledge-architecture.ts` | `CONTAMINATION_MODES.PARTICLE_WEAR.resolvedBy` | Remove DURATECH, confirm SYNTRAX is present |
| `knowledge-architecture.ts` | `INDUSTRIES.*.applicableTechnologies` (7 industries) | Remove DURATECH from each |
| `knowledge-architecture.ts` | `COMPARISON_TOPICS.OEM_VS_AFTERMARKET.relevantTechnologies` | Remove DURATECH |
| `knowledge-architecture.ts` | `getAllTechnologiesByFeature()` feature maps | Remove DURATECH from particleCapture, wearProtection, costEffective |

### 4.2 Technology Hub Page

| File | Reference | Action |
|------|-----------|--------|
| `technologies/page.tsx` | `GEO_DEFINITIONS['duratech']` | Remove entry |
| `technologies/page.tsx` | `GEO_DEFINITIONS['marineclean']` | Remove entry |
| `technologies/page.tsx` | JSON-LD `numberOfItems` | Update from `9` to `9` — no change needed (already correct) |

### 4.3 Technology Detail Pages

| File | Reference | Action |
|------|-----------|--------|
| `techPagesData.ts` | `'duratech'` entry | Remove — deprecated entity |
| `techPagesData.ts` | `'marineclean'` entry | Remove — deprecated entity |

### 4.4 Systems Page

| File | Reference | Action |
|------|-----------|--------|

### 4.5 Knowledge System Pages (22 files)

These pages reference DURATECH in canonical knowledge blocks and technology listings. They require content replacement — DURATECH references must be replaced with SYNTRAX where the context is oil/engine protection.

| Page | DURATECH context | Replacement |
|------|-----------------|-------------|
| `knowledge-system/bridges/page.tsx` | `Related_Technologies: MACROCORE, NANOFORCE, DURATECH` | Replace DURATECH with SYNTRAX |
| `knowledge-system/bridges/aftermarket-selection/page.tsx` | DURATECH in technology list | Replace with SYNTRAX |
| `knowledge-system/bridges/fleet-solutions/page.tsx` | DURATECH in technology list | Replace with SYNTRAX |
| `knowledge-system/bridges/industrial-filtration/page.tsx` | DURATECH description + technology list (2 occurrences) | Replace with SYNTRAX + update description |
| `knowledge-system/bridges/oem-replacement/page.tsx` | DURATECH in technology list | Replace with SYNTRAX |
| `knowledge-system/compare/oem-comparison/page.tsx` | `Related_Technologies: MACROCORE, NANOFORCE, DURATECH` | Replace DURATECH with SYNTRAX |
| `knowledge-system/compare/system-vs-commodity/page.tsx` | `Related_Technologies: MACROCORE, NANOFORCE, DURATECH` | Replace DURATECH with SYNTRAX |
| `knowledge-system/compare/total-cost-ownership/page.tsx` | `Related_Technologies: MACROCORE, NANOFORCE, DURATECH, SYNTRAX` | Remove DURATECH |
| `knowledge-system/contamination/particle-wear/page.tsx` | DURATECH in contamination description + Related_Technologies | Replace with SYNTRAX; update technical description |
| `knowledge-system/contamination/hydraulic-system/page.tsx` | `DURATECH™ return line filters` in technical description | Replace with SYNTRAX or remove sentence if not applicable |
| `knowledge-system/fleet/reducing-downtime/page.tsx` | DURATECH role description + Related_Technologies | Replace with SYNTRAX; update role |
| `knowledge-system/fleet/fuel-efficiency/page.tsx` | DURATECH role description | Replace with SYNTRAX; update role |
| `knowledge-system/fleet/total-cost-ownership/page.tsx` | DURATECH role description + Related_Technologies | Replace with SYNTRAX; update role |
| `knowledge-system/science/page.tsx` | `DURATECH (extended lifecycle)` in canonical block | Replace with SYNTRAX |
| `knowledge-system/standards/lube-oil-systems/page.tsx` | DURATECH role + Related_Technologies | Replace with SYNTRAX |
| `knowledge-system/standards/cabin-safety-systems/page.tsx` | DURATECH in technology listing | Remove — DURATECH is not a cabin safety technology |

---

## 5. Summary — What Changes in unified-data.ts vs Prior Plans

This section reconciles the final platform against the earlier planning documents, documenting every change.

### 5.1 UNIFIED_TECHNOLOGIES: 12 → 9 entries

| Technology | Status | Change from UNIFIED_DATA_IMPLEMENTATION_PLAN.md |
|------------|--------|-----------------------------------------------|
| MACROCORE | ✅ Included | No change |
| SYNTEPORE | ✅ Included | No change |
| INTEKCORE | ✅ Included | No change |
| DRYCORE | ✅ Included | No change |
| NANOFORCE | ✅ Included | No change |
| SYNTRAX | ✅ Included | Now sole oil filtration technology; absorbs DURATECH's oil wear role |
|  | ✅ Included | No change |
| MICROKAPPA | ✅ Included | No change |
| ~~DURATECH~~ | ❌ Removed | Deprecated — oil filtration role absorbed by SYNTRAX |

### 5.2 UNIFIED_INDUSTRIES: 12 entries (unchanged count)

All 12 industries remain. Changes are technology list updates only:

| Industry | Technologies removed | Net change |
|----------|---------------------|-----------|
| AGRICULTURE | DURATECH | −1 |
| AUTOMOTIVE | DURATECH | −1 |
| BUS_COACH | None | 0 |
| CONSTRUCTION | DURATECH | −1 |
| MARINE | MARINECLEAN, DURATECH | −2 |
| MINING | DURATECH | −1 |
| OIL_GAS | None | 0 |
| POWER_GENERATION | None | 0 |
| RAILWAY | None | 0 |
| TRUCKS_FLEETS | DURATECH | −1 |
| WASTE_MUNICIPAL | None | 0 |

### 5.3 UNIFIED_SYSTEMS: 12 entries (pending 2 owner decisions)

| System | Status | Change |
|--------|--------|--------|
| Airfilter | ✅ Clean | No change |
| Cabin | ✅ Clean | No change |
| Coolant | ✅ Clean | No change |
| Dryer | ✅ Clean | No change |
| Fuel | ✅ Clean | No change |
| Housing | ✅ Clean | No change |
| Hydraulic | ✅ Clean | No change |
| Kits | ⚠️ Owner decision | Option A (SYNTRAX) or Option B (deprecate) |
| Oil | ✅ Clean | No change |
| Water | ✅ Clean | No change |

### 5.4 TechnologyKey union type: 12 → 9 members

```typescript
// BEFORE (12):
type TechnologyKey = 'MACROCORE' | 'NANOFORCE' | 'MICROKAPPA' | 'SYNTRAX'

// AFTER (9):
type TechnologyKey = 'MACROCORE' | 'NANOFORCE' | 'MICROKAPPA' | 'SYNTRAX'
```

---

## 6. Open Owner Decisions Before Implementation

Two system decisions and several technology inclusion decisions remain open. Implementation of `unified-data.ts` can proceed on all entities except the Kits and Marine systems, which must await owner direction.

| # | Decision | Options | Default if no input |
|---|----------|---------|:-------------------:|
| 1 | Kits system primary technology | Option A: SYNTRAX-anchored kit / Option B: Deprecate Kits system | Option A (SYNTRAX) |
| 3 | AGRICULTURE: include SYNTEPORE? | YES (tropical ag) / NO (temperate ag only) | NO |
| 4 | CONSTRUCTION: include NANOFORCE? | Already included in final list — no decision needed | Included |
| 5 | MINING: include SYNTEPORE? | YES (underground humid mining) / NO (open-pit only) | NO |
| 6 | MARINE: include MACROCORE? | YES / NO (SYNTEPORE covers marine air intake) | NO |
| 7 | AUTOMOTIVE: include NANOFORCE? | YES (tipper hydraulics, tail-lifts) / NO | NO |
| 8 | MANUFACTURING: include MACROCORE? | YES (some outdoor-adjacent plants) / NO (indoor only) | NO |
| 10 | POWER_GENERATION: include NANOFORCE? | YES (turbine/compressor hydraulics) / NO | NO |


---

*Document generated: 2026-06-02*
*Repository: latamfilters/world-catalogue*
*Branch: claude/dazzling-franklin-ALGY1*
*Supersedes: PHASE2_CONFLICT_RECONCILIATION.md (which assumed 12-technology platform)*
*Next step: Owner reviews decisions → Implementation of Step 0 complete → unified-data.ts Step 1 begins*
