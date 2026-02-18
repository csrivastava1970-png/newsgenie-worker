param(
  [Parameter(Mandatory=$true)][string]$Src,
  [Parameter(Mandatory=$true)][int]$InMs,
  [Parameter(Mandatory=$true)][int]$OutMs,
  [string]$Slug = "clip",
  [string]$VO = ""   # optional: path to wav/mp3/aac
)

$ErrorActionPreference = "Stop"

function To-TS([int]$ms){
  return [TimeSpan]::FromMilliseconds($ms).ToString("hh\:mm\:ss\.fff")
}

$ss = To-TS $InMs
$to = To-TS $OutMs
$durMs = [Math]::Max(0, $OutMs - $InMs)
$durSec = [Math]::Round(($durMs/1000.0), 2)

$safe = ($Slug -replace '[^a-zA-Z0-9_\-]+','_')
$outDir = "C:\Cnewsgenie_demo\exports"
New-Item -ItemType Directory -Force $outDir | Out-Null

# Step 1: always cut (fast copy)
$cut = Join-Path $outDir ("NG_" + $safe + "_CUT_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".mp4")
ffmpeg -hide_banner -loglevel error -y -ss $ss -to $to -i $Src -c copy $cut

# If no VO, finish
if ([string]::IsNullOrWhiteSpace($VO)) {
  $cut
  exit 0
}

# Step 2: convert VO to 48k mono AAC (stable for your ffmpeg)
$tmpDir = "C:\Cnewsgenie_demo\temp"
New-Item -ItemType Directory -Force $tmpDir | Out-Null
$voAac = Join-Path $tmpDir ("VO_48k_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".aac")
ffmpeg -hide_banner -loglevel error -y -i $VO -ac 1 -ar 48000 -c:a aac -b:a 96k $voAac

# Step 3: mix ambience + VO with ducking (proven working pattern)
$mix = Join-Path $outDir ("NG_" + $safe + "_MIX_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".mp4")

# Use duration clamp so output equals cut length
ffmpeg -hide_banner -loglevel error -y -i $cut -i $voAac `
-filter_complex "[0:a][1:a]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=250[amb];[amb][1:a]amix=inputs=2[a]" `
-map 0:v -map "[a]" -t $durSec -c:v copy -c:a aac -b:a 128k $mix

$mix
