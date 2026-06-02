-- kg_check.sql — Quick Phase 1 health check
SELECT 'kg_systems'               AS table_name, COUNT(*) AS rows FROM kg_systems
UNION ALL SELECT 'kg_technologies',              COUNT(*) FROM kg_technologies
UNION ALL SELECT 'kg_product_systems',           COUNT(*) FROM kg_product_systems
UNION ALL SELECT 'kg_product_technologies',      COUNT(*) FROM kg_product_technologies;

SELECT slug, status FROM kg_technologies ORDER BY status DESC, slug;

SELECT ks.slug AS system, COUNT(kps.product_sku) AS products
FROM kg_systems ks
LEFT JOIN kg_product_systems kps ON kps.system_id = ks.id
GROUP BY ks.id, ks.slug ORDER BY ks.sort_order;
