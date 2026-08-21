import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out');
const faqHtml = path.join(out, 'knowledge-center', 'faq', 'index.html');
const knowledgeCenterHtml = path.join(out, 'knowledge-center', 'index.html');
const sitemap = path.join(out, 'sitemap.xml');

const failures = [];

if (!fs.existsSync(faqHtml)) {
  failures.push('FAQ hub output is missing');
} else {
  const html = fs.readFileSync(faqHtml, 'utf8');
  if (!html.includes('https://elimfilters.com/knowledge-center/faq/')) failures.push('FAQ hub canonical URL missing');
  if (!html.includes('FAQPage')) failures.push('FAQPage structured data missing');
  if (!html.includes('Technical Frequently Asked Questions')) failures.push('FAQ hub H1 missing');
  if (/PENDING DE TRADUCCI[ÓO]N|PENDING DE TRADUCTION/i.test(html)) failures.push('translation placeholder leaked into FAQ hub');
  if (/DURACTECH/i.test(html)) failures.push('retired DURACTECH token leaked into FAQ hub');

  const demandGrounding = [
    ['How do you read an ISO cleanliness code?', '/knowledge-center/glossary/iso-cleanliness-code/'],
    ['What is an ISO 4406 cleanliness chart?', '/knowledge-center/diagrams/iso-4406-cleanliness-scale/'],
    ['What is ISO 8573-1?', '/knowledge-center/standards/iso-8573-1/'],
    ['What is differential pressure?', '/knowledge-center/glossary/differential-pressure/'],
    ['What is a service interval?', '/knowledge-center/glossary/service-interval/'],
    ['What is soot?', '/knowledge-center/glossary/soot/'],
    ['What is depth filtration?', '/knowledge-center/glossary/depth-filtration/'],
    ['What is coalescing?', '/knowledge-center/glossary/coalescing/'],
    ['What is bearing clearance?', '/knowledge-center/glossary/bearing-clearance/'],
    ['What is hydrodynamic lubrication?', '/knowledge-center/glossary/hydrodynamic-lubrication/'],
    ['What is microbiological contamination?', '/knowledge-center/glossary/microbial-contamination/'],
    ['What is a NAS cleanliness value?', '/knowledge-center/glossary/nas-cleanliness-code/'],
  ];

  for (const [question, href] of demandGrounding) {
    if (!html.includes(question)) failures.push(`GSC-observed FAQ missing: ${question}`);
    if (!html.includes(href)) failures.push(`GSC-observed FAQ exact source missing: ${href}`);
  }
}

if (!fs.existsSync(knowledgeCenterHtml)) {
  failures.push('Knowledge Center homepage output is missing');
} else {
  const html = fs.readFileSync(knowledgeCenterHtml, 'utf8');
  if (!html.includes('/knowledge-center/faq')) failures.push('Knowledge Center homepage does not link to Technical FAQ');
  if (!html.includes('Technical FAQ')) failures.push('Knowledge Center homepage does not expose Technical FAQ label');
}

if (!fs.existsSync(sitemap)) {
  failures.push('sitemap.xml missing');
} else {
  const xml = fs.readFileSync(sitemap, 'utf8');
  if (!xml.includes('https://elimfilters.com/knowledge-center/faq/')) failures.push('FAQ hub missing from sitemap');
}

const localeRoot = path.join(root, 'frontend', 'public', 'locales');
if (fs.existsSync(localeRoot)) {
  for (const locale of fs.readdirSync(localeRoot)) {
    const legacyFaq = path.join(localeRoot, locale, 'faq.json');
    if (fs.existsSync(legacyFaq)) failures.push(`legacy public FAQ payload still present: ${locale}/faq.json`);
  }
}

if (failures.length) {
  console.error('[validate-faq-governance] FAIL');
  failures.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log('[validate-faq-governance] PASS — canonical FAQ hub, GSC demand grounding, exact sources, schema, sitemap and legacy payload hygiene verified');
