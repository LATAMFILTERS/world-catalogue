import { describe, it, expect } from 'vitest';
import { TECHNOLOGY_ARCHITECTURES } from '../technology-architectures';
import { performanceProfileErrors, runAllValidations } from '../validation';
import type { PerformanceProfileEntry } from '../registry-types';
import { buildKnowledgeGraph, validateGraph } from '../../graph';

describe('Foundation performance evidence semantics', () => {
  it('all Foundation checks and graph checks pass with explicit evidence requirements', () => {
    const report=runAllValidations();
    expect(report.results.filter(x=>!x.passed).map(x=>({check:x.checkName,errors:x.errors}))).toEqual([]);
    expect(validateGraph(buildKnowledgeGraph()).passed).toBe(true);
  });
  it('nine previously empty profiles declare verification, not measured performance', () => {
    const profiles=Object.values(TECHNOLOGY_ARCHITECTURES).flatMap(x=>x.performanceProfile);
    const requirements=profiles.filter(x=>'kind' in x&&x.kind==='VERIFICATION_REQUIREMENT');
    expect(requirements).toHaveLength(9);
    for(const requirement of requirements)expect(performanceProfileErrors([requirement])).toEqual([]);
  });
  it('still rejects missing component data', () => {
    expect(performanceProfileErrors([])).not.toEqual([]);
  });
  it('rejects an invented numerical result disguised as a verification requirement', () => {
    const entry=Object.values(TECHNOLOGY_ARCHITECTURES).flatMap(x=>x.performanceProfile).find(x=>'kind' in x)!;
    expect(performanceProfileErrors([{...entry,value:'Guaranteed efficiency exceeds 99.9 percent in all engine applications.'}])).not.toEqual([]);
  });
  it('rejects a pending profile presented with a measured-performance unit', () => {
    const entry=Object.values(TECHNOLOGY_ARCHITECTURES).flatMap(x=>x.performanceProfile).find(x=>'kind' in x)!;
    expect(performanceProfileErrors([{...entry,unit:'%'} as PerformanceProfileEntry])).not.toEqual([]);
  });
  it('still requires provenance for performance claims', () => {
    expect(performanceProfileErrors([{metric:'Efficiency',value:'99',unit:'%',evidenceSource:''}])).not.toEqual([]);
  });
});
