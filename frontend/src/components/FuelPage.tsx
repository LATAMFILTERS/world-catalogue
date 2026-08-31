'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';

export function FuelPage() {
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
            backgroundImage: 'url(/images/fuelfilter-hero.avif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
                FUEL FILTRATION SYSTEMS
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                fontWeight: 900,
                fontFamily: 'Montserrat, sans-serif',
                marginBottom: '1rem',
                lineHeight: 1.1,
              }}
            >
              FUEL FILTERS
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                color: '#FFF12D',
                marginBottom: '2rem',
              }}
            >
              SYNTHETIC ARMOR MEDIA
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '1.1rem',
                maxWidth: '600px',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.65)',
                fontFamily: 'Inter, sans-serif',
                fontStyle: 'italic',
              }}
            >
              Synthetic fiber armor media with high dirt capacity rated to ISO 16332. Engineered for diesel, biodiesel and gasoline applications — intercepting particulates, water and microbial contamination before they reach high-pressure injection systems.
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
                    FUEL FILTERS — SYNTHETIC ARMOR MEDIA
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
                  Total Injection System Asset Protection
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
                  ELIMFILTERS fuel filters are built on a synthetic fiber matrix engineered to ISO 16332 — the international standard for diesel fuel filter testing. The armor media delivers superior dirt-holding capacity over conventional cellulose elements, maintaining stable restriction levels across the full service interval. Compatible with diesel, biodiesel blends up to B20, and gasoline, protecting common rail injectors, unit injectors and injection pumps from particulate abrasion, water ingress and microbial fouling.
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
                      Synthetic Fiber Armor
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      RATING
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      ISO 16332 Certified
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      FUEL TYPE
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      Diesel / B20 / Gasoline
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
                    src="/images/fuel-filter.avif"
                    alt="Fuel Filter"
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

        {/* Why Synthetic Armor */}
        <section
          style={{
            padding: '6rem 2rem',
            background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, rgba(0,0,0,0.6) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            <div className="product-compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <AnimateIn direction="left">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF12D', fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem' }}>
                  ELIMFILTERS Synthetic Armor
                </h3>
                <StaggerContainer>
                  {[
                    'Uniform synthetic fiber diameter — consistent pore geometry across full media area',
                    'Hydrophobic treatment repels emulsified water before it reaches injectors',
                    'Higher dirt-holding capacity — up to 2× a cellulose element of the same size',
                    'Stable restriction across the full service interval — no mid-service pressure spikes',
                    'Biodiesel-compatible up to B20 without media degradation or swelling',
                  ].map((item, idx) => (
                    <motion.div key={idx} variants={itemVariants} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#FFF12D', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', flexShrink: 0, marginTop: '0.15rem' }}>✓</span>
                      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>{item}</p>
                    </motion.div>
                  ))}
                </StaggerContainer>
              </AnimateIn>
              <AnimateIn direction="right">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem' }}>
                  Standard Cellulose
                </h3>
                <StaggerContainer>
                  {[
                    'Variable fiber diameter — uneven filtration and bypass risk at pressure peaks',
                    'Absorbs water over time — swells, restricts flow, risks media collapse',
                    'Lower dirt capacity — early restriction increase under heavy contamination',
                    'Restriction rises sharply near end of service — fuel starvation risk',
                    'Biodiesel blends attack cellulose binders — media integrity degradation',
                  ].map((item, idx) => (
                    <motion.div key={idx} variants={itemVariants} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', flexShrink: 0, marginTop: '0.15rem' }}>✗</span>
                      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>{item}</p>
                    </motion.div>
                  ))}
                </StaggerContainer>
              </AnimateIn>
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
                  ISO 16332
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  INTERNATIONAL FILTRATION STANDARD
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Certified dirt-holding capacity and filtration efficiency for diesel fuel systems
                </p>
              </motion.div>

              <motion.div variants={itemVariants} style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  2×
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  DIRT-HOLDING CAPACITY
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Synthetic fiber matrix holds twice the contamination of equivalent cellulose elements
                </p>
              </motion.div>

              <motion.div variants={itemVariants} style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  &lt;4µm
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  ABSOLUTE FILTRATION RATING
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Precision protection for common rail injectors toleranced to 2–4 micron clearances
                </p>
              </motion.div>
            </StaggerContainer>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', lineHeight: 1.65, maxWidth: '800px', margin: '0 auto' }}>
                Results verified across heavy transport, power generation, marine propulsion and off-highway equipment operating on diesel and biodiesel blends.
              </p>
            </div>
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

            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {[
                { title: 'HEAVY TRANSPORT', desc: 'Long-haul trucks and diesel fleet vehicles. Protects high-pressure common rail systems from particulate abrasion and injector tip deposit formation.' },
                { title: 'POWER GENERATION', desc: 'Diesel generator sets and standby power plants. Guarantees fuel purity for uninterrupted injection cycle integrity under continuous load.' },
                { title: 'MARINE', desc: 'Commercial and fishing vessels. Defends marine diesel injection systems from water-contaminated fuel, algae fouling and saltwater ingress.' },
                { title: 'MINING', desc: 'Off-highway haul trucks and drilling equipment. Guards injection systems against heavily contaminated fuel from remote storage tanks.' },
                { title: 'AGRICULTURE', desc: 'Tractors, harvesters and irrigation pumps. Prevents injector wear from silica-contaminated fuel during field operations.' },
                { title: 'CONSTRUCTION', desc: 'Excavators and heavy machinery. Sustains injection system precision on 24/7 duty cycles with variable-quality fuel supply.' },
              ].map((app, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ borderColor: 'rgba(255,241,45,0.5)', background: 'linear-gradient(135deg, rgba(255,241,45,0.14) 0%, rgba(0,0,0,0.2) 100%)' }}
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
                Identify your SKU. Cross-reference 600,000+ parts. Find your fuel filtration solution now.
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
