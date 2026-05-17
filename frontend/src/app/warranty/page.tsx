'use client';

import { Navigation } from '@/components/Navigation';

export default function Warranty() {
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
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              // WARRANTY AND SUPPORT
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
            PROTECTION ENGINEERING WITH ABSOLUTE SUPPORT
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'Outfit, sans-serif',
              maxWidth: '700px',
            }}
          >
            ELIMFILTERS warranty covers equipment protection. We stand behind our engineering with comprehensive support and immediate replacement guarantee.
          </p>
        </div>
      </section>

      {/* Warranty Stats */}
      <section
        style={{
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, rgba(255,241,45,0.03) 0%, rgba(0,0,0,0.5) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              { value: '10K km', label: 'Minimum Coverage Distance' },
              { value: '1000 hrs', label: 'Minimum Coverage Hours' },
              { value: '100%', label: 'Non-Prorated' },
              { value: '24H', label: 'Response Time' },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  background: 'rgba(255,241,45,0.05)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#FFF12D',
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.75rem',
                  }}
                >
                  {stat.value}
                </div>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty Guarantees */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
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
            THREE PILLARS OF PROTECTION
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2.5rem',
            }}
          >
            {[
              {
                title: 'Direct Factory Support',
                description:
                  'Defective filters are immediately replaced at no cost. No questions asked. We handle logistics and expedited shipping to minimize downtime.',
                icon: '⚙️',
              },
              {
                title: 'Comprehensive Engine Protection',
                description:
                  'If contamination bypasses our filtration system and damages your engine, our warranty covers the cost of engine repair or replacement.',
                icon: '🛡️',
              },
              {
                title: 'Coverage Transparency',
                description:
                  'All warranties are non-prorated. Coverage remains at 100% throughout the entire warranty period. No hidden clauses or exceptions.',
                icon: '✓',
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.3) 100%)',
                  border: '1px solid rgba(255,241,45,0.2)',
                  borderRadius: '12px',
                  padding: '2.5rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,241,45,0.4)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,241,45,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,241,45,0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  {pillar.icon}
                </div>
                <h3
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '1rem',
                    color: '#FFF12D',
                  }}
                >
                  {pillar.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Outfit, sans-serif',
                    textAlign: 'justify',
                  }}
                >
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Details */}
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
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '2.5rem',
              color: '#fff',
              lineHeight: 1.2,
            }}
          >
            WHAT'S COVERED
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              'Filter element defects',
              'Housing leaks or defects',
              'Bypass valve malfunctions',
              'Contamination events',
              'Pressure differential failures',
              'Seal failures',
              'Manufacturing defects',
              'Premature media saturation',
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '1.5rem',
                    color: '#FFF12D',
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
                <span
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {item}
                </span>
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
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1.5rem',
              color: '#000',
              lineHeight: 1.2,
            }}
          >
            REQUEST TECHNICAL VALIDATION
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              marginBottom: '2rem',
              color: '#000',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.6,
            }}
          >
            Need to validate your equipment against our warranty coverage? Our technical team is ready to help.
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-block',
              background: '#000',
              color: '#FFF12D',
              padding: '0.875rem 2rem',
              fontFamily: 'Outfit, sans-serif',
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
            CONTACT SUPPORT
          </a>
        </div>
      </section>
    </main>
  );
}
