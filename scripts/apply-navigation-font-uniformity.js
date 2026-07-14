const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'frontend',
  'src',
  'components',
  'Navigation.tsx'
);

try {
  let source = fs.readFileSync(filePath, 'utf8');

  const desktopOld = `          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          fontWeight: 600,
          letterSpacing: '0.025em',`;

  const desktopNew = `          fontFamily: 'var(--font-display)',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',`;

  const mobileOld = `  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  fontWeight: 600,
  letterSpacing: '0.025em',`;

  const mobileNew = `  fontFamily: 'var(--font-display)',
  fontSize: '0.9rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',`;

  let changed = false;

  if (source.includes(desktopOld)) {
    source = source.replace(desktopOld, desktopNew);
    changed = true;
  }

  if (source.includes(mobileOld)) {
    source = source.replace(mobileOld, mobileNew);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, source, 'utf8');
    console.log('[navigation] header links now match FIND MY FILTER typography without background');
  } else if (
    source.includes("fontFamily: 'var(--font-display)'") &&
    source.includes("textTransform: 'uppercase'")
  ) {
    console.log('[navigation] typography already uniform');
  } else {
    throw new Error('Navigation typography target was not found');
  }
} catch (error) {
  console.error('[navigation] failed:', error.message);
  process.exitCode = 1;
}
