# Execution Blueprint — Phase 1: Mapping Report

**Status**: COMPLETE — READ-ONLY ANALYSIS
**Date**: 2026-05-23
**Pages Scanned**: 30 Knowledge System pages
**Total Lines**: ~10,300 lines of code

---

## Knowledge System Inventory

### Category 1: Hub/Navigation Pages (7 pages)
| # | Page | Lines | Current Function |
|---|------|-------|------------------|
| 1 | `/knowledge-system` | 226 | Main hub, navigation |
| 2 | `/knowledge-system/bridges` | 222 | Bridge pages hub |
| 3 | `/knowledge-system/standards` | 212 | Standards pages hub |
| 4 | `/knowledge-system/contamination` | 191 | Contamination hub |
| 5 | `/knowledge-system/fleet` | 186 | Fleet strategies hub |
| 6 | `/knowledge-system/compare` | 222 | Comparison framework hub |
| 7 | `/knowledge-system/science` | 24 | Technology overview |

### Category 2: Bridge Pages (4 pages)
| # | Page | Lines | Current State |
|---|------|-------|---------------|
| 8 | `industrial-filtration` | 1284 | ✅ Semantic links (8) + AI Citation Layer + SEMANTIC_DOMAINS |
| 9 | `oem-replacement` | 735 | ✅ Semantic links (7) + AI Citation Layer + SEMANTIC_DOMAINS |
| 10 | `aftermarket-selection` | 541 | ✅ Semantic links (2) + AI Citation Layer + SEMANTIC_DOMAINS |
| 11 | `fleet-solutions` | 512 | ✅ Semantic links (2) + AI Citation Layer + SEMANTIC_DOMAINS |

**Bridge Status**: COMPLETE — Ready as reference model

### Category 3: Standards Domain Pages (6 pages)
| # | Page | Lines | Domain Assignment |
|---|------|-------|------------------|
| 12 | `lube-oil-systems` | 469 | PRIMARY: Contamination Control | SEC: Asset Protection |
| 13 | `air-intake-systems` | 230 | PRIMARY: Air Intake Filtration | SEC: Contamination Control |
| 14 | `fuel-systems` | 234 | PRIMARY: Diesel Fuel Integrity | SEC: Contamination Control |
| 15 | `hydraulic-systems` | 222 | PRIMARY: Hydraulic Efficiency | SEC: Contamination Control |
| 16 | `cabin-safety-systems` | 274 | PRIMARY: Contamination Control | SEC: Asset Protection |
| 17 | `compressed-air-systems` | 270 | PRIMARY: Contamination Control | SEC: Asset Protection |

**Standards Domain Status**: READY FOR PHASE 3

### Category 4: Standards Definition Pages (3 pages)
| # | Page | Lines | Domain Assignment |
|---|------|-------|------------------|
| 18 | `iso-4406` | 201 | PRIMARY: Contamination Control |
| 19 | `iso-16889` | 201 | PRIMARY: Contamination Control | SEC: Hydraulic Efficiency |
| 20 | `iso-5011` | 201 | PRIMARY: Air Intake Filtration |

**Standards Definition Status**: READY FOR PHASE 3

### Category 5: Contamination Pages (3 pages)
| # | Page | Lines | Domain Assignment |
|---|------|-------|------------------|
| 21 | `particle-wear` | 290 | PRIMARY: Contamination Control | SEC: Air Intake Filtration |
| 22 | `diesel-water` | 290 | PRIMARY: Diesel Fuel Integrity | SEC: Contamination Control |
| 23 | `hydraulic-system` | 290 | PRIMARY: Hydraulic Efficiency | SEC: Contamination Control |

**Contamination Status**: READY FOR PHASE 3

### Category 6: Fleet Pages (3 pages)
| # | Page | Lines | Domain Assignment |
|---|------|-------|------------------|
| 24 | `reducing-downtime` | 461 | PRIMARY: Asset Protection | SEC: Contamination Control |
| 25 | `fuel-efficiency` | 451 | PRIMARY: Diesel Fuel Integrity | SEC: Asset Protection |
| 26 | `total-cost-ownership` | 504 | PRIMARY: Asset Protection | SEC: Contamination Control |

**Fleet Status**: READY FOR PHASE 3

### Category 7: Compare Pages (4 pages)
| # | Page | Lines | Domain Assignment |
|---|------|-------|------------------|
| 27 | `system-vs-commodity` | 436 | PRIMARY: Asset Protection | SEC: Contamination Control |
| 28 | `evaluation-framework` | 518 | PRIMARY: Asset Protection | SEC: Contamination Control |
| 29 | `oem-comparison` | 436 | PRIMARY: Asset Protection | SEC: Contamination Control |
| 30 | `total-cost-ownership` | 575 | PRIMARY: Asset Protection | SEC: Contamination Control |

**Compare Status**: READY FOR PHASE 3

---

## Current Implementation Status

### ✅ COMPLETE (Bridge Pages - 4 pages)
1. **Semantic Ranking Layer Phase 1**
   - Domain assignment: 4/4 pages
   - Semantic links: ~19 links across 4 pages
   - SEMANTIC_DOMAINS tag: Present in AI Citation Layer
   - Link distribution: Definition (8), Standards (6), Failure (2), Technology (2), Operational Impact (1)

2. **AI Citation Layer**
   - Structure: DEFINITION, SYSTEMS, FAILURE_IMPACT, RELATED_STANDARDS, RELATED_TECHNOLOGIES, INDUSTRIAL_ROLE
   - JSON-LD TechArticle schema: Present
   - CITATION_REFERENCE: Present with version tracking

3. **10-Point Architecture**
   - Points 1-10: Implemented on all 4 bridge pages
   - Numbered sections: 01/, 02/, 03/, etc.
   - Retrieval Summary Block: Foundation present

### ⏳ IN PROGRESS (None - Ready for Phase 2)

### ❌ NOT STARTED (26 pages)
1. **Standards Domain Pages (6 pages)**
   - Semantic links: 0
   - Retrieval Summary Block: 0
   - Intent metadata: 0

2. **Standards Definition Pages (3 pages)**
   - Semantic links: 0
   - Retrieval Summary Block: 0
   - Intent metadata: 0

3. **Contamination Pages (3 pages)**
   - Semantic links: 0
   - Retrieval Summary Block: 0
   - Intent metadata: 0

4. **Fleet Pages (3 pages)**
   - Semantic links: 0
   - Retrieval Summary Block: 0
   - Intent metadata: 0

5. **Compare Pages (4 pages)**
   - Semantic links: 0
   - Retrieval Summary Block: 0
   - Intent metadata: 0

6. **Hub Pages (7 pages)**
   - Semantic links: 0
   - Retrieval Summary Block: 0
   - Intent metadata: 0

---

## Semantic Domain Distribution

### Contamination Control Systems (Core Domain)
**Pages**: 12 pages
- Standards: lube-oil (PRIMARY), cabin-safety (PRIMARY), compressed-air (PRIMARY), iso-4406 (PRIMARY)
- Contamination: particle-wear (PRIMARY)
- Bridge: industrial-filtration (PRIMARY)
- Fleet: reducing-downtime (SECONDARY), total-cost-ownership (SECONDARY)
- Compare: system-vs-commodity (SECONDARY), evaluation-framework (SECONDARY), oem-comparison (SECONDARY), total-cost-ownership (SECONDARY)

### Asset Protection Systems (Meta-Domain)
**Pages**: 16 pages
- Bridge: industrial-filtration (SECONDARY), oem-replacement (PRIMARY), aftermarket-selection (PRIMARY), fleet-solutions (PRIMARY)
- Standards: lube-oil (SECONDARY)
- Contamination: (none)
- Fleet: reducing-downtime (PRIMARY), fuel-efficiency (PRIMARY), total-cost-ownership (PRIMARY)
- Compare: system-vs-commodity (PRIMARY), evaluation-framework (PRIMARY), oem-comparison (PRIMARY), total-cost-ownership (PRIMARY)

### Hydraulic Efficiency Systems (Specialized)
**Pages**: 4 pages
- Standards: hydraulic-systems (PRIMARY), iso-16889 (SECONDARY)
- Contamination: hydraulic-system (PRIMARY)
- (Fleet: none)
- (Compare: none)

### Diesel Fuel Integrity Systems (Specialized)
**Pages**: 4 pages
- Standards: fuel-systems (PRIMARY)
- Contamination: diesel-water (PRIMARY)
- Fleet: fuel-efficiency (PRIMARY)
- (Compare: none)

### Air Intake Filtration Systems (Specialized)
**Pages**: 3 pages
- Standards: air-intake-systems (PRIMARY), iso-5011 (PRIMARY)
- Contamination: particle-wear (SECONDARY)
- (Fleet: none)
- (Compare: none)

---

## Current Page Structures (By Category)

### Bridge Pages (Reference Model)
**Pattern**: Hero (5 sections) → Context → 8 Content Sections → Canonical Block → Navigation
**Styling**: Dark (#000), Yellow (#FFF12D), Monospace labels, Gradient backgrounds
**Animations**: Framer Motion (opacity + y-translate)
**Components**: Fixed nav, motion sections, grids, cards, canonical blocks

### Standards Domain Pages
**Pattern**: Hero → 6-8 Content Sections → FAQs → Navigation
**Content**: Overview + Challenges + Standards + Impact + Technologies + FAQs
**Styling**: Consistent with bridges
**Animations**: Similar motion patterns

### Standards Definition Pages  
**Pattern**: Hero → Definition + Scope + Applications + FAQs → Navigation
**Content**: Technical definition, standards scope, application areas, Q&A
**Styling**: Consistent
**Animations**: Standard patterns

### Contamination Pages
**Pattern**: Hero → Problem Overview → Root Cause → Failure Progression → Impact → Prevention → Navigation
**Content**: Problem description, causes, progression, consequences, prevention
**Styling**: Consistent
**Animations**: Motion patterns

### Fleet Pages
**Pattern**: Hero → Strategy Overview → Roadmap Phases → Impact Metrics → Navigation
**Content**: Strategy description, implementation phases, benefits, success metrics
**Styling**: Consistent
**Animations**: Standard patterns

### Compare Pages
**Pattern**: Hero → Comparison Framework → Analysis → Decision Matrix → Impact → Navigation
**Content**: Comparison criteria, trade-offs, recommendations, impact analysis
**Styling**: Consistent
**Animations**: Motion patterns

### Hub Pages
**Pattern**: Hero → Navigation Grid Linking Subcategories → Navigation
**Content**: Category overview, quick links
**Styling**: Consistent
**Animations**: Link hover effects

---

## Linking Strategy (From SEMANTIC_RANKING_LAYER.md)

### Definition Links (General → Specific)
- Used on: Bridge pages, standards pages, hub pages
- Frequency: 1 per page (max)
- Example: Industrial Filtration (general) → Lube Oil Systems (specific)

### Failure Mechanism Links (Causes → Consequences)
- Used on: Contamination pages, standards pages
- Frequency: 1-2 per page
- Example: Particle contamination → Particle Wear case study

### Standards Links (Systems → Standards)
- Used on: System domain pages, technical standards pages
- Frequency: 1 per page
- Example: Lube Oil Systems → ISO 4406/16889 standards

### Technology Links (Problems → Solutions)
- Used on: Contamination pages, standards pages, bridge pages
- Frequency: 1-2 per page
- Example: Water contamination → DURATECH/NANOFORCE solutions

### Operational Impact Links (Technical → Business)
- Used on: Fleet pages, compare pages, bridge pages
- Frequency: 1-2 per page
- Example: Contamination control → Fleet downtime reduction

---

## Retrieval Summary Block Template

All 30 pages will include this machine-readable block:

```
SEMANTIC_DOMAINS: [primary], [secondary]
SYSTEMS_AFFECTED: [air, fuel, hydraulic, lube, cabin, compressed_air]
CONCEPT_TAXONOMY: [type: contamination|standard|failure|efficiency|control|strategy]
RELEVANCE_LEVELS: [industrial, fleet, technical]
INTERNAL_REFERENCES:
  Related Standards: [ISO codes]
  Related Contamination Modes: [links]
  Related Technologies: [links]
  Related Fleet Strategies: [links]
CITATION_METADATA:
  source_uri: elimfilters.com/knowledge-system/[path]
  concept_id: [standardized identifier]
  version: 1.0
  last_updated: 2026-05-23
```

---

## Phase Progression

### PHASE 1 — MAPPING (✅ COMPLETE)
- Scanned all 30 pages
- Identified current structure
- Created comprehensive inventory
- No files modified

### PHASE 2 — DOMAIN ASSIGNMENT (📋 READY)
- Assign domains to remaining 26 pages
- Create internal mapping structure
- No UI changes
- Estimated: 30 minutes

### PHASE 3 — INTERNAL LINKING (📋 READY)
- Add 2-3 semantic links per page (26 pages)
- Links in content paragraphs only
- Use link types strategically
- Estimated: 3-4 hours

### PHASE 4 — RETRIEVAL LAYER INJECTION (📋 READY)
- Append Retrieval Summary Block to all pages
- No content modification
- Only append at bottom
- Estimated: 2-3 hours

### PHASE 5 — SEMANTIC OPTIMIZATION (📋 READY)
- Verify link distribution hierarchy
- Remove redundant links
- Ensure consistency
- Estimated: 1-2 hours

---

## Prerequisites Met ✅

- ✅ SEMANTIC_RANKING_LAYER.md (complete domain/linking mapping)
- ✅ DEMAND_INTERCEPTION_LAYER.md (intent classification + routing)
- ✅ Semantic Ranking Phase 1 (bridge pages as reference)
- ✅ Link types defined and tested
- ✅ Retrieval Summary Block template documented
- ✅ AI Citation Layer template established
- ✅ 10-Point Architecture reference complete

---

## Ready for Phase 2 ✅

**Approval Needed**: Proceed with PHASE 2 — DOMAIN ASSIGNMENT?

**Next Step**: Create domain mapping document and begin systematic linking implementation.

---

*Report Generated*: Phase 1 Complete — No modifications made to source files
*Next Action*: Phase 2 Domain Assignment
