'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { catalogue, getSlug } from '@/lib/catalogue';

const displayNames: Record<string, string> = {
  'Airfilter': 'Air Filter',
  'Aquaguard Series': 'Aquaguard Filter',
  'Cabin': 'Cabin Filter',
  'Coolant': 'Coolant Filter',
  'Dryer': 'Air Dryer',
  'Fuel': 'Fuel Filter',
  'Housing': 'Housing Filter',
  'Hydraulic': 'Hydraulic Filter',
  'Kits': 'Filter Kits',
  'Marine': 'Marine Filter',
  'Oil': 'Oil Filter',
  'Water': 'Fuel Separator',
};

const productImages: Record<string, string> = {
  'Airfilter': '/images/air-filterld.avif',
  'Aquaguard Series': '/images/turbinas-hero.avif',
  'Cabin': '/images/cabin-hero.avif',
  'Coolant': '/images/coolant-hero.avif',
  'Dryer': '/images/airdryer-hero.avif',
  'Fuel': '/images/fuel-filter.avif',
  'Housing': '/images/pelon-air_converted.avif',
  'Hydraulic': '/images/hidraulic.avif',
  'Kits': '/images/npr-01_converted.avif',
  'Marine': '/images/marino-taller.avif',
  'Oil': '/images/oil-instalado.avif',
  'Water': '/images/fuelseparator.avif',
};

export default function SystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Navigation />

      {/* Hero Section */}
      <section
        style={{
          marginTop: '72px',
          paddingTop: '4rem',
          paddingBottom: '4rem',
          backgroundImage: 'url(/images/system-hero.avif)',
          backgroundSize: 'cover',
          backgroundPosition: '50% 30%',
          backgroundAttachment: 'fixed',
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
            zIndex: 1,
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
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
              // SYSTEMS
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
            12 ENGINEERED FILTRATION SYSTEMS
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
            Air, Fuel, Hydraulic, Oil, Cabin, Water, Coolant, and more. Each system engineered with Asset Protection Technology for maximum performance and reliability.
          </p>
        </div>
      </section>

      {/* Systems Grid */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {catalogue.products.map((product) => {
              const slug = getSlug(product.name);
              return (
                <Link
                  key={product.name}
                  href={`/products/${slug}`}
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
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
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
                    {/* Product image */}
                    <div style={{ position: 'relative', width: '100%', height: '200px', flexShrink: 0, background: '#0a0a0a' }}>
                      {productImages[product.name] ? (
                        <Image
                          src={productImages[product.name]}
                          alt={displayNames[product.name] || product.name}
                          fill
                          style={{ objectFit: 'contain', padding: '0.5rem' }}
                          sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'rgba(255,241,45,0.05)' }} />
                      )}
                    </div>

                    {/* Title + CTA */}
                    <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
                      <h3
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          fontFamily: 'Space Grotesk, sans-serif',
                          color: 'rgba(255,255,255,0.9)',
                          margin: '0 0 0.35rem',
                        }}
                      >
                        {displayNames[product.name] || product.name}
                      </h3>
                      {product.subtitle && (
                        <p
                          style={{
                            fontSize: '0.8rem',
                            color: '#FFF12D',
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            margin: '0',
                          }}
                        >
                          {product.subtitle}
                        </p>
                      )}
                      <span
                        style={{
                          display: 'inline-block',
                          color: '#FFF12D',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          fontFamily: 'Outfit, sans-serif',
                          letterSpacing: '0.05em',
                          marginTop: 'auto',
                          paddingTop: '0.5rem',
                        }}
                      >
                        LEARN MORE →
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
