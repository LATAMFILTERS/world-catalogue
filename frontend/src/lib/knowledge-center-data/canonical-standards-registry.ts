import type { KCStandard } from './types';
import { KC_STANDARDS as LEGACY_STANDARDS } from './standards-registry';

function canonicalizeIso16889(standard: KCStandard): KCStandard {
  return {
    ...standard,
    year: '2022 (3rd edition)',
    metaDescription: 'ISO 16889:2022 defines a multi-pass laboratory method for evaluating hydraulic fluid-power filter-element performance, including contaminant capacity, particulate removal and differential-pressure characteristics.',
    scope: 'Laboratory evaluation of hydraulic fluid-power filter elements under the test conditions and applicability limits defined by ISO 16889:2022.',
    engineeringPurpose: 'Provides a reproducible multi-pass test procedure for appraising hydraulic filter-element filtration performance. It is a filter-element performance standard; it does not prescribe an in-service ISO 4406 cleanliness target, a universal maintenance interval or a universal component cleanliness requirement.',
    sections: [
      {
        heading: 'What ISO 16889 Defines',
        body: 'ISO 16889:2022 defines a continuous-contaminant-injection multi-pass test for hydraulic fluid-power filter elements. The method evaluates particulate-removal performance, contaminant capacity and differential-pressure behavior under controlled laboratory conditions.',
      },
      {
        heading: 'Filtration Ratio and Capacity',
        body: 'The multi-pass method compares upstream and downstream particle populations to determine filtration ratio at defined particle sizes while the element loads with contaminant. The test also characterizes contaminant capacity and differential-pressure development. Results apply to the tested element and test conditions; they are not a universal field-service interval.',
      },
      {
        heading: 'Relationship to ISO 4406',
        body: 'ISO 16889 evaluates filter-element performance. ISO 4406 separately defines the code used to express the level of solid-particle contamination in a hydraulic fluid. A system cleanliness target must come from the equipment, component or application requirement; it is not prescribed by ISO 16889 itself.',
      },
      {
        heading: 'Application Boundary',
        body: 'Use ISO 16889 data to compare or qualify filter-element performance only within the applicable test method and validated operating context. Flow, fluid, temperature, contaminant loading, element construction and system duty can affect field behavior, so product selection requires application-specific evidence in addition to the standard reference.',
      },
    ],
    keyParams: [
      { label: 'Method', value: 'Continuous-injection multi-pass filter-element test' },
      { label: 'Primary outputs', value: 'Filtration ratio, contaminant capacity, differential-pressure characteristics' },
      { label: 'Test contaminant', value: 'ISO medium test dust under the standard method' },
      { label: 'Use boundary', value: 'Laboratory element-performance evaluation; application validation still required' },
    ],
    relatedArticles: standard.relatedArticles.filter((slug) => slug !== 'iso-16889'),
    commonMistakes: [
      'Treating ISO 16889 as a fluid-cleanliness coding standard. ISO 4406 owns the cleanliness-code function.',
      'Publishing one ISO 4406 cleanliness target as though ISO 16889 prescribes it for every hydraulic component or system.',
      'Converting laboratory contaminant-capacity or differential-pressure results directly into a universal field service interval.',
      'Using a micron label alone instead of the tested filtration-ratio and operating-context evidence required for engineering comparison.',
    ],
    faqs: [
      { question: 'What does ISO 16889:2022 evaluate?', answer: 'It defines a multi-pass laboratory method for evaluating hydraulic filter-element particulate-removal performance, contaminant capacity and differential-pressure characteristics under controlled test conditions.' },
      { question: 'Does ISO 16889 define an ISO 4406 cleanliness target?', answer: 'No. ISO 4406 defines the fluid-contamination coding system. Cleanliness targets come from the equipment, component or application requirement rather than from ISO 16889 itself.' },
      { question: 'Does an ISO 16889 test result define a field service interval?', answer: 'No. Laboratory capacity and differential-pressure data are engineering inputs. Field intervals still depend on contamination ingression, flow, fluid, temperature, duty, product design and the approved application.' },
      { question: 'What should be compared between replacement filter elements?', answer: 'Compare evidence generated under the applicable ISO 16889 method, including filtration-ratio behavior, contaminant capacity and differential-pressure characteristics, together with fit, flow, pressure and application requirements.' },
    ],
  };
}

function canonicalizeIso4406(standard: KCStandard): KCStandard {
  return {
    ...standard,
    year: '2021 (4th edition; confirmed 2026)',
    metaDescription: 'ISO 4406:2021 specifies the code used to express the quantity of solid-particle contamination in hydraulic fluid. It is a coding method, not a universal cleanliness-target specification.',
    scope: 'Coding the level of solid-particle contamination in fluid used in hydraulic fluid-power systems.',
    engineeringPurpose: 'Provides a standardized cleanliness-code language for reporting solid-particle contamination in hydraulic fluid. The standard defines how contamination level is coded; equipment manufacturers and application owners determine the cleanliness limits or targets appropriate to their components and systems.',
    sections: [
      {
        heading: 'What ISO 4406 Defines',
        body: 'ISO 4406:2021 specifies the code used to define the quantity of solid particles in hydraulic fluid. The code provides a common reporting language for contamination level so measurements can be communicated consistently across laboratories, equipment owners and maintenance programs.',
      },
      {
        heading: 'What ISO 4406 Does Not Define',
        body: 'ISO 4406 does not prescribe one universal cleanliness target for servo valves, pumps, cylinders, mobile equipment or industrial systems. The acceptable code for an application must come from the equipment or component requirement, validated engineering guidance or an approved contamination-control program.',
      },
      {
        heading: 'Measurement and Trending',
        body: 'Particle-count data are converted into ISO 4406 range numbers for reporting and trending. Sampling quality, measurement method, calibration and contamination introduced during sample handling can materially affect the reported result, so the measurement procedure must be controlled.',
      },
      {
        heading: 'Relationship to Filter Testing',
        body: 'ISO 4406 describes fluid cleanliness. It does not evaluate filter-element efficiency. ISO 16889 is the separate multi-pass method used to evaluate hydraulic filter-element filtration performance. The two standards are complementary but must not be presented as interchangeable.',
      },
    ],
    keyParams: [
      { label: 'Purpose', value: 'Code solid-particle contamination level in hydraulic fluid' },
      { label: 'Output', value: 'ISO cleanliness code / range numbers' },
      { label: 'Target ownership', value: 'Equipment, component or application requirement' },
      { label: 'Separate filter test', value: 'ISO 16889' },
    ],
    relatedArticles: standard.relatedArticles.filter((slug) => slug !== 'iso-4406'),
    commonMistakes: [
      'Treating an example cleanliness code as a universal target mandated by ISO 4406.',
      'Treating ISO 4406 as a filter-efficiency or multi-pass performance test. That role belongs to ISO 16889.',
      'Converting historical or alternate cleanliness classifications into ISO 4406 as though the conversion were exact without application evidence.',
      'Using a particle-count result without controlling sampling, handling and measurement quality.',
    ],
    faqs: [
      { question: 'What does ISO 4406:2021 define?', answer: 'It defines the coding method used to express the quantity of solid-particle contamination in hydraulic fluid.' },
      { question: 'Does ISO 4406 prescribe the target cleanliness for a servo valve or pump?', answer: 'No. The applicable limit or target comes from the component, equipment or approved application requirement. ISO 4406 provides the language used to express that cleanliness level.' },
      { question: 'Is ISO 4406 the same as ISO 16889?', answer: 'No. ISO 4406 codes fluid contamination level; ISO 16889 evaluates hydraulic filter-element filtration performance using a multi-pass laboratory method.' },
      { question: 'Can an ISO 4406 code be interpreted without application context?', answer: 'It can describe measured contamination level, but whether that level is acceptable requires the applicable component, equipment and operating requirement.' },
    ],
  };
}

function canonicalizeIso16332(standard: KCStandard): KCStandard {
  return {
    ...standard,
    year: '2018 (1st edition; confirmed 2023)',
    metaDescription: 'ISO 16332:2018 specifies a laboratory comparison method for evaluating diesel fuel/water separator efficiency on pressure-side and suction-side separators under defined test conditions.',
    scope: 'Comparative laboratory evaluation of diesel fuel/water separator efficiency for pressure-side and suction-side separator configurations.',
    engineeringPurpose: 'Provides a controlled comparison method for evaluating fuel/water separator performance. It does not assign TURBOCORE 2010/2020/2040 element families to 2, 10 or 30 µm grades; element family, filtration grade, housing and application remain separate selection variables.',
    sections: [
      {
        heading: 'What ISO 16332 Defines',
        body: 'ISO 16332:2018 specifies a simplified laboratory comparison test for diesel fuel/water separator efficiency. The method covers pressure-side separators tested with fine water droplets and suction-side separators tested with coarse droplets using the same general test-rig layout.',
      },
      {
        heading: 'Flow Range and Test Context',
        body: 'The standard method is intended for rated flows from 50 L/h to 1,500 L/h. With agreement between the customer and separator manufacturer, modified procedures can be used outside that range. Test results describe performance under the defined laboratory method and do not replace application-specific housing, flow or service validation.',
      },
      {
        heading: 'TURBOCORE Selection Boundary',
        body: 'ISO 16332 is a separator-efficiency test method, not a TURBOCORE element-number or micron-grade code. Within TURBOCORE, 2010, 2020 and 2040 identify element families associated with their approved turbine-style architectures, while 2, 10 and 30 µm are separate filtration-grade choices where approved for the application.',
      },
    ],
    keyParams: [
      { label: 'Method', value: 'Fuel/water separator laboratory comparison test' },
      { label: 'Separator sides', value: 'Pressure-side and suction-side' },
      { label: 'Intended rated-flow range', value: '50–1,500 L/h' },
      { label: 'TURBOCORE micron rule', value: 'Element family and 2/10/30 µm grade are separate variables' },
    ],
    commonMistakes: [
      'Treating ISO 16332 as a certification that guarantees identical field performance in every fuel system.',
      'Using ISO 16332 to infer a universal micron grade for a 2010, 2020 or 2040 TURBOCORE element family.',
      'Ignoring whether the separator is operating on the suction or pressure side and whether the tested flow range represents the application.',
    ],
    faqs: [
      { question: 'What does ISO 16332:2018 test?', answer: 'It specifies a laboratory comparison method for evaluating diesel fuel/water separator efficiency under defined pressure-side or suction-side test conditions.' },
      { question: 'Does ISO 16332 define whether a 2010, 2020 or 2040 element is 2, 10 or 30 µm?', answer: 'No. TURBOCORE element family and filtration grade are separate selection variables. The standard evaluates separator efficiency; it does not encode the TURBOCORE micron grade in the element-family number.' },
      { question: 'What rated-flow range is the ISO 16332 method intended for?', answer: 'The standard states an intended rated-flow range of 50 L/h to 1,500 L/h, with modified procedures possible outside that range by agreement between customer and separator manufacturer.' },
    ],
  };
}

export const KC_STANDARDS: KCStandard[] = LEGACY_STANDARDS.map((standard) => {
  if (standard.slug === 'iso-16889') return canonicalizeIso16889(standard);
  if (standard.slug === 'iso-4406') return canonicalizeIso4406(standard);
  if (standard.slug === 'iso-16332') return canonicalizeIso16332(standard);
  return standard;
});
