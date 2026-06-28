'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_STANDARDS, ENGINEERING_ARTICLES, KCStandard } from '@/lib/knowledge-center-data';

export default function StandardContent({ std }: { std: KCStandard }) {
  const relatedArticles = ENGINEERING_ARTICLES.filter(
    (a) => a.relatedStandards.includes(std.code)
  ).slice(0, 4);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.875rem clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/knowledge-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Knowledge Center</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <Link href="/knowledge-center/standards" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Standards</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D' }}>{std.code}</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #080808 0%, #000 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: '#FFF12D', marginBottom: '0.75rem' }}>
            INDUSTRIAL STANDARD · {std.year}
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', color: '#FFF12D', marginBottom: '0.5rem' }}>
            {std.code}
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', lineHeight: 1.3, color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', maxWidth: '680px' }}>
            {std.title}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.18 }}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', maxWidth: '580px', textAlign: 'justify' }}>
            {std.scope}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 260px',
        gap: '3rem',
        alignItems: 'start',
      }}>
        <div>
          {std.keyParams.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ marginBottom: '3rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
                KEY PARAMETERS
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'rgba(255,241,45,0.08)', border: '1px solid rgba(255,241,45,0.12)' }}>
                {std.keyParams.map((param) => (
                  <div key={param.label} style={{ background: '#000', padding: '1.1rem 1.25rem' }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.9rem', color: '#FFF12D', marginBottom: '0.2rem' }}>{param.value}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{param.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {std.sections.map((section, i) => (
            <motion.section key={section.heading} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 + i * 0.07 }} style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.5)', marginBottom: '0.5rem' }}>
                {String(i + 1).padStart(2, '0')} /
              </p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.2rem', color: '#fff', marginBottom: '0.875rem', lineHeight: 1.2 }}>
                {section.heading}
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.93rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.68)', textAlign: 'justify' }}>
                {section.body}
              </p>
            </motion.section>
          ))}

          {relatedArticles.length > 0 && (
            <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem', marginTop: '1rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>
                ENGINEERING ARTICLES REFERENCING {std.code}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {relatedArticles.map((art) => (
                  <Link key={art.slug} href={`/knowledge-center/engineering/${art.slug}`} style={{ textDecoration: 'none' }}>
                    <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                      style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.1rem', transition: 'border-color 0.2s', cursor: 'pointer' }}>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem', lineHeight: 1.25 }}>{art.title}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{art.readTime} read</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: '4rem' }}>
          {std.relatedTechnologies.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>TECHNOLOGIES</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {std.relatedTechnologies.map((tech) => (
                  <div key={tech} style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 0.875rem', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          )}

          {std.relatedTopics.length > 0 && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>RELATED TOPICS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {std.relatedTopics.map((topic) => (
                  <Link key={topic} href={`/knowledge-center/engineering/${topic}`} style={{ textDecoration: 'none' }}>
                    <motion.div whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                      style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 0.875rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', transition: 'background 0.2s' }}>
                      {topic.replace(/-/g, ' ')} →
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid rgba(255,241,45,0.1)', background: 'rgba(255,241,45,0.02)' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'rgba(255,241,45,0.5)', marginBottom: '0.5rem' }}>STANDARD REFERENCE</p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.8rem', color: '#FFF12D' }}>{std.code}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.25rem' }}>Published {std.year}</p>
          </div>
        </aside>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        identifier: std.code,
        headline: std.title,
        description: std.metaDescription,
        url: `https://elimfilters.com/knowledge-center/standards/${std.slug}`,
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        about: { '@type': 'Thing', name: std.code, description: std.scope },
        mentions: std.relatedTechnologies.map((t) => ({ '@type': 'Thing', name: t })),
      })}} />
    </main>
  );
}
