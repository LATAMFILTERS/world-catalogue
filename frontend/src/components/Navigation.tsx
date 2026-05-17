'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(0,0,0,0.95)'
          : 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <Image
            src="/assets/logo-elimfilters.png"
            alt="ELIMFILTERS"
            width={36}
            height={36}
            style={{ objectFit: 'contain' }}
          />
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: '1.1rem',
              letterSpacing: '0.12em',
              color: '#ffffff',
            }}
          >
            ELIMFILTERS
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="hidden-mobile">
          <NavLink href="/industries/agriculture">Industries</NavLink>
          <NavLink href="/products/airfilter">Products</NavLink>
          <NavLink href="/technologies/syntrax">Technologies</NavLink>
          <a
            href="https://part-search.elimfilters.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#FFF12D',
              color: '#000',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              padding: '0.5rem 1.25rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 24px rgba(255,241,45,0.5)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            FIND MY FILTER
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'none',
          }}
          className="show-mobile"
          aria-label="Toggle menu"
        >
          <div style={{ width: '24px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  height: '2px',
                  background: '#FFF12D',
                  transition: 'all 0.3s ease',
                  transformOrigin: 'center',
                  transform:
                    menuOpen && i === 0
                      ? 'rotate(45deg) translateY(7px)'
                      : menuOpen && i === 1
                      ? 'scaleX(0)'
                      : menuOpen && i === 2
                      ? 'rotate(-45deg) translateY(-7px)'
                      : 'none',
                }}
              />
            ))}
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: 'rgba(0,0,0,0.98)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <Link href="/industries/agriculture" style={mobileLinkStyle} onClick={() => setMenuOpen(false)}>
            Industries
          </Link>
          <Link href="/products/airfilter" style={mobileLinkStyle} onClick={() => setMenuOpen(false)}>
            Products
          </Link>
          <Link href="/technologies/syntrax" style={mobileLinkStyle} onClick={() => setMenuOpen(false)}>
            Technologies
          </Link>
          <a
            href="https://part-search.elimfilters.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...mobileLinkStyle,
              color: '#FFF12D',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            FIND MY FILTER →
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        color: 'rgba(255,255,255,0.75)',
        textDecoration: 'none',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.05em',
        transition: 'color 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
    >
      {children}
    </Link>
  );
}

const mobileLinkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.85)',
  textDecoration: 'none',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem',
  fontWeight: 500,
};
