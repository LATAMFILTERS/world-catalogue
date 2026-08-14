-- 001_core_taxonomy.sql
-- ELIMFILTERS Core Taxonomy Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    system_domain TEXT NOT NULL,
    contamination_threat TEXT NOT NULL,
    protection_objective TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    contamination_profile TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    failure_mechanism TEXT,
    description TEXT,
    severity TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    asset_type TEXT,
    risk_profile TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    organization TEXT,
    domain TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO technologies (code, name, system_domain, contamination_threat, protection_objective) VALUES
('MACROCORE', 'MACROCORE�', 'Air Intake Protection', 'Airborne Particulate Contamination', 'Protect engines from airborne dust and particle ingestion'),
('SYNTAPORE', 'SYNTAPORE�', 'Fuel Cleanliness Protection', 'Fuel-Borne Particulate Contamination', 'Protect fuel systems and injection components'),
('SYNTRAX', 'SYNTRAX�', 'Lubrication Protection', 'Oil Contamination and Wear Particles', 'Protect bearings, lubrication circuits and rotating components'),
('NANOFORCE', 'NANOFORCE�', 'Hydraulic Protection', 'Sub-Micron Hydraulic Contamination', 'Maintain hydraulic cleanliness and component reliability'),
('TURBOCORE', 'TURBOCORE�', 'Fuel Water Separation', 'Water Contamination', 'Protect fuel systems from water-induced failure'),
('THERMACORE', 'THERMACORE�', 'Cooling System Protection', 'Coolant Degradation', 'Maintain cooling system integrity and heat-transfer performance'),
('MICROKAPPA', 'MICROKAPPA�', 'Cabin Environment Protection', 'Airborne Pollutants', 'Protect occupants and HVAC systems'),
('DRYCORE', 'DRYCORE�', 'Compressed Air Protection', 'Moisture Contamination', 'Protect pneumatic and air brake systems'),
('INTEKCORE', 'INTEKCORE�', 'Airflow Management', 'Airflow Restriction and Housing Failure', 'Maintain engineered air intake performance')
ON CONFLICT (code) DO NOTHING;

INSERT INTO systems (code, name, description) VALUES
('AIR_INTAKE', 'Air Intake & Airflow Protection', 'Protection of engine intake systems from airborne contamination'),
('FUEL_CLEANLINESS', 'Fuel Cleanliness Protection', 'Protection of fuel systems from particles and water contamination'),
('LUBRICATION', 'Lubrication Protection', 'Protection of lubrication circuits and rotating components'),
('HYDRAULIC', 'Hydraulic Protection', 'Protection of hydraulic systems from particle contamination'),
('COOLING', 'Cooling System Protection', 'Protection of cooling systems from degradation and contamination'),
('CABIN', 'Cabin Air Quality Protection', 'Protection of operators and cabin HVAC systems'),
('COMPRESSED_AIR', 'Compressed Air Protection', 'Protection of pneumatic systems from moisture')
ON CONFLICT (code) DO NOTHING;

INSERT INTO industries (code, name) VALUES
('AGRICULTURE', 'Agriculture'),
('AUTOMOTIVE', 'Automotive'),
('BUS_COACH', 'Bus & Coach'),
('CONSTRUCTION', 'Construction'),
('MANUFACTURING', 'Manufacturing'),
('MARINE', 'Marine'),
('MINING', 'Mining'),
('OIL_GAS', 'Oil & Gas'),
('POWER_GENERATION', 'Power Generation'),
('RAILWAY', 'Railway'),
('TRUCK_FLEETS', 'Truck Fleets'),
('WASTE_MUNICIPAL', 'Waste Municipal')
ON CONFLICT (code) DO NOTHING;

INSERT INTO problems (code, name, failure_mechanism, severity) VALUES
('PARTICLE_WEAR', 'Particle Wear', 'Abrasive Wear', 'HIGH'),
('WATER_CONTAMINATION', 'Water Contamination', 'Corrosion and Injector Damage', 'HIGH'),
('AIR_RESTRICTION', 'Air Restriction', 'Reduced Airflow and Power Loss', 'MEDIUM'),
('VARNISH_FORMATION', 'Varnish Formation', 'Deposit Formation and Valve Stiction', 'HIGH'),
('INJECTOR_DAMAGE', 'Injector Damage', 'Erosion and Stiction', 'HIGH'),
('BEARING_DAMAGE', 'Bearing Damage', 'Abrasive Wear and Fatigue', 'HIGH'),
('HYDRAULIC_FAILURE', 'Hydraulic Failure', 'Valve Stiction and Pump Wear', 'HIGH')
ON CONFLICT (code) DO NOTHING;

INSERT INTO assets (code, name, asset_type) VALUES
('ENGINE', 'Engine', 'Powertrain'),
('HYDRAULIC_SYSTEM', 'Hydraulic System', 'Fluid Power'),
('GENERATOR', 'Generator', 'Power Generation'),
('TRUCK', 'Truck', 'Mobile Asset'),
('EXCAVATOR', 'Excavator', 'Heavy Equipment'),
('MARINE_ENGINE', 'Marine Engine', 'Marine Asset'),
('COMPRESSOR', 'Compressor', 'Industrial Equipment'),
('PUMP', 'Pump', 'Industrial Equipment')
ON CONFLICT (code) DO NOTHING;

INSERT INTO standards (code, name, organization, domain) VALUES
('ISO_16889', 'Multi-pass filter testing', 'ISO', 'Hydraulic and Lube Filtration'),
('ISO_4406', 'Fluid cleanliness code', 'ISO', 'Hydraulic and Lubrication Cleanliness'),
('ISO_5011', 'Air cleaner performance testing', 'ISO', 'Air Intake Filtration'),
('SAE_J1858', 'Lube oil filter performance', 'SAE', 'Heavy-Duty Lube Filtration'),
('ISO_19438', 'Fuel filter performance', 'ISO', 'Fuel Filtration')
ON CONFLICT (code) DO NOTHING;
