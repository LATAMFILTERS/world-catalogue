import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { sendWeeklyActionEmail } from '../scripts/hermes/send-weekly-email-actions.mjs';

function makeReport(dir) {
  const date='2026-10-05';
  const data={
    reporting_period:{start:'2026-09-29',end:'2026-10-05'},
    totals:{scanned:2,source_changes_detected:2,groq_resolved:0,review_ready:0,needs_research:2,duplicates_suppressed:0,invalid:0},
    groups:{},
    research_pending:[
      {entity_code:'HERMES_ENGINE_1',source_publisher:'OEM',source_url:'https://example.test/engine',reason:'RESEARCH_NOT_RESOLVED'},
      {entity_code:'HERMES_MEDIA_1',source_publisher:'MEDIA MAKER',source_url:'https://example.test/media',reason:'RESEARCH_NOT_RESOLVED'}
    ],
    duplicates:[],
    invalid:[]
  };
  fs.writeFileSync(path.join(dir,`hermes-weekly-${date}.md`),'# weekly','utf8');
  fs.writeFileSync(path.join(dir,`hermes-weekly-${date}.json`),JSON.stringify(data),'utf8');
}

test('weekly HERMES digest is sent even when nothing is review-ready', async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hermes-weekly-digest-'));
  makeReport(dir);
  const sends=[];
  class FakeOutlook {
    constructor(){ this.emailMap={default:'hermes@elimfilters.com'}; }
    validateConfig(){}
    async send(to,subject,html,text,profile){ sends.push({to,subject,html,text,profile}); }
  }
  const result=await sendWeeklyActionEmail({
    reportsDir:dir,
    env:{
      HERMES_EMAIL_PROVIDER:'outlook',
      HERMES_EMAIL_LIVE:'true',
      HERMES_REVIEW_EMAIL:'vabreu@elimfilters.com',
      HERMES_SENDER_EMAIL:'hermes@elimfilters.com'
    },
    outlookFactory:FakeOutlook
  });
  assert.equal(result.outcome,'SENT');
  assert.equal(result.delivery_status,'SUBMITTED');
  assert.equal(result.delivery_confirmed,false);
  assert.equal(result.actionable,false);
  assert.equal(result.informational_digest,true);
  assert.equal(result.queued_pending,2);
  assert.equal(sends.length,1);
  assert.match(sends[0].text,/HERMES_ENGINE_1/);
  assert.match(sends[0].text,/HERMES_MEDIA_1/);
  assert.match(sends[0].html,/HERMES_ENGINE_1/);
  assert.match(sends[0].html,/HERMES_MEDIA_1/);
});

test('review-ready week still emails the candidates when signed review actions are unavailable', async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hermes-weekly-review-fallback-'));
  const candidate={entity_code:'HERMES_REAL_OEM_READY_1',source_publisher:'OEM',source_url:'https://example.test/oem',research_resolution:{status:'VERIFIED',finding_title:'Verified OEM finding'}};
  fs.writeFileSync(path.join(dir,'hermes-weekly-2026-10-26.md'),'# weekly','utf8');
  fs.writeFileSync(path.join(dir,'hermes-weekly-2026-10-26.json'),JSON.stringify({
    reporting_period:{start:'2026-10-19',end:'2026-10-26'},
    totals:{scanned:1,review_ready:1,needs_research:0},
    groups:{oem_update:[candidate]}, research_pending:[], duplicates:[], invalid:[]
  }),'utf8');
  const sends=[];
  class FakeOutlook { constructor(){ this.emailMap={}; } validateConfig(){} async send(to,subject,html,text){ sends.push({html,text}); } }
  // Lenovo runtime shape: collection dry-run, no Review Center secret, no catalogue DB.
  const result=await sendWeeklyActionEmail({
    reportsDir:dir,
    env:{HERMES_EMAIL_PROVIDER:'outlook',HERMES_EMAIL_LIVE:'true',HERMES_REVIEW_EMAIL:'vabreu@elimfilters.com',HERMES_COLLECTION_DRY_RUN:'true'},
    outlookFactory:FakeOutlook
  });
  assert.equal(result.outcome,'SENT');
  assert.equal(result.review_ready,1);
  assert.equal(result.fallback_reason,'REVIEW_ACTIONS_UNAVAILABLE');
  assert.equal(sends.length,1);
  assert.match(sends[0].html,/botones de aprobación no están disponibles/);
  assert.match(sends[0].html,/HERMES_REAL_OEM_READY_1/);
  assert.match(sends[0].text,/Verified OEM finding/);
});

test('verified industry findings get ACEPTAR / ELIMINAR buttons and are staged for review', async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hermes-weekly-digest-actions-'));
  const finding={entity_code:'HERMES_REAL_SWEEP_STANDARDS_TESTING_ABC123',source_url:'https://example.test/std',research_resolution:{status:'VERIFIED'}};
  fs.writeFileSync(path.join(dir,'hermes-weekly-2026-10-26.md'),'# weekly','utf8');
  fs.writeFileSync(path.join(dir,'hermes-weekly-2026-10-26.json'),JSON.stringify({
    reporting_period:{start:'2026-10-19',end:'2026-10-26'}, totals:{scanned:0,review_ready:0,needs_research:0},
    groups:{}, research_pending:[], duplicates:[], invalid:[],
    industry_digest:{window:{start:'2026-10-19',end:'2026-10-25'},excluded:{},empty_reason:null,review_candidates:[finding],
      items:[{entity_code:finding.entity_code,status:'VERIFICADO',title:'Norma revisada',company:'ISO',date:'2026-10-20',domain:'Normas',summary:'s',summary_lang:'es',why:'w',why_lang:'es',url:'https://example.test/std'}]}
  }),'utf8');
  const staged=[];
  const result=await sendWeeklyActionEmail({
    reportsDir:dir, stage:async(c)=>{ staged.push(...c); },
    env:{HERMES_EMAIL_PROVIDER:'outlook',HERMES_EMAIL_LIVE:'false',HERMES_COLLECTION_DRY_RUN:'true',HERMES_REVIEW_ACTIONS_ENABLED:'true',
      HERMES_REVIEW_BASE_URL:'https://part-search.example.test/hermes/review',HERMES_REVIEW_TOKEN_SECRET:'test-secret',HERMES_REVIEW_RUN_ID:'123'}
  });
  assert.equal(result.outcome,'DRY_RUN');
  assert.deepEqual(staged.map((c)=>c.entity_code),[finding.entity_code]);
  const html=fs.readFileSync(result.preview,'utf8');
  assert.match(html,/ACEPTAR/);
  assert.match(html,/ELIMINAR/);
  assert.match(html,/part-search\.example\.test\/hermes\/review/);
});
