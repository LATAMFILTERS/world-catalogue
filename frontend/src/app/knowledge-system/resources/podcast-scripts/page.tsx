'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const PODCAST_SCRIPTS = [
  {
    title: 'Por Qué la Filtración de Sistema Cuesta 87% Menos a 10 Años',
    duration: '15 min',
    status: 'Generated in Phase 5A',
    href: '/knowledge-system/resources/podcast-scripts/system-vs-commodity-15min',
    description: 'Commodity approach vs System approach comparison with real TCO numbers'
  }
];

export default function PodcastScriptsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back Navigation */}
      <Link
        href="/knowledge-system/resources"
        style={{
          display: 'inline-block',
          margin: '2rem',
          color: '#FFF12D',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        ← RESOURCES
      </Link>

      {/* Hero Section */}
      <section
        style={{
          padding: 'clamp(2rem, 5vw, 4rem)',
          background: 'linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(255,241,45,0.05) 100%)',
          borderBottom: '2px solid rgba(255,241,45,0.15)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,241,45,0.7)', marginBottom: '1rem' }}>
            // TECHNICAL RESOURCES · PODCAST SCRIPTS
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              margin: '0 0 1rem 0',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.2,
            }}
          >
            Podcast Scripts
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '600px',
              lineHeight: 1.6,
            }}
          >
            Ready-to-record scripts for technical audio content. Each script generated through NotebookLM analysis includes ISO standard references, quantified examples, and educational structure.
          </p>
        </motion.div>
      </section>

      {/* Scripts Grid */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {PODCAST_SCRIPTS.map((script, index) => (
            <Link
              key={index}
              href={script.href}
              style={{
                textDecoration: 'none',
              }}
            >
              <motion.div
                style={{
                  background: 'rgba(255,241,45,0.03)',
                  border: '1px solid rgba(255,241,45,0.1)',
                  borderRadius: '8px',
                  padding: '2rem',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                whileHover={{ borderColor: 'rgba(255,241,45,0.35)', background: 'rgba(255,241,45,0.08)' }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <p
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      color: '#FFF12D',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 0.5rem 0',
                    }}
                  >
                    {script.status}
                  </p>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#fff',
                      margin: '0 0 0.5rem 0',
                      lineHeight: 1.4,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {script.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'rgba(255,241,45,0.8)',
                      margin: 0,
                    }}
                  >
                    {script.duration}
                  </p>
                </div>

                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.7)',
                    margin: '1rem 0 0 0',
                  }}
                >
                  {script.description}
                </p>

                <div
                  style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,241,45,0.1)',
                    color: '#FFF12D',
                    fontSize: '0.85rem',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  VIEW SCRIPT →
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Info Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginTop: '4rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            About These Scripts
          </p>
          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'justify',
            }}
          >
            All podcast scripts are generated through NotebookLM analysis of ELIMFILTERS technical documentation, ensuring accuracy against ISO/ASTM/SAE standards and alignment with industrial knowledge. Each script includes speaker notes, timing markers, technical callouts, and references for easy recording.
          </p>
          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'justify',
              marginTop: '1rem',
            }}
          >
            Scripts can be recorded with professional voice talent (ElevenLabs, Google Wavenet, Podcastle) and published to Spotify, Apple Podcasts, YouTube, and industry platforms for technical education and lead generation.
          </p>
        </motion.section>
      </div>
    </main>
  );
}
