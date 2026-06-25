'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function ISO16889Page() {
  const sections = [
    {
      title: '¿Para qué sirve ISO 16889?',
      content: 'ISO 16889 sirve como herramienta de comunicación universal entre proveedores de fluidos, fabricantes de equipos y operadores de máquinas. Su propósito es establecer un lenguaje común para especificar, verificar y documentar la limpieza de fluidos hidráulicos. Permite a las organizaciones definir requisitos precisos de calidad del fluido, monitorear la contaminación durante la operación, y garantizar que el fluido cumple con las especificaciones necesarias para proteger los componentes del sistema hidráulico de la degradación y el desgaste prematuro.'
    },
    {
      title: '¿Por qué importa en filtración industrial?',
      content: 'En filtración industrial, ISO 16889 es fundamental porque establece el objetivo cuantificable que debe alcanzar un sistema de filtración. Sin este estándar, no existiría una forma consistente de medir si un filtro o sistema de filtración está cumpliendo su función. ISO 16889 define exactamente qué nivel de limpieza es necesario para diferentes aplicaciones, permitiendo que los ingenieros diseñen sistemas de filtración que mantengan el fluido dentro de los rangos especificados. Esto es crítico porque la contaminación particularada es la causa principal del desgaste en componentes hidráulicos, siendo responsable del 50-75% de las fallas de sistemas hidráulicos en la industria.'
    },
    {
      title: 'Aplicación en motores y sistemas',
      content: 'En sistemas hidráulicos de maquinaria pesada, equipos de construcción, sistemas agrícolas, maquinaria marina y equipos de minería, ISO 16889 determina las especificaciones de limpieza requeridas. Por ejemplo, un sistema hidráulico servo-controlado puede requerir ISO 16889 16/14/11 (máximo de 1300 partículas >4µm, 160 partículas >6µm, 20 partículas >14µm por mL), mientras que un sistema de transmisión puede especificar ISO 16889 18/16/13. Los fabricantes de equipos OEM utilizan estos códigos en sus manuales de servicio para indicar el fluido correcto, y los operadores monitorean regularmente el fluido para asegurar que permanece dentro de la clasificación especificada mediante pruebas de conteo de partículas.'
    }
  ];

  const faqs = [
    {
      question: '¿Cuál es la diferencia entre ISO 16889 e ISO 4406?',
      answer: 'ISO 4406 utilizaba un código de 2-3 dígitos menos preciso, mientras que ISO 16889 utiliza 4 dígitos para medir partículas en tres tamaños diferentes (>4µm, >6µm, >14µm). ISO 16889 también especifica métodos de prueba más rigurosos y utiliza tamaños de partículas más estándar. ISO 16889 ofrece mayor precisión y es ahora el estándar preferido en la industria.'
    },
    {
      question: '¿Qué significa el código 17/15/12 en ISO 16889?',
      answer: 'Un código ISO 16889 17/15/12 significa que el fluido contiene: máximo 1300 partículas mayores a 4 micrones por mililitro (17 = 2^17/4 = 1300), máximo 320 partículas mayores a 6 micrones por mililitro (15 = 2^15/4 = 320), y máximo 20 partículas mayores a 14 micrones por mililitro (12 = 2^12/4 = 20). Los números son exponentes matemáticos que representan umbrales de contaminación aceptables.'
    },
    {
      question: '¿Con qué frecuencia debo verificar la limpieza del fluido según ISO 16889?',
      answer: 'La frecuencia depende del tipo de equipo y las condiciones de operación. Los sistemas críticos como maquinaria servocontrolada requieren verificación mensual o trimestral. Equipos de construcción en ambientes polvorientos pueden requerir verificación cada 50-100 horas de operación. Los fabricantes OEM especifican intervalos en sus manuales de servicio. Las pruebas se realizan mediante contadores de partículas ópticos o de luz bloqueada calibrados según ISO 11171.'
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
          <h1 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            ISO 16889
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            textAlign: 'justify', lineHeight: 1.65,
          }}>
            Hydraulic Fluid Power — Fluids — Method for coding the degree of contamination by solid particles
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
            ¿Qué es ISO 16889?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            ISO 16889 es el estándar internacional que define el método de codificación de la limpieza de fluidos hidráulicos según el grado de contaminación por partículas sólidas. Es la herramienta de medición central dentro de cualquier{' '}
            <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>estrategia de filtración industrial</Link>.{' '}
            Establece un sistema estandarizado de clasificación de 4 dígitos que identifica el número de partículas mayores a 4 µm, 6 µm y 14 µm por cada mililitro de fluido. Este estándar reemplazó a{' '}
            <Link href="/knowledge-system/standards/iso-4406" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 4406</Link>{' '}
            como el código de limpieza preferido en la industria moderna, ofreciendo una metodología más precisa y confiable para la evaluación de la calidad del fluido. La contaminación que ISO 16889 cuantifica es la misma que impulsa el{' '}
            <Link href="/knowledge-system/contamination/hydraulic-system" style={{ color: '#FFF12D', textDecoration: 'underline' }}>deterioro acelerado en sistemas hidráulicos de alta presión</Link>.
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
              textAlign: 'justify', lineHeight: 1.8,
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
                  textAlign: 'justify', lineHeight: 1.7,
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
        <p>SEMANTIC_DOMAINS: Contamination Control Systems [PRIMARY] | Hydraulic Efficiency Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: hydraulic, lube, fuel, industrial_fluid</p>
        <p>CONCEPT_TAXONOMY: type=standard | domain=filter-testing | standards=ISO-16889, ISO-4406</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 4406, ISO 16889, NFPA T2.14</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/hydraulic-system</p>
        <p>&nbsp;&nbsp;Related_Technologies: NANOFORCE, SYNTRAX</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/total-cost-ownership</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/iso-16889</p>
        <p>&nbsp;&nbsp;concept_id: iso-16889-filter-testing</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-06-11</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'ISO 16889 — Multi-Pass Filter Performance Testing Standard',
        description: 'ISO 16889 specifies the multi-pass method for evaluating filtration ratio (Beta ratio) and dirt-holding capacity of hydraulic fluid power filter elements. Beta ratio quantifies filter efficiency at specific particle sizes, enabling system designers to specify target cleanliness codes for critical components.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['ISO 16889', 'Beta ratio', 'filter efficiency', 'multi-pass test', 'hydraulic filtration', 'ISO 4406', 'contamination control', 'industrial filtration'],
        about: { '@type': 'Thing', name: 'ISO 16889 Filter Testing', description: 'International standard for measuring filtration efficiency (Beta ratio) and dirt-holding capacity of hydraulic filter elements using the multi-pass method.' },
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
          { '@type': 'ListItem', position: 4, name: 'ISO 16889', item: 'https://elimfilters.com/knowledge-system/standards/iso-16889' },
        ],
      }) }} />
    </main>
  );
}
