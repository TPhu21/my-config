"""Standalone, self-hosted image effects and Photobooth API.

No Locket API impersonation and no third-party Worker/VPS forwarding.
"""

from __future__ import annotations

import io
import os
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from starlette.concurrency import run_in_threadpool

from templates import TEMPLATES, get_template, preview_image, render_photobooth
from ai_engine import effect_catalog, edit_photo, model_status

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
            "templates": [t.public() for t in TEMPLATES],
            "ai_effects": effect_catalog(),
            "ai": {"background_removal": "optional (requires rembg[cpu])",
                   "prompt_editing": "optional (requires CUDA / requirements-image-ai.txt)"}}


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
    template_id: Annotated[str, Form()] = "basic",
    x_api_key: Annotated[str | None, Header()] = None,
) -> Response:
    authorize(x_api_key)
    if len(files) != 4:
        raise HTTPException(status_code=422, detail="Exactly 4 photos are required")
    if layout not in LAYOUTS or style not in STYLES or len(caption) > 60:
        raise HTTPException(status_code=422, detail="Invalid layout, style or caption")
    get_template(template_id)
    photos = [await load_photo(file) for file in files]
    collage = await run_in_threadpool(render_photobooth, photos, layout, style, caption, template_id)
    return png_response(collage, f"photobooth-{template_id}-{layout}.png")


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


@app.get("/api/v1/templates")
def templates_list() -> dict:
    return {"templates": [t.public() for t in TEMPLATES]}


@app.get("/api/v1/templates/{template_id}/preview", response_class=Response)
def template_preview(template_id: str, layout: str = "strip") -> Response:
    get_template(template_id)
    if layout not in LAYOUTS:
        raise HTTPException(status_code=422, detail="Layout must be strip or grid")
    return png_response(preview_image(template_id, layout).copy(), f"preview-{template_id}.png")


@app.get("/api/v1/ai/effects")
def ai_effects() -> dict:
    return {"effects": effect_catalog(), "engine": model_status()}


@app.post("/api/v1/ai/edit", response_class=Response)
async def ai_edit_image(
    file: Annotated[UploadFile, File()],
    effect_id: Annotated[str, Form()] = "",
    prompt: Annotated[str, Form()] = "",
    steps: Annotated[int, Form(ge=8, le=50)] = 20,
    guidance_scale: Annotated[float, Form(ge=1, le=15)] = 7.5,
    image_guidance_scale: Annotated[float, Form(ge=1, le=3)] = 1.5,
    x_api_key: Annotated[str | None, Header()] = None,
) -> Response:
    authorize(x_api_key)
    photo = await load_photo(file)
    result = await run_in_threadpool(edit_photo, photo, effect_id, prompt,
                                     steps, guidance_scale, image_guidance_scale)
    return png_response(result, "ai-edited.png")


@app.get("/", response_class=HTMLResponse)
def demo() -> str:
    return Path(__file__).with_name("web.html").read_text(encoding="utf-8")
