# Prepare HTTP Toolkit on Windows for a local, user-authorized iPhone diagnostic.
# No VPN/proxy/certificate modifications are made automatically.
param([switch]$SkipInstall)
$ErrorActionPreference = "Stop"
Write-Host "=== Locket PTB local protocol diagnostic ==="
Write-Host "No account tokens, user photos or raw exports should be uploaded."
if (-not $SkipInstall) {
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if (-not $winget) { throw "winget is unavailable. Download HTTP Toolkit from https://httptoolkit.com/download/" }
    & winget install --id HTTPToolKit.HTTPToolKit --exact --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) { throw "HTTP Toolkit install failed (winget code $LASTEXITCODE). Try official download." }
}
Write-Host ""
Write-Host "1. Open HTTP Toolkit > Intercept > Anything. Read your PC IP and proxy port (often 8000)."
Write-Host "2. Connect PC and iPhone to the same trusted Wi-Fi. Temporarily disconnect Shadowrocket VPN for this controlled proxy test."
Write-Host "3. iPhone: Settings > Wi-Fi > (i) > Configure Proxy > Manual. Enter the PC IP and HTTP Toolkit port."
Write-Host "4. Follow https://httptoolkit.com/docs/guides/ios/ to install/trust ONLY the local HTTP Toolkit CA."
Write-Host "5. Verify Safari: https://amiusing.httptoolkit.tech"
Write-Host "6. HTTP Toolkit: Settings > HTTPS > intercept only explicitly needed Locket hostnames, where supported."
Write-Host "7. Use a throwaway account and generated test images. Do not record credentials or private content."
Write-Host "8. In View, find filter requests and note ONLY method, action, status, MIME types and JSON field names/types."
Write-Host "9. If you have HTTP Toolkit Pro, export ONLY filtered exchanges as HAR, then sanitize locally:"
Write-Host '   py -3.11 sanitize_locket_har.py "C:\path\session.har" --output "C:\path\safe-report.json"'
Write-Host "   Do not share the original HAR (it may contain tokens and image bytes)."
Write-Host "10. Immediately set iPhone Wi-Fi Configure Proxy back to Off and remove HTTP Toolkit CA trust."
Write-Host "NOTE: A third-party Shadowrocket VPS config may reroute requests, so this capture may show a different path."
Write-Host "NOTE: HTTPS pinning or VPN/proxy conflicts may prevent this type of inspection. Do not bypass pinning."
Start-Process "https://httptoolkit.com/docs/guides/ios/"
