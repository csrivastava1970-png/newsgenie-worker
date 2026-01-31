param([string]$Path=".\public\index.html")
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function WriteUtf8NoBom([string]$p,[string]$t){
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [IO.File]::WriteAllText($p,$t,$utf8NoBom)
}

$full=(Resolve-Path $Path).Path
$html=[IO.File]::ReadAllText($full)

# ✅ Backup FIRST
$ts=Get-Date -Format "yyyyMMdd_HHmmss"
$bak=Join-Path (Split-Path $full -Parent) ("index_backup_before_story_view_v7_{0}.html" -f $ts)
[IO.File]::Copy($full,$bak,$true)

$start="<!-- NG_PATCH: STORY_VIEW_V7 -->"
$end="<!-- /NG_PATCH: STORY_VIEW_V7 -->"

$block=@"
$start
<style>
  #ng-sv7-modal{display:none; position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,.55);}
  #ng-sv7-card{background:#fff; width:min(1180px,96vw); height:min(92vh,96vh); margin:3vh auto; border-radius:14px; overflow:hidden;
    box-shadow:0 18px 60px rgba(0,0,0,.25); display:flex; flex-direction:column; font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial;}
  #ng-sv7-top{display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #eee; background:#fafafa; gap:10px;}
  #ng-sv7-top strong{font-size:14px;}
  #ng-sv7-top .btn{padding:7px 10px; border:1px solid #ddd; border-radius:10px; background:#fff; font:600 12px/1 system-ui; cursor:pointer;}
  #ng-sv7-top .pill{padding:6px 10px; border:1px solid #ddd; border-radius:999px; background:#fff; font:600 11px/1 system-ui; color:#333;
    max-width:52vw; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
  #ng-sv7-body{padding:12px; overflow:auto;}
  .ng-sv7-seg{border:1px solid #eee; border-radius:12px; margin:10px 0; overflow:hidden;}
  .ng-sv7-seg h3{margin:0; padding:10px 12px; font-size:13px; background:#f6f6f6; border-bottom:1px solid #eee;}
  .ng-sv7-grid{display:grid; grid-template-columns:1fr; gap:10px; padding:10px 12px;}
  .ng-sv7-box{border:1px solid #eee; border-radius:12px; padding:10px; background:#fff;}
  .ng-sv7-box h4{margin:0 0 8px 0; font-size:12px; text-transform:uppercase; color:#444; display:flex; justify-content:space-between; align-items:center; gap:10px;}
  .ng-sv7-copy{padding:6px 8px; border:1px solid #ddd; border-radius:10px; background:#fff; cursor:pointer; font:600 11px/1 system-ui;}
  .ng-sv7-pre{white-space:pre-wrap; margin:0; font-family:ui-monospace, Menlo, Consolas, monospace; font-size:12px; line-height:1.35;}
  .ng-sv7-ul{margin:0; padding-left:18px;}
  .ng-sv7-ul li{margin:2px 0;}
  .ng-sv7-muted{color:#666; font-size:12px;}
  .ng-sv7-row{display:flex; gap:10px; align-items:center; flex-wrap:wrap;}
  .ng-sv7-toggle{display:flex; gap:6px; align-items:center; font:600 12px/1 system-ui; color:#333; user-select:none;}
</style>

<div id="ng-sv7-modal">
  <div id="ng-sv7-card">
    <div id="ng-sv7-top">
      <div>
        <strong>Story View</strong>
        <div class="ng-sv7-muted" id="ng-sv7-status">V7 clean parser (no separators, no repeated hook)</div>
      </div>
      <div class="ng-sv7-row">
        <label class="ng-sv7-toggle" title="Show cleaning debug (no raw JSON)">
          <input type="checkbox" id="ng-sv7-debug" />
          Debug
        </label>
        <span class="pill" id="ng-sv7-source">Source: auto</span>
        <button class="btn" id="ng-sv7-refresh" type="button">Refresh</button>
        <button class="btn" id="ng-sv7-close" type="button">Close</button>
      </div>
    </div>
    <div id="ng-sv7-body"></div>
  </div>
</div>

<script>
(function(){
  if (window.__NG_STORY_VIEW_V7) return;
  window.__NG_STORY_VIEW_V7 = true;

  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)||[]); }
  function safe(s){ return (s==null) ? "" : String(s); }

  // Convert literal "\\n" into real newlines when it looks like escaped text dump
  function deescapeMaybe(t){
    t = safe(t);
    var hasEsc = (t.indexOf("\\n") !== -1);
    if (!hasEsc) return t;
    var escCount = (t.match(/\\n/g) || []).length;
    // if many \\n occurrences OR almost no real newlines -> treat as escaped
    var realNlCount = (t.match(/\n/g) || []).length;
    if (escCount >= 5 || realNlCount <= 1) {
      return t.replace(/\\r\\n/g,"\n").replace(/\\n/g,"\n").replace(/\\t/g,"\t");
    }
    return t;
  }

  function norm(t){
    t = deescapeMaybe(t);
    return safe(t).replace(/\r\n/g,"\n").replace(/\r/g,"\n").trim();
  }

  function copyText(txt){
    txt = safe(txt);
    try{ if (navigator?.clipboard?.writeText){ navigator.clipboard.writeText(txt).catch(function(){}); return true; } }catch(e){}
    try{ var ta=document.createElement("textarea"); ta.value=txt; ta.style.position="fixed"; ta.style.left="-9999px";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); return true; }catch(e){}
    return false;
  }

  // Hide Preview Prompt section (clutter)
  (function hidePreviewPrompt(){
    try{
      var all=qsa("label,div,h3,h4,strong,span");
      for (var i=0;i<all.length;i++){
        var el=all[i], tx=safe(el?.textContent||"");
        if (tx.indexOf("Preview Prompt")!==-1){
          var p=el;
          for (var k=0;k<7;k++){
            if (!p || !p.parentElement) break;
            p=p.parentElement;
            if (p && p.tagName==="DIV" && safe(p.innerText||"").indexOf("Preview Prompt")!==-1){
              p.style.display="none"; return;
            }
          }
        }
      }
    }catch(e){}
  })();

  function isPlaceholder(t){
    t=safe(t);
    return (t.indexOf("No generated pack found")!==-1) || (t.indexOf("Generate then Save Draft")!==-1);
  }

  function isSeparatorLine(line){
    line = safe(line).trim();
    if (!line) return true;
    // if only hyphens/spaces
    return (line.replace(/[-\s]/g,"") === "");
  }

  function cleanBlock(block){
    block = norm(block);
    if (!block) return "";
    var lines = block.split("\n");
    var out = [];
    var blank = 0;
    for (var i=0;i<lines.length;i++){
      var l = lines[i];
      if (isSeparatorLine(l)) { blank++; continue; }
      l = l.replace(/\s+$/,"");
      if (!l.trim()){
        blank++;
        if (blank<=1) out.push("");
        continue;
      }
      blank=0;
      out.push(l);
    }
    // trim extra blanks
    while(out.length && !out[0].trim()) out.shift();
    while(out.length && !out[out.length-1].trim()) out.pop();
    return out.join("\n").trim();
  }

  // Extract hooks from a video block and remove HOOK lines
  function extractHookAndCleanVideo(videoBlock){
    var v = norm(videoBlock);
    var hook = "";
    var lines = v.split("\n");
    var out = [];
    for (var i=0;i<lines.length;i++){
      var l = lines[i].trim();
      if (!l) continue;
      if (/^HOOK\s*:/i.test(l)){
        var h = l.replace(/^HOOK\s*:\s*/i,"").trim();
        if (!hook && h) hook = h;
        continue; // remove all hook lines from video content
      }
      if (isSeparatorLine(l)) continue;
      out.push(lines[i]);
    }
    var cleaned = cleanBlock(out.join("\n"));
    return { video: cleaned, hook: hook };
  }

  // ---------- TEXT block parser (with cleaning) ----------
  function parseBlocksFromText(txt){
    txt=norm(txt);

    function after(prefix){
      var i=txt.indexOf(prefix); if(i===-1) return "";
      return (txt.slice(i+prefix.length).split("\n")[0]||"").trim();
    }
    function between(start, nextArr){
      var i=txt.indexOf(start); if(i===-1) return "";
      var rest=txt.slice(i+start.length), cut=rest.length;
      for (var k=0;k<nextArr.length;k++){
        var j=rest.indexOf(nextArr[k]); if(j!==-1 && j<cut) cut=j;
      }
      return rest.slice(0,cut).trim();
    }

    // Keypoints: ignore separator-only lines + normalize repeated "- - -"
    function keypoints(block){
      block = norm(block);
      var lines = block.split("\n");
      var out=[];
      for (var i=0;i<lines.length;i++){
        var l = lines[i].trim();
        if (!l) continue;
        if (isSeparatorLine(l)) continue;

        // remove repeated "- - - " prefixes
        l = l.replace(/^(\s*-\s*)+/, "");
        // also remove bullets like •
        l = l.replace(/^[•\u2022]\s*/,"").trim();

        if (!l) continue;
        if (isSeparatorLine(l)) continue;

        out.push(l);
      }
      // final filter: remove any remaining hyphen-only artifacts
      out = out.filter(function(x){ return x && x.replace(/[-\s]/g,"")!==""; });
      return out;
    }

    var kpB = between("KEY POINTS",["WEB ARTICLE","VIDEO","SOCIAL","BYTES","FULL DIGIPACK"]);
    var wa  = between("WEB ARTICLE",["VIDEO","SOCIAL","BYTES","FULL DIGIPACK"]);
    var vd  = between("VIDEO",["SOCIAL","BYTES","FULL DIGIPACK"]);

    var webClean = cleanBlock(wa);
    var vidObj = extractHookAndCleanVideo(vd);

    return {
      headline: after("HEADLINE:"),
      dek: after("DEK:"),
      keypoints: kpB ? keypoints(kpB) : [],
      web: webClean,
      video: vidObj.video,
      hook: vidObj.hook || after("HOOK:")
    };
  }

  // If localStorage value is JSON, try parse, else treat as text
  function normalizeInput(raw){
    var t = safe(raw).trim();
    if (!t || isPlaceholder(t)) return {sec:{}, dbg:["empty"]};

    // json?
    if (t[0]==="{" || t[0]==="["){
      try{
        var obj = JSON.parse(t);
        // common direct fields
        var h = safe(obj.headline||obj.HEADLINE||obj.title||"").trim();
        var d = safe(obj.dek||obj.DEK||obj.summary||"").trim();
        var kp = obj.key_points || obj.keypoints || obj.points || [];
        var wa = safe(obj.web_article||obj.web||obj.article||"");
        var vd = safe(obj.video||obj.script||"");
        var hk = safe(obj.hook||"");

        // if JSON doesn't have these, fall back to stringified text parsing
        var madeText = "";
        if (h || d || wa || vd || hk || (Array.isArray(kp) && kp.length)){
          var out=[];
          if (h) out.push("HEADLINE: "+h);
          if (d) out.push("DEK: "+d);
          if (Array.isArray(kp) && kp.length){
            out.push(""); out.push("KEY POINTS"); out.push("--------------------------------");
            kp.forEach(function(x){ out.push("- "+safe(x)); });
          }
          if (wa){ out.push(""); out.push("WEB ARTICLE"); out.push("--------------------------------"); out.push(wa); }
          if (vd || hk){
            out.push(""); out.push("VIDEO"); out.push("--------------------------------");
            if (vd) out.push(vd);
            if (hk) out.push("HOOK: "+hk);
          }
          madeText = out.join("\n");
          // store clean text for next time
          try{ localStorage.setItem("NG_LAST_PACK_TEXT", madeText); }catch(e){}
          var sec = parseBlocksFromText(madeText);
          return {sec:sec, dbg:["json->text"]};
        }

        // fallback to parse a pack-like string if present anywhere
        return {sec:parseBlocksFromText(JSON.stringify(obj)), dbg:["json->stringify-fallback"]};
      }catch(e){
        // treat as text
      }
    }

    var sec2 = parseBlocksFromText(t);
    // store clean text for future (optional)
    try{
      var out2=[];
      if (sec2.headline) out2.push("HEADLINE: "+sec2.headline);
      if (sec2.dek) out2.push("DEK: "+sec2.dek);
      if (sec2.keypoints && sec2.keypoints.length){
        out2.push(""); out2.push("KEY POINTS"); out2.push("--------------------------------");
        sec2.keypoints.forEach(function(x){ out2.push("- "+x); });
      }
      if (sec2.web){ out2.push(""); out2.push("WEB ARTICLE"); out2.push("--------------------------------"); out2.push(sec2.web); }
      if (sec2.video || sec2.hook){
        out2.push(""); out2.push("VIDEO"); out2.push("--------------------------------");
        if (sec2.video) out2.push(sec2.video);
        if (sec2.hook) out2.push("HOOK: "+sec2.hook);
      }
      var cleanPack = out2.join("\n").trim();
      if (cleanPack.length>120) localStorage.setItem("NG_LAST_PACK_TEXT", cleanPack);
    }catch(e){}

    return {sec:sec2, dbg:["text"]};
  }

  function pickFromLocalStorage(){
    var keys = ["NG_LAST_PACK_TEXT","NG_LAST_DIGIPACK","NG_LAST_PACK","NG_DRAFTS","drafts","NG_LIBRARY","ng_library"];
    for (var i=0;i<keys.length;i++){
      try{
        var v = localStorage.getItem(keys[i]);
        if (v && !isPlaceholder(v) && v.length>40) return {text:v, source:"localStorage:"+keys[i]};
      }catch(e){}
    }
    // scan
    try{
      var best=null, bestLen=0, bestK="";
      for (var j=0;j<localStorage.length;j++){
        var k=localStorage.key(j);
        if (!k || !/digipack|pack|draft|library/i.test(k)) continue;
        var vv=localStorage.getItem(k);
        if (vv && !isPlaceholder(vv) && vv.length>bestLen){ best=vv; bestLen=vv.length; bestK=k; }
      }
      if (best) return {text:best, source:"localStorage:scan:"+bestK};
    }catch(e){}
    return null;
  }

  function pickFromDOM(){
    var nodes=qsa("textarea").concat(qsa("pre")).concat(qsa("code"));
    var best=null, bestLen=0;
    for (var i=0;i<nodes.length;i++){
      var n=nodes[i];
      var t=(n && n.tagName==="TEXTAREA") ? safe(n.value) : safe(n?.textContent||"");
      if (!t || isPlaceholder(t)) continue;
      if (t.length>bestLen){ best=t; bestLen=t.length; }
    }
    if (best) return {text:best, source:"DOM:best"};
    return null;
  }

  function box(title, content, asList){
    var wrap=document.createElement("div"); wrap.className="ng-sv7-box";
    var h=document.createElement("h4");
    var l=document.createElement("span"); l.textContent=title;
    var b=document.createElement("button"); b.className="ng-sv7-copy"; b.type="button"; b.textContent="Copy";
    b.addEventListener("click", function(){
      var txt = asList ? (content||[]).join("\n") : safe(content);
      copyText(txt);
      b.textContent="Copied"; setTimeout(function(){ b.textContent="Copy"; }, 600);
    }, false);
    h.appendChild(l); h.appendChild(b); wrap.appendChild(h);

    if (asList){
      var ul=document.createElement("ul"); ul.className="ng-sv7-ul";
      for (var i=0;i<(content||[]).length;i++){ var li=document.createElement("li"); li.textContent=content[i]; ul.appendChild(li); }
      wrap.appendChild(ul);
    } else {
      var pre=document.createElement("pre"); pre.className="ng-sv7-pre"; pre.textContent=safe(content||""); wrap.appendChild(pre);
    }
    return wrap;
  }

  function render(rawText, src){
    var body=qs("#ng-sv7-body"); if(!body) return;
    body.innerHTML="";

    var debugOn = !!qs("#ng-sv7-debug")?.checked;

    var r = normalizeInput(rawText||"");
    var s = r.sec || {};

    var card=document.createElement("div"); card.className="ng-sv7-seg";
    var h3=document.createElement("h3"); h3.textContent="STORY"; card.appendChild(h3);

    var grid=document.createElement("div"); grid.className="ng-sv7-grid";
    grid.appendChild(box("Headline", s.headline||"", false));
    grid.appendChild(box("Dek", s.dek||"", false));
    grid.appendChild(box("Key Points", s.keypoints||[], true));
    grid.appendChild(box("Web Article", s.web||"", false));
    grid.appendChild(box("Video", s.video||"", false));
    if (s.hook) grid.appendChild(box("Hook", s.hook, false));

    if (debugOn){
      grid.appendChild(box("Debug", (r.dbg||[]).join("\n"), false));
    }

    card.appendChild(grid);
    body.appendChild(card);

    qs("#ng-sv7-source").textContent = "Source: " + (src||"auto");
    qs("#ng-sv7-status").textContent = "Updated @ " + new Date().toLocaleTimeString() + " (V7 cleaned)";
  }

  function openModal(){ var m=qs("#ng-sv7-modal"); if(m) m.style.display="block"; }
  function closeModal(){ var m=qs("#ng-sv7-modal"); if(m) m.style.display="none"; }

  function refresh(){
    var picked = pickFromLocalStorage() || pickFromDOM() || {text:"", source:"none"};
    render(picked.text||"", picked.source||"none");
  }

  qs("#ng-sv7-close")?.addEventListener("click", closeModal, false);
  qs("#ng-sv7-refresh")?.addEventListener("click", refresh, false);
  qs("#ng-sv7-debug")?.addEventListener("change", refresh, false);

  var modal=qs("#ng-sv7-modal");
  modal?.addEventListener("click", function(e){ if(e && e.target===modal) closeModal(); }, false);

  // SEGMENTS bubble triggers Story View
  document.addEventListener("click", function(e){
    var t=e && e.target ? e.target : null;
    if(!t) return;
    var el=t;
    for (var i=0;i<5;i++){
      if(!el) break;
      var tx=safe(el.textContent||el.value||"").trim();
      if (tx==="SEGMENTS"){
        try{ e.preventDefault(); }catch(_){}
        try{ e.stopPropagation(); }catch(_){}
        try{ e.stopImmediatePropagation(); }catch(_){}
        openModal(); refresh(); return;
      }
      el=el.parentElement;
    }
  }, true);

  console.log("[STORY_VIEW_V7] ready");
})();
</script>
$end
"@

# Remove old STORY_VIEW blocks (V1..V7) then insert V7
$rxAny='(?is)<!--\s*NG_PATCH:\s*STORY_VIEW_V[1234567]\s*-->(.*?)<!--\s*/NG_PATCH:\s*STORY_VIEW_V[1234567]\s*-->'
$html2=[regex]::Replace($html,$rxAny,"",1)

if ($html2 -match '(?is)</body\s*>'){
  $out=[regex]::Replace($html2,'(?is)</body\s*>',"$block`r`n</body>",1)
} else {
  $out=$html2 + "`r`n" + $block + "`r`n"
}

WriteUtf8NoBom $full $out
Write-Host "✅ STORY_VIEW_V7 installed" -ForegroundColor Green
Write-Host "Backup: $bak" -ForegroundColor Cyan
