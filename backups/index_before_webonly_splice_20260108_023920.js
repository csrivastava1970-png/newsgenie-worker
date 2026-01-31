// src/index.js  (BOOT v3: echo + openai mode)
// Uses OpenAI Responses API + Structured Outputs (json_schema)

const ENTRY_MARKER = "BOOTv3-src-indexjs-openai-V3V9";


function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
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
  const clean = txt.replace(/^\uFEFF/, ""); // âœ… strip UTF-8 BOM
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

async function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(label + " timeout")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}


export default {
  async fetch(request, env, ctx) {
// ? guard: favicon should never break the worker
const url = new URL(request.url);
/* NG_TRANSCRIPT_INBOX_V1_START */

// CORS headers (local dev safe)
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

// In-memory latest transcript (dev)
globalThis.__NG_TRANSCRIPT_LATEST = globalThis.__NG_TRANSCRIPT_LATEST || null;

// CORS preflight for transcript endpoints
if (url.pathname.indexOf("/api/transcript") === 0 && request.method === "OPTIONS") {
  return new Response(null, { status: 204, headers: NG_CORS_HEADERS });
}

// POST /api/transcript  (accept JSON or plain text)
if (url.pathname === "/api/transcript" && request.method === "POST") {
  var ct = (request.headers.get("content-type") || "").toLowerCase();
  var raw = await request.text();

  if (!raw || raw.length < 2) return NG_json({ ok: false, error: "Empty body" }, 400);
  if (raw.length > 2000000) return NG_json({ ok: false, error: "Too large (max ~2MB)" }, 413);

  var payload = null;

  // If JSON or looks like JSON -> parse, else store as text
  if (ct.indexOf("application/json") >= 0 || raw.trim().charAt(0) === "{" || raw.trim().charAt(0) === "[") {
    try { payload = JSON.parse(raw); }
    catch (e) { return NG_json({ ok: false, error: "Invalid JSON" }, 400); }
  } else {
    payload = { text: String(raw) };
  }

  globalThis.__NG_TRANSCRIPT_LATEST = {
    ts: new Date().toISOString(),
    bytes: raw.length,
    content_type: ct || "unknown",
    payload: payload
  };

  return NG_json({ ok: true, ts: globalThis.__NG_TRANSCRIPT_LATEST.ts, bytes: raw.length }, 200);
}

// GET /api/transcript/latest
if (url.pathname === "/api/transcript/latest" && request.method === "GET") {
  if (!globalThis.__NG_TRANSCRIPT_LATEST) {
    return NG_json({ ok: false, error: "No transcript yet" }, 404);
  }
  return NG_json(Object.assign({ ok: true }, globalThis.__NG_TRANSCRIPT_LATEST), 200);
}

/* NG_TRANSCRIPT_INBOX_V1_END */

if (url.pathname === "/favicon.ico") {
  return new Response(null, { status: 204, headers: { "cache-control": "public, max-age=86400" } });
}

/* NG_TOP_ROUTE_HOOK_V3V9_START */
{
const __u = new URL(request.url);
const __p = __u.pathname;

// ---- DEVTOOLS / WELL-KNOWN GUARDS ----
if (__p === "/.well-known/appspecific/com.chrome.devtools.json" || __p.startsWith("/.well-known/")) {
  return new Response(null, { status: 204, headers: { "cache-control": "public, max-age=86400" } });
}




  const __cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Max-Age": "86400"
  };

  const __json = (obj, status = 200) => new Response(
    JSON.stringify(obj, null, 2),
    { status, headers: { ...__cors, "content-type": "application/json; charset=utf-8" } }
  );

  // ? PING (proves code is LIVE)
  if (__p === "/api/ping") {
    return __json({ ok: true, tag: "V3V9", ts: new Date().toISOString(), entry_marker: ENTRY_MARKER }, 200);
  }

  // ? DigiPack V3 route (kills 404)
  if (__p === "/api/digi-pack" && request.method === "OPTIONS") {
    return new Response("", { status: 204, headers: __cors });
  }

  if (__p === "/api/digi-pack" && request.method === "POST") {
       const __r = await (async () => {

      const has_openai_key = !!(env && (env.OPENAI_API_KEY || env.OPENAI_KEY));
      if (!has_openai_key) {
        return __json({ ok:false, ts:new Date().toISOString(), path:__p, entry_marker: ENTRY_MARKER, has_openai_key, error:"Missing OPENAI_API_KEY" }, 400);
      }

      const body = await request.json().catch(() => ({}));
      const raw = (body && body.prompt != null) ? String(body.prompt) : "";

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
- Hindi web article: 500–600 words (stay within range).
- 4–7 short paragraphs. Publish-ready. No bullet lists.
- Do NOT print word count.

### VIDEO
- Line 1: HOOK: <one crisp hook line>
- Line 2: LINES:
- Then EXACTLY 8–12 numbered VO lines using 1) 2) 3) ...
- Each VO line <= 16 words. Hindi.

### YOUTUBE
TITLE: (one line)
DESCRIPTION: 120–180 words Hindi (no bullets).
TAGS: 12–18 comma-separated
HASHTAGS: 3–5

### SOCIAL
X: <= 280 characters (max 2 hashtags)
INSTAGRAM: caption + 8–12 hashtags
FACEBOOK: 2–3 short paragraphs
WHATSAPP: 3–5 short lines
END after WHATSAPP.

FACT GUARD (non-negotiable):
- Never invent names, quotes, numbers, dates, places.
- If any critical detail is not in inputs, write "??? ?????? ???? ??" and keep it general.
- Do not put source names inside sections; rely on the user's Sources/References field only.`;

      const prompt = V3_PREFIX + "\n\nINPUT_JSON:\n" + raw + "\n";

      const model = (env && (env.OPENAI_MODEL || env.MODEL)) ? (env.OPENAI_MODEL || env.MODEL) : "gpt-4o";
      const key   = (env.OPENAI_API_KEY || env.OPENAI_KEY);

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type":"application/json", "authorization":"Bearer " + key },
        body: JSON.stringify({ model, temperature: 0.4, max_tokens: 2200, messages: [{ role:"user", content: prompt }] })
});

      const data = await resp.json().catch(() => ({}));
      let text = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)

        ? String(data.choices[0].message.content) : "";

      if (!resp.ok) {
        return __json({ ok:false, ts:new Date().toISOString(), path:__p, entry_marker: ENTRY_MARKER, has_openai_key, error:"OpenAI error", status: resp.status, details: data }, 500);
      }

// --- V3 ENFORCE: validate + repair pass (only if needed) ---
const __normalizeHeadings = (s) => String(s || "")
  .replace(/^\s*###\s+WEB_ARTICLE\s*$/gm, "### WEB_ARTICLE")
  .replace(/^\s*###\s+VIDEO\s*$/gm, "### VIDEO")
  .replace(/^\s*###\s+YOUTUBE\s*$/gm, "### YOUTUBE")
  .replace(/^\s*###\s+SOCIAL\s*$/gm, "### SOCIAL");

text = __normalizeHeadings(text);

const __section = (all, head) => {
  const re = new RegExp("^\\s*###\\s+" + head + "\\s*\\n([\\s\\S]*?)(?=^\\s*###\\s+|\\Z)", "m");

  const m = String(all || "").match(re);
  return m ? m[1].trim() : "";
};
const __wc = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;

const __web = __section(text, "WEB_ARTICLE");
const __video = __section(text, "VIDEO");
const __yt = __section(text, "YOUTUBE");
const __social = __section(text, "SOCIAL");

const __webWords = __wc(__web);

// YouTube description words
let __ytDesc = "";
{
  const m = __yt.match(/DESCRIPTION:\s*([\s\S]*?)\nTAGS:/i);
  __ytDesc = m ? m[1].trim() : "";
}
const __ytDescWords = __wc(__ytDesc);

// Instagram hashtags count
let __igHashCount = 0;
{
  const m = __social.match(/INSTAGRAM:\s*([\s\S]*?)\nFACEBOOK:/i);
  const ig = m ? m[1].trim() : "";
  __igHashCount = (ig.match(/#[^\s#]+/g) || []).length;
}

// X length
let __xLen = 0;
{
  const m = __social.match(/X:\s*([\s\S]*?)\nINSTAGRAM:/i);
  const x = m ? m[1].trim() : "";
  __xLen = x.length;
}

// Video numbered lines count: 1) or (1) or 1.
let __vLines = 0;
{
  const lines = __video.split("\n").map(s => s.trim()).filter(Boolean);
  __vLines = lines.filter(l => /^(\(?\d+\)?[.)])\s+/.test(l)).length;
}

const __missingSection = (!__web || !__video || !__yt || !__social);

const __needFix =
  __missingSection ||
  (__webWords < 500 || __webWords > 600) ||
  (__ytDescWords < 120 || __ytDescWords > 180) ||
  (__igHashCount < 8 || __igHashCount > 12) ||
  (__xLen > 280) ||
  (__vLines < 8 || __vLines > 12);
let __didRepair = false;

let __repairPasses = 0;



if (__needFix) {
  const FIX_PROMPT =
`Your previous output FAILED DigiPack V3 constraints.
Rewrite the FULL output to PASS ALL constraints EXACTLY.
Return PLAIN TEXT only with the SAME 4 headings at column 1.
Do NOT add explanations.

Must pass:
- WEB_ARTICLE: 500–600 Hindi words (4–7 paragraphs, no bullets)
- VIDEO: HOOK + EXACT 8–12 numbered lines using 1) 2) ... (<=16 words each)
- YOUTUBE DESCRIPTION: 120–180 words
- SOCIAL: X <=280 chars (max 2 hashtags); Instagram 8–12 hashtags

INPUT_JSON:
${raw}

FAILED_OUTPUT:
${text}`;

  const resp2 = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type":"application/json", "authorization":"Bearer " + key },
    body: JSON.stringify({ model, temperature: 0.2, max_tokens: 2200, messages: [{ role:"user", content: FIX_PROMPT }] })
});
  const data2 = await resp2.json().catch(() => ({}));
  const text2 = (data2 && data2.choices && data2.choices[0] && data2.choices[0].message && data2.choices[0].message.content)
    ? String(data2.choices[0].message.content) : "";
if (resp2.ok && text2) { text = text2; __didRepair = true; __repairPasses = 1; }


}

// --- SECOND PASS: force WEB_ARTICLE length by regenerating only the web article ---
let __webOnlyWords = 0;
let __webOnlyTries = 0;

const __webAfter = __section(text, "WEB_ARTICLE");
const __webAfterWords = __wc(__webAfter);
const __stillBadWeb = (__webAfterWords < 500 || __webAfterWords > 600);

let web3 = "";

if (false && __stillBadWeb) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    __webOnlyTries = attempt;

    const note = (attempt === 1)
      ? ""
      : `Previous attempt was ${__webOnlyWords} words. Rewrite to 560–590 words exactly. Keep exactly 6 paragraphs.`;

    const WEB_ONLY_PROMPT =
`Write ONLY the Hindi web article for this story.

HARD RULES:
- Total length: 560–590 words (must be within range).
- Exactly 6 paragraphs separated by a blank line.
- Each paragraph roughly 90–100 words.
- Publish-ready Hindi, no bullet lists.
- Do NOT include headings.
- Do NOT include word count.
${note}

INPUT_JSON:
${raw}`;

    const resp3 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type":"application/json", "authorization":"Bearer " + key },
      body: JSON.stringify({ model, temperature: 0.2, max_tokens: 2600, messages: [{ role:"user", content: WEB_ONLY_PROMPT }] })
    });

    const data3 = await resp3.json().catch(() => ({}));
    web3 = (data3 && data3.choices && data3.choices[0] && data3.choices[0].message && data3.choices[0].message.content)
      ? String(data3.choices[0].message.content).trim()
      : "";

    __webOnlyWords = __wc(web3);

    if (resp3.ok && web3 && __webOnlyWords >= 500 && __webOnlyWords <= 600) break;
  }

  // fallback: expand/trim using previous attempt
  if (web3 && (__webOnlyWords < 500 || __webOnlyWords > 600)) {
    const EXPAND_PROMPT =
`Rewrite the following Hindi article to 560–590 words.
Keep exactly 6 paragraphs separated by a blank line.
No bullets. No headings. No word count.

ARTICLE:
${web3}`;

    const resp4 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type":"application/json", "authorization":"Bearer " + key },
      body: JSON.stringify({ model, temperature: 0.2, max_tokens: 2600, messages: [{ role:"user", content: EXPAND_PROMPT }] })
    });

    const data4 = await resp4.json().catch(() => ({}));
    const web4 = (data4 && data4.choices && data4.choices[0] && data4.choices[0].message && data4.choices[0].message.content)
      ? String(data4.choices[0].message.content).trim()
      : "";

    const w4 = __wc(web4);
    if (resp4.ok && web4 && w4 >= 500 && w4 <= 600) {
      web3 = web4;
      __webOnlyWords = w4;
      __webOnlyTries = __webOnlyTries + 1;
    }
  }

  // apply only if in range
  if (web3 && __webOnlyWords >= 500 && __webOnlyWords <= 600) {
    text = __normalizeHeadings(text);

    text = text.replace(
      /(^\s*###\s+WEB_ARTICLE\s*\n)([\s\S]*?)(?=^\s*###\s+|\Z)/m,
      function(_, h) { return h + web3.trim() + "\n\n"; }
    );

    text = __normalizeHeadings(text);
    __didRepair = true;
    __repairPasses = 2;
  }
}

// --- end V3 ENFORCE ---


      return __json({
  ok:true,
  ts:new Date().toISOString(),
  path:__p,
  entry_marker: ENTRY_MARKER,
  has_openai_key,
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

    return (__r instanceof Response)
      ? __r
      : __json({ ok:false, ts:new Date().toISOString(), path: __p, error:"BUG: /api/digi-pack returned non-Response", gotType: typeof __r }, 500);

  }
}
/* NG_TOP_ROUTE_HOOK_V3V9_END */

/* NG_ROUTE_HOTFIX_V3V9_START */
{
  // Route Hotfix V3V9: proves patch via /api/ping and restores /api/digi-pack even if routes were lost.
  const __NG_URL = new URL(request.url);
  const __NG_PATH = __NG_URL.pathname;

  const __NG_CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Max-Age": "86400"
  };

  function __ngJson(obj, status=200){
    return new Response(JSON.stringify(obj, null, 2), {
      status,
      headers: { ...__NG_CORS, "content-type": "application/json; charset=utf-8" }
    });
  }

  if (__NG_PATH === "/api/ping") {
    return __ngJson({ ok:true, tag:"V3V9", ts:new Date().toISOString() }, 200);
  }

  if (__NG_PATH === "/api/digi-pack" && request.method === "OPTIONS") {
    return new Response("", { status: 204, headers: __NG_CORS });
  }

  if (__NG_PATH === "/api/digi-pack" && request.method === "POST") {
    // Works even if fetch() is NOT async
    return (async () => {
      const has_openai_key = !!(env && (env.OPENAI_API_KEY || env.OPENAI_KEY));
      const entry_marker = (typeof ENTRY_MARKER !== "undefined") ? ENTRY_MARKER : "NO_ENTRY_MARKER";

      try {
        const body = await request.json().catch(() => ({}));
        const rawPrompt = (body && body.prompt != null) ? String(body.prompt) : "";

        // DigiPack V3 enforcement (plain text sections; no JSON in model output)
        const V3_PREFIX =
`You are NewsGenie DigiPack Generator V3 (Hindi newsroom).

STRICT OUTPUT RULES:
- Output PLAIN TEXT only. NO JSON. NO Markdown tables. No code fences.
- Use EXACT headings (each on its own line, all caps):
### WEB_ARTICLE
### VIDEO
### YOUTUBE
### SOCIAL

REQUIREMENTS:
### WEB_ARTICLE
- Hindi web article: 500â€“600 words (stay within range).
- 3â€“6 short paragraphs. Publish-ready. No bullets.

### VIDEO
- HOOK: (one line)
- LINES:
- Then 8â€“12 numbered lines (1) ... (2) ... short VO lines.

### YOUTUBE
TITLE:
DESCRIPTION:
TAGS: (12â€“18 comma-separated)
HASHTAGS: (3â€“5)

### SOCIAL
X:
INSTAGRAM:
FACEBOOK:
WHATSAPP:
End after WHATSAPP.`;

        let prompt = V3_PREFIX + "\n\nINPUT_JSON:\n" + rawPrompt + "\n";

        if (!has_openai_key) {
          return __ngJson({ ok:false, ts:new Date().toISOString(), path:__NG_PATH, entry_marker, has_openai_key, error:"Missing OPENAI_API_KEY" }, 400);
        }

        const model = (env && (env.OPENAI_MODEL || env.MODEL)) ? (env.OPENAI_MODEL || env.MODEL) : "gpt-4o";
        const key   = (env.OPENAI_API_KEY || env.OPENAI_KEY);

        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "content-type":"application/json", "authorization":"Bearer " + key },
          body: JSON.stringify({ model, temperature: 0.4, max_tokens: 2200, messages: [{ role:"user", content: prompt }] })

        });

        const data = await resp.json().catch(() => ({}));
        const text = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
          ? String(data.choices[0].message.content) : "";

        if (!resp.ok) {
          return __ngJson({ ok:false, ts:new Date().toISOString(), path:__NG_PATH, entry_marker, has_openai_key, error:"OpenAI error", status: resp.status, details: data }, 500);
        }

        return __ngJson({ ok:true, ts:new Date().toISOString(), path:__NG_PATH, entry_marker, has_openai_key, model, generated_text: text }, 200);
      } catch (err) {
        return __ngJson({ ok:false, ts:new Date().toISOString(), path:__NG_PATH, entry_marker, has_openai_key, error:String(err && err.message ? err.message : err) }, 500);
      }
    })();
  }
}
/* NG_ROUTE_HOTFIX_V3V9_END */

 
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
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
}};

