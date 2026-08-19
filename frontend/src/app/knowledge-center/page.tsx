'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const KNOWLEDGE_SECTIONS = [
  {
    id: 'standards',
    index: '01',
    title: 'Industrial Standards',
    description: 'Measurement frameworks, cleanliness codes and filtration test standards used to support technical decisions.',
    href: '/knowledge-center/standards',
    label: 'ISO / TEST METHODS',
  },
  {
    id: 'problems',
    index: '02',
    title: 'Contamination & Failure Modes',
    description: 'Root-cause knowledge for particle wear, water contamination, restriction, degradation and system failure mechanisms.',
    href: '/knowledge-center/problems',
    label: 'DIAGNOSTICS / ROOT CAUSE',
  },
  {
    id: 'technologies',
    index: '03',
    title: 'Protection Technologies',
    description: 'ELIMFILTERS technology architectures organized by contamination domain, protection objective and operating environment.',
    href: '/knowledge-center/technologies',
    label: 'FILTRATION ENGINEERING',
  },
  {
    id: 'systems',
    index: '04',
    title: 'Asset Protection Systems',
    description: 'Technical relationships between air intake, fuel, lubrication, hydraulic and cooling systems across critical equipment.',
    href: '/knowledge-center/systems',
    label: 'SYSTEM ARCHITECTURE',
  },
  {
    id: 'fleet',
    index: '05',
    title: 'Fleet Optimization',
    description: 'Reliability, service-life and total-cost strategies for fleets, maintenance organizations and critical assets.',
    href: '/knowledge-center/fleet-optimization',
    label: 'RELIABILITY / TCO',
  },
  {
    id: 'glossary',
    index: '06',
    title: 'Technical Glossary',
    description: 'Consistent terminology for filtration, contamination control, maintenance, reliability and asset protection.',
    href: '/knowledge-center/glossary',
    label: 'ENGINEERING REFERENCE',
  },
];

const DECISION_PATH = [
  ['01', 'Identify the operating condition'],
  ['02', 'Define the contamination or failure mode'],
  ['03', 'Reference the applicable technical framework'],
  ['04', 'Select the protection strategy'],
  ['05', 'Validate the product application'],
];

function TechnicalFlowGraphic() {
  return (
    <div
      aria-label="Technical contamination control process diagram"
      style={{
        position: 'relative',
        minHeight: '330px',
        border: '1px solid rgba(255,255,255,0.09)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.008))',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.35,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '34px 34px',
      }} />

      <div style={{ position: 'relative', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.12em', color: '#FFF12D' }}>
            CONTAMINATION CONTROL LOGIC
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.32)' }}>
            TECHNICAL REFERENCE
          </span>
        </div>

        <svg viewBox="0 0 620 220" role="img" aria-hidden="true" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="signalLine" x1="0" x2="1">
              <stop offset="0%" stopColor="#FFF12D" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFF12D" stopOpacity="1" />
            </linearGradient>
          </defs>
          <line x1="52" y1="110" x2="568" y2="110" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
          <path d="M52 110 C140 110 150 64 230 64 C310 64 312 156 398 156 C474 156 488 110 568 110" fill="none" stroke="url(#signalLine)" strokeWidth="3" />
          {[52, 230, 398, 568].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={i === 1 ? 64 : i === 2 ? 156 : 110} r="9" fill="#050505" stroke="#FFF12D" strokeWidth="2" />
              <circle cx={x} cy={i === 1 ? 64 : i === 2 ? 156 : 110} r="3" fill="#FFF12D" />
            </g>
          ))}
          <text x="36" y="145" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="JetBrains Mono, monospace">SOURCE</text>
          <text x="190" y="43" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="JetBrains Mono, monospace">MEASURE</text>
          <text x="360" y="190" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="JetBrains Mono, monospace">CONTROL</text>
          <text x="522" y="145" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="JetBrains Mono, monospace">VERIFY</text>
        </svg>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '0.6rem',
          marginTop: '0.5rem',
        }}>
          {[
            ['INPUT', 'Operating conditions'],
            ['CONTROL', 'Protection strategy'],
            ['OUTPUT', 'Reliability decision'],
          ].map(([label, value]) => (
            <div key={label} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.65rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFF12D', fontSize: '0.55rem', letterSpacing: '0.1em', margin: '0 0 0.3rem' }}>{label}</p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', lineHeight: 1.45, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeCenterPage() {
  return (
    <>
      <Navigation />
      <main style={{ background: '#030303', color: '#fff', minHeight: '100vh' }}>
        <section style={{
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'radial-gradient(circle at 15% 0%, rgba(255,241,45,0.08), transparent 34%), #030303',
          padding: 'clamp(5.5rem, 10vw, 8.5rem) clamp(1.25rem, 5vw, 4rem) clamp(4rem, 7vw, 6rem)',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(340px, 0.8fr)', gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.72rem',
                letterSpacing: '0.17em',
                textTransform: 'uppercase',
                color: '#FFF12D',
                margin: '0 0 1.25rem',
                fontWeight: 600,
              }}>
                ELIMFILTERS / TECHNICAL KNOWLEDGE CENTER
              </p>

              <h1 style={{
                fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2.7rem, 5.4vw, 5rem)',
                textTransform: 'uppercase',
                letterSpacing: '-0.025em',
                lineHeight: 0.98,
                margin: '0 0 1.7rem',
                maxWidth: '780px',
              }}>
                Engineering knowledge for better asset decisions.
              </h1>

              <p style={{
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: 'clamp(1.02rem, 1.7vw, 1.22rem)',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.68)',
                maxWidth: '720px',
                margin: '0 0 2rem',
              }}>
                Technical references for filtration, contamination control, equipment reliability and industrial asset protection — structured for engineers, maintenance leaders, fleet managers and technical decision-makers.
              </p>

              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <Link href="/knowledge-center/standards" style={{
                  background: '#FFF12D',
                  color: '#050505',
                  textDecoration: 'none',
                  fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '0.76rem',
                  padding: '0.95rem 1.25rem',
                  textTransform: 'uppercase',
                }}>
                  Browse technical references
                </Link>
                <Link href="/knowledge-center/problems" style={{
                  border: '1px solid rgba(255,255,255,0.16)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '0.76rem',
                  padding: '0.95rem 1.25rem',
                  textTransform: 'uppercase',
                }}>
                  Diagnose a problem
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.12 }}>
              <TechnicalFlowGraphic />
            </motion.div>
          </div>
        </section>

        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '1.2rem clamp(1.25rem, 5vw, 4rem)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '1rem 2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)' }}>REFERENCE DOMAINS</span>
            {['AIR INTAKE', 'FUEL', 'LUBRICATION', 'HYDRAULICS', 'COOLING', 'RELIABILITY'].map((item) => (
              <span key={item} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.62)' }}>{item}</span>
            ))}
          </div>
        </section>

        <section style={{ padding: 'clamp(4rem, 7vw, 6rem) clamp(1.25rem, 5vw, 4rem)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.65fr) minmax(0, 1.35fr)', gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'end', marginBottom: '2.2rem' }}>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.14em', color: '#FFF12D', margin: '0 0 0.8rem' }}>KNOWLEDGE ARCHITECTURE</p>
                <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: 'clamp(2rem, 3.4vw, 3.1rem)', lineHeight: 1.05, textTransform: 'uppercase', margin: 0 }}>Start with the technical question.</h2>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0, maxWidth: '720px' }}>
                The Knowledge Center is organized around the way technical teams investigate problems: identify the condition, understand the mechanism, reference the standard, select the protection approach and validate the application.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', borderTop: '1px solid rgba(255,255,255,0.09)', borderLeft: '1px solid rgba(255,255,255,0.09)' }}>
              {KNOWLEDGE_SECTIONS.map((section, idx) => (
                <motion.div key={section.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.35, delay: idx * 0.04 }}>
                  <Link href={section.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                    <article style={{
                      minHeight: '255px',
                      height: '100%',
                      padding: '1.7rem',
                      borderRight: '1px solid rgba(255,255,255,0.09)',
                      borderBottom: '1px solid rgba(255,255,255,0.09)',
                      background: '#050505',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'background 180ms ease, border-color 180ms ease',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D' }}>{section.index}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.54rem', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.28)', textAlign: 'right' }}>{section.label}</span>
                      </div>
                      <h3 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: '1.35rem', lineHeight: 1.15, margin: '1.8rem 0 0.8rem', color: '#fff' }}>{section.title}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.56)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{section.description}</p>
                      <div style={{ marginTop: 'auto', paddingTop: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <span style={{ width: '28px', height: '1px', background: '#FFF12D', display: 'inline-block' }} />
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.08em', color: '#FFF12D' }}>OPEN REFERENCE</span>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: 'clamp(4rem, 7vw, 6rem) clamp(1.25rem, 5vw, 4rem)', background: '#070707', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 1.2fr)', gap: 'clamp(2rem, 6vw, 6rem)' }}>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.14em', color: '#FFF12D', margin: '0 0 0.8rem' }}>DECISION PATH</p>
              <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: 'clamp(2rem, 3.2vw, 3rem)', textTransform: 'uppercase', lineHeight: 1.06, margin: '0 0 1.2rem' }}>From operating condition to protection strategy.</h2>
              <p style={{ color: 'rgba(255,255,255,0.52)', lineHeight: 1.7, maxWidth: '520px', margin: 0 }}>
                Technical content should reduce ambiguity, not add to it. Each reference is intended to support a clear chain of reasoning from field condition to engineering action.
              </p>
            </div>

            <div>
              {DECISION_PATH.map(([step, text], i) => (
                <div key={step} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: '1rem', padding: '1rem 0', borderTop: i === 0 ? '1px solid rgba(255,255,255,0.09)' : 'none', borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFF12D', fontSize: '0.7rem' }}>{step}</span>
                  <span style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', color: 'rgba(255,255,255,0.82)', fontSize: '1rem' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: 'clamp(3.5rem, 6vw, 5rem) clamp(1.25rem, 5vw, 4rem)', background: 'rgba(255,241,45,0.03)', borderTop: '1px solid rgba(255,241,45,0.1)', borderBottom: '1px solid rgba(255,241,45,0.1)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: '2rem', color: 'rgba(255,255,255,0.85)' }}>Related Resources</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5 }}>
                <Link href="/systems/" style={{
                  display: 'block',
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,241,45,0.2)',
                  textDecoration: 'none',
                  color: '#fff',
                  borderRadius: '2px',
                  height: '100%',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Barlow, Arial, sans-serif', fontSize: '1rem' }}>Protection Systems</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Barlow, Arial, sans-serif' }}>
                    Asset protection architecture
                  </div>
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: 0.1 }}>
                <Link href="/industries/" style={{
                  display: 'block',
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,241,45,0.2)',
                  textDecoration: 'none',
                  color: '#fff',
                  borderRadius: '2px',
                  height: '100%',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Barlow, Arial, sans-serif', fontSize: '1rem' }}>Industries</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Barlow, Arial, sans-serif' }}>
                    Application-specific protection
                  </div>
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Link href="/families/" style={{
                  display: 'block',
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,241,45,0.2)',
                  textDecoration: 'none',
                  color: '#fff',
                  borderRadius: '2px',
                  height: '100%',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Barlow, Arial, sans-serif', fontSize: '1rem' }}>Product Families</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Barlow, Arial, sans-serif' }}>
                    Filter systems by duty class
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <section style={{ padding: 'clamp(4rem, 7vw, 5.5rem) clamp(1.25rem, 5vw, 4rem)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '2rem', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.12em', color: '#FFF12D', margin: '0 0 0.7rem' }}>APPLICATION INTELLIGENCE</p>
              <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: 'clamp(1.7rem, 2.8vw, 2.5rem)', textTransform: 'uppercase', margin: '0 0 0.6rem' }}>Connect technical knowledge to the correct application.</h2>
              <p style={{ color: 'rgba(255,255,255,0.52)', lineHeight: 1.65, margin: 0, maxWidth: '760px' }}>Use product intelligence after the operating condition, system and protection requirement are understood.</p>
            </div>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={{ background: '#FFF12D', color: '#050505', textDecoration: 'none', fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.75rem', padding: '1rem 1.25rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Search Product Intelligence
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://elimfilters.com/knowledge-center/#collection',
          name: 'ELIMFILTERS Technical Knowledge Center',
          description: 'Technical references for industrial filtration, contamination control, reliability and asset protection.',
          url: 'https://elimfilters.com/knowledge-center/',
          isPartOf: { '@id': 'https://elimfilters.com/#website' },
          publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        })}
      </script>
    </>
  );
}
