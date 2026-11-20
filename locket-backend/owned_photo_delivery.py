"""Owned-client PTB JSON -> temporary JPEG URL bridge.

Separate from Locket endpoints and not a third-party proxy. Upload requires
existing API key. Download uses an unguessable, short-lived capability token;
never embed the API key in a URL or permanent mobile config.

Storage is per Python worker and ephemeral; Render restarts or multiple workers
can invalidate URLs. For multi-instance production, use private object storage.
"""
from __future__ import annotations

import io
import secrets
import threading
import time
from collections import OrderedDict
from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.responses import Response
from starlette.concurrency import run_in_threadpool

from templates import get_template, render_photobooth

router = APIRouter()

TTL_SECONDS = 600
MAX_ITEMS = 16
MAX_JPEG_BYTES = 4 * 1024 * 1024


@dataclass
class StoredImage:
    expires_at: float
    jpeg: bytes


_store: OrderedDict[str, StoredImage] = OrderedDict()
_lock = threading.Lock()


def _put(jpeg: bytes) -> str:
    if not jpeg or len(jpeg) > MAX_JPEG_BYTES:
        raise HTTPException(413, "Generated image exceeds temporary storage limit")
    now = time.monotonic()
    with _lock:
        for key in tuple(_store):
            if _store[key].expires_at <= now:
                del _store[key]
        while len(_store) >= MAX_ITEMS:
            _store.popitem(last=False)
        token = secrets.token_urlsafe(32)
        _store[token] = StoredImage(expires_at=now + TTL_SECONDS, jpeg=jpeg)
        return token


def _get(token: str) -> bytes | None:
    now = time.monotonic()
    with _lock:
        entry = _store.get(token)
        if not entry:
            return None
        if entry.expires_at <= now:
            del _store[token]
            return None
        return entry.jpeg


@router.post("/api/v1/owned-photo/render")
async def owned_photo_render(
    request: Request,
    file: Annotated[UploadFile, File()],
    template_id: Annotated[str, Form()] = "photobooth_4cut",
    layout: Annotated[str, Form()] = "grid",
    style: Annotated[str, Form()] = "classic",
    caption: Annotated[str, Form()] = "PHOTOBOOTH",
    x_api_key: Annotated[str | None, Header()] = None,
):
    # Late import avoids circular import: reuse existing security and image checks.
    from app import authorize, load_photo, LAYOUTS, STYLES
    authorize(x_api_key)
    if layout not in LAYOUTS or style not in STYLES or len(caption) > 60:
        raise HTTPException(422, "Invalid layout, style or caption")
    get_template(template_id)
    photo = await load_photo(file)
    rendered = await run_in_threadpool(
        render_photobooth, [photo] * 4, layout, style, caption, template_id
    )
    buffer = io.BytesIO()
    rendered.convert("RGB").save(buffer, format="JPEG", quality=88, optimize=True)
    token = _put(buffer.getvalue())
    # The only public access token is in this temporary URL. HTTPS is required
    # at deployment; local TestClient uses http://testserver for isolated tests.
    base = str(request.base_url).rstrip("/")
    image_url = base + "/api/v1/owned-photo/images/" + token
    return Response(
        content=__import__("json").dumps({
            "format": "private-photo-studio-delivery-v1",
            "status": 200,
            "image_url": image_url,
            "mime_type": "image/jpeg",
            "expires_in_seconds": TTL_SECONDS,
            "native_locket_integration": False,
        }),
        media_type="application/json",
        headers={"Cache-Control": "no-store", "Referrer-Policy": "no-referrer"},
    )


@router.get("/api/v1/owned-photo/images/{token}")
async def owned_photo_download(token: str):
    if len(token) > 128:
        raise HTTPException(404, "Image unavailable")
    content = _get(token)
    if content is None:
        raise HTTPException(404, "Image expired or unavailable")
    return Response(
        content=content,
        media_type="image/jpeg",
        headers={
            "Cache-Control": "private, no-store, max-age=0",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "no-referrer",
            "Content-Disposition": 'inline; filename="photobooth.jpg"',
        },
    )
