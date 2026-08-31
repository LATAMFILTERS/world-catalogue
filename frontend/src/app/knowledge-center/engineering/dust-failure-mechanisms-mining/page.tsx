import type { Metadata } from 'next';
import { MiningEngineeringArticle } from '@/components/MiningEngineeringArticle';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/knowledge-center/engineering/dust-failure-mechanisms-mining/`;

const faq = [
  { q: 'What are the main dust-related failure mechanisms in mining equipment?', a: 'Common mechanisms include abrasive wear, restriction and blockage, impaired heat rejection, fluid contamination and interference with sensors or control components. The dominant mechanism depends on the machine and protected system.' },
  { q: 'How does dust increase air-intake restriction?', a: 'As particulate accumulates in the air-cleaning system, resistance to airflow can rise. Restriction trend, filter loading, sealing condition and service practice should be evaluated together rather than from time alone.' },
  { q: 'Can dust contribute to thermal problems?', a: 'Yes. Dust accumulation on cooling surfaces or around components can impair heat rejection. Thermal risk should be evaluated with cooling-system cleanliness, airflow, ambient conditions and operating load.' },
  { q: 'Why can fine particles damage hydraulic components?', a: 'Hydraulic pumps, valves and actuators contain precision interfaces. Particulate ingress and internally generated wear debris can interfere with those clearances and accelerate surface damage.' },
];

export const metadata: Metadata = {
  title: 'Mining Dust Failure Mechanisms: Wear, Restriction & Heat | ELIMFILTERS®',
  description: 'Engineering guide to abrasive wear, restriction, thermal load, fluid contamination and instrumentation interference caused by dust in mining equipment.',
  alternates: { canonical: PAGE_URL },
  openGraph: { title: 'Mining Dust Failure Mechanisms | ELIMFILTERS®', description: 'How mining dust becomes wear, restriction, thermal load and maintenance demand.', url: PAGE_URL, type: 'article' },
};

export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'TechArticle', '@id': `${PAGE_URL}#article`, headline: 'Dust-Induced Failure Mechanisms in Mining Equipment', description: 'Engineering reference for abrasive wear, restriction, thermal load, fluid contamination and instrumentation interference in mining environments.', url: PAGE_URL, author: { '@id': `${BASE_URL}/#organization` }, publisher: { '@id': `${BASE_URL}/#organization` }, about: [{ '@type': 'Thing', name: 'Mining dust contamination' }, { '@type': 'Thing', name: 'Abrasive wear' }, { '@type': 'Thing', name: 'Air intake restriction' }, { '@type': 'Thing', name: 'Thermal load' }] },
      { '@type': 'BreadcrumbList', '@id': `${PAGE_URL}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Knowledge Center', item: `${BASE_URL}/knowledge-center/` }, { '@type': 'ListItem', position: 2, name: 'Engineering', item: `${BASE_URL}/knowledge-center/engineering/` }, { '@type': 'ListItem', position: 3, name: 'Mining Dust Failure Mechanisms', item: PAGE_URL }] },
      { '@type': 'FAQPage', '@id': `${PAGE_URL}#faq`, mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
    ],
  };

  return <MiningEngineeringArticle
    title="Dust-Induced Failure"
    accentTitle="Mechanisms in Mining"
    lead="Mining dust becomes an operating problem through identifiable mechanisms. Understanding how particulate creates wear, restriction, heat-management problems and control-system interference helps maintenance teams act before contamination becomes downtime."
    schema={schema}
    faq={faq}
    sections={[
      { eyebrow: 'FAILURE PATH', title: 'Dust does not create one failure mode.', intro: 'The same particulate environment can challenge multiple systems at the same time. Airflow, lubrication, hydraulics, cooling and instrumentation respond differently to contamination, so the failure mechanism must be identified before the protection response is selected.', points: [
        { title: 'Abrasive wear', text: 'Hard particles can disturb precision clearances and accelerate surface wear in pumps, valves, bearings, compressor surfaces and other sensitive interfaces.' },
        { title: 'Restriction & blockage', text: 'Accumulated particulate can increase pressure differential or obstruct flow paths. The result can be rising restriction, additional service demand or operating instability.' },
        { title: 'Thermal load', text: 'Dust on heat-transfer surfaces can reduce cooling effectiveness. The resulting heat burden can affect lubricants, electronics and mechanical components under sustained load.' },
        { title: 'Instrumentation interference', text: 'Particulate can contaminate sensors, optical surfaces and control components, creating unreliable signals or maintenance events outside the main filtration circuit.' },
      ]},
      { eyebrow: 'DIAGNOSTIC LOGIC', title: 'Follow the symptom back to the contamination path.', intro: 'A restriction event, rising temperature, abnormal wear signal or sensor fault should not automatically be treated as an isolated component problem. The diagnostic sequence should ask where contamination entered, what system carried it and which interface became vulnerable.', points: [
        { title: 'Source', text: 'Identify airborne dust, service ingress, fluid contamination, bulk fuel handling or internal wear debris.' },
        { title: 'Pathway', text: 'Determine whether the contaminant moved through air intake, hydraulic fluid, fuel, lubrication, cooling or exposed instrumentation.' },
        { title: 'Protected interface', text: 'Resolve the engine, pump, valve, injector, bearing, cooling surface or control component that requires protection.' },
      ]},
    ]}
    related={[
      { href: '/knowledge-center/engineering/mining-contamination-tco/', label: 'Mining Contamination, Availability & TCO', description: 'Connect contamination mechanisms to equipment availability and lifecycle economics.' },
      { href: '/knowledge-center/engineering/contamination-reliability-curve/', label: 'Contamination & Reliability Curve', description: 'See how contamination can shift failures earlier in the asset lifecycle.' },
      { href: '/knowledge-center/engineering/high-value-component-protection/', label: 'Protecting High-Value Components', description: 'Connect consumable protection elements to critical component economics.' },
    ]}
  />;
}
