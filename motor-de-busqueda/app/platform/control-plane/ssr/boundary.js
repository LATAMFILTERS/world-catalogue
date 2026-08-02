import { cache } from '../cache/memory';
import { featureFlags } from '../flags/server';

export function renderWithBoundary(key, renderFn) {
  if (featureFlags.isEnabled('edge_render')) {
    return cache.get(key) || cache.set(key, renderFn(), 3000);
  }

  return renderFn();
}
