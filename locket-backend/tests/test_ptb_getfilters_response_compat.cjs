'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const code = fs.readFileSync(path.join(__dirname, '..', 'ptb-getfilters-response-compat.js'), 'utf8');
const mod = fs.readFileSync(path.join(__dirname, '..', 'ptb-getfilters-test.sgmodule'), 'utf8');
assert.match(mod, /PTB Combined Catalog - ISOLATED TEST/);
assert.equal((mod.match(/type=http-response/g) || []).length, 2);
assert.equal((mod.match(/type=http-request/g) || []).length, 0);
assert.equal(mod.includes('revenuecat.com'), false);
assert.equal(mod.includes('firebaseremoteconfig'), true);
const notifications = [];
const seen = {};
function call(url, source, status=200) {
 const outputs = [];
 vm.runInNewContext(code,{
   $request:{url,headers:{Authorization:'Bearer SECRET_TOKEN'},body:'PRIVATE_IMAGE'},
   $response:{body:typeof source==='string'?source:JSON.stringify(source),status,
      headers:{'Content-Length':'99','ETag':'etag','X-Test':'kept'}},
   $persistentStore:{read:key=>seen[key]||null, write:(value,key)=>{seen[key]=value;return true;}},
   $notification:{post:(...args)=>notifications.push(args)},
   $done:(result)=>outputs.push(result)
 },{timeout:1500});
 assert.equal(outputs.length,1);
 return outputs[0];
}
const original={result:{status:200,data:{filters:[{id:'existing',name:'Existing',imageUrl:'https://example.com/icon'}],friend_filters:[{id:'friendFilter'}],other:'untouched'}},existing:'keep'};
const out=call('https://api.locketcamera.com/getFilters',original);
assert.equal(out.headers['X-Test'],'kept');
assert.equal(out.headers['Content-Length'],undefined);
assert.equal(out.headers.ETag,undefined);
const body=JSON.parse(out.body);
assert.equal(body.existing,'keep');
assert.equal(body.result.status,200);
assert.equal(body.result.data.other,'untouched');
assert.equal(body.result.data.filters.length,11);
assert.equal(body.result.data.friend_filters[0].id,'friendFilter');
assert.equal(body.data.filters.length,11);
assert.equal(body.result.data.filters[0].id,'existing');
const added=body.result.data.filters.slice(1);
assert.ok(added.every(item=>item.iconUrl.startsWith('https://phu-private-photo-studio.onrender.com/')));
assert.ok(added.every(item=>item.category==='Photobooth 📸'));
assert.deepEqual(added.map(item=>item.id).length,new Set(added.map(item=>item.id)).size);
const repeated=call('https://api.locketcamera.com/getFilters',body);
assert.equal(JSON.parse(repeated.body).result.data.filters.length,11);
assert.equal(notifications.length,1);
assert.ok(notifications[0][2].includes('10 mẫu'));
const flat=JSON.stringify(out)+JSON.stringify(notifications);
assert.equal(flat.includes('SECRET_TOKEN'),false);
assert.equal(flat.includes('PRIVATE_IMAGE'),false);
assert.equal(flat.includes('163.223.9.98'),false);
assert.equal(JSON.stringify(call('https://api.locketcamera.com/getAccount',original)),'{}');
assert.equal(JSON.stringify(call('https://other.example/getFilters',original)),'{}');
assert.equal(JSON.stringify(call('https://api.locketcamera.com/getFilters',original,403)),'{}');
assert.equal(JSON.stringify(call('https://api.locketcamera.com/getFilters','invalid')),'{}');
console.log('PASS isolated getFilters response compatibility: preserved API data, +10, strict scope, no secrets');
