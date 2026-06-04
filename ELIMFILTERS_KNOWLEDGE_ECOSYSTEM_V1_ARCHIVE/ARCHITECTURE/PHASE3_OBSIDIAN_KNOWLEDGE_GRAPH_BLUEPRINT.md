# PHASE 3: OBSIDIAN KNOWLEDGE GRAPH BLUEPRINT
# ELIMFILTERS® World Catalogue — Master Knowledge Repository

**Date:** 2026-06-03
**Status:** ARCHITECTURE ONLY — No implementation
**Prerequisite:** Phase 2 complete (unified-data.ts established as structural SSoT)
**Scope:** Full integration design between Obsidian, unified-data.ts, Knowledge System, Technologies, Industries, Systems, Components, Problems, Standards, AI Engine, and Part Search

---

## Executive Summary

Obsidian becomes the **editorial master** of the ELIMFILTERS knowledge graph. `unified-data.ts` remains the **structural runtime source** consumed by the Next.js application. The two systems are kept in sync by a bidirectional script layer: editorial changes authored in Obsidian flow out to `unified-data.ts` and into the website; structural changes in code flow back into the vault as updated note properties.

This architecture produces three outputs from a single authoring surface:
1. **Website pages** — Next.js routes generated from vault notes
2. **AI citation layer** — structured canonical knowledge blocks parseable by LLMs
3. **Part Search graph** — SKU → technology → contamination → industry traversal

---

## 1. Design Principles

1. **Obsidian is the authoring surface** — editors write in markdown, not TypeScript.
2. **unified-data.ts is the runtime surface** — application code reads TypeScript, not markdown.
3. **YAML frontmatter is the contract** — the sync layer reads/writes YAML only; note body text is editorial and never parsed.
4. **Wikilinks are the graph** — every `[[entity]]` reference in a note creates a graph edge; the Obsidian graph view is the visual ERD of the knowledge system.
5. **No data lives in two places** — each field has exactly one authoritative location; the sync layer propagates, not duplicates.
6. **Notes are not pages** — not every note generates a page; notes are classified by `generate_page: true/false` in frontmatter.

---

## 2. Vault Folder Structure

```
elimfilters-vault/
│
├── 00-meta/
│   ├── _INDEX.md                    # Master entity registry with counts
│   ├── _SYNC-LOG.md                 # Timestamped sync run history
│   ├── _SCHEMA-REFERENCE.md         # All YAML field definitions
│   ├── _CITATION-REGISTRY.md        # AI citation index (machine-readable)
│   └── templates/
│       ├── tpl-technology.md
│       ├── tpl-standard.md
│       ├── tpl-industry.md
│       ├── tpl-system.md
│       ├── tpl-contamination.md
│       ├── tpl-component.md
│       ├── tpl-problem.md
│       ├── tpl-kb-article.md
│       └── tpl-sku.md
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
│   │   ├── AQUAGUARD.md
│   │   └── COOLTECH.md
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
│   ├── product-systems/
│   │   ├── AIRFILTER.md
│   │   ├── AQUAGUARD_SERIES.md
│   │   ├── CABIN.md
│   │   ├── COOLANT.md
│   │   ├── DRYER.md
│   │   ├── FUEL.md
│   │   ├── HOUSING.md
│   │   ├── HYDRAULIC.md
│   │   ├── KITS.md
│   │   ├── MARINE_SYSTEM.md
│   │   ├── OIL.md
│   │   └── WATER.md
│   └── protection-domains/
│       ├── AIR_INTAKE_DOMAIN.md
│       ├── FUEL_CLEANLINESS_DOMAIN.md
│       ├── LUBRICATION_DOMAIN.md
│       ├── HYDRAULIC_DOMAIN.md
│       └── COOLING_ENVIRONMENTAL_DOMAIN.md
│
├── 04-standards/
│   ├── primary/
│   │   ├── ISO_16889.md
│   │   ├── ISO_4406.md
│   │   ├── ISO_5011.md
│   │   ├── SAE_J1539.md
│   │   ├── ASTM_D6304.md
│   │   ├── ISO_8573_1.md
│   │   ├── NFPA_T214.md
│   │   ├── DIN_51524.md
│   │   ├── ISO_11155.md
│   │   ├── SAE_J1211.md
│   │   ├── ASTM_D7085.md
│   │   └── ASTM_D975.md
│   └── secondary/
│       ├── ISO_12937.md
│       ├── ISO_14540.md
│       ├── ANSI_B132_1.md
│       ├── DIN_71220.md
│       ├── ISO_16890.md
│       ├── ISO_11155_1.md
│       ├── ISO_11155_2.md
│       ├── ISO_8573_2.md
│       ├── ISO_8573_3.md
│       ├── ISO_8573_4.md
│       └── ASTM_D6595.md
│
├── 05-contamination/
│   ├── PARTICLE_WEAR.md
│   ├── DIESEL_WATER.md
│   ├── HYDRAULIC_CONTAMINATION.md
│   ├── COMPRESSED_AIR_MOISTURE.md
│   ├── COOLANT_CONTAMINATION.md
│   └── CABIN_AIR_CONTAMINATION.md
│
├── 06-components/
│   ├── filter-media/
│   │   ├── progressive-density-gradient.md
│   │   ├── synthetic-nano-fiber.md
│   │   ├── electrostatic-synthetic.md
│   │   ├── cellulose-blend.md
│   │   ├── molecular-sieve.md
│   │   └── coalescent-media.md
│   ├── housings/
│   │   ├── spin-on-canister.md
│   │   ├── bowl-filter-housing.md
│   │   ├── turbine-separator.md
│   │   └── modular-inline-housing.md
│   └── bypass-mechanisms/
│       ├── bypass-valve-3bar.md
│       └── bypass-valve-5bar.md
│
├── 07-problems/
│   ├── engine-failures/
│   │   ├── bearing-seizure.md
│   │   ├── injector-stiction.md
│   │   ├── ring-sticking.md
│   │   └── turbocharger-wear.md
│   ├── hydraulic-failures/
│   │   ├── proportional-valve-stiction.md
│   │   ├── pump-cavitation.md
│   │   └── seal-extrusion.md
│   └── operational-failures/
│       ├── unplanned-downtime.md
│       ├── fuel-economy-loss.md
│       └── operator-health-exposure.md
│
├── 08-knowledge-system/
│   ├── standards-articles/
│   │   ├── air-intake-systems.md
│   │   ├── lube-oil-systems.md
│   │   ├── fuel-systems.md
│   │   ├── cabin-safety-systems.md
│   │   ├── hydraulic-systems.md
│   │   └── compressed-air-systems.md
│   ├── contamination-articles/
│   │   ├── diesel-water-contamination.md
│   │   ├── particle-wear-engines.md
│   │   └── hydraulic-system-contamination.md
│   ├── fleet-articles/
│   │   ├── reducing-fleet-downtime.md
│   │   ├── filtration-fuel-efficiency.md
│   │   └── total-cost-ownership.md
│   ├── bridge-articles/
│   │   ├── industrial-filtration-selection.md
│   │   ├── aftermarket-selection.md
│   │   ├── fleet-solutions.md
│   │   └── oem-replacement.md
│   └── compare-articles/
│       ├── system-vs-commodity.md
│       ├── evaluation-framework.md
│       ├── oem-comparison.md
│       └── total-cost-ownership-analysis.md
│
├── 09-part-search/
│   ├── _SKU-INDEX.md                # Machine-readable SKU registry header
│   ├── sku-registry/
│   │   └── [auto-generated from catalogue]
│   ├── oem-cross-reference/
│   │   └── [OEM part number → ELIMFILTERS SKU mappings]
│   └── application-guides/
│       └── [equipment model → recommended filter set]
│
└── 10-ai-retrieval/
    ├── _CANONICAL-KNOWLEDGE-INDEX.md  # Master list of all canonical blocks
    ├── canonical-blocks/
    │   ├── lube-oil-filtration.md
    │   ├── air-intake-filtration.md
    │   ├── fuel-water-contamination.md
    │   ├── hydraulic-contamination-control.md
    │   ├── compressed-air-purity.md
    │   └── cabin-air-protection.md
    └── retrieval-queries/
        └── dataview-queries.md        # Templated Dataview queries for AI lookup
```

**Total note count at full implementation:** ~200 notes

---

## 3. YAML Frontmatter Schemas

All notes begin with a YAML frontmatter block. The sync layer reads and writes these blocks. Note body text below the frontmatter is editorial and not parsed by any script.

### 3.1 Technology Note Schema

```yaml
---
# ── IDENTITY (synced ↔ unified-data.ts) ─────────────────────────────────────
type: technology
key: MACROCORE
name: "MACROCORE™"
slug: macrocore
status: active                          # active | deprecated | ecosystem
domain: Air Intake                      # SystemDomain enum value
category: Air Filtration
tagline: "Progressive Density Gradient Air Protection"
logo_file: logo-macrocore.png

# ── COMPARISON DATA (synced ↔ unified-data.ts) ───────────────────────────────
comparison_function: "Progressive density gradient intake protection"
comparison_metric: "99.9%–99.98% efficiency · ISO 5011"
comparison_industries: [Mining, Agriculture, Construction, Power Gen]

# ── RELATIONSHIPS (synced ↔ unified-data.ts) ─────────────────────────────────
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

# ── DISPLAY METADATA (synced ↔ catalogue.json → future UD.displayMetadata) ──
catalogue_title: "MACROCORE™"
catalogue_subtitle: "Progressive Density Gradient"
catalogue_description: "Multi-layer air filtration rated ISO 5011..."
catalogue_features:
  - "Progressive Density Gradient (PDG) architecture"
  - "99.9%–99.98% filtration efficiency"
  - "62 PSI anti-collapse rating"
  - "ISO 5011 certified performance"
catalogue_stats:
  percentages: ["99.98%", "62 PSI"]
  ratings: ["ISO 5011", "120°C"]
catalogue_cta: "Find My MACROCORE™ Filter"

# ── GEO DEFINITION (synced ↔ unified-data.ts.geoDefinition) ─────────────────
geo_definition: >
  MACROCORE™ is a Progressive Density Gradient (PDG) multi-layer air
  filtration system rated to ISO 5011 standards...

# ── PAGE GENERATION ─────────────────────────────────────────────────────────
generate_page: true
page_route: /technologies/macrocore
page_template: TechDetailPage

# ── AI CITATION ──────────────────────────────────────────────────────────────
canonical_block: "[[10-ai-retrieval/canonical-blocks/air-intake-filtration]]"
citation_version: "1.0"
last_updated: 2026-06-03

# ── OBSIDIAN METADATA ────────────────────────────────────────────────────────
tags: [technology, active, air-intake, iso-5011]
aliases: [MACROCORE, macrocore, "Progressive Density Gradient Filter"]
---
```

**Deprecated technology additions:**
```yaml
status: deprecated
replaced_by: HYDROCORE                  # TechnologyKey
replaced_by_name: "HYDROCORE™"
deprecated_date: "2024-Q4"
sunset_note: "Replaced by HYDROCORE™ turbine-stage architecture"
```

**Ecosystem addition:**
```yaml
status: ecosystem
program_type: "Fleet Maintenance Program"
```

---

### 3.2 Standard Note Schema

```yaml
---
type: standard
key: ISO_16889
code: "ISO 16889"
name: "Multi-Pass Filter Test Method"
slug: iso-16889
criticality: PRIMARY                    # PRIMARY | SECONDARY

description: >
  Beta ratio test method for hydraulic and lube oil filter elements —
  establishes filtration efficiency (β) and dirt-holding capacity under
  multi-pass conditions.

# ── APPLICABILITY ────────────────────────────────────────────────────────────
applicable_to_technologies:
  - MACROCORE
  - NANOFORCE
  - MICROKAPPA
  - SYNTRAX
  - HYDROCORE
applicable_domains:
  - Hydraulic
  - Lubrication
  - Air Intake

# ── SCOPE CLASSIFICATION ─────────────────────────────────────────────────────
body: ISO                               # ISO | SAE | ASTM | NFPA | DIN | ANSI
specification_type: test_method         # test_method | cleanliness_code | product_spec | measurement_method
target_fluid: [hydraulic_oil, lube_oil]
particle_threshold_microns: [4, 6, 14]

# ── PAGE GENERATION ─────────────────────────────────────────────────────────
generate_page: true
page_route: /knowledge-system/standards/iso-16889
page_template: StandardDetailPage

# ── OBSIDIAN METADATA ────────────────────────────────────────────────────────
tags: [standard, primary, hydraulic, lubrication, iso]
aliases: ["ISO 16889", "Multi-Pass Test", "Beta Ratio Standard"]
---
```

---

### 3.3 Industry Note Schema

```yaml
---
type: industry
key: AGRICULTURE
name: Agriculture
slug: agriculture
contamination_exposure: HIGH            # ExposureLevel enum

# ── CONTEXT ──────────────────────────────────────────────────────────────────
operating_conditions:
  environment: "High dust, outdoor year-round"
  temperature: "-20°C to +50°C"
  storage_method: "Open air, seasonal"
  main_issue: "Harvest dust ingestion and fuel water contamination"

# ── RELATIONSHIPS ─────────────────────────────────────────────────────────────
primary_equipment:
  - "Agricultural tractors"
  - "Combine harvesters"
  - "Grain handling equipment"
  - "Irrigation pumps"
relevant_contamination:
  - PARTICLE_WEAR
  - DIESEL_WATER
applicable_technologies:
  - MACROCORE
  - SYNTRAX
  - HYDROCORE
  - NANOFORCE
applicable_standards:
  - ISO_5011
  - SAE_J1539
  - ISO_16889
  - ASTM_D6304

# ── DISPLAY METADATA ─────────────────────────────────────────────────────────
catalogue_title: "Agriculture"
catalogue_description: "Protecting harvesting equipment from dust, moisture, and particulate contamination..."
catalogue_features:
  - "Air intake protection for harvest dust"
  - "Fuel water separation for storage conditions"
  - "Hydraulic contamination control"
catalogue_statistic: "+40%"
catalogue_statistic_source: "Service life extension through system approach"
catalogue_cta: "Explore Agriculture Solutions"

# ── PAGE GENERATION ──────────────────────────────────────────────────────────
generate_page: true
page_route: /industries/agriculture
page_template: IndustryPage

# ── OBSIDIAN METADATA ────────────────────────────────────────────────────────
tags: [industry, high-exposure, agricultural]
---
```

---

### 3.4 Contamination Mode Note Schema

```yaml
---
type: contamination
key: PARTICLE_WEAR
name: "Particle Wear in Engines"
slug: particle-wear

description: >
  Abrasive wear mechanism where hard particles — silica, metal oxides,
  combustion byproducts — circulate through oil and fuel systems, cutting
  bearing surfaces and piston ring interfaces at the micron level.

# ── MECHANISM ────────────────────────────────────────────────────────────────
root_causes:
  - "Air intake bypass allowing atmospheric dust ingestion"
  - "Degraded filter media with reduced efficiency"
  - "Internal combustion generating soot and metal wear debris"
  - "Oil oxidation producing abrasive polymer aggregates"
failure_modes:
  - "Two-body abrasive wear on cylinder walls"
  - "Three-body abrasive wear in bearing raceways"
  - "Ring sticking from deposit accumulation"
  - "Valve guide wear increasing crankcase blow-by"

# ── QUANTIFIED IMPACTS ───────────────────────────────────────────────────────
impacts:
  oil_consumption: "+15–40% increase from wear particle acceleration"
  fuel_economy: "-5–12% degradation from friction increase"
  compression_pressure: "-10–25% drop from ring sticking"
  engine_blowby: "+5–10% increase"
  bearing_life_reduction: "From 15,000+ hrs to 2,000–3,000 hrs in severe cases"

# ── RESOLUTION ───────────────────────────────────────────────────────────────
resolved_by:
  - MACROCORE
  - NANOFORCE
  - SYNTRAX
related_standards:
  - ISO_16889
  - ISO_4406
  - ISO_5011

# ── FAILURE CHAIN ────────────────────────────────────────────────────────────
failure_chain: >
  Particles > 5µm enter oil → embed in bearing surfaces → abrasive
  cutting of opposing metal → clearance growth → metal-to-metal contact
  → bearing seizure within 100–200 hrs of contaminated operation

# ── PAGE GENERATION ──────────────────────────────────────────────────────────
generate_page: true
page_route: /knowledge-system/contamination/particle-wear
page_template: ContaminationDetailPage

# ── OBSIDIAN METADATA ────────────────────────────────────────────────────────
tags: [contamination, particle, wear, engine, high-severity]
---
```

---

### 3.5 Product System Note Schema

```yaml
---
type: system
key: AIRFILTER
name: "Air Filter"
slug: airfilter
domain: Air Intake

# ── TECHNOLOGY MAPPING ───────────────────────────────────────────────────────
primary_technology: MACROCORE
supporting_technologies: []

# ── PROTECTION DOMAIN ────────────────────────────────────────────────────────
protection_domain: AIR_INTAKE_DOMAIN    # Links to protection-domains note

# ── DISPLAY METADATA ─────────────────────────────────────────────────────────
catalogue_title: "Air Filter Systems"
catalogue_subtitle: "Air Intake & Combustion Protection"
catalogue_description: "Multi-layer progressive density air filtration..."
catalogue_features:
  - "ISO 5011 certified performance"
  - "Progressive Density Gradient media"
  - "62 PSI collapse resistance"
catalogue_cta: "Find My Air Filter"

# ── PAGE GENERATION ──────────────────────────────────────────────────────────
generate_page: true
page_route: /systems/airfilter
page_template: SystemDetailPage

# ── OBSIDIAN METADATA ────────────────────────────────────────────────────────
tags: [system, air-intake, product-system]
---
```

---

### 3.6 Protection Domain Note Schema

```yaml
---
type: protection_domain
key: AIR_INTAKE_DOMAIN
number: "01"
name: "Air Intake & Airflow Protection"
headline: "COMBUSTION & PNEUMATIC SYSTEM INTEGRITY"
slug: air-intake-domain

# ── EDITORIAL CONTENT ────────────────────────────────────────────────────────
description: >
  Internal combustion engines depend on precisely measured, contaminant-free
  air entering the combustion chamber. The air intake protection domain
  covers filtration systems that remove particulate contamination from
  combustion air, pneumatic supply air, and pressurised air circuits...

# ── DOMAIN STRUCTURE ─────────────────────────────────────────────────────────
contaminants:
  - "Atmospheric dust (5–500 mg/m³)"
  - "Pollen and organic particulate"
  - "Soil particles and silica"
  - "Intake system generated debris"
representative_equipment:
  - "Agricultural tractors and harvesters"
  - "Mining extraction equipment"
  - "Construction excavators and graders"
  - "Stationary power generation engines"
industries:
  - AGRICULTURE
  - CONSTRUCTION
  - MINING
  - OIL_GAS
  - RAILWAY
  - POWER_GENERATION
  - BUS_COACH

# ── TECHNOLOGY FAMILIES ──────────────────────────────────────────────────────
technology_families:
  - key: MACROCORE
    label: "Heavy-Duty Air Elements"
    description: "Progressive density gradient media for extreme dust environments"
  - key: SYNTEPORE
    label: "Marine & Humid Environment Intake"
    description: "All-synthetic construction for moisture-exposed intake systems"
  - key: INTEKCORE
    label: "High-Pressure Housing Systems"
    description: "Pressurised housing with integrated bypass mechanisms"
  - key: DRYCORE
    label: "Compressed Air Treatment"
    description: "Molecular sieve drying for compressed air distribution"

# ── PAGE GENERATION ──────────────────────────────────────────────────────────
generate_page: false                    # Domain is rendered as a section in systems/page.tsx
display_in: /systems

# ── OBSIDIAN METADATA ────────────────────────────────────────────────────────
tags: [protection-domain, air-intake]
---
```

---

### 3.7 Component Note Schema

```yaml
---
type: component
key: PROGRESSIVE_DENSITY_GRADIENT
name: "Progressive Density Gradient Media"
slug: progressive-density-gradient
component_class: filter_media           # filter_media | housing | bypass_mechanism | seal

# ── TECHNICAL SPECIFICATION ──────────────────────────────────────────────────
description: >
  Multi-layer filtration media architecture where outer layers capture
  large particles while progressively denser inner zones intercept
  sub-micron threats. Prevents media blinding by distributing particle
  loading across depth rather than concentrating on the outer surface.

operating_principle: depth_filtration
particle_size_range: "5–25 microns effective"
efficiency_range: "99.9%–99.98%"
applicable_fluids: [air, hydraulic_oil, lube_oil]

# ── USED BY ──────────────────────────────────────────────────────────────────
used_in_technologies:
  - MACROCORE
  - NANOFORCE

# ── OBSIDIAN METADATA ────────────────────────────────────────────────────────
tags: [component, filter-media, depth-filtration]
generate_page: false
---
```

---

### 3.8 Problem Note Schema

```yaml
---
type: problem
key: INJECTOR_STICTION
name: "Injector Stiction"
slug: injector-stiction
severity: HIGH                          # CRITICAL | HIGH | MEDIUM | LOW
domain: Fuel Cleanliness

# ── PROBLEM DEFINITION ───────────────────────────────────────────────────────
description: >
  Fuel injector needle valve seizes in its bore due to corrosion deposits,
  water contamination, or particle accumulation at 1–3 micron clearances.
  The needle cannot respond to electrical command, causing incorrect fuel
  delivery timing and quantity.

# ── CAUSE CHAIN ──────────────────────────────────────────────────────────────
root_contamination:
  - DIESEL_WATER
  - PARTICLE_WEAR
cause_chain: >
  Water droplets enter injector body → iron oxide corrosion products form
  at 1–3µm clearance surfaces → deposits increase spool friction from
  baseline → needle locks in position → injection timing and quantity
  deviation → rough idle, hard start, increased fuel consumption

# ── MEASURABLE THRESHOLD ─────────────────────────────────────────────────────
trigger_threshold: "> 500 ppm water content in fuel"
measurable_by:
  - ASTM_D6304
  - ISO_12937
operational_impact: "+3–8% fuel consumption, +5–15 sec hard-start time"

# ── RESOLUTION PATH ──────────────────────────────────────────────────────────
resolved_by_technologies:
  - HYDROCORE
  - NANOFORCE
relevant_standards:
  - ASTM_D6304
  - ISO_12937
  - ASTM_D975

# ── LINKS ────────────────────────────────────────────────────────────────────
related_problems:
  - "[[07-problems/engine-failures/bearing-seizure]]"
  - "[[07-problems/operational-failures/unplanned-downtime]]"
parent_contamination: "[[05-contamination/DIESEL_WATER]]"

# ── OBSIDIAN METADATA ────────────────────────────────────────────────────────
tags: [problem, injector, fuel-system, high-severity]
generate_page: false
---
```

---

### 3.9 SKU Note Schema (Part Search)

```yaml
---
type: sku
sku: "EF-MCR-4801"
product_name: "MACROCORE™ Air Element — Heavy Duty"
technology: MACROCORE
system: AIRFILTER
domain: Air Intake

# ── OEM CROSS-REFERENCE ──────────────────────────────────────────────────────
oem_references:
  - oem: Donaldson
    part: "P181017"
  - oem: Fleetguard
    part: "AF25552"
  - oem: Mann
    part: "C 25 114/3"

# ── APPLICATION ──────────────────────────────────────────────────────────────
equipment_applications:
  - make: Caterpillar
    model: "320 Excavator"
    engine: "C7.1 ACERT"
    position: primary_air
  - make: John Deere
    model: "8370R Tractor"
    engine: "PowerTech PSX 9.0L"
    position: primary_air

# ── SPECIFICATION ────────────────────────────────────────────────────────────
filter_type: air_element
media_type: progressive_density_gradient
efficiency: "99.98% at 5µm"
collapse_pressure: "62 PSI"
service_interval_hours: 500
dimensions:
  od_mm: 248
  id_mm: 130
  length_mm: 470

# ── PART SEARCH METADATA ─────────────────────────────────────────────────────
searchable_terms: [air filter, air element, heavy duty, MACROCORE, MCR-4801]
part_search_active: true

# ── OBSIDIAN METADATA ────────────────────────────────────────────────────────
tags: [sku, macrocore, air-filter, active]
generate_page: false
---
```

---

### 3.10 Knowledge Base Article Note Schema

```yaml
---
type: kb_article
key: air-intake-systems
title: "Air Intake Filtration Systems"
slug: air-intake-systems
section: standards                      # standards | contamination | fleet | bridge | compare
url: /knowledge-system/standards/air-intake-systems

# ── KNOWLEDGE LINKS ───────────────────────────────────────────────────────────
primary_standards:
  - ISO_5011
  - SAE_J1539
  - ANSI_B132_1
primary_technologies:
  - MACROCORE
primary_contamination:
  - PARTICLE_WEAR
relevant_industries:
  - AGRICULTURE
  - CONSTRUCTION
  - MINING

# ── AI CITATION ──────────────────────────────────────────────────────────────
canonical_block: "[[10-ai-retrieval/canonical-blocks/air-intake-filtration]]"
citation_version: "1.2"
last_updated: 2026-06-03

# ── PAGE GENERATION ──────────────────────────────────────────────────────────
generate_page: true
page_template: KnowledgeSystemStandardsPage

# ── OBSIDIAN METADATA ────────────────────────────────────────────────────────
tags: [kb-article, standards, air-intake]
---
```

---

## 4. Entity Relationships

### 4.1 Relationship Map

The following relationships are expressed as **wikilinks** in note bodies and as **YAML arrays** in frontmatter. Wikilinks create graph edges in Obsidian's graph view.

```
TECHNOLOGY ──addresses──────▶ CONTAMINATION
TECHNOLOGY ──complies_with──▶ STANDARD
TECHNOLOGY ──protects────────▶ INDUSTRY
TECHNOLOGY ──is_used_in──────▶ SYSTEM
TECHNOLOGY ──replaces────────▶ TECHNOLOGY (deprecated chain)
TECHNOLOGY ──uses────────────▶ COMPONENT

STANDARD ──applies_to────────▶ TECHNOLOGY
STANDARD ──governs───────────▶ CONTAMINATION (measurement)
STANDARD ──referenced_by─────▶ KB_ARTICLE

CONTAMINATION ──resolved_by──▶ TECHNOLOGY
CONTAMINATION ──measured_by──▶ STANDARD
CONTAMINATION ──causes───────▶ PROBLEM
CONTAMINATION ──affects──────▶ INDUSTRY

INDUSTRY ──experiences───────▶ CONTAMINATION
INDUSTRY ──uses──────────────▶ TECHNOLOGY
INDUSTRY ──requires──────────▶ STANDARD

SYSTEM ──anchors─────────────▶ TECHNOLOGY (primary)
SYSTEM ──supports────────────▶ TECHNOLOGY (supporting)
SYSTEM ──belongs_to──────────▶ PROTECTION_DOMAIN

PROTECTION_DOMAIN ──covers───▶ SYSTEM
PROTECTION_DOMAIN ──targets──▶ CONTAMINATION
PROTECTION_DOMAIN ──deploys──▶ TECHNOLOGY

PROBLEM ──caused_by──────────▶ CONTAMINATION
PROBLEM ──resolved_by────────▶ TECHNOLOGY
PROBLEM ──measured_by────────▶ STANDARD

SKU ──implements─────────────▶ TECHNOLOGY
SKU ──fits───────────────────▶ SYSTEM
SKU ──cross_references───────▶ SKU (OEM→ELIMFILTERS)

KB_ARTICLE ──covers──────────▶ STANDARD
KB_ARTICLE ──references──────▶ TECHNOLOGY
KB_ARTICLE ──explains────────▶ CONTAMINATION
KB_ARTICLE ──targets─────────▶ INDUSTRY
```

### 4.2 Wikilink Conventions

Within the body text of each note, wikilinks follow these conventions:

```markdown
## Relationships

Addresses contamination: [[PARTICLE_WEAR|Particle Wear in Engines]]
Complies with standard: [[ISO_5011|ISO 5011 — Air Filter Performance Test]]
Protects industries: [[AGRICULTURE|Agriculture]], [[MINING|Mining]]
Component technology: [[progressive-density-gradient|Progressive Density Gradient Media]]
OEM cross-reference: [[EF-MCR-4801]] replaces [[Donaldson P181017]]
```

Obsidian parses these as graph edges regardless of the display alias after the pipe. All wikilinks resolve to the target note's filename.

---

## 5. Graph Relationships

The Obsidian graph view produces a force-directed network graph from all wikilinks across the vault. The following clusters emerge from this architecture:

### 5.1 Expected Graph Clusters

**Cluster 1 — Air Intake Hub**
Central nodes: `MACROCORE`, `SYNTEPORE`, `INTEKCORE`
Connected: `PARTICLE_WEAR`, `ISO_5011`, `SAE_J1539`, `AGRICULTURE`, `MINING`, `CONSTRUCTION`, `air-intake-systems (KB)`

**Cluster 2 — Fuel & Water Hub**
Central nodes: `HYDROCORE`, `AQUAGUARD` (deprecated, still linked)
Connected: `DIESEL_WATER`, `ASTM_D6304`, `ISO_12937`, `MARINE`, `OIL_GAS`, `fuel-systems (KB)`, all injector problem notes

**Cluster 3 — Hydraulic Hub**
Central nodes: `NANOFORCE`, `DIN_51524`, `NFPA_T214`, `ISO_16889`
Connected: `HYDRAULIC_CONTAMINATION`, `proportional-valve-stiction (problem)`, `MANUFACTURING`, `MINING`

**Cluster 4 — Lubrication Hub**
Central nodes: `SYNTRAX`, `ISO_16889`, `ISO_4406`
Connected: `PARTICLE_WEAR`, `bearing-seizure (problem)`, `TRUCKS_FLEETS`, `RAILWAY`, `lube-oil-systems (KB)`

**Cluster 5 — Cabin & Environmental Hub**
Central nodes: `MICROKAPPA`, `THERMOCORE`, `ISO_11155`, `DIN_71220`
Connected: `CABIN_AIR_CONTAMINATION`, `COOLANT_CONTAMINATION`, `operator-health-exposure (problem)`, `BUS_COACH`

**Cluster 6 — Compressed Air Hub**
Central nodes: `DRYCORE`, `ISO_8573_1` through `ISO_8573_4`
Connected: `COMPRESSED_AIR_MOISTURE`, `MANUFACTURING`, `OIL_GAS`

### 5.2 Graph Filter Presets (Obsidian Groups)

Define the following color/filter groups in `.obsidian/graph.json`:

| Group | Filter Expression | Color |
|-------|-------------------|-------|
| Active Technologies | `tag:#technology AND tag:#active` | Yellow `#FFF12D` |
| Deprecated Technologies | `tag:#technology AND tag:#deprecated` | Orange `#FF8C00` |
| Standards | `tag:#standard` | Blue `#4A90D9` |
| Contamination | `tag:#contamination` | Red `#E74C3C` |
| Industries | `tag:#industry` | Green `#27AE60` |
| Problems | `tag:#problem` | Dark Red `#8B0000` |
| KB Articles | `tag:#kb-article` | Purple `#9B59B6` |
| SKU / Part Search | `tag:#sku` | Grey `#95A5A6` |

---

## 6. Export Strategy

**Direction: Obsidian → unified-data.ts**
Obsidian is the editorial master. The sync script reads YAML frontmatter and writes TypeScript.

### 6.1 Sync Script Architecture

```
vault-to-ts/
├── parse-vault.ts          # Reads all note frontmatter via gray-matter
├── validate-schema.ts      # Validates YAML fields against TS interfaces
├── generate-unified.ts     # Writes unified-data.ts from validated data
├── generate-catalogue.ts   # Writes catalogue.json from display metadata
└── diff-report.ts          # Reports what changed vs previous export
```

### 6.2 Sync Script: parse-vault.ts

```typescript
// Pseudocode — architecture only
import matter from 'gray-matter';
import { readdir, readFile } from 'fs/promises';

interface VaultNote {
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

async function parseVault(vaultPath: string): Promise<VaultNote[]> {
  const notes: VaultNote[] = [];
  for (const file of await findMarkdownFiles(vaultPath)) {
    const content = await readFile(file, 'utf-8');
    const { data, content: body } = matter(content);
    notes.push({ path: file, frontmatter: data, body });
  }
  return notes;
}
```

### 6.3 Export Field Mapping

| Obsidian YAML field | unified-data.ts field | Type |
|---------------------|-----------------------|------|
| `key` | `TechnologyKey` (index) | string |
| `name` | `UnifiedTechnology.name` | string |
| `slug` | `UnifiedTechnology.slug` | string |
| `domain` | `UnifiedTechnology.domain` | `SystemDomain` |
| `logo_file` | `UnifiedTechnology.logoFile` | string |
| `category` | `UnifiedTechnology.category` | string |
| `tagline` | `UnifiedTechnology.tagline` | string |
| `geo_definition` | `UnifiedTechnology.geoDefinition` | string |
| `comparison_function` | `UnifiedTechnology.comparisonFunction` | string |
| `comparison_metric` | `UnifiedTechnology.comparisonMetric` | string |
| `comparison_industries` | `UnifiedTechnology.comparisonIndustries` | string (joined) |
| `applicable_industries` | `UnifiedTechnology.applicableIndustries` | `IndustryKey[]` |
| `related_standards` | `UnifiedTechnology.relatedStandards` | `StandardKey[]` |
| `addresses_contamination` | `UnifiedTechnology.addressesContamination` | `ContaminationKey[]` |
| `key_metrics` | `UnifiedTechnology.keyMetrics` | `Record<string,string>` |

### 6.4 Validation Rules (enforced before export)

- All `applicable_industries` values must be valid `IndustryKey` members
- All `related_standards` values must exist as note keys in `04-standards/`
- All `addresses_contamination` values must exist as note keys in `05-contamination/`
- `slug` must match `[a-z0-9-]+` and be unique across all technology notes
- `generate_page: true` notes must have `page_route` and `page_template`
- No orphaned `status: deprecated` notes without a `replaced_by` pointing to an `active` note

---

## 7. Synchronization Strategy

### 7.1 Bidirectional Sync Model

```
                    ┌─────────────────────┐
                    │   Obsidian Vault     │
                    │  (Editorial Master)  │
                    └─────────┬───────────┘
                              │
              ┌───────────────┴───────────────┐
              │ sync layer (Node.js scripts)  │
              │  vault-to-ts   │  ts-to-vault  │
              └───────┬────────┴────────┬──────┘
                      │                 │
          ┌───────────▼──────┐  ┌───────▼───────────┐
          │  unified-data.ts  │  │  catalogue.json    │
          │  (Runtime SSoT)   │  │  (Page metadata)   │
          └───────────┬───────┘  └────────┬───────────┘
                      │                   │
          ┌───────────▼───────────────────▼───────────┐
          │          Next.js Build                     │
          │          (89+ static pages)                │
          └────────────────────────────────────────────┘
```

### 7.2 Sync Triggers

| Trigger | Direction | Script | When |
|---------|-----------|--------|------|
| Editor saves note | Vault → TS | `vault-to-ts` | On `post-save` hook in Obsidian |
| `npm run sync:pull` | TS → Vault | `ts-to-vault` | Manual — developer updates TS, pulls to vault |
| `npm run sync:push` | Vault → TS | `vault-to-ts` | CI pre-build step |
| `npm run sync:validate` | Both | `validate-schema` | Pre-commit hook |

### 7.3 Conflict Resolution Policy

| Conflict | Winner | Rationale |
|----------|--------|-----------|
| Structural field edited in both | unified-data.ts wins | Code changes are version-controlled and reviewed |
| Editorial content edited in both | Obsidian wins | Body text and display metadata owned by editors |
| New entity added in Obsidian | Vault wins | New entity creation is an editorial action |
| New entity added in TS code | TS wins; propagates to vault | Structural additions by engineers |
| Key renamed | Manual resolution required | Key changes are breaking — require explicit migration |

### 7.4 ts-to-vault Script (Pull Direction)

Generates or updates Obsidian notes from `unified-data.ts`:
1. For each entity in UD, find or create the corresponding note
2. Update **only YAML frontmatter fields** that have a UD equivalent
3. **Never overwrite** YAML fields that exist only in Obsidian (display metadata, editorial fields)
4. **Never touch** the note body below the frontmatter
5. Add `_sync_source: unified-data.ts` and `_synced_at: [timestamp]` metadata

---

## 8. Page Generation Opportunities

The following note types with `generate_page: true` map to Next.js routes:

### 8.1 Current Routes (89 pages)

| Note type | Page template | Route pattern | Count |
|-----------|--------------|---------------|-------|
| Technology (active/deprecated/ecosystem) | `TechDetailPage` | `/technologies/[slug]` | 12 |
| System | `SystemDetailPage` | `/systems/[slug]` | 12 |
| Industry | `IndustryPage` | `/industries/[slug]` | 12 |
| KB standards article | `KnowledgeStandardsPage` | `/knowledge-system/standards/[slug]` | 6 |
| KB contamination article | `KnowledgeContaminationPage` | `/knowledge-system/contamination/[slug]` | 3 |
| KB fleet article | `KnowledgeFleetPage` | `/knowledge-system/fleet/[slug]` | 3 |
| Bridge article | `KnowledgeBridgePage` | `/knowledge-system/bridges/[slug]` | 4 |
| Compare article | `KnowledgeComparePage` | `/knowledge-system/compare/[slug]` | 5 |
| Dedicated standard | `StandardDetailPage` | `/knowledge-system/standards/[code-slug]` | 3 (iso-16889, iso-4406, iso-5011) |

### 8.2 New Pages Unlocked by Vault Expansion

| New note type | Route pattern | Estimated count |
|---------------|--------------|-----------------|
| Additional dedicated standard pages | `/knowledge-system/standards/[code-slug]` | +9 (all 23 standards) |
| Contamination mode detail pages (3 missing) | `/knowledge-system/contamination/[slug]` | +3 (compressed-air-moisture, coolant-contamination, cabin-air-contamination) |
| Problem detail pages | `/knowledge-system/problems/[slug]` | +8–12 |
| Component detail pages | `/knowledge-system/components/[slug]` | +6–10 |
| Part Search application guides | `/part-search/[equipment-slug]` | +20–50 |
| Industry × technology intersection pages | `/industries/[industry]/[technology]` | +30–40 |

### 8.3 Page Generation Data Flow

```
Obsidian note (YAML frontmatter)
  → vault-to-ts script
    → unified-data.ts (structural fields)
    → catalogue.json (display metadata)
      → Next.js getStaticPaths() (reads catalogue.json)
        → getStaticProps() (reads unified-data.ts)
          → React page component (renders final HTML)
            → /out/[slug]/index.html (static export)
```

The Obsidian vault becomes the **single authoring action** that triggers the entire downstream page generation chain.

---

## 9. AI Retrieval Opportunities

### 9.1 Canonical Knowledge Block Architecture

Each canonical block note (in `10-ai-retrieval/canonical-blocks/`) follows the machine-readable format defined in CLAUDE.md AI Citation Layer. The vault enforces this structure through the `tpl-canonical-block.md` template:

```markdown
---
type: canonical_block
concept: "Air Intake Filtration"
version: "1.0"
last_updated: 2026-06-03
source_url: "elimfilters.com/knowledge-system/standards/air-intake-systems"
related_notes:
  - "[[01-technologies/active/MACROCORE]]"
  - "[[04-standards/primary/ISO_5011]]"
  - "[[05-contamination/PARTICLE_WEAR]]"
---

CANONICAL KNOWLEDGE BLOCK: Air Intake Filtration

DEFINITION
[One technical sentence — no marketing language]

SYSTEMS
[Comma-separated list of applicable industrial systems]

FAILURE_IMPACT
[Root cause → consequence chain]
Operational Impact: [Quantified metric]

RELATED_STANDARDS
[Code]: [Scope], [Code]: [Scope]

RELATED_TECHNOLOGIES
[TECHNOLOGY]: [Control mechanism]

INDUSTRIAL_ROLE
[One sentence on equipment reliability and TCO significance]

CITATION_REFERENCE
source: elimfilters.com/knowledge-system/[path]
concept: [Concept Name]
version: 1.0
last_updated: [YYYY-MM-DD]
```

### 9.2 AI Citation Index

`10-ai-retrieval/_CANONICAL-KNOWLEDGE-INDEX.md` serves as a machine-readable registry that LLMs can parse to discover available definitions:

```markdown
---
type: citation_index
total_concepts: 23
last_updated: 2026-06-03
---

## ELIMFILTERS CANONICAL KNOWLEDGE INDEX

| concept | version | url | last_updated |
|---------|---------|-----|--------------|
| Air Intake Filtration | 1.0 | elimfilters.com/... | 2026-06-03 |
| Lube Oil Filtration | 1.2 | elimfilters.com/... | 2026-06-03 |
| Fuel Water Contamination | 1.1 | elimfilters.com/... | 2026-06-03 |
...
```

### 9.3 Dataview Queries for AI Retrieval

The Obsidian Dataview plugin enables live relational queries across the vault. These serve two purposes: (a) editorial verification during authoring, and (b) data export for AI retrieval pipelines.

```dataview
// All technologies that resolve PARTICLE_WEAR:
TABLE name, domain, comparison_metric
FROM "01-technologies"
WHERE contains(addresses_contamination, "PARTICLE_WEAR")
SORT domain ASC
```

```dataview
// Standards missing from unified-data.ts:
TABLE code, criticality, applicable_domains
FROM "04-standards"
WHERE !contains(file.tags, "in-unified-data")
SORT criticality DESC
```

```dataview
// Canonical blocks coverage check:
TABLE concept, version, last_updated
FROM "10-ai-retrieval/canonical-blocks"
SORT concept ASC
```

### 9.4 LLM Query Pathway

```
LLM Query: "What ELIMFILTERS technology addresses fuel water contamination?"
  ↓
Step 1: Query citation index for relevant concept
  → matches "Fuel Water Contamination" canonical block
Step 2: Parse canonical block RELATED_TECHNOLOGIES
  → returns HYDROCORE: turbine-stage water separation
Step 3: Follow wikilink to [[HYDROCORE]] note
  → returns full technical specification
Step 4: Cross-reference [[DIESEL_WATER]] contamination note
  → returns failure chain and impact metrics
Step 5: Return structured citation with version and source URL
```

### 9.5 Vector Embedding Strategy

Each note type provides specific content for vector embedding:

| Note type | Embed content | Purpose |
|-----------|--------------|---------|
| Technology | `geo_definition` + `tagline` | Technology disambiguation |
| Standard | `description` + `name` | Standards retrieval |
| Contamination | `description` + `failure_chain` | Problem → solution matching |
| KB Article (body) | Full body text | Semantic search |
| Canonical Block | Full block content | Citation-quality retrieval |
| Problem | `cause_chain` + `operational_impact` | Symptom → diagnosis |

Embedding pipeline:
```
Vault notes → vault-to-embeddings.ts → vector store (e.g., Pinecone/Chroma)
                                         → AI retrieval API endpoint
                                           → /api/knowledge-search
```

---

## 10. Part Search Integration Opportunities

### 10.1 Knowledge Graph → SKU Traversal

The vault graph enables multi-hop traversal from problem to part number:

```
User reports: "Hard starting in marine diesel"
  ↓
Problem node: [[injector-stiction]]
  ↓ caused_by
Contamination node: [[DIESEL_WATER]]
  ↓ resolved_by
Technology node: [[HYDROCORE]]
  ↓ implemented_by
System node: [[WATER]] (Fuel Water Separator)
  ↓ has_skus
SKU nodes: EF-HYD-9001, EF-HYD-9002 ...
  ↓ equipment_applications
Filter: equipment make/model matches user's vessel
  ↓
Result: EF-HYD-9001 — HYDROCORE™ Marine Fuel Water Separator
        OEM cross-ref: Racor 500FG, Parker FFB-900
```

### 10.2 Part Search Data Model in Vault

Each SKU note in `09-part-search/sku-registry/` provides the full attribute set for the Part Search API:

```
/api/search?q=P181017
  → Look up OEM reference "P181017" in SKU notes with matching oem_references[]
  → Return EF-MCR-4801 with technology=MACROCORE, applicable equipment list
  → Also return related SKUs (SYNTEPORE variant for marine, INTEKCORE housing option)
```

### 10.3 Application Guide Structure

Application guide notes (`09-part-search/application-guides/`) map equipment models to complete filter sets:

```yaml
---
type: application_guide
equipment_make: Caterpillar
equipment_model: "320 Excavator"
engine: "C7.1 ACERT"
year_range: "2018–present"
protection_systems:
  - system: AIRFILTER
    sku: EF-MCR-4801
    position: primary_air_element
    service_hours: 500
  - system: OIL
    sku: EF-SNX-2201
    position: engine_oil_filter
    service_hours: 500
  - system: HYDRAULIC
    sku: EF-NF-7701
    position: hydraulic_return_filter
    service_hours: 1000
---
```

This becomes the source data for the Part Search `/api/application-guide?make=caterpillar&model=320` endpoint.

### 10.4 OEM Cross-Reference Graph

The vault graph reveals cross-reference clusters that Part Search can traverse:

```
Donaldson P181017
  ↕ cross_references
EF-MCR-4801 (ELIMFILTERS)
  ↕ cross_references  
Fleetguard AF25552
  ↕ cross_references
Mann C 25 114/3
```

Any entry point into this cluster (searching by any OEM number) resolves to the ELIMFILTERS SKU and all equivalent part numbers.

### 10.5 Part Search API Integration Points

| Endpoint | Vault Source | Data |
|----------|-------------|------|
| `GET /api/search?q=[term]` | SKU notes `searchable_terms[]` | SKU + technology + OEM refs |
| `GET /api/oem?part=[number]` | SKU notes `oem_references[]` | ELIMFILTERS equivalent + specs |
| `GET /api/application?make=&model=` | Application guide notes | Complete filter set + service intervals |
| `GET /api/technology/[slug]/skus` | Technology notes + SKU notes | All SKUs for a technology |
| `GET /api/contamination/[slug]/solutions` | Contamination notes → technology → SKU traversal | Problem → SKU path |
| `GET /api/knowledge/[concept]` | AI canonical blocks | Citation-ready knowledge block |

---

## 11. Phase 3 Implementation Sequencing

Based on this blueprint, Phase 3 tasks in recommended order:

| Task | Action | Unlocks |
|------|--------|---------|
| P3-T1 | Create vault folder structure and templates | Authoring surface |
| P3-T2 | Populate technology notes (13 entities) from unified-data.ts | Technology graph cluster |
| P3-T3 | Populate standard notes (add 12 missing StandardKeys) | Full standards coverage |
| P3-T4 | Populate industry notes (12 entities) | Industry relationships |
| P3-T5 | Populate contamination notes (6 entities) | Contamination → technology edges |
| P3-T6 | Populate system notes (12 product + 5 domain) | System graph cluster |
| P3-T7 | Build vault-to-ts sync script | Bidirectional sync |
| P3-T8 | Add `TechPageContent` to unified-data.ts; migrate techPagesData.ts | Eliminates 921-line file |
| P3-T9 | Add `displayMetadata` to unified-data.ts; migrate catalogue.json technologies | Eliminates catalogue.json tech section |
| P3-T10 | Add `UnifiedProtectionDomain`; migrate systems/page.tsx SYSTEMS + TECH_MAP | Eliminates 260-line inline block |
| P3-T11 | Populate component notes; wire to technology notes | Component graph |
| P3-T12 | Populate problem notes; wire to contamination + technology | Symptom → solution traversal |
| P3-T13 | Populate canonical blocks (10-ai-retrieval/) | AI citation layer |
| P3-T14 | Build SKU registry structure; import initial dataset | Part Search foundation |
| P3-T15 | Build application guides for top 20 equipment models | Part Search UX |
| P3-T16 | Build `/api/search` endpoint consuming vault-exported data | Part Search live |

---

## 12. Obsidian Plugin Requirements

| Plugin | Purpose | Required |
|--------|---------|---------|
| **Dataview** | Relational queries, live tables, API for export scripts | Required |
| **Templater** | Note creation with pre-filled YAML schemas | Required |
| **Obsidian Git** | Version control for vault alongside codebase | Required |
| **Tag Wrangler** | Tag management across all entity types | Recommended |
| **Kanban** | Content pipeline tracking (draft → review → published) | Recommended |
| **Breadcrumbs** | Navigate relationship hierarchies (Technology → Standard → Contamination) | Recommended |
| **Strange New Worlds** | Visualise backlink context without opening notes | Recommended |

---

*Architecture document only. No code modified. All implementation tasks require owner authorization.*
