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
})();
