import fs from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPrompt,
  detectImageMime
} from '../product-identity/scripts/generate-render-candidate.mjs';

test('detects image MIME from bytes instead of misleading file extensions', async () => {
  const logo = await fs.readFile('frontend/public/assets/logo-elimfilters.png');
  const technology = await fs.readFile('frontend/public/assets/SYNTAPORE_final.avif');
  const source = await fs.readFile('product-identity/source-assets/FF5776/FF5776-official-source.jpg');

  assert.equal(detectImageMime(source).mime, 'image/jpeg');
  assert.equal(detectImageMime(logo).mime, 'image/webp');
  assert.equal(detectImageMime(technology).mime, 'image/png');
});

test('render prompt is bound to governed FF5776 identity and artwork', async () => {
  const packet = JSON.parse(await fs.readFile(
    'product-identity/render-packets/FF5776.phase_2.authorized.json',
    'utf8'
  ));
  const prompt = buildPrompt(packet);

  assert.match(prompt, /EF95776/);
  assert.match(prompt, /SYNTAPORE™/);
  assert.match(prompt, /#414141/);
  assert.match(prompt, /#CBCBCB/);
  assert.match(prompt, /TOTAL ASSET PROTECTION/);
  assert.match(prompt, /image EDIT, not a new generation/);
  assert.match(prompt, /same physical object/);
});