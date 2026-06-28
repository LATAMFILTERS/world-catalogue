-- =============================================================================
-- KG PHASE 1 — SEED: kg_systems
-- File: 002_seed_systems.sql
-- Purpose: Insert the 6 canonical filtration system domains
-- Safe to run: YES (ON CONFLICT DO NOTHING — idempotent)
-- =============================================================================

INSERT INTO kg_systems (slug, name, description, sort_order)
VALUES
  (
    'air-intake',
    'Air Intake Filtration',
    'Protects internal combustion engines from airborne particulate contamination at the intake stage. Controls the particle size and concentration entering combustion chambers, directly determining engine wear rates and service life. Failure causes abrasive wear on cylinder liners, pistons, and valve seats.',
    1
  ),
  (
    'fuel',
    'Fuel Filtration',
    'Removes water contamination and particulate matter from diesel fuel systems. Water ingress causes injector stiction, microbial growth, and fuel gum formation. Particle contamination in diesel fuel at injector tolerances (< 5 µm) causes precision surface wear and injector failure. Applies to: diesel, biodiesel, turbine fuel circuits.',
    2
  ),
  (
    'hydraulic',
    'Hydraulic Systems',
    'Controls particle contamination in hydraulic power circuits to protect proportional valves, servo valves, pumps, and actuators. ISO 4406 cleanliness targets are system-specific: servo valves require 14/12/9, mobile equipment typically requires 17/15/12. Contamination causes valve spool stiction, orifice blockage, and pump swashplate stiction.',
    3
  ),
  (
    'lube-oil',
    'Lube / Oil Filtration',
    'Maintains ISO 4406 cleanliness codes in engine crankcase oil, transmission fluid, and bearing lubrication circuits. Particle contamination in lube oil causes abrasive wear: hard particles (silica, metal oxides) between moving surfaces create micro-cutting. Cumulative wear reduces bearing clearance leading to seizure. Target cleanliness: ISO 16/14/11.',
    4
  ),
  (
    'cabin',
    'Cabin / Operator Safety',
    'Filters PM2.5, PM10, chemical vapors, biological contaminants, and allergens from operator cabin air in heavy equipment, trucks, and agricultural machinery. Applies ISO 11155 and DIN 71220 standards. Electrostatic, HEPA-class mechanical filtration, and activated carbon adsorption combined. Direct occupational health protection.',
    5
  ),
  (
    'compressed-air',
    'Compressed Air Systems',
    'Maintains ISO 8573-1 purity classes for pneumatic instrumentation, air tools, and industrial process air. Controls water (liquid and vapor), oil mist, particulates, and microorganisms. Dew point control prevents downstream corrosion and contamination in pneumatic control systems. Classes range from ISO 8573 Class 1 (cleanroom) to Class 5 (general industrial).',
    6
  )
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order  = EXCLUDED.sort_order,
  updated_at  = NOW();

-- Verification
SELECT id, slug, name, sort_order FROM kg_systems ORDER BY sort_order;
