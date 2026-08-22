import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out');
const failures = [];
const dynamicFamilies = ['glossary', 'diagrams', 'engineering-reference'];

const governedPages = [
  {
    rel: ['knowledge-center', 'glossary', 'iso-cleanliness-code', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/glossary/iso-cleanliness-code/',
    tokens: ['ISO 4406 Cleanliness Code Explained', 'DefinedTerm', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'glossary', 'differential-pressure', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/glossary/differential-pressure/',
    tokens: ['Differential Pressure Definition', 'DefinedTerm', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'glossary', 'depth-filtration', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/glossary/depth-filtration/',
    tokens: ['Depth Filtration Definition', 'DefinedTerm', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'glossary', 'compressed-air-purity', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/glossary/compressed-air-purity/',
    tokens: ['Compressed Air Purity Definition', 'DefinedTerm', 'https://elimfilters.com/#organization'],
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
    rel: ['knowledge-center', 'standards', 'iso-4406', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/standards/iso-4406/',
    tokens: ['ISO 4406 Fluid Cleanliness Code', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'standards', 'iso-8573-1', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/standards/iso-8573-1/',
    tokens: ['ISO 8573-1 Compressed Air Purity Classes', 'https://elimfilters.com/#organization'],
  },
  {
    rel: ['knowledge-center', 'engineering-reference', 'fluid-cleanliness', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/engineering-reference/fluid-cleanliness/',
    tokens: ['Fluid Cleanliness Engineering'],
  },
  {
    rel: ['knowledge-center', 'engineering-reference', 'differential-pressure', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/engineering-reference/differential-pressure/',
    tokens: ['Differential Pressure Engineering'],
  },
  {
    rel: ['knowledge-center', 'engineering-reference', 'depth-filtration', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/engineering-reference/depth-filtration/',
    tokens: ['Depth Filtration Engineering'],
  },
  {
    rel: ['knowledge-center', 'engineering-reference', 'compressed-air-purity', 'index.html'],
    canonical: 'https://elimfilters.com/knowledge-center/engineering-reference/compressed-air-purity/',
    tokens: ['Compressed Air Purity Engineering'],
  },
];

function extractCanonical(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  return match?.[1] ?? null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const family of dynamicFamilies) {
  const familyDir = path.join(out, 'knowledge-center', family);
  if (!fs.existsSync(familyDir)) {
    failures.push(`dynamic KC family missing: ${family}`);
    continue;
  }

  for (const entry of fs.readdirSync(familyDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(familyDir, entry.name, 'index.html');
    if (!fs.existsSync(file)) continue;

    const html = fs.readFileSync(file, 'utf8');
    const expected = `https://elimfilters.com/knowledge-center/${family}/${entry.name}/`;
    const canonical = extractCanonical(html);

    if (canonical !== expected) {
      failures.push(`canonical mismatch (${family}/${entry.name}): expected ${expected}, got ${canonical ?? 'missing'}`);
    }

    const absoluteUnslashed = new RegExp(
      `https://elimfilters\\.com/knowledge-center/${family}/${entry.name}(?=[?#"'<>\\s])`,
      'g',
    );
    if (absoluteUnslashed.test(html)) {
      failures.push(`unslashed absolute entity URL leaked: ${family}/${entry.name}`);
    }

    const relativeUnslashed = new RegExp(
      `(?<!https://elimfilters\\.com)/knowledge-center/${family}/${entry.name}(?=[?#"'<>\\s])`,
      'g',
    );
    if (relativeUnslashed.test(html)) {
      failures.push(`unslashed internal route leaked: ${family}/${entry.name}`);
    }
  }
}

for (const spec of governedPages) {
  const file = path.join(out, ...spec.rel);
  const label = spec.rel.slice(0, -1).join('/');
  if (!fs.existsSync(file)) {
    failures.push(`governed KC page missing: ${label}`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const canonical = extractCanonical(html);
  if (canonical !== spec.canonical) {
    failures.push(`governed canonical mismatch (${label}): expected ${spec.canonical}, got ${canonical ?? 'missing'}`);
  }

  const routePath = new URL(spec.canonical).pathname.replace(/\/$/, '');
  const escapedRoutePath = escapeRegExp(routePath);
  const absoluteUnslashed = new RegExp(`https://elimfilters\\.com${escapedRoutePath}(?=[?#"'<>\\s])`);
  const relativeUnslashed = new RegExp(`(?<!https://elimfilters\\.com)${escapedRoutePath}(?=[?#"'<>\\s])`);
  if (absoluteUnslashed.test(html)) failures.push(`governed unslashed absolute entity URL leaked: ${label}`);
  if (relativeUnslashed.test(html)) failures.push(`governed unslashed internal route leaked: ${label}`);

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

  for (const url of urls) {
    const dynamic = /\/knowledge-center\/(glossary|diagrams|engineering-reference|standards)\/[^/]+$/.test(url);
    if (dynamic) failures.push(`unslashed dynamic KC sitemap URL in ${name}: ${url}`);
  }
}

if (failures.length) {
  console.error('[validate-kc-canonical-overlap] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[validate-kc-canonical-overlap] PASS — KC canonicals, entity URLs, internal routes, semantic intent ownership and sitemap variants are normalized');
