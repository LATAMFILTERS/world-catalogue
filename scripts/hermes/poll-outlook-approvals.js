#!/usr/bin/env node
'use strict';
// Read exact, attributable approvals from the existing HERMES Outlook sender mailbox.
// No publication authority is granted. Requires Graph Mail.Read application permission.
const axios = require('axios');
const OutlookMailService = require('../../lib/outlook-mail');
const { recordDecision } = require('../../lib/hermes-review-store');
const { buildOrder, submitApprovedOrder } = require('./approved-intelligence-to-catalogue');

const CODE = /^HERMES_REAL_[A-Z0-9_]+$/;
function parseApproval(message, approvedSender) {
  const sender = String(message?.from?.emailAddress?.address || '').toLowerCase();
  if (!approvedSender || sender !== approvedSender.toLowerCase()) return null;
  if (message?.isDraft || !message?.receivedDateTime) return null;
  const subject = String(message?.subject || '').trim();
  const html = String(message?.body?.content || '');
  // Only first new reply line, not quoted history, can authorize work.
  const firstLine = html.replace(/<\/?(?:p|div|br)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&nbsp;/gi,' ').split(/\r?\n/).map(x=>x.trim()).find(Boolean) || '';
  if (!/^APROBADO(?:\s+HERMES_REAL_[A-Z0-9_]+)?\s*\.?$/i.test(firstLine)) return null;
  const subjectMatch = subject.match(/\b(HERMES_REAL_[A-Z0-9_]+)\b/i);
  const lineMatch = firstLine.match(/\b(HERMES_REAL_[A-Z0-9_]+)\b/i);
  if (subjectMatch && lineMatch && subjectMatch[1].toUpperCase() !== lineMatch[1].toUpperCase()) return null;
  const code = String(lineMatch?.[1] || subjectMatch?.[1] || '').toUpperCase();
  if (!CODE.test(code)) return null;
  return { code, messageId:message.id };
}
function exactEquipment(candidate) {
  const e = candidate?.equipment || candidate?.application?.equipment || {};
  return {brand:String(e.brand || e.make || '').trim(),model:String(e.model || '').trim(),engine:e.engine || null,year:e.year || null};
}
async function executeApproval({candidate, code, decisionRow, record = recordDecision, submit = submitApprovedOrder}) {
  if (!candidate || candidate.entity_code !== code) throw Error('candidate mismatch');
  const equipment = exactEquipment(candidate);
  // Do not guess an OEM model from an article headline.
  if (!equipment.brand || !equipment.model) return {status:'NEEDS_EQUIPMENT_IDENTIFICATION',code};
  // Existing queue must be a verified review candidate. Approval means RESEARCH only here.
  if (candidate.workflow_status !== 'PENDING_REVIEW' || candidate.research_resolution?.status !== 'VERIFIED') return {status:'NOT_VERIFIED',code};
  if (decisionRow?.decision) return {status:'ALREADY_DECIDED',code};
  const now = new Date().toISOString();
  const approved = {...candidate,workflow_status:'APPROVED',approved_by:'Victor Abreu',approved_at:now};
  const order = buildOrder(approved,equipment);
  // Submit idempotently before recording the human decision; if unavailable leave approval retriable.
  const out = await submit(order);
  if (!['accepted','duplicate'].includes(out.status)) return {status:'DELIVERY_RETRY_REQUIRED',code,result:out.status};
  await record({candidateCode:code,decision:'research',reason:'APROBADO: authorize complete OEM research only; no publication'});
  return {status:'RESEARCH_QUEUED',code,research_id:out.research_id || null};
}
async function poll({env=process.env, mailFactory=()=>new OutlookMailService(), get=axios.get}={}) {
  if (env.HERMES_OUTLOOK_APPROVALS_ENABLED !== 'true') return {status:'DISABLED'};
  const mailbox=String(env.HERMES_SENDER_EMAIL||'').trim();
  const approver=String(env.HERMES_REVIEW_EMAIL||'').trim();
  if (!mailbox || !approver || !env.CATALOG_DATABASE_URL) throw Error('approval mailbox, approver and review DB are required');
  const mail=mailFactory();
  mail.validateConfig();
  const token=await mail.getAccessToken();
  const url='https://graph.microsoft.com/v1.0/users/'+encodeURIComponent(mailbox)+'/mailFolders/inbox/messages';
  const since = new Date(Date.now()-7*86400000).toISOString();
  const response=await get(url,{headers:{Authorization:'Bearer '+token},params:{'$select':'id,subject,from,receivedDateTime,body,isDraft','$filter':"receivedDateTime ge "+since,'$top':100,'$orderby':'receivedDateTime desc'}});
  const messages=response.data?.value || [];
  const { Pool }=require('pg');
  const pool=new Pool({connectionString:env.CATALOG_DATABASE_URL,max:1});
  let accepted=0,ignored=0,pending=0;
  try {
    for(const m of messages){
      const parsed=parseApproval(m,approver);
      if(!parsed){ignored++;continue;}
      const row=(await pool.query('SELECT candidate, decision FROM public.hermes_review_queue WHERE candidate_code=$1',[parsed.code])).rows[0];
      if(!row){pending++;continue;}
      const result=await executeApproval({candidate:row.candidate,code:parsed.code,decisionRow:row});
      if(result.status==='RESEARCH_QUEUED')accepted++;
      else pending++;
      console.log('[HERMES Outlook approval]',parsed.code,result.status);
    }
  }finally{await pool.end();}
  return {status:'CHECKED',accepted,ignored,pending};
}
if(require.main===module)poll().then(x=>console.log(JSON.stringify(x))).catch(e=>{console.error('[HERMES approvals]',e.message);process.exitCode=1;});
module.exports={parseApproval,exactEquipment,executeApproval,poll};
