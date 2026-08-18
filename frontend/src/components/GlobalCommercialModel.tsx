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
  titleAbout: 'German-Developed Media. Qualified PRC Manufacturing. ELIMFILTERS Quality Governance.',
  titleDistributors: 'Engineering, Manufacturing, Validation and Intelligence — Structured to Create More Value for the Partner.',
  lead: 'ELIMFILTERS was built around a deliberate global architecture. Filtration-media development is carried out in Germany. Manufacturing is executed through qualified partners in the PRC. Product performance is supported through defined physical validation protocols, while AI-assisted auditing strengthens consistency, traceability, and control. A horizontal operating structure uses trained AI agents to reduce repetitive organizational work and the structural cost attached to it, with periodic specialist engineering audits built into the operating model.',
  prcEyebrow: 'PRC MANUFACTURING STRATEGY',
  prcTitle: 'Specialized capacity, scale and industrial depth.',
  prcBody: 'ELIMFILTERS selected qualified manufacturing partners in the People’s Republic of China for established industrial infrastructure, specialized filtration-manufacturing capability, scalable production capacity, and access to mature automotive and heavy-duty supply chains. Production operates within ELIMFILTERS-defined specifications, quality controls, validation requirements, and technical governance.',
  partnerEyebrow: 'HORIZONTAL OPERATIONS · PARTNER VALUE',
  partnerTitle: 'A Different Cost Structure — Not a Low-Price Strategy.',
  partnerLead: 'Legacy vertical organizations — often described within the industry as the “industry dinosaurs” — were built around multiple management layers, repetitive administrative functions, and structural costs accumulated throughout the organization. ELIMFILTERS was designed differently. Trained AI agents execute a significant portion of repeatable, rules-based, and data-intensive processes, allowing the organization to remain more horizontal.',
  partnerGovernance: 'Those agents do not operate outside professional governance. Their processes and performance are periodically audited by industrial, mechanical, process, and systems engineers, while qualified personnel retain responsibility for manufacturing oversight, quality assurance, technical governance, evidence review, and critical decisions.',
  partnerResult: 'The result is a structurally more efficient product cost. The difference does not come from lowering engineering standards, materials, manufacturing controls, or validation requirements. It comes from reducing the organizational cost attached to repetitive work and unnecessary vertical layers — allowing more of the economics to remain in the product, the supply chain, and the commercial partnership.',
  marketEyebrow: 'MARKET SCOPE',
  marketTitle: 'Heavy Duty leads. Automotive expands commercial reach.',
  marketBody: 'ELIMFILTERS primarily focuses on industrial, heavy-duty, fleet, and equipment applications. Automotive / Light Duty remains an important complementary line that supports recurring demand, distributor economics, catalog breadth, regional reach, and commercial intelligence.',
  marketAllocation: 'The governing commercial architecture remains unchanged: Heavy Duty receives 80% of strategic resources and Light Duty / Automotive 20%.',
  partnershipEyebrow: 'COMMERCIAL PARTNERSHIP',
  partnershipTitle: 'ELIMFILTERS builds the platform. Our partners build the market.',
  apply: 'APPLY FOR REVIEW',
};

const COPY_ES: Copy = {
  sectionEyebrowAbout: 'MODELO GLOBAL DE INGENIERÍA Y MANUFACTURA',
  sectionEyebrowDistributors: 'EL MODELO GLOBAL ELIMFILTERS',
  titleAbout: 'Medios desarrollados en Alemania. Manufactura calificada en la RPC. Gobernanza de calidad ELIMFILTERS.',
  titleDistributors: 'Ingeniería, manufactura, validación e inteligencia — estructuradas para crear mayor valor para el socio.',
  lead: 'ELIMFILTERS fue construida sobre una arquitectura global deliberada. El desarrollo de los medios filtrantes se realiza en Alemania. La manufactura se ejecuta mediante socios calificados en la República Popular China (RPC). El desempeño del producto se respalda mediante protocolos definidos de validación física, mientras las auditorías asistidas por IA fortalecen la consistencia, la trazabilidad y el control. Una estructura operativa horizontal utiliza agentes de IA entrenados para reducir trabajo organizativo repetitivo y el costo estructural asociado, con auditorías periódicas de especialistas en ingeniería integradas al modelo operativo.',
  prcEyebrow: 'ESTRATEGIA DE MANUFACTURA EN LA RPC',
  prcTitle: 'Capacidad especializada, escala y profundidad industrial.',
  prcBody: 'ELIMFILTERS seleccionó socios de manufactura calificados en la República Popular China por su infraestructura industrial consolidada, capacidad especializada en manufactura de filtración, escalabilidad productiva y acceso a cadenas maduras de suministro automotriz y de servicio pesado. La producción opera bajo especificaciones, controles de calidad, requisitos de validación y gobernanza técnica definidos por ELIMFILTERS.',
  partnerEyebrow: 'OPERACIÓN HORIZONTAL · VALOR PARA EL SOCIO',
  partnerTitle: 'Una estructura de costos diferente — no una estrategia de bajo precio.',
  partnerLead: 'Las organizaciones verticales heredadas — a menudo descritas dentro de la industria como los “dinosaurios de la industria” — fueron construidas con múltiples niveles de gestión, funciones administrativas repetitivas y costos estructurales acumulados a través de la organización. ELIMFILTERS fue diseñada de otra manera. Agentes de IA entrenados ejecutan una parte significativa de los procesos repetibles, basados en reglas e intensivos en datos, permitiendo una organización más horizontal.',
  partnerGovernance: 'Esos agentes no operan fuera de la gobernanza profesional. Sus procesos y desempeño son auditados periódicamente por ingenieros industriales, mecánicos, de procesos y de sistemas, mientras personal calificado conserva la responsabilidad sobre supervisión de manufactura, aseguramiento de calidad, gobernanza técnica, revisión de evidencia y decisiones críticas.',
  partnerResult: 'El resultado es un costo de producto estructuralmente más eficiente. La diferencia no proviene de reducir estándares de ingeniería, materiales, controles de manufactura o requisitos de validación. Proviene de reducir el costo organizativo asociado al trabajo repetitivo y a capas verticales innecesarias, permitiendo que una mayor parte de la economía permanezca en el producto, la cadena de suministro y la relación con el socio comercial.',
  marketEyebrow: 'ALCANCE DE MERCADO',
  marketTitle: 'Heavy Duty lidera. Automotive amplía el alcance comercial.',
  marketBody: 'ELIMFILTERS se enfoca principalmente en aplicaciones industriales, Heavy Duty, flotas y equipos. Automotive / Light Duty permanece como una línea complementaria importante que apoya la demanda recurrente, la economía del distribuidor, la amplitud del catálogo, el alcance regional y la inteligencia comercial.',
  marketAllocation: 'La arquitectura comercial vigente permanece sin cambios: Heavy Duty recibe 80% de los recursos estratégicos y Light Duty / Automotive 20%.',
  partnershipEyebrow: 'SOCIEDAD COMERCIAL',
  partnershipTitle: 'ELIMFILTERS construye la plataforma. Nuestros socios construyen el mercado.',
  apply: 'SOLICITAR EVALUACIÓN',
};

const OPERATING_CHAIN_EN = [
  {
    step: '01', eyebrow: 'GERMANY', title: 'Media Engineering & Development',
    body: 'ELIMFILTERS formulated filtration media are developed in Germany around defined performance targets, application requirements, material behavior, durability objectives, and contamination-control needs.',
  },
  {
    step: '02', eyebrow: 'PRC', title: 'Qualified Manufacturing Partners',
    body: 'Production is executed through selected manufacturing partners in the People’s Republic of China (PRC), chosen for specialized filtration capability, scalable industrial infrastructure, and integration with mature automotive and heavy-duty supply chains.',
  },
  {
    step: '03', eyebrow: 'PHYSICAL VALIDATION', title: 'Performance, Resistance & Durability',
    body: 'Validation is matched to product family and application. Where applicable, protocols may include efficiency, pressure drop, contaminant holding capacity, flow performance, media tensile strength, pleat integrity, dimensional stability, burst or collapse resistance, cyclic pressure endurance, seal integrity, temperature resistance, material compatibility, and water-separation performance.',
  },
  {
    step: '04', eyebrow: 'AI-ASSISTED AUDITING', title: 'Consistency, Deviations & Traceability',
    body: 'AI-assisted systems review production and product data for inconsistencies, deviations, anomalous patterns, traceability signals, and documentation gaps. Physical validation and accountable human quality oversight remain part of the control system.',
  },
  {
    step: '05', eyebrow: 'HORIZONTAL OPERATING MODEL', title: 'Trained Agents. Periodic Engineering Audits.',
    body: 'ELIMFILTERS uses trained AI agents for repetitive, rules-based, and data-intensive operational work that would traditionally require additional administrative layers. Agent workflows are periodically audited by industrial, mechanical, process, and systems engineers.',
  },
  {
    step: '06', eyebrow: 'COMMERCIAL PARTNER', title: 'Efficiency Becomes Commercial Value',
    body: 'The efficiency created upstream is carried into product economics and the partner relationship. Commercial partners add local relationships, inventory strategy, technical sales, regional service, and market knowledge while ELIMFILTERS provides product architecture, quality governance, intelligence, and scalable product access.',
  },
];

const OPERATING_CHAIN_ES = [
  {
    step: '01', eyebrow: 'ALEMANIA', title: 'Ingeniería y desarrollo de medios',
    body: 'Los medios filtrantes formulados por ELIMFILTERS se desarrollan en Alemania alrededor de objetivos definidos de desempeño, requisitos de aplicación, comportamiento de materiales, durabilidad y control de contaminación.',
  },
  {
    step: '02', eyebrow: 'RPC', title: 'Socios de manufactura calificados',
    body: 'La producción se ejecuta mediante socios seleccionados en la República Popular China (RPC), elegidos por su capacidad especializada en filtración, infraestructura industrial escalable e integración con cadenas maduras de suministro automotriz y Heavy Duty.',
  },
  {
    step: '03', eyebrow: 'VALIDACIÓN FÍSICA', title: 'Desempeño, resistencia y durabilidad',
    body: 'La validación se adapta a cada familia de producto y aplicación. Cuando corresponde, los protocolos pueden incluir eficiencia, caída de presión, capacidad de retención de contaminantes, flujo, resistencia del medio, integridad de pliegues, estabilidad dimensional, presión de ruptura o colapso, ciclos de presión, sellado, temperatura, compatibilidad de materiales y separación de agua.',
  },
  {
    step: '04', eyebrow: 'AUDITORÍA ASISTIDA POR IA', title: 'Consistencia, desviaciones y trazabilidad',
    body: 'Los sistemas asistidos por IA revisan datos de producción y producto para detectar inconsistencias, desviaciones, patrones anómalos, señales de trazabilidad y vacíos documentales. La validación física y la responsabilidad humana de calidad permanecen dentro del sistema de control.',
  },
  {
    step: '05', eyebrow: 'MODELO OPERATIVO HORIZONTAL', title: 'Agentes entrenados. Auditorías periódicas de ingeniería.',
    body: 'ELIMFILTERS utiliza agentes de IA entrenados para trabajo operativo repetitivo, basado en reglas e intensivo en datos que tradicionalmente requeriría capas administrativas adicionales. Sus flujos son auditados periódicamente por ingenieros industriales, mecánicos, de procesos y de sistemas.',
  },
  {
    step: '06', eyebrow: 'SOCIO COMERCIAL', title: 'La eficiencia se convierte en valor comercial',
    body: 'La eficiencia creada aguas arriba se traslada a la economía del producto y a la relación con el socio. Los socios comerciales aportan relaciones locales, estrategia de inventario, venta técnica, servicio regional y conocimiento del mercado; ELIMFILTERS aporta arquitectura de producto, gobernanza de calidad, inteligencia y acceso escalable al portafolio.',
  },
];

const PARTNER_OUTCOMES_EN = [
  ['Structural Efficiency', 'The economic difference is created by a more horizontal operating structure, not by positioning ELIMFILTERS as a low-price product.'],
  ['Sustainable Partner Margin', 'Lower repetitive-process and administrative burden reduces direct structural cost and helps preserve economic value for the authorized commercial partner.'],
  ['Technical Confidence', 'Engineering, validation, traceability, periodic specialist audits, and product intelligence give partners a stronger technical foundation for customer decisions.'],
  ['Market Flexibility', 'Partners can serve industrial, heavy-duty, fleet, equipment, and complementary automotive / Light Duty demand according to their territory.'],
  ['Customer Continuity', 'Local relationships, availability, technical support, and asset knowledge are treated as long-term commercial assets.'],
  ['Lifecycle Value', 'Product quality, correct application, availability, technical intelligence, and sound economics work together to reduce total operating risk.'],
];

const PARTNER_OUTCOMES_ES = [
  ['Eficiencia estructural', 'La diferencia económica nace de una estructura operativa más horizontal, no de posicionar a ELIMFILTERS como un producto de bajo precio.'],
  ['Margen sostenible para el socio', 'Menor carga de procesos repetitivos y administrativa reduce el costo estructural directo y ayuda a preservar valor económico para el socio comercial autorizado.'],
  ['Confianza técnica', 'Ingeniería, validación, trazabilidad, auditorías periódicas de especialistas e inteligencia de producto dan al socio una base técnica más sólida para sus decisiones comerciales.'],
  ['Flexibilidad de mercado', 'Los socios pueden atender demanda industrial, Heavy Duty, flotas, equipos y Automotive / Light Duty complementaria según su territorio.'],
  ['Continuidad del cliente', 'Las relaciones locales, disponibilidad, soporte técnico y conocimiento de activos se tratan como activos comerciales de largo plazo.'],
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
