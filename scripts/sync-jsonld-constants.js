'use strict';

/**
 * sync-jsonld-constants.js
 * Phase 4D — JSON-LD Constants Sync from CITATION_INDEX
 *
 * Reads elimfilters-vault/00-meta/CITATION_INDEX.json and writes
 * frontend/src/lib/jsonld-constants.generated.ts with named string constants
 * (pre-serialized JSON-LD) for all 11 Knowledge System pages.
 *
 * Runs as prebuild: node scripts/sync-jsonld-constants.js
 * Run from project root (or frontend/ — both resolve correctly).
 */

const fs = require('fs');
const path = require('path');

// ─── Resolve project root from this script's location ─────────────────────────
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CITATION_INDEX_PATH = path.join(PROJECT_ROOT, 'elimfilters-vault', '00-meta', 'CITATION_INDEX.json');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'frontend', 'src', 'lib', 'jsonld-constants.generated.ts');

// ─── Load CITATION_INDEX ───────────────────────────────────────────────────────
const citationIndex = JSON.parse(fs.readFileSync(CITATION_INDEX_PATH, 'utf8'));
const entities = citationIndex.entities;

// ─── Helper functions ──────────────────────────────────────────────────────────
function entity(key) {
  return entities[key] || null;
}

function entityName(key) {
  return entities[key]?.name || key;
}

function entityDefinition(key) {
  // Use canonical definition, strip newlines for single-line JSON string safety
  const def = entities[key]?.canonical?.definition || '';
  return def.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function entitySourceUrl(key) {
  const url = entities[key]?.citation?.source_url;
  if (!url) return 'https://elimfilters.com/knowledge-system';
  // source_url may or may not start with https://
  if (url.startsWith('http')) return url;
  return `https://${url}`;
}

function entityVersion(key) {
  return entities[key]?.citation?.version || '1.0';
}

function makeDefinedTerm(key, inDefinedTermSet) {
  const e = entity(key);
  if (!e) return null;
  return {
    '@type': 'DefinedTerm',
    name: entityName(key),
    identifier: key,
    description: entityDefinition(key),
    url: entitySourceUrl(key),
    inDefinedTermSet: inDefinedTermSet || 'https://elimfilters.com/knowledge-system',
  };
}

function makeDataset(key) {
  const e = entity(key);
  if (!e) return null;
  return {
    '@type': 'Dataset',
    name: entityName(key),
    description: entityDefinition(key),
    url: entitySourceUrl(key),
    version: entityVersion(key),
  };
}

// ─── Build constants ───────────────────────────────────────────────────────────

// 1. JSONLD_KNOWLEDGE_SYSTEM_HUB — DataCatalog with all entities
const hubData = {
  '@context': 'https://schema.org',
  '@type': 'DataCatalog',
  name: 'ELIMFILTERS Knowledge Vault',
  description: 'Machine-readable industrial filtration knowledge graph covering contamination modes, technologies, standards, and product families.',
  url: 'https://elimfilters.com/knowledge-system',
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  dataset: Object.keys(entities)
    .map(makeDataset)
    .filter(Boolean),
};

// 2. JSONLD_STANDARDS_INDEX — CollectionPage with all standard entities as DefinedTerms
const standardKeys = Object.keys(entities).filter(k => entities[k].type === 'standard');
const standardsIndexData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Industrial Filtration Standards — ELIMFILTERS Knowledge System',
  description: 'Index of international standards governing industrial filtration: ISO 16889, ISO 4406, ISO 5011, ISO 11155, ISO 12937, ASTM D6304, SAE J1539, DIN 71220, NFPA T2.14.',
  url: 'https://elimfilters.com/knowledge-system/standards',
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  hasPart: standardKeys
    .map(k => makeDefinedTerm(k, 'https://elimfilters.com/knowledge-system'))
    .filter(Boolean),
};

// 3. JSONLD_AIR_INTAKE_SYSTEMS — TechArticle + DefinedTermSet
const airIntakeKeys = ['ISO_5011', 'SAE_J1539', 'MACROCORE', 'SYNTEPORE', 'INTEKCORE'];
const airIntakeData = {
  '@context': 'https://schema.org',
  '@type': ['TechArticle', 'DefinedTermSet'],
  headline: 'Air Intake Filtration Systems — ISO 5011 and SAE J1539 Standards',
  description: 'Air intake filtration system standards — ISO 5011, SAE J1539 — defining efficiency measurement, flow restriction, and dust holding capacity for diesel engine air intake filters.',
  url: 'https://elimfilters.com/knowledge-system/standards/air-intake-systems',
  author: { '@type': 'Organization', name: 'ELIMFILTERS' },
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  dateModified: '2026-06-03',
  keywords: 'air intake filtration, ISO 5011, SAE J1539, MACROCORE, SYNTEPORE, INTEKCORE, engine air filter, diesel air intake',
  about: standardKeys.filter(k => ['ISO_5011', 'SAE_J1539'].includes(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  mentions: ['MACROCORE', 'SYNTEPORE', 'INTEKCORE'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  inLanguage: 'en',
  hasDefinedTerm: airIntakeKeys
    .map(k => makeDefinedTerm(k, 'https://elimfilters.com/knowledge-system'))
    .filter(Boolean),
};

// 4. JSONLD_LUBE_OIL_SYSTEMS — TechArticle + DefinedTermSet
const lubeOilKeys = ['ISO_16889', 'ISO_4406', 'SYNTRAX', 'NANOFORCE'];
const lubeOilData = {
  '@context': 'https://schema.org',
  '@type': ['TechArticle', 'DefinedTermSet'],
  headline: 'Lube Oil Filtration Systems — ISO 16889 and ISO 4406 Standards',
  description: 'Lube oil filtration system standards — ISO 16889 (Beta ratio), ISO 4406 (cleanliness codes) — defining particle contamination control in engine and hydraulic lube circuits.',
  url: 'https://elimfilters.com/knowledge-system/standards/lube-oil-systems',
  author: { '@type': 'Organization', name: 'ELIMFILTERS' },
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  dateModified: '2026-06-03',
  keywords: 'lube oil filtration, ISO 16889, ISO 4406, SYNTRAX, NANOFORCE, Beta ratio, cleanliness code, engine oil filter',
  about: ['ISO_16889', 'ISO_4406'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  mentions: ['SYNTRAX', 'NANOFORCE'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  inLanguage: 'en',
  hasDefinedTerm: lubeOilKeys
    .map(k => makeDefinedTerm(k, 'https://elimfilters.com/knowledge-system'))
    .filter(Boolean),
};

// 5. JSONLD_CABIN_SAFETY_SYSTEMS — TechArticle + DefinedTermSet
const cabinKeys = ['ISO_11155', 'DIN_71220', 'MICROKAPPA'];
const cabinData = {
  '@context': 'https://schema.org',
  '@type': ['TechArticle', 'DefinedTermSet'],
  headline: 'Cabin Safety Filtration Systems — ISO 11155 and DIN 71220 Standards',
  description: 'Cabin air filtration standards — ISO 11155 (particulate and gaseous), DIN 71220 — protecting equipment operators from PM10, PM2.5 and chemical exposure inside enclosed cabs.',
  url: 'https://elimfilters.com/knowledge-system/standards/cabin-safety-systems',
  author: { '@type': 'Organization', name: 'ELIMFILTERS' },
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  dateModified: '2026-06-03',
  keywords: 'cabin air filtration, ISO 11155, DIN 71220, MICROKAPPA, operator safety, PM10, cabin filter, respiratory protection',
  about: ['ISO_11155', 'DIN_71220'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  mentions: ['MICROKAPPA'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  inLanguage: 'en',
  hasDefinedTerm: cabinKeys
    .map(k => makeDefinedTerm(k, 'https://elimfilters.com/knowledge-system'))
    .filter(Boolean),
};

// 6. JSONLD_FUEL_SYSTEMS — TechArticle + DefinedTermSet
const fuelKeys = ['ASTM_D6304', 'ISO_12937', 'HYDROCORE'];
const fuelData = {
  '@context': 'https://schema.org',
  '@type': ['TechArticle', 'DefinedTermSet'],
  headline: 'Fuel Filtration Systems — ASTM D6304 and ISO 12937 Standards',
  description: 'Diesel fuel filtration standards — ASTM D6304, ISO 12937 — measuring water content in petroleum products and preventing injector damage from water contamination.',
  url: 'https://elimfilters.com/knowledge-system/standards/fuel-systems',
  author: { '@type': 'Organization', name: 'ELIMFILTERS' },
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  dateModified: '2026-06-03',
  keywords: 'fuel filtration, ASTM D6304, ISO 12937, HYDROCORE, diesel water contamination, Karl Fischer titration, fuel filter',
  about: ['ASTM_D6304', 'ISO_12937'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  mentions: ['HYDROCORE'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  inLanguage: 'en',
  hasDefinedTerm: fuelKeys
    .map(k => makeDefinedTerm(k, 'https://elimfilters.com/knowledge-system'))
    .filter(Boolean),
};

// 7. JSONLD_HYDRAULIC_SYSTEMS — TechArticle + DefinedTermSet
const hydraulicStdKeys = ['ISO_16889', 'ISO_4406', 'NFPA_T214', 'NANOFORCE', 'SYNTRAX'];
const hydraulicData = {
  '@context': 'https://schema.org',
  '@type': ['TechArticle', 'DefinedTermSet'],
  headline: 'Hydraulic Filtration Systems — ISO 16889, ISO 4406, and NFPA T2.14 Standards',
  description: 'Hydraulic system filtration standards — ISO 16889 (Beta ratio), ISO 4406 (cleanliness codes), NFPA T2.14 (collapse resistance) — for proportional valve and pump protection.',
  url: 'https://elimfilters.com/knowledge-system/standards/hydraulic-systems',
  author: { '@type': 'Organization', name: 'ELIMFILTERS' },
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  dateModified: '2026-06-03',
  keywords: 'hydraulic filtration, ISO 16889, ISO 4406, NFPA T2.14, NANOFORCE, SYNTRAX, proportional valve, hydraulic filter',
  about: ['ISO_16889', 'ISO_4406', 'NFPA_T214'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  mentions: ['NANOFORCE', 'SYNTRAX'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  inLanguage: 'en',
  hasDefinedTerm: hydraulicStdKeys
    .map(k => makeDefinedTerm(k, 'https://elimfilters.com/knowledge-system'))
    .filter(Boolean),
};

// 8. JSONLD_CONTAMINATION_INDEX — CollectionPage with all contamination-mode entities
const contaminationKeys = Object.keys(entities).filter(k => entities[k].type === 'contamination-mode');
const contaminationIndexData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Industrial Filtration Failure Analysis — ELIMFILTERS Knowledge System',
  description: 'Index of contamination failure modes: diesel water contamination, particle wear in engines, hydraulic system contamination, and cabin air contamination.',
  url: 'https://elimfilters.com/knowledge-system/contamination',
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  hasPart: contaminationKeys
    .map(k => makeDefinedTerm(k, 'https://elimfilters.com/knowledge-system'))
    .filter(Boolean),
};

// 9. JSONLD_PARTICLE_WEAR — TechArticle
const particleWearEntity = entity('PARTICLE_WEAR');
const particleWearData = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Particle Wear in Engines — Abrasive Contamination Failure Analysis',
  description: particleWearEntity ? entityDefinition('PARTICLE_WEAR') : 'Particle wear is the abrasive degradation of precision engine surfaces — piston rings, cylinder walls, crankshaft journals — caused by hard particle contamination in lube oil.',
  url: 'https://elimfilters.com/knowledge-system/contamination/particle-wear',
  author: { '@type': 'Organization', name: 'ELIMFILTERS' },
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  dateModified: '2026-06-03',
  keywords: 'particle wear, abrasive wear, engine contamination, ISO 16889, ISO 4406, MACROCORE, NANOFORCE, lube oil filtration, bearing wear',
  about: ['ISO_16889', 'ISO_4406'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  mentions: ['MACROCORE', 'NANOFORCE', 'SYNTRAX'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  inLanguage: 'en',
};

// 10. JSONLD_DIESEL_WATER — TechArticle
const dieselWaterEntity = entity('DIESEL_WATER');
const dieselWaterData = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Diesel Water Contamination — Fuel System Failure Analysis',
  description: dieselWaterEntity ? entityDefinition('DIESEL_WATER') : 'Diesel water contamination is the presence of dissolved, free, or emulsified water in diesel fuel systems causing injector damage, microbial growth, and corrosion.',
  url: 'https://elimfilters.com/knowledge-system/contamination/diesel-water',
  author: { '@type': 'Organization', name: 'ELIMFILTERS' },
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  dateModified: '2026-06-03',
  keywords: 'diesel water contamination, fuel contamination, ASTM D6304, ISO 12937, HYDROCORE, Karl Fischer titration, injector damage, fuel filter',
  about: ['ASTM_D6304', 'ISO_12937'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  mentions: ['HYDROCORE'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  inLanguage: 'en',
};

// 11. JSONLD_HYDRAULIC_CONTAMINATION — TechArticle
const hydraulicContamEntity = entity('HYDRAULIC_CONTAMINATION');
const hydraulicContaminationData = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Hydraulic System Contamination — Particle and Water Failure Analysis',
  description: hydraulicContamEntity ? entityDefinition('HYDRAULIC_CONTAMINATION') : 'Hydraulic system contamination is the presence of particles, water, and fluid degradation products in hydraulic fluid threatening proportional valve and pump reliability.',
  url: 'https://elimfilters.com/knowledge-system/contamination/hydraulic-system',
  author: { '@type': 'Organization', name: 'ELIMFILTERS' },
  publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  dateModified: '2026-06-03',
  keywords: 'hydraulic contamination, ISO 16889, ISO 4406, NFPA T2.14, NANOFORCE, SYNTRAX, proportional valve, hydraulic pump, fluid cleanliness',
  about: ['ISO_16889', 'NFPA_T214', 'ISO_4406'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  mentions: ['NANOFORCE', 'SYNTRAX'].filter(k => entity(k)).map(k => ({
    '@type': 'Thing',
    name: entityName(k),
  })),
  inLanguage: 'en',
};

// ─── Serialize all constants ───────────────────────────────────────────────────

const constants = [
  { name: 'JSONLD_KNOWLEDGE_SYSTEM_HUB',    data: hubData,                   desc: `DataCatalog, ${Object.keys(entities).length} entities` },
  { name: 'JSONLD_STANDARDS_INDEX',          data: standardsIndexData,        desc: `CollectionPage, ${standardKeys.length} standards` },
  { name: 'JSONLD_AIR_INTAKE_SYSTEMS',       data: airIntakeData,             desc: `TechArticle + DefinedTermSet, ${airIntakeKeys.length} entities` },
  { name: 'JSONLD_LUBE_OIL_SYSTEMS',         data: lubeOilData,               desc: `TechArticle + DefinedTermSet, ${lubeOilKeys.length} entities` },
  { name: 'JSONLD_CABIN_SAFETY_SYSTEMS',     data: cabinData,                 desc: `TechArticle + DefinedTermSet, ${cabinKeys.length} entities` },
  { name: 'JSONLD_FUEL_SYSTEMS',             data: fuelData,                  desc: `TechArticle + DefinedTermSet, ${fuelKeys.length} entities` },
  { name: 'JSONLD_HYDRAULIC_SYSTEMS',        data: hydraulicData,             desc: `TechArticle + DefinedTermSet, ${hydraulicStdKeys.length} entities` },
  { name: 'JSONLD_CONTAMINATION_INDEX',      data: contaminationIndexData,    desc: `CollectionPage, ${contaminationKeys.length} contamination modes` },
  { name: 'JSONLD_PARTICLE_WEAR',            data: particleWearData,          desc: 'TechArticle, particle wear failure analysis' },
  { name: 'JSONLD_DIESEL_WATER',             data: dieselWaterData,           desc: 'TechArticle, diesel water contamination' },
  { name: 'JSONLD_HYDRAULIC_CONTAMINATION',  data: hydraulicContaminationData, desc: 'TechArticle, hydraulic system contamination' },
];

// ─── Write output file ─────────────────────────────────────────────────────────

const header = `// AUTO-GENERATED — do not edit manually
// Regenerate with: node scripts/sync-jsonld-constants.js
// Source: elimfilters-vault/00-meta/CITATION_INDEX.json
// Generated: ${new Date().toISOString()}
//
// Each constant is a pre-serialized JSON-LD string for use with:
//   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: CONSTANT }} />
`;

const lines = [header];

for (const c of constants) {
  lines.push(`// ${c.desc}`);
  // JSON.stringify the data object to produce a valid JSON string,
  // then JSON.stringify again to produce a quoted TypeScript string literal.
  const jsonString = JSON.stringify(c.data);
  lines.push(`export const ${c.name} = ${JSON.stringify(jsonString)};`);
  lines.push('');
}

fs.writeFileSync(OUTPUT_PATH, lines.join('\n'), 'utf8');

// ─── Print summary ─────────────────────────────────────────────────────────────

const entityCount = Object.keys(entities).length;
console.log('');
console.log('JSON-LD CONSTANTS SYNC');
console.log('======================');
console.log(`Source: elimfilters-vault/00-meta/CITATION_INDEX.json (${entityCount} entities)`);
console.log(`Output: frontend/src/lib/jsonld-constants.generated.ts`);
console.log(`Constants generated: ${constants.length}`);
for (const c of constants) {
  const padded = c.name.padEnd(40);
  console.log(`  ${padded} (${c.desc})`);
}
console.log('Sync complete.');
console.log('');
