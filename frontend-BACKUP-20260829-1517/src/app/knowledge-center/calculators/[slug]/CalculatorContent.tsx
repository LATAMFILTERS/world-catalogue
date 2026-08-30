'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import type { KCCalculator } from '@/lib/knowledge-center-data';
import {
  countsToIso4406Code,
  iso4406CodeToString,
  betaToEfficiency,
  efficiencyToBeta,
  pressureDropEstimate,
  dhcEstimate,
  intervalFromDhc,
  airFilterRemainingLife,
  evaluateCleanliness,
  getIngestionRate,
  getDefaultSafetyFactor,
  serviceInterval,
  AIR_SERVICE_LIMIT_PA,
} from '@/lib/knowledge-center-data';
import type {
  FilterMediaType,
  HydraulicSystemType,
  OperatingEnvironment,
} from '@/lib/knowledge-center-data';

// ── Per-calculator state types ────────────────────────────────────────────────

type CalcState =
  | { slug: 'iso4406-code-converter';   c4: number; c6: number; c14: number }
  | { slug: 'beta-ratio-efficiency';    mode: 'betaToEff'; beta: number }
  | { slug: 'beta-ratio-efficiency';    mode: 'effToBeta'; efficiency: number }
  | { slug: 'pressure-drop-estimator';  dPRef: number; Q: number; QRef: number; mu: number; muRef: number }
  | { slug: 'dhc-planning-estimator';   mediaArea: number; mediaType: FilterMediaType; cIn: number; flow: number }
  | { slug: 'air-filter-restriction';   dPCurrent: number; dPClean: number }
  | { slug: 'fluid-cleanliness-evaluator'; n4: number; n6: number; n14: number; systemType: HydraulicSystemType }
  | { slug: 'service-interval-engineering'; dhc: number; env: OperatingEnvironment; customCIn: boolean; cIn: number; flow: number }
  ;

// ── Default states ────────────────────────────────────────────────────────────

function defaultState(slug: string): CalcState {
  switch (slug) {
    case 'iso4406-code-converter':
      return { slug, c4: 80000, c6: 10000, c14: 1000 };
    case 'beta-ratio-efficiency':
      return { slug, mode: 'betaToEff', beta: 200 };
    case 'pressure-drop-estimator':
      return { slug, dPRef: 350, Q: 100, QRef: 80, mu: 46, muRef: 32 };
    case 'dhc-planning-estimator':
      return { slug, mediaArea: 1.0, mediaType: 'synthetic', cIn: 0.8, flow: 80 };
    case 'air-filter-restriction':
      return { slug, dPCurrent: 350, dPClean: 125 };
    case 'fluid-cleanliness-evaluator':
      return { slug, n4: 19, n6: 16, n14: 13, systemType: 'servo-valve' };
    case 'service-interval-engineering':
      return { slug, dhc: 300, env: 'agriculture', customCIn: false, cIn: 0.8, flow: 80 };
    default:
      return { slug: 'iso4406-code-converter', c4: 80000, c6: 10000, c14: 1000 };
  }
}

// ── Styled sub-components ─────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.65rem',
      letterSpacing: '0.08em',
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase' as const,
      display: 'block',
      marginBottom: '0.35rem',
    }}>
      {children}
    </span>
  );
}

function NumInput({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '3px',
          color: '#fff',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.85rem',
          padding: '0.5rem 0.75rem',
          width: '100%',
          outline: 'none',
          boxSizing: 'border-box' as const,
        }}
      />
    </div>
  );
}

function SelectInput<T extends string>({
  label, value, options, onChange,
}: {
  label: string; value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '3px',
          color: '#fff',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.8rem',
          padding: '0.5rem 0.75rem',
          width: '100%',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: '#111' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function OutputRow({ label, value, unit, highlight }: {
  label: string; value: string; unit?: string; highlight?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '0.6rem 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: '0.04em',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: highlight ? '1.1rem' : '0.85rem',
        color: highlight ? '#FFF12D' : '#fff',
        fontWeight: highlight ? 700 : 400,
        letterSpacing: '0.02em',
      }}>
        {value}{unit ? ` ${unit}` : ''}
      </span>
    </div>
  );
}

// ── Per-calculator panels ─────────────────────────────────────────────────────

function Iso4406Panel({ state, update }: { state: Extract<CalcState, { slug: 'iso4406-code-converter' }>; update: (s: Partial<typeof state>) => void }) {
  const code = countsToIso4406Code({ c4: state.c4, c6: state.c6, c14: state.c14 });
  const str  = iso4406CodeToString(code);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <NumInput label="≥4 µm(c) count [/mL]" value={state.c4}  min={0} step={1000} onChange={v => update({ c4: v })} />
        <NumInput label="≥6 µm(c) count [/mL]" value={state.c6}  min={0} step={1000} onChange={v => update({ c6: v })} />
        <NumInput label="≥14 µm(c) count [/mL]" value={state.c14} min={0} step={100} onChange={v => update({ c14: v })} />
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <OutputRow label="ISO 4406:2021 Code" value={str} highlight />
        <OutputRow label="≥4 µm range code (N4)"  value={String(code.n4)} />
        <OutputRow label="≥6 µm range code (N6)"  value={String(code.n6)} />
        <OutputRow label="≥14 µm range code (N14)" value={String(code.n14)} />
      </div>
    </>
  );
}

function BetaRatioPanel({ state, setState }: {
  state: Extract<CalcState, { slug: 'beta-ratio-efficiency' }>;
  setState: (s: Extract<CalcState, { slug: 'beta-ratio-efficiency' }>) => void;
}) {
  const isBetaMode = state.mode === 'betaToEff';
  const eff  = isBetaMode ? betaToEfficiency(state.beta) : (state as { efficiency: number }).efficiency;
  const beta = isBetaMode ? state.beta : efficiencyToBeta((state as { efficiency: number }).efficiency);
  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {(['betaToEff', 'effToBeta'] as const).map(m => (
          <button
            key={m}
            onClick={() => setState({ slug: 'beta-ratio-efficiency', mode: m, ...(m === 'betaToEff' ? { beta: 200 } : { efficiency: 99 }) } as typeof state)}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              padding: '0.4rem 0.75rem',
              border: '1px solid',
              borderColor: state.mode === m ? '#FFF12D' : 'rgba(255,255,255,0.15)',
              background: state.mode === m ? 'rgba(255,241,45,0.08)' : 'transparent',
              color: state.mode === m ? '#FFF12D' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              borderRadius: '2px',
            }}
          >
            {m === 'betaToEff' ? 'β → Efficiency' : 'Efficiency → β'}
          </button>
        ))}
      </div>
      {isBetaMode ? (
        <NumInput label="Beta ratio β" value={(state as { beta: number }).beta} min={1} step={10}
          onChange={v => setState({ ...state, mode: 'betaToEff', beta: v })} />
      ) : (
        <NumInput label="Efficiency [%]" value={(state as { efficiency: number }).efficiency} min={0} max={99.99} step={0.5}
          onChange={v => setState({ ...state, mode: 'effToBeta', efficiency: v } as typeof state)} />
      )}
      <div style={{ marginTop: '1.5rem' }}>
        <OutputRow label="Beta ratio β"       value={isFinite(beta)  ? beta.toFixed(1)  : '∞'} highlight={!isBetaMode} />
        <OutputRow label="Single-pass efficiency" value={eff.toFixed(3)}  unit="%" highlight={isBetaMode} />
        <OutputRow label="Particles passed" value={isFinite(beta) ? (100/beta).toFixed(4) : '0'} unit="%" />
      </div>
    </>
  );
}

function PressureDropPanel({ state, update }: { state: Extract<CalcState, { slug: 'pressure-drop-estimator' }>; update: (s: Partial<typeof state>) => void }) {
  const dP = pressureDropEstimate(state.dPRef, state.Q, state.QRef, state.mu, state.muRef);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <NumInput label="Reference ΔP [Pa]"       value={state.dPRef} min={0} step={10}  onChange={v => update({ dPRef: v })} />
        <NumInput label="Reference flow rate QRef [L/min]"  value={state.QRef}  min={0.1} step={10} onChange={v => update({ QRef: v })} />
        <NumInput label="Operating flow rate Q [L/min]"     value={state.Q}     min={0}   step={10} onChange={v => update({ Q: v })} />
        <NumInput label="Reference viscosity μRef [mPa·s]"  value={state.muRef} min={0.1} step={1}  onChange={v => update({ muRef: v })} />
        <NumInput label="Operating viscosity μ [mPa·s]"     value={state.mu}    min={0}   step={1}  onChange={v => update({ mu: v })} />
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <OutputRow label="Estimated ΔP" value={dP.toFixed(1)} unit="Pa" highlight />
        <OutputRow label="Flow ratio Q/QRef" value={(state.QRef > 0 ? state.Q/state.QRef : 0).toFixed(3)} />
        <OutputRow label="Viscosity ratio μ/μRef" value={(state.muRef > 0 ? state.mu/state.muRef : 0).toFixed(3)} />
        <OutputRow label="Combined scale factor" value={(state.QRef > 0 && state.muRef > 0 ? (state.Q/state.QRef)*(state.mu/state.muRef) : 0).toFixed(3)} />
      </div>
    </>
  );
}

function DhcPanel({ state, update }: { state: Extract<CalcState, { slug: 'dhc-planning-estimator' }>; update: (s: Partial<typeof state>) => void }) {
  const dhc = dhcEstimate(state.mediaArea, state.mediaType);
  const intMin = intervalFromDhc(dhc.min, state.cIn, state.flow);
  const intMid = intervalFromDhc(dhc.mid, state.cIn, state.flow);
  const intMax = intervalFromDhc(dhc.max, state.cIn, state.flow);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <NumInput label="Media area [m²]" value={state.mediaArea} min={0.01} step={0.1} onChange={v => update({ mediaArea: v })} />
        <SelectInput<FilterMediaType> label="Media type" value={state.mediaType}
          options={[
            { value: 'cellulose', label: 'Cellulose' },
            { value: 'synthetic', label: 'Synthetic' },
            { value: 'glass-fiber', label: 'Glass Fiber' },
          ]}
          onChange={v => update({ mediaType: v })}
        />
        <NumInput label="Contamination ingestion cIn [mg/L]" value={state.cIn} min={0.01} step={0.1} onChange={v => update({ cIn: v })} />
        <NumInput label="System flow rate [L/min]" value={state.flow} min={1} step={10} onChange={v => update({ flow: v })} />
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <OutputRow label="DHC min" value={dhc.min.toFixed(0)} unit="g" />
        <OutputRow label="DHC mid (estimate)" value={dhc.mid.toFixed(0)} unit="g" highlight />
        <OutputRow label="DHC max" value={dhc.max.toFixed(0)} unit="g" />
        <OutputRow label="Service interval min" value={intMin.toFixed(2)} unit="h" />
        <OutputRow label="Service interval mid" value={intMid.toFixed(2)} unit="h" highlight />
        <OutputRow label="Service interval max" value={intMax.toFixed(2)} unit="h" />
      </div>
    </>
  );
}

function AirRestrictionPanel({ state, update }: { state: Extract<CalcState, { slug: 'air-filter-restriction' }>; update: (s: Partial<typeof state>) => void }) {
  const life = airFilterRemainingLife(state.dPCurrent, state.dPClean);
  const pctUsed = 100 - life;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <NumInput label="Current ΔP [Pa]" value={state.dPCurrent} min={0} max={800} step={25} onChange={v => update({ dPCurrent: v })} />
        <NumInput label="Clean ΔP [Pa]"   value={state.dPClean}   min={0} max={500} step={25} onChange={v => update({ dPClean: v })} />
      </div>
      {/* Visual bar */}
      <div style={{ marginTop: '1.25rem', marginBottom: '0.5rem' }}>
        <Label>Service life consumed</Label>
        <div style={{
          height: '10px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, pctUsed)}%`,
            background: pctUsed > 80 ? '#ff4444' : pctUsed > 50 ? '#ffaa00' : '#FFF12D',
            transition: 'width 0.2s ease',
          }} />
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <OutputRow label="Remaining life" value={life.toFixed(1)} unit="%" highlight />
        <OutputRow label="Life consumed"  value={pctUsed.toFixed(1)} unit="%" />
        <OutputRow label="Service limit"  value={String(AIR_SERVICE_LIMIT_PA)} unit="Pa (SAE J1539)" />
        <OutputRow label="Margin to limit" value={(AIR_SERVICE_LIMIT_PA - state.dPCurrent).toFixed(0)} unit="Pa" />
      </div>
    </>
  );
}

const SYSTEM_TYPE_OPTIONS: { value: HydraulicSystemType; label: string }[] = [
  { value: 'servo-valve',        label: 'Servo Valve (target 16/14/11)' },
  { value: 'proportional-valve', label: 'Proportional Valve (17/15/12)' },
  { value: 'directional-valve',  label: 'Directional Control Valve (18/16/13)' },
  { value: 'vane-gear-pump',     label: 'Vane/Gear Pump (19/17/14)' },
  { value: 'cylinder',           label: 'Cylinder (20/18/15)' },
];

function FluidCleanlinessPanel({ state, update }: { state: Extract<CalcState, { slug: 'fluid-cleanliness-evaluator' }>; update: (s: Partial<typeof state>) => void }) {
  const current = { n4: state.n4, n6: state.n6, n14: state.n14 };
  const evaluation = evaluateCleanliness(current, state.systemType);
  const { delta, reductionRatios } = evaluation;
  return (
    <>
      <SelectInput<HydraulicSystemType>
        label="System type"
        value={state.systemType}
        options={SYSTEM_TYPE_OPTIONS}
        onChange={v => update({ systemType: v })}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <NumInput label="N4 (≥4 µm code)"  value={state.n4}  min={0} max={28} step={1} onChange={v => update({ n4: v })} />
        <NumInput label="N6 (≥6 µm code)"  value={state.n6}  min={0} max={28} step={1} onChange={v => update({ n6: v })} />
        <NumInput label="N14 (≥14 µm code)" value={state.n14} min={0} max={28} step={1} onChange={v => update({ n14: v })} />
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <OutputRow label="Compliance status"
          value={evaluation.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
          highlight
        />
        <OutputRow label="Δ N4 (≥4 µm)"  value={delta.n4  > 0 ? `+${delta.n4}`  : String(delta.n4)}  unit="steps" />
        <OutputRow label="Δ N6 (≥6 µm)"  value={delta.n6  > 0 ? `+${delta.n6}`  : String(delta.n6)}  unit="steps" />
        <OutputRow label="Δ N14 (≥14 µm)" value={delta.n14 > 0 ? `+${delta.n14}` : String(delta.n14)} unit="steps" />
        <OutputRow label="Required ≥4 µm count reduction"  value={reductionRatios.n4  === 1 ? '—' : `${reductionRatios.n4.toFixed(0)}×`} />
        <OutputRow label="Required ≥6 µm count reduction"  value={reductionRatios.n6  === 1 ? '—' : `${reductionRatios.n6.toFixed(0)}×`} />
        <OutputRow label="Required ≥14 µm count reduction" value={reductionRatios.n14 === 1 ? '—' : `${reductionRatios.n14.toFixed(0)}×`} />
      </div>
    </>
  );
}

const ENV_OPTIONS: { value: OperatingEnvironment; label: string }[] = [
  { value: 'construction', label: 'Construction (typical: 2.0 mg/L)' },
  { value: 'agriculture',  label: 'Agriculture (typical: 0.8 mg/L)' },
  { value: 'industrial',   label: 'Industrial (typical: 0.15 mg/L)' },
];

function ServiceIntervalPanel({ state, update }: { state: Extract<CalcState, { slug: 'service-interval-engineering' }>; update: (s: Partial<typeof state>) => void }) {
  const rate   = getIngestionRate(state.env);
  const sf     = getDefaultSafetyFactor(state.env);
  const cIn    = state.customCIn ? state.cIn : rate.typical;
  const iTyp   = serviceInterval(state.dhc, cIn, state.flow, sf);
  const iMin   = serviceInterval(state.dhc, rate.max, state.flow, sf);
  const iMax   = serviceInterval(state.dhc, rate.min, state.flow, sf);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <NumInput label="Dirt holding capacity DHC [g]" value={state.dhc} min={1} step={10} onChange={v => update({ dhc: v })} />
        <NumInput label="System flow rate [L/min]"      value={state.flow} min={1} step={10} onChange={v => update({ flow: v })} />
        <SelectInput<OperatingEnvironment>
          label="Operating environment"
          value={state.env}
          options={ENV_OPTIONS}
          onChange={v => update({ env: v, cIn: getIngestionRate(v).typical })}
        />
        <div>
          <Label>Ingestion rate source</Label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['standard', 'custom'] as const).map(m => (
              <button
                key={m}
                onClick={() => update({ customCIn: m === 'custom' })}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  padding: '0.35rem 0.6rem',
                  border: '1px solid',
                  borderColor: (state.customCIn ? m === 'custom' : m === 'standard') ? '#FFF12D' : 'rgba(255,255,255,0.15)',
                  background: (state.customCIn ? m === 'custom' : m === 'standard') ? 'rgba(255,241,45,0.08)' : 'transparent',
                  color: (state.customCIn ? m === 'custom' : m === 'standard') ? '#FFF12D' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        {state.customCIn && (
          <NumInput label="Custom cIn [mg/L]" value={state.cIn} min={0.01} step={0.1} onChange={v => update({ cIn: v })} />
        )}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <OutputRow label={`Service interval (typical ${rate.typical} mg/L)`} value={iTyp.toFixed(1)} unit="h" highlight />
        <OutputRow label={`Worst case (${rate.max} mg/L)`}  value={iMin.toFixed(1)} unit="h" />
        <OutputRow label={`Best case (${rate.min} mg/L)`}   value={iMax.toFixed(1)} unit="h" />
        <OutputRow label="Safety factor (SAE J1299)" value={String(sf)} />
        <OutputRow label="Applied ingestion rate"   value={cIn.toFixed(2)} unit="mg/L" />
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CalculatorContent({ calc }: { calc: KCCalculator }) {
  const [state, setState] = useState<CalcState>(() => defaultState(calc.slug));
  const [showWorked, setShowWorked] = useState(false);

  const update = useCallback((partial: Partial<CalcState>) => {
    setState(prev => ({ ...prev, ...partial } as CalcState));
  }, []);

  function renderPanel() {
    switch (state.slug) {
      case 'iso4406-code-converter':
        return <Iso4406Panel state={state} update={update} />;
      case 'beta-ratio-efficiency':
        return <BetaRatioPanel state={state} setState={s => setState(s)} />;
      case 'pressure-drop-estimator':
        return <PressureDropPanel state={state} update={update} />;
      case 'dhc-planning-estimator':
        return <DhcPanel state={state} update={update} />;
      case 'air-filter-restriction':
        return <AirRestrictionPanel state={state} update={update} />;
      case 'fluid-cleanliness-evaluator':
        return <FluidCleanlinessPanel state={state} update={update} />;
      case 'service-interval-engineering':
        return <ServiceIntervalPanel state={state} update={update} />;
      default:
        return null;
    }
  }

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{
        padding: '1.25rem clamp(1.5rem, 5vw, 4rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
          {[
            { label: 'Knowledge Center', href: '/knowledge-center' },
            { label: 'Engineering Calculators', href: '/knowledge-center/calculators' },
            { label: calc.title, href: undefined },
          ].map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>›</span>}
              {crumb.href ? (
                <Link href={crumb.href} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.35)',
                  textDecoration: 'none',
                }}>
                  {crumb.label.toUpperCase()}
                </Link>
              ) : (
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,241,45,0.6)',
                }}>
                  {crumb.label.toUpperCase()}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          padding: 'clamp(2.5rem, 6vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          maxWidth: '900px',
        }}
      >
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
          color: 'rgba(255,241,45,0.45)',
          marginBottom: '1rem',
          textTransform: 'uppercase',
        }}>
          {calc.governingStandard}
        </p>
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 'clamp(1.4rem, 3vw, 2.25rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          marginBottom: '0.75rem',
        }}>
          {calc.title}
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.55)',
          maxWidth: '560px',
        }}>
          {calc.description}
        </p>
      </motion.section>

      {/* Two-column: formula + calculator */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
        gap: '0',
        maxWidth: '1200px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* Left: Formula specification */}
        <div style={{
          padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 5vw, 4rem)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h2 style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '1.25rem',
            textTransform: 'uppercase',
          }}>
            FORMULA
          </h2>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.95rem',
            color: '#fff',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '3px',
            padding: '1rem',
            marginBottom: '1.25rem',
            overflowX: 'auto' as const,
            whiteSpace: 'pre' as const,
          }}>
            {calc.formula.expression}
          </div>

          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem',
          }}>
            VARIABLES
          </p>
          {calc.formula.variables.map(v => (
            <div key={v.symbol} style={{
              display: 'grid',
              gridTemplateColumns: '5rem 1fr',
              gap: '0.5rem',
              marginBottom: '0.35rem',
              alignItems: 'baseline',
            }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#FFF12D' }}>
                {v.symbol}
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                {v.definition}
                {v.unit !== 'dimensionless' && <span style={{ color: 'rgba(255,255,255,0.3)' }}> [{v.unit}]</span>}
              </span>
            </div>
          ))}

          {calc.formula.assumptions.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                ASSUMPTIONS
              </p>
              {calc.formula.assumptions.map((a, i) => (
                <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: '0.25rem' }}>
                  · {a}
                </p>
              ))}
            </div>
          )}

          {calc.formula.limitations.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                LIMITATIONS
              </p>
              {calc.formula.limitations.map((l, i) => (
                <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: '0.25rem' }}>
                  · {l}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right: Interactive calculator */}
        <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 5vw, 4rem)' }}>
          <h2 style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '1.25rem',
            textTransform: 'uppercase',
          }}>
            CALCULATOR
          </h2>
          {renderPanel()}
        </div>
      </div>

      {/* Worked Example */}
      <div style={{
        padding: '0 clamp(1.5rem, 5vw, 4rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        maxWidth: '1200px',
      }}>
        <button
          onClick={() => setShowWorked(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1.25rem 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            width: '100%',
            textAlign: 'left' as const,
          }}
        >
          <span style={{
            color: '#FFF12D',
            fontSize: '0.7rem',
            transition: 'transform 0.2s',
            transform: showWorked ? 'rotate(90deg)' : 'none',
            display: 'inline-block',
          }}>▶</span>
          WORKED EXAMPLE — {calc.formula.workedExample.description}
        </button>

        {showWorked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ paddingBottom: '2rem' }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
            }}>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                  INPUTS
                </p>
                {calc.formula.workedExample.inputs.map(inp => (
                  <OutputRow key={inp.symbol} label={inp.symbol} value={inp.value} />
                ))}
              </div>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                  OUTPUTS
                </p>
                {calc.formula.workedExample.outputs.map(out => (
                  <OutputRow key={out.symbol} label={out.symbol} value={out.value} highlight />
                ))}
              </div>
            </div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.5)',
              marginTop: '1.25rem',
              textAlign: 'justify',
            }}>
              {calc.formula.workedExample.narrative}
            </p>
          </motion.div>
        )}
      </div>

      {/* Related standards & articles */}
      <section style={{
        padding: 'clamp(2rem, 5vw, 3rem) clamp(1.5rem, 5vw, 4rem)',
        maxWidth: '1200px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {calc.relatedStandards.length > 0 && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                RELATED STANDARDS
              </p>
              {calc.relatedStandards.map(s => (
                <Link key={s} href={`/knowledge-center/standards/${s}`} style={{
                  display: 'block',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  padding: '0.35rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {s} →
                </Link>
              ))}
            </div>
          )}
          {calc.relatedArticles.length > 0 && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                RELATED ARTICLES
              </p>
              {calc.relatedArticles.map(a => (
                <Link key={a} href={`/knowledge-center/engineering/${a}`} style={{
                  display: 'block',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  padding: '0.35rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {a} →
                </Link>
              ))}
            </div>
          )}
          {calc.relatedTechnologies.length > 0 && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                RELATED TECHNOLOGIES
              </p>
              {calc.relatedTechnologies.map(t => (
                <p key={t} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.55)',
                  padding: '0.35rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  margin: 0,
                }}>
                  {t}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Validation note */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(255,241,45,0.04)',
          border: '1px solid rgba(255,241,45,0.1)',
          borderRadius: '3px',
          padding: '1rem 1.25rem',
        }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.35)',
            lineHeight: 1.6,
            margin: 0,
          }}>
            VALIDATION: {calc.formula.validationReference} · SOURCE: {calc.sourceStandardRevision} · STATUS: {calc.validationStatus.toUpperCase()}
          </p>
        </div>
      </section>

    </main>
  );
}
