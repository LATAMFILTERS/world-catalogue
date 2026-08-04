BEGIN;

DO $$
BEGIN
  IF current_setting('bot_governance.allow_rollback', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Rollback blocked. Set bot_governance.allow_rollback=true for a controlled non-production rollback.';
  END IF;
END;
$$;

DROP SCHEMA IF EXISTS bot_governance CASCADE;

COMMIT;

-- This rollback removes the bot_governance schema (knowledge_gaps table
-- and its dedup/occurrence history) entirely. It must never be executed
-- in production without a verified backup, explicit approval, a
-- maintenance window, and a restoration test.
