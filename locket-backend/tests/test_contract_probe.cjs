'use strict';
// Run: node tests/test_contract_probe.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const script = fs.readFileSync(path.join(__dirname, '..', 'locket-contract-probe.js'), 'utf8');
function invoke(req, resp) {
  const logs = [], outputs = [];
  const context = {$request:req, console:{log: s => logs.push(s)}, $done:v=>outputs.push(v)};
  if(resp!==undefined)context.$response=resp;
  vm.runInNewContext(script, context, {timeout:1000});
  assert.equal(outputs.length,1);
  assert.equal(JSON.stringify(outputs[0]),'{}');
  return logs.join('\n');
}
const url='https://api.locketcamera.com/generateFilteredImage?token=VERY_SECRET';
const log=invoke({
  url, method:'POST',
  headers:{Authorization:'Bearer PRIVATE', 'Content-Type':'application/json'},
  body:JSON.stringify({filter_id:'NOT_FOR_LOG', image:'BINARY_SECRET', token:'SECRET'})
});
assert.match(log,/REQUEST endpoint=generateFilteredImage/);
assert.match(log,/filter_id/);
for(const secret of ['VERY_SECRET','NOT_FOR_LOG','BINARY_SECRET','SECRET','Bearer PRIVATE'])assert.equal(log.includes(secret),false);
const response=invoke({url, method:'POST'},{
  status:200, headers:{'content-type':'application/json'},
  body:JSON.stringify({result:{image_url:'https://x.test/private-image.png'},uid:'PRIVATE_UID'})
});
assert.match(response,/RESPONSE endpoint=generateFilteredImage/);
assert.equal(response.includes('PRIVATE_UID'),false);
assert.equal(response.includes('private-image.png'),false);
assert.equal(invoke({url:'https://api.locketcamera.com/updateAccount',method:'GET'}),'');
const huge=invoke({url,headers:{'content-type':'application/json'},body:'X'.repeat(30000)});
assert.match(huge,/not read/);
console.log('Locket contract probe: 4 assertions groups passed.');
