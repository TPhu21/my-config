# Local-only Photo Studio -> Locket SDK launcher for Windows PowerShell 5.1.
# Default: generates JPEG preview only. Never signs into Locket or posts.
param(
  [Parameter(Mandatory=$true)][string]$Photo,
  [string]$Template = "photobooth_4cut",
  [string]$Output = "",
  [switch]$Publish,
  [string]$SessionPath = ""
)
$ErrorActionPreference = "Stop"
if (-not (Test-Path -LiteralPath $Photo -PathType Leaf)) { throw "Photo file not found." }
$fullPhoto = (Resolve-Path -LiteralPath $Photo).Path
if ([IO.Path]::GetExtension($fullPhoto).ToLowerInvariant() -notin @(".jpg", ".jpeg")) {
  throw "Input must be JPEG (.jpg/.jpeg)."
}
if ($Publish) {
  if ([string]::IsNullOrWhiteSpace($SessionPath) -or -not (Test-Path -LiteralPath $SessionPath -PathType Leaf)) {
    throw "To publish, supply -SessionPath pointing to your existing local locketlam session. No login will run."
  }
  $decision = Read-Host "Publish ONE PTB moment to YOUR OWN Locket account (self-only)? Type POST"
  if ($decision -cne "POST") { throw "Publishing cancelled." }
}
$work = Join-Path $HOME "photo-studio-local-sdk"
if (-not (Test-Path $work)) { [void](New-Item -ItemType Directory -Path $work) }
$pythonFile = Join-Path $work "local_locket_sdk_bridge.py"
$scriptUrl = "https://raw.githubusercontent.com/TPhu21/my-config/feature/ptb-native-contract-diagnostics/locket-backend/local_locket_sdk_bridge.py"
Invoke-WebRequest -Uri $scriptUrl -OutFile $pythonFile
$py = Get-Command py -ErrorAction SilentlyContinue
if (-not $py) { throw "Python launcher 'py' not found. Install Python 3.11 first." }
$venvPython = Join-Path $work ".venv\Scripts\python.exe"
if (-not (Test-Path -LiteralPath $venvPython)) {
  & py -3.11 -m venv (Join-Path $work ".venv")
  if ($LASTEXITCODE -ne 0) { throw "Could not create Python 3.11 venv." }
}
& $venvPython -m pip install -q requests
if ($LASTEXITCODE -ne 0) { throw "Could not install requests." }
if ($Publish) {
  & $venvPython -m pip install -q locketlam
  if ($LASTEXITCODE -ne 0) { throw "Could not install optional locketlam SDK." }
}
if ([string]::IsNullOrWhiteSpace($Output)) {
  $Output = Join-Path $work ("ptb-preview-" + [guid]::NewGuid().ToString("N") + ".jpg")
}
# The API key is used only in this process. Never print it.
$secret = Read-Host "Render STAGING Photo API key (not Locket credentials)" -AsSecureString
$bstr = [IntPtr]::Zero
try {
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
  $env:PHOTOBOOTH_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  $argsPython = @($pythonFile, $fullPhoto, "--template", $Template, "--out", $Output)
  if ($Publish) { $argsPython += @("--session-path", (Resolve-Path -LiteralPath $SessionPath).Path, "--publish") }
  & $venvPython @argsPython
  if ($LASTEXITCODE -ne 0) { throw "Photo Studio client failed." }
} finally {
  Remove-Item Env:\PHOTOBOOTH_API_KEY -ErrorAction SilentlyContinue
  if ($bstr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}
Write-Host "Finished. Photo remains local: $Output"
