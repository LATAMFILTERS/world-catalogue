'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { AboutStrategicModel } from '@/components/AboutStrategicModel';
import '@/i18n';

const COPY_EN = {
  heroTitle: 'Engineering protection around the asset.',
  heroLead: 'ELIMFILTERS® is Kleo Technology LLC\'s global industrial filtration brand. We develop contamination-control systems around the operating condition of the protected asset, combining filtration-media engineering, qualified manufacturing, physical validation, application intelligence, and disciplined commercial execution for industrial, Heavy Duty, fleet, equipment, and complementary automotive markets.',
  partnersTitle: 'Commercial partners are part of the operating model',
  partners1: 'ELIMFILTERS develops markets through qualified commercial partners with direct knowledge of the installed base, local operating conditions, customer requirements, inventory behavior, and service expectations.',
  partners2: 'That local capability is technically relevant. Correct filtration depends not only on the product itself, but also on accurate application identification, availability at the required service interval, disciplined substitution, and an understanding of the equipment environment in which the product will operate.',
  partners3: 'ELIMFILTERS contributes product architecture, technical governance, cross-reference and application intelligence, structured documentation, manufacturing control, and portfolio access. The commercial partner converts those capabilities into inventory strategy, technical sales, customer continuity, and long-term territory development.',
  structureTitle: 'Corporate Structure',
  ownerLabel: 'Brand Owner',
  headquartersLabel: 'Legal Headquarters',
  operatingLabel: 'Operating Model',
  operatingValue: 'Distributor-first global operations with coordinated strategic-account capability',
  networkTitle: 'Commercial Partner Network',
  networkBody: 'Qualified commercial partners extend ELIMFILTERS technical capability, product access, inventory strategy, customer relationships, and local market execution. Strategic accounts may be developed through distributor-led, ELIMFILTERS-led, or coordinated structures according to the requirements of the account and territory.',
  networkLink: 'Explore Commercial Partner Network →',
  knowledgeTitle: 'Knowledge Resources',
  knowledgeBody: 'Technical knowledge on filtration standards, contamination control, application behavior, product intelligence, operating conditions, and asset-protection principles.',
  knowledgeLink: 'Access Knowledge Center →',
  closingTitle: 'Engineering decisions must protect real operating value.',
  closingBody: 'ELIMFILTERS connects media engineering, manufacturing control, physical validation, mathematical analysis, application intelligence, and commercial execution into one operating system focused on asset reliability and lifecycle value.',
  contact: 'CONTACT ELIMFILTERS',
  explore: 'EXPLORE OUR KNOWLEDGE SYSTEM',
};

const COPY_ES = {
  heroTitle: 'Ingeniería de protección alrededor del activo.',
  heroLead: 'ELIMFILTERS® es la marca global de filtración industrial de Kleo Technology LLC. Desarrollamos sistemas de control de contaminación a partir de la condición operativa del activo protegido, integrando ingeniería de medios filtrantes, manufactura calificada, validación física, inteligencia de aplicación y ejecución comercial disciplinada para mercados industriales, Heavy Duty, flotas, equipos y aplicaciones automotrices complementarias.',
  partnersTitle: 'El socio comercial forma parte del modelo operativo',
  partners1: 'ELIMFILTERS desarrolla los mercados mediante socios comerciales calificados con conocimiento directo del parque instalado, las condiciones locales de operación, los requerimientos del cliente, el comportamiento del inventario y las necesidades de servicio.',
  partners2: 'Esa capacidad local tiene relevancia técnica. Una filtración correcta depende no solo del producto, sino también de una identificación precisa de la aplicación, disponibilidad en el intervalo de servicio requerido, sustitución disciplinada y comprensión del entorno en el que opera el equipo.',
  partners3: 'ELIMFILTERS aporta arquitectura de producto, gobernanza técnica, inteligencia de aplicación y referencias cruzadas, documentación estructurada, control de manufactura y acceso al portafolio. El socio comercial convierte esas capacidades en estrategia de inventario, venta técnica, continuidad del cliente y desarrollo sostenido del territorio.',
  structureTitle: 'Estructura Corporativa',
  ownerLabel: 'Propietario de la Marca',
  headquartersLabel: 'Sede Legal',
  operatingLabel: 'Modelo Operativo',
  operatingValue: 'Operación global distributor-first con capacidad coordinada para cuentas estratégicas',
  networkTitle: 'Red de Socios Comerciales',
  networkBody: 'Los socios comerciales calificados amplían la capacidad técnica de ELIMFILTERS, el acceso al producto, la estrategia de inventario, las relaciones con clientes y la ejecución local. Las cuentas estratégicas pueden desarrollarse mediante estructuras lideradas por el distribuidor, por ELIMFILTERS o coordinadas, de acuerdo con los requisitos de la cuenta y del territorio.',
  networkLink: 'Explorar Red de Socios Comerciales →',
  knowledgeTitle: 'Recursos de Conocimiento',
  knowledgeBody: 'Conocimiento técnico sobre normas de filtración, control de contaminación, comportamiento de aplicaciones, inteligencia de producto, condiciones operativas y principios de protección de activos.',
  knowledgeLink: 'Acceder al Centro de Conocimiento →',
  closingTitle: 'Las decisiones de ingeniería deben proteger valor operativo real.',
  closingBody: 'ELIMFILTERS integra ingeniería de medios, control de manufactura, validación física, análisis matemático, inteligencia de aplicación y ejecución comercial en un mismo sistema operativo orientado a la confiabilidad del activo y al valor de ciclo de vida.',
  contact: 'CONTACTAR ELIMFILTERS',
  explore: 'EXPLORAR NUESTRO SISTEMA DE CONOCIMIENTO',
};

export default function AboutPage() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const copy = isSpanish ? COPY_ES : COPY_EN;

  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://elimfilters.com/#organization',
    name: 'ELIMFILTERS®',
    alternateName: 'ELIMFILTERS',
    legalName: 'Kleo Technology LLC',
    url: 'https://elimfilters.com',
    logo: { '@type': 'ImageObject', url: 'https://elimfilters.com/images/logo-sin-fondo.avif' },
    email: 'info@elimfilters.com',
    areaServed: 'Worldwide',
    slogan: 'Global Industrial Filtration Brand',
    description: 'ELIMFILTERS® is Kleo Technology LLC\'s global filtration brand for industrial, heavy-duty, fleet, equipment, and automotive applications. The operating model combines filtration-media development in Germany, qualified manufacturing partners in the People\'s Republic of China, product-specific physical validation, mathematical and computational analysis of demanding operating conditions, product intelligence, and a distributor-first commercial architecture.',
    knowsAbout: [
      'Industrial asset protection',
      'Contamination control',
      'Filtration engineering',
      'Mathematical engineering modeling',
      'Computational analysis of demanding and extreme operating conditions',
      'Particle and fluid behavior',
      'Severe-duty equipment reliability',
      'Automotive filtration',
      'Physical validation of filtration systems',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Frisco',
      addressRegion: 'TX',
      addressCountry: 'US',
      addressType: 'Legal Headquarters',
    },
  };

  const schemaAboutPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://elimfilters.com/about/#webpage',
    name: 'About ELIMFILTERS®',
    headline: 'Industrial asset protection engineered through a global product system',
    description: 'ELIMFILTERS® explains its engineering methodology, global manufacturing model, physical validation, mathematical modeling of demanding and extreme operating conditions, horizontal operating structure, and commercial partner architecture.',
    url: 'https://elimfilters.com/about/',
    mainEntity: { '@id': 'https://elimfilters.com/#organization' },
    isPartOf: { '@type': 'WebSite', '@id': 'https://elimfilters.com/#website', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
  };

  return (
    <main id="main-content" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAboutPage) }} />

      <PageHeader currentPage="About" />

      <section style={heroSection}>
        <div aria-hidden="true" style={heroImage} />
        <div aria-hidden="true" style={heroOverlay} />
        <div style={heroInner}>
          <p style={eyebrow}>ELIMFILTERS · ASSET PROTECTION SYSTEMS</p>
          <h1 style={heroTitle}>{copy.heroTitle}</h1>
          <p style={heroLead}>{copy.heroLead}</p>
        </div>
      </section>

      <section style={partnersSection}>
        <div style={partnersWrap}>
          <article style={partnersCard}>
            <div style={partnersCardTop}>
              <span style={partnersNumber}>01</span>
              <h3 style={partnersCardTitle}>{copy.partnersTitle}</h3>
            </div>
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col gap-4">
                <p style={partnersBody}>{copy.partners1}</p>
                <p style={partnersBody}>{copy.partners2}</p>
              </div>
              <div>
                <p style={partnersBody}>{copy.partners3}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <AboutStrategicModel />

      <section style={corporateSection}>
        <div style={corporateWrap}>
          <div>
            <p style={eyebrow}>{copy.structureTitle}</p>
            <ul style={structureList}>
              <li><strong style={label}>{copy.ownerLabel}:</strong> Kleo Technology LLC</li>
              <li><strong style={label}>{copy.headquartersLabel}:</strong> Frisco, Texas, USA</li>
              <li><strong style={label}>{copy.operatingLabel}:</strong> {copy.operatingValue}</li>
            </ul>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <p style={eyebrow}>{copy.networkTitle}</p>
              <p style={bodyText}>{copy.networkBody}</p>
              <Link href="/distributors" style={textLink}>{copy.networkLink}</Link>
            </div>

            <div>
              <p style={eyebrow}>{copy.knowledgeTitle}</p>
              <p style={bodyText}>{copy.knowledgeBody}</p>
              <Link href="/knowledge-center/" style={textLink}>{copy.knowledgeLink}</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={closingSection}>
        <div style={closingInner}>
          <h2 style={sectionTitle}>{copy.closingTitle}</h2>
          <p style={closingBody}>{copy.closingBody}</p>
          <div style={ctaRow}>
            <Link href="/contact" style={yellowButton}>{copy.contact}</Link>
            <Link href="/knowledge-center/" style={darkButton}>{copy.explore}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const heroSection: CSSProperties = { minHeight: '82vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundImage: 'url(/images/grupo-filters.avif)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.42 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.48) 55%, rgba(0,0,0,0.18) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.20), transparent 38%)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', margin: '0 0 1rem', textTransform: 'uppercase' };
const heroTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.9, fontSize: 'clamp(3rem, 7vw, 6.8rem)', maxWidth: '1050px', margin: 0, textTransform: 'uppercase' };
const heroLead: CSSProperties = { marginTop: '2rem', maxWidth: '880px', color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1rem, 1.6vw, 1.27rem)', lineHeight: 1.75, fontWeight: 600 };
const partnersSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem) 0', background: '#050505' };
const partnersWrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const partnersCard: CSSProperties = { border: '1px solid rgba(255,255,255,0.1)', padding: 'clamp(1.4rem, 3vw, 2rem)', background: 'rgba(255,255,255,0.02)' };
const partnersCardTop: CSSProperties = { display: 'grid', gridTemplateColumns: '55px minmax(0, 1fr)', gap: '1rem', alignItems: 'start', marginBottom: '1rem' };
const partnersNumber: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.14em', fontSize: '0.8rem', paddingTop: '0.3rem' };
const partnersCardTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.45rem, 2.6vw, 2.4rem)', lineHeight: 1, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' };
const partnersBody: CSSProperties = { color: 'rgba(255,255,255,0.64)', fontSize: '1rem', lineHeight: 1.76, margin: 0 };
const corporateSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,0.15)', borderBottom: '1px solid rgba(255,255,255,0.03)', background: '#050505' };
const corporateWrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const structureList: CSSProperties = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.65 };
const label: CSSProperties = { color: '#FFF12D' };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.76, margin: '0 0 1rem' };
const textLink: CSSProperties = { display: 'inline-block', color: '#FFF12D', textDecoration: 'none', fontWeight: 600 };
const closingSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,0.2)', background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.20), transparent 34%)' };
const closingInner: CSSProperties = { maxWidth: '980px', margin: '0 auto', textAlign: 'center' };
const sectionTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.98, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' };
const closingBody: CSSProperties = { color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.78, maxWidth: '800px', margin: '1.8rem auto 0' };
const ctaRow: CSSProperties = { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem' };
const darkButton: CSSProperties = { display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,241,45,0.4)' };
