-- 200_problem_relationships.sql

INSERT INTO graph_relationship_types (code,name)
VALUES
('DAMAGES','Damages'),
('MITIGATES','Mitigates')
ON CONFLICT (code) DO NOTHING;

-- Particle Wear -> Engine

-- Water Contamination -> Fuel System

-- Air Restriction -> Engine

-- Varnish Formation -> Hydraulic System

-- Injector Damage -> Engine

-- Bearing Damage -> Engine

-- Hydraulic Failure -> Hydraulic System

-- Coolant Breakdown -> Engine
