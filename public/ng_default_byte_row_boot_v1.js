;(() => {
  if (window.__NG_DEFAULT_QUOTE_TEMPLATE_V10__) return;
  window.__NG_DEFAULT_QUOTE_TEMPLATE_V10__ = true;

  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

  function findAddBtn() {
    return qsa("button").find(b => /\badd byte\b/i.test((b.textContent||"").trim()));
  }

  function findBytesPanel(addBtn) {
    let el = addBtn;
    for (let i=0;i<16 && el;i++){
      const t = el.innerText || "";
      if (/\bBytes\b/i.test(t) && /Final Bytes/i.test(t)) return el;
      el = el.parentElement;
    }
    return addBtn.parentElement || document.body;
  }

  function ensureDefaultQuoteUI(panel){
    if (panel.querySelector("#ng-default-quote-template")) return;

    const defDesig = qsa("input", panel).find(i => /default designation/i.test(i.placeholder||""));
    const anchor = defDesig ? (defDesig.closest("div") || defDesig.parentElement) : panel;

    const wrap = document.createElement("div");
    wrap.style.marginTop = "10px";

    const lab = document.createElement("div");
    lab.textContent = "Default Quote (auto-fill)";
    lab.style.fontSize = "12px";
    lab.style.opacity = "0.85";
    lab.style.marginBottom = "6px";

    const ta = document.createElement("textarea");
    ta.id = "ng-default-quote-template";
    ta.rows = 2;
    ta.placeholder = "यहाँ default byte/quote लिखें (नई rows में auto-fill होगा)";
    ta.style.width = "100%";
    ta.style.padding = "10px";
    ta.style.border = "1px solid #ccc";
    ta.style.borderRadius = "10px";

    wrap.appendChild(lab);
    wrap.appendChild(ta);

    // insert right after Default Designation block if found, else append in panel
    if (anchor && anchor.parentElement) {
      anchor.parentElement.insertBefore(wrap, anchor.nextSibling);
    } else {
      panel.appendChild(wrap);
    }
  }

  function getDefaultQuote(panel){
    const t = panel.querySelector("#ng-default-quote-template");
    return t ? (t.value || "").trim() : "";
  }

  function fillLatestRowQuote(panel){
    // find quote field in the last created row: use the Text/Quote label area
    const rows = qsa("button", panel).filter(b => (b.textContent||"").trim().toLowerCase()==="remove");
    // locate last Remove button's nearest container and search textarea/input inside it
    const lastRm = rows[rows.length-1];
    if (!lastRm) return;

    const rowBox = lastRm.closest("div")?.parentElement || lastRm.closest("div") || panel;
    const qCtl = qsa("textarea,input", rowBox)
      .filter(x => x.tagName==="TEXTAREA" || (x.tagName==="INPUT" && ((x.type||"text")==="text")))
      .find(x => /quote|बाइट|actual/i.test((x.placeholder||"") + " " + (x.name||"") + " " + (x.id||"")));

    if (!qCtl) return;

    const dq = getDefaultQuote(panel);
    if (dq && !(qCtl.value||"").trim()) qCtl.value = dq;

    // ensure visible
    qCtl.style.display = "block";
    qCtl.style.visibility = "visible";
    qCtl.style.opacity = "1";
    qCtl.style.minHeight = (qCtl.tagName==="TEXTAREA") ? "68px" : "44px";
  }

  function boot(){
    const addBtn = findAddBtn();
    if (!addBtn) return;

    const panel = findBytesPanel(addBtn);
    ensureDefaultQuoteUI(panel);

    // Hook add button: after click, auto-fill quote (once)
    addBtn.addEventListener("click", () => {
      setTimeout(() => fillLatestRowQuote(panel), 200);
      setTimeout(() => fillLatestRowQuote(panel), 600);
    }, {capture:true});

    // Also try once on load (if a row already exists)
    setTimeout(() => fillLatestRowQuote(panel), 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
