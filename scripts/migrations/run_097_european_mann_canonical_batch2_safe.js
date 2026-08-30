'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const MIGRATION='097_EUROPEAN_MANN_CANONICAL_BATCH2_SAFE';
async function applyEuropeanMannCanonicalBatch2Safe(){
 const databaseUrl=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
 if(!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
 const pool=new Pool({connectionString:databaseUrl,ssl:{rejectUnauthorized:false},max:1});
 const client=await pool.connect();
 const report={migration:MIGRATION,checks:{},mutations:{}};
 try{
  await client.query('BEGIN');
  await client.query(`CREATE TEMP TABLE tmp_mann_b2_all AS
    SELECT normalized_sku,mann_part_number,only_full_public_sku AS public_sku
    FROM ld_catalog.ld_european_mann_match_reconciliation
    WHERE reconciliation_state='CORRECTED_SINGLE_FULL_CANDIDATE'
      AND full_candidate_count=1 AND best_coverage=1.00000 AND only_full_public_sku IS NOT NULL`);
  const exclusions=await client.query(`SELECT s.normalized_sku,s.mann_part_number,s.public_sku,i.canonical_part_number AS existing_part
    FROM tmp_mann_b2_all s
    JOIN ld_catalog.ld_canonical_product_identity i ON i.elimfilters_sku=s.public_sku
    WHERE i.status='ACTIVE'
      AND NOT(i.origin_group='EUROPEAN'
        AND ld_catalog.norm_part(i.canonical_brand)=ld_catalog.norm_part('MANN-FILTER')
        AND ld_catalog.norm_part(i.canonical_part_number)=ld_catalog.norm_part(s.mann_part_number))
    ORDER BY s.public_sku`);
  report.checks.excluded_preexisting_target_identities=exclusions.rows;
  await client.query(`CREATE TEMP TABLE tmp_mann_b2 AS
    SELECT s.* FROM tmp_mann_b2_all s
    WHERE NOT EXISTS (
      SELECT 1 FROM ld_catalog.ld_canonical_product_identity i
      WHERE i.elimfilters_sku=s.public_sku AND i.status='ACTIVE'
        AND NOT(i.origin_group='EUROPEAN'
          AND ld_catalog.norm_part(i.canonical_brand)=ld_catalog.norm_part('MANN-FILTER')
          AND ld_catalog.norm_part(i.canonical_part_number)=ld_catalog.norm_part(s.mann_part_number))
    )`);
  const q=await client.query(`SELECT count(*)::int rows,count(DISTINCT normalized_sku)::int normalized,count(DISTINCT mann_part_number)::int mann,count(DISTINCT public_sku)::int public FROM tmp_mann_b2`);
  report.checks.candidates=q.rows[0]; const c=q.rows[0];
  if(c.rows<1||c.rows!==c.normalized||c.rows!==c.mann||c.rows!==c.public) throw new Error('BATCH2_SAFE_NOT_ONE_TO_ONE');
  const badTarget=await client.query(`SELECT count(*)::int n FROM tmp_mann_b2 s LEFT JOIN public.elimfilters_catalog c ON c.sku=s.public_sku WHERE c.sku IS NULL OR c.duty<>'LIGHT_DUTY'`);
  report.checks.bad_targets=badTarget.rows[0].n; if(badTarget.rows[0].n) throw new Error('BATCH2_SAFE_BAD_TARGET');
  const badOrigin=await client.query(`SELECT count(*)::int n FROM tmp_mann_b2 s LEFT JOIN ld_catalog.ld_sku_origin_evidence_v o ON o.elimfilters_sku=s.normalized_sku WHERE o.elimfilters_sku IS NULL OR o.inferred_origin_group<>'EUROPEAN'`);
  report.checks.bad_origin=badOrigin.rows[0].n; if(badOrigin.rows[0].n) throw new Error('BATCH2_SAFE_BAD_ORIGIN');
  const idConflict=await client.query(`SELECT count(*)::int n FROM tmp_mann_b2 s JOIN ld_catalog.ld_canonical_product_identity i ON i.status='ACTIVE' AND ld_catalog.norm_part(i.canonical_part_number)=ld_catalog.norm_part(s.mann_part_number) AND i.elimfilters_sku<>s.public_sku`);
  report.checks.identity_conflicts=idConflict.rows[0].n; if(idConflict.rows[0].n) throw new Error('BATCH2_SAFE_IDENTITY_COLLISION');
  const baseConflict=await client.query(`SELECT count(*)::int n FROM tmp_mann_b2 s JOIN public.elimfilters_catalog c ON ld_catalog.norm_part(c.codigo_base)=ld_catalog.norm_part(s.mann_part_number) AND c.sku<>s.public_sku`);
  report.checks.codigo_base_collisions=baseConflict.rows[0].n; if(baseConflict.rows[0].n) throw new Error('BATCH2_SAFE_BASE_COLLISION');
  const updated=await client.query(`UPDATE public.elimfilters_catalog c SET codigo_base=s.mann_part_number,enrichment_data=jsonb_set(coalesce(c.enrichment_data,'{}'::jsonb),'{codigo_base_governance}',coalesce(c.enrichment_data->'codigo_base_governance','{}'::jsonb)||jsonb_build_object('origin_group','EUROPEAN','approved_manufacturer','MANN-FILTER','approved_codigo_base',s.mann_part_number,'approved_source_column','CANONICAL_POLICY','primary_manufacturer_verified',true,'governance_state','CANONICAL_VERIFIED','state','CANONICAL_VERIFIED','current_codigo_base',s.mann_part_number,'required_authority','MANN_FILTER_REGIONAL_CANONICAL','policy_version','2026-08-29-v3.2-regional','evidence_note','Migration 097: corrected reconciliation proved one full public LIGHT_DUTY candidate with 100% normalized application coverage; targets with an existing different active canonical identity were excluded.'),true) FROM tmp_mann_b2 s WHERE c.sku=s.public_sku AND (ld_catalog.norm_part(c.codigo_base) IS DISTINCT FROM ld_catalog.norm_part(s.mann_part_number) OR coalesce(c.enrichment_data->'codigo_base_governance'->>'origin_group','')<>'EUROPEAN' OR ld_catalog.norm_part(c.enrichment_data->'codigo_base_governance'->>'approved_codigo_base')<>ld_catalog.norm_part(s.mann_part_number)) RETURNING c.sku`);
  report.mutations.catalog_rows_updated=updated.rowCount;
  const ids=await client.query(`INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at) SELECT s.public_sku,'EUROPEAN','MANN-FILTER',s.mann_part_number,c.filter_type,'ACTIVE','MIGRATION_097_RECONCILED_SINGLE_FULL_SAFE',now(),now() FROM tmp_mann_b2 s JOIN public.elimfilters_catalog c ON c.sku=s.public_sku ON CONFLICT(elimfilters_sku) DO UPDATE SET origin_group=excluded.origin_group,canonical_brand=excluded.canonical_brand,canonical_part_number=excluded.canonical_part_number,filter_type=excluded.filter_type,status='ACTIVE',evidence_source=excluded.evidence_source,updated_at=now() RETURNING elimfilters_sku`);
  report.mutations.canonical_identities_upserted=ids.rowCount;
  const vr=await client.query(`SELECT count(*)::int n FROM tmp_mann_b2 s JOIN public.v_api_resolver_v6 v ON v.code=ld_catalog.norm_part(s.mann_part_number) AND v.sku=s.public_sku AND v.status='RESOLVED_CANONICAL'`);
  report.checks.v6_matches=vr.rows[0].n; if(vr.rows[0].n!==c.rows) throw new Error('BATCH2_SAFE_V6_MISMATCH');
  const multi=await client.query(`SELECT count(*)::int n FROM (SELECT v.code FROM public.v_api_resolver_v6 v JOIN tmp_mann_b2 s ON v.code=ld_catalog.norm_part(s.mann_part_number) GROUP BY v.code HAVING count(DISTINCT v.sku)<>1)x`);
  report.checks.v6_multi=multi.rows[0].n; if(multi.rows[0].n) throw new Error('BATCH2_SAFE_V6_MULTI');
  await client.query('COMMIT'); return report;
 }catch(error){await client.query('ROLLBACK');throw Object.assign(error,{migrationReport:report});}
 finally{client.release();await pool.end();}
}
if(require.main===module) applyEuropeanMannCanonicalBatch2Safe().then(r=>console.log('[european-mann-canonical-batch2-safe]',JSON.stringify(r))).catch(e=>{console.error('[european-mann-canonical-batch2-safe] failed',JSON.stringify(e.migrationReport||{error:e.message}));process.exit(1);});
module.exports={MIGRATION,applyEuropeanMannCanonicalBatch2Safe};
