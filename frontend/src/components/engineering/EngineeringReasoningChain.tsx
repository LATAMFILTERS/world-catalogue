'use client';

import { motion } from 'motion/react';
import type { NodeEntityType } from '@/lib/graph/graph-types';

export interface ChainStep {
  entityId: string;
  entityType: NodeEntityType | string;
  label: string;
  relationshipToNext?: string;
}

interface EngineeringReasoningChainProps {
  steps: ChainStep[];
  activeStep?: number;
  orientation?: 'horizontal' | 'vertical';
}

const ENTITY_COLORS: Record<string, string> = {
  ENGINEERING_PRINCIPLE: '#7dd3fc',
  TECHNOLOGY_ARCHITECTURE: '#FFF12D',
  PROTECTION_MEDIA: '#86efac',
  STANDARD: '#c4b5fd',
  FAILURE_MODE: '#fca5a5',
  CONTAMINATION: '#fdba74',
  ENGINEERING_MEMORY: 'rgba(255,255,255,0.4)',
};

export function EngineeringReasoningChain({
  steps, activeStep = -1, orientation = 'horizontal',
}: EngineeringReasoningChainProps) {
  if (steps.length === 0) return null;

  const isVertical = orientation === 'vertical';

  return (
    <div
      aria-label={`Engineering path: ${steps.length} steps`}
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: isVertical ? 'flex-start' : 'center',
        gap: isVertical ? '0' : '0',
        flexWrap: isVertical ? 'nowrap' : 'wrap',
        overflowX: isVertical ? 'visible' : 'auto',
        padding: '0.25rem 0',
      }}
    >
      {steps.map((step, i) => {
        const color = ENTITY_COLORS[step.entityType] ?? 'rgba(255,255,255,0.6)';
        const isActive = i === activeStep;

        return (
          <div
            key={step.entityId + i}
            style={{
              display: 'flex',
              flexDirection: isVertical ? 'column' : 'row',
              alignItems: isVertical ? 'flex-start' : 'center',
            }}
          >
            {/* Node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              style={{
                padding: '0.35rem 0.7rem', borderRadius: '4px',
                background: isActive ? color + '20' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`,
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <div style={{
                fontSize: '0.6rem', color: color,
                fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.1rem',
              }}>
                {step.entityType.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '0.78rem', color: isActive ? '#fff' : 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                {step.label.length > 24 ? step.label.slice(0, 22) + '…' : step.label}
              </div>
            </motion.div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div style={{
                display: 'flex',
                flexDirection: isVertical ? 'column' : 'row',
                alignItems: 'center',
                gap: isVertical ? '0.15rem' : '0.3rem',
                padding: isVertical ? '0.3rem 0 0.3rem 0.85rem' : '0 0.3rem',
                flexShrink: 0,
              }}>
                {step.relationshipToNext && (
                  <span style={{
                    fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)',
                    fontFamily: 'JetBrains Mono, monospace',
                    ...(isVertical ? {} : { whiteSpace: 'nowrap' }),
                  }}>
                    {step.relationshipToNext}
                  </span>
                )}
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
                  {isVertical ? '↓' : '→'}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
