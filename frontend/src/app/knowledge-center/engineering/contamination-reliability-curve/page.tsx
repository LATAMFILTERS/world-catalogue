import type { Metadata } from 'next';
import { MiningEngineeringArticle } from '@/components/MiningEngineeringArticle';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/knowledge-center/engineering/contamination-reliability-curve/`;

const faq = [
  { q: 'How can contamination affect the equipment reliability curve?', a: 'Contamination can introduce early-life defects, shorten the stable useful-life period or accelerate wear-out depending on when and where it enters the system. It is one of several factors that can shift failures earlier than expected.' },
  { q: 'What is early-life contamination?', a: 'Early-life contamination can be introduced during assembly, commissioning, fluid transfer or initial service work. If not controlled, it can affect sensitive interfaces before normal operating wear becomes the dominant mechanism.' },
  { q: 'Why is the useful-life phase important for maintenance teams?', a: 'The useful-life phase is where reliability teams seek stable operation and predictable intervention. Contamination control helps preserve that period by reducing avoidable wear, restriction and fluid-quality deterioration.' },
  { q: 'Does filtration alone determine component life?', a: 'No. Component life also depends on design, loading, lubrication, temperature, installation, maintenance, fluid condition, sealing and operating environment. Filtration is one part of a broader asset-protection strategy.' },
];

export const metadata: Metadata = {
  title: 'Contamination and the Equipment Reliability Curve | ELIMFILTERS®',
  description: 'Engineering guide to how contamination can influence early-life failures, useful life and wear-out behavior in mining and heavy-duty equipment.',
  alternates: { canonical: PAGE_URL },
  openGraph: { title: 'Contamination and the Equipment Reliability Curve | ELIMFILTERS®', description: 'How contamination can shift failures earlier across the equipment lifecycle.', url: PAGE_URL, type: 'article' },
};

export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'TechArticle', '@id': `${PAGE_URL}#article`, headline: 'Contamination and the Equipment Reliability Curve', description: 'Engineering reference for how contamination can influence early-life failures, useful life and wear-out behavior.', url: PAGE_URL, author: { '@id': `${BASE_URL}/#organization` }, publisher: { '@id': `${BASE_URL}/#organization` }, about: [{ '@type': 'Thing', name: 'Equipment reliability' }, { '@type': 'Thing', name: 'Contamination control' }, { '@type': 'Thing', name: 'Useful life' }, { '@type': 'Thing', name: 'Wear-out failures' }] },
      { '@type': 'BreadcrumbList', '@id': `${PAGE_URL}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Knowledge Center', item: `${BASE_URL}/knowledge-center/` }, { '@type': 'ListItem', position: 2, name: 'Engineering', item: `${BASE_URL}/knowledge-center/engineering/` }, { '@type': 'ListItem', position: 3, name: 'Contamination and Reliability Curve', item: PAGE_URL }] },
      { '@type': 'FAQPage', '@id': `${PAGE_URL}#faq`, mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
    ],
  };

  return <MiningEngineeringArticle
    title="Contamination and the"
    accentTitle="Equipment Reliability Curve"
    lead="The classic reliability curve separates early-life failures, useful life and wear-out. Contamination can influence all three phases when it is introduced during commissioning, operation or maintenance."
    schema={schema}
    faq={faq}
    sections={[
      { eyebrow: 'LIFECYCLE MODEL', title: 'Contamination can shift failure behavior earlier.', intro: 'The reliability curve is a useful model, not a guarantee. A component can leave its expected reliability pattern when contamination, temperature, loading, installation error or maintenance practice changes the conditions around it.', points: [
        { title: 'Early-life phase', text: 'Assembly debris, dirty fluids, poor commissioning practices or service contamination can expose precision interfaces before the component has established stable operation.' },
        { title: 'Useful-life phase', text: 'During normal operation, contamination control helps preserve stable performance by limiting avoidable abrasive wear, restriction and fluid-quality deterioration.' },
        { title: 'Wear-out phase', text: 'As components age, accumulated wear and contamination can interact. Filtration cannot eliminate design-life limits, but it can reduce avoidable contamination-driven acceleration.' },
      ]},
      { eyebrow: 'RELIABILITY PRACTICE', title: 'The objective is not simply longer intervals.', intro: 'A proactive strategy uses operating evidence to protect the useful-life phase. The goal is to prevent contamination from becoming an uncontrolled variable in the reliability model.', points: [
        { title: 'Control ingress', text: 'Reduce contamination introduced through air paths, fluid transfer, fuel handling, open systems and maintenance work.' },
        { title: 'Track condition', text: 'Use restriction trend, fluid cleanliness, service history, temperature and inspection findings to detect changing conditions.' },
        { title: 'Protect sensitive interfaces', text: 'Match filtration capacity and cleanliness targets to the components that are most sensitive to contamination.' },
      ]},
    ]}
    related={[
      { href: '/knowledge-center/engineering/mining-contamination-tco/', label: 'Mining Contamination, Availability & TCO', description: 'Translate reliability effects into availability and lifecycle economics.' },
      { href: '/knowledge-center/engineering/dust-failure-mechanisms-mining/', label: 'Mining Dust Failure Mechanisms', description: 'Identify the physical mechanisms that move contamination toward failure.' },
      { href: '/knowledge-center/engineering/high-value-component-protection/', label: 'Protecting High-Value Components', description: 'Prioritize protection around component criticality and replacement consequence.' },
    ]}
  />;
}
