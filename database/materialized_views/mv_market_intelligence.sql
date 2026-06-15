CREATE MATERIALIZED VIEW mv_market_intelligence AS

SELECT

    country,

    COUNT(*) AS total_events,

    COUNT(DISTINCT search_query) AS unique_searches,

    MAX(created_at) AS last_activity

FROM search_events

GROUP BY country;
