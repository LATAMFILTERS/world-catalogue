'use client';

import Link from 'next/link';
import Image from 'next/image';
import { catalogue, getSlug } from '@/lib/catalogue';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: '#000',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '4rem 2rem 2rem',
      }}
    >
      <style>{`
        .footer-link {
          font-family: Inter, sans-serif;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-link:hover { color: #FFF12D; }
        .footer-cta {
          display: inline-block;
          background: #FFF12D;
          color: #000;
          font-family: Montserrat, sans-serif;
          font-weight: 700;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          transition: all 0.2s ease;
          margin-bottom: 1rem;
        }
        .footer-cta:hover {
          box-shadow: 0 0 20px rgba(255,241,45,0.4);
          transform: translateY(-1px);
        }
      `}</style>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Top grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Image
                src="/assets/logo-elimfilters.png"
                alt="ELIMFILTERS"
                width={32}
                height={32}
                style={{ objectFit: 'contain' }}
              />
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900,
                  fontSize: '1rem',
                  letterSpacing: '0.12em',
                  color: '#fff',
                }}
              >
                ELIMFILTERS
              </span>
            </div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.35)',
                lineHeight: 1.7,
                maxWidth: '240px',
              }}
            >
              Industrial-grade filtration systems engineered for maximum performance across every sector.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  color: '#FFF12D',
                  opacity: 0.6,
                }}
              >
                GERMAN ENGINEERING
              </span>
            </div>
          </div>

          {/* Industries */}
          <div>
            <h4 style={sectionHeadingStyle}>Industries</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {catalogue.industries.slice(0, 6).map((item) => (
                <li key={item.name}>
                  <Link href={`/industries/${getSlug(item.name)}/`} className="footer-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 style={sectionHeadingStyle}>Products</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {catalogue.products.slice(0, 6).map((item) => (
                <li key={item.name}>
                  <Link href={`/products/${getSlug(item.name)}/`} className="footer-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Technologies */}
          <div>
            <h4 style={sectionHeadingStyle}>Technologies</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {catalogue.technologies.slice(0, 6).map((item) => (
                <li key={item.name}>
                  <Link href={`/technologies/${getSlug(item.name)}/`} className="footer-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 style={sectionHeadingStyle}>Part Search</h4>
            <a
              href="https://part-search.elimfilters.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-cta"
            >
              FIND MY FILTER
            </a>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.25)',
                lineHeight: 1.6,
              }}
            >
              Cross-reference 500K+ parts across all major OEMs
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <p style={monoSmallStyle}>
              © {year} ELIMFILTERS. ALL RIGHTS RESERVED.
            </p>
            <p style={monoSmallStyle}>
              INDUSTRIAL FILTRATION · WORLD CATALOGUE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 700,
  fontSize: '0.72rem',
  letterSpacing: '0.15em',
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase',
  marginBottom: '1.25rem',
};

const monoSmallStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '0.62rem',
  letterSpacing: '0.1em',
  color: 'rgba(255,255,255,0.2)',
};
