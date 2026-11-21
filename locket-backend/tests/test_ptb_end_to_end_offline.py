"""End-to-end owned Photo Studio test with synthetic images and known native failures.

This deliberately does not emulate Locket's unverified successful response,
fetch Firebase URLs, forward authentication headers, or patch subscriptions.
"""
import base64
from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

import app as studio
from native_ptb_compatibility import assess_compatibility
from native_ptb_contract import classify_response


def synthetic_photo() -> bytes:
    image = Image.new("RGB", (128, 96), "#5577aa")
    b = BytesIO()
    image.save(b, format="PNG")
    return b.getvalue()


def test_real_png_generation_from_synthetic_photo(monkeypatch):
    # Test a genuine processing round trip under a simulated private API key.
    monkeypatch.setattr(studio, "API_KEY", "offline-test-key")
    monkeypatch.setattr(studio, "REQUIRE_AUTH", True)
    client = TestClient(studio.app)
    original = synthetic_photo()
    body = {
        "filter_id": "photobooth_4cut",
        "image_base64": base64.b64encode(original).decode("ascii"),
        "layout": "grid",
        "style": "classic",
        "caption": "OFFLINE TEST ONLY",
    }
    assert client.post("/api/v1/bridge/render-json", json=body).status_code == 401
    response = client.post("/api/v1/bridge/render-json", json=body, headers={
        "X-API-Key": "offline-test-key",
    })
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["format"] == "private-photo-studio-json-v1"
    assert result["filter_id"] == body["filter_id"]
    assert result["mime_type"] == "image/png"
    produced = base64.b64decode(result["image_base64"], validate=True)
    with Image.open(BytesIO(produced)) as image:
        image.verify()
    with Image.open(BytesIO(produced)) as image:
        assert image.size == (834, 714)
        assert not image.getexif()
    assert produced != original


def test_sanitized_native_failure_stays_failure():
    request = {
        "filter_id": "photobooth_4cut",
        "filter_type": "normal",
        "prompt": "photobooth_4cut",
        "image_url": "https://example.invalid/private.jpeg?token=FAKE",
    }
    assessment = assess_compatibility(request)
    assert assessment["compatible"] is False
    assert assessment["reason"] == "native-contract-not-implemented"
    assert "FAKE" not in repr(assessment)
    observed = {"result": {
        "errors": ["Unable to load filter data"], "status": 400
    }}
    assert classify_response(200, observed)["outcome"] == "failure"
    # The owned-client result above MUST NOT be mistaken for a Locket success.
