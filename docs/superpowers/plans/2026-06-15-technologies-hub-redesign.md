# Technologies Hub Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `/technologies` from a filter catalogue into a contamination control technology platform — 9 official technologies, organized by Protection System, with Problem→Contamination→Technology→Outcome narrative structure.

**Architecture:** Single file rewrite of `frontend/src/app/technologies/page.tsx`. No changes to individual technology detail pages (`[slug]/page.tsx` or `techPagesData.ts`) in Phases 1-2. No new pages created. All 9 official technologies sourced from hardcoded data (not catalogue.json which has stale entries).

**Tech Stack:** Next.js 14, React, TypeScript, motion/react (Framer Motion), inline CSS, JetBrains Mono + Titillium Web + Inter fonts (matching site standard — NOT Space Grotesk)

**Branch:** `claude/dazzling-franklin-ALGY1`

---

## Audit Summary (Problems Being Fixed)

1. SYNTEPORE™ misclassified as "Air Intake" — it is "Fuel Cleanliness Technology"
3. All subtitles are product descriptors ("WATER SEPARATOR"), not technology positioning
4. Hero stats are vanity counts, not outcome metrics
5. No problem→contamination entry point — hub opens with catalogue, not context
6. Three redundant "technologies protect assets" sections — narrative fatigue
7. Architecture Map shows 8 domains, doesn't match 5 official Protection Systems
8. INTEKCORE™ framed as a housing product, not Airflow Management Technology
9. Technology cards show long prose, not scannable decision data
10. Font inconsistency — hub uses `Space Grotesk`, rest of site uses `Titillium Web`

---

## Official Technology Registry (Source of Truth)

```typescript
const OFFICIAL_TECHNOLOGIES = [
  {
    name: 'MACROCORE™',
    system: 'Air Intake Protection',
    problem: 'Silica dust · crop residue · particulate intake',
    contamination: 'Airborne particles up to 10,000 mg/m³',
    protects: 'Combustion engines · compressors · turbines',
    outcome: 'Extended engine life · reduced wear events',
    standard: 'ISO 5011',
    slug: 'macrocore',
    accent: '#FFF12D',
  },
  {
    name: 'MICROKAPPA™',
    system: 'Cabin Air Protection',
    problem: 'Diesel particulate · PM2.5 · NOx · allergens',
    contamination: 'PM2.5, PM10, VOCs, biological allergens',
    protects: 'Vehicle cabin air · operator health circuits',
    outcome: 'Reduced occupational exposure · regulatory compliance',
    standard: 'ISO 11155',
    slug: 'microkappa',
    accent: '#a78bfa',
  },
  {
    name: 'DRYCORE™',
    system: 'Compressed Air Protection',
    problem: 'Moisture ingress · vapor-to-liquid phase transition',
    contamination: 'Water vapor · condensate in pneumatic circuits',
    protects: 'Air brake systems · pneumatic actuators · control valves',
    outcome: 'Eliminated brake valve corrosion · extended service intervals',
    standard: 'ISO 8573-1',
    slug: 'drycore',
    accent: '#38bdf8',
  },
  {
    name: 'INTEKCORE™',
    system: 'Airflow Management',
    problem: 'Housing seal failure · bypass under pressure spikes',
    contamination: 'Bypass contamination from housing integrity failure',
    protects: 'Engine intake circuits · filter element integrity',
    outcome: 'Zero bypass events · extended housing service life',
    standard: 'OEM-interchangeable',
    slug: 'intekcore',
    accent: '#fb923c',
  },
  {
    name: 'SYNTEPORE™',
    system: 'Fuel Cleanliness Protection',
    problem: 'Sub-micron injector contamination · HPCR needle wear',
    contamination: 'Particles >4µm in fuel at 1,800–2,500 bar',
    protects: 'HPCR injection systems · fuel pump circuits',
    outcome: 'Extended injector life · eliminated HPCR failure events',
    standard: 'ISO 19438',
    slug: 'syntepore',
    accent: '#fb923c',
  },
  {
    name: 'HYDROCORE™',
    system: 'Fuel Cleanliness Protection',
    problem: 'Free water · emulsified water · microbial growth',
    contamination: 'Water in all phases in diesel and turbine fuel',
    protects: 'Fuel injection systems · injection pumps · fuel tanks',
    outcome: '99.8% water removal · eliminated corrosion events',
    standard: 'SAE J1488',
    slug: 'hydrocore',
    accent: '#fb923c',
  },
  {
    name: 'SYNTRAX™',
    system: 'Lubrication Protection',
    problem: 'Combustion soot · metal wear particles · fuel dilution',
    contamination: 'Particles degrading oil film at ISO 4406 19/17/14+',
    protects: 'Engine bearings · turbocharger shafts · valve train',
    outcome: '3–5× bearing life extension · turbo failure prevention',
    standard: 'ISO 4406',
    slug: 'syntrax',
    accent: '#4ade80',
  },
  {
    name: 'NANOFORCE™',
    system: 'Hydraulic Protection',
    problem: 'Sub-micron valve spool abrasion · dissolved water in hydraulics',
    contamination: 'Particles >3µm in hydraulic circuits at 200–450 bar',
    protects: 'Proportional valves · hydraulic pumps · actuator circuits',
    outcome: 'ISO 4406 16/14/11 maintained · 2× valve service life',
    standard: 'ISO 16889',
    slug: 'nanoforce',
    accent: '#60a5fa',
  },
  {
    name: 'THERMACORE™',
    system: 'Cooling System Protection',
    problem: 'Liner cavitation · SCA depletion · electrochemical corrosion',
    contamination: 'SCA degradation · vapor bubble formation on liner walls',
    protects: 'Wet sleeve liners · cooling circuit metals · coolant chemistry',
    outcome: 'Eliminated liner pitting · sustained coolant protection interval',
    standard: 'ASTM D6210',
    slug: 'thermacore',
    accent: '#a78bfa',
  },
];
```

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/src/app/technologies/page.tsx` | **Rewrite** | Hub page — all 9 official technologies, new architecture |
| `frontend/src/app/technologies/[slug]/techPagesData.ts` | No change (Phase 1–2) | Individual detail data |
| `frontend/src/app/technologies/[slug]/page.tsx` | No change (Phase 1–2) | Individual detail renderer |

---

## Phase 1 — High-ROI Quick Wins (Hub Page Rewrite)

### Task 1: Rewrite `technologies/page.tsx` with correct data and structure

**File:** `frontend/src/app/technologies/page.tsx`

- [ ] **Step 1: Checkout working branch**

```bash
cd /home/user/world-catalogue
git checkout claude/dazzling-franklin-ALGY1 2>/dev/null || git checkout -b claude/dazzling-franklin-ALGY1
git pull origin claude/dazzling-franklin-ALGY1 2>/dev/null || true
```

- [ ] **Step 2: Write the new page**

Replace the entire file with the following. Key changes vs. current:
- SYNTEPORE™ correctly classified under Fuel Cleanliness Protection
- Hero: outcome metrics not counts
- Problem section before technology cards
- Technologies grouped under their Protection System headers
- Cards: PROBLEM / SYSTEM / OUTCOME structured format (not prose paragraphs)
- Fonts: `Titillium Web` for headlines (not Space Grotesk)
- One closing doctrine section (not three)
- Remove Technology Comparison Table (redundant with grouping)
- Remove Architecture Map (replaced by grouped layout)

```tsx
'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

const CONTAMINATION_VECTORS = [
  {
    code: 'PARTICLE',
    threat: 'Abrasive particle wear',
    mechanism: 'Hard particles (silica, metallic) cause micro-cutting on bearing surfaces, valve spools, and injector orifices — reducing component life by 30–80%.',
    systems: 'Air intake · Lube · Hydraulic · Fuel',
  },
  {
    code: 'WATER',
    threat: 'Water ingress & corrosion',
    mechanism: 'Free and emulsified water promotes microbial growth, injector needle corrosion, and cavitation erosion. In pneumatic circuits, vapor-to-liquid phase transition seizes valves.',
    systems: 'Fuel · Compressed air · Cooling',
  },
  {
    code: 'THERMAL',
    threat: 'Thermal degradation',
    mechanism: 'SCA depletion in cooling circuits enables liner cavitation erosion. In lube systems, thermal cycling accelerates soot accumulation and oil viscosity breakdown.',
    systems: 'Cooling · Lubrication',
  },
  {
    code: 'BYPASS',
    threat: 'Contamination bypass',
    mechanism: 'Housing seal failure, element collapse under pressure spikes, or improper element geometry allows unfiltered fluid to reach protected components — negating all other protection.',
    systems: 'All circuits',
  },
];

const PROTECTION_SYSTEMS = [
  {
    system: 'Air Intake Protection',
    accent: '#FFF12D',
    technologies: [
      {
        name: 'MACROCORE™',
        tagline: 'Air Intake Protection Technology',
        problem: 'Silica dust · crop residue · high-concentration particulate',
        contamination: 'Airborne particles up to 10,000 mg/m³',
        protects: 'Combustion engines · compressors · turbines',
        outcome: 'Extended engine life · reduced wear events · longer service intervals',
        standard: 'ISO 5011',
        slug: 'macrocore',
      },
    ],
  },
  {
    system: 'Cabin Air Protection',
    accent: '#a78bfa',
    technologies: [
      {
        name: 'MICROKAPPA™',
        tagline: 'Cabin Air Protection Technology',
        problem: 'Diesel PM2.5 · NOx · pollen · VOCs · carcinogen exposure',
        contamination: 'PM2.5, PM10, biological allergens, exhaust gases',
        protects: 'Vehicle cabin air circuits · operator respiratory health',
        outcome: 'Reduced occupational exposure · regulatory compliance · driver performance',
        standard: 'ISO 11155 · EU Dir. 2019/130',
        slug: 'microkappa',
      },
    ],
  },
  {
    system: 'Compressed Air Protection',
    accent: '#38bdf8',
    technologies: [
      {
        name: 'DRYCORE™',
        tagline: 'Compressed Air Protection Technology',
        problem: 'Moisture in pneumatic circuits · vapor-to-liquid phase transition',
        contamination: 'Water vapor condensing in brake valves, actuators, and control circuits',
        protects: 'Air brake systems · pneumatic actuators · suspension circuits',
        outcome: 'Eliminated brake valve corrosion · 2× service interval extension',
        standard: 'ISO 8573-1 Class 1–2',
        slug: 'drycore',
      },
      {
        name: 'INTEKCORE™',
        tagline: 'Airflow Management Technology',
        problem: 'Housing seal degradation · bypass under cold-start pressure spikes',
        contamination: 'Unfiltered bypass contamination from housing integrity failure',
        protects: 'Engine intake circuits · filter element boundary integrity',
        outcome: 'Zero bypass events · multi-year housing service life',
        standard: 'OEM-interchangeable · heavy-duty rated',
        slug: 'intekcore',
      },
    ],
  },
  {
    system: 'Fuel Cleanliness Protection',
    accent: '#fb923c',
    technologies: [
      {
        name: 'SYNTEPORE™',
        tagline: 'Fuel Cleanliness Technology',
        problem: 'Sub-micron injector contamination at 1,800–2,500 bar',
        contamination: 'Particles >4µm reaching HPCR needle seats and spool valves',
        protects: 'Common Rail injection systems · high-pressure fuel pumps',
        outcome: '3× injector service life · eliminated HPCR needle failure events',
        standard: 'ISO 19438',
        slug: 'syntepore',
      },
      {
        name: 'HYDROCORE™',
        tagline: 'Water Separation Technology',
        problem: 'Free water · emulsified water · microbial growth in fuel',
        contamination: 'Water in all phases — free, emulsified, dissolved',
        protects: 'Fuel injection circuits · injection pumps · storage systems',
        outcome: '99.8% water removal · eliminated corrosion and microbial contamination',
        standard: 'SAE J1488 · ASTM D6304',
        slug: 'hydrocore',
      },
    ],
  },
  {
    system: 'Lubrication Protection',
    accent: '#4ade80',
    technologies: [
      {
        name: 'SYNTRAX™',
        tagline: 'Lubrication Protection Technology',
        problem: 'Combustion soot · metal wear particles · fuel dilution in lube oil',
        contamination: 'Particles exceeding ISO 4406 target 16/14/11',
        protects: 'Engine bearings · turbocharger shafts · valve train components',
        outcome: '3–5× bearing life extension · turbocharger failure prevention · extended drain intervals',
        standard: 'ISO 4406 · SAE J1858',
        slug: 'syntrax',
      },
    ],
  },
  {
    system: 'Hydraulic Protection',
    accent: '#60a5fa',
    technologies: [
      {
        name: 'NANOFORCE™',
        tagline: 'Hydraulic Protection Technology',
        problem: 'Sub-micron valve spool abrasion · dissolved water in hydraulic fluid',
        contamination: 'Particles >3µm and phase-transition water in circuits at 200–450 bar',
        protects: 'Proportional valves · hydraulic pumps · actuator circuits',
        outcome: 'ISO 4406 16/14/11 maintained · 2× proportional valve service life',
        standard: 'ISO 16889 · Beta >200',
        slug: 'nanoforce',
      },
    ],
  },
  {
    system: 'Cooling System Protection',
    accent: '#f472b6',
    technologies: [
      {
        name: 'THERMACORE™',
        tagline: 'Cooling System Protection Technology',
        problem: 'Liner cavitation erosion · SCA depletion · electrochemical corrosion',
        contamination: 'SCA below protection threshold · vapor bubble formation on liner surfaces',
        protects: 'Wet sleeve liners · multi-metal cooling circuits · coolant chemistry',
        outcome: 'Eliminated liner pitting events · sustained additive protection across full service interval',
        standard: 'ASTM D6210',
        slug: 'thermacore',
      },
    ],
  },
];

export default function TechnologiesHub() {
  return (
    <>
      <main style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>

        {/* ── HERO ── */}
        <section style={{ padding: '8rem 8% 5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(255,241,45,0.7)', textTransform: 'uppercase', marginBottom: '2rem' }}
          >
            // ASSET PROTECTION TECHNOLOGY PLATFORM
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4rem', alignItems: 'end', maxWidth: '1200px' }} className="tech-hero-grid">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease }}
                style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.95, letterSpacing: '-0.03em', textTransform: 'uppercase', color: '#fff', margin: '0 0 1.5rem' }}
              >
                Nine Technologies.<br />
                <span style={{ color: '#FFF12D' }}>Zero Contamination Bypass.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease }}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.5)', maxWidth: '520px' }}
              >
                Each technology was engineered to control a specific contamination mechanism responsible for asset degradation, unplanned downtime, and premature equipment failure.
              </motion.p>
            </div>

            {/* Outcome stats — right column */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'flex-end' }}
            >
              {[
                { value: '15k+', label: 'Hours\nBearing Life' },
                { value: '3–5×', label: 'Asset Life\nExtension' },
                { value: '80%', label: 'Failures from\nContamination' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#fff', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '0.3rem' }}>
                    {s.value}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CONTAMINATION PROBLEM ENTRY ── */}
        <section style={{ padding: '5rem 8%', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,241,45,0.02)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease }}
              style={{ marginBottom: '3rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(255,241,45,0.7)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                // WHY CONTAMINATION CONTROL EXISTS
              </p>
              <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#fff', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                What Contamination Does to Industrial Assets
              </h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {CONTAMINATION_VECTORS.map((v, i) => (
                <motion.div
                  key={v.code}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease }}
                  style={{ background: '#000', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.6 }}>
                    {v.code}
                  </span>
                  <h3 style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {v.threat}
                  </h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                    {v.mechanism}
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,241,45,0.4)', letterSpacing: '0.08em', margin: 0 }}>
                    AFFECTS: {v.systems}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECHNOLOGIES BY PROTECTION SYSTEM ── */}
        <section style={{ padding: '5rem 8%' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease }}
              style={{ marginBottom: '4rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(255,241,45,0.7)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                // NINE PROTECTION TECHNOLOGIES
              </p>
              <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#fff', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                Organized by Protection System
              </h2>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
              {PROTECTION_SYSTEMS.map((ps, si) => (
                <div key={ps.system}>
                  {/* System Header */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, ease }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: `1px solid ${ps.accent}30` }}
                  >
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.2em', color: ps.accent, opacity: 0.7, textTransform: 'uppercase' }}>
                      {String(si + 1).padStart(2, '0')}
                    </span>
                    <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: ps.accent, margin: 0, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      {ps.system}
                    </h2>
                  </motion.div>

                  {/* Technology Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
                    {ps.technologies.map((tech, ti) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.5, delay: ti * 0.07, ease }}
                      >
                        <Link href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                          <motion.div
                            whileHover={{ background: `${ps.accent}08` }}
                            style={{ background: '#000', padding: '2.5rem', transition: 'background 0.3s ease', cursor: 'pointer', height: '100%' }}
                          >
                            {/* Tech Name + Tagline */}
                            <div style={{ marginBottom: '2rem' }}>
                              <h3 style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)', color: '#fff', margin: '0 0 0.4rem', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                                {tech.name}
                              </h3>
                              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: ps.accent, margin: 0, textTransform: 'uppercase', opacity: 0.8 }}>
                                {tech.tagline}
                              </p>
                            </div>

                            {/* Structured Data */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2rem' }}>
                              {[
                                { label: 'PROBLEM', value: tech.problem },
                                { label: 'SYSTEM PROTECTED', value: tech.protects },
                                { label: 'OUTCOME', value: tech.outcome },
                              ].map((row) => (
                                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'start' }}>
                                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', paddingTop: '0.15rem' }}>
                                    {row.label}
                                  </span>
                                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                                    {row.value}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Standard + CTA */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: `${ps.accent}60`, letterSpacing: '0.1em' }}>
                                {tech.standard}
                              </span>
                              <motion.span
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.2 }}
                                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: ps.accent, letterSpacing: '0.1em' }}
                              >
                                EXPLORE TECHNOLOGY →
                              </motion.span>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DOCTRINE CLOSE ── */}
        <section style={{ padding: '6rem 8%', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="doctrine-grid">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(255,241,45,0.6)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                // TECHNOLOGY DOCTRINE
              </p>
              <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', lineHeight: 1.15, color: '#fff', marginBottom: '1.5rem' }}>
                Technology is not<br />the product.<br />
                <span style={{ color: '#FFF12D' }}>Technology is the standard.</span>
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.45)', maxWidth: '440px' }}>
                Every ELIMFILTERS technology exists to control a contamination mechanism. The product is the implementation. The technology is the engineering standard that makes protection measurable, repeatable, and auditable.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {[
                { label: 'Contamination Standards', href: '/knowledge-system/standards', desc: 'ISO 4406 · ISO 16889 · ISO 5011 · ISO 19438' },
                { label: 'Contamination Case Studies', href: '/knowledge-system/contamination', desc: 'Particle wear · Water ingestion · Hydraulic failure' },
                { label: 'Protection Systems', href: '/systems', desc: 'Air · Fuel · Lube · Hydraulic · Cooling' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)', background: 'rgba(255,241,45,0.03)' }}
                    style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem', borderRadius: '3px', transition: 'all 0.25s ease' }}
                  >
                    <p style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#fff', margin: '0 0 0.3rem' }}>{link.label}</p>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.05em' }}>{link.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </div>
        </section>

        <style>{`
          @media (max-width: 768px) {
            .tech-hero-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
            .tech-hero-grid > div:last-child {
              flex-direction: row !important;
              justify-content: flex-start !important;
              gap: 2rem !important;
            }
            .doctrine-grid {
              grid-template-columns: 1fr !important;
              gap: 2.5rem !important;
            }
          }
        `}</style>

      </main>
    </>
  );
}
```

- [ ] **Step 3: Build to verify no TypeScript errors**

```bash
cd /home/user/world-catalogue/frontend && npm run build 2>&1 | tail -20
```

Expected: Build succeeds with `/technologies` listed in static output. No TypeScript errors.

- [ ] **Step 4: Verify the key issues are fixed**

Check in the build output:
- `/technologies` page builds
- `/technologies/macrocore` still builds (detail pages untouched)
- `/technologies/syntepore` still builds

- [ ] **Step 5: Stage and commit**

```bash
git add frontend/src/app/technologies/page.tsx
git commit -m "$(cat <<'EOF'
feat: Redesign Technologies hub as APT platform — 9 official technologies, Problem→Outcome structure

- SYNTEPORE correctly classified under Fuel Cleanliness Protection (was wrongly Air Intake)
- INTEKCORE correctly framed as Airflow Management Technology (was Filter Housing)
- Hero stats outcome-based: 15k+ hours / 3-5× life / 80% failures from contamination
- New contamination entry section: Particle / Water / Thermal / Bypass vectors
- Technologies grouped under Protection System headers (not flat grid)
- Cards: structured PROBLEM / SYSTEM PROTECTED / OUTCOME (not prose paragraphs)
- Font: Titillium Web throughout (matches site standard, was Space Grotesk)
- Three redundant narrative sections consolidated to one doctrine close
- Removed Architecture Map (replaced by grouped layout)
- Removed Technology Comparison Table (redundant)

https://claude.ai/code/session_01SYvbUawExgYcctLCducDMr
EOF
)"
```

- [ ] **Step 6: Push to feature branch**

```bash
git push -u origin claude/dazzling-franklin-ALGY1
```

---

## Phase 2 — Structural Improvements (Detail Page Subtitles)

### Task 2: Fix subtitle positioning in `techPagesData.ts`

**File:** `frontend/src/app/technologies/[slug]/techPagesData.ts`

The `heroSubtitle` field on each detail page currently says the product type ("WATER SEPARATOR", "DESICCANT DRYER") rather than the technology positioning ("Water Separation Technology", "Compressed Air Protection Technology").

- [ ] **Step 1: Edit each `heroSubtitle` value**

In `techPagesData.ts`, update these fields:

```typescript
// hydrocore
heroSubtitle: 'Water Separation Technology',  // was: 'WATER SEPARATOR'

// thermacore  
heroSubtitle: 'Cooling System Protection Technology',  // was: 'SCA ADDITIVE'

// drycore
heroSubtitle: 'Compressed Air Protection Technology',  // was: 'DESICCANT DRYER'

// intekcore
heroSubtitle: 'Airflow Management Technology',  // was: 'FILTER HOUSING SYSTEMS'

// macrocore
heroSubtitle: 'Air Intake Protection Technology',  // was: 'PROGRESSIVE DENSITY ENGINEERING'

// microkappa
heroSubtitle: 'Cabin Air Protection Technology',  // was: 'ELECTROSTATIC HEPA'

// nanoforce
heroSubtitle: 'Hydraulic Protection Technology',  // was: 'HYDRAULIC PRECISION GUARD'

// syntepore
heroSubtitle: 'Fuel Cleanliness Technology',  // was: 'PRECISION INJECTOR GUARD'

// syntrax
heroSubtitle: 'Lubrication Protection Technology',  // was: 'AI-ENGINEERED PROTECTION'
```

Leave `heroTitle` (e.g., `'MACROCORE™'`) untouched — only change `heroSubtitle`.

- [ ] **Step 2: Also fix `categoryTag` on SYNTEPORE™** (currently says Air Intake, should say Fuel)

```typescript
// syntepore categoryTag
categoryTag: '// FUEL CLEANLINESS PROTECTION · SYNTEPORE™',  // was: '// FUEL ASSET PROTECTION · SYNTEPORE™'
```

Also fix INTEKCORE™ `categoryTag`:
```typescript
// intekcore categoryTag
categoryTag: '// AIRFLOW MANAGEMENT TECHNOLOGY · INTEKCORE™',  // was: '// HEAVY-DUTY HOUSING SYSTEMS · INTEKCORE™'
```

- [ ] **Step 3: Build and verify**

```bash
cd /home/user/world-catalogue/frontend && npm run build 2>&1 | tail -10
```

Expected: All `/technologies/[slug]` pages still build.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/technologies/[slug]/techPagesData.ts
git commit -m "$(cat <<'EOF'
content: Fix technology subtitle positioning — technology platform language not product descriptors

- heroSubtitle updated to official taxonomy: 'Water Separation Technology', 
  'Compressed Air Protection Technology', 'Airflow Management Technology', etc.
- SYNTEPORE categoryTag corrected to Fuel Cleanliness (was Air Intake)
- INTEKCORE categoryTag corrected to Airflow Management (was Heavy-Duty Housing Systems)

https://claude.ai/code/session_01SYvbUawExgYcctLCducDMr
EOF
)"
```

---

## Phase 3 — Premium Experience

### Task 3: Hero section background image / visual upgrade

**File:** `frontend/src/app/technologies/page.tsx`

- [ ] **Step 1: Add background image to hero**

Add a background image to the hero section. Use `/images/system-hero.avif` (already used on technologies page before). Add a gradient overlay for text legibility:

```tsx
<section style={{
  padding: '8rem 8% 5rem',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  position: 'relative',
  backgroundImage: 'url(/images/system-hero.avif)',
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
}}>
  {/* Dark overlay */}
  <div style={{
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 100%)',
    zIndex: 0,
  }} />
  {/* All existing hero content wrapped in: */}
  <div style={{ position: 'relative', zIndex: 1 }}>
    {/* ... existing hero content ... */}
  </div>
</section>
```

- [ ] **Step 2: Add animated number counter effect to hero stats** (optional enhancement, requires `useEffect` + `useState` — skip if build becomes complex)

- [ ] **Step 3: Build and commit**

```bash
cd /home/user/world-catalogue/frontend && npm run build 2>&1 | tail -10
git add frontend/src/app/technologies/page.tsx
git commit -m "design: Add background image to Technologies hub hero section

https://claude.ai/code/session_01SYvbUawExgYcctLCducDMr
"
```

---

## Phase 4 — Migration Preparation

### Task 4: JSON-LD structured data audit and update

**File:** `frontend/src/app/technologies/page.tsx`

The current page has JSON-LD structured data using `catalogue.technologies` (which contains stale/non-official technology names). Update to use the 9 official technologies from `PROTECTION_SYSTEMS`.

- [ ] **Step 1: Add JSON-LD block using official technology registry**

```tsx
// Add to top of JSX return, before <main>
<>
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ELIMFILTERS Asset Protection Technologies',
    description: 'Nine proprietary contamination control technologies organized within five industrial asset protection systems.',
    url: 'https://elimfilters.com/technologies/',
    numberOfItems: 9,
    itemListElement: PROTECTION_SYSTEMS.flatMap((ps, i) =>
      ps.technologies.map((tech, j) => ({
        '@type': 'ListItem',
        position: i * 10 + j + 1,
        item: {
          '@type': 'TechArticle',
          name: tech.name,
          description: `${tech.tagline} — ${tech.problem}`,
          url: `https://elimfilters.com/technologies/${tech.slug}`,
          author: { '@type': 'Organization', name: 'ELIMFILTERS' },
          about: {
            '@type': 'Thing',
            name: ps.system,
            description: tech.protects,
          },
        },
      }))
    ),
  }) }} />
  <main style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
    {/* ... */}
  </main>
</>
```

- [ ] **Step 2: Remove old catalogue-based JSON-LD** (the one importing from `@/lib/catalogue`)

- [ ] **Step 3: Remove unused imports** (`catalogue`, `getSlug`, `StaggerContainer`, `itemVariants` from AnimateIn)

- [ ] **Step 4: Build and verify no import errors**

```bash
cd /home/user/world-catalogue/frontend && npm run build 2>&1 | grep -E "Error|error|warn" | head -20
```

Expected: No import errors. Clean build.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/technologies/page.tsx
git commit -m "feat: Add canonical JSON-LD for 9 official technologies on hub, remove stale catalogue imports

https://claude.ai/code/session_01SYvbUawExgYcctLCducDMr
"
git push -u origin claude/dazzling-franklin-ALGY1
```

---

## Self-Review Against User Requirements

| Requirement | Addressed? | Task |
|---|---|---|
| PROBLEM → CONTAMINATION → TECHNOLOGY → OUTCOME structure | ✅ | Task 1: Problem section + card structure |
| Eliminate "We manufacture filters" language | ✅ | Task 1: All descriptions are outcome/system framing |
| Outcome-based metrics (not 99.9% efficiency) | ✅ | Task 1: Hero stats + card OUTCOME field |
| Each technology answers the 5 questions | ✅ | Task 1: problem / contamination / protects / outcome / standard |
| Technology = platform not filter category | ✅ | Task 2: subtitle positioning change |
| Remove generic text | ✅ | Task 1: prose cards replaced with structured data |

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-15-technologies-hub-redesign.md`.**
