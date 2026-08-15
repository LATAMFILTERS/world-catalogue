'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';
import ContactEmailActions from './ContactEmailActions';

// Email channels (static)
const EMAIL_CHANNELS = [
  {
    email: 'info@elimfilters.com',
    subject: 'Commercial Inquiry - ELIMFILTERS',
    labelKey: 'contact.channel1Label',
    titleKey: 'contact.channel1Title',
    descKey: 'contact.channel1Desc',
  },
  {
    email: 'distribution_network@elimfilters.com',
    subject: 'Distributor Network Inquiry',
    labelKey: 'contact.channel2Label',
    titleKey: 'contact.channel2Title',
    descKey: 'contact.channel2Desc',
  },
  {
    email: 'support@elimfilters.com',
    subject: 'Technical Support Request',
    labelKey: 'contact.channel3Label',
    titleKey: 'contact.channel3Title',
    descKey: 'contact.channel3Desc',
  },
];

const PRIORITY_KEYS = [
  'contact.priority1',
  'contact.priority2',
  'contact.priority3',
  'contact.priority4',
  'contact.priority5',
  'contact.priority6',
];

const SECTOR_KEYS = [
  'contact.sector1',
  'contact.sector2',
  'contact.sector3',
  'contact.sector4',
  'contact.sector5',
  'contact.sector6',
  'contact.sector7',
  'contact.sector8',
];

const schemaContact = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': 'https://elimfilters.com/contact/#contact-page',
  name: 'Contact ELIMFILTERS',
  url: 'https://elimfilters.com/contact/',
  description:
    'Contact ELIMFILTERS for industrial filtration, asset protection, authorized distributor opportunities, OEM cross-reference support and technical inquiries.',
  isPartOf: {
    '@id': 'https://elimfilters.com/#website',
  },
  mainEntity: {
    '@type': 'Organization',
    '@id': 'https://elimfilters.com/#organization',
    name: 'ELIMFILTERS',
    url: 'https://elimfilters.com/',
    email: 'info@elimfilters.com',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'Commercial inquiries',
        email: 'info@elimfilters.com',
        availableLanguage: ['English', 'Spanish'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'Technical support',
        email: 'support@elimfilters.com',
        availableLanguage: ['English', 'Spanish'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'Authorized distributor network',
        email: 'distribution_network@elimfilters.com',
        availableLanguage: ['English', 'Spanish'],
      },
    ],
  },
};

const schemaBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com/' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://elimfilters.com/contact/' },
  ],
};

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <main
      style={{
        background: '#000',
        color: '#fff',
        minHeight: '100vh',
        fontFamily: 'Barlow, Arial, sans-serif',
        overflowX: 'hidden',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap');`}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaContact) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
      />

      <PageHeader currentPage="Contact" />

      <section
        style={{
          minHeight: '88vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          background:
            'radial-gradient(circle at top right, rgba(255,241,45,0.17), transparent 32%), linear-gradient(135deg, rgba(255,255,255,0.065) 0%, transparent 38%, rgba(255,241,45,0.075) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '6rem clamp(1.25rem,5vw,2rem) 4rem',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/images/contacto-papa.avif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 50%',
            opacity: 0.38,
            zIndex: 0,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.68) 46%, rgba(0,0,0,0.24) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.26), transparent 36%)',
            zIndex: 1,
          }}
        />
        <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <p
            style={{
              color: '#FFF12D',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            {t('contact.heroTag')}
          </p>

          <h1
            style={{
              maxWidth: '980px',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
              lineHeight: 0.88,
              letterSpacing: '-0.055em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            {t('contact.heroTitle')}
            <span style={{ display: 'block', color: '#FFF12D' }}>{t('contact.heroSubtitle')}</span>
          </h1>

          <p
            style={{
              maxWidth: '770px',
              color: 'rgba(255,255,255,0.76)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.65,
              fontWeight: 600,
              marginBottom: '2rem',
            }}
          >
            {t('contact.heroDescription')}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {[t('contact.heroCta1'), t('contact.heroCta2'), t('contact.heroCta3')].map((item) => (
              <span
                key={item}
                style={{
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '0.75rem 1rem',
                  fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.72)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {EMAIL_CHANNELS.map((channel) => (
              <article
                key={channel.email}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background:
                    channel.labelKey === 'contact.channel2Label'
                      ? 'rgba(255,241,45,0.045)'
                      : '#050505',
                  padding: '1.6rem',
                  minHeight: '300px',
                }}
              >
                <p
                  style={{
                    color: '#FFF12D',
                    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  {t(channel.labelKey)}
                </p>
                <h2
                  style={{
                    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                    fontSize: '1.4rem',
                    textTransform: 'uppercase',
                    lineHeight: 1.05,
                    marginBottom: '1rem',
                  }}
                >
                  {t(channel.titleKey)}
                </h2>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.65,
                    marginBottom: '1.5rem',
                    flexGrow: 1,
                  }}
                >
                  {t(channel.descKey)}
                </p>
                <ContactEmailActions
                  email={channel.email}
                  subject={channel.subject}
                  emailLabel={t('contact.emailButton')}
                  copyLabel={t('contact.copyButton')}
                  copiedLabel={t('contact.copiedButton')}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '5rem clamp(1.25rem,5vw,2rem)',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)',
              gap: 'clamp(2rem,6vw,5rem)',
              alignItems: 'start',
            }}
          >
            <div>
              <p
                style={{
                  color: '#FFF12D',
                  fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                {t('contact.routingTag')}
              </p>
              <h2
                style={{
                  fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                  fontSize: 'clamp(2.2rem,5vw,4.6rem)',
                  lineHeight: 0.92,
                  textTransform: 'uppercase',
                  maxWidth: '620px',
                }}
              >
                {t('contact.routingTitle')}
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {PRIORITY_KEYS.map((key, index) => (
                <div
                  key={key}
                  style={{
                    borderTop: '2px solid #FFF12D',
                    paddingTop: '1rem',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      color: 'rgba(255,255,255,0.28)',
                      fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                      fontSize: '0.7rem',
                      marginBottom: '0.65rem',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>{t(key)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <p
            style={{
              color: '#FFF12D',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            {t('contact.sectorsTag')}
          </p>
          <h2
            style={{
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: 'clamp(2.2rem,5vw,4.6rem)',
              lineHeight: 0.92,
              textTransform: 'uppercase',
              marginBottom: '2rem',
            }}
          >
            {t('contact.sectorsTitle')}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {SECTOR_KEYS.map((key, index) => (
              <div
                key={key}
                style={{
                  background: '#050505',
                  padding: '1.4rem',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#FFF12D',
                    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                    fontSize: '0.68rem',
                    marginBottom: '0.8rem',
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>{t(key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '5rem clamp(1.25rem,5vw,2rem)',
          borderTop: '1px solid rgba(255,241,45,0.2)',
          background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.12), transparent 38%)',
        }}
      >
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: 'clamp(2.2rem,5vw,4.8rem)',
              lineHeight: 0.92,
              textTransform: 'uppercase',
              marginBottom: '1.3rem',
            }}
          >
            {t('contact.finalTitle')}
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.62)',
              maxWidth: '720px',
              margin: '0 auto 2rem',
              lineHeight: 1.7,
            }}
          >
            {t('contact.finalDescription')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
            <a
              href="mailto:info@elimfilters.com?subject=Commercial%20Inquiry%20-%20ELIMFILTERS"
              style={{
                background: '#FFF12D',
                color: '#000',
                textDecoration: 'none',
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                fontWeight: 700,
                letterSpacing: '0.12em',
                fontSize: '0.82rem',
                padding: '1rem 1.25rem',
              }}
            >
              {t('contact.finalCta1')}
            </a>
            <Link
              href="/distributor-application"
              style={{
                border: '1px solid rgba(255,241,45,0.35)',
                color: '#FFF12D',
                textDecoration: 'none',
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                fontWeight: 700,
                letterSpacing: '0.12em',
                fontSize: '0.82rem',
                padding: '1rem 1.25rem',
              }}
            >
              {t('contact.finalCta2')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
