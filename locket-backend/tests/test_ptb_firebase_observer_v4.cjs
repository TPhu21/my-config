'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../ptb-firebase-observer-v4.js'),'utf8');
const alerts=[], cache={};
function run(url, body) {
  const outputs=[];
  const sandbox={
    $request:{url,headers:{Authorization:'Bearer VERY_SECRET'},body:'PRIVATE_PHOTO'},
    $notification:{post:(...args)=>alerts.push(args)},
    $persistentStore:{read:k=>cache[k]||null,write:(v,k)=>{cache[k]=v;return true;}},
    $done:v=>outputs.push(v)
  };
  if(body!==undefined) sandbox.$response={body,status:200};
  vm.runInNewContext(code,sandbox,{timeout:1000});
  assert.equal(outputs.length,1);
  assert.equal(JSON.stringify(outputs[0]),'{}');
}
const url='https://firebaseremoteconfig.googleapis.com/v1/projects/641029076083/namespaces/firebase:fetch';
run(url);
run(url,JSON.stringify({entries:{camera_filter_config:JSON.stringify({sheet_filters:[{title:{en:'Photobooth'},filter_ids:['photobooth_4cut']}],remote_filters:[{id:'photobooth_4cut'}]})}}));
run('https://api.locketcamera.com/getFilters',JSON.stringify({result:{data:{filters:[{id:'photobooth_4cut'},{id:'ordinary_filter'}]}}}));
run('https://api.locketcamera.com/getFilters',JSON.stringify({result:{data:{filters:[]}}}));
run('https://firebaseremoteconfigrealtime.googleapis.com/v1/projects/641029076083/namespaces/firebase:streamFetchInvalidations');
assert.equal(alerts.length,3);
assert.ok(alerts.some(a=>a[2].includes('Bắt được request')));
assert.ok(alerts.some(a=>a[2].includes('nhóm=1') && a[2].includes('PTB=có')));
assert.ok(alerts.some(a=>a[2].includes('filters=2') && a[2].includes('PTB IDs=1')));
assert.ok(alerts.every(a=>a[0].startsWith('PTB V4')));
const all=JSON.stringify(alerts);
assert.ok(!all.includes('VERY_SECRET'));
assert.ok(!all.includes('PRIVATE_PHOTO'));
assert.ok(!all.includes('641029076083'));
console.log('PASS PTB V4 iPhone-visible metadata summaries; read-only, token-free, one-time');
