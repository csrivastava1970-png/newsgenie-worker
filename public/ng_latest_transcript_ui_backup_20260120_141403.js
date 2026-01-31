/* NG Latest Transcript UI wiring (safe fetch + refresh + auto-ingest) */
(function(){
  "use strict";
  var inFlight=false, lastText="";
  function $(id){ return document.getElementById(id); }
  function setUI(status, preview, isErr){
    var st=$("ng-latest-transcript-status");
    var box=$("ng-latest-transcript-preview");
    if(st){ st.textContent=status||""; st.style.color=isErr?"#b00020":""; }
    if(box){
      var t=String(preview||"").trim();
      box.textContent=t;
      box.style.display=t?"block":"none";
    }
  }
  async function fetchLatest(){
    if(inFlight) return;
    inFlight=true;
    var ctl=new AbortController();
    var timer=setTimeout(function(){ try{ctl.abort();}catch(e){} }, 3500);
    try{
      setUI("Loading...", "", false);
      var r=await fetch("/api/transcript/latest",{method:"GET",headers:{"accept":"application/json"},signal:ctl.signal});
      var ct=(r.headers.get("content-type")||"");
      var data=null;
      if(ct.indexOf("application/json")>=0) data=await r.json();
      else data={ok:r.ok,text:await r.text()};
      if(!r.ok) throw new Error("HTTP_"+r.status);
      var txt=(data&&(data.text||data.transcript||data.value))||"";
      var clean=String(txt||"").trim();
      if(clean && clean!==lastText){
        lastText=clean;
        setUI("Loaded OK", clean, false);
        try{ window.NG_TRANSCRIPT=clean; }catch(e){}
        try{ if(typeof window.NG_ingestTranscript==="function") window.NG_ingestTranscript(clean); }catch(e){}
      }else{
        setUI(clean?"No change":"Empty (no transcript)", clean, false);
      }
    }catch(e){
      var msg=(e&&e.name==="AbortError")?"Timeout":"Error: "+(e&&e.message?e.message:String(e));
      setUI(msg, "", true);
      try{ console.warn("[NG_LATEST_TRANSCRIPT]", e); }catch(_e){}
    }finally{
      clearTimeout(timer);
      inFlight=false;
    }
  }
  function wire(){
    var btn=$("btn-refresh-latest-transcript");
    if(btn && !btn.__ng_wired){
      btn.__ng_wired=true;
      btn.addEventListener("click", function(){ fetchLatest(); });
    }
    fetchLatest();
    setInterval(function(){
      try{ if(document.hidden) return; }catch(e){}
      fetchLatest();
    }, 20000);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", wire); else wire();
})();
