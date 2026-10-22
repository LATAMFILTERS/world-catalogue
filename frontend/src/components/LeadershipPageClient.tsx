'use client';

import { ReviewedText } from '@/components/ReviewedText';
import { ReviewedImage } from '@/components/ReviewedMedia';
import Link from '@/components/LocalizedLink';
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
    "Víctor Abreu is the Founder and Chief Executive Officer (CEO) of ELIMFILTERS®. He earned a degree in Public Accounting from Universidad Católica del Táchira (UCAT) in 2000 and an MBA from Universidad Rafael Belloso Chacín (URBE) in 2002.",
    "He began his career in filtration in 2004 with ELIMPERCA, a distributor of internationally recognized brands. In just three years, together with his team, he positioned ELIMPERCA among the higher-volume and more broadly established distributors of filtration systems in Latin America. During this period, he built commercial partnerships with vehicle and truck assemblers in Venezuela, as well as lubricant distributors with nationwide reach.",
    "In 2015, that experience led him to identify the need for an independent brand with its own identity, a long-term vision, and greater control over product strategy, technological development, and international expansion. That vision gave rise to ELIMFILTERS®, conceived to deliver filtration solutions addressing the real needs of equipment, fleets, and industrial operations.",
    "Under his leadership, ELIMFILTERS has evolved from a filtration brand into an integrated asset-protection approach organized around five protection systems and ten proprietary technologies. This evolution combines technical knowledge, application information, research, digital tools, and an international distribution strategy.",
    "Today, he leads the development of ELIMFILTERS as an industrial filtration intelligence platform, integrating engineering, knowledge systems, and artificial intelligence to support technical evaluation and decision-making. His vision is to connect products, knowledge, and distributors to support the protection and operational continuity of customers' assets while contributing to environmental protection. His philosophy captures the brand's purpose: “The filter is the means. Asset protection is the objective.”",
  ],
  es: [
    "Víctor Abreu es Fundador y Director Ejecutivo (CEO) de ELIMFILTERS®. Es Contador Público egresado de la Universidad Católica del Táchira (UCAT) en 2000 y posee un MBA de la Universidad Rafael Belloso Chacín (URBE), obtenido en 2002.",
    "Inició su trayectoria en el sector de la filtración en 2004 con ELIMPERCA, distribuidora de reconocidas marcas internacionales. En apenas tres años, junto con su equipo, logró posicionar a ELIMPERCA como uno de los distribuidores de sistemas de filtración de mayor volumen y cobertura comercial en América Latina. Durante esa etapa, desarrolló alianzas con ensambladoras de vehículos y camiones en Venezuela, así como con distribuidores de lubricantes de alcance nacional.",
    "En 2015, su experiencia lo llevó a identificar la necesidad de desarrollar una marca independiente, con identidad propia, una visión de largo plazo y mayor control sobre su estrategia de productos, desarrollo tecnológico y expansión internacional. De esa visión nació ELIMFILTERS®, concebida para ofrecer soluciones de filtración orientadas a las necesidades reales de equipos, flotas y operaciones industriales.",
    "Bajo su liderazgo, ELIMFILTERS ha evolucionado de una marca de filtración hacia una propuesta integral de protección de activos, organizada alrededor de cinco sistemas de protección y diez tecnologías propias. Esta evolución incorpora conocimiento técnico, información de aplicaciones, investigación, herramientas digitales y una estrategia de distribución internacional.",
    "Actualmente, dirige el desarrollo de ELIMFILTERS como una plataforma de inteligencia en filtración industrial, integrando ingeniería, sistemas de conocimiento e inteligencia artificial como apoyo a la evaluación técnica y la toma de decisiones. Su visión es conectar productos, conocimiento y distribuidores para contribuir a la protección y continuidad operativa de los activos de sus clientes y a la protección del medio ambiente. Su filosofía resume el propósito de la marca: «El filtro es el medio. La protección de los activos es el objetivo».",
  ],
};

const FOUNDER_PROFILE_PT = [
  "Víctor Abreu é o Fundador e Diretor Executivo (CEO) da ELIMFILTERS®. Formou-se em Ciências Contábeis pela Universidad Católica del Táchira (UCAT) em 2000 e concluiu um MBA na Universidad Rafael Belloso Chacín (URBE) em 2002.",
  "Iniciou sua trajetória no setor de filtração em 2004 com a ELIMPERCA, distribuidora de marcas internacionalmente reconhecidas. Em apenas três anos, junto com sua equipe, posicionou a ELIMPERCA entre os distribuidores de sistemas de filtração de maior volume e alcance comercial na América Latina. Nesse período, desenvolveu parcerias com montadoras de veículos e caminhões na Venezuela, além de distribuidores de lubrificantes de abrangência nacional.",
  "Em 2015, essa experiência o levou a identificar a necessidade de desenvolver uma marca independente, com identidade própria, visão de longo prazo e maior controle sobre a estratégia de produtos, o desenvolvimento tecnológico e a expansão internacional. Dessa visão nasceu a ELIMFILTERS®, concebida para oferecer soluções de filtração voltadas às necessidades reais de equipamentos, frotas e operações industriais.",
  "Sob sua liderança, a ELIMFILTERS evoluiu de uma marca de filtração para uma proposta integrada de proteção de ativos, organizada em cinco sistemas de proteção e dez tecnologias próprias. Essa evolução reúne conhecimento técnico, informações de aplicações, pesquisa, ferramentas digitais e uma estratégia de distribuição internacional.",
  "Atualmente, lidera o desenvolvimento da ELIMFILTERS como uma plataforma de inteligência em filtração industrial, integrando engenharia, sistemas de conhecimento e inteligência artificial para apoiar a avaliação técnica e a tomada de decisões. Sua visão é conectar produtos, conhecimento e distribuidores para contribuir com a proteção e a continuidade operacional dos ativos de seus clientes e com a proteção do meio ambiente. Sua filosofia resume o propósito da marca: “O filtro é o meio. A proteção dos ativos é o objetivo.”",
];

const AGENT_PROFILES_PT: Record<string, string[]> = {
  "office_chief_operating_supply_chain": [
    "O Agente de Direção de Operações e Cadeia de Suprimentos conduz a estrutura por trás de cada remessa — coordenando compras, logística de exportação por contêiner a partir dos parceiros de fabricação da ELIMFILTERS e atendimento de pedidos em toda a rede de distribuidores que abrange Colômbia, República Dominicana, Venezuela e Estados Unidos.",
    "A função mantém o estoque, os compromissos com fornecedores e a execução de entregas alinhados à demanda comercial real, para que os pedidos de contêineres de um distribuidor nacional avancem dentro do prazo e no volume de que o mercado realmente precisa."
  ],
  "office_chief_product_technology": [
    "O Agente de Direção de Produto e Tecnologia é responsável pela plataforma técnica da ELIMFILTERS: os cinco sistemas de proteção — admissão e fluxo de ar, limpeza do combustível, lubrificação, hidráulica e arrefecimento — e as dez tecnologias próprias desenvolvidas para atendê-los, incluindo MACROCORE™ para admissão de ar do motor, HYDROCORE™ para separação padrão aprovada de água e combustível, não do tipo turbina, e TURBOCORE™ para sistemas aprovados de separadores de água e combustível do tipo turbina FH/FG.",
    "A função mantém cada especificação, referência cruzada e afirmação de aplicação validada em relação a equipamentos e modos de falha reais, para que o catálogo reflita evidências de engenharia, não uma lista genérica de peças."
  ],
  "office_chief_commercial_markets": [
    "O Agente de Direção Comercial e de Mercados conduz o programa de distribuidores exclusivos por país — qualificando novos parceiros territoriais, gerenciando preços e relações com contas e coordenando o CRM em cada mercado ativo e potencial.",
    "A função coloca em prática o modelo que prioriza distribuidores: dando prioridade a parceiros capazes de construir cobertura real e mantendo o crescimento comercial disciplinado, em vez de oportunista."
  ],
  "office_chief_finance_risk": [
    "O Agente de Direção de Finanças e Riscos gerencia a disciplina financeira de um negócio baseado em contêineres que prioriza distribuidores — margens, capital de giro e fluxo de caixa entre parceiros de fabricação, logística e uma base de contas a receber em vários países.",
    "A função dá à Chief Executive Office visibilidade da exposição financeira antes que se torne um problema: quais mercados apresentam bom desempenho, quais compromissos trazem risco e onde os recursos devem ser alocados em seguida."
  ],
  "office_chief_strategy_performance_intelligence": [
    "O Agente de Direção de Estratégia, Desempenho e Inteligência governa o próprio modelo de agentes de IA — monitorando o desempenho dos outros quatro agentes executivos, coordenando os dados e a automação que os mantêm responsáveis e sinalizando tudo o que precisa ser encaminhado à Chief Executive Office humana.",
    "A função também sustenta a estrutura organizacional plana em que a ELIMFILTERS opera: usando automação de processos para remover as camadas de aprovação interna que normalmente ficam entre um distribuidor e uma decisão."
  ]
};

export function LeadershipPageClient() {
  const { i18n } = useTranslation();
  const isPortuguese = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('pt');
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const founder = registry.founder;
  const founderProfile = isPortuguese ? FOUNDER_PROFILE_PT : isSpanish ? FOUNDER_PROFILE.es : FOUNDER_PROFILE.en;

  return (
    <main className="leadership-page">
      <PageHeader breadcrumbs={[{ label: 'About', href: '/about' }]} currentPage={isPortuguese ? "Liderança" : isSpanish ? 'Liderazgo' : 'Leadership'} />

      <section className="leadership-hero">
        <div className="leadership-wrap">
          <p className="eyebrow"><ReviewedText text={"ELIMFILTERS · LEADERSHIP"} /></p>
          <h1>{isPortuguese ? "Liderança humana. Execução nativa de IA." : isSpanish ? 'Liderazgo humano. Ejecución AI-native.' : 'Human leadership. AI-native execution.'}</h1>
          <p className="hero-copy">
            {isPortuguese ? "A ELIMFILTERS combina autoridade executiva humana com funções executivas especializadas operadas por agentes de IA sob uma estrutura formal de responsabilidade, autoridade delegada, rastreabilidade e encaminhamento." : isSpanish
              ? 'ELIMFILTERS combina autoridad ejecutiva humana con funciones ejecutivas especializadas operadas por agentes de IA bajo un marco formal de responsabilidad, autoridad delegada, trazabilidad y escalamiento.'
              : 'ELIMFILTERS combines human executive authority with specialized executive functions operated by AI agents under a formal framework of accountability, delegated authority, traceability, and escalation.'}
          </p>
        </div>
      </section>

      <section className="founder-section">
        <div className="founder-grid">
          <div className="founder-photo-shell">
            <ReviewedImage src={founder.image} alt={founder.alt} className="founder-photo" />
          </div>
          <div className="founder-copy">
            <p className="eyebrow dark"><ReviewedText text={"FOUNDER & CEO"} /></p>
            <h2>{founder.name}</h2>
            <p className="founder-role"><ReviewedText text={founder.designation} /></p>
            <div className="founder-profile">
              {founderProfile.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="agents-section">
        <div className="leadership-wrap">
          <p className="eyebrow"><ReviewedText text={"EXECUTIVE AI LEADERSHIP"} /></p>
          <h2>{isPortuguese ? "Cinco funções executivas especializadas." : isSpanish ? 'Cinco funciones ejecutivas especializadas.' : 'Five specialized executive functions.'}</h2>
          <p className="section-copy">
            {isPortuguese ? "O mesmo salto que levou a ELIMFILTERS de vender filtros a proteger ativos definiu como a própria empresa está organizada. Um distribuidor tradicional cresce adicionando pessoas e camadas de gestão; uma empresa construída sobre disciplina de engenharia e proteção de ativos de longo prazo precisava de uma estrutura capaz de ampliar experiência e consistência — por isso a ELIMFILTERS combina uma Chief Executive Office humana com agentes executivos de IA especializados, em vez de uma hierarquia gerencial convencional." : isSpanish
              ? 'El mismo salto que llevó a ELIMFILTERS de vender filtros a proteger activos es el que definió cómo está organizada la propia empresa. Un distribuidor tradicional escala agregando personas y capas de gerencia; una empresa construida sobre disciplina de ingeniería y protección de activos a largo plazo necesitaba una estructura que pudiera escalar experiencia y consistencia en su lugar — por eso ELIMFILTERS combina una Chief Executive Office humana con agentes ejecutivos de IA especializados, en vez de una jerarquía gerencial convencional.'
              : 'The same leap that took ELIMFILTERS from selling filters to protecting assets is what shaped how the company itself is organized. A traditional distributor scales by adding people and management layers; a company built around engineering discipline and long-term asset protection needed a structure that could scale expertise and consistency instead — which is why ELIMFILTERS pairs a human Chief Executive Office with specialized executive AI agents, rather than a conventional management hierarchy.'}
          </p>
          <p className="section-copy">
            {isPortuguese ? "Estes perfis são as representações visuais oficiais de agentes executivos de IA, não de funcionários humanos. Cada agente gerencia um domínio definido sob autoridade delegada e supervisão da Chief Executive Office." : isSpanish
              ? 'Estos perfiles son representaciones visuales oficiales de agentes ejecutivos de IA, no empleados humanos. Cada agente gestiona un dominio definido bajo autoridad delegada y supervisión de la Chief Executive Office.'
              : 'These profiles are the official visual representations of executive AI agents, not human employees. Each agent manages a defined domain under delegated authority and oversight of the Chief Executive Office.'}
          </p>

          <div className="agent-list">
            {registry.agents.map((agent) => {
              const profile = AGENT_PROFILES[agent.id];
              const paragraphs = isPortuguese ? AGENT_PROFILES_PT[agent.id] : isSpanish ? profile.es : profile.en;
              return (
                <article className="agent-profile" key={agent.id}>
                  <div className="agent-identity">
                    <div className="agent-photo-shell">
                      <ReviewedImage src={agent.image} alt={agent.alt} className="agent-photo" />
                    </div>
                    <span className="ai-label"><ReviewedText text={agent.label} /></span>
                    <h3><ReviewedText text={agent.title} /></h3>
                  </div>
                  <div className="agent-description">
                    {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {'email' in agent && agent.email ? (
                      <div className="agent-contact">
                        <span>{isPortuguese ? "CONTATO" : isSpanish ? 'CONTACTO' : 'CONTACT'}</span>
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
            <p className="eyebrow dark"><ReviewedText text={"GOVERNANCE & ACCOUNTABILITY"} /></p>
            <h2>{isPortuguese ? "A responsabilidade nunca se torna artificial." : isSpanish ? 'La responsabilidad nunca se vuelve artificial.' : 'Accountability never becomes artificial.'}</h2>
          </div>
          <p>
            {isPortuguese ? "A inteligência artificial pode exercer autoridade delegada dentro da ELIMFILTERS, mas as decisões estratégicas, materiais, excepcionais, irreversíveis ou de alto risco permanecem sujeitas à autoridade humana." : isSpanish
              ? 'La inteligencia artificial puede ejercer autoridad delegada dentro de ELIMFILTERS, pero las decisiones estratégicas, materiales, excepcionales, irreversibles o de alto riesgo permanecen sujetas a autoridad humana.'
              : 'Artificial intelligence may exercise delegated authority within ELIMFILTERS, but strategic, material, exceptional, irreversible, or high-risk decisions remain subject to human authority.'}
          </p>
        </div>
      </section>

      <section className="closing-section">
        <div className="leadership-wrap">
          <p className="eyebrow"><ReviewedText text={"CAPABILITY BEFORE COMPLEXITY"} /></p>
          <h2>{isPortuguese ? "Construídos para capacidade, não para aparentar tamanho." : isSpanish ? 'Construidos para capacidad, no para aparentar tamaño.' : 'Built for capability, not apparent headcount.'}</h2>
          <p className="section-copy">
            {isPortuguese ? "A ELIMFILTERS utiliza agentes, automação, sistemas e profissionais humanos onde cada mecanismo acrescenta maior competência. A escala organizacional cresce pela necessidade real, não para simular uma estrutura maior." : isSpanish
              ? 'ELIMFILTERS utiliza agentes, automatización, sistemas y profesionales humanos donde cada mecanismo aporta mayor competencia. La escala organizacional crece por necesidad real, no para simular una estructura mayor.'
              : 'ELIMFILTERS uses agents, automation, systems, and human professionals where each mechanism adds the greatest competence. Organizational scale grows from real need, not to simulate a larger structure.'}
          </p>
          <Link href="/about/who-we-are" className="back-link">{isPortuguese ? "Voltar a Quem Somos →" : isSpanish ? 'Volver a Quiénes Somos →' : 'Back to Who We Are →'}</Link>
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
