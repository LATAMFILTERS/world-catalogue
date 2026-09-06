#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repo = process.cwd();
const runnerPath = path.join(repo, 'scripts', 'hermes', 'windows', 'Invoke-HermesLocal.ps1');
const source = fs.readFileSync(runnerPath, 'utf8');

const checks = [
  ['operational certification function exists', /function\s+Invoke-OperationalCertification/i],
  ['operational certification runs in finally', /finally\s*\{[\s\S]*Invoke-OperationalCertification/i],
  ['recovery failure checkpoint persists exact stage', /failed\s*=\s*@\(\$Stage\)/i],
  ['recovery halts on sweep failure', /if\s*\(\s*-not\s+\$status\.sweep\s*\)\s*\{\s*Stop-RecoveryAtFailure\s+'sweep'/i],
  ['recovery halts on research failure', /if\s*\(\s*-not\s+\$status\.research\s*\)\s*\{\s*Stop-RecoveryAtFailure\s+'research'/i],
  ['recovery halts on validate failure', /if\s*\(\s*-not\s+\$status\.validate\s*\)\s*\{\s*Stop-RecoveryAtFailure\s+'validate'/i],
  ['recovery halts on report failure', /if\s*\(\s*-not\s+\$status\.report\s*\)\s*\{\s*Stop-RecoveryAtFailure\s+'report'/i],
  ['weekly can attempt email independently', /\$Mode\s+-eq\s+'Weekly'[\s\S]*\$emailAttempted=\$true/i],
  ['recovery final email requires complete pipeline', /\(\(\$plan\s+-contains\s+'email'\)\s+-and\s+\$complete\)/i],
  ['pending removed only after complete plus email success', /if\(\$complete\s+-and\s+\$status\.email\)\s*\{\s*Remove-Item\s+\$pendingPath/i],
  ['fatal path persists pending', /RECOVERY PENDING persisted after fatal error/i],
  ['collection remains dry-run', /HERMES_COLLECTION_DRY_RUN='true'/i]
];

let failed = 0;
for (const [name, pattern] of checks) {
  const ok = pattern.test(source);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed++;
}

if (failed) {
  console.error(`[HERMES runner contract] failed=${failed}/${checks.length}`);
  process.exit(1);
}
console.log(`[HERMES runner contract] PASS ${checks.length}/${checks.length}`);
