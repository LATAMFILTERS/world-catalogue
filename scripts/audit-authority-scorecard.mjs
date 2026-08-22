import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out');
const reportDir = path.join(root, 'reports', 'seo-geo');
const jsonReport = path.join(reportDir, 'authority-scorecard.json');
const mdReport = path.join(reportDir, 'authority-scorecard.md');

if (!fs.existsSync(out)) {
  console.error('[authority-scorecard] frontend/out is missing');
  process.exit(1);
}

const PAGE_TYPES = [
  ['glossary', /^\/knowledge-center\/glossary\/[^/]+\/$/],
  ['standard', /^\/knowledge-center\/standards\/[^/]+\/$/],
  ['diagram', /^\/knowledge-center\/diagrams\/[^/]+\/$/],
  ['comparison', /^\/knowledge-center\/comparisons\/[^/]+\/$/],
  ['engineering', /^\/knowledge-center\/(?:engineering|engineering-reference)\/[^/]+\/$/],
  ['industry', /^\/industries\/[^/]+\/$/],
  ['system', /^\/systems\/[^/]+\/$/],
  ['technology', /^\/technologies\/[^/]+\/$/],
  ['family', /^\/families\/[^/]+\/$/],
  ['knowledge-hub', /^\/knowledge-center\/$/],
  ['hub', /^\/(?:industries|systems|technologies|families|products|distributors)\/$/],
];

const DEPTH_TARGETS = {
  glossary: 250,
  standard: 600,
  diagram: 250,
  comparison: 600,
  engineering: 1000,
  industry: 900,
  system: 800,
  technology: 800,
  family: 600,
  'knowledge-hub': 450,
  hub: 400,
  other: 400,
};

const BLOCKED_PUBLIC_COMPETITOR_TERMS = [
  'donaldson',
  'fleetguard',
  'mann-filter',
  'mann+hummel',
  'mann hummel',
  'atmus',
];

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && entry.name === 'index.html') files.push(full);
  }
  return files;
}

function routeFromFile(file) {
  const rel = path.relative(out, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/\/index\.html$/, '')}/`;
}

function pageType(route) {
  for (const [type, regex] of PAGE_TYPES) if (regex.test(route)) return type;
  return 'other';
}

function stripHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function attr(html, tag, name) {
  const re = new RegExp(`<${tag}\\b[^>]*\\b${name}=["']([^"']+)["'][^>]*>`, 'i');
  return html.match(re)?.[1]?.trim() ?? '';
}

function metaContent(html, key, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const k = tag.match(new RegExp(`\\b${key}=["']([^"']+)["']`, 'i'))?.[1];
    if (k?.toLowerCase() !== value.toLowerCase()) continue;
    return tag.match(/\bcontent=["']([^"']*)["']/i)?.[1]?.trim() ?? '';
  }
  return '';
}

function tagTexts(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))]
    .map((m) => stripHtml(m[1]))
    .filter(Boolean);
}

function canonical(html) {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of links) {
    if (!/\brel=["'][^"']*canonical[^"']*["']/i.test(tag)) continue;
    return tag.match(/\bhref=["']([^"']+)["']/i)?.[1]?.trim() ?? '';
  }
  return '';
}

function internalLinks(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref=["']([^"'#]+)["'][^>]*>/gi)]
    .map((m) => m[1])
    .filter((href) => href.startsWith('/') || href.startsWith('https://elimfilters.com/'));
}

function schemaBlocks(html) {
  const blocks = [];
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch {
      // Invalid structured data is reflected by the absence of parseable schema.
    }
  }
  return blocks;
}

function flattenSchema(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    for (const item of value) flattenSchema(item, out);
    return out;
  }
  out.push(value);
  for (const child of Object.values(value)) flattenSchema(child, out);
  return out;
}

function words(text) {
  return text.match(/[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9'’+.-]*/g) ?? [];
}

function meaningfulTokens(text) {
  const stop = new Set(['the','and','for','with','from','into','what','how','why','of','to','in','a','an','on','by','or','is','are','elimfilters','industrial','filtration']);
  return [...new Set(words(text.toLowerCase()).filter((w) => w.length > 2 && !stop.has(w)))];
}

function overlapScore(a, b) {
  const aa = meaningfulTokens(a);
  const bb = new Set(meaningfulTokens(b));
  if (!aa.length) return 0;
  return aa.filter((t) => bb.has(t)).length / aa.length;
}

function addResult(results, name, max, score, details = []) {
  results[name] = { max, score: Math.max(0, Math.min(max, Math.round(score))), details };
}

const files = walk(out);
const rawPages = [];

for (const file of files) {
  const route = routeFromFile(file);
  if (route.startsWith('/_next/') || route.startsWith('/api/')) continue;
  const html = fs.readFileSync(file, 'utf8');
  const robots = metaContent(html, 'name', 'robots').toLowerCase();
  if (robots.includes('noindex')) continue;

  const title = tagTexts(html, 'title')[0] ?? '';
  const h1s = tagTexts(html, 'h1');
  rawPages.push({ file, route, html, title, h1: h1s[0] ?? '', h1Count: h1s.length });
}

// Uniqueness is an authority-page property. Consolidated/legacy URLs must not
// make the canonical destination appear duplicated, because they do not compete
// as autonomous indexable entities.
const authorityPagesForUniqueness = rawPages.filter((p) => {
  const canon = canonical(p.html);
  return canon === `https://elimfilters.com${p.route}`;
});

const titleCounts = new Map();
const h1Counts = new Map();
for (const p of authorityPagesForUniqueness) {
  if (p.title) titleCounts.set(p.title.toLowerCase(), (titleCounts.get(p.title.toLowerCase()) ?? 0) + 1);
  if (p.h1) h1Counts.set(p.h1.toLowerCase(), (h1Counts.get(p.h1.toLowerCase()) ?? 0) + 1);
}

const pages = [];
for (const p of rawPages) {
  const type = pageType(p.route);
  const text = stripHtml(p.html);
  const wordCount = words(text).length;
  const description = metaContent(p.html, 'name', 'description');
  const canon = canonical(p.html);
  const expectedCanonical = `https://elimfilters.com${p.route}`;
  const schemas = schemaBlocks(p.html);
  const schemaNodes = schemas.flatMap((s) => flattenSchema(s));
  const schemaTypes = [...new Set(schemaNodes.flatMap((n) => Array.isArray(n['@type']) ? n['@type'] : n['@type'] ? [n['@type']] : []))];
  const links = internalLinks(p.html);
  const uniqueLinks = [...new Set(links.map((href) => href.replace('https://elimfilters.com', '')))];
  const firstBody = text.slice(0, 1800);
  const blocks = {};
  const warnings = [];
  const blockers = [];

  // 1. Search intent ownership — 15
  let intent = 0;
  const titleH1Overlap = overlapScore(p.title, p.h1);
  if (p.title && p.h1) intent += 5;
  if (titleH1Overlap >= 0.45) intent += 5;
  else warnings.push('Title and H1 show weak semantic alignment.');
  if ((titleCounts.get(p.title.toLowerCase()) ?? 0) === 1) intent += 3;
  else if (p.title) warnings.push('Title is duplicated on another self-canonical indexable page.');
  if ((h1Counts.get(p.h1.toLowerCase()) ?? 0) === 1) intent += 2;
  else if (p.h1) warnings.push('H1 is duplicated on another self-canonical indexable page.');
  addResult(blocks, 'searchIntentOwnership', 15, intent, [`titleH1Overlap=${titleH1Overlap.toFixed(2)}`]);

  // 2. Technical SEO integrity — 15
  let technical = 0;
  if (p.title) technical += 2;
  if (description) technical += 2;
  if (p.h1Count === 1) technical += 2;
  else blockers.push(`Expected exactly one H1; found ${p.h1Count}.`);
  if (canon) technical += 2;
  else blockers.push('Canonical is missing.');
  if (canon === expectedCanonical) technical += 4;
  else if (canon) blockers.push(`Canonical mismatch: ${canon}`);
  if (p.title.length >= 35 && p.title.length <= 70) technical += 1;
  else warnings.push(`Title length is ${p.title.length}; target is roughly 45–65.`);
  if (description.length >= 100 && description.length <= 170) technical += 1;
  else warnings.push(`Meta description length is ${description.length}; target is roughly 120–160.`);
  const legacyLinks = uniqueLinks.filter((href) => href.startsWith('/knowledge-system/') || href.startsWith('/fleet-optimization/'));
  if (!legacyLinks.length) technical += 1;
  else warnings.push(`Legacy internal routes emitted: ${legacyLinks.slice(0, 4).join(', ')}`);
  addResult(blocks, 'technicalSeoIntegrity', 15, technical);

  // 3. Direct-answer / GEO readiness — 15
  let geo = 0;
  const openingParagraphs = tagTexts(p.html, 'p').slice(0, 5);
  const usefulOpening = openingParagraphs.find((x) => words(x).length >= 25);
  if (usefulOpening) geo += 6;
  else warnings.push('No substantive direct-answer paragraph near the top of the page.');
  if (usefulOpening && overlapScore(p.h1 || p.title, usefulOpening) >= 0.2) geo += 4;
  else warnings.push('Opening answer is weakly connected to the primary page topic.');
  if (/\b(is|means|refers to|protects|controls|measures|applies|uses|provides|helps|requires)\b/i.test(firstBody)) geo += 2;
  if (/<(?:ul|ol|table)\b/i.test(p.html)) geo += 2;
  if (schemaTypes.some((t) => ['Answer','FAQPage','TechArticle','DefinedTerm','WebPage','CollectionPage'].includes(t))) geo += 1;
  addResult(blocks, 'geoDirectAnswerReadiness', 15, geo);

  // 4. Topical depth — 15
  const depthTarget = DEPTH_TARGETS[type] ?? DEPTH_TARGETS.other;
  const ratio = Math.min(1, wordCount / depthTarget);
  let depth = ratio * 10;
  const h2Count = tagTexts(p.html, 'h2').length;
  if (h2Count >= 3) depth += 3;
  else if (h2Count >= 1) depth += 1;
  if (/(contamin|reliab|asset|system|standard|selection|application|maintenance|failure|operating)/i.test(text)) depth += 2;
  if (wordCount < depthTarget * 0.7) warnings.push(`Topical depth is low for ${type}: ${wordCount} words vs indicative ${depthTarget}+ target.`);
  addResult(blocks, 'topicalDepth', 15, depth, [`wordCount=${wordCount}`, `depthTarget=${depthTarget}`, `h2Count=${h2Count}`]);

  // 5. Entity and semantic graph — 15
  let entity = 0;
  if (schemas.length) entity += 3;
  else warnings.push('No parseable JSON-LD schema found.');
  if (schemaNodes.some((n) => typeof n['@id'] === 'string')) entity += 3;
  if (schemaNodes.some((n) => n.isPartOf)) entity += 2;
  if (schemaNodes.some((n) => n.publisher)) entity += 2;
  if (schemaNodes.some((n) => n.about)) entity += 2;
  if (schemaTypes.includes('BreadcrumbList')) entity += 2;
  if (schemaNodes.some((n) => n.hasPart || n.mainEntity || n.subjectOf)) entity += 1;
  addResult(blocks, 'entitySemanticGraph', 15, entity, [`schemaTypes=${schemaTypes.join('|') || 'none'}`]);

  // 6. Internal linking and knowledge relationships — 10
  let linking = 0;
  const logicalLinks = uniqueLinks.filter((href) => href !== p.route && !href.startsWith('/legal/'));
  if (logicalLinks.length >= 4) linking += 5;
  else if (logicalLinks.length >= 2) linking += 3;
  else if (logicalLinks.length >= 1) linking += 1;
  else warnings.push('Page has no meaningful outgoing internal links.');
  const relationshipFamilies = new Set(logicalLinks.map((href) => href.split('/').filter(Boolean).slice(0, 2).join('/')));
  if (relationshipFamilies.size >= 3) linking += 3;
  else if (relationshipFamilies.size >= 2) linking += 2;
  else if (relationshipFamilies.size >= 1) linking += 1;
  if (!legacyLinks.length) linking += 2;
  addResult(blocks, 'internalLinkingRelationships', 10, linking, [`internalLinks=${logicalLinks.length}`, `relationshipFamilies=${relationshipFamilies.size}`]);

  // 7. Evidence and claim governance — 10
  let evidence = 10;
  const lower = text.toLowerCase();
  const competitorHits = BLOCKED_PUBLIC_COMPETITOR_TERMS.filter((term) => lower.includes(term));
  if (competitorHits.length) {
    evidence -= Math.min(6, competitorHits.length * 2);
    warnings.push(`Public competitor terminology detected: ${competitorHits.join(', ')}`);
  }
  const numericalClaims = [...text.matchAll(/\b(?:\d+(?:\.\d+)?%|\$\s?\d[\d,.]*|\d+(?:\.\d+)?\s?[×x])\b/g)].length;
  const evidenceSignals = (text.match(/\b(?:ISO|SAE|ASTM|NFPA|source|citation|reference|evidence|test method|validated)\b/gi) ?? []).length;
  if (numericalClaims >= 3 && evidenceSignals === 0) {
    evidence -= 4;
    warnings.push(`Multiple numerical claims (${numericalClaims}) appear without visible evidence/reference signals.`);
  } else if (numericalClaims > 0 && evidenceSignals === 0) {
    evidence -= 2;
  }
  addResult(blocks, 'evidenceClaimGovernance', 10, evidence, [`numericalClaims=${numericalClaims}`, `evidenceSignals=${evidenceSignals}`]);

  // 8. User usefulness and conversion path — 5
  let utility = 0;
  if (/(identify|search|compare|contact|support|explore|learn|apply|find|next step|request)/i.test(text)) utility += 3;
  if (logicalLinks.length >= 2) utility += 1;
  if (/\b(engineer|fleet|maintenance|application|equipment|technical|decision|operator)\b/i.test(text)) utility += 1;
  addResult(blocks, 'userUsefulnessConversion', 5, utility);

  const score = Object.values(blocks).reduce((sum, block) => sum + block.score, 0);
  const authorityReady = score >= 90 && blockers.length === 0;
  const tier = score >= 90 ? 'authority-ready' : score >= 80 ? 'strong-incomplete' : score >= 70 ? 'below-target' : 'not-authority-ready';

  pages.push({
    route: p.route,
    type,
    score,
    tier,
    authorityReady,
    blockers,
    warnings,
    metrics: {
      titleLength: p.title.length,
      metaDescriptionLength: description.length,
      h1Count: p.h1Count,
      wordCount,
      internalLinks: logicalLinks.length,
      schemaTypes,
      canonical: canon,
    },
    blocks,
  });
}

pages.sort((a, b) => a.score - b.score || a.route.localeCompare(b.route));

const strategicTypes = new Set(['industry','system','technology','family','knowledge-hub','standard','engineering','comparison']);
const strategic = pages.filter((p) => strategicTypes.has(p.type));
const summary = {
  generatedAt: new Date().toISOString(),
  standardVersion: '1.0',
  totalIndexablePagesAudited: pages.length,
  strategicPagesAudited: strategic.length,
  authorityReady: pages.filter((p) => p.authorityReady).length,
  strongIncomplete: pages.filter((p) => p.tier === 'strong-incomplete').length,
  belowTarget: pages.filter((p) => p.tier === 'below-target').length,
  notAuthorityReady: pages.filter((p) => p.tier === 'not-authority-ready').length,
  blockedByCriticalDefect: pages.filter((p) => p.blockers.length).length,
  averageScore: pages.length ? Number((pages.reduce((sum, p) => sum + p.score, 0) / pages.length).toFixed(1)) : 0,
  strategicAverageScore: strategic.length ? Number((strategic.reduce((sum, p) => sum + p.score, 0) / strategic.length).toFixed(1)) : 0,
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(jsonReport, `${JSON.stringify({ summary, pages }, null, 2)}\n`);

const rows = strategic
  .map((p) => `| ${p.score} | ${p.type} | ${p.blockers.length ? 'BLOCKED' : p.tier} | ${p.route} | ${p.warnings.slice(0, 2).join(' / ') || '—'} |`)
  .join('\n');
const md = `# ELIMFILTERS Authority Audit Scorecard\n\nGenerated: ${summary.generatedAt}\nStandard: v${summary.standardVersion}\n\n## Summary\n\n- Indexable pages audited: ${summary.totalIndexablePagesAudited}\n- Strategic pages audited: ${summary.strategicPagesAudited}\n- Average score: ${summary.averageScore}/100\n- Strategic average: ${summary.strategicAverageScore}/100\n- Authority-ready: ${summary.authorityReady}\n- Strong incomplete: ${summary.strongIncomplete}\n- Below target: ${summary.belowTarget}\n- Not authority-ready: ${summary.notAuthorityReady}\n- Critical blockers: ${summary.blockedByCriticalDefect}\n\n## Strategic remediation queue\n\nLowest scores appear first. GSC demand is applied separately to determine business remediation order.\n\n| Score | Type | Status | Route | Primary warnings |\n|---:|---|---|---|---|\n${rows}\n`;
fs.writeFileSync(mdReport, md);

console.log(`[authority-scorecard] PASS — audited ${pages.length} indexable pages; strategic average ${summary.strategicAverageScore}/100; ${summary.authorityReady} authority-ready; ${summary.blockedByCriticalDefect} blocked`);
console.log(`[authority-scorecard] Reports: ${path.relative(root, jsonReport)}, ${path.relative(root, mdReport)}`);
