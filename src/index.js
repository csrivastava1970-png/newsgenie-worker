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

    // NG_ASSETS_ROUTE_V1_START (2026-02-07)
    // Always RETURN a Response for static assets (prevents "Promise did not resolve to Response")
    if (env && env.ASSETS) {
      // Devtools sometimes probes this path; never crash
      if (path.startsWith("/.well-known/")) {
        return new Response("{}", { status: 200, headers: { "content-type": "application/json; charset=utf-8" } });
      }

      // Serve static files from /public via Assets binding
      if (
        path === "/" ||
        path.startsWith("/js/") ||
        path.startsWith("/css/") ||
        path.startsWith("/assets/") ||
        path.endsWith(".html")
      ) {
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

      const mode = String(env?.GEN_MODE || "echo").toLowerCase();
      const model = String(env?.OPENAI_MODEL || "gpt-4o");

      const max_output_tokens = Number(env?.MAX_OUTPUT_TOKENS || 2200);

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
      // REAL/OpenAI mode: call OpenAI Responses API and return output_json for StoryView
      try {
        const lang = (promptObj && promptObj.language) ? String(promptObj.language) : "hi";
        const input =
`TOPIC: ${promptObj.topic || ""}
PLATFORM: ${promptObj.platform || ""}
STORY_TYPE: ${promptObj.story_type || ""}
ANGLE: ${promptObj.angle || ""}
WHAT_HAPPENED: ${promptObj.what_happened || ""}
SOURCES: ${promptObj.sources || ""}
BACKGROUND: ${promptObj.background || ""}

OUTPUT REQUIREMENTS:
- Language: ${lang} (default hi)
- Return JSON only (schema enforced).
- Provide multiple DigiPack formats for editorial use:
  headline, summary, web_article, video_script, youtube_script, social_posts.`;

        // Old-gold DigiPack schema (validator-safe): additionalProperties=false everywhere; nested objects minimal
        const schema = {
          type: "object",
          additionalProperties: false,
          properties: {
            topic: { type: "string" },
            language: { type: "string" },

            web_article: {
              type: "object",
              additionalProperties: false,
              properties: { text: { type: "string" } },
              required: ["text"]
            },

            video_script: {
              type: "object",
              additionalProperties: false,
              properties: { text: { type: "string" } },
              required: ["text"]
            },

            youtube: {
              type: "object",
              additionalProperties: false,
              properties: { text: { type: "string" } },
              required: ["text"]
            },

            reel: {
              type: "object",
              additionalProperties: false,
              properties: { text: { type: "string" } },
              required: ["text"]
            },

            hook: { type: "string" },

            social: {
              type: "object",
              additionalProperties: false,
              properties: { text: { type: "string" } },
              required: ["text"]
            }
          },
          required: ["topic","language","web_article","video_script","youtube","reel","hook","social"]
        };
        const openaiReq = {
          model,
          max_output_tokens,
          instructions: "You are a newsroom digital producer assistant. Create a clean, structured DigiPack. Keep claims conservative; avoid inventing facts. If sources are missing, clearly say 'source not provided' where relevant.",
          input,
          text: {
            format: {
              type: "json_schema",
              name: "newsgenie_digi_pack",
              schema
            }
          }
        };

        const r = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${env.OPENAI_API_KEY}`
          },
          body: JSON.stringify(openaiReq)
        });

        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          return json(
            { ok:false, ts:new Date().toISOString(), path, mode, model, entry_marker: ENTRY_MARKER, has_openai_key, error:"OPENAI_API_ERROR", status:r.status, details:data },
            502,
            corsHeaders(request)
          );
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
                // common fields pretty-print
                const parts = [];
                if (obj.headline) parts.push(String(obj.headline).trim());
                if (obj.title && !obj.headline) parts.push(String(obj.title).trim());
                if (obj.summary) parts.push(String(obj.summary).trim());
                if (obj.script) parts.push(String(obj.script).trim());
                if (obj.text) parts.push(String(obj.text).trim());
                if (obj.body) parts.push(String(obj.body).trim());
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
                formats: [
                  { key:"web",   title:"Web Article", text: block("Web Article", og.web_article) },
                  { key:"video", title:"Video Script", text: block("Video Script", og.video_script) },
                  { key:"yt",    title:"YouTube", text: block("YouTube", og.youtube) },
                  { key:"reel",  title:"Reel / Shorts", text: block("Reel", og.reel) },
                  { key:"hook",  title:"Reel Hook", text: String(og.hook || og.opening || og.hook_line || og.one_liner || "").trim() },
                  { key:"social",title:"Social Pack", text: block("Social", og.social) },
                  { key:"raw",   title:"Raw Output", text: String(outText || "").trim() }
                ]
              };
            }
          }
        }catch(e){}

        if (!outJson) {
          outJson = { language: lang, topic: String(promptObj.topic || ""), formats: [{ key:"raw", title:"Raw Output", text: String(outText || "") }] };
        }

        return json(
          { ok:true, ts:new Date().toISOString(), path, mode, model, entry_marker: ENTRY_MARKER, has_openai_key, output_text: outText, output_json: outJson },
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
  // final fallback (guarantee Response)   return json({ ok:false, ts:new Date().toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key, error:"Not found" }, 404, corsHeaders(request));
}
}







