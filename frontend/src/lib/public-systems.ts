import type { KCSystemDetail } from '@/lib/knowledge-center-data';

export type PublicSystem = {
  slug: string;
  title: string;
  description: string;
  technologies: string[];
  standards: string[];
  challenges: string[];
};

export const CANONICAL_PUBLIC_SYSTEMS: PublicSystem[] = [
  {
    slug: 'air-intake-protection',
    title: 'Air Intake & Airflow Protection Systems',
    description: 'Protection of engine intake, cabin air, compressed-air drying and airflow integrity through coordinated contamination control.',
    technologies: ['MACROCORE™', 'MICROKAPPA™', 'DRYCORE™', 'INTEKCORE™'],
    standards: ['ISO 5011', 'ISO 11155', 'ISO 8573-1'],
    challenges: ['Airborne particulate', 'Restriction management', 'Cabin contamination', 'Compressed-air moisture'],
  },
  {
    slug: 'fuel-cleanliness-protection',
    title: 'Fuel Cleanliness Protection Systems',
    description: 'Control of particulate and water contamination across primary, secondary and turbine-style diesel fuel filtration applications.',
    technologies: ['SYNTAPORE™', 'TURBOCORE™'],
    standards: ['ISO 16332', 'ISO 12937', 'ASTM D6304'],
    challenges: ['Fuel particulate', 'Water contamination', 'Storage contamination', 'Fuel-system protection'],
  },
  {
    slug: 'lubrication-protection',
    title: 'Lube/Oil Protection Systems',
    description: 'Lubrication filtration for controlling wear particles and external contamination in engine and equipment oil circuits.',
    technologies: ['SYNTRAX™'],
    standards: ['ISO 16889', 'ISO 4406', 'SAE J1858'],
    challenges: ['Wear particles', 'Oil cleanliness', 'Restriction management', 'Application-specific service conditions'],
  },
  {
    slug: 'hydraulic-protection',
    title: 'Hydraulic Protection Systems',
    description: 'Contamination control for hydraulic circuits, pumps, valves and other contamination-sensitive fluid-power components.',
    technologies: ['NANOFORCE™'],
    standards: ['ISO 16889', 'ISO 4406', 'NAS 1638'],
    challenges: ['Particle ingress', 'Component wear', 'Cleanliness control', 'System commissioning'],
  },
  {
    slug: 'cooling-system-protection',
    title: 'Cooling System Protection',
    description: 'Cooling-system filtration and coolant protection for control of suspended solids, corrosion products and system debris.',
    technologies: ['THERMACORE™'],
    standards: ['ASTM D6210'],
    challenges: ['Corrosion products', 'Suspended solids', 'Scale and deposits', 'Coolant compatibility'],
  },
];

export const CANONICAL_PUBLIC_SYSTEM_DETAILS: Record<string, KCSystemDetail> = {
  'air-intake-protection': {
    slug: 'air-intake-protection',
    failureMechanism: 'Airborne contamination entering an intake or operator-air circuit can increase restriction, contaminate downstream components and accelerate abrasive wear or air-quality degradation.',
    contaminationTarget: 'Airborne dust, particulate, environmental debris and application-dependent moisture or aerosol contamination.',
    targetCleanliness: 'Application-specific. Verify equipment requirements and applicable validated product or ISO 5011, ISO 11155 and ISO 8573-1 data where relevant.',
    keyMetrics: [
      { label: 'Protection scope', value: 'Engine · Cabin · Air Dryer · Housing' },
      { label: 'Core technologies', value: 'MACROCORE™ · MICROKAPPA™ · DRYCORE™ · INTEKCORE™' },
    ],
    sections: [
      { heading: 'Protection Architecture', body: 'Air protection is treated as one coordinated system covering engine intake, operator cabin air, compressed-air drying and intake housings. Selection must account for the specific equipment, environment, airflow requirement, sealing arrangement and validated product data.' },
      { heading: 'Engineering Verification', body: 'Efficiency, restriction, capacity and service limits are product- and application-specific. Published performance claims must be tied to the applicable test method and validated product record.' },
    ],
  },
  'fuel-cleanliness-protection': {
    slug: 'fuel-cleanliness-protection',
    failureMechanism: 'Particulate or water contamination reaching diesel fuel-system components can promote wear, corrosion, restriction and unstable fuel delivery.',
    contaminationTarget: 'Diesel-fuel particulate, free or entrained water, storage debris and contamination introduced during handling or transfer.',
    targetCleanliness: 'Application-specific. Verify equipment fuel-cleanliness requirements and validated product data for the selected filtration stage.',
    keyMetrics: [
      { label: 'Primary/secondary filters', value: 'SYNTAPORE™' },
      { label: 'Turbine assemblies', value: '1000FH · 900FH · 500FG' },
      { label: 'Element families', value: '2010 · 2040 · 2020' },
      { label: 'Micron grades', value: '30 · 10 · 2 µm, as applicable' },
    ],
    sections: [
      { heading: 'Primary & Secondary Fuel Filtration', body: 'SYNTAPORE™ is the ELIMFILTERS technology for primary and secondary diesel fuel filtration in spin-on and cartridge configurations. Selection is governed by the specific application, flow requirement, contamination load and validated product specification.' },
      { heading: 'FH/FG Turbine Filtration', body: 'TURBOCORE™ covers FH and FG turbine-style fuel filtration and fuel/water separation, including 1000FH, 900FH and 500FG assemblies and corresponding 2010, 2040 and 2020 element families in 30, 10 and 2 micron grades where applicable.' },
    ],
  },
  'lubrication-protection': {
    slug: 'lubrication-protection',
    failureMechanism: 'Particles and degradation products circulating with lubricant can contribute to abrasive wear, deposits and loss of component protection.',
    contaminationTarget: 'Wear particles, combustion-derived solids, external particulate ingress and application-dependent fluid degradation products.',
    targetCleanliness: 'Application-specific. Use equipment requirements, oil-analysis context and validated filtration performance data.',
    keyMetrics: [{ label: 'Canonical technology', value: 'SYNTRAX™' }, { label: 'Reference methods', value: 'ISO 16889 · ISO 4406 · SAE J1858' }],
    sections: [
      { heading: 'Lubrication Protection', body: 'SYNTRAX™ is the canonical ELIMFILTERS lubrication-filtration technology for engine and equipment oil circuits.' },
      { heading: 'Engineering Verification', body: 'Efficiency, capacity, bypass behavior and service interval depend on the filter, lubricant, equipment and duty cycle and require validated application data.' },
    ],
  },
  'hydraulic-protection': {
    slug: 'hydraulic-protection',
    failureMechanism: 'Hard particulate entering hydraulic clearances can accelerate wear, interfere with valve movement and degrade pump or actuator performance.',
    contaminationTarget: 'Hard particulate, wear debris and external ingress in hydraulic and fluid-power circuits.',
    targetCleanliness: 'Set cleanliness targets from component sensitivity and equipment requirements; verify applicable ISO 4406 targets and ISO 16889 filter performance data.',
    keyMetrics: [{ label: 'Canonical technology', value: 'NANOFORCE™' }, { label: 'Core references', value: 'ISO 16889 · ISO 4406' }],
    sections: [
      { heading: 'Hydraulic Contamination Control', body: 'NANOFORCE™ is the canonical ELIMFILTERS hydraulic-filtration technology. Filter selection must reflect circuit pressure, flow, component sensitivity, cleanliness target and validated product performance.' },
      { heading: 'System Approach', body: 'Effective contamination control considers ingress prevention, reservoir cleanliness, filtration location, commissioning cleanliness and condition monitoring as parts of one protection strategy.' },
    ],
  },
  'cooling-system-protection': {
    slug: 'cooling-system-protection',
    failureMechanism: 'Corrosion products, suspended solids, incompatible deposits or scale can impair coolant circulation, heat transfer and component protection.',
    contaminationTarget: 'Cooling-system debris, corrosion products, scale-forming solids and application-dependent suspended contamination.',
    targetCleanliness: 'Product- and coolant-chemistry-specific. Verify equipment, coolant and filter compatibility requirements before application.',
    keyMetrics: [{ label: 'Canonical technology', value: 'THERMACORE™' }, { label: 'Primary focus', value: 'Cooling-system protection' }],
    sections: [
      { heading: 'Cooling Protection', body: 'THERMACORE™ is the canonical ELIMFILTERS technology for coolant filtration and cooling-system protection.' },
      { heading: 'Engineering Verification', body: 'Filtration, additive-management and compatibility characteristics depend on the selected product and coolant chemistry and must be supported by application-specific data.' },
    ],
  },
};
