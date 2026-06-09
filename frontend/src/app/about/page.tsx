'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'motion/react';

/* ─── WORD-BY-WORD REVEAL ──────────────────────────────────────────────────── */
function WordReveal({
  text,
  baseDelay = 0,
  color,
}: {
  text: string;
  baseDelay?: number;
  color?: string;
}) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.28em', color }}
          initial={{ opacity: 0, y: 40, rotateX: -25 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.55,
            delay: baseDelay + i * 0.07,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

/* ─── DATA ─────────────────────────────────────────────────────────────────── */
const STEPS = [
  { num: '01', label: 'PROBLEMA',   desc: 'Comprender qué está ocurriendo y qué mecanismo lo provoca.' },
  { num: '02', label: 'SISTEMA',    desc: 'Identificar qué sistema crítico está siendo afectado.' },
  { num: '03', label: 'TECNOLOGÍA', desc: 'Seleccionar la tecnología que controla ese mecanismo específico.' },
  { num: '04', label: 'SOLUCIÓN',   desc: 'Diseñar la estrategia de protección para ese entorno operacional.' },
  { num: '05', label: 'PRODUCTO',   desc: 'Implementar el componente correcto como resultado del proceso anterior.' },
];

const COST_CHAIN = [
  { label: 'Tiempos de inactividad',           detail: 'La operación se detiene mientras se diagnostica y repara.' },
  { label: 'Pérdida de productividad',         detail: 'Cada hora de equipo parado representa producción no recuperada.' },
  { label: 'Consumo adicional de recursos',    detail: 'Repuestos, mano de obra, logística de emergencia.' },
  { label: 'Riesgo de continuidad operacional', detail: 'Interrupciones repetidas comprometen contratos y continuidad.' },
];

const CONTRASTS = [
  { industry: 'La industria reacciona.',            ef: 'ELIMFILTERS anticipa.' },
  { industry: 'La industria reemplaza.',            ef: 'ELIMFILTERS analiza causas.' },
  { industry: 'La industria observa consecuencias.', ef: 'ELIMFILTERS estudia mecanismos.' },
  { industry: 'La industria vende productos.',      ef: 'ELIMFILTERS desarrolla soluciones.' },
];

/* ─── SCROLL-DRIVEN METHOD SECTION ─────────────────────────────────────────── */
function MethodScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(-1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const lineHeight = useTransform(smooth, [0, 0.88], ['0%', '100%']);

  const thresholds = [0.08, 0.26, 0.44, 0.62, 0.78];

  useMotionValueEvent(smooth, 'change', (v) => {
    let step = -1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (v >= thresholds[i]) { step = i; break; }
    }
    setActiveStep(step);
  });

  return (
    <div ref={containerRef} style={{ height: '320vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', alignItems: 'center',
        background: '#000',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {/* Ambient glow behind active step area */}
        <div style={{
          position: 'absolute', right: '5%', top: '50%',
          transform: 'translateY(-50%)',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,241,45,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '0 clamp(1.25rem,5vw,2rem)', width: '100%',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(2.5rem,5vw,5rem)',
            alignItems: 'center',
          }}>

            {/* Left: context */}
            <div>
              <span style={{
                display: 'block', fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.22em', color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem',
              }}>
                03 / LA FORMA ELIMFILTERS DE ANALIZAR UN PROBLEMA
              </span>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', fontWeight: 900,
                fontFamily: 'Space Grotesk, sans-serif',
                lineHeight: 1.1, marginBottom: '1.25rem',
              }}>
                LA INDUSTRIA EMPIEZA CON EL PRODUCTO.
                <br />
                <span style={{ color: '#FFF12D' }}>ELIMFILTERS EMPIEZA CON EL PROBLEMA.</span>
              </h2>
              <p style={{
                fontSize: '0.95rem', lineHeight: 1.8,
                color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif',
                marginBottom: '2.5rem',
              }}>
                Antes de recomendar una referencia específica es necesario comprender
                qué está ocurriendo, qué sistema está siendo afectado y qué mecanismo
                está provocando la degradación.
              </p>

              {/* Step progress bar */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                {STEPS.map((_, i) => (
                  <div key={i} style={{
                    height: '2px',
                    width: i <= activeStep ? '2.5rem' : '0.5rem',
                    background: i <= activeStep ? '#FFF12D' : 'rgba(255,255,255,0.12)',
                    borderRadius: '1px',
                    transition: 'width 0.45s ease, background 0.45s ease',
                  }} />
                ))}
              </div>
              <p style={{
                fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace',
                color: 'rgba(255,255,255,0.22)', letterSpacing: '0.14em',
              }}>
                {activeStep >= 0
                  ? `${STEPS[activeStep].label} — PASO ${activeStep + 1} DE ${STEPS.length}`
                  : 'CONTINÚA SCROLLEANDO →'}
              </p>
            </div>

            {/* Right: animated step list */}
            <div style={{ position: 'relative', paddingLeft: '2.75rem' }}>
              {/* Track */}
              <div style={{
                position: 'absolute', left: '0.75rem',
                top: '0.85rem', bottom: '0.85rem',
                width: '2px', background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <motion.div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  background: 'linear-gradient(to bottom, #FFF12D, rgba(255,241,45,0.35))',
                  height: lineHeight,
                }} />
              </div>

              {STEPS.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                    marginBottom: i < STEPS.length - 1 ? '2.25rem' : 0,
                    opacity: i <= activeStep ? 1 : 0.2,
                    transform: `translateX(${i <= activeStep ? 0 : -10}px)`,
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                  }}
                >
                  <div style={{
                    width: '1.6rem', height: '1.6rem', borderRadius: '50%', flexShrink: 0,
                    background: i <= activeStep ? '#FFF12D' : 'transparent',
                    border: `1.5px solid ${i <= activeStep ? '#FFF12D' : 'rgba(255,255,255,0.18)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.5rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                    color: i <= activeStep ? '#000' : 'rgba(255,255,255,0.25)',
                    transform: i === activeStep ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.5s ease',
                    marginTop: '0.1rem',
                  }}>
                    {step.num}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: '0.2em', marginBottom: '0.3rem',
                      color: i <= activeStep ? '#FFF12D' : 'rgba(255,255,255,0.18)',
                      transition: 'color 0.5s ease',
                    }}>
                      {step.label}
                    </div>
                    <p style={{
                      fontSize: '0.875rem', lineHeight: 1.6,
                      color: i <= activeStep ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.18)',
                      fontFamily: 'Outfit, sans-serif', margin: 0,
                      transition: 'color 0.5s ease',
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CONTRAST CARD WITH ANIMATED STRIKETHROUGH ────────────────────────────── */
function ContrastCard({ industry, ef, delay = 0 }: { industry: string; ef: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '8px', overflow: 'hidden',
      }}
    >
      {/* Industry line — gets struck through */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
      }}>
        <p style={{
          fontSize: '0.83rem', lineHeight: 1.5,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'Outfit, sans-serif', margin: 0,
        }}>
          {industry}
        </p>
        {/* Strikethrough line draws left to right */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: delay + 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute', left: '1.25rem', right: '1.25rem', top: '50%',
            height: '1.5px', background: 'rgba(255,241,45,0.55)',
            transformOrigin: 'left',
          }}
        />
      </div>
      {/* ELIMFILTERS response fades in after line */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay + 0.7 }}
        style={{ padding: '1rem 1.25rem' }}
      >
        <p style={{
          fontSize: '0.9rem', fontWeight: 600,
          color: '#FFF12D', fontFamily: 'Outfit, sans-serif', margin: 0,
        }}>
          {ef}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────────────────────── */
export default function About() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', perspective: '1000px' }}>

      {/* ── HERO — full viewport, word-by-word reveal ── */}
      <section style={{
        height: '100vh', minHeight: '640px',
        display: 'flex', alignItems: 'flex-end',
        backgroundImage:
          'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.68) 55%, rgba(0,0,0,1) 100%), url(/images/grupo-filters.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Contamination particles (reuse global class from homepage) */}
        {[
          { t: '18%', l: '7%',  sz: '3px', dur: '9s',  dl: '0s',   op: '0.28' },
          { t: '35%', l: '20%', sz: '2px', dur: '12s', dl: '2s',   op: '0.18' },
          { t: '60%', l: '4%',  sz: '4px', dur: '8s',  dl: '3.5s', op: '0.22' },
          { t: '22%', l: '45%', sz: '2px', dur: '11s', dl: '1s',   op: '0.15' },
          { t: '50%', l: '60%', sz: '3px', dur: '7s',  dl: '4s',   op: '0.18' },
        ].map((p, i) => (
          <div key={i} className="particle" style={{
            top: p.t, left: p.l, zIndex: 2,
            '--sz': p.sz, '--dur': p.dur, '--delay': p.dl, '--op': p.op,
          } as React.CSSProperties} />
        ))}

        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: '1100px', margin: '0 auto',
          padding: '0 clamp(1.25rem,5vw,2rem) clamp(3.5rem,8vh,5.5rem)',
          width: '100%',
        }}>
          <motion.span
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'block', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.25em', color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.75rem',
            }}
          >
            // ABOUT ELIMFILTERS®
          </motion.span>

          {/* Main headline — word by word with 3D rotation */}
          <h1 style={{
            margin: '0 0 1.5rem', padding: 0,
            lineHeight: 1.05,
            fontSize: 'clamp(2rem, 6vw, 4.5rem)',
            fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif',
          }}>
            <WordReveal text="LA CONTAMINACIÓN ES UNA CAUSA." baseDelay={0.1} />
            <br />
            <WordReveal text="NO UNA CONSECUENCIA." baseDelay={0.55} color="#FFF12D" />
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            style={{
              fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)',
              fontFamily: 'Outfit, sans-serif',
              borderLeft: '2px solid rgba(255,241,45,0.3)', paddingLeft: '1rem',
            }}
          >
            Asset Protection Engineering Company · Kleo Technologies
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.8 }}
          style={{
            position: 'absolute', bottom: '2rem', left: '50%',
            transform: 'translateX(-50%)', zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
          }}
        >
          <span style={{
            fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,255,255,0.22)', letterSpacing: '0.2em',
          }}>
            SCROLL
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '1px', height: '2.5rem',
              background: 'linear-gradient(to bottom, rgba(255,241,45,0.5), transparent)',
            }}
          />
        </motion.div>
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
            gap: 'clamp(2rem,5vw,4rem)', alignItems: 'start',
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
              <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem' }}>
                La mayoría de las organizaciones reaccionan cuando la falla ya ocurrió. ELIMFILTERS® nace bajo una filosofía diferente: la contaminación no debe gestionarse después de que destruye un sistema. Debe ser controlada antes de que genere consecuencias.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', fontFamily: 'Outfit, sans-serif' }}>
                Una bomba dañada no comenzó siendo una bomba dañada. Antes de la falla visible existe un proceso progresivo de degradación — generalmente silencioso y asociado a contaminantes que alteran las condiciones normales de operación.
              </p>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                'Partículas microscópicas ingresan continuamente a sistemas críticos.',
                'El agua y la humedad degradan fluidos y componentes de precisión.',
                'Los residuos metálicos aceleran el desgaste de superficies en movimiento.',
                'El daño se desarrolla de forma gradual y silenciosa hasta la falla visible.',
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{
                    display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                    background: 'rgba(255,241,45,0.04)',
                    border: '1px solid rgba(255,241,45,0.1)',
                    borderRadius: '6px', padding: '1rem 1.25rem',
                  }}
                >
                  <span style={{ color: '#FFF12D', fontSize: '0.6rem', marginTop: '0.3rem', flexShrink: 0 }}>◆</span>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                    {text}
                  </p>
                </motion.div>
              ))}
            </div>
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
            style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem' }}
          >
            02 / EL COSTO REAL DEL PROBLEMA
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '1rem', lineHeight: 1.2, maxWidth: '700px' }}
          >
            EL COSTO DE UNA FALLA VA MÁS ALLÁ DEL COMPONENTE QUE SE REEMPLAZA.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', fontFamily: 'Outfit, sans-serif', maxWidth: '680px', marginBottom: '3rem' }}
          >
            Cuando un sistema falla, los costos asociados se extienden mucho más allá del componente
            que debe reemplazarse. La mayoría de las organizaciones calculan únicamente ese valor visible —
            y ese enfoque es incompleto.
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {COST_CHAIN.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ borderColor: 'rgba(255,241,45,0.3)', y: -4 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '8px', padding: '1.75rem',
                }}
              >
                <div style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace', color: '#FFF12D', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '0.75rem' }}>
                  {item.label}
                </h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{
              fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)',
              fontFamily: 'Outfit, sans-serif', maxWidth: '680px', marginTop: '2.5rem',
              borderLeft: '3px solid rgba(255,241,45,0.4)', paddingLeft: '1.25rem',
            }}
          >
            La prevención siempre cuesta menos que la falla que evita.
          </motion.p>
        </div>
      </section>

      {/* ── 03 — MÉTODO SCROLL-DRIVEN ── */}
      <MethodScrollSection />

      {/* ── 04 — CONTRASTE (strikethrough animation) ── */}
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
            style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem' }}
          >
            04 / LA FILOSOFÍA ELIMFILTERS
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '2.5rem', lineHeight: 1.15, maxWidth: '680px' }}
          >
            ESTA DIFERENCIA DE PENSAMIENTO DEFINE LA IDENTIDAD DE LA ORGANIZACIÓN.
          </motion.h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '0' }}>
            {CONTRASTS.map((item, i) => (
              <ContrastCard key={i} industry={item.industry} ef={item.ef} delay={i * 0.12} />
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
            style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '2rem' }}
          >
            05 / DECLARACIÓN FUNDACIONAL
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              background: 'rgba(255,241,45,0.04)',
              border: '1px solid rgba(255,241,45,0.18)',
              borderRadius: '12px',
              padding: 'clamp(2rem,5vw,3.5rem)',
              marginBottom: '3rem',
            }}
          >
            {[
              { text: 'Nuestra misión no es comercializar componentes.', size: '1.05rem', weight: 400, color: 'rgba(255,255,255,0.72)', italic: false },
              { text: 'Nuestra misión es controlar los mecanismos que aceleran la degradación de los sistemas críticos y aumentar la confiabilidad de las operaciones que dependen de ellos.', size: 'clamp(1rem, 2.5vw, 1.3rem)', weight: 600, color: '#fff', italic: false },
              { text: 'Porque al final, la confiabilidad no ocurre por accidente. Es el resultado de controlar aquello que amenaza constantemente a los activos más importantes de una operación.', size: '0.92rem', weight: 400, color: 'rgba(255,255,255,0.42)', italic: true },
            ].map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.28 }}
                style={{
                  fontSize: line.size, fontWeight: line.weight, color: line.color,
                  fontFamily: 'Outfit, sans-serif', fontStyle: line.italic ? 'italic' : 'normal',
                  lineHeight: 1.8, margin: i < 2 ? '0 0 1.75rem' : 0,
                }}
              >
                {line.text}
              </motion.p>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/knowledge-system" style={{
              display: 'inline-block', background: '#FFF12D', color: '#000',
              padding: '0.875rem 2.25rem', fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em',
              textDecoration: 'none', borderRadius: '4px',
            }}>
              EXPLORAR EL KNOWLEDGE SYSTEM
            </Link>
            <Link href="/contact" style={{
              display: 'inline-block', background: 'transparent', color: '#FFF12D',
              padding: '0.875rem 2.25rem', fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em',
              textDecoration: 'none', borderRadius: '4px',
              border: '1px solid rgba(255,241,45,0.4)',
            }}>
              CONTACTAR →
            </Link>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
