'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import '@/i18n';
import { useTranslation } from 'react-i18next';

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/133064152/', letter: 'in' },
  { label: 'Facebook', href: 'https://www.facebook.com/elimfilters/', letter: 'Fb' },
  { label: 'Instagram', href: 'https://www.instagram.com/elimfilters.global', letter: 'Ig' },
  { label: 'X', href: 'https://x.com/elimfilters', letter: 'X' },
  { label: 'YouTube', href: 'https://www.youtube.com/@elimfilters9112', letter: 'Yt' },
];

const NAV_COLUMNS = [
  {
    title: 'COMPANY',
    links: [
      { label: 'About Us', href: '/about', external: false },
      { label: 'Industries', href: '/industries', external: false },
      { label: 'Protection Systems', href: '/systems', external: false },
      { label: 'Distributors', href: '/distributors', external: false },
      { label: 'Contact', href: '/contact', external: false },
    ],
  },
  {
    title: 'PRODUCTS',
    links: [
      { label: 'Protection Systems', href: '/systems', external: false },
      { label: 'Product Families', href: '/families', external: false },
      { label: 'Part Search', href: 'https://part-search.elimfilters.com/', external: true },
      { label: 'Technologies', href: '/technologies', external: false },
    ],
  },
  {
    title: 'SUPPORT',
    links: [
      { label: 'Technical Support', href: '/contact', external: false },
      { label: 'Knowledge System', href: '/knowledge-system', external: false },
      { label: 'Standards Library', href: '/knowledge-system/standards', external: false },
      { label: 'Fleet Optimization', href: '/knowledge-system/fleet', external: false },
    ],
  },
  {
    title: 'KNOWLEDGE',
    links: [
      { label: 'Contamination', href: '/knowledge-system/contamination', external: false },
      { label: 'Compare & Select', href: '/knowledge-system/compare', external: false },
      { label: 'Filtration Science', href: '/knowledge-system/science', external: false },
      { label: 'Industrial Bridges', href: '/knowledge-system/bridges', external: false },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Terms of Service', href: '/legal/terms', external: false },
      { label: 'Privacy Policy', href: '/legal/privacy', external: false },
      { label: 'AI Use Policy', href: '/legal/ai-policy', external: false },
      { label: 'Copyright & DMCA', href: '/legal/copyright', external: false },
      { label: 'Cross Reference Policy', href: '/legal/cross-reference', external: false },
      { label: 'Legal Disclaimer', href: '/legal/disclaimer', external: false },
    ],
  },
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

      {/* ── MAIN BODY ── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px clamp(1.25rem, 5vw, 48px) 0' }}>
        <div className="footer-main-grid">

          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Logo */}
            <div>
              <img
                src="/images/KLEO-TECHNOLOGY-fn.avif"
                alt="Kleo Technologies"
                style={{ maxHeight: '40px', maxWidth: '130px', objectFit: 'contain', display: 'block' }}
              />
            </div>

            {/* Tagline */}
            <p style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.7,
              maxWidth: '220px',
              margin: 0,
            }}>
              {t('footer.tagline', 'Asset protection through industrial contamination control.')}
            </p>

            {/* Contact details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '✉', text: 'info@elimfilters.com', href: 'mailto:info@elimfilters.com' },
                { icon: '◎', text: 'Frisco, Texas — United States', href: null },
                { icon: '◎', text: 'Caracas, Distrito Capital — Venezuela', href: null },
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,241,45,0.4)', flexShrink: 0 }}>{item.icon}</span>
                  {item.href ? (
                    <a href={item.href} style={{
                      fontFamily: 'Barlow, sans-serif', fontSize: '12px',
                      color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#FFF12D')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                      {item.text}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {SOCIAL.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    width: '34px', height: '34px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.35)',
                    textDecoration: 'none',
                    fontSize: '10px',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, letterSpacing: '0.5px',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FFF12D';
                    e.currentTarget.style.color = '#FFF12D';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                  }}
                >
                  {s.letter}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: '11px',
                color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase', letterSpacing: '2.5px',
                marginBottom: '20px',
              }}>
                {col.title}
              </div>
              {col.links.map((link) =>
                link.external ? (
                  <div key={link.label} style={{ marginBottom: '12px' }}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={linkStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                    >
                      {link.label}
                    </a>
                  </div>
                ) : (
                  <div key={link.label} style={{ marginBottom: '12px' }}>
                    <Link
                      href={link.href}
                      style={linkStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                    >
                      {link.label}
                    </Link>
                  </div>
                )
              )}
            </div>
          ))}

        </div>
      </div>

      {/* ── LEGAL BAR ── */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: '28px clamp(1.25rem, 5vw, 48px)',
        marginTop: '48px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between',
        gap: '8px 24px',
      }}>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2px' }}>
          © 2015–2026 Kleo Technologies LLC · ELIMFILTERS® is a registered trademark. All rights reserved.
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>
          Kleo Technologies LLC · Frisco, Texas · Caracas, Venezuela · info@elimfilters.com
        </span>
      </div>

    </footer>
  );
}

const linkStyle: React.CSSProperties = {
  fontSize: '13px',
  textDecoration: 'none',
  color: 'rgba(255,255,255,0.4)',
  display: 'block',
  fontFamily: 'Barlow, sans-serif',
  lineHeight: 1.5,
  transition: 'color 0.2s ease',
};
