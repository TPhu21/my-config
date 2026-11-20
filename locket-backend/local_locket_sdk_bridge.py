"""Local-only explicit Locket SDK publication of user-owned PTB images.

Never runs on Render, never receives a Locket session remotely.
Default is dry-run. Publishing requires --publish and an existing *local*
locketlam session created by the user. No password/token is logged.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
from urllib.parse import urlsplit


MAX_IMAGE = 8 * 1024 * 1024
DEFAULT_BASE = "https://phu-private-photo-studio-staging.onrender.com"


def validate_base_url(url: str) -> str:
    parts = urlsplit(url)
    if (parts.scheme != "https" or not parts.hostname or parts.username or
            parts.password or parts.path not in ("", "/") or parts.query or parts.fragment):
        raise ValueError("Expected a bare trusted HTTPS origin")
    return url.rstrip("/")


def process_owned_image(image: bytes, api_key: str, base_url: str, template: str) -> bytes:
    """Only uploads locally supplied bytes to our explicitly named Render service."""
    if not image or len(image) > MAX_IMAGE:
        raise ValueError("Input image must be between 1 byte and 8 MB")
    if not api_key:
        raise ValueError("PHOTOBOOTH_API_KEY is required")
    base_url = validate_base_url(base_url)
    # Keep the HTTP dependency local; no SDK or session file on Render.
    import requests
    response = requests.post(
        base_url + "/api/v1/owned-photo/render",
        headers={"X-API-Key": api_key},
        files={"file": ("owned-photo.jpg", image, "image/jpeg")},
        data={"template_id": template},
        timeout=90,
        allow_redirects=False,
    )
    response.raise_for_status()
    metadata = response.json()
    if metadata.get("format") != "private-photo-studio-delivery-v1" or metadata.get("mime_type") != "image/jpeg":
        raise ValueError("Unexpected response contract")
    result_url = metadata.get("image_url", "")
    parts = urlsplit(result_url)
    if (parts.scheme != "https" or parts.netloc != urlsplit(base_url).netloc or
            not parts.path.startswith("/api/v1/owned-photo/images/") or parts.query or parts.fragment):
        raise ValueError("Refusing to fetch unexpected image URL")
    image_response = requests.get(result_url, timeout=30, allow_redirects=False)
    image_response.raise_for_status()
    if image_response.headers.get("Content-Type", "").split(";")[0].strip().lower() != "image/jpeg":
        raise ValueError("Download did not return JPEG")
    data = image_response.content
    if not data.startswith(bytes([255, 216, 255])) or len(data) > MAX_IMAGE:
        raise ValueError("Generated JPEG is invalid or too large")
    return data


def publish_owned_image(image_path: Path, session_path: Path, confirm: bool) -> object:
    """Only call third-party SDK when --publish is explicitly supplied."""
    if not confirm:
        raise ValueError("Publishing requires explicit --publish")
    if not session_path.is_file():
        raise ValueError("A local locketlam session is required. Never upload session files.")
    from locketlam import LocketClient
    client = LocketClient(session_path=str(session_path))
    if not client.is_authenticated():
        raise ValueError("Local SDK session is not authenticated")
    # Send to self only by default. Avoid third-party contacts and bulk posting.
    return client.moments.post(image=str(image_path), is_private=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Owned PTB -> optional Locket self-only post")
    parser.add_argument("source", type=Path, help="Your own local JPEG image")
    parser.add_argument("--template", default="photobooth_4cut")
    parser.add_argument("--base-url", default=DEFAULT_BASE)
    parser.add_argument("--out", type=Path, default=Path("my-photobooth-preview.jpg"))
    parser.add_argument("--session-path", type=Path, help="Existing local locketlam session (never sent to Render)")
    parser.add_argument("--publish", action="store_true", help="Explicitly publish to your own Locket timeline")
    args = parser.parse_args()

    if args.source.suffix.lower() not in (".jpg", ".jpeg"):
        parser.error("Use a local JPEG photo; do not pass Firebase URLs or account tokens")
    key = os.getenv("PHOTOBOOTH_API_KEY", "")
    image = process_owned_image(args.source.read_bytes(), key, args.base_url, args.template)
    if args.out.exists():
        raise SystemExit("Output already exists; choose a different --out path")
    args.out.write_bytes(image)
    print(f"Created JPEG preview: {args.out} ({len(image)} bytes)")
    if not args.publish:
        print("DRY RUN: did not access Locket or publish any moment")
        return
    if args.session_path is None:
        parser.error("--publish requires --session-path to a local SDK session")
    result = publish_owned_image(args.out, args.session_path, True)
    # Never print response body: it can contain user identifiers and URLs.
    print("SDK post request completed; check your own Locket app for the resulting moment")


if __name__ == "__main__":
    main()
