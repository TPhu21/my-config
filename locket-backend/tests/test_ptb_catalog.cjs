'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync(require('node:path').join(__dirname, '..', 'locket-ptb-catalog-test.js'), 'utf8');
function run(body, url = 'https://firebaseremoteconfig.googleapis.com/v1/projects/locket-test/namespaces/firebase:fetch') {
  const outputs = [];
  vm.runInNewContext(code, {
    $request:{url}, $response:{body, headers:{'Content-Length':'123','ETag':'old','X-Safe':'keep'}},
    $done:value=>outputs.push(value)
  }, {timeout:1000});
  assert.equal(outputs.length, 1);
  return outputs[0];
}
const original = {entries:{
  feature_gates:'{"video":"enabled"}',
  camera_filter_config:JSON.stringify({
    sheet_filters:[{title:{en:'Goofy'},filter_ids:['okay_wig']}],
    picker_filters:['okay_wig']
  }), other_setting:'preserved'
}};
const first=run(JSON.stringify(original));
const json=JSON.parse(first.body);
const config=JSON.parse(json.entries.camera_filter_config);
assert.equal(json.entries.other_setting,'preserved');
assert.equal(json.entries.feature_gates,original.entries.feature_gates);
assert.equal(config.sheet_filters[0].title.en,'Goofy');
assert.equal(config.sheet_filters[1].title.en,'PTB Preview (Test)');
assert.equal(config.sheet_filters[1].filter_ids.length,10);
assert.equal(config.remote_filters.length,10);
assert.ok(config.remote_filters.every(r=>r.iconUrl.startsWith('https://phu-private-photo-studio.onrender.com/')));
assert.equal(first.headers['X-Safe'],'keep');
assert.equal(first.headers.ETag,undefined);
assert.equal(first.headers['Content-Length'],undefined);
const second=run(first.body);
const secondConfig=JSON.parse(JSON.parse(second.body).entries.camera_filter_config);
assert.equal(secondConfig.sheet_filters.length,2);
assert.equal(secondConfig.remote_filters.length,10);
assert.equal(JSON.stringify(run('invalid json')),'{}');
assert.equal(JSON.stringify(run(JSON.stringify(original),'https://example.com/no')),'{}');
assert.ok(!first.body.includes('163.223.9.98'));
assert.ok(!first.body.includes('revenuecat'));
console.log('PASS isolated PTB catalog: no third-party redirection, settings preserved, idempotent, synthetic payload');
