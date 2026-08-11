import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveMailConfig, sendWeeklyEmail } from '../../scripts/hermes/send-weekly-email.mjs';

function reports() {
  fs.mkdirSync(os.tmpdir(), { recursive: true });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-email-'));
  fs.writeFileSync(path.join(dir, 'hermes-weekly-2026-08-11.md'), '# Safe report\n');
  return dir;
}

test('Gmail live mode requires only environment-held app credentials', () => {
  assert.throws(() => resolveMailConfig({ HERMES_EMAIL_PROVIDER:'gmail', HERMES_EMAIL_LIVE:'true', HERMES_REVIEW_EMAIL:'vabreu@elimfilters.com', HERMES_SENDER_EMAIL:'hermeselimfilters@gmail.com' }), /APP_PASSWORD/);
});

test('dry-run writes a preview and sends nothing', async () => {
  const dir=reports();
  try {
    const out=await sendWeeklyEmail({ reportsDir:dir, env:{ HERMES_EMAIL_PROVIDER:'gmail', HERMES_EMAIL_LIVE:'false', HERMES_REVIEW_EMAIL:'vabreu@elimfilters.com', HERMES_SENDER_EMAIL:'hermeselimfilters@gmail.com' } });
    assert.equal(out.outcome,'DRY_RUN'); assert.ok(fs.existsSync(out.preview));
  } finally { fs.rmSync(dir,{ recursive:true, force:true }); }
});

test('Gmail verifies transport before sending the weekly report', async () => {
  const dir=reports(); let verified=false; let sent=null; let options=null;
  const factory=(value) => { options=value; return { async verify(){ verified=true; }, async sendMail(message){ assert.equal(verified,true); sent=message; return { messageId:'test-123' }; } }; };
  try {
    const out=await sendWeeklyEmail({ reportsDir:dir, gmailTransportFactory:factory, env:{ HERMES_EMAIL_PROVIDER:'gmail', HERMES_EMAIL_LIVE:'true', HERMES_REVIEW_EMAIL:'vabreu@elimfilters.com', HERMES_SENDER_EMAIL:'hermeselimfilters@gmail.com', HERMES_GMAIL_APP_PASSWORD:'not-a-real-secret' } });
    assert.deepEqual(options,{ service:'gmail', auth:{ user:'hermeselimfilters@gmail.com', pass:'not-a-real-secret' } });
    assert.equal(sent.to,'vabreu@elimfilters.com'); assert.match(sent.from,/HERMES/); assert.equal(out.message_id,'test-123');
  } finally { fs.rmSync(dir,{ recursive:true, force:true }); }
});
