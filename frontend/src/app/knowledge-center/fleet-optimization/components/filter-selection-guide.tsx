'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

const FILTER_SELECTIONS = {
  lube_oil: [
    {
      scenario: 'Heavy-Duty Truck (Bypass Risk)',
      challenge: 'Particle wear in cylinders, bearing clearance reduction',
      recommendation: 'SYNTRAX Lube Oil Filter (ISO 16/14/11)',
      specs: 'Beta₂₀ ≥200, Bypass 4.0 bar, 25g/L capacity',
      iso: 'ISO 16889, ISO 4406, SAE J1211',
      expectedLife: '40,000–60,000 hours'
    },
    {
      scenario: 'Marine Diesel (Water + Salt)',
      challenge: 'Water contamination, corrosion, microbial growth',
      recommendation: 'MARINECLEAN Lube Oil Filter (17/15/12)',
      specs: 'Beta₂₀ ≥200, Water removal 98%, Bypass 4.0 bar',
      iso: 'ISO 16889, ASTM D6304, IMO',
      expectedLife: '30,000–45,000 hours'
    }
  ],
  hydraulic: [
    {
      scenario: 'Proportional Valve (High Sensitivity)',
      challenge: 'Valve spool wear, pressure spike sensitivity',
      recommendation: 'NANOFORCE Hydraulic Filter (ISO 15/13/10)',
      specs: 'Beta₁₀ ≥200, Bypass 3.5 bar, 25µm absolute',
      iso: 'ISO 16889, NFPA T2.14, ISO 4406',
      expectedLife: '8,000–12,000 hours'
    },
    {
      scenario: 'Mobile Equipment (Bypass Risk)',
      challenge: 'Contamination bypass during cold starts',
      recommendation: 'NANOFORCE + System Combo',
      specs: 'Main: Beta₁₀ ≥200; Bypass 4.5 bar',
      iso: 'ISO 16889, SAE J1268',
      expectedLife: '6,000–10,000 hours'
    }
  ],
  fuel: [
    {
      scenario: 'HPCR Injector (Stiction Risk)',
      challenge: 'Water precipitation, injector erosion',
      recommendation: 'SYNTEPORE Fuel Filter + Water Separator',
      specs: 'Beta₃ ≥200, Water removal 99.8%, Bypass 3.0 bar',
      iso: 'ASTM D6304, ISO 12937, SAE J1739',
      expectedLife: '40,000–80,000 km'
    },
    {
      scenario: 'Fleet Biodiesel (Microbial)',
      challenge: 'Microbial contamination, filter plugging',
      recommendation: 'TURBOCORE 3-Stage Fuel Filter',
      specs: 'Beta₁₀ ≥200 + Beta₃ ≥200, Water 99%',
      iso: 'ASTM D6469, ISO 11159',
      expectedLife: 'Seasonal'
    }
  ],
  air: [
    {
      scenario: 'Turbine Compressor (Blade Erosion)',
      challenge: '50µm silica = 1000× damage factor',
      recommendation: 'MACROCORE Air Filter (ISO 5011 Class 4)',
      specs: 'Beta₁₀ ≥1000, 18µm absolute, 99.97% efficiency',
      iso: 'ISO 5011, SAE J726, ASTM D202',
      expectedLife: '3,000–6,000 hours'
    },
    {
      scenario: 'Cabin Air (Occupant Health)',
      challenge: 'PM10 particles, pollen, odors',
      recommendation: 'MICROKAPPA Cabin Filter (HEPA-grade)',
      specs: 'PM10 removal 99.95%, Activated carbon',
      iso: 'ISO 11155, DIN 71220, SAE J1739',
      expectedLife: '15,000–30,000 km'
    }
  ]
};

export default function FilterSelectionGuide() {
  const [activeCategory, setActiveCategory] = useState('lube_oil');

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, rgba(255,241,45,0.02) 100%)',
        border: '1px solid rgba(255,241,45,0.15)',
        borderRadius: '12px',
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        marginBottom: '3rem'
      }}
    >
      <h2 style={{
        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
        fontWeight: 700,
        color: '#FFF12D',
        marginBottom: '1.5rem',
        fontFamily: 'Outfit, sans-serif'
      }}>
        Filter Selection Guide — Scenario Matching
      </h2>

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        {Object.entries(FILTER_SELECTIONS).map(([key]) => (
          <motion.button
            key={key}
            onClick={() => setActiveCategory(key)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeCategory === key ? 'rgba(255,241,45,0.1)' : 'rgba(255,255,255,0.02)',
              border: activeCategory === key ? '2px solid rgba(255,241,45,0.5)' : '2px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: activeCategory === key ? '#FFF12D' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease'
            }}
          >
            {key === 'lube_oil' && 'Lube Oil'}
            {key === 'hydraulic' && 'Hydraulic'}
            {key === 'fuel' && 'Fuel'}
            {key === 'air' && 'Air Intake'}
          </motion.button>
        ))}
      </div>

      <motion.div
        key={activeCategory}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {FILTER_SELECTIONS[activeCategory as keyof typeof FILTER_SELECTIONS].map((scenario, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,241,45,0.15)',
              borderRadius: '8px',
              padding: '1.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,241,45,0.35)';
              e.currentTarget.style.background = 'rgba(255,241,45,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,241,45,0.15)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.8rem',
                color: '#FFF12D',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '0.5rem'
              }}>
                Scenario {idx + 1}
              </div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: '0.5rem'
              }}>
                {scenario.scenario}
              </h3>
            </div>

            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: 'rgba(255,241,45,0.08)',
              borderRadius: '6px',
              border: '1px solid rgba(255,241,45,0.2)'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '0.5rem',
                fontWeight: 600
              }}>
                Threat:
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.8)'
              }}>
                {scenario.challenge}
              </div>
            </div>

            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: 'rgba(76,175,80,0.08)',
              borderRadius: '6px',
              border: '1px solid rgba(76,175,80,0.2)'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '0.5rem',
                fontWeight: 600
              }}>
                Recommendation:
              </div>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#fff'
              }}>
                {scenario.recommendation}
              </div>
            </div>

            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                Technical Specs
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.6,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {scenario.specs}
              </div>
            </div>

            <div style={{
              marginBottom: '1rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {scenario.iso.split(', ').map((standard, i) => (
                <span
                  key={i}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(255,241,45,0.1)',
                    border: '1px solid rgba(255,241,45,0.2)',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#FFF12D',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                >
                  {standard}
                </span>
              ))}
            </div>

            <div style={{
              padding: '0.75rem',
              background: 'rgba(33,150,243,0.08)',
              border: '1px solid rgba(33,150,243,0.2)',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              <strong style={{ color: '#2196F3' }}>Service Life:</strong> {scenario.expectedLife}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
