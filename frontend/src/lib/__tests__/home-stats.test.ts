import { describe, it, expect } from 'vitest';
import { getHomeStats } from '../home-stats';

describe('getHomeStats', () => {
  it('derives industries and technologies counts from the real catalogue', () => {
    const stats = getHomeStats();
    const industries = stats.find((s) => s.id === 'industries');
    const technologies = stats.find((s) => s.id === 'technologies');
    expect(industries?.value).toBeGreaterThan(0);
    expect(technologies?.value).toBeGreaterThan(0);
  });

  it('returns exactly 4 stats in a fixed order', () => {
    const stats = getHomeStats();
    expect(stats.map((s) => s.id)).toEqual(['industries', 'technologies', 'systems', 'resources']);
  });

  it('includes the static systems and resources figures with their source note', () => {
    const stats = getHomeStats();
    const systems = stats.find((s) => s.id === 'systems');
    const resources = stats.find((s) => s.id === 'resources');
    expect(systems).toEqual({ id: 'systems', value: 5, suffix: '', label: 'Protection Systems' });
    expect(resources).toEqual({ id: 'resources', value: 105, suffix: '+', label: 'Knowledge Center Resources' });
  });
});
