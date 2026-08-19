'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

type Copy = {
  title: string;
  intro1: string;
  intro2: string;
  statement1: string;
  statement2: string;
  partnersTitle: string;
  partners1: string;
  partners2: string;
  partners3: string;
  globalTitle: string;
  global1: string;
  global2: string;
  global3: string;
  modelingTitle: string;
  modeling1: string;
  modeling2: string;
  modeling3: string;
  horizontalTitle: string;
  horizontal1: string;
  horizontal2: string;
  horizontal3: string;
  efficiencyTitle: string;
  efficiency1: string;
  efficiency2: string;
  efficiency3: string;
  closing1: string;
  closing2: string;
};

const COPY_EN: Copy = {
  title: 'Strategic Asset Engineering & Protection',
  intro1: 'ELIMFILTERS approaches filtration from the operating condition of the protected asset rather than from the replacement element alone. The engineering objective is to control contamination, preserve fluid and airflow conditions, and reduce the mechanisms that accelerate wear, restriction, component damage, and unplanned service events.',
  intro2: 'Product selection therefore begins with duty cycle, contamination exposure, flow requirement, pressure differential, temperature range, fluid or air characteristics, available installation envelope, and the evidence required for the specific application.',
  statement1: 'The filter element is the means.',
  statement2: 'Asset protection is the objective.',
  partnersTitle: 'Commercial partners are part of the operating model',
  partners1: 'ELIMFILTERS develops markets through qualified commercial partners with direct knowledge of the installed base, local operating conditions, customer requirements, inventory behavior, and service expectations.',
  partners2: 'That local capability is technically relevant. Correct filtration depends not only on the product itself, but also on accurate application identification, availability at the required service interval, disciplined substitution, and an understanding of the equipment environment in which the product will operate.',
  partners3: 'ELIMFILTERS contributes product architecture, technical governance, cross-reference and application intelligence, structured documentation, manufacturing control, and portfolio access. The commercial partner converts those capabilities into inventory strategy, technical sales, customer continuity, and long-term territory development.',
  globalTitle: 'Global engineering and manufacturing architecture',
  global1: 'The development and formulation of ELIMFILTERS filtration media is carried out in Germany around defined targets for filtration behavior, capacity, resistance, dimensional stability, material response, and suitability for the intended operating environment.',
  global2: 'Manufacturing is executed through qualified production partners in the People’s Republic of China (PRC), selected for specialized filtration capability, process capacity, industrial scale, and experience within mature heavy-duty and automotive supply chains.',
  global3: 'Materials, manufacturing processes, dimensional control, assembly integrity, and product validation are governed by ELIMFILTERS-defined requirements. Validation is matched to product family and application and may include filtration efficiency, restriction, contaminant-holding capacity, flow behavior, media strength, pleat stability, burst or collapse resistance, cyclic pressure endurance, seal integrity, temperature exposure, material compatibility, and water-separation performance where applicable and supported by evidence.',
  modelingTitle: 'Mathematical modeling for extreme operating conditions',
  modeling1: 'Artificial intelligence is used only as a mathematical and computational engineering tool to support the analysis of conditions that are difficult, costly, or impractical to reproduce continuously in physical testing.',
  modeling2: 'Models can evaluate the interaction of variables such as contaminant loading, flow rate, pressure differential, temperature, media behavior, material response, service duration, and operating severity to estimate how the filtration system and the protected asset may respond as conditions move toward demanding or extreme ranges.',
  modeling3: 'These calculations support engineering assessment, sensitivity analysis, and test planning. They do not certify a product, replace physical validation, establish a performance claim by themselves, or substitute professional engineering judgment.',
  horizontalTitle: 'A horizontal structure without reducing technical requirements',
  horizontal1: 'Traditional multi-layer organizations carry administrative and structural costs through multiple management levels, duplicated functions, and repetitive processes. Those costs ultimately become part of the economics of the product and the supply chain.',
  horizontal2: 'ELIMFILTERS operates with a more horizontal structure supported by standardized processes, disciplined data management, digital workflows, and direct technical governance. The purpose is to reduce avoidable organizational friction while preserving resources for engineering, materials, manufacturing quality, validation, product intelligence, availability, and partner support.',
  horizontal3: 'The economic difference is therefore structural. It is not created by lowering engineering standards, reducing material requirements, weakening manufacturing controls, or positioning the brand as a low-price alternative.',
  efficiencyTitle: 'Structural efficiency becomes commercial value',
  efficiency1: 'The result is a different cost structure.',
  efficiency2: 'Not a low-price strategy.',
  efficiency3: 'ELIMFILTERS seeks to convert operating efficiency into stronger product economics, competitive landed cost, sustainable partner margin, broader application coverage, and a commercial relationship capable of supporting customers over the operating life of their assets.',
  closing1: 'ELIMFILTERS builds the technical platform.',
  closing2: 'Our partners build the market.',
};

const COPY_ES: Copy = {
  title: 'Ingeniería Estratégica y Protección del Activo',
  intro1: 'ELIMFILTERS aborda la filtración desde la condición operativa del activo protegido y no únicamente desde el elemento de reemplazo. El objetivo de ingeniería es controlar la contaminación, preservar las condiciones de flujo y reducir los mecanismos que aceleran desgaste, restricción, daño de componentes y eventos de mantenimiento no planificados.',
  intro2: 'La selección del producto parte del ciclo de trabajo, exposición a contaminantes, requerimiento de caudal, diferencial de presión, rango de temperatura, características del fluido o del aire, espacio disponible de instalación y evidencia técnica requerida para la aplicación específica.',
  statement1: 'El elemento filtrante es el medio.',
  statement2: 'La protección del activo es el objetivo.',
  partnersTitle: 'El socio comercial forma parte del modelo operativo',
  partners1: 'ELIMFILTERS desarrolla los mercados mediante socios comerciales calificados con conocimiento directo del parque instalado, las condiciones locales de operación, los requerimientos del cliente, el comportamiento del inventario y las necesidades de servicio.',
  partners2: 'Esa capacidad local tiene relevancia técnica. Una filtración correcta depende no solo del producto, sino también de una identificación precisa de la aplicación, disponibilidad en el intervalo de servicio requerido, sustitución disciplinada y comprensión del entorno en el que opera el equipo.',
  partners3: 'ELIMFILTERS aporta arquitectura de producto, gobernanza técnica, inteligencia de aplicación y referencias cruzadas, documentación estructurada, control de manufactura y acceso al portafolio. El socio comercial convierte esas capacidades en estrategia de inventario, venta técnica, continuidad del cliente y desarrollo sostenido del territorio.',
  globalTitle: 'Arquitectura global de ingeniería y manufactura',
  global1: 'El desarrollo y formulación de los medios filtrantes ELIMFILTERS se realiza en Alemania alrededor de objetivos definidos de comportamiento de filtración, capacidad, resistencia, estabilidad dimensional, respuesta de materiales y adecuación al entorno operativo previsto.',
  global2: 'La manufactura se ejecuta mediante socios de producción calificados en la República Popular China (RPC), seleccionados por su capacidad especializada en filtración, capacidad de proceso, escala industrial y experiencia dentro de cadenas maduras de suministro Heavy Duty y automotriz.',
  global3: 'Los materiales, procesos de fabricación, control dimensional, integridad de ensamble y validación del producto se rigen por requisitos definidos por ELIMFILTERS. La validación se adapta a la familia de producto y aplicación y puede incluir eficiencia de filtración, restricción, capacidad de retención de contaminantes, comportamiento de flujo, resistencia del medio, estabilidad de pliegues, resistencia a ruptura o colapso, ciclos de presión, integridad de sellado, exposición térmica, compatibilidad de materiales y separación de agua cuando corresponda y exista evidencia que lo sustente.',
  modelingTitle: 'Modelado matemático de condiciones operativas extremas',
  modeling1: 'La inteligencia artificial se utiliza únicamente como una herramienta matemática y computacional de apoyo a la ingeniería para analizar condiciones que resultan difíciles, costosas o imprácticas de reproducir de manera continua mediante pruebas físicas.',
  modeling2: 'Los modelos permiten estudiar la interacción entre variables como carga contaminante, caudal, diferencial de presión, temperatura, comportamiento del medio filtrante, respuesta de materiales, duración de servicio y severidad operativa para estimar cómo puede responder el sistema de filtración y el activo protegido al aproximarse a rangos exigentes o extremos.',
  modeling3: 'Estos cálculos apoyan la evaluación de ingeniería, el análisis de sensibilidad y la planificación de ensayos. No certifican un producto, no sustituyen la validación física, no establecen por sí solos una afirmación de desempeño y no reemplazan el criterio profesional de ingeniería.',
  horizontalTitle: 'Estructura horizontal sin reducir requisitos técnicos',
  horizontal1: 'Las organizaciones tradicionales de múltiples capas trasladan costos administrativos y estructurales a través de niveles de gestión, funciones duplicadas y procesos repetitivos. Esos costos terminan incorporándose a la economía del producto y de la cadena de suministro.',
  horizontal2: 'ELIMFILTERS opera con una estructura más horizontal apoyada en procesos estandarizados, gestión disciplinada de datos, flujos digitales y gobernanza técnica directa. El objetivo es reducir fricción organizacional evitable y conservar recursos para ingeniería, materiales, calidad de manufactura, validación, inteligencia de producto, disponibilidad y soporte al socio comercial.',
  horizontal3: 'La diferencia económica es, por tanto, estructural. No se obtiene reduciendo estándares de ingeniería, requisitos de materiales, controles de manufactura ni posicionando la marca como una alternativa de bajo precio.',
  efficiencyTitle: 'La eficiencia estructural se convierte en valor comercial',
  efficiency1: 'El resultado es una estructura de costos diferente.',
  efficiency2: 'No una estrategia de bajo precio.',
  efficiency3: 'ELIMFILTERS busca convertir la eficiencia operativa en una mejor economía del producto, costo puesto competitivo, margen sostenible para el socio, mayor cobertura de aplicaciones y una relación comercial capaz de acompañar al cliente durante la vida operativa de sus activos.',
  closing1: 'ELIMFILTERS construye la plataforma técnica.',
  closing2: 'Nuestros socios construyen el mercado.',
};

export function AboutStrategicModel() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const copy = isSpanish ? COPY_ES : COPY_EN;

  const sections = [
    [copy.partnersTitle, copy.partners1, copy.partners2, copy.partners3],
    [copy.globalTitle, copy.global1, copy.global2, copy.global3],
    [copy.modelingTitle, copy.modeling1, copy.modeling2, copy.modeling3],
    [copy.horizontalTitle, copy.horizontal1, copy.horizontal2, copy.horizontal3],
    [copy.efficiencyTitle, copy.efficiency1, copy.efficiency2, copy.efficiency3],
  ];

  return (
    <section style={section}>
      <div style={wrap}>
        <p style={eyebrow}>ELIMFILTERS · ASSET PROTECTION SYSTEMS</p>
        <h2 style={title}>{copy.title}</h2>
        <div style={introGrid}>
          <p style={lead}>{copy.intro1}</p>
          <p style={body}>{copy.intro2}</p>
        </div>

        <div style={statement}>
          <strong>{copy.statement1}</strong>
          <span>{copy.statement2}</span>
        </div>

        <div style={sectionGrid}>
          {sections.map(([heading, p1, p2, p3], index) => (
            <article key={heading} style={card}>
              <div style={cardTop}>
                <span style={number}>{String(index + 1).padStart(2, '0')}</span>
                <h3 style={cardTitle}>{heading}</h3>
              </div>
              <p style={body}>{p1}</p>
              <p style={body}>{p2}</p>
              <p style={body}>{p3}</p>
            </article>
          ))}
        </div>

        <div style={closing}>
          <strong>{copy.closing1}</strong>
          <span>{copy.closing2}</span>
        </div>
      </div>
    </section>
  );
}

const section: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.18)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, #050505 0%, #000 100%)',
};
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', margin: '0 0 1rem', textTransform: 'uppercase' };
const title: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4.8vw, 4.5rem)', lineHeight: 0.94, letterSpacing: '-0.03em', margin: 0, textTransform: 'uppercase', maxWidth: '1000px' };
const introGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 5vw, 4rem)', marginTop: '2.2rem' };
const lead: CSSProperties = { color: 'rgba(255,255,255,0.84)', fontSize: 'clamp(1.05rem, 1.55vw, 1.3rem)', lineHeight: 1.72, fontWeight: 600, margin: 0 };
const body: CSSProperties = { color: 'rgba(255,255,255,0.64)', fontSize: '1rem', lineHeight: 1.76 };
const statement: CSSProperties = { marginTop: '2.8rem', display: 'grid', gap: '0.35rem', borderLeft: '3px solid #FFF12D', padding: '1.2rem 1.5rem', background: 'rgba(255,241,45,0.035)', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 2.5vw, 2.2rem)', textTransform: 'uppercase' };
const sectionGrid: CSSProperties = { display: 'grid', gap: '1rem', marginTop: '3rem' };
const card: CSSProperties = { border: '1px solid rgba(255,255,255,0.1)', padding: 'clamp(1.4rem, 3vw, 2rem)', background: 'rgba(255,255,255,0.02)' };
const cardTop: CSSProperties = { display: 'grid', gridTemplateColumns: '55px minmax(0, 1fr)', gap: '1rem', alignItems: 'start', marginBottom: '1rem' };
const number: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.14em', fontSize: '0.8rem', paddingTop: '0.3rem' };
const cardTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.45rem, 2.6vw, 2.4rem)', lineHeight: 1, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' };
const closing: CSSProperties = { marginTop: '3rem', borderTop: '1px solid rgba(255,241,45,0.28)', paddingTop: '2rem', display: 'grid', gap: '0.45rem', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', textTransform: 'uppercase' };
