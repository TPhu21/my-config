'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../ptb-getfilters-test.js'),'utf8');
function execute(url) {
 const events=[];
 vm.runInNewContext(code,{
  $request:{url,method:'POST',headers:{Authorization:'Bearer PRIVATE_DO_NOT_COPY'},body:'PHOTO_PRIVATE'},
  $done:result=>events.push(result)
 },{timeout:1000});
 assert.equal(events.length,1);
 return events[0];
}
const res=execute('https://api.locketcamera.com/getFilters');
assert.equal(res.response.status,200);
const j=JSON.parse(res.response.body);
assert.equal(j.result.status,200);
assert.equal(j.result.data.filters.length,10);
assert.equal(j.result.data.friend_filters.length,0);
assert.equal(j.data.filters.length,10);
assert.deepEqual(Array.from(j.result.data.filters,e=>e.id),Array.from(new Set(j.result.data.filters.map(e=>e.id))));
assert.ok(j.data.filters.every(e=>e.iconUrl.startsWith('https://phu-private-photo-studio.onrender.com/api/v1/templates/')));
assert.ok(j.data.filters.every(e=>e.filterType==='normal' && e.style==='cutout'));
assert.equal(res.response.body.includes('PRIVATE_DO_NOT_COPY'),false);
assert.equal(res.response.body.includes('163.223.9.98'),false);
assert.equal(res.response.body.includes('revenuecat'),false);
assert.equal(JSON.stringify(execute('https://api.locketcamera.com/changeProfileInfo')),'{}');
assert.equal(JSON.stringify(execute('https://other.example.com/getFilters')),'{}');
assert.equal(JSON.stringify(execute('https://api.locketcamera.com/getFiltersUnrelated')),'{}');
console.log('PASS opt-in getFilters compatibility preview: 10 structured filters, strict scope, no user data');
