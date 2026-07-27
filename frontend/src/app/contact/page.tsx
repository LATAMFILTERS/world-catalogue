'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
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
  name: 'Contact ELIMFILTERS',
  url: 'https://elimfilters.com/contact/',
  description:
    'Contact ELIMFILTERS for industrial filtration, asset protection, distributor opportunities, OEM cross-reference support and technical inquiries.',
  mainEntity: {
    '@type': 'Organization',
    name: 'ELIMFILTERS',
    legalName: 'Kleo Technologies LLC',
    url: 'https://elimfilters.com',
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
        contactType: 'Distributor network',
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
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
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

      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 9999,
          border: '1px solid rgba(255,241,45,0.45)',
          padding: '0.55rem 1rem',
          color: '#FFF12D',
          background: 'rgba(0,0,0,0.88)',
          textDecoration: 'none',
          fontFamily: 'Chakra Petch, Arial Narrow, monospace',
          fontWeight: 700,
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
        }}
      >
        {t('contact.homeLink')}
      </Link>

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
                    color: '#fff',
                    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                    fontSize: '1.65rem',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  {t(channel.titleKey)}
                </h2>

                <p
                  style={{
                    color: 'rgba(255,255,255,0.64)',
                    lineHeight: 1.65,
                    marginBottom: '1.5rem',
                  }}
                >
                  {t(channel.descKey)}
                </p>

                <ContactEmailActions email={channel.email} subject={channel.subject} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '4rem clamp(1.25rem,5vw,2rem)',
          background: '#050505',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'start',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                fontSize: 'clamp(2rem, 4vw, 3.6rem)',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                marginBottom: '1.2rem',
              }}
            >
              {t('contact.whatToIncludeTitle')}
            </h2>

            <p
              style={{
                color: 'rgba(255,255,255,0.66)',
                lineHeight: 1.7,
                maxWidth: '560px',
              }}
            >
              {t('contact.whatToIncludeDesc')}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {PRIORITY_KEYS.map((key) => (
              <div
                key={key}
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.035)',
                  padding: '1rem',
                  color: 'rgba(255,255,255,0.72)',
                  lineHeight: 1.55,
                  fontWeight: 600,
                }}
              >
                {t(key)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: 'clamp(2rem, 4vw, 3.6rem)',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            {t('contact.marketsTitle')}
          </h2>

          <p
            style={{
              maxWidth: '720px',
              color: 'rgba(255,255,255,0.62)',
              lineHeight: 1.65,
              marginBottom: '2rem',
            }}
          >
            {t('contact.marketsDesc')}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {SECTOR_KEYS.map((key) => (
              <div
                key={key}
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.035)',
                  padding: '1rem',
                  fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                  color: 'rgba(255,255,255,0.78)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {t(key)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '4rem clamp(1.25rem,5vw,2rem) 5rem',
          background: '#050505',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            border: '1px solid rgba(255,241,45,0.28)',
            background:
              'linear-gradient(135deg, rgba(255,241,45,0.07), rgba(255,255,255,0.025))',
            padding: 'clamp(1.5rem,4vw,2.5rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                color: '#FFF12D',
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
              }}
            >
              Authorized Partner Program
            </p>

            <h2
              style={{
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                fontSize: 'clamp(1.9rem, 4vw, 3.2rem)',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Seeking Distributor Status?
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.66)', lineHeight: 1.7, margin: 0 }}>
              Use the distributor application to submit territory, sector and company
              information for commercial review.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link
              href="/distributor-application"
              style={{
                display: 'inline-block',
                background: '#FFF12D',
                color: '#000',
                padding: '1rem 1.25rem',
                textDecoration: 'none',
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Apply For Review
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

