// Native Locket Photobooth redirect experiment: Locket -> OWN Render staging.
// Only redirects generateFilteredImage and only for personal PTB IDs.
// Never forwards Authorization/Cookie/Firebase App Check headers to Render.
// Requires the Render staging feature flag PHOTOBOOTH_NATIVE_BRIDGE_ENABLED=1.
// Does not hook Gold, unrelated uploads, postMomentV2, or any other Locket path.
(function () {
  // Version heartbeat is intentionally not deduplicated: persistentStore once
  // suppressed the only diagnostic result on subsequent attempts.
  var DIAG_VERSION = "PTB_V5_20261121";
  function mark(outcome) {
    var safe = String(outcome).slice(0, 240);
    try { if (typeof console !== "undefined" && console.log) console.log(DIAG_VERSION + " " + safe); } catch (_) {}
    try {
      if (typeof $notification !== "undefined" && $notification && typeof $notification.post === "function") {
        $notification.post("PTB redirect " + DIAG_VERSION, "Script executed", safe);
      }
    } catch (_) {}
  }
  var req = typeof $request === "undefined" ? null : $request;
  if (!req || !/^https:\/\/(?:api\.locketcamera\.com|us-central1-locket-4252a\.cloudfunctions\.net)\/generateFilteredImage(?:\?.*)?$/i.test(String(req.url || ""))) {
    $done({});
    return;
  }
  mark("HOOK_ENTERED");
  try {
    if (!req.body) {
      mark("BODY_MISSING");
      $done({});
      return;
    }
    var content = JSON.parse(String(req.body || ""));
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      mark("BODY_NOT_OBJECT"); $done({}); return;
    }
    // Locate likely nested Locket request shapes without revealing values.
    // Stop after two nesting levels; never traverse photo strings.
    var candidates = [{value:content, path:"root"}];
    ["data","payload","request","input","params","result"].forEach(function(k) {
      if (content[k] && typeof content[k] === "object" && !Array.isArray(content[k])) {
        candidates.push({value:content[k], path:k});
        ["data","payload","request","input","params"].forEach(function(childKey) {
          var child=content[k][childKey];
          if (child && typeof child === "object" && !Array.isArray(child)) {
            candidates.push({value:child, path:k+"."+childKey});
          }
        });
      }
    });
    function getField(obj, keys) {
      for (var i=0; i<keys.length; i++) if (typeof obj[keys[i]] === "string" && obj[keys[i]]) return obj[keys[i]];
      return "";
    }
    var found=null, id="", filterType="", imageUrl="";
    candidates.forEach(function(candidate) {
      if (found) return;
      var value=candidate.value;
      var maybeId=getField(value, ["filter_id","filterId","filterID","id"]);
      var maybeImage=getField(value, ["image_url","imageUrl","source_image_url","sourceImageUrl"]);
      if (maybeId && maybeImage) {
        found=candidate.path;
        id=maybeId;
        imageUrl=maybeImage;
        filterType=getField(value,["filter_type","filterType"]) || getField(content,["filter_type","filterType"]);
      }
    });
    if (!found) {
      // Only key names at known levels, not prompt, URL, auth or photo values.
      var topKeys=Object.keys(content).filter(function(k) {
        return /^[a-zA-Z_]{1,28}$/.test(k);
      }).sort().slice(0,12);
      var shape=candidates.slice(1,4).map(function(v) {
        return v.path+":"+Object.keys(v.value).filter(function(k) {
          return /^[a-zA-Z_]{1,28}$/.test(k);
        }).sort().slice(0,8).join(",");
      }).join(";");
      mark("NO_FILTER_ID schema=" + topKeys.join(",") + (shape?" nested="+shape:""));
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
    if (filterType && filterType !== "normal") {
      mark("FILTER_TYPE_NOT_NORMAL");
      $done({});
      return;
    }
    // The source is deliberately reduced to the fields understood by Render.
    var sanitizedBody=JSON.stringify({
      filter_id:id,
      filter_type:"normal",
      image_url:imageUrl
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
