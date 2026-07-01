'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback } from 'react';
import {
  listEntitiesWithProvenance,
  recommendFromContamination,
  recommendFromFailureMode,
  recommendFromTechnology,
  findById,
} from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import { CTACard } from '@/components/conversion/CTACard';
import type { Recommendation } from '@/lib/services';

// ─── Static industry map (from AssetSelector) ─────────────────────────────────

const INDUSTRIES = [
  { id: 'agriculture', label: 'Agriculture', icon: '🌾', assetType: 'Tractors & Harvesters', risk: 'Mineral dust ingestion' },
  { id: 'mining', label: 'Mining', icon: '⛏', assetType: 'Excavators & Haul Trucks', risk: 'Silica & coal dust' },
  { id: 'marine', label: 'Marine', icon: '⚓', assetType: 'Vessels & Generators', risk: 'Catalytic fines & water' },
  { id: 'construction', label: 'Construction', icon: '🏗', assetType: 'Cranes & Loaders', risk: 'Particle wear & water' },
  { id: 'oil-gas', label: 'Oil & Gas', icon: '🛢', assetType: 'Pumps & Compressors', risk: 'Contamination & corrosion' },
  { id: 'power', label: 'Power Generation', icon: '⚡', assetType: 'Turbines & Generators', risk: 'Air & lube contamination' },
  { id: 'transport', label: 'Transport & Logistics', icon: '🚛', assetType: 'Fleet Trucks', risk: 'Air intake & fuel quality' },
  { id: 'manufacturing', label: 'Manufacturing', icon: '🏭', assetType: 'CNC & Hydraulic Presses', risk: 'Hydraulic particle wear' },
  { id: 'forestry', label: 'Forestry', icon: '🌲', assetType: 'Harvesters & Forwarders', risk: 'Extreme dust & debris' },
  { id: 'food', label: 'Food & Beverage', icon: '🥫', assetType: 'Processing Equipment', risk: 'Compressed air purity' },
  { id: 'military', label: 'Defence', icon: '🎖', assetType: 'Tactical Vehicles', risk: 'Extreme dust & reliability' },
  { id: 'rail', label: 'Rail', icon: '🚂', assetType: 'Locomotives', risk: 'Diesel & lube contamination' },
] as const;

type IndustryId = typeof INDUSTRIES[number]['id'];

// ─── Operating condition options ───────────────────────────────────────────────

const OPERATING_CONDITIONS = [
  { id: 'dusty', label: 'High dust / airborne particles', icon: '🌪' },
  { id: 'wet', label: 'Water / moisture exposure', icon: '💧' },
  { id: 'extreme-temp', label: 'Extreme temperature ranges', icon: '🌡' },
  { id: 'heavy-load', label: 'Continuous heavy load cycles', icon: '⚙️' },
  { id: 'vibration', label: 'High vibration environment', icon: '📳' },
  { id: 'intermittent', label: 'Intermittent / seasonal operation', icon: '🔄' },
] as const;

type ConditionId = typeof OPERATING_CONDITIONS[number]['id'];

// ─── Symptom options ───────────────────────────────────────────────────────────

const SYMPTOMS = [
  { id: 'premature-wear', label: 'Premature engine or component wear', category: 'WEAR' },
  { id: 'fuel-consumption', label: 'Increased fuel consumption', category: 'EFFICIENCY' },
  { id: 'hydraulic-drift', label: 'Hydraulic system slow response or drift', category: 'HYDRAULIC' },
  { id: 'filter-interval', label: 'Shortened filter service intervals', category: 'MAINTENANCE' },
  { id: 'overheating', label: 'Frequent overheating events', category: 'THERMAL' },
  { id: 'cabin-quality', label: 'Cabin air quality concerns', category: 'HEALTH' },
  { id: 'injector-issues', label: 'Injector or fuel system problems', category: 'FUEL' },
  { id: 'high-downtime', label: 'Unplanned maintenance downtime', category: 'RELIABILITY' },
] as const;

type SymptomId = typeof SYMPTOMS[number]['id'];

// ─── Industry → contamination ID mapping ──────────────────────────────────────

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

// ─── Consultation state ────────────────────────────────────────────────────────

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

// ─── Progress indicator ────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step - 1) / (total - 1)) * 100);
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '0.5rem',
      }}>
        <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
          STEP {step} OF {total}
        </span>
        <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,241,45,0.6)' }}>
          {pct}% COMPLETE
        </span>
      </div>
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', background: '#FFF12D', borderRadius: '2px' }}
        />
      </div>
    </div>
  );
}

// ─── Step wrapper with engineering context ─────────────────────────────────────

interface StepWrapperProps {
  number: string;
  title: string;
  rationale: string;
  learned?: string;
  children: React.ReactNode;
}

function StepWrapper({ number, title, rationale, learned, children }: StepWrapperProps) {
  return (
    <motion.div
      key={number}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
    >
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{
          fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,241,45,0.5)', letterSpacing: '0.12em', marginBottom: '0.5rem',
        }}>
          {number}
        </p>
        <h2 style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
          color: '#fff', margin: '0 0 0.75rem',
        }}>
          {title}
        </h2>
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(255,241,45,0.04)',
          border: '1px solid rgba(255,241,45,0.1)',
          borderRadius: '6px',
          marginBottom: learned ? '0.75rem' : '1.5rem',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.65 }}>
            <span style={{ color: 'rgba(255,241,45,0.7)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', marginRight: '0.5rem' }}>
              WHY THIS MATTERS
            </span>
            {rationale}
          </p>
        </div>
        {learned && (
          <div style={{
            padding: '0.6rem 1rem',
            background: 'rgba(134,239,172,0.04)',
            border: '1px solid rgba(134,239,172,0.1)',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}>
            <p style={{ fontSize: '0.78rem', color: 'rgba(134,239,172,0.75)', margin: 0, lineHeight: 1.6 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', marginRight: '0.5rem', color: 'rgba(134,239,172,0.5)' }}>
                ESTABLISHED
              </span>
              {learned}
            </p>
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Selection button ──────────────────────────────────────────────────────────

function SelectBtn({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ borderColor: 'rgba(255,241,45,0.4)' }}
      onClick={onClick}
      style={{
        padding: '0.75rem 1rem', textAlign: 'left', cursor: 'pointer',
        background: selected ? 'rgba(255,241,45,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${selected ? 'rgba(255,241,45,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '6px', color: selected ? '#FFF12D' : 'rgba(255,255,255,0.65)',
        fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.4,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </motion.button>
  );
}

function ContinueBtn({ onClick, label = 'Continue →' }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      whileHover={{ background: '#ffe800' }}
      onClick={onClick}
      style={{
        marginTop: '1.5rem', padding: '0.75rem 1.75rem',
        background: '#FFF12D', color: '#000',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem',
        border: 'none', borderRadius: '6px', cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {label}
    </motion.button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AssetProtectionConsultation() {
  const [state, setState] = useState<ConsultationState>(INITIAL_STATE);
  const { dispatchTrustSignal, setJourneySelection, receiveRecommendation, setIntent } = useConversion();

  // Derived data
  const selectedIndustry = INDUSTRIES.find((i) => i.id === state.industryId) ?? null;

  // Computed contamination nodes from service
  const contaminationNodes = listEntitiesWithProvenance('CONTAMINATION').map(({ node }) => node);
  const failureModeNodes = listEntitiesWithProvenance('FAILURE_MODE').map(({ node }) => node);
  const principleNodes = listEntitiesWithProvenance('ENGINEERING_PRINCIPLE').map(({ node }) => node);
  const techNodes = listEntitiesWithProvenance('TECHNOLOGY_ARCHITECTURE').map(({ node }) => node);

  // ── Navigation helpers ────────────────────────────────────────────────────────

  const advance = useCallback((nextStep: number, updates?: Partial<ConsultationState>) => {
    setState((s) => ({ ...s, ...updates, step: nextStep }));
  }, []);

  const toggleItem = useCallback(<T extends string>(
    key: keyof ConsultationState,
    id: T,
  ) => {
    setState((s) => {
      const arr = s[key] as T[];
      const exists = arr.includes(id);
      return { ...s, [key]: exists ? arr.filter((x) => x !== id) : [...arr, id] };
    });
  }, []);

  // ── Step 1: Asset description ─────────────────────────────────────────────────

  function step1() {
    return (
      <StepWrapper
        number="STEP 01 / ASSET IDENTIFICATION"
        title="Which asset are you trying to protect?"
        rationale="Asset type determines the critical systems at risk. A diesel engine, hydraulic press, and marine vessel have fundamentally different contamination pathways and failure modes."
      >
        <textarea
          value={state.assetDescription}
          onChange={(e) => setState((s) => ({ ...s, assetDescription: e.target.value }))}
          placeholder="Describe your asset — e.g. 'Caterpillar 390F excavator', 'MAN TGX fleet truck', 'centrifugal pump station', 'offshore generator set'..."
          style={{
            width: '100%', minHeight: '100px', padding: '1rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px', color: '#fff', fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
        <ContinueBtn
          onClick={() => {
            setJourneySelection('assetDescription', state.assetDescription);
            setIntent('PROACTIVE_PROTECTION');
            dispatchTrustSignal('T-1');
            advance(2);
          }}
          label="Identify the operational context →"
        />
      </StepWrapper>
    );
  }

  // ── Step 2: Industry ──────────────────────────────────────────────────────────

  function step2() {
    return (
      <StepWrapper
        number="STEP 02 / OPERATIONAL CONTEXT"
        title="What industry does this asset operate in?"
        rationale="Industry determines the dominant contamination sources: mining generates silica dust, marine operations introduce catalytic fines, manufacturing environments expose hydraulic systems to fine metallic particles."
        learned={state.assetDescription ? `Asset identified: ${state.assetDescription}` : undefined}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.65rem' }}>
          {INDUSTRIES.map((ind, i) => (
            <motion.button
              key={ind.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ borderColor: 'rgba(255,241,45,0.35)', background: 'rgba(255,241,45,0.04)' }}
              onClick={() => {
                setJourneySelection('industryId', ind.id);
                setJourneySelection('assetType', ind.assetType);
                dispatchTrustSignal('T-2');
                advance(3, { industryId: ind.id });
              }}
              style={{
                padding: '0.85rem', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{ind.icon}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                {ind.label}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(253,186,116,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>
                ⚠ {ind.risk}
              </div>
            </motion.button>
          ))}
        </div>
      </StepWrapper>
    );
  }

  // ── Step 3: Operating conditions ──────────────────────────────────────────────

  function step3() {
    const learned = selectedIndustry
      ? `${selectedIndustry.label} operations confirmed. Primary risk profile: ${selectedIndustry.risk}. Asset type: ${selectedIndustry.assetType}.`
      : undefined;
    return (
      <StepWrapper
        number="STEP 03 / OPERATING CONDITIONS"
        title="What operating conditions does this asset face?"
        rationale="Operating conditions determine contamination load severity. High dust environments accelerate air filter blinding. Wet conditions introduce water contamination in fuel and lube systems. Selecting all that apply allows us to weight the failure mode probability."
        learned={learned}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.65rem' }}>
          {OPERATING_CONDITIONS.map((cond) => (
            <SelectBtn
              key={cond.id}
              selected={state.selectedConditions.includes(cond.id)}
              onClick={() => toggleItem('selectedConditions', cond.id)}
            >
              <span style={{ marginRight: '0.5rem' }}>{cond.icon}</span>
              {cond.label}
            </SelectBtn>
          ))}
        </div>
        <ContinueBtn
          onClick={() => {
            dispatchTrustSignal('T-3');
            advance(4);
          }}
        />
      </StepWrapper>
    );
  }

  // ── Step 4: Symptoms ──────────────────────────────────────────────────────────

  function step4() {
    const condLabels = state.selectedConditions
      .map((c) => OPERATING_CONDITIONS.find((o) => o.id === c)?.label ?? c)
      .join(', ');
    return (
      <StepWrapper
        number="STEP 04 / OBSERVED SYMPTOMS"
        title="What symptoms or concerns have you observed?"
        rationale="Symptoms narrow the failure mode scope. Premature wear signals particle contamination in lube circuits. Hydraulic drift points to particle-damaged proportional valves. Identifying symptoms at this stage prevents us from building a protection system around the wrong contamination target."
        learned={condLabels ? `Operating conditions: ${condLabels}.` : undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SYMPTOMS.map((sym) => (
            <SelectBtn
              key={sym.id}
              selected={state.selectedSymptoms.includes(sym.id)}
              onClick={() => toggleItem('selectedSymptoms', sym.id)}
            >
              {sym.label}
            </SelectBtn>
          ))}
        </div>
        <ContinueBtn onClick={() => advance(5)} />
      </StepWrapper>
    );
  }

  // ── Step 5: Contamination risks ───────────────────────────────────────────────

  function step5() {
    const candidateIds = state.industryId ? INDUSTRY_CONTAMINATION_MAP[state.industryId] : [];
    const candidates = contaminationNodes.filter((n) => candidateIds.includes(n.entityId));
    const symptomLabels = state.selectedSymptoms
      .map((s) => SYMPTOMS.find((x) => x.id === s)?.label ?? s)
      .join('; ');
    return (
      <StepWrapper
        number="STEP 05 / CONTAMINATION RISK ASSESSMENT"
        title="Which contamination risks are most relevant to your operation?"
        rationale="Every failure mode has a contamination source. Identifying the contamination at this stage ensures the technology recommendation targets the root cause, not the symptom. Review the contamination types identified for your industry and confirm which apply."
        learned={symptomLabels ? `Observed symptoms: ${symptomLabels}.` : undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {candidates.map((node) => {
            const p = node.properties as Record<string, unknown>;
            const selected = state.selectedContaminationIds.includes(node.entityId);
            return (
              <motion.div
                key={node.entityId}
                whileHover={{ borderColor: selected ? 'rgba(253,186,116,0.5)' : 'rgba(255,241,45,0.25)' }}
                onClick={() => toggleItem('selectedContaminationIds', node.entityId)}
                style={{
                  padding: '1rem 1.1rem', cursor: 'pointer',
                  background: selected ? 'rgba(253,186,116,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selected ? 'rgba(253,186,116,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '8px', transition: 'all 0.15s',
                }}
              >
                <div style={{
                  fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
                  color: selected ? '#fdba74' : 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.08em', marginBottom: '0.3rem',
                }}>
                  {node.entityId}
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                  {node.label}
                </div>
                {!!p['phaseState'] && (
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                    {String(p['phaseState'])}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        {candidates.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Select an industry in step 2 to surface contamination risks.
          </p>
        )}
        <ContinueBtn
          onClick={() => {
            dispatchTrustSignal('T-4');
            // Derive failure modes from selected contaminations
            const fmIds = new Set<string>();
            state.selectedContaminationIds.forEach((contId) => {
              const recs = recommendFromContamination(contId);
              recs.filter((r) => r.targetEntityType === 'FAILURE_MODE').forEach((r) => {
                fmIds.add(r.targetEntityId);
                receiveRecommendation(r);
              });
            });
            advance(6, { selectedFailureModeIds: Array.from(fmIds) });
          }}
        />
      </StepWrapper>
    );
  }

  // ── Step 6: Failure modes ─────────────────────────────────────────────────────

  function step6() {
    const contLabels = state.selectedContaminationIds
      .map((id) => contaminationNodes.find((n) => n.entityId === id)?.label ?? id)
      .join(', ');
    const fmCandidates = failureModeNodes.filter((n) =>
      state.selectedFailureModeIds.includes(n.entityId),
    );
    return (
      <StepWrapper
        number="STEP 06 / FAILURE MODE ANALYSIS"
        title="These are the failure modes your contamination profile creates"
        rationale="Understanding failure modes converts contamination data into engineering consequences. Each failure mode has a measurable consequence: bearing lifespan reduction, overhaul cost, unplanned downtime. This is the economic case for the protection system."
        learned={`Contamination sources confirmed: ${contLabels || 'none selected'}.`}
      >
        {fmCandidates.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Select contamination sources in step 5 to derive failure modes.
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {fmCandidates.map((node) => {
            const p = node.properties as Record<string, unknown>;
            return (
              <div
                key={node.entityId}
                style={{
                  padding: '1rem 1.1rem',
                  background: 'rgba(252,165,165,0.04)',
                  border: '1px solid rgba(252,165,165,0.15)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5', marginBottom: '0.3rem', letterSpacing: '0.08em' }}>
                  {node.entityId}
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                  {node.label}
                </div>
                {!!p['measurableConsequence'] && (
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 0.4rem', lineHeight: 1.6 }}>
                    {String(p['measurableConsequence'])}
                  </p>
                )}
                {!!p['industrialImpact'] && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(253,186,116,0.65)', margin: 0, lineHeight: 1.5 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', marginRight: '0.4rem' }}>COST IMPACT</span>
                    {String(p['industrialImpact'])}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <ContinueBtn
          onClick={() => {
            // Derive principles from failure mode → technology → principle
            const principleIds = new Set<string>();
            state.selectedFailureModeIds.forEach((fmId) => {
              const recs = recommendFromFailureMode(fmId);
              recs.filter((r) => r.targetEntityType === 'ENGINEERING_PRINCIPLE').forEach((r) => {
                principleIds.add(r.targetEntityId);
                receiveRecommendation(r);
              });
            });
            advance(7, { selectedPrincipleIds: Array.from(principleIds) });
          }}
          label="Map engineering principles →"
        />
      </StepWrapper>
    );
  }

  // ── Step 7: Engineering principles ───────────────────────────────────────────

  function step7() {
    const fmLabels = state.selectedFailureModeIds
      .map((id) => failureModeNodes.find((n) => n.entityId === id)?.label ?? id)
      .join(', ');
    const principleRecs = state.selectedFailureModeIds.flatMap((fmId) =>
      recommendFromFailureMode(fmId).filter((r) => r.targetEntityType === 'ENGINEERING_PRINCIPLE'),
    );
    const uniquePrincipleIds = Array.from(new Set(principleRecs.map((r) => r.targetEntityId)));
    const displayPrinciples = principleNodes.filter((n) => uniquePrincipleIds.includes(n.entityId));

    // Also gather any principles from service that came back
    // If none found, show all principles as candidates
    const principlesShown = displayPrinciples.length > 0 ? displayPrinciples : principleNodes.slice(0, 4);

    return (
      <StepWrapper
        number="STEP 07 / ENGINEERING PRINCIPLES"
        title="These engineering principles govern the protection strategy"
        rationale="Engineering principles are the physical laws and engineering design rules that underpin every technology recommendation. They explain WHY a technology works, not just WHAT it does. Understanding the principles builds confidence in the recommendation."
        learned={fmLabels ? `Failure modes identified: ${fmLabels}.` : undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
          {principlesShown.map((node) => {
            const p = node.properties as Record<string, unknown>;
            return (
              <div
                key={node.entityId}
                style={{
                  padding: '1rem 1.1rem',
                  background: 'rgba(125,211,252,0.04)',
                  border: '1px solid rgba(125,211,252,0.12)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: '#7dd3fc', marginBottom: '0.3rem', letterSpacing: '0.08em' }}>
                  {node.entityId}
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                  {node.label}
                </div>
                {!!p['definition'] && (
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
                    {String(p['definition'])}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <ContinueBtn
          onClick={() => {
            dispatchTrustSignal('T-5');
            // Derive technologies from failure modes
            const techIds = new Set<string>();
            state.selectedFailureModeIds.forEach((fmId) => {
              const recs = recommendFromFailureMode(fmId);
              recs.filter((r) => r.targetEntityType === 'TECHNOLOGY_ARCHITECTURE').forEach((r) => {
                techIds.add(r.targetEntityId);
                receiveRecommendation(r);
              });
            });
            // Also from contaminations
            state.selectedContaminationIds.forEach((cId) => {
              const recs = recommendFromContamination(cId);
              recs.filter((r) => r.targetEntityType === 'TECHNOLOGY_ARCHITECTURE').forEach((r) => {
                techIds.add(r.targetEntityId);
                receiveRecommendation(r);
              });
            });
            advance(8, {
              selectedTechIds: Array.from(techIds),
              selectedPrincipleIds: principlesShown.map((n) => n.entityId),
            });
          }}
          label="Identify protection technologies →"
        />
      </StepWrapper>
    );
  }

  // ── Step 8: Technology architectures ─────────────────────────────────────────

  function step8() {
    const techCandidates = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));
    // Fallback if graph doesn't surface recs via failure modes
    const shown = techCandidates.length > 0
      ? techCandidates
      : techNodes.filter((n) => {
          const p = n.properties as Record<string, unknown>;
          if (!state.industryId) return false;
          const industries = Array.isArray(p['applicableIndustries'])
            ? (p['applicableIndustries'] as string[])
            : [];
          return industries.some((ind) => ind.toLowerCase().includes(state.industryId ?? ''));
        }).slice(0, 4);

    return (
      <StepWrapper
        number="STEP 08 / TECHNOLOGY ARCHITECTURES"
        title="These technology architectures address your contamination profile"
        rationale="Technology architectures define HOW contamination is controlled at the engineering level — filtration media construction, particle retention mechanism, bypass protection, service life. Each technology is selected because it directly controls the failure modes identified in your contamination assessment."
        learned={`Engineering principles governing this strategy have been identified.`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
          {shown.map((node) => {
            const p = node.properties as Record<string, unknown>;
            return (
              <div
                key={node.entityId}
                style={{
                  padding: '1rem 1.1rem',
                  background: 'rgba(255,241,45,0.04)',
                  border: '1px solid rgba(255,241,45,0.12)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,241,45,0.5)', marginBottom: '0.3rem', letterSpacing: '0.08em' }}>
                      {node.entityId}
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                      {node.label}
                    </div>
                    {!!p['engineeringDescription'] && (
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
                        {String(p['engineeringDescription'])}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/engineering/technologies/${node.entityId}`}
                    style={{
                      fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                      color: 'rgba(255,241,45,0.6)', textDecoration: 'none',
                      border: '1px solid rgba(255,241,45,0.2)', padding: '0.3rem 0.6rem',
                      borderRadius: '4px', whiteSpace: 'nowrap',
                    }}
                  >
                    EXPLORE →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <ContinueBtn
          onClick={() => {
            dispatchTrustSignal('T-6');
            advance(9);
          }}
          label="Review supporting evidence →"
        />
      </StepWrapper>
    );
  }

  // ── Step 9: Evidence ──────────────────────────────────────────────────────────

  function step9() {
    // Gather standards from recommendations off selected techs
    const standardRecs: Recommendation[] = [];
    const seenStds = new Set<string>();
    state.selectedTechIds.forEach((techId) => {
      recommendFromTechnology(techId)
        .filter((r) => r.targetEntityType === 'STANDARD')
        .forEach((r) => {
          if (!seenStds.has(r.targetEntityId)) {
            seenStds.add(r.targetEntityId);
            standardRecs.push(r);
          }
        });
    });
    const standardNodes = listEntitiesWithProvenance('STANDARD')
      .map(({ node }) => node)
      .filter((n) => seenStds.has(n.entityId));

    const techLabels = state.selectedTechIds
      .map((id) => techNodes.find((n) => n.entityId === id)?.label ?? id)
      .join(', ');

    return (
      <StepWrapper
        number="STEP 09 / ENGINEERING EVIDENCE"
        title="Standards and testing evidence supporting this recommendation"
        rationale="Engineering recommendations must be traceable to published standards. The standards below define the test methods and performance thresholds that validate whether a protection technology achieves the contamination control target."
        learned={`Technology architectures identified: ${techLabels || 'see step 8'}.`}
      >
        {standardNodes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.65rem', marginBottom: '1.5rem' }}>
            {standardNodes.map((node) => {
              const p = node.properties as Record<string, unknown>;
              return (
                <div
                  key={node.entityId}
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(196,181,253,0.04)',
                    border: '1px solid rgba(196,181,253,0.12)',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#c4b5fd', marginBottom: '0.3rem' }}>
                    {node.label}
                  </div>
                  {!!p['scope'] && (
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
                      {String(p['scope']).slice(0, 120)}…
                    </p>
                  )}
                  <Link
                    href={`/engineering/standards/${node.entityId}`}
                    style={{ fontSize: '0.6rem', color: 'rgba(196,181,253,0.5)', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    VIEW STANDARD →
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Applicable standards are referenced within each technology architecture.
          </p>
        )}
        <ContinueBtn onClick={() => advance(10)} label="View protection system →" />
      </StepWrapper>
    );
  }

  // ── Step 10: Protection system recommendation ─────────────────────────────────

  function step10() {
    const techShown = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));
    const contShown = contaminationNodes.filter((n) => state.selectedContaminationIds.includes(n.entityId));
    const fmShown = failureModeNodes.filter((n) => state.selectedFailureModeIds.includes(n.entityId));
    const industryLabel = selectedIndustry?.label ?? 'your industry';
    const assetLabel = state.assetDescription || selectedIndustry?.assetType || 'your asset';
    const conditionLabels = state.selectedConditions
      .map((c) => OPERATING_CONDITIONS.find((o) => o.id === c)?.label ?? c)
      .join('; ');

    return (
      <StepWrapper
        number="STEP 10 / PROTECTION SYSTEM RECOMMENDATION"
        title="Engineering assessment complete — your protection system"
        rationale="The following recommendation is the conclusion of your engineering consultation. It represents the optimal contamination control strategy for your specific operating profile, derived from the contamination sources, failure modes, and engineering principles identified across the previous steps."
        learned={`Full assessment complete. Operating context: ${industryLabel} | ${assetLabel}.`}
      >
        {/* Engineering Summary */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'rgba(255,241,45,0.05)',
          border: '2px solid rgba(255,241,45,0.2)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,241,45,0.6)', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            ENGINEERING ASSESSMENT SUMMARY
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>ASSET</p>
              <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0 }}>{assetLabel}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>INDUSTRY</p>
              <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0 }}>{industryLabel}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>CONTAMINATION RISKS</p>
              <p style={{ fontSize: '0.85rem', color: '#fdba74', margin: 0 }}>{contShown.length} identified</p>
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>FAILURE MODES</p>
              <p style={{ fontSize: '0.85rem', color: '#fca5a5', margin: 0 }}>{fmShown.length} mapped</p>
            </div>
          </div>
          {conditionLabels && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>OPERATING CONDITIONS</p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', margin: 0 }}>{conditionLabels}</p>
            </div>
          )}
        </div>

        {/* Recommended protection strategy */}
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, marginBottom: '1.5rem', textAlign: 'justify' }}>
          Based on the operating conditions described, the following protection system provides the best engineering fit for reducing the identified operational risks in {industryLabel} applications operating under your specified conditions.
        </p>

        {/* Technologies */}
        {techShown.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              RECOMMENDED TECHNOLOGY ARCHITECTURES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {techShown.map((node) => (
                <Link
                  key={node.entityId}
                  href={`/engineering/technologies/${node.entityId}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,241,45,0.04)', border: '1px solid rgba(255,241,45,0.15)',
                    borderRadius: '6px', textDecoration: 'none',
                  }}
                >
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#FFF12D', fontSize: '0.88rem' }}>
                    {node.label}
                  </span>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,241,45,0.5)' }}>
                    {node.entityId}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Failure modes prevented */}
        {fmShown.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              FAILURE MODES PREVENTED
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {fmShown.map((node) => (
                <span
                  key={node.entityId}
                  style={{
                    padding: '0.25rem 0.65rem', fontSize: '0.72rem',
                    background: 'rgba(252,165,165,0.06)', border: '1px solid rgba(252,165,165,0.15)',
                    borderRadius: '4px', color: '#fca5a5', fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {node.entityId}
                </span>
              ))}
            </div>
          </div>
        )}

        <ContinueBtn
          onClick={() => {
            dispatchTrustSignal('T-7');
            advance(11);
          }}
          label="View implementation options →"
        />
      </StepWrapper>
    );
  }

  // ── Step 11: Products + CTA ────────────────────────────────────────────────────

  function step11() {
    const techShown = techNodes.filter((n) => state.selectedTechIds.includes(n.entityId));
    const industryLabel = selectedIndustry?.label ?? 'your industry';

    // Gather protection media from technologies
    const mediaRecs: Recommendation[] = [];
    const seenMedia = new Set<string>();
    state.selectedTechIds.forEach((techId) => {
      recommendFromTechnology(techId)
        .filter((r) => r.targetEntityType === 'PROTECTION_MEDIA')
        .forEach((r) => {
          if (!seenMedia.has(r.targetEntityId)) {
            seenMedia.add(r.targetEntityId);
            mediaRecs.push(r);
          }
        });
    });
    const mediaNodes = listEntitiesWithProvenance('PROTECTION_MEDIA')
      .map(({ node }) => node)
      .filter((n) => seenMedia.has(n.entityId));

    return (
      <StepWrapper
        number="STEP 11 / IMPLEMENTATION"
        title="Product implementation of your protection system"
        rationale="The protection technologies identified in your consultation are implemented through specific protection media and product configurations. These are the physical filtration elements that deploy the engineering strategy designed for your operating conditions."
        learned={`Protection strategy confirmed for ${industryLabel} operations.`}
      >
        {/* Protection media */}
        {mediaNodes.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              PROTECTION MEDIA DEPLOYED BY THIS STRATEGY
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
              {mediaNodes.map((node) => {
                const p = node.properties as Record<string, unknown>;
                return (
                  <Link
                    key={node.entityId}
                    href={`/engineering/media/${node.entityId}`}
                    style={{
                      display: 'block', padding: '0.75rem 0.9rem',
                      background: 'rgba(134,239,172,0.04)', border: '1px solid rgba(134,239,172,0.12)',
                      borderRadius: '6px', textDecoration: 'none',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#86efac', marginBottom: '0.25rem' }}>
                      {node.label}
                    </div>
                    {!!p['baseConstruction'] && (
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                        {String(p['baseConstruction'])}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Technology links */}
        {techShown.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              EXPLORE TECHNOLOGY SPECIFICATIONS
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {techShown.map((node) => (
                <Link
                  key={node.entityId}
                  href={`/engineering/technologies/${node.entityId}`}
                  style={{
                    padding: '0.4rem 0.9rem', fontSize: '0.78rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'rgba(255,241,45,0.06)', border: '1px solid rgba(255,241,45,0.2)',
                    borderRadius: '4px', color: '#FFF12D', textDecoration: 'none',
                  }}
                >
                  {node.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
          }}>
            OPTIONAL: ENGINEERING CONSULTATION
          </p>
          <CTACard onLeadCapture={() => {}} />
        </div>

        {/* Restart */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
          <button
            onClick={() => setState(INITIAL_STATE)}
            style={{
              fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.08)',
              padding: '0.4rem 0.9rem', borderRadius: '4px', cursor: 'pointer',
            }}
          >
            ↺ Start new consultation
          </button>
        </div>
      </StepWrapper>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const TOTAL_STEPS = 11;

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back nav */}
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '860px', margin: '0 auto' }}>
        <Link href="/search" style={{
          fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.08em',
        }}>
          ← ENGINEERING INTELLIGENCE
        </Link>
      </div>

      {/* Hero */}
      <section style={{
        padding: 'clamp(2.5rem, 5vw, 4rem) 2rem 2rem',
        borderBottom: '1px solid rgba(255,241,45,0.08)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p style={{
              fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,241,45,0.55)', letterSpacing: '0.12em', marginBottom: '0.75rem',
            }}>
              ENGINEERING CONSULTATION · ASSET PROTECTION
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              color: '#fff', margin: '0 0 0.75rem',
            }}>
              Asset Protection Engineering Consultation
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0, maxWidth: '620px' }}>
              A structured engineering consultation that maps your asset and operating conditions to contamination risks, failure modes, and the protection system that reduces operational risk.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Consultation */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <ProgressBar step={state.step} total={TOTAL_STEPS} />
        <AnimatePresence mode="wait">
          {state.step === 1 && step1()}
          {state.step === 2 && step2()}
          {state.step === 3 && step3()}
          {state.step === 4 && step4()}
          {state.step === 5 && step5()}
          {state.step === 6 && step6()}
          {state.step === 7 && step7()}
          {state.step === 8 && step8()}
          {state.step === 9 && step9()}
          {state.step === 10 && step10()}
          {state.step === 11 && step11()}
        </AnimatePresence>
      </div>
    </main>
  );
}
