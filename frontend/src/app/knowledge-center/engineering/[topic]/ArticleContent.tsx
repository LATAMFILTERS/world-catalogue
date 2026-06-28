'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ENGINEERING_ARTICLES, KCArticle } from '@/lib/knowledge-center-data';

const STD_SLUG_MAP: Record<string, string> = {
  'ISO 16889': 'iso-16889',
  'ISO 5011': 'iso-5011',
  'ISO 4406': 'iso-4406',
  'NAS 1638': 'nas-1638',
  'ISO 29463': 'iso-29463',
  'SAE J1858': 'sae-j1858',
  'ISO 11171': 'iso-11171',
};

export default function ArticleContent({ article }: { article: KCArticle }) {
  const relatedArticles = ENGINEERING_ARTICLES.filter(
    (a) => a.slug !== article.slug &&
    (a.relatedSystems.some((s) => article.relatedSystems.includes(s)) ||
     a.relatedStandards.some((s) => article.relatedStandards.includes(s)))
  ).slice(0, 3);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0.875rem clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/knowledge-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Knowledge Center</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <Link href="/knowledge-center/engineering" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Engineering</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{article.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #080808 0%, #000 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '1.25rem',
              textTransform: 'uppercase',
            }}
          >
            {article.category} · {article.readTime}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              lineHeight: 1.12,
              marginBottom: '0.75rem',
            }}
          >
            {article.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '1.5rem',
            }}
          >
            {article.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}
          >
            {article.intro}
          </motion.p>
        </div>
      </section>

      {/* Two-column: content + sidebar */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 280px',
        gap: '3rem',
        alignItems: 'start',
      }}>

        {/* Main content */}
        <div>
          {article.keyMetrics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1px',
                background: 'rgba(255,241,45,0.08)',
                border: '1px solid rgba(255,241,45,0.15)',
                marginBottom: '3rem',
              }}
            >
              {article.keyMetrics.map((metric) => (
                <div key={metric.label} style={{ background: '#000', padding: '1.25rem 1.5rem' }}>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                    color: '#FFF12D',
                    marginBottom: '0.25rem',
                    lineHeight: 1,
                  }}>
                    {metric.value}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                    {metric.label}
                  </p>
                </div>
              ))}
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
              }}>
                {section.heading}
              </h2>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.7)',
                textAlign: 'justify',
              }}>
                {section.body}
              </p>

              {section.callout && section.callout.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '1px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  marginTop: '1.5rem',
                }}>
                  {section.callout.map((item) => (
                    <div key={item.label} style={{ background: '#000', padding: '1rem 1.25rem', flex: 1 }}>
                      <p style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                        fontSize: '1.3rem',
                        color: '#FFF12D',
                        lineHeight: 1,
                        marginBottom: '0.2rem',
                      }}>
                        {item.value}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          ))}

          {relatedArticles.length > 0 && (
            <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '1.25rem',
              }}>
                RELATED ENGINEERING TOPICS
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {relatedArticles.map((rel) => (
                  <Link key={rel.slug} href={`/knowledge-center/engineering/${rel.slug}`} style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                      style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.1rem', transition: 'border-color 0.2s' }}
                    >
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>{rel.title}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{rel.subtitle}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: '4rem' }}>
          {article.relatedStandards.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                RELEVANT STANDARDS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {article.relatedStandards.map((std) => {
                  const href = STD_SLUG_MAP[std] ? `/knowledge-center/standards/${STD_SLUG_MAP[std]}` : null;
                  return href ? (
                    <Link key={std} href={href} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileHover={{ background: 'rgba(255,241,45,0.06)' }}
                        style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 0.875rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', fontWeight: 700, color: '#FFF12D', transition: 'background 0.2s' }}
                      >
                        {std}
                      </motion.div>
                    </Link>
                  ) : (
                    <div key={std} style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 0.875rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,241,45,0.7)' }}>
                      {std}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {article.relatedTechnologies.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                ELIMFILTERS TECHNOLOGIES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {article.relatedTechnologies.map((tech) => (
                  <div key={tech} style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 0.875rem', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          )}

          {article.relatedSystems.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                PROTECTION SYSTEMS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {article.relatedSystems.map((sys) => (
                  <div key={sys} style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 0.875rem', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                    {sys}
                  </div>
                ))}
              </div>
            </div>
          )}

          {article.keywords.length > 0 && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                TOPICS
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {article.keywords.map((kw) => (
                  <span key={kw} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: article.title,
        description: article.metaDescription,
        url: `https://elimfilters.com/knowledge-center/engineering/${article.slug}`,
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        keywords: article.keywords.join(', '),
        about: { '@type': 'Thing', name: article.title, description: article.intro },
        mentions: { standards: article.relatedStandards, technologies: article.relatedTechnologies, systems: article.relatedSystems },
      })}} />
    </main>
  );
}
