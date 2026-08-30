// citation-jsonld.ts
// Build-time utility sourcing entity data from CITATION_INDEX.json.
// Uses Node.js `fs` — only import this file from Server Components,
// generateStaticParams(), or generateMetadata(). Do NOT import in
// 'use client' components; instead inline the JSON-LD constant at
// module level (runs during static-export build, not in browser).

import fs from 'fs';
import path from 'path';

export interface CitationEntity {
  key: string;
  name: string;
  type: string;
  canonical?: { definition?: string };
  citation?: { source_url?: string; version?: string };
}

export interface CitationIndex {
  entities: Record<string, CitationEntity>;
}

function loadCitationIndex(): CitationIndex | null {
  try {
    const indexPath = path.join(
      process.cwd(),
      '..',
      'elimfilters-vault',
      '00-meta',
      'CITATION_INDEX.json'
    );
    return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch {
    return null;
  }
}

const citationIndex = loadCitationIndex();

export function getEntity(key: string): CitationEntity | null {
  return citationIndex?.entities?.[key] ?? null;
}

export function getEntitiesByType(type: string): CitationEntity[] {
  if (!citationIndex) return [];
  return Object.values(citationIndex.entities).filter((e) => e.type === type);
}

/** DefinedTerm schema.org object for a single entity key */
export function definedTerm(key: string): object | null {
  const e = getEntity(key);
  if (!e) return null;
  return {
    '@type': 'DefinedTerm',
    name: e.name,
    description: e.canonical?.definition ?? e.name,
    identifier: e.key,
    ...(e.citation?.source_url
      ? { url: `https://${e.citation.source_url}` }
      : {}),
    inDefinedTermSet: 'https://elimfilters.com/knowledge-system',
  };
}

/** DefinedTermSet for a list of entity keys */
export function definedTermSet(
  keys: string[],
  setName: string,
  setUrl: string
): object {
  const terms = keys.map(definedTerm).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: setName,
    url: `https://elimfilters.com${setUrl}`,
    hasDefinedTerm: terms,
  };
}

/** TechArticle for a domain page */
export function techArticle(opts: {
  headline: string;
  description: string;
  url: string;
  keywords: string[];
  entityKeys: string[];
  dateModified?: string;
}): object {
  const entities = opts.entityKeys
    .map((k) => getEntity(k))
    .filter(Boolean) as CitationEntity[];
  const standards = entities
    .filter((e) => e.type === 'standard')
    .map((e) => ({ '@type': 'Thing', name: e.name }));
  const technologies = entities
    .filter((e) => e.type === 'technology')
    .map((e) => ({ '@type': 'Thing', name: e.name }));
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: opts.headline,
    description: opts.description,
    url: `https://elimfilters.com${opts.url}`,
    author: { '@type': 'Organization', name: 'ELIMFILTERS' },
    publisher: {
      '@type': 'Organization',
      name: 'ELIMFILTERS',
      url: 'https://elimfilters.com',
    },
    dateModified: opts.dateModified ?? '2026-06-03',
    keywords: opts.keywords.join(', '),
    about: standards,
    mentions: technologies,
    inLanguage: 'en',
  };
}

/** DataCatalog for the Knowledge System hub */
export function dataCatalog(): object | null {
  if (!citationIndex) return null;
  const entities = Object.values(citationIndex.entities);
  return {
    '@context': 'https://schema.org',
    '@type': 'DataCatalog',
    name: 'ELIMFILTERS Knowledge Vault',
    description:
      'Machine-readable industrial filtration knowledge graph covering contamination modes, technologies, standards, and product families.',
    url: 'https://elimfilters.com/knowledge-system',
    publisher: {
      '@type': 'Organization',
      name: 'ELIMFILTERS',
      url: 'https://elimfilters.com',
    },
    dataset: entities.map((e) => ({
      '@type': 'Dataset',
      name: e.name,
      description: e.canonical?.definition ?? e.name,
      ...(e.citation?.source_url
        ? { url: `https://${e.citation.source_url}` }
        : {}),
      version: e.citation?.version ?? '1.0',
    })),
  };
}
