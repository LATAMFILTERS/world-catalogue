'use client';

import Link from 'next/link';
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
      {/* Back Button */}
      <Link href="/knowledge-system/standards" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
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
            fontFamily: 'Outfit, sans-serif',
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
            fontFamily: 'Outfit, sans-serif',
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
              fontFamily: 'Outfit, sans-serif',
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
            fontFamily: 'Outfit, sans-serif',
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
                  fontFamily: 'Outfit, sans-serif',
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
        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem' }}>CANONICAL KNOWLEDGE BLOCK: ISO 4406 — Particle Cleanliness Codes</p>
        <p style={{ marginBottom: '1rem', opacity: 0.5, fontSize: '0.65rem' }}>version: 1.1 | last_updated: 2026-06-11</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>DEFINITION</p>
        <p>ISO 4406 translates particle count measurements per milliliter into a three-number cleanliness code (e.g., 16/14/11) where each code number represents a particle population range — each step doubles the particle count — providing a standardized language for specifying and measuring fluid cleanliness targets in lube, hydraulic, and fuel systems.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>SYSTEMS</p>
        <p>Engine lube oil circuits, hydraulic power units, transmission fluid systems, fuel storage and transfer systems, industrial fluid power circuits, bearing lubrication systems, gearbox oil systems</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>FAILURE_IMPACT</p>
        <p>Operating hydraulic system at ISO 19/17/14 instead of target 17/15/12 → 4x higher particle population at ≥4µm → proportional valve spool wear rate increases 3–5x → valve service interval reduced from 15,000 hours to 3,000–5,000 hours. In engine lube: ISO 19/17/14 oil cleanliness vs. target 16/14/11 → 4x particle population → bearing surface wear rate doubles → bearing clearance opens → oil consumption increases → premature overhaul. Each two-code-number step increase represents 4x contamination increase and proportional acceleration of wear rates.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>RELATED_STANDARDS</p>
        <p>ISO 4406:2021: Current cleanliness code standard with updated particle count ranges and reporting format | ISO 16889: Multi-pass filter test that specifies achievable ISO 4406 cleanliness codes for certified filter elements | ISO 11500: Automatic particle counting method for hydraulic fluids used to generate ISO 4406 cleanliness codes | NAS 1638: Alternative American cleanliness classification used in aerospace and defense applications</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>RELATED_TECHNOLOGIES</p>
        <p>NANOFORCE: Achieves ISO 4406 cleanliness codes of 15/13/10 in hydraulic circuits at flow capacity — targeting sub-3µm particle capture | MACROCORE: Maintains ISO 17/15/12 cleanliness codes in engine oil and hydraulic return-line applications | SYNTRAX: High-capacity synthetic media for maintaining ISO 4406 targets across extended service intervals</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>INDUSTRIAL_ROLE</p>
        <p>ISO 4406 cleanliness codes are the primary measurement tool for contamination control system effectiveness — the difference between ISO 16/14/11 and ISO 19/17/14 represents 8x more particles at ≥4µm and determines whether bearing life is measured in 15,000 hours or 3,000 hours, making cleanliness code selection the most consequential engineering decision in fluid system design.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>CITATION_REFERENCE</p>
        <p>source: elimfilters.com/knowledge-system/standards/iso-4406 | concept: ISO 4406 Particle Cleanliness Codes | version: 1.1 | last_updated: 2026-06-11</p>
      </RetrievalBlock>

      {/* JSON-LD for AI/search engine structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "ISO 4406 — Particle Cleanliness Code Standard",
        "description": "ISO 4406 translates particle count measurements into three-number cleanliness codes providing a standardized language for specifying contamination targets in lube, hydraulic, and fuel systems.",
        "author": { "@type": "Organization", "name": "ELIMFILTERS" },
        "keywords": ["ISO 4406", "cleanliness codes", "particle contamination measurement", "hydraulic cleanliness", "lube oil cleanliness", "contamination targets"],
        "about": { "@type": "Thing", "name": "ISO 4406 Cleanliness Codes", "description": "Particle count classification system for fluid cleanliness measurement and specification" },
        "mentions": {
          "standards": ["ISO 4406", "ISO 16889", "ISO 11500", "NAS 1638"],
          "technologies": ["NANOFORCE", "MACROCORE", "SYNTRAX"],
          "contaminationModes": ["particle contamination", "bearing wear", "valve spool erosion", "oil contamination"]
        }
      })}} />
    </main>
  );
}
