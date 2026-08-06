# PHASE 3A: OBSIDIAN FOUNDATION PLAN
# ELIMFILTERS® — Minimum Viable Knowledge Vault

**Date:** 2026-06-03
**Scope:** Folder structure · YAML schemas · Entity definitions · Wikilink standards
**Excludes:** Sync scripts · CI hooks · Automatic page generation · Vector pipelines

---

## 1. Vault Root

Vault name: `elimfilters-vault`
One vault. No nested vaults. All paths below are relative to vault root.

---

## 2. Folder Structure

```
elimfilters-vault/
│
├── 00-meta/
│   ├── _INDEX.md
│   └── _SCHEMA-REFERENCE.md
│
├── 01-technologies/
│   ├── active/
│   │   ├── MACROCORE.md
│   │   ├── SYNTEPORE.md
│   │   ├── INTEKCORE.md
│   │   ├── DRYCORE.md
│   │   ├── HYDROCORE.md
│   │   ├── SYNTRAX.md
│   │   ├── NANOFORCE.md
│   │   ├── THERMOCORE.md
│   │   └── MICROKAPPA.md
│   ├── deprecated/
│   └── ecosystems/
│       ├── MARINECLEAN.md
│       └── DURATECH.md
│
├── 02-industries/
│   ├── AGRICULTURE.md
│   ├── AUTOMOTIVE.md
│   ├── BUS_COACH.md
│   ├── CONSTRUCTION.md
│   ├── MANUFACTURING.md
│   ├── MARINE.md
│   ├── MINING.md
│   ├── OIL_GAS.md
│   ├── POWER_GENERATION.md
│   ├── RAILWAY.md
│   ├── TRUCKS_FLEETS.md
│   └── WASTE_MUNICIPAL.md
│
├── 03-systems/
│   ├── AIRFILTER.md
│   ├── CABIN.md
│   ├── COOLANT.md
│   ├── DRYER.md
│   ├── FUEL.md
│   ├── HOUSING.md
│   ├── HYDRAULIC.md
│   ├── KITS.md
│   ├── MARINE_SYSTEM.md
│   ├── OIL.md
│   └── WATER.md
│
├── 04-standards/
│   ├── ISO_16889.md
│   ├── ISO_4406.md
│   ├── ISO_5011.md
│   ├── SAE_J1539.md
│   ├── ASTM_D6304.md
│   ├── ISO_12937.md
│   ├── ISO_8573_1.md
│   ├── NFPA_T214.md
│   ├── DIN_51524.md
│   ├── ISO_11155.md
│   ├── ISO_14540.md
│   ├── ANSI_B132_1.md
│   ├── SAE_J1211.md
│   ├── ASTM_D7085.md
│   ├── ASTM_D975.md
│   ├── ISO_11155_1.md
│   ├── ISO_11155_2.md
│   ├── DIN_71220.md
│   ├── ISO_16890.md
│   ├── ISO_8573_2.md
│   ├── ISO_8573_3.md
│   ├── ISO_8573_4.md
│   └── ASTM_D6595.md
│
└── 05-contamination/
    ├── PARTICLE_WEAR.md
    ├── DIESEL_WATER.md
    ├── HYDRAULIC_CONTAMINATION.md
    ├── COMPRESSED_AIR_MOISTURE.md
    ├── COOLANT_CONTAMINATION.md
    └── CABIN_AIR_CONTAMINATION.md
```

**Note count at foundation completion:** 65 notes
- Technologies: 13 (9 active + 2 deprecated + 2 ecosystem)
- Industries: 12
- Systems: 12
- Standards: 23 (11 current + 12 additions)
- Contamination: 6
- Meta: 2

**File naming rules:**
- Always uppercase key, exactly matching the TypeScript key
- Multi-word keys use underscore: `BUS_COACH.md`, `ISO_8573_1.md`
- No spaces, no hyphens, no lowercase in filenames
- `.md` extension only

---

## 3. YAML Schemas

Every note opens with a YAML frontmatter block. Nothing above the first `---` line is valid. The block closes with `---` and is followed by editorial body text.

The sync layer (future Phase 3B) reads only YAML. Body text below the frontmatter is editorial and is never parsed programmatically.

---

### 3.1 Technology Schema — Active

**Template** (save as `00-meta/templates/tpl-technology-active.md`):

```yaml
---
type: technology
status: active
key: ""                         # TechnologyKey — e.g. MACROCORE
name: ""                        # Display name with ™ — e.g. MACROCORE™
slug: ""                        # URL slug — e.g. macrocore
domain: ""                      # SystemDomain — Air Intake | Fuel Cleanliness | Lubrication | Hydraulic | Compressed Air | Cooling System | Cabin Protection
logo_file: ""                   # filename only — e.g. logo-macrocore.png
category: ""                    # Category label
tagline: ""                     # One-line tagline

geo_definition: ""              # 2–4 sentence canonical definition

comparison_function: ""         # Short function label
comparison_metric: ""           # Key metric string
comparison_industries: []       # Display strings — e.g. [Mining, Agriculture]

applicable_industries: []       # IndustryKey list
related_standards: []           # StandardKey list
addresses_contamination: []     # ContaminationKey list

key_metrics:                    # Record<string, string>
  metric_name: ""

tags: [technology, active]
---
```

**Required fields:** all. `key_metrics` must have at least one entry.

---

### 3.2 Technology Schema — Deprecated

**Template** (`tpl-technology-deprecated.md`):

```yaml
---
type: technology
status: deprecated
key: ""
name: ""
slug: ""
domain: ""
logo_file: ""

geo_definition: ""

deprecated_date: ""             # ISO date — e.g. 2026-06-02
replaced_by: ""                 # Active TechnologyKey
replaced_by_name: ""            # Display name with ™
sunset_note: ""                 # Migration note

comparison_function: ""
comparison_metric: ""
comparison_industries: []

tags: [technology, deprecated]
---
```

---

### 3.3 Technology Schema — Ecosystem

**Template** (`tpl-technology-ecosystem.md`):

```yaml
---
type: technology
status: ecosystem
key: ""
name: ""
slug: ""
logo_file: ""
program_type: ""                # e.g. Marine Filtration Ecosystem

geo_definition: ""

tags: [technology, ecosystem]
---
```

---

### 3.4 Industry Schema

**Template** (`tpl-industry.md`):

```yaml
---
type: industry
key: ""                         # IndustryKey
name: ""
slug: ""
contamination_exposure: ""      # EXTREME | HIGH | MEDIUM-HIGH | MEDIUM | LOW-MEDIUM | LOW

primary_equipment: []           # Display strings

relevant_contamination: []      # ContaminationKey list
applicable_technologies: []     # TechnologyKey list
applicable_standards: []        # StandardKey list

operating_conditions:
  environment: ""
  temperature: ""
  storage_method: ""
  main_issue: ""

tags: [industry]
---
```

---

### 3.5 System Schema

**Template** (`tpl-system.md`):

```yaml
---
type: system
key: ""                         # SystemKey
name: ""
slug: ""
domain: ""                      # SystemDomain

primary_technology: ""          # TechnologyKey
supporting_technologies: []     # TechnologyKey list (may be empty)


tags: [system]
---
```

---

### 3.6 Standard Schema

**Template** (`tpl-standard.md`):

```yaml
---
type: standard
key: ""                         # StandardKey
code: ""                        # Display code — e.g. ISO 16889
name: ""
slug: ""
criticality: ""                 # PRIMARY | SECONDARY

description: ""

applicable_to: []               # TechnologyKey list — which ELIMFILTERS techs use this standard
body: ""                        # Issuing body — ISO | SAE | ASTM | NFPA | DIN | ANSI
specification_type: ""          # test_method | cleanliness_code | product_spec | measurement_method

in_unified_data: false          # true once added to unified-data.ts StandardKey union

tags: [standard]
---
```

**The `in_unified_data` flag** tracks which standards exist in `unified-data.ts`. Set `false` for the 12 additions until Phase 3B migration. Set `true` for the 11 existing keys.

---

### 3.7 Contamination Mode Schema

**Template** (`tpl-contamination.md`):

```yaml
---
type: contamination
key: ""                         # ContaminationKey
name: ""
slug: ""

description: ""

root_causes: []                 # String list — internal keys (e.g. AIR_INTAKE_INGESTION)
failure_modes: []               # String list — internal keys (e.g. INJECTOR_STICTION)

impacts:                        # Record<string, string>
  impact_name: ""

resolved_by: []                 # TechnologyKey list
related_standards: []           # StandardKey list

tags: [contamination]
---
```

---

## 4. Entity Definitions

All 65 entities with their complete YAML values. Each section shows the full YAML for the first entity, then a reference table for remaining entries. Body text below frontmatter is editorial and not specified here.

---

### 4.1 Active Technologies (9)

**MACROCORE.md — full definition:**

```yaml
---
type: technology
status: active
key: MACROCORE
name: "MACROCORE™"
slug: macrocore
domain: Air Intake
logo_file: logo-macrocore.png
category: Air Filtration
tagline: "Progressive Density Gradient Air Protection"

geo_definition: "MACROCORE™ is a Progressive Density Gradient (PDG) multi-layer air filtration system rated to ISO 5011 standards. Outer protection layers capture macro-contaminants while progressively denser inner zones neutralise sub-micron threats, achieving 99.9%–99.98% interception efficiency with a 62 PSI anti-collapse rating. Engineered for heavy-duty combustion engines: on-road vehicles, mining equipment, agricultural machinery, stationary power generation, and industrial compressors."

comparison_function: "Progressive density gradient intake protection"
comparison_metric: "99.9%–99.98% efficiency · ISO 5011"
comparison_industries: [Mining, Agriculture, Construction, Power Gen]

applicable_industries:
  - AGRICULTURE
  - CONSTRUCTION
  - MINING
  - MARINE
  - AUTOMOTIVE
  - BUS_COACH
  - RAILWAY
  - TRUCKS_FLEETS
  - OIL_GAS
  - POWER_GENERATION
  - WASTE_MUNICIPAL

related_standards:
  - ISO_5011
  - SAE_J1539
  - ISO_16889

addresses_contamination:
  - PARTICLE_WEAR

key_metrics:
  efficiency: "99.9%–99.98%"
  anti_collapse_rating: "62 PSI"
  thermal_rating: "120°C"
  particle_capture_size: "5–25 microns"

tags: [technology, active, air-intake]
---
```

**Remaining active technologies — reference table:**

| File | key | name | slug | domain | logo_file | tagline |
|------|-----|------|------|--------|-----------|---------|
| SYNTEPORE.md | SYNTEPORE | SYNTEPORE™ | syntepore | Air Intake | logo-syntepore.png | All-Synthetic Intake for Humid and Marine Environments |
| INTEKCORE.md | INTEKCORE | INTEKCORE™ | intekcore | Air Intake | logo-intekcore.png | Zero-Bypass Radial Seal Housing |
| DRYCORE.md | DRYCORE | DRYCORE™ | drycore | Compressed Air | logo-drycore.png | Molecular Sieve Desiccant — Zero Dew Point |
| HYDROCORE.md | HYDROCORE | HYDROCORE™ | hydrocore | Fuel Cleanliness | logo-hydrocore.png | Turbine-Stage Fuel System Water Extraction |
| SYNTRAX.md | SYNTRAX | SYNTRAX™ | syntrax | Lubrication | logo-sintrax.png | Full-Flow Lube Protection — ISO 4406 16/14/11 |
| NANOFORCE.md | NANOFORCE | NANOFORCE™ | nanoforce | Hydraulic | logo-nanoforce.png | Sub-Micron Beta-Rated Hydraulic Contamination Control |
| THERMOCORE.md | THERMOCORE | THERMOCORE™ | thermocore | Cooling System | logo-thermocore.png | SCA-Release Cooling System Protection |
| MICROKAPPA.md | MICROKAPPA | MICROKAPPA™ | microkappa | Cabin Protection | logo-microkappa.png | PM2.5 Capture + Activated Carbon Adsorption |

**Active technology data matrix:**

| key | applicable_industries | related_standards | addresses_contamination | comparison_metric |
|-----|-----------------------|-------------------|------------------------|-------------------|
| SYNTEPORE | MARINE, OIL_GAS, RAILWAY, TRUCKS_FLEETS, WASTE_MUNICIPAL, POWER_GENERATION | ISO_5011, SAE_J1539 | PARTICLE_WEAR | ISO 5011 · moisture-resistant construction |
| INTEKCORE | MINING, AGRICULTURE, CONSTRUCTION, RAILWAY, TRUCKS_FLEETS | ISO_5011 | PARTICLE_WEAR | Radial seal zero-bypass · railway traction |
| DRYCORE | RAILWAY, BUS_COACH, MANUFACTURING, OIL_GAS, POWER_GENERATION | ISO_8573_1 | COMPRESSED_AIR_MOISTURE | ISO 8573-1 Class 1–2 dew point |
| HYDROCORE | AGRICULTURE, MARINE, POWER_GENERATION, OIL_GAS, CONSTRUCTION, MINING, TRUCKS_FLEETS | ASTM_D6304, ISO_12937, ISO_16889 | DIESEL_WATER, PARTICLE_WEAR | TODO: verify efficiency rating |
| SYNTRAX | AGRICULTURE, AUTOMOTIVE, BUS_COACH, CONSTRUCTION, MARINE, MINING, POWER_GENERATION, RAILWAY, TRUCKS_FLEETS, WASTE_MUNICIPAL, OIL_GAS | ISO_4406, ISO_16889, DIN_51524 | PARTICLE_WEAR | Extended drain interval · soot capture above 2% |
| NANOFORCE | CONSTRUCTION, MINING, MANUFACTURING, MARINE, AGRICULTURE, POWER_GENERATION, OIL_GAS | ISO_16889, ISO_4406, NFPA_T214, DIN_51524 | HYDRAULIC_CONTAMINATION, PARTICLE_WEAR, DIESEL_WATER | ISO 4406 16/14/11 · 200–450 bar |
| THERMOCORE | AUTOMOTIVE, BUS_COACH, TRUCKS_FLEETS, POWER_GENERATION, MANUFACTURING | ISO_16889 | COOLANT_CONTAMINATION | TODO: verify SCA release data |
| MICROKAPPA | AUTOMOTIVE, BUS_COACH, CONSTRUCTION, MINING, TRUCKS_FLEETS, WASTE_MUNICIPAL, MANUFACTURING | ISO_11155 | CABIN_AIR_CONTAMINATION | Up to 85% PM2.5 reduction · EU Dir. 2019/130 |

**Key metrics per technology:**

| key | key_metrics |
|-----|-------------|
| SYNTEPORE | mediaType: All-synthetic · humidityResistance: Full-range · standardCompliance: ISO 5011 |
| INTEKCORE | sealType: Radial zero-bypass · construction: Corrosion-resistant alloy · vibrationRated: Heavy-duty industrial |
| DRYCORE | dewPointClass: ISO 8573-1 Class 1–2 · mediaType: Molecular sieve desiccant · operatingPressure: Variable |
| HYDROCORE | freeWaterRemoval: TODO: verify · emulsifiedWaterRemoval: TODO: verify |
| SYNTRAX | cleanlinessTarget: ISO 4406 16/14/11 · sootCapture: Above 2% by weight · drainIntervalSupport: 60,000–100,000 km programs · bearingLifeExtension: 3–5× |
| NANOFORCE | cleanlinessTarget: ISO 4406 16/14/11 · pressureRating: 200–450 bar · particleCapture: Sub-micron 1–10 µm · valveClearanceProtection: 5–25 µm |
| THERMOCORE | scaReleaseType: Controlled gradual release · cavitationPrevention: Liner vapor-phase suppression |
| MICROKAPPA | pm25Reduction: Up to 85% · regulatoryCompliance: EU Dir. 2019/130 · mediaType: Electrostatic + activated carbon |

**Note on HYDROCORE and THERMOCORE:** Both carry `# TODO` flags in `unified-data.ts` for performance metrics. Their Obsidian notes must carry the same `TODO` annotations in body text until verified data is available. Do not invent metrics.

---

### 4.2 Deprecated Technologies (2)


```yaml
---
type: technology
status: deprecated
domain: Fuel Cleanliness


deprecated_date: 2026-06-02
replaced_by: HYDROCORE
replaced_by_name: "HYDROCORE™"

comparison_function: "Turbine-stage water separation"
comparison_metric: "99.8% free water · 95% emulsified removal"
comparison_industries: [Marine, Oil & Gas, Power Gen, Agriculture]

tags: [technology, deprecated, fuel-cleanliness]
---
```


```yaml
---
type: technology
status: deprecated
domain: Cooling System


deprecated_date: 2026-06-02
replaced_by: THERMOCORE
replaced_by_name: "THERMOCORE™"

comparison_function: "DCA-replenishing coolant protection"
comparison_metric: "SCA restoration · liner cavitation prevention"
comparison_industries: [Trucks & Fleets, Bus & Coach, Power Gen]

tags: [technology, deprecated, cooling-system]
---
```

---

### 4.3 Ecosystems (2)

**MARINECLEAN.md — full definition:**

```yaml
---
type: technology
status: ecosystem
key: MARINECLEAN
name: "MARINECLEAN™"
slug: marineclean
logo_file: logo-marineclean.png
program_type: "Marine Filtration Ecosystem"

geo_definition: "MARINECLEAN™ is the ELIMFILTERS marine filtration ecosystem: salt-resistant filtration architecture applying epoxy brine-rejection coating to housings and elements in permanent marine environments. IMO-certified for commercial marine application. Marine filtration coverage in the active technology platform is provided by HYDROCORE (fuel water separation), SYNTEPORE (salt-resistant air intake), and NANOFORCE (hydraulic circuit protection)."

tags: [technology, ecosystem, marine]
---
```

**DURATECH.md — full definition:**

```yaml
---
type: technology
status: ecosystem
key: DURATECH
name: "DURATECH™"
slug: duratech
logo_file: logo-duratech.png
program_type: "Fleet Maintenance Kit Ecosystem"

geo_definition: "DURATECH™ is the ELIMFILTERS fleet maintenance ecosystem: a model-specific kit programme that consolidates OEM-interchangeable filtration components into coordinated service bundles for mixed-fleet operations. DURATECH™ reduces parts-inventory complexity, eliminates cross-contamination errors between similar-looking elements, and simplifies technician training for multi-make service operations. Kit technology anchor: SYNTRAX™ (lubrication) with MACROCORE™ (air intake) and NANOFORCE™ (hydraulic/fuel) as supporting technologies."

tags: [technology, ecosystem, fleet]
---
```

---

### 4.4 Industries (12)

**AGRICULTURE.md — full definition:**

```yaml
---
type: industry
key: AGRICULTURE
name: Agriculture
slug: agriculture
contamination_exposure: HIGH

primary_equipment:
  - Combines
  - Tractors
  - Harvesters
  - Irrigation systems

relevant_contamination:
  - PARTICLE_WEAR
  - DIESEL_WATER

applicable_technologies:
  - MACROCORE
  - NANOFORCE
  - SYNTRAX
  - HYDROCORE
  - INTEKCORE

applicable_standards:
  - ISO_5011
  - SAE_J1539
  - ISO_16889
  - ASTM_D6304

operating_conditions:
  environment: "Outdoor, dust-heavy, seasonal"
  temperature: "−10°C to +40°C"
  storage_method: "Outdoor, no climate control"
  main_issue: "Dust ingestion, water in bulk fuel tanks during seasonal storage"

tags: [industry, high-exposure]
---
```

**Remaining industries — reference table:**

| File | key | name | slug | exposure | primary_equipment (abbrev.) | relevant_contamination | applicable_technologies |
|------|-----|------|------|----------|----------------------------|------------------------|------------------------|
| AUTOMOTIVE.md | AUTOMOTIVE | Automotive | automotive | MEDIUM | Heavy trucks, Buses, Commercial vehicles | PARTICLE_WEAR, DIESEL_WATER, CABIN_AIR_CONTAMINATION, COOLANT_CONTAMINATION | MACROCORE, SYNTRAX, MICROKAPPA, THERMOCORE |
| BUS_COACH.md | BUS_COACH | Bus & Coach | bus-coach | MEDIUM | Urban transit buses, Intercity coaches | PARTICLE_WEAR, COMPRESSED_AIR_MOISTURE, CABIN_AIR_CONTAMINATION | MACROCORE, SYNTRAX, DRYCORE, MICROKAPPA |
| CONSTRUCTION.md | CONSTRUCTION | Construction | construction | HIGH | Excavators, Bulldozers, Loaders, Compactors | PARTICLE_WEAR, HYDRAULIC_CONTAMINATION, DIESEL_WATER, CABIN_AIR_CONTAMINATION | MACROCORE, NANOFORCE, SYNTRAX, HYDROCORE, MICROKAPPA, INTEKCORE |
| MANUFACTURING.md | MANUFACTURING | Manufacturing | manufacturing | LOW-MEDIUM | Machine tools, Presses, Injection moulding | HYDRAULIC_CONTAMINATION, PARTICLE_WEAR, CABIN_AIR_CONTAMINATION, COOLANT_CONTAMINATION, COMPRESSED_AIR_MOISTURE | NANOFORCE, SYNTRAX, MICROKAPPA, THERMOCORE, DRYCORE |
| MARINE.md | MARINE | Marine | marine | MEDIUM-HIGH | Commercial vessels, Fishing vessels, Offshore platforms | DIESEL_WATER, HYDRAULIC_CONTAMINATION, PARTICLE_WEAR | NANOFORCE, HYDROCORE, SYNTRAX, SYNTEPORE |
| MINING.md | MINING | Mining | mining | EXTREME | Haul trucks, Drill rigs, Loaders, Crushers | PARTICLE_WEAR, HYDRAULIC_CONTAMINATION, DIESEL_WATER | MACROCORE, NANOFORCE, SYNTRAX, HYDROCORE, INTEKCORE |
| OIL_GAS.md | OIL_GAS | Oil & Gas | oil-gas | HIGH | Offshore platforms, Compressors, Gas turbines, Pumps | DIESEL_WATER, PARTICLE_WEAR, COMPRESSED_AIR_MOISTURE | MACROCORE, HYDROCORE, SYNTRAX, DRYCORE |
| POWER_GENERATION.md | POWER_GENERATION | Power Generation | power-generation | MEDIUM | Diesel generators, Gas turbines, Compressors | DIESEL_WATER, PARTICLE_WEAR, COMPRESSED_AIR_MOISTURE, COOLANT_CONTAMINATION | MACROCORE, HYDROCORE, SYNTRAX, DRYCORE, THERMOCORE |
| RAILWAY.md | RAILWAY | Railway | railway | MEDIUM | Diesel-electric locomotives, Rolling stock, Traction systems | PARTICLE_WEAR, COMPRESSED_AIR_MOISTURE | SYNTEPORE, SYNTRAX, MACROCORE, DRYCORE, INTEKCORE |
| TRUCKS_FLEETS.md | TRUCKS_FLEETS | Trucks & Fleets | trucks-fleets | MEDIUM | Heavy-duty trucks, Commercial fleet vehicles | PARTICLE_WEAR, DIESEL_WATER | MACROCORE, SYNTRAX, SYNTEPORE, INTEKCORE |
| WASTE_MUNICIPAL.md | WASTE_MUNICIPAL | Waste & Municipal | waste-municipal | MEDIUM | Waste collection vehicles, Fire apparatus, Municipal fleets | PARTICLE_WEAR, CABIN_AIR_CONTAMINATION | MACROCORE, SYNTRAX, SYNTEPORE, MICROKAPPA |

**Applicable standards per industry:**

| key | applicable_standards |
|-----|---------------------|
| AUTOMOTIVE | SAE_J1539, ISO_4406, ISO_16889, ISO_11155 |
| BUS_COACH | ISO_5011, ISO_4406, ISO_8573_1, ISO_11155 |
| CONSTRUCTION | SAE_J1539, ISO_16889, ISO_5011, NFPA_T214, ISO_11155 |
| MANUFACTURING | NFPA_T214, ISO_16889, DIN_51524, ISO_8573_1, ISO_11155 |
| MARINE | ASTM_D6304, ISO_16889, ISO_5011, ISO_12937, ISO_14540 |
| MINING | ISO_16889, ISO_5011, SAE_J1539 |
| OIL_GAS | ISO_5011, ASTM_D6304, ISO_16889, ISO_8573_1 |
| POWER_GENERATION | ISO_16889, ASTM_D6304, ISO_5011, ISO_8573_1 |
| RAILWAY | ISO_5011, ISO_4406, ISO_8573_1 |
| TRUCKS_FLEETS | SAE_J1539, ISO_4406, ISO_16889 |
| WASTE_MUNICIPAL | ISO_5011, ISO_4406, ISO_11155 |

**Operating conditions per industry:**

| key | environment | temperature | main_issue |
|-----|-------------|-------------|------------|
| AUTOMOTIVE | Mixed urban/highway, seasonal | −20°C to +50°C | Road dust, coolant SCA depletion, cabin PM2.5 in urban routes |
| BUS_COACH | Urban stop-and-go, high-frequency cold starts | −20°C to +40°C | 200–400 daily stop-start cycles generating high soot; pneumatic braking air quality |
| CONSTRUCTION | High-dust earthwork sites, unpaved roads | −20°C to +50°C | Silica dust ingestion, high-pressure hydraulic precision, fuel water from site tanks |
| MANUFACTURING | Climate-controlled, clean facilities | +15°C to +30°C | Precision equipment proportional control; production pneumatics air purity |
| MARINE | High humidity, salt spray, thermal cycling | −10°C to +40°C | Water ingress from bunkered fuel, microbial growth, salt-air intake degradation |
| MINING | 24/7 operation, extreme dust, hardrock particulates | −30°C to +60°C | Continuous silica and hardrock dust; hydraulic precision in haul equipment |
| OIL_GAS | Offshore and onshore platform, salt-laden air, H2S exposure | −10°C to +55°C | Fuel storage water accumulation; instrument air purity for control systems |
| POWER_GENERATION | Industrial sites, variable outdoor/semi-indoor exposure | 0°C to +45°C | Standby fuel degradation from long-term storage; SCA depletion in continuous-duty diesel generators |
| RAILWAY | Variable weather, humidity cycling, tunnel operation | −30°C to +50°C | Pneumatic braking air moisture — safety-critical failure mode; temperature cycling degrading cellulose intake media |
| TRUCKS_FLEETS | Highway, urban delivery, coastal and tropical routes | −20°C to +45°C | Extended drain interval oil integrity; all-synthetic intake for humid tropical routes |
| WASTE_MUNICIPAL | Urban stop-and-go, coastal city routes, high-cycle duty | −10°C to +40°C | High soot from stop-and-go cold-start cycles; cabin PM2.5 in urban diesel routes |

---

### 4.5 Product Systems (12)

**AIRFILTER.md — full definition:**

```yaml
---
type: system
key: AIRFILTER
name: "Air Filter"
slug: airfilter
domain: Air Intake

primary_technology: MACROCORE
supporting_technologies: []

tags: [system, air-intake]
---
```

**All systems — reference table:**

| File | key | name | slug | domain | primary_technology | supporting_technologies |
|------|-----|------|------|--------|--------------------|------------------------|
| AIRFILTER.md | AIRFILTER | Air Filter | airfilter | Air Intake | MACROCORE | — |
| CABIN.md | CABIN | Cabin Filter | cabin | Cabin Protection | MICROKAPPA | — |
| COOLANT.md | COOLANT | Coolant Filter | coolant | Cooling System | THERMOCORE | MICROKAPPA |
| DRYER.md | DRYER | Air Dryer | dryer | Compressed Air | DRYCORE | — |
| FUEL.md | FUEL | Fuel Filter | fuel | Fuel Cleanliness | SYNTEPORE | HYDROCORE |
| HOUSING.md | HOUSING | Filter Housing | housing | Air Intake | INTEKCORE | MACROCORE |
| HYDRAULIC.md | HYDRAULIC | Hydraulic Filter | hydraulic | Hydraulic | NANOFORCE | — |
| KITS.md | KITS | Filter Kits | kits | Lubrication | SYNTRAX | MACROCORE, NANOFORCE |
| MARINE_SYSTEM.md | MARINE_SYSTEM | Marine Filter | marine | Fuel Cleanliness | HYDROCORE | SYNTEPORE, NANOFORCE |
| OIL.md | OIL | Lube Oil Filter | oil | Lubrication | SYNTRAX | — |
| WATER.md | WATER | Fuel Water Separator | water | Fuel Cleanliness | HYDROCORE | — |

```yaml
```

---

### 4.6 Standards (23)

Standards split into two groups: **11 in unified-data.ts** (set `in_unified_data: true`) and **12 additions** (set `in_unified_data: false` — pending Phase 3B).

**ISO_16889.md — full definition:**

```yaml
---
type: standard
key: ISO_16889
code: "ISO 16889"
name: "Multi-Pass Filter Test Method"
slug: iso-16889
criticality: PRIMARY

description: "Beta ratio test method for hydraulic and lube oil filter elements — establishes filtration efficiency (β) and dirt-holding capacity under multi-pass conditions."

applicable_to:
  - MACROCORE
  - NANOFORCE
  - MICROKAPPA
  - SYNTRAX
  - HYDROCORE

body: ISO
specification_type: test_method

in_unified_data: true

tags: [standard, primary, iso, hydraulic, lubrication]
---
```

**11 existing standards in unified-data.ts:**

| File | key | code | name | criticality | body | specification_type | applicable_to |
|------|-----|------|------|-------------|------|--------------------|---------------|
| ISO_16889.md | ISO_16889 | ISO 16889 | Multi-Pass Filter Test Method | PRIMARY | ISO | test_method | MACROCORE, NANOFORCE, MICROKAPPA, SYNTRAX, HYDROCORE |
| ISO_4406.md | ISO_4406 | ISO 4406 | Particle Count Cleanliness Code | PRIMARY | ISO | cleanliness_code | NANOFORCE, SYNTRAX |
| ISO_5011.md | ISO_5011 | ISO 5011 | Air Filter Performance Test | PRIMARY | ISO | test_method | MACROCORE, SYNTEPORE, INTEKCORE |
| SAE_J1539.md | SAE_J1539 | SAE J1539 | Air Intake Cleanliness for Diesel Engines | PRIMARY | SAE | product_spec | MACROCORE, SYNTEPORE |
| ASTM_D6304.md | ASTM_D6304 | ASTM D6304 | Karl Fischer Water Content in Petroleum | PRIMARY | ASTM | test_method | NANOFORCE, HYDROCORE, SYNTRAX |
| ISO_12937.md | ISO_12937 | ISO 12937 | Water in Petroleum Products — Karl Fischer Method | SECONDARY | ISO | test_method | HYDROCORE |
| ISO_8573_1.md | ISO_8573_1 | ISO 8573-1 | Compressed Air Purity Classes | PRIMARY | ISO | cleanliness_code | DRYCORE |
| NFPA_T214.md | NFPA_T214 | NFPA T2.14 | Hydraulic Fluid Power Cleanliness | PRIMARY | NFPA | cleanliness_code | NANOFORCE, SYNTRAX |
| DIN_51524.md | DIN_51524 | DIN 51524 | Hydraulic Fluid Requirements | SECONDARY | DIN | product_spec | NANOFORCE, SYNTRAX |
| ISO_11155.md | ISO_11155 | ISO 11155 | Cabin Air Filtration Systems | PRIMARY | ISO | product_spec | MICROKAPPA |
| ISO_14540.md | ISO_14540 | ISO 14540 | Marine Diesel Fuel Specifications | SECONDARY | ISO | product_spec | HYDROCORE |

All above: `in_unified_data: true`

---

**12 standards to add (not yet in unified-data.ts):**

All below: `in_unified_data: false`

| File | key | code | name | criticality | body | specification_type | applicable_to | description |
|------|-----|------|------|-------------|------|--------------------|---------------|-------------|
| ANSI_B132_1.md | ANSI_B132_1 | ANSI B132.1 | Industrial Air Filter Standard | SECONDARY | ANSI | test_method | MACROCORE, SYNTEPORE, INTEKCORE | Industrial air filter test methods — dust holding capacity and pressure drop characteristics of element media |
| SAE_J1211.md | SAE_J1211 | SAE J1211 | Engine Oil Filter Performance | PRIMARY | SAE | test_method | SYNTRAX | Engine oil filtration performance standard defining bypass valve pressure limits (typically 3–5 bar) and element collapse thresholds |
| ASTM_D7085.md | ASTM_D7085 | ASTM D7085 | Particle Counting for In-Service Oil | SECONDARY | ASTM | measurement_method | SYNTRAX | Particle counting methodology for in-service oil analysis providing quantitative wear debris classification and trending |
| ASTM_D975.md | ASTM_D975 | ASTM D975 | Diesel Fuel Specification | SECONDARY | ASTM | product_spec | HYDROCORE | Standard specification for diesel fuel — upper limits on water, sediment, and contamination levels acceptable for engine fuel systems |
| ISO_11155_1.md | ISO_11155_1 | ISO 11155-1 | Cabin Air — Particle Filtration | PRIMARY | ISO | test_method | MICROKAPPA | Particle filtration efficiency testing for cabin air filter elements using synthetic dust at controlled concentrations — minimum 85% efficiency at PM10 particle size class |
| ISO_11155_2.md | ISO_11155_2 | ISO 11155-2 | Cabin Air — Gaseous Contaminant Filtration | SECONDARY | ISO | test_method | MICROKAPPA | Gaseous contaminant filtration testing for cabin air systems — carbon filter performance against NO₂, SO₂, ozone, and organic vapor penetration |
| DIN_71220.md | DIN_71220 | DIN 71220 | Off-Highway Cabin Air Filtration | SECONDARY | DIN | product_spec | MICROKAPPA | German standard for operator cabin air filtration in mobile off-highway equipment — filter construction requirements and minimum service interval performance |
| ISO_16890.md | ISO_16890 | ISO 16890 | General Air Filtration by PM Class | SECONDARY | ISO | cleanliness_code | MICROKAPPA | General air filtration standard classifying filters by PM1, PM2.5, and PM10 efficiency ratings — increasingly applied to mobile equipment cabin filtration specification |
| ISO_8573_2.md | ISO_8573_2 | ISO 8573-2 | Compressed Air Water Measurement | SECONDARY | ISO | measurement_method | DRYCORE | Measurement methods for water vapor content and dew point in compressed air systems using electrochemical sensors, chilled mirror hygrometers, and Karl Fischer titration |
| ISO_8573_3.md | ISO_8573_3 | ISO 8573-3 | Compressed Air Oil Content Measurement | SECONDARY | ISO | measurement_method | DRYCORE | Measurement methods for oil content and oil vapor concentration in compressed air using gravimetric analysis and flame ionization detection chromatography |
| ISO_8573_4.md | ISO_8573_4 | ISO 8573-4 | Compressed Air Particle Measurement | SECONDARY | ISO | measurement_method | DRYCORE | Particle measurement methods for compressed air including particle counters and gravimetric mass concentration measurement in accordance with purity classification procedures |
| ASTM_D6595.md | ASTM_D6595 | ASTM D6595 | Wear Metals Analysis | SECONDARY | ASTM | measurement_method | SYNTRAX, NANOFORCE | Wear metals analysis by rotating disc electrode spectrometry — primary tool for oil analysis programs enabling predictive maintenance cost control |

---

### 4.7 Contamination Modes (6)

**PARTICLE_WEAR.md — full definition:**

```yaml
---
type: contamination
key: PARTICLE_WEAR
name: "Particle Wear in Engines"
slug: particle-wear

description: "Abrasive particle-induced wear through two-body, three-body, and adhesive mechanisms in engine oil, fuel, and air intake systems."

root_causes:
  - AIR_INTAKE_INGESTION
  - FUEL_CONTAMINATION
  - INTERNAL_GENERATION
  - OIL_CIRCULATION

failure_modes:
  - TWO_BODY_WEAR
  - THREE_BODY_WEAR
  - ADHESIVE_WEAR
  - BEARING_SPALLING
  - RING_STICKING

impacts:
  oil_consumption: "+15–40%"
  engine_blowby: "+5–10%"
  fuel_economy: "−5–12%"
  compression_drop: "−10–25%"
  equipment_availability: "−15–25%"

resolved_by:
  - MACROCORE
  - NANOFORCE
  - SYNTRAX

related_standards:
  - ISO_16889
  - ISO_4406
  - SAE_J1539

tags: [contamination, particle, wear, high-severity]
---
```

**Remaining contamination modes:**

**DIESEL_WATER.md:**

```yaml
---
type: contamination
key: DIESEL_WATER
name: "Diesel Water Contamination"
slug: diesel-water

description: "Free, emulsified, and dissolved water in diesel fuel systems causing injector corrosion, microbial growth, and fuel system degradation."

root_causes:
  - ATMOSPHERIC_BREATHING
  - CONDENSATION
  - STORAGE_CORROSION
  - TRANSFER_CONTAMINATION

failure_modes:
  - INJECTOR_STICTION
  - FUEL_DELIVERY_CORROSION
  - MICROBIAL_GROWTH
  - FUEL_GUM_FORMATION
  - LUBRICITY_LOSS

impacts:
  hard_starting: "+5–15 seconds"
  fuel_consumption: "+3–8%"
  injector_cleaning_frequency: "2,000–3,000 hours"
  equipment_availability: "−12–18%"

resolved_by:
  - NANOFORCE
  - HYDROCORE
  - SYNTRAX

related_standards:
  - ASTM_D6304
  - ISO_12937
  - ISO_4406

tags: [contamination, diesel, water, fuel-system, high-severity]
---
```

**HYDRAULIC_CONTAMINATION.md:**

```yaml
---
type: contamination
key: HYDRAULIC_CONTAMINATION
name: "Hydraulic System Contamination"
slug: hydraulic-system

description: "Particle and water contamination in pressurised hydraulic circuits causing valve stiction, pump wear, and actuator failure."

root_causes:
  - MANUFACTURING_RESIDUE
  - SEAL_DEGRADATION
  - EXTERNAL_INGESTION
  - INTERNAL_GENERATION
  - PUMP_WEAR

failure_modes:
  - VALVE_SPOOL_STICTION
  - ORIFICE_BLOCKAGE
  - PUMP_SWASHPLATE_STICTION
  - SEAL_EXTRUSION
  - HEAT_EXCHANGER_BLOCKAGE

impacts:
  system_pressure_increase: "+10–30%"
  heat_generation: "+5–15 kW"
  fluid_temperature: "+20–30°C"
  equipment_availability: "−15–30%"
  unplanned_maintenance: "1–2 per 500 hours"

resolved_by:
  - NANOFORCE
  - HYDROCORE
  - SYNTRAX
  - MICROKAPPA

related_standards:
  - ISO_16889
  - ISO_4406
  - NFPA_T214
  - DIN_51524

tags: [contamination, hydraulic, particle, high-severity]
---
```

**COMPRESSED_AIR_MOISTURE.md:**

```yaml
---
type: contamination
key: COMPRESSED_AIR_MOISTURE
name: "Compressed Air Moisture"
slug: compressed-air-moisture

description: "Water vapour and condensed water in compressed air systems causing corrosion, freeze events, valve failure, and actuator seal degradation."

root_causes:
  - ATMOSPHERIC_HUMIDITY
  - COMPRESSOR_CONDENSATION
  - TEMPERATURE_CYCLING

failure_modes:
  - VALVE_CORROSION
  - ACTUATOR_FREEZE
  - BRAKE_CIRCUIT_FAILURE
  - INSTRUMENT_AIR_CONTAMINATION

impacts:
  valve_service_life: "−40–60%"
  brake_response_time: "+15–30%"
  maintenance_frequency: "3× baseline"

resolved_by:
  - DRYCORE

related_standards:
  - ISO_8573_1

tags: [contamination, compressed-air, moisture, medium-severity]
---
```

**COOLANT_CONTAMINATION.md:**

```yaml
---
type: contamination
key: COOLANT_CONTAMINATION
name: "Coolant System Contamination"
slug: coolant-contamination

description: "SCA depletion and scale/liner-pitting contamination in diesel engine cooling circuits causing liner cavitation erosion and corrosion."

root_causes:
  - SCA_DEPLETION
  - CAVITATION_NUCLEATION
  - SCALE_FORMATION
  - CORROSIVE_INGRESS

failure_modes:
  - LINER_PITTING
  - CAVITATION_EROSION
  - SCALE_DEPOSIT
  - CORROSIVE_DEGRADATION

impacts:
  liner_rebuild_frequency: "3× without SCA control"
  coolant_service_interval: "−50% without controlled release"
  engine_reconditioning: "$12,000+ per event (liner replacement)"

resolved_by:
  - THERMOCORE

related_standards:
  - ISO_16889

tags: [contamination, coolant, sca, medium-severity]
---
```

**CABIN_AIR_CONTAMINATION.md:**

```yaml
---
type: contamination
key: CABIN_AIR_CONTAMINATION
name: "Cabin Air Contamination"
slug: cabin-air-contamination

description: "Diesel exhaust particulate, silica dust, and ambient PM2.5 infiltrating operator cabs — occupational health and regulatory compliance concern."

root_causes:
  - DIESEL_EXHAUST_INTRUSION
  - DUST_INGRESS
  - HVAC_RECIRCULATION
  - WINDOW_SEAL_DEGRADATION

failure_modes:
  - PM2_5_OVEREXPOSURE
  - SILICA_DUST_EXPOSURE
  - DIESEL_EXHAUST_CARCINOGEN_EXPOSURE

impacts:
  pm25_reduction: "Up to 85% with MICROKAPPA"
  regulatory_risk: "EU Dir. 2019/130 non-compliance above threshold"
  operator_health_risk: "IARC Group 1 carcinogen (diesel exhaust)"

resolved_by:
  - MICROKAPPA

related_standards:
  - ISO_11155

tags: [contamination, cabin, pm25, operator-health, medium-severity]
---
```

---

## 5. Wikilink Standards

### 5.1 Note Filename Is the Link Target

Every `[[wikilink]]` resolves to a note filename. Filenames are always the entity key in uppercase with underscores. The Obsidian link `[[MACROCORE]]` resolves to `01-technologies/active/MACROCORE.md`.

Obsidian resolves links by filename regardless of folder path — a link `[[MACROCORE]]` will find the file anywhere in the vault. However, use **aliased paths** when the same filename could be ambiguous:

```markdown
[[01-technologies/active/MACROCORE|MACROCORE™]]
```

### 5.2 Display Aliases

Always use a pipe alias to show the human-readable name, never the key:

```markdown
[[MACROCORE|MACROCORE™]]              ✓ correct
[[MACROCORE]]                         ✗ shows key, not display name
[[01-technologies/active/MACROCORE]]  ✗ shows full path
```

Standard display aliases per entity type:

| Entity type | Link format | Example |
|-------------|-------------|---------|
| Active technology | `[[KEY\|NAME™]]` | `[[MACROCORE\|MACROCORE™]]` |
| Deprecated technology | `[[KEY\|NAME™ (deprecated)]]` |  |
| Ecosystem | `[[KEY\|NAME™ Ecosystem]]` | `[[DURATECH\|DURATECH™ Ecosystem]]` |
| Industry | `[[KEY\|Display Name]]` | `[[TRUCKS_FLEETS\|Trucks & Fleets]]` |
| Standard | `[[KEY\|CODE — Name]]` | `[[ISO_16889\|ISO 16889 — Multi-Pass Filter Test]]` |
| Contamination | `[[KEY\|Name]]` | `[[PARTICLE_WEAR\|Particle Wear in Engines]]` |
| System | `[[KEY\|Name]]` | `[[HYDRAULIC\|Hydraulic Filter]]` |

### 5.3 Relationship Section Template

Every entity note must include a `## Relationships` section immediately after the frontmatter block. This section contains the wikilinks that populate the graph.

**Technology note body structure:**

```markdown
---
[frontmatter]
---

## Relationships

**Resolves:** [[PARTICLE_WEAR|Particle Wear in Engines]]

**Standards:** [[ISO_5011|ISO 5011 — Air Filter Performance Test]] · [[SAE_J1539|SAE J1539 — Air Intake Cleanliness]] · [[ISO_16889|ISO 16889 — Multi-Pass Filter Test]]

**Applicable to:** [[AGRICULTURE|Agriculture]] · [[CONSTRUCTION|Construction]] · [[MINING|Mining]] · [[MARINE|Marine]] · [[AUTOMOTIVE|Automotive]] · [[BUS_COACH|Bus & Coach]] · [[RAILWAY|Railway]] · [[TRUCKS_FLEETS|Trucks & Fleets]] · [[OIL_GAS|Oil & Gas]] · [[POWER_GENERATION|Power Generation]] · [[WASTE_MUNICIPAL|Waste & Municipal]]

**Product systems:** [[AIRFILTER|Air Filter]] · [[HOUSING|Filter Housing]]

---

[editorial body text continues below]
```

**Industry note body structure:**

```markdown
---
[frontmatter]
---

## Relationships

**Contamination exposure:** [[PARTICLE_WEAR|Particle Wear in Engines]] · [[DIESEL_WATER|Diesel Water Contamination]]

**Technologies applied:** [[MACROCORE|MACROCORE™]] · [[NANOFORCE|NANOFORCE™]] · [[SYNTRAX|SYNTRAX™]] · [[HYDROCORE|HYDROCORE™]] · [[INTEKCORE|INTEKCORE™]]

**Applicable standards:** [[ISO_5011|ISO 5011]] · [[SAE_J1539|SAE J1539]] · [[ISO_16889|ISO 16889]] · [[ASTM_D6304|ASTM D6304]]

---
```

**Standard note body structure:**

```markdown
---
[frontmatter]
---

## Relationships

**Applied by:** [[MACROCORE|MACROCORE™]] · [[NANOFORCE|NANOFORCE™]] · [[MICROKAPPA|MICROKAPPA™]] · [[SYNTRAX|SYNTRAX™]] · [[HYDROCORE|HYDROCORE™]]

**Cited in KB articles:** [add links as KB notes are created]

---
```

**Contamination note body structure:**

```markdown
---
[frontmatter]
---

## Relationships

**Resolved by:** [[MACROCORE|MACROCORE™]] · [[NANOFORCE|NANOFORCE™]] · [[SYNTRAX|SYNTRAX™]]

**Measured by:** [[ISO_16889|ISO 16889]] · [[ISO_4406|ISO 4406]] · [[SAE_J1539|SAE J1539]]

**Affects industries:** [[AGRICULTURE|Agriculture]] · [[CONSTRUCTION|Construction]] · [[MINING|Mining]] · [[MARINE|Marine]] · [[AUTOMOTIVE|Automotive]] · [[OIL_GAS|Oil & Gas]] · [[POWER_GENERATION|Power Generation]] · [[RAILWAY|Railway]] · [[TRUCKS_FLEETS|Trucks & Fleets]] · [[WASTE_MUNICIPAL|Waste & Municipal]] · [[MANUFACTURING|Manufacturing]]

---
```

**System note body structure:**

```markdown
---
[frontmatter]
---

## Relationships

**Primary technology:** [[MACROCORE|MACROCORE™]]

**Supporting technologies:** *(none)*

**Domain:** Air Intake

---
```

### 5.4 Deprecated Technology Cross-Reference

Deprecated technology notes must link to their replacement in the Relationships section:

```markdown
## Relationships

**Status:** Deprecated — replaced by [[HYDROCORE|HYDROCORE™]]


**Was applicable to:** [[MARINE|Marine]] · [[OIL_GAS|Oil & Gas]] · [[POWER_GENERATION|Power Generation]] · [[AGRICULTURE|Agriculture]]

---
```

And the replacement active technology must back-reference its predecessor:

```markdown
## Relationships

**Replaces:** 

**Resolves:** [[DIESEL_WATER|Diesel Water Contamination]] · [[PARTICLE_WEAR|Particle Wear in Engines]]
...
```

### 5.5 Tag Taxonomy

Tags must be lowercase, hyphenated, no spaces. Every note gets the entity-type tag plus domain and severity/status tags.

**Entity type tags (required on all notes):**
- `technology`
- `industry`
- `system`
- `standard`
- `contamination`

**Status tags (technology notes):**
- `active`
- `deprecated`
- `ecosystem`

**Domain tags (technology and system notes):**
- `air-intake`
- `fuel-cleanliness`
- `lubrication`
- `hydraulic`
- `compressed-air`
- `cooling-system`
- `cabin-protection`

**Severity tags (contamination notes):**
- `high-severity`
- `medium-severity`
- `low-severity`

**Exposure tags (industry notes):**
- `extreme-exposure`
- `high-exposure`
- `medium-high-exposure`
- `medium-exposure`
- `low-medium-exposure`
- `low-exposure`

**Standard issuing body tags:**
- `iso`
- `sae`
- `astm`
- `nfpa`
- `din`
- `ansi`

**Status tracking tag (standards only):**
- `in-unified-data` — present when `in_unified_data: true`

### 5.6 Forbidden Link Patterns

```markdown
[[macrocore]]          ✗ lowercase filename — won't resolve
[[MACRO CORE]]         ✗ space in link — invalid
[[MACROCORE.md]]       ✗ extension in link — Obsidian does not use extensions
[[#MACROCORE]]         ✗ heading anchor on wrong note
See MACROCORE          ✗ plain text mention — creates no graph edge
```

---

## 6. Meta Notes

### 6.1 `00-meta/_INDEX.md`

The index note does not use YAML frontmatter. It is a manually maintained reference table.

```markdown
# ELIMFILTERS Vault Index

Last updated: 2026-06-03
Total notes: 65

## Technologies (13)
### Active (9)
[[MACROCORE|MACROCORE™]] · Air Intake
[[SYNTEPORE|SYNTEPORE™]] · Air Intake
[[INTEKCORE|INTEKCORE™]] · Air Intake
[[DRYCORE|DRYCORE™]] · Compressed Air
[[HYDROCORE|HYDROCORE™]] · Fuel Cleanliness ⚠️ specs pending
[[SYNTRAX|SYNTRAX™]] · Lubrication
[[NANOFORCE|NANOFORCE™]] · Hydraulic
[[THERMOCORE|THERMOCORE™]] · Cooling System ⚠️ specs pending
[[MICROKAPPA|MICROKAPPA™]] · Cabin Protection

### Deprecated (2)
 → replaced by [[HYDROCORE|HYDROCORE™]]
 → replaced by [[THERMOCORE|THERMOCORE™]]

### Ecosystems (2)
[[MARINECLEAN|MARINECLEAN™]] · Marine program
[[DURATECH|DURATECH™]] · Fleet kit program

## Industries (12)
[[AGRICULTURE|Agriculture]] · HIGH
[[AUTOMOTIVE|Automotive]] · MEDIUM
[[BUS_COACH|Bus & Coach]] · MEDIUM
[[CONSTRUCTION|Construction]] · HIGH
[[MANUFACTURING|Manufacturing]] · LOW-MEDIUM
[[MARINE|Marine]] · MEDIUM-HIGH
[[MINING|Mining]] · EXTREME
[[OIL_GAS|Oil & Gas]] · HIGH
[[POWER_GENERATION|Power Generation]] · MEDIUM
[[RAILWAY|Railway]] · MEDIUM
[[TRUCKS_FLEETS|Trucks & Fleets]] · MEDIUM
[[WASTE_MUNICIPAL|Waste & Municipal]] · MEDIUM

## Systems (12)
[[AIRFILTER|Air Filter]] · Air Intake · MACROCORE
[[CABIN|Cabin Filter]] · Cabin Protection · MICROKAPPA
[[COOLANT|Coolant Filter]] · Cooling System · THERMOCORE
[[DRYER|Air Dryer]] · Compressed Air · DRYCORE
[[FUEL|Fuel Filter]] · Fuel Cleanliness · SYNTEPORE
[[HOUSING|Filter Housing]] · Air Intake · INTEKCORE
[[HYDRAULIC|Hydraulic Filter]] · Hydraulic · NANOFORCE
[[KITS|Filter Kits]] · Lubrication · SYNTRAX
[[MARINE_SYSTEM|Marine Filter]] · Fuel Cleanliness · HYDROCORE
[[OIL|Lube Oil Filter]] · Lubrication · SYNTRAX
[[WATER|Fuel Water Separator]] · Fuel Cleanliness · HYDROCORE

## Standards (23)
### In unified-data.ts (11)
[[ISO_16889|ISO 16889]] [[ISO_4406|ISO 4406]] [[ISO_5011|ISO 5011]]
[[SAE_J1539|SAE J1539]] [[ASTM_D6304|ASTM D6304]] [[ISO_12937|ISO 12937]]
[[ISO_8573_1|ISO 8573-1]] [[NFPA_T214|NFPA T2.14]] [[DIN_51524|DIN 51524]]
[[ISO_11155|ISO 11155]] [[ISO_14540|ISO 14540]]

### Pending addition to unified-data.ts (12)
[[ANSI_B132_1|ANSI B132.1]] [[SAE_J1211|SAE J1211]] [[ASTM_D7085|ASTM D7085]]
[[ASTM_D975|ASTM D975]] [[ISO_11155_1|ISO 11155-1]] [[ISO_11155_2|ISO 11155-2]]
[[DIN_71220|DIN 71220]] [[ISO_16890|ISO 16890]] [[ISO_8573_2|ISO 8573-2]]
[[ISO_8573_3|ISO 8573-3]] [[ISO_8573_4|ISO 8573-4]] [[ASTM_D6595|ASTM D6595]]

## Contamination Modes (6)
[[PARTICLE_WEAR|Particle Wear in Engines]]
[[DIESEL_WATER|Diesel Water Contamination]]
[[HYDRAULIC_CONTAMINATION|Hydraulic System Contamination]]
[[COMPRESSED_AIR_MOISTURE|Compressed Air Moisture]]
[[COOLANT_CONTAMINATION|Coolant System Contamination]]
[[CABIN_AIR_CONTAMINATION|Cabin Air Contamination]]
```

### 6.2 `00-meta/_SCHEMA-REFERENCE.md`

Lists every YAML field name, its type, which entity types use it, and whether it is synced to `unified-data.ts`. Serves as the contract for future sync scripts.

```markdown
# Schema Reference

| Field | Type | Entity types | Synced to UD |
|-------|------|-------------|--------------|
| type | string enum | all | no |
| status | string enum | technology | no |
| key | string | all | yes |
| name | string | all | yes |
| slug | string | all | yes |
| domain | string | technology, system | yes |
| logo_file | string | technology | yes |
| category | string | technology | yes |
| tagline | string | technology | yes |
| geo_definition | string | technology | yes |
| comparison_function | string | technology | yes |
| comparison_metric | string | technology | yes |
| comparison_industries | string[] | technology | yes |
| applicable_industries | IndustryKey[] | technology | yes |
| related_standards | StandardKey[] | technology | yes |
| addresses_contamination | ContaminationKey[] | technology | yes |
| key_metrics | Record<string,string> | technology | yes |
| deprecated_date | string | technology (deprecated) | no |
| replaced_by | TechnologyKey | technology (deprecated) | no |
| replaced_by_name | string | technology (deprecated) | no |
| sunset_note | string | technology (deprecated) | no |
| program_type | string | technology (ecosystem) | yes |
| contamination_exposure | ExposureLevel | industry | yes |
| primary_equipment | string[] | industry | yes |
| relevant_contamination | ContaminationKey[] | industry | yes |
| applicable_technologies | TechnologyKey[] | industry | yes |
| applicable_standards | StandardKey[] | industry | yes |
| operating_conditions | object | industry | yes |
| primary_technology | TechnologyKey | system | yes |
| supporting_technologies | TechnologyKey[] | system | yes |
| description | string | system (optional) | yes |
| code | string | standard | yes |
| criticality | PRIMARY/SECONDARY | standard | yes |
| applicable_to | TechnologyKey[] | standard | yes |
| body | string | standard | no |
| specification_type | string | standard | no |
| in_unified_data | boolean | standard | no |
| root_causes | string[] | contamination | yes |
| failure_modes | string[] | contamination | yes |
| impacts | Record<string,string> | contamination | yes |
| resolved_by | TechnologyKey[] | contamination | yes |
| related_standards | StandardKey[] | contamination | yes |
| tags | string[] | all | no |
```

---

*Foundation plan only. No automation. No sync. No page generation.*
*All 65 notes can be created manually from the definitions in §4.*
