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
$backup = Join-Path (Split-Path $fullPath -Parent) ("index_backup_before_story_view_v3_{0}.html" -f $ts)
[System.IO.File]::Copy($fullPath, $backup, $true)

$start = "<!-- NG_PATCH: STORY_VIEW_V3 -->"
$end   = "<!-- /NG_PATCH: STORY_VIEW_V3 -->"

$block = @"
$start
<style>
  #ng-btn-storyview{
    position:fixed; right:16px; bottom:16px; z-index:99998;
    padding:10px 12px; border:1px solid #ddd; border-radius:10px;
    background:#111; color:#fff; font: 600 13px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial;
    cursor:pointer;
  }
  #ng-storyview-modal{ display:none; position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,.55); }
  #ng-storyview-card{
    background:#fff; width:min(1100px,96vw); height:min(92vh,96vh);
    margin:3vh auto; border-radius:14px; overflow:hidden;
    box-shadow:0 18px 60px rgba(0,0,0,.25);
    display:flex; flex-direction:column;
    font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial;
  }
  #ng-storyview-top{
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 12px; border-bottom:1px solid #eee;
    background:#fafafa; gap:10px;
  }
  #ng-storyview-top strong{ font-size:14px; }
  #ng-storyview-top .btn{
    padding:7px 10px; border:1px solid #ddd; border-radius:10px; background:#fff;
    font:600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial;
    cursor:pointer;
  }
  #ng-storyview-top .pill{
    padding:6px 10px; border:1px solid #ddd; border-radius:999px; background:#fff;
    font:600 11px/1 system-ui; color:#333;
    max-width:52vw; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  #ng-storyview-body{ padding:12px; overflow:auto; }
  .ng-sv-seg{ border:1px solid #eee; border-radius:12px; margin:10px 0; overflow:hidden; }
  .ng-sv-seg h3{ margin:0; padding:10px 12px; font-size:13px; background:#f6f6f6; border-bottom:1px solid #eee; }
  .ng-sv-grid{ display:grid; grid-template-columns: 1fr; gap:10px; padding:10px 12px; }
  .ng-sv-box{ border:1px solid #eee; border-radius:12px; padding:10px 10px; background:#fff; }
  .ng-sv-box h4{
    margin:0 0 8px 0; font-size:12px; letter-spacing:.2px; text-transform:uppercase;
    color:#444; display:flex; justify-content:space-between; align-items:center; gap:10px;
  }
  .ng-sv-copy{ padding:6px 8px; border:1px solid #ddd; border-radius:10px; background:#fff; cursor:pointer; font:600 11px/1 system-ui; }
  .ng-sv-pre{ white-space:pre-wrap; margin:0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:12px; line-height:1.35; }
  .ng-sv-ul{ margin:0; padding-left:18px; }
  .ng-sv-ul li{ margin:2px 0; }
  .ng-sv-muted{ color:#666; font-size:12px; }
</style>

<button id="ng-btn-storyview" type="button">Story View (V3)</button>

<div id="ng-storyview-modal">
  <div id="ng-storyview-card">
    <div id="ng-storyview-top">
      <div>
        <strong>Story View V3</strong>
        <div class="ng-sv-muted" id="ng-sv-status">AUTO: last download → localStorage → DOM</div>
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
  if (window.__NG_STORY_VIEW_V3) return;
  window.__NG_STORY_VIEW_V3 = true;

  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel) || []); }
  function safeText(s){ return (s==null) ? "" : String(s); }
  function norm(txt){ return safeText(txt).replace(/\\r\\n/g,"\\n").replace(/\\r/g,"\\n").trim(); }

  // --- 1) Download sniffer: capture Blob text (so UI always has latest pack) ---
  try{
    if (!window.__NG_SV3_SNIFF){
      window.__NG_SV3_SNIFF = true;
      var _origCreate = (window.URL && URL.createObjectURL) ? URL.createObjectURL.bind(URL) : null;

      if (_origCreate){
        URL.createObjectURL = function(obj){
          try{
            // sniff only blobs likely text
            if (obj && typeof Blob !== "undefined" && (obj instanceof Blob) && typeof obj.text === "function"){
              var type = safeText(obj.type || "");
              var size = obj.size || 0;
              if ((type.indexOf("text") !== -1 || type.indexOf("plain") !== -1 || type === "") && size > 120 && size < 2500000){
                obj.text().then(function(t){
                  t = safeText(t);
                  if (t && (t.indexOf("DIGIPACK") !== -1 || t.indexOf("HEADLINE:") !== -1 || t.indexOf("KEY POINTS") !== -1)){
                    try{
                      localStorage.setItem("NG_LAST_PACK_TEXT", t);
                      localStorage.setItem("NG_LAST_PACK_TS", String(Date.now()));
                    }catch(e){}
                  }
                }).catch(function(){});
              }
            }
          }catch(e){}
          return _origCreate(obj);
        };
      }
    }
  }catch(e){}

  function copyText(txt){
    txt = safeText(txt);
    try{
      if (navigator && navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).catch(function(){});
        return true;
      }
    }catch(e){}
    try{
      var ta = document.createElement("textarea");
      ta.value = txt;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    }catch(e){}
    return false;
  }

  function isValidPack(t){
    t = safeText(t);
    if (!t) return false;
    // must contain at least one strong marker
    if (t.indexOf("DIGIPACK") === -1 &&
        t.indexOf("HEADLINE:") === -1 &&
        t.indexOf("KEY POINTS") === -1 &&
        t.indexOf("WEB ARTICLE") === -1 &&
        t.indexOf("VIDEO") === -1) return false;

    // reject placeholders
    if (t.indexOf("No generated pack found") !== -1) return false;
    if (t.indexOf("Generate then Save Draft") !== -1) return false;
    if (t.length < 200) return false;

    return true;
  }

  function getFromLastDownload(){
    try{
      var t = localStorage.getItem("NG_LAST_PACK_TEXT") || "";
      if (isValidPack(t)) return { text: t, source: "localStorage:NG_LAST_PACK_TEXT" };
    }catch(e){}
    return null;
  }

  function score(t){
    t = safeText(t);
    if (!isValidPack(t)) return -999;
    var s = 0;
    if (t.indexOf("DIGIPACK (SEGMENTS)") !== -1) s += 14;
    if (t.indexOf("DIGIPACK") !== -1) s += 10;
    if (t.indexOf("HEADLINE:") !== -1) s += 8;
    if (t.indexOf("KEY POINTS") !== -1) s += 6;
    if (t.indexOf("WEB ARTICLE") !== -1) s += 6;
    if (t.indexOf("VIDEO") !== -1) s += 4;
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
        var k = keys[i];
        if (obj && typeof obj[k] === "string" && isValidPack(obj[k])) return obj[k];
      }
    }catch(e){}
    return "";
  }

  function bestFromLocalStorageScan(){
    var best = null;
    try{
      for (var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        var v = localStorage.getItem(k);
        if (!v) continue;
        var t = tryExtractFromJSON(v) || v;
        var sc = score(t);
        if (!best || sc > best.score) best = { score: sc, text: t, source: "localStorage:" + k };
      }
    }catch(e){}
    if (best && best.score > 0) return best;
    return null;
  }

  function bestFromDOM(){
    var nodes = qsa("textarea").concat(qsa("pre")).concat(qsa("code"));
    // also common ids
    var ids = ["full-digipack","pack-output","final-output","output","result","out"];
    for (var i=0;i<ids.length;i++){
      var el = qs("#"+ids[i]);
      if (el) nodes.unshift(el);
    }

    var best = null;
    for (var j=0;j<nodes.length;j++){
      var n = nodes[j];
      var t = (n && n.tagName === "TEXTAREA") ? safeText(n.value) : safeText(n ? n.textContent : "");
      var sc = score(t);
      if (!best || sc > best.score) best = { score: sc, text: t, source: "DOM:" + (n ? n.tagName : "?") + (n && n.id ? ("#"+n.id) : "") };
    }
    if (best && best.score > 0) return best;
    return null;
  }

  function getAuto(){
    // priority order
    var a = getFromLastDownload(); if (a) return a;
    var b = bestFromLocalStorageScan(); if (b) return b;
    var c = bestFromDOM(); if (c) return c;
    return { text: "", source: "none" };
  }

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
    var lines = norm(block).split("\\n");
    var out = [];
    for (var i=0;i<lines.length;i++){
      var l = lines[i].trim();
      if (!l) continue;
      if (l.indexOf("-") === 0) out.push(l.replace(/^\\-\\s*/,"").trim());
      else out.push(l);
    }
    return out;
  }
  function parseOne(txt){
    var t = norm(txt);
    var kpBlock = sliceBetween(t, "KEY POINTS", ["WEB ARTICLE","VIDEO","SOCIAL","BYTES","QUICK VIEW","FULL DIGIPACK"]);
    var webBlock = sliceBetween(t, "WEB ARTICLE", ["VIDEO","SOCIAL","BYTES","QUICK VIEW","FULL DIGIPACK"]);
    var vidBlock = sliceBetween(t, "VIDEO", ["SOCIAL","BYTES","QUICK VIEW","FULL DIGIPACK"]);
    return {
      headline: extractLineAfter(t, "HEADLINE:"),
      dek: extractLineAfter(t, "DEK:"),
      keypoints: kpBlock ? parseKeyPoints(kpBlock) : [],
      web: webBlock,
      video: vidBlock,
      hook: extractLineAfter(vidBlock, "HOOK:")
    };
  }

  function box(title, content, asList){
    var wrap = document.createElement("div");
    wrap.className = "ng-sv-box";

    var h = document.createElement("h4");
    var label = document.createElement("span");
    label.textContent = title;

    var btn = document.createElement("button");
    btn.className = "ng-sv-copy";
    btn.type = "button";
    btn.textContent = "Copy";
    btn.addEventListener("click", function(){
      var txt = asList ? (content || []).join("\\n") : safeText(content);
      copyText(txt);
      btn.textContent = "Copied";
      setTimeout(function(){ btn.textContent="Copy"; }, 600);
    }, false);

    h.appendChild(label);
    h.appendChild(btn);
    wrap.appendChild(h);

    if (asList){
      var ul = document.createElement("ul");
      ul.className = "ng-sv-ul";
      for (var i=0;i<(content||[]).length;i++){
        var li = document.createElement("li");
        li.textContent = content[i];
        ul.appendChild(li);
      }
      wrap.appendChild(ul);
    } else {
      var pre = document.createElement("pre");
      pre.className = "ng-sv-pre";
      pre.textContent = safeText(content || "");
      wrap.appendChild(pre);
    }
    return wrap;
  }

  function render(txt){
    var body = qs("#ng-storyview-body");
    if (!body) return;
    body.innerHTML = "";

    txt = norm(txt);

    if (!isValidPack(txt)){
      var d = document.createElement("div");
      d.className = "ng-sv-muted";
      d.textContent = "No real pack detected yet. Tip: Click Download TXT once, then open Story View and Refresh.";
      body.appendChild(d);
      return;
    }

    var p = parseOne(txt);

    var card = document.createElement("div");
    card.className = "ng-sv-seg";
    var h3 = document.createElement("h3");
    h3.textContent = "STORY";
    card.appendChild(h3);

    var grid = document.createElement("div");
    grid.className = "ng-sv-grid";
    grid.appendChild(box("Headline", p.headline, false));
    grid.appendChild(box("Dek", p.dek, false));
    grid.appendChild(box("Key Points", p.keypoints, true));
    grid.appendChild(box("Web Article", p.web, false));
    grid.appendChild(box("Video", p.video, false));
    if (p.hook) grid.appendChild(box("Hook", p.hook, false));
    grid.appendChild(box("Raw Output", txt, false));

    card.appendChild(grid);
    body.appendChild(card);
  }

  function openModal(){ var m = qs("#ng-storyview-modal"); if (m) m.style.display = "block"; }
  function closeModal(){ var m = qs("#ng-storyview-modal"); if (m) m.style.display = "none"; }

  function refresh(){
    var best = getAuto();
    var pill = qs("#ng-sv-source");
    if (pill) pill.textContent = "Source: " + (best.source || "none");

    var st = qs("#ng-sv-status");
    if (st) st.textContent = "AUTO picked: " + (best.source || "none") + " @ " + new Date().toLocaleTimeString();

    render(best.text || "");
  }

  var btn = qs("#ng-btn-storyview");
  var closeBtn = qs("#ng-storyview-close");
  var refreshBtn = qs("#ng-storyview-refresh");
  var modal = qs("#ng-storyview-modal");

  if (btn) btn.addEventListener("click", function(){ openModal(); refresh(); }, false);
  if (closeBtn) closeBtn.addEventListener("click", function(){ closeModal(); }, false);
  if (refreshBtn) refreshBtn.addEventListener("click", function(){ refresh(); }, false);
  if (modal){
    modal.addEventListener("click", function(e){
      if (e && e.target === modal) closeModal();
    }, false);
  }

  console.log("[STORY_VIEW_V3] ready");
})();
</script>
$end
"@

# Remove any old STORY_VIEW blocks (V1/V2/V3), then insert V3 before </body>
$rxAny = '(?is)<!--\s*NG_PATCH:\s*STORY_VIEW_V[123]\s*-->(.*?)<!--\s*/NG_PATCH:\s*STORY_VIEW_V[123]\s*-->'
$html2 = [regex]::Replace($html, $rxAny, "", 1)

if ($html2 -match '(?is)</body\s*>') {
  $out = [regex]::Replace($html2, '(?is)</body\s*>', "$block`r`n</body>", 1)
} else {
  $out = $html2 + "`r`n" + $block + "`r`n"
}

WriteUtf8NoBom $fullPath $out

Write-Host "✅ STORY_VIEW_V3 installed" -ForegroundColor Green
Write-Host "Backup: $backup" -ForegroundColor Cyan
