export interface IndustrialProcessTechnology {
  slug: string;
  name: string;
  title: string;
  branded: boolean;
  technologyCore: string | readonly string[];
  summary: string;
  treatmentFunction: string;
  mechanisms: readonly string[];
  applications: readonly string[];
  conditions: readonly string[];
  selectionInputs: readonly string[];
  serviceSignals: readonly string[];
  heroImage: string;
  mediaImage: string;
  heroVideo?: string;
  subfamilies?: readonly string[];
}

export interface IndustrialProcessPlatform {
  slug: string;
  name: string;
  descriptor: string;
  summary: string;
  heroImage: string;
  heroVideo?: string;
  mediaImage?: string;
  technologies: readonly IndustrialProcessTechnology[];
}

const commonSelection = [
  'Process conditions and treatment objective',
  'Flow rate and duty profile',
  'Operating and design pressure',
  'Temperature and fluid, gas, air or water composition',
  'Contaminant type, concentration and loading pattern',
  'Required outlet condition or cleanliness target',
  'Materials, chemical compatibility and connection constraints',
  'Existing housing, vessel or process equipment',
] as const;

const tech = (
  slug: string,
  name: string,
  title: string,
  branded: boolean,
  technologyCore: string | readonly string[],
  summary: string,
  treatmentFunction: string,
  mechanisms: readonly string[],
  applications: readonly string[],
  conditions: readonly string[],
  serviceSignals: readonly string[],
  heroImage: string,
  mediaImage: string,
  subfamilies?: readonly string[],
  heroVideo?: string,
): IndustrialProcessTechnology => ({
  slug,
  name,
  title,
  branded,
  technologyCore,
  summary,
  treatmentFunction,
  mechanisms,
  applications,
  conditions,
  selectionInputs: commonSelection,
  serviceSignals,
  heroImage,
  mediaImage,
  heroVideo,
  subfamilies,
});

export const INDUSTRIAL_PROCESS_PLATFORMS: readonly IndustrialProcessPlatform[] = [
  {
    slug: 'aeremis',
    name: 'AEREMIS™',
    descriptor: 'Air Technologies',
    summary: 'Industrial air treatment for ventilation, critical environments and molecular contamination control.',
    heroImage: '/images/air-filters-lab.avif',
    heroVideo: '/images/Air%20Industrial-aviation%20(1).mp4',
    mediaImage: '/images/air%20industrial.jpg',
    technologies: [
      tech(
        'general-air-filtration',
        'General Air Filtration',
        'General Air Filtration',
        false,
        'TC-AIR-01',
        'Particulate filtration for industrial ventilation, make-up air and general air-handling duties.',
        'Control airborne particulate before it reaches occupied spaces, equipment rooms or downstream air-treatment stages.',
        ['Prefiltration and staged particulate capture', 'Media selection by dust loading and allowable pressure drop', 'Configuration around the existing air-handling system'],
        ['General ventilation', 'Make-up air systems', 'Equipment-room air handling', 'Upstream particulate prefiltration'],
        ['Variable outdoor-air dust loading', 'Continuous or intermittent ventilation duty', 'Space and service-access constraints', 'Pressure-drop limits across the air-handling system'],
        ['Unexpected pressure-drop rise', 'Visible dust downstream', 'Short service intervals', 'Bypass or sealing evidence'],
        '/images/air-filters-lab.avif',
        '/images/General%20Air%20Filtration.png',
        undefined,
        '/images/general%20filters%20(1).mp4',
      ),
      tech(
        'he-criva',
        'HE-CRIVA™',
        'High-Efficiency / Critical Air Filtration',
        true,
        'TC-AIR-02',
        'High-efficiency particulate control for critical and high-cleanliness air applications.',
        'Reduce fine airborne particulate where the required cleanliness level is more demanding than general ventilation duty.',
        ['High-efficiency particulate media', 'Staged prefiltration to protect final stages', 'Seal and bypass control at the filter and housing interface'],
        ['Critical ventilation', 'Controlled production environments', 'Final-stage particulate filtration', 'High-cleanliness air handling'],
        ['Defined cleanliness requirement', 'Fine-particle challenge', 'Strict bypass control', 'Final-stage pressure-drop sensitivity'],
        ['Unexpected cleanliness loss', 'Premature final-stage loading', 'Seal or frame leakage', 'Pressure drop outside expected trend'],
        '/images/air-filters-lab.avif',
        '/images/HE-CRIVA.png',
      ),
      tech(
        'ma-trea',
        'MA-TREA™',
        'Molecular Air Treatment',
        true,
        'TC-AIR-03',
        'Molecular-phase air treatment using media selected for the target gas, vapor or odor challenge.',
        'Treat molecular contaminants that are not resolved by particulate filtration alone.',
        ['Adsorptive media treatment', 'Media selection around target contaminant chemistry', 'Contact-time and loading evaluation'],
        ['Industrial odor control', 'Corrosive-gas mitigation', 'Process ventilation polishing', 'Molecular contamination control'],
        ['Known contaminant chemistry', 'Variable concentration and humidity', 'Required contact time', 'Media exhaustion and replacement planning'],
        ['Odor or gas breakthrough', 'Accelerated media exhaustion', 'Unstable outlet quality', 'Unexpected humidity sensitivity'],
        '/images/air-filters-lab.avif',
        '/images/planta_converted.avif',
      ),
    ],
  },
  {
    slug: 'partion',
    name: 'PARTION™',
    descriptor: 'Dust & Fume Technologies',
    summary: 'Fine-dust and fume control for demanding industrial processes and production environments.',
    heroImage: '/images/planta_converted.avif',
    technologies: [
      tech(
        'fumevra',
        'FUMEVRA™',
        'Fine Dust & Fume Filtration',
        true,
        'TC-DUST-01',
        'Fine-dust and fume filtration for process exhaust, production capture and demanding particulate loads.',
        'Capture process-generated fine particulate and fume before recirculation, discharge or downstream treatment.',
        ['Surface and depth filtration selected by particle behavior', 'Cleanable-media evaluation where duty requires it', 'Dust-loading and pressure-drop management'],
        ['Process dust collection', 'Fine particulate capture', 'Fume extraction systems', 'Production exhaust filtration'],
        ['Fine or mixed particle-size loading', 'Continuous production duty', 'Pulse-cleaning or replacement strategy', 'Temperature and aerosol exposure'],
        ['Rapid differential-pressure increase', 'Visible emissions downstream', 'Poor cleaning recovery', 'Unexpected media damage or blinding'],
        '/images/planta_converted.avif',
        '/images/dossier-filters.avif',
      ),
    ],
  },
  {
    slug: 'coalvex',
    name: 'COALVEX™',
    descriptor: 'Gas Conditioning Technologies',
    summary: 'Gas-stream conditioning for liquid aerosol control, coalescence and separation duties.',
    heroImage: '/images/oil&gas.avif',
    technologies: [
      tech(
        'coaleris',
        'COALERIS™',
        'Gas Coalescence',
        true,
        'TC-NG-01',
        'Coalescing treatment for liquid aerosols and fine droplets carried in process or natural-gas streams.',
        'Promote droplet capture and coalescence so entrained liquid can be separated from the gas stream.',
        ['Fine aerosol capture', 'Droplet coalescence and drainage', 'Media and vessel selection around gas conditions'],
        ['Natural-gas conditioning', 'Compressor protection', 'Gas transmission and distribution', 'Process-gas aerosol control'],
        ['Gas composition and pressure', 'Aerosol size and liquid loading', 'Flow turndown', 'Drainage and vessel orientation'],
        ['Liquid carryover downstream', 'Unexpected pressure-drop rise', 'Poor drainage', 'Short element life'],
        '/images/oil&gas.avif',
        '/images/separator-elimf.avif',
      ),
      tech(
        'gas-liquid-separation',
        'Gas-Liquid Separation',
        'Gas-Liquid Separation',
        false,
        'TC-NG-02',
        'Bulk and intermediate gas-liquid separation for free liquid, larger droplets and process carryover.',
        'Separate free liquid and entrained droplets from a gas stream before finer coalescing or downstream equipment.',
        ['Inertial separation', 'Droplet disengagement', 'Vessel and internals selection around flow and liquid loading'],
        ['Natural-gas separation', 'Knockout and pre-separation duties', 'Compressor upstream protection', 'Process-gas conditioning'],
        ['Variable gas and liquid flow', 'Slug or intermittent liquid loading', 'Pressure and temperature range', 'Available vessel residence and disengagement space'],
        ['Liquid carryover', 'Flooding or poor drainage', 'Unstable separation at turndown', 'Unexpected downstream liquid loading'],
        '/images/oil&gas.avif',
        '/images/planta_converted.avif',
      ),
    ],
  },
  {
    slug: 'flurexis',
    name: 'FLUREXIS™',
    descriptor: 'Fluid Conditioning Technologies',
    summary: 'Contamination, water and degradation-product control for hydraulic and lubrication systems.',
    heroImage: '/images/oil-hand.avif',
    technologies: [
      tech(
        'hyltris',
        'HYLTRIS™',
        'Hydraulic Fluid Filtration',
        true,
        'TC-HYD-01',
        'Hydraulic-fluid particulate control for industrial fluid-power systems.',
        'Control solid contamination in hydraulic circuits according to component sensitivity, duty and cleanliness objectives.',
        ['Pressure, return and offline filtration architectures', 'Particle capture selected around cleanliness target', 'Element and housing compatibility validation'],
        ['Hydraulic power units', 'Industrial presses and machinery', 'Servo and proportional systems', 'Offline kidney-loop filtration'],
        ['Sensitive hydraulic components', 'Variable flow and pressure', 'Cold-start viscosity effects', 'Target cleanliness and ingression rate'],
        ['Recurring valve or pump contamination', 'Short element life', 'Abnormal differential pressure', 'Cleanliness that does not recover as expected'],
        '/images/hidraulic.avif',
        '/images/hidraulic.avif',
      ),
      tech(
        'lubreva',
        'LUBREVA™',
        'Industrial Lubrication Filtration',
        true,
        'TC-LUB-01',
        'Lubricating-oil cleanliness control for industrial rotating and lubricated equipment.',
        'Control solid contamination in lubrication circuits while respecting oil viscosity, flow and equipment requirements.',
        ['Full-flow and offline filtration', 'Depth or surface media selection by contamination load', 'Conditioning around viscosity and operating temperature'],
        ['Gearboxes', 'Turbine lubrication systems', 'Circulating-oil systems', 'Industrial bearing lubrication'],
        ['Oil viscosity and temperature range', 'Wear-debris generation', 'Continuous circulation duty', 'Equipment cleanliness sensitivity'],
        ['Accelerated wear debris', 'Short filter intervals', 'Persistent contamination trend', 'Restriction outside expected behavior'],
        '/images/oil-hand.avif',
        '/images/elementos-oil.avif',
      ),
      tech(
        'dewatis',
        'DEWATIS™',
        'Oil Dehydration & Water Removal',
        true,
        'TC-OIL-01',
        'Water-removal treatment for industrial oils where free, emulsified or dissolved water affects fluid condition.',
        'Reduce water contamination using a dehydration method selected for the water form, oil properties and operating conditions.',
        ['Free-water separation', 'Dehydration and mass-transfer treatment', 'Offline conditioning and recirculation'],
        ['Hydraulic reservoirs', 'Lubrication-oil systems', 'Turbine oils', 'Stored or contaminated industrial oils'],
        ['Water form and concentration', 'Oil type and viscosity', 'Operating temperature', 'Required final moisture condition'],
        ['Water level does not decline as expected', 'Rapid water re-entry', 'Emulsion persistence', 'Fluid condition remains unstable after treatment'],
        '/images/oil-hand.avif',
        '/images/oilfilvw.avif',
      ),
      tech(
        'oilrevex',
        'OILREVEX™',
        'Oil Condition Remediation',
        true,
        'TC-OIL-02',
        'Conditioning for selected oil degradation products and contamination that are not resolved by conventional particulate filtration alone.',
        'Address targeted oil-condition problems through media and treatment architecture selected from fluid analysis and operating evidence.',
        ['Targeted adsorption and remediation media', 'Offline recirculation treatment', 'Fluid-condition verification before and after treatment'],
        ['Industrial lubrication systems', 'Turbine and circulating oils', 'Hydraulic systems with degradation-product concerns', 'Condition-based remediation programs'],
        ['Confirmed fluid degradation mechanism', 'Fluid chemistry and additive compatibility', 'Contamination trend', 'Required treatment endpoint'],
        ['Condition indicators do not improve', 'Rapid contaminant rebound', 'Media exhausts unexpectedly', 'Fluid compatibility concerns emerge'],
        '/images/oil-hand.avif',
        '/images/grupo1-oil.avif',
      ),
    ],
  },
  {
    slug: 'aquvexis',
    name: 'AQUVEXIS™',
    descriptor: 'Water Treatment Technologies',
    summary: 'Industrial water treatment through particulate, adsorption, membrane and ionic separation mechanisms.',
    heroImage: '/images/turbine-plant.avif',
    technologies: [
      tech(
        'depth-filtration',
        'Depth Filtration',
        'Depth Filtration',
        false,
        'TC-WAT-01',
        'Particulate removal through depth-media structures selected around solids loading and water-quality objectives.',
        'Capture suspended solids through the thickness of the media as a pretreatment or standalone particulate-control stage.',
        ['Graded depth capture', 'Cartridge or media-bed configuration', 'Prefiltration ahead of downstream treatment'],
        ['Industrial water pretreatment', 'Process-water clarification support', 'Membrane protection', 'Utility-water particulate control'],
        ['Feed-water solids loading', 'Particle-size distribution', 'Flow and pressure-drop limits', 'Downstream sensitivity'],
        ['Rapid plugging', 'Solids breakthrough', 'Uneven loading', 'Downstream fouling persists'],
        '/images/turbine-plant.avif',
        '/images/planta_converted.avif',
      ),
      tech(
        'adsovex',
        'ADSOVEX™',
        'Adsorptive Carbon Treatment',
        true,
        'TC-WAT-03',
        'Adsorptive carbon treatment for selected dissolved organics, residual oxidants and water-quality conditioning duties.',
        'Use carbon media to adsorb target constituents identified in the water analysis and treatment objective.',
        ['Activated-carbon adsorption', 'Media selection around contaminant profile', 'Contact-time and exhaustion management'],
        ['Industrial water pretreatment', 'Process-water polishing', 'Membrane pretreatment', 'Selected odor and organic reduction duties'],
        ['Known target constituent', 'Feed-water concentration', 'Required contact time', 'Competing contaminants and media exhaustion'],
        ['Early breakthrough', 'Unexpected media exhaustion', 'Outlet quality drifts', 'Downstream treatment remains unstable'],
        '/images/turbine-plant.avif',
        '/images/planta_converted.avif',
      ),
      tech(
        'membravex',
        'MEMBRAVEX™',
        'Membrane Separation',
        true,
        ['TC-WAT-04', 'TC-WAT-05', 'TC-WAT-06'],
        'Membrane separation architecture spanning reverse osmosis, ultrafiltration and nanofiltration treatment paths.',
        'Separate dissolved or suspended constituents using membrane processes selected from feed-water analysis and product-water requirements.',
        ['Pressure-driven membrane separation', 'Pretreatment and fouling-control architecture', 'Recovery, rejection and cleaning strategy by project'],
        ['Process-water treatment', 'Reuse and recovery systems', 'Utility-water conditioning', 'High-quality feed-water preparation'],
        ['Feed-water analysis and fouling potential', 'Required permeate quality', 'Recovery target', 'Cleaning and pretreatment strategy'],
        ['Permeate quality deteriorates', 'Normalized pressure demand rises', 'Recovery declines', 'Cleaning frequency becomes excessive'],
        '/images/turbine-plant.avif',
        '/images/planta_converted.avif',
        ['Reverse Osmosis', 'Ultrafiltration', 'Nanofiltration'],
      ),
      tech(
        'ionvexa',
        'IONVEXA™',
        'Ion Exchange',
        true,
        'TC-WAT-07',
        'Ion-exchange treatment for selective ionic removal and water conditioning.',
        'Exchange target ions using resin chemistry selected around feed-water composition and required outlet quality.',
        ['Cation and anion exchange', 'Selective resin treatment', 'Regeneration or service-cycle design'],
        ['Water softening', 'Demineralization trains', 'Process-water conditioning', 'Pretreatment and polishing'],
        ['Feed-water ionic composition', 'Target ions and outlet requirement', 'Resin capacity and regeneration strategy', 'Competing ions and fouling risk'],
        ['Short service cycle', 'Hardness or ion leakage', 'Poor regeneration recovery', 'Outlet quality varies unexpectedly'],
        '/images/turbine-plant.avif',
        '/images/planta_converted.avif',
      ),
      tech(
        'electrodeionization',
        'Electrodeionization',
        'Electrodeionization',
        false,
        'TC-WAT-08',
        'Electrically assisted ionic polishing used within suitably pretreated high-purity water systems.',
        'Reduce residual ionic species through a continuous electro-driven ion-removal stage after appropriate upstream treatment.',
        ['Ion-exchange media', 'Ion-selective membranes', 'Applied electrical potential for continuous ionic transport'],
        ['High-purity water polishing', 'Post-membrane deionization', 'Industrial utility-water systems', 'Process-water final conditioning'],
        ['Stable pretreated feed quality', 'Residual ionic load', 'Electrical and hydraulic operating window', 'Scaling and fouling control'],
        ['Product-water resistivity or conductivity drifts', 'Pressure drop rises', 'Current demand changes unexpectedly', 'Scaling or fouling evidence develops'],
        '/images/turbine-plant.avif',
        '/images/planta_converted.avif',
      ),
    ],
  },
] as const;

export function getIndustrialProcessPlatform(slug: string) {
  return INDUSTRIAL_PROCESS_PLATFORMS.find((platform) => platform.slug === slug);
}

export function getIndustrialProcessTechnology(platformSlug: string, technologySlug: string) {
  return getIndustrialProcessPlatform(platformSlug)?.technologies.find((technology) => technology.slug === technologySlug);
}

export function industrialProcessPlatformUrl(platformSlug: string) {
  return `/industrial-process/${platformSlug}/`;
}

export function industrialProcessTechnologyUrl(platformSlug: string, technologySlug: string) {
  return `/industrial-process/${platformSlug}/${technologySlug}/`;
}
