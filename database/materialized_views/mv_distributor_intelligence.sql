CREATE MATERIALIZED VIEW mv_distributor_intelligence AS

SELECT

    country,

    COUNT(*) AS distributors

FROM distributor_profiles

GROUP BY country;
