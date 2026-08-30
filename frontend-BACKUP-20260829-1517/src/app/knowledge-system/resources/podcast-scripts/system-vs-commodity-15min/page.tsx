'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const SCRIPT_PLACEHOLDER = {
  title: 'Por Qué la Filtración de Sistema Cuesta 87% Menos a 10 Años',
  duration: '15 minutos',
  segments: [
    { label: 'INTRO', time: '0:00 - 2:00', status: 'Awaiting Phase 5A NotebookLM analysis' },
    { label: 'ACT 1: Commodity Approach', time: '2:00 - 6:00', status: 'Awaiting Phase 5A NotebookLM analysis' },
    { label: 'ACT 2: System Approach', time: '6:00 - 10:00', status: 'Awaiting Phase 5A NotebookLM analysis' },
    { label: 'ACT 3: Comparison & TCO', time: '10:00 - 13:00', status: 'Awaiting Phase 5A NotebookLM analysis' },
    { label: 'CIERRE', time: '13:00 - 15:00', status: 'Awaiting Phase 5A NotebookLM analysis' }
  ]
};

export default function PodcastScriptPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back Navigation */}
      <Link
        href="/knowledge-system/resources/podcast-scripts"
        style={{
          display: 'inline-block',
          margin: '2rem',
          color: '#FFF12D',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        ← PODCAST SCRIPTS
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
            // PODCAST SCRIPT · PHASE 5A GENERATED
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              margin: '0 0 1rem 0',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.3,
            }}
          >
            {SCRIPT_PLACEHOLDER.title}
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'rgba(255,241,45,0.9)',
              fontFamily: 'JetBrains Mono, monospace',
              margin: 0,
            }}
          >
            Duración: {SCRIPT_PLACEHOLDER.duration}
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 2rem' }}>
        {/* Status Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            background: 'rgba(255,241,45,0.1)',
            border: '1px solid rgba(255,241,45,0.3)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            <strong>📝 Status:</strong> This script is being generated through Phase 5A NotebookLM analysis. Complete the 4-step NotebookLM process to populate this page with the full 15-minute podcast script including speaker notes, timing markers, technical callouts, and ISO references.
          </p>
        </motion.div>

        {/* Script Structure */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginBottom: '3rem' }}
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
            Script Structure
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.5rem',
            }}
          >
            {SCRIPT_PLACEHOLDER.segments.map((segment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                style={{
                  background: 'rgba(255,241,45,0.03)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '6px',
                  padding: '1.5rem',
                  borderLeft: '4px solid rgba(255,241,45,0.5)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <p
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.75rem',
                      color: '#FFF12D',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      margin: 0,
                    }}
                  >
                    {segment.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.75rem',
                      color: 'rgba(255,241,45,0.6)',
                      margin: 0,
                    }}
                  >
                    {segment.time}
                  </p>
                </div>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.6)',
                    margin: 0,
                    fontStyle: 'italic',
                  }}
                >
                  {segment.status}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How to Execute Phase 5A */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ marginBottom: '3rem' }}
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
            How to Generate This Script
          </p>

          <div style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.1)', borderRadius: '8px', padding: '2rem' }}>
            <ol style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
              <li style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                Go to <strong>https://notebooklm.google.com</strong>
              </li>
              <li style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                Create notebook: <strong>"ELIMFILTERS Technical Knowledge System"</strong>
              </li>
              <li style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                Upload two documents:
                <ul style={{ marginTop: '0.5rem' }}>
                  <li>ELIMFILTERS_Knowledge_System_Technical_Base.md</li>
                  <li>ELIMFILTERS_Market_Competitive_Analysis.md</li>
                </ul>
              </li>
              <li style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                Run <strong>PROMPT 3</strong> from Phase 5A guide (Podcast Script Generation)
              </li>
              <li style={{ color: 'rgba(255,255,255,0.8)' }}>
                Copy output and paste into notification system
              </li>
            </ol>
          </div>
        </motion.section>

        {/* Canonical Knowledge Block */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            background: 'rgba(255,241,45,0.05)',
            border: '2px solid rgba(255,241,45,0.25)',
            borderRadius: '8px',
            padding: '2rem',
            marginTop: '4rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
          }}
        >
          <h3 style={{ color: '#FFF12D', marginBottom: '1rem' }}>
            CANONICAL KNOWLEDGE BLOCK: Podcast Script
          </h3>

          <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
            <p>
              <strong>DEFINITION</strong><br />
              A podcast script is a structured, speaker-ready technical presentation generated through NotebookLM analysis, designed for audio delivery to engineering and maintenance professionals, including timing markers, speaker notes, and ISO/ASTM standard references.
            </p>

            <p>
              <strong>INDUSTRIAL_ROLE</strong><br />
              Podcast scripts democratize ELIMFILTERS technical knowledge across industry, enabling educational content distribution to fleet managers, maintenance engineers, and equipment operators who prefer audio learning formats, driving category education and thought leadership.
            </p>

            <p>
              <strong>CITATION_REFERENCE</strong><br />
              source: elimfilters.com/knowledge-system/resources/podcast-scripts/system-vs-commodity-15min<br />
              concept: Podcast Script (System vs Commodity Filtration)<br />
              version: 1.0<br />
              last_updated: 2026-08-03<br />
              data_source: NotebookLM Phase 5A analysis
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
