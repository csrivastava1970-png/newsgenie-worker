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
/* NG_FINAL_BYTES_DBLCLICK_V11_START */
;(() => {
  if (window.__NG_FINAL_BYTES_DBLCLICK_V11__) return;
  window.__NG_FINAL_BYTES_DBLCLICK_V11__ = true;

  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

  function findAddBtn(){
    return qsa("button").find(b => /\badd byte\b/i.test((b.textContent||"").trim()));
  }

  function findBytesPanel(addBtn){
    let el = addBtn;
    for(let i=0;i<18 && el;i++){
      const t = el.innerText || "";
      if (/\bBytes\b/i.test(t) && /Final Bytes/i.test(t)) return el;
      el = el.parentElement;
    }
    return addBtn.parentElement || document.body;
  }

  function rowRootFrom(node){
    let el = node;
    for(let i=0;i<12 && el;i++){
      const t = (el.innerText||"");
      const hasRemove = qsa("button", el).some(b => (b.textContent||"").trim().toLowerCase()==="remove");
      const hasLabels = /speaker name/i.test(t) && /designation/i.test(t) && /text\s*\/\s*quote/i.test(t);
      if (hasRemove && hasLabels) return el;
      el = el.parentElement;
    }
    return node.closest("div") || document.body;
  }

  function extractRowData(row){
    const inputs = qsa("input", row)
      .filter(i => (i.type||"text")==="text")
      .filter(i => !/default speaker/i.test(i.placeholder||""))
      .filter(i => !/default designation/i.test(i.placeholder||""));

    const speaker = (inputs[0]?.value || "").trim();
    const designation = (inputs[1]?.value || "").trim();

    const quoteCtl =
      qsa("textarea,input", row)
        .filter(x => x.id !== "bytesJSONOut" && x.id !== "ng-byte-draft-text")
        .find(x => /quote|बाइट|actual/i.test((x.placeholder||"") + " " + (x.name||"") + " " + (x.id||"")));

    const text = ((quoteCtl && quoteCtl.value) ? quoteCtl.value : "").trim();
    return { speaker, designation, text };
  }

  function readBytesJSON(){
    const out = document.getElementById("bytesJSONOut");
    if (!out) return { out:null, arr:[] };

    const raw = (out.value || "").trim();
    if (!raw) return { out, arr:[] };

    try{
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { out, arr: parsed };
      if (parsed && Array.isArray(parsed.bytes)) return { out, arr: parsed.bytes, wrap:"bytes" };
      return { out, arr: [] };
    }catch(e){
      return { out, arr: [] };
    }
  }

  function writeBytesJSON(out, arr, wrap){
    if (!out) return;
    const payload = wrap === "bytes" ? { bytes: arr } : arr;
    out.value = JSON.stringify(payload, null, 2);
  }

  function keyOf(b){
    return [b.speaker||"", b.designation||"", b.text||""].join("||").trim();
  }

  function ensureFinalBytesList(panel){
    const candidates = qsa("div", panel).filter(d => /Final Bytes/i.test(d.innerText||""));
    const box = candidates.sort((a,b) => (a.innerText||"").length - (b.innerText||"").length)[0] || panel;

    let list = box.querySelector("#ng-final-bytes-list-v11");
    if (!list){
      list = document.createElement("div");
      list.id = "ng-final-bytes-list-v11";
      list.style.marginTop = "8px";
      list.style.display = "flex";
      list.style.flexDirection = "column";
      list.style.gap = "8px";
      box.appendChild(list);
    }
    return { box, list };
  }

  function updateFinalBytesUI(panel, arr){
    const { box, list } = ensureFinalBytesList(panel);

    const headerNode = qsa("*", box).find(n => n.childElementCount===0 && /Final Bytes/i.test(n.textContent||""));
    if (headerNode) headerNode.textContent = "Final Bytes • " + arr.length;

    const emptyNode = qsa("*", box).find(n => n.childElementCount===0 && /\(No bytes yet\)/i.test(n.textContent||""));
    if (emptyNode && arr.length>0) emptyNode.textContent = "";

    list.innerHTML = "";
    arr.slice(0, 30).forEach((b) => {
      const item = document.createElement("div");
      item.style.padding = "8px 10px";
      item.style.border = "1px solid #e5e7eb";
      item.style.borderRadius = "10px";
      item.style.fontSize = "13px";
      const who = [b.speaker||"", b.designation||""].filter(Boolean).join(" • ");
      const txt = (b.text||"").replace(/\s+/g," ").slice(0, 220);
      item.textContent = (who ? (who + " — ") : "") + txt;
      list.appendChild(item);
    });
  }

  function toast(panel, msg){
    let t = panel.querySelector("#ng-toast-v11");
    if (!t){
      t = document.createElement("div");
      t.id = "ng-toast-v11";
      t.style.position = "sticky";
      t.style.bottom = "10px";
      t.style.marginTop = "10px";
      t.style.padding = "6px 10px";
      t.style.borderRadius = "10px";
      t.style.background = "#111827";
      t.style.color = "white";
      t.style.fontSize = "12px";
      t.style.display = "none";
      panel.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "inline-block";
    clearTimeout(t.__h);
    t.__h = setTimeout(() => { t.style.display = "none"; }, 900);
  }

  function boot(){
    const addBtn = findAddBtn();
    if (!addBtn) return;
    const panel = findBytesPanel(addBtn);

    panel.addEventListener("dblclick", (ev) => {
      const tgt = ev.target;
      if (!(tgt instanceof HTMLElement)) return;

      const isQuoteCtl =
        (tgt.tagName === "TEXTAREA" || tgt.tagName === "INPUT") &&
        !["bytesJSONOut","ng-byte-draft-text"].includes(tgt.id) &&
        /quote|बाइट|actual/i.test((tgt.getAttribute("placeholder")||"") + " " + (tgt.getAttribute("name")||"") + " " + (tgt.id||""));

      if (!isQuoteCtl) return;

      const row = rowRootFrom(tgt);
      const d = extractRowData(row);
      if (!d.text) { toast(panel, "Quote खाली है"); return; }

      const { out, arr, wrap } = readBytesJSON();
      const next = Array.isArray(arr) ? arr.slice() : [];

      const entry = { speaker: d.speaker, designation: d.designation, text: d.text };
      const k = keyOf(entry);

      const exists = next.some(x => keyOf({speaker:x.speaker, designation:x.designation, text:(x.text||x.quote||x.value||"")}) === k);
      if (!exists){
        next.push(entry);
        writeBytesJSON(out, next, wrap);
        updateFinalBytesUI(panel, next);
        toast(panel, "Added ✓ (double-click)");
      } else {
        toast(panel, "Already added");
      }
    }, true);
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 900));
  } else {
    setTimeout(boot, 900);
  }
})();
/* NG_FINAL_BYTES_DBLCLICK_V11_END */
/* NG_FINAL_BYTES_DBLCLICK_V12_START */
;(() => {
  if (window.__NG_FINAL_BYTES_DBLCLICK_V12__) return;
  window.__NG_FINAL_BYTES_DBLCLICK_V12__ = true;

  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

  function readBytesJSON(){
    const out = document.getElementById("bytesJSONOut");
    if (!out) return { out:null, arr:[] };
    const raw = (out.value || "").trim();
    if (!raw) return { out, arr:[] };
    try{
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { out, arr: parsed };
      if (parsed && Array.isArray(parsed.bytes)) return { out, arr: parsed.bytes, wrap:"bytes" };
      return { out, arr: [] };
    }catch(e){ return { out, arr: [] }; }
  }

  function writeBytesJSON(out, arr, wrap){
    if (!out) return;
    const payload = wrap === "bytes" ? { bytes: arr } : arr;
    out.value = JSON.stringify(payload, null, 2);
  }

  function keyOf(b){
    return [b.speaker||"", b.designation||"", b.text||""].join("||").trim();
  }

  function ensureFinalBytesList(){
    // Prefer existing V11 container if present
    let list = document.querySelector("#ng-final-bytes-list-v11") || document.querySelector("#ng-final-bytes-list-v12");
    if (!list){
      // attach into the first "Final Bytes" box we can find
      const box = qsa("div").find(d => /Final Bytes/i.test(d.innerText||"")) || document.body;
      list = document.createElement("div");
      list.id = "ng-final-bytes-list-v11"; // reuse v11 id to avoid duplicate UI blocks
      list.style.marginTop = "8px";
      list.style.display = "flex";
      list.style.flexDirection = "column";
      list.style.gap = "8px";
      box.appendChild(list);
    }
    return list;
  }

  function updateFinalBytesUI(arr){
    // Update header count
    const hdr = qsa("*").find(n => n.childElementCount===0 && /Final Bytes/i.test(n.textContent||""));
    if (hdr) hdr.textContent = "Final Bytes • " + arr.length;

    // Remove "(No bytes yet)" if present
    const empty = qsa("*").find(n => n.childElementCount===0 && /\(No bytes yet\)/i.test(n.textContent||""));
    if (empty && arr.length>0) empty.textContent = "";

    const list = ensureFinalBytesList();
    list.innerHTML = "";
    arr.slice(0,30).forEach(b => {
      const item = document.createElement("div");
      item.style.padding = "8px 10px";
      item.style.border = "1px solid #e5e7eb";
      item.style.borderRadius = "10px";
      item.style.fontSize = "13px";
      const who = [b.speaker||"", b.designation||""].filter(Boolean).join(" • ");
      const txt = (b.text||"").replace(/\s+/g," ").slice(0,220);
      item.textContent = (who ? (who + " — ") : "") + txt;
      list.appendChild(item);
    });
  }

  function toast(msg){
    let t = document.querySelector("#ng-toast-v11") || document.querySelector("#ng-toast-v12");
    if (!t){
      t = document.createElement("div");
      t.id = "ng-toast-v11"; // reuse v11 id
      t.style.position = "fixed";
      t.style.left = "14px";
      t.style.bottom = "14px";
      t.style.zIndex = "99999";
      t.style.padding = "6px 10px";
      t.style.borderRadius = "10px";
      t.style.background = "#111827";
      t.style.color = "white";
      t.style.fontSize = "12px";
      t.style.display = "none";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "inline-block";
    clearTimeout(t.__h);
    t.__h = setTimeout(() => { t.style.display = "none"; }, 900);
  }

  function boot(){
    const defQ = document.getElementById("ng-default-quote-template");
    if (!defQ) return;

    // Double-click on Default Quote (auto-fill) => add to Final Bytes
    defQ.addEventListener("dblclick", () => {
      const text = (defQ.value || "").trim();
      if (!text) { toast("Default Quote खाली है"); return; }

      // try reading defaults (if present)
      const bytesPanel = defQ.closest("div") || document.body;
      const speakerDefault = qsa("input", bytesPanel).find(i => /default speaker/i.test(i.placeholder||""))?.value?.trim() || "";
      const desigDefault  = qsa("input", bytesPanel).find(i => /default designation/i.test(i.placeholder||""))?.value?.trim() || "";

      const { out, arr, wrap } = readBytesJSON();
      const next = Array.isArray(arr) ? arr.slice() : [];

      const entry = { speaker: speakerDefault, designation: desigDefault, text };
      const k = keyOf(entry);
      const exists = next.some(x => keyOf({speaker:x.speaker, designation:x.designation, text:(x.text||x.quote||x.value||"")}) === k);

      if (!exists){
        next.push(entry);
        writeBytesJSON(out, next, wrap);
        updateFinalBytesUI(next);
        toast("Added ✓ (default quote)");
      } else {
        toast("Already added");
      }
    });
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 700));
  } else {
    setTimeout(boot, 700);
  }
})();
/* NG_FINAL_BYTES_DBLCLICK_V12_END */
/* NG_FINAL_BYTES_RENDER_V13_START */
;(() => {
  if (window.__NG_FINAL_BYTES_RENDER_V13__) return;
  window.__NG_FINAL_BYTES_RENDER_V13__ = true;

  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

  function readBytesJSON(){
    const out = document.getElementById("bytesJSONOut");
    if (!out) return [];
    const raw = (out.value || "").trim();
    if (!raw) return [];
    try{
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.bytes)) return parsed.bytes;
      return [];
    }catch(e){ return []; }
  }

  function findFinalBox(){
    // Find the node that literally contains "Final Bytes •"
    const leaf = qsa("*").find(n =>
      n.childElementCount===0 && /Final Bytes\s*•\s*\d+/i.test((n.textContent||"").trim())
    );
    if (!leaf) return null;

    // climb to a nice container (a bordered card-like div)
    let el = leaf;
    for (let i=0;i<10 && el;i++){
      const cs = getComputedStyle(el);
      const hasBorder = (cs.borderTopWidth !== "0px") || (cs.borderLeftWidth !== "0px");
      if (el.tagName==="DIV" && hasBorder) return el;
      el = el.parentElement;
    }
    return leaf.parentElement || null;
  }

  function ensureList(box){
    let list = box.querySelector("#ng-final-bytes-list-v13");
    if (!list){
      list = document.createElement("div");
      list.id = "ng-final-bytes-list-v13";
      list.style.marginTop = "8px";
      list.style.display = "flex";
      list.style.flexDirection = "column";
      list.style.gap = "8px";
      box.appendChild(list);
    }
    return list;
  }

  function render(){
    const box = findFinalBox();
    if (!box) return;

    const arr = readBytesJSON();

    // Update header count
    const hdr = qsa("*", box).find(n => n.childElementCount===0 && /Final Bytes/i.test(n.textContent||""));
    if (hdr) hdr.textContent = "Final Bytes • " + arr.length;

    // Remove "(No bytes yet)" if present
    const empty = qsa("*", box).find(n => n.childElementCount===0 && /\(No bytes yet\)/i.test(n.textContent||""));
    if (empty && arr.length>0) empty.textContent = "";

    const list = ensureList(box);
    list.innerHTML = "";
    arr.slice(0,30).forEach(b => {
      const item = document.createElement("div");
      item.style.padding = "8px 10px";
      item.style.border = "1px solid #e5e7eb";
      item.style.borderRadius = "10px";
      item.style.fontSize = "13px";
      const who = [b.speaker||"", b.designation||""].filter(Boolean).join(" • ");
      const txt = (b.text||"").replace(/\s+/g," ").slice(0,220);
      item.textContent = (who ? (who + " — ") : "") + txt;
      list.appendChild(item);
    });
  }

  // Re-render periodically for a short time after page load and after dblclicks
  function boot(){
    let n = 0;
    const t = setInterval(() => {
      render();
      n++;
      if (n > 10) clearInterval(t);
    }, 350);

    document.addEventListener("dblclick", () => {
      setTimeout(render, 120);
      setTimeout(render, 420);
    }, true);
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 500));
  } else {
    setTimeout(boot, 500);
  }
})();
/* NG_FINAL_BYTES_RENDER_V13_END */
/* NG_FINAL_BYTES_RENDER_V14_START */
;(() => {
  if (window.__NG_FINAL_BYTES_RENDER_V14__) return;
  window.__NG_FINAL_BYTES_RENDER_V14__ = true;

  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function findAddBtn(){
    return qsa("button").find(b => /\badd byte\b/i.test((b.textContent||"").trim()));
  }

  function findBytesPanel(addBtn){
    let el = addBtn;
    for (let i=0;i<18 && el;i++){
      const t = el.innerText || "";
      if (/\bBytes\b/i.test(t) && /Final Bytes/i.test(t)) return el;
      el = el.parentElement;
    }
    return addBtn.parentElement || document.body;
  }

  function readBytesArr(){
    const out = document.getElementById("bytesJSONOut");
    if (!out) return [];
    const raw = (out.value||"").trim();
    if (!raw) return [];
    try{
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.bytes)) return parsed.bytes;
      return [];
    }catch(e){ return []; }
  }

  function findFinalBox(bytesPanel){
    // ONLY inside Bytes panel, ignore script/style
    const nodes = qsa("div,section,details", bytesPanel)
      .filter(n => n.tagName !== "SCRIPT" && n.tagName !== "STYLE")
      .filter(n => /Final Bytes/i.test(n.innerText||""));

    // Prefer the smallest node that contains "Final Bytes" text
    const box = nodes.sort((a,b)=> (a.innerText||"").length - (b.innerText||"").length)[0] || null;

    // Climb to a bordered container if needed
    let el = box;
    for (let i=0;i<8 && el;i++){
      const cs = getComputedStyle(el);
      const hasBorder = (cs.borderTopWidth !== "0px") || (cs.borderLeftWidth !== "0px");
      if (el.tagName==="DIV" && hasBorder) return el;
      el = el.parentElement;
    }
    return box;
  }

  function ensureList(finalBox){
    let list = finalBox.querySelector("#ng-final-bytes-list-v14");
    if (!list){
      list = document.createElement("div");
      list.id = "ng-final-bytes-list-v14";
      list.style.marginTop = "8px";
      list.style.display = "flex";
      list.style.flexDirection = "column";
      list.style.gap = "8px";
      finalBox.appendChild(list);
    }
    return list;
  }

  function renderOnce(){
    const addBtn = findAddBtn();
    if (!addBtn) return {ok:false, err:"no addBtn"};

    const bytesPanel = findBytesPanel(addBtn);
    const finalBox = findFinalBox(bytesPanel);
    if (!finalBox) return {ok:false, err:"no finalBox"};

    const arr = readBytesArr();

    // Update header count inside finalBox
    const hdr = qsa("*", finalBox)
      .find(n => n.childElementCount===0 && /Final Bytes/i.test((n.textContent||"")));
    if (hdr) hdr.textContent = "Final Bytes • " + arr.length;

    // Clear "(No bytes yet)" line
    const empty = qsa("*", finalBox)
      .find(n => n.childElementCount===0 && /\(No bytes yet\)/i.test((n.textContent||"")));
    if (empty && arr.length>0) empty.textContent = "";

    const list = ensureList(finalBox);
    list.innerHTML = "";
    arr.slice(0,30).forEach(b => {
      const item = document.createElement("div");
      item.style.padding = "8px 10px";
      item.style.border = "1px solid #e5e7eb";
      item.style.borderRadius = "10px";
      item.style.fontSize = "13px";
      const who = [b.speaker||"", b.designation||""].filter(Boolean).join(" • ");
      const txt = (b.text||"").replace(/\s+/g," ").slice(0,220);
      item.textContent = (who ? (who + " — ") : "") + txt;
      list.appendChild(item);
    });

    return {ok:true, count: arr.length};
  }

  async function boot(){
    // multiple attempts because UI builds late
    for (let i=0;i<10;i++){
      const r = renderOnce();
      if (r && r.ok) break;
      await sleep(300);
    }

    // After any dblclick (your add-to-final action), re-render
    document.addEventListener("dblclick", () => {
      setTimeout(renderOnce, 120);
      setTimeout(renderOnce, 420);
    }, true);
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 500));
  } else {
    setTimeout(boot, 500);
  }
})();
/* NG_FINAL_BYTES_RENDER_V14_END */
/* NG_FINAL_BYTES_WIRE_V14A_START */
(function () {
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

  function getOutEl(){
    return document.getElementById("bytesJSONOut");
  }

  function safeParseBytes(jsonText){
    if(!jsonText) return null;
    try{
      const j = JSON.parse(jsonText);
      if (Array.isArray(j)) return j;
      if (j && Array.isArray(j.bytes)) return j.bytes;
      return null;
    }catch(e){ return null; }
  }

  function ensureState(){
    if (!window.__NG_FINAL_BYTES_STATE__) {
      const out = getOutEl();
      const existing = out ? safeParseBytes(out.value) : null;
      window.__NG_FINAL_BYTES_STATE__ = { bytes: Array.isArray(existing) ? existing : [] };
    }
    return window.__NG_FINAL_BYTES_STATE__;
  }

  function writeOut(bytes){
    const out = getOutEl();
    if(!out) return;
    out.value = JSON.stringify(bytes, null, 2);
    out.dispatchEvent(new Event("input", { bubbles:true }));
    out.dispatchEvent(new Event("change", { bubbles:true }));
  }

  function normalizeStr(s){ return (s||"").toString().trim(); }

  function extractByteFromEvent(ev){
    const t = ev && ev.target ? ev.target : null;
    if(!t) return null;

    // row/container guess (as tolerant as possible)
    const row = t.closest(".row, .ng-row, [data-byte-row], [data-ng-byte-row], #bytesWrap .row, #bytesWrapInner .row") || t.parentElement;
    const root = row || document;

    const speaker =
      normalizeStr( ( $("input[name='speaker']", root) || $("input[data-role='speaker']", root) || $("input[placeholder*='Speaker']", root) || $("input[placeholder*='स्पीकर']", root) )?.value );

    const designation =
      normalizeStr( ( $("input[name='designation']", root) || $("input[data-role='designation']", root) || $("input[placeholder*='Designation']", root) || $("input[placeholder*='पद']", root) )?.value );

    // quote: textarea OR input OR contenteditable
    let text =
      normalizeStr( ( $("textarea[name='quote']", root) || $("textarea[data-role='quote']", root) || $("textarea", root) )?.value );

    if(!text){
      text = normalizeStr( ( $("input[name='quote']", root) || $("input[data-role='quote']", root) )?.value );
    }
    if(!text && t.isContentEditable){
      text = normalizeStr(t.innerText);
    }
    if(!text && row){
      // fallback: last textarea in row
      const tas = $all("textarea", row);
      if(tas.length) text = normalizeStr(tas[tas.length-1].value);
    }

    if(!text) return null;
    return { speaker, designation, text };
  }

  function dedupePush(bytes, b){
    const key = (x)=>[normalizeStr(x.speaker), normalizeStr(x.designation), normalizeStr(x.text)].join("||");
    const k = key(b);
    if (!k || k === "||||") return bytes;
    const exists = bytes.some(x => key(x) === k);
    if(!exists) bytes.push(b);
    return bytes;
  }

  function renderNow(){
    const r = window.__NG_FINAL_BYTES_RENDER_V14__;
    if (typeof r === "function") {
      try { r(); return true; } catch(e1){}
      try { r(ensureState().bytes); return true; } catch(e2){}
    }
    return false;
  }

  // Wrap dblclick handlers (V11/V12) so AFTER dblclick we sync -> bytesJSONOut and render
  function wrap(name){
    const fn = window[name];
    if (typeof fn !== "function" || fn.__ng_wrapped_v14a__) return;

    const wrapped = function(...args){
      const ev = args && args[0] && args[0].target ? args[0] : null;
      let ret;
      try { ret = fn.apply(this, args); } catch(e){ ret = undefined; }

      try{
        const st = ensureState();
        const b = ev ? extractByteFromEvent(ev) : null;
        if (b) {
          st.bytes = dedupePush(Array.isArray(st.bytes)?st.bytes:[], b);
          writeOut(st.bytes);
        } else {
          // even if we couldn't extract, still try to render from existing state/out
          const out = getOutEl();
          const existing = out ? safeParseBytes(out.value) : null;
          if (existing && Array.isArray(existing)) {
            st.bytes = existing;
          }
        }
        renderNow();
      } catch(e) {}

      return ret;
    };

    wrapped.__ng_wrapped_v14a__ = true;
    window[name] = wrapped;
  }

  wrap("__NG_FINAL_BYTES_DBLCLICK_V11__");
  wrap("__NG_FINAL_BYTES_DBLCLICK_V12__");

  // Also: if state already exists, try an initial render
  try { ensureState(); renderNow(); } catch(e) {}
})();
 /* NG_FINAL_BYTES_WIRE_V14A_END */
/* NG_DEFAULT_QUOTE_PSEUDO_DBLCLICK_TO_FINAL_V1_START */
(function () {
  const QUOTE_ID = "ng-default-quote-template";
  const DBL_MS = 420;

  function norm(s){ return (s||"").toString().trim(); }

  function getOutEl(){ return document.getElementById("bytesJSONOut"); }

  function ensureState(){
    if (!window.__NG_FINAL_BYTES_STATE__) window.__NG_FINAL_BYTES_STATE__ = { bytes: [] };
    if (!Array.isArray(window.__NG_FINAL_BYTES_STATE__.bytes)) window.__NG_FINAL_BYTES_STATE__.bytes = [];
    return window.__NG_FINAL_BYTES_STATE__;
  }

  function writeOut(bytes){
    const out = getOutEl();
    if(!out) return;
    out.value = JSON.stringify(bytes, null, 2);
    out.dispatchEvent(new Event("input", { bubbles:true }));
    out.dispatchEvent(new Event("change", { bubbles:true }));
  }

  function renderNow(){
    const r = window.__NG_FINAL_BYTES_RENDER_V14__;
    if (typeof r === "function") {
      try { r(); return true; } catch(e1){}
      try { r(ensureState().bytes); return true; } catch(e2){}
    }
    return false;
  }

  function findSpeakerDesignation(quoteEl){
    // try within same panel first
    const root = quoteEl.closest("details, section, div") || document;

    const inputs = Array.from(root.querySelectorAll("input"));
    const speakerEl = inputs.find(i => /speaker|स्पीकर/i.test(i.placeholder||"") || /speaker/i.test(i.name||"") || i.id==="ng-default-speaker");
    const desigEl  = inputs.find(i => /designation|पद|designation\/title/i.test(i.placeholder||"") || /designation/i.test(i.name||"") || i.id==="ng-default-designation");

    const speaker = norm(speakerEl ? speakerEl.value : "");
    const designation = norm(desigEl ? desigEl.value : "");

    return { speaker, designation };
  }

  function dedupePush(bytes, b){
    const key = (x)=>[norm(x.speaker), norm(x.designation), norm(x.text)].join("||");
    const k = key(b);
    if(!k || k==="||||") return bytes;
    if(!bytes.some(x => key(x) === k)) bytes.push(b);
    return bytes;
  }

  function install(){
    const quoteEl = document.getElementById(QUOTE_ID);
    if(!quoteEl) return { ok:false, err:"QUOTE_NOT_FOUND", id: QUOTE_ID };

    // pseudo dblclick via click timing
    let lastT = 0;
    let lastTarget = null;

    quoteEl.addEventListener("click", (ev) => {
      const now = Date.now();
      const isDouble = (lastTarget === ev.target) && ((now - lastT) <= DBL_MS);
      lastT = now; lastTarget = ev.target;

      if(!isDouble) return; // only act on pseudo dblclick

      const text = norm(quoteEl.value);
      if(!text) return;

      const { speaker, designation } = findSpeakerDesignation(quoteEl);
      const st = ensureState();

      dedupePush(st.bytes, { speaker, designation, text });
      writeOut(st.bytes);
      renderNow();

      console.log("[NG] Added default quote to Final Bytes:", { speaker, designation, textHead: text.slice(0,60), count: st.bytes.length });
    }, true);

    return { ok:true, installed:true, id: QUOTE_ID, dblMs: DBL_MS };
  }

  // delayed install (in case DOM loads late)
  const t0 = Date.now();
  const timer = setInterval(() => {
    const res = install();
    if (res.ok || (Date.now()-t0)>6000) {
      clearInterval(timer);
      if(!res.ok) console.warn("[NG] default quote hook failed:", res);
      else console.log("[NG] default quote hook installed:", res);
    }
  }, 250);
})();
 /* NG_DEFAULT_QUOTE_PSEUDO_DBLCLICK_TO_FINAL_V1_END */

/* NG_FINAL_BYTES_RENDER_FALLBACK_V14B_START */
(function(){
  function norm(s){ return (s||"").toString().trim(); }

  function getOut(){
    return document.getElementById("bytesJSONOut");
  }

  function readBytes(){
    const out = getOut();
    const txt = out ? (out.value || "") : "";
    if(!txt) return [];
    try{
      const j = JSON.parse(txt);
      if(Array.isArray(j)) return j;
      if(j && Array.isArray(j.bytes)) return j.bytes;
      return [];
    }catch(e){
      return [];
    }
  }

  function findFinalPanel(){
    const nodes = Array.from(document.querySelectorAll("div,section,details"))
      .filter(n => /Final Bytes/i.test(n.innerText || ""));
    // prefer the one that has "(No bytes yet)" / "Final Bytes •"
    const scored = nodes.map(n => {
      const t = (n.innerText||"");
      let s = 0;
      if(/Final Bytes\s*•/i.test(t)) s += 3;
      if(/\(No bytes yet\)/i.test(t)) s += 2;
      if(/\bAdd\b/i.test(t) && /\bByte\b/i.test(t)) s += 1;
      return {n, s};
    }).sort((a,b)=>b.s-a.s);
    return scored[0] ? scored[0].n : (nodes[0] || null);
  }

  function ensureListHost(panel){
    if(!panel) return null;

    let host =
      panel.querySelector("#ng-final-bytes-list-auto") ||
      panel.querySelector("#ng-final-bytes-list") ||
      panel.querySelector("[data-role='final-bytes-list']");

    if(!host){
      host = document.createElement("div");
      host.id = "ng-final-bytes-list-auto";
      host.style.marginTop = "10px";
      host.style.display = "flex";
      host.style.flexDirection = "column";
      host.style.gap = "8px";
      panel.appendChild(host);
    }
    return host;
  }

  function updateCountAndEmpty(panel, count){
  if(!panel) return;

  // Update "Final Bytes • X" line (best-effort)
  const candidates = Array.from(panel.querySelectorAll("*"))
    .filter(el => /Final Bytes\s*•/i.test(el.innerText||""))
    .slice(0,5);

  if(candidates[0]){
    candidates[0].innerText = `Final Bytes • ${count}`;
  }

  // SAFE hide: सिर्फ वही element hide करो जिसकी text EXACT "(No bytes yet)" हो
  if(count > 0){
    const empties = Array.from(panel.querySelectorAll("*")).filter(el => {
      const txt = (el.innerText || "").trim();
      return txt === "(No bytes yet)";
    });
    empties.forEach(el => { el.style.display = "none"; });
  }
}

  function renderCards(host, bytes){
    host.innerHTML = "";
    bytes.forEach((b, idx) => {
      const card = document.createElement("div");
      card.style.border = "1px solid #e5e7eb";
      card.style.borderRadius = "12px";
      card.style.padding = "10px";
      card.style.background = "#fff";

      const top = document.createElement("div");
      top.style.fontSize = "12px";
      top.style.opacity = "0.75";
      top.style.marginBottom = "6px";
      const who = [norm(b.speaker), norm(b.designation)].filter(Boolean).join(" • ");
      top.textContent = who ? `#${idx+1}  ${who}` : `#${idx+1}`;
      card.appendChild(top);

      const q = document.createElement("div");
      q.style.whiteSpace = "pre-wrap";
      q.style.fontSize = "14px";
      q.textContent = norm(b.text);
      card.appendChild(q);

      host.appendChild(card);
    });
  }

  // Define/force global renderer if missing
  if (typeof window.__NG_FINAL_BYTES_RENDER_V14__ !== "function") {
    window.__NG_FINAL_BYTES_RENDER_V14__ = function(){
      const bytes = readBytes();
      const panel = findFinalPanel();
      const host = ensureListHost(panel);
      if(host) renderCards(host, bytes);
      updateCountAndEmpty(panel, bytes.length);
      return { ok:true, count: bytes.length, hostId: host ? host.id : null };
    };
  }

  // Auto-render on bytesJSONOut input/change
  const out = getOut();
  if(out && !out.__ng_v14b_bound__){
    out.__ng_v14b_bound__ = true;
    out.addEventListener("input", () => { try{ window.__NG_FINAL_BYTES_RENDER_V14__(); }catch(e){} }, true);
    out.addEventListener("change", () => { try{ window.__NG_FINAL_BYTES_RENDER_V14__(); }catch(e){} }, true);
  }

  // Initial render
  try{ window.__NG_FINAL_BYTES_RENDER_V14__(); }catch(e){}
})();
 /* NG_FINAL_BYTES_RENDER_FALLBACK_V14B_END */




/* NG_BYTES_JSONOUT_SYNC_V1_START */
(function(){
  function safeSync(){
    try{
      const st = window.__NG_FINAL_BYTES_STATE__;
      if(!st || !Array.isArray(st.bytes) || st.bytes.length===0) return;

      const out = document.getElementById("bytesJSONOut");
      if(!out) return;

      const cur = (out.value||"").trim();
      if(cur.length===0){
        out.value = JSON.stringify(st.bytes, null, 2);
        out.dispatchEvent(new Event("input", { bubbles:true }));
        out.dispatchEvent(new Event("change", { bubbles:true }));
      }
    }catch(e){}
  }

  // periodic guard (in case some other code clears it)
  setInterval(safeSync, 300);

  // quick sync after Add Byte click
  document.addEventListener("click", (ev) => {
    const t = ev && ev.target;
    if(t && (t.id === "ng-add-byte-btn-restore")){
      setTimeout(safeSync, 20);
      setTimeout(safeSync, 200);
    }
  }, true);

  // initial
  setTimeout(safeSync, 50);
})();
 /* NG_BYTES_JSONOUT_SYNC_V1_END */
/* NG_FINAL_BYTES_MOVE_MISPLACED_LIST_V1_START */
(function(){
  function findFinalPanel(){
    const nodes = Array.from(document.querySelectorAll("div,section,details"))
      .filter(n => /Final Bytes/i.test(n.innerText || ""));
    if(!nodes.length) return null;

    const scored = nodes.map(n => {
      const t = (n.innerText||"");
      let s = 0;
      if(/Final Bytes\s*•/i.test(t)) s += 5;
      if(/Add Byte/i.test(t)) s += 2;
      return {n,s};
    }).sort((a,b)=>b.s-a.s);

    return scored[0].n;
  }

  function ensureHost(panel){
    if(!panel) return null;
    let host = panel.querySelector("#ng-final-bytes-host-v1");
    if(!host){
      host = document.createElement("div");
      host.id = "ng-final-bytes-host-v1";
      host.style.marginTop = "10px";
      host.style.display = "flex";
      host.style.flexDirection = "column";
      host.style.gap = "8px";
      panel.appendChild(host);
    }
    return host;
  }

  function looksLikeFinalList(el){
    const txt = (el.innerText||"").trim();
    if(!txt) return false;
    // pattern like "#1\ntext2" or "#1 text2"
    return /^#\d+\b/m.test(txt) && txt.length < 8000;
  }

  function findMisplacedInResponse(){
    // try to find "Response" section container
    const respNodes = Array.from(document.querySelectorAll("div,section,details"))
      .filter(n => /^Response\b/i.test((n.innerText||"").trim()))
      .slice(0,2);

    const scope = respNodes[0] || document;

    // candidate blocks: div/pre/p
    const cands = Array.from(scope.querySelectorAll("div,pre,p"))
      .filter(el => looksLikeFinalList(el))
      .sort((a,b)=> (b.innerText||"").length - (a.innerText||"").length);

    return cands[0] || null;
  }

  function moveOnce(){
    const panel = findFinalPanel();
    const host = ensureHost(panel);
    if(!panel || !host) return { ok:false, err:"no_final_panel" };

    const misplaced = findMisplacedInResponse();
    if(!misplaced) return { ok:true, moved:false };

    // Move node (do not clone)
    host.appendChild(misplaced);
    misplaced.style.border = "1px solid #e5e7eb";
    misplaced.style.borderRadius = "12px";
    misplaced.style.padding = "10px";
    misplaced.style.background = "#fff";

    return { ok:true, moved:true };
  }

  // Run after Add Byte
  document.addEventListener("click", (ev) => {
    const t = ev && ev.target;
    if(t && (t.id === "ng-add-byte-btn-restore")){
      setTimeout(() => { try{ moveOnce(); }catch(e){} }, 80);
      setTimeout(() => { try{ moveOnce(); }catch(e){} }, 250);
    }
  }, true);

  // Also run on load
  setTimeout(() => { try{ moveOnce(); }catch(e){} }, 500);

  // Expose helper for manual debug
  window.__NG_MOVE_FINAL_LIST__ = moveOnce;
})();
 /* NG_FINAL_BYTES_MOVE_MISPLACED_LIST_V1_END */
/* NG_FINAL_BYTES_HOST_RELOCATE_V1_START */
(function(){
  function findFinalPanel(){
    const nodes = Array.from(document.querySelectorAll("div,section,details"))
      .filter(n => /Final Bytes/i.test(n.innerText || ""));
    if(!nodes.length) return null;

    // Prefer the panel that contains "Final Bytes •"
    const scored = nodes.map(n => {
      const t = (n.innerText||"");
      let s = 0;
      if(/Final Bytes\s*•/i.test(t)) s += 5;
      if(/Add Byte/i.test(t)) s += 2;
      return {n,s};
    }).sort((a,b)=>b.s-a.s);

    return scored[0].n;
  }

  function ensureInPanel(){
    const panel = findFinalPanel();
    if(!panel) return { ok:false, err:"no_final_panel" };

    const host = document.getElementById("ng-final-bytes-list-auto");
    if(!host) return { ok:true, moved:false, note:"no_host" };

    // If already inside panel, ok
    if(panel.contains(host)) return { ok:true, moved:false, note:"already_in_panel" };

    // Move host into panel (append at end)
    panel.appendChild(host);
    return { ok:true, moved:true, note:"moved_into_final_panel" };
  }

  // Run soon after load
  setTimeout(() => { try{ ensureInPanel(); }catch(e){} }, 400);
  setTimeout(() => { try{ ensureInPanel(); }catch(e){} }, 1200);

  // After Add Byte, relocate again
  document.addEventListener("click", (ev) => {
    const t = ev && ev.target;
    if(t && (t.id === "ng-add-byte-btn-restore")){
      setTimeout(() => { try{ ensureInPanel(); }catch(e){} }, 120);
      setTimeout(() => { try{ ensureInPanel(); }catch(e){} }, 350);
    }
  }, true);

  // Expose for manual test
  window.__NG_FINAL_BYTES_HOST_RELOCATE__ = ensureInPanel;
})();
 /* NG_FINAL_BYTES_HOST_RELOCATE_V1_END */
/* NG_FINAL_BYTES_PIN_TO_BYTESWRAP_V1_START */
(function(){
  function pin(){
    const bw = document.getElementById("bytesWrap");
    if(!bw) return { ok:false, err:"no_bytesWrap" };

    const host = document.getElementById("ng-final-bytes-list-auto");
    if(!host) return { ok:true, pinned:false, note:"no_host" };

    if(bw.contains(host)) return { ok:true, pinned:true, moved:false };

    // Move host to the end of bytesWrap (inside correct panel)
    bw.appendChild(host);
    return { ok:true, pinned:true, moved:true };
  }

  // On load + after Add Byte
  setTimeout(() => { try{ pin(); }catch(e){} }, 300);
  setTimeout(() => { try{ pin(); }catch(e){} }, 900);

  document.addEventListener("click", (ev) => {
    const t = ev && ev.target;
    if(t && (t.id === "ng-add-byte-btn-restore")){
      setTimeout(() => { try{ pin(); }catch(e){} }, 120);
      setTimeout(() => { try{ pin(); }catch(e){} }, 350);
    }
  }, true);

  window.__NG_PIN_FINAL_HOST__ = pin;
})();
 /* NG_FINAL_BYTES_PIN_TO_BYTESWRAP_V1_END */
/* NG_FINAL_BYTES_CARDS_RENDER_V1_START */
(function(){
  function norm(s){ return (s||"").toString().trim(); }

  function readBytes(){
    // prefer state
    const st = window.__NG_FINAL_BYTES_STATE__;
    if(st && Array.isArray(st.bytes) && st.bytes.length) return st.bytes;

    // fallback to bytesJSONOut
    const out = document.getElementById("bytesJSONOut");
    const txt = out ? (out.value||"").trim() : "";
    if(!txt) return [];
    try{
      const j = JSON.parse(txt);
      if(Array.isArray(j)) return j;
      if(j && Array.isArray(j.bytes)) return j.bytes;
    }catch(e){}
    return [];
  }

  function ensureHost(){
    const bw = document.getElementById("bytesWrap");
    if(!bw) return null;

    // host should exist (your pinned host)
    let host = document.getElementById("ng-final-bytes-list-auto");
    if(!host){
      host = document.createElement("div");
      host.id = "ng-final-bytes-list-auto";
      bw.appendChild(host);
    }

    // cards container inside host
    let cards = document.getElementById("ng-final-bytes-cards-v1");
    if(!cards){
      cards = document.createElement("div");
      cards.id = "ng-final-bytes-cards-v1";
      cards.style.marginTop = "10px";
      cards.style.display = "flex";
      cards.style.flexDirection = "column";
      cards.style.gap = "8px";
      host.appendChild(cards);
    }
    return { bw, host, cards };
  }

  function syncCount(bw, n){
    if(!bw) return;
    const cand = Array.from(bw.querySelectorAll("*"))
      .find(el => /Final Bytes/i.test(el.innerText||"") && /•/.test(el.innerText||""));
    if(cand){
      cand.innerText = `Final Bytes • ${n}`;
    }
  }

  function render(){
    const h = ensureHost();
    if(!h) return { ok:false, err:"no_bytesWrap" };

    const bytes = readBytes();
    h.cards.innerHTML = "";

    bytes.forEach((b, idx) => {
      const card = document.createElement("div");
      card.style.border = "1px solid #e5e7eb";
      card.style.borderRadius = "12px";
      card.style.padding = "10px";
      card.style.background = "#fff";

      const meta = document.createElement("div");
      meta.style.fontSize = "12px";
      meta.style.opacity = "0.75";
      meta.style.marginBottom = "6px";
      const who = [norm(b.speaker), norm(b.designation)].filter(Boolean).join(" • ");
      meta.textContent = who ? `#${idx+1}  ${who}` : `#${idx+1}`;
      card.appendChild(meta);

      const q = document.createElement("div");
      q.style.whiteSpace = "pre-wrap";
      q.style.fontSize = "14px";
      q.textContent = norm(b.text);
      card.appendChild(q);

      h.cards.appendChild(card);
    });

    syncCount(h.bw, bytes.length);
    return { ok:true, count: bytes.length, hostInBytesWrap: !!(h.bw && h.bw.contains(h.host)) };
  }

  window.__NG_FINAL_BYTES_CARDS_RENDER_V1__ = render;

  // render on add-byte click
  document.addEventListener("click", (ev) => {
    const t = ev && ev.target;
    if(t && (t.id === "ng-add-byte-btn-restore")){
      setTimeout(() => { try{ render(); }catch(e){} }, 80);
      setTimeout(() => { try{ render(); }catch(e){} }, 250);
    }
  }, true);

  // initial + keepalive (in case another code wipes)
  setTimeout(() => { try{ render(); }catch(e){} }, 400);
  setInterval(() => { try{ render(); }catch(e){} }, 800);
})();
 /* NG_FINAL_BYTES_CARDS_RENDER_V1_END */
/* NG_FINAL_BYTES_RENDER_ALIAS_V1_START */
(function(){
  function alias(){
    if(typeof window.__NG_FINAL_BYTES_CARDS_RENDER_V1__ !== "function") return;
    // Point all known render entrypoints to the stable renderer
    window.__NG_FINAL_BYTES_RENDER_V14__ = window.__NG_FINAL_BYTES_CARDS_RENDER_V1__;
    window.__NG_FINAL_BYTES_RENDER_V13__ = window.__NG_FINAL_BYTES_CARDS_RENDER_V1__;
    window.__NG_FINAL_BYTES_RENDER_V12__ = window.__NG_FINAL_BYTES_CARDS_RENDER_V1__;
  }
  setTimeout(alias, 50);
  setTimeout(alias, 500);
})();
 /* NG_FINAL_BYTES_RENDER_ALIAS_V1_END */
/* NG_FINAL_BYTES_ANCHOR_TO_HEADER_V1_START */
(function(){
  function findHeader(){
    const bw = document.getElementById("bytesWrap") || document;
    const cands = Array.from(bw.querySelectorAll("div,span,h1,h2,h3,label,summary"))
      .map(el => ({ el, t: (el.innerText||"").replace(/\s+/g," ").trim() }))
      .filter(x => /Final Bytes/i.test(x.t) && /•/.test(x.t) && x.t.length < 80);
    // prefer shortest / most specific
    cands.sort((a,b)=>a.t.length-b.t.length);
    return cands[0] ? cands[0].el : null;
  }

  function anchor(){
    const header = findHeader();
    const host = document.getElementById("ng-final-bytes-list-auto");
    if(!host) return { ok:false, err:"no_host" };
    if(!header) return { ok:false, err:"no_final_header" };

    const parent = header.parentNode;
    if(!parent) return { ok:false, err:"no_parent" };

    // place host right after the header row
    const after = header.nextSibling;
    if(after){
      parent.insertBefore(host, after);
    } else {
      parent.appendChild(host);
    }

    // re-render
    if(typeof window.__NG_FINAL_BYTES_CARDS_RENDER_V1__ === "function"){
      try{ window.__NG_FINAL_BYTES_CARDS_RENDER_V1__(); }catch(e){}
    }
    return { ok:true, anchored:true };
  }

  setTimeout(()=>{ try{ anchor(); }catch(e){} }, 600);
  setTimeout(()=>{ try{ anchor(); }catch(e){} }, 1300);
  document.addEventListener("click",(ev)=>{
    const t = ev && ev.target;
    // native +Add Byte OR our add button
    if(t && (/\+\s*Add\s*Byte/i.test((t.textContent||"").trim()) || t.id==="ng-add-byte-btn-restore")){
      setTimeout(()=>{ try{ anchor(); }catch(e){} }, 120);
      setTimeout(()=>{ try{ anchor(); }catch(e){} }, 350);
    }
  }, true);

  window.__NG_FINAL_ANCHOR__ = anchor;
})();
 /* NG_FINAL_BYTES_ANCHOR_TO_HEADER_V1_END */

/* NG_BYTESJSONOUT_DEDUPE_V1_START */
(function(){
  function dedupe(){
    const outs = Array.from(document.querySelectorAll("#bytesJSONOut"));
    if(outs.length <= 1) return { ok:true, kept: outs.length, removed: 0 };

    // keep the one that already has content (prefer non-empty)
    let keep = outs.find(x => ((x.value||"").trim().length > 0)) || outs[0];
    outs.forEach(x => { if(x !== keep){ try{ x.remove(); }catch(e){} } });

    return { ok:true, kept: 1, removed: outs.length-1 };
  }

  setTimeout(()=>{ try{ console.log("[NG] bytesJSONOut dedupe:", dedupe()); }catch(e){} }, 200);
  setTimeout(()=>{ try{ dedupe(); }catch(e){} }, 900);

  window.__NG_BYTESJSONOUT_DEDUPE__ = dedupe;
})();
 /* NG_BYTESJSONOUT_DEDUPE_V1_END */
/* NG_BIND_NATIVE_ADD_TO_RENDER_V1_START */
(function(){
  function bind(){
    const bw = document.getElementById("bytesWrap");
    if(!bw) return { ok:false, err:"no_bytesWrap" };

    const btn = Array.from(bw.querySelectorAll("button"))
      .find(b => /\+\s*Add\s*Byte/i.test((b.textContent||"").trim()));
    if(!btn) return { ok:false, err:"no_native_add_btn" };

    if(btn.__ng_bound_render_v1__) return { ok:true, bound:false, note:"already_bound" };
    btn.__ng_bound_render_v1__ = true;

    btn.addEventListener("click", () => {
      try{
        if(typeof window.__NG_FINAL_BYTES_CARDS_RENDER_V1__ === "function"){
          window.__NG_FINAL_BYTES_CARDS_RENDER_V1__();
        }
        if(typeof window.__NG_FINAL_ANCHOR__ === "function"){
          window.__NG_FINAL_ANCHOR__();
        }
        if(typeof window.__NG_FINAL_COUNT_SYNC__ === "function"){
          window.__NG_FINAL_COUNT_SYNC__();
        }
      }catch(e){}
    }, true);

    return { ok:true, bound:true };
  }

  setTimeout(()=>{ try{ console.log("[NG] bind native add:", bind()); }catch(e){} }, 400);
  setTimeout(()=>{ try{ bind(); }catch(e){} }, 1200);
})();
 /* NG_BIND_NATIVE_ADD_TO_RENDER_V1_END */
/* NG_WIRE_NATIVE_ADD_BYTE_TO_STATE_V1_START */
(function(){
  function norm(s){ return (s||"").toString().trim(); }
  function isVisible(el){
    if(!el) return false;
    const cs = window.getComputedStyle ? getComputedStyle(el) : null;
    if(cs && (cs.display==="none" || cs.visibility==="hidden")) return false;
    if(el.offsetParent === null && cs && cs.position !== "fixed") return false;
    return true;
  }

  function getOut(){
    // always keep the first bytesJSONOut
    return document.querySelector("#bytesJSONOut");
  }

  function ensureState(){
    if(!window.__NG_FINAL_BYTES_STATE__) window.__NG_FINAL_BYTES_STATE__ = {};
    if(!Array.isArray(window.__NG_FINAL_BYTES_STATE__.bytes)) window.__NG_FINAL_BYTES_STATE__.bytes = [];
    return window.__NG_FINAL_BYTES_STATE__;
  }

  function findByLabelText(root, labelNeedle){
    const labels = Array.from(root.querySelectorAll("label"))
      .map(l => ({ l, t: norm(l.textContent).toLowerCase() }))
      .filter(x => x.t.includes(labelNeedle));
    for(const x of labels){
      // look for input/textarea within same parent block
      const p = x.l.parentElement || root;
      const cand = p.querySelector("input,textarea");
      if(cand && isVisible(cand)) return cand;
      // fallback: next siblings
      let n = x.l.nextElementSibling;
      while(n){
        if((n.tagName==="INPUT" || n.tagName==="TEXTAREA") && isVisible(n)) return n;
        const inner = n.querySelector && n.querySelector("input,textarea");
        if(inner && isVisible(inner)) return inner;
        n = n.nextElementSibling;
      }
    }
    return null;
  }

  function collectFromBytesWrap(){
    const bw = document.getElementById("bytesWrap") || document;
    // Prefer explicit labels
    const speakerEl = findByLabelText(bw, "speaker name") || findByLabelText(bw, "speaker");
    const desigEl   = findByLabelText(bw, "designation");

    // Text/Quote textarea: avoid bytesJSONOut + default template
    let textEl = findByLabelText(bw, "text / quote") || findByLabelText(bw, "text") || findByLabelText(bw, "quote");
    if(textEl && (textEl.id==="bytesJSONOut" || textEl.id==="ng-default-quote-template")) textEl = null;

    if(!textEl){
      const tas = Array.from(bw.querySelectorAll("textarea"))
        .filter(t => t.id!=="bytesJSONOut" && t.id!=="ng-default-quote-template" && isVisible(t));
      // usually last visible textarea is the row's Text/Quote
      textEl = tas[tas.length-1] || null;
    }

    return {
      speaker: speakerEl ? norm(speakerEl.value) : "",
      designation: desigEl ? norm(desigEl.value) : "",
      text: textEl ? norm(textEl.value) : ""
    };
  }

  function syncOut(bytes){
    const out = getOut();
    if(!out) return { ok:false, err:"no_bytesJSONOut" };
    out.value = JSON.stringify(bytes, null, 2);
    try{
      out.dispatchEvent(new Event("input", { bubbles:true }));
      out.dispatchEvent(new Event("change", { bubbles:true }));
    }catch(e){}
    return { ok:true, outLen: out.value.length };
  }

  function renderAll(){
    try{ if(typeof window.__NG_FINAL_BYTES_CARDS_RENDER_V1__==="function") window.__NG_FINAL_BYTES_CARDS_RENDER_V1__(); }catch(e){}
    try{ if(typeof window.__NG_FINAL_ANCHOR__==="function") window.__NG_FINAL_ANCHOR__(); }catch(e){}
    try{ if(typeof window.__NG_FINAL_COUNT_SYNC__==="function") window.__NG_FINAL_COUNT_SYNC__(); }catch(e){}
  }

  function onAddByteCommit(){
    const st = ensureState();
    const b = collectFromBytesWrap();
    if(!b.text){
      return { ok:false, err:"empty_text" };
    }
    st.bytes.push({ speaker: b.speaker, designation: b.designation, text: b.text });
    const s = syncOut(st.bytes);
    renderAll();
    return { ok:true, count: st.bytes.length, sync: s };
  }

  function bind(){
    // bind ONLY to exact "Add Byte" (not "+ Add Byte")
    const bw = document.getElementById("bytesWrap") || document;
    const btns = Array.from(bw.querySelectorAll("button"))
      .filter(b => norm(b.textContent).toLowerCase() === "add byte");
    let bound = 0;
    btns.forEach(btn => {
      if(btn.__ng_commit_bound_v1__) return;
      btn.__ng_commit_bound_v1__ = true;
      btn.addEventListener("click", () => { try{ onAddByteCommit(); }catch(e){} }, true);
      bound++;
    });
    return { ok:true, buttonsFound: btns.length, newlyBound: bound };
  }

  // run a few times because UI rows/buttons can be injected later
  setTimeout(()=>{ try{ console.log("[NG] bind commit:", bind()); }catch(e){} }, 400);
  setTimeout(()=>{ try{ bind(); }catch(e){} }, 1200);
  setInterval(()=>{ try{ bind(); }catch(e){} }, 1500);

  window.__NG_ADD_BYTE_COMMIT_V1__ = onAddByteCommit;
})();
 /* NG_WIRE_NATIVE_ADD_BYTE_TO_STATE_V1_END */
/* NG_KEEP_ONE_FINAL_BYTES_PANEL_V1_START */
/* NG_KEEP_ONE_FINAL_BYTES_PANEL_V1_PICKKEEP_FIX_START */
(function () {
  function q(sel){ return document.querySelector(sel); }

  // Find the BEST "Final Bytes" root using stable anchors
  window.NG_pickKeepFinalBytesRoot = function () {
    // 0) If we already marked a keep root earlier, reuse it
    const marked = document.querySelector('[data-ng-final-bytes-keep="1"]');
    if (marked) return marked;

    // 1) Prefer your real cards host (you confirmed it exists)
    const host = q('#ng-final-bytes-list-auto');
    if (host) {
      const root =
        host.closest('#bytesWrap, #ng-final-bytes, #ng-final-bytes-panel, section, .panel, .card, details, div') ||
        host.parentElement;
      if (root) {
        root.setAttribute('data-ng-final-bytes-keep', '1');
        return root;
      }
    }

    // 2) Fallback: look for any element that visually represents Final Bytes
    const candidates = Array.from(document.querySelectorAll('details, section, .panel, .card, div'))
      .filter(el => {
        const t = (el.innerText || '').replace(/\s+/g,' ').trim();
        return /Final Bytes/i.test(t) && t.length < 3000;
      });

    if (candidates.length) {
      candidates.sort((a,b) => (a.innerText||'').length - (b.innerText||'').length);
      candidates[0].setAttribute('data-ng-final-bytes-keep', '1');
      return candidates[0];
    }

    return null;
  };

  // If existing code calls pickKeep(), force it to use our stable finder
  try {
    if (typeof window.pickKeep === 'function') {
      const _old = window.pickKeep;
      window.pickKeep = function () {
        return window.NG_pickKeepFinalBytesRoot() || _old();
      };
    }
  } catch(e){}
})();
/* NG_KEEP_ONE_FINAL_BYTES_PANEL_V1_PICKKEEP_FIX_END */
/* NG_FINAL_BYTES_COMMIT_BUTTON_V1_START */
(function () {
  function firstQuoteBox() {
    const scope = document.querySelector('#bytesWrap') || document;
    return (
      scope.querySelector('textarea[name="quote"], textarea[id*="quote"], textarea[placeholder*="Quote"], textarea[placeholder*="byte"]') ||
      scope.querySelector('textarea')
    );
  }

  function ensureCommitBtn() {
    const wrap = document.querySelector('#bytesWrap') || document.body;
    if (!wrap) return { ok:false, why:'bytesWrap not found' };

    if (document.querySelector('#ng-commit-final-byte-btn')) return { ok:true, already:true };

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'ng-commit-final-byte-btn';
    btn.textContent = 'Commit to Final Bytes';
    btn.style.cssText = 'background:#000;color:#fff;border:0;border-radius:10px;padding:10px 12px;font-weight:600;cursor:pointer;';

    btn.addEventListener('click', () => {
      const ta = firstQuoteBox();
      if (!ta) return console.warn('[NG_COMMIT_BTN] quote textarea not found');
      ta.dispatchEvent(new MouseEvent('dblclick', { bubbles:true, cancelable:true }));
      try { window.NG_renderFinalBytes?.(); } catch(e){}
    });

    const ta = firstQuoteBox();
    if (ta && ta.parentElement) {
      const gap = document.createElement('div');
      gap.style.height = '8px';
      ta.parentElement.appendChild(gap);
      ta.parentElement.appendChild(btn);
    } else {
      wrap.appendChild(btn);
    }

    return { ok:true, inserted:true };
  }

  setTimeout(() => console.log('[NG_COMMIT_BTN]', ensureCommitBtn()), 0);
})();
 /* NG_FINAL_BYTES_COMMIT_BUTTON_V1_END */
/* NG_FINAL_BYTES_REMOVE_WIRE_V1_START */
(function(){
  function q(sel,root){ return (root||document).querySelector(sel); }
  function qa(sel,root){ return Array.from((root||document).querySelectorAll(sel)); }

  function getHost(){
    return q('#ng-final-bytes-list-auto') || q('#ng-final-bytes-list') || q('#finalBytesList') || q('#finalBytes') || null;
  }

  function getBytesJSONOutTA(){
    return q('#bytesJSONOut') || q('textarea#bytesJSONOut') || q('textarea[name="bytesJSONOut"]') || null;
  }

  function getFinalBytesRef(){
    try{
      if (window.NG_STATE && Array.isArray(window.NG_STATE.finalBytes)) return { obj: window.NG_STATE, key: 'finalBytes' };
      if (window.NG_STATE && Array.isArray(window.NG_STATE.finals))     return { obj: window.NG_STATE, key: 'finals' };
      if (Array.isArray(window.finalBytes)) return { direct: 'finalBytes' };
      if (Array.isArray(window.finals))     return { direct: 'finals' };
      if (Array.isArray(window.NG_FINAL_BYTES)) return { direct: 'NG_FINAL_BYTES' };
    }catch(e){}
    return null;
  }

  function readFinalBytesArray(){
    const ref = getFinalBytesRef();
    if (ref){
      if (ref.obj) return ref.obj[ref.key];
      if (ref.direct) return window[ref.direct];
    }
    const ta = getBytesJSONOutTA();
    if (ta && ta.value && ta.value.trim()){
      try{
        const v = JSON.parse(ta.value);
        if (Array.isArray(v)) return v;
      }catch(e){}
    }
    return [];
  }

  function writeFinalBytesArray(arr){
    const ref = getFinalBytesRef();
    if (ref){
      if (ref.obj) ref.obj[ref.key] = arr;
      if (ref.direct) window[ref.direct] = arr;
    }
    const ta = getBytesJSONOutTA();
    if (ta){
      try{ ta.value = JSON.stringify(arr, null, 2); }catch(e){}
      try{ ta.dispatchEvent(new Event('input', {bubbles:true})); }catch(e){}
      try{ ta.dispatchEvent(new Event('change', {bubbles:true})); }catch(e){}
    }
  }

  function callRerender(){
    const f =
      window.NG_renderFinalBytes ||
      window.renderFinalBytes ||
      window.NG_renderFinalBytesAuto ||
      window.renderFinalBytesAuto ||
      null;
    if (typeof f === 'function'){
      try{ f(); return true; }catch(e){ console.warn('[NG_REMOVE] rerender error', e); }
    }
    return false;
  }

  function ensureRemoveButtons(){
    const host = getHost();
    if (!host) return {ok:false, why:'host missing'};
    const cards = qa(':scope > *', host);

    cards.forEach((card, idx) => {
      if (!(card instanceof Element)) return;
      card.setAttribute('data-ng-final-idx', String(idx));

      // If already present, skip
      if (card.querySelector('button.ng-final-remove-btn')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ng-final-remove-btn';
      btn.textContent = 'Remove';
      btn.style.cssText = 'margin-top:8px;background:#b91c1c;color:#fff;border:0;border-radius:10px;padding:8px 10px;font-weight:600;cursor:pointer;outline:none;box-shadow:none;';

      // Prefer footer-like placement: if card has last row div, append there; else append to card
      const footer = card.querySelector('.footer, .actions, .btns, [data-footer]') || null;
      (footer || card).appendChild(btn);
    });

    return {ok:true, cards: cards.length};
  }

  function onHostClick(ev){
    const btn = ev.target && ev.target.closest && ev.target.closest('button.ng-final-remove-btn');
    if (!btn) return;

    const host = getHost();
    if (!host) return;

    const card = btn.closest('[data-ng-final-idx]') || btn.parentElement;
    const idx = parseInt(card && card.getAttribute ? (card.getAttribute('data-ng-final-idx')||'-1') : '-1', 10);
    if (!(idx >= 0)) return;

    const arr = readFinalBytesArray();
    if (idx >= arr.length){
      console.warn('[NG_REMOVE] idx out of range', {idx, len: arr.length});
      try{ card.remove(); }catch(e){}
      ensureRemoveButtons();
      return;
    }

    arr.splice(idx, 1);
    writeFinalBytesArray(arr);

    const did = callRerender();
    if (!did){
      try{ card.remove(); }catch(e){}
      setTimeout(ensureRemoveButtons, 0);
    } else {
      // allow rerender to rebuild DOM then re-inject remove btns
      setTimeout(ensureRemoveButtons, 80);
    }

    console.log('[NG_REMOVE] removed', {idx, remaining: arr.length});
  }

  function bindHost(host){
    if (!host) return {ok:false, why:'no host'};
    if (host.getAttribute('data-ng-remove-wired') === '1') return {ok:true, already:true};

    host.setAttribute('data-ng-remove-wired','1');
    host.addEventListener('click', onHostClick);

    // Observe host children changes and re-inject remove buttons (no interval)
    let t=null;
    const obs = new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => { try{ ensureRemoveButtons(); }catch(e){} }, 40);
    });
    obs.observe(host, {childList:true, subtree:false});

    const r1 = ensureRemoveButtons();
    setTimeout(() => { try{ ensureRemoveButtons(); }catch(e){} }, 200);
    return {ok:true, wired:true, ensure:r1};
  }

  // Host can be replaced during rerender => retry binding
  (function retryBind(){
    let tries=0;
    const tick = () => {
      const host = getHost();
      const r = bindHost(host);
      if (r && r.ok) { console.log('[NG_REMOVE_INSTALL]', r); return true; }
      return false;
    };
    if (tick()) return;
    const iv = setInterval(() => {
      tries++;
      if (tick() || tries>80) clearInterval(iv);
    }, 250);
  })();
})();
/* NG_FINAL_BYTES_REMOVE_WIRE_V1_END */
(function(){
  function pickKeep(){
    const host = document.getElementById("ng-final-bytes-list-auto");
    if(!host) return null;

    // candidate: nearest ancestor (div/section/details) that CONTAINS host and also contains "Final Bytes •"
    let cur = host.parentElement;
    while(cur){
      const t = (cur.innerText||"");
      if(/Final Bytes\s*•/i.test(t)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  function run(){
    const keep = pickKeep();
    const finals = Array.from(document.querySelectorAll("div,section,details"))
      .filter(n => /Final Bytes\s*•/i.test(n.innerText||""));

    let hidden = 0;
    finals.forEach(n => {
      if(keep && n !== keep){
        n.style.display = "none";
        hidden++;
      }
    });

    return {
      ok:true,
      finalsFound: finals.length,
      hidden,
      keep: keep ? (keep.tagName + "#" + (keep.id||"")) : null
    };
  }

  setTimeout(()=>{ try{ console.log("[NG] keep one final panel:", run()); }catch(e){} }, 500);
  setInterval(()=>{ try{ run(); }catch(e){} }, 1500);

  window.__NG_KEEP_ONE_FINAL_PANEL__ = run;
})();
 /* NG_KEEP_ONE_FINAL_BYTES_PANEL_V1_END */


/* NG_FINAL_BYTES_FIXED_COMMIT_BTN_V1_START */
(function(){
  function findDefaultQuoteTA(){
    return Array.from(document.querySelectorAll('textarea'))
      .find(x => (x.getAttribute('placeholder')||'').includes('default byte/quote')) || null;
  }

  function installFixedCommitBtn(){
    // If already installed, do nothing
    if (document.querySelector('#ng-commit-final-byte-btn-fixed')) return {ok:true, already:true};

    const ta = findDefaultQuoteTA() || document.querySelector('#bytesWrap textarea') || document.querySelector('textarea');
    if (!ta) return {ok:false, why:'no textarea found'};

    const btn = document.createElement('button');
    btn.id = 'ng-commit-final-byte-btn-fixed';
    btn.type = 'button';
    btn.textContent = 'Commit to Final Bytes';
    btn.style.cssText = 'position:fixed;right:16px;bottom: 72px;top:auto;left:auto;z-index:999999;background:#000;color:#fff;border:0;border-radius:12px;padding:12px 14px;font-weight:700;cursor:pointer;display:inline-block;visibility:visible;opacity:1;';

    btn.addEventListener('click', () => {
      ta.dispatchEvent(new MouseEvent('dblclick', { bubbles:true, cancelable:true }));
      console.log('[NG_FIXED_COMMIT] dblclick dispatched');
    });

    document.body.appendChild(btn); if(btn.parentElement!==document.body) document.body.appendChild(btn);
    const r = btn.getBoundingClientRect();
    return {ok:true, rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
  }

  // Install after DOM settles
  let tries=0;
  const iv=setInterval(() => {
    tries++;
    const r=installFixedCommitBtn();
    if(r.ok || tries>40){ console.log('[NG_FIXED_COMMIT_INSTALL]', r); clearInterval(iv); }
  }, 200);
})();
/* NG_FINAL_BYTES_FIXED_COMMIT_BTN_V1_END */


/* NG_DRAFTS_OVERLAY_CLOSE_X_V1_START */
(function(){
  function findOverlay(){
    return Array.from(document.querySelectorAll('div'))
      .find(d => (d.textContent||'').includes('No drafts found') && (d.textContent||'').includes('Refresh List')) || null;
  }

  function install(){
    const ov = findOverlay();
    if(!ov) return {ok:false, why:'overlay not found'};

    if(ov.querySelector('#ng-drafts-overlay-close-x')) return {ok:true, already:true};

    // make sure overlay can host absolute button
    const cs = getComputedStyle(ov);
    if(cs.position === 'static') ov.style.position = 'relative';

    const x = document.createElement('button');
    x.id = 'ng-drafts-overlay-close-x';
    x.type = 'button';
    x.textContent = '×';
    x.title = 'Close';
    x.style.cssText = 'position:absolute;right:10px;top:10px;z-index:999999;background:transparent;color:#fff;border:0;font-size:22px;line-height:1;cursor:pointer;opacity:.85;';
    x.addEventListener('click', () => { ov.style.display = 'none'; console.log('[NG_OVERLAY] closed'); });

    ov.appendChild(x);
    return {ok:true, installed:true};
  }

  let tries=0;
  const iv=setInterval(() => {
    tries++;
    const r=install();
    if(r.ok || tries>60){ console.log('[NG_OVERLAY_CLOSE_X]', r); clearInterval(iv); }
  }, 250);
})();
/* NG_DRAFTS_OVERLAY_CLOSE_X_V1_END */
/* NG_HEALTHPILL_OFFSET_FROM_STORYVIEW_V1_START */
(function(){
  function apply(){
    const pill = document.querySelector('#ngHealthPill');
    if(!pill) return {ok:false, why:'no pill'};
    pill.style.setProperty('right','200px','important');  // keep clear of Story View
    pill.style.setProperty('bottom','16px','important');
    pill.style.setProperty('z-index','999990','important');
    return {ok:true};
  }
  let tries=0;
  const iv=setInterval(() => {
    tries++;
    const r=apply();
    if(r.ok || tries>80){ console.log('[NG_HEALTHPILL_OFFSET]', r); clearInterval(iv); }
  }, 200);
})();
/* NG_HEALTHPILL_OFFSET_FROM_STORYVIEW_V1_END */
