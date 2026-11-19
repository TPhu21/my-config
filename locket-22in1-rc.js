// Independently written, Locket-only Firebase Remote Config extension.
// Adds catalog identifiers; no external AI backend, no network calls.
(function() {
  function finish(v) { $done(v || {}); }
  try {
    var req = $request || {}, url = String(req.url || ""), headers = req.headers || {};
    var ua = String(headers["User-Agent"] || headers["user-agent"] || "");
    if (!/locket-/i.test(url) && !/locket/i.test(ua)) return finish({});
    var payload = JSON.parse($response.body);
    if (!payload || typeof payload !== "object" || !payload.entries || typeof payload.entries !== "object") return finish({});
    var entries = payload.entries;
    function readConfig(key) {
      try { var v = entries[key]; return typeof v === "string" ? JSON.parse(v) : (v && typeof v === "object" ? v : {}); }
      catch (_) { return {}; }
    }
    var groups = [
      { title: { en: "AI Effects (experimental)", vi: "Hiệu ứng AI (thử nghiệm)" }, filter_ids: ["stk_tai_tho", "stk_mu_ngu_khoc", "stk_jollibee", "stk_gojo_satoru"] },
      { title: { en: "Photobooth (experimental)", vi: "Photobooth (thử nghiệm)" }, filter_ids: ["pb_cortis_4cut", "pb_holo_4cut", "pb_photobooth_hello_kitty", "pb_strawberry", "pb_vintage", "photobooth_4cut"] },
      { title: { en: "Frames (experimental)", vi: "Khung ảnh (thử nghiệm)" }, filter_ids: ["frame_ba_khi", "khung_anh_o_kitty_v_sao", "khung_hello_kitty_h_ng_pastel"] }
    ];
    var camera = readConfig("camera_filter_config");
    var currentGroups = Array.isArray(camera.sheet_filters) ? camera.sheet_filters : [];
    var existing = new Set();
    currentGroups.forEach(function(g) { (g.filter_ids || []).forEach(function(id) { existing.add(id); }); });
    var newGroups = groups.map(function(g) {
      return { title: g.title, filter_ids: g.filter_ids.filter(function(id) { return !existing.has(id); }) };
    }).filter(function(g) { return g.filter_ids.length > 0; });
    camera.sheet_filters = currentGroups.concat(newGroups);
    var picker = Array.isArray(camera.picker_filters) ? camera.picker_filters.slice() : [];
    groups.forEach(function(g) { g.filter_ids.forEach(function(id) { if (picker.indexOf(id) < 0) picker.push(id); }); });
    camera.picker_filters = picker;
    camera.allows_custom_filters = true;
    camera.show_filter_button = true;
    camera.sheet_enabled = true;
    entries.camera_filter_config = JSON.stringify(camera);
    var gates = readConfig("feature_gates");
    ["camera_roll", "longer_video", "custom_widget_frames"].forEach(function(k) {
      if (!(k in gates)) gates[k] = "enabled";
    });
    entries.feature_gates = JSON.stringify(gates);
    // Preserves the popup, widget URL and captions from the server.
    finish({ body: JSON.stringify(payload) });
  } catch (_) { finish({}); }
})();