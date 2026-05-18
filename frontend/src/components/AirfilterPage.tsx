'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

export function AirfilterPage() {
  return (
    <>
      <Navigation />
      <main style={{ background: '#000', color: '#fff' }}>
        {/* Hero Section */}
        <section
          style={{
            marginTop: '72px',
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: 'url(/images/air-filterld.avif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
              zIndex: 1,
            }}
          />

          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 2rem',
              width: '100%',
            }}
          >
            <div style={{ marginBottom: '2rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#FFF12D',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                // AIR INTAKE FILTRATION
              </span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                fontWeight: 900,
                fontFamily: 'Space Grotesk, sans-serif',
                marginBottom: '1rem',
                lineHeight: 1.1,
              }}
            >
              AIRFILTER
            </h1>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif',
                color: '#FFF12D',
                marginBottom: '2rem',
              }}
            >
              MACROCORE™ DEFENSE
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                maxWidth: '600px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Advanced gradient density engineering for absolute air intake protection across all industrial sectors.
            </p>
          </div>
        </section>

        {/* Media Filtrante Airfilter - Descripción */}
        <section
          style={{
            padding: '6rem 2rem',
            background: '#000',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                  <h2
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      color: '#FFF12D',
                      fontFamily: 'JetBrains Mono, monospace',
                      margin: 0,
                    }}
                  >
                    MEDIA FILTRANTE AIRFILTER
                  </h2>
                </div>
                <h3
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '1.5rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  Ingeniería de Filtración Avanzada
                </h3>
                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: '2.5rem',
                  }}
                >
                  AIRFILTER es una media filtrante de alto rendimiento desarrollada bajo los principios de gradiente de densidad progresiva. Utiliza fibras de celulosa de alta pureza reforzadas con resinas sintéticas para garantizar:
                </p>

                {/* Horizontal Specifications */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      CONSTRUCCIÓN
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      Celulosa de Alta Pureza
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      REFUERZO
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      Resinas Sintéticas Estructurales
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em', margin: 0, marginBottom: '0.5rem' }}>
                      MATRIZ
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      Gradiente de Densidad Progresiva
                    </p>
                  </div>
                </div>
              </div>
              {/* Product Image */}
              <div
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,241,45,0.2)',
                  width: '250px',
                  height: '250px',
                  marginTop: '10%',
                  marginLeft: '35%',
                }}
              >
                <img
                  src="/images/air-filter1.avif"
                  alt="AIRFILTER Product"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tecnología MACROCORE™ */}
        <section
          style={{
            padding: '6rem 2rem',
            background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.4) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#FFF12D',
                  fontFamily: 'JetBrains Mono, monospace',
                  margin: 0,
                }}
              >
                TECNOLOGÍA INTEGRADA
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              <div>
                <h3
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '2rem',
                    color: '#FFF12D',
                  }}
                >
                  MACROCORE™
                </h3>
                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.85)',
                    marginBottom: '2rem',
                  }}
                >
                  AIRFILTER implementa el sistema Progressive Density Gradient (PDG) patentado por ELIMFILTERS, conocido como MACROCORE™.
                </p>
                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.75)',
                    marginBottom: '2rem',
                    fontStyle: 'italic',
                  }}
                >
                  "MACROCORE™ no es una media filtrante estática; es un sistema de ingeniería de materiales que adapta la densidad de fibras para optimizar la captura de contaminantes de diferentes tamaños."
                </p>
                <Link
                  href="/technologies/macrocore"
                  style={{
                    display: 'inline-block',
                    background: '#FFF12D',
                    color: '#000',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    letterSpacing: '0.1em',
                    padding: '1rem 2.5rem',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E6DB1F';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFF12D';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  EXPLORAR MACROCORE™ →
                </Link>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255,241,45,0.15) 0%, rgba(0,0,0,0.5) 100%)',
                  border: '2px solid rgba(255,241,45,0.3)',
                  borderRadius: '12px',
                  padding: '3rem',
                  textAlign: 'center',
                }}
              >
                <h4
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                    fontFamily: 'JetBrains Mono, monospace',
                    marginBottom: '2rem',
                  }}
                >
                  MECANISMO DE CAPTURA
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  <div>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: '#FFF12D',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                      }}
                    >
                      CAPA EXTERNA
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                      Retención de macro-contaminantes
                    </p>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255,241,45,0.2)' }} />
                  <div>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: '#FFF12D',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                      }}
                    >
                      MATRIZ INTERNA
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                      Captura de sub-micrónicos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Aplicaciones */}
        <section
          style={{
            padding: '6rem 2rem',
            background: '#000',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#FFF12D',
                  fontFamily: 'JetBrains Mono, monospace',
                  margin: 0,
                }}
              >
                APLICACIONES INDUSTRIALES
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
              }}
            >
              {[
                {
                  title: 'TRANSPORTE',
                  desc: 'Vehículos de carga, pasajeros y utilitarios. Protección de turbocompresores y optimización de consumo.',
                },
                {
                  title: 'EQUIPO PESADO',
                  desc: 'Excavadoras, camiones mineros, maquinaria vial. Defensa contra sílice y polvo en ambientes extremos.',
                },
                {
                  title: 'GENERACIÓN ENERGÉTICA',
                  desc: 'Plantas eléctricas estacionarias y compresores industriales. Estabilidad crítica de flujo de aire.',
                },
                {
                  title: 'AGRICULTURA',
                  desc: 'Tractores y cosechadoras. Extensión de intervalos de servicio en temporadas de alta demanda.',
                },
                {
                  title: 'MINERÍA',
                  desc: 'Protección de motores de gran cilindrada bajo condiciones de polvo masivo y contaminación.',
                },
                {
                  title: 'CONSTRUCCIÓN',
                  desc: 'Maquinaria pesada en 24/7 duty cycles. Resistencia a polvo mineral y presiones pulsantes.',
                },
              ].map((app, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.2) 100%)',
                    border: '1px solid rgba(255,241,45,0.2)',
                    borderRadius: '8px',
                    padding: '2rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: '#FFF12D',
                      marginBottom: '1rem',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {app.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
                    {app.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Especificaciones Técnicas */}
        <section
          style={{
            padding: '6rem 2rem',
            background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, rgba(0,0,0,0.3) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#FFF12D',
                  fontFamily: 'JetBrains Mono, monospace',
                  margin: 0,
                }}
              >
                ESPECIFICACIONES TÉCNICAS
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
              }}
            >
              {[
                { label: 'EFICIENCIA', value: '99.9% - 99.98%', norm: 'ISO 5011' },
                { label: 'PRESIÓN NOMINAL', value: '62 PSI', norm: 'Anti-collapse Rated' },
                { label: 'TEMPERATURA', value: '120°C Continuo', norm: 'ASTM D202' },
                { label: 'CAPACIDAD DHC', value: 'Optimizada', norm: 'SAE J726' },
                { label: 'DELTA P INICIAL', value: 'Minimizado', norm: 'Flujo Laminar' },
                { label: 'MECANISMO', value: 'Intercepción + Impacto + Difusión', norm: 'Multi-modo' },
              ].map((spec, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid rgba(255,241,45,0.2)',
                    borderRadius: '8px',
                    padding: '2rem',
                    background: '#000',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      color: '#FFF12D',
                      marginBottom: '1rem',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {spec.label}
                  </p>
                  <p
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.9)',
                      marginBottom: '0.5rem',
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  >
                    {spec.value}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                    {spec.norm}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            padding: '6rem 2rem',
            background: '#FFF12D',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: '#000',
                marginBottom: '1rem',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              Ready to Deploy AIRFILTER?
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: '#000',
                marginBottom: '2rem',
                lineHeight: 1.6,
              }}
            >
              Identify your SKU. Cross-reference 500,000+ parts. Find your perfect air filtration solution now.
            </p>
            <a
              href="https://part-search.elimfilters.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#000',
                color: '#FFF12D',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                padding: '1.2rem 3rem',
                textDecoration: 'none',
                borderRadius: '4px',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#111';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000';
                e.currentTarget.style.transform = 'none';
              }}
            >
              IDENTIFY SKU →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
