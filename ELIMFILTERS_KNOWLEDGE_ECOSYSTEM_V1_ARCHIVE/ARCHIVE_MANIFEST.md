# ARCHIVE MANIFEST
## ELIMFILTERS Knowledge Ecosystem V1
**Generated:** 2026-06-03 · **Total files:** 311 · **Total size:** 5.4 MB

Importance levels: **CRITICAL** — do not modify · **HIGH** — core reference · **MEDIUM** — development history · **LOW** — supporting material

---

## Root Files

| File | Purpose | Importance |
|------|---------|-----------|
| `README_ARCHIVE.md` | Archive entry point and directory map | HIGH |
| `V1_OWNER_GUIDE.md` | Plain-language Spanish guide for non-technical owners | HIGH |
| `ARCHIVE_MANIFEST.md` | This file — complete archive inventory | HIGH |

---

## V1_FINAL/ — Official Closure Documents

| File | Purpose | Importance |
|------|---------|-----------|
| `KNOWLEDGE_ECOSYSTEM_V1_FINAL_DECLARATION.md` | Official Declaration A — V1 Complete | CRITICAL |
| `KNOWLEDGE_ECOSYSTEM_V1_CLOSURE.md` | 15-section executive review with all quantitative metrics | CRITICAL |
| `KNOWLEDGE_ECOSYSTEM_V1_ARCHIVE_PLAN.md` | Blueprint that defined this archive structure | HIGH |
| `PHASE5_COMPLETION_REVIEW.md` | Phase 5 before/after metrics, closure criteria verification | HIGH |
| `PHASE4_FINAL_REVIEW.md` | Phase 4 final state review with gap analysis input | HIGH |

---

## PHASE_REPORTS/ — Development History

| File | Purpose | Importance |
|------|---------|-----------|
| `PHASE3E_VAULT_EXPANSION_REPORT.md` | Phase 3E vault expansion results | MEDIUM |
| `PHASE3F_GRAPH_CLUSTER_REPORT.md` | Graph clustering analysis | MEDIUM |
| `PHASE3G_CENTRALITY_EXPANSION_REPORT.md` | Centrality node expansion | MEDIUM |
| `PHASE3H_GRAPH_COMPLETION_REPORT.md` | Phase 3 final state | MEDIUM |
| `PHASE4A_CITATION_COMPILER_REPORT.md` | Citation index compiler implementation | MEDIUM |
| `PHASE4B_PART_SEARCH_MAP_REPORT.md` | Part Search Map implementation | MEDIUM |
| `PHASE4B1_PRODUCT_FAMILY_COMPLETION_REPORT.md` | Product family completion | MEDIUM |
| `PHASE4C_JSONLD_REPORT.md` | JSON-LD pipeline implementation | MEDIUM |
| `PHASE4D_JSONLD_SYNC_REPORT.md` | JSON-LD sync pipeline | MEDIUM |
| `PHASE4E_CITATION_API_REPORT.md` | Static citation API generation | MEDIUM |
| `PHASE4_REMAINING_PRIORITIES.md` | Gap analysis feeding Phase 5 | MEDIUM |
| `PHASE5_GAP_ANALYSIS.md` | Phase 5 scope and gap analysis | MEDIUM |

---

## ARCHITECTURE/ — Design Decisions

| File | Purpose | Importance |
|------|---------|-----------|
| `CLAUDE.md` | Full development guide and conventions used throughout V1 | HIGH |
| `PHASE3A_OBSIDIAN_FOUNDATION_PLAN.md` | Vault foundation design | MEDIUM |
| `PHASE3B_ENTITY_SCHEMA_IMPLEMENTATION_PLAN.md` | Entity schema design | MEDIUM |
| `PHASE3C_KNOWLEDGE_GRAPH_RELATIONSHIP_MODEL.md` | Relationship model design | MEDIUM |
| `PHASE3_OBSIDIAN_KNOWLEDGE_GRAPH_BLUEPRINT.md` | Overall graph blueprint | MEDIUM |
| `PHASE4_AI_CITATION_INDEX_PLAN.md` | AI Citation Layer design | MEDIUM |

---

## BUSINESS/ — Commercial Strategy

| File | Purpose | Importance |
|------|---------|-----------|
| `COMMERCIAL_GROWTH_PLAN_2026.md` | Commercial deployment roadmap | HIGH |
| `ECOSYSTEM_READINESS_REPORT.md` | Market readiness assessment | HIGH |

---

## VAULT/ — Knowledge Graph (45 Entity Notes)

All vault notes use Obsidian Markdown with YAML frontmatter. Do not modify keys or delete files without versioning.

### Meta (4 files)
| File | Purpose | Importance |
|------|---------|-----------|
| `00-meta/CITATION_INDEX.json` | Master citation index — 45 entities, 505 edges | CRITICAL |
| `00-meta/PART_SEARCH_MAP.json` | Traversal paths — 97/99 valid | CRITICAL |
| `00-meta/_INDEX.md` | Vault index and navigation | HIGH |
| `00-meta/_SCHEMA-REFERENCE.md` | YAML frontmatter schema for all entity types | HIGH |

### Technologies (7 files) — CRITICAL
| Key | File |
|-----|------|
| HYDROCORE | `01-technologies/active/HYDROCORE.md` |
| INTEKCORE | `01-technologies/active/INTEKCORE.md` |
| MACROCORE | `01-technologies/active/MACROCORE.md` |
| MICROKAPPA | `01-technologies/active/MICROKAPPA.md` |
| NANOFORCE | `01-technologies/active/NANOFORCE.md` |
| SYNTEPORE | `01-technologies/active/SYNTEPORE.md` |
| SYNTRAX | `01-technologies/active/SYNTRAX.md` |

### Industries (11 files) — CRITICAL
`02-industries/`: AGRICULTURE, AUTOMOTIVE, BUS_COACH, CONSTRUCTION, MARINE, MINING, OIL_GAS, POWER_GENERATION, RAILWAY, TRUCKS_FLEETS, WASTE_MUNICIPAL

### Systems (1 file)
`03-systems/product-line/AIRFILTER.md`

### Standards (9 files) — HIGH
`04-standards/`: ASTM_D6304, DIN_71220, ISO_11155, ISO_12937, ISO_16889, ISO_4406, ISO_5011, NFPA_T214, SAE_J1539

### Contamination Modes (4 files) — CRITICAL
`05-contamination/`: CABIN_AIR_CONTAMINATION, DIESEL_WATER, HYDRAULIC_CONTAMINATION, PARTICLE_WEAR

### Components (3 files) — MEDIUM
`06-components/`: ENGINE_BEARING_JOURNAL, PISTON_RING_ASSEMBLY, TURBOCHARGER_BEARING

### Problems (5 files) — CRITICAL (user-facing entry layer)
`07-problems/`: DUST_INGESTION, ENGINE_OIL_CONTAMINATION, FUEL_FILTER_PLUGGING, HYDRAULIC_VALVE_FAILURE, OPERATOR_DUST_EXPOSURE

### Product Families (5 files) — CRITICAL (traversal terminal nodes)
`08-product-families/`: AIRFILTER_PRIMARY, CABIN_PRIMARY, FUEL_PRIMARY, HYDRAULIC_PRIMARY, LUBE_PRIMARY

---

## COMPILED/ — Generated Artifacts

### citation-index/ (4 files)
| File | Purpose | Importance |
|------|---------|-----------|
| `CITATION_INDEX.json` | Master index — minified, 45 entities, 505 edges | CRITICAL |
| `CITATION_INDEX.pretty.json` | Human-readable version (same data, formatted) | HIGH |
| `PART_SEARCH_MAP.json` | Traversal map — minified, 97 valid paths | CRITICAL |
| `PART_SEARCH_MAP.pretty.json` | Human-readable version (same data, formatted) | HIGH |

### citation-api/ (195 files) — HIGH
Static JSON endpoints. No server required; read with any JSON viewer.

Endpoint patterns:
- `[KEY].json` — Single entity definition (45 files)
- `type/[type].json` — All entities of a type (8 files)
- `path/by-entry/[INDUSTRY_KEY].json` — Traversal paths by industry (11 files)
- `path/[TYPE]/[KEY].json` — Paths by start node type
- Additional path index and summary files

---

## SCRIPTS/ — Build Pipeline (4 files)

| File | Purpose | Importance |
|------|---------|-----------|
| `build-citation-index.js` | Compiles VAULT/ notes into CITATION_INDEX.json | CRITICAL |
| `build-part-search-map.js` | Builds traversal paths into PART_SEARCH_MAP.json | CRITICAL |
| `generate-citation-api.js` | Generates all 195 static API JSON files | CRITICAL |
| `sync-jsonld-constants.js` | Syncs JSON-LD constants to TypeScript for website build | HIGH |

Run order: `build-citation-index.js` → `build-part-search-map.js` → `generate-citation-api.js`

---

## KNOWLEDGE_SYSTEM/ — Website Pages (30 TSX files)

React/TypeScript page source files for the Knowledge System section of the ELIMFILTERS website.

| Section | Files |
|---------|-------|
| Root hub | `page.tsx`, `science/page.tsx` |
| Standards (9) | `standards/page.tsx` + 8 domain pages |
| Contamination (4) | `contamination/page.tsx` + 3 case studies |
| Fleet (4) | `fleet/page.tsx` + 3 strategy pages |
| Compare (5) | `compare/page.tsx` + 4 comparison tools |
| Bridges (5) | `bridges/page.tsx` + 4 bridge pages |

---

## METRICS/ (3 files)

| File | Purpose | Importance |
|------|---------|-----------|
| `V1_METRICS_SNAPSHOT.json` | Machine-readable metrics at V1 declaration | HIGH |
| `V1_METRICS_SNAPSHOT.md` | Human-readable metrics companion | HIGH |
| `ARCHIVE_CHECKSUM.txt` | SHA-256 checksums for integrity verification | HIGH |

---

## Files Intentionally Excluded from Archive

| Item | Reason |
|------|--------|
| `frontend/out/` | Generated build output; rebuilt from source with `npm run build` |
| `frontend/node_modules/` | npm dependencies; restored with `npm install` |
| `frontend/src/` (except KNOWLEDGE_SYSTEM pages) | Active website code; maintained in main repo |
| `elimfilters-vault/` (live) | Live source; VAULT/ is the archive copy |
| `.git/` | Git history remains in main repository |
| Development scratch files | Temporary working files |

---

*Manifest generated: 2026-06-03 · 311 files · 5.4 MB*
