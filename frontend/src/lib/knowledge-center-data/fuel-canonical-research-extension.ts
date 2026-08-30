/**
 * ELIMFILTERS Knowledge Center — Fuel Cleanliness Research Extension
 *
 * Source basis: consolidated NotebookLM research package supplied 2026-08-30.
 * This file intentionally stores only normalized, generic engineering concepts.
 * It does NOT publish or attribute competitor-specific construction/performance
 * claims to ELIMFILTERS technologies.
 *
 * Publication rule: every block below is INTERNAL ONLY and requires independent
 * secondary validation before it can be promoted into public canonical content.
 */

import type { KCFuelCanonicalBlock } from './fuel-canonical-blocks';

export const FUEL_CANONICAL_RESEARCH_EXTENSION: KCFuelCanonicalBlock[] = [
  {
    canonicalId: 'FUEL-CKB-009',
    slug: 'regulatory-drivers-modern-diesel-fuel',
    title: 'Regulatory Drivers of Modern Diesel Fuel Chemistry',
    technicalDefinition:
      'Modern diesel-fuel chemistry has been influenced by emissions regulations that required lower sulfur content and compatibility with increasingly sensitive engine and aftertreatment systems.',
    engineeringExplanation:
      'Changes in fuel formulation can alter properties relevant to lubricity, additive behavior, water separation and filtration. Regulatory history is therefore an engineering context for fuel-cleanliness design, not a product-performance claim.',
    operatingConsequences: [
      'Need to account for current fuel formulation in filtration design',
      'Potential change in water-separation behavior',
      'Potential change in media/fuel interaction',
    ],
    relatedComponents: ['Fuel tank', 'Primary fuel filter', 'Secondary fuel filter', 'Fuel/water separator'],
    relatedContaminants: ['Water', 'Particulate contamination', 'Fuel degradation products'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
    confidence: 'medium',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Exact regulatory percentages, sulfur values, implementation dates and emissions reductions remain blocked until verified against authoritative regulatory sources.',
  },
  {
    canonicalId: 'FUEL-CKB-010',
    slug: 'hydrotreating-lubricity-additive-effects',
    title: 'Hydrotreating, Lubricity and Additive Effects',
    technicalDefinition:
      'Refining processes used to reduce sulfur can also remove naturally occurring polar compounds that contribute to diesel-fuel lubricity, making additive treatment relevant to finished-fuel performance.',
    engineeringExplanation:
      'Fuel-cleanliness analysis should distinguish the refining process, finished-fuel lubricity specification and the effect of additive packages. A change in one property does not by itself establish the behavior of every commercial fuel formulation.',
    operatingConsequences: [
      'Greater importance of finished-fuel specification',
      'Potential interaction between additive packages and water behavior',
      'Need to validate separator performance using representative fuel conditions',
    ],
    relatedComponents: ['Fuel system', 'High-pressure pump', 'Injectors', 'Fuel/water separator'],
    relatedContaminants: ['Water', 'Fuel degradation products'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['HYDROCORE™', 'TURBOCORE™', 'SYNTAPORE™'],
    confidence: 'medium',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Does not state that all lubricity additives are surfactants or that every additive package produces the same water-separation effect.',
  },
  {
    canonicalId: 'FUEL-CKB-011',
    slug: 'biodiesel-additives-water-separation-behavior',
    title: 'Biodiesel, Additives and Water-Separation Behavior',
    technicalDefinition:
      'Renewable-content blending and additive chemistry can influence interfacial behavior, water-droplet stability and the difficulty of separating water from diesel fuel.',
    engineeringExplanation:
      'Water-separation performance should be evaluated using representative fuel chemistry because droplet size, interfacial tension, temperature, agitation and additive content can affect the separation mechanism.',
    operatingConsequences: [
      'Potential persistence of smaller dispersed water droplets',
      'Reduced reliability of gravity-only separation under some conditions',
      'Greater need for application-specific validation',
    ],
    relatedComponents: ['Fuel/water separator', 'Separator element', 'Drain bowl', 'Fuel tank'],
    relatedContaminants: ['Free water', 'Dispersed water', 'Emulsified water'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['HYDROCORE™', 'TURBOCORE™'],
    confidence: 'medium',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Does not claim universal behavior for biodiesel blends, surfactants or additive packages; public claims require validated fuel-specific evidence.',
  },
  {
    canonicalId: 'FUEL-CKB-012',
    slug: 'specific-surface-area-filtration-media',
    title: 'Specific Surface Area as a Filtration Engineering Parameter',
    technicalDefinition:
      'The available surface area within a filtration or separation medium is one engineering parameter that can influence contaminant interaction, capture opportunities and water-droplet coalescence.',
    engineeringExplanation:
      'Surface area must be considered together with fiber diameter, porosity, pore-size distribution, thickness, wettability, chemistry, fluid velocity, viscosity and element geometry. Surface area alone is not a universal predictor of filtration or separation performance.',
    operatingConsequences: [
      'Potential influence on contaminant interaction and capacity',
      'Potential influence on water-droplet contact and coalescence',
      'Need to balance media structure with flow and pressure-drop requirements',
    ],
    relatedComponents: ['Filter media', 'Separator media', 'Fuel-filter element'],
    relatedContaminants: ['Fine particles', 'Dispersed water'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
    confidence: 'medium',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Numerical surface-area values, nanofiber construction, proprietary coatings and competitor-specific media structures are evidence-only unless supported by ELIMFILTERS-controlled documentation.',
  },
  {
    canonicalId: 'FUEL-CKB-013',
    slug: 'media-housing-system-integration',
    title: 'Media–Housing Integration in Fuel Separation Systems',
    technicalDefinition:
      'Fuel-filtration and water-separation performance depends on the interaction between the media, element construction, sealing, housing geometry, flow path, drainage and installation conditions.',
    engineeringExplanation:
      'A capable medium can underperform if bypass leakage, poor sealing, unfavorable flow distribution, inadequate drainage or incorrect housing integration prevents the intended separation process from being maintained through the system.',
    operatingConsequences: [
      'Bypass or carryover risk if sealing is compromised',
      'Reduced water collection if drainage is inadequate',
      'Performance variation caused by flow distribution and installation condition',
    ],
    relatedComponents: ['Filter element', 'Fuel/water separator housing', 'Seals', 'Drain bowl', 'Drain valve'],
    relatedContaminants: ['Particulate contamination', 'Free water', 'Dispersed water'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['HYDROCORE™', 'TURBOCORE™', 'SYNTAPORE™'],
    confidence: 'high',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Does not attribute any competitor housing geometry, patented mechanism or proprietary flow path to an ELIMFILTERS technology.',
  },
  {
    canonicalId: 'FUEL-CKB-014',
    slug: 'test-method-relevance-modern-fuel-chemistry',
    title: 'Test-Method Relevance to Modern Fuel Chemistry',
    technicalDefinition:
      'Filtration and fuel/water-separation test methods must be interpreted in the context of the fuel, contaminant distribution, flow condition and test procedure used to generate the result.',
    engineeringExplanation:
      'A test value is meaningful only within its defined method and conditions. When real-world fuel chemistry changes, engineering review must determine whether the test method remains representative of the intended application.',
    operatingConsequences: [
      'Risk of overgeneralizing laboratory results',
      'Need to track standard revision and test-fluid conditions',
      'Need for product-level validation under applicable methods',
    ],
    relatedComponents: ['Fuel-filter element', 'Fuel/water separator element'],
    relatedContaminants: ['Particulate contamination', 'Water'],
    relatedApplications: ['Truck fleets', 'Construction', 'Agriculture', 'Power generation', 'Marine'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
    confidence: 'high',
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'No claim about a standard being obsolete, a manufacturer leading standards development, or a specific test method is publishable without authoritative standards provenance.',
  },
];

export const PUBLIC_FUEL_CANONICAL_RESEARCH_EXTENSION = FUEL_CANONICAL_RESEARCH_EXTENSION.filter(
  (block) =>
    block.validationStatus === 'validated' &&
    block.publicationStatus === 'approved-for-publication',
);
