import type { KCIndustryDetail } from './types';
import { KC_INDUSTRY_DETAILS as LEGACY_INDUSTRY_DETAILS } from './industries-registry';

const SYSTEM_NAME_MAP: Record<string, string> = {
  'Air Intake Protection': 'Air Intake & Airflow Protection',
  'Cabin Air Protection': 'Air Intake & Airflow Protection',
  'Compressed Air Protection': 'Air Intake & Airflow Protection',
};

const LEGACY_SLUG_MAP: Record<string, string> = {
  'truck-fleets': 'trucks-fleets',
};

function canonicalSystems(systems: string[]): string[] {
  return [...new Set(systems.map((system) => SYSTEM_NAME_MAP[system] ?? system))];
}

function canonicalMarineDetail(detail: KCIndustryDetail): KCIndustryDetail {
  return {
    ...detail,
    contaminationEnvironment: 'Marine propulsion, auxiliary and hydraulic service with salt exposure, fuel-water contamination risk, tank condensation, transfer contamination, long dwell periods and vessel-specific operating requirements.',
    primaryRisks: detail.primaryRisks.map((risk) =>
      risk === 'IMO compliance for vessel filtration systems'
        ? 'Marine regulatory and operating requirements require application-specific verification'
        : risk,
    ),
    keyMetrics: [
      { label: 'Fuel-water exposure', value: 'Tank, transfer and condensation dependent' },
      { label: 'Salt environment', value: 'Material and sealing compatibility required' },
      { label: 'Marine operating requirements', value: 'Application-specific verification' },
      { label: 'MARINECLEAN™', value: 'Specialized marine solution' },
    ],
    serviceIntervalNote: 'Marine service intervals must follow the approved engine, vessel, fuel-handling system, contamination condition and product evidence. Water accumulation, restriction and fluid condition should be monitored rather than reduced to one universal interval.',
    sections: [
      {
        heading: 'Marine Fuel and Water Management',
        body: 'Marine fuel systems can accumulate water through condensation, transfer practices and storage conditions. Filtration strategy must separate particulate control from water-management requirements and remain matched to the approved engine, housing and fuel-handling architecture.',
      },
      {
        heading: 'Marine Operating Context and MARINECLEAN™',
        body: 'Marine filtration selection must account for the vessel, engine, hydraulic and fuel-handling environment, operating profile, and the regulatory requirements applicable to the specific jurisdiction and service. MARINECLEAN™ is an ELIMFILTERS specialized commercial solution for marine operating environments. Any certification or compliance claim requires verified product- and application-specific evidence before public use.',
      },
    ],
  };
}

const PUBLIC_DETAIL_OVERRIDES: Record<string, Pick<KCIndustryDetail, 'contaminationEnvironment' | 'serviceIntervalNote' | 'keyMetrics' | 'sections'>> = {
  mining: {
    contaminationEnvironment: 'Severe-duty mining service with silica-bearing dust, rock fines, repeated dust events, hydraulic ingression, remote fuel storage and operator-cabin exposure across surface and underground operations.',
    serviceIntervalNote: 'Mining service intervals must be set from measured restriction, contamination loading, fluid condition, equipment duty and approved product/application evidence. Blast proximity, haul cycle, enclosure integrity and maintenance practice can change loading substantially.',
    keyMetrics: [
      { label: 'Dust severity', value: 'Site and duty-cycle dependent' },
      { label: 'Engine-air control', value: 'Restriction + sealing + capacity' },
      { label: 'Hydraulic control', value: 'Component-specific cleanliness target' },
      { label: 'Cabin protection', value: 'Application-specific HVAC and exposure control' },
    ],
    sections: [
      {
        heading: 'Contamination Profile',
        body: 'Mining exposes engine-air, hydraulic, lubrication, fuel and operator-air boundaries to contamination at the same time. The protection strategy must be built around the actual machine, mine process, enclosure condition, service access and contamination source rather than a universal dust concentration or replacement interval.',
      },
      {
        heading: 'Cabin Air Priority',
        body: 'Cabin filtration is part of Air Intake & Airflow Protection and must be selected around the actual operator environment, HVAC flow, seal integrity and applicable occupational requirements. MICROKAPPA™ does not create a universal exposure-control claim; product and workplace performance require application-specific validation.',
      },
    ],
  },
  construction: {
    contaminationEnvironment: 'Construction and demolition service with concrete and soil dust, changing attachments, hydraulic connection exposure, variable weather and repeated machine relocation between work zones.',
    serviceIntervalNote: 'Construction maintenance intervals must follow measured loading, hydraulic condition, machine duty, attachment-change practices and approved application evidence. Demolition, earthmoving and roadwork can impose materially different service demands.',
    keyMetrics: [
      { label: 'Primary contamination source', value: 'Work-zone and task dependent' },
      { label: 'Hydraulic ingress', value: 'Attachment and service-practice dependent' },
      { label: 'Air-intake service', value: 'Restriction-based where applicable' },
      { label: 'Application validation', value: 'Machine + system + duty cycle' },
    ],
    sections: [
      {
        heading: 'Contamination Profile',
        body: 'Construction contamination changes with the task. Demolition, grading, excavation and material handling expose the intake and hydraulic systems differently. Selection should therefore resolve the machine, attachment pattern, dust source, airflow or fluid-flow requirement and service practice before assigning a filter or interval.',
      },
      {
        heading: 'Attachment and Hydraulic Discipline',
        body: 'Hydraulic quick-couplers and field service points can become contamination-ingress paths when connections are exposed or cleaned poorly. Hydraulic protection should combine appropriate filtration with clean connection practices, reservoir control and verification of the most contamination-sensitive component.',
      },
    ],
  },
  agriculture: {
    contaminationEnvironment: 'Seasonal agricultural service with crop residue, grain dust, chaff, soil dust, changing humidity and time-critical harvest duty that can accelerate intake and cabin loading.',
    serviceIntervalNote: 'Agricultural service must be based on actual restriction, crop, season, dust loading, pre-cleaner condition, machine duty and approved product evidence. Harvest conditions can change rapidly and should not be reduced to a fixed universal interval.',
    keyMetrics: [
      { label: 'Seasonal loading', value: 'Crop and harvest-condition dependent' },
      { label: 'Pre-cleaner benefit', value: 'Configuration and field-condition dependent' },
      { label: 'Cabin demand', value: 'Dust + pollen + HVAC dependent' },
      { label: 'Service trigger', value: 'Condition and application specific' },
    ],
    sections: [
      {
        heading: 'Harvest Season Contamination',
        body: 'Harvest combines crop dust, chaff and disturbed soil around high-airflow machinery. Intake protection should be evaluated as a system including pre-cleaning where applicable, primary filtration, sealing, restriction monitoring and service access rather than assuming one interval or life-extension multiplier.',
      },
      {
        heading: 'Seasonal Equipment Strategy',
        body: 'Combines, tractors, sprayers and support equipment experience different contamination sources and duty cycles. Filter selection and maintenance planning should be matched to the actual machine, engine, hydraulic configuration, cabin environment and seasonal use profile.',
      },
    ],
  },
  'trucks-fleets': {
    contaminationEnvironment: 'Commercial truck operation across long-haul, regional, vocational and urban duty with highway dust, repeated starts, idling, variable fuel quality, cabin exposure and aftertreatment-related operating effects.',
    serviceIntervalNote: 'Fleet intervals must be established from the validated engine and vehicle application, measured restriction or condition data, lubricant analysis where used, route duty and maintenance history. Highway and urban fleets should not share one generic interval by default.',
    keyMetrics: [
      { label: 'Fleet duty', value: 'Long-haul, regional, vocational or urban' },
      { label: 'Air-intake service', value: 'Application and restriction dependent' },
      { label: 'Lubrication strategy', value: 'Engine duty + lubricant condition' },
      { label: 'Fleet standardization', value: 'Verified application compatibility' },
    ],
    sections: [
      {
        heading: 'Modern Diesel Operating Conditions',
        body: 'Commercial diesel fleets combine engine-air, fuel, lubrication, cooling and cabin requirements under different route and idle patterns. Aftertreatment and recirculation strategies can influence lubricant and intake conditions, but the resulting maintenance decision must remain tied to the engine, oil specification, operating history and approved application data.',
      },
      {
        heading: 'Condition-Based Fleet Maintenance',
        body: 'Extended service strategies should be supported by appropriate condition evidence such as restriction history, oil analysis, fuel quality observations and maintenance records. Filter capacity alone does not establish an oil-drain or component-service interval.',
      },
    ],
  },
  marine: {
    contaminationEnvironment: '', serviceIntervalNote: '', keyMetrics: [], sections: [],
  },
  'oil-gas': {
    contaminationEnvironment: 'Oil and gas operations with drilling dust, sand, produced fluids, sour-service exposure, compressor and pneumatic-control requirements, and contamination risk across upstream, midstream and processing assets.',
    serviceIntervalNote: 'Oil and gas filtration intervals and material requirements must be validated against the actual process, gas and fluid chemistry, pressure, temperature, contamination source, equipment specification and safety requirements.',
    keyMetrics: [
      { label: 'Material compatibility', value: 'Process- and chemistry-specific' },
      { label: 'Compressed-air quality', value: 'Application-specific ISO 8573 class where required' },
      { label: 'Air-intake loading', value: 'Site and drilling-activity dependent' },
      { label: 'Validation basis', value: 'Equipment + process + safety requirements' },
    ],
    sections: [
      {
        heading: 'Process and Environmental Contamination',
        body: 'Oil and gas equipment can encounter drilling solids, airborne dust, produced fluids and corrosive or chemically aggressive service. Filter media, seals and housings must be selected from the actual process chemistry and equipment specification; no single elastomer or cleanliness class should be treated as universally required across the industry.',
      },
      {
        heading: 'Instrument and Compressed Air',
        body: 'Instrument-air quality requirements depend on the pneumatic equipment and process. ISO 8573-1 provides a classification framework, but the required class must come from the specific application and equipment requirement rather than a single industry-wide default.',
      },
    ],
  },
  manufacturing: {
    contaminationEnvironment: 'Manufacturing service with machining particulate, metalworking-fluid mist, hydraulic and lubrication contamination, and compressed-air requirements that vary substantially by process and equipment.',
    serviceIntervalNote: 'Manufacturing maintenance intervals should follow machine condition, hydraulic cleanliness targets, compressor and dryer performance, process criticality and approved filter evidence rather than fixed hour ranges.',
    keyMetrics: [
      { label: 'Hydraulic cleanliness', value: 'Most-sensitive-component dependent' },
      { label: 'Compressed-air class', value: 'Process-specific ISO 8573 requirement' },
      { label: 'Particle sensitivity', value: 'Equipment and clearance dependent' },
      { label: 'Maintenance trigger', value: 'Condition + process criticality' },
    ],
    sections: [
      {
        heading: 'Precision Manufacturing Requirements',
        body: 'Precision hydraulic and lubrication systems should be protected around the most contamination-sensitive component, actual circuit pressure and flow, fluid viscosity and manufacturer cleanliness requirement. NANOFORCE™ performance claims remain product-specific and must not be inferred from the industry page.',
      },
      {
        heading: 'Compressed Air Quality',
        body: 'Manufacturing processes can require very different compressed-air purity classes. ISO 8573-1 supplies the classification framework; the applicable particle, water and oil class must be selected from the actual process and equipment requirement.',
      },
    ],
  },
  'power-generation': {
    contaminationEnvironment: 'Power-generation service spanning standby diesel, continuous gensets and applicable turbine-intake environments with air, fuel, lubrication and cooling risks shaped by location, readiness duty and operating profile.',
    serviceIntervalNote: 'Power-generation maintenance must follow the engine or turbine requirement, readiness duty, stored-fuel condition, restriction or fluid-condition evidence and approved application data. Standby and continuous-duty assets require different strategies.',
    keyMetrics: [
      { label: 'Operating mode', value: 'Standby or continuous duty' },
      { label: 'Air-intake loading', value: 'Site and inlet-system dependent' },
      { label: 'Stored-fuel control', value: 'Condition and water-management dependent' },
      { label: 'Readiness validation', value: 'Asset and maintenance-program specific' },
    ],
    sections: [
      {
        heading: 'Air Intake and Continuous Operation',
        body: 'Power-generation air-intake protection must balance contamination control with the airflow and restriction limits of the installed equipment. Coastal, industrial and dusty sites can create different loading mechanisms, so filter selection and cleaning strategy must be validated against the actual inlet system.',
      },
      {
        heading: 'Standby Diesel Readiness',
        body: 'Stored diesel can accumulate water and contamination during long dwell periods. Fuel conditioning, filtration and water management should be selected from tank condition, fuel analysis, engine requirements and maintenance practice; HYDROCORE™ or TURBOCORE™ scope depends on the approved separator architecture and must not be generalized as a universal polishing requirement.',
      },
    ],
  },
  railway: {
    contaminationEnvironment: 'Railway service with diesel soot, brake particulate, tunnel exposure, constrained maintenance windows and heterogeneous locomotive or rail-vehicle fleets.',
    serviceIntervalNote: 'Rail service intervals should follow route environment, engine and intake configuration, lubricant condition, operating hours and fleet maintenance evidence rather than one tunnel/surface hour range.',
    keyMetrics: [
      { label: 'Route environment', value: 'Tunnel and surface exposure differ' },
      { label: 'Lubrication condition', value: 'Engine and oil-analysis dependent' },
      { label: 'Fleet standardization', value: 'Verified compatibility only' },
      { label: 'Maintenance planning', value: 'Route and availability dependent' },
    ],
    sections: [
      {
        heading: 'Railway Contamination Profile',
        body: 'Rail equipment can encounter engine soot, brake particulate and concentrated tunnel contaminants while operating under limited maintenance windows. Intake and lubrication strategy should be matched to the actual locomotive or rail vehicle, route profile and measured condition.',
      },
      {
        heading: 'Fleet Standardization',
        body: 'Standardization can reduce parts complexity only when the underlying applications are truly compatible. Fleet consolidation should reconcile engine, housing, dimensions, system function and validated cross-reference evidence before one filter is assigned across multiple classes.',
      },
    ],
  },
  'waste-municipal': {
    contaminationEnvironment: 'Waste and municipal fleet service with repeated stop-start operation, idling, PTO use, hydraulic compaction, road and organic particulate exposure, moisture and public-service availability requirements.',
    serviceIntervalNote: 'Waste and municipal intervals must reflect route duty, idle and PTO history, hydraulic condition, intake loading, lubricant condition and approved application evidence. Repeated stop-start service should be treated as a duty variable, not a fixed universal interval.',
    keyMetrics: [
      { label: 'Duty profile', value: 'Stop-start + idle + PTO dependent' },
      { label: 'Hydraulic loading', value: 'Compaction-system dependent' },
      { label: 'Cabin environment', value: 'Particulate and HVAC dependent' },
      { label: 'Service planning', value: 'Route and asset-condition based' },
    ],
    sections: [
      {
        heading: 'Refuse Collection Duty Cycle',
        body: 'Refuse collection combines repeated acceleration, idling and PTO-driven hydraulic work. Maintenance planning should use actual route history, engine condition, hydraulic condition and contamination exposure instead of assuming one pressure, stop count or service interval applies to every vehicle.',
      },
      {
        heading: 'Bioaerosol and Organic Dust',
        body: 'Organic waste can increase particulate and biological loading around the operator environment. MICROKAPPA™ supports cabin-air filtration where approved, but occupational exposure control requires the complete HVAC enclosure, work practice and applicable workplace requirements; the filter alone must not be presented as a universal health-control solution.',
      },
    ],
  },
};

const AUTOMOTIVE_DETAIL: KCIndustryDetail = {
  slug: 'automotive',
  contaminationEnvironment: 'Variable light-duty service — urban stop-start operation, highway duty, seasonal dust and pollen, road debris, repeated starts, idling, climate-dependent HVAC demand and mixed fleet utilization.',
  primaryRisks: [
    'Incorrect year, make, model or engine identification causing application mismatch',
    'Engine air contamination from road dust and intake loading',
    'Lubrication contamination from wear debris, combustion byproducts and service ingress',
    'Fuel-system contamination requiring application-specific filtration',
    'Cabin particulate and pollen loading through the HVAC system',
  ],
  serviceIntervalNote: 'Service intervals must follow the validated vehicle application and actual operating duty. Urban stop-start service, dusty roads, seasonal pollen and fleet utilization can change loading history and should not be reduced to one generic interval.',
  keyMetrics: [
    { label: 'Primary identification', value: 'Year + make + model + engine' },
    { label: 'Application control', value: 'Model year and system configuration' },
    { label: 'Duty profiles', value: 'Urban, highway, seasonal and fleet' },
    { label: 'Validation evidence', value: 'OEM reference + dimensions + application data' },
  ],
  technologies: ['MACROCORE™', 'SYNTRAX™', 'MICROKAPPA™'],
  standards: [],
  systems: ['Air Intake & Airflow Protection', 'Fuel Cleanliness Protection', 'Lubrication Protection'],
  sections: [
    { heading: 'Vehicle Application Identification', body: 'Automotive filtration starts with the actual vehicle application. Year, make and model establish the vehicle family, but engine, fuel type, HVAC configuration, protected system and model-year changes determine whether a filter is actually correct. A visual match or a single cross-reference is not sufficient evidence on its own.' },
    { heading: 'Operating Duty and Contamination', body: 'A commuter vehicle, delivery van, pickup and mixed light-duty fleet can share platforms while accumulating contamination differently. Urban stop-start duty increases repeated starts and idling; highway operation produces longer sustained loading histories; seasonal dust, pollen and road debris alter intake and cabin filtration demand.' },
    { heading: 'Service and Cross-Reference Discipline', body: 'Known OEM and current filter references are useful starting points for product identification, but final acceptance should reconcile the vehicle, engine, model year, protected system, dimensions and documented application evidence. Fleet standardization should follow verified compatibility rather than appearance or one shared specification.' },
  ],
};

const BUS_COACH_DETAIL: KCIndustryDetail = {
  slug: 'bus-coach',
  contaminationEnvironment: 'Passenger-fleet service — urban stop-and-go duty, repeated acceleration and braking, idling, continuous HVAC use, road particulate, scheduled depot maintenance and route-availability requirements.',
  primaryRisks: [
    'Air intake contamination affecting engine protection through long daily duty cycles',
    'Fuel and water contamination affecting passenger-fleet engine availability',
    'Lubrication contamination under repeated duty cycling and idling',
    'Moisture and contamination in compressed-air systems where air-dryer positions are specified',
    'Cabin and HVAC particulate loading in continuously occupied vehicles',
    'Cooling-system contamination under repeated thermal cycling',
  ],
  serviceIntervalNote: 'Maintenance planning must reconcile vehicle platform, engine, route duty, depot schedule, HVAC demand, pneumatic-system configuration and validated application evidence before fleet-wide intervals or part standardization are accepted.',
  keyMetrics: [
    { label: 'Primary duty', value: 'Stop-and-go + scheduled route service' },
    { label: 'Passenger environment', value: 'Continuous HVAC and repeated door cycles' },
    { label: 'Pneumatic systems', value: 'Application-specific compressed-air protection' },
    { label: 'Fleet validation', value: 'Engine + chassis + system + application evidence' },
  ],
  technologies: ['MACROCORE™', 'HYDROCORE™', 'SYNTRAX™', 'DRYCORE™', 'MICROKAPPA™', 'THERMACORE™'],
  standards: [],
  systems: ['Air Intake & Airflow Protection', 'Fuel Cleanliness Protection', 'Lubrication Protection', 'Cooling System Protection'],
  sections: [
    { heading: 'Passenger-Fleet Duty Profile', body: 'Bus and coach applications combine propulsion, HVAC, cooling and, on many platforms, pneumatic-system requirements. Urban transit, school transportation, intercity service and shuttle operations can share similar vehicle architecture while operating under very different route lengths, passenger cycles and maintenance windows.' },
    { heading: 'Route Availability and System Protection', body: 'A bus removed from service affects route assignment and passenger capacity. Air intake, fuel, lubrication and cooling protection support engine availability; cabin filtration supports the occupied environment; compressed-air protection must be considered where the vehicle specifies an air-dryer or related pneumatic filtration position.' },
    { heading: 'Depot Standardization and Application Evidence', body: 'Similar body styles do not prove identical filter positions. Before consolidating part numbers across a passenger fleet, maintenance teams should reconcile make, model, year, chassis, engine, protected system, OEM reference, dimensions and documented application evidence.' },
  ],
};

const normalizedLegacy: Record<string, KCIndustryDetail> = Object.fromEntries(
  Object.entries(LEGACY_INDUSTRY_DETAILS).map(([legacySlug, detail]) => {
    const slug = LEGACY_SLUG_MAP[legacySlug] ?? legacySlug;
    const normalized: KCIndustryDetail = {
      ...detail,
      slug,
      systems: canonicalSystems(detail.systems),
    };

    const base = slug === 'marine' ? canonicalMarineDetail(normalized) : normalized;
    const override = PUBLIC_DETAIL_OVERRIDES[slug];
    if (!override || slug === 'marine') return [slug, base];

    return [slug, { ...base, ...override }];
  }),
);

export const KC_INDUSTRY_DETAILS: Record<string, KCIndustryDetail> = {
  ...normalizedLegacy,
  'bus-coach': BUS_COACH_DETAIL,
  automotive: AUTOMOTIVE_DETAIL,
};
