const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'frontend',
  'src',
  'app',
  'about',
  'page.tsx'
);

const oldBlock = `            <p style={eyebrow}>WHO WE ARE</p>
            <h2 style={sectionTitle}>A protection company built around equipment reliability.</h2>`;

const newBlock = `            <h2
              style={{
                ...sectionTitle,
                fontSize: 'clamp(2.6rem, 5.2vw, 4.8rem)',
                lineHeight: 0.94,
                maxWidth: '720px',
              }}
            >
              A protection company built around equipment reliability.
            </h2>`;

try {
  let source = fs.readFileSync(filePath, 'utf8');

  if (source.includes(oldBlock)) {
    source = source.replace(oldBlock, newBlock);
    fs.writeFileSync(filePath, source, 'utf8');
    console.log('[about-page] WHO WE ARE removed and company headline enlarged');
  } else if (source.includes("fontSize: 'clamp(2.6rem, 5.2vw, 4.8rem)'")) {
    console.log('[about-page] headline hierarchy already applied');
  } else {
    throw new Error('Target About section was not found');
  }
} catch (error) {
  console.error('[about-page] failed:', error.message);
  process.exitCode = 1;
}
