-- ═══════════════════════════════════════════════════════════════════════════
-- ELIMFILTERS AI Engine - pgvector Setup
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to filters table
-- Dimensions: 1536 for text-embedding-3-small (OpenAI)
ALTER TABLE filters ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- HNSW index for vector similarity search (cosine distance)
-- pgvector HNSW indexes only support single vector columns
CREATE INDEX IF NOT EXISTS idx_filters_embedding
ON filters
USING hnsw (embedding vector_cosine_ops);

-- Regular B-tree indexes for filtering by category/technology
-- PostgreSQL will use both indexes together for filtered vector searches
CREATE INDEX IF NOT EXISTS idx_filters_technology
ON filters (technology);

CREATE INDEX IF NOT EXISTS idx_filters_category
ON filters (category);

COMMENT ON COLUMN filters.embedding IS 'OpenAI text-embedding-3-small (1536 dims) vector for semantic search';
COMMENT ON INDEX idx_filters_embedding IS 'HNSW index for cosine similarity search - pgvector';

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification queries (run manually to check setup)
-- ═══════════════════════════════════════════════════════════════════════════

-- SELECT * FROM pg_extension WHERE extname = 'vector';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='filters' AND column_name='embedding';
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'filters' AND indexname LIKE '%embedding%';
-- SELECT COUNT(*), COUNT(embedding) FROM filters;
