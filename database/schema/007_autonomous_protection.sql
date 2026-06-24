-- 007_autonomous_protection.sql
-- ELIMFILTERS Autonomous Asset Protection Layer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS autonomous_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    policy_code TEXT UNIQUE NOT NULL,

    policy_name TEXT NOT NULL,

    scope TEXT,

    severity_threshold NUMERIC(5,2),

    action_rules JSONB,

    status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS autonomous_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    policy_id UUID REFERENCES autonomous_policies(id),

    decision_type TEXT,

    decision_reason TEXT,

    confidence_score NUMERIC(5,2),

    decision_status TEXT DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_autonomous_decisions_twin
ON autonomous_decisions(twin_id);

CREATE TABLE IF NOT EXISTS autonomous_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    decision_id UUID REFERENCES autonomous_decisions(id),

    action_type TEXT,

    action_status TEXT DEFAULT 'PENDING',

    execution_notes TEXT,

    executed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS autonomous_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    workflow_code TEXT UNIQUE NOT NULL,

    workflow_name TEXT,

    trigger_condition TEXT,

    workflow_steps JSONB,

    status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS autonomous_learning (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    source_event TEXT,

    recommendation_accuracy NUMERIC(5,2),

    decision_accuracy NUMERIC(5,2),

    learning_score NUMERIC(5,2),

    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleet_optimization_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    fleet_code TEXT,

    optimization_type TEXT,

    projected_savings NUMERIC(18,2),

    projected_risk_reduction NUMERIC(5,2),

    confidence_score NUMERIC(5,2),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS protection_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    industry_id UUID REFERENCES industries(id),

    asset_id UUID REFERENCES assets(id),

    contamination_profile TEXT,

    recommended_technology TEXT,

    recommended_products TEXT,

    status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS autonomous_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    twin_id UUID REFERENCES digital_twins(id),

    decision_id UUID REFERENCES autonomous_decisions(id),

    action_id UUID REFERENCES autonomous_actions(id),

    audit_event TEXT,

    actor_type TEXT,

    details JSONB,

    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE autonomous_policies IS
'Approved protection policies governing autonomous behavior.';

COMMENT ON TABLE autonomous_decisions IS
'Machine-generated protection decisions.';

COMMENT ON TABLE autonomous_actions IS
'Actions generated from approved autonomous decisions.';

COMMENT ON TABLE autonomous_learning IS
'Continuous learning and validation feedback loop.';

COMMENT ON TABLE fleet_optimization_models IS
'Fleet-level optimization and protection intelligence.';

COMMENT ON TABLE protection_policies IS
'Official protection strategies by asset and industry.';
