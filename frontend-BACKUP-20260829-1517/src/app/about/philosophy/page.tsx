'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';

const PRINCIPLES_EN = [
  { num: '01', title: 'Protect the asset, not only the filter.', desc: 'The filter is an engineering tool, not the final product. Success is measured by extension of critical component life, not filter longevity.' },
  { num: '02', title: 'Contamination is the problem.', desc: '70-80% of hydraulic and engine lubrication failures are initiated by micro-abrasion. We design systems to eliminate the root cause, not just react to failure.' },
  { num: '03', title: 'Engineering comes before marketing.', desc: 'We refuse generic statements and commercial clichés. Every performance claim must be backstopped by international standards and repeatable metrology.' },
  { num: '04', title: 'Every protection system deserves its own solution.', desc: 'Different protection systems have distinct contamination profiles. A single multi-purpose media cannot protect complex engines, hydraulics, and fuel lines.' },
  { num: '05', title: 'Standards guide decisions.', desc: 'ISO 4406, ISO 16889, ISO 5011, and ASTM methodologies are the legal constitution of our engineering department. We design to match or exceed certified metrics.' },
  { num: '06', title: 'Knowledge creates better maintenance decisions.', desc: 'We publish our internal documentation and metrology frameworks. A customer who understands contamination is a customer who chooses engineered protection.' },
  { num: '07', title: 'Reliability is the objective.', desc: 'Contamination control is reliability engineering. Eliminating micronic wear is the only pathway to achieving design life and avoiding catastrophic field stops.' },
];

const PRINCIPLES_ES = [
  { num: '01', title: 'Proteger el activo, no solo el filtro.', desc: 'El filtro es una herramienta de ingeniería, no el producto final. El éxito se mide por la extensión de la vida del componente crítico, no por la longevidad del filtro.' },
  { num: '02', title: 'La contaminación es el problema.', desc: 'El 70-80% de las fallas de lubricación hidráulica y de motor se inician por microabrasión. Diseñamos sistemas para eliminar la causa raíz, no solo para reaccionar a la falla.' },
  { num: '03', title: 'La ingeniería va antes que el marketing.', desc: 'Rechazamos las afirmaciones genéricas y los clichés comerciales. Cada afirmación de desempeño debe estar respaldada por normas internacionales y metrología repetible.' },
  { num: '04', title: 'Cada sistema de protección merece su propia solución.', desc: 'Los distintos sistemas de protección tienen perfiles de contaminación diferentes. Un solo medio multipropósito no puede proteger motores, sistemas hidráulicos y líneas de combustible complejos.' },
  { num: '05', title: 'Las normas guían las decisiones.', desc: 'ISO 4406, ISO 16889, ISO 5011 y las metodologías ASTM son la constitución legal de nuestro departamento de ingeniería. Diseñamos para igualar o superar las métricas certificadas.' },
  { num: '06', title: 'El conocimiento genera mejores decisiones de mantenimiento.', desc: 'Publicamos nuestra documentación interna y marcos de metrología. Un cliente que entiende la contaminación es un cliente que elige protección diseñada con ingeniería.' },
  { num: '07', title: 'La confiabilidad es el objetivo.', desc: 'El control de contaminación es ingeniería de confiabilidad. Eliminar el desgaste micrónico es el único camino para alcanzar la vida útil de diseño y evitar paradas catastróficas en campo.' },
];

export default function OurPhilosophyPage() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const principles = isSpanish ? PRINCIPLES_ES : PRINCIPLES_EN;

  const copy = isSpanish ? {
    heroTitle: 'Nuestra Filosofía de Ingeniería',
    heroLead: 'ELIMFILTERS no diseña repuestos genéricos de posventa. Diseñamos sistemas de control de contaminación construidos para preservar maquinaria industrial pesada. Nuestro trabajo se rige estrictamente por las leyes físicas de la tribología y normas internacionales verificadas.',
    s1Title: '1. Por Qué Existe ELIMFILTERS',
    s1Body: 'La maquinaria pesada está construida para trabajar en condiciones extremas, pero es vulnerable a holguras micrónicas invisibles. La filtración convencional depende de elementos filtrantes genéricos que capturan partículas grandes mientras dejan pasar las partículas más pequeñas y altamente abrasivas. Estas partículas circulan por válvulas hidráulicas, turbocompresores e inyectores common rail, generando fricción y desgaste. ELIMFILTERS existe para construir un escudo defensivo que detiene este ciclo de desgaste y extiende la vida útil de los activos críticos.',
    s2Title: '2. Lo Que Creemos',
    s2Body: 'Creemos que la protección de activos es una ciencia de ingeniería exacta, no un ejercicio de marca. Un filtro no es solo un consumible genérico que debe reemplazarse de la forma más barata posible; es un componente a nivel de sistema que influye directamente en la eficiencia termodinámica y la integridad mecánica de toda la máquina. Al controlar la contaminación, restauramos la confiabilidad del equipo a su potencial de diseño.',
    s3Title: '3. Nuestra Filosofía de Ingeniería',
    s3Body: 'Nuestra filosofía se centra en la intercepción de precisión multicapa. Rechazamos los diseños de una sola capa propensos al bypass. En su lugar, estructuramos los medios filtrantes con fibras sintéticas multidensidad, membranas hidrofóbicas e interfaces de sellado radial de bypass cero. Nuestra ingeniería se enfoca completamente en las holguras críticas de los sistemas modernos —como las holguras comunes de 1–5 µm en sistemas common rail de alta presión (HPCR)— asegurando una captura de partículas dirigida donde más importa.',
    s4Title: '4. Cómo Tomamos Decisiones de Ingeniería',
    s4Body: 'Tomamos decisiones con datos empíricos y comprobables. Cada tecnología que construimos se prueba bajo condiciones estrictas de laboratorio y de campo para verificar su desempeño contra normas internacionales: ISO 16889 para eficiencia multipaso de aceite lubricante, ISO 5011 para capacidad de admisión de aire, e ISO 4406 para códigos de limpieza objetivo del fluido. Si un diseño no puede medirse, certificarse y validarse en servicio, no sale de nuestro laboratorio.',
    s5Title: '5. Por Qué Desarrollamos Tecnologías Propias',
    s5Body: 'Los filtros estándar de venta genérica no pueden ofrecer protección adecuada para maquinaria industrial de alto valor que opera en condiciones extremas. Desarrollamos tecnologías propias especializadas como MACROCORE™, SYNTAPORE™ y NANOFORCE™ porque cada dominio de sistema presenta perfiles de contaminación y modos de falla únicos. Nuestras estructuras propias nos permiten optimizar la configuración del medio filtrante para fluidos, presiones y contaminantes específicos.',
    s6Title: '6. Nuestro Compromiso con los Clientes',
    s6Body: 'Nos comprometemos a entregar transparencia, verificación y soporte de ingeniería. No nos escondemos detrás de eslóganes de venta. Ofrecemos acceso completo a nuestro Sistema de Conocimiento, fichas técnicas de ingeniería y registros de certificación. Creemos que empoderar a nuestros clientes con conocimiento de control de contaminación es tan importante como los productos físicos que entregamos.',
    principlesEyebrow: '7 PRINCIPIOS RECTORES',
    principlesTitle: 'Los Principios de Ingeniería de ELIMFILTERS',
  } : {
    heroTitle: 'Our Engineering Philosophy',
    heroLead: 'ELIMFILTERS does not design generic aftermarket replacements. We engineer contamination control systems designed to preserve heavy industrial machinery. Our work is governed strictly by the physical laws of tribology and verified international standards.',
    s1Title: '1. Why ELIMFILTERS Exists',
    s1Body: 'Heavy-duty machinery is built to work in extreme conditions, yet it is vulnerable to invisible micronic clearances. Conventional filtration relies on commodity filter elements that capture large particles while letting the smaller, highly abrasive particles pass through. These particles circulate through hydraulic valves, turbochargers, and common rail injectors, creating friction and wear. ELIMFILTERS exists to build a defensive shield that stops this wear cycle and extends the service life of critical assets.',
    s2Title: '2. What We Believe',
    s2Body: 'We believe that asset protection is an exact engineering science, not a branding exercise. A filter is not just a commodity consumable meant to be replaced as cheaply as possible; it is a system-level component that directly influences the thermodynamic efficiency and mechanical integrity of the entire machine. By controlling contamination, we restore equipment reliability to its design potential.',
    s3Title: '3. Our Engineering Philosophy',
    s3Body: 'Our philosophy centers on precision multi-layer interception. We refuse single-layer bypass-prone designs. Instead, we structure filtration media with multi-density synthetic fibers, hydrophobic membranes, and zero-bypass radial sealing interfaces. Our engineering focuses entirely on the critical clearances of modern systems—such as high-pressure common rail (HPCR) common clearances of 1–5 µm—ensuring targeted particle capture where it matters most.',
    s4Title: '4. How We Make Engineering Decisions',
    s4Body: 'We make decisions using empirical, testable data. Every technology we build is tested under strict laboratory and field conditions to verify performance against international standards: ISO 16889 for lube oil multi-pass efficiency, ISO 5011 for air intake capacity, and ISO 4406 for target fluid cleanliness codes. If a design cannot be measured, certified, and validated in service, it does not leave our laboratory.',
    s5Title: '5. Why We Developed Proprietary Technologies',
    s5Body: 'Standard off-the-shelf filters cannot provide adequate protection for high-value industrial machinery operating in extreme conditions. We developed specialized, proprietary technologies like MACROCORE™, SYNTAPORE™, and NANOFORCE™ because each system domain exhibits unique contamination profiles and failure pathways. Our proprietary structures allow us to optimize media configuration for specific fluids, pressures, and contaminants.',
    s6Title: '6. Our Commitment to Customers',
    s6Body: 'We commit to delivering transparency, verification, and engineering support. We do not hide behind sales slogans. We provide full access to our Knowledge System, engineering data sheets, and certification records. We believe that empowering our customers with contamination control knowledge is just as important as the physical products we deliver.',
    principlesEyebrow: '7 GUIDING PRINCIPLES',
    principlesTitle: 'The ELIMFILTERS Engineering Principles',
  };

  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ELIMFILTERS',
    legalName: 'Kleo Technology LLC',
    url: 'https://elimfilters.com',
    logo: 'https://elimfilters.com/assets/logo-elimfilters.png',
    email: 'info@elimfilters.com',
    areaServed: 'Worldwide',
    description: 'ELIMFILTERS is an industrial asset protection company protecting critical equipment through contamination control, proprietary filtration technologies, and system-level engineering frameworks.',
  };

  const schemaPhilosophyPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Our Philosophy — ELIMFILTERS Engineering Doctrine',
    description: 'The official engineering philosophy of ELIMFILTERS. Guided by contamination science, international metrology standards, and system-level asset protection principles.',
    url: 'https://elimfilters.com/about/philosophy',
    author: { '@type': 'Organization', name: 'ELIMFILTERS' },
    dateModified: '2026-08-25',
  };

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
      { '@type': 'ListItem', position: 2, name: 'About', item: 'https://elimfilters.com/about' },
      { '@type': 'ListItem', position: 3, name: 'Philosophy', item: 'https://elimfilters.com/about/philosophy' },
    ],
  };

  return (
    <main id="main-content" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPhilosophyPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />

      <PageHeader breadcrumbs={[{ label: 'About', href: '/about' }]} currentPage={isSpanish ? 'Filosofía' : 'Philosophy'} />

      <section style={heroSection}>
        <div aria-hidden="true" style={heroImage} />
        <div aria-hidden="true" style={heroOverlay} />
        <div style={wrap}>
          <p style={eyebrow}>{isSpanish ? 'DOCTRINA DE INGENIERÍA' : 'ENGINEERING DOCTRINE'}</p>
          <h1 style={heroTitle}>{copy.heroTitle}</h1>
          <p style={heroLead}>{copy.heroLead}</p>
        </div>
      </section>

      <section style={altSection1}>
        <div style={twoColGrid}>
          <div>
            <h2 style={sectionTitle}>{copy.s1Title}</h2>
            <p style={sectionLead}>{copy.s1Body}</p>
          </div>
          <div>
            <h2 style={sectionTitle}>{copy.s2Title}</h2>
            <p style={sectionLead}>{copy.s2Body}</p>
          </div>
        </div>
      </section>

      <section style={altSection2}>
        <div style={twoColGrid}>
          <div>
            <h2 style={sectionTitle}>{copy.s3Title}</h2>
            <p style={sectionLead}>{copy.s3Body}</p>
          </div>
          <div>
            <h2 style={sectionTitle}>{copy.s4Title}</h2>
            <p style={sectionLead}>{copy.s4Body}</p>
          </div>
        </div>
      </section>

      <section style={altSection1}>
        <div style={twoColGrid}>
          <div>
            <h2 style={sectionTitle}>{copy.s5Title}</h2>
            <p style={sectionLead}>{copy.s5Body}</p>
          </div>
          <div>
            <h2 style={sectionTitle}>{copy.s6Title}</h2>
            <p style={sectionLead}>{copy.s6Body}</p>
          </div>
        </div>
      </section>

      <section style={altSection2}>
        <div style={wrap}>
          <p style={{ ...eyebrow, textAlign: 'center' }}>{copy.principlesEyebrow}</p>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '100%', margin: '0 auto 3rem' }}>{copy.principlesTitle}</h2>
          <div style={principlesPyramid}>
            {[principles.slice(0, 4), principles.slice(4, 6), principles.slice(6, 7)].map((row, i) => (
              <div key={i} style={principlesRow}>
                {row.map((pr) => (
                  <div key={pr.num} style={principleCard}>
                    <span style={principleNum}>{pr.num}</span>
                    <h3 style={principleTitle}>{pr.title}</h3>
                    <p style={principleDesc}>{pr.desc}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };
const heroSection: CSSProperties = { minHeight: '58vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem,10vw,9rem) clamp(1.25rem,6vw,6rem)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundImage: 'url(/images/grupo-filters.avif)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: .28 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.9),rgba(0,0,0,.5) 58%,rgba(0,0,0,.2)),radial-gradient(circle at 80% 15%,rgba(255,241,45,.14),transparent 32%)' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', margin: '0 0 1rem', textTransform: 'uppercase', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = { position: 'relative', zIndex: 2, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-.05em', lineHeight: .92, fontSize: 'clamp(2.6rem,6vw,5.5rem)', margin: 0, textTransform: 'uppercase', maxWidth: '900px' };
const heroLead: CSSProperties = { position: 'relative', zIndex: 2, marginTop: '1.5rem', maxWidth: '820px', color: 'rgba(255,255,255,.82)', fontSize: 'clamp(1rem,1.5vw,1.25rem)', lineHeight: 1.75, fontWeight: 550 };
const altSection1: CSSProperties = { background: '#050505', color: '#fff', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const altSection2: CSSProperties = { background: '#000', color: '#fff', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const twoColGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(420px,100%),1fr))', gap: 'clamp(2.5rem,6vw,4rem)' };
const sectionTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,2.6vw,2rem)', lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 1.25rem', textTransform: 'uppercase', color: '#FFF12D' };
const sectionLead: CSSProperties = { color: 'rgba(255,255,255,.7)', lineHeight: 1.8, fontSize: '.98rem', margin: 0 };
const principlesPyramid: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1px' };
const principlesRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px' };
const principleCard: CSSProperties = { background: '#080808', border: '1px solid rgba(255,255,255,.08)', padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '.85rem', flex: '1 1 260px', maxWidth: '340px' };
const principleNum: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', color: '#FFF12D' };
const principleTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: '#fff', margin: 0 };
const principleDesc: CSSProperties = { fontSize: '.85rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.65, margin: 0 };
