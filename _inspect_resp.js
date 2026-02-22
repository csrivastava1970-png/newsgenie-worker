const fs = require("fs");
const j = JSON.parse(fs.readFileSync("resp_web.json","utf8"));
const t = String(j.output_text || "");
console.log("ok=", j.ok, "entry_marker=", j.entry_marker || "");
console.log("output_text_len=", t.length);

console.log("\nHEAD_500:\n" + t.slice(0,500));
console.log("\nTAIL_500:\n" + t.slice(Math.max(0, t.length-500)));

console.log("\nhas_web_article_str=", t.includes("web_article"));
console.log("has_formats_str=", t.includes('"formats"') || t.includes("formats"));

const i = t.indexOf("{");
const k = t.lastIndexOf("}");
console.log("\nfirst_{=", i, "last_}=", k, "json_slice_len=", (i>=0 && k>i) ? (k-i+1) : 0);

if(i>=0 && k>i){
  const slice = t.slice(i, k+1);
  console.log("\nJSON_SLICE_HEAD_300:\n" + slice.slice(0,300));
  console.log("\nJSON_SLICE_TAIL_300:\n" + slice.slice(Math.max(0, slice.length-300)));
  try{
    const pj = JSON.parse(slice);
    console.log("\nPARSE_SLICE_OK_KEYS=", Object.keys(pj));
    if(pj.formats) console.log("formats_len=", Array.isArray(pj.formats)?pj.formats.length:"NA");
    if(pj.web_article) console.log("web_article_text_len=", String((pj.web_article.text)||"").length);
  }catch(e){
    console.log("\nPARSE_SLICE_FAIL=", (e && e.message) ? e.message : String(e));
  }
}
