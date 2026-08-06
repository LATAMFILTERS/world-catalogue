-- Run outside an explicit transaction. CONCURRENTLY avoids blocking catalogue writes.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_elimfilters_catalog_oem_codes_gin
  ON elimfilters_catalog USING GIN (oem_codes jsonb_path_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_elimfilters_catalog_competitor_codes_gin
  ON elimfilters_catalog USING GIN (competitor_codes jsonb_path_ops);

ANALYZE elimfilters_catalog;
