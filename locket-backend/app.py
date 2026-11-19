"""Standalone, self-hosted image effects and Photobooth API.

No Locket API impersonation and no third-party Worker/VPS forwarding.
"""

from __future__ import annotations

import io
import os
from functools import lru_cache
from typing import Annotated

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import HTMLResponse, Response
from PIL import Image, ImageEnhance, ImageFilter, ImageFont, ImageOps, ImageDraw, UnidentifiedImageError

app = FastAPI(title="Private Photobooth + AI Backend", version="1.0.0")

MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # Per image
MAX_PIXELS = 20_000_000
MAX_SIDE = 5000
Image.MAX_IMAGE_PIXELS = MAX_PIXELS
API_KEY = os.getenv("PHOTOBOOTH_API_KEY", "")
STYLES = ("classic", "noir", "vintage", "pastel", "comic")
LAYOUTS = ("strip", "grid")


def authorize(x_api_key: str | None) -> None:
    """Optional shared-key auth. Do not commit the key or embed it in public modules."""
    if API_KEY:
        import secrets
        if not x_api_key or not secrets.compare_digest(x_api_key, API_KEY):
            raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


async def load_photo(file: UploadFile) -> Image.Image:
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG and WEBP images are supported")
    raw = await file.read(MAX_UPLOAD_BYTES + 1)
    await file.close()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty image")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 8 MB")
    try:
        with Image.open(io.BytesIO(raw)) as img:
            if img.format not in {"JPEG", "PNG", "WEBP"}:
                raise HTTPException(status_code=415, detail="Unsupported image encoding")
            if max(img.size) > MAX_SIDE or img.width * img.height > MAX_PIXELS:
                raise HTTPException(status_code=413, detail="Image dimensions are too large")
            img = ImageOps.exif_transpose(img)
            img.load()
            return img.convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
        raise HTTPException(status_code=400, detail="Corrupt or invalid image") from exc


def apply_style(image: Image.Image, style: str) -> Image.Image:
    if style not in STYLES:
        raise HTTPException(status_code=422, detail="Unknown style")
    image = image.convert("RGB")
    if style == "classic":
        return image
    if style == "noir":
        return ImageEnhance.Contrast(ImageOps.grayscale(image)).enhance(1.32).convert("RGB")
    if style == "vintage":
        gray = ImageOps.grayscale(image)
        warm = ImageOps.colorize(gray, black="#36261e", white="#f8e6bf")
        return Image.blend(image, warm, 0.65)
    if style == "pastel":
        softened = image.filter(ImageFilter.GaussianBlur(0.6))
        softened = ImageEnhance.Contrast(softened).enhance(0.85)
        return Image.blend(softened, Image.new("RGB", image.size, "#ffe8ef"), 0.18)
    # Comic-like image processing (NOT a generative AI model).
    reduced = ImageOps.posterize(image, 4).filter(ImageFilter.SMOOTH)
    edges = ImageOps.grayscale(image).filter(ImageFilter.FIND_EDGES)
    edges = edges.point(lambda v: 255 if v < 55 else 0)
    return Image.composite(Image.new("RGB", image.size, "#202020"), reduced, edges)


def font(size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def create_booth(images: list[Image.Image], layout: str, style: str, caption: str) -> Image.Image:
    if layout not in LAYOUTS:
        raise HTTPException(status_code=422, detail="Layout must be strip or grid")
    if len(caption) > 60:
        raise HTTPException(status_code=422, detail="Caption may contain at most 60 characters")
    cell_w, cell_h, gap, padding, footer = 380, 285, 18, 28, 70
    if layout == "strip":
        columns, rows = 1, 4
    else:
        columns, rows = 2, 2
    w = columns * cell_w + (columns - 1) * gap + padding * 2
    h = rows * cell_h + (rows - 1) * gap + padding * 2 + footer
    paper = Image.new("RGB", (w, h), "#fff9f3" if style == "vintage" else "#ffffff")
    draw = ImageDraw.Draw(paper)
    for i, image in enumerate(images):
        col, row = i % columns, i // columns
        x = padding + col * (cell_w + gap)
        y = padding + row * (cell_h + gap)
        photo = apply_style(ImageOps.fit(image, (cell_w, cell_h), method=Image.Resampling.LANCZOS), style)
        paper.paste(photo, (x, y))
        draw.rectangle((x, y, x + cell_w - 1, y + cell_h - 1), outline="#d8d8d8", width=2)
    message = caption.strip() or "PHOTOBOOTH"
    draw.text((padding, h - footer + 5), message, font=font(25), fill="#303030")
    draw.text((padding, h - 30), "Self-hosted • No photo storage", font=font(12), fill="#666666")
    return paper


def png_response(image: Image.Image, filename: str) -> Response:
    buf = io.BytesIO()
    # No EXIF/GPS or input metadata is forwarded to the result.
    image.save(buf, "PNG", optimize=True)
    return Response(content=buf.getvalue(), media_type="image/png", headers={
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
    })


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "private-photobooth"}


@app.get("/api/v1/catalog")
def catalog() -> dict:
    return {"styles": list(STYLES), "layouts": list(LAYOUTS), "photobooth_photos": 4,
            "ai": {"background_removal": "optional (requires rembg[cpu])"}}


@app.post("/api/v1/filter", response_class=Response)
async def filter_image(
    file: Annotated[UploadFile, File()],
    style: Annotated[str, Form()] = "vintage",
    x_api_key: Annotated[str | None, Header()] = None,
) -> Response:
    authorize(x_api_key)
    if style not in STYLES:
        raise HTTPException(status_code=422, detail="Unknown style")
    photo = await load_photo(file)
    return png_response(apply_style(photo, style), "filtered.png")


@app.post("/api/v1/photobooth", response_class=Response)
async def photobooth(
    files: Annotated[list[UploadFile], File()],
    layout: Annotated[str, Form()] = "strip",
    style: Annotated[str, Form()] = "classic",
    caption: Annotated[str, Form()] = "PHOTOBOOTH",
    x_api_key: Annotated[str | None, Header()] = None,
) -> Response:
    authorize(x_api_key)
    if len(files) != 4:
        raise HTTPException(status_code=422, detail="Exactly 4 photos are required")
    if layout not in LAYOUTS or style not in STYLES or len(caption) > 60:
        raise HTTPException(status_code=422, detail="Invalid layout, style or caption")
    photos = [await load_photo(file) for file in files]
    collage = create_booth(photos, layout, style, caption)
    return png_response(collage, f"photobooth-{layout}.png")


@lru_cache(maxsize=1)
def ai_session():
    from rembg import new_session  # Optional package, imported only on AI route
    # u2netp: small ONNX model executed locally; first use may download model weights.
    return new_session("u2netp")


@app.post("/api/v1/ai/remove-background", response_class=Response)
async def ai_remove_background(
    file: Annotated[UploadFile, File()],
    background: Annotated[str, Form()] = "transparent",
    x_api_key: Annotated[str | None, Header()] = None,
) -> Response:
    authorize(x_api_key)
    if background != "transparent" and not (len(background) == 7 and background.startswith("#")
        and all(c in "0123456789abcdefABCDEF" for c in background[1:])):
        raise HTTPException(status_code=422, detail="Background must be transparent or #RRGGBB")
    photo = await load_photo(file)
    try:
        from rembg import remove
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="AI not installed; pip install -r requirements-ai.txt") from exc
    try:
        cutout = remove(photo, session=ai_session())
    except Exception as exc:
        # Avoid reflecting model paths, internal errors or sensitive data in HTTP errors.
        raise HTTPException(status_code=503, detail="Local AI model unavailable; check server logs and model installation") from exc
    if isinstance(cutout, (bytes, bytearray)):
        with Image.open(io.BytesIO(cutout)) as decoded:
            cutout = decoded.convert("RGBA")
    else:
        cutout = cutout.convert("RGBA")
    if background != "transparent":
        canvas = Image.new("RGBA", cutout.size, background)
        cutout = Image.alpha_composite(canvas, cutout)
    return png_response(cutout, "background-removed.png")


@app.get("/", response_class=HTMLResponse)
def demo() -> str:
    return '''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Private Photobooth</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:35px auto;padding:0 16px;color:#202632}h1{font-size:26px}section{border:1px solid #ddd;border-radius:12px;padding:18px;margin:18px 0}label{display:block;margin:10px 0}input,select,button{font:inherit}button{padding:10px 18px;cursor:pointer}img{max-width:100%;border-radius:8px}small{color:#666}</style>
<h1>Photobooth &amp; AI — chạy trên server của bạn</h1><p><small>Ảnh không được gửi đến Worker/VPS bên thứ ba. Tính năng AI xóa nền cần cài thêm rembg.</small></p>
<label>API key (nếu đã cấu hình) <input id="key" type="password" autocomplete="off"></label>
<section><h2>Photobooth (4 ảnh)</h2><form id="booth"><label>Chọn 4 ảnh <input name="files" type="file" accept="image/png,image/jpeg,image/webp" multiple required></label><label>Layout <select name="layout"><option value="strip">Strip (4 dọc)</option><option value="grid">Grid (2×2)</option></select></label><label>Style <select name="style"><option>classic</option><option>vintage</option><option>pastel</option><option>noir</option><option>comic</option></select></label><label>Caption <input name="caption" maxlength="60" value="PHOTOBOOTH"></label><button>Tạo ảnh</button></form></section>
<section><h2>Filter / AI xóa nền (1 ảnh)</h2><form id="single"><label>Ảnh <input name="file" type="file" accept="image/png,image/jpeg,image/webp" required></label><label>Tác vụ <select id="action"><option value="/api/v1/filter">Hiệu ứng ảnh</option><option value="/api/v1/ai/remove-background">AI xóa nền</option></select></label><label>Style <select name="style" id="style"><option>vintage</option><option>pastel</option><option>noir</option><option>comic</option><option>classic</option></select></label><button>Xử lý</button></form></section><p id="state" role="status"></p><a id="save" style="display:none" download="result.png">Tải kết quả PNG</a><p><img id="preview" alt="Kết quả"></p>
<script>let last=null;async function send(form,url){const status=document.getElementById('state');status.textContent='Đang xử lý…';const fd=new FormData(form);if(url.includes('remove-background'))fd.delete('style');if(url.includes('/filter'))fd.delete('caption');try{const r=await fetch(url,{method:'POST',headers:document.getElementById('key').value?{'X-API-Key':document.getElementById('key').value}:{},body:fd});if(!r.ok){const e=await r.json();throw Error(e.detail||r.statusText)}const blob=await r.blob();if(last)URL.revokeObjectURL(last);last=URL.createObjectURL(blob);document.getElementById('preview').src=last;const a=document.getElementById('save');a.href=last;a.style.display='inline';status.textContent='Hoàn tất: tải ảnh PNG bên dưới.'}catch(e){status.textContent='Lỗi: '+e.message}}document.getElementById('booth').onsubmit=e=>{e.preventDefault();send(e.target,'/api/v1/photobooth')};document.getElementById('single').onsubmit=e=>{e.preventDefault();send(e.target,document.getElementById('action').value)};</script></html>'''
