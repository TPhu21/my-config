'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../ptb-firebase-observer-v3.js'),'utf8');
const notifications=[];
const cache={};
function run(url, body) {
 const result=[];
 const ctx={
  $request:{url,headers:{Authorization:'Bearer SUPER_SECRET_PRIVATE'},body:'PRIVATE_PHOTO'},
  $notification:{post:(...args)=>notifications.push(args)},
  $persistentStore:{read:key=>cache[key]||null,write:(v,key)=>{cache[key]=v;return true;}},
  $done:r=>result.push(r),
 };
 if (body!==undefined) ctx.$response={body, status:200};
 vm.runInNewContext(code,ctx,{timeout:1000});
 assert.equal(result.length,1);
 assert.equal(JSON.stringify(result[0]),'{}'); // Observational only
}
const rcUrl='https://firebaseremoteconfig.googleapis.com/v1/projects/641029076083/namespaces/firebase:fetch';
const cfg={entries:{camera_filter_config:JSON.stringify({
 sheet_filters:[{title:{en:'Photobooth 📸'},filter_ids:['photobooth_4cut']}],
 remote_filters:[{id:'photobooth_4cut',token:'SHOULD_NOT_LEAK'}]
})}};
run(rcUrl);
run(rcUrl,JSON.stringify(cfg));
run(rcUrl,JSON.stringify(cfg));
run('https://api.locketcamera.com/getFilters',JSON.stringify({result:{data:{filters:[{id:'PRIVATE_FILTER_ID'}]}}}));
run('https://api.locketcamera.com/getFilters',JSON.stringify({result:{data:{filters:[{id:'PRIVATE_FILTER_ID'}]}}}));
run('https://firebaseremoteconfigrealtime.googleapis.com/v1/projects/641029076083/namespaces/firebase:streamFetchInvalidations');
run('https://api.locketcamera.com/getAccount',JSON.stringify(cfg));
assert.equal(notifications.length,3);
const all=JSON.stringify(notifications);
assert.ok(all.includes('Firebase fetch'));
assert.ok(all.includes('Firebase response'));
assert.ok(all.includes('nhóm PTB=có'));
assert.ok(all.includes('getFilters response'));
assert.ok(all.includes('filters=1'));
assert.ok(!all.includes('SUPER_SECRET'));
assert.ok(!all.includes('PRIVATE_PHOTO'));
assert.ok(!all.includes('PRIVATE_FILTER_ID'));
assert.ok(!all.includes('SHOULD_NOT_LEAK'));
assert.ok(!all.includes('641029076083'));
console.log('PASS Firebase/getFilters metadata-only V3 observer (notifications, dedup, strict scope, privacy)');
