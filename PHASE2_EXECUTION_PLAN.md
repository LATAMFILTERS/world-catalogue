# PHASE2_EXECUTION_PLAN.md
## Phase 2 — Single Source of Truth

**Date**: 2026-06-02  
**Branch**: `claude/dazzling-franklin-ALGY1`  
**Objective**: Eliminate four parallel, unsynchronised data registries. Create one authoritative TypeScript schema that is the single source for all Industries, Systems, Technologies, Problems, and Standards across every layer of the application.

---

## 1. Current State

### 1.1 Registry Inventory

The application currently maintains **four independent data registries** plus two inline data structures. None are synchronised. A change to one is never reflected in the others.

---

#### Registry A — `catalogue.json` + `catalogue.ts`

**Location**: `/frontend/catalogue.json` (data) + `/frontend/src/lib/catalogue.ts` (loader)  
**Consumed by**: All industry pages (`/industries/[slug]`), system pages (`/systems/[slug]`), technology pages (`/technologies/[slug]`), home page stats, CTA sections  
**Purpose**: Page rendering — display content, hero text, feature lists, stat blocks

**Entity counts**:
- Industries: **12** — Agriculture, Automotive, Bus Coach, Construction, Manufacturing, Marine, Mining, Oil Gas, Power Generation, Railway, Trucks Fleets, Waste Municipal
- Products/Systems: **12** — Airfilter, Aquaguard Series, Cabin, Coolant, Dryer, Fuel, Housing, Hydraulic, Kits, Marine, Oil, Water
- Technologies: **12** — Aquaguard Series, Aquaguard, Cooltech, Drycore, Duratech, Intekcore, Macrocore, Marineclean, Microkappa, Nanoforce, Syntepore, Syntrax

**Schema per entity**:
```
name, file, title, subtitle, description,
features[], benefits[], techTags[],
stats{ percentages[], ratings[] },
cta,
videoBody[]?, engineeringBody?,    ← industries only
statistic?, statisticSource?       ← industries only
```

**Cross-reference method**: `techTags: ['MACROCORE™', 'AQUAGUARD™']` — loose strings with ™ symbols. No foreign key. No validation. No reverse lookup. A typo in `techTags` is silent.

**Missing entirely**: contamination modes, standards, relational mappings, contamination exposure levels, operating conditions.

---

#### Registry B — `knowledge-architecture.ts`

**Location**: `/frontend/src/lib/knowledge-architecture.ts`  
**Consumed by**: **Nobody** — confirmed by `grep -rn "import.*knowledge-architecture" src/` returning zero results. This is a data island.  
**Purpose**: Relational graph — technologies ↔ standards ↔ contamination modes ↔ industries

**Entity counts**:
- Technologies: **6** — MACROCORE, NANOFORCE, MICROKAPPA, SYNTRAX, AQUAGUARD, DURATECH
- Industries: **7** — AGRICULTURE, CONSTRUCTION, MINING, MARINE, AUTOMOTIVE, MANUFACTURING, POWER_GENERATION
- Standards: **6** — ISO_16889, ISO_4406, ISO_5011, ASTM_D6304, SAE_J1539, NFPA_T214
- Contamination Modes: **3** — DIESEL_WATER, PARTICLE_WEAR, HYDRAULIC_CONTAMINATION

**Schema per technology**:
```
id, name, category, tagline, slug,
relatedStandards[],
addressesContamination[],
applicableIndustries[],
comparisonTopics[],
keyMetrics{},
description
```

**Schema per industry**:
```
id, name, slug, contaminationExposure,
primaryEquipment[],
relevantContamination[],
applicableTechnologies[],
applicableStandards[],
operatingConditions{}
```

**Cross-reference method**: Typed constant keys (`'MACROCORE'`, `'ISO_16889'`). TypeScript validates at compile time. Bidirectional traversal supported via query functions.

**Query functions available** (unused): `getTechnologyByIndustry`, `getContaminationByTechnology`, `getStandardsByTechnology`, `getRelatedTechnologies`, `getIndustriesBySeverity`, `getAllTechnologiesByFeature`, `mapKnowledgeNetwork`

---

#### Registry C — `techPagesData.ts`

**Location**: `/frontend/src/app/technologies/[slug]/techPagesData.ts`  
**Consumed by**: `/technologies/[slug]/page.tsx` — the technology detail page renderer  
**Purpose**: Narrative content — hero sections, system explanations, stage-by-stage breakdowns, application examples, testimonials

**Entity count**: **12** — all technologies (aquaguard-series, syntrax, nanoforce, macrocore, intekcore, syntepore, aquaguard, cooltech, drycore, duratech, marineclean, microkappa)

**Schema per technology** (rich narrative):
```
categoryTag, heroTitle, heroSubtitle, heroTagline,
heroImage, heroStats[],
logoSrc,
systemHeadline, systemParagraphs[],
productImageSrc, productImageCaption,
stagesHeading, stages[{ number, tag, title, body, stat, statLabel }],
specs[{ label, value, sub }],
applicationsHeading, applicationsSubtext,
applications[{ sector, detail }],
testimonial{ quote, role, sector },
ctaTag, ctaHeading, ctaBody
```

**Cross-reference method**: None. Standalone content. No links to standards, contamination modes, industries, or systems.

---

#### Registry D — `GEO_DEFINITIONS` (inline in `technologies/page.tsx`)

**Location**: Inline constant in `/frontend/src/app/technologies/page.tsx` (lines 8–22)  
**Consumed by**: That page only — used for AI/GEO-optimised descriptions and JSON-LD structured data  
**Purpose**: Machine-readable prose definitions for LLM and search crawler consumption

**Entity count**: **12** — all technologies (same set as techPagesData.ts)

**Schema**: `Record<slug, string>` — a single long-form prose paragraph per technology

**Cross-reference method**: None. Inline dictionary in a page component.

---

#### Registry E — `TECH_COMPARISON` (inline in `technologies/page.tsx`)

**Location**: Inline constant in `/frontend/src/app/technologies/page.tsx` (lines 23–33)  
**Consumed by**: That page only — renders the technology comparison table  
**Purpose**: Technical comparison data for the hub table

**Entity count**: **9** — Macrocore, Syntepore, Intekcore, Drycore, Aquaguard, Syntrax, Nanoforce, Cooltech, Microkappa  
**Missing from table**: Aquaguard Series, Duratech, Marineclean

**Schema per row**:
```
name, slug, system, func, metric, industries
```

---

### 1.2 Entity Count Conflict Matrix

| Entity Type | catalogue.json | knowledge-architecture.ts | techPagesData.ts | GEO_DEFINITIONS | TECH_COMPARISON |
|-------------|---------------|--------------------------|-----------------|-----------------|-----------------|
| Technologies | **12** | **6** | **12** | **12** | **9** |
| Industries | **12** | **7** | — | — | — |
| Systems | **12** | — | — | — | — |
| Standards | — | **6** | — | — | — |
| Contamination (Problems) | — | **3** | — | — | — |

---

### 1.3 Missing Entities Per Registry

**Technologies missing from `knowledge-architecture.ts`** (6 of 12):
- `SYNTEPORE` — all-synthetic air intake (coastal/marine)
- `INTEKCORE` — high-pressure filter housing architecture
- `DRYCORE` — molecular sieve desiccant compressed air
- `COOLTECH` — SCA-releasing coolant filtration
- `MARINECLEAN` — salt-resistant marine filtration
- `AQUAGUARD_SERIES` — three-stage turbine fuel separator line

**Industries missing from `knowledge-architecture.ts`** (5 of 12):
- `BUS_COACH`
- `RAILWAY`
- `TRUCKS_FLEETS`
- `OIL_GAS`
- `WASTE_MUNICIPAL`

**Systems missing from every registry** (12 exist in catalogue but have no relational data):
- No system has: applicable technologies, contamination addressed, applicable standards, applicable industries

**Standards missing from `knowledge-architecture.ts`** (referenced in content but no entry):
- `ISO_11155` — Cabin air filtration (referenced in cabin safety domain page)
- `ISO_8573_1` — Compressed air purity classes (referenced in compressed air domain page)
- `DIN_51524` — Hydraulic fluid specifications
- `ISO_12937` — Water in petroleum products (referenced in fuel systems)
- `ISO_14540` — Marine fuel standards (referenced in MARINE industry `applicableStandards`)

---

### 1.4 Naming Conflicts

| Entity | In catalogue.json | In knowledge-architecture.ts | In techPagesData.ts | Conflict |
|--------|------------------|------------------------------|---------------------|----------|
| Syntrax | `Syntrax` | `SYNTRAX` | `syntrax` | Logo file is `logo-sintrax.png` — three spellings of one name |
| Aquaguard Series | Listed as separate tech from `Aquaguard` | Not present | `aquaguard-series` (separate entry from `aquaguard`) | Two entries for what may be one product line |
| NANOFORCE_HYDRAULIC | Not present | Was listed in CONSTRUCTION — removed Phase 1 | Not present | Was phantom reference to non-existent entity |
| Industry slugs | `Bus Coach` (space), `Oil Gas` (space) | Not present | — | Slug generation strips spaces: `bus-coach`, `oil-gas` |
| Product names | `Airfilter` | — | — | Display name is "Air Filters" — slug becomes `airfilter` not `air-filters` |

---

### 1.5 Cross-Reference Method Conflict

| Registry | Method | Validation | Reverse Lookup |
|----------|--------|-----------|----------------|
| catalogue.json `techTags` | Loose string with ™ symbol | None — silent on typo | No |
| knowledge-architecture.ts `applicableTechnologies[]` | Typed constant key | TypeScript compile-time | Yes — via `getTechnologyByIndustry()` |
| techPagesData.ts | None | N/A | N/A |
| GEO_DEFINITIONS | None | N/A | N/A |
| TECH_COMPARISON `industries` | Free text string | None | No |

---

### 1.6 Consumer Map (What Breaks if Data Source Changes)

| Registry | Pages That Consume It | Pages That Would Break on Removal |
|----------|-----------------------|-----------------------------------|
| catalogue.json | `/industries`, `/industries/[slug]`, `/systems`, `/systems/[slug]`, `/technologies`, `/technologies/[slug]` | All 6 catalogue route groups — **38+ pages** |
| knowledge-architecture.ts | None currently | Nothing currently (data island) |
| techPagesData.ts | `/technologies/[slug]` only | 12 technology detail pages |
| GEO_DEFINITIONS | `/technologies` only | Technology hub JSON-LD and GEO block |
| TECH_COMPARISON | `/technologies` only | Technology comparison table |

---

## 2. Future State

### 2.1 Architecture Goal

One authoritative TypeScript file — `unified-data.ts` — that is the single source of truth for all entities. All other registries either import from it or are eliminated.

```
unified-data.ts
├── TECHNOLOGIES (12 entries — full schema)
├── INDUSTRIES (12 entries — full schema)  
├── SYSTEMS (12 entries — full schema, new)
├── CONTAMINATION_MODES (3+ entries — moved from knowledge-architecture.ts)
├── STANDARDS (11+ entries — expanded from knowledge-architecture.ts)
└── Query functions (from knowledge-architecture.ts, expanded)
```

**Consuming architecture after migration**:

```
unified-data.ts
    ↓ imported by
catalogue.ts            ← replaces catalogue.json as runtime data source
    ↓ imported by
All page components     ← no page changes needed (same API surface)

unified-data.ts
    ↓ imported by
knowledge-architecture.ts  ← becomes a thin re-export wrapper for backwards compat
    ↓ imported by
Phase 4 Knowledge System pages

unified-data.ts
    ↓ imported by
technologies/page.tsx   ← replaces GEO_DEFINITIONS and TECH_COMPARISON inline blocks

unified-data.ts
    ↓ imported by
technologies/[slug]/page.tsx  ← TECH_PAGES data can optionally reference shared fields
```

---

### 2.2 Unified Technology Schema

Each of the 12 technologies gets a single unified record combining all four current schema layers:

```typescript
interface UnifiedTechnology {
  // Identity (from knowledge-architecture.ts + catalogue.json)
  id: string;                  // 'macrocore'
  key: string;                 // 'MACROCORE' — constant key for cross-reference
  name: string;                // 'MACROCORE™'
  slug: string;                // 'macrocore' — URL path segment
  category: string;            // 'Air Filtration'
  tagline: string;             // short marketing line

  // Relational graph (from knowledge-architecture.ts)
  relatedStandards: string[];       // ['ISO_5011', 'SAE_J1539', ...]
  addressesContamination: string[]; // ['PARTICLE_WEAR']
  applicableIndustries: string[];   // ['AGRICULTURE', 'MINING', ...]
  keyMetrics: Record<string, string>; // { efficiency: '99.98%', ... }

  // Rendering content (from catalogue.json)
  file: string;
  title: string;
  subtitle: string;
  description: string;          // ← this becomes the canonical definition
  features: string[];
  stats: { percentages?: string[]; ratings?: string[] };
  cta: string;

  // AI/GEO definition (from GEO_DEFINITIONS)
  geoDefinition: string;        // long-form prose for LLM/search consumption

  // Hub comparison data (from TECH_COMPARISON)
  systemDomain: string;         // 'Air Intake', 'Hydraulic', etc.
  comparisonFunction: string;   // one-line technical function
  comparisonMetric: string;     // key performance metric string
}
```

---

### 2.3 Unified Industry Schema

Each of the 12 industries gets a unified record merging catalogue.json rendering content with knowledge-architecture.ts relational data:

```typescript
interface UnifiedIndustry {
  // Identity
  id: string;                  // 'agriculture'
  key: string;                 // 'AGRICULTURE'
  name: string;                // 'Agriculture'
  slug: string;                // 'agriculture'

  // Relational graph (from knowledge-architecture.ts + expand for 5 missing)
  contaminationExposure: 'LOW' | 'LOW-MEDIUM' | 'MEDIUM' | 'MEDIUM-HIGH' | 'HIGH' | 'EXTREME';
  primaryEquipment: string[];
  relevantContamination: string[];  // references CONTAMINATION_MODES keys
  applicableTechnologies: string[]; // references TECHNOLOGIES keys
  applicableStandards: string[];    // references STANDARDS keys
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

---

### 2.4 Unified System Schema (New Entity Type)

Systems/products currently have zero relational data. The unified schema adds relational fields:

```typescript
interface UnifiedSystem {
  // Identity
  id: string;          // 'airfilter'
  key: string;         // 'AIR_FILTER'
  name: string;        // 'Air Filters'
  slug: string;        // 'airfilter' (preserves existing URL)

  // Relational (new — no current source)
  primaryTechnology: string;      // 'MACROCORE' — the flagship technology
  supportingTechnologies: string[]; // other applicable technologies
  applicableIndustries: string[];  // which industries use this system
  addressesContamination: string[]; // contamination modes this system targets
  applicableStandards: string[];   // relevant performance standards

  // Rendering content (from catalogue.json — unchanged)
  file: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  benefits: string[];
  techTags: string[];   // retained for backwards compat during migration
  stats: { percentages?: string[]; ratings?: string[] };
  cta: string;
}
```

---

### 2.5 Retained Schemas (No Change)

- **Contamination Modes** — existing schema from `knowledge-architecture.ts` is correct; add 2–3 missing modes (Cabin Air Contamination, Coolant Contamination, Compressed Air Moisture)
- **Standards** — existing schema from `knowledge-architecture.ts` is correct; add 5 missing standards (ISO_11155, ISO_8573_1, DIN_51524, ISO_12937, ISO_14540)

---

### 2.6 What Gets Eliminated

| Current structure | Future state |
|-------------------|--------------|
| `catalogue.json` | Replaced by `unified-data.ts` as data source; JSON file retained as build artifact for reference only |
| `GEO_DEFINITIONS` in `technologies/page.tsx` | Moved to `geoDefinition` field in each `UnifiedTechnology` |
| `TECH_COMPARISON` in `technologies/page.tsx` | Moved to `systemDomain`, `comparisonFunction`, `comparisonMetric` fields |
| `knowledge-architecture.ts` exports | Preserved as re-exports from `unified-data.ts` for backwards compatibility |
| `techPagesData.ts` | Unchanged — narrative content layer is intentionally separate |

---

## 3. Migration Strategy

The migration has four properties that make it safe:

1. **Additive first** — add new fields to `unified-data.ts` before removing old sources
2. **One consumer at a time** — update each consuming file independently and verify build after each
3. **Thin adapter layer** — `catalogue.ts` becomes an adapter that reads from `unified-data.ts` but exposes the same API surface (`catalogue.industries`, `catalogue.products`, `catalogue.technologies`, `getSlug`, `getItemBySlug`)
4. **No page component changes** — all pages continue to import from `catalogue.ts`; only `catalogue.ts` changes its data source

---

### Step 1 — Create `unified-data.ts` (additive, nothing breaks)

Create `/frontend/src/lib/unified-data.ts`.

Populate the file by **merging** all four current registries:

**For each of the 12 technologies**:
- Start with the `knowledge-architecture.ts` entry (6 exist; 6 need to be authored)
- Add `file`, `title`, `subtitle`, `features`, `stats`, `cta` from `catalogue.json`
- Add `geoDefinition` from `GEO_DEFINITIONS`
- Add `systemDomain`, `comparisonFunction`, `comparisonMetric` from `TECH_COMPARISON` (9 exist; 3 need to be authored: Aquaguard Series, Duratech, Marineclean)
- Author the 6 missing relational entries (SYNTEPORE, INTEKCORE, DRYCORE, COOLTECH, MARINECLEAN, AQUAGUARD_SERIES) using their `techPagesData.ts` and `GEO_DEFINITIONS` entries as source material

**For each of the 12 industries**:
- Start with `knowledge-architecture.ts` entries (7 exist; 5 need to be authored)
- Add `file`, `title`, `subtitle`, `description`, `features`, `benefits`, `stats`, `cta` from `catalogue.json`
- Author the 5 missing relational entries (BUS_COACH, RAILWAY, TRUCKS_FLEETS, OIL_GAS, WASTE_MUNICIPAL) using their `catalogue.json` entries + `techTags` as starting point

**For each of the 12 systems**:
- Pull all rendering fields from `catalogue.json` products array
- Author relational fields (`primaryTechnology`, `applicableIndustries`, etc.) by cross-referencing `techTags` and `TECH_COMPARISON`

**Standards**: Copy from `knowledge-architecture.ts`, add 5 missing entries

**Contamination Modes**: Copy from `knowledge-architecture.ts`, add 3 missing modes

**Build check after Step 1**: No consuming files changed. Build must still produce 89 pages.

---

### Step 2 — Update `catalogue.ts` to read from `unified-data.ts`

Change `catalogue.ts` from:
```typescript
import catalogueData from '../../catalogue.json';
export const catalogue = {
  industries: catalogueData.industries as CatalogueItem[],
  products: catalogueData.products as CatalogueItem[],
  technologies: catalogueData.technologies as CatalogueItem[],
};
```

To:
```typescript
import { UNIFIED_INDUSTRIES, UNIFIED_SYSTEMS, UNIFIED_TECHNOLOGIES } from '@/lib/unified-data';
export const catalogue = {
  industries: UNIFIED_INDUSTRIES as CatalogueItem[],
  products: UNIFIED_SYSTEMS as CatalogueItem[],
  technologies: UNIFIED_TECHNOLOGIES as CatalogueItem[],
};
```

The `CatalogueItem` interface must be updated to accept the unified schema (which is a superset — all existing fields are present plus new relational fields).

**Build check after Step 2**: All 38+ pages continue to render. TypeScript validates that `CatalogueItem` fields are satisfied by `UnifiedTechnology`/`UnifiedIndustry`/`UnifiedSystem`.

---

### Step 3 — Update `knowledge-architecture.ts` to re-export from `unified-data.ts`

Change `knowledge-architecture.ts` from containing the data to re-exporting it:

```typescript
// knowledge-architecture.ts — now a thin re-export adapter
export { 
  UNIFIED_TECHNOLOGIES as TECHNOLOGIES,
  UNIFIED_INDUSTRIES as INDUSTRIES,
  UNIFIED_STANDARDS as STANDARDS,
  UNIFIED_CONTAMINATION_MODES as CONTAMINATION_MODES,
  getTechnologyByIndustry,
  getContaminationByTechnology,
  // ... all existing exports
} from '@/lib/unified-data';
```

This preserves backwards compatibility for Phase 4 when pages import from `knowledge-architecture.ts`.

**Build check after Step 3**: No page changes; all builds pass.

---

### Step 4 — Remove inline blocks from `technologies/page.tsx`

Replace the `GEO_DEFINITIONS` constant and `TECH_COMPARISON` constant in `technologies/page.tsx` with imports from `unified-data.ts`:

```typescript
import { UNIFIED_TECHNOLOGIES } from '@/lib/unified-data';
// Use tech.geoDefinition instead of GEO_DEFINITIONS[slug]
// Use tech.systemDomain, tech.comparisonFunction, etc. instead of TECH_COMPARISON rows
```

**Build check after Step 4**: Technologies hub page renders with data from unified source.

---

### Step 5 — Deprecate `catalogue.json` as primary source

Move `catalogue.json` to `/frontend/catalogue.json.bak` or to `/docs/data-archive/`. The file is no longer imported. `catalogue.ts` imports from `unified-data.ts`.

Add a comment at the top of `unified-data.ts`:
```typescript
// Single Source of Truth — all entity data lives here.
// catalogue.json is deprecated as of Phase 2.
// techPagesData.ts is intentionally separate (narrative/hero content layer).
```

---

## 4. Risks

### 4.1 Data Authoring Risk — Missing Entries

**Risk**: 6 technologies, 5 industries, 12 systems, 3 contamination modes, and 5 standards require new relational data to be authored. If relational fields are incorrectly assigned (wrong contamination mode, wrong industry, missing standard), downstream query functions will return incorrect results when Phase 4 wires them to pages.

**Severity**: MEDIUM  
**Mitigation**: Author new entries from multiple sources simultaneously — use `catalogue.json` `techTags` as the starting point for technology-industry mappings, then cross-check against `GEO_DEFINITIONS` prose and `TECH_COMPARISON.industries` strings. Any field that cannot be verified from existing sources should be marked `// TODO: verify` rather than guessed.

---

### 4.2 Type Compatibility Risk — `CatalogueItem` Interface

**Risk**: `catalogue.ts` exports `CatalogueItem[]` arrays. Changing the data source from `catalogue.json` to `unified-data.ts` requires the unified schema to be a superset of `CatalogueItem`. If any required `CatalogueItem` field is missing from `UnifiedTechnology`, TypeScript compilation fails and all pages break.

**Severity**: MEDIUM  
**Mitigation**: Before Step 2, run a field diff between `CatalogueItem` and the proposed `UnifiedTechnology` schema. Ensure every field in `CatalogueItem` has a corresponding field in `UnifiedTechnology` with a compatible type. The unified schema adds fields — it does not remove any.

---

### 4.3 Slug Consistency Risk

**Risk**: `catalogue.ts`'s `getSlug()` function generates slugs dynamically from names. `getSlug("Aquaguard Series")` → `"aquaguard-series"`. If `unified-data.ts` defines a technology with a different `name` spelling, its generated slug will differ from the existing URL path in `/out/technologies/aquaguard-series/`. This would create a 404 for an existing page.

**Severity**: HIGH for any technology that changes display name  
**Mitigation**: The `slug` field in `UnifiedTechnology` must be explicitly set (not derived) and must exactly match the existing directory name in `frontend/out/technologies/`. The `getSlug()` function should validate against the explicit `slug` field in a build-time check.

---

### 4.4 `techPagesData.ts` Divergence

**Risk**: `techPagesData.ts` contains rich narrative content (hero text, stage descriptions, testimonials) that is completely separate from the new unified schema. If `unified-data.ts` defines a technology's `description` that contradicts `techPagesData.ts`'s `heroTagline` or `systemParagraphs`, the site presents inconsistent information across the technologies hub and the detail page.

**Severity**: LOW — these are different content registers (short descriptions vs. narrative)  
**Mitigation**: During authoring, review `techPagesData.ts` entries and ensure `description` and `geoDefinition` in `unified-data.ts` are consistent with (not identical to) the narrative content in `techPagesData.ts`. The two layers serve different purposes and different audiences.

---

### 4.5 `Aquaguard` vs `Aquaguard Series` Entity Ambiguity

**Risk**: `catalogue.json` lists `Aquaguard` and `Aquaguard Series` as two separate technology entries. `knowledge-architecture.ts` has only `AQUAGUARD`. `techPagesData.ts` has both `aquaguard` and `aquaguard-series`. It is unclear whether these are: (a) two distinct products that should be two distinct entities, or (b) one product with two presentation contexts.

**Severity**: MEDIUM — if treated incorrectly, one of the two technology detail pages may receive wrong data  
**Mitigation**: Treat as two distinct entities in `unified-data.ts`. `AQUAGUARD` represents the core hydrophobic water-separation technology. `AQUAGUARD_SERIES` represents the FH 900/1000 product line (three-stage turbine separator). Both get separate entries. The relationship can be expressed as `AQUAGUARD_SERIES.primaryTechnology = 'AQUAGUARD'`.

---

### 4.6 `SYNTRAX`/`SINTRAX` Asset Naming

**Risk**: `catalogue.ts`'s `getTechLogoFile()` maps `Syntrax` → `logo-sintrax.png`. The technology is called `SYNTRAX` in all text but the logo asset is `sintrax`. This inconsistency exists independently of the unified data migration. If `unified-data.ts` normalises the canonical name as `SYNTRAX`, the logo mapping must explicitly handle the `sintrax` asset name.

**Severity**: LOW — visual only, no route risk  
**Mitigation**: Keep the `getTechLogoFile()` mapping explicit — do not auto-derive logo path from technology name. Document the intentional `SYNTRAX → logo-sintrax.png` mapping in `unified-data.ts`.

---

## 5. Dependencies

### 5.1 Internal Dependencies

| Dependency | Required Before | Notes |
|------------|----------------|-------|
| Phase 1 complete | Step 1 of Phase 2 | Phase 1 is now complete ✅ |
| `NANOFORCE_HYDRAULIC` removed | Step 1 | Completed in Phase 1 Task 1.3 ✅ |
| Decision on Aquaguard/Aquaguard Series identity | Step 1 | Must be resolved before authoring — see Risk 4.5 |
| Full field inventory of `CatalogueItem` | Step 2 | Run field diff before updating `catalogue.ts` |
| Build passing at each step | Next step | Never proceed to next step with a failing build |

### 5.2 External Dependencies

| Dependency | Type | Impact if absent |
|------------|------|-----------------|
| Technical knowledge of 6 missing technologies | Content authoring | Relational fields for SYNTEPORE, INTEKCORE, DRYCORE, COOLTECH, MARINECLEAN, AQUAGUARD_SERIES must be accurate. If not known precisely, field values should be marked `TODO` rather than guessed. |
| Industry knowledge for 5 missing industries | Content authoring | Bus Coach, Railway, Trucks Fleets, Oil Gas, Waste Municipal need contamination exposure ratings, primary equipment lists, and applicable standards |
| No Phase 2 → Phase 3/4 ordering constraint | Architecture | Phase 3 (Obsidian export) and Phase 4 (Knowledge Graph) both depend on Phase 2 being complete. They cannot be started until `unified-data.ts` is populated and validated. |

---

## 6. Implementation Order

### Strict sequence — each step depends on the previous

```
Step 1: Create unified-data.ts
  ├── 1a. Define all TypeScript interfaces
  ├── 1b. Migrate 6 existing technologies from knowledge-architecture.ts
  ├── 1c. Author 6 missing technologies (SYNTEPORE, INTEKCORE, DRYCORE, COOLTECH, MARINECLEAN, AQUAGUARD_SERIES)
  ├── 1d. Migrate 7 existing industries from knowledge-architecture.ts
  ├── 1e. Author 5 missing industries (BUS_COACH, RAILWAY, TRUCKS_FLEETS, OIL_GAS, WASTE_MUNICIPAL)
  ├── 1f. Author 12 systems with relational fields (no current source — derive from catalogue.json techTags)
  ├── 1g. Migrate 6 standards + author 5 missing (ISO_11155, ISO_8573_1, DIN_51524, ISO_12937, ISO_14540)
  ├── 1h. Migrate 3 contamination modes + author 3 missing (cabin, coolant, compressed air)
  └── 1i. Migrate all query functions from knowledge-architecture.ts + add new ones for systems
  → Build check: 89 pages ✅ (no consumers yet)

Step 2: Update catalogue.ts to read from unified-data.ts
  ├── 2a. Update CatalogueItem interface to accept unified schema fields
  ├── 2b. Replace catalogue.json import with unified-data.ts import
  └── 2c. Verify getSlug() still produces correct slugs for all 36 entities
  → Build check: 89 pages ✅ (same API surface, new data source)

Step 3: Update knowledge-architecture.ts to re-export from unified-data.ts
  ├── 3a. Replace all TECHNOLOGIES, INDUSTRIES, STANDARDS, CONTAMINATION_MODES definitions with re-exports
  └── 3b. Verify all exported query functions still work with unified types
  → Build check: 89 pages ✅ (nothing consumes it yet, but the export surface is preserved)

Step 4: Remove GEO_DEFINITIONS and TECH_COMPARISON from technologies/page.tsx
  ├── 4a. Import UNIFIED_TECHNOLOGIES in technologies/page.tsx
  ├── 4b. Replace GEO_DEFINITIONS[slug] with tech.geoDefinition
  └── 4c. Replace TECH_COMPARISON array with UNIFIED_TECHNOLOGIES filtered by comparisonFunction
  → Build check: 89 pages ✅ (technologies hub reads from unified source)

Step 5: Deprecate catalogue.json
  ├── 5a. Remove import of catalogue.json from catalogue.ts (already done in Step 2)
  ├── 5b. Move catalogue.json to /docs/data-archive/ with deprecation notice
  └── 5c. Update CLAUDE.md to document unified-data.ts as the new Single Source of Truth
  → Build check: 89 pages ✅

Step 6: Validate complete data integrity
  ├── 6a. Run getTechnologyByIndustry() for all 12 industries — verify no undefined entries
  ├── 6b. Run mapKnowledgeNetwork() for all 12 technologies — verify complete connection graphs
  ├── 6c. Run getContaminationByTechnology() for all 12 technologies — verify contamination mappings
  └── 6d. Verify all 36 entity slugs match their existing /out/ directory paths
  → Final check: Zero undefined entries, all slugs valid, all 89 pages still generated
```

---

### Effort Estimate

| Step | Tasks | Estimated effort |
|------|-------|-----------------|
| Step 1a–1i — Create unified-data.ts | Interface definition + data authoring for 6 technologies + 5 industries + 12 systems + 8 standards + 3 contamination modes | 8–12 hours |
| Step 2a–2c — Update catalogue.ts | Interface update + import swap + slug validation | 1–2 hours |
| Step 3a–3b — Re-export from knowledge-architecture.ts | Thin wrapper + type alignment | 1 hour |
| Step 4a–4c — Remove inline blocks from technologies/page.tsx | Import + substitution | 1–2 hours |
| Step 5a–5c — Deprecate catalogue.json | File move + docs update | 30 minutes |
| Step 6a–6d — Integrity validation | Query function testing + slug audit | 1–2 hours |
| **Total** | | **12–20 hours** |

---

### Success Criteria

- [ ] `unified-data.ts` exports 12 technologies, 12 industries, 12 systems, 6+ standards, 6+ contamination modes
- [ ] Every technology in `unified-data.ts` has all `CatalogueItem` fields present (backwards compat)
- [ ] Every technology in `unified-data.ts` has all `knowledge-architecture.ts` relational fields present
- [ ] Every technology in `unified-data.ts` has `geoDefinition` and `systemDomain` populated
- [ ] `getTechnologyByIndustry()` returns arrays with zero `undefined` entries for all 12 industries
- [ ] `mapKnowledgeNetwork()` returns complete graphs with zero `undefined` nodes for all 12 technologies
- [ ] All existing routes still generate: `npx next build` produces 89+ pages with zero errors
- [ ] `catalogue.json` is no longer imported by any file in `src/`
- [ ] `GEO_DEFINITIONS` and `TECH_COMPARISON` no longer exist as inline constants in `technologies/page.tsx`
- [ ] `knowledge-architecture.ts` is a thin re-export file (< 30 lines)

---

*Plan generated: 2026-06-02*  
*Repository: latamfilters/world-catalogue*  
*Branch: claude/dazzling-franklin-ALGY1*
