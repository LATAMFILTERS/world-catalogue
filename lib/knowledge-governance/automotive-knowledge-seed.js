'use strict';

const { SYSTEMS, TECHNOLOGIES } = require('./knowledge-domain-registry');

const K = Object.freeze({
  LUBE: SYSTEMS.LUBE,
  AIR: SYSTEMS.AIR_INTAKE,
  CABIN: SYSTEMS.CABIN_AIR
});

const T = Object.freeze({
  SYNTRAX: TECHNOLOGIES.SYNTRAX,
  MACROCORE: TECHNOLOGIES.MACROCORE,
  MICROKAPPA: TECHNOLOGIES.MICROKAPPA
});

const AUTOMOTIVE_KNOWLEDGE_SEEDS = Object.freeze([
  {
    id: 'LD-LUBE-PERFORMANCE-BALANCE',
    title: 'Oil Filter Performance Balance',
    knowledge_content_type: 'Engineering Reference',
    systems: [K.LUBE], technologies: [T.SYNTRAX], components: ['Engine Oil Filter', 'Filter Media'],
    shared_engineering_concepts: ['Filtration Efficiency', 'Micron Rating', 'Dirt Holding Capacity', 'Flow Rate', 'Restriction'],
    technical_parameters: { micron_rating_requires_efficiency_context: true, performance_is_multi_parameter: true },
    technical_relationships: [
      'Oil-filter protection depends on balancing particle capture efficiency, contaminant-holding capacity and lubricant flow rather than optimizing a single parameter.',
      'A micron value does not define filtration performance unless it is paired with capture efficiency at that particle size.'
    ],
    source_ids: ['fram_ld_01']
  },
  {
    id: 'LD-LUBE-EXTENDED-SERVICE',
    title: 'Lubricant Type and Extended Filter Service',
    knowledge_content_type: 'Application Note',
    systems: [K.LUBE], technologies: [T.SYNTRAX], components: ['Engine Oil Filter', 'Filter Media'],
    operating_conditions: ['Extended Service Interval', 'High Temperature / Summer Heat'],
    shared_engineering_concepts: ['Service Life', 'Dirt Holding Capacity', 'Flow Rate'],
    problems: ['Filter service capacity may be exceeded before the lubricant service interval is complete'],
    root_causes: ['Extended drain interval without matching filter capacity', 'Thermal and chemical exposure over a longer service period'],
    diagnostics: ['Compare filter service capability with the vehicle and lubricant service strategy'],
    corrective_actions: ['Use a filter whose validated service capability matches the intended maintenance interval'],
    technical_relationships: [
      'Longer lubricant drain intervals increase the time the filter remains exposed to contaminant loading, pressure cycling and thermal stress.',
      'Lubricant chemistry alone does not determine filter compatibility; service interval, application requirements and filter durability must also be considered.'
    ],
    source_ids: ['fram_ld_02','fram_ld_04','fram_ld_26','fram_ld_31','fram_ld_33']
  },
  {
    id: 'LD-LUBE-BYPASS-OPERATION',
    title: 'Oil Filter Bypass Operation and Lubrication Continuity',
    knowledge_content_type: 'Engineering Reference',
    systems: [K.LUBE], technologies: [T.SYNTRAX], components: ['Engine Oil Filter', 'Bypass Valve', 'Filter Media'],
    shared_engineering_concepts: ['Differential Pressure', 'Restriction', 'Bypass', 'Flow Rate'],
    failure_modes: ['Bypass activation under excessive restriction', 'Bypass valve stuck open', 'Bypass valve stuck closed'],
    symptoms: ['Loss of normal filtration while bypass remains open', 'Lubrication restriction risk if required bypass flow is unavailable'],
    diagnostics: ['Evaluate restriction, service condition and application-specific bypass behavior'],
    technical_parameters: { bypass_setting_is_application_specific: true },
    technical_relationships: [
      'Excessive pressure difference across the filter can trigger bypass operation so lubricant flow can continue around the restricted media.',
      'During bypass operation, lubrication flow may continue while filtration through the main media is temporarily reduced or absent.',
      'A bypass setting must be treated as application-specific rather than as a universal filter value.'
    ],
    source_ids: ['fram_ld_03','fram_ld_13','fram_ld_23']
  },
  {
    id: 'LD-LUBE-CONTAMINANT-LOADING',
    title: 'Contaminant Loading, Media Saturation and Oil Filter Life',
    knowledge_content_type: 'Failure Analysis Guide',
    systems: [K.LUBE], technologies: [T.SYNTRAX], components: ['Engine Oil Filter', 'Filter Media'],
    shared_engineering_concepts: ['Contaminant Loading', 'Media Saturation', 'Restriction', 'Service Life'],
    problems: ['Progressive contaminant accumulation', 'Increasing filter restriction', 'Premature loss of effective filter service life'],
    root_causes: ['Soot and combustion byproducts', 'Metallic wear debris', 'Sludge formation', 'Moisture or fuel dilution', 'Extended operation under severe conditions'],
    diagnostics: ['Review lubricant condition, operating severity and filter service history', 'Inspect for evidence of abnormal contamination or premature loading'],
    corrective_actions: ['Correct the contamination source where identified', 'Replace the filter when service limits or contamination conditions require it'],
    technical_relationships: [
      'Increasing contaminant loading consumes available media capacity and can raise flow restriction.',
      'Media saturation can increase pressure differential and raise the likelihood of bypass operation in systems designed with a bypass function.'
    ],
    source_ids: ['fram_ld_04','fram_ld_05','fram_ld_13','fram_ld_19','fram_ld_31']
  },
  {
    id: 'LD-LUBE-FITMENT-COMPATIBILITY',
    title: 'Oil Filter Functional Compatibility and Correct Selection',
    knowledge_content_type: 'Application Note',
    systems: [K.LUBE], technologies: [T.SYNTRAX], components: ['Engine Oil Filter', 'Gasket / Seal', 'Bypass Valve'],
    shared_engineering_concepts: ['Sealing', 'Flow Rate', 'Bypass'],
    problems: ['Incorrect filter selection', 'Sealing incompatibility', 'Flow or bypass incompatibility'],
    root_causes: ['Selection based only on physical resemblance or partial dimensions'],
    diagnostics: ['Verify application, thread or cartridge interface, sealing geometry and required functional specifications'],
    corrective_actions: ['Use a validated application match rather than a visually similar filter'],
    technical_relationships: [
      'Physical similarity does not establish functional interchangeability between oil filters.',
      'Correct fitment requires compatible sealing, attachment geometry and application-specific flow and pressure-control requirements.'
    ],
    source_ids: ['fram_ld_07','fram_ld_29']
  },
  {
    id: 'LD-LUBE-COMPONENT-ARCHITECTURE',
    title: 'Engine Oil Filter Components and Architecture',
    knowledge_content_type: 'Engineering Reference',
    systems: [K.LUBE], technologies: [T.SYNTRAX],
    components: ['Engine Oil Filter', 'Filter Media', 'Bypass Valve', 'Anti-Drainback Valve', 'Center Tube', 'Gasket / Seal', 'Filter Housing / Can', 'Base Plate'],
    shared_engineering_concepts: ['Flow Rate', 'Bypass', 'Sealing', 'Installation'],
    technical_relationships: [
      'Oil-filter architecture combines the filtration element with structural, sealing and flow-control components whose functions depend on the application.',
      'Spin-on and cartridge designs package these functions differently even when both perform engine-lubricant filtration.'
    ],
    source_ids: ['fram_ld_11','fram_ld_20','fram_ld_25']
  },
  {
    id: 'LD-LUBE-SERVICE-ACCESS',
    title: 'Oil Filter Service Access and Removal',
    knowledge_content_type: 'Installation Procedure',
    systems: [K.LUBE], technologies: [T.SYNTRAX], components: ['Engine Oil Filter', 'Filter Housing / Can', 'Gasket / Seal'],
    shared_engineering_concepts: ['Installation', 'Sealing'],
    procedures: [
      'Identify the correct filter location and service configuration before removal.',
      'Use a removal method appropriate to the filter or housing without damaging surrounding components.',
      'Inspect the sealing surface and verify the old seal is not left behind.',
      'Install the validated replacement according to the vehicle or filter service specification and verify for leakage after service.'
    ],
    source_ids: ['fram_ld_09','fram_ld_27']
  },
  {
    id: 'LD-LUBE-LOW-PRESSURE-DIAGNOSIS',
    title: 'Low Oil Pressure and Filtration-Related Diagnostic Context',
    knowledge_content_type: 'Failure Analysis Guide',
    systems: [K.LUBE], technologies: [T.SYNTRAX], components: ['Engine Oil Filter', 'Bypass Valve', 'Filter Media'],
    shared_engineering_concepts: ['Differential Pressure', 'Restriction', 'Failure Analysis'],
    problems: ['Low oil pressure'],
    diagnostics: ['Treat low oil pressure as a system-level symptom and verify lubricant level and condition, filter condition, restriction and other lubrication-system causes before attributing it to a single component'],
    technical_relationships: [
      'A restricted or incorrectly specified filter can be one contributor to abnormal lubrication pressure, but low oil pressure requires system-level diagnosis.',
      'Diagnosis should separate filter restriction from lubricant, pump, engine-clearance and other lubrication-system causes.'
    ],
    source_ids: ['fram_ld_10','fram_ld_13','fram_ld_23']
  },
  {
    id: 'LD-LUBE-SEAL-LEAKAGE',
    title: 'Oil Filter Sealing and Leakage',
    knowledge_content_type: 'Failure Analysis Guide',
    systems: [K.LUBE], technologies: [T.SYNTRAX], components: ['Engine Oil Filter', 'Gasket / Seal', 'Filter Housing / Can'],
    shared_engineering_concepts: ['Sealing', 'Installation', 'Failure Analysis'],
    problems: ['Oil leakage at or near the filter interface'],
    root_causes: ['Damaged or incorrectly seated seal', 'Incorrect filter fitment', 'Installation error', 'Housing or sealing-surface damage'],
    diagnostics: ['Inspect filter fitment, gasket position, sealing surface and housing condition'],
    corrective_actions: ['Correct the sealing or fitment condition and verify the system is leak-free after service'],
    source_ids: ['fram_ld_14','fram_ld_23']
  },
  {
    id: 'LD-LUBE-COLD-START',
    title: 'Cold Temperature, Oil Viscosity and Filter Restriction',
    knowledge_content_type: 'Engineering Reference',
    systems: [K.LUBE], technologies: [T.SYNTRAX], components: ['Engine Oil Filter', 'Filter Media', 'Bypass Valve'],
    operating_conditions: ['Cold Weather / Low Temperature'],
    shared_engineering_concepts: ['Flow Rate', 'Differential Pressure', 'Restriction', 'Bypass'],
    technical_relationships: [
      'Lower lubricant temperature generally increases viscosity, which can increase resistance to flow during cold-start conditions.',
      'Cold-start flow demand can increase pressure differential across the filter and make correct application-specific flow and bypass characteristics important.'
    ],
    source_ids: ['fram_ld_17','fram_ld_34']
  },
  {
    id: 'LD-AIR-SERVICE-INTERVAL',
    title: 'Engine Air Filter Service Interval by Operating Condition',
    knowledge_content_type: 'Service Reference',
    systems: [K.AIR], technologies: [T.MACROCORE], components: ['Engine Air Filter', 'Filter Media', 'Air Filter Housing'],
    operating_conditions: ['Dusty Environment'],
    shared_engineering_concepts: ['Restriction', 'Contaminant Loading', 'Service Life'],
    problems: ['Air-filter loading and increasing intake restriction'],
    diagnostics: ['Evaluate service interval against vehicle requirements, operating environment and observed filter condition'],
    technical_relationships: [
      'Engine-air-filter service life varies with dust exposure, operating environment and vehicle usage rather than mileage alone.',
      'Higher airborne contaminant loading can accelerate media loading and increase intake restriction.'
    ],
    source_ids: ['fram_ld_18','fram_ld_28','fram_ld_34','fram_ld_35']
  },
  {
    id: 'LD-AIR-REPLACEMENT-PROCEDURE',
    title: 'Engine Air Filter Replacement Procedure',
    knowledge_content_type: 'Installation Procedure',
    systems: [K.AIR], technologies: [T.MACROCORE], components: ['Engine Air Filter', 'Air Filter Housing'],
    shared_engineering_concepts: ['Installation', 'Sealing'],
    procedures: [
      'Open the air-filter housing using the vehicle-specific service method.',
      'Remove the used element without introducing loose debris into the clean side of the intake.',
      'Inspect and clean the housing sealing area as appropriate.',
      'Install the validated replacement in the correct orientation and ensure the housing is fully sealed before operation.'
    ],
    source_ids: ['fram_ld_22']
  },
  {
    id: 'LD-AIR-RESTRICTION-SYMPTOMS',
    title: 'Engine Air Filter Loading and Intake Restriction Symptoms',
    knowledge_content_type: 'Failure Analysis Guide',
    systems: [K.AIR], technologies: [T.MACROCORE], components: ['Engine Air Filter', 'Filter Media'],
    shared_engineering_concepts: ['Restriction', 'Contaminant Loading', 'Failure Analysis'],
    problems: ['Excessive intake restriction'],
    root_causes: ['Dust and particulate loading of the filter media'],
    symptoms: ['Reduced airflow to the engine', 'Possible degradation of engine response or efficiency when restriction becomes excessive'],
    diagnostics: ['Inspect the air filter and intake path and use the vehicle or equipment restriction criteria where available'],
    corrective_actions: ['Replace a loaded or damaged air filter when service criteria require it'],
    source_ids: ['fram_ld_12','fram_ld_24','fram_ld_35']
  },
  {
    id: 'LD-AIR-FILTER-ARCHITECTURE',
    title: 'Engine Air Filter Types and Functional Architecture',
    knowledge_content_type: 'Engineering Reference',
    systems: [K.AIR], technologies: [T.MACROCORE], components: ['Engine Air Filter', 'Filter Media', 'Air Filter Housing'],
    shared_engineering_concepts: ['Filtration Efficiency', 'Flow Rate', 'Restriction', 'Sealing'],
    technical_relationships: [
      'Engine-air-filter designs must provide particle capture while maintaining acceptable airflow and sealing within the intake housing.',
      'Media construction and filter geometry affect contaminant capacity, restriction behavior and fitment.'
    ],
    source_ids: ['fram_ld_30','fram_ld_35']
  },
  {
    id: 'LD-CABIN-AIRFLOW-DIRECTION',
    title: 'Cabin Filter Airflow Direction and Layer Orientation',
    knowledge_content_type: 'Installation Procedure',
    systems: [K.CABIN], technologies: [T.MICROKAPPA], components: ['Cabin Air Filter', 'Activated Carbon Media', 'HVAC System'],
    shared_engineering_concepts: ['Installation', 'Flow Rate'],
    problems: ['Incorrect cabin-filter orientation'],
    diagnostics: ['Identify the HVAC airflow direction and the orientation marking on the replacement element before installation'],
    procedures: [
      'Determine airflow direction through the cabin-filter housing.',
      'Orient the filter according to the airflow indicator or vehicle-specific installation requirement.',
      'Verify the element is seated correctly and does not distort the housing seal.'
    ],
    technical_relationships: ['Layered cabin-filter media can be designed for a specific airflow direction, so installation orientation is a functional requirement rather than a cosmetic choice.'],
    source_ids: ['fram_ld_06']
  },
  {
    id: 'LD-CABIN-FUNDAMENTALS',
    title: 'Cabin Air Filtration Fundamentals',
    knowledge_content_type: 'Engineering Reference',
    systems: [K.CABIN], technologies: [T.MICROKAPPA], components: ['Cabin Air Filter', 'HVAC System'],
    shared_engineering_concepts: ['Filtration Efficiency', 'Flow Rate', 'Contaminant Loading', 'Service Life'],
    technical_relationships: [
      'The cabin filter removes airborne particulate matter from air entering the passenger-compartment HVAC path.',
      'As contaminant loading increases, airflow through the element can decline and service replacement becomes necessary.'
    ],
    source_ids: ['fram_ld_08']
  },
  {
    id: 'LD-CABIN-CARBON-MEDIA',
    title: 'Activated Carbon in Cabin Air Filtration',
    knowledge_content_type: 'Engineering Reference',
    systems: [K.CABIN], technologies: [T.MICROKAPPA], components: ['Cabin Air Filter', 'Activated Carbon Media', 'HVAC System'],
    shared_engineering_concepts: ['Flow Rate', 'Service Life'],
    technical_relationships: [
      'Activated-carbon cabin media adds adsorption capability for selected gases and odors while the filter structure continues to manage particulate contamination.',
      'Adsorption capacity is finite and should be treated as a service-life property rather than a permanent function.'
    ],
    source_ids: ['fram_ld_15']
  },
  {
    id: 'LD-CABIN-LOADING-SYMPTOMS',
    title: 'Cabin Filter Loading and HVAC Symptoms',
    knowledge_content_type: 'Failure Analysis Guide',
    systems: [K.CABIN], technologies: [T.MICROKAPPA], components: ['Cabin Air Filter', 'HVAC System'],
    shared_engineering_concepts: ['Restriction', 'Contaminant Loading', 'Failure Analysis'],
    problems: ['Cabin-filter loading', 'Reduced HVAC airflow'],
    symptoms: ['Reduced vent airflow', 'Persistent odor or degraded cabin-air quality when the filter is loaded or exhausted'],
    diagnostics: ['Inspect cabin-filter condition and compare airflow and service history with vehicle requirements'],
    corrective_actions: ['Replace a loaded or exhausted cabin filter when service criteria require it'],
    source_ids: ['fram_ld_16']
  },
  {
    id: 'LD-CABIN-SERVICE-INTERVAL',
    title: 'Cabin Filter Service Interval and Environmental Load',
    knowledge_content_type: 'Service Reference',
    systems: [K.CABIN], technologies: [T.MICROKAPPA], components: ['Cabin Air Filter', 'Activated Carbon Media', 'HVAC System'],
    operating_conditions: ['Dusty Environment', 'High Temperature / Summer Heat'],
    shared_engineering_concepts: ['Contaminant Loading', 'Service Life', 'Restriction'],
    technical_relationships: [
      'Cabin-filter service interval is affected by environmental particulate loading, seasonal conditions and vehicle usage.',
      'High contaminant exposure can shorten effective cabin-filter service life compared with operation in cleaner conditions.'
    ],
    source_ids: ['fram_ld_21','fram_ld_28','fram_ld_32','fram_ld_34']
  },
  {
    id: 'LD-SHARED-SEASONAL-FILTRATION',
    title: 'Seasonal Operating Conditions and Filtration Service',
    knowledge_content_type: 'Service Reference',
    systems: [K.LUBE, K.AIR, K.CABIN], technologies: [T.SYNTRAX, T.MACROCORE, T.MICROKAPPA],
    operating_conditions: ['Cold Weather / Low Temperature', 'High Temperature / Summer Heat', 'Dusty Environment'],
    shared_engineering_concepts: ['Service Life', 'Restriction', 'Contaminant Loading', 'Flow Rate'],
    technical_relationships: [
      'Seasonal temperature and airborne-contamination changes can alter filtration loading, fluid-flow behavior and maintenance demand across multiple vehicle systems.',
      'Seasonal maintenance should verify filter condition and application requirements rather than rely on one universal replacement interval.'
    ],
    source_ids: ['fram_ld_28','fram_ld_32','fram_ld_33','fram_ld_34']
  },
  {
    id: 'LD-SHARED-TOTAL-VEHICLE-PROTECTION',
    title: 'Integrated Vehicle Filtration Protection',
    knowledge_content_type: 'Application Note',
    systems: [K.LUBE, K.AIR, K.CABIN], technologies: [T.SYNTRAX, T.MACROCORE, T.MICROKAPPA],
    shared_engineering_concepts: ['Filtration Efficiency', 'Contaminant Loading', 'Service Life', 'Installation'],
    technical_relationships: [
      'Engine lubrication, engine air intake and cabin-air filtration protect different exposure paths and should be managed as coordinated protection systems rather than unrelated service items.',
      'Correct selection, installation and service condition are common requirements across these filtration systems.'
    ],
    source_ids: ['fram_ld_35','fram_ld_36']
  }
]);

function allCoveredSourceIds() {
  return [...new Set(AUTOMOTIVE_KNOWLEDGE_SEEDS.flatMap((seed) => seed.source_ids))].sort();
}

module.exports = {
  AUTOMOTIVE_KNOWLEDGE_SEEDS,
  allCoveredSourceIds
};
