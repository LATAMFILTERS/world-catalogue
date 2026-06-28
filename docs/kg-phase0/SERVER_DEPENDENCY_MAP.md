# SERVER_DEPENDENCY_MAP.md
# ELIMFILTERS — server.js Endpoint Dependency Map
# KG Phase 0 Readiness Audit

**File**: `/home/user/world-catalogue/server.js`
**Lines**: 2,333
**Generated**: 2026-06-01

---

## CORE HELPER FUNCTIONS

### `buildFilterData(row, lang)` — Line 659
The central response builder. Called by every search endpoint.

**Input columns consumed from DB row:**
```
sku, description, filter_type, sub_type, technology, installation_type,
thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
iso_test_method, micron_rating, nominal_efficiency, burst_pressure_psi,
collapse_pressure_psi, duty, oem_codes (JSONB), competitor_codes (JSONB),
brand_crossrefs (JSONB), alternatives (JSONB), equipment_applications (JSONB)
```

**Output fields returned (API contract):**
```
elimfilters_sku, description, filter_type, filter_subtype, technology,
technology_logo, installation_type, thread_size, height_mm, outer_diameter_mm,
gasket_od_mm, gasket_id_mm, iso_test_method, micron_rating, nominal_efficiency,
burst_pressure_psi, collapse_pressure_psi, duty,
oem_codes[], competitor_codes[], brand_crossrefs{}, alternatives[], equipment_applications[]
```

**Critical logic:**
- `splitRefs()` re-classifies oem_codes + competitor_codes on EVERY response
- `TECH_NAME_FIXES`: corrects 'SYNTAPORE' → 'SYNTEPORE'
- `safeSubtype()`: strips proprietary media names (Synteq XP, Alpha-Web, etc.)
- `extractText()`: handles JSONB `{en: "...", es: "..."}` OR plain string descriptions
- `getTechLogo()`: maps tech name → `/assets/logo-[tech].png`

**KG Impact**: SAFE to enrich. Add new fields (technology_page_url, industries[]) without removing existing ones.

---

### `enrichAlternatives(products, client)` — Line 531
Async. Resolves `alternatives[]` P-codes to EL-SKUs and inherits equipment/crossref data.

**DB query used:**
```sql
SELECT sku, codigo_base, oem_codes, competitor_codes, equipment_applications
FROM elimfilters_catalog WHERE UPPER(codigo_base) = ANY($1)
```

**Inheritance logic:**
- If `alternatives[]` item resolves → push EL-SKU to resolved list
- If parent has no equipment_applications AND alt has them → inherit
- If parent has no competitor_codes AND alt has them → inherit via splitRefs()

**KG Impact**: When KG has kg_product_equipment, this function should also update those normalized tables.

---

### `splitRefs(arr)` — Line 576
Classifies refs array into `{oem[], competitor[]}` using `COMPETITOR_BRANDS` Set.

**COMPETITOR_BRANDS Set** (lines 493–507): 60+ brands including:
- DONALDSON, BALDWIN, FLEETGUARD, MANN, MANN+HUMMEL, WIX, FRAM, PUROLATOR
- BOSCH, MAHLE, HENGST, SAKURA, PARKER, PALL, HYDAC, MP FILTRI, UFI
- MOTORCRAFT, KNECHT, SOGEFI, FILTRON, SOFIMA, CHAMPION LABS
- CASTROL, MOBIL, SHELL (oil brands — edge case)
- ATLAS COPCO, SULLAIR, INGERSOLL RAND, COMPAIR (compressor brands)

**Fallback rule:** Any manufacturer containing 'FILTER'/'FILTR'/'FILTRO' → competitor.

**KG Impact**: `kg_filter_brands` table must be seeded from this Set. The Set is the authoritative source until KG normalizes it.

---

### `detectLang(req)` — Line 587
Reads `?lang=` param or `Accept-Language` header. Returns 'es' or 'en'.

---

### `extractText(val, lang)` — Line 611
Handles both plain string AND `{en: "...", es: "..."}` JSONB for `description` and `filter_type`.

**KG Impact**: `description` column is MIXED FORMAT. Some rows have `{"en": "...", "es": "..."}`, others have plain text.

---

## PRODUCTION SEARCH ENDPOINTS

### `GET /api/search` — Line 2073
**Primary Part Search endpoint.**

| Attribute | Value |
|-----------|-------|
| Auth | None (public) |
| Query params | `q` (required), `lang` |
| Table | elimfilters_catalog |
| Response | `{products[], count, total_catalog}` |
| Migration Risk | 🔴 CRITICAL — directly feeds Part Search UI |

**6-Tier Search Logic:**
1. `UPPER(sku) = $1 OR UPPER(codigo_base) = $1` → match_type 'sku'
2. `UPPER(sku) LIKE $1+'%' OR UPPER(codigo_base) LIKE $1+'%'` → match_type 'sku_prefix'
3. `oem_codes jsonb exact match` OR `competitor_codes jsonb exact match` → match_type 'ref'
4. — (merged with tier 3)
5. `brand_crossrefs jsonb exact` → match_type 'crossref'
6. Broad partial: `sku LIKE '%$1%' OR codigo_base LIKE '%$1%' OR oem_elem LIKE '%$1%'` → match_type 'sku_partial'/'partial'

**Additional output fields:**
- `match_type: 'sku'|'sku_prefix'|'sku_partial'|'ref'|'competitor'|'crossref'|'partial'`
- `match_label: string|null` — from `buildMatchLabel()` (line 2159)
- `total_catalog: int` — dynamic COUNT(*) every request

**Calls:** `buildFilterData()`, `enrichAlternatives()`, `buildMatchLabel()`

---

### `GET /api/filters/search/part` — Line 1125
**Part-search VIN app endpoint (legacy/parallel).**

| Attribute | Value |
|-----------|-------|
| Auth | None (public) |
| Query params | `code`, `lang` |
| Table | elimfilters_catalog |
| Response | `{success, filters[]}` |
| Migration Risk | 🔴 CRITICAL |

**Search order:**
1. `WHERE codigo_base = $1`
2. `WHERE sku = $1`
3. JSONB exact match on oem_codes OR competitor_codes (code/partNumber/string format)

---

### `GET /api/filters/search/vin` — Line 1185
**Search by vehicle/equipment model.**

| Attribute | Value |
|-----------|-------|
| Auth | None (public) |
| Query params | `model`, `engine` (optional), `lang` |
| Table | elimfilters_catalog |
| Response | `{success, filters[]}` |
| Migration Risk | 🔴 CRITICAL |

**Query:** Searches `equipment_applications` JSONB array for model matches (ILIKE).
**Calls:** `buildFilterData()`, `enrichAlternatives()`

---

### `GET /api/filters/search/equipment` — Line 1222
**Search by equipment type.**

| Attribute | Value |
|-----------|-------|
| Auth | None (public) |
| Query params | `model`, `lang` |
| Table | elimfilters_catalog |
| Response | `{success, filters[]}` |
| Migration Risk | 🔴 CRITICAL |

**Calls:** `buildFilterData()`, `enrichAlternatives()`

---

### `GET /api/filters/search/homologous` — Line 1265
**Fetch single product by SKU (exact).**

| Attribute | Value |
|-----------|-------|
| Auth | None (public) |
| Query params | `code`, `lang` |
| Response | `{success, filters[]}` |
| Migration Risk | 🟡 MEDIUM |

---

### `GET /api/autocomplete` — Line 2009
**Search-as-you-type suggestions.**

| Attribute | Value |
|-----------|-------|
| Auth | None (public) |
| Query params | `q` (min 3 chars) |
| Response | `[{text, type}]` max 8 items |
| Migration Risk | 🟡 MEDIUM |

**DB query:** Searches sku, oem_codes::text, competitor_codes::text.
**Returns:** `{text: "EL82100", type: "ELIMFILTERS SKU"}` or `{text: "P552100", type: "Ref (DONALDSON)"}`

---

## SUPPLEMENTARY PUBLIC ENDPOINTS

### `GET /api/filters/alternatives` — Line 1086
Returns algorithmically similar products (by filter_type + sub_type + dimensions).
**Auth:** None. **Risk:** 🟢 LOW — returns only `{sku, name}`.

### `GET /api/filters/kits` — Line 1046
Returns kits containing a filter SKU.
**Auth:** None. **Risk:** 🟢 LOW — reads `maintenance_kits` + `kit_components`.

### `GET /api/kits/:kit_sku` — Line 1006
Fetch a specific maintenance kit.
**Auth:** None. **Risk:** 🟢 LOW.

### `GET /api/stats` — Line 2207
Returns `{total, technologies, timestamp}`.
**Auth:** None. **Risk:** 🟢 LOW.

### `GET /api/status` — Lines 15, 1969
Health check. `{status: 'ok', version: '3.8.0'}`.
**Auth:** None. **Risk:** 🟢 NONE.

### `POST /api/contact` — Line 427
Email form. No DB interaction.
**Auth:** None. **Risk:** 🟢 NONE.

### `GET /api/debug/inspect-codes/:sku` — Line 702
Returns oem_codes and competitor_codes for a SKU.
**Auth:** None. **Risk:** 🟢 LOW — no internal fields.

### `GET /api/debug/find-code/:code` — Line 719
Finds products matching a code string.
**Auth:** None. **Risk:** 🟢 LOW (fixed — codigo_base removed from response).

---

## ADMIN ENDPOINTS (key: elim2026admin)

### `GET /api/admin/filter-type-check` — Line 18
Returns `filter_type, sub_type, installation_type` group counts.
**DB:** SELECT filter_type, sub_type, installation_type, COUNT(*).

### `GET /api/admin/update-lube-descriptions` — Line 36
Batch-updates `description` for all lube filter variants.
**Writes to DB.** Risk: 🔴 HIGH if run again (overwrites descriptions).

### `GET /api/admin/suspects-equipment` — Line 1634
Returns products with ≤N equipment entries (feed for scraper).
**Columns returned:** sku, codigo_base, filter_type, equip_count.

---

## INTERNAL ADMIN ENDPOINTS (key: elim2026)

| Endpoint | Line | Action | Risk |
|----------|------|--------|------|
| `/api/analyze/sku-correctness` | 743 | Computes expected SKU from codigo_base | READ |
| `/api/analyze/duplicate-skus-with-fix` | 808 | Finds dupes + fix plan | READ |
| `/api/analyze/duplicate-skus` | 870 | Finds dupes | READ |
| `/api/analyze/codigo-base-prefixes` | 1386 | Group codigo_base by prefix | READ |
| `/api/catalog/stats` | 1495 | Full completeness stats | READ |
| `/api/catalog/export` | 1980 | CSV export with codigo_base | READ |
| `/api/audit/incomplete-products` | 1601 | Lists incomplete products with codigo_base | READ |
| `/api/audit/report` | 2229 | Full catalog audit report | READ |
| `/api/pending-donaldson` | 1671 | Products needing scrape (with codigo_base) | READ |
| `/api/recheck-donaldson` | 1804 | Scraped products missing refs/equip | READ |
| `/api/import/existing-skus` | 1840 | All SKUs list | READ |
| `/api/migrate/consolidate-skus-preview` | 1289 | Preview dup consolidation | READ |
| `/api/migrate/consolidate-skus-apply` | 1329 | Apply consolidation | **WRITE** |
| `/api/migrate/merge-el82100-sql` | 1463 | Merge specific product | **WRITE** |
| `/api/migrate/merge-oem-codes` | 1542 | Merge OEM codes | **WRITE** |
| `/api/migrate/consolidate-oem-codes` | 1566 | Move competitor_codes → oem_codes | **WRITE** |
| `/api/migrate/fix-sku-unique` | 891 | Adds UNIQUE constraint | **DDL** |
| `/api/migrate/create-kit-tables` | 922 | Creates kit tables | **DDL** |
| `/api/migrate/add-alternative-codes-column` | 1412 | Adds column | **DDL** |
| `/api/migrate/fix-sku-constraint` | 1929 | Updates SKU CHECK constraint | **DDL** |
| `/api/migrate/reset-catalog` | 1946 | TRUNCATES catalog | **🔴 DESTRUCTIVE** |
| `/api/migrate/init-db` | 1865 | Creates tables, view, constraints | **DDL** |
| `/api/migrate/scrape-crossreferences` | 1663 | Legacy marker endpoint | READ |

---

## DATA IMPORT ENDPOINTS (key: elim2026)

| Endpoint | Line | Action |
|----------|------|--------|
| `POST /api/import/donaldson` | 1708 | Upserts batch of products from scraper |
| `GET /api/recheck-donaldson` | 1804 | Returns recheck queue |
| `POST /api/kits` | 956 | Creates maintenance kit |

### `/api/import/donaldson` Detail
Main import endpoint used by Python scrapers.
**Upsert columns:** sku, codigo_base, description, filter_type, sub_type, technology, installation_type, thread_size, outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm, iso_test_method, micron_rating, nominal_efficiency, burst_pressure_psi, collapse_pressure_psi, duty, oem_codes, competitor_codes, equipment_applications, brand_crossrefs, alternatives.

**COALESCE strategy:** Never overwrites existing non-null values with NULL. Appends JSONB arrays.

---

## KNOWLEDGE API (routes/knowledge.routes.js)

File **does not exist** in repository (`routes/` directory missing).
Server loads a dummy fallback router returning `{status: 'knowledge-api-unavailable'}`.
**KG Phase 1 will create this file.**

---

## DATABASE TABLES IN USE

| Table | Used By |
|-------|---------|
| `elimfilters_catalog` | All search, import, audit, migration endpoints |
| `maintenance_kits` | `/api/kits`, `/api/filters/kits` |
| `kit_components` | `/api/kits`, `/api/filters/kits`, `/api/search/rav4-kit-skus` |
| `filters` (VIEW) | Created by `init-db`, never queried by production endpoints |

---

## KG MIGRATION RISK SUMMARY

| Risk Level | Endpoints | Notes |
|-----------|-----------|-------|
| 🔴 CRITICAL | `/api/search`, `/api/filters/search/*`, `/api/autocomplete` | Cannot break response contract |
| 🟡 MEDIUM | `/api/filters/alternatives`, `/api/kits/*` | Can be enhanced after KG |
| 🟢 LOW | All admin/audit/migrate endpoints | Internal use only |
| 🟢 NONE | `/api/status`, `/api/contact` | No DB interaction |

**Zero-risk KG integration rule:** New kg_* tables + new API endpoints under `/api/kg/*`. Never modify `buildFilterData()` response shape until KG is fully verified and VIN/equipment endpoints also tested.
