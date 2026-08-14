import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const full = process.argv.includes('--full');

function run(command, args, cwd = root) {
  console.log(`> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function runNpm(args, cwd) {
  if (process.platform === 'win32') {
    const comspec = process.env.ComSpec || 'cmd.exe';
    const command = ['npm', ...args].join(' ');
    run(comspec, ['/d', '/s', '/c', command], cwd);
    return;
  }
  run('npm', args, cwd);
}

run(process.execPath, ['scripts/validate-canonical-taxonomy.mjs']);
run(process.execPath, ['scripts/validate-legacy-catalogue-dependency.mjs']);
run(process.execPath, [
  '--test',
  'tests/canonical-technology-registry.test.js',
  'tests/canonical-cooling-taxonomy.test.js',
  'tests/omnichannel-canonical-taxonomy.test.js',
  'tests/i18n-crawler-ssr.test.js',
  'tests/canonical-url-policy.test.js',
  'tests/citation-core-technology-notes.test.js',
  'tests/citation-api-generation-policy.test.js',
  'tests/structured-data-evidence-policy.test.js',
]);

if (full) {
  const frontend = path.join(root, 'frontend');
  runNpm(['run', 'type-check'], frontend);
  runNpm(['run', 'build'], frontend);
}

console.log(full
  ? 'Manual pre-merge validation passed, including canonical taxonomy, citation-grade core technologies, clean Citation API generation, evidence-governed structured data, canonical URL policy, crawler-visible i18n, frontend type-check and build.'
  : 'Manual canonical pre-merge validation passed. Use --full to include frontend type-check and build.'
);
