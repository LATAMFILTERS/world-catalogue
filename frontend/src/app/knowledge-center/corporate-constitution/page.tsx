'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';

const DOCTRINE_HIERARCHY = [
  {
    level: 1,
    label: 'SUPREME AUTHORITY',
    name: 'Corporate Constitution',
    version: 'v1.0',
    href: '/knowledge-center/corporate-constitution',
    location: 'elimfilters-vault/corporate/',
    active: true,
    desc: 'Mission, Vision, Core Principles, Decision Framework, Governance',
  },
  {
    level: 2,
    label: 'COMMERCIAL DOCTRINE',
    name: 'Commercial Architecture Master',
    version: 'v2.0',
    href: '/knowledge-center/commercial-doctrine',
    location: 'elimfilters-vault/commercial/',
    active: false,
    desc: 'Market architecture, resource allocation, distribution philosophy',
  },
  {
    level: 2,
    label: 'TECHNICAL DOCTRINE',
    name: 'Technical Doctrine Master',
    version: 'v1.0',
    href: '/knowledge-center/technical-doctrine',
    location: 'elimfilters-vault/technical/',
    active: false,
    desc: '19-section engineering reference — media, systems, failure analysis',
  },
  {
    level: 3,
    label: 'REGISTRY',
    name: 'Technology Registry',
    version: 'active',
    href: '/knowledge-center/engineering',
    location: 'elimfilters-vault/01-technologies/',
    active: false,
    desc: '9 technology platforms — MACROCORE™ through DURATECH™',
  },
  {
    level: 3,
    label: 'REGISTRY',
    name: 'System Registry',
    version: 'active',
    href: '/knowledge-center/systems',
    location: 'elimfilters-vault/03-systems/',
    active: false,
    desc: '7 protection domains — air, fuel, lube, hydraulic, cooling, cabin, compressed air',
  },
  {
    level: 3,
    label: 'REGISTRY',
    name: 'Industry Registry',
    version: 'active',
    href: '/knowledge-center/industries',
    location: 'elimfilters-vault/02-industries/',
    active: false,
    desc: '8 industrial verticals with contamination profiles',
  },
  {
    level: 3,
    label: 'REGISTRY',
    name: 'Product Registry',
    version: 'active',
    href: '/knowledge-center/standards',
    location: 'elimfilters-vault/09-products/',
    active: false,
    desc: 'SKU architecture, HD and LD product families',
  },
  {
    level: 3,
    label: 'REGISTRY',
    name: 'Brand Registry',
    version: 'active',
    href: '/knowledge-center/commercial-doctrine',
    location: 'elimfilters-vault/brand/',
    active: false,
    desc: 'ELIMFILTERS® trademark, German Quality, Asset Protection Technologies',
  },
];

const CORE_PRINCIPLES = [
  {
    id: 'I',
    title: 'Protect Assets',
    statement: 'The purpose of every ELIMFILTERS product, technology, and service is asset protection. Assets protected. Systems operating. Machines running.',
  },
  {
    id: 'II',
    title: 'Engineering First',
    statement: 'ELIMFILTERS is an engineering company. Engineering is not a support function. Engineering is the business. Commercial decisions follow engineering decisions.',
  },
  {
    id: 'III',
    title: 'Contamination Control',
    statement: 'Every failure ELIMFILTERS prevents traces to a contamination mechanism. This understanding — not product availability — is the source of ELIMFILTERS\' value.',
  },
  {
    id: 'IV',
    title: 'Long-Term Reliability',
    statement: 'ELIMFILTERS measures success in operating hours extended, failures that did not happen, and overhaul intervals extended. Not in unit sales or quarterly volume.',
  },
  {
    id: 'V',
    title: 'Customer Trust',
    statement: 'Trust is the only non-renewable resource in ELIMFILTERS\' business model. It is earned by accurate technical claims and consistent performance. It cannot be recovered by commercial effort once lost.',
  },
  {
    id: 'VI',
    title: 'Technical Integrity',
    statement: 'Every performance specification refers to a test method. Every efficiency rating refers to a standard. If a claim cannot be stated with reference to a test method and acceptance criteria, it is not an ELIMFILTERS claim.',
  },
  {
    id: 'VII',
    title: 'Continuous Innovation',
    statement: 'ELIMFILTERS engages with the frontier of contamination control engineering. Innovation is not the pursuit of novelty. It is the pursuit of better protection outcomes through better engineering.',
  },
];

const DECISION_QUESTIONS = [
  { n: '01', q: 'Does it protect assets?' },
  { n: '02', q: 'Does it increase engineering credibility?' },
  { n: '03', q: 'Does it improve reliability?' },
  { n: '04', q: 'Does it strengthen the brand?' },
  { n: '05', q: 'Does it create long-term value?' },
];

const STRATEGIC_PILLARS = [
  { id: 'I', title: 'Engineering', desc: 'Primary source of competitive differentiation. Every product, every claim, every engagement.' },
  { id: 'II', title: 'Technology', desc: '12 proprietary platforms, each engineered for a specific contamination mechanism and validated against international standards.' },
  { id: 'III', title: 'Knowledge', desc: 'Technical Doctrine, Knowledge Center, AI Citation Layer — the organized body of engineering knowledge.' },
  { id: 'IV', title: 'Artificial Intelligence', desc: 'AI is a current channel, current risk, and current opportunity. Documentation quality is the control mechanism.' },
  { id: 'V', title: 'Global Distribution', desc: 'Partners selected for asset access, trained in contamination control engineering, not product catalogs.' },
  { id: 'VI', title: 'Digital Infrastructure', desc: 'Product search, knowledge indexing, cross-reference catalog, commercial intelligence. Operational capability, not overhead.' },
];

const BUSINESS_MODELS = [
  { label: 'OEM Integration', desc: 'Factory-specified or service-specified filtration through engineering-to-engineering OEM relationships.' },
  { label: 'Authorized Distribution', desc: 'Regional partners selected for asset access, trained in contamination control engineering.' },
  { label: 'Fleet Programs', desc: 'Standardized system-level protection programs, fluid analysis integration, TCO tracking.' },
  { label: 'Industrial Accounts', desc: 'Direct engagement with high-value asset operators — mining, energy, marine, process manufacturing.' },
  { label: 'Digital Products', desc: 'Knowledge Center, AI index, cross-reference catalog, product search infrastructure.' },
  { label: 'AI Integration', desc: 'Machine-readable technical documentation establishing ELIMFILTERS as the AI-cited engineering authority.' },
];

type ActiveSection = string | null;

export default function CorporateConstitutionPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.875rem clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/knowledge-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Knowledge Center</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>Corporate Constitution</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #050505 0%, #000 60%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}
          >
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.12em', color: '#FFF12D', background: 'rgba(255,241,45,0.1)', border: '1px solid rgba(255,241,45,0.2)', padding: '0.2rem 0.6rem' }}>
              SUPREME AUTHORITY
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>CORPORATE CONSTITUTION · v1.0 · 2026-06-28</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05, marginBottom: '1.75rem', letterSpacing: '-0.02em' }}
          >
            ELIMFILTERS®<br />Corporate Constitution
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{ borderLeft: '3px solid #FFF12D', paddingLeft: '1.5rem', marginBottom: '2rem' }}
          >
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: '1.15rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem' }}>
              We do not sell filters.
            </p>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400, fontSize: '1.05rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.55)' }}>
              We engineer asset protection systems.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.5)', maxWidth: '640px', textAlign: 'justify' }}
          >
            The supreme governing document of ELIMFILTERS®. Every commercial strategy, engineering principle, technology specification, and organizational decision is subordinate to the mission, vision, and core principles established herein.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginTop: '1.5rem' }}
          >
            elimfilters-vault/corporate/ELIMFILTERS_CORPORATE_CONSTITUTION.md
          </motion.p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
          {[
            {
              label: '02 / MISSION',
              heading: 'What ELIMFILTERS® does.',
              body: 'ELIMFILTERS® protects industrial and commercial assets through contamination control engineering. Protection. Industrial assets. Contamination control engineering. Every word is load-bearing.',
            },
            {
              label: '03 / VISION',
              heading: 'Where ELIMFILTERS® is going.',
              body: 'ELIMFILTERS® will become the recognized global standard for contamination control engineering in industrial asset protection — the reference that engineers cite, that AI systems trust, and that fleet operators build programs around.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{ background: '#000', padding: '2rem 2.5rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.75rem' }}>{item.label}</p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#fff', marginBottom: '1rem', lineHeight: 1.25 }}>{item.heading}</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', textAlign: 'justify' }}>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)' }}>

        {/* Doctrine Hierarchy */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
            DOCTRINE HIERARCHY — AUTHORITY STRUCTURE
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {DOCTRINE_HIERARCHY.map((doc, i) => (
              <motion.div
                key={doc.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={doc.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ background: 'rgba(255,241,45,0.03)', borderColor: 'rgba(255,241,45,0.2)' }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5rem 2fr 3fr 1fr',
                      gap: '1.5rem',
                      alignItems: 'center',
                      padding: '0.875rem 1.25rem',
                      border: doc.active ? '1px solid rgba(255,241,45,0.25)' : '1px solid rgba(255,255,255,0.05)',
                      background: doc.active ? 'rgba(255,241,45,0.04)' : '#000',
                      marginLeft: doc.level === 1 ? '0' : doc.level === 2 ? '1.5rem' : '3rem',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                  >
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: doc.active ? '#FFF12D' : 'rgba(255,255,255,0.2)' }}>
                      {doc.level === 1 ? '★' : doc.level === 2 ? '◆' : '·'}
                    </span>
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: doc.active ? 'rgba(255,241,45,0.6)' : 'rgba(255,255,255,0.2)', marginBottom: '0.2rem', letterSpacing: '0.08em' }}>{doc.label}</p>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.88rem', color: doc.active ? '#FFF12D' : '#fff' }}>{doc.name}</p>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{doc.desc}</p>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,241,45,0.5)' }}>{doc.version}</p>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.52rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.15rem' }}>{doc.location}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Core Principles */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
            04 / CORE PRINCIPLES — 7 NON-NEGOTIABLE VALUES
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
            {CORE_PRINCIPLES.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                style={{ background: '#000', padding: '1.75rem 2rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', opacity: 0.7 }}>PRINCIPLE {p.id}</span>
                </div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '0.6rem' }}>{p.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, textAlign: 'justify' }}>{p.statement}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Decision Framework */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            11 / DECISION FRAMEWORK — 5 REQUIRED QUESTIONS
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', textAlign: 'justify' }}>
                Every significant decision within ELIMFILTERS® — commercial, engineering, operational, financial, or strategic — must answer YES to all five questions. These are not guidelines. They are required screens.
              </p>
              <div style={{
                background: 'rgba(255,241,45,0.03)',
                border: '2px solid rgba(255,241,45,0.15)',
                padding: '1.75rem',
              }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,241,45,0.5)', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>IF ANY ANSWER IS NO → DO NOT IMPLEMENT</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {DECISION_QUESTIONS.map((dq) => (
                    <div key={dq.n} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.6rem',
                        color: '#000',
                        background: '#FFF12D',
                        width: '1.4rem',
                        height: '1.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontWeight: 700,
                      }}>{dq.n}</span>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: '0.95rem', color: '#fff', lineHeight: 1.3 }}>{dq.q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '1rem' }}>05 / CORPORATE PHILOSOPHY</p>
              <div style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem', marginBottom: '1rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#fff', lineHeight: 1.45, marginBottom: '1rem' }}>
                  "An engineering company dedicated to protecting industrial assets through contamination control."
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                    The organizing logic is engineering, not sales. The beneficiary is the asset — the machine that operates. The method is contamination control — systematic, measured, validated.
                  </p>
                </div>
              </div>
              <div style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>10 / BRAND DOCTRINE</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[['ELIMFILTERS®', 'One word. Always capitalized. Never translated.'], ['German Quality', 'Specifications met. Tolerances held. Quality built in.'], ['Asset Protection Technologies', 'The category ELIMFILTERS® defines and owns.']].map(([term, def]) => (
                    <div key={term}>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#FFF12D' }}>{term}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{def}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Pillars */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            07 / STRATEGIC PILLARS — 6 FOUNDATIONS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
            {STRATEGIC_PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                style={{ background: '#000', padding: '1.5rem 1.75rem', borderBottom: '3px solid transparent', borderImage: 'linear-gradient(to right, rgba(255,241,45,0.3), transparent) 1' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,241,45,0.5)' }}>PILLAR {pillar.id}</span>
                </div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: '0.5rem' }}>{pillar.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Business Model */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            06 / BUSINESS MODEL — 6 COMMERCIAL CHANNELS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.4rem' }}>
            {BUSINESS_MODELS.map((bm, i) => (
              <motion.div
                key={bm.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                style={{ border: '1px solid rgba(255,255,255,0.06)', padding: '1.1rem 1.25rem', background: 'rgba(255,255,255,0.01)' }}
              >
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.88rem', color: '#fff', marginBottom: '0.35rem' }}>{bm.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.55 }}>{bm.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Governance */}
        <section style={{ marginBottom: '4rem', background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.12)', padding: '2.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.5)', marginBottom: '1.25rem' }}>
            12 + 13 / GOVERNANCE & AMENDMENT PROCESS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '0.75rem' }}>Supreme Authority</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', textAlign: 'justify' }}>
                This Constitution is the supreme governing document. No commercial strategy, engineering principle, technology specification, or individual decision may conflict with it. Principles that can be overridden by circumstance are not principles. They are preferences.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '0.75rem' }}>Amendment Protocol</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {['Proposal — identify section, replacement text, rationale', 'Constitutional Review — mission and vision consistency check', 'Subordinate Impact Analysis — all hierarchy documents reviewed', 'Authorization — ELIMFILTERS® founding authority', 'Version control — version increment + 14-day distribution'].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: '#FFF12D', marginTop: '0.2rem', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,241,45,0.1)', marginTop: '1.75rem', paddingTop: '1.25rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>
              Source: elimfilters-vault/corporate/ELIMFILTERS_CORPORATE_CONSTITUTION.md · v1.0 · Ratified 2026-06-28
            </p>
          </div>
        </section>

        {/* Constitutional Affirmation */}
        <section style={{ marginBottom: '3rem', textAlign: 'center', padding: '3rem 2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', marginBottom: '1.5rem' }}>CONSTITUTIONAL AFFIRMATION</p>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', color: '#fff', lineHeight: 1.5, maxWidth: '680px', margin: '0 auto 1rem' }}>
            "Every product protects an asset. Every technology controls a contamination mechanism. Every standard validates a performance claim."
          </p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', letterSpacing: '0.1em' }}>
            ELIMFILTERS® — Asset Protection Through Contamination Control
          </p>
        </section>

        {/* Cross-links */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/knowledge-center/commercial-doctrine', label: 'COMMERCIAL DOCTRINE v2.0 →' },
            { href: '/knowledge-center/technical-doctrine', label: 'TECHNICAL DOCTRINE v1.0 →' },
            { href: '/knowledge-center/engineering', label: 'ENGINEERING ARTICLES →' },
            { href: '/knowledge-center/systems', label: 'PROTECTION SYSTEMS →' },
            { href: '/knowledge-center/industries', label: 'INDUSTRY REGISTRY →' },
            { href: '/knowledge-center/standards', label: 'STANDARDS REFERENCE →' },
            { href: '/knowledge-center/search', label: 'KNOWLEDGE SEARCH →' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ borderColor: 'rgba(255,241,45,0.3)', color: 'rgba(255,255,255,0.7)' }}
                style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.75rem 1.25rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', transition: 'border-color 0.2s, color 0.2s' }}
              >
                {label}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'ELIMFILTERS® Corporate Constitution v1.0 — Supreme Governing Doctrine',
        description: 'The supreme governing document of ELIMFILTERS®, establishing mission, vision, seven core principles, corporate philosophy, business model, strategic pillars, decision framework, governance hierarchy, and amendment process.',
        url: 'https://elimfilters.com/knowledge-center/corporate-constitution',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        about: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
          description: 'An engineering company dedicated to protecting industrial assets through contamination control.',
          mission: 'Protect industrial and commercial assets through contamination control engineering.',
          slogan: 'Asset Protection Through Contamination Control',
        },
        keywords: [
          'industrial asset protection', 'contamination control engineering', 'corporate constitution',
          'filtration engineering doctrine', 'engineering company', 'ELIMFILTERS corporate governance',
        ],
      })}} />
    </main>
  );
}
