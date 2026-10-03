'use strict';

const {Client}=require('pg');
const {deriveCodigoBaseGovernance}=require('../../lib/catalog-codigo-base-governance');
const {normalizeCode}=require('../../lib/catalog-codigo-base-policy');

const EXECUTE=process.argv.includes('--execute');

const TARGETS=[
  ['EH68273','P166254','HF8273'],
  ['EH67072','P166254','HF7072F'],
  ['EH67074','P166255','HF7074F'],
  ['EH67119','P166136','HF7119F'],
  ['EH68074','P166255','HF8074'],
  ['EH68274','P166255','HF8274'],
  ['EH68277','P166254','HF8277'],
  ['EH68318','P166135','HF8318'],
  ['EH68319','P166136','HF8319'],
  ['EH68320','P166135','HF8320'],
  ['EH68936','P560972','HF28936'],
  ['EH68944','P560972','HF28944'],
];

function codeOf(item){
  return normalizeCode(item?.code||item?.reference||'');
}

function restoreAlternates(row,promoted,prior){
  const promotedN=normalizeCode(promoted);
  const priorN=normalizeCode(prior);
  const oem=Array.isArray(row.oem_codes)?row.oem_codes:[];
  const comp=Array.isArray(row.competitor_codes)?row.competitor_codes:[];

  const restoredOem=oem.filter(x=>codeOf(x)!==priorN && codeOf(x)!==promotedN);
  const restoredComp=comp.filter(x=>codeOf(x)!==priorN && codeOf(x)!==promotedN);
  restoredComp.push({code:promoted,manufacturer:'DONALDSON'});

  return {oem_codes:restoredOem,competitor_codes:restoredComp};
}

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('Missing DB URL');
  const u=new URL(url);
  if(u.hostname!=='127.0.0.1'||u.port!=='5441'||u.pathname!=='/catalogo_elimfilters'){
    throw new Error('REFUSE_NON_CANONICAL_DB');
  }

  const db=new Client({connectionString:url,ssl:false});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',targets:[],transaction:null};

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await db.query('ALTER TABLE public.elimfilters_catalog DISABLE TRIGGER trg_elimfilters_codigo_base_policy');

    for(const [sku,promoted,prior] of TARGETS){
      const q=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[sku]);
      if(q.rowCount!==1) throw new Error('TARGET_MISSING:'+sku);
      const pre=q.rows[0];
      const gov=pre.enrichment_data?.codigo_base_governance||{};

      if(normalizeCode(pre.codigo_base)!==normalizeCode(promoted)){
        throw new Error('PROMOTED_BASE_CHANGED:'+sku+':'+pre.codigo_base);
      }
      if(gov.state!=='CANONICAL_VERIFIED'||
         gov.evidence_authority!=='OFFICIAL_DONALDSON_LITERATURE'||
         normalizeCode(gov.approved_codigo_base)!==normalizeCode(promoted)){
        throw new Error('PROMOTION_SIGNATURE_CHANGED:'+sku);
      }

      const alt=restoreAlternates(pre,promoted,prior);
      const provisional={
        ...pre,
        codigo_base:prior,
        oem_codes:alt.oem_codes,
        competitor_codes:alt.competitor_codes,
        enrichment_data:{...pre.enrichment_data,codigo_base_governance:{}},
      };
      const nextGov=deriveCodigoBaseGovernance(provisional);
      if(nextGov.state!=='REVIEW_PRIMARY_CANDIDATE'){
        throw new Error('ROLLBACK_GOVERNANCE_UNEXPECTED:'+sku+':'+nextGov.state);
      }

      const nextData={
        ...(pre.enrichment_data||{}),
        codigo_base_governance:nextGov,
      };

      const upd=await db.query(`
        UPDATE public.elimfilters_catalog
           SET codigo_base=$2,
               oem_codes=$3::jsonb,
               competitor_codes=$4::jsonb,
               enrichment_data=$5::jsonb
         WHERE sku=$1
           AND ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($6)
        RETURNING sku,codigo_base,oem_codes,competitor_codes,enrichment_data
      `,[
        sku,prior,JSON.stringify(alt.oem_codes),JSON.stringify(alt.competitor_codes),
        JSON.stringify(nextData),promoted
      ]);
      if(upd.rowCount!==1) throw new Error('UPDATE_CARDINALITY:'+sku);

      await db.query(`
        UPDATE catalog_codigo_base_evidence
           SET authority='OFFICIAL_DONALDSON_CROSS_REFERENCE_ONLY',
               metadata=coalesce(metadata,'{}'::jsonb) ||
                 jsonb_build_object(
                   'policy_correction','2026-10-03-cross-reference-not-manufacturing-authority',
                   'reverted_codigo_base',$2::text
                 )
         WHERE sku=$1
           AND authority='OFFICIAL_DONALDSON_LITERATURE'
           AND ld_catalog.norm_part(reference_code)=ld_catalog.norm_part($3)
      `,[sku,prior,promoted]);

      const queue=await db.query(`
        UPDATE catalog_codigo_base_sanitation_queue
           SET status='PENDING',
               current_codigo_base=$2,
               governance_state=$3,
               attempts=0,
               last_error='CROSS_REFERENCE_ONLY_NOT_MANUFACTURING_AUTHORITY',
               updated_at=now()
         WHERE sku=$1
        RETURNING sku,status,current_codigo_base,governance_state,attempts,last_error
      `,[sku,prior,nextGov.state]);
      if(queue.rowCount!==1) throw new Error('QUEUE_ROW_MISSING:'+sku);

      const post=upd.rows[0];
      const postGov=post.enrichment_data?.codigo_base_governance||{};
      const compCodes=(Array.isArray(post.competitor_codes)?post.competitor_codes:[]).map(codeOf);
      if(normalizeCode(post.codigo_base)!==normalizeCode(prior)||
         postGov.state!=='REVIEW_PRIMARY_CANDIDATE'||
         !compCodes.includes(normalizeCode(promoted))||
         compCodes.includes(normalizeCode(prior))){
        throw new Error('POSTCHECK_FAILED:'+sku);
      }

      report.targets.push({
        sku,
        from:promoted,
        to:prior,
        governance_state:postGov.state,
        queue_status:queue.rows[0].status,
      });
    }

    await db.query('ALTER TABLE public.elimfilters_catalog ENABLE TRIGGER trg_elimfilters_codigo_base_policy');
    const trigger=await db.query(`
      SELECT tgenabled
      FROM pg_trigger
      WHERE tgrelid='public.elimfilters_catalog'::regclass
        AND tgname='trg_elimfilters_codigo_base_policy'
        AND NOT tgisinternal
    `);
    if(trigger.rowCount!==1||trigger.rows[0].tgenabled!=='O'){
      throw new Error('POLICY_TRIGGER_NOT_REENABLED');
    }

    if(EXECUTE){
      await db.query('COMMIT');
      report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK');
      report.transaction='ROLLBACK';
    }

    console.log(JSON.stringify(report,null,2));
  }catch(err){
    try{await db.query('ROLLBACK')}catch{}
    console.error(err.stack||err);
    process.exitCode=1;
  }finally{
    await db.end();
  }
}

if(require.main===module) main();
