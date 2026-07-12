/**
 * calculators.test.ts
 * Unit tests for ELIMFILTERS KC Engineering Calculator engine functions.
 *
 * Each test group covers: known pairs, invertibility, edge cases, no NaN/Infinity leaks.
 * All formulae are derived from published standards (ISO, SAE, ASTM).
 */

import { describe, it, expect } from 'vitest';
import {
  iso4406RangeCode,
  iso4406CodeToRange,
  countsToIso4406Code,
  iso4406CodeToString,
  betaToEfficiency,
  efficiencyToBeta,
  pressureDropEstimate,
  dhcEstimate,
  intervalFromDhc,
  AIR_SERVICE_LIMIT_PA,
  airFilterRemainingLife,
  getCleanlinessTarget,
  evaluateCleanliness,
  getIngestionRate,
  getDefaultSafetyFactor,
  serviceInterval,
} from '../calculator-engines';

// ── 6A-01: ISO 4406 Cleanliness Code ─────────────────────────────────────────

describe('iso4406RangeCode', () => {
  it('returns 0 for count <= 0', () => {
    expect(iso4406RangeCode(0)).toBe(0);
    expect(iso4406RangeCode(-1)).toBe(0);
  });

  it('returns 1 for count = 1', () => {
    expect(iso4406RangeCode(1)).toBe(1);
  });

  it('returns code 14 for count = 10 000', () => {
    // 2^13 = 8192, 2^14 = 16384; 10000 in (8192, 16384] → code 14
    expect(iso4406RangeCode(10_000)).toBe(14);
  });

  it('returns code 17 for count = 80 000', () => {
    // 2^16 = 65536, 2^17 = 131072; 80000 in (65536, 131072] → code 17
    expect(iso4406RangeCode(80_000)).toBe(17);
  });

  it('returns code 20 for count = 1 000 000', () => {
    // 2^19 = 524288, 2^20 = 1048576; 1000000 in (524288, 1048576] → code 20
    expect(iso4406RangeCode(1_000_000)).toBe(20);
  });

  it('returns correct code for exact power of 2', () => {
    // count = 2^N → range (2^(N-1), 2^N] → code N
    expect(iso4406RangeCode(16)).toBe(4);
    expect(iso4406RangeCode(1024)).toBe(10);
  });

  it('returns 0 for NaN or Infinity input', () => {
    expect(iso4406RangeCode(NaN)).toBe(0);
    expect(iso4406RangeCode(Infinity)).toBe(0);
  });
});

describe('iso4406CodeToRange', () => {
  it('returns {0, 0} for code <= 0', () => {
    expect(iso4406CodeToRange(0)).toEqual({ min: 0, max: 0 });
    expect(iso4406CodeToRange(-5)).toEqual({ min: 0, max: 0 });
  });

  it('returns {0, 1} for code = 1', () => {
    expect(iso4406CodeToRange(1)).toEqual({ min: 0, max: 1 });
  });

  it('returns correct range for code 14', () => {
    expect(iso4406CodeToRange(14)).toEqual({ min: 8192, max: 16384 });
  });

  it('returns correct range for code 20', () => {
    expect(iso4406CodeToRange(20)).toEqual({ min: 524288, max: 1048576 });
  });
});

describe('countsToIso4406Code + iso4406CodeToString', () => {
  it('converts a sample particle count set to correct code string', () => {
    // c4=80000 → 17, c6=10000 → 14, c14=100 → 7
    const code = countsToIso4406Code({ c4: 80_000, c6: 10_000, c14: 100 });
    expect(code).toEqual({ n4: 17, n6: 14, n14: 7 });
    expect(iso4406CodeToString(code)).toBe('17/14/7');
  });

  it('produces hydraulic servo-valve target string 16/14/11', () => {
    // 2^15<count≤2^16 for c4=40000, 2^13<c6=10000≤2^14, 2^10<c14=1000≤2^11
    const code = countsToIso4406Code({ c4: 40_000, c6: 10_000, c14: 1_000 });
    expect(iso4406CodeToString(code)).toBe('16/14/10');
    // c14=1024 gives exactly code 10; use 1100 for 11
    const code2 = countsToIso4406Code({ c4: 40_000, c6: 10_000, c14: 1_100 });
    expect(code2.n14).toBe(11);
  });
});

// ── 6A-02: Beta Ratio ⇄ Efficiency ───────────────────────────────────────────

describe('betaToEfficiency', () => {
  it('returns 0 for beta <= 1', () => {
    expect(betaToEfficiency(1)).toBe(0);
    expect(betaToEfficiency(0.5)).toBe(0);
  });

  it('returns 50% for beta = 2', () => {
    expect(betaToEfficiency(2)).toBeCloseTo(50, 5);
  });

  it('returns 75% for beta = 4', () => {
    expect(betaToEfficiency(4)).toBeCloseTo(75, 5);
  });

  it('returns 99% for beta = 100', () => {
    expect(betaToEfficiency(100)).toBeCloseTo(99, 5);
  });

  it('returns 99.9% for beta = 1000', () => {
    expect(betaToEfficiency(1000)).toBeCloseTo(99.9, 3);
  });

  it('returns 0 for NaN / non-finite input', () => {
    expect(betaToEfficiency(NaN)).toBe(0);
  });
});

describe('efficiencyToBeta', () => {
  it('returns 1 for efficiency < 0', () => {
    expect(efficiencyToBeta(-5)).toBe(1);
  });

  it('returns Infinity for efficiency = 100', () => {
    expect(efficiencyToBeta(100)).toBe(Infinity);
  });

  it('returns 2 for efficiency = 50%', () => {
    expect(efficiencyToBeta(50)).toBeCloseTo(2, 5);
  });

  it('returns 100 for efficiency = 99%', () => {
    expect(efficiencyToBeta(99)).toBeCloseTo(100, 5);
  });

  it('is the inverse of betaToEfficiency', () => {
    for (const beta of [2, 5, 10, 75, 200, 1000]) {
      const eff = betaToEfficiency(beta);
      expect(efficiencyToBeta(eff)).toBeCloseTo(beta, 4);
    }
  });
});

// ── 6A-03: Pressure Drop Estimator ───────────────────────────────────────────

describe('pressureDropEstimate', () => {
  it('returns 0 when QRef or muRef is 0', () => {
    expect(pressureDropEstimate(100, 50, 0, 32, 32)).toBe(0);
    expect(pressureDropEstimate(100, 50, 50, 32, 0)).toBe(0);
  });

  it('returns reference dP when Q=QRef and mu=muRef', () => {
    expect(pressureDropEstimate(200, 50, 50, 32, 32)).toBeCloseTo(200, 5);
  });

  it('doubles dP when flow doubles at same viscosity', () => {
    expect(pressureDropEstimate(100, 100, 50, 32, 32)).toBeCloseTo(200, 5);
  });

  it('doubles dP when viscosity doubles at same flow', () => {
    expect(pressureDropEstimate(100, 50, 50, 64, 32)).toBeCloseTo(200, 5);
  });

  it('scales proportionally with both Q and mu changes', () => {
    // dP_ref=100, Q=75, QRef=50, mu=48, muRef=32
    // Expected: 100 * (75/50) * (48/32) = 100 * 1.5 * 1.5 = 225
    expect(pressureDropEstimate(100, 75, 50, 48, 32)).toBeCloseTo(225, 5);
  });

  it('returns finite positive value for all positive inputs', () => {
    const result = pressureDropEstimate(350, 120, 100, 46, 32);
    expect(isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });
});

// ── 6A-04: DHC Planning Estimator ────────────────────────────────────────────

describe('dhcEstimate', () => {
  it('returns correct range for cellulose 1 m²', () => {
    const { min, max, mid } = dhcEstimate(1, 'cellulose');
    expect(min).toBe(50);
    expect(max).toBe(150);
    expect(mid).toBe(100);
  });

  it('returns correct range for synthetic 2 m²', () => {
    const { min, max, mid } = dhcEstimate(2, 'synthetic');
    expect(min).toBe(200);
    expect(max).toBe(600);
    expect(mid).toBe(400);
  });

  it('returns correct range for glass-fiber 0.5 m²', () => {
    const { min, max, mid } = dhcEstimate(0.5, 'glass-fiber');
    expect(min).toBe(75);
    expect(max).toBe(200);
    expect(mid).toBeCloseTo(137.5, 5);
  });

  it('mid is always between min and max', () => {
    for (const type of ['cellulose', 'synthetic', 'glass-fiber'] as const) {
      const { min, max, mid } = dhcEstimate(1.5, type);
      expect(mid).toBeGreaterThan(min);
      expect(mid).toBeLessThan(max);
    }
  });
});

describe('intervalFromDhc', () => {
  it('returns 0 when cIn or flow is 0', () => {
    expect(intervalFromDhc(100, 0, 50)).toBe(0);
    expect(intervalFromDhc(100, 1, 0)).toBe(0);
  });

  it('calculates correct interval for known values', () => {
    // DHC=300g, cIn=1 mg/L, Q=50 L/min → 300/(1*50*60) = 0.1 h
    expect(intervalFromDhc(300, 1, 50)).toBeCloseTo(0.1, 5);
  });

  it('returns positive finite value for realistic inputs', () => {
    // DHC=200g, cIn=0.15 mg/L, Q=80 L/min → 200/(0.15*80*60) ≈ 0.278 h
    const result = intervalFromDhc(200, 0.15, 80);
    expect(isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });

  it('scales linearly with DHC', () => {
    const i1 = intervalFromDhc(100, 1, 50);
    const i2 = intervalFromDhc(200, 1, 50);
    expect(i2).toBeCloseTo(i1 * 2, 8);
  });
});

// ── 6A-05: Air Filter Restriction ────────────────────────────────────────────

describe('AIR_SERVICE_LIMIT_PA', () => {
  it('is 625 Pa (SAE J1539)', () => {
    expect(AIR_SERVICE_LIMIT_PA).toBe(625);
  });
});

describe('airFilterRemainingLife', () => {
  it('returns 100% when dPCurrent equals dPClean', () => {
    expect(airFilterRemainingLife(100, 100)).toBeCloseTo(100, 5);
  });

  it('returns 0% when dPCurrent equals service limit', () => {
    expect(airFilterRemainingLife(625, 100)).toBeCloseTo(0, 5);
  });

  it('returns 50% when dPCurrent is at midpoint', () => {
    // dPClean=125, limit=625, usable=500, midpoint=375
    expect(airFilterRemainingLife(375, 125)).toBeCloseTo(50, 5);
  });

  it('never returns less than 0', () => {
    expect(airFilterRemainingLife(700, 100)).toBe(0);
  });

  it('never returns more than 100', () => {
    expect(airFilterRemainingLife(50, 100)).toBe(100);
  });

  it('returns 0 when dPClean >= service limit', () => {
    expect(airFilterRemainingLife(625, 625)).toBe(0);
    expect(airFilterRemainingLife(625, 700)).toBe(0);
  });

  it('returns decreasing life as dPCurrent increases', () => {
    const l1 = airFilterRemainingLife(200, 100);
    const l2 = airFilterRemainingLife(300, 100);
    expect(l1).toBeGreaterThan(l2);
  });
});

// ── 6A-06: Fluid Cleanliness Evaluator ───────────────────────────────────────

describe('getCleanlinessTarget', () => {
  it('returns correct target for servo-valve: 16/14/11', () => {
    const t = getCleanlinessTarget('servo-valve');
    expect(t).toEqual({ n4: 16, n6: 14, n14: 11 });
  });

  it('returns correct target for cylinder: 20/18/15', () => {
    const t = getCleanlinessTarget('cylinder');
    expect(t).toEqual({ n4: 20, n6: 18, n14: 15 });
  });

  it('returns progressively stricter targets for more sensitive components', () => {
    const sv = getCleanlinessTarget('servo-valve');
    const pv = getCleanlinessTarget('proportional-valve');
    const cy = getCleanlinessTarget('cylinder');
    expect(sv.n4).toBeLessThan(pv.n4);
    expect(pv.n4).toBeLessThan(cy.n4);
  });
});

describe('evaluateCleanliness', () => {
  it('reports compliant when current matches target exactly', () => {
    const target = getCleanlinessTarget('servo-valve');
    const result = evaluateCleanliness(target, 'servo-valve');
    expect(result.compliant).toBe(true);
    expect(result.delta).toEqual({ n4: 0, n6: 0, n14: 0 });
  });

  it('reports non-compliant when any channel exceeds target', () => {
    const result = evaluateCleanliness(
      { n4: 18, n6: 14, n14: 11 },
      'servo-valve',
    );
    expect(result.compliant).toBe(false);
    expect(result.delta.n4).toBe(2);
  });

  it('calculates reduction ratios as 2^delta', () => {
    const result = evaluateCleanliness(
      { n4: 19, n6: 16, n14: 11 },
      'servo-valve',   // target 16/14/11
    );
    // n4 delta=3 → ratio=8; n6 delta=2 → ratio=4; n14 delta=0 → ratio=1
    expect(result.reductionRatios.n4).toBeCloseTo(8, 5);
    expect(result.reductionRatios.n6).toBeCloseTo(4, 5);
    expect(result.reductionRatios.n14).toBe(1);
  });

  it('sets reduction ratio to 1 when channel is within target', () => {
    const result = evaluateCleanliness(
      { n4: 16, n6: 14, n14: 9 },
      'servo-valve',
    );
    expect(result.reductionRatios.n14).toBe(1);
  });
});

// ── 6A-07: Service Interval Engineering ──────────────────────────────────────

describe('getIngestionRate', () => {
  it('returns correct typical rate for construction: 2.0 mg/L', () => {
    expect(getIngestionRate('construction').typical).toBe(2.0);
  });

  it('returns correct typical rate for agriculture: 0.8 mg/L', () => {
    expect(getIngestionRate('agriculture').typical).toBe(0.8);
  });

  it('returns correct typical rate for industrial: 0.15 mg/L', () => {
    expect(getIngestionRate('industrial').typical).toBe(0.15);
  });

  it('min < typical < max for every environment', () => {
    for (const env of ['construction', 'agriculture', 'industrial'] as const) {
      const r = getIngestionRate(env);
      expect(r.min).toBeLessThan(r.typical);
      expect(r.typical).toBeLessThan(r.max);
    }
  });
});

describe('getDefaultSafetyFactor', () => {
  it('returns 0.65 for construction', () => {
    expect(getDefaultSafetyFactor('construction')).toBe(0.65);
  });

  it('returns 0.75 for agriculture', () => {
    expect(getDefaultSafetyFactor('agriculture')).toBe(0.75);
  });

  it('returns 0.85 for industrial', () => {
    expect(getDefaultSafetyFactor('industrial')).toBe(0.85);
  });
});

describe('serviceInterval', () => {
  it('returns 0 when cIn, flow, or safetyFactor is 0', () => {
    expect(serviceInterval(200, 0, 50, 0.75)).toBe(0);
    expect(serviceInterval(200, 1, 0, 0.75)).toBe(0);
    expect(serviceInterval(200, 1, 50, 0)).toBe(0);
  });

  it('calculates correct interval for known inputs', () => {
    // DHC=200g, cIn=0.8 mg/L, Q=50 L/min, Sf=0.75
    // I = (200 × 0.75) / (0.8 × 50 × 60) = 150 / 2400 = 0.0625 h
    expect(serviceInterval(200, 0.8, 50, 0.75)).toBeCloseTo(0.0625, 6);
  });

  it('scales linearly with DHC', () => {
    const i1 = serviceInterval(100, 1, 50, 0.75);
    const i2 = serviceInterval(200, 1, 50, 0.75);
    expect(i2).toBeCloseTo(i1 * 2, 8);
  });

  it('scales linearly with safetyFactor', () => {
    const i1 = serviceInterval(200, 1, 50, 0.5);
    const i2 = serviceInterval(200, 1, 50, 1.0);
    expect(i2).toBeCloseTo(i1 * 2, 8);
  });

  it('returns finite positive value for realistic construction scenario', () => {
    // DHC=300g, cIn=2.0 mg/L, Q=80 L/min, Sf=0.65
    const result = serviceInterval(300, 2.0, 80, 0.65);
    expect(isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });

  it('serviceInterval equals intervalFromDhc × safetyFactor', () => {
    const dhc = 250, cIn = 1.5, flow = 60, sf = 0.75;
    const raw = intervalFromDhc(dhc, cIn, flow);
    const safe = serviceInterval(dhc, cIn, flow, sf);
    expect(safe).toBeCloseTo(raw * sf, 8);
  });
});
