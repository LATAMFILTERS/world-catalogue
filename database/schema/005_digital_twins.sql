-- 005_digital_twins.sql
-- ELIMFILTERS Digital Twin Layer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS digital_twins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_code TEXT UNIQUE NOT NULL,

    customer_id UUID,
    asset_id UUID REFERENCES assets(id),
    oem_id UUID REFERENCES oems(id),

    equipment_model TEXT,
    engine_model TEXT,
    serial_number TEXT,

    industry_id UUID REFERENCES industries(id),

    country TEXT,

    operational_status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_digital_twins_code
ON digital_twins(twin_code);

CREATE TABLE IF NOT EXISTS twin_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    system_id UUID REFERENCES systems(id),

    status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twin_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    sku TEXT NOT NULL,

    install_date DATE,

    replacement_interval_hours INTEGER,

    status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twin_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    technology_id UUID REFERENCES technologies(id),

    deployment_date DATE,

    status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twin_maintenance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    event_type TEXT,

    performed_date DATE,

    notes TEXT,

    performed_by TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twin_failure_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    problem_id UUID REFERENCES problems(id),

    severity TEXT,

    description TEXT,

    detected_date DATE,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twin_risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    contamination_risk NUMERIC(5,2),

    water_risk NUMERIC(5,2),

    dust_risk NUMERIC(5,2),

    severity_score NUMERIC(5,2),

    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twin_health_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    overall_score NUMERIC(5,2),

    air_system_score NUMERIC(5,2),

    fuel_system_score NUMERIC(5,2),

    lubrication_score NUMERIC(5,2),

    hydraulic_score NUMERIC(5,2),

    cooling_score NUMERIC(5,2),

    calculated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twin_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    recommendation_type TEXT,

    recommendation TEXT,

    priority TEXT,

    confidence_score NUMERIC(5,2),

    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE digital_twins IS
'Persistent digital representation of protected assets.';
