const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const src = fs.readFileSync(path.join(__dirname, "../ptb-image-delivery-observer.js"),"utf8");
function run(url, response) {
  const messages=[]; let done=false;
  vm.runInNewContext(src, {
    $request:{url,method:"GET"}, $response:response,
    $notification:{post:(...x)=>messages.push(x.join(" "))},
    console:{log:(x)=>messages.push(x)},
    $done:(x)=>{assert.equal(JSON.stringify(x),"{}");done=true;}
  });
  assert.ok(done);
  return messages.join(" ");
}
const secret="PRIVATE_PHOTO_TOKEN_123";
const out=run("https://163.223.9.98/ai-filters/filter_"+secret+"?token="+secret,
  {status:200,headers:{"Content-Type":"image/png; charset=binary","X-API-Key":secret},body:secret});
assert.match(out,/route=ai-filters; method=GET; HTTP=200; type=image\/png/);
assert.ok(!out.includes(secret));
assert.equal(run("https://163.223.9.98/getGroupsState",{status:200}),"");
assert.equal(run("https://example.com/ai-filters/test",{status:200}),"");
assert.equal(run("https://163.223.9.98/ai-filters/test",{status:200,headers:{"content-type":"text/html"}}).includes("type=other"),true);
console.log("PASS: scoped image-delivery observer never reveals URL or photo contents");
