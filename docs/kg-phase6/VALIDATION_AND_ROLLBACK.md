# VALIDATION_AND_ROLLBACK.md
# ELIMFILTERS — KG Phase 6: Validation and Rollback Procedures
# Industrial Knowledge Graph REST API

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q

---

## SECURITY CONSTRAINT REMINDER

Before ANY validation test: confirm `codigo_base`, `BASE`, and `MATCHED BY` are absent
from ALL responses. These fields must never appear in any Phase 6 output.

---

## 1. PRE-DEPLOYMENT CHECKLIST

Before registering Phase 6 routes in server.js, verify:

- [ ] `routes/knowledge.routes.js` passes `node -c` syntax check
- [ ] `grep -n 'codigo_base\|MATCHED BY' routes/knowledge.routes.js` returns zero results
- [ ] All KG Phase 1–4 tables exist (run SQL checks below)
- [ ] Existing `/api/search` endpoint still returns `{products, count, total_catalog}` shape

### Phase dependency verification SQL:

```sql
-- Run on production DB (Render Shell or Railway):
SELECT
  (SELECT COUNT(*) FROM kg_systems)                   AS kg_systems_count,
  (SELECT COUNT(*) FROM kg_technologies)              AS kg_technologies_count,
  (SELECT COUNT(*) FROM kg_product_systems)           AS kg_product_systems_count,
  (SELECT COUNT(*) FROM kg_product_technologies)      AS kg_product_technologies_count,
  (SELECT COUNT(*) FROM kg_equipment_makes)           AS kg_equipment_makes_count,
  (SELECT COUNT(*) FROM kg_equipment_models)          AS kg_equipment_models_count,
  (SELECT COUNT(*) FROM kg_product_equipment)         AS kg_product_equipment_count,
  (SELECT COUNT(*) FROM kg_canonical_blocks)          AS kg_canonical_blocks_count;

-- Expected minimums:
-- kg_systems_count            = 6
-- kg_technologies_count       = 13
-- kg_product_systems_count    = 4622
-- kg_product_technologies_count = 4622
-- kg_equipment_makes_count    >= 40
-- kg_equipment_models_count   >= 200
-- kg_product_equipment_count  >= 1000
-- kg_canonical_blocks_count   >= 10
```

---

## 2. ENDPOINT TEST CHECKLIST

Run each test with `curl -s <url> | jq '<check>'`.
All tests assume server running at `http://localhost:3000`.

### Test Suite A: Reference endpoints (cacheable)

#### A1: GET /api/kg/systems
```bash
curl -s http://localhost:3000/api/kg/systems | jq '{success, count: (.data | length)}'
```
**Expected:**
```json
{ "success": true, "count": 6 }
```

**Cross-check SQL:**
```sql
SELECT COUNT(*) FROM kg_systems;
-- Must equal data.length in response
```

#### A2: GET /api/kg/technologies
```bash
curl -s http://localhost:3000/api/kg/technologies | jq '{success, count: (.data | length)}'
```
**Expected:**
```json
{ "success": true, "count": 13 }
```

**Verify technology slugs present:**
```bash
curl -s http://localhost:3000/api/kg/technologies | jq '[.data[].slug]'
# Must include: nanoforce, macrocore, syntrax, SYNTAPORE, intekcore, microkappa,
#               duratech, aquaguard, THERMACORE, drycore, gasultra, marineclean, blueclean
```

#### A3: GET /api/kg/canonical?type=technology
```bash
curl -s "http://localhost:3000/api/kg/canonical?type=technology" | jq '{success, total: .pagination.total}'
```
**Expected:** success=true, total >= 1 (depends on how many canonical blocks seeded)

#### A4: GET /api/kg/graph
```bash
curl -s http://localhost:3000/api/kg/graph | jq '{success, nodeCount: (.data.meta.nodeCount), edgeCount: (.data.meta.edgeCount)}'
```
**Expected:** success=true, nodeCount >= 19 (6 systems + 13 technologies minimum)

#### A5: GET /api/kg/equipment/makes
```bash
curl -s http://localhost:3000/api/kg/equipment/makes | jq '{success, count: (.data | length)}'
```
**Expected:** success=true, count >= 40

---

### Test Suite B: Technology and system detail endpoints

#### B1: GET /api/kg/technologies/nanoforce
```bash
curl -s http://localhost:3000/api/kg/technologies/nanoforce | jq '{
  success,
  slug: .data.slug,
  displayName: .data.displayName,
  hasPrimarySystem: (.data.primarySystem != null),
  hasCanonical: (.data.canonicalBlock != null),
  productCount: .pagination.total
}'
```
**Expected:**
```json
{
  "success": true,
  "slug": "nanoforce",
  "displayName": "NANOFORCE™",
  "hasPrimarySystem": true,
  "hasCanonical": true,
  "productCount": 1962
}
```

**Cross-check SQL:**
```sql
SELECT COUNT(*)
FROM kg_product_technologies pt
JOIN kg_technologies t ON t.id = pt.technology_id
WHERE t.slug = 'nanoforce';
-- Must match pagination.total
```

#### B2: GET /api/kg/technologies/unknown-slug (404 test)
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/kg/technologies/not-a-real-tech
```
**Expected:** `404`

```bash
curl -s http://localhost:3000/api/kg/technologies/not-a-real-tech | jq '{success, error}'
```
**Expected:**
```json
{ "success": false, "error": "Technology 'not-a-real-tech' not found" }
```

#### B3: GET /api/kg/systems/hydraulic
```bash
curl -s http://localhost:3000/api/kg/systems/hydraulic | jq '{
  success,
  slug: .data.slug,
  hasCanonical: (.data.canonicalBlock != null),
  techCount: (.data.technologies | length),
  productCount: .pagination.total
}'
```
**Expected:** success=true, slug="hydraulic", productCount=1962

#### B4: Technology pagination
```bash
curl -s "http://localhost:3000/api/kg/technologies/nanoforce?page=2&limit=5" | jq '{
  currentPage: .pagination.page,
  limit: .pagination.limit,
  productCount: (.data.products | length)
}'
```
**Expected:** `{ "currentPage": 2, "limit": 5, "productCount": 5 }`

---

### Test Suite C: Product KG context endpoint

#### C1: GET /api/kg/products/EL82100 (real SKU)
```bash
curl -s http://localhost:3000/api/kg/products/EL82100 | jq '{
  success,
  sku: .data.sku,
  hasTechnology: (.data.technology != null),
  hasSystem: (.data.system != null),
  equipmentCount: (.data.equipment | length),
  crossrefTypes: (.data.crossrefs | keys)
}'
```
**Expected:**
```json
{
  "success": true,
  "sku": "EL82100",
  "hasTechnology": true,
  "hasSystem": true,
  "equipmentCount": 1,
  "crossrefTypes": ["brand", "competitor", "oem"]
}
```

#### C2: Security check — codigo_base must never appear
```bash
curl -s http://localhost:3000/api/kg/products/EL82100 | grep -i 'codigo_base\|\"BASE\"\|matched_by'
```
**Expected:** No output (zero matches). Any output is a CRITICAL security failure.

#### C3: Case-insensitive SKU lookup
```bash
# Both must return same result:
curl -s http://localhost:3000/api/kg/products/el82100 | jq '.data.sku'
curl -s http://localhost:3000/api/kg/products/EL82100 | jq '.data.sku'
```
**Expected:** Both return `"EL82100"`

#### C4: Unknown SKU returns 404
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/kg/products/NOTASKU
```
**Expected:** `404`

---

### Test Suite D: Canonical block endpoints

#### D1: GET /api/kg/canonical/system/hydraulic
```bash
curl -s http://localhost:3000/api/kg/canonical/system/hydraulic | jq '{
  success,
  conceptType: .data.conceptType,
  conceptSlug: .data.conceptSlug,
  hasDefinition: (.data.definition != null),
  version: .data.version
}'
```
**Expected:** success=true, conceptType="system", conceptSlug="hydraulic", version >= 1

#### D2: Invalid type returns 400
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/kg/canonical/widget/test
```
**Expected:** `400`

#### D3: Valid type, unknown slug returns 404
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/kg/canonical/technology/doesnotexist
```
**Expected:** `404`

---

### Test Suite E: Equipment endpoints

#### E1: GET /api/kg/equipment/makes/caterpillar/models
```bash
curl -s http://localhost:3000/api/kg/equipment/makes/caterpillar/models | jq '{
  success,
  makeName: .data.make.displayName,
  modelCount: .pagination.total
}'
```
**Expected:** success=true, makeName="Caterpillar Inc.", modelCount >= 1

#### E2: Unknown make slug returns 404
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/kg/equipment/makes/notamake/models
```
**Expected:** `404`

#### E3: Year filter
```bash
curl -s "http://localhost:3000/api/kg/equipment/makes/caterpillar/models?yearFrom=2015" | jq '{
  success,
  modelCount: (.data.models | length)
}'
```
**Expected:** success=true, modelCount >= 0 (may be 0 if no models from 2015+)

---

### Test Suite F: Existing API non-regression

**CRITICAL — these tests must pass after Phase 6 activation:**

#### F1: Existing /api/search unchanged
```bash
curl -s "http://localhost:3000/api/search?q=EL82100" | jq '{hasProducts: (.products != null), hasCount: (.count != null), hasTotalCatalog: (.total_catalog != null)}'
```
**Expected:**
```json
{ "hasProducts": true, "hasCount": true, "hasTotalCatalog": true }
```

#### F2: VIN search unchanged
```bash
curl -s "http://localhost:3000/api/filters/search/vin?model=CUMMINS" | jq '{hasFilters: (.filters != null)}'
```
**Expected:** `{ "hasFilters": true }`

#### F3: Autocomplete unchanged
```bash
curl -s "http://localhost:3000/api/autocomplete?q=EL8" | jq '{isArray: (. | type == "array"), firstItemHasCode: (.[0].code != null)}'
```
**Expected:** `{ "isArray": true, "firstItemHasCode": true }`

#### F4: Status endpoint unchanged
```bash
curl -s http://localhost:3000/api/status | jq '.status'
```
**Expected:** `"ok"`

---

## 3. SQL VERIFICATION QUERIES

Cross-check API responses against DB directly:

```sql
-- Verify technology product count matches API
SELECT t.slug, COUNT(pt.product_sku) AS db_count
FROM kg_technologies t
LEFT JOIN kg_product_technologies pt ON pt.technology_id = t.id
GROUP BY t.slug
ORDER BY db_count DESC;
-- Compare with /api/kg/technologies[].productCount values

-- Verify system product count matches API
SELECT s.slug, COUNT(ps.product_sku) AS db_count
FROM kg_systems s
LEFT JOIN kg_product_systems ps ON ps.system_id = s.id
GROUP BY s.slug
ORDER BY db_count DESC;
-- Compare with /api/kg/systems[].productCount values

-- Verify canonical blocks exist for expected concept types
SELECT concept_type, COUNT(*) FROM kg_canonical_blocks GROUP BY concept_type ORDER BY concept_type;
-- Compare with /api/kg/canonical response pagination.total values by type

-- Verify product EL82100 has KG assignments
SELECT
  (SELECT t.slug FROM kg_technologies t JOIN kg_product_technologies pt ON pt.technology_id = t.id WHERE pt.product_sku = 'EL82100') AS tech_slug,
  (SELECT s.slug FROM kg_systems s JOIN kg_product_systems ps ON ps.system_id = s.id WHERE ps.product_sku = 'EL82100') AS system_slug,
  (SELECT COUNT(*) FROM kg_product_equipment pe WHERE pe.product_sku = 'EL82100') AS equipment_count,
  (SELECT COUNT(*) FROM kg_product_crossrefs cr WHERE cr.product_sku = 'EL82100') AS crossref_count;
```

---

## 4. ROLLBACK PROCEDURE

Phase 6 is **entirely non-destructive** — it adds no new database tables, adds no indexes,
and does not modify any existing data.

### Rollback Steps

**Step 1: Remove app.use('/api/kg', ...) from server.js**

```javascript
// Comment out or remove this single line in server.js:
// app.use('/api/kg', knowledgeRoutes);
```

The existing try/catch block for `require('./routes/knowledge.routes')` will still run,
but the dummy fallback router will simply never be mounted. No error occurs.

**Step 2: Optionally delete routes/knowledge.routes.js**

```bash
# Optional — only if completely abandoning Phase 6:
rm routes/knowledge.routes.js
```

The server will automatically fall back to the dummy router on restart because the
try/catch block handles the missing file gracefully.

**Step 3: Restart server**

```bash
# Railway: trigger a deploy
# Render: trigger a deploy
# Local: CTRL+C and restart node server.js
```

### Rollback Verification

```bash
# Confirm /api/kg/* is no longer accessible:
curl -s http://localhost:3000/api/kg/systems
# Expected: 404 or {"status":"knowledge-api-unavailable"}

# Confirm existing endpoints still work:
curl -s "http://localhost:3000/api/search?q=EL82100" | jq '.count'
# Expected: a non-null integer
```

### Database Rollback

**None required.** Phase 6 makes zero database changes.
All kg_* tables created in Phases 1–5 remain intact and unaffected.

---

## 5. PERFORMANCE BENCHMARKS

After deployment, record baseline response times:

```bash
# Measure response time for each endpoint category:
time curl -s http://localhost:3000/api/kg/systems > /dev/null
time curl -s http://localhost:3000/api/kg/technologies > /dev/null
time curl -s http://localhost:3000/api/kg/technologies/nanoforce > /dev/null
time curl -s http://localhost:3000/api/kg/systems/hydraulic > /dev/null
time curl -s http://localhost:3000/api/kg/products/EL82100 > /dev/null
time curl -s http://localhost:3000/api/kg/graph > /dev/null
```

**Target response times (cold, no cache):**
| Endpoint | Target | Notes |
|----------|--------|-------|
| /api/kg/systems | < 50ms | 6-row table with COUNT join |
| /api/kg/technologies | < 100ms | 13 rows + COUNT aggregation |
| /api/kg/technologies/:slug | < 200ms | Multiple JOINs + paginated products |
| /api/kg/systems/:slug | < 200ms | Multiple JOINs + paginated products |
| /api/kg/products/:sku | < 300ms | 6 parallel queries via Promise.all |
| /api/kg/graph | < 200ms | 4 parallel queries, small tables |

**With cache (second request):**
All cacheable endpoints should respond < 10ms from in-memory cache.

---

## 6. KNOWN LIMITATIONS AT LAUNCH

| Limitation | Impact | Resolution |
|-----------|--------|-----------|
| Phase 3 (crossrefs) table name not yet confirmed | /products/:sku crossrefs section may be empty | Confirm `kg_product_crossrefs` table name at Phase 3 completion |
| Canonical blocks may not be seeded for all concepts | canonicalBlock may be null in technology/system responses | null is valid response — UI handles gracefully |
| Equipment data covers only ~53% of products | /products/:sku equipment array may be empty | Expected — Phase 2 covers products with equipment_applications data |
| No write endpoints | KG cannot be updated via API | Intentional — all writes via migration scripts |
