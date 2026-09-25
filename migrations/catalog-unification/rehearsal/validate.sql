\pset footer off
SELECT id, applied_at::time(0), notes FROM public.catalog_migration_log ORDER BY id;
SELECT 'catalog' chk, count(*) total, count(DISTINCT sku) distinct_sku, count(*) FILTER (WHERE catalog_active) active, count(*) FILTER (WHERE NOT catalog_active) inactive FROM public.elimfilters_catalog;
SELECT 'inactive_by_reason' chk, coalesce(split_part(catalog_scope_reason, ':', 1), '<null>') reason, count(*) FROM public.elimfilters_catalog WHERE NOT catalog_active GROUP BY 2 ORDER BY 3 DESC;
SELECT 'alias' chk, relation, rule, count(*) FROM public.catalog_sku_alias GROUP BY 2, 3 ORDER BY 4 DESC;
SELECT 'rejected' chk, regexp_replace(regexp_replace(error, 'SKU [A-Z0-9]+', 'SKU <x>'), 'payload [0-9a-f]+', 'payload <h>') err, count(*) FROM catalog_unification.m04_rejected GROUP BY 2 ORDER BY 3 DESC;
SELECT 'dep_skipped_conflicts' chk, tbl, count(*) FROM catalog_unification.m03_dep_renames WHERE skipped_conflict GROUP BY 2;
-- huérfanos en hijos sin FK
SELECT 'orphans' chk, t, n FROM (
  SELECT 'kg_product_systems' t, count(*) n FROM public.kg_product_systems x WHERE NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog c WHERE c.sku = x.product_sku)
  UNION ALL SELECT 'catalog_sku_certification', count(*) FROM public.catalog_sku_certification x WHERE NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog c WHERE c.sku = x.sku)
  UNION ALL SELECT 'catalog_application_evidence', count(*) FROM public.catalog_application_evidence x WHERE NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog c WHERE c.sku = x.sku)
  UNION ALL SELECT 'hermes_catalogue_backlog', count(*) FROM public.hermes_catalogue_backlog x WHERE NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog c WHERE c.sku = x.sku)) o;
-- los 5 nuevos legítimos de 5432 siguen
SELECT 'kept_5432_new' chk, string_agg(sku, ',') FROM public.elimfilters_catalog WHERE sku IN ('EF95112','EL30158','EL30977','EL33387','EL38936');
-- vistas de HERMES funcionan
SELECT 'hermes_view' chk, count(*) FROM public.hermes_catalogue_quality_summary_v;
SELECT 'dossier_view' chk, count(*) FROM public.hermes_catalogue_dossier_progress_v;
SELECT 'active_view_count' chk, count(*) FROM public.elimfilters_catalog_active_v;
