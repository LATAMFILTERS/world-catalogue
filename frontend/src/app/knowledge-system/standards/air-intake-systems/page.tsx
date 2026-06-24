'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const STANDARDS = [
  { code: 'SAE J1539', desc: 'Diesel engine air intake contamination classification defining maximum allowable dust concentration in combustion air to preserve engine efficiency and bearing life.' },
  { code: 'ISO 5011', href: '/knowledge-system/standards/iso-5011', desc: 'Filter element integrity testing covering element collapse and bypass verification procedures ensuring air filtration performance meets rated efficiency claims.' },
  { code: 'ANSI B132.1', desc: 'Industrial air filter standard providing test methods for dust holding capacity and pressure drop characteristics of element media.' },
];

const TECHNOLOGIES = [
  { name: 'MACROCORE', slug: 'macrocore', role: 'Progressive density gradient air filtration achieving 99.98% efficiency with extended service life capacity for high-dust agricultural and mining environments.' },
];

const CHALLENGE_IMPACTS = [
  { metric: '-3 - 5%', label: 'Volumetric efficiency loss per 25 mbar air intake restriction increase' },
  { metric: '+6 - 10%', label: 'Fuel consumption increase when operating at maximum filter restriction' },
  { metric: '2000 - 5000 hrs', label: 'Service life reduction for combustion engines if air quality above SAE J1539 limits' },
];

const FAQS = [
  {
    q: 'What is the relationship between air filter restriction and engine volumetric efficiency?',
    a: 'Engine volumetric efficiency decreases as air intake pressure drop increases above the clean-element baseline. A typical diesel engine experiences approximately 1% volumetric efficiency loss for every 25 mbar increase in air intake restriction. At 200 mbar restriction (a partially loaded filter), volumetric efficiency drops by 8% compared to a clean element. The engine management system compensates for reduced air mass flow by increasing fuel quantity to maintain power output, directly increasing specific fuel consumption by 6 to 10%.',
  },
  {
    q: 'How does dust contamination exceed SAE J1539 limits without visible air filter loading?',
    a: 'SAE J1539 defines contamination limits based on particle count concentration, not visible filter element saturation. A filter element can remain visually half-loaded while allowing excessive particle concentration to pass into the combustion chamber if the element efficiency drops. The filter restriction indicator measures pressure drop, which does not directly correlate with particle concentration - a clogged element measuring high restriction may actually be protecting the engine better than a partially loaded element measuring low restriction but with compromised efficiency.',
  },
  {
    q: 'What is the correct service interval for air filters in high-dust environments?',
    a: 'Service intervals in high-dust environments should be determined by measured air intake restriction using a differential pressure indicator rather than fixed hour or calendar intervals. A 100-hour fixed interval may result in both premature service (element capacity remaining) and late service (restriction exceeding maximum). ISO 5011 specifies that element collapse pressure is the absolute service limit - operating above this pressure point causes unfiltered air bypass directly into the engine. Service should occur at the first restriction alarm activation, typically at 375 mbar differential pressure for heavy equipment applications.',
  },
  {
    q: 'How do pre-cleaners and cyclonic separators reduce primary filter loading?',
    a: 'Pre-cleaners operate by centrifugal separation or impact inertial technology. Cyclonic designs use engine intake air velocity to create a vortex where heavy particles (sand, soil) drop to the bottom while filtered air proceeds to the primary element. Effective pre-cleaners remove 40 to 80% of dust load by mass before it reaches the primary filter, extending primary element service life 2 to 3 times. In arid and dusty environments (construction, mining, agriculture), pre-cleaners become economically justified if combined with condition-based service interval decisions using restriction indicators.',
  },
];

const RELATED_SYSTEMS = [
  { code: 'LUBE', title: 'Lube / Oil Systems', href: '/knowledge-system/standards/lube-oil-systems' },
  { code: 'FUEL', title: 'Fuel Systems', href: '/knowledge-system/standards/fuel-systems' },
  { code: 'HYD', title: 'Hydraulic Systems', href: '/knowledge-system/standards/hydraulic-systems' },
];

export default function AirIntakeSystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-system/standards" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← STANDARDS</Link>

      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)', paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
            letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '1rem', opacity: 0.85,
          }}>// INDUSTRIAL STANDARDS · AIR INTAKE SYSTEMS</p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem',
          }}>Air Intake Filtration Systems</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Engine air intake filtration protecting combustion air quality against dust, pollen, and soil particles that degrade volumetric efficiency, increase fuel consumption, and accelerate internal wear in high-contamination industrial environments.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>01 / SYSTEM OVERVIEW</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Engine Air Intake Filtration Domain</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1rem' }}>
            Air intake filters remove dust and particles from engine combustion air before the air reaches fuel injection and ignition. A diesel engine operating in agricultural harvest conditions may encounter dust concentrations exceeding 2,000 mg/m³ - requiring filtration to reduce inlet concentration to below 1 mg/m³ for acceptable combustion chamber cleanliness. Air intake filtration is one domain within the broader <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration systems framework</Link> that governs contamination control across all mobile equipment fluid circuits.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            Unlike oil and fuel filters that see continuous recirculation, air filters experience single-pass flow where contamination cannot be removed by return filtration. Filter efficiency must be maintained throughout the service interval, and bypass of unfiltered air directly contaminates combustion air and accelerates internal engine wear exponentially.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>02 / CONTAMINATION CHALLENGES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Dust and Particle Ingestion Pathways</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { title: 'Atmospheric Dust Load', desc: 'High-dust environments (agriculture, mining, construction) contain 100+ mg/m³ ambient dust. Standard air filters achieve 99.5% efficiency; the remaining 0.5% of 100 mg/m³ represents 500 micrograms passing per cubic meter of processed air.' },
              { title: 'Filter Efficiency Degradation', desc: 'As filter media accumulates dust, efficiency typically increases slightly until the element becomes heavily loaded. However, a loaded element approaching bypass point allows unfiltered air bypass directly into the engine if pressure differential exceeds collapse threshold.' },
              { title: 'Bypass Valve Leakage', desc: 'Air filter bypass valves are designed to open at element collapse pressure (typically 300-450 mbar). Operating beyond this point allows unfiltered intake air to bypass the saturated element entirely, delivering high-concentration contamination directly to combustion chambers.' },
            ].map((item) => (
              <div key={item.title} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginTop: '1.5rem' }}>
            Abrasive particle ingestion through air intake pathways is the primary driver of engine wear. The full failure mechanism — including three-body abrasion, bearing surface damage, and clearance reduction — is documented in the <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>particle wear in engines contamination analysis</Link>.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>03 / ASSOCIATED STANDARDS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Applicable Specifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {STANDARDS.map((std) => (
              <div key={std.code} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.25rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', alignItems: 'start' }}>
                {std.href ? (
                  <Link href={std.href} style={{ textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#FFF12D', textDecoration: 'underline' }}>{std.code}</span>
                  </Link>
                ) : (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#FFF12D' }}>{std.code}</span>
                )}
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{std.desc}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>04 / OPERATIONAL IMPACT & COST</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Efficiency and Lifespan Degradation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {CHALLENGE_IMPACTS.map((impact) => (
              <div key={impact.metric} style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.12)', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4rem', fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>{impact.metric}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{impact.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>05 / RELATED CONTAMINATION MODES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Primary Failure Mechanism</h2>
          <Link href="/knowledge-system/contamination/particle-wear" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Particle Wear in Engines</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>Air intake ingestion is a primary source of abrasive particle contamination. Understand the three-body wear mechanisms and bearing damage pathways triggered by combustion air exceeding SAE J1539 limits.</p>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem' }}>VIEW ANALYSIS →</span>
            </motion.div>
          </Link>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>06 / ELIMFILTERS<sup style={{fontSize:'0.55em',verticalAlign:'super',letterSpacing:0}}>®</sup> TECHNOLOGIES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Applicable Filtration Systems</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '1rem' }}>
            {TECHNOLOGIES.map((tech) => (
              <Link key={tech.slug} href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', height: '100%' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.6rem' }}>{tech.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{tech.role}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>07 / SYSTEM DESIGN CONSIDERATIONS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Engineering Factors</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { title: 'Pre-Cleaner Integration', body: 'Cyclonic pre-cleaners remove 40-80% of dust mass before the primary element, extending element service life 2-3x in high-dust environments.' },
              { title: 'Restriction-Based Service Intervals', body: 'Service intervals should be determined by differential pressure measurement rather than fixed hours. First alarm activation (typically 375 mbar) is the correct service point.' },
              { title: 'Element Collapse Pressure Margin', body: 'Operating at or above element collapse pressure allows unfiltered air bypass. Collapse pressure for heavy equipment typically ranges 300-450 mbar; service must occur before reaching this threshold.' },
              { title: 'Environmental Adaptation', body: 'Harsh environments require compatible element media. Synthetic media resists moisture and provides longer life in salt-spray (marine) or high-humidity (tropical) conditions.' },
            ].map((item) => (
              <div key={item.title} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>08 / FREQUENTLY ASKED QUESTIONS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Technical Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.85rem', lineHeight: 1.5 }}>{faq.q}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>// EXPLORE OTHER FILTRATION SYSTEMS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem' }}>
            {RELATED_SYSTEMS.map((sys) => (
              <Link key={sys.code} href={sys.href} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', opacity: 0.6, letterSpacing: '0.1em' }}>{sys.code}</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{sys.title}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem' }}>EXPLORE →</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem' }}>CANONICAL KNOWLEDGE BLOCK: Air Intake Filtration Systems</p>
        <p style={{ marginBottom: '1rem', opacity: 0.5, fontSize: '0.65rem' }}>version: 1.1 | last_updated: 2026-06-11</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>DEFINITION</p>
        <p>Air intake filtration systems maintain SAE J1539-compliant combustion air cleanliness for diesel engines and compressors by capturing airborne particulate before it enters the intake manifold — preserving volumetric efficiency, protecting cylinder bore surfaces, and preventing abrasive wear on turbocharger compressor wheels operating at 100,000–200,000 RPM.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>SYSTEMS</p>
        <p>Diesel engine air intake circuits, turbocharger compressor sections, air compressor intake systems, agricultural machinery engines, mining equipment intake systems, construction equipment diesel engines</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>FAILURE_IMPACT</p>
        <p>Air filter restriction exceeds 200 mbar above clean-element baseline → engine volumetric efficiency drops 8% → fuel consumption increases 6–10% → engine management compensates by increasing fuel delivery → increased exhaust temperatures → accelerated turbocharger bearing wear. Unfiltered air bypass route: filter element collapse or bypass valve open → abrasive particle ingestion → cylinder bore scoring → piston ring wear → blow-by increase → engine overhaul at 2,000–5,000 hours vs. 10,000–15,000 hours with proper air filtration.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>RELATED_STANDARDS</p>
        <p>SAE J1539: Diesel engine air intake contamination classification defining maximum allowable dust concentration in combustion air | ISO 5011: Air filter element integrity and efficiency test standard covering collapse pressure verification | ANSI B132.1: Industrial air filter test methods for dust holding capacity and pressure drop | SAE J726: Air cleaner test code for evaluating air filter restriction characteristics</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>RELATED_TECHNOLOGIES</p>
        <p>MACROCORE: Progressive density gradient air filtration achieving 99.98% efficiency with extended dust holding capacity for high-dust environments | DRYCORE: Pre-filtration and moisture separation for humid and wet-environment intake systems | INTEKCORE: Housing systems maintaining intake circuit seal integrity preventing unfiltered air bypass</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>INDUSTRIAL_ROLE</p>
        <p>Air filtration is the primary defense against accelerated engine wear in dust-intensive operations — a single filter bypass event during agricultural harvesting or mining operations can introduce enough abrasive material to reduce engine bore life from 12,000 hours to under 3,000 hours, making condition-based monitoring and correct filter selection critical for fleet maintenance economics.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>CITATION_REFERENCE</p>
        <p>source: elimfilters.com/knowledge-system/standards/air-intake-systems | concept: Air Intake Filtration Systems | version: 1.1 | last_updated: 2026-06-11</p>
      </RetrievalBlock>

      {/* JSON-LD for AI/search engine structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Air Intake Filtration Systems — Industrial Standards",
        "description": "Air intake filtration maintains SAE J1539-compliant combustion air cleanliness protecting diesel engines and turbochargers from abrasive particle ingestion and volumetric efficiency loss.",
        "author": { "@type": "Organization", "name": "ELIMFILTERS" },
        "keywords": ["air intake filtration", "SAE J1539", "ISO 5011", "turbocharger protection", "engine air filter", "combustion air quality"],
        "about": { "@type": "Thing", "name": "Air Intake Filtration Systems", "description": "Engine air intake filtration for abrasive particle capture and combustion air quality maintenance" },
        "mentions": {
          "standards": ["SAE J1539", "ISO 5011", "ANSI B132.1", "SAE J726"],
          "technologies": ["MACROCORE", "DRYCORE", "INTEKCORE"],
          "contaminationModes": ["abrasive particle ingestion", "turbocharger blade erosion", "cylinder bore scoring", "intake restriction"]
        }
      })}} />
    </main>
  );
}
