// Isolated UI catalog experiment for the user's own Photo Studio.
// Does NOT route Locket photo uploads, alter quotas, subscriber entitlements or tokens.
(function () {
  function done(v) { $done(v || {}); }
  try {
    if (typeof $response === 'undefined' || !$response || typeof $response.body !== 'string') return done();
    var url = (typeof $request !== 'undefined' && $request && $request.url) || '';
    if (!/^https:\/\/firebaseremoteconfig\.googleapis\.com\/v1\/projects\/locket-/i.test(url)) return done();
    var obj = JSON.parse($response.body);
    if (!obj || typeof obj !== 'object' || !obj.entries || typeof obj.entries !== 'object') return done();
    var c = {};
    try { c = JSON.parse(obj.entries.camera_filter_config || '{}'); } catch (_) { c = {}; }
    if (!c || typeof c !== 'object' || Array.isArray(c)) c = {};
    var templates = [
      ['photobooth_4cut', 'Classic Film'],
      ['photobooth_cute', 'Pastel Cute'],
      ['pb_cortis_4cut', 'Electric Blue'],
      ['pb_shinchan_4cut', 'Color Pop'],
      ['pb_supperman_4cut', 'Hero Comic'],
      ['pb_meo_dang_yeu_4cut', 'Tiny Paws'],
      ['pb_holo_4cut', 'Holographic'],
      ['pb_photobooth_hello_kitty', 'Pink Bow'],
      ['pb_vintage', 'Vintage Paper'],
      ['pb_ripped_paper_4cut', 'Scrapbook']
    ];
    var ids = templates.map(function (t) { return t[0]; });
    var title = { en: 'PTB Preview (Test)', vi: 'PTB Xem Trước (Thử)' };
    var groups = Array.isArray(c.sheet_filters) ? c.sheet_filters.slice() : [];
    groups = groups.filter(function (g) {
      var t = (g && g.title && (g.title.en || g.title.vi)) || '';
      return t !== title.en && t !== title.vi;
    });
    groups.push({ title: title, filter_ids: ids });
    var picker = Array.isArray(c.picker_filters) ? c.picker_filters : [];
    picker = Array.from(new Set(picker.concat(ids)));
    var remote = Array.isArray(c.remote_filters) ? c.remote_filters.slice() : [];
    remote = remote.filter(function (r) { return !(r && ids.indexOf(r.id || r.uid) >= 0); });
    templates.forEach(function (t) {
      var icon = 'https://phu-private-photo-studio.onrender.com/api/v1/templates/' + t[0] + '/preview?layout=grid';
      remote.push({
        uid:t[0], id:t[0], name:t[1], category:title.en,
        type:'normal', filterType:'normal',
        imageUrl:icon, iconUrl:icon, overlayImageUrl:icon, overlayImageURL:icon,
        icon:{url:icon,iconUrl:icon,remoteImage:icon,sfSymbol:'camera'},
        source:'private-photo-studio-preview'
      });
    });
    c.allows_custom_filters = true;
    c.show_filter_button = true;
    c.sheet_enabled = true;
    c.sheet_filters = groups;
    c.sheetFilters = groups;
    c.picker_filters = picker;
    c.pickerFilters = picker;
    c.remote_filters = remote;
    c.remoteFilters = remote;
    obj.entries.camera_filter_config = JSON.stringify(c);
    var headers = Object.assign({}, $response.headers || {});
    Object.keys(headers).forEach(function (k) {
      if (/^(content-length|content-encoding|etag|transfer-encoding)$/i.test(k)) delete headers[k];
    });
    done({body:JSON.stringify(obj),headers:headers});
  } catch (_) {
    done();
  }
})();
