# IMPLEMENTATION_PLAN.md
# ELIMFILTERS — KG Phase 5: Embeddings Implementation Plan
# Knowledge Graph Phase 5

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Estimated execution time:** 15–30 minutes (excluding embedding generation API calls)
**Embedding generation time:** ~3–5 minutes for 4,665 entities at batch size 100

---

## 1. DEPENDENCIES

### Required Before Phase 5

| Dependency | Table/Column | Required For | If Missing |
|-----------|-------------|-------------|-----------|
| Phase 1 complete | kg_technologies (13 rows) | Technology entity embeddings | Technology embeddings skipped |
| Phase 1 complete | kg_systems (6 rows) | System entity embeddings | System embeddings skipped |
| Phase 4 complete | kg_canonical_blocks (24+ rows) | Canonical block embeddings | Canonical block embeddings skipped |
| Phase 2 complete | kg_product_equipment (optional) | Richer product embedding content | Graceful degradation: embed without equipment |
| Phase 3 complete | kg_product_crossrefs (optional) | OEM codes in product embedding | Graceful degradation: embed without OEM codes |

**Minimum viable Phase 5:** Only `elimfilters_catalog` is required.
Track B (tsvector) runs on the catalog alone with no other dependencies.

### Phase 5 Does NOT Depend On:
- Phase 6 (KG API routes)
- Phase 7 (Frontend integration)

---

## 2. TRACK A VS TRACK B DECISION TREE

```
Start Phase 5
     │
     ▼
Step 1: Run 001_schema_tsvector.sql (ALWAYS)
     │ Adds search_vector column, populates, creates GIN index
     │
     ▼
Step 2: Check pgvector availability
     │
     │  On Render Shell:
     │  SELECT extname FROM pg_extension WHERE extname = 'vector';
     │  OR: CREATE EXTENSION IF NOT EXISTS vector;
     │
     ├─── 1 row returned (or CREATE succeeded) ───────────────────────────────►
     │                                                                         │
     │  TRACK A — pgvector available                                           │
     │                                                                         │
     │  Run 002_schema_pgvector.sql                                            │
     │    → CREATE EXTENSION vector (if not already)                           │
     │    → CREATE TABLE kg_embeddings with vector(1536) column                │
     │    → Create entity lookup indexes                                       │
     │                                                                         │
     │  Run scripts/generate-embeddings.js                                     │
     │    → Generates embeddings for products (4,622), techs (13),             │
     │      systems (6), canonical blocks (24+)                                │
     │    → Stores in kg_embeddings with content_hash                          │
     │                                                                         │
     │  Build IVFFlat index (after full population):                           │
     │    CREATE INDEX USING ivfflat (embedding vector_cosine_ops)             │
     │    WITH (lists = 100);                                                  │
     │                                                                         │
     │  Run validate.sql (both Track A and Track B sections)                   │
     │                                                                         │
     │  Phase 5 Track A COMPLETE ✅                                            │
     │  Search capability: vector similarity + tsvector full-text              │
     │                                                                         │
     ◄─────────────────────────────────────────────────────────────────────────
     │
     │  0 rows returned AND CREATE EXTENSION fails
     │
     │  TRACK B — pgvector not available
     │
     │  Skip 002_schema_pgvector.sql
     │  Skip scripts/generate-embeddings.js
     │
     │  Run validate.sql (Track B sections only)
     │
     │  Phase 5 Track B COMPLETE ✅
     │  Search capability: tsvector full-text search only
     │
     │  Document in deployment notes:
     │    "pgvector not available — Track A deferred.
     │     See PGVECTOR_STATUS.md Option D for upgrade path."
     │
     ▼
Phase 5 COMPLETE
```

---

## 3. IMPLEMENTATION SEQUENCE

### Step 1 — tsvector Schema (ALWAYS)

**Script:** `migrations/kg-phase5/001_schema_tsvector.sql`
**Time:** ~30–60 seconds (4,622 row UPDATE)
**Idempotent:** YES (IF NOT EXISTS + full table UPDATE)

Actions:
1. `ALTER TABLE elimfilters_catalog ADD COLUMN IF NOT EXISTS search_vector tsvector`
2. `UPDATE elimfilters_catalog SET search_vector = ...` (weighted by column importance)
3. `CREATE INDEX IF NOT EXISTS ... USING GIN(search_vector)`

Expected output:
```
ALTER TABLE
UPDATE 4622
CREATE INDEX
```

---

### Step 2 — pgvector Schema (Track A only)

**Script:** `migrations/kg-phase5/002_schema_pgvector.sql`
**Time:** ~5 seconds
**Idempotent:** YES (IF NOT EXISTS)

Actions:
1. `CREATE EXTENSION IF NOT EXISTS vector` (guarded by pg_extension check)
2. `CREATE TABLE IF NOT EXISTS kg_embeddings (... embedding vector(1536) ...)`
3. Create entity and hash indexes

Expected output:
```
CREATE EXTENSION (or NOTICE: extension "vector" already exists)
CREATE TABLE
CREATE INDEX (×2)
```

---

### Step 3 — Embedding Generation (Track A only)

**Script:** `scripts/generate-embeddings.js` (not yet implemented — specification in ARCHITECTURE.md)
**Time:** ~3–5 minutes for 4,665 entities
**Prerequisites:**
- OPENAI_API_KEY environment variable set
- kg_embeddings table exists (Step 2 complete)
- kg_canonical_blocks populated (Phase 4 complete)

**Run command:**
```bash
EMBEDDING_PROVIDER=openai node scripts/generate-embeddings.js
```

Expected log output:
```
[INFO] Phase 5: Embedding Generation
[INFO] Checking entities needing embedding...
[INFO] Products needing embedding: 4622
[INFO] Technologies needing embedding: 13
[INFO] Systems needing embedding: 6
[INFO] Canonical blocks needing embedding: 24
[INFO] Total: 4665 entities
[INFO] Batch 1/47 (100 entities)...
...
[INFO] Batch 47/47 (65 entities)...
[INFO] Complete: 4665 embeddings stored
[INFO] API calls: 47
[INFO] Estimated cost: $0.005
```

---

### Step 4 — IVFFlat Vector Index (Track A only, after full population)

Run manually on Render Shell after embedding generation completes:

```sql
-- Build approximate nearest neighbor index
-- Requires ≥ 3 × lists rows already populated (300 rows minimum for lists=100)
-- With 4,665 embeddings, lists=100 is appropriate
CREATE INDEX IF NOT EXISTS idx_kg_emb_vector
ON kg_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Important:** Do not create this index before population — IVFFlat requires training data.
**Time:** ~10–30 seconds for 4,665 rows.

---

### Step 5 — Validation

**Script:** `migrations/kg-phase5/validate.sql`
**Run:** After all applicable steps complete

---

## 4. NODE.JS SCRIPT SPECIFICATION

**File:** `scripts/generate-embeddings.js`
**Status:** Specification only — not implemented in Phase 5 design package

### Required Dependencies (package.json)
```json
{
  "pg": "^8.x",
  "openai": "^4.x",
  "@anthropic-ai/sdk": "^0.x"
}
```

### Script Pseudocode
```javascript
// generate-embeddings.js
// Phase 5: Embedding generation for KG entities
// Provider: configurable via EMBEDDING_PROVIDER env var

const { Client } = require('pg');
const crypto = require('crypto');

const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 100;
const MODEL = 'text-embedding-3-small';
const DIMENSIONS = 1536;

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL,
                           ssl: { rejectUnauthorized: false } });
  await db.connect();

  // 1. Determine entities needing embedding
  //    a. Products: no embedding OR content_hash changed
  const products = await db.query(`
    SELECT c.sku, c.product_name, c.technology, c.filter_type
    FROM elimfilters_catalog c
    LEFT JOIN kg_embeddings e
      ON e.entity_id = c.sku AND e.entity_type = 'product' AND e.model = $1
    WHERE e.id IS NULL
       OR e.content_hash != MD5(
            COALESCE(c.sku,'') || '|' || COALESCE(c.product_name,'') || '|' ||
            COALESCE(c.technology,'') || '|' || COALESCE(c.filter_type,'')
          )
  `, [MODEL]);

  //    b. Technologies from canonical blocks
  const techs = await db.query(`
    SELECT concept_slug AS entity_id, display_name, definition, system_context, failure_mechanism
    FROM kg_canonical_blocks WHERE concept_type = 'technology'
  `);

  //    c. Systems from canonical blocks
  const systems = await db.query(`
    SELECT concept_slug AS entity_id, display_name, definition, system_context, industrial_role
    FROM kg_canonical_blocks WHERE concept_type = 'system'
  `);

  //    d. Canonical blocks (all types)
  const blocks = await db.query(`
    SELECT concept_slug AS entity_id, display_name, definition, system_context,
           failure_mechanism, industrial_impact, industrial_role
    FROM kg_canonical_blocks
  `);

  // 2. Build text content per entity type
  function buildProductText(row) {
    return `${row.sku}: ${row.product_name}\nTechnology: ${row.technology}\nSystem: ${row.filter_type}`;
  }

  function buildTechText(row) {
    return `${row.display_name}\n${row.definition}\n${row.system_context}\n${row.failure_mechanism}`;
  }

  function buildSystemText(row) {
    return `${row.display_name}\n${row.definition}\n${row.system_context}\n${row.industrial_role}`;
  }

  function buildBlockText(row) {
    return [row.display_name, row.definition, row.system_context,
            row.failure_mechanism, row.industrial_impact, row.industrial_role]
      .filter(Boolean).join('\n');
  }

  // 3. Compute content hash
  function contentHash(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  // 4. Collect all entity batches
  const allEntities = [
    ...products.rows.map(r => ({
      entity_type: 'product', entity_id: r.sku,
      text: buildProductText(r), hash: contentHash(buildProductText(r))
    })),
    ...techs.rows.map(r => ({
      entity_type: 'technology', entity_id: r.entity_id,
      text: buildTechText(r), hash: contentHash(buildTechText(r))
    })),
    ...systems.rows.map(r => ({
      entity_type: 'system', entity_id: r.entity_id,
      text: buildSystemText(r), hash: contentHash(buildSystemText(r))
    })),
    ...blocks.rows.map(r => ({
      entity_type: 'canonical_block', entity_id: r.entity_id,
      text: buildBlockText(r), hash: contentHash(buildBlockText(r))
    }))
  ];

  console.log(`[INFO] Total entities to embed: ${allEntities.length}`);

  // 5. Process in batches
  const openai = require('openai');
  const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  for (let i = 0; i < allEntities.length; i += BATCH_SIZE) {
    const batch = allEntities.slice(i, i + BATCH_SIZE);
    const texts = batch.map(e => e.text);

    console.log(`[INFO] Batch ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(allEntities.length/BATCH_SIZE)}`);

    const response = await client.embeddings.create({
      model: MODEL,
      input: texts,
      dimensions: DIMENSIONS
    });

    // 6. Store embeddings with ON CONFLICT DO UPDATE
    for (let j = 0; j < batch.length; j++) {
      const entity = batch[j];
      const vector = response.data[j].embedding;
      const vectorStr = `[${vector.join(',')}]`;

      await db.query(`
        INSERT INTO kg_embeddings (entity_type, entity_id, content_hash, embedding, model)
        VALUES ($1, $2, $3, $4::vector, $5)
        ON CONFLICT (entity_type, entity_id, model) DO UPDATE SET
          content_hash = EXCLUDED.content_hash,
          embedding    = EXCLUDED.embedding,
          updated_at   = NOW()
      `, [entity.entity_type, entity.entity_id, entity.hash, vectorStr, MODEL]);
    }

    // 7. Rate limiting delay
    if (i + BATCH_SIZE < allEntities.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.log(`[INFO] Embedding generation complete`);
  await db.end();
}

main().catch(err => { console.error(err); process.exit(1); });
```

---

## 5. RE-EMBEDDING TRIGGER STRATEGY

### When to Re-Embed

| Trigger Event | Affected Entities | Action |
|--------------|------------------|--------|
| product_name or technology column updated in catalog | Specific product SKUs | Re-run generate-embeddings.js (staleness detection handles it) |
| kg_canonical_blocks definition updated (version incremented) | Specific concept_slug | Re-run generate-embeddings.js |
| New products added to catalog | New SKU rows | Re-run generate-embeddings.js |
| Embedding model upgrade (e.g., ada-002 → text-embedding-3-small) | ALL entities | DELETE FROM kg_embeddings WHERE model='old-model'; re-run with new model |
| Full catalog refresh | ALL 4,622 products | TRUNCATE kg_embeddings; re-run generate-embeddings.js |

### Staleness Detection SQL
```sql
-- Products with stale or missing embeddings
SELECT COUNT(*) AS stale_product_embeddings
FROM elimfilters_catalog c
LEFT JOIN kg_embeddings e
  ON e.entity_id = c.sku AND e.entity_type = 'product' AND e.model = 'text-embedding-3-small'
WHERE e.id IS NULL
   OR e.content_hash != MD5(
        COALESCE(c.sku,'') || '|' || COALESCE(c.product_name,'') || '|' ||
        COALESCE(c.technology,'') || '|' || COALESCE(c.filter_type,'')
      );
```

### PostgreSQL Trigger (Optional — for automatic staleness flagging)
A trigger on `elimfilters_catalog` UPDATE can set a `needs_reembed` boolean flag.
The generate-embeddings.js script then queries this flag instead of computing all hashes.
Implementation in Phase 7 (API layer) if needed.

---

## 6. EXECUTION CHECKLIST

### Track B (tsvector — ALWAYS)
```
□ Run 001_schema_tsvector.sql
□ Verify: search_vector column exists in elimfilters_catalog
□ Verify: GIN index idx_elimfilters_search_vector created
□ Verify: SELECT COUNT(*) FROM elimfilters_catalog WHERE search_vector IS NOT NULL; → 4622
□ Test search: SELECT sku, product_name FROM elimfilters_catalog,
               plainto_tsquery('english', 'air filter') q
               WHERE search_vector @@ q LIMIT 5;
               -- Must return relevant results
□ Run validate.sql Track B section
□ Track B COMPLETE ✅
```

### Track A (pgvector — conditional)
```
□ Verify pgvector available: SELECT extname FROM pg_extension WHERE extname = 'vector';
□ Run 002_schema_pgvector.sql
□ Verify: kg_embeddings table exists with vector(1536) column
□ Set environment variables: OPENAI_API_KEY, EMBEDDING_PROVIDER=openai, DATABASE_URL
□ Run: node scripts/generate-embeddings.js
□ Monitor: Check log output for batch progress
□ Verify: SELECT COUNT(*) FROM kg_embeddings; → ~4665
□ Verify: SELECT COUNT(*) FROM kg_embeddings WHERE entity_type='product'; → 4622
□ Build IVFFlat index: CREATE INDEX USING ivfflat (embedding vector_cosine_ops) WITH (lists=100)
□ Test vector search: SELECT entity_id FROM kg_embeddings
                      ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector LIMIT 5;
□ Run validate.sql Track A section
□ Track A COMPLETE ✅
```

---

## 7. STORAGE ALLOCATION

| Phase 5 Component | Size | PostgreSQL Plan Required |
|-------------------|------|------------------------|
| search_vector column + GIN index | ~15 MB | Any plan |
| kg_embeddings data (~4,665 rows × 6KB) | ~28 MB | Any plan with pgvector |
| IVFFlat index (~3× data) | ~84 MB | Any plan with pgvector |
| **Track B total** | **~15 MB** | Any plan |
| **Track A + B total** | **~127 MB** | pgvector plan |

Render PostgreSQL Starter: 1 GB. Phase 5 uses 12.7% at maximum (Track A + B).

---

## 8. RELATIONSHIP TO OTHER PHASES

```
Phase 1 (kg_technologies, kg_systems) ← entity IDs for tech/system embeddings
Phase 4 (kg_canonical_blocks) ← source content for knowledge embeddings
Phase 2 (kg_product_equipment) ← optional: enriches product embedding content
Phase 3 (kg_product_crossrefs) ← optional: OEM codes in product embedding content
     ↓
Phase 5 (kg_embeddings, search_vector) ← THIS PHASE
     ↓ embedding vectors feed into
Phase 7 (KG API) ← /api/search?q=... endpoint uses kg_embeddings for semantic search
     ↓
Phase 8 (Frontend) ← Part Search frontend semantic search feature
```
