'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ZoomParallax } from '@/components/ui/zoom-parallax';

// ── 7 industries mapped to their best available images ──────────────────────
const INDUSTRIES = [
  { slug: 'mining',           label: 'Mining',            src: '/images/construccion.avif' },
  { slug: 'agriculture',      label: 'Agriculture',       src: '/images/agriculture.avif' },
  { slug: 'oil-gas',          label: 'Oil & Gas',         src: '/images/oil&gas.avif' },
  { slug: 'marine',           label: 'Marine',            src: '/images/marine-hero.avif' },
  { slug: 'power-generation', label: 'Power Generation',  src: '/images/turbinas-hero.avif' },
  { slug: 'heavy-transport',  label: 'Heavy Transport',   src: '/images/trucks-1.avif' },
  { slug: 'construction',     label: 'Construction',      src: '/images/chino-construction.avif' },
];

export default function IndustriesPage() {
  // Smooth scroll using native CSS — no extra library needed on this page
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  return (
    <main style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>

      {/* ── Structured Data ─────────────────────────────────────────── */}
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
              item: {
                '@type': 'Thing',
                name: ind.label,
                url: `https://elimfilters.com/industries/${ind.slug}`,
              },
            })),
          }),
        }}
      />

      {/* ── Back button ─────────────────────────────────────────────── */}
      <Link
        href="/"
        style={{
          position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
          borderRadius: '4px', padding: '0.45rem 1rem',
          fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.72rem',
          letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        HOME
      </Link>

      {/* ── Intro heading — minimal, full screen ─────────────────────── */}
      <section
        style={{
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 2rem',
        }}
      >
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#fff',
            maxWidth: '700px',
            margin: 0,
          }}
        >
          Industries We Serve
        </h1>
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 400,
            fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
            color: 'rgba(255,255,255,0.45)',
            marginTop: '1.25rem',
            maxWidth: '520px',
          }}
        >
          Scroll to explore the sectors where contamination control determines asset life.
        </p>
      </section>

      {/* ── Zoom Parallax — 7 industries ────────────────────────────── */}
      <ZoomParallax images={INDUSTRIES} />

      {/* ── Footer spacing ───────────────────────────────────────────── */}
      <div style={{ height: '20vh' }} />
    </main>
  );
}
