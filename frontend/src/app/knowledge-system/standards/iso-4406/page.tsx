'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const CODE_TABLE = [
  { code: '12', from: '20', to: '40' },
  { code: '13', from: '40', to: '80' },
  { code: '14', from: '80', to: '160' },
  { code: '15', from: '160', to: '320' },
  { code: '16', from: '320', to: '640' },
  { code: '17', from: '640', to: '1,300' },
  { code: '18', from: '1,300', to: '2,500' },
  { code: '19', from: '2,500', to: '5,000' },
  { code: '20', from: '5,000', to: '10,000' },
  { code: '21', from: '10,000', to: '20,000' },
  { code: '22', from: '20,000', to: '40,000' },
];

export default function ISO4406Page() {
  const sections = [
    {
      title: 'How the ISO 4406 code works',
      content: 'An ISO 4406 code consists of three numbers separated by slashes — for example 18/16/13 — reporting particle concentrations at three size thresholds: ≥4 µm(c), ≥6 µm(c) and ≥14 µm(c). Each code number corresponds to a range of particles per milliliter, and each step up the scale doubles the allowed concentration. A code of 18/16/13 means the sample contains between 1,300 and 2,500 particles ≥4 µm per mL, between 320 and 640 particles ≥6 µm per mL, and between 40 and 80 particles ≥14 µm per mL. Because the scale is logarithmic, a fluid at 19/17/14 is twice as contaminated as one at 18/16/13 at every size threshold — a difference of one code number is never trivial. Particle counts are obtained with automatic particle counters calibrated per ISO 11171, which is what the "(c)" size designation certifies.'
    },
    {
      title: 'Why it matters in industrial filtration',
      content: 'ISO 4406 is the shared language between fluid suppliers, equipment manufacturers, filter designers and maintenance teams. Component manufacturers publish the cleanliness codes their parts require: proportional and servo valves typically require 17/15/12 or cleaner; piston pumps commonly require 18/16/13; engine lubrication circuits target codes in the region of 16/14/11 for maximum bearing life. New oil straight from the drum frequently measures 21/19/16 or worse — visibly clean fluid can be far outside specification, which is why cleanliness must be measured, never assumed. Once a target code is set, filtration is sized to achieve it: the filter’s ISO 16889 Beta ratios at 4, 6 and 14 µm(c), together with system flow and ingression rate, determine the equilibrium cleanliness the circuit will hold.'
    },
    {
      title: 'Application in engines and systems',
      content: 'In hydraulic systems for construction, mining and agricultural machinery, the OEM service manual specifies the ISO 4406 target for each circuit, and oil analysis programs report measured codes against that target every sampling interval. In engine lubrication, cleanliness codes quantify how effectively the full-flow filtration maintains the oil between drain intervals. NANOFORCE hydraulic elements are engineered to achieve and hold servo-class targets in high-pressure circuits, and SYNTRAX lubrication elements perform the same role in engine oil circuits — in both cases the ISO 4406 code is the measured outcome that verifies the filtration system is doing its job. A rising code trend between samples is an early warning: it signals increased ingression, filter bypass, or accelerating internal wear before component failure occurs.'
    }
  ];

  const faqs = [
    {
      question: 'How does ISO 4406 relate to ISO 16889?',
      answer: 'They are complementary, not competing. ISO 4406 classifies the cleanliness of a fluid sample — it describes the state of the oil. ISO 16889 tests the performance of a filter element — it describes the capability of the filter, expressed as Beta ratios. Both use the same particle sizes (4, 6 and 14 µm(c)) and the same ISO 11171 counter calibration, so they connect directly: a designer picks a target ISO 4406 code for the system, then uses ISO 16889 data to select a filter that can achieve it. Neither standard replaced the other.'
    },
    {
      question: 'What does a code like 19/17/14 mean?',
      answer: 'Reading each number against the ISO 4406 scale: code 19 = 2,500–5,000 particles ≥4 µm per mL; code 17 = 640–1,300 particles ≥6 µm per mL; code 14 = 80–160 particles ≥14 µm per mL. This is a relatively contaminated fluid — acceptable for low-pressure systems with wide clearances, but roughly 4× dirtier than the 17/15/12 level required by proportional valve circuits. Each single-step difference in a code number represents a doubling or halving of particle concentration.'
    },
    {
      question: 'Why does new oil often fail its ISO 4406 target?',
      answer: 'Oil picks up contamination at every handling step: refinery, drum or tote filling, storage, transfer pumps and funnels. New oil commonly measures ISO 4406 21/19/16 — dozens of times dirtier than a typical hydraulic target of 17/15/12. This is why critical systems filter new oil during filling (via a filter cart or dedicated transfer filtration) rather than pouring it in directly, and why commissioning procedures for hydraulic systems include flushing until the measured code reaches specification.'
    },
    {
      question: 'How often should fluid cleanliness be measured?',
      answer: 'Sampling frequency follows criticality and environment. Servo-controlled and high-pressure hydraulic systems are typically sampled monthly or quarterly; mobile equipment in high-dust environments every 250–500 operating hours; engine lube oil at every drain interval as part of a standard oil analysis panel. The trend matters more than any single result: a code that climbs one number between consecutive samples indicates a doubling of contamination and warrants investigation of ingression points, filter condition and wear generation before damage propagates.'
    }
  ];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Breadcrumb />
      {/* Back Button */}
      <Link href="/knowledge-system/standards"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← STANDARDS</Link>

      {/* Hero Section */}
      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}
        >
          <h1 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            ISO 4406
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            textAlign: 'justify', lineHeight: 1.65,
          }}>
            Hydraulic Fluid Power — Fluids — Method for Coding the Level of Contamination by Solid Particles
          </p>
        </motion.div>
      </section>

      {/* Content Sections */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        {/* Section: Definition (with internal links) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          style={{
            marginBottom: '3rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            What is ISO 4406?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            ISO 4406 is the international standard for expressing the solid particle contamination level of a fluid sample as a three-number cleanliness code — for example 18/16/13 — counting particles ≥4 µm, ≥6 µm and ≥14 µm per milliliter. It is the universal measurement language of{' '}
            <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration strategy</Link>:{' '}
            equipment manufacturers specify required codes for their components, oil analysis laboratories report measured codes, and filtration systems are designed to achieve them. The particle counts behind every code are produced by counters calibrated per{' '}
            <Link href="/knowledge-system/standards/iso-11171" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 11171</Link>. Filter capability is qualified separately under{' '}
            <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889</Link>, which measures the Beta ratios needed to reach a given cleanliness target. The particle contamination that ISO 4406 quantifies is the primary driver of{' '}
            <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>abrasive wear in engines and hydraulic components</Link>.
          </p>
        </motion.div>

        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
            style={{
              marginBottom: '3rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h2 style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#FFF12D',
              marginBottom: '1rem',
              letterSpacing: '-0.01em',
            }}>
              {section.title}
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'justify', lineHeight: 1.8,
            }}>
              {section.content}
            </p>
          </motion.div>
        ))}

        {/* Code Range Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            ISO 4406 code numbers and particle count ranges
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
            marginBottom: '1.25rem',
          }}>
            Each code number represents a range of particles per milliliter, doubling at every step. The same scale applies at each of the three size thresholds (≥4 µm, ≥6 µm, ≥14 µm).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.85rem',
            }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.6rem 1rem', color: '#FFF12D', borderBottom: '1px solid rgba(255,241,45,0.3)' }}>Code</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 1rem', color: '#FFF12D', borderBottom: '1px solid rgba(255,241,45,0.3)' }}>Particles/mL — more than</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 1rem', color: '#FFF12D', borderBottom: '1px solid rgba(255,241,45,0.3)' }}>Particles/mL — up to</th>
                </tr>
              </thead>
              <tbody>
                {CODE_TABLE.map((row) => (
                  <tr key={row.code}>
                    <td style={{ padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{row.code}</td>
                    <td style={{ padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{row.from}</td>
                    <td style={{ padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{row.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: sections.length * 0.1 }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '2rem',
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (sections.length + 1 + i) * 0.1 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  padding: '1.5rem',
                  borderRadius: '4px',
                }}
              >
                <h3 style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#FFF12D',
                  marginBottom: '0.75rem',
                }}>
                  {faq.question}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'justify', lineHeight: 1.7,
                }}>
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Fluid Cleanliness Classification [PRIMARY] | Particle Count Codes [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: lube, hydraulic, transmission, industrial_fluid</p>
        <p>CONCEPT_TAXONOMY: type=standard | domain=fluid-cleanliness-coding | standards=ISO-4406, ISO-11171, ISO-16889</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 11171</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: NANOFORCE, SYNTRAX</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/iso-4406</p>
        <p>&nbsp;&nbsp;concept_id: iso-4406-cleanliness-codes</p>
        <p>&nbsp;&nbsp;version: 2.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-07-03</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': 'https://elimfilters.com/knowledge-system/standards/iso-4406',
        headline: 'ISO 4406 — Fluid Cleanliness Classification Standard',
        description: 'ISO 4406 establishes the three-number cleanliness code for hydraulic and lubrication fluids, counting particles ≥4µm, ≥6µm and ≥14µm per milliliter with counters calibrated per ISO 11171. Each code step doubles the allowed particle concentration. Works together with ISO 16889 filter performance data to design filtration that achieves target cleanliness.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-07-03',
        keywords: ['ISO 4406', 'fluid cleanliness code', 'hydraulic oil cleanliness', 'particle count classification', 'ISO 11171 calibration', 'cleanliness target', 'oil analysis', 'contamination measurement'],
        about: { '@type': 'Thing', name: 'ISO 4406 Cleanliness Codes', description: 'International standard for classifying hydraulic and lube oil fluid cleanliness using three-number particle count codes at 4, 6 and 14 micron thresholds.' },
        inLanguage: 'en',
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Standards', item: 'https://elimfilters.com/knowledge-system/standards' },
          { '@type': 'ListItem', position: 4, name: 'ISO 4406', item: 'https://elimfilters.com/knowledge-system/standards/iso-4406' },
        ],
      }) }} />
    </main>
  );
}
