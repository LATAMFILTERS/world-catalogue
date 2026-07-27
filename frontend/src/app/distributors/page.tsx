'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

const DISTRIBUTORS = [
  {
    country: 'Dominican Republic',
    company: 'TROY, SRL',
    region: 'Caribbean / LATAM',
    address: 'Ave. Las Palmas #64, Santo Domingo, Dominican Republic 10905',
    phone: '',
    social: 'Instagram',
    href: 'https://www.instagram.com/troydominicana/',
  },
  {
    country: 'Colombia',
    company: 'COLSAISA',
    region: 'Andean Region',
    address: 'Cl. 17 #82 - 67, Fontibon, Bogota, Colombia',
    phone: '+57 310 611 2190',
    social: '',
    href: '',
  },
  {
    country: 'United States',
    company: 'ELIMPERCA',
    region: 'North America',
    address: 'Frisco, Texas, United States',
    phone: '',
    social: '',
    href: '',
  },
];

const PARTNER_VALUE_KEYS = [
  ['distributors.partnerValue1', 'distributors.partnerValue1Desc'],
  ['distributors.partnerValue2', 'distributors.partnerValue2Desc'],
  ['distributors.partnerValue3', 'distributors.partnerValue3Desc'],
  ['distributors.partnerValue4', 'distributors.partnerValue4Desc'],
  ['distributors.partnerValue5', 'distributors.partnerValue5Desc'],
  ['distributors.partnerValue6', 'distributors.partnerValue6Desc'],
];

export default function DistributorsPage() {
  const { t } = useTranslation();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ELIMFILTERS Authorized Distributors',
    url: 'https://elimfilters.com/distributors',
    numberOfItems: DISTRIBUTORS.length,
    itemListElement: DISTRIBUTORS.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Organization',
        name: item.company,
        address: item.address,
        areaServed: item.country,
      },
    })),
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Link href="/" style={homeButton}>{t('distributors.homeLink')}</Link>

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/distributor-network.avif)' }} />
        <div style={heroOverlay} />

        <div style={heroInner}>
          <h1 style={heroTitle}>
            {t('distributors.heroTitle')}
          </h1>
          <p style={heroLead}>
            {t('distributors.heroLead')}
          </p>

          <div style={tagRow}>
            {['distributors.tag1', 'distributors.tag2', 'distributors.tag3', 'distributors.tag4', 'distributors.tag5', 'distributors.tag6'].map((key) => (
              <span key={key} style={tag}>{t(key)}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <h2 style={sectionTitle}>{t('distributors.section1Title')}</h2>
          </div>
          <div>
            <p style={leadText}>
              {t('distributors.section1Lead')}
            </p>
            <p style={bodyText}>
              {t('distributors.section1Body')}
            </p>
          </div>
        </div>
      </section>

      <section style={networkSection}>
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}>
            <h2 style={sectionTitle}>{t('distributors.section2Title')}</h2>
          </div>

          <div style={distributorGrid}>
            {DISTRIBUTORS.map((item, index) => (
              <article key={item.company} style={distributorCard}>
                <span style={distributorNumber}>{String(index + 1).padStart(2, '0')}</span>
                <p style={region}>{item.region}</p>
                <h3 style={company}>{item.company}</h3>
                <p style={country}>{item.country}</p>
                <p style={address}>{item.address}</p>

                {item.phone && <a href={`tel:${item.phone.replace(/\s/g, '')}`} style={contactLink}>{item.phone}</a>}

                {item.href && (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={contactLink}>
                    {item.social}
                  </a>
                )}

                <div style={authorized}>ELIMFILTERS AUTHORIZED DISTRIBUTOR</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={partnerSection}>
        <div style={wrap}>
          <h2 style={sectionTitle}>{t('distributors.section3Title')}</h2>

          <div style={partnerGrid}>
            {PARTNER_VALUE_KEYS.map(([titleKey, bodyKey], index) => (
              <article key={titleKey} style={partnerCard}>
                <span style={number}>{String(index + 1).padStart(2, '0')}</span>
                <h3 style={partnerTitle}>{t(titleKey)}</h3>
                <p style={partnerBody}>{t(bodyKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={applicationCallout}>
        <div style={applicationInner}>
          <div>
            <h2 style={sectionTitle}>
              {t('distributors.closingTitle')}
            </h2>
            <p style={{ ...bodyText, maxWidth: '740px', marginTop: '1.2rem' }}>
              {t('distributors.closingBody')}
            </p>
          </div>
          <Link href="/distributor-application" style={yellowButton}>{t('distributors.closingButton')}</Link>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>
            {t('distributors.closingTitle')}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/distributor-application" style={yellowButton}>{t('distributors.closingButton')}</Link>
            <Link href="/contact" style={darkButton}>CONTACT ELIMFILTERS</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };

const homeButton: CSSProperties = {
  position: 'fixed', top: '1.1rem', right: '1.35rem', zIndex: 50,
  background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(255,241,45,0.45)',
  color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem',
  padding: '0.8rem 1.15rem', backdropFilter: 'blur(14px)',
};

const hero: CSSProperties = {
  minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
  padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const heroImage: CSSProperties = {
  position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.28,
};

const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.52) 48%, rgba(0,0,0,0.20) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.26), transparent 36%)',
};

const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };

const heroTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.055em',
  lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
  maxWidth: '1120px', margin: 0, textTransform: 'uppercase',
};

const heroLead: CSSProperties = {
  marginTop: '2rem', maxWidth: '800px', color: 'rgba(255,255,255,0.78)',
  fontSize: 'clamp(1rem, 1.6vw, 1.28rem)', lineHeight: 1.75, fontWeight: 600,
};

const tagRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2.2rem' };

const tag: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.18)', padding: '0.82rem 1rem',
  fontFamily: 'var(--font-display)', fontSize: '0.74rem',
  letterSpacing: '0.16em', fontWeight: 700, color: 'rgba(255,255,255,0.88)',
};

const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };

const twoCol: CSSProperties = {
  maxWidth: '1180px', margin: '0 auto', display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
  gap: 'clamp(2rem, 6vw, 5rem)',
};

const sectionTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: 0.95, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase',
};

const leadText: CSSProperties = {
  color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)',
  lineHeight: 1.72, fontWeight: 600, margin: 0,
};

const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.78 };

const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const wrapWide: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };

const number: CSSProperties = {
  display: 'block', color: '#FFF12D', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.16em', marginBottom: '1rem',
};

const networkSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)' };

const distributorGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem',
};

const distributorCard: CSSProperties = {
  position: 'relative', minHeight: '420px', padding: '1.4rem',
  border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))',
  display: 'flex', flexDirection: 'column',
};

const distributorNumber: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.86rem', marginBottom: '2.5rem',
};

const region: CSSProperties = {
  color: 'rgba(255,241,45,0.82)', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.72rem', margin: '0 0 0.7rem',
};

const company: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3vw, 3.3rem)',
  lineHeight: 0.94, letterSpacing: '-0.04em', margin: 0, textTransform: 'uppercase',
};

const country: CSSProperties = {
  color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.08em', fontSize: '0.82rem', margin: '1.1rem 0 0.4rem',
};

const address: CSSProperties = {
  color: 'rgba(255,255,255,0.62)', fontSize: '0.95rem',
  lineHeight: 1.58, margin: 0,
};

const contactLink: CSSProperties = {
  color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.82rem', marginTop: '1.2rem',
};

const authorized: CSSProperties = {
  marginTop: 'auto', paddingTop: '1.4rem', borderTop: '1px solid rgba(255,241,45,0.26)',
  color: 'rgba(255,255,255,0.42)', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.14em', fontSize: '0.68rem',
};

const partnerSection: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const partnerGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem', marginTop: '2.4rem',
};

const partnerCard: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.55)',
  padding: '1.4rem', minHeight: '230px',
};

const partnerTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.35rem',
  lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em',
};

const partnerBody: CSSProperties = {
  color: 'rgba(255,255,255,0.6)', lineHeight: 1.62,
  fontSize: '0.92rem', margin: '1rem 0 0',
};

const applicationCallout: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const applicationInner: CSSProperties = {
  maxWidth: '1180px', margin: '0 auto', display: 'flex', flexWrap: 'wrap',
  alignItems: 'center', justifyContent: 'space-between', gap: '2rem',
  border: '1px solid rgba(255,241,45,0.2)', background: 'rgba(255,241,45,0.045)',
  padding: 'clamp(1.5rem, 4vw, 2.4rem)',
};

const cta: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.2)',
  background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.26), transparent 34%)',
};

const yellowButton: CSSProperties = {
  display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none',
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em',
  fontSize: '0.82rem', padding: '1rem 1.25rem',
};

const darkButton: CSSProperties = {
  display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D',
  textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem',
  border: '1px solid rgba(255,241,45,0.4)',
};
