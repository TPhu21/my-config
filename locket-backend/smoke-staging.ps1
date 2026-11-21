# Staging smoke test. Run locally in PowerShell. Never paste or commit API keys.
param([string]$BaseUrl = "https://phu-private-photo-studio-staging.onrender.com")
$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")
if (-not $BaseUrl.StartsWith("https://")) { throw "HTTPS required." }
if ([string]::IsNullOrWhiteSpace($env:PHOTOBOOTH_API_KEY)) { throw "Set PHOTOBOOTH_API_KEY privately in PowerShell." }
$health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET
if ($health.status -ne "ok") { throw "Health check failed." }
Write-Host "PASS health"
$sample = [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lQAAAABJRU5ErkJggg==")
$file = Join-Path ([IO.Path]::GetTempPath()) ("ptb-test-" + [guid]::NewGuid().ToString("N") + ".png")
[IO.File]::WriteAllBytes($file, $sample)
try {
  $answer = & curl.exe --silent --show-error --fail --max-time 90 --request POST "$BaseUrl/api/v1/owned-photo/render" --header "X-API-Key: $env:PHOTOBOOTH_API_KEY" --form "file=@$file;type=image/png" --form "template_id=photobooth_4cut"
  if ($LASTEXITCODE -ne 0) { throw "Render request failed." }
  $json = $answer | ConvertFrom-Json
  if ($json.status -ne 200 -or $json.mime_type -ne "image/jpeg") { throw "Invalid JSON response." }
  $url = [uri]$json.image_url
  if ($url.Scheme -ne "https" -or $url.Host -ne ([uri]$BaseUrl).Host -or -not $url.AbsolutePath.StartsWith("/api/v1/owned-photo/images/")) { throw "Unexpected download URL." }
  Write-Host "PASS JSON response and safe HTTPS download URL"
  $out = Join-Path ([IO.Path]::GetTempPath()) ("ptb-out-" + [guid]::NewGuid().ToString("N") + ".jpg")
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -Method GET
    $bytes = [IO.File]::ReadAllBytes($out)
    if ($bytes.Length -lt 4 -or $bytes[0] -ne 255 -or $bytes[1] -ne 216 -or $bytes[2] -ne 255) { throw "Not JPEG bytes." }
    Write-Host "PASS image/jpeg download ($($bytes.Length) bytes)"
  } finally { Remove-Item -LiteralPath $out -ErrorAction SilentlyContinue }
} finally { Remove-Item -LiteralPath $file -ErrorAction SilentlyContinue }
Write-Host "PASS staging smoke test. No private URL or API key printed."
