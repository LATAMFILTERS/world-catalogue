'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { AboutSubnav } from '@/components/AboutSubnav';
import registry from '@/data/executive-visual-identity.json';
import '@/i18n';

const AGENT_PROFILES: Record<string, { en: string[]; es: string[] }> = {
  office_chief_operating_supply_chain: {
    en: [
      'The Chief Operating & Supply Chain Agent leads the operational execution framework of ELIMFILTERS across procurement, supply continuity, logistics, fulfillment, and operational quality.',
      'The role supports disciplined coordination between suppliers, inventory, commercial demand, and delivery execution, with a focus on continuity, responsiveness, and scalable operating control.',
    ],
    es: [
      'El Chief Operating & Supply Chain Agent dirige el marco de ejecución operativa de ELIMFILTERS en compras, continuidad de suministro, logística, fulfillment y calidad operacional.',
      'La función coordina proveedores, inventario, demanda comercial y ejecución de entregas, con énfasis en continuidad, capacidad de respuesta y control operativo escalable.',
    ],
  },
  office_chief_product_technology: {
    en: [
      'The Chief Product & Technology Agent leads product architecture, filtration technologies, application intelligence, technical validation, catalog integrity, and engineering knowledge governance.',
      'The role connects product strategy with technical evidence and digital systems so that specifications, applications, and technical content remain consistent, validated, and operationally useful across ELIMFILTERS.',
    ],
    es: [
      'El Chief Product & Technology Agent dirige la arquitectura de producto, las tecnologías de filtración, la inteligencia de aplicaciones, la validación técnica, la integridad del catálogo y la gobernanza del conocimiento de ingeniería.',
      'La función conecta la estrategia de producto con evidencia técnica y sistemas digitales para mantener especificaciones, aplicaciones y contenido técnico consistentes, validados y operativamente útiles en ELIMFILTERS.',
    ],
  },
  office_chief_commercial_markets: {
    en: [
      'The Chief Commercial & Markets Agent leads B2B growth, distributor development, strategic accounts, market expansion, CRM execution, pricing discipline, and customer intelligence.',
      'The role translates ELIMFILTERS capabilities into structured commercial development, prioritizing qualified markets, durable channel relationships, account intelligence, and disciplined revenue growth.',
    ],
    es: [
      'El Chief Commercial & Markets Agent dirige el crecimiento B2B, el desarrollo de distribuidores, las cuentas estratégicas, la expansión de mercados, la ejecución del CRM, la disciplina de precios y la inteligencia de clientes.',
      'La función convierte las capacidades de ELIMFILTERS en desarrollo comercial estructurado, priorizando mercados calificados, relaciones de canal sostenibles, inteligencia de cuentas y crecimiento disciplinado de ingresos.',
    ],
  },
  office_chief_finance_risk: {
    en: [
      'The Chief Finance & Risk Agent leads financial discipline across liquidity, margins, forecasting, working capital, planning, and enterprise-risk visibility.',
      'The role provides decision support for sustainable growth by connecting operating performance with financial exposure, resource allocation, scenario analysis, and risk controls.',
    ],
    es: [
      'El Chief Finance & Risk Agent dirige la disciplina financiera en liquidez, márgenes, forecasting, capital de trabajo, planificación y visibilidad de riesgos empresariales.',
      'La función apoya el crecimiento sostenible conectando desempeño operativo con exposición financiera, asignación de recursos, análisis de escenarios y controles de riesgo.',
    ],
  },
  office_chief_strategy_performance_intelligence: {
    en: [
      'The Chief Strategy, Performance & Intelligence Agent supports enterprise strategy, performance intelligence, AI governance, data, automation, digital architecture, and agent governance.',
      'The role connects strategic priorities with measurable execution, helping the Chief Executive Office identify signals, monitor performance, govern AI-enabled operations, and coordinate intelligence across the organization.',
    ],
    es: [
      'El Chief Strategy, Performance & Intelligence Agent apoya la estrategia empresarial, la inteligencia de desempeño, la gobernanza de IA, los datos, la automatización, la arquitectura digital y la gobernanza de agentes.',
      'La función conecta prioridades estratégicas con ejecución medible, ayudando a la Chief Executive Office a identificar señales, monitorear desempeño, gobernar operaciones habilitadas por IA y coordinar inteligencia en toda la organización.',
    ],
  },
};

const FOUNDER_PROFILE = {
  en: [
    'Víctor Abreu is Founder and Chief Executive Officer (CEO) of ELIMFILTERS®, Kleo Technology LLC’s global industrial filtration brand. He leads the company’s strategic direction, corporate development, technology integration, commercial expansion, and asset protection systems strategy.',
    'As Founder & CEO, he oversees ELIMFILTERS’ executive structure and the company’s five core leadership functions: Operations & Supply Chain, Product & Technology, Commercial & Markets, Finance & Risk, and Strategy, Performance & Intelligence.',
    'His responsibilities also include corporate strategy, market expansion, digital infrastructure, artificial intelligence integration, knowledge systems, brand positioning, governance, and the continued development of ELIMFILTERS as a global platform for industrial filtration and asset protection.',
    'Under his leadership, ELIMFILTERS is being developed around an integrated model that combines filtration engineering, application intelligence, validated technical knowledge, digital systems, and global commercial execution.',
  ],
  es: [
    'Víctor Abreu es Fundador y Director Ejecutivo (CEO) de ELIMFILTERS®, la marca global de filtración industrial de Kleo Technology LLC. Dirige la dirección estratégica de la compañía, el desarrollo corporativo, la integración tecnológica, la expansión comercial y la estrategia de sistemas de protección de activos.',
    'Como Fundador y CEO, supervisa la estructura ejecutiva de ELIMFILTERS y las cinco funciones principales de liderazgo de la compañía: Operaciones y Cadena de Suministro, Producto y Tecnología, Comercial y Mercados, Finanzas y Riesgo, y Estrategia, Desempeño e Inteligencia.',
    'Entre sus responsabilidades también se encuentran la estrategia corporativa, la expansión de mercados, la infraestructura digital, la integración de inteligencia artificial, los sistemas de conocimiento, el posicionamiento de marca, la gobernanza y el desarrollo continuo de ELIMFILTERS como plataforma global de filtración industrial y protección de activos.',
    'Bajo su liderazgo, ELIMFILTERS se desarrolla alrededor de un modelo integrado que combina ingeniería de filtración, inteligencia de aplicaciones, conocimiento técnico validado, sistemas digitales y ejecución comercial global.',
  ],
};

export function LeadershipPageClient() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const founder = registry.founder;
  const founderProfile = isSpanish ? FOUNDER_PROFILE.es : FOUNDER_PROFILE.en;

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
            <div className="founder-profile">
              {founderProfile.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
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

          <div className="agent-list">
            {registry.agents.map((agent) => {
              const profile = AGENT_PROFILES[agent.id];
              const paragraphs = isSpanish ? profile.es : profile.en;
              return (
                <article className="agent-profile" key={agent.id}>
                  <div className="agent-identity">
                    <div className="agent-photo-shell">
                      <img src={agent.image} alt={agent.alt} className="agent-photo" />
                    </div>
                    <span className="ai-label">{agent.label}</span>
                    <h3>{agent.title}</h3>
                  </div>
                  <div className="agent-description">
                    {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
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
        .founder-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(230px,.63fr) minmax(420px,1.37fr);gap:clamp(2rem,5vw,4.5rem);align-items:start}
        .founder-photo-shell{aspect-ratio:4/5;overflow:hidden;background:#111;width:100%;max-width:340px;justify-self:center}.founder-photo{width:100%;height:100%;object-fit:cover;display:block}
        .founder-copy h2{font-size:clamp(2.5rem,5vw,5rem);line-height:.95;letter-spacing:-.04em;margin:0 0 .6rem}.founder-role{color:#6c6100;font-family:var(--font-display);font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0 0 1.5rem}.founder-profile{display:grid;gap:1rem}.founder-profile p{color:#3f3f3b;font-size:1.02rem;line-height:1.72;margin:0}
        .agents-section,.model-section,.closing-section{padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}.agents-section{background:#050505}.model-section{background:#000}.closing-section{background:#050505}
        .agents-section h2,.model-section h2,.closing-section h2{font-size:clamp(2rem,4vw,4rem);line-height:1;letter-spacing:-.035em;margin:0 0 1rem;text-transform:uppercase;max-width:950px}
        .agent-list{margin-top:3.5rem;border-top:1px solid rgba(255,255,255,.12)}
        .agent-profile{display:grid;grid-template-columns:minmax(250px,.72fr) minmax(0,1.28fr);gap:clamp(2rem,6vw,5rem);padding:clamp(3rem,6vw,5rem) 0;border-bottom:1px solid rgba(255,255,255,.12);align-items:start}
        .agent-identity{min-width:0}.agent-photo-shell{aspect-ratio:4/5;overflow:hidden;background:#111;width:100%;max-width:320px;margin-bottom:1.35rem}.agent-photo{width:100%;height:100%;object-fit:cover;display:block}.ai-label{color:#FFF12D;font-family:var(--font-display);font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.agent-identity h3{font-size:clamp(1.4rem,2.3vw,2.2rem);line-height:1.08;margin:.75rem 0 0;letter-spacing:-.025em}.agent-description{padding-top:.15rem;display:grid;gap:1.1rem}.agent-description p{color:rgba(255,255,255,.72);font-size:clamp(1rem,1.25vw,1.12rem);line-height:1.78;margin:0;max-width:760px}
        .flow-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.1);margin-top:2.5rem}.flow-card{background:#080808;padding:1.5rem}.flow-card span{color:#FFF12D;font-family:var(--font-display);font-weight:700;font-size:.75rem;letter-spacing:.14em}.flow-card h3{margin:1rem 0 .35rem;font-size:1rem}.flow-card p{margin:0;color:rgba(255,255,255,.58);font-size:.9rem}
        .governance-section{background:#f2f2ef;color:#111;padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}.governance-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,6vw,5rem);align-items:start}.governance-grid h2{font-size:clamp(2rem,4vw,4rem);line-height:1;letter-spacing:-.035em;margin:0}.governance-grid>p{color:#3f3f3b;font-size:1.04rem;line-height:1.78;margin:0}.back-link{display:inline-block;margin-top:1.25rem;color:#FFF12D;text-decoration:none;font-family:var(--font-display);font-weight:700;letter-spacing:.06em}
        @media(max-width:900px){.founder-grid,.governance-grid,.agent-profile{grid-template-columns:1fr}.founder-photo-shell{width:70%;max-width:340px}.agent-photo-shell{max-width:300px}.flow-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:560px){.leadership-hero{padding-top:8.5rem}.founder-section,.agents-section,.model-section,.governance-section,.closing-section{padding-left:1.25rem;padding-right:1.25rem}.founder-grid{grid-template-columns:1fr;gap:2rem}.founder-photo-shell{width:78%;max-width:300px}.agent-profile{gap:1.5rem;padding:3rem 0}.agent-photo-shell{max-width:260px}.flow-grid{grid-template-columns:1fr}.founder-copy h2{font-size:2.5rem}}
      `}</style>
    </main>
  );
}

function Flow({ n, title, detail }: { n: string; title: string; detail: string }) {
  return <div className="flow-card"><span>{n}</span><h3>{title}</h3><p>{detail}</p></div>;
}
