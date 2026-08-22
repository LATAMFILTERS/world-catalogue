import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const glossaryRoot = path.join(root, 'frontend', 'out', 'knowledge-center', 'glossary');

const topics = {
  'iso-cleanliness-code': {
    term: 'ISO Cleanliness Code',
    definition: 'ISO Cleanliness Code is a standardized way to express ranges of particle concentration in a fluid cleanliness sample. In hydraulic and lubrication work, it gives engineers and maintenance teams a common language for describing contamination level and comparing cleanliness evidence.',
    context: 'The code is useful only when the sampling method, particle-counting basis, fluid condition and applicable standard context are understood. It should be interpreted with the protected component and the cleanliness objective rather than used as a universal pass-or-fail value.',
  },
  'differential-pressure': {
    term: 'Differential Pressure',
    definition: 'Differential pressure is the pressure difference measured between two points in a system. Across a filtration element or housing, that difference can help describe flow resistance and how operating conditions or contaminant loading are affecting the filtration path.',
    context: 'Differential pressure must be interpreted with flow rate, fluid or air properties, temperature, system configuration and the measurement locations. A single pressure difference does not by itself identify the cause of restriction or establish that a filter requires replacement.',
  },
  'depth-filtration': {
    term: 'Depth Filtration',
    definition: 'Depth filtration is a filtration mechanism in which particles are captured through the thickness and internal structure of a porous medium rather than only on its upstream surface. Capture can occur along a distributed path as fluid or air moves through the media structure.',
    context: 'Depth-filtration performance depends on media structure, particle characteristics, flow, loading and the test or application conditions. The term describes a capture architecture; it does not by itself establish efficiency, service life or suitability for a specific system.',
  },
  'kidney-loop': {
    term: 'Kidney Loop Filtration',
    definition: 'Kidney loop filtration is an offline fluid-cleaning arrangement that withdraws fluid from a reservoir, passes it through an independent filtration circuit and returns it to the reservoir. The loop operates separately from the machine’s primary hydraulic or lubrication flow path.',
    context: 'An offline loop can support cleanliness control when its flow rate, filter selection, reservoir turnover, contamination source and operating schedule are matched to the application. It complements rather than replaces contamination exclusion and correct maintenance practices.',
  },
  'soot': {
    term: 'Soot in Engine Lubrication',
    definition: 'Soot is carbon-rich particulate associated with incomplete combustion. In engine lubrication systems, soot can become suspended in the oil and contribute to the contaminant load that the lubricant, dispersant chemistry and filtration system must manage during service.',
    context: 'Soot condition should be interpreted together with engine duty, combustion condition, oil analysis, viscosity behavior, service interval and the filtration system. The presence of soot does not by itself identify the root cause of an engine or lubricant problem.',
  },
  'bearing-clearance': {
    term: 'Bearing Clearance',
    definition: 'Bearing clearance is the designed space between mating bearing surfaces, such as a journal and its bearing, that permits relative motion and supports formation of the intended lubricant film. The required clearance depends on the component design, load, speed, temperature and lubrication regime.',
    context: 'Because bearing clearances can be small relative to contaminant particles, fluid cleanliness and wear debris control matter to component protection. Actual allowable clearances and inspection limits remain specific to the equipment manufacturer and engineering specification.',
  },
  'oil-condition-monitoring': {
    term: 'Oil Condition Monitoring',
    definition: 'Oil condition monitoring is the systematic assessment of lubricant condition, contamination and wear-related evidence over time. It can combine laboratory analysis, field measurements, inspection and trend data to support maintenance decisions for lubricated equipment.',
    context: 'Useful monitoring depends on representative sampling, consistent methods, operating context and trend interpretation. A single result should be evaluated against the machine, lubricant, service history and applicable limits before a filtration or maintenance decision is changed.',
  },
  'bypass-filtration': {
    term: 'Bypass Filtration',
    definition: 'Bypass filtration is a filtration arrangement in which a portion of system flow is diverted through a separate filtration path and then returned to the system or reservoir. Because it does not carry the full primary flow, the bypass path can be engineered for a different filtration duty.',
    context: 'Bypass filtration must be evaluated with diverted flow, pressure conditions, media characteristics, contamination target and return location. It is a supplemental system architecture and should not be assumed to replace the primary full-flow protection required by the equipment design.',
  },
};

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
function clampDescription(text) {
  let value = text.replace(/\s+/g, ' ').trim();
  if (value.length > 160) value = value.slice(0, 157).replace(/\s+\S*$/, '') + '...';
  if (value.length < 120) value += ' Engineering context for contamination control, maintenance and asset-reliability decisions.';
  if (value.length > 160) value = value.slice(0, 157).replace(/\s+\S*$/, '') + '...';
  return value;
}
function appendBeforeMainClose(html, fragment) {
  if (/<\/main>/i.test(html)) return html.replace(/<\/main>/i, `${fragment}</main>`);
  return html.replace(/<\/body>/i, `${fragment}</body>`);
}

let modified = 0;
for (const [slug, profile] of Object.entries(topics)) {
  const file = path.join(glossaryRoot, slug, 'index.html');
  if (!fs.existsSync(file)) {
    console.error(`[normalize-phase5-demand-glossary] Missing glossary output: ${slug}`);
    process.exit(1);
  }
  let html = fs.readFileSync(file, 'utf8');
  const h1 = `${profile.term}: Engineering Definition`;
  const title = `${h1} | ELIMFILTERS`;
  const description = clampDescription(`${profile.term} engineering definition, filtration context, application limits, contamination-control relevance and maintenance interpretation.`);

  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', description);
  html = html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/i, `$1${escapeHtml(h1)}$2`);

  if (!html.includes('data-gsc-demand-direct-answer="true"')) {
    const answer = `<p data-gsc-demand-direct-answer="true">${escapeHtml(profile.definition)}</p>`;
    html = html.replace(/(<\/h1>)/i, `$1${answer}`);
  }

  if (!html.includes('data-gsc-demand-glossary-depth="true"')) {
    const section = `<section data-gsc-demand-glossary-depth="true" aria-label="${escapeHtml(profile.term)} engineering context">
<h2>Engineering context</h2>
<p>${escapeHtml(profile.context)}</p>
<h2>How to use this term</h2>
<p>${escapeHtml(`Use ${profile.term.toLowerCase()} as part of a documented engineering decision. Identify the protected system, operating duty, contamination mechanism and the measurement or inspection evidence available. Then compare that evidence with the applicable system requirement or standard before changing a filtration specification, service interval or maintenance action.`)}</p>
<h2>Related technical paths</h2>
<p>Explore the <a href="/knowledge-center/engineering-reference/">Engineering Reference</a> for underlying principles and measurements, the <a href="/knowledge-center/standards/">Standards library</a> for formal test or classification context, and <a href="/systems/">Protection Systems</a> to connect the term to an asset-protection architecture.</p>
</section>`;
    html = appendBeforeMainClose(html, section);
  }

  fs.writeFileSync(file, html);
  modified += 1;
}

console.log(`[normalize-phase5-demand-glossary] PASS — ${modified}/${Object.keys(topics).length} GSC-priority glossary topics strengthened`);
