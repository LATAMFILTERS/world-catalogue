import type { KCIndustryDetail } from './types';
import { KC_INDUSTRY_DETAILS as LEGACY_INDUSTRY_DETAILS } from './industries-registry';

const SYSTEM_NAME_MAP: Record<string, string> = {
  'Air Intake Protection': 'Air Intake & Airflow Protection',
  'Cabin Air Protection': 'Air Intake & Airflow Protection',
  'Compressed Air Protection': 'Air Intake & Airflow Protection',
};

function canonicalSystems(systems: string[]): string[] {
  return [...new Set(systems.map((system) => SYSTEM_NAME_MAP[system] ?? system))];
}

function canonicalMarineDetail(detail: KCIndustryDetail): KCIndustryDetail {
  return {
    ...detail,
    contaminationEnvironment: detail.contaminationEnvironment
      .replace('IMO compliance requirements for offshore operations', 'application-specific marine operating and environmental requirements'),
    primaryRisks: detail.primaryRisks.map((risk) =>
      risk === 'IMO compliance for vessel filtration systems'
        ? 'Marine regulatory and operating requirements require application-specific verification'
        : risk,
    ),
    keyMetrics: detail.keyMetrics.map((metric) => {
      if (metric.label === 'IMO compliance') {
        return { label: 'Marine operating requirements', value: 'Application-specific verification' };
      }
      if (metric.label === 'MARINECLEAN™') {
        return { label: 'MARINECLEAN™', value: 'Specialized marine solution' };
      }
      return metric;
    }),
    sections: detail.sections.map((section) => {
      if (section.heading === 'IMO Compliance and MARINECLEAN™') {
        return {
          ...section,
          heading: 'Marine Operating Context and MARINECLEAN™',
          body: 'Marine filtration selection must account for the vessel, engine, fuel-handling environment, operating profile, and the regulatory requirements applicable to the specific jurisdiction and service. MARINECLEAN™ is an ELIMFILTERS specialized commercial solution for marine operating environments. Any certification or compliance claim requires verified product- and application-specific evidence before public use.',
        };
      }
      return section;
    }),
  };
}

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
    {
      heading: 'Vehicle Application Identification',
      body: 'Automotive filtration starts with the actual vehicle application. Year, make and model establish the vehicle family, but engine, fuel type, HVAC configuration, protected system and model-year changes determine whether a filter is actually correct. A visual match or a single cross-reference is not sufficient evidence on its own.',
    },
    {
      heading: 'Operating Duty and Contamination',
      body: 'A commuter vehicle, delivery van, pickup and mixed light-duty fleet can share platforms while accumulating contamination differently. Urban stop-start duty increases repeated starts and idling; highway operation produces longer sustained loading histories; seasonal dust, pollen and road debris alter intake and cabin filtration demand.',
    },
    {
      heading: 'Service and Cross-Reference Discipline',
      body: 'Known OEM and current filter references are useful starting points for product identification, but final acceptance should reconcile the vehicle, engine, model year, protected system, dimensions and documented application evidence. Fleet standardization should follow verified compatibility rather than appearance or one shared specification.',
    },
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
    {
      heading: 'Passenger-Fleet Duty Profile',
      body: 'Bus and coach applications combine propulsion, HVAC, cooling and, on many platforms, pneumatic-system requirements. Urban transit, school transportation, intercity service and shuttle operations can share similar vehicle architecture while operating under very different route lengths, passenger cycles and maintenance windows.',
    },
    {
      heading: 'Route Availability and System Protection',
      body: 'A bus removed from service affects route assignment and passenger capacity. Air intake, fuel, lubrication and cooling protection support engine availability; cabin filtration supports the occupied environment; compressed-air protection must be considered where the vehicle specifies an air-dryer or related pneumatic filtration position.',
    },
    {
      heading: 'Depot Standardization and Application Evidence',
      body: 'Similar body styles do not prove identical filter positions. Before consolidating part numbers across a passenger fleet, maintenance teams should reconcile make, model, year, chassis, engine, protected system, OEM reference, dimensions and documented application evidence.',
    },
  ],
};

const normalizedLegacy: Record<string, KCIndustryDetail> = Object.fromEntries(
  Object.entries(LEGACY_INDUSTRY_DETAILS).map(([slug, detail]) => {
    const normalized: KCIndustryDetail = {
      ...detail,
      systems: canonicalSystems(detail.systems),
    };

    return [slug, slug === 'marine' ? canonicalMarineDetail(normalized) : normalized];
  }),
);

export const KC_INDUSTRY_DETAILS: Record<string, KCIndustryDetail> = {
  ...normalizedLegacy,
  'bus-coach': BUS_COACH_DETAIL,
  automotive: AUTOMOTIVE_DETAIL,
};
