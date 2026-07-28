BEGIN;

DO $$
BEGIN
  IF current_setting('knowledge_center.allow_phase2_rollback', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Rollback blocked. Set knowledge_center.allow_phase2_rollback=true for a controlled non-production rollback.';
  END IF;
END;
$$;

DROP SCHEMA IF EXISTS knowledge_center CASCADE;

COMMIT;

-- This rollback removes the complete Knowledge Center schema.
-- It must never be executed in production without a verified backup,
-- explicit approval, maintenance window, and restoration test.
