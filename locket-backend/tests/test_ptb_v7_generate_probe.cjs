const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync('ptb-v7-generate-probe.js', 'utf8');
const moduleText = fs.readFileSync('ptb-v7-generate-probe.sgmodule', 'utf8');
assert.ok(moduleText.includes('requires-body=false'));
assert.ok(moduleText.includes('us-central1-locket-4252a'));
const test = (url, body, expected) => {
  let done; const notes = [], logs = [];
  vm.runInNewContext(code, {
    $request: { url, body },
    $done: x => { done = x; },
    $notification: { post: (...args) => notes.push(args.join(' ')) },
    console: { log: x => logs.push(x) }
  }, { timeout: 1000 });
  assert.equal(Object.keys(done).length, 0, 'Script must be read-only');
  if (expected) {
    assert.ok(notes.some(x => x.includes(expected)), JSON.stringify(notes));
    assert.ok(logs.some(x => x.includes(expected)), JSON.stringify(logs));
  } else assert.equal(notes.length, 0);
  assert.ok(!JSON.stringify(notes).includes('SECRET_IMAGE_URL'));
};
test('https://api.locketcamera.com/generateFilteredImage', JSON.stringify({
  filter_id: 'pb_vintage', image_url: 'SECRET_IMAGE_URL', filter_type: 'normal'
}), 'GENERATE_HOOK_OK host=API');
test('https://us-central1-locket-4252a.cloudfunctions.net/generateFilteredImage',
  undefined, 'GENERATE_HOOK_OK host=CLOUD_FUNCTION BODY_UNAVAILABLE');
test('https://api.locketcamera.com/getFilters', '{}', null);
console.log('PASS PTB V7 two-host safe read-only hook probe');
