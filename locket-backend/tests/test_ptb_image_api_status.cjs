'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../ptb-image-api-status-only.js'),'utf8');
const notifications=[],cache={};
function run(url,responseStatus){
 const sent=[];
 const ctx={
 $request:{url,method:'POST',headers:{Authorization:'Bearer PRIVATE_TOKEN'},body:'PRIVATE_IMAGE'},
 $notification:{post:(...args)=>notifications.push(args)},
 $persistentStore:{read:k=>cache[k]||null,write:(v,k)=>{cache[k]=v;return true;}},
 $done:out=>sent.push(out)};
 if(responseStatus!==undefined)ctx.$response={status:responseStatus,body:'PRIVATE_RESPONSE',headers:{'X-Secret':'PRIVATE_TOKEN'}};
 vm.runInNewContext(code,ctx,{timeout:1000});
 assert.equal(sent.length,1);
 assert.equal(JSON.stringify(sent[0]),'{}');
}
run('https://us-central1-locket-4252a.cloudfunctions.net/generateFilteredImage');
run('https://us-central1-locket-4252a.cloudfunctions.net/generateFilteredImage',403);
run('https://us-central1-locket-4252a.cloudfunctions.net/generateFilteredImage',500);
run('https://api.locketcamera.com/createOverlay',429);
run('https://api.locketcamera.com/getAccount',401);
run('https://unauthorized.example.com/generateFilteredImage',200);
assert.equal(notifications.length,3);
const body=JSON.stringify(notifications);
assert.ok(body.includes('Request đã gửi'));
assert.ok(body.includes('Response HTTP 403'));
assert.ok(body.includes('Response HTTP 429'));
assert.ok(!body.includes('PRIVATE_TOKEN'));
assert.ok(!body.includes('PRIVATE_IMAGE'));
assert.ok(!body.includes('PRIVATE_RESPONSE'));
console.log('PASS PTB API status-only observer: no sensitive payload, known endpoints only, deduped notifications');
