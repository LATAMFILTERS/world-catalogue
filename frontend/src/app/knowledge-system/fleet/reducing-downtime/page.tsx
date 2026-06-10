'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const RELATED_PAGES = [
  { code: 'FUEL', title: 'Filtration and Fuel Efficiency', href: '/knowledge-system/fleet/fuel-efficiency' },
  { code: 'TCO', title: 'Total Cost of Ownership', href: '/knowledge-system/fleet/total-cost-ownership' },
];

const TECHNOLOGIES = [
  { name: 'MACROCORE', slug: 'macrocore', role: 'Air intake protection preventing abrasive ingestion that accelerates component wear between service intervals.' },
  { name: 'DURATECH', slug: 'duratech', role: 'Dual-stage engine oil filtration capturing wear debris before recirculation extends time between unplanned oil failures.' },
  { name: 'NANOFORCE', slug: 'nanoforce', role: 'Fuel system contamination control reducing injector stiction events that trigger unscheduled engine shutdowns.' },
  { name: 'AQUAGUARD', slug: 'aquaguard', role: 'Water extraction from fuel preventing hard-start conditions and microbial blockages in storage or remote equipment.' },
];

const STANDARDS = [
  { code: 'ISO 16889', desc: 'Cleanliness classification for hydraulic and fuel system fluids - baseline for maintenance interval justification.' },
  { code: 'ISO 5011', desc: 'Filter element integrity verification ensuring installed elements perform to specified efficiency ratings.' },
  { code: 'SAE J1539', desc: 'Air induction system contamination standard defining acceptable ingestion levels for engine protection.' },
  { code: 'ASTM D7085', desc: 'Particle counting method for in-service oil analysis supporting predictive maintenance programs.' },
];

const FAQS = [
  {
    q: 'What is the difference between planned and unplanned downtime in fleet operations?',
    a: 'Planned downtime occurs during scheduled maintenance windows where work scope, parts, and technician availability are pre-coordinated. Unplanned downtime results from component failure without prior warning, requiring emergency mobilization of resources. The cost differential between the two is typically 3 to 8 times higher for unplanned events due to emergency parts procurement, overtime labor, and production losses that compound while equipment sits idle.',
  },
  {
    q: 'How does filter bypass affect unplanned failure rates?',
    a: 'Bypass events occur when differential pressure across a filter element exceeds the bypass valve opening threshold, typically between 3 and 6 bar for engine oil filters. During bypass, unfiltered fluid circulates through the system carrying accumulated wear debris directly to precision clearance surfaces. A single sustained bypass event can introduce enough abrasive material to reduce bearing service life by 20 to 40%, often without producing immediate symptoms visible in routine inspection.',
  },
  {
    q: 'At what oil contamination level should an operator intervene before failure occurs?',
    a: 'ISO cleanliness code 18/16/13 is typically the intervention threshold for critical engine oil systems. Above this level, wear particle concentration accelerates abrasive mechanisms in a compounding pattern. For hydraulic systems with proportional control valves, ISO 16/14/11 is the maximum acceptable operating level. Exceeding these thresholds by even one ISO scale code represents a doubling of particle concentration and a measurable increase in component degradation rate.',
  },
  {
    q: 'Can extended oil drain intervals increase unplanned downtime risk?',
    a: 'Extended drain intervals reduce planned maintenance frequency but increase contamination accumulation risk when filter element capacity is not proportionally upgraded. Oil oxidation byproducts and wear metal concentration both rise monotonically with service hours. When drain extensions are implemented without corresponding changes to filtration specification - higher efficiency elements or bypass filtration - the probability of in-service fluid degradation reaching critical thresholds increases significantly.',
  },
];

export default function ReducingDowntimePage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Navigation */}
      <Link href="/knowledge-system/fleet" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← FLEET</Link>

      {/* Hero */}
      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
            letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '1rem', opacity: 0.85,
          }}>
            // KNOWLEDGE SYSTEM · FLEET OPTIMIZATION · DOWNTIME
          </p>
          <h1 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem',
          }}>
            Reducing Fleet Downtime
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Unplanned mechanical failure is the primary driver of availability loss in industrial fleets. Filtration discipline is one of the highest-leverage variables within an operator's direct control.
          </p>
        </motion.div>
      </section>

      {/* Body */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* 1. Short Definition */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>01 / DEFINITION</p>
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>What Is Fleet Downtime</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1rem',
          }}>
            Fleet downtime refers to any period during which a piece of industrial equipment is unavailable for productive operation. It encompasses both planned maintenance windows and unplanned mechanical failures requiring repair before resuming service.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
          }}>
            In contamination engineering, downtime is primarily driven by accelerated component degradation: bearing surfaces worn beyond tolerance, injectors losing calibration, hydraulic valves developing stiction from particulate accumulation. These failure pathways share a common origin - fluid contamination that exceeds the protection capacity of <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration systems</Link>.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 2. Operational Challenge */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>02 / OPERATIONAL CHALLENGE</p>
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>The Cumulative Contamination Problem</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1.25rem',
          }}>
            Industrial equipment operates in contamination-intensive environments. A combine harvester working in field conditions ingests dust at concentrations exceeding 2,000 mg/m3. A mining haul truck operating on unpaved haul roads encounters silica particulate at levels the air filtration system must reduce by a factor of 10,000 or more before air enters the combustion chamber.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1.25rem',
          }}>
            The challenge is not that contamination exists - it is that contamination accumulates invisibly. Wear debris generated by early-stage abrasion recirculates and accelerates further wear. Water ingress triggers corrosion and microbial growth that blocks fuel systems over weeks, not hours. Hydraulic valve tolerances tighten progressively as particle deposits accumulate in spool clearances of 3 to 10 microns.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
          }}>
            Without systematic contamination monitoring, failure arrives without warning. An operator may observe no performance change until a threshold is crossed and a component fails completely. <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Particle wear in engines and hydraulics</Link> is the most common root mechanism linking contamination accumulation to unplanned mechanical failure. This is the fundamental operational challenge: contamination-induced failure is predictable in mechanism but difficult to detect without dedicated measurement programs.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 3. Cost Impact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>03 / COST IMPACT</p>
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Quantified Downtime Costs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {[
              { metric: '3x - 8x', label: 'Higher cost per hour for unplanned vs. planned maintenance events' },
              { metric: '15 - 30%', label: 'Equipment availability loss in hydraulic-intensive operations with poor contamination control' },
              { metric: '1 - 2 events', label: 'Unplanned hydraulic failures per 500 operating hours under contaminated fluid conditions' },
              { metric: '20 - 45%', label: 'Reduction in component service life when operating above ISO 18/16/13 oil cleanliness threshold' },
            ].map((item) => (
              <div key={item.metric} style={{
                background: 'rgba(255,241,45,0.03)',
                border: '1px solid rgba(255,241,45,0.12)',
                padding: '1.25rem',
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4rem',
                  fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem',
                }}>{item.metric}</div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.5)', lineHeight: 1.5,
                }}>{item.label}</div>
              </div>
            ))}
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
          }}>
            Beyond direct repair costs, downtime cascades into secondary losses: missed production targets, contractual penalties for delayed deliveries, emergency logistics for parts procurement, and technician overtime. Fluid cleanliness verification against <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889 Beta Ratio standards</Link> is the primary measurement tool used to establish and maintain contamination control thresholds that prevent these costs. In remote operations such as mining or offshore, secondary costs often exceed the primary repair expense by a factor of two or more.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 4. Filtration Strategy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>04 / FILTRATION STRATEGY</p>
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Contamination Control as Downtime Prevention</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1.25rem',
          }}>
            An effective contamination control program addresses three system boundaries: ingression points where contamination enters the system, recirculation paths where existing contamination amplifies damage, and monitoring points where fluid condition is measured to predict intervention requirements.
          </p>
          {[
            {
              title: 'Ingression Control',
              body: 'Air intake filtration must maintain efficiency above 99.9% throughout service life. Pressure drop monitoring identifies when element capacity is approaching saturation before bypass occurs. For fuel systems, transfer filtration between storage and equipment tanks prevents delivery contamination from entering injection circuits.',
            },
            {
              title: 'Recirculation Suppression',
              body: 'Kidney-loop offline filtration on hydraulic reservoirs continuously polishes fluid independent of system operation. This approach reduces ISO cleanliness codes by 2 to 4 levels over 48 to 72 hours of operation and is particularly effective in systems where high-flow main filters cannot achieve target cleanliness levels alone.',
            },
            {
              title: 'Breather and Vent Filtration',
              body: 'Hydraulic reservoir breathers and gearbox vents are frequently overlooked ingression paths. A properly sized desiccant breather rated to ISO 4406 particle filtration prevents atmospheric contamination from bypassing the main filter circuit entirely during thermal cycling when reservoirs breathe.',
            },
            {
              title: 'Oil Analysis Integration',
              body: 'Regular fluid sampling at 250-hour intervals provides quantitative contamination data that enables predictive maintenance decisions. Elemental spectroscopy identifies wear metals by source system. Particle count confirms ISO cleanliness code compliance. Together these measurements convert reactive maintenance into interval-based intervention before component damage progresses to failure.',
            },
          ].map((item) => (
            <div key={item.title} style={{
              borderLeft: '2px solid rgba(255,241,45,0.2)',
              paddingLeft: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontFamily: 'Titillium Web, sans-serif', fontSize: '0.95rem',
                fontWeight: 600, color: '#fff', marginBottom: '0.5rem',
              }}>{item.title}</p>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
              }}>{item.body}</p>
            </div>
          ))}
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 5. Real-World Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>05 / OPERATIONAL BENEFITS</p>
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Measured Outcomes in Industrial Operations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              'Engine overhaul intervals extended from 8,000 to 12,000+ hours in mining haulage fleets through ISO 16889-compliant air and oil filtration programs.',
              'Hydraulic pump service life increased 60 to 80% in construction equipment after implementing kidney-loop offline filtration maintaining ISO 16/14/11 cleanliness.',
              'Injector reconditioning frequency reduced from 2,000-hour intervals to 5,000+ hours in heavy agricultural equipment through systematic fuel water removal.',
              'Unplanned maintenance events reduced by 35 to 55% in marine diesel applications after implementing structured contamination monitoring combined with high-efficiency fuel filtration.',
              'Overall equipment availability increased from 78% to 91% in open-pit mining operations following fleet-wide oil analysis program integration with maintenance scheduling systems.',
            ].map((benefit, i) => (
              <div key={i} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                padding: '1rem 1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
                  color: '#FFF12D', opacity: 0.6, flexShrink: 0, paddingTop: '0.15rem',
                }}>{'>'}</span>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0,
                }}>{benefit}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 6. Related Technologies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>06 / RELATED TECHNOLOGIES</p>
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Filtration Systems Supporting Availability</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '1rem' }}>
            {TECHNOLOGIES.map((tech) => (
              <Link key={tech.slug} href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem',
                    height: '100%',
                  }}
                >
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
                    fontWeight: 600, color: '#FFF12D', marginBottom: '0.6rem',
                  }}>{tech.name}</p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
                  }}>{tech.role}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 7. Related Standards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>07 / RELATED STANDARDS</p>
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Applicable Specifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {STANDARDS.map((std) => (
              <div key={std.code} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                alignItems: 'start',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
                  fontWeight: 600, color: '#FFF12D',
                }}>{std.code}</span>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.5)', lineHeight: 1.55,
                }}>{std.desc}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 8. FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>08 / FREQUENTLY ASKED QUESTIONS</p>
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em',
          }}>Technical Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1.5rem',
              }}>
                <p style={{
                  fontFamily: 'Titillium Web, sans-serif', fontSize: '0.95rem',
                  fontWeight: 600, color: '#fff', marginBottom: '0.85rem', lineHeight: 1.5,
                }}>{faq.q}</p>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
                }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Internal Navigation */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem',
          }}>// CONTINUE IN FLEET OPTIMIZATION</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem' }}>
            {RELATED_PAGES.map((page) => (
              <Link key={page.code} href={page.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem',
                  }}
                >
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    color: '#FFF12D', opacity: 0.6, letterSpacing: '0.1em',
                  }}>{page.code}</span>
                  <span style={{
                    fontFamily: 'Titillium Web, sans-serif', fontSize: '0.9rem',
                    fontWeight: 600, color: '#fff',
                  }}>{page.title}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem',
                  }}>READ →</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Asset Protection Systems [PRIMARY] | Contamination Control Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: engine, hydraulic, fuel, air_intake, lube</p>
        <p>CONCEPT_TAXONOMY: type=strategy | domain=fleet-operations | goal=downtime-reduction</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE, NANOFORCE, DURATECH</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/total-cost-ownership, /knowledge-system/fleet/fuel-efficiency</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/fleet/reducing-downtime</p>
        <p>&nbsp;&nbsp;concept_id: fleet-downtime-reduction</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </RetrievalBlock>
    </main>
  );
}
