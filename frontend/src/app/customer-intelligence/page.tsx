'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function CustomerIntelligencePage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', letterSpacing: '0.12em', marginBottom: '1rem' }}>
            // CUSTOMER INTELLIGENCE
          </p>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '1rem' }}>
            Customer Intelligence
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: '3rem', lineHeight: 1.7 }}>
            Capture and analyze field events — equipment installs, service intervals, and part usage — to build operational intelligence across your distributor network.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>

            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.4)' }} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2rem', transition: 'border-color 0.2s' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', marginBottom: '0.75rem' }}>00</p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>AI Consultation</h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Technical, sales, support and marketing sub-agents. Generates Knowledge pages from queries.
              </p>
              <Link href="/customer-intelligence/consult" style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', textDecoration: 'none' }}>
                CONSULT AI →
              </Link>
            </motion.div>
            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.4)' }} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2rem', transition: 'border-color 0.2s' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', marginBottom: '0.75rem' }}>01</p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Log Event</h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Record a field event: part installation, service call, or equipment reading.
              </p>
              <Link href="/customer-intelligence/events" style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', textDecoration: 'none' }}>
                ENTER EVENT →
              </Link>
            </motion.div>

            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.4)' }} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2rem', transition: 'border-color 0.2s' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', marginBottom: '0.75rem' }}>02</p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Dashboard</h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                View aggregate metrics: top parts, distributors, and geographic distribution.
              </p>
              <Link href="/customer-intelligence/dashboard" style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', textDecoration: 'none' }}>
                VIEW DASHBOARD →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
