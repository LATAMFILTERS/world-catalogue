-- 002_catalog_relationships.sql
-- ELIMFILTERS Catalog Relationship Layer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- OEM Manufacturers

CREATE TABLE IF NOT EXISTS oems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    country TEXT,
    manufacturer_type TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- OEM References

CREATE TABLE IF NOT EXISTS oem_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oem_id UUID REFERENCES oems(id),
    oem_part_number TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_oem_reference_part
ON oem_references(oem_part_number);

-- Equipment Applications

CREATE TABLE IF NOT EXISTS equipment_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oem_id UUID REFERENCES oems(id),
    equipment_model TEXT,
    engine_model TEXT,
    asset_id UUID REFERENCES assets(id),
    industry_id UUID REFERENCES industries(id),
    application_type TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_equipment_model
ON equipment_applications(equipment_model);

CREATE INDEX idx_engine_model
ON equipment_applications(engine_model);

-- Product Technologies

CREATE TABLE IF NOT EXISTS product_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID,
    technology_id UUID REFERENCES technologies(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Product Systems

CREATE TABLE IF NOT EXISTS product_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID,
    system_id UUID REFERENCES systems(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Product Problems

CREATE TABLE IF NOT EXISTS product_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID,
    problem_id UUID REFERENCES problems(id),
    mitigation_strength TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cross References

CREATE TABLE IF NOT EXISTS cross_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    source_brand TEXT NOT NULL,
    source_part_number TEXT NOT NULL,

    target_brand TEXT NOT NULL,
    target_part_number TEXT NOT NULL,

    relationship_type TEXT NOT NULL,

    confidence_level NUMERIC(5,2),

    validation_status TEXT DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cross_source
ON cross_references(source_part_number);

CREATE INDEX idx_cross_target
ON cross_references(target_part_number);

CREATE INDEX idx_cross_source_brand
ON cross_references(source_brand);

CREATE INDEX idx_cross_target_brand
ON cross_references(target_brand);

-- Relationship Types

COMMENT ON TABLE cross_references IS
'Valid relationship types:

OEM_REFERENCE
COMPETITOR_REFERENCE
DIRECT_EQUIVALENT
ALTERNATIVE_MEDIA
TECHNOLOGY_UPGRADE
TECHNOLOGY_DOWNGRADE
SUPERSESSION
OBSOLETE
APPLICATION_MATCH
DIMENSIONAL_MATCH';

-- Competitor Brands

CREATE TABLE IF NOT EXISTS competitor_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Application Coverage

CREATE TABLE IF NOT EXISTS product_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID,
    equipment_application_id UUID REFERENCES equipment_applications(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Catalog Validation Events

CREATE TABLE IF NOT EXISTS catalog_validation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    validation_type TEXT,

    source_reference TEXT,

    target_reference TEXT,

    validation_result TEXT,

    validated_by TEXT,

    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Initial Competitor Population

INSERT INTO competitor_brands (brand_name) VALUES
('DONALDSON'),
('FLEETGUARD'),
('MANN-FILTER'),
('WIX'),
('BALDWIN'),
('FRAM'),
('HIFI FILTER'),
('LUBER-FINER'),
('PARKER'),
('RACOR')
ON CONFLICT (brand_name) DO NOTHING;

-- Initial OEM Population

INSERT INTO oems (name) VALUES
('CATERPILLAR'),
('CUMMINS'),
('VOLVO'),
('SCANIA'),
('KOMATSU'),
('JOHN DEERE'),
('DETROIT DIESEL'),
('MACK'),
('MERCEDES-BENZ'),
('IVECO'),
('DEUTZ'),
('PERKINS')
ON CONFLICT (name) DO NOTHING;
