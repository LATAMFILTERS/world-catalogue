'use client';

import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

type Props = {
  variant?: 'about' | 'distributors';
};

type Copy = {
  sectionEyebrowAbout: string;
  sectionEyebrowDistributors: string;
  titleAbout: string;
  titleDistributors: string;
  lead: string;
  industrialEyebrow: string;
  industrialTitle: string;
  industrialBody: string;
  partnerEyebrow: string;
  partnerTitle: string;
  partnerLead: string;
  partnerGovernance: string;
  partnerResult: string;
  marketEyebrow: string;
  marketTitle: string;
  marketBody: string;
  marketAllocation: string;
  partnershipEyebrow: string;
  partnershipTitle: string;
  apply: string;
};

export function GlobalCommercialModel({ variant = 'about' }: Props) {
  const { t } = useTranslation();
  const copy = t('corporatePositioning.commercial', { returnObjects: true }) as Copy;
  const operatingChain = t('corporatePositioning.pillars', { returnObjects: true }) as {step: string; eyebrow: string; title: string; body: string}[];
  const partnerOutcomes = t('corporatePositioning.partnerOutcomes', { returnObjects: true }) as string[][];
  const isDistributor = variant === 'distributors';

  return (
    <>
      <section style={section}>
        <div style={wrap}>
          <p style={eyebrow}>{isDistributor ? copy.sectionEyebrowDistributors : copy.sectionEyebrowAbout}</p>
          <h2 style={title}>{isDistributor ? copy.titleDistributors : copy.titleAbout}</h2>
          <p style={lead}>{copy.lead}</p>

          <div style={grid}>
            {operatingChain.map((item) => (
              <article key={item.step} style={card}>
                <div style={topline}>
                  <span style={number}>{item.step}</span>
                  <span style={cardEyebrow}>{item.eyebrow}</span>
                </div>
                <h3 style={cardTitle}>{item.title}</h3>
                <p style={body}>{item.body}</p>
              </article>
            ))}
          </div>

          <div style={industrialPanel}>
            <div>
              <p style={eyebrow}>{copy.industrialEyebrow}</p>
              <h3 style={panelTitle}>{copy.industrialTitle}</h3>
            </div>
            <div>
              <p style={{ ...body, margin: 0 }}>{copy.industrialBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section style={partnerSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.partnerEyebrow}</p>
          <div style={twoCol}>
            <div>
              <h2 style={title}>{copy.partnerTitle}</h2>
            </div>
            <div>
              <p style={lead}>{copy.partnerLead}</p>
              <p style={body}>{copy.partnerGovernance}</p>
              <p style={body}>{copy.partnerResult}</p>
            </div>
          </div>

          <div style={outcomeGrid}>
            {partnerOutcomes.map(([heading, description], index) => (
              <article key={heading} style={outcomeCard}>
                <span style={number}>{String(index + 1).padStart(2, '0')}</span>
                <h3 style={outcomeTitle}>{heading}</h3>
                <p style={body}>{description}</p>
              </article>
            ))}
          </div>

          <div style={marketPanel}>
            <div>
              <p style={eyebrow}>{copy.marketEyebrow}</p>
              <h3 style={panelTitle}>{copy.marketTitle}</h3>
            </div>
            <div>
              <p style={{ ...body, marginTop: 0 }}>{copy.marketBody}</p>
              <p style={{ ...body, marginBottom: 0 }}>{copy.marketAllocation}</p>
            </div>
          </div>

          {isDistributor && (
            <div style={ctaRow}>
              <div>
                <p style={eyebrow}>{copy.partnershipEyebrow}</p>
                <h3 style={panelTitle}>{copy.partnershipTitle}</h3>
              </div>
              <Link href="/distributor-application" style={button}>{copy.apply}</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const section: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.22)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, #050505 0%, #000 100%)',
};
const partnerSection: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,241,45,0.16)',
  background: 'rgba(255,241,45,0.02)',
};
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const eyebrow: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '0.74rem', fontWeight: 700,
  letterSpacing: '0.18em', margin: '0 0 1rem', textTransform: 'uppercase',
};
const title: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.7rem)', lineHeight: 0.96,
  letterSpacing: '-0.025em', margin: 0, textTransform: 'uppercase', maxWidth: '1040px',
};
const lead: CSSProperties = {
  color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.05rem, 1.6vw, 1.3rem)',
  lineHeight: 1.72, fontWeight: 600, maxWidth: '900px', margin: '1.7rem 0 0',
};
const body: CSSProperties = { color: 'rgba(255,255,255,0.62)', fontSize: '0.98rem', lineHeight: 1.72 };
const grid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '3rem',
};
const card: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.025)',
  padding: '1.5rem', minHeight: '315px',
};
const topline: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' };
const number: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem',
};
const cardEyebrow: CSSProperties = {
  color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.12em', fontSize: '0.67rem', textAlign: 'right',
};
const cardTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.45rem', lineHeight: 1.05,
  letterSpacing: '-0.03em', margin: '2.4rem 0 0', textTransform: 'uppercase',
};
const industrialPanel: CSSProperties = {
  marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem', border: '1px solid rgba(255,241,45,0.22)', background: 'rgba(255,241,45,0.035)', padding: '1.7rem',
};
const panelTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.7vw, 2.6rem)', lineHeight: 1,
  letterSpacing: '-0.03em', margin: 0, textTransform: 'uppercase',
};
const twoCol: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 6vw, 5rem)',
};
const outcomeGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '3rem',
};
const outcomeCard: CSSProperties = {
  borderTop: '1px solid rgba(255,241,45,0.32)', padding: '1.4rem 0.3rem 0', minHeight: '210px',
};
const outcomeTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1.08,
  letterSpacing: '-0.025em', margin: '1rem 0 0', textTransform: 'uppercase',
};
const marketPanel: CSSProperties = {
  marginTop: '2.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)',
};
const ctaRow: CSSProperties = {
  marginTop: '2.4rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem',
  border: '1px solid rgba(255,241,45,0.22)', padding: '1.6rem', background: 'rgba(0,0,0,0.4)',
};
const button: CSSProperties = {
  display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none',
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem',
};