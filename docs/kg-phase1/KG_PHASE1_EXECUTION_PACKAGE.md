# KG_PHASE1_EXECUTION_PACKAGE.md
# ELIMFILTERS — KG Phase 1 Complete Execution Package
# Industrial Knowledge Graph — Schema + Migration + Validation

**Date prepared:** 2026-06-01  
**Branch:** claude/create-elimfilters-manuals-iFz1q  
**Status:** READY FOR EXECUTION — awaiting Render Shell access  
**Estimated execution time:** 20–30 minutes

---

## 1. SCOPE

Phase 1 creates 4 tables forming the KG foundation:

| Table | Type | Rows |
|-------|------|------|
| `kg_systems` | Semantic node | 6 |
| `kg_technologies` | Semantic node | 13 |
| `kg_product_systems` | Join / edge | 4,622 |
| `kg_product_technologies` | Join / edge | 4,622 |

**Scope boundary:**
- ✅ Creates new tables
- ✅ Seeds reference data
- ✅ Maps all products to systems and technologies
- ❌ Does NOT modify `elimfilters_catalog` (zero risk)
- ❌ Does NOT change any API response
- ❌ Does NOT touch Part Search frontend
- ❌ Does NOT involve equipment data (Phase 4)
- ❌ Does NOT involve cross-references (Phase 5)
- ❌ Does NOT involve embeddings (Phase 6)

---

## 2. SCHEMA DEFINITIONS

### 2.1 `kg_systems` — 6 system domains

```sql
CREATE TABLE IF NOT EXISTS kg_systems (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(50)  NOT NULL UNIQUE,   -- 'air-intake', 'fuel', etc.
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order  SMALLINT     NOT NULL DEFAULT 99,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**Seed data (6 rows):**
| slug | name |
|------|------|
| air-intake | Air Intake Filtration |
| fuel | Fuel Filtration |
| hydraulic | Hydraulic Systems |
| lube-oil | Lube / Oil Filtration |
| cabin | Cabin / Operator Safety |
| compressed-air | Compressed Air Systems |

---

### 2.2 `kg_technologies` — 13 technologies

```sql
CREATE TABLE IF NOT EXISTS kg_technologies (
  id                SERIAL PRIMARY KEY,
  slug              VARCHAR(50)  NOT NULL UNIQUE,
  display_name      VARCHAR(100) NOT NULL,
  primary_system_id INTEGER      REFERENCES kg_systems(id) ON DELETE SET NULL,
  category          VARCHAR(100),
  description       TEXT,
  logo_file         VARCHAR(100),
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**Seed data (13 rows) — with confirmed categorizations:**
| slug | display_name | primary_system | logo_file | DB count |
|------|-------------|----------------|-----------|----------|
| macrocore | MACROCORE™ | air-intake | logo-macrocore.png | 1,366 |
| intekcore | INTEKCORE™ | air-intake | logo-intekcore.png | 243 |
| drycore | DRYCORE™ | compressed-air | logo-drycore.png | 3 |
| gasultra | GASULTRA™ | compressed-air | logo-gasultra.png | 0 |
| syntrax | SYNTRAX™ | **lube-oil** ← CORRECTED | logo-sintrax.png | 351 |
| duratech | DURATECH™ | lube-oil | logo-duratech.png | 0 |
| cooltech | COOLTECH™ | lube-oil | logo-cooltech.png | 59 |
| marineclean | MARINECLEAN™ | lube-oil | logo-marineclean.png | 0 |
| blueclean | BLUECLEAN™ | lube-oil | logo-blueclean.png | 0 |
| nanoforce | NANOFORCE™ | hydraulic | logo-nanoforce.png | 1,962 |
| aquaguard | AQUAGUARD™ | fuel | logo-aquaguard.png | 16 |
| syntepore | SYNTEPORE™ | fuel | logo-syntepore.png | 500 |
| microkappa | MICROKAPPA™ | **cabin** ← CORRECTED | logo-microkappa.png | 122 |

---

### 2.3 `kg_product_systems` — 4,622 rows

```sql
CREATE TABLE IF NOT EXISTS kg_product_systems (
  id          SERIAL PRIMARY KEY,
  product_sku VARCHAR(50) NOT NULL,
  system_id   INTEGER     NOT NULL REFERENCES kg_systems(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_system UNIQUE (product_sku, system_id)
);
```

**Migration source:** `elimfilters_catalog.filter_type`  
**Mapping:** lowercase filter_type value → system slug

| DB filter_type | → kg_systems.slug | count |
|---------------|-------------------|-------|
| air | air-intake | 1,366 |
| air-intake | air-intake | 243 |
| air-dryer | compressed-air | 3 |
| fuel | fuel | 500 |
| turbine | fuel | 16 |
| hydraulic | hydraulic | 1,962 |
| lube | lube-oil | 351 |
| coolant | lube-oil | 59 |
| cabin | cabin | 122 |

---

### 2.4 `kg_product_technologies` — 4,622 rows

```sql
CREATE TABLE IF NOT EXISTS kg_product_technologies (
  id            SERIAL PRIMARY KEY,
  product_sku   VARCHAR(50) NOT NULL,
  technology_id INTEGER     NOT NULL REFERENCES kg_technologies(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_technology UNIQUE (product_sku, technology_id)
);
```

**Migration source:** `elimfilters_catalog.technology`  
**Normalization:** deprecated names mapped to canonical slugs

| DB technology | → kg_technologies.slug | count |
|--------------|------------------------|-------|
| NANOFORCE™ | nanoforce | 1,962 |
| MACROCORE™ | macrocore | 1,366 |
| SYNTAPORE™ | **syntepore** ← renamed | 500 |
| SYNTRAX™ | syntrax | 351 |
| INTAKCORE™ | **intekcore** ← corrected | 243 |
| MICROKAPPA™ | microkappa | 122 |
| COOLTECH™ | cooltech | 59 |
| AQUAGUARD™ | aquaguard | 16 |
| DRYCORE™ | drycore | 3 |

---

## 3. MIGRATION SCRIPTS

All scripts in `migrations/kg-phase1/`:

```
001_schema.sql                   — CREATE TABLE statements (idempotent)
002_seed_systems.sql             — INSERT 6 systems
003_seed_technologies.sql        — INSERT 13 technologies
004_populate_product_systems.sql — Populate 4,622 system assignments
005_populate_product_technologies.sql — Populate 4,622 technology assignments
validate.sql                     — Full validation suite (run after 001-005)
rollback.sql                     — DROP all Phase 1 tables (reversible)
```

**Execution order is mandatory** — scripts have dependencies.

---

## 4. IMPLEMENTATION SEQUENCE

```
┌─────────────────────────────────────────────────────────┐
│ PRE-EXECUTION                                           │
│   Run verification queries (PHASE1_RENDER_CHECKLIST.md) │
│   Confirm: 4622 products, 9 tech values, 9 filter types │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 1: 001_schema.sql                                  │
│   Creates: kg_systems, kg_technologies,                 │
│            kg_product_systems, kg_product_technologies  │
│   + Indexes + Triggers                                  │
│   Time: ~5 seconds                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: 002_seed_systems.sql                            │
│   Inserts: 6 system domain rows                        │
│   Time: <1 second                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: 003_seed_technologies.sql                       │
│   Inserts: 13 technology rows with correct categories   │
│   Requires: kg_systems.id for FK references             │
│   Time: <1 second                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: 004_populate_product_systems.sql                │
│   Inserts: 4,622 rows into kg_product_systems           │
│   Source: elimfilters_catalog.filter_type               │
│   Time: ~10-30 seconds (bulk insert)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: 005_populate_product_technologies.sql           │
│   Inserts: 4,622 rows into kg_product_technologies      │
│   Source: elimfilters_catalog.technology                │
│   Applies: SYNTAPORE→syntepore, INTAKCORE→intekcore     │
│   Time: ~10-30 seconds (bulk insert)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ VALIDATION: validate.sql                                │
│   Runs: 20 integrity and coverage checks                │
│   Pass criteria: 0 unmapped, 4622 counts, correct cats  │
│   Time: ~5-10 seconds                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
              Phase 1 COMPLETE ✅
              Ready for Phase 2 (contamination modes,
              standards, industries, canonical blocks)
```

---

## 5. SUCCESS CRITERIA

Phase 1 is successful when ALL of the following are true:

### Coverage (Quantitative)
- [ ] `SELECT COUNT(*) FROM kg_product_systems` = 4,622
- [ ] `SELECT COUNT(*) FROM kg_product_technologies` = 4,622
- [ ] `SELECT COUNT(*) FROM kg_systems` = 6
- [ ] `SELECT COUNT(*) FROM kg_technologies` = 13

### Data Integrity
- [ ] Zero products unmapped from systems (`D3` in validate.sql = 0)
- [ ] Zero products unmapped from technologies (`C3` in validate.sql = 0)
- [ ] Zero orphan records (`E4` in validate.sql = 0)
- [ ] Zero technology/system consistency violations (`E1` in validate.sql = 0)

### Correctness (Critical Category Corrections)
- [ ] `kg_technologies WHERE slug='microkappa'` → category = `'Cabin Air Filtration'`
- [ ] `kg_technologies WHERE slug='syntrax'` → primary_system = `'lube-oil'`
- [ ] `kg_technologies WHERE slug='nanoforce'` → primary_system = `'hydraulic'`

### Non-Regression (No Impact to Existing System)
- [ ] `SELECT COUNT(*) FROM elimfilters_catalog` = 4,622 (unchanged)
- [ ] All existing API endpoints return same responses as before Phase 1
- [ ] Part Search frontend renders identical results

---

## 6. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| New filter_type values since audit | LOW | MEDIUM | Check 1.2 in checklist — add mapping if found |
| New technology values since audit | LOW | MEDIUM | Check 1.1 in checklist — add normalization if found |
| DB connection timeout | MEDIUM | BLOCKING | Retry with exponential backoff; scripts are idempotent |
| Partial execution (connection drop mid-script) | LOW | LOW | All scripts are idempotent — safe to re-run |
| Wrong category seeded for MICROKAPPA/SYNTRAX | IMPOSSIBLE | HIGH | Explicit seed values with ON CONFLICT DO UPDATE |
| elimfilters_catalog modified | NEAR ZERO | LOW | Phase 1 only reads catalog, never writes to it |
| Railway PostgreSQL plan limits | LOW | MEDIUM | Storage estimate: ~3 MB for Phase 1 (well under limits) |

---

## 7. STORAGE ESTIMATE

| Table | Rows | Avg row size | Total |
|-------|------|-------------|-------|
| kg_systems | 6 | ~500 bytes | ~3 KB |
| kg_technologies | 13 | ~2 KB | ~26 KB |
| kg_product_systems | 4,622 | ~50 bytes | ~226 KB |
| kg_product_technologies | 4,622 | ~50 bytes | ~226 KB |
| Indexes (estimated) | — | — | ~2 MB |
| **Total Phase 1** | | | **~2.5 MB** |

Railway PostgreSQL free tier limit: 1 GB storage. Phase 1 uses <0.3% of limit.

---

## 8. DATA CORRECTIONS APPLIED

The following corrections from knowledge-architecture.ts errors are baked into Phase 1 seed data:

| Technology | Old (wrong) category | New (correct) category | Source |
|-----------|---------------------|----------------------|--------|
| MICROKAPPA | "Coolant & Specialty Filtration" | "Cabin Air Filtration" | DB + server.js TECH_LOGO_MAP |
| SYNTRAX | "Synthetic Fluid Technology" (hydraulic) | "Lube / Engine Oil Filtration" | DB filter_type=lube, TECH_LOGO_MAP |
| NANOFORCE | (partially correct) | "Hydraulic Filtration" | DB filter_type=hydraulic |

Additionally, deprecated names are normalized (never stored in KG):
| DB name | KG slug | Notes |
|---------|---------|-------|
| SYNTAPORE™ | syntepore | Deprecated — replaced by SYNTEPORE |
| INTAKCORE™ | intekcore | DB typo — canonical is INTEKCORE |
| SINTRAX™ | syntrax | Alias — canonical is SYNTRAX |

---

## 9. RELATIONSHIP TO FUTURE PHASES

```
Phase 1 (this)          — kg_systems, kg_technologies, product joins
    ↓ provides
Phase 2 (next)          — kg_contamination_modes, kg_standards, kg_industries
                          kg_canonical_blocks (AI citation layer)
    ↓ provides
Phase 3 (product links) — More product joins: kg_product_industries
    ↓ provides
Phase 4 (equipment)     — kg_equipment_makes, kg_equipment_models,
                          kg_product_equipment
    ↓ provides
Phase 5 (cross-refs)    — Normalized oem_codes → kg_product_crossrefs
    ↓ provides
Phase 6 (embeddings)    — Vector search (conditional on pgvector)
    ↓ provides
Phase 7 (API)           — routes/knowledge.routes.js
    ↓ provides
Phase 8 (integration)   — knowledge-architecture.ts → KG API client
```

Phase 1 is the foundation. Phases 2–8 depend on Phase 1 being complete and correct.

---

## 10. FILES IN THIS PACKAGE

```
migrations/kg-phase1/
├── 001_schema.sql                    CREATE TABLE statements
├── 002_seed_systems.sql              6 system domains
├── 003_seed_technologies.sql         13 technologies + corrections
├── 004_populate_product_systems.sql  4,622 system assignments
├── 005_populate_product_technologies.sql  4,622 tech assignments
├── validate.sql                      20 validation checks
└── rollback.sql                      Full rollback + partial options

docs/kg-phase1/
├── PHASE1_RENDER_CHECKLIST.md        Step-by-step execution guide
└── KG_PHASE1_EXECUTION_PACKAGE.md    This document
```
