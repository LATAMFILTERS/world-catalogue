# Phase 4C — JSON-LD Structured Data from Citation Index

**Date**: 2026-06-03
**Branch**: `claude/dazzling-franklin-ALGY1`
**Build Status**: PASS (0 TypeScript errors, 0 build errors)

---

## Summary

Phase 4C adds `<script type="application/ld+json">` structured data blocks to all existing Knowledge System pages. Data is sourced from `CITATION_INDEX.json` (41 entities) and inlined as static module-level constants in each `'use client'` React component, ensuring browser-safe execution and inclusion in Next.js static export HTML.

- `frontend/src/lib/citation-jsonld.ts` — already present from prior phase; no changes needed
- 11 Knowledge System `page.tsx` files modified with JSON-LD constants + script tags
- Build passes; JSON-LD verified in `frontend/out/` static HTML

---

## Files Modified

| File | Change |
|------|--------|
| `frontend/src/app/knowledge-system/page.tsx` | Added `PAGE_JSONLD` const (DataCatalog) + script tag |
| `frontend/src/app/knowledge-system/standards/page.tsx` | Added `PAGE_JSONLD` const (CollectionPage) + script tag |
| `frontend/src/app/knowledge-system/contamination/page.tsx` | Added `PAGE_JSONLD` const (CollectionPage) + script tag |
| `frontend/src/app/knowledge-system/standards/air-intake-systems/page.tsx` | Added `PAGE_JSONLD` const (TechArticle+DefinedTermSet) + script tag |
| `frontend/src/app/knowledge-system/standards/lube-oil-systems/page.tsx` | Added `PAGE_JSONLD` const (TechArticle+DefinedTermSet) + script tag |
| `frontend/src/app/knowledge-system/standards/cabin-safety-systems/page.tsx` | Added `PAGE_JSONLD` const (TechArticle+DefinedTermSet) + script tag |
| `frontend/src/app/knowledge-system/standards/fuel-systems/page.tsx` | Added `PAGE_JSONLD` const (TechArticle+DefinedTermSet) + script tag |
| `frontend/src/app/knowledge-system/standards/hydraulic-systems/page.tsx` | Added `PAGE_JSONLD` const (TechArticle+DefinedTermSet) + script tag |
| `frontend/src/app/knowledge-system/contamination/particle-wear/page.tsx` | Added `PAGE_JSONLD` const (TechArticle) + script tag |
| `frontend/src/app/knowledge-system/contamination/diesel-water/page.tsx` | Added `PAGE_JSONLD` const (TechArticle) + script tag |
| `frontend/src/app/knowledge-system/contamination/hydraulic-system/page.tsx` | Added `PAGE_JSONLD` const (TechArticle) + script tag |

---

## Pages Enhanced

| Page | Schema types added | Entity keys sourced |
|------|-------------------|---------------------|
| `/knowledge-system` | `DataCatalog` | All 41 entities (7 tech, 11 industry, 1 system, 9 standard, 4 contamination-mode, 3 component, 1 problem, 5 product-family) |
| `/knowledge-system/standards` | `CollectionPage` | ISO_16889, ISO_4406, ISO_5011, ISO_11155, ISO_12937, ASTM_D6304, SAE_J1539, DIN_71220, NFPA_T214 |
| `/knowledge-system/contamination` | `CollectionPage` | DIESEL_WATER, PARTICLE_WEAR, HYDRAULIC_CONTAMINATION, CABIN_AIR_CONTAMINATION |
| `/knowledge-system/standards/air-intake-systems` | `TechArticle` + `DefinedTermSet` | ISO_5011, SAE_J1539, MACROCORE, SYNTEPORE, INTEKCORE |
| `/knowledge-system/standards/lube-oil-systems` | `TechArticle` + `DefinedTermSet` | ISO_16889, ISO_4406, SYNTRAX, NANOFORCE |
| `/knowledge-system/standards/cabin-safety-systems` | `TechArticle` + `DefinedTermSet` | ISO_11155, DIN_71220, MICROKAPPA |
| `/knowledge-system/standards/fuel-systems` | `TechArticle` + `DefinedTermSet` | ASTM_D6304, ISO_12937, HYDROCORE |
| `/knowledge-system/standards/hydraulic-systems` | `TechArticle` + `DefinedTermSet` | ISO_16889, ISO_4406, NFPA_T214, NANOFORCE, SYNTRAX |
| `/knowledge-system/contamination/particle-wear` | `TechArticle` | PARTICLE_WEAR, ISO_16889, ISO_4406, MACROCORE, NANOFORCE, SYNTRAX |
| `/knowledge-system/contamination/diesel-water` | `TechArticle` | DIESEL_WATER, ASTM_D6304, ISO_12937, HYDROCORE |
| `/knowledge-system/contamination/hydraulic-system` | `TechArticle` | HYDRAULIC_CONTAMINATION, ISO_16889, ISO_4406, NFPA_T214, NANOFORCE, SYNTRAX |

---

## Schema Types Used

| Schema Type | schema.org Reference | Pages Using |
|-------------|---------------------|-------------|
| `DataCatalog` | https://schema.org/DataCatalog | Knowledge System hub |
| `Dataset` | https://schema.org/Dataset | Hub (41 entries as datasets within DataCatalog) |
| `CollectionPage` | https://schema.org/CollectionPage | Standards index, Contamination index |
| `TechArticle` | https://schema.org/TechArticle | All 8 domain/detail pages |
| `DefinedTermSet` | https://schema.org/DefinedTermSet | 5 standards domain pages |
| `DefinedTerm` | https://schema.org/DefinedTerm | Within CollectionPage hasPart and DefinedTermSet hasDefinedTerm |

---

## Build Validation

```
Build: PASS
TypeScript errors: 0
Pages with JSON-LD in /out/ HTML: 30 (includes pre-existing structured data on bridge/compare/fleet pages)
New pages enhanced with JSON-LD: 11
```

Verified via:
```bash
find frontend/out -name "*.html" -path "*knowledge-system*" | xargs grep -l "application/ld+json"
```

---

## Structured Data Gaps

Pages in the Knowledge System that do NOT have new JSON-LD added in Phase 4C (they already had other structured data from prior phases, or are outside Phase 4C scope):

- `/knowledge-system/standards/compressed-air-systems/` — no entity in CITATION_INDEX for compressed air; out of scope for Phase 4C
- `/knowledge-system/standards/iso-16889/`, `/iso-4406/`, `/iso-5011/` — individual standard pages; have RetrievalBlock text blocks from earlier phases; candidate for Phase 4D
- `/knowledge-system/bridges/*` — Category Reframing pages; out of scope for Phase 4C
- `/knowledge-system/compare/*` — Comparison pages; out of scope for Phase 4C
- `/knowledge-system/fleet/*` — Fleet Optimization pages; out of scope for Phase 4C
- `/knowledge-system/science/` — Technical Library; out of scope for Phase 4C

---

## Implementation Notes

**Browser-Safe Pattern**: All `'use client'` pages use inline static `PAGE_JSONLD` constants computed via `JSON.stringify()` at module level. The `citation-jsonld.ts` utility (which uses Node.js `fs`) is NOT imported in client components — entity data was copied directly from `CITATION_INDEX.json` into each page.

**Import Order**: All `PAGE_JSONLD` constants are placed after ES module `import` statements to comply with TypeScript/ES module spec.

**Injection Point**: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />` is inserted immediately before `</main>`, inside the RetrievalBlock closure.

---

## Next Recommended Step — Phase 4D

**Phase 4D: LLM Retrieval Endpoint (`/api/citation`)**

Create a machine-readable API endpoint at `/knowledge-system/citation/[key]/` (static export) or a server-side `/api/citation?key=ISO_16889` that returns structured JSON for any entity from `CITATION_INDEX.json`. This enables LLMs to resolve citations programmatically by entity key, and provides a canonical URL pattern for AI citation references.

Candidate implementation:
- Static route: `frontend/src/app/knowledge-system/citation/[key]/page.tsx` — generates one page per entity key at build time using `generateStaticParams()`
- Returns machine-readable JSON-LD + plain-text canonical block for each entity
- Enables citation format: `elimfilters.com/knowledge-system/citation/ISO_16889`
