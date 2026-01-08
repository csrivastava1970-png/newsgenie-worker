var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var ENTRY_MARKER = "BOOTv3-src-indexjs-openai-V3V9";
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}
__name(json, "json");
function corsHeaders(req) {
  const origin = req.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
async function readJson(req) {
  const txt = await req.text();
  if (!txt) return {};
  const clean = txt.replace(/^\uFEFF/, "");
  try {
    return JSON.parse(clean);
  } catch {
    return { _raw: txt };
  }
}
__name(readJson, "readJson");
function safeParsePrompt(body) {
  let p = body?.prompt ?? body ?? {};
  if (typeof p === "string") {
    try {
      return JSON.parse(p);
    } catch {
      return { text: p };
    }
  }
  return p && typeof p === "object" ? p : { text: String(p ?? "") };
}
__name(safeParsePrompt, "safeParsePrompt");
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    var NG_CORS_HEADERS = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Max-Age": "86400"
    };
    function NG_json(obj, status) {
      return new Response(JSON.stringify(obj), {
        status: status || 200,
        headers: Object.assign({ "content-type": "application/json; charset=utf-8" }, NG_CORS_HEADERS)
      });
    }
    __name(NG_json, "NG_json");
    globalThis.__NG_TRANSCRIPT_LATEST = globalThis.__NG_TRANSCRIPT_LATEST || null;
    if (url.pathname.indexOf("/api/transcript") === 0 && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: NG_CORS_HEADERS });
    }
    if (url.pathname === "/api/transcript" && request.method === "POST") {
      var ct = (request.headers.get("content-type") || "").toLowerCase();
      var raw = await request.text();
      if (!raw || raw.length < 2) return NG_json({ ok: false, error: "Empty body" }, 400);
      if (raw.length > 2e6) return NG_json({ ok: false, error: "Too large (max ~2MB)" }, 413);
      var payload = null;
      if (ct.indexOf("application/json") >= 0 || raw.trim().charAt(0) === "{" || raw.trim().charAt(0) === "[") {
        try {
          payload = JSON.parse(raw);
        } catch (e) {
          return NG_json({ ok: false, error: "Invalid JSON" }, 400);
        }
      } else {
        payload = { text: String(raw) };
      }
      globalThis.__NG_TRANSCRIPT_LATEST = {
        ts: (/* @__PURE__ */ new Date()).toISOString(),
        bytes: raw.length,
        content_type: ct || "unknown",
        payload
      };
      return NG_json({ ok: true, ts: globalThis.__NG_TRANSCRIPT_LATEST.ts, bytes: raw.length }, 200);
    }
    if (url.pathname === "/api/transcript/latest" && request.method === "GET") {
      if (!globalThis.__NG_TRANSCRIPT_LATEST) {
        return NG_json({ ok: false, error: "No transcript yet" }, 404);
      }
      return NG_json(Object.assign({ ok: true }, globalThis.__NG_TRANSCRIPT_LATEST), 200);
    }
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204, headers: { "cache-control": "public, max-age=86400" } });
    }
    {
      const __u = new URL(request.url);
      const __p = __u.pathname;
      if (__p === "/.well-known/appspecific/com.chrome.devtools.json" || __p.startsWith("/.well-known/")) {
        return new Response(null, { status: 204, headers: { "cache-control": "public, max-age=86400" } });
      }
      const __cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Max-Age": "86400"
      };
      const __json = /* @__PURE__ */ __name((obj, status = 200) => new Response(
        JSON.stringify(obj, null, 2),
        { status, headers: { ...__cors, "content-type": "application/json; charset=utf-8" } }
      ), "__json");
      if (__p === "/api/ping") {
        return __json({ ok: true, tag: "V3V9", ts: (/* @__PURE__ */ new Date()).toISOString(), entry_marker: ENTRY_MARKER }, 200);
      }
      if (__p === "/api/digi-pack" && request.method === "OPTIONS") {
        return new Response("", { status: 204, headers: __cors });
      }
      if (__p === "/api/digi-pack" && request.method === "POST") {
        const __r = await (async () => {
          const has_openai_key2 = !!(env && (env.OPENAI_API_KEY || env.OPENAI_KEY));
          if (!has_openai_key2) {
            return __json({ ok: false, ts: (/* @__PURE__ */ new Date()).toISOString(), path: __p, entry_marker: ENTRY_MARKER, has_openai_key: has_openai_key2, error: "Missing OPENAI_API_KEY" }, 400);
          }
          const body = await request.json().catch(() => ({}));
          const raw2 = body && body.prompt != null ? String(body.prompt) : "";
          const V3_PREFIX = `You are NewsGenie DigiPack Generator V3 (Hindi newsroom).

STRICT OUTPUT RULES:
- Output PLAIN TEXT only. NO JSON. NO Markdown. No code fences.
- Headings MUST start at column 1 (no leading spaces).
- Use EXACT headings (each on its own line, ALL CAPS):
### HEADLINE
### DEK
### KEY_POINTS
### WEB_ARTICLE
### VIDEO
### YOUTUBE
### SOCIAL

HARD CONSTRAINTS (must pass):
### HEADLINE
- One line Hindi headline, max 12 words.
- No quotes, no source names, no emojis.

### DEK
- One line Hindi dek (supporting line), max 18 words.

### KEY_POINTS
- EXACTLY 5 bullets.
- Each bullet <= 12 words.
- No speculation. If unverified, write: "??? ?????? ???? ??".

### WEB_ARTICLE
- Hindi web article: 500\uFFFD600 words (stay within range).
- 4\uFFFD7 short paragraphs. Publish-ready. No bullet lists.
- Do NOT print word count.

### VIDEO
- Line 1: HOOK: <one crisp hook line>
- Line 2: LINES:
- Then EXACTLY 8\uFFFD12 numbered VO lines using 1) 2) 3) ...
- Each VO line <= 16 words. Hindi.

### YOUTUBE
TITLE: (one line)
DESCRIPTION: 120\uFFFD180 words Hindi (no bullets).
TAGS: 12\uFFFD18 comma-separated
HASHTAGS: 3\uFFFD5

### SOCIAL
X: <= 280 characters (max 2 hashtags)
INSTAGRAM: caption + 8\uFFFD12 hashtags
FACEBOOK: 2\uFFFD3 short paragraphs
WHATSAPP: 3\uFFFD5 short lines
END after WHATSAPP.

FACT GUARD (non-negotiable):
- Never invent names, quotes, numbers, dates, places.
- If any critical detail is not in inputs, write "??? ?????? ???? ??" and keep it general.
- Do not put source names inside sections; rely on the user's Sources/References field only.`;
          const prompt = V3_PREFIX + "\n\nINPUT_JSON:\n" + raw2 + "\n";
          const model = env && (env.OPENAI_MODEL || env.MODEL) ? env.OPENAI_MODEL || env.MODEL : "gpt-4o";
          const key = env.OPENAI_API_KEY || env.OPENAI_KEY;
          const resp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "content-type": "application/json", "authorization": "Bearer " + key },
            body: JSON.stringify({ model, temperature: 0.4, max_tokens: 2200, messages: [{ role: "user", content: prompt }] })
          });
          const data = await resp.json().catch(() => ({}));
          let text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? String(data.choices[0].message.content) : "";
          if (!resp.ok) {
            return __json({ ok: false, ts: (/* @__PURE__ */ new Date()).toISOString(), path: __p, entry_marker: ENTRY_MARKER, has_openai_key: has_openai_key2, error: "OpenAI error", status: resp.status, details: data }, 500);
          }
          const __normalizeHeadings = /* @__PURE__ */ __name((s) => String(s || "").replace(/^\s*###\s+WEB_ARTICLE\s*$/gm, "### WEB_ARTICLE").replace(/^\s*###\s+VIDEO\s*$/gm, "### VIDEO").replace(/^\s*###\s+YOUTUBE\s*$/gm, "### YOUTUBE").replace(/^\s*###\s+SOCIAL\s*$/gm, "### SOCIAL"), "__normalizeHeadings");
          text = __normalizeHeadings(text);
          const __section = /* @__PURE__ */ __name((all, head) => {
            const re = new RegExp("^\\s*###\\s+" + head + "\\s*\\n([\\s\\S]*?)(?=^\\s*###\\s+|\\Z)", "m");
            const m = String(all || "").match(re);
            return m ? m[1].trim() : "";
          }, "__section");
          const __wc = /* @__PURE__ */ __name((s) => String(s || "").trim().split(/\s+/).filter(Boolean).length, "__wc");
          const __web = __section(text, "WEB_ARTICLE");
          const __video = __section(text, "VIDEO");
          const __yt = __section(text, "YOUTUBE");
          const __social = __section(text, "SOCIAL");
          const __webWords = __wc(__web);
          let __ytDesc = "";
          {
            const m = __yt.match(/DESCRIPTION:\s*([\s\S]*?)\nTAGS:/i);
            __ytDesc = m ? m[1].trim() : "";
          }
          const __ytDescWords = __wc(__ytDesc);
          let __igHashCount = 0;
          {
            const m = __social.match(/INSTAGRAM:\s*([\s\S]*?)\nFACEBOOK:/i);
            const ig = m ? m[1].trim() : "";
            __igHashCount = (ig.match(/#[^\s#]+/g) || []).length;
          }
          let __xLen = 0;
          {
            const m = __social.match(/X:\s*([\s\S]*?)\nINSTAGRAM:/i);
            const x = m ? m[1].trim() : "";
            __xLen = x.length;
          }
          let __vLines = 0;
          {
            const lines = __video.split("\n").map((s) => s.trim()).filter(Boolean);
            __vLines = lines.filter((l) => /^(\(?\d+\)?[.)])\s+/.test(l)).length;
          }
          const __missingSection = !__web || !__video || !__yt || !__social;
          const __needFix = __missingSection || (__webWords < 500 || __webWords > 600) || (__ytDescWords < 120 || __ytDescWords > 180) || (__igHashCount < 8 || __igHashCount > 12) || __xLen > 280 || (__vLines < 8 || __vLines > 12);
          let __didRepair = false;
          let __repairPasses = 0;
          if (__needFix) {
            const FIX_PROMPT = `Your previous output FAILED DigiPack V3 constraints.
Rewrite the FULL output to PASS ALL constraints EXACTLY.
Return PLAIN TEXT only with the SAME 4 headings at column 1.
Do NOT add explanations.

Must pass:
- WEB_ARTICLE: 500\uFFFD600 Hindi words (4\uFFFD7 paragraphs, no bullets)
- VIDEO: HOOK + EXACT 8\uFFFD12 numbered lines using 1) 2) ... (<=16 words each)
- YOUTUBE DESCRIPTION: 120\uFFFD180 words
- SOCIAL: X <=280 chars (max 2 hashtags); Instagram 8\uFFFD12 hashtags

INPUT_JSON:
${raw2}

FAILED_OUTPUT:
${text}`;
            const resp2 = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: { "content-type": "application/json", "authorization": "Bearer " + key },
              body: JSON.stringify({ model, temperature: 0.2, max_tokens: 2200, messages: [{ role: "user", content: FIX_PROMPT }] })
            });
            const data2 = await resp2.json().catch(() => ({}));
            const text2 = data2 && data2.choices && data2.choices[0] && data2.choices[0].message && data2.choices[0].message.content ? String(data2.choices[0].message.content) : "";
            if (resp2.ok && text2) {
              text = text2;
              __didRepair = true;
              __repairPasses = 1;
            }
          }
          function __replaceSection(fullText, sectionName, newBody) {
            fullText = String(fullText || "");
            newBody = String(newBody || "").trim();
            const hdrRe = new RegExp("^###\\s+" + sectionName + "\\s*$", "m");
            const m = fullText.match(hdrRe);
            if (!m) {
              return (fullText.trimEnd() + "\n\n### " + sectionName + "\n" + newBody + "\n").trimEnd() + "\n";
            }
            const hdrLine = m[0];
            const startIdx = fullText.indexOf(hdrLine);
            const afterHdr = fullText.slice(startIdx + hdrLine.length);
            const nextIdx = afterHdr.search(/^###\s+[A-Z0-9_]+\s*$/m);
            const tail = nextIdx === -1 ? "" : afterHdr.slice(nextIdx);
            const head = fullText.slice(0, startIdx);
            return (head + hdrLine + "\n" + newBody + "\n\n" + tail.replace(/^\n+/, "")).trimEnd() + "\n";
          }
          __name(__replaceSection, "__replaceSection");
          let __webOnlyWords = 0;
          let __webOnlyTries = 0;
          const __webAfter = __section(text, "WEB_ARTICLE");
          const __webAfterWords = __wc(__webAfter);
          const __stillBadWeb = __webAfterWords < 500 || __webAfterWords > 600;
          let web3 = "";
          if (__stillBadWeb) {
            for (let attempt = 1; attempt <= 3; attempt++) {
              __webOnlyTries = attempt;
              const note = attempt === 1 ? "" : `Previous attempt was ${__webOnlyWords} words. Rewrite to 560\uFFFD590 words exactly. Keep exactly 6 paragraphs.`;
              const WEB_ONLY_PROMPT = `You are fixing ONLY the WEB_ARTICLE section of a V3 publish pack. Write ONLY the Hindi WEB_ARTICLE BODY (NO headings, NO bullets). Target 560\uFFFD590 words, EXACTLY 6 short paragraphs.

HARD RULES:
- Total length: 560\uFFFD590 words (must be within range).
- Exactly 6 paragraphs separated by a blank line.
- Each paragraph roughly 90\uFFFD100 words.
- Publish-ready Hindi, no bullet lists.
- Do NOT include headings.
- Do NOT include word count.
${note}

INPUT_JSON:
${raw2}`;
              const resp3 = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { "content-type": "application/json", "authorization": "Bearer " + key },
                body: JSON.stringify({ model, temperature: 0.2, max_tokens: 2600, messages: [{ role: "user", content: WEB_ONLY_PROMPT }] })
              });
              const data3 = await resp3.json().catch(() => ({}));
              web3 = data3 && data3.choices && data3.choices[0] && data3.choices[0].message && data3.choices[0].message.content ? String(data3.choices[0].message.content).trim() : "";
              __webOnlyWords = __wc(web3);
              if (resp3.ok && web3 && __webOnlyWords >= 500 && __webOnlyWords <= 600) break;
            }
            if (web3 && (__webOnlyWords < 500 || __webOnlyWords > 600)) {
              const EXPAND_PROMPT = `Rewrite the following Hindi article to 560\uFFFD590 words.
Keep exactly 6 paragraphs separated by a blank line.
No bullets. No headings. No word count.

ARTICLE:
${web3}`;
              const resp4 = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { "content-type": "application/json", "authorization": "Bearer " + key },
                body: JSON.stringify({ model, temperature: 0.2, max_tokens: 2600, messages: [{ role: "user", content: EXPAND_PROMPT }] })
              });
              const data4 = await resp4.json().catch(() => ({}));
              const web4 = data4 && data4.choices && data4.choices[0] && data4.choices[0].message && data4.choices[0].message.content ? String(data4.choices[0].message.content).trim() : "";
              const w4 = __wc(web4);
              if (resp4.ok && web4 && w4 >= 500 && w4 <= 600) {
                web3 = web4;
                __webOnlyWords = w4;
                __webOnlyTries = __webOnlyTries + 1;
              }
            }
            if (web3 && __webOnlyWords >= 500 && __webOnlyWords <= 600) {
              text = __normalizeHeadings(text);
              text = text.replace(
                /(^\s*###\s+WEB_ARTICLE\s*\n)([\s\S]*?)(?=^\s*###\s+|\Z)/m,
                function(_, h) {
                  return h + web3.trim() + "\n\n";
                }
              );
              text = __normalizeHeadings(text);
              __didRepair = true;
              __repairPasses = 2;
            }
          }
          return __json({
            ok: true,
            ts: (/* @__PURE__ */ new Date()).toISOString(),
            path: __p,
            entry_marker: ENTRY_MARKER,
            has_openai_key: has_openai_key2,
            model,
            generated_text: text,
            v3_debug: {
              webWords: __wc(__section(text, "WEB_ARTICLE")),
              didRepair: __didRepair,
              repairPasses: __repairPasses,
              webOnlyWords: __webOnlyWords,
              webOnlyTries: __webOnlyTries
            }
          }, 200);
        })();
        return __r instanceof Response ? __r : __json({ ok: false, ts: (/* @__PURE__ */ new Date()).toISOString(), path: __p, error: "BUG: /api/digi-pack returned non-Response", gotType: typeof __r }, 500);
      }
    }
    {
      let __ngJson = function(obj, status = 200) {
        return new Response(JSON.stringify(obj, null, 2), {
          status,
          headers: { ...__NG_CORS, "content-type": "application/json; charset=utf-8" }
        });
      };
      __name(__ngJson, "__ngJson");
      const __NG_URL = new URL(request.url);
      const __NG_PATH = __NG_URL.pathname;
      const __NG_CORS = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Max-Age": "86400"
      };
      if (__NG_PATH === "/api/ping") {
        return __ngJson({ ok: true, tag: "V3V9", ts: (/* @__PURE__ */ new Date()).toISOString() }, 200);
      }
      if (__NG_PATH === "/api/digi-pack" && request.method === "OPTIONS") {
        return new Response("", { status: 204, headers: __NG_CORS });
      }
      if (__NG_PATH === "/api/digi-pack" && request.method === "POST") {
        return (async () => {
          const has_openai_key2 = !!(env && (env.OPENAI_API_KEY || env.OPENAI_KEY));
          const entry_marker = typeof ENTRY_MARKER !== "undefined" ? ENTRY_MARKER : "NO_ENTRY_MARKER";
          try {
            const body = await request.json().catch(() => ({}));
            const rawPrompt = body && body.prompt != null ? String(body.prompt) : "";
            const V3_PREFIX = `You are NewsGenie DigiPack Generator V3 (Hindi newsroom).

STRICT OUTPUT RULES:
- Output PLAIN TEXT only. NO JSON. NO Markdown tables. No code fences.
- Use EXACT headings (each on its own line, all caps):
### WEB_ARTICLE
### VIDEO
### YOUTUBE
### SOCIAL

REQUIREMENTS:
### WEB_ARTICLE
- Hindi web article: 500\u2013600 words (stay within range).
- 3\u20136 short paragraphs. Publish-ready. No bullets.

### VIDEO
- HOOK: (one line)
- LINES:
- Then 8\u201312 numbered lines (1) ... (2) ... short VO lines.

### YOUTUBE
TITLE:
DESCRIPTION:
TAGS: (12\u201318 comma-separated)
HASHTAGS: (3\u20135)

### SOCIAL
X:
INSTAGRAM:
FACEBOOK:
WHATSAPP:
End after WHATSAPP.`;
            let prompt = V3_PREFIX + "\n\nINPUT_JSON:\n" + rawPrompt + "\n";
            if (!has_openai_key2) {
              return __ngJson({ ok: false, ts: (/* @__PURE__ */ new Date()).toISOString(), path: __NG_PATH, entry_marker, has_openai_key: has_openai_key2, error: "Missing OPENAI_API_KEY" }, 400);
            }
            const model = env && (env.OPENAI_MODEL || env.MODEL) ? env.OPENAI_MODEL || env.MODEL : "gpt-4o";
            const key = env.OPENAI_API_KEY || env.OPENAI_KEY;
            const resp = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: { "content-type": "application/json", "authorization": "Bearer " + key },
              body: JSON.stringify({ model, temperature: 0.4, max_tokens: 2200, messages: [{ role: "user", content: prompt }] })
            });
            const data = await resp.json().catch(() => ({}));
            const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? String(data.choices[0].message.content) : "";
            if (!resp.ok) {
              return __ngJson({ ok: false, ts: (/* @__PURE__ */ new Date()).toISOString(), path: __NG_PATH, entry_marker, has_openai_key: has_openai_key2, error: "OpenAI error", status: resp.status, details: data }, 500);
            }
            return __ngJson({ ok: true, ts: (/* @__PURE__ */ new Date()).toISOString(), path: __NG_PATH, entry_marker, has_openai_key: has_openai_key2, model, generated_text: text }, 200);
          } catch (err) {
            return __ngJson({ ok: false, ts: (/* @__PURE__ */ new Date()).toISOString(), path: __NG_PATH, entry_marker, has_openai_key: has_openai_key2, error: String(err && err.message ? err.message : err) }, 500);
          }
        })();
      }
    }
    const path = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    const has_openai_key = !!(env && env.OPENAI_API_KEY);
    if (path === "/ping") {
      return json(
        { ok: true, ts: (/* @__PURE__ */ new Date()).toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key },
        200,
        corsHeaders(request)
      );
    }
    if (path === "/api/digi-pack" && request.method === "POST") {
      const body = await readJson(request);
      const promptObj = safeParsePrompt(body);
      const mode = String(env?.GEN_MODE || "echo").toLowerCase();
      const model = String(env?.OPENAI_MODEL || "gpt-4o");
      const max_output_tokens = Number(env?.MAX_OUTPUT_TOKENS || 2200);
      if (mode !== "openai") {
        return json(
          {
            ok: true,
            ts: (/* @__PURE__ */ new Date()).toISOString(),
            path,
            mode,
            model,
            entry_marker: ENTRY_MARKER,
            has_openai_key,
            received: promptObj
          },
          200,
          corsHeaders(request)
        );
      }
      if (!has_openai_key) {
        return json({ ok: false, path, entry_marker: ENTRY_MARKER, has_openai_key, error: "OPENAI_API_KEY missing" });
      }
      return json(
        { ok: false, ts: (/* @__PURE__ */ new Date()).toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key, error: "Not found" },
        404,
        corsHeaders(request)
      );
    }
  }
};

// ../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-oPiCS5/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-oPiCS5/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
