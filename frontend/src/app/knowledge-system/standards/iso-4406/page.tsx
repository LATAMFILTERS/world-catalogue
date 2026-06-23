'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function ISO4406Page() {
  const sections = [
    {
      title: '¿Para qué sirve ISO 4406?',
      content: 'ISO 4406 sirve como un sistema de clasificación simplificado para comunicar el estado de limpieza de un fluido hidráulico entre proveedores y usuarios. Su propósito es permitir que diferentes partes identifiquen rápidamente si un fluido cumple con los requisitos mínimos de limpieza para una aplicación específica. El estándar proporciona una metodología para el conteo de partículas y la clasificación de fluidos según dos categorías de tamaño de partículas, facilitando una comunicación consistente sobre la calidad del fluido. Aunque menos preciso que ISO 16889, ISO 4406 sigue siendo útil para propósitos generales de mantenimiento y comparación de fluidos.'
    },
    {
      title: '¿Por qué importa en filtración industrial?',
      content: 'ISO 4406 es importante en filtración industrial porque estableció los principios fundamentales de la codificación de limpieza que la industria sigue utilizando hoy. Fue el primer estándar ampliamente adoptado que permitió a los fabricantes de sistemas de filtración establecer objetivos cuantificables para la limpieza del fluido. Aunque ISO 16889 ha mejorado la precisión con la adición de un tercer dígito de clasificación (para partículas >14µm), los conceptos básicos de ISO 4406 permanecen válidos. Comprender ISO 4406 es esencial para los profesionales de filtración que trabajan con equipos heredados o que necesitan traducir especificaciones antiguas a estándares modernos.'
    },
    {
      title: 'Aplicación en motores y sistemas',
      content: 'En sistemas hidráulicos más antiguos de maquinaria industrial, transmisiones hidráulicas de vehículos de construcción fabricados antes de 2010, y sistemas de aviación heredados, ISO 4406 sigue siendo la especificación de referencia. Un código ISO 4406 típico como 18/16 significa: máximo 1300 partículas mayores a 4 µm y máximo 320 partículas mayores a 6 µm por mililitro. Los operadores de equipos antiguos aún deben verificar regularmente sus fluidos contra estas especificaciones ISO 4406. Para equipos nuevos, aunque la especificación puede originarse en ISO 4406, generalmente se traduce a equivalentes ISO 16889 para una evaluación más precisa (por ejemplo, ISO 4406 18/16 es aproximadamente equivalente a ISO 16889 17/15/12).'
    }
  ];

  const faqs = [
    {
      question: '¿Cómo se relaciona ISO 4406 con ISO 16889?',
      answer: 'ISO 16889 fue desarrollado como una mejora a ISO 4406, añadiendo un tercer nivel de clasificación para partículas mayores a 14 µm, lo que proporciona mayor precisión. ISO 16889 también especifica métodos de conteo más rigurosos. Los códigos ISO 4406 pueden ser aproximadamente convertidos a ISO 16889 (p.ej., 18/16 ≈ 17/15/12), pero no es una conversión exacta. ISO 16889 es ahora el estándar preferido para equipos nuevos, pero ISO 4406 sigue siendo válido y ampliamente utilizado.'
    },
    {
      question: '¿Qué significa el código 19/17 en ISO 4406?',
      answer: 'Un código ISO 4406 19/17 significa que el fluido contiene máximo 2560 partículas mayores a 4 µm por mililitro (19 = 2^19/4 = 2560) y máximo 640 partículas mayores a 6 µm por mililitro (17 = 2^17/4 = 640). Este es un código relativamente "sucio" utilizado para sistemas no críticos o aplicaciones de servicio pesado donde la contaminación se espera y se puede tolerar.'
    },
    {
      question: '¿Todavía se utiliza ISO 4406 en equipos modernos?',
      answer: 'Aunque ISO 16889 es ahora el estándar preferido para especificaciones nuevas, ISO 4406 aún aparece en muchos contextos: equipos OEM más antiguos que aún operan, especificaciones heredadas en manuales de servicio, y en algunos casos se utiliza junto con ISO 16889 para compatibilidad histórica. Los técnicos de filtración modernos deben estar familiarizados con ambos estándares para interpretar especificaciones de una amplia gama de equipos.'
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
            ISO 4406
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Hydraulic Fluid Power — Fluids — Method for assessing the cleanliness of a liquid sample
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
            ¿Qué es ISO 4406?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
          }}>
            ISO 4406 es el estándar internacional que define el método para evaluar la limpieza de muestras líquidas en{' '}
            <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>sistemas de filtración industrial</Link>,
            desarrollado en la década de 1970. Utiliza un código de limpieza de 2-3 dígitos que clasifica la contaminación particularada en un fluido según el número de partículas mayores a 4 µm y 6 µm por cada mililitro. Aunque ha sido ampliamente reemplazado por{' '}
            <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889</Link>{' '}
            en aplicaciones modernas, ISO 4406 sigue siendo un estándar importante en la industria y es fundamental para comprender la historia de la clasificación de limpieza de fluidos hidráulicos. Muchos equipos más antiguos aún especifican sus requisitos de limpieza usando códigos ISO 4406. La contaminación particularada que este estándar cuantifica es la causa primaria del{' '}
            <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>desgaste abrasivo en motores y componentes hidráulicos</Link>.
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
        <p>SEMANTIC_DOMAINS: Contamination Control Systems [PRIMARY]</p>
        <p>SYSTEMS_AFFECTED: lube, hydraulic, fuel, transmission</p>
        <p>CONCEPT_TAXONOMY: type=standard | domain=contamination-measurement | standards=ISO-4406, ISO-16889</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406, ASTM D7085</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: NANOFORCE, SYNTRAX</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/iso-4406</p>
        <p>&nbsp;&nbsp;concept_id: iso-4406-cleanliness-codes</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-06-11</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'ISO 4406 — Fluid Cleanliness Classification Standard',
        description: 'ISO 4406 establishes a particle count classification system for hydraulic and lube oil fluids using a two-number code representing particle concentrations at 4µm and 6µm thresholds. Predecessor to ISO 16889, widely referenced in legacy equipment specifications.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['ISO 4406', 'fluid cleanliness code', 'hydraulic oil cleanliness', 'particle count classification', 'contamination measurement', 'ISO 16889', 'industrial filtration'],
        about: { '@type': 'Thing', name: 'ISO 4406 Cleanliness Codes', description: 'International standard for classifying hydraulic and lube oil fluid cleanliness using particle count codes at defined size thresholds.' },
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
          { '@type': 'ListItem', position: 4, name: 'ISO 4406', item: 'https://elimfilters.com/knowledge-system/standards/iso-4406' },
        ],
      }) }} />
    </main>
  );
}
