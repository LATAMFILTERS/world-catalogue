# Phase 4D — JSON-LD Prebuild Sync Report

**Date:** 2026-06-03  
**Status:** Complete  
**Branch:** `claude/dazzling-franklin-ALGY1`

---

## Summary

Phase 4D eliminates JSON-LD drift in the ELIMFILTERS Knowledge System by replacing 11 hardcoded inline `PAGE_JSONLD` literals with a single auto-generated constants file that is regenerated on every `npm run build`.

Before: 11 pages had inline JSON-LD `JSON.stringify({...})` literals that would silently drift from `CITATION_INDEX.json` whenever entity definitions were updated.

After: All 11 pages import from `jsonld-constants.generated.ts`, which is regenerated from `CITATION_INDEX.json` automatically via `prebuild`.

---

## Files Created / Modified

| File | Action | Purpose |
|------|--------|---------|
| `scripts/sync-jsonld-constants.js` | Created | Reads CITATION_INDEX.json, writes 11 JSON-LD string constants to generated TS file |
| `frontend/src/lib/jsonld-constants.generated.ts` | Generated | Auto-generated export file with 11 named string constants |
| `frontend/package.json` | Modified | Added `prebuild` script running citation compiler + sync |
| `frontend/src/app/knowledge-system/page.tsx` | Modified | Imports `JSONLD_KNOWLEDGE_SYSTEM_HUB` |
| `frontend/src/app/knowledge-system/standards/page.tsx` | Modified | Imports `JSONLD_STANDARDS_INDEX` |
| `frontend/src/app/knowledge-system/standards/air-intake-systems/page.tsx` | Modified | Imports `JSONLD_AIR_INTAKE_SYSTEMS` |
| `frontend/src/app/knowledge-system/standards/lube-oil-systems/page.tsx` | Modified | Imports `JSONLD_LUBE_OIL_SYSTEMS` |
| `frontend/src/app/knowledge-system/standards/cabin-safety-systems/page.tsx` | Modified | Imports `JSONLD_CABIN_SAFETY_SYSTEMS` |
| `frontend/src/app/knowledge-system/standards/fuel-systems/page.tsx` | Modified | Imports `JSONLD_FUEL_SYSTEMS` |
| `frontend/src/app/knowledge-system/standards/hydraulic-systems/page.tsx` | Modified | Imports `JSONLD_HYDRAULIC_SYSTEMS` |
| `frontend/src/app/knowledge-system/contamination/page.tsx` | Modified | Imports `JSONLD_CONTAMINATION_INDEX` |
| `frontend/src/app/knowledge-system/contamination/particle-wear/page.tsx` | Modified | Imports `JSONLD_PARTICLE_WEAR` |
| `frontend/src/app/knowledge-system/contamination/diesel-water/page.tsx` | Modified | Imports `JSONLD_DIESEL_WATER` |
| `frontend/src/app/knowledge-system/contamination/hydraulic-system/page.tsx` | Modified | Imports `JSONLD_HYDRAULIC_CONTAMINATION` |

---

## Drift Risks Removed

| Risk | Before | After |
|------|--------|-------|
| Entity definition drift | 11 inline literals hand-edited independently | 1 generated file, rebuilt from vault on every `npm run build` |
| Source of truth | Scattered across 11 `page.tsx` files | `elimfilters-vault/00-meta/CITATION_INDEX.json` |
| Update propagation | Manual, error-prone, zero enforcement | Automatic via `prebuild` hook |
| Consistency between pages | No cross-page verification | All definitions sourced from same entity record |

---

## Build Result

```
> elimfilters-frontend@0.1.0 prebuild
> node ../scripts/build-citation-index.js && node ../scripts/sync-jsonld-constants.js

CITATION INDEX COMPILER — Phase 4A
---
Notes scanned:    41
Records built:    41
Errors:           0
Warnings:         9 (pre-existing dangling links — unrelated to Phase 4D)

JSON-LD CONSTANTS SYNC
---
Source: elimfilters-vault/00-meta/CITATION_INDEX.json (41 entities)
Output: frontend/src/lib/jsonld-constants.generated.ts
Constants generated: 11
  JSONLD_KNOWLEDGE_SYSTEM_HUB              (DataCatalog, 41 entities)
  JSONLD_STANDARDS_INDEX                   (CollectionPage, 9 standards)
  JSONLD_AIR_INTAKE_SYSTEMS                (TechArticle + DefinedTermSet, 5 entities)
  JSONLD_LUBE_OIL_SYSTEMS                  (TechArticle + DefinedTermSet, 4 entities)
  JSONLD_CABIN_SAFETY_SYSTEMS              (TechArticle + DefinedTermSet, 3 entities)
  JSONLD_FUEL_SYSTEMS                      (TechArticle + DefinedTermSet, 3 entities)
  JSONLD_HYDRAULIC_SYSTEMS                 (TechArticle + DefinedTermSet, 5 entities)
  JSONLD_CONTAMINATION_INDEX               (CollectionPage, 4 contamination modes)
  JSONLD_PARTICLE_WEAR                     (TechArticle, particle wear failure analysis)
  JSONLD_DIESEL_WATER                      (TechArticle, diesel water contamination)
  JSONLD_HYDRAULIC_CONTAMINATION           (TechArticle, hydraulic system contamination)
Sync complete.

> elimfilters-frontend@0.1.0 build
> next build

✓ Compiled successfully
✓ Generating static pages (89/89)
Build exit code: 0
```

---

## JSON-LD Pages in Static Output

**Total HTML files with `application/ld+json`:** 88  
**Knowledge System pages with JSON-LD:** 30 (all knowledge-system routes)

All 11 target pages verified to contain structured data in their static HTML output.

---

## Remaining Manual Structured-Data Areas

Pages that still have no JSON-LD (outside the 11 migrated pages):

- Fleet pages (`/knowledge-system/fleet/*`) — have JSON-LD inherited from other patterns but not via generated constants
- Compare pages (`/knowledge-system/compare/*`) — have JSON-LD but hardcoded
- Bridge pages (`/knowledge-system/bridges/*`) — have JSON-LD but hardcoded
- Technology individual pages (`/technologies/[slug]`) — have JSON-LD in template
- Standard deep-dive pages (`iso-16889`, `iso-4406`, `iso-5011`) — have JSON-LD but hardcoded
- `compressed-air-systems` — no `PAGE_JSONLD` constant (uses a different inline approach)

These pages are candidates for Phase 4E expansion of the constants file.

---

## Next Recommended Step

**Phase 4E: `/api/citation` Retrieval Endpoint**

Create a server-side API route that serves CITATION_INDEX entity records as JSON-LD responses, enabling:
- Direct machine retrieval of canonical definitions via URL
- Citation by external LLMs with versioned source URLs
- Dynamic structured data for entity pages not yet covered by the generated constants

Endpoint design: `GET /api/citation?entity=MACROCORE` → returns JSON-LD `DefinedTerm` record sourced from `CITATION_INDEX.json`.
