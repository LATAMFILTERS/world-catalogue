'use client';

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { SearchResult, Recommendation } from '@/lib/services';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrustSignal = 'T-1' | 'T-2' | 'T-3' | 'T-4' | 'T-5' | 'T-6' | 'T-7';
export type TrustLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type CustomerIntent =
  | 'KNOWN_PART'
  | 'EQUIPMENT_REPLACEMENT'
  | 'FAILURE_DIAGNOSIS'
  | 'PROACTIVE_PROTECTION'
  | 'TECHNOLOGY_RESEARCH'
  | 'SUPPLIER_EVALUATION'
  | 'DISTRIBUTOR'
  | 'UNKNOWN';

export type JourneyId = 'PART_NUMBER' | 'ASSET_PROTECTION' | 'PROBLEM_DIAGNOSIS' | 'LEARNING';

export type LeadType = 'L-1' | 'L-2' | 'L-3' | 'L-4' | 'L-5' | 'L-6' | 'L-7';

export interface ConversionState {
  trustSignalsReached: TrustSignal[];
  currentTrustLevel: TrustLevel;
  detectedIntent: CustomerIntent;
  activeJourneyId: JourneyId | null;
  activeJourneyStep: number;
  entitiesEngaged: string[];
  recommendationsReceived: Recommendation[];
  eligibleCTAs: LeadType[];
  lastSearchResults: SearchResult[];
  journeySelections: Record<string, string>;
}

type ConversionAction =
  | { type: 'DISPATCH_TRUST_SIGNAL'; signal: TrustSignal }
  | { type: 'SET_INTENT'; intent: CustomerIntent }
  | { type: 'START_JOURNEY'; journeyId: JourneyId }
  | { type: 'ADVANCE_STEP'; step: number }
  | { type: 'ENGAGE_ENTITY'; entityId: string }
  | { type: 'RECEIVE_RECOMMENDATION'; recommendation: Recommendation }
  | { type: 'SET_SEARCH_RESULTS'; results: SearchResult[] }
  | { type: 'SET_JOURNEY_SELECTION'; key: string; value: string };

// ─── Trust signal → level mapping ────────────────────────────────────────────

const SIGNAL_LEVELS: Record<TrustSignal, TrustLevel> = {
  'T-1': 1, 'T-2': 2, 'T-3': 3, 'T-4': 4, 'T-5': 5, 'T-6': 6, 'T-7': 7,
};

function computeEligibleCTAs(signals: TrustSignal[]): LeadType[] {
  const has = (s: TrustSignal) => signals.includes(s);
  const ctAs: LeadType[] = [];
  if (has('T-1')) ctAs.push('L-5');           // Newsletter: low bar
  if (has('T-2')) ctAs.push('L-6');           // Failure analysis: mechanism understood
  if (has('T-4')) ctAs.push('L-4');           // Technical download: technology seen
  if (has('T-6')) ctAs.push('L-1', 'L-2');   // Consultation + Quote: recommendation trusted
  if (has('T-4')) ctAs.push('L-3');           // Distributor: technology identified
  if (has('T-7')) ctAs.push('L-7');           // Training: institutional trust
  return Array.from(new Set(ctAs));
}

function reducer(state: ConversionState, action: ConversionAction): ConversionState {
  switch (action.type) {
    case 'DISPATCH_TRUST_SIGNAL': {
      if (state.trustSignalsReached.includes(action.signal)) return state;
      const signals = [...state.trustSignalsReached, action.signal];
      const level = Math.max(...signals.map(s => SIGNAL_LEVELS[s])) as TrustLevel;
      return {
        ...state,
        trustSignalsReached: signals,
        currentTrustLevel: level,
        eligibleCTAs: computeEligibleCTAs(signals),
      };
    }
    case 'SET_INTENT':
      return { ...state, detectedIntent: action.intent };
    case 'START_JOURNEY':
      return { ...state, activeJourneyId: action.journeyId, activeJourneyStep: 1 };
    case 'ADVANCE_STEP':
      return { ...state, activeJourneyStep: action.step };
    case 'ENGAGE_ENTITY':
      if (state.entitiesEngaged.includes(action.entityId)) return state;
      return { ...state, entitiesEngaged: [...state.entitiesEngaged, action.entityId] };
    case 'RECEIVE_RECOMMENDATION':
      return { ...state, recommendationsReceived: [...state.recommendationsReceived, action.recommendation] };
    case 'SET_SEARCH_RESULTS':
      return { ...state, lastSearchResults: action.results };
    case 'SET_JOURNEY_SELECTION':
      return { ...state, journeySelections: { ...state.journeySelections, [action.key]: action.value } };
    default:
      return state;
  }
}

const INITIAL_STATE: ConversionState = {
  trustSignalsReached: [],
  currentTrustLevel: 0,
  detectedIntent: 'UNKNOWN',
  activeJourneyId: null,
  activeJourneyStep: 0,
  entitiesEngaged: [],
  recommendationsReceived: [],
  eligibleCTAs: [],
  lastSearchResults: [],
  journeySelections: {},
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface ConversionContextValue {
  state: ConversionState;
  dispatchTrustSignal: (signal: TrustSignal) => void;
  setIntent: (intent: CustomerIntent) => void;
  startJourney: (journeyId: JourneyId) => void;
  advanceStep: (step: number) => void;
  engageEntity: (entityId: string) => void;
  receiveRecommendation: (rec: Recommendation) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setJourneySelection: (key: string, value: string) => void;
  isCTAEligible: (cta: LeadType) => boolean;
}

const Ctx = createContext<ConversionContextValue | null>(null);

export function ConversionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const dispatchTrustSignal = useCallback((signal: TrustSignal) =>
    dispatch({ type: 'DISPATCH_TRUST_SIGNAL', signal }), []);
  const setIntent = useCallback((intent: CustomerIntent) =>
    dispatch({ type: 'SET_INTENT', intent }), []);
  const startJourney = useCallback((journeyId: JourneyId) =>
    dispatch({ type: 'START_JOURNEY', journeyId }), []);
  const advanceStep = useCallback((step: number) =>
    dispatch({ type: 'ADVANCE_STEP', step }), []);
  const engageEntity = useCallback((entityId: string) =>
    dispatch({ type: 'ENGAGE_ENTITY', entityId }), []);
  const receiveRecommendation = useCallback((rec: Recommendation) =>
    dispatch({ type: 'RECEIVE_RECOMMENDATION', recommendation: rec }), []);
  const setSearchResults = useCallback((results: SearchResult[]) =>
    dispatch({ type: 'SET_SEARCH_RESULTS', results }), []);
  const setJourneySelection = useCallback((key: string, value: string) =>
    dispatch({ type: 'SET_JOURNEY_SELECTION', key, value }), []);
  const isCTAEligible = useCallback((cta: LeadType) =>
    state.eligibleCTAs.includes(cta), [state.eligibleCTAs]);

  return (
    <Ctx.Provider value={{
      state, dispatchTrustSignal, setIntent, startJourney, advanceStep,
      engageEntity, receiveRecommendation, setSearchResults, setJourneySelection,
      isCTAEligible,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useConversion() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useConversion must be used inside ConversionProvider');
  return ctx;
}
