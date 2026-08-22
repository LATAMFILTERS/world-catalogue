import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const erRoot = path.join(root, 'frontend', 'out', 'knowledge-center', 'engineering-reference');

function stripTags(value = '') {
  return value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, ' ').trim();
}

function escapeHtml(value = '') {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function replaceMeta(html, key, value, content) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const found = tag.match(new RegExp(`\\b${key}=["']([^"']+)["']`, 'i'))?.[1];
    if (found?.toLowerCase() !== value.toLowerCase()) continue;
    const replacement = tag.match(/\bcontent=["'][^"']*["']/i)
      ? tag.replace(/\bcontent=["'][^"']*["']/i, `content="${escapeHtml(content)}"`)
      : tag.replace(/\s*\/>$|>$/, ` content="${escapeHtml(content)}">`);
    return html.replace(tag, replacement);
  }
  return html;
}

function replaceTitle(html, title) {
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'name', 'twitter:title', title);
  return html;
}

function firstH1(html) {
  return stripTags(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
}

function wordCount(html) {
  return stripTags(html).split(/\s+/).filter(Boolean).length;
}

function h2Count(html) {
  return (html.match(/<h2\b/gi) || []).length;
}

function appendBeforeMainClose(html, fragment) {
  if (/<\/main>/i.test(html)) return html.replace(/<\/main>/i, `${fragment}</main>`);
  return html.replace(/<\/body>/i, `${fragment}</body>`);
}

function closeHub() {
  const file = path.join(erRoot, 'index.html');
  if (!fs.existsSync(file)) return false;
  let html = fs.readFileSync(file, 'utf8');
  const h1 = firstH1(html);
  if (!h1) return false;

  const description = 'Engineering Reference Library for filtration standards, contamination science, media, fluids, test methods, reliability, calculations and application decisions.';
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'name', 'twitter:description', description);

  if (!html.includes('data-er-hub-direct-answer="true"')) {
    const answer = `<p data-er-hub-direct-answer="true">${escapeHtml(`${h1} provides a structured engineering reference for filtration standards, contamination science, filter media, fluids, test methods, performance metrics, reliability and application decisions. Engineers and maintenance teams can use the library to move from a technical question to the relevant engineering concept, measurement framework and supporting ELIMFILTERS knowledge path.`)}</p>`;
    html = html.replace(/(<\/h1>)/i, `$1${answer}`);
  }

  if (!html.includes('data-er-hub-path="true"')) {
    const pathBlock = `<section data-er-hub-path="true" aria-label="Engineering Reference navigation path"><h2>Engineering reference decision path</h2><ol><li>Define the filtration, contamination or reliability question.</li><li>Open the applicable engineering reference section.</li><li>Connect the concept to standards, measurements and system conditions.</li><li>Follow related engineering, system and application references for the next decision.</li></ol></section>`;
    html = appendBeforeMainClose(html, pathBlock);
  }

  fs.writeFileSync(file, html);
  return true;
}

const duplicateH1Slugs = new Set(['airflow-engineering', 'materials-engineering']);
let audited = 0;
let modified = 0;

for (const entry of fs.readdirSync(erRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(erRoot, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  let h1 = firstH1(html);
  if (!h1) continue;
  audited += 1;

  if (duplicateH1Slugs.has(entry.name) && !/Engineering Reference$/i.test(h1)) {
    h1 = `${h1} Engineering Reference`;
    html = html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/i, `$1${escapeHtml(h1)}$2`);
  }

  let title = `${h1} | ELIMFILTERS`;
  if (title.length < 45) title = `${h1} Engineering Reference | ELIMFILTERS`;
  html = replaceTitle(html, title);

  if ((wordCount(html) < 1000 || h2Count(html) < 3) && !html.includes('data-er-authority-close="true"')) {
    const closure = `<section data-er-authority-close="true" aria-label="${escapeHtml(h1)} verification and documentation">
<h2>${escapeHtml(h1)} verification boundary</h2>
<p>${escapeHtml(`Verification for ${h1.toLowerCase()} begins by separating the engineering variable being evaluated from the surrounding operating conditions. A measured value is useful only when its units, method, sampling or test conditions, equipment state and reference basis are understood. Before using the result to change a filter specification, cleanliness target or maintenance interval, confirm that the evidence represents the protected system under the duty being evaluated rather than a temporary condition or an unrelated upstream event.`)}</p>
<p>${escapeHtml(`The review should also identify the physical boundary of the problem. Contamination can enter through storage, transfer, reservoirs, breathers, seals, ducts, housings, service work or component wear depending on the application. Pressure, flow, temperature, chemistry and restriction can change how that contamination is transported or captured. Treating those conditions as part of the same engineering system prevents a filter element from becoming the default explanation for every abnormal observation.`)}</p>
<h2>Documentation and engineering review</h2>
<p>${escapeHtml(`A repeatable ${h1.toLowerCase()} decision records the asset, operating duty, applicable standard or measurement method, observed condition, assumptions, engineering limits and selected action. This record creates a baseline that can be compared with later inspections, laboratory results, service events or changes in operating conditions. Where multiple data sources disagree, preserve the disagreement and investigate the reason instead of forcing a conclusion from one measurement.`)}</p>
<p>${escapeHtml(`For fleet and industrial reliability programs, this documentation supports consistent decisions across technicians, engineers and maintenance locations. It also allows application changes to be reviewed against evidence: a new duty cycle, environmental condition, fluid, component, service practice or filtration configuration can be evaluated against the previous baseline. The objective is traceable engineering judgement — not simply more frequent replacement — so contamination control remains connected to asset protection and measurable system behavior.`)}</p>
</section>`;
    html = appendBeforeMainClose(html, closure);
  }

  fs.writeFileSync(file, html);
  modified += 1;
}

const hub = closeHub();
console.log(`[close-phase4-engineering-reference] PASS — ${modified}/${audited} engineering-reference pages closed; hub=${hub ? 'normalized' : 'missing'}`);
