import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out');
const failures = [];

const strategicPages = [
  path.join(out, 'families', 'index.html'),
  path.join(out, 'industries', 'mining', 'index.html'),
  path.join(out, 'industries', 'trucks-fleets', 'index.html'),
  path.join(out, 'industries', 'power-generation', 'index.html'),
  path.join(out, 'technologies', 'macrocore', 'index.html'),
];

for (const file of strategicPages) {
  if (!fs.existsSync(file)) {
    failures.push(`strategic conversion page missing: ${path.relative(out, file)}`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(out, file);
  const isMacrocore = relative === path.join('technologies', 'macrocore', 'index.html');

  const hasProductIntelligence =
    html.includes('data-conversion-action="product-intelligence"') ||
    (isMacrocore && html.includes('Find an OEM Equivalent'));

  const hasApplicationSupport =
    html.includes('data-conversion-action="application-support"') ||
    (isMacrocore && html.includes('Request an Engineering Assessment'));

  if (!hasProductIntelligence) failures.push(`product-intelligence conversion action missing: ${relative}`);
  if (!hasApplicationSupport) failures.push(`application-support conversion action missing: ${relative}`);
  if (!html.includes('https://part-search.elimfilters.com')) failures.push(`Part Search path missing: ${relative}`);
  if (!isMacrocore && !html.includes('/contact/')) failures.push(`application support contact path missing: ${relative}`);
}

const distributorPage = path.join(out, 'distributors', 'index.html');
if (!fs.existsSync(distributorPage)) {
  failures.push('distributor conversion page missing: distributors/index.html');
} else {
  const html = fs.readFileSync(distributorPage, 'utf8');
  for (const action of ['distributor-locator', 'product-intelligence', 'application-support', 'partner-application']) {
    if (!html.includes(`data-conversion-action="${action}"`)) failures.push(`distributor conversion action missing: ${action}`);
  }
}

const knowledgeCenterPage = path.join(out, 'knowledge-center', 'index.html');
if (!fs.existsSync(knowledgeCenterPage)) {
  failures.push('knowledge-center conversion page missing: knowledge-center/index.html');
} else {
  const html = fs.readFileSync(knowledgeCenterPage, 'utf8');
  if (!html.includes('https://part-search.elimfilters.com')) failures.push('Knowledge Center Product Intelligence handoff missing');
  if (!html.includes('Search Product Intelligence')) failures.push('Knowledge Center Product Intelligence CTA missing');
  for (const route of ['/knowledge-center/standards', '/knowledge-center/problems', '/knowledge-center/faq']) {
    if (!html.includes(route)) failures.push(`Knowledge Center decision path missing: ${route}`);
  }
}

const comparisonPage = path.join(out, 'knowledge-center', 'comparisons', 'iso4406-vs-nas1638', 'index.html');
if (!fs.existsSync(comparisonPage)) {
  failures.push('priority KC comparison missing: knowledge-center/comparisons/iso4406-vs-nas1638/index.html');
} else {
  const html = fs.readFileSync(comparisonPage, 'utf8');
  for (const action of ['product-intelligence', 'application-support']) {
    if (!html.includes(`data-conversion-action="${action}"`)) failures.push(`priority KC comparison conversion action missing: ${action}`);
  }
  if (!html.includes('https://part-search.elimfilters.com')) failures.push('priority KC comparison Product Intelligence handoff missing');
  if (!html.includes('/contact/')) failures.push('priority KC comparison Application Support path missing');
  if (!html.includes('ISO 4406 vs NAS 1638: Fluid Cleanliness Codes')) failures.push('priority KC comparison CTR title missing');
  if (!html.includes('https://elimfilters.com/knowledge-center/comparisons/iso4406-vs-nas1638/')) failures.push('priority KC comparison canonical URL missing');
}

const priorityComparisonTitleTokens = {
  'iso5011-vs-sae-j726': ['ISO 5011', 'SAE J726', 'Air Cleaner Test Methods', 'ELIMFILTERS'],
  'multipass-vs-single-pass-testing': ['Multi-Pass', 'Single-Pass', 'Filter Testing', 'ELIMFILTERS'],
  'beta-ratio-vs-filtration-efficiency': ['Beta Ratio', 'Filtration Efficiency', 'ELIMFILTERS'],
};

for (const [slug, requiredTokens] of Object.entries(priorityComparisonTitleTokens)) {
  const file = path.join(out, 'knowledge-center', 'comparisons', slug, 'index.html');
  if (!fs.existsSync(file)) {
    failures.push(`priority comparison page missing: ${slug}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const missing = requiredTokens.filter((token) => !html.includes(token));
  if (missing.length) failures.push(`priority comparison CTR language missing (${slug}): ${missing.join(', ')}`);
  for (const action of ['product-intelligence', 'application-support']) {
    if (!html.includes(`data-conversion-action="${action}"`)) failures.push(`priority comparison conversion action missing (${slug}): ${action}`);
  }
  if (!html.includes(`https://elimfilters.com/knowledge-center/comparisons/${slug}/`)) {
    failures.push(`priority comparison canonical URL missing: ${slug}`);
  }
}

const priorityEngineeringSlugs = [
  'compressed-air-quality-verification',
  'cooling-system-contamination',
  'hpcr-fuel-system-cleanliness',
  'filter-housing-design',
  'iso-5011',
];

for (const slug of priorityEngineeringSlugs) {
  const file = path.join(out, 'knowledge-center', 'engineering', slug, 'index.html');
  if (!fs.existsSync(file)) {
    failures.push(`priority engineering page missing: ${slug}`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  for (const action of ['product-intelligence', 'application-support']) {
    if (!html.includes(`data-conversion-action="${action}"`)) {
      failures.push(`priority engineering conversion action missing (${slug}): ${action}`);
    }
  }
  if (!html.includes('https://part-search.elimfilters.com')) failures.push(`priority engineering Product Intelligence handoff missing: ${slug}`);
  if (!html.includes('/contact/')) failures.push(`priority engineering Application Support path missing: ${slug}`);
  if (!html.includes(`https://elimfilters.com/knowledge-center/engineering/${slug}/`)) {
    failures.push(`priority engineering canonical URL missing: ${slug}`);
  }
}

const ctrEngineeringTitleTokens = {
  'compressed-air-quality-verification': ['Compressed Air Quality Verification', 'ELIMFILTERS'],
  'cooling-system-contamination': ['Cooling System Contamination', 'Causes', 'Control', 'ELIMFILTERS'],
  'hpcr-fuel-system-cleanliness': ['HPCR Fuel System Cleanliness', 'Contamination Control', 'ELIMFILTERS'],
  'filter-housing-design': ['Filter Housing Design', 'Flow', 'Sealing', 'Application', 'ELIMFILTERS'],
};

for (const [slug, requiredTokens] of Object.entries(ctrEngineeringTitleTokens)) {
  const file = path.join(out, 'knowledge-center', 'engineering', slug, 'index.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const missing = requiredTokens.filter((token) => !html.includes(token));
  if (missing.length) {
    failures.push(`priority engineering CTR title language missing (${slug}): ${missing.join(', ')}`);
  }
}

const technologiesHub = path.join(out, 'technologies', 'index.html');
if (!fs.existsSync(technologiesHub)) {
  failures.push('technologies hub conversion page missing: technologies/index.html');
} else {
  const html = fs.readFileSync(technologiesHub, 'utf8');
  for (const action of ['product-intelligence', 'application-support']) {
    if (!html.includes(`data-conversion-action="${action}"`)) {
      failures.push(`technologies hub conversion action missing: ${action}`);
    }
  }
  if (!html.includes('https://part-search.elimfilters.com')) failures.push('technologies hub Product Intelligence handoff missing');
  if (!html.includes('/contact/')) failures.push('technologies hub Application Support path missing');
  for (const token of ['Industrial Filtration Technologies', 'Asset Protection', 'ELIMFILTERS']) {
    if (!html.includes(token)) failures.push(`technologies hub CTR language missing: ${token}`);
  }
  if (!html.includes('https://elimfilters.com/technologies/')) failures.push('technologies hub canonical URL missing');
}

const priorityStandardTitleTokens = {
  'iso-16889': ['ISO 16889', 'Multi-Pass Filter Test Method', 'ELIMFILTERS'],
  'iso-12937': ['ISO 12937', 'Water in Petroleum Products', 'ELIMFILTERS'],
  'iso-3968': ['ISO 3968', 'Pressure Drop', 'Flow Test', 'ELIMFILTERS'],
  'sae-j726': ['SAE J726', 'Air Cleaner Test Method', 'ELIMFILTERS'],
  'din-51524': ['DIN 51524', 'Hydraulic Fluids Standard', 'ELIMFILTERS'],
};

for (const [slug, requiredTokens] of Object.entries(priorityStandardTitleTokens)) {
  const file = path.join(out, 'knowledge-center', 'standards', slug, 'index.html');
  if (!fs.existsSync(file)) {
    failures.push(`priority standard page missing: ${slug}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const missing = requiredTokens.filter((token) => !html.includes(token));
  if (missing.length) failures.push(`priority standard CTR language missing (${slug}): ${missing.join(', ')}`);
  for (const action of ['product-intelligence', 'application-support']) {
    if (!html.includes(`data-conversion-action="${action}"`)) failures.push(`priority standard conversion action missing (${slug}): ${action}`);
  }
  if (!html.includes('https://part-search.elimfilters.com')) failures.push(`priority standard Product Intelligence handoff missing: ${slug}`);
  if (!html.includes('/contact/')) failures.push(`priority standard Application Support path missing: ${slug}`);
  if (!html.includes(`https://elimfilters.com/knowledge-center/standards/${slug}/`)) {
    failures.push(`priority standard canonical URL missing: ${slug}`);
  }
}

if (failures.length) {
  console.error('[validate-conversion-layer] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[validate-conversion-layer] PASS — strategic pages expose governed technical and commercial conversion paths');
