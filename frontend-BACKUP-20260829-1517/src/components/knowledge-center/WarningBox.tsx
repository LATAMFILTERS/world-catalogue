'use client';

import React from 'react';

export type WarningBoxVariant = 'warning' | 'info' | 'draft';

interface VariantStyle {
  border: string;
  background: string;
  labelColor: string;
  defaultLabel: string;
}

const VARIANT_STYLES: Record<WarningBoxVariant, VariantStyle> = {
  warning: {
    border: 'rgba(255,80,80,0.3)',
    background: 'rgba(255,80,80,0.04)',
    labelColor: 'rgba(255,80,80,0.7)',
    defaultLabel: 'WARNING',
  },
  info: {
    border: 'rgba(255,241,45,0.25)',
    background: 'rgba(255,241,45,0.04)',
    labelColor: '#FFF12D',
    defaultLabel: 'NOTE',
  },
  draft: {
    border: 'rgba(255,241,45,0.2)',
    background: 'rgba(255,241,45,0.03)',
    labelColor: 'rgba(255,241,45,0.6)',
    defaultLabel: 'DRAFT STATUS',
  },
};

export interface WarningBoxProps {
  title?: string;
  children: React.ReactNode;
  variant?: WarningBoxVariant;
}

export default function WarningBox({ title, children, variant = 'warning' }: WarningBoxProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div style={{
      border: `1px solid ${styles.border}`,
      background: styles.background,
      padding: '1.25rem 1.5rem',
      marginBottom: '2.5rem',
    }}>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.6rem',
        letterSpacing: '0.1em',
        color: styles.labelColor,
        marginBottom: '0.6rem',
      }}>
        {title ?? styles.defaultLabel}
      </p>
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.88rem',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.7,
      }}>
        {children}
      </div>
    </div>
  );
}
