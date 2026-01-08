// --- Permanent fallback: render EE suggestions if main function missing ---
window.NG_setEditorialSuggestions = window.NG_setEditorialSuggestions || function (list) {
  try {
    var wrap = document.getElementById("ee-list");
    if (!wrap) { console.warn("[PATCH] ee-list not found"); return; }

    wrap.innerHTML = "";
    var arr = Array.isArray(list) ? list : [];

    for (var i = 0; i < arr.length; i++) {
      var it = arr[i] || {};
      var speaker = (it.speaker != null) ? String(it.speaker) : "";
      var desig = (it.designation != null) ? String(it.designation) : "";
      var text = (it.text != null) ? String(it.text) : "";

      var lab = document.createElement("label");
      lab.style.display = "flex";
      lab.style.gap = "8px";
      lab.style.alignItems = "flex-start";

      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.dataset.speaker = speaker;
      cb.dataset.designation = desig;
      cb.dataset.text = text;

      var sp = document.createElement("span");
      sp.textContent =
        (speaker ? speaker : "—") +
        (desig ? (" (" + desig + ")") : "") +
        (text ? (": " + text) : "");

      lab.appendChild(cb);
      lab.appendChild(sp);
      wrap.appendChild(lab);
    }

    try { if (typeof window.syncEePushBtn === "function") window.syncEePushBtn(); } catch (e) { }
  } catch (e2) {
    console.warn("[PATCH] render failed", e2);
  }
};

(function () {
  var FLAG = "__NG_TRANSCRIPT_HOOK_V1__";
  if (window[FLAG]) return;
  window[FLAG] = true;

  // Safe stub: prevents ReferenceError in older ingest code
  window.syncEePushBtn = window.syncEePushBtn || function () {
    try {
      var btn = document.getElementById("ee-push") || document.querySelector("[data-ee-push]");
      var list = document.getElementById("ee-list");
      if (!btn || !list) return;
      var checked = list.querySelectorAll('input[type="checkbox"]:checked').length;
      btn.disabled = (checked === 0);
    } catch (e) { }
  };

  // --- Keep "Push selected to Bytes" in sync with checkbox selection ---
  function __NG_bindEeSyncOnce() {
    try {
      var list = document.getElementById("ee-list");
      if (!list || list.__SYNC_BOUND) return;
      list.__SYNC_BOUND = true;

      list.addEventListener("change", function () {
        try { if (typeof window.syncEePushBtn === "function") window.syncEePushBtn(); } catch (e) { }
      });

      try { if (typeof window.syncEePushBtn === "function") window.syncEePushBtn(); } catch (e2) { }
    } catch (e3) { }
  }

  __NG_bindEeSyncOnce();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __NG_bindEeSyncOnce, { once: true });
  }

  function installHookOnce() {
    var d = Object.getOwnPropertyDescriptor(window, "NG_TRANSCRIPT");

    if (d && (typeof d.get === "function" || typeof d.set === "function")) return true;

    if (d && d.configurable === false) {
      console.warn("[PATCH] NG_TRANSCRIPT not configurable; cannot hook");
      return true;
    }

    var _t = (d && ("value" in d)) ? d.value : window.NG_TRANSCRIPT;

    Object.defineProperty(window, "NG_TRANSCRIPT", {
      configurable: true,
      enumerable: true,
      get: function () { return _t; },
      set: function (v) {
        _t = v;
        try {
          if (typeof window.NG_ingestTranscript === "function") {
            window.NG_ingestTranscript(v, "setter_patch");
          } else {
            window.NG_setEditorialSuggestions([{ speaker: "", designation: "", text: String(v || "") }]);
          }
        } catch (e2) {
          console.warn("[PATCH] ingest failed", e2);
        }
      }
    });

    console.log("[PATCH] NG_TRANSCRIPT hook installed OK");
    return true;
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    var done = installHookOnce();
    if (done || tries >= 40) clearInterval(timer);
  }, 250);
})();

// --- EE → BYTES: make "Push selected to Bytes" work (permanent) ---
window.pushSelectedToBytes = window.pushSelectedToBytes || function () {
  try {
    var list = document.getElementById("ee-list");
    if (!list) { console.warn("[EE→BYTES] ee-list missing"); return; }

    var checked = list.querySelectorAll('input[type="checkbox"]:checked');
    if (!checked || !checked.length) { console.warn("[EE→BYTES] nothing selected"); return; }

    var addBtn = document.getElementById("addByteBtn");

    function qAll(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
    function norm(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

    function getTextFieldList() {
      return qAll('input[name="byte_text[]"], textarea[name="byte_text[]"]');
    }

    function ensureRow() {
      var sp = qAll('input[name="byte_speaker[]"]');
      var ds = qAll('input[name="byte_designation[]"]');
      var tx = getTextFieldList();

      for (var i = 0; i < sp.length; i++) {
        var spv = norm(sp[i].value);
        var dsv = ds[i] ? norm(ds[i].value) : "";
        var txv = tx[i] ? norm(tx[i].value) : "";
        if (!spv && !dsv && (!tx[i] || !txv)) return i;
      }

      if (addBtn) addBtn.click();

      sp = qAll('input[name="byte_speaker[]"]');
      return sp.length ? (sp.length - 1) : -1;
    }

    function setField(el, val) {
      if (!el) return;
      el.value = val;
      try { el.dispatchEvent(new Event("input", { bubbles: true })); } catch (e) { }
      try { el.dispatchEvent(new Event("change", { bubbles: true })); } catch (e2) { }
    }

    function parseFrom(cb) {
      var speaker = norm(cb.dataset.speaker || "");
      var desig = norm(cb.dataset.designation || "");
      var text = norm(cb.dataset.text || "");

      if (speaker || desig || text) return { speaker: speaker, designation: desig, text: text };

      var label = cb.closest ? cb.closest("label") : null;
      var raw = norm(label ? label.textContent : "");
      var before = raw, after = "";
      var idx = raw.indexOf(":");
      if (idx >= 0) { before = norm(raw.slice(0, idx)); after = norm(raw.slice(idx + 1)); }

      var s = before, d = "";
      var m = before.match(/^(.+?)\s*\((.+?)\)\s*$/);
      if (m) { s = norm(m[1]); d = norm(m[2]); }

      return { speaker: norm(s), designation: norm(d), text: norm(after) };
    }

    var pushed = 0;

    for (var k = 0; k < checked.length; k++) {
      var cb = checked[k];
      var item = parseFrom(cb);

      var row = ensureRow();
      if (row < 0) { console.warn("[EE→BYTES] no byte row available"); break; }

      var spL = qAll('input[name="byte_speaker[]"]');
      var dsL = qAll('input[name="byte_designation[]"]');
      var txL = getTextFieldList();

      setField(spL[row], item.speaker || "");
      if (dsL[row]) setField(dsL[row], item.designation || "");
      if (txL[row]) setField(txL[row], item.text || "");

      cb.checked = false;
      pushed++;
    }

    try { if (typeof window.syncEePushBtn === "function") window.syncEePushBtn(); } catch (e3) { }
    console.log("[EE→BYTES] pushed =", pushed);
  } catch (e) {
    console.warn("[EE→BYTES] failed", e);
  }
};

(function __NG_bindEePushOnce() {
  try {
    var btn = document.getElementById("ee-push");
    if (!btn || btn.__NG_PUSH_BOUND) return;
    btn.__NG_PUSH_BOUND = true;

    btn.addEventListener("click", function (e) {
      try { e.preventDefault(); } catch (x) { }
      window.pushSelectedToBytes();
    });

    console.log("[EE→BYTES] ee-push bound");
  } catch (e) { }
})();
