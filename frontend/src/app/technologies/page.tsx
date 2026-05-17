'use client';

import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { catalogue, getSlug } from '@/lib/catalogue';

export default function TechnologiesPage() {
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
              // TECHNOLOGIES
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
            12 PROPRIETARY TECHNOLOGIES
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
            SYNTRAX™, AQUAGUARD™, NANOFORCE™, and 9 more proprietary filtration technologies engineered for maximum performance, efficiency, and asset protection across critical industries.
          </p>
        </div>
      </section>

      {/* Technologies Grid */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {catalogue.technologies.map((tech) => {
              const slug = getSlug(tech.name);
              return (
                <Link
                  key={tech.name}
                  href={`/technologies/${slug}`}
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
                        paddingBottom: '1rem',
                        borderBottom: '1px solid rgba(255,241,45,0.1)',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '1.4rem',
                          fontWeight: 700,
                          fontFamily: 'Space Grotesk, sans-serif',
                          color: 'rgba(255,255,255,0.75)',
                          margin: '0 0 0.5rem',
                        }}
                      >
                        {tech.title}
                      </h3>
                      {tech.subtitle && (
                        <p
                          style={{
                            fontSize: '0.9rem',
                            color: '#FFF12D',
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            margin: '0',
                          }}
                        >
                          {tech.subtitle}
                        </p>
                      )}
                    </div>

                    <p
                      style={{
                        fontSize: '0.95rem',
                        color: 'rgba(255,255,255,0.7)',
                        fontFamily: 'Outfit, sans-serif',
                        lineHeight: 1.6,
                        margin: '0',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {tech.description}
                    </p>

                    <div style={{ marginTop: 'auto' }}>
                      {tech.features.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                          }}
                        >
                          {tech.features.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.75rem',
                                background: 'rgba(255,241,45,0.1)',
                                color: '#FFF12D',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 600,
                              }}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
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
                        DISCOVER →
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
