'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';

const STAGES = [
  {
    number: '01',
    tag: 'STAGE',
    title: 'INERTIAL INTERCEPTION',
    body: 'HYDROCORE™ turbine rotation induces centrifugal momentum on incoming fuel, driving macro-particles and free water outward against the chamber wall by inertial force. The intercepted mass accumulates in the sealed base chamber, separated from the fuel path ahead of downstream conditioning stages.',
    stat: 'Coarse',
    statLabel: 'Entry-stage separation',
  },
  {
    number: '02',
    tag: 'STAGE',
    title: 'GRADUATED COALESCENCE',
    body: 'Fuel transitions through a graduated contact zone where microscopic water droplets are forced into repeated surface contact. Each contact cycle causes droplets to merge, grow, and fall by gravity into the sealed collection chamber below.',
    stat: 'Coalescing',
    statLabel: 'Emulsified-water conditioning',
  },
  {
    number: '03',
    tag: 'STAGE',
    title: 'HYDROCORE™ PRECISION BARRIER',
    body: 'The final HYDROCORE™ hydrophobic protection barrier intercepts fine contamination and residual water before the fuel enters the high-pressure injection circuit. Element rating and staging are matched to the required flow, separation duty and installation of the approved FH or FG application.',
    stat: 'Final',
    statLabel: 'Application-matched barrier stage',
  },
];

const SPECS = [
  { label: 'MODEL 900FH', value: 'FH Series', sub: 'Light to medium duty' },
  { label: 'MODEL 1000FH', value: 'FH Series', sub: 'Heavy duty operations' },
  { label: 'PROTECTION SCOPE', value: 'Staged', sub: 'Water and particulate separation — application-specific rating' },
  { label: 'BARRIER OPTIONS', value: 'Multiple', sub: 'Element rating matched to approved application' },
  { label: 'APPLICATION', value: 'Turbine FH/FG', sub: 'Approved Turbine Series fuel-separation architecture' },
  { label: 'DRAIN SYSTEM', value: 'AUTO', sub: 'Integrated visual monitoring port' },
];

const APPLICATIONS = [
  { sector: 'HEAVY TRANSPORT', detail: 'Long-haul diesel fleets and common rail injection systems operating at high continuous duty cycles. The 1000FH is the designated asset protection solution for premium-class trucks with HPCR fuel systems.' },
  { sector: 'POWER GENERATION', detail: 'Stationary diesel gensets and backup power units where fuel quality directly determines operational continuity. A single contamination event can force extended maintenance shutdowns during peak demand.' },
  { sector: 'AGRICULTURE', detail: 'Tractors, combines and harvesting equipment operating in dusty, humid conditions where fuel storage tanks are exposed to condensation cycles. The 900FH extends injection system service life through each critical season.' },
  { sector: 'MINING', detail: 'Off-highway extraction equipment running 24/7 in environments where water ingress from condensation, rain and contaminated bulk fuel deliveries is a constant operational threat.' },
  { sector: 'CONSTRUCTION', detail: 'Excavators, graders and heavy machinery on demanding site cycles where fuel systems absorb contamination from multiple sources simultaneously.' },
  { sector: 'RAILWAY', detail: 'Diesel locomotives and rolling stock requiring absolute fuel circuit integrity across extreme temperature and humidity ranges over extended service intervals.' },
];

export function HYDROCOREPage() {
  return (
    <>
      <Link href="/"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}>← HOME</Link>

      <main style={{ background: '#000', color: '#fff' }}>

        {/* ── HERO ── */}
        <section style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'url(/images/turbinas-hero.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll',
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 100%)', zIndex: 1 }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem 4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.28em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem' }}>
                FUEL ASSET PROTECTION · SERIES FH
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 900, fontFamily: 'Titillium Web, sans-serif', lineHeight: 1.0, marginBottom: '0.5rem' }}>
              HYDROCORE
            </motion.h1>
            <motion.h2 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2.8rem)', fontWeight: 700, fontFamily: 'Titillium Web, sans-serif', color: '#FFF12D', marginBottom: '2rem' }}>
              /SERIES™
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: '1rem', maxWidth: '560px', lineHeight: 1.75, color: 'rgba(255,255,255,0.7)', fontFamily: 'Titillium Web, sans-serif', borderLeft: '3px solid #FFF12D', paddingLeft: '1.25rem' }}>
              Staged graduated asset protection for approved Turbine Series FH/FG fuel injection systems. Water, sediment and fine contamination intercepted before they reach the injection circuit.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.55 }}
              style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              {[['900FH', 'FH Series'], ['1000FH', 'FH Series'], ['Application', 'Turbine FH/FG']].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.25rem' }}>{k}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF12D', fontFamily: 'Titillium Web, sans-serif' }}>{v}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── SYSTEM OVERVIEW ── */}
        <section style={{ padding: '6rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="product-desc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
              <AnimateIn direction="left">
                <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem' }}>
                  SYSTEM OVERVIEW
                </span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, fontFamily: 'Titillium Web, sans-serif', lineHeight: 1.15, marginBottom: '1.5rem' }}>
                  NOT A FILTER.<br />AN ASSET PROTECTION SYSTEM.
                </h2>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', fontFamily: 'Titillium Web, sans-serif', marginBottom: '1.25rem' }}>
                  Conventional fuel filters intercept particles. HYDROCORE™ addresses the broader contamination spectrum — particulate, free water and emulsified water — through a staged fuel-conditioning and separation architecture matched to the approved Turbine Series FH/FG application.
                </p>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', fontFamily: 'Titillium Web, sans-serif', marginBottom: '1.25rem' }}>
                  The 900FH and 1000FH models deploy HYDROCORE™ turbine rotation as the first line of defense — a passive inertial system that requires no electronic control, no actuators and no maintenance intervention. Protection begins the moment fuel enters the housing.
                </p>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', fontFamily: 'Titillium Web, sans-serif' }}>
                  The result: a fuel injection circuit protected by staged conditioning matched to the approved application's fuel quality and operating conditions.
                </p>
              </AnimateIn>

              <AnimateIn direction="right">
                <div style={{ position: 'sticky', top: '6rem' }}>
                  <img
                    src="/images/turbinefh-foto.avif"
                    alt="HYDROCORE™ 900FH · 1000FH"
                    style={{ width: '100%', borderRadius: '4px', border: '1px solid rgba(255,241,45,0.15)', display: 'block' }}
                  />
                  <p style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginTop: '1rem', textAlign: 'center' }}>
                    HYDROCORE™ · 900FH / 1000FH
                  </p>
                </div>
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* ── 3-STAGE BREAKDOWN ── */}
        <section style={{ padding: '6rem 2rem', background: 'rgba(255,241,45,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>
                THREE-STAGE PROTECTION ARCHITECTURE
              </span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, fontFamily: 'Titillium Web, sans-serif', marginBottom: '4rem', lineHeight: 1.15 }}>
                EACH STAGE ELIMINATES<br />WHAT THE PREVIOUS ONE CANNOT.
              </h2>
            </AnimateIn>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {STAGES.map((stage, idx) => (
                <AnimateIn key={idx} direction="up">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto',
                    gap: '3rem',
                    alignItems: 'start',
                    padding: '3rem 2.5rem',
                    background: '#050505',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '2px',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>{stage.tag}</div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.08)', fontFamily: 'Titillium Web, sans-serif', lineHeight: 1 }}>{stage.number}</div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Titillium Web, sans-serif', color: '#fff', marginBottom: '1rem', letterSpacing: '0.02em' }}>
                        {stage.title}
                      </h3>
                      <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', fontFamily: 'Titillium Web, sans-serif', margin: 0, maxWidth: '600px' }}>
                        {stage.body}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Titillium Web, sans-serif', lineHeight: 1 }}>{stage.stat}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Titillium Web, sans-serif', marginTop: '0.4rem', maxWidth: '110px', textAlign: 'right' }}>{stage.statLabel}</div>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── SPECS ── */}
        <section style={{ padding: '5rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>
                PROTECTION PARAMETERS
              </span>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 900, fontFamily: 'Titillium Web, sans-serif', marginBottom: '3rem' }}>
                FIELD SPECIFICATIONS
              </h2>
            </AnimateIn>
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
              {SPECS.map((spec, idx) => (
                <motion.div key={idx} variants={itemVariants} style={{ background: '#000', padding: '2rem 1.75rem' }}>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>{spec.label}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Titillium Web, sans-serif', lineHeight: 1, marginBottom: '0.5rem' }}>{spec.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'Titillium Web, sans-serif', lineHeight: 1.5 }}>{spec.sub}</div>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ── APPLICATIONS ── */}
        <section style={{ padding: '6rem 2rem', background: 'rgba(255,241,45,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>
                ASSET APPLICATIONS
              </span>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 900, fontFamily: 'Titillium Web, sans-serif', marginBottom: '0.75rem' }}>
                WHERE HYDROCORE™ PROTECTS
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Titillium Web, sans-serif', marginBottom: '3rem', maxWidth: '580px', lineHeight: 1.7 }}>
                FH-series turbine protection systems are validated for land-based combustion asset protection. Marine applications are served by the FM series.
              </p>
            </AnimateIn>
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
              {APPLICATIONS.map((app, idx) => (
                <motion.div key={idx} variants={itemVariants}
                  style={{ background: '#000', padding: '2.5rem 2rem', borderBottom: 'none' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem' }}>
                    {app.sector}
                  </div>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', fontFamily: 'Titillium Web, sans-serif', margin: 0 }}>
                    {app.detail}
                  </p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '5rem 2rem', background: '#FFF12D', textAlign: 'center' }}>
          <AnimateIn direction="up">
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,0,0,0.5)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem' }}>
                IDENTIFY YOUR HYDROCORE™ SKU
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, fontFamily: 'Titillium Web, sans-serif', color: '#000', marginBottom: '1.25rem', lineHeight: 1.1 }}>
                FIND YOUR PROTECTION SYSTEM
              </h2>
              <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.65)', fontFamily: 'Titillium Web, sans-serif', marginBottom: '2.5rem', lineHeight: 1.65 }}>
                Cross-reference 600,000+ OEM part numbers. Identify the exact 900FH or 1000FH model for your asset.
              </p>
              <motion.a
                href="https://part-search.elimfilters.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, boxShadow: '0 0 36px rgba(0,0,0,0.3)' }}
                style={{ display: 'inline-block', background: '#000', color: '#FFF12D', fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', padding: '1rem 3rem', textDecoration: 'none', borderRadius: '4px' }}>
                IDENTIFY SKU →
              </motion.a>
            </div>
          </AnimateIn>
        </section>

      </main>
    </>
  );
}
