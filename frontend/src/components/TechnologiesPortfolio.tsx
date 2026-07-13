import Link from 'next/link';
import type { CSSProperties } from 'react';

const technologies = [
  ['macrocore', 'MACROCORE™', '/assets/MACROCORE.avif'],
  ['syntepore', 'SYNTEPORE™', '/assets/SYNTEPORE.avif'],
  ['hydrocore', 'HYDROCORE™', '/assets/HYDROCORE.avif'],
  ['syntrax', 'SYNTRAX™', '/assets/SYNTRAX.avif'],
  ['nanoforce', 'NANOFORCE™', '/assets/NANOFORCE.avif'],
  ['thermacore', 'THERMACORE™', '/assets/THERMACORE.avif'],
  ['drycore', 'DRYCORE™', '/assets/DRYCORE.avif'],
  ['intekcore', 'INTEKCORE™', '/assets/INTEKCORE.avif'],
  ['microkappa', 'MICROKAPPA™', '/assets/MICROKAPPA.avif'],
];

export function TechnologiesPortfolio() {
  return (
    <section style={section}>
      <div style={wrap}>
        <p style={eyebrow}>TECHNOLOGY PORTFOLIO</p>
        <h2 style={title}>Select the architecture. Understand the protection role.</h2>
        <div style={grid}>
          {technologies.map(([slug, name, image]) => (
            <Link key={slug} href={`/technologies/${slug}`} style={card} aria-label={`Explore ${name}`}>
              <div style={logoStage}>
                <img src={image} alt={name} style={imageStyle} />
              </div>
              <div style={footer}>
                <span style={explore}>EXPLORE TECHNOLOGY <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const section: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)',
  background: '#000',
};

const wrap: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };

const eyebrow: CSSProperties = {
  color: '#FFF12D',
  fontFamily: 'var(--font-display)',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.3em',
  margin: '0 0 1rem',
};

const title: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: 0.95,
  letterSpacing: '-0.02em',
  margin: '0 0 2.4rem',
  textTransform: 'uppercase',
  color: '#fff',
};

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
  gap: '1rem',
};

const card: CSSProperties = {
  minHeight: '360px',
  display: 'grid',
  gridTemplateRows: '1fr auto',
  overflow: 'hidden',
  textDecoration: 'none',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.1)',
  background: '#050505',
};

const logoStage: CSSProperties = {
  minHeight: '285px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.25rem',
  overflow: 'hidden',
  background: '#020202',
};

const imageStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  maxHeight: '255px',
  objectFit: 'contain',
  objectPosition: 'center',
  opacity: 0.94,
  filter: 'brightness(1.08) contrast(1.04)',
};

const footer: CSSProperties = {
  minHeight: '72px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 1.35rem',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  background: '#050505',
};

const explore: CSSProperties = {
  color: '#FFF12D',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  letterSpacing: '0.16em',
  fontSize: '0.72rem',
};
