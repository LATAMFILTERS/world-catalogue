import { bus } from '../bus/eventBus';
import { store } from '../state/graph';
import { scheduler } from '../scheduler';
import { initObservability } from '../observability';

export function bootstrapFOS() {
  initObservability();

  bus.on('state:update', (state) => {
    store.set('lastEvent', Date.now());
  });

  return {
    bus,
    store,
    scheduler
  };
}
