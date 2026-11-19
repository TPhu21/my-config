Set-Location $PSScriptRoot
if (-not (Test-Path .venv)) { py -3.11 -m venv .venv }
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Write-Host 'Open http://127.0.0.1:8000 in your browser'
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
