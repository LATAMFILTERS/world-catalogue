#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { claimWeeklyRun, completeWeeklyRun, failWeeklyRun } from './hermes-ha-control.mjs';

const NODE_ID = process.env.ELIM_RUNTIME_NODE || 'RENDER';
const ROLE = process.env.ELIM_RUNTIME_ROLE || 'FAILOVER';

function run(command, args, { optional = false } = {}) {
  console.log(`[hermes-failover] running: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env, shell: false });
  if (result.status !== 0 && !optional) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }
  return result.status === 0;
}

async function main() {
  process.env.ELIM_RUNTIME_NODE = NODE_ID;
  process.env.ELIM_RUNTIME_ROLE = ROLE;
  process.env.ELIM_DOMAIN = process.env.ELIM_DOMAIN || 'WORLD_CATALOGUE';
  process.env.ELIM_SCHEDULER_ENABLED = 'true';
  process.env.HERMES_EMAIL_PROVIDER = process.env.HERMES_EMAIL_PROVIDER || 'outlook';
  process.env.HERMES_EMAIL_LIVE = 'true';
  process.env.HERMES_COLLECTION_DRY_RUN = 'false';
  process.env.HERMES_BASELINE_MODE = 'false';
  process.env.HERMES_GROQ_MODEL = process.env.HERMES_GROQ_MODEL || 'groq/compound';

  const claim = await claimWeeklyRun({ nodeId: NODE_ID, role: ROLE, leaseHours: 6 });
  console.log('[hermes-failover] lease', JSON.stringify(claim));
  if (!claim.claimed) {
    console.log(`[hermes-failover] STANDBY: ${claim.reason}`);
    return;
  }

  try {
    run('npm', ['run', 'hermes:baseline:restore']);
    run('npm', ['run', 'hermes:harvest:restore'], { optional: true });
    run('npm', ['run', 'hermes:collect']);
    run('npm', ['run', 'hermes:harvest:persist'], { optional: true });
    run('npm', ['run', 'hermes:sweep']);
    run('npm', ['run', 'hermes:research']);
    run('npm', ['run', 'hermes:validate:real']);
    run('npm', ['run', 'hermes:report:real']);
    run('node', ['scripts/hermes/send-weekly-email-actions.mjs', 'hermes/reports']);

    await completeWeeklyRun({ nodeId: NODE_ID });
    run('node', ['scripts/hermes/weekly-send-guard.mjs', 'mark'], { optional: true });
    console.log('[hermes-failover] COMPLETED: Render delivered the weekly HERMES run under HA lease.');
  } catch (error) {
    await failWeeklyRun({ nodeId: NODE_ID, error: error.message });
    console.error('[hermes-failover] FAILED', error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[hermes-failover] fatal', error);
  process.exitCode = 1;
});
