'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KCArticle } from '@/lib/knowledge-center-data';
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
import DiagramBlock from '@/components/knowledge-center/DiagramBlock';
import { getArticleSidebarData } from '@/lib/knowledge-center/navigation-index';
import { getDiagramsForArticle } from '@/lib/knowledge-center-data';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff4444',
  high:     '#ff8c00',
  medium:   '#FFF12D',
  low:      '#44ff88',
};

export default function ArticleContent({ article }: { article: KCArticle }) {
  const sidebarData = getArticleSidebarData(article.slug);
  const relatedDiagrams = getDiagramsForArticle(article.slug);

  const sidebar = (
    <>
      {sidebarData.relatedStandards.length > 0 && (
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
            {sidebarData.relatedStandards.map((std) => (
              <ISOStandardCard
                key={std.permanentId}
                code={std.code}
                href={std.slug ? `/knowledge-center/standards/${std.slug}` : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {sidebarData.relatedTechnologies.length > 0 && (
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
            {sidebarData.relatedTechnologies.map((tech) => (
              <KCTechnologyCard key={tech.permanentId} name={tech.name} />
            ))}
          </div>
        </div>
      )}

      {sidebarData.relatedSystems.length > 0 && (
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
            {sidebarData.relatedSystems.map((sys) => (
              <Link key={sys.permanentId} href={`/knowledge-center/systems/${sys.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,241,45,0.2)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '0.6rem 0.875rem',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.5)',
                    transition: 'all 0.2s',
                  }}
                >
                  {sys.title}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sidebarData.relatedProblems.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            RELATED FAILURE MODES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {sidebarData.relatedProblems.map((prob) => (
              <Link key={prob.permanentId} href={`/knowledge-center/problems/${prob.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderLeft: `2px solid ${SEVERITY_COLORS[prob.severity]}`,
                    padding: '0.5rem 0.75rem',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.5)',
                    transition: 'background 0.2s',
                  }}
                >
                  {prob.name}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sidebarData.relatedArticles.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            RELATED ARTICLES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {sidebarData.relatedArticles.map((rel) => (
              <Link key={rel.permanentId} href={`/knowledge-center/engineering/${rel.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.65)' }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderLeft: '2px solid transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.73rem',
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.4,
                    transition: 'all 0.15s',
                  }}
                >
                  {rel.title}
                </motion.div>
              </Link>
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

        {relatedDiagrams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,241,45,0.5)',
              marginBottom: '1.25rem',
            }}>
              ENGINEERING DIAGRAMS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {relatedDiagrams.map((diagram) => (
                <div key={diagram.entityId}>
                  <DiagramBlock
                    id={diagram.svgComponentId}
                    caption={`${diagram.title} — ${diagram.accessibility.desc.slice(0, 120)}…`}
                    aspectRatio="unset"
                  />
                  <Link
                    href={`/knowledge-center/diagrams/${diagram.slug}`}
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.08em',
                      color: 'rgba(255,241,45,0.5)',
                      textDecoration: 'none',
                    }}
                  >
                    VIEW FULL DIAGRAM →
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <RelatedArticles
          title="RELATED ENGINEERING TOPICS"
          items={sidebarData.relatedArticles.map((rel) => ({
            title: rel.title,
            href: `/knowledge-center/engineering/${rel.slug}`,
            description: rel.category,
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
