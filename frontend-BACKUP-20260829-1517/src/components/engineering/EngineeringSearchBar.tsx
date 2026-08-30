'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { search } from '@/lib/services';
import type { SearchResult } from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import type { CustomerIntent } from '@/components/conversion/ConversionContext';

// ─── Intent detection ─────────────────────────────────────────────────────────

function detectIntent(query: string): CustomerIntent {
  const q = query.trim();
  if (/^[A-Z]{2,4}-[A-Z0-9-]+$/.test(q)) return 'TECHNOLOGY_RESEARCH';
  if (/^(E[ALHCFSWTEM][0-9]{4,})/i.test(q)) return 'KNOWN_PART';
  if (/\b(fail|broke|problem|drop|loss|leak|black|smoke|wear|seize|stuck|clog)\b/i.test(q)) return 'FAILURE_DIAGNOSIS';
  if (/\b(dust|water|particle|contam|silica|wear|soot|varnish)\b/i.test(q)) return 'FAILURE_DIAGNOSIS';
  if (/\b(ISO|SAE|ASTM|NFPA|DIN)\b/.test(q)) return 'SUPPLIER_EVALUATION';
  if (/\b(protect|prevent|reduc|extend|improve)\b/i.test(q)) return 'PROACTIVE_PROTECTION';
  return 'TECHNOLOGY_RESEARCH';
}

const INTENT_LABELS: Record<CustomerIntent, string> = {
  KNOWN_PART: 'Part Number',
  EQUIPMENT_REPLACEMENT: 'Equipment',
  FAILURE_DIAGNOSIS: 'Problem / Failure',
  PROACTIVE_PROTECTION: 'Protection',
  TECHNOLOGY_RESEARCH: 'Technology / Knowledge',
  SUPPLIER_EVALUATION: 'Standard / Specification',
  DISTRIBUTOR: 'Distributor',
  UNKNOWN: 'Search',
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  ENGINEERING_PRINCIPLE: 'Principle',
  TECHNOLOGY_ARCHITECTURE: 'Technology',
  PROTECTION_MEDIA: 'Media',
  STANDARD: 'Standard',
  FAILURE_MODE: 'Failure Mode',
  CONTAMINATION: 'Contamination',
  ENGINEERING_MEMORY: 'Field Record',
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
  ENGINEERING_PRINCIPLE: '#7dd3fc',
  TECHNOLOGY_ARCHITECTURE: '#FFF12D',
  PROTECTION_MEDIA: '#86efac',
  STANDARD: '#c4b5fd',
  FAILURE_MODE: '#fca5a5',
  CONTAMINATION: '#fdba74',
  ENGINEERING_MEMORY: 'rgba(255,255,255,0.4)',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface EngineeringSearchBarProps {
  placeholder?: string;
  onResult?: (results: SearchResult[], intent: CustomerIntent) => void;
  autoFocus?: boolean;
  initialQuery?: string;
  compact?: boolean;
}

export function EngineeringSearchBar({
  placeholder = 'Part number, equipment, problem, or technology…',
  onResult,
  autoFocus = false,
  initialQuery = '',
  compact = false,
}: EngineeringSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [intent, setIntent] = useState<CustomerIntent>('UNKNOWN');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { dispatchTrustSignal, setIntent: setCtxIntent, setSearchResults } = useConversion();

  const runSearch = useCallback((q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    const detected = detectIntent(q);
    setIntent(detected);
    setCtxIntent(detected);
    const hits = search(q, { maxResults: 8 });
    setResults(hits);
    setSearchResults(hits);
    setOpen(hits.length > 0);
    setActiveIdx(-1);
    if (hits.length > 0) {
      dispatchTrustSignal('T-1');
      onResult?.(hits, detected);
    }
  }, [dispatchTrustSignal, setCtxIntent, setSearchResults, onResult]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, runSearch]);

  function handleKey(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1); }
    if (e.key === 'Enter' && activeIdx >= 0) {
      handleSelect(results[activeIdx]);
    }
  }

  function handleSelect(result: SearchResult) {
    setQuery(result.label);
    setOpen(false);
    onResult?.([result], intent);
  }

  const scoreWidth = (score: number) => `${Math.max(score, 4)}%`;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Input row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '6px', padding: compact ? '0.6rem 1rem' : '0.85rem 1.25rem',
        transition: 'border-color 0.2s',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: compact ? '0.9rem' : '1rem',
            fontFamily: 'Inter, sans-serif',
          }}
          aria-label="Engineering search"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {query && intent !== 'UNKNOWN' && (
          <span style={{
            fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
            color: '#FFF12D', background: 'rgba(255,241,45,0.1)',
            padding: '0.2rem 0.5rem', borderRadius: '3px', whiteSpace: 'nowrap',
          }}>
            {INTENT_LABELS[intent]}
          </span>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: '#111', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px', overflow: 'hidden', zIndex: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
            role="listbox"
          >
            <div style={{
              padding: '0.5rem 1rem 0.4rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {results.length} result{results.length !== 1 ? 's' : ''} · matched on field
            </div>
            {results.map((r, i) => (
              <button
                key={r.nodeId}
                role="option"
                aria-selected={i === activeIdx}
                onClick={() => handleSelect(r)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'flex-start',
                  gap: '0.75rem', padding: '0.75rem 1rem',
                  background: i === activeIdx ? 'rgba(255,241,45,0.08)' : 'transparent',
                  border: 'none', borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{
                  fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '3px',
                  background: ENTITY_TYPE_COLORS[r.entityType] + '22',
                  color: ENTITY_TYPE_COLORS[r.entityType],
                  fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'nowrap', marginTop: '0.15rem',
                }}>
                  {ENTITY_TYPE_LABELS[r.entityType] ?? r.entityType}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.15rem' }}>
                    {r.label}
                  </div>
                  {r.excerpt && (
                    <div style={{
                      color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      …{r.excerpt}…
                    </div>
                  )}
                  <div style={{
                    fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)',
                    marginTop: '0.25rem',
                  }}>
                    Matched: {r.matchedFields.join(', ')}
                  </div>
                </div>
                {/* Score bar */}
                <div style={{
                  width: '40px', display: 'flex', flexDirection: 'column',
                  alignItems: 'flex-end', gap: '0.2rem',
                }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {r.score}
                  </div>
                  <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                    <div style={{
                      width: scoreWidth(r.score), height: '100%',
                      background: '#FFF12D', borderRadius: '2px',
                    }} />
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
