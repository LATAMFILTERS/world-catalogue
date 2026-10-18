'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {assertReviewedHead}=require('../scripts/migrations/run_fleetguard_reviewed_resolver_20261017');
const head='a'.repeat(40),entry=(state='APPROVED',login='reviewer',oid=head)=>({state,author:{login},commit:{oid}});
const pr=nodes=>({state:'MERGED',headRefOid:head,author:{login:'author'},reviews:{nodes}});
test('requires merged PR and independent approval of exact head',()=>{assert.doesNotThrow(()=>assertReviewedHead(pr([entry()]),head));assert.throws(()=>assertReviewedHead({...pr([entry()]),state:'OPEN'},head));assert.throws(()=>assertReviewedHead(pr([entry('APPROVED','author')]),head));assert.throws(()=>assertReviewedHead(pr([entry('APPROVED','reviewer','b'.repeat(40))]),head));assert.throws(()=>assertReviewedHead(pr([entry()]),undefined));});
test('later dismissal or change request revokes an earlier approval',()=>{assert.throws(()=>assertReviewedHead(pr([entry(),entry('DISMISSED')]),head));assert.throws(()=>assertReviewedHead(pr([entry(),entry('CHANGES_REQUESTED')]),head));assert.throws(()=>assertReviewedHead(pr([entry(),entry('CHANGES_REQUESTED','another')]),head));assert.doesNotThrow(()=>assertReviewedHead(pr([entry('CHANGES_REQUESTED'),entry()]),head));});
test('comments cannot manufacture or remove an approval',()=>{assert.throws(()=>assertReviewedHead(pr([entry('COMMENTED')]),head));assert.doesNotThrow(()=>assertReviewedHead(pr([entry(),entry('COMMENTED')]),head));assert.throws(()=>assertReviewedHead({...pr([]),author:null},head));});
