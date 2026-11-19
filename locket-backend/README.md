# Private Photo Studio — Photobooth + Local AI (FastAPI)

A **self-hosted, independent** image editing app. It does not copy the private `andanh447` Cloudflare Worker or rely on the source VPS. The `pb_*` and `stk_*` IDs are used as compatibility **labels** to help build a recognizable filter catalog; all built-in template artwork is original and generated with Pillow shapes (no trademark logos or third-party overlays).

**Important:** This is a standalone site/API, **not an official Locket API**, does not grant Gold, and is **not automatically connected to the Locket app**. Avoid redirecting account, photo or subscription traffic to an untrusted server. A real Locket integration needs a documented or otherwise authorized API contract.

## Implemented features

| Feature | Endpoint | Availability |
| --- | --- | --- |
| Health check | `GET /health` | Always |
| Styles, layouts, template and AI effect catalog | `GET /api/v1/catalog` | Always |
| Template list | `GET /api/v1/templates` | Always |
| Preview a template without uploads | `GET /api/v1/templates/{id}/preview?layout=strip` | Always |
| Filter JPEG/PNG/WebP | `POST /api/v1/filter` | Always |
| Photobooth, four photos and 11 templates | `POST /api/v1/photobooth` | Always |
| Remove background with local U2-Net (rembg) | `POST /api/v1/ai/remove-background` | Optional CPU AI |
| Local prompt-guided image editing | `POST /api/v1/ai/edit` | Optional large AI model, CUDA recommended |
| AI effects catalog and engine status | `GET /api/v1/ai/effects` | Always |
| Web editor | `GET /` | Always |

### Photobooth template IDs

The `basic` template plus 10 styles use existing public naming labels:

- `photobooth_4cut` — Classic Film
- `photobooth_cute` — Pastel Cute
- `pb_cortis_4cut` — Electric Blue
- `pb_shinchan_4cut` — Color Pop
- `pb_supperman_4cut` — Hero Comic
- `pb_meo_dang_yeu_4cut` — Tiny Paws
- `pb_holo_4cut` — Holographic
- `pb_photobooth_hello_kitty` — Pink Bow
- `pb_vintage` — Vintage Paper
- `pb_ripped_paper_4cut` — Scrapbook

The designs themselves are created by this project (paper textures, frames, colored shapes). They are **not copies** of any source image and do not contain images of copyrighted characters or third-party graphics.

### AI effects (`/api/v1/ai/edit`)

The catalog maps six familiar effect IDs to original prompts: `stk_tai_tho`, `stk_mu_ngu_khoc`, `stk_jollibee`, `stk_gojo_satoru`, `stk_nak_ve_than`, `stk_shopee_food`. You can pass an explicit free-text `prompt` instead of using a preset (max 300 characters). Actual editing uses a **locally running** [InstructPix2Pix Diffusers model](https://huggingface.co/timbrooks/instruct-pix2pix), which must be installed and downloaded first. Generative edits can alter identity or facial details; do not promise exact preservation.

## Run on Windows (Python 3.11 / 3.12)

In PowerShell:

```powershell
cd locket-backend
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
```

Open **http://127.0.0.1:8000** and use the web editor, or open **http://127.0.0.1:8000/docs** for interactive API docs.

### Optional: CPU background removal

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-ai.txt
```

Restart the server and call `/api/v1/ai/remove-background`. On first use, `rembg` downloads the `u2netp` segmentation model; the image is then processed locally. This is *segmentation*, not a generative filter engine.

### Optional: real GPU image editing

A dedicated NVIDIA CUDA GPU and sufficient VRAM are **strongly recommended**. The default model is several gigabytes and the first run downloads model weights. An integrated GPU or CPU-only laptop can be extremely slow or unable to run this model.

1. Install a matching **CUDA-compatible PyTorch** build from the [official PyTorch installer](https://pytorch.org/get-started/locally/).
2. Install the optional pipeline dependencies:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-image-ai.txt
```

3. Restart the server and use the **AI Edit (GPU)** tab, or `POST /api/v1/ai/edit` with an image and `effect_id` or `prompt`.

Default model: `timbrooks/instruct-pix2pix`. Override with the environment variable `PHOTOBOOTH_AI_MODEL` only if the alternative supports the `StableDiffusionInstructPix2PixPipeline` API. For experimental CPU usage (not recommended): `PHOTOBOOTH_ALLOW_CPU_AI=1`.

**Verification scope:** The AI endpoint, validation, and mocked pipeline output are covered by automated tests. We have **not downloaded the large weights or run real generative inference** in the test environment. Actual model performance, memory requirements and outputs depend on your machine. Check the model's applicable license and usage conditions.

## API examples (Windows PowerShell)

Upload 4 pictures to generate a styled collage:

```powershell
curl.exe -X POST http://127.0.0.1:8000/api/v1/photobooth `
 -F "files=@C:\Pictures\1.jpg" `
 -F "files=@C:\Pictures\2.jpg" `
 -F "files=@C:\Pictures\3.jpg" `
 -F "files=@C:\Pictures\4.jpg" `
 -F "template_id=pb_holo_4cut" -F "layout=strip" `
 -F "style=classic" -F "caption=My Photo" -o booth.png
```

Generate a local AI edit (after installing the model):

```powershell
curl.exe -X POST http://127.0.0.1:8000/api/v1/ai/edit `
 -F "file=@C:\Pictures\photo.jpg" `
 -F "effect_id=stk_tai_tho" -o edited.png
```

Try a template preview without uploading a photo:

```powershell
curl.exe "http://127.0.0.1:8000/api/v1/templates/pb_holo_4cut/preview?layout=grid" -o preview.png
```

## Privacy & security

- Only JPEG, PNG and WebP. Max 8 MB per input image, 5,000 px per side and 20 megapixels. Photobooth requires exactly 4 photos and supports `strip` or `grid`.
- Generated PNGs omit input EXIF/GPS. The service stores no images as permanent application files; FastAPI and OS may spool multipart uploads temporarily.
- No code redirects user tokens, Locket authorization or photo uploads to third-party VPS or Workers. AI model weights may be downloaded from Hugging Face once; inference occurs locally.
- By default the demo binds to loopback (`127.0.0.1`) in the documented command. **Do not expose port 8000 directly to the internet.**
- For any public deployment, set a non-empty `PHOTOBOOTH_API_KEY`, serve HTTPS through a trusted reverse proxy, set rate/body-size limits, and control access to logs. Never publish that key in GitHub, a Shadowrocket module or client-side JavaScript.

Set API key for local protected routes:

```powershell
$env:PHOTOBOOTH_API_KEY = "replace-with-a-long-random-secret"
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
```

Then set the API key in the website or send header `X-API-Key` when calling private image-processing routes.

## Tests

```powershell
.\.venv\Scripts\python.exe -m pip install pytest httpx
.\.venv\Scripts\python.exe -m pytest -q
```

Tests cover API validation and output images for all 11 templates, both layouts, catalog, invalid uploads, API key protection, AI dependency errors and mocked generative inference. The actual large model is not executed in the test suite.

## Project structure

```text
locket-backend/
  app.py                   FastAPI routes; basic photo filters and background removal
  templates.py             11 original Photobooth themes and preview image generation
  ai_engine.py             Lazy-loaded GPU InstructPix2Pix adapter; six prompt presets
  web.html                 Local browser editor
  requirements.txt         API and Pillow dependencies
  requirements-ai.txt      Optional local background removal
  requirements-image-ai.txt Optional generative image editing dependencies
  start-windows.ps1        Windows run helper
  tests/test_app.py        Existing API tests
  tests/test_templates.py  Photobooth and preview tests
  tests/test_ai_edit.py    AI endpoint and safety/error handling tests
```

## Source analysis and provenance

We examined public JavaScript files in [`andanh447/locketgold-tool`](https://github.com/andanh447/locketgold-tool), [`andanh447/locketgold_tool`](https://github.com/andanh447/locketgold_tool) and [`andanh447.github.io`](https://github.com/andanh447/andanh447.github.io). Those files provided *names/IDs and architectural hints*, not the engine. Their mock HTTP 200 response for `generateFilteredImage` does **not** generate an image. No source code or opaque minified scripts from those repos have been copied into this project.

This project is built to create real, privately processed images. It does **not** modify Locket Gold entitlements or claim to replace private third-party cloud infrastructure.
