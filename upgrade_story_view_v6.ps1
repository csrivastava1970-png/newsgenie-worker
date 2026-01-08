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
$bak=Join-Path (Split-Path $full -Parent) ("index_backup_before_story_view_v6_{0}.html" -f $ts)
[IO.File]::Copy($full,$bak,$true)

$start="<!-- NG_PATCH: STORY_VIEW_V6 -->"
$end="<!-- /NG_PATCH: STORY_VIEW_V6 -->"

$block=@"
$start
<style>
  #ng-sv6-modal{display:none; position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,.55);}
  #ng-sv6-card{background:#fff; width:min(1180px,96vw); height:min(92vh,96vh); margin:3vh auto; border-radius:14px; overflow:hidden;
    box-shadow:0 18px 60px rgba(0,0,0,.25); display:flex; flex-direction:column; font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial;}
  #ng-sv6-top{display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #eee; background:#fafafa; gap:10px;}
  #ng-sv6-top strong{font-size:14px;}
  #ng-sv6-top .btn{padding:7px 10px; border:1px solid #ddd; border-radius:10px; background:#fff; font:600 12px/1 system-ui; cursor:pointer;}
  #ng-sv6-top .pill{padding:6px 10px; border:1px solid #ddd; border-radius:999px; background:#fff; font:600 11px/1 system-ui; color:#333;
    max-width:52vw; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
  #ng-sv6-body{padding:12px; overflow:auto;}
  .ng-sv6-seg{border:1px solid #eee; border-radius:12px; margin:10px 0; overflow:hidden;}
  .ng-sv6-seg h3{margin:0; padding:10px 12px; font-size:13px; background:#f6f6f6; border-bottom:1px solid #eee;}
  .ng-sv6-grid{display:grid; grid-template-columns:1fr; gap:10px; padding:10px 12px;}
  .ng-sv6-box{border:1px solid #eee; border-radius:12px; padding:10px; background:#fff;}
  .ng-sv6-box h4{margin:0 0 8px 0; font-size:12px; text-transform:uppercase; color:#444; display:flex; justify-content:space-between; align-items:center; gap:10px;}
  .ng-sv6-copy{padding:6px 8px; border:1px solid #ddd; border-radius:10px; background:#fff; cursor:pointer; font:600 11px/1 system-ui;}
  .ng-sv6-pre{white-space:pre-wrap; margin:0; font-family:ui-monospace, Menlo, Consolas, monospace; font-size:12px; line-height:1.35;}
  .ng-sv6-ul{margin:0; padding-left:18px;}
  .ng-sv6-ul li{margin:2px 0;}
  .ng-sv6-muted{color:#666; font-size:12px;}
  .ng-sv6-row{display:flex; gap:10px; align-items:center; flex-wrap:wrap;}
  .ng-sv6-toggle{display:flex; gap:6px; align-items:center; font:600 12px/1 system-ui; color:#333; user-select:none;}
</style>

<div id="ng-sv6-modal">
  <div id="ng-sv6-card">
    <div id="ng-sv6-top">
      <div>
        <strong>Story View</strong>
        <div class="ng-sv6-muted" id="ng-sv6-status">JSON → Text mapper (V6)</div>
      </div>
      <div class="ng-sv6-row">
        <label class="ng-sv6-toggle" title="Debug info (no raw JSON by default)">
          <input type="checkbox" id="ng-sv6-debug" />
          Debug
        </label>
        <span class="pill" id="ng-sv6-source">Source: auto</span>
        <button class="btn" id="ng-sv6-refresh" type="button">Refresh</button>
        <button class="btn" id="ng-sv6-close" type="button">Close</button>
      </div>
    </div>
    <div id="ng-sv6-body"></div>
  </div>
</div>

<script>
(function(){
  if (window.__NG_STORY_VIEW_V6) return;
  window.__NG_STORY_VIEW_V6 = true;

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

  // Hide Preview Prompt box (clutter)
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

  // ---------- TEXT block parser (when we find a ready-made pack string) ----------
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

  // ---------- Deep JSON walker + heuristic pick ----------
  function collectLeaves(root){
    var strings = [];    // {path, v}
    var arrays  = [];    // {path, arr}
    var seen = new WeakSet();

    function walk(node, path, depth){
      if (depth > 7) return;
      if (node == null) return;

      var t = typeof node;
      if (t === "string"){
        var v = node.trim();
        if (v) strings.push({path:path, v:v});
        return;
      }
      if (t !== "object") return;

      // arrays
      if (Array.isArray(node)){
        // array of strings?
        var allStr = true, arr = [];
        for (var i=0;i<node.length;i++){
          var it=node[i];
          if (typeof it==="string"){ var s=it.trim(); if(s) arr.push(s); }
          else allStr=false;
        }
        if (arr.length && allStr){
          arrays.push({path:path, arr:arr});
          return;
        }
        for (var j=0;j<node.length;j++){
          walk(node[j], path+"["+j+"]", depth+1);
        }
        return;
      }

      // object
      try{ if (seen.has(node)) return; seen.add(node); }catch(e){}
      for (var k in node){
        if (!Object.prototype.hasOwnProperty.call(node,k)) continue;
        walk(node[k], path ? (path+"."+k) : k, depth+1);
      }
    }

    walk(root, "", 0);
    return {strings: strings, arrays: arrays};
  }

  function hasAnyPackMarkers(s){
    s = safe(s);
    return (s.indexOf("HEADLINE:")!==-1) || (s.indexOf("KEY POINTS")!==-1) || (s.indexOf("WEB ARTICLE")!==-1) || (s.indexOf("DIGIPACK")!==-1);
  }

  function scorePath(path, keywords){
    path = path.toLowerCase();
    var s=0;
    for (var i=0;i<keywords.length;i++){
      if (path.indexOf(keywords[i])!==-1) s+=8;
    }
    return s;
  }

  function pickBestString(items, keywords, minLen, maxLen, preferSingleLine){
    var best=null, bestScore=-1;
    for (var i=0;i<items.length;i++){
      var it=items[i];
      var v=it.v;
      if (!v || isPlaceholder(v)) continue;
      var len=v.length;
      if (minLen && len<minLen) continue;
      if (maxLen && len>maxLen) continue;
      if (preferSingleLine && v.indexOf("\\n")!==-1) continue;

      var sc = scorePath(it.path, keywords);
      // length bonus
      sc += Math.min(6, Math.floor(len/80));
      if (preferSingleLine) sc += 2;
      if (sc>bestScore){ bestScore=sc; best=it; }
    }
    return best;
  }

  function pickBestArray(arrItems, keywords){
    var best=null, bestScore=-1;
    for (var i=0;i<arrItems.length;i++){
      var it=arrItems[i];
      var arr=it.arr||[];
      if (!arr.length) continue;
      var sc = scorePath(it.path, keywords);
      sc += Math.min(6, arr.length);
      if (sc>bestScore){ bestScore=sc; best=it; }
    }
    return best;
  }

  function buildTextFromSections(sec){
    sec = sec || {};
    var out=[];
    if (sec.headline) out.push("HEADLINE: " + sec.headline);
    if (sec.dek) out.push("DEK: " + sec.dek);

    if (sec.keypoints && sec.keypoints.length){
      out.push("");
      out.push("KEY POINTS");
      out.push("--------------------------------");
      for (var i=0;i<sec.keypoints.length;i++){
        out.push("- " + safe(sec.keypoints[i]));
      }
    }

    if (sec.web){
      out.push("");
      out.push("WEB ARTICLE");
      out.push("--------------------------------");
      out.push(sec.web);
    }

    if (sec.video || sec.hook){
      out.push("");
      out.push("VIDEO");
      out.push("--------------------------------");
      if (sec.video) out.push(sec.video);
      if (sec.hook) out.push("HOOK: " + sec.hook);
    }

    return out.join("\\n").trim();
  }

  function jsonToSectionsHeuristic(obj){
    var leaves = collectLeaves(obj);

    // 1) if any leaf contains ready-made pack text, use it
    var packLeaf = pickBestString(
      leaves.strings.filter(function(x){ return hasAnyPackMarkers(x.v); }),
      ["digipack","pack","output","text","result","response"], 200, 300000, false
    );
    if (packLeaf){
      var sec = parseBlocksFromText(packLeaf.v);
      return {sections: sec, debug: {mode:"packText", packPath: packLeaf.path, leaves: {str: leaves.strings.length, arr: leaves.arrays.length}}};
    }

    // 2) otherwise, heuristic mapping
    var h = pickBestString(leaves.strings, ["headline","hed","title","subject"], 6, 180, true);
    var d = pickBestString(leaves.strings, ["dek","subhead","summary","lede","strap","desc","description"], 10, 260, false);

    // Keypoints prefer arrays, but also allow newline string blocks
    var kpA = pickBestArray(leaves.arrays, ["key","bullet","point","highlights","kps","keypoints"]);
    var kpS = null;
    if (!kpA){
      kpS = pickBestString(leaves.strings, ["key","bullet","point","highlights","kps","keypoints"], 30, 1200, false);
    }

    var web = pickBestString(leaves.strings, ["web_article","webarticle","web","article","story","body","full","longform","writeup"], 250, 200000, false);
    var vid = pickBestString(leaves.strings, ["video","script","vo","voiceover","reel","shorts","caption"], 40, 20000, false);
    var hook= pickBestString(leaves.strings, ["hook","tease","open","opener"], 6, 220, true);

    var sec2 = {
      headline: h ? h.v : "",
      dek: d ? d.v : "",
      keypoints: kpA ? kpA.arr : (kpS ? kpS.v.split("\\n").map(function(x){return x.replace(/^\\-\\s*/,"").trim();}).filter(Boolean) : []),
      web: web ? web.v : "",
      video: vid ? vid.v : "",
      hook: hook ? hook.v : ""
    };

    return {
      sections: sec2,
      debug: {
        mode:"heuristic",
        pick: {
          headline: h ? h.path : "",
          dek: d ? d.path : "",
          keypoints: kpA ? kpA.path : (kpS ? kpS.path : ""),
          web: web ? web.path : "",
          video: vid ? vid.path : "",
          hook: hook ? hook.path : ""
        },
        leaves: {str: leaves.strings.length, arr: leaves.arrays.length}
      }
    };
  }

  function normalizeInputToSections(raw){
    var t = safe(raw).trim();
    if (!t || isPlaceholder(t)) return {sections:{}, debug:{mode:"empty"}};

    if (t[0]==="{" || t[0]==="["){
      try{
        var obj = JSON.parse(t);
        // if array, pick last non-null
        if (Array.isArray(obj) && obj.length) obj = obj[obj.length-1];
        var r = jsonToSectionsHeuristic(obj||{});
        // ✅ also store a clean text pack for future
        try{
          var txt = buildTextFromSections(r.sections);
          if (txt && txt.length>120){
            localStorage.setItem("NG_LAST_PACK_TEXT", txt);
            localStorage.setItem("NG_LAST_PACK_TS", String(Date.now()));
          }
        }catch(e){}
        return r;
      }catch(e){
        // fallthrough to text parsing
      }
    }

    // plain text
    var sec = parseBlocksFromText(t);
    try{
      var txt2 = buildTextFromSections(sec);
      if (txt2 && txt2.length>120){
        localStorage.setItem("NG_LAST_PACK_TEXT", txt2);
        localStorage.setItem("NG_LAST_PACK_TS", String(Date.now()));
      }
    }catch(e){}
    return {sections: sec, debug:{mode:"text"}};
  }

  function pickFromLocalStorage(){
    // prefer your key
    var keys = ["NG_LAST_PACK_TEXT","NG_LAST_DIGIPACK","NG_LAST_PACK","NG_DRAFTS","ng_drafts","drafts","NG_LIBRARY","ng_library"];
    for (var i=0;i<keys.length;i++){
      try{
        var v = localStorage.getItem(keys[i]);
        if (v && !isPlaceholder(v) && v.length>40) return {text:v, source:"localStorage:"+keys[i]};
      }catch(e){}
    }
    // scan any likely keys
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
    var wrap=document.createElement("div"); wrap.className="ng-sv6-box";
    var h=document.createElement("h4");
    var l=document.createElement("span"); l.textContent=title;
    var b=document.createElement("button"); b.className="ng-sv6-copy"; b.type="button"; b.textContent="Copy";
    b.addEventListener("click", function(){
      var txt = asList ? (content||[]).join("\\n") : safe(content);
      copyText(txt);
      b.textContent="Copied"; setTimeout(function(){ b.textContent="Copy"; }, 600);
    }, false);
    h.appendChild(l); h.appendChild(b); wrap.appendChild(h);

    if (asList){
      var ul=document.createElement("ul"); ul.className="ng-sv6-ul";
      for (var i=0;i<(content||[]).length;i++){ var li=document.createElement("li"); li.textContent=content[i]; ul.appendChild(li); }
      wrap.appendChild(ul);
    } else {
      var pre=document.createElement("pre"); pre.className="ng-sv6-pre"; pre.textContent=safe(content||""); wrap.appendChild(pre);
    }
    return wrap;
  }

  function render(rawText, src){
    var body=qs("#ng-sv6-body"); if(!body) return;
    body.innerHTML="";

    var debugOn = !!qs("#ng-sv6-debug")?.checked;

    var r = normalizeInputToSections(rawText||"");
    var s = r.sections || {};

    var card=document.createElement("div"); card.className="ng-sv6-seg";
    var h3=document.createElement("h3"); h3.textContent="STORY"; card.appendChild(h3);

    var grid=document.createElement("div"); grid.className="ng-sv6-grid";
    grid.appendChild(box("Headline", s.headline||"", false));
    grid.appendChild(box("Dek", s.dek||"", false));
    grid.appendChild(box("Key Points", s.keypoints||[], true));
    grid.appendChild(box("Web Article", s.web||"", false));
    grid.appendChild(box("Video", s.video||"", false));
    if (s.hook) grid.appendChild(box("Hook", s.hook, false));

    if (debugOn){
      var dbg = r.debug || {};
      var lines = [];
      lines.push("mode: " + safe(dbg.mode||""));
      if (dbg.leaves) lines.push("leaves: strings="+dbg.leaves.str+" arrays="+dbg.leaves.arr);
      if (dbg.packPath) lines.push("packPath: " + dbg.packPath);
      if (dbg.pick){
        lines.push("picked paths:");
        for (var k in dbg.pick){ if (dbg.pick[k]) lines.push(" - " + k + " <- " + dbg.pick[k]); }
      }
      grid.appendChild(box("Debug (paths only)", lines.join("\\n"), false));
    }

    // if everything empty, show a hint
    if (!s.headline && !s.dek && (!s.keypoints || !s.keypoints.length) && !s.web && !s.video){
      var hint=document.createElement("div");
      hint.className="ng-sv6-muted";
      hint.textContent="JSON मिला लेकिन keys match नहीं हुईं. Debug ON करके 'Debug (paths only)' copy करके भेज दें—मैं exact mapping lock कर दूँगा।";
      body.appendChild(hint);
    }

    card.appendChild(grid);
    body.appendChild(card);

    qs("#ng-sv6-source").textContent = "Source: " + (src||"auto");
    qs("#ng-sv6-status").textContent = "Updated @ " + new Date().toLocaleTimeString() + " (JSON→Text V6)";
  }

  function openModal(){ var m=qs("#ng-sv6-modal"); if(m) m.style.display="block"; }
  function closeModal(){ var m=qs("#ng-sv6-modal"); if(m) m.style.display="none"; }

  function refresh(){
    var picked = pickFromLocalStorage() || pickFromDOM() || {text:"", source:"none"};
    render(picked.text||"", picked.source||"none");
  }

  qs("#ng-sv6-close")?.addEventListener("click", closeModal, false);
  qs("#ng-sv6-refresh")?.addEventListener("click", refresh, false);
  qs("#ng-sv6-debug")?.addEventListener("change", refresh, false);

  var modal=qs("#ng-sv6-modal");
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

  console.log("[STORY_VIEW_V6] ready");
})();
</script>
$end
"@

# Remove old STORY_VIEW blocks (V1..V6) then insert V6
$rxAny='(?is)<!--\s*NG_PATCH:\s*STORY_VIEW_V[123456]\s*-->(.*?)<!--\s*/NG_PATCH:\s*STORY_VIEW_V[123456]\s*-->'
$html2=[regex]::Replace($html,$rxAny,"",1)

if ($html2 -match '(?is)</body\s*>'){
  $out=[regex]::Replace($html2,'(?is)</body\s*>',"$block`r`n</body>",1)
} else {
  $out=$html2 + "`r`n" + $block + "`r`n"
}

WriteUtf8NoBom $full $out
Write-Host "✅ STORY_VIEW_V6 installed" -ForegroundColor Green
Write-Host "Backup: $bak" -ForegroundColor Cyan
