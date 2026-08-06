# PHASE 3B — Entity Schema Implementation Plan
# Obsidian Knowledge Graph: Complete Entity Model

**Date:** 2026-06-03
**Branch:** claude/dazzling-franklin-ALGY1
**Status:** ARCHITECTURE ONLY — No code modifications
**Prerequisite:** Phase 3A complete (commit d42f75c2)

---

## Design Principles

1. **Entity keys are always uppercase with underscores** — identical to TypeScript keys in unified-data.ts wherever an entity corresponds to a UD record. New entities that have no UD counterpart use the same convention for consistency.
2. **YAML is the sync contract** — body text in each note is editorial and is never parsed by automation. The YAML frontmatter block is the only machine-readable surface.
3. **Relationships are always wikilinks** — no raw strings for entity cross-references. Every relationship expressed in YAML uses `[[KEY]]` format; every relationship expressed in body text uses `[[KEY|Display Name]]` format.
4. **`in_unified_data` is tracked per entity** — boolean flag signals whether the entity is already represented in unified-data.ts. False = candidate for a future UD schema extension.
5. **Part Search traversal is the primary structural constraint** — entity relationships must be designed so the graph path `Problem → ContaminationMode → Technology → ProductFamily → Product` is unambiguous and traversable.
6. **AI retrieval blocks are mandatory** — every entity note includes a `## AI Retrieval` section at the bottom with a structured canonical block for LLM citation.

---

## Entity Inventory

| # | Entity Type | Count | In UD? | Key Pattern | Vault Folder |
|---|-------------|-------|--------|-------------|--------------|
| 1 | Industry | 12 | ✅ Full | `AGRICULTURE` | `02-industries/` |
| 2 | System | 12 (product-line) + 5 (protection-domain) | ✅ Partial | `AIRFILTER`, `AIR_INTAKE_DOMAIN` | `03-systems/` |
| 3 | Technology | 9 (active) + 2 (deprecated) + 2 (ecosystem) | ✅ Full | `MACROCORE` | `01-technologies/` |
| 4 | Component | ~40 (estimated) | ❌ None | `FUEL_INJECTOR` | `06-components/` |
| 5 | Problem | ~20 (estimated) | ❌ None | `INJECTOR_STICTION` | `07-problems/` |
| 6 | Standard | 11 (existing) + 12 (additions) = 23 | ✅ Partial | `ISO_16889` | `04-standards/` |
| 7 | Product Family | ~30 (estimated) | ❌ None | `AIRFILTER_PRIMARY` | `08-product-families/` |
| 8 | Product (SKU) | 500k+ (part search DB) | ❌ None | `ELF-AF-001` | `09-products/` |
| 9 | Case Study | 6 (3 contamination + 3 fleet) | ❌ None | `CS_DIESEL_WATER` | `10-case-studies/` |
| 10 | Technical Article | ~20 (standards + compare + science) | ❌ None | `TA_LUBE_OIL_SYSTEMS` | `11-articles/` |

---

## Entity Relationship Map

```
INDUSTRY ─────────────────────────────┐
    │ applicable_technologies           │
    ▼                                  │
TECHNOLOGY ◄──── STANDARD             │
    │ addresses_contamination           │
    ▼                                  │
CONTAMINATION_MODE ◄── PROBLEM ◄──────┘ (user enters here)
    │ resolved_by                      │
    ▼                                  │
TECHNOLOGY                            │
    │ implemented_in                   │
    ▼                                  │
PRODUCT_FAMILY                        │
    │ contains                         │
    ▼                                  │
PRODUCT (SKU) ────── SYSTEM ──────────┘
                          │
                     COMPONENT
                          │
                     STANDARD (test standard for component protection)

CASE_STUDY ──── CONTAMINATION_MODE
              ├── TECHNOLOGY
              ├── INDUSTRY
              └── SYSTEM

TECHNICAL_ARTICLE ──── STANDARD
                    ├── TECHNOLOGY
                    ├── INDUSTRY
                    └── CASE_STUDY
```

### Part Search Traversal Path

```
User Problem Statement
    ↓
PROBLEM (symptom language)
    ↓ maps_to_contamination
CONTAMINATION_MODE (root cause)
    ↓ resolved_by
TECHNOLOGY (control mechanism)
    ↓ implemented_in
PRODUCT_FAMILY (product line)
    ↓ contains
PRODUCT / SKU (purchasable unit)
    ↑
    └── filtered by INDUSTRY + SYSTEM context
```

---

## Entity 1: Industry

### 1.1 YAML Schema

```yaml
---
type: industry
status: active
key: ""                          # IndustryKey from unified-data.ts
name: ""                         # Display name
slug: ""                         # URL slug

# Contamination profile
contamination_exposure: ""       # ExposureLevel: EXTREME | HIGH | MEDIUM-HIGH | MEDIUM | LOW-MEDIUM | LOW
primary_equipment: []            # string[] — representative equipment types
operating_conditions:
  environment: ""
  temperature: ""
  storage_method: ""
  main_issue: ""

# Knowledge graph relationships (wikilinks)
relevant_contamination: []       # [[ContaminationKey|Name]]
applicable_technologies: []      # [[TechnologyKey|Name]]
applicable_standards: []         # [[StandardKey|Code]]
common_problems: []              # [[ProblemKey|Statement]]
typical_product_families: []     # [[ProductFamilyKey|Label]]

# Display metadata (editorial — not synced to UD)
catalogue_title: ""              # from catalogue.json: title
catalogue_subtitle: ""           # from catalogue.json: subtitle
catalogue_description: ""        # from catalogue.json: description
features: []                     # from catalogue.json: features[]
benefits: []                     # from catalogue.json: benefits[]
statistic: ""                    # from catalogue.json: statistic
statistic_source: ""             # from catalogue.json: statisticSource

# UD sync flags
in_unified_data: true
ud_key: ""                       # IndustryKey

# Tags
tags: [industry, active]
---
```

### 1.2 Required Fields

| Field | Type | Constraint |
|-------|------|------------|
| `type` | string | Must be `industry` |
| `key` | string | Must match IndustryKey in unified-data.ts |
| `name` | string | Matches `UnifiedIndustry.name` |
| `slug` | string | URL-safe, matches `UnifiedIndustry.slug` |
| `contamination_exposure` | enum | One of six ExposureLevel values |
| `in_unified_data` | boolean | Always `true` for Industry entities |

### 1.3 Optional Fields

| Field | Type | Notes |
|-------|------|-------|
| `catalogue_title` | string | From catalogue.json — display only |
| `catalogue_subtitle` | string | From catalogue.json — display only |
| `catalogue_description` | string | From catalogue.json — full editorial paragraph |
| `features` | string[] | From catalogue.json — bullet features |
| `benefits` | string[] | From catalogue.json — extended benefits |
| `statistic` | string | From catalogue.json — highlight metric |
| `statistic_source` | string | ISO/SAE source for the statistic |
| `common_problems` | wikilink[] | Links to Problem notes for this industry |
| `typical_product_families` | wikilink[] | Links to ProductFamily notes |

### 1.4 Relationships

| Relationship | Direction | Target Entity | YAML Field |
|--------------|-----------|---------------|------------|
| has relevant contamination | outbound | ContaminationMode | `relevant_contamination` |
| uses applicable technologies | outbound | Technology | `applicable_technologies` |
| governed by standards | outbound | Standard | `applicable_standards` |
| experiences problems | outbound | Problem | `common_problems` |
| uses product families | outbound | ProductFamily | `typical_product_families` |
| referenced in articles | inbound | TechnicalArticle | (backlink via TechnicalArticle) |
| documented in case studies | inbound | CaseStudy | (backlink via CaseStudy) |

### 1.5 Wikilink Standards

**In YAML arrays**: bare key form — `[[AGRICULTURE]]`
**In body text**: full display form — `[[AGRICULTURE|Agriculture — Extreme Dust Exposure]]`
**Display alias convention**: `[[KEY|Industry Name — Exposure Level]]`

Examples:
- `[[AGRICULTURE|Agriculture — Extreme Dust Exposure]]`
- `[[MINING|Mining — Extreme Particulate & Moisture]]`
- `[[MARINE|Marine — Salt & Humidity Exposure]]`

**In Relationships section** (body):
```markdown
## Relationships

### Contamination
- [[PARTICLE_WEAR|Particle Wear in Engines]] — primary contamination mode
- [[DIESEL_WATER|Diesel Water Contamination]] — secondary risk at harvest

### Technologies
- [[MACROCORE|MACROCORE™ — Multi-Stage Depth Filtration]]
- [[SYNTRAX|SYNTRAX™ — Synthetic Lube Oil Filtration]]

### Standards
- [[SAE_J1539|SAE J1539 — Air Intake Contamination Classification]]
- [[ISO_16889|ISO 16889 — Multi-Pass Filter Test]]
```

### 1.6 unified-data.ts Mapping

| YAML Field | UD Interface | UD Field | Direction |
|------------|-------------|----------|-----------|
| `key` | `UnifiedIndustry` | `key` | vault → TS (read-only) |
| `name` | `UnifiedIndustry` | `name` | bidirectional |
| `slug` | `UnifiedIndustry` | `slug` | TS → vault |
| `contamination_exposure` | `UnifiedIndustry` | `contaminationExposure` | bidirectional |
| `primary_equipment` | `UnifiedIndustry` | `primaryEquipment` | bidirectional |
| `operating_conditions.*` | `UnifiedIndustry` | `operatingConditions.*` | bidirectional |
| `relevant_contamination` | `UnifiedIndustry` | `relevantContamination` | bidirectional (key extraction) |
| `applicable_technologies` | `UnifiedIndustry` | `applicableTechnologies` | bidirectional (key extraction) |
| `applicable_standards` | `UnifiedIndustry` | `applicableStandards` | bidirectional (key extraction) |
| `catalogue_*` | ❌ not in UD | — | vault only (editorial) |
| `features`, `benefits` | ❌ not in UD | — | vault only (editorial) |
| `statistic` | ❌ not in UD | — | vault only (editorial) |

**UD schema extension needed** (Phase 3): Add `displayMetadata` sub-object to `UnifiedIndustry` for `catalogueTitle`, `catalogueDescription`, `features`, `benefits`, `statistic`, `statisticSource`.

### 1.7 Part Search Mapping

The Industry entity provides **filtration context** for the Part Search traversal:

```
[User selects Industry: AGRICULTURE]
    ↓ applicable_technologies[]
    ↓ implemented_in (ProductFamily.uses_technology)
[Product families matching industry + technology]
    ↓ contains (Product.belongs_to_family)
[SKU results, filtered by industry compatibility flag]
```

API endpoint: `GET /api/part-search?industry=AGRICULTURE&problem=dust-ingestion`
Response: technology recommendations + matching SKU list with compatibility confidence score.

### 1.8 AI Retrieval Mapping

```
CANONICAL KNOWLEDGE BLOCK: [Industry Name]

DEFINITION
[catalogue_description — editorial summary]

SYSTEMS
[Comma from applicable_technologies[] display names]

FAILURE_IMPACT
[From relevant_contamination[0].failure_modes → operating_conditions.main_issue]

RELATED_STANDARDS
[From applicable_standards[] — code: name pairs]

RELATED_TECHNOLOGIES
[From applicable_technologies[] — key: control_role pairs]

INDUSTRIAL_ROLE
[statistic + statistic_source — quantified context]

CITATION_REFERENCE
source: elimfilters.com/industries/[slug]
concept: [name] Industrial Filtration
version: 1.0
last_updated: [YYYY-MM-DD]
```

---

## Entity 2: System

### 2.1 YAML Schema

**Note:** Two system classes exist and share this schema. The `system_class` field distinguishes them:
- `product-line` — filtration product category (AIRFILTER, OIL, HYDRAULIC, etc.) — corresponds to SystemKey in UD
- `protection-domain` — cross-product protection domain (Air Intake Domain, Fuel Protection Domain, etc.) — corresponds to ProtectionSystem in systems/page.tsx; not yet in UD

```yaml
---
type: system
status: active
key: ""                          # SystemKey (product-line) or new DOMAIN key (protection-domain)
name: ""
slug: ""
system_class: ""                 # product-line | protection-domain
domain: ""                       # SystemDomain: AIR | FUEL | HYDRAULIC | LUBE_OIL | CABIN | COMPRESSED_AIR | COOLANT | WATER | OTHER

# For product-line systems (maps to UnifiedSystem in UD)
primary_technology: ""           # [[TechnologyKey|Name]]
supporting_technologies: []      # [[TechnologyKey|Name]]

# For protection-domain systems (not in UD — from systems/page.tsx)
protection_number: ""            # '01' through '05' — display ordering
headline: ""                     # editorial subtitle (e.g. "AIR INTAKE ASSET PROTECTION")
protection_description: ""       # multi-sentence editorial description
contaminants: []                 # string[] — display contaminant descriptions
equipment: []                    # string[] — representative equipment list
industries_served: []            # [[IndustryKey|Name]]
product_families: []             # [[ProductFamilyKey|Label]]

# Shared relationship fields
related_standards: []            # [[StandardKey|Code]]
related_contamination: []        # [[ContaminationKey|Name]]
related_problems: []             # [[ProblemKey|Statement]]
related_components: []           # [[ComponentKey|Name]]

# UD sync flags
in_unified_data: true            # true for product-line; false for protection-domain
ud_key: ""                       # SystemKey if product-line; empty if protection-domain

tags: [system, active]
---
```

### 2.2 Required Fields

| Field | Type | Constraint |
|-------|------|------------|
| `type` | string | Must be `system` |
| `key` | string | SystemKey (product-line) or new DOMAIN_KEY (protection-domain) |
| `name` | string | Human-readable system name |
| `slug` | string | URL-safe slug |
| `system_class` | enum | `product-line` or `protection-domain` |
| `domain` | enum | One of SystemDomain values |
| `in_unified_data` | boolean | `true` for product-line, `false` for protection-domain |

### 2.3 Optional Fields

| Field | Type | Applies To | Notes |
|-------|------|-----------|-------|
| `primary_technology` | wikilink | product-line | Maps to UD primaryTechnology |
| `supporting_technologies` | wikilink[] | product-line | Maps to UD supportingTechnologies |
| `protection_number` | string | protection-domain | Display ordering '01'–'05' |
| `headline` | string | protection-domain | Editorial subtitle |
| `protection_description` | string | protection-domain | Multi-sentence description |
| `contaminants` | string[] | protection-domain | Display contaminant list |
| `equipment` | string[] | protection-domain | Representative equipment |
| `industries_served` | wikilink[] | protection-domain | Industries this domain protects |
| `product_families` | wikilink[] | protection-domain | Product families in this domain |
| `ud_key` | string | product-line only | SystemKey reference |

### 2.4 Relationships

| Relationship | Direction | Target Entity | Field |
|--------------|-----------|---------------|-------|
| uses primary technology | outbound | Technology | `primary_technology` |
| uses supporting technologies | outbound | Technology | `supporting_technologies` |
| governed by standards | outbound | Standard | `related_standards` |
| targets contamination modes | outbound | ContaminationMode | `related_contamination` |
| handles user problems | outbound | Problem | `related_problems` |
| protects components | outbound | Component | `related_components` |
| serves industries | outbound | Industry | `industries_served` |
| contains product families | outbound | ProductFamily | `product_families` |

### 2.5 Wikilink Standards

**Display alias convention**: `[[KEY|System Name — Class]]`

Examples:
- `[[AIRFILTER|Air Filtration System — Product Line]]`
- `[[AIR_INTAKE_DOMAIN|Air Intake Protection — Protection Domain]]`
- `[[HYDRAULIC|Hydraulic Filtration System — Product Line]]`

**Relationship section (body)**:
```markdown
## Relationships

### Technologies
- [[MACROCORE|MACROCORE™ — Multi-Stage Depth Filtration]] (primary)
- [[SYNTEPORE|SYNTEPORE™ — Synthetic Pre-Filter Media]] (supporting)

### Standards
- [[SAE_J1539|SAE J1539 — Air Intake Contamination Classification]]
- [[ISO_5011|ISO 5011 — Air Filter Performance Test]]

### Contamination Addressed
- [[PARTICLE_WEAR|Particle Wear in Engines]]

### Product Families
- [[AIRFILTER_PRIMARY|Primary Intake Protection Family]]
```

### 2.6 unified-data.ts Mapping

**For product-line systems:**

| YAML Field | UD Interface | UD Field | Direction |
|------------|-------------|----------|-----------|
| `key` | `UnifiedSystem` | `key` | vault → TS (read-only) |
| `name` | `UnifiedSystem` | `name` | bidirectional |
| `slug` | `UnifiedSystem` | `slug` | TS → vault |
| `domain` | `UnifiedSystem` | `domain` | bidirectional |
| `primary_technology` | `UnifiedSystem` | `primaryTechnology` | bidirectional (key extraction) |
| `supporting_technologies` | `UnifiedSystem` | `supportingTechnologies` | bidirectional (key extraction) |
| `protection_description` | `UnifiedSystem` | `description?` (optional) | vault → TS (editorial master) |

**For protection-domain systems** — no UD mapping exists.
UD schema extension needed: `UnifiedProtectionDomain` interface with `number`, `headline`, `description`, `contaminants[]`, `equipment[]`, `productFamilies[]`.

### 2.7 Part Search Mapping

**Product-line path:**
```
[User selects System: HYDRAULIC]
    ↓ primary_technology + supporting_technologies
[Technologies: NANOFORCE, SYNTRAX]
    ↓ product families matching this system
[HYDRAULIC_CCU family]
    ↓ SKUs in that family
[Part numbers for hydraulic filtration]
```

**Protection-domain path:**
```
[User describes problem context: "Fuel system issues"]
    ↓ maps to protection-domain: FUEL_DOMAIN
    ↓ product_families[] for this domain
[FUEL_CLEANLINESS family, WATER_SEPARATION family]
    ↓ contains
[SKU list with relevance ranking]
```

### 2.8 AI Retrieval Mapping

```
CANONICAL KNOWLEDGE BLOCK: [System Name]

DEFINITION
[protection_description or UD description]

SYSTEMS
[domain value — human-readable mapping]

FAILURE_IMPACT
[related_contamination[*].failure_modes joined]

RELATED_STANDARDS
[related_standards[] — code: name pairs]

RELATED_TECHNOLOGIES
[primary_technology + supporting_technologies — name: role pairs]

INDUSTRIAL_ROLE
[headline (protection-domain) or tagline from primary technology]
```

---

## Entity 3: Technology

### 3.1 YAML Schema

Three subtypes share this schema with `tech_status` distinguishing them.

```yaml
---
type: technology
tech_status: ""                  # active | deprecated | ecosystem
key: ""                          # TechnologyKey | DeprecatedTechnologyKey | EcosystemKey
name: ""
slug: ""
domain: ""                       # SystemDomain
logo_file: ""                    # filename in /public/images/

# Active technology fields
category: ""                     # product category display label
tagline: ""                      # one-sentence positioning statement
geo_definition: ""               # geographic scope / market definition
comparison_function: ""          # what this technology does in comparison context
comparison_metric: ""            # measurement unit for comparison
comparison_industries: ""        # industry context for comparison

# Technology performance
applicable_industries: []        # [[IndustryKey|Name]]
related_standards: []            # [[StandardKey|Code]]
addresses_contamination: []      # [[ContaminationKey|Name]]
key_metrics: {}                  # {metric_name: value} — from UD keyMetrics
  # Note: HYDROCORE and THERMOCORE metrics are unverified — carry TODO annotation

# Display content (editorial — from techPagesData.ts, not in UD)
hero_tagline: ""                 # from TechDetailData.heroTagline
system_headline: ""              # from TechDetailData.systemHeadline
system_paragraphs: []            # string[] from TechDetailData.systemParagraphs
stages: []                       # TechStage[] from TechDetailData.stages
specs: []                        # TechSpec[] from TechDetailData.specs
applications: []                 # TechApplication[] from TechDetailData.applications

# Deprecated technology additional fields (tech_status: deprecated)
deprecated_date: ""
replaced_by: ""                  # [[TechnologyKey|Name]]
replaced_by_name: ""
sunset_note: ""

# Ecosystem entry additional fields (tech_status: ecosystem)
program_type: ""                 # e.g. "Marine-specific ecosystem certification"

# UD sync flags
in_unified_data: true
ud_key: ""

# TODO annotations (preserve from UD source)
# HYDROCORE: key_metrics values unverified — do NOT invent specifications
# THERMOCORE: key_metrics values unverified — do NOT invent specifications

tags: [technology, active]       # replace active with deprecated or ecosystem as appropriate
---
```

### 3.2 Required Fields

| Field | Type | Constraint |
|-------|------|------------|
| `type` | string | Must be `technology` |
| `tech_status` | enum | `active`, `deprecated`, or `ecosystem` |
| `key` | string | Must match corresponding UD key type |
| `name` | string | Display name (with ™ symbol) |
| `slug` | string | URL slug matching UD |
| `domain` | enum | SystemDomain value |
| `in_unified_data` | boolean | Always `true` for Technology entities |

### 3.3 Optional Fields

| Field | Applies To | Notes |
|-------|-----------|-------|
| `category` | active only | Display category label |
| `tagline` | active only | One-sentence description |
| `key_metrics` | active only | Performance specifications — HYDROCORE/THERMOCORE carry TODO flag |
| `hero_tagline` | active only | Extended editorial tagline from tech page |
| `stages` | active only | Multi-stage filtration description objects |
| `specs` | active only | Field specification objects |
| `applications` | active only | Sector application descriptions |
| `deprecated_date` | deprecated only | ISO date string |
| `replaced_by` | deprecated only | Wikilink to successor |
| `sunset_note` | deprecated only | Reason for deprecation |
| `program_type` | ecosystem only | Program type description |

### 3.4 Relationships

| Relationship | Direction | Target Entity | Field |
|--------------|-----------|---------------|-------|
| applicable to industries | outbound | Industry | `applicable_industries` |
| governed by standards | outbound | Standard | `related_standards` |
| addresses contamination modes | outbound | ContaminationMode | `addresses_contamination` |
| replaced by (deprecated) | outbound | Technology | `replaced_by` |
| replaces (deprecated — backlink) | inbound | Technology | (in replacement's body) |
| implemented in product families | inbound | ProductFamily | (via ProductFamily.uses_technology) |
| used in systems | inbound | System | (via System.primary_technology) |
| demonstrated in case studies | inbound | CaseStudy | (via CaseStudy.technologies_demonstrated) |
| covered by articles | inbound | TechnicalArticle | (via TechnicalArticle.covers_technologies) |

### 3.5 Wikilink Standards

**Display alias convention**: `[[KEY|NAME™ — Domain]]`

Examples:
- `[[MACROCORE|MACROCORE™ — Multi-Stage Depth Filtration]]`
- `[[NANOFORCE|NANOFORCE™ — Sub-Micron Particle Removal]]`


**Ecosystem display alias**: `[[MARINECLEAN|MARINECLEAN™ — Marine Certification Program]]`

### 3.6 unified-data.ts Mapping

**Active technologies:**

| YAML Field | UD Interface | UD Field | Direction |
|------------|-------------|----------|-----------|
| `key` | `UnifiedTechnology` | `key` | vault → TS (read-only) |
| `name` | `UnifiedTechnology` | `name` | TS → vault |
| `slug` | `UnifiedTechnology` | `slug` | TS → vault |
| `domain` | `UnifiedTechnology` | `domain` | bidirectional |
| `logo_file` | `UnifiedTechnology` | `logoFile` | TS → vault |
| `category` | `UnifiedTechnology` | `category` | bidirectional |
| `tagline` | `UnifiedTechnology` | `tagline` | vault → TS (editorial master) |
| `geo_definition` | `UnifiedTechnology` | `geoDefinition` | vault → TS (editorial master) |
| `comparison_function` | `UnifiedTechnology` | `comparisonFunction` | vault → TS |
| `comparison_metric` | `UnifiedTechnology` | `comparisonMetric` | vault → TS |
| `comparison_industries` | `UnifiedTechnology` | `comparisonIndustries` | vault → TS |
| `applicable_industries` | `UnifiedTechnology` | `applicableIndustries` | bidirectional (key extraction) |
| `related_standards` | `UnifiedTechnology` | `relatedStandards` | bidirectional (key extraction) |
| `addresses_contamination` | `UnifiedTechnology` | `addressesContamination` | bidirectional (key extraction) |
| `key_metrics` | `UnifiedTechnology` | `keyMetrics` | bidirectional |
| `hero_tagline` | ❌ not in UD | `TechDetailData.heroTagline` | vault only (editorial) |
| `stages` | ❌ not in UD | `TechDetailData.stages` | vault only (editorial) |
| `specs` | ❌ not in UD | `TechDetailData.specs` | vault only (editorial) |
| `applications` | ❌ not in UD | `TechDetailData.applications` | vault only (editorial) |

**UD schema extension needed**: Add `TechPageContent` sub-object to `UnifiedTechnology` for `heroTagline`, `systemHeadline`, `systemParagraphs`, `stages`, `specs`, `applications`, `testimonial`.

### 3.7 Part Search Mapping

```
[User selects Technology context: NANOFORCE]
    ↓ addresses_contamination[]
[Contamination modes: HYDRAULIC_CONTAMINATION, PARTICLE_WEAR]
    ↓ implemented_in (via ProductFamily.uses_technology)
[Product families: HYDRAULIC_CCU]
    ↓ contains
[SKUs: hydraulic filter elements, bypass valves]
    ↑
    └── filtered by industry context from applicable_industries[]
```

API endpoint: `GET /api/part-search?technology=NANOFORCE&industry=MINING`

### 3.8 AI Retrieval Mapping

```
CANONICAL KNOWLEDGE BLOCK: [Technology Name]

DEFINITION
[tagline — single-sentence technical description]

SYSTEMS
[domain value — human-readable; applicable_industries[] display names]

FAILURE_IMPACT
[addresses_contamination[*].failure_modes joined — root cause → consequence chain]

RELATED_STANDARDS
[related_standards[] — code: description pairs]

RELATED_TECHNOLOGIES
[Ecosystem/predecessor/successor relationships]

INDUSTRIAL_ROLE
[geo_definition — market and operational scope]

CITATION_REFERENCE
source: elimfilters.com/technologies/[slug]
concept: [name] Filtration Technology
version: 1.0
last_updated: [YYYY-MM-DD]
```

---

## Entity 4: Component

### 4.1 YAML Schema

Components are physical parts within industrial equipment that filtration systems protect. This entity type has no current UD equivalent.

```yaml
---
type: component
status: active
key: ""                          # e.g. FUEL_INJECTOR, ENGINE_BEARING, HYDRAULIC_PROPORTIONAL_VALVE
name: ""                         # human-readable name
component_class: ""              # engine | hydraulic | fuel | cabin | compressed-air | coolant | lube-oil

# Equipment context
host_equipment: []               # string[] — equipment types containing this component
typical_clearance: ""            # mechanical clearance spec (e.g. "1-5µm bearing journal")
operating_pressure: ""           # pressure range if applicable
operating_temperature: ""        # temperature range

# Failure profile
failure_modes: []                # string[] — how this component fails
failure_threshold: ""            # contamination level at which failure accelerates
failure_consequences: ""         # what breaks downstream when this component fails

# Contamination sensitivity
sensitive_to_contamination: []   # [[ContaminationKey|Name]]
iso_cleanliness_target: ""       # target ISO 4406 code (e.g. "16/14/11")
protection_standard: ""          # [[StandardKey|Code]] — governing test standard

# Filtration protection
protected_by_technologies: []    # [[TechnologyKey|Name]]
located_in_systems: []           # [[SystemKey|Name]]

# Part Search
typical_filter_families: []      # [[ProductFamilyKey|Label]]

# UD sync flags
in_unified_data: false           # Component entity does not exist in UD

tags: [component, active]
---
```

### 4.2 Required Fields

| Field | Type | Constraint |
|-------|------|------------|
| `type` | string | Must be `component` |
| `key` | string | SCREAMING_SNAKE_CASE — descriptive noun |
| `name` | string | Human-readable component name |
| `component_class` | enum | One of seven domain values |
| `in_unified_data` | boolean | Always `false` — no UD mapping exists |

### 4.3 Optional Fields

| Field | Notes |
|-------|-------|
| `typical_clearance` | Mechanical precision spec for wear analysis |
| `failure_threshold` | ISO 4406 code or particle size at which failure begins |
| `iso_cleanliness_target` | Required cleanliness code for reliable operation |
| `operating_pressure` | For hydraulic components especially |
| `typical_filter_families` | Link to Part Search entry |

### 4.4 Relationships

| Relationship | Direction | Target Entity | Field |
|--------------|-----------|---------------|-------|
| sensitive to contamination | outbound | ContaminationMode | `sensitive_to_contamination` |
| governed by standard | outbound | Standard | `protection_standard` |
| protected by technologies | outbound | Technology | `protected_by_technologies` |
| located in systems | outbound | System | `located_in_systems` |
| filtered by product families | outbound | ProductFamily | `typical_filter_families` |
| documented in problems | inbound | Problem | (via Problem.affects_components) |
| featured in case studies | inbound | CaseStudy | (via CaseStudy.components_affected) |

### 4.5 Wikilink Standards

**Display alias convention**: `[[KEY|Component Name (Class)]]`

Examples:
- `[[FUEL_INJECTOR|Fuel Injector (High-Pressure Common Rail)]]`
- `[[ENGINE_BEARING|Engine Bearing Journal]]`
- `[[HYDRAULIC_PROPORTIONAL_VALVE|Hydraulic Proportional Valve]]`

### 4.6 unified-data.ts Mapping

Component entity has **no current UD mapping**. This entity type exists only in the Obsidian vault.

**Future UD schema extension**: Add `UnifiedComponent` interface:
```typescript
export interface UnifiedComponent {
  readonly key: ComponentKey;
  readonly name: string;
  readonly componentClass: ComponentClass;
  readonly sensitiveToContamination: ContaminationKey[];
  readonly protectedByTechnologies: TechnologyKey[];
  readonly locatedInSystems: SystemKey[];
  readonly isoCleanlinessTarget?: string;
  readonly failureModes: string[];
}
```

### 4.7 Part Search Mapping

Component is a **filter context** in Part Search, not a traversal node:

```
[User: "I need a filter for my fuel injectors"]
    ↓ component lookup: FUEL_INJECTOR
    ↓ sensitive_to_contamination → DIESEL_WATER, PARTICLE_WEAR (fuel domain)
    ↓ typical_filter_families → FUEL_CLEANLINESS
    ↓ contains → SKU results
```

API endpoint: `GET /api/part-search?component=FUEL_INJECTOR&equipment=LONG_HAUL_TRUCK`

### 4.8 AI Retrieval Mapping

```
CANONICAL KNOWLEDGE BLOCK: [Component Name]

DEFINITION
[name] in [host_equipment] operates at [typical_clearance] clearance and requires [iso_cleanliness_target] oil/fluid cleanliness for reliable operation.

SYSTEMS
[located_in_systems[] display names]

FAILURE_IMPACT
[sensitive_to_contamination[0].failure_modes]: [failure_threshold] → [failure_consequences]

RELATED_STANDARDS
[protection_standard — code: scope]

RELATED_TECHNOLOGIES
[protected_by_technologies — name: how it prevents failure]

INDUSTRIAL_ROLE
Component-level protection target for [component_class] domain. [failure_consequences] when contamination exceeds threshold.
```

---

## Entity 5: Problem

### 5.1 YAML Schema

Problems are **user-language entry points** for the Part Search traversal. They capture the symptom a technician or fleet manager observes, map it to root cause contamination, and route to the correct filtration solution.

```yaml
---
type: problem
status: active
key: ""                          # e.g. INJECTOR_STICTION, BEARING_PREMATURE_FAILURE, VALVE_SPOOL_STICKING
name: ""                         # brief name (5 words max)
problem_statement: ""            # user-language symptom description (how a technician describes it)
domain: ""                       # which filtration domain this problem belongs to

# Diagnostic mapping
root_contamination: ""           # [[ContaminationKey|Name]] — primary root cause
contributing_factors: []         # string[] — additional contributing conditions
symptom_indicators: []           # string[] — observable symptoms (what maintenance crew sees)

# Asset impact
affects_components: []           # [[ComponentKey|Name]]
affects_systems: []              # [[SystemKey|Name]]
industry_frequency: []           # [[IndustryKey|Name]] — industries where this problem is common

# Solution path
resolved_by_technologies: []     # [[TechnologyKey|Name]]
applicable_standards: []         # [[StandardKey|Code]] — standards that define acceptable limits
recommended_product_families: [] # [[ProductFamilyKey|Label]]

# Quantified impact
mtbf_reduction: ""               # Mean time between failure reduction (e.g. "MTBF reduced from 15,000h to 3,000h")
cost_impact: ""                  # rough cost impact description
downtime_impact: ""              # downtime frequency / duration

# Content links
documented_in_case_studies: []   # [[CaseStudyKey|Title]]
explained_in_articles: []        # [[TechnicalArticleKey|Title]]

# UD sync flags
in_unified_data: false

tags: [problem, active]
---
```

### 5.2 Required Fields

| Field | Type | Constraint |
|-------|------|------------|
| `type` | string | Must be `problem` |
| `key` | string | SCREAMING_SNAKE_CASE — symptom noun phrase |
| `name` | string | 5 words max — brief label |
| `problem_statement` | string | Plain language as technician states it |
| `domain` | enum | Filtration domain |
| `root_contamination` | wikilink | Single primary ContaminationMode |
| `in_unified_data` | boolean | Always `false` |

### 5.3 Optional Fields

| Field | Notes |
|-------|-------|
| `contributing_factors` | Secondary causes that compound the primary contamination |
| `symptom_indicators` | Observable warning signs before failure |
| `mtbf_reduction` | Quantified reliability impact |
| `cost_impact` | Operational cost consequence |
| `downtime_impact` | Fleet availability impact |
| `documented_in_case_studies` | Links to full case study documentation |

### 5.4 Relationships

| Relationship | Direction | Target Entity | Field |
|--------------|-----------|---------------|-------|
| caused by contamination | outbound | ContaminationMode | `root_contamination` |
| affects components | outbound | Component | `affects_components` |
| affects systems | outbound | System | `affects_systems` |
| common in industries | outbound | Industry | `industry_frequency` |
| resolved by technologies | outbound | Technology | `resolved_by_technologies` |
| measured by standards | outbound | Standard | `applicable_standards` |
| addressed by product families | outbound | ProductFamily | `recommended_product_families` |
| documented in case studies | outbound | CaseStudy | `documented_in_case_studies` |

### 5.5 Wikilink Standards

**Display alias convention**: `[[KEY|Problem — Short Statement]]`

Examples:
- `[[INJECTOR_STICTION|Injector Stiction — Water and Microbial Contamination]]`
- `[[BEARING_PREMATURE_FAILURE|Bearing Premature Failure — Abrasive Particle Wear]]`
- `[[VALVE_SPOOL_STICKING|Valve Spool Sticking — Hydraulic Varnish Buildup]]`

### 5.6 unified-data.ts Mapping

Problem entity has **no current UD mapping**.

The closest existing entity is `UnifiedContaminationMode`, but Problem is a distinct concept:
- **ContaminationMode** = technical root cause (what the contamination IS)
- **Problem** = user-observable symptom (what the operator SEES)

**Future UD schema extension**: Add `UnifiedProblem` interface:
```typescript
export interface UnifiedProblem {
  readonly key: ProblemKey;
  readonly name: string;
  readonly problemStatement: string;
  readonly domain: SystemDomain;
  readonly rootContamination: ContaminationKey;
  readonly affectsComponents: ComponentKey[];
  readonly affectsSystems: SystemKey[];
  readonly resolvedByTechnologies: TechnologyKey[];
  readonly applicableStandards: StandardKey[];
}
```

### 5.7 Part Search Mapping

Problem is the **primary user entry point** for Part Search:

```
User input: "My fuel injectors are failing prematurely"
    ↓ NLP intent classification → Problem key: INJECTOR_STICTION
    ↓ root_contamination → DIESEL_WATER
    ↓ recommended_product_families → FUEL_CLEANLINESS, WATER_SEPARATION
    ↓ filtered by: industry context + equipment type
    ↓ SKU results with confidence ranking
```

API endpoint: `POST /api/part-search/diagnose` with body `{symptom: "injector failure", industry: "AGRICULTURE"}`

The Problem entity enables **natural language problem-to-SKU routing** without requiring the user to know ISO codes or filtration technology names.

### 5.8 AI Retrieval Mapping

```
CANONICAL KNOWLEDGE BLOCK: [Problem Name]

DEFINITION
[problem_statement] — root cause: [root_contamination display name]

SYSTEMS
[affects_systems[] display names]

FAILURE_IMPACT
[root_contamination.failure_modes chain] → [affects_components[*].failure_consequences]: [mtbf_reduction]

RELATED_STANDARDS
[applicable_standards[] — code: what it measures]

RELATED_TECHNOLOGIES
[resolved_by_technologies[] — name: how it addresses root contamination]

INDUSTRIAL_ROLE
[industry_frequency[] display names] — [cost_impact] per [downtime_impact]
```

---

## Entity 6: Standard

### 6.1 YAML Schema

```yaml
---
type: standard
status: active
key: ""                          # e.g. ISO_16889, SAE_J1539 — SCREAMING_SNAKE_CASE
code: ""                         # official code string: "ISO 16889", "SAE J1539"
name: ""                         # full standard title
slug: ""                         # URL slug for KB page
body: ""                         # issuing body: ISO | ASTM | SAE | NFPA | DIN | NAS | ANSI
specification_type: ""           # test-method | cleanliness-code | performance-rating | design-spec | classification
criticality: ""                  # PRIMARY | SECONDARY

# Scope
domain: []                       # SystemDomain[] — which filtration domains this governs
applicable_to_technologies: []   # [[TechnologyKey|Name]]
applicable_to_systems: []        # [[SystemKey|Name]]
applicable_to_industries: []     # [[IndustryKey|Name]] — industries where this standard is commonly cited

# Editorial description (page-specific — different from UD description)
kb_description: ""               # description as written on the KB standards page (may differ from UD)
ud_description: ""               # description field in unified-data.ts (authoritative technical description)
# Note: kb_description and ud_description are intentionally separate.
# kb_description is editorial page content.
# ud_description is the canonical technical definition.

# Measurement definition
measures: ""                     # what this standard measures/defines
unit: ""                         # measurement unit if applicable (e.g. "Beta ratio", "particle count per mL", "mg/m³")
typical_target: ""               # example acceptable target (e.g. "ISO 16/14/11 for lube oil")

# Related knowledge
related_standards: []            # [[StandardKey|Code]] — companion or referenced standards
related_contamination: []        # [[ContaminationKey|Name]] — contamination this standard addresses
documents_in_articles: []        # [[TechnicalArticleKey|Title]]

# UD sync flags
in_unified_data: true            # false for the 12 additions not yet in UD
ud_key: ""                       # StandardKey if in_unified_data = true; empty if false

tags: [standard, active]
---
```

### 6.2 Required Fields

| Field | Type | Constraint |
|-------|------|------------|
| `type` | string | Must be `standard` |
| `key` | string | SCREAMING_SNAKE_CASE code — matches UD StandardKey if in UD |
| `code` | string | Official code string (e.g. `"ISO 16889"`) |
| `name` | string | Full standard title |
| `body` | enum | Issuing body: ISO, ASTM, SAE, NFPA, DIN, NAS, ANSI |
| `specification_type` | enum | test-method, cleanliness-code, performance-rating, design-spec, classification |
| `criticality` | enum | `PRIMARY` or `SECONDARY` |
| `in_unified_data` | boolean | True for 11 existing StandardKeys; false for 12 additions |

### 6.3 Optional Fields

| Field | Notes |
|-------|-------|
| `applicable_to_industries` | For standards frequently cited in specific industry contexts |
| `kb_description` | The exact description text used on the knowledge system page |
| `ud_description` | The canonical UD description — must match unified-data.ts if `in_unified_data: true` |
| `measures` | Plain-language explanation of what is being measured |
| `unit` | Measurement unit (Beta ratio, ppm, mg/m³, ISO cleanliness code) |
| `typical_target` | Representative acceptable value for common applications |
| `related_standards` | Companion standards frequently cited together |

### 6.4 in_unified_data Status

| Status | Count | Keys |
|--------|-------|------|
| `in_unified_data: true` | 11 | ISO_16889, ISO_4406, ISO_5011, SAE_J1539, ISO_11155, ISO_8573_1, ISO_16332, NFPA_T2_14, DIN_51524, ASTM_D6304, ISO_12937 |
| `in_unified_data: false` | 12 | ANSI_B132_1, SAE_J1211, ASTM_D7085, ASTM_D975, ISO_11155_1, ISO_11155_2, DIN_71220, ISO_16890, ISO_8573_2, ISO_8573_3, ISO_8573_4, ASTM_D6595 |

Notes for `in_unified_data: false` standards: These appear in Knowledge System page STANDARDS arrays but are absent from `unified-data.ts`. Creating Obsidian notes for them is Step 1 of Phase 3 migration — once notes are complete, they can be promoted to UD StandardKey additions.

### 6.5 Relationships

| Relationship | Direction | Target Entity | Field |
|--------------|-----------|---------------|-------|
| applies to technologies | outbound | Technology | `applicable_to_technologies` |
| applies to systems | outbound | System | `applicable_to_systems` |
| applies to industries | outbound | Industry | `applicable_to_industries` |
| addresses contamination | outbound | ContaminationMode | `related_contamination` |
| related companion standards | bidirectional | Standard | `related_standards` |
| documented in articles | inbound | TechnicalArticle | (via TechnicalArticle.covers_standards) |
| referenced in case studies | inbound | CaseStudy | (via CaseStudy.related_standards) |
| applied by product families | inbound | ProductFamily | (via ProductFamily.meets_standards) |

### 6.6 Wikilink Standards

**Display alias convention**: `[[KEY|CODE — Full Title]]`

Examples:
- `[[ISO_16889|ISO 16889 — Multi-Pass Filter Test Method]]`
- `[[SAE_J1539|SAE J1539 — Diesel Engine Air Intake Contamination Classification]]`
- `[[ASTM_D975|ASTM D975 — Standard Specification for Diesel Fuel Oils]]`
  *(Note: ASTM_D975 has `in_unified_data: false` — note exists in vault before UD addition)*

### 6.7 unified-data.ts Mapping

| YAML Field | UD Interface | UD Field | Direction |
|------------|-------------|----------|-----------|
| `key` | `UnifiedStandard` | `key` | vault → TS (read-only) |
| `code` | `UnifiedStandard` | `code` | TS → vault |
| `name` | `UnifiedStandard` | `name` | bidirectional |
| `slug` | `UnifiedStandard` | `slug` | TS → vault |
| `ud_description` | `UnifiedStandard` | `description` | TS → vault (UD is canonical for technical description) |
| `applicable_to_technologies` | `UnifiedStandard` | `applicableTo` | bidirectional (key extraction) |
| `criticality` | `UnifiedStandard` | `criticality` | bidirectional |
| `kb_description` | ❌ not in UD | KB page inline | vault only (editorial master) |
| `body` | ❌ not in UD | — | vault only (UD extension needed) |
| `specification_type` | ❌ not in UD | — | vault only (UD extension needed) |
| `applicable_to_systems` | ❌ not in UD | — | vault only (UD extension needed) |
| `measures` | ❌ not in UD | — | vault only (UD extension needed) |

**UD schema extension needed**: Add `body`, `specificationTypes`, `domain[]`, `measures`, `unit` fields to `UnifiedStandard`.

### 6.8 Part Search Mapping

Standards provide **specification filtering** in Part Search:

```
[User: "I need a filter that meets ISO 16889"]
    ↓ standard lookup: ISO_16889
    ↓ applicable_to_technologies → MACROCORE, NANOFORCE, SYNTRAX
    ↓ technologies → product families that implement these technologies
    ↓ filter families where meets_standards includes ISO_16889
    ↓ SKU results with standard compliance confirmation
```

API endpoint: `GET /api/part-search?standard=ISO_16889&system=HYDRAULIC`

Standards also appear in Part Search **result enrichment**: each returned SKU includes the ISO standards it meets, enabling specification compliance verification.

### 6.9 AI Retrieval Mapping

```
CANONICAL KNOWLEDGE BLOCK: [Code] — [Name]

DEFINITION
[ud_description — authoritative technical definition from UD]

SYSTEMS
[applicable_to_systems[] display names — or domain[] if systems not specified]

FAILURE_IMPACT
When [code] targets are not met: [related_contamination[0].failure_modes]

RELATED_STANDARDS
[related_standards[] — code: relationship description]

RELATED_TECHNOLOGIES
[applicable_to_technologies[] — name: how technology achieves this standard]

INDUSTRIAL_ROLE
[specification_type] governing [measures] in [domain] applications. [typical_target] is the accepted industry target for critical equipment.

CITATION_REFERENCE
source: elimfilters.com/knowledge-system/standards/[slug]
concept: [code] — [name]
version: 1.0
last_updated: [YYYY-MM-DD]
```

---

## Entity 7: Product Family

### 7.1 YAML Schema

Product Families are the product-line groupings that sit between Technology and individual SKUs. They correspond to the `families[]` arrays in `systems/page.tsx` ProtectionSystem entries.

```yaml
---
type: product-family
status: active
key: ""                          # e.g. AIRFILTER_PRIMARY, FUEL_CLEANLINESS, HYDRAULIC_CCU
label: ""                        # display label (e.g. "Primary Intake Protection")
slug: ""                         # URL slug matching systems/page.tsx family slug
description: ""                  # editorial description from systems/page.tsx

# Technology and system context
uses_technology: ""              # [[TechnologyKey|Name]] — primary technology
uses_tech_display: ""            # display string with ™ (from systems/page.tsx: "MACROCORE™ / SYNTEPORE™")
belongs_to_domain: ""            # [[SystemKey|Name]] — protection domain
belongs_to_product_system: ""    # [[SystemKey|Name]] — product system (product-line class)

# Standards compliance
meets_standards: []              # [[StandardKey|Code]] — standards this family meets
performance_rating: ""           # e.g. "ISO 16/14/11 at 10µm absolute"

# Product content
contains_skus: []                # [[ProductKey|SKU]] — individual SKU notes (may be a subset; full list in part search DB)
sku_count_approx: 0              # approximate total SKU count in part search DB

# Industries served
target_industries: []            # [[IndustryKey|Name]]

# UD sync flags
in_unified_data: false           # Product Family does not exist in UD

tags: [product-family, active]
---
```

### 7.2 Required Fields

| Field | Type | Constraint |
|-------|------|------------|
| `type` | string | Must be `product-family` |
| `key` | string | SCREAMING_SNAKE_CASE combining domain + function |
| `label` | string | Display name from systems/page.tsx families[].label |
| `slug` | string | From systems/page.tsx families[].slug |
| `uses_technology` | wikilink | Primary technology (key from systems/page.tsx tech string) |
| `belongs_to_domain` | wikilink | Protection domain system |
| `in_unified_data` | boolean | Always `false` |

### 7.3 Optional Fields

| Field | Notes |
|-------|-------|
| `uses_tech_display` | Raw display string including ™ marks |
| `belongs_to_product_system` | Product-line system (product-line class) |
| `meets_standards` | ISO/SAE standards this family's products comply with |
| `performance_rating` | Representative performance specification |
| `contains_skus` | Links to individual Product notes (curated subset) |
| `sku_count_approx` | Estimate from part search database |
| `target_industries` | Industries this family is optimised for |

### 7.4 Relationships

| Relationship | Direction | Target Entity | Field |
|--------------|-----------|---------------|-------|
| uses technology | outbound | Technology | `uses_technology` |
| belongs to domain | outbound | System (protection-domain) | `belongs_to_domain` |
| belongs to product system | outbound | System (product-line) | `belongs_to_product_system` |
| meets standards | outbound | Standard | `meets_standards` |
| targets industries | outbound | Industry | `target_industries` |
| contains SKU products | inbound | Product | (via Product.belongs_to_family) |
| referenced by industry | inbound | Industry | (via Industry.typical_product_families) |

### 7.5 Wikilink Standards

**Display alias convention**: `[[KEY|Label (Technology)]]`

Examples:
- `[[AIRFILTER_PRIMARY|Primary Intake Protection (MACROCORE™)]]`
- `[[HYDRAULIC_CCU|Hydraulic Contamination Control Unit (NANOFORCE™)]]`

### 7.6 unified-data.ts Mapping

Product Family has **no current UD mapping**.

Source data is in `systems/page.tsx`:
```typescript
interface ProductFamily {
  label: string;        // → YAML: label
  description: string;  // → YAML: description
  slug: string;         // → YAML: slug
  tech: string;         // → YAML: uses_tech_display (raw ™ string, not a typed key)
}
```

**Future UD schema extension**: Add `UnifiedProductFamily` interface:
```typescript
export type ProductFamilyKey = string; // e.g. 'AIRFILTER_PRIMARY'
export interface UnifiedProductFamily {
  readonly key: ProductFamilyKey;
  readonly label: string;
  readonly slug: string;
  readonly description: string;
  readonly usesTechnology: TechnologyKey;
  readonly belongsToSystem: SystemKey;
  readonly meetsStandards: StandardKey[];
}
```

### 7.7 Part Search Mapping

Product Family is the **penultimate node** in Part Search traversal — between Technology and individual SKU:

```
[Technology resolved: NANOFORCE]
    ↓ implemented_in → Product Families
[HYDRAULIC_CCU, OIL_NANOFORCE_PACK]
    ↓ contains_skus (via Part Search DB join)
[Individual SKUs filtered by equipment, flow rate, thread spec, etc.]
```

API endpoint: `GET /api/product-families?technology=NANOFORCE&industry=MINING`
Returns: list of applicable Product Families with approximate SKU counts and performance ratings.

Product Family also provides the **"shopping context"** for users who arrive from a product category browse (e.g. `/systems/hydraulic`) rather than a problem-first path.

### 7.8 AI Retrieval Mapping

```
CANONICAL KNOWLEDGE BLOCK: [Label]

DEFINITION
[description — editorial description from systems/page.tsx]

SYSTEMS
[belongs_to_domain display name] / [belongs_to_product_system display name]

FAILURE_IMPACT
Via [uses_technology display name] — controls [uses_technology.addresses_contamination display names]

RELATED_STANDARDS
[meets_standards[] — code: compliance note]

RELATED_TECHNOLOGIES
[uses_technology — name: role in this family]

INDUSTRIAL_ROLE
Product family implementing [uses_technology name] for [belongs_to_domain name] in [target_industries[*] display names].
```

---

## Entity 8: Product (SKU)

### 8.1 YAML Schema

Individual purchasable filtration products. The Obsidian vault maintains **curated representative SKU notes** for key products; the full catalogue (500k+ OEM cross-references) lives in the Part Search database. Vault notes document the canonical representation of a product-line entry, not every part number.

```yaml
---
type: product
status: active
key: ""                          # e.g. ELF-AF-M1, or product-line display key
sku: ""                          # primary ELIMFILTERS part number
name: ""                         # product display name
product_class: ""                # air-filter | fuel-filter | oil-filter | hydraulic-filter | cabin-filter | compressed-air | coolant | water | housing | dryer | kit | marine

# Product-line display data (from catalogue.json)
catalogue_name: ""               # from catalogue.json name field
catalogue_title: ""              # from catalogue.json title
catalogue_subtitle: ""           # from catalogue.json subtitle
catalogue_description: ""        # from catalogue.json description
tech_tags: []                    # string[] — from catalogue.json techTags (display ™ strings)
cta: ""                          # from catalogue.json cta

# Technical specifications
flow_rate: ""                    # LPH or GPH
filtration_efficiency: ""        # efficiency at rated micron (e.g. "99.9% at 10µm")
micron_rating: ""                # absolute micron rating
dirt_holding_capacity: ""        # grams
bypass_valve_rating: ""          # psid
thread_spec: ""                  # thread type if applicable
dimensions: ""                   # OD × H or similar

# Classification
belongs_to_family: ""            # [[ProductFamilyKey|Label]]
implements_technology: []        # [[TechnologyKey|Name]]
compatible_with_systems: []      # [[SystemKey|Name]]
applicable_industries: []        # [[IndustryKey|Name]]
meets_standards: []              # [[StandardKey|Code]]

# OEM cross-reference summary (representative — full list in Part Search DB)
replaces_oem: []                 # string[] — key OEM part numbers this replaces
oem_compatibility_note: ""       # brief note on OEM compatibility scope

# UD sync flags
in_unified_data: false

tags: [product, active]
---
```

### 8.2 Required Fields

| Field | Type | Constraint |
|-------|------|------------|
| `type` | string | Must be `product` |
| `key` | string | Primary identifier — SKU or catalogue key |
| `product_class` | enum | One of twelve product class values |
| `belongs_to_family` | wikilink | Required — links product to Part Search traversal |
| `implements_technology` | wikilink[] | At least one technology required |
| `in_unified_data` | boolean | Always `false` |

### 8.3 Optional Fields

| Field | Notes |
|-------|-------|
| `catalogue_*` | Display fields from catalogue.json — editorial |
| `flow_rate` | Required for hydraulic and compressed air products |
| `micron_rating` | Required for filter elements |
| `thread_spec` | Required for spin-on filters |
| `replaces_oem` | Representative subset — not exhaustive |
| `oem_compatibility_note` | Scope note for OEM coverage |

### 8.4 Note on Vault Scope vs Part Search Database


Individual SKUs (ELF-AF-XXXX, cross-references to 500k+ OEM numbers) are managed in the Part Search database with its own data model. The vault's Product entity provides the **canonical product description** and **knowledge graph linkage** for the product line.

### 8.5 Relationships

| Relationship | Direction | Target Entity | Field |
|--------------|-----------|---------------|-------|
| belongs to product family | outbound | ProductFamily | `belongs_to_family` |
| implements technology | outbound | Technology | `implements_technology` |
| compatible with systems | outbound | System | `compatible_with_systems` |
| applicable to industries | outbound | Industry | `applicable_industries` |
| meets standards | outbound | Standard | `meets_standards` |

### 8.6 Wikilink Standards

**Display alias convention**: `[[KEY|Product Name (SKU)]]`

Examples:
- `[[MACROCORE_HEAVY_DUTY|MACROCORE™ Heavy Duty Air Filter]]`

### 8.7 unified-data.ts Mapping

Product entities have **no current UD mapping**.

Source data is in `catalogue.json` (product-line display records) and the Part Search database (individual SKUs).

**Future UD schema extension**: `UnifiedProduct` interface covering `catalogueTitle`, `catalogueDescription`, `techTags`, `belongsToFamily`, `implementsTechnology[]`, `meetsStandards[]`.

### 8.8 Part Search Mapping

Product is the **terminal node** in Part Search traversal:

```
[All traversal paths lead here]
    ↓ Part Search result = list of Product SKU notes + API call to Part Search DB
    
API response per product:
{
  vault_key: "AIRFILTER_PRIMARY",
  product_name: "Primary Intake Protection — MACROCORE™",
  sku_results: [
    { sku: "ELF-AF-001", oem_cross: ["Donaldson P112892", "Fleetguard AF25550"], flow_rate: "1200 m³/h" },
    ...
  ],
  standards_met: ["ISO 5011", "SAE J1539"],
  technology: "MACROCORE"
}
```

---

## Entity 9: Case Study

### 9.1 YAML Schema

Case Studies document real-world contamination events or fleet optimization outcomes. They serve as evidence-based references for both the Knowledge System and AI citation. Two sub-types: `contamination` (failure event analysis) and `fleet-optimization` (operational improvement studies).

```yaml
---
type: case-study
study_type: ""                   # contamination | fleet-optimization
status: active
key: ""                          # e.g. CS_DIESEL_WATER, CS_PARTICLE_WEAR, CS_HYDRAULIC, CS_FLEET_DOWNTIME
title: ""                        # full case study title
slug: ""                         # URL slug matching /knowledge-system/contamination/[slug] or /knowledge-system/fleet/[slug]

# Scope
domain: ""                       # primary filtration domain
industries_affected: []          # [[IndustryKey|Name]]
systems_involved: []             # [[SystemKey|Name]]
components_affected: []          # [[ComponentKey|Name]]

# Technical content
contamination_mode: ""           # [[ContaminationKey|Name]] — for contamination studies
root_cause_summary: ""           # 1-2 sentence root cause description
failure_mechanism: ""            # failure chain: cause → effect → consequence
quantified_impact: ""            # measured operational impact (equipment hours, cost, downtime)

# Fleet optimization content (for fleet-optimization type)
optimization_strategy: ""        # what was changed
baseline_performance: ""         # before metrics
optimized_performance: ""        # after metrics
roi_description: ""              # return on investment summary

# Solution
technologies_demonstrated: []    # [[TechnologyKey|Name]]
standards_applied: []            # [[StandardKey|Code]]
product_families_used: []        # [[ProductFamilyKey|Label]]

# Problem linkage
addresses_problems: []           # [[ProblemKey|Statement]]

# Cross-references
related_articles: []             # [[TechnicalArticleKey|Title]]
related_case_studies: []         # [[CaseStudyKey|Title]]

# Content metadata
section_count: 0                 # number of sections in the KB article
has_placeholder_tokens: false    # true if article contains __LINKED_*__ tokens (Phase 3 integration pending)
placeholder_tokens: []           # list of token strings if present

# UD sync flags
in_unified_data: false

tags: [case-study, active]
---
```

### 9.2 Required Fields

| Field | Type | Constraint |
|-------|------|------------|
| `type` | string | Must be `case-study` |
| `study_type` | enum | `contamination` or `fleet-optimization` |
| `key` | string | SCREAMING_SNAKE_CASE with CS_ prefix |
| `title` | string | Full title matching KB page |
| `slug` | string | URL slug |
| `domain` | enum | Primary filtration domain |
| `in_unified_data` | boolean | Always `false` |

### 9.3 Optional Fields

| Field | Notes |
|-------|-------|
| `contamination_mode` | Required for contamination sub-type |
| `failure_mechanism` | Root cause → failure chain |
| `quantified_impact` | Measured metrics — required for AI citation |
| `optimization_strategy` | Required for fleet-optimization sub-type |
| `has_placeholder_tokens` | Flag if `__LINKED_*__` tokens present — signals pending UD integration |
| `placeholder_tokens` | List of specific token strings found in article body |

### 9.4 Known Placeholder Tokens

The contamination case study pages currently contain unresolved integration tokens. These must be tracked at the note level:

| Case Study Key | Known Tokens |
|----------------|-------------|
| CS_DIESEL_WATER | `__LINKED_DIESEL_IMPACT__`, `__LINKED_DIESEL_STANDARDS__` |
| CS_PARTICLE_WEAR | `__LINKED_PARTICLE_STANDARDS__`, `__LINKED_PARTICLE_TECH__` |
| CS_HYDRAULIC | `__LINKED_HYDRAULIC_IMPACT__`, `__LINKED_HYDRAULIC_TECH__` |

These tokens are **signals for Phase 3 migration** — when unified-data.ts gains the relevant data, the tokens are replaced with UD-driven content. The Obsidian note tracks which tokens remain unresolved.

### 9.5 Relationships

| Relationship | Direction | Target Entity | Field |
|--------------|-----------|---------------|-------|
| covers contamination mode | outbound | ContaminationMode | `contamination_mode` |
| affects industries | outbound | Industry | `industries_affected` |
| involves systems | outbound | System | `systems_involved` |
| affects components | outbound | Component | `components_affected` |
| demonstrates technologies | outbound | Technology | `technologies_demonstrated` |
| applies standards | outbound | Standard | `standards_applied` |
| addresses problems | outbound | Problem | `addresses_problems` |
| uses product families | outbound | ProductFamily | `product_families_used` |
| related articles | bidirectional | TechnicalArticle | `related_articles` |

### 9.6 Wikilink Standards

**Display alias convention**: `[[KEY|Title (Type)]]`

Examples:
- `[[CS_DIESEL_WATER|Diesel Water Contamination (Contamination Study)]]`
- `[[CS_FLEET_DOWNTIME|Reducing Fleet Downtime (Fleet Optimization)]]`
- `[[CS_TOTAL_COST|Total Cost of Ownership (Fleet Optimization)]]`

### 9.7 unified-data.ts Mapping

Case Studies have **no current UD mapping**.

**Future UD schema extension**: Add `UnifiedCaseStudy` interface:
```typescript
export interface UnifiedCaseStudy {
  readonly key: CaseStudyKey;
  readonly title: string;
  readonly studyType: 'contamination' | 'fleet-optimization';
  readonly slug: string;
  readonly domain: SystemDomain;
  readonly contaminationMode?: ContaminationKey;
  readonly technologiesDemonstrated: TechnologyKey[];
  readonly standardsApplied: StandardKey[];
  readonly quantifiedImpact: string;
}
```

This extension would enable the contamination pages to replace `__LINKED_*__` tokens with UD-driven content.

### 9.8 AI Retrieval Mapping

```
CANONICAL KNOWLEDGE BLOCK: [Title]

DEFINITION
[root_cause_summary] — [contamination_mode display name] leads to [failure_mechanism]

SYSTEMS
[systems_involved[] display names]

FAILURE_IMPACT
[failure_mechanism] | Operational Impact: [quantified_impact]

RELATED_STANDARDS
[standards_applied[] — code: how it was used in this case]

RELATED_TECHNOLOGIES
[technologies_demonstrated[] — name: how it addressed the failure]

INDUSTRIAL_ROLE
Evidence-based documentation of [study_type] outcomes in [industries_affected[] display names]. [quantified_impact]

CITATION_REFERENCE
source: elimfilters.com/knowledge-system/[contamination|fleet]/[slug]
concept: [title]
version: 1.0
last_updated: [YYYY-MM-DD]
```

---

## Entity 10: Technical Article

### 10.1 YAML Schema

Technical Articles are the Knowledge System reference pages: standards domain pages, compare/evaluation pages, science pages, and bridge pages. They differ from Case Studies in that they are reference documentation (how contamination control works, what standards mean) rather than evidence-based outcome records.

```yaml
---
type: technical-article
article_type: ""                 # standards-domain | evaluation-framework | comparison | science | bridge
status: active
key: ""                          # e.g. TA_LUBE_OIL_SYSTEMS, TA_FILTER_EVALUATION, TA_SYSTEM_VS_COMMODITY
title: ""                        # full article title (SEO-optimized h1)
slug: ""                         # URL slug
route: ""                        # full route path (e.g. /knowledge-system/standards/lube-oil-systems)

# Article scope
domain: ""                       # primary filtration domain (for standards-domain articles)
section: ""                      # knowledge-system section: standards | compare | contamination | fleet | bridges | science

# Content coverage
covers_standards: []             # [[StandardKey|Code]]
covers_technologies: []          # [[TechnologyKey|Name]]
covers_industries: []            # [[IndustryKey|Name]]
covers_systems: []               # [[SystemKey|Name]]
covers_contamination: []         # [[ContaminationKey|Name]]
references_case_studies: []      # [[CaseStudyKey|Title]]

# Content structure
section_count: 0                 # number of content sections
has_ai_citation_block: false     # true if 10-point template Point 10 (Canonical block) is implemented
has_canonical_json_ld: false     # true if JSON-LD structured data is present
template_compliance: ""          # full | partial | none — 10-point template compliance

# Standards page specific
inline_standards: []             # standards listed inline in this article's STANDARDS[] array
inline_technologies: []          # technologies listed in this article's TECHNOLOGIES[] array
# Note: inline_standards descriptions may differ from UD descriptions (see Phase 2 Task 5 report)

# UD sync flags
in_unified_data: false

tags: [technical-article, active]
---
```

### 10.2 Required Fields

| Field | Type | Constraint |
|-------|------|------------|
| `type` | string | Must be `technical-article` |
| `article_type` | enum | standards-domain, evaluation-framework, comparison, science, bridge |
| `key` | string | SCREAMING_SNAKE_CASE with TA_ prefix |
| `title` | string | SEO-optimized h1 from the page |
| `slug` | string | URL-safe slug |
| `route` | string | Full route path for deep linking |
| `section` | enum | knowledge-system section |
| `in_unified_data` | boolean | Always `false` |

### 10.3 Optional Fields

| Field | Notes |
|-------|-------|
| `template_compliance` | 10-point template adherence — full, partial, or none |
| `has_ai_citation_block` | Whether Point 10 canonical block is implemented |
| `has_canonical_json_ld` | Whether JSON-LD structured data is present |
| `inline_standards` | Standards array from this article's inline data (may differ from UD) |
| `inline_technologies` | Technologies array from this article's inline data |

### 10.4 Known Articles Inventory

**Standards Domain Pages (6):**
| Key | Route | Domain |
|-----|-------|--------|
| `TA_AIR_INTAKE_SYSTEMS` | `/knowledge-system/standards/air-intake-systems` | AIR |
| `TA_LUBE_OIL_SYSTEMS` | `/knowledge-system/standards/lube-oil-systems` | LUBE_OIL |
| `TA_FUEL_SYSTEMS` | `/knowledge-system/standards/fuel-systems` | FUEL |
| `TA_CABIN_SAFETY_SYSTEMS` | `/knowledge-system/standards/cabin-safety-systems` | CABIN |
| `TA_HYDRAULIC_SYSTEMS` | `/knowledge-system/standards/hydraulic-systems` | HYDRAULIC |
| `TA_COMPRESSED_AIR_SYSTEMS` | `/knowledge-system/standards/compressed-air-systems` | COMPRESSED_AIR |

**Comparison Pages (5):**
| Key | Route |
|-----|-------|
| `TA_SYSTEM_VS_COMMODITY` | `/knowledge-system/compare/system-vs-commodity` |
| `TA_EVALUATION_FRAMEWORK` | `/knowledge-system/compare/evaluation-framework` |
| `TA_TOTAL_COST_OWNERSHIP` | `/knowledge-system/compare/total-cost-ownership` |
| `TA_OEM_COMPARISON` | `/knowledge-system/compare/oem-comparison` |

**Fleet Optimization Pages (3):**
| Key | Route |
|-----|-------|
| `TA_REDUCING_DOWNTIME` | `/knowledge-system/fleet/reducing-downtime` |
| `TA_FUEL_EFFICIENCY` | `/knowledge-system/fleet/fuel-efficiency` |
| `TA_FLEET_TCO` | `/knowledge-system/fleet/total-cost-ownership` |

### 10.5 Relationships

| Relationship | Direction | Target Entity | Field |
|--------------|-----------|---------------|-------|
| covers standards | outbound | Standard | `covers_standards` |
| covers technologies | outbound | Technology | `covers_technologies` |
| covers industries | outbound | Industry | `covers_industries` |
| covers systems | outbound | System | `covers_systems` |
| covers contamination | outbound | ContaminationMode | `covers_contamination` |
| references case studies | outbound | CaseStudy | `references_case_studies` |
| referenced by other articles | inbound | TechnicalArticle | (via other articles' related_articles) |

### 10.6 Wikilink Standards

**Display alias convention**: `[[KEY|Title (Article Type)]]`

Examples:
- `[[TA_LUBE_OIL_SYSTEMS|Lube Oil Filtration Systems (Standards Domain)]]`
- `[[TA_SYSTEM_VS_COMMODITY|System vs Commodity Filtration (Comparison)]]`
- `[[TA_EVALUATION_FRAMEWORK|Filter Evaluation Framework (Comparison)]]`

### 10.7 unified-data.ts Mapping

Technical Articles have **no current UD mapping** and are unlikely to need one. They are editorial content nodes, not data records.

The relevant mapping for articles is the **inline data they contain**:
- `covers_standards` → lists all StandardKeys referenced, enabling forward lookup
- `inline_standards` → documents the article-specific STANDARDS[] array, which may differ from UD descriptions (documented in Phase 2 Task 5 report)

### 10.8 AI Retrieval Mapping

```
CANONICAL KNOWLEDGE BLOCK: [Title]

DEFINITION
[article_type] documentation covering [domain] filtration engineering. [One sentence summary of article's core thesis]

SYSTEMS
[covers_systems[] + domain]

FAILURE_IMPACT
[covers_contamination[] failure modes — drawn from contamination entity cross-reference]

RELATED_STANDARDS
[covers_standards[] — code: scope]

RELATED_TECHNOLOGIES
[covers_technologies[] — name: how covered in this article]

INDUSTRIAL_ROLE
Reference documentation for [article_type] in [covers_industries[] display names]. [template_compliance] 10-point template compliance.

CITATION_REFERENCE
source: elimfilters.com[route]
concept: [title]
version: 1.0
last_updated: [YYYY-MM-DD]
```

---

## Cross-Entity Relationship Summary

| From Entity | Relationship | To Entity | Cardinality |
|-------------|-------------|-----------|-------------|
| Industry | uses | Technology | N:N |
| Industry | governed by | Standard | N:N |
| Industry | experiences | Problem | N:N |
| System | uses primary | Technology | N:1 |
| System | uses supporting | Technology | N:N |
| System | governed by | Standard | N:N |
| System | targets | ContaminationMode | N:N |
| System | contains | ProductFamily | 1:N |
| Technology | addresses | ContaminationMode | N:N |
| Technology | applicable to | Industry | N:N |
| Technology | governed by | Standard | N:N |
| Technology | implemented in | ProductFamily | 1:N |
| Technology | (deprecated) replaced by | Technology | 1:1 |
| Component | sensitive to | ContaminationMode | N:N |
| Component | protected by | Technology | N:N |
| Component | located in | System | N:N |
| Problem | caused by | ContaminationMode | N:1 |
| Problem | affects | Component | N:N |
| Problem | resolved by | Technology | N:N |
| Standard | applies to | Technology | N:N |
| Standard | applies to | System | N:N |
| ProductFamily | uses | Technology | N:1 |
| ProductFamily | meets | Standard | N:N |
| ProductFamily | contains | Product (SKU) | 1:N |
| Product | implements | Technology | N:N |
| Product | meets | Standard | N:N |
| CaseStudy | covers | ContaminationMode | N:1 |
| CaseStudy | demonstrates | Technology | N:N |
| CaseStudy | addresses | Problem | N:N |
| TechnicalArticle | covers | Standard | N:N |
| TechnicalArticle | covers | Technology | N:N |
| TechnicalArticle | references | CaseStudy | N:N |

---

## Global Tag Taxonomy

All tags follow lowercase-hyphenated convention. No uppercase, no spaces, no camelCase.

### Entity Type Tags
`technology` · `industry` · `system` · `component` · `problem` · `standard` · `product-family` · `product` · `case-study` · `technical-article`

### Status Tags
`active` · `deprecated` · `ecosystem` · `draft` · `review-needed`

### Domain Tags
`air-intake` · `fuel` · `hydraulic` · `lube-oil` · `cabin` · `compressed-air` · `coolant` · `water` · `marine`

### Industry Severity Tags
`exposure-extreme` · `exposure-high` · `exposure-medium-high` · `exposure-medium` · `exposure-low-medium` · `exposure-low`

### Standards Body Tags
`iso` · `astm` · `sae` · `nfpa` · `din` · `nas` · `ansi`

### UD Status Tags
`in-ud` · `not-in-ud` · `ud-partial`

### Article Type Tags
`standards-domain` · `evaluation-framework` · `comparison` · `fleet-optimization` · `contamination-study` · `science`

### Part Search Tags
`part-search-entry` · `part-search-node` · `part-search-terminal`
(mark Problems as `part-search-entry`, ContaminationModes/Technologies/ProductFamilies as `part-search-node`, Products as `part-search-terminal`)

---

## Vault Folder Structure (Updated — Phase 3B Additions)

```
elimfilters-vault/
├── 00-meta/
│   ├── _INDEX.md
│   └── _SCHEMA-REFERENCE.md
├── 01-technologies/
│   ├── active/           (9 notes: MACROCORE, NANOFORCE, SYNTRAX, SYNTEPORE, DRYCORE,
│   │                               INTEKCORE, MICROKAPPA, HYDROCORE, THERMOCORE)
│   └── ecosystems/       (2 notes: MARINECLEAN, DURATECH)
├── 02-industries/        (12 notes)
├── 03-systems/
│   ├── product-line/     (12 notes: AIRFILTER, OIL, FUEL, HYDRAULIC, CABIN,
│   │                                COMPRESSED_AIR, COOLANT, WATER, HOUSING, DRYER, KITS, MARINE)
│   └── protection-domain/ (5 notes: AIR_INTAKE_DOMAIN, FUEL_DOMAIN, LUBE_OIL_DOMAIN,
│                                    HYDRAULIC_DOMAIN, CABIN_DOMAIN)
├── 04-standards/         (23 notes: 11 existing + 12 additions)
├── 05-contamination/     (6 notes: PARTICLE_WEAR, DIESEL_WATER, HYDRAULIC_CONTAMINATION,
│                                   COMPRESSED_AIR_MOISTURE, COOLANT_CONTAMINATION, CABIN_AIR_CONTAMINATION)
├── 06-components/        (~40 notes — see Component entity catalog below)
├── 07-problems/          (~20 notes — see Problem entity catalog below)
├── 08-product-families/  (~30 notes — see ProductFamily entity catalog below)
├── 09-products/          (~36 notes — one representative note per catalogue.json entry)
├── 10-case-studies/
│   ├── contamination/    (3 notes: CS_DIESEL_WATER, CS_PARTICLE_WEAR, CS_HYDRAULIC)
│   └── fleet/            (3 notes: CS_FLEET_DOWNTIME, CS_FUEL_EFFICIENCY, CS_FLEET_TCO)
└── 11-articles/
    ├── standards/        (6 notes: TA_AIR_INTAKE_SYSTEMS, TA_LUBE_OIL_SYSTEMS,
    │                               TA_FUEL_SYSTEMS, TA_CABIN_SAFETY_SYSTEMS,
    │                               TA_HYDRAULIC_SYSTEMS, TA_COMPRESSED_AIR_SYSTEMS)
    ├── compare/          (4 notes: TA_SYSTEM_VS_COMMODITY, TA_EVALUATION_FRAMEWORK,
    │                               TA_TOTAL_COST_OWNERSHIP, TA_OEM_COMPARISON)
    └── fleet/            (3 notes: TA_REDUCING_DOWNTIME, TA_FUEL_EFFICIENCY, TA_FLEET_TCO)

Total: ~170 notes (Phase 3B target)
(Phase 3A established 65 notes across 01–05; Phase 3B adds ~105 notes across 06–11)
```

### Component Catalog (Phase 3B Additions — `06-components/`)

Representative components to document in Phase 3B:

| Key | Name | Class |
|-----|------|-------|
| `FUEL_INJECTOR` | Fuel Injector (High-Pressure Common Rail) | fuel |
| `FUEL_PUMP_HIGH_PRESSURE` | High-Pressure Fuel Pump | fuel |
| `FUEL_PUMP_LIFT` | Fuel Lift Pump | fuel |
| `ENGINE_BEARING_JOURNAL` | Engine Bearing Journal | engine |
| `PISTON_RING_ASSEMBLY` | Piston Ring Assembly | engine |
| `CYLINDER_WALL` | Cylinder Wall / Liner | engine |
| `CRANKSHAFT_MAIN_BEARING` | Crankshaft Main Bearing | engine |
| `HYDRAULIC_PROPORTIONAL_VALVE` | Hydraulic Proportional Valve | hydraulic |
| `HYDRAULIC_SERVO_VALVE` | Hydraulic Servo Valve | hydraulic |
| `HYDRAULIC_PISTON_PUMP` | Hydraulic Piston Pump | hydraulic |
| `HYDRAULIC_GEAR_PUMP` | Hydraulic Gear Pump | hydraulic |
| `HVAC_EVAPORATOR` | Cabin HVAC Evaporator | cabin |
| `CABIN_BLOWER_MOTOR` | Cabin Blower Motor | cabin |
| `COMPRESSED_AIR_PNEUMATIC_VALVE` | Pneumatic Control Valve | compressed-air |
| `COMPRESSED_AIR_INSTRUMENT` | Pneumatic Instrument | compressed-air |
| `COOLANT_WATER_PUMP` | Engine Water Pump | coolant |
| `COOLANT_RADIATOR_CORE` | Radiator Core | coolant |
| `TURBOCHARGER_BEARING` | Turbocharger Bearing | engine |
| `AIR_COMPRESSOR` | Air Intake Compressor | air-intake |
| `OIL_PUMP` | Engine Oil Pump | lube-oil |

### Problem Catalog (Phase 3B Additions — `07-problems/`)

| Key | Name | Domain |
|-----|------|--------|
| `INJECTOR_STICTION` | Injector Stiction | fuel |
| `INJECTOR_PREMATURE_WEAR` | Injector Premature Wear | fuel |
| `BEARING_PREMATURE_FAILURE` | Bearing Premature Failure | lube-oil |
| `CYLINDER_SCUFFING` | Cylinder Scuffing | engine |
| `PISTON_RING_WEAR` | Piston Ring Wear | engine |
| `VALVE_SPOOL_STICKING` | Hydraulic Valve Spool Sticking | hydraulic |
| `HYDRAULIC_PUMP_CAVITATION` | Hydraulic Pump Cavitation | hydraulic |
| `SERVO_VALVE_CONTAMINATION` | Servo Valve Contamination | hydraulic |
| `FUEL_MICROBIAL_GROWTH` | Fuel Microbial Growth | fuel |
| `FUEL_PUMP_CAVITATION` | Fuel Pump Cavitation | fuel |
| `CABIN_AIR_QUALITY_DEGRADATION` | Cabin Air Quality Degradation | cabin |
| `PM10_OPERATOR_EXPOSURE` | PM10 Operator Overexposure | cabin |
| `COMPRESSED_AIR_MOISTURE_DAMAGE` | Compressed Air Moisture Damage | compressed-air |
| `PNEUMATIC_VALVE_FAILURE` | Pneumatic Valve Failure | compressed-air |
| `VARNISH_BUILDUP_HYDRAULIC` | Hydraulic Varnish Buildup | hydraulic |
| `TURBOCHARGER_BEARING_FAILURE` | Turbocharger Bearing Failure | engine |
| `OIL_VISCOSITY_BREAKDOWN` | Oil Viscosity Breakdown | lube-oil |
| `COOLANT_PUMP_SEAL_FAILURE` | Coolant Pump Seal Failure | coolant |
| `AIR_INTAKE_BYPASS` | Air Filter Bypass Event | air-intake |
| `INTAKE_RESTRICTION_HIGH` | Intake Restriction Exceeds Limit | air-intake |

---

## unified-data.ts Extension Roadmap

Extensions required to achieve full vault ↔ UD synchronization:

### Priority 1 — Standards (enables immediate KB page migration)
Add 12 missing StandardKeys to `unified-data.ts STANDARDS`:
`ANSI_B132_1`, `SAE_J1211`, `ASTM_D7085`, `ASTM_D975`, `ISO_11155_1`, `ISO_11155_2`, `DIN_71220`, `ISO_16890`, `ISO_8573_2`, `ISO_8573_3`, `ISO_8573_4`, `ASTM_D6595`

Add new fields to `UnifiedStandard`: `body`, `specificationType`, `domain[]`, `measures`, `unit`

### Priority 2 — Technology Page Content
Add `TechPageContent` sub-object to `UnifiedTechnology`:
`heroTagline`, `systemHeadline`, `systemParagraphs[]`, `stages[]`, `specs[]`, `applications[]`, `testimonial?`

### Priority 3 — Industry Display Metadata
Add `displayMetadata` sub-object to `UnifiedIndustry`:
`catalogueTitle`, `catalogueSubtitle`, `catalogueDescription`, `features[]`, `benefits[]`, `statistic`, `statisticSource`

### Priority 4 — Protection Domains
Add new `UnifiedProtectionDomain` interface and `PROTECTION_DOMAINS` record:
`number`, `headline`, `description`, `contaminants[]`, `equipment[]`, `productFamilies[]`

### Priority 5 — New Entity Types
Add new top-level interfaces: `UnifiedComponent`, `UnifiedProblem`, `UnifiedProductFamily`, `UnifiedCaseStudy`

---

## Implementation Sequence

Phase 3B creates 105 new notes. Recommended creation order to build the graph incrementally:

| Step | Folder | Count | Notes |
|------|--------|-------|-------|
| 1 | `06-components/` | 20 | No dependencies — can be created immediately |
| 2 | `07-problems/` | 20 | Depends on ContaminationMode + Component notes |
| 3 | `08-product-families/` | 30 | Depends on Technology + System notes |
| 4 | `09-products/` | 36 | Depends on ProductFamily + Technology + Standard notes |
| 5 | `10-case-studies/contamination/` | 3 | Depends on ContaminationMode + Technology + Component + Problem notes |
| 6 | `10-case-studies/fleet/` | 3 | Depends on Industry + Technology + ProductFamily notes |
| 7 | `11-articles/standards/` | 6 | Depends on Standard + Technology + Industry notes |
| 8 | `11-articles/compare/` | 4 | Depends on Technology + Standard + ProductFamily notes |
| 9 | `11-articles/fleet/` | 3 | Depends on CaseStudy + Industry + ProductFamily notes |
| 10 | `03-systems/protection-domain/` | 5 | Depends on ProductFamily + Technology + Contamination notes |

**Phase 3A notes** (01–05) must be complete before Phase 3B begins. They provide the foundational reference nodes that all Phase 3B entities link to.

---

## Validation Checklist

For each entity note created in Phase 3B:

- [ ] `type` field matches entity type exactly
- [ ] `key` field is SCREAMING_SNAKE_CASE
- [ ] All required fields present and non-empty
- [ ] All relationship fields use `[[KEY]]` format (not raw strings)
- [ ] `in_unified_data` boolean is accurate
- [ ] Tags include entity-type tag + status tag + domain tag(s) + ud-status tag
- [ ] Note body includes `## Relationships` section with wikilinks using display alias format
- [ ] Note body includes `## AI Retrieval` section with full canonical knowledge block
- [ ] HYDROCORE and THERMOCORE metric notes carry `# TODO: unverified metrics` annotation
- [ ] Placeholder tokens documented in Case Study notes where present
- [ ] Deprecated Technology notes link to replacement; replacement notes back-reference predecessor

---

*Architecture only. No code modifications. No UD changes. No page generation.*
*Phase 3B authorizes creation of Obsidian notes only — all other automation remains out of scope.*
