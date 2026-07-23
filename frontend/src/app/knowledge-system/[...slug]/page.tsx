import type { Metadata } from 'next';

const REDIRECTS: Record<string, string> = {
  standards: '/knowledge-center/standards/',
  'standards/lube-oil-systems': '/knowledge-center/systems/lubrication-protection/',
  'standards/hydraulic-systems': '/knowledge-center/systems/hydraulic-protection/',
  'standards/air-intake-systems': '/knowledge-center/systems/air-intake-protection/',
  'standards/fuel-systems': '/knowledge-center/systems/fuel-cleanliness-protection/',
  'standards/cabin-safety-systems': '/knowledge-center/systems/cabin-air-protection/',
  'standards/compressed-air-systems': '/knowledge-center/standards/iso-8573-1/',
  'standards/iso-16889': '/knowledge-center/standards/iso-16889/',
  'standards/iso-4406': '/knowledge-center/standards/iso-4406/',
  'standards/iso-5011': '/knowledge-center/standards/iso-5011/',

  contamination: '/knowledge-center/engineering/',
  'contamination/hydraulic-system': '/knowledge-center/engineering/contamination-control/',
  'contamination/particle-wear': '/knowledge-center/engineering/contamination-control/',
  'contamination/diesel-water': '/knowledge-center/engineering/fluid-cleanliness/',
  'contamination/varnish-formation': '/knowledge-center/engineering/contamination-control/',
  'contamination/fuel-injector-wear': '/knowledge-center/engineering/fluid-cleanliness/',
  'contamination/compressed-air-contamination': '/knowledge-center/standards/iso-8573-1/',
  'contamination/coolant-contamination': '/knowledge-center/systems/cooling-system-protection/',

  fleet: '/knowledge-center/technical-library/',
  'fleet/reducing-downtime': '/knowledge-center/technical-library/',
  'fleet/fuel-efficiency': '/knowledge-center/technical-library/',
  'fleet/total-cost-ownership': '/knowledge-center/engineering/total-cost-of-ownership/',
  'fleet/roi-calculator': '/knowledge-center/technical-library/',

  bridges: '/knowledge-center/',
  'bridges/industrial-filtration': '/knowledge-center/',
  'bridges/aftermarket-selection': '/knowledge-center/',
  'bridges/fleet-solutions': '/knowledge-center/technical-library/',
  'bridges/oem-replacement': '/knowledge-center/',

  compare: '/knowledge-center/',
  'compare/evaluation-framework': '/knowledge-center/technical-library/',
  'compare/oem-comparison': '/knowledge-center/',
  'compare/system-vs-commodity': '/knowledge-center/',
  'compare/total-cost-ownership': '/knowledge-center/engineering/total-cost-of-ownership/',
};

export function generateStaticParams() {
  return Object.keys(REDIRECTS).map((route) => ({ slug: route.split('/') }));
}

function destinationFor(slug: string) {
  return REDIRECTS[slug] || '/knowledge-center/';
}

function labelFor(slug: string) {
  return slug
    .split('/')
    .map((part) => part.replace(/-/g, ' '))
    .join(' — ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function generateMetadata({ params }: { params: { slug: string[] } }): Metadata {
  const slug = params.slug.join('/');
  const label = labelFor(slug);
  const destination = destinationFor(slug);

  return {
    title: `${label} | ELIMFILTERS Knowledge Center`,
    description: `Legacy ELIMFILTERS Knowledge System route for ${label}. Continue to the current engineering resource in the Knowledge Center.`,
    alternates: { canonical: `https://elimfilters.com${destination}` },
    robots: { index: false, follow: true },
  };
}

export default function LegacyKnowledgeSystemPathRedirect({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const destination = destinationFor(slug);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Arial, sans-serif', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${destination}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${destination}`} />
      <section style={{ maxWidth: 720, textAlign: 'center' }}>
        <p style={{ color: '#FFF12D', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>ELIMFILTERS Knowledge Center</p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1, margin: '1rem 0' }}>This page has moved.</h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>The legacy Knowledge System page now points to the updated Knowledge Center route.</p>
        <a href={destination} style={{ color: '#FFF12D', fontWeight: 700 }}>Continue to updated page</a>
      </section>
    </main>
  );
}
