CREATE OR REPLACE FUNCTION calculate_prediction_accuracy(
    successful_predictions NUMERIC,
    total_predictions NUMERIC
)
RETURNS NUMERIC
AS $$
BEGIN

IF total_predictions = 0 THEN
    RETURN 0;
END IF;

RETURN ROUND(
(successful_predictions / total_predictions) * 100
,2);

END;
$$ LANGUAGE plpgsql;
