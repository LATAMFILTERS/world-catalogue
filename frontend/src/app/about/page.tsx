'use client';

import { Navigation } from '@/components/Navigation';

export default function About() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Navigation />

      {/* Hero Section */}
      <section
        style={{
          marginTop: '72px',
          paddingTop: '4rem',
          paddingBottom: '4rem',
          background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, rgba(0,0,0,0.8) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ marginBottom: '3rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#FFF12D',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              // ABOUT ELIMFILTERS
            </span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1rem',
              lineHeight: 1.1,
            }}
          >
            ENGINEERING OF CERTAINTY
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 400,
              fontFamily: 'Inter, sans-serif',
              color: '#FFF12D',
              marginBottom: '2rem',
              maxWidth: '600px',
            }}
          >
            Asset Protection Engineering Company
          </p>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'Inter, sans-serif',
              maxWidth: '700px',
            }}
          >
            ELIMFILTERS specializes in protecting critical assets through advanced filtration engineering. We design systems that prevent contamination before it damages.
          </p>
        </div>
      </section>

      {/* Risk First Philosophy */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 900,
                  fontFamily: 'Space Grotesk, sans-serif',
                  marginBottom: '1.5rem',
                  lineHeight: 1.2,
                }}
              >
                RISK FIRST.
                <br />
                ALWAYS.
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: '1.5rem',
                }}
              >
                Every ELIMFILTERS system is engineered with one core principle: protect against catastrophic failure first, optimize efficiency second. We believe that in industrial filtration, certainty isn't optional—it's mandatory.
              </p>
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Our Asset Protection Technology combines AI-formulated hybrid media, hydrophobic separation systems, and anti-bypass structures to eliminate contamination events before they happen.
              </p>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255,241,45,0.1) 0%, rgba(255,241,45,0.02) 100%)',
                border: '1px solid rgba(255,241,45,0.2)',
                borderRadius: '12px',
                padding: '2.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    fontSize: '3.5rem',
                    fontWeight: 900,
                    color: '#FFF12D',
                    fontFamily: 'DM Sans, sans-serif',
                    marginBottom: '0.5rem',
                  }}
                >
                  99.9%
                </div>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Media Efficiency Rating
                </p>
              </div>

              <div
                style={{
                  borderTop: '1px solid rgba(255,241,45,0.2)',
                  paddingTop: '2rem',
                  marginTop: '2rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  All ELIMFILTERS systems undergo rigorous testing and validation before deployment. We guarantee certainty through engineering.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why ELIMFILTERS */}
      <section
        style={{
          padding: '5rem 2rem',
          background: 'linear-gradient(135deg, rgba(255,241,45,0.03) 0%, rgba(0,0,0,0.5) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '3rem',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            PROVEN PROTECTION. EVERY TIME.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                title: 'Asset Protection Technology',
                description:
                  'Proprietary systems designed to eliminate contamination events before they damage critical equipment.',
              },
              {
                title: 'AI-Formulated Media',
                description:
                  'Hybrid filtration media engineered using mathematical algorithms and proven in 10,000+ lab scenarios.',
              },
              {
                title: 'Global Engineering',
                description:
                  'Headquartered in Frisco, Texas with operations across North America, Latin America, and beyond.',
              },
              {
                title: 'Industry Expertise',
                description:
                  'Serving Agriculture, Mining, Marine, Aerospace, Automotive, and 7 additional industrial verticals.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '2rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                  e.currentTarget.style.background = 'rgba(255,241,45,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontFamily: 'DM Sans, sans-serif',
                    marginBottom: '1rem',
                    color: '#FFF12D',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '4rem 2rem',
          background: '#FFF12D',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 900,
              fontFamily: 'DM Sans, sans-serif',
              marginBottom: '1.5rem',
              color: '#000',
              lineHeight: 1.2,
            }}
          >
            READY TO PROTECT YOUR ASSETS?
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              marginBottom: '2rem',
              color: '#000',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
            }}
          >
            Contact our engineering team to discuss your filtration requirements and discover how ELIMFILTERS protects critical assets.
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-block',
              background: '#000',
              color: '#FFF12D',
              padding: '0.875rem 2rem',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textDecoration: 'none',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            CONTACT US
          </a>
        </div>
      </section>
    </main>
  );
}
