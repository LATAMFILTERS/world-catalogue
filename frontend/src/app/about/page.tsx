'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { AboutSubnav } from '@/components/AboutSubnav';
import registry from '@/data/executive-visual-identity.json';
import '@/i18n';

const SYSTEMS = [
  'Air Intake & Airflow Protection',
  'Fuel Cleanliness Protection',
  'Lubrication Protection',
  'Hydraulic Protection',
  'Cooling System Protection',
];

const RESPONSIBILITIES: Record<string, { en: string; es: string }> = {
  office_chief_operating_supply_chain: {
    en: 'Operations, procurement, supply continuity, logistics, fulfillment, and operational quality.',
    es: 'Operaciones, compras, continuidad de suministro, logística, fulfillment y calidad operacional.',
  },
  office_chief_product_technology: {
    en: 'Product architecture, filtration technologies, applications, validation, catalog integrity, and technical knowledge governance.',
    es: 'Arquitectura de producto, tecnologías de filtración, aplicaciones, validación, integridad de catálogo y gobernanza del conocimiento técnico.',
  },
  office_chief_commercial_markets: {
    en: 'B2B growth, distributors, strategic accounts, market development, CRM, pricing discipline, and customer intelligence.',
    es: 'Crecimiento B2B, distribuidores, cuentas estratégicas, desarrollo de mercados, CRM, disciplina de precios e inteligencia de clientes.',
  },
  office_chief_finance_risk: {
    en: 'Liquidity, margins, forecasting, working capital, financial discipline, and enterprise-risk visibility.',
    es: 'Liquidez, márgenes, forecasting, capital de trabajo, disciplina financiera y visibilidad de riesgos empresariales.',
  },
  office_chief_strategy_performance_intelligence: {
    en: 'Strategy support, performance intelligence, AI governance, data, automation, digital architecture, and agent governance.',
    es: 'Soporte estratégico, inteligencia de desempeño, gobernanza de IA, datos, automatización, arquitectura digital y gobernanza de agentes.',
  },
};

export default function AboutPage() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const founder = registry.founder;

  const copy = isSpanish ? {
    heroTitle: 'Quiénes Somos',
    heroLead: 'ELIMFILTERS® es una organización de ingeniería de filtración industrial enfocada en proteger activos críticos mediante control disciplinado de contaminación, inteligencia de aplicación, arquitectura de producto validada y ejecución comercial confiable.',
    identityTitle: 'Filtración industrial diseñada alrededor del activo',
    identityBody: 'El filtro es el medio. La protección del activo es el objetivo. ELIMFILTERS desarrolla soluciones de filtración a partir de la condición operativa del equipo protegido, integrando conocimiento técnico, arquitectura de producto, manufactura calificada, validación, inteligencia de aplicación y ejecución de mercado.',
    systemsTitle: 'Qué Protegemos',
    systemsLead: 'Nuestra arquitectura técnica se organiza alrededor de cinco sistemas de protección que representan las principales funciones de control de contaminación en equipos móviles e industriales.',
    leadershipLead: 'ELIMFILTERS combina autoridad ejecutiva humana con funciones ejecutivas especializadas operadas por agentes de IA bajo un marco formal de responsabilidad, autoridad delegada, trazabilidad y escalamiento.',
    founderBody: 'Como Founder & CEO, Víctor dirige la visión, la estrategia y la autoridad ejecutiva final de ELIMFILTERS. La Chief Executive Office conserva la responsabilidad institucional sobre la estructura ejecutiva y las decisiones materiales de la compañía.',
    agentsLead: 'Estos perfiles son las representaciones visuales oficiales de agentes ejecutivos de IA, no empleados humanos. Cada agente gestiona un dominio definido bajo autoridad delegada y supervisión de la Chief Executive Office.',
    philosophyTitle: 'Filosofía de Ingeniería',
    philosophyBody: 'Las decisiones de ingeniería se rigen por evidencia, contexto de aplicación, validación física, integridad técnica y el valor operativo del activo que se protege. La inteligencia artificial puede apoyar análisis y ejecución, pero no sustituye la validación física, la trazabilidad ni el juicio técnico profesional.',
    structureTitle: 'Estructura Corporativa',
    networkTitle: 'Red de Socios Comerciales',
    networkBody: 'Los socios comerciales calificados amplían la capacidad técnica de ELIMFILTERS, el acceso al producto, la estrategia de inventario, las relaciones con clientes y la ejecución local.',
    knowledgeTitle: 'Recursos de Conocimiento',
    knowledgeBody: 'Conocimiento técnico sobre normas de filtración, control de contaminación, comportamiento de aplicaciones, inteligencia de producto, condiciones operativas y principios de protección de activos.',
    closingTitle: 'Construidos para capacidad, no para aparentar tamaño.',
    closingBody: 'Nuestro modelo operativo está diseñado para escalar competencia, velocidad, continuidad y disciplina técnica antes de añadir complejidad organizacional. La integridad del producto y los resultados del cliente siguen siendo la medida de si el modelo funciona.',
  } : {
    heroTitle: 'Who We Are',
    heroLead: 'ELIMFILTERS® is an industrial filtration engineering organization focused on protecting critical assets through disciplined contamination control, application intelligence, validated product architecture, and reliable commercial execution.',
    identityTitle: 'Industrial filtration engineered around the asset',
    identityBody: 'The filter is the means. Asset protection is the objective. ELIMFILTERS develops filtration solutions around the operating condition of the protected equipment, connecting technical knowledge, product architecture, qualified manufacturing, validation, application intelligence, and market execution.',
    systemsTitle: 'What We Protect',
    systemsLead: 'Our technical architecture is organized around five protection systems that reflect the major contamination-control functions of mobile and industrial equipment.',
    leadershipLead: 'ELIMFILTERS combines human executive authority with specialized executive functions operated by AI agents under a formal framework of accountability, delegated authority, traceability, and escalation.',
    founderBody: 'As Founder & CEO, Víctor leads the vision, strategy, and final executive authority of ELIMFILTERS. The Chief Executive Office retains institutional accountability for the executive structure and material company decisions.',
    agentsLead: 'These profiles are the official visual representations of executive AI agents, not human employees. Each agent manages a defined domain under delegated authority and oversight of the Chief Executive Office.',
    philosophyTitle: 'Engineering Philosophy',
    philosophyBody: 'Engineering decisions are governed by evidence, application context, physical validation, technical integrity, and the operating value of the protected asset. Artificial intelligence may support analysis and execution, but it does not replace physical validation, traceability, or professional engineering judgment.',
    structureTitle: 'Corporate Structure',
    networkTitle: 'Commercial Partner Network',
    networkBody: 'Qualified commercial partners extend ELIMFILTERS technical capability, product access, inventory strategy, customer relationships, and local market execution.',
    knowledgeTitle: 'Knowledge Resources',
    knowledgeBody: 'Technical knowledge on filtration standards, contamination control, application behavior, product intelligence, operating conditions, and asset-protection principles.',
    closingTitle: 'Built for capability, not apparent headcount.',
    closingBody: 'Our operating model is designed to scale competence, speed, continuity, and technical discipline before adding organizational complexity. Product integrity and customer outcomes remain the measure of whether the model works.',
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

      <section id="leadership" style={leadershipIntroSection}>
        <div style={wrap}>
          <p style={eyebrow}>LEADERSHIP</p>
          <h2 style={sectionTitle}>{isSpanish ? 'Liderazgo humano. Ejecución AI-native.' : 'Human leadership. AI-native execution.'}</h2>
          <p style={sectionLead}>{copy.leadershipLead}</p>
        </div>
      </section>

      <section style={founderSection}>
        <div style={founderGrid}>
          <div style={founderPhotoShell}>
            <img src={founder.image} alt={founder.alt} style={portraitImage} />
          </div>
          <div>
            <p style={darkEyebrow}>FOUNDER & CEO</p>
            <h2 style={founderName}>{founder.name}</h2>
            <p style={founderRole}>{founder.designation}</p>
            <p style={darkBody}>{copy.founderBody}</p>
          </div>
        </div>
      </section>

      <section style={agentsSection}>
        <div style={wrap}>
          <p style={eyebrow}>EXECUTIVE AI LEADERSHIP</p>
          <h2 style={sectionTitle}>{isSpanish ? 'Cinco funciones ejecutivas especializadas.' : 'Five specialized executive functions.'}</h2>
          <p style={sectionLead}>{copy.agentsLead}</p>
          <div style={agentsGrid}>
            {registry.agents.map((agent) => {
              const responsibility = RESPONSIBILITIES[agent.id];
              return (
                <article key={agent.id} style={agentCard}>
                  <div style={agentPhotoShell}>
                    <img src={agent.image} alt={agent.alt} style={portraitImage} />
                  </div>
                  <div style={agentCopy}>
                    <span style={aiLabel}>{agent.label}</span>
                    <h3 style={agentTitle}>{agent.title}</h3>
                    <p style={agentBody}>{isSpanish ? responsibility.es : responsibility.en}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section style={modelSection}>
        <div style={wrap}>
          <p style={eyebrow}>{isSpanish ? 'CÓMO FUNCIONA' : 'HOW THE MODEL WORKS'}</p>
          <h2 style={sectionTitle}>{isSpanish ? 'La oficina permanece. La implementación puede evolucionar.' : 'The office remains. The implementation can evolve.'}</h2>
          <div style={flowGrid}>
            <Flow n="01" title="Chief Executive Office" detail={isSpanish ? 'Autoridad humana final' : 'Final human authority'} />
            <Flow n="02" title="Executive AI Agents" detail={isSpanish ? 'Responsabilidad por dominio' : 'Domain accountability'} />
            <Flow n="03" title="Specialized Subagents" detail={isSpanish ? 'Ejecución especializada' : 'Specialized execution'} />
            <Flow n="04" title="Systems & Automation" detail={isSpanish ? 'Escala y continuidad' : 'Scale and continuity'} />
          </div>
        </div>
      </section>

      <section style={governanceSection}>
        <div style={governanceGrid}>
          <div>
            <p style={darkEyebrow}>GOVERNANCE & ACCOUNTABILITY</p>
            <h2 style={darkTitle}>{isSpanish ? 'La responsabilidad nunca se vuelve artificial.' : 'Accountability never becomes artificial.'}</h2>
          </div>
          <p style={darkBody}>{isSpanish ? 'La inteligencia artificial puede ejercer autoridad delegada dentro de ELIMFILTERS, pero las decisiones estratégicas, materiales, excepcionales, irreversibles o de alto riesgo permanecen sujetas a autoridad humana.' : 'Artificial intelligence may exercise delegated authority within ELIMFILTERS, but strategic, material, exceptional, irreversible, or high-risk decisions remain subject to human authority.'}</p>
        </div>
      </section>

      <section id="engineering-philosophy" style={philosophySection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.philosophyTitle}</p>
          <h2 style={sectionTitle}>{isSpanish ? 'Ingeniería antes que marketing.' : 'Engineering before marketing.'}</h2>
          <p style={sectionLead}>{copy.philosophyBody}</p>
          <Link href="/about/philosophy" style={textLink}>{isSpanish ? 'Leer la filosofía completa →' : 'Read the full engineering philosophy →'}</Link>
        </div>
      </section>

      <section style={corporateSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.structureTitle}</p>
          <ul style={structureList}>
            <li><strong style={label}>{isSpanish ? 'Propietario de la Marca' : 'Brand Owner'}:</strong> Kleo Technology LLC</li>
            <li><strong style={label}>{isSpanish ? 'Sede Legal' : 'Legal Headquarters'}:</strong> Frisco, Texas, USA</li>
            <li><strong style={label}>{isSpanish ? 'Modelo Operativo' : 'Operating Model'}:</strong> {isSpanish ? 'Operación global distributor-first con capacidad coordinada para cuentas estratégicas' : 'Distributor-first global operations with coordinated strategic-account capability'}</li>
          </ul>
          <div style={twoCol}>
            <div>
              <p style={eyebrow}>{copy.networkTitle}</p>
              <p style={bodyText}>{copy.networkBody}</p>
              <Link href="/distributors" style={textLink}>{isSpanish ? 'Explorar Red de Socios Comerciales →' : 'Explore Commercial Partner Network →'}</Link>
            </div>
            <div>
              <p style={eyebrow}>{copy.knowledgeTitle}</p>
              <p style={bodyText}>{copy.knowledgeBody}</p>
              <Link href="/knowledge-center/" style={textLink}>{isSpanish ? 'Acceder al Centro de Conocimiento →' : 'Access Knowledge Center →'}</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={closingSection}>
        <div style={wrap}>
          <p style={eyebrow}>CAPABILITY BEFORE COMPLEXITY</p>
          <h2 style={closingTitle}>{copy.closingTitle}</h2>
          <p style={closingBody}>{copy.closingBody}</p>
        </div>
      </section>
    </main>
  );
}

function Flow({ n, title, detail }: { n: string; title: string; detail: string }) {
  return <div style={flowCard}><span style={number}>{n}</span><h3 style={flowTitle}>{title}</h3><p style={flowDetail}>{detail}</p></div>;
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
const lightSection: CSSProperties = { background: '#f2f2ef', color: '#111', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', scrollMarginTop: '90px' };
const darkSection: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const darkTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 1, letterSpacing: '-.035em', maxWidth: '850px', margin: '0 0 1.5rem', textTransform: 'uppercase' };
const darkBody: CSSProperties = { maxWidth: '880px', color: '#3d3d3a', lineHeight: 1.8, fontSize: '1.05rem' };
const sectionTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 1, letterSpacing: '-.035em', maxWidth: '950px', margin: '0 0 1rem', textTransform: 'uppercase' };
const sectionLead: CSSProperties = { color: 'rgba(255,255,255,.68)', lineHeight: 1.75, maxWidth: '900px', fontSize: '1.03rem' };
const systemsGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)', marginTop: '2.5rem' };
const systemCard: CSSProperties = { background: '#080808', padding: '1.5rem', minHeight: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const number: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', letterSpacing: '.14em', fontWeight: 700 };
const cardTitle: CSSProperties = { margin: '1.5rem 0 0', fontFamily: 'var(--font-display)', fontSize: '1.05rem', lineHeight: 1.2, textTransform: 'uppercase' };
const leadershipIntroSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', scrollMarginTop: '90px' };
const founderSection: CSSProperties = { background: '#f2f2ef', color: '#111', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const founderGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'center' };
const founderPhotoShell: CSSProperties = { aspectRatio: '4 / 5', overflow: 'hidden', background: '#111' };
const portraitImage: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
const founderName: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,5rem)', lineHeight: .95, letterSpacing: '-.04em', margin: '0 0 .6rem' };
const founderRole: CSSProperties = { color: '#6c6100', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const agentsSection: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const agentsGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '1px', background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.09)', marginTop: '2.5rem' };
const agentCard: CSSProperties = { background: '#090909', minWidth: 0 };
const agentPhotoShell: CSSProperties = { aspectRatio: '4 / 5', overflow: 'hidden', background: '#111' };
const agentCopy: CSSProperties = { padding: '1.2rem' };
const aiLabel: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.63rem', fontWeight: 700, letterSpacing: '.14em' };
const agentTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '1rem', lineHeight: 1.2, margin: '.7rem 0 .55rem' };
const agentBody: CSSProperties = { color: 'rgba(255,255,255,.62)', fontSize: '.9rem', lineHeight: 1.6, margin: 0 };
const modelSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const flowGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '1px', background: 'rgba(255,255,255,.1)', marginTop: '2.5rem' };
const flowCard: CSSProperties = { background: '#080808', padding: '1.5rem' };
const flowTitle: CSSProperties = { fontFamily: 'var(--font-display)', margin: '1rem 0 .35rem', fontSize: '1rem' };
const flowDetail: CSSProperties = { margin: 0, color: 'rgba(255,255,255,.58)', fontSize: '.9rem' };
const governanceSection: CSSProperties = { background: '#f2f2ef', color: '#111', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const governanceGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(2rem,6vw,5rem)' };
const philosophySection: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', scrollMarginTop: '90px' };
const corporateSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const structureList: CSSProperties = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,.72)', lineHeight: 1.65 };
const label: CSSProperties = { color: '#FFF12D' };
const twoCol: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(2rem,6vw,5rem)', marginTop: '3rem' };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,.66)', lineHeight: 1.75 };
const textLink: CSSProperties = { display: 'inline-block', marginTop: '1rem', color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.05em' };
const closingSection: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,241,45,.16)' };
const closingTitle: CSSProperties = { ...sectionTitle, maxWidth: '900px' };
const closingBody: CSSProperties = { ...sectionLead, maxWidth: '850px' };
