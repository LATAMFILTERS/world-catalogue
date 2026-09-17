'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');
const ROOT=path.resolve(__dirname,'../..');
const EXECUTE=process.argv.includes('--execute');
const DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-final-disposition');
const files=fs.readdirSync(DIR).filter(f=>/^fram-ld-final-matrix-.*\.json$/.test(f)).map(f=>path.join(DIR,f));
if(!files.length) throw new Error('No final FRAM matrix found');
const matrixFile=files.sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs)[0];
const matrix=JSON.parse(fs.readFileSync(matrixFile,'utf8'));
const rows=matrix.rows.filter(r=>r.final_disposition==='QUARANTINE_FINAL');
if(rows.length!==525) throw new Error(`Expected 525 final quarantine rows, got ${rows.length}`);
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const REPORT_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-final-disposition');
async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL missing');
  const c=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await c.connect();
  const report={mode:EXECUTE?'execute':'dry-run',matrix:matrixFile,planned:rows.length};
  try{
    await c.query('BEGIN');
    await c.query(`CREATE TABLE IF NOT EXISTS ld_catalog.ld_fram_final_quarantine (
      authority_normalized text PRIMARY KEY,
      authority text NOT NULL,
      family text NOT NULL,
      proposed_sku text,
      analyzer_status text NOT NULL,
      final_reason text NOT NULL,
      candidates jsonb NOT NULL DEFAULT '[]'::jsonb,
      source_file text,
      policy_version text NOT NULL,
      closed_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    let n=0;
    for(const r of rows){
      await c.query(`INSERT INTO ld_catalog.ld_fram_final_quarantine
        (authority_normalized,authority,family,proposed_sku,analyzer_status,final_reason,candidates,source_file,policy_version)
        VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9)
        ON CONFLICT(authority_normalized) DO UPDATE SET
        authority=excluded.authority,family=excluded.family,proposed_sku=excluded.proposed_sku,
        analyzer_status=excluded.analyzer_status,final_reason=excluded.final_reason,
        candidates=excluded.candidates,source_file=excluded.source_file,policy_version=excluded.policy_version,updated_at=now()`,
        [norm(r.authority),r.authority,r.family,r.proposed_sku,r.analyzer_status,r.final_reason,JSON.stringify(r.candidates||[]),r.source_file,'FRAM_LD_FINAL_2026_09_13']);
      n++;
    }
    const audit=(await c.query(`SELECT count(*)::int AS total,
      count(*) FILTER(WHERE policy_version='FRAM_LD_FINAL_2026_09_13')::int AS policy_rows
      FROM ld_catalog.ld_fram_final_quarantine`)).rows[0];
    report.upserted=n;
    report.audit=audit;
    if(audit.policy_rows!==525) throw new Error(`Final quarantine audit ${audit.policy_rows}/525`);
    if(EXECUTE) await c.query('COMMIT'); else await c.query('ROLLBACK');
    report.transaction=EXECUTE?'COMMIT':'ROLLBACK';
  }catch(e){try{await c.query('ROLLBACK')}catch{} report.error=e.message; throw e;}
  finally{
    await c.end();
    const stamp=new Date().toISOString().replace(/[:.]/g,'-');
    const out=path.join(REPORT_DIR,`fram-final-quarantine-${EXECUTE?'execute':'dryrun'}-${stamp}.json`);
    fs.writeFileSync(out,JSON.stringify(report,null,2));
    console.log(JSON.stringify({report:out,...report},null,2));
  }
}
main().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
