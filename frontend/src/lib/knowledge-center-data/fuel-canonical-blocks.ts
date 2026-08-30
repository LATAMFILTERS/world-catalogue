/**
 * ELIMFILTERS Knowledge Center — Fuel Cleanliness Canonical Knowledge Blocks
 *
 * Governance rule:
 * - Canonical blocks describe generic industry knowledge only.
 * - External manufacturer evidence must never be converted into an ELIMFILTERS
 *   product/technology construction or performance claim.
 * - Quantitative claims require independent secondary validation before publication.
 * - Technology relationships describe scope/relevance only; they do not imply that
 *   HYDROCORE™ or TURBOCORE™ uses a construction found in an external source.
 */

export type KCCanonicalValidationStatus =
  | 'pending-secondary-validation'
  | 'validated';

export type KCCanonicalPublicationStatus =
  | 'internal-only'
  | 'approved-for-publication';

export interface KCFuelCanonicalBlock {
  canonicalId: string;
  slug: string;
  title: string;
  technicalDefinition: string;
  engineeringExplanation: string;
  operatingConsequences: string[];
  relatedComponents: string[];
  relatedContaminants: string[];
  relatedApplications: string[];
  relatedSystems: string[];
  relatedTechnologies: string[];
  confidence: 'high' | 'medium' | 'low';
  validationStatus: KCCanonicalValidationStatus;
  publicationStatus: KCCanonicalPublicationStatus;
  claimBoundary: string;
}

export const FUEL_CANONICAL_BLOCKS: KCFuelCanonicalBlock[] = [
  {
    canonicalId: 'FUEL-CKB-001',
    slug: 'modern-diesel-fuel-chemistry',
    title: 'Modern Diesel Fuel Chemistry',
    technicalDefinition:
      'Modern diesel-fuel formulations can differ materially from earlier fuels because refining processes, additive packages and renewable-content blending alter properties relevant to filtration, lubricity and water behavior.',
    engineeringExplanation:
      'Fuel-cleanliness engineering must account for the fuel actually in service rather than assuming that water separation, contaminant behavior and media interaction remain constant across formulations.',
    operatingConsequences: [
      'Changed water-separation behavior',
      'Changed contaminant interaction with filtration media',
      'Greater need to match filtration architecture to the approved fuel and application',
    ],
    relatedComponents: ['Fuel tank', 'Fuel lines', 'Primary fuel filter', 'Secondary fuel filter'],
    relatedContaminants: ['Water', 'Particulate contamination', 'Fuel degradation products'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
    confidence: 'high',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Does not establish any ELIMFILTERS media chemistry, additive compatibility, efficiency or water-separation performance claim.',
  },
  {
    canonicalId: 'FUEL-CKB-002',
    slug: 'water-contamination-states-in-diesel-fuel',
    title: 'Water Contamination in Diesel Fuel',
    technicalDefinition:
      'Water can be present in diesel-fuel systems in different physical states, including separated/free water and smaller dispersed or emulsified droplets depending on fuel chemistry, temperature, agitation and contamination conditions.',
    engineeringExplanation:
      'The physical state of water influences how readily it can settle, be collected, or require a dedicated separation mechanism before the fuel reaches precision components.',
    operatingConsequences: [
      'Corrosion risk',
      'Reduced fuel-system reliability',
      'Potential damage to pumps and injectors',
      'Need for drainage and water-management service practices',
    ],
    relatedComponents: ['Fuel tank', 'Fuel/water separator', 'Drain bowl', 'High-pressure pump', 'Injectors'],
    relatedContaminants: ['Free water', 'Dispersed water', 'Emulsified water'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['HYDROCORE™', 'TURBOCORE™'],
    confidence: 'high',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Technology relationship indicates application scope only and does not assert universal water-removal efficiency.',
  },
  {
    canonicalId: 'FUEL-CKB-003',
    slug: 'surfactants-and-fuel-water-separation',
    title: 'Surfactants and Fuel-Water Separation',
    technicalDefinition:
      'Surface-active compounds present in fuel additive packages or introduced through contamination can reduce interfacial tension and influence the stability and size of water droplets dispersed in diesel fuel.',
    engineeringExplanation:
      'When smaller droplets remain stable in the fuel phase, gravity separation becomes less effective and the separator architecture must be evaluated for the actual fuel, flow and operating condition.',
    operatingConsequences: [
      'More persistent dispersed water',
      'Reduced effectiveness of gravity-only separation',
      'Greater sensitivity to fuel formulation and service condition',
    ],
    relatedComponents: ['Fuel/water separator', 'Separator element', 'Drain bowl'],
    relatedContaminants: ['Dispersed water', 'Emulsified water', 'Surface-active contaminants'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['HYDROCORE™', 'TURBOCORE™'],
    confidence: 'high',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Does not claim that ELIMFILTERS uses a specific proprietary surface treatment, chemistry, nanofiber or competitor-derived media design.',
  },
  {
    canonicalId: 'FUEL-CKB-004',
    slug: 'water-coalescence-fundamentals',
    title: 'Water Coalescence Fundamentals',
    technicalDefinition:
      'Coalescence is a separation mechanism in which smaller water droplets are brought into contact so they can combine into larger droplets that are easier to separate from the fuel stream.',
    engineeringExplanation:
      'Effective coalescence depends on the interaction between droplet size, media characteristics, fuel chemistry, flow velocity, residence time and downstream collection geometry.',
    operatingConsequences: [
      'Improved ability to collect separated water when the system is correctly matched',
      'Dependence on separator geometry and drainage management',
      'Performance variation with fuel and operating conditions',
    ],
    relatedComponents: ['Separator media', 'Fuel/water separator housing', 'Drain bowl', 'Drain valve'],
    relatedContaminants: ['Dispersed water', 'Emulsified water'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['HYDROCORE™', 'TURBOCORE™'],
    confidence: 'high',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'No numerical surface-area, chemical-reactivity, droplet-size or efficiency value may be attributed to HYDROCORE™ or TURBOCORE™ without ELIMFILTERS product-level validation.',
  },
  {
    canonicalId: 'FUEL-CKB-005',
    slug: 'diesel-fuel-particle-contamination',
    title: 'Particle Contamination in Diesel Fuel',
    technicalDefinition:
      'Solid particulate contamination in diesel fuel can produce abrasive wear in pumps, injectors and other precision fuel-system components.',
    engineeringExplanation:
      'Filtration architecture must balance particle-removal efficiency, contaminant-holding capacity, fuel flow and pressure drop so contamination is controlled without creating unacceptable restriction.',
    operatingConsequences: [
      'Abrasive wear',
      'Loss of component precision',
      'Reduced injection-system reliability',
      'Unplanned maintenance and downtime',
    ],
    relatedComponents: ['Primary fuel filter', 'Secondary fuel filter', 'High-pressure pump', 'Injectors'],
    relatedContaminants: ['Hard particles', 'Rust', 'Tank debris', 'Wear debris'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
    confidence: 'high',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Does not establish a micron rating, Beta ratio, efficiency, contaminant capacity or service interval for any ELIMFILTERS product.',
  },
  {
    canonicalId: 'FUEL-CKB-006',
    slug: 'high-pressure-fuel-system-sensitivity',
    title: 'High-Pressure Fuel-System Sensitivity',
    technicalDefinition:
      'Modern high-pressure diesel injection systems use precision components and small internal clearances that increase sensitivity to abrasive particles and water contamination.',
    engineeringExplanation:
      'As component clearances and metering requirements become more precise, contamination control upstream of the high-pressure pump and injectors becomes a critical asset-protection function.',
    operatingConsequences: [
      'Accelerated pump or injector wear',
      'Corrosion risk',
      'Injection-quality degradation',
      'Potential loss of fuel-system performance',
    ],
    relatedComponents: ['High-pressure pump', 'Common rail', 'Injectors', 'Metering valves'],
    relatedContaminants: ['Fine particles', 'Water'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
    confidence: 'high',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Specific injection pressures, clearance dimensions and failure-time claims require independent authoritative validation before publication.',
  },
  {
    canonicalId: 'FUEL-CKB-007',
    slug: 'filtration-efficiency-capacity-pressure-drop',
    title: 'Filtration Efficiency, Capacity and Pressure Drop',
    technicalDefinition:
      'Fuel-filter performance is governed by interacting requirements that include contaminant-removal efficiency, dirt-holding capacity, fuel flow and pressure drop across the element.',
    engineeringExplanation:
      'A filtration design cannot be evaluated by efficiency alone. Media selection and element construction must maintain the required protection while preserving acceptable flow and restriction throughout the intended service condition.',
    operatingConsequences: [
      'Premature restriction if capacity is insufficient',
      'Reduced protection if efficiency is inadequate',
      'Service-interval variability with contamination load and duty cycle',
    ],
    relatedComponents: ['Fuel-filter element', 'Fuel-filter housing', 'Fuel pump'],
    relatedContaminants: ['Particulate contamination', 'Fuel degradation products'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
    confidence: 'high',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'No universal efficiency, pressure-drop, capacity or service-life claim is assigned to a technology family.',
  },
  {
    canonicalId: 'FUEL-CKB-008',
    slug: 'filter-media-architecture-evolution',
    title: 'Evolution of Fuel-Filter Media Architectures',
    technicalDefinition:
      'Filtration media architectures have evolved beyond single-layer cellulose constructions to include synthetic, blended and multilayer configurations selected for specific filtration and separation requirements.',
    engineeringExplanation:
      'Different fiber structures and layer arrangements can be used to manage efficiency, capacity, structural integrity, fluid compatibility and pressure-drop requirements. The appropriate construction is product- and application-specific.',
    operatingConsequences: [
      'Broader engineering options for balancing efficiency and capacity',
      'Need for product-level validation rather than technology-wide assumptions',
      'Greater importance of media compatibility with fuel and operating conditions',
    ],
    relatedComponents: ['Fuel-filter media', 'Fuel-filter element', 'Separator element'],
    relatedContaminants: ['Fine particles', 'Water where the approved architecture provides separation'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
    confidence: 'high',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Does not assert that any ELIMFILTERS technology uses nanofibers, melt-blown layers, four-layer construction or another specific media architecture unless supported by ELIMFILTERS-controlled evidence.',
  },
];

/**
 * Only blocks independently validated and explicitly approved may feed public
 * Knowledge Center pages. At initial ingestion this list is intentionally empty.
 */
export const PUBLIC_FUEL_CANONICAL_BLOCKS = FUEL_CANONICAL_BLOCKS.filter(
  (block) =>
    block.validationStatus === 'validated' &&
    block.publicationStatus === 'approved-for-publication',
);

export function getFuelCanonicalBlock(canonicalId: string) {
  return FUEL_CANONICAL_BLOCKS.find((block) => block.canonicalId === canonicalId);
}
