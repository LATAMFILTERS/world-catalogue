# V1 Metrics Snapshot
## ELIMFILTERS Knowledge Ecosystem — Point-in-Time Record
**Declared complete:** 2026-06-03

---

## Knowledge Graph

| Metric | Value |
|--------|-------|
| Total entity notes | **45** |
| Directed relationships (edges) | **505** |
| Entity resolution ratio | **1.0** (no dangling links) |
| Compilation errors | **0** |
| Compilation warnings | 9 (pre-existing W005, non-vault references) |

### Entities by Type

| Type | Count |
|------|-------|
| technology | 7 |
| industry | 11 |
| standard | 9 |
| contamination-mode | 4 |
| problem | 5 |
| product-family | 5 |
| component | 3 |
| system | 1 |
| **Total** | **45** |

---

## Traversal Paths

| Metric | Value |
|--------|-------|
| Total paths built | 99 |
| Valid paths | **97** |
| Invalid paths | 2 (pre-existing: INTEKCORE, SYNTEPORE without own ProductFamily) |

### Paths by Type

| Path Type | Count | Valid |
|-----------|-------|-------|
| Type A — Problem → ProductFamily | 12 | 12 |
| Type B — Industry → ProductFamily | 80 | 80 |
| Type C — Technology → ProductFamily | 7 | 5 |

### Coverage

| Coverage Target | Result |
|----------------|--------|
| ProductFamilies reachable from Problem | **5/5** |
| Technologies reachable from Problem | **7/7** |
| Industries with ≥2 common_problems | **11/11** |

---

## Static Citation API

| Metric | Value |
|--------|-------|
| Static JSON files | **195** |
| Endpoint patterns | 5 |
| Entity files | 45 |
| Type index files | 8 |
| Path files | ~142 |

---

## Knowledge System Pages

| Metric | Value |
|--------|-------|
| React/TSX page files | **30** |
| Build status | ✓ 0 errors |
| Static HTML pages (full site) | 89 |

---

## Build & Validation

| Check | Result |
|-------|--------|
| `validate:vault` | ✓ PASS |
| `validate:map` | ✓ PASS |
| `validate:citation-api` | ✓ PASS |
| Next.js build | ✓ 0 errors |

---

## Maturity Scores

| Score | Value |
|-------|-------|
| Overall maturity | **90/100** |
| Production readiness | **96/100** |
| Structural completeness | **97/99** valid paths |

---

## Phase History

| Phase | Key Milestone | Entities | Edges |
|-------|--------------|----------|-------|
| Phase 3 | Vault foundation, 7 technologies | ~20 | ~100 |
| Phase 4 | Citation index, standards, Part Search Map | 41 | 385 |
| Phase 5 | Problem nodes, full traversal coverage | **45** | **505** |

---

*Snapshot generated: 2026-06-03 · Archive: ELIMFILTERS Knowledge Ecosystem V1*
