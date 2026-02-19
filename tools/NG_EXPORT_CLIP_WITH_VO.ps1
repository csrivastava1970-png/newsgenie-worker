param(
  [Parameter(Mandatory=$true)][string]$Src,
  [Parameter(Mandatory=$true)][int]$InMs,
  [Parameter(Mandatory=$true)][int]$OutMs,

  [string]$Slug = "clip",
  [string]$VO = "",

  # NEW: overrideable paths (bridge-friendly)
  [string]$OutDir = "C:\Cnewsgenie_demo\exports",
  [string]$TmpDir = "C:\Cnewsgenie_demo\temp",
  [string]$Ffmpeg = "C:\Cnewsgenie_demo\ffmpeg\bin\ffmpeg.exe"
)

$ErrorActionPreference = "Stop"

function To-TS([int]$ms){
  return [TimeSpan]::FromMilliseconds($ms).ToString("hh\:mm\:ss\.fff")
}

# --- Validations (minimal, fail fast) ---
if (-not (Test-Path -LiteralPath $Src)) {
  throw "SRC_NOT_FOUND: $Src"
}
if ($InMs -lt 0 -or $OutMs -lt 0) {
  throw "BAD_RANGE: InMs/OutMs must be >= 0"
}
if ($InMs -ge $OutMs) {
  throw "BAD_RANGE: InMs must be < OutMs"
}
if (-not [string]::IsNullOrWhiteSpace($VO) -and -not (Test-Path -LiteralPath $VO)) {
  throw "VO_NOT_FOUND: $VO"
}

# Ensure dirs exist
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

# Validate ffmpeg
if (-not (Test-Path -LiteralPath $Ffmpeg)) {
  throw "FFMPEG_NOT_FOUND: $Ffmpeg"
}

# Normalize ffmpeg exe path
$ff = $Ffmpeg


# Step 1: always cut (fast copy)
$safe = ($Slug -replace "[^a-zA-Z0-9_-]+","_")
$ss = To-TS $InMs
$to = To-TS $OutMs
$durSec = [Math]::Max(0.001, (($OutMs - $InMs) / 1000.0))

$cut = Join-Path $OutDir ("NG_" + $safe + "_CUT_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".mp4")
& $ff -hide_banner -loglevel error -y -ss $ss -to $to -i $Src -c copy "$cut"

# If no VO, finish (print the output path for the bridge)
if ([string]::IsNullOrWhiteSpace($VO)) {
  Write-Output $cut
  exit 0
}

# Step 2: convert VO to 48k mono AAC (stable + PowerShell-safe)
$ff = $Ffmpeg
if ([string]::IsNullOrWhiteSpace($ff)) { $ff = "ffmpeg" }

$tmpDir = $TmpDir
if ([string]::IsNullOrWhiteSpace($tmpDir)) { $tmpDir = "C:\Cnewsgenie_demo\temp" }
New-Item -ItemType Directory -Force $tmpDir | Out-Null

$voAac = Join-Path $tmpDir ("VO_48k_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".m4a")

$argVo = @(
  "-hide_banner","-loglevel","error","-y",
  "-i", $VO,
  "-vn",
  "-ac","1",
  "-ar","48000",
  "-c:a","aac",
  "-b:a","128k",
  $voAac
)
& $ff @argVo
if ($LASTEXITCODE -ne 0) { throw "FFMPEG_VO_CONVERT_FAILED exit=$LASTEXITCODE" }

# Step 3: mix CUT audio + VO (PowerShell-safe; no broken backticks)
$mix = Join-Path $outDir ("NG_" + $safe + "_MIX_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".mp4")

$argMix = @(
  "-hide_banner","-loglevel","error","-y",
  "-i", "$cut",
  "-i", "$voAac",
  "-filter_complex", "[0:a][1:a]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=250[amb];[amb][1:a]amix=inputs=2[a]",
  "-map","0:v:0",
  "-map","[a]",
  "-t", "$durSec",
  "-c:v","copy",
  "-c:a","aac",
  "-b:a","192k",
  "$mix"
)

& $ff @argMix
if ($LASTEXITCODE -ne 0) { throw "FFMPEG_MIX_FAILED exit=$LASTEXITCODE" }

Write-Output $mix
exit 0
