# ARCHITECTURE.md
# ELIMFILTERS — KG Phase 7: Semantic Search
# Industrial Knowledge Graph — Search Enhancement Design

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Status:** DESIGN COMPLETE — awaiting Phases 3, 5, 6 completion
**Depends on:**
- Phase 3 (kg_product_crossrefs — normalized OEM and competitor codes)
- Phase 2 (kg_equipment_makes — equipment make lookup by name)
- Phase 5 (tsvector full-text search mandatory; pgvector cosine similarity optional)
- Phase 6 (KG REST API — route infrastructure in knowledge.routes.js)

---

## EXISTING SEARCH CONTRACT (IMMUTABLE)

Phase 7 MUST NOT change the existing `/api/search` response shape.
All existing fields are mandatory and must remain in all responses:

```json
{
  "products": [ /* array — MUST stay as "products" key */ ],
  "count": 42,             /* integer — MUST stay */
  "total_catalog": 4622    /* integer — MUST stay */
}
```

Product objects must retain all existing fields (see API_CONTRACT_REPORT.md Section 2).

**NEVER include `codigo_base`, `BASE`, or `MATCHED BY` in any search response.**

Phase 7 enhancement is **additive only**:
- A new optional field `kg_context` may be appended to the response envelope
- A new `?mode=kg` query parameter activates KG-enhanced behavior
- The feature flag `ENABLE_KG_SEARCH=true` gates the entire feature
- Without `?mode=kg` or with `ENABLE_KG_SEARCH=false`, behavior is byte-for-byte identical to current

---

## 1. FEATURE FLAG

```
Environment variable: ENABLE_KG_SEARCH
Values: 'true' | 'false' | (absent = false)
Default: false (safe — current behavior)
```

When `ENABLE_KG_SEARCH != 'true'`:
- `/api/search` behaves exactly as today
- `/api/kg/search` returns `{success: false, error: "KG search not enabled"}`

When `ENABLE_KG_SEARCH = 'true'`:
- `/api/search` responds normally to existing requests
- `/api/search?mode=kg` activates KG-enhanced search
- `/api/kg/search` is fully functional

**Setting the flag:**
```bash
# Railway / Render: set environment variable ENABLE_KG_SEARCH=true
# Local: ENABLE_KG_SEARCH=true node server.js
```

---

## 2. QUERY CLASSIFICATION SYSTEM

Every search query is classified into one of 5 classes before query execution.
Classification is sequential — the first matching class wins.

```
INPUT QUERY
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ Class 1: PRODUCT LOOKUP                                  │
│ Pattern: matches SKU format OR OEM/crossref code        │
│ Check: UPPER(q) matches /^[A-Z]{1,4}[0-9]/ OR          │
│        /^[0-9]{4,}/ OR length <= 12 with mixed chars    │
│ Route: kg_crossrefs lookup first, then SKU lookup       │
└────────────────┬────────────────────────────────────────┘
                 │ no match
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Class 2: TECHNOLOGY QUERY                                │
│ Pattern: query contains a known technology name         │
│ Check: UPPER(q) contains any of TECHNOLOGY_NAMES Set   │
│ Examples: "NANOFORCE", "nanoforce filter", "macrocore"  │
│ Route: kg_product_technologies lookup + tech detail     │
└────────────────┬────────────────────────────────────────┘
                 │ no match
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Class 3: SYSTEM QUERY                                    │
│ Pattern: query contains a filtration system keyword     │
│ Check: UPPER(q) contains any of SYSTEM_KEYWORDS Set    │
│ Examples: "hydraulic filter", "fuel water", "cabin air" │
│ Route: kg_product_systems lookup                        │
└────────────────┬────────────────────────────────────────┘
                 │ no match
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Class 4: EQUIPMENT QUERY                                 │
│ Pattern: query contains a known equipment make name     │
│ Check: UPPER(q) starts with or contains known make slug │
│ Examples: "JOHN DEERE", "CAT 320", "Cummins ISX"       │
│ Route: kg_equipment_makes + kg_product_equipment        │
└────────────────┬────────────────────────────────────────┘
                 │ no match
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Class 5: GENERAL (FALLBACK)                              │
│ Pattern: no pattern matched above                        │
│ Examples: "fuel water separator", "air filter heavy"    │
│ Route: full-text tsvector + optional pgvector cosine    │
└─────────────────────────────────────────────────────────┘
```

### Classification Function (pseudocode)

```javascript
const TECHNOLOGY_NAMES = new Set([
  'NANOFORCE', 'MACROCORE', 'SYNTRAX', 'SYNTEPORE', 'INTEKCORE',
  'MICROKAPPA', 'DURATECH', 'AQUAGUARD', 'COOLTECH', 'DRYCORE',
  'GASULTRA', 'MARINECLEAN', 'BLUECLEAN',
  // Legacy names that map to canonical:
  'SYNTAPORE', 'SINTRAX', 'INTAKCORE'
]);

const SYSTEM_KEYWORDS = new Set([
  'HYDRAULIC', 'FUEL', 'AIR INTAKE', 'AIR FILTER', 'LUBE', 'LUBE OIL',
  'OIL FILTER', 'CABIN', 'COMPRESSED AIR', 'AIR DRYER', 'COOLANT',
  'TURBINE', 'WATER SEPARATOR'
]);

// Equipment makes — loaded from kg_equipment_makes at startup
// MAKE_SLUGS: Map<slug, display_name> e.g. Map {caterpillar: 'Caterpillar Inc.', ...}
// MAKE_ALIASES: Map<alias, slug> e.g. Map {CAT: 'caterpillar', JD: 'john-deere', ...}

function classifyQuery(q) {
  const upper = q.trim().toUpperCase();

  // Class 1: SKU or part number pattern
  // Matches: EL82100, P552100, AF30827, LF3000, 1R-0750, 01181557
  if (/^[A-Z]{0,4}\d[\dA-Z\-]{2,}$/.test(upper) || /^\d{4,}[\dA-Z\-]*$/.test(upper)) {
    return { class: 1, term: upper };
  }

  // Class 2: Technology name
  for (const techName of TECHNOLOGY_NAMES) {
    if (upper.includes(techName)) {
      return { class: 2, term: techName, query: upper };
    }
  }

  // Class 3: System keyword
  for (const keyword of SYSTEM_KEYWORDS) {
    if (upper.includes(keyword)) {
      return { class: 3, term: keyword, query: upper };
    }
  }

  // Class 4: Equipment make
  // Check multi-word makes first (longest match), then single-word
  const makeMatch = findMakeInQuery(upper); // see Section 3.4
  if (makeMatch) {
    return { class: 4, makeSlug: makeMatch.slug, query: upper };
  }

  // Class 5: General fallback
  return { class: 5, query: upper };
}
```

---

## 3. QUERY ROUTING AND SQL PER CLASS

### 3.1 Class 1: Product Lookup

**Trigger:** Query matches SKU or part number pattern.

**SQL execution waterfall:**

```sql
-- Step 1: Exact SKU match in elimfilters_catalog (never selects codigo_base)
SELECT sku, description, filter_type, technology,
       oem_codes, competitor_codes, equipment_applications, brand_crossrefs, alternatives
FROM elimfilters_catalog
WHERE UPPER(sku) = $1;

-- Step 2: OEM/crossref exact match in KG crossrefs table (Phase 3)
SELECT cr.product_sku, ec.description, ec.filter_type, ec.technology,
       ec.oem_codes, ec.competitor_codes, ec.equipment_applications
FROM kg_product_crossrefs cr
JOIN elimfilters_catalog ec ON ec.sku = cr.product_sku
WHERE UPPER(cr.ref_code) = $1
ORDER BY cr.ref_type ASC;  -- 'oem' before 'competitor'

-- Step 3: Partial match (prefix) if steps 1+2 return nothing
SELECT sku, description, filter_type, technology
FROM elimfilters_catalog
WHERE UPPER(sku) LIKE $1 || '%'
LIMIT 20;
```

**KG context returned:**
- `queryClass: 1`
- `matchedTechnology`: tech slug if all results share same technology
- `relatedKnowledge`: link to `/knowledge-system/standards/[system]` based on filter_type

---

### 3.2 Class 2: Technology Query

**Trigger:** Query contains a known ELIMFILTERS technology name.

```sql
-- Resolve technology name to slug (handles legacy aliases: SYNTAPORE → syntepore)
SELECT id, slug, display_name, category
FROM kg_technologies
WHERE slug = $1 OR display_name ILIKE '%' || $1 || '%';

-- Get products for this technology
SELECT ec.sku, ec.description, ec.filter_type, ec.technology,
       ec.oem_codes, ec.competitor_codes, ec.equipment_applications
FROM elimfilters_catalog ec
JOIN kg_product_technologies pt ON pt.product_sku = ec.sku
JOIN kg_technologies t ON t.id = pt.technology_id
WHERE t.slug = $1
ORDER BY ec.sku
LIMIT 40;

-- Get canonical block for KG context
SELECT definition, citation_url, version
FROM kg_canonical_blocks
WHERE concept_slug = $1 AND concept_type = 'technology';
```

**KG context returned:**
- `queryClass: 2`
- `matchedTechnology`: `{slug, displayName, category}`
- `relatedKnowledge`: `{type: 'technology', citationUrl, definition}`

---

### 3.3 Class 3: System Query

**Trigger:** Query contains a filtration system keyword (hydraulic, fuel, cabin, etc.).

```sql
-- Map keyword to system slug
-- SYSTEM_KEYWORD_MAP (static, hardcoded):
-- 'HYDRAULIC'     → 'hydraulic'
-- 'FUEL'          → 'fuel'
-- 'WATER SEP'     → 'fuel'
-- 'LUBE'          → 'lube-oil'
-- 'OIL FILTER'    → 'lube-oil'
-- 'CABIN'         → 'cabin'
-- 'AIR INTAKE'    → 'air-intake'
-- 'AIR FILTER'    → 'air-intake'  (also matches air-intake system)
-- 'COMPRESSED AIR'→ 'compressed-air'
-- 'AIR DRYER'     → 'compressed-air'
-- 'COOLANT'       → 'lube-oil'   (cooltech is lube-oil system)

-- Get products for this system (plus any technology sub-filter from query)
SELECT ec.sku, ec.description, ec.filter_type, ec.technology,
       ec.oem_codes, ec.competitor_codes, ec.equipment_applications
FROM elimfilters_catalog ec
JOIN kg_product_systems ps ON ps.product_sku = ec.sku
JOIN kg_systems s ON s.id = ps.system_id
WHERE s.slug = $1
ORDER BY ec.sku
LIMIT 40;

-- Get canonical block for context
SELECT definition, citation_url
FROM kg_canonical_blocks
WHERE concept_slug = $1 AND concept_type = 'system';
```

**KG context returned:**
- `queryClass: 3`
- `matchedSystem`: `{slug, name}`
- `relatedKnowledge`: `{type: 'system', citationUrl, definition}`

---

### 3.4 Class 4: Equipment Query

**Trigger:** Query contains a known equipment make name or alias.

**Multi-word make matching algorithm:**

```javascript
function findMakeInQuery(upperQuery) {
  // Check multi-word makes first (longest to shortest — critical for 'JOHN DEERE' before 'JOHN')
  const multiWordMakes = [
    { pattern: 'JOHN DEERE', slug: 'john-deere' },
    { pattern: 'NEW HOLLAND', slug: 'new-holland' },
    { pattern: 'CASE IH', slug: 'case-ih' },
    { pattern: 'MASSEY FERGUSON', slug: 'massey-ferguson' },
    { pattern: 'MERCEDES-BENZ', slug: 'mercedes-benz' },
    { pattern: 'MERCEDES BENZ', slug: 'mercedes-benz' },
    { pattern: 'ATLAS COPCO', slug: 'atlas-copco' },
    { pattern: 'INGERSOLL RAND', slug: 'ingersoll-rand' },
    { pattern: 'DETROIT DIESEL', slug: 'detroit' },
    { pattern: 'GARDNER DENVER', slug: 'gardner-denver' },
  ];
  for (const { pattern, slug } of multiWordMakes) {
    if (upperQuery.includes(pattern)) return { slug };
  }

  // Single-word aliases
  const singleWordAliases = {
    'CATERPILLAR': 'caterpillar', 'CAT': 'caterpillar',
    'CUMMINS': 'cummins',
    'JOHN': null, // too ambiguous without 'DEERE' — skip
    'KOMATSU': 'komatsu',
    'VOLVO': 'volvo',
    'KENWORTH': 'kenworth',
    'PETERBILT': 'peterbilt',
    'FREIGHTLINER': 'freightliner',
    'LIEBHERR': 'liebherr',
    'KUBOTA': 'kubota',
    'PERKINS': 'perkins',
    'YANMAR': 'yanmar',
    'FENDT': 'fendt',
    'CLAAS': 'claas',
    'DEUTZ': 'deutz',
    'SCANIA': 'scania',
    'IVECO': 'iveco',
    'HITACHI': 'hitachi',
    'KOMATSU': 'komatsu',
    'DOOSAN': 'doosan',
  };
  for (const [alias, slug] of Object.entries(singleWordAliases)) {
    if (slug && upperQuery.includes(alias)) return { slug };
  }
  return null;
}
```

**SQL for Class 4:**

```sql
-- Get products for this make via equipment joins
SELECT DISTINCT ec.sku, ec.description, ec.filter_type, ec.technology,
       ec.oem_codes, ec.competitor_codes, ec.equipment_applications
FROM elimfilters_catalog ec
JOIN kg_product_equipment pe ON pe.product_sku = ec.sku
JOIN kg_equipment_models mod ON mod.id = pe.model_id
JOIN kg_equipment_makes mk ON mk.id = mod.make_id
WHERE mk.slug = $1
ORDER BY ec.sku
LIMIT 40;
```

**KG context returned:**
- `queryClass: 4`
- `matchedMake`: `{slug, displayName}`
- `relatedKnowledge`: links to systems found in results

---

### 3.5 Class 5: General Fallback

**Trigger:** No pattern matched by Classes 1–4.

**Dual-track execution:**

```
TRACK A (pgvector available: ENABLE_VECTOR_SEARCH=true)
  ├── Generate embedding for query (OpenAI text-embedding-3-small)
  ├── Cosine similarity search in kg_product_embeddings
  └── Combine with tsvector score

TRACK B (tsvector only — default, pgvector not available)
  └── tsvector full-text search on elimfilters_catalog
```

**Track B SQL (mandatory baseline):**

```sql
-- tsvector full-text search
-- search_vector column must exist on elimfilters_catalog (Phase 5 adds this)
SELECT ec.sku, ec.description, ec.filter_type, ec.technology,
       ec.oem_codes, ec.competitor_codes, ec.equipment_applications,
       ts_rank(ec.search_vector, plainto_tsquery('english', $1)) AS ts_score
FROM elimfilters_catalog ec
WHERE ec.search_vector @@ plainto_tsquery('english', $1)
ORDER BY ts_score DESC
LIMIT 40;
```

**Track A additional SQL (pgvector supplement):**

```sql
-- Cosine similarity search (supplements, does not replace Track B)
SELECT product_sku, (1 - (embedding <=> $1::vector)) AS cosine_similarity
FROM kg_product_embeddings
ORDER BY embedding <=> $1::vector
LIMIT 20;
-- Merge with Track B results using ranking algorithm
```

**KG context returned:**
- `queryClass: 5`
- `searchMode`: `'tsvector'` or `'tsvector+vector'`
- `relatedKnowledge`: null (no specific concept matched)

---

## 4. RANKING ALGORITHM (WATERFALL)

After classification and SQL execution, results are scored and ranked:

```javascript
function scoreResult(product, classResult) {
  const { matchType, query } = classResult;

  switch (matchType) {
    case 'exact_sku':          return 100; // Exact SKU match
    case 'oem_exact':          return 90;  // Exact OEM code match in kg_crossrefs
    case 'crossref_exact':     return 90;  // Exact competitor code match
    case 'oem_partial':        return 70;  // Partial OEM match
    case 'technology_match':   return 60;  // Product has matching technology
    case 'system_match':       return 50;  // Product is in matching system
    case 'equipment_match':    return 40;  // Product fits matching equipment make
    case 'tsvector_match':
      // ts_rank returns 0–1; scale to 0–30
      return Math.round((product.ts_score || 0) * 30);
    case 'vector_cosine':
      // cosine similarity 0–1; scale to 0–20 (supplement only)
      return Math.round((product.cosine_similarity || 0) * 20);
    default:
      return 0;
  }
}

function rankResults(products) {
  // Sort by score descending, then sku ascending (deterministic tiebreaker)
  return products
    .map(p => ({ ...p, _score: scoreResult(p, p._classResult) }))
    .sort((a, b) => b._score - a._score || a.sku.localeCompare(b.sku))
    .map(({ _score, _classResult, ...product }) => product); // strip internal fields
}
```

**Score table summary:**

| Match Type | Score | Explanation |
|-----------|-------|-------------|
| exact_sku | 100 | Exact ELIMFILTERS SKU match |
| oem_exact | 90 | Exact OEM code in kg_crossrefs |
| crossref_exact | 90 | Exact competitor code match |
| oem_partial | 70 | Partial match against OEM/crossref |
| technology_match | 60 | Product belongs to queried technology |
| system_match | 50 | Product belongs to queried system |
| equipment_match | 40 | Product fits equipment make from query |
| tsvector_match | 0–30 | ts_rank × 30 |
| vector_cosine | 0–20 | cosine similarity × 20 (supplement only) |

**Multi-signal products:** If a product matches multiple criteria, highest score wins.
A product matching via OEM exact (90) AND tsvector (score=15) gets score = 90.

---

## 5. RESPONSE SCHEMA

### Existing /api/search response (unchanged baseline)

```json
{
  "products": [ /* existing product objects — unchanged */ ],
  "count": 42,
  "total_catalog": 4622
}
```

### /api/search?mode=kg enhanced response

Same as above, with optional additive field:

```json
{
  "products": [ /* same existing product objects */ ],
  "count": 42,
  "total_catalog": 4622,
  "kg_context": {
    "queryClass": 2,
    "queryClassLabel": "technology",
    "matchedTechnology": {
      "slug": "nanoforce",
      "displayName": "NANOFORCE™",
      "category": "Hydraulic Filtration"
    },
    "matchedSystem": null,
    "matchedMake": null,
    "relatedKnowledge": {
      "type": "technology",
      "citationUrl": "/knowledge-system/technologies/nanoforce",
      "definition": "NANOFORCE™ controls hydraulic system contamination through synthetic multi-layer media..."
    },
    "searchMode": "tsvector",
    "rankingApplied": true
  }
}
```

### /api/kg/search response (dedicated KG search endpoint)

```json
{
  "success": true,
  "data": {
    "query": "nanoforce hydraulic",
    "queryClass": 2,
    "queryClassLabel": "technology",
    "results": [
      {
        "sku": "EL82100",
        "description": "Hydraulic filter spin-on high-pressure",
        "filterType": "hydraulic",
        "technology": "NANOFORCE™",
        "score": 60,
        "matchType": "technology_match"
      }
    ],
    "count": 42,
    "kgContext": {
      "matchedTechnology": {
        "slug": "nanoforce",
        "displayName": "NANOFORCE™",
        "definition": "NANOFORCE™ controls hydraulic system contamination...",
        "citationUrl": "/knowledge-system/technologies/nanoforce"
      },
      "matchedSystem": null,
      "matchedMake": null
    },
    "searchMode": "tsvector"
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

**Note:** The `score` and `matchType` fields appear ONLY in `/api/kg/search` responses.
They are NOT added to the existing `/api/search` product objects.
The existing product object shape from `buildFilterData()` is never modified.

---

## 6. API ENDPOINT SPECIFICATION

### 6.1 GET /api/kg/search

Dedicated KG-enhanced search endpoint. Does not conflict with `/api/search`.

**HTTP Method:** GET
**Path:** `/api/kg/search`
**Auth:** None (public, same as /api/search)

**Query Parameters:**

| Parameter | Type | Required | Default | Notes |
|-----------|------|----------|---------|-------|
| q | string | YES | — | Search query (min 2 chars) |
| lang | string | NO | 'en' | Language for description extraction |
| page | integer | NO | 1 | Pagination page |
| limit | integer | NO | 20 | Max 100 |
| class | integer | NO | auto | Force a classification class (1–5) for testing |

**Requires:** `ENABLE_KG_SEARCH=true`

**Error if feature flag is off:**
```json
{ "success": false, "error": "KG search not enabled. Set ENABLE_KG_SEARCH=true." }
```

### 6.2 GET /api/search?mode=kg (extension to existing endpoint)

Existing endpoint with `?mode=kg` parameter activates KG enrichment.

**Behavior change:** Adds `kg_context` field to response. All existing fields unchanged.
**Requires:** `ENABLE_KG_SEARCH=true` (if flag is false, `mode=kg` is silently ignored)

---

## 7. DUAL-TRACK IMPLEMENTATION

### Track A: pgvector available (ENABLE_VECTOR_SEARCH=true)

Prerequisites:
- `pg_extension vector` installed on Railway/Render DB
- Phase 5 executed: embeddings generated for all 4,622 products
- `kg_product_embeddings` table populated
- `OPENAI_API_KEY` available for query embedding generation

Track A augments Class 5 (general) searches only.
It does NOT replace the ranking for Classes 1–4.

```javascript
async function generateQueryEmbedding(query) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
               'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: query })
  });
  const data = await response.json();
  return data.data[0].embedding; // float array, 1536 dimensions
}
```

### Track B: tsvector only (default)

Requires Phase 5 `search_vector` column on `elimfilters_catalog`.

If Phase 5 has not been executed (no `search_vector` column), Track B falls back
to the existing 6-tier ILIKE search logic already in `/api/search`.

```javascript
async function checkTsvectorAvailable(client) {
  const result = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'elimfilters_catalog' AND column_name = 'search_vector'
  `);
  return result.rows.length > 0;
}
```

---

## 8. SYSTEM_KEYWORD_MAP (STATIC CONFIGURATION)

```javascript
// Maps query keywords to kg_systems.slug values
// Match is performed on UPPER(query) — case-insensitive
const SYSTEM_KEYWORD_MAP = {
  'HYDRAULIC':      'hydraulic',
  'HYDRAUL':        'hydraulic',    // prefix match
  'FUEL':           'fuel',
  'DIESEL FUEL':    'fuel',
  'WATER SEPARATOR':'fuel',
  'WATER SEP':      'fuel',
  'LUBE':           'lube-oil',
  'LUBRICANT':      'lube-oil',
  'LUBE OIL':       'lube-oil',
  'OIL FILTER':     'lube-oil',
  'ENGINE OIL':     'lube-oil',
  'CABIN':          'cabin',
  'CABIN AIR':      'cabin',
  'OPERATOR':       'cabin',
  'AIR INTAKE':     'air-intake',
  'AIR FILTER':     'air-intake',
  'INTAKE AIR':     'air-intake',
  'COMPRESSED AIR': 'compressed-air',
  'AIR DRYER':      'compressed-air',
  'COMPRESSOR':     'compressed-air',
  'COOLANT':        'lube-oil',     // COOLTECH is in lube-oil system
  'COOLANT FILTER': 'lube-oil',
  'TURBINE':        'fuel',         // turbine filter_type is in fuel system
};
```

---

## 9. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| KG search changes existing search ranking, breaks Part Search UI | MEDIUM | HIGH | Feature flag + `?mode=kg` opt-in: existing behavior unchanged unless flag+param set |
| Class 1 pattern too broad, matches technology names as part numbers | LOW | MEDIUM | Order: Class 1 checked first only for SKU-like patterns (/^[A-Z]{0,4}\d/); technology names don't match |
| Class 4 make matching false positives (e.g., "CAT" in "CATALOG") | MEDIUM | LOW | Use word-boundary matching: check UPPER(q).split(' ').includes('CAT') |
| tsvector search_vector column not yet created (Phase 5 not run) | MEDIUM | LOW | `checkTsvectorAvailable()` falls back to ILIKE gracefully |
| OpenAI API latency for query embedding (Track A) | MEDIUM | MEDIUM | Track A is opt-in via ENABLE_VECTOR_SEARCH=true; 200-300ms overhead acceptable for semantic queries |
| KG tables not populated (Phase 3 not run) | HIGH pre-execution | MEDIUM | Each class checks table existence before querying; falls back to Class 5 |
| kg_context field in response breaks frontend that expects strict JSON shape | LOW | LOW | Frontends only read `products`, `count`, `total_catalog` — extra fields silently ignored |
| Duplicate products in ranked results (appear in both crossref and tsvector match) | MEDIUM | LOW | Deduplicate by SKU after ranking; keep highest score |
