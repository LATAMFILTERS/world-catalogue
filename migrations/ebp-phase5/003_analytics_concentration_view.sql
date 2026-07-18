-- =============================================================================
-- EBP PHASE 5 — CONCENTRATION ANALYTICS VIEW
-- File: 003_analytics_concentration_view.sql
-- Purpose: architecture-review correction — the Concentration Index
--   (Decision 08, ADR-0069) was being computed by the Internal Analytics
--   API reading ebp_selection_candidates/ebp_manufacturers directly,
--   violating the ADR-0037 §8.3 convention every phase in this platform
--   follows ("Analytics Views... never a raw transactional table read
--   directly by a future dashboard or API"). This view is now the only
--   surface the Concentration Index queries.
-- Safe to run: YES — additive only (one new view). No table altered.
-- =============================================================================

CREATE OR REPLACE VIEW ebp_analytics_selection_concentration AS
  SELECT
    c.manufacturer_id,
    m.country_code,
    COUNT(*) AS primary_sku_count
  FROM ebp_selection_candidates c
  JOIN ebp_manufacturers m ON m.id = c.manufacturer_id
  WHERE c.tier = 'PRIMARY'
    AND c.selection_run_id IN (SELECT id FROM ebp_selection_runs WHERE run_result <> 'STALE')
  GROUP BY c.manufacturer_id, m.country_code;

COMMENT ON VIEW ebp_analytics_selection_concentration IS 'EBP Phase 5 — the only surface the Concentration Index (Decision 08, ADR-0069) and any future dashboard/API read for manufacturer/country PRIMARY-tier share. Never a raw transactional table read directly (ADR-0037 §8.3).';
