DO $$
BEGIN
  IF to_regclass('knowledge_center.reasoning_traces') IS NULL THEN RAISE EXCEPTION 'reasoning_traces missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM knowledge_center.schema_migrations WHERE version='6.0.0') THEN RAISE EXCEPTION 'phase 6 migration marker missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='reasoning_traces_immutable') THEN RAISE EXCEPTION 'reasoning trace immutability trigger missing'; END IF;
END $$;

SELECT action, count(*) FROM knowledge_center.reasoning_traces GROUP BY action ORDER BY action;