import type { Metadata } from 'next';
import Link from 'next/link';
import { ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import ArticleContent from './ArticleContent';

export function generateStaticParams() {
  return ENGINEERING_ARTICLES.map((a) => ({ topic: a.slug }));
}

export async function generateMetadata({ params }: { params: { topic: string } }): Promise<Metadata> {
  const article = ENGINEERING_ARTICLES.find((a) => a.slug === params.topic);
  if (!article) return {};

  const url = `https://elimfilters.com/knowledge-center/engineering/${params.topic}/`;
  return {
    title: article.title,
    description: article.metaDescription,
    keywords: article.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${article.title} | ELIMFILTERS`,
      description: article.metaDescription,
      url,
      type: 'article',
    },
  };
}

export default function EngineeringArticlePage({ params }: { params: { topic: string } }) {
  const article = ENGINEERING_ARTICLES.find((a) => a.slug === params.topic);
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
