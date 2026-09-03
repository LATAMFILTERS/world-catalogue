'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

// Deployment trigger - footer centered contact info section
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
      { label: t('footer.knowledgeSystem', 'Knowledge System'), href: '/knowledge-center/', external: false },
      { label: t('footer.standardsLibrary', 'Standards Library'), href: '/knowledge-center/standards/', external: false },
      { label: t('footer.fleetOptimization', 'Fleet Optimization'), href: '/knowledge-center/technical-library/', external: false },
    ],
  },
  {
    title: t('footer.knowledge', 'KNOWLEDGE'),
    links: [
      { label: t('footer.contamination', 'Contamination'), href: '/knowledge-center/engineering/', external: false },
      { label: t('footer.compareSelect', 'Compare & Select'), href: '/knowledge-center/', external: false },
      { label: t('footer.filtrationScience', 'Filtration Science'), href: '/knowledge-center/engineering/', external: false },
      { label: t('footer.industrialBridges', 'Industrial Bridges'), href: '/knowledge-center/', external: false },
    ],
  },
  {
    title: t('footer.legal', 'LEGAL'),
    links: [
      { label: t('footer.termsOfService', 'Terms of Service'), href: '/legal/terms', external: false },
      { label: t('footer.privacyPolicy', 'Privacy Policy'), href: '/legal/privacy', external: false },
      { label: t('footer.aiPolicy', 'AI Use Policy'), href: '/legal/ai-policy', external: false },
      { label: t('footer.crossReferencePolicy', 'Cross Reference Policy'), href: '/legal/cross-reference', external: false },
      { label: t('footer.legalDisclaimer', 'Legal Disclaimer'), href: '/legal/disclaimer', external: false },
    ],
  },
];

export function Footer() {
  const { t } = useTranslation();
  const navColumns = getFooterNavigation(t);

  return (
    <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)' }} role="contentinfo" aria-label="Site footer">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px clamp(1.25rem, 5vw, 48px) clamp(1.25rem, 5vw, 48px) 0' }}>
        <div
          className="footer-main-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(150px, 1fr))',
            gap: 'clamp(2rem, 4vw, 4.5rem)',
            alignItems: 'start',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minWidth: 0 }}>
            <div>
              <img
                src="/images/KLEO-TECHNOLOGY-fn.avif"
                alt="Kleo Technologies"
                width={1640}
                height={656}
                style={{ maxHeight: '64px', maxWidth: '200px', objectFit: 'contain', display: 'block' }}
              />
              <div style={{ marginTop: '12px' }}>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.4,
                  maxWidth: '240px',
                  margin: 0,
                }}>
                  {t('footer.elimfiltersCopyright', 'KLEO TECHNOLOGY LLC | Intelligence and Engineering in Filtration')}
                </p>
              </div>
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

          </div>

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

        <div style={{
          display: 'flex',
          gap: '48px',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          paddingTop: '48px',
          paddingBottom: '48px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                  fontSize: '13px',
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

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '15px', whiteSpace: 'nowrap' }}>
            <a href="mailto:info@elimfilters.com" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,241,45,0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              info@elimfilters.com
            </a>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
            <a href="tel:+12819659142" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,241,45,0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              +1 281 965 9142
            </a>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Corporate Headquarters: Frisco, Texas</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Global Operations</span>
          </div>
        </div>

        <div style={{
          marginTop: '0',
          paddingTop: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
        }}>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.5,
            width: '100%',
            textTransform: 'lowercase',
          }}>
            <p style={{ margin: 0 }}>
              © KLEO TECHNOLOGY LLC. ELIMFILTERS® is a registered trademark. Legal Headquarters: Frisco, Texas, USA. ELIMFILTERS operates through a distributor-first global commercial model with coordinated strategic-account capability.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/legal/privacy"
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.65)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,241,45,0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.65)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,241,45,0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
