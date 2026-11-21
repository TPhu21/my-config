// V7 read-only: probe generateFilteredImage on both observed Locket hosts.
// Do not log URL query, request values, image URL, account headers or photo data.
(function () {
  var req = typeof $request === 'undefined' ? null : $request;
  var rawUrl = req ? String(req.url || '') : '';
  var m = /^https:\/\/(api\.locketcamera\.com|us-central1-locket-4252a\.cloudfunctions\.net)\/generateFilteredImage(?:\?.*)?$/i.exec(rawUrl);
  if (!m) { $done({}); return; }

  var host = /^api\./i.test(m[1]) ? 'API' : 'CLOUD_FUNCTION';
  var verdict = 'GENERATE_HOOK_OK host=' + host;
  if (typeof req.body !== 'string' || !req.body) {
    verdict += ' BODY_UNAVAILABLE';
  } else {
    try {
      var o = JSON.parse(req.body);
      if (!o || typeof o !== 'object' || Array.isArray(o)) {
        verdict += ' BODY_NOT_OBJECT';
      } else {
        var names = Object.keys(o).filter(function (x) {
          return /^[A-Za-z_]{1,28}$/.test(x);
        }).sort().slice(0, 12);
        verdict += ' KEYS=' + names.join(',');
      }
    } catch (_) { verdict += ' BODY_NON_JSON'; }
  }

  try {
    if (typeof console !== 'undefined' && console.log) console.log('PTB V7 ' + verdict);
    if (typeof $notification !== 'undefined' && $notification && $notification.post)
      $notification.post('PTB V7', 'generateFilteredImage', verdict);
  } catch (_) {}
  $done({});
})();
