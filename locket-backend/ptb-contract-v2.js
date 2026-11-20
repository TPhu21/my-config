// Photobooth Protocol Observer v2 — metadata-only, read-only.
// No request or response bodies; no headers; no URLs, query, tokens, photos,
// UID, account data, or storage. This is a narrow opt-in diagnostic.
(function () {
  function finish() { $done({}); }
  try {
    var request = (typeof $request !== "undefined") ? $request : null;
    var response = (typeof $response !== "undefined") ? $response : null;
    var raw = (request && request.url) || "";
    // Accept only these two official hosts and explicit photo-effect action names.
    // Never process any login, entitlement, subscriber, upload or account routes.
    var match = String(raw).match(/^https:\/\/(api\.locketcamera\.com|us-central1-locket-4252a\.cloudfunctions\.net)\/(generateFilteredImage|generateFilter|applyFilter|createOverlay|getFilters|generatePhotobooth|photobooth)(?:[/?#]|$)/i);
    if (!match) return finish();
    var method = request && request.method ? String(request.method).toUpperCase() : "UNKNOWN";
    if (!/^(GET|POST)$/.test(method)) method = "OTHER";
    var code = response && (response.statusCode || response.status);
    var status = (typeof code === "number" && code >= 100 && code <= 599) ? String(code) : "unknown";
    // A fixed set of booleans and whitelisted action names only.
    console.log("[PTB-CONTRACT-V2] phase=" + (response ? "response" : "request") +
      " action=" + match[2] + " method=" + method + " status=" + status);
  } catch (_) {
    console.log("[PTB-CONTRACT-V2] observer-error");
  }
  finish();
})();
