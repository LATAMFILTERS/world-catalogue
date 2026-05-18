'use client';

import Link from 'next/link';

export function CabinPage() {
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
            backgroundImage: 'url(/images/cabin-hero.avif)',
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
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
                // CABIN AIR FILTRATION
              </span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                fontWeight: 900,
                fontFamily: 'Montserrat, sans-serif',
                marginBottom: '1rem',
                lineHeight: 1.1,
              }}
            >
              CABIN FILTERS
            </h1>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                color: '#FFF12D',
                marginBottom: '2rem',
              }}
            >
              OCCUPATIONAL HEALTH PROTECTION
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                maxWidth: '600px',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.65)',
                fontFamily: 'Inter, sans-serif',
                fontStyle: 'italic',
              }}
            >
              Multi-stage 6-layer filtration engineered to protect operators in industrial cabins. Removes 99.9% of soot, allergens and fine particulate matter with OEM geometry for precision fit.
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
                    CABIN FILTERS — MULTI-LAYER MEDIA
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
                  Total Operator Environment Protection
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
                  ELIMFILTERS cabin filters deploy a progressive 6-layer filtration matrix to intercept fine dust, pollen, soot, bacteria and volatile organic compounds before they reach the operator. Each unit is geometry-matched to OEM specifications to guarantee a sealed fit and full airflow coverage — no bypass, no gaps.
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
                      LAYERS
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      6-Stage Media
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      FIT
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      OEM Geometry
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      EFFICIENCY
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      99.9% Capture
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
                  src="/images/filtro-de-cabina.avif"
                  alt="Cabin Air Filter"
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
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  99.9%
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  PARTICULATE CAPTURE RATE
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Soot, allergens and fine dust blocked before entering the cabin
                </p>
              </div>

              <div style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  6
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  FILTRATION LAYERS
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Progressive density stages targeting progressively smaller contaminants
                </p>
              </div>

              <div style={{ border: '1px solid rgba(255,241,45,0.2)', borderRadius: '12px', padding: '2.5rem', background: '#000' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF12D', margin: '0 0 1rem 0', fontFamily: 'Montserrat, sans-serif' }}>
                  OEM
                </h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  GEOMETRY-MATCHED FIT
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                  Zero-bypass seal verified across 500,000+ vehicle cross-references
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', lineHeight: 1.65, maxWidth: '800px', margin: '0 auto 2rem auto' }}>
                Results verified in heavy equipment, agricultural machinery, mining vehicles and commercial transport cabins.
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {[
                { title: 'AGRICULTURE', desc: 'Tractors and harvesters operating in high-dust seasonal environments. Protects operators from pollen, silica dust and agrochemical particulates.' },
                { title: 'MINING', desc: 'Excavators and drilling equipment in extreme dust conditions. Blocks silica, coal dust and heavy metal particles from entering the cabin.' },
                { title: 'CONSTRUCTION', desc: 'Bulldozers, cranes and earthmovers on 24/7 duty cycles. Sustained cabin air quality under continuous mineral dust exposure.' },
                { title: 'HEAVY TRANSPORT', desc: 'Long-haul trucks and fleet vehicles. Guards driver health against diesel soot, road dust and airborne contaminants.' },
                { title: 'MARINE', desc: 'Vessel bridge and engine room cabins. Removes salt aerosols, fuel vapors and marine particulates from crew environments.' },
                { title: 'POWER GENERATION', desc: 'Stationary engine control rooms and generator cabins. Maintains clean air in confined operational spaces.' },
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
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
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
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#000', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif' }}>
              Ready to Deploy?
            </h2>
            <p style={{ fontSize: '1rem', color: '#000', marginBottom: '2rem', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
              Identify your SKU. Cross-reference 500,000+ parts. Find your cabin air filtration solution now.
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
