CREATE MATERIALIZED VIEW mv_technology_intelligence AS

SELECT

    technology_id,

    COUNT(*) AS deployments

FROM twin_technologies

GROUP BY technology_id;
