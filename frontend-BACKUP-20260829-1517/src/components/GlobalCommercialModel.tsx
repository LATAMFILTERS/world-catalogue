'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

type Props = {
  variant?: 'about' | 'distributors';
};

type Copy = {
  sectionEyebrowAbout: string;
  sectionEyebrowDistributors: string;
  titleAbout: string;
  titleDistributors: string;
  lead: string;
  prcEyebrow: string;
  prcTitle: string;
  prcBody: string;
  partnerEyebrow: string;
  partnerTitle: string;
  partnerLead: string;
  partnerGovernance: string;
  partnerResult: string;
  marketEyebrow: string;
  marketTitle: string;
  marketBody: string;
  marketAllocation: string;
  partnershipEyebrow: string;
  partnershipTitle: string;
  apply: string;
};

const COPY_EN: Copy = {
  sectionEyebrowAbout: 'GLOBAL ENGINEERING & MANUFACTURING MODEL',
  sectionEyebrowDistributors: 'THE ELIMFILTERS GLOBAL MODEL',
  titleAbout: 'German-Developed Media. Qualified PRC Manufacturing. ELIMFILTERS Technical Governance.',
  titleDistributors: 'Engineering, Manufacturing, Validation and Application Intelligence — Structured to Create More Value for the Partner.',
  lead: 'ELIMFILTERS operates through an integrated engineering and manufacturing architecture. Filtration-media development is carried out in Germany around defined performance and material-behavior objectives. Manufacturing is executed through qualified production partners in the People’s Republic of China. Product validation is matched to the operating requirements of each product family and application, while mathematical and computational modeling supports engineering analysis of demanding and extreme service conditions.',
  prcEyebrow: 'PRC MANUFACTURING STRATEGY',
  prcTitle: 'Specialized capacity, process capability and industrial scale.',
  prcBody: 'ELIMFILTERS selects qualified manufacturing partners in the People’s Republic of China for specialized filtration capability, established process infrastructure, scalable production capacity, and integration with mature heavy-duty and automotive supply chains. Production is governed by ELIMFILTERS-defined product specifications, dimensional requirements, quality controls, validation criteria, and technical documentation.',
  partnerEyebrow: 'HORIZONTAL OPERATIONS · PARTNER VALUE',
  partnerTitle: 'A Different Cost Structure — Not a Low-Price Strategy.',
  partnerLead: 'Legacy vertical organizations carry structural cost through multiple management layers, duplicated administrative functions, and repetitive processes. ELIMFILTERS is organized more horizontally, using standardized processes, disciplined data management, digital workflows, and direct technical governance to reduce avoidable organizational friction.',
  partnerGovernance: 'That efficiency is not obtained by reducing engineering requirements, material specifications, manufacturing controls, physical validation, or technical responsibility. Those functions remain governed by defined requirements and accountable professional review.',
  partnerResult: 'The economic distinction is structural. Lower avoidable overhead allows a greater proportion of resources to remain in engineering, materials, manufacturing quality, validation, product intelligence, availability, supply-chain execution, and support for the commercial partner.',
  marketEyebrow: 'MARKET SCOPE',
  marketTitle: 'Heavy Duty leads. Automotive expands commercial reach.',
  marketBody: 'ELIMFILTERS primarily focuses on industrial, heavy-duty, fleet, and equipment applications. Automotive / Light Duty remains an important complementary line that supports recurring demand, distributor economics, catalog breadth, regional reach, and commercial intelligence.',
  marketAllocation: 'The governing commercial architecture remains unchanged: Heavy Duty receives 80% of strategic resources and Light Duty / Automotive 20%.',
  partnershipEyebrow: 'COMMERCIAL PARTNERSHIP',
  partnershipTitle: 'ELIMFILTERS builds the technical platform. Our partners build the market.',
  apply: 'APPLY FOR REVIEW',
};

const COPY_ES: Copy = {
  sectionEyebrowAbout: 'MODELO GLOBAL DE INGENIERÍA Y MANUFACTURA',
  sectionEyebrowDistributors: 'EL MODELO GLOBAL ELIMFILTERS',
  titleAbout: 'Medios desarrollados en Alemania. Manufactura calificada en la RPC. Gobernanza técnica ELIMFILTERS.',
  titleDistributors: 'Ingeniería, manufactura, validación e inteligencia de aplicación — estructuradas para crear mayor valor para el socio.',
  lead: 'ELIMFILTERS opera mediante una arquitectura integrada de ingeniería y manufactura. El desarrollo de los medios filtrantes se realiza en Alemania alrededor de objetivos definidos de desempeño y comportamiento de materiales. La manufactura se ejecuta mediante socios de producción calificados en la República Popular China. La validación se adapta a los requerimientos operativos de cada familia de producto y aplicación, mientras el modelado matemático y computacional apoya el análisis de ingeniería de condiciones de servicio exigentes y extremas.',
  prcEyebrow: 'ESTRATEGIA DE MANUFACTURA EN LA RPC',
  prcTitle: 'Capacidad especializada, capacidad de proceso y escala industrial.',
  prcBody: 'ELIMFILTERS selecciona socios de manufactura calificados en la República Popular China por su especialización en filtración, infraestructura de procesos, capacidad productiva escalable e integración con cadenas maduras de suministro Heavy Duty y automotriz. La producción se rige por especificaciones de producto, requisitos dimensionales, controles de calidad, criterios de validación y documentación técnica definidos por ELIMFILTERS.',
  partnerEyebrow: 'OPERACIÓN HORIZONTAL · VALOR PARA EL SOCIO',
  partnerTitle: 'Una estructura de costos diferente — no una estrategia de bajo precio.',
  partnerLead: 'Las organizaciones verticales tradicionales trasladan costos estructurales a través de múltiples niveles de gestión, funciones administrativas duplicadas y procesos repetitivos. ELIMFILTERS opera con una estructura más horizontal, apoyada en procesos estandarizados, gestión disciplinada de datos, flujos digitales y gobernanza técnica directa para reducir fricción organizacional evitable.',
  partnerGovernance: 'Esa eficiencia no se obtiene reduciendo requisitos de ingeniería, especificaciones de materiales, controles de manufactura, validación física ni responsabilidad técnica. Estas funciones permanecen sujetas a requisitos definidos y revisión profesional responsable.',
  partnerResult: 'La diferencia económica es estructural. Un menor costo organizacional evitable permite conservar una mayor proporción de recursos para ingeniería, materiales, calidad de manufactura, validación, inteligencia de producto, disponibilidad, ejecución de la cadena de suministro y soporte al socio comercial.',
  marketEyebrow: 'ALCANCE DE MERCADO',
  marketTitle: 'Heavy Duty lidera. Automotive amplía el alcance comercial.',
  marketBody: 'ELIMFILTERS se enfoca principalmente en aplicaciones industriales, Heavy Duty, flotas y equipos. Automotive / Light Duty permanece como una línea complementaria importante que apoya la demanda recurrente, la economía del distribuidor, la amplitud del catálogo, el alcance regional y la inteligencia comercial.',
  marketAllocation: 'La arquitectura comercial vigente permanece sin cambios: Heavy Duty recibe 80% de los recursos estratégicos y Light Duty / Automotive 20%.',
  partnershipEyebrow: 'SOCIEDAD COMERCIAL',
  partnershipTitle: 'ELIMFILTERS construye la plataforma técnica. Nuestros socios construyen el mercado.',
  apply: 'SOLICITAR EVALUACIÓN',
};

const OPERATING_CHAIN_EN = [
  {
    step: '01', eyebrow: 'GERMANY', title: 'Media Engineering & Development',
    body: 'ELIMFILTERS filtration media are developed in Germany around defined targets for filtration behavior, contaminant capacity, resistance, dimensional stability, material response, and suitability for the intended operating environment.',
  },
  {
    step: '02', eyebrow: 'PRC', title: 'Qualified Manufacturing Partners',
    body: 'Production is executed through selected manufacturing partners in the People’s Republic of China (PRC), chosen for specialized filtration capability, process capacity, scalable industrial infrastructure, and integration with mature heavy-duty and automotive supply chains.',
  },
  {
    step: '03', eyebrow: 'PHYSICAL VALIDATION', title: 'Performance, Resistance & Durability',
    body: 'Validation is matched to product family and application. Where applicable and supported by evidence, protocols may include filtration efficiency, restriction, contaminant holding capacity, flow behavior, media tensile strength, pleat integrity, dimensional stability, burst or collapse resistance, cyclic pressure endurance, seal integrity, temperature exposure, material compatibility, and water-separation performance.',
  },
  {
    step: '04', eyebrow: 'MATHEMATICAL MODELING', title: 'Extreme Operating-Condition Analysis',
    body: 'Artificial intelligence is used only as a mathematical and computational engineering tool. Models can evaluate interactions among contaminant loading, flow rate, pressure differential, temperature, media behavior, material response, service duration, and operating severity to estimate system behavior as conditions move toward demanding or extreme ranges. Modeling supports engineering assessment and test planning; it does not replace physical validation or professional engineering judgment.',
  },
  {
    step: '05', eyebrow: 'HORIZONTAL OPERATING MODEL', title: 'Standardized Processes. Direct Technical Governance.',
    body: 'ELIMFILTERS uses a more horizontal operating structure supported by standardized processes, disciplined data management, digital workflows, and direct technical governance. The objective is to reduce avoidable administrative burden while preserving resources for engineering, materials, manufacturing quality, validation, product intelligence, availability, and partner support.',
  },
  {
    step: '06', eyebrow: 'COMMERCIAL PARTNER', title: 'Efficiency Becomes Commercial Value',
    body: 'The efficiency created upstream is carried into product economics and the partner relationship. Commercial partners add installed-base knowledge, local relationships, inventory strategy, technical sales, regional service, and market execution while ELIMFILTERS provides product architecture, technical governance, application intelligence, structured documentation, and scalable product access.',
  },
];

const OPERATING_CHAIN_ES = [
  {
    step: '01', eyebrow: 'ALEMANIA', title: 'Ingeniería y desarrollo de medios',
    body: 'Los medios filtrantes ELIMFILTERS se desarrollan en Alemania alrededor de objetivos definidos de comportamiento de filtración, capacidad de retención, resistencia, estabilidad dimensional, respuesta de materiales y adecuación al entorno operativo previsto.',
  },
  {
    step: '02', eyebrow: 'RPC', title: 'Socios de manufactura calificados',
    body: 'La producción se ejecuta mediante socios seleccionados en la República Popular China (RPC), elegidos por su capacidad especializada en filtración, capacidad de proceso, infraestructura industrial escalable e integración con cadenas maduras de suministro Heavy Duty y automotriz.',
  },
  {
    step: '03', eyebrow: 'VALIDACIÓN FÍSICA', title: 'Desempeño, resistencia y durabilidad',
    body: 'La validación se adapta a cada familia de producto y aplicación. Cuando corresponde y existe evidencia que lo sustente, los protocolos pueden incluir eficiencia de filtración, restricción, capacidad de retención de contaminantes, comportamiento de flujo, resistencia del medio, integridad de pliegues, estabilidad dimensional, resistencia a ruptura o colapso, ciclos de presión, integridad de sellado, exposición térmica, compatibilidad de materiales y separación de agua.',
  },
  {
    step: '04', eyebrow: 'MODELADO MATEMÁTICO', title: 'Análisis de condiciones operativas extremas',
    body: 'La inteligencia artificial se utiliza únicamente como herramienta matemática y computacional de apoyo a la ingeniería. Los modelos permiten evaluar la interacción entre carga contaminante, caudal, diferencial de presión, temperatura, comportamiento del medio filtrante, respuesta de materiales, duración de servicio y severidad operativa para estimar el comportamiento del sistema al aproximarse a rangos exigentes o extremos. El modelado apoya la evaluación de ingeniería y la planificación de ensayos; no sustituye la validación física ni el criterio profesional de ingeniería.',
  },
  {
    step: '05', eyebrow: 'MODELO OPERATIVO HORIZONTAL', title: 'Procesos estandarizados. Gobernanza técnica directa.',
    body: 'ELIMFILTERS utiliza una estructura operativa más horizontal apoyada en procesos estandarizados, gestión disciplinada de datos, flujos digitales y gobernanza técnica directa. El objetivo es reducir carga administrativa evitable y conservar recursos para ingeniería, materiales, calidad de manufactura, validación, inteligencia de producto, disponibilidad y soporte al socio comercial.',
  },
  {
    step: '06', eyebrow: 'SOCIO COMERCIAL', title: 'La eficiencia se convierte en valor comercial',
    body: 'La eficiencia creada aguas arriba se traslada a la economía del producto y a la relación con el socio. Los socios comerciales aportan conocimiento del parque instalado, relaciones locales, estrategia de inventario, venta técnica, servicio regional y ejecución de mercado; ELIMFILTERS aporta arquitectura de producto, gobernanza técnica, inteligencia de aplicación, documentación estructurada y acceso escalable al portafolio.',
  },
];

const PARTNER_OUTCOMES_EN = [
  ['Structural Efficiency', 'The economic difference is created by a more horizontal operating structure, not by positioning ELIMFILTERS as a low-price product.'],
  ['Sustainable Partner Margin', 'Lower avoidable administrative and process burden reduces structural cost and helps preserve economic value for the authorized commercial partner.'],
  ['Technical Confidence', 'Engineering, physical validation, application intelligence, traceability, and evidence-based product governance give partners a stronger technical foundation for customer decisions.'],
  ['Market Flexibility', 'Partners can serve industrial, heavy-duty, fleet, equipment, and complementary automotive / Light Duty demand according to their territory.'],
  ['Customer Continuity', 'Installed-base knowledge, local relationships, availability, technical support, and application discipline are treated as long-term commercial assets.'],
  ['Lifecycle Value', 'Product quality, correct application, availability, technical intelligence, and sound economics work together to reduce total operating risk.'],
];

const PARTNER_OUTCOMES_ES = [
  ['Eficiencia estructural', 'La diferencia económica nace de una estructura operativa más horizontal, no de posicionar a ELIMFILTERS como un producto de bajo precio.'],
  ['Margen sostenible para el socio', 'Una menor carga administrativa y de procesos evitables reduce el costo estructural y ayuda a preservar valor económico para el socio comercial autorizado.'],
  ['Confianza técnica', 'Ingeniería, validación física, inteligencia de aplicación, trazabilidad y gobernanza de producto basada en evidencia dan al socio una base técnica más sólida para sus decisiones comerciales.'],
  ['Flexibilidad de mercado', 'Los socios pueden atender demanda industrial, Heavy Duty, flotas, equipos y Automotive / Light Duty complementaria según su territorio.'],
  ['Continuidad del cliente', 'El conocimiento del parque instalado, las relaciones locales, disponibilidad, soporte técnico y disciplina de aplicación se tratan como activos comerciales de largo plazo.'],
  ['Valor de ciclo de vida', 'Calidad de producto, aplicación correcta, disponibilidad, inteligencia técnica y economía sólida trabajan juntas para reducir el riesgo operativo total.'],
];

export function GlobalCommercialModel({ variant = 'about' }: Props) {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const copy = isSpanish ? COPY_ES : COPY_EN;
  const operatingChain = isSpanish ? OPERATING_CHAIN_ES : OPERATING_CHAIN_EN;
  const partnerOutcomes = isSpanish ? PARTNER_OUTCOMES_ES : PARTNER_OUTCOMES_EN;
  const isDistributor = variant === 'distributors';

  return (
    <>
      <section style={section}>
        <div style={wrap}>
          <p style={eyebrow}>{isDistributor ? copy.sectionEyebrowDistributors : copy.sectionEyebrowAbout}</p>
          <h2 style={title}>{isDistributor ? copy.titleDistributors : copy.titleAbout}</h2>
          <p style={lead}>{copy.lead}</p>

          <div style={grid}>
            {operatingChain.map((item) => (
              <article key={item.step} style={card}>
                <div style={topline}>
                  <span style={number}>{item.step}</span>
                  <span style={cardEyebrow}>{item.eyebrow}</span>
                </div>
                <h3 style={cardTitle}>{item.title}</h3>
                <p style={body}>{item.body}</p>
              </article>
            ))}
          </div>

          <div style={prcPanel}>
            <div>
              <p style={eyebrow}>{copy.prcEyebrow}</p>
              <h3 style={panelTitle}>{copy.prcTitle}</h3>
            </div>
            <p style={{ ...body, margin: 0 }}>{copy.prcBody}</p>
          </div>
        </div>
      </section>

      <section style={partnerSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.partnerEyebrow}</p>
          <div style={twoCol}>
            <div>
              <h2 style={title}>{copy.partnerTitle}</h2>
            </div>
            <div>
              <p style={lead}>{copy.partnerLead}</p>
              <p style={body}>{copy.partnerGovernance}</p>
              <p style={body}>{copy.partnerResult}</p>
            </div>
          </div>

          <div style={outcomeGrid}>
            {partnerOutcomes.map(([heading, description], index) => (
              <article key={heading} style={outcomeCard}>
                <span style={number}>{String(index + 1).padStart(2, '0')}</span>
                <h3 style={outcomeTitle}>{heading}</h3>
                <p style={body}>{description}</p>
              </article>
            ))}
          </div>

          <div style={marketPanel}>
            <div>
              <p style={eyebrow}>{copy.marketEyebrow}</p>
              <h3 style={panelTitle}>{copy.marketTitle}</h3>
            </div>
            <div>
              <p style={{ ...body, marginTop: 0 }}>{copy.marketBody}</p>
              <p style={{ ...body, marginBottom: 0 }}>{copy.marketAllocation}</p>
            </div>
          </div>

          {isDistributor && (
            <div style={ctaRow}>
              <div>
                <p style={eyebrow}>{copy.partnershipEyebrow}</p>
                <h3 style={panelTitle}>{copy.partnershipTitle}</h3>
              </div>
              <Link href="/distributor-application" style={button}>{copy.apply}</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const section: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.22)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, #050505 0%, #000 100%)',
};
const partnerSection: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,241,45,0.16)',
  background: 'rgba(255,241,45,0.02)',
};
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const eyebrow: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '0.74rem', fontWeight: 700,
  letterSpacing: '0.18em', margin: '0 0 1rem', textTransform: 'uppercase',
};
const title: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.7rem)', lineHeight: 0.96,
  letterSpacing: '-0.025em', margin: 0, textTransform: 'uppercase', maxWidth: '1040px',
};
const lead: CSSProperties = {
  color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.05rem, 1.6vw, 1.3rem)',
  lineHeight: 1.72, fontWeight: 600, maxWidth: '900px', margin: '1.7rem 0 0',
};
const body: CSSProperties = { color: 'rgba(255,255,255,0.62)', fontSize: '0.98rem', lineHeight: 1.72 };
const grid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '3rem',
};
const card: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.025)',
  padding: '1.5rem', minHeight: '315px',
};
const topline: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' };
const number: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem',
};
const cardEyebrow: CSSProperties = {
  color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.12em', fontSize: '0.67rem', textAlign: 'right',
};
const cardTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.45rem', lineHeight: 1.05,
  letterSpacing: '-0.03em', margin: '2.4rem 0 0', textTransform: 'uppercase',
};
const prcPanel: CSSProperties = {
  marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem', border: '1px solid rgba(255,241,45,0.22)', background: 'rgba(255,241,45,0.035)', padding: '1.7rem',
};
const panelTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.7vw, 2.6rem)', lineHeight: 1,
  letterSpacing: '-0.03em', margin: 0, textTransform: 'uppercase',
};
const twoCol: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 6vw, 5rem)',
};
const outcomeGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '3rem',
};
const outcomeCard: CSSProperties = {
  borderTop: '1px solid rgba(255,241,45,0.32)', padding: '1.4rem 0.3rem 0', minHeight: '210px',
};
const outcomeTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1.08,
  letterSpacing: '-0.025em', margin: '1rem 0 0', textTransform: 'uppercase',
};
const marketPanel: CSSProperties = {
  marginTop: '2.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)',
};
const ctaRow: CSSProperties = {
  marginTop: '2.4rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem',
  border: '1px solid rgba(255,241,45,0.22)', padding: '1.6rem', background: 'rgba(0,0,0,0.4)',
};
const button: CSSProperties = {
  display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none',
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem',
};