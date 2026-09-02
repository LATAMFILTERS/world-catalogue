-- 003_seed_technology_knowledge.sql
--
-- knowledge_center.knowledge_records held zero rows for any ELIMFILTERS
-- technology (confirmed empty in production): the reasoning runtime
-- (services/knowledge-engine-runtime) only answers from
-- production_eligible=true, lifecycle_status IN ('APPROVED','CURRENT',
-- 'LIMITED_USE') rows, so every "what is SYNTRAX" / "difference between
-- SYNTRAX and HYDROCORE" style question on the web chatbot returned
-- ESCALATE -> "no dispongo de informacion", even though the equivalent
-- content is already published and reviewed on /technologies/*. The only
-- prior seed script (scripts/seed-staging-knowledge.mjs) used
-- ON CONFLICT (actor_type, display_name), but no such unique constraint
-- exists on knowledge_center.actors, so that script has never been able to
-- run successfully -- consistent with the table being empty.
--
-- This seeds one APPROVED TECHNOLOGY record per technology (all 10
-- canonical technologies per frontend/src/lib/canonical-technologies.ts),
-- using the reviewed copy already live on each /technologies/<slug>/ page
-- (frontend/src/components/*StablePage.tsx, frontend/src/lib/turbocore-
-- editorial.ts) as the source text, so the chatbot's answers stay
-- consistent with what the site itself says.
--
-- knowledge_center.knowledge_records carries governance triggers (002)
-- that a naive insert-then-update sequence cannot satisfy:
--   - trg_production_approval is a deferred constraint trigger, but it
--     captures NEW.current_version_id from the statement that raised it,
--     not a live re-read at commit time -- so current_version_id must be
--     set in the SAME INSERT that sets production_eligible=true, not via
--     a later UPDATE (confirmed live: "Production-eligible records
--     require a current version" even with a same-transaction UPDATE
--     immediately after).
--   - it also requires a matching, non-revoked approval_records row
--     (decision='APPROVED', approval_scope IN ('TECHNICAL','PRODUCTION'))
--     for that version, which is a live EXISTS check at commit time.
-- So each technology here is one INSERT into knowledge_records with
-- current_version_id already pointing at the version's id (the FK itself
-- is deferrable, and the version row is inserted in the same transaction
-- before commit), followed by the version insert and an approval record.

INSERT INTO knowledge_center.actors (id, actor_type, display_name, active)
VALUES ('00000000-0000-0000-0000-000000000200', 'SYSTEM', 'TECHNOLOGY_CONTENT_MIGRATION', true);

-- DRYCORE
INSERT INTO knowledge_center.knowledge_records (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
VALUES ('00000000-0000-0000-0000-000000002101', 'KC-TECH-DRYCORE-v1', 'TECHNOLOGY', 'APPROVED', true, '00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000002201', now());
INSERT INTO knowledge_center.knowledge_record_versions (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
VALUES ('00000000-0000-0000-0000-000000002201', '00000000-0000-0000-0000-000000002101', 1, '1.0',
  'DRYCORE (TM) Air Dryer Filtration Technology',
  'DRYCORE is the ELIMFILTERS air-dryer filtration architecture for moisture control in compressed-air and pneumatic brake systems.',
  jsonb_build_object(
    'technology', 'DRYCORE',
    'application', 'Compressed-Air Moisture Control',
    'description', 'DRYCORE is ELIMFILTERS air-dryer filtration architecture for compressed-air and pneumatic brake systems. Its engineering role is to remove moisture before condensation can affect valves, actuators and other pneumatic components. Capacity, purge behavior, airflow, compressor duty, ambient moisture exposure and replacement interval must be matched to the approved application.',
    'protectedSystem', 'Air Intake and pneumatic brake systems',
    'sourceUrl', 'https://elimfilters.com/technologies/drycore/'
  ),
  md5('drycore-v1'), 'Seeded from reviewed /technologies/drycore/ page copy', '00000000-0000-0000-0000-000000000200', now());
INSERT INTO knowledge_center.approval_records (external_id, record_version_id, approval_scope, decision, approved_by)
VALUES ('KC-APPROVAL-DRYCORE-v1', '00000000-0000-0000-0000-000000002201', 'PRODUCTION', 'APPROVED', '00000000-0000-0000-0000-000000000200');

-- HYDROCORE
INSERT INTO knowledge_center.knowledge_records (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
VALUES ('00000000-0000-0000-0000-000000002102', 'KC-TECH-HYDROCORE-v1', 'TECHNOLOGY', 'APPROVED', true, '00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000002202', now());
INSERT INTO knowledge_center.knowledge_record_versions (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
VALUES ('00000000-0000-0000-0000-000000002202', '00000000-0000-0000-0000-000000002102', 1, '1.0',
  'HYDROCORE (TM) Fuel/Water Separation Technology',
  'HYDROCORE is the ELIMFILTERS fuel/water separation architecture for approved standard non-turbine diesel separator applications.',
  jsonb_build_object(
    'technology', 'HYDROCORE',
    'application', 'Fuel/Water Separation Architecture',
    'description', 'HYDROCORE is a fuel/water separation architecture developed for approved standard non-turbine diesel separator applications where water control is required before fuel reaches downstream pumps, injectors and other precision fuel-system components. It is distinct from TURBOCORE, which governs approved FH/FG turbine-style fuel/water separator systems.',
    'protectedSystem', 'Fuel system, standard non-turbine fuel/water separators',
    'sourceUrl', 'https://elimfilters.com/technologies/hydrocore/'
  ),
  md5('hydrocore-v1'), 'Seeded from reviewed /technologies/hydrocore/ page copy', '00000000-0000-0000-0000-000000000200', now());
INSERT INTO knowledge_center.approval_records (external_id, record_version_id, approval_scope, decision, approved_by)
VALUES ('KC-APPROVAL-HYDROCORE-v1', '00000000-0000-0000-0000-000000002202', 'PRODUCTION', 'APPROVED', '00000000-0000-0000-0000-000000000200');

-- INTEKCORE
INSERT INTO knowledge_center.knowledge_records (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
VALUES ('00000000-0000-0000-0000-000000002103', 'KC-TECH-INTEKCORE-v1', 'TECHNOLOGY', 'APPROVED', true, '00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000002203', now());
INSERT INTO knowledge_center.knowledge_record_versions (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
VALUES ('00000000-0000-0000-0000-000000002203', '00000000-0000-0000-0000-000000002103', 1, '1.0',
  'INTEKCORE (TM) Air Cleaner Housing and Sealing Technology',
  'INTEKCORE is ELIMFILTERS air-cleaner housing and sealing architecture for controlled airflow and bypass prevention within engine intake systems.',
  jsonb_build_object(
    'technology', 'INTEKCORE',
    'application', 'Air Cleaner Housing and Sealing Architecture',
    'description', 'INTEKCORE preserves the protected airflow boundary through housing geometry, structural integrity, element retention and seal loading. Housing sizing, inlet routing, restriction, element fit, retention and sealing must be validated for the intended duty cycle. Reliable sealing reduces the risk of unfiltered-air ingress around the filtration element.',
    'protectedSystem', 'Engine intake systems',
    'sourceUrl', 'https://elimfilters.com/technologies/intekcore/'
  ),
  md5('intekcore-v1'), 'Seeded from reviewed /technologies/intekcore/ page copy', '00000000-0000-0000-0000-000000000200', now());
INSERT INTO knowledge_center.approval_records (external_id, record_version_id, approval_scope, decision, approved_by)
VALUES ('KC-APPROVAL-INTEKCORE-v1', '00000000-0000-0000-0000-000000002203', 'PRODUCTION', 'APPROVED', '00000000-0000-0000-0000-000000000200');

-- MACROCORE
INSERT INTO knowledge_center.knowledge_records (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
VALUES ('00000000-0000-0000-0000-000000002104', 'KC-TECH-MACROCORE-v1', 'TECHNOLOGY', 'APPROVED', true, '00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000002204', now());
INSERT INTO knowledge_center.knowledge_record_versions (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
VALUES ('00000000-0000-0000-0000-000000002204', '00000000-0000-0000-0000-000000002104', 1, '1.0',
  'MACROCORE (TM) Engine Air Filtration Technology',
  'MACROCORE is the ELIMFILTERS engine air-intake filtration architecture for primary and secondary engine air filtration.',
  jsonb_build_object(
    'technology', 'MACROCORE',
    'application', 'Primary and secondary engine air filtration',
    'description', 'MACROCORE is an engine air-intake filtration architecture for controlling airborne particulate while managing airflow demand, restriction development and sealing integrity. Applied across approved primary and secondary / safety engine-air filtration positions upstream of turbocharger, cylinder and combustion-air components.',
    'protectedSystem', 'Engine air intake',
    'sourceUrl', 'https://elimfilters.com/technologies/macrocore/'
  ),
  md5('macrocore-v1'), 'Seeded from reviewed /technologies/macrocore/ page copy', '00000000-0000-0000-0000-000000000200', now());
INSERT INTO knowledge_center.approval_records (external_id, record_version_id, approval_scope, decision, approved_by)
VALUES ('KC-APPROVAL-MACROCORE-v1', '00000000-0000-0000-0000-000000002204', 'PRODUCTION', 'APPROVED', '00000000-0000-0000-0000-000000000200');

-- MICROKAPPA
INSERT INTO knowledge_center.knowledge_records (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
VALUES ('00000000-0000-0000-0000-000000002105', 'KC-TECH-MICROKAPPA-v1', 'TECHNOLOGY', 'APPROVED', true, '00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000002205', now());
INSERT INTO knowledge_center.knowledge_record_versions (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
VALUES ('00000000-0000-0000-0000-000000002205', '00000000-0000-0000-0000-000000002105', 1, '1.0',
  'MICROKAPPA (TM) Cabin Air Filtration Technology',
  'MICROKAPPA is ELIMFILTERS cabin air filtration architecture for HVAC and passenger-compartment protection.',
  jsonb_build_object(
    'technology', 'MICROKAPPA',
    'application', 'Cabin air filtration',
    'description', 'MICROKAPPA is an HVAC filtration architecture developed to help capture airborne dust, pollen and fine particulate matter before they enter the ventilation system and occupied cabin. Its media structure balances particle retention with controlled airflow resistance, supporting consistent HVAC performance throughout the filter service interval, and helps limit contaminant accumulation within ventilation ducts and evaporator surfaces.',
    'protectedSystem', 'Cabin and HVAC systems',
    'sourceUrl', 'https://elimfilters.com/technologies/microkappa/'
  ),
  md5('microkappa-v1'), 'Seeded from reviewed /technologies/microkappa/ page copy', '00000000-0000-0000-0000-000000000200', now());
INSERT INTO knowledge_center.approval_records (external_id, record_version_id, approval_scope, decision, approved_by)
VALUES ('KC-APPROVAL-MICROKAPPA-v1', '00000000-0000-0000-0000-000000002205', 'PRODUCTION', 'APPROVED', '00000000-0000-0000-0000-000000000200');

-- NANOFORCE
INSERT INTO knowledge_center.knowledge_records (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
VALUES ('00000000-0000-0000-0000-000000002106', 'KC-TECH-NANOFORCE-v1', 'TECHNOLOGY', 'APPROVED', true, '00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000002206', now());
INSERT INTO knowledge_center.knowledge_record_versions (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
VALUES ('00000000-0000-0000-0000-000000002206', '00000000-0000-0000-0000-000000002106', 1, '1.0',
  'NANOFORCE (TM) Hydraulic Fluid Filtration Technology',
  'NANOFORCE is the ELIMFILTERS hydraulic-filtration architecture for maintaining fluid cleanliness in hydraulic systems.',
  jsonb_build_object(
    'technology', 'NANOFORCE',
    'application', 'Hydraulic fluid filtration',
    'description', 'NANOFORCE is a hydraulic-filtration architecture developed to maintain fluid cleanliness around the tolerance requirements of pumps, valves, actuators and precision hydraulic components. Media and element construction are selected according to the required cleanliness target, critical particle size, system flow, pressure, fluid viscosity and operating duty, configured for pressure-line, return-line and approved offline applications.',
    'protectedSystem', 'Hydraulic systems',
    'sourceUrl', 'https://elimfilters.com/technologies/nanoforce/'
  ),
  md5('nanoforce-v1'), 'Seeded from reviewed /technologies/nanoforce/ page copy', '00000000-0000-0000-0000-000000000200', now());
INSERT INTO knowledge_center.approval_records (external_id, record_version_id, approval_scope, decision, approved_by)
VALUES ('KC-APPROVAL-NANOFORCE-v1', '00000000-0000-0000-0000-000000002206', 'PRODUCTION', 'APPROVED', '00000000-0000-0000-0000-000000000200');

-- SYNTAPORE
INSERT INTO knowledge_center.knowledge_records (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
VALUES ('00000000-0000-0000-0000-000000002107', 'KC-TECH-SYNTAPORE-v1', 'TECHNOLOGY', 'APPROVED', true, '00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000002207', now());
INSERT INTO knowledge_center.knowledge_record_versions (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
VALUES ('00000000-0000-0000-0000-000000002207', '00000000-0000-0000-0000-000000002107', 1, '1.0',
  'SYNTAPORE (TM) Diesel Fuel Filtration Technology',
  'SYNTAPORE is the ELIMFILTERS diesel-fuel filtration architecture for primary, secondary and cartridge fuel-filter applications.',
  jsonb_build_object(
    'technology', 'SYNTAPORE',
    'application', 'Primary and secondary spin-on / cartridge fuel filtration',
    'description', 'SYNTAPORE is a diesel-fuel filtration architecture applied across approved primary, secondary and cartridge diesel-fuel filtration stages upstream of precision pumps and injectors. SYNTAPORE governs plain diesel-fuel particulate filtration, distinct from HYDROCORE and TURBOCORE, which govern fuel/water separation.',
    'protectedSystem', 'Diesel fuel system, pumps and injectors',
    'sourceUrl', 'https://elimfilters.com/technologies/syntapore/'
  ),
  md5('syntapore-v1'), 'Seeded from reviewed /technologies/syntapore/ page copy', '00000000-0000-0000-0000-000000000200', now());
INSERT INTO knowledge_center.approval_records (external_id, record_version_id, approval_scope, decision, approved_by)
VALUES ('KC-APPROVAL-SYNTAPORE-v1', '00000000-0000-0000-0000-000000002207', 'PRODUCTION', 'APPROVED', '00000000-0000-0000-0000-000000000200');

-- SYNTRAX
INSERT INTO knowledge_center.knowledge_records (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
VALUES ('00000000-0000-0000-0000-000000002108', 'KC-TECH-SYNTRAX-v1', 'TECHNOLOGY', 'APPROVED', true, '00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000002208', now());
INSERT INTO knowledge_center.knowledge_record_versions (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
VALUES ('00000000-0000-0000-0000-000000002208', '00000000-0000-0000-0000-000000002108', 1, '1.0',
  'SYNTRAX (TM) Lubrication Filtration Technology',
  'SYNTRAX is the ELIMFILTERS engine lubrication filtration architecture developed to control wear debris and soot agglomerates in the oil.',
  jsonb_build_object(
    'technology', 'SYNTRAX',
    'application', 'Engine lubrication filtration',
    'description', 'SYNTRAX is a lubrication-filtration architecture for controlling wear debris, soot agglomerates and other contaminants present in the lubricant while maintaining oil flow and structural integrity through the service interval. Its selection balances efficiency, contaminant capacity, oil flow, pressure drop and structural integrity throughout the service interval.',
    'protectedSystem', 'Engine lubrication, bearings, journals, turbocharger lubrication interfaces, valve-train components',
    'sourceUrl', 'https://elimfilters.com/technologies/syntrax/'
  ),
  md5('syntrax-v1'), 'Seeded from reviewed /technologies/syntrax/ page copy', '00000000-0000-0000-0000-000000000200', now());
INSERT INTO knowledge_center.approval_records (external_id, record_version_id, approval_scope, decision, approved_by)
VALUES ('KC-APPROVAL-SYNTRAX-v1', '00000000-0000-0000-0000-000000002208', 'PRODUCTION', 'APPROVED', '00000000-0000-0000-0000-000000000200');

-- THERMACORE
INSERT INTO knowledge_center.knowledge_records (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
VALUES ('00000000-0000-0000-0000-000000002109', 'KC-TECH-THERMACORE-v1', 'TECHNOLOGY', 'APPROVED', true, '00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000002209', now());
INSERT INTO knowledge_center.knowledge_record_versions (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
VALUES ('00000000-0000-0000-0000-000000002209', '00000000-0000-0000-0000-000000002109', 1, '1.0',
  'THERMACORE (TM) Coolant Filtration Technology',
  'THERMACORE is the ELIMFILTERS cooling-system protection architecture for coolant cleanliness and component protection.',
  jsonb_build_object(
    'technology', 'THERMACORE',
    'application', 'Coolant and Cooling-System Filtration',
    'description', 'THERMACORE is a cooling-system protection architecture for coolant cleanliness and component protection in approved engine and equipment applications.',
    'protectedSystem', 'Cooling systems',
    'sourceUrl', 'https://elimfilters.com/technologies/thermacore/'
  ),
  md5('thermacore-v1'), 'Seeded from reviewed /technologies/thermacore/ page copy', '00000000-0000-0000-0000-000000000200', now());
INSERT INTO knowledge_center.approval_records (external_id, record_version_id, approval_scope, decision, approved_by)
VALUES ('KC-APPROVAL-THERMACORE-v1', '00000000-0000-0000-0000-000000002209', 'PRODUCTION', 'APPROVED', '00000000-0000-0000-0000-000000000200');

-- TURBOCORE
INSERT INTO knowledge_center.knowledge_records (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
VALUES ('00000000-0000-0000-0000-000000002110', 'KC-TECH-TURBOCORE-v1', 'TECHNOLOGY', 'APPROVED', true, '00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000002210', now());
INSERT INTO knowledge_center.knowledge_record_versions (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
VALUES ('00000000-0000-0000-0000-000000002210', '00000000-0000-0000-0000-000000002110', 1, '1.0',
  'TURBOCORE (TM) Turbine Fuel/Water Separation Technology',
  'TURBOCORE is the ELIMFILTERS turbine-style fuel/water separation architecture reserved exclusively for approved FH and FG series systems.',
  jsonb_build_object(
    'technology', 'TURBOCORE',
    'application', 'Turbine-style FH/FG fuel/water separation',
    'description', 'TURBOCORE is the ELIMFILTERS turbine-style fuel/water separation architecture reserved exclusively for approved FH and FG series systems and their dedicated replacement-element configurations, including validated 900FH, 902FH, 1000FH and 1002FH configurations. It relies on the approved turbine housing geometry to route fuel through the intended separation and filtration stages. It is distinct from HYDROCORE, which governs approved standard non-turbine fuel/water separators, and from SYNTAPORE, which governs plain diesel-fuel particulate filtration.',
    'protectedSystem', 'High-pressure fuel pumps, precision diesel injectors, fuel-system control components',
    'sourceUrl', 'https://elimfilters.com/technologies/turbocore/'
  ),
  md5('turbocore-v1'), 'Seeded from reviewed /technologies/turbocore/ page copy (frontend/src/lib/turbocore-editorial.ts)', '00000000-0000-0000-0000-000000000200', now());
INSERT INTO knowledge_center.approval_records (external_id, record_version_id, approval_scope, decision, approved_by)
VALUES ('KC-APPROVAL-TURBOCORE-v1', '00000000-0000-0000-0000-000000002210', 'PRODUCTION', 'APPROVED', '00000000-0000-0000-0000-000000000200');
