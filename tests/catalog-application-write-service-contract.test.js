'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const service=fs.readFileSync(
  path.join(__dirname,'..','lib','catalog-application-write-service.js'),
  'utf8'
);

test('application gateway supports atomic duty transition with governed application write',()=>{
  assert.match(service,/const dutyProvided = Object\.prototype\.hasOwnProperty\.call\(params, 'duty'\)/);
  assert.match(service,/const duty = dutyProvided \? nonEmpty\(params\.duty\)\.toUpperCase\(\) : current\.duty/);
  assert.match(service,/const candidate = \{ \.\.\.current, duty, equipment_applications: equipment, vehicle_applications: vehicles \}/);
  assert.match(service,/SET duty=\$1,/);
  assert.match(service,/duty_updated: dutyProvided && duty !== current\.duty/);
});

test('application gateway still validates candidate before write',()=>{
  assert.match(service,/validateApplicationWrite\(candidate, \{ requireEvidence: false \}\)/);
  assert.match(service,/CATALOG_APPLICATION_GATEWAY_BLOCKED/);
});

test('application gateway still records evidence before the catalog update',()=>{
  const evidencePos=service.indexOf('await insertEvidence');
  const updatePos=service.indexOf('UPDATE elimfilters_catalog');
  assert.ok(evidencePos>=0);
  assert.ok(updatePos>evidencePos);
});
