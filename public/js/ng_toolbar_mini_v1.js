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
      if (pill) pill.textContent = "mode: " + mode;

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
      <button type="button" id="ng-ui-storyview" class="btn">Story View</button>
      <button type="button" id="ng-ui-commit" class="btn">Commit to Byte</button>
      <span id="ng-ui-mode-pill" style="font-size:12px;opacity:.75;">mode: advanced</span>
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
      if (id === "ng-ui-commit") return commitToByte();
    });

    return wrap;
  }

  function mount() {
    // Avoid duplicates if HTML already has it
    if (q('#ng-std-ui-toolbar-mini')) return;

    const tb = buildToolbar();

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
    const out = document.getElementById("ng-storyview-out");
    const resp = document.getElementById("ngResponse");
    if (!out || !resp) return;
    out.textContent = (resp.textContent || "").trim() || "(no response yet)";
  }

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




