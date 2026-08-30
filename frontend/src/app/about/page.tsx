'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';

export default function AboutPage() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');

  const copy = isSpanish ? {
    heroTitle: 'Acerca de ELIMFILTERS',
    heroLead: 'ELIMFILTERS® es una organización de ingeniería de filtración industrial enfocada en proteger activos críticos mediante control disciplinado de contaminación, inteligencia de aplicación, arquitectura de producto validada y ejecución comercial confiable.',
    essenceEyebrow: 'POR QUÉ EXISTE ELIMFILTERS',
    essenceTitle: 'La filtración se trata como ingeniería de confiabilidad, no como una pieza genérica.',
    essenceBody: 'La mayoría de las fallas por contaminación son prevenibles, no inevitables. Un filtro elegido solo por dimensiones no protege nada si no corresponde al fluido, la presión o el modo de falla real del activo que hay detrás — por eso cada decisión de ELIMFILTERS parte del equipo protegido, no de una página de catálogo. El mismo principio define cómo está construida la propia empresa: una Chief Executive Office humana junto con agentes ejecutivos de IA especializados, para que la capacidad técnica y la continuidad puedan escalar a largo plazo sin añadir complejidad organizacional por sí misma.',
    cards: [
      {
        title: 'Quiénes Somos',
        body: 'Filtración industrial diseñada alrededor del activo: cinco sistemas de protección, nueve tecnologías propietarias y un proceso de validación basado en aplicación real.',
        href: '/about/who-we-are',
      },
      {
        title: 'Liderazgo',
        body: 'Autoridad ejecutiva humana combinada con funciones ejecutivas especializadas operadas por agentes de IA, bajo un marco formal de responsabilidad y autoridad delegada.',
        href: '/about/leadership',
      },
      {
        title: 'Filosofía de Ingeniería',
        body: 'Decisiones de ingeniería regidas por evidencia, validación física e integridad técnica, no por afirmaciones comerciales genéricas.',
        href: '/about/philosophy',
      },
    ],
  } : {
    heroTitle: 'About ELIMFILTERS',
    heroLead: 'ELIMFILTERS® is an industrial filtration engineering organization focused on protecting critical assets through disciplined contamination control, application intelligence, validated product architecture, and reliable commercial execution.',
    essenceEyebrow: 'WHY ELIMFILTERS EXISTS',
    essenceTitle: 'Filtration treated as reliability engineering, not a commodity part.',
    essenceBody: 'Most contamination failures are preventable, not inevitable. A filter chosen by dimensions alone protects nothing if it doesn’t match the fluid, the pressure, or the real failure mode of the asset behind it — which is why every ELIMFILTERS decision starts from the protected equipment, not from a catalog page. The same principle shapes how the company itself is built: a human Chief Executive Office paired with specialized executive AI agents, so technical capability and continuity can scale for the long term without adding organizational complexity for its own sake.',
    cards: [
      {
        title: 'Who We Are',
        body: 'Industrial filtration engineered around the asset: five protection systems, nine proprietary technologies, and an application-based validation process.',
        href: '/about/who-we-are',
      },
      {
        title: 'Leadership',
        body: 'Human executive authority combined with specialized executive functions operated by AI agents, under a formal framework of accountability and delegated authority.',
        href: '/about/leadership',
      },
      {
        title: 'Engineering Philosophy',
        body: 'Engineering decisions governed by evidence, physical validation, and technical integrity, not generic commercial claims.',
        href: '/about/philosophy',
      },
    ],
  };

  return (
    <main id="main-content" style={main}>
      <PageHeader currentPage={isSpanish ? 'Acerca de' : 'About'} />

      <section style={heroSection}>
        <div aria-hidden="true" style={heroImage} />
        <div aria-hidden="true" style={heroOverlay} />
        <div style={wrap}>
          <p style={eyebrow}>ABOUT ELIMFILTERS</p>
          <h1 style={heroTitle}>{copy.heroTitle}</h1>
          <p style={heroLead}>{copy.heroLead}</p>
        </div>
      </section>

      <section style={essenceSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.essenceEyebrow}</p>
          <h2 style={essenceTitle}>{copy.essenceTitle}</h2>
          <p style={essenceBody}>{copy.essenceBody}</p>
        </div>
      </section>

      <section style={cardsSection}>
        <div style={wrap}>
          <div style={cardsGrid}>
            {copy.cards.map((card) => (
              <Link key={card.href} href={card.href} style={cardLink}>
                <h2 style={cardTitle}>{card.title}</h2>
                <p style={cardBody}>{card.body}</p>
                <span style={exploreLabel}>{isSpanish ? 'LEER MÁS →' : 'READ MORE →'}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };
const heroSection: CSSProperties = { minHeight: '58vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem,10vw,9rem) clamp(1.25rem,6vw,6rem)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundImage: 'url(/images/grupo-filters.avif)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: .38 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.48) 58%,rgba(0,0,0,.2)),radial-gradient(circle at 80% 15%,rgba(255,241,45,.14),transparent 32%)' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', margin: '0 0 1rem', textTransform: 'uppercase', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = { position: 'relative', zIndex: 2, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-.05em', lineHeight: .92, fontSize: 'clamp(2.6rem,6vw,5.5rem)', margin: 0, textTransform: 'uppercase' };
const heroLead: CSSProperties = { position: 'relative', zIndex: 2, marginTop: '1.5rem', maxWidth: '820px', color: 'rgba(255,255,255,.82)', fontSize: 'clamp(1rem,1.5vw,1.25rem)', lineHeight: 1.75, fontWeight: 550 };
const essenceSection: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const essenceTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.4vw,3rem)', lineHeight: 1.05, letterSpacing: '-.03em', maxWidth: '900px', margin: '0 0 1.25rem', textTransform: 'uppercase' };
const essenceBody: CSSProperties = { color: 'rgba(255,255,255,.72)', lineHeight: 1.8, maxWidth: '860px', fontSize: '1.03rem' };
const cardsSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const cardsGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)' };
const cardLink: CSSProperties = { background: '#080808', padding: '2.25rem 2rem', textDecoration: 'none', color: '#fff', display: 'flex', flexDirection: 'column' };
const cardTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-.02em', textTransform: 'uppercase', margin: '0 0 1rem' };
const cardBody: CSSProperties = { color: 'rgba(255,255,255,.68)', fontSize: '.95rem', lineHeight: 1.7, margin: 0, flexGrow: 1 };
const exploreLabel: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.14em', fontSize: '.68rem', marginTop: '1.5rem', display: 'inline-block' };
