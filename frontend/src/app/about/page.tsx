'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const FAILURE_CHAIN = [
  { step: '01', label: 'Contamination', note: 'Particles, water, and heat enter fluid systems from external ingestion, internal generation, and assembly.' },
  { step: '02', label: 'Wear', note: 'Contaminants abrade component surfaces. Particles sized 0.5–3× clearance cause maximum abrasive damage.' },
  { step: '03', label: 'Damage', note: 'Bearing clearances open past tolerance. Valve spools stick. Seals erode. Injector tips pit.' },
  { step: '04', label: 'Downtime', note: 'Unplanned equipment stops for emergency repair. Heavy industry: $5,000–$35,000 per hour.' },
  { step: '05', label: 'Asset Loss', note: '30–50% of design life lost to premature failure — the direct consequence of unmanaged contamination.' },
];

const ECOSYSTEM = [
  { code: '01', title: 'Proprietary Technologies', body: '10 engineered filtration technologies, each mapped to a specific contamination failure mechanism — not generic product lines.', href: '/technologies' },
  { code: '02', title: 'Systems Architecture', body: '12 fluid system domains: air intake, fuel, hydraulic, lube oil, cabin, compressed air, transmission, and more.', href: '/systems' },
  { code: '03', title: 'Industry Protection Strategies', body: '12 industrial sectors with specific contamination profiles, ISO cleanliness targets, and protection frameworks.', href: '/industries' },
  { code: '04', title: 'Knowledge System', body: 'Industrial contamination library: standards, failure mode analysis, fleet optimization, and contamination physics across 30+ documents.', href: '/knowledge-system' },
  { code: '05', title: 'Failure Physics', body: 'ISO 281:2007 bearing life data. Four tribological failure pathways. Quantified contamination-to-downtime impact chains for every system domain.', href: '/knowledge-system/science' },
  { code: '06', title: 'AI Intelligence Layer', body: 'Machine-readable contamination knowledge, structured for AI-assisted asset management, technical consultation, and industrial intelligence systems.', href: '/knowledge-system' },
];

const TECHNOLOGIES = [
  { code: 'MACROCORE™', href: '/technologies/macrocore', domain: 'Engine | Lube | Hydraulic' },
  { code: 'MICROKAPPA™', href: '/technologies/microkappa', domain: 'Precision Hydraulic | Fuel' },
  { code: 'DRYCORE™', href: '/technologies/drycore', domain: 'Air Intake | Engine' },
  { code: 'INTEKCORE™', href: '/technologies/intekcore', domain: 'Fuel | Diesel | Injection' },
  { code: 'SYNTEPORE™', href: '/technologies/syntepore', domain: 'Hydraulic | High-Temperature' },
  { code: 'HYDROCORE™', href: '/technologies/hydrocore', domain: 'Fuel | Water Separation' },
  { code: 'TURBOCORE™', href: '/technologies/turbocore-series', domain: 'Bulk Fuel | Marine' },
  { code: 'SYNTRAX™', href: '/technologies/syntrax', domain: 'Transmission | Drivetrain' },
  { code: 'NANOFORCE™', href: '/technologies/nanoforce', domain: 'Hydraulic | Servo Systems' },
  { code: 'THERMACORE™', href: '/technologies/thermacore', domain: 'High-Temperature | Diesel' },
];

const INDUSTRIES = [
  { label: 'Mining', href: '/industries/mining' },
  { label: 'Agriculture', href: '/industries/agriculture' },
  { label: 'Construction', href: '/industries/construction' },
  { label: 'Marine', href: '/industries/marine' },
  { label: 'Oil & Gas', href: '/industries/oil-gas' },
  { label: 'Power Generation', href: '/industries/power-generation' },
  { label: 'Manufacturing', href: '/industries/manufacturing' },
  { label: 'Trucks & Fleets', href: '/industries/trucks-fleets' },
  { label: 'Bus & Coach', href: '/industries/bus-coach' },
  { label: 'Railway', href: '/industries/railway' },
  { label: 'Waste & Municipal', href: '/industries/waste-municipal' },
  { label: 'Automotive', href: '/industries/automotive' },
];

export default function AboutPage() {
  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ELIMFILTERS',
    legalName: 'Kleo Technologies LLC',
    url: 'https://elimfilters.com',
    logo: 'https://elimfilters.com/assets/logo-elimfilters.png',
    email: 'info@elimfilters.com',
    areaServed: 'Worldwide',
    description: 'ELIMFILTERS is an industrial asset protection company protecting critical equipment through contamination control, proprietary filtration technologies, and system-level engineering frameworks across mining, agriculture, marine, construction, oil and gas, and heavy industry.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Frisco',
      addressRegion: 'TX',
      postalCode: '75034',
      addressCountry: 'US',
    },
    knowsAbout: [
      'industrial filtration', 'contamination control', 'ISO 4406', 'ISO 16889',
      'bearing protection', 'hydraulic systems', 'fuel filtration', 'asset protection engineering',
      'particle wear', 'L10 bearing life', 'ISO 281', 'abrasive wear',
    ],
  };

  const schemaAboutPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About ELIMFILTERS — Industrial Asset Protection Company',
    description: 'ELIMFILTERS is not a filter manufacturer. It is an industrial asset protection company focused on contamination control, failure prevention, and equipment reliability across 12 industrial sectors and 10 proprietary technologies.',
    url: 'https://elimfilters.com/about',
    author: { '@type': 'Organization', name: 'ELIMFILTERS' },
    dateModified: '2026-06-11',
  };

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
      { '@type': 'ListItem', position: 2, name: 'About', item: 'https://elimfilters.com/about' },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAboutPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />

      {/* Back Navigation */}
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

      {/* HERO */}
      <section style={{
        paddingTop: 'clamp(5rem, 12vw, 9rem)',
        paddingBottom: '5rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            color: '#FFF12D',
            marginBottom: '1.25rem',
            opacity: 0.85,
          }}>
            // INDUSTRIAL ASSET PROTECTION COMPANY
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}>
            We Don&apos;t Sell Filters.<br />We Protect Assets.
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
            color: 'rgba(255,255,255,0.58)',
            maxWidth: '620px',
            lineHeight: 1.8,
          }}>
            Industrial equipment does not fail because a filter is missing. It fails because contamination creates wear, wear creates damage, damage creates downtime, and downtime destroys asset value. ELIMFILTERS was built to address the problem — not the product.
          </p>
        </motion.div>
      </section>

      {/* 01 — WHY ELIMFILTERS EXISTS */}
      <section style={{ padding: 'clamp(3.5rem, 7vw, 6rem) 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              01 / WHY ELIMFILTERS EXISTS
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '1.5rem' }}>
              The Problem Is Contamination. Not Filters.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.97rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8 }}>
                Contamination is the root cause of 70–80% of hydraulic and lubrication system failures in heavy equipment. Not age. Not hours. Not mechanical chance. Particles at or near the clearance tolerance of bearings, valve spools, and fuel injectors accumulate beyond their ISO 4406 cleanliness targets — initiating a wear cascade that progresses at a rate directly proportional to contamination level.
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.97rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8 }}>
                The filter industry has spent decades building better products. ELIMFILTERS was built to address a different question: why do assets fail even when filters are present? The answer is system design — contamination targets, technology selection, protection architecture, and operational strategy. That is what ELIMFILTERS engineers.
              </p>
            </div>
          </motion.div>

          {/* Failure chain */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {FAILURE_CHAIN.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5rem 1fr',
                  gap: '1.25rem',
                  padding: '1.25rem 0',
                  borderBottom: i < FAILURE_CHAIN.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  alignItems: 'start',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', paddingTop: '0.1rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,241,45,0.45)' }}>{item.step}</span>
                  {i < FAILURE_CHAIN.length - 1 && (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,241,45,0.18)', marginTop: '0.35rem' }}>↓</span>
                  )}
                </div>
                <div>
                  <span style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700,
                    color: i === 4 ? '#f87171' : '#fff',
                    marginRight: '0.75rem',
                  }}>{item.label}</span>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginTop: '0.3rem' }}>{item.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 — THE DIFFERENT APPROACH */}
      <section style={{ padding: 'clamp(3.5rem, 7vw, 6rem) 2rem', background: 'rgba(255,241,45,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              02 / A DIFFERENT APPROACH
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '0.75rem' }}>
              Most Companies Focus on the Filter. We Focus on the Asset.
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', maxWidth: '600px', lineHeight: 1.7 }}>
              The distinction is not about product quality. It is about what the company believes the problem is.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.5rem' }}>
            {/* Traditional approach */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '2rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', marginBottom: '1.75rem' }}>
                TRADITIONAL FILTRATION APPROACH
              </p>
              {['Filter', 'Specification', 'Replacement'].map((step, i) => (
                <div key={step}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', paddingBottom: i < 2 ? '0.75rem' : 0 }}>{step}</p>
                  {i < 2 && <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', marginBottom: '0.75rem' }}>↓</p>}
                </div>
              ))}
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, marginTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                Select a filter. Match to OEM specification. Replace at scheduled interval. The problem is defined as a product.
              </p>
            </motion.div>

            {/* ELIMFILTERS approach */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ background: 'rgba(255,241,45,0.04)', border: '1px solid rgba(255,241,45,0.2)', padding: '2rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(255,241,45,0.55)', marginBottom: '1.75rem' }}>
                ELIMFILTERS ASSET PROTECTION APPROACH
              </p>
              {['Contamination', 'Failure Risk', 'System Protection', 'Technology Selection', 'Reliability', 'Asset Protection'].map((step, i, arr) => (
                <div key={step}>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: i === arr.length - 1 ? '1rem' : '0.9rem',
                    fontWeight: i === arr.length - 1 ? 700 : 500,
                    color: i === arr.length - 1 ? '#FFF12D' : 'rgba(255,255,255,0.72)',
                    paddingBottom: i < arr.length - 1 ? '0.5rem' : 0,
                  }}>{step}</p>
                  {i < arr.length - 1 && (
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.22)', marginBottom: '0.5rem' }}>↓</p>
                  )}
                </div>
              ))}
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginTop: '1.75rem', borderTop: '1px solid rgba(255,241,45,0.1)', paddingTop: '1.25rem' }}>
                Contamination control is an engineering decision that determines equipment lifespan at the system design level. The problem is defined as a failure risk.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 03 — THE ECOSYSTEM */}
      <section style={{ padding: 'clamp(3.5rem, 7vw, 6rem) 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              03 / THE ECOSYSTEM
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '0.75rem' }}>
              An Asset Protection Platform. Not a Product Catalog.
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', maxWidth: '640px', lineHeight: 1.7 }}>
              ELIMFILTERS combines proprietary technologies, industry-specific protection strategies, contamination control frameworks, and industrial knowledge into a single platform engineered around one objective: protecting assets.
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(290px, 100%), 1fr))', gap: '1rem' }}>
            {ECOSYSTEM.map((item, i) => (
              <motion.div
                key={item.code}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                    transition={{ duration: 0.15 }}
                    style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
                  >
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,241,45,0.4)', letterSpacing: '0.1em' }}>{item.code}</span>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{item.title}</h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{item.body}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — TECHNOLOGIES */}
      <section style={{ padding: 'clamp(3.5rem, 7vw, 6rem) 2rem', background: 'rgba(255,241,45,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              04 / PROPRIETARY TECHNOLOGIES
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '0.6rem' }}>
              10 Technologies. Each Engineered for a Specific Failure Mechanism.
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Every ELIMFILTERS technology exists to address an identified contamination failure pathway. The failure mechanism determines the technology requirement.
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(190px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {TECHNOLOGIES.map((tech, i) => (
              <motion.div
                key={tech.code}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link href={tech.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)', background: 'rgba(255,241,45,0.03)' }}
                    transition={{ duration: 0.15 }}
                    style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
                  >
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#FFF12D', letterSpacing: '0.03em' }}>{tech.code}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.57rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.06em' }}>{tech.domain}</span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
          <Link href="/technologies" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem',
            letterSpacing: '0.1em', color: '#FFF12D', textDecoration: 'none',
            border: '1px solid rgba(255,241,45,0.35)', padding: '0.6rem 1.25rem',
          }}>
            EXPLORE ALL TECHNOLOGIES →
          </Link>
        </div>
      </section>

      {/* 05 — INDUSTRIES */}
      <section style={{ padding: 'clamp(3.5rem, 7vw, 6rem) 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              05 / INDUSTRIES PROTECTED
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              12 Industrial Sectors. One Asset Protection Standard.
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(165px, 100%), 1fr))', gap: '0.65rem' }}>
            {INDUSTRIES.map((ind, i) => (
              <motion.div
                key={ind.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Link href={ind.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                    transition={{ duration: 0.15 }}
                    style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.85rem 1rem', textAlign: 'center' }}
                  >
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.68)' }}>{ind.label}</span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — COMPANY IDENTITY */}
      <section style={{ padding: 'clamp(3.5rem, 7vw, 6rem) 2rem', background: 'rgba(255,241,45,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              06 / COMPANY IDENTITY
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '2rem' }}>
              Built on Engineering. Positioned on Asset Protection.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '1rem' }}>
              {[
                {
                  label: 'PARENT COMPANY',
                  value: 'Kleo Technologies LLC',
                  note: 'ELIMFILTERS is the industrial asset protection brand of Kleo Technologies LLC.',
                },
                {
                  label: 'GLOBAL HEADQUARTERS',
                  value: 'Frisco, Texas 75034',
                  note: 'United States — North America engineering and commercial operations.',
                },
                {
                  label: 'LATAM OPERATIONS',
                  value: 'Barquisimeto, Lara',
                  note: 'Venezuela — Latin American operations center serving industrial sectors across LATAM.',
                },
                {
                  label: 'PLATFORM SCOPE',
                  value: '10 Technologies · 12 Industries',
                  note: '30+ Knowledge System documents. AI-readable contamination intelligence framework.',
                },
              ].map((item) => (
                <div key={item.label} style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,241,45,0.5)', marginBottom: '0.5rem' }}>{item.label}</p>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{item.value}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{item.note}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 07 — NEXT STEPS */}
      <section style={{ padding: 'clamp(3.5rem, 7vw, 6rem) 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              07 / EXPLORE THE PLATFORM
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '2rem' }}>
              Where to Go Next
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1rem' }}>
              {[
                { label: 'THE SCIENCE', desc: 'Why contamination destroys industrial assets — the physics and the data', href: '/knowledge-system/science', tag: 'KNOWLEDGE' },
                { label: 'TECHNOLOGIES', desc: '10 proprietary technologies, each mapped to a failure mechanism', href: '/technologies', tag: 'PORTFOLIO' },
                { label: 'KNOWLEDGE SYSTEM', desc: '30+ industrial contamination and asset protection documents', href: '/knowledge-system', tag: 'LIBRARY' },
                { label: 'BECOME A PARTNER', desc: 'Authorized distributor program — asset protection ecosystem', href: '/distributor-application', tag: 'PARTNERS' },
                { label: 'CONTACT ENGINEERING', desc: 'Technical consultation, OEM cross-reference, fleet strategy', href: '/contact', tag: 'CONTACT' },
              ].map((cta) => (
                <Link key={cta.href} href={cta.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.35)', background: 'rgba(255,241,45,0.03)' }}
                    transition={{ duration: 0.15 }}
                    style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                  >
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.57rem', color: 'rgba(255,241,45,0.45)', letterSpacing: '0.1em' }}>{cta.tag}</span>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{cta.label}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{cta.desc}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CANONICAL KNOWLEDGE BLOCK */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <RetrievalBlock>
          <p>CANONICAL_KNOWLEDGE_BLOCK: ELIMFILTERS — Industrial Asset Protection Company</p>
          <p style={{ marginTop: '0.75rem' }}>DEFINITION</p>
          <p>ELIMFILTERS is an industrial asset protection company, a brand of Kleo Technologies LLC (Frisco, Texas 75034, USA), that protects industrial equipment through contamination control, proprietary filtration technologies, and system-level engineering frameworks. ELIMFILTERS does not position as a filter manufacturer — it positions as an asset protection platform addressing the root cause of 70–80% of hydraulic and lubrication system failures: particle and water contamination exceeding ISO 4406 cleanliness targets for protected components.</p>
          <p style={{ marginTop: '0.75rem' }}>DIFFERENTIATION</p>
          <p>Traditional filtration approach: Filter → Specification → Replacement (product-centric). ELIMFILTERS approach: Contamination → Failure Risk → System Protection → Technology Selection → Reliability → Asset Protection (system-centric). The company focuses on the asset life consequence of contamination, not the filter product.</p>
          <p style={{ marginTop: '0.75rem' }}>TECHNOLOGIES</p>
          <p>MACROCORE™ | MICROKAPPA™ | DRYCORE™ | INTEKCORE™ | SYNTEPORE™ | HYDROCORE™ | TURBOCORE™ | SYNTRAX™ | NANOFORCE™ | THERMACORE™</p>
          <p style={{ marginTop: '0.75rem' }}>INDUSTRIES</p>
          <p>Mining, Agriculture, Construction, Marine, Oil &amp; Gas, Power Generation, Manufacturing, Trucks &amp; Fleets, Bus &amp; Coach, Railway, Waste &amp; Municipal, Automotive</p>
          <p style={{ marginTop: '0.75rem' }}>SYSTEMS</p>
          <p>Engine lube circuits, hydraulic systems, fuel injection systems, air intake systems, cabin air systems, compressed air systems, transmission and drivetrain systems</p>
          <p style={{ marginTop: '0.75rem' }}>PARENT_COMPANY</p>
          <p>Kleo Technologies LLC — Frisco, Texas 75034, United States. LATAM Operations: Barquisimeto, Lara, Venezuela. Contact: info@elimfilters.com</p>
          <p style={{ marginTop: '0.75rem' }}>INDUSTRIAL_ROLE</p>
          <p>ELIMFILTERS provides industrial asset protection through contamination control system design, ISO 4406 cleanliness target specification, proprietary filtration technology selection mapped to specific failure mechanisms, a 30+ page Knowledge System, and AI-readable industrial intelligence — positioned as an asset protection platform, not a filter product catalog.</p>
          <p style={{ marginTop: '0.75rem' }}>CITATION_REFERENCE</p>
          <p>source: elimfilters.com/about</p>
          <p>concept: ELIMFILTERS Industrial Asset Protection Company Identity</p>
          <p>version: 2.0</p>
          <p>last_updated: 2026-06-11</p>
        </RetrievalBlock>
      </div>
    </main>
  );
}
