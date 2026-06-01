# IMPLEMENTATION_PLAN.md
# ELIMFILTERS — KG Phase 7: Semantic Search Implementation Plan
# Industrial Knowledge Graph

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Status:** DESIGN COMPLETE — awaiting Phases 3, 5, 6 completion
**Estimated execution time:** 3–6 hours

---

## 1. DEPENDENCY GRAPH

```
Phase 1 ──► kg_technologies, kg_systems, kg_product_technologies, kg_product_systems
    ↓ REQUIRED: technology and system classification (Classes 2, 3)
    │
Phase 2 ──► kg_equipment_makes, kg_equipment_models, kg_product_equipment
    ↓ REQUIRED: equipment make lookup (Class 4)
    │
Phase 3 ──► kg_product_crossrefs
    ↓ REQUIRED: OEM/competitor exact match (Class 1, score 90)
    │
Phase 5 ──► search_vector column on elimfilters_catalog (tsvector)
    │         kg_product_embeddings (pgvector, optional)
    ↓ REQUIRED for Class 5 tsvector; pgvector is Track A optional
    │
Phase 6 ──► routes/knowledge.routes.js (route infrastructure)
    ↓ REQUIRED: /api/kg/search endpoint added to this file
    │
Phase 7 ──► Semantic search (THIS PHASE)
```

### Minimum viable Phase 7 (partial dependencies):

If Phase 3 (crossrefs) is not complete: Class 1 falls back to SKU-only match (score 100 for exact, no crossref match).
If Phase 5 (tsvector) is not complete: Class 5 falls back to ILIKE search.
If Phase 2 (equipment) is not complete: Class 4 falls back to Class 5.

Phase 6 MUST be complete before Phase 7 can be activated.

---

## 2. FILE MODIFICATIONS

### Primary change: routes/knowledge.routes.js

Add the `/search` route to the existing knowledge routes file created in Phase 6.

No separate file is needed. The KG search endpoint is an extension of the Phase 6 route file.

### Incidental change: server.js

Two additions needed:

**Addition 1:** Check feature flag and add `?mode=kg` handling to existing `/api/search` endpoint.

**Addition 2:** No new `app.use()` call needed — Phase 6 already registered `app.use('/api/kg', knowledgeRoutes)`. The new `/api/kg/search` route is registered within `knowledgeRoutes`.

### New classification module (optional, for code organization):

```
lib/
└── kg-search-classifier.js    ← Optional: extract classifyQuery() and rankResults()
                                   if search handler grows > 200 lines
```

---

## 3. IMPLEMENTATION SEQUENCE

### Step 1: Add ENABLE_KG_SEARCH check utilities

```javascript
// In routes/knowledge.routes.js (add near top):
const KG_SEARCH_ENABLED = process.env.ENABLE_KG_SEARCH === 'true';
const VECTOR_SEARCH_ENABLED = process.env.ENABLE_VECTOR_SEARCH === 'true';
```

### Step 2: Implement query classifier

Add `classifyQuery(q)` function to `routes/knowledge.routes.js`
(or extract to `lib/kg-search-classifier.js`).

Use the pseudocode in ARCHITECTURE.md Section 2.
Test each class with the test queries in VALIDATION_AND_ROLLBACK.md.

### Step 3: Implement per-class SQL handlers

Implement in this order:

1. `handleClass1(term, client)` — SKU + crossref lookup (simplest)
2. `handleClass2(techName, client)` — technology lookup
3. `handleClass3(systemSlug, client)` — system lookup
4. `handleClass5(query, client)` — tsvector fallback
5. `handleClass4(makeSlug, client)` — equipment lookup (requires Phase 2 tables)

### Step 4: Implement ranking function

```javascript
function rankAndDeduplicate(products) {
  // Deduplicate by SKU (keep highest score)
  const bySkU = new Map();
  for (const p of products) {
    const existing = bySkU.get(p.sku);
    if (!existing || p._score > existing._score) {
      bySkU.set(p.sku, p);
    }
  }
  // Sort by score DESC, sku ASC (deterministic)
  return Array.from(bySkU.values())
    .sort((a, b) => (b._score - a._score) || a.sku.localeCompare(b.sku))
    .map(({ _score, _classResult, ...product }) => product);
}
```

### Step 5: Implement /api/kg/search route

```javascript
router.get('/search', async (req, res) => {
  if (!KG_SEARCH_ENABLED) {
    return res.status(503).json({
      success: false,
      error: 'KG search not enabled. Set ENABLE_KG_SEARCH=true.'
    });
  }

  const q = (req.query.q || '').trim();
  if (q.length < 2) {
    return res.status(400).json({ success: false, error: 'Query too short (min 2 characters)' });
  }

  const { page, limit, offset } = paginate(req);
  const client = new Client(dbConfig);

  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    const classification = classifyQuery(q);
    let products = [];
    let kgContext = {};

    switch (classification.class) {
      case 1: ({ products, kgContext } = await handleClass1(classification.term, client)); break;
      case 2: ({ products, kgContext } = await handleClass2(classification.term, client)); break;
      case 3: ({ products, kgContext } = await handleClass3(classification.term, client)); break;
      case 4: ({ products, kgContext } = await handleClass4(classification.makeSlug, client)); break;
      case 5: ({ products, kgContext } = await handleClass5(q, client)); break;
    }

    const ranked = rankAndDeduplicate(products);
    const total  = ranked.length;
    const paged  = ranked.slice(offset, offset + limit);

    return res.json({
      success: true,
      data: {
        query: q,
        queryClass: classification.class,
        queryClassLabel: ['', 'sku', 'technology', 'system', 'equipment', 'general'][classification.class],
        results: paged,
        count: paged.length,
        kgContext,
        searchMode: KG_SEARCH_ENABLED && VECTOR_SEARCH_ENABLED ? 'tsvector+vector' : 'tsvector'
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });

  } catch (err) {
    console.error('[kg:search]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    await client.end();
  }
});
```

### Step 6: Extend existing /api/search with ?mode=kg

Locate the existing `/api/search` endpoint in server.js (line ~2073).

Add this block at the START of the handler (before existing logic):

```javascript
app.get('/api/search', async (req, res) => {
  // Phase 7 KG mode opt-in
  if (req.query.mode === 'kg' && process.env.ENABLE_KG_SEARCH === 'true') {
    // Forward to KG search handler, then wrap in existing response shape
    return handleKgSearchForExistingEndpoint(req, res);
  }
  // ... EXISTING search code unchanged below ...
});
```

Where `handleKgSearchForExistingEndpoint` calls the same classification/ranking
logic as `/api/kg/search` but formats the response as `{products, count, total_catalog, kg_context}`.

**Critical constraint:** The `?mode=kg` path must still produce a response where:
- `products` key exists and is an array
- `count` key exists and is an integer
- `total_catalog` key exists and is an integer
- All product objects have the same fields as `buildFilterData()` output

The `kg_context` field is purely additive — frontends that only read `products/count/total_catalog` are unaffected.

---

## 4. SQL QUERY PATTERNS (COMPLETE)

### Class 1 — SKU + KG crossref lookup

```javascript
async function handleClass1(term, client) {
  // Try exact SKU first
  const exactSku = await client.query(`
    SELECT sku, description, filter_type, technology,
           oem_codes, competitor_codes, equipment_applications, brand_crossrefs, alternatives
    FROM elimfilters_catalog
    WHERE UPPER(sku) = $1
  `, [term]);

  if (exactSku.rows.length > 0) {
    return {
      products: exactSku.rows.map(r => ({ ...r, _score: 100, _classResult: { matchType: 'exact_sku' } })),
      kgContext: { queryClass: 1, searchMode: 'exact_sku' }
    };
  }

  // Try KG crossrefs (Phase 3)
  // If kg_product_crossrefs doesn't exist, skip gracefully
  let crossrefProducts = [];
  try {
    const crossrefResult = await client.query(`
      SELECT ec.sku, ec.description, ec.filter_type, ec.technology,
             ec.oem_codes, ec.competitor_codes, ec.equipment_applications,
             cr.ref_type, cr.manufacturer
      FROM kg_product_crossrefs cr
      JOIN elimfilters_catalog ec ON ec.sku = cr.product_sku
      WHERE UPPER(cr.ref_code) = $1
      ORDER BY cr.ref_type ASC, ec.sku
    `, [term]);
    crossrefProducts = crossrefResult.rows.map(r => ({
      ...r,
      _score: r.ref_type === 'oem' ? 90 : 70,
      _classResult: { matchType: r.ref_type === 'oem' ? 'oem_exact' : 'crossref_exact' }
    }));
  } catch { /* Table not yet created — Phase 3 not run */ }

  if (crossrefProducts.length > 0) {
    return {
      products: crossrefProducts,
      kgContext: { queryClass: 1, searchMode: 'crossref_match' }
    };
  }

  // Prefix SKU match fallback
  const prefixResult = await client.query(`
    SELECT sku, description, filter_type, technology,
           oem_codes, competitor_codes, equipment_applications
    FROM elimfilters_catalog
    WHERE UPPER(sku) LIKE $1 || '%'
    ORDER BY sku
    LIMIT 40
  `, [term]);

  return {
    products: prefixResult.rows.map(r => ({ ...r, _score: 70, _classResult: { matchType: 'sku_prefix' } })),
    kgContext: { queryClass: 1, searchMode: 'sku_prefix' }
  };
}
```

### Class 2 — Technology lookup

```javascript
async function handleClass2(techNameRaw, client) {
  // Resolve tech name to slug (handles SYNTAPORE → syntepore, INTAKCORE → intekcore)
  const TECH_NAME_TO_SLUG = {
    'NANOFORCE': 'nanoforce', 'MACROCORE': 'macrocore',
    'SYNTRAX': 'syntrax', 'SINTRAX': 'syntrax',
    'SYNTEPORE': 'syntepore', 'SYNTAPORE': 'syntepore',
    'INTEKCORE': 'intekcore', 'INTAKCORE': 'intekcore',
    'MICROKAPPA': 'microkappa', 'DURATECH': 'duratech',
    'AQUAGUARD': 'aquaguard', 'COOLTECH': 'cooltech',
    'DRYCORE': 'drycore', 'GASULTRA': 'gasultra',
    'MARINECLEAN': 'marineclean', 'BLUECLEAN': 'blueclean',
  };
  const slug = TECH_NAME_TO_SLUG[techNameRaw] || techNameRaw.toLowerCase();

  const [techResult, productsResult, canonicalResult] = await Promise.all([
    client.query(`
      SELECT id, slug, display_name, category FROM kg_technologies WHERE slug = $1
    `, [slug]),
    client.query(`
      SELECT ec.sku, ec.description, ec.filter_type, ec.technology,
             ec.oem_codes, ec.competitor_codes, ec.equipment_applications
      FROM elimfilters_catalog ec
      JOIN kg_product_technologies pt ON pt.product_sku = ec.sku
      JOIN kg_technologies t ON t.id = pt.technology_id
      WHERE t.slug = $1
      ORDER BY ec.sku LIMIT 100
    `, [slug]),
    client.query(`
      SELECT definition, citation_url, version
      FROM kg_canonical_blocks WHERE concept_slug = $1 AND concept_type = 'technology'
    `, [slug])
  ]);

  const tech = techResult.rows[0];
  const canonical = canonicalResult.rows[0];

  return {
    products: productsResult.rows.map(r => ({
      ...r, _score: 60, _classResult: { matchType: 'technology_match' }
    })),
    kgContext: {
      queryClass: 2,
      matchedTechnology: tech ? { slug: tech.slug, displayName: tech.display_name, category: tech.category } : null,
      relatedKnowledge: canonical ? { type: 'technology', citationUrl: canonical.citation_url, definition: canonical.definition } : null
    }
  };
}
```

### Class 3 — System lookup

```javascript
async function handleClass3(systemSlug, client) {
  const [sysResult, productsResult, canonicalResult] = await Promise.all([
    client.query(`SELECT id, slug, name FROM kg_systems WHERE slug = $1`, [systemSlug]),
    client.query(`
      SELECT ec.sku, ec.description, ec.filter_type, ec.technology,
             ec.oem_codes, ec.competitor_codes, ec.equipment_applications
      FROM elimfilters_catalog ec
      JOIN kg_product_systems ps ON ps.product_sku = ec.sku
      JOIN kg_systems s ON s.id = ps.system_id
      WHERE s.slug = $1
      ORDER BY ec.sku LIMIT 100
    `, [systemSlug]),
    client.query(`
      SELECT definition, citation_url
      FROM kg_canonical_blocks WHERE concept_slug = $1 AND concept_type = 'system'
    `, [systemSlug])
  ]);

  const sys = sysResult.rows[0];
  const canonical = canonicalResult.rows[0];

  return {
    products: productsResult.rows.map(r => ({
      ...r, _score: 50, _classResult: { matchType: 'system_match' }
    })),
    kgContext: {
      queryClass: 3,
      matchedSystem: sys ? { slug: sys.slug, name: sys.name } : null,
      relatedKnowledge: canonical ? { type: 'system', citationUrl: canonical.citation_url, definition: canonical.definition } : null
    }
  };
}
```

### Class 4 — Equipment make lookup

```javascript
async function handleClass4(makeSlug, client) {
  const [makeResult, productsResult] = await Promise.all([
    client.query(`SELECT slug, display_name FROM kg_equipment_makes WHERE slug = $1`, [makeSlug]),
    client.query(`
      SELECT DISTINCT ec.sku, ec.description, ec.filter_type, ec.technology,
             ec.oem_codes, ec.competitor_codes, ec.equipment_applications
      FROM elimfilters_catalog ec
      JOIN kg_product_equipment pe ON pe.product_sku = ec.sku
      JOIN kg_equipment_models mod ON mod.id = pe.model_id
      JOIN kg_equipment_makes mk ON mk.id = mod.make_id
      WHERE mk.slug = $1
      ORDER BY ec.sku LIMIT 100
    `, [makeSlug])
  ]);

  const make = makeResult.rows[0];

  return {
    products: productsResult.rows.map(r => ({
      ...r, _score: 40, _classResult: { matchType: 'equipment_match' }
    })),
    kgContext: {
      queryClass: 4,
      matchedMake: make ? { slug: make.slug, displayName: make.display_name } : null
    }
  };
}
```

### Class 5 — General tsvector fallback

```javascript
async function handleClass5(query, client) {
  let products = [];
  let searchMode = 'ilike'; // fallback if search_vector not available

  // Check if tsvector column exists (Phase 5)
  const tsCheck = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'elimfilters_catalog' AND column_name = 'search_vector'
  `);

  if (tsCheck.rows.length > 0) {
    searchMode = 'tsvector';
    const result = await client.query(`
      SELECT sku, description, filter_type, technology,
             oem_codes, competitor_codes, equipment_applications,
             ts_rank(search_vector, plainto_tsquery('english', $1)) AS ts_score
      FROM elimfilters_catalog
      WHERE search_vector @@ plainto_tsquery('english', $1)
      ORDER BY ts_score DESC
      LIMIT 100
    `, [query]);
    products = result.rows.map(r => ({
      ...r,
      _score: Math.round((parseFloat(r.ts_score) || 0) * 30),
      _classResult: { matchType: 'tsvector_match' }
    }));
  } else {
    // ILIKE fallback (existing behavior)
    const result = await client.query(`
      SELECT sku, description, filter_type, technology,
             oem_codes, competitor_codes, equipment_applications
      FROM elimfilters_catalog
      WHERE UPPER(sku) LIKE '%' || $1 || '%'
         OR UPPER(description::text) LIKE '%' || $1 || '%'
      LIMIT 40
    `, [query.toUpperCase()]);
    products = result.rows.map(r => ({
      ...r, _score: 20, _classResult: { matchType: 'ilike_match' }
    }));
  }

  return {
    products,
    kgContext: { queryClass: 5, searchMode }
  };
}
```

---

## 5. A/B TESTING STRATEGY

To validate KG search quality before making `?mode=kg` the default:

### Comparison Metric: Result Relevance Score

For each test query, compare:
- **Control:** `/api/search?q=X` (existing behavior)
- **Variant:** `/api/search?q=X&mode=kg` (KG-enhanced)

### Test Query Set

```
Class 1 queries (SKU/part number):
  - "EL82100"          → expect: exact SKU match at position 1
  - "P552100"          → expect: DONALDSON crossref match
  - "LF3000"           → expect: FLEETGUARD crossref match

Class 2 queries (technology):
  - "NANOFORCE"        → expect: hydraulic filters, all NANOFORCE
  - "macrocore filter" → expect: air filters, all MACROCORE
  - "SYNTAPORE"        → expect: fuel filters (legacy name → syntepore)

Class 3 queries (system):
  - "hydraulic filter" → expect: hydraulic system products
  - "fuel water separator" → expect: fuel system, turbine/fuel filter_type
  - "cabin air"        → expect: cabin filter products

Class 4 queries (equipment):
  - "JOHN DEERE"       → expect: products fitting John Deere equipment
  - "CAT 320"          → expect: Caterpillar excavator products
  - "Cummins ISX"      → expect: products for Cummins ISX engine

Class 5 queries (general):
  - "heavy duty oil"   → expect: lube-oil filter products
  - "high pressure seal" → expect: hydraulic products
```

### Acceptance Criteria

KG mode is considered ready for default activation when:
- Class 1: Top result matches expected SKU in 100% of test cases
- Class 2: All results share the queried technology in 90%+ of test cases
- Class 3: All results are from the correct filtration system in 85%+ of test cases
- Class 4: All results fit equipment from the queried make in 80%+ of test cases
- Class 5: tsvector results are at least as relevant as existing ILIKE results

---

## 6. PERFORMANCE CONSIDERATIONS

| Query Class | Expected Latency | Bottleneck |
|------------|-----------------|-----------|
| Class 1 (exact SKU) | < 20ms | Single row lookup |
| Class 1 (crossref) | < 50ms | JOIN on kg_product_crossrefs |
| Class 2 (technology) | < 100ms | JOIN on kg_product_technologies |
| Class 3 (system) | < 100ms | JOIN on kg_product_systems |
| Class 4 (equipment) | < 150ms | Multi-JOIN through equipment tables |
| Class 5 (tsvector) | < 200ms | Full-text index scan on 4,622 rows |
| Class 5 (pgvector) | < 500ms | Includes OpenAI API roundtrip (~200ms) + vector search |

**Index requirements for Phase 7 performance:**
```sql
-- These indexes should exist from Phases 2 and 3:
CREATE INDEX IF NOT EXISTS idx_kg_product_crossrefs_ref_code  ON kg_product_crossrefs(UPPER(ref_code));
CREATE INDEX IF NOT EXISTS idx_kg_product_crossrefs_product_sku ON kg_product_crossrefs(product_sku);
CREATE INDEX IF NOT EXISTS idx_kg_pe_sku ON kg_product_equipment(product_sku);
```

---

## 7. RELATIONSHIP TO OTHER PHASES

```
Phase 6 (API infrastructure) ──► Phase 7 adds /api/kg/search route to knowledge.routes.js
Phase 7 (this) ─────────────► Phase 8 uses classification logic for KG-aware sitemap generation
```

Phase 7 does not require any new database tables.
All queries are against tables created in Phases 1–5.
