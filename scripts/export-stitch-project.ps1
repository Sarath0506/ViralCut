# Export Stitch project screens (HTML + PNG) into design/stitch/
# Usage:
#   $env:STITCH_API_KEY = "your-key"
#   .\scripts\export-stitch-project.ps1 -ProjectId "14653254409083074276"

param(
  [string]$ProjectId = $env:STITCH_PROJECT_ID_VIRALCUT,
  [string]$ApiKey = $env:STITCH_API_KEY,
  [string]$OutMobile = "design\stitch\mobile-creator",
  [string]$OutWeb = "design\stitch\web-brand",
  [ValidateSet("mobile-creator", "web-brand", "auto")]
  [string]$Target = "auto",
  [string]$ManifestFile = "design\stitch\manifest.json"
)

if (-not $ApiKey) { throw "Set STITCH_API_KEY environment variable" }
if (-not $ProjectId) { throw "Set STITCH_PROJECT_ID_VIRALCUT or pass -ProjectId" }

function Invoke-StitchMcp($toolName, $arguments) {
  $headers = @{
    "X-Goog-Api-Key" = $ApiKey
    "Content-Type"   = "application/json"
  }
  $body = @{
    jsonrpc = "2.0"
    id      = 1
    method  = "tools/call"
    params  = @{ name = $toolName; arguments = $arguments }
  } | ConvertTo-Json -Depth 6 -Compress
  $r = Invoke-RestMethod -Uri "https://stitch.googleapis.com/mcp" -Method POST -Headers $headers -Body $body -TimeoutSec 120
  if ($r.result.isError) { throw ($r.result.content[0].text) }
  return ($r.result.content[0].text | ConvertFrom-Json)
}

function Sanitize-FileName([string]$title) {
  $s = $title -replace '[^\w\s\-]', ''
  $s = ($s -replace '\s+', '-').Trim('-').ToLower()
  if ($s.Length -gt 80) { $s = $s.Substring(0, 80) }
  if (-not $s) { $s = "screen" }
  return $s
}

New-Item -ItemType Directory -Force -Path $OutMobile, $OutWeb | Out-Null

$data = Invoke-StitchMcp "list_screens" @{ projectId = $ProjectId }
$manifest = @{
  source    = "stitch"
  projectId = $ProjectId
  exportedAt = (Get-Date).ToUniversalTime().ToString("o")
  screens   = @()
}

$index = 0
foreach ($screen in $data.screens) {
  $index++
  $title = $screen.title
  $slug = Sanitize-FileName $title
  $prefix = "{0:D2}-{1}" -f $index, $slug

  $isWeb = switch ($Target) {
    "web-brand" { $true }
    "mobile-creator" { $false }
    default {
      ($screen.deviceType -eq "DESKTOP") -or
        ($title -match '\.md$|web|brand|portal' -and $title -notmatch 'FIGMA')
    }
  }
  $outDir = if ($isWeb) { $OutWeb } else { $OutMobile }

  $entry = @{
    id         = $screen.name
    title      = $title
    deviceType = $screen.deviceType
    width      = $screen.width
    height     = $screen.height
    files      = @()
  }

  if ($screen.htmlCode.downloadUrl) {
    $ext = if ($screen.htmlCode.mimeType -match 'markdown') { 'md' } elseif ($screen.htmlCode.mimeType -match 'html') { 'html' } else { 'txt' }
    $htmlPath = Join-Path $outDir "$prefix.$ext"
    Invoke-WebRequest -Uri $screen.htmlCode.downloadUrl -OutFile $htmlPath -UseBasicParsing
    $entry.files += $htmlPath
  }

  if ($screen.screenshot.downloadUrl) {
    $pngPath = Join-Path $outDir "$prefix.png"
    Invoke-WebRequest -Uri $screen.screenshot.downloadUrl -OutFile $pngPath -UseBasicParsing
    $entry.files += $pngPath
  }

  $manifest.screens += $entry
  Write-Host "Exported: $title -> $outDir"
}

$manifest | ConvertTo-Json -Depth 8 | Set-Content -Path $ManifestFile -Encoding UTF8
Write-Host "Done. Manifest: $ManifestFile"
