'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';

export function HydraulicPage() {
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
            backgroundImage: 'url(/images/hidraulico-trabajador.jpg)',
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
                HYDRAULIC FILTRATION SYSTEMS
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
              HYDRAULIC FILTERS
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
              PRECISION DEFENSE
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
              99.99% filtration efficiency with integrated water separation. Rated to 450 PSI for high-pressure circuits — protecting pumps, valves, actuators and servo components from particulate abrasion, water ingress and fluid degradation.
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
                    HYDRAULIC FILTERS — HIGH-COLLAPSE GLASS FIBER MEDIA
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
                  Total Hydraulic Circuit Asset Protection
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
                  ELIMFILTERS hydraulic filters are engineered for the most demanding fluid power circuits. The high-collapse glass fiber media achieves 99.99% single-pass efficiency, capturing particles down to 3 microns absolute before they reach precision-clearance components. A coalescing water separation stage removes free and emulsified water from the fluid stream — the primary cause of hydraulic pump cavitation, valve spool corrosion and fluid oxidation acceleration. Rated to 450 PSI collapse pressure, these elements hold structural integrity under the full shock-load range of mobile and industrial hydraulic systems.
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
                      EFFICIENCY
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      99.99% Single-Pass
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      PRESSURE
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      450 PSI Collapse
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      WATER
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      Coalescing Stage
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
                    src="/images/hidraulic.avif"
                    alt="Hydraulic Filter"
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

        {/* Why Hydraulic Contamination Kills Systems */}
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
                  THE COST OF CONTAMINATED HYDRAULIC FLUID
                </h2>
              </div>
            </AnimateIn>
            <div className="product-compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div>
                <AnimateIn direction="left" delay={0.05}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF12D', fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem' }}>
                    What ELIMFILTERS Prevents
                  </h3>
                </AnimateIn>
                <StaggerContainer>
                  {[
                    'Pump scoring and cavitation — particles at 3–5 micron destroy piston and vane surfaces faster than any other wear mode',
                    'Servo valve spool seizure — 5 micron clearances mean a single hard particle causes a stuck valve and a dead circuit',
                    'Fluid oxidation acceleration — water contamination catalyzes acid formation, multiplying fluid replacement costs',
                    'Seal extrusion and bypass — degraded fluid attacks elastomeric seals, creating leak paths across the entire circuit',
                    'Cylinder scoring and rod seal failure — particulate contamination on rod surfaces destroys dynamic seals in one stroke',
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
                    Without Adequate Filtration
                  </h3>
                </AnimateIn>
                <StaggerContainer>
                  {[
                    'ISO 4406 cleanliness code deteriorates rapidly — fluid contamination reaches critical levels within hours of operation',
                    'Pump efficiency drops 15–30% before catastrophic failure — measured power loss on every work cycle',
                    'Proportional valve response degrades — precision position control becomes impossible in mobile equipment',
                    'Fluid change intervals collapse from 4,000 hours to under 500 — maintenance cost multiplication across the fleet',
                    'Component replacement cascades — one contaminated pump destroys the entire downstream circuit',
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
                  99.99%
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  SINGLE-PASS EFFICIENCY
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Glass fiber media captures particles down to 3 microns absolute — one pass through the filter, not three
                </p>
              </motion.div>

              <motion.div variants={itemVariants} style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  450 PSI
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  COLLAPSE PRESSURE RATING
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Structural integrity maintained under full shock-load cycles — no media collapse, no bypass event
                </p>
              </motion.div>

              <motion.div variants={itemVariants} style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  3µm
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  ABSOLUTE FILTRATION RATING
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Precision protection for servo valves, proportional valves and piston pumps with 3–5 micron clearances
                </p>
              </motion.div>
            </StaggerContainer>

            <AnimateIn>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', lineHeight: 1.65, maxWidth: '800px', margin: '0 auto' }}>
                  Results verified in construction, mining, agriculture, marine and industrial manufacturing hydraulic systems operating under continuous high-pressure load.
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
                { title: 'CONSTRUCTION', desc: 'Excavators, cranes and hydraulic hammers. Protects high-pressure circuits from particulate ingression during boom, stick and bucket operations on contaminated job sites.' },
                { title: 'MINING', desc: 'Hydraulic roof supports, drill rigs and haul truck suspensions. Guards servo valves and piston pumps in circuits operating at 3,000–5,000 PSI under continuous shock loads.' },
                { title: 'AGRICULTURE', desc: 'Tractors, harvesters and precision planting equipment. Maintains proportional valve accuracy for GPS-guided implement control and hydraulic lift systems.' },
                { title: 'MARINE', desc: 'Deck machinery, steering gear and stabilizer systems. Removes water contamination from marine hydraulic circuits exposed to condensation and sea spray.' },
                { title: 'MANUFACTURING', desc: 'Hydraulic presses, injection molding machines and automated assembly. Sustains servo valve precision and cylinder positioning accuracy in high-cycle production environments.' },
                { title: 'HEAVY TRANSPORT', desc: 'Tipper trucks, semi-trailers and refuse vehicles. Defends hydraulic cylinders and directional control valves against contaminated fluid from extended service intervals.' },
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
                Identify your SKU. Cross-reference 500,000+ parts. Find your hydraulic filtration solution now.
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
