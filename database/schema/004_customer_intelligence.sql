-- 004_customer_intelligence.sql
-- ELIMFILTERS Customer Intelligence Layer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS intelligence_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    event_type TEXT NOT NULL,
    source_platform TEXT,
    user_type TEXT,

    country TEXT,
    state TEXT,
    city TEXT,
    language TEXT,

    session_id TEXT,
    ip_hash TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_intelligence_events_type
ON intelligence_events(event_type);

CREATE INDEX idx_intelligence_events_created
ON intelligence_events(created_at);

CREATE TABLE IF NOT EXISTS search_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    intelligence_event_id UUID REFERENCES intelligence_events(id),

    search_type TEXT,
    search_query TEXT NOT NULL,
    normalized_query TEXT,
    result_count INTEGER,
    clicked_result TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_events_query
ON search_events(normalized_query);

CREATE TABLE IF NOT EXISTS ai_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    intelligence_event_id UUID REFERENCES intelligence_events(id),

    question TEXT NOT NULL,
    category TEXT,
    recommendation_type TEXT,
    confidence_score NUMERIC(5,2),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    company_name TEXT,
    customer_type TEXT,
    industry_id UUID REFERENCES industries(id),

    country TEXT,
    territory TEXT,

    first_seen TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distributor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    company_name TEXT NOT NULL,
    country TEXT,
    territory TEXT,

    status TEXT DEFAULT 'PROSPECT',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demand_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    sku TEXT,
    oem_reference TEXT,
    competitor_reference TEXT,

    search_count INTEGER DEFAULT 0,
    registration_count INTEGER DEFAULT 0,
    ai_mentions INTEGER DEFAULT 0,

    country TEXT,
    month TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_demand_signals_sku
ON demand_signals(sku);

CREATE INDEX idx_demand_signals_oem
ON demand_signals(oem_reference);

CREATE INDEX idx_demand_signals_competitor
ON demand_signals(competitor_reference);

CREATE TABLE IF NOT EXISTS opportunity_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    opportunity_type TEXT NOT NULL,
    signal_source TEXT,

    sku TEXT,
    oem_reference TEXT,
    competitor_reference TEXT,

    country TEXT,
    territory TEXT,

    priority TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'OPEN',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE intelligence_events IS
'Every search, AI question, product registration, distributor action, or customer interaction that generates intelligence.';

COMMENT ON TABLE demand_signals IS
'Aggregated indicators of product, OEM, competitor, territory, and technology demand.';
