-- ══════════════════════════════════════════════════════════════════════════════
-- ITEM 1: Mecanismo de actualización de crossref_resolved_cache
-- ITEM 2: JSONB sigue siendo source of truth — trigger mantiene cache en sync
-- ITEM 3: cross_reference_master → deprecada
-- Ejecutar en: psql en Render
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ITEM 1A: Función de rebuild completo
-- Reconstruye crossref_resolved_cache desde oem_codes y competitor_codes JSONB
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION refresh_crossref_cache()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  TRUNCATE crossref_resolved_cache;

  INSERT INTO crossref_resolved_cache (code, sku, manufacturer, score)
  SELECT DISTINCT
    UPPER(REPLACE(ref->>'code', '-', ''))                          AS code,
    c.sku,
    UPPER(COALESCE(NULLIF(TRIM(ref->>'manufacturer'),''), 'UNKNOWN')) AS manufacturer,
    20                                                              AS score
  FROM elimfilters_catalog c,
    jsonb_array_elements(c.oem_codes) AS ref
  WHERE c.oem_codes IS NOT NULL
    AND jsonb_typeof(c.oem_codes) = 'array'
    AND TRIM(ref->>'code') != ''
    AND ref->>'code' IS NOT NULL

  UNION

  SELECT DISTINCT
    UPPER(REPLACE(ref->>'code', '-', ''))                     AS code,
    c.sku,
    UPPER(COALESCE(NULLIF(TRIM(ref->>'brand'),''), 'UNKNOWN')) AS manufacturer,
    20                                                         AS score
  FROM elimfilters_catalog c,
    jsonb_array_elements(c.competitor_codes) AS ref
  WHERE c.competitor_codes IS NOT NULL
    AND jsonb_typeof(c.competitor_codes) = 'array'
    AND TRIM(ref->>'code') != ''
    AND ref->>'code' IS NOT NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Cache rebuilt: % rows', v_count;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- ITEM 1B: Función de rebuild incremental por SKU (usada por el trigger)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION refresh_crossref_cache_sku(p_sku TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM crossref_resolved_cache WHERE sku = p_sku;

  INSERT INTO crossref_resolved_cache (code, sku, manufacturer, score)
  SELECT DISTINCT
    UPPER(REPLACE(ref->>'code', '-', ''))                          AS code,
    c.sku,
    UPPER(COALESCE(NULLIF(TRIM(ref->>'manufacturer'),''), 'UNKNOWN')) AS manufacturer,
    20                                                              AS score
  FROM elimfilters_catalog c,
    jsonb_array_elements(c.oem_codes) AS ref
  WHERE c.sku = p_sku
    AND c.oem_codes IS NOT NULL
    AND jsonb_typeof(c.oem_codes) = 'array'
    AND ref->>'code' IS NOT NULL
    AND TRIM(ref->>'code') != '';

  INSERT INTO crossref_resolved_cache (code, sku, manufacturer, score)
  SELECT DISTINCT
    UPPER(REPLACE(ref->>'code', '-', ''))                     AS code,
    c.sku,
    UPPER(COALESCE(NULLIF(TRIM(ref->>'brand'),''), 'UNKNOWN')) AS manufacturer,
    20                                                         AS score
  FROM elimfilters_catalog c,
    jsonb_array_elements(c.competitor_codes) AS ref
  WHERE c.sku = p_sku
    AND c.competitor_codes IS NOT NULL
    AND jsonb_typeof(c.competitor_codes) = 'array'
    AND ref->>'code' IS NOT NULL
    AND TRIM(ref->>'code') != ''
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- ITEM 2: Trigger — sincroniza cache automáticamente cuando se modifica el catálogo
-- Solo actúa cuando oem_codes o competitor_codes cambian
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_crossref_cache_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    DELETE FROM crossref_resolved_cache WHERE sku = OLD.sku;
    RETURN OLD;
  END IF;

  IF (TG_OP = 'INSERT') OR
     (NEW.oem_codes       IS DISTINCT FROM OLD.oem_codes) OR
     (NEW.competitor_codes IS DISTINCT FROM OLD.competitor_codes) THEN
    PERFORM refresh_crossref_cache_sku(NEW.sku);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_crossref_cache ON elimfilters_catalog;

CREATE TRIGGER trg_sync_crossref_cache
  AFTER INSERT OR UPDATE OR DELETE ON elimfilters_catalog
  FOR EACH ROW
  EXECUTE FUNCTION trg_crossref_cache_sync();

-- ─────────────────────────────────────────────────────────────────────────────
-- ITEM 3: Deprecar cross_reference_master (tabla wide no utilizada)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS cross_reference_master
  RENAME TO cross_reference_master_legacy;

COMMENT ON TABLE cross_reference_master_legacy IS
  'DEPRECATED — Tabla wide-format no utilizada en flujos activos. '
  'Supersedida por crossref_resolved_cache. '
  'No escribir en esta tabla. Fecha: 2026-07-06.';

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN
-- ─────────────────────────────────────────────────────────────────────────────
SELECT proname, pronargs
FROM pg_proc
WHERE proname IN ('refresh_crossref_cache', 'refresh_crossref_cache_sku', 'trg_crossref_cache_sync')
ORDER BY proname;

SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trg_sync_crossref_cache';

SELECT tablename
FROM pg_tables
WHERE tablename = 'cross_reference_master_legacy';
