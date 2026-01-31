/* === NG_ADD_BYTE_MULTIROW_V3_3_START (20260129) === */
(function () {
  if (window.__NG_ADD_BYTE_MULTIROW_V3_3__) return;
  window.__NG_ADD_BYTE_MULTIROW_V3_3__ = true;

  function normText(s) {
    return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  // ---------- ADD BYTE BUTTON ----------
  function matchesAddBtn(el) {
    if (!el || !el.tagName) return false;

    if (el.id === "addByteBtn") return true;
    if (el.id === "btnAddByte" || el.id === "btn-add-byte") return true;

    if (el.getAttribute && el.getAttribute("data-add-byte") === "1") return true;

    var cls = (el.className || "").toString();
    if (cls.indexOf("ng-add-byte") >= 0) return true;

    if (el.tagName === "BUTTON") {
      var t = normText(el.textContent);
      if (t === "+ add byte" || t === "add byte" || t.indexOf("add byte") >= 0) return true;
    }
    return false;
  }

  function closestAddBtn(node) {
    var cur = node;
    while (cur && cur !== document) {
      if (matchesAddBtn(cur)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }

  // ---------- REMOVE BUTTON ----------
  function matchesRemoveBtn(el) {
    if (!el || !el.tagName) return false;
    if (el.tagName !== "BUTTON") return false;

    if (el.getAttribute && el.getAttribute("data-remove-byte") === "1") return true;

    var cls = (el.className || "").toString();
    if (cls.indexOf("ng-remove-byte") >= 0) return true;
    if (cls.indexOf("danger") >= 0) return true;

    var t = normText(el.textContent);
    if (t === "remove" || t.indexOf("remove") >= 0) return true;

    return false;
  }

  function closestRemoveBtn(node) {
    var cur = node;
    while (cur && cur !== document) {
      if (matchesRemoveBtn(cur)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }

  // ---------- HOST / TEMPLATE ----------
  function findExistingByteRow() {
    var rb = document.querySelector("button.danger,[data-remove-byte],.ng-remove-byte");
    if (!rb) return null;

    var row =
      (rb.closest && (rb.closest("[data-byte-row]") || rb.closest(".ng-byte-row"))) ||
      null;

    if (row && row.querySelector && row.querySelector("textarea")) return row;

    // fallback climb until textarea found
    var p = rb.parentNode;
    while (p && p !== document) {
      if (p.querySelector && p.querySelector("textarea")) return p;
      p = p.parentNode;
    }
    return null;
  }

  function findRowsHost(btn) {
    // optional explicit override
    try {
      var sel = btn && btn.getAttribute ? btn.getAttribute("data-target") : null;
      if (sel) {
        var h = document.querySelector(sel);
        if (h) return h;
      }
    } catch (e) {}

    // if byte row exists, host = its parent
    var existingRow = findExistingByteRow();
    if (existingRow && existingRow.parentElement) return existingRow.parentElement;

    // fallback guesses
    return (
      document.getElementById("bytesWrapInner") ||
      document.getElementById("bytesWrap") ||
      document.getElementById("ng-bytes-rows") ||
      document.getElementById("bytesRows") ||
      document.querySelector("#bytesWrap .rows") ||
      document.querySelector(".bytes-rows") ||
      document.querySelector(".rows") ||
      null
    );
  }

  function stripIds(root) {
    var nodes = root.querySelectorAll("[id]");
    for (var i = 0; i < nodes.length; i++) nodes[i].removeAttribute("id");
  }

  function clearInputs(root) {
    var inputs = root.querySelectorAll("input, textarea, select");
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      if (el.tagName === "SELECT") {
        el.selectedIndex = 0;
        continue;
      }
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = false;
        continue;
      }
      if ("value" in el) el.value = "";
    }
  }

  function enableRemove(root) {
    var rb = root.querySelector("button.danger,[data-remove-byte],.ng-remove-byte");
    if (rb) {
      rb.disabled = false;
      rb.style.opacity = "1";
      rb.style.cursor = "pointer";
    }
  }

  function getDefaultQuoteText() {
    var el =
      document.querySelector("#ng-default-byte-quote") ||
      document.querySelector("#ng-byte-default-quote") ||
      document.querySelector("#defaultQuote") ||
      document.querySelector("textarea[data-default-quote]");
    if (!el) return "";
    return (el.value || "").toString();
  }

  function applyDefaultQuoteIfAny(row) {
    var txt = getDefaultQuoteText();
    if (!txt) return;
    var ta = row.querySelector("textarea");
    if (ta && !ta.value) ta.value = txt;
  }

// --- Layout normalize: move Remove after textarea (if it's before) ---
function normalizeRowLayout(row) {
  if (!row || !row.querySelector) return false;

  var ta = row.querySelector("textarea");
  if (!ta) return false;

  // Robust remove control: button OR input[type=button|submit] OR role=button
  var rb =
    row.querySelector("button.ng-byte-remove, button.danger, button.ng-remove-byte, [data-remove-byte], .ng-remove-byte") ||
    row.querySelector("input.ng-byte-remove, input.danger, input.ng-remove-byte, input[data-remove-byte], input.ng-remove-byte") ||
    null;

  if (!rb) {
    // fallback: find by visible label (textContent or value)
    var cands = row.querySelectorAll("button, input[type=button], input[type=submit], [role=button]");
    for (var i = 0; i < cands.length; i++) {
      var label = "";
      if (cands[i].tagName === "INPUT") label = (cands[i].value || "");
      else label = (cands[i].textContent || "");
      label = label.replace(/\s+/g, " ").trim().toLowerCase();
      if (label === "remove" || label.indexOf("remove") >= 0) { rb = cands[i]; break; }
    }
  }
  if (!rb) return false;

  // Try DOM move: place remove immediately after textarea (even if not same parent)
  try {
    if (ta.insertAdjacentElement) {
      ta.insertAdjacentElement("afterend", rb);
      return true;
    }
  } catch (e) {}

  // Flex/Grid visual ordering fallback: force order when in flex container
  var p = ta.parentElement;
  if (p) {
    try {
      var disp = window.getComputedStyle(p).display;
      if (disp === "flex" || disp === "inline-flex") {
        ta.style.order = "10";
        rb.style.order = "99";
        return true;
      }
    } catch (e2) {}
  }

  return false;
}
}
  }
  if (!rb) return false;

  // If textarea's parent is flex, CSS order may control visual order.
  // Force order so textarea appears before remove.
  var p = ta.parentElement;
  if (p) {
    try {
      var disp = window.getComputedStyle(p).display;
      if (disp === "flex" || disp === "inline-flex") {
        ta.style.order = "10";
        rb.style.order = "99";
        return true;
      }
    } catch (e) {}
  }

  // DOM move: place Remove immediately AFTER textarea
  try {
    if (ta.insertAdjacentElement) {
      ta.insertAdjacentElement("afterend", rb);
      return true;
    }
  } catch (e2) {}

  // Fallback: put rb into same parent as textarea, after it
  if (p) {
    if (ta.nextSibling) p.insertBefore(rb, ta.nextSibling);
    else p.appendChild(rb);
    return true;
  }

  return false;
}

function getBytesRoot() {
  // Prefer explicit containers
  var r =
    document.getElementById("bytesWrapInner") ||
    document.getElementById("bytesWrap") ||
    document.querySelector('[data-ng-sec="bytes"]') ||
    null;

  if (r) return r;

  // Fallback: find first Remove control anywhere, then climb to a panel
  var any = Array.from(document.querySelectorAll("button, input[type=button], input[type=submit], [role=button]"))
    .find(function (el) {
      var label = (el.tagName === "INPUT") ? (el.value || "") : (el.textContent || "");
      label = label.replace(/\s+/g, " ").trim().toLowerCase();
      return (label === "remove" || label.indexOf("remove") >= 0);
    });

  if (!any) return null;

  return (any.closest && (any.closest("#bytesWrapInner") || any.closest("#bytesWrap") || any.closest('[data-ng-sec="bytes"]') || any.closest(".panel"))) || null;
}

function normalizeAllRows() {
  var root = getBytesRoot();
  if (!root) return;

  var rows = root.querySelectorAll("[data-byte-row], .ng-byte-row, .row");
  for (var i = 0; i < rows.length; i++) normalizeRowLayout(rows[i]);
}
// Expose for console debug (safe)
window.__NG_BYTES_NORM__ = {
  all: normalizeAllRows
};

function installNormalizeObserver() {
  if (window.__NG_BYTES_NORM_OBS__) return;

  var wrap = getBytesRoot();
  if (!wrap) return;

  var timer = null;
  var obs = new MutationObserver(function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      try { normalizeAllRows(); } catch (e) {}
    }, 50);
  });

  obs.observe(wrap, { childList: true, subtree: true });
  window.__NG_BYTES_NORM_OBS__ = obs;
}
catch (e) {}
    }, 50);
  });

  obs.observe(wrap, { childList: true, subtree: true });
  window.__NG_BYTES_NORM_OBS__ = obs;
}
function addRow(btn) {
    var host = findRowsHost(btn);
    if (!host) return { ok: false, reason: "no_host" };

    // template = an existing byte row (best)
    var tpl = findExistingByteRow();

    // fallback: any child with textarea
    if (!tpl) {
      var cands = host.querySelectorAll("div, section, article, li");
      for (var i = 0; i < cands.length; i++) {
        if (cands[i].querySelector && cands[i].querySelector("textarea")) {
          tpl = cands[i];
          break;
        }
      }
    }
    if (!tpl) return { ok: false, reason: "no_template" };

    var row = tpl.cloneNode(true);
    stripIds(row);
    clearInputs(row);
    enableRemove(row);
    applyDefaultQuoteIfAny(row);

    host.appendChild(row);
normalizeRowLayout(row);


    var f = row.querySelector("textarea, input");
    if (f && f.focus) f.focus();

    try {
      document.dispatchEvent(new CustomEvent("ng:byte-row-added", { detail: { row: row } }));
    } catch (e) {}

    return { ok: true };
  }

  function findRowFromRemoveButton(rb) {
    if (!rb) return null;

    // try closest markers first
    var row = (rb.closest && (rb.closest("[data-byte-row]") || rb.closest(".ng-byte-row"))) || null;
    if (row) return row;

    // fallback: climb until we find a container with textarea
    var p = rb.parentNode;
    var steps = 0;
    while (p && p !== document && steps < 12) {
      if (p.querySelector && p.querySelector("textarea")) return p;
      p = p.parentNode;
      steps++;
    }
    return null;
  }

  function handleRemove(ev, rb) {
    // restrict removal to within bytes host so we don't kill other "Remove" buttons elsewhere
    var addBtn = document.getElementById("addByteBtn") || rb; // fallback
    var host = findRowsHost(addBtn);
    if (host && !host.contains(rb)) {
      return false;
    }

    var row = findRowFromRemoveButton(rb);
    if (!row) return false;

    if (row.parentNode) row.parentNode.removeChild(row);

    try {
      document.dispatchEvent(new CustomEvent("ng:byte-row-removed", { detail: { row: row } }));
    } catch (e) {}

    return true;
  }

  // Delegated click handler (capture=true)
  document.addEventListener(
    "click",
    function (ev) {
      // 1) Remove
      var rb = closestRemoveBtn(ev.target);
      if (rb) {
        var did = handleRemove(ev, rb);
        if (did) {
          ev.preventDefault();
          if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
          ev.stopPropagation();
        }
        return;
      }

      // 2) Add Byte
      var btn = closestAddBtn(ev.target);
      if (!btn) return;

      var res = addRow(btn);
      if (res.ok) {
        ev.preventDefault();
        if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
        ev.stopPropagation();
      }
    },
    true
  );
installNormalizeObserver();
normalizeAllRows();

console.log("[NG_ADD_BYTE_MULTIROW_V3_3] installed");
})();
/* === NG_ADD_BYTE_MULTIROW_V3_3_END === */




