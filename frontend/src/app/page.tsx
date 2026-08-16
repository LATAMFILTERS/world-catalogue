'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, animate, useSpring, useScroll, useTransform } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlobalBrandSection } from '@/components/GlobalBrandSection';
import '@/i18n';
import { useTranslation } from 'react-i18next';
import CinematicHero from '@/components/ui/CinematicHero';
import { ConversionProvider } from '@/components/conversion';
import { EngineeringSearchBar } from '@/components/engineering';
import type { CustomerIntent } from '@/components/conversion';
import type { SearchResult } from '@/lib/services';

// ─── Static structural data ───────────────────────────────────────────────────

const SLIDE_DURATION = 5000;

const PARTICLE_DATA = Array.from({ length: 22 }, (_, i) => ({
  x: ((i * 5.3 + 2.7) % 97) + 1.5,
  size: 1 + (i % 3) * 0.7,
  duration: 10 + (i % 7) * 1.8,
  delay: (i * 0.9) % 7,
  opacity: 0.1 + (i % 4) * 0.05,
}));

const INDUSTRY_COLORS: Record<string, string> = {
  agriculture: 'rgba(139,195,74,0.12)',
  mining: 'rgba(255,152,0,0.12)',
  marine: 'rgba(33,150,243,0.12)',
  construction: 'rgba(255,193,7,0.12)',
  'oil-gas': 'rgba(200,200,200,0.1)',
  'power-generation': 'rgba(255,87,34,0.12)',
  'heavy-transport': 'rgba(121,85,72,0.1)',
  forestry: 'rgba(76,175,80,0.12)',
  military: 'rgba(96,125,139,0.1)',
  'industrial-equipment': 'rgba(0,188,212,0.12)',
  rail: 'rgba(63,81,181,0.12)',
  'stationary-engines': 'rgba(233,30,99,0.12)',
};

// ─── Counter ──────────────────────────────────────────────────────────────────

function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, to, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current)
          ref.current.textContent = prefix + (Number.isInteger(to) ? Math.round(v).toString() : v.toFixed(1)) + suffix;
      },
    });
    return () => ctrl.stop();
  }, [inView, to, prefix, suffix]);

  return <span ref={ref}>{prefix}{Number.isInteger(to) ? Math.round(to) : to.toFixed(1)}{suffix}</span>;
}

// ─── Spotlight card ──────────────────────────────────────────────────────────

function SpotlightCard({ children, style, contentStyle, contentClassName }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  contentClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, opacity: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setSpot({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100, opacity: 1 });
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setSpot(s => ({ ...s, opacity: 0 }))}
      style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(300px circle at ${spot.x}% ${spot.y}%, rgba(255,241,45,0.07), transparent 70%)`,
        opacity: spot.opacity, transition: 'opacity 0.3s ease', pointerEvents: 'none', zIndex: 1,
      }} />
      <div className={contentClassName} style={{ position: 'relative', zIndex: 2, ...contentStyle }}>{children}</div>
    </div>
  );
}

// ─── FloatingParticles ───────────────────────────────────────────────────────

function FloatingParticles({ count = 22 }: { count?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {PARTICLE_DATA.slice(0, count).map((p, i) => (
        <motion.div key={i}
          style={{ position: 'absolute', left: `${p.x}%`, bottom: 0, width: p.size, height: p.size * 2.5, borderRadius: '50%', background: '#FFF12D' }}
          animate={{ y: [0, -160], opacity: [0, p.opacity, p.opacity * 0.5, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

// ─── StatRing ─────────────────────────────────────────────────────────────

function StatRing({ percent, content, label }: { percent: number; content: React.ReactNode; label: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 1rem' }}>
        <svg viewBox="0 0 100 100" width="100" height="100" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,241,45,0.1)" strokeWidth="5" />
          <motion.circle cx="50" cy="50" r={r} fill="none" stroke="#FFF12D" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            whileInView={{ strokeDashoffset: circ * (1 - percent / 100) }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow, Arial, sans-serif', fontWeight: 700, fontSize: 'clamp(0.75rem, 1.5vw, 1.1rem)', color: '#FFF12D', lineHeight: 1 }}>
          {content}
        </div>
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#666', fontSize: '0.68rem', margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

// ─── IndustryCard ──────────────────────────────────────────────────────────

function IndustryCard({ id, label, href }: { id: string; label: string; href: string }) {
  const [hovered, setHovered] = useState(false);
  const color = INDUSTRY_COLORS[id] || 'rgba(255,241,45,0.08)';
  return (
    <a href={href} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: hovered ? color : '#000', borderLeft: `2px solid ${hovered ? color.replace(/[\d.]+\)$/, '0.7)') : 'rgba(255,255,255,0.04)'}`, textDecoration: 'none', gap: '0.5rem', transition: 'all 0.25s ease' }}>
      <span style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '0.9rem', fontWeight: hovered ? 600 : 500, color: hovered ? '#fff' : 'rgba(255,255,255,0.65)', transition: 'all 0.25s ease' }}>
        {label}
      </span>
      <motion.span animate={{ x: hovered ? 4 : 0 }} transition={{ duration: 0.2 }} style={{ color: '#FFF12D', fontSize: '0.75rem', opacity: hovered ? 1 : 0.4 }}>{'->'}</motion.span>
    </a>
  );
}

// ─── Engineering Entry Section ───────────────────────────────────────────────

const JOURNEY_CARDS = [
  {
    id: 'PART_NUMBER',
    label: 'Find a Part',
    description: 'Know the part number or OEM reference? Locate it instantly.',
    icon: '01',
    accent: 'rgba(255,241,45,0.08)',
    border: 'rgba(255,241,45,0.2)',
    href: 'https://part-search.elimfilters.com',
    external: true,
  },
  {
    id: 'ASSET_PROTECTION',
    label: 'Protect Your Assets',
    description: 'Select your industry. We identify contamination risks for your equipment.',
    icon: '02',
    accent: 'rgba(134,239,172,0.06)',
    border: 'rgba(134,239,172,0.18)',
    href: '/engineering/asset-protection',
    external: false,
  },
  {
    id: 'PROBLEM_DIAGNOSIS',
    label: 'Diagnose a Problem',
    description: 'Describe the symptom. We trace it to the failure mode and root cause.',
    icon: '03',
    accent: 'rgba(252,165,165,0.06)',
    border: 'rgba(252,165,165,0.18)',
    href: '/engineering/diagnosis',
    external: false,
  },
  {
    id: 'LEARNING',
    label: 'Explore Engineering',
    description: 'Study contamination mechanisms, standards, and technology architectures.',
    icon: '04',
    accent: 'rgba(125,211,252,0.06)',
    border: 'rgba(125,211,252,0.18)',
    href: '/knowledge-center/',
    external: false,
  },
] as const;

function EngineeringEntrySection() {
  function handleResult(results: SearchResult[], intent: CustomerIntent) {
    if (intent === 'KNOWN_PART' && results.length > 0) {
      window.location.href = `https://part-search.elimfilters.com?q=${encodeURIComponent(results[0].label)}`;
    }
  }

  return (
    <section style={{
      background: '#000',
      padding: '4.25rem 8% 4.75rem',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{
            fontSize: '0.72rem', color: '#FFF12D',
            fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.24em',
            marginBottom: '0.75rem',
          }}>
            ENGINEERING INTELLIGENCE PLATFORM
          </div>
          <h2 style={{
            fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700,
            fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
            color: '#fff', margin: 0,
          }}>
            What is putting your operation at risk?
          </h2>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginBottom: '2.5rem', maxWidth: '680px' }}
        >
          <EngineeringSearchBar onResult={handleResult} placeholder="Part number, symptom, failure mode, standard..." />
        </motion.div>

        {/* Journey cards — 2x2 grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {JOURNEY_CARDS.map((card, i) => (
            <motion.a
              key={card.id}
              href={card.href}
              target={card.external ? '_blank' : undefined}
              rel={card.external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ borderColor: card.border.replace(/[\d.]+\)$/, '0.45)') }}
              style={{
                display: 'block', padding: '1.5rem',
                background: card.accent,
                border: `1px solid ${card.border}`,
                borderRadius: '2px', textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{card.icon}</div>
              <div style={{
                fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700,
                color: '#fff', fontSize: '1rem', marginBottom: '0.4rem',
              }}>
                {card.label}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', lineHeight: 1.6,
              }}>
                {card.description}
              </div>
              <div style={{
                marginTop: '1rem', fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.65)',
              }}>
                {card.external ? 'part-search.elimfilters.com ->' : 'Explore ->'}
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const statsLabels = t('home.statsLabels', { returnObjects: true }) as string[];
  const archItems = t('home.archItems', { returnObjects: true }) as string[];
  const failModes = t('home.failModes', { returnObjects: true }) as Array<{ title: string; desc: string }>;
  const whyCheckItems = t('home.whyCheckItems', { returnObjects: true }) as string[];
  const whyCardItems = t('home.whyCardItems', { returnObjects: true }) as string[];
  const techItems = t('home.techItems', { returnObjects: true }) as Array<{ title: string; desc: string }>;
  const faqItems = t('home.faqItems', { returnObjects: true }) as Array<{ q: string; a: string }>;
  const sciStandards = t('home.sciStandards', { returnObjects: true }) as Array<{ code: string; desc: string }>;
  const economicItems = t('home.economicItems', { returnObjects: true }) as string[];
  const economicStats = t('home.economicStats', { returnObjects: true }) as Array<{ value: string; label: string }>;
  const trustIndustries = t('home.trustIndustries', { returnObjects: true }) as string[];

  const FAILURE_NUMS = ['01', '02', '03'];

  const CTA_SLIDES = [
    { tag: t('home.ctaDealerTag', '// DEALER NETWORK'), title: t('home.ctaDealerTitle', 'ONLY THE BEST'), highlight: t('home.ctaDealerHl', 'SELL ELIMFILTERS.'), buttonText: t('home.ctaDealerBtn', 'BECOME A DEALER'), href: '/distributor-application' },
    { tag: t('home.ctaSearchTag', '// TECHNICAL SEARCH'), title: t('home.ctaSearchTitle', 'THE RIGHT FILTER.'), highlight: t('home.ctaSearchHl', 'SEARCH LIKE A PRO.'), buttonText: t('home.ctaSearchBtn', 'FIND MY PART'), href: 'https://part-search.elimfilters.com' },
  ];

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const raf = { id: 0 };
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed < SLIDE_DURATION) { raf.id = requestAnimationFrame(tick); }
      else { setActiveSlide(p => (p + 1) % CTA_SLIDES.length); }
    };
    raf.id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.id);
  }, [activeSlide]);

  return (
    <ConversionProvider>
      <Navigation />
      <main style={{ fontFamily: 'Barlow, Arial, sans-serif' }}>
        {/* ── DIRECT ANSWER BLOCK (hidden from view, visible in HTML source for AI crawlers) ── */}
        <div style={{
          display: 'none',
          visibility: 'hidden',
        }}>
          <p>
            ELIMFILTERS® is Kleo Technology LLC's global industrial filtration brand. We do not sell directly to end users; instead, ELIMFILTERS products are available exclusively through authorized distributors across the Americas and other regions. ELIMFILTERS engineers advanced contamination control systems for air intake, fuel, hydraulic, oil, and cabin filtration across 12 industries including mining, agriculture, marine, and power generation. Our products comply with ISO 5011, ISO 16889, and ISO 19438 standards and are cross-referenced to 20,000+ OEM specifications, backed by 25+ years of industrial field deployment.
          </p>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .problem-grid { grid-template-columns: 1fr !important; }
            .problem-badge { display: none !important; }
            .why-grid { grid-template-columns: 1fr !important; }
            .tech-grid { grid-template-columns: 1fr !important; }
            .asset-protection-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
            .spotlight-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
            .economic-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
            .sci-grid { grid-template-columns: 1fr !important; }
            .trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>

        {/* ── HERO ── */}
        <CinematicHero />

        {/* ── GLOBAL BRAND SECTION ── */}
        <GlobalBrandSection />

        {/* ── ENGINEERING ENTRY ── */}

        {/* ── INDUSTRIES STRIP ── */}
      <section style={{ padding: '4.75rem 8%', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

              <motion.h2 variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.05, color: 'rgba(255,255,255,0.85)', marginBottom: '2.75rem' }}>
                {t('home.problemH1', "WHAT YOU CAN'T SEE")}
                <br /><span style={{ color: '#FFF12D' }}>{t('home.problemH2', 'IS STOPPING YOUR OPERATION.')}</span>
              </motion.h2>
            </motion.div>

            <SpotlightCard style={{ background: '#050505', padding: '3.5rem', border: '1px solid #1a1a1a', borderRadius: '2px' }}
              contentClassName="spotlight-grid" contentStyle={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <motion.p variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.75, fontFamily: 'Barlow, Arial, sans-serif' }}>
                  {t('home.problemIntro', '80% of premature equipment failures are caused by contamination. Inefficient filtration allows invisible particles to act like sandpaper inside critical components — bearing surfaces, injector orifices, hydraulic spools.')}
                </motion.p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {(Array.isArray(failModes) ? failModes : []).map((item, idx) => (
                    <motion.div key={idx} variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      style={{ display: 'flex', gap: '1.25rem' }}>
                      <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: '50%', border: '1px solid rgba(180,0,0,0.35)', background: 'rgba(100,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#f87171', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'Barlow, Arial, sans-serif' }}>{FAILURE_NUMS[idx] ?? String(idx + 1).padStart(2, '0')}</span>
                      </div>
                      <div>
                        <h3 style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.82rem', marginBottom: '0.3rem', fontFamily: 'Barlow, Arial, sans-serif' }}>{item.title}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.65, fontFamily: 'Barlow, Arial, sans-serif' }}>{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative' }}>
                <div style={{ height: '100%', minHeight: '480px', backgroundImage: 'url(/images/mecanico-fn.avif)', backgroundSize: 'contain', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat' }} />
                <motion.div className="problem-badge" initial={{ opacity: 0, scale: 0.75 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ position: 'absolute', bottom: -20, right: -20, background: '#FFF12D', color: '#000', padding: '1.5rem', borderRadius: '2px', maxWidth: '180px', boxShadow: '0 8px 40px rgba(255,241,45,0.35)' }}>
                  <p style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1, fontFamily: 'Barlow, Arial, sans-serif' }}>{t('home.problemBadgeNum', '80%')}</p>
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.5rem', lineHeight: 1.4, fontFamily: 'Barlow, Arial, sans-serif' }}>{t('home.problemBadgeDesc', 'Of premature failures are caused by contamination.')}</p>
                </motion.div>
              </motion.div>
            </SpotlightCard>
          </div>
        </section>

        {/* ── REAL COST OF CONTAMINATION ── */}
        <section style={{ padding: '4.75rem 8%', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: '-80px' }}
            >

              <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.65rem)', textTransform: 'uppercase', lineHeight: 1.1, color: 'rgba(255,255,255,0.85)', marginBottom: '2.5rem' }}>
                One Contamination Event.<br />
                <span style={{ color: '#FFF12D' }}>$62,000 In Losses.</span>
              </h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'Hydraulic Pump Replacement', cost: '$18,000-$32,000', icon: '05', desc: 'Particle contamination destroys spool valves and pump internals. Complete hydraulic assembly replacement required.' },
                { label: 'System Flush + Fluid', cost: '$4,000-$6,000', icon: '06', desc: 'Contaminated oil must be fully purged. Lines flushed, fluid replaced, system recertified before return to service.' },
                { label: 'Unplanned Downtime (5-8 days)', cost: '$40,000-$80,000', icon: '07', desc: 'Lost production on a 50-ton excavator: $5,000-$10,000/day. 5-8 days of downtime compounds cost rapidly.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', borderRadius: '2px' }}
                >
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{item.icon}</p>
                  <p style={{ fontFamily: 'Barlow, Arial, sans-serif', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>{item.label}</p>
                  <p style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#f87171', marginBottom: '0.75rem' }}>{item.cost}</p>
                  <p style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, textAlign: 'left' }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true, margin: '-60px' }}
              style={{ background: '#050505', border: '1px solid rgba(255,241,45,0.2)', padding: '2rem 2.5rem', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Prevention cost — 4x NANOFORCE™ Hydraulic Filters</p>
                <p style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: '#FFF12D' }}>~$232</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, textAlign: 'left' }}>
                  4 filters at $58 each. Less than 0.4% of a single contamination event.<br />
                  <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Asset protection is not a cost — it is the lowest-cost insurance available.</strong>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── WHY ELIMFILTERS ── */}
        <section style={{ padding: '4.75rem 8%', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.h2 initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.05, color: 'rgba(255,255,255,0.85)', marginBottom: '2.75rem' }}>
              {t('home.whyTitle1', 'ASSET PROTECTION')} <span style={{ color: '#FFF12D' }}>{t('home.whyTitle2', 'TECHNOLOGY')}</span>
            </motion.h2>
            <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
                <motion.p variants={{ hidden: { opacity: 0, x: -32 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', marginBottom: '1.75rem' }}>
                  {t('home.whyP1', 'ELIMFILTERS is not a filter company. ELIMFILTERS is an ')}<strong style={{ color: '#FFF12D' }}>{t('home.whyP1hl', 'Asset Protection Technology')}</strong>{t('home.whyP1after', ' company — engineering systems that control contamination, prevent degradation and protect the value of critical industrial assets.')}
                </motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -32 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', marginBottom: '1.75rem' }}>
                  {t('home.whyP2', 'Every technology we build addresses a measurable contamination threat. Equipment that fails costs hundreds of thousands to repair. We protect that investment at the system level, not the product level.')}
                </motion.p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(Array.isArray(whyCheckItems) ? whyCheckItems : []).map((item, i) => (
                    <motion.div key={i} variants={{ hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                      style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#FFF12D', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>OK</span>
                      <span style={{ fontFamily: 'Barlow, Arial, sans-serif', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                <SpotlightCard style={{ background: '#050505', padding: '2.5rem', border: '1px solid #1a1a1a', borderRadius: '2px' }}>

                  <h3 style={{ fontFamily: 'Barlow, Arial, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', lineHeight: 1.3, textAlign: 'justify' }}>
                    {t('home.whyCardTitle1', 'Your equipment is worth millions.')}<br />{t('home.whyCardTitle2', 'Protect it accordingly.')}
                  </h3>
                  <p style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '0.95rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', marginBottom: '2rem' }}>
                    {t('home.whyCardDesc', 'Every ELIMFILTERS technology exists to protect critical assets, reduce downtime and extend operational life.')}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(Array.isArray(whyCardItems) ? whyCardItems : []).map((item, i) => (
                      <li key={i} style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', paddingLeft: '1.5rem', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#FFF12D', fontWeight: 700 }}>→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── ASSET PROTECTION NARRATIVE ── */}
        <section style={{ padding: '4.75rem 8%', background: 'linear-gradient(180deg, rgba(255,241,45,0.03) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true, margin: '-80px' }}
            style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="asset-protection-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
              <div>

                <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: 'clamp(1.7rem, 3.2vw, 2.25rem)', fontWeight: 700, lineHeight: 1.15, color: '#fff', marginBottom: '1.5rem' }}>
                  {t('home.assetTitle', 'Protecting Industrial Assets Through Contamination Control')}
                </h2>
                <p style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  {t('home.assetP1', 'ELIMFILTERS protects industrial assets by controlling contamination across critical systems. Our engineering approach focuses on preventing degradation, extending service life, improving reliability and reducing total cost of ownership.')}
                </p>
                <p style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, paddingLeft: '1.25rem', borderLeft: '3px solid #FFF12D' }}>
                  {t('home.assetP2', 'Every technology we engineer addresses a specific contamination mechanism — particle wear, water ingestion, bypass failure, or thermal degradation — targeting the root cause of premature asset failure.')}
                </p>
              </div>
              <div style={{ background: '#050505', border: '1px solid rgba(255,241,45,0.15)', padding: '2.5rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Identify Contamination', desc: 'Particles, water, heat, chemical byproducts' },
                    { label: 'Apply Engineering Standards', desc: 'ISO 4406 · ISO 16889 · ISO 5011 · ISO 19438' },
                    { label: 'Deploy Protection Technology', desc: 'MACROCORE · SYNTRAX · NANOFORCE · SYNTAPORE' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFF12D', flexShrink: 0, marginTop: '0.52rem' }} />
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', margin: '0 0 0.2rem', letterSpacing: '0.02em' }}>{item.label}</p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.48)', margin: 0, letterSpacing: 0 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── SCIENTIFIC AUTHORITY ── */}
        <section style={{ padding: '4.75rem 8%', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true, margin: '-80px' }}
              style={{ marginBottom: '2.75rem' }}>

              <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#fff', lineHeight: 1.15, marginBottom: '1rem', maxWidth: '700px' }}>
                {t('home.sciTitle', 'The Science Behind Asset Protection')}
              </h2>
              <p style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', maxWidth: '640px' }}>
                {t('home.sciDesc', 'ELIMFILTERS contamination control systems are engineered to international standards, validated through rigorous laboratory testing and field deployment across critical industrial environments.')}
              </p>
            </motion.div>
            <div className="sci-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', width: '100%' }}>
              {(Array.isArray(sciStandards) ? sciStandards : []).map((std, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }} viewport={{ once: true, margin: '-40px' }}
                  style={{ flex: '1 1 calc(33.333% - 1.5rem)', minWidth: '320px', maxWidth: '440px' }}>
                  <SpotlightCard style={{ background: '#000', border: '1px solid rgba(255,241,45,0.12)', padding: '2.5rem', borderRadius: '2px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.4rem', color: '#FFF12D', marginBottom: '1rem', letterSpacing: '0.05em', textAlign: 'center' }}>{std.code}</div>
                    <p style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '1.1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', margin: 0, textAlign: 'center' }}>{std.desc}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECHNOLOGY ── */}
        <section style={{ padding: '4.75rem 8%', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>

              <motion.h2 variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.05, color: 'rgba(255,255,255,0.85)', marginBottom: '2.75rem' }}>
                {t('home.techTitle', 'Asset Protection')} <span style={{ color: '#FFF12D' }}>{t('home.techHighlight', 'Technology')}</span>
              </motion.h2>
              <div className="tech-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {(Array.isArray(techItems) ? techItems : []).map((tech, i) => (
                  <motion.div key={i} variants={{ hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}>
                    <SpotlightCard style={{ background: '#050505', padding: '2rem', border: '1px solid #1a1a1a', borderRadius: '2px', height: '100%' }}>
                      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }}>
                        <div style={{ width: 32, height: 2, background: '#FFF12D', marginBottom: '1.5rem' }} />
                        <h3 style={{ fontFamily: 'Barlow, Arial, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#FFF12D', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tech.title}</h3>
                        <p style={{ fontFamily: 'Barlow, Arial, sans-serif', fontSize: '0.9rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.6)' }}>{tech.desc}</p>
                      </motion.div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>



        {/* ── CTA SLIDES ── */}
        <div style={{ position: 'relative', background: '#000', borderTop: '1px solid #111', overflow: 'hidden' }}>
          {CTA_SLIDES.map((slide, i) => (
            <div key={i} style={{ position: i === activeSlide ? 'relative' : 'absolute', top: i === activeSlide ? undefined : 0, left: i === activeSlide ? undefined : 0, width: '100%', opacity: i === activeSlide ? 1 : 0, transition: 'opacity 0.8s ease', pointerEvents: i === activeSlide ? 'all' : 'none', padding: '4.75rem 8%' }}>
              <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3.1rem)', textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.02, color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem' }}>
                  {slide.title}<br /><span style={{ color: '#FFF12D' }}>{slide.highlight}</span>
                </h2>
                <motion.a href={slide.href} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.04, boxShadow: '0 0 36px rgba(255,241,45,0.5)' }} whileTap={{ scale: 0.96 }}
                  style={{ display: 'inline-block', background: '#FFF12D', color: '#000', fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', padding: '1rem 2.5rem', textDecoration: 'none', textTransform: 'uppercase' }}>
                  {slide.buttonText}
                </motion.a>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem', padding: '1rem 0 2.5rem', position: 'relative', zIndex: 10 }}>
            {CTA_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setActiveSlide(i)} style={{ width: '28px', height: '3px', background: i === activeSlide ? '#FFF12D' : '#333', border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.3s ease' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: '#FFF12D', width: `${progress}%` }} />
        </div>

        {/* ── TESTIMONIALS ── */}

        {/* ── FAQ SECTION ── */}
      </main>
      <Footer />
    </ConversionProvider>
  );
}



