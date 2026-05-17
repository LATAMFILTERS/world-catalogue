'use client';

import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { catalogue, getSlug, CATEGORY_ICONS } from '@/lib/catalogue';

export default function IndustriesPage() {
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
              // INDUSTRIES
            </span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            PROTECTION FOR 12 CRITICAL INDUSTRIES
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
            ELIMFILTERS engineers filtration solutions for Agriculture, Automotive, Marine, Mining, Energy, and more. Each industry demands precision engineering tailored to its unique contamination challenges.
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {catalogue.industries.map((industry) => {
              const slug = getSlug(industry.name);
              const icon = CATEGORY_ICONS[industry.name]?.[0] || '🏭';
              return (
                <Link
                  key={industry.name}
                  href={`/industries/${slug}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.3) 100%)',
                      border: '1px solid rgba(255,241,45,0.2)',
                      borderRadius: '12px',
                      padding: '2.5rem 2rem',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,241,45,0.5)';
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, rgba(255,241,45,0.15) 0%, rgba(255,241,45,0.05) 100%)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,241,45,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,241,45,0.2)';
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.3) 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        fontSize: '3rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {icon}
                    </div>
                    <h3
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        fontFamily: 'Space Grotesk, sans-serif',
                        color: 'rgba(255,255,255,0.75)',
                        margin: '0.5rem 0 0',
                      }}
                    >
                      {industry.name.toUpperCase()}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.7)',
                        fontFamily: 'Outfit, sans-serif',
                        lineHeight: 1.5,
                        margin: '1rem 0 0',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {industry.description}
                    </p>
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255,241,45,0.1)',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          color: '#FFF12D',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          fontFamily: 'Outfit, sans-serif',
                          letterSpacing: '0.05em',
                        }}
                      >
                        EXPLORE →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
