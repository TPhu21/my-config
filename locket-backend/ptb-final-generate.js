// Personal Locket Photobooth: single final candidate (2026-11-21).
// Scope: redirect only user-owned PTB image generation to the owner's Render
// staging. Do not interfere with native filters, Moments, Gold or subscriptions.
(function () {
  var req = typeof $request === "undefined" ? null : $request;
  if (!req || !/^https:\/\/(?:api\.locketcamera\.com|us-central1-locket-4252a\.cloudfunctions\.net)\/generateFilteredImage(?:\?.*)?$/i.test(String(req.url || ""))) {
    $done({}); return;
  }
  var allowed = {
    photobooth_4cut:1, photobooth_cute:1, pb_cortis_4cut:1,
    pb_shinchan_4cut:1, pb_supperman_4cut:1, pb_meo_dang_yeu_4cut:1,
    pb_holo_4cut:1, pb_photobooth_hello_kitty:1,
    pb_vintage:1, pb_ripped_paper_4cut:1
  };
  function parseBody(s) {
    if (typeof s !== "string" || !s || s.length > 131072) return null;
    try { return JSON.parse(s); } catch (_) {}
    if (s.indexOf("=") < 0) return null;
    // Accept form-encoded JSON wrappers (and plain scalar form values).
    var obj={};
    s.split("&").slice(0,40).forEach(function(part) {
      var pos=part.indexOf("=");
      if(pos<1) return;
      try {
        var k=decodeURIComponent(part.slice(0,pos).replace(/\+/g," "));
        var v=decodeURIComponent(part.slice(pos+1).replace(/\+/g," "));
        if (!/^[A-Za-z_]{1,40}$/.test(k)) return;
        if (k==="payload" || k==="data" || k==="request" || k==="input")
          try { obj[k]=JSON.parse(v); } catch (_) { obj[k]=v; }
        else obj[k]=v;
      } catch (_) {}
    });
    return obj;
  }
  try {
    var root=parseBody(String(req.body || ""));
    if (!root || typeof root !== "object" || Array.isArray(root)) { $done({}); return; }

    var nodes=[root], queue=[root], seen=[], keys=["data","payload","request","input","params","result","filter","filter_data","filterData","image","photo","media"];
    // Small bounded traversal. This also handles filter_id in one branch and
    // image_url at the root, unlike earlier same-object-only probes.
    for (var depth=0; depth<3 && queue.length; depth++) {
      var next=[];
      queue.forEach(function(obj) {
        if (!obj || typeof obj!=="object" || Array.isArray(obj)) return;
        keys.forEach(function(k) {
          var child=obj[k];
          if (typeof child==="string" && (k==="payload"||k==="data"||k==="request"||k==="input")) {
            try { child=JSON.parse(child); } catch (_) {}
          }
          if (child && typeof child==="object" && !Array.isArray(child) &&
              nodes.length<32 && nodes.indexOf(child)<0) {
            nodes.push(child);next.push(child);
          }
        });
      });
      queue=next;
    }
    function value(obj, keys) {
      for(var i=0;i<keys.length;i++) if (typeof obj[keys[i]]==="string" && obj[keys[i]]) return obj[keys[i]];
      return "";
    }
    var filterId="", imageUrl="", filterType="";
    nodes.forEach(function(n) {
      if (!filterId) {
        var candidate=value(n,["filter_id","filterId","filterID","uid","id","prompt"]);
        if (allowed[candidate]) filterId=candidate;
      }
      if (!imageUrl) imageUrl=value(n,["image_url","imageUrl","source_image_url","sourceImageUrl","photo_url","photoUrl"]);
      if (!filterType) filterType=value(n,["filter_type","filterType"]);
    });
    // Only our named PTB filters are ever redirected. Missing or unsupported
    // inputs fall through untouched to Locket's original endpoint.
    if (!filterId || !imageUrl || (filterType && filterType!=="normal")) { $done({}); return; }
    if (!/^https:\/\//i.test(imageUrl)) { $done({});return; }

    var cleanBody=JSON.stringify({
      filter_id:filterId,
      filter_type:"normal",
      image_url:imageUrl
    });
    // Deliberately do NOT inherit Locket's Authorization, cookies, App Check,
    // analytics or account identifiers. This is a user-owned image bridge.
    $done({
      url:"https://phu-private-photo-studio-staging.onrender.com/generateFilteredImage",
      headers:{
        "Content-Type":"application/json",
        "Accept":"application/json"
      },
      body:cleanBody
    });
  } catch (_) { $done({}); }
})();
