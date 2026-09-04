import type { KCDiagram } from './types';
import { ENGINEERING_DIAGRAMS as LEGACY_ENGINEERING_DIAGRAMS } from './diagram-registry';

const SYSTEM_SLUG_MAP: Record<string, string> = {
  'fuel-cleanliness': 'fuel-cleanliness-protection',
  'cabin-air-protection': 'air-intake-protection',
  'compressed-air-protection': 'air-intake-protection',
};

const STANDARD_ID_MAP: Record<string, string> = {
  'STD-ISO-11155': 'STD-ISO-11155-1',
};

function canonicalSystems(systems: string[]): string[] {
  return [...new Set(systems.map((system) => SYSTEM_SLUG_MAP[system] ?? system))];
}

function canonicalStandards(standards: string[]): string[] {
  return [...new Set(standards.map((standard) => STANDARD_ID_MAP[standard] ?? standard))];
}

function canonicalDiagram(diagram: KCDiagram): KCDiagram {
  const normalized: KCDiagram = {
    ...diagram,
    applicableSystems: canonicalSystems(diagram.applicableSystems),
    governingStandards: canonicalStandards(diagram.governingStandards),
  };

  if (diagram.slug === 'cabin-air-system') {
    return {
      ...normalized,
      governingStandards: normalized.governingStandards.filter((id) => id !== 'STD-DIN-71220'),
    };
  }

  if (diagram.slug === 'air-intake-filtration-flow') {
    return {
      ...normalized,
      engineeringPurpose: 'Illustrates the staged protection strategy used in applicable engine-air intake systems. Pre-cleaning, primary filtration, safety-element protection, sealing and restriction monitoring must be evaluated as one installed airflow boundary. Any efficiency, dust-capacity, restriction or service-life claim remains product- and configuration-specific under the applicable validation method.',
      accessibility: {
        ...normalized.accessibility,
        desc: 'Left-to-right engine-air flow showing ambient contamination, an applicable pre-cleaning stage, the primary filter element, safety element, restriction monitoring and the protected engine intake. The diagram is illustrative; quantitative efficiency, capacity and service-life values belong to the validated product and housing configuration.',
      },
    };
  }

  if (diagram.slug === 'lube-oil-circuit') {
    return {
      ...normalized,
      engineeringPurpose: 'Documents a representative full-flow engine lubrication circuit with pump, filter, bypass protection and oil distribution to lubricated components. Bypass settings, flow behavior and service limits are engine- and filter-specific and must be taken from the approved application rather than inferred from the diagram.',
      accessibility: {
        ...normalized.accessibility,
        desc: 'Representative lube-oil circuit showing sump, pump, full-flow filter, bypass path, main oil gallery and bearing distribution. Bypass opening pressure and other numeric settings are intentionally not universalized because they depend on the approved engine and filter configuration.',
      },
    };
  }

  if (diagram.slug === 'fuel-filtration-3stage') {
    return {
      ...normalized,
      metaDescription: 'Illustrative staged diesel-fuel filtration architecture showing coarse protection, fuel/water management, final particulate filtration and delivery to a high-pressure injection system. Stage ratings and pressures are application-specific.',
      engineeringPurpose: 'Illustrates how diesel-fuel protection can be staged ahead of precision injection components. The exact number of stages, particle ratings, water-separation architecture, flow and pressure conditions depend on the approved fuel system. SYNTAPORE™ governs particulate filtration, HYDROCORE™ governs approved standard non-turbine fuel/water separators, and applicable FH/FG turbine-style systems are governed separately by TURBOCORE™.',
      accessibility: {
        ...normalized.accessibility,
        desc: 'Illustrative staged diesel-fuel path from tank through coarse protection, fuel/water management and final particulate filtration to the injection system. Exact micron ratings, stage count, pressure and separator architecture are application-specific and are not universalized by this diagram.',
      },
    };
  }

  if (diagram.slug === 'compressed-air-treatment') {
    return {
      ...normalized,
      applicableSystems: ['air-intake-protection'],
      metaDescription: 'Illustrative compressed-air treatment train covering moisture, particulate and oil-control stages within the ISO 8573 purity-class framework. Required purity class and dew point are application-specific.',
      engineeringPurpose: 'Illustrates a representative compressed-air treatment sequence and the distinct control of particles, water and oil. ISO 8573 provides the classification and test framework, but the required purity class, dryer performance and treatment stages must come from the protected pneumatic application. DRYCORE™ remains an Air Intake & Airflow Protection function rather than a standalone sixth protection system.',
      accessibility: {
        ...normalized.accessibility,
        desc: 'Representative compressed-air treatment train showing compressor output, moisture separation or drying and downstream filtration stages. Required ISO 8573 purity class, dew point and treatment sequence depend on the protected application and are not fixed universally.',
      },
    };
  }

  if (diagram.slug === 'particle-wear-mechanism') {
    return {
      ...normalized,
      engineeringPurpose: 'Provides a mechanistic view of abrasive, three-body and adhesive wear in lubricated and hydraulic interfaces. The particle size that becomes critical depends on component clearance, hardness, concentration, load and lubrication regime; no universal micron threshold or filtration efficiency follows from the diagram alone.',
      accessibility: {
        ...normalized.accessibility,
        desc: 'Three-panel illustration of two-body abrasion, three-body abrasion and adhesive wear. Particle-to-clearance relationships are shown conceptually; exact critical sizes and cleanliness targets must be established from the protected component and application.',
      },
    };
  }

  return normalized;
}

export const ENGINEERING_DIAGRAMS: KCDiagram[] = LEGACY_ENGINEERING_DIAGRAMS.map(canonicalDiagram);

export function getDiagramBySlug(slug: string): KCDiagram | undefined {
  return ENGINEERING_DIAGRAMS.find((diagram) => diagram.slug === slug);
}

export function getDiagramsForArticle(articleSlug: string): KCDiagram[] {
  return ENGINEERING_DIAGRAMS.filter((diagram) => diagram.relatedArticles.includes(articleSlug));
}

export function getDiagramsForStandard(stdEntityId: string): KCDiagram[] {
  return ENGINEERING_DIAGRAMS.filter((diagram) => diagram.governingStandards.includes(stdEntityId));
}
