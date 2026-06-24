CREATE MATERIALIZED VIEW mv_oem_intelligence AS

SELECT

    oem_reference,

    COUNT(*) AS demand_events,

    MAX(created_at) AS last_seen

FROM demand_signals

WHERE oem_reference IS NOT NULL

GROUP BY oem_reference;
