'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getEntityNode, getIncomingEntities, getRelatedEntities } from '@/lib/entity-graph';

interface StandardProfile {
  purpose: string;
  measuredVariable?: string;
}

interface DefinitionRow {
  label: string;
  content?: string;
  links?: Array<{ href: string; name: string }>;
}

const STANDARD_PROFILES: Record<string, StandardProfile> = {
  'iso-16889': {
    purpose: 'Multi-pass test method used to evaluate the contaminant-removal performance and dirt-holding behavior of hydraulic filter elements.',
    measuredVariable: 'Particle-size-specific beta ratio, filtration efficiency, differential pressure, and contaminant capacity.',
  },
  'iso-4406': {
    purpose: 'Cleanliness coding system used to classify the concentration of solid particles in hydraulic and lubricating fluids.',
    measuredVariable: 'Particle counts per millilitre at the standard cumulative particle-size thresholds.',
  },
  'iso-5011': {
    purpose: 'Test framework for inlet air-cleaning equipment used with internal-combustion engines and compressors.',
    measuredVariable: 'Dust efficiency, dust capacity, airflow restriction, and element integrity under defined test conditions.',
  },
  'sae-j1539': {
    purpose: 'Performance test practice for engine air-cleaner elements and intake-system filtration components.',
    measuredVariable: 'Airflow restriction, dust capacity, and contaminant-removal performance.',
  },
  'iso-8573-1': {
    purpose: 'Compressed-air purity classification standard covering particles, water, and oil contamination.',
    measuredVariable: 'Maximum contaminant concentration by compressed-air purity class.',
  },
  'iso-11155': {
    purpose: 'Test framework for passenger-compartment air filters used in road vehicles.',
    measuredVariable: 'Particle filtration performance, pressure drop, and gas adsorption where applicable.',
  },
  'iso-16332': {
    purpose: 'Laboratory method for evaluating fuel-water separation performance in diesel fuel filtration systems.',
    measuredVariable: 'Water-separation efficiency under defined flow and contamination conditions.',
  },
  'iso-12937': {
    purpose: 'Coulometric Karl Fischer method for determining water content in petroleum products.',
    measuredVariable: 'Water concentration in the tested fuel or petroleum sample.',
  },
  'astm-d6304': {
    purpose: 'Karl Fischer titration methods for determining water in petroleum products, lubricating oils, and additives.',
    measuredVariable: 'Water concentration in the tested petroleum sample.',
  },
  'astm-d6210': {
    purpose: 'Performance specification for fully formulated glycol-base engine coolants used in heavy-duty engines.',
    measuredVariable: 'Coolant chemical and performance requirements, including corrosion and cavitation protection.',
  },
  'din-51524': {
    purpose: 'Classification and minimum requirements for hydraulic fluids used in industrial and mobile hydraulic systems.',
    measuredVariable: 'Hydraulic-fluid physical, chemical, anti-wear, and aging characteristics.',
  },
  'nfpa-t2-14': {
    purpose: 'Hydraulic-fluid power guidance associated with contamination control and component cleanliness practices.',
  },
  'eu-dir-2019-130': {
    purpose: 'European worker-protection requirements addressing occupational exposure to carcinogens and mutagens, including diesel-engine exhaust emissions.',
  },
};

function uniqueLinks(nodes: ReturnType<typeof getIncomingEntities>) {
  return Array.from(new Map(nodes.map((node) => [node.id, { href: node.href, name: node.name }])).values());
}

export function StructuredStandardDefinition() {
  const pathname = usePathname();
  const match = pathname.match(/^\/knowledge-system\/standards\/([^/]+)\/?$/);
  if (!match) return null;

  const slug = match[1];
  const standard = getEntityNode(`standard:${slug}`);
  if (!standard) return null;

  const profile = STANDARD_PROFILES[slug];
  const systems = getIncomingEntities(standard.id, 'validated-by').filter((node) => node.kind === 'system');
  const families = getIncomingEntities(standard.id, 'validated-by').filter((node) => node.kind === 'family');

  const technologies = new Map<string, { href: string; name: string }>();
  [...systems, ...families].forEach((node) => {
    getRelatedEntities(node.id, 'uses-technology').forEach((technology) => {
      technologies.set(technology.id, { href: technology.href, name: technology.name });
    });
  });

  const rows: DefinitionRow[] = [
    { label: 'Engineering Purpose', content: profile?.purpose },
    { label: 'Measured Variable', content: profile?.measuredVariable },
    { label: 'Applicable Protection Systems', links: uniqueLinks(systems) },
    { label: 'Applicable Technologies', links: Array.from(technologies.values()) },
    { label: 'Related Product Families', links: uniqueLinks(families) },
    {
      label: 'Related Knowledge',
      links: [
        { href: '/knowledge-system/standards', name: 'Standards Library' },
        { href: '/knowledge-system', name: 'Knowledge System' },
      ],
    },
  ].filter((row) => row.content || (row.links && row.links.length > 0));

  return (
    <section className="structured-definition structured-definition--standard" aria-labelledby={`structured-standard-${slug}`}>
      <div className="structured-definition__inner">
        <p className="structured-definition__eyebrow">STRUCTURED STANDARD DEFINITION</p>
        <h2 id={`structured-standard-${slug}`} className="structured-definition__title">
          {standard.name}
        </h2>

        <div className="structured-definition__grid">
          {rows.map((row) => (
            <article key={row.label} className="structured-definition__row">
              <h3>{row.label}</h3>
              {row.content && <p>{row.content}</p>}
              {row.links && row.links.length > 0 && (
                <div className="structured-definition__links">
                  {row.links.map((link) => (
                    <Link key={`${row.label}-${link.href}-${link.name}`} href={link.href}>
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
