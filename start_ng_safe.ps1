# start_ng_safe.ps1
$ErrorActionPreference = "Stop"
Set-Location "C:\Users\HP\Desktop\newsgenie-worker"

Write-Host "[NG] HEAD:" (git rev-parse --short HEAD)

# 1) JS syntax smoke test
Write-Host "[NG] node -c src/index.js ..."
node -c .\src\index.js
Write-Host "[NG] JS SYNTAX OK"

# 2) Start wrangler using cmd shim (avoids npx.ps1 policy issue)
Write-Host "[NG] starting wrangler on 8787 ..."
npx.cmd wrangler dev .\src\index.js --port 8787
