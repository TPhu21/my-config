// Native Locket Photobooth redirect experiment: Locket -> OWN Render staging.
// Only redirects generateFilteredImage and only for personal PTB IDs.
// Never forwards Authorization/Cookie/Firebase App Check headers to Render.
// Requires the Render staging feature flag PHOTOBOOTH_NATIVE_BRIDGE_ENABLED=1.
// Does not hook Gold, unrelated uploads, postMomentV2, or any other Locket path.
(function () {
  var req = typeof $request === "undefined" ? null : $request;
  if (!req || !/^https:\/\/(?:api\.locketcamera\.com|us-central1-locket-4252a\.cloudfunctions\.net)\/generateFilteredImage(?:\?.*)?$/i.test(String(req.url || ""))) {
    $done({});
    return;
  }
  try {
    var content = JSON.parse(String(req.body || ""));
    var id = String(content.filter_id || "");
    var allowed = {
      photobooth_4cut:1, photobooth_cute:1, pb_cortis_4cut:1,
      pb_shinchan_4cut:1, pb_supperman_4cut:1, pb_meo_dang_yeu_4cut:1,
      pb_holo_4cut:1, pb_photobooth_hello_kitty:1,
      pb_vintage:1, pb_ripped_paper_4cut:1
    };
    if (!allowed[id] || content.filter_type !== "normal" || typeof content.image_url !== "string") {
      $done({});
      return;
    }
    var headers = {};
    var sourceHeaders = req.headers || {};
    Object.keys(sourceHeaders).forEach(function(k) {
      // The destination is user-owned staging. Remove Locket session credentials
      // instead of copying the reference module's complete header bag.
      if (/^(authorization|cookie|proxy-authorization|x-firebase-appcheck|x-firebase-auth|x-goog-.*|host|:authority|content-length)$/i.test(k)) return;
      headers[k] = sourceHeaders[k];
    });
    headers["Content-Type"] = "application/json";
    headers["Host"] = "phu-private-photo-studio-staging.onrender.com";
    $done({
      url: "https://phu-private-photo-studio-staging.onrender.com/generateFilteredImage",
      headers: headers
    });
  } catch (_) {
    $done({});
  }
})();
