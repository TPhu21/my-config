// Shadowrocket PTB V3 diagnostic: local notifications of schema only.
// Does not modify requests or responses, send network data, store tokens/UIDs or read image bodies.
(function () {
  var req = typeof $request !== 'undefined' && $request || {};
  var res = typeof $response !== 'undefined' && $response || null;
  var url = String(req.url || '');
  var rc = /^https:\/\/firebaseremoteconfig\.googleapis\.com\/v1\/projects\/[^/]+\/namespaces\/[^/]+:fetch(?:\?.*)?$/i.test(url);
  var gf = /^https:\/\/api\.locketcamera\.com\/getFilters(?:\?.*)?$/i.test(url);
  function alertOnce(key, title, details) {
    try {
      if (typeof $persistentStore !== 'undefined' && $persistentStore.read(key) === '1') return;
      if (typeof $notification === 'undefined' || typeof $notification.post !== 'function') return;
      $notification.post('PTB V3 · ' + title, details, 'Chỉ báo cáo cấu trúc, không gửi dữ liệu tài khoản');
      if (typeof $persistentStore !== 'undefined') $persistentStore.write('1', key);
    } catch (_) {}
  }
  try {
    if (rc && !res) {
      alertOnce('PTB_V3_RC_REQ', 'Firebase fetch', 'Đã thấy request tải Remote Config');
    } else if (rc && res) {
      var summary = 'Có response; chưa đọc được JSON';
      try {
        var o = JSON.parse(String(res.body || ''));
        var entries = o && o.entries && typeof o.entries === 'object' ? o.entries : {};
        var has = Object.prototype.hasOwnProperty.call(entries, 'camera_filter_config');
        var config = has ? JSON.parse(String(entries.camera_filter_config || '{}')) : {};
        var groups = Array.isArray(config.sheet_filters) ? config.sheet_filters : [];
        var remotes = Array.isArray(config.remote_filters) ? config.remote_filters : [];
        var ptb = groups.some(function (x) {
          var title = x && x.title || {};
          return /photobooth|\\bptb\\b/i.test(String(title.en || '') + ' ' + String(title.vi || ''));
        });
        summary = 'camera_filter_config=' + (has ? 'có' : 'không') +
          '; nhóm=' + groups.length + '; remote=' + remotes.length +
          '; nhóm PTB=' + (ptb ? 'có' : 'không');
      } catch (_) {}
      alertOnce('PTB_V3_RC_RESP', 'Firebase response', summary);
    } else if (gf && res) {
      var detail = 'Có response; chưa đọc được JSON';
      try {
        var payload = JSON.parse(String(res.body || ''));
        var root = payload && payload.result && payload.result.data || payload && payload.data || {};
        var filters = root.filters;
        detail = 'filters=' + (Array.isArray(filters) ? filters.length : 'không có') +
          '; phần tử=' + (Array.isArray(filters) && filters.length ? typeof filters[0] : 'rỗng');
      } catch (_) {}
      alertOnce('PTB_V3_GF_RESP', 'getFilters response', detail);
    }
  } catch (_) {}
  $done({});
})();
