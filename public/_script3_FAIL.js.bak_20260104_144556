
/* Patch Override ... */




<script>
/* ============================
   SAVE_CAPTURE DIGIPACK V1.1 (SAFE LAST-BODY INSERT)
   - Taps fetch(/api/digi-pack) to capture latest generated output
   - On Save Draft: saves into NG_DRAFTS[last].story.digipack.raw / .blocks
   ============================ */
(function(){
  if (window.__NG_SAVE_CAPTURE_DIGIPACK_V11) return;
  window.__NG_SAVE_CAPTURE_DIGIPACK_V11 = true;

  var LS_KEY = "NG_DRAFTS";

  function s(x){ return (x==null) ? "" : String(x); }
  function j(txt){ try { return JSON.parse(txt); } catch(e){ return null; } }

  function loadDrafts(){
    var a = j(localStorage.getItem(LS_KEY) || "[]");
    return (a && typeof a.length==="number") ? a : [];
  }
  function saveDrafts(a){
    try { localStorage.setItem(LS_KEY, JSON.stringify(a)); } catch(e){ console.warn("[SAVE_CAPTURE DIGIPACK V1.1] save fail", e); }
    try { window.NG_DRAFTS = a; } catch(e2){}
  }

  // ---------- capture latest pack ----------
  function setLastPack(raw, blocks, meta){
    raw = s(raw).trim();
    blocks = (blocks && typeof blocks==="object") ? blocks : {};
    window.__NG_LAST_PACK = {
      raw: raw,
      blocks: blocks,
      ts: new Date().toISOString(),
      meta: meta || {}
    };
    // optional mirrors (older patches used these)
    window.__NG_LAST_PACK_RAW = raw;
    window.__NG_LAST_PACK_BLOCKS = blocks;
  }

  function extractFromResponseText(txt){
    var raw = s(txt).trim();
    var obj = j(raw);
    if (!obj) return { raw: raw, blocks: {} };

    // prefer nested digipack/pack formats if present
    if (obj.digipack && obj.digipack.raw) {
      return { raw: s(obj.digipack.raw), blocks: (obj.digipack.blocks || {}) };
    }
    if (obj.pack && obj.pack.raw) {
      return { raw: s(obj.pack.raw), blocks: (obj.pack.blocks || {}) };
    }
    if (obj.data && obj.data.digipack && obj.data.digipack.raw) {
      return { raw: s(obj.data.digipack.raw), blocks: (obj.data.digipack.blocks || {}) };
    }

    // else keep full JSON as raw, best-effort blocks
    return { raw: raw, blocks: (obj.blocks || (obj.data && obj.data.blocks) || {}) };
  }

  // Tap fetch to capture /api/digi-pack output
  try{
    if (typeof window.fetch === "function" && !window.__NG_FETCH_TAP_V11) {
      window.__NG_FETCH_TAP_V11 = true;
      var _fetch = window.fetch.bind(window);
      window.fetch = function(){
        var url = arguments && arguments[0] ? arguments[0] : "";
        var urlStr = (typeof url === "string") ? url : (url && url.url ? url.url : "");
        var p = _fetch.apply(null, arguments);

        try{
          if (s(urlStr).indexOf("/api/digi-pack") !== -1 || s(urlStr).indexOf("digi-pack") !== -1) {
            p.then(function(res){
              try{
                if (!res || !res.clone) return;
                res.clone().text().then(function(txt){
                  var ex = extractFromResponseText(txt);
                  if (ex.raw && ex.raw.length > 20) {
                    setLastPack(ex.raw, ex.blocks, { via:"fetch", url:urlStr });
                    console.log("[SAVE_CAPTURE DIGIPACK V1.1] captured via fetch", { rawLen: ex.raw.length, blocksKeys: Object.keys(ex.blocks||{}).length });
                  }
                }).catch(function(){});
              }catch(e2){}
            }).catch(function(){});
          }
        }catch(e1){}

        return p;
      };
    }
  }catch(e0){}

  // Fallback probe (if fetch tap missed)
  function probePackFallback(){
    if (window.__NG_LAST_PACK && window.__NG_LAST_PACK.raw) return window.__NG_LAST_PACK;

    // try common output areas (best-effort)
    function txtOf(sel){
      var el = document.querySelector(sel);
      if (!el) return "";
      var t = (el.value != null) ? el.value : (el.textContent != null ? el.textContent : "");
      return s(t).trim();
    }
    var uiRaw =
      txtOf("#ng-output-raw") ||
      txtOf("#output-raw") ||
      txtOf("#pack-raw") ||
      txtOf("#result-raw") ||
      txtOf("#ng-pack") ||
      txtOf("#pack") ||
      txtOf("#output") ||
      "";

    if (uiRaw && uiRaw.length > 20) {
      setLastPack(uiRaw, {}, { via:"ui" });
      return window.__NG_LAST_PACK;
    }

    return { raw:"", blocks:{} };
  }

  function attachToLastDraft(){
    var drafts = loadDrafts();
    if (!drafts.length) {
      console.warn("[SAVE_CAPTURE DIGIPACK V1.1] no drafts found");
      return { ok:false, reason:"no_drafts" };
    }

    var last = drafts[drafts.length - 1];
    last.story = last.story || {};
    last.story.digipack = last.story.digipack || {};

    var pack = probePackFallback();
    last.story.digipack.raw = s(pack.raw || "");
    last.story.digipack.blocks = (pack.blocks && typeof pack.blocks==="object") ? pack.blocks : {};

    saveDrafts(drafts);

    var rawLen = s(last.story.digipack.raw).length;
    console.log("[SAVE_CAPTURE DIGIPACK V1.1] attached", { drafts:drafts.length, rawLen: rawLen, blocksKeys: Object.keys(last.story.digipack.blocks||{}).length });
    return { drafts:drafts.length, rawLen: rawLen, blocksKeys: Object.keys(last.story.digipack.blocks||{}).length };
  }

  // Bind: Save Draft button
  document.addEventListener("click", function(e){
    var t = e && e.target;
    if (!t) return;

    var p = t, hit = false;
    for (var i=0;i<6 && p;i++){
      if (p.id === "btn-save-draft") { hit = true; break; }
      p = p.parentNode;
    }
    if (!hit) return;

    setTimeout(attachToLastDraft, 250);
  }, true);

  // Debug helper
  window.NG_debugLastDraftPack = function(){
    var d = loadDrafts();
    var last = d.length ? d[d.length-1] : null;
    var raw = last && last.story && last.story.digipack ? s(last.story.digipack.raw) : "";
    var blocks = last && last.story && last.story.digipack ? (last.story.digipack.blocks || {}) : {};
    return { drafts: d.length, rawLen: raw.length, blocksType: typeof blocks, blocksKeys: Object.keys(blocks).length, hasLastPack: !!(window.__NG_LAST_PACK && window.__NG_LAST_PACK.raw) };
  };

  console.log("[SAVE_CAPTURE DIGIPACK V1.1] BOOT");
})();
