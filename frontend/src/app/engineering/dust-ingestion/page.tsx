'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ConversionProvider, useConversion } from '@/components/conversion/ConversionContext';
import { EngineeringRecommendationsSection } from '@/components/engineering';
import { CTACard } from '@/components/conversion/CTACard';

function DustIngestionContent() {
  const { dispatchTrustSignal, setIntent } = useConversion();

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Navigation */}
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '920px', margin: '0 auto' }}>
        <Link href="/engineering" style={{
          fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.08em',
        }}>
          ← ENGINEERING INTELLIGENCE
        </Link>
      </div>

      {/* Hero */}
      <section style={{
        padding: 'clamp(3rem, 6vw, 5rem) 2rem 2.5rem',
        borderBottom: '1px solid rgba(255,241,45,0.08)',
      }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,241,45,0.55)', letterSpacing: '0.12em', marginBottom: '1.25rem',
            }}>
              ENGINEERING TOPIC · AIR INTAKE SYSTEMS
            </p>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, lineHeight: 1.15, marginBottom: '1.25rem',
              maxWidth: '700px',
            }}>
              How does dust ingestion damage engines?
            </h1>
            <p style={{
              fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
              maxWidth: '640px', textAlign: 'justify',
            }}>
              Dust ingestion is the primary contamination failure mode for diesel engines in
              off-highway environments. A single element failure event — or an element operating
              past its rated dust capacity — can reduce engine overhaul interval from 15,000–25,000
              hours to 3,000–5,000 hours. The damage is abrasive, cumulative, and invisible until
              oil analysis reveals it has already progressed.
            </p>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        {/* 1 · Customer Problem */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-1')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>01 / CUSTOMER PROBLEM</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Engines consuming oil ahead of schedule. Silicon elevated in oil analysis.
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify', marginBottom: '1rem',
          }}>
            The diagnostic signals for dust ingestion appear in oil analysis long before engine
            performance visibly degrades. Elevated silicon (Si) is the primary marker — it indicates
            silica dust entering the crankcase via combustion blow-by from worn piston rings.
            Elevated aluminium (Al) indicates piston crown wear. Together, Si and Al rising above
            baseline in oil sampling represent an active abrasive wear event that is already
            shortening engine life.
          </p>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify',
          }}>
            Dust ingestion does not require a visible filter failure. Elements operating near or
            past their rated dust-holding capacity allow progressively more fine particles through
            as differential pressure rises. This &quot;late-life ingestion&quot; — where the filter is
            technically in service but no longer controlling contamination — accounts for a
            significant fraction of premature engine wear in fleets with poor service interval
            compliance.
          </p>
        </motion.section>

        {/* 2 · Operational Consequences */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>02 / OPERATIONAL CONSEQUENCES</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1.25rem', color: '#fff',
          }}>
            Scale of impact in mining-class environments
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { metric: '3K–5K hrs', label: 'Engine overhaul interval under uncontrolled dust ingestion vs. 15K–25K hours managed' },
              { metric: '$25K–$150K+', label: 'Engine rebuild cost per event depending on equipment class' },
              { metric: '$3K–$15K', label: 'Turbocharger replacement cost — first component in the air path after filtration' },
              { metric: '$21M–$60M+', label: 'Total event cost at mining machine rates of $180,000/hour for 5–14 day overhaul' },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '6px', padding: '1.25rem',
              }}>
                <p style={{
                  fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700, color: '#FFF12D', marginBottom: '0.4rem',
                }}>{item.metric}</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{item.label}</p>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, textAlign: 'justify',
          }}>
            In agricultural environments, engine overhaul during harvest season represents not only
            repair cost but lost seasonal productivity — a 10-day overhaul during peak harvest may
            cause crop losses exceeding the total equipment value for some operations. In construction,
            unplanned engine overhaul on a single machine can delay project milestones with contractual
            penalty implications.
          </p>
        </motion.section>

        {/* 3 · Engineering Explanation */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-2')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>03 / ENGINEERING EXPLANATION</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Abrasive wear: Mohs hardness determines the failure rate
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify', marginBottom: '1.25rem',
          }}>
            The failure mechanism is mechanical abrasion governed by the Mohs hardness differential
            between the contaminant and the component surface. Silica (Mohs 7) is significantly
            harder than steel (Mohs 4–5). Hardrock mine dust, crop silica, and construction site
            dust all contain silica at concentrations that make every cubic metre of ambient air a
            potential abrasive. When these particles bypass air intake filtration and enter the
            combustion chamber, each piston stroke introduces abrasive micro-cutting between ring
            and cylinder wall surfaces.
          </p>
          <div style={{
            background: 'rgba(255,241,45,0.04)', border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '6px', padding: '1.5rem', marginBottom: '1.25rem',
          }}>
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,241,45,0.6)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>FAILURE PROGRESSION</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                'Fine silica particles (5–20 µm) bypass filter or pass through late-life element',
                'Particles enter combustion chamber via intake manifold',
                'Abrasive contact with piston ring and cylinder wall on every piston stroke',
                'Ring-to-wall clearance increases from cumulative micro-cutting',
                'Blow-by gases (with combustion products and silica) enter crankcase',
                'Oil analysis shows elevated Si and Al — abrasive wear is confirmed active',
                'Increased blow-by accelerates oil oxidation and viscosity breakdown',
                'Compression loss reduces power output; fuel consumption increases',
                'Bearing wear accelerates from particle-contaminated oil circuit',
                'Engine overhaul required — interval 3,000–5,000 hours vs. 15,000–25,000 hours managed',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
                    color: 'rgba(255,241,45,0.5)', minWidth: '18px', paddingTop: '3px',
                  }}>{i + 1}</span>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
          <p style={{
            fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, textAlign: 'justify',
          }}>
            Turbocharger bearings are the first high-speed component in the air path after filtration.
            Operating at 80,000–150,000 RPM, turbocharger bearings have no tolerance for abrasive
            particles in the intake air stream. Turbocharger failure from dust ingestion is typically
            the first catastrophic repair event in an engine experiencing intake contamination.
          </p>
        </motion.section>

        {/* 4 · Applicable Standards */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>04 / APPLICABLE STANDARDS</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1.25rem', color: '#fff',
          }}>
            Standards that define air filtration performance
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                code: 'ISO 5011',
                scope: 'Air filter element performance test method for internal combustion engines and compressors. Measures filtration efficiency (% particle capture at specified sizes), initial restriction, and dust-holding capacity under controlled test conditions. The standard used to rate MACROCORE™ and equivalent air filtration products.',
                link: '/knowledge-center/standards/iso-5011',
              },
              {
                code: 'SAE J1539',
                scope: 'Air intake contamination classification for diesel engines. Defines ambient dust challenge concentrations for different operating environments (standard road, heavy off-road, mining/extreme) and the minimum filter efficiency requirements for each.',
                link: null,
              },
              {
                code: 'ISO 5011 (restriction)',
                scope: 'The same standard defines the restriction measurement at which a filter element must be replaced — the service indicator threshold. An element operating above the restriction limit forces bypass valve opening, allowing unfiltered air to enter the engine. Service interval compliance is a technical requirement under this standard, not a maintenance preference.',
                link: null,
              },
            ].map((std) => (
              <div key={std.code} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '6px', padding: '1.25rem',
                display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              }}>
                <p style={{
                  fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace',
                  color: '#FFF12D', minWidth: '88px', paddingTop: '2px', fontWeight: 600,
                }}>{std.code}</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                  {std.scope}{' '}
                  {std.link && (
                    <Link href={std.link} style={{ color: 'rgba(255,241,45,0.7)', textDecoration: 'none' }}>
                      Read standard →
                    </Link>
                  )}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5 · Technology Architecture */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-3')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>05 / TECHNOLOGY ARCHITECTURE</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Three-layer protection against abrasive particle ingestion
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                tech: 'MACROCORE™',
                role: 'Primary air intake protection',
                description: 'Multi-layer filtration media rated per ISO 5011 for off-highway diesel engines. Outer layers capture large particles and protect inner high-efficiency media. High dirt-holding capacity extends service intervals in extreme dust environments. Primary protection for mining-class and agricultural engine applications.',
                href: '/engineering/technologies/TECH-MACROCORE',
              },
              {
                tech: 'INTEKCORE™',
                role: 'Zero-bypass housing integrity',
                description: 'Filter housing system engineered to eliminate bypass air paths at element seating faces, end caps, and housing joints. Addresses the single-largest source of ingress contamination outside filter media failure: seal and gasket bypass allowing unfiltered air to reach the intake manifold around the element periphery.',
                href: '/engineering/technologies/TECH-INTEKCORE',
              },
              {
                tech: 'SYNTAPORE™',
                role: 'Humid environment intake',
                description: 'All-synthetic intake filter media for high-humidity environments where cellulose media is susceptible to moisture-induced strength loss and efficiency degradation. Applied in marine-adjacent, tropical, and coastal agricultural environments where conventional cellulose elements fail structurally before reaching rated dust capacity.',
                href: '/engineering/technologies/TECH-SYNTAPORE',
              },
            ].map((item) => (
              <Link key={item.tech} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.25)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px', padding: '1.25rem',
                    display: 'grid',
                    gridTemplateColumns: '130px 1fr',
                    gap: '1.25rem', alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <p style={{
                      fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem',
                    }}>{item.tech}</p>
                    <p style={{
                      fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                      color: 'rgba(255,255,255,0.35)', lineHeight: 1.5,
                    }}>{item.role}</p>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                    {item.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* 6 · Protection Strategy */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-4')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>06 / PROTECTION STRATEGY</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Service interval compliance is a technical requirement, not a preference
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify', marginBottom: '1.25rem',
          }}>
            The most effective protection against dust ingestion is a correctly specified filter
            element changed at the correct interval. An over-specified element (too high efficiency
            for actual dust load) will restrict flow prematurely and trigger bypass events.
            An under-specified element (too low dust capacity for ambient concentration) will
            reach rated capacity early and begin allowing late-life ingestion. Both failures
            are specification errors, not field failures.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              'Specify element dust capacity against measured ambient dust concentration in the operating environment, not generic OEM replacement specification',
              'Install a restriction indicator (service indicator) on the intake system — visual confirmation of impending bypass is the most reliable field measurement',
              'Change element on restriction indicator signal, not on calendar interval — dust loads vary seasonally and site-to-site',
              'Inspect element seating and housing seals at every element change — replace if any distortion, compression set, or contamination path is visible',
              'Include oil analysis in the service programme — elevated Si in oil confirms late-life ingestion was occurring before the element was changed',
              'Pre-cleaner or cyclone separator upstream of the primary element reduces dust load on the element and extends service life in extreme mining and construction environments',
              'Never clean and re-use cellulose air filter elements — cleaning redistributes contamination and damages media fibres, reducing efficiency below original ratings',
            ].map((action, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                  color: '#FFF12D', minWidth: '20px', paddingTop: '3px',
                }}>{String(i + 1).padStart(2, '0')}</span>
                <p style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{action}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 7 · Recommended Products */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => { dispatchTrustSignal('T-5'); setIntent('PROACTIVE_PROTECTION'); }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>07 / RECOMMENDED PRODUCTS</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Find air filtration elements for your engine and environment
          </h2>
          <p style={{
            fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
            marginBottom: '1.5rem', textAlign: 'justify',
          }}>
            Element selection requires engine model, OEM air filter housing dimensions, and
            the operating environment classification (standard road, heavy off-road, mining/extreme).
            MACROCORE™ primary elements are matched to engine make, model, and ambient dust
            concentration class.
          </p>
          <CTACard onLeadCapture={() => dispatchTrustSignal('T-6')} />
        </motion.section>

        {/* 8 · Engineering References */}
        <EngineeringRecommendationsSection
          primaryEntityId="CONT-DUST-MINERAL"
          queryType="contamination"
          label="08 / ENGINEERING REFERENCES — KNOWLEDGE GRAPH"
        />

        {/* 9 · Related Topics */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginTop: '3.5rem', marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '1.25rem',
          }}>09 / RELATED TOPICS</p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}>
            {[
              { label: 'Air Intake Systems — Standards Domain', href: '/knowledge-center/standards' },
              { label: 'Particle Wear — Contamination Study', href: '/knowledge-center/problems' },
              { label: 'MACROCORE™ Technology', href: '/engineering/technologies/TECH-MACROCORE' },
              { label: 'Engine Oil Contamination', href: '/knowledge-center/problems' },
              { label: 'Hydraulic Contamination', href: '/engineering/hydraulic-contamination' },
              { label: 'Mining — Extreme Dust Application', href: '/industries/mining' },
              { label: 'Agriculture — Crop Dust Application', href: '/industries/agriculture' },
              { label: 'Construction — High Silica Dust', href: '/industries/construction' },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.2)', background: 'rgba(255,241,45,0.03)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px', padding: '0.9rem 1rem',
                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.45,
                  }}
                >
                  {link.label} →
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* 10 · Next Recommended Journey */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '1.25rem',
          }}>10 / NEXT RECOMMENDED JOURNEY</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              {
                label: 'My engine shows signs of air intake contamination right now',
                href: '/engineering/problem-diagnosis',
                desc: 'Structured root-cause investigation',
                accent: '#f9a8d4',
              },
              {
                label: 'I want to build an air intake protection programme for my fleet',
                href: '/engineering/asset-protection',
                desc: 'Asset protection consultation',
                accent: '#FFF12D',
              },
            ].map((journey) => (
              <Link key={journey.href} href={journey.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: journey.accent }}
                  style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1.5rem' }}
                >
                  <p style={{
                    fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
                    color: journey.accent, opacity: 0.7, letterSpacing: '0.1em', marginBottom: '0.6rem',
                  }}>{journey.desc.toUpperCase()}</p>
                  <p style={{
                    fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                    color: '#fff', lineHeight: 1.4,
                  }}>{journey.label}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: 'How does dust ingestion damage engines?',
          description: 'Dust ingestion — silica and hardrock particles bypassing air intake filtration — causes abrasive ring and cylinder wall wear, reducing engine overhaul interval from 15,000–25,000 hours to 3,000–5,000 hours. ISO 5011 defines air filter performance measurement.',
          author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
          about: {
            '@type': 'Thing',
            name: 'Dust Ingestion — Air Intake Contamination',
            description: 'Engine ingesting fine particulate through the air intake system, accelerating abrasive wear on pistons, rings, turbocharger bearings, and cylinder walls.',
          },
          mentions: {
            standards: ['ISO 5011', 'SAE J1539'],
            technologies: ['MACROCORE', 'INTEKCORE', 'SYNTAPORE'],
            contaminationModes: ['silica dust', 'abrasive wear', 'particle ingestion', 'blow-by contamination'],
            industries: ['Mining', 'Construction', 'Agriculture'],
          },
          url: 'https://elimfilters.com/engineering/dust-ingestion',
        })}} />

      </div>
    </main>
  );
}

export default function DustIngestionPage() {
  return (
    <ConversionProvider>
      <DustIngestionContent />
    </ConversionProvider>
  );
}
