import type { Metadata } from 'next';
import Link from 'next/link';
import { KC_STANDARDS } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import StandardContent from './StandardContent';

const STANDARD_ALIASES: Record<string, string> = {
  'astm-d6210': 'iso-4406',
  'eu-dir-2019-130': 'iso-11155',
  'iso-11155': 'iso-29463',
  'iso-3724': 'iso-16889',
  'iso-4405': 'iso-4406',
  'din-71220': 'din-71460',
};

const SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  'iso-16889': {
    title: 'ISO 16889 Multi-Pass Filter Test Method | ELIMFILTERS',
    description: 'Engineering reference for ISO 16889 multi-pass filter testing, beta ratio, filtration efficiency, contaminant loading and application interpretation.',
  },
  'iso-4406': {
    title: 'ISO 4406 Fluid Cleanliness Code — Standard Reference | ELIMFILTERS',
    description: 'Normative engineering reference for ISO 4406 fluid cleanliness coding, particle-count size channels and cleanliness class interpretation.',
  },
  'iso-8573-1': {
    title: 'ISO 8573-1 Compressed Air Purity Classes — Standard Reference | ELIMFILTERS',
    description: 'Normative engineering reference for ISO 8573-1 compressed-air purity classes covering particles, water and oil contamination limits.',
  },
  'iso-12937': {
    title: 'ISO 12937 Water in Petroleum Products | ELIMFILTERS',
    description: 'Engineering reference for ISO 12937 determination of water in petroleum products, test context, interpretation and contamination-control applications.',
  },
  'iso-3968': {
    title: 'ISO 3968 Filter Pressure Drop & Flow Test | ELIMFILTERS',
    description: 'Engineering reference for ISO 3968 pressure-drop and flow characteristics of hydraulic fluid power filters, including application interpretation.',
  },
  'sae-j726': {
    title: 'SAE J726 Air Cleaner Test Method | ELIMFILTERS',
    description: 'Engineering reference for SAE J726 air-cleaner testing, restriction, dust capacity, efficiency and air-intake application context.',
  },
  'din-51524': {
    title: 'DIN 51524 Hydraulic Fluids Standard | ELIMFILTERS',
    description: 'Engineering reference for DIN 51524 hydraulic fluids, classification context, fluid requirements and filtration-related application considerations.',
  },
};

export function generateStaticParams() {
  return [
    ...KC_STANDARDS.map((s) => ({ standard: s.slug })),
    ...Object.keys(STANDARD_ALIASES).map((standard) => ({ standard })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ standard: string }> }): Promise<Metadata> {
  const { standard } = await params;
  const resolvedSlug = STANDARD_ALIASES[standard] || standard;
  const std = KC_STANDARDS.find((s) => s.slug === resolvedSlug);
  if (!std) return {};

  const isAlias = resolvedSlug !== standard;
  const url = `https://elimfilters.com/knowledge-center/standards/${resolvedSlug}/`;
  const override = SEO_OVERRIDES[resolvedSlug];
  const title = isAlias ? `${standard.toUpperCase()} Legacy Standard` : override?.title || `${std.code}: ${std.title}`;
  const description = isAlias
    ? `Legacy standards route. Continue to the current ${std.code} ELIMFILTERS reference.`
    : override?.description || std.metaDescription;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: isAlias ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
    },
  };
}

export default async function StandardPage({ params }: { params: Promise<{ standard: string }> }) {
  const { standard } = await params;
  const resolvedSlug = STANDARD_ALIASES[standard] || standard;
  const std = KC_STANDARDS.find((s) => s.slug === resolvedSlug);
  if (!std) return notFound();

  if (resolvedSlug !== standard) {
    const destination = `/knowledge-center/standards/${resolvedSlug}/`;
    return (
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${destination}');` }} />
        <meta httpEquiv="refresh" content={`0;url=${destination}`} />
        <section style={{ textAlign: 'center' }}>
          <h1>This standards reference has moved.</h1>
          <a href={destination}>Open current standard</a>
        </section>
      </main>
    );
  }

  return (
    <>
      <StandardContent std={std} />
      <section
        aria-label="Standards application next steps"
        style={{ background: '#050505', color: '#fff', borderTop: '1px solid rgba(255,241,45,0.2)', padding: 'clamp(3rem, 6vw, 5rem) 2rem' }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.12em', color: '#FFF12D', margin: '0 0 0.8rem' }}>
            APPLY THE STANDARD REFERENCE
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.1, margin: '0 0 0.8rem' }}>
            Connect the test method or standard to the correct filtration application.
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, maxWidth: '760px', margin: '0 0 1.5rem' }}>
            Use Product Intelligence when you have a part number or known equipment reference. Use Application Support when the standard, operating conditions, test method, or application fit still needs technical review.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <a
              href="https://part-search.elimfilters.com"
              target="_blank"
              rel="noopener noreferrer"
              data-conversion-action="product-intelligence"
              style={{ background: '#FFF12D', color: '#050505', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', padding: '0.95rem 1.2rem' }}
            >
              SEARCH PRODUCT INTELLIGENCE
            </a>
            <Link
              href="/contact/"
              data-conversion-action="application-support"
              style={{ border: '1px solid rgba(255,241,45,0.4)', color: '#FFF12D', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', padding: '0.95rem 1.2rem' }}
            >
              REQUEST APPLICATION SUPPORT
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
