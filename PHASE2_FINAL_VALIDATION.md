# PHASE 2 FINAL VALIDATION
# ELIMFILTERS World Catalogue — Single Source of Truth Migration

**Date:** 2026-06-03
**Branch:** claude/dazzling-franklin-ALGY1
**Audit scope:** All `.tsx` / `.ts` source files under `frontend/src/`
**Validator:** Phase 2 Task 6

---

## 1. Single Source of Truth Completion

### Completion by Data Category

| Category | Total Records | In unified-data.ts | Consumed from UD | % Complete |
|----------|--------------|--------------------|------------------|-----------|
| Technology keys & slugs | 13 | 13 (9 active + 2 deprecated + 2 ecosystem) | catalogue.ts, technologies/page.tsx, knowledge-architecture.ts | **100%** |
| Technology logos | 13 | 13 (logoFile field) | catalogue.ts `_techLogoBySlug` | **100%** |
| Technology geo-definitions | 12 | 12 (geoDefinition field) | technologies/page.tsx `_geoDefBySlug` | **100%** |
| Technology comparison data | 9 | 9 (comparisonFunction/Metric/Industries) | technologies/page.tsx `_techComparison` | **100%** |
| Technology relationship maps | 13 | 13 (relatedStandards, addressesContamination, applicableIndustries) | knowledge-architecture.ts | **100%** |
| Industry keys & structure | 12 | 12 | knowledge-architecture.ts | **100%** |
| Standard keys & codes | 11 of 23 | 11 | knowledge-architecture.ts | **48%** |
| Contamination modes | 6 | 6 | knowledge-architecture.ts | **100%** |
| Product system definitions | 12 | 12 (SYSTEMS record) | catalogue.ts | **100%** |
| Technology deep-page content | 12 | 0 | — (techPagesData.ts, catalogue.json) | **0%** |
| Protection-domain editorial | 5 | 0 | — (systems/page.tsx SYSTEMS) | **0%** |
| Knowledge-system STANDARDS desc | ~21 | 0 | — (all page-specific editorial) | **0%** |
| Knowledge-system TECHNOLOGIES role | ~30 | 0 | — (all domain-specific editorial) | **0%** |

### Overall Structural / Reference Data Completion

**~85%** of structural reference data (keys, slugs, names, codes, relationship graphs) is now authoritative in unified-data.ts and consumed from it.

**0%** of editorial/display content (stages, specs, role descriptions, FAQ text, system prose) is in unified-data.ts — correctly so: unified-data.ts is a structural reference, not a CMS.

### Phase 2 Migration Completion

Tasks 2–4 migrated all cleanly separable structural data. Task 5 confirmed no further structural data can be migrated without first extending unified-data.ts interfaces (see §6).

---

## 2. Remaining Duplicated Datasets

The following data blocks exist outside unified-data.ts. Each is classified and documented below.

### 2A. `frontend/src/app/technologies/[slug]/techPagesData.ts` — 921 lines

**12 entries** (one per technology slug). Fields per entry:

| Field | Description | In unified-data.ts? |
|-------|-------------|---------------------|
| `categoryTag` | Hero comment tag string | ❌ |
| `heroTitle` | Display name | ❌ (name ≈ equivalent but format differs) |
| `heroSubtitle` | Optional subtitle | ❌ |
| `heroTagline` | Hero marketing tagline | ❌ (tagline ≈ but longer form) |
| `heroImage` | Image path | ❌ |
| `heroStats` | 3-item key/value spec summary | ❌ |
| `logoSrc` | Image path (avif, not png) | ❌ (logoFile in UD is png filename only) |
| `systemHeadline` | Section headline | ❌ |
| `systemParagraphs` | 2-3 editorial paragraphs | ❌ |
| `productImageSrc` | Image path | ❌ |
| `productImageCaption` | Caption string | ❌ |
| `stagesHeading` | Optional section header | ❌ |
| `stages` | Array of `{number, tag, title, body, stat, statLabel}` | ❌ |
| `specs` | Array of `{label, value, sub}` | ❌ |
| `labResults` | Optional test results | ❌ |
| `testimonial` | `{quote, role, sector}` | ❌ |
| `applicationsHeading` | Section header | ❌ |
| `applicationsSubtext` | Optional subtext | ❌ |
| `applications` | Array of `{sector, detail}` — 5-6 sectors per tech | ❌ |
| `ctaTag` | CTA section tag | ❌ |
| `ctaHeading` | CTA heading | ❌ |
| `ctaBody` | CTA body text | ❌ |

**Classification: Should remain page-specific editorial content.**
This is deep product marketing content requiring a content-management model, not a structural reference schema. The `geoDefinition` in unified-data.ts covers the canonical 1-paragraph definition; `techPagesData.ts` covers the full detail page narrative (3–5 stages, testimonials, 5–6 application sectors).

---

### 2B. `frontend/catalogue.json` — 1002 lines

**36 entries** (12 industries + 12 products + 12 technologies). Fields per technology entry:

| Field | Description | In unified-data.ts? |
|-------|-------------|---------------------|
| `name` | Display name | ✅ (UD `name`) |
| `file` | HTML file path | ❌ |
| `title` | Page H1 title | ❌ |
| `subtitle` | Page subtitle | ❌ |
| `description` | Display description | ❌ (different from `geoDefinition`) |
| `features` | Feature bullet list | ❌ |
| `stats.percentages` | Stat percentages | ❌ |
| `stats.ratings` | Spec rating strings | ❌ |
| `cta` | CTA button label | ❌ |
| `benefits` | Benefits list (industries/products) | ❌ |
| `techTags` | Technology badge strings | ❌ |
| `statistic` | Stat number | ❌ |
| `statisticSource` | Stat attribution | ❌ |

**Classification: Requires new data model.**
catalogue.json serves as the page-generation source for all `/technologies/[slug]`, `/products/[slug]`, and `/industries/[slug]` routes. It contains display-oriented fields (title, subtitle, features, stats, CTA) that have no structural equivalent in unified-data.ts. Migrating would require adding a `displayMetadata` sub-object to each unified-data.ts entity type.

**Note:** catalogue.json is consumed by `catalogue.ts` which was updated in Task 2. The `name`/`slug` fields are the only structural fields already in UD; display fields remain in catalogue.json by design.

---

### 2C. `frontend/src/app/systems/page.tsx` — SYSTEMS array (5 entries)

The 5 "protection domain" editorial blocks (Air Intake, Fuel Cleanliness, Lubrication, Hydraulic, Cooling & Environmental) are distinct from the 12 product systems in unified-data.ts SYSTEMS. These are marketing groupings, not product system records.

| Field | Description | In unified-data.ts? |
|-------|-------------|---------------------|
| `id` | Domain slug | ❌ (UD `domain` values are different) |
| `name` | Display name | ❌ |
| `headline` | Section headline | ❌ |
| `description` | Multi-sentence prose | ❌ |
| `contaminants[]` | Contaminant display strings | ❌ |
| `families[]` | ProductFamily objects (label, description, slug, tech) | ❌ |
| `technologies[]` | Display strings (e.g., `'MACROCORE™'`) | ❌ (UD uses TechnologyKey, not display strings) |
| `equipment[]` | Representative equipment list | ❌ |
| `industries[]` | Display strings (e.g., `'Agriculture'`) | ❌ (UD uses IndustryKey) |

**Classification: Requires new data model.**
These are editorial marketing summaries of protection domains — a concept above the individual product system level. No unified-data.ts analog exists. A `UnifiedProtectionDomain` interface would be needed to move this data.

---

### 2D. `frontend/src/app/systems/page.tsx` — TECH_MAP (9 entries)

| Field | Description | In unified-data.ts? |
|-------|-------------|---------------------|
| `name` | Technology display name | ✅ (UD `name`) |
| `system` | System number string ('01'–'05') | ❌ |
| `role` | Domain mapping (e.g., 'Air Intake') | ✅ (UD `domain`) |
| `brief` | 1-sentence contextual description | ❌ |

**Classification: Requires new data model.**
`name` and `role/domain` are in UD; `system` (protection-domain assignment) and `brief` (per-context editorial) are not. Cannot be fully derived.

---

### 2E. Knowledge System Standards Pages — STANDARDS arrays

6 pages × 3–4 entries each. All entries have a `desc` field with page-specific editorial text distinct from UD `description`. Additional structural gap: 12 standard codes referenced in these pages do not exist in unified-data.ts at all (see §3).

**Classification: Should remain page-specific editorial content** (per-domain `desc`). The standard code registry gap should be resolved in unified-data.ts (see §3).

---

### 2F. Knowledge System Standards Pages — TECHNOLOGIES arrays

6 pages × 1–4 entries each. Every entry includes a `role` field containing domain-specific contextual text (e.g., "Electrostatic synthetic media achieving 99.9% efficiency for proportional valve protection"). Same technology appears with different `role` text across different domain pages — this is intentional.

**Classification: Should remain page-specific editorial content.**
The `name` and `slug` fields are already in UD; `role` is editorial.

---

### 2G. Knowledge System Fleet Pages — TECHNOLOGIES and STANDARDS arrays

3 fleet pages (reducing-downtime, fuel-efficiency, total-cost-ownership). Same pattern as standards pages: `role` text is fleet-context-specific editorial; `desc` text is page-specific editorial. Multiple standards codes (ASTM D7085, ASTM D975, ASTM D6595, SAE J1211) not in UD.

**Classification: Should remain page-specific editorial content** (role/desc). Standard code gaps apply (see §3).

---

### 2H. Knowledge System Contamination Pages — section content

3 pages (diesel-water, particle-wear, hydraulic-system). Each page defines `sections[]` as `{title, content}` objects with 5–6 detailed technical paragraphs per page. Two special token patterns found:
- `content: '__LINKED_DIESEL_IMPACT__'`
- `content: '__LINKED_DIESEL_STANDARDS__'`
- `content: '__LINKED_OPERATIONAL_IMPACT__'`
- `content: '__LINKED_HYDRAULIC_IMPACT__'`

These tokens indicate partially planned integration with UD contamination data — rendering code is expected to substitute them with live data at build time, but this substitution mechanism is not yet implemented.

The unplaceholdered section content substantially extends unified-data.ts contamination entries (which define: `description`, `rootCauses[]`, `failureModes[]`, `impacts{}`, `resolvedBy[]`, `relatedStandards[]`). The page content provides full narrative treatment of each mechanism.

**Classification: Requires new data model.** The placeholder tokens signal Phase 3 intent. The UD contamination interface needs `sectionContent[]` or equivalent to support this integration.

---

### 2I. ISO Dedicated Pages (iso-16889, iso-4406, iso-5011)

3 dedicated standard pages with inline `sections[]` (technical content, in Spanish) and `faqs[]`. Content is deep editorial explanation of each standard's mechanics — far beyond the single `description` field in UD.

**Classification: Should remain page-specific editorial content.**
UD `description` is a 1–2 sentence technical definition. These pages are full educational articles.

---

## 3. Missing Standards Inventory

12 standard codes appear in knowledge-system pages but have **no entry in unified-data.ts**:

| Code | Referenced In | Scope |
|------|--------------|-------|
| `ANSI B132.1` | air-intake-systems | Industrial air filter test methods — dust holding capacity and pressure drop |
| `SAE J1211` | lube-oil-systems, fleet/total-cost-ownership | Engine oil filter performance — bypass valve pressure, element collapse |
| `ASTM D7085` | lube-oil-systems, fleet/reducing-downtime | Particle counting for in-service oil analysis |
| `ASTM D975` | fuel-systems, fleet/fuel-efficiency | Diesel fuel specification — water, sediment, contamination limits |
| `ISO 11155-1` | cabin-safety-systems | Cabin air particle filtration efficiency (85% PM10 minimum) |
| `ISO 11155-2` | cabin-safety-systems | Cabin air gaseous contaminant filtration (NO₂, SO₂, ozone) |
| `DIN 71220` | cabin-safety-systems | German off-highway cabin air filtration standard |
| `ISO 16890` | cabin-safety-systems | General air filtration — PM1, PM2.5, PM10 efficiency classes |
| `ISO 8573-2` | compressed-air-systems | Measurement of water vapor / dew point in compressed air |
| `ISO 8573-3` | compressed-air-systems | Measurement of oil content in compressed air |
| `ISO 8573-4` | compressed-air-systems | Particle measurement methods for compressed air |
| `ASTM D6595` | fleet/total-cost-ownership | Wear metals analysis — rotating disc electrode spectrometry |

**Current unified-data.ts has 11 StandardKeys.** Adding these 12 codes would bring it to **23 StandardKeys**.

**Note:** `ISO 11155` exists in UD as a single code. The pages use `ISO 11155-1` and `ISO 11155-2` as sub-standards. These are distinct specifications and should be registered as separate StandardKey entries.

---

## 4. Missing Technology Metadata Inventory

Fields in `techPagesData.ts` that have **no equivalent field** in `UnifiedTechnology` / `DeprecatedTechnology`:

| Field | Type | Example | Rationale for UD Extension |
|-------|------|---------|---------------------------|
| `heroTagline` | `string` | "Three-stage graduated asset protection..." | Longer marketing tagline (UD `tagline` is shorter) |
| `heroImage` | `string` | `/images/turbine-plant.avif` | Primary hero image path |
| `heroStats` | `{key: string, value: string}[]` | `[{key:'900FH', value:'90 GPH'}]` | 3-item spec summary for hero display |
| `logoSrc` | `string` | `/images/aquaguardseries(fn).avif` | Full logo image path (UD `logoFile` is filename only, PNG) |
| `systemHeadline` | `string` | `'THREE-STAGE DEFENSE.\nFULL CONTAMINATION SPECTRUM.'` | System section headline |
| `systemParagraphs` | `string[]` | 2–3 editorial paragraphs | Architecture description for detail page |
| `stages` | `TechStage[]` | `{number, tag, title, body, stat, statLabel}` | Product mechanism stages (1–3 per tech) |
| `specs` | `TechSpec[]` | `{label, value, sub}` | 5–6 product specification rows |
| `applications` | `TechApplication[]` | `{sector, detail}` | 5–6 industry application descriptions |
| `testimonial` | `TechTestimonial` | `{quote, role, sector}` | Customer testimonial |
| `ctaTag` / `ctaHeading` / `ctaBody` | `string` | — | CTA section content |

**Assessment:** These fields represent full product-page editorial content. They are appropriate for a `UnifiedTechnology.pageContent` sub-object rather than top-level interface fields, as they are display-only and not used in relational queries.

---

## 5. Missing Systems Metadata Inventory

Fields in `systems/page.tsx` SYSTEMS and TECH_MAP arrays with no equivalent in `UnifiedSystem`:

### 5A. Protection Domain fields (SYSTEMS array — 5 editorial domains)

| Field | Type | In `UnifiedSystem`? |
|-------|------|---------------------|
| `number` | `string` ('01'–'05') | ❌ |
| `headline` | `string` | ❌ |
| `description` | `string` (multi-sentence) | ❌ |
| `contaminants` | `string[]` | ❌ |
| `families` | `ProductFamily[]` | ❌ |
| `technologies` | `string[]` (display format) | ❌ (UD has `primaryTechnology`/`supportingTechnologies` but as keys) |
| `equipment` | `string[]` | ❌ |
| `industries` | `string[]` (display format) | ❌ |

### 5B. Tech-to-domain mapping fields (TECH_MAP)

| Field | Type | In UD? |
|-------|------|--------|
| `system` | `string` ('01'–'05') | ❌ |
| `brief` | `string` (1 sentence) | ❌ |
| `name` | `string` | ✅ (`UnifiedTechnology.name`) |
| `role` | `string` | ✅ (`UnifiedTechnology.domain`) |

**Assessment:** The protection-domain concept (5 editorial groupings above the 12 product systems) is absent from unified-data.ts entirely. A `UnifiedProtectionDomain` interface would be needed.

---

## 6. Recommended unified-data.ts Schema Extensions

### Priority 1 — High Impact, Low Complexity

#### 1a. Add missing StandardKeys (12 additions)

```typescript
export type StandardKey =
  | 'ISO_16889' | 'ISO_4406' | 'ISO_5011' | 'SAE_J1539'
  | 'ASTM_D6304' | 'ISO_12937' | 'ISO_8573_1' | 'NFPA_T214'
  | 'DIN_51524' | 'ISO_11155' | 'ISO_14540'
  // NEW — Phase 3 additions:
  | 'ANSI_B132_1'   // Industrial air filter testing
  | 'SAE_J1211'     // Engine oil filter bypass/collapse limits
  | 'ASTM_D7085'    // In-service oil particle counting
  | 'ASTM_D975'     // Diesel fuel specification
  | 'ISO_11155_1'   // Cabin air particle filtration (sub-part)
  | 'ISO_11155_2'   // Cabin air gaseous filtration (sub-part)
  | 'DIN_71220'     // Off-highway cabin air filtration
  | 'ISO_16890'     // General air filtration PM classes
  | 'ISO_8573_2'    // Compressed air water vapor measurement
  | 'ISO_8573_3'    // Compressed air oil content measurement
  | 'ISO_8573_4'    // Compressed air particle measurement
  | 'ASTM_D6595';   // Wear metals spectrometry
```

Impact: Enables knowledge-architecture.ts standards map to include all 23 codes. Enables standards pages to derive standard codes from UD. Low risk — additive only.

#### 1b. Split `ISO_11155` into `ISO_11155_1` and `ISO_11155_2`

The current `ISO_11155` entry covers the full standard. The cabin-safety-systems page distinguishes ISO 11155-1 (particle) from ISO 11155-2 (gaseous). These are separately applicable and should be independently queryable.

---

### Priority 2 — Medium Impact, Medium Complexity

#### 2a. Extend `UnifiedTechnology` with `pageContent` sub-object

```typescript
export interface TechPageContent {
  readonly heroTagline: string;
  readonly heroImage: string;
  readonly heroStats: ReadonlyArray<{ readonly key: string; readonly value: string }>;
  readonly logoSrc: string;         // full path, e.g. /images/macrocore.avif
  readonly systemHeadline: string;
  readonly systemParagraphs: ReadonlyArray<string>;
  readonly stages: ReadonlyArray<{
    readonly number: string;
    readonly tag: string;
    readonly title: string;
    readonly body: string;
    readonly stat: string;
    readonly statLabel: string;
  }>;
  readonly specs: ReadonlyArray<{
    readonly label: string;
    readonly value: string;
    readonly sub?: string;
  }>;
  readonly applications: ReadonlyArray<{
    readonly sector: string;
    readonly detail: string;
  }>;
  readonly testimonial?: {
    readonly quote: string;
    readonly role: string;
    readonly sector: string;
  };
  readonly ctaTag: string;
  readonly ctaHeading: string;
  readonly ctaBody: string;
}

// Add to UnifiedTechnology:
readonly pageContent?: TechPageContent;
```

Impact: Enables `techPagesData.ts` to be replaced entirely. All 12 technology detail pages would consume from UD. File elimination: 921 lines.

#### 2b. Add `displayMetadata` sub-object to `UnifiedTechnology` and `UnifiedSystem`

Covers `catalogue.json` technology fields:
```typescript
export interface TechDisplayMetadata {
  readonly title: string;          // page H1
  readonly subtitle: string;       // page subtitle
  readonly catalogueDescription: string; // catalogue card text
  readonly features: ReadonlyArray<string>;
  readonly stats: {
    readonly percentages: ReadonlyArray<string>;
    readonly ratings: ReadonlyArray<string>;
  };
  readonly cta: string;
}
```

Impact: Enables catalogue.json technology section to be replaced. Requires equivalent structures for industry and product entries.

---

### Priority 3 — High Complexity, Future Phase

#### 3a. Add `UnifiedProtectionDomain` entity type

```typescript
export type ProtectionDomainKey =
  | 'AIR_INTAKE'
  | 'FUEL_CLEANLINESS'
  | 'LUBRICATION'
  | 'HYDRAULIC'
  | 'COOLING_ENVIRONMENTAL';

export interface UnifiedProtectionDomain {
  readonly key: ProtectionDomainKey;
  readonly number: string;          // '01'–'05' display order
  readonly name: string;
  readonly headline: string;
  readonly description: string;
  readonly contaminants: ReadonlyArray<string>;
  readonly families: ReadonlyArray<{
    readonly label: string;
    readonly description: string;
    readonly slug: string;
    readonly tech: TechnologyKey;
  }>;
  readonly primaryTechnologies: ReadonlyArray<TechnologyKey>;
  readonly representativeEquipment: ReadonlyArray<string>;
  readonly industries: ReadonlyArray<IndustryKey>;
}
```

Impact: Enables `systems/page.tsx` SYSTEMS and TECH_MAP to be derived from UD. File reduction: ~240 lines from systems/page.tsx.

#### 3b. Extend `UnifiedContaminationMode` with `sectionContent`

Resolves the placeholder tokens (`__LINKED_DIESEL_IMPACT__` etc.) found in contamination pages:

```typescript
export interface ContaminationSectionContent {
  readonly operationalImpact: string;    // replaces __LINKED_*_IMPACT__
  readonly relatedStandardsText: string; // replaces __LINKED_*_STANDARDS__
}

// Add to UnifiedContaminationMode:
readonly sectionContent?: ContaminationSectionContent;
```

---

## 7. Readiness Assessment for Phase 3

### Phase 2 Completion Status

| Deliverable | Status |
|-------------|--------|
| unified-data.ts created as Single Source of Truth | ✅ COMPLETE |
| catalogue.ts consuming from UD | ✅ COMPLETE |
| knowledge-architecture.ts consuming from UD | ✅ COMPLETE |
| technologies/page.tsx consuming from UD | ✅ COMPLETE |
| Full audit of remaining data | ✅ COMPLETE (Tasks 5–6) |

### Phase 3 Readiness: Ready with Scope Definition Required

**What Phase 3 must decide before starting:**

1. **Scope boundary for unified-data.ts**: Is UD a structural reference only (keys, slugs, relationships, codes) or also an editorial content store (stages, specs, application descriptions, testimonials)? Phase 2 treated it as structural. Phase 3 would need to extend it to editorial for full migration.

2. **catalogue.json fate**: The file currently serves as the data source for 36 page routes. It could be:
   - (a) Fully migrated into unified-data.ts `displayMetadata` sub-objects
   - (b) Kept as a maintained artifact and partially augmented from UD
   - (c) Generated automatically from UD at build time

3. **techPagesData.ts scope**: 921 lines of deep product editorial. Can be eliminated if UD gains `pageContent` sub-objects. Alternatively, remains as a dedicated editorial file consuming structural data from UD for names/slugs.

### Quantified Migration Opportunities for Phase 3

| File | Lines | Lines Eliminable (if UD extended) | Dependency |
|------|-------|------------------------------------|-----------|
| `techPagesData.ts` | 921 | ~800 (if pageContent in UD) | Priority 2a |
| `catalogue.json` | 1002 | ~400 tech section (if displayMetadata in UD) | Priority 2b |
| `systems/page.tsx` SYSTEMS+TECH_MAP | ~260 | ~240 (if ProtectionDomain in UD) | Priority 3a |
| KS standards STANDARDS arrays | ~80 | ~40 (once 12 missing codes added to UD) | Priority 1a |
| KS standards TECHNOLOGIES arrays | ~60 | 0 (role text is always editorial) | N/A |
| KS contamination sections | ~180 | ~60 (once sectionContent in UD) | Priority 3b |
| **Total** | **~2,500** | **~1,540** | — |

### Build State at Phase 2 Close

| Validation | Result |
|-----------|--------|
| `npm run type-check` | PASS — zero errors |
| `npm run build` | PASS — 89/89 pages |
| Branch | `claude/dazzling-franklin-ALGY1` |
| Last commit | `10857fd1` |
| Phase 2 commits | 5 (e40a75c6, 45617aea, 28cc4cb9, cf93b5a6, 10857fd1) |

### Phase 3 Recommended Sequencing

1. **P3-T1:** Add 12 missing StandardKeys to unified-data.ts (low risk, additive)
2. **P3-T2:** Add `TechPageContent` sub-object interface + data for all 12 technologies; replace techPagesData.ts
3. **P3-T3:** Add `TechDisplayMetadata` to UnifiedTechnology; migrate catalogue.json technology section
4. **P3-T4:** Add `UnifiedProtectionDomain` + data; replace systems/page.tsx SYSTEMS and TECH_MAP
5. **P3-T5:** Add `ContaminationSectionContent` + data; resolve placeholder tokens in contamination pages
6. **P3-T6:** Final validation — confirm zero files contain structural data duplicated in UD

---

*Audit performed without modifying any source files.*
*All classification decisions are recommendations only — implementation requires owner authorization.*
