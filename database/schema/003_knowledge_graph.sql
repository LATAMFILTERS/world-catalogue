-- 003_knowledge_graph.sql
-- ELIMFILTERS Knowledge Graph Foundation

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS graph_node_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS graph_relationship_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    node_type_id UUID REFERENCES graph_node_types(id),

    external_id TEXT,

    code TEXT,

    name TEXT NOT NULL,

    description TEXT,

    source_system TEXT,

    status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_knowledge_nodes_code
ON knowledge_nodes(code);

CREATE INDEX idx_knowledge_nodes_name
ON knowledge_nodes(name);

CREATE TABLE IF NOT EXISTS knowledge_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    source_node_id UUID REFERENCES knowledge_nodes(id),

    relationship_type_id UUID REFERENCES graph_relationship_types(id),

    target_node_id UUID REFERENCES knowledge_nodes(id),

    confidence_score NUMERIC(5,2),

    evidence_count INTEGER DEFAULT 0,

    status TEXT DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_knowledge_edges_source
ON knowledge_edges(source_node_id);

CREATE INDEX idx_knowledge_edges_target
ON knowledge_edges(target_node_id);

CREATE TABLE IF NOT EXISTS evidence_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    source_type TEXT,

    source_name TEXT,

    source_reference TEXT,

    source_url TEXT,

    reliability_score NUMERIC(5,2),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edge_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    edge_id UUID REFERENCES knowledge_edges(id),

    evidence_source_id UUID REFERENCES evidence_sources(id),

    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO graph_node_types (code,name) VALUES
('TECHNOLOGY','Technology'),
('SYSTEM','System'),
('PRODUCT','Product'),
('INDUSTRY','Industry'),
('PROBLEM','Problem'),
('ASSET','Asset'),
('STANDARD','Standard'),
('OEM','OEM'),
('EQUIPMENT','Equipment')
ON CONFLICT (code) DO NOTHING;

INSERT INTO graph_relationship_types (code,name) VALUES
('PROTECTS','Protects'),
('USES','Uses'),
('CONTAINS','Contains'),
('MITIGATES','Mitigates'),
('DAMAGES','Damages'),
('VALIDATES','Validates'),
('OPERATES_IN','Operates In'),
('MANUFACTURES','Manufactures'),
('RECOMMENDS','Recommends'),
('REPLACES','Replaces')
ON CONFLICT (code) DO NOTHING;
