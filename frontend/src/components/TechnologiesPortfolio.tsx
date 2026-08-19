import Link from 'next/link';
import type { CSSProperties } from 'react';

type TechnologyCard = readonly [
  slug: string,
  name: string,
  image: string,
  visualScale: number,
];

/**
 * Optical normalization measured from the rendered production cards.
 * Target: ~20 px apparent height for the white technology name at the
 * current desktop card geometry. Source artwork is preserved unchanged.
 */
const technologies: readonly TechnologyCard[] = [
  ['macrocore', 'MACROCORE™', '/assets/MACROCORE_final.avif', 1.074],
  ['syntapore', 'SYNTAPORE™', '/assets/SYNTAPORE_final.avif', 1.000],
  ['hydrocore', 'HYDROCORE™', '/assets/HYDROCORE_final.avif', 1.100],
  ['syntrax', 'SYNTRAX™', '/assets/SYNTRAX_final.avif', 1.035],
  ['nanoforce', 'NANOFORCE™', '/assets/NANOFORCE_final.avif', 0.983],
  ['thermacore', 'THERMACORE™', '/assets/THERMACORE_final.avif', 1.152],
  ['drycore', 'DRYCORE™', '/assets/DRYCORE_final.avif', 0.911],
  ['intekcore', 'INTEKCORE™', '/assets/INTEKCORE_final.avif', 1.129],
  ['microkappa', 'MICROKAPPA™', '/assets/MICROKAPPA_final.avif', 1.029],
];

export function TechnologiesPortfolio() {
  return (
    <section className="technology-portfolio-section" style={section}>
      <style>{`
        @media (max-width: 860px) {
          .technology-portfolio-title {
            font-size: clamp(1.65rem, 7.2vw, 2.35rem) !important;
            line-height: 1.04 !important;
            letter-spacing: -0.02em !important;
            overflow-wrap: normal !important;
            word-break: keep-all !important;
            hyphens: none !important;
            -webkit-hyphens: none !important;
          }
          .technology-portfolio-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .technology-portfolio-card { position: relative !important; display: flex !important; flex-direction: column !important; width: 100% !important; min-height: 0 !important; overflow: hidden !important; }
          .technology-portfolio-logo-stage { position: relative !important; inset: auto !important; width: 100% !important; height: 230px !important; padding: 1.35rem 1.6rem !important; flex: 0 0 auto !important; }
          .technology-portfolio-image { display: block !important; width: 100% !important; height: 100% !important; object-fit: contain !important; object-position: center !important; opacity: 0.94 !important; }
          .technology-portfolio-content { position: relative !important; inset: auto !important; min-height: 70px !important; padding: 1.1rem 1.2rem !important; justify-content: center !important; }
          .technology-portfolio-explore { white-space: nowrap !important; }
        }
        @media (max-width: 430px) { .technology-portfolio-logo-stage { height: 205px !important; } }
      `}</style>
      <div style={wrap}>
        <p className="technology-portfolio-eyebrow" style={eyebrow}>TECHNOLOGY PORTFOLIO</p>
        <h2 className="technology-portfolio-title" style={title}>Select the architecture. Understand the protection role.</h2>
        <div className="technology-portfolio-grid" style={grid}>
          {technologies.map(([slug, name, image, visualScale]) => (
            <Link key={slug} href={`/technologies/${slug}`} className="technology-portfolio-card" style={card}>
              <div className="technology-portfolio-logo-stage" style={logoStage}>
                <img
                  className="technology-portfolio-image"
                  src={image}
                  alt={name}
                  style={{ ...imageStyle, transform: `scale(${visualScale})` }}
                />
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
const logoStage: CSSProperties = { position: 'absolute', top: '1rem', left: '1rem', right: '1rem', height: '300px', padding: '1.7rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
const imageStyle: CSSProperties = { display: 'block', width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', opacity: 0.92, filter: 'brightness(1.16) contrast(1.05)', transformOrigin: 'center center' };
const overlay: CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.08) 60%, rgba(0,0,0,0.78) 100%)' };
const content: CSSProperties = { position: 'absolute', inset: 0, padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' };
const explore: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.72rem' };
