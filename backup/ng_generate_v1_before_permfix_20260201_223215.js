/* === NG_GENERATE_MIN_V1_START (20260201) ===
   Purpose: minimal front-end wiring so "Generate" can hit /api/digi-pack.
   This is a recovery stub, safe even if UI selectors change.
=== */

(function(){
  if (window.__NG_GENERATE_MIN_V1__) return;
  window.__NG_GENERATE_MIN_V1__ = true;

  function qs(sel){ try { return document.querySelector(sel); } catch(e){ return null; } }
  function qsa(sel){ try { return Array.from(document.querySelectorAll(sel)); } catch(e){ return []; } }

  // best-effort: find a likely "Generate" button
  function findGenerateButton(){
    // common ids/classes (adjust later if needed)
    const candidates = [
      "#ng-generate-btn",
      "#btnGenerate",
      "[data-ng-action='generate']",
      "button#generate",
      "button.ng-generate",
    ].map(qs).filter(Boolean);

    if (candidates[0]) return candidates[0];

    // fallback: any button whose text includes 'generate' (case-insensitive)
    const btns = qsa("button, input[type='button'], input[type='submit']");
    for (const b of btns){
      const t = (b.tagName==="INPUT" ? (b.value||"") : (b.textContent||"")).trim().toLowerCase();
      if (t.includes("generate")) return b;
    }
    return null;
  }

  async function callDigiPack(){
    try{
      // payload: if you already have a prompt textarea somewhere, we attempt to read it.
      const promptEl = qs("#ng-prompt") || qs("#prompt") || qs("textarea");
      const prompt = promptEl ? (promptEl.value||"") : "";

      const payload = { prompt, mode: "ui_min_v1", ts: new Date().toISOString() };

      const r = await fetch("/api/digi-pack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const ct = (r.headers.get("content-type")||"").toLowerCase();
      const text = await r.text();
      let data = text;
      if (ct.includes("application/json")){
        try { data = JSON.parse(text); } catch(e){ /* keep text */ }
      }

      console.log("[NG_GENERATE_MIN_V1] /api/digi-pack status:", r.status);
      console.log("[NG_GENERATE_MIN_V1] response:", data);
      alert("Generate call done. See Console: [NG_GENERATE_MIN_V1]");
    } catch(e){
      console.error("[NG_GENERATE_MIN_V1] error:", e);
      alert("Generate failed. See Console: [NG_GENERATE_MIN_V1]");
    }
  }

  function wire(){
    const btn = findGenerateButton();
    if (!btn){
      console.warn("[NG_GENERATE_MIN_V1] Generate button not found (will retry).");
      setTimeout(wire, 1200);
      return;
    }
    if (btn.__ngWired) return;
    btn.__ngWired = true;
    btn.addEventListener("click", (e)=>{ e.preventDefault(); callDigiPack(); });
    console.log("[NG_GENERATE_MIN_V1] Wired button:", btn);
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", wire, { once:true });
  } else {
    wire();
  }
})();
