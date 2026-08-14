# PHASE 4 REMAINING PRIORITIES
# Evaluation and Task Selection

**Date:** 2026-06-03
**Context:** Phase 4D complete — JSON-LD drift risk closed, prebuild pipeline active
**Purpose:** Rank remaining Phase 4 options and select the single next task

---

## Evaluation Matrix

| Option | Business Impact | Technical Risk | Effort | Dependency | Blocks AI/Part Search |
|--------|----------------|---------------|--------|------------|----------------------|
| 1. /api/citation endpoint | HIGH | LOW | MEDIUM | None | YES — blocks Phase 4D LLM tools |
| 2. JSON-LD: Technologies hub | MEDIUM | LOW | LOW | None | NO |
| 3. JSON-LD: Fleet pages | LOW | LOW | LOW | None | NO |
| 4. JSON-LD: Comparison pages | LOW | LOW | LOW | None | NO |
| 5. PART_SEARCH_MAP coverage | MEDIUM | LOW | MEDIUM | Vault notes for INTEKCORE/SYNTAPORE PF | NO |
| 6. Validation scripts in package.json | MEDIUM | LOW | LOW | None | NO — but reduces risk for all others |

---

## Option-by-Option Analysis

### Option 1 — /api/citation Retrieval Endpoint

**What it is**: A Next.js API route (`/api/citation`) that serves `CitationRecord` structs from `CITATION_INDEX.json`. Supports the 4 query patterns defined in Phase 4: key lookup, type scan, relationship traversal, and Part Search path traversal. This is the LLM tool interface.

**Business impact: HIGH**
This is the only option that creates an externally consumable interface. Every other remaining option improves the static HTML output or internal data quality. This one opens the knowledge graph to programmatic consumers — AI integrations, the `citations=true` Part Search parameter, and any external system that needs to resolve ELIMFILTERS entity definitions at runtime.

**Technical risk: LOW**
Next.js static export (`output: 'export'`) does NOT support API routes — they require a server runtime. This is a known constraint. The implementation either requires: (a) switching to a server-rendered deployment for the API route only (hybrid approach), or (b) building the citation endpoint as a separate lightweight service outside the Next.js app, or (c) using Next.js `output: 'export'` with a pre-generated static JSON file approach (each entity gets its own `/api/citation/[key]/index.json` static file). Option (c) is zero-risk and compatible with the existing static export — it generates 41 static JSON files at build time from `CITATION_INDEX.json`. This is the correct approach.

**Effort: MEDIUM**
Static JSON generation is straightforward. The more significant effort is the traversal endpoint (path query), which requires implementing the graph traversal logic in the build script, not a runtime function.

**Dependency: None**
Does not require any vault changes or frontend content changes.

**Blocks AI/Part Search work: YES**
The `citations=true` Part Search parameter, the LLM tool definitions, and the RAG pipeline all require this endpoint to exist before they can be built. This is the critical path item for all future AI integration.

---

### Option 2 — JSON-LD: Technologies Hub

**What it is**: Add `CollectionPage` + `DefinedTerm` JSON-LD to the `/technologies` hub page and individual technology pages (MACROCORE, NANOFORCE, SYNTRAX, etc.), sourced from the generated constants pipeline built in Phase 4D.

**Business impact: MEDIUM**
Technology pages already exist and rank for brand-specific searches. Adding JSON-LD improves structured data coverage and schema.org `DefinedTerm` signals for technology concept searches. Meaningful for SEO but not a step-change.

**Technical risk: LOW**
The Phase 4D pipeline handles this cleanly. Add technology constants to `sync-jsonld-constants.js`, import in technology pages. No new patterns.

**Effort: LOW**
Technology pages follow the same `'use client'` pattern as the Knowledge System pages already updated. Effort is adding 7–12 constants to the sync script and importing them.

**Dependency: None**

**Blocks AI/Part Search: NO**

---

### Option 3 — JSON-LD: Fleet Optimization Pages

**What it is**: Add `TechArticle` JSON-LD to the 3 Fleet Optimization pages (`/knowledge-system/fleet/`). Fleet content covers downtime reduction, fuel efficiency, and TCO — not directly mapped to vault entities but usable with `TechArticle` schema pointing to related technologies and industries.

**Business impact: LOW**
Fleet pages target a narrower search intent (operational strategy rather than technical specification). The marginal structured data value is lower than for Standards or Technology pages.

**Technical risk: LOW**
Fleet entities are not in the vault — the JSON-LD would be authored manually (no sync pipeline benefit) or would reference existing technology/industry entities from the index loosely.

**Effort: LOW**
Small pages, simple schema, no vault dependency.

**Dependency: None**

**Blocks AI/Part Search: NO**

---

### Option 4 — JSON-LD: Comparison Pages

**What it is**: Add structured data to the comparison/bridge pages (`/knowledge-system/compare/`). These pages (system-vs-commodity, evaluation-framework, TCO-analysis, OEM-comparison) target competitor brand search intent.

**Business impact: LOW**
Comparison pages are the most commercially motivated pages in the Knowledge System. Adding `TechArticle` schema improves crawl indexing but the structured data types available for comparison content are weaker than for technical reference content.

**Technical risk: LOW**

**Effort: LOW**

**Dependency: None**

**Blocks AI/Part Search: NO**

---

### Option 5 — Improve PART_SEARCH_MAP Coverage

**What it is**: Create ProductFamily vault notes for INTEKCORE (Zero-Bypass Housing family) and SYNTAPORE (All-Synthetic Intake family) to resolve the 2 remaining invalid traversal paths (PATH_C_INTEKCORE and PATH_C_SYNTAPORE), then rebuild the map.

**Business impact: MEDIUM**
Completing the map to 100% validity closes the last structural gaps in the Part Search citation chain. When the `citations=true` API parameter is eventually built, it will have complete coverage. However, INTEKCORE and SYNTAPORE serve niche applications (marine/humid environments and zero-bypass housing), so the commercial impact of the 2 missing paths is lower than the remaining gaps look numerically.

**Technical risk: LOW**
Standard vault note creation — same process as Phase 4B.1.

**Effort: MEDIUM**
Two vault notes plus compiler rebuild. Notes require domain knowledge for the INTEKCORE housing product family and the SYNTAPORE synthetic-media specialty range.

**Dependency**: Requires correct characterisation of the INTEKCORE and SYNTAPORE product families, which are less clearly defined in the vault than MACROCORE.

**Blocks AI/Part Search: NO** — but improves completeness before the citation API goes live.

---

### Option 6 — Validation Scripts in package.json

**What it is**: Add two scripts to `frontend/package.json`:
- `validate:vault` — runs `build-citation-index.js` in validation-only mode (errors without writing output)
- `validate:map` — runs `build-part-search-map.js` in dry-run mode

These give developers a fast feedback loop to check vault consistency before committing, without running the full build.

**Business impact: MEDIUM**
Reduces the risk of silent failures entering the citation pipeline. As the vault grows and the team expands, having validation available as a standalone command reduces the chance of malformed notes producing bad JSON-LD in production.

**Technical risk: LOW**
Both scripts already exist — this is configuration only.

**Effort: LOW**
Add `--validate` flags to the existing scripts and register them in `package.json`. Under 2 hours total.

**Dependency: None**

**Blocks AI/Part Search: NO** — but protects the pipeline that feeds them.

---

## Priority Ranking

| Rank | Option | Rationale |
|------|--------|-----------|
| **1** | /api/citation endpoint | Only option on the critical path for AI integration; every future Phase 4 deliverable (LLM tools, citations=true, RAG) depends on it |
| **2** | Validation scripts | Lowest effort, protects the pipeline; should accompany the citation endpoint to validate the data it serves |
| **3** | JSON-LD: Technologies hub | Extends the Phase 4D pattern to the highest-traffic non-Knowledge-System pages with minimal effort |
| **4** | PART_SEARCH_MAP coverage | Closes the map gaps before the citation API goes live; better to be complete when external systems first consume it |
| **5** | JSON-LD: Fleet pages | Meaningful coverage extension, low effort, but low search impact relative to options 1–4 |
| **6** | JSON-LD: Comparison pages | Lowest structured data value; comparison pages serve commercial positioning better than technical citation authority |

---

## Selected Next Task: Option 1 — /api/citation Retrieval Endpoint

### Rationale

Every other item on this list is a completeness improvement. Option 1 is the only capability unlock. The citation endpoint transforms `CITATION_INDEX.json` from a build artifact into a live, queryable knowledge API. Without it:

- The CANIDRA commercial plan's AI citation layer remains a static HTML feature, not a programmable asset
- The Part Search `citations=true` parameter cannot be implemented
- LLM integrations cannot retrieve citations at request time
- The knowledge graph has no external interface

With it, the Phase 4 architecture plan is functionally complete. All subsequent work (RAG, LLM tool definitions, Part Search citation chains) builds on top of this endpoint rather than waiting for it.

### Implementation Approach (for Phase 4E)

Use static JSON generation compatible with `output: 'export'`. During `npm run build`:

1. **Build script** generates one JSON file per entity: `frontend/out/api/citation/[KEY].json`
2. **Index file**: `frontend/out/api/citation/index.json` — all entities, typed
3. **Type scan files**: `frontend/out/api/citation/type/[type].json` — entities by type
4. **Graph file**: `frontend/out/api/citation/graph.json` — full edge list
5. **Path traversal files**: `frontend/out/api/citation/path/[path_id].json` — pre-computed traversal paths from PART_SEARCH_MAP

This approach requires zero server infrastructure, is compatible with the existing static export deployment, and serves all 4 query patterns from Pattern D in the Phase 4 plan (key lookup, type scan, relationship traversal, path traversal — all pre-computed).

The `/api/citation?key=MACROCORE` query pattern becomes a fetch to `/api/citation/MACROCORE.json`. Clean, fast, cacheable.

### Recommended pairing

Run Option 6 (validation scripts) as part of the same Phase 4E commit. It is trivial effort and ensures the data feeding the citation endpoint is validated before every deployment.

---

*Select Phase 4E when ready to implement.*
