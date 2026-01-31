// src/index.js  (BOOT v3: echo + openai mode)
// Uses OpenAI Responses API + Structured Outputs (json_schema)

const ENTRY_MARKER = "BOOTv3-src-indexjs-openai";

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
  const clean = txt.replace(/^\uFEFF/, ""); // ✅ strip UTF-8 BOM
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
    const url = new URL(request.url);
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
        return json(
          { ok: false, path, entry_marker: ENTRY_MARKER, has_openai_key, error: "OPENAI_API_KEY missing"You are NewsGenie DigiPack writer for Hindi newsroom.

OUTPUT STRICTLY PLAIN TEXT (NO JSON). Use EXACT section order + headers:

HEADLINE: <one line>
DEK: <one line>

KEY POINTS
- <exactly 5 bullets, each one line>

WEB ARTICLE (500–600 words)
<Hindi web article 500–600 words. No filler. No separator lines. No repeated hyphen blocks.>

VIDEO (60–75 sec)
HOOK: <one line teaser, no hashtags, no IDs, max 14 words>
SCRIPT:
- <8–12 short lines, each <= 14 words, Hindi, presenter/VO style>
- <include 2–3 ONSCREEN text cues inside brackets like [ONSCREEN: ...]>

YOUTUBE
TITLE: <Hindi, 65–80 chars>
DESCRIPTION: <150–220 words, Hindi, includes 2 hashtags max>
CHAPTERS:
- 0:00 <...>
- 0:20 <...>
- 0:45 <...>
TAGS: <comma-separated 10–15 tags>
THUMBNAIL_TEXT: <3–5 Hindi words>

SOCIAL
X_POST: <280 chars max, Hindi, 1 hashtag max>
INSTAGRAM_CAPTION: <2 short paras + 3 hashtags max>
FACEBOOK_POST: <3 short paras, Hindi>
WHATSAPP_FORWARD: <4–6 lines, Hindi, ends with: "सूचना: विवरण अपडेट हो सकते हैं।">

SOURCES
- <use only sources provided in input; if none, write "- स्रोत: (इनपुट में उपलब्ध नहीं)">

HARD RULES:
- WEB ARTICLE must be 500–600 words. If not, rewrite internally before answering.
- NEVER output "resp_" / response IDs / debug tokens.
- NEVER print separator lines like "--------------------------------".
- Keep facts consistent with input. If a fact is missing, write it as "रिपोर्ट के मुताबिक" (no invention)."object",
        additionalProperties: false,
        properties: {
          // WEB
          headline: { type: "string", description: "Hindi headline, 6–12 words" },
          dek: { type: "string", description: "Hindi dek/subhead, 1–2 lines" },
          bullet_points: {
            type: "array",
            minItems: 5,
            maxItems: 7,
            items: { type: "string" },
            description: "Key points (Hindi), short bullets"
          },
          web_article_500_600: {
            type: "string",
            description: "Hindi web article, ~500–600 words, 4–6 short paragraphs, factual, no invention"
          },
      
          // VIDEO
          video_hook: { type: "string", description: "1-line hook for video" },
          vo_lines: {
            type: "array",
            minItems: 6,
            maxItems: 10,
            items: { type: "string" },
            description: "Short Hindi VO lines, 10–16 words each"
          },
          shot_plan: {
            type: "array",
            minItems: 6,
            maxItems: 10,
            description: "Shot plan for the video",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                shot_type: { type: "string", description: "e.g., B-roll / Archive / Graphic / OTS" },
                source: { type: "string", description: "Reporter / Agency / Archive (if known else empty)" },
                what_to_show: { type: "string", description: "What to show on screen" },
                notes: { type: "string", description: "Optional notes (3–5 sec, blur face, avoid brand, etc.)" }
              },
              required: ["shot_type", "source", "what_to_show", "notes"]
            }
          },
      
          // SOCIAL
          social_caption: { type: "string", description: "2–3 line social caption (Hindi)" },
          social_script_20_30: { type: "string", description: "20–30 sec reel script (Hindi), crisp lines" },
          hashtags: {
            type: "array",
            minItems: 6,
            maxItems: 12,
            items: { type: "string" },
            description: "Hashtags without spaces"
          },
      
          // SAFETY
          caution: {
            type: "string",
            description: "If inputs are weak/unclear, add a short caution/verification note; else empty string"
          }
        },
        required: [
          "headline",
          "dek",
          "bullet_points",
          "web_article_500_600",
          "video_hook",
          "vo_lines",
          "shot_plan",
          "social_caption",
          "social_script_20_30",
          "hashtags",
          "caution"
        ]
      };

      const instructions =
        "You are NewsGenie Digital Producer for Hindi newsroom. " +
        "Use ONLY the provided inputs. Do not invent names/dates/numbers. " +
        "Return JSON strictly matching the schema. Keep tone professional and factual.";

      const input = [
        { role: "system", content: instructions },
        { role: "user", content: "INPUT_JSON:\n" + JSON.stringify(promptObj, null, 2) }
      ];

      // Call OpenAI Responses API
      const openaiReq = async (signal) => {
        const r = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          signal,
          headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model,
            input,
            max_output_tokens,
            store: false,
            text: {
              format: {
                type: "json_schema",
                name: "digi_pack",
                strict: true,
                schema
              }
            }
          })
        });
        const j = await r.json().catch(() => null);
        return { status: r.status, ok: r.ok, json: j };
      };

      const { status, ok, json: oj } = await withTimeout(openaiReq, 65000, "openai_call_timeout");


      if (!ok) {
        return json(
          {
            ok: false,
            ts: new Date().toISOString(),
            path,
            mode,
            model,
            entry_marker: ENTRY_MARKER,
            has_openai_key,
            openai_status: status,
            openai_error: oj || "OpenAI error (non-JSON)",
            received: promptObj
          },
          502,
          corsHeaders(request)
        );
      }

      const outText = extractOutputText(oj);
      let generated = null;
      let parse_error = null;

      try {
        generated = outText ? JSON.parse(outText) : null;
      } catch (e) {
        parse_error = String(e?.message || e);
      }

      return json(
        {
          ok: true,
          ts: new Date().toISOString(),
          path,
          mode,
          model,
          entry_marker: ENTRY_MARKER,
          has_openai_key,
          openai: {
            id: oj?.id,
            status: oj?.status,
            usage: oj?.usage || null
          },
          received: promptObj,
          generated: generated || null,
          generated_raw_text: generated ? undefined : outText,
          parse_error
        },
        200,
        corsHeaders(request)
      );
    }

    // fallback
    return json(
      { ok: false, ts: new Date().toISOString(), path, entry_marker: ENTRY_MARKER, has_openai_key, error: "Not found" },
      404,
      corsHeaders(request)
    );
  }
};
