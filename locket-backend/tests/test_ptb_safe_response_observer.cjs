const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(require("node:path").join(__dirname, "../ptb-safe-response-observer.js"), "utf8");
function run(url, contentType, body) {
  const messages = [];
  let ended = false;
  const context = {
    $request: {url},
    $response: {status: 200, headers: {"Content-Type": contentType}, body},
    $notification: {post: (...args) => messages.push(args)},
    $done: (value) => {assert.equal(JSON.stringify(value), "{}"); ended = true;},
    console: {log: (x) => messages.push([x])}
  };
  vm.runInNewContext(source, context);
  assert.equal(ended, true);
  return messages;
}
const sensitive = "SECRET_TOKEN_LOCATION_DO_NOT_EXPOSE";
const body = JSON.stringify({
  result: {status: 200, errors: [], image_url: "https://example.test/" + sensitive, job_id: sensitive, data: {url: "https://example.test/" + sensitive, image_url: sensitive, status: 200}},
  untrusted: sensitive, authorization: sensitive, account_id: sensitive
});
const result = run("https://163.223.9.98/generateFilteredImage", "application/json; charset=utf-8", body);
assert.ok(result.length > 0);
assert.ok(result.map(x => x.join(" ")).join(" ").includes("image_url:string"));
assert.ok(result.map(x => x.join(" ")).join(" ").includes("data={status:number,url:string,image_url:string}"));
assert.ok(result.map(x => x.join(" ")).join(" ").includes("app_status=200"));
assert.ok(!JSON.stringify(result).includes(sensitive));
assert.deepEqual(run("https://api.revenuecat.com/subscribers/user", "application/json", body), []);
assert.deepEqual(run("https://163.223.9.98/postMomentV2", "application/json", body), []);
const malformed = run("https://us-central1-locket-4252a.cloudfunctions.net/generateFilteredImage", "application/json", "{");
assert.ok(malformed.length);
console.log("PASS: read-only PTB observer emits type-only sanitized metadata");
