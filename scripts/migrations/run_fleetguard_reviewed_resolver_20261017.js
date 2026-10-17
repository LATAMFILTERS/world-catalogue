'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {Client}=require('pg');
const {buildReviewedFleetguardResolver}=require('../../lib/fleetguard-reviewed-resolver');
const {deriveCodigoBaseGovernance}=require('../../lib/catalog-codigo-base-governance');
const manifest=require('../../docs/catalog-closure/fleetguard-resolver-preview-cases-20261017.json');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const META="SELECT pg_get_viewdef(c.oid,true) definition,pg_get_userbyid(c.relowner) owner,c.relacl::text acl,c.reloptions FROM pg_class c WHERE c.oid='public.v_api_resolver_v7'::regclass";
async function run(db,{backupDirectory,expectedViewSha,execute=false,reviewedHead}={}) {
  assert.ok(backupDirectory&&path.isAbsolute(backupDirectory),'Absolute private backup directory required');
  assert.match(expectedViewSha||'',/^[a-f0-9]{64}$/);
  if(execute){
    const query='query{repository(owner:"LATAMFILTERS",name:"world-catalogue"){pullRequest(number:980){state headRefOid author{login} reviews(last:100){nodes{state author{login} commit{oid}}}}}}';
    const review=JSON.parse(execFileSync('gh',['api','graphql','-f','query='+query],{encoding:'utf8'})).data.repository.pullRequest;
    assert.equal(review.state,'MERGED','Mandatory PR integration required');
    assert.equal(review.headRefOid,reviewedHead,'Reviewed head differs');
    assert.ok(review.reviews.nodes.some(r=>r.state==='APPROVED'&&r.commit?.oid===reviewedHead&&r.author?.login!==review.author?.login),'Approval of exact head required');
    assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),reviewedHead);
  }
  let finished=false;
  await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
  try{
    await db.query("SET LOCAL lock_timeout='5s'");await db.query("SET LOCAL statement_timeout='120s'");
    const target=(await db.query('SELECT current_database() db,inet_server_port() port')).rows[0];
    assert.ok((target.port===5497&&target.db==='closure_resolver_test')||(target.port===5432&&target.db==='catalogo_elimfilters'),'Unexpected database');
    await db.query('LOCK TABLE public.elimfilters_catalog IN SHARE MODE');
    const before=(await db.query(META)).rows[0];assert.equal(sha(before.definition),expectedViewSha,'View revision changed');
    const keys=manifest.cases.map(c=>c.sku),rows=(await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku',[keys])).rows;
    assert.equal(rows.length,90);
    const ledger=(await db.query('SELECT * FROM public.catalog_sku_certification WHERE sku=ANY($1::text[]) ORDER BY sku FOR SHARE',[keys])).rows;
    assert.equal(ledger.length,90);
    for(const r of rows){const m=manifest.cases.find(x=>x.sku===r.sku),l=ledger.find(x=>x.sku===r.sku),g=deriveCodigoBaseGovernance(r);assert.equal(r.codigo_base,m.base);assert.equal(r.canonical_evidence?.source_url,m.source_url);assert.equal(r.canonical_evidence?.evidence_hash,m.evidence_hash);assert.equal(g.state,'CANONICAL_VERIFIED');assert.equal(g.required_authority,'VERIFIED_FLEETGUARD_FALLBACK');assert.equal(l.certification_state,'BLOCKED');assert.deepEqual(l.blockers,['BASE_CODE_NOT_UNIQUELY_RESOLVED']);assert.ok(!/manual/i.test(l.policy_version||''),'Manual hold');}
    const candidate=buildReviewedFleetguardResolver(before.definition,manifest.cases);
    fs.mkdirSync(backupDirectory,{recursive:true});
    const backup={at:new Date().toISOString(),target,before,rows,ledger,candidate_sha256:candidate.sha256};
    const archive=JSON.stringify(backup,null,2),name=path.join(backupDirectory,'resolver-'+Date.now()+'-'+crypto.randomBytes(4).toString('hex'));
    fs.writeFileSync(name+'.json',archive,{flag:'wx'});fs.writeFileSync(name+'.sha256',sha(archive),{flag:'wx'});
    fs.writeFileSync(name+'-rollback.sql','BEGIN;\nCREATE OR REPLACE VIEW public.v_api_resolver_v7 AS '+before.definition+'\nCOMMIT;\n',{flag:'wx'});
    await db.query('CREATE TEMP TABLE fleetguard_resolver_before ON COMMIT DROP AS SELECT * FROM public.v_api_resolver_v7');
    await db.query('CREATE TEMP TABLE fleetguard_catalog_before ON COMMIT DROP AS SELECT * FROM public.elimfilters_catalog');
    await db.query('CREATE OR REPLACE VIEW public.v_api_resolver_v7 AS '+candidate.sql);
    const removed=(await db.query('SELECT count(*)::int n FROM (SELECT * FROM fleetguard_resolver_before EXCEPT ALL SELECT * FROM public.v_api_resolver_v7) x')).rows[0].n;assert.equal(removed,0);
    const added=(await db.query('SELECT * FROM public.v_api_resolver_v7 EXCEPT ALL SELECT * FROM fleetguard_resolver_before')).rows;assert.equal(added.length,90);
    for(const m of manifest.cases)assert.equal(added.filter(r=>r.sku===m.sku&&r.code===m.base&&r.manufacturer==='FLEETGUARD').length,1);
    const changed=(await db.query('SELECT count(*)::int n FROM ((SELECT * FROM fleetguard_catalog_before EXCEPT ALL SELECT * FROM public.elimfilters_catalog) UNION ALL (SELECT * FROM public.elimfilters_catalog EXCEPT ALL SELECT * FROM fleetguard_catalog_before)) x')).rows[0].n;assert.equal(changed,0);
    assert.deepEqual((await db.query('SELECT * FROM public.catalog_sku_certification WHERE sku=ANY($1::text[]) ORDER BY sku',[keys])).rows,ledger);
    const after=(await db.query(META)).rows[0];for(const key of ['owner','acl','reloptions'])assert.deepEqual(after[key],before[key]);
    await db.query(execute?'COMMIT':'ROLLBACK');finished=true;
    assert.deepEqual((await db.query(META)).rows[0],execute?after:before,'Post-transaction view verification');
    const report={at:new Date().toISOString(),target,mode:execute?'execute':'dry-run',transaction:execute?'COMMIT':'ROLLBACK',backup:name+'.json',backup_sha256:sha(archive),removed,added:90,catalog_unchanged:true,ledger_unchanged:true,view_metadata_preserved:true,post_transaction_verified:true,certifications_changed:0};
    fs.writeFileSync(name+'-result.json',JSON.stringify(report,null,2),{flag:'wx'});return report;
  }catch(e){if(!finished)await db.query('ROLLBACK');throw e;}
}
if(require.main===module){(async()=>{const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL,ssl:false});assert.ok(process.env.CATALOG_DATABASE_URL,'Explicit CATALOG_DATABASE_URL required');await db.connect();try{console.log(JSON.stringify(await run(db,{backupDirectory:process.env.RESOLVER_BACKUP_DIRECTORY,expectedViewSha:process.env.EXPECTED_RESOLVER_SHA256,execute:process.argv.includes('--execute'),reviewedHead:process.env.REVIEWED_RESOLVER_HEAD})));}finally{await db.end()}})().catch(e=>{console.error(e.message);process.exitCode=1});}
module.exports={run};

