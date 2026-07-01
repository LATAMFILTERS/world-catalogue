'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback } from 'react';
import {
  listEntitiesWithProvenance,
  recommendFromContamination,
  recommendFromFailureMode,
  recommendFromTechnology,
} from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import { CTACard } from '@/components/conversion/CTACard';

// ─── Stage definitions ─────────────────────────────────────────────────────────

const STAGES = [
  {
    id: 1,
    label: 'Understand the Asset',
    description: 'Asset type, operating industry, and environmental conditions',
    steps: [1, 2, 3],
    color: '#7dd3fc',
  },
  {
    id: 2,
    label: 'Diagnose the Risk',
    description: 'Symptoms, contamination sources, failure modes, and engineering principles',
    steps: [4, 5, 6, 7],
    color: '#fdba74',
  },
  {
    id: 3,
    label: 'Build the Protection Strategy',
    description: 'Technology architectures, standards, assessment summary, and implementation',
    steps: [8, 9, 10, 11],
    color: '#FFF12D',
  },
] as const;

function getStage(step: number) {
  return STAGES.find((s) => s.steps.includes(step as never)) ?? STAGES[0];
}

// ─── Industry data ─────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { id: 'agriculture',    label: 'Agriculture',           icon: '🌾', assetType: 'Tractors & Harvesters',     risk: 'Mineral dust ingestion' },
  { id: 'mining',         label: 'Mining',                icon: '⛏', assetType: 'Excavators & Haul Trucks',   risk: 'Silica & coal dust' },
  { id: 'marine',         label: 'Marine',                icon: '⚓', assetType: 'Vessels & Generators',       risk: 'Catalytic fines & water' },
  { id: 'construction',   label: 'Construction',          icon: '🏗', assetType: 'Cranes & Loaders',           risk: 'Particle wear & water' },
  { id: 'oil-gas',        label: 'Oil & Gas',             icon: '🛢', assetType: 'Pumps & Compressors',        risk: 'Contamination & corrosion' },
  { id: 'power',          label: 'Power Generation',      icon: '⚡', assetType: 'Turbines & Generators',      risk: 'Air & lube contamination' },
  { id: 'transport',      label: 'Transport & Logistics', icon: '🚛', assetType: 'Fleet Trucks',               risk: 'Air intake & fuel quality' },
  { id: 'manufacturing',  label: 'Manufacturing',         icon: '🏭', assetType: 'CNC & Hydraulic Presses',   risk: 'Hydraulic particle wear' },
  { id: 'forestry',       label: 'Forestry',              icon: '🌲', assetType: 'Harvesters & Forwarders',   risk: 'Extreme dust & debris' },
  { id: 'food',           label: 'Food & Beverage',       icon: '🥫', assetType: 'Processing Equipment',      risk: 'Compressed air purity' },
  { id: 'military',       label: 'Defence',               icon: '🎖', assetType: 'Tactical Vehicles',          risk: 'Extreme dust & reliability' },
  { id: 'rail',           label: 'Rail',                  icon: '🚂', assetType: 'Locomotives',                risk: 'Diesel & lube contamination' },
] as const;

type IndustryId = typeof INDUSTRIES[number]['id'];

const OPERATING_CONDITIONS = [
  { id: 'dusty',        label: 'High dust / airborne particles',   icon: '🌪' },
  { id: 'wet',          label: 'Water / moisture exposure',         icon: '💧' },
  { id: 'extreme-temp', label: 'Extreme temperature ranges',        icon: '🌡' },
  { id: 'heavy-load',   label: 'Continuous heavy load cycles',      icon: '⚙️' },
  { id: 'vibration',    label: 'High vibration environment',        icon: '📳' },
  { id: 'intermittent', label: 'Intermittent / seasonal operation', icon: '🔄' },
] as const;

type ConditionId = typeof OPERATING_CONDITIONS[number]['id'];

const SYMPTOMS = [
  { id: 'premature-wear',   label: 'Premature engine or component wear' },
  { id: 'fuel-consumption', label: 'Increased fuel consumption' },
  { id: 'hydraulic-drift',  label: 'Hydraulic system slow response or drift' },
  { id: 'filter-interval',  label: 'Shortened filter service intervals' },
  { id: 'overheating',      label: 'Frequent overheating events' },
  { id: 'cabin-quality',    label: 'Cabin air quality concerns' },
  { id: 'injector-issues',  label: 'Injector or fuel system problems' },
  { id: 'high-downtime',    label: 'Unplanned maintenance downtime' },
] as const;

type SymptomId = typeof SYMPTOMS[number]['id'];

const INDUSTRY_CONTAMINATION_MAP: Record<IndustryId, string[]> = {
  agriculture:    ['CONT-DUST-MINERAL', 'CONT-WEAR-PARTICLE-OIL', 'CONT-PARTICLE-FUEL'],
  mining:         ['CONT-DUST-MINERAL', 'CONT-RCS-SILICA', 'CONT-WEAR-PARTICLE-HYD'],
  marine:         ['CONT-CATALYTIC-FINES-MARINE', 'CONT-WATER-FUEL', 'CONT-WEAR-PARTICLE-OIL'],
  construction:   ['CONT-DUST-MINERAL', 'CONT-WEAR-PARTICLE-HYD', 'CONT-WEAR-PARTICLE-OIL'],
  'oil-gas':      ['CONT-PARTICLE-FUEL', 'CONT-WATER-FUEL', 'CONT-WEAR-PARTICLE-HYD'],
  power:          ['CONT-DUST-MINERAL', 'CONT-WEAR-PARTICLE-OIL', 'CONT-WATER-COMPRESSED-AIR'],
  transport:      ['CONT-DUST-MINERAL', 'CONT-PARTICLE-FUEL', 'CONT-WEAR-PARTICLE-OIL'],
  manufacturing:  ['CONT-WEAR-PARTICLE-HYD', 'CONT-WATER-COMPRESSED-AIR', 'CONT-WEAR-PARTICLE-OIL'],
  forestry:       ['CONT-DUST-MINERAL', 'CONT-RCS-SILICA', 'CONT-WEAR-PARTICLE-OIL'],
  food:           ['CONT-WATER-COMPRESSED-AIR', 'CONT-DUST-MINERAL', 'CONT-PARTICLE-FUEL'],
  military:       ['CONT-DUST-MINERAL', 'CONT-RCS-SILICA', 'CONT-WEAR-PARTICLE-OIL'],
  rail:           ['CONT-WEAR-PARTICLE-OIL', 'CONT-PARTICLE-FUEL', 'CONT-WATER-FUEL'],
};

// ─── State ─────────────────────────────────────────────────────────────────────

interface ConsultationState {
  step: number;
  assetDescription: string;
  industryId: IndustryId | null;
  selectedConditions: ConditionId[];
  selectedSymptoms: SymptomId[];
  selectedContaminationIds: string[];
  selectedFailureModeIds: string[];
  selectedPrincipleIds: string[];
  selectedTechIds: string[];
}

const INITIAL_STATE: ConsultationState = {
  step: 1,
  assetDescription: '',
  industryId: null,
  selectedConditions: [],
  selectedSymptoms: [],
  selectedContaminationIds: [],
  selectedFailureModeIds: [],
  selectedPrincipleIds: [],
  selectedTechIds: [],
};

// ─── Live Assessment Panel ─────────────────────────────────────────────────────
// Renders a persistent card summarising everything established so far.
// Appears from step 2 onward; updates after every interaction.

interface LiveAssessmentPanelProps {
  state: ConsultationState;
  contaminationNodes: Array<{ entityId: string; label: string }>;
  failureModeNodes:   Array<{ entityId: string; label: string }>;
  techNodes:          Array<{ entityId: string; label: string }>;
}

function LiveAssessmentPanel({
  state, contaminationNodes, failureModeNodes, techNodes,
}: LiveAssessmentPanelProps) {
  const ind   = INDUSTRIES.find((i) => i.id === state.industryId);
  const conts = contaminationNodes.filter((n) => state.selectedContaminationIds.includes(n.entityId));
  const fms   = failureModeNodes.filter((n) => state.selectedFailureModeIds.includes(n.entityId));
  const techs = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));

  const filledFields = [
    state.assetDescription,
    state.industryId,
    state.selectedConditions.length,
    state.selectedContaminationIds.length,
    state.selectedFailureModeIds.length,
    state.selectedTechIds.length,
  ].filter(Boolean).length;

  const confidence =
    filledFields >= 5 ? 'HIGH'
    : filledFields >= 3 ? 'BUILDING'
    : 'INITIAL';

  const confColor =
    confidence === 'HIGH'     ? '#86efac'
    : confidence === 'BUILDING' ? '#fdba74'
    : 'rgba(255,255,255,0.25)';

  const condLabels = state.selectedConditions
    .map((c) => OPERATING_CONDITIONS.find((o) => o.id === c)?.label)
    .filter(Boolean);

  // Nothing to show yet
  if (state.step <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        marginBottom: '1.75rem',
        padding: '1rem 1.1rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '8px',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '0.75rem',
      }}>
        <span style={{
          fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em',
        }}>
          CONSULTATION PROGRESS SUMMARY
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: '0.65rem',
      }}>
        <SummaryRow
          label="Asset"
          value={state.assetDescription || '—'}
          filled={!!state.assetDescription}
        />
        <SummaryRow
          label="Operating Environment"
          value={ind ? `${ind.label} · ${ind.assetType}` : '—'}
          filled={!!ind}
        />
        <SummaryRow
          label="Conditions"
          value={condLabels.length > 0 ? condLabels.join(', ') : '—'}
          filled={condLabels.length > 0}
        />
        <SummaryRow
          label="Current Risk Profile"
          value={
            conts.length > 0
              ? conts.map((n) => n.label).join(', ')
              : ind
              ? `${ind.risk} — awaiting confirmation`
              : '—'
          }
          filled={conts.length > 0}
          valueColor="rgba(253,186,116,0.8)"
        />
        <SummaryRow
          label="Most Probable Failure Modes"
          value={fms.length > 0 ? fms.map((n) => n.label).join(', ') : '—'}
          filled={fms.length > 0}
          valueColor="rgba(252,165,165,0.75)"
        />
        <SummaryRow
          label="Protection Strategy"
          value={techs.length > 0 ? techs.map((n) => n.label).join(', ') : 'Being built…'}
          filled={techs.length > 0}
          valueColor="rgba(255,241,45,0.8)"
        />
      </div>
    </motion.div>
  );
}

function SummaryRow({
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
        fontSize: '0.72rem', color: filled ? (valueColor ?? 'rgba(255,255,255,0.65)') : 'rgba(255,255,255,0.2)',
        margin: 0, lineHeight: 1.45,
        fontStyle: filled ? 'normal' : 'italic',
      }}>
        {value}
      </p>
    </div>
  );
}

// ─── Stage progress header ─────────────────────────────────────────────────────

function StageHeader({ currentStep }: { currentStep: number }) {
  const currentStage = getStage(currentStep);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {STAGES.map((stage) => {
          const isActive = stage.id === currentStage.id;
          const isDone   = stage.id < currentStage.id;
          return (
            <div
              key={stage.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                background: isActive ? `${stage.color}12` : isDone ? 'rgba(134,239,172,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? stage.color + '35' : isDone ? 'rgba(134,239,172,0.2)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '20px', transition: 'all 0.3s',
              }}
            >
              <span style={{
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.52rem', fontFamily: 'JetBrains Mono, monospace',
                background: isActive ? stage.color : isDone ? '#86efac' : 'rgba(255,255,255,0.07)',
                color: isActive || isDone ? '#000' : 'rgba(255,255,255,0.25)',
                fontWeight: 700, flexShrink: 0,
              }}>
                {isDone ? '✓' : stage.id}
              </span>
              <span style={{
                fontSize: '0.7rem', fontFamily: 'Outfit, sans-serif',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? stage.color : isDone ? 'rgba(134,239,172,0.65)' : 'rgba(255,255,255,0.25)',
                whiteSpace: 'nowrap',
              }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '0.75rem 1rem',
        background: `${currentStage.color}07`,
        border: `1px solid ${currentStage.color}18`,
        borderLeft: `3px solid ${currentStage.color}`,
        borderRadius: '0 6px 6px 0',
      }}>
        <p style={{ margin: 0, fontSize: '0.7rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: currentStage.color, marginBottom: '0.15rem' }}>
          {currentStage.label}
        </p>
        <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)' }}>
          {currentStage.description}
        </p>
      </div>
    </div>
  );
}

// ─── Question block ────────────────────────────────────────────────────────────

interface QuestionProps {
  label: string;
  title: string;
  // "Why this question is being asked" — the engineering justification for asking
  why: string;
  // "What we learned from the previous answer" — uncertainty eliminated so far
  established?: string;
  children: React.ReactNode;
}

function Question({ label, title, why, established, children }: QuestionProps) {
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

        {/* Why this question matters */}
        <div style={{
          display: 'flex', gap: '0.65rem',
          padding: '0.7rem 0.9rem',
          background: 'rgba(255,241,45,0.03)',
          border: '1px solid rgba(255,241,45,0.07)',
          borderRadius: '6px',
          marginBottom: established ? '0.55rem' : '1.5rem',
        }}>
          <span style={{
            fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.08em', paddingTop: '1px', flexShrink: 0,
          }}>
            WHY
          </span>
          <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.48)', margin: 0, lineHeight: 1.65 }}>
            {why}
          </p>
        </div>

        {/* What we learned — uncertainty eliminated */}
        {established && (
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
              ✓
            </span>
            <p style={{ fontSize: '0.76rem', color: 'rgba(134,239,172,0.6)', margin: 0, lineHeight: 1.6 }}>
              {established}
            </p>
          </div>
        )}
      </div>

      {children}
    </motion.div>
  );
}

// ─── Shared UI atoms ───────────────────────────────────────────────────────────

function SelectBtn({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
      onClick={onClick}
      style={{
        padding: '0.7rem 1rem', textAlign: 'left', cursor: 'pointer',
        background: selected ? 'rgba(255,241,45,0.07)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${selected ? 'rgba(255,241,45,0.35)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '6px',
        color: selected ? '#FFF12D' : 'rgba(255,255,255,0.58)',
        fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', lineHeight: 1.4,
        transition: 'all 0.12s',
      }}
    >
      {children}
    </motion.button>
  );
}

function NextBtn({ onClick, label = 'Continue' }: { onClick: () => void; label?: string }) {
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

// ─── Stage transition card ─────────────────────────────────────────────────────

function StageTransition({
  stageId, title, whatWeKnow, whatComesNext, onClick,
}: {
  stageId: number; title: string;
  whatWeKnow: string;   // what uncertainty was eliminated
  whatComesNext: string; // why the next stage is necessary
  onClick: () => void;
}) {
  const stage = STAGES.find((s) => s.id === stageId)!;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '1.5rem',
        background: `${stage.color}07`,
        border: `1px solid ${stage.color}22`,
        borderRadius: '10px',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
          background: `${stage.color}15`, border: `1px solid ${stage.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
          color: stage.color, fontWeight: 700,
        }}>
          {stageId}
        </div>
        <div>
          <p style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: `${stage.color}70`, letterSpacing: '0.1em', margin: 0, marginBottom: '0.15rem' }}>
            MOVING TO STAGE {stageId}
          </p>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>
            {title}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{
          padding: '0.65rem 0.9rem',
          background: 'rgba(134,239,172,0.04)', border: '1px solid rgba(134,239,172,0.1)',
          borderRadius: '6px', display: 'flex', gap: '0.6rem',
        }}>
          <span style={{ fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(134,239,172,0.45)', paddingTop: '1px', flexShrink: 0, letterSpacing: '0.06em' }}>ESTABLISHED</span>
          <p style={{ fontSize: '0.78rem', color: 'rgba(134,239,172,0.65)', margin: 0, lineHeight: 1.6 }}>{whatWeKnow}</p>
        </div>
        <div style={{
          padding: '0.65rem 0.9rem',
          background: `${stage.color}06`, border: `1px solid ${stage.color}18`,
          borderRadius: '6px', display: 'flex', gap: '0.6rem',
        }}>
          <span style={{ fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace', color: `${stage.color}60`, paddingTop: '1px', flexShrink: 0, letterSpacing: '0.06em' }}>NEXT</span>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>{whatComesNext}</p>
        </div>
      </div>

      <NextBtn onClick={onClick} label={`Begin ${title}`} />
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AssetProtectionConsultation() {
  const [state, setState] = useState<ConsultationState>(INITIAL_STATE);
  const { dispatchTrustSignal, setJourneySelection, receiveRecommendation, setIntent } = useConversion();

  const selectedIndustry = INDUSTRIES.find((i) => i.id === state.industryId) ?? null;

  const contaminationNodes = listEntitiesWithProvenance('CONTAMINATION').map(({ node }) => node);
  const failureModeNodes   = listEntitiesWithProvenance('FAILURE_MODE').map(({ node }) => node);
  const principleNodes     = listEntitiesWithProvenance('ENGINEERING_PRINCIPLE').map(({ node }) => node);
  const techNodes          = listEntitiesWithProvenance('TECHNOLOGY_ARCHITECTURE').map(({ node }) => node);

  const advance = useCallback((nextStep: number, updates?: Partial<ConsultationState>) => {
    setState((s) => ({ ...s, ...updates, step: nextStep }));
  }, []);

  const toggle = useCallback(<T extends string>(key: keyof ConsultationState, id: T) => {
    setState((s) => {
      const arr = s[key] as T[];
      return { ...s, [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
    });
  }, []);

  // ─── Stage 1: Understand the Asset ──────────────────────────────────────────

  function renderStep1() {
    return (
      <Question
        label="STAGE 1 · UNDERSTAND THE ASSET"
        title="Which asset are you protecting?"
        why="Asset type determines which systems are at risk and which contamination pathways are physically possible. A diesel excavator, a marine generator, and a hydraulic press face entirely different failure modes — the asset is the starting point for every decision that follows."
      >
        <textarea
          value={state.assetDescription}
          onChange={(e) => setState((s) => ({ ...s, assetDescription: e.target.value }))}
          placeholder="e.g. Caterpillar 390F excavator, MAN TGX 18.500 fleet truck, Grundfos centrifugal pump station, Cummins QSK60 generator set…"
          style={{
            width: '100%', minHeight: '88px', padding: '0.9rem 1rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '6px', color: '#fff', fontFamily: 'Inter, sans-serif',
            fontSize: '0.88rem', lineHeight: 1.65, resize: 'vertical', boxSizing: 'border-box',
          }}
        />
        <NextBtn
          onClick={() => {
            setJourneySelection('assetDescription', state.assetDescription);
            setIntent('PROACTIVE_PROTECTION');
            dispatchTrustSignal('T-1');
            advance(2);
          }}
          label="Identify operating context"
        />
      </Question>
    );
  }

  function renderStep2() {
    return (
      <Question
        label="STAGE 1 · UNDERSTAND THE ASSET"
        title="What industry does this asset operate in?"
        why="Industry is the single most reliable predictor of contamination type. Mining introduces crystalline silica from blasting and haul roads. Marine operations expose fuel systems to catalytic fines from bunker fuel. Food and beverage operations require compressed air free of moisture and particulates. Each industry creates a distinct contamination signature — knowing it eliminates an entire class of irrelevant recommendations."
        established={state.assetDescription
          ? `Asset identified: ${state.assetDescription}. This establishes the physical systems under consultation.`
          : undefined}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '0.6rem' }}>
          {INDUSTRIES.map((ind, i) => (
            <motion.button
              key={ind.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              whileHover={{ borderColor: 'rgba(125,211,252,0.32)', background: 'rgba(125,211,252,0.04)' }}
              onClick={() => {
                setJourneySelection('industryId', ind.id);
                setJourneySelection('assetType', ind.assetType);
                dispatchTrustSignal('T-2');
                advance(3, { industryId: ind.id });
              }}
              style={{
                padding: '0.85rem 0.9rem', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
              }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{ind.icon}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                {ind.label}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(253,186,116,0.62)', fontFamily: 'JetBrains Mono, monospace' }}>
                ⚠ {ind.risk}
              </div>
            </motion.button>
          ))}
        </div>
      </Question>
    );
  }

  function renderStep3() {
    const ind = selectedIndustry;
    return (
      <Question
        label="STAGE 1 · UNDERSTAND THE ASSET"
        title="What operating conditions does this asset face?"
        why="Conditions determine contamination load intensity, not just contamination type. The same asset operated in a dusty open-cut mine and a climate-controlled workshop faces completely different particle ingestion rates and filter service life. Each condition selected here adjusts the failure mode probability weighting — conditions with no confirmed impact will not drive recommendations."
        established={ind
          ? `${ind.label} confirmed as operating industry. This narrows contamination risk to: ${ind.risk}. Typical asset class: ${ind.assetType}.`
          : undefined}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: '0.55rem' }}>
          {OPERATING_CONDITIONS.map((cond) => (
            <SelectBtn
              key={cond.id}
              selected={state.selectedConditions.includes(cond.id)}
              onClick={() => toggle('selectedConditions', cond.id)}
            >
              <span style={{ marginRight: '0.5rem' }}>{cond.icon}</span>
              {cond.label}
            </SelectBtn>
          ))}
        </div>
        <NextBtn
          onClick={() => {
            dispatchTrustSignal('T-3');
            advance(3.5 as never);
          }}
          label="Diagnose the risk"
        />
      </Question>
    );
  }

  function renderStage2Transition() {
    const ind = selectedIndustry;
    const condLabels = state.selectedConditions
      .map((c) => OPERATING_CONDITIONS.find((o) => o.id === c)?.label)
      .filter(Boolean).join('; ');
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <StageTransition
          stageId={2}
          title="Diagnose the Risk"
          whatWeKnow={[
            ind ? `Asset operating in ${ind.label}.` : null,
            condLabels ? `Conditions confirmed: ${condLabels}.` : null,
            `These inputs have narrowed the contamination scope from all possible sources to the subset probable for this operating profile.`,
          ].filter(Boolean).join(' ')}
          whatComesNext="We will now identify which contamination sources are active, trace them to the failure modes they create, and establish the engineering principles that govern the protection strategy. Each step eliminates an additional category of uncertainty from the recommendation."
          onClick={() => advance(4)}
        />
      </motion.div>
    );
  }

  // ─── Stage 2: Diagnose the Risk ─────────────────────────────────────────────

  function renderStep4() {
    const condLabels = state.selectedConditions
      .map((c) => OPERATING_CONDITIONS.find((o) => o.id === c)?.label)
      .filter(Boolean).join(', ');
    return (
      <Question
        label="STAGE 2 · DIAGNOSE THE RISK"
        title="Have you observed any of these operational symptoms?"
        why="Symptoms are evidence that contamination is already active. Premature wear confirms particle contamination is transiting bearing or ring clearances. Hydraulic drift indicates particle damage to proportional valves or spool bores. Shortened filter intervals reveal contamination loads exceeding baseline design assumptions. Symptoms do not change the contamination source — they confirm which mechanisms are already producing measurable consequences."
        established={condLabels
          ? `Operating conditions established: ${condLabels}. This confirms the environmental load severity.`
          : undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {SYMPTOMS.map((sym) => (
            <SelectBtn
              key={sym.id}
              selected={state.selectedSymptoms.includes(sym.id)}
              onClick={() => toggle('selectedSymptoms', sym.id)}
            >
              {sym.label}
            </SelectBtn>
          ))}
        </div>
        <NextBtn onClick={() => advance(5)} label="Assess contamination sources" />
      </Question>
    );
  }

  function renderStep5() {
    const candidateIds = state.industryId ? INDUSTRY_CONTAMINATION_MAP[state.industryId] : [];
    const candidates = contaminationNodes.filter((n) => candidateIds.includes(n.entityId));
    const symptomLabels = state.selectedSymptoms
      .map((s) => SYMPTOMS.find((x) => x.id === s)?.label)
      .filter(Boolean).join('; ');
    return (
      <Question
        label="STAGE 2 · DIAGNOSE THE RISK"
        title="Which contamination sources are active in your environment?"
        why="The contamination source — not the product — is what damages equipment. Recommending a technology without first identifying the contamination source produces a solution that may address the wrong failure mechanism. This step ensures every technology recommendation that follows is justified by a specific, confirmed contamination input."
        established={symptomLabels
          ? `Observed symptoms: ${symptomLabels}. These confirm that contamination mechanisms are already producing measurable operational consequences.`
          : undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {candidates.map((node) => {
            const p = node.properties as Record<string, unknown>;
            const selected = state.selectedContaminationIds.includes(node.entityId);
            return (
              <motion.div
                key={node.entityId}
                whileHover={{ borderColor: selected ? 'rgba(253,186,116,0.5)' : 'rgba(255,255,255,0.14)' }}
                onClick={() => toggle('selectedContaminationIds', node.entityId)}
                style={{
                  padding: '0.85rem 1rem', cursor: 'pointer',
                  background: selected ? 'rgba(253,186,116,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selected ? 'rgba(253,186,116,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '7px', transition: 'all 0.12s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: '17px', height: '17px', borderRadius: '4px', flexShrink: 0, marginTop: '2px',
                    background: selected ? '#fdba74' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${selected ? '#fdba74' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.58rem', color: '#000', transition: 'all 0.12s',
                  }}>
                    {selected && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      {node.label}
                    </div>
                    <div style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.22)', marginBottom: !!p['phaseState'] ? '0.2rem' : 0 }}>
                      {node.entityId}
                    </div>
                    {!!p['phaseState'] && (
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)' }}>
                        {String(p['phaseState'])}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {candidates.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.82rem' }}>
              Return to step 2 and select your industry to surface contamination sources.
            </p>
          )}
        </div>
        <NextBtn
          onClick={() => {
            dispatchTrustSignal('T-4');
            const fmIds = new Set<string>();
            state.selectedContaminationIds.forEach((cId) => {
              recommendFromContamination(cId)
                .filter((r) => r.targetEntityType === 'FAILURE_MODE')
                .forEach((r) => { fmIds.add(r.targetEntityId); receiveRecommendation(r); });
            });
            advance(6, { selectedFailureModeIds: Array.from(fmIds) });
          }}
          label="Map failure modes"
        />
      </Question>
    );
  }

  function renderStep6() {
    const contLabels = state.selectedContaminationIds
      .map((id) => contaminationNodes.find((n) => n.entityId === id)?.label).filter(Boolean).join(', ');
    const fmCandidates = failureModeNodes.filter((n) => state.selectedFailureModeIds.includes(n.entityId));
    return (
      <Question
        label="STAGE 2 · DIAGNOSE THE RISK"
        title="Failure modes produced by your contamination profile"
        why="Failure modes translate contamination into engineering consequences — bearing lifespan reduction, overhaul cost, unplanned downtime. Knowing the failure modes converts a contamination observation into a quantified operational risk. This is the evidence base that justifies the investment in the protection strategy that follows."
        established={contLabels
          ? `Contamination sources confirmed: ${contLabels}. The failure modes below are the engineering consequences of these contamination inputs in your operating environment.`
          : undefined}
      >
        {fmCandidates.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            Select contamination sources in the previous step to derive failure modes.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
            {fmCandidates.map((node) => {
              const p = node.properties as Record<string, unknown>;
              return (
                <div
                  key={node.entityId}
                  style={{
                    padding: '0.9rem 1rem',
                    background: 'rgba(252,165,165,0.04)',
                    border: '1px solid rgba(252,165,165,0.12)',
                    borderRadius: '7px',
                  }}
                >
                  <div style={{ fontSize: '0.57rem', fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                    {node.entityId}
                  </div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.86rem', marginBottom: '0.45rem' }}>
                    {node.label}
                  </div>
                  {!!p['measurableConsequence'] && (
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.48)', margin: '0 0 0.4rem', lineHeight: 1.6 }}>
                      {String(p['measurableConsequence'])}
                    </p>
                  )}
                  {!!p['industrialImpact'] && (
                    <p style={{ fontSize: '0.71rem', color: 'rgba(253,186,116,0.58)', margin: 0, lineHeight: 1.5 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.54rem', marginRight: '0.4rem', opacity: 0.65 }}>COST IMPACT</span>
                      {String(p['industrialImpact'])}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <NextBtn
          onClick={() => {
            const principleIds = new Set<string>();
            state.selectedFailureModeIds.forEach((fmId) => {
              recommendFromFailureMode(fmId)
                .filter((r) => r.targetEntityType === 'ENGINEERING_PRINCIPLE')
                .forEach((r) => { principleIds.add(r.targetEntityId); receiveRecommendation(r); });
            });
            advance(7, { selectedPrincipleIds: Array.from(principleIds) });
          }}
          label="Identify engineering principles"
        />
      </Question>
    );
  }

  function renderStep7() {
    const fmLabels = state.selectedFailureModeIds
      .map((id) => failureModeNodes.find((n) => n.entityId === id)?.label).filter(Boolean).join(', ');
    const principleRecs = state.selectedFailureModeIds.flatMap((fmId) =>
      recommendFromFailureMode(fmId).filter((r) => r.targetEntityType === 'ENGINEERING_PRINCIPLE'),
    );
    const uniqueIds = Array.from(new Set(principleRecs.map((r) => r.targetEntityId)));
    const shown = uniqueIds.length > 0
      ? principleNodes.filter((n) => uniqueIds.includes(n.entityId))
      : principleNodes.slice(0, 4);

    return (
      <Question
        label="STAGE 2 · DIAGNOSE THE RISK"
        title="Engineering principles that govern this protection strategy"
        why="Engineering principles are the physical laws that determine whether a technology can actually prevent the identified failure modes. A technology recommendation without a matching engineering principle is an opinion. A recommendation grounded in a verified engineering principle is a defensible engineering decision — one a reliability engineer, purchasing manager, or operations director can justify internally."
        established={fmLabels
          ? `${state.selectedFailureModeIds.length} failure mode${state.selectedFailureModeIds.length > 1 ? 's' : ''} mapped from confirmed contamination sources: ${fmLabels}.`
          : undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {shown.map((node) => {
            const p = node.properties as Record<string, unknown>;
            return (
              <div
                key={node.entityId}
                style={{
                  padding: '0.9rem 1rem',
                  background: 'rgba(125,211,252,0.04)',
                  border: '1px solid rgba(125,211,252,0.1)',
                  borderRadius: '7px',
                }}
              >
                <div style={{ fontSize: '0.57rem', fontFamily: 'JetBrains Mono, monospace', color: '#7dd3fc', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                  {node.entityId}
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                  {node.label}
                </div>
                {!!p['definition'] && (
                  <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.43)', margin: 0, lineHeight: 1.6 }}>
                    {String(p['definition'])}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <NextBtn
          onClick={() => {
            dispatchTrustSignal('T-5');
            const techIds = new Set<string>();
            state.selectedFailureModeIds.forEach((fmId) => {
              recommendFromFailureMode(fmId)
                .filter((r) => r.targetEntityType === 'TECHNOLOGY_ARCHITECTURE')
                .forEach((r) => { techIds.add(r.targetEntityId); receiveRecommendation(r); });
            });
            state.selectedContaminationIds.forEach((cId) => {
              recommendFromContamination(cId)
                .filter((r) => r.targetEntityType === 'TECHNOLOGY_ARCHITECTURE')
                .forEach((r) => { techIds.add(r.targetEntityId); receiveRecommendation(r); });
            });
            advance(7.5 as never, {
              selectedTechIds: Array.from(techIds),
              selectedPrincipleIds: shown.map((n) => n.entityId),
            });
          }}
          label="Build protection strategy"
        />
      </Question>
    );
  }

  function renderStage3Transition() {
    const contCount  = state.selectedContaminationIds.length;
    const fmCount    = state.selectedFailureModeIds.length;
    const prinCount  = state.selectedPrincipleIds.length;
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Evidence summary chips */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[
            { label: 'Contamination sources', value: contCount, color: '#fdba74' },
            { label: 'Failure modes',          value: fmCount,  color: '#fca5a5' },
            { label: 'Engineering principles', value: prinCount, color: '#7dd3fc' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: '0.6rem 0.9rem', flex: '1 1 130px',
              background: `${color}06`, border: `1px solid ${color}16`,
              borderRadius: '6px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.32)', fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>
            </div>
          ))}
        </div>
        <StageTransition
          stageId={3}
          title="Build the Protection Strategy"
          whatWeKnow={`Risk diagnosis is complete. ${contCount} contamination source${contCount !== 1 ? 's' : ''} confirmed, ${fmCount} failure mode${fmCount !== 1 ? 's' : ''} mapped, and the engineering principles that govern the required protection have been identified.`}
          whatComesNext="The final stage maps these findings to the technology architectures that control them, validates the recommendation against published standards, and produces an Engineering Assessment Summary — a defensible, explainable justification for the protection strategy."
          onClick={() => advance(8)}
        />
      </motion.div>
    );
  }

  // ─── Stage 3: Build the Protection Strategy ─────────────────────────────────

  function renderStep8() {
    const shown = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));
    const fallback = shown.length === 0 ? techNodes.slice(0, 3) : shown;
    return (
      <Question
        label="STAGE 3 · PROTECTION STRATEGY"
        title="Technology architectures that control your confirmed risks"
        why="Each technology architecture controls contamination through a specific engineering mechanism — depth filtration, water coalescing, adsorption, surface interception. A technology is included here only because it directly addresses a failure mode identified in Stage 2. Understanding the control mechanism is what makes this a recommendation you can defend, not just a product you were sold."
        established="Engineering principles identified. The technologies below are selected because they implement those principles against the confirmed contamination sources."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {fallback.map((node) => {
            const p = node.properties as Record<string, unknown>;
            return (
              <div
                key={node.entityId}
                style={{
                  padding: '0.9rem 1rem',
                  background: 'rgba(255,241,45,0.04)',
                  border: '1px solid rgba(255,241,45,0.1)',
                  borderRadius: '7px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.57rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,241,45,0.38)', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                      {node.entityId}
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#FFF12D', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                      {node.label}
                    </div>
                    {!!p['engineeringDescription'] && (
                      <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.48)', margin: 0, lineHeight: 1.6 }}>
                        {String(p['engineeringDescription'])}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/engineering/technologies/${node.entityId}`}
                    style={{
                      fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
                      color: 'rgba(255,241,45,0.45)', textDecoration: 'none',
                      border: '1px solid rgba(255,241,45,0.13)', padding: '0.25rem 0.5rem',
                      borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    SPEC →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <NextBtn
          onClick={() => { dispatchTrustSignal('T-6'); advance(9); }}
          label="Review supporting standards"
        />
      </Question>
    );
  }

  function renderStep9() {
    const seenStds = new Set<string>();
    state.selectedTechIds.forEach((techId) => {
      recommendFromTechnology(techId)
        .filter((r) => r.targetEntityType === 'STANDARD')
        .forEach((r) => seenStds.add(r.targetEntityId));
    });
    const stdNodes = listEntitiesWithProvenance('STANDARD')
      .map(({ node }) => node)
      .filter((n) => seenStds.has(n.entityId));
    const techLabels = state.selectedTechIds
      .map((id) => techNodes.find((n) => n.entityId === id)?.label).filter(Boolean).join(', ');

    return (
      <Question
        label="STAGE 3 · PROTECTION STRATEGY"
        title="Standards that validate this recommendation"
        why="Standards are the independent evidence base that separates engineering decisions from commercial claims. The standards listed below define the test methods and performance thresholds against which these technology architectures have been verified. If a purchasing manager or auditor asks why this system was specified, the answer is not 'the supplier recommended it' — it is 'it was selected because it meets the requirements defined in ISO XXXX for this contamination target.'"
        established={techLabels
          ? `Technologies identified: ${techLabels}. The standards below are the test frameworks that validate their performance against your contamination targets.`
          : undefined}
      >
        {stdNodes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(228px, 1fr))', gap: '0.55rem', marginBottom: '1.5rem' }}>
            {stdNodes.map((node) => {
              const p = node.properties as Record<string, unknown>;
              return (
                <div
                  key={node.entityId}
                  style={{
                    padding: '0.8rem 0.9rem',
                    background: 'rgba(196,181,253,0.04)',
                    border: '1px solid rgba(196,181,253,0.09)',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#c4b5fd', marginBottom: '0.3rem' }}>
                    {node.label}
                  </div>
                  {!!p['scope'] && (
                    <p style={{ fontSize: '0.69rem', color: 'rgba(255,255,255,0.38)', margin: '0 0 0.4rem', lineHeight: 1.5 }}>
                      {String(p['scope']).slice(0, 110)}…
                    </p>
                  )}
                  <Link href={`/engineering/standards/${node.entityId}`} style={{ fontSize: '0.57rem', color: 'rgba(196,181,253,0.42)', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}>
                    VIEW STANDARD →
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            Standards are referenced within each technology specification page.
          </p>
        )}
        <NextBtn onClick={() => advance(10)} label="View engineering assessment" />
      </Question>
    );
  }

  function renderStep10() {
    const techShown  = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));
    const contShown  = contaminationNodes.filter((n) => state.selectedContaminationIds.includes(n.entityId));
    const fmShown    = failureModeNodes.filter((n) => state.selectedFailureModeIds.includes(n.entityId));
    const indLabel   = selectedIndustry?.label ?? 'your industry';
    const assetLabel = state.assetDescription || selectedIndustry?.assetType || 'your asset';
    const condLabels = state.selectedConditions
      .map((c) => OPERATING_CONDITIONS.find((o) => o.id === c)?.label).filter(Boolean).join(', ');

    const filledFields = [
      state.assetDescription, state.industryId,
      state.selectedConditions.length,
      state.selectedContaminationIds.length,
      state.selectedFailureModeIds.length,
      state.selectedTechIds.length,
    ].filter(Boolean).length;
    const confidence = filledFields >= 5 ? 'HIGH' : filledFields >= 3 ? 'MEDIUM' : 'LOW';
    const confColor  = confidence === 'HIGH' ? '#86efac' : confidence === 'MEDIUM' ? '#fdba74' : '#fca5a5';

    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
          STAGE 3 · ENGINEERING ASSESSMENT
        </p>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.45rem)', color: '#fff', margin: '0 0 0.5rem' }}>
          Engineering Assessment Summary
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', margin: '0 0 1.5rem', lineHeight: 1.65 }}>
          Based on the operating conditions described, the protection system below provides the best engineering fit for reducing the identified operational risks in {indLabel} applications.
        </p>

        {/* Assessment card */}
        <div style={{
          padding: '1.4rem', marginBottom: '1.5rem',
          background: 'rgba(255,241,45,0.03)',
          border: '2px solid rgba(255,241,45,0.15)',
          borderRadius: '10px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '1rem', marginBottom: '1.1rem' }}>
            <SummaryField label="ASSET" value={assetLabel} />
            <SummaryField label="INDUSTRY" value={indLabel} />
            <SummaryField label="CONTAMINATION RISKS" value={`${contShown.length} confirmed`} valueColor="#fdba74" />
            <SummaryField label="FAILURE MODES MAPPED" value={`${fmShown.length} failure modes`} valueColor="#fca5a5" />
            <SummaryField label="TECHNOLOGIES SELECTED" value={`${techShown.length} architectures`} valueColor="#FFF12D" />
            <div>
              <p style={{ fontSize: '0.57rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', marginBottom: '0.28rem', letterSpacing: '0.07em' }}>ENGINEERING CONFIDENCE</p>
              <span style={{
                fontSize: '0.73rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                color: confColor, padding: '0.2rem 0.5rem',
                background: `${confColor}10`, border: `1px solid ${confColor}28`, borderRadius: '4px',
              }}>
                {confidence}
              </span>
            </div>
          </div>
          {condLabels && (
            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <SummaryField label="OPERATING CONDITIONS" value={condLabels} />
            </div>
          )}
        </div>

        {/* Why this protection strategy is recommended */}
        <p style={{
          fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', marginBottom: '0.75rem',
        }}>
          WHY THIS PROTECTION STRATEGY IS RECOMMENDED
        </p>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 1rem', textAlign: 'justify' }}>
          The following decision path traces every step from the confirmed contamination sources in your environment through to the recommended protection technologies. Each link in this chain eliminates a specific category of engineering uncertainty. The final recommendation is the logical conclusion of the evidence gathered — not a default selection.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1.5rem' }}>
          {contShown.map((node) => (
            <div key={node.entityId} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ width: '13px', height: '13px', borderRadius: '50%', background: 'rgba(253,186,116,0.12)', border: '1px solid rgba(253,186,116,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.42rem', color: '#fdba74' }}>●</span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.62)' }}>{node.label}</span>
              <span style={{ fontSize: '0.57rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(253,186,116,0.42)' }}>contamination source</span>
            </div>
          ))}
          {contShown.length > 0 && (
            <div style={{ marginLeft: '6px', paddingLeft: '0.85rem', borderLeft: '1px dashed rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)', fontFamily: 'JetBrains Mono, monospace' }}>activates</span>
            </div>
          )}
          {fmShown.map((node) => (
            <div key={node.entityId} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ width: '13px', height: '13px', borderRadius: '50%', background: 'rgba(252,165,165,0.1)', border: '1px solid rgba(252,165,165,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.42rem', color: '#fca5a5' }}>●</span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.58)' }}>{node.label}</span>
              <span style={{ fontSize: '0.57rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(252,165,165,0.38)' }}>failure mode</span>
            </div>
          ))}
          {fmShown.length > 0 && (
            <div style={{ marginLeft: '6px', paddingLeft: '0.85rem', borderLeft: '1px dashed rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)', fontFamily: 'JetBrains Mono, monospace' }}>controlled by</span>
            </div>
          )}
          {techShown.map((node) => (
            <div key={node.entityId} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ width: '13px', height: '13px', borderRadius: '50%', background: 'rgba(255,241,45,0.1)', border: '1px solid rgba(255,241,45,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.42rem', color: '#FFF12D' }}>●</span>
              <span style={{ fontSize: '0.78rem', color: '#FFF12D', fontWeight: 600 }}>{node.label}</span>
              <span style={{ fontSize: '0.57rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,241,45,0.38)' }}>protection technology</span>
            </div>
          ))}
        </div>

        <NextBtn
          onClick={() => { dispatchTrustSignal('T-7'); advance(11); }}
          label="View implementation options"
        />
      </motion.div>
    );
  }

  function renderStep11() {
    const techShown = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));
    const indLabel  = selectedIndustry?.label ?? 'your industry';

    const seenMedia = new Set<string>();
    state.selectedTechIds.forEach((techId) => {
      recommendFromTechnology(techId)
        .filter((r) => r.targetEntityType === 'PROTECTION_MEDIA')
        .forEach((r) => seenMedia.add(r.targetEntityId));
    });
    const mediaNodes = listEntitiesWithProvenance('PROTECTION_MEDIA')
      .map(({ node }) => node)
      .filter((n) => seenMedia.has(n.entityId));

    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
          STAGE 3 · IMPLEMENTATION
        </p>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.45rem)', color: '#fff', margin: '0 0 0.5rem' }}>
          Product Implementation
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', margin: '0 0 1.5rem', lineHeight: 1.65 }}>
          The protection technologies recommended in the Engineering Assessment are implemented through the following filtration media and product configurations. These are the physical elements that deploy the contamination control strategy designed for your {indLabel} operation.
        </p>

        {mediaNodes.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', marginBottom: '0.65rem' }}>
              PROTECTION MEDIA
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.5rem' }}>
              {mediaNodes.map((node) => {
                const p = node.properties as Record<string, unknown>;
                return (
                  <Link
                    key={node.entityId}
                    href={`/engineering/media/${node.entityId}`}
                    style={{
                      display: 'block', padding: '0.75rem 0.9rem',
                      background: 'rgba(134,239,172,0.04)', border: '1px solid rgba(134,239,172,0.09)',
                      borderRadius: '6px', textDecoration: 'none',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#86efac', marginBottom: '0.2rem' }}>
                      {node.label}
                    </div>
                    {!!p['baseConstruction'] && (
                      <div style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.33)' }}>
                        {String(p['baseConstruction'])}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {techShown.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', marginBottom: '0.65rem' }}>
              TECHNOLOGY SPECIFICATIONS
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {techShown.map((node) => (
                <Link
                  key={node.entityId}
                  href={`/engineering/technologies/${node.entityId}`}
                  style={{
                    padding: '0.38rem 0.85rem', fontSize: '0.74rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'rgba(255,241,45,0.05)', border: '1px solid rgba(255,241,45,0.16)',
                    borderRadius: '4px', color: '#FFF12D', textDecoration: 'none',
                  }}
                >
                  {node.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{
          padding: '1.25rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            NEXT RECOMMENDED ACTION
          </p>
          <CTACard onLeadCapture={() => {}} />
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
          <button
            onClick={() => setState(INITIAL_STATE)}
            style={{
              fontSize: '0.73rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.26)', background: 'none',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '0.38rem 0.85rem', borderRadius: '4px', cursor: 'pointer',
            }}
          >
            ↺ Start new consultation
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '860px', margin: '0 auto' }}>
        <Link href="/search" style={{
          fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.28)', textDecoration: 'none', letterSpacing: '0.08em',
        }}>
          ← ENGINEERING INTELLIGENCE
        </Link>
      </div>

      <section style={{
        padding: 'clamp(2rem, 5vw, 3.5rem) 2rem 2rem',
        borderBottom: '1px solid rgba(255,241,45,0.06)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,241,45,0.48)', letterSpacing: '0.12em', marginBottom: '0.6rem',
            }}>
              ENGINEERING CONSULTATION · ASSET PROTECTION
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              fontSize: 'clamp(1.4rem, 3vw, 2.1rem)',
              color: '#fff', margin: '0 0 0.6rem',
            }}>
              Asset Protection Engineering Consultation
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0, maxWidth: '580px' }}>
              A structured consultation that maps your operating conditions to contamination risks, failure modes, and the protection system engineered to reduce those risks.
            </p>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 2rem 4rem' }}>
        <StageHeader currentStep={Math.floor(state.step)} />

        {/* Persistent live assessment — always reflects current state */}
        <LiveAssessmentPanel
          state={state}
          contaminationNodes={contaminationNodes}
          failureModeNodes={failureModeNodes}
          techNodes={techNodes}
        />

        <AnimatePresence mode="wait">
          {state.step === 1             && renderStep1()}
          {state.step === 2             && renderStep2()}
          {state.step === 3             && renderStep3()}
          {state.step === (3.5 as never) && renderStage2Transition()}
          {state.step === 4             && renderStep4()}
          {state.step === 5             && renderStep5()}
          {state.step === 6             && renderStep6()}
          {state.step === 7             && renderStep7()}
          {state.step === (7.5 as never) && renderStage3Transition()}
          {state.step === 8             && renderStep8()}
          {state.step === 9             && renderStep9()}
          {state.step === 10            && renderStep10()}
          {state.step === 11            && renderStep11()}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Summary field ─────────────────────────────────────────────────────────────

function SummaryField({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <p style={{ fontSize: '0.57rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.22)', marginBottom: '0.25rem', letterSpacing: '0.07em' }}>
        {label}
      </p>
      <p style={{ fontSize: '0.82rem', color: valueColor ?? '#fff', margin: 0 }}>{value}</p>
    </div>
  );
}
