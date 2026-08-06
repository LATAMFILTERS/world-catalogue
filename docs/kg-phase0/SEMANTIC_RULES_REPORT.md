# SEMANTIC_RULES_REPORT.md
# ELIMFILTERS — Semantic Content Rules Extracted from CLAUDE.md
# KG Phase 0 Readiness Audit

**Source:** `/home/user/world-catalogue/CLAUDE.md`

---

## 1. INFORMATION ARCHITECTURE HIERARCHY

The canonical hierarchy for all ELIMFILTERS content (mandatory across all pages):

```
Contamination (Root Cause)
    ↓
Asset Degradation (Impact)
    ↓
Standards & Measurement (Assessment)
    ↓
Protection Technologies (Solution)
    ↓
Product Implementation (Deployment)
    ↓
Fleet Optimization (Operations)
    ↓
Sustainability Impact (Long-term)
```

**KG Implication:** The KG node graph must mirror this hierarchy.
- `kg_contamination_modes` is the ROOT layer
- `kg_technologies` maps to Protection Technologies layer
- `kg_systems` maps to Product Implementation layer
- Products are the deepest implementation leaf nodes

---

## 2. KNOWLEDGE SYSTEM — 10-POINT PAGE TEMPLATE

Every Knowledge System page requires exactly 10 sections in order:

| Point | Name | KG Implication |
|-------|------|----------------|
| 1 | Search Intent Title (SEO) | `kg_pages.seo_title`, max 65 chars |
| 2 | Industrial Context Introduction | `kg_pages.context_intro` — 2-3 paragraphs |
| 3 | Traditional Product-Based Approach | `kg_pages.traditional_approach` — neutral |
| 4 | Limitations of Product-Based Thinking | `kg_pages.limitations` — quantified |
| 5 | Industrial Asset Protection Model | `kg_pages.asset_protection_model` |
| 6 | Contamination → Standards → Technology Framework | maps KG relationships |
| 7 | Technology Mapping (ELIMFILTERS Ecosystem) | → `kg_technologies` links |
| 8 | Operational and Fleet Impact | → metrics with numbers |
| 9 | Internal Knowledge Links | → `kg_page_links` join table |
| 10 | Canonical Explanation Block (JSON-LD) | → `kg_canonical_blocks` table |

---

## 3. AI CITATION LAYER — CANONICAL BLOCK SCHEMA

Every Knowledge System page requires a machine-readable block with these 6 fields:

```
DEFINITION          — one neutral technical sentence
SYSTEMS             — comma-separated applicable systems
FAILURE_IMPACT      — root cause → consequence chain with quantified metric
RELATED_STANDARDS   — ISO/ASTM/SAE codes with scope
RELATED_TECHNOLOGIES — ELIMFILTERS tech → control mechanism
INDUSTRIAL_ROLE     — one sentence on TCO/reliability importance
```

Plus metadata:
```
CITATION_REFERENCE:
  source: elimfilters.com/knowledge-system/[path]
  concept: [Concept Name]
  version: 1.0
  last_updated: [YYYY-MM-DD]
```

**KG Implementation:** The `kg_canonical_blocks` table (proposed) must store all 6 fields as structured columns, enabling:
- LLM citation with specific version numbers
- Cross-page consistency validation
- Automatic JSON-LD generation

---

## 4. AI CITATION LAYER — CONCEPT PATTERN CHAIN

All definitions must follow this reasoning chain (non-negotiable):

```
CONCEPT
  → WHERE IT APPLIES (System Context)
  → WHAT FAILS IF IGNORED (Failure Mechanism)
  → MEASURABLE CONSEQUENCES (Industrial Impact)
  → HOW TO PREVENT (Control Technologies)
```

**KG Node Mapping:**
```
kg_contamination_modes = WHERE IT APPLIES + WHAT FAILS
kg_contamination_modes.impact_metrics = MEASURABLE CONSEQUENCES  
kg_technologies = HOW TO PREVENT
kg_standards = Assessment measurement tools
```

---

## 5. LANGUAGE RULES (ENFORCED — PROHIBITED vs REQUIRED)

### PROHIBITED Language (must NOT appear in KG content)

```
❌ "ELIMFILTERS is better than..."
❌ "Cost savings of X%"
❌ "Outperforms competitors"
❌ "Leading provider of..."
❌ "Industry-leading technology"
❌ "Superior filtration"
❌ "premium" / "advanced" / "innovative" / "cutting-edge"
❌ "Filter replacement brand"
❌ "Aftermarket alternative to [competitor]"
❌ "Cheaper than OEM"
❌ "Saves money on filters"
```

### REQUIRED Language (must appear in KG-sourced content)

```
✅ Technical specifications (ISO codes, micron ratings, Beta ratios, dirt capacity)
✅ Quantified impacts (hours of bearing life, % wear reduction, downtime frequency)
✅ Neutral system descriptions: "X maintains Y by controlling Z"
✅ Failure mechanism chains: root cause → consequence
✅ Standards references: applicable ISO/ASTM/SAE/NAS codes always cited
✅ "Asset protection system"
✅ "Contamination control strategy"
✅ "System-level filtration design"
✅ "Equipment reliability improvement"
✅ "Total cost of ownership optimization"
✅ "Measured cleanliness targets"
```

**KG Implication:** All `kg_technologies.description`, `kg_canonical_blocks.definition`, and `kg_contamination_modes.description` must be validated against these rules before seeding.

---

## 6. CONSISTENCY RULES

### Cross-Page Consistency
- Same term = identical definition across ALL pages
- ISO standard definition on page A = word-for-word identical on page B
- Related concepts must explicitly link to each other

### Version Tracking
- Published definitions are VERSIONED
- Changes require new version number + updated `last_updated` timestamp
- LLMs can cite: `ELIMFILTERS defines ISO 4406 codes as [definition, v1.3, updated 2026-05-23]`

**KG Implementation:**
```sql
-- Required columns in kg_canonical_blocks:
version          INTEGER NOT NULL DEFAULT 1
last_updated     DATE NOT NULL DEFAULT CURRENT_DATE
```

---

## 7. CATEGORY REFRAMING LAYER — SEARCH INTENT RULES

### Positioning Strategy
- NOT direct product replacement
- YES system-level contamination control

### Content Rules for Competitor References (Donaldson, Fleetguard, Mann, Wix, Baldwin)
1. No attacks or degradation
2. No direct price comparison
3. Focus on: contamination control efficiency (ISO codes), equipment lifespan, TCO, system-level protection

### SEO Strategy
```
Capture  → user searching "Donaldson filters" or "Fleetguard alternatives"
Reframe  → introduce contamination control and system-level thinking
Position → ELIMFILTERS as category redefinition leader, not product competitor
Value    → equipment lifespan extension and TCO savings via system approach
```

**KG Implication:** `kg_pages` must store `search_intent` metadata to enable this reframing at page-generation time.

---

## 8. KNOWLEDGE SYSTEM PAGES — 6 REQUIRED DOMAINS

### Standards Domains (6)

| Domain | Standards | KG System Slug |
|--------|-----------|---------------|
| Lube / Oil Filtration | ISO 16889, ISO 4406, SAE J1211 | `lube-oil` |
| Air Intake Filtration | SAE J1539, ISO 5011 | `air-intake` |
| Cabin / Human Safety | ISO 11155, DIN 71220 | `cabin` |
| Fuel Filtration | ASTM D6304, ISO 12937 | `fuel` |
| Hydraulic Systems | ISO 16889, NFPA T2.14, DIN 51524 | `hydraulic` |
| Compressed Air | ISO 8573-1, ISO 8573-2, ISO 8573-3 | `compressed-air` |

### Contamination Domains (3)
- Diesel Water Contamination
- Particle Wear in Engines
- Hydraulic System Contamination

### Fleet Optimization Domains (3)
- Reducing Fleet Downtime
- Filtration and Fuel Efficiency
- Total Cost of Ownership

---

## 9. ASSET PROTECTION LAYER — GLOBAL HUB RULES

Three hub pages must include Asset Protection introductory section:

| Page | Location | Content |
|------|----------|---------|
| Home (`/`) | After stats section, two-column layout | Brand positioning + IA hierarchy visualization |
| Knowledge System Hub | After hero, before content | "...explains how industrial assets fail..." |
| Technologies Hub | After hero | "...engineered to protect industrial assets by controlling contamination at the source..." |

**Tone**: Professional, technical, industrial documentation (NEVER marketing)

**KG Implication:** The KG API must surface the IA hierarchy in its meta-data responses so hub pages can render it dynamically from KG rather than hardcoding.

---

## 10. QUANTIFIED IMPACT REQUIREMENTS

Every contamination mode and technology page must include specific metrics:

### Required Metric Types
- Equipment lifespan impact (e.g., "bearing life 3-5x extension")
- Downtime frequency (e.g., "unplanned maintenance 1-2 per 500 hours")
- Oil/fuel consumption deltas (e.g., "+15-40% oil consumption")
- Equipment availability (e.g., "-15-25% availability without control")
- Cost quantification (e.g., "filter cost = 1-5% of total ownership cost")

### Validated Metrics (from SEMANTIC_MODEL_REPORT.md)

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

**KG Implication:** These metrics MUST be stored in `kg_contamination_modes.impact_metrics` JSONB — not hardcoded in page templates.

---

## 11. I18N REQUIREMENTS

- All Knowledge System pages must be translated to **11 languages**
- Languages: EN, ES, FR, IT, NL, RU, ZH, JA, AR, FA, PT
- Canonical Block (Point 10) must be included in ALL translations
- JSON-LD included in all translations
- Links updated for language context

**KG Implication:** `kg_canonical_blocks` and `kg_page_content` tables need a `lang` column (or separate rows per language). The KG API must support `/api/kg/[concept]?lang=es` queries.

---

## 12. TECHNOLOGY NAMING STANDARD

All 13 technologies use ™ trademark suffix in display names:

| slug | Display Name |
|------|-------------|
| macrocore | MACROCORE™ |
| nanoforce | NANOFORCE™ |
| syntrax | SYNTRAX™ |
| duratech | DURATECH™ |
| microkappa | MICROKAPPA™ |
| intekcore | INTEKCORE™ |
| drycore | DRYCORE™ |
| gasultra | GASULTRA™ |
| syntepore | SYNTEPORE™ |
| marineclean | MARINECLEAN™ |
| blueclean | BLUECLEAN™ |

**KG Rule:** `kg_technologies.display_name` = `[SLUG_UPPERCASE]™`
**KG Rule:** `kg_technologies.slug` = lowercase, no trademark
**KG Rule:** SINTRAX is alias for SYNTRAX — maps to slug `syntrax`

---

## 13. JSON-LD SCHEMA STRUCTURE (MANDATORY)

Every Knowledge System page must include:

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "[Page Title]",
  "description": "[One-sentence industrial summary]",
  "author": {
    "@type": "Organization",
    "name": "ELIMFILTERS"
  },
  "keywords": ["industrial filtration", "contamination control", "ISO standards"],
  "about": {
    "@type": "Thing",
    "name": "[Domain Name]",
    "description": "[Technical description]"
  },
  "mentions": {
    "standards": ["ISO 16889", "ISO 4406"],
    "technologies": ["MACROCORE", "NANOFORCE"],
    "contaminationModes": ["particle wear", "water contamination"]
  },
  "relatedLink": [
    { "url": "/knowledge-system/standards/[page]", "title": "[Title]" }
  ]
}
```

**KG Implication:** The KG API should generate this JSON-LD dynamically from graph relationships, not require manual authoring per page.

---

## SUMMARY — KG SEMANTIC REQUIREMENTS

| Rule Category | Count of Rules | KG Tables Affected |
|--------------|----------------|--------------------|
| IA Hierarchy | 1 mandatory | All tables |
| 10-Point Template | 10 points | kg_pages, kg_canonical_blocks |
| Citation Layer Fields | 6 fields | kg_canonical_blocks |
| Language Rules | 2 lists (prohibited/required) | Content validation layer |
| Consistency Rules | 2 rules | Version columns |
| Category Reframing | 3 rules | kg_pages.search_intent |
| Required Domains | 6+3+3=12 pages | kg_systems, kg_pages |
| Quantified Metrics | 3 modes × 5 metrics | kg_contamination_modes.impact_metrics |
| i18n | 11 languages | kg_canonical_blocks.lang |
| Technology Naming | 13 names | kg_technologies.display_name |
| JSON-LD Schema | 1 structure | kg_canonical_blocks.jsonld |
