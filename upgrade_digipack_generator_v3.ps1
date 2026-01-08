param()

Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function WriteUtf8NoBom([string]$p,[string]$t){
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [IO.File]::WriteAllText($p,$t,$utf8NoBom)
}

# Pick worker main (js/ts)
$target = $null
if (Test-Path ".\src\index.js") { $target = ".\src\index.js" }
elseif (Test-Path ".\src\index.ts") { $target = ".\src\index.ts" }
else { throw "src\index.js or src\index.ts not found." }

$full=(Resolve-Path $target).Path
$src=[IO.File]::ReadAllText($full)

# ✅ Backup FIRST
$ts=Get-Date -Format "yyyyMMdd_HHmmss"
$bak=Join-Path (Split-Path $full -Parent) ("index_backup_before_digipack_v3_{0}{1}" -f $ts, ([IO.Path]::GetExtension($full)))
[IO.File]::Copy($full,$bak,$true)

# New SYSTEM PROMPT (plain text output)
$newPrompt = @"
You are NewsGenie DigiPack writer for Hindi newsroom.

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
- Keep facts consistent with input. If a fact is missing, write it as "रिपोर्ट के मुताबिक" (no invention).
"@.Trim()

# Try to locate existing system prompt template containing "DIGIPACK" or "NEWSGENIE"
$needleCandidates = @("NEWSGENIE DIGIPACK","FULL DIGIPACK","DigiPack","DIGIPACK")
$pos = -1
$needle = $null
foreach($n in $needleCandidates){
  $p = $src.IndexOf($n)
  if ($p -ge 0) { $pos=$p; $needle=$n; break }
}

if ($pos -lt 0){
  Write-Host "❌ Could not find existing DIGIPACK prompt marker in $target" -ForegroundColor Red
  Write-Host "Run this and paste output here:" -ForegroundColor Yellow
  Write-Host "Select-String -Path $target -Pattern 'DIGIPACK','NEWSGENIE','/api/digi-pack','role: \"system\"' | Select -First 40" -ForegroundColor Yellow
  exit 1
}

# Find surrounding template literal (backticks) around the found needle
$startTick = $src.LastIndexOf("`"", $pos)
$endTick   = $src.IndexOf("`"", $pos)

if ($startTick -lt 0 -or $endTick -lt 0 -or $endTick -le $startTick){
  Write-Host "❌ Found '$needle' but could not locate surrounding template literal (backticks)." -ForegroundColor Red
  Write-Host "Run and paste output:" -ForegroundColor Yellow
  Write-Host "Select-String -Path $target -Pattern '$needle','role: \"system\"','content:' -Context 2,6 | Select -First 40" -ForegroundColor Yellow
  exit 1
}

# Replace template literal contents
$before = $src.Substring(0, $startTick+1)
$after  = $src.Substring($endTick)

$out = $before + $newPrompt + $after

WriteUtf8NoBom $full $out
Write-Host "✅ DIGIPACK Generator V3 installed in $target" -ForegroundColor Green
Write-Host "Backup: $bak" -ForegroundColor Cyan
