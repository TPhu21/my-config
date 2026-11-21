const assert=require('assert'), fs=require('fs'), vm=require('vm');
const script=fs.readFileSync('ptb-hook-check.js','utf8');
const moduleText=fs.readFileSync('ptb-hook-check.sgmodule','utf8');
assert.ok(moduleText.includes('requires-body=false'));
assert.ok(moduleText.includes('api.locketcamera.com'));
function test(url, expected) {
  let done, notices=[], logs=[];
  vm.runInNewContext(script,{
    $request:{url},
    $done:x=>{done=x},
    $notification:{post:(...p)=>notices.push(p)},
    console:{log:x=>logs.push(x)}
  },{timeout:1000});
  assert.deepStrictEqual(Object.keys(done),[]);
  assert.ok(notices.some(x=>x.includes(expected)), JSON.stringify(notices));
  assert.ok(logs.some(x=>x.includes(expected)),JSON.stringify(logs));
}
test('https://api.locketcamera.com/getFilters','FILTERS_HOOK_ACTIVE');
test('https://api.locketcamera.com/generateFilteredImage','GENERATE_HOOK_ACTIVE');
console.log('PASS read-only hook check notifications and non-interference');
