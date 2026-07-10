'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const displayFont = 'Chakra Petch, Arial Narrow, monospace';
const bodyFont = 'Barlow, Arial, sans-serif';

const SECTIONS = [
  {
    title: 'Industries: Contamination Profiles by Sector',
    description:
      'Every industry has a specific contamination profile, asset exposure pattern, and protection requirement. Mining, agriculture, marine, power generation, and fleet operations each demand calibrated contamination-control strategies.',
    href: '/knowledge-system/standards',
  },
  {
    title: 'Assets: What Is at Risk',
    description:
      'Engines, hydraulic circuits, fuel systems, bearings, compressors, cooling circuits, and air intake systems degrade through measurable contamination mechanisms. Asset failure follows predictable pathways, not random events.',
    href: '/knowledge-system/science',
  },
  {
    title: 'Problems: Contamination and Failure Mechanisms',
    description:
      'Particle contamination, water ingress, varnish formation, silica ingestion, corrosion, and thermal degradation create the root conditions that damage industrial equipment and reduce operational reliability.',
    href: '/knowledge-system/contamination',
  },
  {
    title: 'Protection Systems and Technologies',
    description:
      'Protection systems connect contamination targets with engineered filtration technologies. Selection must be based on the contamination mechanism, operating duty cycle, and applicable validation standard.',
    href: '/knowledge-system/compare',
  },
  {
    title: 'Fleet Optimization Through Contamination Control',
    description:
      'Operational continuity, extended service intervals, lower total cost of ownership, and fewer unplanned failures come from systematic contamination control, not simple product substitution.',
    href: '/knowledge-system/fleet',
  },
];

const VERIFIED_REFERENCES = [
  {
    stat: 'ISO 4406',
    label: 'Hydraulic fluid cleanliness is classified using solid-particle contamination codes.',
    source: 'ISO 4406:2021',
  },
  {
    stat: 'ISO 16889',
    label: 'Hydraulic filter element performance is evaluated through multi-pass testing.',
    source: 'ISO 16889 Multi-Pass Test',
  },
  {
    stat: 'B10(c) >= 200',
    label: 'Beta 200 corresponds to approximately 99.5% efficiency at the rated particle size.',
    source: 'Beta Ratio Formula',
  },
  {
    stat: 'Particle Control',
    label: 'Cleaner hydraulic fluid reduces abrasive wear, valve sticking, pump damage, and reliability loss.',
    source: 'Hydraulic Contamination Control',
  },
];

const FAQS = [
  {
    q: 'What is an ISO cleanliness code?',
    a: 'An ISO cleanliness code under ISO 4406 classifies the level of solid-particle contamination in hydraulic or lubricating fluids. Lower codes indicate cleaner fluid and lower particle exposure for sensitive components.',
  },
  {
    q: 'What is Beta ratio in filtration?',
    a: 'Beta ratio compares upstream and downstream particle counts at a specified particle size. A beta ratio of 200 means approximately 99.5% efficiency at the rated size under the test condition.',
  },
  {
    q: 'Why does contamination control matter for fleets?',
    a: 'Fleet reliability depends on controlling particle ingress, water contamination, oil degradation, and system bypass events before they become wear, failure, downtime, and asset loss.',
  },
];

export default function KnowledgeSystemPage() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Industrial Asset Protection Knowledge System',
    description:
      'Knowledge system for industrial asset protection, contamination control, filtration standards, protection systems, technologies, and fleet reliability.',
    url: 'https://elimfilters.com/knowledge-system/',
    publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap');`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <Link href="/" style={homeButton}>HOME</Link>

      <section style={heroSection}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 2rem', width: '100%' }}
        >
          <h1 style={heroTitle}>
            Industrial Asset
            <br />
            <span style={{ color: '#FFF12D' }}>Protection Knowledge</span>
          </h1>

          <p style={heroLead}>
            Industrial assets fail when contamination is not measured, monitored, and controlled. This knowledge system organizes contamination mechanisms, engineering standards, protection systems, technologies, and operational strategies into a technical reference platform.
          </p>
        </motion.div>
      </section>

      <section style={introSection}>
        <div style={twoCol}>
          <h2 style={sectionTitle}>From contamination risk to asset protection decisions.</h2>
          <div>
            <p style={leadText}>
              The ELIMFILTERS Knowledge System is structured around a simple operating sequence: understand the industry, identify the asset at risk, define the contamination problem, apply the correct protection system, and connect the result to operational continuity.
            </p>
            <p style={bodyText}>
              Every section is designed to support distributors, engineers, fleets, maintenance teams, and AI retrieval systems with technical information that can be navigated by standard, system, contamination mode, technology, or industry.
            </p>
          </div>
        </div>
      </section>

      <section style={referenceSection}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Verified technical anchors.</h2>
          <div style={statsGrid}>
            {VERIFIED_REFERENCES.map((item) => (
              <div key={item.stat} style={statCard}>
                <strong style={statValue}>{item.stat}</strong>
                <p style={statLabel}>{item.label}</p>
                <span style={statSource}>{item.source}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={cardsSection}>
        <div style={cardsGrid}>
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.href}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <Link href={section.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.42)', y: -3 }}
                  transition={{ duration: 0.2 }}
                  style={sectionCard}
                >
                  <h2 style={cardTitle}>{section.title}</h2>
                  <p style={cardBody}>{section.description}</p>
                  <span style={explore}>OPEN REFERENCE</span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={faqSection}>
        <div style={wrapNarrow}>
          <h2 style={sectionTitle}>Technical questions.</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            {FAQS.map((faq) => (
              <div key={faq.q} style={faqCard}>
                <h3 style={faqTitle}>{faq.q}</h3>
                <p style={faqBody}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Asset Protection Systems | Contamination Control Systems</p>
        <p>STANDARD_REFERENCES: ISO 4406, ISO 16889, ISO 5011, ASTM D6304, ISO 8573-1</p>
        <p>VERIFIED_METRICS: ISO 4406 cleanliness coding; ISO 16889 multi-pass testing; Beta ratio efficiency formula</p>
        <p>source_uri: elimfilters.com/knowledge-system</p>
      </RetrievalBlock>
    </main>
  );
}

const homeButton: React.CSSProperties = {
  position: 'fixed',
  top: '1.1rem',
  right: '1.35rem',
  zIndex: 9999,
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
};

const heroSection: React.CSSProperties = {
  minHeight: '88vh',
  display: 'flex',
  alignItems: 'center',
  background:
    'linear-gradient(180deg, rgba(255,241,45,0.07) 0%, rgba(0,0,0,0) 45%), radial-gradient(circle at top right, rgba(255,241,45,0.16), transparent 34%)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const heroTitle: React.CSSProperties = {
  fontFamily: displayFont,
  fontWeight: 700,
  letterSpacing: '-0.055em',
  lineHeight: 0.88,
  fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
  maxWidth: '1120px',
  margin: 0,
  textTransform: 'uppercase',
};

const heroLead: React.CSSProperties = {
  marginTop: '2rem',
  maxWidth: '820px',
  color: 'rgba(255,255,255,0.78)',
  fontSize: 'clamp(1rem, 1.6vw, 1.28rem)',
  lineHeight: 1.75,
  fontWeight: 600,
  borderLeft: '3px solid #FFF12D',
  paddingLeft: '1.4rem',
};

const introSection: React.CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const twoCol: React.CSSProperties = {
  maxWidth: '1180px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
  gap: 'clamp(2rem, 6vw, 5rem)',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: displayFont,
  fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: 0.95,
  letterSpacing: '-0.035em',
  margin: 0,
  textTransform: 'uppercase',
  fontWeight: 700,
};

const leadText: React.CSSProperties = {
  color: 'rgba(255,255,255,0.8)',
  fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)',
  lineHeight: 1.72,
  fontWeight: 600,
  margin: 0,
};

const bodyText: React.CSSProperties = {
  color: 'rgba(255,255,255,0.58)',
  fontSize: '1rem',
  lineHeight: 1.78,
  marginTop: '1.2rem',
};

const referenceSection: React.CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  background: 'rgba(255,255,255,0.018)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const wrap: React.CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const wrapNarrow: React.CSSProperties = { maxWidth: '900px', margin: '0 auto' };

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: '1rem',
  marginTop: '2.4rem',
};

const statCard: React.CSSProperties = {
  background: 'rgba(0,0,0,0.55)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '1.35rem',
  minHeight: '210px',
};

const statValue: React.CSSProperties = {
  display: 'block',
  fontFamily: displayFont,
  color: '#FFF12D',
  fontSize: 'clamp(1.1rem, 2vw, 1.55rem)',
  lineHeight: 1.05,
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
};

const statLabel: React.CSSProperties = {
  color: 'rgba(255,255,255,0.68)',
  fontSize: '0.95rem',
  lineHeight: 1.62,
  marginTop: '1rem',
};

const statSource: React.CSSProperties = {
  display: 'block',
  color: 'rgba(255,255,255,0.38)',
  fontFamily: displayFont,
  fontSize: '0.72rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginTop: '1rem',
};

const cardsSection: React.CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: 'clamp(4rem, 8vw, 7rem) 2rem',
};

const cardsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
  gap: '1.4rem',
};

const sectionCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '2rem',
  minHeight: '360px',
  cursor: 'pointer',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const cardTitle: React.CSSProperties = {
  fontFamily: displayFont,
  fontSize: 'clamp(1.35rem, 2.4vw, 2rem)',
  fontWeight: 700,
  color: '#fff',
  letterSpacing: '-0.035em',
  lineHeight: 1.02,
  textTransform: 'uppercase',
  margin: 0,
};

const cardBody: React.CSSProperties = {
  fontFamily: bodyFont,
  fontSize: '0.96rem',
  color: 'rgba(255,255,255,0.62)',
  lineHeight: 1.65,
  marginTop: '1.35rem',
};

const explore: React.CSSProperties = {
  color: '#FFF12D',
  fontFamily: displayFont,
  fontWeight: 700,
  letterSpacing: '0.16em',
  fontSize: '0.72rem',
  marginTop: 'auto',
  textTransform: 'uppercase',
};

const faqSection: React.CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) 2rem',
  background: 'rgba(255,241,45,0.025)',
  borderTop: '1px solid rgba(255,255,255,0.06)',
};

const faqCard: React.CSSProperties = {
  background: 'rgba(0,0,0,0.55)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '1.55rem 1.8rem',
};

const faqTitle: React.CSSProperties = {
  fontFamily: displayFont,
  color: '#fff',
  fontSize: '1.05rem',
  lineHeight: 1.2,
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
};

const faqBody: React.CSSProperties = {
  fontFamily: bodyFont,
  color: 'rgba(255,255,255,0.62)',
  fontSize: '0.95rem',
  lineHeight: 1.75,
  margin: '0.9rem 0 0',
};
