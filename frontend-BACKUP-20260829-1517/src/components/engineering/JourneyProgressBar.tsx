'use client';

import { motion } from 'motion/react';
import type { JourneyId } from '@/components/conversion/ConversionContext';

interface JourneyProgressBarProps {
  journeyId: JourneyId;
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
  stepLabels?: string[];
}

const JOURNEY_LABELS: Record<JourneyId, string> = {
  PART_NUMBER: 'Journey 1 — Part Number',
  ASSET_PROTECTION: 'Journey 2 — Asset Protection',
  PROBLEM_DIAGNOSIS: 'Journey 3 — Problem Diagnosis',
  LEARNING: 'Journey 4 — Engineering Intelligence',
};

export function JourneyProgressBar({
  journeyId, totalSteps, currentStep, completedSteps, onStepClick, stepLabels = [],
}: JourneyProgressBarProps) {
  return (
    <div style={{ padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{
        fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)',
        fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem',
      }}>
        {JOURNEY_LABELS[journeyId]}
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap' }}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = completedSteps.includes(stepNum);
          const isCurrent = stepNum === currentStep;
          const isAccessible = isCompleted || isCurrent;

          return (
            <div key={stepNum} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Dot */}
              <button
                onClick={() => isAccessible && onStepClick(stepNum)}
                disabled={!isAccessible}
                title={stepLabels[i] ?? `Step ${stepNum}`}
                aria-label={`Step ${stepNum}${stepLabels[i] ? ': ' + stepLabels[i] : ''}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                style={{
                  width: isCurrent ? '28px' : '18px',
                  height: isCurrent ? '28px' : '18px',
                  borderRadius: '50%',
                  background: isCompleted ? '#FFF12D' : isCurrent ? 'transparent' : 'rgba(255,255,255,0.08)',
                  border: isCurrent ? '2px solid #FFF12D' : isCompleted ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  cursor: isAccessible ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', flexShrink: 0, transition: 'all 0.2s',
                  padding: 0,
                }}
              >
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFF12D' }}
                  />
                )}
                {isCompleted && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
                {!isCurrent && !isCompleted && (
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {stepNum}
                  </span>
                )}
              </button>

              {/* Connector line */}
              {stepNum < totalSteps && (
                <div style={{
                  width: '2rem', height: '2px',
                  background: completedSteps.includes(stepNum) ? '#FFF12D' : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current step label */}
      {stepLabels[currentStep - 1] && (
        <div style={{
          marginTop: '0.6rem', fontSize: '0.78rem',
          color: 'rgba(255,255,255,0.5)',
        }}>
          Step {currentStep}: {stepLabels[currentStep - 1]}
        </div>
      )}
    </div>
  );
}
