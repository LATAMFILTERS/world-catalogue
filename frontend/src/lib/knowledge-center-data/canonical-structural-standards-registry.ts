import type { KCStandard } from './types';
import { KC_STANDARDS as BASE_STANDARDS } from './canonical-standards-registry';

function canonicalizeIso3723(standard: KCStandard): KCStandard {
  return {
    ...standard,
    year: '2015 (2nd edition; confirmed 2026)',
    revisionStatus: 'active',
    metaDescription: 'ISO 3723:2015 specifies the method for verifying the end-load rating of a hydraulic fluid-power filter element and its ability to withstand designated axial loading imposed by installation and use.',
    scope: 'Verification of hydraulic filter-element end-load rating and resistance to designated axial loading from installation and use.',
    engineeringPurpose: 'Provides a controlled end-load test for hydraulic filter elements. ISO 3723 addresses axial loading; it does not define collapse/burst pressure rating, fluid-cleanliness targets, Beta-ratio performance or universal safety factors.',
    sections: [
      {
        heading: 'What ISO 3723 Defines',
        body: 'ISO 3723:2015 defines a method for verifying the end-load rating of a hydraulic fluid-power filter element and the ability of the element to withstand the designated axial load imposed by installation and use.',
      },
      {
        heading: 'What ISO 3723 Does Not Define',
        body: 'ISO 3723 is not the collapse/burst pressure test for hydraulic filter elements. Collapse/burst pressure rating is covered separately by ISO 2941. ISO 3723 also does not establish ISO 4406 cleanliness targets, filtration efficiency or a universal multiplier between operating differential pressure and structural rating.',
      },
      {
        heading: 'Application Boundary',
        body: 'Use ISO 3723 when axial loading and end-load integrity are relevant to element installation, retention and service. Product qualification still requires the other standards applicable to filtration performance, pressure integrity, material compatibility and the specific hydraulic application.',
      },
    ],
    keyParams: [
      { label: 'Test purpose', value: 'End-load / axial-load verification' },
      { label: 'Applies to', value: 'Hydraulic fluid-power filter elements' },
      { label: 'Collapse/burst standard', value: 'ISO 2941:2009' },
      { label: 'Use boundary', value: 'Does not define cleanliness targets or universal safety factors' },
    ],
    commonMistakes: [
      'Treating ISO 3723 as a collapse/burst pressure test. That function belongs to ISO 2941.',
      'Publishing a universal collapse-pressure or bypass-pressure multiplier as though ISO 3723 requires it.',
      'Using ISO 3723 as evidence of filtration efficiency or fluid-cleanliness performance.',
    ],
    faqs: [
      { question: 'What does ISO 3723:2015 verify?', answer: 'It verifies the end-load rating of a hydraulic filter element and its ability to withstand designated axial loading imposed by installation and use.' },
      { question: 'Does ISO 3723 define collapse or burst pressure?', answer: 'No. ISO 2941:2009 is the separate standard for verification of hydraulic filter-element collapse/burst pressure rating.' },
      { question: 'Does ISO 3723 set a hydraulic cleanliness target?', answer: 'No. End-load integrity and fluid cleanliness are separate engineering functions governed by different requirements.' },
    ],
  };
}

const ISO_2941: KCStandard = {
  slug: 'iso-2941',
  code: 'ISO 2941',
  entityId: 'STD-ISO-2941',
  title: 'Hydraulic Fluid Power — Filter Elements — Verification of Collapse/Burst Pressure Rating',
  issuingOrganization: 'ISO (International Organization for Standardization)',
  year: '2009 (2nd edition; confirmed 2025)',
  revisionStatus: 'active',
  metaDescription: 'ISO 2941:2009 specifies the method for verifying the collapse/burst pressure rating of hydraulic fluid-power filter elements under designated differential-pressure conditions.',
  scope: 'Verification of hydraulic filter-element capability to withstand a designated differential pressure in the intended direction of flow.',
  engineeringPurpose: 'Provides the canonical structural-pressure test for hydraulic filter elements. The method verifies whether an element withstands the designated differential-pressure condition until collapse/burst occurs or the maximum expected differential pressure is reached without failure.',
  sections: [
    {
      heading: 'What ISO 2941 Defines',
      body: 'ISO 2941:2009 specifies a method for verifying the collapse/burst pressure rating of a hydraulic fluid-power filter element. The test challenges the element in the intended direction of flow by increasing differential pressure until collapse/burst occurs or the maximum expected differential pressure is reached without element failure.',
    },
    {
      heading: 'Relationship to ISO 3723',
      body: 'ISO 2941 and ISO 3723 address different structural loads. ISO 2941 covers differential-pressure collapse/burst resistance; ISO 3723 covers end-load and designated axial loading. Passing one test does not replace qualification under the other when both are applicable.',
    },
    {
      heading: 'Application Boundary',
      body: 'The standard verifies structural pressure resistance under its test method. It does not prescribe a universal collapse-pressure safety factor, a hydraulic cleanliness target, a Beta ratio or an application-specific replacement interval. Those requirements must come from the filter design, equipment specification and validated operating conditions.',
    },
  ],
  keyParams: [
    { label: 'Method', value: 'Collapse/burst pressure-rating verification' },
    { label: 'Load type', value: 'Differential pressure in intended flow direction' },
    { label: 'Separate axial-load test', value: 'ISO 3723:2015' },
    { label: 'Current status', value: 'Published; confirmed 2025' },
  ],
  applicableSystems: ['hydraulic-protection'],
  relatedGlossaryTerms: ['TERM-COLLAPSE-PRESSURE', 'TERM-ELEMENT-COLLAPSE', 'TERM-DIFFERENTIAL-PRESSURE'],
  relatedTopics: ['filter-element-integrity', 'testing-and-validation'],
  relatedTechnologies: ['NANOFORCE™'],
  relatedArticles: ['filter-element-integrity', 'testing-and-validation'],
  commonMistakes: [
    'Assigning end-load or axial-load verification to ISO 2941. That role belongs to ISO 3723.',
    'Treating one manufacturer-specific collapse-pressure margin as a universal requirement of ISO 2941.',
    'Using ISO 2941 as a substitute for ISO 16889 filtration-performance testing or ISO 4406 fluid-cleanliness coding.',
  ],
  faqs: [
    { question: 'What does ISO 2941:2009 verify?', answer: 'It verifies the collapse/burst pressure rating of a hydraulic filter element by challenging the element with differential pressure in the intended direction of flow.' },
    { question: 'Is ISO 2941 the same as ISO 3723?', answer: 'No. ISO 2941 addresses collapse/burst pressure resistance; ISO 3723 addresses end-load and axial-load resistance.' },
    { question: 'Does ISO 2941 require a universal 10× collapse-pressure margin?', answer: 'No universal multiplier should be attributed to ISO 2941 without evidence from the applicable specification or product requirement. The standard verifies the designated collapse/burst pressure rating under its test method.' },
  ],
  engineeringReferences: [
    {
      category: 'standard',
      citation: 'ISO 2941:2009 — Hydraulic fluid power — Filter elements — Verification of collapse/burst pressure rating',
      relevance: 'Current ISO method for verifying the collapse/burst pressure rating of hydraulic fluid-power filter elements; confirmed by ISO in 2025.',
    },
    {
      category: 'standard',
      citation: 'ISO 3723:2015 — Hydraulic fluid power — Filter elements — Method for end load test',
      relevance: 'Separate structural test for end-load and axial-load resistance; prevents conflation of axial and differential-pressure qualification.',
    },
  ],
};

const corrected = BASE_STANDARDS.map((standard) =>
  standard.slug === 'iso-3723' ? canonicalizeIso3723(standard) : standard,
);

export const KC_STANDARDS: KCStandard[] = corrected.some((standard) => standard.slug === ISO_2941.slug)
  ? corrected
  : [...corrected, ISO_2941];
