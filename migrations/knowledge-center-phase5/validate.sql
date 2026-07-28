DO $$
BEGIN
  IF to_regclass('knowledge_center.channel_conversations') IS NULL THEN RAISE EXCEPTION 'channel_conversations missing'; END IF;
  IF to_regclass('knowledge_center.channel_events') IS NULL THEN RAISE EXCEPTION 'channel_events missing'; END IF;
  IF to_regclass('knowledge_center.channel_attachments') IS NULL THEN RAISE EXCEPTION 'channel_attachments missing'; END IF;
  IF to_regclass('knowledge_center.channel_dead_letters') IS NULL THEN RAISE EXCEPTION 'channel_dead_letters missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM knowledge_center.schema_migrations WHERE version='5.0.0') THEN RAISE EXCEPTION 'Phase 5 migration record missing'; END IF;
END $$;

SELECT processing_status, count(*) FROM knowledge_center.channel_events GROUP BY processing_status ORDER BY processing_status;
