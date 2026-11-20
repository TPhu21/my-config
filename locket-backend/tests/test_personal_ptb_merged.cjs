'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function execute(file) {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  const out = [];
  vm.runInNewContext(code, {
    $request:{url:'https://firebaseremoteconfig.googleapis.com/v1/projects/locket-test',headers:{'User-Agent':'Locket/1.0'}},
    $response:{body:JSON.stringify({entries:{example:'unchanged'},eTag:'synthetic-test'})},
    $done:v=>out.push(v),
  },{timeout:5000});
  assert.equal(out.length,1);
  return JSON.parse(out[0].body);
}
const previous=execute('backups/locket-personal-before-ptb-20261120.js');
const updated=execute('../locket-personal.js');
assert.equal(previous.entries.feature_gates,updated.entries.feature_gates);
assert.equal(previous.entries.upsell_features,updated.entries.upsell_features);
assert.equal(previous.entries.paywall_presentation_config,updated.entries.paywall_presentation_config);
assert.equal(previous.entries.camera,updated.entries.camera);
assert.equal(previous.entries.camera_roll,updated.entries.camera_roll);
assert.equal(previous.entries.widget_frame_event,updated.entries.widget_frame_event);
for(const key of Object.keys(previous.entries)){
  if(key!=='camera_filter_config') assert.equal(previous.entries[key],updated.entries[key],key+' changed');
}
const oldCfg=JSON.parse(previous.entries.camera_filter_config);
const newCfg=JSON.parse(updated.entries.camera_filter_config);
assert.equal(newCfg.sheet_filters.length,oldCfg.sheet_filters.length+1);
assert.equal(newCfg.sheet_filters[0].title.en,oldCfg.sheet_filters[0].title.en);
assert.equal(newCfg.sheet_filters[newCfg.sheet_filters.length-1].title.en,'PTB Preview (Test)');
assert.equal(newCfg.remote_filters.length,10);
assert.ok(newCfg.remote_filters.every(x=>x.iconUrl.startsWith('https://phu-private-photo-studio.onrender.com/')));
assert.equal(newCfg.picker_filters.length,oldCfg.picker_filters.length+10);
console.log('PASS personal Remote Config: only camera_filter_config changed; 10 PTB previews; old settings preserved');
