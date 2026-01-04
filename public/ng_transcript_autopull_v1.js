/* NG_TRANSCRIPT_AUTOPULL_V1 (isolated file) */
(function () {
  if (window.NG_TRANSCRIPT_AUTOPULL_V1) return;
  window.NG_TRANSCRIPT_AUTOPULL_V1 = true;

  function pickText(payload) {
    if (!payload) return "";
    return String(
      payload.display_text ||
      payload.text ||
      payload.transcript ||
      payload.raw ||
      ""
    );
  }

  // Silent by default; enable logs with ?debug=1
  function dlog() {
    try {
      if (/[?&]debug=1\b/.test(location.search)) console.log.apply(console, arguments);
    } catch (e) {}
  }

  window.NG_fetchLatestTranscript = async function () {
    try {
      const r = await fetch("/api/transcript/latest", { cache: "no-store" });
      const j = await r.json();

      if (!j || !j.ok) {
        console.error("[NG_AUTOPULL] No transcript yet", j);
        return j;
      }

      const payload = j.payload || {};
const txt = pickText(payload) || JSON.stringify(payload);

// ✅ also show in the existing Paste box (visual confirmation)
try {
  var ta =
    document.querySelector('textarea[name="transcript_json"]') ||
    document.querySelector('#transcript_json') ||
    document.querySelector('textarea[placeholder*="Paste Reverie"]') ||
    document.querySelector('textarea[placeholder*="Paste JSON"]');

  if (ta && ta.value !== txt) ta.value = txt;
} catch (e) {}

try {
  localStorage.setItem("NG_TRANSCRIPT_LAST", txt);
  localStorage.setItem("NG_TRANSCRIPT_LAST_TS", j.ts || new Date().toISOString());
} catch (e) {}


      if (typeof window.NG_ingestTranscript === "function") {
        window.NG_ingestTranscript(txt);
        dlog("[NG_AUTOPULL] Ingested via NG_ingestTranscript", { ts: j.ts, len: txt.length });
      } else if (typeof window.NG_setEditorialSuggestions === "function") {
        window.NG_setEditorialSuggestions(txt);
        dlog("[NG_AUTOPULL] Sent to NG_setEditorialSuggestions", { ts: j.ts, len: txt.length });
      } else {
        console.error("[NG_AUTOPULL] No ingest hook found. Saved to localStorage only.", { ts: j.ts, len: txt.length });
      }

      return { ok: true, ts: j.ts, len: txt.length };
    } catch (err) {
      console.error("[NG_AUTOPULL] Error", err);
      return { ok: false, error: String((err && err.message) || err) };
    }
  };

  dlog("[NG_AUTOPULL] Loaded ✓");
})();
