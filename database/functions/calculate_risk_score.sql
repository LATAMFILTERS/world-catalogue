CREATE OR REPLACE FUNCTION calculate_risk_score(
    contamination_risk NUMERIC,
    water_risk NUMERIC,
    dust_risk NUMERIC
)
RETURNS NUMERIC
AS $$
BEGIN
RETURN ROUND(
(
contamination_risk +
water_risk +
dust_risk
)/3
,2);
END;
$$ LANGUAGE plpgsql;
