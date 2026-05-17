'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { catalogue, getSlug } from '@/lib/catalogue';

// Map industry names to image paths
const industryImages: Record<string, string> = {
  'Agriculture': '/images/agriculture-2_converted.avif',
  'Automotive': '/images/autos-02.avif',
  'Bus Coach': '/images/bus-hero.avif',
  'Waste Municipal': '/images/wasted.avif',
  // Add more images as provided
};

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
              const hasImage = industryImages[industry.name];
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
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      height: '300px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.3) 100%)',
                      border: '1px solid rgba(255,241,45,0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,241,45,0.5)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,241,45,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,241,45,0.2)';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {hasImage ? (
                      <Image
                        src={hasImage}
                        alt={industry.name}
                        fill
                        style={{
                          objectFit: 'cover',
                          zIndex: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, rgba(255,241,45,0.1) 0%, rgba(0,0,0,0.5) 100%)',
                          zIndex: 0,
                        }}
                      />
                    )}

                    {/* Gradient overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)',
                        zIndex: 1,
                      }}
                    />

                    {/* Content */}
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        width: '100%',
                        padding: '2rem',
                        textAlign: 'center',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          fontFamily: 'Space Grotesk, sans-serif',
                          color: 'rgba(255,255,255,0.75)',
                          margin: '0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {industry.name}
                      </h3>
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
