'use strict';

const { spawnSync } = require('child_process');

const APPLY = process.argv.includes('--apply');

function run(label, args, { allowFailure = false } = {}) {
  console.log('\n=== ' + label + ' ===');
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(label + ' failed with exit code ' + result.status);
  }
  return result.status || 0;
}

function main() {
  if (!process.env.CATALOG_DATABASE_URL && !process.env.DATABASE_URL) {
    throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  }

  console.log(JSON.stringify({
    workflow: 'CATALOG_COMPLETENESS_RECOVERY_V1',
    mode: APPLY ? 'APPLY' : 'DRY_RUN',
    steps: [
      'restore EF95112 through governed migration',
      'repair exact Donaldson matches from local official captures',
      'run read-only completeness audit'
    ]
  }, null, 2));

  const efArgs = ['scripts/migrations/run_115_create_ef95112_fleetguard_ff5112.js'];
  if (APPLY) efArgs.push('--apply');
  const efStatus = run('EF95112 GOVERNED RESTORE', efArgs, { allowFailure: true });

  const repairArgs = ['scripts/repair-catalog-completeness-from-donaldson.js'];
  if (APPLY) repairArgs.push('--apply');
  run('DONALDSON COMPLETENESS REPAIR', repairArgs);

  run('FINAL READ-ONLY COMPLETENESS AUDIT', [
    'scripts/audit-catalog-governance-daily.js',
    '--completeness'
  ]);

  if (efStatus !== 0) {
    console.warn('\nEF95112 restore returned a non-zero status. Donaldson repair and final audit still completed; inspect the EF95112 step above.');
  }

  console.log('\n=== CATALOG COMPLETENESS RECOVERY FINISHED ===');
}

try {
  main();
} catch (error) {
  console.error('[catalog-completeness-recovery] failed', error.stack || error.message);
  process.exit(1);
}
