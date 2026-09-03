import type { Metadata } from 'next';
import Link from 'next/link';
import { ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import ArticleContent from './ArticleContent';

const CTR_OVERRIDES: Record<string, { title: string; description: string }> = {
  'compressed-air-quality-verification': {
    title: 'Compressed Air Quality Verification | ELIMFILTERS®',
    description: 'How compressed-air quality is verified using contamination, moisture and purity measurements for industrial air systems and maintenance decisions.',
  },
  'cooling-system-contamination': {
    title: 'Cooling System Contamination: Causes & Control | ELIMFILTERS®',
    description: 'Technical guide to cooling-system contamination, deposit formation, fluid condition and protection decisions for industrial and heavy-duty equipment.',
  },
  'hpcr-fuel-system-cleanliness': {
    title: 'HPCR Fuel System Cleanliness & Contamination Control | ELIMFILTERS®',
    description: 'Technical guidance for high-pressure common-rail fuel cleanliness, particle and water contamination control, and application-level protection decisions.',
  },
  'filter-housing-design': {
    title: 'Filter Housing Design: Flow, Sealing & Application | ELIMFILTERS®',
    description: 'Engineering reference for filter housing design, including flow path, sealing, restriction, structural considerations and application suitability.',
  },
};

const STANDARD_CANONICAL_TOPICS: Record<string, string> = {
  'iso-16889': 'https://elimfilters.com/knowledge-center/standards/iso-16889/',
  'iso-4406': 'https://elimfilters.com/knowledge-center/standards/iso-4406/',
};

export function generateStaticParams() {
  return ENGINEERING_ARTICLES.map((a) => ({ topic: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const article = ENGINEERING_ARTICLES.find((a) => a.slug === topic);
  if (!article) return {};

  const url = `https://elimfilters.com/knowledge-center/engineering/${topic}/`;
  const canonicalStandardUrl = STANDARD_CANONICAL_TOPICS[topic];
  const override = CTR_OVERRIDES[topic];
  const title = override?.title ?? article.title;
  const description = override?.description ?? article.metaDescription;

  return {
    title,
    description,
    keywords: article.keywords,
    alternates: { canonical: canonicalStandardUrl ?? url },
    robots: canonicalStandardUrl ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonicalStandardUrl ?? url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function EngineeringArticlePage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const article = ENGINEERING_ARTICLES.find((a) => a.slug === topic);
  if (!article) return notFound();

  return (
    <>
      <ArticleContent article={article} />

      <section
        aria-label="Application conversion paths"
        style={{
          background: '#050505',
          color: '#fff',
          borderTop: '1px solid rgba(255,241,45,0.16)',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 4rem)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            color: '#FFF12D',
            margin: '0 0 0.7rem',
          }}>
            APPLY THE ENGINEERING REFERENCE
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.7rem, 3vw, 2.5rem)',
            lineHeight: 1.1,
            margin: '0 0 0.8rem',
          }}>
            Connect the technical decision to the correct ELIMFILTERS application.
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(255,255,255,0.58)',
            lineHeight: 1.7,
            maxWidth: '780px',
            margin: '0 0 1.6rem',
          }}>
            Use Product Intelligence when you have a reference, part number, or known application. Use Application Support when operating conditions, equipment context, or technical validation still need review.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
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
                letterSpacing: '0.08em',
                fontSize: '0.72rem',
                padding: '0.95rem 1.2rem',
              }}
            >
              SEARCH PRODUCT INTELLIGENCE
            </a>
            <Link
              href="/contact/"
              data-conversion-action="application-support"
              style={{
                color: '#FFF12D',
                border: '1px solid rgba(255,241,45,0.38)',
                textDecoration: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                letterSpacing: '0.08em',
                fontSize: '0.72rem',
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
