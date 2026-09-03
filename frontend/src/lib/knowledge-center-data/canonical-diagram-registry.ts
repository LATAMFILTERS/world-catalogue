import type { KCDiagram } from './types';
import { ENGINEERING_DIAGRAMS as LEGACY_ENGINEERING_DIAGRAMS } from './diagram-registry';

const SYSTEM_SLUG_MAP: Record<string, string> = {
  'fuel-cleanliness': 'fuel-cleanliness-protection',
  'cabin-air-protection': 'air-intake-protection',
  'compressed-air-protection': 'air-intake-protection',
};

function canonicalSystems(systems: string[]): string[] {
  return [...new Set(systems.map((system) => SYSTEM_SLUG_MAP[system] ?? system))];
}

function canonicalDiagram(diagram: KCDiagram): KCDiagram {
  const normalized: KCDiagram = {
    ...diagram,
    applicableSystems: canonicalSystems(diagram.applicableSystems),
  };

  if (diagram.slug === 'cabin-air-system') {
    return {
      ...normalized,
      governingStandards: normalized.governingStandards.filter((id) => id !== 'STD-DIN-71220'),
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
