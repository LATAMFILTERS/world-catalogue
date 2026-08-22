import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const techRoot = path.join(root, 'frontend', 'out', 'technologies');

const profiles = {
  macrocore: { name: 'MACROCORE™', role: 'engine air-intake filtration', purpose: 'controls airborne particulate before it reaches the protected engine air-intake path' },
  microkappa: { name: 'MICROKAPPA™', role: 'cabin-air filtration', purpose: 'supports particulate control and airflow management in operator and passenger HVAC applications' },
  drycore: { name: 'DRYCORE™', role: 'air-dryer protection', purpose: 'supports moisture control in approved compressed-air and pneumatic applications' },
  intekcore: { name: 'INTEKCORE™', role: 'air-intake housing integration', purpose: 'supports the housing, element-fit and sealing boundary that protects the clean-air side of an intake system' },
  syntapore: { name: 'SYNTAPORE™', role: 'diesel-fuel filtration', purpose: 'supports particulate control across approved diesel-fuel filtration stages upstream of sensitive fuel-system components' },
  syntrax: { name: 'SYNTRAX™', role: 'lubrication filtration', purpose: 'controls wear debris, soot agglomerates and lubricant contamination across engine lubrication service conditions' },
  nanoforce: { name: 'NANOFORCE™', role: 'hydraulic filtration', purpose: 'supports fluid-cleanliness control around the tolerance requirements of sensitive hydraulic components' },
  thermacore: { name: 'THERMACORE™', role: 'cooling-system protection', purpose: 'supports coolant cleanliness and contamination control within approved heavy-duty cooling-system maintenance strategies' },
  hydrocore: { name: 'HYDROCORE™', role: 'fuel-water separation', purpose: 'supports removal of water contamination ahead of downstream diesel-fuel filtration stages in approved applications' },
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

let audited = 0;
let modified = 0;

for (const [slug, profile] of Object.entries(profiles)) {
  const file = path.join(techRoot, slug, 'index.html');
  if (!fs.existsSync(file)) {
    console.error(`[normalize-phase4-technologies] Missing canonical technology output: ${slug}`);
    process.exit(1);
  }
  audited += 1;
  let html = fs.readFileSync(file, 'utf8');

  const h1 = `${profile.name} Filtration Technology & Asset Protection`;
  const title = `${h1} | ELIMFILTERS`;
  const description = `${profile.name} ${profile.role} technology for contamination control, system integration, application selection, engineering review and asset-protection decisions.`;

  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', description);
  html = html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/i, `$1${escapeHtml(h1)}$2`);

  if (!html.includes('data-technology-direct-answer="true"')) {
    const answer = `<p data-technology-direct-answer="true">${escapeHtml(`${profile.name} is an ELIMFILTERS ${profile.role} technology that ${profile.purpose}. Its engineering role is evaluated within the complete protection system, including operating duty, contamination exposure, flow or restriction conditions, sealing integrity, maintenance requirements and validated application evidence.`)}</p>`;
    html = html.replace(/(<\/h1>)/i, `$1${answer}`);
  }

  if (!html.includes('data-technology-authority-path="true"')) {
    const section = `<section data-technology-authority-path="true" aria-label="${escapeHtml(profile.name)} application decision path">
<h2>${escapeHtml(profile.name)} application decision path</h2>
<p>${escapeHtml(`Application of ${profile.name} begins with the protected system and operating condition rather than with a technology name alone. Confirm the equipment configuration, contamination mechanism, required filtration or separation function, flow and pressure conditions, service environment and maintenance access before resolving the appropriate product family or part number.`)}</p>
<ol>
<li>Define the protected asset, system boundary and operating duty.</li>
<li>Identify the contamination mechanism and the components most sensitive to it.</li>
<li>Verify the filtration, separation, housing or airflow function required by the application.</li>
<li>Confirm flow, restriction, pressure, sealing, chemistry and service constraints where applicable.</li>
<li>Use validated application and service evidence to select the corresponding ELIMFILTERS product family or part.</li>
</ol>
<p>${escapeHtml(`${profile.name} should therefore be treated as an engineering technology within an asset-protection architecture, not as a universal performance claim. Product-level values and compatibility remain specific to the validated element, assembly and application data associated with the selected part.`)}</p>
</section>`;
    if (/<\/main>/i.test(html)) html = html.replace(/<\/main>/i, `${section}</main>`);
    else html = html.replace(/<\/body>/i, `${section}</body>`);
  }

  fs.writeFileSync(file, html);
  modified += 1;
}

if (audited !== 9) {
  console.error(`[normalize-phase4-technologies] Expected 9 canonical technologies, found ${audited}`);
  process.exit(1);
}

console.log(`[normalize-phase4-technologies] PASS — ${modified}/${audited} canonical technology pages normalized for intent, direct answer, metadata and application authority`);
