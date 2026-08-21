import type { Metadata } from 'next';
import Link from 'next/link';
import { KC_COMPARISONS, getComparisonBySlug } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import ComparisonContent from './ComparisonContent';

const BASE_URL = 'https://elimfilters.com';

const SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  'iso4406-vs-nas1638': {
    title: 'ISO 4406 vs NAS 1638: Fluid Cleanliness Codes | ELIMFILTERS',
    description: 'Compare ISO 4406 and NAS 1638 fluid cleanliness classification: particle-count structure, calibration basis, current use, limitations, and application context.',
  },
};

export function generateStaticParams() {
  return KC_COMPARISONS.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) return { title: 'Comparison Not Found' };

  const url = `${BASE_URL}/knowledge-center/comparisons/${slug}/`;
  const override = SEO_OVERRIDES[slug];
  const title = override?.title || comparison.title;
  const description = override?.description || comparison.subtitle || comparison.engineeringObjective;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'ELIMFILTERS',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  return (
    <>
      <ComparisonContent comparison={comparison} />
      <section
        aria-label="Application next steps"
        style={{
          background: '#050505',
          color: '#fff',
          borderTop: '1px solid rgba(255,241,45,0.2)',
          padding: 'clamp(3rem, 6vw, 5rem) 2rem',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            color: '#FFF12D',
            margin: '0 0 0.8rem',
          }}>
            APPLICATION NEXT STEP
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            lineHeight: 1.1,
            margin: '0 0 0.8rem',
          }}>
            Connect the technical comparison to the correct filtration application.
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(255,255,255,0.62)',
            lineHeight: 1.7,
            maxWidth: '760px',
            margin: '0 0 1.5rem',
          }}>
            Use Product Intelligence when you have a part number or equipment reference. Use Application Support when operating conditions, cleanliness targets, test methods, or application fit still need technical review.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <a
              href="https://part-search.elimfilters.com"
              target="_blank"
              rel="noopener noreferrer"
              data-conversion-action="product-intelligence"
              style={{
                background: '#FFF12D',
                color: '#050505',
                textDecoration: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                padding: '0.95rem 1.2rem',
              }}
            >
              SEARCH PRODUCT INTELLIGENCE
            </a>
            <Link
              href="/contact/"
              data-conversion-action="application-support"
              style={{
                border: '1px solid rgba(255,241,45,0.4)',
                color: '#FFF12D',
                textDecoration: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                padding: '0.95rem 1.2rem',
              }}
            >
              REQUEST APPLICATION SUPPORT
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
