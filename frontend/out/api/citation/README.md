# ELIMFILTERS Citation API — Static Endpoints

This directory contains pre-generated static JSON files serving the ELIMFILTERS
Knowledge Vault citation index. Files are regenerated automatically on every
`npm run build` via the prebuild script.

## Endpoints

| Pattern | File | Description |
|---------|------|-------------|
| `/api/citation/index.json` | index.json | All 60 entity records |
| `/api/citation/[KEY].json` | MACROCORE.json etc | Single entity lookup with _links |
| `/api/citation/graph.json` | graph.json | Full edge list (596 edges) |
| `/api/citation/type/index.json` | type/index.json | All entity types list |
| `/api/citation/type/[type].json` | type/technology.json etc | Type scan |
| `/api/citation/path/index.json` | path/index.json | All path summaries |
| `/api/citation/path/[path_id].json` | path/PATH_A_*.json etc | Path with embedded citation records |
| `/api/citation/path/by-entry/[KEY].json` | path/by-entry/MINING.json etc | Paths by entry node |

## Query Patterns

```
entity_lookup:   /api/citation/[KEY].json
type_scan:       /api/citation/type/[type].json
graph:           /api/citation/graph.json
path_traversal:  /api/citation/path/[path_id].json
paths_by_entry:  /api/citation/path/by-entry/[KEY].json
```

## Source

Generated from:
- `elimfilters-vault/00-meta/CITATION_INDEX.json`
- `elimfilters-vault/00-meta/PART_SEARCH_MAP.json`

Generator: `scripts/generate-citation-api.js`
Last generated: 2026-07-12T15:29:42.691Z
