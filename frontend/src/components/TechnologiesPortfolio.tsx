import Link from 'next/link';
import type { CSSProperties } from 'react';

const technologies = [
  ['macrocore', 'MACROCORE™', 'Air Intake Protection', '/assets/MACROCORE.avif'],
  ['syntepore', 'SYNTEPORE™', 'Fuel Cleanliness Protection', '/assets/SYNTEPORE.avif'],
  ['hydrocore', 'AQUAGUARD™', 'Fuel / Water Separation', '/assets/HYDROCORE.avif'],
  ['syntrax', 'SYNTRAX™', 'Lubrication Protection', '/assets/SYNTRAX.avif'],
  ['nanoforce', 'NANOFORCE™', 'Hydraulic Protection', '/assets/NANOFORCE.avif'],
  ['thermacore', 'COOLTECH™', 'Cooling System Protection', '/assets/THERMACORE.avif'],
  ['drycore', 'DRYCORE™', 'Compressed Air Protection', '/assets/DRYCORE.avif'],
  ['intekcore', 'INTEKCORE™', 'Housing Architecture', '/assets/INTEKCORE.avif'],
  ['microkappa', 'MICROKAPPA™', 'Cabin Air Protection', '/assets/MICROKAPPA.avif'],
];

export function TechnologiesPortfolio() {
  return (
    <section style={section}>
      <div style={wrap}>
        <p style={eyebrow}>TECHNOLOGY PORTFOLIO</p>
        <h2 style={title}>Select the architecture. Understand the protection role.</h2>
        <div style={grid}>
          {technologies.map(([slug, name, system, image]) => (
            <Link key={slug} href={`/technologies/${slug}`} style={card}>
              <div style={logoStage}><img src={image} alt={name} style={imageStyle} /></div>
              <div style={overlay} />
              <div style={content}>
                <p style={nameStyle}>{name}</p>
                <p style={systemStyle}>{system}</p>
                <span style={explore}>EXPLORE TECHNOLOGY</span>
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
const card: CSSProperties = { minHeight: '420px', position: 'relative', overflow: 'hidden', textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: '#050505' };
const logoStage: CSSProperties = { position: 'absolute', top: '1rem', left: '1rem', right: '1rem', height: '255px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
const imageStyle: CSSProperties = { display: 'block', width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', opacity: 0.84, filter: 'brightness(1.16) contrast(1.05)' };
const overlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.16) 46%, rgba(0,0,0,0.88) 100%)' };
const content: CSSProperties = { position: 'absolute', inset: 0, padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' };
const nameStyle: CSSProperties = { color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.03em', fontSize: 'clamp(1.25rem, 2vw, 1.9rem)', margin: '0 0 0.65rem' };
const systemStyle: CSSProperties = { color: 'rgba(255,241,45,0.9)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.72rem', margin: 0 };
const explore: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.72rem', marginTop: '1.3rem' };
