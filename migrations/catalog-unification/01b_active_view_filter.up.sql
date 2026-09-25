-- 01b up: restaura la definición gobernada de elimfilters_catalog_active_v (scripts/catalog_et9_scope_correction_20260918.sql).
-- En 5432 la vista existe SIN filtro ("SELECT * FROM elimfilters_catalog"), así que el search-api muestra SKUs inactivos
-- (hoy 4 EL). Sin esta migración, los ET9 excluidos y los SKUs fusionados de 03/04 serían visibles en la búsqueda pública.
-- CAMBIO DE COMPORTAMIENTO VISIBLE: requiere aprobación explícita de Victor.
CREATE TABLE catalog_unification.m01b_view_before AS
SELECT pg_get_viewdef('public.elimfilters_catalog_active_v'::regclass) AS definition;

DROP VIEW public.elimfilters_catalog_active_v;
CREATE VIEW public.elimfilters_catalog_active_v AS
SELECT * FROM public.elimfilters_catalog WHERE catalog_active = true;

INSERT INTO public.catalog_migration_log (id, sha256) VALUES (:'migration_id', :'migration_sha')
ON CONFLICT (id) DO UPDATE SET sha256 = EXCLUDED.sha256, applied_at = now(), reverted_at = NULL;
