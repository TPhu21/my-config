'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const observer = fs.readFileSync(path.join(__dirname, '..', 'ptb-contract-v2.js'), 'utf8');
function invoke(req, resp) {
  const logs = [], outputs = [];
  const context = {
    $request: req,
    $done: value => outputs.push(value),
    console: {log: value => logs.push(value)}
  };
  if (resp) context.$response = resp;
  vm.runInNewContext(observer, context, {timeout: 1000});
  assert.equal(outputs.length, 1);
  assert.equal(JSON.stringify(outputs[0]), '{}');
  return logs.join('\n');
}
const secretUrl = 'https://api.locketcamera.com/generateFilteredImage?token=SECRET_QUERY';
const req = {url: secretUrl, method: 'POST',
  headers: {Authorization:'Bearer SECRET_TOKEN', 'X-API-Key':'ANOTHER_SECRET'},
  body: JSON.stringify({uid:'USER_UID', image:'PRIVATE_PHOTO_DATA'})};
const result = invoke(req);
assert.match(result, /PTB-CONTRACT-V2.*phase=request action=generateFilteredImage method=POST/);
for (const secret of ['SECRET_QUERY','SECRET_TOKEN','ANOTHER_SECRET','USER_UID','PRIVATE_PHOTO_DATA']) {
  assert.equal(result.includes(secret), false);
}
const response = invoke(req, {status: 200,
  headers: {'Content-Type':'application/json'},
  body:'SUPER_PRIVATE_RESPONSE_IMAGE'});
assert.match(response, /phase=response action=generateFilteredImage method=POST status=200/);
assert.equal(response.includes('SUPER_PRIVATE_RESPONSE_IMAGE'), false);
assert.equal(invoke({url:'https://api.locketcamera.com/getUserAccount?token=SECRET_QUERY'}), '');
assert.equal(invoke({url:'https://example.com/generateFilteredImage'}), '');
console.log('Metadata-only PTB contract observer tests passed');
