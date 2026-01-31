const fs = require("fs");

const html = fs.readFileSync("public/index.html", "utf8");

function lineNoAt(idx){
  // 1-based line number
  return html.slice(0, idx).split(/\r?\n/).length;
}

let checked = 0, ok = 0, bad = 0;

const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

for (const m of html.matchAll(re)) {
  const attrs = (m[1] || "");
  const code  = (m[2] || "");
  const startLine = lineNoAt(m.index || 0);

  // skip external scripts
  if (/\bsrc\s*=/.test(attrs)) continue;

  // skip non-js types (allow empty/default, text/javascript, application/javascript)
  const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
  const typeVal = typeMatch ? String(typeMatch[1]).toLowerCase() : "";
  if (typeVal && !/(text\/javascript|application\/javascript)/.test(typeVal)) continue;

  // skip module scripts (new Function can't parse import/export)
  if (/\btype\s*=\s*["']module["']/i.test(attrs)) continue;

  const js = code.trim();
  if (!js) continue;

  checked++;
  try {
    new Function(js);
    ok++;
  } catch (e) {
    bad++;
    console.error("\n[INLINE SCRIPT ERROR #" + checked + "] line " + startLine + " : " + e.message);
    const preview = js.split(/\r?\n/).slice(0, 40).join("\n");
    console.error("----- script preview (first 40 lines) -----\n" + preview + "\n------------------------------------------");
    // stop at first error to keep output readable
    break;
  }
}

console.log("\n[INLINE SCRIPTS SUMMARY]", { checked, ok, bad });
process.exit(bad ? 1 : 0);
