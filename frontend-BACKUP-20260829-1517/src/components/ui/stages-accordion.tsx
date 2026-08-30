'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export interface TechStage {
  tag: string;
  number: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
}

interface StagesAccordionProps {
  stages: TechStage[];
}

const accentOpacity = (idx: number) => 1 - idx * 0.22;

export function StagesAccordion({ stages }: StagesAccordionProps) {
  const [open, setOpen] = useState<number>(0);

  const toggle = (idx: number) => setOpen(prev => (prev === idx ? -1 : idx));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {stages.map((stage, idx) => {
        const isOpen = open === idx;
        const accent = `rgba(255,241,45,${accentOpacity(idx)})`;

        return (
          <div
            key={idx}
            style={{
              background: `rgba(255,255,255,${0.018 - idx * 0.002})`,
              border: '1px solid rgba(255,255,255,0.04)',
              borderLeft: `3px solid ${accent}`,
            }}
          >
            {/* Trigger */}
            <button
              type="button"
              onClick={() => toggle(idx)}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr auto auto',
                gap: '1.25rem',
                alignItems: 'center',
                width: '100%',
                padding: '1.4rem 1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {/* Tag + number */}
              <div>
                <div style={{ fontSize: '0.48rem', letterSpacing: '0.22em', color: accent, fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.35rem', lineHeight: 1 }}>
                  {stage.tag}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.05)', fontFamily: 'Titillium Web, sans-serif', lineHeight: 1 }}>
                  {stage.number}
                </div>
              </div>

              {/* Title */}
              <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Titillium Web, sans-serif', color: isOpen ? '#FFF12D' : '#fff', letterSpacing: '0.02em', transition: 'color 0.2s' }}>
                {stage.title}
              </span>

              {/* Stat (hidden when open) */}
              <div style={{ textAlign: 'right', opacity: isOpen ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: 'none' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Titillium Web, sans-serif', lineHeight: 1 }}>{stage.stat}</div>
                <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Titillium Web, sans-serif', marginTop: '0.25rem', maxWidth: '88px', textAlign: 'right', lineHeight: 1.4 }}>{stage.statLabel}</div>
              </div>

              {/* Chevron */}
              <ChevronDown
                style={{
                  width: '1rem',
                  height: '1rem',
                  color: 'rgba(255,255,255,0.3)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0,
                }}
              />
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
                    <p style={{ fontSize: '0.86rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.5)', fontFamily: 'Titillium Web, sans-serif', margin: 0, maxWidth: '600px' }}>
                      {stage.body}
                    </p>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Titillium Web, sans-serif', lineHeight: 1 }}>{stage.stat}</div>
                      <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Titillium Web, sans-serif', marginTop: '0.3rem', maxWidth: '90px', textAlign: 'right', lineHeight: 1.4 }}>{stage.statLabel}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
