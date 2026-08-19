'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';

export function FuelSeparatorPage() {
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
            backgroundImage: 'url(/images/fuellseparator-hero.avif)',
            backgroundSize: 'cover',
            backgroundPosition: '50% 60%',
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
                FUEL WATER SEPARATION SYSTEMS
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
              FUEL SEPARATORS
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
              COALESCENCE DEFENSE
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
              Staged coalescence removing free and emulsified water from diesel fuel circuits in approved Turbine Series FH/FG applications — the last barrier between contaminated fuel and high-pressure injection systems.
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
                    FUEL SEPARATORS — MULTI-STAGE COALESCENCE
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
                  Total Water Elimination Before Injection
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
                  Water in diesel fuel is not a rare event — it enters through condensation in storage tanks, contaminated deliveries and seal ingress during transport. ELIMFILTERS HYDROCORE™ deploys a staged asset protection system: an inertial defense layer captures sediment and large contaminants, a coalescing stage forces microscopic water droplets to merge and fall into the collection chamber, and the HYDROCORE™ hydrophobic final barrier blocks residual water from reaching the injection circuit. Tested per ISO 16332, the water separation test method for diesel fuel filters.
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
                      STAGE 1
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      Sediment Pre-Filter
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      STAGE 2
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      Coalescing Media
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      STAGE 3
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      Hydrophobic Barrier
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
                    src="/images/fuelseparator.avif"
                    alt="Fuel Water Separator"
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

        {/* Why Water Destroys Injection Systems */}
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
                  HOW WATER ENTERS THE FUEL CIRCUIT
                </h2>
              </div>
            </AnimateIn>
            <div className="product-compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div>
                <AnimateIn direction="left" delay={0.05}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF12D', fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem' }}>
                    Entry Points — What ELIMFILTERS Stops
                  </h3>
                </AnimateIn>
                <StaggerContainer>
                  {[
                    'Tank condensation — temperature cycles cause humid air inside storage tanks to condense directly into the fuel',
                    'Contaminated deliveries — bulk diesel transport can introduce water during filling and transfer operations',
                    'Biodiesel hygroscopicity — B5 to B20 blends absorb atmospheric moisture more aggressively than pure diesel',
                    'Microbial growth — water at the bottom of tanks creates the conditions for diesel bug, generating acid and sludge that clog injectors',
                    'Seal ingress — worn tank cap seals and vent lines allow rainwater and wash-down water to enter during vehicle operations',
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
                    Without Separation — What Happens
                  </h3>
                </AnimateIn>
                <StaggerContainer>
                  {[
                    'Injector tip corrosion — water at high pressure and temperature strips the protective oxide layer from injector nozzles within hours',
                    'Injection pump seizure — water breaks the lubricating film between pump plungers and barrels, causing metal-to-metal contact',
                    'Cavitation erosion — water vaporizes inside the high-pressure pump, collapsing bubbles that erode pump surfaces',
                    'Common rail pressure loss — corroded check valves and seats fail to hold rail pressure, causing misfires and power loss',
                    'Cold-weather fuel line freeze — free water freezes in fuel lines at temperatures above the diesel cloud point, blocking fuel flow completely',
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
                  ISO 16332
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  WATER SEPARATION TEST METHOD
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Test methodology referenced for diesel fuel filter and water separator performance evaluation; applicable ratings are tied to the specific approved element
                </p>
              </motion.div>

              <motion.div variants={itemVariants} style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  Staged
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  SEPARATION ARCHITECTURE
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Sediment pre-filter, coalescing media and hydrophobic final barrier — matched to the approved application
                </p>
              </motion.div>

              <motion.div variants={itemVariants} style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  Final
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  BARRIER STAGE
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Hydrophobic final stage engineered to block residual water from passing into the high-pressure injection circuit
                </p>
              </motion.div>
            </StaggerContainer>

            <AnimateIn>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', lineHeight: 1.65, maxWidth: '800px', margin: '0 auto' }}>
                  Deployed in heavy transport, marine, power generation and agriculture operations exposed to condensation-prone fuel storage and variable-quality diesel supply.
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
                { title: 'HEAVY TRANSPORT', desc: 'Long-haul trucks operating in humid climates and seasonal temperature swings. Eliminates injector corrosion from tank condensation on diesel stored overnight in cold environments.' },
                { title: 'MARINE', desc: 'Commercial and fishing vessels. Removes saltwater intrusion and tank condensation from diesel circuits exposed to the highest ambient humidity conditions of any application.' },
                { title: 'POWER GENERATION', desc: 'Diesel generator sets with long fuel storage periods. Prevents microbial growth and water accumulation in tanks that sit between infrequent test runs and emergency activation.' },
                { title: 'MINING', desc: 'Off-highway haul trucks fueled from remote bulk storage. Guards against water-contaminated fuel from outdoor storage tanks exposed to precipitation and temperature cycling.' },
                { title: 'AGRICULTURE', desc: 'Tractors and harvesting equipment fueled from on-farm storage. Protects common rail injection systems from water-contaminated fuel drawn from field tanks after rain events.' },
                { title: 'CONSTRUCTION', desc: 'Equipment fueled from portable tanks and on-site bowsers. Intercepts water introduced during fuel transfers and outdoor storage on job sites.' },
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
                Identify your SKU. Cross-reference 500,000+ parts. Find your fuel separator now.
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
