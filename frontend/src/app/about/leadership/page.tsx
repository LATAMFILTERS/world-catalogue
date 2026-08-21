' use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { AboutSubnav } from '@/components/AboutSubnav';
import '@/i18n';

const AGENTS = [
  {
    id: 'operations',
    title: 'Chief Operating & Supply Chain Agent',
    titleEs: 'Chief Operating & Supply Chain Agent',
    short: 'Operations & Supply Chain',
    shortEs: 'Operaciones & Supply Chain',
    responsibility: 'Operations, procurement, supply continuity, logistics, fulfillment, and operational quality.',
    responsibilityEs: 'Operaciones, compras, continuidad de suministro, logística, fulfillment y calidad operacional.',
    image: '/assets/leadership/chief-operating-supply-chain-agent.jpg',
    initials: 'OS',
  },
  {
    id: 'product',
    title: 'Chief Product & Technology Agent',
    titleEs: 'Chief Product & Technology Agent',
    short: 'Product & Technology',
    shortEs: 'Producto & Tecnología',
    responsibility: 'Product architecture, filtration technologies, applications, validation, catalog integrity, and technical knowledge governance.',
    responsibilityEs: 'Arquitectura de producto, tecnologías de filtración, aplicaciones, validación, integridad de catálogo y gobernanza del conocimiento técnico.',
    image: '/assets/leadership/chief-product-technology-agent.jpg',
    initials: 'PT',
  },
  {
    id: 'commercial',
    title: 'Chief Commercial & Markets Agent',
    titleEs: 'Chief Commercial & Markets Agent',
    short: 'Commercial & Markets',
    shortEs: 'Comercial & Mercados',
    responsibility: 'B2B growth, distributors, strategic accounts, market development, CRM, pricing discipline, and customer intelligence.',
    responsibilityEs: 'Crecimiento B2B, distribuidores, cuentas estratégicas, desarrollo de mercados, CRM, disciplina de precios e inteligencia de clientes.',
    image: '/assets/leadership/chief-commercial-markets-agent.jpg',
    initials: 'CM',
  },
  {
    id: 'finance',
    title: 'Chief Finance & Risk Agent',
    titleEs: 'Chief Finance & Risk Agent',
    short: 'Finance & Risk',
    shortEs: 'Finanzas & Riesgo',
    responsibility: 'Liquidity, margins, forecasting, working capital, financial discipline, and enterprise-risk visibility.',
    responsibilityEs: 'Liquidez, márgenes, forecasting, capital de trabajo, disciplina financiera y visibilidad de riesgos empresariales.',
    image: '/assets/leadership/chief-finance-risk-agent.jpg',
    initials: 'FR',
  },
  {
    id: 'strategy',
    title: 'Chief Strategy, Performance & Intelligence Agent',
    titleEs: 'Chief Strategy, Performance & Intelligence Agent',
    short: 'Strategy, Performance & Intelligence',
    shortEs: 'Estrategia, Desempeño & Inteligencia',
    responsibility: 'Strategy support, performance intelligence, AI governance, data, automation, digital architecture, and agent governance.',
    responsibilityEs: 'Soporte estratégico, inteligencia de desempeño, gobernanza de IA, datos, automatización, arquitectura digital y gobernanza de agentes.',
    image: '/assets/leadership/chief-strategy-performance-intelligence-agent.jpg',
    initials: 'SI',
  },
];

export default function LeadershipPage() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');

  return (
    <main id="main-content" style={main}>
      <PageHeader breadcrumbs={[{ label: 'About', href: '/about' }]} currentPage={isSpanish ? 'Liderazgo' : 'Leadership'} />

      <section style={heroSection}>
        <div style={wrap}>
          <p style={eyebrow}>ELIMFILTERS · LEADERSHIP</p>
          <h1 style={heroTitle}>{isSpanish ? 'Liderazgo humano. Ejecución AI-native.' : 'Human leadership. AI-native execution.'}</h1>
          <p style={heroLead}>
            {isSpanish
              ? 'ELIMFILTERS combina autoridad ejecutiva humana con funciones ejecutivas especializadas operadas por agentes de IA. La estructura está diseñada alrededor de responsabilidades definidas, autoridad delegada, métricas, trazabilidad y escalamiento.'
              : 'ELIMFILTERS combines human executive authority with specialized executive functions operated by AI agents. The structure is designed around defined responsibilities, delegated authority, metrics, traceability, and escalation.'}
          </p>
        </div>
      </section>

      <AboutSubnav />

      <section style={founderSection}>
        <div style={founderGrid}>
          <Portrait src="/assets/leadership/victor-abreu-founder-ceo.jpg" alt="Víctor Abreu, Founder & CEO of ELIMFILTERS" initials="VA" large />
          <div>
            <p style={darkEyebrow}>FOUNDER & CEO</p>
            <h2 style={founderName}>Víctor Abreu</h2>
            <p style={founderTitle}>Founder & CEO</p>
            <p style={darkBody}>
              {isSpanish
                ? 'Como Fundador & CEO, Víctor dirige la visión, la estrategia y la autoridad ejecutiva final de ELIMFILTERS. La Chief Executive Office conserva la responsabilidad institucional sobre la estructura ejecutiva y las decisiones materiales de la compañía.'
                : 'As Founder & CEO, Víctor leads the vision, strategy, and final executive authority of ELIMFILTERS. The Chief Executive Office retains institutional accountability for the executive structure and material company decisions.'}
            </p>
          </div>
        </div>
      </section>

      <section style={agentsSection}>
        <div style={wrap}>
          <p style={eyebrow}>{isSpanish ? 'EXECUTIVE AI LEADERSHIP' : 'EXECUTIVE AI LEADERSHIP'}</p>
          <h2 style={sectionTitle}>{isSpanish ? 'Cinco funciones ejecutivas especializadas.' : 'Five specialized executive functions.'}</h2>
          <p style={sectionLead}>
            {isSpanish
              ? 'Estos perfiles son representaciones visuales de agentes ejecutivos de IA, no empleados humanos. Cada agente gestiona un dominio definido bajo autoridad delegada y supervisión de la Chief Executive Office.'
              : 'These profiles are visual representations of executive AI agents, not human employees. Each agent manages a defined domain under delegated authority and oversight of the Chief Executive Office.'}
          </p>

          <div style={agentsGrid}>
            {AGENTS.map((agent) => (
              <article key={agent.id} style={agentCard}>
                <Portrait src={agent.image} alt={`${agent.title} — Executive AI Agent`} initials={agent.initials} />
                <div style={agentBody}>
                  <span style={aiBadge}>EXECUTIVE AI AGENT</span>
                  <h3 style={agentTitle}>{agent.title}</h3>
                  <p style={agentShort}>{isSpanish ? agent.shortEs : agent.short}</p>
                  <p style={agentResponsibility}>{isSpanish ? agent.responsibilityEs : agent.responsibility}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={modelSection}>
        <div style={wrap}>
          <p style={eyebrow}>{isSpanish ? 'CÓMO FUNCIONA' : 'HOW THE MODEL WORKS'}</p>
          <h2 style={sectionTitle}>{isSpanish ? 'La oficina permanece. La implementación puede evolucionar.' : 'The office remains. The implementation can evolve.'}</h2>
          <div style={flowGrid}>
            <FlowStep number="01" title="Chief Executive Office" detail={isSpanish ? 'Autoridad humana final' : 'Final human authority'} />
            <FlowStep number="02" title="Executive AI Agents" detail={isSpanish ? 'Responsabilidad por dominio' : 'Domain accountability'} />
            <FlowStep number="03" title="Specialized Subagents" detail={isSpanish ? 'Ejecución especializada' : 'Specialized execution'} />
            <FlowStep number="04" title="Systems & Automation" detail={isSpanish ? 'Escala y continuidad' : 'Scale and continuity'} />
          </div>
        </div>
      </section>

      <section style={governanceSection}>
        <div style={governanceGrid}>
          <div>
            <p style={darkEyebrow}>{isSpanish ? 'GOVERNANCE & ACCOUNTABILITY' : 'GOVERNANCE & ACCOUNTABILITY'}</p>
            <h2 style={darkTitle}>{isSpanish ? 'La responsabilidad nunca se vuelve artificial.' : 'Accountability never becomes artificial.'}</h2>
          </div>
          <div>
            <p style={darkBody}>
              {isSpanish
                ? 'La inteligencia artificial puede ejercer autoridad delegada dentro de ELIMFILTERS, pero las decisiones estratégicas, materiales, excepcionales, irreversibles o de alto riesgo permanecen sujetas a autoridad humana. Cada función ejecutiva opera con límites, escalamiento, trazabilidad y posibilidad de intervención.'
                : 'Artificial intelligence may exercise delegated authority within ELIMFILTERS, but strategic, material, exceptional, irreversible, or high-risk decisions remain subject to human authority. Each executive function operates with defined limits, escalation, traceability, and intervention rights.'}
            </p>
          </div>
        </div>
      </section>

      <section style={capabilitySection}>
        <div style={wrap}>
          <p style={eyebrow}>{isSpanish ? 'CAPABILITY BEFORE COMPLEXITY' : 'CAPABILITY BEFORE COMPLEXITY'}</p>
          <h2 style={closingTitle}>{isSpanish ? 'Construidos para capacidad, no para aparentar tamaño.' : 'Built for capability, not apparent headcount.'}</h2>
          <p style={closingBody}>
            {isSpanish
              ? 'ELIMFILTERS utiliza agentes, automatización, sistemas y profesionales humanos donde cada mecanismo aporta mayor competencia. La escala organizacional debe crecer por necesidad real, no para simular una estructura más grande.'
              : 'ELIMFILTERS uses agents, automation, systems, and human professionals where each mechanism adds the greatest competence. Organizational scale should grow from real need, not to simulate a larger structure.'}
          </p>
          <Link href="/about" style={textLink}>{isSpanish ? 'Volver a Quiénes Somos →' : 'Back to Who We Are →'}</Link>
        </div>
      </section>
    </main>
  );
}

function Portrait({ src, alt, initials, large = false }: { src: string; alt: string; initials: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ ...portraitShell, minHeight: large ? '520px' : '330px' }}>
      {!failed ? (
        <img src={src} alt={alt} onError={() => setFailed(true)} style={portraitImage} />
      ) : (
        <div aria-label={alt} style={portraitFallback}>{initials}</div>
      )}
    </div>
  );
}

function FlowStep({ number, title, detail }: { number: string; title: string; detail: string }) {
  return (
    <div style={flowCard}>
      <span style={numberStyle}>{number}</span>
      <h3 style={flowTitle}>{title}</h3>
      <p style={flowDetail}>{detail}</p>
    </div>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };
const heroSection: CSSProperties = { padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,6vw,6rem) clamp(4rem,8vw,7rem)', background: 'radial-gradient(circle at 80% 0%, rgba(255,241,45,.16), transparent 28%), #000', borderBottom: '1px solid rgba(255,255,255,.08)' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', margin: '0 0 1rem', textTransform: 'uppercase' };
const darkEyebrow: CSSProperties = { ...eyebrow, color: '#6c6100' };
const heroTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-.05em', lineHeight: .92, fontSize: 'clamp(3rem,6.6vw,6.6rem)', maxWidth: '1050px', margin: 0, textTransform: 'uppercase' };
const heroLead: CSSProperties = { marginTop: '1.5rem', maxWidth: '900px', color: 'rgba(255,255,255,.78)', fontSize: 'clamp(1rem,1.5vw,1.23rem)', lineHeight: 1.75 };
const founderSection: CSSProperties = { background: '#f2f2ef', color: '#111', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const founderGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(280px,.85fr) minmax(300px,1.15fr)', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'center' };
const founderName: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,5vw,5rem)', lineHeight: .95, letterSpacing: '-.04em', margin: '0 0 .65rem' };
const founderTitle: CSSProperties = { color: '#6c6100', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const darkBody: CSSProperties = { color: '#3f3f3b', fontSize: '1.02rem', lineHeight: 1.78, margin: 0 };
const agentsSection: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const sectionTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 1, letterSpacing: '-.035em', margin: '0 0 1rem', maxWidth: '900px', textTransform: 'uppercase' };
const sectionLead: CSSProperties = { color: 'rgba(255,255,255,.65)', lineHeight: 1.75, maxWidth: '820px', margin: '0 0 2.5rem' };
const agentsGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '1px', background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.09)' };
const agentCard: CSSProperties = { background: '#090909', minWidth: 0 };
const portraitShell: CSSProperties = { position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#171717,#080808)', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const portraitImage: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 };
const portraitFallback: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#FFF12D', opacity: .7 };
const agentBody: CSSProperties = { padding: '1.25rem' };
const aiBadge: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.64rem', fontWeight: 700, letterSpacing: '.14em' };
const agentTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '1.05rem', lineHeight: 1.18, margin: '.75rem 0 .45rem' };
const agentShort: CSSProperties = { color: 'rgba(255,255,255,.85)', fontWeight: 650, lineHeight: 1.4, margin: 0 };
const agentResponsibility: CSSProperties = { color: 'rgba(255,255,255,.55)', fontSize: '.9rem', lineHeight: 1.6, margin: '.8rem 0 0' };
const modelSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const flowGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)', marginTop: '2.5rem' };
const flowCard: CSSProperties = { background: '#050505', padding: '1.5rem', minHeight: '170px' };
const numberStyle: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em' };
const flowTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: '2rem 0 .5rem' };
const flowDetail: CSSProperties = { color: 'rgba(255,255,255,.55)', margin: 0 };
const governanceSection: CSSProperties = { background: '#f2f2ef', color: '#111', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const governanceGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'start' };
const darkTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4.3vw,4.3rem)', lineHeight: 1, letterSpacing: '-.04em', margin: 0, textTransform: 'uppercase' };
const capabilitySection: CSSProperties = { background: '#000', padding: 'clamp(5rem,9vw,8rem) clamp(1.25rem,6vw,6rem)' };
const closingTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,4.8vw,4.8rem)', lineHeight: 1, letterSpacing: '-.04em', maxWidth: '960px', margin: '0 0 1.4rem', textTransform: 'uppercase' };
const closingBody: CSSProperties = { color: 'rgba(255,255,255,.68)', maxWidth: '820px', lineHeight: 1.8, fontSize: '1.04rem', margin: '0 0 1.5rem' };
const textLink: CSSProperties = { color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.8rem', letterSpacing: '.09em', textTransform: 'uppercase' };
