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

const getFooterNavigation = (t: any) => [
  {
    title: t('footer.company', 'COMPANY'),
    links: [
      { label: t('footer.aboutUs', 'About Us'), href: '/about', external: false },
      { label: t('footer.philosophy', 'Our Philosophy'), href: '/about/philosophy', external: false },
      { label: t('footer.industries', 'Industries'), href: '/industries', external: false },
      { label: t('footer.protectionSystems', 'Protection Systems'), href: '/systems', external: false },
      { label: t('footer.distributors', 'Distributors'), href: '/distributors', external: false },
      { label: t('footer.contact', 'Contact'), href: '/contact', external: false },
    ],
  },
  {
    title: t('footer.products', 'PRODUCTS'),
    links: [
      { label: t('footer.protectionSystems', 'Protection Systems'), href: '/systems', external: false },
      { label: t('footer.productFamilies', 'Product Families'), href: '/families', external: false },
      { label: t('footer.partSearch', 'Part Search'), href: 'https://part-search.elimfilters.com/', external: true },
      { label: t('footer.technologies', 'Technologies'), href: '/technologies', external: false },
    ],
  },
  {
    title: t('footer.support', 'SUPPORT'),
    links: [
      { label: t('footer.technicalSupport', 'Technical Support'), href: '/contact', external: false },
      { label: t('footer.knowledgeSystem', 'Knowledge System'), href: '/knowledge-system', external: false },
      { label: t('footer.standardsLibrary', 'Standards Library'), href: '/knowledge-system/standards', external: false },
      { label: t('footer.fleetOptimization', 'Fleet Optimization'), href: '/knowledge-system/fleet', external: false },
    ],
  },
  {
    title: t('footer.knowledge', 'KNOWLEDGE'),
    links: [
      { label: t('footer.contamination', 'Contamination'), href: '/knowledge-system/contamination', external: false },
      { label: t('footer.compareSelect', 'Compare & Select'), href: '/knowledge-system/compare', external: false },
      { label: t('footer.filtrationScience', 'Filtration Science'), href: '/knowledge-system/science', external: false },
      { label: t('footer.industrialBridges', 'Industrial Bridges'), href: '/knowledge-system/bridges', external: false },
    ],
  },
  {
    title: t('footer.legal', 'LEGAL'),
    links: [
      { label: t('footer.termsOfService', 'Terms of Service'), href: '/legal/terms', external: false },
      { label: t('footer.privacyPolicy', 'Privacy Policy'), href: '/legal/privacy', external: false },
      { label: t('footer.aiPolicy', 'AI Use Policy'), href: '/legal/ai-policy', external: false },
      { label: t('footer.copyright', 'Copyright & DMCA'), href: '/legal/copyright', external: false },
      { label: t('footer.crossReferencePolicy', 'Cross Reference Policy'), href: '/legal/cross-reference', external: false },
      { label: t('footer.legalDisclaimer', 'Legal Disclaimer'), href: '/legal/disclaimer', external: false },
    ],
  },
];

export function Footer() {
  const { t } = useTranslation();
  const navColumns = getFooterNavigation(t);

  return (
    <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px clamp(1.25rem, 5vw, 48px) 0' }}>
        <div className="footer-main-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minWidth: 0 }}>
            <div>
              <img
                src="/images/KLEO-TECHNOLOGY-fn.avif"
                alt="Kleo Technologies"
                style={{ maxHeight: '40px', maxWidth: '130px', objectFit: 'contain', display: 'block' }}
              />
            </div>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.7,
              maxWidth: '240px',
              margin: 0,
            }}>
              {t('footer.tagline', 'Asset protection through industrial contamination control.')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '✉', text: 'info@elimfilters.com', href: 'mailto:info@elimfilters.com' },
                { icon: '◎', text: 'Frisco, Texas — United States', href: null },
                { icon: '◎', text: 'Caracas, Distrito Capital — Venezuela', href: null },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#FFF12D', minWidth: '12px' }}>{item.icon}</span>
                  {item.href ? (
                    <a href={item.href} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
                      {item.text}
                    </a>
                  ) : (
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{item.text}</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {SOCIAL.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,241,45,0.15)',
                    color: 'rgba(255,241,45,0.6)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  whileHover={{ background: 'rgba(255,241,45,0.1)', borderColor: 'rgba(255,241,45,0.3)' }}
                >
                  {item.letter}
                </motion.a>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px 24px' }}>
            {navColumns.map((col, i) => (
              <div key={i}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#FFF12D',
                  margin: '0 0 16px 0',
                }}>
                  {col.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.6)',
                            textDecoration: 'none',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,241,45,0.8)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.6)',
                            textDecoration: 'none',
                            transition: 'color 0.2s',
                            display: 'inline-block',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,241,45,0.8)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.3)',
            margin: 0,
            fontFamily: 'var(--font-body)',
          }}>
            © 2024 ELIMFILTERS®. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/legal/privacy"
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,241,45,0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,241,45,0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
