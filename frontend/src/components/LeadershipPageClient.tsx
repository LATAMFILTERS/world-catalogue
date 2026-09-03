'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import registry from '@/data/executive-visual-identity.json';
import '@/i18n';

const AGENT_PROFILES: Record<string, { en: string[]; es: string[] }> = {
  office_chief_operating_supply_chain: {
    en: [
      'The Chief Operating & Supply Chain Agent runs the machinery behind every shipment — coordinating procurement, container-level export logistics from ELIMFILTERS’ manufacturing partners, and fulfillment across the distributor network spanning Colombia, the Dominican Republic, Venezuela, and the United States.',
      'The role keeps inventory, supplier commitments, and delivery execution aligned with real commercial demand, so a country distributor’s container orders move on schedule and at the volume the market actually needs.',
    ],
    es: [
      'El Chief Operating & Supply Chain Agent dirige la maquinaria detrás de cada envío — coordinando compras, logística de exportación por contenedor desde los socios de manufactura de ELIMFILTERS, y cumplimiento de pedidos en toda la red de distribuidores que abarca Colombia, República Dominicana, Venezuela y Estados Unidos.',
      'La función mantiene el inventario, los compromisos con proveedores y la ejecución de entregas alineados con la demanda comercial real, para que los pedidos por contenedor de un distribuidor país se muevan a tiempo y en el volumen que el mercado realmente necesita.',
    ],
  },
  office_chief_product_technology: {
    en: [
      'The Chief Product & Technology Agent owns ELIMFILTERS’ technical platform: the five protection systems — air intake and airflow, fuel cleanliness, lubrication, hydraulic, and cooling — and the ten proprietary technologies built to serve them, including MACROCORE™ for engine air intake, HYDROCORE™ for approved standard non-turbine fuel/water separation, and TURBOCORE™ for approved FH/FG turbine-style fuel/water separator systems.',
      'The role keeps every specification, cross-reference, and application claim validated against real equipment and failure modes, so the catalog reflects engineering evidence rather than a generic parts list.',
    ],
    es: [
      'El Chief Product & Technology Agent es responsable de la plataforma técnica de ELIMFILTERS: los cinco sistemas de protección —admisión y flujo de aire, limpieza de combustible, lubricación, hidráulico y enfriamiento— y las diez tecnologías propias construidas para servirlos, incluyendo MACROCORE™ para admisión de aire de motor, HYDROCORE™ para separación combustible/agua estándar no-turbina aprobada y TURBOCORE™ para sistemas separadores combustible/agua tipo turbina FH/FG aprobados.',
      'La función mantiene cada especificación, referencia cruzada y afirmación de aplicación validada contra equipos y modos de falla reales, para que el catálogo refleje evidencia de ingeniería y no una lista genérica de piezas.',
    ],
  },
  office_chief_commercial_markets: {
    en: [
      'The Chief Commercial & Markets Agent runs the country-exclusive distributor program — qualifying new territory partners, managing pricing and account relationships, and coordinating the CRM across every active and prospective market.',
      'The role translates the distributor-first model into practice: prioritizing partners capable of building real coverage, and keeping commercial growth disciplined rather than opportunistic.',
    ],
    es: [
      'El Chief Commercial & Markets Agent dirige el programa de distribuidores exclusivos por país — calificando nuevos socios de territorio, gestionando precios y relaciones de cuenta, y coordinando el CRM en cada mercado activo y prospecto.',
      'La función traduce el modelo distributor-first a la práctica: priorizando socios capaces de construir cobertura real, y manteniendo el crecimiento comercial disciplinado en vez de oportunista.',
    ],
  },
  office_chief_finance_risk: {
    en: [
      'The Chief Finance & Risk Agent manages the financial discipline behind a container-based, distributor-first business — margins, working capital, and cash flow across manufacturing partners, logistics, and a multi-country receivables base.',
      'The role gives the Chief Executive Office visibility into financial exposure before it becomes a problem: which markets are performing, which commitments carry risk, and where resources should be allocated next.',
    ],
    es: [
      'El Chief Finance & Risk Agent gestiona la disciplina financiera detrás de un negocio distributor-first basado en contenedores — márgenes, capital de trabajo y flujo de caja entre socios de manufactura, logística y una base de cuentas por cobrar multipaís.',
      'La función le da a la Chief Executive Office visibilidad sobre la exposición financiera antes de que se convierta en un problema: qué mercados están rindiendo, qué compromisos cargan riesgo, y dónde deben asignarse los recursos a continuación.',
    ],
  },
  office_chief_strategy_performance_intelligence: {
    en: [
      'The Chief Strategy, Performance & Intelligence Agent governs the AI-agent model itself — monitoring how the other four executive agents perform, coordinating the data and automation that keep them accountable, and flagging anything that needs to escalate to the human Chief Executive Office.',
      'The role is also behind the flat organizational structure ELIMFILTERS runs on: using process automation to remove the internal approval layers that usually sit between a distributor and a decision.',
    ],
    es: [
      'El Chief Strategy, Performance & Intelligence Agent gobierna el propio modelo de agentes de IA — monitoreando el desempeño de los otros cuatro agentes ejecutivos, coordinando los datos y la automatización que los mantienen responsables, y señalando cualquier cosa que deba escalar a la Chief Executive Office humana.',
      'La función también está detrás de la estructura organizacional plana sobre la que opera ELIMFILTERS: usando automatización de procesos para eliminar las capas de aprobación interna que normalmente se interponen entre un distribuidor y una decisión.',
    ],
  },
};

const FOUNDER_PROFILE = {
  en: [
    "Víctor Abreu is the Founder and Chief Executive Officer of ELIMFILTERS®, responsible for corporate strategy, international market development, technology integration, knowledge systems, and the company\'s long-term growth.",
    "He brings more than two decades of experience in industrial filtration, distribution, and business development, during which he has built and led operations serving automotive, transportation, industrial, and heavy-duty applications across multiple markets in the Americas.",
    "Before establishing ELIMFILTERS, Abreu led one of Venezuela\'s most relevant industrial filtration distribution operations, developing strategic relationships with international manufacturers and strengthening the company\'s presence among major industrial and automotive accounts.",
    "His experience spans international sourcing, supply chain development, technical product strategy, B2B distribution, market expansion, and the development of solutions for fleets, industrial operators, and asset-intensive businesses.",
    "His management approach combines financial discipline, risk analysis, budget control, and cost structuring with a strong focus on value creation. Throughout his career, he has applied these principles to develop operating and commercial models designed to balance cost, performance, and profitability, translating greater efficiency into higher-value solutions for customers.",
    "Today, Abreu leads the transformation of ELIMFILTERS into an industrial filtration intelligence company focused on Total Assets Protection. His work integrates product strategy, technical knowledge systems, artificial intelligence, application data, market development, and international distribution within a unified operating platform.",
    "He holds a degree in Public Accounting from UCAT and earned an MBA in Business Administration from Universidad Rafael Belloso Chacín (URBE), Venezuela, in 2002.",
    "Strategic Responsibilities: Corporate Strategy · Global Expansion · Technology Integration · Artificial Intelligence · Industrial Filtration Intelligence · Knowledge Systems · Supply Chain Strategy · Financial Management · Risk Management · Corporate Governance",
  ],
  es: [
    "Víctor Abreu es Fundador y Director Ejecutivo (CEO) de ELIMFILTERS®. Es Contador Público egresado de la UCAT (2000) y tiene un MBA (Maestría en Administración de Empresas) de la Universidad Rafael Belloso Chacín (URBE), Venezuela, obtenido en 2002, y construyó su carrera en la distribución de filtración industrial más de dos décadas antes de fundar ELIMFILTERS.",
    "Desde 2004, dirigió ELIMPERCA como distribuidor en Venezuela de Donaldson, Fleetguard y Parker (Racor), llevándola a ser el distribuidor número uno de estas marcas en el continente durante siete años consecutivos, con cuentas directas que incluían a General Motors Venezuela y Mack Venezuela — ambas comercializaban filtración Donaldson, Fleetguard y Racor como equipo original en lugar de sus propias líneas OEM. En su punto más alto, la operación importaba un promedio de 18 contenedores HQ de producto a Venezuela cada mes.",
    "En 2014, la dirección corporativa de Donaldson, Fleetguard y Parker retiró sus acuerdos de distribución de Venezuela. En lugar de salir del mercado, Víctor Abreu construyó ELIMFILTERS como marca propia de la empresa — la misma experiencia en filtración, ahora bajo un nombre que la empresa controlaba por completo.",
    "ELIMPERCA siguió siendo la empresa matriz de ELIMFILTERS hasta 2020, cuando las operaciones se centralizaron en todo el continente americano bajo LATAMFILTERS PRO INC. Esa entidad se cerró posteriormente y fue reemplazada por Kleo Technology LLC, con sede en Texas, la estructura que hoy lidera ELIMFILTERS.",
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
              ? 'El mismo salto que llevó a ELIMFILTERS de vender filtros a proteger activos es el que definió cómo está organizada la propia empresa. Un distribuidor tradicional escala agregando personas y capas de gerencia; una empresa construida sobre disciplina de ingeniería y protección de activos a largo plazo necesitaba una estructura que pudiera escalar experiencia y consistencia en su lugar — por eso ELIMFILTERS combina una Chief Executive Office humana con agentes ejecutivos de IA especializados, en vez de una jerarquía gerencial convencional.'
              : 'The same leap that took ELIMFILTERS from selling filters to protecting assets is what shaped how the company itself is organized. A traditional distributor scales by adding people and management layers; a company built around engineering discipline and long-term asset protection needed a structure that could scale expertise and consistency instead — which is why ELIMFILTERS pairs a human Chief Executive Office with specialized executive AI agents, rather than a conventional management hierarchy.'}
          </p>
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
                    {'email' in agent && agent.email ? (
                      <div className="agent-contact">
                        <span>{isSpanish ? 'CONTACTO' : 'CONTACT'}</span>
                        <a href={`mailto:${agent.email}`}>{agent.email} →</a>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
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
          <Link href="/about/who-we-are" className="back-link">{isSpanish ? 'Volver a Quiénes Somos →' : 'Back to Who We Are →'}</Link>
        </div>
      </section>

      <style jsx>{`
        .leadership-page{background:#000;color:#fff;min-height:100vh;font-family:var(--font-body)}
        .leadership-wrap{max-width:1180px;margin:0 auto;width:100%}
        .leadership-hero{padding:clamp(7rem,12vw,10rem) clamp(1.25rem,6vw,6rem) clamp(4rem,8vw,7rem);background:radial-gradient(circle at 80% 0%,rgba(255,241,45,.16),transparent 28%),#000;border-bottom:1px solid rgba(255,255,255,.08)}
        .eyebrow{color:#FFF12D;font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.16em;margin:0 0 1rem;text-transform:uppercase}.eyebrow.dark{color:#6c6100}
        h1,h2,h3{font-family:var(--font-display)}
        h1{font-weight:700;letter-spacing:-.05em;line-height:.92;font-size:clamp(3rem,6.6vw,6.6rem);max-width:1050px;margin:0;text-transform:uppercase}
        .hero-copy{max-width:900px;color:rgba(255,255,255,.72);font-size:clamp(1rem,1.5vw,1.23rem);line-height:1.75}
        .section-copy{max-width:100%;color:rgba(255,255,255,.72);font-size:clamp(1rem,1.5vw,1.23rem);line-height:1.75}
        .section-copy+.section-copy{margin-top:1.1rem}
        .founder-section{background:#f2f2ef;color:#111;padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}
        .founder-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(230px,.63fr) minmax(420px,1.37fr);gap:clamp(2rem,5vw,4.5rem);align-items:start}
        .founder-photo-shell{aspect-ratio:4/5;overflow:hidden;background:#111;width:100%;max-width:340px;justify-self:center}.founder-photo{width:100%;height:100%;object-fit:cover;display:block}
        .founder-copy h2{font-size:clamp(2.5rem,5vw,5rem);line-height:.95;letter-spacing:-.04em;margin:0 0 .6rem}.founder-role{color:#6c6100;font-family:var(--font-display);font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0 0 1.5rem}.founder-profile{display:grid;gap:1rem}.founder-profile p{color:#3f3f3b;font-size:1.02rem;line-height:1.72;margin:0}
        .agents-section,.closing-section{padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}.agents-section{background:#050505}.closing-section{background:#050505}
        .agents-section h2,.closing-section h2{font-size:clamp(2rem,4vw,4rem);line-height:1;letter-spacing:-.035em;margin:0 0 1rem;text-transform:uppercase;max-width:950px}
        .agent-list{margin-top:3.5rem;border-top:1px solid rgba(255,255,255,.12)}
        .agent-profile{display:grid;grid-template-columns:minmax(250px,.72fr) minmax(0,1.28fr);gap:clamp(2rem,6vw,5rem);padding:clamp(3rem,6vw,5rem) 0;border-bottom:1px solid rgba(255,255,255,.12);align-items:start}
        .agent-identity{min-width:0}.agent-photo-shell{aspect-ratio:4/5;overflow:hidden;background:#111;width:100%;max-width:320px;margin-bottom:1.35rem}.agent-photo{width:100%;height:100%;object-fit:cover;display:block}.ai-label{color:#FFF12D;font-family:var(--font-display);font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.agent-identity h3{font-size:clamp(1.4rem,2.3vw,2.2rem);line-height:1.08;margin:.75rem 0 0;letter-spacing:-.025em}.agent-description{padding-top:.15rem;display:grid;gap:1.1rem}.agent-description p{color:rgba(255,255,255,.72);font-size:clamp(1rem,1.25vw,1.12rem);line-height:1.78;margin:0;max-width:760px}
        .agent-contact{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;padding:.85rem 1.1rem;background:rgba(255,241,45,.06);border:1px solid rgba(255,241,45,.25)}
        .agent-contact span{color:rgba(255,255,255,.5);font-family:var(--font-display);font-weight:700;font-size:.66rem;letter-spacing:.14em}
        .agent-contact a{color:#FFF12D;font-family:var(--font-display);font-weight:700;font-size:.95rem;letter-spacing:.02em;text-decoration:underline;text-underline-offset:.2em;cursor:pointer}
        .agent-contact a:hover{color:#fff}
        .governance-section{background:#f2f2ef;color:#111;padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}.governance-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,6vw,5rem);align-items:start}.governance-grid h2{font-size:clamp(2rem,4vw,4rem);line-height:1;letter-spacing:-.035em;margin:0}.governance-grid>p{color:#3f3f3b;font-size:1.04rem;line-height:1.78;margin:0}.back-link{display:inline-block;margin-top:1.25rem;color:#FFF12D;text-decoration:none;font-family:var(--font-display);font-weight:700;letter-spacing:.06em}
        @media(max-width:900px){.founder-grid,.governance-grid,.agent-profile{grid-template-columns:1fr}.founder-photo-shell{width:70%;max-width:340px}.agent-photo-shell{max-width:300px}}
        @media(max-width:560px){.leadership-hero{padding-top:8.5rem}.founder-section,.agents-section,.governance-section,.closing-section{padding-left:1.25rem;padding-right:1.25rem}.founder-grid{grid-template-columns:1fr;gap:2rem}.founder-photo-shell{width:78%;max-width:300px}.agent-profile{gap:1.5rem;padding:3rem 0}.agent-photo-shell{max-width:260px}.founder-copy h2{font-size:2.5rem}}
      `}</style>
    </main>
  );
}
