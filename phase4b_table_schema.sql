-- FASE 4B — PRE-LOAD DATABASE PLAN
-- Objetivo: Diseño de esquema PostgreSQL para el Catálogo LD

CREATE SCHEMA IF NOT EXISTS ld_catalog;

-- 1. Tabla Principal de Catálogo LD
CREATE TABLE IF NOT EXISTS ld_product_catalog (
    elimfilters_sku VARCHAR(50) PRIMARY KEY,
    source_sku VARCHAR(50) NOT NULL,
    segment VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ld_product_source_sku ON ld_product_catalog(source_sku);

-- 2. Tabla de Preparación Comercial (Production Readiness)
CREATE TABLE IF NOT EXISTS ld_production_readiness (
    elimfilters_sku VARCHAR(50) PRIMARY KEY,
    source_sku VARCHAR(50),
    segment VARCHAR(50),
    has_oem BOOLEAN DEFAULT FALSE,
    has_competitor BOOLEAN DEFAULT FALSE,
    has_applications BOOLEAN DEFAULT FALSE,
    has_specifications BOOLEAN DEFAULT FALSE,
    production_tier VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (elimfilters_sku) REFERENCES ld_product_catalog(elimfilters_sku) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ld_readiness_tier ON ld_production_readiness(production_tier);

-- 3. Referencias Cruzadas de Competidor (Aftermarket)
CREATE TABLE IF NOT EXISTS ld_competitor_cross_references (
    id SERIAL PRIMARY KEY,
    elimfilters_sku VARCHAR(50) NOT NULL,
    source_sku VARCHAR(50) NOT NULL,
    competitor_brand VARCHAR(100) NOT NULL,
    competitor_part_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (elimfilters_sku, competitor_brand, competitor_part_number),
    FOREIGN KEY (elimfilters_sku) REFERENCES ld_product_catalog(elimfilters_sku) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ld_comp_elim_sku ON ld_competitor_cross_references(elimfilters_sku);
CREATE INDEX IF NOT EXISTS idx_ld_comp_brand_part ON ld_competitor_cross_references(competitor_brand, competitor_part_number);

-- 4. Referencias Cruzadas de Origen (OEM)
CREATE TABLE IF NOT EXISTS ld_oem_cross_references (
    id SERIAL PRIMARY KEY,
    elimfilters_sku VARCHAR(50) NOT NULL,
    source_sku VARCHAR(50) NOT NULL,
    oem_brand VARCHAR(100) NOT NULL,
    oem_part_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (elimfilters_sku, oem_brand, oem_part_number),
    FOREIGN KEY (elimfilters_sku) REFERENCES ld_product_catalog(elimfilters_sku) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ld_oem_elim_sku ON ld_oem_cross_references(elimfilters_sku);
CREATE INDEX IF NOT EXISTS idx_ld_oem_brand_part ON ld_oem_cross_references(oem_brand, oem_part_number);

-- 5. Aplicaciones Vehiculares
CREATE TABLE IF NOT EXISTS ld_vehicle_applications (
    id SERIAL PRIMARY KEY,
    elimfilters_sku VARCHAR(50) NOT NULL,
    source_sku VARCHAR(50) NOT NULL,
    make VARCHAR(100),
    model_family VARCHAR(100),
    model_type VARCHAR(100),
    year VARCHAR(50),
    engine_code VARCHAR(100),
    ccm VARCHAR(50),
    kw VARCHAR(50),
    hp VARCHAR(50),
    source_origin VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (elimfilters_sku, make, model_family, model_type, year),
    FOREIGN KEY (elimfilters_sku) REFERENCES ld_product_catalog(elimfilters_sku) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ld_app_elim_sku ON ld_vehicle_applications(elimfilters_sku);
CREATE INDEX IF NOT EXISTS idx_ld_app_make_model ON ld_vehicle_applications(make, model_family);

-- 6. Especificaciones Técnicas
CREATE TABLE IF NOT EXISTS ld_product_specifications (
    id SERIAL PRIMARY KEY,
    elimfilters_sku VARCHAR(50) NOT NULL,
    source_sku VARCHAR(50) NOT NULL,
    spec_key VARCHAR(100) NOT NULL,
    spec_value VARCHAR(255) NOT NULL,
    spec_unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (elimfilters_sku, spec_key),
    FOREIGN KEY (elimfilters_sku) REFERENCES ld_product_catalog(elimfilters_sku) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ld_spec_elim_sku ON ld_product_specifications(elimfilters_sku);
