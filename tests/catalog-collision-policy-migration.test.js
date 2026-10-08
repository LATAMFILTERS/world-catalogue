'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {patchPolicyFunction,MARKER}=require('../scripts/migrations/run_226_guarded_hd_collision_policy');
const original=`CREATE OR REPLACE FUNCTION public.enforce_elimfilters_codigo_base_policy() RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE strict_validation boolean; duty_text text;
BEGIN
        IF NOT strict_validation THEN
          RETURN NEW;
        END IF;
        IF duty_text = 'HEAVY_DUTY' THEN
          RETURN NEW;
        END IF;
        IF duty_text = 'LIGHT_DUTY' THEN
          RAISE EXCEPTION 'existing LD policy';
        END IF;
END;
$function$;`;
test('SQL regex dollar signs cannot append or duplicate the original policy',()=>{const patched=patchPolicyFunction(original);assert.equal(patched.split('CREATE OR REPLACE FUNCTION').length,2);assert.equal(patched.split('$function$').length,3);assert.ok(patched.trim().endsWith('$function$;'));assert.equal(patched.split("RAISE EXCEPTION 'existing LD policy'").length,2);assert.ok(patched.includes(MARKER));});
test('reapplying the collision migration preserves the installed definition',()=>{const installed=patchPolicyFunction(original);assert.equal(patchPolicyFunction(installed),installed);});
test('unrecognized and legacy policies fail before installation',()=>{assert.throws(()=>patchPolicyFunction('unknown policy'),/ANCHOR/);assert.throws(()=>patchPolicyFunction(original.replace("        IF duty_text = 'HEAVY_DUTY' THEN","-- donaldson_sku_collision_verified_v42_marker")),/LEGACY/);assert.throws(()=>patchPolicyFunction(original.replace('        IF NOT strict_validation THEN','')),/STRICT_POLICY/);});
