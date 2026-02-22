param(
  [Parameter(Mandatory=$true)][string]$Topic,
  [string]$Lang="hi",
  [string]$Url="http://127.0.0.1:8787/api/digi-pack"
)

# Always send UTF-8 bytes (prevents Hindi garbling / ????)
$payload = @{ topic=$Topic; language=$Lang } | ConvertTo-Json -Depth 6
$bytes   = [System.Text.Encoding]::UTF8.GetBytes($payload)

$r = Invoke-WebRequest -Method Post -Uri $Url -ContentType "application/json; charset=utf-8" -Body $bytes -UseBasicParsing
$j = $r.Content | ConvertFrom-Json

# Print compact essentials (safe for long outputs)
"OK=$($j.ok)  MODE=$($j.mode)  MODEL=$($j.model)  PATH=$($j.path)"
"TOPIC_IN=$Topic"
"TOPIC_SEEN=$($j.output_json.topic)"
"HEADLINE=$($j.output_json.headline)"
"SUMMARY=$($j.output_json.summary)"
if ($j.output_json.web_article -and $j.output_json.web_article.headline) {
  "WEB_HEADLINE=$($j.output_json.web_article.headline)"
}
