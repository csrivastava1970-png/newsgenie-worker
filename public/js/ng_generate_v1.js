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
        "background:#111;color:#0f0;padding:8px 10px;border-radius:6px;display:none;" +
        "font:12px/1.4 monospace;max-width:85vw;white-space:pre-wrap;";
      if (document.body) document.body.appendChild(b);
      else document.addEventListener("DOMContentLoaded", function(){ document.body.appendChild(b); }, { once:true });
    }
    return b;
  }
  var __NG_BANNER_DEBUG = false;
try { __NG_BANNER_DEBUG = (new URLSearchParams(location.search).get("debug") === "1"); } catch(e) {}

function setBanner(t){
  try {
    t = (t == null ? "" : String(t));
    if (!__NG_BANNER_DEBUG) {
      var isErr = /ERROR|ok=false|non-JSON|PAYLOAD ERROR|COPY failed|btnGenerate not found/i.test(t);
      if (!isErr) t = "";
    }
    ensureBanner().textContent = t;
  } catch(e) {}
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
    function v(id){
      try { var el = document.getElementById(id); return el ? (el.value || "").trim() : ""; }
      catch(e){ return ""; }
    }

    var topic = v("topic");
    var platform = v("platform") || "Digital";
    var angle = v("angle");
    var story_type = v("storyType") || "explainer";
    var what_happened = v("whatHappened");
    var sources = v("sources");
    var background = v("background");

    // REQUIRED by server
    var story = [
      topic ? ("TOPIC: " + topic) : "",
      story_type ? ("STORY_TYPE: " + story_type) : "",
      platform ? ("PLATFORM: " + platform) : "",
      angle ? ("ANGLE: " + angle) : "",
      what_happened ? ("WHAT_HAPPENED:\n" + what_happened) : "",
      sources ? ("SOURCES:\n" + sources) : "",
      background ? ("BACKGROUND:\n" + background) : ""
    ].filter(Boolean).join("\n\n").trim();

    return {
      story: story,
      topic: topic,
      platform: platform,
      angle: angle,
      story_type: story_type,
      what_happened: what_happened,
      sources: sources,
      background: background
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

    
/* === NG_DIGIPACK_COPYVIEW_V1_START (20260202) === */
    var pre = document.getElementById("ngResponse");
    var quick = document.getElementById("ngQuick");
    var btnCopy = document.getElementById("btnCopyDigiPack");
    var btnView = document.getElementById("btnViewDigiPack");

    function ngSafeStr(x){ try { return (x==null ? "" : String(x)); } catch(e){ return ""; } }

    function ngAsObj(v){
      if (!v) return null;
      if (typeof v === "object") return v;
      if (typeof v === "string"){
        try { return JSON.parse(v); } catch(e){ return null; }
      }
      return null;
    }

    function ngRenderQuick(outj){
      var o = ngAsObj(outj) || {};
      var lines = [];
      function pushSection(k, label){
        if (!o || o[k]==null) return;
        var val = o[k];
        if (typeof val === "object") {
          lines.push("## " + label);
          lines.push(JSON.stringify(val, null, 2));
          lines.push("");
        } else {
          var s = ngSafeStr(val).trim();
          if (!s) return;
          lines.push("## " + label);
          lines.push(s);
          lines.push("");
        }
      }
      pushSection("headline","Headline");
      pushSection("summary","Summary");
      pushSection("web","Web Article");
      pushSection("video","Video Script");
      pushSection("youtube","YouTube");
      pushSection("reel","Reel/Shorts");
      pushSection("social","Social");

      if (lines.length === 0) return "(no structured fields found in output_json)";
      return lines.join("\n");
    }

    function ngSetCopyViewEnabled(on){
      if (btnCopy) btnCopy.disabled = !on;
      if (btnView) btnView.disabled = !on;
    }

    function ngCopyToClipboard(txt){
      txt = ngSafeStr(txt);
      if (!txt) return Promise.reject(new Error("Nothing to copy"));
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(txt);
      }
      return new Promise(function(resolve, reject){
        try{
          var ta = document.createElement("textarea");
          ta.value = txt;
          ta.setAttribute("readonly","readonly");
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          var ok = document.execCommand("copy");
          document.body.removeChild(ta);
          if (ok) resolve();
          else reject(new Error("execCommand(copy) failed"));
        } catch(e){ reject(e); }
      });
    }

    // wire COPY/VIEW once
    if (btnCopy && !btnCopy.__ngWired){
      btnCopy.__ngWired = true;
      btnCopy.addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        var j = window.__NG_LAST_DIGIPACK || null;
        var wantJson = !!(e && e.shiftKey);
        var txt = wantJson
          ? ((j && j.output_json) ? JSON.stringify(j.output_json, null, 2) : "")
          : ((j && j.copy_text) ? ngSafeStr(j.copy_text) : (j ? JSON.stringify(j, null, 2) : ""));
        if (wantJson && !txt) { setBanner("[NG] No output_json yet. Generate first."); return; }
        ngCopyToClipboard(txt).then(function(){
          setBanner("[NG] Copied DIGI_PACK to clipboard.");
        }).catch(function(err){
          setBanner("[NG] COPY failed: " + (err && err.message ? err.message : String(err)));
        });
      }, true);
    }

    if (btnView && !btnView.__ngWired){
      btnView.__ngWired = true;
      btnView.addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        var j = window.__NG_LAST_DIGIPACK || null;
        var outj = (j && j.output_json) ? j.output_json : null;
        if (quick) quick.textContent = ngRenderQuick(outj);
        setBanner("[NG] Quick View updated.");
      }, true);
    }

    ngSetCopyViewEnabled(false);
/* === NG_AUTOSCROLL_NGQUICK_V1_START (20260202) === */
function ngAutoFocusOutput(){
  try{
    var q = document.getElementById("ngQuick");
    if (!q) return false;
    q.scrollIntoView({ behavior: "smooth", block: "start" });
    // subtle flash to draw attention
    var old = q.style.outline;
    q.style.outline = "2px solid red";
    setTimeout(function(){ q.style.outline = old || ""; }, 800);
    return true;
  }catch(e){ return false; }
}
/* === NG_AUTOSCROLL_NGQUICK_V1_END === */

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

      
      try {
        window.__NG_LAST_PAYLOAD = payload;
        var sl = (payload && payload.story) ? String(payload.story).length : 0;
        var wl = (payload && payload.what_happened) ? String(payload.what_happened).length : 0;
        var srcl = (payload && payload.sources) ? String(payload.sources).length : 0;
        setBanner("[NG] payload.story.len=" + sl + " what.len=" + wl + " sources.len=" + srcl);
        if (!sl) { throw new Error("payload.story is empty"); }
      } catch(e) {
        setBanner("[NG] PAYLOAD ERROR: " + (e && e.message ? e.message : String(e)));
        inFlight = false;
        btn.disabled = false;
        btn.removeAttribute("disabled");
        return;
      }fetch("/api/digi-pack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function(r){
        return r.text().then(function(text){
          var parsed = null, parse_ok = false;
          try { parsed = JSON.parse(text); parse_ok = true; } catch(e) {}

          if (!parse_ok){
            if (pre) pre.textContent = text || "(empty response)";
            if (quick) quick.textContent = "(no quick view - response was not JSON)";
            var gs = document.getElementById("genStatus"); if (gs) gs.textContent = "";
            ngSetCopyViewEnabled(false);
            setBanner("[NG] status=" + r.status + " (non-JSON)\n" + (text||"").slice(0, 700));
            return;
          }

          window.__NG_LAST_DIGIPACK = parsed;
      try{ ngAutoFocusOutput(); }catch(e){}

          // If server says ok:false OR HTTP >= 400, treat as error (do not enable copy/view)
          var serverOk = (parsed && parsed.ok === true) && (r.status >= 200 && r.status < 300);
          if (!serverOk){
            var gs = document.getElementById("genStatus"); if (gs) gs.textContent = "";
            var errMsg = (parsed && parsed.error) ? ngSafeStr(parsed.error) : ("HTTP " + r.status);
            if (pre) pre.textContent = JSON.stringify(parsed, null, 2);
            if (quick) quick.textContent = "Server error: " + errMsg;
            ngSetCopyViewEnabled(false);
            setBanner("[NG] status=" + r.status + " ok=false");
            return;
          }

          var copy_text = (parsed && parsed.copy_text) ? ngSafeStr(parsed.copy_text) : "";
          var outj = (parsed && parsed.output_json) ? parsed.output_json : null;

          if (pre) pre.textContent = copy_text || JSON.stringify(parsed, null, 2);
          if (quick) quick.textContent = ngRenderQuick(outj);

          var gs = document.getElementById("genStatus"); if (gs) gs.textContent = "Tip: Shift+Click copies JSON";
          ngSetCopyViewEnabled(true);
          try{
            var _c = document.getElementById("btnCopyDigiPack");
            if (_c) _c.disabled = false;
          }catch(e){}
          setBanner("");});
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














