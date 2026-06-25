'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';

const EVENT_TYPES = ['Installation', 'Service', 'Replacement', 'Inspection', 'Failure', 'Other'];

const FIELD: { key: string; label: string; type?: string; options?: string[] }[] = [
  { key: 'distributor', label: 'Distributor' },
  { key: 'customer', label: 'Customer' },
  { key: 'equipment_make', label: 'Equipment Make' },
  { key: 'equipment_model', label: 'Equipment Model' },
  { key: 'part_number', label: 'Part Number' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'operating_hours', label: 'Operating Hours', type: 'number' },
  { key: 'event_type', label: 'Event Type', options: EVENT_TYPES },
];

type FormState = Record<string, string>;

const empty: FormState = Object.fromEntries(FIELD.map(f => [f.key, '']));

export default function EventsPage() {
  const [form, setForm] = useState<FormState>(empty);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');
    try {
      const res = await fetch('/api/intelligence/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Save failed');
      setStatus('success');
      setForm(empty);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '6px',
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.95rem',
    padding: '0.65rem 0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '4rem 2rem' }}>
        <Link href="/customer-intelligence" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
          ← CUSTOMER INTELLIGENCE
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
            // LOG EVENT
          </p>
          <h1 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '2.5rem' }}>
            New Intelligence Event
          </h1>

          {status === 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,241,45,0.08)', border: '1px solid rgba(255,241,45,0.35)', borderRadius: '6px', padding: '1rem 1.25rem', marginBottom: '2rem', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
              ✓ Event saved successfully.
            </motion.div>
          )}

          {status === 'error' && (
            <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.35)', borderRadius: '6px', padding: '1rem 1.25rem', marginBottom: '2rem', color: '#ff6b6b', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
              Error: {errorMsg}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {FIELD.map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                    {f.label.toUpperCase()}
                  </label>
                  {f.options ? (
                    <select
                      value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select type…</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.label}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
            </div>

            <motion.button
              type="submit"
              disabled={status === 'saving'}
              whileHover={{ background: status === 'saving' ? undefined : '#e6d800' }}
              style={{ marginTop: '0.5rem', background: '#FFF12D', color: '#000', border: 'none', borderRadius: '6px', padding: '0.85rem 2rem', fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: status === 'saving' ? 'not-allowed' : 'pointer', opacity: status === 'saving' ? 0.6 : 1, alignSelf: 'flex-start', transition: 'background 0.2s' }}
            >
              {status === 'saving' ? 'Saving…' : 'Save Event'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
