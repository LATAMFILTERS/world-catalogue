'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

// Change 3 — sections reordered and relabelled to match Knowledge Foundation ontology
const SECTIONS = [
  {
    title: 'Industries — Contamination Profiles and Asset Contexts by Sector',
    slug: 'standards',
    domain: '01 · Industries',
    description: 'Every industry has a specific contamination profile, a defined set of assets at risk, and applicable protection standards. Mining, agriculture, marine, power generation — each sector faces distinct contamination threats that require calibrated protection strategies.',
    icon: '⬡',
    href: '/knowledge-system/standards',
  },
  {
    title: 'Assets — What Is at Risk and How Industrial Assets Degrade',
    slug: 'science',
    domain: '02 · Assets',
    description: 'Industrial assets — engines, hydraulic systems, fuel circuits, bearings, compressors — degrade through measurable contamination mechanisms. Asset failure is not random. It follows predictable degradation pathways defined by contamination type, concentration, and exposure duration.',
    icon: '🔬',
    href: '/knowledge-system/science',
  },
  {
    title: 'Problems — Contamination, Failure Mechanisms and Root Causes',
    slug: 'contamination',
    domain: '03 · Problems & Failure Mechanisms',
    description: 'Particle contamination causes 70–80% of hydraulic system failures (NFPA). Root failure mechanisms: abrasive wear from hard particles, water contamination of fuel injectors, varnish formation in hydraulic oil, and silica ingestion in air intake systems.',
    icon: '⚠',
    href: '/knowledge-system/contamination',
  },
  {
    title: 'Protection Systems and Technologies — Engineering the Defence',
    slug: 'compare',
    domain: '04 · Protection Systems & Technologies',
    description: 'Five protection systems address the contamination threats identified: Air Intake & Airflow, Fuel Cleanliness, Lubrication, Hydraulic, and Cooling. Twelve technologies implement these systems. Selection is based on contamination target and measurable ISO standard — not product brand.',
    icon: '⚖',
    href: '/knowledge-system/compare',
  },
  {
    title: 'Fleet Optimisation — Operational Continuity Through Contamination Control',
    slug: 'fleet',
    domain: '05 · Fleet Optimisation',
    description: 'Operational outcomes — reduced downtime, extended service intervals, lower total cost of ownership — result from systematic contamination control, not product substitution. Fleet optimisation begins with contamination targets, not filter selection.',
    icon: '🚛',
    href: '/knowledge-system/fleet',
  },
];

const STATS = [
  {
    stat: '70–80%',
    label: 'of hydraulic system failures are caused by particle contamination',
    source: 'National Fluid Power Association (NFPA)',
  },
  {
    stat: '$260K/hr',
    label: 'average cost of unplanned downtime in heavy industry',
    source: 'Siemens Industrial Study, 2023',
  },
  {
    stat: '3–5×',
    label: 'bearing life extension from ISO 18/16/13 → 14/12/10 cleanliness target',
    source: 'ISO 4406 / Engineering studies',
  },
  {
    stat: 'β₁₀ ≥ 200',
    label: '99.5% capture efficiency at 10 microns — hydraulic system standard per ISO 16889',
    source: 'ISO 16889 Multi-Pass Test',
  },
];

const FAQS = [
  {
    q: 'What is an ISO cleanliness code and how do you read it?',
    a: 'An ISO cleanliness code (ISO 4406) is a three-number expression of particle concentration in a fluid sample — for example, 16/14/11. Each number represents the count of particles per millilitre at three size thresholds: ≥4 microns, ≥6 microns, and ≥14 microns. ISO scale code 16 means 320–640 particles/mL; lower numbers indicate cleaner fluid. Hydraulic systems in mining typically require 16/14/11 or cleaner; precision servo systems require 14/12/9 or better.',
  },
  {
    q: 'What causes industrial hydraulic filters to fail prematurely?',
    a: 'Hydraulic filters fail prematurely through three main mechanisms: (1) particle overloading — when fluid contamination exceeds the filter\'s dirt-holding capacity, causing premature differential pressure rise and bypass; (2) incorrect Beta ratio specification — a β₁₀ = 10 filter captures only 90% of 10-micron particles, allowing continued contamination ingression; and (3) water contamination — free water accelerates filter media degradation and promotes microbial growth in the element. Undersized elements and incorrect bypass valve settings are secondary causes.',
  },
  {
    q: 'What is the difference between OEM and aftermarket industrial filters?',
    a: 'OEM filters are manufactured to the original equipment specification and ensure warranty compliance. Aftermarket filters may replicate OEM dimensions and thread patterns but vary in filtration media quality, Beta ratio performance, collapse pressure rating, and bypass valve threshold. The key evaluation criteria are not brand affiliation but contamination control specifications: Beta ratio (ISO 16889), rated collapse pressure, and bypass valve cracking pressure. A correctly specified aftermarket filter can meet or exceed OEM contamination control performance.',
  },
  {
    q: 'What is Beta ratio in filtration and how is it calculated?',
    a: 'Beta ratio (β) measures filter efficiency at a specific particle size: β_x = upstream particle count ÷ downstream particle count, for particles ≥x microns (ISO 16889 multi-pass test). A β₁₀ = 200 filter captures 200 upstream particles for every 1 that passes — 99.5% efficiency. A β₁₀ = 10 filter captures only 90%. Beta ratio is the primary engineering criterion for hydraulic and lube oil filter selection because it directly correlates to the contamination cleanliness level maintained in the system under steady-state conditions.',
  },
  {
    q: 'How does contamination cause gear and bearing failures?',
    a: 'Hard particles (silica, metallic oxides, wear debris) in lubricating oil create abrasive wear between bearing surfaces. When particle size approaches the hydrodynamic oil film thickness (0.1–1.0 microns for precision bearings), particles become trapped between moving surfaces and cause micro-cutting. Cumulative micro-cutting reduces bearing clearance, increases friction, generates heat, and leads to fatigue spalling or seizure. Achieving ISO 14/12/10 cleanliness instead of 18/16/13 can extend bearing L10 life by 3–5×.',
  },
  {
    q: 'What ISO standards apply to industrial filtration?',
    a: 'Core standards: ISO 4406 (fluid cleanliness codes for hydraulic and lube systems), ISO 16889 (multi-pass filter test), ISO 5011 (air filter test for combustion engines), ISO 8573-1 (compressed air purity classes), ISO 11155 (cabin air filtration), and ISO 23015 (coalescing separators for water-in-fuel). For fuel systems: ASTM D6304 (Karl Fischer water content) and SAE J1488 (free and emulsified water separation). For coolant: ASTM D3306 and ASTM D6210.',
  },
  {
    q: 'How do you reduce fleet downtime through filtration?',
    a: 'Fleet downtime reduction through filtration follows three steps: (1) identify contamination targets — measure current fluid cleanliness codes (ISO 4406) and compare to OEM specification targets per equipment type; (2) select filtration technologies that achieve and maintain those targets under operating conditions, accounting for ingression rates and service intervals; (3) implement condition-based maintenance — use oil analysis and differential pressure monitoring to replace filters on performance, not calendar intervals. This approach extends equipment service intervals 30–50% and reduces unplanned failures.',
  },
  {
    q: 'What is the most common cause of diesel injector failure?',
    a: 'Common Rail direct injection (CRDI) injectors fail primarily from particle contamination and water ingression in diesel fuel. CRDI injectors operate with clearances below 1 micron and fuel pressures of 1,600–2,500 bar — at these tolerances, 4-micron particles cause abrasive wear of injector nozzle tips and needle seats. Water in diesel accelerates corrosion of precision injector components and promotes microbial contamination. Control standards are ASTM D6304 (fuel water content) and SAE J1488 (water separation efficiency), with injector protection requiring a 4-micron absolute fuel filter barrier.',
  },
];

export default function KnowledgeSystemPage() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Industrial Asset Protection Knowledge System',
    description: 'Knowledge system for industrial asset protection: industries, assets at risk, contamination problems, protection systems and technologies, fleet optimisation, and operational outcomes — structured for engineers, reliability teams, and fleet managers.',
    url: 'https://elimfilters.com/knowledge-system/',
    publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
    dateModified: '2026-06-11',
    hasPart: [
      { '@type': 'WebPage', name: 'Industrial Filtration Standards', url: 'https://elimfilters.com/knowledge-system/standards/' },
      { '@type': 'WebPage', name: 'Contamination & Failure Modes', url: 'https://elimfilters.com/knowledge-system/contamination/' },
      { '@type': 'WebPage', name: 'The Physics of Industrial Failure', url: 'https://elimfilters.com/knowledge-system/science/' },
      { '@type': 'WebPage', name: 'OEM vs Aftermarket', url: 'https://elimfilters.com/knowledge-system/compare/' },
      { '@type': 'WebPage', name: 'Fleet Optimization', url: 'https://elimfilters.com/knowledge-system/fleet/' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Back */}
      <Link href="/"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← HOME</Link>

      {/* Hero */}
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
          style={{ maxWidth: '760px', margin: '0 auto', padding: '0 2rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem', letterSpacing: '0.18em',
            color: '#FFF12D', marginBottom: '1rem', opacity: 0.85,
          }}>
            // KNOWLEDGE SYSTEM
          </p>
          {/* Change 1 */}
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em',
            lineHeight: 1.15, marginBottom: '1rem',
          }}>
            Industrial Asset Protection Knowledge System
          </h1>
          {/* Change 2 */}
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.06em',
            marginBottom: '1.75rem',
            lineHeight: 1.8,
          }}>
            Industries · Assets · Problems · Systems · Technologies · Products<br />
            <span style={{ color: 'rgba(255,241,45,0.6)' }}>One objective: protect industrial assets through contamination control.</span>
          </p>
          {/* Direct Answer Block */}
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.75)',
            maxWidth: '660px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.75,
            textAlign: 'left',
            borderLeft: '3px solid #FFF12D',
            paddingLeft: '1.25rem',
          }}>
            Industrial assets fail when contamination is not measured, monitored, and controlled. This knowledge system documents the contamination mechanisms, engineering standards (ISO 4406, ISO 16889, ASTM D6304), and operational strategies that determine whether industrial equipment runs reliably or fails prematurely.
          </p>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '0.08em',
          }}>
            Technical content by the ELIMFILTERS Engineering Team ·{' '}
            <time dateTime="2026-05-25">Updated May 2026</time>
          </p>
        </motion.div>
      </section>

      {/* Statistics + Narrative */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.02) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ maxWidth: '900px', margin: '0 auto' }}
        >
          {/* Change 5 — Asset Protection Knowledge label */}
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.18em',
            color: '#FFF12D',
            opacity: 0.6,
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            // Asset Protection Knowledge
          </p>
          {/* Change 4 — updated narrative with ontology hierarchy */}
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            marginBottom: '2.5rem',
          }}>
            The ELIMFILTERS Knowledge System is structured around the asset protection ontology: industry context defines which{' '}
            <Link href="/knowledge-system/science" style={{ color: '#FFF12D', textDecoration: 'underline' }}>
              assets are at risk
            </Link>
            , assets define the contamination problems that threaten them, problems define the protection systems and technologies required, and technologies are deployed through products to achieve{' '}
            <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>
              operational continuity
            </Link>
            . Every section of this knowledge system follows that hierarchy from industry to operational outcome.
          </p>

          {/* Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}>
            {STATS.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,241,45,0.04)',
                border: '1px solid rgba(255,241,45,0.12)',
                borderRadius: '6px',
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{
                  fontSize: '1.5rem', fontWeight: 800,
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: '#FFF12D', marginBottom: '0.5rem',
                }}>
                  {item.stat}
                </div>
                <p style={{
                  fontSize: '0.83rem', color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'Inter, sans-serif', lineHeight: 1.5, margin: '0 0 0.5rem',
                }}>
                  {item.label}
                </p>
                <p style={{
                  fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)',
                  fontFamily: 'JetBrains Mono, monospace', margin: '0',
                }}>
                  {item.source}
                </p>
              </div>
            ))}
          </div>

          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.75rem',
            color: 'rgba(255,241,45,0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            // Information Architecture: Industries → Assets → Problems → Protection Systems → Technologies → Products → Operational Outcomes
          </p>
        </motion.div>
      </section>

      {/* Knowledge Sections */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
          gap: '1.75rem',
        }}>
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.slug}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={section.href} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.4)', y: -3 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '2rem',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.2rem',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px',
                    border: '1px solid rgba(255,241,45,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFF12D', fontSize: '1rem', flexShrink: 0,
                  }}>
                    {section.icon}
                  </div>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.58rem', letterSpacing: '0.13em',
                    color: 'rgba(255,241,45,0.45)', textTransform: 'uppercase',
                  }}>
                    {section.domain}
                  </span>
                  <h2 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.05rem', fontWeight: 600,
                    color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.4,
                    marginTop: '-0.5rem',
                  }}>
                    {section.title}
                  </h2>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.65, marginTop: 'auto',
                  }}>
                    {section.description}
                  </p>
                  <div style={{
                    fontSize: '0.7rem', color: 'rgba(255,241,45,0.4)',
                    fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em',
                  }}>
                    EXPLORE →
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '5rem 2rem', background: 'rgba(255,241,45,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem' }}
          >
            <span style={{
              display: 'block', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.25em', color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem',
            }}>
              // FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800,
              fontFamily: 'Space Grotesk, sans-serif', color: '#fff', margin: '0 0 0.75rem',
            }}>
              Industrial Filtration — Technical Questions
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', margin: '0' }}>
              Common questions from engineers and procurement teams working with industrial filtration systems.
            </p>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '6px',
                  padding: '1.75rem 2rem',
                }}
              >
                <h3 style={{
                  fontSize: '0.975rem', fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif', color: '#fff',
                  margin: '0 0 0.875rem', lineHeight: 1.5,
                }}>
                  {faq.q}
                </h3>
                <p style={{
                  fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'Inter, sans-serif', lineHeight: 1.85, margin: '0',
                }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Retrieval Summary Block */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Asset Protection Systems [PRIMARY] | Contamination Control Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: engine, hydraulic, fuel, lube, air_intake, cabin, compressed_air</p>
        <p>CONCEPT_TAXONOMY: type=hub | domain=knowledge-system | scope=all-systems</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>KEY_STATISTICS:</p>
        <p>&nbsp;&nbsp;70-80% of hydraulic failures caused by particle contamination (NFPA)</p>
        <p>&nbsp;&nbsp;$260,000/hr average heavy industry downtime cost (Siemens, 2023)</p>
        <p>&nbsp;&nbsp;3-5x bearing life extension from ISO 18/16/13 to 14/12/10 (ISO 4406)</p>
        <p>&nbsp;&nbsp;Beta ratio b10 ≥ 200 = 99.5% efficiency at 10 microns (ISO 16889)</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406, ISO 5011, ASTM D6304, ISO 8573-1</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear, /knowledge-system/contamination/diesel-water</p>
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE, NANOFORCE, DURATECH, HYDROCORE, DRYCORE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime, /knowledge-system/fleet/total-cost-ownership</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system</p>
        <p>&nbsp;&nbsp;concept_id: knowledge-system-hub</p>
        <p>&nbsp;&nbsp;version: 1.1</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-25</p>
      </RetrievalBlock>
    </main>
  );
}
