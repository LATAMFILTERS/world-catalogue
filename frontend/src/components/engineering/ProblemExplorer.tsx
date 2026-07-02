'use client';

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { search } from '@/lib/services';
import type { SearchResult } from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';

interface ProblemExplorerProps {
  onFailureModeSelected: (failureModeEntityId: string) => void;
}

const QUICK_SYMPTOMS = [
  'Filter blinding too fast',
  'Hydraulic pressure dropping',
  'Oil turning black quickly',
  'Fuel injector problems',
  'Turbocharger wear',
  'Bearing failure',
  'Valve stiction',
  'Coolant contamination',
];

export function ProblemExplorer({ onFailureModeSelected }: ProblemExplorerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { dispatchTrustSignal } = useConversion();

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    const hits = search(q, { entityTypes: ['FAILURE_MODE', 'CONTAMINATION'], maxResults: 6 });
    setResults(hits);
    setHasSearched(true);
    if (hits.length > 0) dispatchTrustSignal('T-1');
  }, [dispatchTrustSignal]);

  function handleConfirm(entityId: string) {
    setSelectedId(entityId);
    dispatchTrustSignal('T-1');
    onFailureModeSelected(entityId);
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)',
          fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem',
        }}>
          DESCRIBE YOUR PROBLEM
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', margin: 0 }}>
          Tell us what you are observing. We will identify the underlying failure mode and its root cause.
        </p>
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: '0.75rem',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '1rem',
      }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && runSearch(query)}
          placeholder="e.g. filter blinding, pressure loss, oil darkening…"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
          }}
          aria-label="Describe your equipment problem"
        />
        <button
          onClick={() => runSearch(query)}
          style={{
            padding: '0.45rem 1rem', background: '#FFF12D', border: 'none',
            borderRadius: '4px', color: '#000', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          Diagnose
        </button>
      </div>

      {/* Quick symptoms */}
      {!hasSearched && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>
            COMMON PROBLEMS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {QUICK_SYMPTOMS.map(symptom => (
              <button
                key={symptom}
                onClick={() => { setQuery(symptom); runSearch(symptom); }}
                style={{
                  padding: '0.35rem 0.75rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
                  color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer',
                }}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && results.length === 0 && (
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', padding: '1rem 0' }}>
          No matches found. Try describing the symptom differently, or{' '}
          <button
            onClick={() => { setHasSearched(false); setQuery(''); }}
            style={{ background: 'none', border: 'none', color: '#FFF12D', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            browse common problems
          </button>.
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.25rem' }}>
            POSSIBLE MATCHES — Select the one that best describes your situation
          </div>
          {results.map((r, i) => (
            <motion.button
              key={r.nodeId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleConfirm(r.entityId)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '1rem', background: selectedId === r.entityId ? 'rgba(255,241,45,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedId === r.entityId ? 'rgba(255,241,45,0.3)' : 'rgba(252,165,165,0.15)'}`,
                borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '3px',
                background: 'rgba(252,165,165,0.1)', color: '#fca5a5',
                fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', marginTop: '0.1rem',
              }}>
                {r.entityType === 'FAILURE_MODE' ? 'FAILURE' : 'CONTAMINATION'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginBottom: '0.2rem' }}>
                  {r.label}
                </div>
                {r.excerpt && (
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    {r.excerpt}
                  </div>
                )}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', marginTop: '0.1rem' }}>→</div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
