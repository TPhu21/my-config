// PTB V4: passive, privacy-safe iPhone diagnostic.
// Only inspected paths: /getFilters and Firebase Remote Config :fetch.
// Never rewrites traffic, logs user identifiers, reads photo bodies, or sends network calls.
(function () {
  var req = (typeof $request !== 'undefined' && $request) || {};
  var res = (typeof $response !== 'undefined' && $response) || null;
  var url = String(req.url || '');
  var rc = /^https:\/\/firebaseremoteconfig\.googleapis\.com\/v1\/projects\/[^/]+\/namespaces\/[^/]+:fetch(?:\?.*)?$/i.test(url);
  var gf = /^https:\/\/api\.locketcamera\.com\/getFilters(?:\?.*)?$/i.test(url);
  function notify(key, title, details) {
    try {
      if (typeof $persistentStore !== 'undefined' && $persistentStore.read(key) === '1') return;
      if (typeof $notification !== 'undefined' && $notification && typeof $notification.post === 'function') {
        // On iPhone only the THIRD field is consistently visible. Put the actual data there.
        $notification.post('PTB V4 · ' + title, 'Chỉ thông tin cấu trúc, không lấy tài khoản', details);
        if (typeof $persistentStore !== 'undefined') $persistentStore.write(key === '' ? '' : '1', key);
      }
    } catch (_) {}
  }
  function statusText(r) {
    var code = r && (r.status || r.statusCode);
    return typeof code === 'number' && code >= 100 && code <= 599 ? 'HTTP ' + code + ' · ' : '';
  }
  try {
    if (rc && !res) {
      notify('PTB_V4_RC_REQ', 'Firebase fetch', 'Bắt được request tải Remote Config');
    } else if (rc && res) {
      var summary = statusText(res) + 'Response chưa đọc được cấu trúc JSON';
      try {
        var json = JSON.parse(String(res.body || ''));
        var entries = json && json.entries && typeof json.entries === 'object' ? json.entries : {};
        var raw = entries.camera_filter_config;
        var config = typeof raw === 'string' ? JSON.parse(raw) : (raw && typeof raw === 'object' ? raw : {});
        var groups = Array.isArray(config.sheet_filters) ? config.sheet_filters : [];
        var remotes = Array.isArray(config.remote_filters) ? config.remote_filters : [];
        var hasPTB = groups.some(function (item) {
          var title = (item && item.title) || {};
          return /photobooth|ptb/i.test(String(title.en || '') + ' ' + String(title.vi || ''));
        });
        summary = statusText(res) + 'camera_filter_config=' + (Object.prototype.hasOwnProperty.call(entries,'camera_filter_config') ? 'có' : 'không') +
          '; nhóm=' + groups.length + '; remote=' + remotes.length + '; PTB=' + (hasPTB ? 'có' : 'không');
      } catch (_) {}
      notify('PTB_V4_RC_RESP', 'Firebase response', summary);
    } else if (gf && res) {
      var detail = statusText(res) + 'Response chưa đọc được cấu trúc JSON';
      try {
        var data = JSON.parse(String(res.body || ''));
        var root = (data && data.result && data.result.data) || (data && data.data) || {};
        var filters = root.filters;
        var count = Array.isArray(filters) ? filters.length : -1;
        var type = count > 0 ? typeof filters[0] : (count === 0 ? 'rỗng' : 'không có mảng');
        var nPTB = Array.isArray(filters) ? filters.filter(function (f) {
          var id = (f && typeof f === 'object') ? String(f.id || f.uid || '') : String(f || '');
          return /^(pb_|photobooth_)/i.test(id);
        }).length : 0;
        detail = statusText(res) + 'filters=' + (count < 0 ? 'không có' : count) +
          '; kiểu=' + type + '; PTB IDs=' + nPTB;
      } catch (_) {}
      notify('PTB_V4_GF_RESP', 'getFilters response', detail);
    }
  } catch (_) {}
  $done({});
})();
