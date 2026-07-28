BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM knowledge_center.channel_events WHERE candidate_case_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Rollback blocked: channel events are linked to Candidate Cases';
  END IF;
END $$;

DROP TABLE IF EXISTS knowledge_center.channel_dead_letters;
DROP TABLE IF EXISTS knowledge_center.channel_attachments;
DROP TABLE IF EXISTS knowledge_center.channel_events;
DROP TABLE IF EXISTS knowledge_center.channel_conversations;
DELETE FROM knowledge_center.schema_migrations WHERE version='5.0.0';

COMMIT;
