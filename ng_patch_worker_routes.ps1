# ng_patch_worker_routes.ps1
$ErrorActionPreference = "Stop"

$p = ".\src\index.js"
if (!(Test-Path $p)) { throw "SRC_NOT_FOUND: $p" }

$s = Get-Content $p -Raw

# -------------------------
# 1) Extend /health to also support /api/health
# -------------------------
$done = $false

# Pattern A: __u.pathname === '/health'
if ($s -match "if\s*\(\s*__u\.pathname\s*===\s*['""]\/health['""]\s*\)") {
  $s = [regex]::Replace(
    $s,
    "if\s*\(\s*__u\.pathname\s*===\s*['""]\/health['""]\s*\)",
    'if (__u.pathname === "/health" || __u.pathname === "/api/health" || __u.pathname === "/api/health/")',
    1
  )
  $done = $true
}

# Pattern B: path === '/health'
if (-not $done -and $s -match "if\s*\(\s*path\s*===\s*['""]\/health['""]\s*\)") {
  $s = [regex]::Replace(
    $s,
    "if\s*\(\s*path\s*===\s*['""]\/health['""]\s*\)",
    'if (path === "/health" || path === "/api/health" || path === "/api/health/")',
    1
  )
  $done = $true
}

if (-not $done) { throw "HEALTH_COND_NOT_FOUND" }

# -------------------------
# 2) Insert transcript latest route (safe Response)
#    Adds: /transcript/latest + /api/transcript/latest
# -------------------------
if ($s -notmatch "NG_PATCH_START:TRANSCRIPT_LATEST_V1" -and $s -notmatch "/transcript/latest") {

$ins = @'
    // NG_PATCH_START:TRANSCRIPT_LATEST_V1
    // Transcript latest (safe Response; avoids worker hanging)
    if ((path === "/transcript/latest" || path === "/api/transcript/latest") && request.method === "GET") {
      const cors = (typeof corsHeaders === "function") ? corsHeaders(request) : {};
      const headers = Object.assign({ "content-type": "application/json; charset=utf-8" }, cors);
      return new Response(JSON.stringify({ ok: true, latest: null, text: "", ts: new Date().toISOString() }), { status: 200, headers });
    }
    // NG_PATCH_END:TRANSCRIPT_LATEST_V1

'@

  # Prefer insert after Ping block
  $patPing = '(?s)(//\s*Ping\s*\r?\n\s*if\s*\(\s*path\s*===\s*\"\/ping\"\s*\)\s*\{.*?\r?\n\s*\}\s*\r?\n)'
  $s2 = [regex]::Replace($s, $patPing, ('$1' + "`r`n" + $ins), 1)

  # Fallback: insert after const path = __u.pathname;
  if ($s2 -eq $s) {
    $patPath = '(?m)^\s*const\s+path\s*=\s*__u\.pathname\s*;\s*$'
    $s2 = [regex]::Replace($s, $patPath, ('$0' + "`r`n" + $ins), 1)
  }

  if ($s2 -eq $s) { throw "INSERT_POINT_NOT_FOUND" }
  $s = $s2
}

Set-Content -Encoding UTF8 $p $s
"PATCH_OK"
