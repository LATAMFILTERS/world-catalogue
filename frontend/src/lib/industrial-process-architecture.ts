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
  hideHeroPoster?: boolean;
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
  knowledgeCenterSlug?: string;
  selectionContext?: {
    eyebrow: string;
    title: string;
    lead: string;
  };
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
    knowledgeCenterSlug: 'ip-aeremis-air-treatment-architecture',
    selectionContext: {
      eyebrow: 'AIR TREATMENT SCOPE',
      title: 'Match the contamination problem to the treatment path.',
      lead: 'AEREMIS™ separates general particulate control, critical-air filtration and molecular treatment so each application starts from the actual air-quality problem instead of a generic filter form.',
    },
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
      {
        ...tech(
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
        hideHeroPoster: true,
      },
      {
        ...tech(
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
        hideHeroPoster: true,
      },
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
        hideHeroPoster: true,
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
    summary: 'Industrial dust and fume filtration for process-generated particulate, extraction systems and demanding production environments.',
    positioning: 'PARTION™ organizes filtration around particulate generated by the industrial process itself—fine dust, fume and mixed production loading—rather than general ventilation dust alone. Selection follows particle behavior, concentration, temperature, moisture or aerosol exposure, cleaning strategy, allowable pressure drop, service access and the validated safety requirements of the process.',
    heroImage: '/images/planta_converted.avif',
    heroVideo: '/images/PARTION-VIDEO.mp4',
    mediaImage: '/images/PARTION%E2%84%A2.png',
    knowledgeCenterSlug: 'ip-partion-dust-fume-architecture',
    selectionContext: {
      eyebrow: 'DUST & FUME TREATMENT SCOPE',
      title: 'Match the process-generated particulate to the filtration path.',
      lead: 'PARTION™ starts with the actual process source and particulate behavior so dust and fume filtration is resolved around loading, cleaning, airflow and service conditions rather than general ventilation duty.',
    },
    selectionGuide: [
      {
        title: 'Fine dust & fume control',
        body: 'For process exhaust, production capture and extraction duties where fine or mixed particulate loading requires filter media and service strategy selected around the actual process-generated contaminant.',
        technologySlug: 'fumevra',
      },
    ],
    qualificationGroups: [
      {
        title: 'Process & source',
        items: ['Process generating the dust or fume', 'Airflow and duty cycle', 'Source-capture or exhaust position', 'Required downstream or discharge condition'],
      },
      {
        title: 'Contaminant behavior',
        items: ['Particle size, morphology and concentration', 'Dry, sticky, hygroscopic, abrasive or oily behavior', 'Temperature and moisture exposure', 'Combustibility or reactive-hazard classification where applicable'],
      },
      {
        title: 'Filtration & service',
        items: ['Existing collector or filter housing interface', 'Allowable pressure-drop range', 'Cleanable versus replaceable media strategy', 'Service access, inspection and disposal requirements'],
      },
    ],
    technologies: [
      {
        ...tech(
          'fumevra',
          'FUMEVRA™',
          'Fine Dust & Fume Filtration',
          true,
          'TC-DUST-01',
          'Process-generated fine dust and fume filtration for industrial extraction and dust-collection systems, with media and element selection resolved around the actual particulate behavior and duty.',
          'Capture process-generated fine particulate and fume within the installed extraction or dust-collection system before recirculation, discharge or downstream treatment, while preserving the required airflow, sealing and service behavior of the validated collector interface.',
          ['Surface or depth filtration selected by particle behavior', 'Filter-media and element geometry matched to the loading mechanism', 'Pulse-jet or other cleaning compatibility only where the element and installed system are validated for regeneration', 'Dust-loading, cake-release and differential-pressure management', 'Sealing and bypass control at the element-to-collector interface'],
          ['Process dust collection', 'Fine particulate capture', 'Welding and thermal-process fume extraction', 'Grinding and finishing dust extraction', 'Production exhaust filtration'],
          ['Fine or mixed particle-size loading', 'Continuous or cyclic production duty', 'Dry, sticky, abrasive, hygroscopic or oil-bearing particulate behavior', 'Temperature, moisture and aerosol exposure', 'Cleaning or replacement strategy', 'Combustible or reactive particulate classification where applicable'],
          ['Rapid differential-pressure increase', 'Visible particulate downstream', 'Poor pressure-drop recovery after a validated cleaning cycle', 'Unexpected media damage, blinding or caking', 'Service interval materially shorter than expected', 'Evidence of bypass or poor element seating', 'Uneven dust loading across the installed element bank'],
          '/images/planta_converted.avif',
          '/images/FUMEVRA%E2%84%A2.png',
        ),
        heroVideo: '/images/fumevra-%20video.mp4',
        hideHeroPoster: true,
        selectionInputs: [
          'Process generating the dust or fume and source-capture position',
          'Particle size, morphology, concentration and loading variability',
          'Airflow rate, face velocity and duty cycle through the installed collector or extraction system',
          'Temperature, moisture, oil or aerosol exposure',
          'Abrasive, sticky, hygroscopic, fibrous or otherwise difficult particulate behavior',
          'Required downstream, recirculation or discharge condition',
          'Existing filter housing, element geometry, sealing and cleaning interface',
          'Compressed-air cleaning conditions where a pulse-cleaned collector is used',
          'Applicable combustible-dust, reactive-material or process-safety requirements where relevant',
          'Inspection, replacement, disposal and service-access constraints',
        ],
        engineeringNotes: [
          {
            title: 'Process dust is not general ventilation dust',
            body: 'FUMEVRA™ is resolved around particulate created by the production process. Fine dust and fume can behave differently from ordinary ambient dust, so media selection starts with the actual contaminant and duty rather than a generic filter class.',
          },
          {
            title: 'Particle behavior changes filter behavior',
            body: 'Fine, sticky, hygroscopic, abrasive, hot, fibrous or oil-bearing particulate can alter loading, cake release, pressure-drop development and element life. These conditions are part of the selection basis.',
          },
          {
            title: 'Pulse cleaning is a system interaction',
            body: 'Where a cartridge and collector are validated for pulse-jet cleaning, a brief reverse compressed-air pulse flexes the filter media and dislodges accumulated dust from the outer surface so it can fall toward the hopper. The dust is not injected into the filter, and this cleaning behavior must not be assumed for every FUMEVRA™ configuration.',
          },
          {
            title: 'Cleaning strategy is application-specific',
            body: 'A cleanable element is not automatically appropriate for every dust or fume. Media construction, loading mechanism, collector interface, pulse conditions where applicable, and the validated cleaning method have to work together before regeneration is relied upon.',
          },
          {
            title: 'Capture and airflow remain part of the result',
            body: 'The filter element can only treat particulate that reaches the collector. Source capture, duct transport, airflow balance and collector condition remain system variables outside the element itself and can limit overall control performance.',
          },
          {
            title: 'The filter is not the collector',
            body: 'FUMEVRA™ identifies the ELIMFILTERS filtration family used within an installed dust-collection or extraction system. The collector housing, fan, ductwork, hopper and cleaning hardware remain application equipment unless separately specified.',
          },
          {
            title: 'Pressure drop and emissions are diagnostic signals',
            body: 'Differential-pressure trend, cleaning recovery, visible downstream particulate, element condition and seating evidence are reviewed together. No single pressure-drop reading establishes media condition or remaining service life by itself.',
          },
        ],
        knowledgeCenterSlug: 'ip-partion-fumevra-fine-dust-fume',
        customFaqs: [
          ['What does FUMEVRA™ filter?', 'FUMEVRA™ is the PARTION™ filtration family for process-generated fine dust and fume particulate handled by industrial extraction, dust-collection and production-exhaust systems.'],
          ['How is FUMEVRA™ different from AEREMIS™ General Air Filtration?', 'AEREMIS™ General Air Filtration addresses general ventilation and make-up-air particulate. FUMEVRA™ is resolved around particulate generated by an industrial process, where loading behavior, cleaning strategy and process conditions can be substantially different.'],
          ['How does pulse-jet self-cleaning work in a compatible cartridge system?', 'A short reverse compressed-air pulse enters the clean side of a cartridge that is designed for this duty, briefly flexing the filter media. Accumulated dust cake releases from the outer media surface and falls toward the hopper. The pulse cleans the filter surface; it does not inject dust into the collector.'],
          ['Are all FUMEVRA™ elements cleanable?', 'No. Cleanability depends on the validated media, element construction, contaminant behavior and installed collector or cleaning interface. Replaceable and cleanable treatment paths must remain application-specific.'],
          ['Does FUMEVRA™ mean ELIMFILTERS supplies the complete dust collector?', 'No. FUMEVRA™ identifies the filtration technology and filter-element family. The installed collector housing, fan, ductwork, hopper and cleaning hardware are system context unless separately specified.'],
          ['Can differential pressure alone determine when a FUMEVRA™ element should be replaced?', 'No. Differential-pressure trend is one diagnostic input. Cleaning recovery, downstream particulate, element condition, sealing, process changes and the validated service criteria must also be considered.'],
          ['What information is needed to select a FUMEVRA™ treatment path?', 'Identify the generating process, source-capture position, particle characteristics and concentration, airflow and duty cycle, temperature and moisture conditions, difficult particulate behavior, required downstream condition, installed housing or collector interface, cleaning method where applicable, and any process-safety constraints.'],
        ],
      },
    ],
  },
  {
    slug: 'coalvex',
    name: 'COALVEX™',
    descriptor: 'Gas Conditioning Technologies',
    summary: 'Gas-stream conditioning for entrained liquid aerosols, droplets and free-liquid carryover in natural-gas and industrial process-gas duties.',
    positioning: 'COALVEX™ organizes gas conditioning by the liquid phase carried in the gas stream. Fine aerosols and small droplets are addressed through COALERIS™ gas coalescence, while bulk free liquid and larger-droplet carryover are addressed through the descriptive Gas-Liquid Separation path. Selection follows gas composition, flow, pressure, temperature, liquid loading, droplet behavior, turndown, drainage and the required downstream condition.',
    heroImage: '/images/oil&gas.avif',
    heroVideo: '/images/Oil%26Gas(1).mp4',
    mediaImage: '/images/coalvex.png',
    knowledgeCenterSlug: 'ip-coalvex-gas-conditioning-architecture',
    selectionContext: {
      eyebrow: 'GAS CONDITIONING SCOPE',
      title: 'Match the liquid carryover problem to the separation mechanism.',
      lead: 'COALVEX™ separates fine aerosol coalescence from bulk gas-liquid separation so each project begins with the actual liquid form, loading pattern and downstream protection requirement.',
    },
    selectionGuide: [
      {
        title: 'Fine aerosol & droplet coalescence',
        body: 'For fine liquid aerosols and small entrained droplets that require capture, coalescence into larger droplets and reliable drainage before the gas reaches sensitive downstream equipment.',
        technologySlug: 'coaleris',
      },
      {
        title: 'Bulk gas-liquid separation',
        body: 'For free liquid, larger droplets, slugs or intermediate liquid carryover that should be removed before finer coalescing stages or downstream process equipment.',
        technologySlug: 'gas-liquid-separation',
      },
    ],
    qualificationGroups: [
      {
        title: 'Gas stream',
        items: ['Gas composition and contaminants', 'Operating and design pressure', 'Temperature range', 'Flow rate, turndown and duty profile'],
      },
      {
        title: 'Liquid challenge',
        items: ['Aerosol or droplet size distribution', 'Liquid composition and loading rate', 'Continuous, intermittent or slug loading', 'Required downstream liquid condition'],
      },
      {
        title: 'Integration & drainage',
        items: ['Existing vessel or housing interface', 'Element orientation and sealing', 'Drainage path and liquid removal strategy', 'Materials compatibility, service access and pressure-system requirements'],
      },
    ],
    technologies: [
      {
        ...tech(
          'coaleris',
          'COALERIS™',
          'Gas Coalescence',
          true,
          'TC-NG-01',
          'Fine liquid-aerosol and entrained-droplet coalescence for natural-gas and industrial process-gas streams where downstream equipment requires controlled liquid carryover.',
          'Capture fine liquid aerosols and small entrained droplets within coalescing media, promote droplet growth, and provide a reliable drainage path so separated liquid leaves the gas stream before sensitive downstream equipment.',
          ['Fine aerosol and small-droplet capture within fibrous or porous coalescing media', 'Droplet growth through repeated interception and coalescence', 'Gravity-assisted drainage after droplet formation', 'Flow-path control, element sealing and bypass prevention', 'Re-entrainment control through correct gas velocity and drainage conditions'],
          ['Natural-gas conditioning', 'Compressor and turbine protection', 'Gas transmission and distribution', 'Fuel-gas conditioning', 'Feed-gas protection for amine, dehydration, membrane, desiccant or catalyst stages', 'Industrial process-gas aerosol control'],
          ['Gas composition, pressure and temperature', 'Gas flow rate, velocity and turndown', 'Fine aerosol size distribution and liquid loading', 'Liquid viscosity, density, surface behavior and drainage characteristics', 'Upstream free-liquid or slug potential', 'Upstream solids that can load or foul the coalescing media', 'Continuous, variable or upset process duty'],
          ['Liquid carryover downstream', 'Unexpected differential-pressure rise', 'Poor drainage, flooding or liquid accumulation', 'Re-entrainment after apparent separation', 'Short element service life', 'Evidence of bypass or seal failure', 'Performance changes after gas, liquid or flow conditions shift'],
          '/images/oil&gas.avif',
          '/images/COALERIS.png',
          undefined,
          '/images/COALERS-VIDEO.mp4',
        ),
        hideHeroPoster: true,
        selectionInputs: [
          'Gas composition and target liquid contaminant',
          'Operating and design pressure',
          'Temperature range',
          'Gas flow rate, velocity and expected turndown',
          'Aerosol or droplet size distribution',
          'Liquid loading rate, variability and upset or slug potential',
          'Liquid physical properties and drainage behavior',
          'Upstream free-liquid separation and solid-contamination conditions',
          'Existing vessel, housing, element orientation, sealing and flow-direction interface',
          'Required downstream liquid condition or protected-equipment objective',
          'Drain arrangement, liquid-removal capacity, service access and materials compatibility',
        ],
        engineeringNotes: [
          {
            title: 'Coalescence targets fine entrained liquid',
            body: 'COALERIS™ is selected when the gas stream carries fine liquid aerosols or small droplets that are not reliably removed by gravity or bulk separation alone. The media captures droplets and promotes their growth so they can leave the gas stream through the drainage path.',
          },
          {
            title: 'Bulk liquid and fine aerosol are different duties',
            body: 'Free liquid, large droplets and slugs can impose a very different load from fine aerosol. Where the incoming liquid challenge exceeds the validated coalescing duty, an upstream bulk-separation stage may be required before COALERIS™.',
          },
          {
            title: 'Drainage is part of coalescing performance',
            body: 'Captured liquid must leave the coalescing stage. Restricted drainage, flooding or liquid accumulation can increase differential pressure and promote re-entrainment even when the media itself is appropriate.',
          },
          {
            title: 'Gas velocity and turndown affect separation behavior',
            body: 'Gas flow, local velocity and turndown influence droplet transport, residence and re-entrainment risk. Element count, vessel configuration and operating envelope therefore belong to the application assessment rather than a universal family claim.',
          },
          {
            title: 'Gas and liquid properties change element duty',
            body: 'Pressure, temperature, gas composition, aerosol loading, liquid properties and upstream solids can change media loading, drainage, differential pressure and service behavior. Selection cannot be reduced to element dimensions or a cross-reference alone.',
          },
          {
            title: 'The downstream objective defines the treatment requirement',
            body: 'Protecting compressors, turbines, fuel-gas equipment or downstream gas-treatment stages can require different allowable carryover and operating margins. The target condition must be defined before the coalescing element is selected.',
          },
          {
            title: 'The element is not the pressure vessel',
            body: 'COALERIS™ identifies the ELIMFILTERS coalescing element family. Pressure vessels, separators, drains, level controls, instrumentation and piping remain system equipment unless separately specified.',
          },
        ],
        knowledgeCenterSlug: 'ip-coalvex-coaleris-gas-coalescence',
        customFaqs: [
          ['What does COALERIS™ remove from a gas stream?', 'COALERIS™ is intended for fine liquid aerosols and small entrained droplets carried in natural-gas or industrial process-gas streams. The selected element and media depend on gas conditions, liquid properties, loading and the required downstream condition.'],
          ['How is gas coalescence different from bulk gas-liquid separation?', 'Bulk separation removes free liquid, larger droplets and slug-type loading using disengagement, inertial or vessel mechanisms. COALERIS™ targets finer aerosols and small droplets by capturing them in coalescing media, growing them into larger droplets and allowing them to drain.'],
          ['When can a bulk separator be required ahead of COALERIS™?', 'When free liquid, large droplets, slugs or liquid loading would exceed the validated coalescing duty, upstream bulk separation may be required so the fine coalescing stage is not overloaded.'],
          ['Why is drainage important in a coalescing element?', 'Coalesced liquid has to leave the media and separation stage. Restricted drainage, flooding or accumulation can raise differential pressure and allow liquid to be re-entrained into the gas stream.'],
          ['Can COALERIS™ be used to protect compressors or gas-treatment equipment?', 'Yes, those are common application objectives, but the required element, vessel configuration and operating margin depend on the actual gas composition, pressure, temperature, flow, liquid challenge and downstream requirement.'],
          ['Does vessel orientation define the COALERIS™ technology?', 'No. Horizontal or vertical vessel configuration is an application and equipment decision. COALERIS™ identifies the coalescing treatment family and element function, not one universal vessel architecture.'],
          ['Can COALERIS™ be selected from a cross-reference or element size alone?', 'No. Selection requires gas composition, pressure, temperature, flow and turndown, aerosol size and loading, liquid properties, upstream bulk-liquid conditions, housing interface, drainage conditions and the required downstream result.'],
          ['What should be checked when liquid appears downstream?', 'Review whether the challenge is fine aerosol or excessive bulk liquid, then check gas flow and turndown, differential-pressure trend, element seating and seals, drainage, flooding or re-entrainment, and whether process conditions changed from the selection basis.'],
        ],
      },
      {
        ...tech(
          'gas-liquid-separation',
          'Gas-Liquid Separation',
          'Gas-Liquid Separation',
          false,
          'TC-NG-02',
          'Filtration and separation elements engineered to remove free liquid and entrained droplets from industrial gas streams before downstream equipment or finer coalescing stages.',
          'Provide the internal filtration and separation element that captures free liquid, larger entrained droplets and carryover before finer COALERIS™ coalescence or sensitive downstream equipment.',
          ['Inertial impingement and directional change across the separation element', 'Droplet capture and disengagement from the gas stream on the active element surface', 'Gravity-assisted drainage of separated liquid away from the active element', 'Element performance evaluated against liquid loading, gas velocity and allowable pressure drop'],
          ['Natural-gas pre-separation', 'Knockout and bulk-liquid removal duties', 'Compressor upstream protection', 'Process-gas conditioning', 'Upstream protection of fine coalescing stages'],
          ['Variable gas flow and turndown', 'Free-liquid, large-droplet or intermittent liquid loading', 'Pressure and temperature range', 'Allowable clean and loaded-element pressure drop', 'Existing housing and internal-element interface', 'Drainage path and liquid-removal conditions', 'Gas and liquid chemical compatibility with element materials'],
          ['Liquid carryover downstream', 'Unexpected differential-pressure change', 'Uneven element loading or fouling', 'Evidence of bypass or poor element seating', 'Restricted drainage or re-entrainment'],
          '/images/oil&gas.avif',
          '/images/Gas-Liquid%20Separation.png',
        ),
        selectionInputs: [
          'Gas composition and process duty',
          'Operating pressure and temperature range',
          'Gas flow rate, velocity and turndown',
          'Free-liquid rate, droplet size distribution and slug potential',
          'Liquid composition, density and drainage behavior',
          'Existing housing, internal dimensions and element interface',
          'Element orientation, sealing and flow direction',
          'Drainage path and liquid-removal conditions around the element',
          'Required downstream liquid condition',
          'Element media, seal and structural-material compatibility',
          'Allowable clean and loaded-element differential pressure',
          'Inspection, cleaning or replacement strategy and service-access constraints',
        ],
        engineeringNotes: [
          {
            title: 'Bulk separation comes before fine coalescence when the duty requires it',
            body: 'Free liquid, large droplets and intermittent liquid loading can overload a fine coalescing stage. Gas-Liquid Separation defines the ELIMFILTERS element path used ahead of finer COALERIS™ treatment when bulk or intermediate liquid removal is required.',
          },
          {
            title: 'The ELIMFILTERS product is the separation element, not the vessel',
            body: 'ELIMFILTERS supplies the filtration or separation element and defines its validated internal function. Pressure vessels, housings, piping, drains, level controls, instrumentation and supporting skids may appear in application imagery only as operating context and are not presented as ELIMFILTERS-manufactured equipment unless separately specified.',
          },
          {
            title: 'Liquid loading, drainage and pressure drop govern element duty',
            body: 'Element performance depends on gas velocity, liquid loading, droplet behavior, seating and sealing, available disengagement around the element, drainage that prevents flooding or re-entrainment, and pressure drop across the element as loading develops.',
          },
          {
            title: 'Selection and replacement are element decisions',
            body: 'The element is selected against gas composition, velocity, pressure, temperature, liquid loading, droplet behavior, compatibility, allowable differential pressure and the required downstream condition. Replacement or service decisions should follow validated condition evidence such as carryover, differential-pressure trend, drainage behavior, fouling, seating and the actual duty history rather than vessel appearance.',
          },
          {
            title: 'Gas-Liquid Separation remains descriptive',
            body: 'This is an engineering treatment family beneath COALVEX™, not an independent ELIMFILTERS technology mark. Vessel architecture and plant arrangement are application context and do not become separate ELIMFILTERS product technologies.',
          },
        ],
        knowledgeCenterSlug: 'ip-coalvex-gas-liquid-separation',
        customFaqs: [
          ['What does ELIMFILTERS supply for Gas-Liquid Separation?', 'The page is centered on filtration and separation elements used inside an appropriate gas-separation housing to remove free liquid, larger entrained droplets and intermediate carryover. The surrounding vessel and process equipment are application context unless separately specified.'],
          ['How is Gas-Liquid Separation different from COALERIS™?', 'Gas-Liquid Separation is the ELIMFILTERS element path for free liquid, larger entrained droplets and intermediate carryover. COALERIS™ is the fine coalescing technology for smaller droplets and liquid aerosols. The two stages address different liquid regimes and may be used sequentially when the application requires it.'],
          ['What information is needed to select the separation element?', 'Selection requires gas composition, pressure, temperature, flow and turndown, liquid loading and droplet behavior, allowable element differential pressure, the existing housing and element interface, orientation and sealing, drainage conditions, media and seal compatibility, service strategy and the required downstream condition.'],
          ['Does ELIMFILTERS present the pressure vessel as the product?', 'No. Vessels, separators, housings, piping, drains, controls, instrumentation and skids shown in application imagery represent the real operating context. The ELIMFILTERS commercial product is the filtration or separation element unless a separate system scope is explicitly specified.'],
          ['How should the element be monitored or replaced?', 'Review downstream liquid carryover, differential-pressure trend, drainage behavior, fouling or contamination, element seating and seals, operating history and any change in gas or liquid duty. Replacement intervals should be based on validated application evidence rather than a universal time claim.'],
          ['Is Gas-Liquid Separation an independent ELIMFILTERS technology brand?', 'No. It remains a descriptive engineering treatment family beneath COALVEX™ and maps to TC-NG-02.'],
        ],
      },
    ],
  },
  {
    slug: 'flurexis',
    name: 'FLUREXIS™',
    descriptor: 'Fluid Conditioning Technologies',
    summary: 'Industrial hydraulic- and lubrication-fluid conditioning for solid contamination, water and selected oil-degradation products.',
    positioning: 'FLUREXIS™ organizes fluid conditioning by the contamination mechanism that must be controlled. HYLTRIS™ and LUBREVA™ address solid-particle cleanliness in hydraulic and lubrication circuits, DEWATIS™ addresses water in its relevant forms, and OILREVEX™ addresses selected degradation products that conventional particulate filtration does not resolve. Selection follows fluid chemistry, viscosity and temperature, flow and pressure duty, cleanliness objective, water state, degradation mechanism, equipment sensitivity and the required verification method.',
    heroImage: '/images/oil-hand.avif',
    heroVideo: '/images/FLUREXIS-VIDEO.mp4',
    mediaImage: '/images/FLUREXIS%E2%84%A2.png',
    knowledgeCenterSlug: 'ip-flurexis-fluid-conditioning-architecture',
    selectionContext: {
      eyebrow: 'FLUID CONDITIONING SCOPE',
      title: 'Match the contamination mechanism to the treatment path.',
      lead: 'FLUREXIS™ separates particulate control, water removal and oil-condition remediation so treatment begins with the actual fluid problem instead of a generic filter form.',
    },
    selectionGuide: [
      {
        title: 'Hydraulic particulate control',
        body: 'For hydraulic systems where solid contamination, ingression and wear debris must be controlled around component sensitivity, cleanliness objectives, pressure duty and flow behavior.',
        technologySlug: 'hyltris',
      },
      {
        title: 'Lubrication-oil particulate control',
        body: 'For circulating and industrial lubrication systems where wear debris and ingressed solids must be controlled while respecting oil viscosity, temperature, flow and bearing or gear sensitivity.',
        technologySlug: 'lubreva',
      },
      {
        title: 'Water removal and dehydration',
        body: 'For oils affected by free, emulsified or dissolved water, with the treatment method selected from water form, oil properties, contamination level and required final moisture condition.',
        technologySlug: 'dewatis',
      },
      {
        title: 'Oil-condition remediation',
        body: 'For confirmed degradation products, varnish precursors, sludge-forming contaminants or chemistry-related conditions that are not resolved by conventional particulate filtration alone.',
        technologySlug: 'oilrevex',
      },
    ],
    qualificationGroups: [
      {
        title: 'Fluid & system',
        items: ['Fluid type, chemistry and additive package', 'Viscosity and temperature range', 'Flow, pressure and duty cycle', 'Reservoir volume, circulation pattern and equipment sensitivity'],
      },
      {
        title: 'Contamination challenge',
        items: ['Particle cleanliness objective and ingression source', 'Water form, concentration and re-entry mechanism', 'Wear debris, oxidation or degradation-product evidence', 'Known solids, gases or process contaminants affecting the fluid'],
      },
      {
        title: 'Integration & verification',
        items: ['Pressure, return, offline or dedicated conditioning architecture', 'Housing, element, seal and material compatibility', 'Differential-pressure, particle-count, moisture or fluid-analysis monitoring', 'Service access, changeout criteria and post-treatment verification'],
      },
    ],
    technologies: [
      {
        ...tech(
          'hyltris',
          'HYLTRIS™',
          'Hydraulic Fluid Filtration',
          true,
          'TC-HYD-01',
          'Particulate contamination control for industrial hydraulic systems where component reliability depends on sustained fluid cleanliness under real pressure, flow and viscosity conditions.',
          'Control ingressed solids and wear debris in hydraulic circuits using a filtration architecture selected around cleanliness objective, component sensitivity, pressure duty, flow behavior and fluid properties.',
          ['Pressure-line, return-line and offline filtration architectures', 'Particle capture selected around the required cleanliness objective', 'Differential-pressure and bypass-aware element management', 'Flow-path, sealing and housing compatibility control', 'Offline recirculation where continuous cleanup is required independently of machine flow'],
          ['Hydraulic power units', 'Industrial presses and machinery', 'Servo and proportional systems', 'Hydraulic test stands', 'Offline kidney-loop conditioning', 'Commissioning and cleanup support'],
          ['Component cleanliness sensitivity', 'System pressure and cyclic pressure duty', 'Flow rate and flow transients', 'Fluid viscosity and cold-start temperature', 'Ingression rate and wear-debris generation', 'Target cleanliness and monitoring method'],
          ['Recurring valve, pump or actuator contamination', 'Cleanliness code does not recover as expected', 'Unexpected differential-pressure rise', 'Frequent bypass indication or short element life', 'Cold-start restriction', 'Visible bypass, seal or installation evidence'],
          '/images/hidraulic.avif',
          '/images/hidraulic.avif',
        ),
        selectionInputs: [
          'Hydraulic fluid type and additive chemistry',
          'Target cleanliness or protected-component requirement',
          'Operating and maximum pressure',
          'Nominal, peak and cyclic flow conditions',
          'Fluid viscosity across startup and operating temperature',
          'Particle loading, ingression source and wear-debris profile',
          'Pressure-line, return-line or offline installation location',
          'Existing housing, collapse/bypass arrangement, seals and materials',
          'Allowable differential pressure and monitoring method',
          'Service access, duty cycle and required cleanup time',
        ],
        engineeringNotes: [
          {
            title: 'Cleanliness is a system condition, not an element label',
            body: 'HYLTRIS™ selection starts from the protected components, contamination source and required fluid condition. Media performance, element size, placement and system ingression must work together to establish and maintain the target cleanliness.',
          },
          {
            title: 'Filter location changes the duty',
            body: 'Pressure-line, return-line and offline filters see different pressure, flow, pulsation and contamination conditions. One element configuration should not be assumed suitable across every location in the hydraulic circuit.',
          },
          {
            title: 'Viscosity and cold start affect restriction',
            body: 'Higher viscosity at low temperature can raise differential pressure even when the element is not loaded with contamination. Restriction trends should therefore be interpreted together with fluid temperature and flow.',
          },
          {
            title: 'Bypass and sealing belong to contamination control',
            body: 'An efficient medium cannot protect the system if fluid bypasses the element through an open bypass path, damaged seal, incorrect seating or incompatible housing interface.',
          },
          {
            title: 'The industrial family is separate from On-Road / Off-Road marks',
            body: 'HYLTRIS™ is the Industrial & Process hydraulic-fluid family. It does not inherit NANOFORCE™ branding, claims or product rules from the On-Road / Off-Road platform.',
          },
        ],
        knowledgeCenterSlug: 'ip-flurexis-hyltris-hydraulic-filtration',
        customFaqs: [
          ['What does HYLTRIS™ control?', 'HYLTRIS™ controls solid particulate contamination and wear debris in industrial hydraulic fluids. The required element and architecture depend on component sensitivity, cleanliness objective, pressure, flow, viscosity, contamination loading and installation location.'],
          ['Is pressure-line filtration the same duty as return-line filtration?', 'No. Pressure, return and offline locations impose different pressure, flow, pulsation and contamination conditions. Selection must be qualified for the actual installation point.'],
          ['Why can differential pressure rise during startup?', 'Cold hydraulic fluid can be substantially more viscous than fluid at normal operating temperature. That viscosity increase can raise element restriction, so differential pressure should be interpreted together with temperature and flow.'],
          ['Can HYLTRIS™ be selected from micron rating alone?', 'No. Selection also requires the cleanliness objective, validated removal performance, flow, pressure, viscosity, contamination loading, housing interface, bypass arrangement and protected-component sensitivity.'],
        ],
      },
      {
        ...tech(
          'lubreva',
          'LUBREVA™',
          'Industrial Lubrication Filtration',
          true,
          'TC-LUB-01',
          'Industrial lubricating-oil particulate control for circulating systems, gearboxes, bearings and turbine or machinery lubrication duties.',
          'Control ingressed solids and internally generated wear debris while maintaining acceptable oil flow and restriction across the actual viscosity and temperature envelope.',
          ['Full-flow and offline particulate filtration', 'Depth or surface-media selection around solids loading and cleanliness objective', 'Offline recirculation for continuous cleanup independent of machine flow', 'Differential-pressure and condition-based element management', 'Seal, housing and fluid-compatibility control'],
          ['Gearboxes', 'Turbine lubrication systems', 'Circulating-oil systems', 'Industrial bearing lubrication', 'Paper, metals and process machinery lubrication', 'Offline reservoir conditioning'],
          ['Oil viscosity and temperature range', 'Wear-debris generation and external ingression', 'Continuous circulation or intermittent duty', 'Bearing, gear or servo cleanliness sensitivity', 'Oxidation products or water that may coexist with particles', 'Available pressure drop and pump behavior'],
          ['Wear-debris trend increases', 'Persistent particle contamination', 'Short filter service intervals', 'Restriction outside expected temperature/flow behavior', 'Downstream deposits continue despite acceptable particle control', 'Seal or bypass evidence'],
          '/images/oil-hand.avif',
          '/images/elementos-oil.avif',
        ),
        selectionInputs: [
          'Lubricant type, viscosity grade and additive chemistry',
          'Operating and startup temperature',
          'Circulation flow and available pressure differential',
          'Protected bearing, gear, turbine or lubrication component',
          'Cleanliness objective and particle-count monitoring method',
          'Wear-debris and ingression profile',
          'Full-flow, side-stream or offline treatment location',
          'Water or degradation products that may require a separate treatment stage',
          'Existing housing, seals, materials and service access',
          'Element change criterion and post-service verification method',
        ],
        engineeringNotes: [
          {
            title: 'Lubrication cleanliness and oil condition are related but not identical',
            body: 'LUBREVA™ addresses particulate contamination. Water, dissolved degradation products, varnish precursors or chemistry problems can require DEWATIS™ or OILREVEX™ rather than simply installing a finer particulate element.',
          },
          {
            title: 'Viscosity defines real filter duty',
            body: 'Lubricating oils can operate across a wide viscosity range. Startup temperature, pump flow and fluid grade materially affect differential pressure and must be considered when sizing the element and housing.',
          },
          {
            title: 'Wear debris is both contaminant and diagnostic signal',
            body: 'A rising wear-debris trend can indicate an equipment problem as well as a filtration load. Repeated short element life should trigger investigation of the contamination source rather than automatic escalation to a finer medium.',
          },
          {
            title: 'Offline conditioning can separate cleanup flow from machine flow',
            body: 'A dedicated offline loop can support continuous reservoir cleanup without forcing the treatment flow to equal the machine lubrication flow, but its effectiveness still depends on reservoir turnover, ingression and contamination generation.',
          },
          {
            title: 'Industrial lubrication remains distinct from engine-lube branding',
            body: 'LUBREVA™ is the Industrial & Process lubrication family. It does not inherit SYNTRAX™ branding or On-Road / Off-Road product claims.',
          },
        ],
        knowledgeCenterSlug: 'ip-flurexis-lubreva-lubrication-filtration',
        customFaqs: [
          ['What is the primary role of LUBREVA™?', 'LUBREVA™ controls solid contamination and wear debris in industrial lubrication systems while respecting oil viscosity, flow, temperature and the requirements of the protected equipment.'],
          ['When is offline filtration useful?', 'Offline treatment is useful when continuous reservoir cleanup is required independently of the machine lubrication flow, provided the loop is sized around reservoir turnover, contamination generation and the required cleanliness objective.'],
          ['Does removing particles also remove water or varnish?', 'Not necessarily. Water and dissolved or semi-soluble degradation products can require different treatment mechanisms. FLUREXIS™ separates those duties into DEWATIS™ and OILREVEX™ when the diagnosis supports them.'],
          ['Can LUBREVA™ be selected only from oil viscosity?', 'No. Viscosity is one input. Selection also requires flow, temperature, cleanliness objective, contamination load, equipment sensitivity, housing interface and allowable differential pressure.'],
        ],
      },
      {
        ...tech(
          'dewatis',
          'DEWATIS™',
          'Oil Dehydration & Water Removal',
          true,
          'TC-OIL-01',
          'Water-removal treatment for hydraulic and lubricating oils where free, emulsified or dissolved water is degrading fluid condition or equipment reliability.',
          'Reduce water contamination with a treatment mechanism selected for the actual water state, oil chemistry, viscosity, temperature, contamination level and required final moisture condition.',
          ['Free-water separation where gravity or coalescing behavior is suitable', 'Vacuum dehydration or other validated mass-transfer treatment for dissolved and free water duties', 'Offline recirculation and reservoir conditioning', 'Particulate prefiltration or polishing where solids affect the dehydration process', 'Moisture monitoring before and after treatment'],
          ['Hydraulic reservoirs', 'Lubrication-oil systems', 'Turbine and circulating oils', 'Stored or contaminated industrial oils', 'Commissioning, recovery and fluid-conditioning programs'],
          ['Free, emulsified or dissolved water state', 'Oil chemistry, viscosity and additive compatibility', 'Operating temperature', 'Water loading and re-entry rate', 'Reservoir volume and recirculation path', 'Required final moisture condition and verification method'],
          ['Water content does not decline as expected', 'Rapid water re-entry after treatment', 'Persistent emulsion', 'Foaming or entrained gas accompanies the water problem', 'Fluid condition remains unstable after treatment', 'Treatment causes unexpected additive or compatibility concerns'],
          '/images/oil-hand.avif',
          '/images/oilfilvw.avif',
        ),
        selectionInputs: [
          'Oil type, base stock and additive chemistry',
          'Water state: free, emulsified or dissolved',
          'Measured water level and sampling method',
          'Required final moisture condition',
          'Oil viscosity and temperature during treatment',
          'Reservoir volume, recirculation path and available conditioning time',
          'Water ingress source and expected re-entry rate',
          'Solid contamination and prefiltration requirement',
          'Gas or volatile contamination that may coexist with water',
          'Materials compatibility, hazardous-area and service constraints',
        ],
        engineeringNotes: [
          {
            title: 'Water form determines the treatment mechanism',
            body: 'Free water, stable emulsions and dissolved moisture do not respond identically to one treatment method. DEWATIS™ qualification therefore starts by identifying how water exists in the oil rather than selecting equipment from a single moisture number.',
          },
          {
            title: 'Vacuum dehydration is a mass-transfer process',
            body: 'Where appropriate for the fluid and application, vacuum dehydration promotes transfer of water and entrained gases out of the oil under reduced pressure. The actual treatment rate depends on fluid properties, temperature, water load, surface area and system configuration.',
          },
          {
            title: 'The ingress source must be corrected',
            body: 'Removing water without addressing leaking coolers, condensation, washdown ingress, breathers, seals or process contamination can produce rapid rebound and repeated treatment cycles.',
          },
          {
            title: 'Moisture verification requires comparable sampling',
            body: 'Before-and-after water results are meaningful only when samples represent comparable operating conditions and use an appropriate method for the fluid and expected moisture range.',
          },
          {
            title: 'DEWATIS™ is not a universal purifier performance claim',
            body: 'The family name does not assign one removal percentage, final ppm level, flow capacity or treatment time across every oil and system. Numeric claims remain product- and project-specific.',
          },
        ],
        knowledgeCenterSlug: 'ip-flurexis-dewatis-oil-dehydration',
        customFaqs: [
          ['Does DEWATIS™ remove both free and dissolved water?', 'The family covers water-removal architectures for different water states, but the selected mechanism must be qualified for the specific oil and water condition. A method effective on free water is not automatically suitable for dissolved moisture.'],
          ['Why can water return after treatment?', 'Water can re-enter through condensation, coolers, seals, washdown, reservoir breathing or process ingress. The source must be identified and controlled or the moisture condition can rebound after successful treatment.'],
          ['Is vacuum dehydration always required?', 'No. Vacuum dehydration is one treatment path. The correct method depends on whether water is free, emulsified or dissolved, along with oil chemistry, viscosity, temperature, water load and the required outlet condition.'],
          ['Can one universal final water value be assigned to DEWATIS™?', 'No. The acceptable moisture condition depends on the fluid, equipment, operating temperature and project requirement. Numeric limits must be tied to validated product or application evidence.'],
        ],
      },
      {
        ...tech(
          'oilrevex',
          'OILREVEX™',
          'Oil Condition Remediation',
          true,
          'TC-OIL-02',
          'Targeted remediation for selected oil-degradation products and chemistry-related contaminants that conventional particulate filtration alone does not resolve.',
          'Use fluid analysis to identify the degradation mechanism, then apply a compatible offline treatment such as validated adsorption, ion-exchange or other remediation media and verify the oil condition before and after treatment.',
          ['Targeted adsorption or scavenging of selected degradation products', 'Ion-exchange treatment where validated for the fluid chemistry and contaminant', 'Offline recirculation through dedicated remediation media', 'Particulate filtration used as a supporting stage rather than a substitute for chemical diagnosis', 'Fluid-condition verification before, during and after treatment'],
          ['Turbine and circulating oils', 'Industrial lubrication systems', 'Hydraulic systems with confirmed degradation-product concerns', 'Phosphate-ester or other specialty-fluid remediation when chemistry is validated', 'Condition-based oil restoration programs'],
          ['Confirmed degradation mechanism', 'Fluid chemistry, base stock and additive compatibility', 'Soluble, insoluble or deposit-forming contamination state', 'Temperature and oxidation history', 'Contaminant loading and rebound potential', 'Required treatment endpoint and laboratory verification'],
          ['Fluid-condition indicators do not improve', 'Varnish or deposit tendency returns rapidly', 'Remediation media exhausts unexpectedly', 'Differential pressure rises from released or captured deposits', 'Additive or fluid compatibility concerns emerge', 'Deposits persist because the root oxidation or thermal stress remains active'],
          '/images/oil-hand.avif',
          '/images/grupo1-oil.avif',
        ),
        selectionInputs: [
          'Fluid type, base stock and additive chemistry',
          'Laboratory evidence identifying the degradation or contamination mechanism',
          'Soluble, insoluble or deposit-forming state of the target material',
          'Oxidation, thermal or electrostatic stress history',
          'Water and particulate condition that may require parallel treatment',
          'Contaminant loading and expected generation rate',
          'Compatible adsorption, ion-exchange or remediation medium',
          'Offline flow, reservoir turnover and available treatment time',
          'Required endpoint and laboratory verification method',
          'Root-cause correction plan for recurring degradation',
        ],
        engineeringNotes: [
          {
            title: 'Remediation begins with diagnosis',
            body: 'OILREVEX™ is not selected simply because oil appears dark or equipment has deposits. Fluid analysis must distinguish oxidation products, varnish potential, acidic species, sludge, additive changes and other possible causes before a remediation medium is chosen.',
          },
          {
            title: 'Particulate filters do not remove every degradation product',
            body: 'Some oil-degradation products remain dissolved or semi-soluble until conditions cause them to deposit. Conventional particulate filtration can support cleanup but may not resolve the chemistry responsible for varnish or other deposits.',
          },
          {
            title: 'Media compatibility is part of the treatment',
            body: 'Adsorption and ion-exchange media can interact differently with base stocks, additives and degradation products. Treatment must be validated so the target contaminant is addressed without creating an unacceptable change in the fluid.',
          },
          {
            title: 'Rebound can indicate an active root cause',
            body: 'Rapid return of varnish potential or degradation indicators after treatment can point to continuing oxidation, thermal stress, electrostatic discharge, contamination or another unresolved generation mechanism.',
          },
          {
            title: 'The endpoint must be measured',
            body: 'Successful remediation is verified with appropriate fluid-condition data and operating evidence. Visual appearance alone is not a sufficient basis for declaring the oil restored.',
          },
        ],
        knowledgeCenterSlug: 'ip-flurexis-oilrevex-oil-condition-remediation',
        customFaqs: [
          ['What problems is OILREVEX™ intended to address?', 'OILREVEX™ addresses selected degradation products and chemistry-related contamination confirmed by fluid analysis, particularly conditions that are not resolved by conventional particulate filtration alone.'],
          ['Is OILREVEX™ simply a finer oil filter?', 'No. It is a remediation family selected from the diagnosed oil condition. Depending on the fluid and contaminant, the treatment can involve adsorption, ion exchange or another validated offline medium in addition to particulate control.'],
          ['Why is laboratory analysis required before treatment?', 'Different symptoms can originate from oxidation, water, particles, additive changes, acidity or deposit-forming degradation products. The treatment mechanism should match the confirmed cause rather than the visual symptom.'],
          ['What causes remediation results to rebound?', 'If oxidation, thermal stress, electrostatic effects, contamination or another degradation source remains active, the target contaminant can regenerate after treatment. Root-cause correction is therefore part of the remediation plan.'],
        ],
      },
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
