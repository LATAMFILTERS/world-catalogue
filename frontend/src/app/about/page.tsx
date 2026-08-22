'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { AboutSubnav } from '@/components/AboutSubnav';
import '@/i18n';

export default function AboutPage() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');

  const copy = isSpanish ? {
    heroTitle: 'Quiénes Somos',
    heroLead: 'ELIMFILTERS® es la marca global de filtración industrial de Kleo Technology LLC, enfocada en proteger activos críticos mediante control disciplinado de contaminación, inteligencia de aplicación y arquitectura de producto validada.',
    identityTitle: 'Ingeniería de filtración organizada alrededor del activo',
    identityBody: 'El filtro es el medio. La protección del activo es el objetivo. ELIMFILTERS conecta conocimiento técnico, arquitectura de producto, manufactura calificada, validación, inteligencia de aplicación y ejecución de mercado para ayudar a preservar confiabilidad, continuidad operativa y vida útil.',
    visionTitle: 'Visión de la Compañía',
    visionBody: 'Construir el ecosistema de protección de activos más inteligente del mundo: uno en el que la contaminación se controle antes de causar daño y cada decisión de protección mejore con evidencia, conocimiento e inteligencia.',
    missionTitle: 'Misión',
    missionBody: 'Proteger activos industriales mediante el control de contaminación, ayudando a las organizaciones a mejorar la confiabilidad, reducir tiempos de inactividad y extender la vida útil de sus equipos.',
    philosophyTitle: 'Filosofía de Protección de Activos',
    philosophyBody: 'No comenzamos con el filtro. Comenzamos con el activo, su sistema, su condición operativa y el riesgo que debe controlarse. Los productos implementan tecnologías; las tecnologías deben responder a una estrategia de protección; y la protección debe producir un resultado operativo verificable.',
    positioningTitle: 'Posicionamiento Global',
    positioningBody: 'ELIMFILTERS opera como una organización global de sistemas de protección de activos para aplicaciones industriales, heavy-duty, flotas, equipos y mercados automotrices complementarios. La marca pertenece a Kleo Technology LLC y coordina ingeniería, conocimiento, inteligencia de aplicaciones y desarrollo comercial desde Frisco, Texas.',
    evolutionTitle: 'Evolución de ELIMFILTERS',
    evolutionBody: 'ELIMFILTERS comenzó atendiendo aplicaciones de filtración exigentes. La experiencia en transporte, construcción, minería, agricultura, manufactura, marina, generación de energía y petróleo y gas reveló una realidad común: la contaminación es una de las causas más predecibles y controlables de falla. Esa comprensión transformó el enfoque desde referencias individuales hacia sistemas, tecnologías y estrategias integradas de protección de activos.',
  } : {
    heroTitle: 'Who We Are',
    heroLead: 'ELIMFILTERS® is Kleo Technology LLC’s global industrial filtration brand, focused on protecting critical assets through disciplined contamination control, application intelligence, and validated product architecture.',
    identityTitle: 'Filtration engineering organized around the asset',
    identityBody: 'The filter is the means. Asset protection is the objective. ELIMFILTERS connects technical knowledge, product architecture, qualified manufacturing, validation, application intelligence, and market execution to help preserve reliability, operating continuity, and service life.',
    visionTitle: 'Company Vision',
    visionBody: 'Build the world’s most intelligent asset-protection ecosystem: one in which contamination is controlled before it causes damage and every protection decision improves through evidence, knowledge, and intelligence.',
    missionTitle: 'Mission',
    missionBody: 'Protect industrial assets through contamination control, helping organizations improve reliability, reduce downtime, and extend equipment life.',
    philosophyTitle: 'Asset Protection Philosophy',
    philosophyBody: 'We do not start with the filter. We start with the asset, its system, its operating condition, and the risk that must be controlled. Products implement technologies; technologies must serve a protection strategy; and protection must produce a verifiable operating outcome.',
    positioningTitle: 'Global Positioning',
    positioningBody: 'ELIMFILTERS operates as a global asset-protection systems organization for industrial, heavy-duty, fleet, equipment, and complementary automotive applications. The brand is owned by Kleo Technology LLC and coordinates engineering, knowledge, application intelligence, and commercial development from Frisco, Texas.',
    evolutionTitle: 'Evolution of ELIMFILTERS',
    evolutionBody: 'ELIMFILTERS began by serving demanding filtration applications. Experience across transportation, construction, mining, agriculture, manufacturing, marine, power generation, and oil and gas revealed a common reality: contamination is one of the most predictable and controllable causes of failure. That understanding evolved the organization from individual references toward integrated asset-protection systems, technologies, and strategies.',
  };

  return (
    <main id="main-content" style={main}>
      <PageHeader currentPage="About" />

      <section style={heroSection}>
        <div aria-hidden="true" style={heroImage} />
        <div aria-hidden="true" style={heroOverlay} />
        <div style={wrap}>
          <p style={eyebrow}>ABOUT ELIMFILTERS</p>
          <h1 style={heroTitle}>{copy.heroTitle}</h1>
          <p style={heroLead}>{copy.heroLead}</p>
        </div>
      </section>

      <AboutSubnav />

      <section id="who-we-are" style={lightSection}>
        <div style={wrap}>
          <p style={darkEyebrow}>ELIMFILTERS · ASSET PROTECTION SYSTEMS</p>
          <h2 style={darkTitle}>{copy.identityTitle}</h2>
          <p style={darkBody}>{copy.identityBody}</p>
        </div>
      </section>

      <section style={darkSection}>
        <div style={twoColumn}>
          <article style={statementCard}>
            <p style={eyebrow}>{copy.visionTitle}</p>
            <h2 style={statementTitle}>{copy.visionBody}</h2>
          </article>
          <article style={statementCard}>
            <p style={eyebrow}>{copy.missionTitle}</p>
            <h2 style={statementTitle}>{copy.missionBody}</h2>
          </article>
        </div>
      </section>

      <section id="asset-protection-philosophy" style={philosophySection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.philosophyTitle}</p>
          <h2 style={sectionTitle}>{isSpanish ? 'El activo primero.' : 'The asset comes first.'}</h2>
          <p style={sectionLead}>{copy.philosophyBody}</p>
        </div>
      </section>

      <section id="global-positioning" style={lightSection}>
        <div style={wrap}>
          <p style={darkEyebrow}>{copy.positioningTitle}</p>
          <h2 style={darkTitle}>{isSpanish ? 'Capacidad global. Responsabilidad definida.' : 'Global capability. Defined accountability.'}</h2>
          <p style={darkBody}>{copy.positioningBody}</p>
        </div>
      </section>

      <section id="evolution" style={evolutionSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.evolutionTitle}</p>
          <h2 style={sectionTitle}>{isSpanish ? 'De la filtración a la protección integral del activo.' : 'From filtration to integrated asset protection.'}</h2>
          <p style={sectionLead}>{copy.evolutionBody}</p>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = {
  background: '#000',
  color: '#fff',
  minHeight: '100vh',
  fontFamily: 'var(--font-body)',
};

const wrap: CSSProperties = {
  maxWidth: '1180px',
  margin: '0 auto',
  width: '100%',
};

const heroSection: CSSProperties = {
  minHeight: '76vh',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  padding: 'clamp(6rem,10vw,9rem) clamp(1.25rem,6vw,6rem)',
};

const heroImage: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: 'url(/images/grupo-filters.avif)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.38,
};

const heroOverlay: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.48) 58%,rgba(0,0,0,.2)),radial-gradient(circle at 80% 15%,rgba(255,241,45,.14),transparent 32%)',
};

const eyebrow: CSSProperties = {
  color: '#FFF12D',
  fontFamily: 'var(--font-display)',
  fontSize: '.72rem',
  fontWeight: 700,
  letterSpacing: '.16em',
  margin: '0 0 1rem',
  textTransform: 'uppercase',
  position: 'relative',
  zIndex: 2,
};

const darkEyebrow: CSSProperties = {
  ...eyebrow,
  color: '#6c6100',
};

const heroTitle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  letterSpacing: '-.05em',
  lineHeight: 0.92,
  fontSize: 'clamp(3.2rem,7vw,7rem)',
  margin: 0,
  textTransform: 'uppercase',
};

const heroLead: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  marginTop: '1.5rem',
  maxWidth: '900px',
  color: 'rgba(255,255,255,.82)',
  fontSize: 'clamp(1rem,1.5vw,1.25rem)',
  lineHeight: 1.75,
  fontWeight: 550,
};

const lightSection: CSSProperties = {
  background: '#f2f2ef',
  color: '#111',
  padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)',
  scrollMarginTop: '90px',
};

const darkSection: CSSProperties = {
  background: '#050505',
  padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)',
};

const philosophySection: CSSProperties = {
  background: '#000',
  padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)',
};

const evolutionSection: CSSProperties = {
  background: 'radial-gradient(circle at 80% 0%,rgba(255,241,45,.12),transparent 34%),#050505',
  padding: 'clamp(5rem,9vw,8rem) clamp(1.25rem,6vw,6rem)',
  borderTop: '1px solid rgba(255,255,255,.06)',
};

const twoColumn: CSSProperties = {
  maxWidth: '1180px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
  gap: '1px',
  background: 'rgba(255,255,255,.1)',
  border: '1px solid rgba(255,255,255,.1)',
};

const statementCard: CSSProperties = {
  background: '#080808',
  padding: 'clamp(2rem,4vw,3.5rem)',
  minHeight: '310px',
};

const statementTitle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.5rem,2.7vw,2.7rem)',
  lineHeight: 1.18,
  letterSpacing: '-.025em',
  margin: '2rem 0 0',
  maxWidth: '560px',
};

const darkTitle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(2rem,4vw,4rem)',
  lineHeight: 1,
  letterSpacing: '-.035em',
  maxWidth: '900px',
  margin: '0 0 1.5rem',
  textTransform: 'uppercase',
};

const darkBody: CSSProperties = {
  maxWidth: '900px',
  color: '#3d3d3a',
  lineHeight: 1.8,
  fontSize: '1.05rem',
};

const sectionTitle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(2rem,4vw,4rem)',
  lineHeight: 1,
  letterSpacing: '-.035em',
  maxWidth: '950px',
  margin: '0 0 1rem',
  textTransform: 'uppercase',
};

const sectionLead: CSSProperties = {
  color: 'rgba(255,255,255,.68)',
  lineHeight: 1.78,
  maxWidth: '900px',
  fontSize: '1.05rem',
};
