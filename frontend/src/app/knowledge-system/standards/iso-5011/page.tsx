'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function ISO5011Page() {
  const sections = [
    {
      title: '¿Para qué sirve ISO 5011?',
      content: 'ISO 5011 sirve como el estándar de prueba que garantiza la calidad y la confiabilidad de los elementos de filtro hidráulico. Su propósito es proporcionar un método reproducible y estandarizado para verificar que un elemento de filtro puede retener adecuadamente las partículas bajo presiones diferenciales extremas sin colapsar o desarrollar fugas. Los fabricantes de filtros utilizan ISO 5011 para certificar que sus productos cumplen con las especificaciones de retención, y los compradores utilizan este estándar para validar que los filtros que adquieren proporcionarán la protección esperada. Los procedimientos de prueba ISO 5011 incluyen la "prueba de integridad", donde se aplica aire comprimido para detectar puntos de fuga, y la "prueba de colapso", donde se incrementa gradualmente la presión diferencial hasta que el elemento falla.'
    },
    {
      title: '¿Por qué importa en filtración industrial?',
      content: 'En filtración industrial, ISO 5011 es absolutamente crítico porque conecta la especificación de limpieza (ISO 16889 o ISO 4406) con la realidad física de la retención de partículas. Un elemento de filtro podría estar diseñado para retener partículas de 10 µm, pero sin las pruebas ISO 5011, no hay forma confiable de verificar que realmente lo hace. Cuando un filtro falla en servicio sin colapsar visiblemente, a menudo es porque no pasó adequadamente las pruebas ISO 5011. La contaminación particularada que escapa a través de un elemento de filtro defectuoso es una de las causas más comunes de daño catastrófico en sistemas hidráulicos. ISO 5011 previene esto asegurando que solo los filtros que han demostrado su capacidad de retención se coloquen en servicio crítico.'
    },
    {
      title: 'Aplicación en motores y sistemas',
      content: 'Cuando un fabricante de equipos OEM diseña un sistema hidráulico con un requisito ISO 16889 16/14/11, especifica también un elemento de filtro que ha sido certificado bajo ISO 5011 para retener partículas de ese tamaño crítico. En maquinaria de construcción con presiones de operación de 210 bar, el filtro debe demostrar que puede mantener la integridad hasta presiones diferenciales de 350+ bar en las pruebas ISO 5011. En sistemas agrícolas con ciclos de operación largos, los elementos de filtro certificados ISO 5011 garantizan que el fluido permanece limpio durante miles de horas de funcionamiento. En equipos marinos, donde el acceso para cambiar filtros es limitado, la certificación ISO 5011 es especialmente importante para garantizar que el elemento funcionará de manera confiable durante el intervalo completo de servicio especificado.'
    }
  ];

  const faqs = [
    {
      question: '¿Cuál es la diferencia entre "colapso" e "integridad" en ISO 5011?',
      answer: 'La prueba de integridad (ISO 5011-1) utiliza aire comprimido a baja presión para detectar fugas o puntos débiles en el medio filtrante, usando un detector de burbujas. La prueba de colapso (ISO 5011-2) incrementa gradualmente la presión diferencial (típicamente con agua) hasta que el elemento cede estructuralmente o desarrolla una fuga significativa. La prueba de integridad detecta pequeñas imperfecciones, mientras que la prueba de colapso verifica que el elemento puede soportar presiones extremas antes de fallar estructuralmente.'
    },
    {
      question: '¿Qué presión diferencial debe soportar un elemento de filtro según ISO 5011?',
      answer: 'Los requisitos varían según el tipo de filtro y el tamaño de partículas de retención. Un filtro típico de presión media (retención de 10-25 µm) debe soportar una presión diferencial de colapso de al menos 350 kPa (3.5 bar). Los filtros de alta presión pueden requerir 1000+ kPa. Los fabricantes también especifican presiones diferenciales nominales de operación (típicamente 70-140 kPa) que son significativamente inferiores a la presión de colapso para proporcionar margen de seguridad.'
    },
    {
      question: '¿Con qué frecuencia debe realizarse la prueba ISO 5011?',
      answer: 'Para los fabricantes de filtros, ISO 5011 es una prueba de validación que se realiza durante el desarrollo del producto y durante el control de calidad en lotes de producción (típicamente un número estadístico de muestras por lote). Para los usuarios finales, ISO 5011 no es una prueba que se realice regularmente. En cambio, los usuarios especifican filtros que han sido certificados bajo ISO 5011 y confían en esa certificación previa. Si hay sospecha de elemento defectuoso en servicio, se pueden realizar pruebas ISO 5011 en laboratorio para investigar fallos.'
    }
  ];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Breadcrumb />
      {/* Back Button */}
      <Link href="/knowledge-system/standards"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← STANDARDS</Link>

      {/* Hero Section */}
      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            color: '#FFF12D',
            marginBottom: '1rem',
            opacity: 0.85,
          }}>
            // INTERNATIONAL FILTRATION STANDARD
          </p>
          <h1 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            ISO 5011
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Hydraulic Fluid Power — Filters — Test Procedure for Verification of Collapse/Integrity
          </p>
        </motion.div>
      </section>

      {/* Content Sections */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        {/* Section: Definition (with internal links) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          style={{
            marginBottom: '3rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            ¿Qué es ISO 5011?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
          }}>
            ISO 5011 es el estándar internacional que define el procedimiento de prueba para la verificación de la integridad y el colapso del medio filtrante en filtros de aire industriales, complementando los requisitos del dominio de{' '}
            <Link href="/knowledge-system/standards/air-intake-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>sistemas de admisión de aire</Link>.{' '}
            Este estándar especifica métodos precisos para probar que un elemento de filtro puede retener partículas de un tamaño específico sin permitir que el fluido pase alrededor de los lados del elemento (bypass) bajo condiciones de presión diferencial extrema. ISO 5011 es crucial porque garantiza que los elementos de filtro cumplan con sus especificaciones de retención de partículas y no fallarán catastróficamente cuando se exponen a presiones diferenciales elevadas que pueden ocurrir durante la operación normal o en situaciones de emergencia. La clasificación de tamaño de partículas retenidas sigue el marco de{' '}
            <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889</Link>{' '}
            para asegurar coherencia entre los distintos dominios de filtración. Los filtros que no superan las pruebas ISO 5011 permiten el paso de partículas abrasivas que causan{' '}
            <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>desgaste acelerado en componentes internos de motores</Link>.
          </p>
        </motion.div>

        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
            style={{
              marginBottom: '3rem',
              paddingBottom: '2rem',
              borderBottom: i < sections.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}
          >
            <h2 style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#FFF12D',
              marginBottom: '1rem',
              letterSpacing: '-0.01em',
            }}>
              {section.title}
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.8,
            }}>
              {section.content}
            </p>
          </motion.div>
        ))}
      </section>

      {/* FAQ Section */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: sections.length * 0.1 }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '2rem',
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}>
            Preguntas Frecuentes
          </h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (sections.length + 1 + i) * 0.1 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  padding: '1.5rem',
                  borderRadius: '4px',
                }}
              >
                <h3 style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#FFF12D',
                  marginBottom: '0.75rem',
                }}>
                  {faq.question}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.7,
                }}>
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Air Intake Filtration Systems [PRIMARY]</p>
        <p>SYSTEMS_AFFECTED: air_intake, engine, turbocharger</p>
        <p>CONCEPT_TAXONOMY: type=standard | domain=air-filtration-testing | standards=ISO-5011, SAE-J726</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 5011, SAE J726, SAE J1539</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: DRYCORE, MACROCORE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/iso-5011</p>
        <p>&nbsp;&nbsp;concept_id: iso-5011-air-filter-testing</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-06-11</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'ISO 5011 — Air Filter Element Test Standard for Internal Combustion Engines',
        description: 'ISO 5011 specifies test methods for evaluating air filter element performance including initial efficiency, dust capacity, and element integrity testing. Defines standardized procedures for measuring filtration efficiency and structural durability of air intake filter elements.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['ISO 5011', 'air filter testing', 'filter element integrity', 'dust capacity test', 'air intake filtration', 'SAE J726', 'SAE J1539', 'engine air filter'],
        about: { '@type': 'Thing', name: 'ISO 5011 Air Filter Testing', description: 'International standard for measuring air filter element performance including efficiency, dust holding capacity, and structural integrity under test conditions.' },
        inLanguage: 'es',
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Standards', item: 'https://elimfilters.com/knowledge-system/standards' },
          { '@type': 'ListItem', position: 4, name: 'ISO 5011', item: 'https://elimfilters.com/knowledge-system/standards/iso-5011' },
        ],
      }) }} />
    </main>
  );
}
