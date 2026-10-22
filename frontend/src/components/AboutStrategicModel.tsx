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
    <section className="about-strategic-model" style={section} aria-labelledby="strategic-model-title">
      <div style={wrap}>
        <header className="strategic-header">
          <p style={eyebrow}>ELIMFILTERS · ASSET PROTECTION SYSTEMS</p>
          <h2 id="strategic-model-title" style={title}>{copy.title}</h2>
          <div className="strategic-intro-grid">
            <p style={lead}>{copy.intro1}</p>
            <p style={body}>{copy.intro2}</p>
          </div>
        </header>

        <div className="strategic-statement">
          <strong>{copy.statement1}</strong>
          <span>{copy.statement2}</span>
        </div>

        <div className="strategic-rows">
          {sections.map(([num, heading, p1, p2, p3]) => (
            <article className="strategic-row" key={num}>
              <div className="strategic-row-heading">
                <span className="strategic-number">{num}</span>
                <h3 className="strategic-row-title">{heading}</h3>
              </div>
              <div className="strategic-row-copy">
                {[p1, p2, p3].filter(Boolean).map((paragraph, index) => (
                  <p key={index} style={body}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="strategic-conclusion">
          <strong>{copy.closing1}</strong>
          <span>{copy.closing2}</span>
        </div>
      </div>

      <style jsx>{`
        .strategic-header{min-width:0}
        .strategic-intro-grid{display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);align-items:start;gap:clamp(2rem,5vw,4.5rem);margin-top:clamp(1.5rem,3vw,2.5rem)}
        .strategic-intro-grid p{margin:0;min-width:0;max-width:68ch}
        .strategic-statement{display:grid;gap:.3rem;margin-top:clamp(2.3rem,5vw,4rem);padding:1.35rem 0 1.35rem 1.6rem;border-left:3px solid #FFF12D;background:linear-gradient(90deg,rgba(255,241,45,.05),transparent 80%);font-family:var(--font-display);line-height:1.35;font-size:clamp(1.18rem,2vw,1.85rem);letter-spacing:-.015em}
        .strategic-statement strong{color:#fff}
        .strategic-statement span{color:#FFF12D}
        .strategic-rows{margin-top:clamp(2.5rem,5vw,4.5rem);border-bottom:1px solid rgba(255,255,255,.16)}
        .strategic-row{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(2rem,5vw,5rem);align-items:start;padding:clamp(2.2rem,4.4vw,3.8rem) 0;border-top:1px solid rgba(255,255,255,.16)}
        .strategic-row-heading{display:grid;grid-template-columns:2.6rem minmax(0,1fr);gap:clamp(.75rem,2vw,1.4rem);align-items:start;min-width:0}
        .strategic-number{color:#FFF12D;font:700 .86rem/1.4 var(--font-display);letter-spacing:.13em;padding-top:.2rem}
        .strategic-row-title{font-family:var(--font-display);font-size:clamp(1.4rem,2.05vw,2.2rem);line-height:1.16;letter-spacing:-.02em;text-transform:uppercase;margin:0;max-width:22ch;overflow-wrap:normal}
        .strategic-row-copy{min-width:0;max-width:69ch}
        .strategic-row-copy p{margin:0;text-align:left}
        .strategic-row-copy p+p{margin-top:1.25rem}
        .strategic-conclusion{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);align-items:start;gap:clamp(2rem,5vw,5rem);padding-top:clamp(2.5rem,5vw,4rem);font-family:var(--font-display);font-size:clamp(1.4rem,2.6vw,2.5rem);line-height:1.16;letter-spacing:-.02em}
        .strategic-conclusion strong{color:#fff;font-weight:700}
        .strategic-conclusion span{color:#FFF12D;font-weight:700}
        @media(max-width:900px){
          .strategic-intro-grid,.strategic-row,.strategic-conclusion{grid-template-columns:1fr;gap:1.2rem}
          .strategic-row-title{max-width:40ch}
          .strategic-row-copy{max-width:75ch}
          .strategic-row{padding:2.5rem 0}
        }
        @media(max-width:560px){
          .strategic-row-heading{grid-template-columns:2rem minmax(0,1fr);gap:.75rem}
          .strategic-row-title{font-size:clamp(1.4rem,6vw,1.8rem)}
          .strategic-statement{padding-left:1rem}
          .strategic-conclusion{font-size:clamp(1.35rem,6vw,1.85rem)}
        }
      `}</style>
    </section>
  );
}

const section: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.18)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, #050505 0%, #000 100%)',
};
const wrap: CSSProperties = { maxWidth: '1240px', margin: '0 auto', width: '100%' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', margin: '0 0 1rem', textTransform: 'uppercase' };
const title: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2.05rem, 3.45vw, 3.65rem)', lineHeight: 1.08, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', maxWidth: '1050px' };
const lead: CSSProperties = { color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(1.04rem, 1.3vw, 1.17rem)', lineHeight: 1.72, fontWeight: 600, margin: 0, textAlign: 'left' };
const body: CSSProperties = { color: 'rgba(255,255,255,0.76)', fontSize: 'clamp(.98rem, 1.08vw, 1.075rem)', lineHeight: 1.78, margin: 0, textAlign: 'left' };
