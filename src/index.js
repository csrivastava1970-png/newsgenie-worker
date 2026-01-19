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
    // Transcript latest (safe Response; avoids worker hanging)
    if ((path === "/transcript/latest" || path === "/api/transcript/latest") && request.method === "GET") {
      const cors = (typeof corsHeaders === "function") ? corsHeaders(request) : {};
      const headers = Object.assign({ "content-type": "application/json; charset=utf-8" }, cors);
      return new Response(JSON.stringify({ ok: true, latest: null, text: "", ts: new Date().toISOString() }), { status: 200, headers });
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


    // fallback
    return json(
      { ok: false, ts: new Date().toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key, error: "Not found" },
      404,
      corsHeaders(request)
    );
  }
  // final fallback (guarantee Response)   return json({ ok:false, ts:new Date().toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key, error:"Not found" }, 404, corsHeaders(request));
}
}


