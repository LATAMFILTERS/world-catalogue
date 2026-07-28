BEGIN;

DROP TABLE IF EXISTS knowledge_center.incidents;
DROP TABLE IF EXISTS knowledge_center.production_readiness_checks;
DROP TABLE IF EXISTS knowledge_center.runtime_metrics;
DROP TABLE IF EXISTS knowledge_center.service_health_events;

DELETE FROM knowledge_center.schema_migrations WHERE version = '7.0.0';

COMMIT;
