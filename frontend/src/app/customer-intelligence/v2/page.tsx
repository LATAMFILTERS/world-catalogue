'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

const AGENT_LABELS: Record<string, string> = {
  hydraulic: 'Hydraulic',
  filtration: 'Filtration',
  tribology: 'Tribology',
  materials: 'Materials',
  combustion: 'Combustion',
  reliability: 'Reliability',
  contamination: 'Contamination',
  standards: 'Standards',
  experience: 'Field Exp.',
  philosophy: 'Philosophy',
};

interface Routing {
  agents: string[];
  system: string;
  complexity: string;
  primary_concern: string;
  model: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  routing?: Routing;
  blocked?: boolean;
  cached?: number;
  intel?: number;
}

function genSessionId() { return `v2-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

export default function V2ConsultPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [budgetInfo, setBudgetInfo] = useState<{ used: number; limit: number } | null>(null);
  const [sessionId] = useState(genSessionId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!query.trim() || loading) return;
    const userMsg = query.trim();
    setQuery('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai/v2/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, session_id: sessionId, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Consultation failed');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        routing: data.routing,
        blocked: data.blocked,
        cached: data.usage?.cached,
        intel: data.intel_entries,
      }]);
      setBudgetInfo({ used: data.budget_used, limit: data.budget_limit });
    } catch(e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const pct = budgetInfo ? Math.round((budgetInfo.used / budgetInfo.limit) * 100) : 0;

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <Link href="/customer-intelligence" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
          ← CUSTOMER INTELLIGENCE
        </Link>

        <h1 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '0.5rem' }}>
          Multi-Agent Technical Reasoning
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.6, textAlign: 'justify' }}>
          Chief Reasoning Engine routes your query to specialist agents: Hydraulic, Filtration, Tribology, Contamination, Standards, and more.
          Every response requires traceability — physical principle, standard applied, confidence level.
        </p>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginBottom: '2rem' }}>
          SESSION {sessionId} · 10 specialist agents · traceability enforced
        </p>

        {/* Chat area */}
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', minHeight: '300px', maxHeight: '560px', overflowY: 'auto', padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', marginBottom: '1rem' }}>
                Ask a technical filtration or contamination question
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  'Hydraulic pump noise after oil change',
                  'ISO code target for servo valve circuit',
                  'Water in diesel fuel system effects',
                  'Engine wear rate vs filtration level',
                ].map(q => (
                  <button key={q} onClick={() => setQuery(q)} style={{ background: 'rgba(255,241,45,0.06)', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '4px', color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', padding: '0.35rem 0.7rem', cursor: 'pointer' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}
              >
                {m.role === 'assistant' && m.routing && (
                  <div style={{ marginBottom: '0.4rem' }}>
                    {/* Agent chips */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      {m.routing.agents.map(a => (
                        <span key={a} style={{ background: 'rgba(255,241,45,0.12)', border: '1px solid rgba(255,241,45,0.3)', borderRadius: '3px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#FFF12D', padding: '0.1rem 0.4rem' }}>
                          {AGENT_LABELS[a] || a}
                        </span>
                      ))}
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', padding: '0.1rem 0.4rem' }}>
                        {m.routing.model?.includes('sonnet') ? 'sonnet' : 'haiku'} · {m.routing.system}
                        {m.cached ? ` · ${m.cached} cached` : ''}
                        {m.intel ? ` · ${m.intel} intel` : ''}
                      </span>
                    </div>
                    {m.routing.primary_concern && (
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                        Detected: {m.routing.primary_concern}
                      </p>
                    )}
                  </div>
                )}

                {m.role === 'user' && (
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.3rem', textAlign: 'right' }}>YOU</p>
                )}

                <div style={{
                  background: m.role === 'user' ? 'rgba(255,241,45,0.06)' : m.blocked ? 'rgba(255,60,60,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(255,241,45,0.15)' : m.blocked ? 'rgba(255,60,60,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '8px',
                  padding: '1rem 1.1rem',
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  textAlign: 'justify',
                  whiteSpace: 'pre-wrap',
                  fontFamily: m.blocked ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                }}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>Chief Reasoning Engine routing…</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '1rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
                Specialist agents analyzing…
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: '6px', padding: '0.85rem 1.25rem', marginBottom: '1rem', color: '#ff6b6b', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Describe the technical problem or ask a filtration question… (Enter to send)"
            rows={2}
            style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', padding: '0.75rem 1rem', outline: 'none', resize: 'none' }}
          />
          <button
            onClick={send}
            disabled={loading || !query.trim()}
            style={{ background: loading || !query.trim() ? 'rgba(255,241,45,0.3)' : '#FFF12D', color: '#000', border: 'none', borderRadius: '6px', padding: '0 1.5rem', fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.9rem', cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            Analyze
          </button>
        </div>

        {/* Budget */}
        {budgetInfo && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>MONTHLY TOKEN BUDGET</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: pct > 80 ? '#ff6b6b' : 'rgba(255,255,255,0.35)' }}>
                {budgetInfo.used.toLocaleString()} / {budgetInfo.limit.toLocaleString()} ({pct}%)
              </span>
            </div>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct > 80 ? '#ff6b6b' : '#FFF12D', borderRadius: '2px', transition: 'width 0.4s' }} />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
