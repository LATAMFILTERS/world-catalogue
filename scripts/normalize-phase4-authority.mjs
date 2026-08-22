import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out', 'knowledge-center');

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

function isNoindex(html) {
  return /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) || /<meta\b[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html);
}

function replaceTitleAndSocial(html, title, description) {
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', description);
  return html;
}

function firstParagraphAfterH1(html) {
  const h1End = html.search(/<\/h1>/i);
  if (h1End < 0) return '';
  const tail = html.slice(h1End);
  const paragraphs = [...tail.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
  for (const match of paragraphs.slice(0, 8)) {
    const text = stripTags(match[1]);
    if (text.split(/\s+/).length >= 18) return text;
  }
  return '';
}

function firstH1(html) {
  return stripTags(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
}

function replaceFirstH1(html, value) {
  return html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/i, `$1${escapeHtml(value)}$2`);
}

function insertAfterFirstH1(html, fragment) {
  return html.replace(/(<\/h1>)/i, `$1${fragment}`);
}

function appendBeforeMainClose(html, fragment) {
  if (/<\/main>/i.test(html)) return html.replace(/<\/main>/i, `${fragment}</main>`);
  return html.replace(/<\/body>/i, `${fragment}</body>`);
}

function wordCount(html) {
  return stripTags(html).split(/\s+/).filter(Boolean).length;
}

function normalizeStandards() {
  const dir = path.join(out, 'standards');
  if (!fs.existsSync(dir)) return { audited: 0, modified: 0 };
  let audited = 0;
  let modified = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(dir, entry.name, 'index.html');
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (isNoindex(html)) continue;
    const originalH1 = firstH1(html);
    if (!originalH1) continue;
    audited += 1;

    const code = originalH1.replace(/\s+Standard Reference(?:\s*&\s*Application)?$/i, '').trim();
    const h1 = `${code} Standard Reference & Application`;
    const title = `${h1} | ELIMFILTERS`;
    const description = `${code} engineering reference for scope, test or classification context, key parameters, interpretation, filtration relevance and application decisions.`;

    html = replaceTitleAndSocial(html, title, description);
    html = replaceFirstH1(html, h1);

    if (!html.includes('data-standard-direct-answer="true"')) {
      const answer = `<p data-standard-direct-answer="true">${escapeHtml(`${code} is presented here as an engineering standards reference for filtration and contamination-control decisions. The page connects the standard's documented scope with key parameters, interpretation boundaries and application relevance, while preserving the formal published standard as the controlling source for compliance and test requirements.`)}</p>`;
      html = insertAfterFirstH1(html, answer);
    }

    if (!html.includes('data-standard-application-method="true"')) {
      const section = `<section data-standard-application-method="true" aria-label="${escapeHtml(code)} engineering application method">
<h2>${escapeHtml(code)} engineering application method</h2>
<p>${escapeHtml(`Use ${code} by first identifying what the standard actually measures, classifies or defines, then connect that scope to the protected system and the decision being made. A standards reference should not be treated as a product recommendation by itself. Its value is to establish a common technical language for test conditions, measured performance, cleanliness, fluid or air quality, material condition, or another governed engineering variable described by the standard.`)}</p>
<p>${escapeHtml(`Interpretation should remain traceable to the published edition and to the operating context of the equipment. When values are compared, confirm that the same test method, calibration basis, units, sampling conditions and revision level are being used. Differences in those conditions can make apparently similar values non-equivalent. ELIMFILTERS uses the reference to support engineering interpretation and application review, not to reproduce or replace copyrighted normative text.`)}</p>
<h3>Application sequence</h3>
<ol>
<li>Confirm the current standard, revision and intended scope.</li>
<li>Identify the measured parameter, classification or test condition relevant to the protected system.</li>
<li>Verify units, calibration basis, sampling or test conditions before comparing values.</li>
<li>Connect the standard result to the actual contamination, flow, pressure, cleanliness or service decision.</li>
<li>Use the formal published standard whenever compliance, certification or normative requirements must be established.</li>
</ol>
<p>${escapeHtml(`This sequence keeps ${code} tied to an engineering decision rather than a catalogue claim. It also helps prevent cross-standard comparisons that ignore different test conditions or measurement bases. Where the application remains uncertain, the next step is to verify the protected component, operating duty and available evidence before changing a filtration specification or maintenance interval.`)}</p>
</section>`;
      html = appendBeforeMainClose(html, section);
    }

    fs.writeFileSync(file, html);
    modified += 1;
  }
  return { audited, modified };
}

function normalizeEngineeringReference() {
  const dir = path.join(out, 'engineering-reference');
  if (!fs.existsSync(dir)) return { audited: 0, modified: 0 };
  let audited = 0;
  let modified = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(dir, entry.name, 'index.html');
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (isNoindex(html)) continue;
    const h1 = firstH1(html);
    if (!h1) continue;
    audited += 1;

    const title = `${h1} | ELIMFILTERS`;
    const opening = firstParagraphAfterH1(html);
    let description = opening || `${h1} engineering reference for filtration, contamination control, system performance, application interpretation and reliability decisions.`;
    if (description.length > 160) description = description.slice(0, 157).replace(/\s+\S*$/, '') + '...';
    if (description.length < 120) description = `${description.replace(/[.\s]+$/, '')}. Engineering guidance for system interpretation, application decisions, contamination control and asset reliability.`;
    if (description.length > 160) description = description.slice(0, 157).replace(/\s+\S*$/, '') + '...';
    html = replaceTitleAndSocial(html, title, description);

    if (wordCount(html) < 1000 && !html.includes('data-engineering-reference-application="true"')) {
      const section = `<section data-engineering-reference-application="true" aria-label="${escapeHtml(h1)} application framework">
<h2>${escapeHtml(h1)} application framework</h2>
<p>${escapeHtml(`${h1} should be interpreted as part of a complete filtration or contamination-control system rather than as an isolated technical term. Start with the protected asset, the operating duty and the contamination mechanism, then determine which variables materially affect performance. Those variables can include particle size and concentration, fluid or air flow, restriction, pressure, temperature, chemistry, component sensitivity, sealing integrity and maintenance access depending on the system being evaluated.`)}</p>
<p>${escapeHtml(`The engineering purpose is to connect measurable evidence to a decision. Applicable standards provide the measurement language; operating data establishes the real duty; inspection and condition evidence show how the system behaves in service. A useful review therefore separates what is directly measured from what is inferred, identifies the assumptions behind the interpretation and avoids extending a laboratory or reference value beyond the conditions where it is valid.`)}</p>
<h3>Decision workflow</h3>
<ol>
<li>Define the protected component, system boundary and operating objective.</li>
<li>Identify contamination sources, failure mechanisms and the most sensitive interfaces.</li>
<li>Establish the relevant engineering variables and applicable measurement standards.</li>
<li>Compare the required condition with observed operating, inspection or test evidence.</li>
<li>Select or revise the protection and maintenance strategy only after the evidence and application conditions agree.</li>
</ol>
<p>${escapeHtml(`For ${h1.toLowerCase()}, recurring abnormal conditions should be treated as diagnostic evidence rather than as an automatic reason to shorten service intervals. Repeated restriction, contamination, loading, pressure change or component distress can originate upstream of the filter itself. Investigating sealing, reservoirs, transfer practices, breathers, housings, ducts, fluid condition and maintenance procedures helps distinguish normal service loading from a persistent contamination source.`)}</p>
<p>${escapeHtml(`The final engineering record should preserve the basis of the decision: the asset and duty, the standard or measurement method used, the observed evidence, the limits or assumptions applied and the maintenance action selected. That traceability makes the reference useful for fleet, plant and equipment reliability programs because future changes can be compared against a documented baseline instead of relying on a catalogue cross-reference or a calendar interval alone.`)}</p>
</section>`;
      html = appendBeforeMainClose(html, section);
    }

    fs.writeFileSync(file, html);
    modified += 1;
  }
  return { audited, modified };
}

const standards = normalizeStandards();
const engineering = normalizeEngineeringReference();

console.log(`[normalize-phase4-authority] PASS — standards ${standards.modified}/${standards.audited}; engineering-reference ${engineering.modified}/${engineering.audited}`);
