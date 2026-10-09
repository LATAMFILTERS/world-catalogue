'use strict';
// Preserve the installed policy; introduce only the evidenced Fleetguard collision route.
const MARKER='guarded_hd_collision_v42_ledger';
function patchPolicyFunction(definition){
 if(definition.includes(MARKER))return definition;
 if(definition.includes('donaldson_sku_collision_verified_v42_marker'))throw Error('LEGACY_V42_REQUIRES_REVIEW');
 const anchor="        IF duty_text = 'HEAVY_DUTY' THEN";
 if(definition.split(anchor).length!==2)throw Error('HD_POLICY_ANCHOR_NOT_UNIQUE');
 const block=`
          -- ${MARKER}
          IF coalesce(gov->>'donaldson_sku_collision_verified','false') = 'true' THEN
            IF coalesce(gov->>'primary_manufacturer_verified','false') <> 'true'
              OR coalesce(gov->>'fallback_manufacturer_verified','false') <> 'true'
              OR coalesce(gov->>'fallback_commercial_code_verified','false') <> 'true'
              OR NEW.canonical_source_brand IS DISTINCT FROM 'DONALDSON'
              OR NEW.canonical_source_status IS DISTINCT FROM 'VERIFIED'
              OR coalesce(NEW.canonical_source_code,'') = ''
              OR NEW.canonical_source_code IS DISTINCT FROM gov->>'collision_donaldson_code'
              OR approved_manufacturer <> 'FLEETGUARD'
              OR approved_source <> 'COMPETITOR_CODES'
              OR approved_code_norm = '' OR approved_code_norm <> base_norm
              OR length(regexp_replace(approved_code,'[^0-9]','','g')) < 4
              OR NEW.sku !~ '^(EA1|EA2|EF9|EL8|EH6)[0-9]{4}$'
              OR right(NEW.sku,4) <> right(regexp_replace(approved_code,'[^0-9]','','g'),4)
            THEN RAISE EXCEPTION 'CATALOG_POLICY_V42: collision identity or suffix not verified'; END IF;
            IF NOT EXISTS (
              SELECT 1 FROM public.elimfilters_catalog c
              WHERE c.sku = left(NEW.sku,3) || right(regexp_replace(NEW.canonical_source_code,'[^0-9]','','g'),4)
                AND c.sku <> NEW.sku
                AND c.codigo_base IS DISTINCT FROM NEW.canonical_source_code
                AND coalesce(c.canonical_source_code,'') <> ''
                AND c.canonical_source_code IS DISTINCT FROM NEW.canonical_source_code
            ) THEN RAISE EXCEPTION 'CATALOG_POLICY_V42: distinct occupied Donaldson target required'; END IF;
            IF NOT EXISTS (
              SELECT 1 FROM public.catalog_codigo_base_evidence e
              WHERE e.sku IN (NEW.sku,CASE WHEN TG_OP='UPDATE' THEN OLD.sku ELSE NEW.sku END)
                AND e.manufacturer = 'DONALDSON' AND e.reference_code = NEW.canonical_source_code
                AND e.evidence_kind LIKE 'OFFICIAL_%' AND e.verified_at IS NOT NULL
                AND e.evidence_hash ~ '^[a-fA-F0-9]{64}$'
                AND e.source_url ~ '^https://([a-zA-Z0-9-]+\\.)*donaldson\\.com/'
            ) THEN RAISE EXCEPTION 'CATALOG_POLICY_V42: official Donaldson ledger required'; END IF;
            IF NOT EXISTS (
              SELECT 1 FROM public.catalog_codigo_base_evidence e
              WHERE e.sku IN (NEW.sku,CASE WHEN TG_OP='UPDATE' THEN OLD.sku ELSE NEW.sku END)
                AND e.manufacturer = 'FLEETGUARD' AND e.reference_code = approved_code
                AND e.evidence_kind = 'OFFICIAL_FLEETGUARD_RENDERED_PRODUCT_PAGE'
                AND e.verified_at IS NOT NULL AND e.evidence_hash ~ '^[a-fA-F0-9]{64}$'
                AND e.source_url = 'https://www.fleetguard.com/product/' || approved_code
                AND e.metadata->>'cross_reference_confirmed' = 'true'
                AND e.metadata->>'source_codigo_base' = NEW.canonical_source_code
                AND e.metadata->>'source_canonical_code' = NEW.canonical_source_code
                AND e.metadata->>'relationship_source' = 'OFFICIAL_DONALDSON_PDF'
                AND e.metadata->>'relationship_url' ~ '^https://([a-zA-Z0-9-]+\\.)*donaldson\\.com/'
                AND e.metadata->>'relationship_hash' ~ '^[a-fA-F0-9]{64}$'
                AND e.metadata->>'relationship_page' ~ '^[1-9][0-9]*$'
                AND e.metadata->>'relationship_line' ~ ('(^|[^A-Z0-9])' || NEW.canonical_source_code || '([^A-Z0-9]|$)')
                AND e.metadata->>'relationship_line' ~ ('(^|[^A-Z0-9])' || approved_code || '([^A-Z0-9]|$)')
            ) THEN RAISE EXCEPTION 'CATALOG_POLICY_V42: source-bound official equivalence ledger required'; END IF;
            RETURN NEW;
          END IF;
`;
 // Recheck a flagged collision even when only its metadata or canonical identity changes.
 const early='        IF NOT strict_validation THEN';
 if(definition.split(early).length!==2)throw Error('STRICT_POLICY_ANCHOR_NOT_UNIQUE');
 return definition.replace(anchor,()=>anchor+block).replace(early,"        strict_validation := strict_validation OR coalesce(gov->>'donaldson_sku_collision_verified','false') = 'true';\n"+early);
}
async function install(db){
 const before=(await db.query("SELECT pg_get_functiondef('public.enforce_elimfilters_codigo_base_policy()'::regprocedure) AS def")).rows[0]?.def;
 if(!before)throw Error('POLICY_FUNCTION_MISSING');
 await db.query(patchPolicyFunction(before));
 const trigger=(await db.query("SELECT pg_get_triggerdef(oid) AS def FROM pg_trigger WHERE tgrelid='public.elimfilters_catalog'::regclass AND tgname='trg_elimfilters_codigo_base_policy' AND NOT tgisinternal")).rows[0]?.def;
 if(!trigger||!trigger.includes('enforce_elimfilters_codigo_base_policy()'))throw Error('EXPECTED_POLICY_TRIGGER_MISSING');
 if(!trigger.includes('canonical_source_status')){
  await db.query('DROP TRIGGER trg_elimfilters_codigo_base_policy ON public.elimfilters_catalog');
  await db.query('CREATE TRIGGER trg_elimfilters_codigo_base_policy BEFORE INSERT OR UPDATE OF sku,codigo_base,duty,competitor_codes,oem_codes,enrichment_data,canonical_source_brand,canonical_source_code,canonical_source_status ON public.elimfilters_catalog FOR EACH ROW EXECUTE FUNCTION public.enforce_elimfilters_codigo_base_policy()');
 }
 return {previous_definition:before,previous_trigger:trigger,policy:MARKER};
}
async function main(){const {Client}=require('pg');const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL});await db.connect();try{await db.query('BEGIN');const result=await install(db);const execute=process.argv.includes('--execute');await db.query(execute?'COMMIT':'ROLLBACK');console.log(JSON.stringify({policy:result.policy,transaction:execute?'COMMIT':'ROLLBACK'}));}catch(e){await db.query('ROLLBACK');throw e;}finally{await db.end();}}
module.exports={patchPolicyFunction,install,MARKER};
if(require.main===module)main().catch(e=>{console.error(e.message,e.position);process.exitCode=1});


