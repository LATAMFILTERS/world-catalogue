# KG_READINESS_REPORT.md
# ELIMFILTERS — Knowledge Graph Phase 0 Readiness Report
# Final Synthesis — Go / No-Go Recommendation

**Date:** 2026-06-01
**Audited by:** KG Phase 0 Analysis
**Branch:** main (docs only, no schema changes)

---

## EXECUTIVE SUMMARY

**RECOMMENDATION: ✅ GO — Conditional on 4 pre-Phase-1 actions**

The ELIMFILTERS catalog and codebase are ready for KG Phase 1 (schema creation). The data model is well-understood, the API contract is documented, security issues have been fixed, and migration risks are mapped. Four blocking items must be resolved before writing a single migration line.

---

## 1. CURRENT ARCHITECTURE SUMMARY

### 1.1 Database (Railway PostgreSQL)
- Single table: `elimfilters_catalog` (~4,622 products estimated)
- JSONB columns: `oem_codes`, `competitor_codes`, `equipment_applications`, `alternatives`, `brand_crossrefs`
- All relational data (technology, standards, industries) stored as flat strings
- No normalization of multi-valued fields
- Not accessible from local environment (ETIMEDOUT) — Render Shell only

### 1.2 Application Layer (server.js — 2,333 lines)
- 44 endpoints serving two frontends: World Catalogue + Part Search
- No existing KG API (`routes/knowledge.routes.js` does not exist — line 466-477 returns dummy router)
- `buildFilterData()` (line 659): central response builder — touches every product response
- `enrichAlternatives()` (line 531): resolves alternatives[] P-codes to EL-SKUs
- `splitRefs()` (line 576): re-classifies oem/competitor on every response using COMPETITOR_BRANDS Set
- Security: `codigo_base` leaks fixed (commits 09ffd46e, 8d363ca1)

### 1.3 Frontend (World Catalogue — Next.js 14)
- Knowledge System: 12 static pages (6 standards + 3 contamination + 3 fleet)
- `knowledge-architecture.ts`: static TypeScript data source (6 technologies, known errors)
- All Knowledge System pages currently use hardcoded data — no API connection to DB

### 1.4 Frontend (Part Search — Static HTML)
- `index.html` + `results.html`: consume 3 API endpoints
- API contract fully documented (see API_CONTRACT_REPORT.md)
- Zero tolerance for response format changes

---

## 2. DATA QUALITY SUMMARY

### 2.1 Verified Clean (from code analysis)
| Item | Status |
|------|--------|
| Technology normalization rules | ✅ Ready (SINTRAX→SYNTRAX, SYNTAPORE→SYNTAPORE in code) |
| Filter type vocabulary | ✅ 15 known values + mapping to 6 kg_systems slugs |
| Security (codigo_base) | ✅ Fixed in all public endpoints |
| SKU prefix pattern | ✅ EA1/ED4/EH6/EL8/EM9/ES9/ET9/EC1/EF9/EW7 documented |
| JSONB backward compat | ✅ Multiple format variants handled by parsers |

### 2.2 ⚠️ PENDING — Must Verify on Render Shell

| Query | Why Needed | Blocking Phase |
|-------|-----------|----------------|
| `SELECT technology, COUNT(*) FROM elimfilters_catalog GROUP BY technology` | Exact technology distribution | Phase 2 |
| `SELECT DISTINCT filter_type FROM elimfilters_catalog` | Find edge-case filter_type values | Phase 3 |
| `SELECT filter_type, COUNT(*) FROM elimfilters_catalog GROUP BY filter_type` | Size of each system | Phase 3 |
| `SELECT extname FROM pg_extension WHERE extname = 'vector'` | pgvector available? | Phase 6 |
| `node scripts/audit-catalog.js` | OEM/equipment coverage numbers | Phase 4+5 |
| Equipment JSONB manufacturer extraction query | Normalize makes | Phase 4 |

### 2.3 Known Data Quality Issues

| Issue | Severity | Notes |
|-------|---------|-------|
| MICROKAPPA described wrong in knowledge-architecture.ts | 🔴 CRITICAL | TS says "Coolant" — DB is Cabin Air. KG must use DB. |
| SYNTRAX/NANOFORCE category swap in knowledge-architecture.ts | 🔴 CRITICAL | TS swaps hydraulic/lube. KG must use DB. |
| Only 6 of 13 technologies in knowledge-architecture.ts | 🟡 MEDIUM | KG will add all 13 — TS is client of KG, not source |
| SINTRAX alias for SYNTRAX in DB | 🟡 MEDIUM | Handled in server.js — must apply on KG seed |
| SYNTAPORE deprecated name in DB | 🟡 MEDIUM | Map to SYNTAPORE on seed |
| Equipment applications ~50% populated | 🟡 MEDIUM | scrape_equipment.py run in progress |
| filter_type = NULL for some products | 🟢 LOW | Products won't get kg_systems assignment |
| JSONB format inconsistency (4 variants) | 🟡 MEDIUM | Parsers handle all variants |

---

## 3. JSONB COMPLEXITY ASSESSMENT

### 3.1 Column Risk Matrix

| Column | Variants | Migration Risk | Strategy |
|--------|---------|---------------|---------|
| `oem_codes` | 4 formats (see OEM_JSONB_AUDIT.md) | 🔴 HIGH | Use server.js parsers as reference |
| `competitor_codes` | 4 formats | 🔴 HIGH | Re-classify via COMPETITOR_BRANDS at seed time |
| `equipment_applications` | Object + string | 🟡 MEDIUM | Use `equipment \|\| model \|\| machine` resolution |
| `alternatives` | Object + string | 🟡 MEDIUM | Use `a.sku \|\| a.code \|\| String(a)` resolution |
| `brand_crossrefs` | Object | 🟢 LOW | Rarely used, low volume |

### 3.2 Format Variants (oem_codes — most complex)

```
Variant A: [{manufacturer:"CUMMINS", code:"P552100"}]    ← preferred
Variant B: [{manufacturer:"CUMMINS", partNumber:"P552100"}] ← partNumber alias
Variant C: ["CUMMINS P552100"]                           ← string, split on space
Variant D: [{brand:"CUMMINS", ref:"P552100"}]            ← brand/ref keys
```

**Migration rule:** Normalize all to Variant A before inserting into `kg_product_crossrefs`.

---

## 4. FRONTEND DEPENDENCY MAP

### 4.1 World Catalogue (Next.js)

| Page | DB Dependency | KG Phase Impact |
|------|-------------|----------------|
| `/knowledge-system/standards/*` | NONE (static TS) | KG Phase 1+ will add API |
| `/knowledge-system/contamination/*` | NONE (static TS) | KG Phase 1+ will add API |
| `/technologies/*` | NONE (static TS) | Will update after KG validated |
| `/industries/*` | NONE (static TS) | Will update after KG validated |
| All other pages | None | No impact |

**Zero DB calls from World Catalogue frontend.** KG changes do NOT risk breaking it.

### 4.2 Part Search (Static HTML)

| Endpoint | Files | Risk of KG migration |
|----------|-------|---------------------|
| `/api/search` | index.html, results.html | 🔴 HIGH — any field rename breaks UI |
| `/api/filters/search/vin` | both | 🔴 HIGH |
| `/api/filters/search/equipment` | both | 🔴 HIGH |
| `/api/autocomplete` | both | 🟡 MEDIUM |

---

## 5. PART SEARCH DEPENDENCY MAP

### 5.1 Immutable Field Names

These field names CANNOT be renamed without simultaneous frontend code update:

```
elimfilters_sku / sku    filter_type           oem_codes
competitor_codes         equipment_applications alternatives
description              filter_subtype         installation_type
duty                     technology             outer_diameter_mm
thread_size              height_mm              gasket_od_mm
gasket_id_mm             nominal_efficiency     micron_rating
iso_test_method          burst_pressure_psi     collapse_pressure_psi
```

### 5.2 Immutable Response Wrappers

```json
{ "products": [...], "count": N, "total_catalog": N }  ← /api/search
{ "filters": [...] }                                     ← /api/filters/search/*
```

### 5.3 Immutable Security Rules

```
NEVER in any response: codigo_base, BASE (internal code), MATCHED_BY
```

---

## 6. MIGRATION RISKS

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Format mismatch in oem_codes JSONB | HIGH | CRITICAL | Dry-run + count verification before production |
| pgvector not available on Railway | MEDIUM | Phase 6 blocker | Verify before Phase 6; have Option D (defer) ready |
| equipment_applications format breaks | MEDIUM | HIGH | Test renderCard() with sample output |
| DB migration locks table | LOW | HIGH | Use `CONCURRENTLY` for indexes; no ALTER on catalog |
| knowledge-architecture.ts out of sync | CERTAIN | LOW | It's already wrong — KG becomes source of truth |
| scrape_equipment.py data missing | HIGH | MEDIUM | ~1,500-2,000 products still pending scrape |
| Slug collisions in kg_technologies | LOW | LOW | UNIQUE constraint on slug catches this |
| SINTRAX vs SYNTRAX duplication | MEDIUM | MEDIUM | Apply COALESCE normalization on seed |

---

## 7. RECOMMENDED EXECUTION ORDER

### PRE-PHASE-1 (Blockers — must complete first)

**Action 1:** Run on Render Shell (30 min)
```sql
-- Technology distribution
SELECT technology, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY technology ORDER BY cnt DESC;

-- Filter type distribution
SELECT filter_type, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY filter_type ORDER BY cnt DESC;

-- JSONB format check
SELECT COUNT(*) FROM elimfilters_catalog WHERE oem_codes::text LIKE '{%';
SELECT COUNT(*) FROM elimfilters_catalog WHERE filter_type IS NULL;

-- pgvector
CREATE EXTENSION IF NOT EXISTS vector;
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

**Action 2:** Run full audit (10 min)
```bash
node scripts/audit-catalog.js  # On Render Shell
```

**Action 3:** Verify technology page URLs exist at elimfilters.com for all 13 technologies.

**Action 4:** Continue scrape_equipment.py until queue is empty (or document current coverage).

---

### KG PHASES (in order, no skipping)

| Phase | Name | Deliverable | Estimated Effort |
|-------|------|------------|-----------------|
| **1** | Core KG Schema | 6 semantic tables created in Railway PostgreSQL | 2-3 hours |
| **2** | Technology + Standards Seed | 13 technologies + 12 standards seeded from audited data | 1-2 hours |
| **3** | Product → Systems + Technologies | kg_product_systems + kg_product_technologies populated | 2-3 hours |
| **4** | Equipment Normalization | kg_equipment_makes + kg_equipment_models + kg_product_equipment | 4-6 hours (includes 2hr manual normalization) |
| **5** | Cross-Reference Normalization | oem_codes/competitor_codes → kg_product_crossrefs (structured) | 3-4 hours |
| **6** | Embeddings (conditional) | pgvector columns + text-embedding-3-small (~4,700 entities) | 2-4 hours (if pgvector available) |
| **7** | KG API Layer | `routes/knowledge.routes.js` — exposes KG via REST | 3-4 hours |
| **8** | World Catalogue Integration | Update knowledge-architecture.ts to call KG API | 2-3 hours |

**Total estimated effort:** 19-29 hours (excluding scraping time)

---

## 8. ESTIMATED EFFORT PER PHASE

### Phase 1 — Core Schema (2-3 hours)
- Create 6 tables: kg_systems, kg_technologies, kg_contamination_modes, kg_standards, kg_industries, kg_pages
- Create 12 join tables
- No data migration yet

### Phase 2 — Seed Reference Data (1-2 hours)
- Seed 13 technologies (with corrected MICROKAPPA + SYNTRAX categories)
- Seed 12+ standards
- Seed 3 contamination modes (with impact_metrics JSONB)
- Seed 7 industries
- Seed 6 systems

### Phase 3 — Product Links (2-3 hours)
- `kg_product_systems` from filter_type mapping (see FILTER_TYPE_MAPPING.md)
- `kg_product_technologies` from technology column (see TECHNOLOGY_AUDIT.md)
- Handle SINTRAX→SYNTRAX and SYNTAPORE→SYNTAPORE normalization

### Phase 4 — Equipment (4-6 hours)
- Extract unique manufacturers from equipment_applications JSONB
- Manual normalization table: ~50-80 raw names → ~30 slugs (2 hours)
- Populate kg_equipment_makes, kg_equipment_models
- Populate kg_product_equipment

### Phase 5 — Cross-References (3-4 hours)
- Parse all oem_codes/competitor_codes JSONB variants
- Normalize to `{manufacturer, code}` format
- Populate kg_product_crossrefs with correct is_oem/is_competitor classification
- Dry-run verification before production

### Phase 6 — Embeddings (2-4 hours, conditional)
- Verify pgvector available (from pre-phase-1 Action 1)
- If available: add embedding columns, generate via OpenAI text-embedding-3-small
- If unavailable: defer, implement Option D (full-text search as interim)

### Phase 7 — KG API (3-4 hours)
- Create `routes/knowledge.routes.js` (currently returns dummy 503)
- Endpoints: `/api/kg/technologies`, `/api/kg/systems`, `/api/kg/contamination`, `/api/kg/standards`
- `/api/kg/product/{sku}/graph` — returns full product knowledge subgraph
- Optional: `/api/kg/semantic-search` if Phase 6 complete

### Phase 8 — World Catalogue Integration (2-3 hours)
- Update `knowledge-architecture.ts` to fetch from KG API instead of static data
- Verify all 6 standards pages, 3 contamination pages, 3 fleet pages render correctly
- No frontend code changes needed (API is internal to knowledge-architecture.ts)

---

## 9. GO / NO-GO RECOMMENDATION

### ✅ GO — with 4 pre-conditions

**Rationale for GO:**
1. All 11 Phase 0 audit deliverables are complete
2. API contract is fully documented — zero-breakage rules are clear
3. JSONB formats are understood — parsers exist as reference
4. Security issues are fixed — no blocking concerns
5. Data model is correct — technology category errors are identified and corrected in KG design
6. Migration risks are mapped — no surprises expected

**Pre-conditions before Phase 1 code:**

| # | Pre-condition | Owner | Est. Time |
|---|--------------|-------|----------|
| 1 | Run DB queries on Render Shell (technology, filter_type, JSONB counts, pgvector) | DevOps / Admin | 30 min |
| 2 | Run `node scripts/audit-catalog.js` on Render Shell | DevOps | 10 min |
| 3 | Confirm technology pages exist at elimfilters.com for all 13 technologies | Frontend | 15 min |
| 4 | Document current scrape_equipment.py coverage (how many products have equipment data) | Data | 5 min |

If all 4 pre-conditions are met → **immediate go-ahead for Phase 1**.

---

## 10. PHASE 0 DELIVERABLES STATUS

| # | File | Status |
|---|------|--------|
| 1 | SERVER_DEPENDENCY_MAP.md | ✅ Complete |
| 2 | OEM_JSONB_AUDIT.md | ✅ Complete |
| 3 | CATALOG_COMPLETENESS_REPORT.md | ✅ Complete |
| 4 | EQUIPMENT_NORMALIZATION_REPORT.md | ✅ Complete |
| 5 | TECHNOLOGY_AUDIT.md | ✅ Complete |
| 6 | FILTER_TYPE_MAPPING.md | ✅ Complete |
| 7 | PGVECTOR_STATUS.md | ✅ Complete |
| 8 | SEMANTIC_MODEL_REPORT.md | ✅ Complete |
| 9 | SEMANTIC_RULES_REPORT.md | ✅ Complete |
| 10 | API_CONTRACT_REPORT.md | ✅ Complete |
| 11 | KG_READINESS_REPORT.md | ✅ Complete (this file) |

**Phase 0 Status: COMPLETE ✅**

---

## APPENDIX — QUICK REFERENCE

### KG Tables to Create in Phase 1

**Semantic node tables (6):**
```sql
kg_systems             -- air-intake, fuel, hydraulic, lube-oil, cabin, compressed-air
kg_technologies        -- 13 technologies with logos and descriptions
kg_contamination_modes -- 3 modes + impact_metrics JSONB
kg_standards           -- 12+ ISO/ASTM/SAE standards
kg_industries          -- 7+ industries with contamination_exposure
kg_pages               -- 12+ knowledge system pages with canonical blocks
```

**Operational join tables (12):**
```sql
kg_product_systems          -- product → system
kg_product_technologies     -- product → technology
kg_product_industries       -- product → industry (derived from equipment)
kg_product_crossrefs        -- normalized oem/competitor codes
kg_product_equipment        -- product → equipment model
kg_equipment_makes          -- normalized manufacturer names
kg_equipment_models         -- normalized model names
kg_technology_systems       -- technology → system
kg_technology_standards     -- technology → standard
kg_contamination_technologies -- contamination mode → resolving technology
kg_system_standards         -- system → applicable standards
kg_canonical_blocks         -- machine-readable definitions for AI citation
```

### Critical KG Rules (Non-Negotiable)

1. `codigo_base` — NEVER in any public API response
2. MICROKAPPA → Cabin Air Filter (NOT Coolant)
3. SYNTRAX → Lube Oil (NOT Hydraulic)
4. NANOFORCE → Hydraulic (NOT Lube Oil)
5. SINTRAX maps to `syntrax` slug
6. SYNTAPORE maps to `SYNTAPORE` slug
7. knowledge-architecture.ts is a KG CLIENT after Phase 8 (not source of truth)
8. DB (`elimfilters_catalog`) is the product source of truth for Phase 3-5
9. All content must follow PROHIBITED/REQUIRED language rules (SEMANTIC_RULES_REPORT.md)
10. Zero-breakage: never rename oem_codes, competitor_codes, products, filters in API responses
