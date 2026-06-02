'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const RELATED_PAGES = [
  { code: 'DOWNTIME', title: 'Reducing Fleet Downtime', href: '/knowledge-system/fleet/reducing-downtime' },
  { code: 'TCO', title: 'Total Cost of Ownership', href: '/knowledge-system/fleet/total-cost-ownership' },
];

const TECHNOLOGIES = [
  { name: 'NANOFORCE', slug: 'nanoforce', role: 'Electrostatic synthetic media removes sub-10 micron contaminants from fuel before injection, preserving spray pattern geometry critical for combustion efficiency.' },
  { name: 'HYDROCORE', slug: 'hydrocore', role: 'Superabsorbent polymer cores extract free and emulsified water from fuel before it reaches injection circuits, preventing combustion irregularities.' },
  { name: 'MACROCORE', slug: 'macrocore', role: 'Progressive density gradient air filtration ensures combustion air-fuel ratio accuracy by maintaining intake volumetric efficiency throughout the filter service life.' },
  { name: 'DURATECH', slug: 'duratech', role: 'Engine oil filtration suppresses internal friction increase from wear particle accumulation, preserving mechanical efficiency at the friction interface level.' },
];

const STANDARDS = [
  { code: 'ISO 16889', desc: 'Hydraulic fluid cleanliness classification applied to fuel system analysis, providing quantitative threshold for filtration performance evaluation.' },
  { code: 'ASTM D975', desc: 'Standard specification for diesel fuel defining water and sediment limits that directly correlate to injector performance maintenance requirements.' },
  { code: 'SAE J1539', desc: 'Air induction system contamination standard governing intake cleanliness levels that affect volumetric efficiency and air-fuel ratio accuracy.' },
  { code: 'ISO 4406', desc: 'Particle count classification method applicable to fuel system contamination audits and filtration performance verification.' },
];

const FAQS = [
  {
    q: 'How does fuel contamination affect combustion efficiency at the injector level?',
    a: 'Modern high-pressure common-rail injectors operate at pressures between 1,600 and 2,500 bar with spray orifice diameters of 100 to 200 microns. Particles above 10 microns that pass through fuel filtration cause three failure modes: erosive wear of nozzle orifice geometry which enlarges spray holes and reduces atomization quality; abrasive wear of control valve seats causing internal leakage; and nozzle coking from combustion deposits accelerated by water contamination. Each failure mode shifts fuel delivery quantity and timing from calibrated values, increasing specific fuel consumption by 1 to 4% per injector affected.',
  },
  {
    q: 'What is the measurable relationship between air filter restriction and fuel consumption?',
    a: 'Engine volumetric efficiency decreases approximately 1% for every 25 mbar increase in air intake restriction above the clean-element baseline. A typical diesel engine operating at 200 mbar restriction (a partially loaded filter) may lose 3 to 5% volumetric efficiency compared to a fresh element. The engine management system compensates by increasing fuel quantity to maintain power output, directly increasing specific fuel consumption. Operating equipment with a restriction indicator alarm active - typically above 375 mbar - can increase fuel consumption by 6 to 10% depending on engine load profile.',
  },
  {
    q: 'Does water contamination in diesel fuel affect consumption beyond injector damage?',
    a: 'Water in diesel fuel affects combustion thermodynamics independently of mechanical damage. Free water droplets entering the combustion chamber consume heat energy during vaporization, reducing the thermal energy available for power stroke work. This effect becomes measurable above 500 ppm water concentration. Additionally, water contamination accelerates microbial growth in fuel storage systems - bacterial and fungal colonies produce biomass that blocks filter elements at accelerated rates, increasing filter change frequency and causing unexpected restriction events that force engines into derated operating modes.',
  },
  {
    q: 'How should filtration specifications change for biodiesel blends compared to petroleum diesel?',
    a: 'Biodiesel blends above B10 (10% biodiesel content) require more aggressive water management due to biodiesel\'s higher hygroscopicity. Biodiesel absorbs atmospheric moisture at rates 3 to 5 times higher than petroleum diesel, making water saturation at the fuel-air interface a chronic condition rather than an episodic one. Filter elements with higher water absorption capacity and more frequent separator bowl drainage are required. Additionally, biodiesel degrades elastomeric seals in older filter housings, so seal material compatibility must be verified before transitioning to higher blend ratios.',
  },
];

export default function FuelEfficiencyPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Navigation */}
      <Link href="/knowledge-system/fleet" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← FLEET</Link>

      {/* Hero */}
      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
            letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '1rem', opacity: 0.85,
          }}>
            // KNOWLEDGE SYSTEM · FLEET OPTIMIZATION · FUEL
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem',
          }}>
            Filtration and Fuel Efficiency
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Fuel consumption in industrial equipment is not a fixed parameter. Contamination of fuel, air, and lubrication systems creates measurable degradation in thermodynamic efficiency that compounds across fleet operating hours.
          </p>
        </motion.div>
      </section>

      {/* Body */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* 1. Short Definition */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>01 / DEFINITION</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Filtration as an Efficiency Variable</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1rem',
          }}>
            Fuel efficiency in industrial diesel equipment is the ratio of useful mechanical work output to fuel energy input. This ratio - expressed as specific fuel consumption (SFC) in grams per kilowatt-hour - degrades as mechanical systems move away from their design operating conditions.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
          }}>
            Contamination in fuel, air intake, and engine oil systems is a direct and quantifiable driver of SFC increase. Each system contributes independently: fuel contamination degrades injection precision, restricted air intake reduces volumetric efficiency, contaminated oil increases internal friction losses. Proper management of <Link href="/knowledge-system/standards/fuel-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>fuel filtration systems</Link> is the primary lever for preserving injection efficiency. A fleet operating all three systems with degraded filtration compounds these losses, producing total fuel consumption increases of 8 to 18% relative to clean-system baselines.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 2. Operational Challenge */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>02 / OPERATIONAL CHALLENGE</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Gradual Efficiency Loss Across Systems</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1.25rem',
          }}>
            The operational challenge with contamination-driven fuel efficiency loss is its gradual onset. No single event triggers a measurable consumption increase that operators notice in day-to-day operations. Instead, efficiency erodes incrementally over hundreds of hours: injectors slowly drift from calibrated spray geometry as orifice wear accumulates; air filter elements progressively restrict airflow as loading increases toward element capacity; engine oil viscosity climbs as oxidation products accumulate.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1.25rem',
          }}>
            Individual operators rarely observe this trend because it occurs below the threshold of perceptual detection. A 1% weekly consumption increase produces a 5% increase over a month - significant at fleet scale but invisible to an operator managing daily production targets. <Link href="/knowledge-system/contamination/diesel-water" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Diesel water contamination</Link> accelerates this efficiency loss by degrading injector spray geometry and triggering microbial growth that blocks fuel system passages. Only systematic fuel consumption tracking at the individual equipment level against historical baselines makes this degradation visible before it becomes severe.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
          }}>
            Fleet managers face the additional challenge that equipment operating in different duty cycles and ambient conditions will show different consumption profiles, making normalized comparison between units difficult without telemetry systems that track load factor and ambient temperature alongside fuel quantity. Particle cleanliness verification using <Link href="/knowledge-system/standards/iso-4406" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 4406 classification codes</Link> provides the objective baseline data required for meaningful fleet-level comparisons.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 3. Cost Impact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>03 / COST IMPACT</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Economic Scale of Efficiency Losses</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {[
              { metric: '+3 - 8%', label: 'Fuel consumption increase from contaminated injectors drifting from calibrated spray geometry' },
              { metric: '+6 - 10%', label: 'Consumption increase from operating with air filter restriction at or above service alarm threshold' },
              { metric: '+2 - 5%', label: 'Friction-driven fuel efficiency loss from degraded oil contaminated above ISO 18/16/13 threshold' },
              { metric: '8 - 18%', label: 'Potential cumulative fuel overconsumption with all three systems operating in degraded state simultaneously' },
            ].map((item) => (
              <div key={item.metric} style={{
                background: 'rgba(255,241,45,0.03)',
                border: '1px solid rgba(255,241,45,0.12)',
                padding: '1.25rem',
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4rem',
                  fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem',
                }}>{item.metric}</div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.5)', lineHeight: 1.5,
                }}>{item.label}</div>
              </div>
            ))}
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
          }}>
            For a fleet of 20 heavy trucks consuming 150 liters per shift, a 10% average overconsumption represents 300 liters of additional fuel daily. Annualized over 300 operating days, this amounts to 90,000 liters of unnecessary fuel expenditure per fleet - a cost that filtration program investment typically recovers within one to two operating seasons.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 4. Filtration Strategy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>04 / FILTRATION STRATEGY</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>System-by-System Efficiency Protection</h2>
          {[
            {
              title: 'Fuel System: Two-Stage Filtration',
              body: 'A primary coarse filter (25-40 micron nominal) captures bulk contamination from fuel storage and transfer. A secondary fine filter (2-5 micron absolute) provides final protection before injection circuits. Maintaining both stages within service specification prevents injector orifice wear and preserves atomization quality. Water separator elements require inspection and drainage at intervals determined by fuel quality - shorter in humid environments or with biodiesel blends.',
            },
            {
              title: 'Air Intake: Restriction-Based Service Intervals',
              body: 'Service intervals for air filters should be determined by measured restriction pressure, not fixed time or mileage intervals. A restriction indicator that measures differential pressure across the element provides real-time data. Servicing at the first alarm signal (typically 375 mbar) rather than waiting for a subsequent alarm avoids the efficiency penalty of operating with high restriction. In dusty environments, pre-cleaners and cyclonic separators reduce primary element loading and extend service intervals.',
            },
            {
              title: 'Engine Oil: Contamination-Based Drain Decisions',
              body: 'Oil analysis data from 250-hour sampling provides the objective basis for drain interval decisions. Elemental spectroscopy identifies increasing iron, aluminum, and chromium concentrations from combustion system wear - indicators that friction-related fuel consumption losses are accumulating. Particle count verification against ISO cleanliness targets confirms whether current filtration is maintaining adequate protection. Extending drain intervals beyond oil analysis data without element capacity confirmation increases contamination accumulation and friction losses.',
            },
          ].map((item) => (
            <div key={item.title} style={{
              borderLeft: '2px solid rgba(255,241,45,0.2)',
              paddingLeft: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem',
                fontWeight: 600, color: '#fff', marginBottom: '0.5rem',
              }}>{item.title}</p>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
              }}>{item.body}</p>
            </div>
          ))}
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 5. Real-World Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>05 / OPERATIONAL BENEFITS</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Documented Efficiency Outcomes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              'Fuel consumption reduced by 6 to 9% in agricultural harvesting fleets after implementing two-stage fuel filtration with water separation, attributed primarily to injector spray pattern preservation.',
              'Air filter restriction monitoring program in open-pit mining reduced average fleet fuel consumption by 4.5% by eliminating service intervals that exceeded maximum restriction thresholds.',
              'Marine diesel applications showed 5 to 7% SFC improvement after transitioning from standard to high-efficiency fuel filtration (3 micron absolute), with injector reconditioning intervals extended from 2,000 to 5,000 hours.',
              'Long-haul trucking fleet reduced annual fuel spend by 8.3% per vehicle through integrated filtration program combining air restriction monitoring, fuel water separation, and oil analysis-based drain management.',
              'Construction equipment fleet operating in silica-rich environments achieved 12% fuel efficiency improvement after upgrading to pre-cleaner plus primary filter configuration that maintained restriction below 200 mbar throughout service intervals.',
            ].map((benefit, i) => (
              <div key={i} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                padding: '1rem 1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
                  color: '#FFF12D', opacity: 0.6, flexShrink: 0, paddingTop: '0.15rem',
                }}>{'>'}</span>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0,
                }}>{benefit}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 6. Related Technologies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>06 / RELATED TECHNOLOGIES</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Filtration Systems Supporting Efficiency</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '1rem' }}>
            {TECHNOLOGIES.map((tech) => (
              <Link key={tech.slug} href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem',
                    height: '100%',
                  }}
                >
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
                    fontWeight: 600, color: '#FFF12D', marginBottom: '0.6rem',
                  }}>{tech.name}</p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
                  }}>{tech.role}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 7. Related Standards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>07 / RELATED STANDARDS</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Applicable Specifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {STANDARDS.map((std) => (
              <div key={std.code} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                alignItems: 'start',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
                  fontWeight: 600, color: '#FFF12D',
                }}>{std.code}</span>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.5)', lineHeight: 1.55,
                }}>{std.desc}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 8. FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>08 / FREQUENTLY ASKED QUESTIONS</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em',
          }}>Technical Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1.5rem',
              }}>
                <p style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem',
                  fontWeight: 600, color: '#fff', marginBottom: '0.85rem', lineHeight: 1.5,
                }}>{faq.q}</p>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
                }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Internal Navigation */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem',
          }}>// CONTINUE IN FLEET OPTIMIZATION</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem' }}>
            {RELATED_PAGES.map((page) => (
              <Link key={page.code} href={page.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem',
                  }}
                >
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    color: '#FFF12D', opacity: 0.6, letterSpacing: '0.1em',
                  }}>{page.code}</span>
                  <span style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
                    fontWeight: 600, color: '#fff',
                  }}>{page.title}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem',
                  }}>READ →</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Diesel Fuel Integrity Systems [PRIMARY] | Asset Protection Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: fuel, engine, injector, combustion</p>
        <p>CONCEPT_TAXONOMY: type=strategy | domain=fuel-efficiency | goal=consumption-reduction</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ASTM D6304, ISO 4406</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/diesel-water</p>
        <p>&nbsp;&nbsp;Related_Technologies: HYDROCORE, MACROCORE, NANOFORCE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime, /knowledge-system/fleet/total-cost-ownership</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/fleet/fuel-efficiency</p>
        <p>&nbsp;&nbsp;concept_id: filtration-fuel-efficiency</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </RetrievalBlock>
    </main>
  );
}
