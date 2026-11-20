// PTB V6: request hook diagnostics using EXACT known-working hook-check options.
// Read-only. Does not redirect, forward, or mutate image/account requests.
(function () {
  var req = typeof $request === 'undefined' ? null : $request;
  var url = req && String(req.url || '') || '';
  var isGenerate = /^https:\/\/api\.locketcamera\.com\/generateFilteredImage(?:\?.*)?$/i.test(url);
  var isFilters = /^https:\/\/api\.locketcamera\.com\/getFilters(?:\?.*)?$/i.test(url);
  if (!isGenerate && !isFilters) { $done({}); return; }
  var verdict = isFilters ? 'FILTER_HOOK_OK' : 'GENERATE_HOOK_OK';
  if (isGenerate) {
    if (typeof req.body !== 'string' || !req.body) {
      verdict += ' BODY_UNAVAILABLE';
    } else {
      try {
        var body = JSON.parse(req.body);
        var keys = body && typeof body === 'object' && !Array.isArray(body) ? Object.keys(body) : [];
        var safe = keys.filter(function(k) { return /^[A-Za-z_]{1,28}$/.test(k); }).sort().slice(0,8);
        verdict += ' KEYS=' + safe.join(',');
      } catch(e) {
        verdict += ' BODY_NON_JSON';
      }
    }
  }
  try {
    if (typeof console !== 'undefined' && console.log) console.log('PTB_V6 ' + verdict);
    if (typeof $notification !== 'undefined' && $notification && $notification.post)
      $notification.post('PTB V6', 'Known-working hook settings', verdict);
  } catch(_) {}
  $done({});
})();
