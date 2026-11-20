// Optional Shadowrocket response observer for a user-authorized PTB test.
// It never modifies traffic, sends network requests or prints body contents.
// Turn it off immediately if the known-good config no longer works.
(function () {
  function end() { $done({}); }
  try {
    var req = (typeof $request !== "undefined" && $request) || {};
    var res = (typeof $response !== "undefined" && $response) || null;
    if (!res) return end();
    var u = String(req.url || "");
    // An intercepted URL may be before or after Shadowrocket's host rewrite.
    if (!/^https:\/\/(?:163\.223\.9\.98|us-central1-locket-4252a\.cloudfunctions\.net)\/generateFilteredImage(?:[?#]|$)/i.test(u)) return end();

    var headers = res.headers || {};
    var ct = "";
    Object.keys(headers).forEach(function (key) {
      if (key.toLowerCase() === "content-type") ct = String(headers[key]).split(";")[0].trim().toLowerCase();
    });
    var status = Number(res.statusCode || res.status);
    var http = Number.isInteger(status) && status >= 100 && status <= 599 ? String(status) : "unknown";
    var info = "HTTP=" + http + "; type=" + (/^(application\/json|image\/(?:png|jpeg|webp))$/.test(ct) ? ct : "other");
    var raw = typeof res.body === "string" ? res.body : "";

    if (ct === "application/json" && raw.length > 0 && raw.length <= 32768) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          // Names are fixed allowlists. Never reflect arbitrary values or keys.
          var root = parsed.result && typeof parsed.result === "object" && !Array.isArray(parsed.result) ? parsed.result : {};
          var keys = ["result", "data", "status", "errors", "url", "image_url", "imageUrl",
                      "output_url", "job_id", "task_id", "images", "image", "success"];
          function typed(o, k) {
            if (!Object.prototype.hasOwnProperty.call(o, k)) return "";
            var v = o[k];
            var type = v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
            return k + ":" + (["string", "number", "boolean", "object", "array", "null"].indexOf(type) >= 0 ? type : "other");
          }
          var top = keys.map(function (k) { return typed(parsed, k); }).filter(Boolean);
          var inner = keys.map(function (k) { return typed(root, k); }).filter(Boolean);
          var data = root.data && typeof root.data === "object" && !Array.isArray(root.data) ? root.data : {};
          var nested = keys.map(function (k) { return typed(data, k); }).filter(Boolean);
          info += "; root={" + top.join(",") + "}; result={" + inner.join(",") + "}; data={" + nested.join(",") + "}";
          // Classify URL-shaped values without ever printing hosts, paths, queries, tokens, or photos.
          // "https-url" does not prove that the image can be downloaded.
          function classifyLink(value) {
            if (typeof value !== "string") return "non-string";
            if (!value.trim()) return "empty";
            if (/^https:\/\//i.test(value)) return "https-url";
            if (/^http:\/\//i.test(value)) return "http-url";
            if (/^data:image\//i.test(value)) return "data-uri";
            if (/^\/[^/]/.test(value)) return "relative-path";
            return "other-string";
          }
          var urlKeys = ["url", "image_url", "imageUrl", "output_url"];
          function urlSummary(node) {
            return urlKeys.filter(function(k) {
              return Object.prototype.hasOwnProperty.call(node, k);
            }).map(function(k) { return k + ":" + classifyLink(node[k]); }).join(",");
          }
          info += "; urls(root)={" + urlSummary(parsed) + "}; urls(result)={" +
                  urlSummary(root) + "}; urls(data)={" + urlSummary(data) + "}";
          // Compare candidate HTTPS URLs in memory only. The A/B/C codes are
          // equality groups, never URLs, hashes, hosts or image bytes.
          var seen = [];
          var labels = [];
          function groupShape(node) {
            var codes = [];
            urlKeys.forEach(function(k) {
              if (!Object.prototype.hasOwnProperty.call(node, k)) return;
              var val = node[k];
              if (typeof val !== "string" || !/^https:\/\//i.test(val)) {
                codes.push("-");
                return;
              }
              var idx = seen.indexOf(val);
              if (idx < 0) { idx = seen.length; seen.push(val); }
              codes.push("ABCDEFGHJKLMNPQRSTUVWXYZ".charAt(idx) || "?");
            });
            return codes.join("");
          }
          var groupRoot = groupShape(parsed);
          var groupResult = groupShape(root);
          var groupData = groupShape(data);
          info += "; link_groups=" + seen.length +
                  "; aliases(root/result/data)=" + groupRoot + "/" + groupResult + "/" + groupData;
          var n = root.status;
          info += "; app_status=" + (typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 999 ? String(n) : "unknown");
          if (Array.isArray(root.errors)) info += "; errors_count=" + Math.min(root.errors.length, 99);
        }
      } catch (_) { info += "; json=unreadable"; }
    } else if (ct === "application/json") {
      info += "; json=omitted";
    }
    // No persistentStore, no raw logs, no image links, no account details.
    if (typeof $notification !== "undefined" && $notification && typeof $notification.post === "function") {
      $notification.post("PTB response observer", "Readonly metadata, no photo or tokens", info);
    }
    if (typeof console !== "undefined") console.log("[PTB-SAFE-RESPONSE] " + info);
  } catch (_) { /* fail open: never affect the original response */ }
  end();
})();
