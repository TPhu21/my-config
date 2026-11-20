// One-shot, read-only metadata for an image delivery request observed in PTB logs.
// Fixed host and /ai-filters/ path only. Never print URL, query, headers, image,
// authentication fields, server response body or any account information.
(function () {
  function done() { $done({}); }
  try {
    var req = (typeof $request !== "undefined" && $request) || {};
    var res = (typeof $response !== "undefined" && $response) || null;
    var u = String(req.url || "");
    if (!/^https?:\/\/(?:163\.223\.9\.98|us-central1-locket-4252a\.cloudfunctions\.net)\/ai-filters\/[^?#]+(?:[?#]|$)/i.test(u)) return done();
    // A response callback may run after image download, but this never reads body.
    var method = req.method === "GET" ? "GET" : req.method === "HEAD" ? "HEAD" : "other";
    var status = res ? Number(res.statusCode || res.status) : NaN;
    var safeStatus = Number.isInteger(status) && status >= 100 && status <= 599 ? String(status) : "unknown";
    var h = (res && res.headers) || {};
    var contentType = "";
    Object.keys(h).forEach(function (k) {
      if (k.toLowerCase() === "content-type") contentType = String(h[k]).split(";")[0].trim().toLowerCase();
    });
    var safeType = /^(image\/(?:jpeg|png|webp|gif)|application\/json)$/.test(contentType) ? contentType : "other";
    var message = "phase=" + (res ? "response" : "request") +
      "; route=ai-filters; method=" + method + "; HTTP=" + safeStatus + "; type=" + safeType;
    if (typeof $notification !== "undefined" && $notification && typeof $notification.post === "function") {
      $notification.post(res ? "PTB image delivery" : "PTB image request", "Read-only; no URL or image", message);
    }
    if (typeof console !== "undefined") console.log("[PTB-IMAGE-DELIVERY] " + message);
  } catch (_) { /* no changes to network */ }
  done();
})();
