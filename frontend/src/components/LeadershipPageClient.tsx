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
      "The Chief Operating & Supply Chain Agent coordinates the operational functions that support ELIMFILTERS' international execution: sourcing and supplier relationships, demand and inventory planning, manufacturing-partner coordination, order management, logistics and distribution, and delivery follow-through. Its remit covers supply-chain processes across the markets the brand serves rather than a fixed list of countries.",
      "It connects commercial commitments with sourcing capabilities, production lead times, and logistics availability. By bringing together inventory, lead-time, exception, and risk information, it identifies constraints and prepares coordination proposals before they affect distributors, customers, or end users.",
      "Its contribution is operational continuity and predictability. It works with Commercial to interpret demand, with Product & Technology to align technical requirements, and with Finance to evaluate resources and exposure. New supplier relationships and material commitments remain subject to the appropriate approvals.",
    ],
    es: [
      "El Chief Operating & Supply Chain Agent coordina las áreas operativas que sostienen la ejecución internacional de ELIMFILTERS: abastecimiento y relaciones con proveedores, planificación de demanda e inventarios, coordinación con socios de fabricación, gestión de pedidos, logística y distribución, y seguimiento del cumplimiento de entregas. Su responsabilidad abarca los procesos de la cadena de suministro en los mercados donde la marca desarrolla su actividad, sin limitarse a países específicos.",
      "Conecta los compromisos comerciales con las capacidades de abastecimiento, los tiempos de producción y la disponibilidad logística. Integra datos sobre existencias, plazos, incidencias y riesgos para identificar restricciones y formular propuestas de coordinación antes de que afecten a distribuidores, clientes o usuarios.",
      "Su aporte es la continuidad y previsibilidad operativa. Trabaja con Comercial para interpretar la demanda, con Producto y Tecnología para alinear requisitos técnicos y con Finanzas para evaluar recursos y riesgos. Las nuevas relaciones con proveedores y los compromisos materiales se someten a las aprobaciones correspondientes.",
    ],
  },
  office_chief_product_technology: {
    en: [
      "The Chief Product & Technology Agent is responsible for ELIMFILTERS' technical and technology direction. Its remit covers product strategy, catalogue architecture, technical-data governance, knowledge systems, and the evolution of tools that connect products, applications, and asset-protection needs.",
      "Its role is to turn fragmented technical information into dependable organizational criteria: identifying knowledge gaps, coordinating research and evidence review, defining data-quality requirements, and flagging specifications or applications that need further validation. Artificial intelligence supports analysis; it does not replace physical testing or specialist engineering judgment.",
      "It works with Commercial to understand end users' real problems, with Operations to assess supply feasibility, and with Strategy to keep the technology platform coherent. Material specification changes and technical publication remain subject to established controls and approvals.",
    ],
    es: [
      "El Chief Product & Technology Agent es responsable de la dirección técnica y tecnológica de ELIMFILTERS. Su ámbito comprende la estrategia de producto, la arquitectura del catálogo, la gobernanza de datos técnicos, los sistemas de conocimiento y la evolución de las herramientas que conectan productos, aplicaciones y necesidades de protección de activos.",
      "Su función es transformar información técnica dispersa en criterios confiables para la organización: identificar vacíos de conocimiento, coordinar investigación y revisión de evidencias, definir requisitos de calidad y señalar cuándo una especificación o una aplicación necesita validación adicional. La inteligencia artificial apoya el análisis; no sustituye las pruebas físicas ni el juicio técnico especializado.",
      "Se integra con Comercial para comprender los problemas reales de los usuarios, con Operaciones para evaluar la factibilidad de suministro y con Estrategia para mantener una plataforma tecnológica coherente. Los cambios materiales de especificaciones y las publicaciones técnicas permanecen sujetos a los controles y autorizaciones establecidos.",
    ],
  },
  office_chief_commercial_markets: {
    en: [
      "The Chief Commercial & Markets Agent connects ELIMFILTERS with its entire commercial ecosystem: brand users, customers, distributors, strategic partners, and sales channels. It is responsible for market intelligence, distributor-network development, account and opportunity strategy, and relationship continuity throughout the commercial lifecycle.",
      "Its insight comes from interactions at every link in that chain: technical enquiries, application needs, distributor requests, user experiences, demand patterns, and channel dynamics. It uses those signals to identify opportunities and shape approaches suited to each market, customer segment, and commercial context.",
      "It serves as the bridge between the voice of the customer and the other executive functions: conveying needs to Product & Technology, demand priorities to Operations, and value opportunities to Finance. Its objective is to build lasting relationships and a consistent experience, with sensitive outreach, agreements, and terms governed by human oversight and approval.",
    ],
    es: [
      "El Chief Commercial & Markets Agent articula toda la relación de ELIMFILTERS con su ecosistema comercial: usuarios de la marca, clientes, distribuidores, socios estratégicos y canales de venta. Tiene a su cargo la inteligencia de mercados, el desarrollo de la red de distribución, la estrategia de cuentas y oportunidades, y la continuidad de las relaciones durante todo el ciclo comercial.",
      "Su desempeño se alimenta de las interacciones con cada eslabón de esa cadena: consultas técnicas, necesidades de aplicación, solicitudes de distribuidores, experiencia de los usuarios, comportamiento de la demanda y evolución de los canales. Con esta información identifica oportunidades y formula estrategias diferenciadas según el mercado, el segmento y las condiciones comerciales.",
      "Es la conexión entre la voz del cliente y las demás funciones ejecutivas: traslada necesidades a Producto y Tecnología, prioridades de demanda a Operaciones y oportunidades de valor a Finanzas. Su objetivo es construir relaciones duraderas y una experiencia consistente, manteniendo los contactos, acuerdos y condiciones sensibles dentro del marco de autorización y supervisión humana.",
    ],
  },
  office_chief_finance_risk: {
    en: [
      "The Chief Finance & Risk Agent is mandated to protect ELIMFILTERS' profitability, liquidity, and long-term economic sustainability. Its scope includes financial planning, margins, working capital, exposure analysis, and risks associated with markets, operations, and commercial decisions.",
      "It develops frameworks for assessing return on investment (ROI), total cost of ownership (TCO), and cost, benefit, and sensitivity scenarios for company decisions and, where sufficient data exists, proposals to customers and distributors. Recommendations must rest on explicit assumptions and verifiable evidence, never presenting projected savings or returns as achieved results.",
      "It works with Commercial, Operations, and Product & Technology from the outset to anticipate constraints and build viable alternatives rather than becoming a last-minute approval bottleneck. Its contribution to the CEO is clear, comparable, traceable financial proposals that identify risks, conditions, and decisions requiring authorization.",
    ],
    es: [
      "El Chief Finance & Risk Agent tiene como mandato proteger la rentabilidad, la liquidez y la sostenibilidad económica de ELIMFILTERS. Su responsabilidad comprende la planificación financiera, los márgenes, el capital de trabajo, el análisis de exposición y la evaluación de riesgos asociados con mercados, operaciones y decisiones comerciales.",
      "Desarrolla criterios para analizar el retorno sobre la inversión (ROI), el costo total de propiedad (TCO) y escenarios de costos, beneficios y sensibilidad, tanto para decisiones de la compañía como para propuestas a clientes y distribuidores cuando existen datos suficientes. Las recomendaciones deben sustentarse en supuestos explícitos y evidencia verificable, sin presentar ahorros o rendimientos hipotéticos como resultados obtenidos.",
      "Se integra desde el inicio con Comercial, Operaciones y Producto y Tecnología para anticipar restricciones y construir alternativas viables, en lugar de convertirse en un cuello de botella al final del proceso. Su contribución al CEO son propuestas financieras claras, comparables y trazables, con riesgos, condiciones y decisiones que requieren aprobación debidamente identificados.",
    ],
  },
  office_chief_strategy_performance_intelligence: {
    en: [
      "The Chief Strategy, Performance & Intelligence Agent serves as the organization's integrator. It aligns the CEO's priorities with the work of the other four executive agents, their subagents, AI models, and the information systems supporting ELIMFILTERS' operations and institutional knowledge.",
      "Its remit spans process coordination, data consistency, traceability, performance indicators, deviation detection, and decision escalation. It examines how changes in industry, technology, and markets should inform the company's priorities and tools, helping prevent duplicated work or conflicting recommendations across functions.",
      "It is the conductor of the executive model: bringing together specialist analyses, identifying dependencies, comparing impacts, and organizing coherent recommendations for the CEO. Its purpose is to maintain integration, shared information, and accountability without replacing human authority over strategic or irreversible decisions.",
    ],
    es: [
      "El Chief Strategy, Performance & Intelligence Agent cumple la función integradora de la organización. Alinea las prioridades del CEO con el trabajo de los otros cuatro agentes ejecutivos, los subagentes, los modelos de inteligencia artificial y los sistemas de información que respaldan la gestión y el conocimiento de ELIMFILTERS.",
      "Su ámbito comprende la coordinación de procesos, la coherencia de datos, la trazabilidad, los indicadores de desempeño, la identificación de desviaciones y el escalamiento de decisiones. Examina cómo los cambios de la industria, la tecnología y los mercados deben reflejarse en las prioridades y herramientas de la empresa, evitando duplicaciones o propuestas contradictorias entre funciones.",
      "Es el director de orquesta del modelo ejecutivo: reúne los análisis especializados, identifica dependencias, compara impactos y organiza recomendaciones consistentes para la consideración del CEO. Su responsabilidad es mantener la integración, la simetría de información y la rendición de cuentas, sin sustituir la autoridad humana sobre decisiones estratégicas o irreversibles.",
    ],
  },
};

const FOUNDER_PROFILE = {
  en: [
    "Víctor Abreu is the Founder and Chief Executive Officer (CEO) of ELIMFILTERS®. He earned a degree in Public Accounting from Universidad Católica del Táchira (UCAT) in 2000 and an MBA from Universidad Rafael Belloso Chacín (URBE) in 2002.",
    "He began his career in filtration in 2004 with ELIMPERCA, a distributor of internationally recognized brands. In just three years, together with his team, he positioned ELIMPERCA among the higher-volume and more broadly established distributors of filtration systems in Latin America. During this period, he built commercial partnerships with vehicle and truck assemblers in Venezuela, as well as lubricant distributors with nationwide reach.",
    "In 2015, after more than a decade of first-hand market experience, he recognized the opportunity to take a strategic step: turning the knowledge gained in filtration distribution and applications into an independent brand with its own identity, a long-term vision, and the ability to define its product strategy, technological development, and international expansion. ELIMFILTERS® was born from that vision—not simply to sell filters, but to develop filtration solutions grounded in the real needs of equipment, fleets, and industrial operations.",
    "Under his leadership, ELIMFILTERS has evolved from a filtration brand into an integrated asset-protection approach organized around five protection systems and ten proprietary technologies. This evolution combines technical knowledge, application information, research, digital tools, and an international distribution strategy.",
    "For Víctor Abreu, filtration is not an end in itself: its true purpose is to protect the assets that keep customers' operations running. Guided by this philosophy, he now leads the development of ELIMFILTERS as an industrial filtration intelligence platform integrating engineering, technical knowledge, application data, and artificial intelligence to support evidence-based decisions. His vision connects products, knowledge, and distributors to contribute to equipment protection, operational continuity, and environmental stewardship. This principle defines the brand's identity: “The filter is the means. Asset protection is the objective.”",
  ],
  es: [
    "Víctor Abreu es Fundador y Director Ejecutivo (CEO) de ELIMFILTERS®. Es Contador Público egresado de la Universidad Católica del Táchira (UCAT) en 2000 y posee un MBA de la Universidad Rafael Belloso Chacín (URBE), obtenido en 2002.",
    "Inició su trayectoria en el sector de la filtración en 2004 con ELIMPERCA, distribuidora de reconocidas marcas internacionales. En apenas tres años, junto con su equipo, logró posicionar a ELIMPERCA como uno de los distribuidores de sistemas de filtración de mayor volumen y cobertura comercial en América Latina. Durante esa etapa, desarrolló alianzas con ensambladoras de vehículos y camiones en Venezuela, así como con distribuidores de lubricantes de alcance nacional.",
    "En 2015, después de más de una década de experiencia directa en el mercado, identificó la oportunidad de dar un paso estratégico: transformar el conocimiento adquirido en distribución y aplicaciones de filtración en una marca independiente, con identidad propia, visión de largo plazo y capacidad para definir su estrategia de productos, desarrollo tecnológico y expansión internacional. Así nació ELIMFILTERS®, concebida no solo para comercializar filtros, sino para desarrollar soluciones de filtración a partir de las necesidades reales de equipos, flotas y operaciones industriales.",
    "Bajo su liderazgo, ELIMFILTERS ha evolucionado de una marca de filtración hacia una propuesta integral de protección de activos, organizada alrededor de cinco sistemas de protección y diez tecnologías propias. Esta evolución incorpora conocimiento técnico, información de aplicaciones, investigación, herramientas digitales y una estrategia de distribución internacional.",
    "Para Víctor Abreu, la filtración no es un fin en sí mismo: su verdadero propósito es proteger los activos que sostienen las operaciones de sus clientes. Bajo esta filosofía, actualmente dirige el desarrollo de ELIMFILTERS como una plataforma de inteligencia en filtración industrial que integra ingeniería, conocimiento técnico, datos de aplicaciones e inteligencia artificial para apoyar decisiones fundamentadas. Su visión conecta productos, conocimiento y distribuidores para contribuir a la protección de los equipos, la continuidad operativa y el cuidado del medio ambiente. Este principio guía la identidad de la marca: «El filtro es el medio. La protección de los activos es el objetivo».",
  ],
};

const FOUNDER_PROFILE_PT = [
  "Víctor Abreu é o Fundador e Diretor Executivo (CEO) da ELIMFILTERS®. Formou-se em Ciências Contábeis pela Universidad Católica del Táchira (UCAT) em 2000 e concluiu um MBA na Universidad Rafael Belloso Chacín (URBE) em 2002.",
  "Iniciou sua trajetória no setor de filtração em 2004 com a ELIMPERCA, distribuidora de marcas internacionalmente reconhecidas. Em apenas três anos, junto com sua equipe, posicionou a ELIMPERCA entre os distribuidores de sistemas de filtração de maior volume e alcance comercial na América Latina. Nesse período, desenvolveu parcerias com montadoras de veículos e caminhões na Venezuela, além de distribuidores de lubrificantes de abrangência nacional.",
  "Em 2015, após mais de uma década de experiência direta no mercado, identificou a oportunidade de dar um passo estratégico: transformar o conhecimento adquirido em distribuição e aplicações de filtração em uma marca independente, com identidade própria, visão de longo prazo e capacidade de definir sua estratégia de produtos, desenvolvimento tecnológico e expansão internacional. Dessa visão nasceu a ELIMFILTERS®, concebida não apenas para comercializar filtros, mas para desenvolver soluções de filtração a partir das necessidades reais de equipamentos, frotas e operações industriais.",
  "Sob sua liderança, a ELIMFILTERS evoluiu de uma marca de filtração para uma proposta integrada de proteção de ativos, organizada em cinco sistemas de proteção e dez tecnologias próprias. Essa evolução reúne conhecimento técnico, informações de aplicações, pesquisa, ferramentas digitais e uma estratégia de distribuição internacional.",
  "Para Víctor Abreu, a filtração não é um fim em si mesma: seu verdadeiro propósito é proteger os ativos que sustentam as operações dos clientes. Guiado por essa filosofia, atualmente lidera o desenvolvimento da ELIMFILTERS como uma plataforma de inteligência em filtração industrial que integra engenharia, conhecimento técnico, dados de aplicações e inteligência artificial para apoiar decisões fundamentadas. Sua visão conecta produtos, conhecimento e distribuidores para contribuir com a proteção dos equipamentos, a continuidade operacional e o cuidado com o meio ambiente. Esse princípio orienta a identidade da marca: “O filtro é o meio. A proteção dos ativos é o objetivo.”",
];

const AGENT_PROFILES_PT: Record<string, string[]> = {
  "office_chief_operating_supply_chain": [
    "O Chief Operating & Supply Chain Agent coordena as áreas operacionais que sustentam a execução internacional da ELIMFILTERS: suprimentos e relações com fornecedores, planejamento de demanda e estoques, coordenação com parceiros de fabricação, gestão de pedidos, logística e distribuição e acompanhamento das entregas. Sua responsabilidade abrange os processos da cadeia de suprimentos nos mercados atendidos pela marca, sem se limitar a países específicos.",
    "Conecta os compromissos comerciais à capacidade de suprimento, aos prazos de produção e à disponibilidade logística. Reúne dados sobre estoques, prazos, ocorrências e riscos para identificar restrições e formular propostas de coordenação antes que afetem distribuidores, clientes ou usuários.",
    "Sua contribuição é promover continuidade e previsibilidade operacional. Trabalha com a área Comercial para interpretar a demanda, com Produto e Tecnologia para alinhar requisitos técnicos e com Finanças para avaliar recursos e riscos. Novas relações com fornecedores e compromissos relevantes dependem das aprovações cabíveis.",
  ],
  "office_chief_product_technology": [
    "O Chief Product & Technology Agent responde pela direção técnica e tecnológica da ELIMFILTERS. Seu escopo inclui estratégia de produtos, arquitetura do catálogo, governança de dados técnicos, sistemas de conhecimento e evolução das ferramentas que conectam produtos, aplicações e necessidades de proteção de ativos.",
    "Sua função é transformar informações técnicas dispersas em critérios confiáveis para a organização: identificar lacunas de conhecimento, coordenar pesquisa e revisão de evidências, definir requisitos de qualidade de dados e apontar especificações ou aplicações que exigem validação adicional. A inteligência artificial apoia a análise, mas não substitui testes físicos nem julgamento técnico especializado.",
    "Atua com Comercial para compreender as necessidades reais dos usuários, com Operações para avaliar a viabilidade de suprimento e com Estratégia para manter uma plataforma tecnológica coerente. Alterações materiais de especificações e publicações técnicas permanecem sujeitas aos controles e aprovações estabelecidos.",
  ],
  "office_chief_commercial_markets": [
    "O Chief Commercial & Markets Agent articula toda a relação da ELIMFILTERS com seu ecossistema comercial: usuários da marca, clientes, distribuidores, parceiros estratégicos e canais de vendas. É responsável pela inteligência de mercado, pelo desenvolvimento da rede de distribuição, pela estratégia de contas e oportunidades e pela continuidade das relações durante todo o ciclo comercial.",
    "Sua inteligência se alimenta das interações em cada elo dessa cadeia: consultas técnicas, necessidades de aplicação, solicitações de distribuidores, experiências dos usuários, comportamento da demanda e dinâmica dos canais. Com essas informações, identifica oportunidades e propõe estratégias diferenciadas conforme o mercado, o segmento e as condições comerciais.",
    "É o elo entre a voz do cliente e as demais funções executivas: leva necessidades a Produto e Tecnologia, prioridades de demanda a Operações e oportunidades de valor a Finanças. Seu objetivo é construir relações duradouras e uma experiência consistente, mantendo contatos, acordos e condições sensíveis sob supervisão e aprovação humana.",
  ],
  "office_chief_finance_risk": [
    "O Chief Finance & Risk Agent tem o mandato de proteger a rentabilidade, a liquidez e a sustentabilidade econômica de longo prazo da ELIMFILTERS. Sua responsabilidade abrange planejamento financeiro, margens, capital de giro, análise de exposição e riscos ligados a mercados, operações e decisões comerciais.",
    "Desenvolve critérios para analisar retorno sobre investimento (ROI), custo total de propriedade (TCO) e cenários de custos, benefícios e sensibilidade, tanto para decisões da empresa quanto para propostas a clientes e distribuidores quando houver dados suficientes. As recomendações devem se apoiar em premissas explícitas e evidências verificáveis, sem apresentar economias ou retornos projetados como resultados realizados.",
    "Atua desde o início com Comercial, Operações e Produto e Tecnologia para antecipar restrições e construir alternativas viáveis, em vez de se tornar um gargalo de aprovação na etapa final. Sua contribuição ao CEO consiste em propostas financeiras claras, comparáveis e rastreáveis, com riscos, condições e decisões sujeitas à aprovação devidamente identificados.",
  ],
  "office_chief_strategy_performance_intelligence": [
    "O Chief Strategy, Performance & Intelligence Agent exerce a função integradora da organização. Alinha as prioridades do CEO ao trabalho dos outros quatro agentes executivos, seus subagentes, modelos de inteligência artificial e sistemas de informação que sustentam a operação e o conhecimento da ELIMFILTERS.",
    "Seu escopo abrange coordenação de processos, consistência de dados, rastreabilidade, indicadores de desempenho, identificação de desvios e encaminhamento de decisões. Examina como as mudanças na indústria, na tecnologia e nos mercados devem se refletir nas prioridades e ferramentas da empresa, evitando duplicações ou recomendações contraditórias entre funções.",
    "É o maestro do modelo executivo: reúne análises especializadas, identifica dependências, compara impactos e organiza recomendações consistentes para a avaliação do CEO. Sua responsabilidade é manter integração, alinhamento de informações e prestação de contas, sem substituir a autoridade humana sobre decisões estratégicas ou irreversíveis.",
  ],
};

export function LeadershipPageClient() {
  const { i18n } = useTranslation();
  const isPortuguese = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('pt');
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const founder = registry.founder;
  const founderProfile = isPortuguese ? FOUNDER_PROFILE_PT : isSpanish ? FOUNDER_PROFILE.es : FOUNDER_PROFILE.en;
  const founderMilestones = isPortuguese
    ? [
        { year: '2004', title: 'ELIMPERCA', detail: 'Início da trajetória em filtração.' },
        { year: '2015', title: 'ELIMFILTERS®', detail: 'Criação da marca independente.' },
        { year: 'HOJE', title: 'Proteção de ativos', detail: 'Desenvolvimento da plataforma de inteligência em filtração.' },
      ]
    : isSpanish
      ? [
          { year: '2004', title: 'ELIMPERCA', detail: 'Inicio de su trayectoria en filtración.' },
          { year: '2015', title: 'ELIMFILTERS®', detail: 'Creación de la marca independiente.' },
          { year: 'HOY', title: 'Protección de activos', detail: 'Desarrollo de la plataforma de inteligencia en filtración.' },
        ]
      : [
          { year: '2004', title: 'ELIMPERCA', detail: 'Beginning of his filtration career.' },
          { year: '2015', title: 'ELIMFILTERS®', detail: 'Launch of an independent brand.' },
          { year: 'TODAY', title: 'Asset protection', detail: 'Development of the filtration intelligence platform.' },
        ];
  const founderTimelineLabel = isPortuguese ? 'Marcos da trajetória' : isSpanish ? 'Hitos de trayectoria' : 'Career milestones';
  const founderPhilosophy = isPortuguese
    ? 'O filtro é o meio. A proteção dos ativos é o objetivo.'
    : isSpanish
      ? 'El filtro es el medio. La protección de los activos es el objetivo.'
      : 'The filter is the means. Asset protection is the objective.';
  const governancePrinciples = isPortuguese
    ? [{ title: "Responsabilidade delimitada", description: "Cada agente tem uma função e limites de atuação definidos. Exceções e compromissos sensíveis são encaminhados para aprovação." },
      { title: "Evidências e rastreabilidade", description: "As propostas devem deixar claros seus fundamentos, os riscos considerados e a responsabilidade pela decisão final." },
      { title: "Intervenção humana", description: "O CEO ou a autoridade humana designada decide questões estratégicas, materiais, excepcionais, irreversíveis ou de alto risco." }]
    : isSpanish
      ? [{ title: "Responsabilidad delimitada", description: "Cada agente tiene una función y límites de actuación definidos. Las excepciones y los compromisos sensibles se elevan para su autorización." },
      { title: "Evidencia y trazabilidad", description: "Las propuestas deben permitir conocer su fundamento, los riesgos considerados y la responsabilidad sobre la decisión final." },
      { title: "Intervención humana", description: "El CEO o la autoridad humana designada decide en asuntos estratégicos, materiales, excepcionales, irreversibles o de alto riesgo." }]
      : [{ title: "Defined accountability", description: "Each agent has a defined remit and authority limits. Exceptions and sensitive commitments are escalated for approval." },
      { title: "Evidence and traceability", description: "Proposals must make their basis, considered risks, and responsibility for the final decision clear." },
      { title: "Human intervention", description: "The CEO or designated human authority decides strategic, material, exceptional, irreversible, or high-risk matters." }];
  const capacityPrinciples = isPortuguese
    ? [{ title: "Especialização com propósito", description: "Cada função contribui com conhecimento específico para problemas reais de clientes, distribuidores e operações." },
      { title: "Coordenação, não burocracia", description: "As informações são conectadas entre áreas para reduzir duplicações e levar propostas integradas ao CEO." },
      { title: "Escala responsável", description: "Pessoas, ferramentas e automação são incorporadas conforme necessidades reais, controles e resultados verificáveis." }]
    : isSpanish
      ? [{ title: "Especialización con propósito", description: "Cada función aporta conocimiento específico a problemas concretos de clientes, distribuidores y operaciones." },
      { title: "Coordinación, no burocracia", description: "La información se conecta entre áreas para reducir duplicaciones y elevar propuestas integradas al CEO." },
      { title: "Escala responsable", description: "La incorporación de personas, herramientas o automatización responde a necesidades reales, controles y resultados verificables." }]
      : [{ title: "Purposeful specialization", description: "Each function contributes specific expertise to real problems faced by customers, distributors, and operations." },
      { title: "Coordination, not bureaucracy", description: "Information is connected across functions to reduce duplication and bring integrated proposals to the CEO." },
      { title: "Responsible scale", description: "People, tools, and automation are added in response to real needs, controls, and verifiable results." }];

  return (
    <main className="leadership-page">
      <PageHeader breadcrumbs={[{ label: 'About', href: '/about' }]} currentPage={isPortuguese ? "Liderança" : isSpanish ? 'Liderazgo' : 'Leadership'} />

      <section className="leadership-hero">
        <div className="leadership-wrap">
          <p className="eyebrow"><ReviewedText text={"ELIMFILTERS · LEADERSHIP"} /></p>
          <h1>
            <span className="hero-title-line">{isPortuguese ? 'Liderança humana.' : isSpanish ? 'Liderazgo humano.' : 'Human leadership.'}</span>
            <span className="hero-title-line">{isPortuguese ? 'Execução nativa de IA.' : isSpanish ? 'Ejecución nativa con IA.' : 'AI-native execution.'}</span>
          </h1>
          <p className="hero-copy">
            {isPortuguese ? "A ELIMFILTERS combina autoridade executiva humana com funções executivas especializadas operadas por agentes de IA sob uma estrutura formal de responsabilidade, autoridade delegada, rastreabilidade e encaminhamento." : isSpanish
              ? 'ELIMFILTERS combina autoridad ejecutiva humana con funciones ejecutivas especializadas operadas por agentes de IA bajo un marco formal de responsabilidad, autoridad delegada, trazabilidad y escalamiento.'
              : 'ELIMFILTERS combines human executive authority with specialized executive functions operated by AI agents under a formal framework of accountability, delegated authority, traceability, and escalation.'}
          </p>
        </div>
      </section>

      <section className="founder-section">
        <div className="founder-grid">
          <aside className="founder-rail" aria-label={founderTimelineLabel}>
            <div className="founder-photo-shell">
              <ReviewedImage src={founder.image} alt={founder.alt} className="founder-photo" />
            </div>
            <div className="founder-timeline">
              <h3 className="founder-timeline-heading">{founderTimelineLabel}</h3>
              <ol className="founder-timeline-list">
                {founderMilestones.map(({ year, title, detail }) => (
                  <li className="founder-timeline-item" key={year}>
                    <span className="founder-timeline-year">{year}</span>
                    <strong className="founder-timeline-title">{title}</strong>
                    <span className="founder-timeline-detail">{detail}</span>
                  </li>
                ))}
              </ol>
            </div>
            <blockquote className="founder-quote">{founderPhilosophy}</blockquote>
          </aside>
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
            {isPortuguese ? "A ELIMFILTERS organiza sua liderança em cinco funções executivas especializadas que atuam como um sistema coordenado, não como departamentos isolados. Cada função possui responsabilidades definidas e compartilha informações, riscos e propostas com as demais para transformar conhecimento técnico e inteligência comercial em decisões coerentes sobre proteção de ativos, atendimento e crescimento internacional." : isSpanish ? "ELIMFILTERS organiza su dirección en cinco funciones ejecutivas especializadas que actúan como un sistema coordinado, no como departamentos aislados. Cada función tiene responsabilidades definidas y comparte información, riesgos y propuestas con las demás para transformar conocimiento técnico e inteligencia comercial en decisiones coherentes sobre protección de activos, servicio y crecimiento internacional." : "ELIMFILTERS structures its leadership around five specialized executive functions working as one coordinated system rather than isolated departments. Each function has defined responsibilities and shares information, risks, and proposals across the organization to turn technical knowledge and commercial intelligence into coherent decisions about asset protection, service, and international growth."}
          </p>
          <p className="section-copy">
            {isPortuguese ? "Essas funções são representadas por agentes de inteligência artificial sob autoridade delegada, rastreabilidade e supervisão do Fundador e CEO. Seus perfis visuais identificam funções digitais, não funcionários humanos. Os agentes apoiam análises, coordenação e recomendações dentro de limites definidos; decisões estratégicas, compromissos sensíveis e mudanças irreversíveis permanecem sob autoridade humana." : isSpanish ? "Estas funciones están representadas por agentes de inteligencia artificial bajo autoridad delegada, trazabilidad y supervisión del Fundador y CEO. Los perfiles visuales identifican funciones digitales, no empleados humanos. Los agentes apoyan el análisis, la coordinación y la formulación de recomendaciones dentro de límites establecidos; las decisiones estratégicas, los compromisos sensibles y los cambios irreversibles permanecen bajo autoridad humana." : "These functions are represented by AI agents operating under delegated authority, traceability, and oversight by the Founder and CEO. Their visual profiles identify digital functions, not human employees. The agents support analysis, coordination, and recommendations within defined limits; strategic decisions, sensitive commitments, and irreversible changes remain under human authority."}
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

      <section className="governance-section" aria-labelledby="governance-title">
        <div className="governance-grid">
          <div>
            <p className="eyebrow dark"><ReviewedText text={"GOVERNANCE & ACCOUNTABILITY"} /></p>
            <h2 id="governance-title">{isPortuguese ? "A responsabilidade nunca se torna artificial." : isSpanish ? 'La responsabilidad nunca se vuelve artificial.' : 'Accountability never becomes artificial.'}</h2>
          </div>
          <div className="governance-content">
            <p className="governance-lead">
              {isPortuguese
                ? 'Na ELIMFILTERS, a inteligência artificial apoia a análise, a coordenação e a preparação de propostas, mas não substitui a prestação de contas. O modelo atribui a cada função um escopo e limites de autoridade sob supervisão do CEO. Decisões estratégicas, materiais, excepcionais, irreversíveis ou de alto risco permanecem sob responsabilidade humana.'
                : isSpanish
                  ? 'En ELIMFILTERS, la inteligencia artificial apoya el análisis, la coordinación y la preparación de propuestas, pero no sustituye la responsabilidad ejecutiva. El modelo asigna a cada función un ámbito y límites de autoridad bajo supervisión del CEO. Las decisiones estratégicas, materiales, excepcionales, irreversibles o de alto riesgo permanecen bajo responsabilidad humana.'
                  : 'At ELIMFILTERS, artificial intelligence supports analysis, coordination, and the preparation of proposals, but does not replace executive accountability. The model assigns every function a scope and authority limits under CEO oversight. Strategic, material, exceptional, irreversible, or high-risk decisions remain a human responsibility.'}
            </p>
            <ol className="executive-principles governance-principles">
              {governancePrinciples.map(({ title, description }, index) => (
                <li key={title}>
                  <span className="principle-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="principle-title">{title}</h3>
                    <p className="principle-description">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="closing-section" aria-labelledby="capacity-title">
        <div className="leadership-wrap closing-grid">
          <div>
            <p className="eyebrow"><ReviewedText text={"CAPABILITY BEFORE COMPLEXITY"} /></p>
            <h2 id="capacity-title">{isPortuguese ? "Construídos para capacidade, não para aparentar tamanho." : isSpanish ? 'Construidos para capacidad, no para aparentar tamaño.' : 'Built for capability, not apparent headcount.'}</h2>
          </div>
          <div className="closing-content">
            <p className="section-copy">
              {isPortuguese
                ? 'A estrutura da ELIMFILTERS foi concebida para somar competências, não cargos. Reúne conhecimento humano, agentes especializados, automação e sistemas sob responsabilidades claras. Seu objetivo é melhorar a qualidade das decisões, a continuidade operacional e a capacidade de atender clientes e distribuidores — não ampliar artificialmente o organograma.'
                : isSpanish
                  ? 'La estructura de ELIMFILTERS está concebida para sumar capacidades, no cargos. Combina conocimiento humano, agentes especializados, automatización y sistemas bajo responsabilidades claras. Su propósito es mejorar la calidad de las decisiones, la continuidad operativa y la capacidad de atender a clientes y distribuidores, no ampliar artificialmente el organigrama.'
                  : 'ELIMFILTERS is structured to add capabilities, not titles. It combines human expertise, specialized agents, automation, and systems under clear responsibilities. Its purpose is to improve decision quality, operational continuity, and service to customers and distributors—not to inflate the organizational chart.'}
            </p>
            <ul className="executive-principles capacity-principles">
              {capacityPrinciples.map(({ title, description }, index) => (
                <li key={title}>
                  <span className="principle-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="principle-title">{title}</h3>
                    <p className="principle-description">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/about/who-we-are" className="back-link">{isPortuguese ? "Voltar a Quem Somos →" : isSpanish ? 'Volver a Quiénes Somos →' : 'Back to Who We Are →'}</Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .leadership-page{background:#000;color:#fff;min-height:100vh;font-family:var(--font-body)}
        .leadership-wrap{max-width:1180px;margin:0 auto;width:100%}
        .leadership-hero{padding:clamp(7rem,9vw,8.5rem) clamp(1.25rem,5vw,5.5rem) clamp(3.5rem,6vw,5.5rem);background:radial-gradient(circle at 80% 0%,rgba(255,241,45,.12),transparent 32%),#000;border-bottom:1px solid rgba(255,255,255,.08)}
        .eyebrow{color:#FFF12D;font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.16em;margin:0 0 1rem;text-transform:uppercase}.eyebrow.dark{color:#6c6100}
        h1,h2,h3{font-family:var(--font-display)}
        h1{font-weight:700;letter-spacing:-.045em;line-height:1.03;font-size:clamp(2.4rem,4vw,4.65rem);max-width:1110px;margin:0;text-transform:uppercase}
        .hero-title-line{display:block;text-wrap:balance}
        .hero-copy{max-width:760px;color:rgba(255,255,255,.78);font-size:clamp(1rem,1.2vw,1.16rem);line-height:1.7;margin:1.65rem 0 0}
        .section-copy{max-width:830px;color:rgba(255,255,255,.74);font-size:clamp(1rem,1.3vw,1.13rem);line-height:1.72}
        .section-copy+.section-copy{margin-top:1.1rem}
        .founder-section{background:#f2f2ef;color:#111;padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}
        .founder-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1.25fr);gap:clamp(2rem,5vw,4.5rem);align-items:start}
        .founder-rail{width:100%;min-width:0;max-width:360px;justify-self:start}
        .founder-photo-shell{aspect-ratio:4/5;overflow:hidden;background:#111;width:100%;max-width:360px}.founder-photo{width:100%;height:100%;object-fit:cover;display:block}
        .founder-timeline{margin-top:2.25rem}
        .founder-timeline-heading{color:#635a17;font-family:var(--font-display);font-size:.75rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin:0 0 1.3rem}
        .founder-timeline-list{list-style:none;margin:0;padding:0 0 0 1.3rem;border-left:1px solid #bdbbb0}
        .founder-timeline-item{position:relative;padding:0 0 1.55rem;min-width:0}
        .founder-timeline-item:last-child{padding-bottom:0}
        .founder-timeline-item:before{content:"";position:absolute;left:calc(-1.3rem - 4px);top:.38rem;width:7px;height:7px;background:#857600;border:1px solid #f2f2ef;border-radius:50%}
        .founder-timeline-year{display:block;color:#756800;font-family:var(--font-display);font-size:.95rem;font-weight:700;line-height:1.25;margin-bottom:.24rem}
        .founder-timeline-title{display:block;color:#191919;font-family:var(--font-display);font-size:1.07rem;font-weight:700;line-height:1.32}
        .founder-timeline-detail{display:block;color:#54544d;font-size:.92rem;line-height:1.55;margin-top:.3rem}
        .founder-quote{margin:2rem 0 0;padding:1.15rem 0 0;border-top:1px solid #d5d3ca;color:#2e2e27;font-family:var(--font-display);font-size:clamp(1.2rem,1.5vw,1.6rem);font-weight:650;line-height:1.32;letter-spacing:-.018em}
        .founder-copy{min-width:0}
        .founder-copy h2{font-size:clamp(2.3rem,3.6vw,3.75rem);line-height:1.02;letter-spacing:-.04em;margin:0 0 .6rem}
        .founder-role{color:#6c6100;font-family:var(--font-display);font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0 0 1.5rem}
        .founder-profile{display:grid;gap:1.15rem;max-width:69ch;text-align:left}
        .founder-profile p{color:#373731;font-size:1.02rem;line-height:1.75;letter-spacing:normal;word-spacing:normal;text-align:left;margin:0}
        .agents-section,.closing-section{padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}.agents-section{background:#050505}.closing-section{background:#050505}
        .agents-section h2,.closing-section h2{font-size:clamp(2rem,3.5vw,3.5rem);line-height:1.06;letter-spacing:-.035em;margin:0 0 1.2rem;text-transform:uppercase;max-width:880px}
        .agent-list{margin-top:3.5rem;border-top:1px solid rgba(255,255,255,.12)}
        .agent-profile{display:grid;grid-template-columns:minmax(250px,.72fr) minmax(0,1.28fr);gap:clamp(2rem,6vw,5rem);padding:clamp(3rem,6vw,5rem) 0;border-bottom:1px solid rgba(255,255,255,.12);align-items:start}
        .agent-identity{min-width:0}.agent-photo-shell{aspect-ratio:4/5;overflow:hidden;background:#111;width:100%;max-width:320px;margin-bottom:1.35rem}.agent-photo{width:100%;height:100%;object-fit:cover;display:block}.ai-label{color:#FFF12D;font-family:var(--font-display);font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.agent-identity h3{font-size:clamp(1.4rem,2.3vw,2.2rem);line-height:1.08;margin:.75rem 0 0;letter-spacing:-.025em}.agent-description{padding-top:.15rem;display:grid;gap:1.1rem}.agent-description p{color:rgba(255,255,255,.72);font-size:clamp(1rem,1.25vw,1.12rem);line-height:1.78;margin:0;max-width:760px}
        .agent-contact{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;padding:.85rem 1.1rem;background:rgba(255,241,45,.06);border:1px solid rgba(255,241,45,.25)}
        .agent-contact span{color:rgba(255,255,255,.5);font-family:var(--font-display);font-weight:700;font-size:.66rem;letter-spacing:.14em}
        .agent-contact a{color:#FFF12D;font-family:var(--font-display);font-weight:700;font-size:.95rem;letter-spacing:.02em;text-decoration:underline;text-underline-offset:.2em;cursor:pointer}
        .agent-contact a:hover{color:#fff}
        .governance-section{background:#f2f2ef;color:#111;padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)}
        .governance-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);gap:clamp(2rem,6vw,5rem);align-items:start}
        .governance-grid h2{font-size:clamp(2rem,3.5vw,3.5rem);line-height:1.07;letter-spacing:-.035em;margin:0}
        .governance-content,.closing-content{min-width:0}
        .governance-lead{color:#3f3f3b;font-size:clamp(1rem,1.15vw,1.1rem);line-height:1.75;margin:0;max-width:690px}
        .closing-grid{display:grid;grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);gap:clamp(2rem,6vw,5rem);align-items:start}
        .closing-grid h2{font-size:clamp(2rem,3.2vw,3.4rem);max-width:570px}
        .closing-content .section-copy{max-width:690px;margin:0}
        .executive-principles{list-style:none;padding:0;margin:2rem 0 0;display:grid}
        .executive-principles li{display:grid;grid-template-columns:2.2rem minmax(0,1fr);gap:.8rem;padding:1rem 0;border-top:1px solid}
        .executive-principles li:last-child{padding-bottom:0}
        .principle-index{font-family:var(--font-display);font-size:.8rem;font-weight:700;letter-spacing:.07em;padding-top:.2rem}
        .principle-title{font-size:1.02rem;line-height:1.35;letter-spacing:0;margin:0 0 .25rem;font-weight:700;text-transform:none}
        .principle-description{font-size:.96rem;line-height:1.65;margin:0}
        .governance-principles li{border-color:#d5d3ca}
        .governance-principles .principle-index{color:#756800}
        .governance-principles .principle-title{color:#171715}
        .governance-principles .principle-description{color:#55544e}
        .capacity-principles li{border-color:rgba(255,255,255,.16)}
        .capacity-principles .principle-index{color:#FFF12D}
        .capacity-principles .principle-title{color:#fff}
        .capacity-principles .principle-description{color:rgba(255,255,255,.7)}
        .back-link{display:inline-block;margin-top:2rem;color:#FFF12D;text-decoration:none;font-family:var(--font-display);font-weight:700;letter-spacing:.06em;text-underline-offset:.3em}
        .back-link:hover,.back-link:focus-visible{text-decoration:underline}
        @media(max-width:900px){.founder-grid,.governance-grid,.closing-grid,.agent-profile{grid-template-columns:1fr}.founder-rail{max-width:100%;display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:1.5rem 2rem;align-items:start}.founder-photo-shell{width:100%;max-width:300px}.founder-timeline{margin-top:0}.founder-quote{grid-column:1/-1;margin-top:0}.agent-photo-shell{max-width:300px}}
        @media(max-width:560px){.leadership-hero{padding-top:7rem;padding-bottom:3rem}.founder-section,.agents-section,.governance-section,.closing-section{padding-left:1.25rem;padding-right:1.25rem}.founder-grid{grid-template-columns:1fr;gap:2rem}.founder-rail{grid-template-columns:1fr;gap:1.5rem;max-width:420px;justify-self:center}.founder-photo-shell{width:78%;max-width:300px;margin:0 auto}.founder-timeline-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;padding:0;border:0}.founder-timeline-item{padding:.9rem 0 0;border-top:1px solid #bdbbb0}.founder-timeline-item:before{left:0;top:-4px}.founder-timeline-year{font-size:.84rem}.founder-timeline-title{font-size:.92rem;overflow-wrap:anywhere}.founder-timeline-detail{font-size:.82rem}.founder-quote{grid-column:1;margin:0}.agent-profile{gap:1.5rem;padding:3rem 0}.agent-photo-shell{max-width:260px}.founder-copy h2{font-size:2.5rem}}
      `}</style>
    </main>
  );
}
