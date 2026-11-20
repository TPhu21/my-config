// PTB response-compatibility experiment for user-owned image templates.
// Operates ONLY on successful /getFilters responses. Does not redirect photos,
// spoof subscriptions or change auth/identity, and never sends requests elsewhere.
(function () {
  var req = (typeof $request !== 'undefined' && $request) || {};
  var resp = (typeof $response !== 'undefined' && $response) || null;
  if (!resp || !/^https:\/\/api\.locketcamera\.com\/getFilters(?:\?.*)?$/i.test(String(req.url || ''))) {
    $done({});
    return;
  }
  try {
    var status = Number(resp.status || resp.statusCode || 200);
    if (status !== 200 || typeof resp.body !== 'string') { $done({}); return; }
    var parsed = JSON.parse(resp.body);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) { $done({}); return; }

    var result = parsed.result && typeof parsed.result === 'object' ? parsed.result : {};
    var data = result.data && typeof result.data === 'object' ? result.data : {};
    var filters = Array.isArray(data.filters) ? data.filters.slice() : [];
    var templates = [
      ['photobooth_4cut','Classic Film'],
      ['photobooth_cute','Pastel Cute'],
      ['pb_cortis_4cut','Electric Blue'],
      ['pb_shinchan_4cut','Color Pop'],
      ['pb_supperman_4cut','Hero Comic'],
      ['pb_meo_dang_yeu_4cut','Tiny Paws'],
      ['pb_holo_4cut','Holographic'],
      ['pb_photobooth_hello_kitty','Pink Bow'],
      ['pb_vintage','Vintage Paper'],
      ['pb_ripped_paper_4cut','Scrapbook']
    ];
    var have = {};
    filters.forEach(function (f) {
      var id = typeof f === 'string' ? f : f && (f.id || f.uid);
      if (id) have[id] = true;
    });
    var added = 0;
    templates.forEach(function (t) {
      if (have[t[0]]) return;
      var img='https://phu-private-photo-studio.onrender.com/api/v1/templates/' + t[0] + '/preview?layout=grid';
      filters.push({
        uid:t[0], id:t[0], name:t[1], category:'Photobooth 📸', prompt:t[0],
        style:'cutout', type:'normal', filterType:'normal', overlay:true,
        imageUrl:img, iconUrl:img, overlayImageUrl:img, overlayImageURL:img,
        tintColor:'#93C5FD', colors:['#93C5FD','#E2E8F0'],
        captureButtonColors:['#93C5FD','#E2E8F0'],
        icon:{url:img,iconUrl:img,remoteImage:img,sfSymbol:'square.grid.2x2',
              symbol:'square.grid.2x2',emoji:'📸'},
        outputUrl:null, productUrl:null, textColor:'#FFFFFF', referenceImages:[]
      });
      have[t[0]]=true; added++;
    });
    data.filters = filters;
    if (!Array.isArray(data.friend_filters)) data.friend_filters = [];
    result.data = data;
    parsed.result = result;
    // Developer-compatible alternate envelope, while preserving all original data.
    var top = parsed.data && typeof parsed.data === 'object' ? parsed.data : {};
    top.filters = filters;
    if (!Array.isArray(top.friend_filters)) top.friend_filters = data.friend_filters;
    parsed.data = top;

    var headers = Object.assign({}, resp.headers || {});
    Object.keys(headers).forEach(function(k){
      if (/^(content-length|content-encoding|transfer-encoding|etag|x-revenuecat-etag)$/i.test(k))
        delete headers[k];
    });
    headers['Content-Type']='application/json; charset=utf-8';

    try {
      if (typeof $notification !== 'undefined' && $notification &&
          typeof $notification.post === 'function') {
        var k='PTB_GF_RESPONSE_COMPAT_20261120';
        var seen=typeof $persistentStore !== 'undefined' &&
                 $persistentStore.read(k)==='1';
        if (!seen) {
          $notification.post('PTB · getFilters response test','Chỉ kiểm tra danh mục PTB',
            'Đã thêm '+added+' mẫu; tổng '+filters.length+' filter');
          if (typeof $persistentStore !== 'undefined') $persistentStore.write('1',k);
        }
      }
    } catch (_) {}
    $done({body:JSON.stringify(parsed),headers:headers});
  } catch (_) { $done({}); }
})();
