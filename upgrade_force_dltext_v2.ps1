$ErrorActionPreference="Stop"
$path="public\index.html"
if (!(Test-Path $path)) { throw "NOT FOUND: $path" }

# Backup
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $path ("public\index_backup_before_force_dltext_v2_{0}.html" -f $ts) -Force

$html = Get-Content $path -Raw -Encoding UTF8

# Remove older FORCE_DLTEXT blocks (V1/V2 if present)
$pat1='(?s)<!-- NG_PATCH: FORCE_DLTEXT_V1 -->.*?<!-- /NG_PATCH: FORCE_DLTEXT_V1 -->\s*'
$pat2='(?s)<!-- NG_PATCH: FORCE_DLTEXT_V2 -->.*?<!-- /NG_PATCH: FORCE_DLTEXT_V2 -->\s*'
$html = [regex]::Replace($html, $pat1, "")
$html = [regex]::Replace($html, $pat2, "")

# Insert right after <body ...> so it registers ASAP
$m = [regex]::Match($html, '(?is)<body\b[^>]*>')
if (!$m.Success) { throw "No <body> tag found" }
$pos = $m.Index + $m.Length

$patch = @"
<!-- NG_PATCH: FORCE_DLTEXT_V2 -->
<script>
(function(){
  if (window.__NG_FORCE_DLTEXT_V2) return;
  window.__NG_FORCE_DLTEXT_V2 = true;
  window.__NG_FORCE_DLTEXT_HITS = 0;

  function S(v){ return (v==null) ? "" : String(v); }
  function T(s){ return S(s).replace(/^\s+|\s+$/g,""); }
  function A(a){ return Array.isArray(a) ? a : []; }
  function slug(s){
    s = T(s).toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g,"_").replace(/^_+|_+$/g,"");
    return s || "story";
  }

  function lsGet(key, fb){
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fb; }
    catch(e){ return fb; }
  }

  function closestBtn(node){
    while(node && node !== document){
      var tn = (node.tagName || "").toUpperCase();
      if (tn === "BUTTON" || tn === "A") return node;
      node = node.parentNode;
    }
    return null;
  }

  function pickGenerated(obj){
    if (!obj) return null;
    if (obj.generated && (obj.generated.headline || obj.generated.web_article_500_600 || obj.generated.vo_lines)) return obj.generated;
    if (obj.headline || obj.web_article_500_600 || obj.vo_lines || obj.shot_plan) return obj;
    return null;
  }

  function extractGeneratedFromDraft(draft){
    var story = (draft && draft.story) ? draft.story : {};
    var dp = story.digipack || {};
    var blocks = dp.blocks || null;

    var g = pickGenerated(blocks) || (blocks && pickGenerated(blocks.generated)) || null;
    if (g) return g;

    var raw = S(dp.raw || story.full_digipack || "");
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        g = pickGenerated(parsed) || (parsed && pickGenerated(parsed.generated)) || null;
        if (g) return g;
      } catch(e) {}
    }
    return null;
  }

  function formatSegments(gen){
    if (!gen) return "(No generated pack found. Generate then Save Draft.)";
    var out = [];
    out.push("DIGIPACK (SEGMENTS)");
    out.push("--------------------------------");
    if (gen.headline) out.push("HEADLINE: " + T(gen.headline));
    if (gen.dek) out.push("DEK: " + T(gen.dek));

    var bp = A(gen.bullet_points).map(T).filter(Boolean);
    if (bp.length){
      out.push(""); out.push("KEY POINTS"); out.push("--------------------------------");
      for (var i=0;i<bp.length;i++) out.push("- " + bp[i]);
    }

    if (gen.web_article_500_600){
      out.push(""); out.push("WEB ARTICLE (500–600)"); out.push("--------------------------------");
      out.push(T(gen.web_article_500_600));
    }

    out.push(""); out.push("VIDEO"); out.push("--------------------------------");
    if (gen.video_hook) out.push("HOOK: " + T(gen.video_hook));

    var vo = A(gen.vo_lines).map(T).filter(Boolean);
    if (vo.length){
      out.push(""); out.push("VO LINES");
      for (var j=0;j<vo.length;j++) out.push("• " + vo[j]);
    }

    var sp = A(gen.shot_plan);
    if (sp.length){
      out.push(""); out.push("SHOT PLAN");
      for (var k=0;k<sp.length;k++){
        var s = sp[k] || {};
        out.push((k+1)+". "+T(s.shot_type||"")+(s.what_to_show?(" | "+T(s.what_to_show)):"")+(s.notes?(" | "+T(s.notes)):""));
      }
    }

    out.push(""); out.push("SOCIAL"); out.push("--------------------------------");
    if (gen.social_caption) out.push("CAPTION: " + T(gen.social_caption));
    if (gen.social_script_20_30) out.push("SCRIPT (20–30s): " + T(gen.social_script_20_30));
    var ht = A(gen.hashtags).map(T).filter(Boolean);
    if (ht.length) out.push("HASHTAGS: " + ht.join(" "));

    out.push(""); out.push("YOUTUBE (AUTO)"); out.push("--------------------------------");
    var ytTitle = T(gen.video_hook || gen.headline || "");
    var ytDesc  = T(gen.web_article_500_600 || "");
    if (ytDesc.length > 600) ytDesc = ytDesc.slice(0,600) + "...";
    var ytTags = ht.length ? ht.map(function(x){ return T(x).replace(/^#/,""); }).filter(Boolean).join(", ") : "";
    out.push("TITLE: " + ytTitle);
    if (ytDesc) out.push("DESCRIPTION: " + ytDesc);
    if (ytTags) out.push("TAGS: " + ytTags);

    return out.join("\n").replace(/\\n/g,"\n");
  }

  function getDraft(){
    var drafts = lsGet("NG_DRAFTS", []);
    if (!drafts.length) return {drafts:drafts, idx:null, draft:null};

    // best effort: selected row, else last
    var idx = null;
    var sel = document.querySelector('[data-draft-index].selected') ||
              document.querySelector('[data-draft-idx].selected') ||
              document.querySelector('[aria-selected="true"][data-draft-index]') ||
              document.querySelector('[aria-selected="true"][data-draft-idx]');
    if (sel && sel.getAttribute){
      var v = sel.getAttribute("data-draft-index") || sel.getAttribute("data-draft-idx");
      var n = parseInt(v,10);
      if (!isNaN(n)) idx = n;
    }
    if (idx==null || idx<0 || idx>=drafts.length) idx = drafts.length-1;

    return {drafts:drafts, idx:idx, draft:drafts[idx]};
  }

  function downloadTxt(){
    var g = getDraft();
    if (!g.draft) return alert("No drafts found");
    var gen = extractGeneratedFromDraft(g.draft);
    var txt = formatSegments(gen);

    var headline = (gen && gen.headline) ? T(gen.headline) : "story";
    var fname = "SEGMENTED__" + Date.now() + "__" + slug(headline) + ".txt";

    var blob = new Blob([txt], {type:"text/plain;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = fname;
    document.body.appendChild(a); a.click();
    setTimeout(function(){
      try{ URL.revokeObjectURL(url); }catch(e){}
      try{ document.body.removeChild(a); }catch(e2){}
    }, 200);

    console.log("[FORCE_DLTEXT_V2] downloaded", {fname: fname, idx: g.idx, headline: headline});
  }

  // ✅ WINDOW capture: cannot be blocked by document capture handlers
  window.addEventListener("click", function(e){
    var btn = closestBtn(e && e.target);
    if (!btn) return;

    var id = btn.id || "";
    var txt = T(btn.textContent || "").toLowerCase();

    var hasBar = !!document.getElementById("ng-lib-bar");
    var inBar = hasBar && (function(){
      var n = btn;
      while(n && n !== document){
        if (n.id === "ng-lib-bar") return true;
        n = n.parentNode;
      }
      return false;
    })();

    if (id === "ng-lib-dl-txt" || (inBar && txt === "download txt")) {
      window.__NG_FORCE_DLTEXT_HITS++;
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      downloadTxt();
    }
  }, true);

  console.log("[FORCE_DLTEXT_V2] installed");
})();
</script>
<!-- /NG_PATCH: FORCE_DLTEXT_V2 -->
"@

$html = $html.Insert($pos, "`r`n$patch`r`n")
Set-Content -Path $path -Value $html -Encoding UTF8

Write-Host "✅ FORCE_DLTEXT_V2 installed (replaced V1) + moved after <body>" -ForegroundColor Green
Write-Host ("Backup: public\index_backup_before_force_dltext_v2_{0}.html" -f $ts) -ForegroundColor Cyan
