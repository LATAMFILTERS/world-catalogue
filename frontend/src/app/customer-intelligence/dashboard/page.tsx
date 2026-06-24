'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface DashboardData {
  total_events: number;
  top_part_numbers: { part_number: string; count: string }[];
  top_distributors: { distributor: string; count: string }[];
  top_countries: { country: string; count: string }[];
}

function RankList({ title, rows, labelKey }: { title: string; rows: { count: string; [k: string]: string }[]; labelKey: string }) {
  const max = rows.length ? parseInt(rows[0].count) : 1;
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1.5rem' }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
        {title}
      </p>
      {rows.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No data yet.</p>
      )}
      {rows.map((r, i) => (
        <div key={i} style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>{r[labelKey]}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D' }}>{r.count}</span>
          </div>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(parseInt(r.count) / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              style={{ height: '100%', background: '#FFF12D', borderRadius: '2px' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/intelligence/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
          <div>
            <Link href="/customer-intelligence" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
              ← CUSTOMER INTELLIGENCE
            </Link>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
              // DASHBOARD
            </p>
            <h1 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700 }}>
              Intelligence Overview
            </h1>
          </div>
          <Link href="/customer-intelligence/events" style={{ background: '#FFF12D', color: '#000', fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.875rem', padding: '0.65rem 1.25rem', borderRadius: '6px', textDecoration: 'none', alignSelf: 'flex-end' }}>
            + Log Event
          </Link>
        </div>

        {loading && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>Loading…</p>
        )}

        {error && (
          <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: '6px', padding: '1rem', color: '#ff6b6b', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
            Error: {error}
          </div>
        )}

        {data && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Total events stat */}
            <div style={{ border: '1px solid rgba(255,241,45,0.2)', background: 'rgba(255,241,45,0.04)', borderRadius: '8px', padding: '1.75rem 2rem', marginBottom: '2rem', display: 'inline-flex', flexDirection: 'column', gap: '0.25rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em' }}>TOTAL EVENTS</p>
              <p style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, color: '#FFF12D', lineHeight: 1 }}>
                {data.total_events.toLocaleString()}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <RankList title="TOP PART NUMBERS" rows={data.top_part_numbers} labelKey="part_number" />
              <RankList title="TOP DISTRIBUTORS" rows={data.top_distributors} labelKey="distributor" />
              <RankList title="TOP COUNTRIES" rows={data.top_countries} labelKey="country" />
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
