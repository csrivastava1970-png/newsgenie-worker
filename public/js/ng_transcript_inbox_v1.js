/* NG_TRANSCRIPT_INBOX_V1 (2026-02-07)
   Wires transcript loader buttons:
   - Load (localStorage)
   - Paste (clipboard)
   - Import (file)
   - Refresh Latest (API)
   - Clear Saved
*/
(() => {
  const KEY = "NG_REVERIE_TRANSCRIPT_JSON_V1";

  function $(id){ return document.getElementById(id); }
  function setStatus(t){
    const s = $("ng-latest-transcript-status");
    if (s) s.textContent = t || "";
  }
  function setHint(t){
    const s = $("transcript-load-hint");
    if (s) s.textContent = t || "";
  }
  function setPreview(txt){
    const box = $("ng-latest-transcript-preview");
    if (!box) return;
    const t = (txt || "").trim();
    box.textContent = t ? t.slice(0, 4000) : "";
  }
  function readLS(){
    try { return localStorage.getItem(KEY) || ""; } catch(e){ return ""; }
  }
  function writeLS(v){
    try { localStorage.setItem(KEY, v || ""); } catch(e){}
  }
  function safeParse(v){
    try { return JSON.parse(v); } catch(e){ return null; }
  }
  function updateUIFromValue(v, label){
    const ta = $("ta-transcript-json");
    if (ta) ta.value = v || "";
    const ok = !!safeParse(v || "");
    setStatus((label||"") + (label ? " • " : "") + (v ? ("len " + (v.length||0)) : "empty") + (ok ? " • JSON OK" : (v ? " • JSON?" : "")));
    setPreview(v);
  }

  async function doRefreshAPI(){
    try{
      setHint("Fetching latest transcript from API…");
      const r = await fetch("/api/transcript/latest?cb=" + Date.now(), { cache:"no-store" });
      const j = await r.json();
      const text = (j && (j.text || "")) || "";
      if (text) {
        writeLS(text);
        updateUIFromValue(text, "API latest");
        setHint("Loaded from API and saved to localStorage.");
      } else {
        updateUIFromValue(readLS(), "API empty (using saved)");
        setHint("API returned empty. Using saved localStorage (if any).");
      }
    } catch(e){
      setHint("API refresh failed: " + (e && e.message ? e.message : e));
    }
  }

  async function doPaste(){
    try{
      setHint("Reading clipboard…");
      const t = await navigator.clipboard.readText();
      if (!t) { setHint("Clipboard empty."); return; }
      writeLS(t);
      updateUIFromValue(t, "Pasted");
      setHint("Pasted and saved to localStorage.");
    } catch(e){
      setHint("Paste failed (permission?): " + (e && e.message ? e.message : e));
    }
  }

  function doLoad(){
    const v = readLS();
    updateUIFromValue(v, "Loaded");
    setHint(v ? "Loaded from localStorage." : "Nothing saved yet.");
  }

  function doClear(){
    writeLS("");
    updateUIFromValue("", "Cleared");
    setHint("Cleared saved transcript.");
  }

  function doImport(){
    const f = $("file-transcript-json");
    if (f) f.click();
  }

  function wire(){
    const btnLoad = $("btn-load-transcript-json");
    const btnAPI  = $("btn-refresh-latest-transcript");
    const btnPaste= $("btn-paste-transcript-json");
    const btnImp  = $("btn-import-transcript-json");
    const btnClr  = $("btn-clear-transcript-json");
    const file    = $("file-transcript-json");

    if (btnLoad) btnLoad.addEventListener("click", doLoad);
    if (btnAPI)  btnAPI.addEventListener("click", doRefreshAPI);
    if (btnPaste)btnPaste.addEventListener("click", doPaste);
    if (btnImp)  btnImp.addEventListener("click", doImport);
    if (btnClr)  btnClr.addEventListener("click", doClear);

    if (file) {
      file.addEventListener("change", async () => {
        try{
          const f = file.files && file.files[0];
          if (!f) return;
          setHint("Importing file…");
          const t = await f.text();
          writeLS(t);
          updateUIFromValue(t, "Imported");
          setHint("Imported and saved to localStorage.");
        } catch(e){
          setHint("Import failed: " + (e && e.message ? e.message : e));
        } finally {
          try { file.value = ""; } catch(e){}
        }
      });
    }

    // initial load (do not auto-fetch API)
    doLoad();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire, { once:true });
  } else {
    wire();
  }

  console.log("[NG_TRANSCRIPT_INBOX_V1] wired");
/* === NG_TRANSCRIPT_LINES_V1_START (20260207) === */
(function(){
  // --- safe DOM getters ---
  function $(id){ try { return document.getElementById(id); } catch(e){ return null; } }

  // --- inject tiny CSS once (safe) ---
  function ensureLinesCss(){
    try{
      if (document.getElementById("ng-lines-css-v1")) return;
      var css = `
#ng-lines-wrap{ overflow:auto; max-height: 52vh; padding: 8px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.12); background: rgba(0,0,0,0.02); }
.ng-line-item{ display:flex; gap:10px; align-items:flex-start; padding:8px 10px; margin:6px 0; border-radius:10px; border:1px solid rgba(0,0,0,0.10); background:#fff; cursor:pointer; user-select:none; }
.ng-line-item:hover{ border-color: rgba(0,0,0,0.22); }
.ng-line-item input{ margin-top:3px; }
.ng-line-text{ white-space: pre-wrap; line-height: 1.4; }
.ng-line-item.ng-line-selected{ border-color: rgba(0,0,0,0.35); box-shadow: 0 0 0 2px rgba(0,0,0,0.06) inset; }
      `.trim();
      var st = document.createElement("style");
      st.id = "ng-lines-css-v1";
      st.textContent = css;
      (document.head || document.documentElement).appendChild(st);
    }catch(e){}
  }

  // --- robust text extraction from unknown JSON shapes ---
  function isStr(x){ return (typeof x === "string"); }

  function pickPreferredText(obj){
    try{
      if (!obj || typeof obj !== "object") return "";
      // common candidates (you can extend later)
      var cands = [
        "display_text","displayText","text","transcript_text","transcriptText",
        "transcript","raw_text","rawText","content","body","message"
      ];
      for (var i=0;i<cands.length;i++){
        var k = cands[i];
        if (isStr(obj[k]) && obj[k].trim().length >= 20) return obj[k];
      }
      return "";
    }catch(e){ return ""; }
  }

  function collectStringsDeep(node, out, depth){
    try{
      if (depth > 6) return; // keep safe
      if (node == null) return;
      if (isStr(node)){
        var s = node.trim();
        if (s.length >= 20) out.push(s);
        return;
      }
      if (Array.isArray(node)){
        for (var i=0;i<node.length;i++) collectStringsDeep(node[i], out, depth+1);
        return;
      }
      if (typeof node === "object"){
        // prefer direct pick at each object
        var pref = pickPreferredText(node);
        if (pref) out.push(pref.trim());

        // then traverse keys
        var keys = Object.keys(node);
        for (var j=0;j<keys.length;j++){
          var k = keys[j];
          // skip obviously non-text blobs
          if (/^(id|ts|time|start|end|dur|duration|lang|speaker|confidence)$/i.test(k)) continue;
          collectStringsDeep(node[k], out, depth+1);
        }
      }
    }catch(e){}
  }

  function extractPlainTextFromJson(obj){
    try{
      // 1) best guess: preferred fields at top level
      var top = pickPreferredText(obj);
      if (top) return String(top);

      // 2) deep collect of likely meaningful strings
      var arr = [];
      collectStringsDeep(obj, arr, 0);
      if (!arr.length) return "";

      // de-dup + choose “best” strings (longer first)
      var seen = Object.create(null);
      var uniq = [];
      for (var i=0;i<arr.length;i++){
        var s = (arr[i] || "").trim();
        if (!s) continue;
        // normalize to dedupe
        var key = s.replace(/\s+/g," ").slice(0,220);
        if (seen[key]) continue;
        seen[key] = 1;
        uniq.push(s);
      }

      uniq.sort(function(a,b){ return (b.length||0) - (a.length||0); });

      // if the top string is huge, just use it; else merge top few
      var best = uniq[0] || "";
      if (best.length >= 400) return best;

      var merged = uniq.slice(0,5).join(" ");
      return merged;
    }catch(e){ return ""; }
  }

  // --- sentence splitting (Hindi + EN punctuation) ---
  function normalizeText(t){
    t = (t == null ? "" : String(t));
    t = t.replace(/\r\n/g,"\n").replace(/\r/g,"\n");
    t = t.replace(/\n+/g," ");
    t = t.replace(/\s+/g," ").trim();
    return t;
  }

  function splitSentences(t){
    t = normalizeText(t);
    if (!t) return [];

    // insert newlines after sentence punctuation
    // Hindi danda '।' + common EN punctuation
    t = t.replace(/([।?!\.])\s+/g, "$1\n");

    var parts = t.split("\n").map(function(s){ return s.trim(); }).filter(Boolean);

    // soft cleanup: merge micro fragments like just "।" etc.
    var out = [];
    for (var i=0;i<parts.length;i++){
      var s = parts[i];
      if (!s) continue;
      if (s.length <= 2 && out.length){
        out[out.length-1] = (out[out.length-1] + " " + s).trim();
      } else {
        out.push(s);
      }
    }
    return out;
  }

  // --- render list into Transcript Lines panel ---
  function updateLinesStatus(total, selected, note){
    try{
      var el = $("ng-lines-status");
      if (!el) return;
      var t = "Lines: " + (total||0) + " | Selected: " + (selected||0);
      if (note) t += " | " + note;
      el.textContent = t;
    }catch(e){}
  }

  function getLineCheckboxes(){
    var wrap = $("ng-lines-wrap");
    if (!wrap) return [];
    return Array.prototype.slice.call(wrap.querySelectorAll('input[type="checkbox"][data-ng-line="1"]') || []);
  }

  function countSelected(){
    var cbs = getLineCheckboxes();
    var n = 0;
    for (var i=0;i<cbs.length;i++) if (cbs[i].checked) n++;
    return n;
  }

  function renderLines(sentences, note){
    ensureLinesCss();

    var wrap = $("ng-lines-wrap");
    if (!wrap) return;

    wrap.innerHTML = "";
    var total = (sentences && sentences.length) ? sentences.length : 0;

    if (!total){
      wrap.textContent = "No transcript lines yet. (Import/Paste/Load a transcript first)";
      updateLinesStatus(0,0, note || "empty");
      return;
    }

    var frag = document.createDocumentFragment();
    for (var i=0;i<sentences.length;i++){
      var s = sentences[i];

      var row = document.createElement("div");
      row.className = "ng-line-item";

      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.setAttribute("data-ng-line","1");
      cb.setAttribute("data-idx", String(i));

      var txt = document.createElement("div");
      txt.className = "ng-line-text";
      txt.textContent = s;

      row.appendChild(cb);
      row.appendChild(txt);

      // click on row toggles checkbox (but not double toggle when clicking checkbox)
      row.addEventListener("click", (function(checkbox, rowEl){
        return function(ev){
          try{
            if (ev && ev.target && ev.target.tagName === "INPUT") {
              // checkbox click will be handled below
            } else {
              checkbox.checked = !checkbox.checked;
            }
            rowEl.classList.toggle("ng-line-selected", !!checkbox.checked);
            updateLinesStatus(total, countSelected(), note || "");
          }catch(e){}
        };
      })(cb, row));

      cb.addEventListener("change", (function(rowEl){
        return function(){
          try{
            rowEl.classList.toggle("ng-line-selected", !!this.checked);
            updateLinesStatus(total, countSelected(), note || "");
          }catch(e){}
        };
      })(row));

      frag.appendChild(row);
    }

    wrap.appendChild(frag);
    updateLinesStatus(total, 0, note || "rendered");
  }

  // --- bind Select All / Clear Selection once ---
  function bindLinesControlsOnce(){
    try{
      if (window.__NG_LINES_CTRL_BOUND_V1) return;
      window.__NG_LINES_CTRL_BOUND_V1 = true;

      var btnAll = $("ng-lines-selectall");
      var btnClear = $("ng-lines-clear");

      if (btnAll){
        btnAll.addEventListener("click", function(){
          try{
            var cbs = getLineCheckboxes();
            for (var i=0;i<cbs.length;i++){
              cbs[i].checked = true;
              var row = cbs[i].closest(".ng-line-item");
              if (row) row.classList.add("ng-line-selected");
            }
            updateLinesStatus(cbs.length, cbs.length, "select all");
          }catch(e){}
        });
      }

      if (btnClear){
        btnClear.addEventListener("click", function(){
          try{
            var cbs = getLineCheckboxes();
            for (var i=0;i<cbs.length;i++){
              cbs[i].checked = false;
              var row = cbs[i].closest(".ng-line-item");
              if (row) row.classList.remove("ng-line-selected");
            }
            updateLinesStatus(cbs.length, 0, "cleared");
          }catch(e){}
        });
      }
    }catch(e){}
  }

  // --- auto-render watcher: detects new transcript JSON in textarea ---
  function tryRenderFromTextarea(){
    try{
      bindLinesControlsOnce();

      var ta = $("ta-transcript-json");
      if (!ta) return;

      var raw = (ta.value || "").trim();
      if (!raw) return;

      // avoid re-render if unchanged
      var sig = String(raw.length) + ":" + raw.slice(0,80) + ":" + raw.slice(-80);
      if (window.__NG_LINES_LAST_SIG_V1 === sig) return;
      window.__NG_LINES_LAST_SIG_V1 = sig;

             // --- NEW: if textarea already contains [Speaker|Designation] Text, render speaker-aware blocks ---
       try{
         var hasSpk = /^\s*\[[^\]\|]+?\s*\|.*?\]\s*\S+/m.test(raw);
         if (hasSpk){
           var parsed = [];
           // Prefer global parser if available (from other module), else do local parse.
           if (window.NG_parseTranscriptSpkDesig){
             parsed = window.NG_parseTranscriptSpkDesig(raw) || [];
           } else {
             // local lightweight parse
             var lines = String(raw||"").split(/\r?\n/);
             for (var ii=0; ii<lines.length; ii++){
               var line = String(lines[ii]||"").trim();
               if (!line) continue;
               var mm = line.match(/^\s*\[\s*([^\]|]+?)\s*(?:\|\s*([^\]]+?)\s*)?\]\s*(.+)\s*$/);
               if (!mm) continue;
               var sp = String(mm[1]||"").trim();
               var dg = String(mm[2]||"").trim();
               var tx = String(mm[3]||"").trim();
               if (!sp || !tx) continue;
               parsed.push({ speaker: sp, desig: dg, text: tx });
             }
           }

           // Keep blocks speaker-aware by keeping the bracket prefix in rendered lines
           var blocks = parsed.map(function(it){
             var sp = String(it.speaker||"").trim();
             var dg = String(it.desig||"").trim();
             var tx = String(it.text||"").trim();
             return "[" + sp + "|" + dg + "] " + tx;
           }).filter(Boolean);

           renderLines(blocks, "from [Speaker|Designation] transcript");
           return;
         }
       }catch(e){}

       // --- default: treat as JSON ---
       var obj = null;
       try { obj = JSON.parse(raw); } catch(e){ obj = null; }

       if (!obj){
         renderLines([], "JSON invalid");
         return;
       }

       var plain = extractPlainTextFromJson(obj);
       var sentences = splitSentences(plain);
       renderLines(sentences, "from transcript JSON");

    }catch(e){}
  }

  function bootLinesWatcher(){
    try{
      // run now + periodic (covers import/paste/load/api refresh without touching handlers)
      tryRenderFromTextarea();
      if (window.__NG_LINES_WATCHER_V1) return;
      window.__NG_LINES_WATCHER_V1 = setInterval(tryRenderFromTextarea, 900);
    }catch(e){}
  }

  // boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootLinesWatcher, { once:true });
  } else {
    bootLinesWatcher();
  }
})();
/* === NG_TRANSCRIPT_LINES_V1_END === */
/* === NG_TRANSCRIPT_BLOCKS_TO_BYTES_V1_START (20260207) === */
(function(){
  if (window.__NG_BLOCKS_TO_BYTES_BOUND_V1) return;
  window.__NG_BLOCKS_TO_BYTES_BOUND_V1 = true;

  function $(id){ try{return document.getElementById(id);}catch(e){return null;} }

  // target bytes textarea (existing)
  function getBytesTA(){
    // try common ids safely
    return $("ng-byte-draft-text");
  }

  function getSelectedBlocks(){
    var wrap = $("ng-lines-wrap");
    if (!wrap) return [];
    var items = wrap.querySelectorAll(".ng-line-item.ng-line-selected");
    var out = [];
    items.forEach(function(it){
      var txt = it.querySelector(".ng-line-text");
      if (txt && txt.textContent) out.push(txt.textContent.trim());
    });
    return out.filter(Boolean);
  }

  function normalize(s){
    return String(s||"").replace(/\s+/g," ").trim();
  }

  function dedupeAppend(existing, incoming){
    var seen = Object.create(null);
    existing.forEach(function(s){
      var k = normalize(s).slice(0,180);
      if (k) seen[k]=1;
    });
    var out = existing.slice();
    incoming.forEach(function(s){
      var k = normalize(s).slice(0,180);
      if (!k || seen[k]) return;
      seen[k]=1;
      out.push(s);
    });
    return out;
  }

  function splitExisting(val){
    if (!val) return [];
    // split by blank lines
    return val.split(/\n\s*\n/).map(function(s){return s.trim();}).filter(Boolean);
  }

  function joinBlocks(arr){
    return arr.join("\n\n");
  }

   function parseSpkDesigPrefix(line){
    line = String(line || "").trim();
    if (!line) return null;
    var m = line.match(/^\s*\[\s*([^\]|]+?)\s*(?:\|\s*([^\]]+?)\s*)?\]\s*(.+)\s*$/);
    if (!m) return null;
    return {
      speaker: String(m[1] || "").trim(),
      desig:   String(m[2] || "").trim(),
      text:    String(m[3] || "").trim()
    };
  }

  function addSelectedToBytes(){
    var ta = getBytesTA();
    if (!ta) return alert("Bytes textarea not found.");

    var selected = getSelectedBlocks();
    if (!selected.length) return alert("No transcript blocks selected.");

    // 1) capture speaker/desig from FIRST selected block (source-of-truth = transcript)
    try{
      var first = parseSpkDesigPrefix(selected[0]);
      if (first && first.speaker){
        if (window.NG_setLastSpkDesig) window.NG_setLastSpkDesig({ speaker:first.speaker, desig:first.desig });
        else {
          localStorage.setItem("NG_LAST_SPEAKER_V1", first.speaker);
          localStorage.setItem("NG_LAST_DESIG_V1", first.desig || "");
        }
      }
    }catch(e){}

    // 2) write clean draft text (remove [speaker|desig] prefix if present)
    var cleaned = selected.map(function(s){
      var p = parseSpkDesigPrefix(s);
      return p && p.text ? p.text : String(s||"").trim();
    }).filter(Boolean);

    var existing = splitExisting(ta.value || "");
    var merged = dedupeAppend(existing, cleaned);
    ta.value = joinBlocks(merged);

    // visual feedback
    ta.focus();
    ta.scrollTop = ta.scrollHeight;
  }


  // bind button
  function bind(){
    var btnMake = document.querySelector("button#ng-make-byte");
    if (btnMake){
      /* NG_DISABLE_OLD_MAKEBTN_HANDLER_V1 (2026-02-11)
   Disabled: old Make Draft binding wrongly called addSelectedToBytes().
   New binding is below (makeDraftFromSelection). */}

   var btnAdd = document.querySelector("button#ng-add-final");
if (btnAdd){

  function readByteListFromUI(){
    // Best-effort: try common containers + row/card patterns
    var arr = [];

    // 1) Common list containers
    var roots = [
      document.getElementById("ng-bytes-list"),
      document.getElementById("ng-byte-list"),
      document.getElementById("ng-bytes-rows"),
      document.getElementById("ng-bytes-cards"),
      document.getElementById("ng-bytes"),
    ].filter(Boolean);

    // if none found, try any element that looks like bytes list
    if (!roots.length){
      var guess = document.querySelector("[data-ng-bytes-list], .ng-bytes-list, #bytes-list");
      if (guess) roots = [guess];
    }

    // 2) Collect text from rows/cards
    roots.forEach(function(root){
      // textareas / inputs inside rows
      var nodes = root.querySelectorAll(
        "textarea, input[type='text'], .ng-byte-text, .byte-text, [data-ng-byte], .ng-line-text"
      );
      nodes.forEach(function(n){
        var t = "";
        if (n && typeof n.value === "string") t = n.value;
        else if (n && n.textContent) t = n.textContent;
        t = String(t || "").trim();
        if (t) arr.push(t);
      });
    });

    // 3) If still empty, fallback to draft textarea blocks (NOT selection)
    if (!arr.length){
      try{
        var ta = getBytesTA();
        var cur = (ta && ta.value ? String(ta.value).trim() : "");
        if (cur) arr = splitExisting(cur);
      }catch(e){}
    }

    // normalize + de-dupe
    arr = arr.map(function(s){ return String(s||"").trim(); }).filter(Boolean);
    var out = [];
    var seen = Object.create(null);
    arr.forEach(function(s){
      var k = normalize(s).slice(0,180);
      if (!k || seen[k]) return;
      seen[k] = 1;
      out.push(s);
    });
    return out;
  }

  function writeFinalBytesToUI(items){
    // Best-effort: update common final-bytes targets if present
    var txt = joinBlocks(items || []);

    var taFinal =
      document.getElementById("ng-final-bytes") ||
      document.querySelector("#ngFinalBytes") ||
      document.querySelector("textarea#ng-final-bytes") ||
      document.querySelector("textarea[data-ng-final-bytes]");

    if (taFinal && typeof taFinal.value === "string") {
      taFinal.value = txt;
    }

    var outPre =
      document.getElementById("ng-final-bytes-list-auto") ||
      document.getElementById("ng-final-bytes-out") ||
      document.querySelector("[data-ng-final-bytes-out]");

    if (outPre && typeof outPre.textContent === "string") {
      outPre.textContent = txt || "(Final Bytes empty)";
    }
  }

  function persistFinalBytes(items){
    // NG_FINAL_BYTES_APPEND_DEDUPE_V2 (2026-02-12)
    var incoming = Array.isArray(items) ? items : (items ? [items] : []);
    var existing = [];
    try {
      var raw = localStorage.getItem("NG_FINAL_BYTES_V1") || "";
      if (raw) {
        var j = null; try { j = JSON.parse(raw); } catch(e){}
        if (Array.isArray(j)) existing = j;
        else if (j && Array.isArray(j.items)) existing = j.items;
        else if (j && j.payload && Array.isArray(j.payload.items)) existing = j.payload.items;
      }
    } catch(e){}

    function normText(x){
      try {
        if (x == null) return "";
        if (typeof x === "string") return x.trim();
        if (typeof x === "object") return String(x.text || x.t || x.line || "").trim();
        return String(x).trim();
      } catch(e){ return ""; }
    }

    // merge + dedupe by normalized text (case-insensitive)
    var seen = Object.create(null);
    var merged = [];
    function addOne(x){
      var t = normText(x);
      if (!t) return;
      var k = t.toLowerCase();
      if (seen[k]) return;
      seen[k] = 1;
      merged.push(typeof x === "object" && x ? Object.assign({}, x, { text: t }) : { text: t });
    }

    try { (existing || []).forEach(addOne); } catch(e){}
    try { (incoming || []).forEach(addOne); } catch(e){}

    var payload = {
      v: 2,
      saved_at: new Date().toISOString(),
      items: merged
    };

    try { localStorage.setItem("NG_FINAL_BYTES_V1", JSON.stringify(payload)); } catch(e){}
    return merged;
  }

  // CAPTURE PHASE: we own the click and always commit/persist.
  btnAdd.addEventListener("click", function(ev){
    try{
      ev.preventDefault();
      ev.stopPropagation();
      // NG_PATCH_DISABLE_STOP_IMMEDIATE_V1 (2026-02-11) disabled: ev.stopImmediatePropagation();
var items = readByteListFromUI();

      // NG_DRAFT_TO_FINAL_BYTES_BRIDGE_V1 (2026-02-11)
      // If UI byte-rows are empty, fall back to Draft textbox.
      try{
        if (!items || !items.length){
          var dta = document.getElementById("ng-byte-draft-text");
          var dtxt = dta ? String(dta.value || "").trim() : "";
          if (dtxt){
            items = [{ text: dtxt }];
          }
        }
      }catch(e){}

      // Commit + persist
      var merged = persistFinalBytes(items);
      // UI refresh (avoid false 'commit failed' if UI renderer not present)
      try{
        if (typeof writeFinalBytesToUI === "function") {
          writeFinalBytesToUI(merged);
        } else if (typeof window.NG_refreshFinalBytes === "function") {
          window.NG_refreshFinalBytes();
        }
      }catch(e){
        console.warn("[NG] UI refresh failed (saved anyway)", e);
      }

      // notify other modules (optional)
      try{
        window.dispatchEvent(new CustomEvent("NG_FINAL_BYTES_COMMITTED", { detail: { items: merged } }));
      }catch(e){}

      // tiny UX feedback
      try{
        btnAdd.blur();
      }catch(e){}
      alert("Final Bytes saved: " + (merged ? merged.length : 0));
    }catch(e){
      console.error("[NG] Add to Bytes handler error (saved may have succeeded)", e); alert("Note: UI commit error (check console). Saved bytes may still be stored.");
    }
  }, true);
}

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, {once:true});
  } else {
    bind();
  }
})();
/* === NG_TRANSCRIPT_BLOCKS_TO_BYTES_V1_END === */

})();
/* NG_INBOX_EXPORTS_AND_BOOT_V1 (2026-02-11) */
    // NG_EXPORT_MAKE_DRAFT_FROM_SELECTION_V1 (2026-02-12)
    if (typeof makeDraftFromSelection === "function") window.makeDraftFromSelection = makeDraftFromSelection;
;(() => {
  try {
    // Export common entrypoints if they exist inside this file's scope
    if (typeof initTranscriptInbox === "function") window.initTranscriptInbox = initTranscriptInbox;

    if (typeof NG_setTranscriptLines === "function") window.NG_setTranscriptLines = NG_setTranscriptLines;
    if (typeof NG_loadTranscriptJSON === "function") window.NG_loadTranscriptJSON = NG_loadTranscriptJSON;
    if (typeof NG_parseTranscriptJSON === "function") window.NG_parseTranscriptJSON = NG_parseTranscriptJSON;
    if (typeof NG_renderTranscriptLines === "function") window.NG_renderTranscriptLines = NG_renderTranscriptLines;
    if (typeof renderTranscriptLines === "function") window.renderTranscriptLines = renderTranscriptLines;

    console.log("[NG_INBOX] exports:", {
      initTranscriptInbox: typeof window.initTranscriptInbox,
      NG_setTranscriptLines: typeof window.NG_setTranscriptLines,
      NG_loadTranscriptJSON: typeof window.NG_loadTranscriptJSON,
      NG_ingestTranscript: typeof window.NG_ingestTranscript
    });

    // Auto-boot once DOM is ready (safe)
    function bootOnce() {
      try {
        if (window.__NG_INBOX_BOOTED__) return;
        window.__NG_INBOX_BOOTED__ = true;
        // NG_EXPORT_MAKE_DRAFT_IN_INIT_V1 (2026-02-12)
        try {
          if (typeof makeDraftFromSelection === "function") window.makeDraftFromSelection = makeDraftFromSelection;
        } catch(e){}

        if (typeof window.initTranscriptInbox === "function") {
          window.initTranscriptInbox();
          console.log("[NG_INBOX] initTranscriptInbox() called");
        } else {
          console.warn("[NG_INBOX] initTranscriptInbox not available to boot");
        }
      } catch (e) {
        console.error("[NG_INBOX] boot error", e);
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootOnce, { once: true });
    } else {
      bootOnce();
    }
  } catch (e) {
    console.error("[NG_INBOX] export block failed", e);
  }
})();
/* NG_TRANSCRIPT_INBOX_WIRE_V2 (2026-02-11)
   Guarantees globals:
   - window.initTranscriptInbox
   - window.NG_setTranscriptLines
   - window.NG_loadTranscriptJSON
*/
;(() => {
  try {
    const LS_KEY = "NG_REVERIE_TRANSCRIPT_JSON_V1";

    function $(id){ return document.getElementById(id); }
    function qsa(sel, root){ try { return Array.from((root||document).querySelectorAll(sel)); } catch(e){ return []; } }

    // -------- Transcript Lines Renderer (checkbox cards) --------
    window.NG_setTranscriptLines = function(lines){
      const wrap = $("ng-lines-wrap");
      const st   = $("ng-lines-status");
      if (!wrap) { console.warn("[NG_TLINES] #ng-lines-wrap missing"); return; }

      const arr = Array.isArray(lines) ? lines : [];
      window.__NG_TLINES = arr;

      wrap.innerHTML = "";
      if (st) st.textContent = arr.length ? ("Lines: " + arr.length) : "No lines yet";

      for (let i=0; i<arr.length; i++){
        const t = String(arr[i] || "").replace(/\s+/g," ").trim();
        if (!t) continue;

        const row = document.createElement("label");
        row.style.cssText = "display:flex;gap:10px;align-items:flex-start;padding:6px 8px;border:1px solid #f1f1f1;border-radius:10px;cursor:pointer;background:#fff;";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.setAttribute("data-i", String(i));
        cb.style.marginTop = "3px";

        const txt = document.createElement("div");
        txt.textContent = t;
        txt.style.cssText = "flex:1;line-height:1.35;";

        row.appendChild(cb);
        row.appendChild(txt);
        wrap.appendChild(row);
      }
    };

    function getSelectedLines(){
      const wrap = $("ng-lines-wrap");
      const base = (window.__NG_TLINES && Array.isArray(window.__NG_TLINES)) ? window.__NG_TLINES : [];
      if (!wrap) return [];

      // support both data-i (new) and data-ln (script1_dump)
      const cbs = qsa('input[type=checkbox]:checked', wrap)
        .filter(cb => cb.hasAttribute('data-i') || cb.hasAttribute('data-ln'));

      const out = [];
      for (const cb of cbs){
        let i = -1;
        if (cb.hasAttribute('data-i'))  i = parseInt(cb.getAttribute('data-i')  || "-1", 10);
        if (i < 0 && cb.hasAttribute('data-ln')) i = parseInt(cb.getAttribute('data-ln') || "-1", 10);

        let t = "";
        if (i >= 0 && base && base.length && base[i] != null) {
          t = String(base[i] || "").trim();
        }

        // DOM fallback (works even if base not aligned)
        if (!t){
          const row = cb.closest('.ng-line') || cb.parentElement;
          const div = row ? row.querySelector('div') : null;
          t = String((div ? div.textContent : (row ? row.textContent : "")) || "").trim();
        }

        if (t) out.push(t);
      }
      return out;
    }

    function selectAll(on){
      const wrap = $("ng-lines-wrap");
      if (!wrap) return;
      qsa("input[type=checkbox][data-i], input[type=checkbox][data-ln]", wrap)
        .forEach(cb => cb.checked = !!on);
    }

    function makeDraftFromSelection(){
      const sel = getSelectedLines();
      const ta  = $("ng-byte-draft-text");
      const st  = $("ng-byte-draft-status");
      if (!ta) { console.warn("[NG_TLINES] #ng-byte-draft-text missing"); return; }

      // NG_PATCH_MAKE_DRAFT_NO_CLEAR_V1 (2026-02-12)
      // Do NOT clear draft if nothing is selected.
      if (!sel || !sel.length){
        if (st) st.textContent = "No lines selected";
        return;
      }
    // NG_EXPORT_MAKE_DRAFT_AFTER_DEF_V1 (2026-02-12)
    try { window.makeDraftFromSelection = makeDraftFromSelection; } catch(e){}
      ta.value = sel.join("\n");
      if (st) st.textContent = "Selected: " + sel.length;
      ta.dispatchEvent(new Event("input", { bubbles:true }));
    }

    // -------- Load JSON/Text from textarea -> set NG_TRANSCRIPT + ingest --------
    window.NG_loadTranscriptJSON = function(){
      const ta = $("ta-transcript-json");
      if (!ta) { console.warn("[NG_INBOX] #ta-transcript-json missing"); return; }

      const raw = (ta.value || "").trim();
      if (!raw) { console.warn("[NG_INBOX] textarea empty"); return; }

      try { localStorage.setItem(LS_KEY, raw); } catch(e){}

      let parsed = raw;
      try { parsed = JSON.parse(raw); } catch(e){}

      // Extract text candidates
      function extractText(obj){
        if (typeof obj === "string") return obj;
        if (obj && typeof obj.display_text === "string" && obj.display_text.trim()) return obj.display_text.trim();
        if (obj && typeof obj.text === "string" && obj.text.trim()) return obj.text.trim();

        const cands = [obj?.result, obj?.output, obj?.data, obj?.transcript, obj?.transcription].filter(Boolean);
        for (const c of cands){
          if (typeof c?.display_text === "string" && c.display_text.trim()) return c.display_text.trim();
          if (typeof c?.text === "string" && c.text.trim()) return c.text.trim();
        }
        return "";
      }

      const text = extractText(parsed) || (typeof parsed === "string" ? parsed : "");
      window.NG_TRANSCRIPT = text;
      console.log("[NG_INBOX] NG_TRANSCRIPT set chars:", (text||"").length);

      // If ingest exists (index.html hook), use it:
      if (typeof window.NG_ingestTranscript === "function") {
        try { window.NG_ingestTranscript(parsed); } catch(e){ console.error("[NG_INBOX] ingest error", e); }
      } else {
        // fallback: split lines and render
        const lines = String(text||"")
          .replace(/\r/g,"\n")
          .split("\n")
          .map(s => s.trim())
          .filter(s => s.length >= 8)
          .slice(0, 240);
        window.NG_setTranscriptLines(lines);
      }
    };

    // -------- Inbox init: bind buttons --------
    window.initTranscriptInbox = function(){
      const btnLoad  = $("btn-load-transcript-json");
      const btnPaste = $("btn-paste-transcript-json");
      const btnImp   = $("btn-import-transcript-json");
      const btnClr   = $("btn-clear-transcript-json");
      const btnSelA  = $("ng-lines-selectall");
      const btnSelC  = $("ng-lines-clear");
      const btnMake  = $("ng-make-byte");

      if (btnLoad && !btnLoad.__ng){
        btnLoad.__ng = 1;
        btnLoad.addEventListener("click", (e)=>{ e.preventDefault(); window.NG_loadTranscriptJSON(); });
      }

      if (btnPaste && !btnPaste.__ng){
        btnPaste.__ng = 1;
        btnPaste.addEventListener("click", async (e)=>{
          e.preventDefault();
          try{
            const t = await navigator.clipboard.readText();
            const ta = $("ta-transcript-json");
            if (ta) ta.value = t || "";
            window.NG_loadTranscriptJSON();
          }catch(err){
            console.warn("[NG_INBOX] clipboard blocked", err);
            alert("Clipboard permission नहीं मिली. Manually paste करके Load दबाइए.");
          }
        });
      }

      if (btnImp && !btnImp.__ng){
        btnImp.__ng = 1;
        btnImp.addEventListener("click", (e)=>{
          e.preventDefault();
          const file = $("file-transcript-json");
          if (file) file.click();
        });
      }

      const file = $("file-transcript-json");
      if (file && !file.__ng){
        file.__ng = 1;
        file.addEventListener("change", async ()=>{
          try{
            const f = file.files && file.files[0];
            if (!f) return;
            const txt = await f.text();
            const ta = $("ta-transcript-json");
            if (ta) ta.value = txt || "";
            window.NG_loadTranscriptJSON();
          }catch(e){
            console.error("[NG_INBOX] file import error", e);
          }
        });
      }

      if (btnClr && !btnClr.__ng){
        btnClr.__ng = 1;
        btnClr.addEventListener("click", (e)=>{
          e.preventDefault();
          try{ localStorage.removeItem(LS_KEY); }catch(_){}
          const ta = $("ta-transcript-json"); if (ta) ta.value = "";
          alert("Saved transcript cleared.");
        });
      }

      if (btnSelA && !btnSelA.__ng){ btnSelA.__ng=1; btnSelA.addEventListener("click", ()=>selectAll(true)); }
      if (btnSelC && !btnSelC.__ng){ btnSelC.__ng=1; btnSelC.addEventListener("click", ()=>selectAll(false)); }
      if (btnMake && !btnMake.__ng){ btnMake.__ng=1; btnMake.addEventListener("click", ()=>makeDraftFromSelection()); }

      // auto-restore saved
      try{
        const saved = localStorage.getItem(LS_KEY);
        const ta = $("ta-transcript-json");
        if (ta && saved && !ta.value.trim()) ta.value = saved;
      }catch(_){}

      console.log("[NG_INBOX] init ok", {
        initTranscriptInbox: typeof window.initTranscriptInbox,
        NG_setTranscriptLines: typeof window.NG_setTranscriptLines,
        NG_loadTranscriptJSON: typeof window.NG_loadTranscriptJSON
      });
    };

    // boot
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => window.initTranscriptInbox(), { once:true });
    } else {
      window.initTranscriptInbox();
    }

  } catch (e) {
    console.error("[NG_INBOX] WIRE_V2 failed", e);
  }
})();















