"""Sandbox-only observed PTB response envelope for an explicitly uploaded photo.

This does NOT register a filter inside Locket, intercept third-party calls,
fetch Locket media URLs, forward account headers or bypass rate limits.
The response structure follows metadata observed in the user's own diagnostics
and is not asserted to be an official/complete Locket contract.
"""
from __future__ import annotations

import io
import json
from typing import Annotated

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import Response
from starlette.concurrency import run_in_threadpool

from owned_photo_delivery import _put
from templates import get_template, render_photobooth

router = APIRouter()


def observed_response_envelope(image_url: str) -> dict:
    """Offline observed metadata shape, no server status spoofing."""
    if not image_url.startswith("https://"):
        raise ValueError("A trusted HTTPS image URL is required")
    aliases = {
        "url": image_url,
        "image_url": image_url,
        "imageUrl": image_url,
        "output_url": image_url,
    }
    return {
        **aliases,
        "status": 200,
        "result": {**aliases, "status": 200, "data": dict(aliases)},
        "native_locket_integration": False,
        "contract_status": "experimental-observed-response-only",
    }


@router.post("/api/v1/native-ptb-test/render")
async def native_ptb_test_render(
    file: Annotated[UploadFile, File()],
    template_id: Annotated[str, Form()] = "photobooth_4cut",
    x_api_key: Annotated[str | None, Header()] = None,
):
    from app import authorize, load_photo
    authorize(x_api_key)
    get_template(template_id)
    photo = await load_photo(file)
    rendered = await run_in_threadpool(
        render_photobooth, [photo] * 4, "grid", "classic", "PHOTOBOOTH", template_id
    )
    buffer = io.BytesIO()
    rendered.convert("RGB").save(buffer, format="JPEG", quality=88, optimize=True)
    token = _put(buffer.getvalue())
    from os import getenv
    origin = getenv("PHOTOBOOTH_PUBLIC_BASE_URL", "").rstrip("/")
    # Deliberately refuse service unless owned public origin is configured.
    if not origin.startswith("https://") or "/" in origin[len("https://"):]:
        raise HTTPException(503, "Public HTTPS origin not configured")
    image_url = origin + "/api/v1/owned-photo/images/" + token
    return Response(
        content=json.dumps(observed_response_envelope(image_url)),
        media_type="application/json",
        headers={"Cache-Control": "no-store", "Referrer-Policy": "no-referrer",
                 "X-Content-Type-Options": "nosniff"},
    )
