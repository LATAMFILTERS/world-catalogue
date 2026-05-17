'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const PROBLEM_IMAGE = '/images/mecanico-fn.avif';

const FAILURE_MODES = [
  {
    num: '01',
    title: 'Injector Erosion',
    desc: 'Micronic particles deform spray orifices, causing immediate power loss and poor combustion.',
  },
  {
    num: '02',
    title: 'Critical Bearing Friction',
    desc: 'Contaminated oil accelerates metal wear, reducing engine block life by up to 40%.',
  },
  {
    num: '03',
    title: 'Fuel Drainage',
    desc: 'A restricted engine consumes up to 8% more diesel just to maintain the same torque levels.',
  },
];

const CTA_SLIDES = [
  {
    tag: '// DEALER NETWORK',
    title: 'ONLY THE BEST',
    highlight: 'SELL ELIMFILTERS.',
    buttonText: 'BECOME A DEALER',
    href: 'https://elimfilters.com/app-dealer-01/',
  },
  {
    tag: '// TECHNICAL SEARCH',
    title: 'THE RIGHT FILTER.',
    highlight: 'SEARCH LIKE A PRO.',
    buttonText: 'FIND MY PART',
    href: 'https://part-search.elimfilters.com',
  },
];

const SLIDE_DURATION = 5000;

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const raf = { id: 0 };
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed < SLIDE_DURATION) {
        raf.id = requestAnimationFrame(tick);
      } else {
        setActiveSlide((p) => (p + 1) % CTA_SLIDES.length);
      }
    };
    raf.id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.id);
  }, [activeSlide]);

  return (
    <>
      <Navigation />
      <main>
        <style>{`
          @media (max-width: 768px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .problem-grid { grid-template-columns: 1fr !important; }
            .problem-badge { display: none !important; }
            .hero-bottom { flex-direction: column !important; }
          }
          @media (max-width: 480px) {
            .stats-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>

        {/* ── HERO ── */}
        <section
          style={{
            position: 'relative',
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '0 5% 60px',
            backgroundImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,1) 100%), url(/images/hero-bg.jpg)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.25em',
                color: '#FFF12D',
                opacity: 0.9,
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              ELIMFILTERS | TOTAL PROTECTION SYSTEMS
            </p>
            <h1
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(3rem, 9vw, 7rem)',
                lineHeight: 1.0,
                letterSpacing: '0.01em',
                color: '#FFF12D',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              ENGINE FILTRATION
            </h1>
            <h2
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
                lineHeight: 1.1,
                color: 'rgba(255,255,255,0.75)',
                textTransform: 'uppercase',
                marginBottom: '2.5rem',
              }}
            >
              HEAVY-DUTY & LIGHT-DUTY
            </h2>
            <div
              className="hero-bottom"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: '2rem',
              }}
            >
              <p
                style={{
                  maxWidth: '560px',
                  color: 'rgba(255,255,255,0.7)',
                  fontStyle: 'italic',
                  borderLeft: '4px solid #FFF12D',
                  paddingLeft: '1.5rem',
                  fontSize: '1.1rem',
                  lineHeight: 1.65,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Engineering filtration designed for those who cannot afford a stalled engine or a
                fleet out of action.
              </p>
              <a
                href="https://part-search.elimfilters.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: '#FFF12D',
                  color: '#000',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  padding: '1rem 2.5rem',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s ease',
                }}
              >
                FIND MY FILTER
              </a>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section
          style={{
            background: '#000',
            padding: '5rem 8%',
            borderBottom: '1px solid #111',
          }}
        >
          <div
            className="stats-grid"
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2.5rem',
            }}
          >
            {[
              { value: '99.9%', label: 'Media Efficiency' },
              { value: '+45%', label: 'Engine Life Span' },
              { value: '20k+', label: 'OEM Cross-Refs' },
              { value: 'GLOBAL', label: 'Texas, USA' },
            ].map((s) => (
              <div key={s.value} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                    color: '#FFF12D',
                    lineHeight: 1,
                    marginBottom: '0.6rem',
                  }}
                >
                  {s.value}
                </div>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: '#888',
                    fontSize: '0.7rem',
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROBLEM SECTION ── */}
        <section
          style={{
            padding: '5rem 8%',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.25em',
                color: '#FFF12D',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              // OPERATIONAL RISK DIAGNOSIS
            </p>
            <h2
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                lineHeight: 1.1,
                color: 'rgba(255,255,255,0.95)',
                marginBottom: '3rem',
              }}
            >
              WHAT YOU CAN&apos;T SEE,
              <br />
              <span style={{ color: '#FFF12D' }}>IS STOPPING YOUR FLEET.</span>
            </h2>

            <div
              className="problem-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                background: '#050505',
                padding: '3.5rem',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                position: 'relative',
              }}
            >
              {/* Left: text */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '1.05rem',
                    marginBottom: '2rem',
                    lineHeight: 1.7,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  A low-quality filter is an economic decision that ends up costing thousands at
                  the shop. Inefficient filtration allows invisible contaminants to act like
                  sandpaper inside critical components.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {FAILURE_MODES.map((item) => (
                    <div key={item.num} style={{ display: 'flex', gap: '1.25rem' }}>
                      <div
                        style={{
                          flexShrink: 0,
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          border: '1px solid rgba(180,0,0,0.35)',
                          background: 'rgba(100,0,0,0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            color: '#f87171',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            fontFamily: 'Montserrat, sans-serif',
                          }}
                        >
                          {item.num}
                        </span>
                      </div>
                      <div>
                        <h3
                          style={{
                            color: '#fff',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontSize: '0.82rem',
                            marginBottom: '0.3rem',
                            fontFamily: 'Montserrat, sans-serif',
                          }}
                        >
                          {item.title}
                        </h3>
                        <p
                          style={{
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: '0.875rem',
                            lineHeight: 1.6,
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: image + 80% badge */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    minHeight: '500px',
                    overflow: 'hidden',
                    background: '#000',
                    backgroundImage: `url(${PROBLEM_IMAGE})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <div
                  className="problem-badge"
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    background: '#FFF12D',
                    color: '#000',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    maxWidth: '180px',
                    boxShadow: '0 8px 32px rgba(255,241,45,0.3)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    80%
                  </p>
                  <p
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginTop: '0.5rem',
                      lineHeight: 1.4,
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    Of premature failures are caused by contamination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

{/* ── CTA SLIDES ── */}
        <div
          style={{
            position: 'relative',
            background: '#000',
            borderTop: '1px solid #111',
            overflow: 'hidden',
          }}
        >
          {CTA_SLIDES.map((slide, i) => (
            <div
              key={i}
              style={{
                position: i === activeSlide ? 'relative' : 'absolute',
                top: i === activeSlide ? undefined : 0,
                left: i === activeSlide ? undefined : 0,
                width: '100%',
                opacity: i === activeSlide ? 1 : 0,
                transition: 'opacity 0.8s ease',
                pointerEvents: i === activeSlide ? 'all' : 'none',
                padding: '5rem 8%',
              }}
            >
              <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.25em',
                    color: '#FFF12D',
                    textTransform: 'uppercase',
                    marginBottom: '1.25rem',
                  }}
                >
                  {slide.tag}
                </p>
                <h2
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(2.25rem, 4.5vw, 4rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    lineHeight: 1.1,
                    color: 'rgba(255,255,255,0.95)',
                    marginBottom: '1.5rem',
                  }}
                >
                  {slide.title}
                  <br />
                  <span style={{ color: '#FFF12D' }}>{slide.highlight}</span>
                </h2>
                <a
                  href={slide.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#FFF12D',
                    color: '#000',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    padding: '1rem 2.5rem',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    transition: 'background 0.2s ease',
                  }}
                >
                  {slide.buttonText}
                </a>
              </div>
            </div>
          ))}

          {/* dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.625rem',
              padding: '1rem 0 2.5rem',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {CTA_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                style={{
                  width: '28px',
                  height: '3px',
                  background: i === activeSlide ? '#FFF12D' : '#333',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* progress bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '2px',
              background: '#FFF12D',
              width: `${progress}%`,
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
