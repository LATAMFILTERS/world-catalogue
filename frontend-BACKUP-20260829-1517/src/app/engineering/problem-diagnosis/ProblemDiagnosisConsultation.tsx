'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  listEntitiesWithProvenance,
  recommendFromContamination,
  recommendFromFailureMode,
} from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import { CTACard } from '@/components/conversion/CTACard';
import { evaluate } from '@/lib/decision-engine';
import type { EvaluationInput, ContaminationDomain } from '@/lib/decision-engine';

// ─── Phase definitions ─────────────────────────────────────────────────────────
// Three customer-facing phases framing the investigation.

const PHASES = [
  {
    id: 1,
    label: 'Identify the Problem',
    description: 'Asset, observed symptoms, and operating context',
    steps: [1, 2, 3],
    color: '#f9a8d4', // rose — something is wrong
  },
  {
    id: 2,
    label: 'Investigate the Cause',
    description: 'Contamination mechanisms and failure mode analysis',
    steps: [4, 5],
    color: '#fdba74', // amber — narrowing the cause
  },
  {
    id: 3,
    label: 'Confirm the Diagnosis',
    description: 'Engineering hypothesis, root cause, and corrective strategy',
    steps: [6, 7],
    color: '#FFF12D', // yellow — resolution
  },
] as const;

function getPhase(step: number) {
  return PHASES.find((p) => p.steps.includes(step as never)) ?? PHASES[0];
}

// ─── Asset data ────────────────────────────────────────────────────────────────

const ASSETS = [
  { id: 'agriculture',   label: 'Agriculture',           icon: '🌾', assetType: 'Tractors & Harvesters' },
  { id: 'mining',        label: 'Mining',                icon: '⛏', assetType: 'Excavators & Haul Trucks' },
  { id: 'marine',        label: 'Marine',                icon: '⚓', assetType: 'Vessels & Generators' },
  { id: 'construction',  label: 'Construction',          icon: '🏗', assetType: 'Cranes & Loaders' },
  { id: 'oil-gas',       label: 'Oil & Gas',             icon: '🛢', assetType: 'Pumps & Compressors' },
  { id: 'power',         label: 'Power Generation',      icon: '⚡', assetType: 'Turbines & Generators' },
  { id: 'transport',     label: 'Transport & Logistics', icon: '🚛', assetType: 'Fleet Trucks' },
  { id: 'manufacturing', label: 'Manufacturing',         icon: '🏭', assetType: 'CNC & Hydraulic Systems' },
  { id: 'forestry',      label: 'Forestry',              icon: '🌲', assetType: 'Harvesters & Forwarders' },
  { id: 'food',          label: 'Food & Beverage',       icon: '🥫', assetType: 'Processing Equipment' },
  { id: 'military',      label: 'Defence',               icon: '🎖', assetType: 'Tactical Vehicles' },
  { id: 'rail',          label: 'Rail',                  icon: '🚂', assetType: 'Locomotives' },
] as const;

type AssetId = typeof ASSETS[number]['id'];

// ─── Symptoms ──────────────────────────────────────────────────────────────────
// Each symptom includes a diagnostic signal — the engineering inference it enables.

const SYMPTOMS = [
  {
    id: 'oil-consumption',
    label: 'Increased oil consumption',
    signal: 'Combustion chamber ingestion or seal failure — indicates particle wear on ring/liner interface.',
  },
  {
    id: 'blue-smoke',
    label: 'Blue or grey exhaust smoke',
    signal: 'Oil burning in combustion — worn piston rings or valve seals allowing oil past.',
  },
  {
    id: 'black-smoke',
    label: 'Black exhaust smoke',
    signal: 'Rich combustion from injector fouling or air restriction — fuel or air intake contamination pathway.',
  },
  {
    id: 'white-smoke',
    label: 'White or steam exhaust smoke',
    signal: 'Water or coolant entering combustion — fuel water contamination or head gasket failure.',
  },
  {
    id: 'power-loss',
    label: 'Loss of power or torque',
    signal: 'Reduced volumetric efficiency — air intake restriction or injector deposit accumulation.',
  },
  {
    id: 'hydraulic-sluggish',
    label: 'Slow or sluggish hydraulic response',
    signal: 'Internal leakage or valve spool wear — particle contamination above cleanliness target.',
  },
  {
    id: 'hydraulic-noise',
    label: 'Hydraulic system noise or chatter',
    signal: 'Cavitation or aeration — typically water ingress or air entrainment in fluid.',
  },
  {
    id: 'premature-wear',
    label: 'Premature component wear or failure',
    signal: 'Accelerated abrasion — particles in lubricant exceeding ISO 4406 cleanliness target.',
  },
  {
    id: 'filter-clogging',
    label: 'Filter blocking before scheduled interval',
    signal: 'Particle loading rate exceeds filter capacity — contamination ingestion rate is elevated.',
  },
  {
    id: 'fuel-consumption',
    label: 'Increased fuel consumption',
    signal: 'Combustion efficiency loss — injector wear, air restriction, or fuel quality degradation.',
  },
  {
    id: 'overheating',
    label: 'Overheating or elevated operating temperature',
    signal: 'Thermal management degradation — coolant contamination, lube viscosity breakdown, or air restriction.',
  },
  {
    id: 'noise-knock',
    label: 'Engine knock or bearing noise',
    signal: 'Bearing clearance collapse from particle-induced wear — late-stage lube contamination damage.',
  },
  {
    id: 'corrosion',
    label: 'Corrosion or rust on components',
    signal: 'Water ingress into oil or hydraulic circuit — moisture contamination pathway active.',
  },
  {
    id: 'injector-issues',
    label: 'Injector problems or nozzle fouling',
    signal: 'HPCR system contamination — fuel particle load or water content exceeding injector tolerance.',
  },
] as const;

type SymptomId = typeof SYMPTOMS[number]['id'];

// ─── Operating context ─────────────────────────────────────────────────────────

const ONSET_OPTIONS = [
  { id: 'sudden',    label: 'Sudden — appeared without warning',         signal: 'Acute event: recent service error, component failure, or contamination ingestion event.' },
  { id: 'gradual',   label: 'Gradual — worsening over weeks or months',  signal: 'Chronic contamination: accumulated wear or progressive system degradation.' },
  { id: 'post-service', label: 'After recent service or filter change',  signal: 'Servicing error likely: incorrect specification, reinstallation issue, or incorrect torque.' },
  { id: 'cyclical',  label: 'Cyclical — occurs then temporarily clears', signal: 'Load or temperature driven: contamination issue that responds to operating conditions.' },
] as const;

type OnsetId = typeof ONSET_OPTIONS[number]['id'];

const ENVIRONMENT_OPTIONS = [
  { id: 'high-dust',   label: 'High dust / airborne particle environment',  icon: '🌪' },
  { id: 'wet',         label: 'Wet or high-humidity conditions',             icon: '💧' },
  { id: 'extreme-temp', label: 'Extreme temperature (cold start or heat)',   icon: '🌡' },
  { id: 'heavy-load',  label: 'Continuous heavy load or overload cycles',    icon: '⚙️' },
  { id: 'fuel-change', label: 'Recent fuel supplier or fuel type change',    icon: '⛽' },
  { id: 'geographic',  label: 'New operating site or geographic change',     icon: '📍' },
] as const;

type EnvironmentId = typeof ENVIRONMENT_OPTIONS[number]['id'];

// ─── Symptom → contamination mapping ──────────────────────────────────────────
// Each symptom directly implicates one or more contamination entities.
// This is the core diagnostic narrowing logic.

const SYMPTOM_CONTAMINATION_MAP: Record<SymptomId, string[]> = {
  'oil-consumption':   ['CONT-WEAR-PARTICLE-OIL', 'CONT-DUST-MINERAL'],
  'blue-smoke':        ['CONT-WEAR-PARTICLE-OIL', 'CONT-DUST-MINERAL'],
  'black-smoke':       ['CONT-DUST-MINERAL', 'CONT-PARTICLE-FUEL'],
  'white-smoke':       ['CONT-WATER-FUEL', 'CONT-WEAR-PARTICLE-OIL'],
  'power-loss':        ['CONT-DUST-MINERAL', 'CONT-PARTICLE-FUEL'],
  'hydraulic-sluggish': ['CONT-WEAR-PARTICLE-HYD', 'CONT-WATER-FUEL'],
  'hydraulic-noise':   ['CONT-WATER-COMPRESSED-AIR', 'CONT-WEAR-PARTICLE-HYD'],
  'premature-wear':    ['CONT-WEAR-PARTICLE-OIL', 'CONT-DUST-MINERAL', 'CONT-RCS-SILICA'],
  'filter-clogging':   ['CONT-DUST-MINERAL', 'CONT-RCS-SILICA', 'CONT-WEAR-PARTICLE-HYD'],
  'fuel-consumption':  ['CONT-DUST-MINERAL', 'CONT-PARTICLE-FUEL'],
  'overheating':       ['CONT-WEAR-PARTICLE-OIL', 'CONT-DUST-MINERAL'],
  'noise-knock':       ['CONT-WEAR-PARTICLE-OIL', 'CONT-RCS-SILICA'],
  'corrosion':         ['CONT-WATER-FUEL', 'CONT-WATER-COMPRESSED-AIR'],
  'injector-issues':   ['CONT-PARTICLE-FUEL', 'CONT-WATER-FUEL', 'CONT-CATALYTIC-FINES-MARINE'],
};

// ─── Asset → contamination map (narrows candidates by operating context) ───────

const ASSET_CONTAMINATION_MAP: Record<AssetId, string[]> = {
  agriculture:   ['CONT-DUST-MINERAL', 'CONT-WEAR-PARTICLE-OIL', 'CONT-PARTICLE-FUEL'],
  mining:        ['CONT-DUST-MINERAL', 'CONT-RCS-SILICA', 'CONT-WEAR-PARTICLE-HYD'],
  marine:        ['CONT-CATALYTIC-FINES-MARINE', 'CONT-WATER-FUEL', 'CONT-WEAR-PARTICLE-OIL'],
  construction:  ['CONT-DUST-MINERAL', 'CONT-WEAR-PARTICLE-HYD', 'CONT-WEAR-PARTICLE-OIL'],
  'oil-gas':     ['CONT-PARTICLE-FUEL', 'CONT-WATER-FUEL', 'CONT-WEAR-PARTICLE-HYD'],
  power:         ['CONT-DUST-MINERAL', 'CONT-WEAR-PARTICLE-OIL', 'CONT-WATER-COMPRESSED-AIR'],
  transport:     ['CONT-DUST-MINERAL', 'CONT-PARTICLE-FUEL', 'CONT-WEAR-PARTICLE-OIL'],
  manufacturing: ['CONT-WEAR-PARTICLE-HYD', 'CONT-WATER-COMPRESSED-AIR', 'CONT-WEAR-PARTICLE-OIL'],
  forestry:      ['CONT-DUST-MINERAL', 'CONT-RCS-SILICA', 'CONT-WEAR-PARTICLE-OIL'],
  food:          ['CONT-WATER-COMPRESSED-AIR', 'CONT-DUST-MINERAL', 'CONT-PARTICLE-FUEL'],
  military:      ['CONT-DUST-MINERAL', 'CONT-RCS-SILICA', 'CONT-WEAR-PARTICLE-OIL'],
  rail:          ['CONT-WEAR-PARTICLE-OIL', 'CONT-PARTICLE-FUEL', 'CONT-WATER-FUEL'],
};

// ─── Engineering hypothesis builder ───────────────────────────────────────────
// Generates a plain-language hypothesis from the combination of
// selected symptoms, onset, and top contamination candidates.

function buildHypothesis(
  symptoms: SymptomId[],
  onset: OnsetId | null,
  contIds: string[],
): string {
  if (symptoms.length === 0) return '—';

  const onsetText =
    onset === 'sudden'       ? 'an acute contamination event'
    : onset === 'gradual'    ? 'progressive contamination accumulation'
    : onset === 'post-service' ? 'a servicing-related contamination introduction'
    : onset === 'cyclical'   ? 'load-driven contamination activation'
    : 'contamination ingestion';

  const domainHints: string[] = [];
  if (symptoms.some((s) => ['oil-consumption', 'blue-smoke', 'noise-knock', 'premature-wear'].includes(s)))
    domainHints.push('lube oil circuit particle contamination');
  if (symptoms.some((s) => ['black-smoke', 'power-loss', 'fuel-consumption', 'injector-issues'].includes(s)))
    domainHints.push('air intake restriction or fuel system contamination');
  if (symptoms.some((s) => ['hydraulic-sluggish', 'hydraulic-noise', 'filter-clogging'].includes(s)))
    domainHints.push('hydraulic system particle or water contamination');
  if (symptoms.some((s) => ['white-smoke', 'corrosion'].includes(s)))
    domainHints.push('water ingress pathway');
  if (symptoms.some((s) => ['overheating'].includes(s)))
    domainHints.push('thermal management or viscosity degradation');

  const domain = domainHints.length > 0
    ? domainHints.slice(0, 2).join(' combined with ')
    : 'system contamination';

  const contaminants = contIds.length > 0
    ? `Contamination pathway: ${contIds.slice(0, 2).join(' + ').replace(/CONT-/g, '').replace(/-/g, ' ').toLowerCase()}.`
    : '';

  return `Evidence suggests ${onsetText} in ${domain}. ${contaminants} Diagnosis confidence increases as failure modes are confirmed.`;
}

// ─── Diagnostic state ──────────────────────────────────────────────────────────

interface DiagnosticState {
  step: number;
  assetId: AssetId | null;
  assetDescription: string;
  selectedSymptoms: SymptomId[];
  onsetId: OnsetId | null;
  selectedEnvironments: EnvironmentId[];
  selectedContaminationIds: string[];
  selectedFailureModeIds: string[];
  selectedPrincipleIds: string[];
  selectedTechIds: string[];
}

const INITIAL_STATE: DiagnosticState = {
  step: 1,
  assetId: null,
  assetDescription: '',
  selectedSymptoms: [],
  onsetId: null,
  selectedEnvironments: [],
  selectedContaminationIds: [],
  selectedFailureModeIds: [],
  selectedPrincipleIds: [],
  selectedTechIds: [],
};

// ─── Live Diagnostic Assessment Panel ─────────────────────────────────────────
// Persistent card updating after every answer.
// Unlike the Asset Protection panel, every field here is framed as
// diagnostic evidence — reducing uncertainty, not building a plan.

interface LiveDiagnosticPanelProps {
  state: DiagnosticState;
  contaminationNodes: Array<{ entityId: string; label: string }>;
  failureModeNodes:   Array<{ entityId: string; label: string }>;
  techNodes:          Array<{ entityId: string; label: string }>;
}

function LiveDiagnosticPanel({
  state, contaminationNodes, failureModeNodes,
}: LiveDiagnosticPanelProps) {
  if (state.step <= 1) return null;

  const asset  = ASSETS.find((a) => a.id === state.assetId);
  const onset  = ONSET_OPTIONS.find((o) => o.id === state.onsetId);
  const conts  = contaminationNodes.filter((n) => state.selectedContaminationIds.includes(n.entityId));
  const fms    = failureModeNodes.filter((n) => state.selectedFailureModeIds.includes(n.entityId));

  const symptomLabels = state.selectedSymptoms
    .map((s) => SYMPTOMS.find((x) => x.id === s)?.label)
    .filter(Boolean) as string[];

  const envLabels = state.selectedEnvironments
    .map((e) => ENVIRONMENT_OPTIONS.find((x) => x.id === e)?.label)
    .filter(Boolean) as string[];

  const hypothesis = buildHypothesis(
    state.selectedSymptoms,
    state.onsetId,
    state.selectedContaminationIds,
  );

  const nextInvestigation =
    state.step < 3
      ? 'Establish operating context and symptom onset'
      : state.step < 4
      ? 'Narrow contamination mechanisms from symptom pattern'
      : state.step < 5
      ? 'Confirm failure modes from contamination pathways'
      : state.step < 6
      ? 'Build engineering diagnosis from confirmed evidence'
      : fms.length > 0
      ? 'Review root cause assessment and corrective strategy'
      : 'Confirm engineering hypothesis';

  const filledFields = [
    state.assetId,
    state.selectedSymptoms.length,
    state.onsetId,
    state.selectedContaminationIds.length,
    state.selectedFailureModeIds.length,
  ].filter(Boolean).length;

  const confidence =
    filledFields >= 5 ? 'HIGH'
    : filledFields >= 3 ? 'BUILDING'
    : 'INITIAL';

  const confColor =
    confidence === 'HIGH'     ? '#86efac'
    : confidence === 'BUILDING' ? '#fdba74'
    : 'rgba(255,255,255,0.25)';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        marginBottom: '1.75rem',
        padding: '1rem 1.1rem',
        background: 'rgba(249,168,212,0.02)',
        border: '1px solid rgba(249,168,212,0.09)',
        borderRadius: '8px',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '0.75rem',
      }}>
        <span style={{
          fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(249,168,212,0.35)', letterSpacing: '0.1em',
        }}>
          DIAGNOSTIC ASSESSMENT
        </span>
        <span style={{
          fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
          color: confColor, padding: '0.15rem 0.5rem',
          background: `${confColor}10`, border: `1px solid ${confColor}28`,
          borderRadius: '3px', letterSpacing: '0.08em',
        }}>
          {confidence}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
        gap: '0.65rem',
      }}>
        <DiagRow
          label="Asset"
          value={asset ? `${asset.label} · ${asset.assetType}` : state.assetDescription || '—'}
          filled={!!(state.assetId || state.assetDescription)}
        />
        <DiagRow
          label="Observed Symptoms"
          value={symptomLabels.length > 0 ? symptomLabels.join(' · ') : '—'}
          filled={symptomLabels.length > 0}
          valueColor="rgba(249,168,212,0.75)"
        />
        <DiagRow
          label="Current Diagnostic Confidence"
          value={
            confidence === 'HIGH'     ? 'High — sufficient evidence for root cause'
            : confidence === 'BUILDING' ? 'Building — contamination pathway narrowed'
            : 'Initial — collecting evidence'
          }
          filled={confidence !== 'INITIAL'}
          valueColor={confColor}
        />
        <DiagRow
          label="Most Probable Contamination"
          value={conts.length > 0
            ? conts.map((n) => n.label).join(' · ')
            : onset
            ? `${onset.label} — contamination pathway pending`
            : envLabels.length > 0
            ? envLabels.slice(0, 2).join(', ')
            : '—'}
          filled={conts.length > 0}
          valueColor="rgba(253,186,116,0.8)"
        />
        <DiagRow
          label="Most Probable Failure Modes"
          value={fms.length > 0 ? fms.map((n) => n.label).join(' · ') : '—'}
          filled={fms.length > 0}
          valueColor="rgba(252,165,165,0.8)"
        />
        <DiagRow
          label="Engineering Hypothesis"
          value={hypothesis}
          filled={state.selectedSymptoms.length > 0 && !!state.onsetId}
          valueColor="rgba(255,255,255,0.5)"
        />
        <DiagRow
          label="Recommended Next Investigation"
          value={nextInvestigation}
          filled={state.step > 1}
          valueColor="rgba(255,241,45,0.55)"
        />
      </div>
    </motion.div>
  );
}

function DiagRow({
  label, value, filled, valueColor,
}: { label: string; value: string; filled: boolean; valueColor?: string }) {
  return (
    <div>
      <p style={{
        fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace',
        color: filled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
        marginBottom: '0.2rem', letterSpacing: '0.07em',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '0.72rem',
        color: filled ? (valueColor ?? 'rgba(255,255,255,0.65)') : 'rgba(255,255,255,0.2)',
        margin: 0, lineHeight: 1.45,
        fontStyle: filled ? 'normal' : 'italic',
      }}>
        {value}
      </p>
    </div>
  );
}

// ─── Phase progress header ─────────────────────────────────────────────────────

function PhaseHeader({ currentStep }: { currentStep: number }) {
  const currentPhase = getPhase(currentStep);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {PHASES.map((phase) => {
          const isActive = phase.id === currentPhase.id;
          const isDone   = phase.id < currentPhase.id;
          return (
            <div key={phase.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.8rem',
              background: isActive ? `${phase.color}12` : isDone ? 'rgba(134,239,172,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isActive ? phase.color + '35' : isDone ? 'rgba(134,239,172,0.2)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '20px',
            }}>
              <span style={{
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.52rem', fontFamily: 'JetBrains Mono, monospace',
                background: isActive ? phase.color : isDone ? '#86efac' : 'rgba(255,255,255,0.07)',
                color: isActive || isDone ? '#000' : 'rgba(255,255,255,0.25)',
                fontWeight: 700, flexShrink: 0,
              }}>
                {isDone ? '✓' : phase.id}
              </span>
              <span style={{
                fontSize: '0.7rem', fontFamily: 'Outfit, sans-serif',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? phase.color : isDone ? 'rgba(134,239,172,0.65)' : 'rgba(255,255,255,0.25)',
                whiteSpace: 'nowrap',
              }}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '0.75rem 1rem',
        background: `${currentPhase.color}07`,
        border: `1px solid ${currentPhase.color}18`,
        borderLeft: `3px solid ${currentPhase.color}`,
        borderRadius: '0 6px 6px 0',
      }}>
        <p style={{ margin: 0, fontSize: '0.7rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: currentPhase.color, marginBottom: '0.15rem' }}>
          {currentPhase.label}
        </p>
        <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)' }}>
          {currentPhase.description}
        </p>
      </div>
    </div>
  );
}

// ─── Diagnostic question block ─────────────────────────────────────────────────
// Like the Asset Protection Question component, but framed for investigation.
// "why" = why this question narrows the diagnosis
// "eliminated" = what hypothesis was ruled out by the previous answer

interface DiagnosticQuestionProps {
  label: string;
  title: string;
  why: string;
  eliminated?: string;
  children: React.ReactNode;
}

function DiagnosticQuestion({ label, title, why, eliminated, children }: DiagnosticQuestionProps) {
  return (
    <motion.div
      key={label}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{
          fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', marginBottom: '0.4rem',
        }}>
          {label}
        </p>
        <h2 style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 700,
          fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
          color: '#fff', margin: '0 0 0.85rem',
        }}>
          {title}
        </h2>

        {/* Why this question narrows the diagnosis */}
        <div style={{
          display: 'flex', gap: '0.65rem',
          padding: '0.7rem 0.9rem',
          background: 'rgba(249,168,212,0.03)',
          border: '1px solid rgba(249,168,212,0.08)',
          borderRadius: '6px',
          marginBottom: eliminated ? '0.55rem' : '1.5rem',
        }}>
          <span style={{
            fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(249,168,212,0.4)', letterSpacing: '0.08em', paddingTop: '1px', flexShrink: 0,
          }}>
            WHY
          </span>
          <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.48)', margin: 0, lineHeight: 1.65 }}>
            {why}
          </p>
        </div>

        {/* What hypothesis was eliminated */}
        {eliminated && (
          <div style={{
            display: 'flex', gap: '0.65rem',
            padding: '0.6rem 0.9rem',
            background: 'rgba(134,239,172,0.03)',
            border: '1px solid rgba(134,239,172,0.09)',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}>
            <span style={{
              fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(134,239,172,0.38)', letterSpacing: '0.08em', paddingTop: '1px', flexShrink: 0,
            }}>
              ELIMINATED
            </span>
            <p style={{ fontSize: '0.76rem', color: 'rgba(134,239,172,0.6)', margin: 0, lineHeight: 1.6 }}>
              {eliminated}
            </p>
          </div>
        )}
      </div>

      {children}
    </motion.div>
  );
}

// ─── Phase transition card ─────────────────────────────────────────────────────

function PhaseTransition({
  phaseId, title, evidenceEstablished, whyNextPhase, onClick,
}: {
  phaseId: number;
  title: string;
  evidenceEstablished: string;
  whyNextPhase: string;
  onClick: () => void;
}) {
  const phase = PHASES.find((p) => p.id === phaseId) ?? PHASES[0];
  const nextPhase = PHASES.find((p) => p.id === phaseId + 1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        padding: '1.75rem', borderRadius: '10px',
        border: `1px solid ${phase.color}22`,
        background: `${phase.color}05`,
      }}
    >
      <p style={{
        fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
        color: `${phase.color}55`, letterSpacing: '0.12em', marginBottom: '0.5rem',
      }}>
        PHASE {phaseId} COMPLETE
      </p>
      <h2 style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 700,
        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
        color: '#fff', margin: '0 0 1.25rem',
      }}>
        {title}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          padding: '0.9rem 1rem',
          background: 'rgba(134,239,172,0.04)',
          border: '1px solid rgba(134,239,172,0.12)',
          borderRadius: '6px',
        }}>
          <p style={{
            fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(134,239,172,0.4)', letterSpacing: '0.08em', marginBottom: '0.45rem',
          }}>
            EVIDENCE ESTABLISHED
          </p>
          <p style={{ fontSize: '0.77rem', color: 'rgba(134,239,172,0.65)', margin: 0, lineHeight: 1.6 }}>
            {evidenceEstablished}
          </p>
        </div>

        <div style={{
          padding: '0.9rem 1rem',
          background: `${nextPhase?.color ?? '#FFF12D'}05`,
          border: `1px solid ${nextPhase?.color ?? '#FFF12D'}18`,
          borderRadius: '6px',
        }}>
          <p style={{
            fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace',
            color: `${nextPhase?.color ?? '#FFF12D'}55`, letterSpacing: '0.08em', marginBottom: '0.45rem',
          }}>
            NEXT INVESTIGATION
          </p>
          <p style={{ fontSize: '0.77rem', color: `${nextPhase?.color ?? '#FFF12D'}88`, margin: 0, lineHeight: 1.6 }}>
            {whyNextPhase}
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ background: '#ffe800' }}
        onClick={onClick}
        style={{
          padding: '0.7rem 1.6rem',
          background: '#FFF12D', color: '#000',
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.875rem',
          border: 'none', borderRadius: '6px', cursor: 'pointer',
          transition: 'background 0.12s',
        }}
      >
        Continue Investigation →
      </motion.button>
    </motion.div>
  );
}

// ─── Shared UI atoms ───────────────────────────────────────────────────────────

function SelectBtn({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ borderColor: 'rgba(249,168,212,0.3)' }}
      onClick={onClick}
      style={{
        padding: '0.7rem 1rem', textAlign: 'left', cursor: 'pointer',
        background: selected ? 'rgba(249,168,212,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${selected ? 'rgba(249,168,212,0.35)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '6px',
        color: selected ? '#f9a8d4' : 'rgba(255,255,255,0.58)',
        fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', lineHeight: 1.4,
        transition: 'all 0.12s',
      }}
    >
      {children}
    </motion.button>
  );
}

function NextBtn({ onClick, label = 'Continue Investigation' }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      whileHover={{ background: '#ffe800' }}
      onClick={onClick}
      style={{
        marginTop: '1.5rem', padding: '0.7rem 1.6rem',
        background: '#FFF12D', color: '#000',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.875rem',
        border: 'none', borderRadius: '6px', cursor: 'pointer',
        transition: 'background 0.12s', display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}
    >
      {label} <span style={{ opacity: 0.6 }}>→</span>
    </motion.button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function ProblemDiagnosisConsultation() {
  const { dispatchTrustSignal, setJourneySelection, setIntent } = useConversion();

  const [state, setState] = useState<DiagnosticState>(INITIAL_STATE);

  // Knowledge graph nodes loaded once
  const [contaminationNodes, setContaminationNodes] = useState<Array<{ entityId: string; label: string }>>([]);
  const [failureModeNodes,   setFailureModeNodes]   = useState<Array<{ entityId: string; label: string }>>([]);
  const [techNodes,          setTechNodes]           = useState<Array<{ entityId: string; label: string }>>([]);
  const [principleNodes,     setPrincipleNodes]      = useState<Array<{ entityId: string; label: string }>>([]);
  const [standardNodes,      setStandardNodes]       = useState<Array<{ entityId: string; label: string }>>([]);

  // Recommendation results
  const [contRecs,    setContRecs]    = useState<Array<{ entityId: string; label: string; summary?: string }>>([]);
  const [fmRecs,      setFmRecs]      = useState<Array<{ entityId: string; label: string; summary?: string }>>([]);

  useEffect(() => {
    setIntent('FAILURE_DIAGNOSIS');

    const toNode = (e: { node: { entityId: string; label: string } }) => ({
      entityId: e.node.entityId,
      label: e.node.label,
    });

    setContaminationNodes(listEntitiesWithProvenance('CONTAMINATION').map(toNode));
    setFailureModeNodes(listEntitiesWithProvenance('FAILURE_MODE').map(toNode));
    setTechNodes(listEntitiesWithProvenance('TECHNOLOGY_ARCHITECTURE').map(toNode));
    setPrincipleNodes(listEntitiesWithProvenance('ENGINEERING_PRINCIPLE').map(toNode));
    setStandardNodes(listEntitiesWithProvenance('STANDARD').map(toNode));
  }, [setIntent]);

  const patch = (partial: Partial<DiagnosticState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  // Derive candidate contamination IDs from symptom selections + asset context
  function deriveContaminationCandidates(
    symptoms: SymptomId[],
    assetId: AssetId | null,
  ): string[] {
    const fromSymptoms = symptoms.flatMap((s) => SYMPTOM_CONTAMINATION_MAP[s] ?? []);
    const fromAsset    = assetId ? (ASSET_CONTAMINATION_MAP[assetId] ?? []) : [];
    // Intersection: prioritise contamination IDs implicated by BOTH symptom and asset
    const intersection = fromSymptoms.filter((id) => fromAsset.includes(id));
    return Array.from(new Set(intersection.length > 0 ? intersection : fromSymptoms));
  }

  // Step 4: when user confirms contamination candidates, derive failure mode recs
  function handleContaminationConfirmed(ids: string[]) {
    patch({ selectedContaminationIds: ids, step: 5 });
    dispatchTrustSignal('T-4');
    if (ids.length > 0) {
      const recs = recommendFromContamination(ids[0]);
      setContRecs(
        recs.map((r) => ({ entityId: r.targetEntityId, label: r.targetLabel, summary: r.explanation })),
      );
    }
  }

  // Step 5: when user confirms failure modes, derive technology recs
  function handleFailureModesConfirmed(ids: string[]) {
    patch({ selectedFailureModeIds: ids, step: 5.5 });
    dispatchTrustSignal('T-5');
    if (ids.length > 0) {
      const recs = recommendFromFailureMode(ids[0]);
      setFmRecs(
        recs.map((r) => ({ entityId: r.targetEntityId, label: r.targetLabel, summary: r.explanation })),
      );
    }
  }

  // Step 6: build diagnosis from confirmed evidence
  function handleDiagnosisBuilt(techIds: string[], principleIds: string[]) {
    patch({ selectedTechIds: techIds, selectedPrincipleIds: principleIds, step: 7 });
    dispatchTrustSignal('T-6');
  }

  // ─── Step renderers ────────────────────────────────────────────────────────

  function renderStep1() {
    return (
      <DiagnosticQuestion
        label="INVESTIGATION · STEP 01 OF 07"
        title="Which type of equipment is experiencing the problem?"
        why="Equipment type determines the baseline contamination exposure profile and the operating systems most likely to be affected. Without knowing the asset category, any contamination hypothesis is unconstrained — we cannot distinguish between an air intake failure mode and a hydraulic failure mode based on symptoms alone."
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '0.65rem',
        }}>
          {ASSETS.map((asset) => (
            <motion.button
              key={asset.id}
              whileHover={{ borderColor: 'rgba(249,168,212,0.3)', background: 'rgba(249,168,212,0.04)' }}
              onClick={() => {
                dispatchTrustSignal('T-1');
                setJourneySelection('industryId', asset.id);
                patch({ assetId: asset.id, assetDescription: `${asset.label} · ${asset.assetType}`, step: 2 });
              }}
              style={{
                padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{asset.icon}</div>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                color: '#fff', fontSize: '0.85rem', marginBottom: '0.2rem',
              }}>
                {asset.label}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
                {asset.assetType}
              </div>
            </motion.button>
          ))}
        </div>
      </DiagnosticQuestion>
    );
  }

  function renderStep2() {
    const asset = ASSETS.find((a) => a.id === state.assetId);
    return (
      <DiagnosticQuestion
        label="INVESTIGATION · STEP 02 OF 07"
        title="What symptoms has the equipment shown?"
        why="Symptoms are the observable evidence of an underlying failure mechanism. Each symptom pattern implicates a specific contamination pathway. Selecting multiple symptoms allows the investigation to identify symptom clusters — combinations that point toward a single contamination root cause rather than multiple unrelated problems."
        eliminated={`Asset confirmed: ${asset?.label ?? ''} · ${asset?.assetType ?? ''}. Contamination exposure profile established. Asset-specific failure modes are now the primary diagnostic hypothesis space.`}
      >
        <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.38)', marginBottom: '0.85rem' }}>
          Select all symptoms that apply. The diagnostic assessment will update as patterns emerge.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SYMPTOMS.map((symptom) => {
            const selected = state.selectedSymptoms.includes(symptom.id);
            return (
              <div key={symptom.id}>
                <SelectBtn
                  selected={selected}
                  onClick={() => {
                    const next = selected
                      ? state.selectedSymptoms.filter((s) => s !== symptom.id)
                      : [...state.selectedSymptoms, symptom.id];
                    patch({ selectedSymptoms: next });
                  }}
                >
                  <div style={{ fontWeight: selected ? 600 : 400 }}>{symptom.label}</div>
                  {selected && (
                    <div style={{ fontSize: '0.7rem', color: 'rgba(249,168,212,0.6)', marginTop: '0.2rem' }}>
                      ◎ {symptom.signal}
                    </div>
                  )}
                </SelectBtn>
              </div>
            );
          })}
        </div>
        {state.selectedSymptoms.length > 0 && (
          <NextBtn
            onClick={() => {
              dispatchTrustSignal('T-2');
              patch({ step: 3 });
            }}
            label={`Confirm ${state.selectedSymptoms.length} symptom${state.selectedSymptoms.length > 1 ? 's' : ''}`}
          />
        )}
      </DiagnosticQuestion>
    );
  }

  function renderStep3() {
    const symptomLabels = state.selectedSymptoms
      .map((s) => SYMPTOMS.find((x) => x.id === s)?.label)
      .filter(Boolean);

    return (
      <DiagnosticQuestion
        label="INVESTIGATION · STEP 03 OF 07"
        title="When did the problem begin, and under what conditions does it occur?"
        why="The onset pattern and operating environment are the two most important diagnostic narrowing signals after symptoms. Sudden onset implies an acute event — a contamination ingestion, a recent service error, or a component failure. Gradual onset implies chronic contamination accumulation. The operating environment determines which contamination pathways are active."
        eliminated={`${symptomLabels.length} symptom${symptomLabels.length > 1 ? 's' : ''} confirmed: ${symptomLabels.join(', ')}. Symptom pattern has been mapped to probable contamination pathways. Operating context will confirm or eliminate specific hypotheses.`}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{
            fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', marginBottom: '0.65rem',
          }}>
            PROBLEM ONSET
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ONSET_OPTIONS.map((onset) => (
              <SelectBtn
                key={onset.id}
                selected={state.onsetId === onset.id}
                onClick={() => patch({ onsetId: onset.id })}
              >
                <div style={{ fontWeight: state.onsetId === onset.id ? 600 : 400 }}>{onset.label}</div>
                {state.onsetId === onset.id && (
                  <div style={{ fontSize: '0.7rem', color: 'rgba(249,168,212,0.6)', marginTop: '0.2rem' }}>
                    ◎ {onset.signal}
                  </div>
                )}
              </SelectBtn>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <p style={{
            fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', marginBottom: '0.65rem',
          }}>
            OPERATING ENVIRONMENT — select all that apply
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.5rem',
          }}>
            {ENVIRONMENT_OPTIONS.map((env) => {
              const selected = state.selectedEnvironments.includes(env.id);
              return (
                <SelectBtn
                  key={env.id}
                  selected={selected}
                  onClick={() => {
                    const next = selected
                      ? state.selectedEnvironments.filter((e) => e !== env.id)
                      : [...state.selectedEnvironments, env.id];
                    patch({ selectedEnvironments: next });
                  }}
                >
                  {env.icon} {env.label}
                </SelectBtn>
              );
            })}
          </div>
        </div>

        {state.onsetId && (
          <NextBtn
            onClick={() => {
              dispatchTrustSignal('T-3');
              // Derive contamination candidates and pre-select them
              const candidates = deriveContaminationCandidates(state.selectedSymptoms, state.assetId);
              patch({ selectedContaminationIds: candidates, step: 3.5 });
            }}
            label="Confirm operating context"
          />
        )}
      </DiagnosticQuestion>
    );
  }

  function renderPhase2Transition() {
    const onset = ONSET_OPTIONS.find((o) => o.id === state.onsetId);
    const envLabels = state.selectedEnvironments
      .map((e) => ENVIRONMENT_OPTIONS.find((x) => x.id === e)?.label)
      .filter(Boolean);

    return (
      <PhaseTransition
        phaseId={1}
        title="Problem identified. Beginning cause investigation."
        evidenceEstablished={`Asset type, symptom pattern, and operating context are confirmed. ${onset ? `Onset: ${onset.label}.` : ''} ${envLabels.length > 0 ? `Environment: ${envLabels.slice(0, 2).join(', ')}.` : ''} Symptom-to-contamination mapping has generated ${state.selectedContaminationIds.length} candidate pathway${state.selectedContaminationIds.length !== 1 ? 's' : ''}.`}
        whyNextPhase="Confirming the contamination mechanism is necessary before failure modes can be attributed. Two equipment assets can show identical symptoms from different contamination pathways — the diagnosis is only reliable once the contamination source is confirmed."
        onClick={() => patch({ step: 4 })}
      />
    );
  }

  function renderStep4() {
    // Show contamination nodes that are candidates from the symptom mapping
    const candidates = contaminationNodes.filter((n) =>
      state.selectedContaminationIds.includes(n.entityId),
    );
    // Also show remaining KG nodes for completeness
    const remaining = contaminationNodes.filter((n) =>
      !state.selectedContaminationIds.includes(n.entityId),
    );
    const displayed = [...candidates, ...remaining].slice(0, 12);

    return (
      <DiagnosticQuestion
        label="INVESTIGATION · STEP 04 OF 07"
        title="Which contamination mechanisms are most consistent with the observed symptoms?"
        why="The symptom pattern has already narrowed the probable contamination pathways. This step asks you to confirm which pathways are plausible given the specific operating context. Selecting contamination mechanisms sets the diagnostic basis — only failure modes traceable to these mechanisms will be considered in the next step, preventing the diagnosis from expanding into unrelated failure categories."
        eliminated={`Operating context confirmed. Symptom-to-contamination analysis has pre-selected ${state.selectedContaminationIds.length} probable pathway${state.selectedContaminationIds.length !== 1 ? 's' : ''}. Contamination pathways not consistent with the symptom pattern have been excluded from consideration.`}
      >
        <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.38)', marginBottom: '0.85rem' }}>
          The highlighted mechanisms were identified by the symptom analysis. Confirm or adjust based on your knowledge of the equipment.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {displayed.map((node) => {
            const selected = state.selectedContaminationIds.includes(node.entityId);
            return (
              <SelectBtn
                key={node.entityId}
                selected={selected}
                onClick={() => {
                  const next = selected
                    ? state.selectedContaminationIds.filter((id) => id !== node.entityId)
                    : [...state.selectedContaminationIds, node.entityId];
                  patch({ selectedContaminationIds: next });
                }}
              >
                {node.label}
              </SelectBtn>
            );
          })}
        </div>
        {state.selectedContaminationIds.length > 0 && (
          <NextBtn
            onClick={() => handleContaminationConfirmed(state.selectedContaminationIds)}
            label={`Confirm ${state.selectedContaminationIds.length} contamination mechanism${state.selectedContaminationIds.length > 1 ? 's' : ''}`}
          />
        )}
      </DiagnosticQuestion>
    );
  }

  function renderStep5() {
    // Merge failure modes from KG recs + all KG nodes, deduplicate
    const recIds = new Set(contRecs.map((r) => r.entityId));
    const recsAsNodes = contRecs.map((r) => ({ entityId: r.entityId, label: r.label }));
    const remaining   = failureModeNodes.filter((n) => !recIds.has(n.entityId));
    const displayed   = [...recsAsNodes, ...remaining].slice(0, 12);

    return (
      <DiagnosticQuestion
        label="INVESTIGATION · STEP 05 OF 07"
        title="Which failure modes are consistent with the confirmed contamination mechanisms?"
        why="Contamination does not directly cause equipment failure — it causes specific failure modes that then produce the observed symptoms. Identifying the failure mode is what allows a corrective action to be engineered, rather than just a symptom to be treated. Without confirming the failure mode, any recommended technology addresses the symptom rather than the root cause."
        eliminated={`${state.selectedContaminationIds.length} contamination mechanism${state.selectedContaminationIds.length > 1 ? 's' : ''} confirmed. The diagnostic hypothesis is now constrained to failure modes that result from these specific contamination pathways. Failure modes from unrelated contamination sources have been excluded.`}
      >
        <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.38)', marginBottom: '0.85rem' }}>
          Select the failure modes that best explain the symptoms observed. Multiple failure modes may be active simultaneously.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {displayed.map((node) => {
            const selected = state.selectedFailureModeIds.includes(node.entityId);
            return (
              <SelectBtn
                key={node.entityId}
                selected={selected}
                onClick={() => {
                  const next = selected
                    ? state.selectedFailureModeIds.filter((id) => id !== node.entityId)
                    : [...state.selectedFailureModeIds, node.entityId];
                  patch({ selectedFailureModeIds: next });
                }}
              >
                {node.label}
              </SelectBtn>
            );
          })}
        </div>
        {state.selectedFailureModeIds.length > 0 && (
          <NextBtn
            onClick={() => handleFailureModesConfirmed(state.selectedFailureModeIds)}
            label={`Confirm ${state.selectedFailureModeIds.length} failure mode${state.selectedFailureModeIds.length > 1 ? 's' : ''}`}
          />
        )}
      </DiagnosticQuestion>
    );
  }

  function renderPhase3Transition() {
    return (
      <PhaseTransition
        phaseId={2}
        title="Contamination mechanisms and failure modes confirmed. Building engineering diagnosis."
        evidenceEstablished={`${state.selectedContaminationIds.length} contamination pathway${state.selectedContaminationIds.length !== 1 ? 's' : ''} and ${state.selectedFailureModeIds.length} failure mode${state.selectedFailureModeIds.length !== 1 ? 's' : ''} confirmed from the evidence. The cause chain from contamination source to observable symptom is now traceable.`}
        whyNextPhase="The final phase attributes specific engineering principles and protection technology architectures to the confirmed failure modes. This transforms the diagnosis from 'what is failing' into 'what the engineering response should be and why' — enabling a corrective action that addresses the root cause, not the symptoms."
        onClick={() => {
          // Derive tech and principle IDs from failure mode recs
          const techIds = fmRecs.map((r) => r.entityId).slice(0, 4);
          const principleIds = principleNodes.slice(0, 3).map((n) => n.entityId);
          handleDiagnosisBuilt(techIds, principleIds);
        }}
      />
    );
  }

  function renderStep6() {
    // Build the diagnosis display — show the full evidence chain
    const asset         = ASSETS.find((a) => a.id === state.assetId);
    const symptomLabels = state.selectedSymptoms.map((s) => SYMPTOMS.find((x) => x.id === s)?.label).filter(Boolean);
    const onset         = ONSET_OPTIONS.find((o) => o.id === state.onsetId);
    const conts         = contaminationNodes.filter((n) => state.selectedContaminationIds.includes(n.entityId));
    const fms           = failureModeNodes.filter((n) => state.selectedFailureModeIds.includes(n.entityId));
    const techs         = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));
    const principles    = principleNodes.filter((n) => state.selectedPrincipleIds.includes(n.entityId));
    const standards     = standardNodes.slice(0, 4);
    const hypothesis    = buildHypothesis(state.selectedSymptoms, state.onsetId, state.selectedContaminationIds);

    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <p style={{
          fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', marginBottom: '0.4rem',
        }}>
          INVESTIGATION · STEP 06 OF 07
        </p>

        {/* Root Cause Assessment */}
        <div style={{
          padding: '1.5rem', marginBottom: '1.5rem',
          background: 'rgba(249,168,212,0.03)',
          border: '1px solid rgba(249,168,212,0.12)',
          borderRadius: '10px',
        }}>
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(249,168,212,0.45)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>
            ROOT CAUSE ASSESSMENT
          </p>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <AssessmentRow label="Asset Under Investigation" value={asset ? `${asset.label} · ${asset.assetType}` : '—'} />
            <AssessmentRow
              label="Observed Symptoms"
              value={symptomLabels.join(' · ')}
              color="rgba(249,168,212,0.75)"
            />
            <AssessmentRow
              label="Problem Onset"
              value={onset?.label ?? '—'}
            />
            <AssessmentRow
              label="Most Probable Contamination Mechanisms"
              value={conts.length > 0 ? conts.map((n) => n.label).join(' · ') : '—'}
              color="rgba(253,186,116,0.8)"
            />
            <AssessmentRow
              label="Most Probable Failure Modes"
              value={fms.length > 0 ? fms.map((n) => n.label).join(' · ') : '—'}
              color="rgba(252,165,165,0.8)"
            />
            <AssessmentRow
              label="Engineering Hypothesis"
              value={hypothesis}
              color="rgba(255,255,255,0.55)"
            />
          </div>
        </div>

        {/* Engineering explanation */}
        <div style={{
          padding: '1.25rem 1.25rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: '0.75rem',
          }}>
            ENGINEERING EXPLANATION
          </p>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.52)', margin: 0, lineHeight: 1.75, textAlign: 'justify' }}>
            The symptom pattern — {symptomLabels.slice(0, 3).join(', ')} — is consistent with{' '}
            {conts.length > 0 ? conts.map((n) => n.label.toLowerCase()).join(' and ') : 'the confirmed contamination pathways'}.
            This contamination pathway produces the observed failure modes by{' '}
            {fms.length > 0
              ? `inducing ${fms.map((n) => n.label.toLowerCase()).join(' and ')}`
              : 'degrading component surfaces beyond their designed tolerance'}.
            The onset pattern ({onset?.label?.toLowerCase() ?? 'not specified'}) is consistent with this mechanism —
            {onset?.id === 'sudden'
              ? ' acute contamination events typically follow a service error, a seal breach, or a filter bypass incident.'
              : onset?.id === 'gradual'
              ? ' progressive contamination accumulation over time indicates the filtration system is operating below the required cleanliness target for this application.'
              : onset?.id === 'post-service'
              ? ' post-service onset is highly indicative of incorrect filter specification, reinstallation error, or introduction of contamination during servicing.'
              : ' cyclical onset indicates contamination that activates under specific load or temperature conditions, typically involving bypass valve behaviour or fluid state changes.'}
          </p>
        </div>

        {/* Supporting engineering principles */}
        {principles.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: '0.65rem',
            }}>
              SUPPORTING ENGINEERING PRINCIPLES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {principles.slice(0, 3).map((p) => (
                <div key={p.entityId} style={{
                  padding: '0.65rem 0.9rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '5px',
                  fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)',
                }}>
                  {p.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technology architectures */}
        {techs.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: '0.65rem',
            }}>
              APPLICABLE TECHNOLOGY ARCHITECTURES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {techs.slice(0, 4).map((t) => (
                <div key={t.entityId} style={{
                  padding: '0.65rem 0.9rem',
                  background: 'rgba(255,241,45,0.03)',
                  border: '1px solid rgba(255,241,45,0.1)',
                  borderRadius: '5px',
                  fontSize: '0.78rem', color: 'rgba(255,241,45,0.65)',
                }}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standards */}
        {standards.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: '0.65rem',
            }}>
              SUPPORTING STANDARDS
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {standards.map((s) => (
                <span key={s.entityId} style={{
                  padding: '0.25rem 0.65rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px', fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <NextBtn
          onClick={() => patch({ step: 7 })}
          label="View corrective strategy"
        />
      </motion.div>
    );
  }

  function renderStep7() {
    const asset      = ASSETS.find((a) => a.id === state.assetId);
    const conts      = contaminationNodes.filter((n) => state.selectedContaminationIds.includes(n.entityId));
    const fms        = failureModeNodes.filter((n) => state.selectedFailureModeIds.includes(n.entityId));
    const techs      = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));

    // Derive contamination domain from selected entity IDs
    function deriveDomain(): ContaminationDomain {
      const ids = state.selectedContaminationIds;
      if (ids.some(id => id.includes('HYD'))) return 'HYDRAULIC';
      if (ids.some(id => id.includes('FUEL') || id.includes('PARTICLE-FUEL') || id.includes('WATER-FUEL'))) return 'FUEL';
      if (ids.some(id => id.includes('OIL') || id.includes('WEAR-PARTICLE-OIL'))) return 'LUBE_OIL';
      if (ids.some(id => id.includes('DUST') || id.includes('RCS') || id.includes('MINERAL'))) return 'AIR_INTAKE';
      if (ids.some(id => id.includes('COMPRESSED-AIR'))) return 'COMPRESSED_AIR';
      if (ids.some(id => id.includes('CABIN'))) return 'CABIN_AIR';
      return 'UNKNOWN';
    }

    // Run Decision Engine evaluation (Step 3 → Step 5a → Step 5 → Step 6)
    const evaluationInput: EvaluationInput = {
      intentClass: 'FAILURE_DIAGNOSIS',
      domain: deriveDomain(),
      assetId: state.assetId,
      assetDescription: state.assetDescription || null,
      contaminationEntityIds: state.selectedContaminationIds,
      failureModeEntityIds: state.selectedFailureModeIds,
      principleEntityIds: state.selectedPrincipleIds,
      technologyEntityIds: state.selectedTechIds,
      symptomIds: state.selectedSymptoms,
      environmentIds: state.selectedEnvironments,
      onsetId: state.onsetId,
      operatingConditionsKnown: state.selectedEnvironments.length > 0 || state.onsetId !== null,
      draftClaims: [],
    };

    const decisionResult = evaluate(evaluationInput);
    const confidence = decisionResult.decisionState === 'HIGH' ? 'HIGH'
      : decisionResult.decisionState === 'MEDIUM' ? 'MEDIUM'
      : decisionResult.decisionState === 'PROHIBITED' ? 'LOW'
      : 'LOW';

    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p style={{
          fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', marginBottom: '0.4rem',
        }}>
          INVESTIGATION · STEP 07 OF 07
        </p>
        <h2 style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 700,
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          color: '#fff', margin: '0 0 0.5rem',
        }}>
          Corrective Action Strategy
        </h2>
        <p style={{
          fontSize: '0.83rem', color: 'rgba(255,255,255,0.42)',
          margin: '0 0 2rem', lineHeight: 1.65, textAlign: 'justify',
        }}>
          The following corrective strategy addresses the confirmed root cause — not the observed symptoms.
          Treating symptoms without correcting the contamination mechanism produces temporary relief
          and accelerates the failure timeline. Each corrective action is traceable to a specific
          contamination pathway confirmed during this investigation.
        </p>

        {/* Corrective actions */}
        <div style={{ marginBottom: '1.75rem' }}>
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(252,165,165,0.5)', letterSpacing: '0.1em', marginBottom: '0.85rem',
          }}>
            RECOMMENDED CORRECTIVE ACTIONS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              {
                action: 'Establish baseline contamination measurement',
                rationale: 'Take an oil sample or hydraulic fluid sample immediately. Send for ISO 4406 particle count analysis before any corrective action, to establish the damage baseline and verify the contamination pathway.',
              },
              {
                action: 'Identify and close the contamination ingress point',
                rationale: conts.length > 0
                  ? `Trace each confirmed contamination mechanism (${conts.map((n) => n.label).join(', ')}) to its ingress point: filter bypass, seal failure, breather contamination, or service introduction.`
                  : 'Trace the confirmed contamination pathway to its ingress point before replacing components. Replacing worn parts without closing the ingress source repeats the failure cycle.',
              },
              {
                action: 'Replace contaminated fluid — do not simply filter in-service fluid',
                rationale: 'When particle concentration exceeds the ISO target for the application, the wear debris already suspended in the fluid continues to cause damage during filtration. A full fluid change resets the contamination baseline.',
              },
              {
                action: 'Verify filter specification against confirmed contamination particle size',
                rationale: `The confirmed failure modes (${fms.map((n) => n.label).join(', ')}) require a filter with a Beta ratio matched to the particle size range causing wear. If the current filter passes particles in the 5–15µm range, it will not arrest the identified failure mechanism.`,
              },
              {
                action: 'Implement ongoing cleanliness monitoring',
                rationale: 'After corrective action, establish a scheduled oil analysis programme. The failure mode will re-emerge within one to three service intervals if the contamination source was not fully closed.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '0.9rem 1rem',
                background: 'rgba(252,165,165,0.03)',
                border: '1px solid rgba(252,165,165,0.1)',
                borderRadius: '6px',
              }}>
                <p style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                  fontSize: '0.82rem', color: 'rgba(252,165,165,0.75)', margin: '0 0 0.35rem',
                }}>
                  {i + 1}. {item.action}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
                  {item.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Protection strategy */}
        <div style={{ marginBottom: '1.75rem' }}>
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.45)', letterSpacing: '0.1em', marginBottom: '0.85rem',
          }}>
            RECOMMENDED PROTECTION STRATEGY
          </p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.42)', marginBottom: '0.75rem', lineHeight: 1.65, textAlign: 'justify' }}>
            Once the root cause is corrected and contamination levels are restored to target,
            the following protection technology architectures will prevent recurrence.
            These recommendations are based on the confirmed contamination mechanisms and the asset operating environment.
          </p>
          {techs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {techs.map((t) => {
                const fmRec = fmRecs.find((r) => r.entityId === t.entityId);
                return (
                  <div key={t.entityId} style={{
                    padding: '0.9rem 1rem',
                    background: 'rgba(255,241,45,0.04)',
                    border: '1px solid rgba(255,241,45,0.12)',
                    borderRadius: '6px',
                  }}>
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                      fontSize: '0.77rem', color: '#FFF12D', margin: '0 0 0.3rem',
                    }}>
                      {t.label}
                    </p>
                    {fmRec?.summary && (
                      <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
                        {fmRec.summary}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              padding: '1rem', background: 'rgba(255,241,45,0.03)',
              border: '1px solid rgba(255,241,45,0.08)', borderRadius: '6px',
              fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)',
            }}>
              Contact our engineering team for a tailored protection strategy based on this diagnosis.
            </div>
          )}
        </div>

        {/* Confidence level */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.75rem 1rem', marginBottom: '1.75rem',
          background: 'rgba(134,239,172,0.04)',
          border: '1px solid rgba(134,239,172,0.12)',
          borderRadius: '6px',
        }}>
          <span style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(134,239,172,0.45)', letterSpacing: '0.1em', flexShrink: 0,
          }}>
            DIAGNOSIS CONFIDENCE
          </span>
          <span style={{
            fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
            color: '#86efac',
          }}>
            {confidence}
          </span>
          <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.35)' }}>
            — Contamination pathway, failure modes, and corrective strategy have been confirmed
            from the evidence gathered during this investigation.
          </span>
        </div>

        {/* CTA — products appear LAST, after the diagnosis is understood */}
        <div style={{
          padding: '1.25rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          marginBottom: '0.75rem',
        }}>
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', marginBottom: '0.6rem',
          }}>
            RECOMMENDED PRODUCTS
          </p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem', lineHeight: 1.6 }}>
            The following products implement the confirmed protection strategy for {asset?.label ?? 'your equipment'}.
            Product selection is the final step — the engineering diagnosis above defines what the products must achieve.
          </p>
          <CTACard onLeadCapture={() => { dispatchTrustSignal('T-7'); }} />
        </div>
      </motion.div>
    );
  }

  // ─── Root render ───────────────────────────────────────────────────────────

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Navigation */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <Link href="/engineering" style={{
          fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
          letterSpacing: '0.08em',
        }}>
          ← ENGINEERING
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.7rem' }}>·</span>
        <span style={{
          fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(249,168,212,0.45)', letterSpacing: '0.08em',
        }}>
          PROBLEM DIAGNOSIS
        </span>
      </div>

      {/* Hero */}
      <div style={{
        padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 2.5rem)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'radial-gradient(ellipse at 30% 0%, rgba(249,168,212,0.04) 0%, transparent 65%)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p style={{
            fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(249,168,212,0.4)', letterSpacing: '0.12em', marginBottom: '0.6rem',
          }}>
            ENGINEERING SERVICES · ROOT CAUSE INVESTIGATION
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 700,
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            color: '#fff', margin: '0 0 0.75rem', lineHeight: 1.2,
          }}>
            Problem Diagnosis
          </h1>
          <p style={{
            fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
            color: 'rgba(255,255,255,0.42)',
            margin: 0, lineHeight: 1.7,
            maxWidth: '580px', textAlign: 'justify',
          }}>
            Something is wrong. This investigation traces what you are observing — through the
            contamination mechanism that is causing it — to the most probable root cause.
            The diagnosis comes before the recommendation. Products appear only after the engineering
            case is established.
          </p>
        </motion.div>
      </div>

      {/* Consultation body */}
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 2rem)',
      }}>
        {/* Phase progress header */}
        <PhaseHeader currentStep={Math.floor(state.step)} />

        {/* Live diagnostic assessment panel — always updating */}
        <LiveDiagnosticPanel
          state={state}
          contaminationNodes={contaminationNodes}
          failureModeNodes={failureModeNodes}
          techNodes={techNodes}
        />

        {/* Step content */}
        <AnimatePresence mode="wait">
          {state.step === 1     && <div key="s1">{renderStep1()}</div>}
          {state.step === 2     && <div key="s2">{renderStep2()}</div>}
          {state.step === 3     && <div key="s3">{renderStep3()}</div>}
          {state.step === 3.5   && <div key="t1">{renderPhase2Transition()}</div>}
          {state.step === 4     && <div key="s4">{renderStep4()}</div>}
          {state.step === 5     && <div key="s5">{renderStep5()}</div>}
          {state.step === 5.5   && <div key="t2">{renderPhase3Transition()}</div>}
          {state.step === 6     && <div key="s6">{renderStep6()}</div>}
          {state.step === 7     && <div key="s7">{renderStep7()}</div>}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Assessment row helper ─────────────────────────────────────────────────────

function AssessmentRow({
  label, value, color,
}: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '0.75rem', alignItems: 'start' }}>
      <p style={{
        fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
        color: 'rgba(255,255,255,0.25)', margin: 0, paddingTop: '0.15rem', letterSpacing: '0.06em',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '0.78rem',
        color: color ?? 'rgba(255,255,255,0.6)',
        margin: 0, lineHeight: 1.55,
      }}>
        {value}
      </p>
    </div>
  );
}
