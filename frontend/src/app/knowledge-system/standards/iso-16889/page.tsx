'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function ISO16889Page() {
  const sections = [
    {
      title: 'What Is ISO 16889 Used For?',
      content: 'ISO 16889 serves as a universal communication tool between fluid suppliers, equipment manufacturers, and machine operators. Its purpose is to establish a common language for specifying, verifying, and documenting the cleanliness of hydraulic fluids. It allows organisations to define precise fluid quality requirements, monitor contamination during operation, and verify that fluid meets the specifications required to protect hydraulic system components from degradation and premature wear.'
    },
    {
      title: 'Why It Matters in Industrial Filtration',
      content: 'In industrial filtration, ISO 16889 is fundamental because it establishes the quantifiable target that a filtration system must achieve. Without this standard, there would be no consistent way to measure whether a filter or filtration system is performing its function. ISO 16889 defines exactly what cleanliness level is required for different applications, enabling engineers to design filtration systems that maintain fluid within the specified ranges. This is critical because particulate contamination is the primary cause of wear in hydraulic components, responsible for 50–75% of hydraulic system failures in industry.'
    },
    {
      title: 'Application in Engines and Systems',
      content: 'In hydraulic systems for heavy machinery, construction equipment, agricultural systems, marine machinery, and mining equipment, ISO 16889 determines the required cleanliness specifications. For example, a servo-controlled hydraulic system may require ISO 16889 16/14/11 (maximum 1,300 particles >4 µm, 160 particles >6 µm, 20 particles >14 µm per mL), while a transmission system may specify ISO 16889 18/16/13. OEM equipment manufacturers use these codes in their service manuals to indicate the correct fluid standard, and operators regularly monitor fluid to ensure it remains within the specified classification using particle counting tests.'
    }
  ];

  const faqs = [
    {
      question: 'What Is the Difference Between ISO 16889 and ISO 4406?',
      answer: 'ISO 4406 used a less precise 2–3 digit code, while ISO 16889 uses a three-number code measuring particles at three different sizes (>4 µm, >6 µm, >14 µm). ISO 16889 also specifies more rigorous test methods and uses more standardised particle sizes. ISO 16889 offers greater precision and is now the preferred industry standard.'
    },
    {
      question: 'What Does Code 17/15/12 Mean in ISO 16889?',
      answer: 'An ISO 16889 code of 17/15/12 means the fluid contains: maximum 1,300 particles larger than 4 microns per millilitre (scale number 17), maximum 320 particles larger than 6 microns per millilitre (scale number 15), and maximum 20 particles larger than 14 microns per millilitre (scale number 12). Each number represents an ISO scale code corresponding to a range of particle counts per millilitre.'
    },
    {
      question: 'How Often Should I Verify Fluid Cleanliness per ISO 16889?',
      answer: 'Frequency depends on equipment type and operating conditions. Critical systems such as servo-controlled machinery require monthly or quarterly verification. Construction equipment in dusty environments may require verification every 50–100 operating hours. OEM manufacturers specify intervals in their service manuals. Testing is performed using optical or light-blocking particle counters calibrated to ISO 11171.'
    }
  ];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back Button */}
      <Link href="/knowledge-system/standards" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
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
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            color: '#FFF12D',
            marginBottom: '1rem',
            opacity: 0.85,
          }}>
            // INTERNATIONAL FILTRATION STANDARD
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            ISO 16889
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Hydraulic Fluid Power — Fluids — Method for coding the degree of contamination by solid particles
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
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            What Is ISO 16889?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
          }}>
            ISO 16889 is the international standard that defines the cleanliness coding method for hydraulic fluids based on the degree of solid particle contamination. It is the central measurement tool within any{' '}
            <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration strategy</Link>.{' '}
            It establishes a standardised three-number classification system that identifies the particle count per millilitre of fluid at three size thresholds: larger than 4 µm, 6 µm, and 14 µm. This standard superseded{' '}
            <Link href="/knowledge-system/standards/iso-4406" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 4406</Link>{' '}
            as the preferred cleanliness code in modern industry, offering a more precise and reliable methodology for fluid quality evaluation. The contamination ISO 16889 quantifies is the same contamination that drives{' '}
            <Link href="/knowledge-system/contamination/hydraulic-system" style={{ color: '#FFF12D', textDecoration: 'underline' }}>accelerated degradation in high-pressure hydraulic systems</Link>.
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
              borderBottom: i < sections.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}
          >
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
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
              lineHeight: 1.8,
            }}>
              {section.content}
            </p>
          </motion.div>
        ))}
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
            fontFamily: 'Outfit, sans-serif',
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
                  fontFamily: 'Outfit, sans-serif',
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
                  lineHeight: 1.7,
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
        <p>SEMANTIC_DOMAINS: Contamination Control Systems [PRIMARY] | Hydraulic Efficiency Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: hydraulic, lube, fuel, industrial_fluid</p>
        <p>CONCEPT_TAXONOMY: type=standard | domain=filter-testing | standards=ISO-16889, ISO-4406</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 4406, ISO 16889, NFPA T2.14</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/hydraulic-system</p>
        <p>&nbsp;&nbsp;Related_Technologies: NANOFORCE, SYNTRAX, MACROCORE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/total-cost-ownership</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/iso-16889</p>
        <p>&nbsp;&nbsp;concept_id: iso-16889-filter-testing</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </RetrievalBlock>
    </main>
  );
}
