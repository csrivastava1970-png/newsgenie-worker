/* NG_TOOLBAR_ACTIONS_MIN_V1 (2026-02-07)
   Minimal working actions module (replaces stub).
   Ensures Generate button is enabled and provides attach hooks.
*/
(function(){
  try {
    window.NG_TOOLBAR_ACTIONS_STUB = false;

    function enableGenerate(){
      try {
        var btn = document.getElementById("btnGenerate");
        if (btn) btn.disabled = false;
      } catch(e){}
    }

    // Public hooks expected by other scripts
    window.NG_attachToolbarActions = function(){
      enableGenerate();
      return true;
    };

    window.NG_attachMiniToolbarActions = function(){
      enableGenerate();
      return true;
    };

    // run once on DOM ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function(){
        enableGenerate();
      }, { once:true });
    } else {
      enableGenerate();
    }

  } catch(e) {}
/* === NG_LOCAL_EXPORT_WIRE_V1_START (20260219) === */
try{
window.__NG_LOCAL_EXPORT_MARKER = "wire_v1_ran";
console.log("[NG] local-export wire block entered");

try{ var b = document.getElementById("btnLocalExport"); if (b) b.disabled = false; }catch(e){}
try{ NG_wireLocalExportUI(); }catch(e){}



  function NG_$ (id){ return document.getElementById(id); }

  async function NG_copyText(text){
    text = String(text || "");
    try{
      if (navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(text); return true;
      }
    }catch(e){}
    try{
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position="fixed"; ta.style.left="-9999px";
      document.body.appendChild(ta); ta.focus(); ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    }catch(e){}
    return false;
  }

  function NG_showExport(msg){
    var p = NG_$("ngLocalExportPanel");
    var m = NG_$("ngLocalExportMsg");
    if (p) p.style.display = "block";
    if (m) m.textContent = String(msg || "");
  // Auto-open the parent <details> (Quick View) if collapsed, and scroll into view
  try{
    var d = (m && m.closest) ? m.closest("details") : null;
    if (d) d.open = true;
  }catch(e){}
  try{
    if (p && p.scrollIntoView) p.scrollIntoView({ behavior:"smooth", block:"start" });
  }catch(e){}

  }

  function NG_enableLocalExport(){
    var b = NG_$("btnLocalExport");
    if (b) b.disabled = false;
  }

    window.NG_localExport = async function(){
    var srcEl  = NG_$("ngLocalSrc");
    var inEl   = NG_$("ngLocalInMs");
    var startSecEl = NG_$("ngLocalStartSec");
    var durSecEl   = NG_$("ngLocalDurSec");

    var outEl  = NG_$("ngLocalOutMs");
    var slugEl = NG_$("ngLocalSlug");
    var voEl   = NG_$("ngLocalVO");

    var Src  = srcEl ? String(srcEl.value || "").trim() : "";
    var InMs = inEl ? parseInt(inEl.value, 10) : NaN;
    var OutMs= outEl ? parseInt(outEl.value, 10) : NaN;

   // NG_SEC_MODE_V2 (20260220): StartSec + DurSec override InMs/OutMs (with input guards)
var StartSec = startSecEl ? parseFloat(String(startSecEl.value || "").trim()) : NaN;
var DurSec   = durSecEl   ? parseFloat(String(durSecEl.value   || "").trim()) : NaN;

// Guards: if user touched sec fields, don't silently fall back
if (durSecEl && String(durSecEl.value || "").trim() !== "") {
  if (!Number.isFinite(DurSec) || DurSec <= 0) {
    return NG_showExport("ERROR: DurSec must be a positive number (seconds).");
  }
}
if (startSecEl && String(startSecEl.value || "").trim() !== "") {
  if (!Number.isFinite(StartSec) || StartSec < 0) {
    return NG_showExport("ERROR: StartSec must be 0 or more (seconds).");
  }
}

// Override ms only when both are valid
if (Number.isFinite(StartSec) && Number.isFinite(DurSec) && DurSec > 0) {
  InMs  = Math.max(0, Math.round(StartSec * 1000));
  OutMs = InMs + Math.round(DurSec * 1000);

  // optional: reflect computed ms back into inputs
  try{
    if (inEl) inEl.value = String(InMs);
    if (outEl) outEl.value = String(OutMs);
  }catch(e){}
}


    var Slug = slugEl ? String(slugEl.value || "").trim() : "";
    var VO   = voEl ? String(voEl.value || "").trim() : "";

    if (!Src) return NG_showExport("ERROR: Src is required (mp4 full path).");
    if (!Number.isFinite(InMs)) return NG_showExport("Please fill StartSec and Duration (DurSec).");
if (!Number.isFinite(OutMs)) return NG_showExport("Please fill StartSec and Duration (DurSec).");
    if (OutMs <= InMs) return NG_showExport("ERROR: Duration must be > 0.");

    if (!Slug) Slug = "clip";

    // Persist last-used values (permanent)
    try{
      localStorage.setItem("NG_LOCAL_EXPORT_SRC", Src);
      localStorage.setItem("NG_LOCAL_EXPORT_INMS", String(InMs));
      localStorage.setItem("NG_LOCAL_EXPORT_OUTMS", String(OutMs));
      localStorage.setItem("NG_LOCAL_EXPORT_SLUG", Slug);
      localStorage.setItem("NG_LOCAL_EXPORT_VO", VO);

      // nice-to-have: persist sec fields too
      if (Number.isFinite(StartSec)) localStorage.setItem("NG_LOCAL_EXPORT_STARTSEC", String(StartSec));
      if (Number.isFinite(DurSec)) localStorage.setItem("NG_LOCAL_EXPORT_DURSEC", String(DurSec));
    }catch(e){}

    var payload = { Src:Src, InMs:InMs, OutMs:OutMs, Slug:Slug, VO:VO };
    NG_showExport("Exporting via bridge...\n" + JSON.stringify(payload,null,2));


    var url = "http://127.0.0.1:32145/export";
    var resp, text;
    try{
      resp = await fetch(url, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
      text = await resp.text();
    }catch(e){
      return NG_showExport("BRIDGE_FETCH_FAILED:\n" + (e && e.message ? e.message : e) + "\n\nIf this is CORS, next step: CORS headers in bridge server.js");
    }

    var j=null; try{ j=JSON.parse(text); }catch(e){}
    if (!resp.ok) return NG_showExport("HTTP "+resp.status+"\n\n"+(j?JSON.stringify(j,null,2):text));
    if (!j || j.ok !== true) return NG_showExport("Bridge non-ok\n\n"+(j?JSON.stringify(j,null,2):text));

    // NG_LAST_EXPORT_PATH_SET_V2 (20260219): accept bridge {out,lastLine}
window.__NG_LAST_EXPORT_PATH = String((j && (j.out || j.lastLine)) ? (j.out || j.lastLine) : "");
try{ localStorage.setItem("NG_LAST_EXPORT_PATH", window.__NG_LAST_EXPORT_PATH); }catch(e){}
// NG_LAST_EXPORT_ROW_FILL_V1 (20260220)
try{
  var r = NG_$("ngLastExportRow");
  var t = NG_$("ngLastExportPath");
  if (t) t.textContent = String(window.__NG_LAST_EXPORT_PATH || "");
  if (r) r.style.display = (t && t.textContent) ? "block" : "none";
}catch(e){}

    var extra = (j.stderr && String(j.stderr).trim()) ? ("\n\nstderr:\n"+String(j.stderr).trim()) : "";
    NG_showExport("✅ Export OK" + extra);
  };


    

  function NG_wireLocalExportUI(){
  if (NG_wireLocalExportUI.__running) return;
  NG_wireLocalExportUI.__running = true;
  

    var b = NG_$("btnLocalExport");
    var run = NG_$("ngLocalExportRun");
    if (run && !run.__ngWired){
      run.__ngWired = true;
      run.addEventListener("click", function(ev){
        try{ ev.preventDefault(); }catch(e){}
        window.NG_localExport();
      });
 

    }

    var clr = NG_$("ngLocalExportClear");
    if (clr && !clr.__ngWired){
      clr.__ngWired = true;
      clr.addEventListener("click", function(ev){
        try{ ev.preventDefault(); }catch(e){}
        try{
          var s=NG_$("ngLocalSrc"), i=NG_$("ngLocalInMs"), o=NG_$("ngLocalOutMs"), g=NG_$("ngLocalSlug"), v=NG_$("ngLocalVO");
          if (s) s.value=""; if (i) i.value=""; if (o) o.value=""; if (g) g.value=""; if (v) v.value="";
          localStorage.removeItem("NG_LOCAL_EXPORT_SRC");
          localStorage.removeItem("NG_LOCAL_EXPORT_INMS");
          localStorage.removeItem("NG_LOCAL_EXPORT_OUTMS");
          localStorage.removeItem("NG_LOCAL_EXPORT_SLUG");
          localStorage.removeItem("NG_LOCAL_EXPORT_VO");
        }catch(e){}
        NG_showExport("(cleared)");
      });
    }

    if (b && !b.__ngWired){
      b.__ngWired = true;
      b.addEventListener("click", function(ev){ try{ev.preventDefault();}catch(e){} window.NG_localExport(); });
    }

    var c = NG_$("ngLocalExportCopyPath");
    if (c && !c.__ngWired){
      c.__ngWired = true;
      c.addEventListener("click", async function(){
        var p = String(window.__NG_LAST_EXPORT_PATH || "");
        if (!p) return NG_showExport("No export path yet.");
        var ok = await NG_copyText(p);
        NG_showExport((ok?"Copied path:\n":"Copy failed:\n")+p);
      });
    }

   var o = NG_$("ngLocalExportOpenFolder");
if (o && !o.__ngWired){
  o.__ngWired = true;
  o.addEventListener("click", async function(){
    try{
      // Prefer OutDir from saved settings; else default used by bridge
      var outDir = localStorage.getItem("NG_LOCAL_EXPORT_OUTDIR") || "C:\\Cnewsgenie_demo\\exports";

      // If we have last export path, open its folder (better UX)
      var p = String(window.__NG_LAST_EXPORT_PATH || "");
      if (p) outDir = p.replace(/[\\/][^\\/]+$/, "");

      var r = await fetch("http://127.0.0.1:32145/open-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: outDir })
      });

      var j = await r.json().catch(function(){ return {}; });
      NG_showExport((j && j.ok) ? ("Opened folder:\n" + (j.path || outDir)) : ("Open folder failed:\n" + (j.message || r.status)));
    }catch(e){
      NG_showExport("Open folder error:\n" + String(e && (e.message||e) || e));
    }
  });
}

var pl = NG_$("ngLocalExportPlay");
if (pl && !pl.__ngWired){
  pl.__ngWired = true;
  pl.addEventListener("click", async function(){
    try{
      var p = String(window.__NG_LAST_EXPORT_PATH || "");
      if (!p) return NG_showExport("No export file yet. Export first.");

      var r = await fetch("http://127.0.0.1:32145/open-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: p })
      });

      var j = await r.json().catch(function(){ return {}; });
      NG_showExport((j && j.ok) ? ("Opened file:\n" + (j.path || p)) : ("Play failed:\n" + (j.message || r.status)));
    }catch(e){
      NG_showExport("Play error:\n" + String(e && (e.message||e) || e));
    }
  });
}


  // Run once DOM ready
if (document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", function(){
    NG_enableLocalExport();
    NG_wireLocalExportUI();
    try{
      var s=NG_$("ngLocalSrc"), i=NG_$("ngLocalInMs"), o=NG_$("ngLocalOutMs"), g=NG_$("ngLocalSlug"), v=NG_$("ngLocalVO");
      if (s && !s.value) s.value = localStorage.getItem("NG_LOCAL_EXPORT_SRC") || "";
      if (i && !i.value) i.value = localStorage.getItem("NG_LOCAL_EXPORT_INMS") || "";
      if (o && !o.value) o.value = localStorage.getItem("NG_LOCAL_EXPORT_OUTMS") || "";
      if (g && !g.value) g.value = localStorage.getItem("NG_LOCAL_EXPORT_SLUG") || "";
      if (v && !v.value) v.value = localStorage.getItem("NG_LOCAL_EXPORT_VO") || "";

      // NEW: restore last export path after refresh (for Copy/Open/Play)
      try{
        var lp = localStorage.getItem("NG_LAST_EXPORT_PATH") || "";
        if (lp) window.__NG_LAST_EXPORT_PATH = lp;
// NG_LAST_EXPORT_ROW_RESTORE_V1 (20260220)
try{
  var r = NG_$("ngLastExportRow");
  var t = NG_$("ngLastExportPath");
  if (t) t.textContent = String(window.__NG_LAST_EXPORT_PATH || "");
  if (r) r.style.display = (t && t.textContent) ? "block" : "none";
}catch(e){}
      }catch(e){}
    }catch(e){}
  }, { once:true });
} else {
  NG_enableLocalExport();
  NG_wireLocalExportUI();
}
}
}catch(e){}
})();

/* === NG_LOCAL_EXPORT_WIRE_V1_END (20260219) === */



