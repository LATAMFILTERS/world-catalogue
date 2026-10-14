'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MARKER,
  patchFunction,
} = require('../scripts/migrations/run_280_elimfilters_oem_product_authority');

function functionDef(indent = '  ', withStrict = false) {
  return `CREATE OR REPLACE FUNCTION public.enforce_elimfilters_codigo_base_policy()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
${indent}duty_text text := upper(coalesce(NEW.duty, ''));
${indent}base_norm text := upper(regexp_replace(coalesce(NEW.codigo_base, ''), '[^A-Z0-9]', '', 'g'));
${indent}gov jsonb := coalesce(NEW.enrichment_data->'codigo_base_governance', '{}'::jsonb);
${indent}approved_code_norm text := upper(regexp_replace(coalesce(gov->>'approved_codigo_base',''), '[^A-Z0-9]', '', 'g'));
${indent}approved_manufacturer text := upper(regexp_replace(coalesce(gov->>'approved_manufacturer',''), '[^A-Z0-9]', '', 'g'));
${indent}approved_source text := upper(coalesce(gov->>'approved_source_column',''));
${withStrict ? `${indent}strict_validation boolean := true;\n` : ''}BEGIN
${withStrict ? `${indent}IF NOT strict_validation THEN\n${indent}  RETURN NEW;\n${indent}END IF;\n` : ''}
${indent}IF duty_text = 'HEAVY_DUTY' THEN
${indent}  RETURN NEW;
${indent}END IF;
${indent}RETURN NEW;
END;
$fn$;`;
}

test('run_280 patches canonical policy with source indentation preserved', () => {
  for (const indent of ['  ', '        ']) {
    const patched = patchFunction(functionDef(indent, false));
    assert.match(patched, new RegExp(MARKER));
    assert.match(patched, /ELIMFILTERS_OEM_PRODUCT/);
    assert.match(patched, /INTERNAL_PRODUCT_IDENTITY/);
    assert.match(patched, /approved_manufacturer <> 'ELIMFILTERS'/);
  }
});

test('run_280 makes ELIMFILTERS OEM rows strict on later policy revisions', () => {
  const patched = patchFunction(functionDef('        ', true));
  assert.match(patched, /ELIMFILTERS_OEM_PRODUCT_STRICT_V43/);
  assert.match(
    patched,
    /strict_validation := strict_validation OR upper\(coalesce\(gov->>'identity_type',''\)\) = 'ELIMFILTERS_OEM_PRODUCT'/
  );
});

test('run_280 is idempotent', () => {
  const once = patchFunction(functionDef('        ', true));
  const twice = patchFunction(once);
  assert.equal(twice, once);
});
