-- ═══════════════════════════════════════════════════════════════════════════
-- ELIMFILTERS AI Engine - pgvector Setup
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to filters table
-- Dimensions: 1536 for text-embedding-3-small (OpenAI)
ALTER TABLE filters ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for faster vector searches (using HNSW)
-- This uses cosine similarity distance (OPERATOR <=>)
CREATE INDEX IF NOT EXISTS idx_filters_embedding ON filters
USING hnsw (embedding vector_cosine_ops);

-- Create index for semantic search by technology
CREATE INDEX IF NOT EXISTS idx_filters_technology_embedding
ON filters (technology, embedding vector_cosine_ops);

-- Create index for category + embedding
CREATE INDEX IF NOT EXISTS idx_filters_category_embedding
ON filters (category, embedding vector_cosine_ops);

-- Grant necessary permissions
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_user;

COMMENT ON COLUMN filters.embedding IS 'OpenAI text-embedding-3-small vector representation of product metadata';
COMMENT ON INDEX idx_filters_embedding IS 'HNSW index for fast cosine similarity search on product embeddings';

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification queries
-- ═══════════════════════════════════════════════════════════════════════════

-- Check if pgvector is available:
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check embedding column:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='filters' AND column_name='embedding';

-- Check indexes:
-- SELECT indexname FROM pg_indexes WHERE tablename = 'filters' AND indexname LIKE '%embedding%';
