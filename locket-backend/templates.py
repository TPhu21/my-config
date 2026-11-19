"""Original photobooth layouts made from Pillow primitives.

Public filter IDs are used only as compatibility labels. No third-party artwork,
logos, characters, fonts, tokens, or remote assets are included.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from functools import lru_cache

from fastapi import HTTPException
from PIL import Image, ImageColor, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

CELL_W, CELL_H = 380, 285
GAP, PAD, FOOTER = 18, 28, 70


@dataclass(frozen=True)
class BoothTemplate:
    id: str
    name: str
    description: str
    paper: str
    ink: str
    accent: str
    accent2: str
    decorative: str = "dots"
    suggested_layout: str = "strip"

    def public(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "colors": [self.paper, self.accent, self.accent2],
            "suggested_layout": self.suggested_layout,
            "preview_url": f"/api/v1/templates/{self.id}/preview",
        }


TEMPLATES: tuple[BoothTemplate, ...] = (
    BoothTemplate("basic", "Clean White", "Minimal photo strip", "#ffffff", "#303030", "#dde4f0", "#adb9ca", "minimal"),
    BoothTemplate("photobooth_4cut", "Classic Film", "Black film-strip borders", "#181b24", "#fff4de", "#f8ecd6", "#9aa7ad", "film"),
    BoothTemplate("photobooth_cute", "Pastel Cute", "Pastel dots and hearts", "#ffeff6", "#653c68", "#f49dc1", "#c2a9ed", "hearts"),
    BoothTemplate("pb_cortis_4cut", "Electric Blue", "Sporty neon-blue lines", "#102d65", "#f4f8ff", "#49c2fe", "#b5e9ff", "neon"),
    BoothTemplate("pb_shinchan_4cut", "Color Pop", "Playful geometric shapes", "#fff2bf", "#473223", "#f9a435", "#72cdeb", "confetti"),
    BoothTemplate("pb_supperman_4cut", "Hero Comic", "Red and blue comic accents", "#1c376d", "#ffffff", "#eb5660", "#f5c55e", "stars"),
    BoothTemplate("pb_meo_dang_yeu_4cut", "Tiny Paws", "Sweet pastel paw patterns", "#fff5f7", "#775469", "#f9aec7", "#c0b0e9", "paws"),
    BoothTemplate("pb_holo_4cut", "Holographic", "Iridescent highlight streaks", "#1f1744", "#ffffff", "#95ecf9", "#dd9ef9", "holo"),
    BoothTemplate("pb_photobooth_hello_kitty", "Pink Bow", "Original bow decorations", "#ffe6ef", "#6f3d56", "#fc8eaa", "#ffffff", "bows"),
    BoothTemplate("pb_vintage", "Vintage Paper", "Sepia paper and perforation", "#f2e6d0", "#543e2d", "#bea17b", "#e7cda5", "paper"),
    BoothTemplate("pb_ripped_paper_4cut", "Scrapbook", "Handmade paper and tape", "#f1ede9", "#4b4650", "#d8a58c", "#8faab3", "tape"),
)
TEMPLATE_MAP = {item.id: item for item in TEMPLATES}


def get_template(template_id: str) -> BoothTemplate:
    try:
        return TEMPLATE_MAP[template_id]
    except KeyError as exc:
        raise HTTPException(status_code=422, detail=f"Unknown template_id: {template_id}") from exc


@lru_cache(maxsize=12)
def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = ["DejaVuSans-Bold.ttf", "arialbd.ttf"] if bold else ["DejaVuSans.ttf", "arial.ttf"]
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def _star(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int, color: str):
    points = []
    for i in range(10):
        a = (i * math.pi / 5) - math.pi / 2
        r = radius if i % 2 == 0 else radius * 0.43
        points.append((int(cx + math.cos(a) * r), int(cy + math.sin(a) * r)))
    draw.polygon(points, fill=color)


def _heart(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, color: str):
    draw.ellipse((cx - size, cy - size // 2, cx, cy + size // 2), fill=color)
    draw.ellipse((cx, cy - size // 2, cx + size, cy + size // 2), fill=color)
    draw.polygon([(cx - size, cy), (cx + size, cy), (cx, cy + size + 5)], fill=color)


def _bow(draw: ImageDraw.ImageDraw, cx: int, cy: int, color: str, size: int = 13):
    draw.polygon([(cx, cy), (cx - size * 2, cy - size), (cx - size * 2, cy + size)], fill=color)
    draw.polygon([(cx, cy), (cx + size * 2, cy - size), (cx + size * 2, cy + size)], fill=color)
    draw.ellipse((cx - size // 3, cy - size // 3, cx + size // 3, cy + size // 3), fill="#ffffff")


def _paw(draw: ImageDraw.ImageDraw, cx: int, cy: int, color: str):
    draw.ellipse((cx - 8, cy - 1, cx + 8, cy + 10), fill=color)
    for dx, dy in [(-10, -6), (-3, -11), (5, -11), (12, -6)]:
        draw.ellipse((cx + dx - 3, cy + dy - 3, cx + dx + 3, cy + dy + 3), fill=color)


def _decorate_frame(draw: ImageDraw.ImageDraw, template: BoothTemplate, width: int, height: int, layout: str):
    """Draw independent decorations only in the paper margin, not over faces."""
    mode = template.decorative
    if mode == "minimal":
        draw.line((PAD // 2, 11, width - PAD // 2, 11), fill=template.accent2, width=2)
        return
    if mode == "film":
        for y in range(17, height - FOOTER, 44):
            for x in (8, width - 20):
                draw.rounded_rectangle((x, y, x + 12, y + 25), radius=3, fill="#f3eadd")
    elif mode == "hearts":
        for y in range(40, height - FOOTER, 110):
            _heart(draw, 14, y, 7, template.accent)
            _heart(draw, width - 14, y + 35, 7, template.accent2)
    elif mode == "paws":
        for y in range(45, height - FOOTER, 115):
            _paw(draw, 13, y, template.accent)
            _paw(draw, width - 13, y + 30, template.accent2)
    elif mode == "bows":
        for y in range(45, height - FOOTER, 135):
            _bow(draw, 13, y, template.accent, 6)
            _bow(draw, width - 13, y + 48, template.accent, 6)
    elif mode == "neon":
        draw.line((7, 12, width - 7, 12), fill=template.accent, width=4)
        for y in range(45, height - FOOTER, 120):
            draw.line((8, y, 18, y - 15), fill=template.accent2, width=4)
            draw.line((width - 8, y, width - 18, y + 15), fill=template.accent, width=4)
    elif mode == "holo":
        for y in range(15, height - FOOTER, 90):
            draw.line((3, y + 18, 22, y - 8), fill=template.accent, width=5)
            draw.line((width - 3, y + 18, width - 22, y - 8), fill=template.accent2, width=5)
    elif mode == "stars":
        for y in range(35, height - FOOTER, 105):
            _star(draw, 14, y, 10, template.accent2)
            _star(draw, width - 14, y + 40, 9, template.accent)
    elif mode == "confetti":
        for y in range(35, height - FOOTER, 85):
            draw.ellipse((8, y, 18, y + 10), fill=template.accent2)
            draw.rectangle((width - 19, y + 20, width - 8, y + 31), fill=template.accent)
    elif mode == "paper":
        for y in range(32, height - FOOTER, 32):
            draw.ellipse((7, y, 17, y + 10), fill="#fffaf0")
            draw.ellipse((width - 17, y, width - 7, y + 10), fill="#fffaf0")
    elif mode == "tape":
        for y in range(70, height - FOOTER, 150):
            draw.polygon([(4, y), (19, y - 8), (22, y + 14), (6, y + 20)], fill=template.accent)
            draw.polygon([(width - 4, y + 10), (width - 20, y), (width - 25, y + 17), (width - 8, y + 25)], fill=template.accent2)


def _place_photo(canvas: Image.Image, draw: ImageDraw.ImageDraw, photo: Image.Image,
                 x: int, y: int, template: BoothTemplate, style: str):
    from app import apply_style  # imported on use to keep public API backwards-compatible
    image = ImageOps.fit(photo.convert("RGB"), (CELL_W, CELL_H), method=Image.Resampling.LANCZOS)
    image = apply_style(image, style)
    if template.decorative == "paper":
        image = ImageEnhance.Color(image).enhance(0.8)
        image = Image.blend(image, ImageOps.colorize(ImageOps.grayscale(image), "#4d3925", "#e9d4b2"), 0.22)
    radius = 11 if template.decorative in {"hearts", "bows", "paws", "holo"} else 3
    mask = Image.new("L", (CELL_W, CELL_H), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, CELL_W - 1, CELL_H - 1), radius=radius, fill=255)
    canvas.paste(image, (x, y), mask)
    draw.rounded_rectangle((x, y, x + CELL_W - 1, y + CELL_H - 1), radius=radius, outline=template.accent2, width=3)
    if template.decorative == "tape":
        # Original semi-transparent paper-tape geometry on corners, away from face center.
        draw.polygon([(x - 6, y + 14), (x + 27, y - 7), (x + 38, y + 9), (x + 5, y + 30)], fill=template.accent)
        draw.polygon([(x + CELL_W - 35, y + CELL_H - 11), (x + CELL_W - 2, y + CELL_H - 34),
                      (x + CELL_W + 5, y + CELL_H - 18), (x + CELL_W - 28, y + CELL_H + 4)], fill=template.accent2)


def render_photobooth(images: list[Image.Image], layout: str, style: str,
                       caption: str, template_id: str) -> Image.Image:
    if layout not in {"strip", "grid"}:
        raise HTTPException(status_code=422, detail="Layout must be strip or grid")
    if len(images) != 4:
        raise HTTPException(status_code=422, detail="Exactly 4 photos are required")
    if len(caption) > 60:
        raise HTTPException(status_code=422, detail="Caption may contain at most 60 characters")
    template = get_template(template_id)
    columns, rows = (1, 4) if layout == "strip" else (2, 2)
    width = columns * CELL_W + (columns - 1) * GAP + 2 * PAD
    height = rows * CELL_H + (rows - 1) * GAP + 2 * PAD + FOOTER
    canvas = Image.new("RGB", (width, height), template.paper)
    draw = ImageDraw.Draw(canvas)
    _decorate_frame(draw, template, width, height, layout)
    for idx, photo in enumerate(images):
        x = PAD + (idx % columns) * (CELL_W + GAP)
        y = PAD + (idx // columns) * (CELL_H + GAP)
        _place_photo(canvas, draw, photo, x, y, template, style)
    footer_y = height - FOOTER + 8
    draw.text((PAD, footer_y), caption.strip() or template.name.upper(), font=font(23, True), fill=template.ink)
    draw.text((PAD, height - 27), "PRIVATE PHOTO STUDIO", font=font(12), fill=template.ink)
    if template.decorative in {"hearts", "bows", "stars", "holo", "paws"}:
        _star(draw, width - 33, height - 34, 13, template.accent)
    return canvas


@lru_cache(maxsize=24)
def preview_image(template_id: str, layout: str) -> Image.Image:
    template = get_template(template_id)
    colors = ["#b9d9f4", "#edc7db", "#d1e4d0", "#f3d8b2"]
    photos = []
    for i, shade in enumerate(colors):
        img = Image.new("RGB", (480, 360), shade)
        dr = ImageDraw.Draw(img)
        dr.ellipse((120, 35, 360, 275), fill=ImageColor.getrgb(template.accent2))
        dr.rounded_rectangle((85, 240, 395, 350), radius=28, fill=ImageColor.getrgb(template.accent))
        dr.text((165, 142), f"PHOTO {i + 1}", font=font(26, True), fill=template.ink)
        photos.append(img)
    result = render_photobooth(photos, layout, "classic", template.name, template_id)
    result.thumbnail((350, 700), Image.Resampling.LANCZOS)
    return result
