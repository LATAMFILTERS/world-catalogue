'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const ANALYSIS_STEPS = [
  {
    number: 1,
    title: 'Identificar a los Competidores',
    description: 'Determinar quiénes son rivales directos e indirectos',
    tactics: [
      'Búsqueda activa en motores de búsqueda por categoría',
      'Monitoreo de redes sociales y hashtags relevantes',
      'Crear lista de hasta 10 competidores principales',
      'Clasificar por nivel de competencia (directos/indirectos)'
    ]
  },
  {
    number: 2,
    title: 'Analizar Estructuras Comerciales',
    description: 'Investigar cómo están organizadas las empresas competidoras',
    tactics: [
      'Revisar perfiles públicos: sitios web, redes sociales',
      'Analizar tamaño de empresa, antigüedad, áreas de expansión',
      'Consultar informes anuales (empresas públicas)',
      'Revisar ingresos, deuda, métricas de rendimiento'
    ]
  },
  {
    number: 3,
    title: 'Evaluar Propuestas de Valor y Precios',
    description: 'Entender qué ofrecen exactamente y a qué precio',
    tactics: [
      'Analizar secciones "Sobre nosotros" y blogs',
      'Identificar problemas que resuelven',
      'Documentar beneficios prometidos',
      'Determinar modelo de precios utilizado'
    ]
  },
  {
    number: 4,
    title: 'Evaluar Esfuerzos de Marketing',
    description: 'Observar comunicación y canales preferidos',
    tactics: [
      'Identificar canales: influencers, afiliados, publicidad',
      'Analizar tipos de contenido: videos, eBooks, informes',
      'Monitorear cambios en mensajes publicitarios',
      'Evaluar cobertura mediática y PR'
    ]
  },
  {
    number: 5,
    title: 'Auditar Identidad de Marca',
    description: 'Analizar personalidad y conexión emocional con audiencia',
    tactics: [
      'Describir personalidad de marca (como si fuera persona)',
      'Identificar estilo de mensaje y valores comunicados',
      'Evaluar elementos visuales y diseño',
      'Analizar alineación visual con voz de marca'
    ]
  },
  {
    number: 6,
    title: 'Seguir el Customer Journey',
    description: 'Experimentar de primera mano la experiencia del cliente',
    tactics: [
      'Suscribirse a newsletters y comunicaciones',
      'Realizar compras para evaluar proceso',
      'Evaluar soporte al cliente y experiencia post-compra',
      'Identificar puntos de fricción en el journey'
    ]
  },
  {
    number: 7,
    title: 'Examinar Compromiso y Reputación',
    description: 'Investigar percepción pública y satisfacción de stakeholders',
    tactics: [
      'Revisar reseñas de clientes en múltiples plataformas',
      'Monitorear menciones en redes sociales',
      'Consultar opiniones de empleados (Glassdoor, etc.)',
      'Medir Share of Voice vs tu marca'
    ]
  },
  {
    number: 8,
    title: 'Realizar Análisis DAFO (SWOT)',
    description: 'Consolidar información en matriz estratégica',
    tactics: [
      'Mapear Debilidades de competidor',
      'Mapear Amenazas que representan',
      'Mapear Fortalezas de competidor',
      'Mapear Oportunidades para capitalizar'
    ]
  }
];

const TOOLS_AND_METHODS = [
  {
    category: 'Propiedad Intelectual',
    description: 'Identificar planes de innovación futuros',
    items: [
      'Boletines de propiedad industrial (SAPI)',
      'Registros de marcas y lemas',
      'Patentes registradas',
      'Planes de expansión (nuevos territorios/categorías)'
    ]
  },
  {
    category: 'Matrices de Posicionamiento',
    description: 'Visualizar posicionamiento competitivo relativo',
    items: [
      'Matriz de competidores (2D: factores clave)',
      'Calificar por precio, servicio, conveniencia',
      'Asignar peso relativo a cada factor',
      'Identificar espacios sin explotar en mercado'
    ]
  },
  {
    category: 'Modelos Estratégicos Avanzados',
    description: 'Análisis estructural de industria',
    items: [
      'Cinco Fuerzas de Porter (rivalidad, proveedores, clientes, sustitutos, entrantes)',
      'Análisis PESTEL (Político, Económico, Social, Tecnológico, Ambiental, Legal)',
      'Análisis de cadena de valor',
      'Mapeo de ecosistema de valor'
    ]
  }
];

export default function CompetitiveAnalysisFrameworkPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Navigation */}
      <Link
        href="/knowledge-system/market"
        style={{
          display: 'inline-block',
          margin: '2rem',
          color: '#FFF12D',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        ← MARKET ANALYSIS
      </Link>

      {/* Hero */}
      <section
        style={{
          padding: 'clamp(2rem, 5vw, 4rem)',
          background: 'linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(255,241,45,0.05) 100%)',
          borderBottom: '2px solid rgba(255,241,45,0.15)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,241,45,0.7)', marginBottom: '1rem' }}>
            // MARKET METHODOLOGY · COMPETITIVE ANALYSIS
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              margin: '0 0 1rem 0',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.2,
            }}
          >
            Framework: Análisis Competitivo Sistemático
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '700px',
              lineHeight: 1.6,
            }}
          >
            Metodología paso a paso para evaluar el panorama competitivo desde múltiples dimensiones y desarrollar estrategia de diferenciación basada en datos.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 2rem' }}>

        {/* Point 2: Context */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            02 / Industrial Context
          </p>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'justify',
            }}
          >
            Industrial procurement teams, marketing strategists, and business development managers face recurring decisions about competitive positioning. Understanding competitor capabilities, market dynamics, and differentiation opportunities requires systematic evaluation across multiple dimensions. Ad-hoc competitive research produces incomplete pictures and missed opportunities. Structured analysis frameworks enable data-driven strategy, efficient resource allocation, and confident market positioning decisions.
          </p>
        </motion.section>

        {/* Point 3-8: The 8-Step Framework */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            03-08 / 8-Step Competitive Analysis Framework
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {ANALYSIS_STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + idx * 0.08 }}
                style={{
                  background: 'rgba(255,241,45,0.02)',
                  border: '1px solid rgba(255,241,45,0.12)',
                  borderRadius: '8px',
                  padding: '2rem',
                  borderLeft: '4px solid rgba(255,241,45,0.4)',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      minWidth: '40px',
                      height: '40px',
                      background: '#FFF12D',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {step.number}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        margin: '0 0 0.3rem 0',
                        color: '#fff',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255,241,45,0.8)',
                        margin: 0,
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                <ul
                  style={{
                    margin: '1rem 0 0 0',
                    paddingLeft: '1.5rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.9rem',
                  }}
                >
                  {step.tactics.map((tactic, tidx) => (
                    <li key={tidx} style={{ marginBottom: '0.4rem' }}>
                      {tactic}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Point 9: Tools & Methods */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            09 / Advanced Tools & Analytical Methods
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {TOOLS_AND_METHODS.map((tool, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                style={{
                  background: 'rgba(255,241,45,0.03)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                }}
              >
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    color: '#FFF12D',
                    textTransform: 'uppercase',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  {tool.category}
                </p>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 600,
                    margin: '0 0 1rem 0',
                  }}
                >
                  {tool.description}
                </p>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '1.2rem',
                    lineHeight: 1.6,
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  {tool.items.map((item, itemIdx) => (
                    <li key={itemIdx} style={{ marginBottom: '0.3rem' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Implementation Checklist */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          style={{
            background: 'rgba(255,241,45,0.05)',
            border: '2px solid rgba(255,241,45,0.2)',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '3rem',
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Implementation Checklist
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              { label: 'Identify 5-10 primary competitors', phase: 'Week 1' },
              { label: 'Analyze business structures and financials', phase: 'Week 1-2' },
              { label: 'Document value propositions and pricing', phase: 'Week 2' },
              { label: 'Map marketing channels and tactics', phase: 'Week 2-3' },
              { label: 'Audit brand identity and messaging', phase: 'Week 3' },
              { label: 'Execute customer journey mapping', phase: 'Week 3-4' },
              { label: 'Research reputation and engagement', phase: 'Week 4' },
              { label: 'Consolidate SWOT analysis', phase: 'Week 4-5' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,241,45,0.1)',
                  padding: '1rem',
                  borderRadius: '4px',
                }}
              >
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: '0 0 0.3rem 0' }}>
                  ☐ {item.label}
                </p>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,241,45,0.7)',
                    margin: 0,
                  }}
                >
                  {item.phase}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Related Knowledge Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            09 / Related Market Analysis Resources
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              { text: 'Competitive Intelligence Analysis', href: '/knowledge-system/market/competitive-intelligence/' },
              { text: 'Market Projections 2026-2031', href: '/knowledge-center/' },
              { text: 'Total Cost of Ownership Strategy', href: '/knowledge-center/fleet-optimization/total-cost-ownership/' },
              { text: 'Technology Differentiation', href: '/technologies/' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,241,45,0.05)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#FFF12D',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                }}
              >
                ↗ {link.text}
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Canonical Knowledge Block */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          style={{
            background: 'rgba(255,241,45,0.05)',
            border: '2px solid rgba(255,241,45,0.25)',
            borderRadius: '8px',
            padding: '2rem',
            marginTop: '4rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
          }}
        >
          <h3 style={{ color: '#FFF12D', marginBottom: '1rem' }}>
            CANONICAL KNOWLEDGE BLOCK: Competitive Analysis Framework
          </h3>

          <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
            <p>
              <strong>DEFINITION</strong><br />
              Systematic competitive analysis framework comprising 8 sequential steps plus advanced analytical tools, designed to evaluate competitor capabilities, market positioning, and differentiation opportunities across multiple strategic dimensions.
            </p>

            <p>
              <strong>INDUSTRIAL_ROLE</strong><br />
              Enables market-facing teams (business development, procurement, marketing, strategy) to make informed competitive positioning decisions based on structured data rather than intuition, reducing risk of market misreads and optimizing resource allocation toward defensible differentiation.
            </p>

            <p>
              <strong>CITATION_REFERENCE</strong><br />
              source: elimfilters.com/knowledge-system/market/competitive-analysis-framework/<br />
              concept: 8-Step Systematic Competitive Analysis Methodology<br />
              version: 1.0<br />
              last_updated: 2026-08-03
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
