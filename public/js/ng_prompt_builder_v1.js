/* NG_PROMPT_BUILDER_MIN_V1 (2026-02-07)
   Minimal working prompt builder (replaces stub).
   Reads form fields if present and returns a normalized payload.
*/
(function(){
  try {
    window.NG_PROMPT_BUILDER_STUB = false;

    function val(id){
      try {
        var el = document.getElementById(id);
        if (!el) return "";
        return (el.value == null ? "" : String(el.value)).trim();
      } catch(e){ return ""; }
    }

    // Build payload for /api/digi-pack
    window.NG_buildPrompt = function(extra){
  // === NG_VISUALS_NOTES_WIRE_V1_START (20260217) ===
  // Pull fallback visuals/video notes and append to prompt so model can use marker plan.
  try {
    var __ngVisTa = document.getElementById("ng-visuals-notes");
    var __ngVisNotes = __ngVisTa ? String(__ngVisTa.value || "").trim() : "";
    if (__ngVisNotes) {
      extra = extra || {};
      // Put it in extra so downstream builder can include it cleanly
      extra.visuals_notes = __ngVisNotes;
    }
  } catch(e) {}
  // === NG_VISUALS_NOTES_WIRE_V1_END ===

      extra = extra || {};
      var payload = {
        topic: val("topic"),
        platform: val("platform"),
        angle: val("angle"),
        sources: val("sources"),
       background: val("background"),
visuals_notes: (function(){
  try {
    var t = document.getElementById("ng-visuals-notes");
    return t ? String(t.value || "").trim() : "";
  } catch(e) { return ""; }
})()
};


      // Optional fields (only if present in DOM)
      var st = val("story_type");
      if (st) payload.story_type = st;

      var wh = val("what_happened");
      if (wh) payload.what_happened = wh;

      // Merge extra keys last (caller override)
      try {
        Object.keys(extra).forEach(function(k){
          if (extra[k] !== undefined) payload[k] = extra[k];
        });
      } catch(e){}

      return payload;
    };

    window.initPromptBuilder = window.initPromptBuilder || function(){ return true; };

    // no noisy warnings
  } catch(e) {}
})();
