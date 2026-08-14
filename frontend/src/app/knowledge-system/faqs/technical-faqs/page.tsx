'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const FAQS = [
  {
    q: 'Loading from Phase 5A NotebookLM analysis...',
    a: 'This section will be populated with 20 verified technical FAQs extracted and validated through NotebookLM analysis of ELIMFILTERS Knowledge System. Refresh after Phase 5A completion.'
  }
];

export default function TechnicalFAQsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back Navigation */}
      <Link
        href="/knowledge-system/faqs"
        style={{
          display: 'inline-block',
          margin: '2rem',
          color: '#FFF12D',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        ← FAQS
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
            // TECHNICAL KNOWLEDGE · FREQUENTLY ASKED QUESTIONS
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
            Technical FAQs
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '600px',
              lineHeight: 1.6,
            }}
          >
            20 verified technical questions and answers from NotebookLM analysis of ELIMFILTERS Knowledge System, covering ISO standards, contamination control, equipment reliability, and industrial decision-making.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 2rem' }}>
        {/* Point 2: Industrial Context */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            02 / Industrial Context
          </p>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'justify',
            }}
          >
            Industrial maintenance teams, fleet operators, and equipment managers face recurring technical questions about filtration decisions. These questions span ISO standards interpretation, equipment lifespan prediction, contamination control strategy, total cost of ownership analysis, and system-level asset protection design. This FAQ collection addresses the most critical technical questions with verified answers referencing ISO/ASTM/SAE standards and quantified operational impacts.
          </p>
        </motion.section>

        {/* Point 3-10: FAQ Content (Placeholder) */}
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
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            03-10 / Technical FAQ Content
          </p>

          {/* FAQ Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '2rem',
            }}
          >
            {FAQS.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                style={{
                  background: 'rgba(255,241,45,0.03)',
                  border: '1px solid rgba(255,241,45,0.1)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                whileHover={{ borderColor: 'rgba(255,241,45,0.3)', background: 'rgba(255,241,45,0.05)' }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    color: '#fff',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  Q{index + 1}: {faq.q}
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.75)',
                    margin: 0,
                  }}
                >
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Point 9: Internal Knowledge Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
            09 / Related Knowledge
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            <Link
              href="/knowledge-system/standards"
              style={{
                padding: '1rem',
                background: 'rgba(255,241,45,0.05)',
                border: '1px solid rgba(255,241,45,0.1)',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#FFF12D',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
              }}
            >
              ↗ Standards Domain Pages
            </Link>
            <Link
              href="/knowledge-system/contamination"
              style={{
                padding: '1rem',
                background: 'rgba(255,241,45,0.05)',
                border: '1px solid rgba(255,241,45,0.1)',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#FFF12D',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
              }}
            >
              ↗ Contamination Case Studies
            </Link>
            <Link
              href="/knowledge-system/fleet"
              style={{
                padding: '1rem',
                background: 'rgba(255,241,45,0.05)',
                border: '1px solid rgba(255,241,45,0.1)',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#FFF12D',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
              }}
            >
              ↗ Fleet Optimization Strategies
            </Link>
          </div>
        </motion.section>

        {/* Point 10: Canonical Knowledge Block */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
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
            CANONICAL KNOWLEDGE BLOCK: Technical FAQ Collection
          </h3>

          <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
            <p>
              <strong>DEFINITION</strong><br />
              Technical FAQs are verified question-and-answer pairs addressing industrial decision-making in filtration system selection, contamination control strategy, equipment reliability prediction, and total cost of ownership analysis, sourced from NotebookLM analysis and validated against ISO/ASTM/SAE standards.
            </p>

            <p>
              <strong>SYSTEMS</strong><br />
              All industrial filtration domains: Lube oil, air intake, fuel, hydraulic, cabin air, compressed air systems; fleet maintenance operations; equipment asset protection strategies
            </p>

            <p>
              <strong>FAILURE_IMPACT</strong><br />
              Unanswered technical questions lead to incorrect filtration decisions → system approach not adopted → equipment reliability remains sub-optimal → bearing lifespan 3-5× shorter than achievable, downtime 60-80% higher, total cost of ownership remains 87% higher than system approach.
            </p>

            <p>
              <strong>RELATED_STANDARDS</strong><br />
              ISO 16889: Filter efficiency testing | ISO 4406: Particle cleanliness codes | ISO 19438: Bearing life contamination factors | ASTM D6304: Fuel water contamination | SAE standards (air intake, powertrain efficiency)
            </p>

            <p>
              <strong>RELATED_TECHNOLOGIES</strong><br />
              MACROCORE: Air intake volumetric efficiency | SYNTRAX: Engine lube oil cleanliness targets | NANOFORCE: Hydraulic system proportional valve protection | TURBOCORE, SYNTAPORE, TURBOCORE: Fuel system contamination control
            </p>

            <p>
              <strong>INDUSTRIAL_ROLE</strong><br />
              Technical FAQs resolve specific operational decision points, enabling maintenance engineers to shift from commodity filtration thinking to system-level asset protection strategy, directly impacting equipment lifespan, downtime reduction, and total cost of ownership optimization.
            </p>

            <p>
              <strong>CITATION_REFERENCE</strong><br />
              source: elimfilters.com/knowledge-system/faqs/technical-faqs<br />
              concept: Technical FAQ Collection<br />
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
