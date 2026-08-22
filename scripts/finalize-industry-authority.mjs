import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const industryRoot = path.join(root, 'frontend', 'out', 'industries');

if (!fs.existsSync(industryRoot)) {
  console.error('[finalize-industry-authority] frontend/out/industries is missing');
  process.exit(1);
}

const industries = {
  agriculture: {
    label: 'Agriculture',
    verification: 'Application verification should connect seasonal operating windows with actual dust exposure, intake sealing, hydraulic cleanliness, fuel handling and service access. A machine that works through planting or harvest can accumulate contamination very differently from the same model used intermittently. Selection therefore needs evidence from the protected system, duty cycle and maintenance environment, not only a cross-reference. Review element loading, clean-side condition, reservoir and transfer practices, and any recurring contamination pattern before changing service intervals.'
  },
  automotive: {
    label: 'Automotive',
    verification: 'Application verification should connect route profile, engine duty, airflow demand, fuel-system sensitivity, lubricant condition, cooling-system condition and cabin environment. Urban stop-start service, highway operation and mixed commercial duty do not create the same contamination pattern. Selection therefore needs the actual vehicle configuration and service evidence. Review intake sealing, fuel quality, oil condition, cooling-system cleanliness and cabin airflow together when recurring loading or shortened service life appears.'
  },
  'bus-coach': {
    label: 'Bus & Coach',
    verification: 'Application verification should connect route continuity with engine load, stop-start frequency, pneumatic demand, fuel quality, cabin-air exposure and depot maintenance windows. Public transit, school transportation and intercity service impose different contamination and service patterns. Review intake sealing, fuel and oil condition, air-dryer performance and cabin airflow as one reliability program so repeated replacement does not hide an upstream source or route-specific operating condition.'
  },
  construction: {
    label: 'Construction',
    verification: 'Application verification should connect jobsite dust severity, engine airflow, hydraulic component sensitivity, reservoir practices, fuel handling, pressure cycling and maintenance access. Dust concentration and hydraulic exposure can change sharply between excavation, grading, loading and demolition work. Review clean-side intake condition, hydraulic service practices, abnormal differential pressure, recurring particle ingress and fuel-storage discipline before shortening replacement intervals or changing product selection.'
  },
  manufacturing: {
    label: 'Manufacturing',
    verification: 'Application verification should connect production duty, process contamination, protected-component sensitivity, fluid cleanliness targets, temperature, flow and available maintenance windows. Industrial engines, hydraulic power units and rotating equipment can share a facility while operating under very different contamination boundaries. Review oil-analysis evidence, hydraulic cleanliness, reservoir and breather practices, intake sealing and the production consequence of intervention before defining the protection and service strategy.'
  },
  marine: {
    label: 'Marine',
    verification: 'Application verification should connect fuel source, water contamination risk, marine airflow, engine load, hydraulic sensitivity, vibration and onboard service access. Extended operation and constrained intervention make drainage, sealing and contamination exclusion especially important. Review fuel-water evidence, bowl and seal condition where applicable, clean-side intake integrity, oil condition and hydraulic cleanliness before changing intervals or assuming that repeated loading is only an element-capacity issue.'
  },
  mining: {
    label: 'Mining',
    verification: 'Mining application verification should begin with the actual production environment: abrasive mineral dust, long engine hours, high hydraulic load, vibration, heat, fuel handling and restricted maintenance windows. Haul trucks, excavators, loaders, drills, dozers and support equipment can operate in the same mine while facing different dust concentration, airflow, hydraulic sensitivity and service constraints. The protection strategy therefore has to be mapped by asset and protected system rather than treated as one mine-wide replacement interval.',
    extra: [
      'Air-intake protection in mining must be evaluated around dust concentration, particle character, intake location, sealing integrity, restriction behavior and engine airflow. Repeated dust loading can indicate expected environmental exposure, but abnormal clean-side dust, damaged seals or unusual restriction behavior requires investigation of the entire intake path. Replacing the element without confirming housing, ducting and sealing condition can leave the contamination mechanism active.',
      'Hydraulic protection must be tied to component sensitivity, pressure, flow, reservoir condition and contamination introduced during maintenance. Pumps, valves, actuators and control components can be damaged by particles that circulate through precision clearances. Hose work, reservoir opening, transfer equipment and field repairs can introduce contamination even when the installed filter is functioning correctly. Clean service practice and contamination-source control therefore remain part of the filtration architecture.',
      'Fuel and lubrication protection should be evaluated from storage, transfer, water exposure, engine duty and condition evidence. Remote fuel storage and repeated transfer can introduce water and particulate before fuel reaches the machine. Lubrication systems can accumulate soot, wear debris and degradation products under long high-load operation. Filter condition should be interpreted with fuel quality, oil condition, operating hours and the machine’s observed loading pattern rather than used as an isolated maintenance signal.',
      'Cooling-system protection also matters in severe production duty because heat rejection depends on clean coolant passages, stable chemistry and controlled debris. Mining reliability programs should coordinate air, fuel, lubrication, hydraulic and cooling evidence so maintenance teams can distinguish normal loading from a recurring contamination source. The objective is not to claim that filtration prevents every failure; it is to control avoidable contamination exposure and give maintenance decisions a repeatable technical basis.'
    ]
  },
  'oil-gas': {
    label: 'Oil & Gas',
    verification: 'Application verification should connect site severity, engine or compressor duty, fuel handling, hydraulic sensitivity, temperature, moisture exposure and access limitations. Remote and continuous-duty packages can accumulate contamination differently even within the same field. Review intake sealing, clean transfer practices, hydraulic service, oil condition and recurring loading evidence before changing intervals, because repeated contamination can indicate an upstream environmental or maintenance source.'
  },
  'power-generation': {
    label: 'Power Generation',
    verification: 'Application verification should connect standby or prime duty with fuel-storage duration, water risk, transfer cleanliness, engine airflow, load profile, coolant condition and required readiness. Long idle periods can create hidden contamination conditions that only become visible when load demand occurs. Review stored fuel, water drainage where applicable, intake condition, oil and coolant evidence, and service history before defining replacement intervals for critical generating assets.'
  },
  railway: {
    label: 'Railway',
    verification: 'Application verification should connect route duty, engine load, ambient particulate, fuel handling, pneumatic demand, vibration and planned depot access. Locomotive and support-equipment service windows are structured differently from road fleets. Review intake sealing, fuel cleanliness, oil condition, air-dryer performance and abnormal loading together so maintenance decisions reflect route exposure and system condition rather than a calendar-only replacement pattern.'
  },
  'trucks-fleets': {
    label: 'Trucks & Fleets',
    verification: 'Application verification should connect route, annual hours, engine duty, idle percentage, fuel source, pneumatic demand, climate and fleet maintenance capability. Highway, regional and vocational vehicles can share a chassis while experiencing very different contamination exposure. Standardize clean-side service, fuel and water inspection, oil and coolant review, air-dryer checks and application evidence so intervals remain tied to actual duty and recurring loading can be investigated instead of normalized.'
  },
  'waste-municipal': {
    label: 'Waste & Municipal',
    verification: 'Application verification should connect stop-start frequency, idle time, hydraulic duty, ambient debris, route conditions, fuel handling, cooling demand and operator environment. Refuse and public-works equipment combine engine and hydraulic loading in repetitive urban cycles. Review intake sealing, hydraulic cleanliness, fuel and oil condition, cooling-system evidence and cabin airflow together so recurring contamination is corrected before it becomes a route or public-service interruption.'
  }
};

function escapeHtml(value) {
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

function supplementalSection(profile) {
  const extra = profile.extra?.map((text) => `<p>${escapeHtml(text)}</p>`).join('\n') ?? '';
  return `<section data-industry-authority-final="true" aria-label="${escapeHtml(profile.label)} application verification">
<h2>${escapeHtml(profile.label)} application verification</h2>
<p>${escapeHtml(profile.verification)}</p>
${extra}
<h3>Decision sequence</h3>
<ol data-industry-decision-path="true">
<li>Define the protected asset, system and operating duty.</li>
<li>Identify contamination sources, sensitive components and service constraints.</li>
<li>Map the applicable ELIMFILTERS protection system to the documented application.</li>
<li>Verify flow, pressure, restriction, chemistry, sealing and maintenance requirements as applicable.</li>
<li>Use inspection and service evidence to confirm or revise the protection strategy.</li>
</ol>
<p>Use this sequence as an engineering review path. Cross-reference data can support identification, but the final protection decision should remain connected to the actual machine configuration, operating environment and available application evidence.</p>
</section>`;
}

let modified = 0;
let audited = 0;

for (const [slug, profile] of Object.entries(industries)) {
  const file = path.join(industryRoot, slug, 'index.html');
  if (!fs.existsSync(file)) {
    console.warn(`[finalize-industry-authority] Missing industry output: ${slug}`);
    continue;
  }
  audited += 1;
  let html = fs.readFileSync(file, 'utf8');

  const h1 = `${profile.label} Filtration & Asset Protection`;
  const title = `${h1} | ELIMFILTERS`;
  const description = `${profile.label} filtration and asset-protection engineering for contamination control, protected systems, equipment duty, selection and maintenance decisions.`;

  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', description);
  html = html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/i, `$1${escapeHtml(h1)}$2`);

  if (!html.includes('data-industry-authority-final="true"')) {
    const section = supplementalSection(profile);
    if (/<\/main>/i.test(html)) html = html.replace(/<\/main>/i, `${section}</main>`);
    else html = html.replace(/<\/body>/i, `${section}</body>`);
  }

  if (!html.includes('data-industry-main-entity="true"')) {
    const canonical = `https://elimfilters.com/industries/${slug}/`;
    const graph = `<script type="application/ld+json" data-industry-main-entity="true">${JSON.stringify({
      '@context': 'https://schema.org',
      '@id': `${canonical}#industry-page`,
      mainEntity: {
        '@type': 'Thing',
        '@id': `${canonical}#industry-protection-topic`,
        name: `${profile.label} filtration and asset protection`
      }
    })}</script>`;
    html = html.replace(/<\/body>/i, `${graph}</body>`);
  }

  fs.writeFileSync(file, html);
  modified += 1;
}

if (audited !== 12) {
  console.error(`[finalize-industry-authority] Expected 12 industries, found ${audited}`);
  process.exit(1);
}

console.log(`[finalize-industry-authority] PASS — ${modified}/${audited} industry pages finalized for H1 intent, structured decision path, topical depth and entity linkage`);
