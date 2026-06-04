# ELIMFILTERS® Knowledge Ecosystem V1 — Archive
## Permanent Record · Declared Complete 2026-06-03

---

## What This Archive Is

This is the permanent preservation package for **ELIMFILTERS Knowledge Ecosystem Version 1** — a machine-readable industrial knowledge platform built to make ELIMFILTERS® technical definitions citable by AI systems, searchable by buyers, and authoritative for distributors.

The ecosystem was declared complete on 2026-06-03. This archive captures the exact state of all components at that point in time.

---

## Quick Reference

| Item | Value |
|------|-------|
| Entities in knowledge graph | 45 |
| Directed relationships | 505 |
| Traversal paths (valid) | 97/99 |
| Static API files | 195 |
| Knowledge System pages | 30 |
| Overall maturity score | 90/100 |
| Production readiness | 96/100 |
| Build status | ✓ 0 errors |
| Declaration | **A — V1 Complete** |

---

## Directory Map

```
ELIMFILTERS_KNOWLEDGE_ECOSYSTEM_V1_ARCHIVE/
│
├── README_ARCHIVE.md          ← YOU ARE HERE
├── V1_OWNER_GUIDE.md          ← Plain-language guide for non-technical owners
│
├── V1_FINAL/                  Official V1 closure documents (start here)
│   ├── KNOWLEDGE_ECOSYSTEM_V1_FINAL_DECLARATION.md  ← official declaration
│   ├── KNOWLEDGE_ECOSYSTEM_V1_CLOSURE.md            ← executive review
│   ├── KNOWLEDGE_ECOSYSTEM_V1_ARCHIVE_PLAN.md       ← archive blueprint
│   ├── PHASE5_COMPLETION_REVIEW.md
│   └── PHASE4_FINAL_REVIEW.md
│
├── PHASE_REPORTS/             Development history (Phase 3–5)
├── ARCHITECTURE/              Design decisions and technical conventions
├── BUSINESS/                  Commercial strategy documents
│
├── VAULT/                     ← The knowledge graph (open in Obsidian)
│   ├── 00-meta/               Index and schema reference + compiled JSON
│   ├── 01-technologies/       7 proprietary technology definitions
│   ├── 02-industries/         11 industry vertical profiles
│   ├── 03-systems/            1 product system
│   ├── 04-standards/          9 industrial standards
│   ├── 05-contamination/      4 contamination mode definitions
│   ├── 06-components/         3 mechanical component definitions
│   ├── 07-problems/           5 industry problem nodes
│   └── 08-product-families/   5 product family definitions
│
├── COMPILED/                  ← Generated artifacts (no tooling required to read)
│   ├── citation-index/        CITATION_INDEX.json + PART_SEARCH_MAP.json
│   │                          (both minified and human-readable pretty versions)
│   └── citation-api/          195 static JSON files (all API endpoints)
│
├── SCRIPTS/                   ← 4 core pipeline scripts (Node.js, no dependencies)
│   ├── build-citation-index.js
│   ├── build-part-search-map.js
│   ├── generate-citation-api.js
│   └── sync-jsonld-constants.js
│
├── KNOWLEDGE_SYSTEM/          30 Knowledge System page source files (React/TSX)
└── METRICS/                   Point-in-time metrics snapshot (JSON + Markdown)
```

---

## How to Use This Archive

### To look up an entity definition
Open `COMPILED/citation-api/[KEY].json` — for example, `COMPILED/citation-api/MACROCORE.json`.
No server or tooling required. Any text editor or JSON viewer works.

### To browse the knowledge graph
Open the `VAULT/` directory in [Obsidian](https://obsidian.md). The graph view shows all 45 entities and their 505 relationships.

### To query all traversal paths for an industry
Open `COMPILED/citation-api/path/by-entry/[INDUSTRY_KEY].json` — for example, `path/by-entry/MINING.json`.

### To see all entities by type
Open `COMPILED/citation-api/type/[type].json` — for example, `type/technology.json`.

### To rebuild the compiled outputs from the vault
Requires Node.js. Run from the archive root:
```bash
node SCRIPTS/build-citation-index.js
node SCRIPTS/build-part-search-map.js
node SCRIPTS/generate-citation-api.js
```

### To read the official declaration
Open `V1_FINAL/KNOWLEDGE_ECOSYSTEM_V1_FINAL_DECLARATION.md`.

---

## What Should Not Be Modified

- `VAULT/` entity notes — canonical definitions, once declared, are versioned. Any change must increment the `version` field and update `last_updated`.
- `COMPILED/` — these are generated files. Do not edit them manually; regenerate with the scripts.
- `ARCHIVE_MANIFEST.md` — integrity record for this archive.

---

## Archive Integrity

SHA-256 checksums for the two primary compiled indexes are in `METRICS/ARCHIVE_CHECKSUM.txt`.

To verify: recalculate `sha256sum COMPILED/citation-index/CITATION_INDEX.json` and compare against the checksum file.

---

*Archive generated: 2026-06-03 · Branch: claude/dazzling-franklin-ALGY1*
