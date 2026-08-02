'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { calculateBearingLife, BearingLifeInput, BearingLifeResult } from '../lib/fleet-calculations';

const ISO_CODES = {
  '19/17/14': 'Commodity (OEM Minimum)',
  '17/15/12': 'Standard OEM Spec',
  '16/14/11': 'System Approach',
  '15/13/10': 'Premium System',
  '14/12/9': 'Maximum Protection'
};

const MAINTENANCE_STRATEGIES = {
  reactive: 'Reactive (Fix-on-Failure)',
  preventive: 'Preventive (Calendar-Based)',
  predictive: 'Predictive (Condition-Based)'
};

export default function BearingLifePredictor() {
  const [inputs, setInputs] = useState<BearingLifeInput>({
    initialHours: 40000,
    currentIsoCode: '17/15/12',
    targetIsoCode: '16/14/11',
    contaminationRate: 'medium',
    maintenanceStrategy: 'preventive'
  });
  const [result, setResult] = useState<BearingLifeResult | null>(null);

  const handleCalculate = () => {
    const calculated = calculateBearingLife(inputs);
    setResult(calculated);
  };

  const handleInputChange = (field: keyof BearingLifeInput, value: any) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
        Bearing Life Predictor — ISO 19438 Contamination Factor
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '0.5rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              Initial Bearing Hours
            </label>
            <input
              type="number"
              value={inputs.initialHours}
              onChange={(e) => handleInputChange('initialHours', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,241,45,0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '0.5rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              Current Contamination Level
            </label>
            <select
              value={inputs.currentIsoCode}
              onChange={(e) => handleInputChange('currentIsoCode', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,241,45,0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              {Object.entries(ISO_CODES).map(([code, label]) => (
                <option key={code} value={code} style={{ background: '#000' }}>
                  {code} — {label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '0.5rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              Target Contamination Level
            </label>
            <select
              value={inputs.targetIsoCode}
              onChange={(e) => handleInputChange('targetIsoCode', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,241,45,0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              {Object.entries(ISO_CODES).map(([code, label]) => (
                <option key={code} value={code} style={{ background: '#000' }}>
                  {code} — {label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '0.5rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              Maintenance Strategy
            </label>
            <select
              value={inputs.maintenanceStrategy}
              onChange={(e) => handleInputChange('maintenanceStrategy', e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,241,45,0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              {Object.entries(MAINTENANCE_STRATEGIES).map(([key, label]) => (
                <option key={key} value={key} style={{ background: '#000' }}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            onClick={handleCalculate}
            whileHover={{ background: 'rgba(255,241,45,0.15)' }}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255,241,45,0.1)',
              border: '1px solid rgba(255,241,45,0.3)',
              color: '#FFF12D',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            Calculate Projected Life
          </motion.button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{
              background: 'rgba(255,241,45,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,241,45,0.2)',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '0.5rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                Current Projected Life
              </div>
              <div style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700,
                color: '#fff'
              }}>
                {(result.currentProjectedLife / 1000).toFixed(1)}K
                <span style={{ fontSize: '0.5em', marginLeft: '0.5rem' }}>hours</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,241,45,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,241,45,0.2)',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '0.5rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                Optimized Projected Life
              </div>
              <div style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700,
                color: '#FFF12D'
              }}>
                {(result.optimizedProjectedLife / 1000).toFixed(1)}K
                <span style={{ fontSize: '0.5em', marginLeft: '0.5rem' }}>hours</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(76,175,80,0.1)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(76,175,80,0.3)'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '0.5rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                Life Extension
              </div>
              <div style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700,
                color: '#4caf50',
                marginBottom: '0.5rem'
              }}>
                +{result.lifeExtensionPercent}%
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.7)'
              }}>
                +{result.yearsGained} additional years
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div style={{
        padding: '1rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.6
      }}>
        <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Calculation Method:</strong> ISO 19438 contamination factor (eC) × bearing L₁₀ life × maintenance strategy multiplier.
      </div>
    </motion.section>
  );
}
