import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out');
const failures = [];

const governedPages = [
  {
    rel: ['knowledge-center', 'glossary', 'iso-cleanliness-code', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/glossary/iso-cleanliness-code/',
    tokens: ['ISO 4406 Cleanliness Code Explained', 'DefinedTerm', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'glossary', 'differential-pressure', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/glossary/differential-pressure/',
    tokens: ['DefinedTerm', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'glossary', 'depth-filtration', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/glossary/depth-filtration/',
    tokens: ['DefinedTerm', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'glossary', 'bearing-clearance', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/glossary/bearing-clearance/',
    tokens: ['DefinedTerm', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'diagrams', 'iso-4406-cleanliness-scale', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/diagrams/iso-4406-cleanliness-scale/',
    tokens: ['ISO 4406 Cleanliness Code Chart', 'Particle Count Scale', 'TechArticle', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'diagrams', 'iso-8573-purity-classes', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/diagrams/iso-8573-purity-classes/',
    tokens: ['ISO 8573-1 Purity Classes Chart', 'Compressed Air', 'TechArticle', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'standards', 'iso-8573-1', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/standards/iso-8573-1/',
    tokens: ['ISO 8573', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'engineering-reference', 'fluid-cleanliness', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/engineering-reference/fluid-cleanliness/',
    tokens: ['Engineering Reference'],
  },
];

for (const spec of governedPages) {
  const file = path.join(out, ...spec.rel);
  const label = spec.rel.slice(0, -1).join('/');
  if (!fs.existsSync(file)) {
    failures.push(`governed KC page missing: ${label}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(`rel="canonical" href="${spec.canonical}"`) && !html.includes(`href="${spec.canonical}" rel="canonical"`)) {
    failures.push(`self-canonical with trailing slash missing: ${label}`);
  }
  const unslashed = spec.canonical.slice(0, -1);
  if (html.includes(`rel="canonical" href="${unslashed}"`) || html.includes(`href="${unslashed}" rel="canonical"`)) {
    failures.push(`unslashed canonical leaked: ${label}`);
  }
  for (const token of spec.tokens) {
    if (!html.includes(token)) failures.push(`KC entity/intent token missing (${label}): ${token}`);
  }
}

const sitemapFiles = ['sitemap.xml', 'sitemap-kc.xml'];
for (const name of sitemapFiles) {
  const file = path.join(out, name);
  if (!fs.existsSync(file)) continue;
  const xml = fs.readFileSync(file, 'utf8');
  const urls = [...xml.matchAll(/<loc>(https:\/\/elimfilters\.com\/knowledge-center\/[^<]+)<\/loc>/g)].map((m) => m[1]);
  const normalized = new Map();
  for (const url of urls) {
    const key = url.replace(/\/$/, '');
    const seen = normalized.get(key) || [];
    seen.push(url);
    normalized.set(key, seen);
  }
  for (const [key, variants] of normalized) {
    if (new Set(variants).size > 1) failures.push(`duplicate slash/no-slash KC sitemap variants in ${name}: ${key}`);
  }
}

if (failures.length) {
  console.error('[validate-kc-canonical-overlap] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[validate-kc-canonical-overlap] PASS — KC canonicals, entity signals, intent separation and sitemap variant hygiene verified');
