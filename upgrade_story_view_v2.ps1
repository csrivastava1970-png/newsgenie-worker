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

# Backup FIRST
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = Join-Path (Split-Path $fullPath -Parent) ("index_backup_before_story_view_v2_{0}.html" -f $ts)
[System.IO.File]::Copy($fullPath, $backup, $true)

$start = "<!-- NG_PATCH: STORY_VIEW_V2 -->"
$end   = "<!-- /NG_PATCH: STORY_VIEW_V2 -->"

$block = @"
$start
<style>
  #ng-btn-storyview{position:fixed; right:16px; bottom:16px; z-index:99998; padding:10px 12px; border:1px solid #ddd; border-radius:10px; background:#111; color:#fff; font:600 13px/1 system-ui; cursor:pointer;}
  #ng-storyview-modal{display:none; position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,.55);}
  #ng-storyview-card{background:#fff; width:min(1100px,96vw); height:min(92vh,96vh); margin:3vh auto; border-radius:14px; overflow:hidden; box-shadow:0 18px 60px rgba(0,0,0,.25); display:flex; flex-direction:column; font-family:system-ui;}
  #ng-storyview-top{display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #eee; background:#fafafa; gap:10px;}
  #ng-storyview-top strong{font-size:14px;}
  #ng-storyview-top .btn{padding:7px 10px; border:1px solid #ddd; border-radius:10px; background:#fff; font:600 12px/1 system-ui; cursor:pointer;}
  #ng-storyview-top .pill{padding:6px 10px; border:1px solid #ddd; border-radius:999px; background:#fff; font:600 11px/1 system-ui; color:#333;}
  #ng-storyview-body{padding:12px; overflow:auto;}
  .ng-sv-seg{border:1px solid #eee; border-radius:12px; margin:10px 0; overflow:hidden;}
  .ng-sv-seg h3{margin:0; padding:10px 12px; font-size:13px; background:#f6f6f6; border-bottom:1px solid #eee;}
  .ng-sv-grid{display:grid; grid-template-columns:1fr; gap:10px; padding:10px 12px;}
  .ng-sv-box{border:1px solid #eee; border-radius:12px; padding:10px 10px; background:#fff;}
  .ng-sv-box h4{margin:0 0 8px 0; font-size:12px; text-transform:uppercase; color:#444; display:flex; justify-content:space-between; align-items:center; gap:10px;}
  .ng-sv-copy{padding:6px 8px; border:1px solid #ddd; border-radius:10px; background:#fff; cursor:pointer; font:600 11px/1 system-ui;}
  .ng-sv-pre{white-space:pre-wrap; margin:0; font-family:ui-monospace, Menlo, Consolas, monospace; font-size:12px; line-height:1.35;}
  .ng-sv-ul{margin:0; padding-left:18px;}
  .ng-sv-ul li{margin:2px 0;}
  .ng-sv-muted{color:#666; font-size:12px;}
</style>

<button id="ng-btn-storyview" type="button">Story View</button>

<div id="ng-storyview-modal">
  <div id="ng-storyview-card">
    <div id="ng-storyview-top">
      <div>
        <strong>Story View</strong>
        <div class="ng-sv-muted" id="ng-sv-status">AUTO: localStorage → DOM</div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <span class="pill" id="ng-sv-source">Source: auto</span>
        <button class="btn" id="ng-storyview-refresh" type="button">Refresh</button>
        <button class="btn" id="ng-storyview-close" type="button">Close</button>
      </div>
    </div>
    <div id="ng-storyview-body"></div>
  </div>
</div>

<script>
(function(){
  if (window.__NG_STORY_VIEW_V2) return;
  window.__NG_STORY_VIEW_V2 = true;

  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel) || []); }
  function safeText(s){ return (s==null) ? "" : String(s); }
  function norm(txt){ return safeText(txt).replace(/\\r\\n/g,"\\n").replace(/\\r/g,"\\n").trim(); }

  function copyText(txt){
    txt = safeText(txt);
    try{ if (navigator?.clipboard?.writeText){ navigator.clipboard.writeText(txt).catch(function(){}); return true; } }catch(e){}
    try{ var ta=document.createElement("textarea"); ta.value=txt; ta.style.position="fixed"; ta.style.left="-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); return true; }catch(e){}
    return false;
  }

  function rejectPlaceholder(t){
    t = safeText(t);
    if (!t) return true;
    var bad = ["No generated pack found","Generate then Save Draft","No generated pack saved","No generated pack saved yet"];
    for (var i=0;i<bad.length;i++) if (t.indexOf(bad[i]) !== -1) return true;
    if (t.length < 120) return true;
    return false;
  }

  function score(t){
    t = safeText(t);
    if (!t || rejectPlaceholder(t)) return -500;
    var s=0;
    if (t.indexOf("DIGIPACK (SEGMENTS)") !== -1) s+=14;
    if (t.indexOf("DIGIPACK") !== -1) s+=12;
    if (t.indexOf("HEADLINE:") !== -1) s+=10;
    if (t.indexOf("KEY POINTS") !== -1) s+=8;
    if (t.indexOf("WEB ARTICLE") !== -1) s+=8;
    if (t.indexOf("VIDEO") !== -1) s+=6;
    s += Math.min(10, Math.floor(t.length/1500));
    return s;
  }

  function tryExtractFromJSON(v){
    v = safeText(v).trim();
    if (!v || (v[0] !== "{" && v[0] !== "[")) return "";
    try{
      var obj = JSON.parse(v);
      var keys = ["pack","text","full_text","full","output","generated","content","display_text","story_text"];
      for (var i=0;i<keys.length;i++){
        var k=keys[i];
        if (obj && typeof obj[k] === "string" && obj[k].indexOf("DIGIPACK") !== -1) return obj[k];
      }
    }catch(e){}
    return "";
  }

  function bestFromLocalStorage(){
    var best=null;
    try{
      for (var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        var v = localStorage.getItem(k);
        if (!v) continue;
        var t = tryExtractFromJSON(v) || v;
        var sc = score(t);
        if (!best || sc > best.score) best = {score: sc, text: t, source: "localStorage:" + k};
      }
    }catch(e){}
    if (!best || best.score < 6) return null;
    return best;
  }

  function bestFromDOM(){
    var nodes = [];
    var selectors = ["#full-digipack","#pack-output","#final-output","#output","#result","#out","textarea","pre","code"];
    for (var i=0;i<selectors.length;i++) nodes = nodes.concat(qsa(selectors[i]));
    var best=null;
    for (var j=0;j<nodes.length;j++){
      var n = nodes[j];
      var t = (n.tagName === "TEXTAREA") ? safeText(n.value) : safeText(n.textContent);
      var sc = score(t);
      if (!best || sc > best.score) best = {score: sc, text: t, source: "DOM:" + n.tagName + (n.id?("#"+n.id):"")};
    }
    if (!best || best.score < 6) return null;
    return best;
  }

  function getAuto(){ return bestFromLocalStorage() || bestFromDOM() || {score:-1, text:"", source:"none"}; }

  function extractLineAfter(txt, prefix){
    var i = txt.indexOf(prefix);
    if (i === -1) return "";
    return (txt.slice(i+prefix.length).split("\\n")[0] || "").trim();
  }
  function sliceBetween(txt, startLabel, nextLabels){
    var i = txt.indexOf(startLabel);
    if (i === -1) return "";
    var rest = txt.slice(i + startLabel.length);
    var cut = rest.length;
    for (var k=0;k<nextLabels.length;k++){
      var j = rest.indexOf(nextLabels[k]);
      if (j !== -1 && j < cut) cut = j;
    }
    return rest.slice(0, cut).trim();
  }
  function parseKeyPoints(block){
    var lines = norm(block).split("\\n"), out=[];
    for (var i=0;i<lines.length;i++){
      var l=lines[i].trim(); if(!l) continue;
      out.push(l.indexOf("-")===0 ? l.replace(/^\\-\\s*/,"").trim() : l);
    }
    return out;
  }
  function parseOne(txt){
    var t = norm(txt);
    var kp = sliceBetween(t, "KEY POINTS", ["WEB ARTICLE","VIDEO","FULL DIGIPACK","SOCIAL","BYTES"]);
    return {
      headline: extractLineAfter(t,"HEADLINE:"),
      dek: extractLineAfter(t,"DEK:"),
      keypoints: kp ? parseKeyPoints(kp) : [],
      web: sliceBetween(t,"WEB ARTICLE",["VIDEO","FULL DIGIPACK","SOCIAL","BYTES"]),
      video: sliceBetween(t,"VIDEO",["FULL DIGIPACK","SOCIAL","BYTES"]),
      hook: extractLineAfter(t,"HOOK:")
    };
  }

  function box(title, content, asList){
    var wrap=document.createElement("div"); wrap.className="ng-sv-box";
    var h=document.createElement("h4");
    var l=document.createElement("span"); l.textContent=title;
    var b=document.createElement("button"); b.className="ng-sv-copy"; b.type="button"; b.textContent="Copy";
    b.addEventListener("click", function(){ copyText(asList ? (content||[]).join("\\n") : safeText(content)); b.textContent="Copied"; setTimeout(function(){b.textContent="Copy";},600); }, false);
    h.appendChild(l); h.appendChild(b); wrap.appendChild(h);
    if(asList){
      var ul=document.createElement("ul"); ul.className="ng-sv-ul";
      for(var i=0;i<(content||[]).length;i++){ var li=document.createElement("li"); li.textContent=content[i]; ul.appendChild(li); }
      wrap.appendChild(ul);
    }else{
      var pre=document.createElement("pre"); pre.className="ng-sv-pre"; pre.textContent=safeText(content||""); wrap.appendChild(pre);
    }
    return wrap;
  }

  function render(txt){
    var body=qs("#ng-storyview-body"); if(!body) return;
    body.innerHTML="";
    txt = norm(txt);
    if(!txt){ var d=document.createElement("div"); d.className="ng-sv-muted"; d.textContent="No real generated pack detected. Generate → Save Draft, then Refresh."; body.appendChild(d); return; }
    var p=parseOne(txt);
    var card=document.createElement("div"); card.className="ng-sv-seg";
    var h3=document.createElement("h3"); h3.textContent="STORY"; card.appendChild(h3);
    var grid=document.createElement("div"); grid.className="ng-sv-grid";
    grid.appendChild(box("Headline", p.headline, false));
    grid.appendChild(box("Dek", p.dek, false));
    grid.appendChild(box("Key Points", p.keypoints, true));
    grid.appendChild(box("Web Article", p.web, false));
    grid.appendChild(box("Video", p.video, false));
    if(p.hook) grid.appendChild(box("Hook", p.hook, false));
    grid.appendChild(box("Raw Output", txt, false));
    card.appendChild(grid);
    body.appendChild(card);
  }

  function openModal(){ var m=qs("#ng-storyview-modal"); if(m) m.style.display="block"; }
  function closeModal(){ var m=qs("#ng-storyview-modal"); if(m) m.style.display="none"; }

  function refresh(){
    var best=getAuto();
    qs("#ng-sv-source").textContent="Source: " + (best.source||"none");
    qs("#ng-sv-status").textContent="AUTO picked: " + (best.source||"none") + " @ " + new Date().toLocaleTimeString();
    render(best.text||"");
  }

  qs("#ng-btn-storyview")?.addEventListener("click", function(){ openModal(); refresh(); }, false);
  qs("#ng-storyview-close")?.addEventListener("click", closeModal, false);
  qs("#ng-storyview-refresh")?.addEventListener("click", refresh, false);
  qs("#ng-storyview-modal")?.addEventListener("click", function(e){ if(e && e.target === qs("#ng-storyview-modal")) closeModal(); }, false);

  console.log("[STORY_VIEW_V2] ready");
})();
</script>
$end
"@

# Remove old V1/V2 block if present, then insert V2 before </body>
$rxAny = '(?is)<!--\s*NG_PATCH:\s*STORY_VIEW_V[12]\s*-->(.*?)<!--\s*/NG_PATCH:\s*STORY_VIEW_V[12]\s*-->'
$html2 = [regex]::Replace($html, $rxAny, "", 1)

if ($html2 -match '(?is)</body\s*>') {
  $out = [regex]::Replace($html2, '(?is)</body\s*>', "$block`r`n</body>", 1)
} else {
  $out = $html2 + "`r`n" + $block + "`r`n"
}

WriteUtf8NoBom $fullPath $out

Write-Host "✅ STORY_VIEW_V2 installed" -ForegroundColor Green
Write-Host "Backup: $backup" -ForegroundColor Cyan
