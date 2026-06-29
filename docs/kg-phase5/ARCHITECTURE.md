# ARCHITECTURE.md
# ELIMFILTERS — KG Phase 5: Embeddings Architecture
# Knowledge Graph Design Document

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Depends on:** Phase 1 (equipment data), Phase 3 (OEM cross-references), Phase 4 (canonical blocks)
**Status:** DESIGN COMPLETE — pgvector availability must be verified before execution

---

## 1. OBJECTIVE

Phase 5 creates vector embedding infrastructure to enable semantic search across the
ELIMFILTERS product catalog and knowledge system. It operates in two parallel tracks:

- **Track B (tsvector):** Always runs. PostgreSQL full-text search on `elimfilters_catalog`.
  Zero dependencies on external services. Provides basic semantic search immediately.

- **Track A (pgvector):** Runs ONLY if pgvector extension is available on Render.
  Stores 1536-dimensional OpenAI text-embedding-3-small vectors for semantic similarity
  search across products, technologies, systems, and canonical blocks.

Both tracks are complementary — Track B provides keyword search as fallback or supplement
to Track A vector search.

---

## 2. pgvector SITUATION

Reference: `docs/kg-phase0/PGVECTOR_STATUS.md`

**Current status:** UNCONFIRMED — must verify on Render Shell before Phase 5 execution.

**Verification command (run on Render Shell):**
```sql
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

**If result is 1 row → Track A available**
**If result is 0 rows → attempt `CREATE EXTENSION IF NOT EXISTS vector;`**
**If CREATE EXTENSION fails → proceed with Track B only**

Historical context:
- Railway PostgreSQL (previous host): pgvector available as of 2024+, must be explicitly enabled
- Render PostgreSQL: pgvector availability depends on plan tier and PostgreSQL version
- Recommended: Render Starter or Pro plan with PostgreSQL 15+ (pgvector 0.5+ compatible)
- Alternative if Render does not support pgvector: see PGVECTOR_STATUS.md Option B (Supabase) or Option D (defer)

---

## 3. DUAL-TRACK DESIGN

```
┌─────────────────────────────────────────────────────────────────────┐
│ Phase 5 Execution                                                   │
│                                                                     │
│  Step 1 (always): Run 001_schema_tsvector.sql                       │
│    → Adds search_vector tsvector column to elimfilters_catalog      │
│    → Creates GIN index for full-text search                         │
│    → Populates from existing text columns                           │
│                                                                     │
│  Step 2 (conditional):                                              │
│    IF pgvector available:                                           │
│      Run 002_schema_pgvector.sql                                    │
│        → CREATE EXTENSION vector                                    │
│        → CREATE TABLE kg_embeddings (vector(1536))                  │
│        → Run scripts/generate-embeddings.js                         │
│    ELSE:                                                            │
│      Skip — Track B (tsvector) is the active search mechanism       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. SCHEMA: kg_embeddings (Track A — pgvector required)

```sql
CREATE TABLE IF NOT EXISTS kg_embeddings (
  id           SERIAL       PRIMARY KEY,
  entity_type  VARCHAR(30)  NOT NULL,  -- 'product' | 'technology' | 'system' | 'canonical_block'
  entity_id    VARCHAR(100) NOT NULL,  -- SKU for products, slug for knowledge entities
  content_hash VARCHAR(64)  NOT NULL,  -- MD5 of embedding source text — used for staleness detection
  embedding    vector(1536) NOT NULL,  -- OpenAI text-embedding-3-small dimensions
  model        VARCHAR(50)  NOT NULL DEFAULT 'text-embedding-3-small',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_embedding_entity_model UNIQUE (entity_type, entity_id, model)
);
```

**Column specifications:**

| Column | Type | Purpose |
|--------|------|---------|
| entity_type | VARCHAR(30) | Constrained: product, technology, system, canonical_block |
| entity_id | VARCHAR(100) | SKU for products; concept_slug for technology/system/canonical_block |
| content_hash | VARCHAR(64) | MD5 of concatenated embedding source text — staleness check key |
| embedding | vector(1536) | 1536-float vector (OpenAI text-embedding-3-small output) |
| model | VARCHAR(50) | Embedding model identifier — enables multi-model support |

**Indexes:**
```sql
-- Entity lookup (for staleness check by entity)
CREATE INDEX idx_kg_emb_entity ON kg_embeddings(entity_type, entity_id);

-- Content hash lookup (for bulk staleness detection)
CREATE INDEX idx_kg_emb_hash ON kg_embeddings(content_hash);

-- Approximate nearest neighbor search (IVFFlat — fast for top-k)
-- Run AFTER initial population:
-- CREATE INDEX idx_kg_emb_vector ON kg_embeddings
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Note: IVFFlat requires ≥ 3× lists rows for training. With 4,700 embeddings,
-- lists=100 requires ≥ 300 rows. Build index after full population.
```

---

## 5. SCHEMA: tsvector fallback (Track B — always runs)

```sql
ALTER TABLE elimfilters_catalog
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_elimfilters_search_vector
  ON elimfilters_catalog USING GIN(search_vector);
```

**Populated from columns:**
- `sku` (weight A — highest priority)
- `product_name` (weight A)
- `technology` (weight B)
- `filter_type` (weight B)
- `equipment_applications` (weight C — text field if present)
- First 5 OEM codes from `oem_codes` column (weight C)

**Population query:**
```sql
UPDATE elimfilters_catalog
SET search_vector = (
  setweight(to_tsvector('english', COALESCE(sku, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(product_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(technology, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(filter_type, '')), 'B')
);
```

**Usage example:**
```sql
SELECT sku, product_name, technology,
       ts_rank(search_vector, query) AS relevance
FROM elimfilters_catalog,
     plainto_tsquery('english', 'air filter agriculture') query
WHERE search_vector @@ query
ORDER BY relevance DESC
LIMIT 20;
```

---

## 6. CONTENT HASH STRATEGY (Staleness Detection)

Content hash is the MD5 of the concatenated embedding source text.

If hash is unchanged between runs, the embedding is current — skip re-embedding.
If hash changes (source content updated), re-embed the entity.

**Hash computation per entity type:**

| Entity Type | Source Text for Hash |
|------------|---------------------|
| product | sku + '\|' + product_name + '\|' + technology + '\|' + filter_type |
| technology | canonical_block.definition + '\|' + canonical_block.system_context + '\|' + canonical_block.failure_mechanism |
| system | canonical_block.definition + '\|' + canonical_block.system_context + '\|' + industrial_role |
| canonical_block | definition + '\|' + system_context + '\|' + failure_mechanism + '\|' + industrial_impact + '\|' + industrial_role |

**Hash computation in Node.js:**
```javascript
const crypto = require('crypto');
const hash = crypto.createHash('md5')
  .update(sourceText)
  .digest('hex');
```

---

## 7. EMBEDDING CONTENT PER ENTITY TYPE

The text sent to the embedding API is crafted to maximize semantic search relevance:

### Product Embedding Content
```
[SKU]: [product_name]
Technology: [technology]
System: [filter_type]
Equipment: [comma-separated equipment makes from kg_product_equipment (Phase 2)]
OEM codes: [first 5 OEM codes from kg_product_crossrefs (Phase 3)]
```

Example:
```
EF-001234: Air Filter Element Primary
Technology: MACROCORE™
System: Air Intake
Equipment: Caterpillar, Komatsu, Volvo CE
OEM codes: CAT 1R-0739, 1R0739, 1R 0739, KOM 600-185-4110
```

### Technology Embedding Content (from canonical block)
```
[display_name]
[definition]
[system_context]
[failure_mechanism]
```

### System Embedding Content (from canonical block)
```
[display_name]
[definition]
[system_context]
Technologies: [related_technologies slugs joined]
Standards: [related_standards codes joined]
```

### Canonical Block Embedding Content
```
[display_name] ([concept_type])
[definition]
[system_context]
[failure_mechanism]
[industrial_impact]
[industrial_role]
```

---

## 8. EMBEDDING GENERATION PIPELINE

**Script:** `scripts/generate-embeddings.js` (Node.js, specification only — not implemented here)

**Environment variables:**
- `DATABASE_URL` — PostgreSQL connection string
- `EMBEDDING_PROVIDER` — 'openai' | 'anthropic' (default: 'openai')
- `OPENAI_API_KEY` — Required if EMBEDDING_PROVIDER=openai
- `ANTHROPIC_API_KEY` — Required if EMBEDDING_PROVIDER=anthropic

**Pipeline pseudocode:**
```
1. Connect to PostgreSQL
2. Determine entities needing embedding:
   - New entities: no row in kg_embeddings for this entity_id + model
   - Stale entities: content_hash in kg_embeddings ≠ computed hash of current source text
3. For each entity batch (100 entities per API call):
   a. Concatenate embedding content per entity type spec (Section 7)
   b. Compute content_hash (MD5)
   c. Call embedding API (text-embedding-3-small, batch of 100 texts)
   d. Receive 100 × 1536-float vectors
   e. INSERT INTO kg_embeddings with ON CONFLICT DO UPDATE
   f. Wait 100ms (rate limit protection)
4. Log: total entities embedded, API calls made, cost estimate
5. Disconnect
```

**Batch size rationale:** OpenAI text-embedding-3-small supports up to 2,048 inputs per request.
Batch size 100 is conservative to avoid token limit issues and provides clean progress reporting.

---

## 9. VECTOR SEARCH QUERIES (Track A)

### Semantic Product Search
```sql
-- Find products semantically similar to a query
SELECT
  e.entity_id AS sku,
  c.product_name,
  c.technology,
  1 - (e.embedding <=> $1::vector) AS cosine_similarity
FROM kg_embeddings e
JOIN elimfilters_catalog c ON c.sku = e.entity_id
WHERE e.entity_type = 'product'
  AND e.model = 'text-embedding-3-small'
ORDER BY e.embedding <=> $1::vector
LIMIT 20;
-- $1 = query embedding vector (1536 floats)
```

### Semantic Knowledge Search
```sql
-- Find knowledge concepts related to a query
SELECT
  e.entity_type,
  e.entity_id,
  b.display_name,
  b.definition,
  1 - (e.embedding <=> $1::vector) AS cosine_similarity
FROM kg_embeddings e
JOIN kg_canonical_blocks b
  ON b.concept_slug = e.entity_id
WHERE e.entity_type IN ('technology', 'system', 'canonical_block')
  AND e.model = 'text-embedding-3-small'
ORDER BY e.embedding <=> $1::vector
LIMIT 10;
```

---

## 10. STORAGE ESTIMATE

From `docs/kg-phase0/PGVECTOR_STATUS.md`:

| Entity | Count | Dims | Bytes/row | Total |
|--------|-------|------|-----------|-------|
| Products | 4,622 | 1,536 | ~6 KB | ~27.7 MB |
| Technologies | 13 | 1,536 | ~6 KB | ~78 KB |
| Systems | 6 | 1,536 | ~6 KB | ~36 KB |
| Canonical blocks | ~24 | 1,536 | ~6 KB | ~144 KB |
| **Total embeddings** | **4,665** | — | — | **~28 MB** |
| IVFFlat index (~3× overhead) | — | — | — | ~84 MB |
| tsvector column + GIN index | — | — | — | ~15 MB |
| **Phase 5 total** | | | | **~127 MB** |

Render PostgreSQL Starter plan: 1 GB storage. Phase 5 uses ~13% of limit.
Well within capacity — no storage concern.

---

## 11. COST ESTIMATE

**OpenAI text-embedding-3-small:**
- Rate: $0.02 per 1,000,000 tokens
- Average tokens per product embedding: ~50 tokens
- 4,622 products × 50 tokens = 231,100 tokens
- Average tokens per knowledge entity: ~200 tokens
- 43 knowledge entities × 200 tokens = 8,600 tokens
- **Total: ~240,000 tokens**
- **Total cost: ~$0.005 (less than one cent)**

**Note:** The original specification mentioned ada-002 at $0.0001/1000 tokens and ~$0.023
for full catalog. Updated estimate uses text-embedding-3-small (recommended in PGVECTOR_STATUS.md)
which is 5× cheaper than ada-002. Actual cost is negligible regardless of model choice.

For comparison:
- OpenAI ada-002: $0.0001/1000 tokens → ~$0.024 for full catalog
- text-embedding-3-small: $0.00002/1000 tokens → ~$0.005 for full catalog

---

## 12. REINDEX STRATEGY

Embeddings become stale when source content changes. Staleness is detected via content_hash.

**Automatic staleness detection (run periodically or via trigger):**
```sql
-- Find products whose source text may have changed
-- (products with no embedding OR whose embedding hash doesn't match current source)
SELECT c.sku
FROM elimfilters_catalog c
LEFT JOIN kg_embeddings e
  ON e.entity_id = c.sku AND e.entity_type = 'product' AND e.model = 'text-embedding-3-small'
WHERE e.id IS NULL  -- no embedding yet
   OR e.content_hash != MD5(
        COALESCE(c.sku, '') || '|' ||
        COALESCE(c.product_name, '') || '|' ||
        COALESCE(c.technology, '') || '|' ||
        COALESCE(c.filter_type, '')
      );
```

**Manual full reindex:** Delete from kg_embeddings and re-run generate-embeddings.js.
```sql
TRUNCATE TABLE kg_embeddings;
-- Then run: node scripts/generate-embeddings.js
```

---

## 13. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| pgvector not available on Render | MEDIUM | MEDIUM | Track B (tsvector) provides search fallback; Track A deferred |
| OpenAI API key not configured | LOW | MEDIUM | EMBEDDING_PROVIDER env var; script validates before running |
| Rate limit hit during generation | LOW | LOW | 100ms batch delay; 100-entity batch size |
| Dimension mismatch (wrong model) | LOW | HIGH | UNIQUE constraint on (entity_type, entity_id, model); model column distinguishes |
| embedding column NULL after generation | LOW | LOW | NOT NULL constraint; script verifies each batch |
| IVFFlat index needs training rows | MEDIUM | LOW | Build index only after full population; validate.sql checks |
| tsvector staleness (catalog updates) | MEDIUM | LOW | search_vector is not auto-maintained; re-run 001_schema_tsvector.sql UPDATE after catalog changes |
| Phase 2/3 not complete (missing equipment/OEM data) | MEDIUM | MEDIUM | Product embedding degrades gracefully without Phase 2/3 data — omit those fields |
