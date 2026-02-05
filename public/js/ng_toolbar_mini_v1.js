/* NG_TOOLBAR_MINI_JS_V1_START (2026-01-30) */
(() => {
  if (window.__NG_TOOLBAR_MINI_JS_V1__) return;
  window.__NG_TOOLBAR_MINI_JS_V1__ = true;

  const q = (s) => document.querySelector(s);

  function safeAnchor() {
    // Prefer stable anchors in your UI
    return (
      q("#ng-superlight") ||
      q("#ng-transcript-loader") ||
      q("#digi-pack-form") ||
      q("h2") ||
      document.body
    );
  }

  function insertAfter(el, node) {
    if (!el || !el.parentNode) return false;
    el.parentNode.insertBefore(node, el.nextSibling);
    return true;
  }

  function setMode(mode) {
    try {
      // 1) Store for CSS rules that use html[data-ng-std-ui="..."]
      document.documentElement.setAttribute("data-ng-std-ui", mode);

      // 2) Keep your earlier behaviour (hide/show panels)
      const visualsWrap = q("#visualsWrap");
      const tInbox =
        q("#ng-transcript-inbox") ||
        q("#ng-transcript-loader") ||
        q("#ng-transcript-loader-wrap") ||
        q("#ng-transcript-inbox-details");

      if (mode === "simple") {
        if (visualsWrap) visualsWrap.style.display = "none";
        if (tInbox) tInbox.style.display = "none";
      } else {
        if (visualsWrap) visualsWrap.style.display = "block";
        if (tInbox) tInbox.style.display = "block";
      }

      const pill = q("#ng-ui-mode-pill");
      if (pill) pill.textContent = ""; // mode text hidden (buttons already show state)

      // 3) Remember
      window.__NG_UI_MODE = mode;
      try { localStorage.setItem("ng_ui_mode_v1", mode); } catch (e) {}
    } catch (e) {
      console.warn("NG_TOOLBAR_MINI_JS_V1 setMode error", e);
    }
  }

  function toggleStoryView() {
    // Try known overlays/panels
    const cand =
      q("#storyViewOverlay") ||
      q("#storyView") ||
      q("#ng-storyview") ||
      q('[data-ng-panel="storyview"]');

    if (cand) {
      const ds = getComputedStyle(cand).display;
      cand.style.display = (ds === "none") ? "block" : "none";
      cand.scrollIntoView?.({ behavior: "smooth", block: "start" });
      return;
    }
    alert("Story View panel not found (ids: storyViewOverlay/storyView/ng-storyview).");
  }

  function commitToByte() {
    // Try clicking existing commit/add buttons if present
    const ids = [
      "#btnCommitToByte",
      "#btnCommit",
      "#btn-commit",
      "#btnCommitByte",
      "#btnAddByte",
      "#btn-add-byte",
      "#ng-ui-commit"
    ];
    for (const sel of ids) {
      const el = q(sel);
      if (el && typeof el.click === "function") {
        el.click();
        return;
      }
    }
    alert("Commit button not found (looked for common ids).");
  }

  function buildToolbar() {
    const wrap = document.createElement("div");
    wrap.id = "ng-std-ui-toolbar-mini";
    wrap.setAttribute("data-ng-snippet", "NG_TOOLBAR_MINI_JS_V1");
    wrap.style.cssText =
      "display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0 12px 0;";

    wrap.innerHTML = `
      <button type="button" id="ng-ui-simple" class="btn">Simple</button>
      <button type="button" id="ng-ui-advanced" class="btn">Advanced</button>
      
      
     <span id="ng-ui-mode-pill" style="display:none;"></span>

    `;

    // Wire
    wrap.addEventListener("click", (e) => {
      const id = e.target && e.target.id;
      // LIBRARY toggle
      if (id === "ng-act-library" || id === "ng-ui-library" || id === "btnLibrary" || id === "btnDraftLibrary") {

        const panel = document.getElementById("ng-draft-library");
        if (panel) {
          panel.style.display = (panel.style.display === "none" || !panel.style.display) ? "block" : "none";
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      if (!id) return;

      if (id === "ng-ui-simple") return setMode("simple");
      if (id === "ng-ui-advanced") return setMode("advanced");
      if (id === "ng-ui-storyview") return toggleStoryView();
      if (id === "ng-ui-commit") return; // removed in UI redesign

    });

    return wrap;
  }

  function mount() {
    // Avoid duplicates if HTML already has it
    if (q('#ng-std-ui-toolbar-mini')) {
  try {
    var moveMini = function() {
      try {
        var existing = q('#ng-std-ui-toolbar-mini');
        var root = document.getElementById('ng-toolbar-root')
                || document.getElementById('ng-std-ui-toggle-root');
        if (existing && root && existing.parentElement !== root) {
          root.insertBefore(existing, root.firstChild || null);
        }
      } catch(e) {}
    };

    // Try now
    moveMini();

    // Try again after DOM is ready (root may be below this script)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function(){
        moveMini();
        try { requestAnimationFrame(moveMini); } catch(e) {}
        try { setTimeout(moveMini, 0); } catch(e) {}
        try { setTimeout(moveMini, 80); } catch(e) {}
      }, { once: true });
    } else {
      try { requestAnimationFrame(moveMini); } catch(e) {}
      try { setTimeout(moveMini, 0); } catch(e) {}
      try { setTimeout(moveMini, 80); } catch(e) {}
    }
  } catch(e) {}
  return;
}

    const tb = buildToolbar();

/* NG_FORCE_MINI_TO_TOOLBAR_ROOT_V1_START (20260205) */
try {
  var root = document.getElementById('ng-toolbar-root') || document.getElementById('ng-std-ui-toggle-root');
  var existing = document.getElementById('ng-std-ui-toolbar-mini');
  // If toolbar container already exists elsewhere, move it into root.
  if (root && existing && existing.parentElement !== root) {
    root.insertBefore(existing, root.firstChild || null);
  }
  // If we just built tb and it isn't in the right place, put it in root.
  if (root && tb && tb.parentElement !== root) {
    root.insertBefore(tb, root.firstChild || null);
  }
} catch(e) {}
/* NG_FORCE_MINI_TO_TOOLBAR_ROOT_V1_END */
/* NG_FORCE_MINI_WATCHDOG_V1_START (20260205) */
try {
  var __ngMoveMini = function() {
    try {
      var root = document.getElementById('ng-toolbar-root') || document.getElementById('ng-std-ui-toggle-root');
      var mini = document.getElementById('ng-std-ui-toolbar-mini');
      if (root && mini && mini.parentElement !== root) root.insertBefore(mini, root.firstChild || null);
    } catch(e) {}
  };

  // settle-time moves (in case later code re-homes it)
  try { setTimeout(__ngMoveMini, 0); } catch(e) {}
  try { setTimeout(__ngMoveMini, 50); } catch(e) {}
  try { setTimeout(__ngMoveMini, 200); } catch(e) {}
  try { requestAnimationFrame(__ngMoveMini); } catch(e) {}

  // watchdog: if anything moves it away, move back (cheap + specific)
  if (!window.__NG_MINI_WATCHDOG_ON) {
    window.__NG_MINI_WATCHDOG_ON = true;
    try {
      var mo = new MutationObserver(function(){ __ngMoveMini(); });
      var r = document.getElementById('ng-toolbar-root');
var s = document.getElementById('ng-superlight');
if (r) mo.observe(r, { childList:true, subtree:true });
if (s) mo.observe(s, { childList:true, subtree:true });
if (!r && !s) mo.observe(document.documentElement, { childList:true, subtree:true });
      window.__NG_MINI_WATCHDOG = mo;
    } catch(e) {}
  }
} catch(e) {}
/* NG_FORCE_MINI_WATCHDOG_V1_END */

    const anchor = safeAnchor();

    // If anchor itself is ng-superlight, insert inside at top; else insert after
    if (anchor && anchor.id === "ng-superlight") {
      anchor.insertBefore(tb, anchor.firstChild);
    } else if (anchor && anchor.tagName === "H2") {
      insertAfter(anchor, tb);
    } else if (anchor) {
      // Try to insert before the anchor's first child, else append
      try {
        anchor.insertBefore(tb, anchor.firstChild || null);
      } catch {
        document.body.insertBefore(tb, document.body.firstChild || null);
      }
    } else {
      document.body.insertBefore(tb, document.body.firstChild || null);
    }

    // Restore last mode if any
    let last = null;
    try { last = localStorage.getItem("ng_ui_mode_v1"); } catch (e) {}
    setMode(last === "simple" ? "simple" : "advanced");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
// === NG_REAL_MODE_TOGGLE_BTN_V1_START (20260204) ===
(function(){
  function isReal(){ return (localStorage.getItem("NG_REAL_MODE") || "0") === "1"; }
  function setReal(on){
    localStorage.setItem("NG_REAL_MODE", on ? "1" : "0");
    paint();
// Try to reattach into #ng-dp-actions if it appears later
(function(){
  function reattach(){
    var wrap = document.getElementById("ngRealModeWrap");
   var host = document.getElementById("ng-std-ui-toolbar-mini") || document.getElementById("ng-dp-actions");

    if (wrap && host && wrap.parentElement !== host) {
      host.appendChild(wrap);
    }
  }
  // run a few times after load to catch late DOM build
  try { reattach(); } catch(e){}
  setTimeout(reattach, 250);
  setTimeout(reattach, 1000);
  setTimeout(reattach, 2000);
})();

  }
  function paint(){
  var b = document.getElementById("ngRealModeBtn");
  var eb = document.getElementById("ngEchoModeBtn");
  if (!b) return;

  var real = isReal();

  // Labels are FIXED (no swapping)
  b.textContent = "REAL";
  b.title = real ? "Real Mode ON (OpenAI allowed)" : "Switch to Real Mode (OpenAI allowed)";
  b.setAttribute("data-state", real ? "active" : "idle");

  // Class-based styling
  b.classList.remove("ng-mode-active","ng-mode-idle");
  b.classList.add(real ? "ng-mode-active" : "ng-mode-idle");

  try{
    if (eb){
      eb.textContent = "ECHO";
      eb.title = "Force Echo Mode (no tokens)";
      eb.setAttribute("data-state", real ? "idle" : "active");
      eb.classList.remove("ng-mode-active","ng-mode-idle");
      eb.classList.add(real ? "ng-mode-idle" : "ng-mode-active");
    }
  }catch(e){}
}// Attach near your mini toolbar anchor
  var anchor = document.getElementById("ng-toolbar-root") || document.getElementById("ng-std-ui-toggle-root") || document.getElementById("ng-std-ui-toolbar-mini") || document.getElementById("ng-dp-actions") || ((typeof safeAnchor === "function") ? safeAnchor() : document.body);


  if (!anchor) anchor = document.body;

  // prevent duplicates
 if (document.getElementById("ngRealModeBtn")) {
  // If wrap already exists, move it into toolbar (if present)
  try {
    var _wrap = document.getElementById("ngRealModeWrap");
    var _host = document.getElementById("ng-std-ui-toolbar-mini");
    if (_wrap && _host && _wrap.parentElement !== _host) _host.appendChild(_wrap);
  } catch(e) {}
  paint();
  return;
}


  var wrap = document.createElement("span");
  wrap.id = "ngRealModeWrap";
 wrap.style.marginLeft = "6px";


  var btn = document.createElement("button");
  btn.type = "button";
  btn.id = "ngRealModeBtn";

/* NG_ECHO_BTN_V1_START (20260205) */
var echoBtn = document.createElement("button");
echoBtn.type = "button";
echoBtn.id = "ngEchoModeBtn";
echoBtn.textContent = "ECHO";
echoBtn.style.padding = "4px 10px";
echoBtn.style.fontSize = "12px";
echoBtn.style.marginLeft = "6px";
echoBtn.title = "Force Echo Mode (no tokens)";
echoBtn.addEventListener("click", function(ev){
  try { ev.preventDefault(); ev.stopPropagation(); } catch(e) {}
  try { setReal(false); } catch(e) {}
});
/* NG_ECHO_BTN_V1_END */
  btn.style.padding = "4px 10px";
  btn.style.fontSize = "12px";
  btn.style.borderRadius = "999px";
btn.style.marginLeft = "8px";
btn.style.verticalAlign = "middle";
btn.style.lineHeight = "1.2";

  btn.style.cursor = "pointer";

  btn.addEventListener("click", function(){
    var real = isReal();
    if (!real) {
      var ok = confirm("Enable REAL mode? This may use OpenAI tokens.\n\nOK = REAL, Cancel = stay ECHO.");
      if (!ok) return;
      setReal(true);
    } else {
      setReal(false);
    }
  });

  wrap.appendChild(btn);
/* NG_ECHO_BTN_PLACE_V1_START (20260205) */
try { wrap.appendChild(echoBtn); } catch(e) {}
/* NG_ECHO_BTN_PLACE_V1_END */

  // Insert into toolbar if present; otherwise fallback near anchor
try {
  if (anchor && anchor.id === "ng-std-ui-toolbar-mini") {
    anchor.appendChild(wrap);
  } else if (anchor && anchor.parentNode) {
    anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
  } else {
    document.body.appendChild(wrap);
  }
} catch(e) {
  document.body.appendChild(wrap);
}

  paint();
// === NG_REALMODE_FORCE_REATTACH_V2_START (20260204) ===
(function(){
  function move(){
    try{
      var wrap = document.getElementById("ngRealModeWrap");
      var host = document.getElementById("ng-std-ui-toolbar-mini");
      if (wrap && host && wrap.parentElement !== host) host.appendChild(wrap);

      // Toolbar alignment polish (flex row, center baseline)
      try {
        if (host && !host.__ngFlexPolished) {
          host.__ngFlexPolished = true;
          host.style.display = "flex";
          host.style.alignItems = "center";
          host.style.gap = "10px";
          host.style.flexWrap = "wrap";
        }
        if (wrap) {
          wrap.style.display = "inline-flex";
          wrap.style.alignItems = "center";
        }
      } catch(e) {}
// Turn "mode: ..." text into a small badge for consistent alignment
try {
  // disabled: we no longer show "mode:" text in toolbar (clean UI)
  throw new Error("NG_MODE_BADGE_DISABLED");

  if (host && !host.__ngModeBadgeDone) {
    host.__ngModeBadgeDone = true;

    var walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, null);
    var hit = null;
    while (walker.nextNode()) {
      var t = (walker.currentNode.nodeValue || "").trim();
      if (t.toLowerCase().startsWith("mode:")) { hit = walker.currentNode; break; }
    }

    if (hit) {
      var badge = document.createElement("span");
      badge.id = "ngModeBadge";
      badge.textContent = hit.nodeValue.trim();
      badge.style.padding = "4px 10px";
      badge.style.borderRadius = "999px";
      badge.style.fontSize = "12px";
      badge.style.lineHeight = "1.2";
      badge.style.background = "#f1f1f1";
      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      hit.parentNode.replaceChild(badge, hit);
    }
  }
} catch(e) {}
// Ensure order: Mode badge before REAL/ECHO pill
try {
  var badgeEl = document.getElementById("ngModeBadge");
  var wrapEl = document.getElementById("ngRealModeWrap");
  if (host && badgeEl && wrapEl && badgeEl.parentElement === host && wrapEl.parentElement === host) {
    if (badgeEl.nextSibling !== wrapEl) host.insertBefore(badgeEl, wrapEl);
  }
} catch(e) {}

    } catch(e) {}
  }

  // run now + after DOM settles
  move();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", move, { once: true });
  }
  setTimeout(move, 50);
  setTimeout(move, 250);
  setTimeout(move, 1000);
})();
// === NG_REALMODE_FORCE_REATTACH_V2_END ===


  window.addEventListener("storage", paint);
  window.NG_paintRealModeBtn = paint;
})();
// === NG_REAL_MODE_TOGGLE_BTN_V1_END ===

})();
 /* NG_TOOLBAR_MINI_JS_V1_END (2026-01-30) */

/* NG_LIBRARY_TOGGLE_DOC_V1_START (2026-01-30) */
(function(){
  if (window.__NG_LIBRARY_TOGGLE_DOC_V1__) return;
  window.__NG_LIBRARY_TOGGLE_DOC_V1__ = true;

  document.addEventListener("click", function(e){
    const t = e.target;
    const id = t && t.id;

    if (id === "ng-act-library") {
      const panel = document.getElementById("ng-draft-library");
      if (!panel) { alert("LIBRARY panel not found"); return; }

      const cur = getComputedStyle(panel).display;
      panel.style.display = (cur === "none") ? "block" : "none";
      if (getComputedStyle(panel).display !== "none") {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, true);
})();
/* NG_LIBRARY_TOGGLE_DOC_V1_END (2026-01-30) */

/* NG_DRAFT_LIBRARY_WIRE_V1_START (2026-01-30) */
(function(){
  if (window.__NG_DRAFT_LIBRARY_WIRE_V1__) return;
  window.__NG_DRAFT_LIBRARY_WIRE_V1__ = true;

  const KEY = "ng_draft_library_v1";

  function readLib(){
    try{
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    }catch(e){
      return [];
    }
  }

  function writeLib(arr){
    try{ localStorage.setItem(KEY, JSON.stringify(arr || [])); }catch(e){}
  }

  function renderLib(){
    const out = document.getElementById("ng-lib-out");
    if (!out) return;

    const arr = readLib();
    if (!arr.length){
      out.textContent = "Library empty. (No saved drafts yet)";
      return;
    }

    // Show latest first
    const lines = arr.slice().reverse().map((it, idx) => {
      const ts = it.ts || it.saved_at || "";
      const topic = it.topic || (it.received && it.received.topic) || it.title || "(no topic)";
      return `${idx+1}) ${topic}\n   ${ts}\n`;
    });
    out.textContent = lines.join("\n");
  }

  document.addEventListener("click", function(e){
    const id = e.target && e.target.id;

    if (id === "ng-lib-refresh") {
      renderLib();
      return;
    }

    if (id === "ng-lib-clear") {
      writeLib([]);
      renderLib();
      return;
    }
  }, true);

  // First paint when page loads
  window.addEventListener("load", function(){ renderLib(); });
})();
/* NG_DRAFT_LIBRARY_WIRE_V1_END (2026-01-30) */
/* NG_STORYVIEW_TOGGLE_DOC_V2_START (2026-01-30) */
(function(){
  if (window.__NG_STORYVIEW_TOGGLE_DOC_V2__) return;
  window.__NG_STORYVIEW_TOGGLE_DOC_V2__ = true;
function fillStoryView(){
// export for Generate auto-open (safe global hook)
window.NG_fillStoryView = fillStoryView;

  const out = document.getElementById("ng-storyview-out");
    // --- Prefer formatted DigiPack cards in StoryView ---
  try {
    const host = document.getElementById("ng-storyview-formatted");
    if (host && typeof window.NG_renderDigiPackFormatted === "function") {

      // 1) prefer already-parsed objects (if any)
      let dp =
        window.NG_LAST_DIGIPACK ||
        window.NG_DIGIPACK_OBJ ||
        window.NG_RESPONSE_OBJ ||
        null;

      // 2) else parse from #ngResponse (raw JSON shown in JSON tab)
      if (!dp) {
        const resp = document.getElementById("ngResponse");
        let txt = (resp && resp.textContent) ? resp.textContent.trim() : "";

        // sometimes pre contains leading junk; extract first JSON object/array
        const iObj = txt.indexOf("{");
        const iArr = txt.indexOf("[");
        const i = (iObj >= 0 && iArr >= 0) ? Math.min(iObj, iArr) : Math.max(iObj, iArr);
        if (i > 0) txt = txt.slice(i).trim();

        if (txt && (txt.startsWith("{") || txt.startsWith("["))) {
          try { dp = JSON.parse(txt); } catch (e) { dp = null; }
        }
      }
      // if response is a wrapper, pivot to the actual digipack payload
      if (dp && typeof dp === "object") {
        if (dp.output_json && typeof dp.output_json === "object") dp = dp.output_json;
        else if (dp.output_text && typeof dp.output_text === "string") {
          try { dp = JSON.parse(dp.output_text); } catch(e) {}
        }
      }


      window.NG_renderDigiPackFormatted(dp);

      // if cards rendered, don't overwrite with fallback text
      if (host.textContent && host.textContent.trim()) return;
    }
  } catch (e) {}

  const resp = document.getElementById("ngResponse");
  if (!out || !resp) return;

  const raw = (resp.textContent || "").trim();
  if (!raw) { out.textContent = "(no response yet)"; return; }

  // ---------- helpers ----------
  function esc(s){
    return String(s || "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }
  function clip(text){
    const t = String(text || "");
    if (!t.trim()) return false;
    try{
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(t);
        return true;
      }
    }catch(e){}
    try{
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    }catch(e){}
    return false;
  }

 // Try parse JSON; if not JSON, parse our "=== SECTION ===" text format
let obj = null;
try { obj = JSON.parse(raw); } catch(e) { obj = null; }

// Build sections list
const sections = [];

function parseTripleEquals(text){
  // Format example:
  // === HEADLINE ===
  // ...
  // === SUMMARY ===
  // ...
  const out = [];
  const re = /^===\s*([A-Z0-9 _-]+)\s*===\s*$/gm;
  let m, lastIdx = 0, lastName = null;
  while ((m = re.exec(text)) !== null){
    if (lastName){
      const chunk = text.slice(lastIdx, m.index).trim();
      if (chunk) out.push({ name:lastName, text:chunk });
    }
    lastName = (m[1] || "").trim();
    lastIdx = re.lastIndex;
  }
  if (lastName){
    const chunk = text.slice(lastIdx).trim();
    if (chunk) out.push({ name:lastName, text:chunk });
  }
  return out;
}

if (!obj || typeof obj !== "object"){
  const parts = parseTripleEquals(raw);

  if (parts.length){
    const keyMap = {
      "HEADLINE":"headline",
      "SUMMARY":"summary",
      "WEB":"web",
      "ARTICLE":"web",
      "VIDEO":"video",
      "YOUTUBE":"youtube",
      "YT":"youtube",
      "SHORTS":"shorts",
      "REELS":"shorts",
      "SOCIAL":"social",
      "GRAPHICS":"graphics",
      "GFX":"graphics",
      "PLATES":"graphics",
      "REFS":"refs",
      "REFERENCES":"refs",
      "SOURCES":"refs"
    };

    parts.forEach(p => {
      const up = (p.name || "").toUpperCase().replace(/\s+/g," ").trim();
      const k = keyMap[up] || ("sec_" + up.toLowerCase().replace(/[^a-z0-9]+/g,"_"));
      const title = p.name.charAt(0) + p.name.slice(1).toLowerCase();
      sections.push({ key:k, title: p.name, text:p.text });
    });
  } else {
    sections.push({ key:"raw", title:"Raw", text: raw });
  }
} else {

    // Common keys we might have in DIGI_PACK-like outputs
    const pick = (k) => {
      const v = obj[k];
      if (v == null) return "";
      if (typeof v === "string") return v.trim();
      try { return JSON.stringify(v, null, 2); } catch(e){ return String(v); }
    };

    // Prefer explicit structured buckets if present
    sections.push({ key:"headline", title:"Headline", text: pick("headline") || pick("title") });
    sections.push({ key:"summary", title:"Summary", text: pick("summary") || pick("dek") });

    sections.push({ key:"web", title:"Web", text: pick("web") || pick("article") || pick("web_article") });
    sections.push({ key:"video", title:"Video", text: pick("video") || pick("video_script") });
    sections.push({ key:"youtube", title:"YouTube", text: pick("youtube") || pick("yt") || pick("yt_script") });
    sections.push({ key:"shorts", title:"Shorts", text: pick("shorts") || pick("reels") || pick("short") });
    sections.push({ key:"social", title:"Social", text: pick("social") || pick("twitter") || pick("x") || pick("instagram") });

    sections.push({ key:"graphics", title:"Graphics", text: pick("graphics") || pick("gfx") || pick("plates") });
    sections.push({ key:"refs", title:"Refs", text: pick("refs") || pick("references") || pick("sources") });

    // If none matched, fallback to raw pretty JSON
    const any = sections.some(s => (s.text || "").trim());
    if (!any){
      sections.length = 0;
      sections.push({ key:"json", title:"JSON", text: JSON.stringify(obj, null, 2) });
    }
  }

  // Render HTML cards inside the existing <pre> container by switching it to a div-like renderer
  // (safe: we only set innerHTML; styles remain)
  const html = sections
    .filter(s => (s.text || "").trim())
    .map(s => {
      const id = "ng-sv-" + s.key;
      return `
<div data-ng-sv-sec="${esc(s.key)}" style="padding:10px;border:1px solid #eee;border-radius:12px;margin-bottom:10px;background:#fff;">
  <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
    <div style="font-weight:700;">${esc(s.title)}</div>
    <button type="button" data-ng-sv-copy="${esc(s.key)}" style="padding:6px 10px;border-radius:10px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">Copy</button>
  </div>
  <pre id="${esc(id)}" style="margin-top:8px;white-space:pre-wrap;max-height:220px;overflow:auto;">${esc(s.text)}</pre>
</div>`;
    })
    .join("");

  // IMPORTANT: out is currently a <pre>. innerHTML is ok, but we should also normalize its white-space
  out.style.whiteSpace = "normal";
  out.innerHTML = html || "<div style='opacity:.7'>(no outputs)</div>";

  // Wire copy buttons (delegation)
  out.onclick = function(ev){
    const btn = ev.target && ev.target.getAttribute && ev.target.getAttribute("data-ng-sv-copy");
    if (!btn) return;
    const pre = document.getElementById("ng-sv-" + btn);
    const ok = clip(pre ? pre.textContent : "");
    // tiny inline feedback
    try { ev.target.textContent = ok ? "Copied" : "Copy failed"; setTimeout(()=>{ ev.target.textContent="Copy"; }, 900); } catch(e){}
  };
}

// export for Generate auto-open (safe global hook)
window.NG_fillStoryView = fillStoryView;
console.log("[NG_STORYVIEW] NG_fillStoryView exported");


  function forceAdvancedPanelsVisible(){
    try{
      // If StoryView lives inside ng-advanced-panels, ensure parent is visible
      const adv = document.getElementById("ng-advanced-panels");
      if (adv) adv.style.display = "block";

      // Also set std-ui attribute to advanced (your CSS uses this)
      document.documentElement.setAttribute("data-ng-std-ui", "advanced");
    }catch(e){}
  }

  document.addEventListener("click", function(e){
    const id = e.target && e.target.id;
    if (id === "ng-ui-storyview") {
      forceAdvancedPanelsVisible();
document.body.classList.toggle("ng-show-storyview");


      const panel = document.getElementById("ng-storyview");
      if (!panel) { alert("Story View panel not found"); return; }

      const cur = getComputedStyle(panel).display;
      const next = (cur === "none") ? "block" : "none";
      panel.style.display = next;

      if (next === "block") {
        fillStoryView();
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, true);
})();
/* NG_STORYVIEW_TOGGLE_DOC_V2_END (2026-01-30) */













