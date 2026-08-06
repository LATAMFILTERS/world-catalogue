import flags from './flags/flags.json';
import experiments from './ab/experiments.json';
import { track, trackError } from './telemetry';
import { rollbackStrategy } from './rollback';

let errorCount = 0;

export function resolveFeature(key) {
  return flags.flags[key];
}

export function runExperiment(name) {
  return experiments.experiments.find(e => e.name === name);
}

export function safeExecute(fn, context) {
  try {
    track('execute:start', context);
    const result = fn();
    track('execute:success', context);
    return result;
  } catch (err) {
    errorCount++;
    trackError(err, context);

    if (rollbackStrategy.shouldRollback(errorCount)) {
      rollbackStrategy.executeRollback();
    }

    return null;
  }
}
