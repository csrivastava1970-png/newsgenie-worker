console.log("[NG_BOOT_SIG] src/index.js 20260119_162645");
// src/index.js  (BOOT v3: echo + openai mode)
// Root if (path === "/" && request.method === "GET") {   return new globalThis.Response("OK", { status: 200, headers: corsHeaders(request) }); } 
// Uses OpenAI Responses API + Structured Outputs (json_schema)

const ENTRY_MARKER = "BOOTv3-src-indexjs-openai";

function json(data, status = 200, extraHeaders = {}) {
  return new globalThis.Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function corsHeaders(req) {
  const origin = req.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

async function readJson(req) {
  const txt = await req.text();
  if (!txt) return {};
  const clean = txt.replace(/^\uFEFF/, ""); // ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ strip UTF-8 BOM
  try { return JSON.parse(clean); } catch { return { _raw: txt }; }
}


function safeParsePrompt(body) {
  // Accept:
  // 1) { prompt: "{...json...}" }
  // 2) { prompt: {...} }
  // 3) {...} (already the prompt object)
  let p = body?.prompt ?? body ?? {};
  if (typeof p === "string") {
    try { return JSON.parse(p); } catch { return { text: p }; }
  }
  return (p && typeof p === "object") ? p : { text: String(p ?? "") };
}

function extractOutputText(respJson) {
  // Response object example shows:
  // output[0].content[0].type === "output_text" and has "text"
  const out = respJson?.output || [];
  for (const item of out) {
    if (item?.type === "message" && item?.role === "assistant") {
      const content = item?.content || [];
      for (const c of content) {
        if (c?.type === "output_text" && typeof c?.text === "string") return c.text;
      }
    }
  }
  return null;
}

async function withTimeout(promise, ms, label = "timeout") {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(label), ms);
  try {
    return await promise(ac.signal);
  } finally {
    clearTimeout(t);
  }
}
// --- Durable Object: persistent store for /api/bytes/latest ---
export class BytesStore {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    // We only care about /api/bytes/latest (but safe even if forwarded differently)
    if (method === "GET") {
      const latest = (await this.state.storage.get("latest")) ?? null;
      const bytes = latest?.bytes ?? null;
      return new Response(
        JSON.stringify({ ok: true, latest, bytes, ts: new Date().toISOString() }),
        { headers: { "content-type": "application/json" } }
      );
    }

    if (method === "POST") {
      const body = await request.json().catch(() => null);
      // Normalize: allow either {bytes:[...]} or full payload
      const latest = body && typeof body === "object"
        ? body
        : { bytes: null, source: "invalid_body", ts: new Date().toISOString() };

      await this.state.storage.put("latest", latest);
      const bytes = latest?.bytes ?? null;

      return new Response(
        JSON.stringify({ ok: true, latest, bytes, ts: new Date().toISOString() }),
        { headers: { "content-type": "application/json" } }
      );
    }

    return new Response("Method Not Allowed", { status: 405 });
  }
}
// --- end BytesStore ---

export default {
  async fetch(request, env, ctx) {
    /* NG_HEALTH_ROUTE_V1 20260119_162140 */
    try {
      const __u = new URL(request.url);
      if (__u.pathname === "/health" || __u.pathname === "/api/health" || __u.pathname === "/api/health/") {
        return new Response(JSON.stringify({ ok: true, ts: new Date().toISOString(), entry: 'src/index.js' }), { status: 200, headers: { 'content-type': 'application/json; charset=utf-8' } });
      }
//       if (__u.pathname === '/') {
//         return new Response('OK', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
//       }
    } catch (e) { /* ignore */ }

    const url = new URL(request.url);
    let path = url.pathname;
    // NG_DIAG_ALIAS_V2 (2026-02-22): /api/diag -> /__diag_root
    if (path === "/api/diag" || path === "/api/diag/") path = "/__diag_root";
    // NG_DIAG_ROOT_V1_START (2026-02-14)
    if (path === "/__diag_root") {
      let assets_ok = !!(env && env.ASSETS);
      let assets_status = null;
      let assets_len = null;
      try{
        if (assets_ok) {
          const u2 = new URL(request.url);
          u2.pathname = "/index.html";
          const rr = await env.ASSETS.fetch(new Request(u2.toString(), { method: request.method, headers: request.headers, redirect: "follow" }));
          assets_status = rr.status;
          const txt = await rr.text();
          assets_len = txt.length;
        }
      }catch(e){
        assets_status = "ERR";
        assets_len = String(e && e.message ? e.message : e);
      }
return json({ ok:true, path, assets_ok, assets_status, assets_len }, 200, corsHeaders(request));
    }
    // NG_DIAG_ROOT_V1_END

    // NG_ASSETS_ROUTE_V1_START (2026-02-07)
    // Always RETURN a Response for static assets (prevents "Promise did not resolve to Response")
    if (env && env.ASSETS) {
      // Devtools sometimes probes this path; never crash
            if (path.startsWith("/.well-known/")) {
        return new Response("{}", { status: 200, headers: { "content-type": "application/json; charset=utf-8" } });
      }

      // Common browser probes â€” always return a Response
      if (path === "/favicon.ico" || path === "/robots.txt" || path === "/manifest.json") {
        try {
          const rrP = await env.ASSETS.fetch(request);
          return rrP; // serve if present
        } catch (e) {
          const ct = path.endsWith(".json") ? "application/json" : "text/plain";
          return new Response(path.endsWith(".json") ? "{}" : "", {
            status: 200,
            headers: { "content-type": ct + "; charset=utf-8" }
          });
        }
      }

      // --- NEW: map /public/* -> /* for Assets binding (prevents 500 on /public/js/...) ---
      if (path.startsWith("/public/")) {
        try {
          const u3 = new URL(request.url);
          u3.pathname = path.replace(/^\/public/, ""); // /public/js/x.js -> /js/x.js
          const req3 = new Request(u3.toString(), request);
          const rr3 = await env.ASSETS.fetch(req3);
          return rr3; // always Response
        } catch (e) {
          return new Response("ASSETS_PUBLIC_MAP_ERR: " + String(e && e.message ? e.message : e), {
            status: 500,
            headers: { "content-type": "text/plain; charset=utf-8" }
          });
        }
      }


      // Serve static files from /public via Assets binding
      if (
        path === "/" ||
        path.startsWith("/js/") ||
        path.startsWith("/css/") ||
        path.startsWith("/assets/") ||
        path.endsWith(".html")
      ) {
        // If root, serve index.html explicitly (prevents blank root)
        if (path === "/") {
          const u2 = new URL(request.url);
          u2.pathname = "/index.html";
          request = new Request(u2.toString(), request);
        }
        return env.ASSETS.fetch(request);
      }
    }
    // NG_ASSETS_ROUTE_V1_END
    // --- /api/bytes/latest via Durable Object (persistent) ---
    if (url.pathname === "/api/bytes/latest") {
      const id = env.BYTES_DO.idFromName("latest");
      const stub = env.BYTES_DO.get(id);
      return stub.fetch(request);
    }
    // --- end /api/bytes/latest ---

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new globalThis.Response(null, { status: 204, headers: corsHeaders(request) });
    }


    const has_openai_key = !!(env && env.OPENAI_API_KEY);

    // Ping
    if (path === "/ping") {
      return json(
        { ok: true, ts: new Date().toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key },
        200,
        corsHeaders(request)
      );
    }


// NG_PATCH_START:TRANSCRIPT_LATEST_V1
// Transcript latest (GET/POST; in-memory store; always returns Response)
if ((path === "/api/transcript/latest" || path === "/transcript/latest") && request.method === "POST") {
  const body = await readJson(request);
  const text = (body && body.text != null) ? String(body.text) : "";
  const latest = {
    text,
    source: (body && body.source != null) ? String(body.source) : null,
    ts: (body && body.ts) ? String(body.ts) : new Date().toISOString(),
  };

  globalThis.__NG_LATEST_TRANSCRIPT__ = latest;

  const cors = (typeof corsHeaders === "function") ? corsHeaders(request) : {};
  const headers = Object.assign({ "content-type": "application/json; charset=utf-8" }, cors);
  return new Response(JSON.stringify({ ok: true, latest, text: latest.text, ts: new Date().toISOString() }), { status: 200, headers });
}

if ((path === "/transcript/latest" || path === "/api/transcript/latest") && request.method === "GET") {
  const latest = globalThis.__NG_LATEST_TRANSCRIPT__ || null;
  const text = (latest && latest.text) ? String(latest.text) : "";
  const cors = (typeof corsHeaders === "function") ? corsHeaders(request) : {};
  const headers = Object.assign({ "content-type": "application/json; charset=utf-8" }, cors);
  return new Response(JSON.stringify({ ok: true, latest, text, ts: new Date().toISOString() }), { status: 200, headers });
}
// NG_PATCH_END:TRANSCRIPT_LATEST_V1
    // Digi-pack API
    if (path === "/api/digi-pack" && request.method === "POST") {
      const body = await readJson(request);
      const promptObj = safeParsePrompt(body);

 // NG_DEFAULT_FORMATS_V1 (2026-03-03): prevent blank StoryView when UI omits formats
try{
  if (!promptObj.formats || !Array.isArray(promptObj.formats) || !promptObj.formats.length){
    promptObj.formats = ["web","video","yt","reel","hook","social"];
  }
  if (!promptObj.language) promptObj.language = "hi";
  const __s = String((promptObj.story || promptObj.what_happened || "")).trim();
  if (!__s){
    const __t = String(promptObj.topic || "").trim();
    if (__t) promptObj.story = __t;
  }
}catch(e){}

const mode = String(env?.GEN_MODE || "echo").toLowerCase();
      const model = String(env?.OPENAI_MODEL || "gpt-4o");

      const max_output_tokens = Number(env?.MAX_OUTPUT_TOKENS || 4500);

      // Echo mode (old behavior)
      if (mode !== "openai" && mode !== "real") {
        return json(
          {
            ok: true,
            ts: new Date().toISOString(),
            path,
            mode,
            model,
            entry_marker: ENTRY_MARKER,
            has_openai_key,
            received: promptObj,
          },
          200,
          corsHeaders(request)
        );
      }

            if (!has_openai_key) {
        return json({ ok: false, path, entry_marker: ENTRY_MARKER, has_openai_key, error: "OPENAI_API_KEY missing" });
      }
/* NG_OPENAI_CALL_V1_START (20260210) */

        // === NG_OPENAI_FETCH_RETRY_V2_START (20260214) ===
        async function ngFetchWithRetry(url, opts, tries){
          tries = (tries == null ? 3 : tries);

          // expose retry stats for debugging (safe)
          const meta = { tries, attempts: 0, last_status: null, last_error: "" };

          let lastErr = null;
          for (let i=1;i<=tries;i++){
            meta.attempts = i;
            try{
              const resp = await fetch(url, opts);
              meta.last_status = resp ? resp.status : null;

              // Do NOT retry on 4xx (except 429). Those are schema/auth/validation issues.
              if (resp && resp.status >= 400 && resp.status <= 499 && resp.status !== 429){
                resp.__ngRetryMeta = meta;
                return resp;
              }

              // Retry on rate-limit and server errors
              if (resp && (resp.status === 429 || (resp.status >= 500 && resp.status <= 599))){
                lastErr = new Error("HTTP " + resp.status);
                meta.last_error = String(lastErr.message || lastErr);
              } else {
                resp.__ngRetryMeta = meta;
                return resp;
              }
            } catch(e){
              lastErr = e;
              meta.last_error = String((e && e.message) ? e.message : e);
            }

            // backoff: 300ms, 900ms, 1800ms (slightly more conservative)
            const ms = (i===1?300:(i===2?900:1800));
            try{ await new Promise(r=>setTimeout(r, ms)); }catch(e){}
          }

          const err = lastErr || new Error("ngFetchWithRetry failed");
          err.__ngRetryMeta = meta;
          throw err;
        }
        // === NG_OPENAI_FETCH_RETRY_V2_END ===
      // REAL/OpenAI mode: call OpenAI Responses API and return output_json for StoryView
      try {
        const __t0 = Date.now(); // NG_DIAG_TIMING_V1
        const lang = (promptObj && promptObj.language) ? String(promptObj.language) : "hi";
        const input =
`TOPIC: ${promptObj.topic || ""}
PLATFORM: ${promptObj.platform || ""}
STORY_TYPE: ${promptObj.story_type || ""}
ANGLE: ${promptObj.angle || ""}
WHAT_HAPPENED: ${promptObj.what_happened || ""}
SOURCES: ${promptObj.sources || ""}
BACKGROUND: ${promptObj.background || ""}
VISUALS_NOTES: ${promptObj.visuals_notes || ""}

VIDEO_DEMO_RULES (MANDATORY if VISUALS_NOTES present):
- If VISUALS_NOTES is non-empty, the "video_script.text" MUST be a CAPCUT-FRIENDLY VIDEO_ROUGH_CUT_PLAN.
- Use ONLY the shot codes listed in VISUALS_NOTES inventory (e.g., A1..A8). Do NOT invent new shots.
- Each beat MUST reference exactly one SHOT_CODE (A1..A8).
- Across the full plan, you MUST include ALL listed codes at least once (A1..A8 mandatory).
- If any listed shot is effectively missing/unclear, use fallback A2 or A6 (as per EDIT_RULES).
- Target total duration: 00:45 to 01:00.
- First 00:15 must be fast cuts (2â€“4 sec beats), then slightly longer beats.
- Prefer visual flow wide -> medium -> close-up when possible (within meeting sequence).
- Do NOT add facts beyond TOPIC/WHAT_HAPPENED/SOURCES/BACKGROUND. If unsure, keep VO neutral.

CAPCUT OUTPUT TEMPLATE (put EXACTLY inside video_script.text):
VIDEO_ROUGH_CUT_PLAN (CAPCUT)
TOTAL: mm:ss
FORMAT: 16:9
AUDIO: VO + NAT (optional low)

BEATS:
1) TIME: 00:00-00:03 | SHOT: A? | ON_SCREEN: (max 2 lines) | VO: (1-2 lines) | EDIT: (cut/style)
2) TIME: 00:03-00:06 | SHOT: A? | ON_SCREEN: ... | VO: ... | EDIT: ...
...
N) TIME: ...         | SHOT: A? | ON_SCREEN: ... | VO: ... | EDIT: ...

RULE_CHECK (must include):
- Used shots: A1,A2,A3,A4,A5,A6,A7,A8 (tick/cross)
- Any fallback used: (A2/A6)
- First 15s fast-cut satisfied: Yes/No

CAPCUT_IMPORT_NOTES:
- Import clips A1..A8
- Place beats in order, trim per TIME ranges
- Add on-screen text per beat
- Record VO per beat (or TTS), align to beats
- Export 1080p


OUTPUT REQUIREMENTS:
- Language: ${lang} (default hi)
- Return JSON only (schema enforced).
- Provide multiple DigiPack formats for editorial use:
  headline, summary, web_article, video_script, youtube, social_posts.

YOUTUBE_SCRIPT_RULES (MANDATORY):
- Put the full YouTube narration ONLY inside youtube.text (spoken anchor script).
- Length target: 5 to 6 minutes (approx 650–900 Hindi words).
- Tone: serious prime-time, factual, no slang, no overclaim.
- Structure: Hook (0:00) -> Context -> 2–3 clear segments -> Implications -> Wrap + one viewer question.
- Do NOT include hashtags, "LIKE/SHARE/SUBSCRIBE", "धन्यवाद", or channel promo lines inside youtube.text.
- Do NOT include placeholder links (example.com) inside youtube.text.
- NEVER output bracket placeholders like [...]
- If SOURCES is empty/weak, do NOT mention "source not provided" inside youtube.text; just keep language neutral.`;
        // Old-gold DigiPack schema (validator-safe): additionalProperties=false everywhere; nested objects minimal
        const schema = {
          type: "object",
          additionalProperties: false,
          properties: {
            topic: { type: "string" },
            language: { type: "string" },
            headline: { type: "string" },
            summary: { type: "string" },

            web_article: {
              type: "object",
              additionalProperties: false,
              properties: {
                headline: { type: "string" },
                dek: { type: "string" },
                subhead: { type: "string" },
                summary: { type: "string" },
                key_points: { type: "array", items: { type: "string" } },
                text: { type: "string", minLength: 1500 }
              },
              required: ["headline","dek","subhead","summary","key_points","text"]
            },

            video_script: {
              type: "object",
              additionalProperties: false,
              properties: { text: { type: "string", minLength: 900 } },
              required: ["text"]
            },

            youtube: {
              type: "object",
              additionalProperties: false,
              properties: { text: { type: "string", minLength: 1500 } },
              required: ["text"]
            },

            reel: {
              type: "object",
              additionalProperties: false,
              properties: { text: { type: "string", minLength: 220 } },
              required: ["text"]
            },

            hook: { type: "string", minLength: 80 },

            social: {
              type: "object",
              additionalProperties: false,
              properties: {
                x_post: { type: "string" },
                fb_post: { type: "string" },
                instagram_caption: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
                tags: { type: "array", items: { type: "string" } },
                text: { type: "string", minLength: 220 }
              },
              required: ["x_post","fb_post","instagram_caption","hashtags","tags","text"]
            }
          },
          required: ["topic","language","headline","summary","web_article","video_script","youtube","reel","hook","social"]
        };
        const openaiReq = {
          model,
          max_output_tokens,
          instructions: "You are a newsroom digital producer assistant. Create a clean, structured DigiPack in Hindi (and English only when unavoidable). Keep claims conservative; avoid inventing facts. NEVER output template placeholders like [अपना नाम], [स्रोत नहीं दिया गया], [न्यायाधीश का नाम]. If sources are missing, stay neutral—do NOT write 'source not provided' inside narrative fields; only reflect uncertainty neutrally.",
          input,
          text: {
            format: {
              type: "json_schema",
              name: "newsgenie_digi_pack",
               strict: true,
              schema
            }
          }
        };

        const r = await ngFetchWithRetry("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "Authorization": `Bearer ${env.OPENAI_API_KEY}`
  },
  body: JSON.stringify(openaiReq)
});

// --- DIAG: capture raw body for non-OK + easier debugging ---
const raw = await r.text().catch(() => "");
let data = {};
try { data = raw ? JSON.parse(raw) : {}; } catch(e) { data = {}; }

try {
  console.error("[NG_OPENAI_SUCCESS_SHAPE]", {
    has_output_text: !!(data && typeof data.output_text === "string" && data.output_text),
    output_len: Array.isArray(data && data.output) ? data.output.length : 0,
    output_types: Array.isArray(data && data.output) ? data.output.map(x => x && x.type) : [],
    first_output: Array.isArray(data && data.output) && data.output[0] ? data.output[0] : null
  });
} catch(_) {}

if (!r.ok) {
  try {
    console.error("[NG_OPENAI_HTTP_ERROR]", {
      status: r.status,
      statusText: r.statusText,
      body_first400: String(raw || "").slice(0, 400)
    });
  } catch(_) {}

  // Bubble up a useful error instead of opaque OPENAI_CALL_FAILED
  throw new Error(`OPENAI_HTTP_${r.status}: ${String(raw || "").slice(0, 600)}`);
}

        let outText = (data && typeof data.output_text === "string") ? data.output_text : "";
        if (!outText && data && Array.isArray(data.output)) {
          try {
            for (const it of data.output) {
              if (it && it.type === "message" && Array.isArray(it.content)) {
                for (const c of it.content) {
                  if (c && c.type === "output_text" && typeof c.text === "string") outText += c.text;
                }
              }
            }
          } catch (e) {}
        }

       // Parse JSON if possible; otherwise keep raw output
let outJson = null;
let parsedOk = false;
try { outJson = JSON.parse(outText); parsedOk = true; } catch(e) { parsedOk = false; }
try{
  // If model returned JSON as a string (double-encoded), unwrap it
  if (parsedOk && typeof outJson === "string" && outJson.trim().startsWith("{")) { outJson = JSON.parse(outJson); }
  // If parse failed, strip fences and extract first { ... last } anywhere
  if (!parsedOk) {
    const s = String(outText||"").replace(/```(?:json)?/ig,"").trim();
    const a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a >= 0 && b > a) { outJson = JSON.parse(s.slice(a, b+1)); parsedOk = true; }
  }
}catch(_){ parsedOk = false; }
        // Normalize to "old-gold" DIGI_PACK formats[] if the model returned the classic object schema
        // (web_article / video_script / youtube / reel / social / hook, etc.)
        try{
          if (parsedOk && outJson && typeof outJson === "object" && !Array.isArray(outJson)) {
            const og = outJson; // candidate old-gold object
            const hasOldGold =
              (og.web_article || og.video_script || og.youtube || og.reel || og.social || og.hook || og.opening || og.one_liner);

            if (hasOldGold) {
              const s = (v) => (v == null ? "" : (typeof v === "string" ? v : JSON.stringify(v, null, 2)));
              const block = (title, obj) => {
                if (!obj) return "";
                if (typeof obj === "string") return obj.trim();
                if (typeof obj !== "object") return String(obj).trim();
                // common fields pretty-print (extended for web_article + social)
                const parts = [];

                // headlines/titles
                if (obj.headline) parts.push(String(obj.headline).trim());
                if (obj.title && !obj.headline) parts.push(String(obj.title).trim());

                // web_article style fields
                if (obj.dek) parts.push("DEK: " + String(obj.dek).trim());
                if (obj.subhead) parts.push("SUBHEAD: " + String(obj.subhead).trim());
                if (obj.summary) parts.push(String(obj.summary).trim());

                // scripts / bodies
                if (obj.script) parts.push(String(obj.script).trim());
                if (obj.text) parts.push(String(obj.text).trim());
                if (obj.body) parts.push(String(obj.body).trim());

                // social pack fields
                if (obj.instagram_caption) parts.push("INSTAGRAM: " + String(obj.instagram_caption).trim());
                if (obj.x_post) parts.push("X: " + String(obj.x_post).trim());
                if (obj.fb_post) parts.push("FB: " + String(obj.fb_post).trim());
                if (obj.whatsapp) parts.push("WHATSAPP: " + String(obj.whatsapp).trim());

                // lists
                if (Array.isArray(obj.key_points) && obj.key_points.length) parts.push("KEY POINTS:\n" + obj.key_points.map(x=>"- "+String(x)).join("\n"));
                if (Array.isArray(obj.hashtags) && obj.hashtags.length) parts.push("HASHTAGS: " + obj.hashtags.map(x=>String(x)).join(" "));
                if (Array.isArray(obj.tags) && obj.tags.length) parts.push("TAGS: " + obj.tags.map(x=>String(x)).join(" | "));
                if (Array.isArray(obj.bullets)) parts.push(obj.bullets.map(x=>"- "+String(x)).join("\n"));
                if (Array.isArray(obj.points)) parts.push(obj.points.map(x=>"- "+String(x)).join("\n"));

                if (!parts.length) parts.push(s(obj));
                return parts.filter(Boolean).join("\n\n").trim();
              };

              const topic2 = String(og.topic || promptObj.topic || "").trim();

              outJson = {
                language: String(og.language || lang || "hi").trim(),
                topic: topic2,
                headline: og.headline || og.title || "",
                summary: og.summary || "",
                web_article: og.web_article || null,
                 social: og.social || null,
                 formats: [
                  { key:"web",   title:"Web Article", text: block("Web Article", og.web_article) },
                  { key:"video", title:"Video Script", text: block("Video Script", og.video_script) },
                  { key:"yt",    title:"YouTube", text: block("YouTube", og.youtube) },
                  { key:"reel",  title:"Reel / Shorts", text: block("Reel", og.reel) },
                  { key:"hook",  title:"Reel Hook", text: String(og.hook || og.opening || og.hook_line || og.one_liner || "").trim() },
                  { key:"social",title:"Social Pack", text: block("Social", og.social) }
                 ]
               };
            }
          }
        }catch(e){}

        if (!outJson) {
          outJson = { language: lang, topic: String(promptObj.topic || ""), formats: [] };
        }

        
    // NG_HOOK_AUTOFILL_V1 (2026-02-22): if top-level hook is blank but formats[] has hook, fill it
    try{
      if (outJson && (!outJson.hook || !String(outJson.hook).trim()) && Array.isArray(outJson.formats)) {
        const hk = outJson.formats.find(x => x && x.key === "hook");
        if (hk && hk.text && String(hk.text).trim()) outJson.hook = String(hk.text).trim();
      }
    }catch(e){}

    // NG_HI_ONLY_SANITIZE_V1 (2026-02-22): strip accidental Urdu/Arabic script from HI outputs
    try{
      const L = String((outJson && outJson.language) || (promptObj && promptObj.lang) || (body && body.lang) || "").toLowerCase();
      if (L === "hi") {
        const stripAr = (v) => {
          const t = String(v || "");
          // Arabic/Urdu block: \u0600-\u06FF (keeps Devanagari intact)
          return t.replace(/[\u0600-\u06FF]+/g, "").replace(/[ ]{2,}/g," ").trim();
        };

        // web_article fields
        if (outJson.web_article) {
          if (outJson.web_article.text) outJson.web_article.text = stripAr(outJson.web_article.text);
          if (outJson.web_article.dek) outJson.web_article.dek = stripAr(outJson.web_article.dek);
          if (outJson.web_article.subhead) outJson.web_article.subhead = stripAr(outJson.web_article.subhead);
          if (outJson.web_article.summary) outJson.web_article.summary = stripAr(outJson.web_article.summary);
        }

        // formats text
        if (Array.isArray(outJson.formats)) {
          outJson.formats = outJson.formats.map(x => x && x.text ? ({...x, text: stripAr(x.text)}) : x);
        }

        // top-level hook (if present)
        if (outJson.hook) outJson.hook = stripAr(outJson.hook);

        // social pack free-text (keep x/fb/insta fields as-is; they are already HI)
        if (outJson.social && outJson.social.text) outJson.social.text = stripAr(outJson.social.text);
      }
    }catch(e){}
        // === NG_SOCIAL_CLEAN_APPLY_AT_DPACK_V1_START (2026-02-22) ===
        try{
          if (outJson && outJson.formats && Array.isArray(outJson.formats)) {
            // find social pack by key OR legacy outJson.social.text
            for (let i=0;i<outJson.formats.length;i++){
              const fx = outJson.formats[i];
              if (fx && (fx.key==="social" || fx.title==="Social Pack") && typeof fx.text==="string"){
                outJson.formats[i] = { ...fx, text: NG_socialClean(fx.text) };
              }
            }
          }
          if (outJson && outJson.social && typeof outJson.social.text==="string"){
            outJson.social.text = NG_socialClean(outJson.social.text);
          }
        }catch(e){}
        // === NG_SOCIAL_CLEAN_APPLY_AT_DPACK_V1_END ===
        // === NG_WEB_YT_CLEAN_APPLY_AT_DPACK_V1_START (2026-02-22) ===
        try{
          if (outJson && outJson.web_article && typeof outJson.web_article.text==="string"){
            outJson.web_article.text = NG_stripWebBoiler(outJson.web_article.text);
          }
          if (outJson && Array.isArray(outJson.formats)) {
            outJson.formats = outJson.formats.map(fx => {
              if (!fx || typeof fx.text !== "string") return fx;
              if (fx.key === "web")     return { ...fx, text: NG_stripWebBoiler(fx.text) };
              if (String(fx.key||"").toLowerCase()==="youtube" || String(fx.key||"").toLowerCase()==="yt" || String(fx.title||"").toLowerCase().includes("youtube")) return { ...fx, text: NG_tameYouTube(fx.text) };
              return fx;
            });
          }
        }catch(e){}
        if (outJson && outJson.youtube && typeof outJson.youtube.text==="string" ){ outJson.youtube.text = NG_tameYouTube(outJson.youtube.text); }
        // === NG_WEB_YT_CLEAN_APPLY_AT_DPACK_V1_END ===
        // NG_FLATTEN_FORMATS_TO_TOPLEVEL_V1 (2026-03-01): DP UI expects top-level fields, but model may return formats[]
        try{
          if (outJson && Array.isArray(outJson.formats)) for (const f of outJson.formats){
            const k=String((f&&f.key)||"").toLowerCase(), t=(f&&typeof f.text==="string")?f.text:""; if(!t) continue;
            if(k==="web" && !outJson.web_article) outJson.web_article={text:t};
            else if(k==="video" && !outJson.video_script) outJson.video_script={text:t};
            else if((k==="yt"||k==="youtube") && !outJson.youtube) outJson.youtube={text:t};
            else if(k==="reel" && !outJson.reel) outJson.reel={text:t};
            else if(k==="social" && !outJson.social) outJson.social={text:t};
            else if(k==="headline" && !outJson.headline) outJson.headline=t;
            else if(k==="summary" && !outJson.summary) outJson.summary=t;
            else if(k==="hook" && (!outJson.hook||!String(outJson.hook).trim())) outJson.hook=t;
          }
        }catch(e){}
        // NG_FORCE_OUTPUT_TEXT_JSON_V1 (2026-03-03): keep UI stable; StoryView parses output_text
        try{ if (outJson && typeof outJson === "object") outText = JSON.stringify(outJson); }catch(e){}
return json(
          { ok:true, ts:new Date().toISOString(), path, mode, model, entry_marker: ENTRY_MARKER, has_openai_key, output_text: outText, output_json: outJson  },
          200,
          corsHeaders(request)
        );
      } catch (e) {
        return json(
          { ok:false, ts:new Date().toISOString(), path, mode, model, entry_marker: ENTRY_MARKER, has_openai_key, error:"OPENAI_CALL_FAILED", detail: String((e && e.message) ? e.message : e) },
          500,
          corsHeaders(request)
        );
      }
/* NG_OPENAI_CALL_V1_END (20260210) */
    // fallback
    return json(
      { ok: false, ts: new Date().toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key, error: "Not found" },
      404,
      corsHeaders(request)
    );
  }
  // final fallback (guarantee Response)       // NG_WEB_FIRSTLINE_HARDLOCK_V1 (2026-02-22): keep web format on-topic (guard against drift)
    try{
      const topicHL = String((outJson && outJson.topic) || (promptObj && promptObj.topic) || (body && body.topic) || "").trim();
      if (topicHL && outJson && Array.isArray(outJson.formats)) {
        const toks = topicHL.split(/\s+/).filter(Boolean).slice(0,2);
        const idx = outJson.formats.findIndex(x => x && x.key === "web");
        if (idx >= 0) {
          const t = String(outJson.formats[idx].text || "").trim();
          const first = (t.split(/\r?\n/)[0] || "").trim();
          const off = (!first) || (toks.length && !toks.some(k => first.includes(k)));
          if (off) {
            outJson.formats[idx].text = (topicHL + "\n\n" + t).trim();
          }
        }
      }
}catch(e){}
return json({ ok:false, ts:new Date().toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key, error:"Not found" }, 404, corsHeaders(request));
}
}




























// === NG_SOCIAL_CLEAN_V1_START (2026-02-22) ===
function NG_socialClean(txt){
  txt = String(txt || "");

  // Remove obvious tool/prompt leakage lines/snippets
  txt = txt.replace(/assistant\s+to=[^\n]*\n?/gi, "");
  txt = txt.replace(/```[\s\S]*?```/g, ""); // fenced blocks
  txt = txt.replace(/`+/g, "");            // stray backticks
  txt = txt.replace(/^\s*[\}\]]+\s*/g, ""); // stray leading braces

  // Keep only the structured block: from INSTAGRAM: ... through TAGS:
  const i = txt.search(/\bINSTAGRAM\s*:/i);
  if (i >= 0) txt = txt.slice(i);

  // Cut after TAGS: line (keep that line)
  const m = txt.match(/[\s\S]*?\bTAGS\s*:[^\n]*/i);
  if (m && m[0]) txt = m[0];

  return txt.trim();
}
// === NG_SOCIAL_CLEAN_V1_END ===

try{
  if (outJson && outJson.formats && outJson.formats.social && typeof outJson.formats.social.text === "string"){
    outJson.formats.social.text = NG_socialClean(outJson.formats.social.text);
  }
} catch(e){}
// === NG_SOCIAL_CLEAN_APPLY_V1_END ===




/* === NG_WEB_YT_CLEAN_V1_START (2026-02-22) === */
function NG_stripWebBoiler(txt){
  txt = String(txt || "");
  txt = txt.replace(/\bSubject to updates as the situation develops\.?\b/gi, "");
  txt = txt.replace(/\bArchive\.[^\n]*\b/gi, "");
  txt = txt.replace(/\bA merge solution might be necessary[^\n]*\b/gi, "");
  txt = txt.replace(/\bSplitting for flow might be unnecessary[^\n]*\b/gi, "");
  txt = txt.replace(/\bGovernance\.[^\n]*\b/gi, "");
  txt = txt.replace(/\bA new directive may be forthcoming[^\n]*\b/gi, "");
  txt = txt.replace(/\bConclusion is pending\.[^\n]*\b/gi, "");
  txt = txt.replace(/\bThis notice will be updated[^\n]*\b/gi, "");
  txt = txt.replace(/\bLegislation may be in order[^\n]*\b/gi, "");
  txt = txt.replace(/\bFurther press releases will outline[^\n]*\b/gi, "");
  txt = txt.replace(/\bContinuations thereof will transpire[^\n]*\b/gi, "");
  txt = txt.replace(/\bEnsure legal governance[^\n]*\b/gi, "");
  txt = txt.replace(/\bMaintain the notion of transparency[^\n]*\b/gi, "");
  txt = txt.replace(/\n{3,}/g, "\n\n").trim();
  return txt;
}
function NG_tameYouTube(txt){
  txt = String(txt || "");
  txt = txt.replace(/[\u2600-\u27BF]/g, "");
  txt = txt.replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]/g, "");
  const tags = txt.match(/#[^\s#]+/g) || [];
  if (tags.length > 18){
    txt = txt.replace(/(#[^\s#]+\s*)+/g, "").trim();
    txt = (txt + "\n\n" + tags.slice(0,18).join(" ")).trim();
  }
  return txt.replace(/\n{3,}/g, "\n\n").trim();
}
/* === NG_WEB_YT_CLEAN_V1_END === */


