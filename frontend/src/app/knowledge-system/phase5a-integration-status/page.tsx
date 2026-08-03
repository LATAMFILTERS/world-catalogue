'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

interface IntegrationStatus {
  status: 'no-data' | 'integrated' | 'loading' | 'error';
  data?: {
    timestamp: string;
    stats: {
      faqsIntegrated: number;
      validationIssuesFound: number;
      podcastScriptReceived: boolean;
      improvementsSuggested: number;
    };
  };
  error?: string;
}

export default function Phase5AIntegrationStatusPage() {
  const [status, setStatus] = useState<IntegrationStatus>({ status: 'loading' });

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/phase5a-submit');
        const data: IntegrationStatus = await response.json();
        setStatus(data);
      } catch (error) {
        setStatus({
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to fetch status',
        });
      }
    }

    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Navigation */}
      <Link
        href="/knowledge-system/phase5a-output-intake"
        style={{
          display: 'inline-block',
          margin: '2rem',
          color: '#FFF12D',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        ← BACK TO PHASE 5A
      </Link>

      {/* Hero */}
      <section
        style={{
          padding: 'clamp(2rem, 5vw, 4rem)',
          background: 'linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(255,241,45,0.05) 100%)',
          borderBottom: '2px solid rgba(255,241,45,0.15)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,241,45,0.7)', marginBottom: '1rem' }}>
            // PHASE 5A INTEGRATION STATUS
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              margin: '0 0 1rem 0',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.2,
            }}
          >
            Phase 5A Auto-Integration Status
          </h1>
        </motion.div>
      </section>

      {/* Status Display */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 2rem' }}>
        {status.status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,241,45,0.2)',
                borderTop: '3px solid #FFF12D',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>
              Checking integration status...
            </p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </motion.div>
        )}

        {status.status === 'no-data' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ background: 'rgba(255,241,45,0.05)', border: '2px solid rgba(255,241,45,0.2)', borderRadius: '8px', padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)' }}>
                ⏳ No Phase 5A outputs submitted yet
              </p>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Phase 5A outputs are awaiting submission. Once you complete the 4 NotebookLM prompts and submit them, they will appear here with full integration status.
              </p>
              <Link
                href="/knowledge-system/phase5a-output-intake"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: '#FFF12D',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.85rem',
                }}
              >
                Go to Phase 5A Intake →
              </Link>
            </div>
          </motion.div>
        )}

        {status.status === 'integrated' && status.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Success Header */}
            <div style={{ background: 'rgba(124,179,66,0.1)', border: '2px solid rgba(124,179,66,0.3)', borderRadius: '8px', padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>✓</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#fff' }}>
                Phase 5A Successfully Integrated
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(124,179,66,0.9)', margin: 0 }}>
                {new Date(status.data.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Integration Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {[
                { label: 'Technical FAQs', value: status.data.stats.faqsIntegrated, icon: '📋' },
                { label: 'Validation Issues', value: status.data.stats.validationIssuesFound, icon: '✓' },
                { label: 'Podcast Script', value: status.data.stats.podcastScriptReceived ? 'Ready' : 'Pending', icon: '🎙️' },
                { label: 'Improvements', value: status.data.stats.improvementsSuggested, icon: '💡' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  style={{
                    background: 'rgba(255,241,45,0.03)',
                    border: '1px solid rgba(255,241,45,0.15)',
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{stat.icon}</p>
                  <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#FFF12D', margin: '0 0 0.5rem 0' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Integration Roadmap */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ marginBottom: '3rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                Next Steps & Integration Roadmap
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {[
                  {
                    phase: '1',
                    title: 'FAQs Integration',
                    status: status.data.stats.faqsIntegrated > 0 ? '✓ Complete' : 'Pending',
                    desc: 'Technical FAQs populated into /knowledge-system/faqs/technical-faqs/',
                  },
                  {
                    phase: '2',
                    title: 'Podcast Script Ready',
                    status: status.data.stats.podcastScriptReceived ? '✓ Complete' : 'Pending',
                    desc: 'Script saved and ready for professional voice recording',
                  },
                  {
                    phase: '3',
                    title: 'Validation Review',
                    status: status.data.stats.validationIssuesFound > 0 ? '⚠️ Issues Found' : '✓ No Issues',
                    desc: `${status.data.stats.validationIssuesFound} technical issues identified and documented`,
                  },
                  {
                    phase: '4',
                    title: 'Improvements Queue',
                    status: status.data.stats.improvementsSuggested > 0 ? '→ Queued' : 'None',
                    desc: `${status.data.stats.improvementsSuggested} improvement suggestions for Phase 5B/5C`,
                  },
                ].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + idx * 0.08 }}
                    style={{
                      background: 'rgba(255,241,45,0.02)',
                      border: '1px solid rgba(255,241,45,0.12)',
                      borderRadius: '6px',
                      padding: '1.5rem',
                      borderLeft: '4px solid rgba(255,241,45,0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, margin: 0 }}>
                        PHASE {step.phase}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,241,45,0.8)', margin: 0 }}>
                        {step.status}
                      </p>
                    </div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: '0 0 0.5rem 0' }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Next Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              style={{
                background: 'rgba(255,241,45,0.05)',
                border: '2px solid rgba(255,241,45,0.2)',
                borderRadius: '8px',
                padding: '2rem',
              }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', marginBottom: '1rem', textTransform: 'uppercase' }}>
                Recommended Next Actions
              </p>
              <ul style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', margin: 0, paddingLeft: '1.5rem' }}>
                <li>Review technical validation findings for accuracy</li>
                <li>Schedule professional podcast recording (ElevenLabs, Podcastle, or local studio)</li>
                <li>Integrate improvement suggestions into Phase 5B/5C roadmap</li>
                <li>Publish podcast episodes to Spotify, Apple Podcasts, YouTube</li>
                <li>Monitor FAQ usage and technical understanding improvements</li>
              </ul>
            </motion.div>
          </motion.div>
        )}

        {status.status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'rgba(200,60,60,0.1)',
              border: '2px solid rgba(200,60,60,0.3)',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '1.5rem', margin: '0 0 1rem 0' }}>⚠️</p>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#fff' }}>
              Error checking integration status
            </p>
            <p style={{ fontSize: '0.9rem', color: 'rgba(200,60,60,0.9)', margin: 0 }}>
              {status.error}
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
