'use strict';

const assert = require('assert');
const { pageSupportsCrossReference } = require('../lib/donaldson-official-evidence');

const officialLikePage = `
<html><body>
<h1>P551313</h1>
<section>(OEM) Cross Reference (See Details)</section>
<div>CATERPILLAR 1R-0750</div>
</body></html>`;

assert.equal(pageSupportsCrossReference(officialLikePage, 'P551313', '1R0750'), true);
assert.equal(pageSupportsCrossReference(officialLikePage, 'P551313', 'FF5320'), false);
assert.equal(pageSupportsCrossReference('<h1>P551313</h1><div>1R0750</div>', 'P551313', '1R0750'), false);
assert.equal(pageSupportsCrossReference(officialLikePage, 'P999999', '1R0750'), false);

console.log('donaldson official evidence regression tests passed');
