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
  assert.equal(result.actionable,false);
  assert.equal(result.informational_digest,true);
  assert.equal(result.queued_pending,2);
  assert.equal(sends.length,1);
  assert.match(sends[0].text,/HERMES_ENGINE_1/);
  assert.match(sends[0].text,/HERMES_MEDIA_1/);
});
