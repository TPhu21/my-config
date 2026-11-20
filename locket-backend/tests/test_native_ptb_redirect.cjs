// Read exact redirect script and run inside a VM without real traffic.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const code = fs.readFileSync('native-ptb-redirect.js', 'utf8');
function invoke(url, body, headers) {
  let result = null;
  let notice = [];
  vm.runInNewContext(code, {
    $request: {url, body: JSON.stringify(body), headers: headers || {}},
    $done: arg => {result=arg},
    $notification: {post: (...args) => notice.push(args)},
    $persistentStore: {read: () => null, write: () => true}
  }, {timeout: 1000});
  if (result && result.url) assert.ok(notice.some(x=>x.includes('REDIRECT_REQUESTED')));
  return result;
}
const original='https://api.locketcamera.com/generateFilteredImage';
const valid = invoke(original, {
  filter_id:'photobooth_4cut',
  filter_type:'normal',
  image_url:'https://firebasestorage.googleapis.com/photo.jpg'
}, {
  Authorization:'Bearer synthetic-secret',
  Cookie:'secret-cookie',
  'X-Firebase-AppCheck':'synthetic-app-check',
  'Content-Type':'application/json'
});
assert.ok(valid && /phu-private-photo-studio-staging\.onrender\.com\/generateFilteredImage/.test(valid.url));
assert.ok(!Object.keys(valid.headers).some(k=>/authorization|cookie|appcheck/i.test(k)));
assert.strictEqual(valid.headers.Host,'phu-private-photo-studio-staging.onrender.com');
assert.strictEqual(valid.headers['Content-Type'],'application/json');
const forwarded = JSON.parse(valid.body);
assert.deepStrictEqual(Object.keys(forwarded).sort(), ['filter_id','filter_type','image_url']);
const aliases = invoke(original,{filterId:'photobooth_4cut',filterType:'normal',imageUrl:'https://firebasestorage.googleapis.com/x',prompt:'NOT_FORWARDED'}, {});
assert.ok(aliases && aliases.url);
assert.strictEqual(JSON.parse(aliases.body).filter_id,'photobooth_4cut');
assert.ok(!JSON.parse(aliases.body).prompt);
const other = invoke(original,{filter_id:'bowling_ball',filter_type:'normal',image_url:'https://firebasestorage.googleapis.com/a'}, {});
assert.deepStrictEqual(Object.keys(other),[]);
const wrong = invoke('https://api.locketcamera.com/postMomentV2',{filter_id:'photobooth_4cut',filter_type:'normal',image_url:'https://firebasestorage.googleapis.com/a'}, {});
assert.deepStrictEqual(Object.keys(wrong),[]);
const noBody = invoke(original, {filter_id:'photobooth_4cut'}, {});
assert.deepStrictEqual(Object.keys(noBody), []);
console.log('PASS native PTB scoped redirect, credential stripping and opt-in notifications');
