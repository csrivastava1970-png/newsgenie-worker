/* === NG_GENERATE_PERM_SAFE_V1_START (20260201) ===
   - Enables #btnGenerate if disabled
   - Captures click (prevents reload/submit)
   - POST /api/digi-pack (single in-flight)
   - Shows response in green banner
=== */
(function(){
  if (window.__NG_GENERATE_PERM_SAFE_V1__) return;
  window.__NG_GENERATE_PERM_SAFE_V1__ = true;

  function ensureBanner(){
    var b = document.getElementById("ng-debug-banner");
    if (!b){
      b = document.createElement("div");
      b.id = "ng-debug-banner";
      b.style.cssText =
        "position:fixed;left:8px;top:8px;z-index:999999;" +
        "background:#111;color:#0f0;padding:8px 10px;border-radius:6px;" +
        "font:12px/1.4 monospace;max-width:85vw;white-space:pre-wrap;";
      if (document.body) document.body.appendChild(b);
      else document.addEventListener("DOMContentLoaded", function(){ document.body.appendChild(b); }, { once:true });
    }
    return b;
  }
  function setBanner(t){
    try { ensureBanner().textContent = t; } catch(e) {}
  }

  // prevent form submit navigation (common cause of reload)
  if (!window.__NG_BLOCK_SUBMIT_SAFE_V1__){
    window.__NG_BLOCK_SUBMIT_SAFE_V1__ = true;
    document.addEventListener("submit", function(e){
      e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
      setBanner("[NG] submit prevented");
    }, true);
  }

  function qs(sel){ try { return document.querySelector(sel); } catch(e){ return null; } }

  function buildPayload(){
    // best-effort: use first textarea as input if specific fields not found
    var ta = qs("textarea");
    var prompt = ta ? (ta.value || "") : "";

    return {
      topic: "",
      platform: "Digital",
      angle: "",
      story_type: "developing",
      what_happened: prompt || ""
    };
  }

  var inFlight = false;

  function wire(){
    var btn = document.getElementById("btnGenerate");
    if (!btn){
      setBanner("[NG] btnGenerate not found (retrying)...");
      setTimeout(wire, 800);
      return;
    }

    // force-enable
    btn.disabled = false;
    btn.removeAttribute("disabled");

    if (btn.__ngPermSafeWired) { setBanner("[NG] Generate ready."); return; }
    btn.__ngPermSafeWired = true;

    btn.addEventListener("click", function(e){
      e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();

      if (inFlight){
        setBanner("[NG] Already running…");
        return;
      }
      inFlight = true;
      btn.disabled = true;

      setBanner("[NG] POST /api/digi-pack ...");

      var payload = buildPayload();

      fetch("/api/digi-pack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function(r){
        return r.text().then(function(text){
          setBanner("[NG] status=" + r.status + "\n" + text.slice(0, 700));
        });
      }).catch(function(err){
        setBanner("[NG] ERROR: " + (err && err.message ? err.message : String(err)));
      }).finally(function(){
        inFlight = false;
        btn.disabled = false;
        btn.removeAttribute("disabled");
      });

    }, true);

    setBanner("[NG] Generate ready. Click Generate DIGI_PACK.");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire, { once:true });
  else wire();
})();
