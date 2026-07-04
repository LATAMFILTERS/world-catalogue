'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: 'rgba(255,80,80,0.6)',
  high: 'rgba(255,160,60,0.6)',
  medium: 'rgba(255,241,45,0.5)',
  low: 'rgba(255,255,255,0.3)',
};

export interface IndustryApplicationProps {
  industry: string;
  description?: string;
  severity?: SeverityLevel;
  href?: string;
}

export default function IndustryApplication({
  industry,
  description,
  severity,
  href,
}: IndustryApplicationProps) {
  const inner = (
    <motion.div
      whileHover={href ? { borderColor: 'rgba(255,241,45,0.25)' } : {}}
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: severity ? `3px solid ${SEVERITY_COLORS[severity]}` : undefined,
        padding: '1rem',
        transition: 'border-color 0.2s',
      }}
    >
      <p style={{
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        fontSize: '0.88rem',
        color: '#fff',
        marginBottom: description ? '0.3rem' : '0',
        lineHeight: 1.25,
      }}>
        {industry}
      </p>
      {description && (
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      )}
      {severity && (
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.55rem',
          letterSpacing: '0.08em',
          color: SEVERITY_COLORS[severity],
          marginTop: '0.5rem',
        }}>
          {severity.toUpperCase()} EXPOSURE
        </p>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </Link>
    );
  }
  return inner;
}
