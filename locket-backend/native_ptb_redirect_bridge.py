"""Experimental *self-hosted* image URL bridge for the user's own Locket capture.

No third-party Worker; no credential forwarding. Disabled by default unless
PHOTOBOOTH_NATIVE_BRIDGE_ENABLED=1. No claim of official Locket compatibility.
"""
from __future__ import annotations

import io
import json
import os
import threading
import time
from collections import deque
from urllib.parse import urlsplit

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from PIL import Image, ImageOps, UnidentifiedImageError
from starlette.concurrency import run_in_threadpool

from native_ptb_compatibility import KNOWN_PTBS
from native_ptb_sandbox import observed_response_envelope
from owned_photo_delivery import _put
from templates import get_template, render_photobooth

router = APIRouter()
MAX_SOURCE_BYTES = 8 * 1024 * 1024
MAX_BODY_BYTES = 32 * 1024
REQUESTS_PER_MINUTE = 12
_hits: deque[float] = deque()
_hits_lock = threading.Lock()

# Only hosts associated with user-uploaded photo delivery; never arbitrary URL
# or localhost/IP. These are hypotheses: observed Locket media may use other hosts.
ALLOWED_IMAGE_HOSTS = frozenset({
    "firebasestorage.googleapis.com",
    "storage.googleapis.com",
    "storage.cloud.google.com",
    "storage-download.googleapis.com",
})


def _enabled() -> bool:
    return os.getenv("PHOTOBOOTH_NATIVE_BRIDGE_ENABLED", "") == "1"


def _image_source_url(raw: str) -> str:
    if not isinstance(raw, str) or len(raw) > 8192:
        raise HTTPException(422, "image_url must be a short HTTPS URL")
    try:
        p = urlsplit(raw)
        _ = p.port
    except ValueError as exc:
        raise HTTPException(422, "Invalid image URL") from exc
    if (p.scheme.lower() != "https" or not p.hostname or
            p.hostname.lower() not in ALLOWED_IMAGE_HOSTS or
            p.username is not None or p.password is not None or
            p.port not in (None, 443) or p.fragment):
        raise HTTPException(422, "Image host is not supported by experimental bridge")
    return raw


def _quota() -> None:
    now = time.monotonic()
    with _hits_lock:
        while _hits and _hits[0] <= now - 60:
            _hits.popleft()
        if len(_hits) >= REQUESTS_PER_MINUTE:
            raise HTTPException(429, "Native PTB test rate limit reached")
        _hits.append(now)


async def _fetch_photo(url: str) -> Image.Image:
    # Do not send Locket Authorization/AppCheck/Cookie headers to Google storage.
    # Signed URLs will work; token-gated URLs will fail clearly instead of leaking.
    async with httpx.AsyncClient(timeout=httpx.Timeout(20.0), follow_redirects=False,
                                  trust_env=False) as client:
        async with client.stream("GET", url, headers={"Accept": "image/jpeg,image/png,image/webp"}) as response:
            if response.status_code != 200:
                raise HTTPException(422, f"Source image returned HTTP {response.status_code}")
            declared_type = response.headers.get("content-type", "").split(";")[0].strip().lower()
            if declared_type not in {"image/jpeg", "image/png", "image/webp"}:
                raise HTTPException(415, "Source URL did not return an image")
            if int(response.headers.get("content-length", "0") or "0") > MAX_SOURCE_BYTES:
                raise HTTPException(413, "Source image exceeds 8 MB")
            chunks, total = [], 0
            async for chunk in response.aiter_bytes():
                total += len(chunk)
                if total > MAX_SOURCE_BYTES:
                    raise HTTPException(413, "Source image exceeds 8 MB")
                chunks.append(chunk)
    raw = b"".join(chunks)
    try:
        with Image.open(io.BytesIO(raw)) as image:
            if image.format not in {"JPEG", "PNG", "WEBP"}:
                raise HTTPException(415, "Unsupported image format")
            if max(image.size) > 5000 or image.width * image.height > 20_000_000:
                raise HTTPException(413, "Image dimensions too large")
            normalized = ImageOps.exif_transpose(image)
            normalized.load()
            return normalized.convert("RGB")
    except (OSError, ValueError, UnidentifiedImageError, Image.DecompressionBombError) as exc:
        raise HTTPException(422, "Unable to decode image") from exc


@router.get("/native-ptb/status")
async def native_ptb_status():
    return {
        "bridge_enabled": _enabled(),
        "mode": "experimental-self-hosted",
        "native_locket_verified": False,
        "supported_source_hosts": sorted(ALLOWED_IMAGE_HOSTS),
    }


@router.post("/generateFilteredImage")
async def generate_filtered_image(request: Request):
    if not _enabled():
        raise HTTPException(503, "Experimental native PTB bridge is disabled")
    size = request.headers.get("content-length")
    if size:
        try:
            if int(size) > MAX_BODY_BYTES:
                raise HTTPException(413, "PTB JSON body too large")
        except ValueError as exc:
            raise HTTPException(400, "Invalid Content-Length") from exc
    body_bytes = await request.body()
    if len(body_bytes) > MAX_BODY_BYTES:
        raise HTTPException(413, "PTB JSON body too large")
    try:
        body = json.loads(body_bytes)
    except (UnicodeDecodeError, ValueError) as exc:
        raise HTTPException(400, "Expected a JSON body") from exc
    if not isinstance(body, dict):
        raise HTTPException(422, "Expected a JSON object")

    template_id = body.get("filter_id")
    if template_id not in KNOWN_PTBS:
        raise HTTPException(422, "Only the personal PTB test filters are supported")
    if body.get("filter_type") != "normal":
        raise HTTPException(422, "Unexpected filter_type")
    image_url = _image_source_url(body.get("image_url"))
    get_template(template_id)
    _quota()
    try:
        photo = await _fetch_photo(image_url)
    except (httpx.RequestError, httpx.TimeoutException) as exc:
        raise HTTPException(502, "Could not fetch source image") from exc

    rendered = await run_in_threadpool(
        render_photobooth, [photo] * 4, "grid", "classic", "PHOTOBOOTH", template_id
    )
    result_buffer = io.BytesIO()
    rendered.convert("RGB").save(result_buffer, "JPEG", quality=88, optimize=True)
    token = _put(result_buffer.getvalue())

    public_origin = os.getenv("PHOTOBOOTH_PUBLIC_BASE_URL", "").rstrip("/")
    parsed_origin = urlsplit(public_origin)
    if (parsed_origin.scheme != "https" or not parsed_origin.hostname or
            parsed_origin.path not in ("", "/") or parsed_origin.username or
            parsed_origin.password or parsed_origin.query or parsed_origin.fragment):
        raise HTTPException(503, "Public HTTPS origin is not correctly configured")
    # Canonical image endpoint already deployed and smoke-tested on staging.
    output_url = public_origin + "/api/v1/owned-photo/images/" + token
    response = observed_response_envelope(output_url)
    # Do not advertise a successful *native integration*: this is an attempt
    # using an observed unofficial JSON envelope, not an official contract.
    return JSONResponse(
        response,
        headers={"Cache-Control": "no-store",
                 "Referrer-Policy": "no-referrer",
                 "X-Content-Type-Options": "nosniff"},
    )
