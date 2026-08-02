import { bus } from '../bus/eventBus';

export function initObservability() {
  bus.on('module:registered', (e) => {
    console.log('[OBS] module registered', e);
  });

  bus.on('module:swapped', (e) => {
    console.log('[OBS] module swapped', e);
  });

  bus.on('state:update', (e) => {
    console.log('[OBS] state changed', e);
  });
}
