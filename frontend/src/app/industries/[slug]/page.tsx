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
}

const industryGeoData: Record<string, GeoData> = {
  'Automotive': {
    lastUpdated: 'May 2026',
    ctaTitle: 'Ready to Protect Your Vehicle Systems?',
    ctaDescription: 'Find the right automotive asset protection system for your vehicle platform. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS® automotive asset protection systems are engineered for passenger vehicles and commercial vehicles operating under continuous thermal cycling, urban stop-and-go traffic, and highway airflow variation. Modern direct injection engines operate at fuel injection pressures of 150–350 bar — conditions where contamination accumulation in fuel delivery systems causes injector wear within 30,000–80,000 km of mixed-duty operation. Urban air intake environments expose vehicle engines to particulate concentrations of 150–300 µg/m³, while cold-start thermal cycling generates oil dilution and soot accumulation that degrades lubrication cleanliness across extended service intervals. Proprietary protection media maintains air intake efficiency, lubrication cleanliness, fuel system integrity, and cabin air quality throughout standard and extended automotive service schedules.',
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
        a: 'Extended service intervals in mixed-duty vehicles — combining urban stop-and-go, short-trip, and highway operation — must account for accelerated contamination accumulation during cold-start cycles and low-speed urban driving. Standard OEM service intervals are typically calibrated for average driving conditions. Vehicles completing predominantly urban short-trip cycles accumulate lubrication degradation at two to three times the rate of steady-state highway vehicles within the same calendar interval. ELIMFILTERS® automotive protection systems are engineered to maintain air intake restriction below OEM threshold limits and lubrication cleanliness within ISO 4406 targets across urban, highway, and mixed-duty service intervals.',
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
        provider: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
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
    ctaTitle: 'Ready to Protect Your Construction Equipment?',
    ctaDescription: 'Find the right heavy equipment asset protection system for your construction equipment platform. Cross-reference 500,000+ parts.',
    directAnswer: 'Construction equipment operates in environments with ambient silica dust concentrations ranging from 3,000 mg/m³ on earthwork sites to over 10,000 mg/m³ in tunneling operations — conditions that exceed ISO 5011 air filter test limits by a factor of 10 to 30. ELIMFILTERS® construction asset protection systems are engineered for excavators, wheel loaders, bulldozers, motor graders, and articulated machinery operating under continuous multi-shift duty cycles. Proprietary hybrid protection media provides high contaminant retention capacity for hydraulic system cleanliness, air intake protection, and fuel system integrity throughout extended off-road service schedules.',
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
        a: 'Construction equipment diesel fuel is frequently stored in field tanks, transferred via portable dispensing units, and exposed to condensation during temperature cycling. This fuel delivery chain introduces water contamination, sediment, and microbial growth into fuel systems. Modern common-rail injection systems in construction equipment operate at injection pressures of 1,800–2,500 bar — pressure levels where water and particulate contamination cause injector erosion and stiction within 200–500 operating hours. AQUAGUARD™ fuel system protection achieves 99.8% free water removal and 95% emulsified water reduction, protecting common-rail injection components during continuous off-road operation.',
      },
      {
        q: 'How do extended service intervals affect heavy construction equipment availability on active projects?',
        a: 'Unplanned maintenance stops on active construction sites create direct schedule and cost impacts. Taking an excavator or loader out of service on a time-critical earthwork or foundation project generates delays that cascade across the project schedule. Extended service interval protection systems reduce the frequency of planned maintenance events without exceeding ISO 4406 hydraulic cleanliness targets or ISO 5011 air filter restriction limits. ELIMFILTERS® construction protection systems are engineered to support severe-duty service intervals through high contaminant retention capacity and differential pressure monitoring compatibility.',
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
        provider: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
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
    ctaTitle: 'Ready to Protect Your Transit Fleet?',
    ctaDescription: 'Find the right transit asset protection system for your bus or coach fleet application. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS® bus and coach asset protection systems are engineered for diesel transit buses, intercity coaches, and articulated urban vehicles. Urban transit engines complete 1,200–2,000 cold-start and partial-load cycles per week. Each cycle introduces combustion particulate and fuel dilution into engine oil. Soot contamination accumulates at three to five times the rate of highway applications. ELIMFILTERS® systems maintain engine lube oil cleanliness, pneumatic brake system air purity to ISO 8573-1 Class 2 standards, cabin airflow quality, and fuel system protection throughout extended transit service schedules.',
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
        provider: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
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
    ctaTitle: 'Ready to Protect Your Production Equipment?',
    ctaDescription: 'Find the right manufacturing asset protection system for your industrial equipment application. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS® manufacturing asset protection systems are engineered for industrial engines, hydraulic systems, compressors, pumps, conveyors, and production equipment operating under continuous manufacturing duty cycles. Manufacturing environments generate airborne particulate contamination at concentrations dependent on process type — metalworking and casting generate silica and metal particle loads, textile and packaging lines generate fiber and dust accumulation. Hydraulic systems in production equipment require cleanliness targets of ISO 16/14/11 or tighter to prevent proportional valve stiction and actuator degradation. ELIMFILTERS® systems maintain air intake efficiency, lubrication cleanliness, fuel system integrity, and hydraulic protection throughout extended manufacturing service schedules.',
    faq: [
      {
        q: 'What asset protection systems do manufacturing facility equipment require?',
        a: 'Industrial manufacturing equipment requires air intake protection (MACROCORE™), hydraulic system contamination control (NANOFORCE™), lubrication cleanliness protection (SYNTRAX™), and fuel system protection (AQUAGUARD™). Compressors and industrial engines require air intake protection matched to the particulate profile of the production environment. Hydraulic systems in presses, injection molding equipment, and CNC machinery require ISO 16/14/11 or tighter cleanliness to prevent proportional valve failure and actuator wear. Lubrication systems in pumps, gearboxes, and rotating production machinery require contamination control to maintain bearing film strength across extended operating hours.',
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
        a: 'Scheduled maintenance on production equipment creates planned downtime that can be coordinated with production schedules. However, shortened service intervals caused by accelerated contamination increase the frequency of production interruptions and maintenance labor costs. ELIMFILTERS® manufacturing asset protection systems are engineered to maintain ISO 4406 and ISO 5011 compliance throughout extended service intervals — typically 500–1,000 hours for air intake systems and 250–500 hours for lube and hydraulic systems in continuous production environments. Extended intervals reduce the total number of maintenance events per year per machine, supporting higher overall equipment effectiveness (OEE) targets.',
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
        provider: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
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
    ctaTitle: 'Ready to Protect Your Marine Equipment?',
    ctaDescription: 'Find the right marine asset protection system for your vessel or offshore equipment application. Cross-reference 500,000+ parts.',
    directAnswer: 'ELIMFILTERS® marine asset protection systems are engineered for commercial vessels, workboats, fishing fleets, and offshore support equipment operating under continuous salt-air exposure, humidity saturation, and long-duration marine duty cycles. Marine diesel engines accumulate fuel water contamination, salinity ingestion, and lubrication degradation at rates significantly higher than land-based applications. Onboard hydraulic systems require contamination control matched to vibration loading and intermittent high-pressure operation. ELIMFILTERS® systems maintain fuel cleanliness to ASTM D6304 water separation standards, air intake integrity, lubrication cleanliness, and hydraulic protection throughout extended marine service intervals.',
    faq: [
      {
        q: 'What asset protection systems do marine diesel engines require?',
        a: 'Marine diesel engines require fuel and water separation protection (AQUAGUARD™), air intake contamination control (MACROCORE™), lubrication cleanliness protection (SYNTRAX™), and hydraulic system protection (NANOFORCE™). Fuel systems on commercial vessels are exposed to water contamination from tank condensation and bunkered fuel quality variation. AQUAGUARD™ achieves 99.8% free water removal and 95% emulsified water reduction, protecting common-rail marine injectors from corrosion and stiction failure. Air intake systems must control airborne salinity that causes compressor blade corrosion and increases engine deposit formation rates.',
      },
      {
        q: 'How does salt-air exposure affect onboard equipment contamination in marine applications?',
        a: 'Salt-laden marine air contains sodium chloride particles at concentrations of 1–10 mg/m³ in near-surface offshore environments. These particles enter air intake systems and deposit on compressor blades, intercoolers, and intake valves. Salt deposition accelerates corrosion of aluminum alloy engine components and increases intake restriction over time. In engine oil, salinity entry through crankcase ventilation systems generates electrolytic corrosion of bearing surfaces. MACROCORE™ salt-air contamination control uses cellulose-synthetic composite media with a hydrophobic treatment that captures saltwater aerosol while maintaining intake airflow volume across extended marine service intervals.',
      },
      {
        q: 'Why is fuel and water separation critical for marine diesel engine reliability?',
        a: 'Marine diesel fuel stored in vessel tanks accumulates water through condensation, wave agitation mixing, and bunkered fuel quality variation. Water contamination in marine fuel causes injector corrosion, microbial growth that blocks fuel lines, and cavitation damage in high-pressure fuel pumps operating at 800–2,000 bar in modern common-rail marine engines. ASTM D6304 defines water content standards for diesel fuel — marine storage conditions frequently exceed these limits without active water separation. AQUAGUARD™ turbine-stage water separation removes free and emulsified water before fuel reaches injection components, preventing the corrosion and stiction failure modes that cause unscheduled engine downtime on commercial vessels.',
      },
      {
        q: 'What is the role of hydraulic system protection on commercial vessels and offshore equipment?',
        a: 'Marine hydraulic systems control steering gear, deck machinery, crane operations, hatch mechanisms, and anchor windlass systems. These systems operate at 200–350 bar under vibration loading from hull flexure and wave impact. Vibration accelerates hydraulic fluid aeration and particle generation from pump wear. Saltwater ingress through deck seals contaminates hydraulic reservoirs, causing valve corrosion and actuator seal failure. ISO 4406 hydraulic cleanliness targets for marine systems typically require 16/14/11 or cleaner. NANOFORCE™ sub-micron hydraulic filtration maintains ISO 4406 targets under continuous offshore operating conditions, preventing proportional valve stiction and actuator position drift.',
      },
      {
        q: 'How do extended service intervals support offshore vessel operational continuity?',
        a: 'Offshore vessels and commercial fishing fleets operate on schedules where maintenance port calls are costly and infrequent. A commercial fishing vessel that must return to port for an unscheduled filter change loses 24–72 hours of fishing operation plus fuel and crew costs of $5,000–25,000 per interrupted trip. Extended service intervals reduce the total number of scheduled maintenance events per deployment season. ELIMFILTERS® marine asset protection systems are engineered to maintain ISO 4406 hydraulic cleanliness and ASTM D6304 fuel protection standards throughout intervals of 500–1,000 hours for appropriate marine applications, reducing port call frequency without exceeding contamination limits.',
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
        provider: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
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
  'Agriculture': {
    lastUpdated: 'May 2026',
    directAnswer: 'ELIMFILTERS® agricultural asset protection systems are engineered for tractors, combine harvesters, and self-propelled agricultural equipment operating in high-dust environments. During grain and corn harvest, ambient dust concentrations can exceed 1,500 mg/m³ — more than five times the 300 mg/m³ maximum defined in ISO 5011 air filter testing standards. Proprietary synthetic-cellulose protection media provides high contaminant retention capacity while maintaining sealing efficiency throughout extended service intervals. The system is designed to reduce contamination-related failures during critical harvest operations.',
    faq: [
      {
        q: 'What asset protection systems do combine harvesters require?',
        a: 'Combine harvesters require high-capacity air intake protection (MACROCORE™), hydraulic contamination control (NANOFORCE™), fuel system protection (AQUAGUARD™), and lube oil protection (SYNTRAX™). During grain harvest, dust concentrations can exceed 1,500 mg/m³ — more than five times ISO 5011 test limits. Each system must provide high contaminant retention capacity and complete sealing efficiency to prevent contamination events across 10–12 hour daily operating cycles.'
      },
      {
        q: 'Why do agricultural machines require specialized asset protection systems instead of standard OEM components?',
        a: 'Agricultural machines operate in environments with dust concentrations 5–10x higher than ISO 5011 test standards and temperatures ranging from -20°C to +55°C. Crop residue — chaff, grain dust, and pollen — creates multi-vector contamination across air intake, hydraulic, and fuel systems simultaneously. Standard OEM components are rated for controlled test conditions. Specialized agricultural asset protection systems use high-capacity synthetic-cellulose media, reinforced end caps, and extended service intervals engineered for continuous field operation.'
      },
      {
        q: 'How often should the air intake protection system be serviced during harvest season?',
        a: 'Air intake protection system service intervals depend on ambient dust concentration and daily operating hours. In standard conditions (under 500 mg/m³), ELIMFILTERS® MACROCORE™ systems support 500–750 operating hour intervals. During heavy grain or cotton harvest (dust above 1,000 mg/m³), inspection at 250 hours and service at first restriction indicator activation is recommended. Service intervals should not be based on time alone — differential pressure monitoring is required to maintain sealing efficiency.'
      },
      {
        q: 'What does MACROCORE™ technology provide in agricultural asset protection applications?',
        a: 'MACROCORE™ is the primary air intake protection technology for high-dust agricultural environments. It combines a proprietary large-diameter cellulose-synthetic composite element with a radial seal design that maintains complete sealing efficiency under high particulate loads. In tractor and combine harvester applications, MACROCORE™ achieves 99.9% silica particle retention at dust concentrations exceeding 1,500 mg/m³. The oversized element geometry provides 40–60% more media surface area than standard OEM air intake components, enabling extended service intervals without efficiency degradation.'
      },
      {
        q: 'How does AQUAGUARD™ fuel system protection prevent water contamination failure?',
        a: 'AQUAGUARD™ is a turbine fuel separator system that removes free and emulsified water from diesel before it reaches high-pressure injection components. Agricultural diesel stored in field tanks accumulates water through condensation, particularly during temperature cycles between day and night operations. AQUAGUARD™ achieves 99.8% free water removal and 95% emulsified water reduction, protecting common-rail injectors from corrosion and stiction failure. A water collection bowl with automatic drain prevents bypass during water saturation events.'
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
        provider: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
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
    : item.description;
  return {
    title,
    description,
    keywords: [
      `${item.name.toLowerCase()} filtration`, `${item.name.toLowerCase()} filters`,
      `industrial filters ${item.name.toLowerCase()}`, 'ELIMFILTERS®', 'asset protection filtration',
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
      siteName: 'ELIMFILTERS® World Catalogue',
      images: [{
        url: industryMedia[item.name]?.image ? `https://elimfilters.com${industryMedia[item.name].image}` : 'https://elimfilters.com/assets/logo-elimfilters.png',
        width: 1200,
        height: 630,
        alt: `${item.title} — ELIMFILTERS®`
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
