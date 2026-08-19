# VALIDATION_AND_ROLLBACK.md
# ELIMFILTERS — KG Phase 7: Semantic Search Validation and Rollback
# Industrial Knowledge Graph

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q

---

## SECURITY CONSTRAINT REMINDER

All test responses must be checked: `codigo_base`, `BASE`, and `MATCHED BY` must NEVER
appear in any `/api/kg/search` or `/api/search?mode=kg` response.

---

## 1. PRE-ACTIVATION CHECKLIST

Before setting `ENABLE_KG_SEARCH=true`:

- [ ] Phase 6 routes registered: `curl http://localhost:3000/api/kg/systems | jq '.success'` = true
- [ ] KG tables accessible: Phase dependency SQL in Phase 6 VALIDATION_AND_ROLLBACK.md all pass
- [ ] `routes/knowledge.routes.js` updated with `/search` route
- [ ] `classifyQuery()` function tested for all 5 classes
- [ ] All Class 1–5 SQL handlers implemented
- [ ] `rankAndDeduplicate()` function implemented
- [ ] Existing `/api/search` test (F1 from Phase 6 validation) still passes

---

## 2. TEST QUERIES PER CLASSIFICATION CLASS

Run all tests with server running at `http://localhost:3000` and `ENABLE_KG_SEARCH=true`.

### Class 1: Product Lookup (SKU/Part Number)

#### Test 1.1: Exact ELIMFILTERS SKU
```bash
curl -s "http://localhost:3000/api/kg/search?q=EL82100" | jq '{
  success,
  queryClass: .data.queryClass,
  queryClassLabel: .data.queryClassLabel,
  topResult: .data.results[0].sku,
  count: .data.count
}'
```
**Expected:**
```json
{
  "success": true,
  "queryClass": 1,
  "queryClassLabel": "sku",
  "topResult": "EL82100",
  "count": 1
}
```

#### Test 1.2: OEM crossref code (requires Phase 3)
```bash
curl -s "http://localhost:3000/api/kg/search?q=P552100" | jq '{
  success,
  queryClass: .data.queryClass,
  count: .data.count
}'
```
**Expected:** success=true, queryClass=1, count >= 1

#### Test 1.3: Lowercase SKU (case normalization)
```bash
curl -s "http://localhost:3000/api/kg/search?q=el82100" | jq '.data.results[0].sku'
```
**Expected:** `"EL82100"` (normalized to upper)

#### Test 1.4: Partial SKU prefix
```bash
curl -s "http://localhost:3000/api/kg/search?q=EL821" | jq '{
  queryClass: .data.queryClass,
  count: .data.count
}'
```
**Expected:** queryClass=1, count >= 1

---

### Class 2: Technology Query

#### Test 2.1: Technology name (exact)
```bash
curl -s "http://localhost:3000/api/kg/search?q=NANOFORCE" | jq '{
  success,
  queryClass: .data.queryClass,
  matchedTech: .data.kgContext.matchedTechnology.slug,
  count: .data.count
}'
```
**Expected:**
```json
{
  "success": true,
  "queryClass": 2,
  "matchedTech": "nanoforce",
  "count": 1962
}
```

#### Test 2.2: Technology name (lowercase)
```bash
curl -s "http://localhost:3000/api/kg/search?q=macrocore" | jq '.data.queryClass'
```
**Expected:** `2`

#### Test 2.3: Legacy technology name (SYNTAPORE → SYNTAPORE)
```bash
curl -s "http://localhost:3000/api/kg/search?q=SYNTAPORE" | jq '.data.kgContext.matchedTechnology.slug'
```
**Expected:** `"SYNTAPORE"` (resolved to canonical slug)

#### Test 2.4: Technology in phrase
```bash
curl -s "http://localhost:3000/api/kg/search?q=nanoforce+filter+hydraulic" | jq '.data.queryClass'
```
**Expected:** `2` (technology match takes precedence over system keyword)

---

### Class 3: System Query

#### Test 3.1: System keyword "hydraulic"
```bash
curl -s "http://localhost:3000/api/kg/search?q=hydraulic+filter" | jq '{
  queryClass: .data.queryClass,
  matchedSystem: .data.kgContext.matchedSystem.slug,
  count: .data.count
}'
```
**Expected:**
```json
{
  "queryClass": 3,
  "matchedSystem": "hydraulic",
  "count": 1962
}
```

#### Test 3.2: System keyword "fuel water separator"
```bash
curl -s "http://localhost:3000/api/kg/search?q=fuel+water+separator" | jq '{
  queryClass: .data.queryClass,
  matchedSystem: .data.kgContext.matchedSystem.slug
}'
```
**Expected:** queryClass=3, matchedSystem="fuel"

#### Test 3.3: System keyword "cabin air"
```bash
curl -s "http://localhost:3000/api/kg/search?q=cabin+air+filter" | jq '{
  queryClass: .data.queryClass,
  matchedSystem: .data.kgContext.matchedSystem.slug,
  count: .data.count
}'
```
**Expected:** queryClass=3, matchedSystem="cabin", count=122

#### Test 3.4: System keyword "lube oil"
```bash
curl -s "http://localhost:3000/api/kg/search?q=lube+oil+filter" | jq '.data.queryClass'
```
**Expected:** `3`

---

### Class 4: Equipment Query

#### Test 4.1: Equipment make "JOHN DEERE"
```bash
curl -s "http://localhost:3000/api/kg/search?q=JOHN+DEERE+filter" | jq '{
  queryClass: .data.queryClass,
  matchedMake: .data.kgContext.matchedMake.slug,
  count: .data.count
}'
```
**Expected:** queryClass=4, matchedMake="john-deere", count >= 1

#### Test 4.2: Equipment alias "CAT 320"
```bash
curl -s "http://localhost:3000/api/kg/search?q=CAT+320+hydraulic" | jq '{
  queryClass: .data.queryClass,
  matchedMake: .data.kgContext.matchedMake.slug
}'
```
**Expected:** queryClass=4, matchedMake="caterpillar"

#### Test 4.3: Engine make "Cummins ISX"
```bash
curl -s "http://localhost:3000/api/kg/search?q=Cummins+ISX+oil+filter" | jq '{
  queryClass: .data.queryClass,
  matchedMake: .data.kgContext.matchedMake.slug
}'
```
**Expected:** queryClass=4, matchedMake="cummins"

#### Test 4.4: False positive check — "catlog" should NOT match "cat"
```bash
curl -s "http://localhost:3000/api/kg/search?q=catalog" | jq '.data.queryClass'
```
**Expected:** `5` (general fallback, not equipment class 4)
**Note:** If this returns 4 (caterpillar match), the word-boundary check in `findMakeInQuery()` needs fixing.

---

### Class 5: General Fallback

#### Test 5.1: Generic phrase (no class 1-4 match)
```bash
curl -s "http://localhost:3000/api/kg/search?q=heavy+duty+filter" | jq '{
  queryClass: .data.queryClass,
  searchMode: .data.searchMode,
  count: .data.count
}'
```
**Expected:** queryClass=5, searchMode contains "tsvector" OR "ilike", count >= 0

#### Test 5.2: Very specific technical phrase
```bash
curl -s "http://localhost:3000/api/kg/search?q=spin-on+high+pressure" | jq '{
  queryClass: .data.queryClass,
  count: .data.count
}'
```
**Expected:** queryClass=5, count >= 0

---

### Class ranking tests

#### Test R.1: Technology query returns products of that technology only
```bash
curl -s "http://localhost:3000/api/kg/search?q=MACROCORE" | jq '[.data.results[].technology] | unique'
```
**Expected:** `["MACROCORE™"]` (all results should be MACROCORE technology)

#### Test R.2: Ranking is deterministic (same query → same order)
```bash
RESULT1=$(curl -s "http://localhost:3000/api/kg/search?q=hydraulic+filter" | jq '[.data.results[].sku]')
RESULT2=$(curl -s "http://localhost:3000/api/kg/search?q=hydraulic+filter" | jq '[.data.results[].sku]')
echo "Match: $([ "$RESULT1" = "$RESULT2" ] && echo YES || echo NO)"
```
**Expected:** `Match: YES`

---

## 3. SECURITY VALIDATION

#### Check no internal fields in KG search response
```bash
curl -s "http://localhost:3000/api/kg/search?q=EL82100" | grep -i 'codigo_base\|\"BASE\"\|matched_by'
```
**Expected:** No output (zero matches)

#### Check no internal fields via ?mode=kg
```bash
curl -s "http://localhost:3000/api/search?q=EL82100&mode=kg" | grep -i 'codigo_base\|\"BASE\"\|matched_by'
```
**Expected:** No output (zero matches)

---

## 4. EXISTING API NON-REGRESSION TESTS

**CRITICAL — run after every change to search logic:**

#### N.1: Existing /api/search without ?mode=kg is unchanged
```bash
curl -s "http://localhost:3000/api/search?q=EL82100" | jq '{
  hasProducts: (.products != null),
  hasCount: (.count != null),
  hasTotalCatalog: (.total_catalog != null),
  hasKgContext: (.kg_context != null)
}'
```
**Expected:**
```json
{
  "hasProducts": true,
  "hasCount": true,
  "hasTotalCatalog": true,
  "hasKgContext": false
}
```
(kg_context must NOT appear without ?mode=kg)

#### N.2: Existing /api/search with ENABLE_KG_SEARCH=false ignores mode=kg
```bash
ENABLE_KG_SEARCH=false curl -s "http://localhost:3000/api/search?q=EL82100&mode=kg" | jq '.kg_context'
```
**Expected:** `null`

#### N.3: VIN search unchanged
```bash
curl -s "http://localhost:3000/api/filters/search/vin?model=CUMMINS" | jq '.filters | length'
```
**Expected:** >= 0 (a number, not an error)

#### N.4: Feature-flag-off returns 503
```bash
# With ENABLE_KG_SEARCH not set or false:
ENABLE_KG_SEARCH=false node -e "..." # start server with flag off
curl -s "http://localhost:3000/api/kg/search?q=EL82100" | jq '{success, error}'
```
**Expected:**
```json
{ "success": false, "error": "KG search not enabled. Set ENABLE_KG_SEARCH=true." }
```

---

## 5. EXPECTED RESPONSE SHAPES (BY QUERY CLASS)

### Class 1 response shape (exact SKU)
```json
{
  "success": true,
  "data": {
    "query": "EL82100",
    "queryClass": 1,
    "queryClassLabel": "sku",
    "results": [
      {
        "sku": "EL82100",
        "description": "...",
        "filterType": "hydraulic",
        "technology": "NANOFORCE™"
      }
    ],
    "count": 1,
    "kgContext": {
      "queryClass": 1,
      "searchMode": "exact_sku"
    },
    "searchMode": "tsvector"
  },
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

### Class 2 response shape (technology)
```json
{
  "success": true,
  "data": {
    "query": "NANOFORCE",
    "queryClass": 2,
    "queryClassLabel": "technology",
    "results": [ { "sku": "...", "technology": "NANOFORCE™" } ],
    "count": 20,
    "kgContext": {
      "queryClass": 2,
      "matchedTechnology": { "slug": "nanoforce", "displayName": "NANOFORCE™", "category": "Hydraulic Filtration" },
      "relatedKnowledge": { "type": "technology", "citationUrl": "/knowledge-system/technologies/nanoforce", "definition": "..." }
    },
    "searchMode": "tsvector"
  },
  "pagination": { "page": 1, "limit": 20, "total": 1962, "totalPages": 99 }
}
```

### Class 3 response shape (system)
```json
{
  "success": true,
  "data": {
    "query": "hydraulic filter",
    "queryClass": 3,
    "queryClassLabel": "system",
    "results": [ { "sku": "...", "filterType": "hydraulic" } ],
    "count": 20,
    "kgContext": {
      "queryClass": 3,
      "matchedSystem": { "slug": "hydraulic", "name": "Hydraulic Systems" },
      "relatedKnowledge": { "type": "system", "citationUrl": "/knowledge-system/standards/hydraulic", "definition": "..." }
    },
    "searchMode": "tsvector"
  },
  "pagination": { "page": 1, "limit": 20, "total": 1962, "totalPages": 99 }
}
```

### Class 4 response shape (equipment)
```json
{
  "success": true,
  "data": {
    "query": "JOHN DEERE filter",
    "queryClass": 4,
    "queryClassLabel": "equipment",
    "results": [ { "sku": "...", "filterType": "..." } ],
    "count": 15,
    "kgContext": {
      "queryClass": 4,
      "matchedMake": { "slug": "john-deere", "displayName": "John Deere" }
    },
    "searchMode": "tsvector"
  },
  "pagination": { "page": 1, "limit": 20, "total": 15, "totalPages": 1 }
}
```

### Class 5 response shape (general)
```json
{
  "success": true,
  "data": {
    "query": "heavy duty oil",
    "queryClass": 5,
    "queryClassLabel": "general",
    "results": [ { "sku": "...", "filterType": "lube" } ],
    "count": 8,
    "kgContext": {
      "queryClass": 5,
      "searchMode": "tsvector"
    },
    "searchMode": "tsvector"
  },
  "pagination": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 }
}
```

---

## 6. PERFORMANCE BENCHMARKS

Record baseline timings after deployment:

```bash
# Run each 3 times and record median:
for q in "EL82100" "NANOFORCE" "hydraulic+filter" "JOHN+DEERE" "heavy+duty+oil"; do
  echo -n "Query '$q': "
  time curl -s "http://localhost:3000/api/kg/search?q=$q" > /dev/null
done
```

**Target timings (cold, no cache):**

| Query | Class | Target |
|-------|-------|--------|
| EL82100 | 1 (exact SKU) | < 30ms |
| NANOFORCE | 2 (technology) | < 100ms |
| hydraulic filter | 3 (system) | < 100ms |
| JOHN DEERE | 4 (equipment) | < 150ms |
| heavy duty oil | 5 (tsvector) | < 200ms |

---

## 7. ROLLBACK PROCEDURE

Phase 7 uses a feature flag for zero-risk rollback.

### Rollback Option A: Feature flag (immediate, no code changes)

```bash
# On Railway: unset ENABLE_KG_SEARCH environment variable (or set to false)
# On Render: set ENABLE_KG_SEARCH=false in environment settings
# Trigger a redeploy
```

**Effect:** `/api/search` reverts to exactly current behavior.
`/api/kg/search` returns `{"success":false,"error":"KG search not enabled."}`.
No data loss, no code change required.

### Rollback Option B: Code removal (if route causes unexpected side effects)

1. Remove the `/search` route from `routes/knowledge.routes.js`
2. Remove the `?mode=kg` check from the `/api/search` handler in server.js
3. Restart server

### Database rollback

**None required.** Phase 7 adds no new database tables, indexes, or data.
All queries are read-only against tables from Phases 1–5.

---

## 8. KNOWN LIMITATIONS AT LAUNCH

| Limitation | Impact | Resolution |
|-----------|--------|-----------|
| Class 4 (equipment) requires Phase 2 tables | Falls back to Class 5 if tables absent | Phase 2 dependency |
| Class 1 crossref match requires Phase 3 tables | Falls back to SKU-only match | Phase 3 dependency |
| Class 5 tsvector requires Phase 5 search_vector column | Falls back to ILIKE | Phase 5 dependency |
| Multi-word make detection uses includes() not word boundary | "catalog" could match "cat" | Use `.split(' ').includes('CAT')` check |
| Track A (pgvector) not active by default | No semantic vector similarity | Activate after verifying pgvector available |
| No query logging | Cannot analyze search quality over time | Future Phase: add query analytics table |
