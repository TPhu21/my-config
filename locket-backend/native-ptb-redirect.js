// Native Locket Photobooth redirect experiment: Locket -> OWN Render staging.
// Only redirects generateFilteredImage and only for personal PTB IDs.
// Never forwards Authorization/Cookie/Firebase App Check headers to Render.
// Requires the Render staging feature flag PHOTOBOOTH_NATIVE_BRIDGE_ENABLED=1.
// Does not hook Gold, unrelated uploads, postMomentV2, or any other Locket path.
(function () {
  // One notification per outcome; no URLs, photos, session headers or IDs.
  function mark(outcome) {
    try {
      var key = "PTB_REDIRECT_DIAG_20261121_" + outcome;
      if (typeof $persistentStore !== "undefined" &&
          $persistentStore.read(key) === "1") return;
      if (typeof $notification !== "undefined" &&
          $notification && typeof $notification.post === "function") {
        $notification.post("PTB redirect", "Shadowrocket đã chạy script", outcome);
      }
      if (typeof $persistentStore !== "undefined") {
        $persistentStore.write("1", key);
      }
    } catch (_) {}
  }
  var req = typeof $request === "undefined" ? null : $request;
  if (!req || !/^https:\/\/(?:api\.locketcamera\.com|us-central1-locket-4252a\.cloudfunctions\.net)\/generateFilteredImage(?:\?.*)?$/i.test(String(req.url || ""))) {
    $done({});
    return;
  }
  try {
    if (!req.body) {
      mark("BODY_MISSING");
      $done({});
      return;
    }
    var content = JSON.parse(String(req.body || ""));
    // Inspect only schema/enum names; never log an image URL, prompt, or token.
    var id = String(content.filter_id || content.filterId || "");
    var filterType = String(content.filter_type || content.filterType || "");
    var photoField = typeof content.image_url === "string" ? "image_url" :
                     typeof content.imageUrl === "string" ? "imageUrl" : "";
    var safeKeys = Object.keys(content).filter(function(k) {
      return /^(filter_id|filterId|filter_type|filterType|image_url|imageUrl|prompt)$/i.test(k);
    }).sort();
    // One-time reason codes indicate which part of the Locket contract changed.
    if (!id) {
      mark("NO_FILTER_ID keys=" + safeKeys.join(","));
      $done({});
      return;
    }
    var allowed = {
      photobooth_4cut:1, photobooth_cute:1, pb_cortis_4cut:1,
      pb_shinchan_4cut:1, pb_supperman_4cut:1, pb_meo_dang_yeu_4cut:1,
      pb_holo_4cut:1, pb_photobooth_hello_kitty:1,
      pb_vintage:1, pb_ripped_paper_4cut:1
    };
    if (!allowed[id]) {
      mark("UNKNOWN_FILTER_ID (not a PTB known to our backend)");
      $done({});
      return;
    }
    if (filterType !== "normal") {
      mark("FILTER_TYPE_NOT_NORMAL");
      $done({});
      return;
    }
    if (!photoField) {
      mark("NO_IMAGE_URL keys=" + safeKeys.join(","));
      $done({});
      return;
    }
    // Canonicalize recognized aliases so the owned backend accepts the request.
    content.filter_id = id;
    content.filter_type = filterType;
    content.image_url = content[photoField];
    var sanitizedBody = JSON.stringify({
      filter_id: content.filter_id,
      filter_type: content.filter_type,
      image_url: content.image_url
    });
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
    mark("REDIRECT_REQUESTED");
    $done({
      url: "https://phu-private-photo-studio-staging.onrender.com/generateFilteredImage",
      headers: headers,
      body: sanitizedBody
    });
  } catch (_) {
    mark("BODY_PARSE_FAILED");
    $done({});
  }
})();
