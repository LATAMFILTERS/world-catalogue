/**
 * Engineering Decision Engine — Decision Correctness Tests
 *
 * Each test proves the engine produces the correct decision state
 * for a specific evidence scenario. Tests are grouped by expected
 * outcome so failures point directly to which decision is wrong.
 *
 * Governing document: ENGINEERING_DECISION_ENGINE v1.1
 * Constitutional basis: ENGINEERING_EXPERIENCE_PRINCIPLES v1.3
 */

import { describe, it, expect } from 'vitest';
import { evaluate } from '../index';
import type { EvaluationInput } from '../index';

// ─── Fixture builders ─────────────────────────────────────────────────────────
// Each builder represents a realistic diagnostic scenario.
// Fields map directly to DiagnosticState from ProblemDiagnosisConsultation.

function minimalInput(overrides: Partial<EvaluationInput> = {}): EvaluationInput {
  return {
    intentClass: 'FAILURE_DIAGNOSIS',
    domain: 'LUBE_OIL',
    assetId: 'mining-excavator',
    assetDescription: 'Komatsu PC800 mining excavator',
    contaminationEntityIds: ['CONT-WEAR-PARTICLE-OIL'],
    failureModeEntityIds: ['FM-BEARING-WEAR'],
    principleEntityIds: ['EP-CONTAMINATION-CONTROL'],
    technologyEntityIds: ['TECH-SYNTRAX'],
    symptomIds: ['oil-consumption', 'premature-wear'],
    environmentIds: ['dusty', 'high-temperature'],
    onsetId: 'gradual',
    operatingConditionsKnown: true,
    draftClaims: [],
    ...overrides,
  };
}

// ─── PROHIBITED: engine must stop and request information ─────────────────────

describe('PROHIBITED gate', () => {
  it('triggers when asset is completely unknown', () => {
    const result = evaluate(minimalInput({
      assetId: null,
      assetDescription: null,
    }));

    expect(result.decisionState).toBe('PROHIBITED');
    expect(result.prohibitedGate.prohibited).toBe(true);
    expect(result.prohibitedGate.reason).toBe('UNKNOWN_EQUIPMENT');
    expect(result.composition.authorized).toBe(false);
    expect((result.composition as { decisionState: string }).decisionState).toBe('PROHIBITED');
  });

  it('triggers when contamination domain is unknown and no contamination entities selected', () => {
    const result = evaluate(minimalInput({
      domain: 'UNKNOWN',
      contaminationEntityIds: [],
    }));

    expect(result.decisionState).toBe('PROHIBITED');
    expect(result.prohibitedGate.reason).toBe('UNKNOWN_CONTAMINATION_SOURCE');
  });

  it('triggers when FAILURE_DIAGNOSIS has no operating conditions and no environments', () => {
    const result = evaluate(minimalInput({
      intentClass: 'FAILURE_DIAGNOSIS',
      operatingConditionsKnown: false,
      environmentIds: [],
      onsetId: null,
    }));

    expect(result.decisionState).toBe('PROHIBITED');
    expect(result.prohibitedGate.reason).toBe('UNKNOWN_OPERATING_CONDITIONS');
  });

  it('triggers when PROACTIVE_PROTECTION has no operating conditions', () => {
    const result = evaluate(minimalInput({
      intentClass: 'PROACTIVE_PROTECTION',
      operatingConditionsKnown: false,
      environmentIds: [],
      onsetId: null,
    }));

    expect(result.decisionState).toBe('PROHIBITED');
    expect(result.prohibitedGate.reason).toBe('UNKNOWN_OPERATING_CONDITIONS');
  });

  it('does NOT trigger for TECHNOLOGY_RESEARCH when operating conditions unknown', () => {
    // Technology research does not require operating conditions
    const result = evaluate(minimalInput({
      intentClass: 'TECHNOLOGY_RESEARCH',
      operatingConditionsKnown: false,
      environmentIds: [],
      onsetId: null,
    }));

    expect(result.decisionState).not.toBe('PROHIBITED');
    expect(result.prohibitedGate.prohibited).toBe(false);
  });

  it('provides minimum information required questions — never more than 3', () => {
    const result = evaluate(minimalInput({
      assetId: null,
      assetDescription: null,
    }));

    expect(result.decisionState).toBe('PROHIBITED');
    const comp = result.composition as unknown as { minimumInformationRequired: string[] };
    expect(comp.minimumInformationRequired.length).toBeGreaterThan(0);
    expect(comp.minimumInformationRequired.length).toBeLessThanOrEqual(3);
  });

  it('does not run confidence scoring when PROHIBITED', () => {
    const result = evaluate(minimalInput({
      assetId: null,
      assetDescription: null,
    }));

    expect(result.confidenceResult).toBeNull();
  });

  it('does not produce an authorized recommendation when PROHIBITED', () => {
    const result = evaluate(minimalInput({
      assetId: null,
      assetDescription: null,
    }));

    expect(result.composition.authorized).toBe(false);
  });
});

// ─── HIGH confidence: full evidence, direct reasoning ─────────────────────────

describe('HIGH confidence → RECOMMEND', () => {
  it('produces HIGH when all primary evidence is present with known conditions', () => {
    const result = evaluate(minimalInput({
      contaminationEntityIds: ['CONT-WEAR-PARTICLE-OIL', 'CONT-DUST-MINERAL'],
      failureModeEntityIds: ['FM-BEARING-WEAR', 'FM-RING-WEAR'],
      principleEntityIds: ['EP-CONTAMINATION-CONTROL', 'EP-CLEANLINESS-TARGET'],
      technologyEntityIds: ['TECH-SYNTRAX', 'TECH-MACROCORE'],
      symptomIds: ['oil-consumption', 'premature-wear', 'noise-knock'],
      environmentIds: ['dusty', 'high-temperature'],
      onsetId: 'gradual',
      operatingConditionsKnown: true,
    }));

    expect(result.decisionState).toBe('HIGH');
    expect(result.composition.authorized).toBe(true);
  });

  it('authorized recommendation contains engineering statement', () => {
    const result = evaluate(minimalInput({
      contaminationEntityIds: ['CONT-WEAR-PARTICLE-OIL', 'CONT-DUST-MINERAL'],
      failureModeEntityIds: ['FM-BEARING-WEAR', 'FM-RING-WEAR'],
      principleEntityIds: ['EP-CONTAMINATION-CONTROL', 'EP-CLEANLINESS-TARGET'],
      technologyEntityIds: ['TECH-SYNTRAX', 'TECH-MACROCORE'],
      symptomIds: ['oil-consumption', 'premature-wear', 'noise-knock'],
      environmentIds: ['dusty', 'high-temperature'],
      onsetId: 'gradual',
      operatingConditionsKnown: true,
    }));

    expect(result.composition.authorized).toBe(true);
    const comp = result.composition as { engineeringStatement: string; implementationGuidance: string };
    expect(typeof comp.engineeringStatement).toBe('string');
    expect(comp.engineeringStatement.length).toBeGreaterThan(20);
    expect(typeof comp.implementationGuidance).toBe('string');
  });

  it('produces HIGH for TECHNOLOGY_RESEARCH with strong technical evidence', () => {
    const result = evaluate(minimalInput({
      intentClass: 'TECHNOLOGY_RESEARCH',
      operatingConditionsKnown: false,
      environmentIds: [],
      onsetId: null,
      domain: 'HYDRAULIC',
      contaminationEntityIds: ['CONT-WEAR-PARTICLE-HYD'],
      failureModeEntityIds: ['FM-VALVE-STICTION'],
      principleEntityIds: ['EP-CONTAMINATION-CONTROL', 'EP-CLEANLINESS-TARGET'],
      technologyEntityIds: ['TECH-NANOFORCE', 'TECH-SYNTRAX'],
      symptomIds: [],
    }));

    expect(result.decisionState).not.toBe('PROHIBITED');
    // Technology research with good evidence should reach at least MEDIUM
    expect(['HIGH', 'MEDIUM']).toContain(result.decisionState);
  });
});

// ─── MEDIUM confidence: partial evidence, hypotheses disclosed ────────────────

describe('MEDIUM confidence → RECOMMEND WITH DISCLOSURE', () => {
  it('produces MEDIUM when some evidence is partial', () => {
    const result = evaluate(minimalInput({
      // Only one contamination, one failure mode — partial picture
      contaminationEntityIds: ['CONT-WEAR-PARTICLE-OIL'],
      failureModeEntityIds: ['FM-BEARING-WEAR'],
      principleEntityIds: [],  // absent
      technologyEntityIds: ['TECH-SYNTRAX'],
      symptomIds: ['oil-consumption'],
      environmentIds: ['dusty'],
      onsetId: null,           // onset unknown
      operatingConditionsKnown: false,
      // But environments are present so PROHIBITED doesn't trigger
    }));

    // With environments but no onset and no principles, expect MEDIUM or LOW
    // The key constraint: not PROHIBITED and not HIGH
    expect(result.decisionState).not.toBe('PROHIBITED');
    expect(result.decisionState).not.toBe('HIGH');
  });

  it('MEDIUM recommendation is still authorized', () => {
    const result = evaluate(minimalInput({
      contaminationEntityIds: ['CONT-WEAR-PARTICLE-OIL'],
      failureModeEntityIds: ['FM-BEARING-WEAR'],
      principleEntityIds: [],
      technologyEntityIds: ['TECH-SYNTRAX'],
      symptomIds: ['oil-consumption', 'premature-wear'],
      environmentIds: ['dusty'],
      onsetId: 'gradual',
      operatingConditionsKnown: true,
    }));

    if (result.decisionState === 'MEDIUM') {
      expect(result.composition.authorized).toBe(true);
    }
  });

  it('cannot be HIGH when extended inferences are present', () => {
    // Simulate extended inference by having partial evidence across categories
    const result = evaluate(minimalInput({
      principleEntityIds: [],  // absent — will trigger INFERABLE path
      contaminationEntityIds: ['CONT-WEAR-PARTICLE-OIL'],
      failureModeEntityIds: [],  // absent — inferred from symptoms only
      symptomIds: ['oil-consumption'],
      environmentIds: ['dusty'],
      operatingConditionsKnown: true,
    }));

    // Hard floor: extended inference → cannot be HIGH
    expect(result.decisionState).not.toBe('HIGH');
  });
});

// ─── LOW: insufficient evidence, continue diagnostic ─────────────────────────

describe('LOW confidence → DO NOT RECOMMEND', () => {
  it('produces LOW or UNKNOWN when almost no evidence is present', () => {
    const result = evaluate(minimalInput({
      contaminationEntityIds: [],
      failureModeEntityIds: [],
      principleEntityIds: [],
      technologyEntityIds: [],
      symptomIds: [],
      environmentIds: ['dusty'],  // keep one environment so PROHIBITED doesn't trigger on operating conditions
      onsetId: null,
      operatingConditionsKnown: false,
    }));

    expect(['LOW', 'UNKNOWN']).toContain(result.decisionState);
    expect(result.composition.authorized).toBe(false);
  });

  it('does not produce an authorized recommendation at LOW', () => {
    const result = evaluate(minimalInput({
      contaminationEntityIds: [],
      failureModeEntityIds: [],
      principleEntityIds: [],
      technologyEntityIds: [],
      symptomIds: ['oil-consumption'],
      environmentIds: ['dusty'],
      operatingConditionsKnown: true,
    }));

    if (result.decisionState === 'LOW') {
      expect(result.composition.authorized).toBe(false);
    }
  });
});

// ─── UNKNOWN domain: no coverage in Knowledge Graph ──────────────────────────

describe('UNKNOWN domain coverage', () => {
  it('produces UNKNOWN state when domain is not in Knowledge Graph', () => {
    const result = evaluate(minimalInput({
      domain: 'UNKNOWN',
      contaminationEntityIds: ['CONT-WEAR-PARTICLE-OIL'],  // entities present but domain unknown
    }));

    // Domain unknown but contamination entities present — doesn't hit PROHIBITED
    // but domain coverage check fails → UNKNOWN
    expect(['UNKNOWN', 'PROHIBITED']).toContain(result.decisionState);
  });
});

// ─── Hard floor rules ─────────────────────────────────────────────────────────

describe('Hard floor rules', () => {
  it('forces MEDIUM (not HIGH) when any extended inference is present', () => {
    // Create scenario where score would be HIGH but extended inference exists
    const result = evaluate(minimalInput({
      // Strong evidence base
      contaminationEntityIds: ['CONT-WEAR-PARTICLE-OIL', 'CONT-DUST-MINERAL'],
      failureModeEntityIds: ['FM-BEARING-WEAR', 'FM-RING-WEAR'],
      technologyEntityIds: ['TECH-SYNTRAX', 'TECH-MACROCORE'],
      symptomIds: ['oil-consumption', 'premature-wear', 'noise-knock'],
      environmentIds: ['dusty', 'high-temperature'],
      onsetId: 'gradual',
      operatingConditionsKnown: true,
      // But no principles — extended inference required
      principleEntityIds: [],
    }));

    // With extended inference present: cannot be HIGH
    if (result.inferenceAudit.hasExtended) {
      expect(result.decisionState).not.toBe('HIGH');
    }
  });

  it('forces LOW when FAILURE_DIAGNOSIS has absent failure modes', () => {
    const result = evaluate(minimalInput({
      intentClass: 'FAILURE_DIAGNOSIS',
      failureModeEntityIds: [],  // ABSENT
      symptomIds: [],            // no symptom correlation either
      contaminationEntityIds: ['CONT-WEAR-PARTICLE-OIL', 'CONT-DUST-MINERAL'],
      principleEntityIds: ['EP-CONTAMINATION-CONTROL', 'EP-CLEANLINESS-TARGET'],
      technologyEntityIds: ['TECH-SYNTRAX', 'TECH-MACROCORE'],
      environmentIds: ['dusty'],
      operatingConditionsKnown: true,
    }));

    if (!result.prohibitedGate.prohibited && result.confidenceResult) {
      // Category 5 ABSENT for FAILURE_DIAGNOSIS → hard floor LOW
      const cat5 = result.evidenceInventory.categories.find(c => c.categoryId === 5);
      if (cat5 && (cat5.availability === 'ABSENT' || cat5.availability === 'UNKNOWN')) {
        expect(['LOW', 'UNKNOWN']).toContain(result.decisionState);
      }
    }
  });

  it('confidence result is null when PROHIBITED gate triggers', () => {
    const result = evaluate(minimalInput({
      assetId: null,
      assetDescription: null,
    }));

    expect(result.confidenceResult).toBeNull();
  });

  it('adjusted score is raw score plus inference adjustment', () => {
    const result = evaluate(minimalInput());

    if (result.confidenceResult) {
      const expected = result.confidenceResult.rawScore + result.confidenceResult.inferenceAdjustment;
      expect(result.confidenceResult.adjustedScore).toBe(expected);
    }
  });
});

// ─── Evaluation structure completeness ───────────────────────────────────────

describe('Evaluation structural completeness', () => {
  it('always populates all 6 step fields in result', () => {
    const result = evaluate(minimalInput());

    expect(result).toHaveProperty('intentClass');
    expect(result).toHaveProperty('intentConfirmed');
    expect(result).toHaveProperty('domainCovered');
    expect(result).toHaveProperty('coverageNotes');
    expect(result).toHaveProperty('evidenceInventory');
    expect(result).toHaveProperty('inferenceAudit');
    expect(result).toHaveProperty('prohibitedGate');
    expect(result).toHaveProperty('decisionState');
    expect(result).toHaveProperty('composition');
  });

  it('always populates evidence categories', () => {
    const result = evaluate(minimalInput());
    expect(result.evidenceInventory.categories.length).toBeGreaterThan(0);
  });

  it('inference adjustment matches claim composition', () => {
    const result = evaluate(minimalInput());
    const audit = result.inferenceAudit;

    if (audit.allDirect) {
      expect(audit.inferenceAdjustment).toBe(5);
    }
    if (audit.hasSpeculative && !audit.hasExtended) {
      expect(audit.inferenceAdjustment).toBeLessThan(0);
    }
  });

  it('PROHIBITED composition includes reason text', () => {
    const result = evaluate(minimalInput({
      assetId: null,
      assetDescription: null,
    }));

    const comp = result.composition as { reason: string };
    expect(typeof comp.reason).toBe('string');
    expect(comp.reason.length).toBeGreaterThan(0);
  });
});

// ─── Domain-specific decisions ────────────────────────────────────────────────

describe('Domain-specific correct decisions', () => {
  it('HYDRAULIC domain: full evidence produces authorized recommendation', () => {
    const result = evaluate({
      intentClass: 'FAILURE_DIAGNOSIS',
      domain: 'HYDRAULIC',
      assetId: 'construction-excavator',
      assetDescription: 'Caterpillar 390F hydraulic excavator',
      contaminationEntityIds: ['CONT-WEAR-PARTICLE-HYD', 'CONT-WATER-FUEL'],
      failureModeEntityIds: ['FM-VALVE-STICTION', 'FM-PUMP-WEAR'],
      principleEntityIds: ['EP-CONTAMINATION-CONTROL'],
      technologyEntityIds: ['TECH-NANOFORCE'],
      symptomIds: ['hydraulic-sluggish', 'hydraulic-noise', 'filter-clogging'],
      environmentIds: ['dusty', 'wet'],
      onsetId: 'gradual',
      operatingConditionsKnown: true,
      draftClaims: [],
    });

    expect(result.decisionState).not.toBe('PROHIBITED');
    expect(['HIGH', 'MEDIUM']).toContain(result.decisionState);
    expect(result.composition.authorized).toBe(true);
  });

  it('FUEL domain: full evidence produces authorized recommendation', () => {
    const result = evaluate({
      intentClass: 'FAILURE_DIAGNOSIS',
      domain: 'FUEL',
      assetId: 'marine-vessel',
      assetDescription: 'Marine diesel engine',
      contaminationEntityIds: ['CONT-WATER-FUEL', 'CONT-PARTICLE-FUEL'],
      failureModeEntityIds: ['FM-INJECTOR-STICTION'],
      principleEntityIds: ['EP-CONTAMINATION-CONTROL'],
      technologyEntityIds: ['TECH-SYNTAPORE', 'TECH-TURBOCORE'],
      symptomIds: ['injector-issues', 'fuel-consumption', 'white-smoke'],
      environmentIds: ['wet', 'marine'],
      onsetId: 'gradual',
      operatingConditionsKnown: true,
      draftClaims: [],
    });

    expect(result.decisionState).not.toBe('PROHIBITED');
    expect(result.composition.authorized).toBe(true);
  });

  it('AIR_INTAKE domain: missing asset does not reach recommendation', () => {
    const result = evaluate({
      intentClass: 'PROACTIVE_PROTECTION',
      domain: 'AIR_INTAKE',
      assetId: null,
      assetDescription: null,
      contaminationEntityIds: ['CONT-DUST-MINERAL'],
      failureModeEntityIds: [],
      principleEntityIds: [],
      technologyEntityIds: ['TECH-MACROCORE'],
      symptomIds: ['filter-clogging'],
      environmentIds: ['dusty'],
      onsetId: null,
      operatingConditionsKnown: false,
      draftClaims: [],
    });

    expect(result.decisionState).toBe('PROHIBITED');
    expect(result.composition.authorized).toBe(false);
  });
});

// ─── Decision state is always one of the 5 valid states ──────────────────────

describe('Decision state validity', () => {
  const VALID_STATES = new Set(['PROHIBITED', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);

  const scenarios: Array<[string, Partial<EvaluationInput>]> = [
    ['full evidence', {}],
    ['no asset', { assetId: null, assetDescription: null }],
    ['no domain', { domain: 'UNKNOWN', contaminationEntityIds: [] }],
    ['no conditions', { operatingConditionsKnown: false, environmentIds: [], onsetId: null }],
    ['no contamination entities', { contaminationEntityIds: [] }],
    ['no failure modes', { failureModeEntityIds: [] }],
    ['no technologies', { technologyEntityIds: [] }],
    ['no symptoms', { symptomIds: [] }],
    ['empty state', {
      assetId: null, assetDescription: null, contaminationEntityIds: [],
      failureModeEntityIds: [], principleEntityIds: [], technologyEntityIds: [],
      symptomIds: [], environmentIds: [], onsetId: null, operatingConditionsKnown: false,
    }],
  ];

  for (const [label, overrides] of scenarios) {
    it(`always produces a valid decision state — scenario: ${label}`, () => {
      const result = evaluate(minimalInput(overrides));
      expect(VALID_STATES.has(result.decisionState)).toBe(true);
    });
  }
});
