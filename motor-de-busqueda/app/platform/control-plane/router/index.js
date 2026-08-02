import { featureFlags } from '../flags/server';
import { rollout } from '../rollout/engine';

export function route(request) {
  const userId = request.userId || 'anonymous';

  if (rollout.evaluate('home_redesign', userId)) {
    return '/home/v2';
  }

  if (featureFlags.isEnabled('home_redesign')) {
    return '/home/new';
  }

  return '/home/classic';
}
