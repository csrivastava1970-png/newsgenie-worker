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

$start = "<!-- NG_PATCH: STORY_VIEW_V1 -->"
$end   = "<!-- /NG_PATCH: STORY_VIEW_V1 -->"

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = Join-Path (Split-Path $fullPath -Parent) ("index_backup_before_story_view_v1_{0}.html" -f $ts)
[System.IO.File]::Copy($fullPath, $backup, $true)

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
    background:#fafafa;
  }
  #ng-storyview-top strong{ font-size:14px; }
  #ng-storyview-top .btn{
    padding:7px 10px; border:1px solid #ddd; border-radius:10px; background:#fff;
    font:600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial;
    cursor:pointer;
  }
  #ng-storyview-body{ padding:12px; overflow:auto; }
  .ng-sv-seg{ border:1px solid #eee; border-radius:12px; margin:10px 0; overflow:hidden; }
  .ng-sv-seg h3{ margin:0; padding:10px 12px; font-size:13px; background:#f6f6f6; border-bottom:1px solid #eee; }
  .ng-sv-grid{ display:grid; grid-template-columns: 1fr; gap:10px; padding:10px 12px; }
  .ng-sv-box{ border:1px solid #eee; border-radius:12px; padding:10px 10px; background:#fff; }
  .ng-sv-box h4{ margin:0 0 8px 0; font-size:12px; letter-spacing:.2px; text-transform:uppercase; color:#444; display:flex; justify-content:space-between; align-items:center; gap:10px; }
  .ng-sv-copy{ padding:6px 8px; border:1px solid #ddd; border-radius:10px; background:#fff; cursor:pointer; font:600 11px/1 system-ui; }
  .ng-sv-pre{ white-space:pre-wrap; margin:0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:12px; line-height:1.35; }
  .ng-sv-ul{ margin:0; padding-left:18px; }
  .ng-sv-ul li{ margin:2px 0; }
  .ng-sv-muted{ color:#666; font-size:12px; }
</style>

<button id="ng-btn-storyview" type="button">Story View</button>

<div id="ng-storyview-modal">
  <div id="ng-storyview-card">
    <div id="ng-storyview-top">
      <div>
        <strong>Story View</strong>
        <div class="ng-sv-muted" id="ng-sv-status">Auto-parse from current output</div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <button class="btn" id="ng-storyview-refresh" type="button">Refresh</button>
        <button class="btn" id="ng-storyview-close" type="button">Close</button>
      </div>
    </div>
    <div id="ng-storyview-body"></div>
  </div>
</div>

<script>
(function(){
  try{
    if (window.__NG_STORY_VIEW_V1) return;
    window.__NG_STORY_VIEW_V1 = true;
  }catch(e){}

  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel) || []); }

  function safeText(s){ return (s==null) ? "" : String(s); }

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

  function findOutputNode(){
    var candidates = [];
    var selectors = [
      "#out","#output","#result","#pack-output","#final-output","#full-digipack",
      "textarea[name='output']","textarea[name='pack']","textarea[name='result']",
      "pre#out","pre#output","pre#result"
    ];
    for (var i=0;i<selectors.length;i++){
      var el = qs(selectors[i]);
      if (el) candidates.push(el);
    }

    // add all textareas + pre as fallback
    candidates = candidates.concat(qsa("textarea")).concat(qsa("pre"));

    // score by keywords
    var best = null, bestScore = -1;
    for (var j=0;j<candidates.length;j++){
      var n = candidates[j];
      var t = "";
      if (n.tagName === "TEXTAREA") t = safeText(n.value);
      else t = safeText(n.textContent);

      if (!t || t.length < 30) continue;

      var s = 0;
      if (t.indexOf("DIGIPACK") !== -1) s += 6;
      if (t.indexOf("HEADLINE:") !== -1) s += 6;
      if (t.indexOf("KEY POINTS") !== -1) s += 5;
      if (t.indexOf("WEB ARTICLE") !== -1) s += 5;
      if (t.indexOf("VIDEO") !== -1) s += 4;
      if (t.indexOf("FULL DIGIPACK") !== -1) s += 3;
      s += Math.min(6, Math.floor(t.length/2000)); // tiny length bonus

      if (s > bestScore){ bestScore = s; best = n; }
    }
    return best;
  }

  function getOutputText(){
    var n = findOutputNode();
    if (!n) return "";
    if (n.tagName === "TEXTAREA") return safeText(n.value);
    return safeText(n.textContent);
  }

  function norm(txt){
    txt = safeText(txt).replace(/\r\n/g,"\n").replace(/\r/g,"\n");
    return txt;
  }

  function sliceBetween(txt, startLabel, nextLabels){
    var i = txt.indexOf(startLabel);
    if (i === -1) return "";
    var from = i + startLabel.length;
    var rest = txt.slice(from);
    var cut = rest.length;

    for (var k=0;k<nextLabels.length;k++){
      var j = rest.indexOf(nextLabels[k]);
      if (j !== -1 && j < cut) cut = j;
    }
    return rest.slice(0, cut).trim();
  }

  function extractLineAfter(txt, prefix){
    var i = txt.indexOf(prefix);
    if (i === -1) return "";
    var rest = txt.slice(i + prefix.length);
    var line = rest.split("\n")[0];
    return line.trim();
  }

  function parseKeyPoints(block){
    var lines = norm(block).split("\n");
    var out = [];
    for (var i=0;i<lines.length;i++){
      var l = lines[i].trim();
      if (!l) continue;
      if (l.indexOf("-") === 0) out.push(l.replace(/^\-\s*/,"").trim());
      else out.push(l);
    }
    return out;
  }

  function parseOne(txt){
    var t = norm(txt);

    // remove common separators
    // keep content, just trim
    t = t.trim();

    var next = ["DEK:","KEY POINTS","WEB ARTICLE","VIDEO","SOCIAL","BYTES","QUICK VIEW","FULL DIGIPACK"];
    var headline = extractLineAfter(t, "HEADLINE:");
    var dek = extractLineAfter(t, "DEK:");
    var kpBlock = sliceBetween(t, "KEY POINTS", ["WEB ARTICLE","VIDEO","SOCIAL","BYTES","QUICK VIEW","FULL DIGIPACK"]);
    var webBlock = sliceBetween(t, "WEB ARTICLE", ["VIDEO","SOCIAL","BYTES","QUICK VIEW","FULL DIGIPACK"]);
    var vidBlock = sliceBetween(t, "VIDEO", ["SOCIAL","BYTES","QUICK VIEW","FULL DIGIPACK"]);
    var hook = extractLineAfter(vidBlock, "HOOK:");
    if (!hook) hook = extractLineAfter(t, "HOOK:");

    return {
      headline: headline,
      dek: dek,
      keypoints: kpBlock ? parseKeyPoints(kpBlock) : [],
      web: webBlock,
      video: vidBlock,
      hook: hook
    };
  }

  function splitSegments(txt){
    var t = norm(txt);
    var segments = [];

    // detect segmented pack header
    var isSeg = /DIGIPACK\s*\(SEGMENTS\)/i.test(t);

    // try to split by lines that look like "SEGMENT 1" etc
    var re = /^SEGMENT\s*\d+.*$/gmi;
    var matches = [];
    var m;
    while ((m = re.exec(t)) !== null){
      matches.push({ idx: m.index, title: m[0].trim() });
    }

    if (matches.length >= 1){
      for (var i=0;i<matches.length;i++){
        var start = matches[i].idx;
        var end = (i+1 < matches.length) ? matches[i+1].idx : t.length;
        var body = t.slice(start, end).trim();
        segments.push({ title: matches[i].title, body: body });
      }
      return segments;
    }

    // fallback: single segment
    segments.push({ title: isSeg ? "SEGMENTS" : "STORY", body: t });
    return segments;
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
      var txt = asList ? (content || []).join("\n") : safeText(content);
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

    if (!txt || txt.length < 30){
      var d = document.createElement("div");
      d.className = "ng-sv-muted";
      d.textContent = "No output detected yet. Generate a story, then click Refresh.";
      body.appendChild(d);
      return;
    }

    var segs = splitSegments(txt);

    for (var s=0;s<segs.length;s++){
      var seg = segs[s];
      var parsed = parseOne(seg.body);

      var card = document.createElement("div");
      card.className = "ng-sv-seg";

      var h3 = document.createElement("h3");
      h3.textContent = seg.title || ("STORY " + (s+1));
      card.appendChild(h3);

      var grid = document.createElement("div");
      grid.className = "ng-sv-grid";

      grid.appendChild(box("Headline", parsed.headline || "", false));
      grid.appendChild(box("Dek", parsed.dek || "", false));
      grid.appendChild(box("Key Points", parsed.keypoints || [], true));
      grid.appendChild(box("Web Article", parsed.web || "", false));
      grid.appendChild(box("Video (full)", parsed.video || "", false));
      if (parsed.hook) grid.appendChild(box("Video Hook", parsed.hook, false));

      // raw fallback
      grid.appendChild(box("Raw Output", seg.body || "", false));

      card.appendChild(grid);
      body.appendChild(card);
    }
  }

  function openModal(){
    var m = qs("#ng-storyview-modal");
    if (!m) return;
    m.style.display = "block";
  }
  function closeModal(){
    var m = qs("#ng-storyview-modal");
    if (!m) return;
    m.style.display = "none";
  }

  function refresh(){
    var t = getOutputText();
    render(t);
    try{
      var st = qs("#ng-sv-status");
      if (st) st.textContent = "Parsed @ " + new Date().toLocaleTimeString();
    }catch(e){}
  }

  // wiring
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

  // auto-refresh when output changes (light polling)
  var last = "";
  setInterval(function(){
    var t = getOutputText();
    if (!t) return;
    if (t !== last){
      last = t;
      // update only if modal is open
      var m = qs("#ng-storyview-modal");
      if (m && m.style.display === "block") render(t);
    }
  }, 800);

  console.log("[STORY_VIEW_V1] ready");
})();
</script>
$end
"@

# Replace existing block if present, else insert before </body>
$rx = '(?is)<!--\s*NG_PATCH:\s*STORY_VIEW_V1\s*-->(.*?)<!--\s*/NG_PATCH:\s*STORY_VIEW_V1\s*-->'
if ([regex]::IsMatch($html, $rx)) {
  $out = [regex]::Replace($html, $rx, $block, 1)
} else {
  if ($html -match '(?is)</body\s*>') {
    $out = [regex]::Replace($html, '(?is)</body\s*>', "$block`r`n</body>", 1)
  } else {
    $out = $html + "`r`n" + $block + "`r`n"
  }
}

WriteUtf8NoBom $fullPath $out

Write-Host "✅ STORY_VIEW_V1 installed" -ForegroundColor Green
Write-Host "Backup: $backup" -ForegroundColor Cyan
