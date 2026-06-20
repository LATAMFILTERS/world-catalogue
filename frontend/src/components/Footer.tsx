'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import '@/i18n';
import { useTranslation } from 'react-i18next';

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/elimfilters', letter: 'in' },
  { label: 'Instagram', href: 'https://www.instagram.com/elimfilters.global', letter: 'Ig' },
  { label: 'YouTube', href: 'https://www.youtube.com/@elimfilters9112', letter: 'Yt' },
];

export function Footer() {
  const { t } = useTranslation();

  const NAV_COLUMNS = [
    {
      title: t('footer.company', 'COMPANY'),
      links: [
        { label: t('footer.about', 'About Us'), href: '/about', external: false },
        { label: t('footer.industries', 'Industries'), href: '/industries', external: false },
        { label: t('footer.contact', 'Contact'), href: '/contact', external: false },
      ],
    },
    {
      title: t('footer.colProducts', 'PRODUCTS'),
      links: [
        { label: t('footer.partSearch', 'Part Search'), href: 'https://part-search.elimfilters.com/', external: true },
        { label: t('footer.technologies', 'Technologies'), href: '/technologies', external: false },
        { label: t('footer.systems', 'Systems'), href: '/systems', external: false },
      ],
    },
    {
      title: t('footer.support', 'SUPPORT'),
      links: [
        { label: t('footer.technical', 'Technical Support'), href: '/contact', external: false },
        { label: t('footer.dealer', 'Become a Dealer'), href: '/distributor-application', external: false },
        { label: t('footer.warranty', 'Warranty'), href: '/warranty', external: false },
      ],
    },
    {
      title: t('footer.colKnowledge', 'KNOWLEDGE'),
      links: [
        { label: t('footer.knowledgeSystem', 'Knowledge System'), href: '/knowledge-system', external: false },
        { label: t('footer.standards', 'Standards'), href: '/knowledge-system/standards', external: false },
        { label: t('footer.fleetOpt', 'Fleet Optimization'), href: '/knowledge-system/fleet', external: false },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Terms of Service', href: '/legal/terms', external: false },
        { label: 'Privacy Policy', href: '/legal/privacy', external: false },
        { label: 'AI Use Policy', href: '/legal/ai-policy', external: false },
        { label: 'Copyright & DMCA Policy', href: '/legal/copyright', external: false },
        { label: 'Cross Reference Policy', href: '/legal/cross-reference', external: false },
        { label: 'Legal Disclaimer', href: '/legal/disclaimer', external: false },
      ],
    },
  ];

  return (
    <footer
      style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '60px 0 0',
      }}
    >
      {/* ── TOP: Nav columns (5 cols, LEGAL is the last) ── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 clamp(1.25rem, 5vw, 40px)',
        }}
      >
        <div className="footer-nav-grid">
          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  marginBottom: '24px',
                }}
              >
                {col.title}
              </div>
              {col.links.map((link) =>
                link.external ? (
                  <motion.div
                    key={link.label}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{ marginBottom: '14px' }}
                  >
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={linkStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
                    >
                      {link.label}
                    </a>
                  </motion.div>
                ) : (
                  <motion.div
                    key={link.label}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{ marginBottom: '14px' }}
                  >
                    <Link
                      href={link.href}
                      style={linkStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM: Social + Kleo centered ── */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: '48px',
          padding: '32px clamp(1.25rem, 5vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Social icons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {SOCIAL.map((s) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={s.label}
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#888',
                textDecoration: 'none',
                fontSize: '10px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.5px',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FFF12D';
                e.currentTarget.style.color = '#FFF12D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.color = '#888';
              }}
            >
              {s.letter}
            </motion.a>
          ))}
        </div>

        {/* Kleo logo */}
        <motion.div whileHover={{ opacity: 0.9 }} transition={{ duration: 0.3 }}>
          <img
            src="/images/KLEO-TECHNOLOGY-fn.avif"
            alt="Kleo Technologies"
            style={{ maxHeight: '44px', maxWidth: '140px', objectFit: 'contain', display: 'block' }}
          />
        </motion.div>

        {/* Address + copyright */}
        <div style={{ textAlign: 'center', lineHeight: 1.6 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', color: '#999', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {t('footer.locationText', 'Frisco, Texas')}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', color: '#777', letterSpacing: '0.5px', marginTop: '4px' }}>
            {t('footer.kleoText', '© 2015–2026 Kleo Technologies')}
          </div>
        </div>
      </div>
    </footer>
  );
}

const linkStyle: React.CSSProperties = {
  fontSize: '14px',
  textDecoration: 'none',
  color: '#888',
  display: 'block',
  fontFamily: 'Barlow, sans-serif',
  transition: 'color 0.25s ease',
};
