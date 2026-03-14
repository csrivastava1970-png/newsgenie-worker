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
      mo.observe(document.documentElement, { childList:true, subtree:true });
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
    if (!b) return;
    var real = isReal();
    b.textContent = real ? "REAL" : "ECHO";
    b.title = real ? "Real Mode ON (OpenAI allowed)" : "Echo Mode (no tokens)";
    b.setAttribute("data-state", real ? "real" : "echo");
try {
  var eb = document.getElementById("ngEchoModeBtn");
  if (eb) {
    eb.setAttribute("data-state", real ? "idle" : "active");
    eb.style.opacity = real ? "0.75" : "1";
    eb.style.fontWeight = real ? "600" : "800";
  }
} catch(e) {}
  }

  // Attach near your mini toolbar anchor
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

/* NG_DRAFT_LIBRARY_WIRE_V2_START (2026-02-14) */
(function(){
  if (window.__NG_DRAFT_LIBRARY_WIRE_V2__) return;
  window.__NG_DRAFT_LIBRARY_WIRE_V2__ = true;

  const KEY = "ng_draft_library_v1";
  const MAX_ITEMS = 200;
  const MAX_BYTES = 3.5 * 1024 * 1024;

  function safeJsonParse(raw, fallback){
    try { return JSON.parse(raw); } catch(e) { return fallback; }
  }

  function readLib(){
    try{
      const raw = localStorage.getItem(KEY);
      const arr = raw ? safeJsonParse(raw, []) : [];
      return Array.isArray(arr) ? arr : [];
    }catch(e){ return []; }
  }

  function approxBytes(obj){
    try { return new Blob([JSON.stringify(obj)]).size; } catch(e) { return 0; }
  }

  function tryWrite(arr){
    try { localStorage.setItem(KEY, JSON.stringify(arr || [])); return true; }
    catch(e){ return false; }
  }

  function guardLib(arr){
    let out = Array.isArray(arr) ? arr.slice() : [];
    if (out.length > MAX_ITEMS) out = out.slice(out.length - MAX_ITEMS);

    let bytes = approxBytes(out);
    let safety = 0;
    while (bytes > MAX_BYTES && out.length > 1 && safety < 5000){
      out.shift();
      bytes = approxBytes(out);
      safety++;
    }
    return out;
  }

  function writeLib(arr){
    const guarded = guardLib(arr || []);
    if (tryWrite(guarded)) return true;

    let tmp = guarded.slice();
    for (let i=0;i<5;i++){
      if (tmp.length <= 1) break;
      tmp.shift();
      if (tryWrite(tmp)) return true;
    }
    return false;
  }

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function itemText(it){
    try{
      const t = [
        it && (it.topic || it.title || ""),
        it && it.received && (it.received.topic || it.received.story || ""),
        it && it.output_json ? JSON.stringify(it.output_json) : ""
      ].join(" ");
      return (t || "").toLowerCase();
    }catch(e){ return ""; }
  }

  function ensureArchiveUI(){
    const out = document.getElementById("ng-lib-out");
    if (!out) return;

    const wrapId = "ng-lib-archive-wrap";
    if (!document.getElementById(wrapId)){
      const wrap = document.createElement("div");
      wrap.id = wrapId;
      wrap.innerHTML = `
        <div style="display:flex;gap:10px;align-items:center;margin:8px 0 10px 0;">
          <input id="ng-lib-search" type="text" placeholder="Search by keyword / topic…"
                 style="flex:1;padding:8px 10px;border-radius:12px;border:1px solid rgba(0,0,0,.15);outline:none;">
          <span id="ng-lib-meta" style="font-size:12px;opacity:.75;white-space:nowrap;"></span>
        </div>
        <div id="ng-lib-list"></div>
        <div id="ng-lib-viewer" style="display:none;margin-top:10px;border:1px solid rgba(0,0,0,.12);border-radius:14px;padding:10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;">
            <div id="ng-lib-viewer-title" style="font-weight:800;"></div>
            <div style="display:flex;gap:8px;align-items:center;">
              <button type="button" id="ng-lib-copy" style="padding:4px 10px;border-radius:10px;">Copy</button>
              <button type="button" id="ng-lib-close" style="padding:4px 10px;border-radius:10px;">Close</button>
            </div>
          </div>
          <pre id="ng-lib-viewer-pre" style="white-space:pre-wrap;max-height:340px;overflow:auto;margin:0;"></pre>
        </div>
      `;
      out.innerHTML = "";
      out.appendChild(wrap);
    }
  }

  function setViewer(on, title, text){
    const v = document.getElementById("ng-lib-viewer");
    const t = document.getElementById("ng-lib-viewer-title");
    const p = document.getElementById("ng-lib-viewer-pre");
    if (!v || !t || !p) return;
    if (!on){
      v.style.display = "none"; t.textContent=""; p.textContent="";
      return;
    }
    v.style.display = "block";
    t.textContent = title || "Saved story";
    p.textContent = text || "";
    try { v.scrollIntoView({ behavior:"smooth", block:"nearest" }); } catch(e) {}
  }

  function formatItemForViewer(it){
    try{
      if (it && it.output_json) return JSON.stringify(it.output_json, null, 2);
    }catch(e){}
    try { return JSON.stringify(it, null, 2); } catch(e) {}
    return String(it || "");
  }

  function renderLib(){
    const out = document.getElementById("ng-lib-out");
    if (!out) return;

    ensureArchiveUI();

    const meta = document.getElementById("ng-lib-meta");
    const listHost = document.getElementById("ng-lib-list");
    const qEl = document.getElementById("ng-lib-search");
    if (!listHost) return;

    const arr = readLib();
    const q = (qEl && qEl.value ? qEl.value : "").trim().toLowerCase();

    if (!arr.length){
      listHost.innerHTML = `<div style="opacity:.7;padding:8px 2px;">Library empty. (No saved drafts yet)</div>`;
      if (meta) meta.textContent = "0";
      setViewer(false);
      return;
    }

    // Build [item, originalIndex] so actions target original array positions
let revPairs = arr.map((it, i) => [it, i]).reverse();
if (q) revPairs = revPairs.filter(([it]) => itemText(it).includes(q));



const rows = revPairs.map(([it, realIndex]) => {

      const ts = it.ts || it.saved_at || "";
      const topic = it.topic || (it.received && it.received.topic) || it.title || "(no topic)";

      let preview = "";
      try {
        const oj = it && it.output_json ? it.output_json : null;
        const wa = oj && oj.web_article;
        preview =
          (wa && typeof wa === "object" && (wa.text || wa.content || wa.body)) ||
          (typeof wa === "string" ? wa : "") ||
          (it && it.received && it.received.story) ||
          (oj && (oj.summary || oj.dek || oj.subhead)) ||
          "";
      } catch(e) {}

      preview = String(preview || "").replace(/\s+/g, " ").trim();
      if (preview.length > 220) preview = preview.slice(0, 220) + "...";

      return `<div data-ng-lib-row="1" data-ng-lib-idx="${realIndex}" style="display:flex;align-items:flex-start;gap:10px;padding:8px 6px;border-bottom:1px solid rgba(0,0,0,.06);">

        <div style="display:flex;flex-direction:column;gap:6px;">
         <button type="button" data-ng-lib="view" style="padding:4px 10px;border-radius:10px;">View</button>

<button type="button" data-ng-lib="del" style="padding:4px 10px;border-radius:10px;opacity:.85;">Delete</button>

        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:800;">${esc(topic)}</div>
          ${preview ? `<div style="margin-top:4px;font-size:12px;line-height:1.35;opacity:.9;">${esc(preview)}</div>` : ""}
          <div style="margin-top:4px;font-size:12px;opacity:.75;">${esc(ts)}</div>
        </div>
      </div>`;
    });

    listHost.innerHTML = rows.join("");
  }

  function getItemByVisibleIndex(idx){
    const list = readLib().slice().reverse();
    return list[idx] || null;
  }

  document.addEventListener("click", function(e){
    const t = e.target;
    const id = t && t.id;

    if (id === "ng-lib-refresh") { renderLib(); return; }
    if (id === "ng-lib-clear")   { writeLib([]); renderLib(); setViewer(false); return; }
    if (id === "ng-lib-close")   { setViewer(false); return; }

    if (id === "ng-lib-copy"){
      const p = document.getElementById("ng-lib-viewer-pre");
      if (!p) return;
      try { navigator.clipboard.writeText(p.textContent || ""); } catch(e){}
      return;
    }

    const btn = (t && t.closest) ? t.closest("button[data-ng-lib]") : t;
    const act = btn && btn.getAttribute && btn.getAttribute("data-ng-lib");
    const row = e.target && e.target.closest ? e.target.closest('[data-ng-lib-row="1"]') : null;

const sidx = row && row.getAttribute ? row.getAttribute("data-ng-lib-idx") : null;

if (act && sidx != null){
  const idx = parseInt(sidx, 10);
  const arr = readLib();
  const it = (Number.isFinite(idx) && arr && arr[idx]) ? arr[idx] : null;
  if (!it) return;

      if (!it) return;

      if (act === "view"){
        const topic = it.topic || (it.received && it.received.topic) || it.title || "Saved story";
        setViewer(false);

        // ALSO open in main StoryView (View acts like Restore)
        try { document.documentElement.setAttribute("data-ng-outtab", "story"); } catch(e) {}

        try {
          const sw = document.getElementById("ng-storyview");
          if (sw) sw.style.display = "block";
          const fmt = document.getElementById("ng-storyview-formatted");
          if (fmt) fmt.style.display = "block";
          try { document.documentElement.setAttribute("data-ng-std-ui", "advanced"); } catch(e) {}
          try {
            const det = document.getElementById("ng-draft-lib-details");
            if (det) det.open = false;
          } catch(e) {}
        } catch(e) {}

        try {
         // Prefer full output_json for structured renderer (not formats-only)
const dp = (it && it.output_json) ? it.output_json : it;

          if (typeof window.NG_renderDigiPackFormatted === "function") window.NG_renderDigiPackFormatted(dp);
          try { localStorage.setItem("NG_DIGIPACK_DRAFT_V1", JSON.stringify(it)); } catch(e) {}
        } catch(e) {}

        try {
          const fmt2 = document.getElementById("ng-storyview-formatted");
          if (fmt2 && fmt2.scrollIntoView) fmt2.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch(e) {}

        return;
      }

      if (act === "restore"){
        // Switch output tab to Story so restored content becomes visible
        try{ document.documentElement.setAttribute("data-ng-outtab","story"); }catch(e){}
        // Ensure StoryView is visible when restoring
        try{
          const sw = document.getElementById("ng-storyview");
          if (sw) sw.style.display = "block";
          const fmt = document.getElementById("ng-storyview-formatted");
          if (fmt) fmt.style.display = "block";
          const out = document.getElementById("ng-storyview-out");
          if (out) out.style.height = "60vh";
          try { document.documentElement.setAttribute("data-ng-std-ui", "advanced"); } catch(e){}
        }catch(e){}
          // Force renderer input (so restore always shows something)
          try{
            const dp = (it && it.output_json) ? it.output_json : it;
window.NG_LAST_DIGIPACK = dp;
window.NG_DIGIPACK_OBJ = dp;
window.NG_RESPONSE_OBJ = dp;

          }catch(e){}
        try{
          try { localStorage.setItem("NG_DIGIPACK_DRAFT_V1", JSON.stringify(it)); } catch(e) {}
          try { localStorage.setItem("NG_DIGIPACK_DRAFTS_V1", JSON.stringify([it])); } catch(e) {}
          try { document.documentElement.setAttribute("data-ng-std-ui", "advanced"); } catch(e) {}

          if (typeof window.NG_fillStoryView === "function") window.NG_fillStoryView();
          else if (typeof window.NG_renderDigiPackFormatted === "function") window.NG_renderDigiPackFormatted(it && it.output_json ? it.output_json : it);

        }catch(e){}
        try {
          const fmt = document.getElementById("ng-storyview-formatted");
          if (fmt && fmt.scrollIntoView) fmt.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch(e) {}

        return;
      }

      if (act === "del"){
  try{
    const arr = readLib();
    const origIdx = idx; // data-ng-lib-idx is the real index
    if (origIdx >= 0 && origIdx < arr.length){
      arr.splice(origIdx, 1);
      writeLib(arr);
    }

          setViewer(false);
          renderLib();
        }catch(e){}
        return;
      }
    }
  }, true);

  document.addEventListener("input", function(e){
    const t = e.target;
    if (t && t.id === "ng-lib-search") renderLib();
  }, true);

  window.addEventListener("load", function(){ renderLib(); });
})();
/* NG_DRAFT_LIBRARY_WIRE_V2_END (2026-02-14) */
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

// Prefer formatted cards. Clear legacy text immediately (prevents stale Raw).
try { if (out) { out.textContent = ""; out.innerHTML = ""; } } catch(e){}

// After a tick, if formatted actually rendered, keep legacy cleared
setTimeout(function(){
  try{
    if (host && host.textContent && host.textContent.trim()) {
      if (out) { out.textContent = ""; out.innerHTML = ""; }
    }
  }catch(e){}
}, 0);

return;



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
// --- NEW: nested-path picker (web_article.dek, social.hashtags, etc.) ---
const pickPath = (path) => {
  try {
    if (!obj || typeof obj !== "object") return "";
    const parts = String(path || "").split(".");
    let cur = obj;
    for (const p of parts) {
      if (!cur || typeof cur !== "object") return "";
      cur = cur[p];
    }
    if (cur == null) return "";
    if (typeof cur === "string") return cur.trim();
    if (Array.isArray(cur)) {
      return cur.map(x => String(x || "").trim()).filter(Boolean).join("\n");
    }
    try { return JSON.stringify(cur, null, 2); } catch(e) { return String(cur); }
  } catch(e) { return ""; }
};

    // Prefer explicit structured buckets if present
    sections.push({ key:"headline", title:"Headline", text: pick("headline") || pick("title") });

// Summary + Dek + Key Points (separate cards)
sections.push({
  key:"summary",
  title:"Summary",
  text: pick("summary") || pick("dek") || pickPath("web_article.summary") || pickPath("article.summary")
});

sections.push({
  key:"dek",
  title:"Dek",
  text: pickPath("web_article.dek") || pickPath("web_article.subhead") || pickPath("article.dek") || pick("dek")
});

sections.push({
  key:"key_points",
  title:"Key Points",
  text:
    pick("key_points") ||
    pick("bullet_points") ||
    pickPath("web_article.key_points") ||
    pickPath("web_article.bullets") ||
    pickPath("article.key_points")
});

// Web / Video / YouTube / Shorts
sections.push({
  key:"web",
  title:"Web Article",
  text:
    pickPath("web_article.text") ||
    pickPath("article.text") ||
    pick("web") ||
    pick("article") ||
    pick("web_article")
});

sections.push({ key:"video", title:"Video Script", text: pick("video") || pick("video_script") || pickPath("video_script.text") });
sections.push({ key:"youtube", title:"YouTube", text: pick("youtube") || pick("yt") || pick("yt_script") || pickPath("youtube.text") });
sections.push({ key:"shorts", title:"Reel / Shorts", text: pick("shorts") || pick("reels") || pick("reel") || pick("short") });

// Social (platform-wise + a fallback Social Pack)
sections.push({
  key:"x_post",
  title:"X Post",
  text:
    pickPath("social.x_post") ||
    pickPath("socials.x_post") ||
    pickPath("social.twitter") ||
    pickPath("social.x") ||
    pick("x_post")
});

sections.push({
  key:"fb_post",
  title:"Facebook Post",
  text: pickPath("social.facebook_post") || pickPath("social.fb_post") || pickPath("socials.fb_post") || pick("fb_post")
});

sections.push({
  key:"insta_caption",
  title:"Instagram Caption",
  text:
    pickPath("social.instagram_caption") ||
    pickPath("social.instagram") ||
    pickPath("socials.instagram_caption") ||
    pick("instagram_caption")
});

sections.push({
  key:"hashtags",
  title:"Hashtags",
  text:
    pickPath("social.hashtags") ||
    pickPath("social.tags") ||
    pickPath("socials.hashtags") ||
    pick("hashtags") ||
    pick("tags")
});

sections.push({
  key:"social",
  title:"Social Pack",
  text: pick("social") || pick("socials") || pick("social_posts")
});

// Graphics + Refs
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
  .filter(s => {
    const k = String(s && s.key || "").toLowerCase();
    const t = String(s && s.title || "").toLowerCase();
    if (k.includes("raw") || t.includes("raw")) return false; // hard-hide raw in StoryView
    return (s.text || "").trim();
  })

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










