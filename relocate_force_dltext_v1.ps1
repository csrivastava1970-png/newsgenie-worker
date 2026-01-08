$ErrorActionPreference="Stop"
$path="public\index.html"
if (!(Test-Path $path)) { throw "NOT FOUND: $path" }

# Backup
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $path ("public\index_backup_before_relocate_dltext_{0}.html" -f $ts) -Force

$html = Get-Content $path -Raw -Encoding UTF8

$pattern = '(?s)<!-- NG_PATCH: FORCE_DLTEXT_V1 -->.*?<!-- /NG_PATCH: FORCE_DLTEXT_V1 -->\s*'
if ($html -notmatch $pattern) { throw "FORCE_DLTEXT_V1 block not found" }
$block = $Matches[0]

# Remove existing block
$html = [regex]::Replace($html, $pattern, "")

# Insert right after <body ...>
$bodyMatch = [regex]::Match($html, '(?is)<body\b[^>]*>')
if (!$bodyMatch.Success) { throw "No <body> tag found" }

$insertPos = $bodyMatch.Index + $bodyMatch.Length
$html = $html.Insert($insertPos, "`r`n$block`r`n")

Set-Content -Path $path -Value $html -Encoding UTF8
Write-Host "✅ FORCE_DLTEXT_V1 moved to right after <body>" -ForegroundColor Green
Write-Host "Backup: public\index_backup_before_relocate_dltext_$ts.html" -ForegroundColor Cyan
