-- 001_technologies.sql

INSERT INTO technologies
(code,name,system_domain,contamination_threat,protection_objective)
VALUES

('MACROCORE','MACROCORE™','Air Intake Protection',
'Airborne Particulate Contamination',
'Protect engines from airborne contamination'),

('SYNTEPORE','SYNTEPORE™','Fuel Cleanliness Protection',
'Fuel-Borne Contamination',
'Protect fuel systems and injectors'),

('SYNTRAX','SYNTRAX™','Lubrication Protection',
'Lubrication Contamination',
'Protect rotating components'),

('NANOFORCE','NANOFORCE™','Hydraulic Protection',
'Sub-Micron Hydraulic Contamination',
'Maintain hydraulic cleanliness'),

('HYDROCORE','HYDROCORE™','Water Separation',
'Water Contamination',
'Remove water contamination'),

('THERMACORE','THERMACORE™','Cooling System Protection',
'Coolant Degradation',
'Maintain thermal efficiency'),

('MICROKAPPA','MICROKAPPA™','Cabin Protection',
'Airborne Pollutants',
'Protect occupants'),

('DRYCORE','DRYCORE™','Compressed Air Protection',
'Moisture Contamination',
'Protect pneumatic systems'),

('INTEKCORE','INTEKCORE™','Airflow Management',
'Air Restriction',
'Maintain engineered airflow')

ON CONFLICT (code) DO NOTHING;
