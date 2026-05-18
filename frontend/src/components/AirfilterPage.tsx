'use client';

import Link from 'next/link';

export function AirfilterPage() {
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
            backgroundImage: 'url(/images/air-filterld.avif)',
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
            <div style={{ marginBottom: '2rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#FFF12D',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                // AIR INTAKE FILTRATION
              </span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                fontWeight: 900,
                fontFamily: 'Space Grotesk, sans-serif',
                marginBottom: '1rem',
                lineHeight: 1.1,
              }}
            >
              AIR FILTERS
            </h1>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif',
                color: '#FFF12D',
                marginBottom: '2rem',
              }}
            >
              MACROCORE™ TECHNOLOGY
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                maxWidth: '600px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Absolute protection for intake systems in internal combustion engines and rotating machinery. Progressive density gradient engineering for every industrial sector.
            </p>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
              <div>
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
                    AIR FILTERS — FILTRATION MEDIA
                  </h2>
                </div>
                <h3
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '1.5rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  Total Intake System Protection
                </h3>
                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: '2.5rem',
                  }}
                >
                  ELIMFILTERS air filters are high-performance filtration media developed under progressive density gradient principles. They use high-purity cellulose fibers reinforced with structural synthetic resins to deliver absolute protection for intake systems in internal combustion engines and rotating machinery.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      CONSTRUCTION
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      High-Purity Cellulose
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      REINFORCEMENT
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      Structural Synthetic Resins
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      MATRIX
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      Progressive Density Gradient
                    </p>
                  </div>
                </div>
              </div>
              {/* Product Image */}
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
                  src="/images/air-filter1.avif"
                  alt="Air Filter Product"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem',
              }}
            >
              <div style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Space Grotesk, sans-serif' }}>
                  +45%
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  SERVICE INTERVAL EXTENSION
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                  Extended service periods compared to industry standards
                </p>
              </div>

              <div style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Space Grotesk, sans-serif' }}>
                  -60%
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  DOWNTIME REDUCTION
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                  Fewer unplanned stops in critical operations
                </p>
              </div>

              <div style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Space Grotesk, sans-serif' }}>
                  99.9%
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  CAPTURE EFFICIENCY
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                  Proven protection under extreme operating conditions
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, maxWidth: '800px', margin: '0 auto 2rem auto' }}>
                Results verified in transportation, mining, construction and power generation operations.
              </p>
              <Link
                href="/technologies/macrocore"
                style={{
                  display: 'inline-block',
                  background: '#FFF12D',
                  color: '#000',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  padding: '1rem 2.5rem',
                  textDecoration: 'none',
                  borderRadius: '4px',
                }}
              >
                EXPLORE MACROCORE™ →
              </Link>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {[
                { title: 'TRANSPORTATION', desc: 'Cargo, passenger and utility vehicles. Turbocharger protection and fuel consumption optimization.' },
                { title: 'HEAVY EQUIPMENT', desc: 'Excavators, mining trucks, road machinery. Defense against silica and dust in extreme environments.' },
                { title: 'POWER GENERATION', desc: 'Stationary power plants and industrial compressors. Critical airflow stability.' },
                { title: 'AGRICULTURE', desc: 'Tractors and harvesters. Service interval extension during peak demand seasons.' },
                { title: 'MINING', desc: 'Protection of large-displacement engines under massive dust and contamination conditions.' },
                { title: 'CONSTRUCTION', desc: 'Heavy machinery on 24/7 duty cycles. Resistance to mineral dust and pulsating pressures.' },
              ].map((app, idx) => (
                <div
                  key={idx}
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
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
                    {app.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '6rem 2rem', background: '#FFF12D', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#000', marginBottom: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>
              Ready to Deploy?
            </h2>
            <p style={{ fontSize: '1rem', color: '#000', marginBottom: '2rem', lineHeight: 1.6 }}>
              Identify your SKU. Cross-reference 500,000+ parts. Find your perfect air filtration solution now.
            </p>
            <a
              href="https://part-search.elimfilters.com"
              target="_blank"
              rel="noopener noreferrer"
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
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
