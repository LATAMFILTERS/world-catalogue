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
import type { Recommendation } from '@/lib/services';

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
  { id: 'agriculture',    label: 'Agriculture',          icon: '🌾', assetType: 'Tractors & Harvesters',      risk: 'Mineral dust ingestion' },
  { id: 'mining',         label: 'Mining',               icon: '⛏', assetType: 'Excavators & Haul Trucks',    risk: 'Silica & coal dust' },
  { id: 'marine',         label: 'Marine',               icon: '⚓', assetType: 'Vessels & Generators',        risk: 'Catalytic fines & water' },
  { id: 'construction',   label: 'Construction',         icon: '🏗', assetType: 'Cranes & Loaders',            risk: 'Particle wear & water' },
  { id: 'oil-gas',        label: 'Oil & Gas',            icon: '🛢', assetType: 'Pumps & Compressors',         risk: 'Contamination & corrosion' },
  { id: 'power',          label: 'Power Generation',     icon: '⚡', assetType: 'Turbines & Generators',       risk: 'Air & lube contamination' },
  { id: 'transport',      label: 'Transport & Logistics',icon: '🚛', assetType: 'Fleet Trucks',                risk: 'Air intake & fuel quality' },
  { id: 'manufacturing',  label: 'Manufacturing',        icon: '🏭', assetType: 'CNC & Hydraulic Presses',    risk: 'Hydraulic particle wear' },
  { id: 'forestry',       label: 'Forestry',             icon: '🌲', assetType: 'Harvesters & Forwarders',    risk: 'Extreme dust & debris' },
  { id: 'food',           label: 'Food & Beverage',      icon: '🥫', assetType: 'Processing Equipment',       risk: 'Compressed air purity' },
  { id: 'military',       label: 'Defence',              icon: '🎖', assetType: 'Tactical Vehicles',           risk: 'Extreme dust & reliability' },
  { id: 'rail',           label: 'Rail',                 icon: '🚂', assetType: 'Locomotives',                 risk: 'Diesel & lube contamination' },
] as const;

type IndustryId = typeof INDUSTRIES[number]['id'];

const OPERATING_CONDITIONS = [
  { id: 'dusty',       label: 'High dust / airborne particles',    icon: '🌪' },
  { id: 'wet',         label: 'Water / moisture exposure',          icon: '💧' },
  { id: 'extreme-temp',label: 'Extreme temperature ranges',         icon: '🌡' },
  { id: 'heavy-load',  label: 'Continuous heavy load cycles',       icon: '⚙️' },
  { id: 'vibration',   label: 'High vibration environment',         icon: '📳' },
  { id: 'intermittent',label: 'Intermittent / seasonal operation',  icon: '🔄' },
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

// ─── Stage Progress Header ─────────────────────────────────────────────────────

function StageHeader({ currentStep }: { currentStep: number }) {
  const currentStage = getStage(currentStep);

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Three stage pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STAGES.map((stage) => {
          const isActive = stage.id === currentStage.id;
          const isDone = stage.id < currentStage.id;
          return (
            <div
              key={stage.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.45rem 0.85rem',
                background: isActive
                  ? `${stage.color}12`
                  : isDone ? 'rgba(134,239,172,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? stage.color + '35' : isDone ? 'rgba(134,239,172,0.2)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '20px',
                transition: 'all 0.3s',
              }}
            >
              <span style={{
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace',
                background: isActive ? stage.color : isDone ? '#86efac' : 'rgba(255,255,255,0.08)',
                color: isActive || isDone ? '#000' : 'rgba(255,255,255,0.3)',
                fontWeight: 700, flexShrink: 0,
              }}>
                {isDone ? '✓' : stage.id}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? stage.color : isDone ? 'rgba(134,239,172,0.7)' : 'rgba(255,255,255,0.28)',
                whiteSpace: 'nowrap',
              }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Active stage bar */}
      <div style={{
        padding: '0.85rem 1.1rem',
        background: `${currentStage.color}08`,
        border: `1px solid ${currentStage.color}20`,
        borderLeft: `3px solid ${currentStage.color}`,
        borderRadius: '0 6px 6px 0',
      }}>
        <p style={{
          margin: 0, fontSize: '0.72rem',
          fontFamily: 'Outfit, sans-serif', fontWeight: 600,
          color: currentStage.color, marginBottom: '0.2rem',
        }}>
          {currentStage.label}
        </p>
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
          {currentStage.description}
        </p>
      </div>
    </div>
  );
}

// ─── Step question block ───────────────────────────────────────────────────────

interface QuestionProps {
  label: string;
  title: string;
  rationale: string;
  learned?: string;
  children: React.ReactNode;
}

function Question({ label, title, rationale, learned, children }: QuestionProps) {
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
          color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', marginBottom: '0.4rem',
        }}>
          {label}
        </p>
        <h2 style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 700,
          fontSize: 'clamp(1.05rem, 2vw, 1.4rem)',
          color: '#fff', margin: '0 0 0.85rem',
        }}>
          {title}
        </h2>

        {/* Engineering rationale */}
        <div style={{
          display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
          padding: '0.7rem 0.9rem',
          background: 'rgba(255,241,45,0.03)',
          border: '1px solid rgba(255,241,45,0.08)',
          borderRadius: '6px',
          marginBottom: learned ? '0.6rem' : '1.5rem',
        }}>
          <span style={{
            fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.45)', letterSpacing: '0.08em',
            paddingTop: '1px', flexShrink: 0,
          }}>
            WHY
          </span>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.65 }}>
            {rationale}
          </p>
        </div>

        {/* What was learned */}
        {learned && (
          <div style={{
            display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
            padding: '0.6rem 0.9rem',
            background: 'rgba(134,239,172,0.03)',
            border: '1px solid rgba(134,239,172,0.1)',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}>
            <span style={{
              fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(134,239,172,0.4)', letterSpacing: '0.08em',
              paddingTop: '1px', flexShrink: 0,
            }}>
              ✓
            </span>
            <p style={{ fontSize: '0.76rem', color: 'rgba(134,239,172,0.65)', margin: 0, lineHeight: 1.6 }}>
              {learned}
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
      whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
      onClick={onClick}
      style={{
        padding: '0.7rem 1rem', textAlign: 'left', cursor: 'pointer',
        background: selected ? 'rgba(255,241,45,0.07)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${selected ? 'rgba(255,241,45,0.38)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '6px',
        color: selected ? '#FFF12D' : 'rgba(255,255,255,0.6)',
        fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', lineHeight: 1.4,
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
  stageId, title, description, onClick,
}: { stageId: number; title: string; description: string; onClick: () => void }) {
  const stage = STAGES.find((s) => s.id === stageId)!;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        padding: '2rem',
        background: `${stage.color}07`,
        border: `1px solid ${stage.color}25`,
        borderRadius: '10px',
        textAlign: 'center',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: `${stage.color}18`, border: `1px solid ${stage.color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem',
        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
        color: stage.color, fontWeight: 700,
      }}>
        {stageId}
      </div>
      <p style={{
        fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
        color: `${stage.color}80`, letterSpacing: '0.12em', marginBottom: '0.6rem',
      }}>
        MOVING TO STAGE {stageId}
      </p>
      <h3 style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 700,
        fontSize: '1.15rem', color: '#fff', margin: '0 0 0.5rem',
      }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
        {description}
      </p>
      <NextBtn onClick={onClick} label={`Begin ${title}`} />
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AssetProtectionConsultation() {
  const [state, setState] = useState<ConsultationState>(INITIAL_STATE);
  const { dispatchTrustSignal, setJourneySelection, receiveRecommendation, setIntent } = useConversion();

  const selectedIndustry = INDUSTRIES.find((i) => i.id === state.industryId) ?? null;

  // Nodes from services
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

  // Step 1 — Asset
  function renderStep1() {
    return (
      <Question
        label="STAGE 1 · UNDERSTAND THE ASSET"
        title="Which asset are you protecting?"
        rationale="Asset type determines which systems are at risk. A diesel excavator, a marine generator, and a hydraulic press face different contamination pathways. The more specifically you describe the asset, the more precisely the consultation can be tailored."
      >
        <textarea
          value={state.assetDescription}
          onChange={(e) => setState((s) => ({ ...s, assetDescription: e.target.value }))}
          placeholder="e.g. Caterpillar 390F excavator, MAN TGX 18.500 fleet truck, Grundfos centrifugal pump station, Cummins QSK60 generator set…"
          style={{
            width: '100%', minHeight: '90px', padding: '0.9rem 1rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
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

  // Step 2 — Industry
  function renderStep2() {
    const assetLabel = state.assetDescription;
    return (
      <Question
        label="STAGE 1 · UNDERSTAND THE ASSET"
        title="What industry does this asset operate in?"
        rationale="Industry defines the dominant contamination sources. Mining operations introduce crystalline silica from rock dust. Marine environments expose fuel systems to catalytic fines. Manufacturing hydraulics face fine metallic debris. The industry context determines which contamination risks are most probable."
        learned={assetLabel ? `Asset identified: ${assetLabel}.` : undefined}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '0.6rem' }}>
          {INDUSTRIES.map((ind, i) => (
            <motion.button
              key={ind.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              whileHover={{ borderColor: 'rgba(125,211,252,0.35)', background: 'rgba(125,211,252,0.04)' }}
              onClick={() => {
                setJourneySelection('industryId', ind.id);
                setJourneySelection('assetType', ind.assetType);
                dispatchTrustSignal('T-2');
                advance(3, { industryId: ind.id });
              }}
              style={{
                padding: '0.85rem 0.9rem', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.12s',
              }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{ind.icon}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                {ind.label}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(253,186,116,0.65)', fontFamily: 'JetBrains Mono, monospace' }}>
                ⚠ {ind.risk}
              </div>
            </motion.button>
          ))}
        </div>
      </Question>
    );
  }

  // Step 3 — Operating conditions
  function renderStep3() {
    const ind = selectedIndustry;
    return (
      <Question
        label="STAGE 1 · UNDERSTAND THE ASSET"
        title="What operating conditions does this asset face?"
        rationale="Conditions determine contamination load severity. High-dust environments accelerate air filter blinding and can introduce abrasive particles into lube systems. Wet conditions create water contamination risk in fuel and hydraulic circuits. Select all that apply — each condition adjusts the weighting of failure mode probability."
        learned={ind ? `${ind.label} confirmed. Primary risk profile: ${ind.risk}. Typical asset: ${ind.assetType}.` : undefined}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.55rem' }}>
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
            // Stage transition before entering stage 2
            advance(3.5 as never);
          }}
          label="Analyse the risk"
        />
      </Question>
    );
  }

  // Stage 2 transition card
  function renderStage2Transition() {
    const condLabels = state.selectedConditions
      .map((c) => OPERATING_CONDITIONS.find((o) => o.id === c)?.label)
      .filter(Boolean)
      .join(', ');
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {condLabels && (
          <div style={{
            padding: '0.6rem 0.9rem', marginBottom: '1.25rem',
            background: 'rgba(134,239,172,0.03)', border: '1px solid rgba(134,239,172,0.1)',
            borderRadius: '6px', fontSize: '0.76rem', color: 'rgba(134,239,172,0.65)',
            display: 'flex', gap: '0.6rem',
          }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(134,239,172,0.4)', paddingTop: '1px', flexShrink: 0 }}>✓</span>
            Operating conditions confirmed: {condLabels}.
          </div>
        )}
        <StageTransition
          stageId={2}
          title="Diagnose the Risk"
          description="We have mapped your asset and operational context. Now we identify the contamination sources most probable in your environment, trace them to specific failure modes, and establish the engineering principles that govern your protection strategy."
          onClick={() => advance(4)}
        />
      </motion.div>
    );
  }

  // ─── Stage 2: Diagnose the Risk ─────────────────────────────────────────────

  // Step 4 — Symptoms
  function renderStep4() {
    const condLabels = state.selectedConditions
      .map((c) => OPERATING_CONDITIONS.find((o) => o.id === c)?.label)
      .filter(Boolean).join(', ');
    return (
      <Question
        label="STAGE 2 · DIAGNOSE THE RISK"
        title="Have you observed any of these operational symptoms?"
        rationale="Symptoms are diagnostic signals. Premature wear suggests particle contamination in lube or hydraulic circuits. Hydraulic drift points to particle-damaged proportional valves. Shortened filter intervals indicate contamination loads that exceed standard service assumptions. Symptoms help confirm which contamination mechanisms are already active."
        learned={condLabels ? `Operating conditions established: ${condLabels}.` : undefined}
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

  // Step 5 — Contamination
  function renderStep5() {
    const candidateIds = state.industryId ? INDUSTRY_CONTAMINATION_MAP[state.industryId] : [];
    const candidates = contaminationNodes.filter((n) => candidateIds.includes(n.entityId));
    const symptomLabels = state.selectedSymptoms
      .map((s) => SYMPTOMS.find((x) => x.id === s)?.label)
      .filter(Boolean).join('; ');
    return (
      <Question
        label="STAGE 2 · DIAGNOSE THE RISK"
        title="Which contamination risks are active in your environment?"
        rationale="Every failure mode traces to a contamination source. Identifying the contamination at this stage ensures the technology recommendation targets the root cause, not just the symptom. Review the contamination types identified for your industry and confirm which are most relevant to your operation."
        learned={symptomLabels ? `Symptoms observed: ${symptomLabels}.` : undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {candidates.map((node) => {
            const p = node.properties as Record<string, unknown>;
            const selected = state.selectedContaminationIds.includes(node.entityId);
            return (
              <motion.div
                key={node.entityId}
                whileHover={{ borderColor: selected ? 'rgba(253,186,116,0.5)' : 'rgba(255,255,255,0.15)' }}
                onClick={() => toggle('selectedContaminationIds', node.entityId)}
                style={{
                  padding: '0.85rem 1rem', cursor: 'pointer',
                  background: selected ? 'rgba(253,186,116,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selected ? 'rgba(253,186,116,0.38)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '7px', transition: 'all 0.12s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, marginTop: '1px',
                    background: selected ? '#fdba74' : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${selected ? '#fdba74' : 'rgba(255,255,255,0.12)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', color: '#000', transition: 'all 0.12s',
                  }}>
                    {selected && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.86rem', marginBottom: '0.25rem' }}>
                      {node.label}
                    </div>
                    <div style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', marginBottom: !!p['phaseState'] ? '0.25rem' : 0 }}>
                      {node.entityId}
                    </div>
                    {!!p['phaseState'] && (
                      <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)' }}>
                        {String(p['phaseState'])}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {candidates.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem' }}>
              Return to step 2 and select your industry to surface contamination risks.
            </p>
          )}
        </div>
        <NextBtn
          onClick={() => {
            dispatchTrustSignal('T-4');
            const fmIds = new Set<string>();
            state.selectedContaminationIds.forEach((contId) => {
              recommendFromContamination(contId)
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

  // Step 6 — Failure modes
  function renderStep6() {
    const contLabels = state.selectedContaminationIds
      .map((id) => contaminationNodes.find((n) => n.entityId === id)?.label).filter(Boolean).join(', ');
    const fmCandidates = failureModeNodes.filter((n) => state.selectedFailureModeIds.includes(n.entityId));
    return (
      <Question
        label="STAGE 2 · DIAGNOSE THE RISK"
        title="Failure modes derived from your contamination profile"
        rationale="Each contamination source activates one or more failure modes. Understanding the failure modes translates contamination data into engineering consequences — bearing lifespan reduction, overhaul cost, and unplanned downtime. This is the evidence base for the protection strategy that follows."
        learned={contLabels ? `Contamination sources confirmed: ${contLabels}.` : undefined}
      >
        {fmCandidates.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem', marginBottom: '1.5rem' }}>
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
                    border: '1px solid rgba(252,165,165,0.13)',
                    borderRadius: '7px',
                  }}
                >
                  <div style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                    {node.entityId}
                  </div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.86rem', marginBottom: '0.45rem' }}>
                    {node.label}
                  </div>
                  {!!p['measurableConsequence'] && (
                    <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.4rem', lineHeight: 1.6 }}>
                      {String(p['measurableConsequence'])}
                    </p>
                  )}
                  {!!p['industrialImpact'] && (
                    <p style={{ fontSize: '0.72rem', color: 'rgba(253,186,116,0.6)', margin: 0, lineHeight: 1.5 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', marginRight: '0.4rem', opacity: 0.7 }}>COST IMPACT</span>
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

  // Step 7 — Engineering principles
  function renderStep7() {
    const fmLabels = state.selectedFailureModeIds
      .map((id) => failureModeNodes.find((n) => n.entityId === id)?.label).filter(Boolean).join(', ');
    const principleRecs = state.selectedFailureModeIds.flatMap((fmId) =>
      recommendFromFailureMode(fmId).filter((r) => r.targetEntityType === 'ENGINEERING_PRINCIPLE'),
    );
    const uniqueIds = Array.from(new Set(principleRecs.map((r) => r.targetEntityId)));
    const shown = (uniqueIds.length > 0
      ? principleNodes.filter((n) => uniqueIds.includes(n.entityId))
      : principleNodes.slice(0, 4)
    );
    return (
      <Question
        label="STAGE 2 · DIAGNOSE THE RISK"
        title="Engineering principles governing your protection strategy"
        rationale="Engineering principles are the physical laws and design rules that explain why a technology works — not just what it does. Understanding the principles builds justified confidence in the recommendation. If the principles hold for your operating conditions, the technology will perform as predicted."
        learned={fmLabels ? `Failure modes mapped: ${fmLabels}.` : undefined}
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
                <div style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: '#7dd3fc', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                  {node.entityId}
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                  {node.label}
                </div>
                {!!p['definition'] && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
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

  // Stage 3 transition card
  function renderStage3Transition() {
    const contCount = state.selectedContaminationIds.length;
    const fmCount = state.selectedFailureModeIds.length;
    const principleCount = state.selectedPrincipleIds.length;
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}>
          {[
            { label: 'Contamination risks', value: contCount, color: '#fdba74' },
            { label: 'Failure modes', value: fmCount, color: '#fca5a5' },
            { label: 'Engineering principles', value: principleCount, color: '#7dd3fc' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: '0.65rem 1rem', flex: '1 1 140px',
              background: `${color}07`, border: `1px solid ${color}18`,
              borderRadius: '6px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.3rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>
            </div>
          ))}
        </div>
        <StageTransition
          stageId={3}
          title="Build the Protection Strategy"
          description="The diagnostic phase is complete. We now map your contamination profile and engineering principles to the technology architectures that control them, validate against published standards, and produce your Engineering Assessment Summary."
          onClick={() => advance(8)}
        />
      </motion.div>
    );
  }

  // ─── Stage 3: Build the Protection Strategy ─────────────────────────────────

  // Step 8 — Technologies
  function renderStep8() {
    const techCandidates = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));
    const shown = techCandidates.length > 0 ? techCandidates : techNodes.slice(0, 3);
    return (
      <Question
        label="STAGE 3 · PROTECTION STRATEGY"
        title="Technology architectures that address your contamination profile"
        rationale="Each technology architecture controls contamination through a specific engineering mechanism — particle interception, water separation, coalescing, adsorption. The technologies shown are selected because they directly address the failure modes identified in Stage 2. Understanding the mechanism builds justified confidence that the recommendation will work."
        learned={`Engineering principles identified. Risk diagnosis complete.`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {shown.map((node) => {
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
                    <div style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,241,45,0.4)', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                      {node.entityId}
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#FFF12D', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                      {node.label}
                    </div>
                    {!!p['engineeringDescription'] && (
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
                        {String(p['engineeringDescription'])}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/engineering/technologies/${node.entityId}`}
                    style={{
                      fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace',
                      color: 'rgba(255,241,45,0.5)', textDecoration: 'none',
                      border: '1px solid rgba(255,241,45,0.15)', padding: '0.28rem 0.55rem',
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

  // Step 9 — Standards
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
        title="Standards validating this recommendation"
        rationale="Engineering recommendations must be traceable to published test standards. The standards below define the test methods and performance thresholds that confirm a technology achieves the required contamination control target. They are the independent evidence base for the recommendation."
        learned={techLabels ? `Technologies identified: ${techLabels}.` : undefined}
      >
        {stdNodes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.55rem', marginBottom: '1.5rem' }}>
            {stdNodes.map((node) => {
              const p = node.properties as Record<string, unknown>;
              return (
                <div
                  key={node.entityId}
                  style={{
                    padding: '0.8rem 0.9rem',
                    background: 'rgba(196,181,253,0.04)',
                    border: '1px solid rgba(196,181,253,0.1)',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#c4b5fd', marginBottom: '0.3rem' }}>
                    {node.label}
                  </div>
                  {!!p['scope'] && (
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.4rem', lineHeight: 1.5 }}>
                      {String(p['scope']).slice(0, 110)}…
                    </p>
                  )}
                  <Link href={`/engineering/standards/${node.entityId}`} style={{ fontSize: '0.58rem', color: 'rgba(196,181,253,0.45)', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}>
                    VIEW STANDARD →
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem', marginBottom: '1.5rem' }}>
            Standards are referenced within each technology specification.
          </p>
        )}
        <NextBtn onClick={() => advance(10)} label="View engineering assessment" />
      </Question>
    );
  }

  // Step 10 — Assessment summary
  function renderStep10() {
    const techShown  = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));
    const contShown  = contaminationNodes.filter((n) => state.selectedContaminationIds.includes(n.entityId));
    const fmShown    = failureModeNodes.filter((n) => state.selectedFailureModeIds.includes(n.entityId));
    const indLabel   = selectedIndustry?.label ?? 'your industry';
    const assetLabel = state.assetDescription || selectedIndustry?.assetType || 'your asset';
    const condLabels = state.selectedConditions
      .map((c) => OPERATING_CONDITIONS.find((o) => o.id === c)?.label).filter(Boolean).join(', ');

    // Confidence derived from how many steps produced data
    const filledSteps = [
      state.assetDescription,
      state.industryId,
      state.selectedConditions.length,
      state.selectedContaminationIds.length,
      state.selectedFailureModeIds.length,
      state.selectedTechIds.length,
    ].filter(Boolean).length;
    const confidence = filledSteps >= 5 ? 'HIGH' : filledSteps >= 3 ? 'MEDIUM' : 'LOW';
    const confColor  = confidence === 'HIGH' ? '#86efac' : confidence === 'MEDIUM' ? '#fdba74' : '#fca5a5';

    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Heading */}
        <p style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
          STAGE 3 · ENGINEERING ASSESSMENT
        </p>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', color: '#fff', margin: '0 0 0.5rem' }}>
          Engineering Assessment Summary
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1.5rem', lineHeight: 1.65 }}>
          Based on the operating conditions described, the following protection system provides the best engineering fit for reducing the identified operational risks in {indLabel} applications.
        </p>

        {/* Assessment card */}
        <div style={{
          padding: '1.5rem', marginBottom: '1.5rem',
          background: 'rgba(255,241,45,0.04)',
          border: '2px solid rgba(255,241,45,0.18)',
          borderRadius: '10px',
        }}>
          {/* Summary grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <SummaryField label="ASSET" value={assetLabel} />
            <SummaryField label="INDUSTRY" value={indLabel} />
            <SummaryField label="CONTAMINATION RISKS" value={`${contShown.length} identified`} valueColor="#fdba74" />
            <SummaryField label="FAILURE MODES MAPPED" value={`${fmShown.length} failure modes`} valueColor="#fca5a5" />
            <SummaryField label="TECHNOLOGIES" value={`${techShown.length} architectures`} valueColor="#FFF12D" />
            <div>
              <p style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.28)', marginBottom: '0.3rem', letterSpacing: '0.08em' }}>ENGINEERING CONFIDENCE</p>
              <span style={{
                fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                color: confColor, padding: '0.2rem 0.55rem',
                background: `${confColor}12`, border: `1px solid ${confColor}30`,
                borderRadius: '4px',
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

        {/* Reasoning chain */}
        <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          ENGINEERING REASONING
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1.5rem' }}>
          {contShown.map((node, i) => (
            <div key={node.entityId} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <div style={{ width: '1px', background: 'rgba(253,186,116,0.3)', alignSelf: 'stretch', marginTop: '4px', marginLeft: '7px', display: i === contShown.length - 1 ? 'none' : 'block' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(253,186,116,0.15)', border: '1px solid rgba(253,186,116,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.45rem', color: '#fdba74' }}>●</span>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>{node.label}</span>
                  <span style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(253,186,116,0.45)' }}>contamination source</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0px' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>↓ activates</span>
          </div>
          {fmShown.map((node) => (
            <div key={node.entityId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(252,165,165,0.1)', border: '1px solid rgba(252,165,165,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.45rem', color: '#fca5a5' }}>●</span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{node.label}</span>
              <span style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(252,165,165,0.4)' }}>failure mode</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>↓ controlled by</span>
          </div>
          {techShown.map((node) => (
            <div key={node.entityId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(255,241,45,0.1)', border: '1px solid rgba(255,241,45,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.45rem', color: '#FFF12D' }}>●</span>
              <span style={{ fontSize: '0.78rem', color: '#FFF12D', fontWeight: 600 }}>{node.label}</span>
              <span style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,241,45,0.4)' }}>protection technology</span>
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

  // Step 11 — Implementation
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
        <p style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
          STAGE 3 · IMPLEMENTATION
        </p>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', color: '#fff', margin: '0 0 0.5rem' }}>
          Product Implementation
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1.5rem', lineHeight: 1.65 }}>
          The protection technologies recommended for your {indLabel} operation are deployed through the following filtration media and product configurations.
        </p>

        {mediaNodes.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: '0.7rem' }}>
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
                      background: 'rgba(134,239,172,0.04)', border: '1px solid rgba(134,239,172,0.1)',
                      borderRadius: '6px', textDecoration: 'none',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#86efac', marginBottom: '0.2rem' }}>
                      {node.label}
                    </div>
                    {!!p['baseConstruction'] && (
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>
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
            <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: '0.7rem' }}>
              TECHNOLOGY SPECIFICATIONS
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {techShown.map((node) => (
                <Link
                  key={node.entityId}
                  href={`/engineering/technologies/${node.entityId}`}
                  style={{
                    padding: '0.38rem 0.85rem', fontSize: '0.75rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'rgba(255,241,45,0.05)', border: '1px solid rgba(255,241,45,0.18)',
                    borderRadius: '4px', color: '#FFF12D', textDecoration: 'none',
                  }}
                >
                  {node.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Next recommended action + CTA */}
        <div style={{
          padding: '1.25rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            NEXT RECOMMENDED ACTION
          </p>
          <CTACard onLeadCapture={() => {}} />
        </div>

        {/* Restart */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
          <button
            onClick={() => setState(INITIAL_STATE)}
            style={{
              fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.28)', background: 'none',
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
      {/* Back nav */}
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '860px', margin: '0 auto' }}>
        <Link href="/search" style={{
          fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.08em',
        }}>
          ← ENGINEERING INTELLIGENCE
        </Link>
      </div>

      {/* Hero */}
      <section style={{
        padding: 'clamp(2rem, 5vw, 3.5rem) 2rem 2rem',
        borderBottom: '1px solid rgba(255,241,45,0.07)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,241,45,0.5)', letterSpacing: '0.12em', marginBottom: '0.6rem',
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
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0, maxWidth: '580px' }}>
              A structured consultation that maps your operating conditions to contamination risks, failure modes, and the protection system that best fits your equipment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Consultation body */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 2rem 4rem' }}>
        <StageHeader currentStep={Math.floor(state.step)} />
        <AnimatePresence mode="wait">
          {state.step === 1    && renderStep1()}
          {state.step === 2    && renderStep2()}
          {state.step === 3    && renderStep3()}
          {state.step === (3.5 as never) && renderStage2Transition()}
          {state.step === 4    && renderStep4()}
          {state.step === 5    && renderStep5()}
          {state.step === 6    && renderStep6()}
          {state.step === 7    && renderStep7()}
          {state.step === (7.5 as never) && renderStage3Transition()}
          {state.step === 8    && renderStep8()}
          {state.step === 9    && renderStep9()}
          {state.step === 10   && renderStep10()}
          {state.step === 11   && renderStep11()}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Small helper ──────────────────────────────────────────────────────────────

function SummaryField({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <p style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', marginBottom: '0.25rem', letterSpacing: '0.08em' }}>
        {label}
      </p>
      <p style={{ fontSize: '0.83rem', color: valueColor ?? '#fff', margin: 0 }}>{value}</p>
    </div>
  );
}
