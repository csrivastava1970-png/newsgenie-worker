
/* ============================
   LIB OVERRIDE V6 (SavedISO-first)
   - Finds draft by Saved ISO (most reliable)
   - Downloads FULL DIGIPACK from NG_DRAFTS[].story.digipack.raw
   - Force-enables Download controls on Library open
   - Stops other handlers (V4/V5) from interfering
   ============================ */
(function(){
  if (window.__NG_LIB_OVERRIDE_V6) return;
  window.__NG_LIB_OVERRIDE_V6 = true;

  var LS_KEY_DRAFTS = "NG_DRAFTS";

  function safeStr(x){ return (x==null) ? "" : String(x); }
  function safeParse(txt){ try { return JSON.parse(txt); } catch(e){ return null; } }
  function norm(s){ return safeStr(s).replace(/\s+/g," ").trim().toLowerCase(); }

  function getDrafts(){
    var arr = safeParse(localStorage.getItem(LS_KEY_DRAFTS) || "[]");
    return (arr && typeof arr.length==="number") ? arr : [];
  }

  function getSavedISO(d){
    return safeStr((d && (d.saved || d.ts || (d.story && d.story.saved))) || "");
  }
  function getSavedTs(d){
    var t = Date.parse(getSavedISO(d));
    return isNaN(t) ? 0 : t;
  }
  function getHeadlineFromDraft(d){
    return safeStr((d && (d.headline || (d.story && (d.story.headline || d.story.topic)))) || "");
  }
  function getDigipack(d){
    return (d && d.story && d.story.digipack) ? d.story.digipack : null;
  }
  function getRaw(d){
    var dp = getDigipack(d);
    return dp && dp.raw ? safeStr(dp.raw) : "";
  }

  function inferSavedISOFromText(txt){
    var m = safeStr(txt).match(/Saved:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.]+Z)/i);
    return m ? m[1] : "";
  }

  function inferHeadlineFromText(txt){
    var lines = safeStr(txt).split("\n").map(function(x){return x.trim();}).filter(Boolean);
    for (var i=0;i<lines.length;i++){
      var ln = lines[i];
      if (!ln) continue;
      if (/^saved:/i.test(ln)) continue;
      if (/^sot:/i.test(ln)) continue;
      if (/^what:/i.test(ln)) continue;
      if (ln.toLowerCase().indexOf("download") !== -1) continue;
      if (ln === "Draft Library") continue;
      if (ln.indexOf("❌") !== -1 || ln.indexOf("✅") !== -1) continue;
      return ln;
    }
    return "";
  }

  function findDraftBySavedISO(savedISO){
    savedISO = safeStr(savedISO).trim();
    if (!savedISO) return null;

    var drafts = getDrafts();

    // 1) exact string match
    for (var i=0;i<drafts.length;i++){
      if (getSavedISO(drafts[i]) === savedISO) return drafts[i];
    }

    // 2) closest timestamp (± 2s window)
    var target = Date.parse(savedISO);
    if (!isNaN(target)) {
      var best=null, bestDiff=1e18;
      for (var j=0;j<drafts.length;j++){
        var dt = getSavedTs(drafts[j]);
        if (!dt) continue;
        var diff = Math.abs(dt - target);
        if (diff < bestDiff) { bestDiff = diff; best = drafts[j]; }
      }
      if (best && bestDiff <= 2000) return best;
    }

    return null;
  }

  function findDraftFallback(headline){
    var h = norm(headline);
    if (!h) return null;
    var drafts = getDrafts();
    var best=null, bestTs=-1;
    for (var i=0;i<drafts.length;i++){
      var d = drafts[i];
      if (norm(getHeadlineFromDraft(d)) === h) {
        var ts = getSavedTs(d);
        if (ts >= bestTs) { bestTs = ts; best = d; }
      }
    }
    return best;
  }

  function downloadFile(filename, content, mime){
    try{
      var blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){
        try{ URL.revokeObjectURL(url); }catch(e){}
        try{ a.remove(); }catch(e2){}
      }, 200);
      return true;
    }catch(e3){
      console.warn("[LIB OVERRIDE V6] download failed", e3);
      return false;
    }
  }

  function buildTxt(d){
    var headline = getHeadlineFromDraft(d) || "Untitled";
    var saved = getSavedISO(d);
    var raw = getRaw(d);
    var out = [];
    out.push(headline);
    if (saved) out.push("Saved: " + saved);
    out.push("");
    out.push("FULL DIGIPACK");
    out.push("--------------------------------");
    out.push(raw ? raw : "(No generated pack saved yet. Generate outputs, then Save Draft.)");
    out.push("");
    return out.join("\n");
  }

  function buildJson(d){
    var raw = getRaw(d);
    var obj = safeParse(raw);
    if (!obj) obj = { ok:true, note:"raw not valid JSON", digipack:{ raw: raw, blocks: (getDigipack(d)||{}).blocks||{} }, draft: d };
    return JSON.stringify(obj, null, 2);
  }

  function forceEnable(el){
    if (!el) return;
    try{
      if (el.disabled === true) el.disabled = false;
      if (el.getAttribute && el.getAttribute("disabled") != null) el.removeAttribute("disabled");
      if (el.style) {
        el.style.pointerEvents = "auto";
        el.style.opacity = "1";
        el.style.filter = "none";
      }
    }catch(e){}
  }

  function nearestClickable(el){
    var p = el;
    for (var i=0;i<12 && p;i++){
      if (!p.tagName) { p = p.parentNode; continue; }
      var tag = p.tagName.toLowerCase();
      var role = (p.getAttribute && p.getAttribute("role")) ? p.getAttribute("role") : "";
      if (tag === "button" || tag === "a" || tag === "input" || role === "button") return p;
      if (p.getAttribute && p.getAttribute("onclick")) return p;
      p = p.parentNode;
    }
    return el;
  }

  function findCardFrom(el){
    var p = el;
    for (var i=0;i<22 && p;i++){
      var t = safeStr(p.innerText);
      if (t.indexOf("Saved:")!==-1 && t.toLowerCase().indexOf("download")!==-1) return p;
      if (t.indexOf("SOT:")!==-1 && t.indexOf("What:")!==-1 && t.toLowerCase().indexOf("download")!==-1) return p;
      p = p.parentNode;
    }
    return el.parentNode || el;
  }

  function setPackChip(card, ok){
    if (!card || !card.querySelectorAll) return;
    var nodes = card.querySelectorAll("div,span,p,small,button");
    for (var i=0;i<nodes.length;i++){
      var n = nodes[i];
      var t = safeStr(n.textContent);
      if (t.indexOf("Pack❌")!==-1 || t.indexOf("Pack✅")!==-1 || t.indexOf("Pack✓")!==-1) {
        n.textContent = t.replace(/Pack(❌|✅|✓)/g, ok ? "Pack✅" : "Pack❌");
      }
    }
  }

  function enableDownloadControls(){
    var root = document.body || document.documentElement;
    if (!root) return {txt:0,json:0,hits:0};
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node, txt=0, json=0, hits=0;
    while ((node = w.nextNode())) {
      var v = safeStr(node.nodeValue).replace(/\s+/g," ").trim().toLowerCase();
      if (!v) continue;
      var isTXT = (v.indexOf("download txt") !== -1);
      var isJSON = (v.indexOf("download json") !== -1);
      if (!isTXT && !isJSON) continue;
      hits++;
      var parent = node.parentElement || node.parentNode;
      var ctrl = nearestClickable(parent);
      forceEnable(ctrl);
      // sometimes wrapper disables
      var p = ctrl;
      for (var k=0;k<4 && p;k++){ forceEnable(p); p = p.parentNode; }
      if (isTXT) txt++;
      if (isJSON) json++;
      if (hits > 60) break;
    }
    console.log("[LIB OVERRIDE V6] enableDownloadControls", {txt:txt,json:json,hits:hits});
    return {txt:txt,json:json,hits:hits};
  }

  function detectKindFromClick(t){
    var el = t;
    for (var i=0;i<12 && el;i++){
      var tx = safeStr(el.textContent).replace(/\s+/g," ").trim().toLowerCase();
      if (tx.indexOf("download txt") !== -1) return "txt";
      if (tx.indexOf("download json") !== -1) return "json";
      el = el.parentNode;
    }
    return null;
  }

  // MAIN: capture click, handle ourselves, stop others
  document.addEventListener("click", function(e){
    var t = e && e.target;
    if (!t) return;

    var kind = detectKindFromClick(t);
    if (!kind) return;

    var clickEl = nearestClickable(t);
    forceEnable(clickEl);

    var card = findCardFrom(clickEl);
    var cardText = safeStr(card && card.innerText);

    var savedISO = inferSavedISOFromText(cardText);
    var headline = inferHeadlineFromText(cardText);

    var d = findDraftBySavedISO(savedISO) || findDraftFallback(headline);
    if (!d) {
      console.warn("[LIB OVERRIDE V6] draft not found", { headline: headline, savedISO: savedISO });
      return;
    }

    var raw = getRaw(d);
    setPackChip(card, raw.length > 0);

    var base = norm(getHeadlineFromDraft(d)).replace(/[^a-z0-9\- ]/g,"").replace(/\s+/g,"_").slice(0,60) || "digipack";
    var ok = false;

    if (kind === "txt") ok = downloadFile(base + ".txt", buildTxt(d), "text/plain;charset=utf-8");
    if (kind === "json") ok = downloadFile(base + ".json", buildJson(d), "application/json;charset=utf-8");

    if (ok) {
      try{ e.preventDefault(); }catch(e1){}
      try{ e.stopPropagation(); }catch(e2){}
      try{ e.stopImmediatePropagation(); }catch(e3){}
    }
  }, true);

  // Library open: enable buttons
    document.addEventListener("click", function(e){
    var t = e && e.target;
    if (!t) return;
    if (t.id !== "btn-open-library") return;




/* ============================
   LIB OVERRIDE V8 (Window-preempt + Snippets + Enable Downloads)
   - Window capture runs BEFORE document capture => bypasses V4/V5
   - Finds draft by Saved ISO (exact/closest)
   - Enables disabled download controls via MutationObserver
   - Enhances Library cards: hide What, show format snippets, flip chips, hide duplicates
   ============================ */
(function(){
  if (window.__NG_LIB_OVERRIDE_V8) return;
  window.__NG_LIB_OVERRIDE_V8 = true;

  var LS_KEY_DRAFTS = "NG_DRAFTS";

  function safeStr(x){ return (x==null) ? "" : String(x); }
  function safeParse(txt){ try { return JSON.parse(txt); } catch(e){ return null; } }
  function safeJson(obj){ try { return JSON.stringify(obj); } catch(e){ return "[]"; } }
  function norm(s){ return safeStr(s).replace(/\s+/g," ").trim().toLowerCase(); }

  function loadDrafts(){
    var arr = safeParse(localStorage.getItem(LS_KEY_DRAFTS) || "[]");
    return (arr && typeof arr.length==="number") ? arr : [];
  }

  function getSavedISO(d){
    return safeStr((d && (d.saved || d.ts || (d.story && d.story.saved))) || "");
  }
  function getSavedTs(d){
    var t = Date.parse(getSavedISO(d));
    return isNaN(t) ? 0 : t;
  }
  function getHeadline(d){
    return safeStr((d && (d.headline || (d.story && (d.story.headline || d.story.topic || d.story.title)))) || "");
  }
  function getDigipack(d){
    return (d && d.story && d.story.digipack) ? d.story.digipack : null;
  }
  function getRaw(d){
    var dp = getDigipack(d);
    return dp && dp.raw ? safeStr(dp.raw) : "";
  }
  function getBlocks(d){
    var dp = getDigipack(d);
    return (dp && dp.blocks && typeof dp.blocks==="object") ? dp.blocks : {};
  }

  function inferSavedISOFromText(txt){
    var m = safeStr(txt).match(/Saved:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.]+Z)/i);
    return m ? m[1] : "";
  }

  function findDraftBySavedISO(savedISO){
    savedISO = safeStr(savedISO).trim();
    if (!savedISO) return null;

    var drafts = loadDrafts();

    // 1) exact string match
    for (var i=0;i<drafts.length;i++){
      if (getSavedISO(drafts[i]) === savedISO) return drafts[i];
    }

    // 2) closest timestamp within 2s
    var target = Date.parse(savedISO);
    if (!isNaN(target)){
      var best=null, bestDiff=1e18;
      for (var j=0;j<drafts.length;j++){
        var dt = getSavedTs(drafts[j]);
        if (!dt) continue;
        var diff = Math.abs(dt - target);
        if (diff < bestDiff){ bestDiff = diff; best = drafts[j]; }
      }
      if (best && bestDiff <= 2000) return best;
    }
    return null;
  }

  function downloadFile(filename, content, mime){
    try{
      var blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){
        try{ URL.revokeObjectURL(url); }catch(e){}
        try{ a.remove(); }catch(e2){}
      }, 200);
      return true;
    }catch(e3){
      console.warn("[LIB OVERRIDE V8] download failed", e3);
      return false;
    }
  }

  function buildTxt(d){
    var headline = getHeadline(d) || "Untitled";
    var saved = getSavedISO(d);
    var raw = getRaw(d);

    var out = [];
    out.push(headline);
    if (saved) out.push("Saved: " + saved);
    out.push("");
    out.push("FULL DIGIPACK");
    out.push("--------------------------------");
    out.push(raw ? raw : "(No generated pack saved yet. Generate outputs, then Save Draft.)");
    out.push("");
    return out.join("\n");
  }

  function buildJson(d){
    var raw = getRaw(d);
    var obj = safeParse(raw);
    if (!obj) obj = { ok:true, note:"raw not valid JSON", digipack:{ raw: raw, blocks: getBlocks(d) }, draft: d };
    return JSON.stringify(obj, null, 2);
  }

  // ---------- UI helpers ----------
  function forceEnable(el){
    if (!el) return;
    try{
      if (el.disabled === true) el.disabled = false;
      if (el.getAttribute && el.getAttribute("disabled") != null) el.removeAttribute("disabled");
      if (el.style) {
        el.style.pointerEvents = "auto";
        el.style.opacity = "1";
        el.style.filter = "none";
      }
    }catch(e){}
  }

  function nearestClickable(el){
    var p = el;
    for (var i=0;i<12 && p;i++){
      if (!p.tagName) { p = p.parentNode; continue; }
      var tag = p.tagName.toLowerCase();
      var role = (p.getAttribute && p.getAttribute("role")) ? p.getAttribute("role") : "";
      if (tag==="button" || tag==="a" || tag==="input" || role==="button") return p;
      if (p.getAttribute && p.getAttribute("onclick")) return p;
      p = p.parentNode;
    }
    return el;
  }

  function findCardFrom(el){
    var p = el;
    for (var i=0;i<24 && p;i++){
      var t = safeStr(p.innerText);
      if (t.indexOf("Saved:")!==-1 && t.toLowerCase().indexOf("download")!==-1) return p;
      if (t.indexOf("SOT:")!==-1 && t.indexOf("What:")!==-1 && t.toLowerCase().indexOf("download")!==-1) return p;
      p = p.parentNode;
    }
    return el.parentNode || el;
  }

  function detectKindFromTarget(t){
    var el = t;
    for (var i=0;i<14 && el;i++){
      var tx = safeStr(el.textContent).replace(/\s+/g," ").trim().toLowerCase();
      if (tx.indexOf("download txt") !== -1) return "txt";
      if (tx.indexOf("download json") !== -1) return "json";
      el = el.parentNode;
    }
    return null;
  }

  // ---------- Snippet extraction ----------
  function asText(v){
    if (v==null) return "";
    if (typeof v==="string") return v;
    if (Array.isArray(v)) return v.map(function(x){return safeStr(x);}).join("\n");
    try { return JSON.stringify(v); } catch(e) { return safeStr(v); }
  }

  function pickFirst(blocks, keys){
    for (var i=0;i<keys.length;i++){
      var k = keys[i];
      if (blocks && (k in blocks)) {
        var t = asText(blocks[k]).trim();
        if (t) return t;
      }
    }
    return "";
  }

  function clip(s, n){
    s = safeStr(s).replace(/\s+/g," ").trim();
    if (!s) return "(empty)";
    return (s.length > n) ? (s.slice(0, n) + "…") : s;
  }

  function setPackChip(card, ok){
    if (!card || !card.querySelectorAll) return;
    var nodes = card.querySelectorAll("div,span,p,small,button");
    for (var i=0;i<nodes.length;i++){
      var n = nodes[i];
      var t = safeStr(n.textContent);
      if (t.indexOf("Pack❌")!==-1 || t.indexOf("Pack✅")!==-1 || t.indexOf("Pack✓")!==-1) {
        n.textContent = t.replace(/Pack(❌|✅|✓)/g, ok ? "Pack✅" : "Pack❌");
      }
    }
  }

  function hideWhatLines(card){
    if (!card || !card.querySelectorAll) return;
    var all = card.querySelectorAll("*");
    for (var i=0;i<all.length;i++){
      var n = all[i];
      if (n && n.childElementCount===0) {
        var tx = safeStr(n.textContent).trim();
        if (tx.indexOf("What:") === 0) n.style.display = "none";
      }
    }
  }

  function ensureSnips(card, d){
    if (!card) return;
    var old = card.querySelector ? card.querySelector(".ng-snips-v8") : null;
    if (old) { try{ old.remove(); }catch(e){} }

    var blocks = getBlocks(d);

    // best-effort mapping
    var web    = pickFirst(blocks, ["web","web_article","article","web_story"]);
    var video  = pickFirst(blocks, ["video","video_script","tv_script","vo","vo_lines","script"]);
    var shorts = pickFirst(blocks, ["shorts","shorts_script","yt_shorts","short_script"]);
    var reels  = pickFirst(blocks, ["reels","reels_script","instagram_reels","reel_script"]);
    var social = pickFirst(blocks, ["social","social_posts","social_script","posts","tweets","tweet"]);

    // if nothing, keep empty strings (chips still useful)
    var box = document.createElement("div");
    box.className = "ng-snips-v8";
    box.style.marginTop = "6px";
    box.style.padding = "8px";
    box.style.border = "1px solid rgba(0,0,0,0.12)";
    box.style.borderRadius = "8px";
    box.style.fontSize = "12px";
    box.style.lineHeight = "1.35";

    box.innerHTML =
      "<div><b>Web:</b> " + clip(web, 140) + "</div>" +
      "<div><b>Video:</b> " + clip(video, 140) + "</div>" +
      "<div><b>Shorts:</b> " + clip(shorts, 140) + "</div>" +
      "<div><b>Reels:</b> " + clip(reels, 140) + "</div>" +
      "<div><b>Social:</b> " + clip(social, 140) + "</div>";

    card.appendChild(box);
  }

  function enhanceLibraryCards(){
    // find cards by presence of "Saved:" + "Download"
    var els = document.querySelectorAll("div,section,article");
    var seen = {};
    var cards = 0, hidden = 0, enhanced = 0;

    for (var i=0;i<els.length;i++){
      var el = els[i];
      var txt = safeStr(el.innerText);
      if (!txt) continue;
      if (txt.indexOf("Saved:")===-1) continue;
      if (txt.toLowerCase().indexOf("download")===-1 && txt.indexOf("Load")===-1) continue;
      if (txt.length < 80 || txt.length > 2200) continue;

      cards++;

      var savedISO = inferSavedISOFromText(txt);
      if (savedISO) {
        if (seen[savedISO]) { el.style.display = "none"; hidden++; continue; }
        seen[savedISO] = true;
      }

      var d = findDraftBySavedISO(savedISO);
      if (!d) continue;

      // enable buttons inside
      try{
        var clickables = el.querySelectorAll("button,a,[role='button'],input");
        for (var j=0;j<clickables.length;j++) forceEnable(clickables[j]);
      }catch(e2){}

      var raw = getRaw(d);
      setPackChip(el, raw.length > 0);
      hideWhatLines(el);
      ensureSnips(el, d);
      enhanced++;
    }

    console.log("[LIB OVERRIDE V8] enhanceLibraryCards", {cards:cards, hidden:hidden, enhanced:enhanced});
    return {cards:cards, hidden:hidden, enhanced:enhanced};
  }

  // ---------- Enable Downloads by observing DOM ----------
  var obs = null;
  function startObserver(){
    if (obs) return;
    obs = new MutationObserver(function(){
      // keep enabling whenever library renders/updates
      enhanceLibraryCards();
      enableDownloadControls();
    });
    try{
      obs.observe(document.body, { childList:true, subtree:true });
    }catch(e){}
  }

  function enableDownloadControls(){
    var root = document.body || document.documentElement;
    if (!root) return {hits:0};

    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node, hits=0;

    while ((node = w.nextNode())) {
      var v = safeStr(node.nodeValue).replace(/\s+/g," ").trim().toLowerCase();
      if (!v) continue;
      if (v.indexOf("download txt")===-1 && v.indexOf("download json")===-1) continue;

      hits++;
      var parent = node.parentElement || node.parentNode;
      var ctrl = nearestClickable(parent);
      forceEnable(ctrl);

      // also enable a couple ancestors
      var p = ctrl;
      for (var k=0;k<4 && p;k++){ forceEnable(p); p = p.parentNode; }

      if (hits > 80) break;
    }

    return {hits:hits};
  }

  // Library open hook
  document.addEventListener("click", function(e){
    var t = e && e.target;
    if (!t) return;
    if (t.id !== "btn-open-library") return;
    startObserver();
    setTimeout(function(){ enableDownloadControls(); enhanceLibraryCards(); }, 600);
    setTimeout(function(){ enableDownloadControls(); enhanceLibraryCards(); }, 1200);
  }, true);

  // ✅ MAIN: Window-level capture download (bypass V4/V5)
  window.addEventListener("click", function(e){
    var t = e && e.target;
    if (!t) return;

    var kind = detectKindFromTarget(t);
    if (!kind) return;

    var clickEl = nearestClickable(t);
    forceEnable(clickEl);

    var card = findCardFrom(clickEl);
    var cardText = safeStr(card && card.innerText);

    var savedISO = inferSavedISOFromText(cardText);
    var d = findDraftBySavedISO(savedISO);

    if (!d) {
      console.warn("[LIB OVERRIDE V8] draft not found by savedISO", { savedISO: savedISO });
      // still stop others (so V4/V5 don't spam)
      try{ e.preventDefault(); }catch(e1){}
      try{ e.stopPropagation(); }catch(e2){}
      try{ e.stopImmediatePropagation(); }catch(e3){}
      return;
    }

    var base = norm(getHeadline(d)).replace(/[^a-z0-9\- ]/g,"").replace(/\s+/g,"_").slice(0,60) || "digipack";
    var ok = false;

    if (kind === "txt") ok = downloadFile(base + ".txt", buildTxt(d), "text/plain;charset=utf-8");
    if (kind === "json") ok = downloadFile(base + ".json", buildJson(d), "application/json;charset=utf-8");

    if (ok) {
      // update card UI
      setPackChip(card, getRaw(d).length > 0);
      hideWhatLines(card);
      ensureSnips(card, d);
    }

    // Always stop other download handlers (V4/V5)
    try{ e.preventDefault(); }catch(e4){}
    try{ e.stopPropagation(); }catch(e5){}
    try{ e.stopImmediatePropagation(); }catch(e6){}
  }, true);

  // Manual helpers
  window.NG_enhanceLibraryV8 = enhanceLibraryCards;
  window.NG_enableDownloadsV8 = enableDownloadControls;

  console.log("[LIB OVERRIDE V8] loaded ✓");
})();
