// Shadowrocket Locket filter API contract probe: READ ONLY.
// No response changes; no network calls, token values, headers, full URLs, photos or persistence.
(function () {
  function done() { $done({}); }
  try {
    var req = typeof $request !== "undefined" ? $request : null;
    var resp = typeof $response !== "undefined" ? $response : null;
    var url = String((req && req.url) || "");
    var match = url.match(/^https:\/\/(api\.locketcamera\.com|us-central1-locket-4252a\.cloudfunctions\.net)\/(generateFilteredImage|generateFilter|applyFilter|createOverlay|getFilters)(?:[/?#]|$)/i);
    if (!match) return done();
    var headers = (resp && resp.headers) || (req && req.headers) || {};
    var contentType = "";
    Object.keys(headers).forEach(function (k) {
      if (k.toLowerCase() === "content-type") contentType = String(headers[k]).split(";")[0].slice(0, 65);
    });
    function typeOf(v) {
      if (v === null) return "null";
      if (Array.isArray(v)) return "array";
      return typeof v;
    }
    function shape(obj, depth) {
      if (!obj || typeof obj !== "object" || depth < 1) return typeOf(obj);
      if (Array.isArray(obj)) return obj.length ? ["array", shape(obj[0], depth - 1)] : ["array"];
      var out = {};
      Object.keys(obj).slice(0, 25).forEach(function (k) {
        if (/token|secret|password|authorization|cookie|session|private|email|phone|uid|user.?id|apikey|api_key|access.?key/i.test(k)) return;
        out[k.slice(0, 65)] = shape(obj[k], depth - 1);
      });
      return out;
    }
    var data = (resp && resp.body) || (req && req.body) || "";
    var schema = "body-omitted";
    if (typeof data === "string" && data.length > 0 && data.length < 24000 && /json/i.test(contentType)) {
      try { schema = JSON.stringify(shape(JSON.parse(data), 2)); }
      catch (_) { schema = "invalid-json"; }
    } else if (typeof data === "string" && data.length === 0) {
      schema = "empty-body";
    } else {
      schema = "non-json-or-large-body (not read)";
    }
    var status = resp && (resp.status || resp.statusCode);
    console.log("[LOCKET-CONTRACT] " + (resp ? "RESPONSE" : "REQUEST") +
      " endpoint=" + match[2] +
      " method=" + (resp ? "response" : String(req.method || "unknown").toUpperCase()) +
      " content-type=" + contentType +
      " status=" + (status || "n/a") + " schema=" + schema);
  } catch (_) {
    console.log("[LOCKET-CONTRACT] observer failed (no data retained)");
  }
  done();
})();
