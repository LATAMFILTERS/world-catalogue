'use client';

import Link from 'next/link';

export function AirfilterPage() {
  return (
    <>
      {/* HOME Button */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '2rem', zIndex: 100 }}>
        <Link
          href="/"
          style={{
            background: '#FFF12D',
            color: '#000',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            padding: '0.6rem 1.5rem',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          HOME
        </Link>
      </div>
      <main style={{ background: '#000', color: '#fff' }}>
        {/* Hero Section */}
        <section
          style={{
            marginTop: 0,
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
              FILTROS DE AIRE
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
              TECNOLOGÍA MACROCORE™
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
              Protección absoluta del sistema de admisión en motores de combustión interna y maquinaria rotativa. Ingeniería de gradiente de densidad progresiva para todos los sectores industriales.
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
                    FILTROS DE AIRE — AIR FILTERS
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
                  Protección Total del Sistema de Admisión
                </h3>
                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: '2.5rem',
                  }}
                >
                  Los filtros de aire ELIMFILTERS son medias filtrantes de alto rendimiento desarrolladas bajo los principios de gradiente de densidad progresiva. Utilizan fibras de celulosa de alta pureza reforzadas con resinas sintéticas para garantizar protección absoluta del sistema de admisión en motores de combustión interna y maquinaria rotativa.
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
                  width: '340px',
                  height: '340px',
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

        {/* Rendimiento Comprobado en Campo */}
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
                RENDIMIENTO COMPROBADO EN CAMPO
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem',
              }}
            >
              <div
                style={{
                  border: '1px solid rgba(255,241,45,0.2)',
                  borderRadius: '12px',
                  padding: '2.5rem',
                  background: '#000',
                }}
              >
                <h3
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#FFF12D',
                    margin: '0 0 1rem 0',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  +45%
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: 'rgba(255,255,255,0.9)',
                    margin: 0,
                  }}
                >
                  EXTENSIÓN DE INTERVALOS
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                  Períodos de servicio ampliados comparado con estándares industriales
                </p>
              </div>

              <div
                style={{
                  border: '1px solid rgba(255,241,45,0.2)',
                  borderRadius: '12px',
                  padding: '2.5rem',
                  background: '#000',
                }}
              >
                <h3
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#FFF12D',
                    margin: '0 0 1rem 0',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  -60%
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: 'rgba(255,255,255,0.9)',
                    margin: 0,
                  }}
                >
                  REDUCCIÓN DE DOWNTIME
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                  Menos paradas no programadas en operaciones críticas
                </p>
              </div>

              <div
                style={{
                  border: '1px solid rgba(255,241,45,0.2)',
                  borderRadius: '12px',
                  padding: '2.5rem',
                  background: '#000',
                }}
              >
                <h3
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#FFF12D',
                    margin: '0 0 1rem 0',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  99.9%
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: 'rgba(255,255,255,0.9)',
                    margin: 0,
                  }}
                >
                  EFICIENCIA DE CAPTURA
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                  Protección probada en condiciones extremas de operación
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.7,
                  maxWidth: '800px',
                  margin: '0 auto 2rem auto',
                }}
              >
                Resultados verificados en operaciones de transporte, minería, construcción y generación de energía.
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
    </>
  );
}
