'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const ease = [0.16, 1, 0.3, 1] as const;

const SYSTEMS = [
  {
    number: '01',
    name: 'Air Intake Protection',
    mission: 'Combustion, turbine & pneumatic integrity.',
    threat: 'Silica dust · Salt aerosol · Moisture ingress',
    metric: 'Up to 10,000 mg/m³ dust load · ISO 5011 · ISO 8573-1',
    technologies: ['MACROCORE™', 'INTEKCORE™', 'DRYCORE™'],
    industries: ['Mining', 'Agriculture', 'Construction', 'Power Gen', 'Rail'],
    href: '/systems/airfilter',
    color: 'rgba(251,191,36,0.07)',
    accent: '#FFF12D',
  },
  {
    number: '02',
    name: 'Fuel Cleanliness Protection',
    mission: 'HPCR injection system & fuel pump integrity.',
    threat: 'Free water · Particles >10µm · Microbial growth',
    metric: '99.8% water removal · 1,800–2,500 bar protection',
    technologies: ['HYDROCORE™', 'SYNTEPORE™'],
    industries: ['Marine', 'Off-Highway', 'Power Gen', 'Oil & Gas'],
    href: '/systems/fuel',
    color: 'rgba(251,146,60,0.06)',
    accent: '#fb923c',
  },
  {
    number: '03',
    name: 'Lubrication Protection',
    mission: 'Engine bearing, valve train & drivetrain integrity.',
    threat: 'Combustion soot · Metal wear particles · Fuel dilution',
    metric: 'ISO 4406 16/14/11 maintained · 15,000+ hr bearing life',
    technologies: ['SYNTRAX™'],
    industries: ['Heavy Trucks', 'Mining', 'Agriculture', 'Transit'],
    href: '/systems/oil',
    color: 'rgba(74,222,128,0.05)',
    accent: '#4ade80',
  },
  {
    number: '04',
    name: 'Hydraulic Protection',
    mission: 'Proportional valve & hydraulic circuit integrity.',
    threat: 'Sub-micron contamination · Valve spool abrasion',
    metric: 'Beta >200 · ISO 4406 17/15/12 cleanliness target',
    technologies: ['NANOFORCE™'],
    industries: ['Construction', 'Manufacturing', 'Agriculture', 'Mining'],
    href: '/systems/hydraulic',
    color: 'rgba(96,165,250,0.06)',
    accent: '#60a5fa',
  },
  {
    number: '05',
    name: 'Cooling System Protection',
    mission: 'Wet sleeve liner & coolant circuit integrity.',
    threat: 'Cavitation erosion · Scale formation · DCA depletion',
    metric: 'SCA replenishment · Liner cavitation prevention',
    technologies: ['THERMACORE™'],
    industries: ['Heavy Diesel', 'Marine', 'Power Gen', 'Rail'],
    href: '/systems/coolant',
    color: 'rgba(167,139,250,0.06)',
    accent: '#a78bfa',
  },
];

export default function SystemsHub() {
  return (
    <>
      <Navigation />
      <main style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>

        {/* ── HERO ── */}
        <section style={{ padding: '8rem 8% 5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(255,241,45,0.7)', textTransform: 'uppercase', marginBottom: '2rem' }}
          >
            // INDUSTRIAL PROTECTION SYSTEMS
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4rem', alignItems: 'end', maxWidth: '1200px' }}>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease }}
                style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.95, letterSpacing: '-0.03em', textTransform: 'uppercase', color: '#fff', margin: 0 }}
              >
                Five Systems.<br />
                <span style={{ color: '#FFF12D' }}>One Objective.</span>
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.35, ease }}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.45)', maxWidth: '320px', textAlign: 'right' }}
            >
              Contamination control across every critical system that keeps industrial assets running.
            </motion.p>
          </div>
        </section>

        {/* ── SYSTEM PANELS ── */}
        <section>
          {SYSTEMS.map((sys, i) => (
            <motion.div
              key={sys.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease }}
            >
              <Link href={sys.href} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div
                  whileHover={{ background: sys.color }}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '3rem 8%',
                    transition: 'background 0.3s ease',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '3rem', alignItems: 'center' }} className="system-panel-grid">

                    {/* Number */}
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: sys.accent, opacity: 0.35, lineHeight: 1 }}>
                      {sys.number}
                    </div>

                    {/* Content */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: '#fff', margin: 0, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                          {sys.name}
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {sys.technologies.map(t => (
                            <span key={t} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: sys.accent, background: `${sys.accent}15`, padding: '0.2rem 0.6rem', borderRadius: '2px' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                        <span style={{ color: 'rgba(255,255,255,0.25)', marginRight: '0.5rem' }}>THREAT:</span>
                        {sys.threat}
                      </p>

                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: sys.accent, opacity: 0.65, margin: 0, letterSpacing: '0.04em' }}>
                        {sys.metric}
                      </p>
                    </div>

                    {/* Right: industries + arrow */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
                        {sys.industries.map(ind => (
                          <span key={ind} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.5rem', borderRadius: '2px', textTransform: 'uppercase' }}>
                            {ind}
                          </span>
                        ))}
                      </div>
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: sys.accent, letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        EXPLORE SYSTEM →
                      </motion.div>
                    </div>

                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* ── BOTTOM STATEMENT ── */}
        <section style={{ padding: '6rem 8%', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="bottom-grid">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(255,241,45,0.6)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                // ASSET PROTECTION DOCTRINE
              </p>
              <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', lineHeight: 1.15, color: '#fff', marginBottom: '1.5rem' }}>
                Protection is not<br />a product.<br />
                <span style={{ color: '#FFF12D' }}>It is a system.</span>
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.45)', maxWidth: '440px' }}>
                Each protection system addresses a specific contamination mechanism. Together, they form a unified asset protection architecture across air, fuel, lube, hydraulic, and cooling circuits.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {[
                { label: 'Contamination Standards', href: '/knowledge-system/standards', desc: 'ISO 4406 · ISO 16889 · ISO 5011 · ISO 19438' },
                { label: 'Contamination Case Studies', href: '/knowledge-system/contamination', desc: 'Particle wear · Water ingestion · Hydraulic failure' },
                { label: 'Fleet Optimization', href: '/knowledge-system/fleet', desc: 'Maintenance strategy · TCO · Downtime reduction' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)', background: 'rgba(255,241,45,0.03)' }}
                    style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem', borderRadius: '3px', transition: 'all 0.25s ease' }}
                  >
                    <p style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#fff', margin: '0 0 0.3rem' }}>{link.label}</p>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.05em' }}>{link.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </div>
        </section>

        <style>{`
          @media (max-width: 900px) {
            .system-panel-grid {
              grid-template-columns: 48px 1fr !important;
              gap: 1.5rem !important;
            }
            .system-panel-grid > div:last-child {
              display: none !important;
            }
          }
          @media (max-width: 640px) {
            .bottom-grid {
              grid-template-columns: 1fr !important;
              gap: 2.5rem !important;
            }
          }
        `}</style>

      </main>
      <Footer />
    </>
  );
}
