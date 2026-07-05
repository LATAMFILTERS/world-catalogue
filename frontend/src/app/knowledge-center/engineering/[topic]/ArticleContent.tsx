'use client';

import { motion } from 'motion/react';
import { ENGINEERING_ARTICLES, KCArticle } from '@/lib/knowledge-center-data';
import {
  ArticleBreadcrumb,
  ArticleHero,
  ArticleLayout,
  EngineeringNote,
  ISOStandardCard,
  KCTechnologyCard,
  RelatedArticles,
  ArticleSchema,
} from '@/components/knowledge-center';

const STD_SLUG_MAP: Record<string, string> = {
  'ISO 16889': 'iso-16889',
  'ISO 5011': 'iso-5011',
  'ISO 4406': 'iso-4406',
  'NAS 1638': 'nas-1638',
  'ISO 29463': 'iso-29463',
  'SAE J1858': 'sae-j1858',
  'ISO 11171': 'iso-11171',
  'ISO 8573-1': 'iso-8573-1',
  'SAE J1539': 'sae-j1539',
  'ISO 12937': 'iso-12937',
  'NFPA T2.14': 'nfpa-t2-14',
  'ISO 11155': 'iso-11155-1',
  'ISO 11155-1': 'iso-11155-1',
  'ASTM D6304': 'astm-d6304',
  'ISO 16332': 'iso-16332',
  'DIN 71220': 'din-71220',
  'DIN 51524': 'din-51524',
};

export default function ArticleContent({ article }: { article: KCArticle }) {
  const relatedArticles = ENGINEERING_ARTICLES.filter(
    (a) => a.slug !== article.slug &&
    (a.relatedSystems.some((s) => article.relatedSystems.includes(s)) ||
     a.relatedStandards.some((s) => article.relatedStandards.includes(s)))
  ).slice(0, 3);

  const sidebar = (
    <>
      {article.relatedStandards.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            RELEVANT STANDARDS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {article.relatedStandards.map((std) => (
              <ISOStandardCard
                key={std}
                code={std}
                href={STD_SLUG_MAP[std] ? `/knowledge-center/standards/${STD_SLUG_MAP[std]}` : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {article.relatedTechnologies.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            ELIMFILTERS TECHNOLOGIES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {article.relatedTechnologies.map((tech) => (
              <KCTechnologyCard key={tech} name={tech} />
            ))}
          </div>
        </div>
      )}

      {article.relatedSystems.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            PROTECTION SYSTEMS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {article.relatedSystems.map((sys) => (
              <div key={sys} style={{
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '0.6rem 0.875rem',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.5)',
              }}>
                {sys}
              </div>
            ))}
          </div>
        </div>
      )}

      {article.keywords.length > 0 && (
        <div>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            TOPICS
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {article.keywords.map((kw) => (
              <span key={kw} style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.04)',
                padding: '0.2rem 0.5rem',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      <ArticleBreadcrumb items={[
        { label: 'Knowledge Center', href: '/knowledge-center' },
        { label: 'Engineering', href: '/knowledge-center/engineering' },
        { label: article.title },
      ]} />

      <ArticleHero
        overline={`${article.category} · ${article.readTime}`}
        title={article.title}
        subtitle={article.subtitle}
        intro={article.intro}
      />

      <ArticleLayout sidebar={sidebar}>

        {article.keyMetrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <EngineeringNote
              items={article.keyMetrics}
              valueSize="clamp(1.2rem, 2.5vw, 1.6rem)"
            />
            <div style={{ marginBottom: '3rem' }} />
          </motion.div>
        )}

        {article.sections.map((section, i) => (
          <motion.section
            key={section.heading}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,241,45,0.6)',
              marginBottom: '0.6rem',
            }}>
              {String(i + 1).padStart(2, '0')} /
            </p>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '1.3rem',
              color: '#fff',
              marginBottom: '1rem',
              lineHeight: 1.2,
              textAlign: 'justify',
            }}>
              {section.heading}
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.8,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.7)',
            }}>
              {section.body}
            </p>

            {section.callout && section.callout.length > 0 && (
              <EngineeringNote items={section.callout} variant="white" />
            )}
          </motion.section>
        ))}

        <RelatedArticles
          title="RELATED ENGINEERING TOPICS"
          items={relatedArticles.map((rel) => ({
            title: rel.title,
            href: `/knowledge-center/engineering/${rel.slug}`,
            description: rel.subtitle,
          }))}
        />
      </ArticleLayout>

      <ArticleSchema data={{
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: article.title,
        description: article.metaDescription,
        url: `https://elimfilters.com/knowledge-center/engineering/${article.slug}`,
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        keywords: article.keywords.join(', '),
        about: { '@type': 'Thing', name: article.title, description: article.intro },
      }} />
    </main>
  );
}
