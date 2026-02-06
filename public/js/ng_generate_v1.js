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
    if (t.length > 500) t = t.slice(0, 500) + " …";
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
    if (!outj) return "Status: (no quick view)";
    function s(x){ return (x==null) ? "" : String(x); }
    function clip(x,n){ x=s(x).trim(); return x.length>n ? (x.slice(0,n-1) + "…") : x; }
    var headline =
      outj.headline || outj.Headline || outj.title || outj.Title ||
      (outj.top_band && outj.top_band.headline) || "";
    var summary =
      outj.summary || outj.Summary || outj.brief || outj.overview || "";
    var keys = Object.keys(outj || {});
    function hasAny(substr){
      substr = substr.toLowerCase();
      return keys.some(k => k.toLowerCase().includes(substr));
    }
    var formats = [];
    if (hasAny("web")) formats.push("Web");
    if (hasAny("video")) formats.push("Video");
    if (hasAny("youtube") || hasAny("yt")) formats.push("YouTube");
    if (hasAny("short") || hasAny("reel")) formats.push("Shorts");
    if (hasAny("social")) formats.push("Social");
    if (hasAny("gfx") || hasAny("graphic")) formats.push("Graphics");
    if (hasAny("ref") || hasAny("source")) formats.push("Refs");
    var lines = [];
    if (headline) lines.push("Headline: " + clip(headline, 110));
    if (summary)  lines.push("Summary:  " + clip(summary, 180));
    lines.push("Formats:  " + (formats.length ? formats.join(", ") : "(see Story View)"));
    lines.push("Status:   OK");




// --- Echo quick summary (payload-based) ---
try {
  if (outj) {
 
    var t = (outj.topic || "").trim();
    var w = (outj.what_happened || "").trim();
if (!w) w = (outj.story || "").trim();
if (w && w.startsWith("TOPIC:")) w = w.replace(/^TOPIC:[^\n]*\n*/i, "").trim();
w = w.replace(/^STORY_TYPE:[^\n]*\n*/gmi, "").replace(/^PLATFORM:[^\n]*\n*/gmi, "").trim();


    var st = (outj.story_type || "").trim();
    var pf = (outj.platform || "").trim();
    var sc = (outj.sources || "").trim();

    lines.push(""); // spacer
    lines.push("Topic:   " + (t || "(blank)"));
    lines.push("What:    " + (w ? (w.slice(0,140) + (w.length>140 ? "…" : "")) : "(blank)"));
    lines.push("Meta:    " + "Type=" + (st || "-") + " | Platform=" + (pf || "-") + " | SourcesChars=" + (sc ? sc.length : 0));
  }
} catch(e) {}

    return lines.join("\n");
  }catch(e){
    return "Status: (quick view summary failed)";
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



      fetch("/api/digi-pack", {



        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function(r){
        return r.text().then(function(text){
          var parsed = null, parse_ok = false;
          try { parsed = JSON.parse(text); parse_ok = true; } catch(e) {}

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
    s2.textContent = "OK | " + (__real ? "REAL" : "ECHO");
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
// === NG_QUICK_ECHO_SUMMARY_V1_START (20260204) ===
try {
  var isEcho = (parsed && parsed.mode === "echo") || (outj && outj.mode === "echo");
  if (isEcho && outj) {
    var t = (outj.topic || "").trim();
    var w = (outj.what_happened || "").trim();
    var st = (outj.story_type || "").trim();
    var pf = (outj.platform || "").trim();
    var sc = (outj.sources || "").trim();
    var line1 = (t ? ("Topic: " + t) : "Topic: (blank)");
    var line2 = (w ? ("What: " + w.slice(0, 140) + (w.length > 140 ? "…" : "")) : "What: (blank)");
    var meta = "Type: " + (st || "-") + " | Platform: " + (pf || "-") + " | Sources chars: " + (sc ? sc.length : 0);
    NG_setQuickSummary(line1 + "\n" + line2 + "\n" + meta);
  }
} catch(e) {}
// === NG_QUICK_ECHO_SUMMARY_V1_END ===


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
/* === NG_STORYVIEW_FORMATTED_RENDER_V1_START (20260205) === */
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
  // modern
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(t).catch(() => {
      // fallback
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
  // fallback
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
  // returns array of { key, title, text }
  const out = [];
  if (!dp) return out;

  // Case A: dp.formats is array [{name/title/key, content/text}]
  if (Array.isArray(dp.formats)) {
    dp.formats.forEach((it, idx) => {
      const key = it && (it.key || it.name || it.title || ("format_"+idx));
      const title = it && (it.title || it.name || NG_safeTitleFromKey(key));
      const text = it && (it.text || it.content || it.body || "");
      if (String(text||"").trim()) out.push({ key, title, text: String(text) });
    });
    if (out.length) return out;
  }

  // Case B: common keys on object
  if (typeof dp === "object") {
    const skip = new Set([
      "ok","ts","meta","refs","sources","source","model","mode","status","error",
      "raw","json","debug","telemetry","_meta","_debug"
    ]);

    // prefer known order if present
    const preferred = [
      "web_article","article","news_article",
      "video_script","video","tv_script",
      "youtube","youtube_script","yt_script",
      "shorts","reel","reels","insta_reel",
      "social","social_posts","x_thread","twitter_thread",
      "headline","summary","bullet_points","anchors","prompts"
    ];

    const keys = Object.keys(dp);
    const ordered = [];
    preferred.forEach(k => { if (keys.includes(k)) ordered.push(k); });
    keys.forEach(k => { if (!ordered.includes(k)) ordered.push(k); });

    ordered.forEach((k) => {
      if (skip.has(k)) return;
      const v = dp[k];
      if (v == null) return;

      // if nested object with text-ish
      if (typeof v === "object" && !Array.isArray(v)) {
        const maybe = v.text || v.content || v.body || v.script || v.output || "";
        if (String(maybe||"").trim()) {
          out.push({ key: k, title: NG_safeTitleFromKey(k), text: String(maybe) });
        }
        return;
      }

      // primitives / arrays
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
  // ---- unwrap common API wrappers (echo/real) ----
  try {
    // If API returned an envelope, dig inside
    const unwrapped =
      (dp && (dp.digi_pack || dp.digipack || dp.digiPack || dp.DIGI_PACK)) ||
      (dp && (dp.outputs || dp.output || dp.result || dp.data || dp.payload)) ||
      null;

    if (unwrapped) dp = unwrapped;

    // If still echo-like (only received), show a helpful message
    if (dp && typeof dp === "object" && dp.received && !dp.outputs && !dp.output && !dp.result && !dp.digi_pack && !dp.digipack) {
      const msg = document.createElement("div");
      msg.className = "ng-card";
      msg.style.padding = "10px";
      msg.innerHTML =
        "<b>ECHO response</b>: अभी server ने सिर्फ आपका input (received) लौटाया है, DigiPack formats नहीं।<br>" +
        "REAL mode में Generate करें ताकि web/video/youtube आदि outputs आएं।";
      host.appendChild(msg);
      return true;
    }

    // Also: if dp.mode is echo, hint
    if (dp && typeof dp === "object" && String(dp.mode || "").toLowerCase() === "echo") {
      const msg = document.createElement("div");
      msg.className = "ng-card";
      msg.style.padding = "10px";
      msg.innerHTML =
        "<b>mode: echo</b> मिला है — इस response में formatted outputs नहीं होंगे। REAL mode में Generate करें।";
      host.appendChild(msg);
      return true;
    }
  } catch (e) {}


  const formats = NG_pickDigiPackFormats(dp);

  if (!formats.length) {
    const empty = document.createElement("div");
    empty.className = "ng-card";
    empty.style.padding = "10px";
    empty.textContent = "No formatted DigiPack formats found (empty).";
    host.appendChild(empty);
    return true;
  }

  formats.forEach((f, i) => {
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
    btn.className = "ng-btn ng-btn-mini"; // if you have mini button class; else harmless
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
window.__NG_RENDER_EXPORT_OK__ = true;


/* === NG_STORYVIEW_FORMATTED_RENDER_V1_END (20260205) === */



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

    const formats = NG_pickDigiPackFormats(dp);

    if (!formats.length) {
      const empty = document.createElement("div");
      empty.className = "ng-card";
      empty.style.padding = "10px";
      empty.textContent = "No formatted DigiPack formats found (empty).";
      host.appendChild(empty);
      return true;
    }

    formats.forEach((f, i) => {
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
  window.__NG_RENDER_EXPORT_OK__ = true;
})();
 /* === NG_STORYVIEW_FORMATTED_RENDER_TOPLEVEL_V1_END (20260205) === */















/* === NG_ENABLE_OUTPUT_TABS_ON_RESPONSE_V1_START (20260206) === */
(function(){
  function enableTabs(){
    try{
      ["ng-tab-quick","ng-tab-log","ng-tab-raw"].forEach(function(id){
        var b = document.getElementById(id);
        if (b) b.disabled = false;
      });
    }catch(e){}
  }

  function watch(){
    try{
      var pre = document.getElementById("ngResponse");
      if (!pre) return;

      // Enable if already has content
      if ((pre.textContent || "").trim().length > 0) enableTabs();

      // Watch for changes (Generate writes here)
      var mo = new MutationObserver(function(){
        var t = (pre.textContent || "").trim();
        if (t.length > 0) enableTabs();
      });
      mo.observe(pre, { childList:true, characterData:true, subtree:true });
    }catch(e){}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch, { once:true });
  else watch();
})();
 /* === NG_ENABLE_OUTPUT_TABS_ON_RESPONSE_V1_END === */

