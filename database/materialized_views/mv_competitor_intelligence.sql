CREATE MATERIALIZED VIEW mv_competitor_intelligence AS

SELECT

    competitor_reference,

    COUNT(*) AS demand_events,

    MAX(created_at) AS last_seen

FROM demand_signals

WHERE competitor_reference IS NOT NULL

GROUP BY competitor_reference;
