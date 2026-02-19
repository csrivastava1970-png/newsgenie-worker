/**
 * NewsGenie Local Export Bridge (localhost)
 * - Receives POST /export JSON
 * - Runs PowerShell: tools/NG_EXPORT_CLIP_WITH_VO.ps1
 * - Returns {ok:true, out:"C:\\...\\file.mp4"}
 *
 * Optional security:
 *   set env NG_EXPORT_TOKEN="something"
 *   then UI/client must send header: x-ng-token: something
 */

const http = require("http");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const HOST = "127.0.0.1";
const PORT = Number(process.env.NG_EXPORT_PORT || 32145);
const TOKEN = process.env.NG_EXPORT_TOKEN || ""; // optional

const REPO_ROOT = path.resolve(__dirname, "..", ".."); // tools/ng_export_bridge -> repo root
const PS1_PATH  = path.join(REPO_ROOT, "tools", "NG_EXPORT_CLIP_WITH_VO.ps1");

function send(res, code, obj){
 

  const s = JSON.stringify(obj, null, 2);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "http://127.0.0.1:8787",
    "Access-Control-Allow-Headers": "content-type,x-ng-token",
    "Access-Control-Allow-Methods": "POST,GET,OPTIONS"
  });
  res.end(s);
}

function readJson(req){
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1024 * 1024) { // 1MB guard
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch(e){ reject(e); }
    });
  });
}

function requireToken(req){
  if (!TOKEN) return true;
  const got = (req.headers["x-ng-token"] || "").toString();
  return got && got === TOKEN;
}

function isNonEmptyString(x){ return typeof x === "string" && x.trim().length > 0; }
function isFiniteNumber(x){ return typeof x === "number" && Number.isFinite(x); }

function buildPsArgs(body){
  // Required per your script design
  const Src  = body.Src;
  const InMs = body.InMs;
  const OutMs= body.OutMs;
  const Slug = body.Slug;

  if (!isNonEmptyString(Src)) throw new Error("Missing/invalid Src (string)");
  if (!isFiniteNumber(InMs))   throw new Error("Missing/invalid InMs (number)");
  if (!isFiniteNumber(OutMs))  throw new Error("Missing/invalid OutMs (number)");
  if (!isNonEmptyString(Slug)) throw new Error("Missing/invalid Slug (string)");

 const args = [
  "-Src", Src,
  "-InMs", String(InMs),
  "-OutMs", String(OutMs),
  "-Slug", Slug
];


    // Optional + defaults (bridge-friendly)
  if (isNonEmptyString(body.VO)) args.push("-VO", body.VO);

  const outDir = (isNonEmptyString(body.OutDir) ? body.OutDir : (process.env.NG_EXPORT_OUTDIR || "C:\\Cnewsgenie_demo\\exports"));
  const tmpDir = (isNonEmptyString(body.TmpDir) ? body.TmpDir : (process.env.NG_EXPORT_TMPDIR || "C:\\Cnewsgenie_demo\\temp"));
  const ffmpeg = (isNonEmptyString(body.Ffmpeg) ? body.Ffmpeg : (process.env.NG_EXPORT_FFMPEG || "C:\\Cnewsgenie_demo\\ffmpeg\\bin\\ffmpeg.exe"));

   // Always pass these so PS1 behavior is consistent
  args.push("-OutDir", outDir);
  args.push("-TmpDir", tmpDir);
  args.push("-Ffmpeg", ffmpeg);

  return args;
}

function runExport(body){
  return new Promise((resolve, reject) => {
    const psArgs = buildPsArgs(body);
    const psExe = "powershell.exe";

    const fullArgs = [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy", "Bypass",
      "-File", PS1_PATH,
      ...psArgs
    ];

    // Minimal, useful log (keep)
    console.log("[NG_EXPORT_BRIDGE] export", {
      slug: body && body.Slug,
      inMs: body && body.InMs,
      outMs: body && body.OutMs,
      hasVO: !!(body && body.VO)
    });

    const p = spawn(psExe, fullArgs, {
      cwd: REPO_ROOT,
      windowsHide: true
    });


    let out = "";
let err = "";

p.stdout.on("data", (d) => out += d.toString());
p.stderr.on("data", (d) => err += d.toString());


    p.on("error", (e) => {
  const msg = (e && (e.stack || e.message)) ? String(e.stack || e.message) : String(e || "spawn_error");
  reject(Object.assign(new Error("export_failed"), {
    exitCode: 0,
    stderr: msg,
    outRaw: "",
    lastLine: "",
    errorCode: "SPAWN_ERROR"
  }));
});


    p.on("close", (code) => {
      const line = (out || "").trim().split(/\r?\n/).filter(Boolean).slice(-1)[0] || "";
      if (code === 0 && line) return resolve({ code, out: line, stderr: (err||"").trim() });
      reject(Object.assign(new Error("export_failed"), { exitCode: code, stderr: (err||""), outRaw: (out||""), lastLine: (String(out||"").trim().split(/\r?\n/).filter(Boolean).pop() || "") }));

    });
  });
}
function psStartProcess(args){
  return new Promise((resolve, reject) => {
    const psExe = "powershell.exe";
    const fullArgs = [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy", "Bypass",
      "-Command",
      args
    ];

    let out = "";
    let err = "";

    const p = spawn(psExe, fullArgs, { windowsHide: true });
    p.stdout.on("data", (d) => out += d.toString());
    p.stderr.on("data", (d) => err += d.toString());

    p.on("error", (e) => {
      const msg = (e && (e.stack || e.message)) ? String(e.stack || e.message) : String(e || "spawn_error");
      reject(Object.assign(new Error("spawn_error"), { stderr: msg, outRaw: "" }));
    });

    p.on("close", (code) => {
      if (code === 0) return resolve({ code, out, err });
      reject(Object.assign(new Error("ps_failed"), { exitCode: code, stderr: err, outRaw: out }));
    });
  });
}


const server = http.createServer(async (req, res) => {
  try{
    if (req.method === "OPTIONS") return send(res, 200, { ok:true });

    if (!requireToken(req)) return send(res, 401, { ok:false, error:"unauthorized" });

    if (req.url === "/health" && req.method === "GET"){
      return send(res, 200, { ok:true, host:HOST, port:PORT, ps1:PS1_PATH });
    }

           if (req.url === "/export" && req.method === "POST"){
  try{
    const body = await readJson(req);
    const r = await runExport(body);

    // Derive lastLine from stdout if not provided (final non-empty line)
    const outText = String(r.out || "");
    const derivedLast = outText
      .split(/\r?\n/)
      .map(s => String(s).trim())
      .filter(Boolean)
      .slice(-1)[0] || "";

    const finalLast = (r.lastLine && String(r.lastLine).trim())
      ? String(r.lastLine).trim()
      : derivedLast;

    return send(res, 200, {
      ok: true,
      out: r.out,
      lastLine: finalLast,
      stderr: r.stderr || ""
    });

  }catch(e){
    // Ensure we never return blank diagnostics
    const msg = (e && (e.stack || e.message)) ? String(e.stack || e.message) : String(e || "");

    // Prefer stderr if present, else fall back to msg/stack
    const stderrSafe = (e && e.stderr != null && String(e.stderr).trim() !== "")
      ? String(e.stderr)
      : msg;

    // outRaw fallback (keep empty if truly unavailable)
    const outRawSafe = (e && e.outRaw != null && String(e.outRaw).trim() !== "")
      ? String(e.outRaw)
      : "";

    // Extract a short machine-friendly error code from stderr (if present)
    let errCode =
      (/^(SRC_NOT_FOUND|VO_NOT_FOUND|BAD_RANGE|FFMPEG_NOT_FOUND|SPAWN_ERROR|SPAWN_ENOENT|SPAWN_ACCESS)/m.exec(stderrSafe) || [null])[1] || "";

    // Heuristic fallbacks for spawn-type errors
    if (!errCode && /ENOENT/i.test(stderrSafe)) errCode = "SPAWN_ENOENT";
    if (!errCode && /(access is denied|permission|EACCES)/i.test(stderrSafe)) errCode = "SPAWN_ACCESS";

    // Treat validation / export failures as 400; unexpected as 500
    const isBadReq = /Missing\/invalid|SRC_NOT_FOUND|VO_NOT_FOUND|BAD_RANGE|FFMPEG_NOT_FOUND|export_failed|SPAWN_/i.test(stderrSafe);

    return send(res, isBadReq ? 400 : 500, {
      ok:false,
      error:"export_failed",
      errorCode: errCode,
      message: "export_failed",
      exitCode: (e && e.exitCode != null) ? e.exitCode : 0,
      lastLine: (e && e.lastLine != null) ? String(e.lastLine) : "",
      stderr: stderrSafe,
      outRaw: outRawSafe
    });
  }
}

// === NG_OPEN_FOLDER_V1_START (20260219) ===
if (req.url === "/open-folder" && req.method === "POST"){
  if (!requireToken(req)) return send(res, 401, { ok:false, error:"unauthorized" });

  try{
    const body = await readJson(req);
    const p0 = body && body.path;

    if (!isNonEmptyString(p0)) return send(res, 400, { ok:false, error:"bad_request", message:"Missing/invalid path" });

    const abs = path.resolve(p0);
    if (!fs.existsSync(abs)) return send(res, 400, { ok:false, error:"not_found", message:"Path not found", path: abs });

    const stat = fs.statSync(abs);

    // If it's a file -> highlight in explorer; if folder -> open
    const esc = abs.replace(/'/g, "''");
    let ps = "";

    if (stat.isFile()){
  ps = `$p='${esc}'; Start-Process explorer.exe -ArgumentList ('/select,"{0}"' -f $p)`;
} else {
  ps = `$p='${esc}'; Start-Process explorer.exe -ArgumentList ('"{0}"' -f $p)`;
}


    await psStartProcess(ps);
    return send(res, 200, { ok:true, path: abs });
  }catch(e){
    const msg = String(e && e.message ? e.message : e);
    return send(res, 500, { ok:false, error:"open_folder_failed", message: msg, stderr: (e && e.stderr) ? String(e.stderr) : "" });
  }
}
// === NG_OPEN_FOLDER_V1_END ===

// === NG_OPEN_FILE_V1_START (20260219) ===
if (req.url === "/open-file" && req.method === "POST"){
  if (!requireToken(req)) return send(res, 401, { ok:false, error:"unauthorized" });

  try{
    const body = await readJson(req);
    const p0 = body && body.path;

    if (!isNonEmptyString(p0)) return send(res, 400, { ok:false, error:"bad_request", message:"Missing/invalid path" });

    const abs = path.resolve(p0);
    if (!fs.existsSync(abs)) return send(res, 400, { ok:false, error:"not_found", message:"File not found", path: abs });

    const stat = fs.statSync(abs);
    if (!stat.isFile()) return send(res, 400, { ok:false, error:"bad_request", message:"Path is not a file", path: abs });

    const esc = abs.replace(/'/g, "''");
    // NG_OPEN_FILE_VLC_MP4_V1 (20260219): prefer VLC for .mp4 if installed
const isMp4 = /\.mp4$/i.test(String(abs));
const vlc = "C:\\Program Files\\VideoLAN\\VLC\\vlc.exe";

let ps;
if (isMp4 && fs.existsSync(vlc)) {
  const vlcEsc = vlc.replace(/'/g, "''");
  ps = `$vlc='${vlcEsc}'; $p='${esc}'; Start-Process -FilePath $vlc -ArgumentList ('"{0}"' -f $p)`;
} else {
  ps = `$p='${esc}'; Start-Process -FilePath $p`;
}


    await psStartProcess(ps);
    return send(res, 200, { ok:true, path: abs });
  }catch(e){
    const msg = String(e && e.message ? e.message : e);
    return send(res, 500, { ok:false, error:"open_file_failed", message: msg, stderr: (e && e.stderr) ? String(e.stderr) : "" });
  }
}
// === NG_OPEN_FILE_V1_END ===

return send(res, 404, { ok:false, error:"not_found" });

      
  }catch(e){
    return send(res, 500, { ok:false, error: String(e && (e.stack || e.message) || e) });
  }


});

server.listen(PORT, HOST, () => {
  console.log(`[NG_EXPORT_BRIDGE] listening http://${HOST}:${PORT}`);
  console.log(`[NG_EXPORT_BRIDGE] PS1: ${PS1_PATH}`);
});

