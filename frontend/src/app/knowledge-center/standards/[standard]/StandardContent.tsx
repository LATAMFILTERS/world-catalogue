'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KCStandard } from '@/lib/knowledge-center-data';
import {
  ArticleBreadcrumb,
  ArticleHero,
  ArticleLayout,
  KCTechnologyCard,
  RelatedArticles,
  ArticleSchema,
} from '@/components/knowledge-center';
import { getStandardSidebarData } from '@/lib/knowledge-center/navigation-index';
import RecommendationBlock from '@/components/knowledge-center/RecommendationBlock';

export default function StandardContent({ std }: { std: KCStandard }) {
  const { referencingArticles, relatedStandards: indexRelatedStandards } = getStandardSidebarData(std.slug);

  const sidebar = (
    <>
      {std.relatedTechnologies.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            TECHNOLOGIES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {std.relatedTechnologies.map((tech) => (
              <KCTechnologyCard key={tech} name={tech} />
            ))}
          </div>
        </div>
      )}

      {std.relatedTopics.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            RELATED TOPICS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {std.relatedTopics.map((topic) => (
              <Link key={topic} href={`/knowledge-center/engineering/${topic}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '0.6rem 0.875rem',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.45)',
                    transition: 'background 0.2s',
                  }}
                >
                  {topic.replace(/-/g, ' ')} →
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {indexRelatedStandards.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            RELATED STANDARDS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {indexRelatedStandards.map((s) => (
              s.slug ? (
                <Link key={s.permanentId} href={`/knowledge-center/standards/${s.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ background: 'rgba(255,241,45,0.06)' }}
                    style={{
                      border: '1px solid rgba(255,255,255,0.07)',
                      padding: '0.6rem 0.875rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#FFF12D',
                      transition: 'background 0.2s',
                    }}
                  >
                    {s.code}
                  </motion.div>
                </Link>
              ) : (
                <div key={s.permanentId} style={{
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '0.6rem 0.875rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'rgba(255,241,45,0.7)',
                }}>
                  {s.code}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <div style={{
        padding: '1rem',
        border: '1px solid rgba(255,241,45,0.1)',
        background: 'rgba(255,241,45,0.02)',
      }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.08em',
          color: 'rgba(255,241,45,0.5)',
          marginBottom: '0.5rem',
        }}>
          STANDARD REFERENCE
        </p>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.8rem', color: '#FFF12D' }}>
          {std.code}
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.25rem' }}>
          Published {std.year}
        </p>
      </div>
    </>
  );

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      <ArticleBreadcrumb items={[
        { label: 'Knowledge Center', href: '/knowledge-center' },
        { label: 'Standards', href: '/knowledge-center/standards' },
        { label: std.code },
      ]} />

      <ArticleHero
        overline={`INDUSTRIAL STANDARD · ${std.year}`}
        title={std.code}
        titleVariant="code"
        subtitle={std.title}
        intro={std.scope}
        maxWidth="860px"
      />

      <ArticleLayout sidebar={sidebar}>

        {std.keyParams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '1rem',
            }}>
              KEY PARAMETERS
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1px',
              background: 'rgba(255,241,45,0.08)',
              border: '1px solid rgba(255,241,45,0.12)',
            }}>
              {std.keyParams.map((param) => (
                <div key={param.label} style={{ background: '#000', padding: '1.1rem 1.25rem' }}>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#FFF12D',
                    marginBottom: '0.2rem',
                  }}>
                    {param.value}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                    {param.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {std.sections.map((section, i) => (
          <motion.section
            key={section.heading}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 + i * 0.07 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,241,45,0.5)',
              marginBottom: '0.5rem',
            }}>
              {String(i + 1).padStart(2, '0')} /
            </p>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '1.2rem',
              color: '#fff',
              marginBottom: '0.875rem',
              lineHeight: 1.2,
              textAlign: 'justify',
            }}>
              {section.heading}
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.93rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.68)',
              textAlign: 'justify',
            }}>
              {section.body}
            </p>
          </motion.section>
        ))}

        <RelatedArticles
          title={`ENGINEERING ARTICLES REFERENCING ${std.code}`}
          items={referencingArticles.slice(0, 6).map((art) => ({
            title: art.title,
            href: `/knowledge-center/engineering/${art.slug}`,
            meta: `${art.readTime} read`,
          }))}
        />

        <RecommendationBlock
          sourceType="standard"
          sourceSlug={std.slug}
          maxResults={10}
          excludeTypes={['standard']}
          title="Related Engineering Content"
        />

      </ArticleLayout>

      <ArticleSchema data={{
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        identifier: std.code,
        headline: std.title,
        description: std.metaDescription,
        url: `https://elimfilters.com/knowledge-center/standards/${std.slug}`,
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        about: { '@type': 'Thing', name: std.code, description: std.scope },
      }} />
    </main>
  );
}
