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
      extra = extra || {};
      var payload = {
        topic: val("topic"),
        platform: val("platform"),
        angle: val("angle"),
        sources: val("sources"),
        background: val("background")
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
