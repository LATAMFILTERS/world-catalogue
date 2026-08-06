# UNIFIED_DATA_IMPLEMENTATION_PLAN.md
## Implementation Plan — unified-data.ts

**Date**: 2026-06-02
**Branch**: `claude/dazzling-franklin-ALGY1`
**Status**: Planning — no code written, no files modified
**Prerequisite**: PHASE2_EXECUTION_PLAN.md approved ✅

---

## Table of Contents

1. [File Structure](#1-file-structure)
2. [Data Schema](#2-data-schema)
3. [Migration Order](#3-migration-order)
4. [Files to Update](#4-files-to-update)
5. [Files to Deprecate](#5-files-to-deprecate)
6. [Validation Strategy](#6-validation-strategy)
7. [Rollback Strategy](#7-rollback-strategy)

---

## 1. File Structure

### 1.1 New File Created

```
/frontend/src/lib/unified-data.ts
```

This is the only new file created in Phase 2. All other changes are modifications to existing files.

### 1.2 Internal Structure of unified-data.ts

The file is divided into eight named sections in this exact order. Section headers use the same `// ===` delimiter pattern already established in `knowledge-architecture.ts`.

```
unified-data.ts
│
├── SECTION 1: TYPE DEFINITIONS
│   ├── interface UnifiedTechnology
│   ├── interface UnifiedIndustry
│   ├── interface UnifiedSystem
│   ├── interface UnifiedStandard
│   ├── interface UnifiedContaminationMode
│   ├── interface UnifiedComparisonTopic
│   ├── interface UnifiedFleetStrategy
│   ├── interface UnifiedEducationalPathway
│   └── Type aliases for typed keys
│
├── SECTION 2: STANDARDS (11 entries)
│   └── export const UNIFIED_STANDARDS: Record<string, UnifiedStandard>
│
├── SECTION 3: CONTAMINATION MODES (6 entries)
│   └── export const UNIFIED_CONTAMINATION_MODES: Record<string, UnifiedContaminationMode>
│
├── SECTION 4: TECHNOLOGIES (12 entries)
│   └── export const UNIFIED_TECHNOLOGIES: Record<string, UnifiedTechnology>
│
├── SECTION 5: INDUSTRIES (12 entries)
│   └── export const UNIFIED_INDUSTRIES: Record<string, UnifiedIndustry>
│
├── SECTION 6: SYSTEMS (12 entries)
│   └── export const UNIFIED_SYSTEMS: Record<string, UnifiedSystem>
│
├── SECTION 7: STRATEGIC STRUCTURES (3 records)
│   ├── export const COMPARISON_TOPICS
│   ├── export const FLEET_OPTIMIZATION
│   └── export const EDUCATIONAL_PATHWAYS
│
└── SECTION 8: QUERY FUNCTIONS (11 functions)
    ├── getTechnologyByIndustry(industryKey)
    ├── getContaminationByTechnology(techKey)
    ├── getStandardsByTechnology(techKey)
    ├── getRelatedTechnologies(contaminationKey)
    ├── getIndustriesBySeverity()
    ├── getAllTechnologiesByFeature(feature)
    ├── mapKnowledgeNetwork(nodeId, nodeType)
    ├── getSystemsByTechnology(techKey)       ← new
    ├── getTechnologiesBySystemDomain(domain) ← new
    ├── getIndustriesByContamination(contaminationKey) ← new
    └── getStandardsByContaminationMode(contaminationKey) ← new
```

### 1.3 File Placement Rationale

`unified-data.ts` is placed in `/frontend/src/lib/` alongside `catalogue.ts` and `knowledge-architecture.ts`. It is a library module, not a page or component. It has no side effects — it only exports constants and pure functions. It imports nothing from the application (no `next/*`, no `react`, no other `@/lib` modules). Zero circular dependency risk.

### 1.4 Repository File Map After Phase 2 Completion

```
/frontend/src/lib/
├── unified-data.ts              ← NEW — Single Source of Truth
├── catalogue.ts                 ← MODIFIED — reads from unified-data.ts instead of catalogue.json
├── knowledge-architecture.ts    ← MODIFIED — thin re-export adapter (~20 lines)
└── geoLanguage.ts               ← UNCHANGED

/frontend/src/app/technologies/
├── page.tsx                     ← MODIFIED — inline GEO_DEFINITIONS and TECH_COMPARISON removed
└── [slug]/
    ├── page.tsx                 ← UNCHANGED
    └── techPagesData.ts         ← UNCHANGED

/frontend/
├── catalogue.json               ← MOVED TO /docs/data-archive/ (not deleted)
└── (all other files unchanged)

/docs/data-archive/
└── catalogue.json.bak           ← ARCHIVED — retired primary source
```

---

## 2. Data Schema

### 2.1 Typed Key System

All cross-references between entities use typed string literal unions, not bare `string`. This catches reference errors at compile time — a misspelled key is a TypeScript error, not a silent data gap.

```typescript
// Technology keys — 12 entries
type TechnologyKey =
  | 'MACROCORE' | 'NANOFORCE' | 'MICROKAPPA' | 'SYNTRAX'

// Industry keys — 12 entries
type IndustryKey =
  | 'AGRICULTURE' | 'AUTOMOTIVE' | 'BUS_COACH' | 'CONSTRUCTION'
  | 'MANUFACTURING' | 'MARINE' | 'MINING' | 'OIL_GAS'
  | 'POWER_GENERATION' | 'RAILWAY' | 'TRUCKS_FLEETS' | 'WASTE_MUNICIPAL';

// System keys — 12 entries
type SystemKey =
  | 'DRYER' | 'FUEL' | 'HOUSING' | 'HYDRAULIC'
  | 'KITS' | 'MARINE_SYSTEM' | 'OIL' | 'WATER';

// Standard keys — 11 entries
type StandardKey =
  | 'ISO_16889' | 'ISO_4406' | 'ISO_5011' | 'ISO_11155'
  | 'ISO_8573_1' | 'ISO_12937' | 'ISO_14540' | 'ASTM_D6304'
  | 'SAE_J1539' | 'NFPA_T214' | 'DIN_51524';

// Contamination mode keys — 6 entries
type ContaminationKey =
  | 'DIESEL_WATER' | 'PARTICLE_WEAR' | 'HYDRAULIC_CONTAMINATION'
  | 'CABIN_AIR_CONTAMINATION' | 'COOLANT_CONTAMINATION'
  | 'COMPRESSED_AIR_MOISTURE';

// System domain taxonomy — 7 domains (from TECH_COMPARISON)
type SystemDomain =
  | 'Air Intake' | 'Fuel Cleanliness' | 'Lubrication'
  | 'Hydraulic' | 'Compressed Air' | 'Cooling System' | 'Cabin Protection';

// Contamination exposure severity
type ExposureLevel =
  | 'LOW' | 'LOW-MEDIUM' | 'MEDIUM' | 'MEDIUM-HIGH' | 'HIGH' | 'EXTREME';
```

---

### 2.2 UnifiedTechnology Schema

**Source fields**: `catalogue.json` technologies (rendering) + `knowledge-architecture.ts` TECHNOLOGIES (relational) + `GEO_DEFINITIONS` (AI definition) + `TECH_COMPARISON` (system domain) + `catalogue.ts` getTechLogoFile() (asset)

```typescript
interface UnifiedTechnology {
  // ── Identity ──────────────────────────────────────────────────
  id: string;                    // lowercase slug: 'macrocore'
  key: TechnologyKey;            // typed constant: 'MACROCORE'
  name: string;                  // display name: 'MACROCORE™'
  slug: string;                  // URL path segment: 'macrocore' — EXPLICIT, never derived
  logoFile: string;              // asset filename: 'logo-macrocore.png' — EXPLICIT
  category: string;              // technology category: 'Air Filtration'
  tagline: string;               // short positioning line

  // ── System Domain ─────────────────────────────────────────────
  systemDomain: SystemDomain;    // 'Air Intake' | 'Lubrication' | etc.

  // ── Rendering Content (from catalogue.json) ───────────────────
  file: string;                  // legacy HTML filename: 'macrocore.html'
  title: string;                 // page title: 'MACROCORE™'
  subtitle: string;              // page subtitle: 'PROGRESSIVE DENSITY ENGINEERING'
  description: string;           // short product description (3–5 sentences)
  features: string[];            // bulleted feature list
  stats: {
    percentages?: string[];
    ratings?: string[];
  };
  cta: string;                   // CTA button label

  // ── AI / GEO Definition (from GEO_DEFINITIONS) ───────────────
  geoDefinition: string;         // long-form technical prose — citable by AI Engine
                                 // includes ISO codes, micron ratings, failure mechanisms

  // ── Comparison Data (from TECH_COMPARISON) ────────────────────
  comparisonFunction: string;    // one-line technical function: 'Progressive density gradient intake protection'
  comparisonMetric: string;      // key performance metric: '99.9%–99.98% efficiency · ISO 5011'

  // ── Relational Graph (from knowledge-architecture.ts + authored) ──
  relatedStandards: StandardKey[];
  addressesContamination: ContaminationKey[];
  applicableIndustries: IndustryKey[];
  keyMetrics: Record<string, string>;  // { efficiency: '99.98%', pressureDrop: '62 PSI', ... }

  // ── Version Tracking (for AI Engine citations) ────────────────
  version: string;               // '1.0'
  lastUpdated: string;           // 'YYYY-MM-DD'
}
```

**Entry count**: 12

---

### 2.3 UnifiedIndustry Schema

**Source fields**: `catalogue.json` industries (rendering) + `knowledge-architecture.ts` INDUSTRIES (relational, 7 of 12)

```typescript
interface UnifiedIndustry {
  // ── Identity ──────────────────────────────────────────────────
  id: string;                    // 'agriculture'
  key: IndustryKey;              // 'AGRICULTURE'
  name: string;                  // 'Agriculture'
  slug: string;                  // 'agriculture' — EXPLICIT

  // ── Relational Graph ──────────────────────────────────────────
  contaminationExposure: ExposureLevel;
  primaryEquipment: string[];    // ['COMBINES', 'TRACTORS', 'HARVESTERS', ...]
  relevantContamination: ContaminationKey[];
  applicableTechnologies: TechnologyKey[];   // RECONCILED from conflicting sources
  applicableStandards: StandardKey[];
  operatingConditions: {
    environment: string;
    temperature: string;
    storageMethod: string;
    mainIssue: string;
  };

  // ── Rendering Content (from catalogue.json) ───────────────────
  file: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  benefits: string[];
  techTags: string[];            // RETAINED for transition — deprecated after Phase 2
  stats: {
    percentages?: string[];
    ratings?: string[];
  };
  cta: string;
  videoBody?: string[];
  engineeringBody?: string;
  statistic?: string;
  statisticSource?: string;
}
```

**Entry count**: 12
**Fully sourced**: AGRICULTURE, CONSTRUCTION, MINING, MARINE, AUTOMOTIVE, MANUFACTURING, POWER_GENERATION (relational data exists in knowledge-architecture.ts)
**Requires authoring**: BUS_COACH, RAILWAY, TRUCKS_FLEETS, OIL_GAS, WASTE_MUNICIPAL (relational fields must be derived from techTags + catalogue.json content or marked `// TODO: verify`)
**Requires reconciliation**: All 7 existing industries have conflicting `applicableTechnologies` lists between catalogue.json techTags and knowledge-architecture.ts — see Section 3.1 for resolution protocol

---

### 2.4 UnifiedSystem Schema

**Source fields**: `catalogue.json` products (rendering only — no relational data exists anywhere)

```typescript
interface UnifiedSystem {
  // ── Identity ──────────────────────────────────────────────────
  id: string;                    // 'airfilter'
  key: SystemKey;                // 'AIR_FILTER'
  name: string;                  // 'Airfilter' (must match existing slug derivation)
  slug: string;                  // 'airfilter' — EXPLICIT, matches /out/systems/airfilter/

  // ── Relational (all fields authored — no existing typed source) ──
  primaryTechnology: TechnologyKey;          // dominant technology for this system
  supportingTechnologies: TechnologyKey[];   // additional technologies
  applicableIndustries: IndustryKey[];
  addressesContamination: ContaminationKey[];
  applicableStandards: StandardKey[];

  // ── Rendering Content (from catalogue.json products) ──────────
  file: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  benefits?: string[];
  techTags?: string[];           // RETAINED for transition period — deprecated after Phase 2
  stats: {
    percentages?: string[];
    ratings?: string[];
  };
  cta: string;
}
```

**Entry count**: 12 — all entirely new relational data (derived from techTags cross-reference)

**Derivation source for relational fields**:
The `techTags` field in `catalogue.json` products provides the starting point. Each system's `primaryTechnology` is the first technology listed in `techTags`. Supporting technologies are the remainder. Industries and contamination modes are derived by cross-referencing what industries list those technologies in their own `techTags`.

| System (slug) | Primary Tech | Supporting Techs | Derivation source |
|---|---|---|---|
| `airfilter` | MACROCORE | — | techTags: MACROCORE™ |
| `cabin` | MICROKAPPA | — | techTags: MICROKAPPA™ |
| `dryer` | DRYCORE | — | techTags: DRYCORE™ |
| `housing` | INTEKCORE | MACROCORE | techTags: INTEKCORE™, MACROCORE™ |
| `hydraulic` | NANOFORCE | — | techTags: NANOFORCE™ |
| `kits` | DURATECH | — | techTags: DURATECH™ |
| `marine` | MARINECLEAN | — | techTags: MARINECLEAN™ |
| `oil` | SYNTRAX | — | techTags: SYNTRAX™ |

---

### 2.5 UnifiedStandard Schema

**Source fields**: `knowledge-architecture.ts` STANDARDS (6 entries, 2 descriptions corrected) + 5 authored entries

```typescript
interface UnifiedStandard {
  id: string;                  // 'iso_16889'
  key: StandardKey;            // 'ISO_16889'
  code: string;                // 'ISO 16889' (display code)
  name: string;                // human-readable name
  type?: string;               // 'ISO' | 'ASTM' | 'SAE' | 'NFPA' | 'DIN'
  slug: string;                // 'iso-16889' (URL segment)
  description: string;         // accurate technical description — SEE CORRECTIONS BELOW
  applicableTo: TechnologyKey[];
  relevantIndustries: IndustryKey[];
  relatedContamination: ContaminationKey[];
  criticality: 'PRIMARY' | 'SECONDARY';
}
```

**11 entries** — 6 migrated (2 corrected), 5 authored:

| Key | Code | Status | Correction Required |
|---|---|---|---|
| `ISO_16889` | ISO 16889 | Migrate + **CORRECT** | Description says "Cleanliness Coding System" — wrong. Correct: multi-pass Beta ratio test method for hydraulic filter performance |
| `ISO_4406` | ISO 4406 | Migrate + **CORRECT** | Description says "Legacy Cleanliness Code" — wrong. Correct: current particle cleanliness code classification standard (two-number and three-number codes) |
| `ISO_5011` | ISO 5011 | Migrate — description accurate | Air intake filter performance test for internal combustion engines |
| `ASTM_D6304` | ASTM D6304 | Migrate — description accurate | Karl Fischer titration for water content in petroleum products |
| `SAE_J1539` | SAE J1539 | Migrate — description accurate | Diesel engine air intake contamination classification |
| `NFPA_T214` | NFPA T2.14 | Migrate — description accurate | Machine tool hydraulic fluid cleanliness requirements |
| `ISO_11155` | ISO 11155 | **Author** | Cabin air filtration for road vehicles — particle and gaseous contaminant removal |
| `ISO_8573_1` | ISO 8573-1 | **Author** | Compressed air purity classes — particle, water, oil content classifications |
| `ISO_12937` | ISO 12937 | **Author** | Water in petroleum products — Karl Fischer coulometric titration method |
| `ISO_14540` | ISO 14540 | **Author** | Marine middle distillate fuels — contamination specifications |
| `DIN_51524` | DIN 51524 | **Author** | Hydraulic fluid specifications — Part 2 (HLP) and Part 3 (HVLP) |

---

### 2.6 UnifiedContaminationMode Schema

**Source fields**: `knowledge-architecture.ts` CONTAMINATION_MODES (3 entries) + 3 authored entries

```typescript
interface UnifiedContaminationMode {
  id: string;                   // 'diesel_water'
  key: ContaminationKey;        // 'DIESEL_WATER'
  name: string;                 // 'Diesel Water Contamination'
  slug: string;                 // 'diesel-water' (URL segment)
  description: string;          // one-paragraph technical overview
  rootCauses: string[];         // ordered failure chain sources
  failureModes: string[];       // downstream failure mechanisms
  impacts: Record<string, string>;  // quantified operational impacts
  resolvedBy: TechnologyKey[];  // typed technology references
  relatedStandards: StandardKey[];
  applicableIndustries: IndustryKey[];
}
```

**6 entries** — 3 migrated, 3 authored:

| Key | Status | Notes |
|---|---|---|
| `DIESEL_WATER` | Migrate | Full data in knowledge-architecture.ts — update `resolvedBy` to typed keys |
| `PARTICLE_WEAR` | Migrate | Full data present — update keys |
| `HYDRAULIC_CONTAMINATION` | Migrate | Full data present — update keys |
| `CABIN_AIR_CONTAMINATION` | **Author** | PM2.5, diesel particulate, allergens, VOC — resolvedBy: MICROKAPPA |
| `COMPRESSED_AIR_MOISTURE` | **Author** | Valve corrosion, freeze events, seal degradation — resolvedBy: DRYCORE |

---

### 2.7 Strategic Structures (Migrated Unchanged)

Three structures migrate from `knowledge-architecture.ts` without schema changes:

```typescript
// Migrated as-is — update TechnologyKey references to typed keys
export const COMPARISON_TOPICS = { OEM_VS_AFTERMARKET: { ... } };

// Migrated as-is
export const FLEET_OPTIMIZATION = {
  MAINTENANCE_STRATEGIES: { ... },
  PERFORMANCE_TRACKING: { ... },
  OPERATIONAL_EFFICIENCY: { ... }
};

// Migrated as-is — these become the AI Engine's user-role routing table
export const EDUCATIONAL_PATHWAYS = {
  TECHNICIAN_ONBOARDING: { sequence: [...] },
  EQUIPMENT_OPERATOR: { sequence: [...] },
  FLEET_MANAGER: { sequence: [...] }
};
```

---

### 2.8 Query Functions — Complete Inventory

**7 migrated from knowledge-architecture.ts (signatures unchanged)**:

| Function | Input | Output |
|---|---|---|
| `getTechnologyByIndustry(industryKey)` | `IndustryKey` | `UnifiedTechnology[]` |
| `getContaminationByTechnology(techKey)` | `TechnologyKey` | `UnifiedContaminationMode[]` |
| `getStandardsByTechnology(techKey)` | `TechnologyKey` | `UnifiedStandard[]` |
| `getRelatedTechnologies(contaminationKey)` | `ContaminationKey` | `Record<TechnologyKey, UnifiedTechnology>` |
| `getIndustriesBySeverity()` | — | `UnifiedIndustry[]` (sorted HIGH→LOW) |
| `getAllTechnologiesByFeature(feature)` | feature enum | `UnifiedTechnology[]` |
| `mapKnowledgeNetwork(nodeId, nodeType)` | id + type | connection graph object |

**4 new functions (not in knowledge-architecture.ts)**:

| Function | Input | Output | Purpose |
|---|---|---|---|
| `getSystemsByTechnology(techKey)` | `TechnologyKey` | `UnifiedSystem[]` | Part Search: given a technology SKU, which systems use it |
| `getTechnologiesBySystemDomain(domain)` | `SystemDomain` | `UnifiedTechnology[]` | AI Engine: given a protection domain, which technologies apply |
| `getIndustriesByContamination(contaminationKey)` | `ContaminationKey` | `UnifiedIndustry[]` | AI Engine: given a contamination problem, which industries face it |
| `getStandardsByContaminationMode(contaminationKey)` | `ContaminationKey` | `UnifiedStandard[]` | AI Engine: given a contamination problem, which standards measure it |

---

## 3. Migration Order

### 3.1 Pre-Migration: Conflict Resolution (Step 0)

**Must complete before writing a single line of unified-data.ts.**

For each of the 7 industries where `catalogue.json` techTags and `knowledge-architecture.ts` applicableTechnologies disagree, produce one authoritative `TechnologyKey[]` by cross-referencing all four sources:

**Source weighting**:
1. `knowledge-architecture.ts` — typed, validated, intentionally relational (highest weight)
2. `techPagesData.ts` applications[].sector — narrative confirmation from product authors
3. `TECH_COMPARISON.industries` — operational confirmation in table form
4. `catalogue.json` techTags — marketing groupings (useful signal, lowest technical weight)

**Protocol**: A technology is included in a reconciled industry list if it appears in ≥ 2 of the 4 sources. A technology appearing in only 1 source requires a written rationale comment in unified-data.ts explaining why it is included or excluded.

**Corrections to make regardless of source**:
- ISO_16889 description: Beta ratio test method, not "Cleanliness Coding System"
- ISO_4406 description: current cleanliness code standard, not "Legacy"
- SYNTRAX `systemDomain`: `'Lubrication'` (confirmed by knowledge-architecture.ts category, GEO_DEFINITIONS prose, TECH_COMPARISON, and the Oil system page — the catalogue.json technology description is wrong)

---

### 3.2 Step 1 — unified-data.ts (new file, nothing breaks)

Execute sub-tasks in this exact order. Each sub-task ends with a `npm run type-check` pass before the next begins.

```
1a  Define all TypeScript interfaces and type aliases
    → type-check: file compiles with no data yet ✅

1b  Write UNIFIED_STANDARDS (11 entries)
    → type-check: all StandardKey values typed ✅

1c  Write UNIFIED_CONTAMINATION_MODES (6 entries)
    → type-check: all ContaminationKey values typed, all resolvedBy are TechnologyKey ✅
    → Note: TechnologyKey references compile even before UNIFIED_TECHNOLOGIES is written
      because TypeScript validates string literal union membership, not object existence

1d  Write UNIFIED_TECHNOLOGIES — 6 migrated entries
    → type-check: all relatedStandards, addressesContamination, applicableIndustries typed ✅

1e  Write UNIFIED_TECHNOLOGIES — 6 authored entries
    → Mark unverifiable relational fields: // TODO: verify — [field] not confirmed by ≥2 sources
    → type-check: all 12 technology entries compile ✅

1f  Write UNIFIED_INDUSTRIES — 7 migrated entries
    (AGRICULTURE, CONSTRUCTION, MINING, MARINE, AUTOMOTIVE, MANUFACTURING, POWER_GENERATION)
    → Use reconciled applicableTechnologies from Step 0 — not the raw knowledge-architecture.ts lists
    → type-check: all typed key references valid ✅

1g  Write UNIFIED_INDUSTRIES — 5 authored entries
    (BUS_COACH, RAILWAY, TRUCKS_FLEETS, OIL_GAS, WASTE_MUNICIPAL)
    → Derive relational fields from catalogue.json techTags; mark TODO where unverifiable
    → type-check: all 12 industry entries compile ✅

1h  Write UNIFIED_SYSTEMS (12 entries)
    → All relational fields derived from techTags cross-reference (see schema section 2.4)
    → type-check: all 12 system entries compile ✅

1i  Migrate COMPARISON_TOPICS, FLEET_OPTIMIZATION, EDUCATIONAL_PATHWAYS
    → Update all inline string references to typed TechnologyKey / IndustryKey
    → type-check ✅

1j  Write all 11 query functions
    → type-check: all function signatures and return types valid ✅

FINAL: npm run build
    → Build must produce 89 pages with zero errors
    → No consuming files changed — this step is additive only
```

---

### 3.3 Step 2 — Update catalogue.ts

```
2a  Read the current CatalogueItem interface field by field
    Verify every CatalogueItem field has a corresponding field in UnifiedTechnology,
    UnifiedIndustry, and UnifiedSystem with a compatible type.
    Document any field present in CatalogueItem but absent in unified-data.ts entries.

2b  Update CatalogueItem interface
    Add all new fields from unified schemas as optional (?: syntax).
    Never remove or make optional any field that is currently required.
    Result: CatalogueItem is a structural subset of all three UnifiedX interfaces.

2c  Replace data import
    FROM: import catalogueData from '../../catalogue.json'
    TO:   import { UNIFIED_INDUSTRIES, UNIFIED_SYSTEMS, UNIFIED_TECHNOLOGIES } from '@/lib/unified-data'

2d  Update catalogue exports
    FROM: industries: catalogueData.industries as CatalogueItem[]
    TO:   industries: Object.values(UNIFIED_INDUSTRIES) as CatalogueItem[]
    (same pattern for products/systems and technologies)

2e  Update getTechLogoFile()
    Read logoFile from UNIFIED_TECHNOLOGIES[key].logoFile
    Replace the inline logoMap Record with a lookup into unified-data.ts
    Preserve the SYNTRAX → logo-sintrax.png explicit mapping via the logoFile field

2f  Audit getSlug() output
    For each of the 36 entities, confirm getSlug(entity.name) === entity.slug
    If any mismatch: add a build-time assertion that throws with a clear error message

    npm run build — must produce 89 pages, zero errors
    Spot-check 6 routes: /technologies/macrocore, /technologies/syntrax,
```

---

### 3.4 Step 3 — Convert knowledge-architecture.ts to adapter

```
3a  Delete all data definitions from knowledge-architecture.ts
    Remove: TECHNOLOGIES, INDUSTRIES, STANDARDS, CONTAMINATION_MODES record literals
    Remove: COMPARISON_TOPICS, FLEET_OPTIMIZATION, EDUCATIONAL_PATHWAYS literals
    Remove: all function implementations

3b  Replace with re-exports from unified-data.ts
    Keep every currently exported name — preserve import paths for Phase 4

3c  Verify resulting file is ≤ 30 lines
    It should contain only import and export statements plus a deprecation comment

    npm run build — 89 pages, zero errors
```

---

### 3.5 Step 4 — Remove inline blocks from technologies/page.tsx

```
4a  Import UNIFIED_TECHNOLOGIES from '@/lib/unified-data' at the top of page.tsx
    Remove: const GEO_DEFINITIONS = { ... } (12-entry Record<string, string>)
    Remove: const TECH_COMPARISON = [ ... ] (9-entry array)

4b  Replace GEO_DEFINITIONS usage
    All occurrences of GEO_DEFINITIONS[slug] → find the matching UnifiedTechnology
    and read tech.geoDefinition

4c  Replace TECH_COMPARISON usage
    Build the comparison table rows from Object.values(UNIFIED_TECHNOLOGIES)
    Filter to technologies that have comparisonFunction defined
    Map to the same { name, slug, system, func, metric, industries } shape

4d  Update JSON-LD itemList numberOfItems to 12 (was hardcoded to 9)

    npm run build — 89 pages, zero errors
    Manually verify technologies hub page JSON-LD output includes all 12 technologies
```

---

### 3.6 Step 5 — Deprecate catalogue.json

```
5a  Verify zero remaining imports
    grep -rn "catalogue.json" frontend/src/
    Must return zero results

5b  Move file
    FROM: /frontend/catalogue.json
    TO:   /docs/data-archive/catalogue.json.bak
    Create /docs/data-archive/ if it does not exist

5c  Add deprecation header to unified-data.ts
    // SINGLE SOURCE OF TRUTH — all entity data lives here.
    // catalogue.json archived to /docs/data-archive/ as of Phase 2.
    // techPagesData.ts is intentionally separate (narrative/hero content layer).
    // Last migration: [date]

5d  Update CLAUDE.md
    Replace references to catalogue.json as primary data source
    Document unified-data.ts as the Single Source of Truth
    Document the Obsidian export pipeline intent (Phase 3)

    npm run build — 89 pages, zero errors
```

---

### 3.7 Step 6 — Validation

Full validation run — see Section 6.

---

## 4. Files to Update

### 4.1 `/frontend/src/lib/catalogue.ts`

**Nature of change**: Internal data source swap. Public API surface unchanged.

| Item | Current | After Phase 2 |
|---|---|---|
| Data import | `import catalogueData from '../../catalogue.json'` | `import { UNIFIED_INDUSTRIES, UNIFIED_SYSTEMS, UNIFIED_TECHNOLOGIES } from '@/lib/unified-data'` |
| `catalogue.industries` | `catalogueData.industries as CatalogueItem[]` | `Object.values(UNIFIED_INDUSTRIES) as CatalogueItem[]` |
| `catalogue.products` | `catalogueData.products as CatalogueItem[]` | `Object.values(UNIFIED_SYSTEMS) as CatalogueItem[]` |
| `catalogue.technologies` | `catalogueData.technologies as CatalogueItem[]` | `Object.values(UNIFIED_TECHNOLOGIES) as CatalogueItem[]` |
| `getTechLogoFile()` | Inline `Record<string, string>` logoMap | Reads `UNIFIED_TECHNOLOGIES[key].logoFile` |
| `CatalogueItem` interface | Current fields only | Superset — existing fields required, new fields optional |
| All other exports | Unchanged | Unchanged |

**Zero page component changes required.** All pages import from `catalogue.ts`, which preserves its export surface.

---

### 4.2 `/frontend/src/lib/knowledge-architecture.ts`

**Nature of change**: Converted from data store to thin re-export adapter.

**Before** (~620 lines of data + functions):
```typescript
export const TECHNOLOGIES: TechnologyRecord = { MACROCORE: { ... }, ... };
export const INDUSTRIES: IndustryRecord = { AGRICULTURE: { ... }, ... };
// ... full data definitions
export function getTechnologyByIndustry(...) { ... }
```

**After** (~20 lines of re-exports):
```typescript
// knowledge-architecture.ts — re-export adapter
// All data now lives in unified-data.ts
// This file preserved for backwards-compatible import paths

export {
  UNIFIED_TECHNOLOGIES as TECHNOLOGIES,
  UNIFIED_INDUSTRIES as INDUSTRIES,
  UNIFIED_STANDARDS as STANDARDS,
  UNIFIED_CONTAMINATION_MODES as CONTAMINATION_MODES,
  COMPARISON_TOPICS,
  FLEET_OPTIMIZATION,
  EDUCATIONAL_PATHWAYS,
  getTechnologyByIndustry,
  getContaminationByTechnology,
  getStandardsByTechnology,
  getRelatedTechnologies,
  getIndustriesBySeverity,
  getAllTechnologiesByFeature,
  mapKnowledgeNetwork,
  getSystemsByTechnology,
  getTechnologiesBySystemDomain,
  getIndustriesByContamination,
  getStandardsByContaminationMode,
} from '@/lib/unified-data';
```

The `TechnologyRecord`, `StandardRecord`, `ContaminationRecord`, `IndustryRecord` type definitions are also removed — replaced by the interface types defined in `unified-data.ts`.

---

### 4.3 `/frontend/src/app/technologies/page.tsx`

**Nature of change**: Two inline data constants removed; replaced by imports from unified-data.ts.

| Item | Current | After Phase 2 |
|---|---|---|
| `GEO_DEFINITIONS` constant | 12-entry inline `Record<string, string>` (lines 8–21) | Removed — `tech.geoDefinition` used instead |
| `TECH_COMPARISON` constant | 9-entry inline array (lines 23–33) | Removed — derived from `UNIFIED_TECHNOLOGIES` |
| JSON-LD `numberOfItems` | Hardcoded `9` | Updated to `12` |
| JSON-LD description | References "Nine exclusive protection architectures" | Updated to reflect all 12 |
| Import | No unified-data import | `import { UNIFIED_TECHNOLOGIES } from '@/lib/unified-data'` added |

No other changes to this file. All JSX structure, styling, animations, and FAQ content unchanged.

---

### 4.4 `/CLAUDE.md`

**Nature of change**: Documentation update only.

Items to update:
- Replace `catalogue.json` references in the "How Content Works" section with `unified-data.ts`
- Add `unified-data.ts` to the file structure diagram
- Update "Making Changes" workflow to show edits go to `unified-data.ts`, not `catalogue.json`
- Add note about `knowledge-architecture.ts` being a re-export adapter
- Document the Obsidian vault → export pipeline as Phase 3 intent
- Update the "Development Branch" note if needed

---

## 5. Files to Deprecate

### 5.1 `/frontend/catalogue.json`

**Action**: Archive to `/docs/data-archive/catalogue.json.bak`
**When**: After Step 2 confirms zero remaining imports in `src/`
**Why**: All data it contained is now in `unified-data.ts` with a richer schema. The JSON file has no TypeScript validation, no relational structure, no standards, and no contamination data. It is fully superseded.
**Risk of deletion**: LOW — it is not imported at runtime after Step 2. Moving rather than deleting is a safety measure: if an unanticipated import is discovered, the file can be restored without git history diving.
**Rollback path**: `mv docs/data-archive/catalogue.json.bak frontend/catalogue.json` and revert `catalogue.ts`

---

### 5.2 `GEO_DEFINITIONS` constant in `/frontend/src/app/technologies/page.tsx`

**Action**: Delete the inline `const GEO_DEFINITIONS = { ... }` block (lines 8–21)
**When**: Step 4
**Why**: Content migrated to `geoDefinition` field on each `UnifiedTechnology` entry. An inline page constant is not maintainable as the AI citation layer for the platform.
**Content preserved**: Yes — all 12 prose definitions are moved verbatim to `unified-data.ts`, not discarded.

---

### 5.3 `TECH_COMPARISON` constant in `/frontend/src/app/technologies/page.tsx`

**Action**: Delete the inline `const TECH_COMPARISON = [ ... ]` block (lines 23–33)
**When**: Step 4
**Why**: Content migrated to `systemDomain`, `comparisonFunction`, `comparisonMetric` fields on each `UnifiedTechnology`. A page-level constant cannot be consumed by Part Search or AI Engine.

---

### 5.4 Inline type definitions in `knowledge-architecture.ts`

**Action**: Delete `TechnologyRecord`, `StandardRecord`, `ContaminationRecord`, `IndustryRecord` type aliases (lines 20–70)
**When**: Step 3
**Why**: Superseded by the stricter `UnifiedTechnology`, `UnifiedStandard`, etc. interfaces in `unified-data.ts`. The old types used `Record<string, {...}>` with no key validation. The new types use `Record<TechnologyKey, UnifiedTechnology>` with compile-time key validation.
**Content preserved**: Interface field definitions are carried forward (with corrections) into `unified-data.ts` interfaces.

---

### 5.5 `techTags` field (eventual deprecation — not Phase 2)

**Action**: Retain in `UnifiedIndustry` and `UnifiedSystem` during Phase 2. Mark as deprecated in a JSDoc comment. Remove in Phase 3 when Obsidian export pipeline makes it redundant.
**Why retained in Phase 2**: Some Knowledge System pages may reference techTags for display purposes. The field is safe to retain — it carries no technical debt risk. Removal in Phase 2 would risk breaking pages not yet audited.
**Deprecation marker**:
```typescript
/** @deprecated Use applicableTechnologies[] with typed TechnologyKey instead */
techTags?: string[];
```

---

## 6. Validation Strategy

### 6.1 Continuous Validation — After Each Sub-Task

After every sub-task in Step 1 (1a through 1j), run:
```bash
cd frontend && npm run type-check
```

TypeScript compilation is the primary gating mechanism. Because all entity relationships use typed key unions (`TechnologyKey`, `IndustryKey`, etc.), a misspelled cross-reference or a missing required field fails at `type-check`, not at runtime.

---

### 6.2 Build Validation — After Each Step

After each step (1 through 6), run:
```bash
cd frontend && npm run build
```

The build must produce exactly 89 static pages with zero errors and zero TypeScript warnings. The page count is the integration test: if any entity slug changes or any page loses its data source, the build either fails or produces a different page count.

**Expected build output at each step**:
- Step 1: 89 pages (unified-data.ts is additive — no consuming files changed)
- Step 2: 89 pages (catalogue.ts now reads from unified-data.ts — same entities, same slugs)
- Step 3: 89 pages (knowledge-architecture.ts is now a passthrough — no consumers yet)
- Step 4: 89 pages (technologies/page.tsx renders from unified-data.ts)
- Step 5: 89 pages (catalogue.json removed — zero remaining imports)
- Step 6: 89 pages (final state)

---

### 6.3 Data Integrity Validation — Step 6

After Step 5, run a validation script (or run these checks manually in a Node.js REPL):

**Check A — No undefined in technology-industry traversals**:
```
For each IndustryKey in UNIFIED_INDUSTRIES:
  result = getTechnologyByIndustry(key)
  assert: result contains no undefined entries
  assert: result.length > 0
```

**Check B — No undefined in contamination traversals**:
```
For each TechnologyKey in UNIFIED_TECHNOLOGIES:
  result = getContaminationByTechnology(key)
  assert: result contains no undefined entries
```

**Check C — No undefined in standard traversals**:
```
For each TechnologyKey in UNIFIED_TECHNOLOGIES:
  result = getStandardsByTechnology(key)
  assert: result contains no undefined entries
```

**Check D — Knowledge graph completeness**:
```
For each TechnologyKey in UNIFIED_TECHNOLOGIES:
  result = mapKnowledgeNetwork(key, 'technology')
  assert: result.connections.standards has no undefined
  assert: result.connections.contamination has no undefined
  assert: result.connections.industries has no undefined
```

**Check E — Slug integrity**:
```
For each entity in UNIFIED_TECHNOLOGIES, UNIFIED_INDUSTRIES, UNIFIED_SYSTEMS:
  assert: getSlug(entity.name) === entity.slug
  assert: a directory exists at /frontend/out/[category]/[entity.slug]/
```

**Check F — Logo file integrity**:
```
For each entity in UNIFIED_TECHNOLOGIES:
  assert: file exists at /frontend/public/assets/[entity.logoFile]
  OR: entity.logoFile is listed in getTechLogoFile() return map
```

**Check G — TODO annotation tracking**:
```
grep -n "TODO: verify" frontend/src/lib/unified-data.ts
```
All `// TODO: verify` annotations must be documented in the header comment block of `unified-data.ts`. Count must match. Each TODO is either resolved before Step 6 or formally tracked as a known gap with a rationale comment.

---

### 6.4 Regression Validation — Routes and Content

After Step 5, manually verify 12 representative routes:

| Route | Check |
|---|---|
| `/technologies` | 12 technologies visible in comparison table |
| `/technologies/macrocore` | Page loads, hero content correct |
| `/technologies/syntrax` | System domain shown as Lubrication (not air intake) |
| `/industries/mining` | Correct technology list from reconciled source |
| `/industries/bus-coach` | Page loads (one of the 5 previously un-relational industries) |
| `/systems/airfilter` | Page loads, MACROCORE as primary technology |
| `/systems/oil` | Page loads, SYNTRAX as primary technology |
| `/knowledge-system` | Hub page loads (no knowledge-architecture.ts import change visible here) |
| `/about` | Navigation link still present |
| `/contact` | Page loads |
| `/` | Home page loads, stats correct |

---

### 6.5 SEO Regression Check

After Step 5:
```bash
grep -rn "canonical" frontend/out/ | grep "total-cost-ownership" | head -10
```
Both TCO canonical tags must still be present (they are in `layout.tsx` files, not in `catalogue.json` — no regression expected, but verify).

Verify the JSON-LD in `/out/technologies/index.html`:
- `numberOfItems` is `12`
- All 12 technology slugs are present in `itemListElement`
- All 12 `description` fields match `geoDefinition` from `unified-data.ts`

---

## 7. Rollback Strategy

### 7.1 Rollback Philosophy

Every step in the migration is independently reversible. The git history on `claude/dazzling-franklin-ALGY1` provides the rollback mechanism. Because the migration is additive-first (Step 1 creates a new file without modifying any existing consumer), the rollback complexity increases with each step but never requires destructive actions.

---

### 7.2 Rollback Points

| After Step | Rollback action | Time to restore |
|---|---|---|
| Step 1 (unified-data.ts created, no consumers changed) | `git rm frontend/src/lib/unified-data.ts` | < 1 minute |
| Step 2 (catalogue.ts updated) | `git checkout HEAD~1 -- frontend/src/lib/catalogue.ts` | < 1 minute |
| Step 3 (knowledge-architecture.ts converted) | `git checkout HEAD~1 -- frontend/src/lib/knowledge-architecture.ts` | < 1 minute |
| Step 4 (technologies/page.tsx updated) | `git checkout HEAD~1 -- frontend/src/app/technologies/page.tsx` | < 1 minute |
| Step 5 (catalogue.json archived) | `cp docs/data-archive/catalogue.json.bak frontend/catalogue.json` + revert catalogue.ts | < 2 minutes |
| Step 6 (full validation complete) | `git revert` the Phase 2 commit range | < 5 minutes |

In all cases: after the rollback action, run `npm run build` to confirm 89 pages restore cleanly.

---

### 7.3 Step-Level Rollback Commands

**Rollback Step 1** (remove unified-data.ts):
```bash
git rm frontend/src/lib/unified-data.ts
git commit -m "rollback: Remove unified-data.ts (Step 1 revert)"
```

**Rollback Step 2** (restore catalogue.ts to catalogue.json):
```bash
git checkout HEAD~1 -- frontend/src/lib/catalogue.ts
# catalogue.json must still be present in /frontend/ at this point
git commit -m "rollback: Restore catalogue.ts to catalogue.json source"
```

**Rollback Step 3** (restore knowledge-architecture.ts data):
```bash
git checkout HEAD~1 -- frontend/src/lib/knowledge-architecture.ts
git commit -m "rollback: Restore knowledge-architecture.ts data definitions"
```

**Rollback Step 4** (restore technologies/page.tsx inline blocks):
```bash
git checkout HEAD~1 -- frontend/src/app/technologies/page.tsx
git commit -m "rollback: Restore GEO_DEFINITIONS and TECH_COMPARISON to page.tsx"
```

**Rollback Step 5** (restore catalogue.json):
```bash
cp docs/data-archive/catalogue.json.bak frontend/catalogue.json
git checkout HEAD~1 -- frontend/src/lib/catalogue.ts
git commit -m "rollback: Restore catalogue.json as primary data source"
```

**Full Phase 2 rollback** (all steps at once):
```bash
# Find the commit hash before Phase 2 began (last Phase 1 commit)
git log --oneline | grep "Phase 1"
# Revert all Phase 2 commits
git revert [phase2-start-hash]..[HEAD] --no-commit
git commit -m "rollback: Revert Phase 2 — Single Source of Truth migration"
```

---

### 7.4 Risk-Specific Rollback Triggers

| Trigger condition | Rollback to | Reason |
|---|---|---|
| `npm run build` produces < 89 pages at any step | Previous step's commit | A page disappeared — slug mismatch or missing entity |
| TypeScript compilation errors after Step 2 that cannot be resolved in < 30 minutes | Step 1 state | CatalogueItem type incompatibility requires interface redesign |
| Any existing route returns 404 after Step 2 | Step 1 state | Slug derivation changed — explicit slug field must be audited |
| technologies/page.tsx JSON-LD output changes content after Step 4 | Step 3 state | geoDefinition content differs from GEO_DEFINITIONS — must audit |
| Knowledge System pages display incorrect technology-industry mappings | Step 0 required | Conflict reconciliation was incomplete — must re-run Step 0 |

---

### 7.5 Zero-Risk Rollback Window

Steps 1 through 4 each modify exactly one file and can be independently reverted without affecting any other step's changes. The migration window where a full rollback is < 2 minutes is Steps 1–4.

After Step 5 (catalogue.json moved), the rollback requires restoring a file from the archive directory. This adds approximately 60 seconds. The file is never deleted — only moved — so no git history reconstruction is needed.

After Step 6 (validation complete and committed), the full Phase 2 migration is considered stable. A rollback at this point is a business decision, not a technical emergency, and uses `git revert` on the Phase 2 commit range.

---

## Appendix — Pre-Migration Authoring Reference

### A.1 Technology-Industry Reconciliation Template

For each of the 7 conflicting industries, complete this table before writing unified-data.ts:

```
Industry: CONSTRUCTION
────────────────────────────────────────────────────────────────────
Source                          | Technologies listed
────────────────────────────────────────────────────────────────────
knowledge-architecture.ts       | MACROCORE, NANOFORCE, DURATECH
techPagesData.ts applications   | [check each technology's applications[].sector]
TECH_COMPARISON.industries      | NANOFORCE: "Construction, Mining, Manufacturing, Marine"
                                | MACROCORE: "Mining, Agriculture, Construction, Power Gen"
────────────────────────────────────────────────────────────────────
Appears in ≥ 2 sources:         | MACROCORE ✅, NANOFORCE ✅
                                | DURATECH (knowledge-arch only)
────────────────────────────────────────────────────────────────────
```

Repeat for AGRICULTURE, MINING, MARINE, AUTOMOTIVE, MANUFACTURING, POWER_GENERATION.

---

### A.2 Authored Entry Fields — Minimum Viable

For the 6 missing technologies and 5 missing industries, the minimum acceptable entry for Phase 2 is:
- All fields that can be sourced from existing data: fully authored
- All fields that require owner confirmation: present but marked `// TODO: verify — source: none`
- Zero fields omitted entirely (TypeScript requires all non-optional fields to be present)

For optional fields that are genuinely unknown, use an explicit empty array `[]` with a `// TODO:` comment rather than omitting the field:
```typescript
relatedStandards: [], // TODO: verify — no standards confirmed for INTEKCORE
```

This ensures the query functions return empty arrays (not undefined) and no future consumer crashes on missing data.

---

*Plan generated: 2026-06-02*
*Repository: latamfilters/world-catalogue*
*Branch: claude/dazzling-franklin-ALGY1*
*Prerequisite document: PHASE2_EXECUTION_PLAN.md*
