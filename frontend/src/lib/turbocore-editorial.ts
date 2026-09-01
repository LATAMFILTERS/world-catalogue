import type { TechnologyEditorial } from './technology-editorial';

export const TURBOCORE_EDITORIAL: TechnologyEditorial = {
  problem: {
    title: 'FH/FG turbine separation is its own fuel-system architecture.',
    copy: 'Approved FH and FG turbine-style fuel/water separator systems use dedicated housing geometry, staged flow paths and replacement-element positions that must be treated as one validated architecture. TURBOCORE™ governs that turbine-specific architecture. It is distinct from HYDROCORE™, which governs approved standard non-turbine fuel/water separators.'
  },
  applications: {
    title: 'Where TURBOCORE™ belongs',
    items: [
      'Approved FH turbine-style fuel/water separator systems',
      'Approved FG turbine-style fuel/water separator systems',
      'Validated 900FH, 902FH, 1000FH and 1002FH configurations where applicable',
      'Dedicated 2010/2020/2040-series replacement-element positions validated for those turbine housings'
    ]
  },
  contamination: {
    title: 'The controlled risk is water and particulate contamination inside the approved turbine flow path.',
    copy: 'The turbine architecture manages fuel routing, staged separation and contaminant collection within the approved FH/FG system. Water separation, particulate control, drainage and element position must be evaluated as part of the complete turbine configuration rather than mapped to a standard spin-on separator architecture.'
  },
  mechanism: {
    title: 'Housing, staged flow and dedicated element positions work together.',
    copy: 'TURBOCORE™ relies on the approved turbine housing geometry to route fuel through the intended separation and filtration stages. Housing condition, element compatibility, sealing, drainage, flow demand and service condition all influence whether the architecture performs as intended.'
  },
  protectedAssets: {
    title: 'Downstream components depend on the turbine boundary remaining intact',
    items: ['High-pressure fuel pumps', 'Precision diesel injectors', 'Fuel-system control components', 'Downstream fuel passages exposed to water or particulate carryover']
  },
  selection: {
    title: 'Selection starts with the exact FH/FG architecture',
    items: [
      'Confirm the exact FH or FG housing model',
      'Confirm the dedicated replacement-element series and position',
      'Validate required fuel flow and duty cycle',
      'Confirm bowl, drain, sensor and sealing configuration',
      'Do not substitute a standard non-turbine HYDROCORE™ separator by visual similarity alone'
    ]
  },
  parameters: {
    title: 'Engineering parameters',
    items: ['Approved housing model', 'Fuel flow requirement', 'Element series and stage position', 'Water-management configuration', 'Pressure drop', 'Seal and drain configuration', 'Service access and duty cycle']
  },
  conditions: {
    title: 'Conditions that increase turbine-system workload',
    items: ['Wet or contaminated bulk fuel', 'High sustained fuel demand', 'Remote or severe-duty fueling', 'Repeated temperature cycling and condensation', 'Long service intervals without drainage or inspection', 'Housing or sealing damage']
  },
  service: {
    title: 'What operators should watch',
    items: ['Water accumulation requiring drainage', 'Unexpected restriction or loss of power under load', 'Fuel leakage at housing or bowl seals', 'Incorrect element position or incompatible replacement element', 'Corrosion, cracking or physical housing damage', 'Repeated water-in-fuel events after routine service']
  },
  mistakes: {
    title: 'Common scope and service errors',
    items: ['Treating FH/FG turbine systems as ordinary spin-on separators', 'Assigning the turbine architecture to HYDROCORE™', 'Mixing incompatible housing and element series', 'Selecting by dimensions alone', 'Ignoring drain and bowl service requirements', 'Assuming one universal efficiency or service interval across every TURBOCORE™ configuration']
  },
  standards: {
    title: 'Technical reference',
    copy: 'Applicable water-content and fuel/water-separation test methods provide engineering context, but numeric efficiency, capacity, flow and service claims must remain tied to validated product- and application-level evidence for the specific TURBOCORE™ configuration.'
  },
  families: {
    title: 'Product-family connection',
    copy: 'TURBOCORE™ exclusively governs the ELIMFILTERS Turbine Fuel Separation family for approved FH/FG turbine-style systems and their dedicated replacement elements. HYDROCORE™ remains the separate architecture for approved standard non-turbine separators, while SYNTAPORE™ governs plain diesel-fuel particulate filtration.'
  },
  industries: {
    title: 'Typical operating environments',
    items: ['Power generation', 'Mining', 'Agriculture', 'Marine', 'Construction', 'Truck fleets', 'Oil & gas']
  },
  faq: [
    { question: 'What is TURBOCORE™?', answer: 'TURBOCORE™ is the ELIMFILTERS turbine-style fuel/water separation architecture reserved exclusively for approved FH and FG series systems and their dedicated replacement-element configurations.' },
    { question: 'Is TURBOCORE™ the same as HYDROCORE™?', answer: 'No. TURBOCORE™ governs approved FH/FG turbine-style systems. HYDROCORE™ governs approved standard non-turbine fuel/water separators, including drain and transparent-bowl configurations.' },
    { question: 'Does HYDROCORE™ govern FH or FG turbine systems?', answer: 'No. FH and FG turbine-style systems are governed by TURBOCORE™.' },
    { question: 'Can a standard fuel/water separator replace an FH/FG turbine element?', answer: 'Not by appearance or dimensions alone. Housing architecture, element series, stage position, sealing and application data must be validated.' },
    { question: 'What information is needed for a TURBOCORE™ application review?', answer: 'Housing model, current element reference, equipment or engine, flow/duty information, bowl/drain configuration and any water, restriction or leakage history are useful starting points.' },
    { question: 'Does TURBOCORE™ have one universal water-separation efficiency?', answer: 'No. Numeric performance claims must be supported by validated data for the specific approved configuration and applicable test method.' }
  ],
  commercialDecision: {
    title: 'When the turbine architecture needs a technical review',
    copy: 'Repeated water-in-fuel events, short element life, unexplained restriction, housing leakage or uncertainty about the correct FH/FG element series justify reviewing the complete turbine assembly rather than treating the issue as an isolated replacement-filter transaction.'
  },
  fieldNote: {
    title: 'Scope guardrail',
    copy: 'TURBOCORE™ = approved FH/FG turbine-style fuel/water separation. HYDROCORE™ = approved standard non-turbine fuel/water separation. SYNTAPORE™ = plain diesel-fuel particulate filtration. These scopes must not be merged.'
  },
  flow: ['fieldNote','problem','applications','mechanism','contamination','protectedAssets','selection','parameters','conditions','service','mistakes','standards','families','industries','faq','commercialDecision']
};
