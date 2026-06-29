# PGVECTOR_STATUS.md
# ELIMFILTERS — pgvector Extension Readiness
# KG Phase 0 Readiness Audit

> ⚠️ Cannot query DB directly from local environment.
> **Must verify on Render Shell before Phase 6 (Embeddings).**

---

## HOW TO VERIFY

On Render Shell:
```sql
SELECT extname, extversion FROM pg_extension ORDER BY extname;
SELECT extname FROM pg_extension WHERE extname = 'vector';
```

Or via Node:
```bash
node -e "
const {Client} = require('pg');
const c = new Client({connectionString: process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}});
c.connect().then(async () => {
  const r = await c.query(\"SELECT extname, extversion FROM pg_extension ORDER BY extname\");
  console.log(r.rows);
  await c.end();
});
"
```

---

## RAILWAY POSTGRESQL PGVECTOR STATUS

**Railway PostgreSQL (free/hobby tiers):** pgvector is available but must be explicitly enabled.

**To enable pgvector on Railway:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Railway docs confirm:** pgvector is supported on Railway PostgreSQL as of 2024+.

---

## WHAT pgvector ENABLES

| Feature | SQL | Notes |
|---------|-----|-------|
| Store embeddings | `embedding vector(1536)` column | OpenAI ada-002 or text-embedding-3-small |
| Exact nearest neighbor | `ORDER BY embedding <-> query_vec LIMIT 5` | L2 distance |
| Cosine similarity | `ORDER BY embedding <=> query_vec LIMIT 5` | For semantic search |
| Inner product | `ORDER BY embedding <#> query_vec LIMIT 5` | For normalized vectors |
| ANN index (IVFFlat) | `CREATE INDEX USING ivfflat (embedding vector_cosine_ops)` | Fast approximate search |
| ANN index (HNSW) | `CREATE INDEX USING hnsw (embedding vector_cosine_ops)` | Better recall |

---

## EMBEDDING DIMENSIONS

| Model | Dimensions | Cost per 1M tokens |
|-------|-----------|-------------------|
| OpenAI text-embedding-3-small | 1536 | $0.02 |
| OpenAI text-embedding-3-large | 3072 | $0.13 |
| OpenAI text-embedding-ada-002 | 1536 | $0.10 |
| Voyage AI voyage-2 | 1024 | $0.10 |

**Recommended:** `text-embedding-3-small` at 1536 dims. Best cost/performance for this use case.

---

## STORAGE ESTIMATE

| Entity | Count | Dims | Bytes/row | Total |
|--------|-------|------|-----------|-------|
| Products | ~4,622 | 1536 | ~6 KB | ~28 MB |
| Canonical blocks | ~50 | 1536 | ~6 KB | ~300 KB |
| Knowledge pages | ~25 | 1536 | ~6 KB | ~150 KB |
| **Total** | ~4,700 | — | — | **~29 MB** |

With IVFFlat index (~3x overhead): ~87 MB
**Well within Railway PostgreSQL limits.**

---

## ALTERNATIVE IF pgvector UNAVAILABLE

If `CREATE EXTENSION vector` fails (not enabled on plan):

**Option A — Upgrade Railway plan**
Railway Pro plan has pgvector enabled.

**Option B — Supabase pgvector**
Move KG to Supabase which has pgvector built-in with UI.
Keep elimfilters_catalog on Railway, add kg_embeddings on Supabase.
More complex but works.

**Option C — Store as BYTEA + application-layer similarity**
Store float arrays as BYTEA, compute cosine similarity in Node.js.
Slower but zero-cost fallback. Acceptable for <10,000 embeddings.

**Option D — Defer embeddings**
Complete KG Phases 1–5 without embeddings.
Add Phase 6 later when vector search is confirmed available.

---

## RECOMMENDATION

1. Verify on Render Shell **before starting Phase 6**
2. Run `CREATE EXTENSION IF NOT EXISTS vector` — safe, idempotent
3. If it works → proceed with Phase 6 as designed
4. If it fails → implement Option D (defer) and use standard PostgreSQL full-text search as interim

---

## STATUS

| Item | Status |
|------|--------|
| pgvector availability verified | ⚠️ PENDING — run on Render Shell |
| Railway plan checked | ⚠️ PENDING |
| Extension enabled | ⚠️ PENDING |
| Embedding model chosen | ✅ text-embedding-3-small recommended |
| Storage estimate | ✅ ~29 MB (within limits) |
