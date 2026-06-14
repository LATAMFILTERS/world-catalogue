import { catalogue, getSlug, getItemBySlug } from '@/lib/catalogue';
import { CategoryPage } from '@/components/CategoryPage';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

// Map industry names to image and video paths
const industryMedia: Record<string, { image?: string; video?: string }> = {
  'Agriculture': {
    image: '/images/agriculture.avif',
    video: '/images/Agriculture-2.mp4',
  },
  'Automotive': {
    image: '/images/autos-02.avif',
    video: '/images/Autos-Vin4.mp4',
  },
  'Bus Coach': {
    image: '/images/bus-hero.avif',
    video: '/images/buses-2.mp4',
  },
  'Construction': {
    image: '/images/construccion.avif',
    video: '/images/construction-2.mp4',
  },
  'Manufacturing': {
    image: '/images/manufacture.avif',
    video: '/images/Manufacture-1.mp4',
  },
  'Marine': {
    image: '/images/marine-2_converted.avif',
    video: '/images/Marino-1.mp4',
  },
  'Mining': {
    image: '/images/mineria.avif',
    video: '/images/Mina-Video-1.mp4',
  },
  'Oil Gas': {
    image: '/images/oil&gas.avif',
    video: '/images/Petro&Gas-1.mp4',
  },
  'Power Generation': {
    image: '/images/power-generator.avif',
    video: '/images/powergenerator-Video-1.mp4',
  },
  'Railway': {
    image: '/images/trenes.avif',
    video: '/images/Train.mp4',
  },
  'Trucks Fleets': {
    image: '/images/trucks-1.avif',
    video: '/images/Trucks&Feel-1.mp4',
  },
  'Waste Municipal': {
    image: '/images/wasted.avif',
    video: '/images/wasted-2.mp4',
  },
  // Add more industries as images/videos are provided
};

interface GeoData {
  directAnswer: string;
  faq: { q: string; a: string }[];
  lastUpdated: string;
  schemas: object[];
  ctaTitle?: string;
  ctaDescription?: string;
  protectionLabel?: string;
  videoSectionName?: string;
  protectedAssets?: string[];
  protectionSystems?: string[];
  techFocus?: string;
  knowledgeLinks?: { label: string; href?: string }[];
  preCtaQuote?: { line1: string; line2: string };
}

const industryGeoData: Record<string, GeoData> = {
  'Automotive': {
    lastUpdated: 'May 2026',
    protectionLabel: 'STRATEGY',
    protectionSystems: [
      'Air Intake & Airflow Protection',
      'Lubrication Protection',
      'Fuel Cleanliness Protection',
      'Cabin Air Quality Protection',
    ],
    knowledgeLinks: [
      { label: 'Air Intake & Airflow Protection', href: '/knowledge-system/standards/air-intake-systems' },
      { label: 'Fuel Cleanliness Protection', href: '/knowledge-system/standards/fuel-systems' },
      { label: 'Lubrication Protection', href: '/knowledge-system/standards/lube-oil-systems' },
      { label: 'Cabin Air Quality Protection', href: '/knowledge-system/standards/cabin-safety-systems' },
    ],
    preCtaQuote: {
      line1: 'We do not define ourselves by the products we sell.',
      line2: 'We define ourselves by the assets we protect.',
    },
    ctaTitle: 'Ready to Protect Your Vehicle Systems?',
    ctaDescription: 'Find the right automotive asset protection system for your vehicle platform. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS automotive asset protection systems are engineered for passenger vehicles and commercial vehicles operating under continuous thermal cycling, urban stop-and-go traffic, and highway airflow variation. Modern direct injection engines operate at fuel injection pressures of 150–350 bar — conditions where contamination accumulation in fuel delivery systems causes injector wear within 30,000–80,000 km of mixed-duty operation. Urban air intake environments expose vehicle engines to particulate concentrations of 150–300 µg/m³, while cold-start thermal cycling generates oil dilution and soot accumulation that degrades lubrication cleanliness across extended service intervals. Proprietary protection media maintains air intake efficiency, lubrication cleanliness, fuel system integrity, and cabin air quality throughout standard and extended automotive service schedules.',
    faq: [
      {
        q: 'What asset protection systems do passenger and commercial vehicles require?',
        a: 'Passenger and commercial vehicles require air intake protection (MACROCORE™ or SYNTEPORE™), lubrication system protection (SYNTRAX™), fuel system protection, and cabin air quality protection (MICROKAPPA™). Air intake systems must maintain consistent airflow volume across urban particulate exposure and highway speed variation. Lubrication systems must preserve ISO 4406 cleanliness targets through cold-start thermal cycling, short-trip operation, and extended highway intervals. Fuel systems in direct injection engines operating at 150–350 bar injection pressure require particulate and water contamination control to prevent injector erosion and stiction.',
      },
      {
        q: 'How does thermal cycling affect engine lubrication system performance in passenger vehicles?',
        a: 'Each cold-start cycle introduces fuel dilution and combustion byproducts into engine oil before operating temperature is reached. In urban driving patterns, vehicles completing multiple cold-start cycles per day — typical for fleet, commuter, and delivery vehicle applications — accumulate soot and fuel dilution in lubrication oil at significantly higher rates than steady-state highway operation. Soot concentrations above 2% by weight degrade oil film strength and increase bearing wear rates. SYNTRAX™ lubrication system protection maintains oil cleanliness within target parameters across short-trip urban, highway, and mixed-duty driving cycles, supporting consistent bearing and valve train protection between service intervals.',
      },
      {
        q: 'Why do direct injection gasoline and diesel engines require higher-efficiency fuel system protection?',
        a: 'Direct injection engines — including GDI, TFSI, and common-rail diesel systems — operate at fuel injection pressures between 150 and 2,500 bar depending on engine type. At these pressures, particulate contamination above 10 µm causes injector tip erosion, and free water above 200 ppm causes corrosion and stiction in injector needle components. Unlike port injection systems where fuel washes intake valves, direct injection bypasses this cleaning mechanism, making fuel system cleanliness critical for long-term combustion efficiency and emissions compliance. Fuel system protection maintains fuel cleanliness within ISO 12156 lubricity and contamination targets throughout the service interval.',
      },
      {
        q: 'What does MICROKAPPA™ cabin air quality protection provide in passenger vehicle applications?',
        a: 'MICROKAPPA™ provides multi-stage cabin air quality protection for passenger and commercial vehicles operating in urban traffic environments. Urban roadway environments generate PM2.5 concentrations of 20–80 µg/m³ at street level, along with nitrogen dioxide, ozone, and volatile organic compounds from surrounding traffic. MICROKAPPA™ combines mechanical HEPA-grade particle filtration with activated carbon adsorption media, reducing cabin PM2.5 concentration by up to 85% compared to standard single-layer cabin filters. In commercial vehicles, fleet vehicles, and passenger cars used in high-density urban operation, cabin air quality protection reduces occupant exposure to combustion particulate and traffic-generated pollutants throughout daily driving schedules.',
      },
      {
        q: 'How do extended automotive service intervals affect engine reliability in mixed-duty vehicles?',
        a: 'Extended service intervals in mixed-duty vehicles — combining urban stop-and-go, short-trip, and highway operation — must account for accelerated contamination accumulation during cold-start cycles and low-speed urban driving. Standard OEM service intervals are typically calibrated for average driving conditions. Vehicles completing predominantly urban short-trip cycles accumulate lubrication degradation at two to three times the rate of steady-state highway vehicles within the same calendar interval. ELIMFILTERS automotive protection systems are engineered to maintain air intake restriction below OEM threshold limits and lubrication cleanliness within ISO 4406 targets across urban, highway, and mixed-duty service intervals.',
      },
      {
        q: 'What is the long-term engine performance impact of contamination in automotive applications?',
        a: 'Contamination accumulation in automotive engine systems produces measurable performance degradation over time. Air intake restriction of 5–10% above clean-element baseline increases fuel consumption by 1–3% and reduces power output in turbocharged engines. Lubrication degradation beyond ISO 4406 cleanliness targets accelerates cam lobe and bearing wear, increasing engine rebuild frequency in high-mileage vehicles. Injector contamination in direct injection engines reduces fuel atomization efficiency, increasing hydrocarbon emissions and reducing combustion efficiency by 2–5%. In fleet and commercial vehicles where fuel cost per kilometer is a primary operational metric, contamination control systems that preserve engine efficiency contribute directly to long-term operating cost reduction.',
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Automotive Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Automotive asset protection systems engineered for passenger and commercial vehicles operating under thermal cycling, urban stop-and-go traffic, and highway conditions. Air intake, lubrication, fuel system, and cabin air quality protection for mixed-duty vehicle operation.',
        areaServed: 'Global',
        serviceType: 'Automotive Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Automotive Asset Protection Systems', item: 'https://elimfilters.com/industries/automotive' },
        ],
      },
    ],
  },
  'Construction': {
    lastUpdated: 'May 2026',
    protectionLabel: 'STRATEGY',
    protectedAssets: [
      'Excavators',
      'Wheel Loaders',
      'Bulldozers',
      'Motor Graders',
      'Articulated Dump Trucks',
    ],
    knowledgeLinks: [
      { label: 'Air Intake & Airflow Protection', href: '/knowledge-system/standards/air-intake-systems' },
      { label: 'Hydraulic Protection', href: '/knowledge-system/standards/hydraulic-systems' },
      { label: 'Fuel Cleanliness Protection', href: '/knowledge-system/standards/fuel-systems' },
    ],
    preCtaQuote: {
      line1: 'We do not define ourselves by the products we sell.',
      line2: 'We define ourselves by the assets we protect.',
    },
    ctaTitle: 'Ready to Protect Your Construction Equipment?',
    ctaDescription: 'Find the right heavy equipment asset protection system for your construction equipment platform. Cross-reference 500,000+ parts.',
    directAnswer: 'Construction equipment operates in environments with ambient silica dust concentrations ranging from 3,000 mg/m³ on earthwork sites to over 10,000 mg/m³ in tunneling operations — conditions that exceed ISO 5011 air filter test limits by a factor of 10 to 30. ELIMFILTERS construction asset protection systems are engineered for excavators, wheel loaders, bulldozers, motor graders, and articulated machinery operating under continuous multi-shift duty cycles. Proprietary hybrid protection media provides high contaminant retention capacity for hydraulic system cleanliness, air intake protection, and fuel system integrity throughout extended off-road service schedules.',
    faq: [
      {
        q: 'What contamination risks do heavy construction equipment systems face on active job sites?',
        a: 'Heavy construction equipment faces four primary contamination vectors. First, airborne silica dust — generated by earthwork, demolition, and aggregate handling — reaches concentrations of 3,000–10,000 mg/m³, versus the ISO 5011 standard test limit of 300 mg/m³. Second, hydraulic pressure spikes during attachment switching, lifting, and trenching operations introduce particulate ingress risk at hydraulic connection points. Third, off-road fueling from field storage tanks introduces water contamination and sediment into fuel delivery systems. Fourth, vibration loading during continuous off-road operation accelerates seal wear and increases particulate ingress across lubrication and hydraulic circuits.',
      },
      {
        q: 'Why does hydraulic system protection matter for excavators and loaders operating on construction sites?',
        a: 'Construction equipment hydraulic systems operate at pressures of 250–450 bar and require ISO 4406 cleanliness targets of 16/14/11 or tighter to prevent proportional valve stiction, pump wear, and actuator degradation. Silica particles entering hydraulic circuits cause abrasive wear on valve spool surfaces, pump internals, and cylinder seals. At ISO 4406 contamination levels above 19/17/14, hydraulic valve failure rates increase by a factor of three to five. NANOFORCE™ hydraulic protection systems maintain cleanliness within design targets throughout extended multi-shift construction operations.',
      },
      {
        q: 'How does abrasive silica dust damage construction equipment air intake systems?',
        a: 'Silica dust has a Mohs hardness of 7 — harder than most engine component alloys. When silica particles bypass or accumulate in air intake protection systems, they enter combustion chambers and act as abrasive media against piston rings, cylinder liner surfaces, and turbocharger compressor blades. At dust concentrations of 3,000 mg/m³, standard OEM air elements reach full contamination capacity within 50–100 operating hours. MACROCORE™ air intake protection systems provide 40–60% greater media surface area than standard OEM elements, maintaining ISO 5011-compliant performance across extended service intervals in severe dust environments.',
      },
      {
        q: 'What role does fuel system protection play in off-road construction equipment operations?',
        a: 'Construction equipment diesel fuel is frequently stored in field tanks, transferred via portable dispensing units, and exposed to condensation during temperature cycling. This fuel delivery chain introduces water contamination, sediment, and microbial growth into fuel systems. Modern common-rail injection systems in construction equipment operate at injection pressures of 1,800–2,500 bar — pressure levels where water and particulate contamination cause injector erosion and stiction within 200–500 operating hours. HYDROCORE™ fuel system protection achieves 99.8% free water removal and 95% emulsified water reduction, protecting common-rail injection components during continuous off-road operation.',
      },
      {
        q: 'How do extended service intervals affect heavy construction equipment availability on active projects?',
        a: 'Unplanned maintenance stops on active construction sites create direct schedule and cost impacts. Taking an excavator or loader out of service on a time-critical earthwork or foundation project generates delays that cascade across the project schedule. Extended service interval protection systems reduce the frequency of planned maintenance events without exceeding ISO 4406 hydraulic cleanliness targets or ISO 5011 air filter restriction limits. ELIMFILTERS construction protection systems are engineered to support severe-duty service intervals through high contaminant retention capacity and differential pressure monitoring compatibility.',
      },
      {
        q: 'What are the financial consequences of hydraulic contamination failure in heavy construction equipment?',
        a: 'Hydraulic system contamination failure in heavy construction equipment generates direct and indirect costs. Direct costs include hydraulic pump replacement ($8,000–35,000), proportional valve replacement ($2,000–15,000 per valve), and hydraulic cylinder seal replacement. Indirect costs include equipment downtime ($5,000–25,000 per day for large excavators and loaders depending on project type), crane or substitute equipment mobilization, and project schedule delay penalties. Hydraulic contamination failure — where ISO 4406 cleanliness targets are exceeded — is the leading cause of unplanned maintenance events in construction equipment fleets, accounting for 40–60% of hydraulic system repair costs.',
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Construction Equipment Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Heavy construction equipment asset protection systems engineered for excavators, wheel loaders, bulldozers, and motor graders operating in abrasive silica dust environments with hydraulic pressure spikes, off-road fuel contamination, and continuous multi-shift duty cycles.',
        areaServed: 'Global',
        serviceType: 'Industrial Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Construction Equipment Asset Protection Systems', item: 'https://elimfilters.com/industries/construction' },
        ],
      },
    ],
  },
  'Bus Coach': {
    lastUpdated: 'May 2026',
    protectionLabel: 'STRATEGY',
    videoSectionName: 'BUS & COACH',
    techFocus: 'Primary Technology Focus: DRYCORE™ Pneumatic Protection',
    knowledgeLinks: [
      { label: 'Air Intake & Airflow Protection', href: '/knowledge-system/standards/air-intake-systems' },
      { label: 'Compressed Air Protection', href: '/knowledge-system/standards/compressed-air-systems' },
      { label: 'Cabin Air Quality Protection', href: '/knowledge-system/standards/cabin-safety-systems' },
      { label: 'Lubrication Protection', href: '/knowledge-system/standards/lube-oil-systems' },
    ],
    preCtaQuote: {
      line1: 'We do not define ourselves by the products we sell.',
      line2: 'We define ourselves by the assets we protect.',
    },
    ctaTitle: 'Ready to Protect Your Transit Fleet?',
    ctaDescription: 'Find the right transit asset protection system for your bus or coach fleet application. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS bus and coach asset protection systems are engineered for diesel transit buses, intercity coaches, and articulated urban vehicles. Urban transit engines complete 1,200–2,000 cold-start and partial-load cycles per week. Each cycle introduces combustion particulate and fuel dilution into engine oil. Soot contamination accumulates at three to five times the rate of highway applications. ELIMFILTERS systems maintain engine lube oil cleanliness, pneumatic brake system air purity to ISO 8573-1 Class 2 standards, cabin airflow quality, and fuel system protection throughout extended transit service schedules.',
    faq: [
      {
        q: 'What asset protection systems do transit buses require?',
        a: 'Transit buses require engine lube oil protection (SYNTRAX™), air intake contamination control (MACROCORE™), pneumatic system air drying (DRYCORE™), and cabin air quality protection (MICROKAPPA™). Urban duty cycles generate high rates of soot and combustion particulate contamination in engine oil. Pneumatic braking systems require compressed air purified to ISO 8573-1 Class 2 standards to maintain brake actuation reliability. Cabin air protection systems must reduce PM2.5 exposure for drivers completing 6–12 hour daily operating schedules.',
      },
      {
        q: 'Why does urban stop-and-go operation accelerate engine contamination in transit buses?',
        a: 'Urban stop-and-go duty cycles generate engine oil contamination at significantly higher rates than steady-speed highway operation. Each cold-start cycle introduces fuel dilution and combustion byproducts into engine oil. Partial-load idling increases soot concentration in lube oil by 30–50% compared to steady-state operation. Engines completing 200–400 stop-start cycles per day accumulate soot contamination that degrades bearing film strength and increases abrasive wear rates. SYNTRAX™ lube oil protection systems maintain ISO 4406 cleanliness codes to preserve bearing reliability throughout extended service intervals.',
      },
      {
        q: 'What is the role of pneumatic system protection in transit bus fleet reliability?',
        a: 'Transit buses rely on pneumatic braking systems that require compressed air purified to ISO 8573-1 standards. Moisture contamination in pneumatic lines causes brake control valve corrosion, actuator failure, and brake response degradation. DRYCORE™ compressed air drying systems remove moisture to achieve dew point targets below -20°C at system pressure. This prevents condensation damage to brake control valves, suspension actuators, and door mechanisms. Pneumatic system contamination is a primary cause of unscheduled maintenance interruptions in urban transit fleets.',
      },
      {
        q: 'What does MICROKAPPA™ cabin air protection provide for passenger transport applications?',
        a: 'MICROKAPPA™ is the cabin environment protection system for passenger transport applications. Urban buses operate in environments with elevated concentrations of particulate matter (PM2.5, PM10), nitrogen dioxide, and diesel exhaust compounds generated by surrounding traffic. MICROKAPPA™ provides multi-stage protection combining HEPA-grade mechanical filtration with activated carbon media. This reduces cabin PM2.5 concentration by up to 85% compared to standard HVAC systems. Cabin air quality directly affects occupational health conditions for drivers operating continuous daily schedules in high-pollution urban corridors.',
      },
      {
        q: 'How do extended service intervals affect transit fleet operational continuity?',
        a: 'Extended service intervals reduce the total number of scheduled maintenance stops per vehicle per year. A transit bus completing 250 operating hours per month with a 250-hour lube oil service interval requires 12 maintenance events per year. Extending the interval to 400 hours reduces maintenance events to approximately 7.5 per year — a 37% reduction in scheduled downtime. SYNTRAX™ and MACROCORE™ protection systems are engineered to support extended service intervals without exceeding ISO 4406 cleanliness targets or system restriction thresholds.',
      },
      {
        q: 'What are the financial consequences of unplanned transit bus downtime from contamination failure?',
        a: 'Unplanned transit bus downtime carries direct and indirect financial consequences for fleet operators. Direct costs include emergency repair labor ($150–350 per hour), expedited parts procurement, and in-field service deployment. Indirect costs include route coverage penalties, replacement vehicle deployment, and service level agreement obligations. Fleet downtime costs for urban transit operators range from $500–1,500 per vehicle per day depending on network coverage requirements. Contamination control systems reduce the primary mechanical failure pathways — soot-related bearing wear, pneumatic valve corrosion, and fuel injector contamination — that generate unplanned maintenance events.',
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Bus & Coach Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Transit fleet asset protection systems engineered for diesel buses, intercity coaches, and articulated urban vehicles operating under continuous stop-and-go duty cycles with high-rate soot, combustion particulate, and pneumatic system contamination.',
        areaServed: 'Global',
        serviceType: 'Industrial Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Bus & Coach Asset Protection Systems', item: 'https://elimfilters.com/industries/bus-coach' },
        ],
      },
    ],
  },
  'Manufacturing': {
    lastUpdated: 'May 2026',
    protectionLabel: 'STRATEGY',
    protectedAssets: [
      'Industrial Engines',
      'Compressors',
      'Pumps',
      'Hydraulic Presses',
      'Injection Molding Machines',
      'CNC Equipment',
      'Conveyor Systems',
    ],
    knowledgeLinks: [
      { label: 'Hydraulic Protection', href: '/knowledge-system/standards/hydraulic-systems' },
      { label: 'Air Intake & Airflow Protection', href: '/knowledge-system/standards/air-intake-systems' },
      { label: 'Lubrication Protection', href: '/knowledge-system/standards/lube-oil-systems' },
      { label: 'Fuel Cleanliness Protection', href: '/knowledge-system/standards/fuel-systems' },
    ],
    preCtaQuote: {
      line1: 'We do not define ourselves by the products we sell.',
      line2: 'We define ourselves by the assets we protect.',
    },
    ctaTitle: 'Ready to Protect Your Production Equipment?',
    ctaDescription: 'Find the right manufacturing asset protection system for your industrial equipment application. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS manufacturing asset protection systems are engineered for industrial engines, hydraulic systems, compressors, pumps, conveyors, and production equipment operating under continuous manufacturing duty cycles. Manufacturing environments generate airborne particulate contamination at concentrations dependent on process type — metalworking and casting generate silica and metal particle loads, textile and packaging lines generate fiber and dust accumulation. Hydraulic systems in production equipment require cleanliness targets of ISO 16/14/11 or tighter to prevent proportional valve stiction and actuator degradation. ELIMFILTERS systems maintain air intake efficiency, lubrication cleanliness, fuel system integrity, and hydraulic protection throughout extended manufacturing service schedules.',
    faq: [
      {
        q: 'What asset protection systems do manufacturing facility equipment require?',
        a: 'Industrial manufacturing equipment requires air intake protection (MACROCORE™), hydraulic system contamination control (NANOFORCE™), lubrication cleanliness protection (SYNTRAX™), and fuel system protection (HYDROCORE™). Compressors and industrial engines require air intake protection matched to the particulate profile of the production environment. Hydraulic systems in presses, injection molding equipment, and CNC machinery require ISO 16/14/11 or tighter cleanliness to prevent proportional valve failure and actuator wear. Lubrication systems in pumps, gearboxes, and rotating production machinery require contamination control to maintain bearing film strength across extended operating hours.',
      },
      {
        q: 'How does airborne particulate contamination affect industrial production equipment?',
        a: 'Manufacturing environments generate continuous airborne particulate from machining operations, casting, grinding, packaging dust, and process byproducts. These particles enter air intake systems, contaminate lubrication circuits through shaft seals, and accumulate in hydraulic reservoirs. Particles above 10 µm cause abrasive wear in pump internals and bearing surfaces. Particles below 10 µm penetrate lubrication films and generate sub-surface fatigue in bearing races. ISO 16889 defines Beta ratio efficiency targets for hydraulic filtration — a Beta(10)≥200 filter captures 99.5% of particles at 10 µm, which is the threshold for proportional valve spool wear in production equipment.',
      },
      {
        q: 'Why is hydraulic contamination control critical for production line reliability?',
        a: 'Hydraulic systems in manufacturing equipment — presses, injection molding machines, automated conveyor drives, and robotic actuators — operate at pressures of 200–350 bar. At these pressures, particle contamination causes proportional valve spool wear, internal leakage, and actuator position drift. ISO 4406 cleanliness codes define acceptable contamination levels: most production hydraulic systems require 16/14/11 or cleaner. Degraded cleanliness to 18/16/14 reduces proportional valve service life by 40–60% and increases actuator seal replacement frequency. Continuous hydraulic filtration with NANOFORCE™ sub-micron media maintains ISO 4406 targets throughout extended production intervals.',
      },
      {
        q: 'What is the role of lubrication cleanliness in manufacturing equipment reliability?',
        a: 'Rotating production equipment — pumps, compressors, gearboxes, and spindle bearings — depends on oil film cleanliness to maintain bearing clearances and prevent abrasive wear. ISO 4406 lube oil cleanliness targets for industrial equipment typically range from 16/14/11 to 15/13/10 depending on bearing type and operating speed. Contaminated lube oil reduces bearing service life by 50–70% compared to target cleanliness. SYNTRAX™ lube oil protection systems maintain ISO 4406 targets by capturing combustion soot, metal wear particles, and process-environment contaminants that enter through shaft seals and vent points during continuous production operation.',
      },
      {
        q: 'How do extended service intervals support manufacturing production continuity?',
        a: 'Scheduled maintenance on production equipment creates planned downtime that can be coordinated with production schedules. However, shortened service intervals caused by accelerated contamination increase the frequency of production interruptions and maintenance labor costs. ELIMFILTERS manufacturing asset protection systems are engineered to maintain ISO 4406 and ISO 5011 compliance throughout extended service intervals — typically 500–1,000 hours for air intake systems and 250–500 hours for lube and hydraulic systems in continuous production environments. Extended intervals reduce the total number of maintenance events per year per machine, supporting higher overall equipment effectiveness (OEE) targets.',
      },
      {
        q: 'What are the financial consequences of contamination-related equipment failure in manufacturing?',
        a: 'Contamination-related failure in production equipment carries direct repair costs and indirect production loss costs. A hydraulic proportional valve failure on a production press requires 4–8 hours of unplanned downtime plus parts costs of $800–3,000. On a production line generating $5,000–20,000 per hour of output, a single contamination-related failure costs $20,000–160,000 in lost production per incident. Compressor failure from lubrication contamination can shut down pneumatic production lines for 12–48 hours. Contamination control systems that prevent these failure modes deliver ROI through avoided downtime, not filter cost savings — filter cost represents less than 2% of the total cost of a contamination-related equipment failure.',
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Manufacturing Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Industrial manufacturing asset protection systems engineered for engines, hydraulic systems, compressors, pumps, conveyors, and production equipment operating under continuous manufacturing duty cycles with airborne particulate, hydraulic impurity, and lubrication contamination challenges.',
        areaServed: 'Global',
        serviceType: 'Industrial Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Manufacturing Asset Protection Systems', item: 'https://elimfilters.com/industries/manufacturing' },
        ],
      },
    ],
  },
  'Marine': {
    lastUpdated: 'May 2026',
    protectionLabel: 'STRATEGY',
    protectedAssets: [
      'Commercial Vessels',
      'Fishing Fleets',
      'Offshore Support Vessels',
      'Marine Diesel Engines',
      'Deck Machinery',
      'Hydraulic Crane Systems',
      'Steering Systems',
    ],
    techFocus: 'MARINECLEAN™ — Marine-specific complementary technology for offshore and salt-air operating environments.',
    knowledgeLinks: [
      { label: 'Fuel Cleanliness Protection', href: '/knowledge-system/standards/fuel-systems' },
      { label: 'Hydraulic Protection', href: '/knowledge-system/standards/hydraulic-systems' },
      { label: 'Air Intake & Airflow Protection', href: '/knowledge-system/standards/air-intake-systems' },
      { label: 'Lubrication Protection', href: '/knowledge-system/standards/lube-oil-systems' },
    ],
    preCtaQuote: {
      line1: 'We do not define ourselves by the products we sell.',
      line2: 'We define ourselves by the assets we protect.',
    },
    ctaTitle: 'Ready to Protect Your Marine Equipment?',
    ctaDescription: 'Find the right marine asset protection system for your vessel or offshore equipment application. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS marine asset protection systems are engineered for commercial vessels, workboats, fishing fleets, and offshore support equipment operating under continuous salt-air exposure, humidity saturation, and long-duration marine duty cycles. Marine diesel engines accumulate fuel water contamination, salinity ingestion, and lubrication degradation at rates significantly higher than land-based applications. Onboard hydraulic systems require contamination control matched to vibration loading and intermittent high-pressure operation. ELIMFILTERS systems maintain fuel cleanliness to ASTM D6304 water separation standards, air intake integrity, lubrication cleanliness, and hydraulic protection throughout extended marine service intervals.',
    faq: [
      {
        q: 'What asset protection systems do marine diesel engines require?',
        a: 'Marine diesel engines require fuel and water separation protection (HYDROCORE™), air intake contamination control (MACROCORE™), lubrication cleanliness protection (SYNTRAX™), and hydraulic system protection (NANOFORCE™). Fuel systems on commercial vessels are exposed to water contamination from tank condensation and bunkered fuel quality variation. HYDROCORE™ achieves 99.8% free water removal and 95% emulsified water reduction, protecting common-rail marine injectors from corrosion and stiction failure. Air intake systems must control airborne salinity that causes compressor blade corrosion and increases engine deposit formation rates.',
      },
      {
        q: 'How does salt-air exposure affect onboard equipment contamination in marine applications?',
        a: 'Salt-laden marine air contains sodium chloride particles at concentrations of 1–10 mg/m³ in near-surface offshore environments. These particles enter air intake systems and deposit on compressor blades, intercoolers, and intake valves. Salt deposition accelerates corrosion of aluminum alloy engine components and increases intake restriction over time. In engine oil, salinity entry through crankcase ventilation systems generates electrolytic corrosion of bearing surfaces. MACROCORE™ salt-air contamination control uses cellulose-synthetic composite media with a hydrophobic treatment that captures saltwater aerosol while maintaining intake airflow volume across extended marine service intervals.',
      },
      {
        q: 'Why is fuel and water separation critical for marine diesel engine reliability?',
        a: 'Marine diesel fuel stored in vessel tanks accumulates water through condensation, wave agitation mixing, and bunkered fuel quality variation. Water contamination in marine fuel causes injector corrosion, microbial growth that blocks fuel lines, and cavitation damage in high-pressure fuel pumps operating at 800–2,000 bar in modern common-rail marine engines. ASTM D6304 defines water content standards for diesel fuel — marine storage conditions frequently exceed these limits without active water separation. HYDROCORE™ turbine-stage water separation removes free and emulsified water before fuel reaches injection components, preventing the corrosion and stiction failure modes that cause unscheduled engine downtime on commercial vessels.',
      },
      {
        q: 'What is the role of hydraulic system protection on commercial vessels and offshore equipment?',
        a: 'Marine hydraulic systems control steering gear, deck machinery, crane operations, hatch mechanisms, and anchor windlass systems. These systems operate at 200–350 bar under vibration loading from hull flexure and wave impact. Vibration accelerates hydraulic fluid aeration and particle generation from pump wear. Saltwater ingress through deck seals contaminates hydraulic reservoirs, causing valve corrosion and actuator seal failure. ISO 4406 hydraulic cleanliness targets for marine systems typically require 16/14/11 or cleaner. NANOFORCE™ sub-micron hydraulic filtration maintains ISO 4406 targets under continuous offshore operating conditions, preventing proportional valve stiction and actuator position drift.',
      },
      {
        q: 'How do extended service intervals support offshore vessel operational continuity?',
        a: 'Offshore vessels and commercial fishing fleets operate on schedules where maintenance port calls are costly and infrequent. A commercial fishing vessel that must return to port for an unscheduled filter change loses 24–72 hours of fishing operation plus fuel and crew costs of $5,000–25,000 per interrupted trip. Extended service intervals reduce the total number of scheduled maintenance events per deployment season. ELIMFILTERS marine asset protection systems are engineered to maintain ISO 4406 hydraulic cleanliness and ASTM D6304 fuel protection standards throughout intervals of 500–1,000 hours for appropriate marine applications, reducing port call frequency without exceeding contamination limits.',
      },
      {
        q: 'What are the financial consequences of contamination-related engine failure at sea?',
        a: 'Marine engine failure from contamination has direct and indirect costs that exceed land-based equivalent failures. A commercial vessel with a failed fuel injection pump caused by water contamination faces emergency port diversion costs ($10,000–50,000 for towing and harbor fees), parts procurement at remote locations (2–5x standard pricing), and lost operational revenue of $3,000–15,000 per day depending on vessel type. Offshore support vessels under contract face additional penalty clauses for missed operational windows. Contamination control systems that prevent these failure modes — fuel water separation, lubrication cleanliness, hydraulic protection — deliver ROI through avoided emergency response costs, not through filter unit savings.',
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Marine Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Marine asset protection systems engineered for commercial vessels, workboats, fishing fleets, and offshore support equipment operating under continuous salt-air exposure, humidity saturation, fuel storage contamination, and long-duration marine duty cycles.',
        areaServed: 'Global',
        serviceType: 'Marine Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Marine Asset Protection Systems', item: 'https://elimfilters.com/industries/marine' },
        ],
      },
    ],
  },
  'Oil Gas': {
    lastUpdated: 'May 2026',
    ctaTitle: 'Ready to Protect Your Energy Equipment?',
    ctaDescription: 'Find the right Oil & Gas asset protection system for your offshore or energy equipment application. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS Oil & Gas asset protection systems are engineered for offshore platforms, onshore facilities, drilling systems, compression equipment, turbines, pumps, generators, and engine-driven assets operating under corrosive atmospheres, H2S exposure, airborne salinity, and continuous severe-duty energy cycles. Gas turbine air intake systems require contamination control matched to airborne salinity concentrations of 1–10 mg/m³ in offshore environments. Hydraulic systems in drilling and compression equipment require ISO 16/14/11 or tighter cleanliness to prevent proportional valve stiction under high-pressure continuous operation. ELIMFILTERS systems maintain air intake efficiency, fuel cleanliness, lubrication stability, and hydraulic protection throughout extended Oil & Gas service schedules.',
    faq: [
      {
        q: 'What asset protection systems do offshore platforms and drilling equipment require?',
        a: 'Offshore platforms require air intake contamination control (MACROCORE™), fuel and water separation (HYDROCORE™), lubrication cleanliness protection (SYNTRAX™), compressed air drying (DRYCORE™), and hydraulic system protection. Gas turbines and diesel generators require air intake protection matched to offshore salt-laden air at 1–10 mg/m³ sodium chloride concentration. Diesel fuel stored in offshore tanks accumulates water from condensation and humidity absorption, requiring HYDROCORE™ turbine-stage water separation to maintain ASTM D6304 compliance. Hydraulic systems controlling drilling equipment, BOP stacks, and deck machinery require ISO 16/14/11 or tighter cleanliness to prevent valve stiction and actuator failure.',
      },
      {
        q: 'How does H2S exposure affect equipment contamination in Oil & Gas environments?',
        a: 'H2S gas present in sour crude production and refinery environments reacts with lubrication oil to form corrosive sulfur compounds that degrade bearing surfaces and attack seal materials. At concentrations above OSHA PEL of 20 ppm, H2S accelerates corrosion of copper alloy bearing cages and reduces lube oil alkalinity reserve. Engine oil contaminated with H2S-derived sulfur compounds shows accelerated viscosity degradation and increased total acid number (TAN) above acceptable limits. Lubrication protection systems engineered for sour service environments use synthetic media with enhanced chemical resistance to maintain contamination control despite H2S-laden crankcase environments.',
      },
      {
        q: 'Why is fuel cleanliness protection critical for gas turbines and engine-driven compression equipment?',
        a: 'Gas turbines operating on liquid fuel require fuel cleanliness to ISO 4406 targets of 15/13/10 or cleaner to prevent combustion nozzle erosion and fuel control valve stiction. Diesel generators on offshore platforms operate on stored fuel that accumulates water, microbial growth, and particulate contamination from tank corrosion. HYDROCORE™ achieves 99.8% free water removal and 95% emulsified water reduction, protecting high-pressure fuel pumps operating at 800–2,000 bar in common-rail diesel systems. Contaminated fuel in gas turbines causes hot section corrosion, nozzle blockage, and combustion instability that increases maintenance frequency and reduces turbine availability.',
      },
      {
        q: 'What role does air intake protection play in offshore turbine and compressor reliability?',
        a: 'Gas turbines and centrifugal compressors on offshore platforms draw air containing sodium chloride, sulfur compounds, and particulate contamination from the marine atmosphere. Salt deposition on compressor blades reduces stage efficiency by 2–5% per 1,000 operating hours without effective air intake protection. Particulate ingestion above 5 µm causes compressor blade erosion that permanently reduces adiabatic efficiency. MACROCORE™ offshore air intake systems use salt-coalescing media with hydrophobic treatment to capture saltwater aerosol and particulate simultaneously, maintaining compressor inlet air purity within ISO 8573-1 Class 2 standards across extended offshore service intervals.',
      },
      {
        q: 'How do extended service intervals support Oil & Gas operational continuity in remote locations?',
        a: 'Offshore platforms, subsea support vessels, and remote onshore facilities operate under logistical constraints that make frequent maintenance interventions costly. Helicopter or vessel logistics for offshore filter changes cost $3,000–15,000 per maintenance call when accounting for mobilization, personnel, and weather delays. Extended service intervals reduce the total number of logistics events per year per installation. ELIMFILTERS Oil & Gas protection systems are engineered to maintain ISO 4406 hydraulic cleanliness, ASTM D6304 fuel purity, and ISO 5011 air intake performance throughout 500–1,500 hour intervals for appropriate applications, reducing offshore logistics frequency without exceeding contamination control limits.',
      },
      {
        q: 'What are the financial consequences of contamination-related equipment failure in Oil & Gas operations?',
        a: 'Equipment failure in Oil & Gas operations carries production loss costs that are an order of magnitude higher than maintenance intervention costs. An offshore generator failure from fuel water contamination causes platform power reduction affecting production at $50,000–500,000 per day depending on platform output. Hydraulic system failure in drilling equipment causes rig downtime at $150,000–500,000 per day for deepwater drilling rigs under day-rate contracts. Compressor failure from lubrication contamination in a gas processing facility can interrupt pipeline delivery obligations with contractual penalty exposure. Contamination control systems represent less than 1% of equipment replacement cost but prevent the primary failure modes that cause production interruption events.',
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Oil & Gas Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Oil & Gas asset protection systems engineered for offshore platforms, drilling systems, compression equipment, turbines, pumps, generators, and engine-driven assets operating under corrosive atmospheres, H2S exposure, airborne salinity, and severe-duty energy cycles.',
        areaServed: 'Global',
        serviceType: 'Energy Equipment Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Oil & Gas Asset Protection Systems', item: 'https://elimfilters.com/industries/oil-gas' },
        ],
      },
    ],
  },
  'Power Generation': {
    lastUpdated: 'May 2026',
    ctaTitle: 'Ready to Protect Your Power Systems?',
    ctaDescription: 'Find the right power generation asset protection system for your generator or energy equipment platform. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS power generation asset protection systems are engineered for standby generators, prime power systems, industrial diesel engines, and emergency backup equipment operating under continuous thermal loading, standby cycling, and fuel storage exposure. Standby diesel fuel stored beyond 6–12 months without treatment accumulates water through condensation, microbial growth, and oxidative degradation — all of which compromise common-rail injector systems operating at 800–2,000 bar fuel pressure. Generator air intake systems must maintain consistent airflow volume under variable ambient conditions to support stable combustion and rated power output. ELIMFILTERS systems preserve fuel cleanliness to NFPA 110 standards, airflow stability, and lubrication reliability throughout continuous and intermittent power generation service intervals.',
    faq: [
      {
        q: 'What protection systems do standby diesel generators require?',
        a: 'Standby generators require fuel cleanliness protection (HYDROCORE™), air intake protection (SYNTEPORE™), lubrication reliability protection (SYNTRAX™), and compressed air drying (DRYCORE™) for pneumatic controls. Standby generators face a contamination challenge distinct from continuous-run equipment: fuel stored in tanks during standby periods accumulates water from daily condensation cycles, microbial growth that generates acidic byproducts, and oxidative degradation that forms gum and varnish deposits. NFPA 110 defines fuel quality standards for emergency power systems — without active fuel treatment and filtration, standby fuel stored beyond 6 months frequently falls outside acceptable limits for injector-safe operation.',
      },
      {
        q: 'How does fuel degradation during standby periods affect generator reliability?',
        a: 'Diesel fuel in standby generator tanks undergoes progressive degradation when unused. Water accumulates from daily thermal cycling as humid air enters the fuel tank through the vent. Microbial organisms (bacteria, fungi) colonize the water-fuel interface and generate acidic metabolic byproducts that accelerate tank corrosion and produce biomass that blocks fuel filters. Oxidative instability causes fuel to polymerize into gum and varnish compounds that coat injector nozzles, reducing spray pattern quality and combustion efficiency. HYDROCORE™ water separation systems maintain free and emulsified water below ASTM D6304 thresholds, preventing the primary biological and oxidative degradation pathways that compromise standby fuel quality.',
      },
      {
        q: 'What air intake protection requirements apply to prime power and continuous-run generators?',
        a: 'Prime power generators operating in industrial environments face air intake contamination from dust, exhaust particulate, and process byproducts present in the facility air. Intake air contamination above 5 µm particle size reaches combustion chambers and causes abrasive wear of piston ring and cylinder liner surfaces. For industrial generators rated at 500 kW–5 MW operating 6,000–8,760 hours per year, intake air quality directly affects ring and liner replacement intervals. SYNTEPORE™ air intake protection systems use synthetic media with higher dust capacity than standard cellulose elements, maintaining ISO 5011-compliant restriction levels through extended 500–1,000 hour service intervals without efficiency degradation.',
      },
      {
        q: 'How does lubrication instability affect continuous-load generator engine reliability?',
        a: 'Diesel engines in continuous power generation operate at consistent thermal load for thousands of hours without shutdown. Unlike vehicle engines with cold-start cycles, generator engines reach steady-state oil temperature and maintain it throughout operation. This creates a different contamination profile: combustion soot accumulates continuously in lube oil, metal wear particles from piston rings and bearings build up over time, and fuel dilution from injector spray-pattern drift can thin oil viscosity below SAE specification. SYNTRAX™ lubrication protection systems maintain ISO 4406 cleanliness codes throughout extended service intervals for Caterpillar, Cummins, MTU, and Wärtsilä generator engines, supporting manufacturer-specified overhaul intervals.',
      },
      {
        q: 'Why do emergency backup power systems require contamination protection different from base-load generators?',
        a: 'Emergency backup systems — hospital generators, data center UPS diesels, critical infrastructure standby units — face a fundamentally different operational pattern than base-load generators. Base-load systems generate contamination continuously through normal combustion. Emergency systems accumulate contamination through inactivity: fuel degradation, condensation, oxidation, and microbial growth occur during standby periods measured in months. When an emergency system starts under load conditions, it must perform immediately at full rated output. NFPA 110 requires weekly or monthly test runs to verify operational readiness — and these test cycles can flush degraded fuel through injection systems if fuel quality has not been maintained. HYDROCORE™ and SYNTEPORE™ combined with periodic fuel conditioning maintain emergency system readiness between test cycles.',
      },
      {
        q: 'What are the financial consequences of contamination-related generator failure during a power outage?',
        a: 'Generator failure during a power outage carries financial consequences proportional to the criticality of the facility. A hospital data center losing backup power during a grid outage faces regulatory compliance exposure under Joint Commission and CMS standards in addition to equipment damage costs. A financial trading facility losing primary power generation faces revenue exposure of $1,000–10,000 per minute of downtime. An industrial plant losing prime power loses production output at $5,000–50,000 per hour depending on process type. The cost of contamination control systems for a 1 MW standby generator — approximately $2,000–5,000 per year in protection system service — is less than 0.1% of the financial exposure from a single contamination-related startup failure during a critical outage event.',
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Power Generation Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Power generation asset protection systems engineered for standby generators, prime power systems, industrial diesel engines, and emergency backup equipment operating under continuous thermal loading, standby cycling, and fuel storage exposure.',
        areaServed: 'Global',
        serviceType: 'Power Generation Equipment Protection',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Power Generation Asset Protection Systems', item: 'https://elimfilters.com/industries/power-generation' },
        ],
      },
    ],
  },
  'Railway': {
    lastUpdated: 'May 2026',
    ctaTitle: 'Ready to Protect Your Railway Equipment?',
    ctaDescription: 'Find the right railway asset protection system for your locomotive or rolling stock application. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS railway asset protection systems are engineered for diesel-electric locomotives, diesel multiple units (DMUs), shunting locomotives, and auxiliary power units operating under continuous traction loading, track ballast dust exposure, and multi-day service cycles. Locomotive diesel engines accumulate fuel system contamination from bulk fuel storage condensation, ballast silica dust ingestion through air intake systems, and soot build-up in lube oil across extended haul cycles. Pneumatic braking systems require compressed air to ISO 8573-1 Class 1–2 standards to maintain brake actuation reliability across ambient temperature ranges of -30°C to +55°C. ELIMFILTERS systems maintain fuel cleanliness, air intake performance, pneumatic air purity, and lubrication reliability throughout locomotive service intervals.',
    faq: [
      {
        q: 'What asset protection systems do diesel-electric locomotives require?',
        a: 'Diesel-electric locomotives require fuel and water separation protection (HYDROCORE™), air intake contamination control (MACROCORE™), lubrication cleanliness protection (SYNTRAX™), and pneumatic system drying (DRYCORE™). Locomotive diesel engines operate at continuous high-load conditions for 12–24 hour haul cycles, accumulating soot in lube oil at rates significantly higher than intermittent-load applications. Fuel stored in locomotive tanks accumulates water through thermal cycling condensation, requiring HYDROCORE™ water separation to maintain injection system cleanliness. Pneumatic braking systems require air dried to dew points below -20°C at system pressure to prevent moisture-related valve and actuator failure.',
      },
      {
        q: 'How does track ballast dust affect locomotive air intake and engine systems?',
        a: 'Track ballast consists of crushed granite and limestone aggregate with particle sizes of 1–100 mm, but abrasion from wheel-rail contact and ballast tamping operations generates fine silica dust at particle sizes of 2–50 µm that becomes airborne along the track corridor. Locomotives traveling at operational speeds entrain ballast dust into air intake systems at concentrations of 200–800 mg/m³ depending on track type and speed. Silica particles entering combustion chambers cause abrasive wear of piston rings and cylinder liners. MACROCORE™ air intake protection systems maintain ISO 5011 efficiency throughout extended locomotive service intervals in ballast dust environments, supporting manufacturer-specified ring and liner overhaul schedules.',
      },
      {
        q: 'Why is pneumatic system air purity critical for railway braking reliability?',
        a: 'Railway pneumatic braking systems operate at working pressures of 6–10 bar and control brake actuation for trains traveling at speeds up to 200 km/h. ISO 8573-1 Class 1–2 standards require compressed air with moisture dew points below -40°C at pressure and oil content below 0.1 mg/m³. Moisture in pneumatic brake lines causes ice formation at low ambient temperatures, valve seat corrosion at normal temperatures, and actuator seal degradation across thermal cycling. Brake valve failure from pneumatic contamination is a safety-critical event requiring immediate locomotive withdrawal from service. DRYCORE™ compressed air drying systems achieve ISO 8573-1 Class 2 dew point targets, maintaining brake system reliability across seasonal temperature ranges of -30°C to +55°C.',
      },
      {
        q: 'What is the impact of fuel water contamination on locomotive diesel engine performance?',
        a: 'Locomotive diesel engines in line-haul service use fuel stored in bulk depot tanks and transferred to locomotive fuel tanks during servicing. Bulk fuel storage accumulates water through tank breathing condensation, particularly in climates with significant day-night temperature differentials. Water contamination above ASTM D6304 thresholds causes fuel injector corrosion, microbial growth that generates acidic byproducts, and cavitation damage in high-pressure fuel pumps operating at 1,800–2,500 bar. Contamination-related injector failure in a locomotive diesel requires workshop removal and injector replacement at $800–2,500 per injector, with a typical 16-cylinder locomotive requiring 16 injectors. HYDROCORE™ turbine-stage water separation removes free and emulsified water from locomotive fuel before it reaches high-pressure injection components.',
      },
      {
        q: 'How do extended service intervals support railway fleet operational continuity?',
        a: 'Railway fleets operate on tightly scheduled maintenance windows between haul cycles. Reducing unscheduled maintenance events and extending planned service intervals increases fleet availability and reduces maintenance labor costs per vehicle kilometer. ELIMFILTERS locomotive protection systems are engineered to maintain ISO 4406 lube oil cleanliness, ASTM D6304 fuel purity, and ISO 8573-1 pneumatic air quality throughout extended service intervals appropriate for line-haul, commuter, and freight applications. Extended air intake service intervals — typically 500–1,000 hours for MACROCORE™ elements in controlled ballast dust environments — reduce the number of annual maintenance events per locomotive without exceeding system restriction thresholds.',
      },
      {
        q: 'What are the financial consequences of contamination-related locomotive failure in railway operations?',
        a: 'Locomotive failure in line-haul service generates direct repair costs and indirect network impact costs. A diesel-electric locomotive failure caused by fuel contamination requires in-field emergency repair or locomotive substitution, generating unplanned maintenance labor at $250–500 per hour plus parts costs. Delay to a freight train carries contractual penalty exposure of $500–3,000 per hour of delay depending on shipper agreement terms. Passenger train delays generate regulatory compliance exposure under national rail punctuality regimes. A single contamination-related locomotive failure that requires a traction unit change generates network knock-on delays affecting multiple subsequent services. Contamination control systems that prevent these failure modes represent a small fraction of the cost of a single operational delay event.',
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Railway Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Railway asset protection systems engineered for diesel-electric locomotives, DMUs, shunting locomotives, and auxiliary power units operating under continuous traction loading, track ballast dust exposure, and multi-day service cycles.',
        areaServed: 'Global',
        serviceType: 'Railway Equipment Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Railway Asset Protection Systems', item: 'https://elimfilters.com/industries/railway' },
        ],
      },
    ],
  },
  'Trucks Fleets': {
    lastUpdated: 'May 2026',
    ctaTitle: 'Ready to Protect Your Fleet Operations?',
    ctaDescription: 'Find the right fleet asset protection system for your commercial vehicle application. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS fleet asset protection systems are engineered for long-haul semi-trucks, regional delivery vehicles, and mixed commercial fleets operating under continuous HPCR diesel fuel system demands, turbocharged airflow requirements, and extended road service schedules. Modern common-rail diesel engines in heavy commercial vehicles operate at injection pressures of 1,800–2,500 bar — conditions where fuel contamination above ISO 4406 cleanliness targets causes injector wear and stiction within 150,000–250,000 km of mixed highway operation. Turbocharged diesel engines require consistent intake air volume to maintain combustion efficiency and turbocharger longevity across urban delivery, highway, and mountain gradient duty cycles. ELIMFILTERS systems maintain HPCR fuel cleanliness, air intake performance, lubrication reliability, and extended service interval support throughout commercial fleet operating schedules.',
    faq: [
      {
        q: 'What asset protection systems do heavy commercial trucks and fleet vehicles require?',
        a: 'Heavy commercial trucks require HPCR fuel system protection (HYDROCORE™), air intake contamination control (MACROCORE™), lubrication cleanliness protection (SYNTRAX™), and cabin air quality protection (MICROKAPPA™) for driver health compliance. Modern Euro VI and EPA 2024 compliant diesel engines operate at fuel injection pressures of 1,800–2,500 bar, where particle contamination above 10 µm causes injector needle wear and water contamination above 200 ppm causes corrosion and stiction. Air intake systems for turbocharged diesel engines must maintain consistent airflow volume across highway, urban, and mountain gradient operating conditions to support turbocharger efficiency and boost pressure stability.',
      },
      {
        q: 'How does HPCR injection system contamination affect long-haul truck engine reliability?',
        a: 'High-pressure common-rail injection systems operate at 1,800–2,500 bar with injector needle clearances of 1–3 µm. At these tolerances, particle contamination above 10 µm causes injector tip erosion and internal leakage. Water contamination above 200 ppm causes hydrogen embrittlement of injector needle components and accelerates corrosion of high-pressure pump internals. Free water enters diesel fuel through bulk fuel storage condensation and fueling from contaminated road stop tanks. Injector replacement in a heavy commercial truck costs $800–2,500 per injector, with a six-cylinder engine requiring six injectors per service event. HYDROCORE™ fuel system protection removes free and emulsified water to below ASTM D6304 thresholds and captures particulate above 3 µm before fuel reaches injection components.',
      },
      {
        q: 'What air intake protection do turbocharged commercial diesel engines require?',
        a: 'Turbocharged diesel engines in heavy commercial trucks require consistent intake air volume to maintain boost pressure within the 1.5–3.5 bar absolute range that supports rated torque at highway and mountain gradient loads. Air intake restriction above the OEM threshold limit — typically 3.75–6.25 kPa for heavy truck engines — reduces turbocharger efficiency and increases exhaust gas temperature, triggering derating modes that reduce power output. Road environments expose commercial truck air intake systems to particulate concentrations of 100–500 mg/m³ depending on terrain, season, and road surface. MACROCORE™ high-capacity air intake protection maintains ISO 5011 efficiency through extended 100,000–150,000 km service intervals without exceeding OEM restriction thresholds.',
      },
      {
        q: 'How does lubrication cleanliness affect heavy truck engine bearing reliability across extended service intervals?',
        a: 'Long-haul commercial trucks accumulate engine operating hours at 100,000–200,000 km per year. Extended oil drain intervals — common in fleet operations at 60,000–100,000 km with oil analysis programs — require lube oil protection systems that maintain ISO 4406 cleanliness targets throughout the full drain interval. Soot accumulation in diesel engine oil above 2% by weight degrades oil film strength, reducing main and connecting rod bearing protection. Carbon and combustion byproduct accumulation in lube oil above ISO 4406 code 17/15/12 accelerates abrasive wear of cam lobes, lifters, and valve train components. SYNTRAX™ lubrication protection maintains cleanliness within ISO 4406 targets throughout extended oil drain intervals for Volvo, Scania, MAN, Mercedes-Benz, and DAF commercial engines.',
      },
      {
        q: 'Why is cabin air quality protection relevant for commercial truck driver health compliance?',
        a: 'Long-haul truck drivers spend 9–11 hours per day in the vehicle cabin, accumulating sustained exposure to diesel exhaust particulate, road dust, and traffic-generated PM2.5 at concentrations of 30–80 µg/m³ in road environments. Extended occupational exposure to diesel exhaust particulate is classified as Group 1 carcinogen by IARC. EU Directive 2019/130 and national occupational health regulations impose PM2.5 exposure limits for professional drivers. MICROKAPPA™ multi-stage cabin air protection combines HEPA-grade mechanical filtration with activated carbon adsorption, reducing cabin PM2.5 concentration by up to 85% compared to single-layer OEM cabin filters and reducing VOC and NOx concentrations that accumulate during highway operation in heavy traffic.',
      },
      {
        q: 'What are the financial consequences of contamination-related downtime for commercial fleet operators?',
        a: 'Commercial fleet downtime carries direct vehicle repair costs and indirect revenue loss from routes not covered. A heavy truck with an HPCR fuel system failure from water contamination faces injector replacement at $4,800–15,000 for a six-cylinder engine, plus towing costs, workshop labor, and in-transit load handling. Revenue loss for a long-haul operator ranges from $1,500–4,000 per day per vehicle depending on freight rates and route commitments. Fleet operators with 50+ vehicles face aggregate downtime costs of $50,000–200,000 per year from contamination-related engine and fuel system failures preventable through systematic protection systems. Contamination control programs — air intake, fuel, lubrication, and cabin air protection — reduce the primary failure pathways that generate these unplanned maintenance events.',
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Commercial Fleet Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Commercial fleet asset protection systems engineered for long-haul semi-trucks, regional delivery vehicles, and mixed commercial fleets operating under HPCR diesel fuel system demands, turbocharged airflow requirements, and extended road service schedules.',
        areaServed: 'Global',
        serviceType: 'Commercial Vehicle Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Commercial Fleet Asset Protection Systems', item: 'https://elimfilters.com/industries/trucks-fleets' },
        ],
      },
    ],
  },
  'Waste Municipal': {
    lastUpdated: 'May 2026',
    ctaTitle: 'Ready to Protect Your Municipal Fleet?',
    ctaDescription: 'Find the right municipal fleet asset protection system for your public service or emergency vehicle application. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS municipal fleet asset protection systems are engineered for refuse collection vehicles, emergency response vehicles (fire apparatus, ambulances, rescue units), public transit buses, and road maintenance equipment operating under 24/7 urban duty cycles, frequent stop-start loading, and varied urban contamination environments. Municipal diesel engines complete 300–600 engine starts per week in refuse and emergency service applications, accumulating soot at three to five times the rate of steady-state highway operation. Fire apparatus and ambulances must respond from cold-start to full rated power within 60–90 seconds, placing acute demands on lubrication systems immediately after engine startup. ELIMFILTERS systems maintain urban air intake performance, lubrication reliability, fuel system integrity, and cabin air quality for personnel across extended municipal service schedules.',
    faq: [
      {
        q: 'What asset protection systems do municipal refuse collection and emergency response vehicles require?',
        a: 'Refuse collection vehicles require lubrication protection (SYNTRAX™), air intake contamination control (MACROCORE™), and fuel system protection (HYDROCORE™). Emergency response vehicles — fire apparatus, ambulances, and rescue units — require the same base protection with particular emphasis on rapid cold-start lubrication performance. Fire apparatus complete 200–400 engine starts per month in short-duration emergency response cycles, with engines returning to cold-standby state between calls. This high cold-start frequency generates fuel dilution and soot accumulation in engine oil at accelerated rates. SYNTRAX™ lubrication protection maintains ISO 4406 cleanliness targets despite frequent cold-start cycling and the short-duration high-load combustion profiles of emergency response operation.',
      },
      {
        q: 'How does stop-start urban operation accelerate contamination in refuse collection vehicles?',
        a: 'Refuse collection vehicles complete 400–800 vehicle stops per collection shift, with the engine idling or operating at low load between stops while the body hydraulic system compacts waste. Each cold or partial-cold restart introduces fuel dilution into engine oil. Repeated short-distance driving between stops prevents engine oil from reaching full operating temperature in many urban collection routes, limiting natural fuel volatilization from the oil sump. Soot concentration in refuse vehicle engine oil accumulates at three to five times the rate of steady-state highway applications. ISO 4406 cleanliness codes for these vehicles degrade faster per calendar interval than standard OEM service interval assumptions account for. SYNTRAX™ high-capacity lube oil protection maintains cleanliness within target codes across collection vehicle duty cycles.',
      },
      {
        q: 'What are the air intake contamination challenges for urban municipal vehicles?',
        a: 'Urban municipal vehicles — refuse trucks, street sweepers, and maintenance equipment — operate in near-ground environments where road dust, tire wear particulate, and brake dust generate PM10 concentrations of 50–200 µg/m³ at street level. Refuse collection operations at waste loading sites expose air intake systems to organic decomposition particulate, plastic dust, and glass fiber from broken packaging. Street sweeper air intake systems are exposed to direct road surface debris ingestion at concentrations that can exceed ISO 5011 test limits during active sweeping passes. MACROCORE™ heavy-capacity air intake protection systems are matched to municipal vehicle intake geometries with high contaminant retention capacity to support 500–750 hour service intervals in urban municipal operating environments.',
      },
      {
        q: 'Why does emergency response vehicle readiness require specialized lubrication protection?',
        a: 'Emergency response vehicles — fire pumpers, aerial ladder trucks, heavy rescue units, and paramedic ambulances — are required to achieve full operational capability within 60–90 seconds of alarm receipt, typically from a cold-start or low-temperature standby state. Engine oil at cold-start temperatures of 5–20°C has three to five times the viscosity of fully warmed oil, reducing initial oil film formation on cam lobes, valve train components, and main bearings during the first 30–60 seconds of operation. High-load operation immediately after cold-start (pumping water, extending aerial ladders) accelerates wear during this low-lubrication window. SYNTRAX™ lubrication protection systems use synthetic-grade media to maintain ISO 4406 cleanliness and preserve base oil quality across repeated cold-start cycles, supporting consistent cold-start protection performance.',
      },
      {
        q: 'What cabin air quality protection is required for municipal and emergency service personnel?',
        a: 'Municipal and emergency service personnel spend extended daily hours in vehicle cabs operating in high-pollution urban environments. Refuse truck operators complete 6–10 hour collection shifts in close proximity to organic decomposition odors, diesel exhaust from surrounding traffic, and road-level dust. Emergency medical personnel in ambulance cabs face exposure to exhaust particulate during extended deployment periods. MICROKAPPA™ cabin air protection provides multi-stage filtration combining HEPA-grade mechanical particle capture with activated carbon adsorption media. This reduces cabin PM2.5 concentration by up to 85% compared to standard OEM cabin filters and reduces organic odor compounds and nitrogen dioxide concentrations. Municipal fleet operators in jurisdictions with occupational health exposure regulations for diesel particulate benefit from documented cabin air quality protection across their operator workforce.',
      },
      {
        q: 'What are the financial consequences of contamination-related failures in municipal and emergency fleets?',
        a: 'Municipal fleet downtime carries direct repair costs and indirect service delivery consequences. An ambulance removed from service for an unscheduled engine repair creates coverage gaps requiring neighboring unit deployment at additional overtime cost. A refuse collection vehicle with a hydraulic system failure from contaminated fluid requires emergency repair, alternative vehicle deployment, and route rescheduling. Municipal fleet operators typically face daily vehicle availability targets of 90–95% — contamination-related failures that exceed this threshold generate operational and contractual compliance exposure. Fire apparatus engine failure from lubrication contamination requires workshop removal from a safety-critical vehicle with replacement costs of $15,000–50,000 per engine event plus the operational cost of substituting apparatus coverage from neighboring stations.',
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Municipal Fleet Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Municipal fleet asset protection systems engineered for refuse collection vehicles, emergency response vehicles, public transit buses, and road maintenance equipment operating under 24/7 urban duty cycles, frequent stop-start loading, and varied urban contamination environments.',
        areaServed: 'Global',
        serviceType: 'Municipal Fleet Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Municipal Fleet Asset Protection Systems', item: 'https://elimfilters.com/industries/waste-municipal' },
        ],
      },
    ],
  },
  'Agriculture': {
    lastUpdated: 'May 2026',
    protectionLabel: 'STRATEGY',
    protectionSystems: [
      'Air Intake & Airflow Protection',
      'Fuel Cleanliness Protection',
      'Lubrication Protection',
      'Hydraulic Protection',
    ],
    knowledgeLinks: [
      { label: 'Air Intake & Airflow Protection', href: '/knowledge-system/standards/air-intake-systems' },
      { label: 'Fuel Cleanliness Protection', href: '/knowledge-system/standards/fuel-systems' },
      { label: 'Lubrication Protection', href: '/knowledge-system/standards/lube-oil-systems' },
      { label: 'Hydraulic Protection', href: '/knowledge-system/standards/hydraulic-systems' },
    ],
    preCtaQuote: {
      line1: 'We do not define ourselves by the products we sell.',
      line2: 'We define ourselves by the assets we protect.',
    },
    directAnswer: 'ELIMFILTERS agricultural asset protection systems are engineered for tractors, combine harvesters, and self-propelled agricultural equipment operating in high-dust environments. During grain and corn harvest, ambient dust concentrations can exceed 1,500 mg/m³ — more than five times the 300 mg/m³ maximum defined in ISO 5011 air filter testing standards. Proprietary synthetic-cellulose protection media provides high contaminant retention capacity while maintaining sealing efficiency throughout extended service intervals. The system is designed to reduce contamination-related failures during critical harvest operations.',
    faq: [
      {
        q: 'What asset protection systems do combine harvesters require?',
        a: 'Combine harvesters require high-capacity air intake protection (MACROCORE™), hydraulic contamination control (NANOFORCE™), fuel system protection (HYDROCORE™), and lube oil protection (SYNTRAX™). During grain harvest, dust concentrations can exceed 1,500 mg/m³ — more than five times ISO 5011 test limits. Each system must provide high contaminant retention capacity and complete sealing efficiency to prevent contamination events across 10–12 hour daily operating cycles.'
      },
      {
        q: 'Why do agricultural machines require specialized asset protection systems instead of standard OEM components?',
        a: 'Agricultural machines operate in environments with dust concentrations 5–10x higher than ISO 5011 test standards and temperatures ranging from -20°C to +55°C. Crop residue — chaff, grain dust, and pollen — creates multi-vector contamination across air intake, hydraulic, and fuel systems simultaneously. Standard OEM components are rated for controlled test conditions. Specialized agricultural asset protection systems use high-capacity synthetic-cellulose media, reinforced end caps, and extended service intervals engineered for continuous field operation.'
      },
      {
        q: 'How often should the air intake protection system be serviced during harvest season?',
        a: 'Air intake protection system service intervals depend on ambient dust concentration and daily operating hours. In standard conditions (under 500 mg/m³), ELIMFILTERS MACROCORE™ systems support 500–750 operating hour intervals. During heavy grain or cotton harvest (dust above 1,000 mg/m³), inspection at 250 hours and service at first restriction indicator activation is recommended. Service intervals should not be based on time alone — differential pressure monitoring is required to maintain sealing efficiency.'
      },
      {
        q: 'What does MACROCORE™ technology provide in agricultural asset protection applications?',
        a: 'MACROCORE™ is the primary air intake protection technology for high-dust agricultural environments. It combines a proprietary large-diameter cellulose-synthetic composite element with a radial seal design that maintains complete sealing efficiency under high particulate loads. In tractor and combine harvester applications, MACROCORE™ achieves 99.9% silica particle retention at dust concentrations exceeding 1,500 mg/m³. The oversized element geometry provides 40–60% more media surface area than standard OEM air intake components, enabling extended service intervals without efficiency degradation.'
      },
      {
        q: 'How does HYDROCORE™ fuel system protection prevent water contamination failure?',
        a: 'HYDROCORE™ is a turbine fuel separator system that removes free and emulsified water from diesel before it reaches high-pressure injection components. Agricultural diesel stored in field tanks accumulates water through condensation, particularly during temperature cycles between day and night operations. HYDROCORE™ achieves 99.8% free water removal and 95% emulsified water reduction, protecting common-rail injectors from corrosion and stiction failure. A water collection bowl with automatic drain prevents bypass during water saturation events.'
      },
      {
        q: 'What are the financial consequences of contamination-related equipment failure during harvest?',
        a: 'Unplanned agricultural equipment downtime during harvest carries significant financial consequences due to narrow seasonal operating windows. Combine harvester downtime costs range from $2,000–$8,000 per day in lost harvesting capacity, depending on crop value and field size. Contamination-related engine failure requiring overhaul adds $15,000–$45,000 in parts and labor. Hydraulic system contamination (ISO 4406 cleanliness exceedances) causes proportional valve wear, with replacement costs of $3,000–$12,000 per valve bank. Effective contamination control eliminates the primary failure pathway driving these costs.'
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Agricultural Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Agricultural asset protection systems engineered for tractors, combine harvesters, and self-propelled agricultural equipment operating in high-dust harvest environments with ambient dust concentrations exceeding 1,500 mg/m³.',
        areaServed: 'Global',
        serviceType: 'Industrial Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Agricultural Asset Protection Systems', item: 'https://elimfilters.com/industries/agriculture' },
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return catalogue.industries.map((item) => ({
    slug: getSlug(item.name),
  }));
}

const BASE_URL = 'https://elimfilters.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getItemBySlug('industries', params.slug);
  if (!item) return { title: 'Not Found' };
  const url = `${BASE_URL}/industries/${params.slug}`;
  const title = item.title;
  const description = item.name === 'Automotive'
    ? 'Automotive asset protection systems for passenger and commercial vehicles operating under thermal cycling, urban stop-and-go traffic, and highway conditions. Air intake, lubrication, fuel system, and cabin air quality protection for mixed-duty vehicle operation.'
    : item.name === 'Agriculture'
    ? 'Agricultural asset protection systems for tractors, combines, and harvesters operating in dust concentrations exceeding 1,500 mg/m³. Air intake, hydraulic, fuel, and lube oil protection engineered to ISO 5011 standards.'
    : item.name === 'Bus Coach'
    ? 'Transit fleet asset protection systems for diesel buses and coaches operating under continuous urban stop-and-go duty cycles. Engine, pneumatic, cabin air, and fuel system contamination control for passenger transport operations.'
    : item.name === 'Construction'
    ? 'Heavy construction equipment asset protection systems for excavators, loaders, bulldozers, and graders operating in silica dust concentrations of 3,000–10,000 mg/m³. Hydraulic, air intake, fuel, and lube oil contamination control for off-road multi-shift operations.'
    : item.name === 'Manufacturing'
    ? 'Industrial manufacturing asset protection systems for engines, hydraulic systems, compressors, pumps, conveyors, and production equipment. Air intake, lubrication, fuel, and hydraulic contamination control engineered for continuous production line operation.'
    : item.name === 'Marine'
    ? 'Marine asset protection systems for commercial vessels, workboats, fishing fleets, and offshore support equipment. Fuel and water separation, salt-air contamination control, lubrication, and hydraulic protection engineered for continuous marine and offshore duty cycles.'
    : item.name === 'Oil Gas'
    ? 'Oil & Gas asset protection systems for offshore platforms, drilling systems, compression equipment, turbines, pumps, and engine-driven energy assets. Air intake, fuel cleanliness, hydraulic, and lubrication protection engineered for corrosive atmospheres, H2S exposure, and severe-duty energy operation.'
    : item.name === 'Power Generation'
    ? 'Power generation asset protection systems for standby generators, prime power systems, industrial diesel engines, and emergency backup equipment. Fuel stability, airflow, and lubrication protection engineered for continuous base-load operation, standby cycling, and emergency power readiness.'
    : item.name === 'Railway'
    ? 'Railway asset protection systems for diesel-electric locomotives, DMUs, and shunting locomotives operating under continuous traction loading and track ballast dust exposure. Fuel, pneumatic, air intake, and lubrication contamination control engineered for multi-day locomotive service cycles.'
    : item.name === 'Trucks Fleets'
    ? 'Commercial fleet asset protection systems for long-haul trucks and delivery vehicles operating under HPCR diesel fuel system demands. Air intake, fuel cleanliness, lubrication, and cabin air protection engineered for extended road service schedules and high-frequency urban delivery cycles.'
    : item.name === 'Waste Municipal'
    ? 'Municipal fleet asset protection systems for refuse collection vehicles, fire apparatus, ambulances, and public service equipment. Lubrication, air intake, fuel system, and cabin air protection engineered for 24/7 urban duty cycles, frequent stop-start loading, and emergency response readiness.'
    : item.description;
  return {
    title,
    description,
    keywords: [
      `${item.name.toLowerCase()} filtration`, `${item.name.toLowerCase()} filters`,
      `industrial filters ${item.name.toLowerCase()}`, 'ELIMFILTERS', 'asset protection filtration',
    ],
    alternates: {
      canonical: url,
      languages: { 'x-default': url, en: url, es: url, fr: url, it: url, nl: url, ru: url, zh: url, ja: url, ar: url, fa: url, pt: url },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS World Catalogue',
      images: [{
        url: industryMedia[item.name]?.image ? `https://elimfilters.com${industryMedia[item.name].image}` : 'https://elimfilters.com/assets/logo-elimfilters.png',
        width: 1200,
        height: 630,
        alt: `${item.title} — ELIMFILTERS`
      }],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [industryMedia[item.name]?.image ? `https://elimfilters.com${industryMedia[item.name].image}` : 'https://elimfilters.com/assets/logo-elimfilters.png'],
    },
  };
}

export default function IndustryPage({ params }: Props) {
  const item = getItemBySlug('industries', params.slug);
  if (!item) return null;

  const media = industryMedia[item.name] || {};
  const geoData = industryGeoData[item.name];

  return (
    <CategoryPage
      item={item}
      category="industries"
      industryImage={media.image}
      industryVideo={media.video}
      geoData={geoData}
    />
  );
}
