'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { KCTechnology } from '@/lib/knowledge-center-data';
import type { PEPFamily } from '@/lib/pep-data';
import { PEP_SYSTEMS } from '@/lib/pep-data';

interface Props {
  tech: KCTechnology;
  relatedFamilies: PEPFamily[];
}

export default function TechCenterContent({ tech, relatedFamilies }: Props) {
  const relatedSystems = PEP_SYSTEMS.filter((s) => s.technologySlugs.includes(tech.slug));

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
            PRODUCT EXPERIENCE / TECHNOLOGY CENTER
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
              marginBottom: '0.5rem',
              color: '#FFF12D',
            }}
          >
            {tech.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '1rem',
            }}
          >
            {tech.domain}
          </motion.p>

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
            {tech.tagline}
          </motion.p>

          {/* Key Performance Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}
          >
            {tech.performanceSpecs.slice(0, 3).map((spec) => (
              <div key={spec.label} style={{ borderLeft: '2px solid #FFF12D', paddingLeft: '0.75rem' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.2rem' }}>
                  {spec.label}
                </p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>
                  {spec.value}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)' }}>

        {/* 01 / ENGINEERING PRINCIPLE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
            01 / ENGINEERING PRINCIPLE
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1rem' }}>
            How {tech.name} Works
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', textAlign: 'justify' }}>
            {tech.engineeringPrinciple}
          </p>
        </motion.section>

        {/* 02 / CONTAMINATION ADDRESSED */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
            02 / CONTAMINATION ADDRESSED
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
            Contamination Modes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {tech.contamination.map((c) => (
              <div key={c} style={{
                padding: '0.75rem 1rem',
                borderLeft: '3px solid rgba(255,241,45,0.3)',
                background: 'rgba(255,255,255,0.02)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.65)',
              }}>
                {c}
              </div>
            ))}
          </div>
        </motion.section>

        {/* 03 / PERFORMANCE SPECIFICATIONS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
            03 / PERFORMANCE SPECIFICATIONS
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
            Verified Performance Data
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}>
            {tech.performanceSpecs.map((spec) => (
              <div key={spec.label} style={{ background: '#000', padding: '1.25rem' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.4rem', letterSpacing: '0.06em' }}>
                  {spec.label}
                </p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#FFF12D' }}>
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 04 / APPLICABLE STANDARDS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
            04 / APPLICABLE STANDARDS
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
            Standards Framework
          </h2>
          {tech.standards.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {tech.standards.map((std) => (
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
          ) : (
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
              DOCUMENTATION PENDING
            </p>
          )}
        </motion.section>

        {/* 05 / RELATED PROTECTION SYSTEMS */}
        {relatedSystems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{ marginBottom: '4rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
              05 / RELATED PROTECTION SYSTEMS
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
              Applied In
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {relatedSystems.map((s) => (
                <Link key={s.slug} href={`/product-experience/systems/${s.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                    style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }}
                  >
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 500, color: '#fff' }}>{s.name}</p>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,241,45,0.5)' }}>ENGINEERING CENTER →</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* 06 / RELATED INDUSTRIES */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
            06 / RELATED INDUSTRIES
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
            Industry Applications
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tech.relatedIndustries.map((ind) => (
              <Link key={ind} href={`/knowledge-center/industries/${ind}`} style={{ textDecoration: 'none' }}>
                <motion.span
                  whileHover={{ background: 'rgba(255,241,45,0.08)', borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    display: 'inline-block',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.65)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: '0.3rem 0.75rem',
                    transition: 'background 0.2s, border-color 0.2s',
                    textTransform: 'capitalize',
                  }}
                >
                  {ind.replace(/-/g, ' ')}
                </motion.span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* 07 / PRODUCT FAMILIES */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
            07 / PRODUCT FAMILIES
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
            Commercial Product Families
          </h2>
          {relatedFamilies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {relatedFamilies.map((family) => (
                <Link key={family.slug} href={`/product-experience/families/${family.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                    style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }}
                  >
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 500, color: '#fff', marginBottom: '0.15rem' }}>{family.name}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{family.systemSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {family.hdPrefix && (
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: '#FFF12D', border: '1px solid rgba(255,241,45,0.3)', padding: '0.1rem 0.35rem' }}>
                          HD {family.hdPrefix}
                        </span>
                      )}
                      {family.ldPrefix && (
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.1rem 0.35rem' }}>
                          LD {family.ldPrefix}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
              DOCUMENTATION PENDING
            </p>
          )}
        </motion.section>

        {/* 08 / WORKS WITH */}
        {tech.worksWith.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{ marginBottom: '4rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>
              08 / WORKS WITH
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '1.5rem' }}>
              Complementary Technologies
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {tech.worksWith.map((name) => {
                const slug = name.replace('™', '').toLowerCase().trim().replace(/\s+/g, '-');
                return (
                  <Link key={name} href={`/product-experience/technologies/${slug}`} style={{ textDecoration: 'none' }}>
                    <motion.span
                      whileHover={{ background: 'rgba(255,241,45,0.08)', borderColor: 'rgba(255,241,45,0.5)' }}
                      style={{
                        display: 'inline-block',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#FFF12D',
                        border: '1px solid rgba(255,241,45,0.3)',
                        padding: '0.35rem 0.75rem',
                        letterSpacing: '0.05em',
                        transition: 'background 0.2s, border-color 0.2s',
                      }}
                    >
                      {name}
                    </motion.span>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Knowledge Center Deep Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '2rem',
          }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>
            FULL DOCUMENTATION
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href={`/knowledge-center/technologies/${tech.slug}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', textDecoration: 'none', letterSpacing: '0.06em' }}>
              KNOWLEDGE CENTER: {tech.name.replace('™', '').toUpperCase()} →
            </Link>
            <Link href="/product-experience" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.06em' }}>
              ← PLATFORM OVERVIEW
            </Link>
          </div>
        </motion.div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        name: `${tech.name} Technology Center`,
        description: tech.tagline,
        url: `https://elimfilters.com/product-experience/technologies/${tech.slug}`,
        isPartOf: { '@type': 'CollectionPage', url: 'https://elimfilters.com/product-experience', name: 'ELIMFILTERS Product Experience Platform' },
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
      })}} />
    </main>
  );
}
