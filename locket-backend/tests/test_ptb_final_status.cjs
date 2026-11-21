'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('ptb-final-getfilters.js','utf8');
const url='https://api.locketcamera.com/getFilters';
function rewrite(status, statusCode) {
  let done;
  vm.runInNewContext(code,{
    $request:{url},
    $response:{status,statusCode,body:JSON.stringify({result:{data:{filters:[]}}}),headers:{}},
    $done:x=>done=x
  },{timeout:1000});
  return done;
}
for(const status of [200,'200','HTTP/1.1 200 OK','HTTP/2 200']) {
  const out=rewrite(status,undefined);
  assert.ok(out && out.body, 'valid HTTP200 must be processed: '+status);
  const filters=JSON.parse(out.body).result.data.filters;
  assert.equal(filters.length,10);
}
assert.ok(!rewrite('HTTP/1.1 403 Forbidden',undefined).body);
assert.ok(!rewrite(500,undefined).body);
console.log('PASS final getFilters handles status lines, numeric status and preserves HTTP errors');
