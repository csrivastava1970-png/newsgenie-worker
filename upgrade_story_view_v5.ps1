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
$bak=Join-Path (Split-Path $full -Parent) ("index_backup_before_story_view_v5_{0}.html" -f $ts)
[IO.File]::Copy($full,$bak,$true)

$start="<!-- NG_PATCH: STORY_VIEW_V5 -->"
$end="<!-- /NG_PATCH: STORY_VIEW_V5 -->"

$block=@"
$start
<style>
  #ng-sv5-modal{display:none; position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,.55);}
  #ng-sv5-card{background:#fff; width:min(1180px,96vw); height:min(92vh,96vh); margin:3vh auto; border-radius:14px; overflow:hidden;
    box-shadow:0 18px 60px rgba(0,0,0,.25); display:flex; flex-direction:column; font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial;}
  #ng-sv5-top{display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #eee; background:#fafafa; gap:10px;}
  #ng-sv5-top strong{font-size:14px;}
  #ng-sv5-top .btn{padding:7px 10px; border:1px solid #ddd; border-radius:10px; background:#fff; font:600 12px/1 system-ui; cursor:pointer;}
  #ng-sv5-top .pill{padding:6px 10px; border:1px solid #ddd; border-radius:999px; background:#fff; font:600 11px/1 system-ui; color:#333;
    max-width:52vw; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
  #ng-sv5-body{padding:12px; overflow:auto;}
  .ng-sv5-seg{border:1px solid #eee; border-radius:12px; margin:10px 0; overflow:hidden;}
  .ng-sv5-seg h3{margin:0; padding:10px 12px; font-size:13px; background:#f6f6f6; border-bottom:1px solid #eee;}
  .ng-sv5-grid{display:grid; grid-template-columns:1fr; gap:10px; padding:10px 12px;}
  .ng-sv5-box{border:1px solid #eee; border-radius:12px; padding:10px; background:#fff;}
  .ng-sv5-box h4{margin:0 0 8px 0; font-size:12px; text-transform:uppercase; color:#444; display:flex; justify-content:space-between; align-items:center; gap:10px;}
  .ng-sv5-copy{padding:6px 8px; border:1px solid #ddd; border-radius:10px; background:#fff; cursor:pointer; font:600 11px/1 system-ui;}
  .ng-sv5-pre{white-space:pre-wrap; margin:0; font-family:ui-monospace, Menlo, Consolas, monospace; font-size:12px; line-height:1.35;}
  .ng-sv5-ul{margin:0; padding-left:18px;}
  .ng-sv5-ul li{margin:2px 0;}
  .ng-sv5-muted{color:#666; font-size:12px;}
  .ng-sv5-row{display:flex; gap:10px; align-items:center; flex-wrap:wrap;}
  .ng-sv5-toggle{display:flex; gap:6px; align-items:center; font:600 12px/1 system-ui; color:#333; user-select:none;}
</style>

<div id="ng-sv5-modal">
  <div id="ng-sv5-card">
    <div id="ng-sv5-top">
      <div>
        <strong>Story View</strong>
        <div class="ng-sv5-muted" id="ng-sv5-status">Producer view (Raw JSON hidden)</div>
      </div>
      <div class="ng-sv5-row">
        <label class="ng-sv5-toggle" title="Raw JSON/Debug show">
          <input type="checkbox" id="ng-sv5-debug" />
          Debug
        </label>
        <span class="pill" id="ng-sv5-source">Source: auto</span>
        <button class="btn" id="ng-sv5-refresh" type="button">Refresh</button>
        <button class="btn" id="ng-sv5-close" type="button">Close</button>
      </div>
    </div>
    <div id="ng-sv5-body"></div>
  </div>
</div>

<script>
(function(){
  if (window.__NG_STORY_VIEW_V5) return;
  window.__NG_STORY_VIEW_V5 = true;

  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)||[]); }
  function safe(s){ return (s==null) ? "" : String(s); }
  function norm(t){ return safe(t).replace(/\\r\\n/g,"\\n").replace(/\\r/g,"\\n").trim(); }

  function copyText(txt){
    txt = safe(txt);
    try{ if (navigator?.clipboard?.writeText){ navigator.clipboard.writeText(txt).catch(function(){}); return true; } }catch(e){}
    try{ var ta=document.createElement("textarea"); ta.value=txt; ta.style.position="fixed"; ta.style.left="-9999px";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); return true; }catch(e){}
    return false;
  }

  // Hide Preview Prompt section (optional clutter)
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

  function isValidPack(t){
    t=safe(t);
    if (!t) return false;
    if (t.indexOf("No generated pack found")!==-1) return false;
    if (t.indexOf("Generate then Save Draft")!==-1) return false;
    if (t.length < 120) return false;
    return true;
  }

  // ✅ JSON -> sections extractor (best-effort)
  function jsonToSections(obj){
    function pick(o, keys){
      for (var i=0;i<keys.length;i++){
        var k=keys[i];
        if (o && typeof o[k]==="string" && o[k].trim()) return o[k].trim();
      }
      return "";
    }
    function pickArr(o, keys){
      for (var i=0;i<keys.length;i++){
        var k=keys[i];
        var v=o?o[k]:null;
        if (Array.isArray(v) && v.length) return v.map(function(x){return safe(x).trim();}).filter(Boolean);
        if (typeof v==="string" && v.trim()){
          return v.split("\\n").map(function(x){return x.replace(/^\\-\\s*/,"").trim();}).filter(Boolean);
        }
      }
      return [];
    }

    var headline = pick(obj, ["headline","HEADLINE","title","Title"]);
    var dek      = pick(obj, ["dek","DEK","subhead","summary","lede"]);
    var kps      = pickArr(obj, ["key_points","keyPoints","keypoints","bullets","bullet_points","points","KEY_POINTS"]);
    var web      = pick(obj, ["web_article","webArticle","article","web","WEB_ARTICLE"]);
    var videoStr = pick(obj, ["video","VIDEO","video_script","script","vo"]);
    var hook     = pick(obj, ["hook","HOOK"]);

    // nested video object
    if (!videoStr && obj && typeof obj.video === "object" && obj.video){
      hook = hook || pick(obj.video, ["hook","HOOK"]);
      videoStr = pick(obj.video, ["script","vo","text","body"]);
    }

    return { headline: headline, dek: dek, keypoints: kps, web: web, video: videoStr, hook: hook };
  }

  function parseBlocksFromText(txt){
    txt=norm(txt);
    function after(prefix){
      var i=txt.indexOf(prefix); if(i===-1) return "";
      return (txt.slice(i+prefix.length).split("\\n")[0]||"").trim();
    }
    function between(start, nextArr){
      var i=txt.indexOf(start); if(i===-1) return "";
      var rest=txt.slice(i+start.length), cut=rest.length;
      for (var k=0;k<nextArr.length;k++){
        var j=rest.indexOf(nextArr[k]); if(j!==-1 && j<cut) cut=j;
      }
      return rest.slice(0,cut).trim();
    }
    function kp(block){
      var lines=norm(block).split("\\n"), out=[];
      for (var i=0;i<lines.length;i++){
        var l=lines[i].trim(); if(!l) continue;
        out.push(l.indexOf("-")===0 ? l.replace(/^\\-\\s*/,"").trim() : l);
      }
      return out;
    }
    var kpB=between("KEY POINTS",["WEB ARTICLE","VIDEO","SOCIAL","BYTES","FULL DIGIPACK"]);
    var wa =between("WEB ARTICLE",["VIDEO","SOCIAL","BYTES","FULL DIGIPACK"]);
    var vd =between("VIDEO",["SOCIAL","BYTES","FULL DIGIPACK"]);
    return {headline: after("HEADLINE:"), dek: after("DEK:"), keypoints: kpB?kp(kpB):[], web: wa, video: vd, hook: after("HOOK:")};
  }

  function normalizeInputToSections(raw){
    var t = safe(raw).trim();
    // If it's JSON, parse
    if (t && (t[0]==="{" || t[0]==="[")){
      try{
        var obj = JSON.parse(t);
        // If array, try the last item
        if (Array.isArray(obj) && obj.length) obj = obj[obj.length-1];
        var sec = jsonToSections(obj || {});
        // If still empty, fall back to text parsing on stringified
        return { sections: sec, rawPretty: JSON.stringify(obj, null, 2), rawKind: "json" };
      }catch(e){
        // invalid json, treat as text
      }
    }
    return { sections: parseBlocksFromText(t), rawPretty: t, rawKind: "text" };
  }

  function pickFromLocalStorage(){
    // Prefer your current key
    var keys = ["NG_LAST_DIGIPACK","NG_LAST_PACK_TEXT","NG_LAST_PACK","NG_DRAFTS","ng_drafts","drafts"];
    for (var i=0;i<keys.length;i++){
      try{
        var v = localStorage.getItem(keys[i]);
        if (v && isValidPack(v)) return {text:v, source:"localStorage:"+keys[i]};
      }catch(e){}
    }
    // scan anything draft/pack
    try{
      var best=null, bestLen=0;
      for (var j=0;j<localStorage.length;j++){
        var k=localStorage.key(j);
        if (!k || !/draft|pack|digipack/i.test(k)) continue;
        var v2=localStorage.getItem(k);
        if (v2 && isValidPack(v2) && v2.length>bestLen){ best=v2; bestLen=v2.length; }
      }
      if (best) return {text:best, source:"localStorage:scan"};
    }catch(e){}
    return null;
  }

  function pickFromDOM(){
    var nodes=qsa("textarea").concat(qsa("pre")).concat(qsa("code"));
    var best=null, bestScore=-1;
    function score(t){
      t=safe(t); if (!isValidPack(t)) return -1;
      var s=0;
      if (t.indexOf("HEADLINE:")!==-1) s+=6;
      if (t.indexOf("KEY POINTS")!==-1) s+=5;
      if (t.indexOf("WEB ARTICLE")!==-1) s+=5;
      if (t.indexOf("VIDEO")!==-1) s+=3;
      s += Math.min(6, Math.floor(t.length/1500));
      return s;
    }
    for (var i=0;i<nodes.length;i++){
      var n=nodes[i];
      var t=(n && n.tagName==="TEXTAREA") ? safe(n.value) : safe(n?.textContent||"");
      var sc=score(t);
      if (sc>bestScore){ bestScore=sc; best=t; }
    }
    if (best && best.length>120) return {text:best, source:"DOM:best"};
    return null;
  }

  function box(title, content, asList){
    var wrap=document.createElement("div"); wrap.className="ng-sv5-box";
    var h=document.createElement("h4");
    var l=document.createElement("span"); l.textContent=title;
    var b=document.createElement("button"); b.className="ng-sv5-copy"; b.type="button"; b.textContent="Copy";
    b.addEventListener("click", function(){
      var txt = asList ? (content||[]).join("\\n") : safe(content);
      copyText(txt);
      b.textContent="Copied"; setTimeout(function(){ b.textContent="Copy"; }, 600);
    }, false);
    h.appendChild(l); h.appendChild(b); wrap.appendChild(h);

    if (asList){
      var ul=document.createElement("ul"); ul.className="ng-sv5-ul";
      for (var i=0;i<(content||[]).length;i++){ var li=document.createElement("li"); li.textContent=content[i]; ul.appendChild(li); }
      wrap.appendChild(ul);
    } else {
      var pre=document.createElement("pre"); pre.className="ng-sv5-pre"; pre.textContent=safe(content||""); wrap.appendChild(pre);
    }
    return wrap;
  }

  function render(rawText, src){
    var body=qs("#ng-sv5-body"); if(!body) return;
    body.innerHTML="";

    var debugOn = !!qs("#ng-sv5-debug")?.checked;

    if (!rawText || rawText.length<120){
      var d=document.createElement("div"); d.className="ng-sv5-muted";
      d.textContent="Pack नहीं मिला. पहले किसी story का DIGIPACK/Download/Save Draft कीजिए।";
      body.appendChild(d);
      return;
    }

    var r = normalizeInputToSections(rawText);
    var s = r.sections || {};

    var card=document.createElement("div"); card.className="ng-sv5-seg";
    var h3=document.createElement("h3"); h3.textContent="STORY"; card.appendChild(h3);

    var grid=document.createElement("div"); grid.className="ng-sv5-grid";
    grid.appendChild(box("Headline", s.headline||"", false));
    grid.appendChild(box("Dek", s.dek||"", false));
    grid.appendChild(box("Key Points", s.keypoints||[], true));
    grid.appendChild(box("Web Article", s.web||"", false));
    grid.appendChild(box("Video", s.video||"", false));
    if (s.hook) grid.appendChild(box("Hook", s.hook, false));

    // ✅ Raw Output only in Debug
    if (debugOn){
      grid.appendChild(box("Raw Output ("+r.rawKind+")", r.rawPretty||"", false));
      // extra copy json button
      var extra=document.createElement("div"); extra.className="ng-sv5-box";
      var hh=document.createElement("h4");
      hh.innerHTML = "<span>Debug Tools</span>";
      var bb=document.createElement("button"); bb.className="ng-sv5-copy"; bb.type="button"; bb.textContent="Copy Raw";
      bb.addEventListener("click", function(){ copyText(r.rawPretty||""); }, false);
      hh.appendChild(bb); extra.appendChild(hh);
      var pre=document.createElement("pre"); pre.className="ng-sv5-pre"; pre.textContent="Debug is ON. Raw is visible.";
      extra.appendChild(pre);
      grid.appendChild(extra);
    }

    card.appendChild(grid);
    body.appendChild(card);

    qs("#ng-sv5-source").textContent = "Source: " + (src||"auto");
    qs("#ng-sv5-status").textContent = "Updated @ " + new Date().toLocaleTimeString() + " (Raw hidden by default)";
  }

  function openModal(){ var m=qs("#ng-sv5-modal"); if(m) m.style.display="block"; }
  function closeModal(){ var m=qs("#ng-sv5-modal"); if(m) m.style.display="none"; }

  function refresh(){
    var picked = pickFromLocalStorage() || pickFromDOM() || {text:"", source:"none"};
    render(picked.text||"", picked.source||"none");
  }

  qs("#ng-sv5-close")?.addEventListener("click", closeModal, false);
  qs("#ng-sv5-refresh")?.addEventListener("click", refresh, false);
  qs("#ng-sv5-debug")?.addEventListener("change", refresh, false);

  var modal=qs("#ng-sv5-modal");
  modal?.addEventListener("click", function(e){ if(e && e.target===modal) closeModal(); }, false);

  // ✅ Use existing SEGMENTS bubble as Story View trigger (override)
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

  console.log("[STORY_VIEW_V5] ready (Raw hidden; Debug toggle)");
})();
</script>
$end
"@

# Remove old STORY_VIEW blocks (V1..V5) then insert V5
$rxAny='(?is)<!--\s*NG_PATCH:\s*STORY_VIEW_V[12345]\s*-->(.*?)<!--\s*/NG_PATCH:\s*STORY_VIEW_V[12345]\s*-->'
$html2=[regex]::Replace($html,$rxAny,"",1)

if ($html2 -match '(?is)</body\s*>'){
  $out=[regex]::Replace($html2,'(?is)</body\s*>',"$block`r`n</body>",1)
} else {
  $out=$html2 + "`r`n" + $block + "`r`n"
}

WriteUtf8NoBom $full $out
Write-Host "✅ STORY_VIEW_V5 installed" -ForegroundColor Green
Write-Host "Backup: $bak" -ForegroundColor Cyan
