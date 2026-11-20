#!/usr/bin/env python3
"""Smoke-test a user-owned Private Photo Studio deployment without real photos.

Usage:
  python smoke_deploy.py https://YOUR-ACTUAL-RENDER-URL.onrender.com
  PHOTOBOOTH_API_KEY=... python smoke_deploy.py https://YOUR-ACTUAL-RENDER-URL.onrender.com

Only HTTPS remote hosts (or local loopback HTTP) are accepted.
"""
from __future__ import annotations

import argparse
import io
import json
import os
import sys
import uuid
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from PIL import Image

PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


def fetch(base: str, path: str, *, body: bytes | None = None,
          content_type: str | None = None, key: str = "") -> tuple[int, str, bytes]:
    headers = {"Accept": "application/json, image/png"}
    if content_type:
        headers["Content-Type"] = content_type
    if key:
        headers["X-API-Key"] = key
    req = Request(base + path, data=body, headers=headers, method="POST" if body is not None else "GET")
    try:
        with urlopen(req, timeout=80) as response:
            return response.status, response.headers.get("Content-Type", ""), response.read()
    except HTTPError as exc:
        msg = exc.read(1024).decode("utf-8", "replace")
        raise RuntimeError(f"{path}: HTTP {exc.code}: {msg}") from exc
    except URLError as exc:
        raise RuntimeError(f"{path}: network error: {exc.reason}") from exc


def multipart_test_payload(*, bridge: bool = False) -> tuple[bytes, str]:
    boundary = "pb-smoke-" + uuid.uuid4().hex
    body = io.BytesIO()

    def part(name: str, data: bytes, *, filename: str | None = None,
             mime: str = "text/plain") -> None:
        body.write(f"--{boundary}\r\n".encode())
        dispo = f'Content-Disposition: form-data; name="{name}"'
        if filename:
            dispo += f'; filename="{filename}"'
        body.write((dispo + "\r\nContent-Type: " + mime + "\r\n\r\n").encode())
        body.write(data)
        body.write(b"\r\n")

    colors = ("#ba6d86",) if bridge else ("#ba6d86", "#9ac1e5", "#cce4ba", "#edc38d")
    for idx, color in enumerate(colors):
        buffer = io.BytesIO()
        Image.new("RGB", (360, 270), color).save(buffer, "PNG")
        part("file" if bridge else "files", buffer.getvalue(), filename=f"synthetic-{idx}.png", mime="image/png")
    part("filter_id" if bridge else "template_id", b"pb_holo_4cut" if bridge else b"basic")
    part("layout", b"grid")
    part("style", b"classic")
    part("caption", b"SMOKE TEST")
    body.write(f"--{boundary}--\r\n".encode())
    return body.getvalue(), f"multipart/form-data; boundary={boundary}"


def main() -> int:
    parser = argparse.ArgumentParser(description="Check the deployed Private Photo Studio FastAPI service")
    parser.add_argument("url", help="Actual URL from your hosting provider")
    args = parser.parse_args()
    base = args.url.rstrip("/")
    parts = urlsplit(base)
    if parts.scheme != "https" and not (
        parts.scheme == "http" and parts.hostname in {"127.0.0.1", "localhost", "::1"}
    ):
        parser.error("Remote services must use HTTPS; only loopback is allowed over HTTP")
    if parts.path not in {"", "/"} or parts.query or parts.fragment or not parts.hostname:
        parser.error("Provide the service origin only, e.g. https://service.onrender.com")

    checks = (
        ("/health", lambda kind, raw: json.loads(raw).get("status") == "ok"),
        ("/api/v1/catalog", lambda kind, raw: bool(json.loads(raw).get("templates"))),
        ("/api/v1/templates", lambda kind, raw: raw.startswith(b"{") or raw.startswith(b"[")),
        ("/api/v1/bridge/contract", lambda kind, raw: (
            json.loads(raw).get("native_locket_integration") is False
            and json.loads(raw).get("upload", {}).get("path") == "/api/v1/bridge/render"
        )),
        ("/api/v1/templates/basic/preview?layout=grid",
         lambda kind, raw: "image/png" in kind and raw.startswith(PNG_MAGIC)),
    )
    try:
        for path, validate in checks:
            status, kind, raw = fetch(base, path)
            if status != 200 or not validate(kind, raw):
                raise RuntimeError(f"{path}: unexpected response")
            print(f"PASS {path}")

        key = os.getenv("PHOTOBOOTH_API_KEY", "").strip()
        if key:
            body, content_type = multipart_test_payload()
            status, kind, raw = fetch(
                base, "/api/v1/photobooth", body=body, content_type=content_type, key=key
            )
            if status != 200 or "image/png" not in kind or not raw.startswith(PNG_MAGIC):
                raise RuntimeError("/api/v1/photobooth: invalid PNG response")
            with Image.open(io.BytesIO(raw)) as image:
                if image.width < 400 or image.height < 400:
                    raise RuntimeError("/api/v1/photobooth: invalid output dimensions")
            print("PASS /api/v1/photobooth (4 synthetic images; no private uploads)")
            bridge_body, bridge_type = multipart_test_payload(bridge=True)
            code, kind, raw = fetch(
                base, "/api/v1/bridge/render", body=bridge_body,
                content_type=bridge_type, key=key,
            )
            if code != 200 or "image/png" not in kind or not raw.startswith(PNG_MAGIC):
                raise RuntimeError("/api/v1/bridge/render: invalid PNG response")
            with Image.open(io.BytesIO(raw)) as image:
                if image.size != (834, 714):
                    raise RuntimeError(f"/api/v1/bridge/render: invalid output dimensions {image.size}")
                image.verify()
            print("PASS /api/v1/bridge/render (synthetic image, key-protected PNG 834x714)")

        else:
            print("SKIP authenticated POST image tests (PHOTOBOOTH_API_KEY not provided)")
        print("PASS: Photo Studio deployment smoke checks")
        return 0
    except (RuntimeError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
