# IMPLEMENTATION_PLAN.md
# ELIMFILTERS — KG Phase 6: KG REST API Implementation Plan
# Industrial Knowledge Graph

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Status:** READY FOR EXECUTION — after Phases 1–5 complete
**Estimated execution time:** 2–4 hours

---

## 1. DEPENDENCY GRAPH

```
Phase 1 (REQUIRED)
  kg_systems ──────────────────────────────────────────────────┐
  kg_technologies ─────────────────────────────────────────────┤
  kg_product_systems ──────────────────────────────────────────┤
  kg_product_technologies ─────────────────────────────────────┤
                                                               │
Phase 2 (REQUIRED for equipment endpoints)                     │
  kg_equipment_makes ──────────────────────────────────────────┤
  kg_equipment_models ─────────────────────────────────────────┼──► Phase 6
  kg_product_equipment ────────────────────────────────────────┤   routes/knowledge.routes.js
                                                               │
Phase 3 (REQUIRED for crossrefs in /products/:sku)            │
  kg_product_crossrefs ────────────────────────────────────────┤
                                                               │
Phase 4 (REQUIRED for canonical blocks)                        │
  kg_canonical_blocks ─────────────────────────────────────────┘
  kg_concept_links
```

**Phase 5 (pgvector/embeddings):** NOT required for Phase 6 core endpoints.
Embeddings are used only in Phase 7 semantic search (Track A). Phase 6 proceeds
with or without Phase 5.

### Verification before starting Phase 6:

```sql
-- All must return non-zero rows:
SELECT COUNT(*) FROM kg_systems;                -- expect 6
SELECT COUNT(*) FROM kg_technologies;           -- expect 13
SELECT COUNT(*) FROM kg_product_systems;        -- expect 4622
SELECT COUNT(*) FROM kg_product_technologies;   -- expect 4622
SELECT COUNT(*) FROM kg_equipment_makes;        -- expect 50-80
SELECT COUNT(*) FROM kg_equipment_models;       -- expect 500-1500
SELECT COUNT(*) FROM kg_product_equipment;      -- expect 2000-5000
SELECT COUNT(*) FROM kg_canonical_blocks;       -- expect 30-50+
```

If any query fails (table does not exist), resolve the relevant earlier Phase before proceeding.

---

## 2. FILE CREATION LIST

```
routes/
└── knowledge.routes.js          ← PRIMARY — create this file (Phase 6 routes)

(Optional, for code organization)
controllers/
└── knowledge.controller.js      ← Optional — extract query logic if knowledge.routes.js
                                    grows beyond ~500 lines. Not required at launch.
```

**The server.js already has the `require('./routes/knowledge.routes')` block** (lines 73–83).
No modification to server.js is needed except adding the `app.use('/api/kg', knowledgeRoutes)`
mount line. See Section 5.

---

## 3. IMPLEMENTATION SEQUENCE

### Step 1: Scaffold routes/knowledge.routes.js

```javascript
'use strict';
const express  = require('express');
const { Client } = require('pg');
const router   = express.Router();

// DB config (same as server.js — extract to shared module in future refactor)
const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: 'ballast.proxy.rlwy.net',
      port: 18263,
      database: 'railway',
      user: 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    };

// Minimal in-memory cache (no external dependency)
const _cache = new Map();
function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry || Date.now() > entry.exp) { _cache.delete(key); return null; }
  return entry.data;
}
function cacheSet(key, data, ttlMs) {
  _cache.set(key, { data, exp: Date.now() + ttlMs });
}
const TTL_1H  = 60 * 60 * 1000;
const TTL_24H = 24 * 60 * 60 * 1000;

// Pagination helper
function paginate(req) {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  return { page, limit, offset: (page - 1) * limit };
}

module.exports = router;
```

### Step 2: Implement read-only reference endpoints first

Implement in this order (simplest to most complex):

1. `GET /systems` — single JOIN, no pagination needed
2. `GET /technologies` — single JOIN + COUNT
3. `GET /canonical` — single table query
4. `GET /canonical/:type/:slug` — single row lookup
5. `GET /equipment/makes` — two JOINs + COUNT
6. `GET /graph` — multiple queries, merge in Node.js

### Step 3: Implement product context endpoints

7. `GET /systems/:slug` — multi-query (system detail + technologies + paginated products)
8. `GET /technologies/:slug` — multi-query (tech detail + canonical + paginated products)
9. `GET /equipment/makes/:makeSlug/models` — make + models + product counts
10. `GET /products/:sku` — most complex (6 parallel queries via Promise.all)

### Step 4: Register route in server.js

Add this single line to server.js immediately after the `require()` + fallback block:

```javascript
app.use('/api/kg', knowledgeRoutes);
```

**Exact placement in server.js:**

```javascript
// EXISTING CODE (lines 73-83):
let knowledgeRoutes;
try {
  knowledgeRoutes = require('./routes/knowledge.routes');
  console.log('[routes] Knowledge routes loaded ✅');
} catch (err) {
  console.error('[routes] Failed to load knowledge routes:', err.message);
  const express = require('express');
  knowledgeRoutes = express.Router();
  knowledgeRoutes.get('/', (req, res) => res.json({ status: 'knowledge-api-unavailable' }));
}

// ADD THIS LINE — Phase 6 activation:
app.use('/api/kg', knowledgeRoutes);
```

### Step 5: Integration testing

For each endpoint, run the curl tests from VALIDATION_AND_ROLLBACK.md.

---

## 4. SQL QUERY PATTERNS

### Pattern A: Single resource lookup with canonical block (used in /technologies/:slug and /systems/:slug)

```javascript
async function getTechnologyBySlug(slug, client) {
  const result = await client.query(`
    SELECT
      t.id, t.slug, t.display_name, t.category, t.description, t.logo_file, t.is_active,
      s.slug           AS primary_system_slug,
      s.name           AS primary_system_name,
      cb.definition,
      cb.system_context,
      cb.failure_mechanism,
      cb.industrial_impact,
      cb.related_standards,
      cb.related_technologies,
      cb.industrial_role,
      cb.version,
      cb.last_updated,
      cb.citation_url
    FROM kg_technologies t
    LEFT JOIN kg_systems s ON s.id = t.primary_system_id
    LEFT JOIN kg_canonical_blocks cb
      ON cb.concept_slug = t.slug AND cb.concept_type = 'technology'
    WHERE t.slug = $1
  `, [slug]);
  return result.rows[0] || null;
}
```

### Pattern B: Paginated product list with total count (used in all paginated endpoints)

```javascript
async function getProductsByTechnology(slug, page, limit, systemFilter, client) {
  const offset = (page - 1) * limit;

  // Count query — no LIMIT
  const countResult = await client.query(`
    SELECT COUNT(DISTINCT ec.sku) AS total
    FROM elimfilters_catalog ec
    JOIN kg_product_technologies pt ON pt.product_sku = ec.sku
    JOIN kg_technologies t ON t.id = pt.technology_id
    LEFT JOIN kg_product_systems ps ON ps.product_sku = ec.sku
    LEFT JOIN kg_systems s ON s.id = ps.system_id
    WHERE t.slug = $1
      AND ($2::text IS NULL OR s.slug = $2)
  `, [slug, systemFilter || null]);

  const total = parseInt(countResult.rows[0].total);

  // Data query
  const dataResult = await client.query(`
    SELECT DISTINCT
      ec.sku,
      ec.description,
      ec.filter_type
    FROM elimfilters_catalog ec
    JOIN kg_product_technologies pt ON pt.product_sku = ec.sku
    JOIN kg_technologies t ON t.id = pt.technology_id
    LEFT JOIN kg_product_systems ps ON ps.product_sku = ec.sku
    LEFT JOIN kg_systems s ON s.id = ps.system_id
    WHERE t.slug = $1
      AND ($2::text IS NULL OR s.slug = $2)
    ORDER BY ec.sku
    LIMIT $3 OFFSET $4
  `, [slug, systemFilter || null, limit, offset]);

  return { data: dataResult.rows, total };
}
```

### Pattern C: Multi-query product context (used in /products/:sku — parallel execution)

```javascript
async function getProductKgContext(sku, client) {
  const upperSku = sku.toUpperCase();

  // Run queries in parallel using Promise.all
  const [skuCheck, techRows, sysRows, equipRows, xrefRows, relatedRows] = await Promise.all([
    // Q1: Verify SKU exists
    client.query(
      'SELECT sku FROM elimfilters_catalog WHERE UPPER(sku) = $1',
      [upperSku]
    ),
    // Q2: Technology + canonical block
    client.query(`
      SELECT t.slug, t.display_name, t.category, t.description, t.logo_file,
             cb.definition, cb.system_context, cb.failure_mechanism, cb.industrial_impact,
             cb.related_standards, cb.related_technologies, cb.industrial_role,
             cb.version, cb.last_updated, cb.citation_url
      FROM kg_product_technologies pt
      JOIN kg_technologies t ON t.id = pt.technology_id
      LEFT JOIN kg_canonical_blocks cb
        ON cb.concept_slug = t.slug AND cb.concept_type = 'technology'
      WHERE pt.product_sku = $1
    `, [upperSku]),
    // Q3: System + canonical block
    client.query(`
      SELECT s.slug, s.name, s.description,
             cb.definition, cb.system_context, cb.version, cb.citation_url
      FROM kg_product_systems ps
      JOIN kg_systems s ON s.id = ps.system_id
      LEFT JOIN kg_canonical_blocks cb
        ON cb.concept_slug = s.slug AND cb.concept_type = 'system'
      WHERE ps.product_sku = $1
    `, [upperSku]),
    // Q4: Equipment applications (never selects codigo_base)
    client.query(`
      SELECT m.slug AS model_slug, m.display_name AS model_name,
             m.year_from, m.year_to, m.engine_type,
             mk.slug AS make_slug, mk.display_name AS make_name,
             pe.fit_type
      FROM kg_product_equipment pe
      JOIN kg_equipment_models m  ON m.id  = pe.model_id
      JOIN kg_equipment_makes  mk ON mk.id = m.make_id
      WHERE pe.product_sku = $1
      ORDER BY mk.display_name, m.display_name
    `, [upperSku]),
    // Q5: Cross-references (never selects codigo_base or BASE)
    client.query(`
      SELECT cr.ref_type, cr.manufacturer, cr.ref_code
      FROM kg_product_crossrefs cr
      WHERE cr.product_sku = $1
      ORDER BY cr.ref_type, cr.manufacturer
    `, [upperSku]),
    // Q6: Related products by technology (no codigo_base)
    client.query(`
      SELECT DISTINCT ec.sku, ec.description, ec.filter_type, ec.technology
      FROM elimfilters_catalog ec
      JOIN kg_product_technologies pt2 ON pt2.product_sku = ec.sku
      JOIN kg_product_technologies pt1 ON pt1.technology_id = pt2.technology_id
      WHERE pt1.product_sku = $1
        AND ec.sku != $1
      LIMIT 6
    `, [upperSku])
  ]);

  if (!skuCheck.rows.length) return null; // 404

  // Assemble crossrefs by type
  const crossrefs = { oem: [], competitor: [], brand: [] };
  for (const row of xrefRows.rows) {
    const bucket = crossrefs[row.ref_type] || crossrefs.oem;
    bucket.push({ manufacturer: row.manufacturer, code: row.ref_code });
  }

  return {
    sku: upperSku,
    technology: buildTechContext(techRows.rows[0]),
    system: buildSysContext(sysRows.rows[0]),
    equipment: equipRows.rows.map(buildEquipRow),
    crossrefs,
    relatedProducts: relatedRows.rows
  };
}
```

### Pattern D: Graph assembly from multiple tables

```javascript
async function getGraph(includeProducts, typeFilter, client) {
  const nodes = [];
  const edges = [];

  // Fetch all node types in parallel
  const [techRows, sysRows, cbRows, linkRows] = await Promise.all([
    client.query(`
      SELECT 'technology:' || slug AS id, 'technology' AS type, slug, display_name AS label, category
      FROM kg_technologies WHERE is_active = TRUE
    `),
    client.query(`
      SELECT 'system:' || slug AS id, 'system' AS type, slug, name AS label
      FROM kg_systems
    `),
    client.query(`
      SELECT concept_type || ':' || concept_slug AS id,
             concept_type AS type, concept_slug AS slug, display_name AS label
      FROM kg_canonical_blocks WHERE concept_type NOT IN ('technology', 'system')
    `),
    client.query(`
      SELECT source_type || ':' || source_concept_slug AS source,
             target_type || ':' || target_concept_slug AS target,
             link_type
      FROM kg_concept_links
    `)
  ]);

  nodes.push(...techRows.rows, ...sysRows.rows, ...cbRows.rows);
  edges.push(...linkRows.rows);

  // Add primary system edges for technologies
  const techSysEdges = techRows.rows.map(t => ({
    source: t.id,
    target: 'system:' + (/* primary system slug from JOIN */ ''),
    linkType: 'applies_to'
  }));
  // NOTE: primary system slug requires separate query or JOIN — see full implementation

  return { nodes, edges };
}
```

---

## 5. ERROR HANDLING PATTERNS

### 404 — Resource not found

```javascript
router.get('/technologies/:slug', async (req, res) => {
  const { slug } = req.params;
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const tech = await getTechnologyBySlug(slug, client);
    if (!tech) {
      return res.status(404).json({
        success: false,
        error: `Technology '${slug}' not found`
      });
    }
    return res.json({ success: true, data: tech });
  } catch (err) {
    console.error('[kg:technologies/:slug]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    await client.end();
  }
});
```

### 400 — Invalid parameter

```javascript
const VALID_CONCEPT_TYPES = ['technology', 'system', 'contamination_mode', 'standard', 'industry'];

router.get('/canonical/:type/:slug', async (req, res) => {
  const { type, slug } = req.params;
  if (!VALID_CONCEPT_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid concept type '${type}'. Must be one of: ${VALID_CONCEPT_TYPES.join(', ')}`
    });
  }
  // ... continue ...
});
```

### 503 — KG not initialized (graceful degradation)

```javascript
// Check KG readiness at route level
async function kgReady(client) {
  try {
    await client.query("SELECT to_regclass('kg_systems')");
    return true;
  } catch {
    return false;
  }
}

// In each route handler:
if (!(await kgReady(client))) {
  return res.status(503).json({
    success: false,
    error: 'Knowledge Graph not yet initialized. Run Phase 1 migration first.'
  });
}
```

---

## 6. INTEGRATION WITH server.js

### Current state (already in server.js):

```javascript
// Lines 73-83 — already loads routes/knowledge.routes.js with fallback
let knowledgeRoutes;
try {
  knowledgeRoutes = require('./routes/knowledge.routes');
} catch (err) { ... }
```

### Required addition (one line):

```javascript
// Add AFTER the require block, BEFORE the first app.get('/api/...') catalog route
app.use('/api/kg', knowledgeRoutes);
```

**This is the ONLY modification to server.js for Phase 6.**
All other Phase 6 code lives in `routes/knowledge.routes.js`.

### Verification after adding the line:

```bash
node -e "require('./server.js')" 2>&1 | grep '\[routes\]'
# Expected output: [routes] Knowledge routes loaded ✅
```

---

## 7. DB CONNECTION MANAGEMENT

Phase 6 routes use the same `new Client(dbConfig)` pattern as existing server.js endpoints.
Each request creates a new client, connects, queries, and ends in a finally block.

**Note:** This is the existing pattern throughout server.js. For Phase 6, follow the same
pattern. A future optimization (Phase 8+) could introduce a connection pool using `pg.Pool`,
but do NOT introduce that change in Phase 6 to avoid altering the existing architecture.

```javascript
// Standard pattern (consistent with existing server.js endpoints):
const client = new Client(dbConfig);
try {
  await client.connect();
  await client.query("SET client_encoding = 'UTF8'");  // match server.js convention
  // ... execute queries ...
  res.json({ success: true, data: result });
} catch (err) {
  console.error('[kg:endpoint]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
} finally {
  await client.end();
}
```

---

## 8. SECURITY CHECKLIST (MANDATORY — VERIFY BEFORE COMMIT)

Before committing routes/knowledge.routes.js, verify each SQL query in the file:

- [ ] No `SELECT *` without explicit column list — always enumerate columns
- [ ] No SELECT of `codigo_base` column
- [ ] No SELECT of `BASE` column (alias)
- [ ] No SELECT of `MATCHED BY` column (alias)
- [ ] No WHERE clause comparing against `codigo_base`
- [ ] No response object containing `codigo_base`, `base`, or `matched_by` keys
- [ ] All product lookups use `sku` field only

**Grep check before commit:**
```bash
grep -n 'codigo_base\|MATCHED BY\|\.BASE\b' routes/knowledge.routes.js
# Must return zero matches
```

---

## 9. TESTING SEQUENCE

After implementation, run in order:

```bash
# 1. Lint check
node -c routes/knowledge.routes.js

# 2. Load test
node -e "require('./routes/knowledge.routes'); console.log('OK')"

# 3. Start server
node server.js &

# 4. Run validation tests from VALIDATION_AND_ROLLBACK.md
curl -s http://localhost:3000/api/kg/systems | jq '.success'
curl -s http://localhost:3000/api/kg/technologies | jq '.data | length'
curl -s http://localhost:3000/api/kg/products/EL82100 | jq '.data.sku'
# ... (full test suite in VALIDATION_AND_ROLLBACK.md)

# 5. Verify no existing endpoints broken
curl -s "http://localhost:3000/api/search?q=EL82100" | jq '.count'
curl -s "http://localhost:3000/api/filters/search/vin?model=CUMMINS" | jq '.filters | length'
```

---

## 10. STORAGE IMPACT

Phase 6 adds no new database tables. It is a read-only API layer.

| Component | Storage | Notes |
|-----------|---------|-------|
| routes/knowledge.routes.js | ~20–40 KB | Single JS file |
| In-memory cache | ~1–5 MB | Depends on catalog size; small for 4,622 products |
| DB impact | 0 bytes | No new tables or indexes |

---

## 11. RELATIONSHIP TO FUTURE PHASES

```
Phase 6 (this) ─────────► routes/knowledge.routes.js (read-only KG API)
      │
      ▼
Phase 7 (Semantic Search) — extends /api/search with KG-enhanced ranking
      │                      adds GET /api/kg/search endpoint
      │
      ▼
Phase 8 (GEO) ─────────► GET /api/knowledge (all canonical blocks for AI crawlers)
                          sitemap-ai.xml, llm.txt, robots.txt, JSON-LD
```

Phase 7 builds on Phase 6's route file — the KG search endpoint may be added to
`routes/knowledge.routes.js` or created as a separate route file.

Phase 8 reads from `kg_canonical_blocks` (Phase 4) and uses the Phase 6 route infrastructure.
