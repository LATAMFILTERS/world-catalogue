'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { PEPSystem, PEPFamily, getFamiliesBySystem } from '@/lib/pep-data';
import { KC_SYSTEM_DETAILS, KC_TECHNOLOGIES, ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';

interface Props {
  system: PEPSystem;
  prev: PEPSystem | null;
  next: PEPSystem | null;
}

export default function ProtectionSystemContent({ system, prev, next }: Props) {
  const detail = system.kcDetailSlug ? KC_SYSTEM_DETAILS[system.kcDetailSlug] : null;
  const engineering = detail || system.inlineEngineering;
  const families = getFamiliesBySystem(system.slug);
  const techs = KC_TECHNOLOGIES.filter((t) => system.technologySlugs.includes(t.slug));
  const relatedArticles = ENGINEERING_ARTICLES.filter((a) => system.relatedKCArticleSlugs.includes(a.slug));

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #0a0a0a 0%, #000 60%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
            }}
          >
            PRODUCT EXPERIENCE / SYSTEMS / {system.number}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            {system.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}
          >
            {system.tagline}
          </motion.p>

          {engineering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}
            >
              {engineering.keyMetrics.slice(0, 3).map((m) => (
                <div key={m.label} style={{
                  borderLeft: '2px solid #FFF12D',
                  paddingLeft: '0.75rem',
                }}>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.35)',
                    marginBottom: '0.2rem',
                  }}>
                    {m.label}
                  </p>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#fff',
                  }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Engineering Center Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)' }}>

        {engineering && (
          <>
            {/* 01 / OVERVIEW */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              style={{ marginBottom: '4rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
                01 / OVERVIEW
              </p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1rem' }}>
                Engineering Center
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', marginBottom: '1rem', textAlign: 'justify' }}>
                <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Contamination Target:</strong> {engineering.contaminationTarget}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', textAlign: 'justify' }}>
                <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Target Cleanliness:</strong> {engineering.targetCleanliness}
              </p>
            </motion.section>

            {/* 02 / CONTAMINATION SOURCES */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              style={{ marginBottom: '4rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
                02 / CONTAMINATION SOURCES
              </p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
                What Contaminates This System
              </h2>
              {techs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Array.from(new Set(techs.flatMap((t) => t.contamination))).map((c) => (
                    <div key={c} style={{
                      padding: '0.75rem 1rem',
                      borderLeft: '3px solid rgba(255,241,45,0.3)',
                      background: 'rgba(255,255,255,0.02)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.65)',
                      lineHeight: 1.5,
                    }}>
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* 03 / FAILURE MODES */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              style={{ marginBottom: '4rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
                03 / FAILURE MODES
              </p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1rem' }}>
                Failure Mechanism
              </h2>
              <div style={{
                padding: '1.25rem 1.5rem',
                background: 'rgba(255,60,60,0.04)',
                border: '1px solid rgba(255,60,60,0.12)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.65)',
                textAlign: 'justify',
              }}>
                {engineering.failureMechanism}
              </div>
            </motion.section>

            {/* 04 / PERFORMANCE METRICS */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              style={{ marginBottom: '4rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
                04 / PERFORMANCE METRICS
              </p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
                Key Metrics
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.06)',
              }}>
                {engineering.keyMetrics.map((m) => (
                  <div key={m.label} style={{
                    background: '#000',
                    padding: '1.25rem',
                  }}>
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.6rem',
                      color: 'rgba(255,255,255,0.35)',
                      marginBottom: '0.4rem',
                      letterSpacing: '0.06em',
                    }}>
                      {m.label}
                    </p>
                    <p style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: '#FFF12D',
                    }}>
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 05 / APPLICABLE STANDARDS */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              style={{ marginBottom: '4rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
                05 / APPLICABLE STANDARDS
              </p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
                Standards Framework
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {system.applicableStandards.map((std) => (
                  <span key={std} style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    letterSpacing: '0.06em',
                    color: '#FFF12D',
                    border: '1px solid rgba(255,241,45,0.3)',
                    padding: '0.3rem 0.75rem',
                    background: 'rgba(255,241,45,0.05)',
                  }}>
                    {std}
                  </span>
                ))}
              </div>
            </motion.section>

            {/* 06 / ENGINEERING SECTIONS */}
            {engineering.sections.map((section, i) => (
              <motion.section
                key={section.heading}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                style={{ marginBottom: '3rem' }}
              >
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
                  {String(6 + i).padStart(2, '0')} / {section.heading.toUpperCase()}
                </p>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', marginBottom: '1rem' }}>
                  {section.heading}
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', textAlign: 'justify' }}>
                  {section.body}
                </p>
                {section.callout && (
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                    {section.callout.map((c) => (
                      <div key={c.label} style={{
                        borderLeft: '2px solid rgba(255,241,45,0.4)',
                        paddingLeft: '0.75rem',
                      }}>
                        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.2rem' }}>{c.label}</p>
                        <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#FFF12D' }}>{c.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            ))}
          </>
        )}

        {/* 09 / TECHNOLOGY CENTERS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
            TECHNOLOGY CENTERS
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
            Protection Technologies
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}>
            {techs.map((tech) => (
              <Link
                key={tech.slug}
                href={`/product-experience/technologies/${tech.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <motion.div
                  whileHover={{ background: 'rgba(255,241,45,0.04)', borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    background: '#000',
                    padding: '1.5rem',
                    border: '1px solid transparent',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#FFF12D',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.05em',
                  }}>
                    {tech.name}
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.5,
                    marginBottom: '0.75rem',
                  }}>
                    {tech.tagline}
                  </p>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    color: 'rgba(255,241,45,0.5)',
                  }}>
                    TECHNOLOGY CENTER →
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* PRODUCT FAMILIES */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
            PRODUCT FAMILIES
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
            Family Centers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {families.map((family) => (
              <Link key={family.slug} href={`/product-experience/families/${family.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,241,45,0.04)', borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 500, color: '#fff', marginBottom: '0.2rem' }}>
                      {family.name}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
                      {family.purpose.slice(0, 90)}...
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, marginLeft: '1rem' }}>
                    {family.hdPrefix && (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: '#FFF12D', border: '1px solid rgba(255,241,45,0.3)', padding: '0.1rem 0.35rem' }}>
                        HD {family.hdPrefix}
                      </span>
                    )}
                    {family.ldPrefix && (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.1rem 0.35rem' }}>
                        LD {family.ldPrefix}
                      </span>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Related Engineering Articles */}
        {relatedArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{ marginBottom: '4rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
              RELATED ENGINEERING LIBRARY
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
              Related Articles
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {relatedArticles.map((article) => (
                <Link key={article.slug} href={`/knowledge-center/engineering/${article.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '0.875rem 1.25rem',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 500, color: '#fff', marginBottom: '0.2rem' }}>
                      {article.title}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                      {article.subtitle} · {article.readTime}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Knowledge Center Link */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{
            marginBottom: '4rem',
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>
            RELATED KNOWLEDGE CENTER
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', lineHeight: 1.6 }}>
            Full system documentation including contamination studies, standards frameworks, and fleet optimization strategies.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {system.kcDetailSlug && (
              <Link href={`/knowledge-center/systems/${system.kcDetailSlug}`} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: '#FFF12D',
                textDecoration: 'none',
                letterSpacing: '0.06em',
              }}>
                KNOWLEDGE CENTER: {system.name.toUpperCase()} →
              </Link>
            )}
            <Link href="/product-experience/search" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
              letterSpacing: '0.06em',
            }}>
              SEARCH PLATFORM →
            </Link>
          </div>
        </motion.section>

        {/* Prev / Next Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: prev && next ? '1fr 1fr' : '1fr',
          gap: '1rem',
          marginTop: '2rem',
        }}>
          {prev && (
            <Link href={`/product-experience/systems/${prev.slug}`} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', transition: 'border-color 0.2s' }}
              >
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>← PREV</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#fff' }}>{prev.name}</p>
              </motion.div>
            </Link>
          )}
          {next && (
            <Link href={`/product-experience/systems/${next.slug}`} style={{ textDecoration: 'none', gridColumn: prev ? 'auto' : '1' }}>
              <motion.div
                whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', textAlign: 'right', transition: 'border-color 0.2s' }}
              >
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>NEXT →</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#fff' }}>{next.name}</p>
              </motion.div>
            </Link>
          )}
        </div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        name: `${system.name} Engineering Center`,
        description: system.tagline,
        url: `https://elimfilters.com/product-experience/systems/${system.slug}`,
        isPartOf: { '@type': 'CollectionPage', url: 'https://elimfilters.com/product-experience', name: 'ELIMFILTERS Product Experience Platform' },
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
      })}} />
    </main>
  );
}
