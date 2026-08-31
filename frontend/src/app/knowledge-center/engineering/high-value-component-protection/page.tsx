import type { Metadata } from 'next';
import { MiningEngineeringArticle } from '@/components/MiningEngineeringArticle';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/knowledge-center/engineering/high-value-component-protection/`;

const faq = [
  { q: 'Why should filtration be evaluated by component criticality?', a: 'A filter is a consumable protection element, while engines, pumps, injectors, transmissions and other assemblies can be far more expensive and operationally critical. The protection decision should therefore consider the value and sensitivity of the component at risk.' },
  { q: 'Are filters considered low-cost components?', a: 'Relative to many major mechanical assemblies, filters are lower-cost consumables. That does not make filtration a commodity decision; its value depends on the contamination load, system requirement and consequence of insufficient protection.' },
  { q: 'What are high-value serviceable components in mining equipment?', a: 'Examples can include turbochargers, fuel-system components, hydraulic pumps and valves, transmissions, final drives and other assemblies whose repair or replacement can require substantial maintenance effort and downtime.' },
  { q: 'How does component criticality affect filter selection?', a: 'Higher sensitivity or higher operational consequence can justify tighter cleanliness targets, greater capacity, stronger evidence requirements and more disciplined service practices.' },
];

export const metadata: Metadata = {
  title: 'Protecting High-Value Mining Components Through Filtration | ELIMFILTERS®',
  description: 'Engineering guide to connecting consumable filtration elements with high-value component protection, equipment availability and lifecycle economics.',
  alternates: { canonical: PAGE_URL },
  openGraph: { title: 'Protecting High-Value Components Through Filtration | ELIMFILTERS®', description: 'Why filter economics should be evaluated against the component and operating consequence being protected.', url: PAGE_URL, type: 'article' },
};

export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'TechArticle', '@id': `${PAGE_URL}#article`, headline: 'Protecting High-Value Mining Components Through Contamination Control', description: 'Engineering reference connecting consumable filtration elements with high-value component protection and lifecycle economics.', url: PAGE_URL, author: { '@id': `${BASE_URL}/#organization` }, publisher: { '@id': `${BASE_URL}/#organization` }, about: [{ '@type': 'Thing', name: 'Component criticality' }, { '@type': 'Thing', name: 'Asset protection' }, { '@type': 'Thing', name: 'Mining filtration' }, { '@type': 'Thing', name: 'Lifecycle cost' }] },
      { '@type': 'BreadcrumbList', '@id': `${PAGE_URL}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Knowledge Center', item: `${BASE_URL}/knowledge-center/` }, { '@type': 'ListItem', position: 2, name: 'Engineering', item: `${BASE_URL}/knowledge-center/engineering/` }, { '@type': 'ListItem', position: 3, name: 'High-Value Component Protection', item: PAGE_URL }] },
      { '@type': 'FAQPage', '@id': `${PAGE_URL}#faq`, mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
    ],
  };

  return <MiningEngineeringArticle
    title="Protecting High-Value"
    accentTitle="Components Through Filtration"
    lead="The purchase price of a filter is only one part of the decision. In mining, the more important question is which component, maintenance event and production consequence the filtration strategy is protecting."
    schema={schema}
    faq={faq}
    sections={[
      { eyebrow: 'PROTECTION HIERARCHY', title: 'Consumables protect assets with very different economic consequences.', intro: 'A practical asset-protection model separates long-life structures, high-value serviceable assemblies and consumable protection elements. The categories are not universal accounting classes; they are a decision aid for relating filtration cost to component criticality.', points: [
        { title: 'Long-life asset structures', text: 'Frames, housings, major castings and structural assemblies are intended to remain with the machine for long periods. Premature damage can create significant replacement and supply consequences.' },
        { title: 'High-value serviceable components', text: 'Turbochargers, injectors, hydraulic pumps, valves, transmissions and final drives can be serviceable, but their failure may require substantial labor, parts and equipment downtime.' },
        { title: 'Consumable protection elements', text: 'Filters, seals and service fluids are replaced during the asset lifecycle. Their engineering purpose is to control contamination before it reaches more sensitive or more expensive interfaces.' },
      ]},
      { eyebrow: 'DECISION ECONOMICS', title: 'Evaluate filtration by protected consequence, not purchase price alone.', intro: 'The economics are asymmetric. A relatively inexpensive consumable can influence the exposure of a much more expensive component. That does not justify over-specification; it just means filter selection should resolve risk, duty and component sensitivity before cost is optimized.', points: [
        { title: 'Sensitivity', text: 'Determine how vulnerable the protected interface is to particles, water, restriction or degraded fluid cleanliness.' },
        { title: 'Operational consequence', text: 'Estimate what happens if the component requires unplanned intervention: maintenance time, equipment availability, parts lead time and production impact.' },
        { title: 'Evidence requirement', text: 'Use application data, dimensions, performance requirements and operating conditions to validate the filtration decision.' },
      ]},
    ]}
    related={[
      { href: '/knowledge-center/engineering/mining-contamination-tco/', label: 'Mining Contamination, Availability & TCO', description: 'Connect component protection to equipment availability and lifecycle cost.' },
      { href: '/knowledge-center/engineering/dust-failure-mechanisms-mining/', label: 'Mining Dust Failure Mechanisms', description: 'Understand how contamination physically reaches vulnerable interfaces.' },
      { href: '/knowledge-center/engineering/contamination-reliability-curve/', label: 'Contamination & Reliability Curve', description: 'Understand how contamination can alter expected reliability behavior.' },
    ]}
  />;
}
