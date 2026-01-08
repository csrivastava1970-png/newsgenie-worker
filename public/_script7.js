

// ✅ Add once: New Story button + reset handler
(function bindNewStoryOnce(){
  if (window.__NG_NEW_STORY_BOUND) return;
  window.__NG_NEW_STORY_BOUND = true;

  function clearEl(sel){
    var el = document.querySelector(sel);
    if (!el) return;
    if (el.type === "checkbox") el.checked = false;
    else el.value = "";
  }

  function clearDigiForm(){
    // common ids/names (adjust if needed)
    clearEl("#topic");              // topic input
    clearEl("#angle");              // angle input
    clearEl("#whatHappened");       // what happened textarea
    clearEl("#sources");            // sources textarea
    clearEl("#background");         // background textarea

    // if your actual fields use name=...
    clearEl('input[name="topic"]');
    clearEl('input[name="angle"]');
    clearEl('textarea[name="what_happened"]');
    clearEl('textarea[name="sources"]');
    clearEl('textarea[name="background"]');

    // clear previews
    var pre = document.getElementById("ngResponse");
    if (pre) pre.textContent = "(no response yet)";

    var qb = document.getElementById("ngQuickBody");
    if (qb) qb.innerHTML = "(no quick view)";

    // reset current draft id so next save becomes a new draft
    try { localStorage.removeItem("NG_DIGIPACK_CURRENT_ID_V1"); } catch(e){}

    // reset last response in memory
    window.__NG_LAST_API_RESPONSE = null;
  }
