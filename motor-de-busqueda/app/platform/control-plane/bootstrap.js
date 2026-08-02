import { featureFlags } from './flags/server';
import { rollout } from './rollout/engine';
import { cache } from './cache/memory';
import { observability } from './observability/exporter';

export function bootstrapPlatform() {
  return {
    flags: featureFlags,
    rollout,
    cache,
    observability
  };
}
