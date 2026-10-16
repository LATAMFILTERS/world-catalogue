'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

type Copy = {
  title: string;
  intro1: string;
  intro2: string;
  statement1: string;
  statement2: string;
  globalTitle: string;
  global1: string;
  global2: string;
  global3: string;
  modelingTitle: string;
  modeling1: string;
  modeling2: string;
  modeling3: string;
  horizontalTitle: string;
  horizontal1: string;
  horizontal2: string;
  horizontal3: string;
  efficiencyTitle: string;
  efficiency1: string;
  efficiency2: string;
  efficiency3: string;
  closing1: string;
  closing2: string;
};

export function AboutStrategicModel() {
  const { t } = useTranslation();
  const copy = t('corporatePositioning.strategic', { returnObjects: true }) as Copy;

  const sections = [
    ['02', copy.globalTitle, copy.global1, copy.global2, copy.global3],
    ['03', copy.modelingTitle, copy.modeling1, copy.modeling2, copy.modeling3],
    ['04', copy.horizontalTitle, copy.horizontal1, copy.horizontal2, copy.horizontal3],
    ['05', copy.efficiencyTitle, copy.efficiency1, copy.efficiency2, copy.efficiency3],
  ];

  return (
    <section style={section}>
      <div style={wrap}>
        <p style={eyebrow}>ELIMFILTERS · ASSET PROTECTION SYSTEMS</p>
        <h2 style={title}>{copy.title}</h2>
        <div style={introGrid}>
          <p style={lead}>{copy.intro1}</p>
          <p style={body}>{copy.intro2}</p>
        </div>

        <div style={statement}>
          <strong>{copy.statement1}</strong>
          <span>{copy.statement2}</span>
        </div>

        <div style={sectionGrid}>
          {sections.map(([num, heading, p1, p2, p3]) => (
            <article key={heading} style={card}>
              <div style={cardTop}>
                <span style={number}>{num}</span>
                <h3 style={cardTitle}>{heading}</h3>
              </div>
              <p style={body}>{p1}</p>
              <p style={body}>{p2}</p>
              <p style={body}>{p3}</p>
            </article>
          ))}
        </div>

        <div style={closing}>
          <strong>{copy.closing1}</strong>
          <span>{copy.closing2}</span>
        </div>
      </div>
    </section>
  );
}

const section: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.18)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, #050505 0%, #000 100%)',
};
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', margin: '0 0 1rem', textTransform: 'uppercase' };
const title: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4.8vw, 4.5rem)', lineHeight: 0.94, letterSpacing: '-0.03em', margin: 0, textTransform: 'uppercase', maxWidth: '1000px' };
const introGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(1.5rem, 4vw, 3rem)', marginTop: '1.5rem' };
const lead: CSSProperties = { color: 'rgba(255,255,255,0.84)', fontSize: 'clamp(1.05rem, 1.55vw, 1.3rem)', lineHeight: 1.72, fontWeight: 600, margin: 0, textAlign: 'justify' };
const body: CSSProperties = { color: 'rgba(255,255,255,0.64)', fontSize: '1rem', lineHeight: 1.76, textAlign: 'justify' };
const statement: CSSProperties = { marginTop: '2rem', display: 'grid', gap: '0.35rem', borderLeft: '3px solid #FFF12D', padding: '1.2rem 1.5rem', background: 'rgba(255,241,45,0.035)', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 2.5vw, 2.2rem)', textTransform: 'uppercase' };
const sectionGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem', marginTop: '2.25rem' };
const card: CSSProperties = { border: '1px solid rgba(255,255,255,0.1)', padding: 'clamp(1.4rem, 3vw, 2rem)', background: 'rgba(255,255,255,0.02)' };
const cardTop: CSSProperties = { display: 'grid', gridTemplateColumns: '55px minmax(0, 1fr)', gap: '1rem', alignItems: 'start', marginBottom: '0.85rem' };
const number: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.14em', fontSize: '0.8rem', paddingTop: '0.3rem' };
const cardTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.45rem, 2.6vw, 2.4rem)', lineHeight: 1, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' };
const closing: CSSProperties = { marginTop: '2.25rem', borderTop: '1px solid rgba(255,241,45,0.28)', paddingTop: '1.5rem', display: 'grid', gap: '0.45rem', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', textTransform: 'uppercase' };
