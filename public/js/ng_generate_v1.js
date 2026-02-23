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

    // keep old filter behavior (only show errors unless debug=1)
    if (!__NG_BANNER_DEBUG) {
      var isErr = /ERROR|ok=false|non-JSON|PAYLOAD ERROR|COPY failed|btnGenerate not found/i.test(t);
      if (!isErr) t = "";
    }

    // Visible status line (no floating banner needed)
    var gs = document.getElementById("genStatus");
    if (gs) gs.textContent = t;

    // If old banner still exists, update it silently (do not force-show)
    try{
      var b = document.getElementById("ng-debug-banner");
      if (b) b.textContent = t;
    }catch(e){}
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
    // NG_FINAL_BYTES_TO_STORY_V1 (20260224): weave Final Bytes into story (not isolated quotes)
var __fb=""; try{
  var p=JSON.parse(localStorage.getItem("NG_FINAL_BYTES_V1")||"null"), items=Array.isArray(p)?p:((p&&Array.isArray(p.items))?p.items:[]);
  var lines=items.map(function(b){ var tx=String((b&&b.text)||"").trim(); if(!tx) return "";
    var sp=String((b&&b.speaker)||"").trim(), de=String((b&&b.designation)||"").trim(), who=(sp||de)?(sp+((sp&&de)?" — ":"")+de):"";
    return "- "+(who?(who+": "):"")+tx;
  }).filter(Boolean);
  if(lines.length) __fb="FINAL_BYTES (use as attributed facts; weave into 5W1H story, not standalone quotes):\n"+lines.join("\n");
}catch(e){}

    // REQUIRED by server
    var story = [
      topic ? ("TOPIC: " + topic) : "",
      story_type ? ("STORY_TYPE: " + story_type) : "",
      platform ? ("PLATFORM: " + platform) : "",
      angle ? ("ANGLE: " + angle) : "",
      what_happened ? ("WHAT_HAPPENED:\n" + what_happened) : "",
      sources ? ("SOURCES:\n" + sources) : "",
            background ? ("BACKGROUND:\n" + background) : "",
      __fb ? (__fb) : ""
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

/* === NG_AUTOSCROLL_NGQUICK_V1_START (20260202) === */
function ngAutoFocusOutput(){
  try{
    var q = document.getElementById("ngQuick");
    if (!q) return false;
    // (no auto-scroll here; Story View is the primary target now)
// soft nudge: add a class briefly (CSS can style it if needed)
q.classList.add("ng-soft-nudge");
setTimeout(function(){ try{ q.classList.remove("ng-soft-nudge"); }catch(e){} }, 600);

    return true;
  }catch(e){ return false; }
}
/* === NG_AUTOSCROLL_NGQUICK_V1_END === */


  /* === NG_JSON_TOLERANT_PARSE_V1_START (20260205) === */
function NG_tryParseJsonWithFixes(text){
  const t0 = (text == null) ? "" : String(text);

  // 1) strict parse
  try { return { ok:true, obj: JSON.parse(t0), fixed:false }; } catch(e1){}

  // 2) common light fixes (do NOT over-mutate)
  let t = t0;

  // normalize smart quotes
  t = t.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");

  // fix a very common model bug: a JSON string value accidentally ends with single-quote before comma or brace
  // Example:  "script": "....',   =>  "script": "....",
  t = t.replace(/"([^"]+)"\s*:\s*"([^"]*)'\s*([,}])/g, '"":""');

  // remove stray control chars except \t \n \r
  t = t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

  try { return { ok:true, obj: JSON.parse(t), fixed:true }; } catch(e2){
    return { ok:false, err: (e2 && e2.message) ? e2.message : String(e2), fixed:true, text:t };
  }
}
/* === NG_JSON_TOLERANT_PARSE_V1_END (20260205) === */
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
function NG_setQuickSummary(text) {
  try {
    var q = document.getElementById("ngQuick");
    if (!q) return;
    var t = (text == null ? "" : String(text)).trim();
    // summary-only: keep it short
    if (t.length > 320) t = t.slice(0, 320) + " …";
    q.textContent = t || "(no quick view)";
  } catch (e) {}
}

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
      try{
        if (!outj) return "(no quick view)";
        // unwrap common envelopes
        if (outj && outj.output_json && typeof outj.output_json === "object") outj = outj.output_json;
        if (outj && outj.digi_pack && typeof outj.digi_pack === "object") outj = outj.digi_pack;

        function s(x){ return (x==null) ? "" : String(x); }
        function clip(x,n){ x=s(x).trim(); return x.length>n ? (x.slice(0,n-1) + "…") : x; }

        var headline =
          outj.headline || outj.Headline || outj.title || outj.Title ||
          (outj.top_band && outj.top_band.headline) || "";

        // prefer: formats[] keys if present
        var formats = [];
        try{
          var farr = null;
          if (outj && Array.isArray(outj.formats)) farr = outj.formats;
          if (!farr && outj && outj.digi_pack && Array.isArray(outj.digi_pack.formats)) farr = outj.digi_pack.formats;
          if (Array.isArray(farr) && farr.length){
            formats = farr.map(x => String((x && x.key) ? x.key : "")).filter(Boolean);
          }
        }catch(e){}

        var lines = [];
        lines.push(headline ? ("Headline: " + clip(headline, 110)) : "Headline: (not set)");
        lines.push("Formats:  " + (formats.length ? formats.join(", ") : "(open Story tab)"));
        lines.push("Status:   OK");
        return lines.join("\n");
      }catch(e){
        return "Status: (quick view failed)";
      }
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

        ngCopyToClipboard(txt)
          .then(function(){
            setBanner("[NG] Copied DIGI_PACK to clipboard.");
          })
          .catch(function(err){
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




        // setBanner("[NG] Quick View updated."); // noisy: quick view is internal

      }, true);
    }

    ngSetCopyViewEnabled(false);

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
       var hasTopic = !!(payload && payload.topic && String(payload.topic).trim());
var hasWhat  = !!(payload && payload.what_happened && String(payload.what_happened).trim());
if (!hasTopic && !hasWhat) { throw new Error("Please fill Topic or What Happened"); }

    } catch(e) {
        setBanner("[NG] PAYLOAD ERROR: " + (e && e.message ? e.message : String(e)));
        inFlight = false;
        btn.disabled = false;
        btn.removeAttribute("disabled");
        return;
      }
// === NG_REAL_MODE_GUARD_V2_START (20260204) ===
const __real = (localStorage.getItem("NG_REAL_MODE") || "0") === "1";

// Hard-force mode into payload (prevents accidental token use)
if (payload && typeof payload === "object") {
  if (!__real) {
    payload.mode = "echo";
    try { setBanner("Real Mode OFF → forced ECHO (no tokens).", "ok"); } catch(e){}
  } else {
    // allow real mode; if mode missing, set a sensible default
    if (!payload.mode) payload.mode = "openai";
    try { setBanner("Real Mode ON → allowed OPENAI (smoke test).", "ok"); } catch(e){}
  }
}
// === NG_REAL_MODE_GUARD_V2_END ===
// === NG_MODE_STATUS_V1_START (20260204) ===
try {
 var gs = document.getElementById("ngStatus") || document.getElementById("genStatus");

  if (gs) { var base = (gs.getAttribute("data-base") || gs.textContent || ""); gs.setAttribute("data-base", base); gs.textContent = (base ? base + " | " : "") + (__real ? "REAL" : "ECHO"); }

} catch(e) {}
// === NG_MODE_STATUS_V1_END ===

// === NG_STATUS_BASE_WORKING_V2_START (20260204) ===
try {
  var s = document.getElementById("ngStatus");
  if (s) {
    s.setAttribute("data-base", "Working");
    s.textContent = "Working | " + (__real ? "REAL" : "ECHO");
  }
} catch(e) {}
// === NG_STATUS_BASE_WORKING_V2_END ===

// === NG_VISUALS_NOTES_TO_PAYLOAD_V1_START (20260217) ===
try{
  var __ngVis = (function(){
    try{
      var t = document.getElementById("ng-visuals-notes");
      return t ? String(t.value || "").trim() : "";
    }catch(e){ return ""; }
  })();

  // Ensure payload/received exists
  payload = payload || {};
  payload.received = payload.received || {};

  // Keep raw notes separately (debuggable)
  payload.received.visuals_notes = __ngVis;

  // Also append to story string so model surely sees it
  if (__ngVis) {
    if (payload.received.story) {
      payload.received.story += "\n\nVISUALS_NOTES:\n" + __ngVis + "\n";
    } else if (payload.story) {
      payload.story += "\n\nVISUALS_NOTES:\n" + __ngVis + "\n";
    }
  }
}catch(_){}
// === NG_VISUALS_NOTES_TO_PAYLOAD_V1_END ===


      fetch("/api/digi-pack", {



        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function(r){
        return r.text().then(function(text){
          var parsed = null, parse_ok = false;
          var __tp = NG_tryParseJsonWithFixes(text); if(__tp && __tp.ok){ parsed = __tp.obj; parse_ok = true; } else { parse_ok = false; parse_err = (__tp && __tp.err) ? __tp.err : "JSON parse failed"; }

          if (!parse_ok){
            if (pre) pre.textContent = text || "(empty response)";
            NG_setQuickSummary("(no quick view - response was not JSON)");

            var gs = document.getElementById("genStatus"); if (gs) gs.textContent = "";
            ngSetCopyViewEnabled(false);
            setBanner("[NG] status=" + r.status + " (non-JSON)\n" + (text||"").slice(0, 700));
            return;
          }
// === NG_STATUS_BASE_OK_V2_START (20260204) ===
try {
  var s2 = document.getElementById("ngStatus");
  if (s2) {
    s2.setAttribute("data-base", "OK");
    var __mode = "";
try{
  __mode = String((parsed && parsed.mode) || (parsed && parsed.output_json && parsed.output_json.mode) || "").toUpperCase();
}catch(e){ __mode = ""; }
if (!__mode) __mode = (__real ? "REAL" : "ECHO");
// === NG_REALMODE_SYNC_FROM_RESPONSE_V1_START (20260214) ===
try{
  // If server actually ran OpenAI (or any non-echo mode), sync the UI toggle to REAL for consistency
  var m = String(__mode || "").toLowerCase();
  if (m && m !== "echo") {
    localStorage.setItem("NG_REAL_MODE", "1");
    if (typeof window.NG_paintRealModeBtn === "function") window.NG_paintRealModeBtn();
  }
}catch(e){}
// === NG_REALMODE_SYNC_FROM_RESPONSE_V1_END (20260214) ===
s2.textContent = "OK | " + __mode;
  }
} catch(e) {}
// === NG_STATUS_BASE_OK_V2_END ===


          window.__NG_LAST_DIGIPACK = parsed;
      

          // If server says ok:false OR HTTP >= 400, treat as error (do not enable copy/view)
          var serverOk = (parsed && parsed.ok === true) && (r.status >= 200 && r.status < 300);
          if (!serverOk){
            var gs = document.getElementById("genStatus"); if (gs) gs.textContent = "";
            var errMsg = (parsed && parsed.error) ? ngSafeStr(parsed.error) : ("HTTP " + r.status);
            if (pre) pre.textContent = JSON.stringify(parsed, null, 2);
            NG_setQuickSummary("Server error: " + errMsg);

            ngSetCopyViewEnabled(false);
            setBanner("[NG] status=" + r.status + " ok=false");
try{ if (typeof window.NG_setOutputReady === "function") window.NG_setOutputReady(true); }catch(e){}

            return;
          }

          var copy_text = (parsed && parsed.copy_text) ? ngSafeStr(parsed.copy_text) : "";
          var outj = (parsed && parsed.output_json) ? parsed.output_json : (parsed && parsed.received ? parsed.received : null);
 // === NG_QUICK_STATUS_SUMMARY_V2_START (20260214) ===
try {
  // Always update quick view (REAL or ECHO). Keep it minimal.
  if (outj) {
    NG_setQuickSummary(ngRenderQuick(outj));
  } else if (parsed && parsed.output_json) {
    NG_setQuickSummary(ngRenderQuick(parsed.output_json));
  } else {
    NG_setQuickSummary("(no quick view)");
  }
} catch(e) {}
// === NG_QUICK_STATUS_SUMMARY_V2_END ===


          if (pre) pre.textContent = (parsed && parsed.output_json) ? JSON.stringify(parsed.output_json, null, 2) : JSON.stringify(parsed, null, 2);

          try{
  const d = document.getElementById("ng-quick-details");
  if (d) d.open = true;
}catch(e){}



          var gs = document.getElementById("genStatus"); if (gs) gs.textContent = "Tip: Shift+Click copies JSON";
          ngSetCopyViewEnabled(true);
          try{
            var _c = document.getElementById("btnCopyDigiPack");
            if (_c) _c.disabled = false;
          }catch(e){}
        

          setBanner("");

          // --- Auto-open Story View (primary Outputs Hub) ---
          try{
  try{ if (typeof window.setTab === "function") window.setTab("story"); }catch(e){}
try{
  var head = document.getElementById("ng-output-headrow");
  if (head && head.scrollIntoView) head.scrollIntoView({ behavior:"smooth", block:"start" });
}catch(e){}

try{ if (typeof window.NG_setOutputReady === "function") window.NG_setOutputReady(true); }catch(e){}


            document.body.classList.add("ng-show-storyview");
            var panel = document.getElementById("ng-storyview");
            if (panel) panel.style.display = "block";

            // Direct fill (NO toggle click)
            if (typeof window.NG_fillStoryView === "function") {
              try{ window.NG_fillStoryView(); }catch(e){}
/* === NG_STORYVIEW_RENDER_AFTER_FILL_V1_START (20260205) === */
try{
  // Prefer formatted cards in StoryView
  if (window.NG_renderDigiPackFormatted && typeof window.NG_renderDigiPackFormatted === "function") {
    var __dp = parsed;
try{
  if (parsed && parsed.output_json && typeof parsed.output_json === "object") __dp = parsed.output_json;
  else if (parsed && typeof parsed.output_text === "string") {
    // if output_text contains JSON, parse it
    var __t = parsed.output_text.trim();
    if (__t && (__t[0] === "{" || __t[0] === "[")) {
      var __p = NG_tryParseJsonWithFixes(__t);
      if (__p && __p.ok) __dp = __p.obj;
    }
  }
}catch(e){}

  /* NG_DRAFT_LIBRARY_SAVE_DIGIPACK_V1_START (2026-02-14)
     Save ONLY structured DIGI_PACK outputs (output_json) into library. */
  try {
    const KEY_LIB = "ng_draft_library_v1";
    // Prefer structured output_json only
    const dp = (parsed && parsed.output_json && typeof parsed.output_json === "object") ? parsed.output_json : null;
    if (dp) {
      let arr = [];
      try { arr = JSON.parse(localStorage.getItem(KEY_LIB) || "[]"); } catch(e) { arr = []; }
      if (!Array.isArray(arr)) arr = [];

      // topic: from dp.received.topic or dp.topic or fallback
      const topic0 = (dp && dp.received && dp.received.topic) ? dp.received.topic : (dp.topic || (parsed && parsed.received && parsed.received.topic) || "");
      const topic = String(topic0 || "(digi-pack)").trim();

      const item = {
        v: 1,
        saved_at: new Date().toISOString(),
        topic: (topic.length > 120 ? (topic.slice(0,120) + "…") : topic),
        mode: (dp.mode || parsed.mode || ""),
        received: (dp.received || parsed.received || null),
        output_json: dp
      };

      // newest first; de-dupe by topic+mode (keep latest)
      const sig = (item.topic + "|" + item.mode).toLowerCase();
      arr = arr.filter(x => {
        const t = String(x && x.topic || "").toLowerCase();
        const m = String(x && x.mode || "").toLowerCase();
        return (t + "|" + m) !== sig;
      });

      arr.unshift(item);
      if (arr.length > 50) arr = arr.slice(0, 50);

      try { localStorage.setItem(KEY_LIB, JSON.stringify(arr)); } catch(e) {}

      // refresh library UI if present
      try {
        const btn = document.getElementById("ng-lib-refresh");
        if (btn) btn.click();
      } catch(e) {}
    }
  } catch(e) {}
  /* NG_DRAFT_LIBRARY_SAVE_DIGIPACK_V1_END */

window.NG_renderDigiPackFormatted(__dp);}
}catch(e){}
/* === NG_STORYVIEW_RENDER_AFTER_FILL_V1_END (20260205) === */



            } else {
              // fallback: at least mirror ngResponse into storyview-out
              var out = document.getElementById("ng-storyview-out");
              var resp = document.getElementById("ngResponse");
              if (out && resp) {
                out.textContent = (resp.textContent || "").trim() || "(no response yet)";
              }
            }

            // scroll into view
            setTimeout(function(){
              var p = document.getElementById("ng-storyview");
              if (p && p.scrollIntoView) p.scrollIntoView({ behavior:"smooth", block:"start" });
            }, 50);
          }catch(e){}
        });  // closes: return r.text().then(function(text){ ... })





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
/* === NG_STORYVIEW_FORMATTED_RENDER_TOPLEVEL_V1_START (20260205) === */
(function(){
  if (window.NG_renderDigiPackFormatted) return; // already installed

  function NG_safeTitleFromKey(k){
    try{
      return String(k || "")
        .replace(/[_\-]+/g," ")
        .replace(/\s+/g," ")
        .trim()
        .replace(/\b\w/g, c => c.toUpperCase());
    }catch(e){ return String(k||"Format"); }
  }

  function NG_copyTextToClipboard(text){
    const t = (text == null) ? "" : String(text);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t).catch(() => {
        const ta = document.createElement("textarea");
        ta.value = t;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand("copy"); } catch(e){}
        document.body.removeChild(ta);
      });
    }
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand("copy"); } catch(e){}
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function NG_pickDigiPackFormats(dp){
    const out = [];
    if (!dp) return out;

    if (Array.isArray(dp.formats)) {
      dp.formats.forEach((it, idx) => {
        const key = it && (it.key || it.name || it.title || ("format_"+idx));
        const title = it && (it.title || it.name || NG_safeTitleFromKey(key));
        const text = it && (it.text || it.content || it.body || "");
        if (String(text||"").trim()) out.push({ key, title, text: String(text) });
      });
      if (out.length) return out;
    }

    if (typeof dp === "object") {
      const skip = new Set(["ok","ts","meta","refs","sources","source","model","mode","status","error","raw","json","debug","telemetry","_meta","_debug"]);
      const preferred = ["web_article","article","news_article","video_script","video","tv_script","youtube","youtube_script","yt_script","shorts","reel","reels","insta_reel","social","social_posts","x_thread","twitter_thread","headline","summary","bullet_points","anchors","prompts"];
      const keys = Object.keys(dp);
      const ordered = [];
      preferred.forEach(k => { if (keys.includes(k)) ordered.push(k); });
      keys.forEach(k => { if (!ordered.includes(k)) ordered.push(k); });

      ordered.forEach((k) => {
        if (skip.has(k)) return;
        const v = dp[k];
        if (v == null) return;

        if (typeof v === "object" && !Array.isArray(v)) {
          const maybe = v.text || v.content || v.body || v.script || v.output || "";
          if (String(maybe||"").trim()) out.push({ key: k, title: NG_safeTitleFromKey(k), text: String(maybe) });
          return;
        }

        const text = Array.isArray(v) ? v.join("\n") : String(v);
        if (text.trim()) out.push({ key: k, title: NG_safeTitleFromKey(k), text });
      });
    }

    return out;
  }

  function NG_renderDigiPackFormatted(dp){
    const host = document.getElementById("ng-storyview-formatted");
    if (!host) return false;
    host.innerHTML = "";

    // unwrap wrappers
    try {
      const unwrapped =
        (dp && (dp.digi_pack || dp.digipack || dp.digiPack || dp.DIGI_PACK)) ||
        (dp && (dp.outputs || dp.output || dp.result || dp.data || dp.payload)) ||
        null;
      if (unwrapped) dp = unwrapped;

      if (dp && typeof dp === "object" && String(dp.mode || "").toLowerCase() === "echo") {
        const msg = document.createElement("div");
        msg.className = "ng-card";
        msg.style.padding = "10px";
        msg.innerHTML = "<b>mode: echo</b> मिला है — इस response में formatted outputs नहीं होंगे। REAL mode में Generate करें।";
        host.appendChild(msg);
        return true;
      }
      if (dp && typeof dp === "object" && dp.received && !dp.outputs && !dp.output && !dp.result && !dp.digi_pack && !dp.digipack) {
        const msg = document.createElement("div");
        msg.className = "ng-card";
        msg.style.padding = "10px";
        msg.innerHTML = "<b>ECHO response</b>: अभी server ने सिर्फ आपका input (received) लौटाया है, DigiPack formats नहीं।<br>REAL mode में Generate करें ताकि web/video/youtube आदि outputs आएं।";
        host.appendChild(msg);
        return true;
      }
    } catch(e) {}

    let formats = NG_pickDigiPackFormats(dp);

// HARD FILTER: never show Raw in StoryView (JSON tab already covers it)
try {
  formats = (formats || []).filter(f => String(f && f.key || "").toLowerCase() !== "raw");
} catch(e) {}


    if (!formats.length) {
      const empty = document.createElement("div");
      empty.className = "ng-card";
      empty.style.padding = "10px";
      empty.textContent = "No formatted DigiPack formats found (empty).";
      host.appendChild(empty);
      return true;
    }

    formats.forEach((f, i) => {
if (String(f && f.key || "").toLowerCase() === "raw") return;

      const card = document.createElement("section");
      card.className = "ng-card";
      card.style.padding = "10px";
      card.style.marginBottom = "10px";

      const head = document.createElement("div");
      head.style.display = "flex";
      head.style.alignItems = "center";
      head.style.justifyContent = "space-between";
      head.style.gap = "8px";

      const h = document.createElement("div");
      h.style.fontWeight = "700";
      h.style.fontSize = "14px";
      h.textContent = f.title || ("Format " + (i+1));

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Copy";
      btn.className = "ng-btn ng-btn-mini";
      btn.addEventListener("click", () => {
        NG_copyTextToClipboard(f.text || "").then(() => {
          btn.textContent = "Copied";
          setTimeout(() => (btn.textContent = "Copy"), 900);
        });
      });

      head.appendChild(h);
      head.appendChild(btn);

      const body = document.createElement("pre");
      body.style.whiteSpace = "pre-wrap";
      body.style.margin = "10px 0 0 0";
      body.style.fontSize = "13px";
      body.style.lineHeight = "1.35";
      body.textContent = f.text || "";

      card.appendChild(head);
      card.appendChild(body);
      host.appendChild(card);
    });

    return true;
  }

  window.NG_renderDigiPackFormatted = NG_renderDigiPackFormatted;
  // LOCK: prevent future scripts from overwriting the renderer (single source of truth)
  try {
    window.NG_renderDigiPackFormatted.__LOCKED = true;
    Object.defineProperty(window, "NG_renderDigiPackFormatted", {
      configurable: false,
      writable: false,
      value: window.NG_renderDigiPackFormatted
    });
  } catch(e) {}
  window.__NG_RENDER_EXPORT_OK__ = true;
})();
 /* === NG_STORYVIEW_FORMATTED_RENDER_TOPLEVEL_V1_END (20260205) === */


























