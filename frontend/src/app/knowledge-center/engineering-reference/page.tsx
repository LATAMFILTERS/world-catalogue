'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ERL_SECTIONS } from '@/lib/engineering-reference-data';

const displayFont = 'Chakra Petch, Arial Narrow, monospace';
const bodyFont = 'Barlow, Arial, sans-serif';

const CARD_OVERRIDES: Record<string, string> = {
  'particle-science':
    'Particle science explains how contaminant size, count, morphology, and concentration affect wear in bearings, valves, pumps, injectors, and precision clearances. ISO 4406 and ISO 11171 provide the measurement language used to classify and verify fluid cleanliness.',
  'contamination-science':
    'Contamination science identifies where particles, water, and chemical degradation enter or form inside industrial systems. Effective protection requires controlling built-in contamination, ingress contamination, and internally generated wear particles across the full asset lifecycle.',
};

export default function EngineeringReferencePage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap');`}</style>

      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '1.1rem',
          right: '1.35rem',
          zIndex: 50,
          background: 'rgba(0,0,0,0.78)',
          border: '1px solid rgba(255,241,45,0.45)',
          color: '#FFF12D',
          textDecoration: 'none',
          fontFamily: displayFont,
          fontWeight: 700,
          letterSpacing: '0.16em',
          fontSize: '0.78rem',
          padding: '0.8rem 1.15rem',
          backdropFilter: 'blur(14px)',
        }}
      >
        HOME
      </Link>

      <section
        style={{
          minHeight: '74vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.32) 48%, rgba(0,0,0,0.22) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.24), transparent 36%)',
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              letterSpacing: '-0.055em',
              lineHeight: 0.88,
              fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
              maxWidth: '1120px',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            Engineering
            <br />
            <span style={{ color: '#FFF12D' }}>Reference Library</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              marginTop: '2rem',
              maxWidth: '800px',
              color: 'rgba(255,255,255,0.78)',
              fontSize: 'clamp(1rem, 1.6vw, 1.28rem)',
              lineHeight: 1.75,
              fontWeight: 600,
            }}
          >
            Structured technical references for filtration standards, particle control, contamination mechanisms, test methods,
            materials engineering, and reliability analysis.
          </motion.p>
        </div>
      </section>

      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {ERL_SECTIONS.map((section, i) => {
              const cardBody = CARD_OVERRIDES[section.slug] ?? section.definition;

              return (
                <motion.div
                  key={section.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.03 }}
                >
                  <Link
                    href={`/knowledge-center/engineering-reference/${section.slug}`}
                    style={{ textDecoration: 'none', color: '#fff', display: 'block', height: '100%' }}
                  >
                    <motion.div
                      whileHover={{ background: 'rgba(255,241,45,0.04)', borderColor: 'rgba(255,241,45,0.32)' }}
                      style={{
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '2rem',
                        minHeight: '340px',
                        height: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <h2
                        style={{
                          fontFamily: displayFont,
                          fontWeight: 700,
                          fontSize: 'clamp(1.35rem, 2.2vw, 2rem)',
                          color: '#fff',
                          margin: 0,
                          lineHeight: 1.04,
                          letterSpacing: '-0.035em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {section.title}
                      </h2>

                      <p
                        style={{
                          fontFamily: bodyFont,
                          fontSize: '0.98rem',
                          lineHeight: 1.7,
                          color: 'rgba(255,255,255,0.62)',
                          margin: '1.4rem 0 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 5,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {cardBody}
                      </p>

                      <span
                        style={{
                          color: '#FFF12D',
                          fontFamily: displayFont,
                          fontWeight: 700,
                          letterSpacing: '0.16em',
                          fontSize: '0.72rem',
                          marginTop: 'auto',
                          textTransform: 'uppercase',
                        }}
                      >
                        OPEN REFERENCE
                      </span>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section: Key Terms Reference */}
      <section style={{
        padding: '3rem clamp(1.25rem, 4vw, 4rem)',
        marginTop: '2rem',
        background: 'rgba(255,241,45,0.05)',
        borderTop: '1px solid rgba(255,241,45,0.2)',
        borderBottom: '1px solid rgba(255,241,45,0.2)',
      }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            <h3 style={{
              fontFamily: displayFont,
              fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#fff',
              letterSpacing: '0.01em',
            }}>
              Key Terms Reference
            </h3>
            <p style={{
              marginBottom: '1.5rem',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: bodyFont,
              fontSize: '1rem',
              lineHeight: 1.6,
              maxWidth: '680px',
            }}>
              Don't know a term? Check our complete technical glossary with canonical definitions for filtration, contamination control, and engineering terminology.
            </p>
            <Link href="/knowledge-center/glossary/" style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#FFF12D',
              color: '#000',
              textDecoration: 'none',
              fontWeight: 700,
              fontFamily: displayFont,
              letterSpacing: '0.05em',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
            }}>
              Browse Technical Glossary →
            </Link>
          </motion.div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            name: 'ELIMFILTERS Engineering Reference Library',
            description:
              'Industrial filtration engineering reference covering standards, filtration science, particle science, contamination mechanisms, test methods, and reliability analysis.',
            url: 'https://elimfilters.com/knowledge-center/engineering-reference',
            author: {
              '@type': 'Organization',
              '@id': 'https://elimfilters.com/#organization',
              name: 'ELIMFILTERS',
            },
          }),
        }}
      />
    </main>
  );
}
