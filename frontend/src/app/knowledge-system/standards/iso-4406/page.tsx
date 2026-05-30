'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function ISO4406Page() {
  const sections = [
    {
      title: 'What Is ISO 4406 Used For?',
      content: 'ISO 4406 serves as a simplified classification system for communicating the cleanliness state of a hydraulic fluid between suppliers and users. Its purpose is to allow different parties to quickly identify whether a fluid meets the minimum cleanliness requirements for a specific application. The standard provides a methodology for particle counting and fluid classification according to two particle size categories, enabling consistent communication about fluid quality. Although less precise than ISO 16889, ISO 4406 remains useful for general maintenance purposes and fluid comparison.'
    },
    {
      title: 'Why It Matters in Industrial Filtration',
      content: 'ISO 4406 is important in industrial filtration because it established the fundamental principles of cleanliness coding that the industry continues to use today. It was the first widely adopted standard that allowed filtration system manufacturers to set quantifiable targets for fluid cleanliness. Although ISO 16889 has improved precision with the addition of a third classification digit (for particles >14 µm), the basic concepts of ISO 4406 remain valid. Understanding ISO 4406 is essential for filtration professionals working with legacy equipment or who need to translate older specifications to modern standards.'
    },
    {
      title: 'Application in Engines and Systems',
      content: 'In older hydraulic systems in industrial machinery, hydraulic transmissions in construction vehicles manufactured before 2010, and legacy aviation systems, ISO 4406 remains the reference specification. A typical ISO 4406 code such as 18/16 means: maximum 1,300 particles larger than 4 µm and maximum 320 particles larger than 6 µm per millilitre. Operators of older equipment must still regularly verify their fluids against these ISO 4406 specifications. For new equipment, although the specification may originate from ISO 4406, it is generally translated to ISO 16889 equivalents for more precise evaluation (for example, ISO 4406 18/16 is approximately equivalent to ISO 16889 17/15/12).'
    }
  ];

  const faqs = [
    {
      question: 'How Does ISO 4406 Relate to ISO 16889?',
      answer: 'ISO 16889 was developed as an improvement to ISO 4406, adding a third classification level for particles larger than 14 µm, providing greater precision. ISO 16889 also specifies more rigorous counting methods. ISO 4406 codes can be approximately converted to ISO 16889 equivalents (e.g., 18/16 ≈ 17/15/12), but the conversion is not exact. ISO 16889 is now the preferred standard for new equipment, but ISO 4406 remains valid and widely used.'
    },
    {
      question: 'What Does Code 19/17 Mean in ISO 4406?',
      answer: 'An ISO 4406 code of 19/17 means the fluid contains a maximum of 2,560 particles larger than 4 µm per millilitre and a maximum of 640 particles larger than 6 µm per millilitre. This is a relatively high contamination level, used for non-critical systems or heavy-duty applications where a degree of contamination is expected and tolerated.'
    },
    {
      question: 'Is ISO 4406 Still Used in Modern Equipment?',
      answer: 'Although ISO 16889 is now the preferred standard for new specifications, ISO 4406 still appears in many contexts: older OEM equipment still in operation, legacy specifications in service manuals, and in some cases used alongside ISO 16889 for historical compatibility. Modern filtration technicians must be familiar with both standards to interpret specifications across a wide range of equipment.'
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
            ISO 4406
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Hydraulic Fluid Power — Fluids — Method for assessing the cleanliness of a liquid sample
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
            What Is ISO 4406?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
          }}>
            ISO 4406 is the international standard that defines the method for evaluating the cleanliness of liquid samples in{' '}
            <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration systems</Link>,
            developed in the 1970s. It uses a 2–3 digit cleanliness code that classifies particulate contamination in a fluid by the number of particles larger than 4 µm and 6 µm per millilitre. Although largely superseded by{' '}
            <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889</Link>{' '}
            in modern applications, ISO 4406 remains an important industry standard and is fundamental for understanding the history of hydraulic fluid cleanliness classification. Many older pieces of equipment still specify their cleanliness requirements using ISO 4406 codes. The particulate contamination this standard quantifies is the primary cause of{' '}
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
        <p>SEMANTIC_DOMAINS: Contamination Control Systems [PRIMARY]</p>
        <p>SYSTEMS_AFFECTED: lube, hydraulic, fuel, transmission</p>
        <p>CONCEPT_TAXONOMY: type=standard | domain=contamination-measurement | standards=ISO-4406, ISO-16889</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406, ASTM D7085</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE, NANOFORCE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/iso-4406</p>
        <p>&nbsp;&nbsp;concept_id: iso-4406-cleanliness-codes</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </RetrievalBlock>
    </main>
  );
}
