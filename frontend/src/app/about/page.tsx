'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const METHOD_STEPS = [
  { num: '01', label: 'PROBLEMA', desc: 'Comprender qué está ocurriendo y qué mecanismo lo provoca.' },
  { num: '02', label: 'SISTEMA', desc: 'Identificar qué sistema crítico está siendo afectado.' },
  { num: '03', label: 'TECNOLOGÍA', desc: 'Seleccionar la tecnología que controla ese mecanismo específico.' },
  { num: '04', label: 'SOLUCIÓN', desc: 'Diseñar la estrategia de protección para ese entorno operacional.' },
  { num: '05', label: 'PRODUCTO', desc: 'Implementar el componente correcto como resultado del proceso anterior.' },
];

const COST_CHAIN = [
  { label: 'Tiempos de inactividad', detail: 'La operación se detiene mientras se diagnostica y repara.' },
  { label: 'Pérdida de productividad', detail: 'Cada hora de equipo parado representa producción no recuperada.' },
  { label: 'Consumo adicional de recursos', detail: 'Repuestos, mano de obra, logística de emergencia.' },
  { label: 'Riesgo de continuidad', detail: 'Interrupciones repetidas comprometen contratos y operaciones.' },
];

const CONTRASTS = [
  { industry: 'La industria reacciona.', elimfilters: 'ELIMFILTERS anticipa.' },
  { industry: 'La industria reemplaza.', elimfilters: 'ELIMFILTERS analiza causas.' },
  { industry: 'La industria observa consecuencias.', elimfilters: 'ELIMFILTERS estudia mecanismos.' },
  { industry: 'La industria vende productos.', elimfilters: 'ELIMFILTERS desarrolla soluciones.' },
];

export default function About() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <section style={{
        marginTop: 0,
        paddingTop: 'clamp(5rem, 12vw, 8rem)',
        paddingBottom: 'clamp(4rem, 8vw, 6rem)',
        backgroundImage:
          'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.78) 55%, rgba(0,0,0,1) 100%), url(/images/grupo-filters.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(1.25rem,5vw,2rem)' }}>
          <motion.div variants={stagger} initial="hidden" animate="visible">

            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'block', fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.25em', color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.75rem',
              }}
            >
              // ABOUT ELIMFILTERS®
            </motion.span>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(2.2rem, 6vw, 4.2rem)',
                fontWeight: 900,
                fontFamily: 'Space Grotesk, sans-serif',
                marginBottom: '1.5rem',
                lineHeight: 1.05,
                color: '#fff',
                maxWidth: '820px',
              }}
            >
              LA CONTAMINACIÓN ES UNA CAUSA.
              <br />
              <span style={{ color: '#FFF12D' }}>NO UNA CONSECUENCIA.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.1rem)', lineHeight: 1.75,
                color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit, sans-serif',
                maxWidth: '660px', borderLeft: '3px solid #FFF12D', paddingLeft: '1.25rem',
              }}
            >
              Toda operación depende de activos. La contaminación los amenaza
              de forma continua, silenciosa y progresiva. ELIMFILTERS® existe para
              controlarla antes de que genere consecuencias.
            </motion.p>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '0.8rem', lineHeight: 1.6,
                color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif',
                maxWidth: '660px', marginTop: '1.75rem',
              }}
            >
              ELIMFILTERS® is an asset protection engineering brand. Technologies developed by Kleo Technologies.
            </motion.p>

          </motion.div>
        </div>
      </section>

      {/* ── 01 — EL ORIGEN DE UNA CONVICCIÓN ── */}
      <section style={{ padding: 'clamp(4rem,8vw,6rem) clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{
              display: 'block', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.22em', color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem',
            }}
          >
            01 / EL ORIGEN DE UNA CONVICCIÓN
          </motion.span>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(2rem,5vw,4rem)',
            alignItems: 'start',
          }}>
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 900,
                fontFamily: 'Space Grotesk, sans-serif',
                marginBottom: '1.5rem', lineHeight: 1.15,
              }}>
                LA FALLA NO DEBE SER EL PUNTO DE PARTIDA.
              </h2>
              <p style={{
                fontSize: '1rem', lineHeight: 1.8,
                color: 'rgba(255,255,255,0.72)', fontFamily: 'Outfit, sans-serif',
                marginBottom: '1.25rem',
              }}>
                La mayoría de las organizaciones reaccionan cuando la falla ya ocurrió.
                ELIMFILTERS® nace bajo una filosofía diferente: la contaminación no debe
                gestionarse después de que destruye un sistema. Debe ser controlada
                antes de que genere consecuencias.
              </p>
              <p style={{
                fontSize: '1rem', lineHeight: 1.8,
                color: 'rgba(255,255,255,0.72)', fontFamily: 'Outfit, sans-serif',
              }}>
                Una bomba dañada no comenzó siendo una bomba dañada. Un inyector
                desgastado no comenzó siendo un inyector desgastado. Antes de la falla
                visible existe un proceso progresivo de degradación — generalmente
                asociado a contaminantes que alteran las condiciones normales de operación.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {[
                { icon: '◆', text: 'Partículas microscópicas ingresan continuamente a sistemas críticos.' },
                { icon: '◆', text: 'El agua y la humedad degradan fluidos y componentes de precisión.' },
                { icon: '◆', text: 'Los residuos metálicos aceleran el desgaste de superficies en movimiento.' },
                { icon: '◆', text: 'El daño se desarrolla de forma gradual y silenciosa hasta la falla visible.' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                  background: 'rgba(255,241,45,0.04)',
                  border: '1px solid rgba(255,241,45,0.1)',
                  borderRadius: '6px', padding: '1rem 1.25rem',
                }}>
                  <span style={{ color: '#FFF12D', fontSize: '0.6rem', marginTop: '0.3rem', flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── 02 — EL COSTO REAL ── */}
      <section style={{
        padding: 'clamp(4rem,8vw,6rem) clamp(1.25rem,5vw,2rem)',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.025) 0%, transparent 100%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{
              display: 'block', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.22em', color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem',
            }}
          >
            02 / EL COSTO REAL DEL PROBLEMA
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1rem', lineHeight: 1.2, maxWidth: '700px',
            }}
          >
            EL COSTO DE UNA FALLA VA MÁS ALLÁ DEL COMPONENTE QUE SE REEMPLAZA.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: '1rem', lineHeight: 1.8,
              color: 'rgba(255,255,255,0.68)', fontFamily: 'Outfit, sans-serif',
              maxWidth: '680px', marginBottom: '3rem',
            }}
          >
            La mayoría de las organizaciones calculan el costo de una falla observando
            únicamente el componente que debe reemplazarse. Ese enfoque es incompleto.
            Cuando un sistema falla, los costos asociados se extienden mucho más allá.
          </motion.p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}>
            {COST_CHAIN.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ borderColor: 'rgba(255,241,45,0.3)', y: -3 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '8px', padding: '1.75rem',
                }}
              >
                <div style={{
                  fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace',
                  color: '#FFF12D', letterSpacing: '0.12em', marginBottom: '0.75rem',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 style={{
                  fontSize: '0.95rem', fontWeight: 700,
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: '#fff', marginBottom: '0.75rem',
                }}>
                  {item.label}
                </h3>
                <p style={{
                  fontSize: '0.85rem', lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit, sans-serif', margin: 0,
                }}>
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              fontSize: '1rem', lineHeight: 1.8,
              color: 'rgba(255,255,255,0.68)', fontFamily: 'Outfit, sans-serif',
              maxWidth: '680px', marginTop: '2.5rem',
              borderLeft: '3px solid rgba(255,241,45,0.4)', paddingLeft: '1.25rem',
            }}
          >
            Por esta razón, controlar la contaminación no debe considerarse un gasto operativo.
            Debe considerarse una decisión orientada a preservar la confiabilidad y la
            productividad de la operación. La prevención siempre cuesta menos que la falla que evita.
          </motion.p>

        </div>
      </section>

      {/* ── 03 — NUESTRA FORMA DE ANALIZAR ── */}
      <section style={{ padding: 'clamp(4rem,8vw,6rem) clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{
              display: 'block', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.22em', color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem',
            }}
          >
            03 / LA FORMA ELIMFILTERS DE ANALIZAR UN PROBLEMA
          </motion.span>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(2rem,5vw,4rem)',
            alignItems: 'center',
          }}>

            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900,
                fontFamily: 'Space Grotesk, sans-serif',
                marginBottom: '1.25rem', lineHeight: 1.15,
              }}>
                LA INDUSTRIA EMPIEZA CON EL PRODUCTO.
                <br />
                <span style={{ color: '#FFF12D' }}>ELIMFILTERS EMPIEZA CON EL PROBLEMA.</span>
              </h2>
              <p style={{
                fontSize: '1rem', lineHeight: 1.8,
                color: 'rgba(255,255,255,0.68)', fontFamily: 'Outfit, sans-serif',
              }}>
                Antes de recomendar una referencia específica es necesario comprender
                qué está ocurriendo, qué sistema está siendo afectado y qué mecanismo
                está provocando la degradación. Cuando el problema se entiende
                correctamente, la selección de la solución deja de ser una suposición
                y se convierte en una decisión fundamentada.
              </p>
            </motion.div>

            {/* Method flow */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
            >
              {METHOD_STEPS.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
                  {/* connector line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: i === 0 ? '#FFF12D' : 'rgba(255,241,45,0.12)',
                      border: '1px solid rgba(255,241,45,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
                      color: i === 0 ? '#000' : '#FFF12D', fontWeight: 700, flexShrink: 0,
                    }}>
                      {step.num}
                    </div>
                    {i < METHOD_STEPS.length - 1 && (
                      <div style={{ width: '1px', flexGrow: 1, background: 'rgba(255,241,45,0.15)', minHeight: '1.5rem' }} />
                    )}
                  </div>
                  {/* content */}
                  <div style={{ paddingBottom: i < METHOD_STEPS.length - 1 ? '1rem' : '0', paddingTop: '0.35rem' }}>
                    <div style={{
                      fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                      color: '#FFF12D', letterSpacing: '0.18em', marginBottom: '0.25rem',
                    }}>
                      {step.label}
                    </div>
                    <p style={{
                      fontSize: '0.87rem', lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif', margin: 0,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 04 — DIFERENCIA DE PENSAMIENTO ── */}
      <section style={{
        padding: 'clamp(4rem,8vw,6rem) clamp(1.25rem,5vw,2rem)',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.03) 0%, transparent 100%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{
              display: 'block', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.22em', color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem',
            }}
          >
            04 / LA FILOSOFÍA ELIMFILTERS
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65 }}
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '2.5rem', lineHeight: 1.15,
              maxWidth: '680px',
            }}
          >
            ESTA DIFERENCIA DE PENSAMIENTO DEFINE LA IDENTIDAD DE LA ORGANIZACIÓN.
          </motion.h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginBottom: '3.5rem',
          }}>
            {CONTRASTS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  <p style={{
                    fontSize: '0.83rem', lineHeight: 1.5,
                    color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif',
                    margin: 0, textDecoration: 'line-through',
                  }}>
                    {item.industry}
                  </p>
                </div>
                <div style={{ padding: '1rem 1.25rem' }}>
                  <p style={{
                    fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 600,
                    color: '#FFF12D', fontFamily: 'Outfit, sans-serif', margin: 0,
                  }}>
                    {item.elimfilters}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 05 — DECLARACIÓN FUNDACIONAL ── */}
      <section style={{ padding: 'clamp(4rem,8vw,6rem) clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>

          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{
              display: 'block', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.22em', color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: '2rem',
            }}
          >
            05 / DECLARACIÓN FUNDACIONAL
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'rgba(255,241,45,0.04)',
              border: '1px solid rgba(255,241,45,0.18)',
              borderRadius: '12px',
              padding: 'clamp(2rem,5vw,3.5rem)',
              marginBottom: '3rem',
            }}
          >
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', lineHeight: 1.8,
              color: 'rgba(255,255,255,0.85)', fontFamily: 'Outfit, sans-serif',
              marginBottom: '1.75rem',
            }}>
              Nuestra misión no es comercializar componentes.
            </p>
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', lineHeight: 1.8,
              color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              marginBottom: '1.75rem',
            }}>
              Nuestra misión es controlar los mecanismos que aceleran la degradación
              de los sistemas críticos y aumentar la confiabilidad de las operaciones
              que dependen de ellos.
            </p>
            <p style={{
              fontSize: '0.9rem', lineHeight: 1.75,
              color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit, sans-serif',
              fontStyle: 'italic', margin: 0,
            }}>
              Porque al final, la confiabilidad no ocurre por accidente. Es el resultado
              de controlar aquello que amenaza constantemente a los activos más
              importantes de una operación.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              href="/knowledge-system"
              style={{
                display: 'inline-block',
                background: '#FFF12D', color: '#000',
                padding: '0.875rem 2.25rem',
                fontFamily: 'Outfit, sans-serif', fontWeight: 700,
                fontSize: '0.82rem', letterSpacing: '0.1em',
                textDecoration: 'none', borderRadius: '4px',
              }}
            >
              EXPLORAR EL KNOWLEDGE SYSTEM
            </Link>
            <Link
              href="/contact"
              style={{
                display: 'inline-block',
                background: 'transparent', color: '#FFF12D',
                padding: '0.875rem 2.25rem',
                fontFamily: 'Outfit, sans-serif', fontWeight: 700,
                fontSize: '0.82rem', letterSpacing: '0.1em',
                textDecoration: 'none', borderRadius: '4px',
                border: '1px solid rgba(255,241,45,0.4)',
              }}
            >
              CONTACTAR →
            </Link>
          </motion.div>

        </div>
      </section>

    </main>
  );
}
