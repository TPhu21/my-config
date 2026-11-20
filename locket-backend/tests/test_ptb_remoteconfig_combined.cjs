'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'../ptb-remoteconfig-combined.js'),'utf8');
const moduleText=fs.readFileSync(path.join(__dirname,'../ptb-getfilters-test.sgmodule'),'utf8');
assert.ok(moduleText.includes('PTB Personal + Photobooth - ISOLATED TEST'));
assert.equal((moduleText.match(/type=http-response/g)||[]).length,3);
assert.equal((moduleText.match(/type=http-request/g)||[]).length,1);
assert.equal(moduleText.includes('api.revenuecat.com'),false);
assert.equal(moduleText.includes('163.223.9.98'),false);
const notes=[];
const store={};
function run(url, body, status=200) {
 const outputs=[];
 vm.runInNewContext(script,{
   $request:{url,headers:{Authorization:'Bearer PRIVATE_TOKEN'},body:'PRIVATE_PHOTO'},
   $response:{body:typeof body==='string'?body:JSON.stringify(body),status,
    headers:{'Content-Length':'900','ETag':'private-etag','X-Original':'keep'}},
   $notification:{post:(...args)=>notes.push(args)},
   $persistentStore:{read:k=>store[k]||null,write:(v,k)=>{store[k]=v;return true;}},
   $done:out=>outputs.push(out)
 },{timeout:1000});
 assert.equal(outputs.length,1);
 return outputs[0];
}
const url='https://firebaseremoteconfig.googleapis.com/v1/projects/641029076083/namespaces/firebase:fetch';
const original={entries:{
 feature_gates:JSON.stringify({app_icon_picker:'enabled',remove_ads:'disabled'}),
 camera_filter_config:JSON.stringify({sheet_filters:[{title:{en:'Goofy'},filter_ids:['old']}],
  picker_filters:['old'],remote_filters:[{id:'old',name:'Existing'}]}),
 other:'keep'
 },templateVersion:'previous'};
const first=run(url,original);
const json=JSON.parse(first.body);
assert.equal(first.headers['X-Original'],'keep');
assert.equal(first.headers['Content-Length'],undefined);
assert.equal(first.headers.ETag,undefined);
assert.equal(json.entries.other,'keep');
assert.equal(json.templateVersion,'previous');
const gates=JSON.parse(json.entries.feature_gates);
assert.equal(gates.app_icon_picker,'enabled');
assert.equal(gates.remove_ads,'disabled');
assert.equal(gates.camera_filter_sheet,'enabled');
assert.equal(gates.camera_filter_button,'enabled');
const cfg=JSON.parse(json.entries.camera_filter_config);
assert.equal(cfg.sheet_filters.length,2);
assert.equal(cfg.sheet_filters[0].title.en,'Goofy');
assert.equal(cfg.sheet_filters[1].title.en,'Photobooth 📸');
assert.equal(cfg.sheet_filters[1].filter_ids.length,10);
assert.equal(cfg.remote_filters.length,11);
assert.equal(cfg.filters.length,10);
assert.equal(cfg.picker_filters.length,11);
assert.equal(cfg.sheetFilters.length,2);
assert.equal(cfg.remoteFilters.length,11);
assert.equal(cfg.pickerFilters.length,11);
assert.ok(cfg.remote_filters.slice(1).every(f=>f.iconUrl.startsWith('https://phu-private-photo-studio.onrender.com/')));
assert.equal(notes.length,1);
assert.ok(notes[0][2].includes('10 mẫu'));
const again=run(url,json);
const againCfg=JSON.parse(JSON.parse(again.body).entries.camera_filter_config);
assert.equal(againCfg.sheet_filters.length,2);
assert.equal(againCfg.remote_filters.length,11);
assert.equal(againCfg.picker_filters.length,11);
assert.equal(notes.length,1);
assert.equal(JSON.stringify(run('https://firebaseremoteconfigrealtime.googleapis.com/v1/projects/641029076083/namespaces/firebase:streamFetchInvalidations',original)),'{}');
assert.equal(JSON.stringify(run('https://firebaseremoteconfig.googleapis.com/v1/projects/641029076083/namespaces/firebase:fetch',original,403)),'{}');
assert.equal(JSON.stringify(run(url,'invalid json')),'{}');
assert.equal(JSON.stringify(run('https://api.locketcamera.com/getFilters',original)),'{}');
const named=run('https://firebaseremoteconfig.googleapis.com/v1/projects/locket-4252a/namespaces/firebase:fetch',original);
assert.ok(named.body);
const output=JSON.stringify(first)+JSON.stringify(notes);
assert.equal(output.includes('PRIVATE_TOKEN'),false);
assert.equal(output.includes('PRIVATE_PHOTO'),false);
assert.equal(output.includes('163.223.9.98'),false);
console.log('PASS combined PTB Firebase catalog: 10 assets, UI gating only, old settings preserved, idempotent and private');
