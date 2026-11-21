"""Offline-only classification of sanitized Locket image-generation responses.

Does not intercept traffic, call Locket, fetch URLs, or modify image processing.
Only use sanitized response bodies; never paste Authorization/App Check/image URLs.
"""
from __future__ import annotations

from typing import Any


def classify_response(http_status: int, body: Any) -> dict[str, str]:
    """Classify observed outcomes without assuming a native success schema."""
    if not isinstance(body, dict) or not isinstance(body.get("result"), dict):
        return {"outcome": "unknown", "reason": "unrecognized-envelope"}
    result = body["result"]
    errors = result.get("errors")
    if not isinstance(errors, list) or not all(isinstance(x, str) for x in errors):
        return {"outcome": "unknown", "reason": "no-verified-error"}
    business_status = result.get("status")
    if not isinstance(business_status, int):
        return {"outcome": "unknown", "reason": "no-business-status"}

    if business_status == 400 and "Unable to load filter data" in errors:
        return {"outcome": "failure", "reason": "filter-data-unavailable"}
    if business_status == 431 and "Generation limit reached" in errors:
        return {"outcome": "failure", "reason": "generation-limit"}
    if errors:
        return {"outcome": "failure", "reason": "other-server-error"}
    # A 200 HTTP transport status never proves that an image was generated.
    return {"outcome": "unknown", "reason": "native-success-contract-unverified"}
