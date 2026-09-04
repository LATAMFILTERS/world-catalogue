import { type TechnologySlug } from './canonical-technologies';
import { getFailureKnowledgeProfile } from './failure-knowledge';
import { getFamilyBySlug } from './product-families-data';
import { getProtectionSystemBySlug } from './protection-systems-data';

export interface CanonicalEngineeringDefinition {
  readonly name: string;
  readonly definition: string;
  readonly engineeringPrinciple: string;
  readonly controlStrategy: string;
  readonly operationalImpact: string;
}

const TECHNOLOGY_ENGINEERING: Record<TechnologySlug, CanonicalEngineeringDefinition> = {
  macrocore: {
    name: 'MACROCORE™',
    definition: 'An engine air filtration architecture for primary and secondary intake protection.',
    engineeringPrinciple: 'Media configuration, sealing integrity and airflow management work together to control airborne contamination before it reaches the engine.',
    controlStrategy: 'Match media configuration, sealing geometry, restriction limits and service interval to the intake duty cycle and contamination load.',
    operationalImpact: 'Controlled intake contamination helps protect cylinders, piston rings, turbochargers and combustion-system performance.',
  },
  microkappa: {
    name: 'MICROKAPPA™',
    definition: 'A cabin-air protection architecture for particulate and selected gaseous-contaminant control.',
    engineeringPrinciple: 'Cabin filtration is selected around operator exposure, airflow demand and HVAC pressure-drop limits.',
    controlStrategy: 'Match the media configuration to the operating environment and cabin-air protection requirement.',
    operationalImpact: 'Improved cabin-air quality supports operator comfort and sustained equipment operation.',
  },
  syntrax: {
    name: 'SYNTRAX™',
    definition: 'A lubrication filtration architecture for controlling wear debris and lubricant contamination.',
    engineeringPrinciple: 'Filtration performance, contaminant capacity, pressure drop and valve integrity are balanced across the lubricant service interval.',
    controlStrategy: 'Match filtration performance and service interval to engine duty and lubricant condition.',
    operationalImpact: 'Cleaner lubricant helps protect bearings, journals and other lubricated components.',
  },
  syntapore: {
    name: 'SYNTAPORE™',
    definition: 'A diesel-fuel particulate filtration architecture for primary, secondary and cartridge fuel-filter applications.',
    engineeringPrinciple: 'Fuel filtration is staged to control particulate contamination before it reaches pumps and injectors.',
    controlStrategy: 'Apply the required efficiency, capacity, flow and pressure-drop performance at each approved fuel-filtration stage.',
    operationalImpact: 'Cleaner fuel helps maintain fuel-system reliability and precision component protection.',
  },
  nanoforce: {
    name: 'NANOFORCE™',
    definition: 'A hydraulic filtration architecture for contamination control in fluid-power systems.',
    engineeringPrinciple: 'Media and element construction are matched to flow, pressure, particle size, temperature and duty cycle.',
    controlStrategy: 'Set cleanliness targets around the most sensitive hydraulic component and validate filter selection against applicable requirements.',
    operationalImpact: 'Controlled fluid cleanliness helps reduce wear, valve stiction and loss of hydraulic precision.',
  },
  thermacore: {
    name: 'THERMACORE™',
    definition: 'A cooling-system protection architecture for coolant cleanliness and component protection.',
    engineeringPrinciple: 'Coolant filtration supports cleanliness of passages, seals and heat-transfer surfaces within the approved cooling-system maintenance strategy.',
    controlStrategy: 'Match filter chemistry, capacity, flow and service interval to the engine and coolant requirements.',
    operationalImpact: 'Stable coolant condition helps protect cooling-system components and thermal performance.',
  },
  intekcore: {
    name: 'INTEKCORE™',
    definition: 'An air-cleaner housing and sealing architecture for controlled airflow and bypass prevention.',
    engineeringPrinciple: 'Housing geometry, structural integrity, element retention and seal loading preserve the protected intake boundary.',
    controlStrategy: 'Validate housing sizing, inlet routing, restriction, element fit and sealing under the intended duty cycle.',
    operationalImpact: 'Reliable sealing and airflow management reduce unfiltered-air ingress and support intake-system performance.',
  },
  drycore: {
    name: 'DRYCORE™',
    definition: 'An air-dryer filtration architecture for moisture control in pneumatic brake systems.',
    engineeringPrinciple: 'Air-dryer media removes moisture from compressed air before condensation can affect pneumatic components.',
    controlStrategy: 'Match capacity, purge behavior, airflow and replacement interval to compressor duty and ambient moisture exposure.',
    operationalImpact: 'Dry compressed air helps protect valves, actuators and braking-system reliability.',
  },
  hydrocore: {
    name: 'HYDROCORE™',
    definition: 'A fuel/water separation architecture for approved standard non-turbine separator filters, including drain and transparent-bowl configurations.',
    engineeringPrinciple: 'Separation and coalescing behavior are matched to the approved standard separator configuration without extending HYDROCORE scope to FH or FG turbine systems.',
    controlStrategy: 'Match the separator element, flow requirement, water-management configuration and service condition to the approved non-turbine application.',
    operationalImpact: 'Controlled water separation helps reduce water carryover into downstream fuel-system components.',
  },
  turbocore: {
    name: 'TURBOCORE™',
    definition: 'A turbine-style fuel/water separation architecture reserved exclusively for approved FH and FG series systems and their dedicated replacement elements.',
    engineeringPrinciple: 'Housing geometry, staged separation, element retention, sealing and flow routing operate as one turbine-specific fuel/water separation architecture. Element family and filtration grade are independent selection variables: 2010 serves the 500-series architecture, 2020 the 1000-series architecture, and 2040 the 900-series architecture; each family may be specified in 2, 10 or 30 µm grades where approved.',
    controlStrategy: 'First match the approved FH or FG housing to the correct element family (2010, 2020 or 2040). Then select the approved filtration grade independently: 2 µm final, 10 µm secondary, or 30 µm primary filtration. Historical SM/TM/PM suffixes correspond to 2/10/30 µm respectively. Do not infer micron rating from the 2010/2020/2040 family number and do not substitute standard non-turbine separator elements.',
    operationalImpact: 'Maintaining both the correct turbine-specific element family and the correct micron grade supports the intended staged-separation role and reduces bypass, sealing, fitment and incorrect-stage selection risk.',
  },
};

export function getTechnologyEngineering(slug: string): CanonicalEngineeringDefinition | undefined {
  return TECHNOLOGY_ENGINEERING[slug as TechnologySlug];
}

export function getSystemEngineering(slug: string): CanonicalEngineeringDefinition | undefined {
  const system = getProtectionSystemBySlug(slug);
  if (!system) return undefined;
  return {
    name: system.name,
    definition: system.overview,
    engineeringPrinciple: system.engineeringPrinciple,
    controlStrategy: `Coordinate the technologies and product families assigned to ${system.name} around the protected asset, contamination boundary, applicable standard, and operating duty cycle.`,
    operationalImpact: `Consistent ${system.name.toLowerCase()} reduces contamination exposure and supports asset reliability across the service interval.`,
  };
}

export function getFamilyEngineering(slug: string): CanonicalEngineeringDefinition | undefined {
  const family = getFamilyBySlug(slug);
  if (!family) return undefined;
  return {
    name: family.name,
    definition: family.purpose,
    engineeringPrinciple: family.engineering,
    controlStrategy: `Select ${family.name.toLowerCase()} by protected system, duty class, applicable standard, flow or airflow requirement, and service condition.`,
    operationalImpact: `${family.name} supports the contamination-control objective of the ${family.protectionSystem.replace(/-/g, ' ')} domain.`,
  };
}

export function getFailureEngineering(slug: string): CanonicalEngineeringDefinition | undefined {
  const failure = getFailureKnowledgeProfile(slug);
  if (!failure) return undefined;
  return {
    name: failure.name,
    definition: failure.definition,
    engineeringPrinciple: failure.mechanism,
    controlStrategy: failure.controlStrategy,
    operationalImpact: failure.operationalImpact,
  };
}
