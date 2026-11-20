"""Observed PTB response shape; synthetic own photo; never calls Locket."""
from io import BytesIO
from urllib.parse import urlsplit

from fastapi.testclient import TestClient
from PIL import Image

import app
import native_ptb_sandbox as sandbox
import owned_photo_delivery


def test_observed_aliases_and_real_jpeg(monkeypatch):
    monkeypatch.setattr(app, "API_KEY", "synthetic-test-secret")
    monkeypatch.setattr(app, "REQUIRE_AUTH", True)
    monkeypatch.setenv("PHOTOBOOTH_PUBLIC_BASE_URL",
                       "https://phu-private-photo-studio-staging.onrender.com")
    owned_photo_delivery._store.clear()
    buff = BytesIO()
    Image.new("RGB", (60, 50), (30, 100, 190)).save(buff, "PNG")
    files = {"file": ("offline.png", buff.getvalue(), "image/png")}
    client = TestClient(app.app)
    assert client.post("/api/v1/native-ptb-test/render", files=files).status_code == 401
    res = client.post("/api/v1/native-ptb-test/render",
                      files=files, headers={"X-API-Key": "synthetic-test-secret"})
    assert res.status_code == 200, res.text
    payload = res.json()
    assert payload["native_locket_integration"] is False
    urls = []
    for scope in (payload, payload["result"], payload["result"]["data"]):
        urls.extend(scope[k] for k in ("url", "image_url", "imageUrl", "output_url"))
    assert len(urls) == 12 and len(set(urls)) == 1
    assert payload["result"]["status"] == 200
    assert payload["status"] == 200
    result_path = urlsplit(urls[0]).path
    image = client.get(result_path)
    assert image.status_code == 200 and image.content.startswith(bytes((255,216,255)))


def test_sandbox_refuses_missing_origin(monkeypatch):
    monkeypatch.setattr(app, "API_KEY", "synthetic-test-secret")
    monkeypatch.setattr(app, "REQUIRE_AUTH", True)
    monkeypatch.delenv("PHOTOBOOTH_PUBLIC_BASE_URL", raising=False)
    b = BytesIO()
    Image.new("RGB", (10, 10), "red").save(b, "JPEG")
    res = TestClient(app.app).post("/api/v1/native-ptb-test/render",
        files={"file":("offline.jpg",b.getvalue(),"image/jpeg")},
        headers={"X-API-Key":"synthetic-test-secret"})
    assert res.status_code == 503


def test_envelope_requires_https():
    import pytest
    with pytest.raises(ValueError):
        sandbox.observed_response_envelope("http://unsafe.local/image.jpg")
