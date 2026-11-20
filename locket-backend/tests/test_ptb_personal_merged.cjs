'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'../locket-personal.js'),'utf8');
const combined=fs.readFileSync(path.join(root,'ptb-remoteconfig-personal-merged.js'),'utf8');
const moduleText=fs.readFileSync(path.join(root,'ptb-getfilters-test.sgmodule'),'utf8');
assert.match(moduleText,/PTB Personal \+ Photobooth - COMPAT V2/);
assert.match(moduleText,/ptb-remoteconfig-personal-merged\.js/);
assert.match(moduleText,/projects\\\/\[\^\/\]\+/);
assert.equal((moduleText.match(/type=http-response/g)||[]).length,2);
assert.equal((moduleText.match(/type=http-request/g)||[]).length,0);
assert.equal(moduleText.includes('api.revenuecat.com'),false);
assert.equal(moduleText.includes('163.223.9.98'),false);
assert.ok(combined.includes('var MY_VIDEO_DURATION = 45.0;'));
assert.ok(combined.includes('remoteConfigFetch'));
assert.ok(combined.length>source.length);
const synthetic={state:'UPDATE',entries:{keep_key:'unchanged',feature_gates:JSON.stringify({existing_gate:'disabled'}),camera_filter_config:JSON.stringify({sheet_filters:[{title:{en:'Goofy'},filter_ids:['okay_wig']}],picker_filters:['okay_wig'],remote_filters:[]})}};
function evaluate(code, userAgent='Locket/4404'){
 const outputs=[];
 vm.runInNewContext(code,{
  $request:{url:'https://firebaseremoteconfig.googleapis.com/v1/projects/641029076083/namespaces/firebase:fetch',
    headers:{'User-Agent':userAgent,Authorization:'Bearer SECRET_KEY'}},
  $response:{body:JSON.stringify(synthetic),status:200},
  $done:payload=>outputs.push(payload)
 },{timeout:6000});
 assert.equal(outputs.length,1);
 return JSON.parse(outputs[0].body);
}
const old=evaluate(source);
const next=evaluate(combined);
assert.equal(next.entries.keep_key,'unchanged');
assert.deepEqual(Object.keys(next.entries).sort(),Object.keys(old.entries).sort());
for(const key of Object.keys(old.entries)){
 if(key!=='camera_filter_config' && key!=='feature_gates')
   assert.equal(next.entries[key],old.entries[key],'personal config changed: '+key);
}
assert.equal(JSON.parse(next.entries.camera).gold_max_duration,45);
assert.equal(JSON.parse(next.entries.camera_roll).gold_max_duration,45);
assert.equal(next.entries.camera_roll_video_max_duration,'45');
assert.equal(next.entries.audio_session_deactivation_enabled,old.entries.audio_session_deactivation_enabled);
const gates=JSON.parse(next.entries.feature_gates);
assert.equal(gates.longer_video,'enabled');
assert.equal(gates.video,'enabled');
assert.equal(gates.camera_filter_sheet,'enabled');
const cfg=JSON.parse(next.entries.camera_filter_config);
assert.ok(cfg.sheet_filters.some(g=>g.title.en==='Photobooth 📸' && g.filter_ids.length===10));
assert.equal(cfg.remote_filters.length,10);
assert.equal(cfg.picker_filters.length>=10,true);
assert.ok(!JSON.stringify(next).includes('SECRET_KEY'));
// iOS Firebase SDK may call :fetch without a Locket User-Agent.
// Original personal rewrite skips it, while the merged numeric-project handler must
// still apply BOTH personal settings and PTB to the *same* response.
for(const agent of ['Firebase/11.0.0 iOS', 'Mozilla/5.0', '']){
  const before=evaluate(source,agent);
  assert.equal(before.entries.camera,undefined);
  const after=evaluate(combined,agent);
  assert.equal(JSON.parse(after.entries.camera).gold_max_duration,45);
  assert.equal(after.entries.camera_roll_video_max_duration,'45');
  assert.equal(after.entries.audio_session_deactivation_enabled,'true');
  const config=JSON.parse(after.entries.camera_filter_config);
  assert.ok(config.sheet_filters.some(g=>g.title.en==='Photobooth 📸' && g.filter_ids.length===10));
  assert.equal(config.remote_filters.length,10);
  assert.equal(JSON.parse(after.entries.feature_gates).longer_video,'enabled');
}
const notices=[];
const cache={};
function executeWithNotifications(){
  const outputs=[];
  vm.runInNewContext(combined, {
    $request:{
      url:'https://firebaseremoteconfig.googleapis.com/v1/projects/641029076083/namespaces/firebase:fetch',
      headers:{'User-Agent':'Firebase/11.0.0',Authorization:'Bearer SECRET_KEY'},
    },
    $response:{body:JSON.stringify(synthetic),status:200},
    $notification:{post:(...args)=>notices.push(args)},
    $persistentStore:{
      read:key=>cache[key]||null,
      write:(value,key)=>{cache[key]=value;return true;}
    },
    $done:value=>outputs.push(value)
  },{timeout:6000});
  assert.equal(outputs.length,1);
  const output=JSON.parse(outputs[0].body);
  assert.equal(JSON.parse(output.entries.camera).gold_max_duration,45);
}
executeWithNotifications();
executeWithNotifications();
assert.equal(notices.length,1);
assert.equal(notices[0][2].includes('10 mẫu PTB'),true);
assert.equal(JSON.stringify(notices).includes('SECRET_KEY'),false);

function evaluateForProject(projectID, userAgent) {
 const outputs=[];
 vm.runInNewContext(combined,{
  $request:{url:'https://firebaseremoteconfig.googleapis.com/v1/projects/'+projectID+'/namespaces/firebase:fetch',headers:{'User-Agent':userAgent,Authorization:'Bearer SECRET_KEY'}},
  $response:{body:JSON.stringify(synthetic),status:200},
  $done:p=>outputs.push(p)
 },{timeout:6000});
 assert.equal(outputs.length,1);
 return JSON.parse(outputs[0].body);
}
const compiledModuleRule=moduleText.split('\n').find(line=>line.startsWith('ptb_firebase_catalog = '));
assert.ok(compiledModuleRule);
assert.ok(!compiledModuleRule.includes('[0-9]+'));
assert.ok(compiledModuleRule.includes('[^/]+'));
for (const [project,agent] of [
  ['641029076083','Firebase/11.0.0'],
  ['locket-4252a','Locket/2.73'],
  ['locket-4252a','Firebase/11.0.0']
]) {
 const response=evaluateForProject(project,agent);
 const filters=JSON.parse(response.entries.camera_filter_config);
 assert.equal(JSON.parse(response.entries.camera).gold_max_duration,45);
 assert.ok(filters.sheet_filters.some(group=>group.title.en==='Photobooth 📸' && group.filter_ids.length===10));
}
console.log('PASS PTB merged personal script: all non-filter settings preserved, 45s retained, PTB shown and no secret leakage');
