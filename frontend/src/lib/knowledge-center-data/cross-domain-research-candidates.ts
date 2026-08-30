/**
 * Cross-domain research candidates extracted from the current NotebookLM package.
 * These records are deliberately quarantined from Fuel Cleanliness publication.
 * They exist so Hermes routes mixed-source material to the correct engineering domain.
 */

export interface KCCrossDomainResearchCandidate {
  canonicalId: string;
  domain: 'air-intake' | 'lubrication';
  title: string;
  technicalDefinition: string;
  relatedTechnologies: string[];
  validationStatus: 'pending-secondary-validation';
  publicationStatus: 'internal-only';
  claimBoundary: string;
}

export const CROSS_DOMAIN_RESEARCH_CANDIDATES: KCCrossDomainResearchCandidate[] = [
  {
    canonicalId: 'AIR-CKB-001',
    domain: 'air-intake',
    title: 'Air Filtration Efficiency and Restriction',
    technicalDefinition:
      'Air-intake filtration must balance particle-removal performance, contaminant capacity and acceptable restriction across the required airflow and service condition.',
    relatedTechnologies: ['MACROCORE™', 'INTEKCORE™'],
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Does not attribute nanofiber coatings, specific scrubbing mechanisms, fuel-economy gains or competitor media construction to MACROCORE™ without ELIMFILTERS-controlled evidence.',
  },
  {
    canonicalId: 'AIR-CKB-002',
    domain: 'air-intake',
    title: 'Inertial Pre-Separation and Housing Geometry',
    technicalDefinition:
      'Housing geometry can be engineered to influence airflow distribution and, in approved designs, use inertial effects to reduce the contaminant load reaching the primary filter medium.',
    relatedTechnologies: ['INTEKCORE™', 'MACROCORE™'],
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'No conical, centrifugal, helicoidal or competitor-derived geometry may be assigned to an ELIMFILTERS housing unless documented for that product architecture.',
  },
  {
    canonicalId: 'LUBE-CKB-001',
    domain: 'lubrication',
    title: 'Soot Loading in Diesel Lubrication Systems',
    technicalDefinition:
      'Soot and other combustion-derived contaminants can enter engine oil and contribute to lubricant loading, deposit formation and wear risk depending on engine condition, lubricant formulation and duty cycle.',
    relatedTechnologies: ['SYNTRAX™'],
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Does not state that a specific emissions strategy universally causes a defined soot increase or that SYNTRAX™ has a specific soot-removal performance without validated product evidence.',
  },
  {
    canonicalId: 'LUBE-CKB-002',
    domain: 'lubrication',
    title: 'Bypass Filtration and Depth-Media Principles',
    technicalDefinition:
      'Bypass filtration routes a controlled fraction of lubricant flow through a secondary filtration path that may use depth-media principles to target fine contaminants while preserving the main lubrication circuit.',
    relatedTechnologies: ['SYNTRAX™'],
    validationStatus: 'pending-secondary-validation',
    publicationStatus: 'internal-only',
    claimBoundary:
      'Wound-media construction, wood/synthetic fiber blends, lacquer/asphaltene removal and extended drain intervals remain manufacturer-specific or product-specific claims until independently validated for ELIMFILTERS.',
  },
];
