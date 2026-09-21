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
  engineeringNotes?: readonly {
    title: string;
    body: string;
  }[];
  knowledgeCenterSlug?: string;
  customFaqs?: readonly (readonly [string, string])[];
}

export interface IndustrialProcessPlatform {
  slug: string;
  name: string;
  descriptor: string;
  summary: string;
  positioning?: string;
  heroImage: string;
  heroVideo?: string;
  mediaImage?: string;
  selectionGuide?: readonly {
    title: string;
    body: string;
    technologySlug: string;
  }[];
  qualificationGroups?: readonly {
    title: string;
    items: readonly string[];
  }[];
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
    summary: 'Industrial air treatment for general ventilation, high-cleanliness environments and molecular contamination control.',
    positioning: 'AEREMIS™ organizes industrial air treatment by contaminant challenge and required air condition—from general particulate control, through high-efficiency critical-air stages, to molecular treatment for gases, vapors and odors. It is not a single filter or a universal efficiency class; the treatment path follows the air-quality target, contaminant profile, operating envelope and system boundary.',
    heroImage: '/images/air-filters-lab.avif',
    heroVideo: '/images/Air%20Industrial-aviation%20(1).mp4',
    mediaImage: '/images/air%20industrial.jpg',
    selectionGuide: [
      {
        title: 'General particulate control',
        body: 'For industrial ventilation, make-up air and general air-handling duties where the primary challenge is airborne particulate loading and acceptable system pressure drop.',
        technologySlug: 'general-air-filtration',
      },
      {
        title: 'Critical cleanliness control',
        body: 'For final-stage or high-cleanliness applications where fine-particle control, filter integrity, sealing and bypass prevention become part of the treatment requirement.',
        technologySlug: 'he-criva',
      },
      {
        title: 'Molecular contamination control',
        body: 'For gas, vapor, odor or corrosive molecular challenges that are not resolved by particulate filtration alone and require media selected around contaminant chemistry and contact conditions.',
        technologySlug: 'ma-trea',
      },
    ],
    qualificationGroups: [
      {
        title: 'Airflow & environment',
        items: ['Airflow rate and duty profile', 'Available static pressure and allowable system resistance', 'Temperature and humidity range', 'Outdoor, recirculated or process-air source'],
      },
      {
        title: 'Contamination challenge',
        items: ['Particle size, concentration and loading pattern', 'Required cleanliness or protected-space condition', 'Gas, vapor or odor chemistry when molecular treatment is required', 'Downstream process, equipment or occupant sensitivity'],
      },
      {
        title: 'Integration & verification',
        items: ['Prefilter, final-stage and molecular-treatment sequence', 'Housing condition, sealing and bypass control', 'Differential-pressure or condition monitoring strategy', 'Service access, replacement planning and verification method'],
      },
    ],
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
        undefined,
        '/images/HE-CRIVA-%20VIDEO%20(1).mp4',
      ),
      {
        ...tech(
          'ma-trea',
          'MA-TREA™',
          'Molecular Air Treatment',
          true,
          'TC-AIR-03',
          'Molecular-phase air treatment for gases, vapors, odors and corrosive molecular contaminants using media selected around the actual contaminant challenge.',
          'Treat identified molecular contaminants that are not resolved by particulate filtration alone, while integrating media chemistry, contact conditions, housing integrity and service strategy.',
          ['Adsorption or chemisorption using application-selected media', 'Media selection around target contaminant chemistry and competing species', 'Contact-time, airflow and contaminant-loading evaluation', 'Integration with particulate prefiltration, sealing and service access'],
          ['Industrial odor control', 'Corrosive-gas mitigation for sensitive equipment and control environments', 'Process ventilation polishing', 'Target gas and vapor reduction', 'Airborne molecular contamination control'],
          ['Known target contaminant chemistry', 'Inlet concentration and loading profile', 'Airflow and required contact conditions', 'Temperature and relative-humidity range', 'Competing contaminants and upstream particulate load', 'Media exhaustion and replacement planning'],
          ['Odor or target-gas breakthrough', 'Accelerated media exhaustion', 'Outlet condition drifts from the required target', 'Unexpected humidity sensitivity', 'Uneven loading or suspected bypass', 'Service interval materially shorter than the validated duty expectation'],
          '/images/air-filters-lab.avif',
          '/images/MATREA.png',
          undefined,
          '/images/MA_TREA-VIDEO.mp4',
        ),
        selectionInputs: [
          'Target gas, vapor, odor or corrosive molecular contaminant',
          'Inlet concentration, variability and exposure profile',
          'Airflow rate, face velocity and required contact conditions',
          'Temperature and relative-humidity operating range',
          'Competing gases, vapors and upstream particulate loading',
          'Required outlet condition or protected-process objective',
          'Existing housing, sealing, bypass and installation constraints',
          'Media monitoring, testing and replacement strategy',
        ],
        engineeringNotes: [
          {
            title: 'Molecular treatment is not particulate filtration',
            body: 'Particle filters and molecular media solve different contamination problems. MA-TREA™ is selected when the controlled challenge is a gas, vapor, odor or corrosive molecular contaminant, while particulate stages may remain necessary upstream or downstream.',
          },
          {
            title: 'Media chemistry follows the contaminant',
            body: 'Activated-carbon, impregnated or other adsorptive / reactive media cannot be treated as universally interchangeable. Selection follows the target chemistry, concentration, humidity, competing contaminants and required treatment endpoint.',
          },
          {
            title: 'Breakthrough matters more than appearance',
            body: 'Molecular media may approach exhaustion without looking visibly loaded. Condition review therefore considers contaminant breakthrough, monitoring or media testing, duty history and operating conditions rather than appearance or differential pressure alone.',
          },
          {
            title: 'Installation remains part of performance',
            body: 'Housing integrity, module seating, sealing, airflow distribution and service access affect whether the air stream actually receives the intended molecular treatment. Bypass can undermine otherwise suitable media.',
          },
        ],
        knowledgeCenterSlug: 'ip-aeremis-ma-trea-molecular-air',
        customFaqs: [
          ['What does MA-TREA™ treat?', 'MA-TREA™ is intended for identified molecular contaminants such as target gases, vapors, odors or corrosive airborne compounds. The specific media and configuration depend on the contaminant chemistry and operating conditions.'],
          ['Is MA-TREA™ the same as HEPA or high-efficiency particulate filtration?', 'No. MA-TREA™ addresses molecular-phase contamination, while particulate filtration addresses suspended particles. A project may require both treatment mechanisms in a staged air-treatment system.'],
          ['How is molecular-media exhaustion evaluated?', 'Exhaustion is evaluated from the application duty and evidence such as target-contaminant breakthrough, monitoring, media testing, exposure history and operating conditions. Differential pressure alone does not establish remaining molecular capacity.'],
          ['What information is needed to select a MA-TREA™ treatment path?', 'At minimum, identify the target contaminant, expected concentration and variability, airflow, temperature, humidity, required outlet condition, competing contaminants, existing housing constraints and the intended monitoring or replacement strategy.'],
        ],
      },
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
