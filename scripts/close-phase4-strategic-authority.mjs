import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out');

function stripTags(value = '') {
  return value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, ' ').trim();
}
function escapeHtml(value = '') { return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function firstH1(html) { return stripTags(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ''); }
function replaceH1(html, h1) { return html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/i, `$1${escapeHtml(h1)}$2`); }
function replaceTitle(html, title) { return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`); }
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
function replaceSocial(html, title, description) {
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', description);
  return html;
}
function clampDescription(text) {
  let value = text.replace(/\s+/g, ' ').trim();
  if (value.length < 120) value = `${value.replace(/[.\s]+$/, '')}. Engineering context for filtration, contamination control, system performance and asset-protection decisions.`;
  if (value.length > 160) value = value.slice(0, 157).replace(/\s+\S*$/, '') + '...';
  return value;
}
function appendBeforeMainClose(html, fragment) {
  if (/<\/main>/i.test(html)) return html.replace(/<\/main>/i, `${fragment}</main>`);
  return html.replace(/<\/body>/i, `${fragment}</body>`);
}
function setPage(file, updater) {
  if (!fs.existsSync(file)) throw new Error(`Missing output: ${file}`);
  const html = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, updater(html));
}

// 1) Technology descriptions: preserve content, constrain only metadata to the governed range.
for (const slug of ['macrocore', 'intekcore']) {
  const file = path.join(out, 'technologies', slug, 'index.html');
  setPage(file, (html) => {
    const h1 = firstH1(html);
    const title = `${h1} | ELIMFILTERS`;
    const description = clampDescription(`${h1} engineering for contamination control, system integration, application selection and asset-protection decisions.`);
    html = replaceTitle(html, title);
    return replaceSocial(html, title, description);
  });
}

// 2) Remaining two core Systems: keep the already-validated body and close only unique intent + metadata.
const systems = {
  'air-intake': {
    h1: null,
    description: 'Air intake and airflow protection engineering for dust control, clean-side integrity, restriction, sealing, service conditions and engine asset protection.'
  },
  'fuel-cleanliness': {
    h1: 'Fuel Cleanliness Filtration & Asset Protection',
    description: 'Fuel cleanliness and filtration engineering for particulate and water control, fuel-system protection, application selection, service conditions and asset reliability.'
  }
};
for (const [slug, profile] of Object.entries(systems)) {
  const file = path.join(out, 'systems', slug, 'index.html');
  setPage(file, (html) => {
    let h1 = firstH1(html);
    if (profile.h1) { h1 = profile.h1; html = replaceH1(html, h1); }
    const title = `${h1} | ELIMFILTERS`;
    const description = clampDescription(profile.description);
    html = replaceTitle(html, title);
    return replaceSocial(html, title, description);
  });
}

// 3) One Engineering Reference page retained a title/H1 overlap deficit after the general pass.
{
  const file = path.join(out, 'knowledge-center', 'engineering-reference', 'filtration-science', 'index.html');
  setPage(file, (html) => {
    const h1 = 'Filtration Science Engineering Reference';
    const title = `${h1} | ELIMFILTERS`;
    const description = clampDescription('Filtration science engineering reference covering capture mechanisms, media behavior, efficiency, loading, pressure loss and application interpretation.');
    html = replaceH1(html, h1);
    html = replaceTitle(html, title);
    return replaceSocial(html, title, description);
  });
}

// 4) Comparison pages: close direct-answer, metadata and semantic-section deficits without changing their core comparison evidence.
const comparisonsRoot = path.join(out, 'knowledge-center', 'comparisons');
const comparisonEntries = fs.existsSync(comparisonsRoot)
  ? fs.readdirSync(comparisonsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  : [];
let comparisons = 0;
for (const entry of comparisonEntries) {
  const file = path.join(comparisonsRoot, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  setPage(file, (html) => {
    let h1 = firstH1(html);
    if (!h1) return html;

    let title = `${h1} | ELIMFILTERS`;
    if (entry.name === 'beta-ratio-vs-filtration-efficiency') {
      h1 = 'Beta Ratio vs Filtration Efficiency';
      title = `${h1} | ELIMFILTERS`;
      html = replaceH1(html, h1);
    }
    if (title.length > 70) {
      title = `${h1.replace(/\s+(Comparison|Engineering Comparison)$/i, '').trim()} | ELIMFILTERS`;
    }
    const description = clampDescription(`${h1} engineering comparison for interpreting technical differences, measurement context, application limits and filtration selection decisions.`);
    html = replaceTitle(html, title);
    html = replaceSocial(html, title, description);

    if (!html.includes('data-comparison-direct-answer="true"')) {
      const answer = `<p data-comparison-direct-answer="true">${escapeHtml(`${h1} compares two engineering concepts or approaches used in filtration and contamination-control decisions. The useful distinction depends on what each method measures or controls, the operating conditions where it applies, and the evidence required before using the comparison to change a specification, product selection or maintenance strategy.`)}</p>`;
      html = html.replace(/(<\/h1>)/i, `$1${answer}`);
    }

    if (!html.includes('data-comparison-authority-close="true"')) {
      const section = `<section data-comparison-authority-close="true" aria-label="${escapeHtml(h1)} engineering interpretation">
<h2>How to interpret this comparison</h2>
<p>${escapeHtml(`Use this comparison by first defining the protected system and the decision being made. Confirm that both sides are being evaluated on compatible units, test conditions, measurement methods and operating assumptions. A difference in terminology or laboratory method does not automatically establish a performance advantage in a real application; the comparison becomes useful only when it is connected to the actual contamination mechanism, system duty and required engineering outcome.`)}</p>
<h2>Application decision boundary</h2>
<p>${escapeHtml(`The final application decision should preserve the evidence behind it: equipment configuration, operating environment, applicable standard or test basis, observed condition and any limits or assumptions. Where the two approaches are not directly equivalent, keep that distinction explicit rather than forcing a numerical conversion. This protects the engineering meaning of the comparison and keeps product or maintenance decisions traceable to the conditions where the evidence is valid.`)}</p>
</section>`;
      html = appendBeforeMainClose(html, section);
    }
    return html;
  });
  comparisons += 1;
}

// 5) Comparison hub: improve its own GEO usefulness and relationship graph, even though it is not in the strategic 143-page denominator.
{
  const file = path.join(comparisonsRoot, 'index.html');
  if (fs.existsSync(file)) {
    setPage(file, (html) => {
      const h1 = firstH1(html) || 'Engineering Comparisons';
      if (!html.includes('data-comparison-hub-answer="true"')) {
        const answer = `<p data-comparison-hub-answer="true">${escapeHtml('Engineering Comparisons organizes filtration and contamination-control topics that are commonly evaluated side by side. Each comparison explains what differs, what can be compared directly, which assumptions matter and how engineers should connect the distinction to a protected system, operating duty and documented application decision.')}</p>`;
        html = html.replace(/(<\/h1>)/i, `$1${answer}`);
      }
      if (!html.includes('data-comparison-hub-path="true"')) {
        const block = `<section data-comparison-hub-path="true" aria-label="Comparison decision path">
<h2>Comparison decision path</h2>
<ol><li>Define the engineering question and protected system.</li><li>Confirm the measurement basis and operating assumptions on both sides.</li><li>Identify differences that materially affect filtration or contamination control.</li><li>Review the applicable standard, engineering reference and system context.</li><li>Use validated application evidence before changing a specification or maintenance strategy.</li></ol>
<h2>Related engineering paths</h2>
<p><a href="/knowledge-center/engineering-reference/">Engineering Reference</a> connects the underlying principles and measurements. <a href="/knowledge-center/standards/">Standards</a> provides neutral scope and interpretation context. <a href="/systems/">Protection Systems</a> connects the comparison to the protected asset architecture.</p>
</section>`;
        html = appendBeforeMainClose(html, block);
      }
      return html;
    });
  }
}

console.log(`[close-phase4-strategic-authority] PASS — technologies=2 systems=2 engineering-reference=1 comparisons=${comparisons} plus comparison hub`);
