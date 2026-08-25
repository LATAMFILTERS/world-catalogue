'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';

export default function WhoWeArePage() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');

  const copy = isSpanish ? {
    heroTitle: 'Quiénes Somos',
    heroLead: 'ELIMFILTERS® es una organización de ingeniería de filtración industrial enfocada en proteger activos críticos mediante control disciplinado de contaminación, inteligencia de aplicación, arquitectura de producto validada y ejecución comercial confiable.',
    identityTitle: 'Filtración industrial diseñada alrededor del activo',
    identityBody: 'El filtro es el medio. La protección del activo es el objetivo. ELIMFILTERS desarrolla soluciones de filtración a partir de la condición operativa del equipo protegido, integrando conocimiento técnico, arquitectura de producto, manufactura calificada, validación, inteligencia de aplicación y ejecución de mercado.',
    pillarsTitle: 'Cuatro principios rigen cada sistema de protección.',
    pillars: [
      { title: 'Ingeniería centrada en el activo', body: 'El filtro es el medio; la protección del activo es el objetivo. Cada solución se desarrolla a partir de la condición operativa real del equipo, no de un catálogo genérico.' },
      { title: 'Validación basada en aplicación', body: 'Cada sistema de protección se somete a bancos de prueba dedicados que reproducen presión, flujo, temperatura y contaminantes reales, apoyados en modelado físico y simulación por IA.' },
      { title: 'Arquitectura por sistema', body: 'La plataforma se organiza primero por sistema de protección, luego por tecnología canónica, después por familia de producto, y por último por número de parte individual.' },
      { title: 'Ejecución comercial confiable', body: 'La disponibilidad se sostiene mediante una red de socios comerciales calificados y una operación global distributor-first con capacidad coordinada para cuentas estratégicas.' },
    ],
    environmentEyebrow: 'RESPONSABILIDAD AMBIENTAL',
    environmentTitle: 'El control de contaminación también es una disciplina ambiental.',
    environmentBody: 'Cada hora que un activo opera limpio es tiempo de inactividad, combustible y reemplazo prematuro de piezas que se evitan. Extender la vida útil de los componentes mediante control disciplinado de contaminación reduce el costo ambiental del ciclo de vida del equipo, no solo su costo operativo.',
    closingEyebrow: 'INGENIERÍA QUE SE PUEDE NOMBRAR',
    closingTitle: 'Nueve tecnologías propietarias, cada una construida para un mecanismo de contaminación específico.',
    closingBody: 'MACROCORE, MICROKAPPA, SYNTRAX, SYNTAPORE, NANOFORCE, THERMACORE, INTEKCORE, DRYCORE y HYDROCORE son tecnologías propias de ELIMFILTERS, no un medio genérico vendido para cada sistema. Cada una está asignada a un dominio de protección específico: aire de motor, aire de cabina, combustible, lubricación, hidráulico o sistema de enfriamiento.',
  } : {
    heroTitle: 'Who We Are',
    heroLead: 'ELIMFILTERS® is an industrial filtration engineering organization focused on protecting critical assets through disciplined contamination control, application intelligence, validated product architecture, and reliable commercial execution.',
    identityTitle: 'Industrial filtration engineered around the asset',
    identityBody: 'The filter is the means. Asset protection is the objective. ELIMFILTERS develops filtration solutions around the operating condition of the protected equipment, connecting technical knowledge, product architecture, qualified manufacturing, validation, application intelligence, and market execution.',
    pillarsTitle: 'Four principles govern every protection system.',
    pillars: [
      { title: 'Asset-first engineering', body: 'The filter is the means; asset protection is the objective. Every solution is developed from the real operating condition of the equipment, not a generic catalog entry.' },
      { title: 'Application-based validation', body: 'Every protection system runs through dedicated test equipment that reproduces real pressure, flow, temperature, and contaminant conditions, backed by physics-based modeling and AI-generated simulation.' },
      { title: 'System-level architecture', body: 'The platform is structured around protection systems first, canonical technologies second, product families third, and individual part numbers last.' },
      { title: 'Reliable commercial execution', body: 'Availability is sustained through a network of qualified commercial partners and distributor-first global operations with coordinated strategic-account capability.' },
    ],
    environmentEyebrow: 'ENVIRONMENTAL RESPONSIBILITY',
    environmentTitle: 'Contamination control is also an environmental discipline.',
    environmentBody: 'Every hour an asset operates clean is unplanned downtime, fuel waste, and premature part replacement avoided. Extending component life through disciplined contamination control reduces the environmental cost of the equipment lifecycle, not only its operating cost.',
    closingEyebrow: 'ENGINEERING YOU CAN NAME',
    closingTitle: 'Nine proprietary technologies, each built for one contamination mechanism.',
    closingBody: 'MACROCORE, MICROKAPPA, SYNTRAX, SYNTAPORE, NANOFORCE, THERMACORE, INTEKCORE, DRYCORE, and HYDROCORE are ELIMFILTERS’ own filtration technologies, not one generic media sold across every system. Each is assigned to a specific protection domain: engine air, cabin air, fuel, lubrication, hydraulic, or cooling-system circuits.',
  };

  return (
    <main id="main-content" style={main}>
      <PageHeader breadcrumbs={[{ label: 'About', href: '/about' }]} currentPage={isSpanish ? 'Quiénes Somos' : 'Who We Are'} />

      <section style={heroSection}>
        <div aria-hidden="true" style={heroImage} />
        <div aria-hidden="true" style={heroOverlay} />
        <div style={wrap}>
          <p style={eyebrow}>ELIMFILTERS · {isSpanish ? 'QUIÉNES SOMOS' : 'WHO WE ARE'}</p>
          <h1 style={heroTitle}>{copy.heroTitle}</h1>
          <p style={heroLead}>{copy.heroLead}</p>
        </div>
      </section>

      <section style={lightSection}>
        <div style={identityGrid}>
          <div>
            <p style={darkEyebrow}>ELIMFILTERS · ASSET PROTECTION SYSTEMS</p>
            <h2 style={darkTitle}>{copy.identityTitle}</h2>
            <p style={darkBody}>{copy.identityBody}</p>
          </div>
          <div style={identityPhotoShell}>
            <img src="/images/planta_converted.avif" alt="ELIMFILTERS manufacturing facility" style={portraitImage} />
          </div>
        </div>
      </section>

      <section style={pillarsSection}>
        <div style={wrap}>
          <p style={eyebrow}>{isSpanish ? 'CÓMO LO HACEMOS' : 'HOW WE DO IT'}</p>
          <h2 style={sectionTitle}>{copy.pillarsTitle}</h2>
          <div style={pillarsGrid}>
            {copy.pillars.map((pillar) => (
              <div key={pillar.title} style={pillarCard}>
                <h3 style={pillarTitle}>{pillar.title}</h3>
                <p style={pillarBody}>{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={darkSectionDivided}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.environmentEyebrow}</p>
          <h2 style={sectionTitle}>{copy.environmentTitle}</h2>
          <p style={sectionLead}>{copy.environmentBody}</p>
        </div>
      </section>

      <section style={closingSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.closingEyebrow}</p>
          <h2 style={closingTitle}>{copy.closingTitle}</h2>
          <p style={closingBody}>{copy.closingBody}</p>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };
const heroSection: CSSProperties = { minHeight: '76vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem,10vw,9rem) clamp(1.25rem,6vw,6rem)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundImage: 'url(/images/grupo-filters.avif)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: .38 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.48) 58%,rgba(0,0,0,.2)),radial-gradient(circle at 80% 15%,rgba(255,241,45,.14),transparent 32%)' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', margin: '0 0 1rem', textTransform: 'uppercase', position: 'relative', zIndex: 2 };
const darkEyebrow: CSSProperties = { ...eyebrow, color: '#6c6100' };
const heroTitle: CSSProperties = { position: 'relative', zIndex: 2, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-.05em', lineHeight: .92, fontSize: 'clamp(3.2rem,7vw,7rem)', margin: 0, textTransform: 'uppercase' };
const heroLead: CSSProperties = { position: 'relative', zIndex: 2, marginTop: '1.5rem', maxWidth: '900px', color: 'rgba(255,255,255,.82)', fontSize: 'clamp(1rem,1.5vw,1.25rem)', lineHeight: 1.75, fontWeight: 550 };
const lightSection: CSSProperties = { background: '#050505', color: '#fff', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const identityGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'center' };
const identityPhotoShell: CSSProperties = { aspectRatio: '4 / 3', overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.1)' };
const portraitImage: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
const darkTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 1, letterSpacing: '-.035em', maxWidth: '850px', margin: '0 0 1.5rem', textTransform: 'uppercase' };
const darkBody: CSSProperties = { maxWidth: '880px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, fontSize: '1.05rem' };
const pillarsSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const sectionTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 1, letterSpacing: '-.035em', maxWidth: '950px', margin: '0 0 1rem', textTransform: 'uppercase' };
const sectionLead: CSSProperties = { color: 'rgba(255,255,255,.68)', lineHeight: 1.75, maxWidth: '900px', fontSize: '1.03rem' };
const pillarsGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)', marginTop: '2.5rem' };
const pillarCard: CSSProperties = { background: '#050505', padding: '1.75rem' };
const pillarTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-.01em', textTransform: 'uppercase', margin: '0 0 .8rem', color: '#FFF12D' };
const pillarBody: CSSProperties = { color: 'rgba(255,255,255,.68)', fontSize: '.92rem', lineHeight: 1.65, margin: 0 };
const darkSectionDivided: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const closingSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,241,45,.16)' };
const closingTitle: CSSProperties = { ...sectionTitle, maxWidth: '900px' };
const closingBody: CSSProperties = { ...sectionLead, maxWidth: '850px' };
