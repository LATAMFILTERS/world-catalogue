import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const industryRoot = path.join(root, 'frontend', 'out', 'industries');

if (!fs.existsSync(industryRoot)) {
  console.error('[normalize-industry-authority] frontend/out/industries is missing');
  process.exit(1);
}

const profiles = {
  agriculture: {
    label: 'Agriculture',
    environment: 'field operations with soil dust, crop residue, thermal load, vibration, variable fuel quality and compressed seasonal service windows',
    assets: 'tractors, combines, harvesters, sprayers, irrigation engines and field-support equipment',
    risks: 'fine mineral dust ingestion, organic debris, moisture, fuel contamination, lubricant degradation and hydraulic particle ingress',
    systems: 'air intake, fuel cleanliness, lubrication, hydraulic and operator-air protection where the application requires it',
    selection: 'ambient dust concentration, engine airflow, hydraulic sensitivity, fuel-storage discipline, duty cycle and the practical service window available during planting or harvest',
    maintenance: 'service discipline should protect clean-side interfaces, verify sealing after element changes, inspect abnormal loading patterns and coordinate filter service with oil, fuel and hydraulic cleanliness evidence',
  },
  automotive: {
    label: 'Automotive',
    environment: 'urban traffic, highway duty, mixed routes, repeated start-stop operation, road dust, heat, humidity and frequent service cycles',
    assets: 'passenger vehicles, light commercial vehicles, delivery fleets, service vans, diesel engines and cabin-air systems',
    risks: 'road particulate, soot loading, fuel contamination, lubricant byproducts, humidity and cabin-air exposure',
    systems: 'air intake, fuel cleanliness, lubrication, cooling and cabin-air protection according to vehicle configuration and duty',
    selection: 'vehicle application, engine duty, airflow demand, fuel-system sensitivity, oil service interval, cabin environment and operating route',
    maintenance: 'service planning should coordinate filter condition with oil condition, fuel quality, intake sealing, cooling-system condition and cabin airflow rather than treating each element as an isolated commodity',
  },
  'bus-coach': {
    label: 'Bus & Coach',
    environment: 'urban transit, school transportation, intercity and shuttle service with stop-and-go cycles, long daily hours, heat, soot and passenger-service demand',
    assets: 'urban buses, school buses, intercity coaches, shuttle fleets, diesel engines, pneumatic brake circuits and passenger cabin systems',
    risks: 'urban particulate, soot, fuel contamination, moisture in compressed-air circuits, lubricant stress and cabin-air loading',
    systems: 'air intake, fuel cleanliness, lubrication, compressed-air drying and cabin-air protection according to fleet configuration',
    selection: 'route profile, daily operating hours, brake-air duty, engine load, fuel quality, cabin-air demand and planned depot service windows',
    maintenance: 'fleet service should combine intake sealing, fuel cleanliness, oil condition, air-dryer performance and cabin airflow checks so route availability is protected as a system-level objective',
  },
  construction: {
    label: 'Construction',
    environment: 'active jobsites with abrasive mineral dust, vibration, heat, pressure cycling, idle periods and severe off-road duty',
    assets: 'excavators, wheel loaders, bulldozers, motor graders, compactors, cranes and articulated dump trucks',
    risks: 'silica and mineral dust ingestion, hydraulic particle ingress, fuel contamination, pressure spikes, heat and lubricant degradation',
    systems: 'air intake, fuel cleanliness, lubrication, hydraulic and cooling-system protection according to machine architecture',
    selection: 'jobsite dust severity, engine airflow, hydraulic component sensitivity, reservoir practices, fuel handling, pressure and temperature conditions and maintenance access',
    maintenance: 'service discipline should emphasize clean hose and reservoir work, protected clean-side intake service, differential-pressure investigation and contamination-source correction before simply shortening filter intervals',
  },
  manufacturing: {
    label: 'Manufacturing',
    environment: 'continuous plant operation with process dust, metal particles, heat, vibration, pressure cycling and production schedules that limit maintenance windows',
    assets: 'industrial engines, hydraulic power units, compressors, pumps, conveyors, rotating machinery and production-line support equipment',
    risks: 'process particulate, lubricant degradation, hydraulic contamination, coolant mist, fuel impurities and contamination introduced during maintenance',
    systems: 'air intake, lubrication, hydraulic, fuel-cleanliness and cooling protection where engine-driven or fluid-power assets require them',
    selection: 'production duty, protected-component sensitivity, process contamination, fluid cleanliness targets, operating temperature, flow conditions and maintenance access',
    maintenance: 'reliability programs should connect filter condition with oil analysis, hydraulic cleanliness, reservoir and breather practices, intake sealing and the production consequences of planned versus unplanned intervention',
  },
  marine: {
    label: 'Marine',
    environment: 'commercial and offshore operation with salt atmosphere, humidity, vibration, extended engine hours, variable fuel quality and constrained service access',
    assets: 'commercial vessels, workboats, fishing fleets, offshore support vessels, marine diesel engines, steering systems and deck machinery',
    risks: 'fuel-water contamination, airborne salt, moisture, corrosion products, hydraulic particle ingress and lubricant degradation during long duty cycles',
    systems: 'fuel-water separation, fuel cleanliness, air intake, lubrication and hydraulic protection, with cooling protection where the application requires it',
    selection: 'fuel source, water contamination risk, engine load, marine airflow conditions, hydraulic sensitivity, vibration, service interval and onboard drainage and inspection access',
    maintenance: 'marine service should include controlled water drainage, seal and bowl inspection, clean-side protection, fuel-source investigation and coordinated oil and hydraulic cleanliness checks to reduce unscheduled port or offshore intervention',
  },
  'oil-gas': {
    label: 'Oil & Gas',
    environment: 'remote, corrosive and continuous-duty energy operations with airborne particulate, moisture, heat, pressure cycling and constrained service windows',
    assets: 'drilling support equipment, compressors, pumps, generators, hydraulic power units, engine-driven packages and offshore support assets',
    risks: 'dust and salt ingress, fuel contamination, hydraulic particles, moisture, lubricant degradation and contamination introduced during field maintenance',
    systems: 'air intake, fuel cleanliness, lubrication, hydraulic and cooling protection according to the equipment package and operating environment',
    selection: 'location severity, engine or compressor duty, fuel handling, hydraulic sensitivity, operating temperature, access limitations and the economic consequence of intervention',
    maintenance: 'maintenance strategy should prioritize contamination exclusion, clean transfer practices, controlled hydraulic service, intake sealing and condition evidence that supports intervention before contamination becomes a production or reliability event',
  },
  'power-generation': {
    label: 'Power Generation',
    environment: 'standby, prime and continuous engine-driven generation with long idle periods, sudden load acceptance, heat, fuel-storage exposure and critical availability requirements',
    assets: 'standby generator sets, prime-power systems, industrial diesel engines, day tanks, fuel-transfer systems and auxiliary cooling circuits',
    risks: 'stored-fuel contamination, water, oxidation products, dust ingestion, lubricant degradation and cooling-system contamination',
    systems: 'fuel cleanliness, fuel-water separation, air intake, lubrication and cooling-system protection',
    selection: 'standby versus prime duty, fuel storage duration, transfer cleanliness, engine airflow, load profile, coolant condition and the required readiness level of the generating asset',
    maintenance: 'service planning should verify stored-fuel condition, drain water where applicable, protect clean-side interfaces, coordinate oil and coolant condition and confirm that long idle periods have not created hidden contamination risk before load demand occurs',
  },
  railway: {
    label: 'Railway',
    environment: 'locomotive and railway support operation with vibration, long duty cycles, airborne particulate, thermal variation and limited opportunities for unscheduled maintenance',
    assets: 'locomotive engines, auxiliary power units, pneumatic systems, hydraulic equipment and railway maintenance assets',
    risks: 'dust ingestion, fuel contamination, lubricant degradation, moisture in pneumatic circuits and contamination introduced through extended service intervals',
    systems: 'air intake, fuel cleanliness, lubrication, compressed-air drying and hydraulic protection according to locomotive and support-equipment architecture',
    selection: 'route duty, engine load, ambient particulate, fuel handling, pneumatic demand, service interval and access during planned terminal or depot maintenance',
    maintenance: 'railway service should connect intake sealing, fuel cleanliness, oil condition, air-dryer performance and evidence of abnormal loading to protect availability across long route and depot cycles',
  },
  'trucks-fleets': {
    label: 'Trucks & Fleets',
    environment: 'heavy-duty highway, regional, vocational and mixed fleet operation with high annual hours, dust, fuel variability, soot loading and repeated service cycles',
    assets: 'heavy-duty trucks, vocational vehicles, diesel engines, fuel systems, lubrication circuits, cooling systems and driver cabin environments',
    risks: 'road dust, fuel contamination, water, soot agglomerates, lubricant degradation, coolant contamination and cabin particulate',
    systems: 'air intake, fuel cleanliness, lubrication, cooling, air-dryer and cabin-air protection according to vehicle configuration',
    selection: 'route, annual hours, engine duty, fuel source, idle percentage, service interval, pneumatic demand, climate and fleet maintenance capability',
    maintenance: 'fleet programs should standardize clean-side service, fuel and water inspection, oil and coolant condition review, air-dryer checks and application evidence so replacement intervals are governed by duty rather than by habit alone',
  },
  'waste-municipal': {
    label: 'Waste & Municipal',
    environment: 'refuse collection, utility and public-works duty with repeated stop-start cycles, idling, hydraulic actuation, urban dust, debris and long daily operating windows',
    assets: 'refuse trucks, municipal service vehicles, utility fleets, street-maintenance equipment and public-works machinery',
    risks: 'urban particulate, organic debris, hydraulic contamination, soot loading, fuel contamination, heat and repeated pressure cycling',
    systems: 'air intake, fuel cleanliness, lubrication, hydraulic, cooling and cabin-air protection according to vehicle and equipment configuration',
    selection: 'stop-start frequency, hydraulic duty, engine idle time, ambient debris, route conditions, fuel handling, operator environment and municipal service interval',
    maintenance: 'service programs should coordinate engine and hydraulic cleanliness, intake sealing, cooling condition, cabin airflow and evidence from repeated duty cycles to prevent small contamination problems from becoming route or public-service interruptions',
  },
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

function descriptionFor(profile) {
  return `${profile.label} filtration and asset-protection engineering for contamination control, protected systems, equipment duty, selection and maintenance decisions.`;
}

function authoritySection(profile) {
  const p = (text) => `<p>${escapeHtml(text)}</p>`;
  return `<section data-industry-authority="true" aria-label="${escapeHtml(profile.label)} filtration authority guidance">
<h2>${escapeHtml(profile.label)} asset-protection engineering</h2>
${p(`${profile.label} filtration strategy begins with the operating environment, not with a filter number. Typical applications operate in ${profile.environment}. The engineering objective is to identify where contamination enters, which components are most sensitive, what operating duty changes the risk, and which protection system should control that exposure before performance or service life is affected.`)}
<h3>Critical assets and contamination mechanisms</h3>
${p(`The protected asset set commonly includes ${profile.assets}. These assets can be exposed to ${profile.risks}. The practical consequence is that contamination control must be treated as an equipment-reliability discipline: the same particle, water or degradation mechanism can create very different consequences depending on component clearance, flow path, pressure, temperature and duty cycle.`)}
<h3>Protection-system map</h3>
${p(`For ${profile.label.toLowerCase()} applications, the relevant architecture can include ${profile.systems}. Not every asset requires every protection system. The correct map is determined from the actual machine configuration and the contamination boundary around each protected component. This prevents overgeneralized selection and keeps product-family and technology choices tied to a documented system role.`)}
<h3>Selection criteria</h3>
${p(`Selection should be resolved from ${profile.selection}. Efficiency or cross-reference alone is not sufficient when flow, restriction, collapse strength, water handling, chemistry, service access or clean-side integrity can materially change performance. The application evidence should therefore connect the operating environment to the protected component, the filtration function and the required service discipline.`)}
<h3>Maintenance and reliability</h3>
${p(`${profile.maintenance}. Abnormal loading, repeated plugging, unexpected differential pressure, water accumulation or recurring contamination should be treated as diagnostic evidence. Replacing an element without identifying the upstream source can restore short-term operation while leaving the underlying contamination mechanism unchanged.`)}
<h3>Engineering decision path</h3>
${p(`A governed ${profile.label.toLowerCase()} filtration decision follows a repeatable path: define the asset and duty; identify contamination sources and sensitive components; map the applicable protection systems; establish selection limits from flow, pressure, chemistry and environment; verify installation and sealing; then use service evidence to confirm that the protection strategy remains appropriate. This creates a technical chain from operating condition to maintenance action rather than a catalogue-only selection process.`)}
<h3>Reliability objective</h3>
${p(`The purpose of this approach is not to claim that filtration removes every failure mode. It is to control preventable contamination exposure within the systems where cleanliness, separation and disciplined service directly support asset reliability. For ${profile.label.toLowerCase()} operators, the useful outcome is a clearer basis for application review, maintenance planning and product identification using evidence from the machine and its operating environment.`)}
</section>`;
}

let modified = 0;
let audited = 0;

for (const [slug, profile] of Object.entries(profiles)) {
  const file = path.join(industryRoot, slug, 'index.html');
  if (!fs.existsSync(file)) continue;
  audited += 1;
  let html = fs.readFileSync(file, 'utf8');

  const title = `${profile.label} Filtration & Asset Protection | ELIMFILTERS`;
  const description = descriptionFor(profile);
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', description);

  if (!html.includes('data-industry-authority="true"')) {
    const section = authoritySection(profile);
    if (/<\/main>/i.test(html)) html = html.replace(/<\/main>/i, `${section}</main>`);
    else html = html.replace(/<\/body>/i, `${section}</body>`);
  }

  fs.writeFileSync(file, html);
  modified += 1;
}

console.log(`[normalize-industry-authority] PASS — ${modified}/${audited} industry pages normalized for metadata, industry-specific depth and decision-path authority`);
