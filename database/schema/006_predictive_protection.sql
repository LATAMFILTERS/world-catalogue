-- 006_predictive_protection.sql
-- ELIMFILTERS Predictive Protection Layer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS contamination_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    model_code TEXT UNIQUE NOT NULL,

    contamination_type TEXT NOT NULL,

    industry_id UUID REFERENCES industries(id),

    asset_id UUID REFERENCES assets(id),

    severity TEXT,

    probability NUMERIC(5,2),

    status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS failure_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    model_code TEXT UNIQUE NOT NULL,

    problem_id UUID REFERENCES problems(id),

    asset_id UUID REFERENCES assets(id),

    failure_mechanism TEXT,

    risk_level TEXT,

    status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    risk_category TEXT NOT NULL,

    score NUMERIC(5,2),

    severity TEXT,

    calculated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_risk_scores_twin
ON risk_scores(twin_id);

CREATE TABLE IF NOT EXISTS lifecycle_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    component TEXT NOT NULL,

    remaining_life_hours INTEGER,

    confidence_score NUMERIC(5,2),

    calculated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS replacement_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    sku TEXT,

    predicted_date DATE,

    confidence_score NUMERIC(5,2),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS failure_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    failure_model_id UUID REFERENCES failure_models(id),

    probability NUMERIC(5,2),

    impact TEXT,

    confidence_score NUMERIC(5,2),

    predicted_date DATE,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prediction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    prediction_type TEXT,

    prediction_id UUID,

    actual_result TEXT,

    accuracy_score NUMERIC(5,2),

    validated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    recommendation_type TEXT,

    recommendation TEXT,

    confidence_score NUMERIC(5,2),

    generated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE contamination_models IS
'Contamination risk models by asset, industry, and operating environment.';

COMMENT ON TABLE failure_models IS
'Known failure mechanisms connected to contamination and protection intelligence.';

COMMENT ON TABLE risk_scores IS
'Calculated risk exposure for a digital twin.';

COMMENT ON TABLE lifecycle_forecasts IS
'Predicted remaining useful life of protected components.';

COMMENT ON TABLE failure_predictions IS
'AI-generated predictions of future failures.';
