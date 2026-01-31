$ErrorActionPreference="Stop"
$path="public\index.html"

# Backup
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $path ("public\index_backup_before_relocate_segmented_{0}.html" -f $ts) -Force

$html = Get-Content $path -Raw -Encoding UTF8

$pattern = '(?s)<!-- NG_PATCH: SEGMENTED_V2 -->.*?<!-- /NG_PATCH: SEGMENTED_V2 -->\s*'
if ($html -notmatch $pattern) { throw "SEGMENTED_V2 block not found in index.html" }
$block = $Matches[0]

# Remove it wherever it currently is
$html = [regex]::Replace($html, $pattern, "")

# Insert it right before </body>
$bodyIdx = $html.LastIndexOf("</body>")
if ($bodyIdx -lt 0) { throw "No </body> found" }
$html = $html.Insert($bodyIdx, "`r`n$block`r`n")

Set-Content -Path $path -Value $html -Encoding UTF8
Write-Host "✅ SEGMENTED_V2 moved to before </body>" -ForegroundColor Green
