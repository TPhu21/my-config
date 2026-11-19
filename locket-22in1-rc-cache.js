// Clears cache headers for Locket-specific Remote Config and RevenueCat only.
(function() {
  function done(v) { $done(v || {}); }
  try {
    var req = $request || {}, url = String(req.url || "");
    var headers = Object.assign({}, req.headers || {});
    var ua = String(headers["User-Agent"] || headers["user-agent"] || "");
    var forLocket = /firebaseremoteconfig\.googleapis\.com\/v1\/projects\/locket-/i.test(url) ||
      (/api\.revenuecat\.com/i.test(url) && /locket/i.test(ua));
    if (!forLocket) return done({});
    Object.keys(headers).forEach(function(k) {
      if (/^(if-none-match|if-modified-since|x-revenuecat-etag)$/i.test(k)) delete headers[k];
    });
    done({ headers: headers });
  } catch (_) { done({}); }
})();