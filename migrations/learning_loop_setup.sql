-- ══════════════════════════════════════════════════════════
-- A: Real-time Learning Loop — PostgreSQL function
-- Ejecutar en: psql en Render
-- ══════════════════════════════════════════════════════════

-- Ensure manufacturer column has a unique constraint for ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_mlw_manufacturer'
  ) THEN
    ALTER TABLE manufacturer_learning_weights
      ADD CONSTRAINT uq_mlw_manufacturer UNIQUE (manufacturer);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Constraint may already exist: %', SQLERRM;
END;
$$;

-- Core learning function using Exponential Moving Average
-- alpha = 0.1 means: 10% new signal, 90% existing history
-- Signals:
--   RESOLVED_SINGLE → 1.0 (perfect, only match)
--   RESOLVED_TOP    → 0.85 (good, top scorer)
--   NEAR_MATCH      → 0.65 (acceptable)
--   WEAK_COMPETITION→ 0.35 (unreliable)
--   TRUE_COMPETING  → 0.15 (noisy, avoid)
CREATE OR REPLACE FUNCTION record_resolution(
  p_manufacturer TEXT,
  p_status       TEXT
) RETURNS NUMERIC AS $$
DECLARE
  v_signal NUMERIC;
  v_alpha  NUMERIC := 0.1;
  v_new_weight NUMERIC;
BEGIN
  v_signal := CASE p_status
    WHEN 'RESOLVED_SINGLE'  THEN 1.0
    WHEN 'RESOLVED_TOP'     THEN 0.85
    WHEN 'NEAR_MATCH'       THEN 0.65
    WHEN 'WEAK_COMPETITION' THEN 0.35
    WHEN 'TRUE_COMPETING'   THEN 0.15
    ELSE 0.5
  END;

  INSERT INTO manufacturer_learning_weights (manufacturer, weight)
  VALUES (p_manufacturer, v_signal)
  ON CONFLICT (manufacturer) DO UPDATE
    SET weight = ROUND(
      (manufacturer_learning_weights.weight * (1.0 - v_alpha)) + (v_signal * v_alpha),
      4
    )
  RETURNING weight INTO v_new_weight;

  RETURN v_new_weight;
END;
$$ LANGUAGE plpgsql;

-- Verify function was created
SELECT proname, pronargs FROM pg_proc WHERE proname = 'record_resolution';
