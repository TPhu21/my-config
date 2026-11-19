# Run on your own Windows PC. Do not run this script on an untrusted computer.
# Starts a protected local FastAPI server and optionally publishes it via private Tailscale Serve.
param(
    [ValidateSet("Start", "Status", "Stop")][string]$Action = "Start",
    [ValidateRange(1024, 65535)][int]$Port = 8188
)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root
$python = Join-Path $root ".venv\Scripts\python.exe"
$keyFile = Join-Path $root ".photo-studio-key.dpapi"
$pidFile = Join-Path $root ".photo-studio-pid"
$logDir = Join-Path $root ".photo-studio-logs"

function Get-TailscalePath {
    $cmd = Get-Command tailscale -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    if ($env:ProgramFiles) {
        $exe = Join-Path $env:ProgramFiles "Tailscale\tailscale.exe"
        if (Test-Path $exe) { return $exe }
    }
    return $null
}
function Show-Status {
    Write-Host "Local test URL: http://127.0.0.1:$Port/health"
    $ts = Get-TailscalePath
    if ($ts) {
        Write-Host "Tailscale Serve status:"
        & $ts serve status
    } else {
        Write-Warning "Tailscale is not installed. Install it on Windows and iPhone; use the same account."
        Write-Host "Windows: https://tailscale.com/download/windows"
        Write-Host "iPhone: https://tailscale.com/download/ios"
    }
}
if ($Action -eq "Status") { Show-Status; return }
if ($Action -eq "Stop") {
    if (Test-Path $pidFile) {
        $savedId = 0
        [void][int]::TryParse((Get-Content $pidFile -Raw).Trim(), [ref]$savedId)
        if ($savedId -gt 0) {
            $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $savedId" -ErrorAction SilentlyContinue
            if ($processInfo -and $processInfo.CommandLine -match "uvicorn\s+app:app") {
                Stop-Process -Id $savedId -Force -ErrorAction SilentlyContinue
                Write-Host "Stopped Photo Studio process $savedId."
            }
        }
        Remove-Item $pidFile -Force
    }
    Write-Host "To disable HTTPS sharing: run 'tailscale serve off' (affects other Serve mappings on this PC)."
    return
}

if (-not (Test-Path $python)) {
    if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
        throw "Python launcher not found. Install Python 3.11 from python.org and retry."
    }
    Write-Host "Creating Python 3.11 virtual environment..."
    & py -3.11 -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw "Unable to create Python 3.11 virtual environment." }
}
Write-Host "Installing FastAPI/Pillow dependencies..."
& $python -m pip install --disable-pip-version-check -r requirements.txt
if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed." }

# DPAPI encrypts the key for the current Windows user; no plain-text secret is committed to Git.
if (Test-Path $keyFile) {
    $encrypted = (Get-Content $keyFile -Raw).Trim()
    $secure = ConvertTo-SecureString $encrypted
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $key = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
} else {
    $key = (& $python -c "import secrets; print(secrets.token_urlsafe(32))").Trim()
    ConvertTo-SecureString -String $key -AsPlainText -Force |
        ConvertFrom-SecureString | Set-Content -Encoding ASCII $keyFile
}
if (-not $key) { throw "Unable to load API key." }

$env:PHOTOBOOTH_API_KEY = $key
$env:PHOTOBOOTH_REQUIRE_AUTH = "1"
$healthUrl = "http://127.0.0.1:$Port/health"
$running = $false
try {
    $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2
    $running = $health.status -eq "ok"
} catch { }
if ($running -and -not (Test-Path $pidFile)) {
    throw "Port $Port already serves an unrelated process. Retry with -Port 8189."
}
if (-not $running) {
    if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
    $stdoutLog = Join-Path $logDir "output.log"
    $stderrLog = Join-Path $logDir "error.log"
    $proc = Start-Process -FilePath $python -ArgumentList @("-m","uvicorn","app:app","--host","127.0.0.1","--port","$Port") -WorkingDirectory $root -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog
    Set-Content -Encoding ASCII $pidFile $proc.Id
    for ($i = 0; $i -lt 25; $i++) {
        Start-Sleep -Milliseconds 400
        try {
            $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2
            if ($health.status -eq "ok") { $running = $true; break }
        } catch { }
        if ($proc.HasExited) { break }
    }
    if (-not $running) {
        throw "Photo Studio failed to start. Check $logDir\error.log"
    }
}
Write-Host ""
Write-Host "Photo Studio is running on Windows."
Write-Host "Private X-API-Key for the iPhone website (do NOT share or publish):"
Write-Host $key
Write-Host ""

$ts = Get-TailscalePath
if (-not $ts) {
    Show-Status
    Write-Host "After Tailscale setup, run this script again to enable private HTTPS."
    return
}
Write-Host "Checking Tailscale..."
& $ts status
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Tailscale is not connected. Sign in on Windows and iPhone, then run this script again."
    return
}
Write-Host "Starting private HTTPS access through Tailscale Serve..."
& $ts serve --bg $Port
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Tailscale Serve needs approval or an Administrator PowerShell. Run as Administrator: tailscale serve --bg $Port"
    return
}
Show-Status
Write-Host "Open the HTTPS .ts.net URL shown above in Safari on your iPhone."
Write-Host "Enter the private X-API-Key above into the website before processing photos."
Write-Host "On iPhone, connect Tailscale for Safari testing; iOS may not permit Tailscale and Shadowrocket tunnels simultaneously."
Write-Host "This is a standalone photo editor, NOT an in-camera Locket integration."
