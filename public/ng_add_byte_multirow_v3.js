/* === NG_ADD_BYTE_MULTIROW_V3_2_START (20260129) === */
(function () {
window.__NG_ADD_BYTE_MULTIROW_V3__ = true;

  if (window.__NG_ADD_BYTE_MULTIROW_V3_2__) return;
  window.__NG_ADD_BYTE_MULTIROW_V3_2__ = true;

  function normText(s) {
    return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function matchesAddBtn(el) {
    if (!el || !el.tagName) return false;

    // ✅ your button
    if (el.id === "addByteBtn") return true;

    // other common ids
    if (el.id === "btnAddByte" || el.id === "btn-add-byte") return true;

    // dataset markers
    if (el.getAttribute && el.getAttribute("data-add-byte") === "1") return true;

    // class hint
    var cls = (el.className || "").toString();
    if (cls.indexOf("ng-add-byte") >= 0) return true;

    // text fallback
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

  function findExistingByteRow() {
    // The “byte row” is the one that has a Remove button
    var rb = document.querySelector("button.danger,[data-remove-byte],.ng-remove-byte");
    if (!rb) return null;

    var row =
      (rb.closest && (rb.closest("[data-byte-row]") || rb.closest(".ng-byte-row") || rb.closest(".row"))) ||
      null;

    // Must have textarea (byte text)
    if (row && row.querySelector && row.querySelector("textarea")) return row;

    // fallback: climb up until we find textarea
    var p = rb.parentNode;
    while (p && p !== document) {
      if (p.querySelector && p.querySelector("textarea")) return p;
      p = p.parentNode;
    }
    return null;
  }

  function findRowsHost(btn) {
    // 1) explicit override (optional)
    try {
      var sel = btn && btn.getAttribute ? btn.getAttribute("data-target") : null;
      if (sel) {
        var h = document.querySelector(sel);
        if (h) return h;
      }
    } catch (e) {}

    // 2) if at least 1 byte row already exists, host = row.parentElement
    var existingRow = findExistingByteRow();
    if (existingRow && existingRow.parentElement) return existingRow.parentElement;

    // 3) fallback ids (best guesses)
    return (
      document.querySelector("#bytes-wrap") ||

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

 


  

  function addRow(btn) {
    var host = findRowsHost(btn);
    if (!host) {
      console.warn("[NG_ADD_BYTE_MULTIROW_V3_2] no host");
      return { ok: false, reason: "no_host" };
    }

    // template = existing byte row if present; else first textarea-containing block in host
    var tpl = findExistingByteRow();
    if (!tpl) {
      var cands = host.querySelectorAll("div, section, article, li");
      for (var i = 0; i < cands.length; i++) {
        if (cands[i].querySelector && cands[i].querySelector("textarea")) {
          tpl = cands[i];
          break;
        }
      }
    }
    if (!tpl) {
      console.warn("[NG_ADD_BYTE_MULTIROW_V3_2] no template");
      return { ok: false, reason: "no_template" };
    }

    var row = tpl.cloneNode(true);
    stripIds(row);
    clearInputs(row);
    enableRemove(row);
  

    host.appendChild(row);

    var f = row.querySelector("textarea, input");
    if (f && f.focus) f.focus();

    try {
      document.dispatchEvent(new CustomEvent("ng:byte-row-added", { detail: { row: row } }));
    } catch (e) {}

    return { ok: true };
  }

  document.addEventListener(
    "click",
    function (ev) {
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

  console.log("[NG_ADD_BYTE_MULTIROW_V3_2] installed");
})();
/* === NG_ADD_BYTE_MULTIROW_V3_2_END === */
