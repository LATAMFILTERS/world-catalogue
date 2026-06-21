'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const INDUSTRIES = [
  { slug: 'mining',           label: 'Mining',            src: '/images/construccion.avif' },
  { slug: 'agriculture',      label: 'Agriculture',       src: '/images/agriculture-2_converted.avif' },
  { slug: 'oil-gas',          label: 'Oil & Gas',         src: '/images/oil&gas.avif' },
  { slug: 'marine',           label: 'Marine',            src: '/images/marine-hero.avif' },
  { slug: 'power-generation', label: 'Power Generation',  src: '/images/turbinas-hero.avif' },
  { slug: 'heavy-transport',  label: 'Heavy Transport',   src: '/images/trucks-1.avif' },
  { slug: 'construction',     label: 'Construction',      src: '/images/chino-construction.avif' },
  { slug: 'automotive',       label: 'Automotive',        src: '/images/camionroto.avif' },
  { slug: 'bus-coach',        label: 'Bus & Coach',       src: '/images/bus-hero.avif' },
  { slug: 'manufacturing',    label: 'Manufacturing',     src: '/images/manufacture.avif' },
  { slug: 'railway',          label: 'Railway',           src: '/images/turbina-instalada.avif' },
  { slug: 'waste-municipal',  label: 'Waste & Municipal', src: '/images/wasted.avif' },
];

export default function IndustriesPage() {
  return (
    <main style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'ELIMFILTERS Industrial Sectors',
            url: 'https://elimfilters.com/industries/',
            numberOfItems: INDUSTRIES.length,
            itemListElement: INDUSTRIES.map((ind, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: { '@type': 'Thing', name: ind.label, url: `https://elimfilters.com/industries/${ind.slug}` },
            })),
          }),
        }}
      />

      <Navigation />

      {/* Hero */}
      <section style={{
        paddingTop: '140px',
        paddingBottom: '60px',
        textAlign: 'center',
        padding: '140px 2rem 60px',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#fff',
            margin: '0 auto 1rem',
            maxWidth: '700px',
          }}
        >
          Industries We Serve
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}
        >
          Contamination control solutions engineered for the specific demands of each industrial sector.
        </motion.p>
      </section>

      {/* Grid */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5px',
        }}>
          {INDUSTRIES.map((industry, i) => (
            <motion.div
              key={industry.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link
                href={`/industries/${industry.slug}`}
                style={{ display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}
                onMouseEnter={e => {
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                  const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement;
                  if (img) img.style.transform = 'scale(1.06)';
                  if (overlay) overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)';
                }}
                onMouseLeave={e => {
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                  const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement;
                  if (img) img.style.transform = 'scale(1)';
                  if (overlay) overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)';
                }}
              >
                <img
                  src={industry.src}
                  alt={industry.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s ease',
                  }}
                />
                <div
                  className="overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
                    transition: 'background 0.3s ease',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '1.2rem',
                  left: '1.2rem',
                  right: '1.2rem',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#fff',
                  }}>
                    {industry.label}
                  </span>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.15em',
                    color: '#FFF12D',
                    textTransform: 'uppercase',
                  }}>
                    EXPLORE →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
