import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const full = process.argv.includes('--full');

function run(command, args, cwd = root) {
  console.log(`> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(process.execPath, ['scripts/validate-canonical-taxonomy.mjs']);
run(process.execPath, ['scripts/validate-legacy-catalogue-dependency.mjs']);
run(process.execPath, ['--test', 'tests/canonical-technology-registry.test.js']);

if (full) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  run(npm, ['run', 'type-check'], path.join(root, 'frontend'));
  run(npm, ['run', 'build'], path.join(root, 'frontend'));
}

console.log(full
  ? 'Manual pre-merge validation passed, including frontend type-check and build.'
  : 'Manual canonical pre-merge validation passed. Use --full to include frontend type-check and build.'
);
