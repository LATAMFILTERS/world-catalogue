CREATE OR REPLACE FUNCTION calculate_asset_protection_score(
    air_score NUMERIC,
    fuel_score NUMERIC,
    lube_score NUMERIC,
    hydraulic_score NUMERIC,
    cooling_score NUMERIC
)
RETURNS NUMERIC
AS $$
BEGIN
RETURN ROUND(
(
air_score +
fuel_score +
lube_score +
hydraulic_score +
cooling_score
)/5
,2);
END;
$$ LANGUAGE plpgsql;
