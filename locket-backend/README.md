# Private Photobooth & AI Backend (Locket-inspired)

An **independent image-processing service**, not a copy of andanh447's Worker and not an official Locket backend. No Locket credentials, cookie, access token, photos or traffic are sent to that Worker's VPS. The API processes photos in memory and returns PNG; it does not persist submitted photos.

## Features (MVP)

| API | What it does | Requires AI model? |
|---|---|---|
| `GET /health` | Check server | No |
| `GET /api/v1/catalog` | Available styles and layouts | No |
| `POST /api/v1/filter` | Style: `classic`, `vintage`, `pastel`, `noir`, `comic` | No — conventional image processing |
| `POST /api/v1/photobooth` | Four-photo `strip` or `grid` (2×2), optional caption and style | No |
| `POST /api/v1/ai/remove-background` | Subject/background segmentation using **local** U2-Net via rembg | **Yes**, opt-in install |
| `GET /` | Browser demo, upload photos and download generated PNG | No |

**Important:** These endpoints do not automatically integrate with Locket's existing filter interface or unlock its paid features. `generateFilteredImage` is not implemented because Locket's private request/response contract and authorization are not validated. Using a redirect/rewrite without knowing that contract could break account, upload or image flows. The generated outputs are available through this service's own web UI/API.

## Run on Windows (Python 3.11 or 3.12)

```powershell
cd locket-backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

Visit **http://127.0.0.1:8000** for the upload/preview web UI, and **http://127.0.0.1:8000/docs** for interactive API docs. `start-windows.ps1` also works if Python 3.11 is installed (`.\start-windows.ps1`).

### Enable real local AI background removal

```powershell
python -m pip install -r requirements-ai.txt
# Restart API, then try /api/v1/ai/remove-background.
```

The `rembg[cpu]` library uses a real local ONNX segmentation model (`u2netp`). The **first call downloads model weights** from the model's distribution host into the local machine; after that the image inference is performed locally. Model weights are not included in this repo. This is background removal, **not generative AI** or a clone of third-party paid AI image styles. It may take longer on CPU. Check license/terms of the model and package for your use case.

## API examples

**Windows PowerShell** using curl.exe (replace image paths):

```powershell
curl.exe -X POST "http://127.0.0.1:8000/api/v1/filter" -F "file=@C:\Pictures\photo.jpg" -F "style=vintage" -o filtered.png

curl.exe -X POST "http://127.0.0.1:8000/api/v1/photobooth" -F "files=@C:\Pictures\1.jpg" -F "files=@C:\Pictures\2.jpg" -F "files=@C:\Pictures\3.jpg" -F "files=@C:\Pictures\4.jpg" -F "layout=grid" -F "style=pastel" -F "caption=My Locket" -o photobooth.png

curl.exe -X POST "http://127.0.0.1:8000/api/v1/ai/remove-background" -F "file=@C:\Pictures\photo.jpg" -F "background=transparent" -o transparent.png
```

You can set `background=#ffe8ef` to composite the AI cutout onto an opaque color.

## API key, safety and privacy

- For local testing the API defaults to **127.0.0.1**, so it is not accessible from other machines. `GET /health`, `/`, `/docs`, and catalog remain public to your local machine.
- **Before publicly exposing it**, configure `PHOTOBOOTH_API_KEY`, TLS/HTTPS, authentication, a reverse proxy with request-size and rate limits, and monitoring. Do **not** publish API keys in GitHub, Shadowrocket module, or screenshots.
- API-key auth applies to all image-processing routes via header `X-API-Key` when configured:

```powershell
$env:PHOTOBOOTH_API_KEY = "replace-with-a-long-random-secret"
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

- Each uploaded JPEG/PNG/WebP is limited to **8 MB**, **5000 px per side**, and **20 megapixels**; the photobooth route requires exactly 4 images. Output PNG removes original EXIF/GPS metadata.
- Do not put private data or credentials in the request. The service does not save original/output images to an application data directory, but multipart spooling and OS/runtime logs may temporarily use storage.
- The web demo runs on the same origin; no third-party scripts/CDNs.
- Model download is a one-time outbound network access; it does **not** upload input photos to a cloud API.

## Tests

```powershell
python -m pip install pytest httpx
python -m pytest -q
```

The tests cover health, catalog, filter output, both collage layouts, bad uploads, optional API key and missing AI dependency.

## Project files

- `app.py` — FastAPI routes, Pillow Photobooth and optional AI processing
- `requirements.txt` — core Python dependencies
- `requirements-ai.txt` — optional local model dependencies
- `tests/test_app.py` — automated tests
- `start-windows.ps1` — run locally on Windows

## Next phase

To integrate with your own companion mobile app, call these documented endpoints with your own images and permission. To implement compatibility with **Locket's** private network request, first establish a legitimate documented or authorized endpoint contract (field names, expected returned JSON, image references) and design opt-in authentication; do not redirect login tokens or private image uploads to an unknown host.
