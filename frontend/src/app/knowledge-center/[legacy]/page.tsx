import type { Metadata } from 'next';

const LEGACY_ROUTES: Record<string, string> = {
  'air-intake-system-design': '/knowledge-center/engineering/airflow-engineering/',
  'air-restriction': '/knowledge-center/engineering/airflow-engineering/',
  'airflow-engineering': '/knowledge-center/engineering/airflow-engineering/',
  'beta-ratio': '/knowledge-center/engineering/beta-ratio/',
  'contamination-control': '/knowledge-center/engineering/contamination-control/',
  'contamination-ingression-modelling': '/knowledge-center/engineering/contamination-control/',
  'crankcase-ventilation-filtration': '/knowledge-center/engineering/airflow-engineering/',
  'contamination-sensitivity-components': '/knowledge-center/engineering/contamination-control/',
  'diesel-fuel-filtration': '/knowledge-center/engineering/diesel-fuel-filtration/',
  'dust-holding-capacity': '/knowledge-center/engineering/dust-holding-capacity/',
  'extended-drain-interval-engineering': '/knowledge-center/engineering/service-intervals/',
  'filter-element-integrity': '/knowledge-center/engineering/seal-integrity/',
  'failure-analysis': '/knowledge-center/engineering/contamination-control/',
  'filter-housing-design': '/knowledge-center/engineering/filter-media-engineering/',
  'filter-housing-system-integration': '/knowledge-center/engineering/filter-media-engineering/',
  'filter-media-engineering': '/knowledge-center/engineering/filter-media-engineering/',
  'filter-media-science': '/knowledge-center/engineering/filter-media-science/',
  'fleet-oil-sampling-protocol': '/knowledge-center/engineering/oil-analysis-methods/',
  'fluid-cleanliness': '/knowledge-center/engineering/fluid-cleanliness/',
  'hpcr-fuel-system-cleanliness': '/knowledge-center/engineering/hpcr-fuel-system-cleanliness/',
  'hydraulic-contamination-sensitivity': '/knowledge-center/engineering/contamination-control/',
  'hydraulic-power-unit-design': '/knowledge-center/systems/hydraulic-protection/',
  'hydraulic-reservoir-design': '/knowledge-center/systems/hydraulic-protection/',
  'hydraulic-system-flushing': '/knowledge-center/engineering/contamination-control/',
  'iso-11171-particle-counting': '/knowledge-center/engineering/contamination-control/',
  'iso-16889-multipass-test': '/knowledge-center/standards/iso-16889/',
  'iso-16889': '/knowledge-center/standards/iso-16889/',
  'iso-4406': '/knowledge-center/standards/iso-4406/',
  'iso-5011': '/knowledge-center/standards/iso-5011/',
  'lubrication-system-filtration': '/knowledge-center/systems/lubrication-protection/',
  'materials-engineering': '/knowledge-center/engineering/filter-media-engineering/',
  'marine-diesel-filtration': '/knowledge-center/industries/marine/',
  'nfpa-t2-14-hydraulic-cleanliness': '/knowledge-center/engineering/contamination-control/',
  'oem-engineering': '/knowledge-center/technical-library/',
  'oil-analysis-methods': '/knowledge-center/engineering/oil-analysis-methods/',
  'oil-condition-monitoring': '/knowledge-center/engineering/oil-analysis-methods/',
  'particle-ingress-prevention': '/knowledge-center/engineering/contamination-control/',
  'sae-j300-viscosity-classification': '/knowledge-center/engineering/oil-analysis-methods/',
  'sae-j726-iso-5011-air-cleaner-test': '/knowledge-center/standards/iso-5011/',
  'seal-integrity': '/knowledge-center/engineering/seal-integrity/',
  'service-intervals': '/knowledge-center/engineering/service-intervals/',
  'testing-and-validation': '/knowledge-center/engineering/testing-and-validation/',
  'total-cost-of-ownership': '/knowledge-center/engineering/total-cost-of-ownership/',
  'varnish-formation-lube-systems': '/knowledge-center/engineering/oil-analysis-methods/',
  'water-contamination-fuel': '/knowledge-center/engineering/water-contamination-fuel/',
};

export function generateStaticParams() {
  return Object.keys(LEGACY_ROUTES).map((legacy) => ({ legacy }));
}

function labelFor(slug: string) {
  return slug.split('-').map((part) => {
    const upper = part.toUpperCase();
    if (['ISO', 'SAE', 'NFPA', 'HPCR', 'OEM'].includes(upper)) return upper;
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(' ');
}

export async function generateMetadata({ params }: { params: Promise<{ legacy: string }> }): Promise<Metadata> {
  const { legacy } = await params;
  const destination = LEGACY_ROUTES[legacy] || '/knowledge-center/';
  const label = labelFor(legacy);
  const description = `Legacy route for ${label}. Continue to the current ELIMFILTERS engineering resource.`;
  return {
    title: `${label} Legacy Route`,
    description,
    alternates: { canonical: `https://elimfilters.com${destination}` },
    robots: { index: false, follow: true },
    openGraph: { title: `${label} | ELIMFILTERS Knowledge Center`, description, url: `https://elimfilters.com${destination}`, type: 'article', siteName: 'ELIMFILTERS' },
    twitter: { card: 'summary_large_image', title: `${label} | ELIMFILTERS Knowledge Center`, description },
  };
}

export default async function LegacyKnowledgeCenterPage({ params }: { params: Promise<{ legacy: string }> }) {
  const { legacy } = await params;
  const destination = LEGACY_ROUTES[legacy] || '/knowledge-center/';
  const label = labelFor(legacy);
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${destination}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${destination}`} />
      <section style={{ maxWidth: 720, textAlign: 'center' }}>
        <h1>{label}</h1>
        <p>This engineering resource has moved to its current ELIMFILTERS Knowledge Center location.</p>
        <a href={destination}>Open current resource</a>
      </section>
    </main>
  );
}
