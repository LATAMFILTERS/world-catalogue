'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import type { LeadType } from './ConversionContext';

interface LeadCaptureFormProps {
  leadType: LeadType;
  onSubmitted: () => void;
  onCancel: () => void;
}

const LEAD_LABELS: Record<LeadType, string> = {
  'L-1': 'Engineering Consultation',
  'L-2': 'Request a Quote',
  'L-3': 'Find a Distributor',
  'L-4': 'Download Technical Specification',
  'L-5': 'Engineering Updates',
  'L-6': 'Failure Analysis Request',
  'L-7': 'Training Enquiry',
};

const LEAD_FIELDS: Record<LeadType, string[]> = {
  'L-1': ['name', 'email', 'company', 'phone', 'application'],
  'L-2': ['name', 'email', 'company', 'quantity', 'application'],
  'L-3': ['name', 'email', 'country'],
  'L-4': ['name', 'email', 'company'],
  'L-5': ['name', 'email'],
  'L-6': ['name', 'email', 'company', 'failureDescription'],
  'L-7': ['name', 'email', 'company', 'teamSize'],
};

const FIELD_CONFIG: Record<string, { label: string; type: string; placeholder: string }> = {
  name: { label: 'Full Name', type: 'text', placeholder: 'Your name' },
  email: { label: 'Email Address', type: 'email', placeholder: 'your@company.com' },
  company: { label: 'Company / Organisation', type: 'text', placeholder: 'Company name' },
  phone: { label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000' },
  application: { label: 'Application / Equipment', type: 'text', placeholder: 'e.g. Mining excavators, 50-unit fleet' },
  quantity: { label: 'Estimated Quantity', type: 'text', placeholder: 'e.g. 200 units/year' },
  country: { label: 'Country', type: 'text', placeholder: 'Your country' },
  failureDescription: { label: 'Failure Description', type: 'textarea', placeholder: 'Describe the failure mode, symptoms, and operating conditions.' },
  teamSize: { label: 'Team Size', type: 'text', placeholder: 'Number of participants' },
};

export function LeadCaptureForm({ leadType, onSubmitted, onCancel }: LeadCaptureFormProps) {
  const fields = LEAD_FIELDS[leadType];
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f, '']))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredFields = fields.filter(f => ['name', 'email'].includes(f));
  const isValid = requiredFields.every(f => values[f]?.trim());

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadType, fields: values }),
      });
      if (!res.ok) throw new Error('Submission failed');
      onSubmitted();
    } catch {
      setError('Unable to submit. Please try again or email us directly.');
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '2rem',
      }}
    >
      <div style={{
        fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)',
        fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.4rem',
      }}>
        {leadType}
      </div>
      <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#fff', margin: '0 0 1.5rem' }}>
        {LEAD_LABELS[leadType]}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {fields.map(field => {
          const cfg = FIELD_CONFIG[field];
          return (
            <div key={field}>
              <label style={{
                display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)',
                marginBottom: '0.35rem', fontFamily: 'Inter, sans-serif',
              }}>
                {cfg.label}{requiredFields.includes(field) ? ' *' : ''}
              </label>
              {cfg.type === 'textarea' ? (
                <textarea
                  value={values[field]}
                  onChange={e => setValues(v => ({ ...v, [field]: e.target.value }))}
                  placeholder={cfg.placeholder}
                  rows={4}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px',
                    padding: '0.65rem 0.85rem', color: '#fff',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
              ) : (
                <input
                  type={cfg.type}
                  value={values[field]}
                  onChange={e => setValues(v => ({ ...v, [field]: e.target.value }))}
                  placeholder={cfg.placeholder}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px',
                    padding: '0.65rem 0.85rem', color: '#fff',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ marginTop: '1rem', color: '#fca5a5', fontSize: '0.82rem' }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          style={{
            flex: 1, padding: '0.75rem',
            background: isValid && !submitting ? '#FFF12D' : 'rgba(255,241,45,0.2)',
            border: 'none', borderRadius: '4px',
            color: isValid && !submitting ? '#000' : 'rgba(255,255,255,0.3)',
            fontFamily: 'Outfit, sans-serif', fontWeight: 700,
            fontSize: '0.9rem', cursor: isValid && !submitting ? 'pointer' : 'default',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px', color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
