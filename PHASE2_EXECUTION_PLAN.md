# PHASE2_EXECUTION_PLAN.md
## Phase 2 — Single Source of Truth

**Date**: 2026-06-02
**Branch**: `claude/dazzling-franklin-ALGY1`
**Objective**: Create one authoritative TypeScript source for all Industries, Systems, Technologies, Problems (Contamination Modes), and Components (Standards) across the entire platform — including Part Search and AI Engine consumption layers.

---

## Table of Contents

1. [Current State Architecture](#1-current-state-architecture)
2. [Authority Analysis](#2-authority-analysis)
3. [Duplication Audit](#3-duplication-audit)
4. [Conflict Audit](#4-conflict-audit)
5. [Disconnected Data Audit](#5-disconnected-data-audit)
6. [Deprecation Determinations](#6-deprecation-determinations)
7. [Preservation Determinations](#7-preservation-determinations)
8. [Obsidian Integration Layer](#8-obsidian-integration-layer)
9. [Part Search Consumption Architecture](#9-part-search-consumption-architecture)
10. [AI Engine Consumption Architecture](#10-ai-engine-consumption-architecture)
11. [Future State Architecture](#11-future-state-architecture)
12. [Migration Strategy](#12-migration-strategy)
13. [Risk Analysis](#13-risk-analysis)
14. [Dependency Analysis](#14-dependency-analysis)
15. [Recommended Execution Order](#15-recommended-execution-order)

---

## 1. Current State Architecture

### 1.1 Registry Inventory

The application maintains **five independent data registries** — none synchronised. A change to one is never reflected in any other. There is no single authoritative source for any entity type.

---

#### Registry A — `catalogue.json` + `catalogue.ts`

**Location**: `/frontend/catalogue.json` (data) + `/frontend/src/lib/catalogue.ts` (loader)
**Consumed by**: All industry pages (`/industries/[slug]`), all system pages (`/systems/[slug]`), all technology pages (`/technologies/[slug]`), home page stats, CTA buttons
**Page count affected**: 38+ static pages
**Purpose**: Page rendering — display names, hero text, feature lists, benefit lists, stat blocks, CTA labels

**Entity counts**:
- Industries: **12** — Agriculture, Automotive, Bus Coach, Construction, Manufacturing, Marine, Mining, Oil Gas, Power Generation, Railway, Trucks Fleets, Waste Municipal
- Products/Systems: **12** — Airfilter, Aquaguard Series, Cabin, Coolant, Dryer, Fuel, Housing, Hydraulic, Kits, Marine, Oil, Water
- Technologies: **12** — Aquaguard Series, Aquaguard, Cooltech, Drycore, Duratech, Intekcore, Macrocore, Marineclean, Microkappa, Nanoforce, Syntepore, Syntrax

**Schema fields available**: `name`, `file`, `title`, `subtitle`, `description`, `features[]`, `benefits[]`, `techTags[]`, `stats{}`, `cta`, `videoBody[]?`, `engineeringBody?`, `statistic?`, `statisticSource?`

**Cross-reference method**: `techTags: ['MACROCORE™', 'AQUAGUARD™']` — loose display strings with ™ symbols. No foreign key. No compile-time validation. A typo (`MACRCORE™`) is silent at build time and invisible at runtime.

**Critical gaps**: No contamination modes. No standards. No relational mappings. No contamination exposure levels. No equipment lists. No operating conditions. No performance metrics with ISO context.

---

#### Registry B — `knowledge-architecture.ts`

**Location**: `/frontend/src/lib/knowledge-architecture.ts`
**Consumed by**: **Nobody** — `grep -rn "import.*knowledge-architecture" src/` returns zero matches. Confirmed data island.
**Purpose**: Relational graph — technologies ↔ standards ↔ contamination modes ↔ industries

**Entity counts**:
- Technologies: **6** of 12 — MACROCORE, NANOFORCE, MICROKAPPA, SYNTRAX, AQUAGUARD, DURATECH
- Industries: **7** of 12 — AGRICULTURE, CONSTRUCTION, MINING, MARINE, AUTOMOTIVE, MANUFACTURING, POWER_GENERATION
- Standards: **6** — ISO_16889, ISO_4406, ISO_5011, ASTM_D6304, SAE_J1539, NFPA_T214
- Contamination Modes: **3** — DIESEL_WATER, PARTICLE_WEAR, HYDRAULIC_CONTAMINATION
- Comparison Topics: **1** — OEM_VS_AFTERMARKET
- Fleet Optimization: **3** strategies
- Educational Pathways: **3** — TECHNICIAN_ONBOARDING, EQUIPMENT_OPERATOR, FLEET_MANAGER

**Additional exports** (not present in any other registry):
- `COMPARISON_TOPICS` — OEM vs aftermarket analysis structure
- `FLEET_OPTIMIZATION` — maintenance, performance tracking, operational efficiency
- `EDUCATIONAL_PATHWAYS` — sequenced learning paths for three user roles
- Seven query functions: `getTechnologyByIndustry`, `getContaminationByTechnology`, `getStandardsByTechnology`, `getRelatedTechnologies`, `getIndustriesBySeverity`, `getAllTechnologiesByFeature`, `mapKnowledgeNetwork`

**Cross-reference method**: Typed constant keys (`'MACROCORE'`, `'ISO_16889'`). TypeScript validates at compile time. Bidirectional traversal via query functions. The most architecturally correct registry in the codebase — but completely unused.

---

#### Registry C — `techPagesData.ts`

**Location**: `/frontend/src/app/technologies/[slug]/techPagesData.ts`
**Consumed by**: `/technologies/[slug]/page.tsx` — the technology detail page renderer
**Purpose**: Narrative content — hero sections, system explanations, stage breakdowns, application sectors, testimonials, CTAs

**Entity count**: **12** — all technologies: `aquaguard-series`, `syntrax`, `nanoforce`, `macrocore`, `intekcore`, `syntepore`, `aquaguard`, `cooltech`, `drycore`, `duratech`, `marineclean`, `microkappa`

**Schema fields**: `categoryTag`, `heroTitle`, `heroSubtitle`, `heroTagline`, `heroImage`, `heroStats[]`, `logoSrc`, `systemHeadline`, `systemParagraphs[]`, `productImageSrc`, `productImageCaption`, `stagesHeading`, `stages[{number, tag, title, body, stat, statLabel}]`, `specs[]`, `applicationsHeading`, `applicationsSubtext`, `applications[{sector, detail}]`, `testimonial{quote, role, sector}`, `ctaTag`, `ctaHeading`, `ctaBody`

**Cross-reference method**: None. Standalone narrative layer. No foreign key to standards, contamination modes, industries, or systems.

---

#### Registry D — `GEO_DEFINITIONS` (inline in `technologies/page.tsx`)

**Location**: Lines 8–21 of `/frontend/src/app/technologies/page.tsx`
**Consumed by**: That page only — used for JSON-LD structured data and GEO prose descriptions
**Purpose**: Machine-readable one-paragraph definitions for LLM and search crawler consumption

**Entity count**: **12** — all technologies (same set as techPagesData.ts), keyed by slug
**Schema**: `Record<slug, string>` — single long-form prose paragraph per technology

**Content quality**: These are the most technically precise definitions in the entire codebase. They include ISO standards references, micron ratings, operating temperatures, and failure mechanism descriptions. They are the closest thing to a Canonical Knowledge Block currently available. They should be the canonical definition layer, not an inline page constant.

---

#### Registry E — `TECH_COMPARISON` (inline in `technologies/page.tsx`)

**Location**: Lines 23–33 of `/frontend/src/app/technologies/page.tsx`
**Consumed by**: That page only — renders the technology comparison table on the hub
**Purpose**: Technical comparison data for the hub page table

**Entity count**: **9** of 12 — Macrocore, Syntepore, Intekcore, Drycore, Aquaguard, Syntrax, Nanoforce, Cooltech, Microkappa
**Missing from table**: Aquaguard Series, Duratech, Marineclean

**Schema per row**: `name`, `slug`, `system`, `func`, `metric`, `industries`

**Note**: The `system` field maps technologies to protection system domains (Air Intake, Fuel Cleanliness, Lubrication, Hydraulic, Compressed Air, Cooling System, Cabin Protection). This domain taxonomy does not exist anywhere else in the codebase but is critical architectural information for Part Search and AI Engine routing.

---

### 1.2 Entity Count Conflict Matrix

| Entity Type | catalogue.json | knowledge-architecture.ts | techPagesData.ts | GEO_DEFINITIONS | TECH_COMPARISON |
|-------------|:---:|:---:|:---:|:---:|:---:|
| Technologies | **12** | **6** | **12** | **12** | **9** |
| Industries | **12** | **7** | — | — | — |
| Systems | **12** | **0** | — | — | — |
| Standards | **0** | **6** | — | — | — |
| Contamination Modes | **0** | **3** | — | — | — |

**The core problem in one number**: Technologies appear in five registries with five different counts. No registry agrees with any other on completeness.

---

### 1.3 Slug Generation Risk

`catalogue.ts`'s `getSlug()` derives URL slugs dynamically: `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`. Current slug outcomes:

| Display Name | Generated Slug | Existing URL Path |
|---|---|---|
| `Aquaguard Series` | `aquaguard-series` | `/technologies/aquaguard-series` ✅ |
| `Syntrax` | `syntrax` | `/technologies/syntrax` ✅ |
| `Bus Coach` | `bus-coach` | `/industries/bus-coach` ✅ |
| `Oil Gas` | `oil-gas` | `/industries/oil-gas` ✅ |
| `Airfilter` | `airfilter` | `/systems/airfilter` ✅ |
| `Trucks Fleets` | `trucks-fleets` | `/industries/trucks-fleets` ✅ |

All current slugs match their existing `out/` directory names. Any `name` change in `unified-data.ts` that alters the slug derivation creates a 404 on an existing indexed URL. The unified schema must include an explicit `slug` field to decouple display name from URL.

---

## 2. Authority Analysis

### 2.1 What Is Currently the Authoritative Source

There is no single authoritative source. Each domain has a de facto authority by virtue of being the only file actually consumed by pages:

| Entity Type | De Facto Authority | Why |
|---|---|---|
| Industry display content | `catalogue.json` | Only consumed source for all industry pages |
| System display content | `catalogue.json` | Only consumed source for all system pages |
| Technology display content | `catalogue.json` | Only source for hub page rendering |
| Technology narrative content | `techPagesData.ts` | Only source for detail page rendering |
| Technology GEO definitions | `GEO_DEFINITIONS` inline | Only source for JSON-LD output |
| Technology comparison data | `TECH_COMPARISON` inline | Only source for comparison table |
| Relational graph (tech↔industry) | `knowledge-architecture.ts` | Only file with typed relational data — but **consumed by nobody** |
| Standards | `knowledge-architecture.ts` | Only file with standards data — but **consumed by nobody** |
| Contamination Modes | `knowledge-architecture.ts` | Only file with contamination data — but **consumed by nobody** |
| Logo file mapping | `getTechLogoFile()` in `catalogue.ts` | Only explicit logo→file map |
| URL slug derivation | `getSlug()` in `catalogue.ts` | Only slug generation function |

### 2.2 What Should Become the Authoritative Source

**Single file**: `/frontend/src/lib/unified-data.ts`

This file becomes the authority for all five entity types across the entire platform:

| Entity Type | Authority After Phase 2 |
|---|---|
| Industries (12) | `unified-data.ts` → `UNIFIED_INDUSTRIES` |
| Systems (12) | `unified-data.ts` → `UNIFIED_SYSTEMS` |
| Technologies (12) | `unified-data.ts` → `UNIFIED_TECHNOLOGIES` |
| Contamination Modes (6+) | `unified-data.ts` → `UNIFIED_CONTAMINATION_MODES` |
| Standards (11+) | `unified-data.ts` → `UNIFIED_STANDARDS` |
| Query functions | `unified-data.ts` → re-exported from `knowledge-architecture.ts` (thin wrapper) |
| GEO definitions | `unified-data.ts` → `geoDefinition` field on `UnifiedTechnology` |
| Comparison data | `unified-data.ts` → `systemDomain`, `comparisonFunction`, `comparisonMetric` fields |
| Logo mappings | `unified-data.ts` → explicit `logoFile` field on `UnifiedTechnology` |
| Explicit slugs | `unified-data.ts` → explicit `slug` field on every entity |

The **narrative content layer** (`techPagesData.ts`) is intentionally excluded. It serves a different purpose and different audience than the data layer. It remains an independent file that imports context from `unified-data.ts` but is not merged into it.

---

## 3. Duplication Audit

### 3.1 Technology Descriptions — Three Versions

Each technology has three separate descriptions written for different contexts, stored in different files, with no synchronisation:

| Technology | `catalogue.json` description | `GEO_DEFINITIONS` prose | `knowledge-architecture.ts` description |
|---|---|---|---|
| MACROCORE | 5-line product description, ISO 5011 reference | Full technical paragraph, ISO 5011, PDG explained, 62 PSI | One-line architectural summary |
| NANOFORCE | Product description, HYDROGUARD reference | Full technical paragraph, hydraulic/vapor control | One-line summary |
| SYNTRAX | AI-engineered protection language | Full technical paragraph, ISO 4406 16/14/11, soot %, drain interval | One-line summary |
| (9 others) | Similar pattern | Similar pattern | Not present (6 of 12 are missing entirely) |

**Duplication risk**: If the ISO standard for a technology changes, three separate description fields must be updated manually, with no enforcement mechanism ensuring consistency.

**Resolution**: `unified-data.ts` defines one `description` field (short, from `catalogue.json`) and one `geoDefinition` field (long-form technical, from `GEO_DEFINITIONS`). The `knowledge-architecture.ts` one-line summaries are retired in favour of these two.

---

### 3.2 Technology-Industry Mappings — Two Competing Sources

Technology-to-industry relationships are expressed in two places with different formats and different content:

| Source | Format | Example (MACROCORE applicable industries) |
|---|---|---|
| `catalogue.json` industries `techTags` | Loose string array with ™ | Agriculture has `['MACROCORE™', 'AQUAGUARD™', 'SYNTRAX™', 'NANOFORCE™']` |
| `knowledge-architecture.ts` TECHNOLOGIES `applicableIndustries` | Typed constant key array | `MACROCORE.applicableIndustries = ['AGRICULTURE', 'MINING', 'CONSTRUCTION', 'POWER_GEN', 'MARINE']` |
| `TECH_COMPARISON` rows `industries` | Free text string | `'Mining, Agriculture, Construction, Power Gen'` |

**Conflict example — Construction industry technologies**:
- `catalogue.json` Construction `techTags`: `['MACROCORE™', 'NANOFORCE™', 'AQUAGUARD™', 'SYNTRAX™']`
- `knowledge-architecture.ts` CONSTRUCTION `applicableTechnologies`: `['MACROCORE', 'NANOFORCE', 'DURATECH']`
- These two sources disagree: catalogue.json includes AQUAGUARD and SYNTRAX for Construction; knowledge-architecture.ts includes DURATECH but not AQUAGUARD or SYNTRAX.

**Resolution**: `unified-data.ts` defines the authoritative `applicableTechnologies[]` array per industry using typed constant keys. The `techTags` field is retained on `UnifiedSystem` for backwards compatibility during migration but marked deprecated.

---

### 3.3 Aquaguard / Aquaguard Series — Ambiguous Duplication

Both `catalogue.json` and `techPagesData.ts` maintain separate entries for `Aquaguard` and `Aquaguard Series`. These are architecturally distinct:

| Entity | What it is |
|---|---|
| `AQUAGUARD™` | The hydrophobic water-separation technology/media — the core filtration mechanism. Present in `knowledge-architecture.ts` as `AQUAGUARD`. |
| `AQUAGUARD/SERIES™` | The FH 900/1000 product line — a three-stage housing system that uses `AQUAGUARD™` as its Stage 3 barrier. Not in `knowledge-architecture.ts`. |

**Resolution**: Two distinct entities in `unified-data.ts`. `AQUAGUARD` is the technology. `AQUAGUARD_SERIES` is the product line. The relationship is expressed as `AQUAGUARD_SERIES.primaryTechnology = 'AQUAGUARD'`.

---

## 4. Conflict Audit

### 4.1 Technology-Industry Relationship Conflicts

The most significant data conflict in the codebase. For the seven industries that exist in both `catalogue.json` (via `techTags`) and `knowledge-architecture.ts` (via `applicableTechnologies`), the technology lists disagree:

| Industry | catalogue.json techTags | knowledge-architecture.ts applicableTechnologies | Conflict |
|---|---|---|---|
| Agriculture | MACROCORE, AQUAGUARD, SYNTRAX, NANOFORCE | MACROCORE, NANOFORCE, DURATECH, SYNTRAX | Missing AQUAGUARD in knowledge-arch; missing DURATECH in catalogue |
| Construction | MACROCORE, NANOFORCE, AQUAGUARD, SYNTRAX | MACROCORE, NANOFORCE, DURATECH | Missing AQUAGUARD+SYNTRAX in knowledge-arch; missing DURATECH in catalogue |
| Mining | MACROCORE, SYNTRAX, NANOFORCE, AQUAGUARD, SYNTEPORE | MACROCORE, NANOFORCE, DURATECH, SYNTRAX | Missing AQUAGUARD+SYNTEPORE in knowledge-arch; missing DURATECH in catalogue |
| Marine | MACROCORE, AQUAGUARD, SYNTRAX, NANOFORCE | NANOFORCE, AQUAGUARD, DURATECH, SYNTRAX | Missing MACROCORE in knowledge-arch; missing DURATECH in catalogue |
| Automotive | SYNTRAX, MACROCORE, SYNTEPORE, MICROKAPPA | MACROCORE, NANOFORCE, DURATECH | Missing SYNTRAX+SYNTEPORE+MICROKAPPA in knowledge-arch; missing NANOFORCE in catalogue |
| Manufacturing | MACROCORE, SYNTRAX, AQUAGUARD, NANOFORCE | NANOFORCE, MICROKAPPA, SYNTRAX | MACROCORE+AQUAGUARD in catalogue only; MICROKAPPA in knowledge-arch only |
| Power Generation | SYNTEPORE, SYNTRAX, AQUAGUARD, DRYCORE | MACROCORE, NANOFORCE, AQUAGUARD, SYNTRAX | SYNTEPORE+DRYCORE in catalogue only; MACROCORE+NANOFORCE in knowledge-arch only |

**Root cause**: The two sources were authored independently with different intent. `catalogue.json` reflects marketing-level technology groupings. `knowledge-architecture.ts` reflects technical contamination-based assignments. Neither is the complete picture.

**Resolution strategy**: `unified-data.ts` must reconcile these conflicts by cross-referencing:
1. `techTags` from catalogue.json (marketing intent)
2. `applicableTechnologies` from knowledge-architecture.ts (technical intent)
3. `applications[].sector` from techPagesData.ts (field validation — which industries are described in narrative content as applicable)
4. `TECH_COMPARISON.industries` from technologies/page.tsx (operational confirmation)

Any remaining ambiguity after cross-referencing should be flagged `// RECONCILE: conflicting sources` and escalated to the project owner before the entry is considered authoritative.

---

### 4.2 Technology Description Conflicts

| Technology | catalogue.json description | GEO_DEFINITIONS description | Conflict |
|---|---|---|---|
| DURATECH | "Master kit consolidation with OEM interchangeability delivering fleet-ready solutions for standardized maintenance" | "DURATECH™ is a fleet maintenance standardisation system that consolidates OEM-interchangeable filtration components into master kits" | Consistent framing; different emphasis |
| SYNTRAX | "AI-engineered multi-layer protection system defending turbocharged engines from sub-micron contamination" | "SYNTRAX™ is a synthetic lubrication protection architecture maintaining ISO 4406 cleanliness codes (16/14/11) throughout extended drain intervals" | **Significant conflict**: catalogue.json frames SYNTRAX as air intake protection ("turbocharged engines, sub-micron contamination"), but knowledge-architecture.ts and GEO_DEFINITIONS frame it as lubrication/oil filtration (ISO 4406, drain intervals, soot capture). The systems page `Oil` also uses SYNTRAX for lube oil. The `TECH_COMPARISON` table lists SYNTRAX as `system: 'Lubrication'`. The catalogue.json technology description is wrong. |
| NANOFORCE | "Multi-layer hydraulic filtration architecture engineered for high-pressure hydraulic circuits with vapor control" | "NANOFORCE™ is a multi-layer hydraulic filtration architecture engineered for high-pressure hydraulic circuits in heavy industrial machinery" | Consistent — same framing, different detail level |

**Most critical conflict**: SYNTRAX is described as an air intake/engine protection technology in `catalogue.json` but as a lubrication/oil technology everywhere else. The `Oil` system page (which uses SYNTRAX as its primary technology) and the `TECH_COMPARISON` table both confirm SYNTRAX is lubrication. The `catalogue.json` technology entry description is incorrect.

**Resolution**: `unified-data.ts` uses GEO_DEFINITIONS prose as the authoritative long-form definition. It is the most technically precise, the most consistently authored, and validated by cross-referencing with the correct system assignments.

---

### 4.3 SYNTRAX Asset File Conflict

| Context | Spelling used |
|---|---|
| All pages, all text | `SYNTRAX` |
| `knowledge-architecture.ts` key | `SYNTRAX` |
| `techPagesData.ts` entry | `syntrax` |
| `GEO_DEFINITIONS` key | `syntrax` |
| Logo asset file name | `logo-sintrax.png` (note: S-I-N-T-R-A-X) |
| `getTechLogoFile()` mapping | `Syntrax: 'logo-sintrax.png'` (explicit, correct) |

The logo asset was saved with a typo. The `getTechLogoFile()` function compensates with an explicit mapping so no page breaks. However, if logo derivation is ever changed to auto-derive from the technology key (`logo-${key.toLowerCase()}.png`), it would break by producing `logo-syntrax.png` (which does not exist).

**Resolution**: The `unified-data.ts` `UnifiedTechnology` schema includes an explicit `logoFile` field set to `'logo-sintrax.png'` for SYNTRAX. The logo filename should not be renamed (it would require a build asset update) but must remain an explicit mapping, never auto-derived.

---

### 4.4 Standard Code Conflicts

`knowledge-architecture.ts` defines `ISO 16889` as "Cleanliness Coding System" with description "Particle cleanliness classification with 4-digit code." The actual ISO 16889 standard is the **hydraulic fluid power** multi-pass method for evaluating filtration element performance (Beta ratio testing). ISO 4406 is the cleanliness coding standard.

The descriptions in `knowledge-architecture.ts`:
- `ISO_16889`: described as "Cleanliness Coding System" — **incorrect** (this is ISO 4406's role)
- `ISO_4406`: described as "Legacy Cleanliness Code" — **incorrect** (ISO 4406 is current and primary; the 1999 and 2021 revisions are both in use)

**Resolution**: Both standard descriptions must be corrected in `unified-data.ts`. ISO 16889 = Beta ratio test method (filter performance testing). ISO 4406 = particle cleanliness code classification (current standard, not "legacy").

---

## 5. Disconnected Data Audit

### 5.1 Systems Have Zero Relational Data

All 12 systems in `catalogue.json` products array have display content but no relational connections:

| System | Technology used | In `catalogue.json` as | Has standard references? | Has contamination links? | Has industry links? |
|---|---|---|---|---|---|
| Airfilter | MACROCORE | `techTags: ['MACROCORE™']` | No | No | No |
| Aquaguard Series | AQUAGUARD + AQUAGUARD_SERIES | `techTags: ['AQUAGUARD/SERIES™', 'AQUAGUARD™']` | No | No | No |
| Cabin | MICROKAPPA | `techTags: ['MICROKAPPA™']` | No | No | No |
| Coolant | COOLTECH | `techTags: ['COOLTECH™']` | No | No | No |
| Dryer | DRYCORE | `techTags: ['DRYCORE™']` | No | No | No |
| Fuel | SYNTEPORE + AQUAGUARD | `techTags: ['AQUAGUARD™', 'SYNTEPORE™']` | No | No | No |
| Housing | INTEKCORE + MACROCORE | `techTags: ['INTEKCORE™', 'MACROCORE™']` | No | No | No |
| Hydraulic | NANOFORCE | `techTags: ['NANOFORCE™']` | No | No | No |
| Kits | DURATECH | `techTags: ['DURATECH™']` | No | No | No |
| Marine | MARINECLEAN | `techTags: ['MARINECLEAN™']` | No | No | No |
| Oil | SYNTRAX | `techTags: ['SYNTRAX™']` | No | No | No |
| Water | AQUAGUARD | `techTags: ['AQUAGUARD™']` | No | No | No |

Every relational link for systems must be authored from scratch in `unified-data.ts`. The `techTags` strings are the only starting point.

### 5.2 Five Industries Exist Nowhere in the Relational Graph

Bus Coach, Railway, Trucks Fleets, Oil Gas, and Waste Municipal have full display content in `catalogue.json` but zero presence in `knowledge-architecture.ts`. They have:
- No contamination exposure rating
- No primary equipment list
- No applicable technologies (typed)
- No applicable standards
- No operating conditions

Their only technology linkage is the loose `techTags` strings in `catalogue.json`, which conflict with the relational assignments in `knowledge-architecture.ts` for the seven industries that do exist there.

### 5.3 Six Technologies Have No Relational Data

SYNTEPORE, INTEKCORE, DRYCORE, COOLTECH, MARINECLEAN, and AQUAGUARD_SERIES have full display content and narrative content but zero presence in `knowledge-architecture.ts`. They have:
- No related standards
- No contamination modes addressed
- No applicable industries (typed)
- No key metrics with ISO context

Their only connection to other entities is the loose `techTags` strings on the industries that reference them.

### 5.4 Comparison Topics and Fleet Optimization Are Completely Isolated

`knowledge-architecture.ts` defines `COMPARISON_TOPICS`, `FLEET_OPTIMIZATION`, and `EDUCATIONAL_PATHWAYS` — three rich data structures with no consumer anywhere in the codebase. The Knowledge System pages (`/knowledge-system/compare/*` and `/knowledge-system/fleet/*`) do not import these structures. They are defined but never read.

**These structures are valuable and should be connected**, not eliminated. Phase 4 (Knowledge Graph) and Phase 5 (Part Search Intelligence) both depend on these being wired to page components.

### 5.5 `TECH_COMPARISON` System Domain Taxonomy Is Unique

The `system` field in `TECH_COMPARISON` provides the only canonical mapping of technologies to protection system domains:

| System Domain | Technologies |
|---|---|
| Air Intake | MACROCORE, SYNTEPORE, INTEKCORE |
| Compressed Air | DRYCORE |
| Fuel Cleanliness | AQUAGUARD |
| Lubrication | SYNTRAX |
| Hydraulic | NANOFORCE |
| Cooling System | COOLTECH |
| Cabin Protection | MICROKAPPA |

This taxonomy exists only in an inline constant on one page. It is not referenced by any other data structure. Part Search and AI Engine both need this domain classification to route queries to the correct filtration system. It must be elevated to a first-class field in `unified-data.ts`.

---

## 6. Deprecation Determinations

### What Should Be Deprecated

| File / Structure | Deprecation Determination | Rationale |
|---|---|---|
| `catalogue.json` | **Deprecate as primary data source** — move to `/docs/data-archive/catalogue.json.bak` | `unified-data.ts` becomes the data source; `catalogue.ts` will import from it instead. The JSON file has no relational structure, no standards, and no contamination data. It is superseded entirely. |
| `GEO_DEFINITIONS` inline constant in `technologies/page.tsx` | **Deprecate inline** — content migrated to `geoDefinition` field in `unified-data.ts` | An inline `Record<string, string>` on a page component is not maintainable as the definition layer for an AI Citation system. Content is preserved, location is not. |
| `TECH_COMPARISON` inline constant in `technologies/page.tsx` | **Deprecate inline** — content migrated to structured fields in `unified-data.ts` | Same reason. The system domain taxonomy (`systemDomain`) and comparison data (`comparisonFunction`, `comparisonMetric`) belong in the unified schema. |
| `knowledge-architecture.ts` (as data store) | **Convert to thin re-export adapter** — not deleted | Becomes a 20-line file that re-exports `TECHNOLOGIES`, `INDUSTRIES`, `STANDARDS`, `CONTAMINATION_MODES` from `unified-data.ts`. Preserves the import path for Phase 4 Knowledge System pages that will use `import { getTechnologyByIndustry } from '@/lib/knowledge-architecture'`. |
| `TECH_COMPARISON.industries` free-text strings | **Deprecate free text** — replaced by typed `applicableIndustries[]` keys in unified schema | `'Mining, Agriculture, Construction, Power Gen'` is not machine-readable. The unified schema uses `['MINING', 'AGRICULTURE', 'CONSTRUCTION', 'POWER_GEN']`. |
| `catalogue.json` technology entry `description` for SYNTRAX | **Deprecate description text** — replace with GEO_DEFINITIONS version | The catalogue.json SYNTRAX description incorrectly frames it as air intake protection. The GEO_DEFINITIONS version is correct. |

---

## 7. Preservation Determinations

### What Should Be Preserved

| File / Structure | Preservation Determination | Rationale |
|---|---|---|
| `techPagesData.ts` | **Preserve unchanged** | The narrative content layer (hero text, stage descriptions, testimonials) serves a different audience and purpose than the data layer. It is intentionally separate. As Phase 4 develops, it may reference `unified-data.ts` for cross-links, but the narrative content itself is not merged. |
| `catalogue.ts` API surface | **Preserve interface** — change internal implementation | All page components import from `catalogue.ts`. The public exports (`catalogue.industries`, `catalogue.products`, `catalogue.technologies`, `getSlug()`, `getItemBySlug()`, `CATEGORY_LABELS`, `CATEGORY_URLS`, `CATEGORY_ICONS`, `getTechLogoFile()`) must remain unchanged in signature. Only the internal data source changes from `catalogue.json` to `unified-data.ts`. |
| `getTechLogoFile()` explicit mappings | **Preserve explicit map** — never auto-derive | The SYNTRAX → `logo-sintrax.png` mapping compensates for a typo in the asset filename. Explicit mapping must be preserved. After Phase 2, the `logoFile` field in `unified-data.ts` becomes the source of truth for `getTechLogoFile()` rather than a duplicated inline map. |
| `COMPARISON_TOPICS` from `knowledge-architecture.ts` | **Preserve and promote** — migrate to `unified-data.ts` | This structure defines the OEM vs aftermarket analysis framework. It is the conceptual backbone of the `/knowledge-system/compare/` section. It must be preserved and wired to the Compare pages in Phase 4. |
| `FLEET_OPTIMIZATION` from `knowledge-architecture.ts` | **Preserve and promote** — migrate to `unified-data.ts` | Defines maintenance strategies, performance tracking, and operational efficiency frameworks. These are the conceptual inputs for the `/knowledge-system/fleet/` section. |
| `EDUCATIONAL_PATHWAYS` from `knowledge-architecture.ts` | **Preserve and promote** — migrate to `unified-data.ts` | Three learning paths (Technician, Operator, Fleet Manager) with sequenced module progression. These become the basis for the AI Engine's user-role detection and response routing. |
| All seven query functions | **Preserve and expand** | `getTechnologyByIndustry`, `getContaminationByTechnology`, `getStandardsByTechnology`, `getRelatedTechnologies`, `getIndustriesBySeverity`, `getAllTechnologiesByFeature`, `mapKnowledgeNetwork` all migrate to `unified-data.ts`. Four new functions are added: `getSystemsByTechnology`, `getTechnologiesBySystemDomain`, `getIndustriesByContamination`, `getStandardsByContaminationMode`. |
| All existing URL slugs | **Preserve exactly** | Every slug that maps to an existing `/out/` directory path must be preserved. The `slug` field in `unified-data.ts` is set explicitly, not derived. `getSlug()` is refactored to validate against the explicit slug rather than derive it. |
| `EDUCATIONAL_PATHWAYS` learning sequences | **Preserve and integrate into AI Engine** | The three role-based learning paths are inputs to the AI Engine user routing layer (see Section 10). |

---

## 8. Obsidian Integration Layer

### 8.1 What Obsidian Is and Why It Fits This Architecture

Obsidian is a Markdown-based knowledge management system with a graph view, bidirectional linking, and plugin ecosystem. The ELIMFILTERS knowledge architecture — technologies linked to industries linked to contamination modes linked to standards — is precisely the kind of relational knowledge graph that Obsidian was designed to represent.

**The Obsidian layer is not the data layer.** It is the editorial and documentation layer that feeds `unified-data.ts`, not the other way around.

### 8.2 What Should Eventually Move to Obsidian

| Content type | Current location | Should move to Obsidian? | Rationale |
|---|---|---|---|
| Technical definitions (ISO standards) | `knowledge-architecture.ts` inline | ✅ Yes | Obsidian vault: `/standards/ISO-16889.md` — defines the standard, links to applicable technologies and contamination modes. Authoritative prose that editors can update without touching TypeScript. |
| Technology canonical definitions | `GEO_DEFINITIONS` inline | ✅ Yes | Obsidian vault: `/technologies/MACROCORE.md` — the canonical definition, linked to related standards, contamination modes, and industries. Export pipeline generates the `geoDefinition` field for `unified-data.ts`. |
| Contamination mode failure chains | `knowledge-architecture.ts` contamination records | ✅ Yes | Obsidian vault: `/contamination/PARTICLE_WEAR.md` — failure chain documentation with full root cause → consequence flow. Editorial layer that feeds the `unified-data.ts` `CONTAMINATION_MODES` export. |
| Industry operating profiles | `knowledge-architecture.ts` industry records | ✅ Yes | Obsidian vault: `/industries/MINING.md` — primary equipment, contamination exposure ratings, applicable standards. Editorial source for `unified-data.ts` industry entries. |
| Fleet optimization strategies | `FLEET_OPTIMIZATION` in knowledge-architecture.ts | ✅ Yes | Obsidian vault: `/fleet/maintenance-strategies.md` — written documentation for fleet managers. Currently a TypeScript constant; should be prose with structured frontmatter. |
| Educational pathway sequences | `EDUCATIONAL_PATHWAYS` | ✅ Yes | Obsidian vault: `/pathways/technician-onboarding.md` — module sequences as readable documentation with internal links. |
| Product narrative content | `techPagesData.ts` | ✅ Yes (eventually) | Obsidian vault: `/products/MACROCORE-narrative.md` — hero text, stage descriptions, testimonials as long-form editorial content. Not Phase 2 scope. |
| Knowledge System page content | Individual `page.tsx` files | ✅ Yes (Phase 3+) | Obsidian vault mirrors the `/knowledge-system/` content hierarchy. Not Phase 2 scope. |

### 8.3 Obsidian → unified-data.ts Pipeline (Phase 3 Scope)

The flow is:

```
Obsidian Vault (editorial source)
    ↓ frontmatter + body text
Export Script (Node.js, reads vault markdown files)
    ↓ generates TypeScript
unified-data.ts (machine-readable, consumed by app + API + AI Engine)
    ↓
Knowledge System pages, Part Search API, AI Engine
```

**Frontmatter format** (what Obsidian files will export):
```yaml
---
type: technology
key: MACROCORE
slug: macrocore
name: MACROCORE™
category: Air Filtration
relatedStandards: [ISO_5011, SAE_J726, ISO_16889]
addressesContamination: [PARTICLE_WEAR]
applicableIndustries: [AGRICULTURE, MINING, CONSTRUCTION, POWER_GEN, MARINE]
keyMetrics:
  efficiency: "99.98%"
  pressureDrop: "62 PSI"
  thermalRating: "120C"
  particleCaptureSize: "5-25 microns"
---

# MACROCORE™ — Canonical Definition

MACROCORE™ is a Progressive Density Gradient (PDG) multi-layer air filtration system...
```

The body text becomes the `geoDefinition`. The frontmatter becomes the relational fields. The export script generates the TypeScript constant.

**Phase 2 does not implement this pipeline.** Phase 2 creates `unified-data.ts` with all content authored manually. Phase 3 implements the Obsidian export script that regenerates `unified-data.ts` from vault content. After Phase 3, the Obsidian vault is the single editorial source; `unified-data.ts` is a generated artifact.

### 8.4 What Does NOT Move to Obsidian

| Content | Stays Where? | Rationale |
|---|---|---|
| TypeScript interfaces and type definitions | `unified-data.ts` | Types are code, not editorial content. Never in Obsidian. |
| Query functions | `unified-data.ts` | Functions are code. Never in Obsidian. |
| Page component JSX | `page.tsx` files | UI code. Never in Obsidian. |
| Build configuration | `next.config.ts`, `tsconfig.json` | Infrastructure. Never in Obsidian. |
| Product narrative content (hero, stages, testimonials) | `techPagesData.ts` initially | May move to Obsidian in Phase 3 as editorial content, but the React component that renders it stays in TypeScript. |

---

## 9. Part Search Consumption Architecture

### 9.1 What Part Search Is

Part Search (`part-search.elimfilters.com`) is the external cross-reference tool that allows users to search 500,000+ OEM part numbers and identify the corresponding ELIMFILTERS® SKU. It is a separate application from the World Catalogue.

### 9.2 Current State

Part Search currently has no connection to `unified-data.ts` (which does not yet exist) or `knowledge-architecture.ts` (which is a data island). It operates as an isolated SKU lookup database. The `/api/search` endpoint in `server.js` queries a PostgreSQL database (`DATABASE_URL`) with no semantic knowledge of the product hierarchy.

### 9.3 How Part Search Should Consume unified-data.ts

Part Search needs `unified-data.ts` as its **product context layer**. When a user finds a filter SKU, Part Search currently returns only the SKU match. With `unified-data.ts`, it can return:

1. **System domain** — which protection system does this filter belong to (Air Intake, Hydraulic, Fuel Cleanliness, etc.)
2. **Applicable industries** — which industries use this type of filter
3. **Contamination addressed** — what problems does this filter class solve
4. **Related standards** — what ISO standards validate this filter type
5. **Recommended bundle** — what other filters should be replaced at the same service event (cross-selling via `DURATECH™` kit logic)
6. **Alternative technologies** — if the searched filter is a competitor SKU, which ELIMFILTERS technology is the equivalent

**Consumption method**:

```
unified-data.ts
    ↓ npm package or shared module
@elimfilters/product-data (internal package)
    ↓
Part Search API (`/api/search`)
    ↓ enriches search results with context
Part Search frontend (result cards with contamination context)
```

**Alternatively**, without a shared package:

```
unified-data.ts
    ↓ export as JSON at build time
/frontend/out/api/product-data.json (static endpoint)
    ↓ fetched by Part Search
Part Search API (reads JSON, enriches results)
```

### 9.4 Specific Data Requirements for Part Search

| Part Search feature | Data from unified-data.ts | Source field |
|---|---|---|
| "This filter protects your: Hydraulic System" | System domain classification | `UNIFIED_TECHNOLOGIES[techKey].systemDomain` |
| "Applicable to: Mining, Construction, Marine" | Industry list | `UNIFIED_TECHNOLOGIES[techKey].applicableIndustries[]` |
| "Addresses: Hydraulic Contamination" | Contamination mode | `UNIFIED_TECHNOLOGIES[techKey].addressesContamination[]` |
| "Validated against: ISO 16889, NFPA T2.14" | Standards | `UNIFIED_TECHNOLOGIES[techKey].relatedStandards[]` |
| "Service bundle: Also replace air intake + oil filter" | System-level bundle logic | Cross-reference `UNIFIED_SYSTEMS` by `applicableIndustries` overlap |
| "Industry profile: Your equipment faces these contamination risks" | Industry profile | `UNIFIED_INDUSTRIES[industryKey].relevantContamination[]` |

### 9.5 Part Search Query Enrichment Flow

```
User searches: "Donaldson P181101" (competitor part number)
    ↓
Part Search PostgreSQL lookup → matched to MACROCORE™ equivalent SKU
    ↓
Enrich with unified-data:
  - MACROCORE.systemDomain = 'Air Intake'
  - MACROCORE.applicableIndustries = ['MINING', 'AGRICULTURE', 'CONSTRUCTION', ...]
  - MACROCORE.addressesContamination = ['PARTICLE_WEAR']
  - MACROCORE.relatedStandards = ['ISO_5011', 'SAE_J726']
    ↓
Return to user:
  "MACROCORE™ Air Intake Filter — protects against particle wear
   Applicable to Mining, Agriculture, Construction
   ISO 5011 certified
   Recommended service bundle: [Fuel + Oil + Hydraulic SKUs for your equipment]"
```

---

## 10. AI Engine Consumption Architecture

### 10.1 What AI Engine Is

The AI Engine is the intelligent question-answering and recommendation layer built on `unified-data.ts`. It is the long-term objective of the Knowledge System: a system where a fleet manager, technician, or equipment operator can describe their equipment or problem and receive a precise, citable filtration recommendation rooted in the ELIMFILTERS knowledge graph.

### 10.2 Why unified-data.ts Is the Foundation

Without `unified-data.ts`, an AI Engine consuming ELIMFILTERS content must:
- Hallucinate technology-industry mappings (no structured source)
- Guess at applicable ISO standards (no typed relationships)
- Generate uncitable recommendations (no canonical knowledge blocks)
- Return inconsistent answers (five unsynchronised registries)

With `unified-data.ts`, the AI Engine has:
- Typed relational graph: every technology-industry-standard-contamination relationship is a typed key
- Canonical definitions: `geoDefinition` fields as citable, versioned definitions
- Query functions: `getTechnologyByIndustry()`, `mapKnowledgeNetwork()` as programmatic resolution paths
- Failure chains: contamination mode `rootCauses[]`, `failureModes[]`, `impacts{}` as structured reasoning inputs

### 10.3 Consumption Architecture

```
User Query (natural language)
    ↓
Query Classification Layer
    ├── Industry detection: "I have a John Deere combine" → AGRICULTURE
    ├── Problem detection: "water in diesel tank" → DIESEL_WATER contamination
    ├── System detection: "hydraulic valve keeps sticking" → HYDRAULIC_CONTAMINATION
    └── Role detection: "fleet manager for 40 vehicles" → FLEET_MANAGER pathway
    ↓
unified-data.ts Query Functions
    ├── getContaminationByTechnology() — what problems does this technology solve
    ├── getTechnologyByIndustry() — what technologies apply to this equipment
    ├── mapKnowledgeNetwork() — full relational graph for the identified node
    └── getStandardsByTechnology() — which ISO standards validate the recommendation
    ↓
Answer Construction Layer
    ├── Primary recommendation: technology + contamination addressed + ISO standard
    ├── Secondary recommendation: bundle (cross-system protection)
    ├── Citable source: geoDefinition[tech] + CONTAMINATION_MODES[mode].impacts{}
    └── Educational pathway: if user is TECHNICIAN_ONBOARDING vs FLEET_MANAGER
    ↓
Response with citations
    "For agricultural combines operating in 1,500+ mg/m³ dust environments,
     MACROCORE™ Air Intake Protection addresses particle wear contamination.
     Source: elimfilters.com/technologies/macrocore
     Standard: ISO 5011 air filter performance rating
     Impact if unaddressed: oil consumption increase 15-40%, compression drop 10-25%"
```

### 10.4 Specific Data Requirements for AI Engine

| AI Engine function | Data from unified-data.ts | Source structure |
|---|---|---|
| Industry → technology recommendation | Typed applicableTechnologies per industry | `UNIFIED_INDUSTRIES[key].applicableTechnologies[]` |
| Problem → technology recommendation | Typed resolvedBy per contamination mode | `UNIFIED_CONTAMINATION_MODES[key].resolvedBy[]` |
| Technology → standard citation | Typed relatedStandards per technology | `UNIFIED_TECHNOLOGIES[key].relatedStandards[]` |
| System domain → technology class | System domain taxonomy | `UNIFIED_TECHNOLOGIES[key].systemDomain` |
| Quantified operational impact | Structured impacts dictionary | `UNIFIED_CONTAMINATION_MODES[key].impacts{}` |
| Failure chain explanation | Root cause → failure mode chain | `UNIFIED_CONTAMINATION_MODES[key].rootCauses[]` + `.failureModes[]` |
| Canonical definition (citable) | Long-form technical prose | `UNIFIED_TECHNOLOGIES[key].geoDefinition` |
| User role routing | Educational pathway sequences | `EDUCATIONAL_PATHWAYS[role].sequence[]` |
| Industry severity triage | Contamination exposure level | `UNIFIED_INDUSTRIES[key].contaminationExposure` |
| Equipment type → industry mapping | Primary equipment lists | `UNIFIED_INDUSTRIES[key].primaryEquipment[]` |

### 10.5 AI Citation Format

With `unified-data.ts` as the knowledge source, the AI Engine produces citable responses:

**Format 1 — Technology recommendation**:
```
RECOMMENDATION: MACROCORE™ Air Intake Protection
ADDRESSES: Particle Wear Contamination (PARTICLE_WEAR)
STANDARD: ISO 5011 filter integrity testing | SAE J726 air filter performance
INDUSTRY: Agriculture (contaminationExposure: HIGH)
QUANTIFIED IMPACT (if ignored): Oil consumption +15–40% | Compression drop 10–25%
SOURCE: elimfilters.com/technologies/macrocore (geoDefinition v1.0)
```

**Format 2 — Failure chain explanation**:
```
CONTAMINATION MODE: Diesel Water Contamination
ROOT CAUSES: Atmospheric breathing → Condensation → Storage corrosion → Transfer contamination
FAILURE CHAIN: Injector stiction → Fuel delivery corrosion → Microbial growth → Lubricity loss
OPERATIONAL IMPACT: Hard starting +5–15s | Fuel consumption +3–8% | Equipment availability -12–18%
RESOLVING TECHNOLOGIES: NANOFORCE, AQUAGUARD, SYNTRAX
APPLICABLE STANDARD: ASTM D6304 (water content in fuels) | ISO 12937
SOURCE: elimfilters.com/knowledge-system/contamination/diesel-water
```

### 10.6 AI Engine and Obsidian Synergy

The Obsidian vault (Phase 3) becomes the editorial layer for the AI Engine's knowledge base. The flow:

```
ELIMFILTERS engineer writes:
  /vault/contamination/DIESEL_WATER.md
  (full failure chain with root causes, quantified impacts, resolving technologies)
    ↓
Export script reads frontmatter + body
    ↓
Generates UNIFIED_CONTAMINATION_MODES['DIESEL_WATER'] in unified-data.ts
    ↓
AI Engine queries CONTAMINATION_MODES['DIESEL_WATER'].impacts{} for quantified impact statements
    ↓
AI Engine cites elimfilters.com/knowledge-system/contamination/diesel-water as the source URL
```

The Obsidian vault is where humans write. `unified-data.ts` is where machines read. The export script is the bridge. This architecture ensures the AI Engine is never hallucinating — every claim it makes is rooted in a human-authored, version-controlled entry in the vault.

---

## 11. Future State Architecture

### 11.1 Target File Structure

```
/frontend/src/lib/
├── unified-data.ts          ← THE SINGLE SOURCE OF TRUTH
│   ├── UNIFIED_TECHNOLOGIES (12 entries — complete schema)
│   ├── UNIFIED_INDUSTRIES   (12 entries — complete schema)
│   ├── UNIFIED_SYSTEMS      (12 entries — complete schema, new)
│   ├── UNIFIED_CONTAMINATION_MODES (6+ entries)
│   ├── UNIFIED_STANDARDS    (11+ entries)
│   ├── COMPARISON_TOPICS    (migrated from knowledge-architecture.ts)
│   ├── FLEET_OPTIMIZATION   (migrated from knowledge-architecture.ts)
│   ├── EDUCATIONAL_PATHWAYS (migrated from knowledge-architecture.ts)
│   └── Query functions (11 total: 7 existing + 4 new)
│
├── catalogue.ts             ← Adapter layer (unchanged public API)
│   └── imports from unified-data.ts instead of catalogue.json
│
└── knowledge-architecture.ts ← Thin re-export adapter (~20 lines)
    └── re-exports everything from unified-data.ts
```

### 11.2 Consumer Map After Phase 2

```
unified-data.ts
    ↓
catalogue.ts (adapter)
    ↓
All page components (no changes to page imports)

unified-data.ts
    ↓
knowledge-architecture.ts (re-export)
    ↓
Phase 4 Knowledge System pages (import query functions)

unified-data.ts
    ↓
technologies/page.tsx (replaces GEO_DEFINITIONS + TECH_COMPARISON)

unified-data.ts
    ↓
Part Search API (product context enrichment)

unified-data.ts
    ↓
AI Engine (knowledge graph + citation layer)
```

### 11.3 Unified Technology Schema

```typescript
interface UnifiedTechnology {
  // Identity
  id: string;                        // 'macrocore'
  key: string;                       // 'MACROCORE' — typed constant key
  name: string;                      // 'MACROCORE™'
  slug: string;                      // 'macrocore' — explicit, never derived
  logoFile: string;                  // 'logo-macrocore.png' — explicit, never derived
  category: string;                  // 'Air Filtration'
  tagline: string;                   // short marketing line
  systemDomain: string;              // 'Air Intake' (from TECH_COMPARISON taxonomy)

  // Rendering content (from catalogue.json)
  file: string;
  title: string;
  subtitle: string;
  description: string;               // short product description
  features: string[];
  stats: { percentages?: string[]; ratings?: string[] };
  cta: string;

  // AI/GEO definition (from GEO_DEFINITIONS — most technically precise)
  geoDefinition: string;             // long-form technical prose, citable

  // Comparison data (from TECH_COMPARISON)
  comparisonFunction: string;        // one-line technical function description
  comparisonMetric: string;          // key performance metric string

  // Relational graph (from knowledge-architecture.ts + authored for 6 missing)
  relatedStandards: string[];        // ['ISO_5011', 'SAE_J726', ...]
  addressesContamination: string[];  // ['PARTICLE_WEAR']
  applicableIndustries: string[];    // ['AGRICULTURE', 'MINING', ...]
  keyMetrics: Record<string, string>;

  // Version tracking (for AI Engine citations)
  version: string;                   // '1.0'
  lastUpdated: string;               // 'YYYY-MM-DD'
}
```

### 11.4 Unified Industry Schema

```typescript
interface UnifiedIndustry {
  // Identity
  id: string;                        // 'agriculture'
  key: string;                       // 'AGRICULTURE'
  name: string;                      // 'Agriculture'
  slug: string;                      // 'agriculture' — explicit

  // Relational graph (from knowledge-architecture.ts + authored for 5 missing)
  contaminationExposure: 'LOW' | 'LOW-MEDIUM' | 'MEDIUM' | 'MEDIUM-HIGH' | 'HIGH' | 'EXTREME';
  primaryEquipment: string[];
  relevantContamination: string[];   // references UNIFIED_CONTAMINATION_MODES keys
  applicableTechnologies: string[];  // references UNIFIED_TECHNOLOGIES keys — reconciled from conflicting sources
  applicableStandards: string[];     // references UNIFIED_STANDARDS keys
  operatingConditions: Record<string, string>;

  // Rendering content (from catalogue.json)
  file: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  benefits: string[];
  stats: { percentages?: string[]; ratings?: string[] };
  cta: string;
  videoBody?: string[];
  engineeringBody?: string;
  statistic?: string;
  statisticSource?: string;
}
```

### 11.5 Unified System Schema (New Entity Type — No Current Source)

```typescript
interface UnifiedSystem {
  // Identity
  id: string;            // 'airfilter'
  key: string;           // 'AIR_FILTER'
  name: string;          // 'Airfilter' (display name, matches existing slug derivation)
  slug: string;          // 'airfilter' — explicit, matches existing /out/ directory

  // Relational (authored from techTags cross-reference — no current typed source)
  primaryTechnology: string;          // 'MACROCORE'
  supportingTechnologies: string[];   // other applicable technologies
  applicableIndustries: string[];     // industries that use this system
  addressesContamination: string[];   // contamination modes targeted
  applicableStandards: string[];      // performance standards

  // Rendering content (from catalogue.json products)
  file: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  benefits?: string[];
  techTags?: string[];   // retained for transition period — deprecated after Phase 2
  stats: { percentages?: string[]; ratings?: string[] };
  cta: string;
}
```

---

## 12. Migration Strategy

### Core Properties

1. **Additive first** — `unified-data.ts` is created and validated before any consuming file is changed
2. **One consumer at a time** — each consuming file is updated and build-verified independently
3. **Thin adapter layer** — `catalogue.ts` changes its data source but not its exported API
4. **No page component changes** — all pages continue importing from `catalogue.ts`
5. **Explicit slug lock** — every entity gets an explicit `slug` field matching its existing URL

---

### Step 0 — Pre-migration conflict resolution (before any code)

**0a. Reconcile technology-industry conflicts**

For each of the 7 industries with conflicting technology lists between `catalogue.json` and `knowledge-architecture.ts`, produce a reconciled authoritative list by cross-referencing all four sources:
1. `catalogue.json` techTags (loosely typed marketing list)
2. `knowledge-architecture.ts` applicableTechnologies (rigorously typed technical list)
3. `techPagesData.ts` applications[].sector (narrative confirmation)
4. `TECH_COMPARISON.industries` (table confirmation)

Any technology that appears in ≥ 2 of the 4 sources for a given industry is included. Any technology that appears in only 1 source requires a manual determination before the entry is written as authoritative.

**0b. Correct ISO standard descriptions**
- `ISO_16889` description: "Multi-pass filter performance test method for hydraulic fluid power — establishes Beta ratio measurement procedure" (not "Cleanliness Coding System")
- `ISO_4406` description: "Method for coding the level of contamination by solid particles — current standard, two-number and three-number code variants" (not "Legacy Cleanliness Code")

**0c. Resolve SYNTRAX description conflict**
- Authoritative description source: `GEO_DEFINITIONS` — SYNTRAX is lubrication/oil protection, not air intake
- `catalogue.json` SYNTRAX technology description is incorrect — do not carry it forward

---

### Step 1 — Create unified-data.ts

Create `/frontend/src/lib/unified-data.ts`.

Sub-tasks in strict order:

**1a. Define all TypeScript interfaces** (see Section 11.3–11.5)
**1b. Migrate + correct 6 existing standards from knowledge-architecture.ts; author 5 missing**
**1c. Migrate + correct 3 existing contamination modes; author 3 missing** (Cabin Air, Coolant Contamination, Compressed Air Moisture)
**1d. Migrate 6 existing technologies from knowledge-architecture.ts** — carry all typed fields, add `geoDefinition` from GEO_DEFINITIONS, add `systemDomain`/`comparisonFunction`/`comparisonMetric` from TECH_COMPARISON, add `logoFile` from getTechLogoFile(), add explicit `slug`
**1e. Author 6 missing technologies** (SYNTEPORE, INTEKCORE, DRYCORE, COOLTECH, MARINECLEAN, AQUAGUARD_SERIES) — use techPagesData.ts + GEO_DEFINITIONS + catalogue.json as source material; mark unverifiable fields `// TODO: verify`
**1f. Migrate 7 existing industries** — carry all typed fields, add rendering content from catalogue.json; apply reconciled applicableTechnologies from Step 0a
**1g. Author 5 missing industries** (BUS_COACH, RAILWAY, TRUCKS_FLEETS, OIL_GAS, WASTE_MUNICIPAL) — use catalogue.json content + techTags cross-reference as starting point; mark unverifiable relational fields `// TODO: verify`
**1h. Author 12 systems** — use catalogue.json products content + techTags to derive relational fields; all systems are entirely new relational entries
**1i. Migrate COMPARISON_TOPICS, FLEET_OPTIMIZATION, EDUCATIONAL_PATHWAYS** from knowledge-architecture.ts
**1j. Migrate 7 query functions + author 4 new ones** (`getSystemsByTechnology`, `getTechnologiesBySystemDomain`, `getIndustriesByContamination`, `getStandardsByContaminationMode`)

→ **Build check**: `npm run type-check && npm run build` — must produce 89 pages with zero errors. No consuming files changed yet; this step adds a new file only.

---

### Step 2 — Update catalogue.ts

**2a.** Update `CatalogueItem` interface to accept the unified schema as a superset (add optional new fields; all existing required fields remain required)
**2b.** Replace `import catalogueData from '../../catalogue.json'` with `import { UNIFIED_INDUSTRIES, UNIFIED_SYSTEMS, UNIFIED_TECHNOLOGIES } from '@/lib/unified-data'`
**2c.** Update `getTechLogoFile()` to read from `UNIFIED_TECHNOLOGIES[key].logoFile` rather than the inline map
**2d.** Audit `getSlug()` — for entities with an explicit `slug` field in unified-data.ts, validate that `getSlug(name)` produces the same value; log a build-time warning if any mismatch is detected

→ **Build check**: `npm run build` — must produce exactly 89 pages with zero errors. All existing routes must be present. Zero slug mismatches in the build log.

---

### Step 3 — Convert knowledge-architecture.ts to thin re-export

**3a.** Replace all `TECHNOLOGIES`, `INDUSTRIES`, `STANDARDS`, `CONTAMINATION_MODES` data definitions with re-exports from unified-data.ts:
```typescript
export {
  UNIFIED_TECHNOLOGIES as TECHNOLOGIES,
  UNIFIED_INDUSTRIES as INDUSTRIES,
  UNIFIED_STANDARDS as STANDARDS,
  UNIFIED_CONTAMINATION_MODES as CONTAMINATION_MODES,
  UNIFIED_CONTAMINATION_MODES as CONTAMINATION_MODES,
  getTechnologyByIndustry,
  // ... all query functions
} from '@/lib/unified-data';
```
**3b.** Retain `COMPARISON_TOPICS`, `FLEET_OPTIMIZATION`, `EDUCATIONAL_PATHWAYS` as re-exports
**3c.** Verify the resulting file is under 30 lines

→ **Build check**: `npm run build` — 89 pages, zero errors. (No page currently imports knowledge-architecture.ts, but this step is verified before Step 4.)

---

### Step 4 — Remove inline blocks from technologies/page.tsx

**4a.** Import `UNIFIED_TECHNOLOGIES` in `technologies/page.tsx`
**4b.** Replace `GEO_DEFINITIONS[slug]` with `tech.geoDefinition` (tech is the matched `UnifiedTechnology` entry)
**4c.** Replace the `TECH_COMPARISON` array with a derived view from `UNIFIED_TECHNOLOGIES` filtered and mapped to the comparison table format
**4d.** Add Aquaguard Series, Duratech, Marineclean to the comparison table (they now have `comparisonFunction` and `comparisonMetric` fields)

→ **Build check**: `npm run build` — 89 pages. Technologies hub page JSON-LD output must be structurally identical to pre-migration output (same technologies, same descriptions).

---

### Step 5 — Deprecate catalogue.json

**5a.** Confirm `catalogue.json` is imported by zero files: `grep -rn "catalogue.json" src/`
**5b.** Move `catalogue.json` to `/docs/data-archive/catalogue.json.bak`
**5c.** Add deprecation header to `unified-data.ts`
**5d.** Update `CLAUDE.md` to document `unified-data.ts` as the Single Source of Truth

→ **Build check**: `npm run build` — 89 pages, zero errors.

---

### Step 6 — Data integrity validation

**6a.** Run all 11 query functions manually or in a validation script — verify zero `undefined` entries in any returned array
**6b.** Run `mapKnowledgeNetwork()` for all 12 technologies, all 12 industries, all 6 contamination modes — verify complete connection graphs
**6c.** Audit all 36 entity slugs against their corresponding `out/` directory names — verify exact match
**6d.** Verify all `// TODO: verify` annotations are resolved or tracked in a known-issues list

→ **Final state**: Zero undefined entries, all slugs valid, 89 pages generated, knowledge graph fully connected.

---

## 13. Risk Analysis

### Risk 1 — Technology-Industry Conflict Resolution Produces Incorrect Authoritative Lists

**Probability**: HIGH (7 of 7 overlapping industries have conflicts)
**Impact**: MEDIUM — incorrect technology recommendations in Knowledge System pages (Phase 4+) and AI Engine responses
**Mitigation**: Reconciliation must be done by cross-referencing all four sources before writing any entry. Unresolvable conflicts are marked `// TODO: verify` and escalated rather than guessed. The project owner has the final authority on which technologies are truly applicable to each industry.

---

### Risk 2 — Slug Mismatch Creates 404 on Existing Indexed URLs

**Probability**: LOW (all current slugs are verified against `out/` directory names)
**Impact**: CRITICAL — a broken URL on an existing indexed page is an SEO regression
**Mitigation**: Every entity in `unified-data.ts` has an explicit `slug` field. The build validation step (Step 2d) audits `getSlug(name)` output against explicit slugs and fails the build if any mismatch is detected.

---

### Risk 3 — CatalogueItem Interface Type Incompatibility

**Probability**: LOW-MEDIUM
**Impact**: HIGH — TypeScript compilation fails, all pages break
**Mitigation**: Before Step 2, run a field-by-field diff between `CatalogueItem` interface and the proposed `UnifiedTechnology` schema. All existing required fields must be present in the unified schema with compatible types. The unified schema is a superset — it adds fields, never removes them.

---

### Risk 4 — Incorrect ISO Standard Descriptions Propagate

**Probability**: Already confirmed (ISO_16889 and ISO_4406 have incorrect descriptions in knowledge-architecture.ts)
**Impact**: MEDIUM — AI Engine cites incorrect standard roles; Knowledge System pages display wrong descriptions
**Mitigation**: Step 0b explicitly corrects both descriptions before they are written into `unified-data.ts`. Standard descriptions should be verified against ISO website summaries or CLAUDE.md knowledge base before being written as authoritative.

---

### Risk 5 — SYNTRAX Description Conflict Propagates

**Probability**: Already confirmed (catalogue.json SYNTRAX technology description incorrectly frames it as air intake)
**Impact**: MEDIUM — technology hub page or AI Engine presents SYNTRAX in wrong system domain
**Mitigation**: Step 0c resolves this before `unified-data.ts` is written. GEO_DEFINITIONS + TECH_COMPARISON (`system: 'Lubrication'`) + knowledge-architecture.ts all confirm SYNTRAX is lubrication. The catalogue.json description is incorrect and not carried forward.

---

### Risk 6 — Missing Relational Data for 6 Technologies and 5 Industries

**Probability**: Confirmed (these entries do not exist in any relational registry)
**Impact**: MEDIUM — incomplete knowledge graph; AI Engine cannot route queries for these entities
**Mitigation**: Step 0 identifies which fields can be derived from existing sources and which require authoritative input. Fields that cannot be reliably derived are marked `// TODO: verify` with a comment explaining what needs to be confirmed. The Phase 2 build does not depend on these fields — they are additive relational data for Phase 4+.

---

### Risk 7 — techPagesData.ts Narrative Inconsistencies With unified-data.ts Definitions

**Probability**: LOW-MEDIUM (both were authored independently)
**Impact**: LOW — different pages present inconsistent information about the same technology
**Mitigation**: After `unified-data.ts` is written, spot-check the `geoDefinition` for each technology against the corresponding `techPagesData.ts` `heroTagline` and `systemParagraphs`. They serve different content registers but should not contradict. Flag any contradiction for review.

---

## 14. Dependency Analysis

### Internal Dependencies

| Dependency | Status | Required Before |
|---|---|---|
| Phase 1 all code-executable tasks | ✅ Complete | Step 1 |
| NANOFORCE_HYDRAULIC phantom reference removed | ✅ Complete (Phase 1 Task 1.3) | Step 1 |
| Barlow fonts registered in layout.tsx | ✅ Complete (Phase 1 Task 1.2) | N/A |
| About page in navigation | ✅ Complete (Phase 1 Task 1.5) | N/A |
| type-check + verify scripts in package.json | ✅ Complete (Phase 1 Task 1.6) | Step 1 — needed to run `npm run type-check` |
| Step 0 conflict reconciliation | Not started | Step 1 |
| Step 1 complete + build passing | Not started | Step 2 |
| Step 2 complete + build passing | Not started | Step 3 |
| Step 3 complete | Not started | Step 4 |
| Step 4 complete + build passing | Not started | Step 5 |
| Step 5 complete | Not started | Step 6 |
| Phase 2 complete | Not started | Phase 3 (Obsidian pipeline), Phase 4 (Knowledge Graph pages), Phase 5 (Part Search Intelligence), Phase 6+ (AI Engine) |

### External Dependencies

| Dependency | Type | Impact if Absent |
|---|---|---|
| Technical validation of 6 missing technology relational fields | Content authoring — project owner input | SYNTEPORE, INTEKCORE, DRYCORE, COOLTECH, MARINECLEAN, AQUAGUARD_SERIES `applicableIndustries` and `relatedStandards` may be incorrect if authored without owner verification. Phase 2 proceeds with `// TODO: verify` annotations; Phase 4 depends on these being resolved. |
| Industry knowledge for 5 missing industries | Content authoring — project owner input | BUS_COACH, RAILWAY, TRUCKS_FLEETS, OIL_GAS, WASTE_MUNICIPAL `contaminationExposure` ratings and `applicableStandards` require owner confirmation. |
| Resolution of technology-industry conflicts (Section 4.1) | Content authority decision | The 7 industries with conflicting technology lists need a single authoritative answer. This is a product/business decision, not a technical one. |
| Part Search API access (for Phase 5) | Infrastructure | Phase 2 does not require Part Search. But the `systemDomain` taxonomy written in Step 1 must anticipate Part Search's query routing needs. |

---

## 15. Recommended Execution Order

### Execution Sequence

```
STEP 0 — Pre-migration (documentation only, no code)
  0a. Reconcile 7 industry technology conflict tables → produce authoritative lists
  0b. Correct ISO standard descriptions (16889, 4406)
  0c. Confirm SYNTRAX system domain = Lubrication
  → Deliverable: resolved conflict document (can be Markdown or inline comments)
  → Effort: 2–4 hours

STEP 1 — Create unified-data.ts
  1a. TypeScript interfaces (all 5 entity types)
  1b. Standards (6 migrate + 5 author)
  1c. Contamination Modes (3 migrate + 3 author)
  1d. Technologies (6 migrate with corrections)
  1e. Technologies (6 author — mark TODO where unverifiable)
  1f. Industries (7 migrate with reconciled lists)
  1g. Industries (5 author — mark TODO where unverifiable)
  1h. Systems (12 author from techTags cross-reference)
  1i. Comparison Topics, Fleet Optimization, Educational Pathways (migrate)
  1j. Query functions (7 migrate + 4 author)
  → Build check: 89 pages ✅
  → Effort: 8–12 hours

STEP 2 — Update catalogue.ts
  2a. Update CatalogueItem interface
  2b. Replace catalogue.json import
  2c. Update getTechLogoFile() to read logoFile field
  2d. Audit getSlug() against explicit slugs
  → Build check: 89 pages ✅
  → Effort: 2–3 hours

STEP 3 — Convert knowledge-architecture.ts to adapter
  3a. Replace data with re-exports
  3b. Verify re-export surface is complete
  → Build check: 89 pages ✅
  → Effort: 1 hour

STEP 4 — Remove inline blocks from technologies/page.tsx
  4a. Import UNIFIED_TECHNOLOGIES
  4b. Replace GEO_DEFINITIONS usage
  4c. Replace TECH_COMPARISON array
  4d. Add 3 missing technologies to comparison table
  → Build check: 89 pages ✅
  → Effort: 2–3 hours

STEP 5 — Deprecate catalogue.json
  5a. Verify zero imports
  5b. Archive JSON file
  5c. Update CLAUDE.md
  → Build check: 89 pages ✅
  → Effort: 30 minutes

STEP 6 — Data integrity validation
  6a. Query function audits
  6b. Knowledge graph completeness check
  6c. Slug audit
  6d. TODO annotation resolution status report
  → Final check: zero undefined entries, all slugs valid
  → Effort: 1–2 hours
```

### Total Effort Estimate

| Step | Description | Effort |
|---|---|---|
| Step 0 | Conflict reconciliation | 2–4 hours |
| Step 1 | Create unified-data.ts | 8–12 hours |
| Step 2 | Update catalogue.ts | 2–3 hours |
| Step 3 | Convert knowledge-architecture.ts | 1 hour |
| Step 4 | Remove inline blocks | 2–3 hours |
| Step 5 | Deprecate catalogue.json | 30 minutes |
| Step 6 | Validation | 1–2 hours |
| **Total** | | **16–25 hours** |

### Success Criteria Checklist

- [ ] `unified-data.ts` exports 12 technologies, 12 industries, 12 systems, 11+ standards, 6+ contamination modes
- [ ] Every `UnifiedTechnology` has all `CatalogueItem` fields present (backwards compat verified)
- [ ] Every `UnifiedTechnology` has `geoDefinition`, `systemDomain`, `comparisonFunction`, `comparisonMetric`, `logoFile`, explicit `slug`
- [ ] Every `UnifiedIndustry` has `applicableTechnologies[]` from reconciled authoritative source
- [ ] Every `UnifiedSystem` has `primaryTechnology` and `applicableIndustries[]`
- [ ] `getTechnologyByIndustry()` returns arrays with zero `undefined` for all 12 industries
- [ ] `mapKnowledgeNetwork()` returns complete graphs with zero `undefined` nodes for all 12 technologies
- [ ] All 36 entity slugs match their existing `/out/` directory paths exactly
- [ ] `npm run build` produces 89+ pages, zero TypeScript errors, zero lint warnings
- [ ] `catalogue.json` is imported by zero files in `src/`
- [ ] `GEO_DEFINITIONS` and `TECH_COMPARISON` are no longer inline constants in `technologies/page.tsx`
- [ ] `knowledge-architecture.ts` is a thin re-export file (< 30 lines)
- [ ] ISO 16889 and ISO 4406 descriptions are corrected
- [ ] SYNTRAX system domain is `'Lubrication'` (not air intake)
- [ ] `AQUAGUARD` and `AQUAGUARD_SERIES` are distinct entries with a documented relationship
- [ ] All `// TODO: verify` annotations are listed in a known-issues tracking comment at the top of `unified-data.ts`
- [ ] `COMPARISON_TOPICS`, `FLEET_OPTIMIZATION`, `EDUCATIONAL_PATHWAYS` are re-exported from `unified-data.ts`
- [ ] Part Search consumption data structure (`systemDomain`, `applicableIndustries`, `addressesContamination`) is present on all 12 `UnifiedTechnology` entries
- [ ] AI Engine citation fields (`geoDefinition`, `version`, `lastUpdated`, structured `keyMetrics`) are present on all 12 `UnifiedTechnology` entries

---

*Plan generated: 2026-06-02*
*Repository: latamfilters/world-catalogue*
*Branch: claude/dazzling-franklin-ALGY1*
*Supersedes: Previous PHASE2_EXECUTION_PLAN.md (v1, same date)*
