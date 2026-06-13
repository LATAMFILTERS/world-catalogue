-- ============================================================================
-- 008_500fg_elimfilters_sku.sql
-- Assigns ELIMFILTERS internal SKUs to 500FG series housing and elements.
--
--   500FG      → ET90500
--   2010SM-OR  → ET92010S
--   2010TM-OR  → ET92010T
--   2010PM-OR  → ET92010P
--
-- Run after 005_hydrocore_500fg_series.sql and 007_fix_500fg_micron_ratings.sql.
-- Idempotent — UPDATE with the same value is a no-op.
-- ============================================================================

BEGIN;

UPDATE product_model   SET elimfilters_sku = 'ET90500'  WHERE model_code   = '500FG';
UPDATE product_element SET elimfilters_sku = 'ET92010S' WHERE element_code = '2010SM-OR';
UPDATE product_element SET elimfilters_sku = 'ET92010T' WHERE element_code = '2010TM-OR';
UPDATE product_element SET elimfilters_sku = 'ET92010P' WHERE element_code = '2010PM-OR';

COMMIT;
