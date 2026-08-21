import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out');
const faqHtml = path.join(out, 'knowledge-center', 'faq', 'index.html');
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

console.log('[validate-faq-governance] PASS — canonical FAQ hub, schema, sitemap and legacy payload hygiene verified');
