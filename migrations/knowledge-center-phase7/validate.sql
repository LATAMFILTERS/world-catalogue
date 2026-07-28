\set ON_ERROR_STOP on

SELECT to_regclass('knowledge_center.service_health_events') IS NOT NULL AS service_health_events_exists;
SELECT to_regclass('knowledge_center.runtime_metrics') IS NOT NULL AS runtime_metrics_exists;
SELECT to_regclass('knowledge_center.production_readiness_checks') IS NOT NULL AS readiness_checks_exists;
SELECT to_regclass('knowledge_center.incidents') IS NOT NULL AS incidents_exists;

SELECT version, description, applied_at
FROM knowledge_center.schema_migrations
WHERE version = '7.0.0';

SELECT COUNT(*) AS failed_required_checks
FROM knowledge_center.production_readiness_checks
WHERE environment = current_setting('knowledge_center.target_environment', true)
  AND status = 'FAIL';
