param(
  [string]$Path = ".\public\index.html"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function WriteUtf8NoBom([string]$p, [string]$text) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($p, $text, $utf8NoBom)
}

$fullPath = (Resolve-Path $Path).Path
$html = [System.IO.File]::ReadAllText($fullPath)

# ✅ Backup FIRST
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = Join-Path (Split-Path $fullPath -Parent) ("index_backup_before_story_view_v4_{0}.html" -f $ts)
[System.IO.File]::Copy($fullPath, $backup, $true)

$start = "<!-- NG_PATCH: STORY_VIEW_V4 -->"
$end   = "<!-- /NG_PATCH: STORY_VIEW_V4 -->"

$block = @"
$start
<style>
  #ng-sv4-modal{display:none; position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,.55);}
  #ng-sv4-card{
    background:#fff; width:min(1180px,96vw); height:min(92vh,96vh);
    margin:3vh auto; border-radius:14px; overflow:hidden;
    box-shadow:0 18px 60px rgba(0,0,0,.25);
    display:flex; flex-direction:column;
    font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial;
  }
  #ng-sv4-top{
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 12px; border-bottom:1px solid #eee; background:#fafafa; gap:10px;
  }
  #ng-sv4-top strong{font-size:14px;}
  #ng-sv4-top .btn{
    padding:7px 10px; border:1px solid #ddd; border-radius:10px; background:#fff;
    font:600 12px/1 system-ui; cursor:pointer;
  }
  #ng-sv4-top .pill{
    padding:6px 10px; border:1px solid #ddd; border-radius:999px; background:#fff;
    font:600 11px/1 system-ui; color:#333;
    max-width:56vw; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  #ng-sv4-body{padding:12px; overflow:auto;}
  .ng-sv4-seg{border:1px solid #eee; border-radius:12px; margin:10px 0; overflow:hidden;}
  .ng-sv4-seg h3{margin:0; padding:10px 12px; font-size:13px; background:#f6f6f6; border-bottom:1px solid #eee;}
  .ng-sv4-grid{display:grid; grid-template-columns:1fr; gap:10px; padding:10px 12px;}
  .ng-sv4-box{border:1px solid #eee; border-radius:12px; padding:10px; background:#fff;}
  .ng-sv4-box h4{
    margin:0 0 8px 0; font-size:12px; text-transform:uppercase; color:#444;
    display:flex; justify-content:space-between; align-items:center; gap:10px;
  }
  .ng-sv4-copy{padding:6px 8px; border:1px solid #ddd; border-radius:10px; background:#fff; cursor:pointer; font:600 11px/1 system-ui;}
  .ng-sv4-pre{white-space:pre-wrap; margin:0; font-family:ui-monospace, Menlo, Consolas, monospace; font-size:12px; line-height:1.35;}
  .ng-sv4-ul{margin:0; padding-left:18px;}
  .ng-sv4-ul li{margin:2px 0;}
  .ng-sv4-muted{color:#666; font-size:12px;}
</style>

<div id="ng-sv4-modal">
  <div id="ng-sv4-card">
    <div id="ng-sv4-top">
      <div>
        <strong>Story View</strong>
        <div class="ng-sv4-muted" id="ng-sv4-status">Source: Drafts (idx)</div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <span class="pill" id="ng-sv4-source">Source: auto</span>
        <button class="btn" id="ng-sv4-refresh" type="button">Refresh</button>
        <button class="btn" id="ng-sv4-close" type="button">Close</button>
      </div>
    </div>
    <div id="ng-sv4-body"></div>
  </div>
</div>

<script>
(function(){
  if (window.__NG_STORY_VIEW_V4) return;
  window.__NG_STORY_VIEW_V4 = true;

  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel) || []); }
  function safe(s){ return (s==null) ? "" : String(s); }
  function norm(t){ return safe(t).replace(/\\r\\n/g,"\\n").replace(/\\r/g,"\\n").trim(); }

  // ---------- Preview Prompt box: hide/collapse ----------
  function hidePreviewPrompt(){
    try{
      var all = qsa("label,div,h3,h4,strong,span");
      for (var i=0;i<all.length;i++){
        var el = all[i];
        var tx = (el && el.textContent) ? el.textContent : "";
        if (!tx) continue;
        if (tx.indexOf("Preview Prompt") !== -1){
          // hide nearest block
          var p = el;
          for (var k=0;k<6;k++){
            if (!p || !p.parentElement) break;
            p = p.parentElement;
            // heuristic: a section-ish container
            if (p && p.tagName === "DIV" && (p.innerText||"").indexOf("Preview Prompt") !== -1){
              p.style.display = "none";
              return;
            }
          }
        }
      }
    }catch(e){}
  }
  hidePreviewPrompt();

  // ---------- Copy helper ----------
  function copyText(txt){
    txt = safe(txt);
    try{
      if (navigator && navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).catch(function(){});
        return true;
      }
    }catch(e){}
    try{
      var ta=document.createElement("textarea");
      ta.value=txt; ta.style.position="fixed"; ta.style.left="-9999px";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta); return true;
    }catch(e){}
    return false;
  }

  // ---------- Extract idx from top-bar text (Drafts:3 | idx:2 | rawLen:4799) ----------
  function getIdx(){
    try{
      var t = safe(document.body && document.body.textContent ? document.body.textContent : "");
      var m = t.match(/\\bidx\\s*:\\s*(\\d+)\\b/i);
      if (m && m[1]) return parseInt(m[1],10);
    }catch(e){}
    return null;
  }

  // ---------- Build pack text from JSON object ----------
  function buildFromObj(o){
    if (!o || typeof o !== "object") return "";
    var h = safe(o.headline || o.HEADLINE || "");
    var d = safe(o.dek || o.DEK || "");
    var kp = o.key_points || o.keypoints || o.points || o.KEY_POINTS || [];
    var wa = safe(o.web_article || o.web || o.article || o.WEB_ARTICLE || "");
    var vd = safe(o.video || o.VIDEO || "");
    var hk = safe(o.hook || o.HOOK || "");

    if (!h && !d && !wa && !vd && !hk && !kp) return "";

    var out = [];
    if (h) out.push("HEADLINE: " + h);
    if (d) out.push("DEK: " + d);

    if (kp && (Array.isArray(kp) ? kp.length : safe(kp).trim())){
      out.push("");
      out.push("KEY POINTS");
      out.push("--------------------------------");
      if (Array.isArray(kp)){
        for (var i=0;i<kp.length;i++) out.push("- " + safe(kp[i]));
      } else {
        // if it's already a block string, keep it
        var lines = norm(kp).split("\\n");
        for (var j=0;j<lines.length;j++){
          var line = lines[j].trim();
          if (!line) continue;
          out.push(line.indexOf("-")===0 ? line : ("- " + line));
        }
      }
    }

    if (wa){
      out.push("");
      out.push("WEB ARTICLE");
      out.push("--------------------------------");
      out.push(wa);
    }

    if (vd || hk){
      out.push("");
      out.push("VIDEO");
      out.push("--------------------------------");
      if (vd) out.push(vd);
      if (hk) out.push("HOOK: " + hk);
    }

    return out.join("\\n").trim();
  }

  // ---------- Pick current draft by idx from localStorage ----------
  function pickDraftByIdx(){
    var idx = getIdx();
    if (idx == null || isNaN(idx)) idx = 0;

    var best = null;

    function tryKey(k){
      var v = "";
      try{ v = localStorage.getItem(k) || ""; }catch(e){ v=""; }
      if (!v) return null;

      v = safe(v).trim();
      if (!v || (v[0] !== "[" && v[0] !== "{")) return null;

      try{
        var obj = JSON.parse(v);

        // if array of drafts
        if (Array.isArray(obj) && obj.length){
          var item = obj[Math.max(0, Math.min(idx, obj.length-1))];
          // draft may store raw text directly
          if (item && typeof item === "object"){
            var txt = safe(item.raw || item.text || item.pack || "");
            if (txt && txt.length > 200) return { text: txt, source: "localStorage:"+k+"[idx:"+idx+"]" };
            var built = buildFromObj(item);
            if (built && built.length > 200) return { text: built, source: "localStorage:"+k+"[idx:"+idx+"]" };
          }
        }

        // if single object draft
        if (obj && typeof obj === "object"){
          var t2 = safe(obj.raw || obj.text || obj.pack || "");
          if (t2 && t2.length > 200) return { text: t2, source: "localStorage:"+k };
          var b2 = buildFromObj(obj);
          if (b2 && b2.length > 200) return { text: b2, source: "localStorage:"+k };
        }
      }catch(e){}
      return null;
    }

    // high-prob keys first
    var keys = ["NG_DRAFTS","ng_drafts","drafts","NG_LIBRARY","ng_library","NG_PACKS","ng_packs"];
    for (var i=0;i<keys.length;i++){
      best = tryKey(keys[i]);
      if (best) return best;
    }

    // then scan any key containing draft/lib
    try{
      for (var j=0;j<localStorage.length;j++){
        var kk = localStorage.key(j);
        if (!kk) continue;
        if (!/draft|lib|pack/i.test(kk)) continue;
        best = tryKey(kk);
        if (best) return best;
      }
    }catch(e){}

    return null;
  }

  // ---------- Fallback: DOM best text ----------
  function pickFromDOM(){
    var nodes = qsa("textarea").concat(qsa("pre")).concat(qsa("code"));
    var best = {score:-1, text:"", source:"none"};
    function score(t){
      t = safe(t);
      var s=0;
      if (t.indexOf("HEADLINE:")!==-1) s+=6;
      if (t.indexOf("KEY POINTS")!==-1) s+=5;
      if (t.indexOf("WEB ARTICLE")!==-1) s+=5;
      if (t.indexOf("VIDEO")!==-1) s+=3;
      s += Math.min(6, Math.floor(t.length/1500));
      return s;
    }
    for (var i=0;i<nodes.length;i++){
      var n = nodes[i];
      var t = (n && n.tagName==="TEXTAREA") ? safe(n.value) : safe(n ? n.textContent : "");
      if (t.indexOf("No generated pack found")!==-1) continue;
      var sc = score(t);
      if (sc > best.score){
        best = {score: sc, text: t, source: "DOM:"+(n?n.tagName:"?")+(n&&n.id?("#"+n.id):"")};
      }
    }
    if (best.score > 0 && best.text.length > 200) return best;
    return null;
  }

  function parseBlocks(txt){
    txt = norm(txt);
    function after(prefix){
      var i = txt.indexOf(prefix);
      if (i===-1) return "";
      return (txt.slice(i+prefix.length).split("\\n")[0]||"").trim();
    }
    function between(start, nextArr){
      var i = txt.indexOf(start);
      if (i===-1) return "";
      var rest = txt.slice(i+start.length);
      var cut = rest.length;
      for (var k=0;k<nextArr.length;k++){
        var j = rest.indexOf(nextArr[k]);
        if (j!==-1 && j<cut) cut=j;
      }
      return rest.slice(0,cut).trim();
    }
    function keypoints(block){
      var lines = norm(block).split("\\n");
      var out=[];
      for (var i=0;i<lines.length;i++){
        var l = lines[i].trim();
        if (!l) continue;
        out.push(l.indexOf("-")===0 ? l.replace(/^\\-\\s*/,"").trim() : l);
      }
      return out;
    }
    var kpB = between("KEY POINTS",["WEB ARTICLE","VIDEO","SOCIAL","BYTES","FULL DIGIPACK"]);
    var wa  = between("WEB ARTICLE",["VIDEO","SOCIAL","BYTES","FULL DIGIPACK"]);
    var vd  = between("VIDEO",["SOCIAL","BYTES","FULL DIGIPACK"]);
    return {
      headline: after("HEADLINE:"),
      dek: after("DEK:"),
      keypoints: kpB ? keypoints(kpB) : [],
      web: wa,
      video: vd,
      hook: after("HOOK:")
    };
  }

  function box(title, content, asList){
    var wrap=document.createElement("div"); wrap.className="ng-sv4-box";
    var h=document.createElement("h4");
    var l=document.createElement("span"); l.textContent=title;
    var b=document.createElement("button"); b.className="ng-sv4-copy"; b.type="button"; b.textContent="Copy";
    b.addEventListener("click", function(){
      var txt = asList ? (content||[]).join("\\n") : safe(content);
      copyText(txt);
      b.textContent="Copied";
      setTimeout(function(){ b.textContent="Copy"; }, 600);
    }, false);
    h.appendChild(l); h.appendChild(b); wrap.appendChild(h);

    if (asList){
      var ul=document.createElement("ul"); ul.className="ng-sv4-ul";
      for (var i=0;i<(content||[]).length;i++){
        var li=document.createElement("li"); li.textContent=content[i]; ul.appendChild(li);
      }
      wrap.appendChild(ul);
    } else {
      var pre=document.createElement("pre"); pre.className="ng-sv4-pre"; pre.textContent=safe(content||"");
      wrap.appendChild(pre);
    }
    return wrap;
  }

  function render(txt, src){
    var body = qs("#ng-sv4-body");
    if (!body) return;
    body.innerHTML = "";

    txt = norm(txt);
    if (!txt || txt.length < 200){
      var d=document.createElement("div");
      d.className="ng-sv4-muted";
      d.textContent="Pack नहीं मिला. Tip: पहले कोई draft select करें (idx दिख रहा है), फिर SEGMENTS दबाएँ।";
      body.appendChild(d);
      return;
    }

    var p = parseBlocks(txt);

    var card=document.createElement("div"); card.className="ng-sv4-seg";
    var h3=document.createElement("h3"); h3.textContent="STORY"; card.appendChild(h3);

    var grid=document.createElement("div"); grid.className="ng-sv4-grid";
    grid.appendChild(box("Headline", p.headline, false));
    grid.appendChild(box("Dek", p.dek, false));
    grid.appendChild(box("Key Points", p.keypoints, true));
    grid.appendChild(box("Web Article", p.web, false));
    grid.appendChild(box("Video", p.video, false));
    if (p.hook) grid.appendChild(box("Hook", p.hook, false));
    grid.appendChild(box("Raw Output", txt, false));

    card.appendChild(grid);
    body.appendChild(card);

    var pill = qs("#ng-sv4-source");
    if (pill) pill.textContent = "Source: " + (src || "auto") + " | idx:" + (getIdx()==null ? "-" : getIdx());
    var st = qs("#ng-sv4-status");
    if (st) st.textContent = "Updated @ " + new Date().toLocaleTimeString();
  }

  function openModal(){ var m=qs("#ng-sv4-modal"); if(m) m.style.display="block"; }
  function closeModal(){ var m=qs("#ng-sv4-modal"); if(m) m.style.display="none"; }

  function refresh(){
    var picked = pickDraftByIdx() || pickFromDOM();
    var txt = picked ? picked.text : "";
    var src = picked ? picked.source : "none";
    render(txt, src);
  }

  // Buttons
  var closeBtn = qs("#ng-sv4-close");
  var refBtn   = qs("#ng-sv4-refresh");
  if (closeBtn) closeBtn.addEventListener("click", closeModal, false);
  if (refBtn)   refBtn.addEventListener("click", refresh, false);

  // Close on backdrop click
  var modal = qs("#ng-sv4-modal");
  if (modal){
    modal.addEventListener("click", function(e){
      if (e && e.target === modal) closeModal();
    }, false);
  }

  // ✅ IMPORTANT: Use existing SEGMENTS button as trigger (override)
  document.addEventListener("click", function(e){
    var t = e && e.target ? e.target : null;
    if (!t) return;

    // find nearest clickable with "SEGMENTS"
    var el = t;
    for (var i=0;i<5;i++){
      if (!el) break;
      var tx = safe(el.textContent || el.value || "").trim();
      if (tx === "SEGMENTS"){
        // override other handlers
        try{ e.preventDefault(); }catch(_){}
        try{ e.stopPropagation(); }catch(_){}
        try{ e.stopImmediatePropagation(); }catch(_){}
        openModal();
        refresh();
        return;
      }
      el = el.parentElement;
    }
  }, true);

  console.log("[STORY_VIEW_V4] ready (SEGMENTS overrides to Story View)");
})();
</script>
$end
"@

# Remove old STORY_VIEW blocks (V1..V4) if any, then insert V4 before </body>
$rxAny = '(?is)<!--\s*NG_PATCH:\s*STORY_VIEW_V[1234]\s*-->(.*?)<!--\s*/NG_PATCH:\s*STORY_VIEW_V[1234]\s*-->'
$html2 = [regex]::Replace($html, $rxAny, "", [System.Text.RegularExpressions.RegexOptions]::Singleline)

if ($html2 -match '(?is)</body\s*>') {
  $out = [regex]::Replace($html2, '(?is)</body\s*>', "$block`r`n</body>", 1)
} else {
  $out = $html2 + "`r`n" + $block + "`r`n"
}

WriteUtf8NoBom $fullPath $out

Write-Host "✅ STORY_VIEW_V4 installed" -ForegroundColor Green
Write-Host "Backup: $backup" -ForegroundColor Cyan
