// Independently written Locket-only RevenueCat response adapter.
// Does not touch another application's RevenueCat response.
(function() {
  function done(v) { $done(v || {}); }
  try {
    var headers = $request.headers || {};
    var ua = String(headers["User-Agent"] || headers["user-agent"] || "");
    if (!/locket/i.test(ua)) return done({});
    var obj = JSON.parse($response.body);
    if (!obj || !obj.subscriber || typeof obj.subscriber !== "object") return done({});
    var p = obj.subscriber;
    if (!p.subscriptions || typeof p.subscriptions !== "object") p.subscriptions = {};
    if (!p.entitlements || typeof p.entitlements !== "object") p.entitlements = {};
    var sku = "locket_1600_1y", start = "2026-01-01T00:00:00Z", expiry = "9999-01-09T10:10:14Z";
    p.subscriptions[sku] = {
      auto_resume_date: null, display_name: sku, is_sandbox: true,
      ownership_type: "PURCHASED", billing_issues_detected_at: null,
      period_type: "normal", expires_date: expiry,
      original_purchase_date: start, purchase_date: start, store: "app_store"
    };
    ["Gold", "locket_gold", "gold", "pro", "camera_filters", "holiday_effects"].forEach(function(key) {
      p.entitlements[key] = {
        product_identifier: sku, purchase_date: start,
        expires_date: expiry, grace_period_expires_date: null
      };
    });
    done({ body: JSON.stringify(obj) });
  } catch (_) { done({}); }
})();