'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { AboutSubnav } from '@/components/AboutSubnav';
import '@/i18n';

const COPY_EN = {
  heroTitle: 'Who We Are',
  heroLead: 'ELIMFILTERS® is an industrial filtration engineering organization focused on protecting critical assets through disciplined contamination control, application intelligence, validated product architecture, and reliable commercial execution.',
  identityTitle: 'Industrial filtration engineered around the asset',
  identityBody: 'The filter is the means. Asset protection is the objective. ELIMFILTERS develops filtration solutions around the operating condition of the protected equipment, connecting technical knowledge, product architecture, qualified manufacturing, validation, application intelligence, and market execution.',
  systemsTitle: 'What We Protect',
  systemsLead: 'Our technical architecture is organized around five protection systems that reflect the major contamination-control functions of mobile and industrial equipment.',
  howTitle: 'How We Operate',
  howBody: 'ELIMFILTERS combines engineering knowledge, structured product intelligence, automation, and specialized AI systems to support technical and commercial execution. The company is human-governed, with clearly defined authority, accountability, and escalation for agent-operated functions.',
  leadershipTitle: 'Leadership',
  leadershipBody: 'ELIMFILTERS is led by its Founder & CEO through a specialized executive operating structure. Executive AI agents manage defined business domains under delegated authority, measurable responsibilities, and human executive accountability.',
  leadershipLink: 'Meet our Leadership →',
  philosophyTitle: 'Engineering Philosophy',
  philosophyBody: 'Engineering decisions are governed by evidence, application context, physical validation, technical integrity, and the operating value of the asset being protected.',
  philosophyLink: 'Explore our Engineering Philosophy →',
  structureTitle: 'Corporate Structure',
  ownerLabel: 'Brand Owner',
  headquartersLabel: 'Legal Headquarters',
  operatingLabel: 'Operating Model',
  operatingValue: 'Distributor-first global operations with coordinated strategic-account capability',
  networkTitle: 'Commercial Partner Network',
  networkBody: 'Qualified commercial partners extend ELIMFILTERS technical capability, product access, inventory strategy, customer relationships, and local market execution.',
  networkLink: 'Explore Commercial Partner Network →',
  knowledgeTitle: 'Knowledge Resources',
  knowledgeBody: 'Technical knowledge on filtration standards, contamination control, application behavior, product intelligence, operating conditions, and asset-protection principles.',
  knowledgeLink: 'Access Knowledge Center →',
  closingTitle: 'Built for capability, not apparent headcount.',
  closingBody: 'Our operating model is designed to scale competence, speed, continuity, and technical discipline before adding organizational complexity. Product integrity and customer outcomes remain the measure of whether the model works.',
};

const COPY_ES = {
  heroTitle: 'Quiénes Somos',
  heroLead: 'ELIMFILTERS® es una organización de ingeniería de filtración industrial enfocada en proteger activos críticos mediante control disciplinado de contaminación, inteligencia de aplicación, arquitectura de producto validada y ejecución comercial confiable.',
  identityTitle: 'Filtración industrial diseñada alrededor del activo',
  identityBody: 'El filtro es el medio. La protección del activo es el objetivo. ELIMFILTERS desarrolla soluciones de filtración a partir de la condición operativa del equipo protegido, integrando conocimiento técnico, arquitectura de producto, manufactura calificada, validación, inteligencia de aplicación y ejecución de mercado.',
  systemsTitle: 'Qué Protegemos',
  systemsLead: 'Nuestra arquitectura técnica se organiza alrededor de cinco sistemas de protección que representan las principales funciones de control de contaminación en equipos móviles e industriales.',
  howTitle: 'Cómo Operamos',
  howBody: 'ELIMFILTERS integra conocimiento de ingeniería, inteligencia estructurada de producto, automatización y sistemas especializados de IA para apoyar la ejecución técnica y comercial. La compañía permanece bajo gobierno humano, con autoridad, responsabilidad y reglas de escalamiento claramente definidas para las funciones operadas por agentes.',
  leadershipTitle: 'Liderazgo',
  leadershipBody: 'ELIMFILTERS es dirigida por su Fundador & CEO mediante una estructura ejecutiva especializada. Los agentes ejecutivos de IA gestionan dominios definidos del negocio bajo autoridad delegada, responsabilidades medibles y accountability ejecutivo humano.',
  leadershipLink: 'Conoce nuestro Liderazgo →',
  philosophyTitle: 'Filosofía de Ingeniería',
  philosophyBody: 'Las decisiones de ingeniería se rigen por evidencia, contexto de aplicación, validación física, integridad técnica y el valor operativo del activo que se protege.',
  philosophyLink: 'Explorar Filosofía de Ingeniería →',
  structureTitle: 'Estructura Corporativa',
  ownerLabel: 'Propietario de la Marca',
  headquartersLabel: 'Sede Legal',
  operatingLabel: 'Modelo Operativo',
  operatingValue: 'Operación global distributor-first con capacidad coordinada para cuentas estratégicas',
  networkTitle: 'Red de Socios Comerciales',
  networkBody: 'Los socios comerciales calificados amplían la capacidad técnica de ELIMFILTERS, el acceso al producto, la estrategia de inventario, las relaciones con clientes y la ejecución local.',
  networkLink: 'Explorar Red de Socios Comerciales →',
  knowledgeTitle: 'Recursos de Conocimiento',
  knowledgeBody: 'Conocimiento técnico sobre normas de filtración, control de contaminación, comportamiento de aplicaciones, inteligencia de producto, condiciones operativas y principios de protección de activos.',
  knowledgeLink: 'Acceder al Centro de Conocimiento →',
  closingTitle: 'Construidos para capacidad, no para aparentar tamaño.',
  closingBody: 'Nuestro modelo operativo está diseñado para escalar competencia, velocidad, continuidad y disciplina técnica antes de añadir complejidad organizacional. La integridad del producto y los resultados del cliente siguen siendo la medida de si el modelo funciona.',
};

const SYSTEMS = [
  'Air Intake & Airflow Protection',
  'Fuel Cleanliness Protection',
  'Lubrication Protection',
  'Hydraulic Protection',
  'Cooling System Protection',
];

export default function AboutPage() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const copy = isSpanish ? COPY_ES : COPY_EN;

  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://elimfilters.com/#organization',
    name: 'ELIMFILTERS®',
    alternateName: 'ELIMFILTERS',
    legalName: 'Kleo Technology LLC',
    url: 'https://elimfilters.com',
    logo: { '@type': 'ImageObject', url: 'https://elimfilters.com/images/logo-sin-fondo.avif' },
    email: 'info@elimfilters.com',
    areaServed: 'Worldwide',
    description: copy.heroLead,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Frisco',
      addressRegion: 'TX',
      addressCountry: 'US',
      addressType: 'Legal Headquarters',
    },
  };

  return (
    <main id="main-content" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
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

      <section style={lightSection}>
        <div style={wrap}>
          <p style={darkEyebrow}>ELIMFILTERS · ASSET PROTECTION SYSTEMS</p>
          <h2 style={darkTitle}>{copy.identityTitle}</h2>
          <p style={darkBody}>{copy.identityBody}</p>
        </div>
      </section>

      <section style={darkSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.systemsTitle}</p>
          <h2 style={sectionTitle}>{copy.systemsLead}</h2>
          <div style={systemsGrid}>
            {SYSTEMS.map((system, index) => (
              <article key={system} style={systemCard}>
                <span style={number}>{String(index + 1).padStart(2, '0')}</span>
                <h3 style={cardTitle}>{system}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={splitSection}>
        <div style={splitGrid}>
          <article style={featureCard}>
            <p style={eyebrow}>{copy.howTitle}</p>
            <h2 style={featureTitle}>Human-governed. AI-native execution.</h2>
            <p style={bodyText}>{copy.howBody}</p>
          </article>
          <article style={featureCard}>
            <p style={eyebrow}>{copy.leadershipTitle}</p>
            <h2 style={featureTitle}>Executive responsibility with specialized execution.</h2>
            <p style={bodyText}>{copy.leadershipBody}</p>
            <Link href="/about/leadership" style={textLink}>{copy.leadershipLink}</Link>
          </article>
          <article style={featureCard}>
            <p style={eyebrow}>{copy.philosophyTitle}</p>
            <h2 style={featureTitle}>Engineering before marketing.</h2>
            <p style={bodyText}>{copy.philosophyBody}</p>
            <Link href="/about/philosophy" style={textLink}>{copy.philosophyLink}</Link>
          </article>
        </div>
      </section>

      <section style={corporateSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.structureTitle}</p>
          <ul style={structureList}>
            <li><strong style={label}>{copy.ownerLabel}:</strong> Kleo Technology LLC</li>
            <li><strong style={label}>{copy.headquartersLabel}:</strong> Frisco, Texas, USA</li>
            <li><strong style={label}>{copy.operatingLabel}:</strong> {copy.operatingValue}</li>
          </ul>
          <div style={twoCol}>
            <div>
              <p style={eyebrow}>{copy.networkTitle}</p>
              <p style={bodyText}>{copy.networkBody}</p>
              <Link href="/distributors" style={textLink}>{copy.networkLink}</Link>
            </div>
            <div>
              <p style={eyebrow}>{copy.knowledgeTitle}</p>
              <p style={bodyText}>{copy.knowledgeBody}</p>
              <Link href="/knowledge-center/" style={textLink}>{copy.knowledgeLink}</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={closingSection}>
        <div style={wrap}>
          <p style={eyebrow}>OPERATING PRINCIPLE</p>
          <h2 style={closingTitle}>{copy.closingTitle}</h2>
          <p style={closingBody}>{copy.closingBody}</p>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };
const heroSection: CSSProperties = { minHeight: '76vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundImage: 'url(/images/grupo-filters.avif)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.38 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.48) 58%, rgba(0,0,0,.2)), radial-gradient(circle at 80% 15%, rgba(255,241,45,.14), transparent 32%)' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', margin: '0 0 1rem', textTransform: 'uppercase', position: 'relative', zIndex: 2 };
const darkEyebrow: CSSProperties = { ...eyebrow, color: '#6c6100' };
const heroTitle: CSSProperties = { position: 'relative', zIndex: 2, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-.05em', lineHeight: .92, fontSize: 'clamp(3.2rem, 7vw, 7rem)', margin: 0, textTransform: 'uppercase' };
const heroLead: CSSProperties = { position: 'relative', zIndex: 2, marginTop: '1.5rem', maxWidth: '900px', color: 'rgba(255,255,255,.82)', fontSize: 'clamp(1rem,1.5vw,1.25rem)', lineHeight: 1.75, fontWeight: 550 };
const lightSection: CSSProperties = { background: '#f2f2ef', color: '#111', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const darkTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 1, letterSpacing: '-.035em', maxWidth: '850px', margin: '0 0 1.5rem', textTransform: 'uppercase' };
const darkBody: CSSProperties = { maxWidth: '880px', color: '#3d3d3a', lineHeight: 1.8, fontSize: '1.05rem' };
const darkSection: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.7vw,3.7rem)', lineHeight: 1.05, letterSpacing: '-.03em', maxWidth: '950px', margin: '0 0 2.5rem' };
const systemsGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)' };
const systemCard: CSSProperties = { background: '#080808', padding: '1.5rem', minHeight: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const number: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', letterSpacing: '.14em', fontWeight: 700 };
const cardTitle: CSSProperties = { margin: '1.5rem 0 0', fontFamily: 'var(--font-display)', fontSize: '1.05rem', lineHeight: 1.2, textTransform: 'uppercase' };
const splitSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const splitGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)' };
const featureCard: CSSProperties = { background: '#050505', padding: 'clamp(1.5rem,3vw,2.3rem)' };
const featureTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.45rem,2.5vw,2.2rem)', lineHeight: 1.08, letterSpacing: '-.02em', margin: '0 0 1rem' };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,.66)', fontSize: '1rem', lineHeight: 1.75, margin: '0 0 1.25rem' };
const textLink: CSSProperties = { color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.82rem', letterSpacing: '.08em', textTransform: 'uppercase' };
const corporateSection: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,241,45,.14)' };
const structureList: CSSProperties = { listStyle: 'none', padding: 0, margin: '0 0 3rem', display: 'flex', flexDirection: 'column', gap: '.9rem', color: 'rgba(255,255,255,.7)', lineHeight: 1.65 };
const label: CSSProperties = { color: '#FFF12D' };
const twoCol: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(2rem,5vw,4rem)' };
const closingSection: CSSProperties = { background: '#000', padding: 'clamp(5rem,9vw,8rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const closingTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4.5vw,4.5rem)', lineHeight: 1, letterSpacing: '-.04em', maxWidth: '900px', margin: '0 0 1.25rem', textTransform: 'uppercase' };
const closingBody: CSSProperties = { maxWidth: '820px', color: 'rgba(255,255,255,.68)', lineHeight: 1.8, fontSize: '1.05rem' };
