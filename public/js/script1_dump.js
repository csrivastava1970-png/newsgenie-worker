
/* === Editorial Extraction : Suggestions Panel + Transcript Auto-Ingest (Clean V3) === */
(function () {
  "use strict";

  // ---------------- utils ----------------
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[m]));
  }
  function norm(s) { return String(s ?? "").replace(/\s+/g, " ").trim(); }
  function normKey(s) {
    return norm(s).toLowerCase()
      .replace(/[â€œâ€"']/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // optional speakerâ†’designation map
  window.__NG_SPEAKER_MAP = window.__NG_SPEAKER_MAP || {
    "à¤•à¤¿à¤°à¤£ à¤°à¤¿à¤œà¤¿à¤œà¥‚": "à¤•à¥‡à¤‚à¤¦à¥à¤°à¥€à¤¯ à¤®à¤‚à¤¤à¥à¤°à¥€",
    "à¤œà¤¯à¤°à¤¾à¤® à¤°à¤®à¥‡à¤¶": "à¤•à¤¾à¤‚à¤—à¥à¤°à¥‡à¤¸ à¤¨à¥‡à¤¤à¤¾"
  };

  // ---------------- extraction helpers ----------------
  function guessSpeakerFromText(text) {
    const t = norm(text);

    // "à¤¨à¤¾à¤® (à¤ªà¤¦): à¤¬à¤¯à¤¾à¤¨..."
    const m2 = t.match(/^(.{2,40})\s*\((.{2,40})\)\s*[:ï¼š]\s*(.+)$/);
    if (m2) return { speaker: norm(m2[1]), designation: norm(m2[2]), text: norm(m2[3]) };

    // "à¤¨à¤¾à¤®: à¤¬à¤¯à¤¾à¤¨..."
    const m = t.match(/^([^:ï¼š]{2,40})\s*[:ï¼š]\s*(.+)$/);
    if (m) return { speaker: norm(m[1]), text: norm(m[2]) };

    // "à¤¨à¤¾à¤® à¤¨à¥‡ à¤•à¤¹à¤¾/à¤¬à¤¤à¤¾à¤¯à¤¾... (à¤•à¤¿) ..."
    const m3 = t.match(
      /^([^\s:ï¼š]{2,20}(?:\s+[^\s:ï¼š]{2,20}){0,2})\s+(?:à¤¨à¥‡\s+(?:à¤•à¤¹à¤¾|à¤¬à¥‹à¤²à¥‡|à¤¬à¤¤à¤¾à¤¯à¤¾|à¤†à¤°à¥‹à¤ª\s+à¤²à¤—à¤¾à¤¯à¤¾|à¤¦à¤¾à¤µà¤¾\s+à¤•à¤¿à¤¯à¤¾|à¤¤à¤‚à¤œ\s+à¤•à¤¸à¤¾)|à¤•à¤¾\s+à¤•à¤¹à¤¨à¤¾\s+à¤¹à¥ˆ)\s*(?:à¤•à¤¿\s*)?(.+)$/
    );
    if (m3) {
      const sp = norm(m3[1]);
      const rest = norm(m3[2] || "");
      if (sp && !/^(à¤‰à¤¨à¥à¤¹à¥‹à¤‚à¤¨à¥‡|à¤‰à¤¸à¤¨à¥‡|à¤¹à¤®à¤¨à¥‡|à¤†à¤ªà¤¨à¥‡|à¤‡à¤¨à¥à¤¹à¥‹à¤‚à¤¨à¥‡|à¤‰à¤¨à¤•à¤¾|à¤‰à¤¸à¤•à¤¾)$/u.test(sp)) {
        return { speaker: sp, text: rest || t };
      }
    }

    return { text: t };
  }

  function scoreLine(line) {
    const t = (line.text || "").trim();
    const len = t.length;
    let score = 0;

    if (len >= 18 && len <= 140) score += 3;
    else if (len >= 10 && len <= 220) score += 1.5;
    else if (len < 8) score -= 4;
    else score -= 0.2;

    if (line.speaker) score += 1.6;
    if (/[â€œâ€"']/.test(t)) score += 1.2;
    if (/[?!]/.test(t)) score += 0.4;

    if (/(à¤•à¤¹à¤¾|à¤¬à¥‹à¤²à¥‡|à¤¬à¤¤à¤¾à¤¯à¤¾|à¤¸à¥à¤ªà¤·à¥à¤Ÿ|à¤¸à¤¾à¤«|à¤œà¤µà¤¾à¤¬|à¤¤à¥ˆà¤¯à¤¾à¤°|à¤†à¤°à¥‹à¤ª|à¤¤à¤‚à¤œ|à¤¸à¤°à¤•à¤¾à¤°|à¤µà¤¿à¤ªà¤•à¥à¤·|à¤œà¤¾à¤‚à¤š|à¤¸à¤µà¤¾à¤²|à¤šà¥à¤¨à¤¾à¤µ|à¤¸à¤‚à¤¸à¤¦|à¤¦à¥‡à¤¶|à¤œà¤¨à¤¤à¤¾)/.test(t)) score += 2;
    if (/(à¤¨à¤¹à¥€à¤‚|à¤—à¤²à¤¤|à¤à¥‚à¤ |à¤¸à¤¬à¥‚à¤¤|à¤•à¤¾à¤°à¥à¤°à¤µà¤¾à¤ˆ|à¤®à¤¾à¤‚à¤—|à¤‡à¤¸à¥à¤¤à¥€à¤«à¤¾|à¤¹à¤®à¤²à¤¾|à¤¬à¤šà¤¾à¤µ)/.test(t)) score += 1;
    if (/[0-9à¥¦-à¥¯]/.test(t)) score += 0.6;

    if (/(à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦|à¤¨à¤®à¤¸à¥à¤•à¤¾à¤°|à¤¸à¥à¤µà¤¾à¤—à¤¤|à¤†à¤ª à¤¦à¥‡à¤– à¤°à¤¹à¥‡|à¤¦à¥‡à¤–à¤¿à¤|à¤¦à¥‹à¤¸à¥à¤¤à¥‹à¤‚|à¤šà¤²à¤¿à¤¯à¥‡|à¤…à¤¬ à¤¹à¤®)/.test(t)) score -= 4;

    return score;
  }

  function extractReverieText(root) {
    if (!root) return "";
    if (typeof root === "string") return root.trim();

    const cands = [
      root.display_text, root.text,
      root.result?.display_text, root.result?.text,
      root.output?.display_text, root.output?.text,
      root.data?.display_text, root.data?.text,
      root.response?.display_text, root.response?.text,
      root.success && root.text ? root.text : null
    ];
    for (const c of cands) if (typeof c === "string" && c.trim()) return c.trim();
    return "";
  }

  function mapArrToLines(arr) {
    const out = [];
    for (const it of arr || []) {
      let txt = "";
      if (typeof it === "string") txt = it;
      else if (it && typeof it === "object") {
        txt = it.text || it.transcript || it.utterance || it.sentence || it.content || it.line || "";
      }
      txt = norm(txt);
      if (!txt) continue;

      const g = guessSpeakerFromText(txt);
      let speaker = norm(g.speaker || it?.speaker || it?.name || "");
      let designation = norm(g.designation || it?.designation || it?.title || "");
      let text = norm(g.text || txt);

      if (speaker && !designation) designation = window.__NG_SPEAKER_MAP[speaker] || "";

      out.push({ speaker, designation, text });
    }
    return out;
  }

  function looksLikeTranscriptArr(arr) {
    let hits = 0, totalLen = 0;
    for (const it of arr || []) {
      const txt = (typeof it === "string")
        ? it
        : (it?.text || it?.transcript || it?.utterance || it?.sentence || it?.content || it?.line);
      if (typeof txt === "string" && txt.trim()) {
        hits++;
        totalLen += txt.trim().length;
      }
    }
    const avg = hits ? totalLen / hits : 0;
    return hits >= 2 && avg >= 10;
  }

  function collectCandidateLines(root, opts) {
    const maxNodes = Number(opts?.maxNodes || 9000);

    // Prefer full text
    const fullText = extractReverieText(root);
    if (fullText) {
      const normalized = String(fullText)
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/([à¥¤.?!])\s+/g, "$1\n")
        .trim();

      const parts = normalized
        .split("\n")
        .map(s => (s || "").trim())
        .filter(s => s.length >= 12)
        .slice(0, 80);

      return parts.map(p => {
        const g = guessSpeakerFromText(p);
        const speaker = norm(g.speaker || "");
        const designation = norm(g.designation || (speaker ? (window.__NG_SPEAKER_MAP[speaker] || "") : ""));
        const text = norm(g.text || p);
        return { speaker, designation, text };
      });
    }

    // Direct arrays
    const directCandidates = [];
    if (Array.isArray(root?.segments)) directCandidates.push(root.segments);
    if (Array.isArray(root?.result?.segments)) directCandidates.push(root.result.segments);
    if (Array.isArray(root?.data?.segments)) directCandidates.push(root.data.segments);
    if (Array.isArray(root?.utterances)) directCandidates.push(root.utterances);
    if (Array.isArray(root?.sentences)) directCandidates.push(root.sentences);
    if (Array.isArray(root?.results)) directCandidates.push(root.results);

    for (const arr of directCandidates) {
      if (Array.isArray(arr) && looksLikeTranscriptArr(arr)) return mapArrToLines(arr);
    }

    // BFS scan for best transcript-like array
    const queue = [root];
    let nodes = 0;
    const arrays = [];

    while (queue.length && nodes < maxNodes) {
      const v = queue.shift();
      nodes++;
      if (!v) continue;

      if (Array.isArray(v)) {
        if (looksLikeTranscriptArr(v)) arrays.push(v);
        for (const it of v) if (it && typeof it === "object") queue.push(it);
        continue;
      }
      if (typeof v === "object") {
        for (const k in v) {
          if (!Object.prototype.hasOwnProperty.call(v, k)) continue;
          const it = v[k];
          if (it && typeof it === "object") queue.push(it);
        }
      }
    }

    return mapArrToLines(arrays[0] || []);
  }

  function pickBestLines(lines, min = 6, max = 10) {
    const seenText = new Set();
    const bestPerSpeaker = new Map();
    const rest = [];

    for (const ln of (lines || [])) {
      const tKey = normKey(ln.text);
      if (!tKey || tKey.length < 8) continue;
      if (seenText.has(tKey)) continue;
      seenText.add(tKey);

      const scored = { ...ln, __score: scoreLine(ln) };
      if (scored.__score < -2.5) continue;

      const sp = norm(scored.speaker);
      if (sp) {
        const prev = bestPerSpeaker.get(sp);
        if (!prev || scored.__score > prev.__score) bestPerSpeaker.set(sp, scored);
        else rest.push(scored);
      } else {
        rest.push(scored);
      }
    }

    const picked = Array.from(bestPerSpeaker.values()).sort((a, b) => b.__score - a.__score);
    rest.sort((a, b) => b.__score - a.__score);

    for (const r of rest) {
      if (picked.length >= max) break;
      picked.push(r);
    }
    return picked.slice(0, Math.max(min, Math.min(max, picked.length)));
  }

  // ---------------- BYTES helpers (used by push) ----------------
  function getAddByteButton() {
    return (
      document.getElementById("addByteBtn") ||
      document.getElementById("add-byte") ||
      document.querySelector('[data-action="add-byte"]')
    );
  }

  function getByteFields() {
    const wrap = document.getElementById("bytesWrap") || document;
    const speakers = [...wrap.querySelectorAll('input[name="byte_speaker[]"]')];
    const desigs   = [...wrap.querySelectorAll('input[name="byte_designation[]"]')];
    const texts    = [...wrap.querySelectorAll('textarea[name="byte_text[]"], input[name="byte_text[]"]')];
    return { wrap, speakers, desigs, texts };
  }

  function ensureByteRows(targetCount) {
    const addBtn = getAddByteButton();
    if (!addBtn) return;

    let safety = 40;
    while (safety-- > 0) {
      const { speakers } = getByteFields();
      if (speakers.length >= targetCount) break;

      if (typeof window.NG_addByteRow === "function") window.NG_addByteRow();
      else addBtn.click();
    }
  }

  function existingByteSet() {
    const { speakers, desigs, texts } = getByteFields();
    const set = new Set();
    const n = Math.max(speakers.length, desigs.length, texts.length);

    for (let i = 0; i < n; i++) {
      const sp = normKey(speakers[i]?.value || "");
      const ds = normKey(desigs[i]?.value || "");
      const tx = normKey(texts[i]?.value || "");
      if (sp || ds || tx) set.add(`${sp}|${ds}|${tx}`);
    }
    return set;
  }

  function findFirstEmptySlot() {
    const { speakers, desigs, texts } = getByteFields();
    const n = Math.max(speakers.length, desigs.length, texts.length);

    for (let i = 0; i < n; i++) {
      const sp = norm(speakers[i]?.value || "");
      const ds = norm(desigs[i]?.value || "");
      const tx = norm(texts[i]?.value || "");
      if (!sp && !ds && !tx) return i;
      if (!sp && !ds) return i;
    }
    return n;
  }

  function fillSlot(i, item) {
    ensureByteRows(i + 1);
    const f = getByteFields();
    if (f.speakers[i]) f.speakers[i].value = item?.speaker || "";
    if (f.desigs[i])   f.desigs[i].value   = item?.designation || "";
    if (f.texts[i])    f.texts[i].value    = item?.text || "";
  }

  // ---------------- UI init ----------------
function initEditorialExtraction() {
  if (window.__NG_EE_INIT_DONE) return;
  window.__NG_EE_INIT_DONE = true;

  const eeList  = document.getElementById("ee-list");
  const eeEmpty = document.getElementById("ee-empty");
  const btnPush = document.getElementById("ee-push");
  const btnClear= document.getElementById("ee-clear");

  if (!eeList || !btnPush || !btnClear) {
    console.warn("[EE] Missing ee-list/ee-push/ee-clear");
    return;
  }

  let suggestions = [];

  function showEmpty(on) {
    if (!eeEmpty) return;
    eeEmpty.style.display = on ? "block" : "none";
  }

  function updateButtons() {
    const total   = eeList.querySelectorAll('input[type="checkbox"][data-i]').length;
    const checked = eeList.querySelectorAll('input[type="checkbox"][data-i]:checked').length;
    btnPush.disabled  = (checked === 0);
    btnClear.disabled = (total === 0);
  }

  // --- Bytes helpers (bulletproof, DOM-driven) ---
  function bytesWrapEl() {
    return document.getElementById("bytesWrap") || document.getElementById("bytes-wrap");
  }

  function addByteButtonEl() {
    return (
      document.getElementById("addByteBtn") ||
      document.getElementById("add-byte") ||
      document.getElementById("addByte")
    );
  }

  function getByteInputs() {
    const wrap = bytesWrapEl();
    if (!wrap) return { sp: [], ds: [], tx: [] };
    const sp = Array.from(wrap.querySelectorAll('input[name="byte_speaker[]"]'));
    const ds = Array.from(wrap.querySelectorAll('input[name="byte_designation[]"]'));
    const tx = Array.from(wrap.querySelectorAll('textarea[name="byte_text[]"], input[name="byte_text[]"]'));
    return { sp, ds, tx };
  }

  function ensureByteRows(minRows) {
    let { sp, ds } = getByteInputs();
    let n = Math.max(sp.length, ds.length);
    let safety = 0;

    while (n < minRows && safety++ < 30) {
      if (typeof window.NG_addByteRow === "function") {
        window.NG_addByteRow();
      } else {
        const addBtn = addByteButtonEl();
        if (addBtn) addBtn.click();
        else break;
      }
      ({ sp, ds } = getByteInputs());
      n = Math.max(sp.length, ds.length);
    }
    return n;
  }

  function findFirstEmptySlot() {
    const { sp, ds } = getByteInputs();
    const n = Math.max(sp.length, ds.length);
    for (let i = 0; i < n; i++) {
      const a = (sp[i]?.value || "").trim();
      const b = (ds[i]?.value || "").trim();
      if (!a && !b) return i;
    }
    return n; // append
  }

  function normKeyLocal(s) {
    return (s || "")
      .toString()
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function existingByteSet() {
    const set = new Set();
    const { sp, ds, tx } = getByteInputs();
    const n = Math.max(sp.length, ds.length, tx.length);
    for (let i = 0; i < n; i++) {
      const speaker = (sp[i]?.value || "").trim();
      const desig   = (ds[i]?.value || "").trim();
      const text    = (tx[i]?.value || "").trim();
      if (!speaker && !desig && !text) continue;
      set.add(`${normKeyLocal(speaker)}|${normKeyLocal(desig)}|${normKeyLocal(text)}`);
    }
    return set;
  }

  // âœ… return true/false
  function fillSlot(slotIndex, item) {
    ensureByteRows(slotIndex + 1);

    const { sp, ds, tx } = getByteInputs();
    if (!sp[slotIndex] || !ds[slotIndex]) return false;

    const speaker = (item?.speaker || "").toString().trim();
    const desig   = (item?.designation || "").toString().trim();
    const text    = (item?.text || "").toString().trim();

    if (!speaker || !desig) return false;

    const spWas = (sp[slotIndex].value || "").trim();
    const dsWas = (ds[slotIndex].value || "").trim();

    // don't overwrite
    if (spWas || dsWas) return false;

    sp[slotIndex].value = speaker;
    ds[slotIndex].value = desig;

    if (tx && tx[slotIndex] && !((tx[slotIndex].value || "").trim()) && text) {
      tx[slotIndex].value = text;
    }

    // trigger input events
    try { sp[slotIndex].dispatchEvent(new Event("input", { bubbles: true })); } catch(e){}
    try { ds[slotIndex].dispatchEvent(new Event("input", { bubbles: true })); } catch(e){}
    if (tx && tx[slotIndex]) { try { tx[slotIndex].dispatchEvent(new Event("input", { bubbles: true })); } catch(e){} }

    return true;
  }

  function render(list) {
    suggestions = Array.isArray(list) ? list : [];

    // âœ… keep suggestions in memory for pushToBytes
    window.__NG_EE_SUGGEST = suggestions;
    window.__NG_EE_SUGGESTIONS = suggestions; // backward alias

    eeList.innerHTML = "";

    if (!suggestions.length) {
      showEmpty(true);
      btnPush.disabled = true;
      btnClear.disabled = true;
      return;
    }

    showEmpty(false);

    suggestions.forEach((b, i) => {
      const speaker = esc(b.speaker || "Unknown");
      const desig   = esc(b.designation || "");
      const text    = esc(b.text || "");

      const card = document.createElement("label");
      card.style.cssText =
        "border:1px solid #ddd;border-radius:12px;padding:10px;display:block;margin:10px 0;cursor:pointer;";

      card.innerHTML = `
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <input type="checkbox" data-i="${i}" style="margin-top:3px;">
          <div style="flex:1;">
            <div style="font-weight:700;">${speaker}</div>
            <div style="opacity:.75;font-size:12px;margin-top:2px;">${desig}</div>
            <div style="margin-top:8px;line-height:1.35;">${text}</div>
          </div>
        </div>
      `;
      eeList.appendChild(card);
    });

    updateButtons();
  }

  function clearAll() {
    render([]);
  }

  function getCheckedIndices() {
    return [...eeList.querySelectorAll('input[type="checkbox"][data-i]:checked')]
      .map(cb => Number(cb.getAttribute("data-i")))
      .filter(n => Number.isFinite(n) && n >= 0);
  }

  function pushToBytes() {
    const idxs = getCheckedIndices();
    if (!idxs.length) return;

    const dupeSet = existingByteSet();
    const pushedRun = new Set();
    let pushed = 0;

    for (const idx of idxs) {
      const item = suggestions[idx];
      if (!item) continue;

      const speaker = (item.speaker || "").toString().trim();
      const desig   = (item.designation || "").toString().trim();
      const text    = (item.text || "").toString().trim();

      const key = `${normKeyLocal(speaker)}|${normKeyLocal(desig)}|${normKeyLocal(text)}`;

      // âœ… no duplicates: already in bytes OR already pushed in this click
      if (dupeSet.has(key) || pushedRun.has(key)) continue;

      // find next empty slot and ensure rows
      const slot = findFirstEmptySlot();
      ensureByteRows(slot + 1);

      const ok = fillSlot(slot, { speaker, designation: desig, text });

      // âœ… only if filled successfully: uncheck + count + add to sets
      if (ok) {
        const cb = eeList.querySelector(`input[type="checkbox"][data-i="${idx}"]`);
        if (cb) cb.checked = false;

        dupeSet.add(key);
        pushedRun.add(key);
        pushed++;
      }
    }

    if (pushed) console.log("[EE] Pushed to Bytes:", pushed);
    updateButtons();
  }

  // bind once
  if (!window.__NG_EE_WIRED) {
    window.__NG_EE_WIRED = true;

    eeList.addEventListener("change", updateButtons);

    btnPush.addEventListener("click", (e) => {
      e.preventDefault();
      pushToBytes();
    });

    btnClear.addEventListener("click", (e) => {
      e.preventDefault();
      clearAll();
    });
  }

  // expose renderer
  window.NG_setEditorialSuggestions = render;

  // initial empty
  render([]);
  console.log("[EE] initEditorialExtraction READY");
}

  // ---------------- ingest + hook NG_TRANSCRIPT ----------------
  window.NG_ingestTranscript = function (reverieJsonOrText) {
    const rawLines = collectCandidateLines(reverieJsonOrText, { maxNodes: 9000 });
    const best = pickBestLines(rawLines, 6, 10).map(x => ({
      speaker: x.speaker || "",
      designation: x.designation || "",
      text: x.text || ""
    }));

    // âœ… keep latest suggestions in memory (for pushToBytes fallback)
window.__NG_EE_SUGGEST = Array.isArray(best) ? best : [];

if (typeof window.NG_setEditorialSuggestions === "function") {
  window.NG_setEditorialSuggestions(best);
}

// âœ… after render, ensure push button state is correct
if (typeof syncEePushBtn === 'function') { syncEePushBtn(); }

console.log("[EE] Transcript â†’ suggestions:", best.length);
return best;
};  // closes window.NG_ingestTranscript


  (function hookTranscriptSetter() {
    if (window.__NG_TRANSCRIPT_HOOKED) return;
    window.__NG_TRANSCRIPT_HOOKED = true;

    let _t = window.NG_TRANSCRIPT;
    let _lastSig = "";

    function sigOf(v) {
      try {
        if (v == null) return "";
        if (typeof v === "string") return "str:" + v.slice(0, 120);
        return "obj:" + JSON.stringify(v).slice(0, 240);
      } catch {
        return "unk";
      }
    }

    function ingestSoon(v, reason) {
      const sig = sigOf(v);
      if (!sig || sig === _lastSig) return;
      _lastSig = sig;

      setTimeout(() => {
        try {
          if (typeof window.NG_ingestTranscript === "function") window.NG_ingestTranscript(v);
        } catch (e) {
          console.error("[EE] ingest error:", e);
        }
      }, 0);

      console.log("[EE] NG_TRANSCRIPT ingest (" + reason + ")");
    }

    try {
      Object.defineProperty(window, "NG_TRANSCRIPT", {
        configurable: true,
        get: function () { return _t; },
        set: function (v) { _t = v; ingestSoon(v, "setter"); }
      });
    } catch (e) {
      console.warn("[EE] NG_TRANSCRIPT hook failed (non-configurable).", e);
    }

    if (_t) ingestSoon(_t, "boot");
  })();

  // ---------------- Transcript JSON Loader ----------------
  (function initTranscriptJsonLoader() {
    const LS_KEY = "NG_REVERIE_TRANSCRIPT_JSON_V1";
    function $(id){ return document.getElementById(id); }

    function extractTranscriptText(obj) {
      if (typeof obj === "string") return obj;

      if (obj && typeof obj.display_text === "string" && obj.display_text.trim()) return obj.display_text;
      if (obj && typeof obj.text === "string" && obj.text.trim()) return obj.text;

      const cands = [obj?.result, obj?.output, obj?.data, obj?.transcript, obj?.transcription].filter(Boolean);
      for (const c of cands) {
        if (typeof c?.display_text === "string" && c.display_text.trim()) return c.display_text;
        if (typeof c?.text === "string" && c.text.trim()) return c.text;
      }

      const segs =
        obj?.segments || obj?.result?.segments || obj?.output?.segments || obj?.data?.segments ||
        obj?.utterances || obj?.result?.utterances || obj?.items;

      if (Array.isArray(segs) && segs.length) {
        const parts = segs.map(s =>
          (typeof s?.display_text === "string" && s.display_text.trim()) ? s.display_text :
          (typeof s?.text === "string" && s.text.trim()) ? s.text :
          (typeof s?.utterance === "string" && s.utterance.trim()) ? s.utterance :
          ""
        ).filter(Boolean);
        if (parts.length) return parts.join("\n");
      }

      return "";
    }

    function loadFromTextarea() {
      const ta = $("ta-transcript-json");
      if (!ta) return;

      const raw = (ta.value || "").trim();
      if (!raw) return;

      try { localStorage.setItem(LS_KEY, raw); } catch {}

      let parsed;
      try { parsed = JSON.parse(raw); } catch { parsed = raw; }

      const text = extractTranscriptText(parsed) || (typeof parsed === "string" ? parsed : "");
      window.NG_TRANSCRIPT = text; // âœ… sets extracted text
      console.log("[TL] NG_TRANSCRIPT set. chars:", (text || "").length);
/* === NG_TRANSCRIPT_LINES_RENDER_V1_START (20260131) === */
try {
  // Preview
  const prev = document.getElementById("ng-latest-transcript-preview");
  if (prev) prev.textContent = (text || "").slice(0, 1200);

  // Lines render
  const wrap = document.getElementById("ng-lines-wrap");
  const st = document.getElementById("ng-lines-status");
  const draft = document.getElementById("ng-byte-draft-text");

  if (wrap) {
    wrap.innerHTML = "";
    const lines = String(text || "")
      .split(/\r?\n+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (st) st.textContent = `Lines: ${lines.length}`;

    lines.forEach((ln, idx) => {
      const row = document.createElement("div");
      row.className = "ng-line";
      row.style.cssText = "display:flex;gap:10px;align-items:flex-start;cursor:pointer;user-select:none;";
      row.innerHTML = `
        <input type="checkbox" data-ln="${idx}" style="width:auto; margin-top:2px;">
        <div style="font-size:13px;line-height:1.35;">${ln.replace(/</g,"&lt;")}</div>
      `;
      row.addEventListener("click", (e) => {
        // toggle checkbox on row click (except direct click on checkbox keeps default)
        const cb = row.querySelector('input[type="checkbox"]');
        if (e.target && e.target.tagName !== "INPUT") cb.checked = !cb.checked;

        // update draft with checked lines
        if (draft) {
          const checked = Array.from(wrap.querySelectorAll('input[type="checkbox"]:checked'))
            .map(x => {
              const i = parseInt(x.getAttribute("data-ln"), 10);
              return lines[i] || "";
            })
            .filter(Boolean);
          draft.value = checked.join("\n");
          try { draft.dispatchEvent(new Event("input", { bubbles:true })); } catch(_){}
        }
      });
      wrap.appendChild(row);
    });
  }
} catch (e) {
  console.warn("[TL] lines render failed", e);
}
/* === NG_TRANSCRIPT_LINES_RENDER_V1_END === */


    }

    function boot() {
      const ta = $("ta-transcript-json");
      const btn = $("btn-load-transcript-json");

      try {
        const saved = localStorage.getItem(LS_KEY);
        if (ta && saved && !ta.value.trim()) ta.value = saved;
      } catch {}

      if (btn && !btn.__NG_BOUND) {
        btn.__NG_BOUND = true;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          loadFromTextarea();
        });
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
      boot();
    }
})();  // âœ… close Transcript Loader IIFE


  // ---------------- export global + auto init ----------------
  window.initEditorialExtraction = initEditorialExtraction;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEditorialExtraction, { once: true });
  } else {
    initEditorialExtraction();
  }



/* === NG_LINES_TO_BYTES_FINAL_FLOW_V1_START (20260131) === */
(() => {
  if (window.__NG_LINES_TO_BYTES_FINAL_FLOW_V1__) return;
  window.__NG_LINES_TO_BYTES_FINAL_FLOW_V1__ = true;

  // ---------- helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const norm = (s) => String(s || "")
    .replace(/\s+/g, " ")
    .replace(/^byte\s*\d+\s*/i, "")
    .replace(/^final\s*/i, "")
    .replace(/^byte\s*\d+\s*final\s*/i, "")
    .trim()
    .toLowerCase();

  function ensureFirstByteRow() {
    // Ensure at least 1 byte row exists
    if (!$('#ng-manual-bytes textarea.ng-byte-text')) {
      $('#addByteBtn')?.click();
    }
    return $('#ng-manual-bytes textarea.ng-byte-text');
  }

  function getSelectedTranscriptLines() {
    // Uses your rendered ng-line rows
    return $$('#ng-lines-wrap input[type="checkbox"][data-ln]:checked')
      .map(cb => cb.closest('.ng-line')?.textContent?.trim())
      .filter(Boolean);
  }

  function getLastEditedByteTextarea() {
    const ta = window.__NG_LAST_EDITED_BYTE__;
    const v = (ta && ta.value) ? ta.value.trim() : "";
    if (v) return ta;
    return null;
  }

  function pickByteText() {
    // Prefer last edited
    const last = getLastEditedByteTextarea();
    if (last) return { mode: "lastEdited", text: last.value.trim() };

    // Fallback: last non-empty row
    const tas = $$('#ng-manual-bytes textarea.ng-byte-text');
    for (let i = tas.length - 1; i >= 0; i--) {
      const v = (tas[i].value || "").trim();
      if (v) return { mode: "lastNonEmpty", text: v };
    }
    return null;
  }

  function finalHost() {
    return $('#ng-final-bytes-list-auto');
  }

  function getFinalTextsNormalized() {
    const host = finalHost();
    if (!host) return [];
    return $$('#ng-final-bytes-list-auto .ng-final-card').map(c => norm(c.textContent));
  }

  function isDuplicateFinal(text) {
    const n = norm(text);
    if (!n) return true;
    const finals = getFinalTextsNormalized();
    return finals.some(x => x === n || x.includes(n) || n.includes(x));
  }

  function appendFinalCard(text) {
    const host = finalHost();
    if (!host) return { ok: false, why: "no finals host" };

    const n = host.querySelectorAll('.ng-final-card').length + 1;

    const card = document.createElement('div');
    card.className = 'ng-final-card';
    card.style.cssText = "border:1px solid #e5e7eb;border-radius:12px;padding:10px;margin:8px 0;background:#fff;";

    const top = document.createElement('div');
    top.style.cssText = "display:flex;justify-content:space-between;gap:10px;align-items:flex-start;";

    const left = document.createElement('div');
    left.style.cssText = "font-weight:700;font-size:12px;opacity:.8;";
    left.textContent = `Byte ${n} Final`;

    const body = document.createElement('div');
    body.style.cssText = "white-space:pre-wrap; margin-top:6px; font-size:13px;";
    body.textContent = text;

    const wrap = document.createElement('div');
    wrap.style.cssText = "flex:1;";
    wrap.appendChild(left);
    wrap.appendChild(body);

    top.appendChild(wrap);
    card.appendChild(top);
    host.appendChild(card);

    return { ok: true, n };
  }

  // ---------- 1) Track last edited byte textarea ----------
  if (!window.__NG_LAST_EDITED_BYTE_TRACKER_V1__) {
    window.__NG_LAST_EDITED_BYTE_TRACKER_V1__ = true;
    document.addEventListener('input', (e) => {
      const ta = e.target;
      if (ta && ta.matches && ta.matches('#ng-manual-bytes textarea.ng-byte-text')) {
        window.__NG_LAST_EDITED_BYTE__ = ta;
      }
    }, true);
  }

  // ---------- 2) Transcript selection -> fill FIRST byte row ----------
  function pushSelectionToFirstByte() {
    const lines = getSelectedTranscriptLines();
    const txt = lines.join('\n');
    const ta = ensureFirstByteRow();
    if (!ta) return { ok: false, why: "no byte textarea" };
    ta.value = txt;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    return { ok: true, selected: lines.length, len: txt.length };
  }

  const linesWrap = $('#ng-lines-wrap');
  if (linesWrap && !window.__NG_LINES_TO_BYTES_WIRE_V1__) {
    window.__NG_LINES_TO_BYTES_WIRE_V1__ = true;
    linesWrap.addEventListener('change', (e) => {
      if (e.target && e.target.matches('input[type="checkbox"][data-ln]')) {
        pushSelectionToFirstByte();
      }
    }, true);
  }

  // ---------- 3) Final Bytes -> bytesJSONOut sync (schema: {ts, bytes:[...]}) ----------
  function syncFinalToJSONOut() {
    const host = finalHost();
    const out = $('#bytesJSONOut');
    if (!host || !out) return { ok: false, why: "missing host/out" };

    const cards = $$('#ng-final-bytes-list-auto .ng-final-card');
    const bytes = cards.map((card) => {
      // Remove "Byte N Final" labels from the beginning (best-effort)
      let t = (card.textContent || "").trim();
      t = t.replace(/^Byte\s*\d+\s*/i, '');
      t = t.replace(/^Final\s*/i, '');
      t = t.replace(/^Byte\s*\d+\s*Final\s*/i, '');
      t = t.replace(/^Byte\s*\d+Final/i, ''); // in case no spaces
      return { speaker: "", designation: "", text: t.trim() };
    }).filter(b => b.text);

    out.value = JSON.stringify({ ts: new Date().toISOString(), bytes }, null, 2);
    out.dispatchEvent(new Event('input', { bubbles: true }));
    return { ok: true, cards: cards.length, out_len: out.value.length };
  }

  // Observe finals host for changes
  const host = finalHost();
  if (host && window.MutationObserver && !window.__NG_FINAL_JSON_MO_V1__) {
    window.__NG_FINAL_JSON_MO_V1__ = true;
    const mo = new MutationObserver(() => { syncFinalToJSONOut(); });
    mo.observe(host, { childList: true, subtree: true });
    // initial sync (if anything exists)
    syncFinalToJSONOut();
  }

  // ---------- 4) Add to Bytes fallback (only if app doesn't add) + duplicate guard ----------
  const addBtn = $('#ng-add-final');
  if (addBtn && !window.__NG_ADD_FINAL_FALLBACK_V1__) {
    window.__NG_ADD_FINAL_FALLBACK_V1__ = true;

    addBtn.addEventListener('click', () => {
      const host0 = finalHost();
      if (!host0) return;

      const before = host0.querySelectorAll('.ng-final-card').length;

      setTimeout(() => {
        const after = host0.querySelectorAll('.ng-final-card').length;
        if (after > before) {
          // app added; just sync
          syncFinalToJSONOut();
          return;
        }

        const pick = pickByteText();
        if (!pick || !pick.text) return;

        if (isDuplicateFinal(pick.text)) {
          // duplicate -> do nothing
          return;
        }

        appendFinalCard(pick.text);
        syncFinalToJSONOut();
      }, 0);
    }, true);
  }

  // Debug helper (optional)
  window.NG_debugFlow = () => ({
    selectedCount: $$('#ng-lines-wrap input[type="checkbox"][data-ln]:checked').length,
    firstByteLen: ($('#ng-manual-bytes textarea.ng-byte-text')?.value || '').length,
    finalsCards: $$('#ng-final-bytes-list-auto .ng-final-card').length,
    jsonOutLen: ($('#bytesJSONOut')?.value || '').trim().length
  });

/* === NG_LINES_TO_BYTES_FINAL_FLOW_V1_END === */
})();








})();  // OUTER wrapper close for (function(){ at line 3


/* === NG_PROMPT_INJECT_ON_GENERATE_V1_START (20260131) === */
(() => {
  if (window.__NG_PROMPT_INJECT_ON_GENERATE_V1__) return; window.__NG_PROMPT_INJECT_ON_GENERATE_V1__ = true; return;
  window.__NG_PROMPT_INJECT_ON_GENERATE_V1__ = true;

  function $(sel){ return document.querySelector(sel); }

  function safeJSON(s){ try { return JSON.parse(s); } catch { return null; } }

  function val(id){
    const el = document.getElementById(id);
    return (el && typeof el.value === "string") ? el.value.trim() : "";
  }

  function bytesFromOut(){
    const out = document.getElementById("bytesJSONOut");
    const s = (out && out.value) ? out.value.trim() : "";
    if (!s) return [];
    const o = safeJSON(s);
    if (o && Array.isArray(o.bytes)) return o.bytes.filter(b => b && (b.text||"").trim());
    return [];
  }

  function ensurePromptField(form){
    let p = form.querySelector('input[name="prompt"], textarea[name="prompt"]');
    if (!p) {
      p = document.createElement("input");
      p.type = "hidden";
      p.name = "prompt";
      form.appendChild(p);
    }
    return p;
  }

  function findGenerateBtn(){
    const els = Array.from(document.querySelectorAll("button,input[type=submit],input[type=button]"));
    return els.find(el => {
      const t = (el.tagName === "INPUT" ? el.value : el.textContent) || "";
      return String(t).includes("Generate DIGI_PACK");
    });
  }

  const btn = findGenerateBtn();
  if (!btn) return;

  const form = btn.form || btn.closest("form");
  if (!form) return;

  btn.addEventListener("click", () => {
    try {
      const p = ensurePromptField(form);

      const payload = {
        topic: val("topic") || null,
        platform: val("platform") || null,
        angle: val("angle") || null,
        story_type: val("storyType") || null,
        what_happened: val("whatHappened") || null,
        sources: val("sources") || null,
        background: val("background") || null,
        bytes: bytesFromOut(),
        visuals: []  // visuals later; bytes fix is priority
      };

      p.value = JSON.stringify(payload);

      // Optional debug (won't break if console not open)
      try {
        console.log("[NG_PROMPT_INJECT] bytes:", (payload.bytes||[]).length, "promptLen:", p.value.length);
      } catch {}
    } catch (e) {
      try { console.warn("[NG_PROMPT_INJECT] failed", e); } catch {}
    }
  }, true);
})();
/* === NG_PROMPT_INJECT_ON_GENERATE_V1_END === */

/* === NG_PROMPT_INJECT_ON_GENERATE_V2_START (20260131) === */
(() => {
  if (window.__NG_PROMPT_INJECT_ON_GENERATE_V2__) return;
  window.__NG_PROMPT_INJECT_ON_GENERATE_V2__ = true;

  const qs = (sel, root=document) => root.querySelector(sel);
  const qsv = (sels, root=document) => {
    for (const s of sels) {
      const el = qs(s, root);
      if (!el) continue;
      const v = (el.value ?? el.textContent ?? "").toString().trim();
      if (v !== "") return v;
    }
    return "";
  };

  function bytesFromBytesJSONOut() {
    const ta = qs("#bytesJSONOut");
    if (!ta) return [];
    const raw = (ta.value || "").trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.bytes)) return parsed.bytes;
      if (parsed && parsed.latest && Array.isArray(parsed.latest.bytes)) return parsed.latest.bytes;
      return [];
    } catch (e) {
      return [];
    }
  }

  function ensurePromptField(form) {
    if (!form) return null;
    let inp = form.querySelector('input[name="prompt"]');
    if (!inp) {
      inp = document.createElement("input");
      inp.type = "hidden";
      inp.name = "prompt";
      form.appendChild(inp);
    }
    return inp;
  }

  function buildPromptPayload(form) {
    const topic = qsv(["#topic", '[name="topic"]', "#ng-topic", "#storyTopic"], form) || qsv(["#topic", '[name="topic"]', "#ng-topic", "#storyTopic"]);
    const platform = qsv(['[name="platform"]', "#platform"], form) || "Digital";
    const angle = qsv(["#angle", '[name="angle"]'], form) || "";
    const story_type = qsv(["#storyType", '[name="storyType"]', '[name="story_type"]'], form) || "developing";
    const what_happened = qsv(["#whatHappened", '[name="whatHappened"]', '[name="what_happened"]'], form) || "";
    const sources = qsv(["#sources", '[name="sources"]'], form) || "";
    const background = qsv(["#background", '[name="background"]'], form) || null;

    const bytes = bytesFromBytesJSONOut();
    return {
      topic: topic || "",
      platform: platform || "Digital",
      angle: angle || "",
      story_type: story_type || "developing",
      what_happened: what_happened || "",
      sources: sources || "",
      background: background || null,
      bytes: Array.isArray(bytes) ? bytes : [],
      visuals: []
    };
  }

  function shouldHandleTarget(t) {
    const el = t && (t.closest ? t.closest("button, input[type=submit], [role=button]") : null);
    const id = (el && el.id ? el.id : "") + " " + (t && t.id ? t.id : "");
    const txt = (el ? (el.innerText || el.value || "") : "").toString();
    return /digi|pack|generate/i.test(id) || /generate/i.test(txt) || /digi\s*pack/i.test(txt);
  }

  function injectNow(form) {
    const inp = ensurePromptField(form);
    if (!inp) return;
    const payload = buildPromptPayload(form);
    inp.value = JSON.stringify(payload);
    // debug stamp (safe)
    window.NG_LAST_PROMPT_V2 = { ts: new Date().toISOString(), bytesLen: (payload.bytes||[]).length };
    console.log("[NG_PROMPT_V2] injected prompt. bytesLen=", (payload.bytes||[]).length);
  }

  // Capture submit (most reliable)
  document.addEventListener("submit", (e) => {
    try {
      const form = e.target;
      if (!form || form.tagName !== "FORM") return;
      // handle only if this form likely triggers digi-pack
      const action = (form.getAttribute("action") || "").toLowerCase();
      if (action.includes("digi-pack") || qs('input[name="prompt"]', form) || qs("#topic", form) || qs("#generate", form)) {
        injectNow(form);
      }
    } catch(_) {}
  }, true);

  // Also capture click on Generate-like buttons
  document.addEventListener("click", (e) => {
    try {
      if (!shouldHandleTarget(e.target)) return;
      const form = e.target && e.target.closest ? e.target.closest("form") : null;
      if (form) injectNow(form);
    } catch(_) {}
  }, true);

})();
/* === NG_PROMPT_INJECT_ON_GENERATE_V2_END (20260131) === */
/* === NG_DIGIPACK_FETCH_PROMPT_OVERRIDE_V1_START (20260131) === */
(() => {
  if (window.__NG_DIGIPACK_FETCH_PROMPT_OVERRIDE_V1__) return;
  window.__NG_DIGIPACK_FETCH_PROMPT_OVERRIDE_V1__ = true;

  const origFetch = window.fetch;

  function bytesFromBytesJSONOut() {
    const ta = document.querySelector("#bytesJSONOut");
    if (!ta) return [];
    const raw = (ta.value || "").trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.bytes)) return parsed.bytes;
      if (parsed && parsed.latest && Array.isArray(parsed.latest.bytes)) return parsed.latest.bytes;
      return [];
    } catch (e) {
      return [];
    }
  }

  function getPromptFromHiddenInput() {
    const inp = document.querySelector('[name="prompt"]');
    const v = (inp && inp.value ? inp.value : "").trim();
    return v || "";
  }

  function normalizePromptString(promptStr) {
    // promptStr is expected to be a JSON string
    try {
      const pobj = JSON.parse(promptStr);
      const bytes = bytesFromBytesJSONOut();
      if (pobj && Array.isArray(bytes) && bytes.length) pobj.bytes = bytes;
      return JSON.stringify(pobj);
    } catch (e) {
      return promptStr; // leave as-is if not parseable
    }
  }

  window.fetch = function(input, init) {
    try {
      const url =
        (typeof input === "string" ? input :
        (input && typeof input.url === "string" ? input.url : "")) || "";

      const isDigiPack = /\/api\/digi-pack\b/i.test(url);

      if (isDigiPack && init && typeof init.body === "string") {
        const bodyStr = init.body.trim();
        if (bodyStr.startsWith("{")) {
          const bodyObj = JSON.parse(bodyStr);

           // If request has "prompt", ensure it uses latest bytes
// If client already sent story, do NOT override prompt (server requires story)
const hasStory = !!(bodyObj && bodyObj.story && String(bodyObj.story).trim());
if (!hasStory) {
  if (typeof bodyObj.prompt === "string") {
    // Prefer hidden prompt if present (already has all fields)
    const hidden = getPromptFromHiddenInput();
    bodyObj.prompt = hidden
      ? normalizePromptString(hidden)
      : normalizePromptString(bodyObj.prompt);
  } else {
    // If prompt missing, try set from hidden
    const hidden = getPromptFromHiddenInput();
    if (hidden) bodyObj.prompt = normalizePromptString(hidden);
  }
} // end guard

          init = Object.assign({}, init, { body: JSON.stringify(bodyObj) });
          console.log("[NG_FETCH_OVERRIDE] /api/digi-pack prompt overridden. bytesLen=",
            (() => { try { return JSON.parse(bodyObj.prompt||"{}").bytes?.length || 0; } catch(_) { return 0; } })()
          );
        }
      }
    } catch (e) {
      // swallow to avoid breaking fetch
    }
    return origFetch.apply(this, arguments);
  };

  console.log("[NG_FETCH_OVERRIDE] installed");
})();
/* === NG_DIGIPACK_FETCH_PROMPT_OVERRIDE_V1_END (20260131) === */

