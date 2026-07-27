'use client';

import { useEffect, useState } from 'react';

interface ABTestConfig {
  name: string;
  variants: string[];
  sampleSize: number;
}

const AB_TESTS: Record<string, ABTestConfig> = {
  navigation_layout: {
    name: 'Universal Navigation Layout',
    variants: ['control', 'variant_a'],
    sampleSize: 50,
  },
  cta_text: {
    name: 'CTA Button Text',
    variants: ['explore', 'learn_more'],
    sampleSize: 50,
  },
  hero_section: {
    name: 'Hero Section Animation',
    variants: ['standard', 'enhanced'],
    sampleSize: 25,
  },
};

function getVariantForUser(testName: string, variants: string[], sampleSize: number): string | null {
  if (typeof window === 'undefined') return null;

  const userId = localStorage.getItem('user_id') || Math.random().toString(36).substr(2, 9);
  if (!localStorage.getItem('user_id')) {
    localStorage.setItem('user_id', userId);
  }

  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variantIndex = hash % variants.length;
  const selectedVariant = variants[variantIndex];
  const sampledIn = (hash % 100) < sampleSize;

  if (!sampledIn) return null;

  return selectedVariant;
}

export function ABTestVariantDisplay() {
  const [activeTests, setActiveTests] = useState<Record<string, string>>({});
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const tests: Record<string, string> = {};
    Object.entries(AB_TESTS).forEach(([key, config]) => {
      const variant = getVariantForUser(key, config.variants, config.sampleSize);
      if (variant) {
        tests[key] = variant;
      }
    });
    setActiveTests(tests);
  }, []);

  if (Object.keys(activeTests).length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '2rem',
        zIndex: 100,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.75rem',
      }}
    >
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          background: 'rgba(255,241,45,0.08)',
          border: '1px solid rgba(255,241,45,0.25)',
          color: '#FFF12D',
          padding: '0.5rem 0.75rem',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,241,45,0.12)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,241,45,0.08)';
        }}
        title="A/B Test Variants"
      >
        AB Tests: {Object.keys(activeTests).length}
      </button>

      {showDetails && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '0.5rem',
            background: '#1a1a1a',
            border: '1px solid rgba(255,241,45,0.2)',
            borderRadius: '4px',
            padding: '0.75rem',
            minWidth: '240px',
            maxWidth: '300px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {Object.entries(activeTests).map(([testKey, variant]) => {
            const config = AB_TESTS[testKey];
            return (
              <div
                key={testKey}
                style={{
                  marginBottom: '0.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid rgba(255,241,45,0.1)',
                }}
              >
                <div style={{ color: '#FFF12D', fontWeight: 600, marginBottom: '0.2rem' }}>
                  {config.name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Variant: <span style={{ color: '#FFF12D' }}>{variant}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
