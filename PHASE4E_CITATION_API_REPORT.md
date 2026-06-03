# Phase 4E — Static Citation API Report

**Date**: 2026-06-03  
**Status**: Complete  
**Approach**: Static JSON files in `frontend/public/api/citation/` — Next.js static export copies `public/` to `out/` on every build, making all files available at `/api/citation/` in the deployed site with no server runtime.

---

## Files Generated

| Category | Count | Example path |
|----------|-------|-------------|
| Entity files | 41 | `/api/citation/MACROCORE.json` |
| Type scan files | 8 | `/api/citation/type/technology.json` |
| Type index | 1 | `/api/citation/type/index.json` |
| Path files | 19 | `/api/citation/path/PATH_A_DUST_INGESTION_001.json` |
| Path by-entry files | 11 | `/api/citation/path/by-entry/MINING.json` |
| Graph | 1 | `/api/citation/graph.json` |
| Index | 1 | `/api/citation/index.json` |
| README | 1 | `/api/citation/README.md` |
| **Total JSON** | **83** | |

---

## Endpoint Structure

### 5 Query Patterns

| Pattern | URL | Response shape |
|---------|-----|----------------|
| **Entity lookup** | `/api/citation/[KEY].json` | Full CitationRecord + `_links.related` array derived from graph edges |
| **Type scan** | `/api/citation/type/[type].json` | `{ type, count, entities[] }` — all records of that type |
| **Graph** | `/api/citation/graph.json` | `{ edge_count, node_count, dangling_keys, edges[] }` |
| **Path traversal** | `/api/citation/path/[path_id].json` | Full path with `citation_record` embedded in each step |
| **Paths by entry** | `/api/citation/path/by-entry/[KEY].json` | All path summaries where `entry_node = KEY` |

#### Example URLs

```
/api/citation/MACROCORE.json
/api/citation/type/technology.json
/api/citation/type/index.json
/api/citation/graph.json
/api/citation/path/PATH_A_DUST_INGESTION_001.json
/api/citation/path/index.json
/api/citation/path/by-entry/MINING.json
```

---

## Build Result

Last 10 lines of `npm run build` (clean build, `.next` and `out/` cleared first):

```
└ ○ /warranty                                           2.43 kB         129 kB
+ First Load JS shared by all                           87.3 kB
  ├ chunks/7023-f43b2744ae639b7a.js                     31.7 kB
  ├ chunks/fd9d1056-f8c5d1e71c81c54d.js                 53.6 kB
  └ other shared chunks (total)                         1.96 kB


○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses getStaticProps)
```

Build exit code: **0** — no TypeScript errors, no lint errors.

---

## Validation Results

### Entity files (41/41 OK)
```
Entity files checked: 41 | Missing: 0
```

### Type files (8/8 OK)
```
technology: OK (7 entities)
industry: OK (11 entities)
standard: OK (9 entities)
contamination-mode: OK (4 entities)
system: OK (1 entities)
component: OK (3 entities)
problem: OK (1 entities)
product-family: OK (5 entities)
```

### Path files (19/19 OK)
```
Path files: OK=19 MISSING=0
```

### Sample entity structure check (MACROCORE.json)
```
key: MACROCORE
canonical.definition: "Progressive Density Gradient (PDG) multi-layer air intake filtration system..."
_links.related count: 15
```

### Total JSON files in `frontend/out/api/citation/`: **83**

---

## Coverage Statistics

| Metric | Value |
|--------|-------|
| Entity coverage | 41/41 entities |
| Path coverage | 17/19 valid paths (citation records embedded) |
| Type coverage | 8/8 entity types with scan endpoint |
| Graph edges exported | 385 |
| By-entry keys covered | 11 entry nodes |
| Dangling keys noted | 5 (`CABIN`, `DIN_51524`, `FUEL`, `HYDRAULIC`, `OIL`) — listed in `graph.json` |

---

## Validation Scripts Added

Three new commands in `frontend/package.json`:

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run validate:vault` | `node ../scripts/build-citation-index.js --validate` | Validate Citation Index (no write) |
| `npm run validate:map` | `node ../scripts/build-part-search-map.js --validate` | Validate Part Search Map (no write) |
| `npm run validate:citation-api` | `node ../scripts/generate-citation-api.js --validate` | Validate API generator inputs (no write) |

`build-part-search-map.js` updated to support `--validate` flag (no-write dry-run mode).

`build-citation-index.js` already had `--validate` support — no change needed.

Updated `prebuild` script:
```json
"prebuild": "node ../scripts/build-citation-index.js && node ../scripts/sync-jsonld-constants.js && node ../scripts/generate-citation-api.js"
```

---

## Remaining Limitations

- **No runtime query parameters** — only pre-computed paths; no arbitrary traversal at request time
- **No relation-name queries** — cannot query "all nodes related via `addresses_contamination`" without pre-building that index (Phase 4F scope)
- **No full-text search** — searching canonical block text requires a vector/inverted index (Phase 4F scope)
- **Rebuild required for vault changes** — static files reflect vault state at build time; `prebuild` handles this automatically on every `npm run build`
- **11 by-entry files, not 41** — only entry nodes that appear in `PART_SEARCH_MAP.traversal_paths` get a by-entry file; entities with no paths (standards, components, etc.) have no by-entry file by design

---

## Next Recommended Step

**Phase 4F**: Vector sidecar index for fallback similarity search — build a lightweight inverted-index JSON at `/api/citation/search-index.json` containing tokenized canonical definitions, enabling client-side prefix search across all 41 entities without a server runtime.
