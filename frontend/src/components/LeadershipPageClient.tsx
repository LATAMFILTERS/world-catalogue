'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { AboutSubnav } from '@/components/AboutSubnav';
import registry from '@/data/executive-visual-identity.json';
import '@/i18n';

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

export function LeadershipPageClient() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const founder = registry.founder;

  return (
    <main className="leadership-page">
      <PageHeader breadcrumbs={[{ label: 'About', href: '/about' }]} currentPage={isSpanish ? 'Liderazgo' : 'Leadership'} />

      <section className="leadership-hero">
        <div className="leadership-wrap">
          <p className="eyebrow">ELIMFILTERS · LEADERSHIP</p>
          <h1>{isSpanish ? 'Liderazgo humano. Ejecución AI-native.' : 'Human leadership. AI-native execution.'}</h1>
          <p className="hero-copy">
            {isSpanish
              ? 'ELIMFILTERS combina autoridad ejecutiva humana con funciones ejecutivas especializadas operadas por agentes de IA bajo un marco formal de responsabilidad, autoridad delegada, trazabilidad y escalamiento.'
              : 'ELIMFILTERS combines human executive authority with specialized executive functions operated by AI agents under a formal framework of accountability, delegated authority, traceability, and escalation.'}
          </p>
        </div>
      </section>

      <AboutSubnav />

      <section className="founder-section">
        <div className="founder-grid">
          <div className="founder-photo-shell">
            <img src={founder.image} alt={founder.alt} className="founder-photo" />
          </div>
          <div className="founder-copy">
            <p className="eyebrow dark">FOUNDER & CEO</p>
            <h2>{founder.name}</h2>
            <p className="founder-role">{founder.designation}</p>
            <p>
              {isSpanish
                ? 'Como Founder & CEO, Víctor dirige la visión, la estrategia y la autoridad ejecutiva final de ELIMFILTERS. La Chief Executive Office conserva la responsabilidad institucional sobre la estructura ejecutiva y las decisiones materiales de la compañía.'
                : 'As Founder & CEO, Víctor leads the vision, strategy, and final executive authority of ELIMFILTERS. The Chief Executive Office retains institutional accountability for the executive structure and material company decisions.'}
            </p>
          </div>
        </div>
      </section>

      <section className="agents-section">
        <div className="leadership-wrap">
          <p className="eyebrow">EXECUTIVE AI LEADERSHIP</p>
          <h2>{isSpanish ? 'Cinco funciones ejecutivas especializadas.' : 'Five specialized executive functions.'}</h2>
          <p className="section-copy">
            {isSpanish
              ? 'Estos perfiles son representaciones visuales oficiales de agentes ejecutivos de IA, no empleados humanos. Cada agente gestiona un dominio definido bajo autoridad delegada y supervisión de la Chief Executive Office.'
              : 'These profiles are the official visual representations of executive AI agents, not human employees. Each agent manages a defined domain under delegated authority and oversight of the Chief Executive Office.'}
          </p>

          <div className="agents-grid">
            {registry.agents.map((agent) => {
              const responsibility = RESPONSIBILITIES[agent.id];
              return (
                <article className="agent-card" key={agent.id}>
                  <div className="agent-photo-shell">
                    <img src={agent.image} alt={agent.alt} className="agent-photo" />
                  </div>
                  <div className="agent-copy">
                    <span className="ai-label">{agent.label}</span>
                    <h3>{agent.title}</h3>
                    <p>{isSpanish ? responsibility.es : responsibility.en}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="model-section">
        <div className="leadership-wrap">
          <p className="eyebrow">{isSpanish ? 'CÓMO FUNCIONA' : 'HOW THE MODEL WORKS'}</p>
          <h2>{isSpanish ? 'La oficina permanece. La implementación puede evolucionar.' : 'The office remains. The implementation can evolve.'}</h2>
          <div className="flow-grid">
            <Flow n="01" title="Chief Executive Office" detail={isSpanish ? 'Autoridad humana final' : 'Final human authority'} />
            <Flow n="02" title="Executive AI Agents" detail={isSpanish ? 'Responsabilidad por dominio' : 'Domain accountability'} />
            <Flow n="03" title="Specialized Subagents" detail={isSpanish ? 'Ejecución especializada' : 'Specialized execution'} />
            <Flow n="04" title="Systems & Automation" detail={isSpanish ? 'Escala y continuidad' : 'Scale and continuity'} />
          </div>
        </div>
      </section>

      <section className="governance-section">
        <div className="governance-grid">
          <div>
            <p className="eyebrow dark">GOVERNANCE & ACCOUNTABILITY</p>
            <h2>{isSpanish ? 'La responsabilidad nunca se vuelve artificial.' : 'Accountability never becomes artificial.'}</h2>
          </div>
          <p>
            {isSpanish
              ? 'La inteligencia artificial puede ejercer autoridad delegada dentro de ELIMFILTERS, pero las decisiones estratégicas, materiales, excepcionales, irreversibles o de alto riesgo permanecen sujetas a autoridad humana.'
              : 'Artificial intelligence may exercise delegated authority within ELIMFILTERS, but strategic, material, exceptional, irreversible, or high-risk decisions remain subject to human authority.'}
          </p>
        </div>
      </section>

      <section className="closing-section">
        <div className="leadership-wrap">
          <p className="eyebrow">CAPABILITY BEFORE COMPLEXITY</p>
          <h2>{isSpanish ? 'Construidos para capacidad, no para aparentar tamaño.' : 'Built for capability, not apparent headcount.'}</h2>
          <p className="section-copy">
            {isSpanish
              ? 'ELIMFILTERS utiliza agentes, automatización, sistemas y profesionales humanos donde cada mecanismo aporta mayor competencia. La escala organizacional crece por necesidad real, no para simular una estructura mayor.'
              : 'ELIMFILTERS uses agents, automation, systems, and human professionals where each mechanism adds the greatest competence. Organizational scale grows from real need, not to simulate a larger structure.'}
          </p>
          <Link href="/about" className="back-link">{isSpanish ? 'Volver a Quiénes Somos →' : 'Back to Who We Are →'}</Link>
        </div>
      </section>

      <style jsx>{`
        .leadership-page{background:#000;color:#fff;min-height:100vh;font-family:var(--font-body)}
        .leadership-wrap{max-width:1180px;margin:0 auto;width:100%}
        .leadership-hero{padding:clamp(7rem,12vw,10rem) clamp(1.25rem,6vw,6rem) clamp(4rem,8vw,7rem);background:radial-gradient(circle at 80% 0%,rgba(255,241,45,.16),transparent 28%),#000;border-bottom:1px solid rgba(255,255,255,.08)}
        .eyebrow{color:#FFF12D;font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.16em;margin:0 0 1rem;text-transform:uppercase}.eyebrow.dark{color:#6c6100}
        h1,h2,h3{font-family:var(--font-display)}
        h1{font-weight:700;letter-spacing:-.05em;line-height:.92;font-size:clamp(3rem,6.6vw,6.6rem);max-width:1050px;margin:0;text-transform:uppercase}
        .hero-copy,.section-copy{max-width:900px;color:rgba(255,255,255,.72);font-size:clamp(1rem,1.5vw,1.23rem);line-height:1.75}
        .founder-section{background:#f2f2ef;color:#111;padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}
        .founder-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(320px,.9fr) minmax(320px,1.1fr);gap:clamp(2rem,6vw,5rem);align-items:center}
        .founder-photo-shell{aspect-ratio:4/5;overflow:hidden;background:#111}.founder-photo{width:100%;height:100%;object-fit:cover;display:block}
        .founder-copy h2{font-size:clamp(2.5rem,5vw,5rem);line-height:.95;letter-spacing:-.04em;margin:0 0 .6rem}.founder-role{color:#6c6100;font-family:var(--font-display);font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0 0 1.5rem}.founder-copy>p:last-child{color:#3f3f3b;font-size:1.04rem;line-height:1.78}
        .agents-section,.model-section,.closing-section{padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}.agents-section{background:#050505}.model-section{background:#000}.closing-section{background:#050505}
        .agents-section h2,.model-section h2,.closing-section h2{font-size:clamp(2rem,4vw,4rem);line-height:1;letter-spacing:-.035em;margin:0 0 1rem;text-transform:uppercase;max-width:950px}
        .agents-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.09);margin-top:2.5rem}.agent-card{background:#090909;min-width:0}.agent-photo-shell{aspect-ratio:4/5;overflow:hidden;background:#111}.agent-photo{width:100%;height:100%;object-fit:cover;display:block}.agent-copy{padding:1.2rem}.ai-label{color:#FFF12D;font-family:var(--font-display);font-size:.63rem;font-weight:700;letter-spacing:.14em}.agent-copy h3{font-size:1rem;line-height:1.2;margin:.7rem 0 .55rem}.agent-copy p{color:rgba(255,255,255,.62);font-size:.9rem;line-height:1.6;margin:0}
        .flow-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.1);margin-top:2.5rem}.flow-card{background:#080808;padding:1.5rem}.flow-card span{color:#FFF12D;font-family:var(--font-display);font-weight:700;font-size:.75rem;letter-spacing:.14em}.flow-card h3{margin:1rem 0 .35rem;font-size:1rem}.flow-card p{margin:0;color:rgba(255,255,255,.58);font-size:.9rem}
        .governance-section{background:#f2f2ef;color:#111;padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}.governance-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,6vw,5rem);align-items:start}.governance-grid h2{font-size:clamp(2rem,4vw,4rem);line-height:1;letter-spacing:-.035em;margin:0}.governance-grid>p{color:#3f3f3b;font-size:1.04rem;line-height:1.78;margin:0}.back-link{display:inline-block;margin-top:1.25rem;color:#FFF12D;text-decoration:none;font-family:var(--font-display);font-weight:700;letter-spacing:.06em}
        @media(max-width:900px){.founder-grid,.governance-grid{grid-template-columns:1fr}.agents-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.flow-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:560px){.leadership-hero{padding-top:8.5rem}.founder-section,.agents-section,.model-section,.governance-section,.closing-section{padding-left:1.25rem;padding-right:1.25rem}.founder-grid{grid-template-columns:1fr;gap:2rem}.founder-photo-shell{aspect-ratio:4/5}.agents-grid,.flow-grid{grid-template-columns:1fr}.agent-photo-shell{aspect-ratio:4/5}.agent-copy{padding:1.1rem}.founder-copy h2{font-size:2.5rem}}
      `}</style>
    </main>
  );
}

function Flow({ n, title, detail }: { n: string; title: string; detail: string }) {
  return <div className="flow-card"><span>{n}</span><h3>{title}</h3><p>{detail}</p></div>;
}
