-- =============================================================================
-- KG PHASE 5 — PGVECTOR EMBEDDINGS SCHEMA (TRACK A)
-- File: 002_schema_pgvector.sql
-- Purpose: Create kg_embeddings table with vector(1536) for semantic search
-- Safe to run: YES (IF NOT EXISTS — idempotent)
-- Run: ONLY if pgvector is available (check Phase 1 step 1.6 result)
--
-- PREREQUISITE CHECK — run this before executing the rest of this script:
--   SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
--   If result = 0 rows → pgvector not available → SKIP this script, use Track B only.
--   If result = 1 row → proceed.
--
-- To attempt pgvector enablement:
--   CREATE EXTENSION IF NOT EXISTS vector;
--   (If this fails with "extension not available", proceed with Track B only)
-- =============================================================================

-- ─── GUARD: Check pgvector availability ──────────────────────────────────────
-- This DO block verifies pgvector is available before creating the table.
-- If pgvector is not installed, it raises an informational notice and exits cleanly.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    RAISE NOTICE
      'pgvector extension not found. Attempting CREATE EXTENSION vector...';
    BEGIN
      EXECUTE 'CREATE EXTENSION IF NOT EXISTS vector';
      RAISE NOTICE 'pgvector enabled successfully. Proceeding with Track A.';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE
        'pgvector not available on this PostgreSQL instance. '
        'Reason: %. '
        'Skip this script and use Track B (tsvector) only. '
        'See docs/kg-phase5/ARCHITECTURE.md for alternatives.',
        SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'pgvector % already installed. Proceeding.', (
      SELECT extversion FROM pg_extension WHERE extname = 'vector'
    );
  END IF;
END;
$$;


-- ─── ENABLE pgvector (if not already enabled) ─────────────────────────────────
-- Safe to run even if already enabled (IF NOT EXISTS).
CREATE EXTENSION IF NOT EXISTS vector;


-- ─── CREATE kg_embeddings table ──────────────────────────────────────────────
-- Stores 1536-dimensional OpenAI text-embedding-3-small vectors for all KG entities.
--
-- Supported entity_type values:
--   'product'          — 4,622 rows from elimfilters_catalog
--   'technology'       — 13 rows from kg_technologies / kg_canonical_blocks
--   'system'           — 6 rows from kg_systems / kg_canonical_blocks
--   'canonical_block'  — ~24+ rows from kg_canonical_blocks (all concept types)
--
-- entity_id values:
--   For products: elimfilters_catalog.sku (e.g., 'EF-001234')
--   For knowledge entities: kg_canonical_blocks.concept_slug (e.g., 'nanoforce')
--
-- content_hash:
--   MD5 of the concatenated source text used to generate the embedding.
--   Used for staleness detection — if hash unchanged, skip re-embedding.
--   Computed as: MD5(field1 || '|' || field2 || ...) per ARCHITECTURE.md §6

CREATE TABLE IF NOT EXISTS kg_embeddings (
  id            SERIAL        PRIMARY KEY,
  entity_type   VARCHAR(30)   NOT NULL,
  entity_id     VARCHAR(100)  NOT NULL,
  content_hash  VARCHAR(64)   NOT NULL,   -- MD5 hex string of embedding source text
  embedding     vector(1536)  NOT NULL,   -- OpenAI text-embedding-3-small (1536 dims)
  model         VARCHAR(50)   NOT NULL DEFAULT 'text-embedding-3-small',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_embedding_entity_model UNIQUE (entity_type, entity_id, model),

  CONSTRAINT chk_entity_type CHECK (
    entity_type IN ('product', 'technology', 'system', 'canonical_block')
  )
);

COMMENT ON TABLE  kg_embeddings               IS 'Vector embeddings for semantic search — Track A (pgvector). 1536-dim text-embedding-3-small vectors for products and knowledge entities';
COMMENT ON COLUMN kg_embeddings.entity_type   IS 'Type: product | technology | system | canonical_block';
COMMENT ON COLUMN kg_embeddings.entity_id     IS 'SKU for products; concept_slug for knowledge entities';
COMMENT ON COLUMN kg_embeddings.content_hash  IS 'MD5 of source text used for embedding — staleness detection key';
COMMENT ON COLUMN kg_embeddings.embedding     IS 'OpenAI text-embedding-3-small, 1536 dimensions. Use <=> for cosine, <-> for L2, <#> for inner product';
COMMENT ON COLUMN kg_embeddings.model         IS 'Embedding model identifier — enables multi-model support if model is upgraded';


-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- Entity lookup index — for staleness check (entity_type + entity_id lookup)
CREATE INDEX IF NOT EXISTS idx_kg_emb_entity
  ON kg_embeddings(entity_type, entity_id);

-- Content hash index — for bulk staleness detection
CREATE INDEX IF NOT EXISTS idx_kg_emb_hash
  ON kg_embeddings(content_hash);

-- ─── NOTE: IVFFlat ANN index ──────────────────────────────────────────────────
-- The vector search index (IVFFlat or HNSW) is NOT created here.
-- It must be created AFTER full population (≥ 300 rows required for lists=100).
-- Run this manually after generate-embeddings.js completes:
--
-- Option A — IVFFlat (faster build, slightly lower recall):
--   CREATE INDEX idx_kg_emb_vector
--   ON kg_embeddings
--   USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 100);
--   -- lists=100 is optimal for 1,000–10,000 rows
--   -- Query: SET ivfflat.probes = 10; (higher = better recall, slower)
--
-- Option B — HNSW (better recall, larger index):
--   CREATE INDEX idx_kg_emb_vector
--   ON kg_embeddings
--   USING hnsw (embedding vector_cosine_ops)
--   WITH (m = 16, ef_construction = 64);
--   -- m=16: connections per node (default); ef_construction=64: build-time accuracy
--   -- Higher recall than IVFFlat but ~3x index size
--
-- Recommended for 4,665 rows: IVFFlat with lists=100 is sufficient.
-- HNSW recommended if growing beyond 50,000 rows.


-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────
-- Reuses kg_set_updated_at() from Phase 1 / Phase 4.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kg_embeddings_updated_at'
  ) THEN
    CREATE TRIGGER trg_kg_embeddings_updated_at
      BEFORE UPDATE ON kg_embeddings
      FOR EACH ROW EXECUTE FUNCTION kg_set_updated_at();
  END IF;
END;
$$;


-- ─── VERIFY SCHEMA CREATED ────────────────────────────────────────────────────

-- Check table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'kg_embeddings';
-- Expected: 1 row

-- Check vector column type and dimensions
SELECT column_name, udt_name
FROM information_schema.columns
WHERE table_name = 'kg_embeddings' AND column_name = 'embedding';
-- Expected: column_name=embedding, udt_name=vector

-- Check constraints
SELECT conname, contype FROM pg_constraint
WHERE conrelid = 'kg_embeddings'::regclass
ORDER BY conname;
-- Expected: chk_entity_type, uq_embedding_entity_model, plus PK

-- =============================================================================
-- Expected output after successful run (pgvector available):
--   NOTICE: pgvector X.X already installed. Proceeding.
--   CREATE EXTENSION (or NOTICE: extension already exists)
--   CREATE TABLE
--   CREATE INDEX (×2)
--   DO (trigger creation)
--   (verification queries return expected results)
--
-- Expected output when pgvector NOT available:
--   NOTICE: pgvector extension not found. Attempting CREATE EXTENSION vector...
--   NOTICE: pgvector not available on this PostgreSQL instance...
--   (Script continues without error — CREATE TABLE below will fail if vector type unavailable)
--   (If this script errors on CREATE TABLE: SKIP this script, use Track B only)
--
-- After 002_schema_pgvector.sql completes:
--   Run: node scripts/generate-embeddings.js
--   Then build ANN index (see IVFFlat note above)
-- =============================================================================
