import { CANONICAL_TECHNOLOGIES, type TechnologySlug } from './canonical-technologies';
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
    definition: 'A progressive-density engine air filtration architecture for primary and secondary intake protection.',
    engineeringPrinciple: 'Layered media zones distribute contaminant loading through the media depth while balancing efficiency, dust capacity, and airflow restriction.',
    controlStrategy: 'Match media configuration, sealing geometry, restriction limits, and service interval to the intake duty cycle and contamination load.',
    operationalImpact: 'Reduced particulate ingestion helps protect cylinders, piston rings, turbochargers, and combustion-system efficiency.',
  },
  microkappa: {
    name: 'MICROKAPPA™',
    definition: 'A cabin-air protection architecture for particulate, allergen, odor, and selected gaseous-contaminant control.',
    engineeringPrinciple: 'Mechanical and electrostatic particle capture can be combined with adsorption layers according to the operator-environment requirement.',
    controlStrategy: 'Select media layers around particle exposure, odor loading, airflow demand, and cabin pressure-drop limits.',
    operationalImpact: 'Improved operator-air quality supports comfort, visibility, and sustained equipment operation in contaminated environments.',
  },
  syntrax: {
    name: 'SYNTRAX™',
    definition: 'A lubrication filtration architecture for controlling soot agglomerates, wear debris, and oxidation byproducts.',
    engineeringPrinciple: 'Full-flow composite media balances efficiency, contaminant capacity, pressure drop, and valve integrity across changing oil viscosity.',
    controlStrategy: 'Match filtration performance, bypass behavior, anti-drainback function, and service interval to engine duty and lubricant condition.',
    operationalImpact: 'Cleaner lubricant helps preserve bearings, journals, valve-train components, and oil-film integrity.',
  },
  syntepore: {
    name: 'SYNTEPORE™',
    definition: 'A diesel-fuel filtration architecture for primary and secondary particulate control.',
    engineeringPrinciple: 'Staged synthetic media targets the particle population that threatens precision pumps and injector clearances.',
    controlStrategy: 'Apply the required efficiency, capacity, flow, and pressure-drop performance at each fuel-filtration stage.',
    operationalImpact: 'Cleaner fuel helps maintain injector metering, pump durability, combustion quality, and fuel-system reliability.',
  },
  nanoforce: {
    name: 'NANOFORCE™',
    definition: 'A hydraulic filtration architecture for high-pressure circuits and precision fluid-power components.',
    engineeringPrinciple: 'Beta-rated media and collapse-resistant construction are matched to flow, pressure, particle size, temperature, and duty cycle.',
    controlStrategy: 'Set cleanliness targets around the most sensitive component and validate filter selection against ISO 16889 and ISO 4406 requirements.',
    operationalImpact: 'Controlled fluid cleanliness helps reduce valve stiction, pump wear, leakage, and loss of hydraulic precision.',
  },
  thermacore: {
    name: 'THERMACORE™',
    definition: 'A cooling-system protection architecture for coolant cleanliness and controlled additive support.',
    engineeringPrinciple: 'Particulate removal and controlled additive release protect wet liners, passages, seals, and heat-transfer surfaces.',
    controlStrategy: 'Match coolant-filter chemistry, capacity, flow, and service interval to coolant volume and engine requirements.',
    operationalImpact: 'Stable coolant condition helps reduce corrosion, scale, cavitation exposure, and thermal-performance loss.',
  },
  intekcore: {
    name: 'INTEKCORE™',
    definition: 'An air-cleaner housing and sealing architecture for controlled airflow and bypass prevention.',
    engineeringPrinciple: 'Housing geometry, structural integrity, element retention, and seal loading work together to preserve the protected intake boundary.',
    controlStrategy: 'Validate housing sizing, inlet routing, restriction, dust evacuation, element fit, and sealing under the intended duty cycle.',
    operationalImpact: 'Reliable sealing and airflow management reduce unfiltered-air ingress and protect intake-system performance.',
  },
  drycore: {
    name: 'DRYCORE™',
    definition: 'An air-dryer filtration architecture for moisture control in pneumatic braking and instrument-air systems.',
    engineeringPrinciple: 'Molecular-sieve desiccant adsorbs water vapor before it can condense, freeze, or corrode pneumatic components.',
    controlStrategy: 'Match desiccant capacity, purge behavior, airflow, and replacement interval to compressor duty and ambient moisture exposure.',
    operationalImpact: 'Dry compressed air helps protect valves, actuators, controls, and braking-system reliability.',
  },
  hydrocore: {
    name: 'HYDROCORE™',
    definition: 'A fuel-water separation architecture for free and emulsified water control in diesel fuel systems.',
    engineeringPrinciple: 'Staged separation, droplet coalescence, gravity collection, and a hydrophobic barrier remove water while supporting particulate control.',
    controlStrategy: 'Select separation efficiency, flow capacity, collection volume, drainage, and service interval for the fuel quality and duty cycle.',
    operationalImpact: 'Reduced water exposure helps protect pumps, injectors, fuel lubricity, and storage-system cleanliness.',
  },
  turbocore: {
    name: 'TURBOCORE™',
    definition: 'A dedicated fuel-separation architecture for Turbine Series FH and FG systems.',
    engineeringPrinciple: 'Multi-stage turbine flow management separates water and contamination before final fuel delivery to the protected circuit.',
    controlStrategy: 'Configure the FH or FG assembly around required flow, separation duty, collection capacity, installation, and maintenance access.',
    operationalImpact: 'Staged turbine separation improves bulk fuel conditioning and reduces contamination exposure in demanding applications.',
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
