'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

const STATS_KEYS = ['warranty.statValue1', 'warranty.statValue2', 'warranty.statValue3', 'warranty.statValue4'];
const STATS_LABELS = ['warranty.statLabel1', 'warranty.statLabel2', 'warranty.statLabel3', 'warranty.statLabel4'];

const PILLARS_KEYS = [
  ['warranty.pillarTitle1', 'warranty.pillarBody1'],
  ['warranty.pillarTitle2', 'warranty.pillarBody2'],
  ['warranty.pillarTitle3', 'warranty.pillarBody3'],
];

const COVERAGE_KEYS = [
  'warranty.coverageItem1',
  'warranty.coverageItem2',
  'warranty.coverageItem3',
  'warranty.coverageItem4',
  'warranty.coverageItem5',
  'warranty.coverageItem6',
  'warranty.coverageItem7',
  'warranty.coverageItem8',
];

const PROCESS_KEYS = [
  'warranty.processItem1',
  'warranty.processItem2',
  'warranty.processItem3',
  'warranty.processItem4',
  'warranty.processItem5',
  'warranty.processItem6',
];

export default function WarrantyPage() {
  const { t } = useTranslation();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WarrantyPromise',
    name: 'ELIMFILTERS Warranty and Support',
    url: 'https://elimfilters.com/warranty',
    description:
      'Warranty and technical support coverage for ELIMFILTERS industrial asset protection systems.',
    provider: {
      '@type': 'Organization',
      name: 'ELIMFILTERS',
      url: 'https://elimfilters.com',
    },
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Link href="/" style={homeButton}>{t('warranty.homeLink')}</Link>

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/warranty-support.avif)' }} />
        <div style={heroOverlay} />

        <div style={heroInner}>
          <h1 style={heroTitle}>
            {t('warranty.heroTitle')}
          </h1>
          <p style={heroLead}>
            {t('warranty.heroLead')}
          </p>

          <div style={tagRow}>
            {['warranty.tagSupport', 'warranty.tagValidation', 'warranty.tagReplacement', 'warranty.tagFleets', 'warranty.tagDistributors', 'warranty.tagAssets'].map((key) => (
              <span key={key} style={tag}>{t(key)}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={statsSection}>
        <div style={statsGrid}>
          {STATS_KEYS.map((valueKey, idx) => (
            <div key={valueKey} style={statCard}>
              <strong style={statValue}>{t(valueKey)}</strong>
              <span style={statLabel}>{t(STATS_LABELS[idx])}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <h2 style={sectionTitle}>{t('warranty.section1Title')}</h2>
          </div>
          <div>
            <p style={leadText}>
              {t('warranty.section1Lead')}
            </p>
            <p style={bodyText}>
              {t('warranty.section1Body')}
            </p>
          </div>
        </div>
      </section>

      <section style={processSection}>
        <div style={wrap}>
          <h2 style={sectionTitle}>{t('warranty.section2Title')}</h2>

          <div style={processList}>
            {PROCESS_KEYS.map((key, index) => (
              <div key={key} style={processRow}>
                <span style={processStep}>{String(index + 1).padStart(2, '0')}</span>
                <strong style={processLabel}>{t(key)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={pillarSection}>
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}>
            <h2 style={sectionTitle}>{t('warranty.section3Title')}</h2>
          </div>

          <div style={pillarGrid}>
            {PILLARS_KEYS.map(([titleKey, bodyKey], index) => (
              <article key={titleKey} style={pillarCard}>
                <span style={pillarNumber}>{String(index + 1).padStart(2, '0')}</span>
                <h3 style={pillarTitle}>{t(titleKey)}</h3>
                <p style={pillarBody}>{t(bodyKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={coverageSection}>
        <div style={wrap}>
          <h2 style={sectionTitle}>{t('warranty.section4Title')}</h2>

          <div style={coverageGrid}>
            {COVERAGE_KEYS.map((key) => (
              <div key={key} style={coverageCard}>
                <span style={check}>&#10003;</span>
                <strong style={coverageText}>{t(key)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={validationCallout}>
        <div style={validationInner}>
          <div>
            <h2 style={sectionTitle}>
              {t('warranty.section5Title')}
            </h2>
            <p style={{ ...bodyText, maxWidth: '760px', marginTop: '1.2rem' }}>
              {t('warranty.section5Body')}
            </p>
          </div>
          <Link href="/contact" style={yellowButton}>{t('warranty.section5Button')}</Link>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>
            {t('warranty.closingTitle')}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/contact" style={yellowButton}>{t('warranty.closingButton1')}</Link>
            <Link href="/systems" style={darkButton}>{t('warranty.closingButton2')}</Link>
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
  position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25,
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

const statsSection: CSSProperties = {
  padding: 'clamp(2rem, 5vw, 4rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,241,45,0.03)',
};

const statsGrid: CSSProperties = {
  maxWidth: '1180px', margin: '0 auto', display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem',
};

const statCard: CSSProperties = {
  border: '1px solid rgba(255,241,45,0.26)', background: 'rgba(0,0,0,0.5)',
  padding: '1.4rem', minHeight: '145px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
};

const statValue: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: 0.95, letterSpacing: '-0.04em',
};

const statLabel: CSSProperties = {
  color: 'rgba(255,255,255,0.62)', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.78rem', marginTop: '0.8rem',
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

const processSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };

const processList: CSSProperties = {
  marginTop: '2.4rem', borderTop: '1px solid rgba(255,255,255,0.1)',
};

const processRow: CSSProperties = {
  display: 'grid', gridTemplateColumns: '70px minmax(0, 1fr)', gap: '1.5rem',
  padding: '1.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', alignItems: 'center',
};

const processStep: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.16em',
};

const processLabel: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 1.6vw, 1.3rem)', lineHeight: 1.15, margin: 0,
};

const pillarSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)' };

const pillarGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem',
};

const pillarCard: CSSProperties = {
  minHeight: '330px', border: '1px solid rgba(255,255,255,0.1)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))',
  padding: '1.4rem', display: 'flex', flexDirection: 'column',
};

const pillarNumber: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.86rem', marginBottom: 'auto',
};

const pillarTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3vw, 3.3rem)',
  lineHeight: 0.94, letterSpacing: '-0.04em', margin: '2rem 0 0', textTransform: 'uppercase',
};

const pillarBody: CSSProperties = {
  color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem',
  lineHeight: 1.55, margin: '1rem 0 0',
};

const coverageSection: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const coverageGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1rem', marginTop: '2.4rem',
};

const coverageCard: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '1rem',
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.55)',
  padding: '1.2rem', minHeight: '100px',
};

const check: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700,
  fontSize: '1.1rem', flexShrink: 0,
};

const coverageText: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1rem',
  lineHeight: 1.15, letterSpacing: '-0.01em',
};

const validationCallout: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const validationInner: CSSProperties = {
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
