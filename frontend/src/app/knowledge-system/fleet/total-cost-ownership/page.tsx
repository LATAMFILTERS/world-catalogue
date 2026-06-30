'use client';

import Link from 'next/link';

import { motion } from 'motion/react';
import { RelatedProducts } from '@/components/RelatedProducts';

const RELATED_PAGES = [
  { code: 'DOWNTIME', title: 'Reducing Fleet Downtime', href: '/knowledge-system/fleet/reducing-downtime' },
  { code: 'FUEL', title: 'Filtration and Fuel Efficiency', href: '/knowledge-system/fleet/fuel-efficiency' },
];

const TECHNOLOGIES = [
  { name: 'MACROCORE', slug: 'macrocore', role: 'Long-service-life air elements with capacity designed for full service intervals reduce element replacement frequency and labor costs in high-dust environments.' },
  { name: 'NANOFORCE', slug: 'nanoforce', role: 'Sub-3µm hydraulic precision filtration extends hydraulic pump and valve service life by maintaining ISO 16889 16/14/11 cleanliness, deferring proportional valve replacement events that represent major maintenance cost items.' },
  { name: 'DURATECH', slug: 'duratech', role: 'Dual-stage engine oil filtration reduces engine reconditioning frequency, extending the interval between major overhauls that represent the largest single maintenance cost events.' },
  { name: 'SYNTRAX', slug: 'syntrax', role: '4-layer AI-calibrated engine lube oil filtration extends drain intervals by maintaining ISO 4406 cleanliness in engine circuits, reducing fluid replacement frequency and associated labor costs.' },
  { name: 'HYDROCORE', slug: 'hydrocore', role: 'Preventing injector damage from water contamination defers injector replacement events that typically cost 800 to 2,500 USD per set for heavy diesel applications.' },
  { name: 'MICROKAPPA', slug: 'microkappa', role: 'Coolant system contamination control extends coolant service life and prevents thermal system degradation that leads to costly head gasket and heat exchanger failures.' },
];

const STANDARDS = [
  { code: 'ISO 16889', desc: 'Cleanliness code classification providing measurable targets for fluid system maintenance programs and filtration investment justification.' },
  { code: 'ISO 5011', desc: 'Filter element integrity testing establishing verified performance claims that underpin warranty and maintenance interval decisions.' },
  { code: 'ASTM D6595', desc: 'Wear metals analysis by rotating disc electrode spectrometry - the primary tool for oil analysis programs that enable predictive maintenance cost control.' },
  { code: 'SAE J1211', desc: 'Hydraulic filter qualification standard providing element performance data required for lifecycle cost modeling in heavy equipment applications.' },
];

const FAQS = [
  {
    q: 'What is the correct method for calculating filtration ROI in an industrial fleet?',
    a: 'Filtration return on investment compares filtration program costs against measurable cost reductions in three categories: avoided repair costs (unplanned failures prevented multiplied by average event cost), reduced scheduled maintenance costs (extended component service life reducing overhaul frequency), and fuel cost savings from efficiency preservation. The denominator includes filter element costs, labor for replacement, fluid analysis program fees, and any equipment upgrades to filtration specification. A minimum 18-month analysis period is required to capture component lifecycle benefits, since some savings (engine overhaul deferral) occur at multi-year intervals rather than monthly.',
  },
  {
    q: 'How does OEM filter specification compare to aftermarket options in TCO modeling?',
    a: 'OEM filter specifications define the minimum performance requirements validated for a given application. Aftermarket elements must meet or exceed these specifications to maintain equivalent protection. In TCO modeling, the relevant variables are: absolute filtration efficiency at the rated particle size, element collapse pressure rating relative to system bypass valve pressure, service life in operating hours at expected contamination levels, and cost per service hour. An aftermarket element costing 30% less but requiring 40% more frequent service intervals produces higher total cost. Conversely, an extended-interval synthetic element costing 60% more but lasting twice as long typically reduces cost per operating hour when labor cost is included.',
  },
  {
    q: 'At what fleet size does a formal oil analysis program become economically justified?',
    a: 'Oil analysis programs typically reach positive ROI at fleet sizes above 8 to 12 units with operating hours exceeding 1,500 hours per year per unit. Below this threshold, analysis program fixed costs - laboratory fees, sampling kits, data management - often exceed the avoided cost benefit. For smaller fleets, periodic bulk sampling at shared service intervals provides meaningful data at lower program overhead. The inflection point shifts downward in high-value equipment categories: a single large mining excavator with overhaul costs exceeding 300,000 USD justifies individual oil analysis programs regardless of fleet size.',
  },
  {
    q: 'How should filtration specifications change when equipment is operating beyond design lifespan?',
    a: 'Equipment operating beyond original design lifespan - typically defined as hours exceeding the first major overhaul interval - experiences accelerated wear particle generation from clearance growth in worn components. Worn engine cylinders generate more blow-by gas carrying oil-soluble contaminants. Worn hydraulic pump internals generate higher wear debris loads. In these conditions, upgrading to higher-efficiency filter elements (lower beta ratio) and shortening sampling intervals for oil analysis is justified. The additional filtration cost delays further component degradation and extends economic service life, deferring capital replacement expenditure.',
  },
];

const TCO_COMPONENTS = [
  {
    category: 'Acquisition',
    items: ['Filter element unit cost', 'Fluid fill cost per service', 'Analysis kit cost per sample'],
    note: 'Typically 10-20% of total filtration TCO',
  },
  {
    category: 'Labor',
    items: ['Technician time per service event', 'Equipment downtime during service', 'Analysis result review time'],
    note: 'Often exceeds element cost in remote operations',
  },
  {
    category: 'Avoided Costs',
    items: ['Unplanned failures prevented', 'Component life extensions', 'Fuel consumption reductions'],
    note: 'Largest TCO driver - frequently underquantified',
  },
  {
    category: 'Disposal',
    items: ['Used element disposal', 'Fluid waste management', 'Contaminated filter hazardous classification'],
    note: 'Regulatory compliance cost varies by jurisdiction',
  },
];

export default function TotalCostOwnershipPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Navigation */}
      <Link href="/knowledge-system/fleet"
        className="back-nav-btn" style={{
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
          <h1 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem',
            textAlign: 'justify',
          }}>
            Total Cost of Ownership in Filtration
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7,
            textAlign: 'justify',
          }}>
            Filter element unit cost represents a fraction of the economic decision. The complete TCO model accounts for service labor, component longevity, fluid waste, downtime exposure, and the quantifiable value of failures that did not occur.
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
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Total Cost of Ownership in Filtration Systems</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1rem', textAlign: 'justify',
          }}>
            Total Cost of Ownership (TCO) in filtration is the complete economic accounting of a filtration program across its full lifecycle - from filter element procurement through fluid disposal, including all associated labor, the downstream effects on component longevity, and the economic value of avoided failures. Establishing cleanliness targets through <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration system design</Link> is the foundation of any defensible TCO model.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, textAlign: 'justify',
          }}>
            Purchase price is the most visible filtration cost but rarely the most significant one. In most industrial applications, the ratio of filter element cost to total filtration program cost is between 1:4 and 1:8. Labor for service events, oil analysis programs, fluid costs, and avoided component replacement represent the dominant cost categories that TCO modeling must capture to support sound procurement decisions. The financial case is developed further in the <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>fleet downtime reduction analysis</Link>, where unplanned failure costs are quantified.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 2. Operational Challenge */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>The Unit Price Procurement Trap</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1.25rem', textAlign: 'justify',
          }}>
            Filtration procurement decisions based on element unit price alone systematically underestimate program costs and overestimate savings from cheaper alternatives. This occurs because filter elements are purchased in one budget cycle but their consequences - component wear rates, service interval frequency, failure events - manifest in separate accounting periods and cost centers.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1.25rem', textAlign: 'justify',
          }}>
            A filter element specification change that reduces unit cost by 25% but decreases service interval from 500 hours to 350 hours increases annual element consumption by 43% - erasing the unit price saving before accounting for additional service labor. If the lower-efficiency element also allows <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO cleanliness levels</Link> to rise by one code, the resulting 2x increase in particle concentration accelerates bearing wear rates and potentially reduces component service life, shifting major overhaul costs forward by months or years.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, textAlign: 'justify',
          }}>
            The organizational challenge is that procurement cost savings appear immediately in purchasing reports while the downstream costs of accelerated wear appear later in maintenance budgets managed by different teams under different performance metrics. TCO analysis bridges this organizational gap by expressing all costs in a common multi-year framework.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 3. Cost Impact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>TCO Component Structure</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {TCO_COMPONENTS.map((comp) => (
              <div key={comp.category} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1.5rem',
              }}>
                <p style={{
                  fontFamily: 'Titillium Web, sans-serif', fontSize: '0.9rem',
                  fontWeight: 600, color: '#FFF12D', marginBottom: '0.85rem',
                }}>{comp.category}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '1rem' }}>
                  {comp.items.map((item) => (
                    <li key={item} style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.55)', lineHeight: 1.5,
                      textAlign: 'justify',
                      paddingBottom: '0.4rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                    }}>
                      <span style={{ color: '#FFF12D', opacity: 0.4, flexShrink: 0 }}>-</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
                  color: 'rgba(255,241,45,0.4)', borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '0.75rem',
                }}>{comp.note}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem' }}>
            {[
              { metric: '1:4 - 1:8', label: 'Ratio of filter element cost to total filtration program cost in most industrial applications' },
              { metric: '3 - 5 years', label: 'Minimum analysis horizon required to capture engine overhaul deferral benefits in TCO models' },
              { metric: '300 - 400%', label: 'Typical ROI on structured contamination control programs measured over 36-month operating periods' },
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
                  textAlign: 'justify',
                }}>{item.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 4. Filtration Strategy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Building a TCO-Optimized Filtration Program</h2>
          {[
            {
              title: 'Baseline Cost Establishment',
              body: 'TCO modeling requires accurate baseline data: current element costs and change frequencies for each equipment type, technician labor rates and service times, current oil analysis costs if any program exists, and component replacement history with costs. Without documented baselines, comparing alternatives becomes speculative. A 6-month cost tracking period before introducing any specification changes provides the reference data needed for credible ROI calculations.',
            },
            {
              title: 'Service Interval Optimization',
              body: 'Service intervals should be set by measured performance parameters rather than fixed calendar or hour schedules. For air filters, differential pressure measurement eliminates both premature changes (where element capacity remains) and late changes (where restriction has exceeded efficiency thresholds). For oil systems, fluid analysis data enables individual equipment drain decisions based on actual contamination levels, extending intervals for lightly loaded equipment and shortening them for high-duty units.',
            },
            {
              title: 'Extended-Interval Element Specification',
              body: 'High-capacity synthetic filter media offers longer service life per element at higher unit cost. TCO justification requires comparing cost per operating hour rather than cost per element. An element costing 2.5x a standard element but lasting 2.5x longer at the same efficiency breaks even on material cost alone. When the reduction in service labor events (less frequent changes) is included, the higher-specification element typically produces positive TCO variance within 6 to 12 months.',
            },
            {
              title: 'Component Longevity Monetization',
              body: 'The largest TCO variable for engine filtration is overhaul interval extension. A diesel engine overhaul in heavy equipment typically costs between 40,000 and 250,000 USD depending on displacement and specification. If improved filtration extends the interval between overhauls from 12,000 to 15,000 hours - a 25% increase - the economic value of that deferral, discounted to present value, frequently exceeds the total cost of the improved filtration program across the entire interval.',
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
                color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, textAlign: 'justify',
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
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Documented TCO Outcomes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              'Construction equipment fleet reduced total filtration program cost by 22% over 24 months after implementing extended-interval synthetic elements, despite higher unit price, due to 40% reduction in service events and corresponding labor cost.',
              'Mining operation achieved 380% ROI on oil analysis program investment over 36 months through elimination of three unplanned engine failures and two hydraulic system replacements that analysis data predicted and allowed preventive intervention.',
              'Marine diesel operator reduced injector maintenance cost by 65% over two operating seasons after implementing two-stage fuel filtration with water separation, attributing savings to elimination of injector tip erosion and corresponding calibration drift.',
              'Agricultural machinery fleet extended engine overhaul intervals from 8,000 to 11,500 hours through ISO-compliant air and oil filtration program, deferring overhaul expenditure of 75,000 USD per unit and freeing capital for fleet expansion.',
              'Power generation operator reduced annual maintenance budget by 18% per generator set after transitioning to TCO-based filtration procurement, with savings distributed across reduced element consumption, lower labor frequency, and elimination of one unplanned failure event per unit annually.',
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
                  textAlign: 'justify',
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
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Filtration Systems Relevant to TCO Modeling</h2>
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
                    textAlign: 'justify',
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
                  textAlign: 'justify',
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
                  textAlign: 'justify',
                }}>{faq.q}</p>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, textAlign: 'justify',
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
          }}>CONTINUE IN FLEET OPTIMIZATION</p>
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


      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Total Cost of Ownership in Filtration',
        description: 'Filter element unit cost represents a fraction of the economic decision. The complete TCO model accounts for service labor, component longevity, fluid waste, downtime exposure, and the quantifiable value of failures that did not occur.',
        author: { '@type': 'Organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['industrial filtration', 'contamination control', 'total cost of ownership', 'filtration TCO', 'ISO 16889', 'maintenance economics', 'equipment lifecycle cost'],
        about: { '@type': 'Thing', name: 'Filtration Total Cost of Ownership', description: 'Lifecycle economic model for industrial filtration programs encompassing filter procurement, service labor, component longevity, and avoided failure costs.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Fleet Optimization', item: 'https://elimfilters.com/knowledge-system/fleet' },
          { '@type': 'ListItem', position: 4, name: 'Total Cost of Ownership in Filtration', item: 'https://elimfilters.com/knowledge-system/fleet/total-cost-ownership' },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is the correct method for calculating filtration ROI in an industrial fleet?', acceptedAnswer: { '@type': 'Answer', text: 'Filtration return on investment compares filtration program costs against measurable cost reductions in three categories: avoided repair costs (unplanned failures prevented multiplied by average event cost), reduced scheduled maintenance costs (extended component service life reducing overhaul frequency), and fuel cost savings from efficiency preservation. The denominator includes filter element costs, labor for replacement, fluid analysis program fees, and any equipment upgrades to filtration specification. A minimum 18-month analysis period is required to capture component lifecycle benefits, since some savings (engine overhaul deferral) occur at multi-year intervals rather than monthly.' } },
          { '@type': 'Question', name: 'How does OEM filter specification compare to aftermarket options in TCO modeling?', acceptedAnswer: { '@type': 'Answer', text: 'OEM filter specifications define the minimum performance requirements validated for a given application. Aftermarket elements must meet or exceed these specifications to maintain equivalent protection. In TCO modeling, the relevant variables are: absolute filtration efficiency at the rated particle size, element collapse pressure rating relative to system bypass valve pressure, service life in operating hours at expected contamination levels, and cost per service hour. An aftermarket element costing 30% less but requiring 40% more frequent service intervals produces higher total cost. Conversely, an extended-interval synthetic element costing 60% more but lasting twice as long typically reduces cost per operating hour when labor cost is included.' } },
          { '@type': 'Question', name: 'At what fleet size does a formal oil analysis program become economically justified?', acceptedAnswer: { '@type': 'Answer', text: 'Oil analysis programs typically reach positive ROI at fleet sizes above 8 to 12 units with operating hours exceeding 1,500 hours per year per unit. Below this threshold, analysis program fixed costs - laboratory fees, sampling kits, data management - often exceed the avoided cost benefit. For smaller fleets, periodic bulk sampling at shared service intervals provides meaningful data at lower program overhead. The inflection point shifts downward in high-value equipment categories: a single large mining excavator with overhaul costs exceeding 300,000 USD justifies individual oil analysis programs regardless of fleet size.' } },
          { '@type': 'Question', name: 'How should filtration specifications change when equipment is operating beyond design lifespan?', acceptedAnswer: { '@type': 'Answer', text: 'Equipment operating beyond original design lifespan - typically defined as hours exceeding the first major overhaul interval - experiences accelerated wear particle generation from clearance growth in worn components. Worn engine cylinders generate more blow-by gas carrying oil-soluble contaminants. Worn hydraulic pump internals generate higher wear debris loads. In these conditions, upgrading to higher-efficiency filter elements (lower beta ratio) and shortening sampling intervals for oil analysis is justified. The additional filtration cost delays further component degradation and extends economic service life, deferring capital replacement expenditure.' } },
        ],
      }) }} />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem 2rem' }}>
        <RelatedProducts filterType="oil filter" duty="HEAVY_DUTY" searchQuery="oil filter heavy duty" label="VER FILTROS RELACIONADOS" />
      </div>
    </main>
  );
}
