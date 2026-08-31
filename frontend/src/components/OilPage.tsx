'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';

export function OilPage() {
  return (
    <>
      {/* HOME Button */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '2rem', zIndex: 100 }}>
        <Link
          href="/"
          style={{
            background: '#FFF12D',
            color: '#000',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            padding: '0.6rem 1.5rem',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          HOME
        </Link>
      </div>
      <main style={{ background: '#000', color: '#fff' }}>
        {/* Hero Section */}
        <section
          style={{
            marginTop: 0,
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: 'url(/images/oil-hand.avif)',
            backgroundSize: 'cover',
            backgroundPosition: '50% 60%',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 100%)',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 2rem',
              width: '100%',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginBottom: '2rem' }}
            >
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#FFF12D',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                ENGINE OIL FILTRATION SYSTEMS
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                fontWeight: 900,
                fontFamily: 'Montserrat, sans-serif',
                marginBottom: '1rem',
                lineHeight: 1.1,
              }}
            >
              OIL FILTERS
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                color: '#FFF12D',
                marginBottom: '2rem',
              }}
            >
              SYNTHETIC CAPACITY
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '1.1rem',
                maxWidth: '600px',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.65)',
                fontFamily: 'Inter, sans-serif',
                fontStyle: 'italic',
              }}
            >
              High-density synthetic media with quadruple dirt-holding capacity, integrated bypass valve protection and ISO 16889 / ISO 19438 dual certification. Engineered to keep oil clean between extended service intervals — where engine wear is decided.
            </motion.p>
          </div>
        </section>

        {/* Product Description */}
        <section
          style={{
            padding: '6rem 2rem',
            background: '#000',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="product-desc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
              <AnimateIn direction="left">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                  <h2
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      color: '#FFF12D',
                      fontFamily: 'JetBrains Mono, monospace',
                      margin: 0,
                    }}
                  >
                    OIL FILTERS — HIGH-DENSITY SYNTHETIC MEDIA
                  </h2>
                </div>
                <h3
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: 'Montserrat, sans-serif',
                    marginBottom: '1.5rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  Total Engine Lubrication Circuit Protection
                </h3>
                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Inter, sans-serif',
                    fontStyle: 'italic',
                    marginBottom: '2.5rem',
                  }}
                >
                  Engine wear happens between oil changes, not during them. ELIMFILTERS oil filters deploy high-density synthetic media that holds four times the dirt load of standard cellulose elements — maintaining stable restriction levels across the full drain interval without bypass events. The integrated anti-drain-back valve prevents dry starts and the calibrated bypass valve opens only under cold-start high-viscosity conditions, never under contamination load. Dual-certified to ISO 16889 (hydraulic and lube filter performance) and ISO 19438 (diesel fuel filter and engine oil filter efficiency).
                </p>

                <div
                  className="product-specs-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      MEDIA
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      High-Density Synthetic
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      CAPACITY
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      4× Standard Elements
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      CERTIFICATION
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      ISO 16889 / 19438
                    </p>
                  </div>
                </div>
              </AnimateIn>
              {/* Product Image */}
              <AnimateIn direction="right">
                <div
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,241,45,0.2)',
                    width: '340px',
                    height: '340px',
                    marginTop: '10%',
                    marginLeft: '35%',
                  }}
                >
                  <img
                    src="/images/oil-instalado.avif"
                    alt="Oil Filter Installed"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                </div>
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* Why Synthetic vs Cellulose */}
        <section
          style={{
            padding: '6rem 2rem',
            background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, rgba(0,0,0,0.6) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                <h2
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                    fontFamily: 'JetBrains Mono, monospace',
                    margin: 0,
                  }}
                >
                  SYNTHETIC vs. CELLULOSE
                </h2>
              </div>
            </AnimateIn>
            <div className="product-compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div>
                <AnimateIn direction="left" delay={0.05}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF12D', fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem' }}>
                    ELIMFILTERS Synthetic Media
                  </h3>
                </AnimateIn>
                <StaggerContainer>
                  {[
                    '4× dirt-holding capacity — handles extended oil change intervals without early bypass',
                    'Uniform fiber matrix — consistent pore size prevents large particles from migrating through the media under pressure spikes',
                    'Anti-drain-back valve — oil stays in the filter between starts, eliminating dry-start bearing wear',
                    'Bypass valve calibrated for viscosity only — opens at cold start, never opens due to contamination load',
                    'Stable restriction curve — no mid-interval pressure spikes that signal media loading near collapse',
                  ].map((item, idx) => (
                    <motion.div key={idx} variants={itemVariants} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#FFF12D', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', flexShrink: 0, marginTop: '0.15rem' }}>✓</span>
                      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>{item}</p>
                    </motion.div>
                  ))}
                </StaggerContainer>
              </div>
              <div>
                <AnimateIn direction="right" delay={0.05}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem' }}>
                    Standard Cellulose
                  </h3>
                </AnimateIn>
                <StaggerContainer>
                  {[
                    'Lower dirt capacity — bypass valve opens under contamination load before the drain interval ends',
                    'Irregular fiber structure — pore geometry varies, allowing particle migration at pressure peaks',
                    'Oil drains back to sump — first seconds after each start are dry, accelerating bearing journal wear',
                    'Bypass valve opens under restriction — unfiltered oil enters the main gallery during high-load operation',
                    'Restriction rises sharply at end of interval — engine oil pressure warning may precede the scheduled change',
                  ].map((item, idx) => (
                    <motion.div key={idx} variants={itemVariants} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', flexShrink: 0, marginTop: '0.15rem' }}>✗</span>
                      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>{item}</p>
                    </motion.div>
                  ))}
                </StaggerContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Field-Proven Performance */}
        <section
          style={{
            padding: '6rem 2rem',
            background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.4) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                <h2
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                    fontFamily: 'JetBrains Mono, monospace',
                    margin: 0,
                  }}
                >
                  FIELD-PROVEN PERFORMANCE
                </h2>
              </div>
            </AnimateIn>

            <StaggerContainer
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem',
              }}
            >
              <motion.div variants={itemVariants} style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  4×
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  DIRT-HOLDING CAPACITY
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Synthetic media retains four times the contamination load before reaching bypass threshold
                </p>
              </motion.div>

              <motion.div variants={itemVariants} style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  ISO
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  16889 & 19438 DUAL CERTIFIED
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  International standards for lube filter performance and diesel engine oil filter efficiency
                </p>
              </motion.div>

              <motion.div variants={itemVariants} style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  0
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  DRY-START EVENTS
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Anti-drain-back valve retains oil in filter between starts — bearings are lubricated from the first revolution
                </p>
              </motion.div>
            </StaggerContainer>

            <AnimateIn>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', lineHeight: 1.65, maxWidth: '800px', margin: '0 auto' }}>
                  Results verified in heavy transport, power generation, construction and mining engines operating on extended drain intervals up to 500 hours.
                </p>
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* Industrial Applications */}
        <section
          style={{
            padding: '6rem 2rem',
            background: '#000',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                <h2
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                    fontFamily: 'JetBrains Mono, monospace',
                    margin: 0,
                  }}
                >
                  INDUSTRIAL APPLICATIONS
                </h2>
              </div>
            </AnimateIn>

            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {[
                { title: 'HEAVY TRANSPORT', desc: 'Long-haul trucks on extended drain intervals. Synthetic capacity sustains lube circuit protection across 500-hour or 50,000-km oil change schedules without bypass events.' },
                { title: 'POWER GENERATION', desc: 'Diesel gensets running 24/7 base load. Maintains oil cleanliness and bearing film thickness during continuous operation between scheduled maintenance shutdowns.' },
                { title: 'CONSTRUCTION', desc: 'Excavators and heavy equipment under high thermal and contamination load. Four times the dirt capacity handles the elevated wear debris from hard-duty cycles.' },
                { title: 'MINING', desc: 'Haul trucks and drilling equipment in abrasive environments. Anti-drain-back valve critical for engines that restart multiple times per shift after extended idle periods.' },
                { title: 'AGRICULTURE', desc: 'Tractors and harvesters during peak season. Extended capacity covers full seasonal intervals without mid-harvest oil service that would halt field operations.' },
                { title: 'MARINE', desc: 'Main propulsion and auxiliary diesel engines. Resists oil degradation from saltwater contamination and high crankcase humidity in marine engine rooms.' },
              ].map((app, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(255,241,45,0.45)' }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.2) 100%)',
                    border: '1px solid rgba(255,241,45,0.2)',
                    borderRadius: '8px',
                    padding: '2rem',
                  }}
                >
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '1rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    {app.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
                    {app.desc}
                  </p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '6rem 2rem', background: '#FFF12D', textAlign: 'center' }}>
          <AnimateIn direction="up">
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#000', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif' }}>
                Ready to Deploy?
              </h2>
              <p style={{ fontSize: '1rem', color: '#000', marginBottom: '2rem', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                Identify your SKU. Cross-reference 600,000+ parts. Find your oil filtration solution now.
              </p>
              <motion.a
                href="https://part-search.elimfilters.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, boxShadow: '0 0 36px rgba(255,241,45,0.5)' }}
                style={{
                  display: 'inline-block',
                  background: '#000',
                  color: '#FFF12D',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.12em',
                  padding: '1.2rem 3rem',
                  textDecoration: 'none',
                  borderRadius: '4px',
                }}
              >
                IDENTIFY SKU →
              </motion.a>
            </div>
          </AnimateIn>
        </section>
      </main>
    </>
  );
}
