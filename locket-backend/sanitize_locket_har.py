#!/usr/bin/env python3
"""Export ONLY allowlisted, value-free Locket Photobooth HTTP metadata from a HAR file.

WARNING: Raw HAR files can contain credentials, private photos, and tokens.
Run locally and only share the sanitized JSON output.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from urllib.parse import urlsplit

ALLOWED_HOSTS = {
    "api.locketcamera.com",
    "us-central1-locket-4252a.cloudfunctions.net",
}
KNOWN_ACTIONS = {
    "generateFilteredImage", "generateFilter", "applyFilter",
    "createOverlay", "getFilters", "generatePhotobooth", "photobooth",
}
SAFE_FIELDS = {
    "filter_id", "filterId", "filter", "effect_id", "effectId",
    "image", "images", "photo", "photos", "image_url", "imageUrl",
    "result", "status", "success", "error", "message", "data",
    "output", "outputUrl", "url", "format", "type", "width", "height",
    "mimeType", "mime_type",
}


def mime(headers: list[dict]) -> str:
    for item in headers or []:
        if str(item.get("name", "")).lower() == "content-type":
            value = str(item.get("value", "")).lower().split(";", 1)[0].strip()
            return value if value in {
                "application/json", "application/octet-stream",
                "image/jpeg", "image/png", "image/webp",
                "multipart/form-data", "text/plain",
                "application/x-www-form-urlencoded",
            } else "other"
    return "unknown"


def category(value) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, str):
        return "string"
    if isinstance(value, (float, int)):
        return "number"
    if isinstance(value, list):
        return "array"
    return "object"


def safe_shape(value, depth: int = 2):
    """Whitelist field names; never copy user-supplied values into a report."""
    if depth == 0 or not isinstance(value, (dict, list)):
        return category(value)
    if isinstance(value, list):
        return ["array", safe_shape(value[0], depth - 1)] if value else ["array"]
    return {
        key: safe_shape(val, depth - 1)
        for key, val in value.items()
        if key in SAFE_FIELDS
    }


def safe_json_shape(text, encoding, mtype):
    if mtype != "application/json" or encoding or not isinstance(text, str):
        return "not-inspected"
    if len(text) > 50000:
        return "too-large"
    try:
        return safe_shape(json.loads(text))
    except (json.JSONDecodeError, ValueError, TypeError):
        return "invalid-json"


def summarize(har: dict) -> list[dict]:
    out = []
    for entry in har.get("log", {}).get("entries", []):
        req, resp = entry.get("request", {}), entry.get("response", {})
        parsed = urlsplit(str(req.get("url", "")))
        host = (parsed.hostname or "").lower()
        segments = [s for s in parsed.path.split("/") if s]
        action = segments[-1] if segments else ""
        # Restrict to known hosts AND exact known action names.
        if host not in ALLOWED_HOSTS or action not in KNOWN_ACTIONS:
            continue
        req_mime = mime(req.get("headers", []))
        resp_mime = mime(resp.get("headers", []))
        post = req.get("postData") or {}
        response_content = resp.get("content") or {}
        raw_status = resp.get("status")
        status = raw_status if type(raw_status) is int and 100 <= raw_status <= 599 else None
        method = req.get("method")
        out.append({
            "host": host,
            "action": action,
            "method": method if method in {"GET", "POST", "PUT", "PATCH"} else "OTHER",
            "status": status,
            "request_mime": req_mime,
            "response_mime": resp_mime,
            "request_schema": safe_json_shape(post.get("text"), post.get("encoding"), req_mime),
            "response_schema": safe_json_shape(
                response_content.get("text"), response_content.get("encoding"), resp_mime),
        })
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("har", type=Path)
    ap.add_argument("--output", type=Path, default=Path("ptb-safe-report.json"))
    args = ap.parse_args()
    data = json.loads(args.har.read_text(encoding="utf-8"))
    report = {"format": "ptb-contract-sanitized-v1", "exchanges": summarize(data)}
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Sanitized {len(report['exchanges'])} matching exchanges: {args.output}")
    print("Review the report before sharing; never upload the raw HAR.")


if __name__ == "__main__":
    main()
