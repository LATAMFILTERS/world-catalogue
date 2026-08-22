import type { TechnologySlug } from './canonical-technologies';
import { SYSTEM_RELATIONSHIPS } from './canonical-relationships';

export type ProtectionSystemKey = keyof typeof SYSTEM_RELATIONSHIPS;

export interface ProtectionSystem {
  readonly key: ProtectionSystemKey;
  readonly name: string;
  readonly slug: string;
  readonly tagline: string;
  readonly overview: string;
  readonly engineeringPrinciple: string;
  readonly heroImage: string;
  readonly heroColor: string;
  readonly primaryTechnologies: TechnologySlug[];
  readonly supportingTechnologies: TechnologySlug[];
  readonly productFamilies: string[];
  readonly hdPrefix: string;
  readonly ldPrefix: string | null;
  readonly relatedStandards: string[];
  readonly relatedIndustries: string[];
  readonly relatedSystems: ProtectionSystemKey[];
}

const relationships = <K extends ProtectionSystemKey>(key: K) => {
  const rel = SYSTEM_RELATIONSHIPS[key];
  return {
    primaryTechnologies: [...rel.primaryTechnologies],
    supportingTechnologies: [...rel.supportingTechnologies],
    productFamilies: [...rel.productFamilies],
    relatedStandards: [...rel.standards],
    relatedIndustries: [...rel.industries],
    relatedSystems: [...rel.relatedSystems] as ProtectionSystemKey[],
  };
};

export const PROTECTION_SYSTEMS: Record<ProtectionSystemKey, ProtectionSystem> = {
  'air-intake': {
    key: 'air-intake', name: 'Air Intake & Airflow Protection', slug: 'air-intake',
    tagline: 'Contamination interception across engine intake, operator air, housings, and compressed-air drying.',
    overview: 'Air Intake & Airflow Protection is the first defense layer in any contamination control strategy. It combines engine air filtration, secondary safety protection, operator-cabin air quality, air-cleaner housings, and air-dryer elements within one coordinated airflow protection domain.',
    engineeringPrinciple: 'Progressive media density, controlled sealing, electrostatic capture, adsorption, and desiccant drying are applied according to the protected airflow path. Each family addresses a distinct contamination boundary while remaining part of one airflow protection architecture.',
    heroImage: '/images/carcasa.jd.avif', heroColor: '#FFF12D', hdPrefix: 'EA1', ldPrefix: 'EA3',
    ...relationships('air-intake'),
  },
  'fuel-cleanliness': {
    key: 'fuel-cleanliness', name: 'Fuel Cleanliness Protection', slug: 'fuel-cleanliness',
    tagline: 'Water and particle elimination before the high-pressure injection circuit.',
    overview: 'Fuel Cleanliness Protection defends high-pressure injection systems by controlling particulate contamination and water before fuel reaches precision pumps and injectors.',
    engineeringPrinciple: 'SYNTAPORE™ controls particulate contamination, and HYDROCORE™ provides fuel/water separation across standard spin-on/cartridge separators and Turbine Series FH/FG fuel-separation systems and 2010/2020/2040 replacement elements.',
    heroImage: '/images/fuellseparator-hero.avif', heroColor: '#FFF12D', hdPrefix: 'EF9', ldPrefix: 'EF3',
    ...relationships('fuel-cleanliness'),
  },
  lubrication: {
    key: 'lubrication', name: 'Lubrication Protection', slug: 'lubrication',
    tagline: 'Lubrication protection maintains oil cleanliness by controlling soot, wear debris and degradation products across changing load, viscosity and service conditions.',
    overview: 'Lubrication Protection is the contamination-control layer for oil-wetted engine components. It removes damaging particulate and degradation byproducts before recirculating lubricant reaches bearings, journals, valve-train surfaces and other precision interfaces, helping preserve oil flow and component protection throughout the service interval.',
    engineeringPrinciple: 'Full-flow composite media balances efficiency, contaminant capacity, pressure drop, and valve integrity across changing viscosity and temperature conditions.',
    heroImage: '/images/oil-hand.avif', heroColor: '#FFF12D', hdPrefix: 'EL8', ldPrefix: 'EL3',
    ...relationships('lubrication'),
  },
  hydraulic: {
    key: 'hydraulic', name: 'Hydraulic Protection', slug: 'hydraulic',
    tagline: 'Hydraulic protection controls damaging particles in high-pressure fluid circuits to protect pumps, valves, actuators and precision control components.',
    overview: 'Hydraulic Protection maintains fluid cleanliness around the tolerance requirements of pumps, valves, actuators and servo controls. The system manages contamination before critical particles circulate through precision clearances, where abrasive wear, sticking, leakage and performance loss can accelerate equipment failure and unplanned downtime.',
    engineeringPrinciple: 'Beta-rated media, collapse-resistant construction, and thermal stability are matched to flow, pressure, critical particle size, and duty cycle.',
    heroImage: '/images/hidraulic.avif', heroColor: '#FFF12D', hdPrefix: 'EH6', ldPrefix: null,
    ...relationships('hydraulic'),
  },
  'cooling-system': {
    key: 'cooling-system', name: 'Cooling System Protection', slug: 'cooling-system',
    tagline: 'Cooling-system protection controls coolant contamination, corrosion debris and additive condition to preserve heat transfer and engine cooling reliability.',
    overview: 'Cooling System Protection manages particulate contamination, corrosion products, scale debris and coolant additive condition within heavy-duty engine cooling circuits. The protection strategy supports clean coolant passages, stable heat transfer, wet-liner protection, seal integrity and reliable thermal control across demanding operating and service conditions.',
    engineeringPrinciple: 'Controlled additive release and particulate removal protect wet liners, heat-transfer surfaces, seals, and coolant passages across the service interval.',
    heroImage: '/images/coolant-hero.avif', heroColor: '#FFF12D', hdPrefix: 'EW7', ldPrefix: null,
    ...relationships('cooling-system'),
  },
};

export const PROTECTION_SYSTEM_LIST = Object.values(PROTECTION_SYSTEMS);

export function getProtectionSystemBySlug(slug: string): ProtectionSystem | undefined {
  return PROTECTION_SYSTEM_LIST.find((system) => system.slug === slug);
}
