"""Read-only compatibility assessment for a sanitized native PTB request.

This module never fetches image URLs, handles tokens, calls a server or
manufactures a Locket success response. Use field names and safe filter IDs
only; do not supply a real request with analytics or account credentials.
"""
from __future__ import annotations

from typing import Any

KNOWN_PTBS = frozenset({
    "photobooth_4cut", "photobooth_cute", "pb_cortis_4cut",
    "pb_shinchan_4cut", "pb_supperman_4cut", "pb_meo_dang_yeu_4cut",
    "pb_holo_4cut", "pb_photobooth_hello_kitty", "pb_vintage",
    "pb_ripped_paper_4cut",
})


def assess_compatibility(body: Any) -> dict[str, Any]:
    """Explain what blocks translation to the authenticated owned-client API."""
    if not isinstance(body, dict):
        return {"compatible": False, "reason": "not-json-object"}
    # These are the only three value-bearing fields we inspect. In particular,
    # never read analytics, auth, or image_url's value.
    filter_id = body.get("filter_id")
    filter_type = body.get("filter_type")
    has_remote_image_reference = isinstance(body.get("image_url"), str)
    if not isinstance(filter_id, str) or filter_id not in KNOWN_PTBS:
        return {"compatible": False, "reason": "unsupported-filter-id"}
    if filter_type != "normal":
        return {"compatible": False, "reason": "unverified-filter-type"}
    if not has_remote_image_reference:
        return {"compatible": False, "reason": "no-image-reference"}
    return {
        "compatible": False,
        "reason": "native-contract-not-implemented",
        "filter_id": filter_id,
        "observed_input": "remote-image-reference",
        "owned_bridge_input": "authenticated-image-bytes",
        "missing": [
            "authorized-image-acquisition",
            "verified-native-success-response",
            "verified-native-image-delivery",
        ],
    }
