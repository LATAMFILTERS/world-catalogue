'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

const AGENTS = [
  { id: 'technical', label: 'Technical', desc: 'Specs, ISO standards, failure diagnosis' },
  { id: 'sales', label: 'Sales', desc: 'TCO, fleet needs, pricing strategy' },
  { id: 'support', label: 'Support', desc: 'Installation, troubleshooting, warranty' },
  { id: 'marketing', label: 'Marketing', desc: 'Content strategy, positioning' },
];

interface Message { role: 'user' | 'assistant'; content: string; agent?: string; cached?: number; intel?: number; }

export default function ConsultPage() {
  const [agent, setAgent] = useState('technical');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [budgetInfo, setBudgetInfo] = useState<{ used: number; limit: number } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [contentGenerated, setContentGenerated] = useState<{ slug: string; title: string } | null>(null);
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
      const res = await fetch('/api/ai/consult-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          agent,
          history: messages.slice(-6),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Consultation failed');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        agent: data.agent,
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

  const generateContent = async (triggerQuery: string) => {
    setGenerating(true);
    setContentGenerated(null);
    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: triggerQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContentGenerated({ slug: data.slug, title: data.page?.title || data.slug });
    } catch(e: unknown) {
      setError(e instanceof Error ? e.message : 'Content generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const pct = budgetInfo ? Math.round((budgetInfo.used / budgetInfo.limit) * 100) : 0;

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* Header */}
        <Link href="/customer-intelligence" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
          ← CUSTOMER INTELLIGENCE
        </Link>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>// AI CONSULTATION</p>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '0.5rem' }}>
          ELIMFILTERS Expert AI
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Specialized sub-agents for technical, sales, support, and marketing consultations.
        </p>

        {/* Agent selector */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {AGENTS.map(a => (
            <button
              key={a.id}
              onClick={() => setAgent(a.id)}
              style={{
                background: agent === a.id ? '#FFF12D' : 'rgba(255,255,255,0.05)',
                color: agent === a.id ? '#000' : 'rgba(255,255,255,0.7)',
                border: `1px solid ${agent === a.id ? '#FFF12D' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: '2rem', fontFamily: 'JetBrains Mono, monospace' }}>
          {AGENTS.find(a => a.id === agent)?.desc}
        </p>

        {/* Chat area */}
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', minHeight: '300px', maxHeight: '480px', overflowY: 'auto', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', margin: 'auto', textAlign: 'center' }}>
              Ask a question to the {agent} agent…
            </p>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                {m.role === 'assistant' && (
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', marginBottom: '0.35rem' }}>
                    {m.agent?.toUpperCase()} AGENT {m.cached ? `· ${m.cached} cached` : ''}{m.intel ? ` · ${m.intel} intel` : ''}
                  </p>
                )}
                <div style={{
                  background: m.role === 'user' ? 'rgba(255,241,45,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(255,241,45,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
                {m.role === 'assistant' && (
                  <button
                    onClick={() => generateContent(messages[i - 1]?.content || m.content)}
                    disabled={generating}
                    style={{ marginTop: '0.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', padding: '0.25rem 0.6rem', cursor: 'pointer' }}
                  >
                    {generating ? 'Generating page…' : '+ Generate Knowledge Page'}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
              thinking…
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Content generated notification */}
        <AnimatePresence>
          {contentGenerated && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: 'rgba(255,241,45,0.08)', border: '1px solid rgba(255,241,45,0.3)', borderRadius: '6px', padding: '0.85rem 1.25rem', marginBottom: '1rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#FFF12D' }}>
              ✓ Knowledge page generated: <strong>{contentGenerated.title}</strong><br />
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>/knowledge-system/generated/{contentGenerated.slug}</span>
            </motion.div>
          )}
        </AnimatePresence>

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
            placeholder="Type your question… (Enter to send, Shift+Enter for new line)"
            rows={2}
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', padding: '0.75rem 1rem', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={send}
            disabled={loading || !query.trim()}
            style={{ background: loading || !query.trim() ? 'rgba(255,241,45,0.3)' : '#FFF12D', color: '#000', border: 'none', borderRadius: '6px', padding: '0 1.5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem', cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.15s', whiteSpace: 'nowrap' }}
          >
            Send
          </button>
        </div>

        {/* Budget indicator */}
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
