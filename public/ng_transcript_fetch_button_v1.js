
/* NG_TRANSCRIPT_FETCH_BUTTON_V1 */
(function () {
  if (window.NG_TRANSCRIPT_FETCH_BUTTON_V1) return;
  window.NG_TRANSCRIPT_FETCH_BUTTON_V1 = true;

  function pickCachedTranscript() {
    // best-known key
    try {
      var v = localStorage.getItem("NG_TRANSCRIPT_LAST") || "";
      if (v && v.length > 20) return v;
    } catch (e) {}

    // fallback: find the longest value among transcript-like keys
    var best = "";
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || "";
        if (!/transcript/i.test(k)) continue;
        var val = localStorage.getItem(k) || "";
        if (val && val.length > best.length) best = val;
      }
    } catch (e) {}
    return best;
  }

  function mount() {
    try {
      if (document.getElementById("ng-btn-fetch-transcript")) return;

      var btn = document.createElement("button");
      btn.id = "ng-btn-fetch-transcript";
      btn.type = "button";
      btn.textContent = "Fetch Transcript";
      btn.style.position = "fixed";
      btn.style.right = "16px";
      btn.style.bottom = "16px";
      btn.style.zIndex = "999999";
      btn.style.padding = "10px 12px";
      btn.style.borderRadius = "10px";
      btn.style.border = "1px solid #333";
      btn.style.background = "#111";
      btn.style.color = "#fff";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "14px";

      var badge = document.createElement("div");
      badge.id = "ng-btn-fetch-transcript-badge";
      badge.style.position = "fixed";
      badge.style.right = "16px";
      badge.style.bottom = "56px";
      badge.style.zIndex = "999999";
      badge.style.padding = "6px 10px";
      badge.style.borderRadius = "10px";
      badge.style.border = "1px solid #333";
      badge.style.background = "rgba(0,0,0,0.85)";
      badge.style.color = "#fff";
      badge.style.fontSize = "12px";
      badge.style.display = "none";

      function show(msg) {
        badge.textContent = msg;
        badge.style.display = "block";
        setTimeout(function () { badge.style.display = "none"; }, 2500);
      }

      btn.onclick = async function () {
        // 1) try server inbox first
        if (typeof window.NG_fetchLatestTranscript === "function") {
          show("Fetching…");
          var res = await window.NG_fetchLatestTranscript();
          if (res && res.ok) { show("Ingested ✓ len=" + res.len); return; }
        }

        // 2) fallback to local cache (existing UI "Load" already saves something)
        var cached = pickCachedTranscript();
        if (cached && typeof window.NG_ingestTranscript === "function") {
          window.NG_ingestTranscript(cached);
          show("Loaded from cache ✓");
          return;
        }

        // 3) nothing available
        show("No transcript. Run BAT once.");
      };

      document.body.appendChild(btn);
      document.body.appendChild(badge);
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
