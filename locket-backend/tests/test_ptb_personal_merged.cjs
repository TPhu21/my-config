'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'../locket-personal.js'),'utf8');
const combined=fs.readFileSync(path.join(root,'ptb-remoteconfig-personal-merged.js'),'utf8');
const moduleText=fs.readFileSync(path.join(root,'ptb-getfilters-test.sgmodule'),'utf8');
assert.match(moduleText,/Personal \+ Photobooth - ISOLATED TEST/);
assert.match(moduleText,/ptb-remoteconfig-personal-merged\.js/);
assert.match(moduleText,/projects\\\/\[0-9\]\+/);
assert.equal((moduleText.match(/type=http-response/g)||[]).length,2);
assert.equal((moduleText.match(/type=http-request/g)||[]).length,0);
assert.equal(moduleText.includes('api.revenuecat.com'),false);
assert.equal(moduleText.includes('us-central1-locket-4252a.cloudfunctions.net'),false);
assert.ok(combined.startsWith(source.slice(0,5000)));
assert.ok(combined.length>source.length);
const synthetic={state:'UPDATE',entries:{keep_key:'unchanged',feature_gates:JSON.stringify({existing_gate:'disabled'}),camera_filter_config:JSON.stringify({sheet_filters:[{title:{en:'Goofy'},filter_ids:['okay_wig']}],picker_filters:['okay_wig'],remote_filters:[]})}};
function evaluate(code){
 const outputs=[];
 vm.runInNewContext(code,{
  $request:{url:'https://firebaseremoteconfig.googleapis.com/v1/projects/641029076083/namespaces/firebase:fetch',
    headers:{'User-Agent':'Locket/4404',Authorization:'Bearer SECRET_KEY'}},
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
console.log('PASS PTB merged personal script: all non-filter settings preserved, 45s retained, PTB shown and no secret leakage');
