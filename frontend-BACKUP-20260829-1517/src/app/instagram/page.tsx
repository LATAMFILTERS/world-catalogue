'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

const LINKS_CONFIG = [
  { labelKey: 'instagram.link1Label', descKey: 'instagram.link1Desc', href: 'https://part-search.elimfilters.com', external: true, primary: true },
  { labelKey: 'instagram.link2Label', descKey: 'instagram.link2Desc', href: '/distributors', external: false, primary: false },
  { labelKey: 'instagram.link3Label', descKey: 'instagram.link3Desc', href: '/contact', external: false, primary: false },
  { labelKey: 'instagram.link4Label', descKey: 'instagram.link4Desc', href: '/', external: false, primary: false },
];

export default function InstagramLandingPage() {
  const { t } = useTranslation();
  return (
    <main style={{ minHeight: '100svh', background: '#050505', color: '#fff', padding: '24px 18px 40px', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', padding: '2px 8px 26px' }}>
          <img
            src="/assets/Elimfilters_logo_oficial.avif"
            alt="ELIMFILTERS — Total Asset Protection"
            width={1959}
            height={528}
            style={{ display: 'block', width: 'min(190px, 62vw)', height: 'auto', margin: '16px auto 28px' }}
          />
          <h1 style={{ margin: '0 0 10px', fontFamily: 'Titillium Web, Arial, sans-serif', fontSize: 'clamp(2rem, 9vw, 3.1rem)', lineHeight: 1, fontWeight: 800, letterSpacing: '-0.04em' }}>{t('instagram.heroTitle')}</h1>
          <p style={{ maxWidth: 420, margin: '0 auto', color: 'rgba(255,255,255,0.62)', fontSize: 15, lineHeight: 1.55 }}>{t('instagram.heroDesc')}</p>
        </header>

        <section aria-label="ELIMFILTERS links" style={{ display: 'grid', gap: 12 }}>
          {LINKS_CONFIG.map((link) => (
            <a key={link.labelKey} href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 78, padding: '16px 18px', borderRadius: 14, border: link.primary ? '1px solid #FFF12D' : '1px solid rgba(255,255,255,0.12)', background: link.primary ? '#FFF12D' : '#111', color: link.primary ? '#000' : '#fff', textDecoration: 'none', boxShadow: link.primary ? '0 10px 30px rgba(255,241,45,0.12)' : 'none' }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: 'Titillium Web, Arial, sans-serif', fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>{t(link.labelKey)}</span>
                <span style={{ display: 'block', marginTop: 5, color: link.primary ? 'rgba(0,0,0,0.62)' : 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.4 }}>{t(link.descKey)}</span>
              </span>
              <span aria-hidden="true" style={{ flex: '0 0 auto', width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', background: link.primary ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)', fontSize: 18 }}>→</span>
            </a>
          ))}
        </section>

        <footer style={{ padding: '26px 12px 0', textAlign: 'center', color: 'rgba(255,255,255,0.34)', fontSize: 11, lineHeight: 1.5 }}>{t('instagram.footerText')}</footer>
      </div>
    </main>
  );
}
