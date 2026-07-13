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
    <section className="technology-portfolio-section" style={section}>
      <div style={wrap}>
        <p className="technology-portfolio-eyebrow" style={eyebrow}>TECHNOLOGY PORTFOLIO</p>
        <h2 className="technology-portfolio-title" style={title}>Select the architecture. Understand the protection role.</h2>
        <div className="technology-portfolio-grid" style={grid}>
          {technologies.map(([slug, name, image]) => (
            <Link key={slug} href={`/technologies/${slug}`} className="technology-portfolio-card" style={card}>
              <div className="technology-portfolio-logo-stage" style={logoStage}>
                <img className="technology-portfolio-image" src={image} alt={name} style={imageStyle} />
              </div>
              <div style={overlay} />
              <div className="technology-portfolio-content" style={content}>
                <span className="technology-portfolio-explore" style={explore}>EXPLORE TECHNOLOGY →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)', background: '#000' };
const wrap: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.3em', margin: '0 0 1rem' };
const title: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: '0 0 2.4rem', textTransform: 'uppercase', color: '#fff' };
const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' };
const card: CSSProperties = { display: 'block', width: '100%', minHeight: '420px', position: 'relative', overflow: 'hidden', textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: '#050505' };
const logoStage: CSSProperties = { position: 'absolute', top: '1rem', left: '1rem', right: '1rem', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
const imageStyle: CSSProperties = { display: 'block', width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', opacity: 0.9, filter: 'brightness(1.16) contrast(1.05)' };
const overlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.08) 60%, rgba(0,0,0,0.78) 100%)' };
const content: CSSProperties = { position: 'absolute', inset: 0, padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' };
const explore: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.72rem' };
