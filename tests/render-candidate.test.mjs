import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPrompt,
  detectImageMime,
  validateArtworkAuthorityBinding
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
  assert.match(prompt, /free-form label design/);
  assert.match(prompt, /Never retype, redraw, restyle, approximate, or substitute the logo/);
  assert.match(prompt, /No pure white and no secondary print color/);
});

test('artwork authority binding rejects any route that is not locked to master paint and lithography', async () => {
  const authorityPath = 'data/product-identity/authorities/cylindrical-print-layout-authority.json';
  const authorityBytes = await fs.readFile(authorityPath);
  const authoritySha = crypto.createHash('sha256').update(authorityBytes).digest('hex');
  const packet = {
    identity: { logo_asset_path: 'frontend/public/assets/logo-elimfilters.png' },
    artwork_lock: {
      authority_id: 'ELIMFILTERS_CYLINDRICAL_PRINT_LAYOUT_AUTHORITY',
      authority_path: authorityPath,
      authority_sha256: authoritySha,
      layout_mode: 'LOCKED_CYLINDRICAL_PRINT_LAYOUT',
      body_color_hex: '#414141',
      body_finish: 'SEMI_MATTE_INDUSTRIAL_COATING',
      lithography_color_hex: '#CBCBCB',
      lithography_finish: 'METALLIC_SILVER_SATIN',
      positioning_line: 'TOTAL ASSET PROTECTION',
      descriptor: 'Powered Filtration',
      official_logo_asset: 'frontend/public/assets/logo-elimfilters.png',
      same_artwork_both_sides: true,
      all_other_artwork_locked: true,
      preserve_artwork_hierarchy: true,
      proportional_scaling_only: true,
      extra_text_allowed: false,
      extra_icons_allowed: false,
      secondary_colors_allowed: false
    },
    execution_guard: {
      lithography_authority_required: true,
      exact_master_colors_required: true,
      locked_artwork_layout_required: true,
      direct_image_generation_forbidden: true,
      source_referenced_transformation_only: true
    }
  };
  const validated = await validateArtworkAuthorityBinding(packet);
  assert.equal(validated.authority_sha256, authoritySha);

  const invalid = structuredClone(packet);
  invalid.artwork_lock.body_color_hex = '#FFFFFF';
  await assert.rejects(() => validateArtworkAuthorityBinding(invalid), /STOP_MASTER_COLOR_MISMATCH/);
});