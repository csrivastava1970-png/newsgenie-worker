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
  const clean = txt.replace(/^\uFEFF/, ""); // ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ strip UTF-8 BOM
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
      if (__u.pathname === '/') {
        return new Response('OK', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
      }
    } catch (e) { /* ignore */ }

    const url = new URL(request.url);
    const path = url.pathname;
/* === NG_STUB_MISSING_UI_JS_V1_START (20260201) === */
if (
  path === "/ng_toolbar_actions_v1.js" ||
  path === "/js/ng_toolbar_actions_v1.js" ||
  path === "/ng_prompt_builder_v1.js" ||
  path === "/js/ng_prompt_builder_v1.js"
) {
  const body =
    path.includes("toolbar_actions")
      ? "// TEMP STUB: ng_toolbar_actions_v1.js (missing)\nwindow.__NG_TOOLBAR_ACTIONS_STUB__=true;\n"
      : "// TEMP STUB: ng_prompt_builder_v1.js (missing)\nwindow.__NG_PROMPT_BUILDER_STUB__=true;\n";

  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/javascript; charset=utf-8" },
  });
}
/* === NG_STUB_MISSING_UI_JS_V1_END === */


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
    // --- NG_ASSETS_FALLBACK_V1_START (20260201) ---
    // If this is not an API route, try serving static assets from /public
    // This prevents "Promise did not resolve to Response" on missing return paths.
    try {
      const p = new URL(request.url).pathname || "/";
      const isApi = p === "/health" || p.startsWith("/api/");
      if (!isApi && env && env.ASSETS && typeof env.ASSETS.fetch === "function") {
        return env.ASSETS.fetch(request);
      }
    } catch (e) { /* ignore */ }
    // --- NG_ASSETS_FALLBACK_V1_END ---



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

      const mode = String(env?.GEN_MODE || "echo").toLowerCase();
      const model = String(env?.OPENAI_MODEL || "gpt-4o");
      const max_output_tokens = Number(env?.MAX_OUTPUT_TOKENS || 2200);

      // Echo mode (old behavior)
      if (mode !== "openai") {
        return json(
          {
            ok: true,
            ts: new Date().toISOString(),
            path,
            mode,
            model,
            max_output_tokens,
            entry_marker: ENTRY_MARKER,
            has_openai_key,
            received: promptObj,
          },
          200,
          corsHeaders(request)
        );
      }

      // OpenAI mode requested but key missing
      if (!has_openai_key) {
        return json(
          { ok: false, ts: new Date().toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key, error: "OPENAI_API_KEY missing" },
          400,
          corsHeaders(request)
        );
      }

      // If openai mode is enabled but implementation is incomplete, fail safely.
      return json(
        { ok: false, ts: new Date().toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key, error: "OpenAI mode not configured in this build" },
        501,
        corsHeaders(request)
      );
    }

    // Final fallback (guarantee Response for every request)
    return json(
      { ok: false, ts: new Date().toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key, error: "Not found" },
      404,
      corsHeaders(request)
    );
  }
};


