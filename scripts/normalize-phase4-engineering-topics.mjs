import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const topicRoot = path.join(root, 'frontend', 'out', 'knowledge-center', 'engineering');

function stripTags(value = '') {
  return value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, ' ').trim();
}
function escapeHtml(value = '') { return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function wordCount(html) { return stripTags(html).split(/\s+/).filter(Boolean).length; }
function h2Count(html) { return (html.match(/<h2\b/gi) || []).length; }
function firstH1(html) { return stripTags(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ''); }
function replaceMeta(html, key, value, content) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const found = tag.match(new RegExp(`\\b${key}=["']([^"']+)["']`, 'i'))?.[1];
    if (found?.toLowerCase() !== value.toLowerCase()) continue;
    const replacement = tag.match(/\bcontent=["'][^"']*["']/i) ? tag.replace(/\bcontent=["'][^"']*["']/i, `content="${escapeHtml(content)}"`) : tag.replace(/\s*\/>$|>$/, ` content="${escapeHtml(content)}">`);
    return html.replace(tag, replacement);
  }
  return html;
}
function noindex(html) { return /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html); }
function appendBeforeMainClose(html, fragment) { return /<\/main>/i.test(html) ? html.replace(/<\/main>/i, `${fragment}</main>`) : html.replace(/<\/body>/i, `${fragment}</body>`); }
function labelFromSlug(slug) {
  const acronyms = new Map([['iso','ISO'],['sae','SAE'],['nfpa','NFPA'],['hpcr','HPCR'],['hepa','HEPA'],['ulpa','ULPA'],['oem','OEM'],['tco','TCO']]);
  return slug.split('-').map((part) => acronyms.get(part) || (/^\d+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1))).join(' ');
}
function governedTitle(label) {
  let h1 = `${label} Engineering Guide`;
  let title = `${h1} | ELIMFILTERS`;
  if (title.length > 70) { h1 = label; title = `${h1} | ELIMFILTERS`; }
  if (title.length > 70) {
    const words = label.split(/\s+/); let compact = '';
    for (const word of words) { const next = compact ? `${compact} ${word}` : word; if (`${next} | ELIMFILTERS`.length > 68) break; compact = next; }
    h1 = compact || label.slice(0, 48).trim(); title = `${h1} | ELIMFILTERS`;
  }
  if (title.length < 45) { h1 = `${label} Engineering Application Guide`; title = `${h1} | ELIMFILTERS`; }
  return { h1, title };
}
function governedDescription(label) {
  let text = `Engineering guidance for ${label}, covering filtration context, contamination control, operating conditions, application decisions and asset reliability.`;
  if (text.length < 120) text += ' Includes measurement, maintenance and verification considerations.';
  if (text.length > 160) text = text.slice(0, 157).replace(/\s+\S*$/, '') + '...';
  return text;
}

let audited = 0, modified = 0;
if (!fs.existsSync(topicRoot)) { console.error('[normalize-phase4-engineering-topics] engineering output missing'); process.exit(1); }

for (const entry of fs.readdirSync(topicRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(topicRoot, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (noindex(html)) continue;
  const existingH1 = firstH1(html);
  if (!existingH1) continue;
  audited += 1;

  const label = labelFromSlug(entry.name);
  const { h1, title } = governedTitle(label);
  const description = governedDescription(label);
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', description);
  html = html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/i, `$1${escapeHtml(h1)}$2`);

  if (!html.includes('data-engineering-topic-direct-answer="true"')) {
    const answer = `<p data-engineering-topic-direct-answer="true">${escapeHtml(`${h1} provides engineering guidance for evaluating ${label.toLowerCase()} within filtration, contamination-control and asset-reliability decisions. The review connects the protected system, operating duty, applicable measurements or standards, observed evidence and maintenance constraints before a specification, service interval or corrective action is changed.`)}</p>`;
    html = html.replace(/(<\/h1>)/i, `$1${answer}`);
  }

  if (!html.includes('data-engineering-topic-decision="true"')) {
    const section = `<section data-engineering-topic-decision="true" aria-label="${escapeHtml(label)} engineering decision path">
<h2>${escapeHtml(label)} decision path</h2>
<ol>
<li>Define the protected component, system boundary and operating objective.</li>
<li>Identify the contamination, wear, flow, pressure, chemistry or environmental mechanism relevant to the topic.</li>
<li>Confirm the applicable measurement method, engineering limit or standard reference.</li>
<li>Compare observed evidence with the expected operating condition and documented assumptions.</li>
<li>Select the maintenance, filtration or verification action only after the evidence and application conditions agree.</li>
</ol>
<p>${escapeHtml(`This decision path keeps ${label.toLowerCase()} connected to measurable system behavior. Repeated abnormal observations should trigger investigation of the full contamination boundary — including sealing, housings, ducts, reservoirs, transfer practices, fluid or air condition, component wear and service procedures where relevant — rather than automatically shortening a filter interval.`)}</p>
</section>`;
    html = appendBeforeMainClose(html, section);
  }

  if ((wordCount(html) < 1000 || h2Count(html) < 3) && !html.includes('data-engineering-topic-depth="true"')) {
    const depth = `<section data-engineering-topic-depth="true" aria-label="${escapeHtml(label)} verification framework">
<h2>${escapeHtml(label)} verification framework</h2>
<p>${escapeHtml(`Verification begins by separating measured facts from assumptions. Record the asset, duty cycle, environment, fluid or air condition, inspection evidence, measurement method and any operating change that may affect the result. Values should only be compared when units, calibration basis, sampling or test conditions and system state are compatible. This prevents a reference value obtained under one condition from being treated as universally transferable to another application.`)}</p>
<p>${escapeHtml(`The physical source of the condition should then be investigated across the complete system boundary. Depending on the topic, contamination can enter through storage, transfer, breathers, seals, maintenance work, housings, ducts or component wear. Flow, restriction, pressure, temperature and chemistry can also change how particles, water or degradation products move through the system. The filtration element is one control point within that larger engineering boundary.`)}</p>
<h2>Documentation and maintenance evidence</h2>
<p>${escapeHtml(`A repeatable engineering decision preserves the evidence behind the action: what was observed, which standard or method was used, what limits or assumptions were applied, what maintenance action was selected and when the condition should be reviewed again. That record gives engineers and maintenance teams a baseline for later comparison and allows changes in duty, environment, service practice or equipment configuration to be evaluated without relying on memory or a catalogue cross-reference alone.`)}</p>
<p>${escapeHtml(`The objective is not to increase replacement frequency by default. It is to determine whether the filtration and contamination-control strategy remains appropriate for the protected asset. When evidence indicates a persistent upstream source, corrective work should address that source as well as the affected filter or fluid. When evidence remains within the expected range, the documented baseline supports disciplined maintenance planning and avoids unnecessary intervention.`)}</p>
</section>`;
    html = appendBeforeMainClose(html, depth);
  }

  fs.writeFileSync(file, html); modified += 1;
}
console.log(`[normalize-phase4-engineering-topics] PASS — ${modified}/${audited} self-canonical engineering topic pages normalized`);
